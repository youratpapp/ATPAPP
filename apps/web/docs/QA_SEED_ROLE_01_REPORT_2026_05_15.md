# QA-SEED-ROLE-01 Report - 2026-05-15

## Objetivo

Separar perfis seed puros de perfis multi-papel para que QA manual consiga validar jogador, aluno, professor, recepcao, financeiro, organizador e gestor sem contaminacao de permissoes.

## Causa raiz

O seed tinha bons dados operacionais, mas alguns usuarios de QA acumulavam papeis. O caso mais critico era `organizador.circuito@demo.atp.local`, que tinha entitlement de organizador e tambem `place_staff.manager` na ADT. Isso era util para usuario misto, mas impedia comprovar que um organizador puro nao recebe Management OS.

Tambem faltava um jogador explicitamente puro, sem reserva, academia, torneio, liga ou staff, para validar a experiencia limpa do Player App e bloqueios de `/gestao`.

## Entregue

- Criado `qa.jogador.puro@demo.atp.local` / `Jogador@2026!` como `free_player` puro.
- Removido `organizador.circuito@demo.atp.local` de `place_staff`, preservando seu entitlement `competition_organizer` e seu papel em competicoes.
- Mantido `jogador001@demo.atp.local` como aluno mensalista ativo com contrato e matriculas.
- Mantido `coach.solo@demo.atp.local` sem `place_staff` e sem `place_coaches`.
- Mantido `financeiro.prime@demo.atp.local` como `place_staff.role = finance`.
- README do seed ganhou matriz de perfis por papel.
- `10_verify_seed_integrity.sql` ganhou checks para impedir regressao desses papeis.
- `qa_full_demo_seed.sql` foi sincronizado com os perfis puros e entitlement explicito para todos os usuarios.

## Arquivos alterados

- `web/supabase/seeds/qa_demo/02_users.sql`
- `web/supabase/seeds/qa_demo/03_places.sql`
- `web/supabase/seeds/qa_demo/10_verify_seed_integrity.sql`
- `web/supabase/seeds/qa_demo/README.md`
- `web/supabase/seeds/qa_full_demo_seed.sql`
- `web/docs/SEED_QA_REALISTIC_POPULATE_PLAN.md`
- `web/docs/ROLE_VISIBILITY_MATRIX.md`
- `web/docs/PROFILE_PLAN_ACCESS_MODEL.md`
- `web/docs/QA_ROLE_01_ROLE_VISIBILITY_REPORT_2026_05_15.md`
- `web/docs/CURRENT_PRODUCT_STATE.md`
- `web/docs/EXECUTION_QUEUE.md`

## Validacao

- `npm.cmd run lint`: aprovado.
- `npx.cmd tsc --noEmit`: aprovado.
- `npm.cmd run build`: aprovado.

Validacao SQL estrutural adicionada no proprio seed:

- `qa_pure_player_missing`
- `qa_pure_player_has_operational_links`
- `qa_pure_organizer_has_place_staff`
- `qa_pure_organizer_missing_entitlement`
- `qa_finance_staff_missing`
- `qa_coach_solo_has_place_links`
- `qa_monthly_student_missing`

## Risco de regressao

- Os dados so mudam no Supabase depois de reaplicar os seeds no ambiente alvo.
- Se alguem voltar a vincular o organizador puro em `place_staff`, o verificador passa a falhar.
- O arquivo unico `qa_full_demo_seed.sql` foi sincronizado para reduzir divergencia, mas o caminho recomendado segue sendo o runner split em `web/supabase/seeds/qa_demo`.

## Proxima fila

`MGMT-ROLE-QA-02 - Estado de /gestao sem acesso em shell neutro`.
