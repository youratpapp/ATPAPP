# Academy V2 UX Plan

Fonte principal:

- `ACADEMY_MODULE_FUNCTION_MAP.md`
- `CURRENT_PRODUCT_STATE.md`
- `EXECUTION_QUEUE.md`
- `SCREEN_RESPONSIBILITIES.md`
- `COMPONENT_GRAMMAR.md`
- `PREMIUM_UX_VISUAL_LANGUAGE.md`
- `FULL_APP_PRODUCT_TECH_UX_AUDIT.md`
- `DESIGN_TOKENS.md`

Data: 2026-05-14

## Objetivo

Evoluir `Gestao > Academia` de uma v1 funcional, mas empilhada, para uma v2 operacional, intuitiva e profissional.

Academia v2 nao deve ser uma pagina bonita com muitos blocos. Deve ser uma ferramenta de trabalho para secretaria, professor, recepcao, financeiro e gestor.

Regra principal:

```text
Rotina diaria vira row + acao clara + drawer curto.
Setup raro vira fluxo guiado.
Detalhe secundario sai do corpo da pagina.
```

## Diagnostico consolidado

O modulo atual ja tem boa cobertura funcional, mas a experiencia ainda mistura responsabilidades:

- aulas do dia;
- turmas;
- alunos;
- chamada;
- financeiro de aluno;
- professores;
- reposicoes;
- aula avulsa;
- busca de encaixe;
- horarios abertos;
- configuracao de recursos;
- formularios legados.

Os principais problemas sao:

1. `Central da academia` e bloco legado `Academia e aulas` coexistem.
2. Formularios de matricula/mensalidade aparecem dentro da lista de turmas.
3. `Hoje` ainda nao opera chamada com profundidade suficiente.
4. `Pendencias` mistura fila para resolver com ferramenta de busca.
5. `Recursos` nao comunica claramente quadras, horarios e disponibilidade.
6. Algumas listas usam limites silenciosos e podem esconder dados.
7. Acoes financeiras e de contato competem com a tarefa real.
8. Mobile tende a virar pagina longa.

## Nova arquitetura UX

Abas v2:

1. `Hoje`
2. `Grade`
3. `Alunos`
4. `Pendencias`
5. `Professores`
6. `Configuracao`

Regra de navegacao:

- desktop pode mostrar todas se houver espaco;
- mobile usa trilho horizontal ou sheet de modulo;
- overflow so existe quando realmente falta espaco;
- nenhuma aba deve abrir conteudo com scroll interno preso dentro do card do shell.

## Responsabilidade por aba

### Hoje

Responsabilidade:

- operar aulas do dia.

Conteudo:

- rows de aula;
- horario;
- turma;
- professor;
- quadra;
- ocupacao;
- faltas avisadas;
- reposicoes relacionadas;
- acao primaria `Fazer chamada` ou `Abrir aula`.

Nao contem:

- criar turma;
- cadastro de professor;
- buscar encaixe;
- configuracao de recursos;
- financeiro amplo;
- formularios de matricula.

Comportamento:

- row de aula abre `LessonDrawer`;
- chamada permite presenca, falta e ausencia avisada;
- drawer mostra alunos, reposicoes do dia e observacao curta;
- evolucao tecnica pode ser registrada no aluno, nao como formulario global.

### Grade

Responsabilidade:

- gerenciar turmas, horarios e vagas.

Conteudo:

- lista operacional de turmas;
- busca e filtros;
- professor, quadra, dia, horario, vagas, mensalidade e nivel;
- acoes `Ver`, `Editar`, `Matricular aluno`.

Nao contem:

- formulario repetido de matricula por turma;
- formulario repetido de mensalidade por turma;
- chamada do dia;
- pendencias de aula avulsa;
- recursos duplicados.

Comportamento:

- `Nova turma` abre drawer curto;
- campos essenciais primeiro: nome, professor, quadra, dia, horario, vagas, mensalidade e nivel;
- avancados recolhidos: genero, faixa etaria, idades, reposicao, observacoes e nome publico;
- click na turma abre `ClassDrawer` com `Dados`, `Alunos`, `Financeiro` e `Presenca/Historico`.

### Alunos

Responsabilidade:

- localizar aluno e resolver a situacao dele.

Conteudo:

- busca forte;
- filtros simples;
- rows de aluno;
- matricula, pagamento, presenca, reposicao e acao primaria contextual.

