import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type SchedulerResponse = {
  ok: boolean;
  message: string;
  generatedCount?: number;
  limit?: number;
  ranAt: string;
};

function jsonResponse(status: number, payload: SchedulerResponse): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

function parseLimit(input: unknown): number {
  const raw = Number(input);
  if (!Number.isFinite(raw)) return 50;
  return Math.min(500, Math.max(1, Math.floor(raw)));
}

function getSecretKeysFromEnv(): string[] {
  const keys = new Set<string>();
  const maybeAddKey = (candidate: string) => {
    const value = candidate.trim();
    if (!value) return;
    // Direct key value.
    if (value.startsWith("sb_secret_") || value.startsWith("eyJ")) {
      keys.add(value);
      return;
    }
    // Some environments expose key names in SUPABASE_SECRET_KEYS.
    // In this case, resolve indirection via Deno.env.get(<name>).
    const resolved = (Deno.env.get(value) || "").trim();
    if (resolved) keys.add(resolved);
  };

  const legacyServiceRole = (Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "").trim();
  maybeAddKey(legacyServiceRole);

  const singleSecret = (Deno.env.get("SUPABASE_SECRET_KEY") || "").trim();
  maybeAddKey(singleSecret);

  const secretKeysJsonRaw = (Deno.env.get("SUPABASE_SECRET_KEYS") || "").trim();
  if (secretKeysJsonRaw) {
    try {
      const parsed = JSON.parse(secretKeysJsonRaw) as Record<string, unknown>;
      for (const value of Object.values(parsed)) {
        const key = typeof value === "string" ? value : "";
        maybeAddKey(key);
      }
    } catch {
      // Ignore malformed env and continue with legacy/default keys.
    }
  }

  return Array.from(keys);
}

function parseJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(parts[1].length / 4) * 4, "=");
    const decoded = atob(payload);
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  const ranAt = new Date().toISOString();

  if (req.method !== "POST") {
    return jsonResponse(405, {
      ok: false,
      message: "Method not allowed. Use POST.",
      ranAt,
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const acceptedKeys = getSecretKeysFromEnv();
  const adminKey = acceptedKeys[0] || "";

  if (!supabaseUrl || !adminKey) {
    return jsonResponse(500, {
      ok: false,
      message: "Missing SUPABASE_URL or secret key env (SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SECRET_KEYS).",
      ranAt,
    });
  }

  // Defense-in-depth: only allow callers with project secret/service keys.
  const authHeader = (req.headers.get("authorization") || "").trim();
  const apikeyHeader = (req.headers.get("apikey") || "").trim();
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  const jwtPayload = bearer ? parseJwtPayload(bearer) : null;
  const jwtRole = typeof jwtPayload?.role === "string" ? jwtPayload.role : "";
  const isServiceRoleJwt = jwtRole === "service_role" || jwtRole === "supabase_admin";
  const authorized = acceptedKeys.includes(bearer) || acceptedKeys.includes(apikeyHeader) || isServiceRoleJwt;
  if (!authorized) {
    return jsonResponse(401, {
      ok: false,
      message: "Unauthorized scheduler request.",
      ranAt,
    });
  }

  let limit = 50;
  try {
    const body = await req.json().catch(() => ({}));
    limit = parseLimit((body as Record<string, unknown>)?.p_limit);
  } catch {
    // Keep the default limit when the request body is not readable.
  }

  const admin = createClient(supabaseUrl, adminKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await admin.rpc("app_run_league_round_scheduler", {
    p_limit: limit,
  });

  if (error) {
    return jsonResponse(500, {
      ok: false,
      message: `Scheduler RPC failed: ${error.message}`,
      limit,
      ranAt,
    });
  }

  return jsonResponse(200, {
    ok: true,
    message: "League scheduler executed.",
    generatedCount: Number(data || 0),
    limit,
    ranAt,
  });
});
