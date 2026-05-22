# Academy Module Function Map

Status: levantamento funcional baseado nos prints locais de 2026-05-14 e no codigo atual.
Escopo: `Gestao > Academia` do local `Arena Pantanal Tennis`, usuario `escalao@gmail.com`.
Objetivo: servir como mapa de funcoes, inputs, regras basicas e pontos de evolucao das telas `Hoje`, `Grade`, `Alunos`, `Pendencias`, `Professores` e `Configuracao`.

## 1. Contexto comum da tela

### Management OS header

Funcao: confirmar que o usuario esta em um contexto operacional, separado da descoberta publica.

Elementos:
- Eyebrow: `Gestao do local`.
- Nome do local.
- Texto contextual: workspace operacional, pagina publica e descoberta ficam fora da tela.
- Acoes:
  - `Voltar para central`: retorna para a central de gestao.
  - `Ver pagina publica`: abre a experiencia publica do local.

Inputs:
- Nenhum input direto.

Logica basica:
- Renderiza dentro da rota `/gestao/:placeId/...`.
- Nao deve misturar busca publica, reserva publica ou cards de descoberta.

### Shell do local

Funcao: mostrar o local em operacao, plano/perfil e modulos disponiveis.

Elementos:
- `ADMIN | PRO: COMPLETO` ou variacao conforme plano/permissao.
- Nome e cidade/UF.
- Indicadores: pendencias e implantacao.
- Navegacao de modulos:
  - `Painel`
  - `Agenda`
  - `Academia`
  - `Clientes`
  - `Financeiro`
  - `Cantina`
  - `Equipe`
  - `Ajustes`

Logica basica:
- Os modulos sao derivados de `placeResourceAccess` e `featureList`.
- Plano e papel controlam visibilidade.
- `staffRole === "coach"` limita parte da visao para o professor.
- `canManagePlace`, `canManageAcademy`, `canManageFinance` liberam acoes sensiveis.

### Resumo do modulo Academia

Funcao: mostrar saude operacional da academia como leitura de suporte, depois da Central da academia.

Elementos:
- Modulo ativo: `Academia`.
- Descricao: turmas, professores, matriculas, chamadas, reposicoes e evolucao.
- Indicador `28 itens para acompanhar`.
- Chips de contexto: `Reservas`, `Academia`, `Socios`, `CRM`, `Financeiro`.
- Status: `Base operacional pronta`.
- KPIs:
  - `Aulas hoje`
  - `Matriculas pendentes`
  - `Encaixes pendentes`
  - `Reposicoes abertas`

Logica basica:
- `Aulas hoje`: turmas ativas cujo `weekday` bate com o dia atual.
- `Matriculas pendentes`: enrollments com `status === "pending"`.
- `Encaixes pendentes`: lesson requests pendentes ou aprovadas sem pagamento.
- `Reposicoes abertas`: makeup credits com `status === "open"`.

Estado atual:
- A `Central da academia` aparece antes dos indicadores agregados.
- A fila rapida `Aulas do dia`/`Pendencias da academia` fica dentro da workspace apenas como apoio contextual.
- A fila rapida nao aparece nas abas `Hoje` e `Pendencias`, evitando duplicar a rotina ativa.
- Quando houver mais itens que o resumo, a UI exibe o restante e permite expandir ou abrir a fila completa.

## 2. Navegacao interna da Central da academia

Componente: `AcademyWorkspaceShell`.

Abas:
- `Hoje` -> `today`
- `Grade` -> `classes`
- `Alunos` -> `students`
- `Pendencias` -> `requests`
- `Professores` -> `coaches`
- `Configuracao` -> `resources`

Logica basica:
- O estado vem de `academyViewByPlace[p.id]`.
- A troca de aba chama `selectAcademyView(p.id, view)` e atualiza a query `visao`.
- Cada aba tem descricao contextual propria.

Estado atual:
- Dentro da rota de Gestao com workspace ativa, `Academia e aulas` nao aparece como bloco paralelo.
- Flags legadas permanecem apenas para superficies fora do workspace de Gestao, principalmente leitura publica/compatibilidade.
- A rotina interna deve continuar usando `AcademyWorkspaceShell` e os modulos `PlaceAcademy*Module`.

## 3. Aba Hoje

Funcao: mostrar aulas do dia, chamada rapida, faltas avisadas e reposicoes imediatas.

Conteudo no print:
- Uma aula hoje:
  - `18:00 - Intermediario Noite`
  - Professora: `Priscila Araujo`
  - Quadra: `Quadra 4`
  - Nivel: `Intermediario`
  - Capacidade: `0/10`
  - Detalhe: sem alunos ativos
  - Metricas: `0 presentes`, `2 faltas avisadas`, `1 reposicao`

Inputs:
- Observacao curta por aluno dentro do drawer de chamada.

Acoes:
- `Fazer chamada`/`Revisar chamada` abre `LessonDrawer`.
- Por aluno: `Presente`, `Falta`, `Avisou falta` e observacao curta.
- Se nao houver aulas, aparecem acoes para `Ver grade` e, quando permitido, `Criar turma`.