Acoes:

- cobrar;
- enviar lembrete;
- marcar pago;
- check-in;
- marcar falta;
- registrar ausencia avisada;
- editar matricula;
- cancelar/ativar matricula;
- abrir historico;
- registrar evolucao;
- ver creditos de reposicao.

Comportamento:

- row abre `StudentDrawer`;
- drawer contem dados pessoais, matriculas, pagamentos, presenca, evolucao, observacoes, reposicoes e historico;
- nao repetir formulario de matricula dentro de cada turma.

### Aluno como contrato/plano semanal

Decisao de evolucao:

- `Aluno` nao deve ser apenas um nome solto matriculado em uma turma.
- O cadastro profissional deve criar ou vincular um `usuario aluno`, para notificacoes, perfil, historico e recorrencia.
- A academia deve definir um plano operacional do aluno: quantidade de aulas por semana, valor mensal, status e turmas/horarios vinculados.
- A tela pode continuar usando `place_academy_enrollments` como vinculo com turmas, mas precisa de uma camada superior de contrato/plano para agrupar as matriculas do mesmo aluno.

Fluxo alvo:

1. secretaria busca ou convida o usuario por email/telefone;
2. define plano do aluno: aulas por semana, mensalidade e inicio;
3. seleciona uma ou mais ocorrencias semanais compativeis;
4. se a mesma turma acontecer em mais de um dia/horario, a UI mostra as ocorrencias agrupadas e permite escolher uma, outra ou ambas;
5. o aluno entra sem creditos de reposicao;
6. ausencia avisada dentro da antecedencia configurada gera credito de reposicao e libera a vaga operacionalmente.

Regras:

- novo aluno deve priorizar usuario vinculado; aluno sem login e excecao administrativa e precisa aparecer como `convite pendente` ou `sem login`.
- o plano semanal deve validar se a quantidade de horarios selecionados bate com a quantidade contratada, permitindo excecao consciente pelo gestor.
- cobranca mensal deve ser por contrato/plano do aluno, nao por cada turma individual quando houver multiplos horarios semanais.
- reposicao aberta e credito do aluno, nao de uma turma isolada; ainda assim deve guardar origem: turma, data, ausencia e matricula.
- ausencia avisada precisa respeitar uma configuracao por academia, como `antecedencia minima para gerar reposicao`.
- quando a ausencia for fora do prazo, a UI deve explicar claramente se nao gerou credito ou se exige aprovacao manual.

Impacto no modelo atual:

- `place_academy_enrollments` segue util para presenca, turma e historico por aula.
- `place_academy_student_contracts` e a entidade canonica de contrato/plano para agrupar varias matriculas do mesmo usuario.
- `app_payments` usa `academy_student_contract` como alvo canonico de mensalidade, mantendo `academy_enrollment` como fallback legado.
- `place_academy_planned_absences` registra ausencia avisada e valida antecedencia pela regra da academia.
- `place_academy_makeup_credits` nasce de `source_attendance_id` quando vem de falta marcada e de `source_absence_id` quando vem de ausencia avisada.

Estado implementado em 2026-05-14:

- migration `0079_academy_student_contracts_v1.sql` criou `place_academy_student_contracts`;
- `place_academy_enrollments.contract_id` liga as matriculas operacionais ao contrato semanal;
- `place_academy_settings` passou a guardar `makeup_notice_hours`;
- `place_academy_makeup_credits.source_absence_id` prepara credito por ausencia avisada;
- `app_create_academy_student_contract(...)` cria contrato e matriculas por turma em uma operacao de backend;
- pagamentos/lembretes aceitam `academy_student_contract` como alvo canonico da mensalidade;
- `Grade > Turma > Novo aluno` passou a usar o contrato canonico com email/login, plano semanal, mensalidade, inicio e selecao de horarios;
- `Academia > Alunos` passou a agrupar linhas por contrato/usuario quando existir `contract_id`, evitando duplicar visualmente aluno com dois horarios semanais.

Pendencia apos esta etapa:

- `Marcar pago`, `Cobrar` e `Enviar lembrete` ja usam `academy_student_contract` quando a matricula esta ligada a contrato;
- pagamentos antigos por `academy_enrollment` continuam sendo lidos como fallback para matriculas legadas;
- Financeiro/Recebiveis passa a listar contratos como mensalidade canonica e inclui matriculas sem contrato apenas como legado.

