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
- `PROFILE_PLAN_ACCESS_MODEL.md`
- `TASK_DISCOVERY_ONBOARDING.md`

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

A proxima evolucao consolidada e tornar essas experiencias visiveis por perfil, plano e intencao:

- jogador comum entra apenas no Player App;
- organizador entra em Competition Management;
- professor autonomo entra em uma gestao leve de aulas/alunos;
- academia/clube entra no Management OS completo conforme plano/permissao.

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
- `SemanticQuickAction`: atalho nomeado pela intencao do usuario, como Cadastrar quadra, Cadastrar professor ou Criar torneio.
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
- Mobile ja iniciou padrao concreto de bottom sheet com `ResponsiveFilterSheet` aplicado nos filtros de temporada/classe da liga.
- `EntityActionRow` ja saiu da documentacao e entrou em uso real em CRM e recebiveis financeiros do local.
- `/inicio` ja iniciou transicao para Player App orientado por proxima acao, com painel do dia e rows de pendencia/agenda/clube antes de conteudo secundario.
- Hierarquia de CTAs iniciou padrao real: `primary` para acao principal, `secondary` para acao alternativa com borda e `quiet` para suporte/atalhos.
- Tipografia principal ja iniciou padrao por tokens fixos, sem `font-size` fluido por viewport nas areas auditadas.
- Pagina publica do local ja iniciou conversao premium: oferta no hero, reserva como CTA principal, divulgacao no fim e CTA sticky mobile.
- Criacao de reserva na Agenda ja iniciou formulario progressivo: campos essenciais no composer principal e observacao/repeticao/bloqueio/lista de espera em `Opcoes avancadas`.
- CRM e Cantina ja iniciaram formularios progressivos: lista/fila e venda rapida aparecem antes de cadastro auxiliar.
- Turmas da Academia ja iniciaram padrao de rows operacionais com ocupacao, horario, pendencias e mensalidade em leitura compacta.
- Estados de demo/QA foram documentados em `DEMO_STATE_QA_CHECKLIST.md` para evitar calibragem visual apenas em telas vazias.
- Modelo de perfis/planos foi consolidado em `PROFILE_PLAN_ACCESS_MODEL.md`.
- Discoverability e onboarding operacional foram consolidados em `TASK_DISCOVERY_ONBOARDING.md`.
- Navegacao global ja iniciou visibilidade por acesso: `Gestao` depende de local acessivel, `Organizar` depende de competicao organizada e `Locais` voltou para descoberta/player.
- Setup da Gestao ja iniciou quick actions semanticas: `Cadastrar quadra`, `Cadastrar professor`, `Criar turma`, `Definir regras de reserva` e `Configurar plano` aparecem quando faltam.
- Hub de competicoes ja separa `Jogando`, `Organizando` e `Descobrir`, priorizando fila operacional quando o usuario organiza e evitando CTA administrativo como prioridade para jogador comum.
- `/gestao` ja possui checklist de implantacao para academia/clube, com progresso, etapas concluidas e proximo passo acionavel; ele aparece apenas enquanto a base esta incompleta.
- `/eventos` ja possui roteiro secundario para organizador novo, levando para criar torneio/liga e explicando classes, inscricoes, publicacao e operacao sem virar CTA principal para jogador comum.
- `/gestao` ja possui entrada leve de professor para papel `coach`, priorizando aulas de hoje, turmas e alunos sem expor modulos empresariais.
- `Minhas partidas` do torneio ja iniciou gramatica de row operacional: status/contexto e acao primaria ficam separados, e envio de resultado abre em disclosure progressivo.
- Partidas de grupos e mata-mata do torneio ja iniciaram estrutura row-like, com placar/WO/limpeza em disclosure progressivo.
- Lista de partidas da liga ja iniciou estrutura row operacional, alinhando `Minhas partidas` e partidas por rodada ao padrao do torneio.
- Sala de partida da liga ja separa estado/disponibilidade/resultado de participantes/chat, usando disclosures para areas secundarias.
- Lista de alunos da Academia ja usa `EntityActionRow`, com uma acao primaria por aluno e acoes secundarias em disclosure.
- Visual language premium foi documentada.
- `VISUAL_REFERENCE_SYSTEM.md`, `COMPONENT_GRAMMAR.md` e `DESIGN_TOKENS.md` foram criados.
- `/gestao` ja foi refinada para ocultar cards zerados e usar rows operacionais de local.
- `/gestao` ja recebeu refinamento mobile-first para header compacto, stats em trilho e atalhos de modulos sem empilhamento longo.

### Ainda fraco