Logica basica:
- Recebe `todayClasses`, `academyEnrollments`, `todayAttendance`, `academyAbsences`, `openAcademyMakeups`, `activeCourts`.
- Para cada turma do dia:
  - calcula alunos ativos da turma;
  - calcula presencas do dia;
  - calcula faltas avisadas abertas;
  - calcula reposicoes abertas;
  - mostra quadra e professor.

Estado atual:
- Hoje e operacional: cada aula e row acionavel, com drawer compacto para chamada e reposicoes relacionadas.

## 4. Aba Grade

Funcao: gerenciar grade semanal, vagas, mensalidade e criacao de turmas.

### Lista operacional de turmas

Conteudo:
- Cada turma aparece como row:
  - nome da turma;
  - status (`Em dia` ou pendencias);
  - dia/horario;
  - professor;
  - quadra;
  - nivel;
  - mensalidade;
  - regra de reposicao;
  - total de matriculas;
  - ocupacao ativa/capacidade.

Exemplos do print:
- `Kids Iniciacao`: Seg 07:00-08:00, Gustavo Amaral, Quadra 1, Kids, R$ 320,00, 0/10.
- `Adulto Iniciante`: Ter 08:00-09:00, Priscila Araujo, Quadra 2, Iniciante, 0/10.
- `Intermediario Noite`: Qui 18:00-19:00, Priscila Araujo, Quadra 4, Intermediario, 0/10.

Inputs:
- Busca por turma, professor, quadra, nivel ou aluno.
- Filtro por dia.
- Filtro por status: todas, com vagas, lotadas ou com pendencias.

Logica basica:
- Nao usa limite silencioso: mostra contador `Exibindo X de Y` e `Ver mais turmas` quando necessario.
- Conta matriculas ativas e pendentes.
- Busca a quadra pelo `courtId`.
- Status vira `Em dia` se nao ha matriculas pendentes.

### Montagem de turma

Funcao: criar uma turma completa ou abrir um horario avulso para ser preenchido depois.

Componente: `PlaceAcademyClassSetupModule`.

Wizard com 3 etapas:

1. `Identidade`
   - Inputs:
     - `Nome da turma`
     - `Professor`
     - `Nome exibido do professor`
   - Validacao:
     - exige nome da turma e professor para continuar.

2. `Agenda`
   - Inputs:
     - `Quadra`
     - `Dia da semana`
     - `Horario inicio`
     - `Horario fim`
   - Validacao:
     - exige professor, inicio e fim;
     - bloqueia continuidade se houver conflito de professor ou quadra.
   - Logica de conflito:
     - compara a faixa de horario com turmas existentes no mesmo dia;
     - compara tambem com horarios abertos (`academySlots`) no mesmo dia;
     - ignora o proprio slot quando a turma esta sendo criada a partir de um horario aberto.

3. `Perfil e preco`
   - Inputs:
     - `Nivel`
     - `Genero`: mista, masculina, feminina
     - `Faixa`: adulto ou infantil
     - `Idade min.`
     - `Idade max.`
     - `Vagas`
     - `Mensalidade R$`
   - Niveis padrao atuais:
     - Iniciante
     - Intermediario
     - Avancado
     - Primeira Classe
     - Profissional
   - Validacao:
     - a turma so pode ser criada se tiver nome, professor, horario e sem conflito.

Acoes:
- `Limpar`
  - limpa nome, professor exibido e nivel.
- `Abrir horario`
  - cria um `place_academy_slots` com professor, quadra, dia, hora e capacidade.
  - nao exige nome de turma.
- `Criar turma`
  - cria `place_academy_classes`.
  - normaliza o nivel com `normalizeAcademyLevel`.
  - se veio de slot, marca o slot como `assigned`.

Logica basica de persistencia:
- `createPlaceAcademyClass` insere:
  - place_id, coach_id, court_id, title, coach_name, weekday, starts_at, ends_at, level, gender_scope, age_group, min_age, max_age, allow_makeup, capacity, monthly_fee_cents.
- `createPlaceAcademySlot` insere:
  - place_id, coach_id, court_id, weekday, starts_at, ends_at, capacity, notes.

### Bloco legado `Academia e aulas`

Status atual: nao deve renderizar dentro do workspace de Gestao. Permanece apenas como superficie publica/compatibilidade ate `PUBLIC-PLACE-01` reorganizar a leitura do jogador.

Funcao preservada historicamente: lista ate 5 turmas com operacoes administrativas e/ou de aluno.

Inputs por turma para admin:
- Mensalidade.
- Nome do aluno.
- Email/login opcional.
- Telefone.

Acoes por turma:
- `Salvar mensalidade`
  - chama `updatePlaceAcademyClassPricing`.
- `Matricular aluno`
  - chama `createAcademyEnrollmentForStudent`.
  - cria matricula ativa.
  - se email existir, tenta vincular/criar via RPC.
