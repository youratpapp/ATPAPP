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

Data: 2026-05-15

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
- 2026-05-15: `MGMT-UX-01` concluido. `/gestao` agora abre com fila operacional antes dos indicadores agregados; os numeros viraram `Sinais de suporte`, a fila do dashboard local respeita modulos permitidos e professor/recepcao deixam de herdar superficies empresariais que nao pertencem ao papel. A queue segue para `MGMT-UX-02`, modo professor.
- 2026-05-15: `MGMT-UX-02` concluido. Professor em Academia agora tem superficie propria com `Aulas`, `Turmas` e `Alunos`; turmas, alunos, chamada, reposicoes e resumo sao filtrados pelo `place_coaches.user_id` vinculado ao login; professor sem vinculo recebe estado vazio claro e nao herda turmas por nome. A queue segue para `QA-ROLE-01`, teste manual por papel.
- 2026-05-15: `QA-ROLE-01` concluido. Foi criado `QA_ROLE_01_ROLE_VISIBILITY_REPORT_2026_05_15.md` com screenshots/textos em `web/docs/screenshots/qa-role-2026-05-15/`. A separacao principal por papel foi validada em desktop/mobile e nenhum P0 novo apareceu. A queue segue para `MGMT-ROLE-QA-01`, corrigindo vazamento de setup para professor/recepcao; tambem foram adicionados `ROLE-FINANCE-01`, `QA-SEED-ROLE-01` e `MGMT-ROLE-QA-02`.
- 2026-05-15: `MGMT-ROLE-QA-01` concluido. A central `/gestao` agora calcula resumo e fila por papel: professor nao herda setup, financeiro, CRM, estoque, reservas ou pendencias globais do local; recepcao nao recebe setup estrutural nem financeiro/cantina; `Base incompleta` e setup profundo ficam restritos a gestor. Evidencias em `web/docs/screenshots/mgmt-role-qa-01-2026-05-15/` e relatorio em `MGMT_ROLE_QA_01_REPORT_2026_05_15.md`. A queue segue para `QA-DESIGN-01`.
- 2026-05-15: `QA-DESIGN-01` concluido. A auditoria visual autenticada gerou `QA_DESIGN_01_VISUAL_CONSISTENCY_REPORT_2026_05_15.md` e screenshots em `web/docs/screenshots/qa-design-01-2026-05-15/`. Foram corrigidos contadores zerados no Player App, badges `0` em Competicoes, vazamento do segmento `Organizando` para jogador puro e loading fragil de Gestao por dados opcionais. A queue segue para `ROLE-FINANCE-01`.
- 2026-05-15: `ROLE-FINANCE-01` concluido. Foi criado suporte real para `place_staff.role = finance`, com migration `0086_place_finance_staff_role_v1.sql`, seed `financeiro.prime@demo.atp.local`, central `/gestao` em modo financeiro isolado e equipe do local permitindo convidar/atribuir Financeiro. O papel acessa recebiveis, despesas, lembretes e baixas financeiras sem Agenda/Academia/CRM/Cantina/Equipe/Ajustes como superficies principais. Cantina/POS permanece fora desse papel ate existir operador de caixa dedicado. Relatorio em `ROLE_FINANCE_01_REPORT_2026_05_15.md`. A queue segue para `QA-SEED-ROLE-01`.
- 2026-05-15: `QA-SEED-ROLE-01` concluido. O seed demo agora separa perfis puros de perfis operacionais: `qa.jogador.puro@demo.atp.local` foi criado sem vinculos, `organizador.circuito@demo.atp.local` deixou de ser `place_staff`, `financeiro.prime@demo.atp.local` permanece como `finance` e o verificador ganhou checks especificos para jogador puro, organizador puro, financeiro, aluno mensalista e coach solo. Relatorio em `QA_SEED_ROLE_01_REPORT_2026_05_15.md`. A queue segue para `MGMT-ROLE-QA-02`.
- 2026-05-15: `MGMT-ROLE-QA-02` concluido. `/gestao` acessada por usuario sem Management OS agora usa superficie visual de jogador: a navegacao global nao mostra `Gestao esportiva`, `Operacao` nem item `Gestao`, e o estado vazio fala `Area profissional indisponivel` em vez de cockpit operacional. Relatorio em `MGMT_ROLE_QA_02_REPORT_2026_05_15.md`. A queue segue para `PLAYER-UX-05`.

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
- Pagina publica do local ja iniciou conversao premium: oferta no hero, reserva como CTA principal, divulgacao no fim e CTA sticky mobile.
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
- `MGMT-FINANCE-01`: Financeiro agora inicia na fila de cobranca, agrega pendencias de meses anteriores, permite baixa manual por row e deixa relatorio/resumo como suporte secundario.
- Proximo foco executavel: `MGMT-CRM-01`, Clientes/CRM como fila de relacionamento.

Sprint Player App executado em 2026-05-15:

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
