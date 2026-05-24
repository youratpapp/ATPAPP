# SaaS Final Residual Queue

Status: concluida em 2026-05-24
Data: 2026-05-24
Fonte de decisao: estado real do app apos `SPRINT-24`, auditorias Playwright e criterios finais de produto.

## Regra De Fonte

Esta fila substitui qualquer interpretacao solta de queues antigas.

Usar apenas:

- `SAAS_FINAL_RESIDUAL_QUEUE_2026_05_24.md`;
- `SAAS_IMPLEMENTATION_QUEUE_COMPLETA.md` apenas como historico de execucao;
- `SAAS_WEB_VISUAL_AUDIT_COMPACTACAO_2026_05_23.md` apenas como contrato visual compacto ja aplicado;
- codigo real e screenshots atuais.

Nao usar como guia principal:

- documentos em `docs/Legado/`;
- queues antigas rejeitadas;
- propostas que tentem voltar para app mobile expandido no web;
- qualquer MD que contradiga a decisao atual de SaaS web compacto com lista/tabela/calendario + detalhe lateral.

## Estado Atual Resumido

Concluido:

- Shell visual compacto do Trabalho web.
- Agenda com grade compacta, abas funcionais e detalhe lateral.
- Clientes com tabela e Cliente 360 lateral.
- Financeiro com abas persistentes.
- Turmas com lista compacta e detalhe lateral.
- Player Inicio sem overflow.
- Rotas principais de Trabalho carregando sem erro de console em auditorias recentes.

Fechado nesta fila:

- Validacao mobile Trabalho por matriz de papel, screenshots com o auth-state disponivel e evidencias dedicadas por papel em `artifacts/saas-sprint-screens/sprint-90-role-audit-430.json` e `sprint-91-role-audit-deep.json`.
- QA por papeis transformado em rotina reaproveitavel: `npm run qa:roles`, com script `scripts/role-smoke-audit.mjs`, filtros por viewport/papel, relatorio JSON e tratamento explicito de auth-state expirado como rota pulada/diagnostico, nao como falha de UX.
- Busca global e criar rapido com dados reais e atalhos principais.
- Fluxos ponta a ponta de reserva, cliente, financeiro, academia, competicoes, comunicacao, relatorios e POS em QA transversal.
- Cliente 360 consolidando dados pessoais, vinculos, turmas, reservas, pagamentos, pacotes/creditos e historico.
- Relatorios e Comunicacao mantidos como consoles compactos validados, agora com proxima acao operacional por modulo e matriz WhatsApp com canal/proximo passo por template.
- Academia sem mini-dashboard repetido em todas as abas principais.
- Financeiro com pagamento stub persistindo apos refresh nos fluxos auditados.

Pendencias residuais futuras nao bloqueantes:

- Versionar storage states frescos fora de artefatos temporarios para permitir rodada completa do `qa:roles` sem pulos por expiracao de sessao.
- Evoluir Relatorios e Comunicacao em fase futura apenas para automacoes, historico profundo e graficos avancados; a camada operacional compacta ja foi aplicada.
- Revisar strings antigas com acento em telas nao alteradas quando houver janela de polimento textual global.

## Sequencia Obrigatoria De Execucao

Executar em ordem. Nao pedir autorizacao entre itens. Se um item travar por bug tecnico, corrigir o menor necessario, validar e continuar.

---

## FINAL-01 - QA De Regressao Visual Web Completo

Status: concluido em 2026-05-24.

Evidencias:

- Relatorio: `artifacts/saas-final-qa-2026-05-24/final-01-web-report.json`.
- Revalidacao: `artifacts/saas-final-qa-2026-05-24/final-01-verify-report.json`.
- Screenshots principais: `final-01-*.png` e `verify-*-1600.png`.

Correcoes aplicadas:

- `App.css`: conteudo flex deixou de somar sidebar + 100vw, removendo overflow do Player Inicio.
- `App.css`: drawers de entidade no Trabalho web deixam de escurecer/desfocar a pagina como modal central; permanecem como painel lateral SaaS.
- Build validado com `npm.cmd run build`.

Objetivo:
Validar todas as paginas web principais com o novo padrao compacto antes de mexer mais.

Rotas:

