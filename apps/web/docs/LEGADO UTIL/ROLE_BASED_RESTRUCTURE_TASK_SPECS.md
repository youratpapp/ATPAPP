# Role Based Restructure Task Specs

Data: 2026-05-15

Fonte: `RESTRUCTURE_SOURCE_OF_TRUTH_POLICY.md`, `ROLE_BASED_RESTRUCTURE_QUEUE.md`, `ROLE_VISIBILITY_MATRIX.md`, `ROLE_BASED_RESTRUCTURE_SPRINT_BACKLOG.md`, `PLAYER_APP_V2_IMPLEMENTATION_SPEC.md`, `COMPETITION_OS_V2_IMPLEMENTATION_SPEC.md`, `MANAGEMENT_OS_V2_IMPLEMENTATION_SPEC.md`.

## Como Usar

Este arquivo detalha as tarefas da queue para implementacao. A queue define prioridade e ordem. Este spec define como a solucao deve ficar.

Regra principal:

- preserve funcao e regra;
- nao preserve bagunca antiga;
- use MDs legados como inventario, nao como layout;
- implemente por papel, intencao e rotina.

## ROLE-UX-00 - Matriz De Visibilidade Por Relacao

Status:

- concluido em 2026-05-15;
- matriz documentada em `ROLE_VISIBILITY_MATRIX.md`;
- helper central criado em `web/src/lib/role-visibility.ts`;
- `BottomNav.tsx` passou a consumir a politica central para `Player App`, `Competition OS` e `Management OS`.

Problema:

- menus e dados aparecem pelo historico do produto, nao pela relacao real do usuario.

Solucao desejada:

- criar matriz com usuario x relacao x plano x modulo x dado permitido.

Implementacao esperada:

- mapear jogador puro, aluno, socio, professor, recepcao, financeiro, organizador, gestor e admin;
- definir menus visiveis por papel;
- definir quais queries podem rodar por superficie;
- criar helper/constante central para navegação e route guards;
- documentar estados vazios por sem acesso, sem local, sem competicao e convite pendente.

Aceite:

- jogador puro nao ve `Gestao`;
- professor sem permissao nao ve cantina/CRM/financeiro completo;
- organizador sem local nao ve Management OS como tarefa;
- convite pendente nao concede acesso.

Gaps registrados para sprint posterior:

- papel dedicado de financeiro ainda nao existe no schema operacional (`place_staff.role` cobre `manager`, `coach` e `frontdesk`);
- papel dedicado de cantina/POS ainda nao existe;
- `workspace-access.ts` ainda deve evoluir de contadores booleanos para relacoes nomeadas por local/competicao.

## ROLE-UX-01 - Shells Por Modo

Status:

- concluido em 2026-05-15;
- `AppShell` aplica classes por superficie;
- `ManagementShell` fixa o modo operacional;
- `BottomNav` usa entrada profissional contextual;
- labels tecnicos internos foram removidos do frontend visivel.

Problema:

- Player App, Competition OS e Management OS compartilham peso visual e linguagem tecnica.

Solucao desejada:

- separar shells por modo e reduzir vazamento de contexto profissional para jogador.

Implementacao esperada:

- Player shell leve, com bottom nav simples;
- Competition shell hibrido, com tabs/evento/operacao conforme permissao;
- Management shell denso, com modulo, subnav e fila;
- entrada profissional discreta para usuario multi-papel.

Aceite:

- mobile muda nav conforme modo;
- jogador nao sente que esta em painel;
- gestor nao perde acesso profissional.

Entregue:

- `app-shell--player`, `app-shell--competition` e `app-shell--management` no shell raiz;
- rota `/gestao` e rota legada `/locais/:placeId/admin` classificadas como Management;
- rotas de eventos/inscricao/convite classificadas como Competition;
- no modo Player, usuario multi-papel ve uma unica entrada discreta `Trabalho`;
- no modo Competition, organizador ve `Organizar`;
- no modo Management, operador ve `Gestao`;
- termos `Player App`, `Competition OS` e `Management OS` nao aparecem mais como texto visivel do frontend.

## DESIGN-UX-00 - Tokens De Densidade Por Modo

Status:

- concluido em 2026-05-15;
- tokens `--player-*`, `--competition-*`, `--management-*` criados em `theme.css`;
- `App.css` passou a aplicar `--mode-*` em shell, conteudo, cards, rows, formularios, botoes e superficies compartilhadas;
- `DESIGN_TOKENS.md` e `COMPONENT_GRAMMAR.md` documentam como codar sem reabrir decisao visual.

Problema:

- muitas telas parecem iguais mesmo tendo usuarios e rotinas diferentes.

Solucao desejada:

- definir densidade visual por modo sem criar apps paralelos.

Implementacao esperada:

- Player: mais espaco, cards de intencao, CTA claro, menos metricas;
- Competition: evento publico visual, operacao em rows;
- Management: rows densas, drawers, metricas recolhidas;
- revisar `COMPONENT_GRAMMAR.md` e `DESIGN_TOKENS.md`.

Aceite:

- DNA visual continua ATP;
- cada modo tem densidade apropriada;
- menos uppercase e card overload.

Entregue:

- Player ficou com base mais espacada e CTA/touch target forte, pronta para `/inicio`, `/locais` e reserva;
- Competition ficou hibrido, mantendo card publico onde a entidade precisa reconhecimento e rows para operacao;
- Management ficou mais denso por token, com rows e superficies menos infladas no desktop sem reduzir toque no mobile;
- os proximos sprints devem usar `--mode-card-padding`, `--mode-row-min-height`, `--mode-button-min-height`, `--mode-surface-shadow` e `--mode-section-gap` antes de criar CSS local.

## PLAYER-UX-01 - Inicio Por Proxima Acao

Status:

- concluido em 2026-05-15;
- `HomePage.tsx` reorganizada por proxima acao do jogador;
- `App.css` recebeu intent rail, estado vazio leve e area `Trabalho` discreta;
- `lint` e `build` passaram.

Problema:

- `/inicio` parece painel com blocos duplicados, nao ponto de partida.

Solucao desejada:

- abrir com a proxima acao real do jogador ou com intencoes simples.

Implementacao esperada:

- componente `PlayerTodayFocus`;
- trilha de intencoes: reservar, encontrar jogo, competir, ver compromisso;
- esconder area profissional em entrada discreta;
- remover compromissos passivos como se fossem pendencia.

Aceite:

- primeira dobra em 390px tem uma acao obvia;
- jogador sem pendencia nao ve dashboard;
- nao aluno nao ve mensalidade.

Entregue:

- prioridade visual usa apenas pendencias e agenda do jogador;
- convites de equipe/torneio e rotinas profissionais ficaram fora da primeira dobra;
- o vazio pergunta pela intencao do usuario em vez de mostrar dashboard sem conteudo;
- shortcuts principais foram convertidos para trilha de intencao: reservar, jogar, aulas e competir.

## PLAYER-UX-02 - Locais Por Intencao

Status:

- concluido em 2026-05-15;
- `PlacesPage.tsx` passou a aceitar intencoes por query string e a exibir quatro entradas compactas;
- `HomePage.tsx` direciona acoes do jogador para a intencao correta de `/locais`;
- `App.css` reduziu a densidade inicial de `/locais` no mobile;
- `lint` e `build` passaram.

Problema:

- `/locais` abre como lista/ficha ampla antes do jogador dizer o que quer.

Solucao desejada:

- iniciar por intencao: reservar, aula, jogo ou ver local.

Implementacao esperada:

- tiles compactos;
- filtros em sheet;
- resultados especificos por intencao;
- local completo so depois da escolha.

Aceite:

- jogador chega em slot/turma/jogo/local sem ler painel longo;
- planos e gestao do local nao aparecem para visitante.

Entregue:

- intencoes: reservar quadra, entrar em aula, encontrar jogo e ver locais;
- `Ver locais` usa busca propria por nome, cidade e UF;
- `Seguindo` e `Meus locais` deixaram de ser tabs visuais sem filtro real;
- cards publicos de local em `Ver locais` destacam estrutura e seguidores, nao cockpit/plano;
- a entrada visual inicial ficou 2x2 no mobile, reduzindo scroll.

## PLAYER-UX-03 - Reserva Mobile Fluida

Status: concluido em 2026-05-15.

Problema:

- reserva exige interpretar tela densa e disponibilidade pouco direta.

Solucao desejada:

- fluxo onde/quando/disponibilidade/confirmar.

Implementacao esperada:

- sheets para local, data e horario;
- cards de slot com preco, duracao e status;
- CTA sticky;
- lista de espera como alternativa real.

