import { supabase } from "./supabase";

export type GoogleCalendarSyncEvent = {
  uid: string;
  title: string;
  startsAt: string;
  endsAt: string;
  location?: string;
  description?: string;
};

export type GoogleCalendarSyncResult = {
  ok: boolean;
  syncedCount?: number;
  authUrl?: string;
  message?: string;
};

export async function syncTournamentMatchesToGoogleCalendar(input: {
  tournamentId: string;
  returnTo: string;
  events: GoogleCalendarSyncEvent[];
}): Promise<GoogleCalendarSyncResult> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase.functions.invoke("google-calendar", {
    body: {
      action: "syncTournament",
      tournamentId: input.tournamentId,
      returnTo: input.returnTo,
      events: input.events,
    },
  });
  if (error) throw new Error(error.message);
  return (data ?? { ok: false, message: "Resposta vazia." }) as GoogleCalendarSyncResult;
}
