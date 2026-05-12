import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type CalendarEventInput = {
  uid: string;
  title: string;
  startsAt: string;
  endsAt: string;
  location?: string;
  description?: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function jsonResponse(status: number, payload: Record<string, unknown>): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

function htmlRedirect(location: string): Response {
  return new Response(null, {
    status: 302,
    headers: {
      ...corsHeaders,
      Location: location,
      "Cache-Control": "no-store",
    },
  });
}

function getAdminKey(): string {
  return (
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
    Deno.env.get("SUPABASE_SECRET_KEY") ||
    ""
  ).trim();
}

function requiredEnv(name: string): string {
  const value = (Deno.env.get(name) || "").trim();
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function base64UrlEncode(value: string): string {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  return atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
}

function cleanReturnTo(value: unknown, fallback: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return fallback;
  try {
    const url = new URL(text);
    if (url.protocol === "http:" || url.protocol === "https:") return url.toString();
  } catch {
    // Keep fallback.
  }
  return fallback;
}

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function buildAuthUrl(input: {
  clientId: string;
  redirectUri: string;
  state: string;
}): string {
  const params = new URLSearchParams({
    client_id: input.clientId,
    redirect_uri: input.redirectUri,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    scope: "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email",
    state: input.state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

async function exchangeCodeForToken(input: {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: input.code,
      client_id: input.clientId,
      client_secret: input.clientSecret,
      redirect_uri: input.redirectUri,
      grant_type: "authorization_code",
    }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(String(body.error_description || body.error || "Falha ao conectar Google."));
  return body as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string;
  };
}

async function refreshAccessToken(input: {
  refreshToken: string;
  clientId: string;
  clientSecret: string;
}) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: input.refreshToken,
      client_id: input.clientId,
      client_secret: input.clientSecret,
      grant_type: "refresh_token",
    }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(String(body.error_description || body.error || "Falha ao renovar Google."));
  return body as {
    access_token: string;
    expires_in?: number;
    scope?: string;
  };
}

async function getGoogleEmail(accessToken: string): Promise<string> {
  const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return "";
  const body = await res.json().catch(() => ({}));
  return typeof body.email === "string" ? body.email : "";
}

async function syncEvents(input: {
  admin: ReturnType<typeof createClient>;
  userId: string;
  sourceType: "tournament" | "league";
  sourceId: string;
  accessToken: string;
  timeZone: string;
  events: CalendarEventInput[];
}): Promise<number> {
  let synced = 0;
  const tableName = input.sourceType === "league" ? "league_calendar_events" : "tournament_calendar_events";
  const sourceColumn = input.sourceType === "league" ? "league_id" : "tournament_id";
  for (const event of input.events) {
    const eventHash = await sha256Hex(JSON.stringify(event));
    const existing = await input.admin
      .from(tableName)
      .select("id,provider_event_id,event_hash")
      .eq("user_id", input.userId)
      .eq(sourceColumn, input.sourceId)
      .eq("match_uid", event.uid)
      .eq("provider", "google")
      .maybeSingle();

    if (!existing.error && existing.data?.event_hash === eventHash) {
      synced += 1;
      continue;
    }

    const googlePayload = {
      summary: event.title,
      location: event.location || "",
      description: event.description || "",
      start: { dateTime: event.startsAt, timeZone: input.timeZone },
      end: { dateTime: event.endsAt, timeZone: input.timeZone },
    };

    const providerEventId = existing.data?.provider_event_id;
    const url = providerEventId
      ? `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(providerEventId)}`
      : "https://www.googleapis.com/calendar/v3/calendars/primary/events";
    const res = await fetch(url, {
      method: providerEventId ? "PATCH" : "POST",
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(googlePayload),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(String(body.error?.message || "Falha ao criar evento no Google Agenda."));

    const googleEventId = String(body.id || providerEventId || "");
    if (!googleEventId) throw new Error("Google nao retornou o evento criado.");

    await input.admin
      .from(tableName)
      .upsert({
        user_id: input.userId,
        [sourceColumn]: input.sourceId,
        match_uid: event.uid,
        provider: "google",
        provider_event_id: googleEventId,
        event_hash: eventHash,
        updated_at: new Date().toISOString(),
      }, { onConflict: `user_id,${sourceColumn},match_uid,provider` });
    synced += 1;
  }
  return synced;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseUrl = requiredEnv("SUPABASE_URL");
  const adminKey = getAdminKey();
  const clientId = requiredEnv("GOOGLE_CALENDAR_CLIENT_ID");
  const clientSecret = requiredEnv("GOOGLE_CALENDAR_CLIENT_SECRET");
  const redirectUri = (Deno.env.get("GOOGLE_CALENDAR_REDIRECT_URL") || `${supabaseUrl}/functions/v1/google-calendar`).trim();
  const timeZone = (Deno.env.get("GOOGLE_CALENDAR_TIME_ZONE") || "America/Cuiaba").trim();
  const appUrl = (Deno.env.get("APP_URL") || "").trim();

  if (!adminKey) return jsonResponse(500, { ok: false, message: "Missing Supabase service role key." });

  const admin = createClient(supabaseUrl, adminKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (req.method === "GET") {
    const url = new URL(req.url);
    const code = url.searchParams.get("code") || "";
    const stateRaw = url.searchParams.get("state") || "";
    if (!code || !stateRaw) return jsonResponse(400, { ok: false, message: "Callback invalido." });

    const state = JSON.parse(base64UrlDecode(stateRaw)) as {
      userId: string;
      requestId?: string;
      returnTo?: string;
      sourceType?: "tournament" | "league";
      sourceId?: string;
    };
    const token = await exchangeCodeForToken({ code, clientId, clientSecret, redirectUri });
    const email = await getGoogleEmail(token.access_token);
    const expiresAt = new Date(Date.now() + Math.max(60, Number(token.expires_in || 3600) - 60) * 1000).toISOString();

    await admin.from("user_calendar_connections").upsert({
      user_id: state.userId,
      provider: "google",
      provider_account_email: email || null,
      access_token: token.access_token,
      refresh_token: token.refresh_token || null,
      scope: token.scope || null,
      expires_at: expiresAt,
      status: "active",
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,provider" });

    let returnTo = cleanReturnTo(state.returnTo, appUrl || "/");
    if (state.requestId) {
      const request = await admin
        .from("user_calendar_sync_requests")
        .select("id,user_id,tournament_id,league_id,request_type,return_to,payload,status,expires_at")
        .eq("id", state.requestId)
        .eq("user_id", state.userId)
        .maybeSingle();
      if (!request.error && request.data) {
        returnTo = cleanReturnTo(request.data.return_to, returnTo);
        try {
          const payload = request.data.payload as { events?: CalendarEventInput[] };
          const sourceType = request.data.request_type === "league_matches" ? "league" : "tournament";
          const sourceId = sourceType === "league"
            ? String(request.data.league_id || "")
            : String(request.data.tournament_id || "");
          const syncedCount = await syncEvents({
            admin,
            userId: state.userId,
            sourceType,
            sourceId,
            accessToken: token.access_token,
            timeZone,
            events: Array.isArray(payload.events) ? payload.events : [],
          });
          await admin.from("user_calendar_sync_requests").update({
            status: "completed",
            error_message: null,
            updated_at: new Date().toISOString(),
          }).eq("id", request.data.id);
          const redirect = new URL(returnTo);
          redirect.searchParams.set("calendar_sync", "success");
          redirect.searchParams.set("calendar_synced", String(syncedCount));
          returnTo = redirect.toString();
        } catch (err) {
          await admin.from("user_calendar_sync_requests").update({
            status: "error",
            error_message: err instanceof Error ? err.message : "Falha ao sincronizar.",
            updated_at: new Date().toISOString(),
          }).eq("id", request.data.id);
          const redirect = new URL(returnTo);
          redirect.searchParams.set("calendar_sync", "error");
          returnTo = redirect.toString();
        }
      }
    }
    return htmlRedirect(returnTo);
  }

  if (req.method !== "POST") return jsonResponse(405, { ok: false, message: "Method not allowed." });

  const authHeader = req.headers.get("authorization") || "";
  const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") || "", {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const auth = await userClient.auth.getUser();
  const user = auth.data.user;
  if (auth.error || !user) return jsonResponse(401, { ok: false, message: "Nao autenticado." });

  const body = await req.json().catch(() => ({})) as {
    action?: string;
    tournamentId?: string;
    leagueId?: string;
    returnTo?: string;
    events?: CalendarEventInput[];
  };
  if (body.action !== "syncTournament" && body.action !== "syncLeague") {
    return jsonResponse(400, { ok: false, message: "Acao invalida." });
  }

  const sourceType = body.action === "syncLeague" ? "league" : "tournament";
  const sourceId = String(sourceType === "league" ? body.leagueId || "" : body.tournamentId || "");
  const events = Array.isArray(body.events) ? body.events.filter((event) => event.uid && event.title && event.startsAt && event.endsAt) : [];
  if (!sourceId || events.length === 0) return jsonResponse(400, { ok: false, message: "Sem jogos para sincronizar." });

  const connection = await admin
    .from("user_calendar_connections")
    .select("access_token,refresh_token,expires_at,status")
    .eq("user_id", user.id)
    .eq("provider", "google")
    .maybeSingle();

  let accessToken = connection.data?.access_token ? String(connection.data.access_token) : "";
  const refreshToken = connection.data?.refresh_token ? String(connection.data.refresh_token) : "";
  const expiresAt = connection.data?.expires_at ? new Date(String(connection.data.expires_at)).getTime() : 0;
  const active = connection.data?.status === "active";

  if (!active || !accessToken) {
    const request = await admin.from("user_calendar_sync_requests").insert({
      user_id: user.id,
      provider: "google",
      request_type: sourceType === "league" ? "league_matches" : "tournament_matches",
      tournament_id: sourceType === "tournament" ? sourceId : null,
      league_id: sourceType === "league" ? sourceId : null,
      return_to: cleanReturnTo(body.returnTo, appUrl || "/"),
      payload: { events },
    }).select("id,return_to").single();
    if (request.error) return jsonResponse(500, { ok: false, message: request.error.message });
    const state = base64UrlEncode(JSON.stringify({
      userId: user.id,
      requestId: request.data.id,
      returnTo: request.data.return_to,
      sourceType,
      sourceId,
    }));
    return jsonResponse(200, { ok: false, authUrl: buildAuthUrl({ clientId, redirectUri, state }) });
  }

  if (expiresAt && expiresAt < Date.now() + 60_000) {
    if (!refreshToken) {
      await admin.from("user_calendar_connections").update({ status: "revoked", updated_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("provider", "google");
      const request = await admin.from("user_calendar_sync_requests").insert({
        user_id: user.id,
        provider: "google",
        request_type: sourceType === "league" ? "league_matches" : "tournament_matches",
        tournament_id: sourceType === "tournament" ? sourceId : null,
        league_id: sourceType === "league" ? sourceId : null,
        return_to: cleanReturnTo(body.returnTo, appUrl || "/"),
        payload: { events },
      }).select("id,return_to").single();
      if (request.error) return jsonResponse(500, { ok: false, message: request.error.message });
      const state = base64UrlEncode(JSON.stringify({
        userId: user.id,
        requestId: request.data.id,
        returnTo: request.data.return_to,
        sourceType,
        sourceId,
      }));
      return jsonResponse(200, { ok: false, authUrl: buildAuthUrl({ clientId, redirectUri, state }) });
    }
    const refreshed = await refreshAccessToken({ refreshToken, clientId, clientSecret });
    accessToken = refreshed.access_token;
    await admin.from("user_calendar_connections").update({
      access_token: refreshed.access_token,
      scope: refreshed.scope || null,
      expires_at: new Date(Date.now() + Math.max(60, Number(refreshed.expires_in || 3600) - 60) * 1000).toISOString(),
      status: "active",
      updated_at: new Date().toISOString(),
    }).eq("user_id", user.id).eq("provider", "google");
  }

  const syncedCount = await syncEvents({ admin, userId: user.id, sourceType, sourceId, accessToken, timeZone, events });
  return jsonResponse(200, { ok: true, syncedCount });
});
