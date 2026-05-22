# Frontend UX Rearchitecture

Fonte principal: `product-architecture-ux-audit.md`.

Documento visual complementar: `PREMIUM_UX_VISUAL_LANGUAGE.md`.

Documentos de execucao visual: `VISUAL_REFERENCE_SYSTEM.md`, `COMPONENT_GRAMMAR.md` e `DESIGN_TOKENS.md`.

Documentos de continuidade: `CURRENT_PRODUCT_STATE.md` e `EXECUTION_QUEUE.md`.

Documentos de perfis e discoverability: `PROFILE_PLAN_ACCESS_MODEL.md` e `TASK_DISCOVERY_ONBOARDING.md`.

Data: 2026-05-13

## Objetivo

Transformar o frontend de um conjunto de paginas com ferramentas acumuladas em um SaaS esportivo moderno, vendavel e operacionalmente claro.

O backend ja sustenta muitos fluxos. A prioridade agora e experiencia:

- separar contextos;
- reduzir carga cognitiva;
- orientar cada persona para a proxima acao;
- elevar percepcao visual e organizacional;
- impedir que novos modulos sejam empilhados em paginas existentes;
- criar uma arquitetura navegavel por tarefas, permissao e plano.

## Diagnostico executivo

O app tem funcionalidades fortes, mas ainda comunica "painel de ferramentas". O usuario ve muitas possibilidades antes de entender o que precisa fazer. Isso reduz confianca, especialmente para gestores que pagariam pelo sistema.

O problema nao e falta de features. E falta de arquitetura de contexto.

O sistema precisa deixar de ser:

```text
Inicio / Eventos / Locais / Ranking / Perfil
com muitas ferramentas dentro de cada pagina
```

e virar:

```text
Area do jogador
Area de gestao
Area de competicoes
Area publica
Configuracao
Relatorios
```

com cada persona vendo apenas o que faz sentido para sua rotina.

## Padroes observados em concorrentes

Pesquisa feita em fontes publicas oficiais:

- Playtomic separa claramente `For players` e `For clubs`, com Playtomic Manager e Academy como produtos do lado gestor.
- CourtReserve separa `For Clubs` e `For Players`, organiza recursos por features e por papeis como Owners, Directors, Front Desk, Instructors e Players.
- OpenCourt organiza solucao por esporte, tipo de instalacao e tipo de negocio, reduzindo ambiguidade de mercado.
- UTR Sports separa `For Players` e `For Providers`, com clubes, academias, escolas e federacoes como contextos de oferta.
- PlayByPoint organiza sua ajuda por dominios operacionais: Players Guide, Facility Setup, Memberships & Passes, Programs & Events, Pros & Lessons, Players & Club Accounts, Payments/POS, Communications, Reports, Apps e Integrations.
- LetzPlay comunica uma plataforma de gestao para academia/arena/clube/liga/circuito e lista dominios esperados no Brasil: clientes, agenda, aulas, locacoes, rankings, torneios, financeiro, loja/lanchonete, tarefas e relatorios.
- Copa Pro separa mensagens para Organizador, Jogador e Dono de Quadra, reforcando que cada persona tem uma promessa diferente.
- Club Automation vende uma plataforma unificada para membership, payments, marketing/reporting e operacao diaria.
- RacketPal e mais player-first: encontrar jogadores, chat, organizar partidas e localizar quadras.
- PodPlay mostra uma direcao premium/hardware-enabled: reservas, memberships, eventos, acesso/porta e experiencia de clube integrada.

Conclusao: produtos maduros nao organizam tudo por "funcionalidade". Eles organizam por persona, tarefa recorrente e contexto de trabalho.

## Problemas atuais

### 1. Mistura de contexto

Hoje o mesmo ecossistema mistura:

- jogador procurando partida;
- dono operando academia;
- professor lancando aula;
- organizador validando resultado;
- gestor financeiro vendo cobranca;
- usuario publico vendo local/torneio.

Quando todos compartilham a mesma logica visual, o produto parece generico. O usuario nao sabe se esta em uma area social, operacional, publica ou administrativa.

### 2. Navegacao ainda e global demais

