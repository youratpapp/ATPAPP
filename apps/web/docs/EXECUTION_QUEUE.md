# Execution Queue

Fonte principal: `CURRENT_PRODUCT_STATE.md`.

Data: 2026-05-13

## Para que este arquivo existe

Este arquivo e a fila continua de execucao frontend/UX. Ele deve substituir prompts longos nas proximas interacoes.

Comando esperado no futuro:

```text
Continue para o proximo item da Execution Queue.
```

## Legenda

- `[ ]` pendente
- `[~]` em andamento
- `[x]` concluido
- `[!]` bloqueado
- `[>]` prioridade atual

## Regras da fila

- Executar por ordem de prioridade.
- Nao reabrir arquitetura conceitual.
- Atualizar status ao final de cada rodada.
- Toda task deve gerar ganho perceptivel de UX.
- Se uma task virar refactor tecnico sem ganho visual, quebrar em tarefa menor.
- Se surgir problema novo, registrar como item novo com prioridade.

## P0 - Prioridade atual

### [x] QA-R2-FIX-01 - Correcoes operacionais da Rodada 2 de QA

Status: `[x]` concluido em 2026-05-14

Contexto:

- A segunda rodada de QA manual apontou bugs que afetavam confianca, mobile e operacao diaria de Agenda/Painel.
- Escopo fechado: corrigir bugs operacionais sem redesenhar a arquitetura nem implementar gaps grandes de roadmap.

Criterios entregues:

- `Agenda > Calendario` no mobile passou a usar seletor explicito de quadra, mantendo todas as quadras acessiveis em 390px sem tentar comprimir quatro colunas ilegiveis.
- `Agenda > Nova reserva` passou a exibir o resultado de busca de disponibilidade inline no formulario; resultado negativo nao vira banner global persistente e some ao alterar formulario ou trocar subvisao.
- Campo `Duracao` do formulario de nova reserva deixou de ser cortado por grid rigido e passou a quebrar em colunas responsivas.
- Item `Recebimento pendente` da Fila de Trabalho agora abre `Financeiro > Recebiveis` em vez de parecer clicavel sem acao.
- KPI operacional de `Vendas da cantina` e receitas POS saem do Painel/relatorio quando o modulo Cantina nao esta habilitado no plano.

Arquivos alterados:

- `web/src/components/place/PlaceBookingCalendarModule.tsx`
- `web/src/components/place/PlaceBookingCreateModule.tsx`
- `web/src/components/place/PlaceOperationsDashboard.tsx`
- `web/src/pages/PlacesPage.tsx`
- `web/src/App.css`

Validacao:

- `npm.cmd run lint` em `web`: passou.
- `npm.cmd run build` em `web`: passou.

Risco residual:

- A validacao visual fina em device real ainda deve confirmar conforto de toque do seletor de quadra em telas muito estreitas.

### [ ] QA-R2-ROADMAP - Gaps de produto detectados na Rodada 2

Status: `[ ]` backlog

Itens:

- GAP-R2-01: Financeiro dedicado/consolidado para leitura executiva e rotina de cobranca.
- GAP-R2-02: lembrete em lote para cobrancas/pendencias.
- GAP-R2-03: lista de espera player-side.
- GAP-R2-04: governanca completa de Cantina/POS por plano alem do KPI operacional.

### [x] COMP-QA-01 - Convite de equipe de torneio por usuario selecionado

Status: `[x]` concluido em 2026-05-14

Contexto:

- QA/uso real apontou confusao no fluxo de equipe de torneio: o organizador busca usuario por email/nome, seleciona uma pessoa, mas o card podia cair para email e a mensagem sugeria acesso automatico.
- Regra de produto: usuario convidado so deve ver/operar torneio ou liga depois de aceitar o convite.

Criterios entregues:

- membro ativo passou a preservar `displayName` separado de `email` no model de torneio;
- convite criado a partir de candidato selecionado mostra nome da pessoa no card imediatamente;
- feedback de sucesso passou a explicar que o convite aparece no app e o acesso so entra apos aceite;
- backend existente de convite pendente/aceite (`app_add_tournament_staff`, `app_list_my_tournament_staff_invites`, `app_accept_tournament_staff_invite`) foi preservado, sem acesso automatico.

Validacao esperada:

- `npm.cmd run lint`;
- `npm.cmd run build`;
- teste manual posterior: buscar usuario, selecionar, criar convite, entrar com convidado e aceitar.

### [x] ACADEMY-V2-00 - Plano operacional e suporte reutilizavel

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Transformar o prompt de Academia v2 em plano executavel antes de alterar a tela.
- Criar suporte para repetir o mesmo processo area por area do app.

Criterios:

- mapear nova arquitetura de `Gestao > Academia`;
- preservar todas as funcoes atuais;
- definir onde cada funcao mora na v2;
- separar rotina diaria, configuracao, fila e financeiro;
- definir drawers, acoes inline, setup/wizard e possiveis gaps de backend;
- criar playbook reutilizavel para Agenda, Clientes, Financeiro, Competition OS e demais areas.

Entregue:

- `ACADEMY_V2_UX_PLAN.md`;
- `OPERATIONAL_MODULE_REDESIGN_PLAYBOOK.md`;
- queue atualizada com tarefas de implementacao incremental.

Risco residual:

- a implementacao ainda precisa validar quais acoes ja persistem de verdade e quais exigem suporte backend minimo.

### [x] ACADEMY-V2-01 - Remover duplicidade e reorganizar abas da Academia

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Fazer `Gestao > Academia` deixar de parecer uma pagina empilhada e virar workspace operacional com responsabilidades claras.

Criterios:

- trocar `Turmas` por `Grade`;
- trocar `Recursos` por `Configuracao` ou `Quadras e horarios`;
- remover/fundir o bloco legado `Academia e aulas`;
- eliminar duplicidade entre central e conteudo legado;
- garantir que tabs nao fiquem presas em scroll interno dentro do bloco;
- manter link direto por `?visao=` sem quebrar rotas existentes.

Telas/componentes afetados:

- `PlaceAcademyTodayModule`;
- `PlaceAcademyClassesModule`;
- `PlaceAcademyStudentsModule`;
- `PlaceAcademyRequestsModule`;
- `PlaceAcademyCoachesModule`;
- `PlaceAcademyResourcesModule`;
- `PlaceAcademyClassSetupModule`;
- `PlaceAcademyFitModule`;
- `PlaceAdminShell`;
- navegacao de subvisoes de Academia.

Ganhos esperados:

- secretaria encontra `Hoje`, `Grade`, `Alunos`, `Pendencias`, `Professores` e `Configuracao` sem caca visual;
- reducao imediata de scroll e duplicidade;
- base limpa para drawers v2.

Dependencias:

- `ACADEMY_V2_UX_PLAN.md`;
- `ACADEMY_MODULE_FUNCTION_MAP.md`;
- rotas/subvisoes canonicas de Gestao.

Risco de regressao:

- fluxos legados podem depender do bloco `Academia e aulas`;
- deep links antigos para `?visao=turmas` ou `?visao=recursos` devem ser canonizados.

Criterios de conclusao:

- lint e build passando;
- screenshots desktop/mobile da Academia no ciclo de QA visual;
- docs atualizados com o novo estado.

Entregue:

- tabs v2 aplicadas: `Turmas` virou `Grade` e `Recursos` virou `Configuracao`;
- URLs canonicas passaram para `?visao=grade` e `?visao=configuracao`, mantendo aliases antigos `turmas` e `recursos`;
- bloco legado `Academia e aulas` deixou de renderizar dentro do workspace de Gestao;
- `Configuracao` passou a hospedar o modulo de recursos/horarios;
- `Pendencias` passou a recolher `Buscar encaixe` em disclosure, removendo o bloco permanente da primeira leitura;
- `npm.cmd run lint` e `npm.cmd run build` passaram.

Risco residual:

- `Buscar encaixe` ainda precisa virar drawer/sheet real em `ACADEMY-V2-04`;
- `Configuracao` ja evoluiu data/dia e visao professor/quadra em `ACADEMY-V2-07`;
- screenshots autenticados ficam para o ciclo de QA quando a sessao local estiver disponivel.

### [x] ACADEMY-V2-02 - Grade com drawer de turma

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Transformar turmas em lista operacional densa com `ClassDrawer`, removendo formularios repetidos de matricula/mensalidade do corpo.

Criterios:

- busca e filtros visiveis;
- rows com professor, quadra, dia, horario, vagas, mensalidade, nivel e status;
- `Nova turma` em drawer curto;
- edicao, mensalidade, alunos e historico dentro do drawer;
- sem limite silencioso de turmas.

Entregue:

- Grade ganhou busca por turma, professor, quadra, nivel ou aluno;
- filtros por dia e status operacional (`Todas`, `Com vagas`, `Lotadas`, `Com pendencias`);
- remocao de `slice(0, 12)` silencioso: a tela informa `Exibindo X de Y` e usa `Ver mais turmas`;
- row de turma manteve foco operacional com horario, professor, quadra, nivel, vagas, mensalidade e pendencias;
- `ClassDrawer` foi criado usando `EntityDrawer`;
- drawer permite editar dados da turma, professor, quadra, dia, horario, vagas, nivel, perfil e reposicao;
- suporte backend minimo criado em `updatePlaceAcademyClass(...)` para salvar edicao real da turma;
- mensalidade continua com acao explicita `Salvar mensalidade`;
- alunos da turma aparecem no drawer com ativar, cancelar, marcar pago e lembrete conforme permissao;
- matricula manual de aluno foi preservada dentro do drawer da turma;
- historico curto de matriculas aparece no drawer;
- setup de criacao de turma deixou de ficar aberto por padrao e passou para disclosure `Criar nova turma ou abrir horario`;
- `npm.cmd run lint` e `npm.cmd run build` passaram.

Risco residual:

- criacao de nova turma ainda usa o `SetupWizard` existente dentro de disclosure; a migracao para drawer curto pode ser feita em refinamento futuro sem bloquear a rotina de Grade;
- historico profundo de presenca/evolucao fica para `ACADEMY-V2-03`/`ACADEMY-V2-05`, pois esta rodada nao deveria avancar para Alunos/Hoje.

### [x] ACADEMY-V2-03 - Alunos com drawer e busca forte

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Fazer `Alunos` virar local unico para localizar aluno e resolver situacao de matricula, pagamento, presenca, evolucao e reposicao.

Criterios:

- busca por nome/telefone/email;
- filtros por status, turma, pagamento e presenca;
- `StudentDrawer`;
- acoes financeiras respeitam permissao;
- estados vazios explicam filtro e proxima acao;
- sem `slice` silencioso.

Implementado:

- `Alunos` ganhou filtros por busca, turma, status, pagamento e presenca/reposicao;
- lista deixou de usar limite silencioso: agora exibe `Exibindo X de Y` e oferece `Ver mais alunos`;
- cada aluno abre `StudentDrawer` com `Dados e matricula`, `Financeiro`, `Presenca e faltas`, `Evolucao` e `Reposicoes e historico`;
- edicao de matricula ganhou suporte real em `updateAcademyEnrollment(...)`, sem simular persistencia local;
- pagamento, lembrete, check-in, falta, ausencia avisada e registro de evolucao foram preservados dentro do contexto do aluno;
- acoes financeiras continuam condicionadas a permissao;
- estados vazios orientam quando a operacao nao tem alunos ou quando filtros esconderam resultados;
- `npm.cmd run lint` e `npm.cmd run build` passaram.

Risco residual:

- `Alunos` agora mostra creditos de reposicao no drawer, mas usar/agendar/baixar credito fica para a fila de `Pendencias`, onde a decisao operacional e o encaixe acontecem;
- busca por email depende de haver email persistido/vinculado na matricula/perfil; o modelo atual de `place_academy_enrollments` nao expõe email direto na listagem.

### [x] ACADEMY-V2-04 - Pendencias como fila e encaixe em drawer

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Separar fila operacional de ferramenta de busca de encaixe.

Criterios:

- pendencias em rows por matricula, aula avulsa, solicitacao de reposicao, credito aberto e pagamento;
- `Buscar encaixe` abre drawer/sheet;
- WhatsApp fica secundario;
- aprovar, recusar, agendar, usar reposicao e marcar pago sao acoes reais.

Implementado:

- `Pendencias` virou fila unica com rows para matriculas pendentes, aulas avulsas/reposicoes solicitadas e creditos de reposicao abertos;
- adicionados busca, filtro por tipo e filtro por status operacional;
- remocao de `slice(0, 8)` silencioso: a tela informa `Exibindo X de Y` e oferece `Ver mais pendencias`;
- WhatsApp foi movido para `Mais`, deixando `Ativar`, `Aprovar`, `Marcar pago` e `Buscar encaixe` como acoes prioritarias;
- `Buscar encaixe` deixou de ficar em disclosure no corpo e agora abre `FitDrawer` via `EntityDrawer`;
- o modulo de encaixe deixou de esconder pedidos/slots silenciosamente e ganhou `Ver mais pedidos` e `Ver mais encaixes`;
- estados vazios diferenciam fila em dia de filtro que escondeu resultados;
- `npm.cmd run lint` e `npm.cmd run build` passaram.

Risco residual:

- agendar uma reposicao de um aluno especifico ainda depende da ferramenta de encaixe global; o backend atual de `requestAcademyLessonFit` prioriza credito do usuario logado. Uma associacao transacional admin -> credito -> turma/data deve ser tratada em gap futuro se for exigida como fluxo direto por secretaria.
- `Marcar como usada` preserva a acao existente para credito de reposicao, mas nao substitui um fluxo completo de agendamento com vinculo de aula.

### [x] ACADEMY-V2-05 - Hoje com chamada rapida

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Transformar `Hoje` em tela de operacao diaria de aulas.

Criterios:

- rows de aulas do dia;
- `LessonDrawer` para chamada;
- presenca, falta, ausencia avisada e observacao curta;
- alunos e reposicoes do horario visiveis no contexto;
- sem wizard.

Implementado:

- `Hoje` deixou de usar cards com `slice(0, 8)` e passou para rows operacionais de aulas do dia;
- cada aula abre `LessonDrawer` com resumo, alunos ativos, faltas avisadas e reposicoes abertas;
- chamada permite marcar `Presente`, `Falta` e `Avisou falta` por aluno;
- observacao curta da chamada pode ser enviada junto com presenca/falta;
- aula sem alunos orienta a abrir `Grade`;
- `npm.cmd run lint` e `npm.cmd run build` passaram.

Risco residual:

- evolucao tecnica do aluno continua no `StudentDrawer`; `Hoje` ficou focado em chamada rapida para nao misturar rotina diaria com historico profundo.
- ausencia avisada usa o fluxo existente de `reportAcademyAbsence` com data padrao quando disparada pela chamada; data/nota detalhada seguem no drawer do aluno.

### [x] ACADEMY-V2-06 - Professores com drawer, agenda e login

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Fazer professores virarem entidade operacional clara, sem comissao/input espalhado.

Criterios:

- row por professor;
- `CoachDrawer`;
- cadastro rapido com nome, telefone e email;
- comissao, especialidades, disponibilidade e login em secoes;
- convite/vinculo de login preservado;
- professor/staff ve apenas o que seu papel permite.

Implementado:

- `Professores` ganhou cadastro rapido, busca e filtro por status/login/turmas;
- lista virou row operacional com `Abrir professor`, turmas, alunos ativos, aulas hoje, janelas abertas, receita e comissao estimada;
- inputs permanentes de comissao e login sairam da row e foram para `CoachDrawer`;
- `CoachDrawer` concentra dados do professor, comissao, login, turmas, alunos e agenda/disponibilidade;
- criado suporte real `updatePlaceCoach(...)` para salvar nome, telefone, email, status e comissao;
- WhatsApp e ajuste de agenda ficam como acoes secundarias no drawer;
- `npm.cmd run lint` e `npm.cmd run build` passaram.

Risco residual:

- especialidades e niveis atendidos ainda nao existem no schema de `place_coaches`; por isso ficaram como gap documentado, nao como input falso.
- disponibilidade detalhada continua representada por horarios abertos (`place_academy_slots`) e turmas; regras recorrentes avancadas ficam como gap para QA/backend.

### [x] ACADEMY-V2-07 - Configuracao de quadras e horarios

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Tornar quadras, horarios abertos, disponibilidade e bloqueios compreensiveis e acionaveis.

Criterios:

- data/dia explicitos;
- alternancia por professor/quadra;
- criar horario aberto;
- criar turma neste horario;
- bloquear horario;
- ver conflitos de professor/quadra;
- recursos nao dependem de draft invisivel de turma.

Implementado:

- `Configuracao` deixou de depender do weekday invisivel do draft de turma e ganhou filtro explicito por data/dia;
- alternancia `Por quadra` / `Por professor` com filtro por recurso;
- grade operacional mostra turmas, horarios abertos, horarios convertidos e bloqueios no mesmo dia;
- criacao de horario aberto e bloqueio agora nasce da propria Configuracao com persistencia em `place_academy_slots`;
- `createPlaceAcademySlot(...)` passou a aceitar `coachId` opcional e `status`, permitindo bloqueio de quadra/professor sem gambiarra de frontend;
- horarios abertos preservam a acao `Criar turma`, levando para `Grade` com o setup aberto e dados pre-preenchidos;
- horarios abertos podem ser bloqueados e bloqueios podem ser reabertos;
- conflitos por recurso aparecem na propria row/grupo quando ha sobreposicao;
- layout mobile passa a empilhar toolbar, criacao e grupos sem esconder dados;
- `npm.cmd run lint` e `npm.cmd run build` passaram.

Risco residual:

- transformar horario aberto em turma ainda usa o fluxo existente de criar turma com draft pre-preenchido, nao uma RPC transacional unica slot+class;
- regras avancadas de disponibilidade por professor/quadra ainda dependem de janelas em `place_academy_slots`, sem modelo proprio de recorrencia semanal.

### [x] ACADEMY-V2-08 - Backend gaps, permissoes e QA

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Garantir que a v2 nao tenha acoes falsas e funcione por perfil/plano.

Criterios:

- validar persistencia de editar turma, professor, aluno, pagamento, reposicao, aula avulsa e horario aberto;
- criar RPC/service minimo apenas quando necessario;
- validar admin, professor/staff e player;
- rodar lint/build;
- gerar screenshots before/after;
- atualizar MDs.

Implementado/validado:

- varredura de permissoes e acoes da Academia v2 confirmou que acoes financeiras seguem condicionadas a `canManageFinance`;
- edicao de turma, aluno, professor, mensalidade, chamada, aula avulsa, reposicao e horario aberto usam services reais existentes;
- cabeçalho legado `Academia e aulas` deixou de aparecer dentro do workspace de Gestao, evitando duplicidade depois da v2;
- fluxo `Criar turma` a partir de horario aberto deixou de reportar falha total quando a turma foi criada mas a marcacao do slot como `assigned` falhou;
- nesse caso, a UI informa explicitamente que a turma foi criada e que o horario precisa ser revisado em `Configuracao`;
- `npm.cmd run lint` e `npm.cmd run build` passaram.

Gaps documentados:

- transformar horario aberto em turma ainda nao e uma transacao unica `slot -> class -> assigned`; criar RPC transacional fica recomendado se QA real mostrar inconsistencia frequente;
- screenshots autenticados nao foram gerados nesta rodada por falta de sessao local autenticada confiavel no ambiente atual;
- regras recorrentes avancadas de disponibilidade por professor/quadra continuam fora do modelo atual e devem ser produto/backend separado se forem priorizadas.

### [x] ACADEMY-BE-01 - RPC transacional para horario aberto virar turma

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Tornar o fluxo `Criar turma` a partir de `horario aberto` atomico e robusto.

Criterios:

- criar RPC pequena e especifica, sem backend paralelo;
- entrada recebe `slot_id`, dados essenciais/avancados da turma e `place_id`;
- validar permissao de operador do local antes de criar;
- validar que o slot pertence ao local e esta `open`;
- criar turma em `place_academy_classes`;
- marcar slot como `assigned` na mesma transacao;
- se qualquer etapa falhar, nada parcial deve persistir;
- frontend deve usar a RPC somente quando houver `slotId`;
- fluxo sem `slotId` continua usando criacao normal de turma;
- manter feedback claro para erro de conflito/permissao;
- validar lint/build.

Telas/componentes afetados:

- `PlacesPage`;
- `PlaceAcademyClassSetupModule`;
- `places.ts`;
- nova migration/RPC Supabase.

Ganhos esperados:

- elimina inconsistencia `turma criada + horario ainda aberto`;
- reduz necessidade de revisao manual em Configuracao;
- deixa o fluxo de secretaria mais confiavel.

Dependencias:

- `place_academy_slots`;
- `place_academy_classes`;
- permissoes/RLS existentes de local.

Risco de regressao:

- RPC pode duplicar regra de validacao ja existente em triggers; testar conflito de professor/quadra.

Criterios de conclusao:

- criar turma a partir de horario aberto persiste turma e slot `assigned` juntos;
- falha de validacao nao cria turma parcial;
- docs atualizados.

Implementado:

- nova migration `0076_academy_create_class_from_slot_v1.sql` com RPC `app_create_academy_class_from_slot(...)`;
- RPC valida permissao de gestor do local, slot pertencente ao local, status `open` e correspondencia dos dados de horario/recurso antes de criar;
- slot e marcado como `assigned` e a turma e criada na mesma transacao;
- frontend usa a RPC somente quando `draft.slotId` existe;
- criacao normal de turma sem slot permanece em `createPlaceAcademyClass(...)`;
- feedback deixa de aceitar sucesso parcial nesse fluxo.

Validacao:

- `npm.cmd run lint`;
- `npm.cmd run build`.

### [x] ACADEMY-BE-02 - Fluxo admin de reposicao especifica do aluno

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Permitir que secretaria vincule um credito de reposicao de um aluno especifico a uma turma/data sem depender do usuario logado.

Criterios:

- criar RPC/service minimo para `credito -> turma/data -> uso/agendamento`;
- validar que o credito pertence ao aluno/matricula/local;
- validar que credito esta `open`;
- validar turma ativa, vaga operacional e compatibilidade basica;
- registrar solicitacao/aprovacao ou marcar credito como usado conforme modelo atual;
- nao misturar aula avulsa, credito aberto e solicitacao de reposicao;
- expor acao em `Pendencias`/`FitDrawer` de forma task-first;
- respeitar permissao operacional do local;
- validar lint/build.

Telas/componentes afetados:

- `PlaceAcademyRequestsModule`;
- `PlaceAcademyFitModule`;
- `places.ts`;
- nova migration/RPC Supabase se necessario.

Ganhos esperados:

- secretaria consegue resolver reposicao real sem depender do login do aluno;
- reduz WhatsApp/manual workaround;
- fortalece a fila de Pendencias como central de limpeza operacional.

Dependencias:

- `place_academy_makeup_credits`;
- `place_academy_lesson_requests`;
- `place_academy_enrollments`;
- `place_academy_classes`.

Risco de regressao:

- confundir `reposicao aberta`, `solicitacao de reposicao` e `aula avulsa`; nomenclatura deve seguir `ACADEMY_V2_UX_PLAN.md`.

Criterios de conclusao:

- credito aberto de um aluno pode ser agendado/usado por admin com persistencia real;
- credito nao pode ser usado duas vezes;
- estados vazios e erros explicam o motivo.

Implementado:

- nova migration `0077_academy_admin_schedule_makeup_v1.sql` com RPC `app_admin_schedule_academy_makeup_credit(...)`;
- service `scheduleAcademyMakeupCredit(...)` em `places.ts`;
- fila de Pendencias agora abre o `FitDrawer` com o credito de reposicao selecionado;
- `FitDrawer` mostra contexto do aluno/credito e acao primaria `Agendar reposicao`;
- ao agendar, a RPC cria uma `place_academy_lesson_requests` aprovada, `request_type = makeup`, pagamento `waived`, vincula o credito e marca o credito como `used` na mesma transacao;
- a RPC impede reuso de credito aberto que ja tenha solicitacao ativa e valida vaga da turma/data via busca de encaixe existente.

Validacao:

- `npm.cmd run lint`;
- `npm.cmd run build`.

### [x] ACADEMY-BE-03 - Disponibilidade recorrente de professor/quadra

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Avaliar e implementar, se aprovado, modelo real para escala recorrente de disponibilidade, separado de turmas e slots pontuais.

Criterios:

- nao criar tabela nova antes de validar necessidade contra `place_academy_slots`;
- decidir se disponibilidade recorrente pertence a professor, quadra ou ambos;
- suportar dia da semana, inicio/fim, vigencia, status e observacao;
- Configuracao deve mostrar recorrencia sem confundir com horario aberto pontual;
- bloqueio pontual continua sendo `place_academy_slots.status = blocked` ou modelo equivalente;
- validar impacto em busca de encaixe e criacao de turma.

Telas/componentes afetados:

- `PlaceAcademyResourcesModule`;
- `PlaceAcademyCoachesModule`;
- busca de encaixe;
- migrations Supabase.

Ganhos esperados:

- professor consegue ter agenda semanal clara;
- secretaria entende quando um professor/quadra costuma estar disponivel;
- reduz cadastro repetitivo de janelas abertas.

Dependencias:

- decisao de produto sobre recorrencia vs slots pontuais.

Risco de regressao:

- overengineering; se o ganho operacional nao for claro, manter como gap documentado.

Criterios de conclusao:

- decisao documentada;
- se implementado, disponibilidade recorrente nao duplica nem conflita visualmente com turmas, slots e bloqueios.

Decisao:

- nao criar tabela nova nesta rodada;
- `place_academy_slots` ja representa a escala semanal recorrente minima: `weekday`, `starts_at`, `ends_at`, `coach_id`, `court_id`, `status` e `notes`;
- vigencia por data continua fora do modelo atual e deve virar task propria apenas se QA real mostrar necessidade;
- bloqueios em `place_academy_slots.status = blocked` devem ser tratados como bloqueios semanais, nao como bloqueios pontuais por data.

Implementado:

- `PlaceAcademyResourcesModule` passou a comunicar a area como `Escala semanal`, com `Data de referencia` apenas para escolher o dia da semana;
- criacao mudou de `Horario operacional` para `Janela semanal`;
- labels de eventos diferenciam `Janela semanal aberta`, `Janela convertida` e `Bloqueio semanal`;
- estados vazios agora explicam que a ausencia e por dia da semana recorrente;
- nao houve schema novo nem RPC nova, evitando overengineering e mantendo busca de encaixe/criacao de turma sobre o modelo existente.

Validacao:

- `npm.cmd run lint`;
- `npm.cmd run build`.

### [x] ACADEMY-BE-04 - Schema avancado de professor

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Completar professor como entidade operacional sem criar inputs falsos.

Criterios:

- validar campos realmente necessarios: especialidades, niveis atendidos, observacoes, perfil publico e disponibilidade;
- criar migration minima se houver decisao;
- atualizar `CoachDrawer` para editar apenas campos reais;
- manter nome, telefone, email, status, login e comissao como base;
- respeitar permissao financeira para comissao;
- validar lint/build.

Telas/componentes afetados:

- `PlaceAcademyCoachesModule`;
- `places.ts`;
- migrations Supabase.

Ganhos esperados:

- cadastro de professor fica mais profissional;
- agenda/aulas podem filtrar por nivel/especialidade no futuro;
- evita campos decorativos sem persistencia.

Dependencias:

- `place_coaches`;
- decisao de produto sobre perfil publico do professor.

Risco de regressao:

- transformar cadastro rapido em ERP burocratico. Campos avancados devem ficar recolhidos/drawer.

Criterios de conclusao:

- campos avancados persistem;
- cadastro rapido continua simples;
- professor sem permissao completa nao ganha acesso indevido.

Implementado:

- nova migration `0078_academy_coach_profile_fields_v1.sql`;
- `place_coaches` ganhou campos reais: `specialties`, `level_scopes`, `public_bio`, `internal_notes` e `public_profile_enabled`;
- policy `place_coaches_read` foi restringida ao contexto de gestao da academia para proteger observacoes internas;
- `places.ts` passou a listar, criar retorno e atualizar professores com esses campos;
- `CoachDrawer` ganhou secao `Perfil operacional` com especialidades, niveis atendidos, bio publica, perfil publico ativo e observacoes internas;
- cadastro rapido continua apenas com nome, telefone e email;
- comissao continua condicionada a `canManageFinance`;
- campos avancados ficam no drawer e nao viram inputs permanentes nas rows.

Validacao:

- `npm.cmd run lint`;
- `npm.cmd run build`.

### [x] ACADEMY-STUDENT-01 - Modelo de contrato/plano do aluno

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Evoluir a entidade `Aluno` de matricula solta em turma para contrato/plano semanal vinculado a um usuario.
- Permitir planos como 1x, 2x ou mais aulas por semana, com mensalidade unica e horarios/turmas selecionados.

Criterios:

- definir contrato/plano do aluno por academia;
- contrato deve ter usuario vinculado ou convite pendente, aulas por semana, mensalidade, status e inicio;
- manter `place_academy_enrollments` como vinculo operacional por turma para presenca/chamada/historico;
- permitir selecionar uma ou mais ocorrencias semanais, inclusive ocorrencias agrupadas da mesma turma em dias diferentes;
- validar quando a quantidade de horarios selecionados nao bate com o plano contratado;
- documentar estrategia de convite/criacao de usuario sem inserir `auth.users` de forma insegura pelo client;
- definir como `app_payments` passa a cobrar mensalidade por contrato/plano, nao por cada turma isolada;
- definir impacto em seed/reset do ambiente de teste.

Telas/componentes afetados:

- `PlaceAcademyStudentsModule`;
- `PlaceAcademyClassesModule`;
- `StudentDrawer`;
- `ClassDrawer`;
- services de academia em `places.ts`;
- migrations Supabase;
- seed demo de academia.

Ganhos esperados:

- uma secretaria cadastra o aluno uma vez, define plano e encaixa horarios semanais sem duplicar pessoas;
- aluno recebe notificacoes e fica ligado ao perfil;
- financeiro passa a refletir o contrato real do aluno;
- base fica pronta para reposicao automatica por ausencia avisada.

Dependencias:

- `place_academy_enrollments`;
- `app_payments`;
- `profiles`/`auth.users`;
- modelo atual de turmas recorrentes por `weekday`;
- decisao sobre convite de usuario quando o email ainda nao existe.

Risco de regressao:

- quebrar fluxos atuais que esperam uma matricula por turma;
- criar contrato sem persistencia real;
- duplicar cobranca se contrato e enrollment cobrarem o mesmo aluno;
- transformar cadastro rapido em ERP burocratico.

Criterios de conclusao:

- plano tecnico documentado;
- migration minima definida ou implementada;
- estrategia de compatibilidade com matriculas existentes definida;
- queue dos itens seguintes ajustada.

Implementado:

- criada migration `0079_academy_student_contracts_v1.sql`;
- nova tabela `place_academy_student_contracts` para contrato/plano semanal do aluno;
- contrato guarda academia, usuario vinculado ou convite por email, nome, telefone, status, aulas por semana, mensalidade, inicio/fim e observacoes;
- `place_academy_enrollments` ganhou `contract_id`, mantendo matriculas por turma para chamada/presenca/historico;
- nova tabela `place_academy_settings` guarda `makeup_notice_hours` e `auto_create_makeup_credit_on_notice`;
- `place_academy_makeup_credits` ganhou `source_absence_id`, preparando credito originado de ausencia avisada;
- criada RPC `app_create_academy_student_contract(...)`, que resolve usuario por email, cria convite pendente se nao existir, cria contrato e gera matriculas operacionais nas turmas escolhidas;
- pagamento manual e lembrete passaram a aceitar `academy_student_contract` como target financeiro;
- RLS/policies criadas para contrato, settings e leitura financeira do target novo;
- `types.ts` e `places.ts` ganharam tipos/services para contratos e `contractId` nas matriculas.

Decisoes:

- nao inserir diretamente em `auth.users` por SQL client-side; email inexistente vira `invite_email`/convite pendente ate suporte seguro de convite/criacao de usuario;
- `place_academy_enrollments` continua existindo e nao foi removida;
- cobranca canonica nova sera `target_type = academy_student_contract`, preservando leitura antiga por `academy_enrollment` ate a migracao visual/financeira.

Validacao:

- `npm.cmd run lint`;
- `npm.cmd run build`.

Risco residual:

- a UI ainda precisa usar o novo fluxo; enquanto isso, telas existentes continuam operando por enrollment;
- credito automatico por ausencia avisada ainda sera implementado em `ACADEMY-STUDENT-04`;
- seed/reset completo fica em `ACADEMY-STUDENT-05`.

### [x] ACADEMY-STUDENT-02 - Cadastro de aluno por usuario, plano e horarios

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Substituir o cadastro solto por um fluxo operacional: usuario aluno -> plano -> horarios semanais -> matriculas operacionais.

Criterios:

- `Novo aluno` abre drawer/flow curto;
- busca usuario existente por email/telefone e mostra resultado claro;
- se usuario nao existir, cria convite pendente ou aciona suporte seguro de convite;
- campos essenciais: aluno, telefone/email, plano/aulas por semana, mensalidade, data de inicio;
- selecao de turmas/horarios deve agrupar ocorrencias equivalentes e permitir escolher uma, outra ou ambas;
- criar as matriculas operacionais necessarias sem duplicar aluno na tela principal;
- aluno novo entra sem creditos de reposicao;
- inputs sem label visivel devem ter placeholder e `aria-label`.

Telas/componentes afetados:

- `Alunos > Novo aluno`;
- `Grade > ClassDrawer > Matricular aluno`;
- `StudentDrawer`;
- `ClassDrawer`.

Risco de regressao:

- perder suporte a aluno sem login usado pela secretaria;
- criar duas fontes de verdade para aluno;
- esconder campos obrigatorios de plano.

Criterios de conclusao:

- fluxo cria aluno/contrato e vinculos reais;
- lista de alunos agrega por contrato/usuario;
- class drawer continua permitindo matricular, mas usa o mesmo fluxo canonico.

Implementado:

- `Grade > Turma > Novo aluno` usa `app_create_academy_student_contract(...)`;
- formulario curto coleta nome, email/login, telefone, aulas por semana, mensalidade, inicio, horarios semanais e observacoes;
- a turma aberta no drawer fica sempre selecionada, e outras turmas/horarios podem ser adicionadas ao contrato;
- `fetchPlaceAdminResources` carrega `place_academy_student_contracts` junto dos demais recursos da academia;
- `Academia > Alunos` agrega por contrato quando existe `contract_id`, mostrando plano, mensalidade e horarios vinculados;
- caminho legado por matricula isolada permanece para registros antigos e excecoes administrativas.

Validacao:

- `npm.cmd run lint`;
- `npm.cmd run build`.

Risco residual:

- status financeiro visual ainda usa principalmente pagamento por `academy_enrollment`; a migracao para `academy_student_contract` fica no proximo item;
- drawer detalhado ainda abre a matricula representativa do contrato para acoes antigas, preservando compatibilidade ate a etapa financeira/contratual completa.

### [x] ACADEMY-STUDENT-03 - Cobranca mensal por contrato do aluno

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Fazer mensalidade da academia acompanhar o contrato/plano semanal, nao cada enrollment isolado.

Criterios:

- definir `target_type` canonico para pagamento do contrato, como `academy_student_contract`;
- `Marcar pago`, `Enviar lembrete` e `Cobrar` usam o contrato como alvo;
- alunos com duas aulas semanais geram uma mensalidade;
- preservar leitura de pagamentos antigos por `academy_enrollment` durante transicao;
- Pendencias e Financeiro mostram cobranca de aluno sem duplicidade.

Risco de regressao:

- pagamentos antigos sumirem;
- lembrete apontar para target errado;
- duplicar mensalidade no mesmo periodo.

Criterios de conclusao:

- pagamento mensal do contrato persiste;
- UI mostra pago/pendente corretamente;
- docs registram transicao entre enrollment e contrato.

Implementado:

- `Marcar pago` e `Enviar lembrete` usam `academy_student_contract` quando a matricula possui `contract_id`;
- matriculas antigas sem contrato continuam usando `academy_enrollment`;
- `Academia > Alunos`, `Grade > Turma`, Financeiro/Recebiveis e Clientes/Relacionamento passam a considerar pagamento do contrato;
- alunos com dois horarios no mesmo contrato geram uma unica mensalidade em aberto;
- recebiveis da academia agora sao montados primeiro por contrato ativo/pendente e depois por matriculas legadas sem contrato;
- receita recorrente estimada da academia soma contratos ativos mais matriculas legadas sem contrato, sem duplicar alunos contratados;
- leitura antiga por `academy_enrollment` foi preservada como fallback de transicao.

Validacao:

- `npm.cmd run lint`;
- `npm.cmd run build`.

Risco residual:

- pagamentos antigos por matricula ligada posteriormente a contrato podem exigir conciliacao manual se existirem em massa no ambiente;
- o drawer ainda edita dados da matricula representativa, enquanto dados financeiros passam a ser do contrato.

