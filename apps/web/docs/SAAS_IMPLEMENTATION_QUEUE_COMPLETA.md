# SaaS Implementation Queue Completa

Status: queue executiva completa
Data: 2026-05-22
Fonte primaria: `SAAS_MASTER_BLUEPRINT_COMPLETO.md`
Mapa alvo: `SAAS_TARGET_ARCHITECTURE_IMPLEMENTATION_MAP.md`
Guardrails: `SAAS_EXECUTION_GUARDRAILS_ANTI_PATTERNS.md`
Screen contracts: `SAAS_SCREEN_CONTRACTS_DETAILED.md`

## 0. Regra de execucao autonoma

Esta queue foi organizada para ser executada em sequencia, sem pedir autorizacao entre sprints.

Ao executar:

1. Seguir a ordem dos sprints.
2. Nao pular item sem registrar motivo.
3. Se aparecer bloqueio tecnico nao previsto, corrigir o menor necessario para destravar o fluxo.
4. Verificar a correcao antes de passar para o proximo item.
5. Preservar rotas publicas, legadas e aliases.
6. Nao recriar backend se composicao/reuso resolver sem comprometer a tela alvo.
7. Nao relaxar permissoes para simplificar.
8. Nao implementar uma tela isolada que contradiga o blueprint.
9. Atualizar esta queue com status quando cada sprint terminar.
10. Validar web primeiro; mobile trabalho vem depois da estrutura web.
11. Nao preservar layout, menu, card, popup, hero ou componente antigo para economizar trabalho quando ele nao entrega o contrato SaaS final.
12. Cada entrega visual precisa de screenshot e revisao contra a referencia/contrato antes de ser considerada concluida.

## 1. Regras de bloqueio

Se uma etapa travar por falta de dado, RPC, rota, componente ou migracao:

- Identificar causa.
- Confirmar primeiro qual e a experiencia final exigida para a tela.
- Verificar se existe funcao atual reaproveitavel sem prejudicar essa experiencia.
- Se existir, reaproveitar apenas dados/regras/chamadas que respeitam o contrato final.
- Se o componente antigo gerar adaptacao ruim, substituir a estrutura visual/UX.
- Se nao existir suporte tecnico, criar o menor ajuste necessario para fechar o fluxo.
- Rodar verificacao local.
- Capturar screenshot da tela alterada e comparar com o contrato.
- Registrar a mudanca no item da queue.
- Continuar para o proximo item.

Bloqueios que podem ser resolvidos sem pedir autorizacao:

- Ajuste de layout/responsividade.
- Wrapper/alias de rota.
- Drawer/modal para fluxo existente.
- Ajuste de nomenclatura definido no blueprint.
- Pequena funcao utilitaria frontend.
- Ajuste pequeno de RPC/migration indispensavel para funcao ja definida.
- Registro simples de historico/interacao quando dados existentes permitirem.
- Correcoes de bug encontradas em QA.

Bloqueios que devem ser apenas documentados se forem grandes demais:

- Gateway real de pagamento.
- Permissoes comerciais/plano final.
- Auditoria completa.
- Multiunidade profunda.
- Automacoes complexas.
- CRM avancado.
- Dashboards analiticos completos.

## 2. Ordem completa dos sprints

Antes de iniciar `SPRINT-01`, ler o mapa alvo `SAAS_TARGET_ARCHITECTURE_IMPLEMENTATION_MAP.md`. A queue abaixo e a execucao em ordem; o mapa alvo mostra a arquitetura final para onde cada sprint deve mover o app.

Tambem e obrigatorio seguir `SAAS_EXECUTION_GUARDRAILS_ANTI_PATTERNS.md`. Se uma implementacao cair em anti-padrao proibido, corrigir antes de passar para o proximo sprint.

Cada tela implementada tambem deve seguir `SAAS_SCREEN_CONTRACTS_DETAILED.md`. Se uma tela nao tiver contrato, criar/atualizar o contrato antes de codar.

### SPRINT-00 - Sanidade da base e contratos

Status em 2026-05-22:
Concluido. Documentos ativos, guardrails, contratos, mapa alvo e arquivos de navegacao/workspaces foram conferidos antes da implementacao.

Objetivo:
Garantir que a implementacao parte da base correta.

O que fazer:

- Confirmar documentos ativos.
- Confirmar que legados nao sao fonte.
- Confirmar o mapa alvo de menus, paginas e dominios.
- Confirmar guardrails e anti-padroes obrigatorios.
- Confirmar contratos detalhados das telas que serao alteradas.
- Confirmar revisao pagina por pagina em `SAAS_PAGE_BY_PAGE_COMPLETION_REVIEW.md`.
- Confirmar rotas atuais.
- Mapear arquivos de shell/navegacao/workspaces.
- Criar checklist de QA base.

Arquivos provaveis:

- `web/docs/EXECUTION_QUEUE.md`
- `web/docs/SAAS_MASTER_BLUEPRINT_COMPLETO.md`
- `web/docs/SAAS_TARGET_ARCHITECTURE_IMPLEMENTATION_MAP.md`
- `web/docs/SAAS_EXECUTION_GUARDRAILS_ANTI_PATTERNS.md`
- `web/docs/SAAS_SCREEN_CONTRACTS_DETAILED.md`
- `web/docs/SAAS_PAGE_BY_PAGE_COMPLETION_REVIEW.md`
- `web/src/App.tsx`
- `web/src/components/BottomNav.tsx`
- `web/src/lib/place-admin-navigation.ts`
- `web/src/lib/place-management.ts`

Criterio de aceite:
Implementacao sabe quais rotas nao pode quebrar, quais dominios vao existir, quais paginas finais precisam existir, como cada sprint encaixa no mapa alvo, quais anti-padroes sao proibidos e qual contrato detalhado cada tela deve seguir.

QA:

- `npm run build`
- checagem manual de rotas principais.

### SPRINT-01 - Shell SaaS web por dominios

Status em 2026-05-22:
Em execucao avancada. Ja foram aplicados os segmentos canonicos novos (`inicio`, `clientes`, `financeiro`, `loja-pos`, `administracao`) com aliases antigos preservados, a sidebar desktop passou a operar por dominios SaaS e o seletor interno duplicado de modulos foi removido do shell de gestao. A topbar Work agora tem busca global navegavel e menu `+ Criar` com acoes rapidas, sem depender de submenu lateral ou card empilhado.

Objetivo:
Transformar Trabalho web em estrutura SaaS real. Este sprint nao pode terminar com aparencia de menu antigo, pagina generica ou painel adaptado. Se shell, sidebar, topbar ou proporcoes herdadas impedirem o resultado alvo, eles devem ser substituidos.

O que fazer:

- Criar/ajustar shell web Trabalho.
- Sidebar por dominios:
  - Inicio
  - Agenda
  - Clientes
  - Academia
  - Financeiro
  - Competicoes
  - Loja/POS
  - Comunicacao
  - Relatorios
  - Administracao
- Topbar com:
  - logo consistente;
  - seletor Jogador/Trabalho;
  - unidade/local ativo;
  - usuario/papel;
  - notificacoes;
  - criar rapido preparado.
- Preservar rotas antigas por wrappers/aliases.

Arquivos provaveis:

- `web/src/App.tsx`
- `web/src/components/BottomNav.tsx`
- `web/src/pages/PlacesPage.tsx`
- `web/src/lib/place-admin-navigation.ts`
- `web/src/lib/workspace-access.ts`

Criterio de aceite:
Area Trabalho web deixa de parecer lista de modulos e passa a ter dominios SaaS claros, topbar compacta, unidade ativa evidente e primeira dobra util. A tela precisa ser comprovada por screenshot.

QA:

- desktop 1366;
- desktop amplo;
- mobile ainda nao precisa final, mas nao pode quebrar.

### SPRINT-02 - Unidade/local ativo e contexto

Status em 2026-05-22:
Em execucao avancada. O contexto global de trabalho agora carrega unidades acessiveis, nomes e labels por ID; a topbar Work mostra unidade ativa, busca global navegavel e criar rapido sem alterar backend.

Objetivo:
Resolver confusao quando usuario tem mais de uma academia/local.

O que fazer:

- Exibir local/unidade ativa na topbar.
- Garantir que links de trabalho carregam contexto correto.
- Criar troca de local quando houver mais de um.
- Evitar que menu externo perca contexto interno.

Arquivos provaveis:

- `web/src/pages/PlacesPage.tsx`
- `web/src/lib/places.ts`
- componentes de header/topbar.

Criterio de aceite:
Usuario sabe em qual local esta trabalhando antes de mexer em agenda, clientes ou financeiro.

QA:

- login com um local;
- login com mais de um local;
- rotas `/gestao`, `/gestao/:placeId`, `/locais/:placeId/admin`.

