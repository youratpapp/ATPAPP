# Competition OS v2 Implementation Spec

Data: 2026-05-15

Fonte: `RESTRUCTURE_SOURCE_OF_TRUTH_POLICY.md`, `COMPETITION_OS_V2_UX_PLAN.md`, `ROLE_BASED_RESTRUCTURE_IMPLEMENTATION_SPEC.md`, `ROLE_BASED_RESTRUCTURE_QUEUE.md`, `USER_ACTIVITY_TEST_PLAN.md`, relatorios de QA manual e referencias de mercado analisadas.

## Politica De Legado

Use MDs antigos para preservar campos, regras, formatos, permissoes e suporte backend de torneios/ligas. Nao preserve a organizacao antiga quando ela misturar evento publico, setup, operacao e relatorio na mesma superficie.

Na v2, evento publico, jogador inscrito, organizador operacional e setup sao experiencias separadas.

## Objetivo

Transformar competicoes em duas experiencias claramente diferentes:

- jogador ve torneio/liga como evento simples para participar e acompanhar;
- organizador ve torneio/liga como operacao com fila, etapas, pendencias e configuracao.

O problema atual nao e falta de funcao. O problema e que setup, operacao, acompanhamento e descoberta aparecem com peso parecido, criando uma tela densa demais para jogador e pouco direta para organizador.

## Nao Objetivos

- Nao copiar visual de concorrente.
- Nao transformar torneio em rede social.
- Nao mostrar KPI de organizador para jogador.
- Nao ocultar regras importantes, apenas reposicionar.
- Nao remover campos existentes de torneio/liga.

## Superficies

### Public Competition Surface

Usada por jogador visitante, inscrito ou potencial inscrito.

Deve parecer pagina de evento:

- nome;
- local;
- data;
- status;
- poster/imagem quando houver;
- categorias;
- inscritos/jogos;
- CTA principal.

Nao deve parecer painel administrativo.

### Player Competition Surface

Usada por jogador logado.

Prioridade:

1. minha proxima partida;
2. minha inscricao/status;
3. resultado pendente, se houver;
4. competicoes abertas relevantes;
5. historico.

### Organizer Competition Surface

Usada por organizador/equipe aceita.

Prioridade:

1. fila de trabalho;
2. inscricoes pendentes;
3. categorias incompletas;
4. jogos sem horario/quadra;
5. resultados pendentes;
6. publicacao/compartilhamento;
7. configuracao.

## Arquitetura De Informacao

### Hub `/eventos`

Status 2026-05-15:

- implementado em `EventsHubPage.tsx`;
- o modo ativo vem de `?modo=playing|organizing|discover` ou do contexto do usuario;
- o hub nao empilha `Jogando`, `Organizando` e `Descobrir` ao mesmo tempo;
- fila operacional e criacao de torneio/liga ficam no modo `Organizando`;
- previews avisam quando existem mais itens e levam para listas completas;
- CSS mobile preserva segmentos acessiveis por rolagem horizontal.
- `QA-DESIGN-01` reforcou que jogador puro nao deve ver `Organizando` nem badges zerados; o modo organizador aparece quando ha contexto real ou acesso explicito.

Mobile alvo:

1. header compacto;
2. segmentos: `Jogando`, `Organizando`, `Descobrir`;
3. conteudo do segmento ativo;
4. CTA contextual.

Regras:

- jogador puro abre em `Jogando` ou `Descobrir`;
- usuario organizador pode ver `Organizando`, mas esse segmento nao deve poluir a primeira leitura do jogador;
- contador `0` em acoes de descoberta deve ser omitido, nao exibido como KPI;
- criar torneio/liga aparece somente em contexto de organizador;
- competicoes onde o usuario joga nao devem ficar misturadas com competicoes onde ele opera.

Estados:

- sem jogos: CTA `Encontrar torneio ou liga`;
- sem competicoes organizadas: CTA `Criar competicao`;
- sem eventos proximos: estado vazio com filtros e descoberta.

### Evento Publico `/eventos/:id`

Status 2026-05-15:

- `PUBLIC-COMP-01` consolidou a leitura publica de `TournamentPage.tsx` e `LeagueDetailsPage.tsx`;
- leitor publico nao recebe `CompetitionHeader`, filtro operacional de escopo da liga nem controles de exportar/copiar agenda;
- o primeiro bloco publico usa topbar compacta, hero, action rail, categorias/classes e lista publica de inscritos/jogadores;
- contatos, aprovacao, cobranca, publicacao, fila e configuracao permanecem fora da superficie publica.

Ordem de conteudo:

