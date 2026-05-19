# ATP Premium Dark - Queue Global Frontend

Data: 2026-05-19

Fonte primaria de decisoes:

- `m:/Downloads/Chrome/atp_premium_dark_design_playbook.md`

Fontes visuais de inspiracao:

- `WhatsApp Image 2026-05-19 at 08.48.11.jpeg`
- `WhatsApp Image 2026-05-19 at 08.48.11 (1).jpeg`
- `WhatsApp Image 2026-05-19 at 08.48.11 (2).jpeg`
- `WhatsApp Image 2026-05-19 at 08.48.11 (3).jpeg`

Objetivo:

- aplicar o DNA premium dark sports app em todas as areas do ATP;
- preservar as funcoes existentes e reaproveitar fluxos, dados, rotas e componentes sempre que possivel;
- mexer em backend somente se uma tela nao conseguir cumprir o fluxo usando os dados ja existentes;
- executar uma rodada global capaz de resolver pelo menos 90% da percepcao visual/UX das entregas.

Principio central:

- o ATP deve parecer um app esportivo premium, nao um sistema de cadastro;
- mobile deve ser dark por padrao;
- desktop deve usar sidebar escura, fundo deep navy, cards glass e grids operacionais;
- Jogador e Trabalho devem parecer contextos distintos.

## Escopo de rotas contempladas

- Login e callback: `/auth`, `/auth/callback`
- Cadastro obrigatorio: `/completar-cadastro`
- Home jogador: `/inicio`
- Competicoes: `/eventos`, `/eventos/torneios`, `/eventos/ligas`
- Liga: `/eventos/ligas/:leagueId`, `/eventos/ligas/inscricao/:token`
- Torneio: `/eventos/:tournamentId`, `/eventos/:tournamentId/jogos`, `/classificacao`, `/organizacao`, `/jogadores`, `/chat`
- Inscricao e convite: `/inscricao/:tournamentId`, `/join/:tournamentId`
- Areas pessoais: `/minhas-reservas`, `/minhas-partidas`, `/minhas-aulas`, `/meus-pagamentos`
- Locais: `/locais`, `/locais/:placeId`, `/locais/:placeId/:placeIntent`
- Gestao/Trabalho: `/gestao`, `/gestao/:placeId`, `/gestao/:placeId/:module`, `/locais/:placeId/admin`
- Perfil e jogadores: `/perfil`, `/jogadores/:playerId`
- Ranking: `/ranking`
- Estados auxiliares: not found, vazios, loading, erro, modais, drawers, sheets e wizards.

## Ordem de execucao

A fila abaixo deve ser executada em ordem. Cada item precisa terminar com:

1. alteracao visual/UX perceptivel;
2. preservacao das funcionalidades existentes;
3. screenshots mobile e desktop quando a rota existir nos scripts;
4. `npm.cmd run lint`;
5. `npm.cmd run build`;
6. atualizacao do `EXECUTION_QUEUE.md`.

## PDARK-00 - Fundacao visual e componentes premium

Status: `[x]` concluido em 2026-05-19

Objetivo:

- criar a base reutilizavel para que a rodada global nao vire CSS isolado por tela;
- normalizar tokens premium dark, glass cards, heroes, tiles, stats, rows e estados vazios;
- reduzir duplicacao visual acumulada em `App.css`.

Problema atual:

- o app tem componentes bons, mas misturados entre claro, navy parcial e superficies administrativas;
- muitas telas usam `page-header`, `section-card`, `screen-state`, `event-card`, rows e tabs com estilos diferentes;
- ajustes recentes aproximaram Home, Locais, Competicoes e Perfil, mas ainda nao ha gramatica global dark.

Escopo:

1. Criar tokens CSS premium dark a partir do playbook: `--bg-main`, `--bg-deep`, `--bg-elevated`, `--bg-card`, `--green-main`, `--text-main`, `--text-muted`, `--border-soft`.
2. Normalizar classes/componentes existentes em vez de criar tudo do zero:
   - `VisualHeroCard` vira base de `HeroCard/ImageHero`;
   - `ShortcutCard` vira base de `ActionTile`;
   - `MetricCard` vira base de `StatCard`;
   - `VisualBadge`/`StatusBadge` ficam alinhados;
   - `ScreenState` vira `EmptyState` premium por CSS e props existentes.
3. Criar ou extender classes globais:
   - `.premium-dark-shell`;
   - `.premium-glass-card`;
   - `.premium-hero`;
   - `.premium-action-tile`;
   - `.premium-stat-card`;
   - `.premium-object-row`;
   - `.premium-filter-chip`;
   - `.premium-empty-state`.
4. Definir padrao de radius:
   - heroes: 22px mobile, 24px desktop;
   - cards: 18-22px;
   - chips/badges: pill;
   - botao primario: 16px.
5. Definir comportamento mobile:
   - fundo dark;
   - conteudo com padding compacto;
   - bottom nav escura;
   - hero curto;
   - cards empilhados ou grid 2x2.
6. Definir comportamento desktop:
   - sidebar escura;
   - fundo dark premium ou imagem atmosferica;
   - grid principal;
   - painel lateral onde houver detalhe.

Criterios de aceite:

- nenhuma rota fica quebrada por mudanca global;
- componentes existentes continuam recebendo as mesmas props;
- Home, Competicoes, Perfil, Login e Gestao conseguem usar a mesma base visual;
- lint/build passam.

Entrega sprint 1:

1. Tokens premium dark foram adicionados em `src/App.css` com base deep navy, superficies glass, verde ATP, texto principal/mutado e bordas suaves.
2. A camada global passou a cobrir `app-shell`, headers, bottom nav, sidebars, heroes, cards, estados vazios, inputs, selects, chips, badges e linhas operacionais.
3. Assets `pdark-*` foram integrados como base visual de Home, Login, Ranking, Competicoes, Perfil, estados vazios e Gestao.
4. Passada extra de contraste removeu ilhas brancas em Competicoes, Perfil e Gestao sem alterar backend, dados ou fluxo.

Evidencias:

- `docs/screenshots/visual-local-audit-2026-05-18/mobile-home.png`
- `docs/screenshots/visual-local-audit-2026-05-18/desktop-events-hub.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-profile.png`
- `docs/screenshots/visual-local-audit-2026-05-18/desktop-management.png`

Validacao:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- `node scripts\capture-visual-audit.mjs` atualizou a auditoria visual.

## PDARK-01 - Shell global, navegacao e contexto Jogador/Trabalho

Status: `[x]` concluido em 2026-05-19

Objetivo:

- transformar `AppShell`, `BottomNav` e sidebar em estrutura premium dark consistente;
- deixar Jogador e Trabalho como contextos reais, nao apenas abas.

Problema atual:

- mobile ainda alterna entre superficies claras e escuras por rota;
- bottom nav usa itens atuais `Inicio, Competir, Locais, Ranking, Perfil`, enquanto o playbook recomenda `Inicio, Competicoes, Reservas, Mensagens, Perfil` para o contexto jogador;
- desktop tem sidebar, mas ainda pode parecer clara/administrativa em varias areas.

Escopo:

1. Atualizar `AppShell` para dark-first em mobile para player, competition e management.
2. Criar variacao desktop escura com sidebar premium:
   - logo ATP no topo;
   - grupos `Jogar`, `Trabalho`, `Conta`;
   - CTA lateral contextual quando aplicavel.
3. Reavaliar bottom nav jogador:
   - item fixo recomendado: `Inicio`, `Competicoes`, `Reservas`, `Mensagens`, `Perfil`;
   - `Locais`, `Ranking`, `Aulas` continuam acessiveis como tiles/atalhos e podem aparecer ativos quando a rota estiver aberta;
   - se a mudanca de itens for arriscada, fazer em duas etapas: primeiro visual, depois arquitetura de nav.
4. Bottom nav Trabalho:
   - `Gestao`, `Agenda`, `Academia`, `Financeiro`, `Perfil` ou equivalentes conforme permissoes;
   - manter entrada atual por `workEntryPath`.
5. Header mobile:
   - ATP, sino, avatar/menu;
   - saudacao curta na Home;
   - titulo contextual nas telas internas.
6. `ContextSwitcher`:
   - Jogador/Trabalho como segmented control premium;
   - persistir comportamento atual de `useUserMode`.

Criterios de aceite:

- troca Jogador/Trabalho continua navegando corretamente;
- usuarios sem permissao profissional nao veem Trabalho;
- desktop e mobile ficam dark premium;
- itens de nav nao escondem funcoes essenciais.

Entrega sprint 1:

1. `BottomNav` do jogador foi alinhado para `Inicio`, `Competicoes`, `Reservas`, `Locais` e `Perfil`, preservando acesso direto as funcoes principais.
2. Shell player, competition e management recebeu base dark-first, com sidebar desktop escura e bottom nav mobile escura.
3. Contexto Jogador/Trabalho foi preservado e recebeu tratamento visual premium no header e na navegacao.
4. A gestao passou a usar superficie dark/glass nas filas, competicoes organizadas e workspaces de locais.

Observacao:

- A evolucao profunda dos modulos Trabalho continua nos itens PDARK-12 a PDARK-15; nesta entrega foi fechada a base visual e de navegacao global.

Validacao:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- Auditoria visual atualizada em `docs/screenshots/visual-local-audit-2026-05-18/`.

## PDARK-02 - Login, cadastro e estados de entrada

Status: `[x]` concluido em 2026-05-19

Rotas:

- `/auth`
- `/auth/callback`
- `/completar-cadastro`

Objetivo:

- fazer a primeira experiencia parecer produto premium;
- tirar login/cadastro da aparencia de formulario generico;
- manter validacoes e campos obrigatorios existentes.

Escopo:

1. Login:
   - background dark com quadra cinematografica;
   - card glass transluscido;
   - mensagem curta: `Jogue. Organize. Evolua.`;
   - CTA primario verde;
   - entrada Google/criar conta com estilo secundario.
2. Cadastro:
   - manter Nome, E-mail, Telefone, Data de nascimento, Cidade e Estado;
   - transformar em wizard compacto ou card com passos visuais;
   - separar identificacao, localizacao e confirmar;
   - texto curto e humano.
3. Loading/callback:
   - estado dark premium com logo ATP e indicador simples.
4. Erros:
   - card glass danger, sem texto tecnico excessivo.

Criterios de aceite:

- fluxo de login/cadastro continua igual;
- campos obrigatorios continuam validados;
- mobile e desktop usam o mesmo DNA visual.

Entrega sprint 1:

1. `AuthPage` passou a usar o asset `pdark-onboarding-hero.png` e a mesma linguagem premium dark da referencia.
2. Formularios, inputs, botoes, callback/loading e estados de erro receberam a camada global glass/dark sem mudar validacoes.
3. Cadastro obrigatorio segue o fluxo atual, agora coberto pelos tokens e superficies globais.

Validacao:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- A rota autenticada redireciona `/auth` durante a auditoria, entao a evidencia principal desta etapa foi por codigo/build; a cobertura visual signed-out fica para uma captura dedicada em PDARK-18.

## PDARK-03 - Home Jogador premium

Status: `[x]` concluido em 2026-05-19

Rota:

- `/inicio`

Objetivo:

- fazer a Home responder: o que posso fazer agora, o que tenho proximo, e o que existe perto de mim.

Escopo:

1. Mobile:
   - header ATP + sino + avatar;
   - saudacao `Ola, Escalao!` e titulo `Pronto para jogar?`;
   - segmented Jogador/Trabalho;
   - hero `Encontre seu proximo jogo`;
   - quick actions: `Reservar quadra`, `Encontrar jogo`, `Torneios`, `Aulas`, `Ligas`;
   - se cinco tiles nao couberem, usar scroll horizontal como na referencia;
   - secoes: `Perto de voce`, `Proximas partidas`, `Minhas reservas`.
2. Desktop:
   - sidebar dark;
   - hero largo;
   - tiles horizontais;
   - grid com `Perto de voce` + agenda lateral;
   - faixa `Ranking ATP` ou progresso.
3. Reaproveitar dados atuais da Home:
   - discovery cards;
   - agenda/reservas;
   - partidas;
   - atalhos existentes.
4. Remover ou reformatar textos longos:
   - evitar `O que voce quer fazer hoje?`;
   - usar labels curtos e acionaveis.

Criterios de aceite:

- primeira dobra mobile parece a referencia 2;
- nao perde acesso a Locais, Ranking, Aulas, Reservas, Partidas e Pagamentos;
- CTAs existentes continuam navegando.

Entrega sprint 2:

1. Home passou a usar hero default `Encontre seu proximo jogo`, com CTA curto e linguagem alinhada a referencia premium dark.
2. Header mobile mudou de `Bem-vindo` para `Ola,` mantendo nome/avatar, seletor Jogador/Trabalho e sino.
3. Quick actions foram reformatadas para cinco atalhos: `Reservar quadra`, `Encontrar jogo`, `Torneios`, `Aulas`, `Ligas`.
4. Mobile usa trilho horizontal para os cinco atalhos, evitando quebra de layout e preservando densidade.
5. Foi criada faixa `Proximos passos`, reaproveitando partidas, reservas e aulas existentes quando houver dados carregados.

Evidencias:

- `docs/screenshots/visual-local-audit-2026-05-18/mobile-home.png`
- `docs/screenshots/visual-local-audit-2026-05-18/desktop-home.png`

Validacao:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- `node scripts\capture-visual-audit.mjs` atualizou screenshots.

## PDARK-04 - Competições hub, torneios, ligas e rankings

Status: `[x]` concluido em 2026-05-19

Rotas:

- `/eventos`
- `/eventos/torneios`
- `/eventos/ligas`
- `/ranking` como integracao visual relacionada

Objetivo:

- fazer Competições parecer central esportiva viva.

Escopo:

1. Hub `/eventos`:
   - hero com trofeu/quadra;
   - KPIs: inscricoes abertas, jogos hoje, ligas ativas;
   - tabs `Torneios`, `Ligas`, `Rankings`;
   - filtros em chips;
   - cards `Proximos torneios`, `Liga em destaque`, `Inscricoes abertas`, `Resultados recentes`.
2. `/eventos/torneios`:
   - card de torneio com imagem, categoria, formato, data, local, vagas e CTA curto;
   - estado vazio com `Encontrar torneios` ou `Entrar por codigo`;
   - organizador em contexto Trabalho preservado.
3. `/eventos/ligas`:
   - resumo: jogando, ativas, convites;
   - estado vazio com caminho claro;
   - lista de ligas com status, temporada, divisao e proxima rodada.
4. `/ranking`:
   - alinhar visual ao Perfil/Ranking;
   - minha posicao antes da tabela;
   - filtros simples.

Criterios de aceite:

- Competições desktop se aproxima da imagem desktop com trofeu;
- mobile mostra central compacta, nao lista vazia;
- organizacao de torneios/ligas continua disponivel para Trabalho.

Entrega sprint 2/3:

1. Hub `/eventos` recebeu centro de comando com KPIs de inscricoes abertas, ligas ativas e competicoes vinculadas ao jogador.
2. Foram adicionados atalhos em abas para `Torneios`, `Ligas` e `Rankings`.
3. Hub ganhou paineis de destaque: `Proximos torneios`, `Liga em destaque` e `Resultados recentes`.
4. Os novos blocos usam glass dark, imagem premium e comportamento responsivo com carrossel horizontal no mobile.
5. `/eventos/torneios` e `/eventos/ligas` receberam camada premium dark em cards, filtros, estados vazios, KPIs e modais de criacao.
6. `/ranking` foi alinhado visualmente a Competicoes, com hero dark, controles, tabela e cards de posicao em superficies glass.

Evidencias:

- `docs/screenshots/visual-local-audit-2026-05-18/desktop-events-hub.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-events-hub.png`
- `docs/screenshots/visual-local-audit-2026-05-18/desktop-tournaments.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-leagues.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-ranking.png`

Validacao:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- `node scripts\capture-visual-audit.mjs` atualizou screenshots.

## PDARK-05 - Detalhe de torneio, inscrição e convite

Status: `[x]` concluido em 2026-05-19

Rotas:

- `/eventos/:tournamentId`
- `/eventos/:tournamentId/jogos`
- `/eventos/:tournamentId/classificacao`
- `/eventos/:tournamentId/organizacao`
- `/eventos/:tournamentId/jogadores`
- `/eventos/:tournamentId/chat`
- `/inscricao/:tournamentId`
- `/join/:tournamentId`

Objetivo:

- transformar o torneio em pagina de evento esportivo, preservando operacao existente.

Escopo:

1. Hero do torneio:
   - imagem de evento;
   - status;
   - nome, clube, cidade, data;
   - chips categoria/genero/formato/vagas.
