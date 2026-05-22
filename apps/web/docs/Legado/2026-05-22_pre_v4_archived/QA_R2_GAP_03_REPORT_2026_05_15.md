# QA-R2-GAP-03 Report - Lista de espera player-side

Data: 2026-05-15

## Contexto

`PLAYER-UX-03` ja permitia entrar na lista de espera pela pagina publica do local. O gap restante estava no lado do jogador depois da entrada na espera: a Home mostrava `Local` generico e abria uma busca ampla de reservas, obrigando o usuario a reencontrar o clube.

## Entrega

- `CourtBookingWaitlistEntry` agora inclui `placeName`.
- `listMyCourtBookingWaitlist()` busca os locais relacionados e popula o nome real do clube.
- `listMyCourtBookingWaitlist()` filtra explicitamente pelo `user_id` autenticado, evitando misturar esperas de operador/local com esperas pessoais do jogador.
- A Home do jogador usa o nome real do local em reservas/esperas.
- Prioridades e itens de `Meu contexto` abrem `/locais/:placeId?intent=booking`, mantendo o usuario no fluxo correto.
- `QA-R2-ROADMAP` foi encerrado na queue porque os demais gaps ja estavam cobertos por sprints posteriores.

## Arquivos alterados

- `web/src/lib/types.ts`
- `web/src/lib/places.ts`
- `web/src/pages/HomePage.tsx`
- `web/docs/EXECUTION_QUEUE.md`
- `web/docs/CURRENT_PRODUCT_STATE.md`
- `web/docs/AGENDA_MODULE_FUNCTION_MAP.md`

## Validacao

- `npx.cmd tsc -b --pretty false`: passou.
- `npm.cmd run lint`: passou.
- `npm.cmd run build`: passou.

## Risco residual

Aceitar formalmente um convite de lista de espera pelo proprio jogador ainda nao foi criado como fluxo separado. Hoje o jogador abre o local correto; a conversao em reserva segue no Management OS pela equipe do local.