- Para alunos existentes:
  - ativar/cancelar matricula;
  - marcar pago;
  - enviar lembrete;
  - avisar falta;
  - check-in;
  - falta;
  - registrar evolucao.

Regra atual:
- Na Gestao, essas funcoes moram em `Grade`, `Alunos` e `Pendencias`.
- Nao reintroduzir formulario repetido por turma no corpo da workspace.
- Se a superficie publica ainda precisar mostrar aulas, deve ser tratada como descoberta leve do jogador, nao como operacao interna.

## 5. Aba Alunos

Funcao: localizar alunos por turma/status, ver situacao de pagamento e chamada.

### Lacuna de produto: aluno hoje e matricula, nao contrato

Estado atual:
- A entidade operacional exibida como aluno vem de `place_academy_enrollments`.
- Cada linha representa um aluno dentro de uma turma especifica.
- Se o mesmo usuario fizer duas aulas por semana em turmas/horarios diferentes, ele tende a aparecer como duas matriculas separadas.
- A mensalidade atual pode ser cobrada por `academy_enrollment`, o que funciona para uma turma, mas fica fraco para planos semanais com dois ou mais horarios.
- `createAcademyEnrollmentForStudent` aceita email e tenta vincular a `auth.users`, mas nao cria usuario/convite completo.

Evolucao necessaria:
- Criar ou vincular um usuario aluno como entidade principal.
- Criar um contrato/plano do aluno por academia com `aulas por semana`, `mensalidade`, `status`, `inicio` e `turmas/horarios escolhidos`.
- Manter `place_academy_enrollments` como vinculos por turma para chamada, presenca e historico.
- Agregar o `StudentDrawer` pelo contrato/usuario, mostrando turmas vinculadas, pagamentos, presenca, creditos e evolucao em um unico lugar.
- Permitir selecionar ocorrencias semanais agrupadas: se a mesma turma tiver segunda e quarta, o operador pode escolher segunda, quarta ou ambas.

Suporte backend criado:
- `place_academy_student_contracts` e a entidade canonica de contrato/plano semanal.
- `place_academy_enrollments.contract_id` preserva as matriculas por turma ligadas ao contrato.
- `app_create_academy_student_contract(...)` cria o contrato e as matriculas operacionais nas turmas selecionadas.
- Pagamento/lembrete de mensalidade passam a ter alvo `academy_student_contract`.

Impacto UX:
- `Adicionar aluno` deixa de ser apenas nome/telefone dentro da turma.
- O caminho principal vira `Alunos > Novo aluno` ou `Grade > Turma > Matricular aluno`, ambos abrindo o mesmo drawer/flow de contrato.
- aluno sem login deve aparecer como excecao (`convite pendente` ou `sem login`), nao como padrao invisivel.
- `Grade > Turma > Novo aluno` agora solicita email/login, plano semanal, mensalidade, data de inicio e horarios semanais no mesmo fluxo.
- `Academia > Alunos` agora agrega por contrato quando existe `contract_id`, mostrando plano, mensalidade e horarios vinculados no drawer do aluno.
- O caminho legado por matricula isolada continua preservado para registros antigos e excecoes administrativas.
- `Marcar pago`, `Enviar lembrete`, Financeiro/Recebiveis e Clientes/Relacionamento usam `academy_student_contract` como alvo financeiro quando o aluno possui contrato.
- `academy_enrollment` continua como fallback financeiro apenas para matriculas sem contrato.

### Filtros

Inputs:
- Busca livre: aluno, telefone, turma, professor ou nivel.
- Turma: todas ou uma turma especifica.
- Status:
  - todos
  - ativos
  - pendentes
  - cancelados

Logica basica:
- Filtra `academyEnrollments`.
- Para busca livre, monta texto com:
  - nome do aluno;
  - telefone;
  - titulo da turma;
  - nome do professor;
  - nivel da turma.
- Aplica status e turma selecionada.
- Mostra ate 24 alunos.

### Row de aluno

Conteudo:
- Nome do aluno.
- Turma.
- Telefone.
- Status da mensalidade.
- Status da chamada do dia.
- Ultima evolucao registrada.
- Metricas:
  - presencas;
  - faltas;
  - faltas avisadas;
  - reposicoes abertas;
  - competencia;
  - colegas ativos.

Acoes principais:
- Se matricula pendente: `Ativar`.
- Se ativo e sem chamada hoje: `Check-in`.
- Se ativo, financeiro liberado e mensalidade pendente: `Marcar pago`.
- Caso contrario: estado textual.

Acoes secundarias em `Acoes`:
- `Cancelar`
- `Marcar pago`
- `Lembrar`
- `Avisou falta`
- `Check-in`
- `Falta`

