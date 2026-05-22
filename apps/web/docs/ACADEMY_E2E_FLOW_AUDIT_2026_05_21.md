# Academy E2E Flow Audit - 2026-05-21

Nota 2026-05-22: este arquivo e evidencia de QA, nao fonte executiva atual. A fonte atual e `DOCS_SOURCE_OF_TRUTH_INDEX_2026_05_22.md` + `WORK_SAAS_UX_ORGANIZATION_MASTER_SPEC_V4_2026_05_22.md`.

Fonte historica usada na rodada original:

- `docs/Legado/2026-05-22_pre_v4_archived/APP_WORKFLOW_EXECUTION_PLAYBOOK_V3.md`
- `docs/Legado/2026-05-22_pre_v4_archived/EXECUTION_QUEUE.md`
- Auditor: `scripts/academy-e2e-flow-audit.mjs`
- Evidencia final: `docs/screenshots/academy-e2e-flow-v1-2026-05-21-run3/`
- Rechecagem SQL/DB: `docs/screenshots/academy-e2e-flow-v1-2026-05-21-run4-after-sql-check/`

## Resultado resumido

Status da rodada: **executada ate o fim com bloqueios de banco documentados**.

O auditor criou uma academia nova, quadras, professores, turmas, contratos de aluno, matriculas, reserva de quadra e lista de espera. Depois navegou por gestor, professor, recepcao, financeiro, aluno e jogador em mobile/desktop.

Diagnostico final:

- `completed: true`
- `failedRequests: []`
- `pageErrors: []`
- Console com erro funcional em chamada: `app_mark_academy_attendance` retornou `column reference "id" is ambiguous`.
- Staff invite bloqueado no backend remoto: `app_accept_place_staff_invite` retornou `column reference "place_id" is ambiguous`.
- Typecheck: `npx.cmd tsc -b --pretty false` passou.

## Rechecagem SQL - run4-after-sql-check

Rodada executada em 2026-05-21 apos confirmar que o Supabase CLI esta disponivel via `npx supabase`.

Resultado:

- `completed: true`
- `screenshots: 40`
- `failedRequests: []`
- `pageErrors: []`
- `flowIssues: 4`, todos em aceite de convite de staff.
- Console ainda registrou chamada quebrada em `app_mark_academy_attendance`.

Conclusao:

- A migration `supabase/migrations/0098_fix_academy_staff_invite_attendance_ambiguity.sql` existe localmente, mas ainda nao esta aplicada no banco remoto `xdopstommqojjofapzjl`.
- O ambiente local tem Supabase CLI, mas nao tem projeto linkado, `SUPABASE_ACCESS_TOKEN`, `DATABASE_URL`, senha Postgres ou service role disponivel para aplicar DDL remoto.
- A tentativa com `supabase db query --linked` falhou porque o projeto nao esta linkado/autenticado.

Comando seguro quando houver credencial:

```powershell
npx.cmd supabase db query --db-url "$env:DATABASE_URL" --file supabase\migrations\0098_fix_academy_staff_invite_attendance_ambiguity.sql
```

Depois de aplicar:

```powershell
$env:ATP_ACADEMY_FLOW_OUT_DIR='docs/screenshots/academy-e2e-flow-v1-2026-05-21-run5-after-0098'
node scripts\academy-e2e-flow-audit.mjs
```

## Massa criada na rodada final

Academia:

- Nome: `ATP Centro Dourados 0521052052`
- ID: `49709592-173c-49c6-aa22-bacb6ec0b31b`
- Produto: `academy`
- Cidade: `Dourados - MS`

Recursos criados:

- 3 quadras: `Quadra 1`, `Quadra 2`, `Quadra 3`
- 1 regra operacional de reserva com aprovacao obrigatoria
- 2 professores: `Renato Siqueira`, `Lais Monteiro`
- 2 turmas: `Adulto Intermediario`, `Kids Iniciante`
- 4 contratos de aluno
- 5 matriculas vinculadas a logins seed
- 1 reserva de quadra solicitada por jogador seed
- 1 lista de espera no mesmo horario
- 1 baixa manual de pagamento em uma matricula

