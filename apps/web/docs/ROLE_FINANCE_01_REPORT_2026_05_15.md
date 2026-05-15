# ROLE-FINANCE-01 Report

Data: 2026-05-15

Status: concluido.

## Objetivo

Criar papel financeiro dedicado para local, sem promover o usuario a `manager`, mantendo o principio de superficie por necessidade: financeiro opera recebiveis, despesas, lembretes e baixas; nao herda agenda, academia, CRM, cantina, equipe ou ajustes.

## Causa Raiz

Antes deste sprint, o schema de `place_staff.role` aceitava `manager`, `coach` e `frontdesk`. O usuario de teste `financeiro.prime@demo.atp.local` precisava cair em recepcao ou gestor para acessar rotinas financeiras, ampliando permissao ou poluindo sua UX com modulos fora do trabalho real.

## Entregue

- Migration `0086_place_finance_staff_role_v1.sql` adiciona `finance` em `place_staff` e `place_staff_invites`.
- RPC `app_add_place_staff(...)` preserva convites/atribuicoes com papel `finance`.
- RPC `app_can_manage_place_finance(...)` reconhece owner, manager e finance.
- Policies financeiras permitem leitura/operacao de recebiveis, contratos, mensalidades, despesas, pacotes e compras de credito.
- `placeManagementModules(...)` isola o papel financeiro no modulo `finance`.
- `/gestao` mostra perfil de operador financeiro com atalhos para recebiveis e despesas.
- `PlacesPage` permite atribuir/convidar equipe como `Financeiro`.
- `HomePage` deixa de tratar `finance` como papel operacional de Academia.
- Seed demo vincula `financeiro.prime@demo.atp.local` ao Clube Racket Prime como `finance`.

## Arquivos Alterados

- `web/supabase/migrations/0086_place_finance_staff_role_v1.sql`
- `web/supabase/seeds/qa_demo/03_places.sql`
- `web/supabase/seeds/qa_full_demo_seed.sql`
- `web/src/lib/types.ts`
- `web/src/lib/place-management.ts`
- `web/src/lib/place-admin-data.ts`
- `web/src/lib/places.ts`
- `web/src/pages/ManagementHubPage.tsx`
- `web/src/pages/PlacesPage.tsx`
- `web/src/pages/HomePage.tsx`
- `web/docs/EXECUTION_QUEUE.md`
- `web/docs/CURRENT_PRODUCT_STATE.md`
- `web/docs/ROLE_VISIBILITY_MATRIX.md`
- `web/docs/PROFILE_PLAN_ACCESS_MODEL.md`
- `web/docs/ROLE_BASED_RESTRUCTURE_TASK_SPECS.md`
- `web/docs/QA_ROLE_01_ROLE_VISIBILITY_REPORT_2026_05_15.md`

## Validacao

- `npm.cmd run lint`: passou.
- `npx.cmd tsc --noEmit`: passou.
- `npm.cmd run build`: passou.

## Riscos Restantes

- A validacao visual autenticada do usuario financeiro depende de aplicar migration e seed no Supabase alvo.
- Cantina/POS ainda precisa de papel proprio de caixa antes de ser liberada para operadores financeiros.
- Recebiveis de reserva pagos por financeiro dependem dos fluxos financeiros ja existentes; este sprint nao reestruturou o modulo Financeiro inteiro.

## Proximo Item

`QA-SEED-ROLE-01 - Perfis seed puros para QA por papel`.