Proxima pendencia:

- migration `0080_academy_absence_notice_credit_v1.sql` atualizou `app_report_academy_absence(...)`;
- ausencia avisada agora valida dia real da turma e antecedencia minima configurada pela academia;
- quando a regra permite, a ausencia cria credito de reposicao com `source_absence_id`;
- quando esta fora do prazo, a ausencia fica registrada sem credito automatico e a UI explica o motivo;
- `Configuracao > Quadras e horarios` permite editar antecedencia minima e ativar/desativar credito automatico.

Seed/reset QA:

- seed/reset de teste deve criar contratos, usuarios alunos, cobrancas e ausencias dentro/fora do prazo para validar massa real.
- `web/supabase/seeds/qa_demo/04_academy.sql` agora cria:
  - contratos reais em `place_academy_student_contracts`;
  - planos 1x, 2x e 3x por semana;
  - matriculas vinculadas por `contract_id`;
  - configuracao de antecedencia em `place_academy_settings`;
  - ausencias dentro e fora do prazo;
  - creditos de reposicao abertos, usados e cancelados por `source_absence_id` e `source_attendance_id`.
- `web/supabase/seeds/qa_demo/05_bookings.sql` agora cria mensalidades por `academy_student_contract`, com pagas, pendentes atuais e pendentes atrasadas.
- `qa_demo/README.md` documenta pre-requisito das migrations `0079` e `0080`, ordem de execucao e natureza seed-only das tabelas auxiliares.

### Pendencias

Responsabilidade:

- limpar fila operacional.

Conteudo:

- matriculas pendentes;
- aulas avulsas/drop-in;
- solicitacoes de reposicao;
- creditos de reposicao abertos;
- pagamentos pendentes de academia quando aplicavel.

Nao contem:

- ferramenta permanente de busca de encaixe aberta no corpo.

Comportamento:

- rows densas: nome, tipo, turma, data, valor e acao;
- acoes principais: aprovar, recusar, marcar pago, agendar reposicao, usar reposicao, baixar credito;
- WhatsApp e acao secundaria;
- `Buscar encaixe` abre drawer/sheet proprio.

### Professores

Responsabilidade:

- gerenciar professores, agenda, login e comissao.

Conteudo:

- lista de professores;
- contato;
- turmas vinculadas;
- agenda;
- comissao;
- login vinculado;
- acoes `Editar`, `Agenda`, `WhatsApp`.

Comportamento:

- `Novo professor` abre drawer curto: nome, telefone e email;
- avancados: comissao, especialidades, niveis, disponibilidade, login vinculado, observacoes;
- comissao nao fica como input aberto permanente;
- professor operacional ve suas turmas, seus alunos, sua agenda e suas chamadas, nao a operacao inteira.

### Configuracao

Responsabilidade:

- estruturar quadras, horarios e disponibilidade.

Nome recomendado:

- `Configuracao` no tab;
- header interno `Quadras e horarios`.

Conteudo:

- quadras;
- horarios abertos;
- disponibilidade por professor;
- disponibilidade por quadra;
- regras de aula;
- bloqueios.

Comportamento:

- filtro explicito de dia/data;
- alternancia `Por professor` / `Por quadra`;
- acoes `Criar horario aberto`, `Criar turma neste horario`, `Bloquear horario`;
- horario aberto e uma janela operacional, nao uma turma;
- recursos nao dependem de estado invisivel do draft da turma.

## Mapa de migracao das funcoes atuais

