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
11. `10_verify_seed_integrity.sql` opcional, para validar integridade relacional do seed depois de rodar `01` a `08`.

Os arquivos `public.seed_*` sao auxiliares do seed. Eles nao fazem parte do produto. Eles ficam no banco depois do passo `08` para facilitar diagnostico e podem ser removidos com `09_cleanup_helpers.sql`. O `01_cleanup.sql` tambem apaga/recria esses helpers na proxima rodada.

Credenciais principais:

- Dono geral: `escalao@gmail.com` / `Escalao@2026!`
- Admin plataforma: `admin.platform@demo.atp.local` / `Staff@2026!`
- Organizador: `organizador.circuito@demo.atp.local` / `Staff@2026!`
- Coach solo: `coach.solo@demo.atp.local` / `Staff@2026!`
- Staff/professores: senha `Staff@2026!`
- Jogadores: `jogador001@demo.atp.local` ate `jogador240@demo.atp.local` / `Jogador@2026!`

Perfis de permissao populados:

- `escalao@gmail.com`: `academy_pro`, pode criar locais e competicoes.
- `admin.platform@demo.atp.local`: `platform_admin`, pode criar locais e competicoes para QA global.
- `organizador.circuito@demo.atp.local`: `competition_organizer`, pode criar competicoes sem virar gestor de academia.
- Professores: `coach_solo`, sem direito de criar local.
- Staff/recepcao/financeiro/media: entram como `free_player` no entitlement global e ganham acesso operacional somente pelo vinculo `place_staff`.
- Jogadores `jogador001@demo.atp.local` ate `jogador240@demo.atp.local`: `free_player`, sem direito de criar local/competicao.

Nao use `Analyze/Explain` para rodar o pacote completo. Execute cada arquivo com `Run`.

Se algum passo falhar no meio, comece novamente pelo `01_cleanup.sql` para garantir que os helpers e dados reais voltem para um estado limpo.

Os passos `03` a `08` tambem removem seus proprios helpers `public.seed_*` e dados demo daquele bloco antes de recriar. Assim, uma etapa pode ser repetida sem erro de tabela auxiliar ja existente.

Se o `04_academy.sql` for repetido depois do `05_bookings.sql`, ele remove reservas demo das 3 academias para liberar o trigger de conflito entre turma fixa e reserva futura. Depois disso, rode o `05_bookings.sql` novamente para repopular agenda/reservas.

O `02_users.sql` preserva o `id` de usuarios demo ja existentes e atualiza senha/metadados sem apagar o registro de `auth.users`. Isso evita erro de e-mail duplicado e evita quebrar ownership por cascade.

O erro `Database error querying schema` no login geralmente indica metadados internos incompletos em `auth.users` ou `auth.identities`. O `02_users.sql` ja preenche os tokens internos como string vazia, e o `02_repair_auth_login.sql` corrige usuarios demo ja existentes sem apagar os dados publicos.

Academia v2:

- `04_academy.sql` cria `place_academy_student_contracts` para alunos reais vinculados a usuarios, com planos de 1x, 2x e 3x por semana.
- Cada contrato gera matriculas vinculadas em uma ou mais turmas, mantendo o aluno como usuario unico para notificacoes e Player App.
- A grade agora representa operacoes de tamanhos diferentes: ADT com 24 turmas, Arena Pantanal com 30 turmas e Clube Racket Prime com 42 turmas.
- As academias nascem completas para QA operacional: planos, regras de reserva, configuracao de reposicao, professores, quadras, turmas e horarios estruturais ja ficam configurados.
- Turmas adultas usam capacidade realista de ate 4 alunos; turmas infantis usam ate 8. Matriculas ativas sao distribuidas por assentos para nao ultrapassar capacidade.
- `04_academy.sql` tambem cria `place_academy_slots` com janelas semanais `assigned`, horarios `open` e bloqueios `blocked`, sempre vinculados a professor e quadra para respeitar os triggers de recurso.
- `05_bookings.sql` gera mensalidades em `app_payments` com `target_type = 'academy_student_contract'`, incluindo pagas, pendentes atuais e pendentes atrasadas.
- `05_bookings.sql` gera reservas de quadra dos ultimos 6 meses ate 45 dias futuros, filtrando conflitos com turmas e slots de academia antes de inserir.
- Reservas pendentes sao poucas e recentes, simulando solicitações recebidas desde a ultima noite para a recepcao aprovar na abertura; backlog antigo fica confirmado/cancelado/bloqueado.
- A lista de espera de quadra nasce de reservas futuras confirmadas em horario ocupado, para validar fila sem criar espera solta.
- `05_bookings.sql` tambem cria partidas abertas vinculadas a locais e chamadas por cidade sem quadra definida, para validar o fluxo de encontrar parceiro/adversario no Player App.
- Partidas abertas usam os niveis padrao `Iniciante`, `Intermediario`, `Avancado`, `Primeira Classe` e `Profissional`.
- `06_finance.sql` complementa pagamentos de aula avulsa com `target_type = 'academy_lesson_request'` e cria lembretes para pendencias de academia, socios, reservas e aulas avulsas.
- `08_leagues.sql` cria ligas simples, dupla fixa e ranking com rodadas reais, matchroom, disponibilidade, resultado, WO, analise admin, wildcard, ranking, pagamentos por inscricao e lembretes finais.
- `07_tournaments.sql` cria torneios em `draft`, `registration_open`, `registration_closed`, `live` e `finished`, com staff, participantes, confirmacoes, resultados e pagamentos por inscricao.
- `04_academy.sql` gera 24 semanas de chamada por matricula ativa e tambem cria ausencias avisadas dentro e fora do prazo configurado, creditos de reposicao abertos, usados e cancelados.
- Solicitacoes de reposicao sao ligadas a creditos reais quando aplicavel; aulas avulsas/drop-in continuam separadas para validar fila operacional e cobrança.
- Os pagamentos legados por `academy_enrollment` ficam apenas para compatibilidade de dados antigos; a massa nova usa contrato como entidade financeira canonica.

Se o seed antigo ja tiver apagado dados por cascade, rode novamente `03_places.sql` ate `08_leagues.sql`. Depois rode `10_verify_and_relink_owner.sql` para confirmar os vinculos.

Validador de integridade:

- `10_verify_seed_integrity.sql` e nao destrutivo e deve ser executado depois de `08_leagues.sql`.
- Ele levanta erro se encontrar usuario demo sem perfil/entitlement, local sem planos/regras/configuracao, professor sem user/staff/turma, turma sem professor/quadra/aluno, turma adulta acima de 4, turma infantil acima de 8, turma acima da capacidade, contrato sem matricula, matricula ativa sem contrato/user, pagamento sem target, reserva conflitante/pendente velha, torneio aprovado sem member, rodada de liga sem match, match de liga sem players, partida aberta sem participantes, grafo social fraco ou preferencias de notificacao ausentes.
