# QA-CURRENT-P0-01 Report - Supabase alvo e roles demo

Data: 2026-05-15

## Objetivo

Estabilizar o ambiente alvo usado pelo app local antes de continuar a fila visual. A auditoria anterior encontrou dois bloqueios: usuarios demo essenciais nao autenticavam e a Home do jogador exibia erro tecnico cru de RPC (`app_list_my_place_staff_invites`).

## Causa raiz

- O Supabase alvo nao tinha as migrations recentes de roles/convites aplicadas.
- Os usuarios `qa.jogador.puro@demo.atp.local` e `caixa.prime@demo.atp.local` nao existiam no alvo.
- `app_list_place_staff(...)` permitia listar equipe apenas para owner. Perfis de staff nao gestores, como Caixa/POS, perdiam o proprio papel ao carregar `/gestao` e caiam em uma superficie generica com Agenda/Academia.

## Correcoes realizadas

- Aplicadas no Supabase alvo as migrations:
  - `0086_place_finance_staff_role_v1.sql`
  - `0087_place_staff_invite_acceptance_v1.sql`
  - `0088_place_cashier_staff_role_v1.sql`
  - `0089_place_staff_self_list_for_role_access_v1.sql`
- Criados/atualizados usuarios demo essenciais:
  - `qa.jogador.puro@demo.atp.local`
  - `caixa.prime@demo.atp.local`
  - `financeiro.prime@demo.atp.local`
  - `organizador.circuito@demo.atp.local`
- Ajustado `app_list_place_staff(...)` para:
  - owner/manager verem equipe completa e convites pendentes;
  - demais staff verem somente a propria linha ativa, suficiente para resolver permissao sem expor equipe.
- Ajustada a copy da central `/gestao` para Caixa/POS nao herdar textos de agenda/reservas.

## Arquivos alterados

- `web/supabase/migrations/0089_place_staff_self_list_for_role_access_v1.sql`
- `web/src/pages/ManagementHubPage.tsx`
- `web/docs/EXECUTION_QUEUE.md`
- `web/docs/CURRENT_PRODUCT_STATE.md`
- `web/docs/QA_CURRENT_P0_01_REPORT_2026_05_15.md`

## Evidencias

Pasta de prints e textos:

- `web/docs/screenshots/qa-current-p0-01-2026-05-15/`

Resultados principais:

- `mobile390-pure-home`: sem erro bruto de RPC e sem nav de gestao.
- `mobile390-pure-gestao`: estado vazio de jogador (`Area profissional indisponivel`) e sem cockpit operacional.
- `mobile390-cashier-home`: autentica e carrega Player App sem erro bruto.
- `mobile390-cashier-gestao`: exibe `CAIXA/POS | CAIXA E CANTINA`, `Registrar venda`/`Estoque`, sem Agenda/Academia/Clientes/Financeiro/Equipe/Ajustes como superficies.

## Validacao executada

- Login real via browser mobile 390px:
  - `qa.jogador.puro@demo.atp.local`
  - `caixa.prime@demo.atp.local`
- Rotas:
  - `/#/inicio`
  - `/#/gestao`
- Confirmado:
  - `hasRawRpcError: false`;
  - `hasCashierSurface: true` para Caixa/POS;
  - `cashierForbiddenHits: []` para Caixa/POS;
  - `app_list_my_place_staff_invites()` presente no alvo.

## Riscos restantes

- Foram observados warnings de timeout em dados opcionais de pagamentos no console durante a Home. Eles nao bloquearam a UI nem renderizaram erro bruto, mas devem ser acompanhados em `QA-CURRENT-P1-03`.
- A validacao automatizada desta rodada focou em mobile 390px e nos dois perfis que bloqueavam a auditoria visual. Desktop completo deve ser refeito nas proximas tasks de QA visual.
