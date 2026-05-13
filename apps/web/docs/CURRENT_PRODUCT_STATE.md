# Current Product State

Fonte principal:

- `product-architecture-ux-audit.md`
- `FRONTEND_UX_REARCHITECTURE.md`
- `PREMIUM_UX_VISUAL_LANGUAGE.md`
- `VISUAL_REFERENCE_SYSTEM.md`
- `COMPONENT_GRAMMAR.md`
- `DESIGN_TOKENS.md`
- `SCREEN_RESPONSIBILITIES.md`
- `REFACTOR_ROADMAP.md`

Data: 2026-05-13

## Para que este arquivo existe

Este arquivo e a memoria curta do produto. Ele deve permitir que futuras tarefas comecem direto na execucao, sem reabrir toda a arquitetura conceitual.

Regra:

```text
Nao reanalisar a arquitetura do zero. Executar a fila com consistencia.
```

## Visao atual do produto

O produto e um sistema operacional esportivo para tenis, padel e esportes de raquete, com tres experiencias principais:

1. Player App: jogador encontra jogos, reservas, competicoes, ranking, perfil e proximas acoes.
2. Management OS: academia/clube opera agenda, alunos, reservas, clientes, financeiro, cantina, equipe e configuracao.
3. Competition OS: organizador opera torneios/ligas; jogador acompanha partidas, resultados e ranking.

Existe ainda uma camada publica:

- paginas publicas de locais;
- inscricao publica de torneios;
- descoberta de locais/competicoes.

## Arquitetura consolidada

Rotas e responsabilidades principais:

- `/inicio`: central do jogador, proxima acao e compromissos.
- `/gestao`: entrada operacional para donos/equipe de academias e clubes.
- `/gestao/:placeId/:module`: workspace de operacao de um local.
- `/locais`: descoberta publica e criacao inicial de local.
- `/locais/:placeId`: pagina publica do local.
- `/eventos`: hub de competicoes.
- `/eventos/:tournamentId/:tab`: torneio em Competition OS.
- `/eventos/ligas/:leagueId`: liga em Competition OS.
- `/ranking`: leitura competitiva.
- `/perfil`: identidade, preferencias e historico.

Decisao consolidada:

```text
Gestao nao e uma variacao de Locais. Gestao e um sistema proprio.
```

## Prioridades atuais

Ordem de foco:

1. Gestao.
2. Sidebar e navegacao contextual.
3. Competition OS.
4. Mobile UX.
5. Hierarchy visual.
6. Typography.
7. Operational rows.
8. Reducao de dashboard feeling.
9. Reducao de admin-template feeling.
10. Paginas publicas com percepcao premium.

## Visual language consolidada

O produto deve parecer:

- SaaS esportivo premium;
- workspace operacional moderno;
- mobile-first;
- limpo, mas nao vazio;
- denso, mas nao poluido;
- esportivo, mas nao decorativo;
- confiavel, rapido e vendavel.

Regras permanentes:

- menos cards;
- menos boxes;
- menos mosaicos;
- menos ruido;
- mais rows;
- mais hierarchy;
- mais task-first UX;
- mais fluidez;
- mais conforto mobile;
- mais clareza operacional.

## Component grammar consolidada

Padrao de componentes:

- `OperationalQueue`: pendencias com status, contexto e acao primaria.
- `EntityActionRow`: entidade + status + metadados + acao primaria.
- `MetricStrip`: suporte, nao protagonista.
- `ContextHeader`: contexto compacto, nao hero operacional.
- `EmptyState`: estado calmo, setup ou busca, sempre com proxima acao.
- `Drawer`: detalhe e edicao curta no desktop.
- `BottomSheet`: escolha, filtro e detalhe curto no mobile.
- `QuickActions`: tarefa frequente, nao menu generico.
- `Table`: desktop para volume; mobile vira rows.
- `Filters`: frequentes visiveis, raros em drawer/sheet.

Regra:

```text
Card e excecao em operacao diaria. Row e padrao.
```

## Estado atual real

### Ja consolidado

- MDs arquiteturais e visuais existem e devem ser mantidos vivos.
- `/gestao` existe como entrada propria de Management OS.
- Rotas canonicas de admin de local usam `/gestao/:placeId/:module`.
- `ManagementShell` envolve gestao.
- `PlaceAdminShell` iniciou separacao do cockpit administrativo do local.
- `PlaceAdminShell` ja foi refinado para workspace compacto: modulo ativo em destaque, setup secundario e fila antes de metricas.
- Navegacao desktop ja agrupa entradas globais em Jogar, Operar e Conta, com contexto visual para Management OS.
- Muitos modulos de locais foram extraidos de `PlacesPage`.
- Competition OS iniciou padroes comuns com selector, fila, publishing e header.
- Competition OS ja recebeu base visual compartilhada: header compacto, escopo antes de numeros, fila em rows e publicacao secundaria.
- Visual language premium foi documentada.
- `VISUAL_REFERENCE_SYSTEM.md`, `COMPONENT_GRAMMAR.md` e `DESIGN_TOKENS.md` foram criados.
- `/gestao` ja foi refinada para ocultar cards zerados e usar rows operacionais de local.
- `/gestao` ja recebeu refinamento mobile-first para header compacto, stats em trilho e atalhos de modulos sem empilhamento longo.

### Ainda fraco

