# Work SaaS Route Compatibility Contract V3

Date: 2026-05-21  
Queue: `WSAAS3-00B`  
Status: Phase 0A contract, created from current `src/App.tsx`, `src/lib/place-admin-navigation.ts` and `src/lib/role-visibility.ts`.

## Purpose

Freeze public, legacy and work routes before the Work SaaS restructure.

This document does not authorize removing routes. New SaaS routes must be introduced through wrappers, aliases or redirects while preserving existing URLs and query params.

## Router Model

- Router: `HashRouter`.
- Public deep links are hash-based after auth/redirect recovery.
- `tryRedirectRegistrationFallback` and `tryRestoreLastHashRoute` in `src/App.tsx` protect legacy/public links.
- Route source today: `src/App.tsx`.

## Route Preservation Rules

- Preserve direct load.
- Preserve browser refresh.
- Preserve query params when redirecting.
- Preserve public links for invitations, registrations and sharing.
- Do not remove old paths when adding SaaS canonical paths.
- Prefer wrapper/redirect over duplicating loaders.

## Core Route Table

| Route | Current behavior | Surface | Canonical future | Preserve how | Critical params | Risk |
|---|---|---|---|---|---|---|
| `/` | Redirects to `/inicio` | Player | `/inicio` | redirect | search | low |
| `/inicio` | Player home | Player | `/inicio` | direct | none | medium, must not show work/admin first fold |
| `/jogar` | Redirects to `/locais` | Player | `/locais` or future `/jogar` wrapper | redirect/wrapper | search | low |
| `/locais` | Player play/places surface | Player | `/jogar`/`/locais` compatible | direct | intent/search | medium |
| `/locais/:placeId` | Public place page | Player | same | direct | none | high, public/shared |
| `/locais/:placeId/:placeIntent` | Public place intent | Player | same | direct | intent | high, action entry |
| `/competir` | Redirects to `/eventos` | Player/Competition | `/eventos` | redirect | search | low |
| `/competicoes` | Redirects to `/eventos` | Player/Competition | `/eventos` | redirect | search | low |
| `/eventos` | Competition hub | Player/Competition | Player discovery unless `modo=organizing` | direct/wrapper | `modo` | high, player/work boundary |
| `/eventos?modo=organizing` | Organizer work entry | Work/Competition OS | future Work competition hub | preserve query | `modo` | high |
| `/eventos/torneios` | Tournament list | Competition | same | direct | `view` | medium |
| `/eventos/torneios?view=organizing` | Organizer tournament list | Work/Competition OS | future Work competition hub | preserve query | `view` | high |
| `/eventos/ligas` | League list | Competition | same | direct | `view` | medium |
| `/eventos/ligas?view=organizing` | Organizer league list | Work/Competition OS | future Work competition hub | preserve query | `view` | high |
| `/eventos/ligas/:leagueId` | League detail | Competition/Work by role | same | direct | none | high |
| `/eventos/ligas/inscricao/:token` | League join | Public/Competition | same | direct | token | high, public |
| `/ligas` | Redirects to `/eventos/ligas` | Legacy | `/eventos/ligas` | redirect | search | low |
| `/ligas/:leagueId` | Legacy league redirect | Legacy | `/eventos/ligas/:leagueId` | redirect | id | high |
| `/ligas/inscricao/:token` | Legacy league join redirect | Legacy | `/eventos/ligas/inscricao/:token` | redirect | token | high |
| `/eventos/:tournamentId` | Redirects to tournament games | Competition | `/eventos/:id/jogos` | redirect | id | high |
| `/eventos/:tournamentId/jogos` | Tournament games tab | Competition | same | direct | id | high |
| `/eventos/:tournamentId/classificacao` | Tournament standings tab | Competition | same | direct | id | high |
| `/eventos/:tournamentId/organizacao` | Tournament admin/cockpit tab | Work/Competition OS | same or Work alias | direct | id, tab/query | critical |
| `/eventos/:tournamentId/jogadores` | Tournament players tab | Competition/Work | same | direct | id | high |
| `/eventos/:tournamentId/chat` | Tournament chat tab | Competition/Work | same | direct | id, room | high |
| `/inscricao/:tournamentId` | Tournament registration | Public/Competition | same | direct | id | critical |
| `/join/:tournamentId` | Tournament invite join | Public/Competition | same | direct | id | critical |
| `/t/:tournamentId` | Legacy public tournament link | Public/Legacy | redirect to tournament | redirect | id | critical |
| `/agenda` | Personal agenda | Player | same | direct | scope/search | high |
| `/minhas-reservas` | Personal agenda filtered | Legacy/Player | `/agenda` filtered | wrapper | scope | high |
| `/minhas-partidas` | Personal agenda filtered | Legacy/Player | `/agenda` filtered | wrapper | scope | high |
| `/minhas-aulas` | Personal agenda filtered | Legacy/Player | `/agenda` filtered | wrapper | scope | high |
| `/meus-pagamentos` | Personal agenda filtered | Legacy/Player | `/agenda` filtered | wrapper | scope | high |
| `/perfil` | Player profile/account | Player | same | direct | tab/query | medium |
| `/ranking` | Ranking | Player/Competition | same | direct | none | medium |
| `/trabalho` | Redirects to `/gestao` | Work | `/gestao` | redirect | search | high |
| `/trabalho/competicoes` | Redirects to `/eventos?modo=organizing` | Work/Competition OS | future work competition hub | redirect | search | high |
| `/trabalho/atendimento` | Redirects to `/gestao` | Work | future Atendimento/Pessoas | redirect/wrapper | search | medium |
| `/gestao` | Work today/hub | Work | SaaS command center | direct | none | critical |
| `/gestao/:placeId` | Place work area | Work | unit workspace | direct | placeId | critical |
| `/gestao/:placeId/:module` | Place work module | Work | domain module route | direct | `visao` | critical |
| `/locais/:placeId/admin` | Legacy admin | Work/Legacy | `/gestao/:placeId` | wrapper | placeId | critical |
| `/locais/:placeId/admin/:module` | Legacy admin module | Work/Legacy | `/gestao/:placeId/:module` | wrapper | `visao` | critical |
| `/reservas/alteracao/:token` | Player reschedule link | Public/Player | same | direct | token | critical |
| `/dashboard` | Redirects to `/eventos` | Legacy | `/eventos` | redirect | search | low |

