import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import type { NotificationPreferences } from "./types";

const TABLE_NOTIFICATION_PREFS = "notification_preferences";

const DEFAULT_PREFS: NotificationPreferences = {
  whatsappReminders: true,
  matchReminders: true,
  bookingReminders: true,
  socialUpdates: false,
  reminderHoursBefore: 24,
};

type NotificationPreferencesRow = {
  whatsapp_reminders: boolean | null;
  match_reminders: boolean | null;
  booking_reminders: boolean | null;
  social_updates: boolean | null;
  reminder_hours_before: number | null;
};

function rowToPrefs(row: NotificationPreferencesRow | null | undefined): NotificationPreferences {
  if (!row) return DEFAULT_PREFS;
  return {
    whatsappReminders: row.whatsapp_reminders !== false,
    matchReminders: row.match_reminders !== false,
    bookingReminders: row.booking_reminders !== false,
    socialUpdates: row.social_updates === true,
    reminderHoursBefore: Number(row.reminder_hours_before || 24),
  };
}

export async function loadNotificationPreferences(user: User): Promise<NotificationPreferences> {
  if (!supabase) return DEFAULT_PREFS;
  const { data, error } = await supabase
    .from(TABLE_NOTIFICATION_PREFS)
    .select("whatsapp_reminders,match_reminders,booking_reminders,social_updates,reminder_hours_before")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return rowToPrefs(data as NotificationPreferencesRow | null);
}

export async function saveNotificationPreferences(
  user: User,
  prefs: NotificationPreferences
): Promise<NotificationPreferences> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase
    .from(TABLE_NOTIFICATION_PREFS)
    .upsert(
      {
        user_id: user.id,
        whatsapp_reminders: prefs.whatsappReminders,
        match_reminders: prefs.matchReminders,
        booking_reminders: prefs.bookingReminders,
        social_updates: prefs.socialUpdates,
        reminder_hours_before: Math.max(1, Math.min(168, Number(prefs.reminderHoursBefore) || 24)),
      },
      { onConflict: "user_id" }
    )
    .select("whatsapp_reminders,match_reminders,booking_reminders,social_updates,reminder_hours_before")
    .single();
  if (error) throw new Error(error.message);
  return rowToPrefs(data as NotificationPreferencesRow);
}