1. topo com voltar, compartilhar e menu;
2. nome, local, data e status;
3. poster/imagem;
4. action rail com `Categorias/Classes`, `Inscritos/Jogadores` e `Jogos/Partidas`;
5. tabs/anchors publicos visiveis: `Evento`, `Categorias`, `Inscritos/Jogadores`, `Jogos/Partidas`;
6. conteudo publico da tab/secao;
7. CTA sticky.

Regras:

- tabs devem aparecer antes de resumos longos;
- resumo nao pode empurrar navegacao secundaria para longe;
- jogador nao deve ver aprovar inscricao, gerar jogos ou configuracao;
- CTA deve mudar por estado: `Inscrever-se`, `Ver minha inscricao`, `Ver meus jogos`, `Inscricoes encerradas`.
- lista publica de inscritos/jogadores nao deve exibir telefone, email ou acoes internas.
- owner/staff continua usando Competition OS operacional, com fila, filtros e ferramentas de publicacao em outra superficie.

### Categoria

Ordem:

1. nome da categoria;
2. vagas e inscricoes;
3. formato resumido;
4. publico elegivel;
5. lista de inscritos;
6. CTA.

Comportamento:

- lista de inscritos em rows;
- toque em inscrito abre bottom sheet com nome, cidade, categoria e contato se permitido;
- busca aparece quando houver volume relevante.

### Inscricao

Fluxo:

1. selecionar categoria;
2. revisar valor, regras e restricao de horario;
3. confirmar;
4. sucesso/pendente/erro.

Status 2026-05-15:

- `TournamentRegistrationPage.tsx` implementa escolha por cards, revisao e status da inscricao existente;
- `LeagueDetailsPage.tsx` implementa entrada publica em liga com classe, dados, revisao e status;
- `LeagueJoinPage.tsx` implementa o mesmo padrao para link de convite;
- `App.css` possui contrato visual compartilhado em `registration-flow`, `registration-option`, `registration-review-card` e `registration-sticky-cta`.

Mobile:

- CTA sticky;
- formulario curto;
- restricao de horario em disclosure ou sheet;
- erro amigavel sem mensagem SQL/RPC crua.

Gap backend:

- torneio ainda nao persiste restricao de horario por inscricao. Nao adicionar campo falso no frontend; criar suporte de dados antes de transformar isso em input real.

Critico:

- aprovacao/rejeicao de inscricao pelo organizador deve atualizar UI sem reload;
- se RPC falhar, mostrar toast amigavel e manter estado anterior.

## Setup De Torneio

Tipo: wizard de setup raro.

Status 2026-05-15:

- `COMP-SETUP-01` implementado em `EventsPage.tsx`;
- `SetupWizard` agora organiza a criacao de torneio em 6 etapas, com validacao minima por etapa;
- `createTournament` aceita payload estruturado e persiste:
  - `status` inicial (`draft` ou `registration_open`);
  - `poster_url`;
  - `starts_at`;
  - `registration_close_at`;
  - `registration_fee_cents`;
  - `player_result_submission_enabled`;
  - `data.categorias`;
  - `data.agendaConfig`;
  - `data.setupDraft`;
  - `data.tournamentMeta`;
- a etapa `Revisar` permite salvar rascunho ou abrir inscricoes;
- configuracao detalhada por classe, jogadores e geracao de partidas continua no workspace interno do torneio.

Etapas obrigatorias:

1. `Basico`
   - nome;
   - local;
   - cidade/estado;
   - data inicial/final;
   - visibilidade;
   - poster/imagem.
2. `Inscricoes`
   - abertura/fechamento;
   - taxa;
   - limite;
   - aprovacao manual/automatica;
   - informacoes ao jogador.
3. `Categorias`
   - esporte;
   - genero;
   - classe/nivel;
   - vagas;
   - idade/publico;
   - valor por categoria se aplicavel.
4. `Formato`
   - mata-mata/grupos;
   - sets/games/tiebreak;
   - terceiro set/super tie;
   - criterio de desempate.
5. `Agenda e quadras`
   - duracao estimada;
   - quadras disponiveis;
   - horarios de jogo;
   - distribuicao automatica;
   - conflitos.
6. `Revisar e publicar`
   - resumo;
   - pendencias;
   - salvar rascunho;
   - publicar.

Regras:

- campos avancados ficam recolhidos;
- etapa nao deve ter scroll infinito;
- erros aparecem por etapa;
- progresso visivel;
- salvar rascunho deve ser claro.

## Setup De Liga

Tipo: wizard de setup raro.

Status 2026-05-15:

- `COMP-SETUP-02` implementado em `LeaguesPage.tsx`;
- `SetupWizard` organiza criacao de liga em 6 etapas com validacao minima por etapa;
- `createLeague` aceita payload estruturado e persiste:
  - `status` inicial (`draft` ou `active`);
  - `league_type`;
  - `visibility`;
  - `match_format`;
  - `rounds_total`;
  - `round_interval` e `round_interval_days`;
  - `result_deadline_days` e `tolerance_days`;
  - `promoted_count`, `relegated_count` e `max_recesses`;
  - `wildcard_enabled` e `no_ad_enabled`;
  - `tie_break_rule` e `wo_rule`;
  - `public_join_enabled` e `join_requires_approval`;
  - `auto_round_generation_enabled`, hora e timezone;
  - `registration_fee_cents`;
  - `settings.setup`, `settings.classes` e `settings.points`;
  - temporada inicial em `league_seasons`;
  - classes iniciais em `league_classes`.
- convite/importacao de jogadores permanece no workspace interno da liga, porque e operacao recorrente e depende de contexto.

Etapas:

1. `Basico`
   - nome;
   - local;
   - periodo;
   - visibilidade.
2. `Jogadores e classes`
   - classes;
   - limite por grupo;
   - inscricoes;
   - convite/importacao.
3. `Formato`
   - grupos;
   - rotacoes;
   - sobe/desce;
   - partidas por rodada.
4. `Pontuacao`
   - pontos por vitoria/derrota/WO/empate;
   - criterios de desempate.
5. `Agenda`
   - dias/horarios;
   - quadras/local;
   - prazo de resultado.
6. `Revisar e publicar`.

## Operacao De Torneio

Tela do organizador deve abrir com fila acionavel.

Rows principais:

- inscricao pendente;
- pagamento pendente;
- categoria incompleta;
- jogos nao gerados;
- partida sem horario/quadra;
- resultado pendente;
- conflito de resultado;
- publicacao pendente.

Cada row deve ter:

- tipo;
- contexto;
- impacto;
- acao primaria;
- acao secundaria em menu.

Exemplo:

```text
Inscricao pendente
Maria Silva - 5a Classe Feminino
Acao primaria: Aprovar
Secundaria: Recusar, Ver perfil, WhatsApp
```

Detalhe:

- drawer no desktop;
- bottom sheet no mobile;
- nao abrir wizard para rotina.

Estado implementado em `COMP-OPS-01`:

- componente local de fila operacional em `TournamentPage.tsx`;
- primeira dobra de owner/staff renderiza rows em vez de grid de cards agregados;
- cada task possui `eyebrow`, titulo, contexto, impacto, acao primaria, acoes secundarias e detalhe;
- drawer/bottom sheet reutiliza as mesmas acoes reais;
- recorte visual de ate 8 rows nao e silencioso: a tela informa quantas tarefas existem e oferece entrada para lista completa;
- nenhum backend novo foi criado neste sprint.

## Operacao De Liga

Primeira tela:

- rodada atual;
- minhas tarefas;
- partidas pendentes;
- resultados aguardando;
- classificacao;
- comunicacao.

Jogador:

- minhas partidas;
- enviar resultado se permitido;
- classificacao;
- regras resumidas.

Organizador:

- operar rodada;
- ajustar partida;
- resolver WO/conflito;
- publicar rodada;
- configuracao secundaria.

Status 2026-05-15:

- `COMP-OPS-02` implementado em `/eventos/ligas/:leagueId`;
- owner abre a liga com fila operacional por rows antes das tabs;
- jogador participante recebe fila `Minha rodada` apenas quando ha partida pendente;
- rows usam drawer/bottom sheet e encaminham para a sala de partida existente;
- backend novo nao foi criado: foram reaproveitados servicos de inscricao, pagamento manual/stub, geracao de rodada, resultado, WO e chat.

## Permissoes

### Pode operar competicao

- owner;
- membro aceito com papel organizador;
- scorekeeper/check-in apenas nas funcoes permitidas.

### Convite

- convite pendente nao concede acesso;
- card deve mostrar nome quando usuario existir;
- se usuario nao existir, mostrar email como convite pendente;
- apos aceitar, competicao aparece para o usuario.

### Jogador

- ve somente a propria inscricao, jogos, resultados e informacao publica;
- nao ve filas administrativas.

## Backend E Erros

Regras:

- toda acao primaria precisa persistir;
- nenhum erro SQL/RPC cru aparece para usuario;
- RPC com assinatura divergente deve ser corrigida ou documentada antes de nova UX;
- fallback PATCH precisa respeitar RLS e schema;
- loading deve bloquear duplo clique em acoes sensiveis.

Mensagens:

- sucesso: toast curto;
- erro recuperavel: mensagem amigavel + manter estado anterior;
- erro de permissao: explicar que o usuario nao tem acesso;
- erro estrutural: registrar em console/log e mostrar erro generico.

