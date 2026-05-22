# Work Mobile And SaaS Restructure Execution Plan - 2026-05-22

Status: planejamento executivo antes de novas correcoes de UI.  
Regra desta rodada: nao implementar novas mudancas estruturais sem este plano como referencia.

## 1. Problema Real

O problema atual nao e falta de MD. O problema e que parte do planejamento ficou documental e a implementacao ainda preservou a estrutura antiga em varios pontos.

O sintoma mais visivel esta no mobile Trabalho:

- mobile tenta carregar a arvore do SaaS web;
- paginas internas mostram menu externo, seletor de unidade, card do local, shell do modulo, tabs internas e subtabs;
- funcoes diarias, configuracoes raras, relatorios e cadastros aparecem na mesma camada;
- `Reservas`, `Aulas`, `Clientes/Pessoas`, `Financeiro`, `Equipe`, `Ajustes` ainda competem por espaco mental;
- alguns modulos tem nomes parecidos em menu principal, submenu e botoes internos;
- a pessoa nao sabe se esta em uma tarefa operacional ou configurando o sistema.

Conclusao:

O plano correto nao e "arrumar CSS" nem "trocar labels". A area Trabalho precisa de duas arquiteturas:

1. SaaS web completo para gestao profunda.
2. Mobile Trabalho operacional para tarefas do dia.

## 2. Decisao De Produto

### SaaS Web Trabalho

O desktop/web pode ter profundidade:

- menu por dominios;
- selector de unidade;
- paginas completas;
- tabelas, filtros, relatorios;
- configuracoes, equipe, permissoes;
- operacao profunda de academia, reservas, financeiro, pessoas e competicoes.

### Mobile Trabalho

O mobile nao deve ser copia reduzida do SaaS.

O mobile deve responder:

- o que tenho hoje?
- o que preciso resolver agora?
- quem preciso avisar?
- qual acao simples posso concluir pelo celular?

Mobile deve conter:

- Trabalho Hoje;
- agenda do dia;
- reservas do dia e nova reserva;
- aulas do dia do professor;
- alunos/turmas do professor quando for rotina;
- recebiveis/cobrancas para financeiro;
- venda rapida para caixa;
- pendencias de torneio/liga para organizador;
- comunicacao/WhatsApp;
- aprovacoes simples.

Mobile nao deve conter como primeira camada:

- ajustes estruturais;
- configuracao de regras;
- permisssao/equipe completa;
- relatorios completos;
- cadastro complexo;
- arvore de modulos;
- setup de quadras, planos, produtos e regras.

## 3. Regra De Corte

Cada item deve ser classificado antes de aparecer no mobile:

| Tipo | Mobile | Web |
| --- | --- | --- |
| Tarefa diaria | Sim, primeira camada | Sim |
| Acao simples de campo | Sim | Sim |
| Comunicacao contextual | Sim | Sim |
| Consulta rapida | Sim | Sim |
| Cadastro complexo | Nao ou parcial | Sim |
| Configuracao rara | Nao | Sim |
| Permissao/equipe estrutural | Nao | Sim |
| Relatorio analitico | Nao | Sim |
| Acao perigosa/destrutiva | Nao | Sim, avancado |

## 4. Arquitetura Alvo Do Mobile Trabalho

### 4.1 Home Mobile Trabalho

Rota: `/gestao`.

Responsabilidade:

- ser fila operacional por papel;
- mostrar no maximo 3 a 5 acoes principais;
- esconder lista completa de workspaces atras de "Mais locais" ou "Abrir SaaS web";
- nao mostrar configuracao rara na primeira dobra.

Primeira dobra:

1. Header compacto com modo `Trabalho`.
2. Persona ativa.
3. Card "O que resolver agora?"
4. CTA dominante.
5. Cards acionaveis.

Nao deve mostrar na primeira dobra:

- todos os locais;
- todos os modulos;
- ajustes;
- equipe;
- relatorios;
- cards de setup.

### 4.2 Bottom Nav Mobile Por Papel

Professor:

- Hoje
- Agenda
- Turmas
- Alunos
- Perfil

Recepcao:

- Hoje
- Reservas
- Pessoas
- Aulas
- Mais