2. Card de inscricao:
   - deadline;
   - valor se existir;
   - CTA `Inscrever-se`, `Entrar por codigo` ou estado atual.
3. Tabs:
   - `Visao geral`, `Chave`, `Jogos`, `Regulamento`, `Jogadores`, `Chat`, `Organizacao` conforme perfil.
4. Jogos:
   - cards de partida com jogadores, status, horario e resultado;
   - ponte para matchroom quando existir.
5. Classificacao/chave:
   - preview visual da chave antes de listas densas.
6. Organizacao:
   - manter funcoes atuais;
   - aplicar dark operational cards;
   - pendencias como tarefas, nao listas cruas.
7. Inscricao/convite:
   - tela dark premium com resumo do torneio e CTA claro.

Criterios de aceite:

- nenhuma funcao de torneio desaparece;
- fluxo de inscricao continua;
- organizador e jogador veem contextos apropriados.

Entrega sprint 4:

1. Detalhe de torneio recebeu camada premium dark em hero, tabs, resumo, jogos, classificacao, jogadores, chat e organizacao.
2. Inscricao/convite recebeu tratamento dark em hero, opcoes, review, CTA fixo e cards laterais.
3. Matchroom/drawer de partida passou a usar asset `pdark-matchroom-mobile-header.png` e superficies glass.
4. Cards de jogos, formulários de placar, rows de jogadores e painéis administrativos foram escurecidos sem remover campos ou acoes existentes.

Evidencias:

- `docs/screenshots/visual-local-audit-2026-05-18/desktop-tournament-games.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-tournament-games.png`
- `docs/screenshots/visual-local-audit-2026-05-18/desktop-tournament-players.png`

Validacao:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- `node scripts\capture-visual-audit.mjs` atualizou screenshots.

## PDARK-06 - Liga, rodada, chat e matchroom

Status: `[x]` concluido em 2026-05-19

Rotas:

- `/eventos/ligas/:leagueId`
- tabs internas de rodada, jogadores, classificacao, partidas, chat, configuracao

Objetivo:

- fazer a Liga parecer viva: rodada atual, classificacao, partidas e comunicacao.

Escopo:

1. Hero da liga:
   - status, visibilidade, temporada;
   - CTA copiar link/WhatsApp quando existir.
2. Aba inicial:
   - priorizar `Rodada atual`;
   - resumo da rodada;
   - partidas pendentes;
   - classificacao resumida.
3. Chat da liga:
   - corrigir/evitar qualquer re-render ruim ao digitar;
   - input local/controlado;
   - aviso fixado;
   - mensagens com avatar, nome, data e status;
   - card de WhatsApp com `Abrir grupo`.
4. Matchroom:
   - criar padrao visual para ambiente da rodada conforme imagem 4;
   - jogador A x jogador B com avatar/ranking;
   - status em badge;
   - horarios em comum;
   - local/quadra;
   - chat da partida;
   - participantes;
   - acoes: confirmar horario, lancar resultado, marcar WO;
   - resultado em score box.
5. Se ainda nao houver rota dedicada de matchroom:
   - reaproveitar modal/detalhe existente ou abrir drawer/painel lateral;
   - registrar item tecnico se precisar de rota futura.

Criterios de aceite:

- liga fica util na primeira dobra;
- chat nao trava digitacao;
- partida deixa de parecer formulario/lista e passa a parecer ambiente de jogo.

Entrega sprint 5:

1. Liga recebeu fechamento visual premium dark nas abas de rodada, jogadores, classificacao, partidas, chat e configuracao, preservando rotas e dados existentes.
2. Painel `Operacao da liga`, fila operacional, cards de rodada, fechamento de temporada e acoes de publicacao foram convertidos para superficies glass/deep navy.
3. Chat da liga deixou de ter lista branca; aviso fixado, comunicados, mensagens, composer e ferramentas do admin agora usam dark cards, bordas suaves e estados verdes/amber.
4. Matchroom, cards de partida, filtros, paginacao, registros e standings foram cobertos por seletores compartilhados da camada PDARK-06.
5. Navegacao interna da liga recebeu tratamento dark/green para manter continuidade com o hero cinematografico.

Evidencias:

- `docs/screenshots/visual-local-audit-2026-05-18/desktop-league-detail.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-league-detail.png`
- `docs/screenshots/visual-local-audit-2026-05-18/desktop-league-chat.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-league-chat.png`

Validacao:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- `node scripts\capture-visual-audit.mjs` atualizou screenshots.

## PDARK-07 - Areas pessoais: reservas, partidas, aulas e pagamentos

Status: `[x]` concluido em 2026-05-19

Rotas:

- `/minhas-reservas`
- `/minhas-partidas`
- `/minhas-aulas`
- `/meus-pagamentos`

Objetivo:

- fazer areas pessoais parecerem jornadas do jogador, nao relatorios.

Escopo:

1. Reservas:
   - proxima reserva em destaque;
   - tabs `Hoje`, `Proximas`, `Historico`;
   - card com thumbnail, clube, quadra, piso, cidade, data, hora e status;
   - CTA `Nova reserva`;
   - alterar/cancelar com confirmacao.
2. Partidas:
   - proxima partida em destaque;
   - tabs `Proximas`, `Pendentes`, `Historico`;
   - acao contextual: combinar horario, lancar resultado, ver detalhe;
   - nunca usar estado vazio sem proximo caminho.
3. Aulas:
   - proxima aula;
   - minhas turmas;
   - CTA `Entrar em aula`;
   - cards com professor, nivel, local, dia, horario e status.
4. Pagamentos:
   - pendencias primeiro;
   - historico depois;
   - status premium: pago, vencido, pendente;
   - CTA contextual quando houver cobranca.