Logica basica:
- Pagamento e calculado primeiro por `paymentMapKey("academy_student_contract", contractId, billingPeriod)` quando a matricula possui contrato.
- Matriculas legadas sem contrato continuam usando `paymentMapKey("academy_enrollment", enrollmentId, billingPeriod)`.
- Chamada usa `todayAttendance`.
- Falta avisada chama `reportAcademyAbsence`.
- Check-in/falta chama `markAcademyAttendance`.
- Lembrete chama `onCreatePaymentReminder`.

Gap atual para reposicao automatica:
- `app_report_academy_absence` agora cria/atualiza `place_academy_planned_absences`, valida dia da turma e aplica antecedencia minima da academia.
- Se a regra estiver ativa e o aviso estiver no prazo, a funcao cria credito de reposicao automaticamente com origem em `source_absence_id`.
- `app_create_academy_makeup_credit` cria credito a partir de uma chamada marcada como `absent`, usando `source_attendance_id`.
- Creditos por falta marcada continuam usando `source_attendance_id`; creditos por ausencia avisada usam `source_absence_id`.

Suporte criado:
- `place_academy_settings.makeup_notice_hours` guarda a antecedencia minima por academia.
- `place_academy_makeup_credits.source_absence_id` permite rastrear credito originado por ausencia avisada.
- `Configuracao > Quadras e horarios` permite editar antecedencia minima e o toggle de criacao automatica de credito.
- `Pendencias` e `StudentDrawer` diferenciam credito por ausencia avisada, falta marcada e credito manual.
- O seed split `web/supabase/seeds/qa_demo` agora popula esse fluxo: contratos reais, planos 1x/2x/3x, mensalidades por contrato, ausencias dentro/fora do prazo e creditos abertos/usados/cancelados.

Estado atual no print:
- `0 alunos encontrados`, porque o filtro padrao e `status: active` e os dados atuais da Arena nao possuem alunos ativos nas turmas exibidas.

Pontos de evolucao:
- Quando nao houver ativos, a tela deveria explicar se existem pendentes/cancelados e sugerir trocar o filtro.
- Acoes importantes ficam escondidas em `details`.

## 6. Aba Pendencias

Funcao: resolver matriculas pendentes, aulas avulsas/drop-in e creditos de reposicao.

### Cards de resumo

Elementos:
- `Matriculas`: quantidade de novos interessados em turmas.
- `Aulas avulsas`: pedidos de reposicao/drop-in que precisam de retorno.
- `Reposicoes`: creditos abertos que precisam virar aula marcada.

Logica basica:
- `Matriculas`: enrollments pendentes.
- `Aulas avulsas`: lesson requests acionaveis.
- `Reposicoes`: makeup credits abertos.

### Fila de matriculas

Conteudo:
- Nome do aluno.
- Turma.
- Telefone quando existir.

Acoes:
- `WhatsApp`
  - abre mensagem pronta para confirmar matricula.
- `Ativar`
  - chama `updateAcademyEnrollmentStatus(enrollmentId, "active")`.
- `Cancelar`
  - chama `updateAcademyEnrollmentStatus(enrollmentId, "cancelled")`.

### Fila de aulas avulsas/reposicoes

Conteudo:
- Nome do aluno.
- Tipo: reposicao ou aula avulsa.
- Turma.
- Data pedida.
- Telefone.

Acoes:
- `WhatsApp`
  - abre mensagem pronta para confirmar pedido.
- `Aprovar`
  - chama `updateAcademyLessonRequestStatus(request.id, "approved")`.
- `Recusar`
  - chama `updateAcademyLessonRequestStatus(request.id, "rejected")`.
- `Marcar pago`
  - aparece para pedido aprovado sem pagamento.
  - cria pagamento stub para `academy_lesson_request`.

### Fila de reposicoes abertas

Conteudo:
- Aluno.
- Turma.
- Data de geracao.
- Telefone quando existir.

Acoes:
- `WhatsApp`
  - mensagem para agendar reposicao.
- `Usar reposicao`
  - chama `updateAcademyMakeupCreditStatus(creditId, "used")`.

### Buscar encaixe

Funcao: encontrar horarios reais para aula avulsa ou reposicao.

Inputs:
- Data.
- Nivel.
- Periodo:
  - manha
  - tarde
  - noite
- Professor.
- Idade.
- Genero:
  - masculina
  - feminina
  - mista

Acao:
- `Buscar`
  - chama RPC `app_search_academy_lesson_fit_slots`.

Logica basica:
- Envia:
  - placeId;
  - requestedOn;
  - level;
  - period;
  - coachId;
  - age;
  - genderScope.
- Retorna turmas com vaga, ausencia avisada ou capacidade disponivel.

### Resultado de encaixe

Conteudo por slot:
- Turma.
- Dia/horario.
- Quadra.
- Professor.
- Nivel.
- Vagas.
- Ausencias avisadas ou capacidade disponivel.
- Valor estimado de aula avulsa: mensalidade / 4.

Inputs por resultado:
- Tipo:
  - aula avulsa;
  - reposicao.
- Nome do aluno.
- Telefone.
- Observacao.

Acao:
- `Solicitar`
  - chama RPC `app_request_academy_lesson_fit`.