Financeiro:

- Receber
- Pagos
- Despesas
- Resumo
- Perfil

Caixa:

- Vender
- Hoje
- Estoque
- Produtos
- Perfil

Organizador:

- Hoje
- Torneios
- Ligas
- Avisos
- Perfil

Gestor:

- Hoje
- Agenda
- Aulas
- Receita
- Mais

Regra do `Mais`:

`Mais` nao pode virar lixeira de modulo. Ele deve conter:

- troca de unidade;
- abrir SaaS web;
- ajustes administrativos permitidos;
- equipe/permissoes se permitido;
- relatorios se permitido;
- sair/perfil.

## 5. Arquitetura Alvo Do SaaS Web Trabalho

Desktop sidebar por dominios:

Trabalho:

- Hoje

Operacao:

- Calendario
- Reservas
- Aulas
- Cantina/POS

Pessoas:

- Pessoas/CRM
- Alunos
- Socios

Receita:

- Receber
- Pagos
- Despesas
- Planos
- Resumo

Competicoes:

- Torneios
- Ligas
- Publicacao

Administracao:

- Equipe
- Ajustes
- Relatorios

Regra:

Desktop pode ter profundidade, mas precisa ter breadcrumbs, unidade ativa e pagina com responsabilidade clara.

## 6. Contratos Por Modulo No Mobile

### Reservas Mobile

Responsabilidade:

- operar reservas e agenda do dia.

Estrutura:

- `Reservas`: lista de reservas do dia/recentes, cancelamento, editar, WhatsApp, pagamento.
- `Nova reserva`: CTA, nao tab escondida.
- `Agenda`: destino principal separado no bottom nav/rotina, usado tambem por aulas.
- `Espera`: contexto dentro de Reservas, nao submenu principal.
- `Ajustes`: fora do mobile operacional.

Nao deve aparecer:

- regras de quadra;
- precificacao estrutural;
- setup de recursos.

### Aulas Mobile

Responsabilidade:

- conduzir aulas do dia e resolver rotina de aluno/turma.

Estrutura:

- Professor: Agenda do dia -> Aula -> Alunos -> avisos/reposicoes/evolucao.
- Gestor/recepcao: pendencias de aulas, turmas com acao, alunos relevantes.
- Chamada fica oculta por padrao; so aparece se configuracao da empresa exigir.

Nao deve aparecer:

- professores como submenu de Aulas;
- ajustes de aula;
- calendario como submenu interno, porque calendario vira destino proprio;
- clientes genericos dentro de aulas.

### Pessoas/Clientes Mobile

Responsabilidade:

- pessoas que exigem acao: cliente, aluno, socio, lead, responsavel.

Estrutura:

- busca rapida;
- fila de relacionamento;
- detalhe da pessoa;
- acoes: WhatsApp, cobrar, reservar, matricular, ver historico.

Nao deve ser:

- agenda de contatos solta;
- socios misturados sem relacao;
- CRM completo no mobile.

### Financeiro Mobile

Responsabilidade:

- cobrar, marcar pago, ver pagos, registrar despesa simples, resumo rapido.

Separar:

- pagamentos pessoais do jogador;
- recebiveis do local;
- cobrancas;
- despesas;
- planos/mensalidades.

Nao deve aparecer:

- aula;
- cantina;
- perfil pessoal;
- relatorio analitico completo.

### Cantina Mobile

Responsabilidade:

- vender rapido.

Estrutura:

- Vender;
- Hoje;
- Estoque baixo;
- Produtos apenas se autorizado.

Nao deve aparecer:

- financeiro amplo do local;
- relatorio completo;
- configuracao complexa.

### Equipe/Ajustes Mobile

Responsabilidade:

- nao ser rotina.

Mobile:

- aceitar/recusar convite proprio;
- talvez consultar papel/permissao;
- abrir SaaS web para administracao completa.

Web:

- convite, remocao, papeis, permissoes, configuracao completa.

## 7. Diagnostico Do Que Esta Errado Hoje No Codigo

Pontos que precisam mudar:

1. `BottomNav` ja tenta ser por papel, mas ainda aponta para paginas que renderizam shell web inteiro.
2. `ManagementHubPage` ainda mostra muita informacao de workspace no mobile.
3. `PlacesPage` em rota admin renderiza:
   - card do local;
   - acoes publicas;
   - `PlaceAdminShell`;
   - `PlaceOperationsDashboard`;
   - workspace do modulo;
   - tabs internas.
4. `PlaceWorkspaceShell` sempre renderiza cabecalho de modulo como se fosse web.
5. Algumas paginas ocultam tabs com `views={[activeView]}`, mas continuam exibindo header e estrutura pesada.
6. A distincao `mobile operacional` vs `web SaaS` nao existe como primitiva no codigo.

## 8. Primitivas Que Precisam Ser Criadas

### 8.1 MobileWorkShell

Novo padrao visual/comportamental para mobile:

- header compacto;
- titulo da tarefa;
- CTA primario;
- cards acionaveis;
- area "Mais / abrir web" secundaria.

Pode ser CSS/adaptacao sem rota nova no primeiro sprint.

### 8.2 MobileModuleGuard

Regra:

- se viewport mobile e modulo for configuracao/relatorio/equipe profunda, mostrar card:
  - "Essa acao e melhor no SaaS web"
  - botao "Abrir no desktop/web"
  - resumo seguro, sem esconder que a funcao existe.

### 8.3 OperationalActionCard

Card padrao:

- pergunta;
- informacao minima;
- CTA;
- status;
- sem metricas decorativas.

## 9. Queue De Implementacao

### MOB-WORK-00 - Congelar Correcao Sem Plano

Objetivo:

- nao aplicar mudanca visual solta.

Aceite:

- este documento existe;
- cada patch seguinte referencia um item desta queue.

### MOB-WORK-01 - Criar Regras De Viewport Para Trabalho Mobile

Arquivos provaveis:

- `src/components/management/ManagementShell.tsx`
- `src/components/place/PlaceWorkspaceShell.tsx`
- `src/App.css`

Alterar:

- adicionar classes/estrutura para distinguir mobile operacional;
- compactar header em mobile;
- evitar que shell web domine a primeira dobra.

Nao alterar:

- backend;
- permisssao;
- rotas.

Aceite:

- mobile nao parece mini desktop;
- desktop permanece SaaS completo.

### MOB-WORK-02 - Simplificar `/gestao` Mobile Por Papel

Arquivos provaveis:

- `src/pages/ManagementHubPage.tsx`
- `src/App.css`

Alterar:

- no mobile, exibir primeiro apenas fila operacional por papel;
- esconder ou recolher lista completa de locais;
- manter `Ver mais locais`;
- mover administracao/setup para bloco secundario;
- competicoes organizadas aparecem como fila de bloqueios, nao descoberta publica.

Aceite:

- professor entra e ve aula/agenda primeiro;
- recepcao entra e ve reservas/nova reserva primeiro;
- financeiro entra e ve cobrancas primeiro;
- caixa entra e ve vender primeiro;
- gestor entra e ve bloqueios consolidados.

### MOB-WORK-03 - Simplificar Rotas Internas De Local No Mobile

Arquivos provaveis:

- `src/pages/PlacesPage.tsx`
- `src/components/place/PlaceAdminShell.tsx`
- `src/components/place/PlaceOperationsDashboard.tsx`
- `src/App.css`

Alterar:

- no mobile admin, ocultar card publico do local e acoes publicas acima da tarefa;
- `PlaceAdminShell` vira compacto ou recolhido;
- nao mostrar seletor de modulo + workspace + tabs quando a rota ja tem destino claro;
- CTA primario da rota fica no topo.

Aceite:

- `/gestao/:placeId/bookings/reservas` abre reservas, nao uma pagina com tres camadas antes;
- `/gestao/:placeId/academy/calendario` abre agenda/aulas, nao setup;
- `/gestao/:placeId/finance/recebiveis` abre cobrancas direto.

### MOB-WORK-04 - Reservas Mobile Sem Submenu

Arquivos provaveis:

- `BookingWorkspaceShell.tsx`
- `PlaceBookingReservationsModule.tsx`
- `PlaceBookingCalendarModule.tsx`
- `PlaceBookingCreateModule.tsx`