Aceite:

- reservar em poucos toques;
- sem disponibilidade aparece inline;
- nenhuma quadra some no mobile.

Entregue:

- `PlacePublicPage.tsx` passou a tratar reserva publica como fluxo de 3 passos visiveis;
- `searchAvailableCourts` continua sendo a fonte da disponibilidade;
- horarios ocupados nao entram na lista publica, reduzindo scroll;
- `createCourtBooking` segue criando a solicitacao de reserva;
- `joinCourtBookingWaitlist` ficou disponivel como alternativa real quando nao ha disponibilidade;
- CSS novo em `App.css` deixa o fluxo responsivo em desktop e mobile.

## PLAYER-UX-04 - Entrar Em Aula Publica

Status: concluido em 2026-05-15.

Problema:

- descoberta de aulas se mistura com gestao da academia.

Solucao desejada:

- jogador ve turmas publicas por nivel, dia, local e vaga.

Implementacao esperada:

- filtros curtos;
- card de turma com vaga, professor e horario;
- CTA solicitar/matricular;
- aluno existente ve contexto proprio.

Aceite:

- visitante nao ve configuracao;
- aluno ve reposicoes/aulas proprias;
- mensalidade aparece so quando pertence a ele.

Entregue:

- `/locais?intent=classes` ficou orientado a `Entrar em aula`, sem linguagem de cockpit;
- pagina publica de local usa fluxo em 3 passos: filtrar perfil, escolher turma com vaga e enviar interesse;
- cards de turma mostram dia/hora, professor, nivel, vaga e valor publico quando existe;
- formulario nao repete select/lista de turma; a turma escolhida aparece como resumo;
- `createAcademyEnrollment` segue sendo o backend de persistencia;
- estados vazios permitem ajustar/limpar filtros;
- erro tecnico da solicitacao e logado em console e convertido em mensagem amigavel.

## PLAYER-UX-05 - Encontrar Jogo

Problema:

- criar/entrar em jogo pode virar feed social pesado.

Solucao desejada:

- foco em jogar: nivel, local, data, vagas.

Implementacao esperada:

- lista de chamadas/jogos;
- filtros simples;
- criar jogo em fluxo curto;
- feedback ao entrar.

Aceite:

- sem feed social;
- cada card deixa claro horario, local, nivel e vagas.

## PLAYER-UX-06 - Ranking Centrado No Jogador

Problema:

- ranking abre como dado global e nao responde "onde eu estou?".

Solucao desejada:

- minha posicao primeiro, lista depois.

Implementacao esperada:

- bloco compacto com posicao do usuario quando houver;
- filtros por cidade/classe/modalidade;
- explicacao de regra secundaria.

Aceite:

- primeira dobra nao e dashboard geral;
- jogador entende sua posicao.

## PLAYER-UX-07 - Perfil Por Finalidade

Problema:

- perfil tende a virar cockpit com informacao demais.

Solucao desejada:

- dividir identidade, preferencias, historico e conta.

Implementacao esperada:

- secoes curtas;
- preferencias esportivas;
- historico proprio;
- notificacoes e pagamentos proprios apenas se existirem.

Aceite:

- perfil nao mostra dados profissionais sem relacao;
- jogador atualiza dados sem caca visual.

## COMP-UX-01 - Hub De Eventos Por Modo

Status: concluido em 2026-05-15.

Problema:

- eventos mistura jogador, organizador e descoberta.

Solucao desejada:

- segmentos `Jogando`, `Organizando`, `Descobrir`.

Implementacao esperada:

- jogador puro abre em `Jogando` ou `Descobrir`;
- organizador ve fila no segmento certo;
- criar torneio/liga somente em contexto organizador.

Aceite:

- jogador nao ve fila administrativa;
- organizador encontra suas competicoes.

Entregue:

- `EventsHubPage.tsx` usa modo ativo por query/estado: `Jogando`, `Organizando`, `Descobrir`;
- apenas o conteudo do modo ativo e renderizado;
- se usuario nao tem competicao como jogador, abre em `Organizando` quando so organiza ou em `Descobrir` quando nao tem nada;
- fila operacional e entrada para criar/gerir torneio/liga ficam no modo `Organizando`;
- previews nao escondem dados silenciosamente: mostram contagem e `Ver todos`;
- CSS de mobile preserva segmentos acessiveis horizontalmente.