## Componentes Reutilizaveis

- `CompetitionHubSegments`;
- `CompetitionPublicHeader`;
- `CompetitionEventPoster`;
- `CompetitionTabs`;
- `CompetitionStickyCTA`;
- `CompetitionCategoryCard`;
- `CompetitionParticipantRow`;
- `CompetitionRegistrationFlow`;
- `CompetitionSetupWizard`;
- `OrganizerWorkQueue`;
- `RegistrationApprovalRow`;
- `MatchSchedulingRow`;
- `ResultConflictRow`;
- `CompetitionActionDrawer`.

## Criterios De Aceite

- jogador consegue descobrir e se inscrever sem ver operacao;
- inscrito entende status da inscricao;
- organizador encontra a proxima tarefa sem rolar uma pagina grande;
- criar torneio/liga fica em wizard por etapas;
- operar torneio/liga fica em rows/drawers;
- tabs nao ficam escondidas por resumos;
- CTA principal e claro por estado;
- convite de equipe so habilita acesso apos aceite;
- aprovar/rejeitar inscricao funciona ou falha com feedback;
- mobile 390px nao vira empilhamento confuso.

## QA Minimo Por Task

- jogador puro abre `/eventos`;
- jogador acessa evento publico;
- jogador se inscreve;
- organizador aprova/rejeita inscricao;
- organizador cria torneio em rascunho;
- organizador gera/edita partidas;
- organizador resolve resultado pendente;
- usuario convidado so ve competicao depois de aceitar;
- 390px e desktop.

## Registro De Implementacao

### COMP-UX-02 - Evento publico mobile

Arquivos tocados:

- `web/src/pages/TournamentPage.tsx`;
- `web/src/pages/LeagueDetailsPage.tsx`;
- `web/src/App.css`.

Decisoes:

- nao foi criado novo backend;
- a leitura publica usa dados ja carregados de torneio/liga, inscricoes, classes, partidas e standings;
- owner/staff continuam vendo o cockpit operacional existente;
- jogador/publico recebe bloco de evento, navegacao curta, rail de categorias/classes e CTA contextual antes de conteudo pesado.

Riscos restantes:

- screenshots mobile ainda devem confirmar altura de poster real e comportamento do CTA sticky com dados variados;
- `COMP-UX-03` foi concluido na sequencia; riscos remanescentes de inscricao ficam registrados no bloco proprio abaixo.

### COMP-UX-03 - Inscricao em torneio/liga

Arquivos tocados:

- `web/src/pages/TournamentRegistrationPage.tsx`;
- `web/src/pages/LeagueDetailsPage.tsx`;
- `web/src/pages/LeagueJoinPage.tsx`;
- `web/src/App.css`.

Decisoes:

- nao foi criado backend novo;
- o fluxo de torneio usa `app_request_tournament_registration` e carrega a inscricao existente via `loadTournamentRegistrations`;
- o fluxo de liga publica usa `app_request_public_league_join` e carrega a inscricao do usuario via `loadMyLeagueRegistration`;
- o link de convite de liga usa `app_request_league_join_by_link`;
- restricao de horario de torneio permanece como orientacao ate existir campo persistido.

Validacao:

- `npm.cmd run lint`;
- `npx.cmd tsc --noEmit`;
- `npm.cmd run build`.

Riscos restantes:

- validar manualmente em mobile real o comportamento do CTA sticky com teclado aberto;
- persistencia de restricao de horario precisa de task propria se o produto decidir capturar esse dado na inscricao.

### COMP-OPS-01 - Operacao de torneio em rows

Arquivos tocados:

- `web/src/pages/TournamentPage.tsx`;
- `web/src/App.css`;
- `web/docs/COMP_OPS_01_REPORT_2026_05_15.md`.

Decisoes:

- manter a operacao dentro da pagina do torneio, sem criar rota nova;
- preservar tabs existentes para operacao profunda;
- usar rows como porta de entrada rapida para rotina diaria;
- usar drawer/bottom sheet para detalhe, mantendo wizard apenas para setup;
- fundir alerta de indisponibilidade na fila para remover duplicidade.

Acoes reais preservadas:

- aprovar/rejeitar/mover inscricao para espera;
- aprovar da espera;
- marcar pagamento manual/stub;
- gerar jogos;
- abrir configuracao de agenda/classes quando setup esta incompleto;
- aplicar resultado enviado por jogador como oficial;
- abrir WhatsApp para aviso de indisponibilidade.

Riscos restantes:

- agenda incompleta ainda leva para configuracao geral de agenda, nao para edicao granular de uma unica partida;
- pagamento segue stub/manual ate existir provedor real;
- validar visualmente com muitos itens e mobile real.