## Place Admin Module Compatibility

Current module segments from `src/lib/place-admin-navigation.ts`:

| Module | Canonical segment | Legacy accepted segments | Default view |
|---|---|---|---|
| `dashboard` | `painel` | `dashboard` | none |
| `bookings` | `agenda` | `bookings` | `calendar` |
| `academy` | `academia` | `academy` | `today` |
| `clients` | `clientes` | `clients` | `relationship` |
| `finance` | `financeiro` | `finance` | `receivables` |
| `canteen` | `cantina` | `canteen` | `sell` |
| `team` | `equipe` | `team` | `overview` |
| `settings` | `ajustes` | `settings` | `overview` |

Query param:

- `visao` controls inner module view.

Compatibility rule:

- SaaS V3 can change navigation labels and grouping, but must keep these module segments or route wrappers.

## Inner View Compatibility

### Agenda/Bookings

Current canonical views:

- `reservas`
- `calendario`
- `nova-reserva`
- `ajustes`

Legacy accepted views include:

- `hoje`
- `today`
- `espera`
- `waitlist`
- `quadras`
- `resources`

Product note:

- V3 target keeps Calendar first-class and reduces Reservations submenu clutter, but route aliases remain.

### Academia/Aulas

Current canonical views:

- `hoje`
- `calendario`
- `turmas`
- `alunos`
- `pendencias`
- `professores`
- `ajustes`

Product note:

- V3 target moves professor/equipe concerns to People/Equipe where appropriate, but legacy views must keep loading.

### Clientes/Pessoas

Current canonical views:

- `rotina`
- `contatos`
- `socios`
- `pendencias`
- `resumo`

Product note:

- V3 target reclassifies this under Pessoas, but current routes stay compatible.

### Financeiro/Receita

Current canonical views:

- `recebiveis`
- `pagos`
- `despesas`
- `planos`
- `resumo`

Product note:

- V3 target renames the domain to Receita in Work SaaS, but preserves `/financeiro`.

### Cantina/POS

Current canonical views:

- `hoje`
- `vender`
- `estoque`
- `produtos`

### Equipe

Current canonical views:

- `resumo`
- `equipe`
- `professores`
- `convites`
- `papeis`

### Ajustes

Current canonical views:

- `checklist`
- `dados-publicos`
- `recursos`
- `regras`
- `planos`
- `permissoes`
- `publicacao`

## Query Params To Preserve

- `visao` for place admin inner view.
- `view` for events list player/organizer mode.
- `modo` for event hub organizing mode.
- `mode` for route experience mode.
- `tab` when present in details.
- `room` when chat/deep link uses conversation state.
- `join` when public invitation context exists.

## Route QA Matrix

| Persona | Required route smoke |
|---|---|
| Player-only | `/inicio`, `/locais`, `/eventos`, `/agenda`, `/perfil` |
| Student | `/agenda`, `/minhas-aulas`, `/meus-pagamentos`, `/locais/:placeId` |
| Member | `/agenda`, `/minhas-reservas`, `/locais/:placeId/reservar` if intent exists |
| Competitive player | `/eventos`, `/eventos/:id/jogos`, `/eventos/ligas/:leagueId` |
| Organizer | `/eventos?modo=organizing`, `/eventos/:id/organizacao`, `/eventos/ligas/:leagueId` |
| Manager/owner | `/gestao`, `/gestao/:placeId`, `/gestao/:placeId/agenda`, `/locais/:placeId/admin` |
| Coach | `/gestao`, `/gestao/:placeId/academia?visao=calendario`, `/gestao/:placeId/academia?visao=alunos` |
| Frontdesk | `/gestao`, `/gestao/:placeId/agenda`, `/gestao/:placeId/clientes` |
| Finance | `/gestao`, `/gestao/:placeId/financeiro?visao=recebiveis` |
| Cashier | `/gestao`, `/gestao/:placeId/cantina?visao=vender` |

Viewports:

- mobile 390px;
- mobile 430px;
- desktop 1366px;
- desktop wide.

## Acceptance For Future Route Refactors

- Every route in Core Route Table still loads or redirects intentionally.
- Forbidden routes do not expose privileged controls.
- Public routes do not require staff context.
- Old module names remain aliases.
- Query params keep the same semantic behavior.

