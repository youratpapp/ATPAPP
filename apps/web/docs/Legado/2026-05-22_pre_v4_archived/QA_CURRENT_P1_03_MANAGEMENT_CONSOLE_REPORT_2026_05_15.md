# QA-CURRENT-P1-03 - Central De Gestao Sem 404/500

Data: 2026-05-15

## Objetivo

Auditar e corrigir os erros 404/500 que apareciam no console ao abrir `/gestao` em perfis operacionais, sem redesenhar a Central nem alterar permissoes.

## Causa

A Central de Gestao usava `fetchPlacesWorkspaceData(...)`, o mesmo carregador usado por workspaces completos. Esse carregador buscava dados de suporte (`paymentsByTarget` e `openMatches`) mesmo quando `/gestao` precisava apenas de locais, recursos e filas iniciais.

Na recaptura atual, o erro reproduzido era:

- `GET /rest/v1/app_payments?...target_type=eq.court_booking`
- status `500`
- corpo: `57014 canceling statement due to statement timeout`

A UI tinha fallback e carregava, mas o console ficava sujo e a primeira dobra dependia de uma chamada opcional que nao era usada pela Central.

## Correcoes

- `fetchPlacesWorkspaceData(...)` recebeu `includeSupportData?: boolean`.
- O padrao continua `true`, preservando `PlacesPage` e workspaces completos.
- `ManagementHubPage` passou a chamar `fetchPlacesWorkspaceData({ includeSupportData: false, ... })`.
- A Central deixa de buscar pagamentos/jogos abertos opcionais na primeira dobra.

## Arquivos Alterados

- `web/src/lib/place-admin-data.ts`
- `web/src/pages/ManagementHubPage.tsx`
- `web/docs/EXECUTION_QUEUE.md`
- `web/docs/CURRENT_PRODUCT_STATE.md`
- `web/docs/MANAGEMENT_OS_V2_UX_PLAN.md`
- `web/docs/MANAGEMENT_OS_V2_IMPLEMENTATION_SPEC.md`

## Evidencias

Screenshots e sumarios:

- `web/docs/screenshots/qa-current-p1-03-2026-05-15/mobile390-manager-gestao-after.png`
- `web/docs/screenshots/qa-current-p1-03-2026-05-15/mobile390-coach-gestao-after.png`
- `web/docs/screenshots/qa-current-p1-03-2026-05-15/mobile390-frontdesk-gestao-after.png`
- `web/docs/screenshots/qa-current-p1-03-2026-05-15/mobile390-finance-gestao-after.png`
- `web/docs/screenshots/qa-current-p1-03-2026-05-15/qa-current-p1-03-management-summary.json`
- `web/docs/screenshots/qa-current-p1-03-2026-05-15/qa-current-p1-03-failed-bodies.json`

Perfis validados em mobile 390px:

- `gerente.dourados@demo.atp.local`: 0 respostas HTTP >= 400.
- `prof.renato@demo.atp.local`: 0 respostas HTTP >= 400.
- `recepcao.dourados@demo.atp.local`: 0 respostas HTTP >= 400.
- `financeiro.prime@demo.atp.local`: 0 respostas HTTP >= 400.

## Validacao

- `npm run lint`: passou.
- `npm run build`: passou.
- `/gestao` carrega conteudo operacional nos quatro perfis validados.
- Nenhum erro tecnico cru apareceu na UI.

## Risco Restante

- Workspaces completos continuam carregando `paymentsByTarget`; se `app_payments` permanecer lento no backend, telas financeiras ou de detalhe ainda podem precisar de uma RPC/indexacao dedicada.
- A correcao atual remove a dependencia indevida da Central, mas nao otimiza a consulta global de pagamentos.

