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

### [>] COMP-03 - Refinar operacao de partidas e resultados no Competition OS

Status: `[ ]` pendente

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
