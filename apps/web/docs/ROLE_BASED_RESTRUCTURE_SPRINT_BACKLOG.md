# Role Based Restructure Sprint Backlog

Data: 2026-05-15

Este arquivo transforma a queue em backlog executavel de sprint. A ordem oficial continua em `ROLE_BASED_RESTRUCTURE_QUEUE.md`; este backlog adiciona escopo, arquivos provaveis, validacao e impacto por item.

Specs detalhados por item: `ROLE_BASED_RESTRUCTURE_TASK_SPECS.md`.

Politica de legado: `RESTRUCTURE_SOURCE_OF_TRUTH_POLICY.md`. Este backlog nao deve ser usado para preservar layouts antigos. Ele preserva funcoes e aponta para a nova organizacao por papel/intencao.

## Legenda

- P0: base ou bloqueador de UX.
- P1: melhoria essencial da experiencia.
- P2: refinamento importante, mas nao bloqueia a proxima fase.

## Sprint 0 - Fundacao

| ID | Prioridade | Area | Usuarios | Escopo | Arquivos provaveis | Validacao |
|---|---:|---|---|---|---|---|
| ROLE-UX-00 | P0 | Papeis/permissoes | todos | **Concluido em 2026-05-15.** Matriz de visibilidade por relacao, menus, dados buscados, estados vazios | `ROLE_VISIBILITY_MATRIX.md`, `PROFILE_PLAN_ACCESS_MODEL.md`, `workspace-access`, `role-visibility`, `BottomNav` | jogador puro sem gestao; professor sem modulos indevidos; admin com acesso correto |
| ROLE-UX-01 | P0 | Shells | todos | **Concluido em 2026-05-15.** Separar Player, Organizer e Management shells; reduzir linguagem tecnica para jogador | `AppShell.tsx`, `BottomNav.tsx`, `ManagementShell.tsx`, `role-visibility.ts`, CSS global | nav contextual por modo; Player sem labels tecnicos |
| DESIGN-UX-00 | P0 | Design system | todos | **Concluido em 2026-05-15.** Tokens de densidade por modo, regras de card/row/sheet/CTA | `theme.css`, `DESIGN_TOKENS.md`, `COMPONENT_GRAMMAR.md`, `App.css` | lint/build; base pronta para Player, Competition e Management |

## Sprint 1 - Player Home E Navegacao

| ID | Prioridade | Area | Usuarios | Escopo | Arquivos provaveis | Validacao |
|---|---:|---|---|---|---|---|
| PLAYER-UX-01 | P0 | `/inicio` | jogador, aluno, multi-papel | **Concluido em 2026-05-15.** Proxima acao, intencoes, remocao de duplicidade Agora/Agenda/Clube, area profissional discreta | `HomePage.tsx`, `App.css`, services de dashboard | lint/build; mobile 390px com uma acao primaria |

## Sprint 2 - Locais / Reserva / Aulas

| ID | Prioridade | Area | Usuarios | Escopo | Arquivos provaveis | Validacao |
|---|---:|---|---|---|---|---|
| PLAYER-UX-02 | P0 | `/locais` | jogador | **Concluido em 2026-05-15.** Escolha de intencao compacta, query por intencao, fluxo `Ver locais`, menos texto | `PlacesPage.tsx`, `HomePage.tsx`, `App.css` | lint/build; escolher Reservar/Aula/Jogo/Locais sem ler painel |
| PLAYER-UX-03 | P0 | Reserva | jogador, socio | **Concluido em 2026-05-15.** Pagina publica do local com fluxo quando/slot/confirmar, slots livres, preco quando existe e lista de espera real | `PlacePublicPage.tsx`, `places.ts`, `App.css` | lint/build; solicitar reserva; sem disponibilidade inline |
| PLAYER-UX-04 | P0 | Aulas publicas | jogador, aluno | **Concluido em 2026-05-15.** Turmas por nivel/dia/local, cards com vaga/valor/professor e solicitacao via backend existente | `PlacesPage.tsx`, `PlacePublicPage.tsx`, Academy services, `App.css` | lint/build; nao aluno nao ve gestao; pagina publica sem duplicidade de turmas |