Criterios de aceite:

- cada rota pessoal tem proximo passo claro;
- dados existentes sao reaproveitados;
- estados vazios sempre oferecem CTA.

Entrega sprint 6:

1. Areas pessoais receberam hero premium dark compartilhado, com titulo claro, contexto esportivo e asset cinematografico.
2. `Minhas reservas`, `Minhas partidas`, `Minhas aulas` e `Meus pagamentos` passaram a usar cards deep navy/glass, status pills por tom e linhas com textura de quadra.
3. Grid desktop deixou de esticar colunas vazias; listas longas agora ficam controladas e escaneaveis.
4. Mobile foi corrigido para uma coluna, removendo cards estreitos e melhorando leitura de reservas, aulas, pagamentos e estados vazios.
5. Dialog de detalhe de reserva herdou o visual dark sem alterar cancelamento, consulta ou dados.

Evidencias:

- `docs/screenshots/visual-local-audit-2026-05-18/desktop-my-reservations.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-my-reservations.png`
- `docs/screenshots/visual-local-audit-2026-05-18/desktop-my-lessons.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-my-payments.png`

Validacao:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- `node scripts\capture-visual-audit.mjs` atualizou screenshots.

## PDARK-08 - Locais, detalhe do clube e reservar quadra

Status: `[x]` concluido em 2026-05-19

Rotas:

- `/locais`
- `/locais/:placeId`
- `/locais/:placeId/:placeIntent`

Objetivo:

- transformar Locais em experiencia de descoberta tipo Playtomic/Airbnb para tenis.

Escopo:

1. `/locais`:
   - hero `Jogue por perto`;
   - busca principal;
   - chips de filtros;
   - jornadas: jogos, locais, quadras, aulas;
   - destaques perto de voce;
   - jogos abertos, quadras disponiveis, aulas perto.
2. Detalhe do clube:
   - hero com foto;
   - nome, cidade, rating, status aberto/fechado;
   - amenities;
   - quadras disponiveis;
   - horarios proximos;
   - CTA `Reservar quadra`;
   - sobre, aulas, torneios e estrutura.
3. Reserva publica:
   - agenda visual;
   - cards/chips de horarios;
   - quadra selecionada;
   - solicitacao clara.
4. Cards de local:
   - distancia quando existir;
   - rating quando existir;
   - disponibilidade;
   - CTA unico principal.

Criterios de aceite:

- filtros nao ocupam a tela inteira;
- listas longas recebem imagem/thumbnail;
- fluxo reservar quadra continua funcionando.

Entrega sprint 7:

1. Hub `/locais` recebeu contraste corrigido no painel de descoberta, mantendo tiles brancos premium sobre base deep navy conforme referencia.
2. Fluxos `Encontrar jogo`, `Reservar quadra`, `Entrar em aula` e `Ver locais` foram cobertos por filtros, resultados e cards dark/glass.
3. Jogos abertos deixaram de usar cards brancos e passaram para linhas esportivas dark com CTA verde.
4. Detalhe publico de clube, reserva de quadra, aulas, planos, sobre e sticky CTA receberam cobertura visual premium dark via seletores compartilhados.
5. Mobile manteve navegação horizontal dos intents e cards legiveis com hierarquia mais proxima do app de referencia.

Evidencias:

- `docs/screenshots/visual-local-audit-2026-05-18/desktop-places-overview.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-places-overview.png`
- `docs/screenshots/visual-local-audit-2026-05-18/desktop-places-match.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-places-match.png`
- `docs/screenshots/visual-local-audit-2026-05-18/desktop-places-lessons.png`

Validacao:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- `node scripts\capture-visual-audit.mjs` atualizou screenshots.

## PDARK-09 - Aulas e turmas

Status: `[x]` concluido em 2026-05-19

Areas:

- `/minhas-aulas`
- `/locais?intent=classes`
- detalhe publico de aulas no local;
- módulos Trabalho/Academia de turmas, alunos e professores.

Objetivo:

- vender evolucao do jogador e organizar turmas com clareza.

Escopo:

1. Descoberta de aulas:
   - hero compacto;
   - filtros em chips;
   - cards de turma com nivel, horario, professor, local, vagas e duracao;
   - CTA `Entrar em aula`.
2. Minhas aulas:
   - proxima aula em destaque;
   - minhas turmas;
   - historico/pendencias.
3. Trabalho/Academia:
   - aulas de hoje;
   - agenda dos professores;
   - alunos e presenca;
   - mensalidades relacionadas;
   - acoes rapidas: nova aula, nova turma, novo aluno.

Criterios de aceite:

- jogador entende rapidamente qual turma pode entrar;
- gestor entende o dia da academia;
- cadastro/gestao atuais continuam funcionais.

Entrega sprint 8:

1. Discovery de aulas em `/locais?intent=classes` recebeu filtros dark/glass, hero visual, botao de busca com grid corrigido e estado inicial legivel.
2. `Minhas aulas` ja estava coberta pela camada de areas pessoais e foi validada com turmas ativas, solicitacoes e status pills de matricula/aguardando.
3. Cards e filtros de aula usam a mesma linguagem de quadra/clube, com CTA verde e superficies deep navy.
4. Gestao geral ja exibe metricas de Academia e entrada operacional no mesmo DNA dark; aprofundamento de workspace Academia segue preservado para `PDARK-13`.

Evidencias:

- `docs/screenshots/visual-local-audit-2026-05-18/desktop-places-lessons.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-places-lessons.png`
- `docs/screenshots/visual-local-audit-2026-05-18/desktop-my-lessons.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-my-lessons.png`
- `docs/screenshots/visual-local-audit-2026-05-18/desktop-management.png`

