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
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse(500, {
      ok: false,
      message: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.",
      ranAt,
    });
  }

  // Defense-in-depth: require incoming Authorization with service role key.
  const authHeader = req.headers.get("authorization") || "";
  const expected = `Bearer ${serviceRoleKey}`;
  if (authHeader !== expected) {
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
    limit = 50;
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
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
