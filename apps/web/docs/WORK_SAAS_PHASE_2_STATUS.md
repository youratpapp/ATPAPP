# Work SaaS Phase 2 Status

Date: 2026-05-21  
Queue phase: Phase 2 - Web Domain Navigation  
Status: implemented locally, pending visual QA/screenshots after DB migration gate.

## DB Gate Note

Phase 0B is still not closed in this environment because the remote database cannot be migrated from here. The Phase 2 changes below do not depend on new database columns and do not change loaders, backend rules or RLS.

## Completed In This Sprint

### `WSAAS3-05 - Grouped Domain Sidebar`

Changed:

- `src/components/BottomNav.tsx`

Result:

- Desktop Work navigation is now grouped by SaaS domain instead of a flat module list.
- Empty groups are still hidden automatically because groups render only when they have visible items.
- Items remain filtered by the existing `WorkspaceAccessSummary` and `placeManagementModules` permission gates.

Current desktop Work groups:

| Group | Items |
|---|---|
| Trabalho | Hoje, Calendario |
| Operacao | Reservas, Aulas, Cantina/POS when allowed |
| Pessoas | Pessoas |
| Receita | Receita |
| Competicoes | Torneios, Ligas |
| Administracao | Equipe, Ajustes |

### `WSAAS3-06 - Domain Route Mapping`

Result:

- Existing route builder `buildPlaceAdminPath` remains the compatibility layer.
- Legacy paths continue to map to existing modules:
  - `agenda` stays the route segment for booking/calendar/reservation surfaces;
  - `academia` stays the route segment for Aulas;
  - `clientes` stays the route segment behind the new `Pessoas` sidebar label;
  - `financeiro` stays the route segment behind `Receita`;
  - `cantina`, `equipe` and `ajustes` remain unchanged.
- New navigation labels do not create new route requirements or broken links.

### `WSAAS3-07 - Secondary Navigation Policy`

Result:

- `Reservas` is now a direct Work navigation destination again, instead of being hidden behind a calendar-only sidebar entry.
- `Calendario` is promoted to a first-level Work item because it serves reservations, classes and professor schedules.
- `BookingWorkspaceShell` keeps only the current active view visible, avoiding the old redundant `Hoje / Reservas / Calendario / Nova reserva / Espera / Ajustes` tab strip.
- `AcademyWorkspaceShell` is already being used with `views={[academyView]}` from `PlacesPage`, so it does not show confusing peer tabs for professors/settings/resources while inside a single routed view.

### `WSAAS3-08 - Navigation QA`

Validated:

- `npx.cmd tsc -b --pretty false` passed after the navigation changes.

Pending:

- Browser QA in mobile 390px, mobile 430px, desktop 1366px and desktop wide.
- Persona screenshots for coach, frontdesk, finance, cashier, manager/owner and organizer.
- Console/network diagnostics after the DB migration gate is closed.

## Files Changed

- `src/components/BottomNav.tsx`

## Route Preservation

No route was removed. Navigation still uses the existing route helpers and legacy wrappers:

- `/gestao`
- `/trabalho`
- `/gestao/:placeId`
- `/gestao/:placeId/:module`
- `/locais/:placeId/admin`
- `/locais/:placeId/admin/:module`
- `/eventos?modo=organizing`
- `/eventos/torneios?view=organizing`
- `/eventos/ligas?view=organizing`

## Permission Preservation

No permission logic was relaxed. Items remain gated by:

- `getGlobalNavigationVisibility`
- `WorkspaceAccessSummary`
- `placeManagementModules`
- `access.primaryPlaceModules`
- `access.hasCompetitionManagement`

## Next Safe Step

Proceed to Phase 3 command center/report separation in local-safe slices:

- keep `/gestao` as the command center entry;
- avoid new schema-dependent behavior;
- keep daily work actionable and setup/report content outside the first fold;
- update status docs after each sprint.