Validacao:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- `node scripts\capture-visual-audit.mjs` atualizou screenshots.

## PDARK-10 - Perfil, perfil publico e ranking

Status: `[x]` concluido em 2026-05-19

Rotas:

- `/perfil`
- `/jogadores/:playerId`
- `/ranking`

Objetivo:

- transformar Perfil em identidade esportiva e Ranking em performance.

Escopo:

1. Perfil proprio:
   - hero competitivo;
   - avatar, nome, cidade, nivel e clube;
   - tabs `Estatisticas`, `Partidas`, `Historico`, `Ranking`, `Conta`;
   - telefone/e-mail/nascimento vao para `Conta`, nao primeira aba;
   - estatisticas: vitorias, jogos no mes, posicao, aproveitamento;
   - partidas recentes com resultado.
2. Perfil publico:
   - mesma identidade visual, mas sem dados privados;
   - estatisticas publicas;
   - competicoes recentes.
3. Ranking:
   - minha posicao;
   - recorte atual;
   - top jogadores;
   - tabela escaneavel;
   - filtros simples.

Criterios de aceite:

- Perfil deixa de parecer cadastro;
- dados sensiveis continuam protegidos;
- Ranking reforca progressao.

Entrega sprint 9:

1. Perfil recebeu refinamento nas tabs internas, removendo a quebra visual clara e mantendo hero/avatar/rows no DNA premium.
2. Ranking recebeu hero mais escuro e cinematografico, tabela sem faixas brancas, controles dark/glass e botoes alinhados ao tema.
3. Mobile de Ranking e Perfil foi revisado para manter hierarquia, contraste e navegacao inferior consistente.
4. Perfil publico segue coberto pelos mesmos seletores de perfil e ranking, sem expor dados privados.

Evidencias:

- `docs/screenshots/visual-local-audit-2026-05-18/desktop-profile.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-profile.png`
- `docs/screenshots/visual-local-audit-2026-05-18/desktop-ranking.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-ranking.png`

Validacao:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- `node scripts\capture-visual-audit.mjs` atualizou screenshots.

## PDARK-11 - Mensagens e comunicacao contextual

Status: `[x]` concluido em 2026-05-19

Areas:

- chats de liga/torneio;
- chat de partida;
- notificacoes;
- futuras mensagens globais se houver rota.

Objetivo:

- padronizar comunicacao como parte do app esportivo.

Escopo:

1. Criar padrao visual de `ChatPreviewCard`, `ChatThread`, `PinnedNotice` e `WhatsAppGroupCard`.
2. Aplicar em:
   - chat da liga;
   - chat do torneio;
   - ambiente da rodada;
   - notificacoes/avisos existentes.
3. Cada conversa deve mostrar contexto:
   - liga;
   - rodada;
   - reserva;
   - aula;
   - academia;
   - sistema.
4. Unread badge verde.

Criterios de aceite:

- usuario entende origem da mensagem;
- campos de mensagem nao travam;
- WhatsApp vira complemento, nao substituto confuso.

Entrega sprint 10:

1. Notificacoes globais, avisos da Home e preferencias de notificacao receberam superficie dark/glass com textura esportiva.
2. Chat de torneio e chat de liga foram padronizados como `ChatThread`: mensagem fixada, aviso, mensagem propria, mensagem de outro participante e composer usam a mesma hierarquia.
3. Chat de partida/rodada e comentarios de jogos abertos foram alinhados ao mesmo visual, com CTA verde e campos escuros.
4. Acoes WhatsApp seguem presentes, mas visualmente como complemento contextual, sem competir com o chat interno.

Evidencias:

- `docs/screenshots/visual-local-audit-2026-05-18/desktop-league-chat.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-league-chat.png`
- `docs/screenshots/visual-local-audit-2026-05-18/desktop-tournament-games.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-profile.png`

Validacao:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- `node scripts\capture-visual-audit.mjs` atualizou screenshots.

## PDARK-12 - Trabalho / Gestao geral

Status: `[x]` concluido em 2026-05-19

Rotas:

- `/gestao`
- entradas profissionais por `workEntryPath`

Objetivo:

- transformar Trabalho em central operacional premium.

Escopo:

1. Header Trabalho:
   - contexto do usuario/profissional;
   - CTA principal `Abrir operacao` ou `Criar workspace`.
2. Fila do dia:
   - reservas pendentes;
   - pagamentos;
   - chamadas/aulas;
   - torneios/ligas que exigem acao.
3. Workspaces:
   - locais sob gestao;
   - torneios/ligas organizadas;
   - suporte/implantacao.
4. KPIs:
   - poucos e uteis;
   - evitar cards gigantes sem hierarquia.
5. Mobile:
   - cards empilhados;
   - acao principal sempre visivel.

Criterios de aceite:

- gestor sabe o que fazer agora;
- jogador comum sem permissao recebe caminho correto;
- nenhum workspace profissional fica inacessivel.

Entrega sprint 11:

1. `/gestao` foi refinada como central operacional dark-first, com header, switch de modo, fila do dia, convites, competicoes organizadas, workspaces e implantacao guiada.
2. Cards de prioridade e rows de locais receberam textura premium, contraste consistente, CTAs verdes e superficies sem ilhas claras dominantes.
3. Acoes rapidas e setup ganharam espaçamento/hierarquia para leitura no desktop e no mobile.
4. Jogador sem permissao continua recebendo caminho correto para Inicio/Locais, agora com estado vazio no mesmo DNA visual.

Evidencias:

- `docs/screenshots/visual-local-audit-2026-05-18/desktop-management.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-management.png`

