# Work SaaS Phase 13 Release Hardening

Date: 2026-05-21

## Hardening Completed

### Fallback And Dead-Code Cleanup

- Removed a dead league owner focus panel guarded by `false && showOwnerLeagueFocus`.
- Replaced the fragile academy settings select list with `select("*")`.
- Added a compatibility fallback for `require_attendance_call` so older remote schemas no longer create console noise.
- Preserved the future setting contract: when the migration exists, `requireAttendanceCall` is still read and written.

### Documentation Sync

Added/updated sprint status documents:

- `WORK_SAAS_PHASE_5_STATUS.md`
- `WORK_SAAS_PHASE_6_STATUS.md`
- `WORK_SAAS_PHASE_7_STATUS.md`
- `WORK_SAAS_PHASE_8_STATUS.md`
- `WORK_SAAS_PHASE_9_STATUS.md`
- `WORK_SAAS_PHASE_10_STATUS.md`
- `WORK_SAAS_PHASE_11_STATUS.md`
- `WORK_SAAS_PHASE_12_QA_REPORT.md`
- `WORK_SAAS_PHASE_13_RELEASE_HARDENING.md`
- `WORK_SAAS_SCREENSHOT_ARCHIVE_POLICY_2026_05_21.md`

### Screenshot Archive Policy

Created `WORK_SAAS_SCREENSHOT_ARCHIVE_POLICY_2026_05_21.md` with:

- baseline folders to keep;
- exploratory folders that can be archived after backup;
- future audit output naming rules;
- default viewports.

### Final Release Gate

| Gate | Result |
| --- | --- |
| Lint | Pass |
| Build | Pass |
| Typecheck | Pass |
| Broad visual smoke | Pass, 24 screenshots, 0 console errors |
| Work route recheck | Pass, 4 screenshots, 0 console errors |
| Source scan for removed terms/mojibake | Pass |
| Route aliases | Preserved |
| DB closure | Documented, migration still recommended remotely |

## Files Changed In This Hardening Pass

- `src/lib/places.ts`
- `src/pages/LeagueDetailsPage.tsx`
- `src/pages/ManagementHubPage.tsx`
- `docs/WORK_SAAS_PHASE_12_QA_REPORT.md`
- `docs/WORK_SAAS_PHASE_13_RELEASE_HARDENING.md`
- `docs/WORK_SAAS_SCREENSHOT_ARCHIVE_POLICY_2026_05_21.md`

This is in addition to the Phase 5-11 implementation files already recorded in their phase reports.

## Remaining Release Notes

1. Apply `supabase/migrations/0099_academy_optional_attendance_call.sql` remotely when credentials are available. The UI is compatible without it, but persistence of the new attendance-call setting is cleaner with the migration applied.
2. Full data-mutating E2E replays for tournament, league and academy should be rerun before a public release branch if the remote database is reset or if competition/academy logic changes again.
3. Screenshot archive cleanup should be a deliberate follow-up, not an automatic code step.

## Rollback

The frontend fallback is safe to roll back by restoring the explicit academy settings select and removing the fallback branch in `src/lib/places.ts`, but doing so would reintroduce console 400s on remote schemas that do not yet have `require_attendance_call`.

