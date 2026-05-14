# QA Demo Seed

Seed destrutivo para banco paralelo/local. Rode os arquivos SQL em ordem:

Pre-requisito: rode as migrations mais recentes antes do seed, especialmente `0079_academy_student_contracts_v1.sql` e `0080_academy_absence_notice_credit_v1.sql`. O seed atual usa contratos de aluno, `contract_id` nas matriculas, regra de antecedencia de reposicao e credito por `source_absence_id`.

1. `01_cleanup.sql`
2. `02_users.sql`
   - Se o login demo retornar `Database error querying schema`, rode `02_repair_auth_login.sql`.
3. `03_places.sql`
4. `04_academy.sql`
5. `05_bookings.sql`
6. `06_finance.sql`
7. `07_tournaments.sql`
8. `08_leagues.sql`
9. `09_cleanup_helpers.sql` opcional, para remover as tabelas auxiliares depois de validar o seed.
10. `10_verify_and_relink_owner.sql` opcional, para conferir/reparar o ownership do `escalao@gmail.com`.

Os arquivos `public.seed_*` sao auxiliares do seed. Eles nao fazem parte do produto. Eles ficam no banco depois do passo `08` para facilitar diagnostico e podem ser removidos com `09_cleanup_helpers.sql`. O `01_cleanup.sql` tambem apaga/recria esses helpers na proxima rodada.

Credenciais principais:

- Dono geral: `escalao@gmail.com` / `Escalao@2026!`
- Staff/professores: senha `Staff@2026!`
- Jogadores: `jogador001@demo.atp.local` ate `jogador240@demo.atp.local` / `Jogador@2026!`

Nao use `Analyze/Explain` para rodar o pacote completo. Execute cada arquivo com `Run`.

Se algum passo falhar no meio, comece novamente pelo `01_cleanup.sql` para garantir que os helpers e dados reais voltem para um estado limpo.

Os passos `03` a `08` tambem removem seus proprios helpers `public.seed_*` e dados demo daquele bloco antes de recriar. Assim, uma etapa pode ser repetida sem erro de tabela auxiliar ja existente.

Se o `04_academy.sql` for repetido depois do `05_bookings.sql`, ele remove reservas demo das 3 academias para liberar o trigger de conflito entre turma fixa e reserva futura. Depois disso, rode o `05_bookings.sql` novamente para repopular agenda/reservas.

O `02_users.sql` preserva o `id` de usuarios demo ja existentes e atualiza senha/metadados sem apagar o registro de `auth.users`. Isso evita erro de e-mail duplicado e evita quebrar ownership por cascade.

O erro `Database error querying schema` no login geralmente indica metadados internos incompletos em `auth.users` ou `auth.identities`. O `02_users.sql` ja preenche os tokens internos como string vazia, e o `02_repair_auth_login.sql` corrige usuarios demo ja existentes sem apagar os dados publicos.

Academia v2:

- `04_academy.sql` cria `place_academy_student_contracts` para alunos reais vinculados a usuarios, com planos de 1x, 2x e 3x por semana.
- Cada contrato gera matriculas vinculadas em uma ou mais turmas, mantendo o aluno como usuario unico para notificacoes e Player App.
- `05_bookings.sql` gera mensalidades em `app_payments` com `target_type = 'academy_student_contract'`, incluindo pagas, pendentes atuais e pendentes atrasadas.
- `04_academy.sql` tambem cria ausencias avisadas dentro e fora do prazo configurado, creditos de reposicao abertos, usados e cancelados.
- Os pagamentos legados por `academy_enrollment` ficam apenas para compatibilidade de dados antigos; a massa nova usa contrato como entidade financeira canonica.

Se o seed antigo ja tiver apagado dados por cascade, rode novamente `03_places.sql` ate `08_leagues.sql`. Depois rode `10_verify_and_relink_owner.sql` para confirmar os vinculos.
