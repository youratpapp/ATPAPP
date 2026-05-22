# Work SaaS Phase 3 Status

Date: 2026-05-21  
Queue phase: Phase 3 - Command Center And Reports  
Status: implemented locally in safe slices, pending browser QA/screenshots.

## Completed In This Sprint

### `WSAAS3-09 - Work Switchboard /gestao`

Existing implementation reviewed:

- `/gestao` already behaves as a role-aware command center through `ManagementHubPage`.
- It prioritizes professional invites, role-specific action cards, managed units and organized competitions.
- Setup content is behind administration/onboarding details instead of competing directly with daily action cards.

Adjusted:

- `src/pages/ManagementHubPage.tsx`

Result:

- Coach/professor cards now use `Abrir aula`, `Abrir aulas` and `Proxima aula` as the default flow.
- `Fazer chamada` only remains as a contextual academy behavior when the company setting requires attendance.
- The first fold no longer treats attendance/chamada as mandatory default work.

### `WSAAS3-10 - Unit Today`

Existing implementation reviewed:

- Unit rows show critical pending work and role-specific CTAs.
- Owner/manager sees consolidated blockers.
- Coach, frontdesk, finance and cashier each get a focused primary action instead of a generic module wall.

Adjusted:

- Coach row pulse now says `Aulas para conduzir hoje` instead of `Aulas para chamar hoje`.

### `WSAAS3-11 - Reports Extraction`

Current status:

- Report extraction is partially achieved by keeping support metrics in `Sinais de suporte` and by keeping setup in `Administracao`.
- No new report routes were added in this sprint.

Still pending:

- Dedicated report wrappers/routes for operation, finance, students and competitions.
- Visual QA to confirm first fold is not crowded on all role/viewports.

### `WSAAS3-12 - Command Center QA`

Validated:

- `npx.cmd tsc -b --pretty false` passed.

Pending:

- mobile 390px and 430px screenshots;
- desktop 1366px and wide screenshots;
- console/network diagnostics after DB migration closure.

## Files Changed

- `src/pages/ManagementHubPage.tsx`
- `src/pages/PlacesPage.tsx`

## Product Decision Reflected

Attendance/chamada is optional and off by default. Professor workflow should start from:

1. agenda/aula do dia;
2. alunos/turma;
3. aviso previo;
4. reposicao;
5. chamada only if the company setting requires it.

## Next Safe Step

Proceed to Phase 4:

- promote calendar as a first-class Work module;
- keep reservations as lifecycle list/detail;
- keep setup/rules/resources outside daily reservation flow;
- preserve existing routes and view aliases.