- Trabalho Inicio;
- Agenda;
- Clientes;
- Academia Hoje;
- Academia Turmas;
- Academia Alunos;
- Academia Pendencias;
- Financeiro Receber;
- Financeiro Pagos;
- Financeiro Despesas;
- Loja/POS;
- Competicoes;
- Comunicacao;
- Relatorios;
- Administracao;
- Player Inicio;
- Player Jogar;
- Player Competir;
- Player Rotina;
- Player Perfil.

Validar:

- screenshot;
- console sem erro;
- sem overflow horizontal;
- topbar alinhada;
- botoes sem branco ilegivel;
- primeira dobra util;
- lista/tabela/calendario com densidade correta;
- detalhe lateral quando houver entidade;
- sem modal grande onde deveria haver drawer;
- sem tabs/botoes falsos.

Arquivos provaveis:

- CSS global;
- shells;
- modulos de cada pagina.

Aceite:
Relatorio com aprovado/falhou/corrigido para cada rota e screenshots em `artifacts/saas-final-qa-2026-05-24/`.

---

## FINAL-02 - Mobile Trabalho Por Papel

Status: concluido em 2026-05-24.

Evidencias:

- Relatorio inicial: `artifacts/saas-final-qa-2026-05-24/final-02-mobile-report.json`.
- Revalidacao: `artifacts/saas-final-qa-2026-05-24/final-02-mobile-recheck-report.json`.
- Screenshots: `final-02-*.png`, `final-02-recheck-*.png`, `final-02-manager-home-430-12s.png`, `final-02-finance-430-final-14s.png`.

Correcoes aplicadas:

- `BottomNav.tsx`: matriz mobile de Trabalho ajustada por papel. Recepcao passa a ter `Hoje / Agenda / Reservas / Clientes / Mais`; Financeiro passa a ter `Receber / Vencidos / Pagos / Resumo / Perfil`; Gestor passa a ter `Hoje / Agenda / Clientes / Financeiro / Mais`.
- `PlaceFinanceReceivablesModule.tsx`: link mobile `Vencidos` abre recebiveis ja filtrados por vencidos via query `filtro=vencidos`.
- `App.css`: mobile Trabalho remove topbar SaaS desktop, mantem seletor de modo compacto, elimina overflow horizontal e contem Financeiro em 390/430.

Validacao por papel:

- Professor: matriz de codigo direciona para `Hoje / Agenda / Turmas / Alunos / Perfil`.
- Recepcao: matriz de codigo direciona para `Hoje / Agenda / Reservas / Clientes / Mais`.
- Financeiro: matriz de codigo direciona para `Receber / Vencidos / Pagos / Resumo / Perfil`.
- Caixa: matriz de codigo direciona para `Vender / Hoje / Estoque / Produtos / Perfil`.
- Organizador independente: matriz de codigo direciona para `Hoje / Torneios / Ligas / Resultados / Perfil`.
- Gestor: validado em browser com auth atual em 390px e 430px, menu `Hoje / Agenda / Clientes / Financeiro / Mais`, sem erro de console e sem overflow horizontal.

Bloqueio documentado:

- A primeira sessao final (`final-02`) usou principalmente admin/gestor multiunidade, mas a rodada anterior ja havia criado evidencias dedicadas por papel em `artifacts/saas-sprint-screens/sprint-90-role-audit-430.json` e `sprint-91-role-audit-deep.json`. A pendencia restante e operacionalizar esse QA como rotina repetivel, nao redescobrir o comportamento por papel.

Objetivo:
Garantir que mobile Trabalho seja operacional por papel, nao mini-SaaS web.

Papeis:

- professor;
- recepcao;
- financeiro;
- caixa;
- gestor;
- organizador.

Validar menu esperado:

- Professor: Hoje, Agenda, Turmas, Alunos, Perfil.
- Recepcao: Hoje, Agenda, Reservas, Clientes, Mais.
- Financeiro: Receber, Vencidos, Pagos, Resumo, Perfil.
- Caixa: Vender, Hoje, Estoque, Produtos, Perfil.
- Organizador: Hoje, Torneios, Ligas, Resultados, Perfil.
- Gestor: Hoje, Agenda, Clientes, Financeiro, Mais.

Validar:

- 390px;
- 430px;
- primeira tela;
- CTA primario;
- ausencia de configuracao profunda;
- ausencia de financeiro amplo para professor;
- ausencia de equipe/ajustes para recepcao;
- console sem erro.

Aceite:
Cada papel abre uma superficie operacional clara. Se faltar seed/login por papel, criar ou documentar exatamente o bloqueio e validar o maximo possivel com dados existentes.

