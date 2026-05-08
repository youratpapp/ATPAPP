# League Round Scheduler (Automatic)

## Current architecture (recommended)

The scheduler is now Supabase-native:

1. Edge Function: `league-round-scheduler`
2. SQL scheduler engine: `app_run_league_round_scheduler(p_limit)`
3. DB cron helper: `app_enable_league_round_scheduler(...)`

This keeps running even if you migrate away from GitHub hosting.

## Files

- Edge Function:
  - `web/supabase/functions/league-round-scheduler/index.ts`
- SQL migrations:
  - `web/supabase/migrations/0009_league_chat_scheduler_and_season_flow.sql`
  - `web/supabase/migrations/0010_league_scheduler_edge_function_cron.sql`
- Optional fallback workflow:
  - `.github/workflows/league-round-scheduler.yml`

## Deploy the Edge Function

From project root:

```bash
supabase functions deploy league-round-scheduler
```

The function expects:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Configure Vault secrets (one-time)

In SQL editor:

```sql
select vault.create_secret('https://<project-ref>.supabase.co', 'project_url');
select vault.create_secret('<service-role-key>', 'service_role_key');
```

If secret already exists, update it:

```sql
select vault.update_secret('https://<project-ref>.supabase.co', 'project_url');
select vault.update_secret('<service-role-key>', 'service_role_key');
```

## Enable hourly cron (inside Supabase)

After migration `0010`, run:

```sql
select public.app_enable_league_round_scheduler('10 * * * *', 50);
```

This creates/updates a job named `league-round-scheduler-hourly`.

## Disable cron

```sql
select public.app_disable_league_round_scheduler();
```

## What runs every hour

The Edge Function calls:

```sql
select public.app_run_league_round_scheduler(50);
```

It will:

1. Find active leagues/seasons/classes with `auto_round_generation_enabled = true`
2. Check whether class is due by `round_interval_days`
3. Generate next round + matches through `app_generate_next_league_round`
4. Save execution log in `public.league_scheduler_runs`

## Validate execution

```sql
select *
from public.league_scheduler_runs
order by executed_at desc
limit 20;
```

## Notes

- Manual fallback in UI (`Gerar proxima rodada`) remains valid.
- Keep GitHub workflow only as contingency; Supabase cron is now primary.
