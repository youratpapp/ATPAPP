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
- `ACADEMY_V2_UX_PLAN.md`
- `OPERATIONAL_MODULE_REDESIGN_PLAYBOOK.md`

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

1. Academia v2 dentro de Gestao.
2. Gestao.
3. Sidebar e navegacao contextual.
4. Competition OS.
5. Mobile UX.
6. Hierarchy visual.
7. Typography.
8. Operational rows.
9. Reducao de dashboard feeling.
10. Reducao de admin-template feeling.
11. Paginas publicas com percepcao premium.

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

## Regra permanente de perfil, plano e permissao

Toda mudanca de UI deve responder antes de implementar:

- qual tipo de usuario ve esta acao;
- qual plano habilita esta acao;
- qual permissao operacional permite executar;
- se a acao pertence a Player App, Management OS ou Competition OS;
- se existe risco de mostrar ferramenta profissional para jogador comum.

Regra:

```text
Nenhuma acao nova deve aparecer so porque o componente existe. Ela deve aparecer porque o perfil, plano e contexto tornam aquela tarefa obvia e executavel.
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
- `/locais` ja separa descoberta por intencao: encontrar jogadores, reservar quadra e entrar em aula; cards usam acao primaria contextual e secundarias em `Mais`.
- `/locais` ja iniciou filtros inteligentes por intencao: quadra filtra por cidade/data/hora/duracao e disponibilidade real, aulas filtram por cidade/dia/periodo/nivel/vagas, e jogadores filtram chamadas por cidade/data/periodo/nivel.
- `/locais` ja devolve quadras livres como resultado direto da busca de reserva, evitando abrir uma ficha completa de academia com planos/aulas quando a intencao e apenas reservar horario.
- `/locais` ja devolve turmas com vaga como resultado direto da busca de aula, evitando abrir uma ficha completa de academia quando a intencao e entrar em uma turma.
- Niveis de aula ja possuem taxonomia padrao: `Iniciante`, `Intermediario`, `Avancado`, `Primeira Classe` e `Profissional`.
- Pagina publica do local ja iniciou escolha visual: reserva mostra agenda do dia por horario/quadra livre, e aulas mostram turmas compativeis por perfil antes do formulario.
- Criacao profissional de local ja exige entitlement no backend (`app_user_product_entitlements`, `app_user_can_create_place()` e `app_create_place(...)`); Free Player nao deve ver nem conseguir inserir local direto.
- Agenda do local ja iniciou visao operacional unificada: `Central de agenda` renderiza a subvisao ativa sem duplicar listas abaixo, e o calendario combina reservas, bloqueios, turmas fixas, aulas avulsas/reposicoes e faltas avisadas.
- Calendario de quadras ja possui filtros por tipo, quadra, professor, turma e aluno/jogador, com slots clicaveis de 30 minutos e detalhe de participantes.
- Criacao de reserva no admin e na pagina publica passou a usar data, horario e duracao em opcoes guiadas, evitando horarios quebrados e deixando a disponibilidade explicita antes da reserva.
- Regras de reserva passaram a usar selecao visual de dias da semana, horarios em lista e duracoes padronizadas, evitando entrada numerica crua como `1,2,3,4,5`.
- `/locais` agora e camada publica/player mesmo quando o usuario administra o local: o cockpit completo so renderiza em `/gestao/:placeId/:module`.
- Cards de `Meus locais` em `/locais` priorizam a pagina publica; `Abrir gestao` existe como acao secundaria/discreta para manter descoberta separada de operacao.
- `/inicio` agora separa prioridades de jogador e prioridades profissionais: pendencias de reserva/aula/partida do jogador alimentam a Home e notificacoes, enquanto tarefas de academia/organizador aparecem em bloco `Area profissional`.
- Acoes operacionais da Home direcionam para destinos canonicos de gestao (`/gestao/:placeId/:module?visao=...`) em vez de voltar para `/locais`.
- `/eventos` agora trata `Organizando agora` como fila operacional: torneios e ligas mostram tipo, status, proximo passo e CTA primario por item.
- Competition OS no hub ja direciona organizador para destino semantico por status: setup, inscricoes, preparacao de jogos, operacao ao vivo, rodada da liga ou historico.
- `/eventos/ligas/:leagueId` ja abre a experiencia do organizador com painel de foco operacional antes das tabs, mostrando proxima acao, escopo ativo, pendencias e CTA `Resolver agora`.
- `CompetitionOperationalQueue` ja suporta `actionLabel`, entao filas internas deixam claro se a tarefa e `Resolver`, `Agendar`, `Confirmar`, `Intervir` ou apenas `Ver`.
- `TournamentPage` ja usa chamadas explicitas `Resolver`/`Ver` na fila operacional sem mudar regras sensiveis de placar, confirmacao ou resultado.
- `Academia v2` foi planejada em `ACADEMY_V2_UX_PLAN.md`: `Hoje`, `Grade`, `Alunos`, `Pendencias`, `Professores` e `Configuracao` passam a ser a estrutura alvo do modulo, preservando funcoes e reposicionando rotina diaria em rows/drawers.
- `OPERATIONAL_MODULE_REDESIGN_PLAYBOOK.md` foi criado para repetir o mesmo processo de auditoria, plano v2, queue, implementacao e validacao area por area.
- Primeiro corte de `Academia v2` foi aplicado: tabs renomeadas para `Grade` e `Configuracao`, aliases antigos preservados, bloco legado `Academia e aulas` desligado dentro do workspace de Gestao, recursos movidos para `Configuracao` e busca de encaixe recolhida em `Pendencias`.
- `Academia v2 - Grade` ja possui busca/filtros, contador sem limite silencioso, row operacional e `ClassDrawer` para editar turma, salvar mensalidade, ver/matricular alunos e consultar historico curto.
- Suporte backend minimo para edicao real da turma foi criado em `updatePlaceAcademyClass(...)`, evitando acao falsa de frontend.

### Ainda fraco

- `PlacesPage` ainda concentra muita orquestracao e ainda influencia a sensacao de admin template.
- Admin de local ainda precisa evoluir nos modulos internos, mas o shell ja reduziu cockpit de cards.
- Academia ainda precisa completar a v2 operacional: transformar Alunos/Hoje/Professores em drawers, transformar encaixe em drawer/sheet real, migrar criacao de turma para drawer curto e revisar Configuracao com data/dia explicitos.
- Sidebar/global navigation ja iniciou diferenciacao por contexto, mas ainda pode evoluir com permissoes reais e atalhos contextuais.
- Sistema ja iniciou visibilidade por perfil/plano na navegacao global e guardrail real para criar local, mas ainda precisa aplicar permissoes reais em mais hubs internos.
- Gestao ja iniciou onboarding guiado para academia/clube, Competition OS ja iniciou onboarding de organizador e professor `coach` ja tem entrada leve; entradas internas agora tambem mudam prioridade por papel, mas ainda falta calibrar fluxos internos especificos por massa real.
- Acoes de setup de local ja comecaram a ficar semanticamente descobriveis; criacao de torneio/liga ja fica concentrada no contexto de organizacao do Competition OS.
- Competition OS ja esta mais consistente visualmente; hub, torneio, tela interna da liga, lista de partidas da liga e sala da liga ja usam mais hierarchy operacional.
- Mobile ainda pode parecer desktop empilhado em varias telas, mas filtros de liga ja usam sheet responsivo como primeiro padrao.
- Home do jogador ja reforca proxima acao na primeira viewport, mas ainda pode evoluir feed, estados vazios e detalhe mobile.
- Paginas publicas ja ganharam primeira rodada de conversao premium, mas ainda podem evoluir imagem, prova social e fluxo de pagamento.
- Typography e spacing ja melhoraram nas telas prioritarias, mas ainda precisam segunda onda em telas antigas e formularios.
- Muitos formularios ainda aparecem inline, mas Agenda, CRM e Cantina ja abriram a primeira onda de composer progressivo.
- Algumas telas ainda exibem KPIs antes de tarefas.
- Cobrancas recorrentes ja ganharam primeira camada task-first em Financeiro e Clientes/CRM, com `Enviar lembrete`, `Cobrar socios` e `Cobrar alunos` a partir de pendencia real.
- Auditoria de destino semantico foi iniciada em `SEMANTIC_FLOW_AUDIT.md`: quick action so conta como pronta quando abre a subvisao onde a tarefa pode ser concluida.

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
11. Funcoes importantes ainda podem ficar escondidas por modulo tecnico em vez de aparecer por intencao em rotinas recorrentes alem de cobranca/setup.
12. Onboarding por perfil ainda precisa conduzir melhor academia, professor solo e organizador no primeiro uso.
13. `PlacesPage` ainda precisa ser desmontada tecnicamente em pagina publica + admin shell real, apesar de o vazamento visual para `/locais` estar bloqueado.

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
- Quick action que abre modulo certo mas subvisao errada.
- Agenda que duplica `Hoje`, `Reservas`, `Espera` ou `Calendario` em dois blocos proximos.
- Formulario de horario recorrente com entrada livre que induz 08:20, 09:35 ou dias numericos sem semantica.
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

1. Executar `Academia v2` conforme `ACADEMY_V2_UX_PLAN.md`.
2. Expandir quick actions semanticas para outras rotinas recorrentes alem de cobranca.
3. Reorganizar/refinar rotinas internas por operador conforme massa real de uso.
4. Expandir rows operacionais para os fluxos internos que ainda usam lista/card alto.
5. Reduzir dashboards informativos remanescentes.
6. Aplicar mobile sheets e sticky actions onde ainda houver detalhe pesado no corpo da tela.

Bloco executado em 2026-05-13:

- `COMP-03`: `Minhas partidas` no torneio virou row operacional, com confirmar presenca como acao primaria e resultado em disclosure progressivo.
- `COMP-04`: partidas de grupos/mata-mata do torneio passaram a usar estrutura row-like e controles de placar em disclosure.
- `COMP-05`: lista de partidas da liga e `Minhas partidas` da liga passaram a usar rows compactas com estado operacional e acao clara para abrir sala.
- `MOBILE-02`: sala aberta da liga passou a priorizar estado, disponibilidade e resultado; participantes/chat viraram disclosures.
- `ACADEMY-02`: alunos da Academia passaram a usar `EntityActionRow`, com check-in/ativar/marcar pago como acao primaria contextual e acoes secundarias em disclosure.
- `BILLING-02`: Financeiro e Clientes/CRM passaram a expor cobranca por intencao (`Enviar lembrete`, `Cobrar socios`, `Cobrar alunos`) somente quando ha pendencia real.
- `PROFILE-02`: Gestao passou a ajustar CTA e atalhos por papel do local; professor ve `Abrir aulas`/`Alunos`, recepcao ve `Abrir agenda`/`Aulas`, gestor mantem operacao completa.
- `PROFILE-02`: Eventos deixou de exibir roteiro grande de organizador para jogador comum; organizacao segue como opcao contextual em `Descobrir`.
- Correção de fluxo: `Cadastrar professor` agora leva a `Academia > Professores` com formulario de cadastro, `Criar turma` leva a `Academia > Turmas` com wizard de criacao, `Publicar pagina` leva a `Ajustes > Estrutura` com formulario editavel, e `Recursos` deixou de misturar dados/comissao/login de professores.
- Proximo foco: `ROUTINE-02`, expandindo quick actions semanticas para reservas, aulas, atendimento e venda sem criar painel permanente.
- Cuidado permanente: preservar os fluxos de confirmar presenca, desfazer confirmacao e lancar/conferir resultado.

Bloco visual executado em 2026-05-13:

- `VISUAL-02`: sidebar em contexto de Gestao ganhou tratamento de workspace, com superficie mais quieta, contexto escuro/verde, estado ativo mais claro e menos aparencia de template generico.
- `VISUAL-02`: Home deixou de abrir com hero operacional pesado; a primeira viewport agora deve se comportar como painel task-first compacto, com proxima acao e agenda tendo mais peso que KPIs.
- `VISUAL-02`: Gestao reduziu sensacao de dashboard por cards; header, command panel, fila, rows de local e onboarding ficaram mais densos, com menos sombra e menos caixas.
- `VISUAL-02`: `PlaceAdminShell` passou a limitar abas primarias a 5 e mover o restante para overflow `Mais`, preservando modulos sem poluir mobile.
- `VISUAL-02`: bottom navigation mobile virou trilho horizontal compacto, reduzindo grid fixo comprimido e melhorando toque em 360-430px.
- Verificacao: lint e build passaram; screenshots foram tentados em 390px, 430px e 1366px, mas o ambiente local exibiu somente `Configuracao necessaria` por falta de env/Supabase.
- Proximo foco visual: calibrar as mesmas telas com seed/sessao real e aplicar o mesmo ritmo em Competition OS e pagina publica.

Bloco de discoverability executado em 2026-05-13:

- `VISUAL-03` ficou bloqueado para screenshots reais porque o ambiente local nao tem `.env`/Supabase; a queue agora registra esse bloqueio explicitamente.
- `VISUAL-03` foi desbloqueado em 2026-05-14 com Playwright temporario fora do repo e variaveis de ambiente de sessao, sem criar `.env` nem adicionar dependencia ao projeto.
- Screenshots autenticados com dados reais foram gerados em `web/docs/screenshots/visual-03-2026-05-14/`, `web/docs/screenshots/visual-03-2026-05-14-local-current/` e `web/docs/screenshots/visual-03-2026-05-14-local-final/`.
- A validacao real mostrou que Home ainda misturava comunicados de organizador na fila principal do Player App; `HomePage` agora separa `playerNotices` e `operationalNotices`.
- A Home tambem passou a limitar listas secundarias abaixo da central do jogador, reduzindo scroll e repeticao sem remover acesso pelo painel de notificacoes.
- Em 2026-05-14, a varredura passou a usar perfis diferentes do seed: Admin/PRO (`escalao@gmail.com`), Player puro (`jogador001@demo.atp.local`) e Professor (`prof.renato@demo.atp.local`).
- A varredura por papel gerou screenshots/textos em `web/docs/screenshots/page-sweep-2026-05-14-roles/` e criou `PAGE_SWEEP_UX_AUDIT_2026_05_14.md`.
- `HomePage` tambem deixou reservas confirmadas e espera passiva fora da fila de pendencia; compromisso confirmado e informacao passiva pertencem a Agenda/feed.
- `PlacesPage` confirmou resultado direto por quadra ao buscar cidade/data/hora e agora exibe CTA explicito de solicitacao no card de quadra.
- `PlacesPage` corrigiu falso vazio de `Entrar em aula`: quando a RPC otimizada retorna zero, o fallback local tambem tenta turmas ativas compativeis.
- `PlacesPage` passou a abrir `/locais` em estado neutro de escolha de intencao, evitando assumir reserva de quadra como fluxo padrao e reduzindo confusao entre procurar jogador, reservar quadra e entrar em aula.
- `Reservar quadra` e `Entrar em aula` em `/locais` nao devem listar academias genericas antes da busca. A primeira resposta publica desses fluxos deve ser quadra livre ou turma com vaga.
- `/gestao/:placeId/:module` nao deve renderizar cabecalho/listagem publica de `Locais`. A primeira dobra da gestao local pertence ao workspace operacional; pagina publica fica apenas como acao secundaria.
- Gestao local nao deve esconder modulos em `Mais` quando existe espaco. A navegacao principal do local usa barra horizontal adaptativa/rolavel, e o plano `academy` tambem tem `Agenda` porque aula, turma e quadra dependem de agenda operacional.
- `BottomNav` deixou de mostrar `Management OS` para Player puro que acessa `/gestao` diretamente sem permissao.
- `ManagementHubPage` passou a diferenciar Player sem permissao de operador sem local; acesso direto a `/gestao` por jogador puro volta para Inicio/Locais publicos em vez de sugerir setup profissional.
- Restam riscos de API/dados detectados por screenshots, especialmente `500` em `place_academy_enrollments` e `app_payments`.
- `ROUTINE-02`: rows de local em Gestao passaram a sugerir acoes rapidas por intencao quando a base ja esta pronta.
- Agenda pode sugerir `Confirmar reservas`, `Chamar espera`, `Ver agenda` e `Criar reserva`, sempre abrindo a subvisao executavel.
- Academia pode sugerir `Resolver aulas` e `Fazer chamada` quando ha pendencias/aulas do dia.
- Academia v2 avancou para `Alunos`: busca/filtros fortes, `StudentDrawer`, edicao real de matricula, financeiro/presenca/evolucao/reposicoes no contexto do aluno e sem lista limitada silenciosamente.
- Academia v2 avancou para `Pendencias`: fila unica filtravel, WhatsApp secundario, CTA operacional por tipo e `FitDrawer` para busca de encaixe.
- Academia v2 avancou para `Hoje`: aulas do dia em rows e `LessonDrawer` para chamada rapida com presenca, falta, ausencia avisada e observacao curta.
- Academia v2 avancou para `Professores`: busca/filtros, `CoachDrawer`, edicao real de dados/status/comissao e login/turmas/agenda no contexto do professor.
- Clientes, Financeiro e Cantina ganharam atalhos contextuais para `Fazer follow-up`, `Cobrar pendentes`, `Repor estoque` e `Registrar venda`.
- Regra reforcada: quick action que nao abre a subvisao onde a tarefa termina nao esta pronta.
- Proximo foco executavel: `COMP-VISUAL-01`, refinando Competition OS sem mexer nos fluxos sensiveis de confirmacao/resultado.

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
