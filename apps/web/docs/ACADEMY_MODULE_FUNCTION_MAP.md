# Academy Module Function Map

Status: levantamento funcional baseado nos prints locais de 2026-05-14 e no codigo atual.
Escopo: `Gestao > Academia` do local `Arena Pantanal Tennis`, usuario `escalao@gmail.com`.
Objetivo: servir como mapa de funcoes, inputs, regras basicas e pontos de evolucao das telas `Hoje`, `Turmas`, `Alunos`, `Pendencias`, `Professores` e `Recursos`.

## 1. Contexto comum da tela

### Management OS header

Funcao: confirmar que o usuario esta em um contexto operacional, separado da descoberta publica.

Elementos:
- Eyebrow: `Management OS`.
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

Funcao: mostrar saude operacional da academia antes das subvisoes.

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

Ponto de atencao:
- A tela ainda mostra uma fila superior de `Aulas do dia` e `Pendencias da academia` antes da `Central da academia`. Isso pode duplicar conteudo da aba `Hoje` e `Pendencias`.

## 2. Navegacao interna da Central da academia

Componente: `AcademyWorkspaceShell`.

Abas:
- `Hoje` -> `today`
- `Turmas` -> `classes`
- `Alunos` -> `students`
- `Pendencias` -> `requests`
- `Professores` -> `coaches`
- `Recursos` -> `resources`

Logica basica:
- O estado vem de `academyViewByPlace[p.id]`.
- A troca de aba chama `selectAcademyView(p.id, view)` e atualiza a query `visao`.
- Cada aba tem descricao contextual propria.

Problema atual:
- A area abaixo da `Central da academia` ainda renderiza blocos legados conforme flags:
  - `showAcademyResources`
  - `showAcademyRequests`
  - `showAcademyClasses`
- Por isso `Academia e aulas` aparece abaixo das abas e pode duplicar funcoes da propria aba ativa.

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
- Nao ha input direto nesta aba no estado atual.

Acoes:
- Se nao houver aulas, aparecem acoes:
  - `Ver turmas`
  - `Criar turma`

Logica basica:
- Recebe `todayClasses`, `academyEnrollments`, `todayAttendance`, `academyAbsences`, `openAcademyMakeups`, `activeCourts`.
- Para cada turma do dia:
  - calcula alunos ativos da turma;
  - calcula presencas do dia;
  - calcula faltas avisadas abertas;
  - calcula reposicoes abertas;
  - mostra quadra e professor.

Pontos de evolucao:
- Falta acao direta por aula: abrir chamada, ver alunos, marcar presenca/falta.
- Hoje esta mais informativa do que operacional.

## 4. Aba Turmas

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
- Nao ha inputs diretos nessa lista.

Logica basica:
- Renderiza ate 12 turmas ativas.
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

Funcao atual: lista ate 5 turmas com operacoes administrativas e/ou de aluno.

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

Problema atual:
- Este bloco duplica funcoes de `Turmas`, `Alunos` e `Pendencias`.
- A mistura de formulario dentro de cada turma deixa a tela longa e pesada.

## 5. Aba Alunos

Funcao: localizar alunos por turma/status, ver situacao de pagamento e chamada.

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
- Pagamento e calculado por `paymentMapKey("academy_enrollment", enrollmentId, billingPeriod)`.
- Chamada usa `todayAttendance`.
- Falta avisada chama `reportAcademyAbsence`.
- Check-in/falta chama `markAcademyAttendance`.
- Lembrete chama `onCreatePaymentReminder`.

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

Problema atual:
- A aba `Pendencias` renderiza a fila nova e tambem o bloco legado `Buscar encaixe`, criando duas regioes com pedidos/acoes parecidas.

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
  - troca para aba `Recursos`.

Logica basica:
- Receita estimada = soma de mensalidade das turmas do professor multiplicada por alunos ativos.
- Comissao estimada = receita * percentual de comissao.
- Professores com `userId` aparecem como `Login vinculado`.

Ponto de evolucao:
- `Ajustar agenda` leva para `Recursos`, mas o usuario espera talvez uma agenda do professor filtrada. Isso precisa ficar mais explicito.

## 8. Aba Recursos

Funcao: ver professores, quadras e horarios livres usados para criar turmas sem conflito.

### Cards de resumo

Elementos:
- `Professores`: quantidade e nomes.
- `Quadras`: quantidade e nomes.
- `Horarios abertos`: quantidade.

### Disponibilidade por professor