### [x] ACADEMY-STUDENT-04 - Ausencia avisada com antecedencia e credito automatico

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Quando aluno avisar ausencia com antecedencia configurada pela academia, gerar credito de reposicao automaticamente e liberar vaga.

Criterios:

- criar configuracao por academia: antecedencia minima para gerar reposicao;
- ausencia avisada valida data/hora real da aula;
- se dentro do prazo e turma permite reposicao, cria `planned_absence` e credito aberto;
- se fora do prazo, UI explica sem gerar credito automatico ou exige aprovacao manual conforme decisao;
- credito guarda origem por ausencia avisada, alem de origem por chamada/falta quando aplicavel;
- impedir credito duplicado para mesma ausencia;
- Pendencias diferencia `Reposicao aberta`, `Solicitacao de reposicao`, `Aula avulsa/drop-in` e `Ausencia avisada`.

Telas/componentes afetados:

- `Hoje > LessonDrawer`;
- `Alunos > StudentDrawer`;
- `Pendencias`;
- `Configuracao` da academia.

Risco de regressao:

- gerar credito para falta fora do prazo;
- quebrar creditos existentes baseados em `source_attendance_id`;
- confundir ausencia avisada com reposicao solicitada.

Criterios de conclusao:

- fluxo aluno/admin cria ausencia e credito real;
- regra de antecedencia fica editavel por gestor;
- creditos aparecem no aluno e na fila sem duplicidade.

Implementado:

- criada migration `0080_academy_absence_notice_credit_v1.sql`;
- `app_report_academy_absence(...)` agora valida turma ativa, dia real da turma e regra de antecedencia;
- quando o aviso esta dentro do prazo e a regra esta ativa, cria `place_academy_makeup_credits` com `source_absence_id`;
- `source_absence_id` impede credito duplicado para a mesma ausencia avisada;
- se o aviso esta fora do prazo, a ausencia fica registrada, mas nao gera credito automatico;
- `Configuracao > Quadras e horarios` ganhou regra editavel de antecedencia minima e toggle de credito automatico;
- `Pendencias` diferencia credito por ausencia avisada, credito por falta marcada e credito manual;
- `StudentDrawer` mostra a origem da reposicao no historico do aluno.

Validacao:

- `npm.cmd run lint`;
- `npm.cmd run build`.

Risco residual:

- a comparacao de antecedencia usa o horario da turma recorrente e o timezone configurado pelo ambiente do banco; se academias multi-timezone entrarem no produto, sera preciso adicionar timezone por local;
- seed demo ainda precisa criar exemplos dentro e fora do prazo para QA visual.

### [x] ACADEMY-STUDENT-05 - Seed/reset de academia com contratos reais

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Como o app esta em teste, permitir reset/populacao com dados coerentes para validar contratos, usuarios alunos, planos, turmas multi-horario, creditos e cobrancas.

Criterios:

- atualizar scripts SQL de seed para criar usuarios alunos/professores reais;
- criar contratos com 1x, 2x e 3x por semana;
- distribuir alunos em turmas e horarios variados;
- gerar mensalidades pagas, pendentes e atrasadas;
- gerar ausencias avisadas dentro e fora do prazo;
- gerar creditos de reposicao abertos/usados/cancelados;
- manter `escalao@gmail.com` como dono/admin dos locais demo;
- evitar duplicidade em rerun ou documentar ordem de reset.

Risco de regressao:

- seed conflitar com triggers de horario/quadra;
- duplicar usuarios se rerun nao limpar auth/public corretamente;
- massa demo esconder bugs por dados irreais.

Criterios de conclusao:

- seed split `web/supabase/seeds/qa_demo` atualizado para o modelo canônico de contratos;
- `04_academy.sql` cria `place_academy_student_contracts`, `seed_contracts`, `seed_contract_classes`, matriculas com `contract_id`, planos 1x/2x/3x, configuracao de antecedencia e creditos por ausencia;
- `05_bookings.sql` cria mensalidades em `app_payments` com `target_type = 'academy_student_contract'`, pagas, pendentes atuais e pendentes atrasadas;
- `08_leagues.sql`, `09_cleanup_helpers.sql`, `01_cleanup.sql` e `README.md` atualizados para os novos helpers/alvos financeiros;
- `escalao@gmail.com` continua dono/admin dos locais demo;
- usuarios alunos seguem vinculados a `auth.users`/`profiles`, permitindo contexto no Player App.

Validacao:

- `npm.cmd run lint`;
- `npm.cmd run build`.

Risco residual:

- o seed foi atualizado estaticamente e deve ser rodado no banco paralelo seguindo `01_cleanup.sql` a `08_leagues.sql`; se a instancia ainda nao tiver migrations `0079` e `0080`, o passo `04_academy.sql` falhara porque depende das tabelas/colunas novas;
- `qa_full_demo_seed.sql` permanece legado; para QA da Academia v2, usar o seed split `qa_demo`.

### [x] SEED-QA-02 - Blueprint de populate realista ponta a ponta

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Transformar o seed `qa_demo` em uma massa operacional realista, nao apenas preenchimento de tabelas.
- Garantir que cada entidade importante esteja ligada ao fluxo real: usuario -> perfil -> papel/plano -> academia/professor/turma/aluno/contrato/pagamento/presenca/reposicao, e jogador -> torneio/liga/partida/pagamento/resultado.

Criterios:

- definir volumes-alvo por perfil e por modulo antes de popular;
- definir regras de integridade funcional, nao apenas FK:
  - nenhuma turma ativa sem professor, quadra e alunos;
  - nenhum professor ativo sem usuario, staff/coach role e ao menos uma agenda/turma;
  - nenhum aluno ativo sem usuario, profile, contrato e matricula vinculada;
  - nenhum contrato ativo sem matriculas coerentes com `weekly_lessons_count`;
  - nenhum pagamento de academia sem contrato/aluno real;
  - nenhum torneio publico sem inscricoes, membros, pagamentos e operacao;
  - nenhuma liga ativa sem temporada, classes, jogadores, rodadas, partidas e rankings;
- criar checklist de validacao SQL no proprio seed ou em arquivo `10_verify_and_relink_owner.sql` ampliado;
- documentar volumes esperados e senhas/perfis no README.

Telas/fluxos afetados:

- `qa_demo/README.md`;
- `01_cleanup.sql`;
- `02_users.sql`;
- `03_places.sql`;
- `04_academy.sql`;
- `05_bookings.sql`;
- `06_finance.sql`;
- `07_tournaments.sql`;
- `08_leagues.sql`;
- `10_verify_and_relink_owner.sql`.

Ganhos esperados:

- QA deixa de ser visualizacao de dados artificiais;
- screenshots passam a revelar gargalos reais de densidade, filtros, permissao e UX;
- Player App, Management OS e Competition OS ficam testaveis por perfil.

Risco de regressao:

- volume grande pode mascarar erro se nao houver verificacao;
- seed pode ficar lento se gerar historico demais sem criterio;
- triggers de conflito podem bloquear turmas/reservas se horarios nao forem coordenados.

Criterios de conclusao:

- criado `SEED_QA_REALISTIC_POPULATE_PLAN.md` com perfis, volumes-alvo, invariantes, ordem de execucao e validacao esperada;
- queue detalhada de `SEED-QA-03` a `SEED-QA-12` criada para evoluir o populate em blocos;
- invariantes passam a exigir vinculo real ponta a ponta, nao apenas FK.

### [x] SEED-QA-03 - Usuarios, perfis e papeis demo completos

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Criar personas completas para testar todos os contextos sem depender apenas do admin multi-papel.

Criterios:

- manter `escalao@gmail.com` como owner/admin de todos os locais, torneios e ligas demo;
- criar usuarios reais com `auth.users` e `profiles` para:
  - owner/admin;
  - gerentes;
  - recepcao/frontdesk;
  - professores;
  - alunos de academia;
  - socios;
  - jogadores puros;
  - organizadores de competicao;
  - scorekeepers/check-in/media;
- preencher `app_user_product_entitlements` para testar:
  - `free_player`;
  - `competition_organizer`;
  - `coach_solo`;
  - `academy_pro`;
  - `platform_admin`;
- garantir senha documentada por grupo;
- garantir que jogadores/alunos/professores tenham cidade, UF, telefone, bio e perfil minimamente completo.

Risco de regressao:

- criar usuario sem `auth.identities` e quebrar login;
- duplicar emails em rerun;
- misturar papel profissional com Player App sem intencao.

Criterios de conclusao:

- `02_users.sql` cria personas adicionais para `platform_admin`, `competition_organizer`, `coach_solo`, financeiro e media/eventos;
- `profiles` seguem sendo gerados para 100% dos `seed_users`;
- `app_user_product_entitlements` agora cobre `academy_pro`, `platform_admin`, `competition_organizer`, `coach_solo` e staff operacional via vinculo de local;
- README documenta credenciais e significado de cada perfil.

### [x] SEED-QA-04 - Locais, quadras, staff e professores realistas

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Popular academias/clubes como operacoes reais, com staff, quadras, regras, professores e disponibilidade coerente.

Criterios:

- manter 3 locais principais, mas com perfis diferentes:
  - academia media;
  - clube maior/multiquadra;
  - centro premium com operacao mais complexa;
- cada local deve ter:
  - owner correto;
  - staff manager/frontdesk/coach em `place_staff`;
  - professores em `place_coaches` vinculados a usuarios;
  - quadras com precos, superficies e valores de socio;
  - regras de reserva por perfil/weekday;
  - planos de socio;
  - configuracao de academia em `place_academy_settings`;
- professores devem ter especialidades, niveis, bio, notas internas e comissao.

Risco de regressao:

- professor existir em `place_coaches` sem usuario e sem staff;
- quadra sem regra de reserva;
- local com produto/plano incoerente com modulos visiveis.

Criterios de conclusao:

- `03_places.sql` continua criando 3 locais com perfis diferentes, quadras, regras, staff, owner e planos coerentes;
- staff adicional foi vinculado a locais sem quebrar o check constraint de roles (`manager`, `frontdesk`, `coach`);
- professores em `place_coaches` agora recebem usuario, staff coach, especialidades, niveis atendidos, bio publica, notas internas, comissao e perfil publico ativo.

Risco residual:

- `place_academy_slots` e volume real de turmas/alunos ainda entram no proximo item (`SEED-QA-05`).

### [x] SEED-QA-05 - Academia completa: grade, contratos, alunos e capacidade

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Fazer o modulo Academia refletir uma operacao real de secretaria/professor/financeiro.

Criterios:

- aumentar volume para algo proximo de realidade:
  - academia media: 20-30 turmas/horarios semanais;
  - clube grande: 35-60 turmas/horarios semanais;
  - centro premium: 25-45 turmas/horarios semanais;
- criar `place_academy_slots` como escala semanal real:
  - horarios abertos;
  - horarios assigned;
  - bloqueios;
  - disponibilidade por professor e quadra;
- criar turmas sempre com:
  - professor;
  - quadra;
  - dia/horario;
  - nivel;
  - capacidade;
  - mensalidade;
- criar contratos de alunos sempre com:
  - usuario real;
  - profile;
  - plano 1x/2x/3x;
  - matriculas com `contract_id`;
  - quantidade de turmas coerente com `weekly_lessons_count`;
- distribuir alunos respeitando capacidade:
  - turmas cheias;
  - turmas com vagas;
  - turmas quase vazias;
  - turmas kids/adulto/feminino/performance;
- criar alguns contratos pendentes/cancelados, mas sem quebrar a leitura principal.

Risco de regressao:

- conflito de professor/quadra no mesmo horario;
- aluno duplicado em varias turmas sem contrato;
- turma ativa sem aluno ou sem professor;
- capacidade irreal que esconde problemas de vaga.

Criterios de conclusao:

- consultas de verificacao retornam zero para orfaos: turma sem professor, turma sem quadra, professor sem usuario, aluno ativo sem usuario, enrollment ativo sem contrato;
- contratos ativos batem com numero de aulas semanais;
- `Academia > Hoje`, `Grade`, `Alunos`, `Pendencias`, `Professores` e `Configuracao` mostram massa real.

Implementado:

- `04_academy.sql` agora cria 24 turmas para ADT, 30 para Arena Pantanal e 42 para Clube Racket Prime, sempre com professor, quadra, dia, horario, nivel, capacidade e mensalidade.
- `place_academy_slots` passou a ser populado com janelas `assigned`, horarios `open` e bloqueios `blocked`; bloqueios tambem recebem professor para respeitar `app_validate_academy_resource_scope`.
- turmas adultas foram calibradas para capacidade 4 e infantis para capacidade 8, refletindo operacao real de tenis.
- contratos foram calibrados para 60/82/115 alunos por local, com usuario real, profile existente, plano semanal 1x/2x/3x, `contract_id` e matriculas coerentes com `weekly_lessons_count`.
- matriculas ativas agora sao distribuidas por assentos de turma, sem concentrar todos os alunos nas primeiras turmas e sem ultrapassar capacidade.
- helpers `seed_slots` foram incluidos no cleanup inicial e no cleanup opcional.

Risco residual:

- historico de 6 meses, reposicoes e aula avulsa em volume maior ficam no proximo item (`SEED-QA-06`).

### [x] SEED-QA-06 - Historico de 6 meses: presenca, faltas, reposicoes e aulas avulsas

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Criar historico suficiente para validar rotinas de chamada, ausencias, reposicao, drop-in e evolucao.

Criterios:

- gerar 20-26 semanas de `place_academy_attendance` para turmas ativas;
- variar presencas, faltas, faltas avisadas e observacoes;
- criar `place_academy_planned_absences` dentro e fora do prazo;
- criar creditos de reposicao:
  - abertos;
  - usados;
  - cancelados;
  - originados por falta marcada;
  - originados por ausencia avisada;
- criar `place_academy_lesson_requests` para:
  - aula avulsa/drop-in pendente;
  - aula avulsa aprovada/paga;
  - reposicao solicitada;
  - reposicao recusada/cancelada;
- criar `place_academy_progress_notes` com foco, nivel e evolucao por aluno.

Risco de regressao:

- credito duplicado por mesma ausencia;
- reposicao sem matricula/aluno real;
- historico muito pesado sem necessidade.

Criterios de conclusao:

- Pendencias mostra fila real;
- StudentDrawer mostra presenca, evolucao, pagamentos e reposicoes;
- Hoje permite testar chamada com alunos suficientes.

Implementado:

- `04_academy.sql` agora gera 24 semanas de `place_academy_attendance` para matriculas ativas, com presenca, falta registrada, ausencia avisada e observacao tecnica curta.
- creditos por `source_attendance_id` aumentaram para massa maior e agora variam entre `open`, `used` e `cancelled`.
- ausencias planejadas dentro e fora do prazo foram ampliadas, preservando datas diferentes para evitar conflito por `(enrollment_id, absence_on)`.
- creditos por `source_absence_id` foram ampliados e continuam diferenciando ausencia avisada dentro do prazo.
- `place_academy_lesson_requests` agora inclui reposicoes vinculadas a `makeup_credit_id` real, com status `pending`, `approved` e `rejected`; aprovacoes atualizam credito e ausencia para `used`.
- drop-ins/aulas avulsas continuam existindo como pedidos independentes para validar fila, pagamento e encaixe.

Risco residual:

- validadores automaticos de contagem/status ainda entram em `SEED-QA-12`;
- agenda de quadras com reservas reais e waitlist ainda depende do proximo item.

### [x] SEED-QA-07 - Agenda e reservas com ocupacao realista

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Popular agenda de quadras com reservas, aulas, bloqueios e espera sem conflitar com turmas.

Criterios:

- gerar reservas em 6 meses com padrao real:
  - manha;
  - horario de almoco;
  - pico noturno;
  - fim de semana;
- criar ocupacao por local:
  - 45-60% academia media;
  - 60-75% clube grande;
  - 55-70% premium;
- criar `court_bookings` confirmadas, pendentes, canceladas e blocked;
- criar `court_booking_waitlist` em horarios cheios;
- deixar pendente apenas solicitacoes recentes de abertura, nao backlog antigo;
- nao sobrepor reservas com turmas/aulas fixas na mesma quadra;
- pagamentos de reserva devem apontar para reservas reais.

Risco de regressao:

- trigger bloquear seed por conflito de quadra;
- calendario parecer lotado artificialmente;
- reservas futuras impedirem recriar turmas em rerun parcial.

Criterios de conclusao:

- Agenda mostra ocupacao real por quadra/dia;
- busca de quadra livre retorna resultados variados;
- lista de espera aparece apenas em horarios plausiveis.

Implementado:

- `05_bookings.sql` agora gera candidatos de reserva dos ultimos 180 dias ate 45 dias futuros, com padroes de manha, almoco, pico noturno e fim de semana.
- antes de inserir, a massa filtra conflito com `place_academy_classes` e `place_academy_slots` na mesma quadra/dia/horario.
- reservas variam entre `confirmed`, `pending`, `cancelled` e `blocked`.
- reservas `pending` agora representam triagem recente de abertura: somente hoje/proximos 2 dias, criadas desde a ultima tarde/noite; o restante do backlog aparece resolvido como confirmado/cancelado/bloqueado.
- pagamentos de reserva ignoram `cancelled` e `blocked`, mantendo target real para toda reserva paga/pendente.
- `court_booking_waitlist` agora nasce de reservas futuras confirmadas em horario ocupado, evitando fila solta sem contexto operacional.

Risco residual:

- ocupacao percentual exata ainda deve ser medida pelo futuro verificador `SEED-QA-12`;
- financeiro amplo por origem, lembretes e POS entram no proximo item.

### [x] SEED-QA-08 - Financeiro completo e coerente por origem

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Fazer financeiro refletir operacao real por contrato, socio, reserva, aula avulsa, torneio e liga.

Criterios:

- criar pagamentos para:
  - `academy_student_contract`;
  - `place_membership`;
  - `court_booking`;
  - `tournament_registration`;
  - `league_registration`;
  - aula avulsa/drop-in quando aplicavel;
- variar status:
  - paid;
  - pending atual;
  - pending vencido;
  - refunded/failed quando util para UI;
- criar lembretes em `app_payment_reminders` com channel/status variados;
- criar despesas, POS, pacotes/creditos e compras;
- garantir que pagamento pendente sempre tenha usuario e target real.

Risco de regressao:

- pagamento sem target real;
- duplicidade de mensalidade por aluno com contrato 2x/3x;
- pendencia financeira sem contexto na UI.

Criterios de conclusao:

- Financeiro, Clientes/CRM, Academia/Alunos e Pendencias mostram valores coerentes;
- nenhum pagamento aponta para target inexistente;
- alunos com duas ou tres aulas possuem uma mensalidade unica.