Logins usados:

- Gestor: `escalao@gmail.com`
- Professores: `prof.renato@demo.atp.local`, `prof.lais@demo.atp.local`
- Recepcao: `recepcao.dourados@demo.atp.local`
- Financeiro: `financeiro.prime@demo.atp.local`
- Aluno principal: `jogador031@demo.atp.local`
- Jogador da reserva: `jogador035@demo.atp.local`
- Jogador da espera: `jogador036@demo.atp.local`

## Fluxos executados

### Gestor / owner

Rotas auditadas:

- `/gestao`
- `/gestao/:placeId/painel`
- `/gestao/:placeId/ajustes?visao=checklist`
- `/gestao/:placeId/agenda?visao=quadras`
- `/gestao/:placeId/agenda?visao=reservas`
- `/gestao/:placeId/agenda?visao=espera`
- `/gestao/:placeId/academia?visao=professores`
- `/gestao/:placeId/academia?visao=grade`
- `/gestao/:placeId/academia?visao=alunos`
- `/gestao/:placeId/academia?visao=hoje`
- `/gestao/:placeId/academia?visao=pendencias`
- `/gestao/:placeId/financeiro?visao=recebiveis`
- `/gestao/:placeId/clientes?visao=rotina`

Validado:

- A academia aparece na lista de locais do gestor.
- Quadras, regra e turmas aparecem no workspace.
- Reserva pendente aparece e foi confirmada pela UI.
- Lista de espera aparece depois da confirmacao.
- Matricula pendente apareceu e foi ativada pela UI.
- O fluxo de chamada abre pelo CTA `Fazer chamada`.

Bloqueios:

- A chamada falha no backend ao registrar `Presente`.
- A rota de financeiro da academia redirecionou para painel, apesar de existirem contratos/mensalidade de aluno. Isso indica conflito entre produto `academy` e necessidade financeira do local.

### Professor

Como o aceite de convite para a academia nova quebrou no backend remoto, o auditor usou `ADT Dourados` como fallback para validar a experiencia de professor.

Rotas auditadas:

- `/gestao`
- `/gestao/:fallbackPlaceId/academia?visao=hoje`
- `/gestao/:fallbackPlaceId/academia?visao=alunos`

Validado:

- Professor entra em modo Trabalho com foco em aulas/turmas/alunos.
- Professor nao cai no ERP completo.
- Professor tem menu reduzido para academia.

Pontos de UX:

- Em alguns dias, `Hoje` pode mostrar `0 aulas hoje`, mas a area ainda mostra turmas/alunos; isso e correto, mas o empty state deveria orientar melhor para `Ver agenda semanal`.
- O professor depende do vinculo por convite; enquanto a RPC estiver quebrada, novas academias nao conseguem ativar professor de verdade.

### Recepcao

Como o convite da recepcao para a academia nova tambem quebrou, o auditor usou `ADT Dourados` como fallback.

Rotas auditadas:

- `/gestao`
- `/gestao/:fallbackPlaceId/agenda?visao=nova-reserva`
- `/gestao/:fallbackPlaceId/agenda?visao=reservas`

Validado:

- Recepcao ve reservas, check-ins, lista de espera e nova reserva.
- Permissao nao exibe financeiro amplo nem ajustes estruturais.

Ponto critico de UX:

- Em `Nova reserva`, a lista de espera aparece antes do formulario de criacao, especialmente no mobile. Para recepcao, o fluxo esperado e `Nova reserva -> escolher quadra/data/hora -> buscar -> confirmar`. A espera deveria entrar como contexto secundario ou sheet, nao ocupar a primeira dobra.

### Financeiro

Como o convite financeiro para a academia nova quebrou, o auditor usou `Clube Racket Prime` como fallback.

Rotas auditadas:

- `/gestao`
- `/gestao/:fallbackPlaceId/financeiro?visao=recebiveis`

Validado:

- Financeiro tem tela focada em vencidos, recebiveis e baixa.
- Financeiro nao cai em agenda/aulas como principal.