Alterar:

- `Reservas` como lista/acompanhamento;
- `Nova reserva` como CTA dominante;
- `Espera` dentro de reservas;
- `Agenda` como destino separado;
- `Ajustes` web-only/administracao.

Aceite:

- recepcao consegue criar reserva em ate dois toques da home;
- horario ocupado nao aparece como disponivel para criar reserva;
- WhatsApp aparece para troca/cancelamento/espera.

### MOB-WORK-05 - Aulas Mobile Sem Submenu Pesado

Arquivos provaveis:

- `AcademyWorkspaceShell.tsx`
- `PlaceAcademyTodayModule.tsx`
- `PlaceAcademyTeacherCalendarModule.tsx`
- `PlaceAcademyStudentsModule.tsx`

Alterar:

- professor ve agenda do dia;
- aula abre alunos/turma/quadra;
- chamada oculta por padrao;
- professores movido para Equipe no web;
- ajustes fora da rotina.

Aceite:

- professor nao cai em ERP;
- aula do dia e alunos estao claros;
- calendario do professor e por dia/hora cheia.

### MOB-WORK-06 - Pessoas Mobile Como Acao, Nao Lista Solta

Arquivos provaveis:

- `ClientsWorkspaceShell.tsx`
- `PlaceClientActionQueue.tsx`
- `PlaceClientRelationshipModule.tsx`

Alterar:

- mobile mostra busca e fila de relacionamento;
- socios/alunos/leads aparecem como relacionamento da pessoa;
- detalhes abrem como sheet.

Aceite:

- recepcao encontra cliente rapidamente;
- gestor entende se e aluno/socio/lead sem trocar de modulo.

### MOB-WORK-07 - Financeiro Mobile Direto

Arquivos provaveis:

- `FinanceWorkspaceShell.tsx`
- finance modules
- `PaymentStubDialog.tsx`

Alterar:

- receber/pagos/despesas/resumo como destinos simples;
- modal unico de pagamento onde houver valor;
- nao misturar com pagamentos pessoais.

Aceite:

- financeiro cobra ou marca pago sem navegar em aula/cantina/perfil.

### MOB-WORK-08 - Mais Mobile Seguro

Arquivos provaveis:

- `BottomNav.tsx`
- `ManagementHubPage.tsx`
- `PlacesPage.tsx`

Alterar:

- `Mais` vira central curta:
  - trocar unidade;
  - abrir SaaS web;
  - equipe/ajustes se permitido;
  - relatorios se permitido.

Aceite:

- `Mais` nao vira lista infinita de modulos.

### MOB-WORK-09 - QA Mobile Real Por Papel

Criar screenshots:

- professor 390/430;
- recepcao 390/430;
- financeiro 390/430;
- caixa 390/430;
- gestor 390/430;
- organizador 390/430.

Validar:

- primeira dobra;
- CTA principal;
- ausencia de setup raro;
- sem overflow;
- console sem erro;
- rotas antigas preservadas.

## 10. Sequencia De Execucao

Ordem obrigatoria:

1. MOB-WORK-01
2. MOB-WORK-02
3. MOB-WORK-03
4. MOB-WORK-04
5. MOB-WORK-05
6. MOB-WORK-06
7. MOB-WORK-07
8. MOB-WORK-08
9. MOB-WORK-09

Nao executar modulo interno antes de resolver o shell mobile, porque senao a pagina continua parecendo web encolhido.

## 11. Criterio De Aceite Final

A reorganizacao mobile so sera considerada real quando:

- `/gestao` mobile nao parecer lista de modulos;
- rotas internas nao mostrarem card publico + shell de modulo + tabs antes da tarefa;
- professor nao vir financeiro/cantina/equipe/ajustes;
- recepcao criar reserva sem procurar em submenu;
- financeiro cair em cobranca;
- caixa cair em venda;
- gestor cair em bloqueios;
- organizador cair em competicoes com acao;
- configuracao rara estiver fora da rotina;
- desktop continuar completo;
- rotas antigas funcionarem;
- screenshots 390/430 provarem a mudanca.