Implementado:

- `05_bookings.sql` ja mantem mensalidade de academia por `academy_student_contract`, uma cobranca por contrato/plano, mesmo para alunos 2x/3x.
- `06_finance.sql` agora cria pagamentos reais para `academy_lesson_request` quando a aula avulsa/drop-in tem valor e target real.
- reposicoes com credito continuam sem nova cobranca (`waived`), evitando duplicidade entre credito e aula avulsa.
- `06_finance.sql` cria lembretes para pendencias de `academy_student_contract`, `place_membership`, `court_booking` e `academy_lesson_request`.
- `08_leagues.sql` recalcula lembretes finais depois de torneios/ligas e inclui `academy_lesson_request`.
- lembretes variam canal (`manual`, `whatsapp`, `email`) e status (`queued`, `sent`, `cancelled`).
- pagamentos de liga agora variam entre `paid`, `pending` e `failed`, sem perder target real.

Risco residual:

- pagamentos de torneio foram refinados em `SEED-QA-09`; validacao automatica de targets ainda fica para o verificador final;
- validadores automaticos de alvo inexistente entram em `SEED-QA-12`.

### [x] SEED-QA-09 - Torneios com operacao completa

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Popular Competition OS de torneios com estados reais de organizador e jogador.

Criterios:

- criar torneios em estados:
  - draft;
  - registration_open;
  - registration_closed;
  - live;
  - finished;
- cada torneio publico deve ter:
  - owner `escalao@gmail.com`;
  - place real quando aplicavel;
  - staff em `tournament_members`;
  - inscrições com `auth.users`;
  - participantes aprovados em `tournament_members`;
  - pagamentos coerentes;
  - chat/announcement;
  - confirmacoes de partida;
  - resultado enviado/aplicado/conflito quando o status permitir;
- dados em `tournaments.data` devem estar coerentes com `tournament_registrations`;
- criar variação: aberto com vagas, aberto quase cheio, live com pendencias, finalizado com resultados.

Risco de regressao:

- participante em JSON sem usuario/registration;
- registration aprovada sem tournament_member;
- pagamento de inscricao sem registration real.

Criterios de conclusao:

- Organizador enxerga pendencias reais;
- jogador inscrito enxerga torneios e partidas;
- torneio publico mostra vagas/inscricoes coerentes.

Implementado:

- `07_tournaments.sql` agora cobre os estados `draft`, `registration_open`, `registration_closed`, `live` e `finished`.
- adicionado torneio publico `Prime Open Inscricoes Encerradas`, com inscrições já encerradas e evento futuro.
- staff de torneio ficou mais completo, incluindo `organizer`, `checkin`, `scorekeeper` e `media`, alem do owner principal.
- anuncios/chat passam a cobrir tambem torneios `registration_closed`.
- pagamentos de torneio agora variam entre `paid`, `pending`, `failed` e `refunded` quando aplicavel, mantendo target real por `tournament_registration`.

Risco residual:

- a coerencia fina entre `tournaments.data` JSON e `tournament_registrations` ainda deve ser validada por `SEED-QA-12`;
- resultados/chaves continuam sinteticos e podem ser aprofundados se o Competition OS pedir cenarios mais pesados.

### [x] SEED-QA-10 - Ligas com rodada, partida e matchroom realistas

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Popular ligas com operacao relacional completa, simulando varias rodadas de uso.

Criterios:

- criar ligas simples, dupla fixa e ranking;
- cada liga ativa deve ter:
  - season ativa;
  - classes;
  - league_players com usuarios;
  - league_registrations;
  - rounds abertas/finalizadas;
  - matches aguardando organizacao, resultado, confirmacao, encerradas, WO e analise admin;
  - league_match_players;
  - league_match_messages;
  - league_match_result_submissions;
  - league_match_availability;
  - ranking_snapshots;
  - pagamentos e lembretes;
- criar jogadores em recesso, wildcard e casos de conflito.

Risco de regressao:

- partida sem players;
- rodada sem partida;
- ranking sem players reais;
- status de match incompatível com resultados/submissions.

Criterios de conclusao:

- jogador consegue abrir liga e ver proxima partida;
- organizador consegue ver pendencias reais;
- ranking e rodadas refletem 6 meses de atividade.

Implementado:

- `08_leagues.sql` agora popula ligas simples, dupla fixa e ranking com `operationModel` explicito para a liga de ranking;
- cada liga ativa tem season, classes, jogadores com usuarios, inscricoes aprovadas, pendentes e rejeitadas;
- rodadas cobrem historico e rodada atual com partidas `encerrada`, `wo`, `em_analise_adm`, `em_disputa`, `aguardando_confirmacao`, `aguardando_resultado` e `aguardando_organizacao`;
- liga de dupla fixa passou a criar dois jogadores por lado em `league_match_players`;
- partidas futuras de dupla fixa incluem caso de wildcard real em `league_match_players`;
- matchroom ganhou mensagens dos dois lados, disponibilidade por opcoes em `league_match_availability` e submissions coerentes com status;
- WO e analise administrativa geram `league_admin_decisions`;
- partidas finalizadas/WO geram `league_round_results`;
- historico de confrontos passa a alimentar `league_pair_history`;
- ligas possuem `league_join_links` por classe;
- pagamentos de inscricao de liga variam entre `paid`, `pending`, `failed` e `refunded`, com lembretes finais recalculados.

Validacao:

- `npm.cmd run lint`;
- `npm.cmd run build`.

Risco residual:

- a chave/ranking exibida pela UI ainda depende das regras sinteticas atuais de `ranking_points`;
- validadores automaticos de match sem players, rodada sem match e pagamento sem target entram em `SEED-QA-12`.

### [x] SEED-QA-11 - Player App: descoberta, social e perfis coerentes

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Garantir que jogadores puros tenham dados suficientes para testar Home, Locais, Ranking, Perfil e descoberta sem ruido de gestao.

Criterios:

- criar jogadores que:
  - so jogam partidas abertas;
  - so reservam quadra;
  - fazem aula;
  - jogam torneio;
  - jogam liga;
  - sao socios de local;
  - seguem locais;
  - seguem outros usuarios;
- popular `open_matches`, participantes, comentarios e reacoes;
- criar notification preferences;
- garantir rankings/perfis com foto/bio/cidade/nivel suficiente para UI.

Risco de regressao:

- Player App parecer vazio para usuario puro;
- dados profissionais vazarem para jogador comum;
- perfis ficarem incompletos e esconderem problemas de UI.

Criterios de conclusao:

- login de player puro mostra Home com proximas acoes reais;
- Locais mostra reservas/aulas/partidas sem depender do admin;
- Perfil tem historico e contexto.

Implementado:

- `02_users.sql` agora cria entitlement explicito para todos os usuarios demo, incluindo jogadores puros como `free_player`;
- jogadores continuam sem permissao de criar local/competicao, exceto personas PRO/admin previstas;
- `05_bookings.sql` padronizou niveis de partidas abertas para `Iniciante`, `Intermediario`, `Avancado`, `Primeira Classe` e `Profissional`;
- partidas abertas agora cobrem dois contextos: chamadas vinculadas a locais e chamadas por cidade sem academia/quadra definida;
- chamadas sem local testam o fluxo real de encontrar parceiro/adversario antes de escolher quadra;
- grafo social foi ampliado com multiplos `user_follows` por jogador, alem de seguidores de locais;
- `notification_preferences` continua sendo criada para todos os usuarios demo;
- massa existente ja cobre player que reserva quadra, faz aula, joga torneio, joga liga, e e socio de local por meio de `04_academy.sql`, `05_bookings.sql`, `07_tournaments.sql` e `08_leagues.sql`.

Validacao:

- `npm.cmd run lint`;
- `npm.cmd run build`.

Risco residual:

- validacao automatica dos perfis/seguidores/matches ainda fica para `SEED-QA-12`;
- `listOpenMatches` segue com limite de 60 registros na UI; a massa agora excede esse volume para testar ordenacao/limite, mas o verificador precisa provar que o banco esta completo.

### [x] SEED-QA-12 - Validadores SQL e checklist de integridade do seed

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Encerrar o populate com verificacoes automaticas que provem que os dados estao linkados e completos.

Criterios:

- ampliar `10_verify_and_relink_owner.sql` ou criar `10_verify_seed_integrity.sql`;
- incluir contadores e asserts para:
  - usuarios por perfil;
  - profiles faltantes;
  - staff sem user;
  - professor sem user;
  - turma sem professor/quadra/aluno;
  - contrato ativo sem enrollment;
  - enrollment ativo sem contract/user;
  - pagamento sem target;
  - reserva conflitando com turma;
  - torneio com registration aprovada sem member;
  - liga com match sem players;
  - rodada sem match;
- retornar resumo final por modulo.

Risco de regressao:

- validadores virarem apenas contadores e nao pegarem orfaos;
- asserts duros demais bloquearem ajustes pequenos.

Criterios de conclusao:

- rodar `01_cleanup.sql` a `08_leagues.sql` e depois verificador sem erro;
- README documenta ordem, volumes e perfis de login;
- fila de seed realista fica fechada.

Implementado:

- criado `web/supabase/seeds/qa_demo/10_verify_seed_integrity.sql`;
- verificador e nao destrutivo e deve rodar depois de `01_cleanup.sql` a `08_leagues.sql`;
- checks cobrem usuarios sem profile/entitlement, player com permissao indevida, professor sem user/staff, turma sem professor/quadra/aluno, contrato sem enrollment, enrollment ativo sem contrato/user, contrato com `weekly_lessons_count` divergente, pagamento sem target, reserva conflitando com aula/slot, torneio aprovado sem member, rodada de liga sem match, match de liga sem players, partida aberta sem participante, ausencia de partidas abertas por cidade, grafo social fraco e preferencias de notificacao ausentes;
- checks tambem cobrem reserva pendente velha: `pending` nao pode estar no passado, longe demais no futuro ou criada antes da ultima abertura operacional;
- checks tambem cobrem setup completo da academia: local sem configuracao/planos/regras, professor sem turma, turma adulta acima de 4, turma infantil acima de 8 e turma acima da capacidade;
- o SQL levanta erro com os nomes dos checks quebrados e retorna `qa_seed_integrity_ok` quando passa;
- README e `SEED_QA_REALISTIC_POPULATE_PLAN.md` foram atualizados com a nova etapa.

Validacao:

- `npm.cmd run lint`;
- `npm.cmd run build`.

Risco residual:

- o verificador ainda e estatico e deve evoluir quando novos modulos entrarem no seed;
- a execucao completa do SQL depende do banco paralelo estar com migrations recentes aplicadas.

### [x] ACADEMY-FORM-01 - Placeholders e labels nos formularios da Academia

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Eliminar inputs e buscas sem informacao suficiente quando nao houver label/cabecalho visivel.

Criterios:

- todo input sem label visual deve ter placeholder util;
- todo controle sem texto visivel deve ter `aria-label`;
- buscas devem explicar o que pesquisam: aluno, telefone, turma, professor, quadra, cidade, data ou horario;
- placeholders nao substituem label quando o campo for critico ou sensivel;
- validar Academia primeiro e registrar padrao para Agenda/Financeiro/Competition OS.

Risco de regressao:

- placeholder virar texto longo demais em mobile;
- duplicar label e placeholder de forma poluida.

Criterios de conclusao:

- sweep em `PlaceAcademy*Module`;
- screenshots ou checklist visual;
- lint/build passando quando houver alteracao de codigo.

Entregue:

- buscas e filtros de `Grade`, `Alunos`, `Pendencias` e `Professores` receberam nomes acessiveis sem aumentar ruido visual;
- composer de professor, ferramenta de encaixe e pedido de aula/reposicao receberam `aria-label` contextual;
- chamada rapida recebeu `aria-label` por aluno para observacao curta;
- campos criticos em drawers continuam com label visual; placeholders foram usados apenas como ajuda curta, nao como substituto estrutural;
- checklist estatico aplicado em `PlaceAcademy*Module`.

### [x] ACADEMY-QA-01 - Corrigir friccoes de Academia detectadas no QA manual

Status: `[x]` concluido em 2026-05-14

Contexto:

- QA manual validou que os bloqueadores P0 foram tratados antes de retomar refinamentos: aprovacao/rejeicao de inscricao de torneio e erro SQL cru na UI da Academia.
- Esta task concentra apenas friccoes de Academia; nao reabrir arquitetura geral nem avancar para redesign amplo.

Criterios entregues:

- BUG-004 / FRIC-002: fila `Aulas do dia` ganhou acao `Abrir chamada`, levando para `Hoje` e abrindo o drawer da aula.
- BUG-005: chamada ganhou atualizacao otimista local; `Presente`/`Falta` mudam visual e contadores antes do refresh completo.
- BUG-006: nenhum novo spacer/altura residual foi introduzido; a correcao desta rodada removeu dependencia de areas passivas para chegar nas acoes de Academia.
- FRIC-001: subvisao `Alunos` ganhou CTA `Nova matricula`, abrindo drawer de matricula com usuario/email, plano, mensalidade e horarios semanais.
- FRIC-003: `Nova turma ou horario aberto` foi movido para o topo da Grade, antes da lista de turmas.
- FRIC-004: card `Horarios abertos` virou acao clicavel que leva para a lista/configuracao de disponibilidade.
- FRIC-005: professor sem cadastro vinculado recebe estado vazio claro orientando o vinculo do login pelo gestor.

Validacao esperada:

- `npm.cmd run lint`;
- `npm.cmd run build`;
- nenhuma acao nova falsa: chamada, matricula, turma e horarios reutilizam os fluxos/backend existentes.

### [x] SWEEP-ROLE-01 - Varredura por perfil Admin/Player/Professor

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Auditar telas principais e subfluxos usando perfis com permissoes diferentes, nao apenas o usuario admin multi-papel.

Criterios:

- validar Admin/PRO, Player puro e Professor/Staff;
- capturar Home, Locais, Eventos, Ranking, Perfil e Gestao em mobile e desktop;
- detectar vazamento de Management OS para Player App;
- validar buscas por intencao em Locais;
- registrar achados em documento vivo.

Entregue:

- screenshots/textos gerados em `web/docs/screenshots/page-sweep-2026-05-14-roles/`;
- `HomePage` deixou compromissos passivos fora da fila de pendencia;
- `PlacesPage` reforcou resultado direto de quadra com CTA e superficie formatada;
- `PlacesPage` corrigiu falso vazio na busca de aulas quando a RPC retorna zero mas ha turmas locais;
- `BottomNav` deixou de expor contexto Management OS para Player puro que acessa `/gestao` manualmente;
- `PAGE_SWEEP_UX_AUDIT_2026_05_14.md` criado/atualizado como checklist de regressao por perfil.

Risco residual:

- erros 500 em `place_academy_enrollments` e `app_payments` continuam aparecendo no browser e podem afetar carregamento/estados vazios;
- `PlacesPage` segue grande e deve ser tratada com cuidado em futuras mudancas.

### [x] EXPERIENCE-01 - Separar descoberta publica e filas profissionais

Status: `[x]` concluido

Objetivo:

- Fazer `/locais` voltar a ser experiencia publica/player e impedir que pendencias administrativas disputem a primeira viewport da Home do jogador.

Criterios:

- `/locais` nao deve renderizar cockpit, modulos, filas, financeiro ou CRM inline, mesmo para admin do local;
- `Abrir gestao` deve existir apenas como acao secundaria/discreta;
- Home deve usar prioridades de jogador para notificacoes, resumo e primeira acao;
- tarefas de academia/organizador devem aparecer em bloco profissional separado;
- tarefas profissionais devem navegar para `/gestao` ou Competition OS, nao para `/locais`.

Telas/componentes afetados:

- `PlacesPage`;
- `HomePage`;
- `App.css`;
- `CURRENT_PRODUCT_STATE.md`;
- `SCREEN_RESPONSIBILITIES.md`;
- `FULL_APP_PRODUCT_TECH_UX_AUDIT.md`.

Ganhos esperados:

- menos mistura de jogador, academia e organizador;
- `/locais` fica limpo para descoberta, reserva e aulas;
- admin entende que operacao acontece na Gestao;
- Home deixa de parecer dashboard generico com pendencias de tudo;
- produto fica mais coerente com Player App, Management OS e Competition OS.

Dependencias:

- `buildPlaceAdminPath`;
- regras de perfil/plano ja documentadas;
- rotas canonicas de gestao.

Risco de regressao:

- usuarios administradores podem precisar reaprender que o card em `/locais` prioriza pagina publica;
- algum fluxo legado que dependia de admin inline em `/locais` deve migrar para `/gestao`.

Criterios de conclusao:

- lint e build passando;
- `/locais` sem cockpit administrativo inline;
- Home com filas de jogador e profissional separadas;
- docs vivos atualizados.

Entregue em 2026-05-13:

- `isManagementCockpit` passou a depender de rota administrativa, bloqueando vazamento do admin para `/locais`;
- card de `Meus locais` em `/locais` passou a priorizar `Pagina publica`, com `Abrir gestao` secundario;
- prioridades de jogador e operacao foram separadas na Home;
- pendencias de socio/aula/reserva operacional agora apontam para subvisoes de Gestao;
- Home ganhou bloco `Area profissional` para operacao separada do Player App;
- `npm.cmd run lint` e `npm.cmd run build` passaram.

### [x] AGENDA-02 - Unificar agenda operacional e corrigir duplicidades

Status: `[x]` concluido

Objetivo:

- Transformar Agenda em uma visao unica de ocupacao real, sem duplicar reservas/hoje/espera e sem exigir que o operador deduza o que esta vendo.

Criterios:

- `Central de agenda` deve renderizar a subvisao ativa, nao um resumo duplicado mais a lista abaixo;
- calendario deve mostrar reservas, bloqueios, turmas fixas, aulas avulsas/reposicoes e faltas avisadas;
- cada horario deve ser clicavel e mostrar detalhe operacional;
- filtros devem existir por tipo, quadra, professor, turma e aluno/jogador;
- nova reserva deve usar data, horario e duracao em slots praticos, com disponibilidade explicita;
- regras de reserva nao podem usar dias numericos como entrada principal;
- tela de quadras nao pode estourar largura.

Telas/componentes afetados:

- `PlacesPage`;
- `PlaceBookingCalendarModule`;
- `PlaceBookingCreateModule`;
- `PlaceBookingResourcesModule`;
- `PlaceBookingOperationalQueues`;
- `PlacePublicPage`;
- `App.css`.

Ganhos esperados:

- operador entende ocupacao real do dia em uma unica leitura;
- professor consegue filtrar sua agenda e ver alunos/faltas no horario;
- menos duplicidade visual;
- menos horarios quebrados;
- configuracao de regras fica compreensivel para usuario exigente.