Pontos de UX:

- A primeira dobra do financeiro ainda e muito densa quando ha muitos recebiveis.
- O fluxo da academia nova nao expôs o financeiro do local por causa do plano `academy`; isso precisa ser decidido/corrigido.

### Aluno

Rotas auditadas:

- `/inicio`
- `/agenda`
- `/minhas-aulas`
- `/meus-pagamentos`
- `/locais/:placeId/aulas`

Validado:

- Aulas da academia nova aparecem na agenda pessoal.
- `/minhas-aulas` mostra as turmas futuras.
- `/meus-pagamentos` mostra pagamentos pessoais sem misturar financeiro do local.
- Pagina publica do local mostra aulas e vagas.

Pontos de UX:

- Como o usuario seed ja tem muitos vinculos, agenda/pagamentos ficam longos. Para uso real isso reforca a necessidade de priorizacao por `proximo compromisso`, `vencidos`, `aulas desta semana` e filtros persistentes.
- Quando a mesma pessoa tem varias academias/turmas, a lista precisa agrupar por local/semana para nao parecer duplicada ou caotica.

### Jogador com reserva

Rotas auditadas:

- `/minhas-reservas`
- `/locais/:placeId/reservar`

Validado:

- Reserva feita por jogador seed aparece em `Minha agenda/Minhas reservas`.
- Depois de confirmada pelo gestor, a reserva aparece como `Confirmada`.

Ponto critico de UX:

- A rota `/locais/:placeId/reservar` ainda cai numa visao geral do local, com outro CTA `Reservar quadra`. Para fluxo continuo, essa rota deveria abrir diretamente a experiencia de reserva ou focar o bloco de reserva sem exigir um segundo clique.

## Screenshots principais

Pasta final:

`docs/screenshots/academy-e2e-flow-v1-2026-05-21-run3/`

Screenshots de referencia:

- `01-desktop-1366-01-owner-trabalho-hoje.png`
- `03-desktop-1366-03-owner-painel-local.png`
- `06-desktop-1366-06-owner-agenda-quadras.png`
- `08-desktop-1366-08-owner-agenda-reservas-apos-confirmar.png`
- `12-mobile-390-12-owner-academia-grade-mobile.png`
- `14-desktop-1366-14-owner-academia-alunos-apos-aprovar.png`
- `16-desktop-1366-16-owner-academia-hoje-chamada-aberta.png`
- `27-desktop-1366-26-frontdesk-trabalho-hoje.png`
- `29-mobile-390-28-frontdesk-nova-reserva-mobile.png`
- `33-mobile-390-32-student-home.png`
- `34-mobile-390-33-student-agenda.png`
- `36-mobile-390-35-student-meus-pagamentos.png`
- `39-mobile-390-38-player-local-reservar.png`

## Achados por severidade

### ACADEMY-DB-01 - Convite de staff quebrado

Severidade: bloqueador.

Erro:

`app_accept_place_staff_invite: column reference "place_id" is ambiguous`

Impacto:

- Professor novo nao consegue aceitar vinculo.
- Recepcao nova nao consegue aceitar vinculo.
- Financeiro novo nao consegue aceitar vinculo.
- Academia nova fica operacional para owner, mas nao para equipe.

Correcao local criada:

- `supabase/migrations/0098_fix_academy_staff_invite_attendance_ambiguity.sql`

Pendencia:

- Aplicar migration no banco remoto e rerodar auditoria sem fallback.

### ACADEMY-DB-02 - Chamada/presenca quebrada

Severidade: bloqueador.

Erro:

`Falha ao registrar chamada. Error: column reference "id" is ambiguous`

Impacto:

- O professor/gestor consegue abrir a chamada, mas nao consegue persistir presenca/falta.
- Fluxo diario de aula fica interrompido.

Correcao local criada:

- `supabase/migrations/0098_fix_academy_staff_invite_attendance_ambiguity.sql`

Pendencia:

- Aplicar migration no banco remoto e rerodar chamada com owner e professor.

### ACADEMY-UX-01 - Troca de local confusa quando ha varias academias