### SPRINT-03 - Agenda como centro operacional

Status em 2026-05-22:
Em execucao avancada. A Agenda web foi movida para calendario operacional com tabs compactas, filtros, hora cheia, slot clicavel, drawer lateral no desktop e sheet no mobile. O horario deixou de ser repetido dentro dos blocos, ficando no eixo do calendario e no detalhe lateral. Corrigido tambem o carregamento lento em `/gestao/:placeId/...`: rotas diretas agora carregam recursos profundos apenas do local aberto, mantendo a lista de unidades para o seletor.

Objetivo:
Transformar Agenda em calendario central de trabalho, com proporcao de SaaS profissional. A agenda nao pode abrir com hero grande, cards aleatorios, fila empilhada ou formulario interno quebrado.

O que fazer:

- Criar dominio `Agenda`.
- Calendario principal com visoes:
  - dia;
  - semana, se viavel;
  - por quadra/recurso;
  - lista.
- Mostrar reservas, aulas, bloqueios e competicoes como tipos filtraveis.
- Em `Reservas`, filtros devem ser de reserva, nao professor/turma.
- Ajustar colunas para usar espaco do monitor; nada de quadra cair para baixo com espaco disponivel.
- Slots em hora cheia.
- Slot clicavel.
- Drawer lateral fixo para detalhe no desktop.
- Sheet/drawer responsivo no mobile.
- Tabs compactas no topo da area, nao menus duplicados.
- Primeira dobra deve mostrar o calendario e o detalhe, nao resumos decorativos.

Arquivos provaveis:

- `web/src/pages/PlacesPage.tsx`
- componentes de calendario/reservas existentes.
- `web/src/lib/places.ts`

Criterio de aceite:
Recepcao consegue entender ocupacao do dia e clicar em horario sem procurar submenus. O resultado visual deve se aproximar do mock alvo de Agenda SaaS: calendario amplo, eventos por status, detalhe lateral e acoes claras.

QA:

- desktop 1366;
- desktop amplo;
- mobile 390/430 apenas sem quebra critica.

### SPRINT-04 - Reserva drawer completo

Status em 2026-05-22:
Em execucao avancada. O clique em reserva abre detalhe lateral no desktop, nao mais formulario estreito dentro do calendario. A edicao fica dentro do drawer em coluna legivel, sem listas/historico competindo durante a edicao. O pagamento aparece como acao do drawer e a validacao visual foi registrada em screenshot. Em 2026-05-23 a migration `0096_court_booking_change_requests_v1.sql` foi aplicada no Supabase ativo, o schema do PostgREST foi recarregado e as RPCs `app_update_court_booking_admin`, `app_create_court_booking_change_request`, `app_get_court_booking_change_request` e `app_confirm_court_booking_change_request` foram confirmadas no catalogo. Validacao via Supabase JS confirmou que `app_create_court_booking_change_request` nao retorna mais erro de schema cache.

Objetivo:
Criar fluxo operacional completo de reserva.

O que fazer:

- Ao clicar slot livre: abrir nova reserva.
- Ao clicar reserva: abrir drawer responsivo, nao formulario dentro de card estreito.
- Acoes:
  - editar;
  - cancelar;
  - remarcar;
  - cobrar/pagar;
  - WhatsApp;
  - abrir Cliente 360.
- Validar disponibilidade antes de salvar.
- Corrigir erros de RPC/migration se aparecerem.
- Historico basico quando possivel.

Arquivos provaveis:

- `web/src/pages/PlacesPage.tsx`
- `web/src/lib/places.ts`
- possiveis migrations se RPC faltar.

Criterio de aceite:
Editar reserva funciona sem layout quebrado e sem erro de schema cache.

QA:

- criar reserva;
- editar horario/quadra;
- cancelar;
- tentar horario ocupado;
- WhatsApp remarcacao;
- pagamento stub.

### SPRINT-05 - Pagamento stub padrao

Status em 2026-05-22:
Em execucao avancada. O modal `PaymentStubDialog` foi padronizado em dark SaaS e aplicado tambem em reserva sem registro previo de pagamento, criando payload temporario por `court_booking`. O botao `Pagar` continua sendo stub para marcar como pago ate a integracao futura do gateway/webhook.

Objetivo:
Unificar todo ponto de pagamento com modal simples.

O que fazer:

- Criar componente/modal padrao.
- Mostrar origem, cliente, descricao, valor e status.
- Botao `Pagar` ou `Marcar como pago`.
- Usar stub atual para converter como pago.
- Preparar interface para Edge Function/webhook futuro.
- Aplicar inicialmente em:
  - reserva;
  - mensalidade/matricula;
  - inscricao de torneio/liga;
  - pacote/plano quando existir.

Arquivos provaveis:

- `web/src/lib/payments.ts`
- componentes compartilhados;
- paginas de agenda/financeiro/competicoes.

Criterio de aceite:
Pagamento nao fica espalhado em botoes diferentes.

QA:

- marcar reserva como paga;
- marcar pagamento pessoal como pago;
- marcar inscricao como paga.

### SPRINT-06 - WhatsApp operacional

Status em 2026-05-22:
Em execucao avancada. Templates de reserva/remarcacao usam nome do cliente, local, remetente, horario, contexto e mensagem profissional. Em 2026-05-23 a migration `0096_court_booking_change_requests_v1.sql` foi aplicada no Supabase ativo e a RPC `app_create_court_booking_change_request` foi validada sem erro de schema cache. Proximo fechamento: acionar o fluxo real pela UI com reserva futura, abrir WhatsApp com link `/remarcar-reserva/:token` e confirmar a tela de escolha de novo horario pelo jogador.

Objetivo:
Adicionar mensagens profissionais nos pontos definidos no blueprint.

O que fazer:

- Criar util de templates WhatsApp.
- Criar funcao de abrir WhatsApp.
- Registrar interacao simples quando houver cliente/pessoa e estrutura permitir.
- Aplicar em:
  - reserva confirmada;
  - aguardando pagamento;
  - cancelamento;
  - remarcacao;
  - lembrete;
  - cobranca;
  - pagamento confirmado;
  - aula;
  - reposicao;
  - lead;
  - inscricao;
  - partida;
  - resultado pendente;
  - aviso geral.

Arquivos provaveis:

- util novo em `web/src/lib`
- componentes de agenda, clientes, financeiro, competicoes.

Criterio de aceite:
Mensagens abrem prontas, com nome, local, remetente e contexto.

QA:

- validar encoding da URL;
- validar numero do cliente;
- validar ausencia de telefone;
- validar mensagem em reserva e cobranca.

### SPRINT-07 - Clientes dominio e listas

Status em 2026-05-22:
Em execucao avancada. `Clientes` opera como dominio separado com abas `Clientes ativos`, `Leads` e `Atendimento`, sem misturar contato comercial com cliente ativo. A lista de clientes ativos foi ajustada para funcionar como tabela operacional compacta com Cliente 360 lateral, sem cortar colunas no desktop 1366.

Objetivo:
Separar Leads, Clientes ativos, Alunos, Socios e Responsaveis.

O que fazer:

- Criar dominio `Clientes`.
- List views:
  - Leads;
  - Clientes ativos;
  - Alunos;
  - Socios;
  - Responsaveis;
  - Inativos/arquivados.
- Busca por nome, telefone e e-mail.
- Criar cliente rapido com cadastro progressivo.

Arquivos provaveis:

- `web/src/pages/PlacesPage.tsx`
- `web/src/lib/places.ts`
- componentes de CRM/clientes.

Criterio de aceite:
Leads e clientes ativos deixam de ficar misturados.

QA:

- criar lead;
- criar cliente rapido;
- filtrar aluno;
- abrir detalhe.

### SPRINT-08 - Cliente 360

Status em 2026-05-22:
Em execucao avancada. Cliente 360 abre ao lado da lista, mostra status, categoria, telefone, email, responsavel, resumo e acoes principais (`WhatsApp`, `Abrir aulas` ou `Abrir receita`) sem tirar a recepcao da tabela. Ainda falta enriquecer historico profundo e pagamentos por cliente em fase posterior.

Objetivo:
Criar tela/drawer central do cliente.

O que fazer:

- Cabecalho com status, telefone, tags e proximo passo.
- Acoes rapidas:
  - nova reserva;
  - matricular;
  - cobrar;
  - WhatsApp;
  - observacao.
- Secoes:
  - reservas;
  - aulas/matriculas;
  - pagamentos;
  - interacoes;
  - observacoes;
  - historico.
- Cadastro progressivo.

Arquivos provaveis:

- componentes de cliente;
- `web/src/lib/places.ts`
- paginas de clientes/agenda/academia/financeiro.