A inclusao de `/gestao` foi correta, mas ainda e apenas a primeira camada. O proximo salto e transformar `/gestao` em uma area de trabalho com shell proprio:

- sidebar operacional no desktop;
- topbar contextual;
- modulos por permissao;
- busca/atalhos;
- fila de trabalho;
- configuracao separada.

### 3. Paginas grandes ainda fazem papel de sistema inteiro

Arquivos como `PlacesPage.tsx`, `TournamentPage.tsx` e `LeagueDetailsPage.tsx` ainda carregam composicao, dados, estado, regra e UI demais.

Isso aparece na experiencia:

- telas longas;
- muitos cards;
- acoes dispersas;
- formularios inline;
- blocos parecidos em lugares diferentes.

### 4. Dashboard ainda mostra informacao antes de decisao

Um dashboard profissional nao deve responder "quais dados existem?". Deve responder:

```text
O que eu preciso resolver agora?
O que esta atrasado?
Onde ha risco?
Qual acao gera receita/evita problema?
```

KPIs so importam depois de orientar a acao.

### 5. Falta separacao entre operacao, configuracao, publicacao e relatorio

Regra central:

- Operacao: resolver hoje.
- Configuracao: definir como o sistema funciona.
- Publicacao: comunicar para jogadores/canais.
- Relatorios: entender resultado.
- Administracao estrutural: equipe, plano, permissoes, unidades.

Quando essas cinco camadas aparecem na mesma tela, a experiencia degrada.

### 6. Visual premium nao e so cor

O print atual ja melhorou, mas ainda tem sinais de produto gerado rapido:

- hero grande demais para uma area operacional;
- cards com zeros ocupando muito espaco;
- botao "Ver pagina publica" em destaque demais dentro da fila operacional;
- card de local com muitos pequenos botoes equivalentes;
- muita borda e muito container para pouca decisao;
- baixa diferenca entre prioridade, atalho e informacao secundaria.

Premium em SaaS operacional significa:

- menos ruido;
- densidade controlada;
- hierarquia obvia;
- acao primaria sempre clara;
- paginas previsiveis;
- detalhe escondido ate ser necessario.

## Nova arquitetura de produto frontend

### Camada 1 - Player App

Entrada: `/inicio`

Responsabilidade: vida esportiva do jogador.

Deve conter:

- proximo compromisso;
- minhas reservas;
- minhas partidas;
- torneios/ligas que jogo;
- pagamentos pendentes;
- ranking/historico;
- descobrir locais/eventos;
- convites.

Nao deve conter:

- financeiro de academia;
- configuracao de local;
- gestao de equipe;
- relatorios administrativos.

Direcao de UX:

- mobile-first;
- cards poucos e acionaveis;
- reservar em ate 10 segundos;
- inscrever em torneio com minimo de leitura;
- "minha proxima acao" no topo.

### Camada 2 - Management OS

Entrada: `/gestao`

Responsabilidade: operacao diaria de academia, clube, arena, professor ou centro esportivo.

Deve conter:

- locais/unidades acessiveis;
- fila consolidada;
- pendencias por modulo;
- atalhos por papel;
- acesso aos workspaces.

Subrotas:

- `/gestao/:placeId/painel`
- `/gestao/:placeId/agenda`
- `/gestao/:placeId/academia`
- `/gestao/:placeId/clientes`
- `/gestao/:placeId/financeiro`
- `/gestao/:placeId/cantina`
- `/gestao/:placeId/equipe`
- `/gestao/:placeId/ajustes`
- futuro: `/gestao/:placeId/relatorios`
- futuro: `/gestao/:placeId/publicacao`

Regra:

`/gestao` e produto de trabalho. Nao e pagina de marketing, nao e vitrine, nao e lista publica.

### Camada 3 - Competition OS

Entrada:

- `/eventos`
- `/eventos/:tournamentId/...`
- `/eventos/ligas/:leagueId`

Responsabilidade: operacao e experiencia competitiva.

Separar:

- competicoes que jogo;
- competicoes que organizo;
- descoberta publica;
- configuracao;
- publicacao;
- operacao de partida.

Direcao recomendada:

```text
/competicoes
  /jogando
  /organizando
  /descobrir

/competicoes/torneios/:id/operacao
/competicoes/torneios/:id/partidas
/competicoes/torneios/:id/jogadores
/competicoes/torneios/:id/publicacao
/competicoes/torneios/:id/configuracao

/competicoes/ligas/:id/operacao
/competicoes/ligas/:id/rodadas
/competicoes/ligas/:id/jogadores
/competicoes/ligas/:id/ranking
/competicoes/ligas/:id/publicacao
/competicoes/ligas/:id/configuracao
```

Nao precisa migrar tudo de uma vez, mas a gramatica deve ser essa.

### Camada 4 - Public Pages

Responsabilidade: converter publico.

Inclui:

- pagina publica do local;
- pagina publica do torneio;
- inscricao;
- link de turma/reserva;
- ranking publico;
- widget;
- WhatsApp/share.

Regra:

Pagina publica deve parecer produto final para o jogador, nao area administrativa.

### Camada 5 - System Settings

Responsabilidade: estrutura, plano, permissoes, unidades, integracoes.

Configuracao deve ficar longe da rotina diaria.

Exemplos:

- equipe;
- permissoes;
- plano;
- dados fiscais;
- meios de pagamento;
- regras globais;
- integracoes;
- templates de mensagem.

## Navegacao recomendada

### Desktop

Usar shell diferente por contexto.

Player shell:

- sidebar curta ou bottom nav em telas menores;
- Inicio, Competicoes, Locais, Ranking, Perfil.

Management shell:

- sidebar fixa dentro de `/gestao`;
- topo com local/unidade ativa;
- modulos filtrados por permissao;
- botao de acao rapida;
- area de busca/command palette no futuro.

Competition shell:

- header de competicao;
- tabs operacionais;
- seletor de classe/rodada;
- fila de pendencias;
- publicacao/configuracao separadas.

### Mobile

Mobile nao deve replicar desktop comprimido.

Player mobile:

- bottom nav;
- cards simples;
- fluxos de reserva/inscricao guiados.

Gestao mobile:

- seletor de local no topo;
- "Hoje" como primeira aba;
- action sheet para criar/editar;
- cards com no maximo uma acao primaria;
- detalhes em drawer;
- configuracao em tela propria.

Organizador mobile:

- classe/rodada ativa primeiro;
- partidas pendentes primeiro;
- botoes grandes para resultado, confirmar, avisar;
- chave completa como visualizacao, nao como painel de operacao principal.

## Perfis e experiencia ideal

### Jogador

Ve:

- Inicio;
- minhas partidas/reservas/aulas;
- competicoes que jogo;
- ranking;
- locais publicos;
- perfil.

Nao ve:

- equipe;
- financeiro administrativo;
- cantina;
- CRM;
- relatorios de local.

Fluxo ideal:

1. Abre app.
2. Ve proximo compromisso e pendencias pessoais.
3. Reserva quadra ou entra em partida.
4. Acompanha competicao/historico.

### Dono de academia/clube

Ve:

- `/gestao`;
- locais/unidades;
- agenda;
- academia;
- clientes;
- financeiro;
- cantina;
- equipe;
- relatorios;
- publicacao.

Nao deve ver primeiro:

- feed social;
- rankings globais;
- cards de descoberta publica.

Fluxo ideal:

1. Abre `/gestao`.
2. Ve pendencias de hoje.
3. Resolve reservas/pagamentos/leads.
4. Entra em relatorio ou configuracao apenas quando precisa.

### Professor

Ve:

- agenda de aulas;
- turmas;
- alunos;
- chamada;
- faltas/reposicoes;
- evolucao;
- comissoes se permitido.

Nao ve:

- financeiro completo;
- planos do local;
- equipe/permissoes;
- relatorios gerenciais amplos.

Fluxo ideal:

1. Abre "Minhas aulas hoje".
2. Marca presenca/falta.
3. Registra evolucao.
4. Solicita/reposiciona aula.

### Recepcao/front desk

Ve:

- agenda;
- reservas pendentes;
- lista de espera;
- cadastro rapido de cliente;
- pagamento simples;
- check-in futuro.

Nao ve:

- configuracao estrutural;
- relatorios financeiros sensiveis;
- permissoes.

Fluxo ideal:

1. Confirma horarios.
2. Aloca lista de espera.
3. Recebe pagamentos.
4. Resolve contato rapido.

### Organizador de torneio/liga

Ve:

- competicoes organizadas;
- fila de inscricoes/resultados/presencas;
- partidas;
- jogadores;
- publicacao;
- configuracao.

Nao deve misturar com:

- torneios que joga, salvo em uma secao "jogando".

Fluxo ideal:

1. Abre competicao.
2. Escolhe classe/rodada.
3. Resolve pendencias.
4. Publica avisos/chave.

### Gestor financeiro

Ve:

- recebiveis;
- inadimplentes;
- vendas;
- despesas;
- caixa;
- relatorios;
- exportacoes.

Nao ve primeiro:

- agenda completa;
- chat;
- ranking;
- modulo social.

Fluxo ideal:

1. Abre financeiro.
2. Ve atraso/risco/receita do dia.
3. Lembra devedores.
4. Marca pagamentos.
5. Exporta/analisa.

## UX/UI: regras de alto padrao

### Hierarquia

Cada tela deve seguir:

1. contexto atual;
2. proxima acao;
3. fila/pedidos;
4. lista principal;
5. detalhes/relatorio;
6. configuracao.

Se uma tela mostrar configuracao antes de operacao, esta invertida.

### Cards

Usar card apenas quando houver entidade ou agrupamento real.

Evitar:

- card dentro de card;
- card para cada metrica pequena;
- mosaico de zeros;
- card com 4+ botoes.

Preferir:

- metric strip compacto;
- row operacional;
- tabela responsiva;
- drawer para detalhe.

### Dashboards

Dashboard premium tem pouca coisa:

- 3 a 5 indicadores maximos;
- fila priorizada;
- acoes rapidas;
- alertas importantes;
- nada de relatorio completo no topo.

### Tabelas e listas

Desktop:

- tabela/row densa;
- filtros persistentes;
- coluna de status clara;
- acao primaria fixa;
- acoes secundarias em menu.

Mobile:

- cards compactos;
- uma acao primaria;
- detalhes em drawer;
- filtros em sheet;
- sticky action quando necessario.

### Linguagem visual

Direcao:

- mais produto SaaS, menos pagina promocional;
- tipografia menor e mais controlada em areas operacionais;
- hero menor em gestao;
- espacos consistentes;
- cores sem competir entre si;
- verde como sucesso/acao, nao como fundo de tudo;
- status com gramatica unica.

### Componentes obrigatorios

- `WorkspaceShell`
- `ContextHeader`
- `OperationalQueue`
- `EntityActionRow`
- `MetricStrip`
- `ActionBar`
- `EntityDrawer`
- `SetupWizard`
- `PermissionGate`
- `ModuleNav`
- `EmptyState`
- `LoadingState`
- `ErrorState`

## Arquitetura tecnica de frontend

### Estrutura recomendada

```text
src/
  app/
    routes/
    shells/
    navigation/
  domains/
    player/
    management/
    places/
    bookings/
    academy/
    clients/
    finance/
    competitions/
    rankings/
  components/
    ui/
    workspace/
    forms/
    data-display/
  design-system/
    tokens.css
    components.css
```

### Regra de dominio

`pages/` deve orquestrar rota. Nao deve conter regra de negocio longa.

`domains/` deve conter:

- hooks;
- services de UI;
- componentes especificos;
- derivacoes de estado;
- permissoes do dominio.

### Permissoes e plano

Criar uma camada explicita:

```text
UserContext -> Workspaces disponiveis
PlaceAccess -> Modulos disponiveis
PlanAccess -> Features disponiveis
RoleAccess -> Acoes disponiveis
```

Isso evita "tudo aparece para todo mundo".

## Plano tecnico de implementacao

### Bloco 1 - Consolidar shells

Prioridade: critica.

Entregas:

- criar `ManagementShell`;
- mover sidebar/topbar de gestao para shell proprio;
- reduzir hero de `/gestao`;
- criar seletor de local/unidade;
- separar `Locais` de qualquer CTA administrativo forte demais.

Impacto:

- usuario gestor sente que entrou em um produto profissional;
- reduz confusao entre vitrine e operacao.

