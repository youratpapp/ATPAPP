-- Notification preferences v1
-- Date: 2026-05-11

create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  whatsapp_reminders boolean not null default true,
  match_reminders boolean not null default true,
  booking_reminders boolean not null default true,
  social_updates boolean not null default false,
  reminder_hours_before integer not null default 24 check (reminder_hours_before between 1 and 168),
  updated_at timestamptz not null default now()
);

drop trigger if exists notification_preferences_set_updated_at on public.notification_preferences;
create trigger notification_preferences_set_updated_at
  before update on public.notification_preferences
  for each row execute function public.tg_set_updated_at();

alter table public.notification_preferences enable row level security;

drop policy if exists notification_preferences_self_read on public.notification_preferences;
create policy notification_preferences_self_read
on public.notification_preferences
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists notification_preferences_self_insert on public.notification_preferences;
create policy notification_preferences_self_insert
on public.notification_preferences
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists notification_preferences_self_update on public.notification_preferences;
create policy notification_preferences_self_update
on public.notification_preferences
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