Criterio de aceite:
Recepcao entende a situacao do cliente em menos de 10 segundos.

QA:

- cliente sem dados;
- aluno com aula;
- cliente com pagamento pendente;
- cliente com reserva futura;
- mobile sem quebra.

### SPRINT-09 - Academia web profissional

Status em 2026-05-22:
Em execucao avancada. A rotina de Academia passou a usar mesa operacional com metricas, lista/tabela de aulas do dia e detalhe lateral da aula, reduzindo cards soltos e deixando chamada opcional respeitada como configuracao da empresa. Ainda restam contratos profundos para Turmas, Alunos e agenda semanal antes de considerar o dominio inteiro concluido.

Objetivo:
Reorganizar aulas/turmas/alunos/professores sem tabs confusas.

O que fazer:

- Criar dominio `Academia`.
- Paginas:
  - Aulas;
  - Turmas;
  - Matriculas;
  - Reposicoes;
  - Evolucao;
  - Professores no contexto de aula.
- Remover submenus redundantes.
- Professor como entidade aparece tambem em equipe/clientes conforme contexto.
- Modal/drawer de aluno/matricula responsivo.

Arquivos provaveis:

- `web/src/pages/PlacesPage.tsx`
- `web/src/lib/places.ts`
- componentes academy.

Criterio de aceite:
Gestor administra aulas sem parecer adaptacao mobile.

QA:

- criar turma;
- matricular aluno;
- abrir aluno;
- listar outro dia;
- pendencias precisam abrir lista real.

### SPRINT-10 - Professor e chamada opcional

Status em 2026-05-22:
Concluido para comportamento base. A configuracao `requireAttendanceCall` existe, vem desligada por padrao e altera a rotina: quando desligada, a tela fala em aula/avisos/reposicoes, nao obriga chamada e mostra apenas `Aviso previo`; quando ligada, libera chamada/presenca/ausencia.

Objetivo:
Tornar rotina do professor simples e remover chamada obrigatoria por padrao.

O que fazer:

- Configuracao `exigir chamada` padrao desligado.
- Quando desligado, esconder CTA de chamada obrigatoria.
- Priorizar:
  - aulas do dia;
  - horario cheio;
  - turma;
  - alunos;
  - quadra;
  - faltas avisadas;
  - reposicoes;
  - observacoes.

Arquivos provaveis:

- academy settings;
- `PlacesPage`;
- componentes mobile/work professor.

Criterio de aceite:
Professor nao cai em ERP nem e obrigado a fazer chamada se empresa nao exige.

QA:

- setting desligado;
- setting ligado;
- professor coach-only;
- gestor.

### SPRINT-11 - Financeiro dominio

Status em 2026-05-22:
Em execucao avancada. Recebiveis ganharam console SaaS com lista operacional, status, cobranca e detalhe lateral. A tabela foi compactada para nao competir com o drawer: valor e acoes ficam no detalhe lateral, enquanto a lista mostra cliente, origem, vencimento, status e valor. O modal de pagamento stub foi padronizado como passo temporario para marcar como pago. Ainda restam relatorios financeiros mais profundos, despesas e conciliacao como fases posteriores.

Objetivo:
Centralizar financeiro do local.

O que fazer:

- Criar dominio `Financeiro`.
- Paginas/list views:
  - Receber;
  - Vencidos;
  - Pagos;
  - Despesas;
  - Planos e pacotes;
  - Mensalidades;
  - Comissoes planejadas;
  - Resumo.
- Separar financeiro local de pagamentos pessoais.
- Todos os cards levam para listas filtradas.

Arquivos provaveis:

- `web/src/lib/payments.ts`
- `web/src/lib/places.ts`
- `PlacesPage`.

Criterio de aceite:
Financeiro consegue cobrar e marcar pago sem procurar em aulas/reservas.

QA:

- vencidos;
- pagar;
- despesa;
- resumo;
- sem permissao.

### SPRINT-12 - Relatorios MVP por listas filtradas

Status em 2026-05-22:
Em execucao avancada. Relatorios ganharam console inicial com filtros, indicadores, tabela por area e drawer lateral de leitura. A lista agora segue o padrao SaaS validado: linhas escuras compactas, item selecionado com acento verde e detalhe lateral, sem blocos verdes gigantes competindo com a leitura. Relatorios avancados seguem documentados como expansao posterior.

Objetivo:
Planejar relatorios sem tirar foco da operacao.

O que fazer:

- Criar dominio `Relatorios`.
- Primeira entrega com cards que abrem listas filtradas.
- Areas:
  - ocupacao;
  - receita;
  - clientes/alunos;
  - academia;
  - professores;
  - competicoes;
  - POS.

Arquivos provaveis:

- PlacesPage;
- componentes de resumo.

Criterio de aceite:
Gestor percebe problema e clica para lista operacional.

QA:

- cards com zero;
- cards com dados;
- filtros aplicados.

### SPRINT-13 - Competicoes trabalho hub

Status em 2026-05-22:
Em execucao avancada. O modo Trabalho em Competicoes deixou de usar sidebar paralela Torneios/Ligas/Resultados no desktop e passou a usar o dominio global `Competicoes`. O hub foi recriado como console SaaS com hero operacional unico, KPIs, fila por fase, linhas de acao e painel lateral de detalhe. Descoberta publica permanece separada do modo Trabalho.

Objetivo:
Separar organizador de jogador.

O que fazer:

- Trabalho > Competicoes com:
  - Torneios;
  - Ligas;
  - Inscricoes;
  - Resultados;
  - Comunicacao.
- Agrupar por fase/bloqueio.
- Player `/eventos` continua descoberta/participacao.

Arquivos provaveis:

- `TournamentPage.tsx`
- `LeagueDetailsPage.tsx`
- `web/src/lib/tournaments.ts`
- `web/src/lib/leagues.ts`
- rotas.

Criterio de aceite:
Organizador nao cai em descoberta publica; jogador nao ve admin indevido.

QA:

- organizador sem local;
- gestor com local;
- jogador puro;
- staff.

### SPRINT-14 - Torneio cockpit por fase

Status em 2026-05-22:
Em execucao avancada. O cockpit de torneio ja responde por fase com CTA dominante, bloqueio atual, metricas e abas internas compactas. Nesta rodada as abas de competicao foram endurecidas para nao virarem segundo menu branco/ilegivel e para funcionar como regua de subareas da pagina atual.

Objetivo:
Transformar admin de torneio em cockpit operacional.

O que fazer:

- Fases:
  - rascunho;
  - inscricoes abertas;
  - inscricoes encerradas;
  - jogos gerados;
  - em andamento;
  - finalizado.
- CTA principal por fase.
- Staff roles:
  - owner;
  - organizer;
  - checkin;
  - scorekeeper;
  - media;
  - participant.
- Preservar `/inscricao`, `/join`, `/t`.

Arquivos provaveis:

- `TournamentPage.tsx`
- tournament libs.

Criterio de aceite:
Primeira dobra responde "o que falta resolver agora?".

QA:

- criar torneio;
- aprovar inscricoes;
- marcar pagamento;
- gerar/publicar jogos;
- lancar resultado;
- finalizar.

### SPRINT-15 - Liga cockpit por fase

Status em 2026-05-22:
Em execucao avancada. A liga owner ja possui cockpit por fase, mas havia vazamento de experiencia Player ao abrir liga pelo hub profissional. Corrigido o fluxo do Hub de Competicoes para abrir ligas com `mode=work`, mantendo a rota publica preservada e usando sidebar/topbar do Work SaaS quando a entrada e profissional.

Objetivo:
Separar participante e owner em liga.

O que fazer:

- Fases:
  - configuracao;
  - participantes;
  - rodada ativa;
  - entre rodadas;
  - encerramento;
  - historico.
- Participante ve rodada atual, adversario, chat, resultado, classificacao.
- Owner ve pendencias, gerar rodada, validar resultado, ranking.

Arquivos provaveis:

- `LeagueDetailsPage.tsx`
- league libs.

Criterio de aceite:
Owner nao cai em tela de descoberta e participante nao ve admin indevido.

QA:

- criar liga;
- aprovar participante;
- gerar rodada;
- enviar resultado;
- validar;
- gerar proxima.

### SPRINT-16 - Loja/POS

Status em 2026-05-22:
Em execucao avancada. Loja/POS carrega como dominio de trabalho com venda rapida, produtos, estoque e vendas do dia em abas compactas. Validado visualmente em desktop apos aguardar dados reais. Ainda deve receber a mesma logica final de detalhe lateral/checkout quando o fluxo de pagamento definitivo substituir o modal stub.

Objetivo:
Organizar POS como fluxo rapido.

O que fazer:

