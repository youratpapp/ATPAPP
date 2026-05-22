# ROLE-CASHIER-01 Report

Data: 2026-05-15

## Objetivo

Criar um papel operacional dedicado para Caixa/POS de Cantina, sem promover o operador para `manager` e sem misturar venda de balcão com o papel `finance`.

## Causa

Depois de `ROLE-FINANCE-01`, o financeiro ficou corretamente isolado em recebiveis, despesas, lembretes e baixas. O residual documentado era que Cantina/POS ainda exigia owner/manager, impedindo um operador de caixa real de registrar venda e acompanhar estoque sem acesso amplo ao local.

## Entregue

- Nova migration `0088_place_cashier_staff_role_v1.sql`.
- `place_staff.role` e `place_staff_invites.role` aceitam `cashier`.
- Novo helper SQL `app_can_manage_place_canteen(place_id)`.
- Policies de `place_pos_products` e `place_pos_sales` aceitam owner, manager ou cashier.
- `app_record_place_pos_sale(...)` valida permissao de Cantina, nao permissao ampla de gestor.
- Frontend reconhece `cashier` em tipos, labels, convites, Equipe, Home e central `/gestao`.
- `placeResourceAccess(...)` ganhou `canManageCanteen`.
- `placeManagementModules(...)` entrega somente `canteen` para operador `cashier`.
- `fetchPlaceAdminResources(...)` carrega POS por `canManageCanteen`.
- Seeds demo adicionam `caixa.prime@demo.atp.local` vinculado ao Clube Racket Prime como `cashier`.
- `10_verify_seed_integrity.sql` valida o operador caixa.

## UX

- Caixa/POS entra em `/gestao` com foco em `Registrar venda`.
- Atalho secundario abre `Estoque`.
- O papel nao recebe Agenda, Academia, Clientes/CRM, Financeiro, Equipe ou Ajustes.
- Equipe do local mostra `Caixa/POS` como papel convidável e documentado.

## Backend

- A permissao POS agora e propria: `app_can_manage_place_canteen(...)`.
- Owner e manager continuam com acesso.
- `finance` continua sem POS por padrao.

## Validacao

- `npx.cmd tsc -b --pretty false`
- `npm.cmd run lint`
- `npm.cmd run build`

## Riscos Restantes

- Aplicar migration `0088` no Supabase alvo antes de testar com usuario real.
- Rodar seed atualizado no Supabase alvo para validar o fluxo autenticado do caixa.
- Se fechamento de caixa/repasse financeiro entrar no produto, deve ser especificado como fluxo novo, nao como expansao silenciosa do papel `cashier`.