Status:

- [feito] criado `ManagementShell` como camada visual/operacional propria para `/gestao` e para o admin de local.
- [feito] `/gestao` deixou de usar hero grande e passou a usar cabecalho operacional compacto com contexto, acoes e indicadores.
- [feito] rota administrativa do local passou a renderizar dentro do mesmo shell de gestao, reduzindo a sensacao de subpagina de `Locais`.
- [feito] navegacao global passou a esconder `Gestao` quando nao ha local acessivel, mostrar `Organizar` quando ha competicao administrada e manter `Locais` no contexto de descoberta/player.
- [feito] setup de Gestao passou a expor quick actions semanticas para cadastrar quadra, professor, turma, regras e plano quando essas bases estao incompletas.
- [feito] `/gestao` passou a mostrar checklist de implantacao por local com progresso e etapas acionaveis, aparecendo apenas quando a base operacional ainda esta incompleta.

### Bloco 2 - Extrair `PlaceAdminShell`

Prioridade: critica.

Entregas:

- `PlaceAdminShell`;
- `PlaceAdminDashboard`;
- `PlaceModuleLayout`;
- remover dependencia conceitual de `PlacesPage`;
- manter dados atuais via `place-admin-data` e `usePlaceAdminResourceState`.

Impacto:

- PlacesPage volta a ser descoberta/criacao/publicacao;
- gestao vira area independente.

Status:

- [iniciado] criado `PlaceAdminShell` para concentrar o cabecalho/cockpit operacional do local, substituindo o uso direto do cockpit dentro de `PlacesPage`.
- [iniciado] admin do local passou a expor papel, plano, localidade, features, implantacao e modulo ativo por uma casca propria de gestao.
- [pendente] mover o corpo dos modulos e derivacoes de dados para um `PlaceAdminShell`/container completo, reduzindo a dependencia estrutural de `PlacesPage`.

### Bloco 3 - PermissionGate e menus por papel

Prioridade: alta.

Entregas:

- `PermissionGate`;
- `useWorkspaceAccess`;
- menu de gestao por papel/plano;
- ocultar Financeiro/Cantina/Equipe para quem nao deve ver.

Impacto:

- menos poluicao visual;
- mais seguranca cognitiva;
- experiencia personalizada.

Recalibracao 2026-05-13:

- jogador comum nao deve ver Gestao;
- organizador de torneio/liga deve entrar em Competition Management, nao em gestao completa de academia;
- professor autonomo deve ver operacao leve de aulas/alunos, nao ERP completo;
- academia/clube deve ver Management OS completo conforme plano e permissao;
- navegacao global deve separar Jogar, Organizar e Operar quando o usuario tiver mais de um contexto.

Status:

- [feito] professor com papel `coach` recebeu entrada leve em `/gestao`, focada em aulas, turmas e alunos.
- [feito] fila de Gestao passou a filtrar pendencias por modulo acessivel, evitando sinais de cantina/financeiro/equipe para professor.

Documentos-base:

- `PROFILE_PLAN_ACCESS_MODEL.md`;
- `TASK_DISCOVERY_ONBOARDING.md`.

### Bloco 4 - Competition OS

Prioridade: alta.

Entregas:

- `CompetitionShell`;
- separar "Jogando" e "Organizando";
- unificar torneio/liga em linguagem comum;
- mover publicacao/configuracao para subareas claras.

Impacto:

- organizador reaprende menos;
- jogador nao confunde evento que joga com evento que administra.

Recalibracao 2026-05-13:

- `/eventos` deve evoluir para separar explicitamente competicoes que jogo, competicoes que organizo e descoberta;
- criar torneio/liga deve ser uma intencao visivel para quem tem plano de organizador;
- publicacao/configuracao continuam secundarias em relacao a fila operacional.

Status:

- [feito] `/eventos` passou a exibir os recortes `Jogando`, `Organizando` e `Descobrir` como intencoes separadas.
- [feito] usuarios com competicoes organizadas veem a fila operacional de organizador antes da descoberta publica.
- [feito] jogador comum deixa de ver `Criar torneio`/`Criar liga` como CTA principal no hub; criacao fica nas listas em modo `organizing`.
- [feito] descoberta recebeu acoes de entrada por convite/codigo, ligas, locais publicos e acesso secundario ao contexto de organizacao.
- [feito] organizador novo recebeu roteiro secundario de primeiro evento, com criar torneio/liga como passos acionaveis e publicacao/operacao como proximos passos explicativos.