- Vender como primeira camada.
- Produtos e estoque separados.
- Vendas do dia.
- Cancelamento com permissao.
- Cliente vinculado opcional.

Arquivos provaveis:

- PlacesPage;
- `places.ts` POS.

Criterio de aceite:
Caixa vende sem navegar por configuracao.

QA:

- vender;
- estoque baixo;
- cancelar venda;
- sem permissao.

### SPRINT-17 - Comunicacao dominio

Status em 2026-05-22:
Em execucao avancada. Comunicacao ganhou console separado para mensagens, templates e filas contextuais, evitando que WhatsApp fique espalhado sem padrao. A fila agora tambem segue o padrao SaaS com selecao de linha, status compacto e drawer lateral com CTA dominante; clicar na linha seleciona contexto, e a acao principal fica no painel lateral. Ainda falta ligar todos os pontos de mensagem em uma matriz final de templates.

Objetivo:
Centralizar comunicacao sem tirar contexto dos fluxos.

O que fazer:

- Pagina de modelos.
- Historico/interacoes quando disponivel.
- Avisos por dominio.
- Links para WhatsApp contextual.

Arquivos provaveis:

- util WhatsApp;
- Clientes;
- Competicoes.

Criterio de aceite:
Comunicacao contextual continua nos fluxos, mas tambem e rastreavel.

QA:

- mensagem reserva;
- cobranca;
- competicao;
- cliente sem telefone.

### SPRINT-18 - Administracao e configuracoes

Status em 2026-05-22:
Em execucao avancada. Administracao passou a concentrar setup, equipe, permissoes futuras e configuracoes estruturais fora da rotina diaria. A tela usa console com checklist e detalhe lateral, separando operacao de configuracao rara.

Objetivo:
Tirar setup raro da rotina diaria.

O que fazer:

- Administracao com:
  - unidade/local;
  - equipe;
  - permissoes futuras;
  - quadras/recursos;
  - regras;
  - planos;
  - publicacao;
  - integracoes;
  - avancado.
- Remover ajustes duplicados dos fluxos diarios.

Arquivos provaveis:

- PlacesPage;
- place-admin-navigation;
- settings components.

Criterio de aceite:
Owner encontra configuracao; recepcao/professor nao tropeçam nela.

QA:

- owner;
- manager;
- frontdesk;
- coach.

### SPRINT-19 - Player App alinhado

Status em 2026-05-22:
Em execucao avancada. Player foi revalidado apos as mudancas do Work SaaS: Jogar esta com hero simplificado e cards encaixados, Perfil esta alinhado, Rotina consolidada, e Competir recebeu endurecimento visual para impedir cards/botoes brancos ilegíveis nos resultados recentes. O seletor Jogador/Trabalho permanece apenas como troca oficial de modo, sem transformar a primeira dobra em gestao.

Objetivo:
Garantir que Player nao foi prejudicado.

O que fazer:

- Menu Player:
  - Inicio;
  - Jogar;
  - Competir;
  - Rotina;
  - Perfil.
- `/agenda` e rotas antigas como alias/filtros.
- Remover vazamento de Trabalho no Player.
- Ajustar textos de Jogar/Competir.
- Garantir pagamentos pessoais separados.

Arquivos provaveis:

- `BottomNav.tsx`
- `PersonalAgendaPage.tsx`
- `PlacesPage.tsx`
- `TournamentPage.tsx`
- rotas.

Criterio de aceite:
Jogador puro nao ve gestao e entende Rotina.

QA:

- jogador puro;
- aluno;
- socio;
- competitivo.

### SPRINT-20 - Work Mobile operacional

Status em 2026-05-22:
Em execucao avancada. A navegacao mobile Trabalho ja muda por papel dominante e foi revalidada em 390px para gestor: `Hoje`, `Agenda`, `Aulas`, `Financeiro`, `Mais`. A Agenda mobile usa seletor de quadra, abas enxutas e CTA `Nova reserva`, sem tentar carregar a grade web inteira. Tambem foi ajustado o estado de loading da rota administrativa para dizer `Carregando area de trabalho`, evitando a mensagem incorreta `Buscando locais` no modo Trabalho. Pendencia: melhorar tempo percebido de carregamento, pois o mobile pode levar varios segundos ate a grade real aparecer.

Objetivo:
Depois do web, reorganizar mobile trabalho por papel.

O que fazer:

- Professor: Hoje, Agenda, Turmas, Alunos, Perfil.
- Recepcao: Hoje, Agenda, Reservas, Clientes, Mais.
- Financeiro: Receber, Vencidos, Pagos, Resumo, Perfil.
- Caixa: Vender, Hoje, Estoque, Produtos, Perfil.
- Organizador: Hoje, Torneios, Ligas, Resultados, Perfil.
- Gestor: Hoje, Agenda, Clientes, Financeiro, Mais.
- Remover funcoes web profundas do mobile.

Arquivos provaveis:

- `BottomNav.tsx`
- work shell components.

Criterio de aceite:
Mobile trabalho vira ferramenta de execucao, nao mini-SaaS.

QA:

- 390px;
- 430px;
- papeis principais.

### SPRINT-21 - Busca global e criar rapido

Status em 2026-05-22:
Em execucao avancada. A topbar de Trabalho possui busca global por dominios operacionais e menu `+ Criar` com acoes rapidas: nova reserva, novo cliente, registrar pagamento, criar aula/turma, criar torneio e vender produto. O placeholder foi encurtado para nao quebrar no desktop 1366. Proxima fase: conectar busca real por entidade individual quando houver indice/consulta agregada mais robusta.

Objetivo:
Reduzir dependencia de menus.

O que fazer:

- Busca por cliente, reserva, aula, pagamento, torneio, liga.
- Criar rapido:
  - reserva;
  - cliente;
  - cobranca;
  - turma/aula;
  - torneio;
  - produto.

Arquivos provaveis:

- topbar;
- libs de busca/agregacao.

Criterio de aceite:
Usuario acha dados sem saber em qual menu estao.

QA:

- busca vazia;
- resultados;
- permissao;
- mobile.

### SPRINT-22 - QA transversal completo

Status em 2026-05-22:
Em execucao avancada. QA automatizado com Playwright validou desktop 1366 e mobile 390 nas rotas principais de Trabalho (`inicio`, `agenda`, `academy`, `clients`, `finance`, `communication`, `reports`). Desktop passou sem erros de console. Mobile passou em carregamento real; os apontamentos iniciais de Comunicacao/Relatorios foram falso negativo do script por capitalizacao/alias de rota, e as capturas confirmaram conteudo carregado. Pendencia real: tempo percebido de loading no mobile ainda e alto e deve virar frente de performance/loader.

Objetivo:
Validar que nenhuma persona melhorou quebrando outra.

Personas:

- jogador puro;
- aluno;
- socio;
- competitivo;
- professor;
- recepcao;
- financeiro;
- caixa;
- gestor;
- organizador;
- staff evento;
- multi-papel.

Viewports:

- mobile 390;
- mobile 430;
- desktop 1366;
- desktop amplo.

Validar:

- primeira tela;
- CTA primario;
- menu;
- permissoes;
- rotas;
- console;
- estados vazios;
- fluxo ponta a ponta.

Criterio de aceite:
Relatorio final com aprovado/falhou/corrigido/pendente.

### SPRINT-23 - Correcoes finais e polimento

Status em 2026-05-22:
Em execucao. Polimentos aplicados nesta rodada: blocos da Agenda deixam de repetir horario dentro do card, loading administrativo usa linguagem de Trabalho, busca global nao corta placeholder no desktop 1366, Relatorios/Comunicacao usam listas com drawer e estilos de botao isolados do CSS global. Build passou apos as correcoes.

Objetivo:
Corrigir tudo que o QA transversal encontrou.

O que fazer:

- Corrigir bugs.
- Corrigir textos confusos.
- Ajustar responsividade.
- Ajustar contraste.
- Corrigir rotas quebradas.
- Atualizar docs com diferencas.

Criterio de aceite:
Build passa, fluxos centrais funcionam e nao ha bloqueio critico conhecido.

## 3. Criterios finais de produto

A queue so esta completa quando:

- Trabalho web parece SaaS profissional.
- Agenda e centro operacional.
- Clientes tem 360 funcional.
- Reservas fecham ciclo de criar, editar, pagar, cancelar, remarcar e avisar.
- Academia nao parece menu adaptado.
- Professor tem rotina simples.
- Financeiro e dominio proprio.
- Competicoes separam jogar e organizar.
- Mobile trabalho e operacional por papel.
- Player App continua simples.
- Rotas antigas funcionam.
- Pagamento stub funciona.
- WhatsApp cobre fluxos principais.
- Relatorios iniciais aparecem como cards/listas filtradas.
- QA transversal foi executado.
