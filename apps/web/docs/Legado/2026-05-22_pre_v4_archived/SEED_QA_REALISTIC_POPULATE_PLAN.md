# Seed QA Realistic Populate Plan

Source of truth complementar para `web/supabase/seeds/qa_demo`.

## Objetivo

O seed de QA deve simular uso real, nao apenas preencher tabelas. Toda massa precisa ser navegavel no app e validavel por vinculos reais.

## Perfis Obrigatorios

- Admin/owner: `escalao@gmail.com`, dono dos locais, torneios e ligas demo.
- Platform admin: usuario com `platform_admin` para validar guardrails globais.
- Organizador: usuario com `competition_organizer`, sem gestao completa de academia.
- Professor solo: usuario com `coach_solo`, sem local proprio completo.
- Gestores e recepcao: usuarios staff ligados a locais por `place_staff`.
- Professores de local: usuarios ligados a `place_coaches` e `place_staff`.
- Alunos: usuarios reais com `profiles`, contratos e matriculas.
- Jogador puro de QA: usuario `free_player` sem gestao e sem qualquer vinculo operacional para validar Player App limpo e bloqueios de acesso.
- Jogadores operacionais: usuarios `free_player` participando de reservas, partidas, torneios, ligas e academias para validar dados reais.

## Volumes-Alvo

### Usuarios

- 1 owner/admin principal.
- 1 platform admin.
- 1 organizador de competicoes.
- 1 coach solo.
- 10-20 staff/professores de locais.
- 240+ jogadores/alunos com perfil completo.
- Implementacao atual cria entitlement explicito para todos os usuarios demo; jogadores ficam como `free_player` sem direito de criar local/competicao.
- Implementacao atual tambem cria `qa.jogador.puro@demo.atp.local`, sem staff, contrato, reserva, inscricao, liga ou partida aberta, para testar usuario jogador sem contaminacao.

### Locais

- 3 locais demo:
  - academia media;
  - centro de treinamento;
  - clube premium/multiquadra.
- Cada local deve ter owner, staff, quadras, regras, planos, professores e configuracao.

### Academia

- Academia media: 20-30 turmas/horarios semanais.
- Centro de treinamento: 25-40 turmas/horarios semanais.
- Clube premium: 35-60 turmas/horarios semanais.
- Implementacao atual do `04_academy.sql`: ADT Dourados com 24 turmas, Arena Pantanal com 30 turmas e Clube Racket Prime com 42 turmas.
- Implementacao atual tambem cria slots semanais `assigned`, `open` e `blocked`, contratos 1x/2x/3x e matriculas vinculadas a usuario/contrato.
- Academias devem abrir sem demandas de setup: planos, regras, configuracao de reposicao, professores, quadras, turmas e horarios estruturais ja precisam estar configurados.
- Capacidades seguem operacao realista: turma adulta ate 4 alunos; turma infantil ate 8 alunos.
- Matriculas ativas devem respeitar capacidade da turma. Turma cheia e normal; turma acima da capacidade nao e massa valida.
- Cada turma ativa precisa ter professor, quadra, dia/horario, capacidade, nivel e alunos.
- Cada aluno ativo precisa ter usuario, profile, contrato e matriculas coerentes com `weekly_lessons_count`.

### Historico

- 20-26 semanas de presenca para validar 6 meses de uso.
- Implementacao atual do `04_academy.sql`: 24 semanas de chamada para matriculas ativas.
- Ausencias dentro e fora do prazo.
- Creditos abertos, usados e cancelados.
- Aulas avulsas/drop-in e reposicoes solicitadas.
- Reposicoes solicitadas devem apontar para `makeup_credit_id` real sempre que o fluxo for de uso de credito.

### Agenda

- Reservas com pico noturno, fim de semana e horarios de baixa ocupacao.
- Waitlist em horarios plausiveis.
- Sem conflito com turmas fixas na mesma quadra/horario.
- Implementacao atual do `05_bookings.sql`: reservas de 6 meses ate 45 dias futuros, com horarios de manha, almoco, pico noturno e fim de semana; candidatos sao filtrados contra `place_academy_classes` e `place_academy_slots`.
- Reservas pendentes devem simular abertura de manha: poucas, recentes, criadas desde a tarde/noite anterior e para hoje/proximos dias. Backlog antigo deve aparecer resolvido.
- Lista de espera passa a ser gerada a partir de reservas futuras confirmadas em horario ocupado.
- Descoberta social inclui partidas abertas vinculadas a locais e chamadas por cidade sem academia/quadra definida, cobrindo o fluxo "encontrar parceiro primeiro".
- Niveis de partidas abertas seguem o vocabulario operacional do produto: `Iniciante`, `Intermediario`, `Avancado`, `Primeira Classe` e `Profissional`.

### Competicoes