Validacao:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- `node scripts\capture-visual-audit.mjs` atualizou screenshots.

## PDARK-13 - Trabalho / Academia

Status: `[x]` concluido em 2026-05-19

Areas:

- módulos de Academia em `PlaceAdminPage`;
- `PlaceAcademy*Module`;
- `AcademyWorkspaceShell`.

Objetivo:

- fazer a academia parecer negocio esportivo premium com operacao diaria clara.

Escopo:

1. Header Academia:
   - nome do local;
   - status do dia;
   - acoes rapidas.
2. KPIs:
   - alunos;
   - aulas;
   - receita;
   - presenca;
   - professores.
3. Operacao:
   - aulas de hoje;
   - agenda dos professores;
   - presenca;
   - pagamentos recentes;
   - solicitacoes.
4. Turmas/alunos/professores:
   - rows/cards glass;
   - acao primaria clara;
   - detalhes em drawer quando extensos.

Criterios de aceite:

- informacao operacional do dia vem antes de cadastro;
- formularios continuam progressivos;
- financeiro resumido fica conectado sem poluir.

Entrega sprint 12:

1. Workspace de Academia recebeu acabamento premium em `PlaceAdminShell`, `PlaceWorkspaceShell`, `AcademyWorkspaceShell` e módulos `PlaceAcademy*`.
2. Header do local, cockpit, tabs de módulo, tabs internas, fila de pendências, cards, rows, toolbars, drawers e formulários progressivos foram alinhados ao DNA dark/glass.
3. O container claro herdado por `.place-workspace` foi removido; métricas, filtros, pedidos e queues operacionais ficaram legíveis e esportivos.
4. Fluxos de turma, aluno, pendência, professor, encaixe e configuração continuam usando os componentes existentes.

Evidencias:

- `docs/screenshots/visual-local-audit-2026-05-18/desktop-management.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-management.png`
- `docs/screenshots/visual-local-audit-2026-05-18/desktop-management-academy.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-management-academy.png`

Validacao:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- `node scripts\capture-visual-audit.mjs` atualizou screenshots.

## PDARK-14 - Trabalho / Gestao de quadras, reservas e agenda

Status: `[x]` concluido em 2026-05-19

Areas:

- `BookingWorkspaceShell`;
- `PlaceBooking*Module`;
- agenda de quadras;
- solicitacoes e waitlist.

Objetivo:

- criar uma tela operacional densa, mas premium e legivel.

Escopo:

1. Header `Reservas / Gestao de Quadras`;
2. KPIs: reservas hoje, ocupacao, clientes ativos, faturamento;
3. Agenda de quadras como centro:
   - confirmada: verde;
   - aula/escola: azul;
   - manutencao: amarelo;
   - disponivel: tracejado;
4. Painel lateral/drawer de reserva selecionada;
5. Solicitacoes pendentes com aceitar/recusar;
6. Botao `Nova reserva` sempre visivel;
7. Mobile:
   - dia e quadra em seletores;
   - timeline vertical;
   - detalhes em bottom sheet.

Criterios de aceite:

- gestor nao perde densidade operacional;
- visual deixa de parecer planilha;
- fluxo de criar/aceitar/cancelar reserva continua.

Entrega sprint 13:

1. `BookingWorkspaceShell` e os módulos de reservas/agenda receberam camada premium dark, incluindo calendário por quadra, reservas recentes, nova reserva, lista de espera, quadras e regras.
2. Agenda de quadras manteve densidade operacional, mas com superfícies dark/glass, slots escaneáveis e distinção visual entre reserva, aula/escola, bloqueio e horário livre.
3. Formulários, filtros, regras, cards de quadra e métricas foram convertidos para inputs escuros e CTAs verdes.
4. Fluxos de confirmar, cancelar, criar reserva, converter espera e configurar quadra continuam nos componentes existentes.

Evidencias:

- `docs/screenshots/visual-local-audit-2026-05-18/desktop-management-booking.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-management-booking.png`
- `docs/screenshots/visual-local-audit-2026-05-18/desktop-management.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-management.png`

Validacao:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- `node scripts\capture-visual-audit.mjs` atualizou screenshots.

## PDARK-15 - Trabalho / Financeiro, CRM, Cantina, Time e Configuracoes

Status: `[x]` concluido em 2026-05-19

Areas:

- `PlaceFinance*Module`;
- `PlaceCrm*`;
- `PlaceCanteen*`;
- `TeamWorkspaceShell`;
- `SettingsWorkspaceShell`.

Objetivo:

- aplicar o mesmo DNA premium dark nas rotinas administrativas secundarias.

Escopo:

1. Financeiro:
   - resumo do mes;
   - recebiveis primeiro;
   - despesas;
   - pacotes;
   - status pagos/vencidos/pendentes.
2. CRM:
   - fila de relacionamento;
   - contatos em rows;
   - historico em drawer;
   - proxima acao clara.
3. Cantina:
   - venda rapida;
   - estoque baixo;
   - produtos como rows/cards compactos.
4. Time:
   - membros, papeis, convites;
   - permissoes legiveis.
5. Configuracoes:
   - secoes curtas;
   - cards glass;
   - evitar formularios gigantes.

Criterios de aceite:

- cada modulo tem hierarquia clara;
- formularios longos continuam em drawer/progressivo;
- acoes perigosas continuam protegidas.

Entrega sprint 14:

1. Financeiro, Clientes/CRM, Cantina/POS, Equipe e Ajustes receberam superficies premium dark/glass no workspace operacional, mantendo os componentes e rotas existentes.
2. Recebiveis, follow-ups, venda rapida, convites, papeis, checklist e configuracoes estruturais foram tratados como filas/paineis escaneaveis, com CTAs verdes e botoes secundarios em vidro escuro.
3. Inputs, selects, busca, cards de produto, rows de cobranca/CRM e guia de papeis foram convertidos para contraste dark-first.
4. O vazamento visual de cards brancos em `Equipe > Papeis` foi corrigido e recapturado em desktop/mobile.