## Sprint 3 - Jogar / Ranking / Perfil

| ID | Prioridade | Area | Usuarios | Escopo | Arquivos provaveis | Validacao |
|---|---:|---|---|---|---|---|
| PLAYER-UX-05 | P1 | Jogos/chamadas | jogador | encontrar/criar jogo sem feed social, filtros simples | `PlacesPage.tsx`, open matches services, `App.css` | criar/entrar em jogo com feedback |
| PLAYER-UX-06 | P1 | `/ranking` | jogador | minha posicao primeiro, filtros, lista, KPIs secundarios | `RankingPage.tsx`, ranking services, CSS | primeira dobra nao e dashboard geral |
| PLAYER-UX-07 | P1 | `/perfil` | jogador, professor | separar publico, preferencias, historico, conta | `ProfilePage.tsx`, profile services, CSS | perfil nao parece cockpit |

## Sprint 4 - Competition Player/Public

| ID | Prioridade | Area | Usuarios | Escopo | Arquivos provaveis | Validacao |
|---|---:|---|---|---|---|---|
| COMP-UX-01 | P0 | `/eventos` | jogador, organizador | **Concluido em 2026-05-15.** separar Jogando/Organizando/Descobrir por modo ativo, sem cockpit empilhado | `EventsHubPage.tsx`, CSS | lint/build; jogador nao ve fila de organizador como prioridade |
| COMP-UX-02 | P0 | Evento publico | jogador | **Prioridade atual.** poster/status/tabs/CTA sticky/categorias | `TournamentPage.tsx`, `LeagueDetailsPage.tsx`, CSS | evento parece evento publico |
| COMP-UX-03 | P0 | Inscricao | jogador | categoria, valor, restricao, confirmacao e erro amigavel | `TournamentRegistrationPage.tsx`, tournament RPC/service | aprovar/inscrever sem erro cru |

## Sprint 5 - Competition Setup

| ID | Prioridade | Area | Usuarios | Escopo | Arquivos provaveis | Validacao |
|---|---:|---|---|---|---|---|
| COMP-SETUP-01 | P1 | Criar torneio | organizador | wizard: basico, inscricoes, categorias, formato, agenda, revisar | `EventsPage.tsx`, setup components, tournament services | criar torneio completo sem formulario longo |
| COMP-SETUP-02 | P1 | Criar liga | organizador | wizard: basico, jogadores/classes, formato, pontuacao, agenda, revisar | `EventsPage.tsx`, `LeaguesPage.tsx`, league services | criar liga compreensivel |

## Sprint 6 - Competition Operation

| ID | Prioridade | Area | Usuarios | Escopo | Arquivos provaveis | Validacao |
|---|---:|---|---|---|---|---|
| COMP-OPS-01 | P1 | Operar torneio | organizador, equipe | inscricoes, jogos, horarios, resultados em rows/drawers | `TournamentPage.tsx`, competition components, services | proxima tarefa clara |
| COMP-OPS-02 | P1 | Operar liga | organizador, jogador | rodada atual, partidas, resultado, ranking, comunicacao | `LeagueDetailsPage.tsx`, league components/services | organizador nao caca tarefa |

## Sprint 7 - Management Shell E Professor

| ID | Prioridade | Area | Usuarios | Escopo | Arquivos provaveis | Validacao |
|---|---:|---|---|---|---|---|
| MGMT-UX-01 | P0 | `/gestao` e workspace | gestor, recepcao, financeiro | subnav/fila antes de KPIs, loading/skeleton, estados vazios | `ManagementHubPage.tsx`, `PlaceAdminShell.tsx`, `ManagementShell.tsx`, CSS | sem vazio gigante; modulos por permissao |
| MGMT-UX-02 | P0 | Professor | professor | aulas, turmas, alunos, chamada, agenda, sem modulos empresariais | `ManagementHubPage.tsx`, `Academy` modules, access services | professor ve rotina propria |

