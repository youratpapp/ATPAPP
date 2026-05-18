# Current Product State

Nota 2026-05-18: foi concluido o sprint `PLAYER-CONTEXT-01`/`PLAYER-BOOKING-01`/`PLAYER-ROOM-01`. A Home do jogador agora abre paginas reais para `/minhas-reservas`, `/minhas-partidas`, `/minhas-aulas` e `/meus-pagamentos`, preservando a Home como resumo pessoal. Reservas passadas saem do fluxo principal e aparecem em historico; clicar em uma reserva especifica abre o detalhe via query `?reserva={id}`. A reserva publica nao consulta nem permite selecionar horarios passados e as RPCs foram protegidas pela migration `0095_booking_past_time_guard_v1.sql`. A sala da liga deixou de perder foco no chat ao digitar; o problema vinha do ciclo de foco do `AppDialog` quando `onClose` mudava entre renders. A sala tambem ganhou link de grupo de WhatsApp, copiar/abrir/remover e envio do link para participantes com telefone valido, via migration `0096_league_match_room_links_v1.sql`. `npm.cmd run lint` e `npm.cmd run build` passaram.

Nota 2026-05-18: foi criada a frente `ROLE-MODE-V2` para transformar `Jogador/Trabalho` de uma troca de menu em duas experiencias reais. As fontes sao `ROLE_MODE_V2_PRODUCT_UX_SPEC.md` e `ROLE_MODE_V2_FLOW_MATRIX.md`. A `EXECUTION_QUEUE.md` agora prioriza remover filas profissionais da Home do jogador, criar uma central de trabalho/workspaces, sincronizar modo por rota, separar notificacoes por modo, separar `Competir` de `Organizar`, revisar mobile e validar por papel. Esta frente deve ser concluida antes de avancar em multi-esporte amplo.

Nota 2026-05-18: `ROLE-MODE-V2-01` a `ROLE-MODE-V2-07` foram concluidos. A Home do jogador nao renderiza mais listas operacionais de trabalho; mostra no maximo um aviso compacto apontando para o modo `Trabalho`. O `AppShell` agora sincroniza `player/work` pela intencao da rota, evitando superficie de gestao em `/inicio` e ativando trabalho em `/gestao`, rotas de organizacao e listas com contexto profissional. `/gestao` passou a ser a central de trabalho tambem para organizadores, reunindo locais, ligas/torneios organizados e convites profissionais com aceitar/recusar. O sino da Home prioriza apenas pendencias pessoais; convites e pendencias profissionais vivem na Central de Trabalho. O hub `Competir` ficou orientado a jogador (`Jogando`/`Descobrir`) e envia organizacao para `Trabalho`, sem cockpit administrativo dentro da descoberta. O `ManagementShell` ganhou retorno compacto para `Jogador`, ja que telas de trabalho escondem o header global. A validacao desktop/mobile cobriu jogador puro, administrador/gestor, professor, recepcao, financeiro, caixa/POS e organizador sem local; o QA encontrou e corrigiu no mesmo sprint o empty state contraditorio do organizador sem local. Evidencias em `docs/screenshots/role-mode-v2-2026-05-18/`. `npm.cmd run lint`, `npm.cmd run build` e `git diff --check` passaram na rodada, com apenas avisos de CRLF no diff check.

Nota 2026-05-17: foi aberta a frente `CTX-*` para reestruturacao contextual antes de novas alteracoes estruturais. A analise esta em `CONTEXTUAL_UX_RESTRUCTURE_ANALYSIS.md` e a `EXECUTION_QUEUE.md` agora prioriza feedback global, sistema de modais/sheets, sala de jogo contextual, central do jogador em torneios, perfil publico com anotacoes privadas, seletor persistido `Jogador/Trabalho`, turmas multi-dia e QA cruzado web/mobile. A regra desta frente e preservar funcionalidades atuais, reduzir quebra de contexto e separar explicitamente experiencia de jogador da experiencia de trabalho/gestao.

Nota 2026-05-17: `CTX-FEEDBACK-01` foi concluido. O app agora possui `ToastProvider` global montado no shell raiz, com stack fixa em desktop/mobile e mensagens amigaveis para erros tecnicos. Foram migrados feedbacks locais criticos de torneio, liga, gestao de local/agenda/academia e pagina publica de local, incluindo reserva, lista de espera, interesse em aula e jogos abertos. `npm.cmd run lint` e `npm.cmd run build` passaram. A proxima prioridade e `CTX-MODAL-01`, para padronizar dialog/sheet/popover/formulario responsivo antes da sala de jogo contextual.

Nota 2026-05-17: `CTX-MODAL-01` entrou em andamento. Foram criados `AppDialog`, `AppSheet`, `AppPopover` e `FormDialogLayout` com contrato de Escape, retorno de foco, body scroll lock, safe area mobile, `dvh`, backdrop e action bar fixa. `EntityDrawer` agora reaproveita `AppSheet` e o sino de notificacoes usa `AppPopover`, reduzindo componentes paralelos de overlay. `npm.cmd run lint` e `npm.cmd run build` passaram. Ainda faltam migrar filtros mobile que duplicam children e usar a base na sala de jogo contextual.

Nota 2026-05-17: ainda em `CTX-MODAL-01`, `ResponsiveFilterSheet` foi ajustado para montar filtros inline apenas no desktop e dentro do sheet apenas no mobile. Isso evita estado duplicado em filtros responsivos e prepara a base para formularios/salas contextuais sem comportamento fantasma. `npm.cmd run lint` passou apos a mudanca; a validacao de screenshots fica para o fechamento de `CTX-MODAL-01` junto da primeira sala contextual.

Nota 2026-05-17: `CTX-MATCHROOM-01` entrou em andamento pela liga. A acao `Abrir sala` na aba `Partidas` agora abre uma sala contextual em `AppDialog`, sem expandir a lista nem deslocar o usuario na pagina. A sala manteve disponibilidade, placar, confirmacao, WO, participantes, contatos e mini chat. `npm.cmd run lint` e `npm.cmd run build` passaram. Falta replicar o mesmo padrao na sala/placar de torneio e gerar screenshots web/mobile da experiencia completa.

Nota 2026-05-17: `CTX-MODAL-01` foi concluido como base funcional. `ResponsiveFilterSheet`, notificacoes, drawers e salas contextuais ja usam o mesmo sistema de overlay (`AppDialog`/`AppSheet`/`AppPopover`). Em `CTX-MATCHROOM-01`, o torneio tambem passou a abrir `Informar resultado`/`Compartilhar placar` em dialog contextual, preservando o formulario de placar, WhatsApp e envio por RPC sem empilhar formulario dentro do card da partida. `npm.cmd run lint`, `npm.cmd run build` e `git diff --check` passaram. Ainda falta revisar entradas por Home/notificacao e gerar screenshots web/mobile da frente contextual completa.

Nota 2026-05-17: `CTX-TOURNAMENT-01` foi concluido. Na aba publica `Jogos` do torneio, a leitura do jogador agora prioriza `Sua central no torneio` antes da visao geral da classe, agenda por quadra e chave detalhada. Isso reduz a sensacao de duplicacao: a partida pessoal mostra apenas status/acoes imediatas e abre placar em sala contextual; a chave completa permanece abaixo como consulta. `npm.cmd run lint`, `npm.cmd run build` e `git diff --check` passaram.

Nota 2026-05-17: `CTX-TOURNAMENT-02` foi concluido. O CTA publico `Ver meus jogos` agora leva para `Jogos` com foco real na central do jogador, seleciona a classe da proxima partida e, quando existe uma unica pendencia, abre a sala contextual automaticamente. O seletor de classe do torneio segue o padrao contextual ja usado na liga: chips ate 6 classes e select unico para muitas classes, sem duplicar controles equivalentes. `npm.cmd run lint`, `npm.cmd run build` e `git diff --check` passaram.

Nota 2026-05-17: `CTX-PLAYER-01` e `CTX-SCOUT-01` foram concluidos. Jogadores com `userId` real agora sao navegaveis por `/jogadores/:playerId` em rankings, ligas e torneios, sem transformar nomes manuais/wildcards em links falsos. O perfil ganhou visibilidade `public/private`: quando privado, dados pessoais e vitrine publica ficam ocultos para terceiros, mas resumo competitivo, rankings e confronto direto permanecem visiveis por serem informacoes do contexto esportivo compartilhado. Foi criada `player_private_notes` com RLS owner-only para scouting pessoal privado com autosave. `npm.cmd run lint` e `npm.cmd run build` passaram.

Nota 2026-05-17: `CTX-MODE-01` foi concluido. O app agora tem contexto persistido `Jogador/Trabalho` para usuarios multi-papel. O seletor aparece no shell apenas quando ha acesso profissional; o modo jogador mantem navegação de atleta limpa e o modo trabalho troca o menu para gestao/organizacao permitida. Rotas diretas continuam respeitando permissoes. `npm.cmd run lint` e `npm.cmd run build` passaram.

Nota 2026-05-17: `CTX-ACADEMY-01` foi concluido. Turmas de academia agora podem ser criadas em multiplos dias no mesmo horario. A modelagem preserva ocorrencias reais em `place_academy_classes`, ligadas por `recurrence_group_id`, para nao quebrar chamada, agenda, conflitos, alunos e mensalidade. O formulario de montagem usa chips de dias e a validacao de professor/quadra considera todos os dias selecionados. Horarios abertos tambem aceitam criacao em lote por dias. `npm.cmd run lint` e `npm.cmd run build` passaram.

Nota 2026-05-17: `SCREEN-LEAGUE-01` foi concluido. A home publica da liga foi validada com jogador autenticado em desktop e mobile: nao ha aba `Classes`, nao ha card grande de inscricao aprovada, nao aparecem ferramentas administrativas e a classe permanece como filtro contextual nas abas que precisam. A rota legada `?tab=classes` cai em `Classificacao`. Evidencias em `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-league-home-player.png`, `mobile390-league-home-player.png` e `screen-league-01-validation.json`. A base atual tem ligas com 3 classes; o caso 10+ classes segue coberto por regra de componente, mas sem massa real para screenshot.

Nota 2026-05-17: `SCREEN-LEAGUE-02` foi concluido. A aba publica `Jogadores` da liga agora combina seletor contextual de classe com busca por nome/classe. Jogador autenticado ve apenas leitura publica da lista, sem convite, aprovacao, rejeicao ou acao financeira; organizador ve convite, solicitacoes e pagamentos no workspace proprio. Evidencias em `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-league-jogadores-player.png`, `mobile390-league-jogadores-player.png`, `desktop1366-league-jogadores-admin.png`, `mobile390-league-jogadores-admin.png` e `screen-league-02-validation.json`.