| Funcao atual | Mora em v2 | Padrao UX | Observacao |
| --- | --- | --- | --- |
| Aulas de hoje | Hoje | row + drawer | vira rotina principal de aula/chamada |
| Fazer chamada | Hoje | `LessonDrawer` | sem wizard |
| Marcar presenca/falta | Hoje e Alunos | drawer/row | aula no contexto do dia, aluno no historico |
| Ausencia avisada | Hoje, Alunos e Pendencias | drawer/row | pode liberar vaga para reposicao/drop-in |
| Lista de turmas | Grade | table/rows | sem cards altos |
| Criar turma | Grade | drawer curto ou setup se complexo | nao abrir wizard no corpo da lista |
| Editar turma | Grade | `ClassDrawer` | dados essenciais e avancados |
| Salvar mensalidade da turma | Grade | `ClassDrawer > Financeiro` | nao input permanente por card |
| Matricular aluno na turma | Grade e Alunos | drawer | pode iniciar pela turma ou pelo aluno |
| Lista de alunos | Alunos | rows com busca/filtros | sem limite silencioso |
| Ativar/cancelar matricula | Alunos e Pendencias | row action | permissao operacional |
| Cobrar/marcar pago | Alunos e Pendencias | row action | financeiro permitido |
| Historico/evolucao | Alunos | drawer | foco tecnico e observacoes |
| Matriculas pendentes | Pendencias | operational queue | aprovar/recusar/contatar |
| Aula avulsa/drop-in | Pendencias | operational queue | aprovar/recusar/marcar pago |
| Solicitacao de reposicao | Pendencias | operational queue | agendar/recusar/contatar |
| Credito de reposicao aberto | Pendencias e Alunos | row/drawer | usar, agendar ou baixar |
| Buscar encaixe | Pendencias | drawer/sheet | ferramenta acionada, nao bloco fixo |
| Professores | Professores | rows + drawer | contato, login, agenda, comissao |
| Vincular login professor | Professores | drawer | gerar convite se necessario |
| Editar comissao | Professores | drawer | nao inline permanente |
| Horarios abertos | Configuracao | rows/calendario | data/dia explicitos |
| Disponibilidade professor/quadra | Configuracao | alternancia de visao | nao depende do draft |
| Bloqueio de horario | Configuracao | drawer/action | deve indicar conflito |
| WhatsApp | Secundario em drawers/rows | overflow/quiet | nao compete com aprovar/cobrar/chamada |

## Blocos removidos ou fundidos

Remover/fundir:

- bloco legado `Academia e aulas`;
- formularios de matricula repetidos por turma;
- formularios de mensalidade repetidos por turma;
- busca de encaixe aberta como bloco permanente;
- resumo duplicado entre central e lista abaixo;
- listas com `slice` silencioso sem contador ou expansao.

Manter:

- todas as funcoes atuais;
- todos os fluxos com persistencia real;
- permissao/plano como criterio de visibilidade;
- rotas e subvisoes canonicas da Gestao.

## Drawers v2

### `LessonDrawer`

Uso:

- chamada da aula do dia.

Conteudo:

- turma, horario, professor, quadra;
- alunos;
- status de presenca;
- faltas avisadas;
- reposicoes/drop-ins vinculados;
- observacao curta.

### `ClassDrawer`

Uso:

- detalhes e edicao da turma.

Secoes:

- Dados;
- Alunos;
- Financeiro;
- Presenca/Historico.

### `StudentDrawer`

Uso:

- contexto completo do aluno.

Secoes:

- Dados;
- Matriculas;
- Pagamentos;
- Presenca;
- Evolucao;
- Reposicoes;
- Historico.

### `FitDrawer`

Uso:

- buscar encaixe para aula avulsa ou reposicao.

Campos:

- aluno;
- tipo: aula avulsa ou reposicao;
- data/periodo;
- nivel;
- professor opcional;
- turma opcional.

### `CoachDrawer`

Uso:

- cadastro/edicao do professor.

Secoes:

- Dados;
- Turmas;
- Agenda;
- Comissao;
- Login/convite.

### `AvailabilityDrawer`

Uso:

- criar horario aberto, bloquear horario ou transformar em turma.

Campos:

- data/dia;
- professor;
- quadra;
- horario;
- capacidade;
- observacao;
- acao resultante.

## Acoes inline

Continuam inline quando forem a tarefa mais provavel:

- `Fazer chamada`;
- `Abrir aula`;
- `Ver turma`;
- `Matricular aluno`;
- `Ativar`;
- `Marcar pago`;
- `Aprovar`;
- `Recusar`;
- `Agendar reposicao`;
- `Usar reposicao`;
- `Editar professor`;
- `Ver agenda`.

Todas as demais acoes vao para drawer, overflow ou disclosure.

## Setup/wizard

Wizard permitido apenas para:

- primeira configuracao da academia;
- criacao complexa de turma quando houver muitas regras;
- importacao/migracao futura;
- configuracao estrutural rara.

Wizard proibido para:

- chamada;
- pagamento;
- aprovar pendencia;
- contato;
- edicao simples;
- rotina de secretaria.

## Suporte backend a validar

Antes de implementar cada parte, validar se a acao ja persiste de verdade.

