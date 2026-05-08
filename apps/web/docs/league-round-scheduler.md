# League Round Scheduler (Automatic)

## What was implemented

- SQL function `public.app_run_league_round_scheduler(p_limit integer default 50)`
- Internal SQL function `public.app_generate_due_league_rounds(...)`
- Run log table `public.league_scheduler_runs`
- Only `service_role` can execute these scheduler functions

## GitHub Actions automation

This repo now includes:

- `.github/workflows/league-round-scheduler.yml`

It runs every hour and can also run manually by `workflow_dispatch`.

## Required GitHub secrets

Set these repository secrets:

- `SUPABASE_URL`: e.g. `https://<project-ref>.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY`: service role key from Supabase project

## What the scheduler does

The job calls:

```http
POST /rest/v1/rpc/app_run_league_round_scheduler
```

with:

```json
{ "p_limit": 50 }
```

Then the database function:

1. Finds active leagues/seasons/classes with `auto_round_generation_enabled = true`
2. Checks if next round is due by `round_interval_days`
3. Generates next round + matches using `app_generate_next_league_round`
4. Stores execution log in `league_scheduler_runs`

## Manual test

Run the workflow manually and set `limit=5` in the GitHub UI.

Also validate directly in SQL editor:

```sql
select * from public.league_scheduler_runs
order by executed_at desc
limit 20;
```

## Important

- Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend/app code.
- Keep manual fallback in UI (`Gerar proxima rodada`) for contingency.