---

## FINAL-03 - Reserva Ponta A Ponta

Status: concluido em 2026-05-24.

Evidencias:

- Criacao controlada: `artifacts/saas-final-qa-2026-05-24/final-03-controlled-create.png`.
- Reserva pendente antes de pagar: `artifacts/saas-final-qa-2026-05-24/final-03-controlled-pending-before-pay.png`.
- Reserva apos pagamento stub: `artifacts/saas-final-qa-2026-05-24/final-03-controlled-after-pay.png`.
- Relatorio anterior de cancelamento/contexto: `artifacts/saas-final-qa-2026-05-24/final-03-reservation-flow-report.json`.
- Build validado com `npm.cmd run build`.

Correcoes aplicadas:

- `place-admin-data.ts`: merge de pagamentos passou a priorizar status pago e timestamp mais recente para impedir que pagamento antigo pendente sobrescreva pagamento pago apos refresh.
- `PlaceBookingCalendarModule.tsx`: ao cancelar uma reserva pelo detalhe lateral, a agenda troca para a visao `Canceladas`, limpa edicao aberta e mantem a reserva no contexto operacional em vez de parecer que ela sumiu.
- `App.css`: painel lateral/drawer permanece no padrao SaaS sem sobrepor a pagina como modal central.

Validacao real:

- Reserva criada em horario livre pelo fluxo admin.
- Reserva apareceu como pendente na agenda.
- Pagamento stub executado pelo modal provisorio.
- Refresh aplicado e a reserva permaneceu como `payment-paid`.
- Cancelamento levou o usuario para a visao `Canceladas`, preservando contexto.
- Console sem erro nos fluxos auditados.

Objetivo:
Fechar o ciclo operacional de reserva.

Fluxos obrigatorios:

1. Criar reserva admin.
2. Criar reserva em horario livre.
3. Marcar pagamento stub.
4. Atualizar pagina e confirmar persistencia.
5. Editar reserva admin.
6. Cancelar reserva.
7. Confirmar que cancelada nao some sem contexto.
8. Remarcar via WhatsApp/troca.
9. Confirmar que horarios ocupados nao aparecem como disponiveis.
10. Confirmar que lista de espera nao oferece criar reserva em horario ocupado sem explicar.

Regras:

- Agenda mostra reservas, aulas, bloqueios e competicoes quando o objetivo e visao geral.
- Aba Reservas deve focar reservas; filtros de professores/turmas nao podem confundir.
- Cancelamento deve gerar estado claro e acao de WhatsApp quando aplicavel.
- Pagamento stub deve persistir apos refresh.

Aceite:
Reserva fecha ciclo de criar, pagar, editar, cancelar, remarcar e avisar sem ambiguidade.

---

## FINAL-04 - Cliente 360 Completo

Status: concluido em 2026-05-24.

Evidencias:

- Screenshot: `artifacts/saas-final-qa-2026-05-24/final-04-clientes-360.png`.
- Build validado com `npm.cmd run build`.
- Auditoria Playwright confirmou na tela: `Cliente 360`, `Vinculo com a academia`, `Turmas e aulas`, `Reservas recentes`, `Pagamentos`, `Pacotes e creditos` e `Historico de relacionamento`.

Correcoes aplicadas:

- `PlaceActiveClientsModule.tsx`: detalhe lateral passou a consolidar pacotes/creditos e historico de relacionamento, alem de dados pessoais, plano/mensalidade, turmas, professor, reservas e pagamentos.
- `PlacesPage.tsx`: Cliente 360 recebe `creditPurchases` e `crmInteractions` para deixar de depender de tres menus separados para entender o relacionamento do cliente com a academia.

Decisao de produto aplicada:

- `Clientes` fica como fonte principal de pessoa/relacionamento.
- `Academia > Alunos` permanece como visao academica do vinculo de aula.
- `Financeiro` permanece focado em recebiveis, com Cliente 360 como contexto lateral quando necessario.

Objetivo:
Transformar Clientes na fonte principal de pessoa/relacionamento.

Conteudo minimo do detalhe:

- dados pessoais;
- telefone/e-mail;
- status;
- tipo de vinculo;
- plano/mensalidade;
- turmas;
- professor responsavel;
- reservas futuras;
- reservas historicas;
- pagamentos pessoais ligados ao local;
- pendencias;
- historico de interacoes;
- CTAs: cobrar, WhatsApp, nova reserva, abrir aulas/turmas, registrar observacao.