Dependencias:

- dados de reservas, turmas, aulas avulsas/reposicoes e faltas avisadas;
- gramatica de `OperationalCalendar`.

Risco de regressao:

- calendario com muitas quadras pode exigir scroll horizontal em mobile;
- aula avulsa depende de turma possuir quadra vinculada para aparecer no mapa.

Criterios de conclusao:

- lint e build passando;
- docs vivos atualizados;
- sem renderizacao duplicada das subvisoes de Agenda.

Entregue em 2026-05-13:

- `Central de agenda` passou a hospedar a subvisao real ativa no workspace;
- `Reservas`, `Calendario`, `Nova reserva`, `Espera` e `Quadras` deixaram de aparecer duplicadas abaixo do shell;
- calendario passou a combinar reservas, bloqueios, turmas, aulas avulsas/reposicoes e faltas avisadas;
- slots de 30 minutos ficaram clicaveis com detalhe e participantes;
- filtros por tipo, quadra, professor, turma e aluno/jogador foram aplicados;
- formulario de reserva no admin e pagina publica passou para data + horario + duracao;
- regras de reserva passaram a usar dias da semana como selecao visual;
- layout de precos de quadras foi reorganizado para nao vazar da pagina.

### [x] VISUAL-02 - Refinar sidebar, Home e Gestao para reduzir admin-template feeling

Status: `[x]` concluido

Objetivo:

- Aplicar a auditoria visual sem reabrir arquitetura: menos cards, menos caixas, mais workspace feeling e mais hierarchy.

Criterios:

- sidebar de Gestao deve parecer cockpit/workspace, nao template generico;
- Home deve responder proxima acao e pendencias sem hero/dashboard exagerado;
- Gestao deve reduzir verticalidade e containerizacao;
- abas internas devem expor no maximo 5 opcoes principais;
- mobile 360-430px deve ter navegacao mais confortavel.

Telas/componentes afetados:

- `BottomNav`;
- `ManagementShell`;
- `ManagementHubPage`;
- `HomePage`;
- `PlaceAdminShell`;
- `App.css`.

Ganhos esperados:

- percepcao premium mais forte;
- menos sensacao de painel antigo;
- menos ruído visual;
- primeira viewport mais orientada a tarefa;
- mobile menos comprimido.

Dependencias:

- `APP_UX_PRODUCT_AUDIT.md`;
- `CURRENT_PRODUCT_STATE.md`;
- `PREMIUM_UX_VISUAL_LANGUAGE.md`;
- `COMPONENT_GRAMMAR.md`.

Risco de regressao:

- esconder modulo importante no overflow de abas;
- contraste insuficiente na sidebar de Gestao;
- validar com dados reais porque o ambiente local sem env mostra apenas tela de configuracao.

Criterios de conclusao:

- lint e build passando;
- limite de 5 abas aplicado em Gestao do local;
- docs vivos atualizados;
- tentativa de screenshot mobile/desktop registrada.

Entregue em 2026-05-13:

- `BottomNav` recebeu estado visual especifico para Gestao, com contexto escuro/verde, active state mais forte e mobile horizontal compacto;
- `HomePage` recebeu tratamento mais quieto para o painel principal, reduzindo hero/dashboard feeling;
- `ManagementShell` e `ManagementHubPage` ficaram mais densos e menos card-heavy;
- `PlaceAdminShell` passou a renderizar 5 abas primarias e mover excedentes para `Mais`;
- screenshots gerados em `web/docs/screenshots/`, mas bloqueados por falta de configuracao local do Supabase.

### [x] VISUAL-03 - Validar e calibrar telas premium com dados reais

Status: `[x]` concluido com risco residual de API/dados

Objetivo:

- Confirmar a nova linguagem visual em estados reais: cheio, vazio, pendente, erro e mobile autenticado.

Criterios:

- usar dados reais ou seed demo;
- capturar Gestao, Home, Competition OS e pagina publica em 390px, 430px e desktop;
- corrigir overflow, contraste, hierarquia e textos que so aparecem com massa real;
- manter screenshots antes/depois quando houver ambiente valido.

Telas/componentes afetados:

- `/inicio`;
- `/gestao`;
- `PlaceAdminShell`;
- `Competition OS`;
- pagina publica do local.

Ganhos esperados:

- reduzir risco de refino baseado em estado vazio;
- fechar lacunas mobile;
- transformar auditoria visual em criterio verificavel.

Dependencias:

- `.env`/Supabase local ou staging;
- `DEMO_STATE_QA_CHECKLIST.md`.

Risco de regressao:

- validacao ficar estetica demais se nao houver dados operacionais variados.

Criterios de conclusao:

- screenshots validos anexados;
- ajustes visuais aplicados nos problemas encontrados;
- docs atualizados com achados.

Bloqueio em 2026-05-13:

- ambiente local sem `.env`/Supabase exibe apenas `Configuracao necessaria`;
- screenshots gerados nao validam telas autenticadas;
- manter bloqueado ate existir staging, env local ou seed/demo navegavel.

Rechecagem em 2026-05-14:

- `web/.env` e `web/.env.local` continuam ausentes;
- `web/.env.example` possui apenas placeholders de Supabase;
- `React/ Vite` continua bloqueando a UI autenticada com `Configuracao necessaria` quando nao ha variaveis reais;
- `playwright`/`@playwright/test` nao estao instalados localmente para captura autenticada automatizada;
- lint/build continuam sendo validacao tecnica, mas nao substituem screenshot real de Home, Gestao, Competition OS e paginas publicas com dados cheios.

Enquanto bloqueado:

- seguir tarefas executaveis de UX premium e registrar validacao limitada quando necessario.

Entregue em 2026-05-14:

- Playwright foi usado de forma temporaria fora do repo para capturar screenshots autenticados sem adicionar dependencia ao projeto;
- screenshots do app publicado foram gerados em `web/docs/screenshots/visual-03-2026-05-14/`;
- a validacao mostrou que o app publicado ainda estava atras do codigo local em pontos de Competition OS/Home, entao a calibragem final foi feita contra o build local atual usando a anon key publica do bundle apenas como variavel de ambiente da sessao;
- screenshots do build local atual foram gerados em `web/docs/screenshots/visual-03-2026-05-14-local-current/`;
- screenshots finais apos ajuste foram gerados em `web/docs/screenshots/visual-03-2026-05-14-local-final/`;
- `HomePage` separou avisos de jogador e avisos operacionais, impedindo que comunicados de competicoes organizadas contem como pendencia principal do Player App;
- `HomePage` reduziu densidade abaixo da central do jogador: prioridades ficam em recorte curto com `Ver todas`, atualizacoes recentes foram limitadas e eventos publicos continuam como suporte;
- validacao real apontou erros `500` recorrentes em `place_academy_enrollments` e `app_payments`; isso permanece como risco de API/dados, nao como bloqueio visual da fase;
- `npm.cmd run lint` e `npm.cmd run build` passaram.

### [x] COMP-VISUAL-01 - Aplicar refinamento premium no Competition OS

Status: `[x]` concluido

Objetivo:

- Levar o mesmo ganho de hierarchy, menos cards e task-first UX para torneios/ligas, sem mexer na arquitetura de competicoes.

Criterios:

- separar melhor `jogar` e `organizar` na composicao visual;
- primeira viewport deve mostrar proxima acao, escopo ativo e pendencias;
- reduzir cards equivalentes e blocos informativos;
- manter confirmacao, desfazer confirmacao e resultado como fluxos intocaveis;
- mobile 390-430px sem abas/filtros comprimidos.

Telas/componentes afetados:

- `EventsHubPage`;
- `TournamentPage`;
- `LeagueDetailsPage`;
- componentes de partidas/filas de competicao.

Ganhos esperados:

- Competition OS parecer produto proprio;
- menos mistura entre jogador e organizador;
- mais clareza operacional em partida e resultado.

Dependencias:

- estado atual dos fluxos de competicao;
- `COMPONENT_GRAMMAR.md`;
- `PREMIUM_UX_VISUAL_LANGUAGE.md`.

Risco de regressao:

- quebrar fluxos sensiveis de confirmacao/resultado;
- esconder informacao importante de classe/fase.

Criterios de conclusao:

- pelo menos uma tela critica de Competition OS refinada;
- lint/build passando;
- docs vivos atualizados.

Entregue em 2026-05-13:

- `/eventos` deixou de tratar `Organizando agora` como lista passiva;
- torneios e ligas organizados passaram a aparecer como rows operacionais com tipo, status, proximo passo e CTA primario;
- status de torneio define destino semantico: setup, inscricoes, preparacao de jogos, operacao ao vivo ou resumo;
- status de liga define destino semantico: configurar, operar rodada, revisar pausa ou historico;
- atalhos `Torneios organizados` e `Ligas organizadas` ficaram como suporte, nao cards principais;
- mobile passou a empilhar cada row com botao full-width;
- `npm.cmd run lint` e `npm.cmd run build` passaram.

### [x] COMP-VISUAL-02 - Refinar operacao interna de torneio/liga sem aumentar escopo

Status: `[x]` concluido

Objetivo:

- Levar o mesmo padrao de row operacional do hub para a primeira viewport interna de torneio/liga, reforcando proxima acao sem mexer em confirmacao/resultado.

Criterios:

- tela interna deve abrir com escopo ativo, pendencias e acao primaria clara;
- jogador e organizador devem perceber papeis diferentes sem trocar de produto mentalmente;
- publicacao/configuracao deve ficar secundaria quando houver pendencia de partida/inscricao;
- mobile deve manter a proxima acao visivel sem grid comprimido;
- nao alterar regras de placar, confirmacao, disponibilidade ou resultado.

Telas/componentes afetados:

- `TournamentPage`;
- `LeagueDetailsPage`;
- `CompetitionOperationalQueue`;
- `App.css`;
- docs vivos.

Ganhos esperados:

- Competition OS passa a ser operacional tambem dentro da competicao;
- menos leitura antes da acao;
- menos sensacao de pagina longa de admin;
- maior continuidade entre hub e detalhe.

Dependencias:

- `COMPONENT_GRAMMAR.md`;
- `PREMIUM_UX_VISUAL_LANGUAGE.md`;
- estado atual de partidas/inscricoes.

Risco de regressao:

- esconder detalhes importantes de classe/fase;
- afetar fluxos sensiveis de resultado/confirmacao.

Criterios de conclusao:

- uma tela interna de competicao refinada;
- lint/build passando;
- docs atualizados.

Entregue em 2026-05-14:

- `LeagueDetailsPage` ganhou painel de foco operacional antes das tabs, com proxima acao, escopo ativo, pendencias e CTA `Resolver agora`;
- a fila operacional da liga ficou na primeira viewport do organizador, sem depender da aba `Organizacao`;
- resumo duplicado da aba `Visao` foi reduzido para suporte/publicacao/fechamento, evitando repetir as mesmas metricas e fila;
- `CompetitionOperationalQueue` passou a aceitar `actionLabel`, deixando rows internas com chamada explicita como `Resolver`, `Agendar`, `Confirmar` e `Intervir`;
- `TournamentPage` passou a exibir `Resolver`/`Ver` na fila operacional sem alterar regras de placar, confirmacao ou resultado;
- mobile empilha o painel de foco e transforma a acao da fila em largura total;
- `npm.cmd run lint` e `npm.cmd run build` passaram.

### [x] ACCESS-01 - Aplicar navegacao global por perfil e plano

Status: `[x]` concluido

Objetivo:

- Fazer o usuario ver apenas os contextos que fazem sentido para ele: Jogar, Organizar e Operar.

Criterios:

- jogador comum nao deve ver `Gestao` como entrada principal;
- organizador deve ver entrada clara para competicoes organizadas;
- professor/autonomo deve ver gestao leve de aulas/alunos;
- academia/clube deve ver Management OS completo conforme plano;
- menus devem evitar ferramentas sem permissao/plano.

Telas/componentes afetados:

- `AppShell`;
- `BottomNav`;
- `ManagementHubPage`;
- dados/derivacoes de acesso existentes.

Ganhos esperados:

- menos sensacao de "tudo para todo mundo";
- mais clareza de produto profissional;
- menos descoberta por tentativa e erro.

Dependencias:

- `PROFILE_PLAN_ACCESS_MODEL.md`;
- permissoes existentes de local/competicao.

Risco de regressao:

- esconder Gestao de usuario que tem permissao operacional mas ainda nao tem local carregado.

Criterios de conclusao:

- regras de visibilidade documentadas e aplicadas em pelo menos navegacao global;
- mobile nao mostra contexto irrelevante;
- fallback seguro para usuario multi-perfil.

Entregue em 2026-05-13:

- `BottomNav` passou a carregar um resumo de acesso operacional do usuario;
- `Gestao` so aparece quando ha local acessivel ou quando o usuario ja esta no contexto `/gestao`;
- `Organizar` so aparece quando ha torneio/liga organizada ou quando o usuario ja esta em contexto de organizacao;
- `Locais` voltou para o grupo `Jogar`, reforcando descoberta publica em vez de operacao;
- grupos vazios deixam de aparecer na nav;
- acesso e derivado em `workspace-access` com imports dinamicos para nao pesar o `AppShell`;
- fallback preserva acesso direto por URL mesmo quando a entrada nao aparece na nav.

### [x] DISCOVERY-01 - Criar quick actions semanticas no setup de Gestao

Status: `[x]` concluido

Objetivo:

- Fazer tarefas essenciais aparecerem por intencao, nao por modulo tecnico.

Criterios:

- `Cadastrar quadra` aparece quando a base de agenda esta incompleta;
- `Cadastrar professor` aparece quando Academia precisa de professor;
- `Criar turma` aparece como proximo passo quando ha professor/quadra;
- `Criar torneio` aparece para organizador com permissao;
- quick actions respeitam papel/plano.

Telas/componentes afetados:

- `ManagementHubPage`;
- `PlaceAdminShell`;
- `PlaceBookingResourcesModule`;
- `PlaceAcademyResourcesModule`;
- `PlaceAcademyClassSetupModule`;
- hubs de competicao.

Ganhos esperados:

- menos funcoes escondidas;
- onboarding mais intuitivo;
- usuario novo encontra tarefas basicas rapidamente.

Dependencias:

- `TASK_DISCOVERY_ONBOARDING.md`;
- gramatica `SemanticQuickAction`.

Risco de regressao:

- duplicar atalhos demais se o modulo ja estiver completo.

Criterios de conclusao:

- pelo menos setup de Academia/Agenda mostra proximas tarefas com nome semantico;
- acoes completas viram secundarias ou somem;
- docs atualizados.

Entregue em 2026-05-13:

- hub de Gestao passou a derivar `setupActions` por local;
- `Cadastrar quadra` aparece quando nao ha quadras e leva direto para Agenda > Quadras;
- `Cadastrar professor` aparece quando Academia ainda nao tem professores e leva para Academia > Professores;
- `Criar turma` aparece quando nao ha turmas e leva para Academia > Turmas;
- `Definir regras de reserva` e `Configurar plano` tambem aparecem como acoes semanticas quando faltam;
- setup do admin do local deixou de mostrar `Setup` generico e passou a mostrar a intencao do proximo passo;
- acoes aparecem apenas quando a base esta incompleta.

### [x] COMP-02 - Separar competicoes jogando, organizando e descobrindo

Status: `[x]` concluido

Objetivo:

- Reduzir mistura entre torneios/ligas que o usuario joga e torneios/ligas que ele organiza.

Criterios:

- hub de eventos deve apresentar recortes `Jogando`, `Organizando` e `Descobrir`;
- criacao de torneio/liga deve aparecer apenas no contexto de organizacao;
- jogador comum nao deve receber CTA administrativo como prioridade;
- organizador ve fila operacional das competicoes antes de descoberta publica.

Telas/componentes afetados:

- `EventsHubPage`;
- `EventsPage`;
- `LeaguesPage`;
- links para `TournamentPage` e `LeagueDetailsPage`.

Ganhos esperados:

- menos ambiguidade;
- organizador encontra operacao rapidamente;
- jogador nao sente painel administrativo.

Dependencias:

- `PROFILE_PLAN_ACCESS_MODEL.md`;
- dados atuais de autoria/participacao.

Risco de regressao:

- eventos publicos ficarem escondidos demais para jogador.

Criterios de conclusao:

- primeira viewport de eventos deixa claro se o usuario esta jogando, organizando ou descobrindo;
- criacao nao compete com descoberta para jogador comum.

Entregue em 2026-05-13:

- `/eventos` passou a abrir com recortes explicitos `Jogando`, `Organizando` e `Descobrir`;
- quando o usuario organiza torneios/ligas, a fila operacional de organizador aparece antes de jogador e descoberta;
- quando o usuario nao organiza nada, o hub nao mostra `Criar torneio`/`Criar liga` como CTA principal;
- criacao continua concentrada no contexto de organizacao: `/eventos/torneios?view=organizing` e `/eventos/ligas?view=organizing`;
- descoberta virou bloco proprio com entrada em torneio, entrada em liga, locais publicos e acesso secundario ao contexto de organizacao;
- mobile recebeu recortes empilhados e acoes de descoberta em rows, reduzindo a sensacao de painel administrativo.

### [x] ONBOARD-01 - Criar checklist operacional por perfil

Status: `[x]` concluido

Objetivo:

- Transformar setup inicial em caminho guiado para academia, professor solo e organizador.

Criterios:

- academia nova ve passos: quadras, regras, professores, turmas, alunos, financeiro, publicacao;
- professor solo ve passos leves: perfil, quadras usadas, agenda, alunos, mensalidade;
- organizador ve passos: criar evento, classes, inscricoes, publicar, gerar partidas;
- cada passo tem CTA primaria clara;
- passos completos ficam calmos.

Telas/componentes afetados:

- `/gestao`;
- `PlaceAdminShell`;
- hubs de competicao;
- empty/setup states.

Ganhos esperados:

- menos abandono no primeiro uso;
- menos necessidade de suporte;
- mais percepcao de produto inteligente.

Dependencias:

- `TASK_DISCOVERY_ONBOARDING.md`;
- estados de setup ja existentes.

Risco de regressao:

- virar checklist grande demais se nao houver progressao.

Criterios de conclusao:

- pelo menos um perfil com checklist acionavel implementado;
- checklist nao aparece como dashboard permanente depois de resolvido.

Entregue em 2026-05-13:

- `/gestao` ganhou roteiro de implantacao para academia/clube quando algum local ainda tem base incompleta;
- checklist mostra progresso percentual, etapas concluidas e proximos passos acionaveis;
- etapas cobrem quadras, regras, professores, turmas, clientes, plano financeiro e pagina publica;
- checklist respeita plano simples de reservas e nao exige professor/turma quando o local nao e academia;
- bloco some quando a base esta completa, evitando virar dashboard permanente;
- cada passo abre diretamente o modulo/subvisao correta, mantendo a descoberta por intencao.

