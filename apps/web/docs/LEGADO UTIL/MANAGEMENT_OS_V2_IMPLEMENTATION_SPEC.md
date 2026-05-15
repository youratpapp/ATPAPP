# Management OS v2 Implementation Spec

Data: 2026-05-15

Fonte: `RESTRUCTURE_SOURCE_OF_TRUTH_POLICY.md`, `MANAGEMENT_OS_V2_UX_PLAN.md`, `ROLE_BASED_RESTRUCTURE_IMPLEMENTATION_SPEC.md`, `ACADEMY_V2_UX_PLAN.md`, `AGENDA_MODULE_FUNCTION_MAP.md`, `ACADEMY_MODULE_FUNCTION_MAP.md`, relatorios de QA manual e referencias de mercado analisadas.

## Politica De Legado

Use MDs antigos para preservar funcoes, regras, acoes financeiras, permissoes, nomenclatura e backend. Nao preserve a organizacao antiga quando ela abrir com KPIs, misturar configuracao com rotina, mostrar modulos sem permissao ou criar pagina infinita no mobile.

Na v2, Management OS e organizado por papel, rotina e fila operacional.

## Objetivo

Transformar a gestao em um sistema operacional profissional: denso o suficiente para trabalho real, mas organizado por rotina e permissao.

Gestao nao deve parecer uma colecao de dashboards, cards e formularios. Deve parecer uma bancada de trabalho:

- o que preciso resolver agora;
- onde opero a rotina;
- onde configuro estrutura;
- onde vejo relatorio quando necessario.

## Nao Objetivos

- Nao reduzir capacidade operacional.
- Nao esconder funcoes sensiveis sem alternativa.
- Nao mostrar tudo para todos os papeis.
- Nao transformar rotina diaria em wizard.
- Nao abrir modulo com KPI irrelevante se existe fila acionavel.

## Papeis E Superficies

### Gestor

Ve:

- Agenda;
- Academia;
- Financeiro;
- Clientes/CRM;
- Cantina, se plano permitir;
- Equipe;
- Ajustes.

Prioridade:

- pendencias do local;
- operacao do dia;
- configuracao estrutural secundaria.

### Recepcao / Front Desk

Ve:

- Agenda;
- Academia operacional;
- Clientes basico;
- recebimentos limitados, se permitido.

Nao deve ver:

- relatorio financeiro completo;
- configuracao profunda;
- cantina, se nao opera;
- dados empresariais sem permissao.

### Financeiro

Ve:

- recebiveis;
- marcar pago;
- lembretes;
- despesas;
- origem da cobranca.

Nao deve depender de navegar pela Academia ou Agenda para encontrar cobrancas.

### Professor / Coach

Ve:

- aulas de hoje;
- suas turmas;
- seus alunos;
- chamada;
- agenda;
- comissao, se permitido.

Nao deve ver:

- CRM completo;
- cantina;
- financeiro completo;
- operacao de outros professores sem permissao.

### Jogador Sem Acesso De Gestao

Nao entra em Management OS.

Se acessar por URL:

- estado vazio claro;
- CTA para voltar ao app do jogador.

## Shell De Gestao

### Ordem Visual Desktop

1. contexto do local;
2. navegacao de modulos;
3. fila operacional do modulo ativo;
4. lista/rotina principal;
5. metricas resumidas;
6. configuracao/relatorios.

### Ordem Visual Mobile

1. header compacto;
2. seletor de modulo;
3. subvisao/tabs;
4. fila/lista principal;
5. CTA fixo quando houver acao primaria;
6. metricas recolhidas;
7. configuracao em subvisao.

Regras:

- nao usar hero grande em gestao;
- nao empilhar todos os modulos;
- nao deixar subnav abaixo de resumos longos;
- modulo desativado nao aparece como KPI operacional;
- se houver loading, usar skeleton proporcional, nao gaps vazios.

## Agenda

Responsabilidade:

- operar reservas, disponibilidade, bloqueios, espera e regras.

Subvisoes:

- `Hoje`;
- `Calendario`;
- `Nova reserva`;
- `Espera`;
- `Quadras e regras`.

### Hoje

Mostra:

- reservas pendentes;
- proximas reservas;
- recebimentos de reserva, se permitido;
- bloqueios relevantes.

Rows:

- jogador;
- quadra;
- horario;
- status;
- acao primaria.

### Calendario

Desktop:

- grade por quadra/horario;
- clique em slot abre detalhe/reserva.

Mobile:

- nenhuma quadra pode sumir;
- usar seletor de quadra, scroll horizontal claro ou layout por quadra;
- slots precisam continuar acionaveis.

### Nova Reserva

Fluxo:

1. data;
2. horario;
3. duracao;
4. quadra;
5. jogador;
6. telefone;
7. confirmar.

Regras:

- resultado de busca fica inline no formulario;
- sem disponibilidade sugere outro horario ou lista de espera;
- banner global nao deve ser usado para resultado normal;
- campo duracao nunca fica cortado.

### Espera

Rows:

- jogador;
- horario desejado;
- quadra/local;
- status;
- acao primaria: convidar/promover/cancelar.

## Academia

Fonte detalhada:

- `ACADEMY_V2_UX_PLAN.md`;
- `ACADEMY_MODULE_FUNCTION_MAP.md`.

Subvisoes obrigatorias:

- `Hoje`;
- `Grade`;
- `Alunos`;
- `Pendencias`;
- `Professores`;
- `Configuracao`.

### Hoje

Responsabilidade:

- operar aulas do dia.

Rows:

- horario;
- turma;
- professor;
- quadra;
- ocupacao;
- acao: fazer chamada/abrir aula.

Comportamento:

- row/card de aula deve abrir chamada ou parecer neutro;
- presente/falta muda feedback imediatamente;
- salvar persiste;
- ausencia avisada gera reposicao conforme regra.

### Grade

Responsabilidade:

- turmas e horarios.

Deve:

- listar turmas sem slice silencioso;
- ter busca/filtros/ver todos/paginacao;
- abrir drawer de turma;
- preservar editar, matricular, mensalidade, alunos e historico.

Nao deve:

- repetir formulario de matricula/mensalidade em cada turma;
- usar wizard aberto no corpo.

### Alunos

Responsabilidade:

- encontrar aluno e resolver situacao.

Deve:

- ter CTA visivel `Nova matricula` ou `Matricular aluno`;
- buscar por nome/telefone/email;
- abrir drawer do aluno;
- diferenciar usuario linkado, convite e aluno manual.

### Pendencias

Responsabilidade:

- limpar fila operacional.

Tipos:

- matricula pendente;
- aula avulsa/drop-in;
- solicitacao de reposicao;
- reposicao aberta;
- pagamento pendente.

Busca de encaixe:

- ferramenta em drawer/sheet;
- nao ocupa a fila principal.

### Professores

Responsabilidade:

- professor, agenda, turmas, comissao e login.

Regras:

- comissao nao fica input aberto em todas as linhas;
- login vinculado mostra nome/email;
- convite pendente nao concede acesso.

### Configuracao

Responsabilidade:

- estrutura da academia.

Inclui:

- quadras;
- horarios abertos;
- disponibilidade;
- regras de reposicao;
- bloqueios.

## Financeiro

Responsabilidade:

- receber e controlar dinheiro do local.

Subvisoes:

- `Recebiveis`;
- `Pagos`;
- `Despesas`;
- `Resumo`;
- `Regras`.

Primeira leitura:

- vencidos;
- vencem hoje;
- pendentes por origem;
- acoes: cobrar, enviar lembrete, marcar pago.

Row de recebivel:

- pagador;
- origem;
- periodo;
- valor;
- vencimento;
- status;
- acao primaria.