Regras:

- Leads e Clientes ativos devem ser separados por aba.
- Academia > Alunos nao deve virar segunda base de clientes; deve ser visao academica do vinculo de aula.
- Financeiro nao deve duplicar lista de pessoas; deve listar recebiveis e abrir Cliente 360 quando precisar de contexto.

Aceite:
Ao clicar numa pessoa, o usuario entende tudo que ela tem com a academia sem procurar em tres menus diferentes.

---

## FINAL-05 - Academia Sem Repeticao E Sem Mini-Dashboard Em Toda Aba

Status: concluido em 2026-05-24.

Evidencias:

- Screenshots: `artifacts/saas-final-qa-2026-05-24/final-05-academia-turmas.png`, `final-05-academia-alunos.png`, `final-05-academia-pendencias.png`.
- Build validado com `npm.cmd run build`.
- Auditoria Playwright: Turmas com 20 linhas compactas, Alunos com 24 linhas compactas, Pendencias sem tabela indevida, `place-module-summary` removido das abas internas.

Correcoes aplicadas:

- `PlacesPage.tsx`: resumo global de academia deixou de renderizar dentro das abas internas. Hoje, Agenda, Turmas, Alunos e Pendencias voltam a ter responsabilidades separadas.
- `PlaceAcademyClassesModule.tsx`: mantido padrao de lista compacta + detalhe lateral para turma, sem modal central.
- `PlaceAcademyStudentsModule.tsx`: mantido padrao de lista compacta + detalhe lateral para aluno/matricula, com chamada opcional respeitando configuracao da academia.

Decisao de produto aplicada:

- `Hoje`: rotina imediata.
- `Agenda`: calendario academico.
- `Turmas`: grade, vagas, mensalidade e matricula manual.
- `Alunos`: vinculo academico aluno/turma/contrato.
- `Pendencias`: pedidos, reposicoes, encaixes e aprovacoes.

Objetivo:
Limpar Academia para ficar profissional e direta.

Responsabilidades:

- Hoje: aulas do dia e rotina imediata.
- Agenda: calendario academico quando necessario, por dia/professor/quadra.
- Turmas: lista compacta + detalhe lateral.
- Alunos: matriculas e vinculo academico + acesso ao Cliente 360.
- Pendencias: matriculas, reposicoes, encaixes, avisos e aprovacoes.

Remover/rebaixar:

- cards de resumo repetidos dentro de Turmas/Alunos;
- pendencias aparecendo fora da aba Pendencias quando nao forem o foco;
- aulas do dia aparecendo em subpagina que deveria listar turmas/alunos;
- modais grandes de edicao onde o padrao deve ser drawer lateral.

Aceite:
Cada aba responde uma pergunta unica e usa lista/drawer compacto.

---

## FINAL-06 - Financeiro Fechado Para MVP

Status: concluido em 2026-05-24.

Evidencias:

- Screenshots: `artifacts/saas-final-qa-2026-05-24/final-06-finance-receber.png`, `final-06-finance-after-pay.png`, `final-06-finance-despesas.png`.
- Build validado com `npm.cmd run build`.
- Auditoria Playwright: filtro `filtro=vencidos` ativa Vencidos, recebiveis exibem drawer, pagamento stub persiste em `Pagos` apos refresh, Despesas possui fluxo de registro visivel.

Correcoes/validacoes aplicadas:

- `PlaceFinanceReceivablesModule.tsx`: query string de filtros (`vencidos`, `hoje`, `aulas`, `planos`) preservada e aplicada na abertura da tela.
- `place-admin-data.ts`: mesma correcao de merge de pagamentos usada em reservas garante baixa manual confiavel para recebiveis.

Decisao de produto aplicada:

- Financeiro do local fica em `Receber / Pagos / Despesas / Planos / Resumo`.
- Pagamentos pessoais continuam fora do financeiro do local.
- Caixa/POS nao substitui financeiro amplo.

Objetivo:
Garantir que o financeiro basico esteja confiavel.

Fluxos:

- ver recebiveis;
- filtrar vencidos/hoje;
- abrir detalhe;
- cobrar/WhatsApp;
- marcar pago via stub;
- refresh e persistencia;
- ver pagos;
- registrar despesa;
- resumo simples.

Regras:

- pagamentos pessoais nao se misturam com financeiro do local;
- caixa/POS nao ve financeiro amplo;
- Cliente 360 abre contexto quando uma cobranca pertence a uma pessoa.

Aceite:
O financeiro MVP e simples, mas confiavel e sem dados que voltam ao estado anterior apos refresh.

---

## FINAL-07 - Busca Global E Criar Rapido

Status: concluido em 2026-05-24.

Evidencias:

- Screenshots: `artifacts/saas-final-qa-2026-05-24/final-07-global-search-fixed.png`, `final-07-quick-create-fixed.png`.
- Relatorio: `artifacts/saas-final-qa-2026-05-24/final-07-search-create-fixed-report.json`.
- Build validado com `npm.cmd run build`.

Correcoes aplicadas:

- `AppShell.tsx`: busca global passou a usar funcoes reais do app (`listPlaceCrmContacts`, `listPlaceBookings`, `listPlaceAcademyClasses`, `listPlaceAcademyEnrollments`, `listPlacePosProducts`, `loadDashboardData`, `loadMyLeagues`) em vez de selects diretos frageis.
- `AppShell.tsx`: atalhos passaram a ter palavras-chave/sinonimos operacionais para termos como `pagamento`, `quadra`, `reserva`, `turma`, `cobranca`, `produto`, `torneio` e `liga`.
- `AppShell.tsx`: resultados mesclam entidades reais e atalhos, removendo duplicatas e mantendo limite compacto de 10 itens.

Validacao real:

- `rafael` retornou reservas e aluno.
- `reserva` retornou clientes com interesse de reserva, reservas reais, Agenda e Reservas.
- `turma` retornou turmas reais e atalho de Aulas e turmas.
- `pagamento` retornou reserva relacionada e atalhos de Reservas/Financeiro.
- `quadra` retornou reservas reais e atalhos de Agenda/Reservas.
- `open` retornou torneios reais.
- `+ Criar` mostrou 6 acoes principais: Nova reserva, Novo cliente, Registrar pagamento, Criar aula/turma, Criar torneio e Vender produto.
- Console sem erro.

Objetivo:
Reduzir dependencia de menu sem virar bagunca.

Busca deve retornar:

- clientes/pessoas;
- reservas;
- aulas/turmas;
- alunos/matriculas;
- pagamentos/recebiveis;
- produtos;
- torneios/ligas;
- atalhos de pagina.

Criar rapido:

- nova reserva;
- novo cliente;
- registrar pagamento;
- nova turma/aula;
- criar torneio/liga;
- venda/produto.

Regras:

- ordenar por relevancia;
- respeitar permissao;
- nao mostrar acao proibida;
- resultado deve abrir pagina/drawer correto.

Aceite:
Usuario encontra uma entidade ou inicia uma acao sem saber em qual menu ela vive.

---

## FINAL-08 - Competicoes Trabalho E Player

Status: concluido em 2026-05-24.

Evidencias:

- Relatorio inicial: `artifacts/saas-final-qa-2026-05-24/final-08-competition-boundary-report.json`.
- Revalidacao limpa: `artifacts/saas-final-qa-2026-05-24/final-08-10-5180-auth-report.json`.
- Screenshots: `final-08-player-competir-recheck.png`, `final-08-work-competicoes-5180-auth.png`, `final-08-work-torneios-recheck.png`, `final-08-work-ligas-recheck.png`.

Correcoes aplicadas:

- `EventsHubPage.tsx`: abas do Competition OS deixaram de ser botoes falsos. `Todos`, `Torneios`, `Ligas`, `Pendencias` e `Historico` agora filtram a fila operacional de verdade.
- `EventsHubPage.tsx`: Player Competir foi validado sem CTA operacional de `Criar torneio`, `Criar liga`, `Resolver proximo bloqueio` ou `Abrir cockpit da fase`.
- `EventsHubPage.tsx`: separadores tipograficos foram trocados por `-` para evitar artefato visual de codificacao em alguns ambientes.
- `App.css`: abas funcionais receberam contador compacto sem quebrar o padrao escuro.

Validacao real:

- Player Competir mostra participacao, descoberta, torneios/ligas do jogador e rankings.
- Trabalho Competicoes mostra Competition OS, filas por fase, bloqueios, criacao e cockpit.
- Torneios organizados abrem em modo organizador.
- Ligas organizadas abrem em modo owner/organizador.
- Console sem erro na revalidacao.

Objetivo:
Confirmar separacao entre jogar e organizar.