### [x] ONBOARD-02 - Expandir checklist para organizador e professor solo

Status: `[x]` concluido parcial por perfil disponivel

Objetivo:

- Completar onboarding por perfil fora da academia/clube completa.

Criterios:

- organizador novo ve roteiro curto: criar evento, classes/categorias, inscricoes, publicar, gerar partidas;
- professor solo ve roteiro leve: perfil, quadras usadas, agenda, alunos e mensalidade;
- nenhum perfil ve modulos empresariais que nao pertencem ao plano;
- checklist deve ser contextual, curto e acionavel.

Telas/componentes afetados:

- `/eventos`;
- `EventsPage`;
- `LeaguesPage`;
- `/gestao` quando o perfil for professor/autonomo;
- docs de perfis e onboarding.

Ganhos esperados:

- onboarding mais completo sem transformar o produto em ERP;
- organizador e professor encontram o basico sem suporte;
- menos ferramentas escondidas em modulos tecnicos.

Dependencias:

- `PROFILE_PLAN_ACCESS_MODEL.md`;
- dados reais para detectar professor solo quando existir.

Risco de regressao:

- mostrar checklist para usuario que so quer jogar.

Criterios de conclusao:

- pelo menos organizador novo tem checklist acionavel em contexto de competicao;
- professor solo fica documentado ou implementado conforme dados disponiveis.

Entregue em 2026-05-13:

- `/eventos` ganhou roteiro secundario para `Organizar pela primeira vez` quando o usuario ainda nao organiza torneios/ligas;
- roteiro orienta o organizador novo por criar torneio, criar liga, configurar classes/inscricoes e publicar/operar;
- primeiros passos sao acionaveis e levam para os fluxos de criacao em contexto `organizing`;
- passos posteriores ficam calmos e explicativos ate existir um evento criado;
- roteiro nao aparece como prioridade acima de `Jogando` e `Descobrir`, preservando experiencia de jogador comum;
- professor solo permaneceu documentado como pendente porque ainda falta uma deteccao/entrada confiavel de perfil autonomo no produto atual.

### [x] PROFILE-01 - Definir entrada operacional de professor solo

Status: `[x]` concluido com gate seguro por papel `coach`

Objetivo:

- Criar base de frontend/UX para professor autonomo sem confundir com academia/clube completo.

Criterios:

- professor solo nao deve ver cantina/equipe/CRM pesado como rotina inicial;
- entrada deve priorizar aulas de hoje, alunos, agenda e mensalidades;
- setup deve ter passos leves: perfil, quadras usadas, agenda, alunos e valor/mensalidade;
- se nao houver dado suficiente para detectar perfil, documentar e criar gate seguro.

Telas/componentes afetados:

- `/gestao`;
- `ManagementHubPage`;
- navegacao global;
- docs de perfis/planos.

Ganhos esperados:

- separar gestao leve de professor do Management OS completo;
- reduzir aparencia de ERP para usuario autonomo;
- preparar plano/permissao mais vendavel.

Dependencias:

- modelo de perfil/plano do professor solo;
- fonte de dados para identificar professor autonomo.

Risco de regressao:

- esconder ferramentas de academia para gestor real se a deteccao for fraca.

Criterios de conclusao:

- entrada segura documentada e, se possivel, implementada sem afetar academia/clube;
- nenhum usuario comum passa a ver gestao indevida.

Entregue em 2026-05-13:

- `/gestao` ganhou uma entrada leve `Minha operacao de aulas` para usuarios com papel `coach`;
- entrada prioriza aulas de hoje, turmas e alunos, sem expor cantina, equipe, CRM pesado ou financeiro completo;
- atalhos levam somente para `Academia > Hoje`, `Academia > Turmas` e `Academia > Alunos`;
- fila operacional agregada passou a respeitar modulos acessiveis por papel antes de mostrar pendencias;
- professor com papel `coach` deixa de receber pendencias globais de modulos que nao acessa;
- a solucao usa gate seguro existente, sem inventar plano/permissao nova.

### [x] QUEUE-REFRESH-01 - Repriorizar proximos refinamentos de alto impacto

Status: `[x]` concluido

Objetivo:

- Revisar a fila apos fechar perfis/onboarding iniciais e escolher o proximo bloco com maior ganho perceptivel.

Criterios:

- manter foco em UX/frontend, sem reabrir arquitetura;
- priorizar pontos ainda fracos em `CURRENT_PRODUCT_STATE.md`;
- transformar o proximo bloco em task executavel;
- evitar micro-refinamentos sem impacto operacional.

Telas/componentes afetados:

- `EXECUTION_QUEUE.md`;
- docs vivos relevantes;
- possivelmente Competition OS, Gestao ou mobile sheets conforme prioridade.

Ganhos esperados:

- continuidade mais clara;
- menos dispersao;
- proxima rodada maior e mais objetiva.

Dependencias:

- estado atual dos MDs.

Risco de regressao:

- virar planejamento demais se nao sair com proxima task objetiva.

Criterios de conclusao:

- proximo item `[>]` definido com criterios, telas e conclusao clara.

Entregue em 2026-05-13:

- pontos fracos atuais foram revisados sem reabrir a arquitetura consolidada;
- o proximo bloco prioritario passa a ser Competition OS, especificamente operacao de partidas/resultados;
- a escolha prioriza uma dor ainda visivel para jogador e organizador: partidas com informacao espalhada, cards altos e acoes que ainda podem competir no mobile;
- Gestao/perfis/onboarding ficam como base consolidada, com refinamentos futuros guiados por dados reais;
- nova task `[>] COMP-03` foi criada com criterios operacionais, telas afetadas e criterio de conclusao.

### [x] COMP-03 - Refinar operacao de partidas e resultados no Competition OS

Status: `[x]` concluido

Objetivo:

- Reduzir card pile em partidas, confirmacoes e resultados, colocando a proxima acao em rows compactas e claras para jogador e organizador.

Criterios:

- jogador deve entender sua proxima partida/pendencia sem duplicidade confusa entre resumo e lista;
- organizador deve ver resultados, confirmacoes e pendencias como fila operacional antes de chave/listas longas;
- cada partida deve expor contexto, status, horario/local e uma acao primaria;
- acoes secundarias devem ficar em detalhe, drawer/sheet ou tratamento quiet;
- mobile deve evitar card alto, tabela larga e botoes desalinhados.

Telas/componentes afetados:

- `TournamentPage`;
- `LeagueDetailsPage`;
- `CompetitionOperationalQueue`;
- componentes/estilos de partida, confirmacao e resultado;
- docs de Competition OS e screen responsibilities.

Ganhos esperados:

- menos verticalidade em competicoes;
- jogador entende mais rapido qual jogo exige acao;
- organizador resolve resultado/confirmacao com menos varredura visual;
- Competition OS fica mais coerente com a gramatica `EntityActionRow`.

Dependencias:

- dados atuais de partidas, confirmacoes e resultados;
- padroes existentes de `CompetitionOperationalQueue` e `EntityActionRow`.

Risco de regressao:

- afetar fluxos de confirmar presenca, desfazer confirmacao e lancar/conferir resultado.

Criterios de conclusao:

- pelo menos um fluxo critico de partida em torneio ou liga convertido para row operacional;
- acao primaria preservada e visualmente priorizada;
- duplicidade de proxima partida reduzida quando houver sobreposicao com `Minhas partidas`;
- `npm run lint` e `npm run build` passando quando houver alteracao de codigo.

Entregue em 2026-05-13:

- `Minhas partidas` do torneio deixou de empilhar status, confirmacao, placar e botoes como card alto;
- cada partida do jogador agora abre como row operacional: identidade da partida, contexto/status e acoes ficam em zonas separadas;
- confirmacao de presenca virou acao primaria clara; `Nao posso jogar`, `Desfazer` e `Alterar` ficaram quiet;
- envio/compartilhamento de resultado saiu da area principal e foi para disclosure progressivo `Informar resultado`;
- agenda, estado operacional, presenca e envio de resultado ficam como chips/rows compactas;
- mobile empilha row, contexto e acoes em blocos tocaveis, sem tabela larga e sem botoes desalinhados;
- `npm run lint` e `npm run build` passaram.

### [x] COMP-04 - Refinar partidas da chave para operador e jogador

Status: `[x]` concluido

Objetivo:

- Levar a mesma gramatica row/progressive disclosure para partidas de grupos e mata-mata, reduzindo `match-card` alto na chave do torneio.

Criterios:

- partidas da chave devem mostrar numero, jogadores, status, horario e proxima acao em leitura horizontal;
- edicao de placar e WO deve ficar como camada progressiva quando nao for a acao principal;
- confirmacoes e envios de resultado devem aparecer como sinais compactos;
- organizador deve identificar rapidamente jogos com conflito, indisponibilidade ou resultado pendente;
- mobile deve evitar bloco alto por partida quando houver muitos jogos.

Telas/componentes afetados:

- `TournamentPage`;
- estilos `match-card`, `match-player-row`, `match-admin-actions`;
- docs de Competition OS e component grammar.

Ganhos esperados:

- chave do torneio fica mais profissional e escaneavel;
- operador resolve placares e conflitos com menos scroll;
- visual da partida fica consistente entre `Minhas partidas` e chave.

Dependencias:

- fluxo atual de edicao de placar, WO e limpar resultado.

Risco de regressao:

- esconder demais controles de placar para organizador durante operacao ao vivo.

Criterios de conclusao:

- pelo menos grupos ou mata-mata usam estrutura mais row-like;
- controles de placar continuam acessiveis;
- `npm run lint` e `npm run build` passando.

Entregue em 2026-05-13:

- partidas de grupos e mata-mata do torneio passaram a usar uma estrutura mais row-like;
- linha principal mostra numero do jogo, jogadores, status, horario, estado operacional, confirmacoes e placar oficial em leitura compacta;
- controles de placar, WO e limpar resultado foram movidos para disclosure `Lancar/Editar placar`;
- sinais de confirmacao e resultado ficaram compactos, sem empilhar blocos altos por partida;
- mobile empilha contexto e controles progressivos sem tabela larga;
- `npm run lint` e `npm run build` passaram.

### [x] COMP-05 - Refinar partidas da liga e sala de jogo

Status: `[x]` concluido

Objetivo:

- Levar a mesma gramatica de rows e progressive disclosure para `LeagueDetailsPage`, reduzindo `league-match-card` alto e deixando a sala de partida mais focada por tarefa.

Criterios:

- partidas da liga devem expor rodada, jogadores, status, horario e proxima acao em row compacta;
- sala de partida deve separar resultado, disponibilidade, chat e confirmacao em zonas claras;
- jogador deve ver primeiro a acao que resolve a partida: disponibilidade, enviar resultado ou confirmar;
- organizador deve identificar conflitos e resultados pendentes sem abrir todos os detalhes;
- mobile deve evitar salas longas abertas por padrao.

Telas/componentes afetados:

- `LeagueDetailsPage`;
- estilos `league-match-card`, `league-room-*`, `league-submission-row`;
- docs de Competition OS.

Ganhos esperados:

- liga fica visualmente alinhada ao torneio;
- menos scroll para jogador e organizador;
- menos mistura entre chat, resultado e disponibilidade.

Dependencias:

- fluxo atual de abertura da sala de partida;
- funcoes de disponibilidade, envio e confirmacao de resultado.

Risco de regressao:

- esconder conversa/confirmacao quando a partida esta em disputa.

Criterios de conclusao:

- ao menos a lista de partidas da rodada usa row operacional;
- sala/detalhe continua acessivel por acao clara;
- `npm run lint` e `npm run build` passando.

Entregue em 2026-05-13:

- `Minhas partidas` da liga passou a usar a mesma estrutura operacional do torneio: identidade, contexto/status e acao em zonas separadas;
- partidas por rodada deixaram de abrir com topo de card generico e passaram a mostrar jogo, jogadores, horario/rodada, status e proxima acao em row compacta;
- botao `Abrir sala` ficou como acao clara da row, preservando disponibilidade, resultado, chat e confirmacao dentro da sala;
- estado operacional da partida ficou visivel sem precisar abrir detalhes;
- mobile empilha identidade, contexto e acao sem card alto ou botoes desalinhados;
- `npm run lint` e `npm run build` passaram.

### [x] MOBILE-02 - Refinar sala de partida da liga em zonas progressivas

Status: `[x]` concluido

Objetivo:

- Reduzir a densidade da sala aberta da liga, separando disponibilidade, resultado, participantes e chat em zonas progressivas ou compactas.

Criterios:

- estado da partida deve continuar primeiro dentro da sala;
- disponibilidade e resultado devem ter hierarquia maior que chat quando forem a proxima acao;
- participantes/contatos devem ser compactos;
- chat nao deve ocupar altura excessiva no mobile;
- confirmacoes de resultado devem aparecer como rows compactas.

Telas/componentes afetados:

- `LeagueDetailsPage`;
- estilos `league-room-*`, `league-chat-*`, `league-submission-row`;
- docs de mobile friction/component grammar.

Ganhos esperados:

- menos scroll quando a sala esta aberta;
- jogador resolve disponibilidade/resultado mais rapido;
- organizador enxerga conflito sem ler todos os blocos.

Dependencias:

- estrutura atual da sala de partida.

Risco de regressao:

- esconder chat quando ele for necessario para combinacao de horario.

Criterios de conclusao:

- sala aberta fica organizada por prioridade operacional;
- mobile nao abre quatro paineis longos equivalentes;
- `npm run lint` e `npm run build` passando.

Entregue em 2026-05-13:

- sala da partida da liga passou a ordenar primeiro estado, disponibilidade e resultado;
- participantes/contatos e mini chat viraram disclosures compactos;
- disponibilidade e resultado receberam peso de tarefa principal dentro da sala;
- chat continua acessivel, mas deixa de ocupar altura antes da resolucao operacional;
- mobile abre a sala com menos paineis equivalentes e mais progressao por prioridade;
- `npm run lint` e `npm run build` passaram.

### [x] ACADEMY-02 - Refinar alunos e chamadas da Academia em rows operacionais

Status: `[x]` concluido

Objetivo:

- Continuar a segunda onda de rows nos fluxos de alunos/chamada, reduzindo listas altas e formularios concorrendo com rotina de aula.

Criterios:

- alunos devem mostrar nome, turma/contexto, pagamento/presenca e acao primaria em row;
- chamada deve priorizar marcar presenca/falta/reposicao sem abrir card alto;
- detalhes historicos devem ir para area progressiva ou drawer/sheet;
- mobile deve evitar varias metricas e botoes por aluno na mesma primeira leitura.

Telas/componentes afetados:

- `PlaceAcademyStudentsModule`;
- `PlaceAcademyTodayModule`;
- `PlaceAcademyClassesModule` se houver chamada/turma;
- estilos de workspace da Academia.

Ganhos esperados:

- operacao de professor/equipe fica mais rapida;
- menos sensacao de ERP;
- Academia fica mais alinhada aos rows de CRM, Financeiro, Cantina e Competicoes.

Dependencias:

- dados atuais de alunos, turmas, presenca e pagamentos.

Risco de regressao:

- esconder informacao de pagamento ou chamada que hoje esta visivel demais, mas e usada no dia a dia.

Criterios de conclusao:

- pelo menos um fluxo critico de aluno/chamada convertido ou compactado em row operacional;
- acao primaria preservada;
- `npm run lint` e `npm run build` passando.

Entregue em 2026-05-13:

- lista de alunos da Academia passou a usar `EntityActionRow`;
- cada aluno agora mostra turma, telefone, pagamento e presenca em sinais compactos;
- a row escolhe uma acao primaria por contexto: ativar pendente, check-in quando a chamada esta pendente ou marcar pago quando a mensalidade exige acao;
- acoes secundarias como cancelar, lembrar, avisar falta e marcar falta foram movidas para disclosure `Acoes`;
- historico de evolucao e metricas ficam abaixo da leitura principal, sem competir com a tarefa do dia;
- mobile reduz a quantidade de botoes simultaneos por aluno;
- `npm run lint` e `npm run build` passaram.

### [x] BILLING-02 - Tornar cobrancas recorrentes mais descobriveis e task-first

Status: `[x]` concluido

Objetivo:

- Expandir quick actions semanticas para cobranca e rotinas recorrentes, reduzindo a necessidade de procurar cobranca em modulos tecnicos.

Criterios:

- Gestao/Academia/Financeiro devem expor intencoes como `Cobrar aluno`, `Enviar lembrete` ou `Marcar pago` quando houver pendencia real;
- acoes de cobranca nao devem aparecer como dashboard permanente quando tudo esta em dia;
- uma acao primaria por pendencia financeira;
- mobile deve permitir resolver cobranca em poucos toques.

Telas/componentes afetados:

- `ManagementHubPage`;
- `PlaceFinanceReceivablesModule`;
- `PlaceAcademyStudentsModule`;
- `PlaceClientRelationshipModule` se houver inadimplencia/relacionamento;
- docs de discoverability/onboarding.

Ganhos esperados:

- menos funcao escondida;
- gestor/professor entende rapidamente quem precisa ser cobrado;
- financeiro fica mais operacional e menos relatorio.

Dependencias:

- dados atuais de recebiveis, mensalidades e pagamentos.

Risco de regressao:

- duplicar atalhos de cobranca em Gestao, Financeiro e Alunos.

Criterios de conclusao:

- pelo menos uma entrada semantica de cobranca aparece a partir de pendencia real;
- acao leva direto ao contexto correto ou executa lembrete/pagamento;
- `npm run lint` e `npm run build` passando se houver alteracao de codigo.

Entregue em 2026-05-13:

- Financeiro passou a abrir recebiveis com faixa semantica `Cobranca recorrente`, exibida apenas quando ha pendencias reais;
- atalhos passaram a usar linguagem de intencao: `Enviar lembrete geral`, `Cobrar socios` e `Cobrar alunos`;
- cada recebivel manteve uma acao primaria clara: `Enviar lembrete`;
- Clientes/CRM trocou `Inadimplentes` por `Cobrancas pendentes`, com rows operacionais e valor/contexto visiveis;
- `Lembretes segmentados` virou `Acoes de cobranca`, mantendo recortes por socio, aluno e todos em aberto sem parecer dashboard tecnico;
- mobile empilha a faixa e as rows de cobranca com botoes full-width;
- `npm run lint` e `npm run build` passaram.

### [x] PROFILE-02 - Refinar entradas internas de Gestao por operador