### Bloco 5 - Player Home simplificada

Prioridade: alta.

Entregas:

- Home com foco em "minha proxima acao";
- esconder secoes nao relevantes;
- separar descoberta em telas proprias;
- cards acionaveis e poucos.

Impacto:

- jogador entende o app mais rapido;
- reduz sensacao de painel generico.

### Bloco 6 - Visual system premium

Prioridade: alta.

Documento de regra: `PREMIUM_UX_VISUAL_LANGUAGE.md`.

Entregas:

- tokens de densidade;
- variantes de botao;
- status badges;
- row/card padronizados;
- tabelas responsivas;
- empty states premium;
- revisao de tipografia e espacamento.
- reducao de mosaicos de KPIs zerados;
- dashboards orientados a decisao antes de dados.

Impacto:

- percepcao de produto profissional;
- menos UI divergente;
- mais velocidade de evolucao.

Status:

- [feito] criado `PREMIUM_UX_VISUAL_LANGUAGE.md` como contrato visual/UX para reduzir ruido, excesso de cards e aparencia de admin template.
- [feito] `/gestao` passou a mostrar apenas pendencias reais na fila do dia; quando tudo esta zerado, exibe estado calmo de operacao em dia em vez de mosaico de cards.
- [feito] criados `VISUAL_REFERENCE_SYSTEM.md`, `COMPONENT_GRAMMAR.md` e `DESIGN_TOKENS.md` para transformar referencias premium em criterios concretos de frontend.
- [feito] `/gestao` passou de grid de cards de locais para lista operacional em rows, com identidade, pulso, tarefas, setup e acoes em hierarchy mais clara.
- [feito] criados `CURRENT_PRODUCT_STATE.md` e `EXECUTION_QUEUE.md` para manter estado consolidado e fila de execucao incremental sem reabrir a arquitetura conceitual.

## O que remover ou reduzir

Reduzir:

- herois grandes em areas operacionais;
- mosaicos de KPIs sem acao;
- botoes secundarios visiveis demais;
- formularios longos inline;
- cards repetidos para dados vazios;
- publicacao misturada com rotina;
- configuracao no topo da tela.

Remover depois de migrar:

- rotas antigas como destino principal;
- blocos legados duplicados em `PlacesPage`;
- CTAs administrativos dentro de `Locais` que disputem com descoberta publica;
- qualquer dashboard que nao gere decisao.

## Roadmap de reorganizacao

### Semana 1 - Fundacao de experiencia

- Criar `ManagementShell`.
- Ajustar `/gestao` para layout operacional mais compacto.
- Criar `PermissionGate`.
- Documentar menus por papel.

### Semana 2 - Separacao real de gestao

- Criar `PlaceAdminShell`.
- Migrar painel e navegacao de local para fora de `PlacesPage`.
- Deixar `PlacesPage` como hub publico/criacao.

### Semana 3 - Operacao diaria refinada

- Padronizar filas em Agenda, Academia, Clientes e Financeiro.
- Mover detalhes para drawers.
- Reduzir cards com zeros.

### Semana 4 - Competicoes

- Criar `CompetitionShell`.
- Separar `Jogando` e `Organizando`.
- Unificar torneio/liga.

### Semana 5 - Visual premium

- Revisar densidade desktop/mobile.
- Padronizar cards, botoes, rows, badges.
- Ajustar hierarchy visual de todas as areas principais.

## Decisao principal

O app deve ser vendido como uma plataforma com dois produtos conectados:

1. Player App: simples, rapido, mobile-first.
2. Management OS: profissional, modular, orientado a operacao.

Competicoes ficam como uma terceira camada compartilhada:

3. Competition OS: jogador acompanha, organizador opera.

Essa separacao resolve o maior problema atual: o sistema deixa de parecer um painel com ferramentas acumuladas e passa a parecer um SaaS desenhado para papeis reais.