## Sprint 8 - Agenda / Academia

| ID | Prioridade | Area | Usuarios | Escopo | Arquivos provaveis | Validacao |
|---|---:|---|---|---|---|---|
| MGMT-AGENDA-01 | P1 | Agenda | recepcao, gestor | hoje, pendencias, calendario, nova reserva, espera, bloqueio, recursos | `PlaceBooking*`, `places.ts`, CSS | recepcao reserva em poucos cliques |
| MGMT-ACADEMY-01 | P1 | Academia | secretaria, professor, financeiro, gestor | revisar v2 inteira, contrato/usuario, reposicoes, mobile | `PlaceAcademy*`, `places.ts`, migrations/RPC se necessario | chamada, reposicao, matricula e cobranca funcionam |

## Sprint 9 - Financeiro / CRM / Cantina

| ID | Prioridade | Area | Usuarios | Escopo | Arquivos provaveis | Validacao |
|---|---:|---|---|---|---|---|
| MGMT-FINANCE-01 | P1 | Financeiro | financeiro, gestor | vencidos, hoje, lembrete, marcar pago, despesas, relatorio secundario | `PlaceFinance*`, `places.ts`, payment services | quem cobrar agora claro |
| MGMT-CRM-01 | P1 | Clientes/CRM | recepcao, gestor | leads, follow-up, contatos parados, drawer, WhatsApp secundario | `PlaceCrm*`, `PlaceClient*`, services | CRM nao duplica financeiro |
| MGMT-CANTEEN-01 | P2 | Cantina/POS | atendente, gestor | venda rapida, estoque baixo, vendas do dia, cadastro secundario | `PlaceCanteen*`, `places.ts` | plano desativado nao mostra operacao |

## Sprint 10 - Equipe / Ajustes / Public Pages

| ID | Prioridade | Area | Usuarios | Escopo | Arquivos provaveis | Validacao |
|---|---:|---|---|---|---|---|
| MGMT-TEAM-01 | P1 | Equipe | gestor, organizador | buscar usuario, convite, aceite, papel, acesso apos aceite | `TeamWorkspaceShell.tsx`, staff services, tournament staff services | convite nao concede acesso antes do aceite |
| MGMT-SETTINGS-01 | P2 | Ajustes | gestor | dados publicos, recursos, regras, planos, permissoes | `SettingsWorkspaceShell.tsx`, settings services | configuracao separada da rotina |
| PUBLIC-PLACE-01 | P1 | Local publico | jogador publico | marca, reserva, aula, eventos, contato, CTA | `PlacesPage.tsx`, public place components | sem cockpit |
| PUBLIC-COMP-01 | P1 | Competicao publica | jogador publico | poster, local/data, categorias, inscritos/jogos, CTA | `TournamentPage.tsx`, registration page | sem fila de organizador |

## Sprint 11 - QA E Governanca

| ID | Prioridade | Area | Usuarios | Escopo | Arquivos provaveis | Validacao |
|---|---:|---|---|---|---|---|
| QA-ROLE-01 | P0 | QA manual | todos | reexecutar testes por papel, prints mobile/desktop, bugs P0/P1 | `USER_ACTIVITY_TEST_PLAN.md`, screenshots | relatorio por papel |
| QA-DESIGN-01 | P0 | QA visual | todos | consistencia com playbook, detectar card overload/empilhamento | `WHOLE_APP_ROLE_DESIGN_AUDIT_2026_05_14.md`, screenshots | checklist visual aprovado |

## Ordem De Execucao Curta

Se um sprint precisar ser menor, usar esta ordem:

1. `ROLE-UX-00`
2. `PLAYER-UX-01`
3. `PLAYER-UX-02`
4. `PLAYER-UX-03`
5. `PLAYER-UX-04`
6. `COMP-UX-01`
7. `COMP-UX-02`
8. `MGMT-UX-01`
9. `MGMT-UX-02`
10. `COMP-SETUP-01`
11. `COMP-SETUP-02`