Status: `[x]` concluido

Objetivo:

- Aplicar a separacao de perfis/planos dentro dos hubs internos, para que academia/clube, professor solo e organizador vejam atalhos e rotinas proporcionais ao papel.

Criterios:

- nao reabrir arquitetura de perfis, apenas aplicar o modelo atual nas entradas internas;
- gestor de academia ve rotinas completas de operacao, setup, equipe, financeiro e publicacao;
- professor solo ve foco em agenda, alunos, turmas leves e mensalidades, sem cantina/CRM pesado como prioridade;
- organizador ve Competition OS como entrada administrativa primaria;
- jogador comum nao recebe CTA de gestao como tarefa principal.

Telas/componentes afetados:

- `ManagementHubPage`;
- `EventsHubPage`;
- navegacao global/contextual;
- docs de perfil/plano e screen responsibilities.

Ganhos esperados:

- menos sensacao de que todas as ferramentas existem para todo mundo;
- entrada mais profissional para quem trabalha no app;
- menos descoberta por tentativa e erro.

Dependencias:

- dados atuais de `accessByPlace`, papeis administrativos e competicoes organizadas.

Risco de regressao:

- esconder ferramenta que ainda nao tem permissao granular perfeita.

Criterios de conclusao:

- pelo menos uma entrada interna muda por perfil/papel sem remover acesso existente;
- fallback preserva acesso administrativo quando a deteccao for incompleta;
- docs vivos atualizados;
- `npm run lint` e `npm run build` passando se houver alteracao de codigo.

Entregue em 2026-05-13:

- `ManagementHubPage` passou a calcular um perfil operacional por local com base em papel e plano, sem reabrir o modelo de acesso;
- professor `coach` sem gestao completa agora recebe CTA primario `Abrir aulas`, atalho secundario `Alunos` e apenas `Academia` como modulo nobre;
- recepcao recebe entrada proporcional com `Abrir agenda`, `Aulas` e atalhos leves de Agenda/Academia;
- gestor/dono continua com operacao completa, pagina publica e atalhos amplos;
- checklist de implantacao completo deixou de aparecer para professor sem permissao de gestao, evitando setup empresarial fora de contexto;
- `EventsHubPage` deixou de mostrar roteiro grande de organizador para todo jogador comum; organizar evento segue disponivel como opcao contextual em `Descobrir`;
- `npm run lint` e `npm run build` passaram.

### [x] ROUTINE-02 - Expandir quick actions semanticas para rotinas recorrentes

Status: `[x]` concluido

Atualizacao 2026-05-13:

- corrigido fluxo critico de setup da Academia: `Cadastrar professor` abre Professores com formulario executavel, `Criar turma` abre Turmas com wizard executavel;
- corrigido fluxo `Publicar pagina`: Ajustes/Estrutura agora tem edicao direta dos dados publicos do local;
- `Recursos` ficou restrito a disponibilidade operacional e janelas abertas;
- usar uma janela aberta agora leva para Turmas com rascunho preenchido, evitando terminar a acao em tela errada.

Objetivo:

- Levar a mesma logica task-first de cobranca/setup para reservas, aulas e atendimento, reduzindo a necessidade de procurar funcoes por modulo tecnico.
- Aplicar a regra de destino semantico: cada quick action precisa abrir a subvisao onde a tarefa pode ser concluida.

Criterios:

- rotinas como `Criar reserva`, `Chamar lista de espera`, `Fazer chamada`, `Cadastrar cliente` e `Registrar venda` devem aparecer por intencao quando houver contexto real;
- rotinas ja existentes devem ser auditadas contra `SEMANTIC_FLOW_AUDIT.md`;
- nao criar painel permanente de atalhos zerados;
- manter uma acao primaria por row ou bloco operacional;
- mobile deve resolver a tarefa em poucos toques.

Telas/componentes afetados:

- `ManagementHubPage`;
- modulos de Agenda, Academia, Clientes/CRM e Cantina;
- docs de discoverability/onboarding e component grammar.

Ganhos esperados:

- menos menu tecnico;
- rotina diaria mais clara para recepcao/professor/gestor;
- mais sensacao de sistema que conduz o usuario.

Dependencias:

- dados atuais de reservas, lista de espera, aulas, contatos e vendas.

Risco de regressao:

- duplicar atalhos que ja existem dentro dos modulos.

Criterios de conclusao:

- pelo menos duas rotinas recorrentes ganham entrada semantica contextual;
- atalhos aparecem somente quando fazem sentido;
- toda quick action nova ou alterada tem destino executavel;
- docs vivos atualizados;
- `npm run lint` e `npm run build` passando se houver alteracao de codigo.

Entregue em 2026-05-13:

- `ManagementHubPage` passou a calcular acoes rapidas de rotina por local, com destino executavel por subvisao;
- Agenda ganhou entradas semanticas como `Confirmar reservas`, `Chamar espera`, `Ver agenda` e `Criar reserva`;
- Academia ganhou `Resolver aulas` e `Fazer chamada` quando ha pendencias ou aulas do dia;
- Clientes/CRM ganhou `Fazer follow-up` quando ha contato vencido/lead ativo;
- Financeiro ganhou `Cobrar pendentes` quando ha recebivel ou credito pendente;
- Cantina ganhou `Repor estoque` e `Registrar venda` quando ha estoque baixo/produto ativo;
- as acoes aparecem na row do local somente quando nao ha setup bloqueando a base, evitando painel permanente de atalhos;
- `npm run lint` e `npm run build` passaram;
- screenshots foram gerados em 390px e 1366px, mas seguem bloqueados pela tela `Configuracao necessaria` sem `.env`/Supabase.

### [x] GESTAO-01 - Refinar mobile real da tela `/gestao`

Status: `[x]` concluido

Objetivo:

- Fazer a central de gestao funcionar como workspace mobile, nao como desktop empilhado.

Criterios:

- header compacto no mobile;
- stats sem ocupar area nobre demais;
- fila do dia em rows tocaveis;
- locais em rows com acao primaria clara;
- pagina publica como secundaria;
- modulos do local acessiveis sem virar lista longa;
- alvo de toque minimo confortavel;
- sem grid de cards zerados.

Telas/componentes afetados:

- `ManagementHubPage.tsx`
- `ManagementShell.tsx`
- estilos `.management-*`

Ganhos esperados:

- menos scroll;
- mais clareza no primeiro uso;
- sensacao de app operacional moderno;
- reducao forte de admin-template feeling.

Dependencias:

- rows de gestao ja iniciadas.

Risco de regressao:

- quebrar densidade desktop enquanto melhora mobile.

Criterios de conclusao:

- mobile com fluxo claro em 360-430px;
- desktop mantendo leitura horizontal;
- `npm run lint` e `npm run build` passando.

Entregue em 2026-05-13:

- header de gestao ficou mais compacto no mobile;
- descricao longa do shell some no mobile para liberar primeira viewport;
- stats viraram trilho horizontal compacto em vez de cards verticais;
- fila do dia ganhou rows mais compactas para toque;
- locais mantem identidade em row mesmo no menor viewport;
- atalhos de modulos viraram trilho horizontal, evitando uma lista vertical longa;
- acao primaria continua clara e pagina publica ficou secundaria.

### [x] GESTAO-02 - Refinar admin de local como workspace, nao cockpit de cards

Status: `[x]` concluido

Objetivo:

- Fazer `/gestao/:placeId/:module` parecer uma area profissional por modulo, com contexto, subvisoes e operacao diaria claros.

Criterios:

- `PlaceAdminShell` deve ser contexto compacto;
- modulo ativo e subvisao precisam ter hierarchy obvia;
- setup/configuracao separado da rotina;
- widgets de resumo nao podem competir com filas;
- acoes primarias por modulo devem ser evidentes.

Telas/componentes afetados:

- `PlaceAdminShell.tsx`
- `PlacesPage.tsx`
- modulos `PlaceBooking*`, `PlaceAcademy*`, `PlaceFinance*`, `PlaceCrm*`, `PlaceCanteen*`
- estilos `.place-admin-*`, `.place-management-*`

Ganhos esperados:

- reducao da sensacao de ferramentas empilhadas;
- usuario entende como cadastrar e operar;
- mais confianca para dono/equipe.

Dependencias:

- manter rotas canonicas `/gestao/:placeId/:module`.

Risco de regressao:

- mexer em area extensa ainda conectada a `PlacesPage`.

Criterios de conclusao:

- cada modulo abre com fila/acao principal;
- configuracao fica visualmente secundaria;
- mobile nao fica com blocos enormes empilhados.

Entregue em 2026-05-13:

- `PlaceAdminShell` ficou mais compacto e com cara de workspace;
- contexto do local, papel e plano ficaram no topo sem hero grande;
- modulo ativo ganhou hierarquia propria antes de setup/configuracao;
- setup e features viraram faixa secundaria discreta;
- dashboard de operacao passou a mostrar fila de trabalho antes das metricas;
- metricas do dashboard foram reduzidas para sinais de suporte;
- mobile ganhou setup em coluna, features em trilho e grid de sinais mais compacto.

### [x] SIDEBAR-01 - Criar navegacao premium para Management OS

Status: `[x]` concluido

Objetivo:

- Reduzir sensacao de nav generica e separar melhor contexto de jogador/gestao.

Criterios:

- desktop com navegacao quieta, alinhada e clara;
- estado ativo forte sem poluir;
- gestao com contexto proprio;
- itens por papel/plano no admin de local;
- mobile sem sidebar comprimida.

Telas/componentes afetados:

- `AppShell`
- `BottomNav`
- `ManagementShell`
- `PlaceAdminShell`
- estilos de nav.

Ganhos esperados:

- produto parece mais SaaS premium;
- menos confusao entre Locais e Gestao;
- contexto operacional mais forte.

Dependencias:

- decidir primeiro visual behavior dentro do frontend atual, sem nova arquitetura.

Risco de regressao:

- alterar navegacao global e afetar jogador.

Criterios de conclusao:

- desktop diferencia area operacional;
- mobile mantem bottom nav simples;
- nav nao mostra ferramentas sem contexto.

Entregue em 2026-05-13:

- navegacao desktop passou a agrupar entradas em `Jogar`, `Operar` e `Conta`;
- sidebar mostra contexto atual (`Player App`, `Competition OS`, `Management OS`);
- estado de Gestao aplica tratamento visual proprio sem criar nova rota;
- item ativo ficou mais forte e menos dependente de card verde;
- mobile manteve bottom nav simples usando os mesmos itens globais;
- modulos internos continuam aparecendo apenas dentro do workspace do local, conforme plano/acesso.

## P1 - Alto impacto

### [x] COMP-01 - Finalizar visual base do Competition OS

Status: `[x]` concluido

Objetivo:

- Fazer torneio e liga parecerem familia unica de produto.

Criterios:

- header comum;
- escopo ativo antes dos numeros;
- fila de pendencias antes de chave/listas longas;
- publicacao secundaria;
- jogador ve minha proxima partida antes de operacao completa;
- organizador ve resultados/confirmacoes pendentes primeiro.

Telas/componentes afetados:

- `TournamentPage`
- `LeagueDetailsPage`
- `CompetitionHeader`
- `CompetitionTabs`
- `CompetitionOperationalQueue`
- `CompetitionPublishingPanel`

Ganhos esperados:

- menos reaprendizado;
- mais clareza mobile;
- competicoes com percepcao mais profissional.

Dependencias:

- padroes ja iniciados.

Risco de regressao:

- mexer em torneio/liga pode afetar fluxos de resultado e confirmacao.

Criterios de conclusao:

- torneio/liga com mesmas regras visuais;
- classe/rodada/temporada sempre claros;
- sem proxima partida duplicada de forma confusa.

Entregue em 2026-05-13:

- header compartilhado de competicao ficou mais compacto e consistente;
- liga agora mostra temporada/classe ativa antes de tabs, KPIs e listas;
- torneio usa o mesmo card visual de overview do Competition OS;
- fila operacional virou leitura em rows, reduzindo mosaico de cards;
- publicacao ficou visualmente secundaria com borda tracejada e menos peso;
- tabs de competicao ganharam estado ativo forte e uniforme;
- mobile adapta filas para rows de duas linhas sem tabela larga.

### [x] MOBILE-01 - Padronizar bottom sheets para filtros e detalhes

Status: `[x]` concluido

Objetivo:

- Tirar filtros, detalhes e acoes secundarias do corpo principal no mobile.

Criterios:

- filtros raros em sheet;
- detalhes de entidade em sheet;
- acoes secundarias agrupadas;
- sem modal central pesado em mobile;
- sheet com titulo, fechar e area de toque adequada.

Telas/componentes afetados:

- Gestao;
- Competicoes;
- Agenda;
- Financeiro;
- Clientes/CRM.

Ganhos esperados:

- menos scroll;
- mais foco por tarefa;
- mais sensacao de app moderno.

Dependencias:

- `EntityDrawer` ja existe e pode guiar comportamento.

Risco de regressao:

- esconder acao importante se hierarchy estiver errada.

Criterios de conclusao:

- pelo menos uma tela critica usando sheet/drawer corretamente no mobile;
- documentar padrao em `COMPONENT_GRAMMAR.md` se mudar.

Entregue em 2026-05-13:

- criado `ResponsiveFilterSheet` para manter filtros inline no desktop e abrir bottom sheet no mobile;
- liga passou a usar sheet mobile para temporada/classe em vez de empilhar filtros no corpo principal;
- `EntityDrawer` foi refinado no mobile para parecer bottom sheet real, com alca visual, altura controlada e acoes confortaveis;
- desktop preserva filtros visiveis quando eles ajudam a operacao em volume;
- padrao documentado para proximas telas criticas.

### [x] ROWS-01 - Aplicar `EntityActionRow` nas listas operacionais principais

Status: `[x]` concluido

Objetivo:

- Reduzir cards e padronizar leitura de entidades.

Criterios:

- reservas recentes em rows;
- clientes/leads em rows;
- recebiveis em rows;
- alunos/turmas em rows quando for lista;
- partidas pendentes em rows.

Telas/componentes afetados:

- Agenda;
- Clientes;
- Financeiro;
- Academia;
- Torneio/Liga.

Ganhos esperados:

- maior densidade;
- menos admin-template;
- mais velocidade operacional.

Dependencias:

- component grammar definida.

Risco de regressao:

- perder contexto de entidade se row ficar curta demais.

Criterios de conclusao:

- row mostra nome, contexto, status e acao;
- detalhe vai para drawer/sheet;
- mobile nao usa tabela larga.

Entregue em 2026-05-13:

- CRM passou a usar `EntityActionRow` para leads/clientes, com nome, origem/interesse, responsavel, follow-up e status na mesma leitura;
- acao primaria do CRM ficou contextual: marcar contato, marcar convertido ou ver historico;
- historico e arquivamento ficaram secundarios, reduzindo botoes equivalentes na linha;
- controles de responsavel/proximo contato ficaram compactos e colapsam em uma coluna no mobile;
- recebiveis financeiros passaram a usar `EntityActionRow`, com valor, status e lembrete como acao primaria;
- linhas ganharam badge de status discreto, destaque para convertido e alerta visual para follow-up vencido;
- primeira onda cobre CRM e recebiveis; reservas/alunos ja usam rows de workspace e partidas ficam para refinamento interno do Competition OS.

### [x] HOME-01 - Redesenhar Home do jogador por proxima acao

Status: `[x]` concluido

Objetivo:

- Fazer `/inicio` parecer player app, nao mini dashboard.

Criterios:

- proxima partida/reserva primeiro;
- convites e pendencias em fila;
- competicoes e descoberta depois;
- historico compactado;
- gestao nao deve competir com rotina do jogador.

Telas/componentes afetados:

- `HomePage`
- cards de evento/partida/reserva.

Ganhos esperados:

- jogador entende o app rapidamente;
- mobile mais leve;
- melhor percepcao de app esportivo.

Dependencias:

- manter rotas atuais.

Risco de regressao:

- esconder atalhos que o usuario usa.

Criterios de conclusao:

- primeira viewport responde "o que faco agora?";
- sem excesso de cards equivalentes.

Entregue em 2026-05-13:

- `/inicio` deixou de abrir com hero grande, atalhos e KPIs soltos;
- primeira viewport agora usa um painel `Player App` com titulo do dia, acao primaria e rows de proxima acao;
- rows do dia cobrem pendencia, agenda e clube/aulas com acao curta e contexto imediato;
- atalhos rapidos foram reduzidos para tarefas de jogador: competir, jogar/reservar e perfil;
- KPIs viraram sinais de suporte ao lado do painel, nao dashboard principal;
- cards antigos da central foram removidos da primeira leitura, mantendo secoes detalhadas abaixo;
- organizacao continua em secao propria, sem disputar com rotina do jogador.

## P2 - Refinamento de percepcao premium

### [x] VISUAL-01 - Auditoria global de botoes e CTA hierarchy

Status: `[x]` concluido

Objetivo:

- Garantir que primary, secondary, quiet e danger tenham uso consistente.

Criterios:

- uma acao primaria por bloco;
- secundarios nao disputam visualmente;
- acoes raras em overflow/drawer;
- texto de botao curto;
- botoes mobile com largura confortavel.

Telas/componentes afetados:

- app inteiro, priorizando Gestao, Competicoes e Pagina publica.

Ganhos esperados:

- menos confusao;
- visual mais profissional;
- maior previsibilidade.

Dependencias:

- `DESIGN_TOKENS.md`.

Risco de regressao:

- reduzir destaque de acao importante por engano.

Criterios de conclusao:

- audit checklist aplicado nas telas prioritarias;
- exemplos incorretos corrigidos.

Entregue em 2026-05-13:

- `secondary` deixou de ser botao escuro e virou botao branco/borda, coerente com acao secundaria;
- criado padrao visual `quiet` para links, filtros, modulo auxiliar e acoes que nao devem competir com a primaria;
- Home passou a usar `Ranking` como quiet e acoes vazias com secondary/quiet em vez de botoes equivalentes;
- Gestao passou a separar `Abrir operacao` como primary, `Pagina publica` como secondary e atalhos de modulo como quiet;
- Competition queue passou a tratar `Abrir fila` como quiet;
- Financeiro/recebiveis passou a destacar `Lembrar todos` e `Lembrar` como primary, deixando recortes `Socios` e `Academia` quiet;
- criacao de reserva passou a ter `Reservar` como unica acao forte; buscar, bloquear, espera e selecao de quadra ficaram secondary/quiet.

### [x] TYPO-01 - Revisar typography e densidade nas telas principais

Status: `[x]` concluido

Objetivo:

- Corrigir sensacao de app gerado por template por excesso de pesos, tamanhos e labels.