Nota 2026-05-17: `PLAYER-LOCATIONS-DNA-01` e `QA-DNA-01` foram concluidos. A auditoria visual carregada gerou screenshots desktop 1366 e mobile 390 em `web/docs/screenshots/qa-dna-2026-05-17/` e relatorio em `QA_DNA_01_VISUAL_AUDIT_2026_05_17.md`. O principal achado P1 foi corrigido no mesmo sprint: `PlacesPage` agora sincroniza `intent` por `useSearchParams`, `location.search` e fallback do hash, entao entradas diretas como `#/locais?intent=booking`, `classes`, `matches` e `venues` abrem a experiencia correta sem cair no hub neutro. A auditoria nao encontrou P0 visual bloqueador.

Nota 2026-05-17: `MANAGEMENT-DNA-01` foi concluido. A central de gestao continua priorizando `Fila do dia`, mas `Locais sob sua gestao` agora deixa de empilhar todos os workspaces de uma vez: os locais sao ordenados por pendencias, setup menos completo e nome, a primeira leitura mostra ate 4 locais em foco e um CTA permite expandir todos. Setup/implantacao segue recolhido e permissoes por papel foram preservadas. Lint, build e `git diff --check` passaram.

Nota 2026-05-17: `COMP-LEAGUE-DNA-01` foi concluido. A pagina publica da liga manteve abas reais por intencao (`Liga`, `Jogadores`, `Classificacao`, `Partidas`, `Chat`) e o workspace do organizador continua concentrando convite, pagamentos, aprovacoes, configuracao e comunicacao admin. O filtro de classe agora segue o mesmo padrao do torneio: chips para ate 6 classes e select unico quando houver muitas classes. A aba `Partidas` passou a aplicar o recorte de classe aos jogos exibidos, somando classe, rodada e status. Lint, build e `git diff --check` passaram.

Nota 2026-05-17: `COMP-PUBLIC-DNA-01` foi concluido. A pagina publica de torneio mantem abas reais para `Evento`, `Inscritos`, `Jogos`, `Classificacao` quando aplicavel e `Chat` quando permitido; `Categorias` nao e aba publica independente. O filtro de classe agora usa um unico controle contextual: chips para ate 6 classes e select para muitas classes. Podio fica em `Evento` apenas apos finalizacao, exportacao de chave aparece quando ha chaveamento e ferramentas de organizador permanecem no workspace proprio. Lint, build e `git diff --check` passaram.

Nota 2026-05-17: `PUBLIC-PLACE-DNA-01` foi concluido. A pagina publica do local usa rotas irmas para `Reserva`, `Aulas`, `Jogos`, `Planos` e `Sobre`, com o header compacto preservado e conteudo focado por intencao. A troca de aba reposiciona o topo para evitar sensacao de ancora em pagina gigante. Planos e quadras ficaram acionaveis: plano direciona para aulas/reserva com contexto e quadra abre a agenda daquela quadra. Lint, build e `git diff --check` passaram.

Nota 2026-05-17: `PLAYER-MATCHES-DNA-01` foi concluido. O fluxo `/locais?intent=matches` agora usa filtro coerente com os demais caminhos do Player App: UF, cidade e local derivados de locais cadastrados com jogos, alem de data, periodo, nivel, mensagem e status. O grid desktop usa areas nomeadas para evitar campos encavalados e o mobile recolhe filtros como nos fluxos de quadra/aula. Criar chamada fica como alternativa secundaria. Lint, build e `git diff --check` passaram.

Nota 2026-05-17: `PLAYER-CLASSES-DNA-01` foi concluido. A pagina publica do local em `Aulas` agora mantem turmas recorrentes agrupadas e permite selecionar um ou mais dias especificos antes de enviar interesse. O envio fica vinculado ao perfil logado, evita solicitacoes duplicadas para dias ja pendentes/ativos e mostra status por dia (`Interesse enviado`/`Matricula ativa`) logo apos o envio. O filtro publico de aulas recebeu grid por areas para desktop e continua responsivo no mobile. Lint, build e `git diff --check` passaram.

Nota 2026-05-17: `PLAYER-BOOKING-DNA-01` foi concluido. O fluxo publico de reserva em `/locais?intent=booking` agora tem grid de filtros por areas para evitar sobreposicao em desktop e colapsa corretamente no mobile; duracao foi normalizada para 1h/2h, sempre com horas cheias, e os resultados exibem preco total conforme a duracao. A pagina publica do local preserva o carrossel de quadras por hora, mostra intervalo de 2h como selecionado/bloqueado e confirma a reserva vinculada ao perfil logado, com status pendente para aprovacao em `Gestao > Agenda`. Lint, build e `git diff --check` passaram.

Nota 2026-05-17: `SCREEN-COMP-HUB-01` entrou em entrega parcial. O hub `/eventos` agora separa a intencao principal em `Jogando`, `Descobrir` e `Organizando`, mantendo a organizacao visivel apenas para usuarios com contexto profissional ou rota explicita. A descoberta usa torneios publicos, remove itens em que o usuario ja joga/organiza, prioriza cidade do perfil, depois estado e depois destaques gerais, e exibe resultados em trilho curto/carrossel para nao transformar o mobile em lista longa de cards. Lint, build e `git diff --check` passaram; falta captura autenticada desktop/mobile para fechar como `[x]`.

Nota 2026-05-17: `SCREEN-TOURNAMENT-01` entrou em entrega parcial. A aba publica `Evento` do torneio preserva resumo, status, CTA principal, exportacao de chave quando ha chaveamento e podio apenas apos torneio finalizado. O status pessoal do jogador foi reduzido a chip discreto no hero, evitando o card grande de inscricao aprovada que poluia a leitura. Lint, build e `git diff --check` passaram; falta validacao visual autenticada e teste real de exportacao.

Nota 2026-05-17: `SCREEN-TOURNAMENT-01` foi concluido. A validacao autenticada em desktop/mobile confirmou que a aba `Evento` do torneio publico mostra apenas leitura de jogador (`Evento`, `Inscritos`, `Jogos`), sem aba `Categorias`, sem ferramentas de organizador e sem podio antes do fim do torneio. O botao `Exportar chave` aparece quando ha chaveamento e foi exercitado no browser com feedback de sucesso. Evidencias em `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-tournament-event-player.png`, `mobile390-tournament-event-player.png`, `desktop1366-tournament-event-player-after-export.png` e `screen-tournament-01-validation.json`.

Nota 2026-05-17: `SCREEN-TOURNAMENT-02` entrou em entrega parcial. A aba publica `Inscritos` agora combina participantes da chave com inscricoes aprovadas do banco, possui busca por nome, contagem por classe e trilho de chips horizontal alem do select, mantendo contatos e ferramentas administrativas fora da visao publica. Lint, build e `git diff --check` passaram; falta validacao autenticada com torneio real e muitas classes.

Nota 2026-05-17: `SCREEN-TOURNAMENT-02` foi concluido. A validacao autenticada em desktop/mobile confirmou que a rota direta `#/eventos/{id}/jogadores` abre a aba publica `Inscritos`, lista 23 jogadores na Classe A, preserva busca e filtro de classe, nao mostra aba `Categorias`, ferramentas administrativas, contatos ou pagamentos e corrigiu o rotulo duplicado `Grupo Grupo`. Evidencias em `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-tournament-inscritos-player.png`, `mobile390-tournament-inscritos-player.png` e `screen-tournament-02-validation.json`.

Nota 2026-05-17: `SCREEN-TOURNAMENT-03` entrou em entrega parcial. A aba publica `Jogos` agora tem resumo por classe/fase com jogadores, status e horario/quadra em microcopy curta; quando nao ha chave, usa empty state compacto. No mobile publico, a lista passa a ser a primeira camada e a chave longa fica fora da leitura principal, com `Exportar chave` como acao secundaria. Lint e build passaram; falta validacao visual autenticada para fechar.

Nota 2026-05-17: `SCREEN-TOURNAMENT-03` foi concluido. A validacao autenticada em desktop/mobile confirmou que a aba publica `Jogos` abre sem `Categorias` e sem ferramentas administrativas, mostra 11 jogos resumidos por fase/classe antes da chave detalhada, preserva microcopy de horario/quadra e deixa `Exportar chave` como acao secundaria quando existe chaveamento. Evidencias em `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-tournament-jogos-player.png`, `mobile390-tournament-jogos-player.png` e `screen-tournament-03-validation.json`.

Nota 2026-05-17: `SCREEN-TOURNAMENT-04` entrou em entrega parcial. A aba publica `Classificacao` agora so aparece quando existe tabela real publicada em `tabelaPorGrupo`; torneios mata-mata simples ou sem tabela deixam de exibir uma aba vazia. Se uma classe sem tabela estiver ativa, a leitura publica usa a primeira classe com tabela disponivel e fallback compacto. Lint e build passaram; falta validacao visual autenticada.

Nota 2026-05-17: `SCREEN-TOURNAMENT-04` foi concluido. Em torneio mata-mata puro, a validacao autenticada confirmou que `Classificacao` nao aparece na navegacao publica em desktop/mobile. A rota direta `#/eventos/{id}/classificacao` agora normaliza para `#/eventos/{id}/jogos` quando nao ha tabela publica, evitando tela vazia ou mensagem tecnica de tabela ausente. Evidencias em `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-tournament-classificacao-player.png`, `mobile390-tournament-classificacao-player.png` e `screen-tournament-04-validation.json`.

Nota 2026-05-17: `SCREEN-TOURNAMENT-05` foi concluido. A validacao autenticada confirmou que jogador sem permissao de chat nao ve aba `Chat` e acesso direto a `/chat` normaliza para `Jogos`; admin abre a aba `Chat` com card proprio, mensagem fixada e ferramentas de publicar/fixar/remover aviso sem misturar jogadores ou partidas no conteudo. Evidencias em `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-tournament-chat-player.png`, `mobile390-tournament-chat-player.png`, `desktop1366-tournament-chat-admin.png`, `mobile390-tournament-chat-admin.png` e `screen-tournament-05-validation.json`.

Nota 2026-05-17: `SCREEN-TOURNAMENT-ORG-01` foi concluido. O workspace de organizador foi validado em torneios `draft`, `live` e `finished`, com mapa de trabalho para visao geral, inscricoes, categorias, jogos/agenda, resultados, comunicacao e configuracao. Atalhos de rota navegam corretamente e `Categorias`/`Configuracao` agora abrem uma subcamada real de organizacao tambem em torneios live/finished, sem expor controles internos ao jogador. Evidencias em `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-tournament-org-draft-admin.png`, `desktop1366-tournament-org-live-admin.png`, `desktop1366-tournament-org-finished-admin.png`, `mobile390-tournament-org-live-admin.png` e `screen-tournament-org-01-validation.json`.

Nota 2026-05-17: `SCREEN-LOCAL-01` foi concluido. A home publica do local foi validada autenticada em desktop e mobile como vitrine objetiva: hero, atalhos e resumo curto, sem renderizar formularios completos de reserva, aulas, jogos ou planos. Os atalhos navegam para rotas irmas focadas (`/reserva`, `/aulas`, `/jogos`, `/planos`, `/sobre`), preservando conteudo operacional fora da primeira leitura. Evidencias em `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-local-home-validated.png`, `mobile390-local-home-validated.png` e `screen-local-01-validation.json`.

