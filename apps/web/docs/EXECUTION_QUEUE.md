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

### [>] MOBILE-01 - Padronizar bottom sheets para filtros e detalhes

Status: `[ ]` pendente

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

### [ ] ROWS-01 - Aplicar `EntityActionRow` nas listas operacionais principais

Status: `[ ]` pendente

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

### [ ] HOME-01 - Redesenhar Home do jogador por proxima acao

Status: `[ ]` pendente

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

## P2 - Refinamento de percepcao premium

### [ ] VISUAL-01 - Auditoria global de botoes e CTA hierarchy

Status: `[ ]` pendente

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

### [ ] TYPO-01 - Revisar typography e densidade nas telas principais

Status: `[ ]` pendente

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

### [ ] PUBLIC-01 - Refinar pagina publica do local para conversao premium

Status: `[ ]` pendente

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

### [ ] FORMS-01 - Reduzir formularios inline em rotinas recorrentes

Status: `[ ]` pendente

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

### [!] DATA-01 - Alguns refinamentos dependem de dados reais variados

Status: `[!]` bloqueado parcial

Problema:

- varias telas precisam ser vistas com dados cheios, vazios, erro, pendencia e mobile real para calibrar densidade.

Como desbloquear:

- criar seed/demo operacional;
- testar viewport 390px e desktop;
- capturar screenshots antes/depois.

Impacto:

- sem dados variados, risco de otimizar apenas o estado vazio.