| Acao | Suporte esperado | Decisao |
| --- | --- | --- |
| editar dados completos da turma | update em `place_academy_classes` ou RPC | validar antes de `ACADEMY-V2-02` |
| desativar/cancelar turma | campo `is_active` ja existe | usar service/RPC minimo se faltar permissao |
| trocar aluno de turma | pode exigir update em enrollment | validar impacto historico |
| ativar/cancelar matricula | `status` existe | expor acao real |
| registrar evolucao | `place_academy_progress_notes` existe | criar service se faltar |
| criar/usar/baixar credito | `place_academy_makeup_credits` existe | validar constraint e status |
| aprovar/recusar reposicao/drop-in | `place_academy_lesson_requests` existe | expor transicao real |
| marcar aula avulsa paga | `payment_status` existe | expor transicao real |
| editar professor | `place_coaches` existe | validar update/permissao |
| vincular login professor | `place_staff_invites` e `place_coaches.user_id` existem | reaproveitar convite/vinculo |
| editar comissao | `place_coaches.commission_percent` existe | editar no drawer |
| criar/cancelar horario aberto | `place_academy_slots` existe | validar status/transicao |
| transformar horario aberto em turma | slot + class | pode exigir RPC transacional minima |
| bloquear horario | `place_academy_slots.status = blocked` ou booking block | validar regra de conflito |

Regra:

```text
Nao criar acao falsa no frontend. Se nao persistir, registrar gap ou criar suporte minimo.
```

## Desktop

Desktop deve priorizar:

- lista/row principal no centro;
- drawer lateral para detalhe;
- filtros frequentes visiveis;
- filtros raros recolhidos;
- contadores compactos;
- sem scroll interno preso no header do modulo.

## Mobile

Mobile deve priorizar:

- uma tarefa por tela;
- tabs em trilho curto;
- row compacta;
- acao primaria em zona de toque;
- bottom sheet para filtros e detalhes;
- sticky action para criar/chamar/cobrar quando fizer sentido;
- sem formularios longos empilhados abaixo de cada entidade.

## Riscos de regressao

1. Fluxos legados podem depender do bloco `Academia e aulas`.
2. Mudanca de subvisao pode quebrar links existentes com `?visao=`.
3. Drawer precisa preservar permissao financeira e de professor.
4. Acoes de reposicao/aula avulsa podem ter estados parecidos, mas significados diferentes.
5. Academias grandes precisam busca/paginacao para nao esconder dados.
6. Mobile pode ficar longo se drawers virarem secoes inline.

## Plano incremental

### ACADEMY-V2-00 - Plano e suporte

Status: concluido quando este documento e a queue forem atualizados.

### ACADEMY-V2-01 - Remover duplicidade e reorganizar abas

Status: concluido em 2026-05-14.

- trocar `Turmas` por `Grade`;
- trocar `Recursos` por `Configuracao`;
- remover/fundir bloco legado;
- garantir tab adaptativa sem overflow preso.

Entregue:

- labels e rotas canonicas atualizadas;
- aliases antigos preservados;
- bloco legado desligado no workspace de Gestao;
- `Configuracao` recebeu recursos/horarios;
- busca de encaixe ficou recolhida em `Pendencias` ate virar drawer/sheet real.

### ACADEMY-V2-02 - Grade com drawer de turma

Status: concluido em 2026-05-14.

- rows de turma;
- busca/filtros;
- `ClassDrawer`;
- mensalidade e matricula fora da row principal.

Entregue:

- busca e filtros por dia/status;
- contador `Exibindo X de Y` e `Ver mais turmas`, removendo limite silencioso;
- `ClassDrawer` para dados, mensalidade, alunos e historico curto;
- edicao real da turma com suporte backend minimo (`updatePlaceAcademyClass`);
- salvar mensalidade e matricular aluno preservados dentro do drawer;
- acoes financeiras por aluno preservadas conforme permissao;
- criacao de turma recolhida em disclosure para nao poluir a Grade.

### ACADEMY-V2-03 - Alunos com drawer de aluno