- `PlacesPage` ainda concentra muita orquestracao e ainda influencia a sensacao de admin template.
- Admin de local ainda precisa evoluir nos modulos internos, mas o shell ja reduziu cockpit de cards.
- Sidebar/global navigation ja iniciou diferenciacao por contexto, mas ainda pode evoluir com permissoes reais e atalhos contextuais.
- Sistema ja iniciou visibilidade por perfil/plano na navegacao global, mas ainda precisa aplicar isso nos hubs internos e entradas de setup.
- Gestao ja iniciou onboarding guiado para academia/clube, Competition OS ja iniciou onboarding de organizador e professor `coach` ja tem entrada leve; ainda falta calibrar fluxos internos especificos por massa real.
- Acoes de setup de local ja comecaram a ficar semanticamente descobriveis; criacao de torneio/liga ja fica concentrada no contexto de organizacao do Competition OS.
- Competition OS ja esta mais consistente visualmente; torneio, lista de partidas da liga e sala da liga ja usam mais hierarchy operacional.
- Mobile ainda pode parecer desktop empilhado em varias telas, mas filtros de liga ja usam sheet responsivo como primeiro padrao.
- Home do jogador ja reforca proxima acao na primeira viewport, mas ainda pode evoluir feed, estados vazios e detalhe mobile.
- Paginas publicas ja ganharam primeira rodada de conversao premium, mas ainda podem evoluir imagem, prova social e fluxo de pagamento.
- Typography e spacing ja melhoraram nas telas prioritarias, mas ainda precisam segunda onda em telas antigas e formularios.
- Muitos formularios ainda aparecem inline, mas Agenda, CRM e Cantina ja abriram a primeira onda de composer progressivo.
- Algumas telas ainda exibem KPIs antes de tarefas.
- Cobrancas recorrentes ja ganharam primeira camada task-first em Financeiro e Clientes/CRM, com `Enviar lembrete`, `Cobrar socios` e `Cobrar alunos` a partir de pendencia real.

## Problemas atuais a atacar

1. Excesso de card/box em telas operacionais.
2. Acoes secundarias competindo com a acao primaria.
3. Mobile com pilhas longas de blocos.
4. Sidebar/global nav ainda precisa evoluir permissoes, atalhos contextuais e estados por papel.
5. Competition OS ainda precisa evoluir fluxos internos e estados mobile de detalhes/filtros.
6. Place admin ainda com resquicios de cockpit antigo.
7. Public pages ainda pouco memoraveis.
8. Tabelas/listas ainda precisam expandir a gramatica mobile uniforme para mais dominios.
9. Filtros e detalhes ainda ocupando corpo principal demais.
10. Estados vazios e setup nem sempre guiam a proxima acao.
11. Funcoes importantes ainda podem ficar escondidas por modulo tecnico em vez de aparecer por intencao, especialmente nas entradas internas por perfil.
12. Onboarding por perfil ainda precisa conduzir melhor academia, professor solo e organizador no primeiro uso.

## Objetivos UX atuais

- Abrir cada tela com a proxima acao mais importante.
- Fazer o usuario entender onde esta em 3 segundos.
- Reduzir scroll e varredura visual.
- Tornar mobile confortavel, com toque claro e poucas escolhas por tela.
- Criar sensacao de workspace premium na gestao.
- Criar sensacao de app esportivo moderno no player/publico.
- Tornar competicoes mais consistentes para jogador e organizador.
- Deixar visualmente claro o que e rotina, configuracao, publicacao e relatorio.
- Mostrar somente o que faz sentido para o perfil, plano e permissao.
- Nomear tarefas do jeito que o usuario pensa: cadastrar quadra, cadastrar professor, criar torneio, cobrar aluno.

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
- Gestao visivel para jogador comum sem papel operacional.
- Torneios que jogo e torneios que organizo misturados sem contexto.
- Funcao essencial escondida apenas em "Recursos" ou "Ajustes".
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

1. Reorganizar entradas internas de `/gestao` por tipo de operador sem reabrir a arquitetura de perfis.
2. Expandir quick actions semanticas para outras rotinas recorrentes alem de cobranca.
3. Expandir rows operacionais para os fluxos internos que ainda usam lista/card alto.
4. Reduzir dashboards informativos remanescentes.
5. Aplicar mobile sheets e sticky actions onde ainda houver detalhe pesado no corpo da tela.

Bloco executado em 2026-05-13:

- `COMP-03`: `Minhas partidas` no torneio virou row operacional, com confirmar presenca como acao primaria e resultado em disclosure progressivo.
- `COMP-04`: partidas de grupos/mata-mata do torneio passaram a usar estrutura row-like e controles de placar em disclosure.
- `COMP-05`: lista de partidas da liga e `Minhas partidas` da liga passaram a usar rows compactas com estado operacional e acao clara para abrir sala.
- `MOBILE-02`: sala aberta da liga passou a priorizar estado, disponibilidade e resultado; participantes/chat viraram disclosures.
- `ACADEMY-02`: alunos da Academia passaram a usar `EntityActionRow`, com check-in/ativar/marcar pago como acao primaria contextual e acoes secundarias em disclosure.
- `BILLING-02`: Financeiro e Clientes/CRM passaram a expor cobranca por intencao (`Enviar lembrete`, `Cobrar socios`, `Cobrar alunos`) somente quando ha pendencia real.
- Proximo foco: `PROFILE-02`, refinando entradas internas de Gestao por operador sem esconder acesso existente.
- Cuidado permanente: preservar os fluxos de confirmar presenca, desfazer confirmacao e lancar/conferir resultado.

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