## COMP-UX-02 - Evento Publico Mobile

Status: prioridade atual apos `COMP-UX-01`.

Problema:

- torneio publico parece cockpit ou ficha pesada.

Solucao desejada:

- pagina de evento com topo, poster, tabs e CTA sticky.

Implementacao esperada:

- status de inscricao claro;
- tabs `Evento`, `Categorias`, `Inscritos/Jogos`;
- categorias como cards compactos;
- inscritos em rows/sheet.

Aceite:

- jogador entende e se inscreve;
- tabs nao ficam empurradas por resumo.

## COMP-UX-03 - Inscricao

Problema:

- inscricao e feedback de erro ainda podem ser confusos.

Solucao desejada:

- categoria, revisao, confirmar, feedback.

Implementacao esperada:

- CTA fixo;
- restricao de horario em disclosure;
- sucesso/pendente/erro amigavel;
- sem erro bruto de backend.

Aceite:

- inscricao conclui ou falha com mensagem clara;
- status atualiza sem reload manual.

## COMP-SETUP-01 - Wizard Criar Torneio

Problema:

- formulario longo agrupa informacoes que exigem ordem mental.

Solucao desejada:

- wizard por etapas: Basico, Inscricoes, Categorias, Formato, Agenda, Revisar.

Implementacao esperada:

- progresso visivel;
- salvar rascunho;
- validacao por etapa;
- avancados recolhidos.

Aceite:

- todos os campos existentes continuam acessiveis;
- usuario entende onde esta e o que falta.

## COMP-SETUP-02 - Wizard Criar Liga

Problema:

- formato de liga e regras aparecem sem narrativa.

Solucao desejada:

- wizard: Basico, Jogadores/classes, Formato, Pontuacao, Agenda, Revisar.

Implementacao esperada:

- explicar impacto das regras com microcopy curta;
- manter defaults seguros;
- revisar antes de publicar.

Aceite:

- liga pode ser criada sem formulario gigante;
- regras complexas nao aparecem todas de uma vez.

## COMP-OPS-01 - Operar Torneio Em Rows

Problema:

- organizador precisa cacar inscricoes, jogos e resultados.

Solucao desejada:

- fila operacional por tarefa.

Implementacao esperada:

- rows para inscricao, pagamento, categoria incompleta, jogo sem horario, resultado pendente;
- drawer de detalhe;
- acao primaria clara.

Aceite:

- proxima tarefa e obvia;
- operacao nao usa wizard.

## COMP-OPS-02 - Operar Liga Pela Rodada Atual

Problema:

- liga pode abrir em informacao geral em vez da rodada.

Solucao desejada:

- rodada atual como foco.

Implementacao esperada:

- partidas pendentes;
- resultado/WO;
- ranking;
- comunicacao;
- configuracao secundaria.

Aceite:

- organizador resolve a rodada;
- jogador ve apenas suas partidas e classificacao.

## MGMT-UX-01 - Shell Operacional Mobile

Problema:

- Management OS empilha contexto, metricas e modulos.

Solucao desejada:

- subnav e fila antes de KPI.

Implementacao esperada:

- header compacto;
- module switcher;
- fila operacional;
- metricas em strip recolhida;
- skeletons sem gaps.

Aceite:

- mobile nao parece cockpit infinito;
- modulo desativado nao aparece como operacional.

## MGMT-UX-02 - Modo Professor

Problema:

- professor pode receber operacao empresarial irrelevante.

Solucao desejada:

- modo com aulas, turmas, alunos e agenda propria.

Implementacao esperada:

- filtrar por `coach_id/user_id`;
- ocultar cantina, CRM e financeiro completo;
- estado vazio se sem local/turma.

Aceite:

- professor entende a rotina do dia;
- nao ve ferramentas que nao usa.

## MGMT-AGENDA-01 - Agenda V2 Polish

Problema:

- agenda ainda tem friccoes de mobile e feedback.

Solucao desejada:

- rotina de reservas e disponibilidade clara.

Implementacao esperada:

- calendario mobile sem quadra sumida;
- nova reserva com busca inline;
- espera e bloqueio como rotinas reais;
- recursos em subvisao.

Aceite:

- recepcao reserva em poucos cliques;
- sem banner global persistente.

## MGMT-ACADEMY-01 - Academia V2 Continuidade

Problema:

- Academia precisa consolidar aluno/usuario/contrato, rotina e reposicao.

Solucao desejada:

- seguir `ACADEMY_V2_UX_PLAN.md` sem voltar a blocos legados.

Implementacao esperada:

- Hoje, Grade, Alunos, Pendencias, Professores, Configuracao;
- chamada em drawer;
- nova matricula visivel;
- creditos e solicitacoes separados.

Aceite:

- secretaria opera sem cacar;
- professor ve rotina;
- financeiro ve cobrancas.

## MGMT-FINANCE-01 - Financeiro Por Cobranca

Problema:

- financeiro pode parecer relatorio antes de fila.

Solucao desejada:

- abrir com quem cobrar agora.

Implementacao esperada:

- vencidos;
- vence hoje;
- origem da cobranca;
- marcar pago;
- enviar lembrete;
- despesas secundarias.

Aceite:

- permissao respeitada;
- origem da cobranca clara.

## MGMT-CRM-01 - CRM Como Fila De Relacionamento

Problema:

- CRM pode virar lista generica sem proxima acao.

Solucao desejada:

- leads e follow-ups acionaveis.

Implementacao esperada:

- rows de lead/follow-up;
- drawer de contato;
- WhatsApp secundario;
- converter/arquivar claros.

Aceite:

- CRM nao duplica financeiro;
- usuario sabe quem contatar.

## MGMT-CANTEEN-01 - Cantina/POS Por Venda Rapida

Problema:

- cantina pode aparecer como KPI sem modulo ativo.

Solucao desejada:

- se ativo, venda rapida; se inativo, nao polui painel.

Implementacao esperada:

- vender produto;
- estoque baixo;
- vendas do dia;
- plano respeitado.

Aceite:

- modulo desativado nao aparece como operacao;
- venda em poucos toques.

## MGMT-TEAM-01 - Equipe E Permissoes Por Aceite

Problema:

- convite/equipe pode mostrar email cru, acesso antecipado ou erro.

Solucao desejada:

- buscar usuario, convidar, aceitar, liberar acesso.

Implementacao esperada:

- autocomplete por nome/email;
- card mostra nome quando usuario existe;
- convite pendente separado;
- papel controla menu/rota.

Aceite:

- torneio/liga/local so aparece apos aceite;
- erro amigavel.

## MGMT-SETTINGS-01 - Ajustes Como Configuracao

Problema:

- ajustes competem com rotina.

Solucao desejada:

- configuracao estrutural separada da operacao.

Implementacao esperada:

- dados publicos;
- recursos;
- regras;
- planos;
- permissoes;
- publicacao.

Aceite:

- operador nao precisa passar por ajustes para rotina diaria.

## PUBLIC-PLACE-01 - Pagina Publica Do Local

Problema:

- local publico pode expor gestao ou informacao excessiva.

Solucao desejada:

- converter por intencao: reservar, aula, evento, contato.

Implementacao esperada:

- marca/local;
- CTAs claros;
- informacao publica curta;
- detalhes em tabs/sections.

Aceite:

- visitante nao ve cockpit;
- caminho para acao e direto.

## PUBLIC-COMP-01 - Pagina Publica De Competicao

Problema:

- competicao publica pode herdar interface de organizador.

Solucao desejada:

- evento publico com poster, data, local, categorias e CTA.

Implementacao esperada:

- mesmo padrao de `COMP-UX-02`;
- sem fila de organizador;
- compartilhamento claro.

Aceite:

- jogador entende o evento e a inscricao.

## QA-ROLE-01 - QA Manual Por Papel

Problema:

- regressao por papel pode passar despercebida.

Solucao desejada:

- reexecutar jornadas reais por perfil.

Implementacao esperada:

- jogador puro;
- organizador;
- gestor;
- recepcao;
- financeiro;
- professor;
- prints mobile/desktop.

Aceite:

- bugs P0/P1 entram na queue;
- telas indevidas por papel sao bloqueadas.

## QA-DESIGN-01 - Auditoria Visual

Problema:

- areas novas podem perder DNA ou voltar ao empilhamento.

Solucao desejada:

- checklist visual de consistencia.

Implementacao esperada:

- comparar Player, Competition e Management;
- detectar card overload, KPI inutil, duplicidade, mobile longo;
- validar 390px.

Aceite:

- app parece uma unica plataforma;
- cada modo tem densidade certa.