- Torneios em draft, inscricao aberta, live e finished.
- Implementacao atual tambem cobre `registration_closed`, com inscrições encerradas e evento futuro.
- Ligas com season, classes, players, rounds, matches, messages, availability, results e ranking.
- Implementacao atual de ligas cobre simples, dupla fixa e ranking, com inscricoes aprovadas/pendentes/rejeitadas, partidas encerradas, WO, analise admin, disputa, resultado, confirmacao e organizacao.
- Matchroom de liga inclui jogadores reais, mensagens, disponibilidade, submissions de resultado, decisoes administrativas, historico de pares, join links e caso de wildcard.

### Financeiro

- Pagamentos devem apontar para target real e usuario real.
- Implementacao atual cobre `academy_student_contract`, `place_membership`, `court_booking`, `academy_lesson_request`, `tournament_registration` e `league_registration`.
- Aula avulsa/drop-in usa `academy_lesson_request`; reposicao com credito segue `waived` e nao duplica cobranca.
- Lembretes pendentes usam canais `manual`, `whatsapp` e `email`, com status `queued`, `sent` e `cancelled`.
- POS, despesas, pacotes e compras de credito continuam como entidades operacionais proprias.

## Invariantes

O seed so e considerado saudavel se estas condicoes forem verdadeiras:

- 100% dos usuarios demo possuem `profiles`.
- Nenhum professor ativo existe sem `auth.users`.
- Nenhum professor de local existe sem `place_staff` role `coach`.
- Nenhum local demo existe sem configuracao de academia, planos ativos e regras de reserva.
- Nenhum professor ativo fica sem turmas.
- Nenhuma turma ativa existe sem professor e quadra.
- Nenhuma turma ativa existe sem alunos quando ela deveria ser operacional.
- Nenhuma turma adulta ativa tem capacidade acima de 4.
- Nenhuma turma infantil ativa tem capacidade acima de 8.
- Nenhuma turma ativa fica acima da capacidade configurada.
- Nenhum aluno ativo existe sem usuario.
- Nenhuma matricula ativa existe sem contrato, exceto registros marcados como legado.
- Nenhum contrato ativo existe sem matricula.
- `weekly_lessons_count` de contrato ativo bate com a quantidade de matriculas ativas.
- Nenhum pagamento aponta para target inexistente.
- Nenhuma inscricao aprovada de torneio fica sem `tournament_members`.
- Nenhuma liga ativa fica sem season, classes, players, rounds e matches.
- Nenhuma partida de liga fica sem `league_match_players`.

## Ordem de Execucao

1. `01_cleanup.sql`
2. `02_users.sql`
3. `03_places.sql`
4. `04_academy.sql`
5. `05_bookings.sql`
6. `06_finance.sql`
7. `07_tournaments.sql`
8. `08_leagues.sql`
9. `10_verify_and_relink_owner.sql`
10. `10_verify_seed_integrity.sql`

## Validacao Esperada

Depois do seed:

- Admin ve Management OS completo com filas reais.
- Professor ve turmas/alunos/agenda reais.
- Player puro ve proximas acoes, reservas, aulas, torneios e ligas sem vazamento de gestao.
- Organizador ve Competition OS sem CRM/financeiro de academia.
- Financeiro ve pagamentos por origem com pendencias reais.
- Agenda mostra reservas, aulas, bloqueios, waitlist e ocupacao coerente.
- Gestão abre como uma operacao ja implantada, com pendencias do dia e nao com setup incompleto.
- `10_verify_seed_integrity.sql` retorna `qa_seed_integrity_ok` ou levanta erro com o nome dos checks quebrados.

## Matriz QA Por Papel

| Papel | Usuario recomendado | Vínculo esperado | Checagem do seed |
|---|---|---|---|
| Jogador puro | `qa.jogador.puro@demo.atp.local` | Apenas perfil + entitlement `free_player` | `qa_pure_player_missing`, `qa_pure_player_has_operational_links` |
| Aluno mensalista | `jogador001@demo.atp.local` | Contrato ativo + matriculas ativas | `qa_monthly_student_missing` |
| Professor vinculado | `prof.renato@demo.atp.local` | `place_staff.coach` + `place_coaches` + turmas | checks gerais de professores/turmas |
| Professor sem local | `coach.solo@demo.atp.local` | Sem `place_staff` e sem `place_coaches` | `qa_coach_solo_has_place_links` |
| Recepcao | `recepcao.prime@demo.atp.local` | `place_staff.frontdesk` | checks gerais de staff |
| Financeiro | `financeiro.prime@demo.atp.local` | `place_staff.finance` | `qa_finance_staff_missing` |
| Organizador puro | `organizador.circuito@demo.atp.local` | `competition_organizer`, sem `place_staff` | `qa_pure_organizer_has_place_staff`, `qa_pure_organizer_missing_entitlement` |
| Gestor completo | `escalao@gmail.com` | owner e `academy_pro` | checks gerais de owner/local |