- busca/filtros;
- rows sem limite silencioso;
- `StudentDrawer`;
- acoes de pagamento/presenca/evolucao.
- executado em 2026-05-14:
  - filtros por busca, turma, status, pagamento e presenca/reposicao;
  - drawer do aluno com dados/matricula, financeiro, presenca/faltas, evolucao e reposicoes/historico;
  - edicao real de matricula via `updateAcademyEnrollment(...)`;
  - ausencia avisada e evolucao sairam de controles soltos e passaram para o contexto do aluno;
  - uso/agendamento/baixa de credito de reposicao permanecem como tarefa de `Pendencias`, para nao duplicar fila operacional.

### ACADEMY-V2-04 - Pendencias e encaixe

- filas de matricula, drop-in, reposicao e creditos;
- `FitDrawer`;
- WhatsApp secundario.
- executado em 2026-05-14:
  - `Pendencias` virou fila unica com busca, filtro por tipo e filtro por status;
  - rows cobrem matricula pendente, aula avulsa/reposicao solicitada e credito de reposicao aberto;
  - `Buscar encaixe` passou a abrir drawer lateral em vez de disclosure permanente;
  - WhatsApp foi rebaixado para acao secundaria em `Mais`;
  - `PlaceAcademyFitModule` deixou de limitar pedidos e encaixes silenciosamente;
  - gap registrado: agendar reposicao de um aluno especifico ainda precisa de suporte transacional mais direto caso a secretaria precise vincular credito -> aula em um unico fluxo.

### ACADEMY-V2-05 - Hoje e chamada rapida

- rows de aula do dia;
- `LessonDrawer`;
- presenca/falta/ausencia avisada.
- executado em 2026-05-14:
  - `Hoje` passou de cards para rows operacionais sem limite silencioso;
  - cada aula abre `LessonDrawer` com resumo da aula, alunos, chamada, ausencias avisadas e reposicoes relacionadas;
  - presenca, falta e ausencia avisada ficam no contexto da aula;
  - observacao curta acompanha presenca/falta;
  - evolucao tecnica permanece em `StudentDrawer` para nao misturar chamada diaria com historico profundo.

### ACADEMY-V2-06 - Professores

- rows + `CoachDrawer`;
- comissao, login, convite e agenda;
- permissao de professor.
- executado em 2026-05-14:
  - lista de professores virou rows com busca/filtro;
  - `CoachDrawer` concentra dados, comissao, login, turmas, alunos e agenda/disponibilidade;
  - inputs permanentes de comissao/login foram removidos da row;
  - suporte real `updatePlaceCoach(...)` salva dados basicos, status e comissao;
  - especialidades/niveis ficam como gap de schema, nao como campo falso.

### ACADEMY-V2-07 - Configuracao

- quadras e horarios;
- filtro de data/dia;
- visao por professor/quadra;
- horario aberto, turma neste horario e bloqueio.
- executado em 2026-05-14:
  - `PlaceAcademyResourcesModule` virou workspace operacional de `Quadras e horarios`;
  - filtro explicito por data/dia substituiu dependencia invisivel do draft de turma;
  - alternancia `Por quadra` / `Por professor` com filtro por recurso;
  - rows mostram turmas, janelas semanais abertas, janelas convertidas e bloqueios semanais do dia de referencia;
  - conflitos de horario aparecem por recurso;
  - `Criar janela semanal` e `Bloqueio semanal` persistem em `place_academy_slots`;
  - `Criar turma` a partir de horario aberto leva para `Grade` com setup aberto e draft preenchido;
  - `createPlaceAcademySlot(...)` agora aceita `status` e `coachId` opcional para permitir bloqueio de quadra/professor.

### ACADEMY-V2-08 - QA, permissoes e backend gaps

- validar fluxos obrigatorios;
- criar suporte minimo se faltar;
- screenshots desktop/mobile;
- atualizar docs.
- executado em 2026-05-14:
  - acoes financeiras da Academia v2 permanecem condicionadas a `canManageFinance`;
  - acoes operacionais de turma, aluno, professor, chamada, aula avulsa, reposicao e horario aberto usam services reais existentes;
  - removido o cabeçalho legado `Academia e aulas` de dentro do workspace de Gestao;
  - fluxo `horario aberto -> criar turma` foi coberto posteriormente pela RPC transacional `app_create_academy_class_from_slot(...)`;
  - disponibilidade recorrente foi coberta posteriormente por decisao de usar `place_academy_slots` como escala semanal minima, sem schema paralelo;
  - `npm.cmd run lint` e `npm.cmd run build` passaram.

### ACADEMY-BE-01 - RPC transacional horario aberto -> turma