Conteudo:
- Para cada professor, mostra horarios ocupados no dia selecionado pelo draft de turma.
- Se nao ha turma naquele dia, mostra `livre`.

Logica basica:
- Usa `academyDraft.weekday`.
- Filtra `resourceDayClasses` por `coachId`.

### Disponibilidade por quadra

Conteudo:
- Para cada quadra, mostra horarios ocupados no dia selecionado pelo draft.
- Se nao ha turma naquele dia, mostra `livre`.

Logica basica:
- Usa `academyDraft.weekday`.
- Filtra `resourceDayClasses` por `courtId`.

### Horarios abertos

Conteudo:
- Lista `academySlots` com `status === "open"` no mesmo dia do draft.
- Mostra horario, professor, quadra e capacidade.

Acao:
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
  - troca a aba para `Turmas`.

Ponto de evolucao:
- Hoje a aba depende indiretamente do dia escolhido no draft de turma. Isso nao e obvio.
- Precisa de filtro visivel de dia/data e talvez modo `Professor`/`Quadra`.

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
- Tende a ocultar partes financeiras dependendo de permissao.

### Jogador/aluno

No contexto publico/descoberta, pode:
- enviar interesse em turma;
- solicitar aula avulsa;
- solicitar reposicao se tiver credito aberto.

Ponto de atencao:
- A rota de gestao nao deveria ser a experiencia principal do jogador comum.

## 10. Principais inconsistencias atuais vistas nos prints/codigo

1. Duplicacao estrutural
   - `Central da academia` e `Academia e aulas` convivem na mesma tela.
   - Isso duplica turmas, pedidos, encaixes e recursos.

2. Acoes escondidas ou espalhadas
   - Matricular aluno aparece dentro do bloco legado de turma.
   - Cadastro de professor esta em `Professores`, correto, mas ajuste de agenda leva para `Recursos`, nao para uma agenda clara.

3. Falta de acao operacional na aba Hoje
   - Mostra aula do dia, mas nao abre uma chamada completa por turma.

4. Recursos dependem de estado invisivel
   - A disponibilidade de professores/quadras usa o dia do draft de turma, mas o usuario nao ve claramente esse controle.

5. Limites silenciosos
   - Turmas na lista nova: ate 12.
   - Turmas no bloco legado: ate 5.
   - Alunos: ate 24.
   - Pedidos/reposicoes: ate 8.
   - Encaixes: ate 6.
   - Isso pode ocultar informacao em academias grandes sem paginacao clara.

6. Hierarquia visual ainda confusa
   - Algumas linhas concatenam horario, nome e turma sem separacao visual suficiente.
   - Muitos dados aparecem em texto corrido.

7. Estados vazios pouco orientados
   - `0 alunos encontrados` nao explica que o filtro padrao e `Ativos`.
   - Poderia sugerir `ver pendentes` ou `limpar filtros`.

8. Pendencias e encaixes misturados
   - Resolver pedidos e buscar novos encaixes sao tarefas diferentes.
   - Hoje aparecem juntas, aumentando carga cognitiva.

## 11. Direcao recomendada para evolucao

Plano alvo:

- A evolucao oficial agora esta em `ACADEMY_V2_UX_PLAN.md`.
- Este mapa permanece como registro das funcoes v1 e deve ser usado para garantir que nenhuma funcao seja perdida na migracao.

1. Remover ou transformar o bloco legado `Academia e aulas`.
   - Cada funcao deve morar na aba natural:
     - Turmas: criar/editar turma e grade.
     - Alunos: matricula, status, pagamento, chamada por aluno.
     - Pendencias: aprovacoes e fila operacional.
     - Professores: cadastro, login, comissao, agenda.
     - Recursos: quadras/professores/horarios livres.

2. Fazer `Hoje` virar uma agenda operacional real.
   - Clicar na aula abre alunos, presenca, falta, reposicao e observacoes.

3. Separar `Pendencias` de `Buscar encaixe`.
   - Pendencias = fila para resolver.
   - Encaixe/reposicao = ferramenta de busca guiada, talvez em drawer/sheet.

4. Dar controle explicito em `Recursos`.
   - Filtro de dia/data.
   - Alternancia por professor/quadra.
   - Acoes diretas: criar horario, criar turma, bloquear horario.

5. Melhorar estados vazios e filtros.
   - Explicar o motivo do vazio.
   - Oferecer proxima acao obvia.

6. Reduzir formularios repetidos por turma.
   - Matricula manual deve ser um fluxo contextual, nao um formulario repetido em cada card.

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