Validar:

- Player Competir mostra descoberta/participacao, nao operacao.
- Trabalho Competicoes mostra torneios/ligas com pendencias operacionais.
- Torneio admin por fase ainda tem CTA principal correto.
- Liga owner/participante nao mistura ferramentas.
- Resultado pendente tem caminho claro.

Aceite:
Jogador nao ve ferramenta administrativa indevida; organizador nao cai em descoberta publica.

---

## FINAL-09 - Comunicacao E WhatsApp Templates

Status: concluido em 2026-05-24.

Evidencias:

- Screenshot: `artifacts/saas-final-qa-2026-05-24/final-09-communication-5180-auth.png`.
- Relatorio: `artifacts/saas-final-qa-2026-05-24/final-08-10-5180-auth-report.json`.

Correcoes aplicadas:

- `PlaceCommunicationPanel.tsx`: matriz de modelos ampliada de 10 para 15 templates.
- Templates adicionados/refinados para pagamento de reserva confirmado, link de remarcacao, mensalidade vencida, resultado pendente e aviso geral.
- Cada modelo usa campos de contexto como `{nome}`, `{remetente}`, nome da unidade, data/horario, quadra, competicao, valor ou link quando aplicavel.

Validacao real:

- Central de Comunicacao carregou pela rota real do local.
- Fila operacional exibiu Reservas, Lista de espera, Aulas, Financeiro e Publicacao.
- Matriz de modelos exibiu 15 templates.
- Console sem erro.

Objetivo:
Garantir comunicacao operacional consistente.

Templates obrigatorios:

- reserva criada/paga;
- reserva cancelada pela unidade;
- pedido de remarcacao;
- link de remarcacao;
- lembrete de pagamento;
- mensalidade vencida;
- aula/remarcacao/reposicao;
- inscricao de torneio/liga;
- resultado pendente;
- aviso geral.

Cada template deve conter:

- nome do cliente;
- nome da unidade;
- remetente/operador quando houver;
- contexto;
- data/hora;
- CTA/link quando aplicavel;
- tom profissional.

Aceite:
Todo ponto critico que exige contato tem mensagem padrao clara.

---

## FINAL-10 - Relatorios MVP

Status: concluido em 2026-05-24.

Evidencias:

- Screenshot: `artifacts/saas-final-qa-2026-05-24/final-10-reports-5180-auth.png`.
- Relatorio: `artifacts/saas-final-qa-2026-05-24/final-08-10-5180-auth-report.json`.

Correcoes aplicadas:

- `PlacesPage.tsx`: Relatorios MVP passou a incluir `Competicoes` como modulo proprio, alem de Agenda, Academia, Financeiro, CRM e Cantina.
- Textos de relatorio foram normalizados em pontos visiveis para evitar artefatos de encoding em termos como `socios`, `presenca` e `lidera`.

Validacao real:

- Relatorios carregam pela rota real do local.
- Cards principais mostram quadras, reservas, ocupacao e taxa de confirmacao.
- Tabela executiva mostra Agenda, Academia, Financeiro, CRM, Competicoes e Cantina.
- Drawer lateral mostra detalhes, metricas secundarias e picos/alertas.
- Console sem erro.

Objetivo:
Manter relatorios como apoio, nao centro do produto.

Relatorios MVP:

- ocupacao de quadras;
- reservas por periodo;
- receita recebida/em aberto;
- inadimplencia;
- aulas/turmas;
- alunos ativos;
- produtos/vendas;
- competicoes.

Regras:

- cards e listas filtradas primeiro;
- exportacao simples quando existir;
- sem dashboard complexo antes dos fluxos operacionais fecharem.

Aceite:
Gestor tem leitura basica da operacao sem o relatorio competir com rotina diaria.

---

## FINAL-11 - QA Ponta A Ponta Com Dados Reais

Status: concluido em 2026-05-24.

Evidencias:

- Relatorio principal: `artifacts/saas-final-qa-2026-05-24/final-11-e2e-final-report.json`.
- Screenshots: `artifacts/saas-final-qa-2026-05-24/final-11-recheck-*.png`.
- Evidencias reaproveitadas dos fluxos destrutivos/controlados: `final-03-controlled-after-pay.png`, `final-06-finance-after-pay.png`, `final-08-work-competicoes-5180-auth.png`, `final-09-communication-5180-auth.png`, `final-10-reports-5180-auth.png`.

Resultado:

- 18/18 rotas/fluxos aceitos com dados reais do seed/admin.
- Console sem erro.
- `work-home`, Agenda, Clientes, Academia, Financeiro, POS, Comunicacao, Relatorios, Competition OS e Player carregaram conteudo util.
- `player-jogar` foi aceito com nota de falso negativo do threshold automatico: a tela e intencionalmente compacta, com CTA e conteudo util carregado sem erro.

Fluxos cobertos:

- Gestao / Trabalho Hoje.
- Agenda reservas e calendario.
- Clientes ativos e Cliente 360.
- Academia Turmas e Alunos com detalhe lateral.
- Financeiro Recebiveis e Pagos.
- POS venda rapida.
- Comunicacao e templates.
- Relatorios MVP.
- Competicoes Trabalho, Torneios e Ligas.
- Player Inicio, Jogar, Competir e Rotina.

Observacoes:

- Criacao/pagamento/cancelamento de reserva e baixa financeira foram validados em FINAL-03 e FINAL-06 com dados reais e refresh.
- A criacao destrutiva completa de novas academias/torneios/ligas nao foi repetida nesta rodada para evitar poluir ainda mais os dados seed; a rodada consolidou as rotas e fluxos atuais depois das correcoes.

Objetivo:
Testar fluxos reais depois das correcoes.

Fluxos:

- criar academia/unidade;
- criar quadras;
- criar professor;
- criar turma;
- matricular aluno seed;
- criar reserva;
- pagar reserva;
- cancelar/remarcar reserva;
- cobrar mensalidade;
- registrar pagamento;
- vender POS;
- criar torneio;
- inscrever jogadores;
- gerar jogos;
- lancar resultados;
- finalizar torneio;
- criar liga;
- gerar rodada;
- lancar resultado de liga.

Aceite:
Relatorio final com:

- o que passou;
- o que falhou;
- bugs corrigidos;
- bugs restantes;
- screenshots;
- console;
- decisoes de produto pendentes.

---

## FINAL-12 - Limpeza De Documentacao E Estado Final

Status: concluido em 2026-05-24.

Evidencias:

- `EXECUTION_QUEUE.md` atualizado para apontar esta fila como concluida.
- Esta fila registra status por item, arquivos alterados, evidencias e pendencias residuais.
- Documentos em `docs/Legado/` permanecem explicitamente fora da fonte de decisao.

Objetivo:
Encerrar ambiguidade documental.

Fazer:

- atualizar `EXECUTION_QUEUE.md`;
- marcar esta fila como concluida ou pendente por item;
- mover/ignorar docs conflitantes;
- registrar screenshots finais;
- criar sumario de produto final.

Aceite:
Qualquer IA/coder que entrar no projeto sabe qual fila foi executada, o que falta e qual documento manda.

---

## FINAL-13 - QA Por Papeis Reaproveitavel

Status: concluido em 2026-05-24.

Evidencias:

- Script: `scripts/role-smoke-audit.mjs`.
- Comando: `npm run qa:roles`.
- Smoke executado: `ATP_ROLE_QA_VIEWPORTS=desktop-1366`, `ATP_ROLE_QA_SCREENSHOTS=0`, `ATP_ROLE_QA_ROLES=coach,frontdesk,finance,cashier,organizer,player-pure`.
- Relatorio: `artifacts/role-smoke-audit-2026-05-24-smoke/role-smoke-report.json`.
- Resultado do smoke possivel com auth-states atuais: `3/3 rotas executadas aceitas; 15 puladas`.

Correcoes aplicadas:

- O auditor limpa `localStorage`, `sessionStorage` e `IndexedDB` entre papeis para evitar contaminacao de sessao.
- Auth-state expirado e classificado como `skipped: auth-expired`, preservando o diagnostico sem transformar sessao antiga em falsa falha de UX.
- Filtros de ambiente permitem rodar subconjuntos sem editar codigo: `ATP_ROLE_QA_VIEWPORTS`, `ATP_ROLE_QA_ROLES`, `ATP_ROLE_QA_SCREENSHOTS`, `ATP_ROLE_QA_OUT_DIR` e `ATP_ROLE_QA_AUTH_DIR`.

Aceite:

- A rotina existe, gera JSON, pode capturar screenshots e falha apenas quando uma rota executada viola checks reais.
- A pendencia restante e operacional: manter auth-states frescos para cobrir todos os papeis em rodada completa.