Status: concluido em 2026-05-14.

- criada migration `0076_academy_create_class_from_slot_v1.sql`;
- criada RPC `app_create_academy_class_from_slot(...)` para converter `place_academy_slots.open` em `place_academy_classes` + `slot.assigned` na mesma transacao;
- a RPC valida permissao de gestor, local, status `open` e correspondencia entre slot selecionado e dados da turma;
- conflitos continuam protegidos pelos triggers existentes de professor, quadra e reserva;
- frontend usa RPC apenas quando houver `slotId`;
- fluxo normal de criar turma sem slot permanece separado;
- feedback de sucesso parcial foi removido desse fluxo: ou converte tudo, ou nada parcial persiste.

### ACADEMY-BE-02 - Reposicao especifica por secretaria

Status: concluido em 2026-05-14.

- criada migration `0077_academy_admin_schedule_makeup_v1.sql`;
- criada RPC `app_admin_schedule_academy_makeup_credit(...)` para vincular credito de reposicao de um aluno especifico a turma/data;
- o fluxo nao depende mais do usuario logado como dono do credito;
- `Pendencias` abre o `FitDrawer` com o credito selecionado e o drawer mostra contexto do aluno;
- a acao primaria vira `Agendar reposicao`, nao `Solicitar`;
- a RPC cria uma solicitacao aprovada `request_type = makeup`, pagamento `waived`, usa o credito e, quando houver ausencia aberta, marca a ausencia como usada;
- preservada a diferenca entre `reposicao aberta`, `solicitacao de reposicao` e `aula avulsa/drop-in`.

### ACADEMY-BE-03 - Disponibilidade recorrente

- concluido em 2026-05-14;
- decisao: nao criar tabela nova nesta rodada, porque `place_academy_slots` ja cobre a escala semanal recorrente minima com `weekday`, professor, quadra, inicio, fim, status e observacao;
- `PlaceAcademyResourcesModule` deixou de comunicar o fluxo como data pontual e passou a usar `Escala semanal`, `Data de referencia`, `Janela semanal aberta`, `Janela convertida` e `Bloqueio semanal`;
- bloqueios criados neste modelo sao semanais. Bloqueio pontual por data/vigencia permanece como gap futuro, caso QA real mostre necessidade;
- busca de encaixe e criacao de turma continuam usando o modelo existente, sem duplicar disponibilidade em tabela paralela.

### ACADEMY-BE-04 - Professor avancado

- concluido em 2026-05-14;
- criada migration `0078_academy_coach_profile_fields_v1.sql`;
- `place_coaches` recebeu `specialties`, `level_scopes`, `public_bio`, `internal_notes` e `public_profile_enabled`;
- leitura completa de `place_coaches` foi restringida ao contexto de gestao da academia para proteger observacoes internas;
- `CoachDrawer` agora edita os campos avancados reais em `Perfil operacional`;
- cadastro rapido de professor continua simples: nome, telefone e email;
- comissao continua separada e condicionada a permissao financeira;
- disponibilidade continua representada por `place_academy_slots`/escala semanal, sem duplicar modelo dentro do professor.

## Checklist de validacao

- secretaria faz chamada da aula do dia;
- secretaria aprova aula avulsa;
- secretaria usa credito de reposicao;
- secretaria agenda solicitacao de reposicao;
- secretaria matricula aluno em turma;
- financeiro marca mensalidade paga;
- financeiro envia lembrete;
- gestor altera mensalidade da turma;
- gestor cadastra professor;
- gestor vincula login do professor;
- gestor edita comissao;
- professor ve sua agenda/turmas;
- gestor cria horario aberto;
- gestor transforma horario aberto em turma;
- aluno aparece com historico/evolucao;
- busca de encaixe nao polui fila principal;
- bloco legado nao duplica conteudo;
- filtros nao escondem dados sem aviso;
- estados vazios orientam proxima acao.

## Referencias operacionais consideradas

Padroes extraidos de boas praticas de softwares de clube/aulas:

- agenda visual para reservas, aulas e eventos;
- separacao entre players/membros, staff/professores, pagamentos e programas;
- regras por papel/tipo de membro;
- foco em rows/tabelas para volume operacional;
- setup guiado para configuracao, nao para rotina diaria.

Este plano nao copia layout externo. Ele traduz os padroes para a gramatica ATP documentada.