Logica basica:
- Para reposicao, exige credito aberto do usuario.
- Cria `academy_lesson_request`.
- Depois atualiza recursos e refaz a busca.

Estado atual:
- A aba `Pendencias` renderiza a fila operacional unica.
- `Buscar encaixe` abre em drawer/sheet, nao como bloco permanente competindo com a fila.

## 7. Aba Professores

Funcao: cadastrar professor, vincular login, controlar comissao e visualizar operacao por professor.

### Cadastro de professor

Inputs:
- Nome.
- Telefone.
- Email.

Acao:
- `Cadastrar professor`
  - desabilitado sem nome.
  - chama `createPlaceCoach`.

Persistencia:
- Insere em `place_coaches`:
  - place_id;
  - name;
  - email;
  - phone.

### Row de professor

Conteudo:
- Nome.
- Email.
- Telefone.
- Status do login.
- Proxima turma na grade.
- Metricas:
  - turmas;
  - alunos ativos;
  - aulas hoje;
  - janelas abertas;
  - receita;
  - comissao.

Inputs:
- Percentual de comissao.
- Email do login, se professor ainda nao esta vinculado.

Acoes:
- `Salvar comissao`
  - chama `updatePlaceCoachCommission`.
  - limita percentual entre 0 e 100.
- `Vincular login`
  - chama RPC `app_link_place_coach_by_email`.
  - se usuario existir, vincula;
  - se nao existir, cria convite pendente.
- `WhatsApp`
  - abre mensagem para alinhar agenda.
- `Ajustar agenda`
  - troca para aba `Configuracao`.

Logica basica:
- Receita estimada = soma de mensalidade das turmas do professor multiplicada por alunos ativos.
- Comissao estimada = receita * percentual de comissao.
- Professores com `userId` aparecem como `Login vinculado`.

Estado atual:
- `Ajustar agenda` leva para `Configuracao`, onde ficam horarios abertos e disponibilidade.
- Uma agenda filtrada por professor ainda pode virar refinamento futuro, mas nao e bloqueador do fluxo atual.

## 8. Aba Configuracao

Funcao: gerir quadras, professores e janelas operacionais para aulas sem depender de estado invisivel.

### Filtro de dia e visao

Elementos:
- `Data`: input explicito; o sistema deriva o dia da semana.
- `Visao`: alterna entre `Por quadra` e `Por professor`.
- `Quadra/Professor`: filtro por recurso ou todos.
- contador do dia: turmas, horarios abertos e bloqueios.

Logica basica:
- `weekdayFromDate(data)` define o dia da escala semanal a partir de uma data de referencia.
- Turmas ativas e `place_academy_slots` sao filtrados pelo weekday derivado.
- A tela nao usa mais o `weekday` do draft de criacao de turma.

### Criar janela semanal

Conteudo:
- professor opcional;
- quadra opcional;
- inicio;
- fim;
- vagas;
- nota.

Acoes:
- `Criar janela semanal`
  - cria `place_academy_slots.status = open`;
  - exige ao menos professor ou quadra.
- `Bloqueio semanal`
  - cria `place_academy_slots.status = blocked`;
  - permite bloquear professor, quadra ou ambos.

Logica basica:
- `createPlaceAcademySlot(...)` aceita `coachId` opcional e `status`.
- O retorno recarrega recursos do local e mostra feedback de sucesso/erro.

### Disponibilidade por professor/quadra

Conteudo:
- grupos por quadra ou por professor;
- rows com turmas, janelas semanais abertas, janelas convertidas e bloqueios semanais;
- estado vazio orienta criar janela semanal ou bloqueio semanal;
- conflito aparece quando duas rows do mesmo recurso se sobrepoem.

Logica basica:
- eventos sao montados a partir de `AcademyClass` e `AcademySlot`;
- `timeRangesOverlap` detecta conflito por grupo;
- nao ha `slice` silencioso.

### Horarios abertos

Conteudo:
- rows de `place_academy_slots.status = open` no dia selecionado;
- mostram horario, professor, quadra e capacidade.

Acoes:
- `Criar turma`
  - copia dados do slot para o draft de criacao de turma:
    - slotId;
    - coachId;
    - courtId;
    - coachName;
    - weekday;
    - startsAt;
    - endsAt;
    - capacity.
  - troca para `Grade` e abre o setup com dados preenchidos.
- `Bloquear`
  - altera `status` do slot aberto para `blocked`.

### Bloqueios

Conteudo:
- rows de `place_academy_slots.status = blocked`;
- mostram qual professor/quadra foi bloqueado e em qual faixa.

Acao:
- `Reabrir`
  - altera `status` para `open`.

Risco residual:
- conversao de slot em turma foi coberta posteriormente pela RPC `app_create_academy_class_from_slot(...)`.
- disponibilidade recorrente minima foi mantida em `place_academy_slots`; vigencia por data e bloqueio pontual continuam gap futuro se QA real exigir.

## 9. Regras de acesso e variacoes por perfil