Origem deve ser clara:

- reserva;
- mensalidade de academia;
- plano/socio;
- aula avulsa;
- produto/POS;
- torneio/liga.

Permissao:

- apenas papel financeiro/gestor ve financeiro completo;
- professor pode ver comissao propria quando habilitado;
- jogador ve apenas propria cobranca no Player App.

## Clientes / CRM

Responsabilidade:

- relacionamento, leads e follow-up.

Primeira leitura:

- leads novos;
- follow-ups hoje;
- contatos sem retorno;
- contatos convertidos/arquivados em filtro.

Row:

- nome;
- origem;
- interesse;
- proxima acao;
- dono;
- acao primaria.

Detalhe:

- drawer com historico, notas, WhatsApp e converter/arquivar.

Nao deve:

- duplicar financeiro;
- virar feed social;
- mostrar WhatsApp como acao primaria quando a tarefa real e aprovar/cobrar/converter.

## Cantina / POS

Responsabilidade:

- venda rapida e estoque.

Se plano nao habilita:

- nao mostrar KPI operacional;
- mostrar estado de plano apenas em contexto de ajustes/upgrade.

Subvisoes:

- `Vender`;
- `Estoque`;
- `Vendas do dia`;
- `Produtos`.

Primeira leitura:

- botao vender;
- produtos populares;
- estoque baixo;
- total do dia.

## Equipe

Responsabilidade:

- pessoas, papeis e acesso real.

Fluxo:

1. buscar usuario por nome/email;
2. selecionar usuario quando existir;
3. escolher papel;
4. enviar convite;
5. usuario aceita;
6. acesso aparece.

Regras:

- convite pendente nao libera modulo;
- card deve mostrar nome se usuario existir;
- papel define menus e rotas;
- remover papel revoga visibilidade.

Papeis:

- gestor;
- recepcao;
- financeiro;
- professor;
- POS/cantina, se existir.

## Ajustes

Responsabilidade:

- configuracao estrutural e publicacao.

Subvisoes:

- dados publicos;
- recursos;
- regras de reserva;
- regras de academia;
- planos/produtos;
- permissoes;
- publicacao.

Nao deve ser primeira tela quando ha pendencias operacionais.

## Componentes Reutilizaveis

- `ManagementWorkspaceShell`;
- `ManagementModuleSwitcher`;
- `ManagementSubTabs`;
- `OperationalQueue`;
- `OperationalQueueRow`;
- `DenseEntityRow`;
- `EntityDrawer`;
- `MobileBottomSheet`;
- `PermissionGateState`;
- `PlanDisabledState`;
- `InlineSearchResult`;
- `CompactMetricStrip`;
- `ConfigSection`.

## Linguagem

Usar linguagem de rotina:

- `Reservas pendentes`;
- `Fazer chamada`;
- `Marcar pago`;
- `Enviar lembrete`;
- `Nova matricula`;
- `Horario aberto`;
- `Ausencia avisada`;
- `Reposicao aberta`;
- `Solicitacao de reposicao`;
- `Aula avulsa`.

Evitar:

- nomes internos como entidade principal;
- mensagens SQL/RPC;
- texto explicando a arquitetura;
- labels genericas como `Recursos` quando `Quadras e horarios` e mais claro.

## Criterios De Aceite

- cada papel ve somente o que usa;
- operador abre modulo e encontra proxima tarefa;
- subnav aparece antes de metricas/resumos;
- mobile nao empilha cockpit;
- rotinas usam rows/drawers;
- setup usa wizard somente quando raro/complexo;
- modulo desativado nao aparece como operacao;
- erros tecnicos nao aparecem crus;
- todas as acoes primarias persistem ou documentam gap.

## QA Minimo Por Task

- gestor desktop e mobile;
- recepcao mobile;
- financeiro;
- professor;
- usuario sem acesso;
- plano com cantina desativada;
- 390px e desktop;
- loading e empty states.
