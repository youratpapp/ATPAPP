# Work SaaS Phase 1 Status

Date: 2026-05-21  
Queue phase: Phase 1 - SaaS Shell And Context  
Status: started, local-safe implementation under DB gate risk.

## DB Gate Note

Phase 0B is blocked because the remote database is missing `place_academy_settings.require_attendance_call` and this environment has no DB write credential.

Phase 1 changes below are local-safe:

- no backend loaders changed;
- no permissions relaxed;
- no schema-dependent academy behavior changed;
- no public routes removed.

## Completed In This Sprint

### `WSAAS3-01 - Work SaaS Shell Foundation`

Partial implementation completed.

Changed:

- `src/components/management/ManagementShell.tsx`
- `src/components/AppShell.tsx`
- `src/App.css`

Result:

- Work pages now use the `AppShell` topbar as the single owner of the Jogador/Trabalho selector.
- The duplicated selector inside the management page header was removed.
- The topbar is visible for `ManagementShell` on mobile and desktop.
- The topbar now displays a compact active context pill: `Jogador` or `Trabalho`.

Validation:

- `npx.cmd tsc -b --pretty false` passed.

### `WSAAS3-02 - Organization And Unit Context Model`

Foundation started.

Changed:

- `src/components/management/ManagementShell.tsx`
- `src/pages/ManagementHubPage.tsx`
- `src/pages/PlacesPage.tsx`

Result:

- `ManagementShell` now accepts breadcrumb context.
- `/gestao` shows Work context.
- `/gestao/:placeId` and legacy admin wrappers can show `Trabalho > Local`.

Still pending:

- full organization/unit switchboard;
- moving repeated unit identity out of page body cards;
- richer multiunit selector in the top shell.

### `WSAAS3-03 - Breadcrumb And Page Header Contract`

Foundation started.

Changed:

- `src/components/management/ManagementShell.tsx`
- `src/App.css`

Result:

- Added a reusable management breadcrumb slot.
- Page title, purpose, stats and actions now have a clearer header contract.

Still pending:

- applying the contract across all domain pages after domain navigation is finalized.

### `WSAAS3-04 - Shell QA Pass`

Partial.

Validated:

- TypeScript build: passed.

Still pending:

- Playwright/screenshots at 390, 430, 1366 and wide;
- player, manager, coach, frontdesk, finance, cashier and organizer smoke;
- console/network diagnostics after DB migration closure.

## Files Changed

- `src/components/management/ManagementShell.tsx`
- `src/components/AppShell.tsx`
- `src/pages/ManagementHubPage.tsx`
- `src/pages/PlacesPage.tsx`
- `src/App.css`

## Next Safe Step

Proceed to Phase 2 navigation work only in changes that:

- preserve current routes;
- preserve permission filters;
- do not depend on the missing remote academy settings column;
- keep the new shell as the owner of mode context.