Nota 2026-05-17: `SCREEN-LOCAL-02` foi concluido. A rota publica `/locais/:placeId/reserva` foi validada em desktop/mobile como tela focada de reserva, sem empilhar aulas, jogos ou planos. A reserva de 2h foi exercitada ponta a ponta: o calendario por quadra marca a hora inicial como `2h`, a hora seguinte como `Incluido`, calcula total proporcional e grava `court_bookings` pendente com intervalo real de duas horas; na gestao, a reserva aparece em `Agenda > Reservas` ao filtrar pelo jogador para confirmacao/cancelamento.

Nota 2026-05-16: `PLAYER-QA-POLISH-01`, `PLAYER-QA-POLISH-02` e `PLAYER-QA-POLISH-03` foram concluidos. A rodada fez polimento transversal de qualidade percebida no Player App: textos visiveis foram ajustados sem alterar tokens internos de rotas/abas/status, `Perfil > Preferencias` deixou de exibir linguagem tecnica, a acao destrutiva de conta ficou isolada, carregamentos principais passaram a usar `ScreenState` contextual, `Seguir` no Ranking deixou de competir com CTA primario, acoes de partida no mobile ganharam alvo/estilo mais confortavel, o contexto `Jogador` deixou de parecer seletor clicavel e paginas publicas de torneio/liga ganharam retorno/contexto mais claro para acesso por link ou notificacao. Lint e build passaram.

Nota 2026-05-16: `COMP-COURTS-02` fechou o elo operacional entre Competition OS e Agenda. Torneios com quadras cadastradas sincronizam a agenda gerada com `court_bookings`: se o organizador administra o local, o bloqueio nasce automaticamente como `blocked`; se nao administra, a academia recebe uma solicitacao acionavel em `Gestao > Agenda` para autorizar/bloquear ou recusar. O setup do torneio mostra status por local para o organizador revisar agenda quando houver recusa ou conflito.

Nota 2026-05-16: `COMP-ORG-01` aplicou ao workspace do organizador a mesma limpeza ja usada nas paginas publicas. Torneio owner/staff agora concentra fila, publicacao, agenda por quadra, exportacoes, reset, backup e encerramento em `Organizacao`; `Jogos` fica focado em chave/partidas e revisao de resultados enviados por jogadores. Liga owner agora separa `Rodada`, `Jogadores`, `Classificacao`, `Partidas`, `Chat` e `Configuracao`, com seletor de temporada/classe apenas nas abas que realmente usam esse recorte.

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
- `WHOLE_APP_ROLE_DESIGN_AUDIT_2026_05_14.md`
- `ROLE_BASED_RESTRUCTURE_PLAYBOOK.md`
- `ROLE_BASED_RESTRUCTURE_QUEUE.md`
- `ROLE_VISIBILITY_MATRIX.md`
- `ROLE_BASED_RESTRUCTURE_TASK_SPECS.md`
- `ROLE_BASED_RESTRUCTURE_IMPLEMENTATION_SPEC.md`
- `RESTRUCTURE_SOURCE_OF_TRUTH_POLICY.md`
- `ROLE_BASED_RESTRUCTURE_SPRINT_GUIDE.md`
- `ROLE_BASED_RESTRUCTURE_SPRINT_BACKLOG.md`
- `PLAYER_APP_V2_UX_PLAN.md`
- `PLAYER_APP_V2_IMPLEMENTATION_SPEC.md`
- `COMPETITION_OS_V2_UX_PLAN.md`
- `COMPETITION_OS_V2_IMPLEMENTATION_SPEC.md`
- `MANAGEMENT_OS_V2_UX_PLAN.md`
- `MANAGEMENT_OS_V2_IMPLEMENTATION_SPEC.md`
- `PLAYER_POLISH_QA_2026_05_16.md`

Data: 2026-05-16

## Para que este arquivo existe

Este arquivo e a memoria curta do produto. Ele deve permitir que futuras tarefas comecem direto na execucao, sem reabrir toda a arquitetura conceitual.

Regra:

```text
Nao reanalisar a arquitetura do zero. Executar a fila com consistencia.
```

Regra adicional da reestruturacao v2:

```text
MDs antigos preservam inventario funcional. Specs v2 governam arquitetura, ordem de tela, densidade, visibilidade e comportamento mobile.
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

Atualizacao 2026-05-15:

- `COMP-COURTS-01` conectou o setup de torneio aos locais reais: a criacao de torneio e a configuracao de agenda de torneio ja criado agora permitem escolher quadras cadastradas em uma ou mais academias, preservando a entrada manual como fallback. A agenda salva `courtLinks` com `placeId/courtId` e usa label curto `Local · Quadra`, permitindo que jogador e organizador entendam onde a partida acontece sem bloco de texto. Bloqueio automatico/autorizacao de quadras de terceiros ficou registrado como `COMP-COURTS-02`, pois exige migration/RPC e fluxo de aprovacao na Agenda do local.
- `COMP-SCORE-03` corrigiu o envio de placar por jogador em torneios: `app_submit_tournament_match_result` deixou de falhar com `column reference "tournament_id" is ambiguous`, a migration `0090` foi aplicada no Supabase alvo e a UI passou a mostrar erro amigavel se o banco estiver desatualizado.
- a Home do Player App deixou de funcionar como painel empilhado: a primeira dobra agora escolhe CTA contextual pela ordem `resultado pendente > atividade nas proximas 24h > convite pendente > inscricao incompleta > competicao em andamento > descoberta local`;
- a secao pessoal foi renomeada para `Para voce` e so aparece quando existe dado real do usuario; empty states grandes de competicao foram removidos da Home principal;
- a descoberta publica passou a usar trilhos horizontais/carrosseis de eventos, priorizando cidade do usuario, depois estado/regiao e, por ultimo, destaques gerais;
- urgencias pessoais continuam aparecendo diretamente na primeira dobra ou no sino, sem serem jogadas para carrossel;
- acessos profissionais/gestao permanecem separados em `Acesso profissional`, sem contaminar a Home de jogador comum;
- a pagina publica de torneio tambem deixou de funcionar como pagina longa ancorada: `Evento`, `Inscritos`, `Jogos`, `Classificacao` e `Chat` agora renderizam apenas o conteudo da intencao selecionada; `Categorias` deixou de ser aba propria e virou seletor contextual unico nas areas que precisam de classe; inscritos usam a chave publica da classe, `Classificacao` so aparece publicamente quando ha fase de grupos, e `Encerramento / Podio por classe` fica na aba `Evento` apenas apos o torneio finalizar;
- a pagina publica de liga deixou de funcionar como pagina longa ancorada: `Liga`, `Jogadores`, `Classificacao`, `Partidas` e `Chat` agora renderizam apenas o conteudo da intencao selecionada; classe virou filtro contextual no topo de Jogadores/Classificacao/Partidas, com menu publico arrastavel no mobile;
- o sino de notificacoes do Player App deixou de abrir uma secao inline na Home: agora usa popover ancorado ao sino no desktop e bottom sheet com backdrop no mobile;
- o fluxo Player de reservar quadra em `/locais?intent=booking` agora usa filtro guiado por UF, cidade, local, piso, data, hora e duracao;
- o fluxo Player de encontrar jogo em `/locais?intent=matches` tambem usa filtro guiado por UF, cidade e local com opcoes dependentes dos locais que possuem chamadas abertas, evitando campos livres que nao levam a resultado real;
- a pagina publica de local (`/locais/:placeId`) deixou de usar secoes ancoradas para `Reservar`, `Aulas`, `Jogos` e `Planos`: cada card troca a intencao e renderiza apenas a experiencia escolhida;
- dentro do local, `Reservar` agora usa dia/duracao e um carrossel de quadras com horarios hora a hora, exibindo slots livres, ocupados e o intervalo completo selecionado antes da confirmacao;
- UF/cidade/local sao derivados de locais com quadras ativas, reduzindo escolhas que nao levam a reserva real;
- a busca de reserva aceita qualquer horario, periodo do dia e horas cheias, retornando a primeira disponibilidade por quadra;
- o piso da quadra passou a ser dado operacional tambem no cadastro de quadra da gestao;
- a reserva publica fica vinculada ao perfil logado; nome/contato deixam de parecer cadastro duplicado e telefone so aparece como complemento quando o perfil nao tem contato;
- solicitacoes publicas de reserva continuam entrando como pendentes em `court_bookings` via `createCourtBooking`/RPC e devem ser aprovadas pela gestao em `Gestao > Agenda > Reservas pendentes`.
- `PLAYER-UX-03D` fechou o fluxo visual de reserva dentro do local: o jogador escolhe dia, duracao e slot no calendario por quadra, confirma com identidade do perfil e nao atravessa conteudos de aulas, jogos ou planos durante a reserva.
- o fluxo Player de entrar em aula em `/locais?intent=classes` agora usa filtro guiado por UF/cidade, sugestoes de local/professor, periodo, nivel, perfil e dias da semana em multi-select; resultados agrupam turmas recorrentes equivalentes e enviam os dias selecionaveis para a pagina publica do local via `classIds`, onde o aluno confirma o interesse.
- na pagina publica do local, o envio de interesse em aula agora mostra resumo curto da turma/dias escolhidos, confirma o perfil logado, pede WhatsApp somente se o perfil nao tiver telefone e retorna status `Aguardando retorno da academia`; a aprovacao/calendario pessoal ainda precisa de validacao ponta a ponta no ambiente autenticado.
- o fluxo Player de encontrar jogo em `/locais?intent=matches` manteve filtros dependentes por UF/cidade/local, recebeu ajuste de grid para evitar campos encavalados e passou a tratar `Criar chamada` como alternativa secundaria ou empty state, preservando o CTA principal `Quero jogar` nos resultados.

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

1. Player App v2: home por proxima acao, locais, reserva, aulas, jogar, ranking e perfil.
2. Competition OS v2: separar jogador, publico, setup e operacao.
3. Management OS v2: gestao por papel, fila antes de KPI, professor leve.
4. Agenda e Academia como rotinas operacionais maduras.
5. Financeiro, CRM e Cantina como filas/acesso por permissao.
6. Paginas publicas sem vazamento de cockpit.
7. QA por papel e auditoria visual contra o playbook.

## Atualizacoes recentes de QA

- 2026-05-14: Rodada 2 de QA operacional corrigiu bloqueios de confianca em Agenda/Painel: calendario mobile agora mantem todas as quadras acessiveis por seletor, busca de disponibilidade de nova reserva usa feedback inline em vez de banner global persistente, campo Duracao ficou responsivo, recebiveis pendentes da fila levam para `Financeiro > Recebiveis` e Cantina deixa de aparecer como KPI operacional quando o plano nao habilita o modulo.
- 2026-05-15: auditoria autenticada por papel consolidou a necessidade de uma reestruturacao por relacao/intencao. Foram criados `WHOLE_APP_ROLE_DESIGN_AUDIT_2026_05_14.md`, `ROLE_BASED_RESTRUCTURE_PLAYBOOK.md`, `PLAYER_APP_V2_UX_PLAN.md`, `COMPETITION_OS_V2_UX_PLAN.md`, `MANAGEMENT_OS_V2_UX_PLAN.md`, `ROLE_BASED_RESTRUCTURE_QUEUE.md`, `ROLE_BASED_RESTRUCTURE_SPRINT_GUIDE.md` e `ROLE_BASED_RESTRUCTURE_SPRINT_BACKLOG.md`.
- 2026-05-15: `ROLE-UX-00` concluido. A matriz operacional de visibilidade por relacao foi consolidada em `ROLE_VISIBILITY_MATRIX.md`, o helper `web/src/lib/role-visibility.ts` centralizou a decisao de superficie global e `BottomNav.tsx` passou a consumir essa politica. A queue agora segue para `ROLE-UX-01`, separando shells por modo sem reabrir a arquitetura.
- 2026-05-15: `ROLE-UX-01` concluido. `AppShell` agora aplica modo por superficie, `BottomNav` usa entrada profissional contextual (`Trabalho`, `Organizar` ou `Gestao`) e labels tecnicos foram removidos do frontend visivel. A queue segue para `DESIGN-UX-00`, padronizando densidade visual por modo.
- 2026-05-15: `DESIGN-UX-00` concluido. `theme.css` recebeu tokens de densidade por modo, `App.css` aplica `--mode-*` em base compartilhada e `DESIGN_TOKENS.md`/`COMPONENT_GRAMMAR.md` agora especificam Player leve, Competition hibrido e Management denso. A queue segue para `PLAYER-UX-01`, redesenhando `/inicio` por proxima acao.
- 2026-05-15: `PLAYER-UX-01` concluido. `/inicio` agora prioriza proxima acao do jogador, remove cards passivos sem dado util e deixa `Trabalho` como area discreta para multi-papel. A queue segue para `PLAYER-UX-02`, reorganizando `/locais` por intencao compacta.
- 2026-05-15: `PLAYER-UX-02` concluido. `/locais` agora inicia por intencao compacta, com entradas para jogo, reserva, aula e lista de locais; Home navega para a intencao correta; `Seguindo` e `Meus locais` filtram de fato. A queue segue para `PLAYER-UX-03`, reserva mobile fluida.
- 2026-05-15: `PLAYER-UX-03` concluido. A pagina publica do local agora oferece reserva em 3 passos visiveis, mostra apenas horarios livres, preserva ajuste manual curto, solicita reserva via backend existente e oferece lista de espera real quando nao ha disponibilidade.
- 2026-05-15: `PLAYER-UX-04` concluido. `/locais?intent=classes` e a pagina publica do local agora tratam aula como fluxo de jogador: perfil da aula, turma com vaga e envio de interesse via backend existente, sem lista/formulario duplicados.
- 2026-05-15: `COMP-UX-01` concluido. `/eventos` agora usa modo ativo `Jogando`, `Organizando` ou `Descobrir`, renderizando apenas a superficie correspondente; fila e criacao de competicao ficam em `Organizando`, e jogador nao recebe cockpit administrativo na primeira dobra. A queue segue para `COMP-UX-02`, evento publico mobile.
- 2026-05-15: `COMP-UX-02` concluido. Torneio e liga publicos agora iniciam como paginas de evento para jogador, com status, data/contexto, CTA contextual, categorias/classes em rail e CTA sticky mobile; KPIs, fila operacional e publicacao ficam fora da leitura publica e permanecem preservados para owner/staff. A queue segue para `COMP-UX-03`, inscricao em torneio/liga.
- 2026-05-15: `COMP-UX-03` concluido. Inscricao em torneio e liga agora usa fluxo curto de jogador: escolha de categoria/classe, confirmacao de dados, revisao de valor/prazo/restricao, status real da inscricao e mensagens de erro amigaveis. Liga publica e link de convite carregam a inscricao do usuario para evitar reenvio. A queue segue para `MGMT-UX-01`, shell operacional mobile.
- 2026-05-15: `COMP-SETUP-01` concluido. Criacao de torneio em `/eventos?view=organizing` agora usa wizard de 6 etapas (`Basico`, `Inscricoes`, `Categorias`, `Formato`, `Agenda`, `Revisar`) e salva rascunho estruturado com categorias/classes iniciais, agendaConfig, taxa/prazo de inscricao, cartaz, status inicial e permissao de resultado pelo jogador.
- 2026-05-15: `COMP-SETUP-02` concluido. Criacao de liga em `Ligas que organizo > Criar` agora usa wizard de 6 etapas e salva registro da liga, temporada inicial, classes, formato, pontuacao, taxa, entrada publica/aprovacao, agenda e status inicial. A queue segue para `COMP-OPS-01`, operacao de torneio em rows.
- 2026-05-15: `COMP-OPS-01` concluido. Torneio para owner/staff agora abre com fila operacional em rows e drawer/bottom sheet de detalhe para inscricoes, espera, pagamentos, geracao de jogos, agenda incompleta, resultados enviados e indisponibilidade. A leitura publica do jogador continua separada. A queue segue para `COMP-OPS-02`, operacao de liga em rodada atual.
- 2026-05-15: `COMP-OPS-02` concluido. Liga para owner agora abre com fila operacional em rows para inscricoes, pagamentos, partidas a organizar, resultado/WO, confirmacao/disputa e geracao de proxima rodada; jogador participante recebe somente `Minha rodada` quando tem partida pendente. A queue segue para `MGMT-AGENDA-01`, Agenda v2 polish.
- 2026-05-15: `MGMT-AGENDA-01` concluido. Agenda agora abre pela `Central de agenda` com fila urgente dentro do shell, `Hoje` em rows acionaveis, `Reservas` e `Espera` filtraveis sem limite silencioso, calendario com acao de criar reserva a partir de slot livre e nova reserva com bloqueio/espera visiveis no fluxo principal. A queue segue para `MGMT-ACADEMY-01`, continuidade da Academia v2.
- 2026-05-15: `MGMT-ACADEMY-01` concluido. Academia agora prioriza a `Central da academia` antes de indicadores, a fila rapida nao aparece nas abas `Hoje`/`Pendencias` para evitar duplicidade, e `Aulas do dia`/`Pendencias da academia` nao cortam itens silenciosamente: exibem restante, expandem ou levam para a fila completa. A queue segue para `MGMT-FINANCE-01`.
- 2026-05-15: `MGMT-FINANCE-01` concluido. Financeiro do local agora abre por `Recebiveis`, com vencidos/vence hoje, origem, periodo, valor, `Marcar pago` como acao primaria e `Enviar lembrete` como secundaria. A central ganhou aba `Pagos`, despesas sem corte silencioso e resumo como leitura secundaria. A queue segue para `MGMT-CRM-01`.
- 2026-05-15: `MGMT-CRM-01` concluido. Clientes/CRM agora abre por `Rotina`, separando follow-ups, leads novos e contatos parados em rows acionaveis; `Contatos` ganhou busca/filtros sem corte silencioso e drawer de contato para historico, responsavel, proximo contato, conversao e arquivamento. Cobranca saiu do CRM e permanece no Financeiro. A queue segue para `MGMT-TEAM-01`.
- 2026-05-15: `MGMT-TEAM-01` concluido. Equipe do local agora usa busca por nome/email, convite pendente e aceite explicito; convite pendente nao cria acesso nem libera `/gestao`, `app_claim_place_staff_invites()` virou no-op, Home lista convites de local para aceitar/recusar e professor so tem login vinculado depois do aceite. Relatorio em `MGMT_TEAM_01_REPORT_2026_05_15.md`. A queue segue para `PUBLIC-PLACE-01`.
- 2026-05-15: `PUBLIC-PLACE-01` concluido. `/locais/:placeId` agora e uma pagina publica orientada por conversao: hero com CTA contextual, rail de acoes em vez de KPIs, reserva/aula/jogos preservados como fluxos reais e kit de divulgacao restrito ao owner no fim da pagina. A queue segue para `PUBLIC-COMP-01`.
- 2026-05-15: `PUBLIC-COMP-01` concluido. Torneio e liga publicos agora usam topbar compacta, action rail de Categorias/Inscritos/Jogos, listas publicas de inscritos/jogadores sem contatos e controles internos escondidos do leitor publico; `CompetitionHeader`, filtro de escopo da liga e exportacao/copia de agenda ficam fora da experiencia publica. A queue segue para `MGMT-CANTEEN-01`.
- 2026-05-15: `MGMT-CANTEEN-01` concluido. Cantina/POS agora abre em `Venda rapida`, com produtos acionaveis, busca, venda avulsa, total estimado, estoque baixo como segunda rotina, vendas do dia em rows e catalogo sem corte silencioso. A feature `canteen` passou a ser propria de plano (`club_pro`/`multi_unit`) e nao derivada de Financeiro. A queue segue para `MGMT-SETTINGS-01`.
- 2026-05-15: `MGMT-SETTINGS-01` concluido. Ajustes do local agora e configuracao estrutural: checklist, dados publicos, recursos, regras, planos, permissoes e publicacao ficaram separados, com atalhos para os modulos donos da rotina e sem bloco legado duplicando plano/checklist abaixo do workspace. Nao ha novo item ativo de implementacao principal na queue.
- 2026-05-15: `QA-R2-GAP-03` concluido. Lista de espera player-side agora carrega nome real do local, aparece contextual na Home do jogador e abre diretamente `/locais/:placeId?intent=booking`; `QA-R2-ROADMAP` foi encerrado porque seus gaps foram absorvidos por `MGMT-FINANCE-01`, `ROLE-FINANCE-01`, `MGMT-CANTEEN-01`, `MGMT-SETTINGS-01` e esta correcao.
- 2026-05-15: `MGMT-UX-01` concluido. `/gestao` agora abre com fila operacional antes dos indicadores agregados; os numeros viraram `Sinais de suporte`, a fila do dashboard local respeita modulos permitidos e professor/recepcao deixam de herdar superficies empresariais que nao pertencem ao papel. A queue segue para `MGMT-UX-02`, modo professor.
- 2026-05-15: `MGMT-UX-02` concluido. Professor em Academia agora tem superficie propria com `Aulas`, `Turmas` e `Alunos`; turmas, alunos, chamada, reposicoes e resumo sao filtrados pelo `place_coaches.user_id` vinculado ao login; professor sem vinculo recebe estado vazio claro e nao herda turmas por nome. A queue segue para `QA-ROLE-01`, teste manual por papel.
- 2026-05-15: `QA-ROLE-01` concluido. Foi criado `QA_ROLE_01_ROLE_VISIBILITY_REPORT_2026_05_15.md` com screenshots/textos em `web/docs/screenshots/qa-role-2026-05-15/`. A separacao principal por papel foi validada em desktop/mobile e nenhum P0 novo apareceu. A queue segue para `MGMT-ROLE-QA-01`, corrigindo vazamento de setup para professor/recepcao; tambem foram adicionados `ROLE-FINANCE-01`, `QA-SEED-ROLE-01` e `MGMT-ROLE-QA-02`.
- 2026-05-15: `MGMT-ROLE-QA-01` concluido. A central `/gestao` agora calcula resumo e fila por papel: professor nao herda setup, financeiro, CRM, estoque, reservas ou pendencias globais do local; recepcao nao recebe setup estrutural nem financeiro/cantina; `Base incompleta` e setup profundo ficam restritos a gestor. Evidencias em `web/docs/screenshots/mgmt-role-qa-01-2026-05-15/` e relatorio em `MGMT_ROLE_QA_01_REPORT_2026_05_15.md`. A queue segue para `QA-DESIGN-01`.
- 2026-05-15: `QA-DESIGN-01` concluido. A auditoria visual autenticada gerou `QA_DESIGN_01_VISUAL_CONSISTENCY_REPORT_2026_05_15.md` e screenshots em `web/docs/screenshots/qa-design-01-2026-05-15/`. Foram corrigidos contadores zerados no Player App, badges `0` em Competicoes, vazamento do segmento `Organizando` para jogador puro e loading fragil de Gestao por dados opcionais. A queue segue para `ROLE-FINANCE-01`.
- 2026-05-15: `ROLE-FINANCE-01` concluido. Foi criado suporte real para `place_staff.role = finance`, com migration `0086_place_finance_staff_role_v1.sql`, seed `financeiro.prime@demo.atp.local`, central `/gestao` em modo financeiro isolado e equipe do local permitindo convidar/atribuir Financeiro. O papel acessa recebiveis, despesas, lembretes e baixas financeiras sem Agenda/Academia/CRM/Cantina/Equipe/Ajustes como superficies principais. Cantina/POS permanece fora desse papel ate existir operador de caixa dedicado. Relatorio em `ROLE_FINANCE_01_REPORT_2026_05_15.md`. A queue segue para `QA-SEED-ROLE-01`.
- 2026-05-15: `ROLE-CASHIER-01` concluido. Foi criado suporte real para `place_staff.role = cashier`, com migration `0088_place_cashier_staff_role_v1.sql`, helper `app_can_manage_place_canteen(...)`, policies POS e central `/gestao` em modo Caixa/POS isolado. O papel acessa venda rapida, vendas do dia, estoque e produtos da cantina quando o plano habilita `canteen`, sem Agenda/Academia/Clientes/Financeiro/Equipe/Ajustes como superficies principais. Seeds demo adicionam `caixa.prime@demo.atp.local` como caixa do Clube Racket Prime. Relatorio em `ROLE_CASHIER_01_REPORT_2026_05_15.md`.
- 2026-05-15: `QA-SEED-ROLE-01` concluido. O seed demo agora separa perfis puros de perfis operacionais: `qa.jogador.puro@demo.atp.local` foi criado sem vinculos, `organizador.circuito@demo.atp.local` deixou de ser `place_staff`, `financeiro.prime@demo.atp.local` permanece como `finance` e o verificador ganhou checks especificos para jogador puro, organizador puro, financeiro, aluno mensalista e coach solo. Relatorio em `QA_SEED_ROLE_01_REPORT_2026_05_15.md`. A queue segue para `MGMT-ROLE-QA-02`.
- 2026-05-15: `MGMT-ROLE-QA-02` concluido. `/gestao` acessada por usuario sem Management OS agora usa superficie visual de jogador: a navegacao global nao mostra `Gestao esportiva`, `Operacao` nem item `Gestao`, e o estado vazio fala `Area profissional indisponivel` em vez de cockpit operacional. Relatorio em `MGMT_ROLE_QA_02_REPORT_2026_05_15.md`. A queue segue para `PLAYER-UX-05`.
- 2026-05-15: Auditoria visual corrente refez os screenshots em `web/docs/screenshots/qa-current-2026-05-15/` e gerou `QA_CURRENT_VISUAL_EVOLUTION_REPORT_2026_05_15.md`. Resultado: Player App evoluiu em Inicio/Locais/Perfil e Management Hub carrega com espera longa, mas o Supabase alvo esta desalinhado com os seeds/migrations recentes (`qa.jogador.puro` e `caixa.prime` nao autenticam) e a Home do jogador exibe erro cru de RPC `app_list_my_place_staff_invites`. A Execution Queue agora prioriza `QA-CURRENT-P0-01` antes de novos polishes visuais.
- 2026-05-15: `QA-CURRENT-P0-01` concluido. O Supabase alvo de QA foi alinhado com roles/convites (`0086`, `0087`, `0088`, `0089`) e usuarios demo essenciais; `qa.jogador.puro`, `caixa.prime`, `financeiro.prime` e `organizador.circuito` autenticam. A Home nao exibe erro cru de `app_list_my_place_staff_invites`, jogador puro nao recebe caminho primario de gestao e caixa/POS ve apenas Cantina/POS em `/gestao`. Evidencias em `web/docs/screenshots/qa-current-p0-01-2026-05-15/` e relatorio em `QA_CURRENT_P0_01_REPORT_2026_05_15.md`. A queue segue para `QA-CURRENT-P1-01`, Ranking do Player App.
- 2026-05-17: `SCREEN-LOCAIS-07` concluido. O fluxo publico de interesse em aula foi validado ponta a ponta: jogador puro envia interesse, a Academia recebe como matricula pendente em `Pendencias`, admin ativa e a Home do jogador passa a refletir contexto de aula. O backend atual usa `place_academy_enrollments` pending/active como entidade de pedido/matricula; nao ha calendario separado do aluno, a agenda deriva da matricula ativa e horario da turma. Evidencias em `web/docs/screenshots/qa-dna-2026-05-17/screen-locais-07-*`.
- 2026-05-17: `SCREEN-LOCAIS-08` concluido. A busca de jogos em `/locais?intent=matches` foi validada no desktop e mobile com filtro UF/cidade/local/data/periodo/nivel/status sem sobreposicao; `Criar chamada` ficou como acao secundaria e os resultados seguem em cards compactos com CTA `Quero jogar`. Evidencias em `web/docs/screenshots/qa-dna-2026-05-17/screen-locais-08-validation.json`.
- 2026-05-15: `QA-CURRENT-P1-01` concluido. `/ranking` deixou de abrir como relatorio longo: primeira dobra agora foca em posicao pessoal, recorte e filtros essenciais; a lista inicial e progressiva com 12 jogadores e `Ver mais jogadores`; mobile 390px nao tem overflow horizontal e usa chips/rows compactas. Desktop e mobile validaram o mesmo recorte de 162 jogadores, sem erro bruto ou respostas HTTP >= 400. Evidencias em `web/docs/screenshots/qa-current-p1-01-2026-05-15/` e relatorio em `QA_CURRENT_P1_01_RANKING_REPORT_2026_05_15.md`. A queue segue para `QA-CURRENT-P1-02`, torneios organizados.
- 2026-05-15: `QA-CURRENT-P1-02` concluido. `/eventos/torneios?view=organizing` agora abre como lista operacional de torneios organizados: proximas acoes aparecem antes dos filtros, zeros foram removidos, indicadores viraram resumo compacto, filtros/lista completa ficam em disclosure e rows exibem status + acao primaria. Desktop 1366px e mobile 390px foram recapturados sem erro bruto, sem HTTP >= 400 e sem overflow. Evidencias em `web/docs/screenshots/qa-current-p1-02-2026-05-15/` e relatorio em `QA_CURRENT_P1_02_ORGANIZER_TOURNAMENTS_REPORT_2026_05_15.md`. A queue segue para `QA-CURRENT-P1-03`, auditoria 404/500 da Central de Gestao.
- 2026-05-15: `QA-CURRENT-P1-03` concluido. `/gestao` deixou de executar dados opcionais de suporte na primeira dobra (`app_payments` para `court_booking`, que gerava `57014 statement timeout`): `fetchPlacesWorkspaceData` agora aceita `includeSupportData` e a Central usa `false`. Gestor, professor, recepcao e financeiro foram validados em mobile 390px com 0 respostas HTTP >= 400 e sem erro bruto. Evidencias em `web/docs/screenshots/qa-current-p1-03-2026-05-15/` e relatorio em `QA_CURRENT_P1_03_MANAGEMENT_CONSOLE_REPORT_2026_05_15.md`. Nao ha novo item ativo na Execution Queue.
- 2026-05-15: `PLAYER-UX-04A` concluido. O fluxo `Entrar em aula` corrigiu o grid do filtro para nao cortar campos/CTA, agrupou turmas recorrentes equivalentes para escolha de um ou mais dias e deixou `/locais/:placeId?intent=academy` focado em aulas, sem misturar reserva, jogos, planos e quadras no corpo principal. O envio publico continua usando `createAcademyEnrollment` como solicitacao pendente por dia selecionado; contrato mensal completo segue no Management OS/Academia.
- 2026-05-15: `PLAYER-PLACE-03` concluido. Na pagina publica do local, `Aulas` agora sincroniza a turma escolhida com o filtro visivel, agrupa recorrencias por dados operacionais em vez do nome literal, exibe chips para selecionar um ou mais dias e informa que a aprovacao da academia ativa a matricula vinculada ao perfil em `Minhas aulas`. Na Home, cards de aula/reposicao abrem direto o local em `intent=academy` quando ha `placeId`.
- 2026-05-15: `PLAYER-PLACE-04` concluido. Na pagina publica do local, `Jogos abertos` ganhou filtros de data, periodo e nivel, contador filtrado e deixou de esconder chamadas com corte silencioso.
- 2026-05-15: `PLAYER-PLACE-05` concluido. Na pagina publica do local, planos e quadras deixaram de ser informacao passiva: plano abre `Aulas` com contexto do plano escolhido, e quadra abre `Reservar` com calendario carregado preferindo aquela quadra. Quantidade de aulas por plano ainda nao existe no schema.
- 2026-05-15: `PLAYER-PLACE-06` concluido. A reserva publica agora mostra visualmente todo o intervalo selecionado no calendario por quadra: em duracao de `2h`, a hora inicial fica selecionada e a hora seguinte aparece como parte da reserva, enquanto a confirmacao mostra inicio, fim e valor total proporcional.
- 2026-05-15: exportacao de agenda por quadra em torneios revisada. O PNG usa canvas com escala limitada para agendas altas, o download nao revoga o arquivo temporario imediatamente e, se o navegador falhar ao gerar PNG, o app exporta SVG como fallback com feedback claro.
- 2026-05-15: exportacao de chave de torneio revisada. O titulo agora tem margem superior suficiente, quebra em linhas quando fica longo e reposiciona a tabela lateral abaixo do cabecalho dinamico para evitar corte fora da imagem.

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
- Navegacao desktop ja agrupa entradas globais em Jogar, Trabalho e Conta, com contexto visual por modo.
- Muitos modulos de locais foram extraidos de `PlacesPage`.
- Competition OS iniciou padroes comuns com selector, fila, publishing e header.
- Competition OS ja recebeu base visual compartilhada: header compacto, escopo antes de numeros, fila em rows e publicacao secundaria.
- Mobile ja iniciou padrao concreto de bottom sheet com `ResponsiveFilterSheet` aplicado nos filtros de temporada/classe da liga.
- `EntityActionRow` ja saiu da documentacao e entrou em uso real em CRM e recebiveis financeiros do local.
- `/inicio` ja iniciou transicao para Player App orientado por proxima acao, com painel do dia e rows de pendencia/agenda/clube antes de conteudo secundario.
- Hierarquia de CTAs iniciou padrao real: `primary` para acao principal, `secondary` para acao alternativa com borda e `quiet` para suporte/atalhos.
- Tipografia principal ja iniciou padrao por tokens fixos, sem `font-size` fluido por viewport nas areas auditadas.
- Pagina publica do local ja foi consolidada como superficie publica/player: hero com CTA contextual, rail curto de reserva/aulas/jogos/planos, fluxos reais preservados e divulgacao/widget apenas para owner no fim da pagina.
- Criacao de reserva na Agenda usa formulario progressivo: campos essenciais no composer principal, `Buscar`/`Reservar` como acao primaria, `Bloquear horario`/`Entrar na espera` como acoes secundarias visiveis e observacao/repeticao em detalhe progressivo.
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
- `/gestao` e `/gestao/:placeId/academia` ja possuem entrada leve de professor para papel `coach`, priorizando aulas de hoje, turmas e alunos sem expor modulos empresariais ou pendencias de secretaria.
- `Minhas partidas` do torneio ja iniciou gramatica de row operacional: status/contexto e acao primaria ficam separados, e envio de resultado abre em disclosure progressivo.
- Partidas de grupos e mata-mata do torneio ja iniciaram estrutura row-like, com placar/WO/limpeza em disclosure progressivo.
- Lista de partidas da liga ja iniciou estrutura row operacional, alinhando `Minhas partidas` e partidas por rodada ao padrao do torneio.
- Sala de partida da liga ja separa estado/disponibilidade/resultado de participantes/chat, usando disclosures para areas secundarias.
- Lista de alunos da Academia ja usa `EntityActionRow`, com uma acao primaria por aluno e acoes secundarias em disclosure.
- Visual language premium foi documentada.
- `VISUAL_REFERENCE_SYSTEM.md`, `COMPONENT_GRAMMAR.md` e `DESIGN_TOKENS.md` foram criados.
- `/gestao` ja foi refinada para ocultar cards zerados e usar rows operacionais de local.
- `/gestao` ja recebeu refinamento mobile-first para header compacto, stats em trilho e atalhos de modulos sem empilhamento longo.
- `/gestao` agora demove os stats agregados para suporte depois da fila do dia, preservando a primeira dobra como rotina operacional.
- `placeManagementModules(...)` agora evita que professor herde `Painel`, Clientes, Financeiro ou Cantina; recepcao recebe apenas modulos operacionais compativeis com papel e plano.
- Academia em modo professor limita abas a `Aulas`, `Turmas` e `Alunos`; `Pendencias`, `Professores` e `Configuracao` ficam fora da superficie quando o professor nao tem gestao completa.
- `/locais` ja separa descoberta por intencao: encontrar jogadores, reservar quadra e entrar em aula; cards usam acao primaria contextual e secundarias em `Mais`.
- `/locais` ja iniciou filtros inteligentes por intencao: quadra filtra por cidade/data/hora/duracao e disponibilidade real, aulas filtram por cidade/dia/periodo/nivel/vagas, e jogadores filtram chamadas por cidade/data/periodo/nivel.
- `/locais` ja devolve quadras livres como resultado direto da busca de reserva, evitando abrir uma ficha completa de academia com planos/aulas quando a intencao e apenas reservar horario.
- `/locais` ja devolve turmas com vaga como resultado direto da busca de aula, evitando abrir uma ficha completa de academia quando a intencao e entrar em uma turma.
- Niveis de aula ja possuem taxonomia padrao: `Iniciante`, `Intermediario`, `Avancado`, `Primeira Classe` e `Profissional`.
- Pagina publica do local ja separa reserva e aulas em fluxos publicos: reserva usa quando/horario/confirmacao com lista de espera real, e aulas usam perfil/turma/envio de interesse sem duplicar lista ou expor configuracao de academia.
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
- `Academia v2 - Configuracao` ja possui data/dia explicitos, alternancia por quadra/professor, criacao de horario aberto, bloqueio/reabertura, acao `Criar turma` a partir de horario aberto e conflito visivel por recurso.
- Suporte backend minimo para Configuracao foi ajustado em `createPlaceAcademySlot(...)`, permitindo `coachId` opcional e `status` para janelas abertas ou bloqueios reais.
- `Academia v2 - QA` removeu o cabeçalho legado remanescente dentro do workspace, validou lint/build e ajustou o feedback do fluxo `horario aberto -> turma` para nao esconder sucesso parcial.
- `Academia v2 - Backend` agora tem RPC transacional `app_create_academy_class_from_slot(...)`: quando a turma nasce de horario aberto, o slot vira `assigned` e a turma e criada na mesma transacao, sem sucesso parcial.
- `Academia v2 - Backend` agora tambem tem RPC `app_admin_schedule_academy_makeup_credit(...)`: secretaria pode agendar um credito de reposicao de aluno especifico sem depender do login do aluno.
- `Academia v2 - Configuracao` agora trata `place_academy_slots` explicitamente como escala semanal recorrente: a data e apenas referencia para escolher o dia da semana, e as acoes comunicam `Janela semanal`/`Bloqueio semanal`.
- `Academia v2 - Professores` agora tem schema avancado real em `place_coaches` para especialidades, niveis atendidos, bio publica, observacoes internas e perfil publico ativo, sem poluir o cadastro rapido.
- Lacuna critica anterior resolvida: `Aluno` agora tem contrato/plano semanal canonico em `place_academy_student_contracts`, enquanto `place_academy_enrollments` fica como vinculo operacional por turma/horario.
- Lacuna anterior resolvida: ausencia avisada agora valida antecedencia minima da academia e gera credito de reposicao automatico quando a regra permitir.
- `Academia Student Contracts` iniciou a base real em `0079_academy_student_contracts_v1.sql`: contrato/plano semanal, `contract_id` nas matriculas, configuracao de antecedencia de reposicao, `source_absence_id` para creditos e target financeiro `academy_student_contract`.
- `Academia Student Contracts` ja entrou na UI de `Grade > Turma > Novo aluno`: secretaria cria contrato com email/login, plano semanal, mensalidade, inicio e horarios selecionados; `Alunos` agrega por contrato/usuario quando existe `contract_id`.
- `Academia Student Contracts` tambem virou alvo financeiro canonico: mensalidade, lembrete, recebiveis e receita usam `academy_student_contract` quando existe contrato, com fallback para `academy_enrollment` apenas em matriculas legadas.
- `Academia Reposicao Automatica` foi implementada em `0080_academy_absence_notice_credit_v1.sql`: ausencia avisada valida dia/antecedencia, gera credito por `source_absence_id` quando permitido e a regra fica editavel em `Configuracao > Quadras e horarios`.
- `Academia Seed QA` foi atualizado em `web/supabase/seeds/qa_demo`: o passo `04_academy.sql` cria contratos reais de aluno com planos 1x/2x/3x por semana, matriculas vinculadas, configuracao de reposicao e creditos por ausencia dentro/fora do prazo; o passo `05_bookings.sql` cria mensalidades por `academy_student_contract` com pagas, pendentes e atrasadas.
- `Seed QA Realista` agora tem plano formal em `SEED_QA_REALISTIC_POPULATE_PLAN.md`; `02_users.sql` cria personas de owner, platform admin, organizador, coach solo, staff e players com entitlements explicitos, incluindo jogadores `free_player`; `03_places.sql` vincula staff/professores com dados profissionais, especialidades, niveis e perfil publico; `04_academy.sql` cria grade real com 24/30/42 turmas, academias sem demandas de setup, contratos 1x/2x/3x, slots `assigned/open/blocked`, alunos com usuario, capacidade realista de 4 adultos/8 infantil, matriculas distribuidas sem ultrapassar capacidade, 24 semanas de chamada, creditos de reposicao e solicitacoes ligadas a creditos reais; `05_bookings.sql` cria reservas filtradas contra aulas/slots, espera baseada em horarios ocupados, partidas abertas vinculadas a locais e chamadas por cidade sem quadra definida; reservas pendentes ficaram restritas a solicitacoes recentes para triagem da manha, enquanto o backlog aparece resolvido; `06_finance.sql` adiciona pagamentos de aula avulsa e lembretes por origem; `07_tournaments.sql` cobre estados reais de torneio; `08_leagues.sql` cobre ligas simples, dupla fixa e ranking com rodadas, matchroom, disponibilidade, resultados, WO, analise admin, wildcard, ranking, pagamentos e lembretes finais; `10_verify_seed_integrity.sql` valida vinculos criticos do seed.
- `QA manual P0` foi tratado antes de retomar refinamentos: `app_set_tournament_registration_status(...)` voltou a ser o caminho unico para aprovar/rejeitar inscricoes e sincronizar participante, `tournament_registrations.updated_at` foi alinhado ao trigger existente, erros de API em inscricoes agora viram mensagem amigavel, e a Academia recebeu migration para remover referencias SQL ambiguas/indices ausentes que podiam expor erro bruto na UI.
- `Competition QA` recebeu ajuste no convite de equipe: nome selecionado fica separado de email no model/card, e o feedback deixa claro que convite pendente so libera acesso depois de aceite no app.

### Ainda fraco

- `PlacesPage` ainda concentra muita orquestracao e ainda influencia a sensacao de admin template.
- Admin de local ainda precisa evoluir nos modulos internos, mas o shell ja reduziu cockpit de cards.
- Academia v2 fechou os gaps backend imediatos da fila BE-01 a BE-04. Vigencia/bloqueio pontual por data para disponibilidade semanal permanece como gap futuro se QA real exigir.
- O seed split `qa_demo` agora cobre contratos, pagamentos, lembretes, ausencias, chamada historica, reposicoes, drop-ins, slots semanais, reservas sem conflito academico e perfis/papeis mais realistas; o arquivo monolitico `qa_full_demo_seed.sql` permanece legado e nao deve ser o caminho principal de QA da Academia v2.
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
- Cobrancas recorrentes em Financeiro ja ganharam rotina task-first: `Recebiveis` e a primeira aba, rows mostram vencimento/origem/periodo, `Marcar pago` e a acao primaria, e lembrete fica como acao secundaria ou lote.
- Auditoria de destino semantico foi iniciada em `SEMANTIC_FLOW_AUDIT.md`: quick action so conta como pronta quando abre a subvisao onde a tarefa pode ser concluida.
- `ACADEMY-QA-01` fechou friccoes manuais da Academia: `Aulas do dia` abre chamada, chamada tem feedback otimista, `Alunos` ganhou drawer de nova matricula, criacao de turma subiu para o topo da Grade, `Horarios abertos` virou acao clicavel e professor sem vinculo recebe estado vazio claro.

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
   - Player App nao deve renderizar badge/contador `0` em tiles de intencao ou acoes de descoberta.
   - Management OS pode mostrar zero apenas quando isso confirma estado operacional em dia; se nao ajuda a rotina, colapsar.
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
- `BottomNav` deixou de expor o label tecnico `Management OS` e agora usa entrada profissional contextual por modo.
- `ManagementHubPage` passou a diferenciar Player sem permissao de operador sem local; acesso direto a `/gestao` por jogador puro volta para Inicio/Locais publicos em vez de sugerir setup profissional.
- Restam riscos de API/dados detectados por screenshots, especialmente `500` em `place_academy_enrollments` e `app_payments`.
- `ROUTINE-02`: rows de local em Gestao passaram a sugerir acoes rapidas por intencao quando a base ja esta pronta.
- Agenda pode sugerir `Confirmar reservas`, `Chamar espera`, `Ver agenda` e `Criar reserva`, sempre abrindo a subvisao executavel.
- Academia pode sugerir `Resolver aulas` e `Fazer chamada` quando ha pendencias/aulas do dia.
- Academia v2 avancou para `Alunos`: busca/filtros fortes, `StudentDrawer`, edicao real de matricula, financeiro/presenca/evolucao/reposicoes no contexto do aluno e sem lista limitada silenciosamente.
- Academia v2 avancou para `Pendencias`: fila unica filtravel, WhatsApp secundario, CTA operacional por tipo e `FitDrawer` para busca de encaixe.
- Academia v2 avancou para `Hoje`: aulas do dia em rows e `LessonDrawer` para chamada rapida com presenca, falta, ausencia avisada e observacao curta.
- Academia v2 avancou para `Professores`: busca/filtros, `CoachDrawer`, edicao real de dados/status/comissao e login/turmas/agenda no contexto do professor.
- Academia v2 fechou `ACADEMY-FORM-01`: buscas, filtros e mini-formularios compactos dos modulos `PlaceAcademy*` agora usam placeholder util e `aria-label` quando nao ha label visual, preservando labels nos campos criticos de drawers.
- Clientes, Financeiro e Cantina ganharam atalhos contextuais para `Fazer follow-up`, `Cobrar pendentes`, `Repor estoque` e `Registrar venda`.
- Regra reforcada: quick action que nao abre a subvisao onde a tarefa termina nao esta pronta.
- `MGMT-ACADEMY-01`: Academia v2 agora coloca a central/subnav antes dos indicadores, restringe a fila rapida as abas onde ela serve como apoio e remove corte silencioso nessa fila com expansao/atalho para a fila completa.
- `SCREEN-GESTAO-ACADEMIA-01`: Central da academia ganhou faixa de prioridade na primeira dobra com aulas de hoje, pendencias, nova matricula e nova turma conforme permissao; filas de aulas/pendencias ficaram compactas e direcionam para a subvisao onde a tarefa termina.
- `SCREEN-GESTAO-CLIENTES-01`: Clientes/CRM agora abre por rotina de relacionamento, com retornos/leads prioritarios e CTA `Novo contato` antes da lista; contatos continuam em rows e detalhes/interacoes seguem no drawer.
- `SCREEN-GESTAO-FINANCEIRO-01`: Central financeira ganhou faixa de prioridade com recebiveis, vencidos, baixa e despesa; recebiveis seguem em rows com origem explicita e `Despesas` voltou a expor formulario real dentro do workspace.
- `SCREEN-GESTAO-CANTINA-01`: Cantina/POS ganhou primeira dobra operacional com venda rapida, estoque baixo, vendas do dia e produtos; o modulo segue condicionado ao plano/permissao e nao aparece como KPI operacional quando desativado.
- Validacao visual autenticada de Gestao modular: `SCREEN-GESTAO-ACADEMIA-01`, `SCREEN-GESTAO-CLIENTES-01`, `SCREEN-GESTAO-FINANCEIRO-01` e `SCREEN-GESTAO-CANTINA-01` passaram em desktop/mobile sem erro tecnico cru e sem overflow horizontal; evidencias em `desktop1366-gestao-academia-01-validated.png`, `mobile390-gestao-academia-01-validated.png`, `screen-gestao-academia-01-validation.json`, `desktop1366-gestao-clientes-01-validated.png`, `mobile390-gestao-clientes-01-validated.png`, `desktop1366-gestao-financeiro-01-validated.png`, `mobile390-gestao-financeiro-01-validated.png`, `desktop1366-gestao-cantina-01-validated.png`, `mobile390-gestao-cantina-01-validated.png` e `screen-gestao-clientes-financeiro-cantina-validation.json`.
- `MGMT-FINANCE-01`: Financeiro agora inicia na fila de cobranca, agrega pendencias de meses anteriores, permite baixa manual por row e deixa relatorio/resumo como suporte secundario.
- Proximo foco executavel: `MGMT-CRM-01`, Clientes/CRM como fila de relacionamento.

Sprint Player App executado em 2026-05-15:

- `COMP-SCORE-02`: torneios agora usam apresentacao de placar padronizada com a sala da liga em `Informar resultado`, `Lancar placar` e `Editar placar`; tie-break por set aparece como sublinha contextual e super tie-break segue o mesmo grid.
- `COMP-SCORE-01`: sala de partida da liga agora segue o padrao de placar do lancamento admin em torneios; cada set recebe games primeiro e abre tie-break quando o formato exige (`6/6`, `8/8` no pro set, `4/4` no Fast4).
- O envio/resolucao de resultado de liga calcula vencedor considerando tie-break por set e preserva o resumo detalhado, como `6/6(7/5)`, sem pedir campos extras quando o set nao exige.
- `PLAYER-UX-05`: `/locais` na intencao `Encontrar jogo` foi simplificada para busca e acao, sem painel de rede social.
- O painel removeu KPIs de comunidade da primeira dobra e passou a destacar chamadas encontradas, CTA `Criar chamada` e rows acionaveis.
- Comentarios e interesse foram preservados como detalhes secundarios, evitando perder funcao existente sem empurrar social para o fluxo principal.
- A lista de chamadas deixou de usar `slice(0, 6)` silencioso; resultados filtrados agora aparecem sem ocultacao implicita.
- `PLAYER-UX-06`: `/ranking` agora abre centrado na posicao do jogador, recorte atual, filtros e lista.
- KPIs globais, lider, corrida, mapa de classes, regras e exportacao foram movidos para uma area secundaria recolhida.
- No mobile, a lista do ranking vira rows compactas em vez de depender de tabela horizontal como experiencia primaria.
- `PLAYER-UX-07`: `/perfil` agora separa identidade, historico, preferencias e conta em abas leves.
- O perfil deixou de abrir como cockpit: historico do jogador aparece separado, estatisticas/conquistas ficam em disclosure e atalhos de organizador so aparecem em `Conta > Area profissional` quando existem.
- `COMP-SETUP-01`: criacao de torneio agora usa wizard de setup e persiste estrutura inicial real.
- `COMP-SETUP-02`: criacao de liga agora usa wizard de setup em 6 etapas e persiste temporada, classes, formato, pontuacao, agenda e status inicial.
- `COMP-OPS-01`: operacao de torneio agora usa rows/filas/drawers para organizador, com acoes reais e sem duplicar alerta de indisponibilidade.
- `COMP-OPS-02`: operacao de liga agora usa rows/filas/drawers para rodada atual, inscricoes, pagamentos, resultado/WO, confirmacao/disputa e proxima rodada.
- `MGMT-FINANCE-01`: Financeiro por cobranca concluido; proxima etapa e CRM como rotina de relacionamento.
- Proximo foco executavel: `MGMT-CRM-01`, Clientes/CRM como fila de relacionamento.

Sprint APP DNA executado em 2026-05-17:

- `APP-DNA-01` concluido. Foi criada a base `AppPrimitives` com `PageHeader`, `ActionPanel`, `ObjectRow`, `DiscoveryCarousel`, `CompactEmptyState`, `ScopeSelector` e `PrimaryAction`.
- `App.css` recebeu estilos compartilhados para esses primitives, com comportamento mobile.
- `/inicio` passou a usar `ActionPanel` para a proxima acao contextual, `ObjectRow` para acoes pessoais e `DiscoveryCarousel` para descoberta, reduzindo a leitura de dashboard.
- O sino de notificacoes recebeu semantica de dialog, `aria-controls` e fechamento por `Escape`, preservando o popover/sheet atual.
- Validacao: `npm.cmd run lint` e `npm.cmd run build` passaram.
- Screenshots headless foram tentados em `web/docs/screenshots/sprint-2026-05-17-app-dna-01/`; a sessao autenticada ficou bloqueada no gate de login do ambiente headless, entao a validacao visual autenticada deve ser refeita manualmente ou com Playwright instalado.
- Proximo foco executavel: `PLAYER-LOCATIONS-DNA-01` / `SCREEN-LOCAIS-01`, separando Locais por intencao.

Sprint Locais DNA iniciado em 2026-05-17:

- `SCREEN-LOCAIS-01` concluido. `/locais` sem `intent` agora e um hub de intencao limpo, com quatro caminhos: `Encontrar jogo`, `Reservar quadra`, `Entrar em aula` e `Ver locais`.
- O bloco redundante de orientacao abaixo do hub foi removido; a tela neutra nao mostra filtros antes da escolha.
- As telas com intent ativa usam um seletor compacto horizontal (`places-intent-strip`) para trocar de caminho sem repetir o painel grande de descoberta.
- As tabs `Todos`, `Seguindo` e `Meus locais` ficaram restritas a `Ver locais`, evitando aparecerem nos fluxos de reserva/aulas.
- Validacao: `npm.cmd run lint` e `npm.cmd run build` passaram.
- Proximo foco executavel: `SCREEN-LOCAIS-02`, corrigindo filtro inicial de reserva com campos dependentes, layout robusto e comportamento mobile.
- `SCREEN-LOCAIS-02` recebeu primeira entrega parcial: defaults neutros, inputs/selects com largura normalizada, botao de busca como lupa e filtro recolhivel no mobile por resumo `Ajustar filtros`.
- O grid de reserva foi ajustado para evitar sobreposicao entre `Data`, `Hora`, `Duracao` e lupa em desktop/intermediario.
- `SCREEN-LOCAIS-02` permanece aberto ate validacao visual autenticada em 1366px, 430px e 390px.
- `SCREEN-LOCAIS-03` recebeu entrega parcial: busca de reserva sem local exato agora retorna cards por local/academia com cidade, menor preco, pisos, horarios e CTA `Ver horarios`, evitando misturar quadras soltas de academias diferentes.
- `SCREEN-LOCAIS-04` recebeu ajuste incremental: na agenda por quadra do local, a continuacao de uma reserva de 2h fica destacada e desabilitada como parte do intervalo, e o resumo/preco continuam proporcionais a duracao.
- `SCREEN-LOCAIS-05` foi verificado no codigo: confirmacao usa `Reserva vinculada ao perfil`, edita telefone apenas se faltar contato, envia snapshot nome/telefone e informa que o gestor deve tratar em `Gestao > Agenda > Reservas pendentes`.
- `SCREEN-LOCAL-01` recebeu entrega parcial: `/locais/:id` sem intent agora permanece como vitrine do local, com hero, atalhos e resumo curto; reserva, aulas, jogos, planos e sobre/contato ficam em intents focadas, sem renderizar todos os modulos completos na home.
- O card `Sobre/Contato` da pagina publica do local agora abre uma area propria com descricao, cidade, contadores e acoes de compartilhar/ver outros locais.
- Validacao de `SCREEN-LOCAL-01`: `npm.cmd run lint` e `npm.cmd run build` passaram; ainda falta screenshot autenticado desktop/mobile.
- `SCREEN-LOCAL-02` recebeu entrega parcial: a reserva do local agora possui rota dedicada `/locais/:placeId/reserva`, com compatibilidade para `?intent=booking`; o corpo da pagina fica restrito ao fluxo de reserva, preservando agenda por quadra, confirmacao pelo perfil logado e lista de espera.
- Os atalhos da pagina publica do local tambem aceitam rotas irmas dedicadas: `/aulas`, `/jogos`, `/planos` e `/sobre`, mantendo a leitura de paginas focadas em vez de anchors longas.
- Validacao de `SCREEN-LOCAL-02`: `npm.cmd run lint` e `npm.cmd run build` passaram; falta validar screenshot autenticado e reserva ponta a ponta.
- `SCREEN-LOCAL-03` foi concluido: `/locais/:placeId/aulas` foi validada em desktop/mobile como pagina focada de aulas, sem misturar reserva, jogos e planos no corpo.
- Validacao de `SCREEN-LOCAL-03`: screenshots autenticados confirmaram filtros de nivel, dias em multi-selecao, periodo e perfil; o fluxo ponta a ponta reutiliza a evidencia real de `SCREEN-LOCAIS-07`, em que jogador enviou interesse, academia aprovou a matricula e o contexto de aula passou a aparecer para o aluno. A agenda/aulas do jogador ainda deriva da matricula ativa vinculada a `place_academy_classes`, sem entidade propria de calendario do aluno.
- `SCREEN-LOCAL-04` foi concluido: `/locais/:placeId/jogos` abre uma pagina focada de jogos abertos do local, com filtro por data, periodo, nivel e status, CTA `Quero jogar` e CTA secundario `Criar chamada neste local`.
- A tela de jogos do local agora carrega tambem chamadas encerradas/canceladas para o filtro de status funcionar, mas contadores e hero continuam priorizando apenas chamadas abertas; no mobile, os filtros ficam recolhidos em `Ajustar filtros` e expandem sob demanda.
- Validacao de `SCREEN-LOCAL-04`: jogador criou uma chamada real e entrou nela; Supabase confirmou `open_matches` e `open_match_participants.status = joined`; `git diff --check`, `npm.cmd run lint` e `npm.cmd run build` passaram.
- `SCREEN-LOCAL-05` foi concluido: `/locais/:placeId/planos` mostra planos como produtos acionaveis, com CTA para `Ver aulas` e `Reservar quadra`, sem misturar reserva, aulas, jogos ou acordeon solto de quadras/valores no corpo.
- Planos carregam contexto para aulas e reserva; em reserva, o bloco `Plano escolhido` informa que o beneficio de quadra sera conferido pela academia ao confirmar. Aplicacao automatica de desconto/quantidade de aulas segue documentada como gap de backend/configuracao da academia.
- Validacao de `SCREEN-LOCAL-05`: screenshots autenticados desktop/mobile, contexto de aulas, contexto de reserva, `git diff --check`, `npm.cmd run lint` e `npm.cmd run build` passaram.
- `SCREEN-TOURNAMENT-05` recebeu entrega parcial: chat/avisos do torneio agora tem estrutura propria, mensagem fixada, lista e envio com estilos padronizados; controles de publicar/fixar/remover continuam restritos a quem tem permissao de comunicacao.
- Validacao de `SCREEN-TOURNAMENT-05`: `npm.cmd run lint` e `npm.cmd run build` passaram; falta validar screenshot autenticado desktop/mobile e operacao real do organizador.
- `SCREEN-TOURNAMENT-ORG-01` recebeu entrega parcial: Organizacao do torneio nao redireciona mais silenciosamente em torneios live/finalizados e ganhou mapa operacional para Visao geral, Inscricoes, Categorias, Jogos/agenda, Resultados, Comunicacao e Configuracao.
- Validacao de `SCREEN-TOURNAMENT-ORG-01`: `git diff --check`, `npm.cmd run lint` e `npm.cmd run build` passaram; falta validar screenshots autenticados por fase do torneio.
- `SCREEN-LEAGUE-01` recebeu entrega parcial: home publica da liga agora trata inscricao do jogador como chip/linha curta, mantem classe como filtro contextual e evita controles duplicados ao usar select no desktop e trilho de chips no mobile.
- Validacao de `SCREEN-LEAGUE-01`: `git diff --check`, `npm.cmd run lint` e `npm.cmd run build` passaram; falta validar screenshot autenticado desktop/mobile e ligas com muitas classes.
- `SCREEN-LEAGUE-02` recebeu entrega parcial: Jogadores da liga separa leitura publica de operacao do organizador; convite, solicitacoes e pagamentos ficam em workspace proprio, enquanto a lista publica nao mostra acoes administrativas.
- Validacao de `SCREEN-LEAGUE-02`: `git diff --check`, `npm.cmd run lint` e `npm.cmd run build` passaram; falta validar screenshots autenticados e possivel redundancia do resumo textual antigo.
- `SCREEN-LEAGUE-03` concluido: Partidas da liga agora tem filtros por rodada/status, preserva `Minhas partidas` como area prioritaria e pagina a lista geral em blocos explicitos de 12 partidas com `Mostrando X de Y` e `Ver mais partidas`.
- Validacao de `SCREEN-LEAGUE-03`: screenshots autenticados desktop/mobile para jogador e organizador passaram; `screen-league-03-validation.json` confirmou 12 cards visiveis de 48, jogador sem ferramentas admin, organizador com acoes operacionais; `git diff --check`, `npm.cmd run lint` e `npm.cmd run build` passaram.
- `SCREEN-LEAGUE-04` concluido: Classificacao da liga tem seletor por classe, legenda de subida/permanencia/descida, tabela mobile compacta sem overflow horizontal e snapshot restrito ao organizador.
- Validacao de `SCREEN-LEAGUE-04`: screenshots autenticados desktop/mobile para jogador e organizador passaram; `screen-league-04-validation.json` confirmou ausencia de ferramenta administrativa para jogador e `Salvar snapshot` apenas no workspace do organizador; `git diff --check`, `npm.cmd run lint` e `npm.cmd run build` passaram.
- `SCREEN-LEAGUE-05` concluido: Chat/avisos da liga esta alinhado ao padrao visual do chat de torneio, com aviso fixado moderado, feed simples e ferramentas administrativas restritas ao organizador.
- Validacao de `SCREEN-LEAGUE-05`: screenshots autenticados desktop/mobile para jogador e organizador passaram; `screen-league-05-validation.json` confirmou jogador sem publicar/fixar/remover, organizador com ferramentas de comunicacao e ausencia de overflow horizontal no mobile; `git diff --check`, `npm.cmd run lint` e `npm.cmd run build` passaram.
- `SCREEN-GESTAO-01` concluido: central `/gestao` prioriza fila do dia e locais sob gestao antes de metricas/setup; implantacao e base incompleta ficam recolhidas para nao contaminar a rotina diaria.
- Validacao de `SCREEN-GESTAO-01`: screenshots autenticados desktop/mobile passaram; `screen-gestao-01-validation.json` confirmou fila na primeira dobra, 3 locais compactos, detalhes recolhidos, 6 cards principais e ausencia de overflow horizontal no mobile; `git diff --check`, `npm.cmd run lint` e `npm.cmd run build` passaram.
- `SCREEN-GESTAO-AGENDA-01` concluido: Agenda prioriza pendencias acionaveis na primeira dobra, lista de espera acionavel, CTA de nova reserva/bloqueio e listas longas apenas depois de resumo explicito. A aba `Hoje` limita a primeira carga a 12 reservas com `Mostrando X de Y` + `Ver todas`; `Reservas` e `Espera` mantem filtros e expansao sem esconder itens silenciosamente.
- Validacao de `SCREEN-GESTAO-AGENDA-01`: screenshots autenticados desktop/mobile passaram; `screen-gestao-agenda-01-afterlimit-validation.json` confirmou 12 rows visiveis de 32 reservas do dia, ausencia de overflow horizontal e reducao do scroll mobile de 8575px para 4347px. `git diff --check`, `npm.cmd run lint` e `npm.cmd run build` passaram. A exportacao de agenda por quadra segue condicionada a existir agenda gerada com horario/quadra no torneio.
- `CTX-QA-01` concluido: validacao cruzada desktop/mobile confirmou modo Jogador/Trabalho persistido, perfil publico clicavel a partir do ranking, privacidade de perfil no editor, scouting privado por adversario e academia carregando apos schema novo. Screenshots em `web/docs/screenshots/contextual-qa-2026-05-17/`; relatorio em `CTX_QA_01_VALIDATION_2026_05_17.md`.
- As migrations `0092_player_private_notes_v1.sql`, `0093_profile_visibility_v1.sql` e `0094_academy_class_recurrence_group_v1.sql` foram aplicadas no Supabase remoto populado artificialmente e o schema PostgREST foi recarregado. Decisao de produto: perfil privado oculta dados pessoais/vitrine, mas head-to-head, rankings e estatisticas competitivas continuam visiveis.
- `CTX-MATCHROOM-01` concluido: a sala de partida de liga/torneio deixou de ser expansao inline ou redirecionamento generico. Home, agenda e notificacoes agora apontam para deep links com `room=...`; Liga abre a sala em `AppDialog`/sheet contextual preservando lista e scroll; Torneio abre a sala contextual para partidas do jogador. O formulario de placar continua seguindo o mesmo padrao do admin e as falhas passam por toast amigavel. Evidencia mobile em `screenshots/contextual-qa-2026-05-17/ctx-matchroom-league-click-mobile.png`.

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