### Admin/manager

Pode:
- ver todos os professores;
- ver todas as turmas;
- criar turma;
- abrir horario;
- cadastrar professor;
- matricular aluno;
- aprovar/cancelar matricula;
- aprovar/recusar encaixe;
- registrar presenca/falta;
- avisar falta;
- operar recursos.

### Financeiro liberado

Pode:
- marcar mensalidade como paga;
- enviar lembrete de pagamento;
- salvar mensalidade da turma;
- salvar comissao de professor;
- marcar aula avulsa como paga.

### Professor

Logica atual:
- `displayedCoaches` vira apenas o professor vinculado ao login.
- `visibleAcademyClasses` mostra apenas turmas desse professor.
- Em modo professor sem gestao completa, a superficie da Academia fica limitada a `Aulas`, `Turmas` e `Alunos`.
- `visibleAcademyEnrollments`, reposicoes abertas e fila operacional sao filtrados pelas turmas desse professor.
- `Pendencias`, `Professores` e `Configuracao` nao aparecem para professor sem permissao de gestao.
- Professor sem `place_coaches.user_id` vinculado recebe estado vazio claro e nao herda turmas por `coach_name`.
- Partes financeiras continuam ocultas quando `canManageFinance` nao esta liberado.

### Jogador/aluno

No contexto publico/descoberta, pode:
- enviar interesse em turma;
- solicitar aula avulsa;
- solicitar reposicao se tiver credito aberto.

Ponto de atencao:
- A rota de gestao nao deveria ser a experiencia principal do jogador comum.

## 10. Estado atual depois da v2

O workspace de Gestao da Academia ja segue a arquitetura alvo de `ACADEMY_V2_UX_PLAN.md`:

1. `Hoje`
   - rows de aulas do dia;
   - drawer de chamada;
   - presenca, falta, ausencia avisada, observacao e reposicoes relacionadas.

2. `Grade`
   - busca/filtros;
   - lista sem limite silencioso;
   - drawer de turma para dados, alunos, mensalidade e historico;
   - criacao de turma/horario em disclosure de setup, nao como formulario repetido por turma.

3. `Alunos`
   - busca/filtros;
   - agregacao por contrato quando existe `contract_id`;
   - drawer do aluno com dados, matricula, financeiro, presenca, evolucao, reposicoes e historico;
   - CTA `Nova matricula` visivel.

4. `Pendencias`
   - fila unica de matriculas, aulas avulsas/reposicoes e creditos abertos;
   - `Buscar encaixe` em drawer;
   - WhatsApp secundario;
   - sem limite silencioso.

5. `Professores`
   - lista operacional;
   - drawer para dados, login, comissao, turmas e agenda;
   - modo professor filtrado pelo login vinculado.

6. `Configuracao`
   - quadras, horarios abertos, disponibilidade, bloqueios e regra de antecedencia de reposicao.

7. Fila rapida da workspace
   - aparece apenas como apoio contextual fora das abas `Hoje` e `Pendencias`;
   - nao corta aulas ou pendencias silenciosamente;
   - mostra restante, expande ou leva para a fila completa.

## 11. Direcao de continuidade

O foco daqui em diante nao e reabrir a v2 da Academia, mas manter a disciplina nas proximas areas:

1. Nao reintroduzir blocos duplicados dentro da Gestao.
2. Nao voltar a formularios repetidos por row/card.
3. Manter aluno como contrato/usuario quando houver plano semanal.
4. Manter reposicao como credito rastreavel, separado de solicitacao e aula avulsa.
5. Validar mobile com dados reais grandes, principalmente drawers e toolbars.
6. Tratar a superficie publica de aulas em `PUBLIC-PLACE-01`, com linguagem de jogador e sem cockpit interno.

## 12. Evolucao aplicada em ACADEMY-V2-02

Data: 2026-05-14

Mudancas aplicadas na Grade:

- `Turmas` ja tinha virado `Grade` no corte anterior; agora a subvisao ganhou busca e filtros.
- A lista deixou de usar limite silencioso de 12 turmas. Agora informa `Exibindo X de Y` e oferece `Ver mais turmas`.
- Cada turma abre `ClassDrawer` com dados, mensalidade, alunos e historico curto.
- Mensalidade deixou de ser input repetido por row e passou para o drawer.
- Matricula manual deixou de ficar repetida por turma no corpo principal e passou para o drawer.
- Acoes por aluno da turma foram preservadas: ativar, cancelar, marcar pago e lembrar, conforme permissao.
- Edicao de turma passou a persistir com suporte backend minimo em `updatePlaceAcademyClass(...)`.
- Criacao de nova turma/horario ficou recolhida em disclosure para nao disputar com a operacao da Grade.

## 13. Evolucao aplicada em ACADEMY-V2-03

Data: 2026-05-14

Mudancas aplicadas em Alunos:

