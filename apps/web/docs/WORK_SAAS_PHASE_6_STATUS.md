# Work SaaS Phase 6 Status - Pessoas

Date: 2026-05-21

## Status

Phase 6 is implemented as a first IA/navigation cleanup pass.

## Queue Items

| Item | Status | Notes |
|---|---|---|
| WSAAS3-24 People Domain Shell | Done | The former `Clientes` module is now presented as `Pessoas`, while preserving the old `clientes` route as a valid alias. |
| WSAAS3-25 CRM/Clients Redefinition | Done | Relationship/CRM copy now frames the area as a people queue, not a generic contact registry. |
| WSAAS3-26 Student And Member Contracts | Partial | Student detail remains in Aulas for class operation; module copy now points the complete base to Pessoas. Members still hand off payment/plan concerns to Receita/Financeiro. |
| WSAAS3-27 Staff/Team Boundary | Partial | Equipe remains its own admin/personnel route; no permission changes were made in this pass. |
| WSAAS3-28 Pessoas QA | Partial | TypeScript passed. Browser QA still needs updated screenshots. |

## Route Compatibility

- Canonical generated route for the people domain is now `/gestao/:placeId/pessoas`.
- Legacy `/gestao/:placeId/clientes` and `/locais/:placeId/admin/clientes` remain accepted by the parser.
- Existing view aliases such as `socios`, `members`, `pendencias` and `requests` continue to resolve into the relationship surface when the old URL is used.

## Files Changed

- `src/lib/place-management.ts`
- `src/lib/place-admin-navigation.ts`
- `src/components/place/ClientsWorkspaceShell.tsx`
- `src/components/place/PlaceClientRelationshipModule.tsx`
- `src/components/place/PlaceClientActionQueue.tsx`
- `src/pages/PlacesPage.tsx`

## Validation

- `npx.cmd tsc -b --pretty false` passed.

## Remaining Risk

- A future deeper pass should create a true unified people search across CRM contacts, students, members and staff. This sprint only corrected the IA boundary and labels without adding backend loaders.