Severidade: alta.

Sintoma:

- O owner com varios locais ve um seletor longo dentro do workspace.
- Locais seed e academias QA aparecem todos juntos.
- O menu externo e o menu interno competem pela orientacao.

Risco:

- Usuario nao entende em qual academia esta mexendo.
- Acoes de turma/reserva podem ser feitas no local errado.

Direcao:

- Criar uma camada clara `Selecionar local` antes do workspace ou um switcher compacto com organizacao por cidade/plano.
- No workspace, manter apenas o local ativo com troca controlada, nao uma lista longa na primeira dobra.

### ACADEMY-UX-02 - Mobile da academia tem tiers demais antes da tarefa

Severidade: alta.

Sintoma:

- Em mobile, antes de chegar na grade/turma aparecem: titulo global, seletor Jogador/Trabalho, botoes de volta/publico, card do local, seletor de local, metricas, menu de modulo, card do modulo, tabs internas e cards de atalhos.

Impacto:

- A aula/turma real aparece tarde.
- Parece organizado visualmente, mas operacionalmente pesado.

Direcao:

- No mobile, condensar header do local depois do primeiro acesso.
- Manter `Hoje/Grade/Alunos/Pendencias` como tabs principais sticky.
- Transformar cards `Hoje/Pendencias/Alunos/Grade` em linha compacta ou ocultar quando ja se esta dentro de uma aba.

### ACADEMY-UX-03 - Nova reserva da recepcao abre com espera antes do formulario

Severidade: alta.

Sintoma:

- A tela `Nova reserva` exibe uma lista de espera longa antes do formulario, inclusive no mobile.

Impacto:

- Recepcao veio criar reserva, mas precisa rolar para achar os campos.

Direcao:

- Em `visao=nova-reserva`, formulario deve ser a primeira dobra.
- Lista de espera deve aparecer como painel lateral no desktop e bloco/sheet depois do formulario no mobile.

### ACADEMY-UX-04 - Rota publica de reserva nao entra direto no fluxo de reserva

Severidade: media/alta.

Sintoma:

- `/locais/:placeId/reservar` mostra `Visao geral` e exige novo clique em `Reservar quadra`.

Impacto:

- Quebra continuidade: Home/Jogar -> Reservar deveria cair direto em escolha de horario/quadra.

Direcao:

- Fazer o intent `reservar` selecionar/focar diretamente o fluxo de reserva.
- Manter resumo do local como contexto secundario.

### ACADEMY-UX-05 - Financeiro em produto academy precisa ser definido

Severidade: alta.

Sintoma:

- A academia criada com plano `academy` tem contratos/mensalidades, mas rota de financeiro redirecionou para painel.

Impacto:

- Gestor de academia precisa cobrar mensalidade, mas o modulo pode ficar invisivel dependendo do plano.

Direcao:

- Definir se `academy` sempre tem `Financeiro` limitado a mensalidades/aulas.
- Separar `Financeiro do local` de `Pagamentos pessoais`, sem esconder cobranca recorrente da academia.

### ACADEMY-UX-06 - Work Today do gestor fica grande demais com multiplos locais/eventos

Severidade: media/alta.

Sintoma:

- Owner ve centenas de pendencias agregadas, muitas vindas de todos os locais e competicoes.

Impacto:

- A primeira tarefa do dia perde foco.

Direcao:

- Priorizar por local ativo, severidade e vencimento.
- Oferecer `Ver por local` e `Ver todas` sem transformar primeira dobra em fila infinita.

## Itens a revalidar depois da correcao

1. Aplicar `0098_fix_academy_staff_invite_attendance_ambiguity.sql` no banco remoto.
2. Rerodar `node scripts/academy-e2e-flow-audit.mjs` sem fallback de staff.
3. Confirmar que professor novo aceita convite da academia nova.
4. Confirmar que recepcao e financeiro aceitam convite da academia nova.
5. Confirmar que chamada persiste `Presente` e `Falta`.
6. Validar se financeiro aparece para academia com mensalidade.
7. Revisar mobile da grade, nova reserva e agenda pessoal.