- `Alunos` virou a entrada unica para localizar aluno e resolver matricula, pagamento, presenca, ausencia avisada, evolucao e reposicoes em contexto.
- A toolbar agora filtra por busca, turma, status, pagamento e presenca/reposicao.
- A lista deixou de usar limite silencioso de 24 alunos. Agora informa `Exibindo X de Y` e oferece `Ver mais alunos`.
- Cada aluno abre `StudentDrawer` com secoes:
  - `Dados e matricula`;
  - `Financeiro`;
  - `Presenca e faltas`;
  - `Evolucao`;
  - `Reposicoes e historico`.
- Edicao de matricula ganhou persistencia real em `updateAcademyEnrollment(...)`.
- Acoes preservadas no drawer:
  - ativar/cancelar/reativar matricula;
  - marcar mensalidade paga;
  - enviar lembrete;
  - check-in;
  - marcar falta;
  - registrar ausencia avisada;
  - registrar evolucao;
  - ver creditos de reposicao e historico.
- Acoes financeiras continuam condicionadas a permissao.
- Estados vazios agora explicam se nao ha alunos ou se filtros esconderam resultados.

Risco residual:

- email de aluno nao aparece como busca direta porque a tabela de matricula atual nao expoe email na listagem; quando o login/perfil do aluno for agregado ao drawer, a busca deve incluir email real.
- usar/agendar/baixar credito de reposicao fica para `Pendencias`, pois ali existe a fila operacional e a ferramenta de encaixe.

## 14. Evolucao aplicada em ACADEMY-V2-04

Data: 2026-05-14

Mudancas aplicadas em Pendencias:

- `Pendencias` deixou de ser tres blocos/cards e virou fila operacional unica.
- A fila agora aceita busca textual, filtro por tipo e filtro por status.
- Tipos cobertos:
  - matricula pendente;
  - aula avulsa/reposicao solicitada;
  - credito de reposicao aberto.
- Acoes principais por row:
  - `Ativar` matricula;
  - `Aprovar` solicitacao;
  - `Marcar pago` aula avulsa aprovada sem pagamento;
  - `Buscar encaixe` para credito de reposicao.
- WhatsApp saiu da prioridade visual e foi para `Mais`.
- A lista deixou de usar `slice(0, 8)` silencioso e agora mostra `Exibindo X de Y` com `Ver mais pendencias`.
- `Buscar encaixe` deixou de ser disclosure permanente no corpo da pagina e passou a abrir `FitDrawer`.
- `PlaceAcademyFitModule` tambem deixou de esconder resultados de pedidos/encaixes com limites silenciosos.

Risco residual:

- o fluxo de agendar reposicao para um aluno especifico ainda usa a busca de encaixe global. O backend atual usa `requestAcademyLessonFit` e seleciona credito de reposicao pelo usuario logado; para secretaria vincular diretamente `credito -> turma/data`, sera necessario suporte transacional especifico.
- `Marcar como usada` continua preservado como acao existente, mas nao deve ser confundido com agendamento completo.

## 15. Evolucao aplicada em ACADEMY-V2-05

Data: 2026-05-14

Mudancas aplicadas em Hoje:

- `Hoje` deixou de usar grid de cards com limite silencioso e virou lista operacional de aulas do dia.
- Cada aula exibe:
  - horario;
  - turma;
  - professor;
  - quadra;
  - quantidade de alunos;
  - presentes;
  - faltas;
  - faltas avisadas;
  - reposicoes abertas.
- `Fazer chamada` abre `LessonDrawer`.
- `LessonDrawer` contem:
  - resumo da aula;
  - avisos de falta relacionados;
  - lista de alunos ativos;
  - status individual de chamada;
  - observacao curta;
  - acoes `Presente`, `Falta` e `Avisou falta`;
  - reposicoes abertas relacionadas a turma.
- A rotina de chamada nao usa wizard.
- Turma sem alunos orienta a abrir `Grade`.

Risco residual:

- registrar evolucao tecnica continua no `StudentDrawer`, nao no `LessonDrawer`, para manter `Hoje` focado em chamada e rotina diaria.
- `Avisou falta` disparado pela chamada usa a data padrao do fluxo existente; ajuste fino de data/nota fica em `Alunos`.

## 16. Evolucao aplicada em ACADEMY-V2-06

Data: 2026-05-14

Mudancas aplicadas em Professores:

- `Professores` passou a ter cadastro rapido separado da lista.
- A lista ganhou busca e filtros por:
  - todos;
  - ativos;
  - inativos;
  - sem login;
  - com turmas.
- Cada professor virou row operacional com:
  - proxima turma;
  - contato;
  - status de login;
  - turmas;
  - alunos ativos;
  - aulas hoje;
  - janelas abertas;
  - receita;
  - comissao estimada.
- Comissao e login deixaram de ser inputs permanentes em cada row.
- `CoachDrawer` concentra:
  - dados do professor;
  - status ativo/inativo;
  - WhatsApp;
  - ajuste de agenda;
  - comissao;
  - login/vinculo/convite;
  - turmas e alunos;
  - agenda e disponibilidade.