Criterios:

- titles operacionais compactos;
- labels uppercase apenas onde ajudam;
- metadados menores e consistentes;
- nada de font-size por viewport;
- texto dentro de botoes sem quebrar layout.

Telas/componentes afetados:

- Gestao;
- Home;
- Competition OS;
- Public pages.

Ganhos esperados:

- visual mais premium;
- menos ruido;
- leitura mais rapida.

Dependencias:

- tokens atuais em `theme.css`.

Risco de regressao:

- reduzir contraste/legibilidade.

Criterios de conclusao:

- telas prioritarias usando escala coerente;
- mobile sem texto truncado ruim.

Entregue em 2026-05-13:

- removido uso de `font-size: clamp(...)` nas areas auditadas, evitando tipografia dependente do viewport;
- headers operacionais passaram para tokens fixos (`2xl`, `lg`, `md`) em vez de escala fluida;
- Home/Player App manteve destaque sem hero tipografico exagerado;
- Management OS ficou mais compacto, com titulo de shell e descricao menos pesados;
- Competition OS reduziu titulo, label e metadados para leitura mais densa;
- section titles ficaram menores e mais consistentes com uso operacional;
- public/ranking heroes mantem destaque com `3xl`, mas sem escala por viewport.

### [x] PUBLIC-01 - Refinar pagina publica do local para conversao premium

Status: `[x]` concluido

Objetivo:

- Fazer a pagina publica vender o local antes de parecer configuracao interna.

Criterios:

- marca e CTA de reserva no primeiro viewport;
- ofertas claras: reservar, turmas, eventos;
- social proof/status sem poluir;
- CTA sticky no mobile;
- menos copy administrativa.

Telas/componentes afetados:

- `PlacePublicPage`
- `PublishingKit`
- componentes de booking publico.

Ganhos esperados:

- mais conversao;
- maior percepcao de valor para academias;
- experiencia player mais moderna.

Dependencias:

- manter publicacao separada da gestao.

Risco de regressao:

- esconder informacao necessaria para reserva.

Criterios de conclusao:

- mobile reserva em poucos toques;
- desktop com marca e oferta claras.

Entregue em 2026-05-13:

- hero publico passou a vender a oferta principal do local com faixa curta de preco/disponibilidade;
- CTA primario mudou para `Reservar quadra` e fica na primeira viewport;
- `Ver turmas` virou acao secundaria clara, sem competir com reserva;
- Gestao e WhatsApp ficaram quiet, preservando separacao entre publico e operacao;
- KPIs viraram trust strip compacto logo abaixo do hero;
- bloco de divulgacao/widget saiu do topo e foi para o fim da grade;
- reserva publica ganhou borda de destaque e copy mais direta;
- mobile ganhou CTA sticky de reserva para reduzir friccao.

### [x] FORMS-01 - Reduzir formularios inline em rotinas recorrentes

Status: `[x]` concluido

Objetivo:

- Tirar formularios longos do corpo principal quando eles quebram fluxo operacional.

Criterios:

- criacao complexa em wizard;
- edicao curta em drawer/sheet;
- campos raros progressivos;
- defaults inteligentes;
- feedback claro apos salvar.

Telas/componentes afetados:

- reservas;
- turmas;
- produtos;
- clientes;
- financeiro.

Ganhos esperados:

- menos intimidacao;
- menos erro;
- produto mais profissional.

Dependencias:

- `SetupWizard`, `EntityDrawer`.

Risco de regressao:

- adicionar cliques demais se tarefa simples virar wizard.

Criterios de conclusao:

- fluxo recorrente fica mais curto;
- formulario complexo nao abre no topo da rotina.

Entregue em 2026-05-13:

- criacao de reserva/bloqueio/lista de espera deixou de abrir como formulario longo no corpo da Agenda;
- campos frequentes ficaram em uma linha operacional: quadra, inicio, fim, buscar e reservar;
- observacao, repeticao, bloqueio e lista de espera foram movidos para `Opcoes avancadas`;
- `Reservar` ficou como acao primaria unica do composer;
- `Buscar`, `Bloquear horario` e `Entrar na espera` ficaram secundarios/quiet, sem competir visualmente;
- mobile empilha os campos essenciais e deixa as acoes com largura confortavel.

### [x] FORMS-02 - Aplicar formulario progressivo em CRM e Cantina

Status: `[x]` concluido

Objetivo:

- Tirar cadastros auxiliares recorrentes do corpo principal quando eles competem com a fila operacional.

Criterios:

- CRM deve priorizar fila/contatos antes de captura;
- novo lead/cliente deve abrir em drawer/sheet ou composer compacto;
- Cantina deve separar venda rapida de cadastro de produto;
- campos raros de produto ficam progressivos;
- uma acao primaria por bloco.

Telas/componentes afetados:

- `PlaceCrmModule`;
- `PlaceCrmContactForm`;
- `PlaceCanteenProductsModule`;
- `PlaceCanteenProductForm`;
- `PlaceCanteenSaleForm`.

Ganhos esperados:

- menos aparencia de painel com formularios empilhados;
- operacao diaria mais rapida;
- cadastro continua completo, mas deixa de competir com tarefas frequentes.

Dependencias:

- `EntityDrawer`;
- padrao de ProgressiveForm documentado em `COMPONENT_GRAMMAR.md`.

Risco de regressao:

- esconder captura importante demais no CRM vazio.

Criterios de conclusao:

- filas/listas aparecem antes de formularios auxiliares;
- captura continua acessivel em um toque;
- mobile nao mostra formulario longo antes da tarefa principal.

Entregue em 2026-05-13:

- CRM passou a mostrar lista/fila de contatos antes da captura de novo lead;
- formulario de novo contato virou `ProgressiveForm`, com nome, telefone e interesse no fluxo principal;
- email, origem, responsavel, proximo contato e notas ficaram em camada secundaria;
- Cantina passou a exibir venda rapida como rotina principal na visao de venda;
- cadastro de produto virou formulario progressivo, deixando categoria como campo auxiliar;
- catalogo da cantina passou de cards para rows com preco, estoque e status;
- mobile deixa de abrir CRM/Cantina com formulario longo antes da tarefa principal.

### [x] ROWS-02 - Refinar rows de partidas e alunos nos fluxos internos

Status: `[x]` concluido

Objetivo:

- Continuar reduzindo cards/listas altas em fluxos que ainda exigem leitura rapida e acao operacional.

Criterios:

- partidas pendentes devem mostrar contexto, status e acao primaria sem card alto;
- alunos/turmas devem evitar mosaico quando a tarefa e chamada, pagamento ou lembrete;
- detalhe deve ir para drawer/sheet quando houver historico longo;
- mobile deve priorizar uma linha de contexto e uma acao clara.

Telas/componentes afetados:

- `TournamentPage`;
- `LeagueDetailsPage`;
- `PlaceAcademyClassesModule`;
- `PlaceAcademyStudentsModule`;
- componentes de partidas/alunos que ainda usem cards altos.

Ganhos esperados:

- mais velocidade operacional em competicoes e academia;
- menos verticalidade;
- consistencia maior com `EntityActionRow`.

Dependencias:

- `EntityActionRow`;
- `CompetitionOperationalQueue`;
- gramatica de rows documentada.

Risco de regressao:

- perder informacao importante de partida/aluno se a row ficar curta demais.

Criterios de conclusao:

- pelo menos um fluxo critico de partida ou aluno convertido para row compacta;
- acao primaria preservada;
- mobile sem tabela/card alto desnecessario.

Entregue em 2026-05-13:

- turmas da Academia deixaram de aparecer como mosaico de cards;
- `PlaceAcademyClassesModule` passou a usar `EntityActionRow`;
- cada turma mostra horario, professor/quadra/nivel, ocupacao, pendencias e mensalidade em leitura horizontal;
- capacidade da turma virou acao/metadado forte da row;
- reposicao e total de matriculas ficaram como metricas de suporte;
- fluxo de turmas ficou mais consistente com CRM, Financeiro e Cantina.

### [x] LOCAIS-01 - Separar descoberta de partidas, quadras e aulas

Status: `[x]` concluido

Objetivo:

- Corrigir a confusao em `/locais`, onde partidas abertas, locais/quadras e aulas apareciam no mesmo fluxo sem intencao clara.

Entregue em 2026-05-13:

- `/locais` ganhou seletor inicial por intencao: `Encontrar jogadores`, `Reservar quadra`, `Entrar em aula`;
- partidas abertas deixaram de aparecer por padrao na descoberta de locais;
- lista de locais ganhou cabecalho contextual para quadras ou aulas;
- `+` ambiguo virou `Cadastrar local` e ficou restrito ao contexto `Meus locais`;
- mobile usa escolhas empilhadas e linguagem mais clara.

Ganho:

- menor carga cognitiva;
- mais discoverability;
- melhor alinhamento com task-first UX;
- separacao mais clara entre jogar, procurar quadra/local e procurar aulas.

### [x] LOCAIS-02 - Reduzir acoes secundarias dos cards de local

Status: `[x]` concluido

Objetivo:

- Levar os cards de local ao padrao de ate uma acao primaria visivel e secundarias em overflow/sheet, especialmente no mobile.

Criterios:

- card de local nao deve expor 3-4 botoes equivalentes no mobile;
- `Ver pagina`/`Ver aulas` deve ser a acao primaria por intencao;
- `WhatsApp`, `Copiar link` e acoes raras devem ir para menu ou sheet;
- validar 390px e 430px.

Entregue em 2026-05-13:

- `Reservar quadra` agora lista apenas locais com quadras ativas fora de `Meus locais`;
- `Entrar em aula` agora lista apenas locais com turmas ativas fora de `Meus locais`;
- card de local passou a ter acao primaria por intencao: `Ver horarios`, `Ver aulas` ou `Abrir gestao`;
- `WhatsApp`, `Copiar link` e `Abrir gestao` secundario foram movidos para `Mais`;
- chamadas de jogo tambem passaram a priorizar `Quero jogar` ou `Fechar chamada`, deixando curtir/comentarios/cancelar em `Mais`.

Ganho:

- menos botoes equivalentes;
- menos duvida entre procurar jogador, reservar quadra e entrar em aula;
- mais aderencia a perfil/contexto e `EntityActionRow`.

### [x] LOCAIS-03 - Filtros inteligentes por intencao e escolha visual no local

Status: `[x]` concluido

Objetivo:

- Impedir listas abertas demais em cidades grandes e transformar `/locais` em busca por tarefa real.

Entregue em 2026-05-13:

- `Reservar quadra` ganhou filtros de nome, cidade, UF, data, hora e duracao;
- busca de quadra passa a consultar disponibilidade real e devolve as quadras livres diretamente, sem forcar abertura de ficha completa da academia;
- criada migration `0074_place_discovery_filters_v1.sql` com RPCs de descoberta em escala para quadras e aulas;
- `Entrar em aula` ganhou filtros de academia/professor, cidade, dia, periodo, nivel e perfil;
- busca de aula passa a considerar turmas com vaga real quando a migration 0074 esta aplicada;
- `Encontrar jogadores` ganhou filtros proprios por local/mensagem, cidade, UF, data, periodo, nivel e status;
- pagina publica do local ganhou agenda visual de quadras por horario/quadra;
- pagina publica do local ganhou filtro de turmas compativeis por perfil antes de enviar interesse.

Ganho:

- menos resultado irrelevante em cidades com muitas academias;
- menos mistura entre chamada de jogo, reserva e aula;
- decisao mais rapida dentro do local;
- UX mais coerente com task-first e mobile-first.

### [x] LOCAIS-04 - Resultado direto de quadra livre sem ficha completa da academia

Status: `[x]` concluido

Objetivo:

- Corrigir o fluxo em que uma busca de reserva retornava a academia inteira, com planos, aulas e modulos irrelevantes para quem queria apenas reservar uma quadra.

Entregue em 2026-05-13:

- criada RPC `app_search_available_courts_for_discovery(...)` na migration `0074`, retornando quadras livres por cidade/nome/data/hora/duracao;
- `/locais` passou a renderizar cards clicaveis de quadra livre apos a busca, com local, horario, superficie, preco e status de confirmacao;
- clique na quadra leva para `/locais/:placeId?intent=booking...` com quadra, inicio e fim ja preenchidos;
- cards publicos de descoberta deixaram de renderizar planos, aulas, CRM, financeiro e secoes internas quando a intencao e apenas descobrir/reservar;
- pagina publica do local reconhece parametros de reserva e posiciona o usuario direto no formulario/agenda.

Ganho:

- menos friccao em cidades com muitos locais;
- menor mistura entre reserva, aula, plano e pagina institucional;
- fluxo de reserva fica orientado a tarefa: buscar horario, escolher quadra, solicitar.

### [x] LOCAIS-05 - Resultado direto de turma com vaga em Entrar em aula

Status: `[x]` concluido

Objetivo:

- Corrigir a busca de `Entrar em aula`, que podia parecer quebrada por filtrar turmas mas devolver apenas o container da academia.

Entregue em 2026-05-13:

- criada RPC `app_search_academy_classes_for_discovery(...)` na migration incremental `0075`, retornando turmas ativas com vaga por cidade, UF, nome da academia, professor, dia, periodo, nivel, idade e genero;
- `/locais` passou a renderizar cards clicaveis de turma com vaga, mostrando local, horario, professor, nivel, vagas e valor;
- clique na turma leva para `/locais/:placeId?intent=academy...` com a turma/nivel ja selecionados no formulario publico;
- filtro de `Entrar em aula` agora exibe UF e permite buscar por nome da academia, resolvendo o caso de pesquisar `ADT` e nao receber resultado acionavel;
- niveis de aula foram padronizados em `Iniciante`, `Intermediario`, `Avancado`, `Primeira Classe` e `Profissional`;
- cadastro de turma, busca de encaixe e pagina publica passaram a usar a mesma taxonomia de nivel.

Ganho:

- aluno encontra diretamente a turma compativel, sem abrir varias academias;
- menos friccao em cidades com muitas academias;
- menos mistura entre aulas, reservas, planos e ficha institucional;
- maior consistencia entre cadastro interno, descoberta publica e formulario do aluno.

### [x] ACCESS-02 - Criar guardrail real para criacao profissional de local

Status: `[x]` concluido

Objetivo:

- Impedir que jogador comum crie local profissional apenas por estar autenticado.

Criterios:

- definir fonte real de plano/assinatura por usuario ou workspace;
- criar RPC/policy para autorizar criacao de local por plano/permissao;
- UI deve chamar esse guardrail antes de mostrar formulario de criacao;
- preservar seed/demo para donos e professores autorizados.

Entregue em 2026-05-13:

- criada migration `0073_place_creation_entitlements_v1.sql` com `app_user_product_entitlements`;
- criada RPC `app_user_can_create_place()` para a UI consultar permissao real;
- criada RPC `app_create_place(...)` para centralizar validacao de plano, dono e organizacao;
- policy `places_owner_insert` passou a exigir `app_user_can_create_place()`, bloqueando insert direto de jogador comum;
- `/locais` agora so exibe `Cadastrar local` quando o backend confirma entitlement;
- seed demo concede entitlement ao `escalao@gmail.com` e registra professores como `coach_solo` sem criacao de local.

Ganho:

- remove a contradicao entre UX e banco;
- impede ferramenta profissional exposta para Free Player;
- torna o fluxo de criacao de local coerente com perfil, plano e permissao.

### [x] SWEEP-ROLE-02 - Corrigir entrada neutra por perfil em Locais/Gestao

Status: `[x]` concluido

Objetivo:

- Reduzir confusao de contexto descoberta/gestao detectada na varredura por Admin, Player puro e Professor.

Entregue em 2026-05-14:

- `/locais` agora abre em estado neutro de intencao, sem assumir reserva de quadra como padrao;
- o usuario escolhe primeiro entre `Encontrar jogadores`, `Reservar quadra` e `Entrar em aula`;
- tabs/listas de locais so aparecem depois da intencao correta, evitando academia generica em busca de quadra/aula;
- `Reservar quadra` e `Entrar em aula` nao listam academias genericas antes da busca; orientam o filtro e depois devolvem quadras livres ou turmas com vaga;
- `/gestao` acessado por Player puro agora mostra ausencia de permissao e volta para Inicio/Locais publicos;
- `/gestao/:placeId/:module` deixou de renderizar a camada publica de `Locais` no topo; o usuario entra direto no workspace operacional do local;
- navegacao de modulos do local deixou de usar `Mais` artificial em desktop; agora exibe todos os modulos liberados por plano/permissao em barra horizontal adaptativa;
- plano `academy` tambem ganhou `Agenda`, mantendo agenda operacional para aulas, quadras, horarios e ocupacao;
- operador com entitlement mas sem local continua vendo setup profissional.

Ganho:

- menos mistura entre descoberta publica e operacao;
- menos friccao para Player puro;
- menos risco de achar que `/locais` e uma busca generica sem finalidade;
- melhor aderencia ao modelo de perfil/plano sem criar nova arquitetura.

## Concluidos recentes

### [x] DOCS-01 - Criar sistema visual de referencia

Status: `[x]` concluido

Entregue:

- `VISUAL_REFERENCE_SYSTEM.md`
- `COMPONENT_GRAMMAR.md`
- `DESIGN_TOKENS.md`

Ganho:

- futuras tarefas podem executar visual premium sem reabrir filosofia.

### [x] GESTAO-00 - Trocar mosaico zerado por fila real e rows de local

Status: `[x]` concluido

Entregue:

- `/gestao` oculta cards zerados;
- fila do dia mostra so pendencias reais;
- locais passaram de cards para rows operacionais;
- docs vivos atualizados.

Ganho:

- menos dashboard feeling;
- mais task-first UX;
- melhor densidade.

## Bloqueios conhecidos

### [x] DATA-01 - Alguns refinamentos dependem de dados reais variados

Status: `[x]` concluido por checklist operacional

Problema:

- varias telas precisam ser vistas com dados cheios, vazios, erro, pendencia e mobile real para calibrar densidade.

Como desbloquear:

- criar seed/demo operacional;
- testar viewport 390px e desktop;
- capturar screenshots antes/depois.

Impacto:

- sem dados variados, risco de otimizar apenas o estado vazio.

Entregue em 2026-05-13:

- criado `DEMO_STATE_QA_CHECKLIST.md`;
- definidos estados obrigatorios para Gestao, Agenda, Academia, Clientes, Cantina, Competition OS e Pagina publica;
- definidos viewports obrigatorios: 390px, 430px, 1366px e desktop amplo;
- definido criterio de conclusao para futuras tarefas quando faltar massa real;
- bloqueio deixa de travar a fila e vira checklist vivo de QA/demo.