- `PlacesPage` ainda concentra muita orquestracao e ainda influencia a sensacao de admin template.
- Admin de local ainda precisa evoluir nos modulos internos, mas o shell ja reduziu cockpit de cards.
- Sidebar/global navigation ja iniciou diferenciacao por contexto, mas ainda pode evoluir com permissoes reais e atalhos contextuais.
- Competition OS ja esta mais consistente visualmente, mas ainda precisa refinamento profundo de fluxos internos de torneio/liga.
- Mobile ainda pode parecer desktop empilhado em varias telas.
- Home do jogador ainda precisa reforcar proxima acao e reduzir ruido.
- Paginas publicas ainda precisam mais percepcao premium e conversao clara.
- Typography e spacing ainda variam demais entre telas antigas.
- Muitos formularios ainda aparecem inline.
- Algumas telas ainda exibem KPIs antes de tarefas.

## Problemas atuais a atacar

1. Excesso de card/box em telas operacionais.
2. Acoes secundarias competindo com a acao primaria.
3. Mobile com pilhas longas de blocos.
4. Sidebar/global nav ainda precisa evoluir permissoes, atalhos contextuais e estados por papel.
5. Competition OS ainda precisa evoluir fluxos internos e estados mobile de detalhes/filtros.
6. Place admin ainda com resquicios de cockpit antigo.
7. Public pages ainda pouco memoraveis.
8. Tabelas/listas ainda sem gramatica mobile uniforme.
9. Filtros e detalhes ainda ocupando corpo principal demais.
10. Estados vazios e setup nem sempre guiam a proxima acao.

## Objetivos UX atuais

- Abrir cada tela com a proxima acao mais importante.
- Fazer o usuario entender onde esta em 3 segundos.
- Reduzir scroll e varredura visual.
- Tornar mobile confortavel, com toque claro e poucas escolhas por tela.
- Criar sensacao de workspace premium na gestao.
- Criar sensacao de app esportivo moderno no player/publico.
- Tornar competicoes mais consistentes para jogador e organizador.
- Deixar visualmente claro o que e rotina, configuracao, publicacao e relatorio.

## Anti-patterns proibidos

- Recriar dashboard generico com muitos cards.
- Mostrar KPI zerado como bloco nobre.
- Hero grande em area operacional.
- Card dentro de card.
- Mais de uma acao primaria no mesmo bloco.
- Publicacao disputando com rotina diaria.
- Configuracao antes da fila operacional.
- Mobile como desktop empilhado.
- Menu mostrando ferramenta sem permissao/plano.
- Tabela larga sem alternativa mobile.
- Modal central enorme para tarefa recorrente.
- Criar componente novo sem ganho perceptivel de UX.
- Modularizar por modularizar.

## Direcao premium

Premium aqui significa:

- menos ruido;
- hierarchy obvia;
- densidade inteligente;
- estados calmos quando nao ha problema;
- tarefas reais em primeiro plano;
- superfices discretas;
- alinhamento forte;
- texto curto;
- feedback claro;
- rows acionaveis;
- mobile com bottom sheets e sticky actions quando fizer sentido.

Nao significa:

- gradiente em tudo;
- sombras pesadas;
- hero grande;
- ilustracao decorativa;
- UI vazia;
- esconder funcionalidade importante.

## Criterios de evolucao

Antes de mexer em qualquer tela:

1. Identificar a acao primaria.
2. Verificar se a tela e rotina, configuracao, publicacao ou relatorio.
3. Remover cards/boxes que nao representam entidade, tarefa ou contexto.
4. Converter listas operacionais em rows.
5. Tratar zeros como estado calmo.
6. Levar detalhes para drawer ou bottom sheet.
7. Garantir comportamento mobile antes de considerar concluido.
8. Atualizar `EXECUTION_QUEUE.md` e o MD vivo relevante.

## Prioridades de frontend

1. Refinar `ManagementShell` e `/gestao`.
2. Padronizar bottom sheets e detalhes mobile.
3. Refinar os modulos internos de `/gestao/:placeId/:module` com rows e acoes primarias.
4. Melhorar navegacao/sidebar por permissoes e atalhos contextuais.
5. Padronizar rows operacionais.
6. Reduzir dashboards informativos.
7. Aplicar mobile sheets e sticky actions.
8. Revisar typography/spacing global.
9. Refinar paginas publicas.

## Prioridades mobile

- Menos secoes por tela.
- Rows compactas.
- CTA principal visivel.
- Bottom sheet para filtros, modulo e detalhe.
- Sticky action para tarefa principal.
- Evitar grids que viram listas enormes.
- Evitar tabelas horizontais sem alternativa.
- Reduzir blocos de metadados.
- Texto curto e truncado com criterio.

## O que nao reabrir mais

Nao reabrir como debate principal:

- separacao entre Player App, Management OS e Competition OS;
- `/gestao` como entrada operacional;
- `/locais` como camada publica/descoberta;
- rows como padrao operacional;
- cards como excecao em rotina;
- task-first UX como criterio central;
- mobile-first como obrigatorio;
- documents-as-memory como processo;
- execucao incremental em vez de nova grande reestrutura.

## Como usar este arquivo em futuras tarefas

Quando a tarefa for curta, seguir:

1. Ler `CURRENT_PRODUCT_STATE.md`.
2. Ler `EXECUTION_QUEUE.md`.
3. Executar o primeiro item marcado com `[>]`.
4. Atualizar status/log no fim.
