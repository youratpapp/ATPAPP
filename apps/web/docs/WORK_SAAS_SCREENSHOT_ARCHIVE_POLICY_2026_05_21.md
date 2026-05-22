# Work SaaS Screenshot Archive Policy

Date: 2026-05-21

## Current Storage Snapshot

At the time of this sprint closeout:

- Screenshot folders under `docs/screenshots`: 50
- Approximate total size: 832.76 MB
- Largest folders are persona architecture baselines and repeated E2E exploratory runs.

## Final Baseline Folders To Keep

Keep these as current baselines for the Work SaaS restructure:

- `docs/screenshots/work-saas-sprint-final-smoke-after-fallback-2026-05-21`
- `docs/screenshots/work-saas-sprint-final-work-after-copy-2026-05-21`
- `docs/screenshots/work-saas-final-architecture-2026-05-21-manager`
- `docs/screenshots/work-saas-final-architecture-2026-05-21-frontdesk`
- `docs/screenshots/work-saas-final-architecture-2026-05-21-finance`
- `docs/screenshots/work-saas-final-architecture-2026-05-21-coach`
- `docs/screenshots/work-saas-final-architecture-2026-05-21-cashier`
- `docs/screenshots/work-saas-final-architecture-2026-05-21-organizer`
- `docs/screenshots/work-saas-final-architecture-2026-05-21-player-owner`

## Archivable Folders

Older repeated exploratory folders may be archived or removed after backup when the final baseline has been reviewed:

- repeated `league-e2e-flow-v4-2026-05-21-run*` folders;
- repeated `place-navigation-simplification-2026-05-21-run*` folders;
- repeated `multilocal-switcher-audit-2026-05-21-run*` folders;
- repeated `navigation-duplication-audit-2026-05-21-run*` folders;
- old local visual audit folders that are superseded by the final baseline.

Do not delete these automatically during coding sprints. Deletion should be a deliberate cleanup step after backup because the screenshots are useful evidence when comparing UX iterations.

## Future Audit Output Rule

All future screenshot audits should write to:

```text
docs/screenshots/<scope>-<yyyy-mm-dd>-<short-purpose>
```

Required files:

- `meta.json`
- `diagnostics-summary.json`
- route-level `*.diagnostics.json`
- screenshots only for selected viewports/routes

Default viewports:

- `mobile-390`
- `mobile-430`
- `desktop-1366`
- `desktop-wide`

Avoid generating full-app screenshots repeatedly unless the sprint changes global shell/navigation.

## Real Use Flow Evidence - 2026-05-21

The real-use sprint generated large evidence folders:

- `docs/screenshots/real-use-tournament-flow-2026-05-21` - 20 PNGs - approx. 17.56 MB
- `docs/screenshots/real-use-league-flow-2026-05-21` - 25 PNGs - approx. 20.49 MB
- `docs/screenshots/real-use-academy-flow-2026-05-21` - 40 PNGs - approx. 54.68 MB
- `docs/screenshots/real-use-academy-flow-recheck-2026-05-21` - 40 PNGs - approx. 54.25 MB
- `docs/screenshots/real-use-communication-flow-2026-05-21` - 8 PNGs - approx. 5.39 MB

Keep the final successful folders while the product decisions are being reviewed:

- `real-use-tournament-flow-2026-05-21`
- `real-use-league-flow-2026-05-21`
- `real-use-academy-flow-recheck-2026-05-21`
- `real-use-communication-flow-2026-05-21`

The superseded `real-use-academy-flow-2026-05-21` folder can be archived after confirming that the recheck folder is enough evidence. Its diagnostics should be kept or copied into the final report because it records why the old test expectation was changed.

## Cleanup Rule

Do not create screenshots outside `docs/screenshots`.

Do not write audit output into `C:\Users\User` temporary folders except for browser profile directories created and removed during CDP runs.

When a sprint creates more than 100 MB of PNG evidence, add a short note in the sprint report naming:

- folders created;
- total approximate size;
- which folders are baseline;
- which folders are temporary/archive candidates.

## Focused Pending-Fix Evidence - 2026-05-22

Folders created for the RUF pending-fix sprint:

- `docs/screenshots/real-use-pending-fixes-owner-2026-05-22`
- `docs/screenshots/real-use-pending-fixes-coach-2026-05-22`
- `docs/screenshots/real-use-pending-fixes-recheck-owner-2026-05-22`
- `docs/screenshots/real-use-pending-fixes-recheck-coach-2026-05-22`
- `docs/screenshots/real-use-pending-fixes-final-recheck-owner-2026-05-22`
- `docs/screenshots/real-use-pending-fixes-final-recheck-coach-2026-05-22`

The final recheck folders are the useful evidence for the final report because they cover mobile 390, mobile 430 and desktop 1366. The first-pass owner/coach folders are exploratory and can be archived after review.