- Criado suporte real `updatePlaceCoach(...)` para persistir nome, telefone, email, status e comissao.

Risco residual:

- especialidades, niveis atendidos, bio publica e observacoes internas foram cobertos posteriormente pelo schema avancado de professor.
- disponibilidade detalhada continua em `place_academy_slots`; vigencia por data permanece gap futuro se QA real exigir.

## 17. Evolucao aplicada em ACADEMY-BE-01

Data: 2026-05-14

Mudanca aplicada:

- O fluxo `Configuracao > horario aberto > Criar turma` agora usa a RPC `app_create_academy_class_from_slot(...)`.
- A RPC recebe `place_id`, `slot_id` e os dados essenciais/avancados da turma.
- Antes de criar, valida:
  - permissao de gestor do local;
  - slot pertencente ao local;
  - slot com status `open`;
  - dia, horario, professor e quadra iguais ao horario aberto selecionado.
- A transacao marca o slot como `assigned` e cria a turma em `place_academy_classes`.
- Se permissao, conflito, reserva ou validacao falhar, a turma nao fica criada parcialmente.
- Criacao de turma sem `slotId` continua no fluxo normal `createPlaceAcademyClass(...)`.

Impacto operacional:

- Secretaria nao precisa revisar `Configuracao` para corrigir slot que ficou aberto apos criar turma.
- A acao `Criar turma neste horario` passa a ser confiavel como uma unica operacao.
- Triggers existentes seguem responsaveis por conflitos de professor, quadra e reservas.

## 18. Evolucao aplicada em ACADEMY-BE-02

Data: 2026-05-14

Mudanca aplicada:

- `Pendencias > Reposicao aberta > Agendar reposicao` agora seleciona um credito especifico e abre o `FitDrawer`.
- O drawer mostra contexto do aluno, turma de origem e credito aberto.
- A acao primaria muda para `Agendar reposicao`.
- Criada RPC `app_admin_schedule_academy_makeup_credit(...)` para vincular `credito -> turma/data` em transacao unica.
- A RPC valida permissao, local, credito `open`, turma ativa, dia compativel, vaga operacional e duplicidade de solicitacao ativa.
- Ao agendar, cria `place_academy_lesson_requests` aprovada com `request_type = makeup`, pagamento `waived`, marca o credito como `used` e usa ausencia aberta quando houver.

Impacto operacional:

- Secretaria nao depende mais do login do aluno para usar um credito de reposicao.
- `Reposicao aberta`, `solicitacao de reposicao` e `aula avulsa/drop-in` ficam separados por acao e persistencia.

## 19. Evolucao aplicada em ACADEMY-BE-03

Data: 2026-05-14

Decisao aplicada:

- Nao foi criada tabela nova de disponibilidade recorrente nesta rodada.
- `place_academy_slots` ja representa a escala semanal recorrente minima por `weekday`, professor, quadra, inicio, fim, status e observacao.
- A tela de `Configuracao` passou a comunicar esse modelo explicitamente:
  - `Escala semanal`;
  - `Data de referencia`;
  - `Janela semanal aberta`;
  - `Janela convertida`;
  - `Bloqueio semanal`.

Impacto operacional:

- Gestor entende que esta configurando uma rotina semanal, nao uma reserva pontual.
- Criacao de turma e busca de encaixe continuam usando o mesmo modelo, sem duplicar disponibilidade.
- Vigencia por data e bloqueio pontual permanecem gap futuro se QA real exigir esse nivel de agenda.

## 20. Evolucao aplicada em ACADEMY-BE-04

Data: 2026-05-14

Mudanca aplicada:

- Criada migration `0078_academy_coach_profile_fields_v1.sql`.
- `place_coaches` recebeu:
  - `specialties text[]`;
  - `level_scopes text[]`;
  - `public_bio text`;
  - `internal_notes text`;
  - `public_profile_enabled boolean`.
- Policy `place_coaches_read` foi restringida ao contexto de gestao da academia para proteger observacoes internas.
- `places.ts` lista e salva esses campos em `AcademyCoach`.
- `CoachDrawer` recebeu a secao `Perfil operacional`.

Funcao de cada campo:

- `specialties`: especialidades praticas do professor, como kids, iniciantes, duplas ou preparacao para torneio.
- `level_scopes`: niveis que o professor atende usando o padrao da academia: Iniciante, Intermediario, Avancado, Primeira Classe e Profissional.
- `public_bio`: resumo curto para uso em pagina publica quando habilitado.
- `internal_notes`: combinados e restricoes visiveis apenas para operacao.
- `public_profile_enabled`: controla se o perfil pode ser exibido publicamente quando a pagina do local usar essa informacao.

Impacto operacional:

- Cadastro rapido continua nome, telefone e email.
- Campos avancados ficam no drawer, sem poluir a row.
- Nao ha campo falso: tudo que aparece em `Perfil operacional` persiste em banco.
- Comissao continua separada e condicionada a permissao financeira.
