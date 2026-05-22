# MGMT-TEAM-01 Report - Equipe/permissoes por convite aceito

Data: 2026-05-15

## Objetivo

Transformar `Gestao > Equipe` em fluxo real de pessoas, papeis e acesso: buscar usuario, enviar convite, exigir aceite e liberar Management OS somente depois do aceite.

## Causa do problema

O backend legado de local seguia o primeiro desenho de convites:

- `app_add_place_staff(...)` inseria direto em `place_staff` quando o email existia;
- `app_claim_place_staff_invites()` era chamado ao listar locais e aceitava convites automaticamente;
- a UI mostrava email/id quando havia usuario, sem nome consistente;
- o vinculo de professor por email tambem podia conceder acesso sem aceite explicito.

Isso criava um vazamento de permissao: convite pendente podia virar acesso sem uma acao clara do convidado.

## Entregue

- Criada migration `0087_place_staff_invite_acceptance_v1.sql`.
- Criadas RPCs:
  - `app_search_place_staff_candidates(...)`;
  - `app_list_place_staff(...)`;
  - `app_list_my_place_staff_invites(...)`;
  - `app_accept_place_staff_invite(...)`;
  - `app_decline_place_staff_invite(...)`.
- `app_add_place_staff(...)` agora sempre cria convite pendente.
- `app_claim_place_staff_invites()` virou no-op para impedir aceite automatico legado.
- `app_link_place_coach_by_email(...)` agora cria convite de professor e vincula `place_coaches.user_id` apenas no aceite.
- `Home` passou a mostrar convites de local para aceitar/recusar.
- `Gestao > Equipe` passou a abrir em `Equipe`, com busca por nome/email, selecao do usuario encontrado, papel e envio do convite.
- Lista de equipe mostra nome quando existe profile/auth metadata e deixa pendentes como `aguardando aceite`.

## Impactos de produto

- Convite pendente nao libera menus, rotas ou dados operacionais.
- Gestor reduz erro de email porque consegue selecionar usuario existente.
- Professor, recepcao e financeiro entram no Management OS somente apos aceitarem o convite.
- Remover membro ativo continua revogando acesso real.
- Cancelar convite pendente nao altera acesso, apenas limpa a fila.

## Arquivos alterados

- `web/src/pages/PlacesPage.tsx`
- `web/src/pages/HomePage.tsx`
- `web/src/lib/places.ts`
- `web/src/lib/types.ts`
- `web/src/components/place/TeamWorkspaceShell.tsx`
- `web/src/App.css`
- `web/supabase/migrations/0087_place_staff_invite_acceptance_v1.sql`
- `web/docs/EXECUTION_QUEUE.md`
- `web/docs/CURRENT_PRODUCT_STATE.md`
- `web/docs/MANAGEMENT_OS_V2_IMPLEMENTATION_SPEC.md`
- `web/docs/SCREEN_RESPONSIBILITIES.md`
- `web/docs/COMPONENT_GRAMMAR.md`

## Validacao

- `npx.cmd tsc -b --pretty false`: passou.
- `npm.cmd run lint`: passou.
- `npm.cmd run build`: passou.

## Riscos restantes

- Troca de papel de usuario ativo ainda deve ser feita removendo e reenviando convite para manter aceite explicito.
- Convite depende de email do usuario autenticado; convite por telefone/WhatsApp exige fluxo de identidade proprio.
- A migration precisa ser aplicada no Supabase antes de validar aceite real em producao/teste remoto.