Evidencias:

- `docs/screenshots/visual-local-audit-2026-05-18/desktop-management-finance.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-management-finance.png`
- `docs/screenshots/visual-local-audit-2026-05-18/desktop-management-clients.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-management-clients.png`
- `docs/screenshots/visual-local-audit-2026-05-18/desktop-management-canteen.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-management-canteen.png`
- `docs/screenshots/visual-local-audit-2026-05-18/desktop-management-team.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-management-team.png`
- `docs/screenshots/visual-local-audit-2026-05-18/desktop-management-settings.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-management-settings.png`

Validacao:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- `node scripts\capture-visual-audit.mjs` atualizou screenshots globais antes das capturas diretas de PDARK-15.

## PDARK-16 - Paginas publicas e conversao

Status: `[x]` concluido em 2026-05-19

Rotas:

- `/locais/:placeId`
- `/locais/:placeId/:placeIntent`
- `/jogadores/:playerId`
- inscricao publica de torneio/liga.

Objetivo:

- manter paginas publicas vendendo valor, mas com DNA premium dark.

Escopo:

1. Local publico:
   - hero escuro com foto;
   - CTA reserva/aula;
   - estrutura, aulas, torneios e prova social.
2. Jogador publico:
   - identidade esportiva;
   - estatisticas publicas;
   - competicoes recentes.
3. Inscricoes:
   - resumo do evento;
   - dados necessarios;
   - CTA claro;
   - estado de sucesso premium.

Criterios de aceite:

- conversao nao cai por excesso de dark;
- CTAs ficam fortes;
- dados privados seguem ocultos.

Entrega sprint 15:

1. Pagina publica de local recebeu refinamento de conversao com hero cinematografico, base dark na rota, action rail, overview e compartilhamento sem superficies brancas.
2. Perfil publico de jogador recebeu identidade esportiva, stats e estados vazios dark; o link `Voltar` foi corrigido para pill compacto.
3. Inscricao publica de torneio/liga recebeu acabamento dark/glass em hero, steps, opcoes, review, sidebar e CTAs, preservando estados de inscricao fechada/aprovacao.
4. Fundos claros/bege das rotas publicas foram substituidos por base deep navy com textura esportiva.

Evidencias:

- `docs/screenshots/visual-local-audit-2026-05-18/desktop-public-place-overview.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-public-place-overview.png`
- `docs/screenshots/visual-local-audit-2026-05-18/desktop-public-place-booking.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-public-place-academy.png`
- `docs/screenshots/visual-local-audit-2026-05-18/desktop-public-player.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-public-player.png`
- `docs/screenshots/visual-local-audit-2026-05-18/desktop-public-tournament-registration.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-public-tournament-registration.png`

Validacao:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- `node scripts\capture-visual-audit.mjs` atualizou screenshots globais.

## PDARK-17 - Estados vazios, loading, erro, modais, drawers e sheets

Status: `[x]` concluido em 2026-05-19

Objetivo:

- padronizar todos os estados auxiliares do app.

Escopo:

1. Estados vazios:
   - titulo humano;
   - frase curta;
   - CTA principal;
   - imagem/textura sutil quando fizer sentido.
2. Loading:
   - dark premium;
   - skeleton em cards;
   - evitar textos longos.
3. Erro:
   - linguagem simples;
   - CTA de tentar novamente ou voltar.
4. Modal/drawer:
   - glass/dark;
   - largura e altura responsivas;
   - mobile como bottom sheet quando apropriado.
5. SetupWizard:
   - dark premium;
   - etapas compactas;
   - CTA persistente.

Criterios de aceite:

- nenhum estado vazio termina sem proximo caminho;
- modais continuam acessiveis;
- setup de local/torneio/liga continua funcional.

Entrega sprint 16:

1. Estados vazios, loading, erro, feedbacks, toasts, modais, drawers, sheets e `SetupWizard` receberam camada premium dark transversal.
2. `ScreenState`, `.empty-state`, `home-empty-panel`, `workspace-empty-state`, estados de calendario e estados publicos passaram a usar textura escura e hierarquia consistente.
3. Loading ganhou scan bar sutil; feedback/toasts ganharam variacoes dark para sucesso/erro/info.
4. Overlays, modais, drawers de torneio/liga/academia/CRM e sheets ficaram com backdrop blur, superficies glass e CTAs verdes.

Validacao:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- `node scripts\capture-visual-audit.mjs` atualizou screenshots globais.

## PDARK-18 - QA visual global e fechamento

Status: `[>]` em andamento

Objetivo:

- validar que a rodada global atingiu pelo menos 90% da percepcao visual proposta.

Escopo:

1. Rodar `npm.cmd run lint`.
2. Rodar `npm.cmd run build`.
3. Rodar `node scripts/capture-visual-audit.mjs`.
4. Revisar screenshots:
   - login;
   - cadastro;
   - home;
   - competicoes;
   - torneios;
   - ligas;
   - ranking;
   - perfil;
   - locais;
   - reservas;
   - partidas;
   - aulas;
   - pagamentos;
   - gestao;
   - league detail/chat;
   - tournament games/players.
5. Criar relatorio de gaps restantes.
6. Atualizar `EXECUTION_QUEUE.md`.

Criterios de aceite:

- screenshots documentam antes/depois;
- gaps restantes ficam em queue secundaria;
- nao ha regressao funcional obvia nos fluxos principais.
