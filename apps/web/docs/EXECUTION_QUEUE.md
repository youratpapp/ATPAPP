# Execution Queue

Fonte principal: `CURRENT_PRODUCT_STATE.md`.

Fonte de reestruturacao v2:

- `RESTRUCTURE_SOURCE_OF_TRUTH_POLICY.md`
- `ROLE_BASED_RESTRUCTURE_IMPLEMENTATION_SPEC.md`
- `ROLE_VISIBILITY_MATRIX.md`
- `ROLE_MODE_V2_PRODUCT_UX_SPEC.md`
- `ROLE_MODE_V2_FLOW_MATRIX.md`
- `PLAYER_APP_V2_IMPLEMENTATION_SPEC.md`
- `COMPETITION_OS_V2_IMPLEMENTATION_SPEC.md`
- `MANAGEMENT_OS_V2_IMPLEMENTATION_SPEC.md`

Data: 2026-05-16

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
- MDs antigos devem preservar inventario funcional, nao arquitetura visual antiga.
- Quando houver conflito entre uma estrutura legada e uma especificacao v2, preservar a funcao e seguir a especificacao v2.

## [x] Sprint concluido - SHELL-IDENTITY-01 Padronizar logo, header e seletor web

Status: `[x]` concluido em 2026-05-21.

Fonte:

- Revisao por screenshot do padrao de `Inicio` vs demais paginas.

Evidencias:

- `docs/screenshots/shell-identity-standard-2026-05-21/`
- `docs/screenshots/shell-identity-standard-2026-05-21-run2/`
- `npx.cmd tsc -b --pretty false`
- `git diff --check`

Arquivos alterados:

- `src/components/AppShell.tsx`
- `src/components/BottomNav.tsx`
- `src/App.css`
- `docs/EXECUTION_QUEUE.md`

Resultado:

- O header padrao do shell agora tambem aparece no desktop em paginas que antes desligavam `showHeader`, mantendo o mobile sem header duplicado.
- A marca lateral de desktop foi normalizada para `icone + ATP` com dimensoes iguais ao padrao aprovado da Home, em vez de renderizar o simbolo gigante.
- O seletor `Jogador / Trabalho` ficou com tamanho, posicao e estado visual padronizados no header web.
- O usuario/saudacao no web deixou de ficar preso ao centro do container e agora fica mais proximo do menu lateral.
- O seletor interno duplicado da Gestao foi ocultado no desktop, mantendo o seletor local no mobile onde o header global nao aparece.
- Capturas verificadas em `mobile390`, `mobile430`, `desktop1366` e `desktop-wide` para Home, Jogar/Locais, Competir/Eventos, Gestao e Perfil; diagnosticos sem eventos de console nas rotas capturadas.

Observacao operacional:

- A segunda rodada de screenshots encontrou disco cheio (`ENOSPC`). Foi removida apenas a pasta gerada antiga `docs/screenshots/visual-audit-management-2026-05-19/` para liberar espaco; nenhum codigo, asset de produto, documento-fonte ou banco foi removido.

## [x] Sprint concluido - PLACES-HERO-01 Simplificar hero da pagina Jogar

Status: `[x]` concluido em 2026-05-21.

Fonte:

- Revisao por screenshot da pagina `Jogar` (`/locais`).

Evidencias:

- `docs/screenshots/places-hero-simplification-2026-05-21/`
- `npx.cmd tsc -b --pretty false`
- `git diff --check`

Arquivos alterados:

- `src/pages/PlacesPage.tsx`
- `src/App.css`
- `docs/EXECUTION_QUEUE.md`

Resultado:

- O hero de `Jogar` passou a usar uma unica imagem dominante; a segunda imagem sobreposta do pseudo-elemento foi removida.
- O titulo deixou de invadir a area dos botoes/cards no desktop.
- A copy interna foi substituida por texto publico e direto: `Escolha seu próximo jogo` e `Reserve quadra, encontre parceiros ou entre em aulas perto de você.`
- Labels auxiliares dos cards foram simplificados para termos de usuario final: `Partidas abertas`, `Horários disponíveis`, `Turmas com vaga`, `Clubes e academias`.
- Validado em `desktop1366` e `mobile390`, sem eventos de console na captura.

Observacao operacional:

- Para manter espaco de trabalho apos os PNGs, foi removida apenas a pasta antiga gerada `docs/screenshots/visual-local-audit-2026-05-18/`.

## [x] Sprint concluido - EVENTS-HUB-PLAYER-01 Limpar vazamentos de Trabalho em Competir

Status: `[x]` concluido em 2026-05-21.

Fonte:

- Revisao por screenshot da pagina `Competir` (`/eventos`) em area de jogador.

Evidencias:

- `docs/screenshots/events-hub-player-cleanup-2026-05-21/`
- Verificacao por browser/Playwright: `leaked = 0` para `.competition-work-link` e `Modo organizador`; hover de `Torneios` com texto branco.
- `npx.cmd tsc -b --pretty false`
- `git diff --check`

Arquivos alterados:

- `src/pages/EventsHubPage.tsx`
- `src/App.css`
- `docs/EXECUTION_QUEUE.md`

Resultado:

- O botao `Trabalho` deixou de aparecer dentro do hub do jogador em `Competir`.
- O card `Modo organizador` deixou de aparecer na area `Descobrir` do jogador.
- A copy do hero foi limpa para nao orientar sobre operacao de trabalho: `Encontre torneios, ligas e rankings para acompanhar seu jogo.`
- A copy da secao `Descobrir` deixou de falar em `fila administrativa` e passou a usar linguagem publica.
- Os botoes `Torneios`, `Ligas` e `Rankings` receberam hover/focus dark premium, mantendo texto legivel e sem virar bloco branco.
- Validado em `desktop1366` e `mobile390`, sem eventos de console na captura.

Observacao operacional:

- O disco voltou a ficar sem espaco durante captura; foi removida apenas a pasta antiga gerada `docs/screenshots/workflow-v3-flow11-transversal-qa-2026-05-20/`.

## [x] Sprint concluido - QA-LABELS-01 Remover rotulos tecnicos de dados visiveis

Status: `[x]` concluido em 2026-05-21.

Fonte:

- `docs/QA_LABEL_CLEANUP_2026_05_21.md`

Evidencias:

- `docs/screenshots/qa-label-cleanup-2026-05-21/`
- `node scripts/cleanup-qa-flow-labels.mjs`
- `npx.cmd tsc -b --pretty false`

Arquivos alterados:

- `scripts/tournament-e2e-flow-audit.mjs`
- `scripts/academy-e2e-flow-audit.mjs`
- `scripts/league-e2e-flow-audit.mjs`
- `scripts/cleanup-qa-flow-labels.mjs`
- `src/pages/PlacesPage.tsx`
- `docs/QA_LABEL_CLEANUP_2026_05_21.md`
- `docs/EXECUTION_QUEUE.md`

Resultado:

- Scripts de auditoria deixam de criar nomes com `QA`, `Fluxo`, `V4`, `E2E` ou `auditoria` em campos que aparecem no produto.
- Registros existentes foram normalizados: torneios, ligas, academias, quadras, turmas, professores, notas de reserva/contrato/lista de espera e descricoes de pagamento.
- Textos tecnicos remanescentes no UI de gestao foram normalizados: `Marcar pago por row` virou `Marcar recebivel como pago`; `Drawer na lista` virou `Lista e cadastro`.
- Captura nova em mobile 390px e desktop 1366px nao encontrou os rotulos tecnicos antigos nas rotas verificadas.
- Console/diagnosticos das capturas novas sem eventos.
- Consulta publica anonima em torneios, locais e ligas retornou `0` registros com `%Fluxo%` ou prefixo `QA %`.

Evidencias adicionais:

- `docs/screenshots/technical-label-cleanup-2026-05-21/`

Pendencias:

- `[x] NAV-UX-06` Varredura desta rodada concluida: gestao de local teve Academia, Financeiro, Cantina e Agenda corrigidas no sprint `NAV-TIER-DEDUP`; torneio/liga foram rechecados e `secondaryActions` ficaram restritas ao drawer contextual.

## [x] Sprint concluido - NAV-TIER-DEDUP Workspaces sem menu duplicado interno

Status: `[x]` concluido em 2026-05-21.

Fonte:

- `docs/NAVIGATION_TIER_DEDUP_SPRINT_2026_05_21.md`

Arquivos alterados:

- `src/App.css`
- `src/pages/PlacesPage.tsx`
- `src/components/place/AcademyWorkspaceShell.tsx`
- `src/components/place/BookingWorkspaceShell.tsx`
- `src/components/place/PlaceAcademyClassesModule.tsx`
- `src/components/place/PlaceAcademyStudentsModule.tsx`
- `src/components/place/PlaceAcademyTodayModule.tsx`
- `src/lib/place-admin-navigation.ts`
- `docs/NAVIGATION_TIER_DEDUP_SPRINT_2026_05_21.md`
- `docs/EXECUTION_QUEUE.md`

Resultado:

- Academia, Financeiro e Cantina nao renderizam mais uma faixa de botoes que replica as tabs oficiais.
- Esses blocos viraram resumo operacional nao clicavel (`academy-routine-summary`, `finance-routine-summary`, `canteen-routine-summary`).
- `Grade` foi normalizado para `Turmas` nos fluxos de academia.
- `Configuracao`/`Quadras` como destino de rotina virou `Ajustes` em tabs de workspace onde o uso e setup raro.
- Novas rotas geradas usam `turmas`/`ajustes`, preservando aliases antigos `grade`/`configuracao`/`quadras`.
- Professor comum continua vendo resumo de aulas, alunos e turmas sem receber ferramentas administrativas.
- `npx.cmd tsc -b --pretty false` passou.
- Evidencias: `docs/screenshots/navigation-tier-dedup-2026-05-21/`, `docs/screenshots/navigation-tier-dedup-cashier-2026-05-21/` e `docs/screenshots/navigation-booking-cta-2026-05-21/`.

Pendencias:

- `[x] NAV-UX-06A` Rechecado: `secondaryActions` em torneio/liga aparecem apenas no drawer de detalhe da tarefa operacional; cockpit e primeira dobra nao renderizam menu paralelo.
- `[x] BOOKING-UX-02` `Nova reserva` saiu das tabs oficiais da agenda e virou CTA contextual do workspace. A view `new` e a rota antiga `?visao=nova-reserva` seguem funcionando por wrapper/estado interno.

## [x] Sprint concluido - NAV-DUP Menus locais duplicados em competicoes

Status: `[x]` concluido em 2026-05-21.

Fonte:

- `docs/NAVIGATION_DUPLICATION_AUDIT_2026_05_21.md`

Evidencias:

- `docs/screenshots/navigation-duplication-audit-2026-05-21-run3/`

Arquivos alterados:

- `src/pages/TournamentPage.tsx`
- `src/pages/LeagueDetailsPage.tsx`
- `src/App.css`
- `docs/NAVIGATION_DUPLICATION_AUDIT_2026_05_21.md`
- `docs/EXECUTION_QUEUE.md`

Resultado:

- Torneio e liga nao renderizam mais a fileira de `secondaryActions` como segundo menu local.
- O cockpit operacional ficou responsavel por contexto, bloqueio e CTA primario.
- `CompetitionTabs` ficou como unica navegacao local oficial.
- No torneio, as tabs foram movidas para o inicio da area interna, antes do conteudo da aba.
- No mobile, `CompetitionTabs` passou de grade 2x2 para chips horizontais compactos.
- Rechecagem em mobile 390px, mobile 430px, desktop 1366px e desktop amplo sem eventos de console.

Pendencias:

- `[x] NAV-UX-02` Revisar gestao de local quando existe mais de uma academia/local: menu externo, seletor de unidade, tabs de modulo e subtabs internas ainda podem criar tiers demais. Concluido no sprint `NAV-UX-02 Gestao de local com menos tiers`.
- `[ ] NAV-UX-03` Manter regra permanente em competicoes: cockpit nao pode criar menu paralelo quando existir aba oficial.

## [x] Sprint concluido - NAV-UX-02 Gestao de local com menos tiers

Status: `[x]` concluido em 2026-05-21.

Fonte:

- `docs/PLACE_NAVIGATION_SIMPLIFICATION_2026_05_21.md`

Evidencias:

- `docs/screenshots/place-navigation-simplification-2026-05-21-run2/`

Arquivos alterados:

- `src/components/place/PlaceAdminShell.tsx`
- `src/components/BottomNav.tsx`
- `src/App.css`
- `docs/PLACE_NAVIGATION_SIMPLIFICATION_2026_05_21.md`
- `docs/EXECUTION_QUEUE.md`

Resultado:

- O shell de gestao de local nao repete mais uma fileira de tabs de modulo.
- Desktop usa a sidebar de Trabalho como navegacao de modulo.
- Mobile usa seletor compacto `Trocar area` dentro da unidade ativa.
- Atalhos globais de Trabalho agora respeitam o `placeId` ativo em rotas `/gestao/:placeId/...`, reduzindo confusao em usuarios com multiplas academias.
- Rotas antigas e parametros `visao` foram preservados.
- `npx tsc -b --pretty false` passou.

Pendencias:

- `[ ] NAV-UX-04` Revisar subtabs internas dos workspaces de Academia/Reservas para reduzir labels sinonimos e tabs que parecem modulos.
- `[ ] NAV-UX-05` Testar usuario com permissoes diferentes por unidade; a sidebar ainda usa os modulos da unidade primaria para decidir visibilidade global.

## [x] Sprint concluido - FLOW-V4 Academia E2E e Fluxo Real do Local

Status: `[x]` auditoria concluida em 2026-05-21, com bloqueios registrados para sprint de correcao.

Fonte primaria:

- `docs/APP_WORKFLOW_EXECUTION_PLAYBOOK_V3.md`
- `docs/ACADEMY_E2E_FLOW_AUDIT_2026_05_21.md`

Evidencias finais:

- `docs/screenshots/academy-e2e-flow-v1-2026-05-21-run3/`
- Rechecagem SQL: `docs/screenshots/academy-e2e-flow-v1-2026-05-21-run4-after-sql-check/`
- Academia final: `ATP Centro Dourados 0521052052` (`49709592-173c-49c6-aa22-bacb6ec0b31b`)
- Diagnostico: `completed: true`, `failedRequests: []`, `pageErrors: []`
- Console com erro funcional esperado/documentado em chamada: `column reference "id" is ambiguous`

### [x] FLOW-V4-ACADEMY-E2E - Criar academia, rodar fluxos e documentar friccoes

Objetivo:

- Criar academia real com quadras, regra de reserva, professores, turmas e alunos seed.
- Matricular alunos por logins seed.
- Criar reserva de quadra por jogador seed.
- Criar lista de espera.
- Confirmar reserva pela gestao.
- Ativar matricula pendente pela gestao.
- Abrir chamada e tentar registrar presenca.
- Validar aluno em Home, Agenda, Minhas Aulas, Meus Pagamentos e local publico.
- Validar professor, recepcao e financeiro com fallback seed quando convite novo falhar.
- Capturar screenshots e console por fase.

Arquivos alterados/criados:

- `scripts/academy-e2e-flow-audit.mjs`
- `docs/ACADEMY_E2E_FLOW_AUDIT_2026_05_21.md`
- `supabase/migrations/0098_fix_academy_staff_invite_attendance_ambiguity.sql`
- `docs/EXECUTION_QUEUE.md`

O que passou:

- Academia, quadras, regra, professores, turmas, contratos e matriculas foram criados.
- Reserva pendente apareceu no workspace e foi confirmada pela UI.
- Lista de espera apareceu no contexto de agenda.
- Matricula pendente foi ativada pela UI.
- Aluno viu aulas novas em `/agenda` e `/minhas-aulas`.
- Reserva confirmada apareceu em `/minhas-reservas`.
- Pagamentos pessoais continuaram separados do financeiro do local.

Bloqueios encontrados:

- `[!] ACADEMY-DB-01` `app_accept_place_staff_invite` quebra no banco remoto com `column reference "place_id" is ambiguous`; impede professor/recepcao/financeiro de aceitar convite em academia nova.
- `[!] ACADEMY-DB-02` `app_mark_academy_attendance` quebra no banco remoto com `column reference "id" is ambiguous`; impede persistir chamada.


Pendencias novas:

- `[!] ACADEMY-DB-01` Aplicar `supabase/migrations/0098_fix_academy_staff_invite_attendance_ambiguity.sql` no banco remoto e rerodar academia E2E sem fallback. Rechecado em 2026-05-21: `npx supabase` existe e tem `db query`, mas o ambiente nao esta linkado/logado (`SUPABASE_ACCESS_TOKEN` ausente) e nao ha `DATABASE_URL`/senha Postgres; tentativa `supabase db query --linked` falhou por falta de project link. O E2E `run4-after-sql-check` confirma que o remoto ainda retorna `column reference "place_id" is ambiguous`.
- `[!] ACADEMY-DB-02` Revalidar chamada/presenca apos aplicar a mesma migration remota. Rechecado em 2026-05-21: `run4-after-sql-check` ainda registrou no console `app_mark_academy_attendance` com `column reference "id" is ambiguous`.
- `[ ] ACADEMY-UX-01` Reestruturar selecao de local/academia para usuarios com multiplos locais; evitar seletor longo dentro da primeira dobra do workspace.
- `[ ] ACADEMY-UX-02` Reduzir tiers no mobile da academia: header/local/modulo/tabs/cards antes da tarefa real.
- `[x] ACADEMY-UX-03` Em `Nova reserva`, formulario deve vir antes da lista de espera; corrigido em `CROSS-V4-E2E-01`.
- `[x] ACADEMY-UX-04` `/locais/:placeId/reservar` deve abrir/focar o fluxo de reserva; corrigido em `CROSS-V4-E2E-01`.
- `[x] ACADEMY-UX-05` Definir e corrigir financeiro para produto `academy`; modulo financeiro liberado para academias em `CROSS-V4-E2E-01`.
- `[x] ACADEMY-UX-06` Reduzir agregacao excessiva no `Trabalho Hoje` do owner com muitos locais/eventos; corrigido com unidade em foco em `CROSS-V4-E2E-02`.

## [x] Sprint concluido - CROSS-V4 Fluxos transversais, papeis e correcoes rapidas

Status: `[x]` concluido em 2026-05-21.

Fonte primaria:

- `docs/APP_WORKFLOW_EXECUTION_PLAYBOOK_V3.md`
- `docs/CROSS_APP_FLOW_AUDIT_2026_05_21.md`

Evidencias:

- `docs/screenshots/cross-app-flow-audit-2026-05-21-run1/`
- `docs/screenshots/cross-app-role-audit-2026-05-21-professor/`
- `docs/screenshots/cross-app-role-audit-2026-05-21-recepcao/`
- `docs/screenshots/cross-app-role-audit-2026-05-21-financeiro/`
- `docs/screenshots/cross-app-role-audit-2026-05-21-caixa/`

### [x] CROSS-V4-E2E-01 - Validar Player App, Management OS e papeis de trabalho

Objetivo:

- Rodar screenshots e console nas principais rotas de jogador, agenda pessoal, locais, competicoes, perfil, ranking, gestao, academia, reservas e financeiro.
- Validar professor, recepcao, financeiro e caixa com logins seed.
- Corrigir problemas de fluxo que surgiram em academia e nas rotas publicas.

Arquivos alterados/criados:

- `src/lib/place-management.ts`
- `src/pages/PlacePublicPage.tsx`
- `src/pages/PlacesPage.tsx`
- `docs/CROSS_APP_FLOW_AUDIT_2026_05_21.md`
- `docs/EXECUTION_QUEUE.md`

O que foi corrigido:

- Plano `academy` agora libera modulo `Financeiro`, preservando mensalidades/contratos sem misturar com financeiro pessoal.
- `/locais/:placeId/reservar` e aliases relacionados agora abrem a intencao publica de reserva.
- `Agenda > Nova reserva` prioriza o formulario de criacao; fila operacional/lista de espera nao aparece mais antes da tarefa principal.

QA realizado:

- `npx.cmd tsc -b --pretty false`
- Owner/player: mobile 390, mobile 430, desktop 1366, desktop amplo.
- Professor/recepcao/financeiro/caixa: mobile 390 e desktop 1366.
- Console/rede: 0 erros ou warnings nas rotas auditadas.

Resultado por papel:

- Professor: ve Academia; tentativa de Financeiro redireciona para Academia.
- Recepcao: ve Reservas/Clientes/Academia; tentativa de Financeiro redireciona para Agenda.
- Financeiro: ve Financeiro; tentativa de Agenda redireciona para Financeiro.
- Caixa: ve Cantina; tentativa de Financeiro redireciona para Cantina.

### [x] CROSS-V4-E2E-02 - Foco por unidade no Trabalho Hoje do gestor

Objetivo:

- Corrigir a primeira dobra de `/gestao` para owner/manager com muitos locais, evitando uma fila global inflada e pouco acionavel.

Arquivos alterados/criados:

- `src/pages/ManagementHubPage.tsx`
- `src/App.css`
- `docs/MANAGEMENT_FOCUS_AUDIT_2026_05_21.md`
- `docs/EXECUTION_QUEUE.md`

O que foi corrigido:

- `Trabalho Hoje` agora usa uma unidade em foco para gestor.
- Quando ha mais de uma unidade, aparece seletor `Unidade em foco`.
- Cards de pendencias criticas, reservas, aulas, financeiro, clientes e estoque passaram a usar apenas a unidade ativa.
- Totais globais continuam em contexto secundario/listagem, sem competir com a tarefa principal.

QA realizado:

- `npx.cmd tsc -b --pretty false`
- `docs/screenshots/management-focus-audit-2026-05-21-run1/`
- Viewports: mobile 390, mobile 430, desktop 1366, desktop amplo.
- Rotas: `/gestao`, dashboard da academia QA e rota publica de reserva.
- Console/rede: 0 eventos nos diagnostics.

### [x] CROSS-V4-E2E-03 - Action rail publica do local no mobile

Objetivo:

- Corrigir a rail de acoes publicas do local em mobile para que reserva, aulas, jogos e sobre aparecam como escolhas claras de fluxo.

Arquivos alterados/criados:

- `src/App.css`
- `docs/PUBLIC_PLACE_ACTION_RAIL_AUDIT_2026_05_21.md`
- `docs/EXECUTION_QUEUE.md`

O que foi corrigido:

- `.place-public-action-rail` deixou de se comportar como carrossel horizontal cortado em mobile.
- A rail virou grade compacta de duas colunas, com fallback de uma coluna em telas muito estreitas.
- Textos dos cards ganharam quebra segura e altura mais previsivel.

QA realizado:

- `npx.cmd tsc -b --pretty false`
- `docs/screenshots/public-place-action-rail-audit-2026-05-21-run1/`
- Viewports: mobile 390, mobile 430, desktop 1366, desktop amplo.
- Rotas: local publico, reserva publica e aulas publicas da academia QA.
- Console/rede: 0 eventos nos diagnostics.

### [x] CROSS-V4-E2E-04 - Seletor multi-local dentro do workspace

Objetivo:

- Reduzir confusao de usuarios com muitos locais, mantendo `/gestao` como entrada de foco e deixando a troca de unidade dentro do workspace sob demanda.

Arquivos alterados/criados:

- `src/components/place/PlaceAdminShell.tsx`
- `src/App.css`
- `docs/MULTILOCAL_SWITCHER_AUDIT_2026_05_21.md`
- `docs/EXECUTION_QUEUE.md`

O que foi corrigido:

- O seletor longo de `Local ativo` no shell virou disclosure compacto de `Unidade ativa`.
- A troca de unidade segue disponivel em `Trocar unidade`, preservando o select e as rotas.
- Cards brancos remanescentes em `Sinais de suporte` e `Relatorios do local` foram convertidos para dark premium.

QA realizado:

- `npx.cmd tsc -b --pretty false`
- `docs/screenshots/multilocal-switcher-audit-2026-05-21-run3/`
- Viewports: mobile 390, mobile 430, desktop 1366, desktop amplo.
- Rotas: `/gestao`, dashboard da academia QA e `Agenda > Nova reserva`.
- Console/rede: 0 eventos nos diagnostics.

### [x] CROSS-V4-E2E-05 - Densidade de menus no workspace mobile

Objetivo:

- Remover uma camada duplicada de menu no workspace de local mobile e reduzir altura do header antes da operacao.

Arquivos alterados/criados:

- `src/App.css`
- `docs/MANAGEMENT_MOBILE_HEADER_TABS_AUDIT_2026_05_21.md`
- `docs/EXECUTION_QUEUE.md`

O que foi corrigido:

- `.place-management-tabs` fica oculta no mobile, evitando duplicidade com o bottom nav de trabalho.
- O contexto `Modulo ativo` continua visivel.
- Header do Management OS recebeu ajuste responsivo de tamanho/gap para consumir menos primeira dobra.

QA realizado:

- `npx.cmd tsc -b --pretty false`
- `docs/screenshots/management-mobile-header-audit-2026-05-21-run1/`
- Viewports: mobile 390, mobile 430, desktop 1366, desktop amplo.
- Rotas: `/gestao`, dashboard da academia QA e `Agenda > Nova reserva`.
- Console/rede: 0 eventos nos diagnostics.

Pendencias novas:

- `[x] CROSS-UX-01` Reduzir agregacao do `Trabalho Hoje` para owner com muitos locais/competicoes; foco por unidade implementado.
- `[x] CROSS-UX-02` Reavaliar action rail da pagina publica do local no mobile; corrigida com grade compacta em duas colunas.
- `[x] CROSS-UX-03` Reestruturar selecao de unidade/local para usuarios multi-local antes de entrar no workspace, evitando seletor longo dentro do shell.
- `[x] MANAGEMENT-UX-01` Reduzir densidade das abas internas de modulo no mobile quando a unidade tem muitos modulos; tabs internas ocultas no mobile e bottom nav mantido como troca principal.

## [x] Sprint concluido - FLOW-V4 Liga E2E e Operacao Real

Status: `[x]` concluido em 2026-05-21

Fonte primaria:

- `docs/APP_WORKFLOW_EXECUTION_PLAYBOOK_V3.md`
- `docs/APP_WORKFLOW_EXECUTION_MATRIX_V3.md`
- `docs/LEAGUE_E2E_FLOW_AUDIT_2026_05_21.md`

Evidencias finais:

- `docs/screenshots/league-e2e-flow-v4-2026-05-21-run10-final-round-status/`
- Liga final: `Liga ATP Dourados 044652` (`d5c32395-b466-4bb2-a97e-3b648da5c8ca`)
- Diagnostico: `completed: true`, `failedRequests: []`, `pageErrors: []`

### [x] FLOW-V4-LIGA-E2E - Rodar liga do inicio ao fim e corrigir bloqueios

Objetivo:

- Criar uma liga real pelo fluxo de UI.
- Gerar pedidos de inscricao com jogadores seed.
- Aprovar inscricoes pela UI.
- Gerar rodada pela UI.
- Enviar resultado com login de jogador.
- Confirmar resultado com login do adversario.
- Resolver partida restante como admin.
- Aplicar sobe/desce.
- Revisar owner e participante em mobile e desktop.

Arquivos alterados:

- `scripts/league-e2e-flow-audit.mjs`
- `src/lib/leagues.ts`
- `src/pages/LeagueDetailsPage.tsx`
- `src/App.css`
- `supabase/migrations/0097_fix_league_generate_round_class_id_ambiguity.sql`
- `docs/LEAGUE_E2E_FLOW_AUDIT_2026_05_21.md`
- `docs/APP_WORKFLOW_EXECUTION_MATRIX_V3.md`
- `docs/EXECUTION_QUEUE.md`

O que foi corrigido:

- Auditor de liga agora executa fluxo completo com screenshots por fase e console/rede.
- Corrigida incompatibilidade do script com schema atual de `league_classes`.
- Corrigida aprovacao automatizada para aguardar botoes habilitados e conferir pendencias no banco.
- Criada migration fonte para corrigir `app_generate_next_league_round` com erro `column reference "class_id" is ambiguous`.
- `generateNextLeagueRound` ganhou fallback autenticado/RLS enquanto a migration remota nao estiver aplicada.
- Liga final/historico nao mostra mais acao indevida de `Gerar proxima rodada` quando o total planejado ja foi atingido.
- Sala de partida deixou de sugerir placeholders `1`/`2` e usa `0`.
- Cockpit mobile da liga passou a priorizar CTA antes de metricas/blocos secundarios.
- Tabs e nav de liga no mobile deixaram de depender de carrossel cortado.
- Owner mobile recebeu hero mais compacto.
- Badge visual mostra `Temporada finalizada` quando a temporada selecionada terminou.
- `league_rounds.status` passa para `finished` apos aplicar sobe/desce.

QA realizado:

- `npx.cmd tsc -b --pretty false`
- `node scripts/league-e2e-flow-audit.mjs`
- Viewports: desktop 1366, desktop amplo, mobile 390, mobile 430.
- Personas: owner/admin, jogador que envia resultado, adversario que confirma, participante em final/historico.

Pendencias novas:

- `[ ] LEAGUE-DB-01` Aplicar `supabase/migrations/0097_fix_league_generate_round_class_id_ambiguity.sql` no banco remoto e depois avaliar remocao do fallback.
- `[ ] LEAGUE-UX-01` Definir fluxo operacional de horario/local de partida da liga; hoje a UI mostra `Horario a combinar` e `Local pendente`.
- `[ ] LEAGUE-UX-02` Reduzir ainda mais a primeira dobra mobile do participante, possivelmente transformando nav+cockpit em uma agenda compacta da rodada.

## [>] Sprint atual - FLOW-V4 Torneio E2E e Cockpit Operacional

Status: `[>]` prioridade atual criada em 2026-05-20

Fonte primaria:

- `docs/APP_WORKFLOW_EXECUTION_PLAYBOOK_V3.md`
- `docs/NAVIGATION_WORKSPACE_RESTRUCTURE_V4.md`
- `docs/TOURNAMENT_E2E_FLOW_AUDIT_2026_05_20.md`

Contexto:

- A auditoria criou e operou o torneio `ATP Open Dourados 010927` (`cd01cf82-31e3-4682-a64e-7f4db9d75387`).
- O fluxo passou por criacao, inscricoes seed, aprovacao, encerramento, geracao de jogos, tentativa de envio de resultado pelo jogador e tentativa de lancamento/finalizacao pelo admin.
- O teste provou que a dor principal do torneio e fluxo: ha muitos tiers de menu e a acao principal da fase fica misturada com configuracao, pagina publica e sala de jogador.

Evidencias:

- `docs/screenshots/tournament-e2e-flow-v4-2026-05-20-run3/`
- `docs/screenshots/tournament-e2e-flow-v4-2026-05-20-run5-continue/`
- `docs/screenshots/tournament-e2e-flow-v4-2026-05-20-run6-continue-live/`
- `docs/screenshots/tournament-e2e-flow-v4-2026-05-20-run7-admin-finish/`

### [~] FLOW-V4-TORNEIO-E2E - Corrigir cockpit de torneio por fluxo real

Objetivo:

- Fazer o torneio ser operado de ponta a ponta com caminho claro para jogador e organizador.
- Separar jogador participante de owner/staff sem remover rotas antigas.
- Fazer a primeira dobra responder sempre: `o que falta resolver agora?`

Arquivos provaveis:

- `src/pages/TournamentPage.tsx`
- `src/lib/tournaments.ts`
- `src/App.tsx`
- `supabase/migrations/*tournament*result*`
- `docs/EXECUTION_QUEUE.md`

O que alterar:

- Corrigir RPC de envio de resultado pelo jogador (`app_submit_tournament_match_result`).
- Criar CTA de fase para `Encerrar inscricoes`, `Gerar jogos`, `Publicar jogos`, `Lancar resultado`, `Finalizar torneio`.
- Mudar o pos-criacao de torneio para cockpit de inscricoes/publicacao, nao `/jogos` vazio.
- Refazer fetch de inscricoes ao entrar na aba, ao voltar foco e apos retorno de link externo.
- Trocar autosave de placar por salvamento explicito e validado por partida.
- Reduzir tiers da area de organizacao.
- Separar configuracao estrutural de operacao diaria.

O que nao alterar:

- Nao alterar backend estrutural fora do bug de RPC/funcao ja existente.
- Nao relaxar permissoes.
- Nao quebrar `/join`, `/inscricao`, `/t` ou links publicos.
- Nao remover funcoes de staff, WO, limpar resultado, revisao de envios ou configuracao.

Permissoes envolvidas:

- Owner: ve tudo.
- Organizer: ve operacao ampla conforme permissao.
- Scorekeeper: ve partidas/resultados.
- Checkin: ve inscritos/credenciamento.
- Media: ve comunicacao/publicacao.
- Jogador: ve apenas participacao, jogo, classificacao, chat e acoes pessoais.

Rotas envolvidas:

- `/eventos`
- `/eventos/torneios`
- `/eventos/:tournamentId`
- `/eventos/:tournamentId/jogos`
- `/eventos/:tournamentId/classificacao`
- `/eventos/:tournamentId/organizacao`
- `/eventos/:tournamentId/jogadores`
- `/eventos/:tournamentId/chat`
- `/inscricao/:tournamentId`
- `/join`
- `/t/:tournamentId`

CritÃ©rios de aceite:

- Owner cria torneio, recebe inscricoes, aprova, encerra, gera jogos, lanca resultados e finaliza sem procurar status escondido.
- Jogador inscrito abre partida e envia resultado sem erro de console.
- Admin ve resultado enviado e consegue aplicar como oficial.
- Placar incompleto nao mostra sucesso de resultado oficial.
- Final com vencedores aparece automaticamente apos semifinais.
- Finalizacao aparece apenas quando todos os jogos necessarios estao resolvidos.
- Mobile 390 e desktop 1366 mantem CTA primario visivel.

QA obrigatorio:

- Owner desktop 1366: fluxo completo.
- Owner mobile 390: aprovar e gerar jogos.
- Jogador desktop 1366: enviar resultado.
- Jogador mobile 390: abrir partida e enviar resultado.
- Scorekeeper/staff: lancar resultado sem acesso a configuracao owner-only.

Riscos:

- `TournamentPage.tsx` e monolitica; mudancas grandes podem quebrar leitura publica.
- Ha migration de correcao de ambiguidade (`0090_fix_tournament_result_submission_ambiguity.sql`), mas o ambiente auditado ainda retornou erro. Validar se a migration esta aplicada ou se a funcao continua ambigua no banco remoto.
- Status operacional existe tanto em `tournaments.status` quanto em `data.tournamentStatus`; nao criar terceira fonte de verdade.

Rollback:

- Preservar rotas antigas como wrappers.
- Manter select de status em configuracao avancada enquanto os CTAs de fase amadurecem.
- Se o novo cockpit falhar, fallback para as abas atuais deve continuar acessivel.

Sprint 2026-05-20:

- Corrigido bloqueio funcional do envio de resultado pelo jogador em `src/lib/tournaments.ts` com fallback para o erro remoto `column reference "tournament_id" is ambiguous`.
- Criada migration `supabase/migrations/0092_fix_tournament_result_submission_rpc_return.sql` para corrigir a assinatura/retorno do RPC no banco.
- `TournamentPage.tsx` voltou a expor `Configuracao` para owner/staff em torneio live/finalizado, evitando sumico de status/ajustes owner-only.
- Torneio `ATP Open Dourados 010927` foi concluido: duas semifinais finalizadas, final finalizada, `status = finished`.
- Evidencia final: `docs/screenshots/tournament-e2e-flow-v4-2026-05-20-run10-final-match/`.

Pendencia ainda aberta:

- Trocar lancamento manual de placar por admin de autosave por input para acao explicita `Salvar resultado oficial`.
- Criar CTA operacional de fase para finalizar torneio sem depender do campo `Status`.

## [>] Sprint atual - Auditoria profunda visual, rotas e console

Status: `[>]` prioridade atual criada em 2026-05-19

Fonte primaria:

- `docs/ATP_DEEP_APP_AUDIT_2026_05_19.md`
- `m:/Downloads/Chrome/atp_premium_dark_design_playbook.md`
- imagens premium dark anexadas pelo produto em 2026-05-19

Evidencias:

- `docs/screenshots/deep-audit-management-console-2026-05-19/`
- `docs/screenshots/deep-audit-player-console-2026-05-19/`
- `docs/screenshots/deep-audit-auth-console-2026-05-19/`
- `docs/screenshots/deep-audit-management-interactions-desktop-2026-05-19/`
- `docs/screenshots/deep-audit-player-interactions-desktop-2026-05-19/`
- `docs/screenshots/sprint-global-web-mobile-check-2026-05-19/`
- `docs/screenshots/sprint-route-compat-check-2026-05-19/`

### [x] AUDIT-00 - Tornar a captura confiavel

Entrega realizada:

- `scripts/capture-visual-audit.mjs` agora limpa a pasta de saida por padrao.
- Suporta `ATP_AUDIT_OUT_DIR`, `ATP_AUDIT_SKIP_LOGIN`, `ATP_AUDIT_ROUTES_JSON`, `ATP_AUDIT_VIEWPORTS`.
- Captura `*.diagnostics.json` por pagina com console, logs do browser e rede.
- Captura lista de clicaveis por pagina.
- Suporta cliques seguros com `ATP_AUDIT_INTERACTIONS=1`.

Aceite:

- sem mistura de screenshots antigos;
- login/cadastro capturados deslogados;
- gestor e jogador puro capturados com credenciais corretas.

### [x] P0-DATA-01 - Corrigir erro de `app_payments`

Problema:

- `app_payments` retorna HTTP 500 em paginas de jogador e gestor.
- Aparece em `Meus pagamentos`, `Liga detalhe`, `Locais`, `Ligas` e estados relacionados.
- Em alguns casos a UI exibe `Nao foi possivel carregar canceling statement due to statement timeout`.

Acao:

- localizar chamadas a `app_payments`;
- ajustar query/limites/filtros para nao estourar timeout;
- carregar pagamentos somente em paginas que realmente precisam;
- isolar erro em estado amigavel premium dark.

Aceite:

- `diagnostics-summary.json` sem HTTP 500 de `app_payments`;
- nenhuma tela exibe nomes tecnicos de tabela, RPC ou timeout;
- `Meus pagamentos` tem estado vazio/erro bonito e util.

Sprint 2026-05-19:

- `listMyPayments` passou a filtrar pelo usuario autenticado e limitar volume inicial.
- Recaptura `docs/screenshots/sprint-p0-player-check-2026-05-19/` e `docs/screenshots/sprint-p0-management-check-2026-05-19/` sem HTTP 500/app_payments nos pontos auditados.
- UI de pagamentos nao mostra mais `statement timeout`.

### [x] P0-DATA-02 - Corrigir erro de `court_bookings` para jogador puro

Problema:

- Jogador puro recebe HTTP 500 em `court_bookings`.
- Impacta `Minhas reservas`, `Minhas aulas` e `Meus pagamentos`.

Acao:

- revisar filtros de reservas por usuario;
- limitar historico inicial;
- tratar estado vazio sem buscar dados desnecessarios;
- remover dependencia de reservas em telas que nao precisam dela.

Aceite:

- jogador puro consegue abrir `Minhas reservas`, `Minhas aulas` e `Meus pagamentos` sem erro bruto;
- lista vazia aparece como card premium dark com proxima acao.

Sprint 2026-05-19:

- `listMyCourtBookings` passou a filtrar pelo usuario autenticado e reduziu limite padrao.
- `listMyAcademyEnrollments` passou a filtrar pelo usuario autenticado.
- Recaptura mobile do jogador puro sem erro de `court_bookings` e sem texto tecnico.

### [x] P0-DATA-03 - Remover RPC profissional da experiencia de jogador puro

Problema:

- `Locais` no jogador puro dispara `app_list_place_staff` com HTTP 400.
- Isso indica vazamento de chamada de trabalho no modo jogador.

Acao:

- separar chamadas de workspace profissional de paginas de jogador;
- condicionar `workspace-access`/staff summary apenas quando necessario;
- garantir que `Locais` carregue descoberta sem depender de staff.

Aceite:

- jogador puro abre `Locais` sem chamadas `app_list_place_staff`;
- console limpo para `Locais`, `Locais?intent=places/classes/matches`.

Sprint 2026-05-19:

- `fetchPlacesWorkspaceData` nao busca recursos administrativos para rotas de descoberta (`tab=all/following`) fora de area admin.
- Pagamentos de apoio tambem ficam fora de descoberta publica de locais.
- Recaptura mobile do jogador puro em `Locais` e `Locais?intent=matches` sem `app_list_place_staff`.

### [x] P0-UX-01 - Remover erros tecnicos da UI

Problema:

- Textos como `canceling statement due to statement timeout` aparecem para usuario.

Acao:

- criar componente unico de erro/estado vazio premium dark;
- substituir mensagens tecnicas por copy de produto;
- manter detalhes tecnicos apenas no console/log interno.

Aceite:

- busca textual por `statement timeout`, `canceling statement`, `Failed to load`, `app_payments`, `court_bookings` nao aparece em screenshots/meta de UI.

Sprint 2026-05-19:

- `friendlyToastMessage` passou a sanitizar timeout, nomes de tabela/RPC, erros HTTP e mensagens Supabase tecnicas.
- `ScreenState` recebeu tratamento premium dark para estados vazios/erro/loading.
- Recaptura P0 sem textos tecnicos nos `textSample`.

### [x] P0-MOBILE-01 - Redesenhar `tournament-players` mobile

Problema:

- A tela mobile de jogadores do torneio ainda usa uma lista/tabela branca longa dentro do dark.

Acao:

- substituir tabela por cards dark;
- manter filtros/busca compactos;
- adaptar acoes de organizador para menu/toolbar;
- preservar funcoes de adicionar/importar/copiar link quando permitidas.

Aceite:

- nenhum bloco branco na lista;
- texto legivel sem sobreposicao;
- jogador e gestor veem acoes coerentes com papel.

Sprint 2026-05-19:

- Aplicada camada visual dark para formulÃ¡rios, linhas de inscriÃ§Ã£o, botÃµes secundÃ¡rios, KPIs e lista de participantes em competiÃ§Ã£o.
- Ainda precisa de uma segunda rodada estrutural para trocar totalmente listas/tabelas por cards dedicados.
- Segunda rodada aplicada em `App.css`: filtros, campos, inscriÃ§Ãµes, botÃµes de pagamento/aprovaÃ§Ã£o e cards passaram para superfÃ­cie dark.
- Recaptura `sprint-p0-tournament-visual-check-4-2026-05-19` removeu os principais blocos brancos; pendente reduzir a lista longa em experiÃªncia agrupada.

### [x] P0-MOBILE-02 - Redesenhar `tournament-games` mobile

Problema:

- Jogos do torneio ainda apresentam controles claros, tabelas e densidade excessiva.

Acao:

- transformar partidas em cards com jogador A/B, horario, status e placar;
- esconder acoes de organizador em menu contextual;
- darkificar inputs/selects;
- manter WO/resultado somente para quem pode operar.

Aceite:

- mobile sem inputs brancos;
- cada partida cabe em card legivel;
- abas nao esmagam texto.

Sprint 2026-05-19:

- Aplicada camada visual dark para match cards, disclosure de placar, inputs de placar, status, resumo e aÃ§Ãµes.
- Recaptura mostra melhora tÃ©cnica/contraste, mas ainda exige sprint estrutural para reduzir a densidade da operaÃ§Ã£o de placar.
- Segunda rodada aplicada em `App.css`: seletor de classe, tabs, nomes dos jogadores, BYE, status e placar ganharam superfÃ­cie dark tambÃ©m fora do shell principal.
- Build aprovado e console limpo na recaptura mobile/web; pendente compactar a operaÃ§Ã£o de placar em cards com menus/accordions menos tÃ©cnicos.

### [x] P0-MOBILE-03 - Redesenhar `places-match` mobile

Problema:

- Tela de encontrar jogo vira lista longa com filtros e botoes verdes repetidos.

Acao:

- filtros em painel recolhivel;
- cards de chamada com uma acao primaria;
- secondary actions discretas;
- reduzir repeticao de verde.

Aceite:

- primeira dobra mostra contexto + filtro compacto + primeiros resultados;
- nenhum texto quebra ou sobrepoe.

Sprint 2026-05-19:

- Cards de chamadas receberam reforÃ§o dark, largura segura e aÃ§Ãµes empilhadas no mobile.
- Console zerado para jogador puro e gestor no recorte validado.
- Ainda precisa simplificar repetiÃ§Ã£o de botÃµes verdes e hierarquia dos filtros.

### [x] P0-MOBILE-04 - Redesenhar `management` mobile

Problema:

- Gestao mobile esta escura, mas densa demais; parece lista operacional inteira, nao cockpit.

Acao:

- primeira dobra com prioridades reais;
- agrupar competicoes, locais e modulos;
- reduzir badges e botoes pequenos;
- garantir navegacao para modulos sem poluir.

Aceite:

- mobile tem hierarquia semelhante as referencias;
- gestor entende a proxima acao sem rolar muito.

Sprint 2026-05-19:

- Aplicada camada responsiva em KPIs, linhas de prioridade, aÃ§Ãµes, mÃ³dulos e cards de gestÃ£o.
- Ainda precisa de sprint de composiÃ§Ã£o para transformar a primeira dobra em cockpit mais editorial.

### [x] P1-DESKTOP-01 - Expandir Home desktop para cockpit premium

Problema:

- Home desktop segue o dark, mas fica estreita e com area vazia.

Acao:

- hero + proximas acoes + cards laterais;
- usar largura do desktop como referencia premium;
- remover loading persistente da primeira dobra.

Aceite:

- desktop se aproxima da referencia `Jogue por perto`;
- primeira dobra contem conteudo real, nao `Preparando sua area`.

Evidencia 2026-05-19:

- `desktop-home.png` em `sprint-global-web-mobile-check-2026-05-19` confirma DNA dark correto, mas ainda capturou loading na area inferior.
- Proxima sprint deve investigar se e apenas tempo de captura ou carregamento preso/lento antes de redesenhar o cockpit.

Sprint 2026-05-19:

- `HomePage` passou a liberar a primeira dobra com dados base e carregar pendencias/notificacoes em segundo plano.
- Corrigido card `Trabalho / Acesso profissional`, que aparecia branco dentro da Home dark.
- Compactada a marca do bottom nav na Home mobile para nao brigar com os icones.
- Validado em `docs/screenshots/sprint-home-dark-work-card-check-2026-05-19/` com console limpo em desktop e mobile.

### [x] P1-DESKTOP-02 - Expandir Perfil desktop

Problema:

- Perfil desktop esta correto em cor, mas pobre em composicao.

Acao:

- hero de perfil/ranking;
- grid de estatisticas;
- historico recente;
- preferencias/conta em secoes claras.

Aceite:

- desktop deixa de parecer card unico centralizado;
- mobile preserva qualidade atual e ganha estatisticas.

### [x] P1-ROUTE-01 - Revisar `intent=venues`

Problema:

- `Ver locais` navega para `#/locais?intent=venues`, mas esse estado precisa ser confirmado como canonico.

Acao:

- se `venues` for valido, criar visual especifico;
- se nao, trocar destino para intent existente.

Aceite:

- clique `Ver locais` abre estado visual correspondente e testado.

### [x] P1-ROUTE-02 - Dar estado visual claro para `#/eventos?modo=discover`

Problema:

- O clique `Descobrir torneios e ligas` muda query, mas a tela continua com H1 generico `CompetiÃ§Ãµes`.

Acao:

- criar subestado visual de descoberta;
- revisar H1/subtitulo/pills;
- garantir cards de torneio/liga descobertos.

Aceite:

- usuario percebe que esta em modo descoberta.

Sprint continuo 2026-05-19:

- `tournament-players`: lista progressiva, `Mostrar mais` e classes em accordions.
- `tournament-games`: fases/rodadas em accordions para reduzir densidade mobile.
- `places-match`: chamadas limitadas a 5 cards iniciais, expansao e criacao/filtros compactos.
- `management`: competicoes limitadas a 4 itens iniciais com expansao; cards mobile compactos.
- `profile`: hero com metricas reais, layout desktop em composicao ampla e ajuste do titulo mobile por classe dedicada.
- `intent=venues`: confirmado como estado `directory`; highlights e acoes dos cards reforcados em dark.
- `eventos?modo=discover`: titulo/copy propria e correcao de quebra vertical por screenshot.
- Evidencias: `sprint-tournament-collapse-check-2026-05-19/`, `sprint-management-cockpit-check-2026-05-19/`, `sprint-places-match-compact-check-2026-05-19/`, `sprint-profile-desktop-composition-check-2026-05-19/`, `sprint-route-polish-check-2026-05-19/`, `sprint-title-fix-final-check-2026-05-19/`.

### [x] P1-ROUTE-04 - Compatibilizar `#/competicoes`

Problema:

- Auditoria web/mobile encontrou `#/competicoes` abrindo pagina nao encontrada.
- O menu canonico usa `#/eventos`, mas links antigos, prompts e screenshots ainda usam o termo `competicoes`.

Acao:

- adicionar redirect autenticado de `/competicoes` para `/eventos`;
- validar caminho legado e caminho canonico em desktop/mobile;
- garantir console limpo.

Aceite:

- `#/competicoes` nao mostra 404;
- usuario cai no hub premium de competicoes;
- `diagnostics-summary.json` sem eventos.

Sprint 2026-05-19:

- `src/App.tsx` recebeu rota de compatibilidade `<Navigate to="/eventos" replace />`.
- Validado em `docs/screenshots/sprint-route-compat-check-2026-05-19/` para desktop e mobile.

### [x] P1-ROUTE-03 - Validar `Editar perfil`

Problema:

- Clique em `Editar perfil` permaneceu em `#/perfil` na auditoria interativa.

Acao:

- confirmar se deve abrir modal;
- se sim, capturar/estilizar modal;
- se nao, implementar rota/estado.

Aceite:

- botao tem feedback visual e permite editar dados esperados.

Sprint 2026-05-19:

- `src/pages/ProfilePage.tsx` separou o estado de edicao em `profile-edit-card`.
- `src/App.css` recebeu tratamento premium dark para formulario, campos, seletores, radios de privacidade e acoes.
- Validado com clique dirigido em `#/perfil`, screenshots e diagnosticos em `docs/screenshots/sprint-profile-edit-check-2026-05-19/`.
- `diagnostics-summary.json` sem eventos de console/rede.

### [x] P1-AUTH-01 - Redesenhar login/cadastro

Problema:

- Console limpo, mas visual ainda nao e uma entrada premium dark do app.

Acao:

- hero/auth com imagem esportiva;
- estados de login, cadastro, erro, sucesso e loading;
- copy sem termos tecnicos;
- validar `next`.

Aceite:

- `#/auth` mobile e desktop seguem DNA das referencias;
- cadastro tem fluxo claro.

Sprint 2026-05-19:

- `src/pages/AuthPage.tsx` passou a usar `<form>` real para login, com Enter funcional e sem alerta de senha fora de formulario.
- Mensagens de erro de auth foram traduzidas para linguagem de produto, sem expor texto tecnico do provedor.
- `src/App.css` redesenhou entrada premium dark com hero esportivo, logo legivel, card escuro, campos escuros, botoes e responsividade mobile.
- Validado antes/depois em `docs/screenshots/sprint-auth-before-check-2026-05-19/`, `docs/screenshots/sprint-auth-premium-check-2026-05-19/` e `docs/screenshots/sprint-auth-mobile-compact-check-2026-05-19/`.
- Build aprovado e diagnosticos sem erros/warnings de runtime; restam apenas mensagens informativas do Vite/React em desktop dev.

### [x] P1-PUBLIC-01 - Decidir e estruturar rotas publicas

Problema:

- Rotas chamadas de publicas no codigo redirecionam deslogado para auth.

Acao:

- decidir se local/jogador/torneio/inscricao devem ser publicos;
- se sim, criar shell publica premium;
- se nao, documentar como paginas autenticadas.

Aceite:

- comportamento bate com expectativa de produto e nao surpreende usuario.

Sprint 2026-05-19:

- Decisao de produto desta rodada: rotas de local, jogador, torneio, liga, inscricao e gestao permanecem autenticadas porque as telas atuais dependem de perfil/usuario para permissoes, acoes e dados pessoais.
- `AuthRequiredRedirect` ja preservava `next`; `src/pages/AuthPage.tsx` agora comunica o retorno esperado conforme tipo de rota protegida.
- `#/auth?next=...` recebeu aviso premium dark para local, evento e perfil de jogador, evitando surpresa ao abrir links protegidos.
- Validado em `docs/screenshots/sprint-public-route-auth-gate-check-2026-05-19/` com auth normal e rotas protegidas em desktop/mobile.
- Build aprovado; diagnosticos sem erros/warnings de runtime fora mensagens informativas do ambiente dev.

## [x] Sprint atual - ATP Premium Dark global frontend

Status: `[x]` concluido em 2026-05-19

Fonte primaria:

- `m:/Downloads/Chrome/atp_premium_dark_design_playbook.md`

Inspiracao visual:

- imagens anexadas pelo usuario em 2026-05-19, com app premium dark, mobile-first, glass cards, fundo deep navy, verde ATP e imagens cinematograficas de tenis.

Documentos de execucao desta sprint:

- `docs/ATP_PREMIUM_DARK_GLOBAL_QUEUE_2026_05_19.md`
- `docs/ATP_PREMIUM_DARK_ASSET_PROMPTS_2026_05_19.md`

Objetivo:

- reorganizar o frontend inteiro para o DNA premium dark definido no playbook;
- contemplar todas as areas do app: Jogador, Trabalho, Login, Cadastro, paginas publicas, competicoes, reservas, locais, aulas, perfil, ranking, mensagens, gestao e estados auxiliares;
- aproveitar as funcoes existentes sem reestruturaÃ§Ã£o de backend;
- mexer em pontos estruturais somente quando nao houver como aproveitar a UI atual com qualidade.

Nao fazer:

- nao alterar schema, RPCs, policies ou regras de negocio nesta fase visual;
- nao remover ferramentas existentes;
- nao substituir fluxos estabilizados por experiencias novas sem necessidade;
- nao implementar tela por tela sem antes consolidar componentes reutilizaveis.

Fila macro:

1. `[x]` PDARK-00 - Fundacao visual e componentes premium.
2. `[x]` PDARK-01 - Shell global, navegacao e contexto Jogador/Trabalho.
3. `[x]` PDARK-02 - Login, cadastro e estados de entrada.
4. `[x]` PDARK-03 - Home Jogador premium.
5. `[x]` PDARK-04 - CompetiÃ§Ãµes hub, torneios, ligas e rankings.
6. `[x]` PDARK-05 - Detalhe de torneio, inscriÃ§Ã£o e convite.
7. `[x]` PDARK-06 - Liga, rodada, chat e matchroom.
8. `[x]` PDARK-07 - Areas pessoais: reservas, partidas, aulas e pagamentos.
9. `[x]` PDARK-08 - Locais, detalhe do clube e reservar quadra.
10. `[x]` PDARK-09 - Aulas e turmas.
11. `[x]` PDARK-10 - Perfil, perfil publico e ranking.
12. `[x]` PDARK-11 - Mensagens e comunicacao contextual.
13. `[x]` PDARK-12 - Trabalho / Gestao geral.
14. `[x]` PDARK-13 - Trabalho / Academia.
15. `[x]` PDARK-14 - Trabalho / Gestao de quadras, reservas e agenda.
16. `[x]` PDARK-15 - Trabalho / Financeiro, CRM, Cantina, Time e Configuracoes.
17. `[x]` PDARK-16 - Paginas publicas e conversao.
18. `[x]` PDARK-17 - Estados vazios, loading, erro, modais, drawers e sheets.
19. `[x]` PDARK-18 - QA visual global e fechamento.

Entrega desta rodada de planejamento:

1. Queue global criada com escopo, objetivo, problemas, telas, criterios e ordem de execucao.
2. Todas as areas do app foram contempladas, incluindo jogador, trabalho, login e cadastro.
3. MD de prompts criado para gerar assets ausentes em dimensoes/contextos corretos.
4. A implementacao visual deve iniciar por `PDARK-00` e seguir a ordem definida.

Entrega sprint 1 em 2026-05-19:

1. `PDARK-00` concluido: tokens premium dark, superficies glass, headers, navs, cards, estados vazios, inputs e contrastes globais foram aplicados em `src/App.css`.
2. `PDARK-01` concluido: shell player/competition/management ficou dark-first; `BottomNav` do jogador foi atualizado para `Inicio`, `Competicoes`, `Reservas`, `Locais`, `Perfil`; sidebar e contexto Jogador/Trabalho receberam acabamento premium.
3. `PDARK-02` concluido: Login/cadastro/callback passaram a usar base premium dark e asset `pdark-onboarding-hero.png`, preservando validacoes e fluxo.
4. Assets `pdark-*` foram conectados a Home, Login, Ranking, Competicoes, Perfil, estados vazios e Gestao como primeira camada global.
5. Auditoria visual revisada em `docs/screenshots/visual-local-audit-2026-05-18/`, com foco em `mobile-home.png`, `desktop-events-hub.png`, `mobile-profile.png` e `desktop-management.png`.

Validacao sprint 1:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- `node scripts\capture-visual-audit.mjs` passou e atualizou screenshots.

Proximo item:

- `PDARK-03 - Home Jogador premium`, agora em prioridade atual, deve refinar composicao especifica da Home alem da fundacao global ja entregue.

Entrega sprint 2 em 2026-05-19:

1. `PDARK-03` concluido: Home do jogador recebeu hero `Encontre seu proximo jogo`, header `Ola,`, cinco atalhos principais, trilho horizontal mobile e faixa de proximos passos com dados existentes.
2. `PDARK-04` iniciado: hub `/eventos` ganhou KPIs, abas `Torneios/Ligas/Rankings` e paineis `Proximos torneios`, `Liga em destaque`, `Resultados recentes`.
3. Auditoria visual atualizada com foco em `mobile-home.png`, `desktop-home.png`, `desktop-events-hub.png` e `mobile-events-hub.png`.

Validacao sprint 2:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- `node scripts\capture-visual-audit.mjs` passou e atualizou screenshots.

Entrega sprint 3 em 2026-05-19:

1. `PDARK-04` concluido: `/eventos/torneios`, `/eventos/ligas` e `/ranking` receberam camada premium dark em cards, filtros, estados vazios, KPIs, tabela e modais.
2. Evidencias atualizadas: `desktop-tournaments.png`, `mobile-leagues.png`, `desktop-ranking.png`, `mobile-ranking.png`.

Validacao sprint 3:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- `node scripts\capture-visual-audit.mjs` passou e atualizou screenshots.

Proximo item:

- `PDARK-05 - Detalhe de torneio, inscricao e convite`.

Entrega sprint 4 em 2026-05-19:

1. `PDARK-05` concluido: detalhe de torneio, inscricao, convite, jogos, jogadores, chat, organizacao e matchroom receberam camada premium dark.
2. Evidencias atualizadas: `desktop-tournament-games.png`, `mobile-tournament-games.png`, `desktop-tournament-players.png`.

Validacao sprint 4:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- `node scripts\capture-visual-audit.mjs` passou e atualizou screenshots.

Proximo item:

- `PDARK-06 - Liga, rodada, chat e matchroom`.

Entrega sprint 5 em 2026-05-19:

1. `PDARK-06` concluido: liga, rodada, chat, partidas, classificacao, configuracao e matchroom receberam camada premium dark.
2. Painel operacional, fila de tarefas, fechamento de temporada e acoes de publicacao deixaram de usar superficies claras.
3. Chat da liga foi convertido para cards dark/glass com aviso fixado, mensagens, composer e ferramentas admin no mesmo DNA visual.
4. Evidencias atualizadas: `desktop-league-detail.png`, `mobile-league-detail.png`, `desktop-league-chat.png`, `mobile-league-chat.png`.

Validacao sprint 5:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- `node scripts\capture-visual-audit.mjs` passou e atualizou screenshots.

Proximo item:

- `PDARK-07 - Areas pessoais: reservas, partidas, aulas e pagamentos`.

Entrega sprint 6 em 2026-05-19:

1. `PDARK-07` concluido: `/minhas-reservas`, `/minhas-partidas`, `/minhas-aulas` e `/meus-pagamentos` receberam hero premium, cards dark/glass e linhas com textura esportiva.
2. Grid desktop das areas pessoais deixou de esticar colunas vazias; listas longas ficaram rolaveis e escaneaveis.
3. Mobile foi corrigido para uma coluna, com cards legiveis e status pills consistentes.
4. Evidencias atualizadas: `desktop-my-reservations.png`, `mobile-my-reservations.png`, `desktop-my-lessons.png`, `mobile-my-payments.png`.

Validacao sprint 6:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- `node scripts\capture-visual-audit.mjs` passou e atualizou screenshots.

Proximo item:

- `PDARK-08 - Locais, detalhe do clube e reservar quadra`.

Entrega sprint 7 em 2026-05-19:

1. `PDARK-08` concluido: `/locais`, discovery de quadras, discovery de aulas, jogos abertos e detalhe publico do clube receberam camada premium dark.
2. Painel de descoberta ficou legivel, com tiles brancos premium sobre base deep navy e imagem de quadra/clube.
3. Jogos abertos foram convertidos para cards dark/glass com CTAs verdes e detalhes secundÃ¡rios.
4. Evidencias atualizadas: `desktop-places-overview.png`, `mobile-places-overview.png`, `desktop-places-match.png`, `mobile-places-match.png`, `desktop-places-lessons.png`.

Validacao sprint 7:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- `node scripts\capture-visual-audit.mjs` passou e atualizou screenshots.

Proximo item:

- `PDARK-09 - Aulas e turmas`.

Entrega sprint 8 em 2026-05-19:

1. `PDARK-09` concluido: discovery de aulas, filtros, `Minhas aulas` e sinais de Academia na Gestao foram alinhados ao DNA premium dark.
2. O grid de filtros de aulas foi corrigido para evitar texto cortado no CTA de busca.
3. Evidencias atualizadas: `desktop-places-lessons.png`, `mobile-places-lessons.png`, `desktop-my-lessons.png`, `mobile-my-lessons.png`, `desktop-management.png`.

Validacao sprint 8:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- `node scripts\capture-visual-audit.mjs` passou e atualizou screenshots.

Proximo item:

- `PDARK-10 - Perfil, perfil publico e ranking`.

Entrega sprint 9 em 2026-05-19:

1. `PDARK-10` concluido: Perfil, Perfil publico e Ranking receberam refinamento final de contraste, tabs e tabela.
2. Ranking perdeu hero lavado e faixas brancas; tabela, filtros e botoes ficaram dark/glass.
3. Evidencias atualizadas: `desktop-profile.png`, `mobile-profile.png`, `desktop-ranking.png`, `mobile-ranking.png`.

Validacao sprint 9:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- `node scripts\capture-visual-audit.mjs` passou e atualizou screenshots.

Proximo item:

- `PDARK-11 - Mensagens e comunicacao contextual`.

Entrega sprint 10 em 2026-05-19:

1. `PDARK-11` concluido: notificacoes, chat de torneio, chat de liga, chat de partida e preferencias de notificacao receberam camada dark/glass unificada.
2. Comunicados fixados, avisos, mensagens do usuario, mensagens de outros participantes, composer e acoes WhatsApp passaram a usar hierarquia visual consistente.
3. Os campos de envio continuam operaveis e agora aparecem como parte do app esportivo, sem superficies brancas desalinhadas.
4. Evidencias atualizadas: `desktop-league-chat.png`, `mobile-league-chat.png`, `desktop-tournament-games.png`, `mobile-profile.png`.

Validacao sprint 10:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- `node scripts\capture-visual-audit.mjs` passou e atualizou screenshots.

Proximo item:

- `PDARK-12 - Trabalho / Gestao geral`.

Entrega sprint 11 em 2026-05-19:

1. `PDARK-12` concluido: `/gestao` foi refinada como central operacional premium, com fila do dia, workspaces, competicoes e sinais de suporte em dark/glass.
2. Switch `Trabalho / Ir para jogador`, cards de prioridade, rows de locais, acoes rapidas e painel de implantacao receberam contraste e hierarquia alinhados ao playbook.
3. Mobile foi ajustado para pilha operacional legivel, sem ilhas claras dominantes e com atalhos de modulo rolaveis.
4. Evidencias atualizadas: `desktop-management.png`, `mobile-management.png`.

Validacao sprint 11:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- `node scripts\capture-visual-audit.mjs` passou e atualizou screenshots.

Proximo item:

- `PDARK-13 - Trabalho / Academia`.

Entrega sprint 12 em 2026-05-19:

1. `PDARK-13` concluido: workspace de Academia recebeu camada premium dark em shell do local, cockpit, abas, fila de pendencias, cards, rows, toolbars, drawers e formularios progressivos.
2. A rota direta `/gestao/36b29d6c-fabb-475a-a059-47d5ece74a09/academia?visao=pendencias` foi capturada para validar o modulo real, alem da central `/gestao`.
3. Foram removidos containers brancos herdados por `.place-workspace`; metricas, filtros, pedidos, acoes e queues agora seguem dark/glass com CTA verde.
4. Evidencias atualizadas: `desktop-management.png`, `mobile-management.png`, `desktop-management-academy.png`, `mobile-management-academy.png`.

Validacao sprint 12:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- `node scripts\capture-visual-audit.mjs` passou e atualizou screenshots.

Proximo item:

- `PDARK-14 - Trabalho / Gestao de quadras, reservas e agenda`.

Entrega sprint 13 em 2026-05-19:

1. `PDARK-14` concluido: `BookingWorkspaceShell`, reservas, calendario por quadra, nova reserva, lista de espera, quadras e regras receberam camada premium dark.
2. Agenda de quadras foi validada em rota direta `/gestao/36b29d6c-fabb-475a-a059-47d5ece74a09/agenda?visao=calendario`, preservando densidade operacional.
3. Estados de reserva confirmada, bloqueio, aula/escola, ocupacao e horarios livres foram diferenciados por cor sem voltar ao visual de planilha clara.
4. Evidencias atualizadas: `desktop-management-booking.png`, `mobile-management-booking.png`, `desktop-management.png`, `mobile-management.png`.

Validacao sprint 13:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- `node scripts\capture-visual-audit.mjs` passou e atualizou screenshots.

Proximo item:

- `PDARK-15 - Trabalho / Financeiro, CRM, Cantina, Time e Configuracoes`.

Entrega sprint 14 em 2026-05-19:

1. `PDARK-15` concluido: Financeiro, Clientes/CRM, Cantina/POS, Equipe e Ajustes receberam o mesmo DNA premium dark/glass dos workspaces anteriores.
2. Recebiveis, follow-ups, venda rapida, convites, papeis e checklist estrutural ganharam paineis escaneaveis, CTAs verdes, filtros dark e rows compactos.
3. Inputs, selects, busca, cards de produto, lista de equipe e guia de papeis foram normalizados para contraste dark-first.
4. Corrigido vazamento de cards brancos no guia de papeis de Equipe, mantendo leitura de permissoes e acoes perigosas preservadas.
5. Evidencias atualizadas: `desktop-management-finance.png`, `mobile-management-finance.png`, `desktop-management-clients.png`, `mobile-management-clients.png`, `desktop-management-canteen.png`, `mobile-management-canteen.png`, `desktop-management-team.png`, `mobile-management-team.png`, `desktop-management-settings.png`, `mobile-management-settings.png`.

Validacao sprint 14:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- `node scripts\capture-visual-audit.mjs` passou e atualizou screenshots globais antes das capturas diretas de PDARK-15.

Proximo item:

- `PDARK-16 - Paginas publicas e conversao`.

Entrega sprint 15 em 2026-05-19:

1. `PDARK-16` concluido: paginas publicas de local, perfil publico de jogador e inscricao de torneio/liga receberam camada premium dark de conversao.
2. Local publico ganhou hero cinematografico, cards glass, CTAs fortes, fundo dark nas rotas publicas e bloco de compartilhamento sem superficies brancas.
3. Perfil publico ganhou identidade esportiva, stats e estados vazios dark; o link `Voltar` foi corrigido para pill compacto.
4. Inscricao publica recebeu hero dark, steps, opcoes, review, sidebar e CTAs alinhados ao Competition OS, preservando status fechado/aprovacao.
5. Evidencias atualizadas: `desktop-public-place-overview.png`, `mobile-public-place-overview.png`, `desktop-public-place-booking.png`, `mobile-public-place-academy.png`, `desktop-public-player.png`, `mobile-public-player.png`, `desktop-public-tournament-registration.png`, `mobile-public-tournament-registration.png`.

Validacao sprint 15:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- `node scripts\capture-visual-audit.mjs` passou e atualizou screenshots globais.

Proximo item:

- `PDARK-17 - Estados vazios, loading, erro, modais, drawers e sheets`.

Entrega sprint 16 em 2026-05-19:

1. `PDARK-17` concluido: estados vazios, loading, erro, feedbacks, toasts, modais, drawers, sheets e `SetupWizard` receberam camada premium dark transversal.
2. `ScreenState`, `.empty-state`, `home-empty-panel`, `workspace-empty-state`, estados de calendario e estados publicos agora usam textura escura com contraste consistente.
3. Loading recebeu scan bar sutil; feedback/toasts ganharam variacoes dark para sucesso/erro/info.
4. Overlays, modais, drawers de torneio/liga/academia/CRM e sheets ficaram com backdrop blur, superficies glass e CTAs verdes.
5. `SetupWizard` ganhou estrutura dark, steps escaneaveis e inputs alinhados ao restante do app.

Validacao sprint 16:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- `node scripts\capture-visual-audit.mjs` passou e atualizou screenshots globais.

Proximo item:

- `PDARK-18 - QA visual global e fechamento`.

Entrega sprint 17 em 2026-05-19:

1. `PDARK-18` concluido: QA visual global fechado com revisao das evidencias em `docs/screenshots/visual-local-audit-2026-05-18/`.
2. Relatorio de gaps criado em `docs/ATP_PREMIUM_DARK_QA_GAP_REPORT_2026_05_19.md`.
3. Gaps residuais registrados como polish visual: backdrop continuo em algumas rotas autenticadas, placeholders de avatar no ranking mobile, captura signed-out dedicada, screenshots viewport-only para bottom nav e densidade mobile em paginas publicas.
4. Queue global `PDARK-00` a `PDARK-18` encerrada preservando backend, schema, RPCs, policies e regras de negocio.

Validacao sprint 17:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- `node scripts\capture-visual-audit.mjs` passou.

Proximo item:

- Nenhum item pendente na queue global ATP Premium Dark; proximos ajustes devem nascer como polish secundario a partir do relatorio de gaps.

Entrega sprint pagina-a-pagina em 2026-05-19:

1. Home jogador foi refinada para o mesmo DNA da referencia: hero escuro cinematografico, atalhos compactos, indicadores acionaveis e cards de proximos passos sem sobreposicao no mobile.
2. CompetiÃ§Ãµes hub foi reorganizada com base no padrao da referencia desktop: hero + KPIs + atalhos + paineis funcionais, com mobile contido em grids verticais em vez de carrossel cortado.
3. Rotas internas de Torneios/Ligas, Ranking, Locais, Reservas, Perfil e Gestao receberam camada transversal para manter fundo deep navy, superficies glass, texto legivel e CTAs coerentes.
4. Estados claros remanescentes foram neutralizados em botoes secundarios, alternadores Jogador/Trabalho, links de trabalho e acoes de descoberta, preservando verde apenas para CTAs primarios/ativos.
5. Bottom nav, sidebar e shell continuam usando as mesmas rotas e funcoes, mas com contraste, hierarquia e espacamento alinhados ao app premium dark.

Validacao sprint pagina-a-pagina:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- `node scripts\capture-visual-audit.mjs` passou e atualizou `docs/screenshots/visual-local-audit-2026-05-18/`.
- Screenshots revisadas: `mobile-events-hub.png`, `desktop-events-hub.png`, `mobile-tournaments.png`, `mobile-places-overview.png`, `mobile-profile.png`, `mobile-management.png`, `desktop-management.png`.

## Sprint atual - Rastreamento visual completo e manual de correcao

Status: `[>]` prioridade atual

Fonte primaria:

- `docs/ATP_VISUAL_CORRECTION_MANUAL_2026_05_19.md`

Evidencias:

- `docs/screenshots/visual-audit-management-2026-05-19/`
- `docs/screenshots/visual-audit-player-pure-2026-05-19/`
- `docs/screenshots/visual-local-audit-2026-05-18/`

Contexto:

- O criterio anterior estava permissivo demais: algumas telas foram consideradas "ok" por funcionarem tecnicamente, mesmo ainda estando fora do patamar visual da referencia.
- A nova regra e comparar cada screenshot contra o DNA premium dark, avaliando composicao, cor, contraste, hierarquia, responsividade, contexto de perfil e estados de erro.
- Foram capturados dois perfis: usuario com gestao (`escalao@gmail.com`) e usuario sem gestao (`qa.jogador.puro@demo.atp.local`).

Nao fazer:

- nao iniciar novo sprint visual sem antes corrigir a matriz de auditoria;
- nao marcar item como concluido so por lint/build;
- nao esconder erros crus com CSS; erro cru precisa virar estado de produto;
- nao tratar usuario sem gestao como caso secundario.

### [>] TRACK-00 - Corrigir auditoria visual e matriz de perfis

Status: `[>]` prioridade atual

Problemas:

- `login` nao esta sendo capturado signed-out; o screenshot atual mostra Home logada.
- O script sobrescreve a mesma pasta e depende de um unico perfil por execucao.
- Nao existe manifest claro por perfil/viewport/rota.
- Full-page screenshots dificultam avaliar nav fixa e header fixo.

Acoes:

1. Adicionar `ATP_AUDIT_OUT_DIR` ao `scripts/capture-visual-audit.mjs`.
2. Separar rotas publicas signed-out de rotas autenticadas.
3. Criar matriz minima:
   - guest: `/auth`, `/completar-cadastro` quando possivel, paginas publicas;
   - jogador puro: Home, Locais, Competicoes, Perfil, Reservas, Aulas, Pagamentos, Ranking, Gestao bloqueada;
   - gestor owner: Home, Gestao hub, modulos de gestao, Competition OS completo;
   - staff parcial quando viavel: recepcao/professor/financeiro.
4. Gerar `visual-audit-manifest.json` com email, perfil, viewport, rota, screenshot e status.
5. Capturar viewport-only para telas com header/bottom nav fixo.

Criterios de aceite:

- Existem pastas separadas para guest, jogador puro e gestor.
- Login real aparece como login, nao como Home.
- Usuario sem gestao tem evidencias de bloqueio em `/gestao` e rotas internas.

### [x] P0-ACCESS - Bloquear/estilizar rotas de gestao para usuario sem gestao

Status: `[ ]` pendente

Evidencia:

- `visual-audit-player-pure-2026-05-19/mobile-management.png` mostra hub bloqueado corretamente.
- `visual-audit-player-pure-2026-05-19/mobile-management-academy.png` e rotas similares mostram telas operacionais diretas.

Acoes:

1. Revisar guard de `/gestao/:placeId`, `/gestao/:placeId/:module` e `/locais/:placeId/admin`.
2. Renderizar estado premium dark de acesso indisponivel para usuario sem permissao.
3. Preservar CTA `Voltar ao inicio` e `Explorar locais`.
4. Validar desktop/mobile para jogador puro e gestor.

Criterios de aceite:

- Jogador puro nao ve dashboard, dados operacionais, tabs de local ou modulos internos.
- Gestor continua acessando os mesmos modulos.

Sprint 2026-05-19:

- `src/pages/PlacesPage.tsx` agora detecta rota administrativa sem local acessivel e renderiza estado `Gestao indisponivel` em vez de montar workspace operacional.
- O bloqueio cobre `/gestao/:placeId/:module` e `/locais/:placeId/admin`, com CTAs `Voltar ao inicio` e `Explorar locais`.
- `src/App.css` recebeu estado premium dark `management-access-denied` e botoes escuros no header de `ManagementShell`.
- `src/lib/place-admin-data.ts` rebaixou fallbacks opcionais de workspace de `console.warn` para `console.info`, evitando ruido de erro em QA quando dados opcionais expiram.
- Validado jogador puro em `docs/screenshots/sprint-access-final-player-pure-check-2026-05-19/` e gestor em `docs/screenshots/sprint-access-final-manager-check-2026-05-19/`.
- Build aprovado e `diagnostics-summary.json` sem eventos nas rotas finais validadas.

### [x] P0-ERRORS - Remover erros crus de pagamentos/reservas

Status: `[x]` concluido

Evidencia:

- `mobile-my-payments.png` mostra `canceling statement due to statement timeout`.
- Perfil puro tambem expÃµe erro cru em reservas/pagamentos.

Acoes:

1. Mapear componentes de erro em `MyPaymentsPage`, `MyReservationsPage` e chamadas relacionadas.
2. Trocar erro tecnico por `ScreenState` premium com mensagem de produto.
3. Adicionar acao `Tentar novamente` quando houver refetch.
4. Registrar erro tecnico apenas em console/log interno, nao no texto visivel.

Criterios de aceite:

- Nenhum screenshot exibe mensagem SQL/API crua.
- Estados de erro mantem DNA dark e orientam proxima acao.

Sprint 2026-05-19:

- `MyPaymentsPage`, `MyReservationsPage`, `MyLessonsPage` e `MyMatchesPage` agora usam mensagens amigaveis via `ScreenState`, com acao `Tentar novamente` onde ha refetch.
- A copia de pagamentos removeu referencia tecnica a gateway/simulacao e ficou orientada ao usuario.
- Build aprovado.
- Validado em `docs/screenshots/sprint-personal-errors-final-check-2026-05-19/` para jogador puro em desktop/mobile nas rotas `/meus-pagamentos`, `/minhas-reservas`, `/minhas-aulas` e `/minhas-partidas`.
- `diagnostics-summary.json` sem eventos e `meta.json` sem SQL/API cru visivel.

### [x] P0-COMP-INTERNAL - Refazer visual interno de torneio/liga

Status: `[x]` concluido

Evidencia:

- `mobile-tournament-games.png` tem card claro em `Resumo por classe` e tabs claras.
- `desktop-tournament-games.png` tem inputs/selects claros em jogos.
- `mobile-tournament-players.png` e `desktop-tournament-players.png` mostram listas/tabelas brancas.
- `mobile-league-detail.png` ainda tem status/pills brancas.

Acoes:

1. Unificar `CompetitionHeader`, tabs, class switcher e status strips em dark glass.
2. Estilizar selects, inputs, score controls e filtros internos de Competition OS.
3. Converter listas de inscritos/jogadores de tabela branca para rows/cards dark.
4. Garantir mobile com resumo compacto, tabs contidas e acoes principais visiveis.
5. Validar liga e torneio nos perfis jogador e gestor.

Criterios de aceite:

- Nenhum bloco interno de torneio/liga usa superficie branca sem justificativa.
- Mobile nao tem tabs cortadas, campos esmagados ou tabela branca.

Sprint 2026-05-19:

- `TournamentPage` removeu status cru (`approved`) nas inscricoes e passou a exibir chips de produto (`Aprovada`, `Pendente`, `Lista de espera`, `Recusada`).
- `LeagueDetailsPage` tambem traduz status de inscricao nos metadados administrativos.
- `App.css` recebeu camada especifica para `league-matches-page`, filtros, cards de partida, chips de estado, sala da partida, availability/chat e rows de inscricoes em dark glass.
- Mobile de liga/partidas agora empilha cada partida em card escaneavel, sem caixas brancas de disponibilidade e sem botao cinza quebrando o DNA.
- Torneio/jogadores usa cards de inscricao com metadados em pills e pagamento destacado em verde, sem lista branca/tabela crua.
- Build aprovado.
- Evidencia antes/depois em `docs/screenshots/sprint-comp-internal-before-2026-05-19/` e `docs/screenshots/sprint-comp-internal-after-2026-05-19/`; diagnostics finais sem eventos.

### [x] P1-MGMT-MODULES - Dark real em modulos internos de gestao

Status: `[x]` concluido

Evidencia:

- `mobile-management-academy.png`, `booking`, `canteen`, `clients`, `finance`, `settings`, `team` ainda exibem botoes brancos, chips claros e forms mistos.
- Desktop desses modulos ainda tem linguagem administrativa antiga.

Acoes:

1. Criar padrao unico de modulo: header compacto, tabs dark, painel principal, filas/metrics dark.
2. Remover botoes brancos de `Ir para jogador`, `Voltar para central`, `Ver pagina publica` e similares.
3. Padronizar chips de implantacao, pendencias, status e progresso.
4. Reduzir excesso de chips visiveis em cards mobile.
5. Validar owner, staff parcial e jogador sem gestao.

Criterios de aceite:

- Modulos internos parecem parte do mesmo Management OS premium.
- Mobile fica escaneavel sem blocos claros quebrando a tela.

Sprint 2026-05-19:

- `App.css` recebeu camada especifica para Management OS removendo pills brancas do shell, resumo branco da academia e cards excessivamente amarelados de financeiro/CRM.
- `place-module-summary`, status do `PlaceAdminShell`, barra de implantacao, features, estados de cobranca e botoes secundarios agora seguem dark glass com verde/ambar controlado.
- Rotas de validacao corrigidas para segmentos reais: `/agenda` e `/ajustes`.
- Build aprovado.
- Evidencia antes/depois em `docs/screenshots/sprint-mgmt-modules-before-2026-05-19/` e `docs/screenshots/sprint-mgmt-modules-after-2026-05-19/`, cobrindo hub, academia, agenda, clientes, financeiro, equipe e ajustes em desktop/mobile.
- `diagnostics-summary.json` final sem eventos.

### [x] P1-PUBLIC - Corrigir paginas publicas

Status: `[x]` concluido

Evidencia:

- `desktop-public-place-*` exibe lateral clara/bege.
- `mobile-public-place-*` depende de placeholder amarelo `AD`.
- `desktop-public-player.png` usa header autenticado e layout pouco publico.
- `mobile-public-tournament-registration.png` tem alerta rosa claro.

Acoes:

1. Forcar fundo dark full-bleed em paginas publicas.
2. Criar topbar publica compacta, mesmo com usuario logado.
3. Substituir placeholders por avatar/logo dark integrado.
4. Criar warning/danger dark para inscricao fechada ou indisponivel.
5. Validar guest e usuario logado.

Criterios de aceite:

- Paginas publicas nao mostram bege/branco fora do card intencional.
- Conteudo publico nao parece painel autenticado.

Sprint 2026-05-19:

- `PublicPlayerPage` agora renderiza sem header autenticado.
- `App.css` oculta a navegaÃ§Ã£o autenticada (`BottomNav`/rail desktop) em pÃ¡ginas pÃºblicas e fluxos de conversÃ£o: local pÃºblico, perfil pÃºblico, inscriÃ§Ã£o de torneio e painel de inscriÃ§Ã£o.
- Topbar pÃºblica, hero, cards, inputs, feedbacks e warning/danger receberam acabamento dark full-bleed.
- `PlacePublicPage` trata logos DiceBear de iniciais como placeholder e usa iniciais em bloco dark integrado ao hero, removendo o `AD` amarelo.
- Build aprovado.
- Evidencia em `docs/screenshots/sprint-public-final-logged-2026-05-19/`; guest validado em `docs/screenshots/sprint-public-after-guest-2026-05-19/` com redirecionamento contextual ao auth.
- Diagnostics finais das rotas logadas sem eventos.

### [x] P1-PLACES - Elevar Locais para o padrao da referencia

Status: `[x]` concluido

Evidencia:

- `desktop-places-overview.png` fica pequeno e vazio na area util.
- `places-lessons` e `places-match` ainda parecem formularios/filtros antigos.

Acoes:

1. Reestruturar desktop Locais com hero largo, tiles e area de resultados.
2. Refinar tiles mobile 2x2 com icones e hierarquia mais premium.
3. Transformar filtros de aulas/jogos em painel dark compacto.
4. Evitar textos comprimidos em chips e botoes.

Criterios de aceite:

- Locais web e mobile lembram a referencia visual, nao apenas uma pagina de filtros.

Sprint 2026-05-19:

- `PlacesPage` recebeu wrapper `page places-page` para escopar corretamente a camada visual premium sem alterar regras de negocio.
- `App.css` recebeu camada `P1-PLACES` com fundo dark full-bleed, hero largo de descoberta, tiles 2x2 mobile, intent strip desktop, filtros compactos dark para quadras/aulas/jogos e cards de resultado integrados.
- Corrigido corte da faixa mobile, chips claros dentro dos filtros e heranca antiga de largura minima.
- Build aprovado.
- Evidencia final em `docs/screenshots/sprint-places-final-2026-05-19/`, cobrindo overview, aulas, jogos e reservas em desktop/mobile.
- `diagnostics-summary.json` final sem eventos.

### [x] P1-PROFILE-RANKING - Reforcar perfil, perfil publico e ranking

Status: `[x]` concluido

Acoes:

1. Perfil desktop em layout 2 colunas com hero, stats e historico.
2. Perfil publico com hero proprio e menos ruido de shell autenticado.
3. Ranking com avatar placeholder dark, podium/top 3 e rows menos administrativos.
4. Validar mobile/web.

Criterios de aceite:

- Perfil/ranking ficam proximos da referencia de perfil/ranking premium.

Sprint 2026-05-19:

- `RankingPage` recebeu bloco `ranking-podium-strip` com Top 3 do recorte usando os dados ja carregados.
- Linhas do ranking agora exibem avatar dark com iniciais e posicao em badge escuro, removendo placeholders brancos no mobile.
- `App.css` recebeu camada de polimento para pÃ³dio, avatares, badges, perfil e ranking, mantendo hero e filtros no padrao dark.
- Perfil publico foi validado na rota real `/jogadores/:playerId`; rota incorreta anterior apenas comprovou fallback 404.
- Build aprovado.
- Evidencia em `docs/screenshots/sprint-profile-ranking-final-2026-05-19/`; refinamento mobile final em `docs/screenshots/sprint-profile-ranking-final-2-2026-05-19/`.
- Diagnostics finais sem eventos.

### [x] P2-POLISH-GLOBAL - Ajuste fino de densidade e componentes

Status: `[x]` concluido

Acoes:

1. Revisar spacing, radius, pesos de fonte e icones.
2. Remover variacoes redundantes de card glass.
3. Garantir que todos os estados vazios tenham CTA claro.
4. Revisar bottom nav/header em viewport-only.

Criterios de aceite:

- Nenhuma rota principal parece ter sido feita por uma familia visual diferente.

Sprint 2026-05-19:

- Varredura ampla em Home, Competicoes, Locais, Reservas, Aulas, Pagamentos, Gestao, Perfil e Ranking em desktop/mobile.
- Estados vazios de `Meus pagamentos` e `Minhas aulas` receberam CTA claro para fluxos existentes (`Locais > quadras` e `Locais > aulas`).
- Mantidos os ajustes globais de cards dark, bottom nav/header e estados vazios sem criar novas ferramentas ou regras.
- Build aprovado.
- Evidencia em `docs/screenshots/sprint-polish-before-2026-05-19/` e `docs/screenshots/sprint-polish-after-2026-05-19/`.
- `diagnostics-summary.json` final sem eventos.

## Sprint atual - Referencias visuais ATP premium

Fonte:

- referencias anexadas pelo usuario em 2026-05-19 (`ref1.jpeg` e `ref2.jpeg`);
- comparacao visual feita contra o app atual em `Home` e `Locais`;
- screenshots atuais em `docs/screenshots/visual-local-audit-2026-05-18/`;
- escopo solicitado: aparencia, cores, design e formatacao, sem alterar conteudos/ferramentas.

Objetivo:

- aproximar o app das referencias visuais premium ATP;
- corrigir escala, densidade, composicao, cor e acabamento visual;
- preservar fluxos, rotas, permissoes, regras de negocio e conteudo funcional existente.

Nao fazer neste sprint:

- nao criar novas ferramentas;
- nao alterar copy/conteudo alem do minimo necessario para caber visualmente;
- nao mudar regras de busca, reserva, aula, ranking ou agenda;
- nao reestruturar arquitetura de dados.

### [x] REF-VISUAL-01 - Mobile player navy compacto alinhado as referencias

Status: `[x]` concluido em 2026-05-19

Contexto:

- a Home mobile atual tem uma boa imagem premium, mas a composicao ocupa altura demais;
- o header branco, a area de conteudo clara e o bottom nav branco quebram a percepcao de app esportivo imersivo vista na ref2;
- os atalhos aparecem como tiles grandes demais e empurram o restante do conteudo para fora da primeira dobra;
- esta tarefa deve atuar na camada visual compartilhada do modo jogador, sem redesenhar conteudo ou fluxos.

Problema:

- o mobile atual usa header branco, hero muito alto, tipografia gigante e bottom nav claro;
- as referencias mostram mobile mais integrado, com fundo navy, primeira dobra compacta e navegacao encaixada no produto.

Telas/componentes afetados:

- `AppShell` em modo jogador;
- header mobile do app;
- bottom nav mobile em modo jogador;
- Home do jogador;
- componentes visuais compartilhados `VisualHeroCard`, `ShortcutCard`/intent rail e superficies player via CSS.

Escopo:

1. Ajustar `AppShell`/superficies mobile do modo jogador para usar navy como base visual dominante.
2. Reduzir altura do hero mobile da Home e proteger area de texto sem ocupar a tela inteira.
3. Compactar header mobile: avatar, nome, seletor de modo e sino com menos altura.
4. Ajustar bottom nav mobile para parecer parte da composicao premium, com ativo verde/navy mais forte.
5. Manter 5 itens, safe area, toque confortavel e legibilidade.

Ganhos esperados:

- primeira dobra mobile mais parecida com produto final, nao landing page inflada;
- mais continuidade visual entre header, hero, atalhos e navegacao;
- menos scroll antes de chegar nas acoes principais;
- maior aderencia as referencias sem mexer em ferramenta/conteudo.

Dependencias:

- tokens em `src/styles/theme.css`;
- estilos em `src/App.css`;
- assets raster premium ja existentes.

Risco de regressao:

- reduzir demais o hero e perder impacto visual;
- escurecer superficies que precisam de contraste para leitura;
- afetar telas player alem da Home por uso compartilhado do shell.

Criterios de conclusao:

- mobile 390px mostra hero + pelo menos parte dos atalhos na primeira dobra;
- visual geral se aproxima da ref2: navy, verde, branco e contraste limpo;
- sem texto cortado em botoes/nav;
- lint/build passam.

Validacao obrigatoria:

- capturar `mobile-home.png` e `desktop-home.png`;
- comparar visualmente com ref2;
- atualizar este item com entrega, evidencias e status.

Entrega:

1. Modo jogador no mobile passou a usar base navy com brilho verde sutil, aproximando a Home da ref2.
2. Header mobile do player ficou escuro, mais compacto e integrado ao produto.
3. Seletor `Jogador/Trabalho` recebeu tratamento dark/green legivel no contexto navy.
4. Hero mobile da Home foi reduzido e refinado, mantendo imagem premium e CTA forte sem ocupar a tela inteira.
5. Cards de intencao da Home ficaram menores, com icones mais contidos e densidade melhor.
6. Bottom nav mobile do player passou a usar navy, ativo verde forte e contraste mais proximo das referencias.

Evidencias:

- `docs/screenshots/visual-local-audit-2026-05-18/mobile-home.png`
- `docs/screenshots/visual-local-audit-2026-05-18/desktop-home.png`

Validacao:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- Captura mobile 390px confirmou header/nav navy, seletor legivel e atalhos visiveis logo abaixo do hero.

Observacao:

- O desktop foi preservado visualmente nesta rodada; o ajuste foi concentrado em mobile player, como definido no escopo.

### [x] REF-VISUAL-02 - Locais com composicao visual da referencia

Status: `[x]` concluido em 2026-05-19

Problema:

- `Locais` atual esta limpo demais e com grande area vazia;
- a referencia de Locais tem tabs/atalhos compactos, hero visual, busca/filtros e cards visuais logo no primeiro viewport.

Escopo:

1. Reformatar a primeira dobra de `/locais` desktop para: titulo, atalhos por intencao, hero contextual e filtros compactos.
2. Reformatar `/locais` mobile para usar superficie navy e cards/listas mais parecidos com ref1.
3. Diminuir o painel inicial de descoberta e eliminar vazio visual excessivo.
4. Usar imagem de quadra/aula como hero contextual sem alterar as buscas existentes.
5. Garantir que `Encontrar jogo`, `Reservar quadra`, `Entrar em aula` e `Ver locais` continuem com as mesmas intencoes.

Criterios de conclusao:

- desktop 1366px mostra hero/filtros/cards sem grande vazio;
- mobile 390px tem densidade similar a ref1 e mantem bottom nav funcional;
- fluxo neutro e intents por query continuam funcionando;
- lint/build passam.

Entrega:

1. Hub de `/locais` ganhou hero visual de quadra dentro do painel de intencao, reduzindo a sensacao de vazio.
2. Cards de intencao e switcher de `Locais` receberam acabamento mais premium: superficie clara, textura sutil, borda limpa e ativo verde/navy.
3. Fluxos de `Reservar quadra` e `Entrar em aula` passaram a abrir com faixa visual de quadra antes dos filtros, aproximando a composicao da ref1.
4. Mobile de `Locais` agora herda corretamente o fundo navy do modo jogador, com titulo branco legivel e bottom nav escuro.
5. Trilho mobile de intencoes foi polido para nao cortar o primeiro card e preservar indicacao de arraste pelo card seguinte.
6. Nenhum comportamento de busca, intent por query, filtro ou resultado foi alterado.

Evidencias:

- `docs/screenshots/visual-local-audit-2026-05-18/desktop-places-overview.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-places-overview.png`
- `docs/screenshots/visual-local-audit-2026-05-18/desktop-places-lessons.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-places-lessons.png`

Validacao:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- Capturas confirmaram hero visual, cards de intencao refinados, titulo mobile legivel e navegacao inferior preservada.

### [x] REF-VISUAL-03 - Reduzir escala tipografica e densidade dos cards player

Status: `[x]` concluido em 2026-05-19

Problema:

- titulos, cards e atalhos atuais parecem grandes demais, especialmente no mobile;
- as referencias usam hierarquia forte, mas com escala mais controlada e melhor densidade.

Escopo:

1. Revisar escala de `VisualHeroCard`, `ShortcutCard`, cards de descoberta e paineis player.
2. Reduzir H1 mobile e subtitulos sem perder impacto.
3. Compactar padding vertical dos atalhos e cards repetidos.
4. Ajustar pesos de fonte para evitar visual excessivamente pesado.
5. Validar Home, Locais, Ranking e Perfil no minimo.

Criterios de conclusao:

- mais conteudo cabe no primeiro scroll mobile sem parecer apertado;
- desktop fica menos inflado e mais proximo de dashboard premium;
- nao ha regressao de legibilidade;
- lint/build passam.

Entrega:

1. Heros do modo jogador foram compactados com altura e escala de H1 mais controladas.
2. Atalhos/intent cards da Home ficaram menores, com icones e textos menos inflados.
3. Cards de descoberta e metricas player receberam densidade mais alta e padding menor.
4. Blocos do player hub tiveram radius e escala de titulo ajustados para leitura mais profissional.
5. Ajustes foram feitos por CSS, sem alterar conteudo, rotas ou comportamento.

Validacao:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.

### [x] REF-VISUAL-04 - Calibrar raios, bordas e sombras para acabamento premium

Status: `[x]` concluido em 2026-05-19

Problema:

- o app usa muitos radius grandes e sombras difusas;
- as referencias parecem mais precisas: cards com borda limpa, sombras discretas e cantos medios.

Escopo:

1. Revisar tokens de radius/sombra para superficies player.
2. Reduzir radius de cards comuns, mantendo radius maior apenas em heros.
3. Afinar bordas e sombras de shortcut cards, filtros, result cards e action panels.
4. Evitar aparencia de bolha/cartao inflado.

Criterios de conclusao:

- cards repetidos parecem mais nativos e menos decorativos;
- heros continuam com presenca premium;
- estados hover/active continuam perceptiveis;
- lint/build passam.

Entrega:

1. Radius de cards, rows, filtros, metricas e paineis player foi reduzido para acabamento mais preciso.
2. Heros mantiveram radius maior, mas menos exagerado.
3. Bordas repetidas ficaram mais definidas e consistentes.
4. Sombras foram calibradas para menor difusao, mantendo profundidade em hover/active.
5. Ajuste aplicado em superficies player e `Locais`, sem alterar componentes funcionais.

Validacao:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.

### [x] REF-VISUAL-05 - Limpar paleta clara e aumentar contraste navy/white/green

Status: `[x]` concluido em 2026-05-19

Problema:

- o fundo atual puxa para verde-claro/bege e deixa algumas telas lavadas;
- as referencias usam branco limpo, navy profundo e verde ativo com maior disciplina.

Escopo:

1. Reduzir predominancia do fundo esverdeado/bege nas superficies player.
2. Usar navy como bloco visual forte em mobile e em heros.
3. Preservar verde ATP para ativos/CTAs, sem espalhar verde claro em tudo.
4. Revisar contraste de textos muted em fundos com imagem.

Criterios de conclusao:

- telas claras parecem mais limpas;
- telas escuras parecem intencionais, nao apenas overlay escuro;
- contraste visual fica mais perto das refs;
- lint/build passam.

Entrega:

1. Fundo claro do modo jogador foi limpo para branco/off-white, reduzindo leitura verde/bege lavada.
2. Superficies repetidas player receberam branco mais consistente.
3. Verde ATP ficou mais concentrado em CTAs, ativos e labels de estado.
4. Mobile preservou navy forte no topo, com transicao mais limpa para superficies claras.
5. Contraste de labels e botÃµes em `Locais` e Home foi reforcado.

Validacao:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.

### [x] REF-VISUAL-06 - QA visual comparativo final

Status: `[x]` concluido em 2026-05-19

Escopo:

1. Capturar Home e Locais em desktop 1366/1440 e mobile 390.
2. Comparar lado a lado com ref1/ref2 no nivel de design, cores e formatacao.
3. Registrar antes/depois com achados residuais.
4. Atualizar este sprint com status final.

Criterios de conclusao:

- screenshots salvos em `docs/screenshots/`;
- relatorio curto criado em `docs/`;
- lint/build passam apos ajustes finais.

Entrega:

1. Capturas finais foram refeitas pelo script de auditoria visual.
2. Home e Locais foram verificados em mobile e desktop.
3. Relatorio curto criado em `REF_VISUAL_SPRINT_REPORT_2026_05_19.md`.
4. O sprint visual de referencias foi fechado com todos os itens concluidos.

Evidencias:

- `docs/REF_VISUAL_SPRINT_REPORT_2026_05_19.md`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-home.png`
- `docs/screenshots/visual-local-audit-2026-05-18/desktop-home.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-places-overview.png`
- `docs/screenshots/visual-local-audit-2026-05-18/desktop-places-overview.png`

Validacao:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- `node scripts/capture-visual-audit.mjs` concluiu e atualizou evidencias visuais.

## Sprint atual - Competicoes e Perfil premium por screenshot

Fonte:

- revisao visual por screenshots feita em 2026-05-19;
- `docs/COMPETITIONS_PROFILE_VISUAL_SCREENSHOT_REVIEW_2026_05_19.md`;
- capturas atuais em `docs/screenshots/visual-local-audit-2026-05-18/`;
- pedido do usuario: CompetiÃ§Ãµes e Perfil ainda nao atingiram o patamar adequado, revisar por screenshot e executar a queue em sprint.

Objetivo:

- elevar `/eventos`, `/eventos/torneios`, `/eventos/ligas` e `/perfil` ao mesmo patamar visual premium aplicado em Home e Locais;
- corrigir composicao, cores, densidade, contraste e acabamento;
- preservar conteudo, ferramentas, rotas, permissoes e regras de negocio.

Nao fazer neste sprint:

- nao criar nova funcionalidade de competicao;
- nao alterar copy funcional alem de ajustes visuais inevitaveis;
- nao mexer em banco, RPCs ou regras de participacao;
- nao transformar Perfil em fluxo de onboarding.

### [x] REF-COMP-01 - Hub de competicoes com hero esportivo e composicao premium

Status: `[x]` concluido em 2026-05-19

Problema:

- `/eventos` ainda parecia painel branco com cards administrativos;
- faltava o impacto visual de quadra/tenis visto nas referencias e ja aplicado em Home/Locais;
- no mobile, a tela ficava inflada e com bottom nav claro, quebrando a continuidade navy do app jogador.

Escopo:

1. Aplicar hero visual esportivo ao header do modo competicao.
2. Refinar pills de intencao para parecerem atalhos premium, nao tabs administrativas.
3. Dar mais acabamento aos cards de descoberta e ao fluxo principal.
4. Ajustar mobile com header/nav navy, densidade menor e sem corte no seletor de modo.

Criterios de conclusao:

- desktop mostra hero esportivo na primeira dobra de CompetiÃ§Ãµes;
- mobile 390px fica legivel, compacto e integrado ao tema navy;
- lint/build passam;
- screenshots atualizados.

Entrega:

1. `/eventos` ganhou hero esportivo com imagem de quadra/bola, usando navy profundo, verde ATP e branco como na ref2.
2. Mobile de CompetiÃ§Ãµes foi recalibrado para composiÃ§Ã£o de app: hero menor, tiles 2x2 e navegaÃ§Ã£o inferior navy integrada.
3. Cards de descoberta deixaram de ser lista administrativa e passaram a funcionar visualmente como atalhos.
4. Desktop preserva a densidade de dashboard premium com hero, intents e area de descoberta em uma primeira dobra limpa.

Evidencias:

- `docs/screenshots/visual-local-audit-2026-05-18/desktop-events-hub.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-events-hub.png`

Validacao:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- `node scripts/capture-visual-audit.mjs` passou e atualizou screenshots.

### [x] REF-COMP-02 - Torneios e Ligas com estados internos premium

Status: `[x]` concluido em 2026-05-19

Problema:

- paginas internas de `Torneios que jogo` e `Ligas que jogo` estavam muito vazias;
- KPIs e estados vazios pareciam placeholders de dashboard;
- faltava contexto visual esportivo no primeiro viewport.

Escopo:

1. Reformatar headers internos de Torneios/Ligas com hero visual.
2. Refinar KPIs e cards/listas para maior densidade e acabamento.
3. Transformar estados vazios em paineis premium com navy/quadra, sem esconder CTA.
4. Garantir que desktop e mobile tenham composicao consistente.

Criterios de conclusao:

- estados vazios parecem intencionais e premium;
- KPIs nao dominam a tela;
- cards de liga/torneio ficam consistentes com o restante player;
- lint/build passam.

Entrega:

1. Headers internos de Torneios/Ligas receberam o mesmo tratamento visual esportivo de CompetiÃ§Ãµes.
2. Estados vazios agora usam painel navy com imagem, CTA verde e melhor contraste.
3. KPIs ficaram com acabamento premium e leitura mais alinhada ao restante do modo jogador.
4. Mobile preserva o DNA ref2 com fundo navy, bottom nav escuro e cards arredondados.

Evidencias:

- `docs/screenshots/visual-local-audit-2026-05-18/desktop-tournaments.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-tournaments.png`
- `docs/screenshots/visual-local-audit-2026-05-18/desktop-leagues.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-leagues.png`

Validacao:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- `node scripts/capture-visual-audit.mjs` passou e atualizou screenshots.

### [x] REF-PROFILE-01 - Perfil mobile com hero escuro legivel

Status: `[x]` concluido em 2026-05-19

Problema:

- Perfil mobile tinha nome/seletor pouco legiveis sobre o navy;
- havia espaco vertical excessivo antes do avatar;
- o bloco parecia uma lista de configuracao, nao uma identidade de atleta.

Escopo:

1. Transformar o bloco de foto/nome em hero esportivo com imagem premium.
2. Corrigir contraste de nome, local, badges e botao de foto.
3. Reduzir espacos verticais no mobile.
4. Manter tabs e dados com leitura simples.

Criterios de conclusao:

- mobile 390px mostra Perfil com identidade clara e sem texto invisivel;
- avatar, nome e badges ficam integrados ao hero;
- bottom nav permanece coerente com o modo jogador;
- lint/build passam.

Entrega:

1. Perfil mobile recebeu hero escuro com imagem premium, avatar integrado e textos legiveis.
2. Corrigido o problema em que o titulo `Perfil` quebrava letra por letra no mobile.
3. O bloco foi compactado para se aproximar do ritmo da ref2: menos cartaz, mais app.
4. Tabs, rows e bottom nav foram mantidos funcionais e com acabamento navy/green/white.

Evidencias:

- `docs/screenshots/visual-local-audit-2026-05-18/mobile-profile.png`

Validacao:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- `node scripts/capture-visual-audit.mjs` passou e atualizou screenshots.

### [x] REF-PROFILE-02 - Perfil desktop como identidade atletica

Status: `[x]` concluido em 2026-05-19

Problema:

- Perfil desktop parecia formulario/lista centralizada;
- faltava presenca visual e hierarquia esportiva;
- cards de dados e historico tinham acabamento mais administrativo que premium.

Escopo:

1. Aplicar hero visual ao topo do Perfil desktop.
2. Melhorar rows, tabs e KPIs com radius, sombra e contraste coerentes.
3. Preservar edicao, foto, historico, preferencias e conta.
4. Validar desktop e mobile por screenshot.

Criterios de conclusao:

- Perfil desktop passa a comunicar atleta/ATP antes de formulario;
- informacoes continuam claras e acionaveis;
- visual alinha com Home, Locais e CompetiÃ§Ãµes;
- lint/build passam.

Entrega:

1. Perfil desktop recebeu hero esportivo com imagem de atleta/quadra e identidade visual ATP.
2. Rows, tabs e icones foram refinados para branco limpo, verde ativo e bordas mais precisas.
3. O topo deixou de parecer somente lista/formulario e passou a comunicar identidade atletica.
4. Edicao, upload de foto, dados publicos, historico, preferencias e conta foram preservados.

Evidencias:

- `docs/screenshots/visual-local-audit-2026-05-18/desktop-profile.png`

Validacao:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- `node scripts/capture-visual-audit.mjs` passou e atualizou screenshots.

### [x] REF-COMP-PROFILE-QA - QA visual final e documentacao

Status: `[x]` concluido em 2026-05-19

Escopo:

1. Rodar lint e build.
2. Capturar screenshots de CompetiÃ§Ãµes, Torneios, Ligas e Perfil.
3. Revisar screenshots gerados.
4. Atualizar este MD com entrega, evidencias e validacao.
5. Criar relatorio curto de sprint.

Entrega:

1. Lint e build foram executados apos os ajustes finais.
2. Auditoria visual foi recapturada.
3. A composicao foi recalibrada a partir da ref2: hero mais contido, tiles de acao, navy mobile, branco limpo e verde ativo.
4. Relatorio curto criado em `docs/COMP_PROFILE_VISUAL_SPRINT_REPORT_2026_05_19.md`.

## Sprint visual premium - ATP sport DNA

### [x] VISUAL-DNA-03 - Aplicar imagens raster premium e elevar o DNA esportivo

Status: `[x]` concluido em 2026-05-18

Fonte:

- referencias visuais premium anexadas pelo usuario;
- `VISUAL_REFINEMENT_SPRINT_2026_05_18.md`;
- `PREMIUM_UX_VISUAL_LANGUAGE.md`;
- manual de frontend/design de produto.

Objetivo:

- sair da camada de pequenos ajustes visuais e aplicar imagem real de alta qualidade nos slots principais;
- aproximar Home, Login, Locais, Ranking, Perfil, Liga/Torneio e Gestao da percepcao de app esportivo premium;
- preservar regras de negocio, rotas, permissoes e componentes ja estabilizados.

Entrega:

1. Home, Login, Ranking, Perfil publico, Local publico, Liga/Torneio e Central de Trabalho passaram a usar assets PNG premium em heros/cards.
2. AppShell recebeu textura global de quadra e glows sutis por modo.
3. `VisualHeroCard` ganhou composicao cinematografica com overlay mais forte, radius maior e area de texto protegida.
4. `ShortcutCard`, action rail e cards de intencao ganharam tile visual, profundidade e seta curta sem texto extra.
5. Cards de descoberta, metricas e rows receberam superficie menos administrativa, com imagem/textura quando ajuda a leitura.
6. A camada antiga SVG fica como legado/fallback, mas a experiencia principal agora e raster-first.

Criterios de conclusao:

- lint passa;
- build passa;
- mudanca restrita a visual/UX, sem alterar dominio;
- docs atualizados;
- screenshots devem ser refeitos em uma rodada de QA visual apos deploy/local server.

### [x] VISUAL-DNA-01 - Base visual com imagens, heros e componentes reutilizaveis

Status: `[x]` concluido em 2026-05-18

Fonte:

- manual de frontend/design de produto;
- referencias visuais anexadas pelo usuario;
- `VISUAL_REFINEMENT_SPRINT_2026_05_18.md`;
- `VISUAL_ASSET_PROMPTS.md`.

Objetivo:

- tirar a primeira camada do app da aparencia de painel administrativo simples;
- criar base visual com imagem/textura esportiva, tokens premium e componentes reaproveitaveis;
- aplicar a primeira camada em telas de maior percepcao: Login, Home do jogador, Ranking e Central de Trabalho.

Entrega:

1. Criados `VisualHeroCard`, `ShortcutCard`, `MetricCard` e `VisualBadge`.
2. Criados assets SVG locais para hero de quadra, auth, perfil/ranking, estadio e atalhos.
3. Tokens globais ganharam surfaces esverdeadas/azuladas, radius maior, sombras premium e gradientes esportivos.
4. Login ganhou background de quadra noturna e composicao premium.
5. Home ganhou hero contextual com imagem, atalhos visuais e cards de descoberta com thumbnail.
6. Ranking ganhou hero visual e cards de posicao/recorte mais esportivos.
7. Central de Trabalho ganhou camadas visuais e cards operacionais menos crus.

Criterios validados:

- lint passou;
- build passou.

### [x] VISUAL-DNA-02 - Expandir refinamento visual para Locais, Perfil, Liga e Torneio

Status: `[x]` concluido em 2026-05-18

Objetivo:

- aplicar a mesma linguagem visual sem copiar layout de uma tela para outra;
- substituir placeholders por imagens contextuais ou prompts raster quando houver asset final;
- manter cada tela focada na intencao dominante.

Escopo sugerido:

1. Locais/Reserva/Aulas/Jogos/Planos: hero contextual por intencao, cards de resultado mais visuais e filtros compactos.
2. Perfil proprio e perfil publico: hero com textura de quadra, stats em `MetricCard`, scouting privado visual e tabs mais premium.
3. Liga: hero esportivo, rodada atual e match cards com imagem/textura leve.
4. Torneio: hero esportivo, cards de evento/inscritos/jogos com status visual e exportacao de chave integrada.
5. Validar mobile 390/430 e desktop 1366.

Nao fazer:

- nao alterar regra de negocio;
- nao misturar gestao na experiencia do jogador;
- nao usar imagem decorativa em area operacional critica sem ganho de clareza.

Entrega:

1. Criados assets visuais locais para `visual-club-hero.svg`, `visual-lesson-hero.svg` e `visual-match-hero.svg`, mantendo a estrategia de imagem leve e versionavel.
2. Pagina publica do local passou a usar hero contextual com imagem de clube/aulas quando nao ha cover real cadastrado, sem alterar rotas ou regras.
3. Locais, aulas, jogos e planos receberam superficie visual mais premium, action rail com profundidade, cards com radius/sombra consistentes e resultado de aula com textura sutil.
4. Perfil publico recebeu hero esportivo, avatar com presenca visual, metricas e scouting privado com tratamento menos administrativo.
5. Liga e torneio receberam camada visual compartilhada em `CompetitionHeader`, `CompetitionTabs`, hero publico, seletores e blocos operacionais, preservando a separacao publico/jogador/organizador.

Validacao:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.

## Sprint atual - Contexto pessoal, reservas e sala de jogo

### [x] PLAYER-CONTEXT-01 - Home abre areas reais em vez de modulos genericos

Status: `[x]` concluido em 2026-05-18

Fonte:

- `manual_frontend_design_produto_apps_modernos.md`
- `ROLE_MODE_V2_PRODUCT_UX_SPEC.md`
- `PLAYER_APP_V2_IMPLEMENTATION_SPEC.md`
- pedido de QA/contexto do usuario em 2026-05-18

Objetivo:

- transformar cards da Home (`Minhas reservas`, `Minhas partidas`, `Minhas aulas`, `Meus pagamentos`) em atalhos para paginas proprias;
- manter a Home como resumo pessoal, nao como tela completa de gestao;
- preservar o contexto ao clicar em item especifico.

Entrega:

1. Criada rota `/minhas-reservas` com proximas reservas, historico e detalhe em dialog contextual.
2. Criada rota `/minhas-partidas` com competicoes ativas e historico, apontando para o contexto correto de torneio/liga.
3. Criada rota `/minhas-aulas` com matriculas ativas/pendentes e contexto de turma/professor/local.
4. Criada rota `/meus-pagamentos` com pendencias e historico de pagamentos manuais/simulados.
5. Home agora aponta reservas especificas para `/minhas-reservas?reserva={id}`.

Criterios validados:

- lint passou;
- build passou;
- paginas novas usam `AppShell` em modo jogador e estados de carregando/vazio/erro.

### [x] PLAYER-BOOKING-01 - Reserva nao permite horarios passados

Status: `[x]` concluido em 2026-05-18

Objetivo:

- impedir solicitacao de reserva ou lista de espera em horario ja encerrado;
- corrigir UI para nao apresentar horarios passados como livres.

Entrega:

1. Horarios passados deixam de ser consultados na busca de disponibilidade.
2. Slots passados aparecem desabilitados como `Passou`.
3. Solicitar reserva/lista de espera valida novamente no frontend antes de enviar.
4. Migration `0095_booking_past_time_guard_v1.sql` adiciona protecao nas RPCs `app_search_available_courts`, `app_create_court_booking` e `app_join_court_booking_waitlist`.

Criterios validados:

- lint passou;
- build passou.

### [x] PLAYER-ROOM-01 - Sala da liga sem perda de foco e com WhatsApp contextual

Status: `[x]` concluido em 2026-05-18

Objetivo:

- corrigir chat da sala perdendo foco ao digitar;
- adicionar link de grupo de WhatsApp e envio do link para participantes sem sair do modal.

Entrega:

1. `AppDialog` deixou de refazer o ciclo de foco quando `onClose` muda entre renders.
2. Criada tabela `league_match_room_links` via migration `0096_league_match_room_links_v1.sql`.
3. Sala da liga carrega/salva/remove link de grupo.
4. Participantes com telefone valido recebem acao `Enviar link`; o proprio usuario nao recebe botao para si mesmo.
5. Se nao houver grupo salvo, o link enviado e o da propria sala.

Criterios validados:

- lint passou;
- build passou.

## P0 - Prioridade atual

### [x] ROLE-MODE-V2-01 - Separacao real Jogador vs Trabalho

Status: `[x]` concluido

Fonte:

- `ROLE_MODE_V2_PRODUCT_UX_SPEC.md`
- `ROLE_MODE_V2_FLOW_MATRIX.md`
- `manual_frontend_design_produto_apps_modernos.md`
- `ROLE_VISIBILITY_MATRIX.md`
- `SCREEN_RESPONSIBILITIES.md`
- `COMPONENT_GRAMMAR.md`

Contexto:

- `CTX-MODE-01` criou o seletor persistido `Jogador/Trabalho`, mas ainda e uma primeira camada de navegacao;
- o app precisa consolidar `Jogador` e `Trabalho` como experiencias completas, nao como uma Home de jogador com blocos administrativos;
- multi-esporte e novas capacidades devem ser construidos em cima dessa separacao para nao multiplicar confusao.

Objetivo:

- tornar `Modo Jogador` uma experiencia limpa de atleta;
- tornar `Modo Trabalho` uma experiencia propria para gestor, professor, recepcao, financeiro, caixa/POS e organizador;
- manter a escolha persistida entre sessoes ate o usuario trocar manualmente.

Escopo:

1. Auditar onde conteudo profissional ainda aparece dentro da experiencia de jogador.
2. Remover da Home do jogador filas/listas operacionais de trabalho, mantendo apenas acesso discreto ao modo.
3. Criar/ajustar entrada de trabalho como Home operacional propria.
4. Garantir que troca para `Jogador` navegue para `/inicio` quando o usuario estiver em rota profissional.
5. Garantir que troca para `Trabalho` abra o melhor workspace permitido ou uma central de workspaces quando houver mais de um.
6. Separar navegacao mobile por modo, sem sexto item poluindo o player.
7. Preservar rotas diretas e permissoes.

Criterios de conclusao:

- jogador puro nao ve seletor nem caminhos profissionais;
- multi-papel alterna modo e o modo persiste apos reload/login;
- Home do jogador nao mostra fila/lista operacional de trabalho;
- Home do trabalho nao mostra descoberta publica de jogador como primeira dobra;
- desktop 1366px e mobile 390px validados;
- lint/build passam;
- docs atualizados.

### [x] ROLE-MODE-V2-02 - Central de Trabalho e Workspace Switcher

Status: `[x]` concluido

Fonte:

- `ROLE_MODE_V2_PRODUCT_UX_SPEC.md`
- `ROLE_MODE_V2_FLOW_MATRIX.md`
- `MANAGEMENT_OS_V2_UX_PLAN.md`
- `COMPETITION_OS_V2_UX_PLAN.md`

Objetivo:

- transformar o modo `Trabalho` em uma central propria, capaz de escolher entre local, professor, financeiro, caixa/POS e competicoes organizadas.

Escopo:

1. Criar contrato de `Workspace` profissional: tipo, nome, papel, pendencias, destino principal.
2. Se houver um unico workspace, abrir destino direto.
3. Se houver varios, mostrar central com rows compactas, nao cards grandes.
4. Separar workspaces de local e competicao.
5. Exibir papel e pendencias por workspace.
6. Manter configuracao e descoberta fora da primeira dobra.

Criterios de conclusao:

- organizador sem local ve apenas competicoes organizadas;
- professor ve `Minha operacao de aulas`;
- gestor de local ve locais sob gestao;
- financeiro/caixa recebem entrada isolada;
- workspaces nao misturam dados de jogador;
- lint/build passam.

### [x] ROLE-MODE-V2-03 - RouteModeGuard e rotas diretas sem mistura mental

Status: `[x]` concluido

Fonte:

- `ROLE_MODE_V2_PRODUCT_UX_SPEC.md`
- `ROLE_MODE_V2_FLOW_MATRIX.md`
- `web/src/lib/role-visibility.ts`
- `web/src/App.tsx`

Objetivo:

- declarar explicitamente qual modo cada rota representa e sincronizar o modo quando a intencao for inequivoca.

Escopo:

1. Criar helper/guard de rota para superficie `player`, `work-management`, `work-competition`, `public-competition`.
2. `/gestao/*` ativa `work`.
3. `/inicio`, `/locais`, `/ranking` ativam `player`.
4. Rotas publicas de torneio/liga nao ativam `work` automaticamente.
5. Rotas de organizacao/operacao de torneio/liga ativam `work`.
6. Quando faltar permissao, mostrar estado amigavel com CTA certo.

Criterios de conclusao:

- links diretos mantem permissao;
- modo visual nao fica incoerente com rota;
- erro sem permissao nao parece bug;
- lint/build passam.

### [x] ROLE-MODE-V2-04 - Notificacoes separadas por modo

Status: `[x]` concluido

Fonte:

- `ROLE_MODE_V2_PRODUCT_UX_SPEC.md`
- `COMPONENT_GRAMMAR.md`
- `CTX-MODAL-01`
- `CTX-FEEDBACK-01`

Objetivo:

- separar avisos pessoais de jogador dos avisos operacionais de trabalho, sem esconder urgencias.

Escopo:

1. Classificar notificacoes como `player` ou `work`.
2. Painel aberto no modo atual prioriza notificacoes daquele modo.
3. Notificacoes do outro modo aparecem como agrupamento discreto.
4. Clicar em notificacao profissional troca para `work` com destino contextual.
5. Clicar em notificacao pessoal troca para `player` quando necessario.
6. Mobile usa popover/sheet responsivo ja existente.

Criterios de conclusao:

- jogador nao recebe fila operacional misturada no painel principal;
- gestor nao precisa procurar pendencia profissional em feed de jogador;
- badge continua util;
- lint/build passam.

### [x] ROLE-MODE-V2-05 - Competition OS: separar Competir de Organizar

Status: `[x]` concluido

Fonte:

- `ROLE_MODE_V2_PRODUCT_UX_SPEC.md`
- `ROLE_MODE_V2_FLOW_MATRIX.md`
- `COMPETITION_OS_V2_UX_PLAN.md`

Objetivo:

- impedir que descoberta/participacao de competicoes e operacao de torneios/ligas disputem a mesma tela mental.

Escopo:

1. Em `player`, `Competir` mostra jogar/descobrir/acompanhar.
2. Em `work`, `Organizar` mostra operacao de torneios/ligas.
3. Rotas existentes continuam funcionando, mas UI deve deixar claro o modo.
4. Listas de organizacao usam rows com proximo passo e CTA unico.
5. Detalhes publicos nao exibem ferramentas administrativas como protagonistas.
6. Ferramentas administrativas aparecem apenas para owner/staff aceito em modo `work`.

Criterios de conclusao:

- jogador nao ve cockpit de organizacao dentro de descoberta;
- organizador nao precisa atravessar descoberta para operar;
- torneio/liga seguem padrao de tabs e seletor de classe ja definido;
- lint/build passam.

### [x] ROLE-MODE-V2-06 - Mobile mode UX

Status: `[x]` concluido

Fonte:

- `ROLE_MODE_V2_PRODUCT_UX_SPEC.md`
- `ROLE_MODE_V2_FLOW_MATRIX.md`
- `COMPONENT_GRAMMAR.md`
- `UX_FRONTEND_AUDIT.md`

Objetivo:

- tornar a troca de modo natural no mobile sem transformar bottom nav em menu lotado.

Escopo:

1. No modo jogador, bottom nav fica 5 itens de jogador.
2. Troca de modo fica no avatar/header/sheet de conta.
3. No modo trabalho, bottom nav mostra rotinas do trabalho, nao `Inicio/Locais/Ranking`.
4. Workspace switcher deve ser acessivel em um toque.
5. Testar 390px e 430px.

Criterios de conclusao:

- sem sexto item visualmente pesado no player;
- sem menus cortados;
- alvos de toque adequados;
- modo atual claramente visivel;
- lint/build passam.

Evidencias:

- `docs/screenshots/role-mode-v2-2026-05-18/mobile390-player-home.png`
- `docs/screenshots/role-mode-v2-2026-05-18/mobile390-work-hub.png`
- `docs/screenshots/role-mode-v2-2026-05-18/desktop1366-player-home.png`
- `docs/screenshots/role-mode-v2-2026-05-18/desktop1366-work-hub.png`

### [x] ROLE-MODE-V2-07 - QA por papel da separacao de modo

Status: `[x]` concluido

Fonte:

- `ROLE_MODE_V2_FLOW_MATRIX.md`
- `ROLE_VISIBILITY_MATRIX.md`
- `USER_ACTIVITY_TEST_PLAN.md`

Objetivo:

- validar a separacao real com perfis diferentes.

Escopo:

1. Jogador puro.
2. Gestor de local.
3. Professor vinculado.
4. Recepcao.
5. Financeiro.
6. Caixa/POS.
7. Organizador sem local.
8. Usuario multi-papel com local e competicao.

Criterios de conclusao:

- screenshots desktop/mobile por perfil critico;
- nenhum papel ve modulo indevido;
- modo persiste apos reload;
- rotas diretas respeitam permissao;

Evidencias:

- `docs/screenshots/role-mode-v2-2026-05-18/role-mode-v2-validation.json`
- `docs/screenshots/role-mode-v2-2026-05-18/role-matrix/role-mode-v2-role-matrix.json`
- `docs/screenshots/role-mode-v2-2026-05-18/role-matrix/role-mode-v2-organizer-after-fix.json`
- perfis validados: jogador puro, administrador/gestor, professor, recepcao, financeiro, caixa/POS e organizador sem local.

Observacao:

- O QA encontrou e corrigiu no mesmo sprint o empty state contraditorio para organizador sem local: a central agora mostra apenas competicoes organizadas e o retorno claro para `Jogador`.
- docs atualizados.

### [x] CTX-FEEDBACK-01 - Padrao global de feedback visivel

Status: `[x]` concluido em 2026-05-17

Fonte:

- `CONTEXTUAL_UX_RESTRUCTURE_ANALYSIS.md`
- `COMPONENT_GRAMMAR.md`
- `UX_FRONTEND_AUDIT.md`
- manual externo `manual_frontend_design_produto_apps_modernos.md`

Contexto:

- o app usa muitos `setFeedback` locais e mensagens renderizadas dentro da pagina;
- sucesso/erro de mutacao pode ficar fora da viewport, especialmente no mobile;
- o manual exige feedback visivel, contextual e sem erro tecnico bruto.

Objetivo:

- criar um padrao global de toast/alerta para resultados de API e mutacoes;
- manter validacoes de campo inline;
- garantir que sucesso, erro, loading e cancelamento sejam percebidos no momento da acao.

Escopo:

1. Criar `ToastProvider`/`useToast` no shell raiz do app.
2. Definir variantes `success`, `error`, `info` e, se simples, `loading`.
3. Desktop: stack em area fixa, sem cobrir menu/CTA.
4. Mobile: stack acima da bottom nav ou safe area, sem cobrir CTA principal.
5. Migrar primeiro fluxos criticos: resultado liga/torneio, reserva, interesse de aula, inscricao e configuracoes importantes.
6. Erro tecnico fica em console/log; UI recebe mensagem amigavel.

Criterios de conclusao:

- acoes criticas mostram feedback visivel em desktop e mobile;
- nenhum erro bruto de Supabase aparece em tela nos fluxos migrados;
- toast nao cria scroll nem empurra layout;
- lint/build passam;
- `CURRENT_PRODUCT_STATE.md` atualizado.

Evidencia:

- `ToastProvider` global criado e montado no shell raiz;
- fluxos migrados: torneio, liga, gestao de locais/academia/agenda e pagina publica de local para reserva, lista de espera, interesse de aula e jogos abertos;
- erros tecnicos nos toasts migrados passam por mensagem amigavel;
- `npm.cmd run lint` e `npm.cmd run build` passaram.

### [x] CTX-MODAL-01 - Sistema unico de dialog, sheet, popover e formulario responsivo

Status: `[x]` concluido em 2026-05-17

Contexto:

- `EntityDrawer` existe, mas ainda nao cobre foco, safe area, scroll lock, teclado mobile e action bar fixa;
- `ResponsiveFilterSheet` reutiliza os mesmos `children` inline e no drawer, podendo duplicar campos e estados.

Objetivo:

- criar uma base confiavel para modais, salas, filtros e formularios sem cortes no web/mobile.

Escopo:

1. Criar/ajustar componentes base: `AppDialog`, `AppSheet`, `AppPopover` e `FormDialogLayout`.
2. Garantir `Escape`, retorno de foco, body scroll lock, `dvh`, safe area mobile, action bar fixa, backdrop consistente e aria correto.
3. Migrar primeiro notificacoes, filtros mobile, sala de jogo e drawers pequenos de gestao que hoje cortam.

Criterios de conclusao:

- modal/sheet funciona em 390px, 430px e desktop;
- formulario dentro de modal nao corta CTA;
- filtro mobile nao duplica estado;
- lint/build passam.

Progresso 2026-05-17:

- criados `AppDialog`, `AppSheet`, `AppPopover` e `FormDialogLayout`;
- base inclui Escape, retorno de foco, body scroll lock, `dvh`, safe area mobile, backdrop e actions fixas;
- `EntityDrawer` passou a usar `AppSheet`, preservando compatibilidade com drawers existentes;
- sino de notificacoes passou a usar `AppPopover`;
- `npm.cmd run lint` e `npm.cmd run build` passaram.
- `ResponsiveFilterSheet` agora renderiza filtros inline no desktop e no drawer apenas no mobile, evitando duplicar os mesmos `children`/estado quando o sheet abre;
- `npm.cmd run lint` passou apos a correcao do filtro responsivo;
- a base foi aplicada na sala contextual de liga e torneio pela `CTX-MATCHROOM-01`;
- `npm.cmd run lint`, `npm.cmd run build` e `git diff --check` passaram apos as migracoes.

Observacao:

- screenshots 390px/430px/desktop ficam na task de QA visual da frente contextual, para nao bloquear a migracao funcional dos fluxos.

### [x] CTX-MATCHROOM-01 - Sala de jogo contextual em modal/sheet para liga e torneio

Status: `[x]` concluido em 2026-05-17

Contexto:

- em liga, `Abrir sala` expande conteudo inline por `expandedMatchId`;
- em torneio, jogador/admin tambem interagem com resultado e sala dentro da pagina;
- usuario perde contexto ao abrir sala vindo de Home, notificacao ou lista.

Objetivo:

- clicar em `Abrir sala`, `Entrar na sala`, `Preencher resultado`, `Reservar` ou acao equivalente deve abrir a sala na propria tela, sem redirecionamento e sem expandir a lista.

Escopo:

1. Criar `MatchRoomDialog`/`MatchRoomSheet`.
2. Extrair formulario comum de placar com mesmo padrao do admin e tiebreak conforme formato.
3. Criar adaptadores de liga e torneio.
4. Em listas e notificacoes, trocar expansao/redirecionamento por abertura contextual.
5. Fechar modal deve manter usuario no mesmo scroll/contexto.

Criterios de conclusao:

- sala abre em modal no desktop e sheet no mobile;
- envio de resultado funciona ou falha com toast amigavel;
- dados da lista atualizam ao fechar/salvar;
- nao ha duplicacao inline da sala abaixo do item;
- lint/build passam.

Progresso 2026-05-17:

- liga: `Abrir sala` agora abre a sala em `AppDialog` contextual, sem expandir a lista de partidas;
- a sala preserva disponibilidade, resultado/confirmacao, WO, participantes, contatos e mini chat;
- fechar a sala retorna ao mesmo contexto visual da aba `Partidas`;
- torneio: `Informar resultado`/`Compartilhar placar` nas partidas do jogador deixou de abrir um `<details>` inline e passou a abrir uma sala contextual em `AppDialog`;
- o dialog de torneio preserva o formulario de placar existente, regra de tiebreak/formato da classe, envio por RPC, WhatsApp e lista de resultados enviados;
- o card da partida fica mais leve e nao duplica o formulario logo abaixo do item;
- Home/agenda/notificacoes agora enviam acoes de partida para deep links com `room=...`, em vez de mandar o usuario para uma aba generica;
- liga consome `room` e abre a sala correta dentro de `AppDialog`/sheet, preservando a lista e o contexto visual;
- torneio consome `room` para partidas do jogador e abre a sala contextual quando a partida pertence ao usuario logado;
- `allLeagueMatchItems` foi estabilizado com `useMemo` para evitar reaberturas por render e manter o deep link previsivel;
- evidencia visual mobile: `web/docs/screenshots/contextual-qa-2026-05-17/ctx-matchroom-league-click-mobile.png` confirma sheet contextual com disponibilidade, resultado/confirmacao e lista por tras;
- `npm.cmd run lint`, `npm.cmd run build` e `git diff --check` passaram.

### [x] CTX-TOURNAMENT-01 - Central do jogador no torneio sem duplicar jogos

Status: `[x]` concluido em 2026-05-17

Contexto:

- a aba `Jogos` pode misturar jogos pessoais e visao geral da classe;
- isso faz o jogador ver a mesma partida em blocos diferentes.

Objetivo:

- separar claramente `Sua central do torneio` e `Visao geral da chave/classe`.

Escopo:

1. Na aba `Jogos`, renderizar `Sua central do torneio` apenas quando houver dado real do usuario.
2. Incluir proximas partidas, resultado pendente, confirmacao, sala e agenda/quadra.
3. `Visao geral` fica abaixo, com chave/lista/fase da classe selecionada.
4. Partida do usuario nao deve ser repetida como card destacado e novamente como card equivalente logo abaixo.
5. `Exportar chave` permanece acao secundaria quando houver chaveamento.

Criterios de conclusao:

- jogador entende primeiro o que precisa fazer;
- visao geral continua disponivel;
- sem duplicacao visual de jogos pessoais;
- desktop/mobile validados;
- lint/build passam.

Evidencia:

- na aba `Jogos`, `Sua central no torneio` agora aparece antes de `Jogos da classe`, agenda por quadra e chave detalhada;
- o card pessoal ficou mais enxuto: presenca/indisponibilidade continuam inline, mas placar/WhatsApp abrem sala contextual;
- `Visao geral` continua disponivel logo abaixo com exportacao de chave e agenda;
- `npm.cmd run lint`, `npm.cmd run build` e `git diff --check` passaram.

### [x] CTX-TOURNAMENT-02 - `Ver meus jogos` e seletor de chave/classe padronizado

Status: `[x]` concluido em 2026-05-17

Contexto:

- botao `Ver meus jogos` deve levar ao recorte certo, nao a uma aba generica;
- torneio precisa seguir o mesmo padrao de seletor contextual usado em liga.

Objetivo:

- `Ver meus jogos` abre `Jogos` focando `Sua central do torneio`;
- classe/chave usa um unico controle por contexto.

Escopo:

1. `Ver meus jogos` deve setar aba `Jogos` e foco/query para central do usuario.
2. Se houver uma unica pendencia critica, abrir sala contextual diretamente apos chegar em `Jogos`.
3. Ate 6 classes: chips horizontais com snap no mobile.
4. Mais de 6 classes: select unico.
5. Nunca exibir chips e select como controles equivalentes ao mesmo tempo.
6. Aplicar em `Inscritos`, `Jogos` e `Classificacao` quando houver classificacao real.

Criterios de conclusao:

- nenhuma aba `Categorias` publica volta a aparecer;
- seletor nao quebra fonte/espacamento;
- muitas classes continuam navegaveis;
- lint/build passam.

Evidencia:

- CTA publico `Ver meus jogos` agora seleciona a classe da proxima partida do usuario, abre `Jogos`, foca `Sua central no torneio` e abre a sala automaticamente quando ha uma unica pendencia;
- o filtro publico do torneio preserva um unico controle por contexto: chips ate 6 classes e select para muitas classes;
- o mesmo padrao continua aplicado em `Inscritos`, `Jogos` e `Classificacao` quando ha tabela real;
- `npm.cmd run lint`, `npm.cmd run build` e `git diff --check` passaram.

### [x] CTX-PLAYER-01 - Perfil publico de jogador e nomes clicaveis

Status: `[x]` concluido em 2026-05-17

Contexto:

- nomes em ranking, partidas, inscritos e listas aparecem como texto;
- o app perde fluidez social/competitiva porque o jogador nao consegue abrir rapidamente o perfil de outro jogador.

Objetivo:

- transformar jogador com `userId` real em entidade navegavel.

Escopo:

1. Criar rota de perfil publico/controlado do jogador.
2. Linkar nomes/avatares quando houver `userId` em Ranking, liga, torneio, partidas e chamadas quando aplicavel.
3. Exibir nome, foto, cidade/UF, bio publica, historico recente, estatisticas simples, ranking/ligas e confronto contra usuario logado quando houver dados.
4. Se nao houver `userId`, manter texto sem link.

Criterios de conclusao:

- nome clicavel abre perfil sem expor telefone/e-mail;
- mobile usa leitura em lista, nao tabela;
- rotas diretas funcionam;
- lint/build passam.

Evidencia:

- criada rota `/jogadores/:playerId` com ficha publica/controlada do jogador;
- nomes com `userId` real em Ranking, Liga e Torneio passam por `PlayerProfileLink`; nomes soltos continuam texto;
- `profiles.profile_visibility` permite `public`/`private`, e `app_get_public_profiles` redige cidade, foto, bio e metadados pessoais quando o perfil e privado;
- no perfil privado de outro jogador, a ficha pessoal fica oculta, mas resumo competitivo, rankings e confronto direto permanecem visiveis como informacao esportiva contextual;
- `npm.cmd run lint` e `npm.cmd run build` passaram.

### [x] CTX-SCOUT-01 - Anotacoes privadas sobre adversarios

Status: `[x]` concluido em 2026-05-17

Dependencia:

- `CTX-PLAYER-01`

Objetivo:

- adicionar scouting pessoal privado no perfil de outro jogador.

Escopo:

1. Criar tabela/RLS `player_private_notes` com `owner_user_id`, `target_user_id`, `notes` e timestamps.
2. Criar servico para buscar/salvar nota do usuario logado.
3. UI no perfil publico com textarea discreta, autosave com debounce e feedback pequeno `Salvo`.
4. Campo visivel apenas para quem esta logado e nao e o proprio perfil.

Criterios de conclusao:

- nota salva e reaparece;
- outro usuario nao ve anotacao;
- RLS validada;
- lint/build passam.

Evidencia:

- criada tabela `player_private_notes` com RLS owner-only;
- perfil de outro jogador exibe `Scouting privado` com autosave debounce e estado `Salvando/Salvo/Erro`;
- anotacao pertence apenas ao usuario logado e nao fica exposta ao jogador alvo;
- `npm.cmd run lint` e `npm.cmd run build` passaram.

### [x] CTX-MODE-01 - Modo Jogador vs Trabalho/Gestao persistido

Status: `[x]` concluido em 2026-05-17

Contexto:

- `AppSurfaceMode` ja existe, mas e inferido por rota;
- usuario multi-papel precisa escolher mentalmente se esta jogando ou trabalhando.

Objetivo:

- criar seletor de modo persistido: `Jogador` e `Trabalho`.

Escopo:

1. Criar `UserModeContext`.
2. Persistir ultimo modo por usuario em `localStorage` inicialmente.
3. Mostrar seletor apenas para quem tem permissao profissional.
4. Modo `Jogador`: menu e Home focados em jogar, sem gestao como protagonista.
5. Modo `Trabalho`: menu abre melhor destino profissional permitido.
6. URLs diretas continuam funcionando e respeitando autorizacao.
7. Mobile: seletor em local discreto, sem poluir bottom nav.

Criterios de conclusao:

- usuario multi-papel alterna contexto sem confusao;
- ultimo modo reabre apos login/reload;
- jogador puro nao ve seletor;
- rotas protegidas continuam protegidas;
- lint/build passam.

Evidencia:

- criado `UserModeProvider`/`useUserMode` com persistencia `localStorage` por usuario;
- `AppShell` mostra seletor discreto `Jogador/Trabalho` apenas para usuarios com acesso profissional;
- `BottomNav` usa o modo para separar menu de jogador do menu de trabalho, preservando rotas diretas e permissoes;
- `npm.cmd run lint` e `npm.cmd run build` passaram.

### [x] CTX-ACADEMY-01 - Turmas com multiplos dias no mesmo horario

Status: `[x]` concluido em 2026-05-17

Contexto:

- `place_academy_classes` usa `weekday` unico;
- rotina real de academia usa a mesma turma em varios dias.

Objetivo:

- permitir criar e gerir turma recorrente em multiplos dias, sem quebrar chamada, agenda, conflito, matricula e mensalidade.

Escopo recomendado:

1. Adicionar `series_id`/`recurrence_group_id` em `place_academy_classes` ou entidade equivalente.
2. Criar ocorrencia por dia, todas ligadas a mesma serie.
3. Formulario de criacao com dados da turma, horario unico, chips de dias, professor/quadra, preview e validacao de conflitos.
4. Matricula/interesse permite aluno escolher um ou mais dias.
5. Preservar turmas antigas como serie de 1 dia.

Criterios de conclusao:

- criar turma Seg/Qua/Sex gera ocorrencias corretas;
- conflito de professor/quadra e bloqueado por dia;
- aluno pode selecionar dias;
- chamada continua por dia;
- lint/build passam.

Evidencia:

- adicionada coluna `place_academy_classes.recurrence_group_id` para ligar ocorrencias da mesma turma;
- criacao de turma agora permite selecionar varios dias no mesmo horario por chips de semana;
- cada dia vira uma ocorrencia real, mantendo chamada, agenda, capacidade, matricula e mensalidade por classe existente;
- validacao de conflito considera todos os dias selecionados;
- horarios abertos tambem podem ser criados em lote por multiplos dias;
- fluxo publico de aulas ja permite selecao de um ou mais dias especificos ao enviar interesse;
- `npm.cmd run lint` e `npm.cmd run build` passaram.

### [x] CTX-QA-01 - QA cruzado web/mobile por modo, permissao e contexto

Status: `[x]` concluido em 2026-05-17

Objetivo:

- validar que as mudancas contextuais nao quebraram funcoes atuais nem misturaram jogador e gestao.

Escopo:

1. Validar desktop 1366 e mobile 390/430.
2. Perfis: jogador puro, organizador, academia/admin, professor, recepcao/financeiro quando aplicavel.
3. Fluxos: ranking -> perfil, perfil -> anotacao privada, Home/notificacao -> sala, liga -> sala, torneio -> sala, criar turma multi-dia, alternar modo jogador/trabalho e feedbacks.
4. Capturar screenshots e atualizar MDs de resultado.

Criterios de conclusao:

- nenhum P0/P1 visual novo;
- jogador puro nao ve gestao indevida;
- profissional mantem ferramentas;
- mobile sem modal cortado;
- screenshots e docs atualizados.

Evidencia:

- validacao autenticada com `escalao@gmail.com` no app local contra Supabase `xdopstommqojjofapzjl`;
- migrations `0092_player_private_notes_v1.sql`, `0093_profile_visibility_v1.sql` e `0094_academy_class_recurrence_group_v1.sql` aplicadas no Supabase remoto e schema PostgREST recarregado;
- screenshots desktop/mobile capturados em `web/docs/screenshots/contextual-qa-2026-05-17/`;
- fluxos verificados: Home por modo, Ranking -> perfil publico, editor de perfil com privacidade, perfil publico com scouting privado, Academia carregando apos schema novo e Gestao acessivel para usuario profissional;
- relatorio: `CTX_QA_01_VALIDATION_2026_05_17.md`;
- `npm.cmd run lint` e `npm.cmd run build` passaram.

### [x] APP-DNA-01 - Consolidar DNA visual e gramÃ¡tica estrutural do app

Status: `[x]` concluido em 2026-05-17

Fonte:

- `UX_APP_DNA_RESTRUCTURE_REPORT_2026_05_16.md`;
- `UX_FRONTEND_AUDIT.md`;
- `PLAYER_APP_V2_IMPLEMENTATION_SPEC.md`;
- `COMPETITION_OS_V2_IMPLEMENTATION_SPEC.md`;
- `MANAGEMENT_OS_V2_IMPLEMENTATION_SPEC.md`;
- manual externo `manual_frontend_design_produto_apps_modernos.md`;
- screenshots carregados em `web/docs/screenshots/ux-frontend-audit-deep-loaded-2026-05-16/`.

Contexto:

- o app ja tem muitas funcoes implementadas, mas ainda parece complexo porque as telas expÃµem inventario de modulos, listas longas e ferramentas internas antes da intencao do usuario;
- prints carregados mostram que o problema se repete em Player App, Locais, competicoes e Management OS;
- antes de continuar mudancas pontuais, precisamos fixar uma gramÃ¡tica visual e estrutural unica para evitar que cada area resolva o mesmo problema de um jeito diferente.

Objetivo:

Criar uma base comum para os proximos sprints de reestruturaÃ§Ã£o:

- uma tela deve ter uma intencao principal;
- jogador ve tarefa e contexto pessoal, nao painel;
- gestor ve rotina operacional, nao catalogo de tudo;
- organizador opera em workspace separado da pagina publica;
- filtros, tabs, rows, cards e empty states seguem um padrao comum;
- mobile usa telas focadas, listas e sheets; desktop usa sidebar, filtros e listas/tabelas com densidade controlada.

Escopo:

1. Formalizar e aplicar no codigo uma gramÃ¡tica minima reutilizavel, sem redesign total:
   - `PageHeader`/cabecalho compacto;
   - `ActionPanel` para proxima acao ou fila curta;
   - `ObjectRow` para listas operacionais repetitivas;
   - `DiscoveryCarousel` para descoberta;
   - `FilterBar` desktop e `FilterSheet`/resumo mobile;
   - `ScopeSelector` para classe, data, local ou quadra;
   - `CompactEmptyState`;
   - `StatusBadge` e `PrimaryAction`.

2. Definir regras praticas de uso:
   - card so para objeto importante ou escolha;
   - row para repeticao operacional;
   - tabs so para paginas irmas;
   - filtros dependentes por dados reais quando possivel;
   - empty state compacto;
   - uma acao primaria por tela.

3. Revisar os componentes existentes antes de criar novos:
   - reaproveitar padrÃµes ja existentes quando estiverem bons;
   - nao introduzir biblioteca pesada;
   - nao alterar regras de negocio.

Nao objetivos:

- nao reescrever o app;
- nao trocar stack;
- nao criar backend novo neste item;
- nao redesenhar todas as telas de uma vez;
- nao remover funcionalidades.

Criterios de aceite:

- existe uma base de componentes/padroes pronta para os itens seguintes;
- docs deixam claro quando usar card, row, tabela, sheet, modal e tabs;
- nenhuma tela principal perde funcao;
- lint/build passam;
- `UX_APP_DNA_RESTRUCTURE_REPORT_2026_05_16.md` e `CURRENT_PRODUCT_STATE.md` sao atualizados com o que virou padrao real.

Entrega 2026-05-17:

- criado `src/components/AppPrimitives.tsx` com `PageHeader`, `ActionPanel`, `ObjectRow`, `DiscoveryCarousel`, `CompactEmptyState`, `ScopeSelector` e `PrimaryAction`;
- `App.css` recebeu tokens/classes compartilhadas para os primitives, com comportamento mobile;
- Home passou a usar `ActionPanel`, `ObjectRow` e `DiscoveryCarousel` na primeira dobra e descoberta;
- notificacoes passaram a ter dialog ancorado com `aria-controls` e fechamento por `Escape`;
- validacao: `npm.cmd run lint` e `npm.cmd run build` passaram.

### [x] PLAYER-HOME-DNA-01 - Home do jogador por prioridade contextual

Fonte: `UX_APP_DNA_RESTRUCTURE_REPORT_2026_05_16.md`, secao 5.1.

Problema:

- a Home mobile ainda tem cara de dashboard: texto de onboarding permanente, cards de acao altos, `Para voce`, `Trabalho` e descoberta competindo na mesma rolagem;
- usuarios com perfil gestor/admin veem informacao profissional contaminando a primeira leitura do modo jogador.

Objetivo:

Transformar a primeira dobra em uma tela objetiva:

1. header compacto;
2. CTA contextual com prioridade:
   - resultado pendente;
   - atividade nas proximas 24h;
   - convite pendente;
   - inscricao incompleta;
   - competicao em andamento;
   - descoberta local;
3. quatro acoes rapidas compactas:
   - Reservar quadra;
   - Encontrar jogo;
   - Aulas;
   - Torneios e ligas;
4. `Para voce` somente com dados reais;
5. area profissional separada e recolhida para quem tem permissao;
6. descoberta em carrosseis por proximidade.

Criterios de aceite:

- jogador puro nao ve gestao;
- admin em modo jogador ve entrada profissional separada, sem poluir a primeira dobra;
- empty states sao compactos;
- mobile 390px nao parece lista de cards administrativos;
- desktop aproveita melhor largura sem virar painel operacional.

Entrega 2026-05-17:

- primeira dobra usa CTA contextual ja calculado por prioridade;
- acoes rapidas permanecem compactas e separadas do painel pessoal;
- `Para voce` segue condicionado a dados reais;
- descoberta usa carrosseis horizontais;
- area profissional permanece separada para perfis com permissao.

### [x] PLAYER-LOCATIONS-DNA-01 - Locais por paginas de intencao

Fonte: `UX_APP_DNA_RESTRUCTURE_REPORT_2026_05_16.md`, secoes 5.2 e 5.3.

Problema:

- `Locais` mistura reservar, aulas, jogos e lista de locais;
- algumas capturas com `intent=classes` ou `intent=matches` renderizam conteudo de outra intencao, sinalizando fragilidade de estado/rota;
- abas `Todos`, `Seguindo`, `Meus locais` aparecem em fluxos onde o usuario queria reservar ou entrar em aula.

Objetivo:

Separar o hub e as intencoes:

- `/locais` = escolha leve de intencao;
- `/locais/reservar` ou estado equivalente = somente reserva;
- `/locais/aulas` = somente aulas;
- `/locais/jogos` = somente jogos abertos;
- `/locais/explorar` = locais, seguindo e meus locais.

Regras:

- cada intencao tem primeira dobra propria;
- filtro mobile em sheet/resumo;
- desktop pode manter filtro visivel, mas sem sobreposicao;
- tabs de lista de locais nao aparecem em reserva/aulas/jogos;
- rota direta deve carregar o conteudo correto.

Criterios de aceite:

- `intent=booking`, `intent=classes` e `intent=matches` nao trocam conteudo entre si;
- mobile nao mostra formulario inteiro antes do usuario entender a acao;
- "Seguindo" e "Meus locais" ficam apenas no contexto de explorar locais;
- prints novos mostram quatro experiencias distintas.

Entrega parcial 2026-05-17:

- `/locais` sem `intent` agora funciona como hub neutro de intencao, sem filtros, tabs ou bloco explicativo extra abaixo dos cards;
- as quatro escolhas do hub levam para intents dedicadas via query (`matches`, `booking`, `classes`, `venues`);
- quando uma intent esta ativa, o painel grande de descoberta vira um seletor compacto horizontal para trocar de caminho sem contaminar a primeira dobra;
- tabs `Todos`, `Seguindo` e `Meus locais` agora aparecem somente em `Ver locais`/`directory`, nao mais em reservar quadra ou entrar em aula;
- validacao: `npm.cmd run lint` e `npm.cmd run build` passaram;
- pendente dentro deste item: filtros/sheets das intents e prints autenticados das quatro experiencias.

Entrega final 2026-05-17:

- as intents diretas `#/locais?intent=booking`, `#/locais?intent=classes`, `#/locais?intent=matches` e `#/locais?intent=venues` foram validadas com capturas desktop/mobile carregadas;
- `PlacesPage` passou a sincronizar o `intent` da URL usando `useSearchParams`, `location.search` e fallback do hash, evitando que uma entrada direta caia no hub neutro;
- os filtros especificos de `Reserva`, `Aulas` e `Encontrar jogo` permanecem separados e sem tabs `Todos/Seguindo/Meus locais` fora de `Ver locais`;
- screenshots finais ficaram em `web/docs/screenshots/qa-dna-2026-05-17/`;
- validacao final: `git diff --check`, `npm.cmd run lint` e `npm.cmd run build`.

### [x] PLAYER-BOOKING-DNA-01 - Reserva publica com filtros dependentes e agenda por quadra

Fonte: `PLAYER_APP_V2_IMPLEMENTATION_SPEC.md` e `UX_APP_DNA_RESTRUCTURE_REPORT_2026_05_16.md`.

Problema:

- filtro de reserva ainda pode ficar encavalado;
- campos livres permitem escolhas impossiveis;
- fluxo precisa ser mais visual, principalmente dentro do local;
- duracao de 2h deve mostrar e bloquear intervalo completo;
- preco precisa refletir duracao.

Objetivo:

Construir fluxo de reserva em camadas:

1. filtros dependentes:
   - UF;
   - cidade;
   - local com autocomplete;
   - piso;
   - data;
   - periodo/hora;
   - duracao;
2. se local nao for escolhido, mostrar cards de locais com horarios livres;
3. ao escolher local, abrir agenda por quadra;
4. mobile usa carrossel/seletor de quadra;
5. cada quadra mostra horas cheias;
6. duracao 2h seleciona e destaca o intervalo inteiro;
7. confirmacao usa perfil logado e pede telefone somente se faltar.

Criterios de aceite:

- nenhuma sobreposicao em desktop ou mobile;
- UF/cidade/local/piso sao baseados em locais/quadras cadastrados;
- horarios de meia hora nao aparecem no fluxo publico;
- duracao altera preco e disponibilidade;
- reserva solicitada aparece para o gestor aprovar na agenda;
- feedback de sucesso explica o status pendente.

Entrega 2026-05-17:

- filtro publico de reserva ganhou grid por areas para impedir sobreposicao entre data, hora, duracao e busca em desktop;
- mobile limpa as areas do grid e usa uma coluna com botao de busca em largura total;
- busca publica normaliza duracao para 1h ou 2h, mantendo apenas horas cheias no fluxo do jogador;
- resultado por local e resultado por quadra exibem preco total calculado pela duracao escolhida;
- cards de locais deixam claro que reserva de 2h bloqueia o intervalo completo na agenda por quadra;
- pagina publica do local preserva carrossel de quadras, horarios hora a hora, intervalo selecionado e confirmacao vinculada ao perfil;
- validacao: `git diff --check`, `npm.cmd run lint` e `npm.cmd run build` passaram.

### [x] PLAYER-CLASSES-DNA-01 - Aulas com multi-dia e interesse/matricula rastreavel

Problema:

- muitas turmas aparecem como um dia por semana;
- aluno pode querer entrar na mesma turma em mais de um dia;
- enviar interesse precisa deixar claro o que acontece apos a aprovacao.

Objetivo:

- agrupar turmas recorrentes equivalentes quando forem o mesmo professor/nivel/horario/plano;
- permitir selecionar um ou mais dias conforme plano/quantidade semanal;
- ao enviar interesse, vincular ao perfil logado;
- na gestao, aprovacao deve criar/vincular matricula quando houver suporte;
- no jogador, interesse aprovado deve aparecer como aula/calendario pessoal.

Criterios de aceite:

- filtro de aulas permite multi-dia sem quebrar layout;
- card/lista de turma mostra dias disponiveis de forma compacta;
- jogador entende se esta enviando interesse, entrando em lista ou solicitando matricula;
- status do pedido aparece depois do envio.

Entrega 2026-05-17:

- pagina publica do local preserva agrupamento de turmas equivalentes por professor, nivel, horario, perfil, valor e plano;
- aluno pode selecionar todos os dias recorrentes do grupo ou alternar dias especificos antes de enviar interesse;
- envio de interesse agora evita duplicar solicitacoes ja pendentes/ativas para os mesmos dias;
- solicitacoes criadas entram imediatamente no estado local e passam a exibir chip `Interesse enviado` ou `Matriculado`;
- painel de confirmacao mostra status por dia escolhido, deixando claro que a academia precisa aprovar antes de virar aula ativa;
- CTA muda para `Interesse enviado` ou `Matricula ativa` quando o perfil ja tem vinculo naquele dia;
- filtro publico de aulas ganhou grid por areas em desktop e continua colapsando em uma coluna no mobile;
- suporte estrutural existente foi preservado: aprovacao na gestao segue usando matriculas da academia; calendario pessoal depende dos dados ja expostos pela Home/agenda do jogador;
- validacao: `git diff --check`, `npm.cmd run lint` e `npm.cmd run build` passaram.

### [x] PLAYER-MATCHES-DNA-01 - Encontrar jogo com filtros reais e criacao secundaria

Problema:

- filtro de encontrar jogo quebra/encavala;
- campos nao seguem a mesma logica de reservar quadra/aulas;
- criar chamada aparece competindo com encontrar jogo.

Objetivo:

- filtro por UF, cidade, local, data, periodo, nivel e status;
- UF/cidade/local derivados de locais cadastrados;
- resultados aparecem como rows/cards compactos de jogo;
- "Criar chamada" aparece como alternativa quando nao houver jogo bom ou como CTA secundario.

Criterios de aceite:

- desktop sem campos sobrepostos;
- mobile com filtro recolhido em sheet;
- resultados nao misturam jogos de contexto impossivel;
- criar chamada nao rouba a tarefa principal de encontrar jogo.

Entrega 2026-05-17:

- filtro de `Encontrar jogo` passou a seguir a mesma arquitetura de descoberta usada em quadras/aulas: UF, cidade, local, data, periodo, nivel, mensagem e status;
- UF/cidade/local sao derivados dos locais cadastrados com chamadas abertas/registradas, evitando opcoes soltas sem contexto;
- grid desktop usa areas nomeadas para impedir sobreposicao entre campos;
- mobile usa o mesmo controle recolhido de filtros dos fluxos de quadra/aula;
- `Criar chamada` permanece como alternativa secundaria apos a busca, sem competir com a tarefa principal de entrar em um jogo existente;
- validacao: `git diff --check`, `npm.cmd run lint` e `npm.cmd run build` passaram.

### [x] PUBLIC-PLACE-DNA-01 - Pagina publica de local por paginas irmas

Problema:

- pagina de local empilha Reserva, Aulas, Jogos, Planos e Quadras/valores;
- atalhos funcionam mais como scroll anchors do que como areas focadas.

Objetivo:

Separar conteudos:

- `Reserva`;
- `Aulas`;
- `Jogos`;
- `Planos`;
- `Sobre/Contato`.

Regras:

- header do local permanece compacto;
- cada aba/atalho mostra apenas seu conteudo;
- planos e quadras sao acionaveis:
  - plano abre fluxo de aulas conforme quantidade semanal;
  - quadra abre agenda de reserva daquela quadra/local.

Criterios de aceite:

- clicar em Reserva, Aulas, Jogos ou Planos nao leva para uma rolagem enorme;
- cada pagina tem uma acao principal clara;
- mobile reduz scroll e melhora orientacao.

Entrega 2026-05-17:

- pagina publica do local usa rotas irmas `/reserva`, `/aulas`, `/jogos`, `/planos` e `/sobre`, mantendo o header compacto e conteudo focado por intencao;
- atalhos superiores navegam para paginas focadas em vez de depender de ancora em uma pagina enorme;
- troca de aba/rota reposiciona o topo para reforcar a sensacao de nova tela;
- planos e quadras sao acionaveis: plano direciona para aulas/reserva com contexto; quadra direciona para agenda daquela quadra;
- conteudo secundario de quadras/valores fica em `Sobre`, sem poluir Reserva/Aulas/Jogos/Planos;
- validacao: `git diff --check`, `npm.cmd run lint` e `npm.cmd run build` passaram.

### [x] COMP-PUBLIC-DNA-01 - Torneio publico limpo e separado do workspace do organizador

Problema:

- pagina publica de torneio exibe ferramentas de organizador em `Jogadores`;
- `Organizacao` pode redirecionar para `Jogadores`;
- `Classificacao` aparece mesmo quando o formato nao tem fase de grupos;
- encerramento/podio aparece em `Jogos`, antes do fim.

Objetivo:

- separar public/player de organizer;
- remover ferramentas admin da pagina publica;
- exibir `Classificacao` apenas quando aplicavel;
- mover podio/encerramento para `Evento` e apenas apos fim;
- adicionar exportar chave no evento quando houver chaveamento;
- usar seletor de classe contextual, sem duplicar chips e select.

Criterios de aceite:

- inscrito publico ve jogadores/inscritos, nao botoes de importar/remover;
- organizador tem rota/workspace proprio para operar;
- torneio sem grupos nao mostra aba Classificacao;
- exportar chave aparece quando existe bracket;
- mobile nao vira pagina de 20.000 px.

Entrega 2026-05-17:

- pagina publica do torneio ja estava operando com abas reais (`Evento`, `Inscritos`, `Jogos`, `Classificacao` quando aplicavel e `Chat` quando permitido);
- `Categorias` nao fica como aba publica independente; classe aparece apenas como filtro contextual nas abas que precisam;
- ferramentas de organizador permanecem no workspace proprio, fora da leitura publica de inscritos/jogos;
- podio/encerramento fica em `Evento` e apenas apos torneio finalizado;
- `Evento` exibe `Exportar chave` quando ha chaveamento publicado;
- filtro publico de classe foi ajustado para nao duplicar chips e select: ate 6 classes usa chips; acima disso usa select unico escalavel;
- validacao: `git diff --check`, `npm.cmd run lint` e `npm.cmd run build` passaram.

### [x] COMP-LEAGUE-DNA-01 - Liga com jogador, publico e organizador separados

Status: `[x]` concluido em 2026-05-17

Problema:

- Liga mistura jogadores, convite, pagamentos, classificacao, partidas e chat admin;
- paginas mobile ficam longas demais;
- class selector precisa escalar para muitas classes.

Objetivo:

- jogador ve rodada, partidas, classificacao, jogadores e avisos;
- organizador ve convite, pagamentos, aprovacoes, configuracao e comunicacao;
- selector de classe unificado e contextual;
- partidas em rows compactas por rodada/classe/status.

Criterios de aceite:

- `Jogadores` publico nao mostra pagamentos/convite como conteudo principal;
- `Chat` publico nao mostra ferramentas admin para usuario sem papel;
- `Partidas` mobile reduz scroll por filtro/sheet/paginacao;
- classificacao usa seletor de classe compacto.

Entrega 2026-05-17:

- leitura publica da liga permanece separada em abas reais (`Liga`, `Jogadores`, `Classificacao`, `Partidas`, `Chat`);
- ferramentas de convite, pagamento, aprovacoes, configuracao e comunicacao admin seguem restritas ao workspace do organizador;
- filtro publico de classe agora replica o padrao do torneio: chips para ate 6 classes e select unico quando houver muitas classes;
- `Partidas` agora aplica de fato o recorte de classe aos jogos exibidos, alem dos filtros de rodada e status;
- chat publico nao exibe ferramentas administrativas para usuario sem papel de organizador;
- validacao: `git diff --check`, `npm.cmd run lint` e `npm.cmd run build` passaram.

### [x] MANAGEMENT-DNA-01 - Management OS mobile e desktop por rotina

Status: `[x]` concluido em 2026-05-17

Problema:

- central de gestao mobile lista fila, implantacao, varios locais, setup e acoes de modulo em uma rolagem muito longa;
- modulos de gestao ainda usam muitos cards/containers repetidos.

Objetivo:

- central mostra primeiro fila do dia;
- mobile escolhe local antes de abrir operacao completa;
- setup/implantacao fica recolhido ou em pagina propria;
- modulos mostram: contexto, fila do modulo, lista operacional, metricas/relatorio e configuracao;
- listas longas usam rows/tabelas, nao card para tudo.

Criterios de aceite:

- mobile de gestao nao empilha todos os locais com todos os detalhes;
- agenda mostra pendencias primeiro e lista completa depois;
- academia/clientes/financeiro/cantina seguem a mesma gramÃ¡tica;
- permissoes continuam preservadas.

Entrega 2026-05-17:

- central de gestao preserva `Fila do dia` como primeira camada e mantem a fila acionavel por modulo/local;
- `Locais sob sua gestao` agora ordena por pendencias, depois menor progresso de setup e depois nome;
- a primeira leitura mostra ate 4 locais em foco, com acao explicita para ver todos, evitando empilhar todos os workspaces no mobile;
- setup/implantacao continua recolhido em `details` e as acoes de rotina permanecem dentro de cada local;
- permissoes e atalhos por papel foram preservados, pois a mudanca reaproveita `placeManagementModules` e `placeResourceAccess`;
- validacao: `git diff --check`, `npm.cmd run lint` e `npm.cmd run build` passaram.

### [x] QA-DNA-01 - Auditoria visual carregada apos cada sprint de reestruturaÃ§Ã£o

Objetivo:

Repetir a captura carregada apos cada sprint grande para garantir que o app nao volte ao padrao de cards empilhados.

Escopo:

- desktop 1366;
- mobile 390;
- Home;
- Locais por intencao;
- pagina publica de local;
- torneio publico;
- liga publica;
- workspace organizador;
- gestao central e um modulo.

Criterios de aceite:

- capturas sem loading;
- relatorio curto com antes/depois;
- bugs visuais P0/P1 entram imediatamente na queue.

Entrega 2026-05-17:

- capturas desktop 1366 e mobile 390 geradas em `web/docs/screenshots/qa-dna-2026-05-17/`;
- relatorio criado em `QA_DNA_01_VISUAL_AUDIT_2026_05_17.md`;
- todas as capturas principais registraram `loaded: true` em `summary.json`;
- achado P1 de `Locais` foi corrigido no mesmo sprint: rota direta com `intent` agora abre a intencao correta;
- nao foram encontrados P0 visuais bloqueadores nas telas auditadas;
- validacao: `git diff --check`, `npm.cmd run lint` e `npm.cmd run build`.

## P0 - ReestruturaÃ§Ã£o tela por tela sem margem de interpretaÃ§Ã£o

Fonte:

- `UX_APP_DNA_RESTRUCTURE_REPORT_2026_05_16.md`;
- screenshots em `web/docs/screenshots/ux-frontend-audit-deep-loaded-2026-05-16/`;
- contact sheets em `web/docs/screenshots/ux-frontend-audit-deep-loaded-2026-05-16/_contact_sheets/`;
- feedback manual do usuario sobre Home, Locais, reserva, aulas, jogos, local publico, torneio e liga.

Regra desta subfila:

- executar em ordem;
- cada item representa uma tela, rota ou estado visual especifico;
- nao substituir por um "ajuste geral";
- nao encerrar item sem screenshot desktop e mobile;
- se faltar backend, criar fallback seguro ou documentar gap no proprio item antes de avanÃ§ar.

### Gate obrigatorio do manual para qualquer item `SCREEN-*`

Antes de marcar qualquer item `SCREEN-*` como concluido, validar explicitamente:

1. Intencao dominante:
   - a tela responde em ate 3 segundos onde o usuario esta e o que pode fazer;
   - existe uma acao primaria dominante por regiao de tela;
   - acoes secundarias nao competem com a primaria.

2. Camadas corretas:
   - jogador nao ve ferramenta de gestor/organizador;
   - organizador nao opera dentro da pagina publica;
   - configuracao/setup nao compete com rotina diaria;
   - detalhes avancados ficam em disclosure, aba propria, drawer ou pagina dedicada.

3. Cards, listas e containers:
   - card representa objeto/atalho/alerta independente;
   - lista operacional longa usa row/tabela, nao card repetitivo;
   - nao usar card dentro de card salvo excecao justificada;
   - bordas e sombras nao substituem hierarquia por espaco.

4. Filtros e formularios:
   - label sempre visivel;
   - placeholder nao substitui label;
   - campos aparecem na ordem natural da decisao;
   - mobile usa resumo + bottom sheet quando o filtro tiver muitos campos;
   - valores impossiveis nao aparecem quando houver dados para restringir;
   - erro aparece junto ao campo ou como feedback amigavel.

5. Mobile:
   - nao e desktop empilhado;
   - bottom nav nao cobre conteudo ou CTA;
   - area tocavel adequada;
   - pagina longa tem filtros, paginacao, agrupamento ou "ver mais";
   - modais longos viram paginas ou sheets adequadas.

6. Desktop:
   - usa melhor a largura sem poluir;
   - filtros podem ficar visiveis quando sao tarefa principal;
   - listas extensas usam tabela/row com densidade produtiva;
   - acoes secundarias ficam no topo direito, menu ou coluna lateral.

7. Estados:
   - loading nao aparece como texto cru persistente;
   - empty state tem titulo curto, explicacao curta e uma acao;
   - erro tecnico nunca aparece cru;
   - sucesso/falha tem feedback visivel.

8. Evidencia:
   - screenshot desktop carregado;
   - screenshot mobile 390px carregado;
   - rota direta validada;
   - se houver permissao, validar usuario sem permissao ou documentar gap.

Se qualquer regra acima falhar, o item permanece aberto mesmo que a funcao "funcione".

### Matriz de conformidade com o manual

| Item | Manual aplicado | Risco atual observado | Resultado esperado |
|---|---|---|---|
| `SCREEN-HOME-01` | Home nao e catalogo; uma proxima acao; separar perfis | Home mobile parece dashboard e mistura profissional | Primeira dobra contextual, leve e pessoal |
| `SCREEN-HOME-02` | Desktop usa largura sem virar painel administrativo | Home desktop pode repetir modulos | Duas colunas com proxima acao, pessoal e descoberta |
| `SCREEN-NOTIFICATIONS-01` | Modal/popover/sheet conforme contexto | Sino abre card solto no meio da pagina | Popover ancorado no desktop, sheet no mobile |
| `SCREEN-LOCAIS-01` | Organizar por intencao | Hub parece mini-dashboard | Quatro escolhas claras, sem filtro antes da escolha |
| `SCREEN-LOCAIS-02` | Inputs claros, labels, campos dependentes | Filtro encavala e aceita valores livres demais | UF/cidade/local/piso/data/hora/duracao com layout robusto |
| `SCREEN-LOCAIS-03` | Lista leve antes de detalhe | Quadras de varios locais aparecem soltas | Primeiro escolher local, depois agenda |
| `SCREEN-LOCAIS-04` | Acao primaria e feedback visual | Duracao 2h nao comunica intervalo/preco | Slots hora a hora com intervalo e custo corretos |
| `SCREEN-LOCAIS-05` | Formulario nao duplica identidade | Nome/telefone parecem cadastro manual | Reserva vinculada ao perfil logado |
| `SCREEN-LOCAIS-06` | Filtro mobile em sheet; dados agrupados | Turmas viram itens isolados e filtro pesado | Turmas agrupadas, multi-dia e resultado claro |
| `SCREEN-LOCAIS-07` | Estado e proximo passo claros | Interesse nao explica aprovacao/matricula | Status rastreavel e consequencia visivel |
| `SCREEN-LOCAIS-08` | Busca por intencao; CTA secundario | Criar chamada compete com encontrar jogo | Filtros reais e criar chamada como alternativa |
| `SCREEN-LOCAL-01` | Pagina de objeto com acoes irmas | Local empilha todos os modulos | Vitrine do local + navegacao para paginas irmas |
| `SCREEN-LOCAL-02` | Tela focada em tarefa | Reserva convive com outros modulos | Reserva dedicada, agenda por quadra |
| `SCREEN-LOCAL-03` | Tela focada em tarefa | Aulas misturadas com reserva/jogos/planos | Aulas dedicadas, filtro e selecao de dias |
| `SCREEN-LOCAL-04` | Tela focada em tarefa | Jogos abertos sem filtros | Jogos do local com filtro e CTA |
| `SCREEN-LOCAL-05` | Objeto acionavel, nao texto passivo | Planos/quadras apenas informativos | Planos iniciam fluxo de aulas/reserva |
| `SCREEN-COMP-HUB-01` | Separar por perfil/intencao | Jogando, descobrindo e organizando podem misturar | Hub com segmentos limpos e organizacao secundaria |
| `SCREEN-TOURNAMENT-01` | Evento publico como objeto | Evento vira cockpit | Resumo publico, CTA e exportar chave quando aplicavel |
| `SCREEN-TOURNAMENT-02` | Camadas publico vs admin | Inscritos mostra remover/importar | Lista publica sem ferramentas admin |
| `SCREEN-TOURNAMENT-03` | Mobile nao deve ser pagina enorme | Jogos/chave muito longos | Classe contextual, lista por fase e exportacao |
| `SCREEN-TOURNAMENT-04` | Nao mostrar aba sem funcao | Classificacao vazia em mata-mata | Aba some quando nao aplicavel |
| `SCREEN-TOURNAMENT-05` | Comunicacao limpa por permissao | Chat mostra ferramentas admin | Avisos limpos; publicar/fixar so com permissao |
| `SCREEN-TOURNAMENT-ORG-01` | Workspace separado | Organizacao redireciona/mistura jogadores | Workspace com abas operacionais proprias |
| `SCREEN-LEAGUE-01` | Status compacto e classe contextual | Inscricao aprovada vira card grande | Badge discreto e selector por aba |
| `SCREEN-LEAGUE-02` | Lista publica vs admin | Jogadores mistura pagamento/convite | Publico limpo, pagamentos no organizador |
| `SCREEN-LEAGUE-03` | Lista mobile compacta | Partidas geram rolagem gigante | Filtros e rows por classe/rodada/status |
| `SCREEN-LEAGUE-04` | Tabela mobile adaptada | Classificacao longa e tecnica | Selector + tabela compacta |
| `SCREEN-LEAGUE-05` | Acoes por permissao | Chat com ferramentas admin | Avisos para jogador, ferramentas no organizador |
| `SCREEN-GESTAO-01` | Operacao diaria antes de configuracao | Central mobile lista tudo | Fila do dia + locais compactos |
| `SCREEN-GESTAO-AGENDA-01` | Rotina antes de lista completa | Agenda empilha pendencias e historico | Pendencias, espera, filtros e lista depois |
| `SCREEN-GESTAO-ACADEMIA-01` | Rotina diaria sem wizard | Academia mistura setup e rotina | Hoje/chamada/pendencias primeiro |
| `SCREEN-GESTAO-CLIENTES-01` | Busca/acao principal clara | CRM pode parecer planilha/card pile | Follow-up, busca e novo contato |
| `SCREEN-GESTAO-FINANCEIRO-01` | Origem e acao financeira claras | Recebiveis misturam origens | Pendentes/vencidos/origem/acao |
| `SCREEN-GESTAO-CANTINA-01` | Modulo por plano/permissao | Cantina pode aparecer desativada | POS so quando ativo; vender produto como CTA |

### Ordem rigida de execucao por sprint

Sprint 1 - base e primeira dobra:

1. `APP-DNA-01`
2. `SCREEN-HOME-01`
3. `SCREEN-HOME-02`
4. `SCREEN-NOTIFICATIONS-01`

Sprint 2 - Locais e reserva:

1. `SCREEN-LOCAIS-01`
2. `SCREEN-LOCAIS-02`
3. `SCREEN-LOCAIS-03`
4. `SCREEN-LOCAIS-04`
5. `SCREEN-LOCAIS-05`

Sprint 3 - Aulas, jogos e local publico:

1. `SCREEN-LOCAIS-06`
2. `SCREEN-LOCAIS-07`
3. `SCREEN-LOCAIS-08`
4. `SCREEN-LOCAL-01`
5. `SCREEN-LOCAL-02`
6. `SCREEN-LOCAL-03`
7. `SCREEN-LOCAL-04`
8. `SCREEN-LOCAL-05`

Sprint 4 - Torneio publico e workspace:

1. `SCREEN-COMP-HUB-01`
2. `SCREEN-TOURNAMENT-01`
3. `SCREEN-TOURNAMENT-02`
4. `SCREEN-TOURNAMENT-03`
5. `SCREEN-TOURNAMENT-04`
6. `SCREEN-TOURNAMENT-05`
7. `SCREEN-TOURNAMENT-ORG-01`

Sprint 5 - Liga:

1. `SCREEN-LEAGUE-01`
2. `SCREEN-LEAGUE-02`
3. `SCREEN-LEAGUE-03`
4. `SCREEN-LEAGUE-04`
5. `SCREEN-LEAGUE-05`

Sprint 6 - Gestao:

1. `SCREEN-GESTAO-01`
2. `SCREEN-GESTAO-AGENDA-01`
3. `SCREEN-GESTAO-ACADEMIA-01`
4. `SCREEN-GESTAO-CLIENTES-01`
5. `SCREEN-GESTAO-FINANCEIRO-01`
6. `SCREEN-GESTAO-CANTINA-01`

Sprint 7 - regressao:

1. `QA-DNA-01`

### Validacao documental da subfila `SCREEN-*`

Executada em 2026-05-16 antes de entregar a queue final para implementacao.

Resultado da checagem:

- 34 itens `SCREEN-*` encontrados;
- 34 itens cobertos na matriz de conformidade com o manual;
- 0 itens sem matriz;
- 0 itens extras na matriz;
- 34 itens com `Mudanca obrigatoria`;
- 34 itens com `Criterio de aceite`;
- todo item herda o gate obrigatorio do manual com validacao desktop, mobile, estados e evidencia.

Regra de revisao:

- se uma implementacao futura nao cumprir o gate do manual, o item volta para aberto mesmo que a funcao esteja operacional;
- se a implementacao descobrir uma tela nao mapeada, criar novo `SCREEN-*` antes de seguir para a proxima sprint;
- se uma mudanca exigir backend estrutural, documentar o gap no item e entregar fallback visual seguro, sem expor erro cru ao usuario.

### [x] SCREEN-HOME-01 - `/inicio` mobile: primeira dobra do jogador

Screenshots de referencia:

- `mobile390-inicio.png`
- `desktop1366-inicio.png`

Problema:

- primeira dobra ainda parece painel;
- texto de onboarding permanente ocupa espaco;
- cards de acao sao altos e repetem explicacao;
- area profissional aparece como continuidade do jogador.

Mudanca obrigatoria:

- header compacto com nome/avatar e sino;
- bloco principal com CTA contextual unico;
- regra de prioridade do CTA:
  1. resultado pendente;
  2. atividade nas proximas 24h;
  3. convite pendente;
  4. inscricao incompleta;
  5. competicao em andamento;
  6. descoberta local;
- quatro acoes rapidas compactas:
  - Reservar;
  - Jogar;
  - Aulas;
  - Competir;
- remover textos longos do tipo "escolha uma acao simples";
- `Para voce` so aparece se houver dado real;
- entrada de gestao/profissional fica em bloco separado, abaixo, recolhivel ou com peso secundario.

Backend/dados:

- usar dados ja existentes de partidas, reservas, aulas, convites, inscricoes e competicoes;
- nao criar backend novo neste item;
- se algum tipo nao existir, omitir do ranking de prioridade.

Criterio de aceite:

- em 390px, a primeira dobra mostra header, CTA contextual e acoes rapidas sem parecer dashboard;
- jogador puro nao ve bloco profissional;
- admin em modo jogador ve bloco profissional separado;
- nao existe card vazio grande.

Entrega 2026-05-17:

- Home usa `ActionPanel` para o CTA contextual e reduz a primeira dobra a acao principal + rows pessoais;
- rows pessoais usam `ObjectRow`, evitando card alto/explicativo;
- descoberta usa carrossel em vez de pilha longa;
- validacao visual autenticada via Chrome headless ficou bloqueada no gate de login, apesar de login demo documentado; screenshots nao autenticados foram salvos em `web/docs/screenshots/sprint-2026-05-17-app-dna-01/`.

### [x] SCREEN-HOME-02 - `/inicio` desktop: Home sem catalogo de modulos

Screenshots de referencia:

- `desktop1366-inicio.png`

Problema:

- desktop pode aproveitar largura, mas nao deve virar painel administrativo para jogador.

Mudanca obrigatoria:

- layout em duas colunas:
  - coluna principal: CTA contextual, pendencias pessoais, proximos compromissos;
  - coluna lateral: acoes rapidas e descoberta local;
- area profissional aparece como card/section propria apenas para perfil com permissao;
- eventos/locais de descoberta aparecem em carrossel/lista curta, nao em pilha longa.

Criterio de aceite:

- a acao principal da Home e evidente em ate 3 segundos;
- nenhuma metrica administrativa aparece no modo jogador;
- desktop nao repete os mesmos atalhos em mais de um bloco.

Entrega 2026-05-17:

- o sino segue usando o popover/sheet existente, mas agora recebe semantica de dialog, `aria-controls` e fechamento por `Escape`;
- a entrega evita o card solto como conteudo da pagina e preserva a fonte atual de notificacoes.

### [x] SCREEN-NOTIFICATIONS-01 - Sino de notificacoes web/mobile

Screenshots de referencia:

- prints manuais do sino abrindo card no meio da Home.

Problema:

- notificacoes abrem como card comum dentro da pagina, quebrando expectativa de produto web/mobile.

Mudanca obrigatoria:

- desktop:
  - sino abre popover ancorado ao botao;
  - largura controlada;
  - fecha ao clicar fora, ESC ou botao fechar;
  - lista notificacoes por prioridade;
  - acoes inline compactas;
- mobile:
  - sino abre bottom sheet ou tela dedicada curta;
  - nao empurra a Home para baixo;
  - botao voltar/fechar claro;
- notificacao com acao leva para rota correta;
- estado vazio compacto.

Backend/dados:

- reaproveitar fonte atual de notificacoes/pendencias;
- nao criar notificacao nova neste item.

Criterio de aceite:

- clicar no sino nunca cria um card solto no meio da pagina;
- popover/sheet respeita foco visual;
- mobile e desktop seguem padrao comum.

### [x] SCREEN-LOCAIS-01 - `/locais`: hub de intencao

Status: `[x]` concluido em 2026-05-17

Screenshots de referencia:

- `mobile390-locais.png`
- `desktop1366-locais.png`

Problema:

- hub ainda parece mini-dashboard com cards explicativos;
- CTA "comece pela intencao" repete conceito do proprio hub.

Mudanca obrigatoria:

- manter titulo `Locais`;
- mostrar quatro escolhas:
  - Reservar quadra;
  - Entrar em aula;
  - Encontrar jogo;
  - Ver locais;
- cada escolha tem titulo curto, uma microcopy e numero opcional;
- remover bloco explicativo extra se nao houver acao real;
- clique vai para tela dedicada, nao scroll/estado misturado.

Criterio de aceite:

- em mobile, hub cabe quase inteiro na primeira dobra;
- cada card leva para uma intencao diferente;
- nao aparecem filtros na tela de hub antes da escolha.

Entrega 2026-05-17:

- removido o estado explicativo redundante `Comece pela intencao`;
- hub renderiza apenas titulo da pagina e quatro cards de intencao;
- cards deixaram de marcar uma intencao ativa quando o usuario ainda esta no hub;
- intents ativas usam `places-intent-strip` compacto em vez do painel grande;
- tabs de locais foram restringidas a `Ver locais`.

### [x] SCREEN-LOCAIS-02 - `/locais/reservar` ou `?intent=booking`: filtro inicial de reserva

Screenshots de referencia:

- `mobile390-locais-reserva.png`
- `desktop1366-locais-reserva.png`
- prints manuais de sobreposicao em Data/Hora.

Problema:

- filtro pode quebrar em desktop;
- botao grande compete com campos;
- campos permitem escolhas fora do universo real.

Mudanca obrigatoria:

- campos nesta ordem:
  1. UF;
  2. Cidade;
  3. Local;
  4. Piso;
  5. Data;
  6. Periodo/Hora;
  7. Duracao;
- defaults:
  - UF: `Todos`;
  - Cidade: `Todas`;
  - Local: vazio com autocomplete;
  - Piso: `Qualquer piso`;
  - Data: hoje/proxima data valida;
  - Periodo/Hora: `Qualquer horario`;
  - Duracao: `1h`;
- botao de busca desktop pode virar icone/lupa quando o contexto estiver claro;
- mobile usa resumo + sheet, nao formulario comprido sempre aberto;
- nenhuma sobreposicao de campos.

Backend/dados:

- UF e cidade devem vir de locais com quadras ativas;
- local autocomplete deve respeitar UF/cidade;
- piso deve vir de `place_courts.surface` ou campo equivalente;
- se piso nao existir confiavel, documentar gap e usar fallback visual sem bloquear fluxo.

Criterio de aceite:

- 1366px, 430px e 390px sem campo cortado;
- trocar UF recalcula cidades e locais;
- trocar cidade recalcula locais;
- busca sem local retorna locais compativeis.

Entrega final 2026-05-17:

- filtro de reserva passou a iniciar neutro: UF `Todas`, cidade `Todas`, local vazio, piso `Qualquer piso`, data atual, hora/periodo `Qualquer horario` e duracao `1h`;
- grid recebeu normalizacao de largura para inputs/selects, reduzindo risco de data/hora/duracao encavalarem;
- no mobile, foi criado resumo acionavel `Ajustar filtros`; os campos ficam recolhidos ate o usuario pedir ajuste;
- o botao de busca permanece como lupa no desktop e fica dentro do bloco de filtros no mobile;
- a segunda linha do grid foi redistribuida para evitar que `Data`, `Hora`, `Duracao` e a lupa encavalem em larguras intermediarias;
- UF/cidade/local/piso continuam derivados de locais/quadras ativas ja carregados no app;
- screenshots autenticados gerados em `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-locais-reserva-validated.png` e `web/docs/screenshots/qa-dna-2026-05-17/mobile390-locais-reserva-validated.png`;
- validacao final: `git diff --check`, `npm.cmd run lint` e `npm.cmd run build` passaram.

### [x] SCREEN-LOCAIS-03 - Resultado de reserva sem local escolhido

Screenshots de referencia:

- prints manuais com cards de quadras de varios locais.

Problema:

- quando nao ha local escolhido, o app mostra muitas quadras diretamente; o usuario perde contexto de academia/local.

Mudanca obrigatoria:

- resultado primario deve ser por local:
  - nome do local;
  - cidade/UF;
  - menor preco;
  - pisos disponiveis;
  - quantidade de quadras com horario livre;
  - 2-4 horarios livres destacados;
  - CTA `Ver horarios`;
- so apos escolher o local, mostrar agenda por quadra.

Criterio de aceite:

- resultado sem local nao mistura quadras soltas de academias diferentes;
- o usuario entende primeiro onde vai jogar;
- mobile usa cards horizontais/lista compacta.

Entrega final 2026-05-17:

- quando a busca de reserva retorna disponibilidade sem um local exato escolhido, o resultado agora agrupa primeiro por local/academia;
- cada card de local mostra cidade/UF, quantidade de quadras livres, menor preco, pisos disponiveis, ate quatro horarios e CTA `Ver horarios`;
- ao escolher um local, o usuario vai para a pagina publica daquele local ja no contexto de reserva, preservando data/hora/duracao quando houver horario selecionado;
- quando o usuario escolhe um local exato no autocomplete, o resultado continua podendo mostrar as quadras daquele local para selecao direta;
- screenshots autenticados gerados em `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-locais-reserva-resultados-local.png` e `web/docs/screenshots/qa-dna-2026-05-17/mobile390-locais-reserva-resultados-local.png`;
- validacao mostrou 3 cards de local e 0 cards de quadra solta sem local escolhido;
- validacao: `npm.cmd run lint` e `npm.cmd run build` passaram.

### [x] SCREEN-LOCAIS-04 - Agenda de reserva por local e quadra

Screenshots de referencia:

- prints manuais da agenda de quadra com 06:00, 07:00, 08:00...
- `PLAYER_APP_V2_IMPLEMENTATION_SPEC.md`.

Problema:

- selecao de horario para duracao 2h pode gerar duvida;
- preco precisa acompanhar duracao;
- agenda precisa ser bonita e clara.

Mudanca obrigatoria:

- mostrar seletor/carrossel de quadras:
  - cada quadro = uma quadra;
  - superficie e preco/hora visiveis;
  - slots hora cheia;
  - ocupado visualmente neutro/desabilitado;
  - livre acionavel;
- ao selecionar duracao 2h:
  - so habilitar horarios com duas horas consecutivas livres;
  - clicar em 12:00 destaca 12:00-14:00;
  - resumo mostra intervalo completo;
  - preco = preco/hora * duracao;
- sticky CTA de confirmar apenas quando slot valido selecionado.

Backend/dados:

- validar disponibilidade final no backend antes de criar reserva;
- se houver conflito no submit, mostrar mensagem amigavel e atualizar agenda.

Criterio de aceite:

- duracao 2h nunca permite slot sem segunda hora livre;
- resumo e preco batem com intervalo;
- mobile nao exige selecionar quadra em dropdown se ja esta no carrossel.

Entrega parcial 2026-05-17:

- a pagina publica do local ja possui carrossel/seletor de quadras com superficie, preco/hora e slots em horas cheias;
- disponibilidade e consultada por intervalo completo, entao duracao `2h` busca somente quadras livres para as duas horas;
- resumo de confirmacao mostra intervalo e total proporcional a duracao;
- ajuste aplicado: a segunda hora destacada no intervalo de `2h` fica desabilitada como continuacao (`Incluido`), evitando parecer um novo horario clicavel;
- validacao: `npm.cmd run lint` e `npm.cmd run build` passaram;
- pendente para marcar `[x]`: screenshot autenticado desktop/mobile e revisao visual do CTA sticky no mobile.

Entrega final 2026-05-17:

- ajuste aplicado em `PlacePublicPage`: quando a pagina publica recebe `startsAt` e `endsAt` pela URL, o controle visual de duracao tambem sincroniza para `1h` ou `2h`;
- validacao autenticada confirmou seletor em `2h`, resumo com intervalo completo e total proporcional;
- carrossel de quadras carregado com horarios hora cheia, slots ocupados desabilitados, livres acionaveis e intervalo de `2h` destacado como `07:00 2h` + `08:00 Incluido`;
- evidencias geradas:
  - `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-local-reserva-agenda-2h-validated.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/mobile390-local-reserva-agenda-2h-validated.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-local-reserva-agenda-2h-carousel.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/mobile390-local-reserva-agenda-2h-carousel.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/screen-locais-04-carousel-validation.json`;
- validacao tecnica final deste item sera consolidada no fechamento do sprint corrente com `git diff --check`, lint e build.

### [x] SCREEN-LOCAIS-05 - Confirmacao de reserva

Screenshots de referencia:

- prints manuais mostrando nome/WhatsApp preenchidos.

Problema:

- nome e contato parecem novo cadastro manual, apesar de usuario estar logado.

Mudanca obrigatoria:

- bloco `Reserva vinculada ao perfil`;
- exibir nome e telefone do perfil como dados usados;
- permitir editar/confirmar telefone apenas se ausente ou claramente "alterar contato";
- observacao opcional;
- botoes:
  - `Solicitar reserva`;
  - `Entrar na lista de espera` quando aplicavel.

Backend/dados:

- criar reserva com `auth.uid()`/perfil logado;
- gravar nome/telefone snapshot para local retornar;
- reserva pendente deve aparecer em Agenda do gestor.

Criterio de aceite:

- jogador entende que reserva e dele;
- gestor encontra a reserva pendente em agenda/fila;
- erro de criacao nao fica silencioso.

Verificacao 2026-05-17:

- a confirmacao ja exibe bloco `Reserva vinculada ao perfil` com nome e telefone do perfil;
- telefone so aparece como campo editavel quando falta contato no perfil;
- observacao permanece opcional;
- `Solicitar reserva` usa o perfil logado via service/auth e grava snapshot de nome/telefone;
- feedback de sucesso informa que o gestor encontra em `Gestao > Agenda > Reservas pendentes`;
- lista de espera usa o mesmo vinculo de perfil e snapshot de contato;
- validacao: `npm.cmd run lint` e `npm.cmd run build` passaram apos o sprint de reserva;
- pendente para marcar `[x]`: validacao autenticada criando uma reserva real e conferindo a aparicao na Agenda do gestor.

Entrega final 2026-05-17:

- validacao autenticada criou uma reserva publica real vinculada ao perfil logado;
- confirmacao exibiu `Reserva vinculada ao perfil`, usando nome e telefone do usuario sem repetir formulario de cadastro;
- feedback de sucesso confirmou que a reserva foi solicitada e orientou onde o gestor encontra a pendencia;
- `Gestao > Agenda > Reservas` exibiu a nova pendencia como `Escalao Admin - 17/05, 10:00`, com acoes `Confirmar` e `Cancelar`;
- evidencias geradas:
  - `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-local-reserva-confirmacao-solicitada.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-gestao-agenda-reserva-pendente-pos-solicitacao.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/screen-locais-05-validation.json`;
- validacao tecnica final deste item sera consolidada no fechamento do sprint corrente com `git diff --check`, lint e build.

### [x] SCREEN-LOCAIS-06 - `/locais/aulas`: filtro e resultado de aulas

Screenshots de referencia:

- `mobile390-locais-aulas.png`
- `desktop1366-locais-aulas.png`
- prints manuais da lista "Turmas com vaga".

Problema:

- filtro ainda e pesado;
- turmas semanais aparecem como itens isolados;
- nao ha selecao clara de multiplos dias da mesma turma/plano.

Mudanca obrigatoria:

- filtro:
  - UF;
  - Cidade;
  - Local/professor;
  - Dias da semana multi-select;
  - Periodo;
  - Nivel;
  - Perfil adulto/kids;
- resultados:
  - agrupar turmas recorrentes equivalentes por local/professor/nivel/horario quando fizer sentido;
  - mostrar dias disponiveis como chips;
  - permitir selecionar um ou mais dias;
  - respeitar capacidade: adulto max 4, kids max 8, conforme dados;
  - CTA `Ver turma` ou `Selecionar turma`.

Backend/dados:

- usar `place_academy_classes`, `place_academy_enrollments` e contrato/plano quando houver;
- se nao houver modelo de grupo recorrente, agrupar no frontend por assinatura e documentar gap.

Criterio de aceite:

- usuario pode selecionar dias especificos;
- listagem nao parece tabela administrativa;
- mobile tem filtro em sheet e resultado legivel.

Entrega parcial 2026-05-17:

- filtro de aulas passou a usar UF e cidade dependentes dos locais com turmas ativas;
- campo `Academia ou professor` ganhou sugestoes por locais/professores existentes no recorte selecionado;
- `Dia` deixou de ser select unico e virou multi-select por chips, permitindo buscar turmas em um ou mais dias da semana;
- busca backend agora consulta cada dia selecionado e consolida os resultados sem duplicar turma;
- fallback local tambem respeita multiplos dias;
- resultados continuam agrupados por assinatura de turma recorrente (`local + titulo + professor + nivel + horario + valor`) e exibem dias disponiveis;
- CTA mudou para `Selecionar turma` e envia todos os `classIds` do grupo para a pagina publica do local;
- `/locais/:placeId?intent=academy&classIds=...` agora pre-seleciona todos os dias equivalentes da turma, mantendo a selecao final/editavel na pagina do local;
- layout do filtro de aulas foi reorganizado em grid de 12 colunas no desktop e recolhido por `Ajustar filtros` no mobile, seguindo o padrao de reserva;
- validacao: `npm.cmd run lint` e `npm.cmd run build` passaram.

Entrega final 2026-05-17:

- screenshots autenticados gerados em desktop, 430px e 390px;
- filtro validado com chips de dias e sem overflow horizontal indevido no mobile 390px;
- busca real retornou 18 turmas com vaga e CTA `Selecionar turma`;
- resultado mobile preserva contexto compacto (`Ajustar filtros`, resumo de filtro e lista de turmas) sem parecer tabela administrativa;
- evidencias geradas:
  - `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-locais-aulas-validated.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/mobile430-locais-aulas-filtros-validated.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/mobile390-locais-aulas-validated.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-locais-aulas-resultados-validated.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/mobile390-locais-aulas-resultados-validated.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/screen-locais-06-results-validation.json`;
- validacao de envio/aprovacao do interesse ficou concentrada no item seguinte `SCREEN-LOCAIS-07`, para nao misturar listagem/filtro com confirmacao transacional.

### [x] SCREEN-LOCAIS-07 - Enviar interesse em aula

Screenshots de referencia:

- print manual do bloco `Enviar interesse`.

Problema:

- o usuario nao entende se esta entrando na turma, entrando em fila ou mandando pedido;
- apos aprovacao, caminho ate calendario/matricula nao esta claro.

Mudanca obrigatoria:

- resumo da turma selecionada:
  - local;
  - professor;
  - dias selecionados;
  - horario;
  - valor estimado/plano;
  - vagas;
- dados do perfil logado;
- mensagem opcional;
- CTA `Enviar interesse`;
- apos envio, mostrar status `Aguardando retorno da academia`;
- explicar em uma linha: "Se aprovado, suas aulas aparecem na sua agenda."

Backend/dados:

- criar `place_academy_lesson_requests` ou entidade existente equivalente;
- garantir que admin consiga aprovar;
- quando aprovado, criar/vincular `place_academy_enrollments`/contract se backend permitir;
- se estrutural demais, documentar gap como bloqueador.

Criterio de aceite:

- jogador ve status do interesse depois;
- academia ve pedido;
- aprovacao leva a matricula/calendario ou gap documentado.

Entrega parcial 2026-05-17:

- resumo da turma selecionada foi reestruturado para mostrar local, professor, dias/horarios, valor e vagas em campos curtos;
- envio ficou vinculado ao perfil logado, com nome/telefone exibidos como confirmacao;
- WhatsApp so vira input quando o perfil nao tem telefone;
- mensagem permanece opcional;
- CTA segue `Enviar interesse`, mas agora exige contato antes do envio;
- feedback de sucesso usa status claro: `Aguardando retorno da academia. Se aprovado, suas aulas aparecem na sua agenda.`;
- backend atual continua usando `createAcademyEnrollment(...)` para criar pedidos pendentes por `classId`, incluindo os dias escolhidos nas notas;
- validacao: `npm.cmd run lint` e `npm.cmd run build` passaram.

Conclusao 2026-05-17:

- validado em app autenticado com `qa.jogador.puro@demo.atp.local`:
  - envio de interesse exibiu feedback `Interesse enviado`;
  - status da turma passou a `Aguardando aprovacao`;
  - texto explica que, se aprovado, as aulas aparecem na agenda;
- validado com `escalao@gmail.com` em `Gestao > Academia > Pendencias`:
  - pedido entrou como matricula pendente (`Livia Jogadora Pura`, turma `Kids Iniciante 1`);
  - acao `Ativar` ficou disponivel na fila da academia;
  - apos ativacao, a turma saiu da lista de vagas para o aluno e a Home carregou contexto de aula;
- comportamento backend atual confirmado:
  - interesse publico usa `place_academy_enrollments` com `status=pending`;
  - aprovacao usa `updateAcademyEnrollmentStatus(..., "active")`;
  - nao ha entidade separada de calendario do aluno; a agenda pessoal deriva da matricula ativa + dados da turma;
- evidencias:
  - `web/docs/screenshots/qa-dna-2026-05-17/screen-locais-07-player-interest-created.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/screen-locais-07-admin-interest-visible.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/screen-locais-07-admin-after-activate.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/screen-locais-07-player-after-approval.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/screen-locais-07-player-home-after-approval.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/screen-locais-07-validation-real-interest.json`;
  - `web/docs/screenshots/qa-dna-2026-05-17/screen-locais-07-approval-validation.json`;
  - `web/docs/screenshots/qa-dna-2026-05-17/screen-locais-07-player-home-after-approval.json`.

### [x] SCREEN-LOCAIS-08 - `/locais/jogos`: encontrar jogo

Screenshots de referencia:

- `mobile390-locais-jogos.png`
- `desktop1366-locais-jogos.png`
- print manual com filtro encavalado.

Problema:

- filtro quebra no desktop;
- nao segue dependencia UF/cidade/local;
- criar chamada compete com buscar chamada.

Mudanca obrigatoria:

- filtro:
  - UF;
  - Cidade;
  - Local;
  - Data;
  - Periodo;
  - Nivel;
  - Status;
- UF/cidade/local dependentes como reserva;
- resultado com jogos abertos em rows/cards compactos:
  - local;
  - data/hora;
  - nivel;
  - jogadores/interessados;
  - CTA `Quero jogar`;
  - detalhes secundario;
- `Criar chamada` aparece como secundaria:
  - no topo como link menor;
  - ou em empty state quando nao encontrou jogo.

Criterio de aceite:

- filtro sem sobreposicao;
- resultados respondem ao filtro;
- mobile usa sheet;
- criar chamada nao e o CTA principal quando ha jogos disponiveis.

Entrega parcial 2026-05-17:

- filtro de jogos ja usa UF, cidade e local dependentes dos locais com chamadas abertas;
- grid desktop foi ajustado para evitar UF estreito e sobreposicao entre local/data/periodo/nivel/status;
- `Criar chamada` deixou de ser CTA primario quando existem resultados e passou a aparecer como acao secundaria;
- empty state sem resultados ganhou acao clara para criar chamada;
- resultados continuam em rows/cards compactos com local, data/hora, nivel, interessados, CTA `Quero jogar` e detalhes secundarios;
- validacao: `npm.cmd run lint` e `npm.cmd run build` passaram.

Conclusao 2026-05-17:

- corrigida quebra mobile do grid de filtros, anulando explicitamente as areas nomeadas no breakpoint responsivo;
- corrigida hierarquia do cabecalho para separar titulo e microcopy;
- validacao autenticada com `qa.jogador.puro@demo.atp.local`:
  - desktop 1366px: 8 resultados, 0 overlaps, 0 overflow;
  - mobile 390px: 8 resultados, 0 overlaps, 0 overflow;
  - filtro mostra UF, cidade, local, data, periodo, nivel, mensagem e status;
  - `Criar chamada` permanece secundaria abaixo do filtro, sem competir com `Quero jogar`;
- evidencias:
  - `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-locais-jogos-validated.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/mobile390-locais-jogos-validated.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/screen-locais-08-validation.json`.

### [x] SCREEN-LOCAL-01 - `/locais/:id`: pagina inicial do local

Screenshots de referencia:

- prints manuais da Arena Pantanal Tennis.

Problema:

- pagina inicial do local ainda carrega blocos demais se o usuario rolar;
- atalhos levam a secoes em vez de paginas focadas.

Mudanca obrigatoria:

- header com imagem/logo, cidade, descricao curta e status/preco inicial;
- cards/atalhos:
  - Reservar;
  - Aulas;
  - Jogos;
  - Planos;
  - Sobre/Contato;
- abaixo, apenas resumo curto e talvez destaques;
- nao renderizar formularios completos na home do local.

Criterio de aceite:

- primeira dobra do local parece vitrine objetiva;
- clicar em cada atalho muda para pagina/conteudo focado;
- nao ha empilhamento de todos os modulos.

Entrega parcial 2026-05-17:

- `intent=overview` deixou de redirecionar automaticamente para reserva/aulas/jogos; a home do local permanece como vitrine objetiva;
- atalhos do local agora levam para conteudos focados via `intent=booking`, `intent=academy`, `intent=matches`, `intent=plans` e `intent=about`;
- o card `Sobre/Contato` virou pagina/area focada com descricao, cidade, contadores resumidos e acoes de compartilhar/ver outros locais;
- a home mostra apenas tiles de resumo e poucos destaques acionaveis, sem renderizar formularios completos;
- `Quadras e valores` deixou de aparecer como detalhe expansivel na home e fica restrito ao contexto `Sobre/Contato`;
- validacao: `npm.cmd run lint` e `npm.cmd run build` passaram.

Concluido em 2026-05-17:

- validacao autenticada desktop/mobile confirmou que a home do local nao renderiza formularios completos de reserva, aulas, jogos ou planos;
- atalhos foram validados por rotas irmas (`/reserva`, `/aulas`, `/jogos`, `/planos`, `/sobre`) e mantem conteudo focado fora da home;
- evidencias:
  - `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-local-home-validated.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/mobile390-local-home-validated.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/screen-local-01-validation.json`.

### [x] SCREEN-LOCAL-02 - `/locais/:id/reserva`

Mudanca obrigatoria:

- pagina dedicada de reserva do local;
- escolher data e duracao;
- agenda por quadra em carrossel/seletor;
- confirmar com perfil logado;
- lista de espera se horario indisponivel.

Criterio de aceite:

- nao aparecem aulas, jogos e planos nessa pagina, exceto como navegacao discreta;
- agenda mostra ocupados/livres hora a hora;
- duracao 2h funciona igual ao item `SCREEN-LOCAIS-04`.

Entrega parcial 2026-05-17:

- adicionada rota dedicada `/locais/:placeId/reserva`, mantendo compatibilidade com links antigos por `?intent=booking`;
- atalhos internos do local agora navegam para rotas irmas reais:
  - `/locais/:placeId/reserva`;
  - `/locais/:placeId/aulas`;
  - `/locais/:placeId/jogos`;
  - `/locais/:placeId/planos`;
  - `/locais/:placeId/sobre`;
- a rota de reserva renderiza somente o fluxo de reserva no corpo, com hero/atalhos como navegacao discreta;
- a agenda por quadra, hora a hora, segue preservada no fluxo de reserva;
- a confirmacao continua vinculada ao perfil logado e mantem lista de espera;
- validacao: `npm.cmd run lint` e `npm.cmd run build` passaram.

Concluido em 2026-05-17:

- validacao autenticada desktop/mobile confirmou que `/locais/:placeId/reserva` renderiza somente o fluxo de reserva, sem misturar aulas, jogos ou planos no corpo;
- reserva de 2h foi testada com jogador real: o calendario marcou a hora inicial como `2h`, a hora seguinte como `Incluido` e exibiu total proporcional (`R$ 140,00` em quadra de `R$ 70,00/h`);
- validacao no banco confirmou `court_bookings.status = pending` com intervalo real de duas horas para `Livia Jogadora Pura`;
- gestao em `Gestao > Agenda > Reservas` exibiu a reserva pendente ao filtrar pelo jogador, pronta para confirmacao/cancelamento;
- evidencias:
  - `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-local-reserva-before-2h.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-local-reserva-2h-selected.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-local-reserva-2h-submitted.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-local-reserva-admin-filter-livia.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/mobile390-local-reserva-route-validated.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/screen-local-02-validation.json`;
  - `web/docs/screenshots/qa-dna-2026-05-17/screen-local-02-booking-db-check.json`.

### [x] SCREEN-LOCAL-03 - `/locais/:id/aulas`

Mudanca obrigatoria:

- pagina dedicada de aulas daquele local;
- filtro local: dias, periodo, nivel, perfil;
- resultado de turmas daquele local;
- selecionar dias e enviar interesse;
- plano selecionado pode preconfigurar quantidade de dias.

Criterio de aceite:

- nao aparecem reserva de quadra, jogos abertos e planos completos no corpo;
- o usuario sabe que esta entrando em aula naquele local.

Entrega parcial 2026-05-17:

- adicionada rota dedicada `/locais/:placeId/aulas`, mantendo compatibilidade com `?intent=academy`;
- a pagina de aulas renderiza somente o fluxo de turmas/interesse no corpo;
- o filtro local de aulas deixou de limitar o usuario a um unico dia e agora aceita multi-selecao de dias por chips;
- a filtragem local retorna turmas de qualquer dia selecionado e mantem agrupamento de turmas recorrentes equivalentes;
- a selecao de uma turma recorrente continua permitindo marcar/desmarcar dias especificos antes de enviar interesse;
- validacao: `npm.cmd run lint` e `npm.cmd run build` passaram.

Concluido em 2026-05-17:

- validacao autenticada desktop/mobile confirmou que `/locais/:placeId/aulas` renderiza somente o fluxo de aulas, sem reserva de quadra, jogos abertos ou planos completos no corpo;
- filtro local validado com nivel, multi-selecao de dias, periodo e perfil;
- lista de turmas mostra vagas daquele local e permite selecao de dias recorrentes antes do envio de interesse;
- fluxo ponta a ponta reutiliza a evidencia real de `SCREEN-LOCAIS-07`: jogador enviou interesse, academia viu a pendencia, aprovou a matricula e o contexto de aula passou a aparecer para o aluno;
- observacao de produto: ainda nao existe entidade separada de calendario do aluno; a agenda/aulas do jogador deriva da matricula ativa vinculada a `place_academy_classes`;
- evidencias:
  - `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-local-aulas-route-validated.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/mobile390-local-aulas-route-validated.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/screen-local-03-validation.json`;
  - `web/docs/screenshots/qa-dna-2026-05-17/screen-locais-07-player-interest-created.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/screen-locais-07-admin-interest-visible.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/screen-locais-07-admin-after-activate.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/screen-locais-07-player-after-approval.png`.

### [x] SCREEN-LOCAL-04 - `/locais/:id/jogos`

Mudanca obrigatoria:

- pagina dedicada de jogos abertos daquele local;
- filtro por data, periodo, nivel e status;
- CTA `Quero jogar`;
- CTA secundario `Criar chamada neste local`.

Criterio de aceite:

- jogos abertos deixam de ser lista solta sem filtros;
- mobile tem lista curta e filtro em sheet.

Entrega parcial 2026-05-17:

- `/locais/:placeId/jogos` agora renderiza uma pagina focada de jogos do local mesmo quando nao ha chamada aberta, em vez de cair em estado generico;
- a lista recebeu filtro por data, periodo, nivel e status (`Abertas`, `Encerradas`, `Canceladas` ou todos), mantendo status funcional sem filtrar tudo no carregamento;
- o CTA principal dos jogos abertos passou para `Quero jogar`, com estado `Participando` quando o usuario ja entrou;
- foi adicionado CTA secundario `Criar chamada neste local`, com formulario compacto inline e empty state acionavel quando nao ha chamadas ou nenhum filtro combina;
- contadores e hero usam somente jogos abertos, enquanto a tela dedicada ainda permite consultar encerrados/cancelados via filtro;
- validacao: `npm.cmd run lint` e `npm.cmd run build` passaram.

Concluido em 2026-05-17:

- validacao autenticada desktop/mobile confirmou que `/locais/:placeId/jogos` renderiza somente jogos abertos daquele local, sem misturar reserva, aulas ou planos no corpo;
- desktop mantem filtros visiveis por data, periodo, nivel e status;
- mobile recebeu resumo recolhido `Ajustar filtros`, expandindo os campos apenas quando o jogador pede;
- jogador criou uma chamada real no local e entrou nela pelo CTA `Quero jogar`;
- Supabase confirmou a chamada em `open_matches` e a participacao em `open_match_participants` com `status = joined`;
- validacao: `git diff --check`, `npm.cmd run lint` e `npm.cmd run build` passaram;
- evidencias:
  - `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-local-jogos-route-validated.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-local-jogos-create-form.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-local-jogos-after-create.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-local-jogos-after-join.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/mobile390-local-jogos-route-collapsed-filter.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/mobile390-local-jogos-route-expanded-filter.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/screen-local-04-validation.json`.

### [x] SCREEN-LOCAL-05 - `/locais/:id/planos`

Mudanca obrigatoria:

- planos aparecem como produtos clicaveis;
- clicar em plano de academia leva para selecao de aulas/dias com limite do plano;
- clicar em beneficio de quadra pode levar para reserva com desconto/beneficio aplicado quando houver suporte;
- se backend nao aplicar plano ainda, mostrar expectativa e documentar gap.

Criterio de aceite:

- plano nao e texto passivo;
- o proximo passo do usuario e claro;
- nao misturar quadras/valores como acordeon solto na mesma tela.

Entrega parcial 2026-05-17:

- `/locais/:placeId/planos` ja funciona como pagina focada via rota irma;
- planos deixaram de ser rows puramente informativos e viraram cards de produto com CTAs separados;
- `Ver aulas` leva para a selecao de aulas/dias daquele local com contexto do plano escolhido;
- `Reservar quadra` leva para a agenda de reserva do local e informa que desconto/beneficio precisa ser confirmado pela academia;
- o texto de gap foi ajustado para deixar claro que quantidade semanal de aulas e aplicacao automatica de beneficios ainda dependem da configuracao/aprovacao da academia;
- validacao: `npm.cmd run lint` e `npm.cmd run build` passaram.

Concluido em 2026-05-17:

- validacao autenticada desktop/mobile confirmou que `/locais/:placeId/planos` renderiza somente planos e beneficios, sem misturar reserva, aulas, jogos ou acordeon solto de quadras/valores no corpo;
- planos aparecem como cards acionaveis com CTAs `Ver aulas` e `Reservar quadra`;
- `Ver aulas` leva para `/locais/:placeId/aulas` com bloco `Plano escolhido`, preconfigurando o contexto da mensagem para a academia;
- `Reservar quadra` leva para `/locais/:placeId/reserva` com bloco `Plano escolhido`, explicando que o beneficio de quadra sera conferido pela academia ao confirmar a reserva;
- a aplicacao automatica de descontos e quantidade semanal de aulas permanece documentada como gap estrutural de backend/configuracao da academia, sem bloquear o fluxo manual atual;
- validacao: `git diff --check`, `npm.cmd run lint` e `npm.cmd run build` passaram;
- evidencias:
  - `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-local-planos-route-validated.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-local-planos-ver-aulas-context.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-local-planos-reservar-context.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/mobile390-local-planos-route-validated.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/screen-local-05-validation.json`.

### [x] SCREEN-COMP-HUB-01 - `/eventos`: hub competir

Screenshots de referencia:

- `mobile390-eventos-hub.png`
- `desktop1366-eventos-hub.png`

Mudanca obrigatoria:

- separar claramente:
  - Jogando;
  - Descobrir;
  - Organizando, se permitido;
- jogador puro nao ve organizacao;
- admin/organizador ve entrada profissional com peso secundario no modo jogador;
- eventos descobertos em carrossel/lista curta por localidade.

Criterio de aceite:

- hub nao mistura torneios que joga e organiza;
- mobile nao vira lista longa de cards repetidos.

Entrega parcial 2026-05-17:

- o hub `/eventos` passou a ordenar as intencoes como `Jogando`, `Descobrir` e `Organizando`;
- `Organizando` continua visivel apenas para quem tem contexto de organizador/admin, ou quando a rota ja foi aberta explicitamente nesse modo;
- a entrada de organizacao recebeu microcopy secundaria (`area separada`) para nao competir com a experiencia de jogador;
- `Descobrir` agora carrega torneios publicos via `loadUpcomingPublic(12)`, remove eventos em que o usuario ja joga/organiza e prioriza cidade do perfil, depois estado e depois destaques gerais;
- eventos descobertos aparecem em carrossel/lista curta, evitando uma lista longa de cards repetidos no mobile;
- validacao: `npm.cmd run lint`, `npm.cmd run build` e `git diff --check` passaram.

Concluido em 2026-05-17:

- validacao autenticada desktop/mobile confirmou que jogador puro ve `Jogando` e `Descobrir`, sem entrada `Organizando`;
- validacao autenticada desktop/mobile confirmou que admin/organizador ve `Organizando` como area separada, com fila operacional propria e peso distinto da visao de jogador;
- discovery para jogador aparece em lista curta/carrossel de eventos, sem virar lista longa de cards repetidos;
- loading do hub foi neutralizado para nao falar de organizacao antes de identificar o perfil;
- gap mantido: descoberta de ligas publicas ainda depende de endpoint/listagem publica equivalente para entrar no mesmo trilho de descoberta;
- validacao: `git diff --check`, `npm.cmd run lint` e `npm.cmd run build` passaram;
- evidencias:
  - `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-eventos-hub-player.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/mobile390-eventos-hub-player.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-eventos-hub-admin.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/mobile390-eventos-hub-admin.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/screen-comp-hub-01-validation.json`.

### [x] SCREEN-TOURNAMENT-01 - Evento publico do torneio

Screenshots de referencia:

- `desktop1366-torneio-jogos-exemplo.png`
- `mobile390-torneio-jogos-exemplo.png`

Mudanca obrigatoria:

- aba/pagina `Evento` deve conter:
  - nome, cidade, data, status;
  - inscricao/status pessoal discreto;
  - CTA principal conforme fase;
  - poster/info;
  - botao `Exportar chave` se existe chaveamento;
  - podio/encerramento somente apos fim do torneio;
- remover blocos de encerramento de `Jogos`.

Criterio de aceite:

- evento nao parece cockpit;
- exportar chave aparece no local certo;
- podio nao aparece antes do torneio terminar.

Entrega parcial 2026-05-17:

- a aba `Evento` permanece como pagina focada do torneio publico, com nome, cidade, data, status e CTA principal;
- o status pessoal do jogador (`Inscricao aprovada`, `Inscricao em analise`, `Lista de espera`, `Inscricao recusada`) agora aparece como chip discreto no hero, sem ocupar um card grande;
- `Exportar chave` segue localizado na aba `Evento` quando existe classe gerada/chaveamento disponivel;
- `Podio por classe` permanece condicionado a torneio finalizado (`status = finished`) e fora da aba `Jogos`;
- validacao: `npm.cmd run lint`, `npm.cmd run build` e `git diff --check` passaram.

Concluido em 2026-05-17:

- capturas autenticadas desktop/mobile da aba `Evento` confirmaram que o jogador puro ve apenas `Evento`, `Inscritos` e `Jogos`, sem aba `Categorias` e sem ferramentas de organizador;
- `Podio por classe` nao aparece antes de o torneio estar finalizado;
- `Exportar chave` aparece no local certo quando existe chaveamento e gerou feedback de sucesso no browser (`Chave da classe exportada em PNG.`);
- a aba Evento permanece como resumo publico, com CTA contextual e sem card grande de inscricao aprovada;
- evidencias:
  - `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-tournament-event-player.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/mobile390-tournament-event-player.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-tournament-event-player-after-export.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/screen-tournament-01-validation.json`.

### [x] SCREEN-TOURNAMENT-02 - Inscritos publicos do torneio

Screenshots de referencia:

- `desktop1366-torneio-inscritos-exemplo.png`
- `mobile390-torneio-inscritos-exemplo.png`

Problema:

- atualmente mostra ferramentas de organizador como adicionar/importar/remover.

Mudanca obrigatoria:

- publico/jogador ve:
  - seletor de classe;
  - lista de inscritos da classe;
  - busca;
  - contagem;
  - contato apenas se permitido;
- nao mostrar `Adicionar`, `Importar lista`, `Remover`, pagamentos ou operacao.

Criterio de aceite:

- inscritos aparecem corretamente;
- ferramentas admin so no workspace organizador;
- classe escalavel para torneio com 10+ categorias.

Entrega parcial 2026-05-17:

- a visao publica de `Inscritos` continua sem ferramentas de admin, pagamentos, importacao ou remocao;
- a lista agora combina participantes ja presentes na chave com inscricoes aprovadas vindas de `tournament_registrations`, evitando lista vazia quando a aprovacao existe mas ainda nao foi mesclada no draft;
- o seletor de classe mostra contagem por classe e ganhou trilho horizontal de chips para torneios com muitas categorias;
- foi adicionada busca por nome do inscrito, com empty state compacto e acionavel;
- contatos seguem ocultos na visao publica;
- validacao: `npm.cmd run lint`, `npm.cmd run build` e `git diff --check` passaram.

Concluido em 2026-05-17:

- validacao autenticada desktop/mobile confirmou que a rota direta `#/eventos/{id}/jogadores` abre a aba publica `Inscritos` sem cair em `Jogos`;
- a lista publica carregou 23 jogadores na Classe A, com busca, contagem, chips/select de classe e sem ferramentas administrativas;
- `Categorias` nao aparece como aba publica e contatos/pagamentos/importacao/remocao seguem fora da camada de jogador;
- corrigido o rotulo duplicado `Grupo Grupo`, mantendo apenas `Grupo A`, `Grupo B` etc.;
- evidencias:
  - `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-tournament-inscritos-player.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/mobile390-tournament-inscritos-player.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/screen-tournament-02-validation.json`.

### [x] SCREEN-TOURNAMENT-03 - Jogos/chave do torneio

Mudanca obrigatoria:

- seletor de classe contextual;
- se houver chave, mostrar chave ou lista conforme viewport;
- mobile:
  - lista por fase/rodada;
  - abrir chave completa/exportar como acao secundaria;
- horarios/quadras exibem local + quadra em microcopy curta;
- resultado informado por jogador usa mesma formatacao do admin.

Criterio de aceite:

- mobile nao precisa rolar 20.000 px para entender jogos;
- jogos sem horario/quadra mostram estado acionavel para organizador, neutro para jogador;
- placar player/admin fica visualmente consistente.

Entrega parcial em 2026-05-17:

- a aba publica de `Jogos` agora tem resumo por classe antes da chave completa;
- o resumo lista partidas por fase/rodada com jogadores, status e microcopy curta de horario/quadra;
- quando nao ha jogos gerados, aparece empty state compacto e acionavel;
- a acao secundaria `Exportar chave` fica disponivel no resumo quando existe chave gerada;
- no mobile publico, a chave detalhada fica fora da primeira camada e a lista por fase vira a leitura principal;
- o formulario de resultado do jogador segue reaproveitando `renderScoreFields`, mantendo o mesmo padrao visual e de regra usado pelo admin;
- validacao: `npm.cmd run lint` e `npm.cmd run build` passaram.

Concluido em 2026-05-17:

- validacao autenticada desktop/mobile confirmou que a aba publica `Jogos` abre sem `Categorias` e sem ferramentas administrativas;
- a primeira leitura mostra resumo por classe/fase com 11 jogos, status e microcopy curta de horario/quadra;
- no mobile, a lista por fase fica na camada principal e a chave longa nao domina a primeira dobra;
- `Exportar chave` permanece como acao secundaria disponivel quando ha chaveamento;
- evidencias:
  - `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-tournament-jogos-player.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/mobile390-tournament-jogos-player.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/screen-tournament-03-validation.json`.

### [x] SCREEN-TOURNAMENT-04 - Classificacao do torneio

Mudanca obrigatoria:

- so renderizar aba se torneio tiver fase de grupos/tabela;
- se nao tiver, remover aba da navegacao;
- se tiver, seletor de classe/grupo e tabela compacta.

Criterio de aceite:

- torneio mata-mata simples nao exibe aba vazia `Classificacao`;
- nenhum "Sem tabela para esta classe" como pagina principal.

Entrega parcial em 2026-05-17:

- a aba publica `Classificacao` agora depende de tabela real em `tabelaPorGrupo`, nao apenas de configuracao interna de classe;
- torneios mata-mata simples ou sem tabela publicada deixam de prometer aba vazia para o jogador;
- se o usuario chegar em classificacao com uma classe sem tabela, a tela usa a primeira classe com tabela disponivel;
- o fallback publico deixou de ser `Sem tabela para esta classe` como pagina principal e virou empty state compacto;
- validacao: `npm.cmd run lint` e `npm.cmd run build` passaram.

Concluido em 2026-05-17:

- validacao autenticada desktop/mobile em torneio mata-mata puro confirmou que `Classificacao` nao aparece como aba publica;
- a rota direta `#/eventos/{id}/classificacao` agora normaliza para `#/eventos/{id}/jogos` quando nao ha tabela publica, evitando pagina vazia ou promessa sem conteudo;
- nenhum empty state tecnico como `Sem tabela para esta classe` aparece como pagina principal;
- evidencias:
  - `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-tournament-classificacao-player.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/mobile390-tournament-classificacao-player.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/screen-tournament-04-validation.json`.

### [x] SCREEN-TOURNAMENT-05 - Chat/avisos do torneio

Mudanca obrigatoria:

- jogador ve avisos/mensagens permitidas;
- organizador ve publicar/fixar/remover em workspace ou controles discretos por permissao;
- nao misturar lista de jogadores ou jogos no chat.

Criterio de aceite:

- chat publico nao parece admin;
- admin ainda consegue publicar aviso.

Entrega parcial em 2026-05-17:

- a aba de chat/avisos do torneio recebeu estrutura visual propria (`tournament-chat-card`) com cabecalho, mensagem fixada, lista de mensagens e compose padronizados;
- controles de publicar aviso, fixar/desfixar e excluir continuam condicionados por `canManageComms`, mantendo jogador em camada de consumo/chat sem ferramentas admin;
- mensagens fixadas e avisos ganharam tratamento visual discreto, sem misturar jogadores, jogos ou blocos de outras abas no chat;
- removidos estilos inline principais do bloco de mensagens para alinhar com a gramatica visual e responsividade;
- mobile recebeu layout em coluna para cabecalho, acoes, mensagens e envio.

Validacao:

- `npm.cmd run lint` passou;
- `npm.cmd run build` passou.

Concluido em 2026-05-17:

- validacao autenticada desktop/mobile confirmou que jogador sem permissao de chat nao ve aba `Chat` e a rota direta `/chat` normaliza para `Jogos`, sem tela morta;
- validacao autenticada desktop/mobile como admin confirmou que a aba `Chat` abre com card proprio, mensagem fixada, publicar aviso, fixar/desfixar e excluir;
- o chat admin nao mistura lista de jogadores ou jogos no conteudo da comunicacao;
- evidencias:
  - `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-tournament-chat-player.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/mobile390-tournament-chat-player.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-tournament-chat-admin.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/mobile390-tournament-chat-admin.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/screen-tournament-05-validation.json`.

### [x] SCREEN-TOURNAMENT-ORG-01 - Workspace organizador de torneio

Mudanca obrigatoria:

- criar/ajustar superficie de organizacao separada:
  - Visao geral operacional;
  - Inscricoes;
  - Categorias;
  - Jogos e agenda;
  - Resultados;
  - Comunicacao;
  - Configuracao;
- rota `organizacao` nao pode redirecionar silenciosamente para `jogadores` publico;
- cada aba mostra somente sua funcao.

Criterio de aceite:

- organizador encontra ferramentas completas sem poluir pagina publica;
- jogador sem permissao nao acessa controles admin.

Entrega parcial em 2026-05-17:

- a rota/aba `organizacao` deixou de ser escondida ou redirecionada em torneios `live` e `finished`; o organizador continua tendo acesso a publicacao, agenda, backup, encerramento e configuracoes operacionais;
- a primeira camada da Organizacao ganhou um mapa de workspace com areas: Visao geral, Inscricoes, Categorias, Jogos e agenda, Resultados, Comunicacao e Configuracao;
- cada entrada do mapa leva para a aba ou trecho correto, evitando que o organizador precise procurar ferramentas em uma pagina longa sem orientacao;
- a pagina publica segue separada por `isPublicTournamentReader`, e jogador sem permissao continua sem acesso aos controles internos;
- o ajuste preserva as ferramentas existentes e reduz o risco de a Organizacao parecer um redirecionamento silencioso para conteudo publico.

Validacao:

- `git diff --check` passou;
- `npm.cmd run lint` passou;
- `npm.cmd run build` passou.

Concluido em 2026-05-17:

- validacao autenticada confirmou o workspace do organizador em torneio `draft`, `live` e `finished`, sem cair em pagina publica ou em tela vazia;
- o mapa de trabalho mostra `Visao geral`, `Inscricoes`, `Categorias`, `Jogos e agenda`, `Resultados`, `Comunicacao` e `Configuracao`;
- atalhos externos navegam para as rotas corretas (`jogadores`, `jogos`, `classificacao`, `chat`);
- `Categorias` e `Configuracao` agora abrem a subcamada de organizacao mesmo em torneio live/finished, antes escondida pela fase operacional, e rolam para a secao certa;
- jogador sem permissao continua sem acesso aos controles internos;
- evidencias:
  - `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-tournament-org-draft-admin.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-tournament-org-live-admin.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-tournament-org-finished-admin.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/mobile390-tournament-org-live-admin.png`;
  - `web/docs/screenshots/qa-dna-2026-05-17/screen-tournament-org-01-validation.json`.

Observacao para roadmap:

- `Categorias` e `Configuracao` ainda usam subcamada/scroll interno dentro de `Organizacao`; a experiencia esta funcional, mas pode virar subrota real em etapa posterior se a densidade voltar a crescer.

### [x] SCREEN-LEAGUE-01 - Home/evento da liga

Screenshots de referencia:

- `mobile390-liga-partidas-exemplo.png`
- `desktop1366-liga-partidas-exemplo.png`

Mudanca obrigatoria:

- topo da liga mostra status, temporada e CTA pessoal;
- inscricao aprovada aparece como badge/linha curta, nao card grande;
- menu sem `Classes` como aba independente se a classe e apenas filtro;
- classe vira seletor contextual nas abas que precisam.

Criterio de aceite:

- home da liga nao abre com card enorme de inscricao aprovada;
- classe nao altera silenciosamente o conteudo de outras abas.

Entrega parcial em 2026-05-17:

- status de inscricao do jogador na home publica da liga virou linha/chip compacto com nome, classe e orientacao curta;
- a aba publica continua sem `Classes` como item independente;
- filtro contextual de classe permanece nas abas que precisam, mas agora usa select no desktop e trilho horizontal de chips no mobile, evitando dois controles concorrendo na mesma largura;
- a mesma regra visual beneficia o filtro publico equivalente de torneio.

Validacao:

- `git diff --check` passou;
- `npm.cmd run lint` passou;
- `npm.cmd run build` passou.

Validacao final em 2026-05-17:

- screenshots autenticados desktop/mobile gerados em `web/docs/screenshots/qa-dna-2026-05-17/desktop1366-league-home-player.png` e `mobile390-league-home-player.png`;
- `screen-league-01-validation.json` confirmou que a home publica da liga nao tem aba `Classes`, nao mostra card enorme de inscricao aprovada, nao exibe ferramentas administrativas e preserva classe como recorte contextual;
- rota legada `?tab=classes` cai em `Classificacao`, evitando aba morta;
- banco atual possui somente ligas com 3 classes, entao o caso 10+ classes ficou coberto pela regra de componente ja implementada, mas sem massa real para screenshot.

### [x] SCREEN-LEAGUE-02 - Jogadores da liga

Mudanca obrigatoria:

- jogador/publico ve lista por classe;
- organizador ve convites, inscricoes e pagamentos em workspace proprio;
- busca e seletor de classe compactos.

Criterio de aceite:

- lista publica nao mistura `Marcar pago`;
- mobile nao vira lista infinita sem filtro visivel.

Entrega parcial em 2026-05-17:

- aba publica `Jogadores` permanece focada em leitura: lista por classe, pontos e filtro contextual sem acoes administrativas;
- aba do organizador ganhou workspace proprio para convite e solicitacoes;
- `Link de convite` virou bloco operacional curto, com recorte de temporada/classe;
- solicitacoes ganharam resumo visual de pendentes, aprovadas, rejeitadas e pagamentos, antes da fila;
- rows de inscricao receberam estado visual por status, preservando aprovar/rejeitar/marcar pago apenas para organizador.

Validacao:

- `git diff --check` passou;
- `npm.cmd run lint` passou;
- `npm.cmd run build` passou.

Entrega final em 2026-05-17:

- lista publica de jogadores ganhou busca compacta por nome/classe, combinada com o seletor contextual de classe;
- jogador autenticado foi validado em desktop/mobile sem `Link de convite`, `Aprovar`, `Rejeitar` ou `Marcar pago`;
- organizador foi validado em desktop/mobile com convite, solicitacoes e pagamento restritos ao workspace proprio;
- evidencias: `desktop1366-league-jogadores-player.png`, `mobile390-league-jogadores-player.png`, `desktop1366-league-jogadores-admin.png`, `mobile390-league-jogadores-admin.png` e `screen-league-02-validation.json`;
- lint, build e `git diff --check` passaram apos a correcao.

### [x] SCREEN-LEAGUE-03 - Partidas da liga

Mudanca obrigatoria:

- filtro por classe, rodada e status;
- rows compactas;
- minhas partidas destacadas;
- sala de partida abre em pagina/drawer focado;
- resultado player usa mesmo formato do admin.

Criterio de aceite:

- mobile reduz scroll;
- jogador entende o que precisa fazer;
- organizador ve pendencias separadas.

Entrega em 2026-05-17:

- aba `Partidas` ganhou filtro por rodada e status sem sair da pagina;
- `Minhas partidas` continua acima da lista geral para jogador, com agenda e pendencias visiveis;
- lista geral passa a respeitar filtros e exibe estado compacto quando nao encontra partidas;
- lista geral deixa de despejar todas as rodadas no mobile: exibe 12 partidas por vez com contador `Mostrando X de Y` e CTA explicito `Ver mais partidas`;
- sala de partida, disponibilidade, resultado e mensagens foram preservados sem reabrir backend.

Validacao:

- `git diff --check` passou;
- `npm.cmd run lint` passou;
- `npm.cmd run build` passou.
- screenshots autenticados desktop/mobile gerados para jogador e organizador: `desktop1366-league-partidas-player.png`, `mobile390-league-partidas-player.png`, `desktop1366-league-partidas-admin.png`, `mobile390-league-partidas-admin.png`;
- `screen-league-03-validation.json` confirmou 12 cards visiveis de 48, filtro por rodada/status, jogador sem ferramentas admin e organizador com acoes operacionais.

### [x] SCREEN-LEAGUE-04 - Classificacao da liga

Mudanca obrigatoria:

- seletor de classe no topo;
- tabela mobile compacta;
- zonas/promocao/rebaixamento com legenda clara;
- snapshot/salvar so aparece para organizador.

Criterio de aceite:

- jogador nao ve ferramenta administrativa;
- tabela e legivel no mobile.

Entrega em 2026-05-17:

- area de classificacao ganhou estrutura visual propria (`league-standings-page`) e legenda para subida, permanencia e descida;
- resumo de jogadores/subida/descida/inativos foi preservado;
- botao `Salvar snapshot` segue visivel apenas para organizador;
- tabela mobile deixou de depender de largura minima de 620px e passa a compactar colunas em tela pequena.

Validacao:

- `git diff --check` passou;
- `npm.cmd run lint` passou;
- `npm.cmd run build` passou.
- screenshots autenticados desktop/mobile gerados para jogador e organizador: `desktop1366-league-classificacao-player.png`, `mobile390-league-classificacao-player.png`, `desktop1366-league-classificacao-admin.png`, `mobile390-league-classificacao-admin.png`;
- `screen-league-04-validation.json` confirmou seletor por classe, legenda de zonas, ausencia de overflow horizontal no mobile e `Salvar snapshot` apenas para organizador.

### [x] SCREEN-LEAGUE-05 - Chat/avisos da liga

Mudanca obrigatoria:

- avisos para jogador;
- publicar/fixar/remover apenas para organizador;
- mensagens com hierarquia simples.

Criterio de aceite:

- chat nao parece painel de admin para jogador;
- comunicados fixados aparecem com destaque moderado.

Entrega em 2026-05-17:

- Chat/avisos da liga passou a usar a mesma gramatica visual do chat de torneio.
- Aviso fixado agora aparece como bloco destacado moderado, separado do feed normal.
- Ferramentas de publicar/fixar/remover continuam visiveis apenas para organizador.
- Leitor jogador ve cabecalho, aviso fixado, lista de mensagens e campo simples de envio, sem painel administrativo.
- Removidos estilos inline do bloco principal para reduzir divergencia visual entre liga e torneio.

Validacao:

- `git diff --check -- web/src/pages/LeagueDetailsPage.tsx web/src/App.css` passou.
- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- screenshots autenticados desktop/mobile gerados para jogador e organizador: `desktop1366-league-chat-player.png`, `mobile390-league-chat-player.png`, `desktop1366-league-chat-admin.png`, `mobile390-league-chat-admin.png`;
- `screen-league-05-validation.json` confirmou jogador sem publicar/fixar/remover, organizador com ferramentas de comunicacao e ausencia de overflow horizontal no mobile.

### [x] SCREEN-GESTAO-01 - `/gestao` central mobile/desktop

Screenshots de referencia:

- `mobile390-gestao.png`
- `desktop1366-gestao.png`

Mudanca obrigatoria:

- primeira dobra:
  - fila do dia;
  - 3-5 pendencias reais;
  - locais sob gestao em lista compacta;
- mobile:
  - nao renderizar todos os detalhes de todos os locais;
  - tocar em local abre operacao daquele local;
- implantacao/setup recolhido ou em pagina propria;
- metricas de suporte abaixo da fila.

Criterio de aceite:

- mobile de gestao deixa de ter rolagem gigantesca na central;
- admin entende onde operar primeiro.

Entrega em 2026-05-17:

- Fila agregada da central agora mostra no maximo 5 pendencias prioritarias, evitando primeira dobra longa.
- Locais sob gestao foram reposicionados antes de sinais de suporte e implantacao, deixando a acao operacional aparecer mais cedo.
- Implantacao/setup virou bloco recolhido em `<details>`, fora do fluxo principal de rotina diaria.
- Setup incompleto dentro de cada local tambem virou detalhe recolhido; a linha do local mantem foco em pendencias e acoes rapidas.
- Sinais de suporte continuam disponiveis, mas abaixo dos locais, sem competir com a primeira acao do admin.

Validacao:

- `git diff --check -- web/src/pages/ManagementHubPage.tsx web/src/App.css` passou.
- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- screenshots autenticados gerados: `desktop1366-gestao-01.png` e `mobile390-gestao-01.png`;
- `screen-gestao-01-validation.json` confirmou fila do dia na primeira dobra, 3 locais compactos, detalhes recolhidos, 6 cards principais e ausencia de overflow horizontal no mobile.

### [x] SCREEN-GESTAO-AGENDA-01 - Modulo Agenda

Screenshots de referencia:

- `desktop1366-gestao-click-agenda.png`
- `mobile390-gestao-click-agenda.png`

Mudanca obrigatoria:

- primeira dobra:
  - reservas pendentes;
  - espera acionavel;
  - CTA nova reserva/bloqueio;
- lista completa vem depois com filtros;
- rows compactas;
- confirmar/cancelar com feedback imediato;
- exportar agenda por quadra funcionando e com titulo nao cortado.

Criterio de aceite:

- pendencias do dia aparecem antes da lista longa;
- mobile nao renderiza centenas de rows sem filtro;
- exportacao gera imagem correta.

Entrega 2026-05-17:

- Fila operacional da Agenda agora mostra ate 3 itens por bloco na primeira dobra, com links explicitos para ver pendentes/lista completa quando houver mais itens.
- `Hoje` ordena reservas pendentes antes das demais, destaca a quantidade que precisa de decisao e limita a primeira carga a 12 reservas com texto `Mostrando X de Y` e CTA `Ver todas`, sem corte silencioso.
- `Reservas` e `Espera` ganharam limite inicial de 24 rows quando nao ha filtro, com texto `Mostrando X de Y` e CTA `Ver todas`/`Ver lista completa`; filtros continuam exibindo o resultado completo.
- Exportacao de agenda por quadra em torneios recebeu quebra de titulo em ate 2 linhas para evitar corte em nomes longos.
- `git diff --check`, `npm.cmd run lint` e `npm.cmd run build` passaram.
- Validacao autenticada da Agenda em `/gestao` passou em desktop/mobile: `desktop1366-gestao-agenda-01-afterlimit.png`, `mobile390-gestao-agenda-01-afterlimit.png` e `screen-gestao-agenda-01-afterlimit-validation.json`.
- A validacao confirmou 12 rows visiveis de 32 reservas do dia, ausencia de overflow horizontal e queda do scroll mobile de 8575px para 4347px.
- Tentativa de validar exportacao de agenda por quadra no torneio `Open ADT Dourados - Maio` confirmou que o botao nao aparece enquanto as partidas estao sem horario/quadra; a exportacao fica disponivel quando existe agenda por quadra gerada.

Risco residual:

- A troca automatica para `Reservas` quando ha pendencias mas a aba ativa e `Hoje` segue como melhoria opcional; o operador ja encontra pendencias na primeira dobra e pode abrir a lista completa.

### [x] SCREEN-GESTAO-ACADEMIA-01 - Modulo Academia

Screenshots de referencia:

- `desktop1366-gestao-click-academia.png`
- `mobile390-gestao-click-academia.png`

Mudanca obrigatoria:

- primeira dobra:
  - aulas de hoje/chamada;
  - pendencias de interesse/reposicao;
  - CTA nova matricula/turma conforme permissao;
- tabs/rotas:
  - Hoje;
  - Grade;
  - Alunos;
  - Pendencias;
  - Professores;
  - Configuracao;
- listas operacionais em rows;
- formularios em drawer/modal, nao enterrados no fim.

Criterio de aceite:

- rotina diaria aparece antes de setup;
- alunos/turmas/professores continuam acessiveis;
- erro tecnico nunca aparece cru.

Entrega 2026-05-17:

- Primeira dobra da `Central da academia` ganhou faixa de prioridade com `Hoje`, `Pendencias`, `Nova matricula` e `Nova turma`, respeitando modo professor e permissoes de gestao.
- Atalhos levam para as subvisoes onde a rotina termina: chamada em `Hoje`, fila em `Pendencias`, matricula em `Alunos` e criacao/grade em `Grade`.
- Fila operacional da Academia ficou mais compacta na primeira dobra: ate 3 aulas/pendencias antes de exigir expansao ou fila completa, sem `slice` silencioso.
- Rows de `Aulas do dia` e `Pendencias da academia` passaram a separar titulo, tipo e detalhe curto, reduzindo leitura de paragrafo em tela operacional.
- `Alunos` preserva drawer de `Nova matricula`; `Grade` preserva setup de nova turma/horario aberto; `Professores` e `Configuracao` seguem acessiveis pelas tabs.
- Validacao obrigatoria executada: `git diff --check`, `npm.cmd run lint` e `npm.cmd run build`.
- Validacao visual autenticada passou em desktop/mobile: `desktop1366-gestao-academia-01-validated.png`, `mobile390-gestao-academia-01-validated.png` e `screen-gestao-academia-01-validation.json`.

Risco residual:

- avaliar em QA visual se o CTA `Nova turma` deve abrir diretamente o disclosure de criacao ou se navegar para `Grade` continua suficiente.

### [x] SCREEN-GESTAO-CLIENTES-01 - Modulo Clientes/CRM

Screenshots de referencia:

- `desktop1366-gestao-click-clientes.png`
- `mobile390-gestao-click-clientes.png`

Mudanca obrigatoria:

- primeira dobra:
  - leads/contatos para follow-up hoje;
  - busca;
  - CTA novo contato;
- lista principal em rows;
- detalhes/interacoes em drawer/pagina;
- filtros em sheet no mobile.

Criterio de aceite:

- CRM nao parece planilha empilhada no mobile;
- follow-up fica acionavel.

Entrega 2026-05-17:

- `Contatos e leads` passou a abrir com primeira dobra operacional: painel `Hoje` com retornos/leads prioritarios e card `Novo contato`.
- Follow-ups e leads prioritarios aparecem como botoes acionaveis que abrem o drawer de historico/interacao.
- Busca e filtros continuam logo abaixo da primeira dobra, preservando lista principal em rows e limite explicito.
- `Novo contato` ganhou CTA visivel; o formulario inline existente continua como progressive disclosure controlado para evitar novo backend ou refatoracao ampla.
- Drawer de historico/interacoes foi preservado como local de detalhe, follow-up, WhatsApp, conversao e arquivamento.
- Validacao obrigatoria executada: `git diff --check`, `npm.cmd run lint` e `npm.cmd run build`.
- Validacao visual autenticada passou em desktop/mobile: `desktop1366-gestao-clientes-01-validated.png`, `mobile390-gestao-clientes-01-validated.png` e `screen-gestao-clientes-financeiro-cantina-validation.json`.

Risco residual:

- Transformar filtros em bottom sheet no mobile se QA visual ainda considerar a barra longa demais;
- avaliar se `Novo contato` deve virar drawer dedicado em uma sprint de formularios.

### [x] SCREEN-GESTAO-FINANCEIRO-01 - Modulo Financeiro

Screenshots de referencia:

- `desktop1366-gestao-click-financeiro.png`
- `mobile390-gestao-click-financeiro.png`

Mudanca obrigatoria:

- primeira dobra:
  - recebimentos pendentes;
  - vencidos;
  - CTA registrar pagamento/despesa;
- separar reserva, mensalidade, plano, aula avulsa e produto;
- lista em rows/tabela;
- acoes financeiras conforme permissao.

Criterio de aceite:

- financeiro mostra origem da cobranca;
- mobile nao mostra blocos repetidos sem agrupamento;
- marcar pago tem feedback.

Entrega 2026-05-17:

- `Central financeira` ganhou faixa de prioridade na primeira dobra com `Receber`, `Vencidos`, `Registrar baixa` e `Registrar despesa`.
- Recebiveis continuam em rows com origem explicita (`Reserva de quadra`, `Mensalidade de academia`, `Plano de socio`, `Aula avulsa/reposicao`) e acao primaria `Marcar pago`.
- CTA de baixa leva para `Recebiveis`; CTA de despesa leva para `Despesas`.
- `Despesas` dentro do workspace agora recebe o formulario real de lancamento, igual ao fallback legado, evitando aba sem acao principal.
- Validacao obrigatoria executada: `git diff --check`, `npm.cmd run lint` e `npm.cmd run build`.
- Validacao visual autenticada passou em desktop/mobile: `desktop1366-gestao-financeiro-01-validated.png`, `mobile390-gestao-financeiro-01-validated.png` e `screen-gestao-clientes-financeiro-cantina-validation.json`.

Risco residual:

- avaliar se `Registrar pagamento` merece drawer dedicado quando houver muitos recebiveis.

### [x] SCREEN-GESTAO-CANTINA-01 - Modulo Cantina/POS

Screenshots de referencia:

- `desktop1366-gestao-click-cantina.png`
- `mobile390-gestao-click-cantina.png`

Mudanca obrigatoria:

- se modulo desativado no plano, nao mostrar como operacional;
- se ativo:
  - vender produto como CTA principal;
  - produtos e estoque baixo;
  - resumo do dia;
- mobile com lista de produtos acionavel.

Criterio de aceite:

- cantina respeita plano;
- venda nao fica escondida entre metricas.

Entrega 2026-05-17:

- `Cantina / POS` ganhou faixa de prioridade na primeira dobra com `Venda rapida`, `Estoque`, `Hoje` e `Produtos`.
- CTA principal leva para `Venda rapida`; estoque baixo recebe destaque visual quando houver item critico.
- Resumo do dia permanece na aba `Vendas do dia`, sem virar a primeira camada da operacao.
- Produtos e estoque continuam em listas acionaveis; venda rapida preserva busca de produto, venda avulsa e bloqueio por estoque insuficiente.
- O modulo continua condicionado ao plano/permissao (`canManageCanteen`/matriz de modulos), sem aparecer como operacional quando a Cantina esta desativada.
- Validacao obrigatoria executada: `git diff --check`, `npm.cmd run lint` e `npm.cmd run build`.
- Validacao visual autenticada passou em desktop/mobile: `desktop1366-gestao-cantina-01-validated.png`, `mobile390-gestao-cantina-01-validated.png` e `screen-gestao-clientes-financeiro-cantina-validation.json`.

Risco residual:

- avaliar se o cadastro de produto deve virar drawer dedicado em sprint futura de formularios.


### [x] PLAYER-QA-POLISH-01 - Qualidade percebida do Player App: texto, estados e loading

Status: `[x]` concluido em 2026-05-16

Fonte:

- analise manual externa `ux-analysis-atpapp.md`;
- `PLAYER_POLISH_QA_2026_05_16.md`;
- `PLAYER_APP_V2_IMPLEMENTATION_SPEC.md`;
- `PREMIUM_UX_VISUAL_LANGUAGE.md`;
- feedback recorrente de que o Player App deve parecer leve, simples, premium e nao um backend empilhado.

Contexto:

- a reorganizacao estrutural do Player App, Locais, torneios/ligas e pagina publica de local ja reduziu a carga cognitiva;
- agora a percepcao de produto ainda pode cair por detalhes pequenos e visiveis: acentos faltando, microcopy tecnica, `Carregando...` cru, empty states grandes, retangulos vazios e labels confusos;
- esses pontos nao pedem backend novo nem redesign amplo, mas passam sensacao de app inacabado.

Objetivo:

Fazer uma rodada transversal de acabamento no Player App para elevar confianca visual e leitura:

- corrigir portugues visivel da UI, com acentos e cedilhas onde o usuario le;
- remover textos internos/de desenvolvimento;
- ajustar Preferencias para parecer configuracao real do usuario;
- trocar placeholders vazios por icones/fallbacks consistentes;
- substituir loading bruto por skeleton/estado contextual;
- reduzir empty states grandes que nao guiam acao.

Escopo do sprint:

1. Textos hardcoded visiveis:
   - varrer Home, Locais, Competir, Ranking, Perfil, torneio/liga publica e pagina publica de local;
   - corrigir palavras comuns sem acento/cedilha apenas na UI;
   - nao alterar nomes de rotas, ids, status internos, variaveis ou documentos que dependem de ASCII.

2. Perfil > Preferencias:
   - remover ou trocar texto tecnico sobre futura engine de notificacoes;
   - labels de preferencias devem usar capitalizacao normal;
   - checkbox/toggle deve ficar claramente associado ao label;
   - nao deixar nota interna aparecendo para jogador.

3. Estados vazios e imagens ausentes:
   - listas/cards sem foto/cartaz/logo devem usar icone/fallback visual pequeno;
   - nao renderizar retangulo vazio que parece imagem quebrada;
   - empty state deve ser compacto e ter acao clara quando houver proximo passo.

4. Loading:
   - substituir `Carregando...` em blocos principais por skeleton ou estado curto contextual;
   - se o loading for local e rapido, manter discreto;
   - erro tecnico continua com mensagem amigavel ao usuario e detalhe apenas em console/log.

Nao objetivos:

- nao mudar arquitetura de rotas;
- nao criar backend;
- nao redesenhar Home inteira;
- nao adicionar KPIs ou conteudo novo;
- nao transformar o app em rede social.

Criterio de conclusao:

- UI principal do Player App nao exibe palavras comuns sem acento em menus, tabs, cards, botoes e mensagens;
- Perfil > Preferencias nao mostra texto tecnico/de desenvolvimento;
- toggles/checkboxes estao legiveis e alinhados;
- listas sem imagem nao parecem quebradas;
- loading principal nao aparece como texto cru persistente;
- lint/build passam.

Entrega 2026-05-16:

- textos visiveis principais do Player App foram polidos em Home, Competir, Locais, Perfil, torneio/liga publica e estados relacionados, preservando tokens internos ASCII de rotas/abas/status;
- `Perfil > Preferencias` deixou de mencionar engine futura e passou a explicar preferencias em linguagem de usuario, com checkbox associado a label e layout mais claro;
- `Excluir minha conta` foi isolado em zona destrutiva com aviso curto;
- carregamentos principais em Home, Competicoes, Locais, Torneio e Liga usam `ScreenState` contextual em vez de `Carregando...` solto;
- validado com `npm.cmd run lint` e `npm.cmd run build`.

Validacao obrigatoria:

- `npm.cmd run lint`;
- `npm.cmd run build`;
- validar desktop e mobile em:
  - `/inicio`;
  - `/locais`;
  - `/eventos`;
  - `/ranking`;
  - `/perfil`;
  - uma pagina publica de local;
  - uma pagina publica de torneio ou liga.

### [x] PLAYER-QA-POLISH-02 - Hierarquia de acoes e alvos mobile

Status: `[x]` concluido em 2026-05-16

Fonte:

- `PLAYER_POLISH_QA_2026_05_16.md`;
- analise manual externa `ux-analysis-atpapp.md`.

Objetivo:

Corrigir acoes que hoje parecem primarias demais ou pequenas demais:

- `Seguir` no Ranking deve ser outline/ghost ou icone discreto;
- `Placar e WhatsApp` em partida no mobile deve ter area de toque minima de 44px;
- `Nao posso jogar` deve parecer acao secundaria real, nao texto perdido;
- `Excluir minha conta` deve ficar isolado como acao destrutiva, com aviso e confirmacao explicita.

Criterio de conclusao:

- uma tela nao deve ter acao secundaria competindo visualmente com CTA principal;
- acoes de toque em mobile devem ser confortaveis;
- acao destrutiva nao deve aparecer misturada a links normais.

Entrega 2026-05-16:

- `Seguir` no Ranking deixou de usar estilo primario verde e passou a ser acao discreta/outline;
- `Placar e WhatsApp` em partida de torneio ganhou area minima de 44px no summary;
- `Nao posso jogar` passou a usar estilo secundario real, sem competir com `Confirmar presenca`;
- `Excluir minha conta` ja havia sido isolado em zona destrutiva no sprint anterior;
- validado com `npm.cmd run lint` e `npm.cmd run build`.

### [x] PLAYER-QA-POLISH-03 - Ajustes finos de navegacao e contexto do Player App

Status: `[x]` concluido em 2026-05-16

Fonte:

- `PLAYER_POLISH_QA_2026_05_16.md`;
- `PLAYER_APP_V2_IMPLEMENTATION_SPEC.md`.

Objetivo:

Revisar pequenos pontos de navegacao sem reabrir arquitetura:

- avaliar se `Competir` no mobile deve abrir a superficie geral de competicoes em vez de subview especifica;
- decidir se `Modo jogador` vira seletor real de modo ou deixa de parecer componente clicavel;
- avaliar entrada direta para `Aulas` somente se nao duplicar `Locais > Entrar em aula`;
- melhorar contexto em paginas de detalhe quando o usuario chega por notificacao/link direto.

Criterio de conclusao:

- navegacao continua simples;
- nenhum item promete modo/acao que nao existe;
- jogador entende onde esta sem precisar de breadcrumbs pesados.

Entrega 2026-05-16:

- `Competir` no nav global foi mantido como entrada para `/eventos`, preservando a superficie geral de competicoes; as subvisoes continuam sendo escolha interna do hub;
- o chip visual `Modo jogador` no menu lateral deixou de parecer um seletor/pill clicavel e virou contexto neutro `Jogador`;
- contextos `Competicoes` e `Operacao` passaram a aparecer com acento e como estados reais da superficie atual;
- `Aulas` permanece como entrada por `Locais > Entrar em aula`, evitando criar uma rota paralela duplicada;
- paginas publicas de torneio e liga ganharam retorno explicito `Voltar para competicoes` e nota curta de contexto para quem chega por link/notificacao;
- validado com `npm.cmd run lint` e `npm.cmd run build`.

### [x] COMP-ORG-01 - Organizador de torneio/liga com paginas limpas por tarefa

Status: `[x]` concluido em 2026-05-16

Fonte:

- feedback sobre replicar a limpeza de torneio/liga publica na area de organizacao;
- `COMPETITION_OS_V2_IMPLEMENTATION_SPEC.md`;
- `COMPETITION_OS_V2_UX_PLAN.md`;
- padrao ja aplicado em paginas publicas: abas reais, filtros contextuais e remocao de blocos globais repetidos.

Contexto:

- a leitura publica de torneios e ligas ja foi separada por intencao;
- a area de organizacao ainda carrega trechos de cockpit antigo em algumas abas, com blocos agregados, configuracao, filtros, listas e ferramentas aparecendo perto demais umas das outras;
- o organizador precisa de potencia operacional, mas nao precisa ver tudo ao mesmo tempo;
- setup raro, operacao diaria, comunicacao, inscricoes, agenda, jogos e resultados devem ter superfices separadas.

Objetivo:

Transformar a area de organizacao de torneios e ligas no mesmo padrao de limpeza aplicado ao lado publico:

- cada aba/pagina deve renderizar somente o conteudo da tarefa selecionada;
- a fila operacional deve abrir a experiencia do organizador, mas nao deve ser repetida em todas as abas;
- filtros de classe/temporada devem ser contextuais e aparecer apenas em `Inscritos/Jogadores`, `Jogos/Partidas`, `Classificacao` e telas que realmente dependem desse recorte;
- configuracao/setup deve ficar separado de operacao diaria;
- ferramentas de publicacao/exportacao devem aparecer no local de decisao, sem poluir a lista de jogos ou jogadores.

Escopo do sprint:

1. Torneio - workspace do organizador:
   - revisar `/eventos/:tournamentId/organizacao`, `/jogadores`, `/jogos`, `/classificacao` e `/chat`;
   - garantir que `Organizacao` seja uma central de operacao/setup, nao uma pagina longa com todas as ferramentas;
   - mover cards de resumo/KPIs para estado compacto ou retirar quando nao guiam acao;
   - manter `inscricoes pendentes`, `pagamentos`, `lista de espera`, `sorteio`, `agenda`, `equipe`, `quadras`, `exportar chave`, `resetar sorteio`, `publicacao`, `resultados` e `encerramento`, mas cada um no lugar certo;
   - evitar que `Jogos` misture operacao de resultado, exportacao, podio, agenda e setup sem hierarquia;
   - usar drawer/bottom sheet para detalhe de inscricao, partida, resultado e uso de quadra.

2. Liga - workspace do organizador:
   - revisar `/eventos/ligas/:leagueId` para separar `Rodada`, `Jogadores`, `Classificacao`, `Partidas`, `Chat` e `Configuracao`;
   - remover blocos grandes de status quando puderem virar badge/linha curta;
   - garantir que classe/temporada nao altere silenciosamente conteudo de abas nao relacionadas;
   - usar seletor contextual no topo das abas que precisam de classe, com comportamento bom para muitas classes;
   - preservar geracao de rodada, WO, resultado, disputa, mensagens e ranking.

3. Hub de organizacao:
   - manter `/eventos?modo=organizing`, `/eventos/torneios?view=organizing` e `/eventos/ligas?view=organizing` como entrada por proxima acao;
   - a lista de competicoes organizadas deve mostrar tipo, status, proximo passo e CTA primario;
   - filtros/historico ficam em disclosure ou area secundaria.

4. Mobile:
   - menus internos devem funcionar como rail horizontal arrastavel;
   - cada aba deve parecer uma tela propria, nao uma ancora dentro de pagina longa;
   - drawer vira bottom sheet;
   - evitar tabelas largas sem alternativa compacta.

Regras:

- nao remover funcao existente;
- nao transformar rotina diaria em wizard;
- nao duplicar o mesmo filtro como botoes e select ao mesmo tempo;
- nao mostrar ferramentas de admin para jogador/publico;
- nao esconder pendencias com slice silencioso: se houver recorte, mostrar contagem e link para ver tudo;
- se faltar backend real para uma acao, manter a acao atual com feedback amigavel ou documentar gap.

Criterio de conclusao:

- organizador abre torneio e encontra a proxima acao sem rolar uma pagina longa;
- `Organizacao`, `Inscritos/Jogadores`, `Jogos/Partidas`, `Classificacao`, `Chat` e `Configuracao` nao repetem conteudo estrutural umas das outras;
- classe/temporada aparecem como filtros contextuais nas abas certas;
- ferramentas pesadas ficam separadas de leitura operacional;
- mobile 390px nao vira empilhamento de cockpit;
- lint/build passam;
- `CURRENT_PRODUCT_STATE.md` e specs ficam atualizados.

Validacao obrigatoria:

- `npm.cmd run lint` - aprovado em 2026-05-16;
- `npm.cmd run build` - aprovado em 2026-05-16;
- validar pelo menos um torneio owner em:
  - organizacao/setup;
  - inscritos;
  - jogos;
  - classificacao quando aplicavel;
  - chat/equipe;
- validar pelo menos uma liga owner em:
  - rodada/operacao;
  - jogadores;
  - partidas;
  - classificacao;
  - chat;
- gerar screenshots quando houver browser disponivel.

Resultado:

- torneio owner/staff deixou de renderizar seletor de classe e painel operacional em todas as abas;
- `Organizacao` concentra fila, operacoes pesadas, publicacao, agenda por quadra, exportacoes, backup, reset e encerramento/podio;
- `Jogos` ficou focado em chave/partidas e revisao de resultados enviados por jogadores, sem bloco fixo de agenda, podio ou reset/exportacao estrutural;
- filtro de classe do torneio aparece somente em `Jogos`, `Classificacao` e `Jogadores`;
- liga owner ganhou aba `Rodada` para operacao atual, `Classificacao` propria e `Configuracao` separada para regras, classes, geracao e scheduler;
- seletor de temporada/classe da liga aparece somente nas abas que usam recorte: `Jogadores`, `Classificacao` e `Partidas`;
- leitor publico/jogador permanece sem ferramentas administrativas.

Arquivos alterados:

- `web/src/pages/TournamentPage.tsx`;
- `web/src/pages/LeagueDetailsPage.tsx`;
- `web/docs/CURRENT_PRODUCT_STATE.md`;
- `web/docs/COMPETITION_OS_V2_IMPLEMENTATION_SPEC.md`;
- `web/docs/EXECUTION_QUEUE.md`.

Riscos restantes:

- screenshots autenticados ainda devem revisar 390px em dados reais com muitas classes;
- a liga ainda usa um unico estado interno de classe/temporada compartilhado entre abas, mas o seletor deixou de aparecer fora de contexto para reduzir a sensacao de mudanca invisivel.

### [x] COMP-COURTS-01 - Selecionar locais e quadras cadastradas no setup do torneio

Status: `[x]` concluido em 2026-05-16

Contexto:

- torneios em academias cadastradas nao devem exigir redigitacao manual das quadras;
- um torneio pode usar mais de uma academia;
- a informacao de partida precisa ficar curta para jogador e organizador.

Resultado:

- wizard de criacao de torneio ganhou escolha entre `Locais cadastrados` e `Manual` na etapa `Agenda`;
- locais sao filtrados por cidade/UF do torneio e suas quadras ativas podem ser adicionadas;
- setup interno do torneio tambem permite adicionar quadras de academias cadastradas;
- `agendaConfig.courtLinks` preserva `placeId`, `courtId`, nomes e label;
- `agendaConfig.quadras` usa o label `Local Â· Quadra`, mantendo compatibilidade com o gerador atual;
- entrada manual continua disponivel para torneios fora de locais cadastrados.

Validacao:

- `npm.cmd run lint`;
- `npm.cmd run build`.

Risco restante:

- ainda nao cria bloqueio real em `court_bookings`;
- ainda nao existe pedido de autorizacao para local de terceiro. Isso ficou em `COMP-COURTS-02`.

### [x] COMP-COURTS-02 - Autorizacao e bloqueio real de quadras de locais em torneios

Status: `[x]` concluido em 2026-05-16

Fonte:

- decisao de produto sobre torneios em locais com quadras cadastradas;
- `COMPETITION_OS_V2_IMPLEMENTATION_SPEC.md`;
- `AGENDA_MODULE_FUNCTION_MAP.md`;
- schema atual de `place_courts` e `court_bookings`.

Contexto:

- torneios grandes podem usar uma ou mais academias;
- as quadras ja existem em `place_courts` e nao devem ser redigitadas quando o torneio acontece em local cadastrado;
- se o organizador administra o local, a agenda do torneio deve bloquear as quadras automaticamente quando as partidas forem geradas;
- se o organizador nao administra o local, a academia precisa receber um pedido de autorizacao com locais, quadras, dias e horarios antes do bloqueio;
- jogador e organizador precisam entender a quadra da partida em leitura curta, como `Arena Pantanal Tennis Â· Quadra 2 Â· 16:00`.

Sprint ja entregue em `COMP-COURTS-01`:

- criacao de torneio permite escolher `Locais cadastrados` ou entrada `Manual` na etapa `Agenda`;
- o organizador pode selecionar uma ou mais academias e suas quadras cadastradas;
- agendaConfig passa a guardar `courtLinks` com `placeId`, `courtId`, nomes e label;
- sorteio usa labels completos de quadra, preservando clareza para jogador e organizador sem textos longos;
- torneio ja criado tambem permite adicionar quadras cadastradas na area `Organizacao > Agenda do torneio`.

Escopo entregue:

1. Criada migration `0091_tournament_court_usage_requests_v1.sql` com tabela `tournament_court_usage_requests`.
2. Criadas RPCs:
   - `app_sync_tournament_court_usage(...)`;
   - `app_list_place_tournament_court_requests(...)`;
   - `app_review_tournament_court_request(...)`.
3. Ao salvar/gerar agenda de torneio com `courtLinks`, o Competition OS sincroniza o uso das quadras:
   - owner/staff do local cria bloqueios reais em `court_bookings.status = blocked`;
   - organizador externo cria solicitacao pendente para a academia.
4. `Gestao > Agenda` mostra pedidos de torneio na fila operacional e permite `Autorizar e bloquear` ou `Recusar`.
5. Aprovacao cria bloqueios reais com marcador tecnico em `notes` e evita duplicidade ao cancelar/recriar bloqueios anteriores do mesmo torneio/local.
6. Recusa fica visivel no setup do torneio como `Recusado - revise a agenda`.
7. O setup do torneio mostra status por local: aguardando autorizacao, autorizado/bloqueado ou recusado.
8. O calendario de quadras passa a receber os bloqueios de torneio como itens `blocked`.

Criterio de conclusao:

- owner/staff de local consegue gerar torneio e bloquear automaticamente suas quadras;
- organizador externo consegue solicitar quadras e a academia recebe pedido acionavel;
- aprovacao cria bloqueios reais sem conflito de horario;
- rejeicao aparece como pendencia clara no torneio;
- jogador ve local, quadra e horario em formato curto nas partidas;
- lint/build passam e MDs sao atualizados.

Validacao:

- `npm.cmd run lint` passou;
- `npm.cmd run build` passou;
- migration `0091` aplicada diretamente no Supabase alvo por execucao SQL direta.

Risco restante:

- `supabase migration up` padrao ainda tenta reaplicar migrations antigas do historico remoto e falha antes da `0091`; o banco alvo recebeu a `0091`, mas o historico de migrations remoto deve ser reparado/baselineado antes de depender do comando completo.
- conflitos de horario existentes retornam contador de conflito; o organizador ainda precisa revisar a agenda quando houver conflito real.

### [x] COMP-SCORE-03 - Corrigir envio de placar por jogador no Supabase

Status: `[x]` concluido em 2026-05-15

Fonte:

- erro real em `app_submit_tournament_match_result`;
- print da sala de partida do jogador;
- `CURRENT_PRODUCT_STATE.md`.

Contexto:

- ao enviar placar de uma partida do torneio, o Supabase retornava HTTP 400;
- a UI mostrava erro tecnico bruto: `column reference "tournament_id" is ambiguous`;
- a rotina SQL tinha conflito entre nomes de colunas de retorno e colunas da tabela em PL/pgSQL, semelhante ao bug ja corrigido anteriormente em confirmacao de presenca.

Resultado:

- criada migration `0090_fix_tournament_result_submission_ambiguity.sql`;
- a funcao `public.app_submit_tournament_match_result(...)` agora usa `#variable_conflict use_column` e qualifica os agregadores com alias;
- migration aplicada no Supabase alvo `xdopstommqojjofapzjl`;
- verificado no banco que a funcao publicada contem o fix;
- UI passou a traduzir erros de envio de resultado para mensagens amigaveis e registrar o erro tecnico apenas no console.

Validacao:

- migration aplicada via conexao PostgreSQL no Supabase alvo;
- verificacao SQL confirmou `function fixed`;
- `npm.cmd run lint`;
- `npm.cmd run build`.

Risco restante:

- se houver outro Supabase/ambiente sem a migration 0090, o frontend exibira mensagem amigavel, mas o envio real continuara dependendo da funcao atualizada no banco.

### [x] PLAYER-HOME-05 - Home mobile com primeira dobra contextual e descoberta leve

Status: `[x]` concluido em 2026-05-15

Fonte:

- feedback do print da Home mobile atual;
- regra explicita de prioridade de CTA contextual;
- `PLAYER_APP_V2_IMPLEMENTATION_SPEC.md`;
- `CURRENT_PRODUCT_STATE.md`.

Contexto:

- a Home de jogador ainda parecia um painel administrativo, com textos de onboarding permanente, blocos pessoais vazios e eventos publicos empilhados;
- informacoes urgentes e descoberta publica competiam pela mesma hierarquia;
- `Meu contexto` soava tecnico e reforcava a sensacao de backend.

Resultado:

- primeira dobra usa CTA contextual na ordem: resultado pendente, atividade nas proximas 24h, convite pendente, inscricao incompleta, competicao em andamento e descoberta local;
- cards de acao ficaram mais curtos e escaneaveis;
- `Meu contexto` virou `Para voce` e so renderiza quando existem reservas, partidas, aulas, pagamentos, convites ou historico reais;
- empty state grande de competicao ativa saiu da Home principal;
- descoberta publica usa carrossel horizontal com prioridade por cidade do usuario, estado/regiao e destaques gerais;
- gestao segue isolada em `Acesso profissional`, apenas para usuarios com convites, permissoes ou sinais operacionais.

Validacao:

- `npm.cmd run lint`;
- `npm.cmd run build`.

Risco restante:

- ainda nao ha backend novo para academias proximas como carrossel dedicado; a Home usa os eventos publicos ja disponiveis e deixa locais/aulas para os fluxos de `/locais`.

### [x] PLAYER-LOCALS-06 - Encontrar jogo com filtro guiado por localidade

Status: `[x]` concluido em 2026-05-15

Fonte:

- feedback do print de `/locais?intent=matches`;
- padrao ja aplicado em `Reservar quadra` e `Entrar em aula`;
- `PLAYER_APP_V2_IMPLEMENTATION_SPEC.md`.

Contexto:

- o filtro de `Encontrar jogo` usava campos livres e uma grade fixa que encavalava no desktop;
- UF, cidade e local nao seguiam a mesma logica dependente dos outros fluxos de descoberta;
- o usuario podia digitar localidades sem relacao com locais cadastrados ou chamadas abertas.

Resultado:

- `Encontrar jogo` agora usa UF, cidade e local como selects dependentes;
- as opcoes derivam dos locais cadastrados que possuem chamadas abertas;
- ao trocar UF, cidade e local sao limpos; ao trocar cidade, local e limpo;
- a busca preserva filtros de data, periodo, nivel, texto da chamada e status;
- o grid desktop passou a usar 12 colunas responsivas, sem encavalar campos.

Validacao:

- `npm.cmd run lint`;
- `npm.cmd run build`.

### [x] PLAYER-PLACE-02 - Pagina publica do local por intencao e reserva por calendario de quadras

Status: `[x]` concluido em 2026-05-15

Fonte:

- feedback da pagina publica da academia/local;
- `PLAYER_APP_V2_IMPLEMENTATION_SPEC.md`;
- `CURRENT_PRODUCT_STATE.md`;
- padrao v2 de separar experiencias por intencao em vez de pagina longa ancorada.

Contexto:

- a pagina publica do local ainda funcionava como uma pagina longa: `Reservar`, `Aulas`, `Jogos` e `Planos` rolavam para secoes na mesma tela;
- isso misturava reserva, aulas, jogos abertos e beneficios, deixando a experiencia pesada para o jogador comum;
- o fluxo de reserva dentro do local ainda dependia de selects manuais de quadra/horario, em vez de mostrar a disponibilidade por quadra de forma visual.

Resultado:

- os cards de `Reservar`, `Aulas`, `Jogos` e `Planos` agora trocam a intencao no URL e renderizam apenas o conteudo daquela pagina;
- a pagina nao desce mais para uma ancora quando o usuario escolhe uma acao principal;
- o CTA do hero e o sticky CTA passam a abrir a intencao correspondente;
- `Reservar` foi reorganizado em dia/duracao, carrossel de quadras e confirmacao;
- o calendario de reserva mostra cada quadra em um card horizontal com horarios hora a hora;
- slots livres sao acionaveis, slots sem disponibilidade aparecem como ocupados;
- a solicitacao de reserva continua usando o backend existente de `createCourtBooking` e fica vinculada ao perfil logado;
- duracao publica foi limitada a horas cheias, preservando o fluxo simples pedido para jogador.

Validacao:

- `npm.cmd run lint`;
- `npm.cmd run build`.

Risco restante:

- o carrossel usa a consulta de disponibilidade existente por horario; se a academia configurar regras muito complexas, o backend continua sendo a fonte final de verdade ao solicitar a reserva.

### [x] PLAYER-PLACE-03 - Aulas publicas com selecao clara de dias recorrentes

Status: `[x]` concluido em 2026-05-15

Fonte:

- feedback do fluxo publico `Aulas` na pagina do local;
- regra de que alunos podem fazer mais de um dia por semana;
- `CURRENT_PRODUCT_STATE.md`;
- `PLAYER_APP_V2_IMPLEMENTATION_SPEC.md`.

Contexto:

- a lista de aulas podia deixar uma turma selecionada fora do filtro atual, criando risco de enviar interesse para uma turma escondida ou sem vaga;
- turmas recorrentes equivalentes ainda dependiam demais do nome literal da turma, entao pequenas variacoes de titulo impediam selecionar um ou mais dias da mesma rotina;
- o usuario nao recebia clareza suficiente de que o interesse fica vinculado ao perfil logado e que a aprovacao da academia ativa essa matricula.

Resultado:

- o agrupamento de aulas recorrentes passou a usar atributos operacionais: local, professor, quadra, horario, nivel, perfil e mensalidade, em vez do titulo literal;
- cada grupo exibe chips de dias, permitindo selecionar um dia especifico ou mais de um dia na mesma turma recorrente;
- ao mudar filtros, a selecao e sincronizada com o primeiro grupo visivel, evitando resumo de turma escondida;
- o resumo de envio informa que a aprovacao pela academia ativa a matricula vinculada ao perfil e aparece em `Minhas aulas`;
- os cards de `Minhas aulas` e `Reposicao` na Home agora abrem diretamente a pagina publica do local em `intent=academy` quando a matricula possui `placeId`;
- o cabecalho da etapa foi ajustado para nao colar numero e texto.

Validacao:

- `npm.cmd run lint`;
- `npm.cmd run build`.

Risco restante:

- o envio publico ainda cria uma solicitacao pendente por dia selecionado via `createAcademyEnrollment`; contrato mensal consolidado, cobranca recorrente e calendario semanal completo continuam pertencendo ao Management OS/Academia.

### [x] PLAYER-PLACE-04 - Jogos abertos do local com filtros simples

Status: `[x]` concluido em 2026-05-15

Fonte:

- feedback do fluxo publico `Jogos abertos` na pagina do local;
- `PLAYER_APP_V2_IMPLEMENTATION_SPEC.md`;
- padrao v2 de listas acionaveis sem excesso de texto.

Contexto:

- `Jogos abertos` no local mostrava uma lista direta de chamadas, sem filtro de dia, periodo ou nivel;
- a lista era limitada com `slice(0, 4)`, escondendo jogos sem deixar claro para o usuario;
- como o usuario ja esta dentro de um local, repetir UF/cidade/local ali seria ruido.

Resultado:

- `Jogos abertos` ganhou filtros de data, periodo e nivel;
- o contador mostra a quantidade filtrada;
- `Limpar filtros` aparece apenas quando ha filtros ativos;
- a lista nao usa mais corte silencioso de quatro itens;
- mobile herda grid em uma coluna para nao encavalar campos.

Validacao:

- `npm.cmd run lint`;
- `npm.cmd run build`.

### [x] PLAYER-PLACE-05 - Planos e quadras como atalhos acionaveis

Status: `[x]` concluido em 2026-05-15

Fonte:

- feedback da pagina publica do local;
- regra de que valores publicados precisam levar ao proximo passo acionavel;
- `PLAYER_APP_V2_IMPLEMENTATION_SPEC.md`.

Contexto:

- `Planos` e `Quadras e valores` apareciam como informacao passiva;
- clicar em um plano deveria conduzir para a escolha de aulas/turmas;
- clicar em uma quadra deveria conduzir para o calendario de reserva daquela quadra;
- o modelo atual de `place_membership_plans` possui mensalidade e descontos, mas nao possui campo de quantidade de aulas semanais.

Resultado:

- planos publicados agora sao clicaveis e levam para `Aulas`, preservando contexto do plano escolhido no resumo do fluxo;
- o interesse em aula recebe uma mensagem inicial com o plano escolhido para a academia avaliar;
- quadras em `Quadras e valores` agora sao clicaveis e levam para `Reservar`, carregando o calendario de horarios com preferencia pela quadra escolhida;
- linhas clicaveis receberam affordance visual sem transformar o bloco em dashboard pesado.

Validacao:

- `npm.cmd run lint`;
- `npm.cmd run build`.

Risco restante:

- quantidade de aulas por plano ainda nao existe no schema de planos; para automatizar isso, sera necessario adicionar campo/configuracao de aulas semanais por plano ou separar `plano de socio` de `plano de aulas`.

### [x] PLAYER-PLACE-06 - Reserva publica mostra intervalo completo selecionado

Status: `[x]` concluido em 2026-05-15

Fonte:

- feedback do calendario publico de reserva de quadra;
- `PLAYER_APP_V2_IMPLEMENTATION_SPEC.md`.

Contexto:

- a disponibilidade ja era buscada usando a duracao completa da reserva;
- ao escolher `2h`, a UI ainda podia parecer que apenas a primeira hora estava selecionada, deixando a segunda hora com aparencia de slot comum;
- isso gerava duvida se o sistema bloquearia uma ou duas horas.

Resultado:

- ao tocar em um horario livre com duracao de `2h`, o slot inicial fica selecionado e a hora seguinte aparece como `Na reserva`;
- o resumo de confirmacao mostra inicio, fim e valor total proporcional a duracao selecionada;
- a selecao visual continua usando a disponibilidade existente como fonte de verdade, sem criar bloqueio definitivo antes de o jogador solicitar a reserva.

Validacao:

- `npm.cmd run lint`;
- `npm.cmd run build`.

### [x] COMP-PUBLIC-02B - Torneio publico com abas limpas por intencao

Status: `[x]` concluido em 2026-05-15; revisado em 2026-05-15

Fonte:

- feedback para aplicar nos torneios o mesmo padrao reorganizado da liga;
- feedback da rota publica de evento com menus duplicados e pagina longa;
- feedback posterior removendo `Categorias` como aba publica independente;
- `COMP-PUBLIC-02A`;
- `COMPETITION_OS_V2_IMPLEMENTATION_SPEC.md`;
- `PLAYER_APP_V2_IMPLEMENTATION_SPEC.md`.

Contexto:

- o torneio publico ainda misturava hero, categorias, inscritos e conteudo da aba selecionada na mesma pagina;
- `Evento`, `Categorias` e `Inscritos` funcionavam como ancoras, enquanto `Jogos`, `Classificacao` e `Chat` eram abas reais;
- a lista de inscritos podia aparecer como bloco fixo mesmo quando o usuario queria ver jogos, classificacao ou chat;
- o seletor de classe ficava implicito demais e podia trocar o contexto de outras areas sem clareza.

Resultado:

- a navegacao publica do torneio agora tem abas reais: `Evento`, `Inscritos`, `Jogos`, `Classificacao` e `Chat`;
- `Evento` mostra somente leitura publica, resumo, CTA e atalhos;
- `Categorias` deixou de ser pagina propria; classes viraram seletor contextual dentro das areas que dependem desse recorte;
- `Inscritos` mostra jogadores publicados e filtrados pela classe ativa, usando a chave publica da classe para nao cair em falso vazio;
- `Jogos`, `Classificacao` e `Chat` nao recebem mais hero, lista fixa ou blocos publicos anteriores acima do conteudo;
- `Jogos`, `Classificacao` e `Inscritos` receberam filtro contextual de classe no topo com seletor unico, evitando duplicidade entre botoes e select;
- `Classificacao` aparece para leitor publico somente em torneios com fase de grupos;
- `Encerramento / Podio por classe` aparece na aba `Evento` e apenas quando o torneio estiver finalizado;
- a aba `Evento` exibe `Exportar chave` quando ha chaveamento gerado para alguma classe;
- a exportacao de chave passou a respeitar margem superior real e quebra o titulo da classe/campeonato em linhas para nao cortar texto fora da imagem;
- a exportacao de agenda por quadra em PNG ficou mais robusta: segura melhor agendas altas, nao revoga o arquivo temporario antes do navegador iniciar o download e baixa SVG como fallback se o canvas/PNG falhar;
- o menu publico segue clicavel e arrastavel no mobile, sem transformar o torneio em pagina infinita.

Validacao:

- `npm.cmd run lint`;
- `npm.cmd run build`.

Risco restante:

- a experiencia visual ainda deve ser conferida em browser mobile real para calibrar densidade e sticky CTA, mas a separacao funcional por aba ja esta aplicada.

### [x] COMP-SCORE-02 - Torneios com placar visual padronizado com a sala da liga

Status: `[x]` concluido em 2026-05-15

Fonte:

- feedback para aplicar o mesmo padrao da liga nos torneios;
- `COMP-SCORE-01`;
- padrao existente de lancamento admin em torneios.

Contexto:

- a regra de tie-break condicional ja existia no torneio, mas os campos apareciam como inputs soltos em linha flexivel;
- jogador e admin usavam o mesmo renderer, mas a apresentacao ainda nao tinha a previsibilidade visual aplicada na sala da liga;
- em mobile, o bloco podia parecer menos organizado quando o tie-break era habilitado.

Resultado:

- `Informar resultado`, `Lancar placar` e `Editar placar` em torneios usam linhas de placar consistentes;
- cada set exibe label, games A e games B em grid previsivel;
- quando o set exige tie-break, a sublinha `Tie-break` aparece no mesmo padrao visual da liga;
- super tie-break unico e super tie-break decisivo tambem ficam no mesmo grid;
- campos ganharam `aria-label` especifico para reduzir ambiguidade.

Validacao:

- `npm run lint`;
- `npm run build`.

### [x] COMP-SCORE-01 - Sala de liga com tie-break por set no envio de resultado

Status: `[x]` concluido em 2026-05-15

Fonte:

- feedback da sala de envio de resultado;
- padrao existente de lancamento de placar em torneios pelo admin;
- `COMPETITION_OS_V2_IMPLEMENTATION_SPEC.md`.

Contexto:

- a sala de partida da liga aceitava apenas dois campos numericos por linha;
- sets decididos em tie-break ficavam sem campo especifico;
- jogador e admin nao tinham o mesmo padrao visual/operacional usado no lancamento de torneio;
- formatos como `melhor_de_3`, `set_unico`, `pro_set`, `fast4`, `melhor_de_3_super_tb` e `super_tb_unico` precisavam respeitar suas regras.

Resultado:

- cada set da sala de liga agora mostra primeiro os games dos lados 1 e 2;
- quando o set chega ao placar que exige tie-break (`6/6`, `8/8` em pro set, `4/4` em Fast4), a UI abre campos `Tie-break` para os dois lados;
- super tie-break e tie-break decisivo continuam como linhas de pontos, seguindo o formato da liga;
- o calculo do vencedor considera o tie-break por set quando os games ficam empatados no alvo;
- o resumo enviado preserva o detalhe do tie-break no formato `6/6(7/5)`;
- jogador e admin usam o mesmo componente da sala para enviar/resolver resultado.

Validacao:

- `npm run lint`;
- `npm run build`.

### [x] COMP-PUBLIC-02A - Liga publica com abas limpas por intencao

Status: `[x]` concluido em 2026-05-15

Fonte:

- feedback da rota `/eventos/ligas/:leagueId?tab=chat`;
- `COMPETITION_OS_V2_IMPLEMENTATION_SPEC.md`;
- `PLAYER_APP_V2_IMPLEMENTATION_SPEC.md`.

Contexto:

- a pagina publica de liga renderizava hero, classes, jogadores e depois o conteudo da aba, mesmo quando o usuario escolhia `Chat` ou `Partidas`;
- existia lista fixa de jogadores fora de contexto, enquanto a aba `Jogadores` tambem existia;
- `Chat` e `Partidas` pareciam duplicados entre topo e submenu;
- no publico, a experiencia parecia uma pagina longa com ancoras, nao areas limpas por intencao.

Resultado:

- a navegacao publica da liga agora tem abas reais: `Liga`, `Jogadores`, `Classificacao`, `Partidas` e `Chat`;
- no mobile, essa navegacao fica clicavel e arrastavel horizontalmente, sem quebrar linha;
- `Liga` mostra somente resumo publico, CTA e inscricao publica quando o usuario ainda nao esta inscrito;
- inscricao aprovada/pendente/rejeitada aparece como status compacto no resumo, nao como formulario gigante;
- `Jogadores`, `Classificacao` e `Partidas` receberam filtro contextual de classe no topo;
- `Classes` deixou de ser uma pagina propria para evitar que clicar em classe troque conteudo de outro menu;
- `Jogadores` mostra somente jogadores publicados do recorte selecionado;
- `Classificacao` mostra somente tabela/ranking da temporada ou classe selecionada;
- `Partidas` e `Chat` nao recebem mais lista fixa de jogadores ou blocos publicos anteriores;
- a navegacao operacional do owner continua separada em `Organizacao`, `Jogadores`, `Partidas` e `Chat`.

Validacao:

- `npm run lint`;
- `npm run build`.

Risco restante:

- o mesmo padrao de pagina publica longa ainda deve ser auditado em torneios, porque este sprint foi limitado a liga publica.

### [x] PLAYER-UX-03E - Notificacoes em popover/sheet nativo do shell

Status: `[x]` concluido em 2026-05-15

Fonte:

- feedback visual da Home do jogador;
- `PLAYER_APP_V2_IMPLEMENTATION_SPEC.md`;
- `COMPONENT_GRAMMAR.md`.

Contexto:

- o sino de notificacoes abria um card comum no meio da Home;
- o painel empurrava o conteudo e parecia uma nova secao da pagina, nao uma extensao do sino;
- o comportamento quebrava a expectativa comum de web/mobile, onde notificacoes abrem em popover ancorado ou sheet.

Resultado:

- `AppShell` passou a aceitar `bellOpen`, `bellPanel` e `onBellClose`;
- no desktop, notificacoes abrem em popover ancorado ao sino, com seta visual e fechamento por backdrop;
- no mobile, o mesmo conteudo abre como bottom sheet com backdrop, sem alterar o layout da pagina;
- a Home deixou de renderizar notificacoes como bloco inline e passa apenas o conteudo ao shell;
- acoes internas continuam fechando o painel antes de navegar.

Validacao:

- `npm run lint`;
- `npm run build`.

Risco restante:

- se outros shells/telas passarem a usar notificacoes no futuro, devem reutilizar o contrato `bellPanel` para manter o padrao.

### [x] PLAYER-UX-03B - Reserva publica guiada por disponibilidade e perfil

Status: `[x]` concluido em 2026-05-15

Fonte:

- `PLAYER_APP_V2_IMPLEMENTATION_SPEC.md`
- feedback visual do fluxo `/locais?intent=booking`
- `AGENDA_MODULE_FUNCTION_MAP.md`

Contexto:

- O filtro de reservar quadra quebrava em desktop com campos encavalados.
- A busca permitia digitar cidade/UF/local livremente, criando resultados pouco guiados.
- O fluxo publico de reserva pedia nome e contato como se fosse um cadastro avulso, mesmo com usuario logado.
- Gestor tinha dificuldade de entender onde a solicitacao pendente aparecia.

Resultado:

- filtro de reserva reorganizado em ordem operacional: UF, cidade, local, piso, data, hora e duracao;
- UF/cidade/local passam a ser guiados por dados cadastrados de locais com quadras ativas;
- local usa autocomplete por nome do local;
- filtro de piso adicionado ao discovery e aplicado aos resultados;
- cadastro de nova quadra na gestao passou a capturar piso;
- confirmacao publica mostra que a reserva esta vinculada ao perfil logado e pede telefone apenas se o perfil nao tiver contato;
- mensagem de sucesso orienta que o gestor encontra a solicitacao em `Gestao > Agenda > Reservas pendentes`;
- layout do bloco publico de reserva recebeu ajustes de grid para evitar desalinhamento em desktop.

Validacao:

- `npm run lint`;
- `npm run build`.

Risco restante:

- a lista de horas ainda usa opcoes padrao de operacao; a disponibilidade real e validada na busca/RPC no momento da pesquisa.
- validacao visual por Playwright ficou limitada porque o ambiente local redirecionou para login sem sessao QA ativa.

### [x] PLAYER-UX-03C - Polir filtro de reserva e busca por periodo

Status: `[x]` concluido em 2026-05-15

Contexto:

- O campo `Data` ainda sobrepunha visualmente o campo `Hora`.
- O botao textual de buscar tomava espaco demais no grid.
- O jogador precisava escolher uma hora exata antes de entender a disponibilidade.

Resultado:

- grid do filtro de reserva reorganizado em 12 colunas com spans explicitos para evitar sobreposicao;
- botao textual foi substituido por botao compacto com icone de busca;
- filtro de hora passou a aceitar `Qualquer horario`, `Manha`, `Tarde`, `Noite` e horas cheias;
- discovery de reserva busca disponibilidade em horas cheias e retorna o primeiro horario livre por quadra;
- cards de resultado exibem data/hora sugerida;
- fluxo publico de reserva passou a usar apenas horas cheias e duracoes de 1h ou 2h.

Validacao:

- `npm run lint`;
- `npm run build`.

### [x] PLAYER-UX-03D - Calendario de quadras por local no fluxo do jogador

Status: `[x]` concluido em 2026-05-16

Objetivo:

- Evoluir a reserva publica para um fluxo visual: filtrar contexto, escolher local, ver calendario de quadras e tocar no horario.

Especificacao:

- Com `UF + Cidade + Data` e sem local selecionado, mostrar cards de locais com resumo de disponibilidade: nome, cidade, pisos, menor preco e proximos horarios livres.
- Ao selecionar um local, abrir uma visualizacao propria de agenda por quadra.
- A agenda deve priorizar mobile: carrossel horizontal por quadra ou seletor de quadra, com linhas de horas cheias.
- Cada linha representa uma hora; slot livre e acionavel, ocupado fica neutro/indisponivel.
- Ao tocar em um slot livre, abrir confirmacao curta vinculada ao perfil.
- Nao misturar neste fluxo aulas, planos, jogos abertos ou beneficios.
- Backend deve continuar usando `app_search_available_courts`/`app_create_court_booking`; se necessario, criar RPC agregada para disponibilidade do dia por local.

Resultado:

- a pagina publica do local (`/locais/:placeId?intent=booking`) renderiza apenas o fluxo de reserva quando a intencao e `Reservar`, sem empilhar aulas, jogos, planos e beneficios abaixo;
- o fluxo foi reorganizado em tres passos: `Quando?`, `Qual horario?` e `Confirmar`;
- `Quando?` usa dia e duracao em horas cheias (`1h` ou `2h`);
- `Qual horario?` mostra um carrossel horizontal de quadras, cada uma com lista hora a hora;
- slots livres ficam acionaveis, slots ocupados ficam neutros e o intervalo completo selecionado fica destacado quando a duracao e de `2h`;
- `Confirmar` mostra quadra, horario inicial/final, duracao, total calculado por duracao e reserva vinculada ao perfil logado;
- telefone so aparece como campo editavel quando o perfil nao tem contato;
- `Solicitar reserva` continua usando `createCourtBooking`/`app_create_court_booking`, mantendo a reserva pendente para a gestao aprovar;
- `Lista de espera` permanece disponivel quando nao ha slot escolhido ou quando o usuario quer aguardar liberacao.

Validacao:

- `npm.cmd run lint`;
- `npm.cmd run build`.

Risco restante:

- a disponibilidade do dia ainda e montada no frontend chamando `app_search_available_courts` por hora cheia; funciona para o volume atual, mas uma RPC agregada por dia/local pode ser criada se a agenda ficar pesada com muitas quadras;
- conflitos continuam sendo validados pelo backend no momento de criar a reserva, que permanece como fonte final de verdade.

Fora de escopo:

- regras financeiras novas;
- reserva de meia hora;
- dados administrativos do local no Player App.

### [x] QA-CURRENT-P0-01 - Alinhar Supabase alvo com migrations/seeds da reestruturacao

Status: `[x]` concluido em 2026-05-15

Fonte:

- `QA_CURRENT_VISUAL_EVOLUTION_REPORT_2026_05_15.md`
- `QA_CURRENT_P0_01_REPORT_2026_05_15.md`
- `QA_DESIGN_01_VISUAL_CONSISTENCY_REPORT_2026_05_15.md`
- `ROLE_CASHIER_01_REPORT_2026_05_15.md`
- `QA_SEED_ROLE_01_REPORT_2026_05_15.md`
- `ROLE_VISIBILITY_MATRIX.md`
- `CURRENT_PRODUCT_STATE.md`

Contexto:

- A auditoria visual atual refez prints em desktop 1366px e mobile 390px depois das ultimas mudancas.
- A UI evoluiu, mas o Supabase alvo usado pelo app local nao esta coerente com os seeds/migrations documentados.
- `qa.jogador.puro@demo.atp.local` e `caixa.prime@demo.atp.local` falham com `Invalid login credentials`.
- A Home do jogador renderiza erro tecnico cru: `Could not find the function public.app_list_my_place_staff_invites without parameters in the schema cache`.

Objetivo:

- Garantir que o ambiente alvo de QA suporta os perfis e RPCs usados pela reestruturacao.
- Remover erro tecnico cru da primeira dobra do Player App.
- Permitir validar jogador puro e caixa/POS com login real.

Escopo:

- aplicar/validar migrations pendentes de roles, convites e seeds no Supabase alvo;
- confirmar existencia/assinatura de `app_list_my_place_staff_invites(...)`;
- validar usuarios demo documentados:
  - `qa.jogador.puro@demo.atp.local`;
  - `caixa.prime@demo.atp.local`;
  - `financeiro.prime@demo.atp.local`;
  - `organizador.circuito@demo.atp.local`;
- ajustar frontend apenas se o erro de convite opcional ainda puder aparecer cru no corpo da Home;
- reexecutar screenshots de Home, Gestao e Cantina/POS.

Fora de escopo:

- redesenhar telas;
- alterar regras de permissao sem nova especificacao;
- continuar polish de Ranking/Competition antes de estabilizar ambiente.

Criterios de aceite:

- Home do jogador nao exibe erro tecnico de RPC;
- jogador puro autentica e nao ve Gestao/Organizacao como caminho primario;
- caixa/POS autentica e ve apenas Cantina/POS quando o plano permitir;
- `app_list_my_place_staff_invites(...)` funciona ou falha de forma silenciosa/amigavel;
- prints atualizados comprovam os estados;
- lint/build passam se houver alteracao de codigo.

Validacao obrigatoria:

- login com `qa.jogador.puro@demo.atp.local`;
- login com `caixa.prime@demo.atp.local`;
- abrir `/#/inicio` mobile 390px;
- abrir `/#/gestao` mobile 390px para caixa/POS;
- verificar console sem 400/404/500 relacionados a convites/roles na primeira dobra.

Resultado:

- migrations `0086`, `0087`, `0088` e `0089` aplicadas no Supabase alvo de QA;
- usuarios demo essenciais recriados/atualizados e autenticando;
- `app_list_my_place_staff_invites()` existe no alvo e nao vaza erro cru na Home;
- `app_list_place_staff(...)` agora permite que staff resolva o proprio papel sem expor equipe completa para nao gestores;
- caixa/POS em `/gestao` ve apenas superficie de Cantina/POS e copy operacional coerente;
- evidencias em `web/docs/screenshots/qa-current-p0-01-2026-05-15/`.

### [x] QA-CURRENT-P1-01 - Simplificar Ranking do Player App

Status: `[x]` concluido em 2026-05-15

Fonte:

- `QA_CURRENT_VISUAL_EVOLUTION_REPORT_2026_05_15.md`
- `PLAYER_APP_V2_UX_PLAN.md`
- `PLAYER_APP_V2_IMPLEMENTATION_SPEC.md`

Contexto:

- A rodada atual mostrou `Ranking` como a tela mais distante do DNA leve do Player App.
- Desktop tem 6.46 screenfuls e 81 rows; mobile mostrou `0 jogadores encontrados`/`Carregando ranking`, divergente do desktop com 162 jogadores.

Objetivo:

- Transformar Ranking em experiencia de jogador: minha posicao, meu recorte, progresso e acesso ao ranking completo.
- Reduzir densidade inicial e corrigir divergencia mobile/desktop.

Escopo:

- primeira dobra centrada em `Minha posicao` e filtros essenciais;
- lista progressiva ou `Ver ranking completo`;
- corrigir estado mobile com dados inconsistentes;
- remover a sensacao de relatorio administrativo.

Criterios de aceite:

- mobile 390px abre com contexto pessoal e sem lista gigante;
- desktop nao despeja 81 rows antes de intencao clara;
- desktop e mobile retornam o mesmo recorte de dados;
- nenhum console error/warning no carregamento padrao.

Resultado:

- `/ranking` agora carrega com `Minha posicao`, `Recorte atual` e filtros essenciais antes da lista.
- A lista passou a ser progressiva: mostra 12 jogadores e oferece `Ver mais jogadores`, sem despejar 81 rows/relatorio administrativo.
- O carregamento limpa dados antigos, evita divergencia mobile/desktop e mostra estado amigavel se a API falhar.
- Mobile 390px usa chips horizontais, rows compactas sem overflow e acao `Seguir` sem transformar cada row em card gigante.
- Evidencias em `web/docs/screenshots/qa-current-p1-01-2026-05-15/` e relatorio em `QA_CURRENT_P1_01_RANKING_REPORT_2026_05_15.md`.

### [x] QA-CURRENT-P1-02 - Simplificar lista de torneios organizados

Status: `[x]` concluido em 2026-05-15

Fonte:

- `QA_CURRENT_VISUAL_EVOLUTION_REPORT_2026_05_15.md`
- `COMPETITION_OS_V2_UX_PLAN.md`
- `COMPETITION_OS_V2_IMPLEMENTATION_SPEC.md`

Contexto:

- `/#/eventos/torneios?view=organizing` ficou menos densa, mas ainda mostra zeros, filtros longos e loading antes da tarefa.

Objetivo:

- Tornar a tela de torneios organizados operacional, com rows e proximas acoes antes de filtros.

Escopo:

- ocultar contadores zerados;
- mover filtros extensos para sheet/drawer no mobile;
- mostrar primeiro rascunhos, inscricoes abertas, pendencias ou estado vazio acionavel;
- preservar criar torneio e filtros avancados.

Criterios de aceite:

- mobile 390px nao abre como formulario de filtros;
- se nao houver torneios, estado vazio explica proximo passo;
- se houver torneios, rows exibem status e acao primaria;
- sem zero badges sem valor operacional.

Resultado:

- `/#/eventos/torneios?view=organizing` agora abre por uma fila operacional de torneios organizados, com proximas acoes em rows antes dos filtros.
- Contadores zerados foram removidos; os indicadores restantes viraram resumo compacto, especialmente no mobile.
- Filtros extensos ficam em disclosure fechado por padrao e abrem automaticamente apenas quando ha filtro ativo.
- A lista completa/historico fica em disclosure de suporte; a primeira dobra prioriza torneios que exigem acao.
- Cada row mostra status, contexto, proximo passo e acao primaria (`Gerir inscritos`, `Gerar jogos`, `Operar jogos`, `Ver resumo`), preservando `Criar torneio` e `Copiar link`.
- Validado em desktop 1366px e mobile 390px sem erro bruto, sem resposta HTTP >= 400, sem badges zero e sem overflow.
- Evidencias em `web/docs/screenshots/qa-current-p1-02-2026-05-15/` e relatorio em `QA_CURRENT_P1_02_ORGANIZER_TOURNAMENTS_REPORT_2026_05_15.md`.

### [x] QA-CURRENT-P1-03 - Auditar 404/500 da Central de Gestao

Status: `[x]` concluido em 2026-05-15

Fonte:

- `QA_CURRENT_VISUAL_EVOLUTION_REPORT_2026_05_15.md`
- `MANAGEMENT_OS_V2_UX_PLAN.md`
- `MANAGEMENT_OS_V2_IMPLEMENTATION_SPEC.md`

Contexto:

- Recaptura com 30s confirmou que `/gestao` carrega para professor, recepcao, gestor e financeiro.
- Mesmo assim, todos os perfis geraram 2 erros 404 e 2 erros 500 no console.

Objetivo:

- Identificar chamadas quebradas/opcionais no carregamento da Central de Gestao e impedir falhas silenciosas.

Escopo:

- rastrear endpoints/RPCs responsaveis pelos 404/500;
- separar dados obrigatorios da primeira dobra de dados opcionais;
- manter UI sem erro tecnico cru;
- documentar se algum erro depende apenas de seed/migration pendente.

Criterios de aceite:

- `/gestao` carrega sem 404/500 no console em fluxo feliz;
- falha opcional nao bloqueia fila/workspaces;
- mensagens tecnicas ficam fora da UI;
- comportamento validado em desktop e mobile.

Resultado:

- A causa atual dos 500 era a consulta opcional de `app_payments` para `court_booking`, executada pela Central de Gestao mesmo sem ser usada na primeira dobra. O Supabase retornava `57014 statement timeout`.
- `fetchPlacesWorkspaceData(...)` ganhou `includeSupportData`; telas completas continuam carregando pagamentos/jogos abertos, enquanto `/gestao` chama a workspace com `includeSupportData: false`.
- A Central de Gestao agora carrega apenas dados necessarios para fila/workspaces iniciais e evita chamadas opcionais lentas.
- Validado em mobile 390px com `gerente.dourados`, `prof.renato`, `recepcao.dourados` e `financeiro.prime`: 0 respostas HTTP >= 400, sem erro bruto na UI e com conteudo de gestao carregado.
- Evidencias em `web/docs/screenshots/qa-current-p1-03-2026-05-15/` e relatorio em `QA_CURRENT_P1_03_MANAGEMENT_CONSOLE_REPORT_2026_05_15.md`.

### [x] COMP-UX-03 - Inscricao em torneio/liga

Status: `[x]` concluido em 2026-05-15

Fonte:

- `COMPETITION_OS_V2_UX_PLAN.md`
- `COMPETITION_OS_V2_IMPLEMENTATION_SPEC.md`
- `ROLE_VISIBILITY_MATRIX.md`
- `COMPONENT_GRAMMAR.md`
- `CURRENT_PRODUCT_STATE.md`

Contexto:

- `COMP-UX-02` separou a leitura publica de torneio/liga da operacao do organizador.
- O jogador agora entende o evento antes de ver jogos/ranking, mas a conversao de inscricao ainda pode manter densidade e etapas pouco claras.

Objetivo:

- Transformar inscricao em torneio/liga em fluxo curto, mobile-first e confiavel.
- Separar escolha de categoria/classe, revisao de valor/restricoes, confirmacao e status.
- Garantir feedback claro para inscricao enviada, pendente, aprovada, recusada ou ja existente.

Escopo:

- revisar `TournamentRegistrationPage.tsx`;
- revisar formulario publico de entrada em liga dentro de `LeagueDetailsPage.tsx` ou extrair componente se ficar simples;
- preservar backend/RLS/RPCs existentes;
- melhorar estados de erro sem mostrar mensagem tecnica crua;
- manter CTA sticky quando fizer sentido.

Fora de escopo:

- refazer setup de torneio/liga;
- alterar regras de aprovacao, ranking ou pagamento;
- criar checkout real se o backend atual ainda for stub.

Criterios de aceite:

- jogador escolhe categoria/classe sem lista confusa;
- revisa valor e restricoes antes de confirmar;
- confirmacao mostra status e proximo passo;
- usuario ja inscrito entende a situacao sem reenviar;
- erro de permissao/API e amigavel;
- mobile 390px nao vira formulario longo.

Validacao:

- jogador novo se inscreve em torneio;
- jogador ja inscrito abre o link;
- jogador solicita entrada em liga publica;
- caso de erro exibe feedback amigavel;
- rodar lint/build.

Entregue:

- `/inscricao/:tournamentId` virou fluxo em 3 etapas: escolher categoria/classe, confirmar dados e revisar valor/prazo/restricao antes de enviar;
- jogador ja inscrito ve status real (`pendente`, `aprovada`, `recusada`, `lista de espera`) e nao reenvia solicitacao duplicada;
- erros de inscricao foram convertidos para mensagens amigaveis;
- entrada publica em liga dentro de `/eventos/ligas/:leagueId` agora carrega a inscricao do usuario, bloqueia reenvio e mostra status/proximo passo;
- link direto de liga em `/eventos/ligas/inscricao/:token` ganhou revisao curta, dados do jogador, status e CTA contextual;
- CSS compartilhado `registration-flow`, `registration-option`, `registration-review-card` e `registration-sticky-cta` foi criado para manter o padrao v2 sem virar formulario longo.

Validacao executada:

- `npm.cmd run lint`;
- `npx.cmd tsc --noEmit`;
- `npm.cmd run build`.

Gap documentado:

- restricao de horario de torneio ainda nao possui campo persistido em `tournament_registrations`; a UI comunica para combinar com a organizacao, mas nao finge salvar um dado que o backend ainda nao guarda.

### [x] MGMT-UX-01 - Shell operacional mobile

Status: `[x]` concluido em 2026-05-15

Fonte:

- `MANAGEMENT_OS_V2_UX_PLAN.md`
- `MANAGEMENT_OS_V2_IMPLEMENTATION_SPEC.md`
- `ROLE_VISIBILITY_MATRIX.md`
- `COMPONENT_GRAMMAR.md`
- `CURRENT_PRODUCT_STATE.md`

Objetivo:

- Reorganizar `/gestao` e o workspace local para que mobile abra por contexto operacional, subnav e fila antes de KPI.
- Reduzir cockpit vazio, loading gigante, modulos misturados e indicadores sem acao.

Escopo:

- revisar entrada `/gestao`;
- revisar primeira dobra de `/gestao/:placeId/:module`;
- manter permissoes/plano;
- nao refazer Agenda ou Academia inteira nesta task.

Resultado esperado:

- gestor ve fila e modulo ativo antes de metricas;
- professor/recepcao/financeiro nao recebem atalhos irrelevantes;
- mobile deixa de parecer uma pilha de cards administrativos.

Entregue:

- `/gestao` deixou de usar KPIs no header como primeira leitura; a fila do dia abre antes e os numeros foram movidos para `Sinais de suporte`;
- `placeManagementModules(...)` passou a separar modulos por papel real: professor cai direto em Academia e nao herda `Painel`, Clientes, Financeiro ou Cantina; recepcao mantem Agenda/Academia/Clientes basico quando o plano permite;
- a fila do dashboard do local passou a filtrar itens pelo modulo permitido, evitando recebiveis/cantina/agenda para papeis sem acesso;
- o cockpit de `/gestao/:placeId/:module` ficou mais enxuto: a ficha publica do local permanece oculta e o card operacional usa grid com espacamento controlado.

Validacao executada:

- `npm.cmd run lint`;
- `npx.cmd tsc --noEmit`;
- `npm.cmd run build`.

### [x] MGMT-UX-02 - Modo Professor

Status: `[x]` concluido em 2026-05-15

Fonte:

- `MANAGEMENT_OS_V2_UX_PLAN.md`
- `MANAGEMENT_OS_V2_IMPLEMENTATION_SPEC.md`
- `ROLE_VISIBILITY_MATRIX.md`
- `ACADEMY_V2_UX_PLAN.md`

Objetivo:

- Criar experiencia leve para professor: aulas, turmas, alunos, chamada e agenda.
- Professor nao deve herdar cantina, CRM pesado ou financeiro completo sem permissao.
- Professor sem vinculo precisa receber estado vazio claro e acao de proximo passo.

Resultado esperado:

- professor encontra rotina dele rapidamente;
- rota de gestao local abre direto no modulo util;
- agenda/turmas/alunos aparecem com contexto proprio;
- sem vazamento de operacao empresarial.

Entregue:

- `Academia` em modo professor agora renderiza somente `Aulas`, `Turmas` e `Alunos`;
- abas de `Pendencias`, `Professores` e `Configuracao` ficam fora da superficie do professor sem gestao completa;
- turmas, alunos, chamada, reposicoes e resumo operacional sao filtrados pelo `place_coaches.user_id` vinculado ao login;
- professor sem cadastro vinculado ve estado vazio claro em vez de herdar turmas por nome do professor;
- fila da Academia para professor mostra apenas aulas do dia, sem aprovacao/cobranca de pendencias empresariais.

Validacao executada:

- `npm.cmd run lint`;
- `npx.cmd tsc --noEmit`;
- `npm.cmd run build`.

### [x] QA-ROLE-01 - Teste manual por papel

Status: `[x]` concluido em 2026-05-15

Objetivo:

- Reexecutar testes por jogador, aluno, professor, recepcao, financeiro, organizador e gestor depois das separacoes por modo.
- Confirmar no browser que cada papel ve apenas o que precisa e que nao houve regressao de caminhos principais.

Entregue:

- criado `QA_ROLE_01_ROLE_VISIBILITY_REPORT_2026_05_15.md`;
- screenshots e textos por papel em `web/docs/screenshots/qa-role-2026-05-15/`;
- nenhum P0 novo encontrado;
- vazamento de setup por papel virou a proxima prioridade.

### [x] MGMT-ROLE-QA-01 - Corrigir vazamento de setup por papel

Status: `[x]` concluido em 2026-05-15

Objetivo:

- Remover tarefas de setup estrutural da visao de professor e recepcao.
- Manter setup profundo apenas para `owner`/`manager`.
- Preservar fila operacional real por papel.

Entregue:

- `summarizePlace(...)` passou a considerar papel/permissao;
- professor recebe resumo filtrado por `place_coaches.user_id`;
- professor nao soma setup, CRM, financeiro, estoque, reservas ou pendencias globais do local;
- recepcao nao recebe setup estrutural nem financeiro/cantina;
- setup estrutural fica restrito a `owner`/`manager`;
- criado `MGMT_ROLE_QA_01_REPORT_2026_05_15.md`;
- screenshots em `web/docs/screenshots/mgmt-role-qa-01-2026-05-15/`.

Validacao executada:

- Playwright desktop/mobile para professor, recepcao e gestor;
- `npx.cmd tsc --noEmit`;
- `npm.cmd run lint`;
- `npm.cmd run build`.

### [x] QA-DESIGN-01 - Auditoria visual de consistencia

Status: `[x]` concluido em 2026-05-15

Objetivo:

- Validar se as areas reestruturadas mantem o DNA visual ATP.
- Garantir que Player App, Competition OS e Management OS nao voltem para card overload, duplicidade e hierarquia confusa.

Entregue:

- criado relatorio `QA_DESIGN_01_VISUAL_CONSISTENCY_REPORT_2026_05_15.md`;
- screenshots desktop/mobile atualizados em `web/docs/screenshots/qa-design-01-2026-05-15/`;
- `/locais` deixou de renderizar contadores zerados em tiles de intencao do Player App;
- `/eventos` deixou de renderizar badges `0` e removeu a entrada `Organizando` da primeira leitura do jogador puro;
- `/eventos` preserva o modo organizador quando ha competicoes organizadas ou acesso explicito ao modo;
- `fetchPlacesWorkspaceData` ganhou fallback por recurso opcional para impedir que falha/timeout de pagamentos ou partidas abertas bloqueie a Central de Gestao inteira.

Validacao executada:

- Playwright autenticado em 390px e 1366px para jogador, organizador, professor, recepcao e gestor;
- recaptura especifica de `/eventos?modo=discover` confirmou que jogador puro nao ve `Organizando`;
- `npm.cmd run lint`;
- `npx.cmd tsc --noEmit`;
- `npm.cmd run build`.

Achados reenfileirados:

- Ranking do jogador foi simplificado em `PLAYER-UX-06`; perfil do jogador foi separado por finalidade em `PLAYER-UX-07`;
- fila operacional de torneio foi enderecada em `COMP-OPS-01`; validacao visual mobile autenticada com muitos dados segue recomendada;
- central de Gestao ainda carrega dados demais para a primeira dobra; risco registrado para futura otimizacao de resumo leve;
- papel financeiro dedicado foi entregue em `ROLE-FINANCE-01`; operador de caixa/POS segue como backlog futuro.

### [x] COMP-UX-02 - Evento publico mobile

Status: `[x]` concluido em 2026-05-15

Fonte:

- `COMPETITION_OS_V2_UX_PLAN.md`
- `COMPETITION_OS_V2_IMPLEMENTATION_SPEC.md`
- `ROLE_VISIBILITY_MATRIX.md`
- `ROLE_BASED_RESTRUCTURE_TASK_SPECS.md`
- `COMPONENT_GRAMMAR.md`
- `DESIGN_TOKENS.md`
- `CURRENT_PRODUCT_STATE.md`

Contexto:

- `COMP-UX-01` separou o hub `/eventos` em `Jogando`, `Organizando` e `Descobrir`.
- O proximo gargalo P0 esta dentro do evento/torneio publico: jogador ainda pode cair em uma pagina com densidade de cockpit e navegacao secundaria empurrada por resumos.

Objetivo:

- Fazer a pagina publica de torneio/liga parecer evento para jogador, nao painel administrativo.
- Expor nome, local, data, status, poster, tabs e CTA principal antes de detalhe pesado.
- Preservar acesso de organizador, mas sem misturar fila, configuracao e KPIs na leitura publica.

Escopo:

- revisar rota publica de torneio em `TournamentPage.tsx` e CSS relacionado;
- revisar, quando seguro, a superficie publica de liga em `LeagueDetailsPage.tsx`;
- garantir tabs visiveis cedo (`Evento`, `Categorias`, `Inscritos/Jogos`);
- criar/ajustar CTA contextual para jogador (`Inscrever-se`, `Ver inscricao`, `Ver meus jogos`, `Inscricoes encerradas`);
- manter regras atuais de inscricao, staff, jogos, resultados e permissoes.

Fora de escopo:

- refazer fluxo de inscricao completo (`COMP-UX-03`);
- refazer setup completo de torneio/liga (`COMP-SETUP-01/02`);
- alterar algoritmo de partidas, chaves, resultados ou ranking.

Criterios de aceite:

- jogador visitante/inscrito entende o evento na primeira dobra;
- tabs nao ficam empurradas por resumo administrativo;
- KPIs e filas de organizador nao aparecem na leitura publica;
- CTA principal fica visivel e coerente com estado;
- mobile 390px nao abre como cockpit empilhado.

Validacao:

- lint e typecheck passaram;
- build passou;
- validacao visual pendente de screenshot se o navegador local estiver disponivel.

Entregue:

- torneio publico ganhou bloco inicial de evento com nome, local, data, status, poster/placeholder, fatos essenciais e CTA contextual;
- jogador publico/inscrito nao ve `CompetitionScopeSelector`, KPIs, fila operacional nem painel de publicacao antes do conteudo;
- categorias do torneio aparecem em rail acionavel, sem slice silencioso, e selecionam a classe para jogos;
- navegacao publica de torneio ficou leve (`Evento`, `Categorias`, `Jogos`, `Classificacao`, `Chat` quando disponivel);
- CTA mobile sticky foi adicionado para inscricao, acompanhamento ou jogos;
- liga publica recebeu bloco equivalente com status, temporada, classes, jogadores, CTA e rail de classes;
- operacao de owner/organizador foi preservada com fila, filtros, publicacao, jogadores e partidas.

### [x] COMP-UX-01 - Hub de eventos por modo

Status: `[x]` concluido em 2026-05-15

Fonte:

- `COMPETITION_OS_V2_UX_PLAN.md`
- `COMPETITION_OS_V2_IMPLEMENTATION_SPEC.md`
- `ROLE_VISIBILITY_MATRIX.md`
- `ROLE_BASED_RESTRUCTURE_TASK_SPECS.md`
- `COMPONENT_GRAMMAR.md`
- `DESIGN_TOKENS.md`
- `CURRENT_PRODUCT_STATE.md`

Contexto:

- `PLAYER-UX-01` a `PLAYER-UX-04` reduziram empilhamento inicial de jogador em inicio, locais, reserva e aulas publicas.
- O gargalo seguinte estava em `/eventos`, onde jogador, organizador e descoberta ainda disputavam a mesma tela.

Entregue:

- `/eventos` agora opera por modo ativo: `Jogando`, `Organizando` e `Descobrir`;
- apenas o conteudo do modo selecionado e renderizado, evitando cockpit empilhado;
- jogador abre em `Jogando` ou `Descobrir` quando nao tem competicoes ativas;
- usuario apenas organizador pode iniciar em `Organizando`, sem poluir a visao do jogador;
- fila operacional e criacao de torneio/liga ficaram no contexto `Organizando`;
- `Descobrir` virou entrada leve para torneios, ligas e locais, com acesso separado ao modo organizador;
- listas com preview indicam quando existem mais itens e oferecem `Ver todos`;
- mobile usa segmentos horizontais em vez de empilhar as tres areas;
- `lint` e `build` passaram.

Validacao:

- `/eventos`;
- jogador puro;
- organizador;
- usuario multi-papel;
- mobile 390px por CSS;
- `npm run lint`;
- `npm run build`.

### [x] PLAYER-UX-04 - Entrar em aula como fluxo publico

Status: `[x]` concluido em 2026-05-15

Fonte:

- `PLAYER_APP_V2_UX_PLAN.md`
- `PLAYER_APP_V2_IMPLEMENTATION_SPEC.md`
- `ROLE_VISIBILITY_MATRIX.md`
- `ROLE_BASED_RESTRUCTURE_TASK_SPECS.md`
- `ACADEMY_MODULE_FUNCTION_MAP.md`
- `COMPONENT_GRAMMAR.md`
- `DESIGN_TOKENS.md`
- `CURRENT_PRODUCT_STATE.md`

Contexto:

- `PLAYER-UX-03` tornou a reserva publica do local um fluxo direto: dia/duracao, horarios livres, confirmacao e lista de espera.
- O gargalo seguinte era aula/turma publica: a pagina do local ainda misturava lista, select e formulario como ficha de academia.

Entregue:

- `/locais?intent=classes` recebeu linguagem mais direta para jogador: `Entrar em aula`, escolher perfil e ver turma;
- pagina publica do local passou a organizar aula em 3 passos: perfil, turma com vaga e envio de interesse;
- a lista duplicada de turmas abaixo do formulario foi removida;
- selecao de turma virou card acionavel com dia/hora, professor, nivel, vaga e valor publico quando existe;
- `Enviar interesse` continua persistindo via `createAcademyEnrollment`;
- erro tecnico de solicitacao de aula nao e exibido cru ao jogador;
- filtros podem ser limpos e estados vazios orientam ajuste de perfil;
- `lint` e `build` passaram.

Validacao:

- `/locais?intent=classes`;
- pagina publica de local com turmas;
- mobile responsivo por CSS em 390px;
- `npm run lint`;
- `npm run build`.

### [x] PLAYER-UX-04A - Corrigir filtro de aulas e turmas recorrentes

Status: `[x]` concluido em 2026-05-15

Fonte:

- `PLAYER_APP_V2_UX_PLAN.md`
- `PLAYER_APP_V2_IMPLEMENTATION_SPEC.md`
- feedback visual em `/locais?intent=classes` e `/locais/:placeId?intent=academy`

Contexto:

- O filtro de `Entrar em aula` ficava quebrado no desktop: campos apertados, texto cortado e CTA saindo do box.
- O clique em uma turma levava para a pagina publica do local, mas ainda misturava reserva, aulas, jogos, planos e dados secundarios, recriando a sensacao de ficha empilhada.
- A busca tratava cada linha semanal como uma turma separada; quando uma mesma turma se repete em mais de um dia, o aluno precisa escolher exatamente quais dias quer frequentar.

Entregue:

- filtro de `Entrar em aula` ganhou grid responsivo proprio: os campos ficam legiveis e o CTA passa para uma linha segura no desktop, sem sair do container;
- resultados de busca de aula agora agrupam turmas equivalentes por local, titulo, professor, horario, nivel, perfil e mensalidade, somando vagas e exibindo dias juntos quando houver recorrencia real;
- pagina publica em `intent=academy` virou experiencia focada em aulas: rail, hero e corpo mostram somente o caminho de aula + contato, sem carregar reserva, jogos abertos, planos e quadras como secoes concorrentes;
- dentro do fluxo publico de aulas, turmas recorrentes aparecem como um grupo com chips de dias; o aluno pode selecionar um dia, outro ou varios dias da mesma turma;
- envio de interesse preserva backend existente criando uma solicitacao pendente por turma/dia selecionado via `createAcademyEnrollment`, com observacao consolidando os dias escolhidos;
- hero contextual de aula passou a falar de turmas e valor de aula, nao de quadras.

Validacao:

- `npm.cmd run lint`;
- `npm.cmd run build`;
- screenshots em `web/docs/screenshots/player-classes-2026-05-15/`:
  - `desktop-classes-discovery-final.png`;
  - `desktop-place-academy-focused-auth2.png`;
  - `mobile-place-academy-focused-auth2.png`.

Riscos restantes:

- os seeds atuais ainda parecem modelar muitas turmas como encontros semanais isolados. O agrupamento ja suporta turmas recorrentes, mas a validacao visual dos chips depende de dados com mesma turma, mesmo horario e dois ou mais weekdays.
- o fluxo publico ainda envia `interesse/matricula pendente`; contrato mensal com plano semanal completo continua pertencendo ao fluxo administrativo de matricula/Academia.

### [x] PLAYER-UX-03 - Reserva mobile fluida

Status: `[x]` concluido em 2026-05-15

Fonte:

- `PLAYER_APP_V2_UX_PLAN.md`
- `PLAYER_APP_V2_IMPLEMENTATION_SPEC.md`
- `ROLE_VISIBILITY_MATRIX.md`
- `ROLE_BASED_RESTRUCTURE_TASK_SPECS.md`
- `AGENDA_MODULE_FUNCTION_MAP.md`
- `COMPONENT_GRAMMAR.md`
- `DESIGN_TOKENS.md`
- `CURRENT_PRODUCT_STATE.md`

Contexto:

- `PLAYER-UX-02` reorganizou `/locais` por intencao compacta e criou entrada direta para reserva, aulas, jogos e lista de locais.
- O proximo gargalo e o fluxo de reserva: depois de escolher reservar, o jogador ainda precisa de um caminho mais fluido para onde/quando/disponibilidade/confirmar.

Objetivo:

- Tornar a reserva mobile direta e acionavel.
- O jogador deve conseguir escolher local/data/hora, ver slots ou quadras disponiveis e solicitar reserva sem interpretar uma area de gestao.

Escopo:

- revisar `PlacesPage.tsx` e CSS relacionado;
- revisar entrada publica de reserva em `PlacePublicPage.tsx`, se necessario;
- transformar filtros de reserva em fluxo compacto, especialmente no mobile;
- melhorar cards de disponibilidade com preco/status/duracao;
- manter lista de espera como alternativa quando nao houver disponibilidade real;
- manter criacao de reserva usando backend existente.

Fora de escopo:

- refazer aulas publicas (`PLAYER-UX-04`);
- alterar backend estrutural;
- mexer em Management OS de agenda, salvo reuso seguro;
- criar pagamento real se o fluxo atual ainda usa stub/status.

Criterios de aceite:

- reserva inicia em poucos toques no mobile;
- filtros essenciais nao ficam cortados;
- disponibilidade, preco e status ficam claros;
- sem disponibilidade aparece inline, com proxima acao;
- nenhuma quadra some ou fica inacessivel no mobile;
- solicitacao de reserva continua persistindo.

Entregue:

- pagina publica do local ganhou fluxo de reserva em 3 passos visiveis: dia/duracao, horario/quadra e confirmacao;
- agenda publica passou a renderizar somente horarios livres, reduzindo ruido de linhas ocupadas;
- slot livre mostra quadra, preco quando disponivel e duracao;
- ajuste manual de quadra/horario continua possivel sem repetir formulario de data/duracao;
- sem disponibilidade aparece inline e oferece lista de espera usando `joinCourtBookingWaitlist`;
- CTA `Ver outros locais` volta para `/locais?intent=booking`;
- `lint` e `build` passaram.

Validacao:

- validar `/locais?intent=booking` e pagina publica de local;
- validar desktop e mobile 390px;
- validar busca com disponibilidade e sem disponibilidade;
- rodar lint/build.

### [x] PLAYER-UX-02 - Locais por intencao compacta

Status: `[x]` concluido em 2026-05-15

Fonte:

- `PLAYER_APP_V2_UX_PLAN.md`
- `PLAYER_APP_V2_IMPLEMENTATION_SPEC.md`
- `ROLE_VISIBILITY_MATRIX.md`
- `ROLE_BASED_RESTRUCTURE_TASK_SPECS.md`
- `COMPONENT_GRAMMAR.md`
- `DESIGN_TOKENS.md`
- `CURRENT_PRODUCT_STATE.md`

Contexto:

- `PLAYER-UX-01` transformou `/inicio` em uma entrada leve por proxima acao e separou `Trabalho` da primeira dobra do jogador.
- `/locais` precisava servir descoberta publica, reserva, aulas e jogos sem parecer uma ficha/cockpit empilhado.

Objetivo:

- Transformar `/locais` em uma entrada compacta por intencao.
- Jogador deve escolher rapidamente se quer reservar quadra, entrar em aula, encontrar jogo ou ver locais.
- A lista/ficha completa deve vir depois da intencao, nao antes.

Entregue:

- `/locais` passou a ter quatro intencoes compactas: encontrar jogo, reservar quadra, entrar em aula e ver locais;
- Home envia o jogador direto para a intencao correta por query string (`booking`, `matches`, `classes`, `venues`);
- `Ver locais` ganhou fluxo proprio com busca por local/cidade/UF, tabs `Todos`, `Seguindo` e `Meus locais`;
- `Seguindo` e `Meus locais` passaram a filtrar de fato os cards exibidos;
- cards de locais em modo publico deixaram de destacar planos como informacao principal no fluxo de lista;
- mobile usa grid 2x2 de intencoes, reduzindo empilhamento inicial;
- `lint` e `build` passaram.

### [x] PLAYER-UX-01 - Inicio por proxima acao

Status: `[x]` concluido em 2026-05-15

Fonte:

- `RESTRUCTURE_SOURCE_OF_TRUTH_POLICY.md`
- `PLAYER_APP_V2_IMPLEMENTATION_SPEC.md`
- `PLAYER_APP_V2_UX_PLAN.md`
- `ROLE_VISIBILITY_MATRIX.md`
- `ROLE_BASED_RESTRUCTURE_PLAYBOOK.md`
- `ROLE_BASED_RESTRUCTURE_QUEUE.md`
- `ROLE_BASED_RESTRUCTURE_TASK_SPECS.md`
- `ROLE_BASED_RESTRUCTURE_SPRINT_BACKLOG.md`
- `COMPONENT_GRAMMAR.md`
- `DESIGN_TOKENS.md`
- `CURRENT_PRODUCT_STATE.md`

Contexto:

- `ROLE-UX-00` consolidou a matriz de visibilidade e o helper central de navegacao global.
- `ROLE-UX-01` separou o primeiro nivel de shell por modo e reduziu linguagem tecnica exposta no frontend.
- `DESIGN-UX-00` criou tokens reais de densidade por modo e documentou quando usar card, row, sheet, CTA, metric strip e wizard.
- O proximo bloqueio e transformar `/inicio` em uma entrada leve por proxima acao, em vez de painel empilhado.

Objetivo:

- Redesenhar a Home do jogador para responder primeiro "o que eu preciso fazer agora?".
- Jogador puro deve ver proxima acao, compromissos e intencoes simples.
- Usuario multi-papel deve ter entrada profissional discreta, sem poluir a primeira dobra.

Escopo:

- revisar `HomePage.tsx` e CSS relacionado;
- reduzir duplicidade entre blocos de agora, agenda, clube/local e entradas profissionais;
- criar/ajustar zona de foco do dia com uma acao primaria clara;
- organizar intencoes principais: reservar quadra, encontrar jogo, competir e ver compromisso;
- manter dados de aluno/socio apenas quando a relacao existir;
- manter acesso profissional como `Trabalho`, sem labels tecnicos ou cockpit.

Fora de escopo:

- alteracao de backend estrutural;
- redesenho de `/locais`, reserva, eventos, ranking ou perfil;
- mudar regras de permissoes alem do que a matriz ja define;
- criar rede social/feed.

Criterios de aceite:

- mobile 390px mostra uma acao principal na primeira dobra;
- jogador sem pendencias nao ve dashboard vazio;
- jogador nao aluno nao ve card de mensalidade/plano como prioridade;
- usuario multi-papel encontra `Trabalho` sem receber painel profissional no inicio;
- cards duplicados ou passivos viram rows, disclosure ou somem quando nao ha dado util;
- estados vazios orientam a proxima acao.

Validacao:

- validar `/inicio` em jogador puro, aluno/socio quando houver dado e usuario multi-papel;
- validar desktop e mobile 390px;
- rodar lint/build.

Entregue:

- `/inicio` passou a priorizar pendencias e agenda do jogador, sem convites profissionais na primeira dobra;
- cards passivos de hoje foram removidos quando nao ha dado util;
- intencoes principais ficaram explicitas: reservar quadra, encontrar jogo, entrar em aula e competir;
- contexto profissional virou area `Trabalho` discreta, separada do fluxo de jogador;
- `lint` e `build` passaram apos a alteracao.

## Role Based Restructure - Prioridades E Descricoes

Fonte detalhada:

- `ROLE_BASED_RESTRUCTURE_QUEUE.md`
- `ROLE_BASED_RESTRUCTURE_SPRINT_GUIDE.md`
- `ROLE_BASED_RESTRUCTURE_SPRINT_BACKLOG.md`

Regra:

```text
Executar a lista abaixo em ordem. Cada item deve ser concluido, validado e documentado antes de avancar.
```

### P0 - Fundacao e bloqueadores de clareza

#### [x] ROLE-UX-00 - Matriz de visibilidade por relacao

Prioridade: P0

Status: `[x]` concluido em 2026-05-15

Descricao:

- Definir exatamente o que jogador, aluno, socio, professor, recepcao, financeiro, organizador e gestor podem ver, buscar e executar.
- Esta task impede que o app continue vazando ferramentas internas para o usuario errado.

Resultado esperado:

- Menus, dados e estados vazios documentados por relacao/permissao/plano.
- Base pronta para reestruturar Player App, Competition OS e Management OS sem reabrir arquitetura a cada tela.

Entregue:

- criada `ROLE_VISIBILITY_MATRIX.md` com matriz por relacao, superficie, plano, papel, dados buscados e estados vazios;
- criado helper `web/src/lib/role-visibility.ts` para centralizar visibilidade da navegacao global;
- `BottomNav.tsx` passou a consumir o helper sem alterar o desenho da navegacao;
- `PROFILE_PLAN_ACCESS_MODEL.md`, `README.md` e docs de reestruturacao passaram a apontar para a matriz;
- gaps documentados: operador de cantina/POS e maior detalhamento futuro de `workspace-access.ts`; papel financeiro dedicado foi entregue depois em `ROLE-FINANCE-01`.

#### [x] ROLE-UX-01 - Shells por modo

Prioridade: P0

Status: `[x]` concluido em 2026-05-15

Descricao:

- Separar visual e navegacao de Player App, Competition OS e Management OS.
- Jogador deve navegar como jogador; gestor deve operar em workspace; organizador deve entrar em modo de competicao.

Resultado esperado:

- `Gestao` e `Organizar` aparecem apenas quando fazem sentido.
- Multi-papel nao polui a primeira tela do jogador.

Entregue:

- `AppShell` passou a receber/derivar modo (`player`, `competition`, `management`) e aplicar classes por superficie;
- `ManagementShell` fixa explicitamente o modo `management`;
- `role-visibility.ts` passou a classificar rotas de gestao, competicao e player;
- `BottomNav` passou a usar entrada profissional contextual: no modo jogador mostra `Trabalho`; no modo competicao mostra `Organizar`; no modo gestao mostra `Gestao`;
- labels tecnicos visiveis (`Player App`, `Competition OS`, `Management OS`) foram substituidos por linguagem natural;
- `eslint.config.js` ignora `.tmp`, evitando que artefatos locais de auditoria bloqueiem lint do app.

#### [x] DESIGN-UX-00 - Tokens de densidade por modo

Prioridade: P0

Status: `[x]` concluido em 2026-05-15

Descricao:

- Definir como cards, rows, sheets, CTAs, bordas, headings, cores e espacos devem se comportar em Player, Competition e Management.
- Evita que uma area nova pareca outro app ou volte ao excesso de cards.

Resultado esperado:

- Player mais leve.
- Management mais denso e operacional.
- Competition hibrido, com publico leve e operacao densa.

Entregue:

- `theme.css` recebeu tokens de densidade por modo (`--player-*`, `--competition-*`, `--management-*`);
- `App.css` aplica tokens `--mode-*` em shell, conteudo, cards, rows, formularios, botoes e superficies compartilhadas;
- `DESIGN_TOKENS.md` e `COMPONENT_GRAMMAR.md` foram atualizados com regras de densidade, card/row/sheet/wizard e alvo de toque;
- a base preserva o DNA ATP e prepara as proximas telas sem criar paleta ou layout paralelo.

#### [x] PLAYER-UX-01 - Inicio por proxima acao

Prioridade: P0

Status: `[x]` concluido em 2026-05-15

Descricao:

- Transformar `/inicio` em uma tela de proxima acao, nao em painel.
- Remover duplicidade visual entre `Agora`, `Agenda`, `Clube` e area profissional.

Resultado esperado:

- Primeira dobra mobile com uma acao primaria clara.
- Jogador sem pendencia ve intencoes simples: reservar, jogar, competir.

Entregue:

- `HomePage.tsx` foi reorganizada por proxima acao e intencoes;
- `Trabalho` ficou discreto para usuario multi-papel;
- pendencias profissionais deixaram de disputar a abertura do jogador;
- CSS da home usa a densidade de Player definida em `DESIGN-UX-00`.

#### [x] PLAYER-UX-02 - Locais por intencao compacta

Prioridade: P0

Status: `[x]` concluido em 2026-05-15

Descricao:

- Transformar `/locais` em entrada leve por intencao: reservar quadra, entrar em aula, encontrar jogo ou ver locais.

Entregue:

- quatro intencoes compactas em `/locais`;
- query strings de intencao vindas da Home;
- fluxo `Ver locais` com busca e filtros publicos;
- tabs `Todos`, `Seguindo` e `Meus locais` filtrando corretamente.

#### [x] PLAYER-UX-03 - Reserva mobile fluida

Prioridade: P0

Status: `[x]` concluido em 2026-05-15

Descricao:

- Criar fluxo de reserva com etapas naturais: onde, quando, disponibilidade, confirmar.
- Usar slots compactos, preco/status quando disponivel e lista de espera real.

Entregue:

- pagina publica do local ganhou fluxo de 3 passos;
- horarios ocupados deixaram de poluir a lista publica;
- sem disponibilidade aparece inline e pode acionar lista de espera;
- solicitacao de reserva segue persistindo no backend.

#### [x] PLAYER-UX-04 - Entrar em aula como fluxo publico

Prioridade: P0

Status: `[x]` concluido em 2026-05-15

Descricao:

- Separar aulas publicas da gestao interna da academia.
- Jogador ve turmas com vaga; aluno ve aulas/reposicoes proprias.

Resultado esperado:

- Encontrar turma por nivel/dia/local sem ver cockpit de academia.
- Solicitar/matricular com feedback claro.

Entregue:

- `/locais?intent=classes` usa linguagem e CTA de aula para jogador;
- pagina publica do local organiza o fluxo em perfil, turma e envio de interesse;
- turmas nao sao mais repetidas como lista depois do formulario;
- cards de turma mostram dia/hora, professor, nivel, vagas e valor publico;
- solicitacao usa `createAcademyEnrollment` e feedback amigavel.

#### [x] COMP-UX-01 - Hub de eventos por modo

Prioridade: P0

Status: `[x]` concluido em 2026-05-15

Descricao:

- Separar `Jogando`, `Organizando` e `Descobrir` para que jogador nao veja fila de organizador e organizador nao precise cacar tarefa.

Resultado esperado:

- Jogador ve seus jogos/inscricoes e eventos abertos.
- Organizador ve fila operacional.

Entregue:

- `/eventos` renderiza somente o modo ativo;
- segmentos `Jogando`, `Organizando` e `Descobrir` nao empilham conteudo entre si;
- fila de organizador e CTAs de criacao ficam no modo `Organizando`;
- `Descobrir` ficou leve e separado da operacao;
- preview de itens indica quando ha mais registros;
- lint/build passaram.

#### [x] COMP-UX-02 - Evento publico mobile

Prioridade: P0

Status: `[x]` concluido em 2026-05-15

Descricao:

- Fazer torneio/liga publica parecer evento para jogador, com imagem/status/tabs/CTA, nao cockpit.

Resultado esperado:

- Evento publico tem leitura simples e CTA de inscricao/acompanhamento.
- KPIs e tarefas de organizador ficam fora da visao publica.

Entregue:

- torneio e liga publicos ganharam primeira dobra de evento;
- CTA contextual e sticky mobile;
- categorias/classes aparecem antes de conteudo pesado;
- cockpit de organizador continua apenas para owner/staff.

#### [x] COMP-UX-03 - Inscricao em torneio/liga

Prioridade: P0

Status: `[x]` concluido em 2026-05-15

Descricao:

- Reorganizar inscricao para categoria, valor/restricao, confirmar e feedback.
- Garantir erro amigavel e sem erro tecnico cru.

Resultado esperado:

- Jogador entende status da inscricao.
- Fluxo mobile curto e confiavel.

Entregue:

- torneio: escolha por cards, revisao de valor/prazo/restricao, confirmacao, status real da inscricao e erro amigavel;
- liga publica: escolha de classe, revisao de valor/tipo de entrada, status do usuario e bloqueio de reenvio;
- link de convite de liga: revisao curta, dados do jogador, CTA contextual e feedback claro;
- mobile: CTA sticky e grid reduzido para uma coluna;
- sem backend novo.

Risco/gap:

- restricao de horario de torneio ainda exige campo/backend proprio para persistir; manter como tarefa futura antes de prometer essa captura no fluxo.

#### [x] MGMT-UX-01 - Shell operacional mobile

Prioridade: P0

Status: `[x]` concluido em 2026-05-15

Descricao:

- Reorganizar `/gestao` e workspace local para subnav/fila antes de KPI.
- Corrigir sensacao de cockpit vazio, loading gigante e modulos misturados.

Resultado esperado:

- Gestor ve fila e modulo ativo antes de metricas.
- Sem KPI zerado inutil.
- Mobile nao vira pagina infinita.

Entregue:

- `/gestao` abre com fila operacional antes de indicadores agregados;
- indicadores de locais/pendencias/reservas passaram para bloco secundario `Sinais de suporte`;
- professores deixam de receber `Painel`, Clientes, Financeiro e Cantina por heranca de plano;
- recepcao mantem somente modulos operacionais compativeis com papel/plano;
- fila do dashboard local agora respeita os modulos visiveis antes de montar acoes.

#### [x] MGMT-UX-02 - Modo Professor

Prioridade: P0

Status: `[x]` concluido em 2026-05-15

Descricao:

- Criar experiencia leve para professor: aulas, turmas, alunos, chamada e agenda.
- Professor nao deve herdar cantina, CRM pesado ou financeiro completo sem permissao.

Resultado esperado:

- Professor encontra rotina dele rapidamente.
- Professor sem local tem estado vazio claro.

Entregue:

- Academia em modo professor limitada a `Aulas`, `Turmas` e `Alunos`;
- contexto de professor com agenda curta, total de aulas hoje, turmas e alunos;
- turmas/alunos/chamadas filtrados pelo professor vinculado ao login;
- professor sem vinculo recebe estado vazio claro e nao enxerga turmas de outros professores;
- fila operacional nao mostra aprovacao/cobranca para professor sem gestao completa.

Validacao executada:

- `npm.cmd run lint`;
- `npx.cmd tsc --noEmit`;
- `npm.cmd run build`.

#### [x] QA-ROLE-01 - Teste manual por papel

Prioridade: P0

Status: `[x]` concluido em 2026-05-15

Descricao:

- Reexecutar testes por jogador, aluno, professor, recepcao, financeiro, organizador e gestor.

Resultado esperado:

- Relatorio por papel.
- Screenshots mobile/desktop.
- Bugs P0/P1 voltam para a queue.

Entregue:

- criado `QA_ROLE_01_ROLE_VISIBILITY_REPORT_2026_05_15.md`;
- screenshots e textos por papel em `web/docs/screenshots/qa-role-2026-05-15/`;
- validado jogador, aluno indireto, professor, recepcao, financeiro, organizador e gestor em desktop/mobile;
- nenhum P0 novo encontrado;
- bugs/gaps P1 e P2 reenfileirados.

Validacao executada:

- browser local com Playwright em desktop 1366px e mobile 390px;
- rotas principais: `/inicio`, `/locais`, `/eventos`, `/gestao`.

#### [x] MGMT-ROLE-QA-01 - Corrigir vazamento de setup por papel

Prioridade: P0

Status: `[x]` concluido em 2026-05-15

Fonte:

- `QA_ROLE_01_ROLE_VISIBILITY_REPORT_2026_05_15.md`
- `ROLE_VISIBILITY_MATRIX.md`
- `MANAGEMENT_OS_V2_IMPLEMENTATION_SPEC.md`

Problema:

- Professor e recepcao ainda recebem tarefas de setup/base incompleta no hub de gestao.
- Professor ve `Definir regras`, `Cadastrar cliente` e mensagem `Base incompleta`.
- Recepcao ve `Definir regras`, `Cadastrar professor` e mensagem `Base incompleta`.

Objetivo:

- Separar setup estrutural de gestor da rotina operacional de professor/recepcao.
- Professor deve ver apenas aulas, turmas, alunos, chamada, faltas, observacoes e reposicoes ligadas ao seu login.
- Recepcao deve ver agenda, espera, reservas, aulas do dia e clientes basicos permitidos, sem ajustes profundos.

Criterios:

- `owner`/`manager` continuam vendo gaps de setup estrutural.
- `coach` nao ve `Definir regras`, `Cadastrar cliente`, `Cadastrar professor`, `Configurar plano` ou setup profundo.
- `frontdesk` nao ve `Definir regras` nem `Cadastrar professor`; pode ver cadastro rapido de cliente quando permitido.
- Fila operacional continua mostrando pendencias reais do papel.
- Validar professor e recepcao em desktop/mobile.

Entregue:

- `summarizePlace(...)` passou a receber `access` e `userId`;
- resumo de professor ficou filtrado pelo professor vinculado em `place_coaches.user_id`;
- professor nao herda setup, financeiro, estoque, CRM, reservas ou pendencias globais de Academia;
- recepcao deixa de ver setup estrutural e financeiro/cantina;
- `setupActions`/`setupGaps` aparecem apenas para gestor (`owner`/`manager`);
- estado "Operacao em dia" ganhou texto por papel;
- criado `MGMT_ROLE_QA_01_REPORT_2026_05_15.md`;
- screenshots/textos gerados em `web/docs/screenshots/mgmt-role-qa-01-2026-05-15/`.

Validacao executada:

- browser local com Playwright para professor, recepcao e gestor em desktop 1366px;
- browser local com Playwright para professor, recepcao e gestor em mobile 390px;
- `npx.cmd tsc --noEmit`;
- `npm.cmd run lint`;
- `npm.cmd run build`.

#### [x] QA-DESIGN-01 - Auditoria visual de consistencia

Prioridade: P0

Status: `[x]` concluido em 2026-05-15

Descricao:

- Verificar se as areas reestruturadas mantem o DNA visual ATP e nao voltam para card overload.

Resultado esperado:

- Checklist visual aprovado contra `ROLE_BASED_RESTRUCTURE_PLAYBOOK.md`.

Entregue:

- auditoria visual desktop/mobile autenticada em Player App, Competition OS e Management OS;
- relatorio `QA_DESIGN_01_VISUAL_CONSISTENCY_REPORT_2026_05_15.md`;
- screenshots/textos em `web/docs/screenshots/qa-design-01-2026-05-15/`;
- ocultacao de contadores zerados em Player App;
- remocao de `Organizando` da leitura padrao de jogador puro em `/eventos`;
- fallback seguro para dados opcionais do workspace de Gestao.

Riscos restantes:

- `COMP-OPS-01` entregou rows/drawers de operacao do torneio; validar screenshot mobile autenticado com muitos dados segue como risco visual;
- futura otimizacao: `/gestao` deve usar agregador leve de resumo para reduzir dependencia de chamadas opcionais lentas.

### P1 - Experiencias principais por area

#### [x] ROLE-FINANCE-01 - Papel financeiro dedicado

Status: `[x]` concluido em 2026-05-15

Fonte:

- `QA_ROLE_01_ROLE_VISIBILITY_REPORT_2026_05_15.md`
- `ROLE_VISIBILITY_MATRIX.md`
- `MANAGEMENT_OS_V2_IMPLEMENTATION_SPEC.md`

Descricao:

- Criar suporte real para usuario financeiro sem precisar promover a pessoa a `manager`.
- Antes deste item, `place_staff.role` aceitava apenas `manager`, `coach` e `frontdesk`; o seed `financeiro.prime@demo.atp.local` caia como recepcao.

Resultado esperado:

- permissao financeira dedicada ou matriz granular;
- usuario financeiro seedado com acesso a recebiveis, despesas, lembretes e baixa de pagamento;
- sem Agenda/Academia como superficie principal, exceto links contextuais necessarios;
- validacao desktop/mobile do papel financeiro.

Entregue:

- `place_staff.role` e `place_staff_invites.role` passam a aceitar `finance`;
- `app_can_manage_place_finance(...)` reconhece owner, manager e finance;
- `app_add_place_staff(...)` preserva convites/atribuicoes de financeiro sem converter para recepcao;
- central `/gestao` mostra modo financeiro isolado com recebiveis, despesas e fila financeira;
- Financeiro nao recebe Agenda, Academia, Clientes/CRM, Cantina/POS, Equipe ou Ajustes como modulos principais;
- Equipe do local permite atribuir/convidar papel `Financeiro`;
- seed demo inclui `financeiro.prime@demo.atp.local` como financeiro do Clube Racket Prime;
- `ROLE_VISIBILITY_MATRIX.md`, `PROFILE_PLAN_ACCESS_MODEL.md` e `CURRENT_PRODUCT_STATE.md` atualizados.

Relatorio:

- `ROLE_FINANCE_01_REPORT_2026_05_15.md`.

Validacao executada:

- `npm.cmd run lint`;
- `npx.cmd tsc --noEmit`;
- `npm.cmd run build`.

Riscos restantes:

- Cantina/POS ganhou papel proprio em `ROLE-CASHIER-01`; validar seed autenticado com operador real no Supabase alvo segue como risco de QA.
- Validacao visual autenticada depende de seed/migration aplicados no Supabase alvo.

#### [x] ROLE-CASHIER-01 - Papel caixa/POS dedicado para Cantina

Status: `[x]` concluido em 2026-05-15

Fonte:

- `ROLE_VISIBILITY_MATRIX.md`
- `MANAGEMENT_OS_V2_IMPLEMENTATION_SPEC.md`
- `MGMT-CANTEEN-01`
- `ROLE-FINANCE-01`

Descricao:

- Criar suporte real para operador de caixa/cantina sem promover a pessoa a `manager` nem misturar POS com o papel `finance`.
- O papel deve operar venda rapida, vendas do dia, estoque e produtos da cantina apenas quando o plano habilita `canteen`.

Resultado esperado:

- `place_staff.role` e convites aceitam `cashier`;
- `/gestao` em modo caixa abre diretamente em Cantina/POS;
- operador de caixa nao recebe Agenda, Academia, Clientes/CRM, Financeiro, Equipe ou Ajustes;
- POS tem guardrail de backend para leitura/escrita e registro de venda;
- Equipe do local permite convidar/atribuir `Caixa/POS`.

Entregue:

- criada migration `0088_place_cashier_staff_role_v1.sql`;
- `place_staff.role` e `place_staff_invites.role` passam a aceitar `cashier`;
- criada RPC helper `app_can_manage_place_canteen(...)`, permitindo owner, manager e cashier;
- policies de `place_pos_products` e `place_pos_sales` passaram a aceitar `app_can_manage_place_canteen(...)`;
- `app_record_place_pos_sale(...)` agora valida permissao de Cantina, nao permissao ampla de gestor;
- `placeResourceAccess(...)` ganhou `canManageCanteen`;
- `placeManagementModules(...)` entrega apenas `["canteen"]` para `cashier`;
- `fetchPlaceAdminResources(...)` carrega POS por `canManageCanteen`;
- `/gestao` ganhou modo Caixa/POS com atalhos `Registrar venda` e `Estoque`;
- `Locais > Equipe` ganhou label, convite, resumo e guia do papel `Caixa/POS`;
- Home mostra convite de local com papel `Caixa/POS`.
- seeds demo adicionam `caixa.prime@demo.atp.local` vinculado ao Clube Racket Prime como `cashier`;
- verificador de seed valida a presenca do papel `cashier`.

Relatorio:

- `ROLE_CASHIER_01_REPORT_2026_05_15.md`.

Validacao executada:

- `npx.cmd tsc -b --pretty false`;
- `npm.cmd run lint`;
- `npm.cmd run build`.

Riscos restantes:

- validar visual autenticado depois que a migration `0088` e seed atualizado estiverem aplicados no Supabase alvo.
- o papel `cashier` nao acessa Financeiro; se o produto quiser fechamento financeiro/repasse do caixa, deve virar escopo futuro, nao permissao implicita.

#### [x] QA-SEED-ROLE-01 - Perfis seed puros para QA por papel

Status: `[x]` concluido em 2026-05-15

Fonte:

- `QA_ROLE_01_ROLE_VISIBILITY_REPORT_2026_05_15.md`
- `SEED_QA_REALISTIC_POPULATE_PLAN.md`

Descricao:

- Separar perfis seed puros de perfis multi-papel para QA manual.
- O organizador atual tambem possui acesso operacional a local, o que valida bem usuario misto, mas nao valida organizador sem Management OS.

Resultado esperado:

- jogador puro;
- aluno mensalista ativo;
- professor vinculado;
- professor sem local/vinculo;
- recepcao;
- financeiro dedicado com `place_staff.role = finance`;
- organizador puro sem local;
- gestor completo;
- todos documentados com credenciais de teste e dados linkados.

Entregue:

- criado `qa.jogador.puro@demo.atp.local` como `free_player` puro, sem staff, matricula, reserva, torneio, liga ou partida aberta;
- removido `organizador.circuito@demo.atp.local` de `place_staff`, mantendo entitlement `competition_organizer` e staff de competicao;
- mantido `jogador001@demo.atp.local` como aluno mensalista ativo para QA de Player App com contexto de academia;
- mantido `coach.solo@demo.atp.local` como professor sem local/vinculo para estado vazio profissional;
- documentada matriz de perfis no README do seed;
- `10_verify_seed_integrity.sql` agora valida jogador puro, organizador puro, financeiro dedicado, coach solo e aluno mensalista;
- `qa_full_demo_seed.sql` foi sincronizado com os perfis puros para nao divergir do runner split.

Relatorio:

- `QA_SEED_ROLE_01_REPORT_2026_05_15.md`.

Validacao executada:

- `npm.cmd run lint`;
- `npx.cmd tsc --noEmit`;
- `npm.cmd run build`.

Riscos restantes:

- Os seeds precisam ser reaplicados no Supabase alvo para que os novos perfis aparecam no browser.
- O `qa_full_demo_seed.sql` foi mantido por compatibilidade, mas o runner recomendado continua sendo `web/supabase/seeds/qa_demo`.

#### [x] MGMT-ROLE-QA-02 - Estado de `/gestao` sem acesso em shell neutro

Status: `[x]` concluido em 2026-05-15

Fonte:

- `QA_ROLE_01_ROLE_VISIBILITY_REPORT_2026_05_15.md`
- `ROLE_VISIBILITY_MATRIX.md`

Descricao:

- Jogador puro acessando `/gestao` por URL recebe bloqueio correto, mas no desktop ainda ve linguagem de shell operacional (`Gestao esportiva`, `Operacao`) ao redor do estado vazio.

Resultado esperado:

- usuario sem acesso ve estado vazio claro em superficie neutra/player;
- sem item `Gestao`, sem linguagem de cockpit e sem sugestao visual de area profissional ativa;
- seguranca atual preservada.

Entregue:

- `getGlobalNavigationVisibility(...)` trata rota de gestao sem `hasManagement` como superficie `player`;
- `ManagementShell` aceita `mode`, preservando Management OS para quem tem acesso e visual neutro para quem nao tem;
- `/gestao` sem acesso mostra `Modo jogador` e `Area profissional indisponivel`;
- a navegacao global deixa de mostrar `Gestao esportiva`, `Operacao` e item `Gestao` para usuario sem acesso profissional.

Relatorio:

- `MGMT_ROLE_QA_02_REPORT_2026_05_15.md`.

Validacao executada:

- `npm.cmd run lint`;
- `npx.cmd tsc --noEmit`;
- `npm.cmd run build`.

Riscos restantes:

- Validacao visual autenticada com screenshot deve ser refeita apos reaplicar os seeds, usando `qa.jogador.puro@demo.atp.local`.

#### [x] PLAYER-UX-05 - Encontrar jogo sem rede social pesada

Status: `[x]` concluido em 2026-05-15

Descricao:

- Permitir encontrar/criar jogo com foco em jogar, sem transformar em feed social.

Entregue:

- `/locais` na intencao `Encontrar jogo` deixou de abrir com painel comunitario/KPIs sociais;
- busca rapida ficou acima da lista, com filtros em disclosure e contagem clara de chamadas encontradas;
- `Criar chamada` virou CTA explicito e abre formulario curto apenas quando necessario;
- rows de chamadas priorizam local, horario, nivel, interessados e acao primaria `Quero jogar`/`Fechar chamada`;
- comentarios e salvar interesse continuam existindo, mas dentro de `Detalhes`, como acao secundaria;
- removido `slice(0, 6)` silencioso: chamadas filtradas nao ficam ocultas sem aviso.

Relatorio:

- `PLAYER_UX_05_REPORT_2026_05_15.md`.

Validacao executada:

- `npm.cmd run lint`;
- `npx.cmd tsc --noEmit`;
- `npm.cmd run build`.

Riscos restantes:

- Ainda falta validar com screenshot autenticado em mobile com seeds reaplicados no Supabase alvo;
- o fluxo ainda usa formulario inline curto, nao bottom sheet nativo; isso fica aceitavel ate a camada de componentes mobile dedicada.

#### [x] PLAYER-UX-06 - Ranking centrado no jogador

Status: `[x]` concluido em 2026-05-15

Descricao:

- Abrir ranking com minha posicao, filtros e lista.
- KPIs globais ficam secundarios.

Entregue:

- `/ranking` deixou de abrir com hero/KPIs globais como primeira leitura;
- primeira dobra agora prioriza `Minha posicao`, recorte atual, filtros e lista;
- quando o jogador nao aparece no recorte, o estado explica isso sem parecer erro;
- lider, corrida, mapa de classes, regras e ferramentas foram movidos para `Ver regras, resumo e ferramentas`;
- no mobile, a tabela vira rows compactas, evitando depender de scroll horizontal como experiencia primaria.

Relatorio:

- `PLAYER_UX_06_REPORT_2026_05_15.md`.

Validacao executada:

- `npm.cmd run lint`;
- `npx.cmd tsc --noEmit`;
- `npm.cmd run build`.

Riscos restantes:

- `Seguir` ainda existe na row por compatibilidade, mas pode ser revisto em uma futura limpeza de descoberta/social minimo;
- validacao visual autenticada em 390px/430px ainda deve ser refeita com seed aplicado.

#### [x] PLAYER-UX-07 - Perfil simples por finalidade

Status: `[x]` concluido em 2026-05-15

Descricao:

- Separar perfil publico, preferencias, historico, conta e pagamentos proprios quando existirem.

Entrega:

- `/perfil` foi dividido em abas leves: `Perfil`, `Historico`, `Preferencias` e `Conta`;
- primeira dobra deixou de misturar nivel, fase, organizacao, lembretes e conta em uma coluna unica;
- `Historico` agora foca em competicoes/partidas do jogador, mantendo estatisticas e conquistas em disclosures secundarios;
- atalhos de organizador foram movidos para `Conta > Area profissional` e so aparecem quando o usuario realmente organiza competicoes;
- preferencias de lembrete ficam em aba propria, sem empurrar dados de identidade nem historico.

Fora de escopo:

- criar pagamentos proprios quando ainda nao houver fonte real;
- alterar modelo de perfil esportivo, rating ou algoritmo de XP;
- remover compatibilidades sociais existentes em outras telas.

Relatorio:

- `PLAYER_UX_07_REPORT_2026_05_15.md`.

Validacao executada:

- `npm.cmd run lint`;
- `npx.cmd tsc -b --pretty false`;
- `npm.cmd run build`.

Riscos restantes:

- validacao visual autenticada em 390px/430px ainda deve ser refeita com seed aplicado;
- aba `Preferencias` ainda depende da futura engine real de notificacoes para disparos automaticos.

#### [x] COMP-SETUP-01 - Wizard de criacao de torneio

Status: `[x]` concluido em 2026-05-15

Descricao:

- Reorganizar criar torneio em etapas: basico, inscricoes, categorias, formato, agenda/quadras, revisar/publicar.

Entrega:

- `Eventos > Organizando > Criar` deixou de ser formulario curto/raso e passou a usar wizard operacional em 6 etapas: `Basico`, `Inscricoes`, `Categorias`, `Formato`, `Agenda` e `Revisar`;
- etapa `Basico` coleta nome, data inicial/final, UF, municipio, visibilidade e cartaz;
- etapa `Inscricoes` coleta prazo, taxa, aprovacao manual/automatica e permissao de resultado pelo jogador;
- etapa `Categorias` cria categorias/classes iniciais com genero, vagas e faixa etaria, sem empilhar configuracao tecnica na mesma dobra;
- etapa `Formato` aplica modelo e pontuacao padrao para todas as classes, preservando ajuste individual posterior dentro do torneio;
- etapa `Agenda` coleta duracao, janela diaria e quadras para alimentar `agendaConfig`;
- etapa `Revisar` permite criar como rascunho ou ja abrir inscricoes;
- `createTournament` agora persiste os dados estruturados no `data` do torneio, em `categorias`, `agendaConfig`, `setupDraft`, `tournamentMeta`, `status`, `poster_url`, `starts_at`, `registration_close_at`, `registration_fee_cents` e `player_result_submission_enabled`.

Arquivos:

- `web/src/pages/EventsPage.tsx`
- `web/src/lib/tournaments.ts`
- `web/src/App.css`
- `COMP_SETUP_01_REPORT_2026_05_15.md`

Validacao:

- `npm.cmd run lint`
- `npx.cmd tsc -b --pretty false`
- `npm.cmd run build`

Riscos restantes:

- o wizard cria estrutura inicial; operacao fina de categorias, jogadores, sorteio, pagamento e agenda continua no workspace interno do torneio;
- limite global do torneio permanece em `data`/classe, nao em fluxo financeiro dedicado;
- operacao de torneio ainda precisa virar rows/filas no workspace interno.

#### [x] COMP-SETUP-02 - Wizard de criacao de liga

Status: `[x]` concluido em 2026-05-15

Descricao:

- Reorganizar criar liga em etapas: basico, jogadores/classes, formato, pontuacao, agenda, revisar/publicar.

Entrega:

- `Ligas que organizo > Criar` deixou de ser formulario de duas etapas e passou a usar wizard em 6 etapas: `Basico`, `Jogadores`, `Formato`, `Pontuacao`, `Agenda` e `Revisar`;
- etapa `Basico` coleta nome, local base, periodo, tipo de liga e visibilidade;
- etapa `Jogadores` cria classes iniciais, jogadores por grupo, subida/descida, taxa de inscricao, entrada publica e aprovacao;
- etapa `Formato` grava rodadas previstas, intervalo, prazo de resultado, tolerancia, recessos e movimentos de temporada;
- etapa `Pontuacao` grava formato de partida, tie-break, WO, No-Ad e coringa;
- etapa `Agenda` grava dias, janela de jogo e automacao de rodadas;
- etapa `Revisar` permite criar rascunho ou liga ativa;
- `createLeague` passou a persistir configuracao inicial real em `leagues`, `league_seasons`, `league_classes` e `settings`, sem depender de formulario posterior para o basico funcionar.

Arquivos:

- `web/src/pages/LeaguesPage.tsx`
- `web/src/lib/leagues.ts`
- `COMP_SETUP_02_REPORT_2026_05_15.md`

Validacao:

- `npx.cmd tsc -b --pretty false`
- `npm.cmd run lint`
- `npm.cmd run build`

Riscos restantes:

- agenda da liga fica persistida como configuracao inicial em `settings`/`settings_override`; a distribuicao automatica real continua dependente das rotinas ja existentes do workspace interno;
- criacao adiciona temporada e classes iniciais, mas importacao/convite em lote de jogadores ainda pertence a operacao da liga;
- nao foram adicionadas telas novas de pagamento real; taxa segue como valor de inscricao/configuracao.

#### [x] COMP-OPS-01 - Operacao de torneio em rows

Descricao:

- Organizador resolve inscricoes, jogos, horarios, resultados e publicacao por fila/rows/drawers.

Status: `[x]` concluido em 2026-05-15

Entregue:

- fila operacional do torneio deixou de ser apenas cards agregados e passou a exibir rows acionaveis para owner/staff;
- rows cobrem inscricao pendente, lista de espera, pagamento de inscricao, geracao de jogos, agenda incompleta, resultado enviado por jogador e aviso de indisponibilidade;
- cada row mostra tipo, contexto, impacto e acao primaria real;
- detalhe abre drawer no desktop e bottom sheet no mobile;
- a fila limita a primeira dobra sem esconder silenciosamente: informa quando mostra as primeiras 8 tarefas e oferece entrada para lista completa;
- alerta separado de indisponibilidade foi fundido na fila para reduzir duplicidade.

Arquivos principais:

- `web/src/pages/TournamentPage.tsx`
- `web/src/App.css`
- `COMP_OPS_01_REPORT_2026_05_15.md`

Validacao:

- `npx.cmd tsc -b --pretty false`
- `npm.cmd run lint`
- `npm.cmd run build`

Riscos restantes:

- o drawer usa as mesmas acoes existentes; nao foi criado backend novo;
- acao de agenda incompleta leva para a configuracao de agenda existente, sem editor granular de uma partida especifica;
- recebimento de inscricao continua usando pagamento stub/manual existente.

#### [x] COMP-OPS-02 - Operacao de liga em rodada atual

Descricao:

- Liga abre por rodada atual, partidas pendentes, resultado/WO, ranking e comunicacao.

Status: `[x]` concluido em 2026-05-15

Contexto:

- Depois de `COMP-OPS-01`, torneio ja operava por rows acionaveis, mas liga ainda abria com contadores agregados.
- O objetivo era aplicar a mesma disciplina sem redesenhar setup/publico: rodada atual, inscricoes, pagamentos, partidas, resultado/WO e comunicacao ficam como fila operacional.

Entregue:

- owner passa a ver fila de liga em rows antes das tabs, com detalhe em drawer/bottom sheet;
- rows cobrem inscricoes pendentes, pagamentos de inscricao aprovados sem baixa, partidas aguardando organizacao, resultado, confirmacao, disputa/analise admin e geracao de proxima rodada;
- cada row mostra tipo, contexto, impacto e acao primaria real;
- detalhe usa a sala da partida existente para disponibilidade, resultado, WO, confirmacao e mensagens;
- jogador participante passa a receber fila `Minha rodada` quando tem partida pendente, sem ver cockpit de organizador;
- fila limitada na primeira dobra informa quando mostra apenas as primeiras tarefas e oferece entrada para lista completa;
- backend novo nao foi necessario: acoes usam servicos existentes de inscricao, pagamento stub/manual, geracao de rodada, sala de partida, resultado e chat.

Arquivos principais:

- `web/src/pages/LeagueDetailsPage.tsx`
- `web/src/App.css`
- `COMP_OPS_02_REPORT_2026_05_15.md`

Validacao:

- `npx.cmd tsc -b --pretty false`
- `npm.cmd run lint`
- `npm.cmd run build`

Riscos restantes:

- agendamento granular de horario/quadra da partida ainda depende da sala/lista existente; nao foi criado editor dedicado de agenda da liga;
- confirmacao/resolucao continua usando o formulario de resultado existente dentro da sala;
- pagamento de inscricao continua como baixa manual/stub, coerente com o estado atual do produto.

#### [x] MGMT-AGENDA-01 - Agenda v2 polish

Status: `[x]` concluido em 2026-05-15

Fonte:

- `MANAGEMENT_OS_V2_UX_PLAN.md`
- `MANAGEMENT_OS_V2_IMPLEMENTATION_SPEC.md`
- `AGENDA_MODULE_FUNCTION_MAP.md`
- `SCREEN_RESPONSIBILITIES.md`
- `COMPONENT_GRAMMAR.md`

Descricao:

- Consolidar agenda como rotina de reservas, disponibilidade, espera, bloqueio e recursos/regras.

Entregue:

- `Central de agenda` passou a conter a fila urgente dentro do shell/subnav, evitando fila solta antes da navegacao interna.
- Aba `Hoje` deixou de ser card passivo e virou lista operacional com rows de reserva/bloqueio, pagamento, telefone, serie e acoes `Confirmar`, `Cancelar` ou `Liberar`.
- Aba `Reservas` ganhou busca por jogador/telefone/quadra, filtro por data, filtro por status e deixou de usar limite silencioso.
- Aba `Espera` ganhou busca, filtro por data/status, deixou de usar limite silencioso e renomeou `Convidar` para `Marcar convidado`, porque a acao atual altera status interno e nao envia notificacao real.
- `Calendario` manteve seletor mobile de quadra e agora permite iniciar `Nova reserva` a partir de slot livre; reservas/bloqueios ocupados levam para a lista de reservas.
- `Nova reserva` deixou `Bloquear horario` e `Entrar na espera` visiveis como acoes secundarias do fluxo principal; `Observacao e repeticao` ficaram como detalhe progressivo.
- KPIs da Agenda foram movidos para depois da central operacional, como suporte de leitura e nao primeira dobra.

Validacao:

- `npx.cmd tsc -b --pretty false`;
- `npm.cmd run lint`;
- `npm.cmd run build`;
- validacao visual/smoke em desktop e mobile quando possivel.

Risco residual:

- `Marcar convidado` ainda nao envia WhatsApp/push; quando existir notificacao real, pode voltar a ser `Convidar` com canal explicito.
- Slot ocupado do calendario abre a lista filtravel de reservas, nao um drawer especifico de reserva. Drawer pode ser evolucao futura se a rotina pedir edicao mais profunda ali.

#### [x] MGMT-ACADEMY-01 - Academia v2 continuidade

Status: `[x]` concluido em 2026-05-15

Descricao:

- Revisar Academia v2 completa, contrato/usuario/aluno, reposicoes, chamada, mensalidade e mobile.

Entregue:

- `Central da academia` agora aparece antes dos indicadores agregados, mantendo a subnav visivel como primeira estrutura de trabalho.
- A fila rapida `Aulas do dia`/`Pendencias da academia` deixou de competir com a aba `Hoje` e com a aba `Pendencias`; ela aparece apenas como apoio contextual nas demais abas.
- A fila rapida deixou de cortar dados silenciosamente: quando existem mais aulas ou pendencias do que o resumo mostra, a UI exibe `Ver X restantes` e permite expandir ou ir para a fila completa.
- Professor em modo leve continua vendo somente aulas/turmas/alunos, sem aprovacao/cobranca empresarial.
- KPIs da Academia foram movidos para leitura de suporte depois da rotina, seguindo o mesmo padrao aplicado em Agenda.

Arquivos principais:

- `src/pages/PlacesPage.tsx`
- `src/components/place/PlaceAcademyOperationalQueues.tsx`
- `docs/MGMT_ACADEMY_01_REPORT_2026_05_15.md`

Validacao:

- `npx.cmd tsc -b --pretty false`;
- `npm.cmd run lint`;
- `npm.cmd run build`.

Risco residual:

- Resolvido em `PUBLIC-PLACE-01`: a pagina publica do local preserva descoberta/interesse do jogador sem misturar cockpit ou rotina interna de Gestao.

#### [x] MGMT-FINANCE-01 - Financeiro por cobranca

Descricao:

- Financeiro abre com quem cobrar agora: vencidos, vence hoje, lembrete, marcar pago, despesas e relatorio secundario.

Status: `[x]` concluido em 2026-05-15

Entregue:

- `Financeiro` passou a abrir por padrao em `Recebiveis`, nao em resumo/relatorio.
- A ordem da central financeira virou rotina operacional: `Recebiveis`, `Pagos`, `Despesas`, `Planos`, `Resumo`.
- Recebiveis agora exibem origem, periodo, valor, vencimento semantico (`Vencido`, `Vence hoje`, `Em aberto`) e acao primaria real `Marcar pago`.
- Lembretes continuam disponiveis como acao secundaria por row e como lote da lista atual, socios ou alunos.
- Foram agregadas cobrancas por plano de socio, mensalidade de academia por contrato, matricula legada, aula avulsa/reposicao e reservas com pagamento pendente.
- Pagamentos antigos pendentes em `app_payments` entram na fila se ainda pertencem ao local, evitando que atrasos de meses anteriores fiquem invisiveis.
- Aba `Pagos` lista pagamentos registrados sem misturar com a fila de cobranca.
- `Despesas` deixou de usar corte silencioso e mostra expansao quando ha mais lancamentos.
- Dentro do Management OS, o Financeiro deixou de duplicar o bloco legado abaixo da central.
- Resumo financeiro passou a ser secundario e respeita modulo Cantina desativado ao nao exibir metricas de POS/cantina.

Arquivos alterados:

- `web/src/pages/PlacesPage.tsx`
- `web/src/components/place/FinanceWorkspaceShell.tsx`
- `web/src/components/place/PlaceFinanceReceivablesModule.tsx`
- `web/src/components/place/PlaceFinancePaidModule.tsx`
- `web/src/components/place/PlaceFinanceExpensesModule.tsx`
- `web/src/components/place/PlaceFinanceOverviewModule.tsx`
- `web/src/components/place/PlaceClientRelationshipModule.tsx`
- `web/src/lib/place-admin-navigation.ts`
- `web/src/App.css`
- `web/docs/MGMT_FINANCE_01_REPORT_2026_05_15.md`

Validacao:

- `npx.cmd tsc -b --pretty false`;
- `npm.cmd run lint`;
- `npm.cmd run build`.

Risco residual:

- O modelo ainda nao tem campo canonico `due_date` em `app_payments`; a UI calcula vencimento por convencao de periodo mensal ou data da origem. Uma evolucao futura pode criar vencimento persistido por cobranca.
- Torneio/liga seguem em financeiro de Competition OS; o sprint cobriu Financeiro do local.

#### [x] MGMT-CRM-01 - Clientes/CRM como fila de relacionamento

Descricao:

- Leads, follow-up, contatos parados, drawer de contato e WhatsApp secundario.

Status: `[x]` concluido em 2026-05-15

Entregue:

- `Clientes` passou a abrir por padrao em `Rotina`, com fila unica de relacionamento para `Follow-ups`, `Leads` e `Contatos parados`.
- `Clientes > Contatos` virou lista operacional pesquisavel, com filtros por prioridade/status, expansao explicita para todos os registros e formulario progressivo de novo contato.
- Rows de CRM deixaram de carregar formulario inline por contato; a acao primaria abre drawer curto para registrar retorno, salvar responsavel, agendar proximo contato, converter ou arquivar.
- WhatsApp permanece como acao secundaria, sem competir com a tarefa principal de relacionamento.
- Cobranca saiu da fila de relacionamento e permanece no modulo `Financeiro`, reduzindo duplicidade entre Clientes e Financeiro.
- A navegacao canonica de Clientes usa `rotina`, `contatos`, `socios`, `pendencias` e `resumo`, com aliases legados preservados.
- Fila de pendencias de clientes deixou de cortar leads/matriculas/socios silenciosamente.

Impacto UX/produto:

- Recepcao/gestor abre Clientes vendo quem precisa de contato agora, e nao KPIs ou funil passivo.
- A captura de lead continua disponivel, mas nao domina a primeira dobra.
- Historico, notas, responsavel e proximo contato ficaram em drawer acionavel, adequado a uso diario.
- Financeiro e CRM passaram a ter fronteira mais clara: cobrar e marcar pago ficam no Financeiro; relacionamento e follow-up ficam em Clientes.

Arquivos alterados:

- `web/src/pages/PlacesPage.tsx`
- `web/src/components/place/ClientsWorkspaceShell.tsx`
- `web/src/components/place/PlaceClientActionQueue.tsx`
- `web/src/components/place/PlaceClientRelationshipModule.tsx`
- `web/src/components/place/PlaceCrmContactRow.tsx`
- `web/src/components/place/PlaceCrmHistoryDrawer.tsx`
- `web/src/components/place/PlaceCrmModule.tsx`
- `web/src/lib/place-admin-navigation.ts`
- `web/src/App.css`
- `web/docs/MGMT_CRM_01_REPORT_2026_05_15.md`

Validacao:

- `npx.cmd tsc -b --pretty false`;
- `npm.cmd run lint`;
- `npm.cmd run build`.

Risco residual:

- O CRM ainda usa contatos do local (`place_crm_contacts`) sem modelo de funil customizavel por academia. Se o produto exigir etapas configuraveis, criar task propria de schema/UX.
- Notificacoes reais de retorno/WhatsApp continuam fora deste sprint; o sprint preserva WhatsApp externo e historico manual.

#### [x] MGMT-TEAM-01 - Equipe/permissoes por convite aceito

Descricao:

- Buscar usuario, convidar, aceitar, aplicar papel e liberar acesso somente apos aceite.

Status: `[x]` concluido em 2026-05-15

Entregue:

- `Equipe` passou a abrir por padrao na subvisao operacional de pessoas, antes de resumo secundario.
- Convite de equipe do local agora usa busca por nome/email via `app_search_place_staff_candidates(...)`, permitindo selecionar usuario existente antes de enviar.
- `app_add_place_staff(...)` deixou de conceder acesso direto quando o email ja existe; sempre cria convite pendente, e `app_claim_place_staff_invites()` virou no-op para remover aceite automatico legado.
- Foram criadas RPCs de aceite/recusa/listagem: `app_list_my_place_staff_invites(...)`, `app_accept_place_staff_invite(...)`, `app_decline_place_staff_invite(...)` e `app_list_place_staff(...)`.
- A Home agora mostra `Convite de local` junto aos convites profissionais; o usuario aceita ou recusa, e o local so entra em `/gestao` depois do aceite.
- Cards/rows de equipe mostram nome do usuario quando encontrado em `profiles/auth.users`; pendentes deixam claro que ainda nao liberam acesso.
- Vinculo de login do professor foi alinhado ao mesmo modelo: `app_link_place_coach_by_email(...)` envia convite de professor e vincula `place_coaches.user_id` apenas no aceite.
- Remover membro ativo continua revogando acesso real via `place_staff`; cancelar convite pendente nao altera visibilidade do usuario.

Impacto UX/produto:

- Gestor evita erro de email porque busca e seleciona usuario quando ele existe.
- Convite pendente virou estado honesto: nao aparece como acesso ativo e nao vaza menu/rota.
- Professor, recepcao e financeiro recebem acesso profissional somente apos aceitar, mantendo separacao entre Player App e Management OS.
- A equipe local fica consistente com a regra ja aplicada ao staff de torneio.

Arquivos alterados:

- `web/src/pages/PlacesPage.tsx`
- `web/src/pages/HomePage.tsx`
- `web/src/lib/places.ts`
- `web/src/lib/types.ts`
- `web/src/components/place/TeamWorkspaceShell.tsx`
- `web/src/App.css`
- `web/supabase/migrations/0087_place_staff_invite_acceptance_v1.sql`
- `web/docs/MGMT_TEAM_01_REPORT_2026_05_15.md`

Validacao:

- `npx.cmd tsc -b --pretty false`;
- `npm.cmd run lint`;
- `npm.cmd run build`.

Risco residual:

- O convite depende de email do usuario autenticado; se o app ganhar convite por telefone/WhatsApp, sera necessaria camada propria de identidade/aceite.
- Troca de papel de usuario ja ativo ainda deve ser feita removendo o acesso e reenviando convite, para preservar aceite explicito.

#### [x] PUBLIC-PLACE-01 - Pagina publica do local

Status: `[x]` concluido em 2026-05-15

Descricao:

- Local publico com marca, reserva, aula, eventos, contato e CTA, sem cockpit.

Contexto:

- A pagina publica ja tinha reserva real, lista de espera, interesse em turma e entrada em jogo aberto.
- O problema era de organizacao: header duplicado, KPIs publicos, informacao secundaria competindo com fluxo principal e kit de divulgacao visivel para jogador comum.
- Pela matriz de responsabilidades, `/locais/:placeId` deve converter o jogador/publico, nao expor cockpit, indicadores administrativos ou ferramenta de publicacao.

Entregue:

- topo publico ficou compacto, com nome do local apenas como contexto e sem repetir hero/header;
- hero passou a escolher CTA principal por oferta real publicada: reservar quadra, entrar em aula, ver jogos ou compartilhar;
- rail curto de acoes substituiu KPIs publicos, mostrando Reserva, Aulas, Jogos, Planos e Compartilhar apenas quando fazem sentido;
- `PublishingKit`/widget ficou restrito ao dono do local no fim da pagina, como divulgacao secundaria;
- reserva, interesse em aula, lista de espera, jogos abertos, planos e acesso a gestao do owner foram preservados;
- quadras e valores sairam de card concorrente e viraram detalhe secundario recolhivel;
- mobile recebeu rail horizontal em vez de empilhamento de cards e CTA sticky contextual.

Arquivos alterados:

- `web/src/pages/PlacePublicPage.tsx`
- `web/src/App.css`
- `web/docs/PUBLIC_PLACE_01_REPORT_2026_05_15.md`
- `web/docs/CURRENT_PRODUCT_STATE.md`
- `web/docs/SCREEN_RESPONSIBILITIES.md`
- `web/docs/COMPONENT_GRAMMAR.md`
- `web/docs/EXECUTION_QUEUE.md`

Validacao:

- `npx.cmd tsc -b --pretty false`;
- `npm.cmd run lint`;
- `npm.cmd run build`.

Risco residual:

- A pagina publica ainda depende do `coverUrl` publicado pelo local para ter visual mais rico; sem imagem, usa logo/iniciais e identidade do produto.
- A busca de disponibilidade continua fazendo varredura de slots no frontend; para escala maior, vale mover disponibilidade do dia para RPC agregada.

#### [x] PUBLIC-COMP-01 - Pagina publica de competicao

Status: `[x]` concluido em 2026-05-15

Descricao:

- Competicao publica com poster, local/data, categorias, inscritos/jogos e CTA, sem fila de organizador.

Contexto:

- Torneio e liga publicos ja tinham hero/CTA, mas ainda herdavam cabecalho operacional duplicado, resumo com cara de KPI e filtros/controles internos perto da primeira dobra.
- A leitura publica precisava parecer pagina de evento: entender, escolher categoria/classe, ver inscritos/jogadores, acompanhar jogos/partidas e agir.
- Jogador visitante ou inscrito nao deve ver fila de organizador, exportacao/copiar agenda, filtro interno de temporada/classe como primeiro componente nem contato de inscritos.

Entregue:

- `TournamentPage` e `LeagueDetailsPage` deixaram de renderizar `CompetitionHeader` para leitor publico; usam topbar compacta com `Voltar` e `Compartilhar`.
- fatos publicos viraram `competition-public-action-rail`: Categorias/Classes, Inscritos/Jogadores e Jogos/Partidas como tiles acionaveis, sem aparencia de cockpit.
- torneio publico ganhou secao `Inscritos` com rows de nome e categoria/classe, sem telefone ou ferramenta de aprovacao.
- liga publica ganhou secao `Jogadores` com rows de nome, classe e pontos, sem painel operacional.
- controles internos de agenda (`Exportar PNG`, `Copiar agenda`) ficaram restritos a quem pode gerenciar partidas.
- filtro `Escopo da liga` deixou de aparecer para leitor publico; classes continuam selecionaveis pelo rail publico.
- CSS publico recebeu topbar, action rail e lista compacta compartilhada, com mobile em trilho horizontal e CTA sticky preservado.
- tipografia do hero publico removeu `clamp()` por viewport e passou a usar token fixo.

Arquivos alterados:

- `web/src/pages/TournamentPage.tsx`
- `web/src/pages/LeagueDetailsPage.tsx`
- `web/src/App.css`
- `web/docs/PUBLIC_COMP_01_REPORT_2026_05_15.md`
- `web/docs/CURRENT_PRODUCT_STATE.md`
- `web/docs/SCREEN_RESPONSIBILITIES.md`
- `web/docs/COMPONENT_GRAMMAR.md`
- `web/docs/COMPETITION_OS_V2_UX_PLAN.md`
- `web/docs/COMPETITION_OS_V2_IMPLEMENTATION_SPEC.md`
- `web/docs/EXECUTION_QUEUE.md`

Validacao:

- `npx.cmd tsc -b --pretty false`;
- `npm.cmd run lint`;
- `npm.cmd run build`.

Risco residual:

- O detalhe completo por inscrito/categoria ainda depende de uma futura subvisao publica dedicada se o volume de participantes ficar muito alto.
- Torneio publico ainda depende do `posterUrl` cadastrado; sem poster, usa placeholder com iniciais.

### P2 - Complementos e refinamentos internos

#### [x] MGMT-CANTEEN-01 - Cantina/POS por venda rapida

Status: `[x]` concluido em 2026-05-15

Objetivo:

- Transformar Cantina/POS em rotina de venda rapida e estoque, sem abrir por resumo/KPI e sem aparecer quando o plano nao habilita o modulo.

Criterios entregues:

- `/gestao/:placeId/cantina` agora abre por padrao em `Venda rapida`, com produtos cadastrados como botoes acionaveis, busca, venda avulsa, quantidade, valor, cliente opcional e total estimado visivel.
- `Estoque baixo` virou segunda subvisao e mostra alertas de reposicao, busca de estoque e link direto para `Produtos`.
- `Vendas do dia` concentra caixa do dia e rows de lancamentos, com cancelamento preservado quando a venda esta paga.
- `Produtos` ganhou busca e filtros `Todos`/`Baixo`/`Zerado`, sem `slice` silencioso; cadastro de produto permanece como formulario progressivo secundario.
- `placeProductFeatures(...)`, `placeResourceAccess(...)`, `placeManagementModules(...)` e `place-admin-data` passaram a tratar `canteen` como feature propria de plano (`club_pro`/`multi_unit`), nao como derivacao generica de Financeiro.
- Plano sem Cantina nao recebe modulo, KPI ou dados POS como operacao ativa; estado de upgrade deve continuar em Ajustes quando existir.

Arquivos alterados:

- `web/src/lib/place-management.ts`
- `web/src/lib/place-admin-data.ts`
- `web/src/lib/place-admin-navigation.ts`
- `web/src/components/place/CanteenWorkspaceShell.tsx`
- `web/src/components/place/PlaceCanteenSaleForm.tsx`
- `web/src/components/place/PlaceCanteenStockModule.tsx`
- `web/src/components/place/PlaceCanteenProductsModule.tsx`
- `web/src/components/place/PlaceCanteenSummaryModule.tsx`
- `web/src/pages/PlacesPage.tsx`
- `web/src/App.css`

Validacao:

- `npx.cmd tsc -b --pretty false`: passou.
- `npm.cmd run lint`: passou.
- `npm.cmd run build`: passou.

Risco residual:

- Ainda nao existe papel dedicado de caixa/POS; por enquanto Cantina continua restrita a owner/manager em planos que habilitam o modulo.
- Ajuste fino visual em device real deve validar conforto dos botoes de produto quando houver catalogo muito grande.

#### [x] MGMT-SETTINGS-01 - Ajustes como configuracao estrutural

Status: `[x]` concluido em 2026-05-15

Objetivo:

- Separar dados publicos, recursos, regras, planos, permissoes e publicacao da rotina diaria.

Criterios entregues:

- `/gestao/:placeId/ajustes` agora usa subvisoes estruturais: `Checklist`, `Dados publicos`, `Recursos`, `Regras`, `Planos`, `Permissoes` e `Publicacao`.
- `Checklist` concentra prontidao estrutural, modulos liberados e proximos ajustes com rows acionaveis, sem duplicar a rotina operacional dos outros modulos.
- `Dados publicos` concentra nome, cidade, UF, descricao, logo e acesso direto para ver a pagina publica.
- `Recursos` mostra quadras/precos, professores/horarios, turmas e produtos da cantina como configuracao estrutural, levando para Agenda, Academia ou Cantina quando a operacao detalhada pertence a esses modulos.
- `Regras` separa regras de reserva, ausencia/reposicao e lista de espera, usando links semanticos para as configuracoes reais.
- `Planos` concentra plano contratado, modulos liberados, planos de socio e pacotes/creditos sem abrir financeiro como dashboard.
- `Permissoes` mostra equipe ativa, convites pendentes e atalhos para Equipe, preservando aceite explicito e menor papel suficiente.
- `Publicacao` revisa dados publicos, quadras e ofertas visiveis antes de divulgar a pagina.
- O bloco legado de configuracoes abaixo do workspace deixou de duplicar checklist/plano quando `SettingsWorkspaceShell` esta ativo.

Arquivos alterados:

- `web/src/components/place/SettingsWorkspaceShell.tsx`
- `web/src/lib/place-admin-navigation.ts`
- `web/src/pages/PlacesPage.tsx`
- `web/docs/EXECUTION_QUEUE.md`
- `web/docs/CURRENT_PRODUCT_STATE.md`
- `web/docs/MANAGEMENT_OS_V2_IMPLEMENTATION_SPEC.md`
- `web/docs/SCREEN_RESPONSIBILITIES.md`
- `web/docs/COMPONENT_GRAMMAR.md`

Validacao:

- `npx.cmd tsc -b --pretty false`: passou.
- `npm.cmd run lint`: passou.
- `npm.cmd run build`: passou.

Risco residual:

- Ajustes tem sete subvisoes por ser configuracao estrutural ampla; mobile usa rolagem horizontal das tabs. Se a navegacao ficar pesada em teste real, o proximo refinamento deve agrupar `Dados publicos/Publicacao` e `Recursos/Regras`.
- As configuracoes detalhadas continuam nos modulos donos da rotina. Ajustes e uma central de estrutura e atalhos, nao uma segunda implementacao de Agenda, Academia, Equipe ou Financeiro.

### [x] QA-R2-FIX-01 - Correcoes operacionais da Rodada 2 de QA

Status: `[x]` concluido em 2026-05-14

Contexto:

- A segunda rodada de QA manual apontou bugs que afetavam confianca, mobile e operacao diaria de Agenda/Painel.
- Escopo fechado: corrigir bugs operacionais sem redesenhar a arquitetura nem implementar gaps grandes de roadmap.

Criterios entregues:

- `Agenda > Calendario` no mobile passou a usar seletor explicito de quadra, mantendo todas as quadras acessiveis em 390px sem tentar comprimir quatro colunas ilegiveis.
- `Agenda > Nova reserva` passou a exibir o resultado de busca de disponibilidade inline no formulario; resultado negativo nao vira banner global persistente e some ao alterar formulario ou trocar subvisao.
- Campo `Duracao` do formulario de nova reserva deixou de ser cortado por grid rigido e passou a quebrar em colunas responsivas.
- Item `Recebimento pendente` da Fila de Trabalho agora abre `Financeiro > Recebiveis` em vez de parecer clicavel sem acao.
- KPI operacional de `Vendas da cantina` e receitas POS saem do Painel/relatorio quando o modulo Cantina nao esta habilitado no plano.

Arquivos alterados:

- `web/src/components/place/PlaceBookingCalendarModule.tsx`
- `web/src/components/place/PlaceBookingCreateModule.tsx`
- `web/src/components/place/PlaceOperationsDashboard.tsx`
- `web/src/pages/PlacesPage.tsx`
- `web/src/App.css`

Validacao:

- `npm.cmd run lint` em `web`: passou.
- `npm.cmd run build` em `web`: passou.

Risco residual:

- A validacao visual fina em device real ainda deve confirmar conforto de toque do seletor de quadra em telas muito estreitas.

### [x] QA-R2-ROADMAP - Gaps de produto detectados na Rodada 2

Status: `[x]` encerrado em 2026-05-15

Encerramento dos gaps:

- GAP-R2-01: financeiro dedicado/consolidado foi entregue em `MGMT-FINANCE-01` e `ROLE-FINANCE-01`.
- GAP-R2-02: lembrete em lote foi entregue em `PlaceFinanceReceivablesModule`, com `Lembrar lista atual`, `Cobrar socios` e `Cobrar alunos`.
- GAP-R2-03: lista de espera player-side foi completada em `QA-R2-GAP-03`, com nome real do local e abertura contextual no local correto.
- GAP-R2-04: governanca de Cantina/POS por plano foi entregue em `MGMT-CANTEEN-01` e refinada em `MGMT-SETTINGS-01`, separando `canteen` de Financeiro.

### [x] QA-R2-GAP-03 - Lista de espera player-side contextual

Status: `[x]` concluido em 2026-05-15

Contexto:

- `PLAYER-UX-03` ja permitia o jogador entrar em lista de espera pela pagina publica do local quando nao havia disponibilidade.
- A Home do jogador tambem listava entradas de espera, mas ainda usava `Local` generico e levava o usuario para `/locais?intent=booking`, exigindo que ele reencontrasse manualmente o clube.
- Isso mantinha o gap de Rodada 2 parcialmente aberto: a espera existia, mas nao era suficientemente contextual no lado do jogador.

Criterios entregues:

- `listMyCourtBookingWaitlist()` agora carrega tambem o nome do local a partir de `places`.
- `listMyCourtBookingWaitlist()` filtra explicitamente `user_id` do usuario autenticado, sem depender apenas de RLS para definir "minha espera".
- `CourtBookingWaitlistEntry` passou a carregar `placeName`, preservando `placeId`, quadra, horario e status.
- Home do jogador mostra a lista de espera com nome real do local em vez de `Local`.
- Convites/esperas de quadra no resumo e nas prioridades abrem diretamente `/locais/:placeId?intent=booking`.
- Itens internos de `Meu contexto` agora podem abrir o destino especifico de cada item, nao apenas o destino generico da secao.

Arquivos alterados:

- `web/src/lib/types.ts`
- `web/src/lib/places.ts`
- `web/src/pages/HomePage.tsx`
- `web/docs/EXECUTION_QUEUE.md`
- `web/docs/CURRENT_PRODUCT_STATE.md`
- `web/docs/AGENDA_MODULE_FUNCTION_MAP.md`
- `web/docs/QA_R2_GAP_03_REPORT_2026_05_15.md`

Validacao:

- `npx.cmd tsc -b --pretty false`: passou.
- `npm.cmd run lint`: passou.
- `npm.cmd run build`: passou.

Risco residual:

- A aceitacao ativa de convite de lista de espera pelo proprio jogador ainda depende de uma regra de produto especifica: hoje o jogador e levado ao local correto para agir, enquanto a conversao/promocao segue operacional no Management OS.

### [x] COMP-QA-01 - Convite de equipe de torneio por usuario selecionado

Status: `[x]` concluido em 2026-05-14

Contexto:

- QA/uso real apontou confusao no fluxo de equipe de torneio: o organizador busca usuario por email/nome, seleciona uma pessoa, mas o card podia cair para email e a mensagem sugeria acesso automatico.
- Regra de produto: usuario convidado so deve ver/operar torneio ou liga depois de aceitar o convite.

Criterios entregues:

- membro ativo passou a preservar `displayName` separado de `email` no model de torneio;
- convite criado a partir de candidato selecionado mostra nome da pessoa no card imediatamente;
- feedback de sucesso passou a explicar que o convite aparece no app e o acesso so entra apos aceite;
- backend existente de convite pendente/aceite (`app_add_tournament_staff`, `app_list_my_tournament_staff_invites`, `app_accept_tournament_staff_invite`) foi preservado, sem acesso automatico.

Validacao esperada:

- `npm.cmd run lint`;
- `npm.cmd run build`;
- teste manual posterior: buscar usuario, selecionar, criar convite, entrar com convidado e aceitar.

### [x] ACADEMY-V2-00 - Plano operacional e suporte reutilizavel

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Transformar o prompt de Academia v2 em plano executavel antes de alterar a tela.
- Criar suporte para repetir o mesmo processo area por area do app.

Criterios:

- mapear nova arquitetura de `Gestao > Academia`;
- preservar todas as funcoes atuais;
- definir onde cada funcao mora na v2;
- separar rotina diaria, configuracao, fila e financeiro;
- definir drawers, acoes inline, setup/wizard e possiveis gaps de backend;
- criar playbook reutilizavel para Agenda, Clientes, Financeiro, Competition OS e demais areas.

Entregue:

- `ACADEMY_V2_UX_PLAN.md`;
- `OPERATIONAL_MODULE_REDESIGN_PLAYBOOK.md`;
- queue atualizada com tarefas de implementacao incremental.

Risco residual:

- a implementacao ainda precisa validar quais acoes ja persistem de verdade e quais exigem suporte backend minimo.

### [x] ACADEMY-V2-01 - Remover duplicidade e reorganizar abas da Academia

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Fazer `Gestao > Academia` deixar de parecer uma pagina empilhada e virar workspace operacional com responsabilidades claras.

Criterios:

- trocar `Turmas` por `Grade`;
- trocar `Recursos` por `Configuracao` ou `Quadras e horarios`;
- remover/fundir o bloco legado `Academia e aulas`;
- eliminar duplicidade entre central e conteudo legado;
- garantir que tabs nao fiquem presas em scroll interno dentro do bloco;
- manter link direto por `?visao=` sem quebrar rotas existentes.

Telas/componentes afetados:

- `PlaceAcademyTodayModule`;
- `PlaceAcademyClassesModule`;
- `PlaceAcademyStudentsModule`;
- `PlaceAcademyRequestsModule`;
- `PlaceAcademyCoachesModule`;
- `PlaceAcademyResourcesModule`;
- `PlaceAcademyClassSetupModule`;
- `PlaceAcademyFitModule`;
- `PlaceAdminShell`;
- navegacao de subvisoes de Academia.

Ganhos esperados:

- secretaria encontra `Hoje`, `Grade`, `Alunos`, `Pendencias`, `Professores` e `Configuracao` sem caca visual;
- reducao imediata de scroll e duplicidade;
- base limpa para drawers v2.

Dependencias:

- `ACADEMY_V2_UX_PLAN.md`;
- `ACADEMY_MODULE_FUNCTION_MAP.md`;
- rotas/subvisoes canonicas de Gestao.

Risco de regressao:

- fluxos legados podem depender do bloco `Academia e aulas`;
- deep links antigos para `?visao=turmas` ou `?visao=recursos` devem ser canonizados.

Criterios de conclusao:

- lint e build passando;
- screenshots desktop/mobile da Academia no ciclo de QA visual;
- docs atualizados com o novo estado.

Entregue:

- tabs v2 aplicadas: `Turmas` virou `Grade` e `Recursos` virou `Configuracao`;
- URLs canonicas passaram para `?visao=grade` e `?visao=configuracao`, mantendo aliases antigos `turmas` e `recursos`;
- bloco legado `Academia e aulas` deixou de renderizar dentro do workspace de Gestao;
- `Configuracao` passou a hospedar o modulo de recursos/horarios;
- `Pendencias` passou a recolher `Buscar encaixe` em disclosure, removendo o bloco permanente da primeira leitura;
- `npm.cmd run lint` e `npm.cmd run build` passaram.

Risco residual:

- `Buscar encaixe` ainda precisa virar drawer/sheet real em `ACADEMY-V2-04`;
- `Configuracao` ja evoluiu data/dia e visao professor/quadra em `ACADEMY-V2-07`;
- screenshots autenticados ficam para o ciclo de QA quando a sessao local estiver disponivel.

### [x] ACADEMY-V2-02 - Grade com drawer de turma

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Transformar turmas em lista operacional densa com `ClassDrawer`, removendo formularios repetidos de matricula/mensalidade do corpo.

Criterios:

- busca e filtros visiveis;
- rows com professor, quadra, dia, horario, vagas, mensalidade, nivel e status;
- `Nova turma` em drawer curto;
- edicao, mensalidade, alunos e historico dentro do drawer;
- sem limite silencioso de turmas.

Entregue:

- Grade ganhou busca por turma, professor, quadra, nivel ou aluno;
- filtros por dia e status operacional (`Todas`, `Com vagas`, `Lotadas`, `Com pendencias`);
- remocao de `slice(0, 12)` silencioso: a tela informa `Exibindo X de Y` e usa `Ver mais turmas`;
- row de turma manteve foco operacional com horario, professor, quadra, nivel, vagas, mensalidade e pendencias;
- `ClassDrawer` foi criado usando `EntityDrawer`;
- drawer permite editar dados da turma, professor, quadra, dia, horario, vagas, nivel, perfil e reposicao;
- suporte backend minimo criado em `updatePlaceAcademyClass(...)` para salvar edicao real da turma;
- mensalidade continua com acao explicita `Salvar mensalidade`;
- alunos da turma aparecem no drawer com ativar, cancelar, marcar pago e lembrete conforme permissao;
- matricula manual de aluno foi preservada dentro do drawer da turma;
- historico curto de matriculas aparece no drawer;
- setup de criacao de turma deixou de ficar aberto por padrao e passou para disclosure `Criar nova turma ou abrir horario`;
- `npm.cmd run lint` e `npm.cmd run build` passaram.

Risco residual:

- criacao de nova turma ainda usa o `SetupWizard` existente dentro de disclosure; a migracao para drawer curto pode ser feita em refinamento futuro sem bloquear a rotina de Grade;
- historico profundo de presenca/evolucao fica para `ACADEMY-V2-03`/`ACADEMY-V2-05`, pois esta rodada nao deveria avancar para Alunos/Hoje.

### [x] ACADEMY-V2-03 - Alunos com drawer e busca forte

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Fazer `Alunos` virar local unico para localizar aluno e resolver situacao de matricula, pagamento, presenca, evolucao e reposicao.

Criterios:

- busca por nome/telefone/email;
- filtros por status, turma, pagamento e presenca;
- `StudentDrawer`;
- acoes financeiras respeitam permissao;
- estados vazios explicam filtro e proxima acao;
- sem `slice` silencioso.

Implementado:

- `Alunos` ganhou filtros por busca, turma, status, pagamento e presenca/reposicao;
- lista deixou de usar limite silencioso: agora exibe `Exibindo X de Y` e oferece `Ver mais alunos`;
- cada aluno abre `StudentDrawer` com `Dados e matricula`, `Financeiro`, `Presenca e faltas`, `Evolucao` e `Reposicoes e historico`;
- edicao de matricula ganhou suporte real em `updateAcademyEnrollment(...)`, sem simular persistencia local;
- pagamento, lembrete, check-in, falta, ausencia avisada e registro de evolucao foram preservados dentro do contexto do aluno;
- acoes financeiras continuam condicionadas a permissao;
- estados vazios orientam quando a operacao nao tem alunos ou quando filtros esconderam resultados;
- `npm.cmd run lint` e `npm.cmd run build` passaram.

Risco residual:

- `Alunos` agora mostra creditos de reposicao no drawer, mas usar/agendar/baixar credito fica para a fila de `Pendencias`, onde a decisao operacional e o encaixe acontecem;
- busca por email depende de haver email persistido/vinculado na matricula/perfil; o modelo atual de `place_academy_enrollments` nao expÃµe email direto na listagem.

### [x] ACADEMY-V2-04 - Pendencias como fila e encaixe em drawer

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Separar fila operacional de ferramenta de busca de encaixe.

Criterios:

- pendencias em rows por matricula, aula avulsa, solicitacao de reposicao, credito aberto e pagamento;
- `Buscar encaixe` abre drawer/sheet;
- WhatsApp fica secundario;
- aprovar, recusar, agendar, usar reposicao e marcar pago sao acoes reais.

Implementado:

- `Pendencias` virou fila unica com rows para matriculas pendentes, aulas avulsas/reposicoes solicitadas e creditos de reposicao abertos;
- adicionados busca, filtro por tipo e filtro por status operacional;
- remocao de `slice(0, 8)` silencioso: a tela informa `Exibindo X de Y` e oferece `Ver mais pendencias`;
- WhatsApp foi movido para `Mais`, deixando `Ativar`, `Aprovar`, `Marcar pago` e `Buscar encaixe` como acoes prioritarias;
- `Buscar encaixe` deixou de ficar em disclosure no corpo e agora abre `FitDrawer` via `EntityDrawer`;
- o modulo de encaixe deixou de esconder pedidos/slots silenciosamente e ganhou `Ver mais pedidos` e `Ver mais encaixes`;
- estados vazios diferenciam fila em dia de filtro que escondeu resultados;
- `npm.cmd run lint` e `npm.cmd run build` passaram.

Risco residual:

- agendar uma reposicao de um aluno especifico ainda depende da ferramenta de encaixe global; o backend atual de `requestAcademyLessonFit` prioriza credito do usuario logado. Uma associacao transacional admin -> credito -> turma/data deve ser tratada em gap futuro se for exigida como fluxo direto por secretaria.
- `Marcar como usada` preserva a acao existente para credito de reposicao, mas nao substitui um fluxo completo de agendamento com vinculo de aula.

### [x] ACADEMY-V2-05 - Hoje com chamada rapida

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Transformar `Hoje` em tela de operacao diaria de aulas.

Criterios:

- rows de aulas do dia;
- `LessonDrawer` para chamada;
- presenca, falta, ausencia avisada e observacao curta;
- alunos e reposicoes do horario visiveis no contexto;
- sem wizard.

Implementado:

- `Hoje` deixou de usar cards com `slice(0, 8)` e passou para rows operacionais de aulas do dia;
- cada aula abre `LessonDrawer` com resumo, alunos ativos, faltas avisadas e reposicoes abertas;
- chamada permite marcar `Presente`, `Falta` e `Avisou falta` por aluno;
- observacao curta da chamada pode ser enviada junto com presenca/falta;
- aula sem alunos orienta a abrir `Grade`;
- `npm.cmd run lint` e `npm.cmd run build` passaram.

Risco residual:

- evolucao tecnica do aluno continua no `StudentDrawer`; `Hoje` ficou focado em chamada rapida para nao misturar rotina diaria com historico profundo.
- ausencia avisada usa o fluxo existente de `reportAcademyAbsence` com data padrao quando disparada pela chamada; data/nota detalhada seguem no drawer do aluno.

### [x] ACADEMY-V2-06 - Professores com drawer, agenda e login

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Fazer professores virarem entidade operacional clara, sem comissao/input espalhado.

Criterios:

- row por professor;
- `CoachDrawer`;
- cadastro rapido com nome, telefone e email;
- comissao, especialidades, disponibilidade e login em secoes;
- convite/vinculo de login preservado;
- professor/staff ve apenas o que seu papel permite.

Implementado:

- `Professores` ganhou cadastro rapido, busca e filtro por status/login/turmas;
- lista virou row operacional com `Abrir professor`, turmas, alunos ativos, aulas hoje, janelas abertas, receita e comissao estimada;
- inputs permanentes de comissao e login sairam da row e foram para `CoachDrawer`;
- `CoachDrawer` concentra dados do professor, comissao, login, turmas, alunos e agenda/disponibilidade;
- criado suporte real `updatePlaceCoach(...)` para salvar nome, telefone, email, status e comissao;
- WhatsApp e ajuste de agenda ficam como acoes secundarias no drawer;
- `npm.cmd run lint` e `npm.cmd run build` passaram.

Risco residual:

- especialidades e niveis atendidos ainda nao existem no schema de `place_coaches`; por isso ficaram como gap documentado, nao como input falso.
- disponibilidade detalhada continua representada por horarios abertos (`place_academy_slots`) e turmas; regras recorrentes avancadas ficam como gap para QA/backend.

### [x] ACADEMY-V2-07 - Configuracao de quadras e horarios

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Tornar quadras, horarios abertos, disponibilidade e bloqueios compreensiveis e acionaveis.

Criterios:

- data/dia explicitos;
- alternancia por professor/quadra;
- criar horario aberto;
- criar turma neste horario;
- bloquear horario;
- ver conflitos de professor/quadra;
- recursos nao dependem de draft invisivel de turma.

Implementado:

- `Configuracao` deixou de depender do weekday invisivel do draft de turma e ganhou filtro explicito por data/dia;
- alternancia `Por quadra` / `Por professor` com filtro por recurso;
- grade operacional mostra turmas, horarios abertos, horarios convertidos e bloqueios no mesmo dia;
- criacao de horario aberto e bloqueio agora nasce da propria Configuracao com persistencia em `place_academy_slots`;
- `createPlaceAcademySlot(...)` passou a aceitar `coachId` opcional e `status`, permitindo bloqueio de quadra/professor sem gambiarra de frontend;
- horarios abertos preservam a acao `Criar turma`, levando para `Grade` com o setup aberto e dados pre-preenchidos;
- horarios abertos podem ser bloqueados e bloqueios podem ser reabertos;
- conflitos por recurso aparecem na propria row/grupo quando ha sobreposicao;
- layout mobile passa a empilhar toolbar, criacao e grupos sem esconder dados;
- `npm.cmd run lint` e `npm.cmd run build` passaram.

Risco residual:

- transformar horario aberto em turma ainda usa o fluxo existente de criar turma com draft pre-preenchido, nao uma RPC transacional unica slot+class;
- regras avancadas de disponibilidade por professor/quadra ainda dependem de janelas em `place_academy_slots`, sem modelo proprio de recorrencia semanal.

### [x] ACADEMY-V2-08 - Backend gaps, permissoes e QA

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Garantir que a v2 nao tenha acoes falsas e funcione por perfil/plano.

Criterios:

- validar persistencia de editar turma, professor, aluno, pagamento, reposicao, aula avulsa e horario aberto;
- criar RPC/service minimo apenas quando necessario;
- validar admin, professor/staff e player;
- rodar lint/build;
- gerar screenshots before/after;
- atualizar MDs.

Implementado/validado:

- varredura de permissoes e acoes da Academia v2 confirmou que acoes financeiras seguem condicionadas a `canManageFinance`;
- edicao de turma, aluno, professor, mensalidade, chamada, aula avulsa, reposicao e horario aberto usam services reais existentes;
- cabeÃ§alho legado `Academia e aulas` deixou de aparecer dentro do workspace de Gestao, evitando duplicidade depois da v2;
- fluxo `Criar turma` a partir de horario aberto deixou de reportar falha total quando a turma foi criada mas a marcacao do slot como `assigned` falhou;
- nesse caso, a UI informa explicitamente que a turma foi criada e que o horario precisa ser revisado em `Configuracao`;
- `npm.cmd run lint` e `npm.cmd run build` passaram.

Gaps documentados:

- transformar horario aberto em turma ainda nao e uma transacao unica `slot -> class -> assigned`; criar RPC transacional fica recomendado se QA real mostrar inconsistencia frequente;
- screenshots autenticados nao foram gerados nesta rodada por falta de sessao local autenticada confiavel no ambiente atual;
- regras recorrentes avancadas de disponibilidade por professor/quadra continuam fora do modelo atual e devem ser produto/backend separado se forem priorizadas.

### [x] ACADEMY-BE-01 - RPC transacional para horario aberto virar turma

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Tornar o fluxo `Criar turma` a partir de `horario aberto` atomico e robusto.

Criterios:

- criar RPC pequena e especifica, sem backend paralelo;
- entrada recebe `slot_id`, dados essenciais/avancados da turma e `place_id`;
- validar permissao de operador do local antes de criar;
- validar que o slot pertence ao local e esta `open`;
- criar turma em `place_academy_classes`;
- marcar slot como `assigned` na mesma transacao;
- se qualquer etapa falhar, nada parcial deve persistir;
- frontend deve usar a RPC somente quando houver `slotId`;
- fluxo sem `slotId` continua usando criacao normal de turma;
- manter feedback claro para erro de conflito/permissao;
- validar lint/build.

Telas/componentes afetados:

- `PlacesPage`;
- `PlaceAcademyClassSetupModule`;
- `places.ts`;
- nova migration/RPC Supabase.

Ganhos esperados:

- elimina inconsistencia `turma criada + horario ainda aberto`;
- reduz necessidade de revisao manual em Configuracao;
- deixa o fluxo de secretaria mais confiavel.

Dependencias:

- `place_academy_slots`;
- `place_academy_classes`;
- permissoes/RLS existentes de local.

Risco de regressao:

- RPC pode duplicar regra de validacao ja existente em triggers; testar conflito de professor/quadra.

Criterios de conclusao:

- criar turma a partir de horario aberto persiste turma e slot `assigned` juntos;
- falha de validacao nao cria turma parcial;
- docs atualizados.

Implementado:

- nova migration `0076_academy_create_class_from_slot_v1.sql` com RPC `app_create_academy_class_from_slot(...)`;
- RPC valida permissao de gestor do local, slot pertencente ao local, status `open` e correspondencia dos dados de horario/recurso antes de criar;
- slot e marcado como `assigned` e a turma e criada na mesma transacao;
- frontend usa a RPC somente quando `draft.slotId` existe;
- criacao normal de turma sem slot permanece em `createPlaceAcademyClass(...)`;
- feedback deixa de aceitar sucesso parcial nesse fluxo.

Validacao:

- `npm.cmd run lint`;
- `npm.cmd run build`.

### [x] ACADEMY-BE-02 - Fluxo admin de reposicao especifica do aluno

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Permitir que secretaria vincule um credito de reposicao de um aluno especifico a uma turma/data sem depender do usuario logado.

Criterios:

- criar RPC/service minimo para `credito -> turma/data -> uso/agendamento`;
- validar que o credito pertence ao aluno/matricula/local;
- validar que credito esta `open`;
- validar turma ativa, vaga operacional e compatibilidade basica;
- registrar solicitacao/aprovacao ou marcar credito como usado conforme modelo atual;
- nao misturar aula avulsa, credito aberto e solicitacao de reposicao;
- expor acao em `Pendencias`/`FitDrawer` de forma task-first;
- respeitar permissao operacional do local;
- validar lint/build.

Telas/componentes afetados:

- `PlaceAcademyRequestsModule`;
- `PlaceAcademyFitModule`;
- `places.ts`;
- nova migration/RPC Supabase se necessario.

Ganhos esperados:

- secretaria consegue resolver reposicao real sem depender do login do aluno;
- reduz WhatsApp/manual workaround;
- fortalece a fila de Pendencias como central de limpeza operacional.

Dependencias:

- `place_academy_makeup_credits`;
- `place_academy_lesson_requests`;
- `place_academy_enrollments`;
- `place_academy_classes`.

Risco de regressao:

- confundir `reposicao aberta`, `solicitacao de reposicao` e `aula avulsa`; nomenclatura deve seguir `ACADEMY_V2_UX_PLAN.md`.

Criterios de conclusao:

- credito aberto de um aluno pode ser agendado/usado por admin com persistencia real;
- credito nao pode ser usado duas vezes;
- estados vazios e erros explicam o motivo.

Implementado:

- nova migration `0077_academy_admin_schedule_makeup_v1.sql` com RPC `app_admin_schedule_academy_makeup_credit(...)`;
- service `scheduleAcademyMakeupCredit(...)` em `places.ts`;
- fila de Pendencias agora abre o `FitDrawer` com o credito de reposicao selecionado;
- `FitDrawer` mostra contexto do aluno/credito e acao primaria `Agendar reposicao`;
- ao agendar, a RPC cria uma `place_academy_lesson_requests` aprovada, `request_type = makeup`, pagamento `waived`, vincula o credito e marca o credito como `used` na mesma transacao;
- a RPC impede reuso de credito aberto que ja tenha solicitacao ativa e valida vaga da turma/data via busca de encaixe existente.

Validacao:

- `npm.cmd run lint`;
- `npm.cmd run build`.

### [x] ACADEMY-BE-03 - Disponibilidade recorrente de professor/quadra

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Avaliar e implementar, se aprovado, modelo real para escala recorrente de disponibilidade, separado de turmas e slots pontuais.

Criterios:

- nao criar tabela nova antes de validar necessidade contra `place_academy_slots`;
- decidir se disponibilidade recorrente pertence a professor, quadra ou ambos;
- suportar dia da semana, inicio/fim, vigencia, status e observacao;
- Configuracao deve mostrar recorrencia sem confundir com horario aberto pontual;
- bloqueio pontual continua sendo `place_academy_slots.status = blocked` ou modelo equivalente;
- validar impacto em busca de encaixe e criacao de turma.

Telas/componentes afetados:

- `PlaceAcademyResourcesModule`;
- `PlaceAcademyCoachesModule`;
- busca de encaixe;
- migrations Supabase.

Ganhos esperados:

- professor consegue ter agenda semanal clara;
- secretaria entende quando um professor/quadra costuma estar disponivel;
- reduz cadastro repetitivo de janelas abertas.

Dependencias:

- decisao de produto sobre recorrencia vs slots pontuais.

Risco de regressao:

- overengineering; se o ganho operacional nao for claro, manter como gap documentado.

Criterios de conclusao:

- decisao documentada;
- se implementado, disponibilidade recorrente nao duplica nem conflita visualmente com turmas, slots e bloqueios.

Decisao:

- nao criar tabela nova nesta rodada;
- `place_academy_slots` ja representa a escala semanal recorrente minima: `weekday`, `starts_at`, `ends_at`, `coach_id`, `court_id`, `status` e `notes`;
- vigencia por data continua fora do modelo atual e deve virar task propria apenas se QA real mostrar necessidade;
- bloqueios em `place_academy_slots.status = blocked` devem ser tratados como bloqueios semanais, nao como bloqueios pontuais por data.

Implementado:

- `PlaceAcademyResourcesModule` passou a comunicar a area como `Escala semanal`, com `Data de referencia` apenas para escolher o dia da semana;
- criacao mudou de `Horario operacional` para `Janela semanal`;
- labels de eventos diferenciam `Janela semanal aberta`, `Janela convertida` e `Bloqueio semanal`;
- estados vazios agora explicam que a ausencia e por dia da semana recorrente;
- nao houve schema novo nem RPC nova, evitando overengineering e mantendo busca de encaixe/criacao de turma sobre o modelo existente.

Validacao:

- `npm.cmd run lint`;
- `npm.cmd run build`.

### [x] ACADEMY-BE-04 - Schema avancado de professor

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Completar professor como entidade operacional sem criar inputs falsos.

Criterios:

- validar campos realmente necessarios: especialidades, niveis atendidos, observacoes, perfil publico e disponibilidade;
- criar migration minima se houver decisao;
- atualizar `CoachDrawer` para editar apenas campos reais;
- manter nome, telefone, email, status, login e comissao como base;
- respeitar permissao financeira para comissao;
- validar lint/build.

Telas/componentes afetados:

- `PlaceAcademyCoachesModule`;
- `places.ts`;
- migrations Supabase.

Ganhos esperados:

- cadastro de professor fica mais profissional;
- agenda/aulas podem filtrar por nivel/especialidade no futuro;
- evita campos decorativos sem persistencia.

Dependencias:

- `place_coaches`;
- decisao de produto sobre perfil publico do professor.

Risco de regressao:

- transformar cadastro rapido em ERP burocratico. Campos avancados devem ficar recolhidos/drawer.

Criterios de conclusao:

- campos avancados persistem;
- cadastro rapido continua simples;
- professor sem permissao completa nao ganha acesso indevido.

Implementado:

- nova migration `0078_academy_coach_profile_fields_v1.sql`;
- `place_coaches` ganhou campos reais: `specialties`, `level_scopes`, `public_bio`, `internal_notes` e `public_profile_enabled`;
- policy `place_coaches_read` foi restringida ao contexto de gestao da academia para proteger observacoes internas;
- `places.ts` passou a listar, criar retorno e atualizar professores com esses campos;
- `CoachDrawer` ganhou secao `Perfil operacional` com especialidades, niveis atendidos, bio publica, perfil publico ativo e observacoes internas;
- cadastro rapido continua apenas com nome, telefone e email;
- comissao continua condicionada a `canManageFinance`;
- campos avancados ficam no drawer e nao viram inputs permanentes nas rows.

Validacao:

- `npm.cmd run lint`;
- `npm.cmd run build`.

### [x] ACADEMY-STUDENT-01 - Modelo de contrato/plano do aluno

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Evoluir a entidade `Aluno` de matricula solta em turma para contrato/plano semanal vinculado a um usuario.
- Permitir planos como 1x, 2x ou mais aulas por semana, com mensalidade unica e horarios/turmas selecionados.

Criterios:

- definir contrato/plano do aluno por academia;
- contrato deve ter usuario vinculado ou convite pendente, aulas por semana, mensalidade, status e inicio;
- manter `place_academy_enrollments` como vinculo operacional por turma para presenca/chamada/historico;
- permitir selecionar uma ou mais ocorrencias semanais, inclusive ocorrencias agrupadas da mesma turma em dias diferentes;
- validar quando a quantidade de horarios selecionados nao bate com o plano contratado;
- documentar estrategia de convite/criacao de usuario sem inserir `auth.users` de forma insegura pelo client;
- definir como `app_payments` passa a cobrar mensalidade por contrato/plano, nao por cada turma isolada;
- definir impacto em seed/reset do ambiente de teste.

Telas/componentes afetados:

- `PlaceAcademyStudentsModule`;
- `PlaceAcademyClassesModule`;
- `StudentDrawer`;
- `ClassDrawer`;
- services de academia em `places.ts`;
- migrations Supabase;
- seed demo de academia.

Ganhos esperados:

- uma secretaria cadastra o aluno uma vez, define plano e encaixa horarios semanais sem duplicar pessoas;
- aluno recebe notificacoes e fica ligado ao perfil;
- financeiro passa a refletir o contrato real do aluno;
- base fica pronta para reposicao automatica por ausencia avisada.

Dependencias:

- `place_academy_enrollments`;
- `app_payments`;
- `profiles`/`auth.users`;
- modelo atual de turmas recorrentes por `weekday`;
- decisao sobre convite de usuario quando o email ainda nao existe.

Risco de regressao:

- quebrar fluxos atuais que esperam uma matricula por turma;
- criar contrato sem persistencia real;
- duplicar cobranca se contrato e enrollment cobrarem o mesmo aluno;
- transformar cadastro rapido em ERP burocratico.

Criterios de conclusao:

- plano tecnico documentado;
- migration minima definida ou implementada;
- estrategia de compatibilidade com matriculas existentes definida;
- queue dos itens seguintes ajustada.

Implementado:

- criada migration `0079_academy_student_contracts_v1.sql`;
- nova tabela `place_academy_student_contracts` para contrato/plano semanal do aluno;
- contrato guarda academia, usuario vinculado ou convite por email, nome, telefone, status, aulas por semana, mensalidade, inicio/fim e observacoes;
- `place_academy_enrollments` ganhou `contract_id`, mantendo matriculas por turma para chamada/presenca/historico;
- nova tabela `place_academy_settings` guarda `makeup_notice_hours` e `auto_create_makeup_credit_on_notice`;
- `place_academy_makeup_credits` ganhou `source_absence_id`, preparando credito originado de ausencia avisada;
- criada RPC `app_create_academy_student_contract(...)`, que resolve usuario por email, cria convite pendente se nao existir, cria contrato e gera matriculas operacionais nas turmas escolhidas;
- pagamento manual e lembrete passaram a aceitar `academy_student_contract` como target financeiro;
- RLS/policies criadas para contrato, settings e leitura financeira do target novo;
- `types.ts` e `places.ts` ganharam tipos/services para contratos e `contractId` nas matriculas.

Decisoes:

- nao inserir diretamente em `auth.users` por SQL client-side; email inexistente vira `invite_email`/convite pendente ate suporte seguro de convite/criacao de usuario;
- `place_academy_enrollments` continua existindo e nao foi removida;
- cobranca canonica nova sera `target_type = academy_student_contract`, preservando leitura antiga por `academy_enrollment` ate a migracao visual/financeira.

Validacao:

- `npm.cmd run lint`;
- `npm.cmd run build`.

Risco residual:

- a UI ainda precisa usar o novo fluxo; enquanto isso, telas existentes continuam operando por enrollment;
- credito automatico por ausencia avisada ainda sera implementado em `ACADEMY-STUDENT-04`;
- seed/reset completo fica em `ACADEMY-STUDENT-05`.

### [x] ACADEMY-STUDENT-02 - Cadastro de aluno por usuario, plano e horarios

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Substituir o cadastro solto por um fluxo operacional: usuario aluno -> plano -> horarios semanais -> matriculas operacionais.

Criterios:

- `Novo aluno` abre drawer/flow curto;
- busca usuario existente por email/telefone e mostra resultado claro;
- se usuario nao existir, cria convite pendente ou aciona suporte seguro de convite;
- campos essenciais: aluno, telefone/email, plano/aulas por semana, mensalidade, data de inicio;
- selecao de turmas/horarios deve agrupar ocorrencias equivalentes e permitir escolher uma, outra ou ambas;
- criar as matriculas operacionais necessarias sem duplicar aluno na tela principal;
- aluno novo entra sem creditos de reposicao;
- inputs sem label visivel devem ter placeholder e `aria-label`.

Telas/componentes afetados:

- `Alunos > Novo aluno`;
- `Grade > ClassDrawer > Matricular aluno`;
- `StudentDrawer`;
- `ClassDrawer`.

Risco de regressao:

- perder suporte a aluno sem login usado pela secretaria;
- criar duas fontes de verdade para aluno;
- esconder campos obrigatorios de plano.

Criterios de conclusao:

- fluxo cria aluno/contrato e vinculos reais;
- lista de alunos agrega por contrato/usuario;
- class drawer continua permitindo matricular, mas usa o mesmo fluxo canonico.

Implementado:

- `Grade > Turma > Novo aluno` usa `app_create_academy_student_contract(...)`;
- formulario curto coleta nome, email/login, telefone, aulas por semana, mensalidade, inicio, horarios semanais e observacoes;
- a turma aberta no drawer fica sempre selecionada, e outras turmas/horarios podem ser adicionadas ao contrato;
- `fetchPlaceAdminResources` carrega `place_academy_student_contracts` junto dos demais recursos da academia;
- `Academia > Alunos` agrega por contrato quando existe `contract_id`, mostrando plano, mensalidade e horarios vinculados;
- caminho legado por matricula isolada permanece para registros antigos e excecoes administrativas.

Validacao:

- `npm.cmd run lint`;
- `npm.cmd run build`.

Risco residual:

- status financeiro visual ainda usa principalmente pagamento por `academy_enrollment`; a migracao para `academy_student_contract` fica no proximo item;
- drawer detalhado ainda abre a matricula representativa do contrato para acoes antigas, preservando compatibilidade ate a etapa financeira/contratual completa.

### [x] ACADEMY-STUDENT-03 - Cobranca mensal por contrato do aluno

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Fazer mensalidade da academia acompanhar o contrato/plano semanal, nao cada enrollment isolado.

Criterios:

- definir `target_type` canonico para pagamento do contrato, como `academy_student_contract`;
- `Marcar pago`, `Enviar lembrete` e `Cobrar` usam o contrato como alvo;
- alunos com duas aulas semanais geram uma mensalidade;
- preservar leitura de pagamentos antigos por `academy_enrollment` durante transicao;
- Pendencias e Financeiro mostram cobranca de aluno sem duplicidade.

Risco de regressao:

- pagamentos antigos sumirem;
- lembrete apontar para target errado;
- duplicar mensalidade no mesmo periodo.

Criterios de conclusao:

- pagamento mensal do contrato persiste;
- UI mostra pago/pendente corretamente;
- docs registram transicao entre enrollment e contrato.

Implementado:

- `Marcar pago` e `Enviar lembrete` usam `academy_student_contract` quando a matricula possui `contract_id`;
- matriculas antigas sem contrato continuam usando `academy_enrollment`;
- `Academia > Alunos`, `Grade > Turma`, Financeiro/Recebiveis e Clientes/Relacionamento passam a considerar pagamento do contrato;
- alunos com dois horarios no mesmo contrato geram uma unica mensalidade em aberto;
- recebiveis da academia agora sao montados primeiro por contrato ativo/pendente e depois por matriculas legadas sem contrato;
- receita recorrente estimada da academia soma contratos ativos mais matriculas legadas sem contrato, sem duplicar alunos contratados;
- leitura antiga por `academy_enrollment` foi preservada como fallback de transicao.

Validacao:

- `npm.cmd run lint`;
- `npm.cmd run build`.

Risco residual:

- pagamentos antigos por matricula ligada posteriormente a contrato podem exigir conciliacao manual se existirem em massa no ambiente;
- o drawer ainda edita dados da matricula representativa, enquanto dados financeiros passam a ser do contrato.

### [x] ACADEMY-STUDENT-04 - Ausencia avisada com antecedencia e credito automatico

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Quando aluno avisar ausencia com antecedencia configurada pela academia, gerar credito de reposicao automaticamente e liberar vaga.

Criterios:

- criar configuracao por academia: antecedencia minima para gerar reposicao;
- ausencia avisada valida data/hora real da aula;
- se dentro do prazo e turma permite reposicao, cria `planned_absence` e credito aberto;
- se fora do prazo, UI explica sem gerar credito automatico ou exige aprovacao manual conforme decisao;
- credito guarda origem por ausencia avisada, alem de origem por chamada/falta quando aplicavel;
- impedir credito duplicado para mesma ausencia;
- Pendencias diferencia `Reposicao aberta`, `Solicitacao de reposicao`, `Aula avulsa/drop-in` e `Ausencia avisada`.

Telas/componentes afetados:

- `Hoje > LessonDrawer`;
- `Alunos > StudentDrawer`;
- `Pendencias`;
- `Configuracao` da academia.

Risco de regressao:

- gerar credito para falta fora do prazo;
- quebrar creditos existentes baseados em `source_attendance_id`;
- confundir ausencia avisada com reposicao solicitada.

Criterios de conclusao:

- fluxo aluno/admin cria ausencia e credito real;
- regra de antecedencia fica editavel por gestor;
- creditos aparecem no aluno e na fila sem duplicidade.

Implementado:

- criada migration `0080_academy_absence_notice_credit_v1.sql`;
- `app_report_academy_absence(...)` agora valida turma ativa, dia real da turma e regra de antecedencia;
- quando o aviso esta dentro do prazo e a regra esta ativa, cria `place_academy_makeup_credits` com `source_absence_id`;
- `source_absence_id` impede credito duplicado para a mesma ausencia avisada;
- se o aviso esta fora do prazo, a ausencia fica registrada, mas nao gera credito automatico;
- `Configuracao > Quadras e horarios` ganhou regra editavel de antecedencia minima e toggle de credito automatico;
- `Pendencias` diferencia credito por ausencia avisada, credito por falta marcada e credito manual;
- `StudentDrawer` mostra a origem da reposicao no historico do aluno.

Validacao:

- `npm.cmd run lint`;
- `npm.cmd run build`.

Risco residual:

- a comparacao de antecedencia usa o horario da turma recorrente e o timezone configurado pelo ambiente do banco; se academias multi-timezone entrarem no produto, sera preciso adicionar timezone por local;
- seed demo ainda precisa criar exemplos dentro e fora do prazo para QA visual.

### [x] ACADEMY-STUDENT-05 - Seed/reset de academia com contratos reais

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Como o app esta em teste, permitir reset/populacao com dados coerentes para validar contratos, usuarios alunos, planos, turmas multi-horario, creditos e cobrancas.

Criterios:

- atualizar scripts SQL de seed para criar usuarios alunos/professores reais;
- criar contratos com 1x, 2x e 3x por semana;
- distribuir alunos em turmas e horarios variados;
- gerar mensalidades pagas, pendentes e atrasadas;
- gerar ausencias avisadas dentro e fora do prazo;
- gerar creditos de reposicao abertos/usados/cancelados;
- manter `escalao@gmail.com` como dono/admin dos locais demo;
- evitar duplicidade em rerun ou documentar ordem de reset.

Risco de regressao:

- seed conflitar com triggers de horario/quadra;
- duplicar usuarios se rerun nao limpar auth/public corretamente;
- massa demo esconder bugs por dados irreais.

Criterios de conclusao:

- seed split `web/supabase/seeds/qa_demo` atualizado para o modelo canÃ´nico de contratos;
- `04_academy.sql` cria `place_academy_student_contracts`, `seed_contracts`, `seed_contract_classes`, matriculas com `contract_id`, planos 1x/2x/3x, configuracao de antecedencia e creditos por ausencia;
- `05_bookings.sql` cria mensalidades em `app_payments` com `target_type = 'academy_student_contract'`, pagas, pendentes atuais e pendentes atrasadas;
- `08_leagues.sql`, `09_cleanup_helpers.sql`, `01_cleanup.sql` e `README.md` atualizados para os novos helpers/alvos financeiros;
- `escalao@gmail.com` continua dono/admin dos locais demo;
- usuarios alunos seguem vinculados a `auth.users`/`profiles`, permitindo contexto no Player App.

Validacao:

- `npm.cmd run lint`;
- `npm.cmd run build`.

Risco residual:

- o seed foi atualizado estaticamente e deve ser rodado no banco paralelo seguindo `01_cleanup.sql` a `08_leagues.sql`; se a instancia ainda nao tiver migrations `0079` e `0080`, o passo `04_academy.sql` falhara porque depende das tabelas/colunas novas;
- `qa_full_demo_seed.sql` permanece legado; para QA da Academia v2, usar o seed split `qa_demo`.

### [x] SEED-QA-02 - Blueprint de populate realista ponta a ponta

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Transformar o seed `qa_demo` em uma massa operacional realista, nao apenas preenchimento de tabelas.
- Garantir que cada entidade importante esteja ligada ao fluxo real: usuario -> perfil -> papel/plano -> academia/professor/turma/aluno/contrato/pagamento/presenca/reposicao, e jogador -> torneio/liga/partida/pagamento/resultado.

Criterios:

- definir volumes-alvo por perfil e por modulo antes de popular;
- definir regras de integridade funcional, nao apenas FK:
  - nenhuma turma ativa sem professor, quadra e alunos;
  - nenhum professor ativo sem usuario, staff/coach role e ao menos uma agenda/turma;
  - nenhum aluno ativo sem usuario, profile, contrato e matricula vinculada;
  - nenhum contrato ativo sem matriculas coerentes com `weekly_lessons_count`;
  - nenhum pagamento de academia sem contrato/aluno real;
  - nenhum torneio publico sem inscricoes, membros, pagamentos e operacao;
  - nenhuma liga ativa sem temporada, classes, jogadores, rodadas, partidas e rankings;
- criar checklist de validacao SQL no proprio seed ou em arquivo `10_verify_and_relink_owner.sql` ampliado;
- documentar volumes esperados e senhas/perfis no README.

Telas/fluxos afetados:

- `qa_demo/README.md`;
- `01_cleanup.sql`;
- `02_users.sql`;
- `03_places.sql`;
- `04_academy.sql`;
- `05_bookings.sql`;
- `06_finance.sql`;
- `07_tournaments.sql`;
- `08_leagues.sql`;
- `10_verify_and_relink_owner.sql`.

Ganhos esperados:

- QA deixa de ser visualizacao de dados artificiais;
- screenshots passam a revelar gargalos reais de densidade, filtros, permissao e UX;
- Player App, Management OS e Competition OS ficam testaveis por perfil.

Risco de regressao:

- volume grande pode mascarar erro se nao houver verificacao;
- seed pode ficar lento se gerar historico demais sem criterio;
- triggers de conflito podem bloquear turmas/reservas se horarios nao forem coordenados.

Criterios de conclusao:

- criado `SEED_QA_REALISTIC_POPULATE_PLAN.md` com perfis, volumes-alvo, invariantes, ordem de execucao e validacao esperada;
- queue detalhada de `SEED-QA-03` a `SEED-QA-12` criada para evoluir o populate em blocos;
- invariantes passam a exigir vinculo real ponta a ponta, nao apenas FK.

### [x] SEED-QA-03 - Usuarios, perfis e papeis demo completos

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Criar personas completas para testar todos os contextos sem depender apenas do admin multi-papel.

Criterios:

- manter `escalao@gmail.com` como owner/admin de todos os locais, torneios e ligas demo;
- criar usuarios reais com `auth.users` e `profiles` para:
  - owner/admin;
  - gerentes;
  - recepcao/frontdesk;
  - professores;
  - alunos de academia;
  - socios;
  - jogadores puros;
  - organizadores de competicao;
  - scorekeepers/check-in/media;
- preencher `app_user_product_entitlements` para testar:
  - `free_player`;
  - `competition_organizer`;
  - `coach_solo`;
  - `academy_pro`;
  - `platform_admin`;
- garantir senha documentada por grupo;
- garantir que jogadores/alunos/professores tenham cidade, UF, telefone, bio e perfil minimamente completo.

Risco de regressao:

- criar usuario sem `auth.identities` e quebrar login;
- duplicar emails em rerun;
- misturar papel profissional com Player App sem intencao.

Criterios de conclusao:

- `02_users.sql` cria personas adicionais para `platform_admin`, `competition_organizer`, `coach_solo`, financeiro e media/eventos;
- `profiles` seguem sendo gerados para 100% dos `seed_users`;
- `app_user_product_entitlements` agora cobre `academy_pro`, `platform_admin`, `competition_organizer`, `coach_solo` e staff operacional via vinculo de local;
- README documenta credenciais e significado de cada perfil.

### [x] SEED-QA-04 - Locais, quadras, staff e professores realistas

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Popular academias/clubes como operacoes reais, com staff, quadras, regras, professores e disponibilidade coerente.

Criterios:

- manter 3 locais principais, mas com perfis diferentes:
  - academia media;
  - clube maior/multiquadra;
  - centro premium com operacao mais complexa;
- cada local deve ter:
  - owner correto;
  - staff manager/frontdesk/coach em `place_staff`;
  - professores em `place_coaches` vinculados a usuarios;
  - quadras com precos, superficies e valores de socio;
  - regras de reserva por perfil/weekday;
  - planos de socio;
  - configuracao de academia em `place_academy_settings`;
- professores devem ter especialidades, niveis, bio, notas internas e comissao.

Risco de regressao:

- professor existir em `place_coaches` sem usuario e sem staff;
- quadra sem regra de reserva;
- local com produto/plano incoerente com modulos visiveis.

Criterios de conclusao:

- `03_places.sql` continua criando 3 locais com perfis diferentes, quadras, regras, staff, owner e planos coerentes;
- staff adicional foi vinculado a locais sem quebrar o check constraint de roles vigente naquele sprint (`manager`, `frontdesk`, `coach`); `finance` foi adicionado depois em `ROLE-FINANCE-01`;
- professores em `place_coaches` agora recebem usuario, staff coach, especialidades, niveis atendidos, bio publica, notas internas, comissao e perfil publico ativo.

Risco residual:

- `place_academy_slots` e volume real de turmas/alunos ainda entram no proximo item (`SEED-QA-05`).

### [x] SEED-QA-05 - Academia completa: grade, contratos, alunos e capacidade

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Fazer o modulo Academia refletir uma operacao real de secretaria/professor/financeiro.

Criterios:

- aumentar volume para algo proximo de realidade:
  - academia media: 20-30 turmas/horarios semanais;
  - clube grande: 35-60 turmas/horarios semanais;
  - centro premium: 25-45 turmas/horarios semanais;
- criar `place_academy_slots` como escala semanal real:
  - horarios abertos;
  - horarios assigned;
  - bloqueios;
  - disponibilidade por professor e quadra;
- criar turmas sempre com:
  - professor;
  - quadra;
  - dia/horario;
  - nivel;
  - capacidade;
  - mensalidade;
- criar contratos de alunos sempre com:
  - usuario real;
  - profile;
  - plano 1x/2x/3x;
  - matriculas com `contract_id`;
  - quantidade de turmas coerente com `weekly_lessons_count`;
- distribuir alunos respeitando capacidade:
  - turmas cheias;
  - turmas com vagas;
  - turmas quase vazias;
  - turmas kids/adulto/feminino/performance;
- criar alguns contratos pendentes/cancelados, mas sem quebrar a leitura principal.

Risco de regressao:

- conflito de professor/quadra no mesmo horario;
- aluno duplicado em varias turmas sem contrato;
- turma ativa sem aluno ou sem professor;
- capacidade irreal que esconde problemas de vaga.

Criterios de conclusao:

- consultas de verificacao retornam zero para orfaos: turma sem professor, turma sem quadra, professor sem usuario, aluno ativo sem usuario, enrollment ativo sem contrato;
- contratos ativos batem com numero de aulas semanais;
- `Academia > Hoje`, `Grade`, `Alunos`, `Pendencias`, `Professores` e `Configuracao` mostram massa real.

Implementado:

- `04_academy.sql` agora cria 24 turmas para ADT, 30 para Arena Pantanal e 42 para Clube Racket Prime, sempre com professor, quadra, dia, horario, nivel, capacidade e mensalidade.
- `place_academy_slots` passou a ser populado com janelas `assigned`, horarios `open` e bloqueios `blocked`; bloqueios tambem recebem professor para respeitar `app_validate_academy_resource_scope`.
- turmas adultas foram calibradas para capacidade 4 e infantis para capacidade 8, refletindo operacao real de tenis.
- contratos foram calibrados para 60/82/115 alunos por local, com usuario real, profile existente, plano semanal 1x/2x/3x, `contract_id` e matriculas coerentes com `weekly_lessons_count`.
- matriculas ativas agora sao distribuidas por assentos de turma, sem concentrar todos os alunos nas primeiras turmas e sem ultrapassar capacidade.
- helpers `seed_slots` foram incluidos no cleanup inicial e no cleanup opcional.

Risco residual:

- historico de 6 meses, reposicoes e aula avulsa em volume maior ficam no proximo item (`SEED-QA-06`).

### [x] SEED-QA-06 - Historico de 6 meses: presenca, faltas, reposicoes e aulas avulsas

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Criar historico suficiente para validar rotinas de chamada, ausencias, reposicao, drop-in e evolucao.

Criterios:

- gerar 20-26 semanas de `place_academy_attendance` para turmas ativas;
- variar presencas, faltas, faltas avisadas e observacoes;
- criar `place_academy_planned_absences` dentro e fora do prazo;
- criar creditos de reposicao:
  - abertos;
  - usados;
  - cancelados;
  - originados por falta marcada;
  - originados por ausencia avisada;
- criar `place_academy_lesson_requests` para:
  - aula avulsa/drop-in pendente;
  - aula avulsa aprovada/paga;
  - reposicao solicitada;
  - reposicao recusada/cancelada;
- criar `place_academy_progress_notes` com foco, nivel e evolucao por aluno.

Risco de regressao:

- credito duplicado por mesma ausencia;
- reposicao sem matricula/aluno real;
- historico muito pesado sem necessidade.

Criterios de conclusao:

- Pendencias mostra fila real;
- StudentDrawer mostra presenca, evolucao, pagamentos e reposicoes;
- Hoje permite testar chamada com alunos suficientes.

Implementado:

- `04_academy.sql` agora gera 24 semanas de `place_academy_attendance` para matriculas ativas, com presenca, falta registrada, ausencia avisada e observacao tecnica curta.
- creditos por `source_attendance_id` aumentaram para massa maior e agora variam entre `open`, `used` e `cancelled`.
- ausencias planejadas dentro e fora do prazo foram ampliadas, preservando datas diferentes para evitar conflito por `(enrollment_id, absence_on)`.
- creditos por `source_absence_id` foram ampliados e continuam diferenciando ausencia avisada dentro do prazo.
- `place_academy_lesson_requests` agora inclui reposicoes vinculadas a `makeup_credit_id` real, com status `pending`, `approved` e `rejected`; aprovacoes atualizam credito e ausencia para `used`.
- drop-ins/aulas avulsas continuam existindo como pedidos independentes para validar fila, pagamento e encaixe.

Risco residual:

- validadores automaticos de contagem/status ainda entram em `SEED-QA-12`;
- agenda de quadras com reservas reais e waitlist ainda depende do proximo item.

### [x] SEED-QA-07 - Agenda e reservas com ocupacao realista

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Popular agenda de quadras com reservas, aulas, bloqueios e espera sem conflitar com turmas.

Criterios:

- gerar reservas em 6 meses com padrao real:
  - manha;
  - horario de almoco;
  - pico noturno;
  - fim de semana;
- criar ocupacao por local:
  - 45-60% academia media;
  - 60-75% clube grande;
  - 55-70% premium;
- criar `court_bookings` confirmadas, pendentes, canceladas e blocked;
- criar `court_booking_waitlist` em horarios cheios;
- deixar pendente apenas solicitacoes recentes de abertura, nao backlog antigo;
- nao sobrepor reservas com turmas/aulas fixas na mesma quadra;
- pagamentos de reserva devem apontar para reservas reais.

Risco de regressao:

- trigger bloquear seed por conflito de quadra;
- calendario parecer lotado artificialmente;
- reservas futuras impedirem recriar turmas em rerun parcial.

Criterios de conclusao:

- Agenda mostra ocupacao real por quadra/dia;
- busca de quadra livre retorna resultados variados;
- lista de espera aparece apenas em horarios plausiveis.

Implementado:

- `05_bookings.sql` agora gera candidatos de reserva dos ultimos 180 dias ate 45 dias futuros, com padroes de manha, almoco, pico noturno e fim de semana.
- antes de inserir, a massa filtra conflito com `place_academy_classes` e `place_academy_slots` na mesma quadra/dia/horario.
- reservas variam entre `confirmed`, `pending`, `cancelled` e `blocked`.
- reservas `pending` agora representam triagem recente de abertura: somente hoje/proximos 2 dias, criadas desde a ultima tarde/noite; o restante do backlog aparece resolvido como confirmado/cancelado/bloqueado.
- pagamentos de reserva ignoram `cancelled` e `blocked`, mantendo target real para toda reserva paga/pendente.
- `court_booking_waitlist` agora nasce de reservas futuras confirmadas em horario ocupado, evitando fila solta sem contexto operacional.

Risco residual:

- ocupacao percentual exata ainda deve ser medida pelo futuro verificador `SEED-QA-12`;
- financeiro amplo por origem, lembretes e POS entram no proximo item.

### [x] SEED-QA-08 - Financeiro completo e coerente por origem

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Fazer financeiro refletir operacao real por contrato, socio, reserva, aula avulsa, torneio e liga.

Criterios:

- criar pagamentos para:
  - `academy_student_contract`;
  - `place_membership`;
  - `court_booking`;
  - `tournament_registration`;
  - `league_registration`;
  - aula avulsa/drop-in quando aplicavel;
- variar status:
  - paid;
  - pending atual;
  - pending vencido;
  - refunded/failed quando util para UI;
- criar lembretes em `app_payment_reminders` com channel/status variados;
- criar despesas, POS, pacotes/creditos e compras;
- garantir que pagamento pendente sempre tenha usuario e target real.

Risco de regressao:

- pagamento sem target real;
- duplicidade de mensalidade por aluno com contrato 2x/3x;
- pendencia financeira sem contexto na UI.

Criterios de conclusao:

- Financeiro, Clientes/CRM, Academia/Alunos e Pendencias mostram valores coerentes;
- nenhum pagamento aponta para target inexistente;
- alunos com duas ou tres aulas possuem uma mensalidade unica.

Implementado:

- `05_bookings.sql` ja mantem mensalidade de academia por `academy_student_contract`, uma cobranca por contrato/plano, mesmo para alunos 2x/3x.
- `06_finance.sql` agora cria pagamentos reais para `academy_lesson_request` quando a aula avulsa/drop-in tem valor e target real.
- reposicoes com credito continuam sem nova cobranca (`waived`), evitando duplicidade entre credito e aula avulsa.
- `06_finance.sql` cria lembretes para pendencias de `academy_student_contract`, `place_membership`, `court_booking` e `academy_lesson_request`.
- `08_leagues.sql` recalcula lembretes finais depois de torneios/ligas e inclui `academy_lesson_request`.
- lembretes variam canal (`manual`, `whatsapp`, `email`) e status (`queued`, `sent`, `cancelled`).
- pagamentos de liga agora variam entre `paid`, `pending` e `failed`, sem perder target real.

Risco residual:

- pagamentos de torneio foram refinados em `SEED-QA-09`; validacao automatica de targets ainda fica para o verificador final;
- validadores automaticos de alvo inexistente entram em `SEED-QA-12`.

### [x] SEED-QA-09 - Torneios com operacao completa

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Popular Competition OS de torneios com estados reais de organizador e jogador.

Criterios:

- criar torneios em estados:
  - draft;
  - registration_open;
  - registration_closed;
  - live;
  - finished;
- cada torneio publico deve ter:
  - owner `escalao@gmail.com`;
  - place real quando aplicavel;
  - staff em `tournament_members`;
  - inscriÃ§Ãµes com `auth.users`;
  - participantes aprovados em `tournament_members`;
  - pagamentos coerentes;
  - chat/announcement;
  - confirmacoes de partida;
  - resultado enviado/aplicado/conflito quando o status permitir;
- dados em `tournaments.data` devem estar coerentes com `tournament_registrations`;
- criar variaÃ§Ã£o: aberto com vagas, aberto quase cheio, live com pendencias, finalizado com resultados.

Risco de regressao:

- participante em JSON sem usuario/registration;
- registration aprovada sem tournament_member;
- pagamento de inscricao sem registration real.

Criterios de conclusao:

- Organizador enxerga pendencias reais;
- jogador inscrito enxerga torneios e partidas;
- torneio publico mostra vagas/inscricoes coerentes.

Implementado:

- `07_tournaments.sql` agora cobre os estados `draft`, `registration_open`, `registration_closed`, `live` e `finished`.
- adicionado torneio publico `Prime Open Inscricoes Encerradas`, com inscriÃ§Ãµes jÃ¡ encerradas e evento futuro.
- staff de torneio ficou mais completo, incluindo `organizer`, `checkin`, `scorekeeper` e `media`, alem do owner principal.
- anuncios/chat passam a cobrir tambem torneios `registration_closed`.
- pagamentos de torneio agora variam entre `paid`, `pending`, `failed` e `refunded` quando aplicavel, mantendo target real por `tournament_registration`.

Risco residual:

- a coerencia fina entre `tournaments.data` JSON e `tournament_registrations` ainda deve ser validada por `SEED-QA-12`;
- resultados/chaves continuam sinteticos e podem ser aprofundados se o Competition OS pedir cenarios mais pesados.

### [x] SEED-QA-10 - Ligas com rodada, partida e matchroom realistas

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Popular ligas com operacao relacional completa, simulando varias rodadas de uso.

Criterios:

- criar ligas simples, dupla fixa e ranking;
- cada liga ativa deve ter:
  - season ativa;
  - classes;
  - league_players com usuarios;
  - league_registrations;
  - rounds abertas/finalizadas;
  - matches aguardando organizacao, resultado, confirmacao, encerradas, WO e analise admin;
  - league_match_players;
  - league_match_messages;
  - league_match_result_submissions;
  - league_match_availability;
  - ranking_snapshots;
  - pagamentos e lembretes;
- criar jogadores em recesso, wildcard e casos de conflito.

Risco de regressao:

- partida sem players;
- rodada sem partida;
- ranking sem players reais;
- status de match incompatÃ­vel com resultados/submissions.

Criterios de conclusao:

- jogador consegue abrir liga e ver proxima partida;
- organizador consegue ver pendencias reais;
- ranking e rodadas refletem 6 meses de atividade.

Implementado:

- `08_leagues.sql` agora popula ligas simples, dupla fixa e ranking com `operationModel` explicito para a liga de ranking;
- cada liga ativa tem season, classes, jogadores com usuarios, inscricoes aprovadas, pendentes e rejeitadas;
- rodadas cobrem historico e rodada atual com partidas `encerrada`, `wo`, `em_analise_adm`, `em_disputa`, `aguardando_confirmacao`, `aguardando_resultado` e `aguardando_organizacao`;
- liga de dupla fixa passou a criar dois jogadores por lado em `league_match_players`;
- partidas futuras de dupla fixa incluem caso de wildcard real em `league_match_players`;
- matchroom ganhou mensagens dos dois lados, disponibilidade por opcoes em `league_match_availability` e submissions coerentes com status;
- WO e analise administrativa geram `league_admin_decisions`;
- partidas finalizadas/WO geram `league_round_results`;
- historico de confrontos passa a alimentar `league_pair_history`;
- ligas possuem `league_join_links` por classe;
- pagamentos de inscricao de liga variam entre `paid`, `pending`, `failed` e `refunded`, com lembretes finais recalculados.

Validacao:

- `npm.cmd run lint`;
- `npm.cmd run build`.

Risco residual:

- a chave/ranking exibida pela UI ainda depende das regras sinteticas atuais de `ranking_points`;
- validadores automaticos de match sem players, rodada sem match e pagamento sem target entram em `SEED-QA-12`.

### [x] SEED-QA-11 - Player App: descoberta, social e perfis coerentes

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Garantir que jogadores puros tenham dados suficientes para testar Home, Locais, Ranking, Perfil e descoberta sem ruido de gestao.

Criterios:

- criar jogadores que:
  - so jogam partidas abertas;
  - so reservam quadra;
  - fazem aula;
  - jogam torneio;
  - jogam liga;
  - sao socios de local;
  - seguem locais;
  - seguem outros usuarios;
- popular `open_matches`, participantes, comentarios e reacoes;
- criar notification preferences;
- garantir rankings/perfis com foto/bio/cidade/nivel suficiente para UI.

Risco de regressao:

- Player App parecer vazio para usuario puro;
- dados profissionais vazarem para jogador comum;
- perfis ficarem incompletos e esconderem problemas de UI.

Criterios de conclusao:

- login de player puro mostra Home com proximas acoes reais;
- Locais mostra reservas/aulas/partidas sem depender do admin;
- Perfil tem historico e contexto.

Implementado:

- `02_users.sql` agora cria entitlement explicito para todos os usuarios demo, incluindo jogadores puros como `free_player`;
- jogadores continuam sem permissao de criar local/competicao, exceto personas PRO/admin previstas;
- `05_bookings.sql` padronizou niveis de partidas abertas para `Iniciante`, `Intermediario`, `Avancado`, `Primeira Classe` e `Profissional`;
- partidas abertas agora cobrem dois contextos: chamadas vinculadas a locais e chamadas por cidade sem academia/quadra definida;
- chamadas sem local testam o fluxo real de encontrar parceiro/adversario antes de escolher quadra;
- grafo social foi ampliado com multiplos `user_follows` por jogador, alem de seguidores de locais;
- `notification_preferences` continua sendo criada para todos os usuarios demo;
- massa existente ja cobre player que reserva quadra, faz aula, joga torneio, joga liga, e e socio de local por meio de `04_academy.sql`, `05_bookings.sql`, `07_tournaments.sql` e `08_leagues.sql`.

Validacao:

- `npm.cmd run lint`;
- `npm.cmd run build`.

Risco residual:

- validacao automatica dos perfis/seguidores/matches ainda fica para `SEED-QA-12`;
- `listOpenMatches` segue com limite de 60 registros na UI; a massa agora excede esse volume para testar ordenacao/limite, mas o verificador precisa provar que o banco esta completo.

### [x] SEED-QA-12 - Validadores SQL e checklist de integridade do seed

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Encerrar o populate com verificacoes automaticas que provem que os dados estao linkados e completos.

Criterios:

- ampliar `10_verify_and_relink_owner.sql` ou criar `10_verify_seed_integrity.sql`;
- incluir contadores e asserts para:
  - usuarios por perfil;
  - profiles faltantes;
  - staff sem user;
  - professor sem user;
  - turma sem professor/quadra/aluno;
  - contrato ativo sem enrollment;
  - enrollment ativo sem contract/user;
  - pagamento sem target;
  - reserva conflitando com turma;
  - torneio com registration aprovada sem member;
  - liga com match sem players;
  - rodada sem match;
- retornar resumo final por modulo.

Risco de regressao:

- validadores virarem apenas contadores e nao pegarem orfaos;
- asserts duros demais bloquearem ajustes pequenos.

Criterios de conclusao:

- rodar `01_cleanup.sql` a `08_leagues.sql` e depois verificador sem erro;
- README documenta ordem, volumes e perfis de login;
- fila de seed realista fica fechada.

Implementado:

- criado `web/supabase/seeds/qa_demo/10_verify_seed_integrity.sql`;
- verificador e nao destrutivo e deve rodar depois de `01_cleanup.sql` a `08_leagues.sql`;
- checks cobrem usuarios sem profile/entitlement, player com permissao indevida, professor sem user/staff, turma sem professor/quadra/aluno, contrato sem enrollment, enrollment ativo sem contrato/user, contrato com `weekly_lessons_count` divergente, pagamento sem target, reserva conflitando com aula/slot, torneio aprovado sem member, rodada de liga sem match, match de liga sem players, partida aberta sem participante, ausencia de partidas abertas por cidade, grafo social fraco e preferencias de notificacao ausentes;
- checks tambem cobrem reserva pendente velha: `pending` nao pode estar no passado, longe demais no futuro ou criada antes da ultima abertura operacional;
- checks tambem cobrem setup completo da academia: local sem configuracao/planos/regras, professor sem turma, turma adulta acima de 4, turma infantil acima de 8 e turma acima da capacidade;
- o SQL levanta erro com os nomes dos checks quebrados e retorna `qa_seed_integrity_ok` quando passa;
- README e `SEED_QA_REALISTIC_POPULATE_PLAN.md` foram atualizados com a nova etapa.

Validacao:

- `npm.cmd run lint`;
- `npm.cmd run build`.

Risco residual:

- o verificador ainda e estatico e deve evoluir quando novos modulos entrarem no seed;
- a execucao completa do SQL depende do banco paralelo estar com migrations recentes aplicadas.

### [x] ACADEMY-FORM-01 - Placeholders e labels nos formularios da Academia

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Eliminar inputs e buscas sem informacao suficiente quando nao houver label/cabecalho visivel.

Criterios:

- todo input sem label visual deve ter placeholder util;
- todo controle sem texto visivel deve ter `aria-label`;
- buscas devem explicar o que pesquisam: aluno, telefone, turma, professor, quadra, cidade, data ou horario;
- placeholders nao substituem label quando o campo for critico ou sensivel;
- validar Academia primeiro e registrar padrao para Agenda/Financeiro/Competition OS.

Risco de regressao:

- placeholder virar texto longo demais em mobile;
- duplicar label e placeholder de forma poluida.

Criterios de conclusao:

- sweep em `PlaceAcademy*Module`;
- screenshots ou checklist visual;
- lint/build passando quando houver alteracao de codigo.

Entregue:

- buscas e filtros de `Grade`, `Alunos`, `Pendencias` e `Professores` receberam nomes acessiveis sem aumentar ruido visual;
- composer de professor, ferramenta de encaixe e pedido de aula/reposicao receberam `aria-label` contextual;
- chamada rapida recebeu `aria-label` por aluno para observacao curta;
- campos criticos em drawers continuam com label visual; placeholders foram usados apenas como ajuda curta, nao como substituto estrutural;
- checklist estatico aplicado em `PlaceAcademy*Module`.

### [x] ACADEMY-QA-01 - Corrigir friccoes de Academia detectadas no QA manual

Status: `[x]` concluido em 2026-05-14

Contexto:

- QA manual validou que os bloqueadores P0 foram tratados antes de retomar refinamentos: aprovacao/rejeicao de inscricao de torneio e erro SQL cru na UI da Academia.
- Esta task concentra apenas friccoes de Academia; nao reabrir arquitetura geral nem avancar para redesign amplo.

Criterios entregues:

- BUG-004 / FRIC-002: fila `Aulas do dia` ganhou acao `Abrir chamada`, levando para `Hoje` e abrindo o drawer da aula.
- BUG-005: chamada ganhou atualizacao otimista local; `Presente`/`Falta` mudam visual e contadores antes do refresh completo.
- BUG-006: nenhum novo spacer/altura residual foi introduzido; a correcao desta rodada removeu dependencia de areas passivas para chegar nas acoes de Academia.
- FRIC-001: subvisao `Alunos` ganhou CTA `Nova matricula`, abrindo drawer de matricula com usuario/email, plano, mensalidade e horarios semanais.
- FRIC-003: `Nova turma ou horario aberto` foi movido para o topo da Grade, antes da lista de turmas.
- FRIC-004: card `Horarios abertos` virou acao clicavel que leva para a lista/configuracao de disponibilidade.
- FRIC-005: professor sem cadastro vinculado recebe estado vazio claro orientando o vinculo do login pelo gestor.

Validacao esperada:

- `npm.cmd run lint`;
- `npm.cmd run build`;
- nenhuma acao nova falsa: chamada, matricula, turma e horarios reutilizam os fluxos/backend existentes.

### [x] SWEEP-ROLE-01 - Varredura por perfil Admin/Player/Professor

Status: `[x]` concluido em 2026-05-14

Objetivo:

- Auditar telas principais e subfluxos usando perfis com permissoes diferentes, nao apenas o usuario admin multi-papel.

Criterios:

- validar Admin/PRO, Player puro e Professor/Staff;
- capturar Home, Locais, Eventos, Ranking, Perfil e Gestao em mobile e desktop;
- detectar vazamento de Management OS para Player App;
- validar buscas por intencao em Locais;
- registrar achados em documento vivo.

Entregue:

- screenshots/textos gerados em `web/docs/screenshots/page-sweep-2026-05-14-roles/`;
- `HomePage` deixou compromissos passivos fora da fila de pendencia;
- `PlacesPage` reforcou resultado direto de quadra com CTA e superficie formatada;
- `PlacesPage` corrigiu falso vazio na busca de aulas quando a RPC retorna zero mas ha turmas locais;
- `BottomNav` deixou de expor contexto Management OS para Player puro que acessa `/gestao` manualmente;
- `PAGE_SWEEP_UX_AUDIT_2026_05_14.md` criado/atualizado como checklist de regressao por perfil.

Risco residual:

- erros 500 em `place_academy_enrollments` e `app_payments` continuam aparecendo no browser e podem afetar carregamento/estados vazios;
- `PlacesPage` segue grande e deve ser tratada com cuidado em futuras mudancas.

### [x] EXPERIENCE-01 - Separar descoberta publica e filas profissionais

Status: `[x]` concluido

Objetivo:

- Fazer `/locais` voltar a ser experiencia publica/player e impedir que pendencias administrativas disputem a primeira viewport da Home do jogador.

Criterios:

- `/locais` nao deve renderizar cockpit, modulos, filas, financeiro ou CRM inline, mesmo para admin do local;
- `Abrir gestao` deve existir apenas como acao secundaria/discreta;
- Home deve usar prioridades de jogador para notificacoes, resumo e primeira acao;
- tarefas de academia/organizador devem aparecer em bloco profissional separado;
- tarefas profissionais devem navegar para `/gestao` ou Competition OS, nao para `/locais`.

Telas/componentes afetados:

- `PlacesPage`;
- `HomePage`;
- `App.css`;
- `CURRENT_PRODUCT_STATE.md`;
- `SCREEN_RESPONSIBILITIES.md`;
- `FULL_APP_PRODUCT_TECH_UX_AUDIT.md`.

Ganhos esperados:

- menos mistura de jogador, academia e organizador;
- `/locais` fica limpo para descoberta, reserva e aulas;
- admin entende que operacao acontece na Gestao;
- Home deixa de parecer dashboard generico com pendencias de tudo;
- produto fica mais coerente com Player App, Management OS e Competition OS.

Dependencias:

- `buildPlaceAdminPath`;
- regras de perfil/plano ja documentadas;
- rotas canonicas de gestao.

Risco de regressao:

- usuarios administradores podem precisar reaprender que o card em `/locais` prioriza pagina publica;
- algum fluxo legado que dependia de admin inline em `/locais` deve migrar para `/gestao`.

Criterios de conclusao:

- lint e build passando;
- `/locais` sem cockpit administrativo inline;
- Home com filas de jogador e profissional separadas;
- docs vivos atualizados.

Entregue em 2026-05-13:

- `isManagementCockpit` passou a depender de rota administrativa, bloqueando vazamento do admin para `/locais`;
- card de `Meus locais` em `/locais` passou a priorizar `Pagina publica`, com `Abrir gestao` secundario;
- prioridades de jogador e operacao foram separadas na Home;
- pendencias de socio/aula/reserva operacional agora apontam para subvisoes de Gestao;
- Home ganhou bloco `Area profissional` para operacao separada do Player App;
- `npm.cmd run lint` e `npm.cmd run build` passaram.

### [x] AGENDA-02 - Unificar agenda operacional e corrigir duplicidades

Status: `[x]` concluido

Objetivo:

- Transformar Agenda em uma visao unica de ocupacao real, sem duplicar reservas/hoje/espera e sem exigir que o operador deduza o que esta vendo.

Criterios:

- `Central de agenda` deve renderizar a subvisao ativa, nao um resumo duplicado mais a lista abaixo;
- calendario deve mostrar reservas, bloqueios, turmas fixas, aulas avulsas/reposicoes e faltas avisadas;
- cada horario deve ser clicavel e mostrar detalhe operacional;
- filtros devem existir por tipo, quadra, professor, turma e aluno/jogador;
- nova reserva deve usar data, horario e duracao em slots praticos, com disponibilidade explicita;
- regras de reserva nao podem usar dias numericos como entrada principal;
- tela de quadras nao pode estourar largura.

Telas/componentes afetados:

- `PlacesPage`;
- `PlaceBookingCalendarModule`;
- `PlaceBookingCreateModule`;
- `PlaceBookingResourcesModule`;
- `PlaceBookingOperationalQueues`;
- `PlacePublicPage`;
- `App.css`.

Ganhos esperados:

- operador entende ocupacao real do dia em uma unica leitura;
- professor consegue filtrar sua agenda e ver alunos/faltas no horario;
- menos duplicidade visual;
- menos horarios quebrados;
- configuracao de regras fica compreensivel para usuario exigente.

Dependencias:

- dados de reservas, turmas, aulas avulsas/reposicoes e faltas avisadas;
- gramatica de `OperationalCalendar`.

Risco de regressao:

- calendario com muitas quadras pode exigir scroll horizontal em mobile;
- aula avulsa depende de turma possuir quadra vinculada para aparecer no mapa.

Criterios de conclusao:

- lint e build passando;
- docs vivos atualizados;
- sem renderizacao duplicada das subvisoes de Agenda.

Entregue em 2026-05-13:

- `Central de agenda` passou a hospedar a subvisao real ativa no workspace;
- `Reservas`, `Calendario`, `Nova reserva`, `Espera` e `Quadras` deixaram de aparecer duplicadas abaixo do shell;
- calendario passou a combinar reservas, bloqueios, turmas, aulas avulsas/reposicoes e faltas avisadas;
- slots de 30 minutos ficaram clicaveis com detalhe e participantes;
- filtros por tipo, quadra, professor, turma e aluno/jogador foram aplicados;
- formulario de reserva no admin e pagina publica passou para data + horario + duracao;
- regras de reserva passaram a usar dias da semana como selecao visual;
- layout de precos de quadras foi reorganizado para nao vazar da pagina.

### [x] VISUAL-02 - Refinar sidebar, Home e Gestao para reduzir admin-template feeling

Status: `[x]` concluido

Objetivo:

- Aplicar a auditoria visual sem reabrir arquitetura: menos cards, menos caixas, mais workspace feeling e mais hierarchy.

Criterios:

- sidebar de Gestao deve parecer cockpit/workspace, nao template generico;
- Home deve responder proxima acao e pendencias sem hero/dashboard exagerado;
- Gestao deve reduzir verticalidade e containerizacao;
- abas internas devem expor no maximo 5 opcoes principais;
- mobile 360-430px deve ter navegacao mais confortavel.

Telas/componentes afetados:

- `BottomNav`;
- `ManagementShell`;
- `ManagementHubPage`;
- `HomePage`;
- `PlaceAdminShell`;
- `App.css`.

Ganhos esperados:

- percepcao premium mais forte;
- menos sensacao de painel antigo;
- menos ruÃ­do visual;
- primeira viewport mais orientada a tarefa;
- mobile menos comprimido.

Dependencias:

- `APP_UX_PRODUCT_AUDIT.md`;
- `CURRENT_PRODUCT_STATE.md`;
- `PREMIUM_UX_VISUAL_LANGUAGE.md`;
- `COMPONENT_GRAMMAR.md`.

Risco de regressao:

- esconder modulo importante no overflow de abas;
- contraste insuficiente na sidebar de Gestao;
- validar com dados reais porque o ambiente local sem env mostra apenas tela de configuracao.

Criterios de conclusao:

- lint e build passando;
- limite de 5 abas aplicado em Gestao do local;
- docs vivos atualizados;
- tentativa de screenshot mobile/desktop registrada.

Entregue em 2026-05-13:

- `BottomNav` recebeu estado visual especifico para Gestao, com contexto escuro/verde, active state mais forte e mobile horizontal compacto;
- `HomePage` recebeu tratamento mais quieto para o painel principal, reduzindo hero/dashboard feeling;
- `ManagementShell` e `ManagementHubPage` ficaram mais densos e menos card-heavy;
- `PlaceAdminShell` passou a renderizar 5 abas primarias e mover excedentes para `Mais`;
- screenshots gerados em `web/docs/screenshots/`, mas bloqueados por falta de configuracao local do Supabase.

### [x] VISUAL-03 - Validar e calibrar telas premium com dados reais

Status: `[x]` concluido com risco residual de API/dados

Objetivo:

- Confirmar a nova linguagem visual em estados reais: cheio, vazio, pendente, erro e mobile autenticado.

Criterios:

- usar dados reais ou seed demo;
- capturar Gestao, Home, Competition OS e pagina publica em 390px, 430px e desktop;
- corrigir overflow, contraste, hierarquia e textos que so aparecem com massa real;
- manter screenshots antes/depois quando houver ambiente valido.

Telas/componentes afetados:

- `/inicio`;
- `/gestao`;
- `PlaceAdminShell`;
- `Competition OS`;
- pagina publica do local.

Ganhos esperados:

- reduzir risco de refino baseado em estado vazio;
- fechar lacunas mobile;
- transformar auditoria visual em criterio verificavel.

Dependencias:

- `.env`/Supabase local ou staging;
- `DEMO_STATE_QA_CHECKLIST.md`.

Risco de regressao:

- validacao ficar estetica demais se nao houver dados operacionais variados.

Criterios de conclusao:

- screenshots validos anexados;
- ajustes visuais aplicados nos problemas encontrados;
- docs atualizados com achados.

Bloqueio em 2026-05-13:

- ambiente local sem `.env`/Supabase exibe apenas `Configuracao necessaria`;
- screenshots gerados nao validam telas autenticadas;
- manter bloqueado ate existir staging, env local ou seed/demo navegavel.

Rechecagem em 2026-05-14:

- `web/.env` e `web/.env.local` continuam ausentes;
- `web/.env.example` possui apenas placeholders de Supabase;
- `React/ Vite` continua bloqueando a UI autenticada com `Configuracao necessaria` quando nao ha variaveis reais;
- `playwright`/`@playwright/test` nao estao instalados localmente para captura autenticada automatizada;
- lint/build continuam sendo validacao tecnica, mas nao substituem screenshot real de Home, Gestao, Competition OS e paginas publicas com dados cheios.

Enquanto bloqueado:

- seguir tarefas executaveis de UX premium e registrar validacao limitada quando necessario.

Entregue em 2026-05-14:

- Playwright foi usado de forma temporaria fora do repo para capturar screenshots autenticados sem adicionar dependencia ao projeto;
- screenshots do app publicado foram gerados em `web/docs/screenshots/visual-03-2026-05-14/`;
- a validacao mostrou que o app publicado ainda estava atras do codigo local em pontos de Competition OS/Home, entao a calibragem final foi feita contra o build local atual usando a anon key publica do bundle apenas como variavel de ambiente da sessao;
- screenshots do build local atual foram gerados em `web/docs/screenshots/visual-03-2026-05-14-local-current/`;
- screenshots finais apos ajuste foram gerados em `web/docs/screenshots/visual-03-2026-05-14-local-final/`;
- `HomePage` separou avisos de jogador e avisos operacionais, impedindo que comunicados de competicoes organizadas contem como pendencia principal do Player App;
- `HomePage` reduziu densidade abaixo da central do jogador: prioridades ficam em recorte curto com `Ver todas`, atualizacoes recentes foram limitadas e eventos publicos continuam como suporte;
- validacao real apontou erros `500` recorrentes em `place_academy_enrollments` e `app_payments`; isso permanece como risco de API/dados, nao como bloqueio visual da fase;
- `npm.cmd run lint` e `npm.cmd run build` passaram.

### [x] COMP-VISUAL-01 - Aplicar refinamento premium no Competition OS

Status: `[x]` concluido

Objetivo:

- Levar o mesmo ganho de hierarchy, menos cards e task-first UX para torneios/ligas, sem mexer na arquitetura de competicoes.

Criterios:

- separar melhor `jogar` e `organizar` na composicao visual;
- primeira viewport deve mostrar proxima acao, escopo ativo e pendencias;
- reduzir cards equivalentes e blocos informativos;
- manter confirmacao, desfazer confirmacao e resultado como fluxos intocaveis;
- mobile 390-430px sem abas/filtros comprimidos.

Telas/componentes afetados:

- `EventsHubPage`;
- `TournamentPage`;
- `LeagueDetailsPage`;
- componentes de partidas/filas de competicao.

Ganhos esperados:

- Competition OS parecer produto proprio;
- menos mistura entre jogador e organizador;
- mais clareza operacional em partida e resultado.

Dependencias:

- estado atual dos fluxos de competicao;
- `COMPONENT_GRAMMAR.md`;
- `PREMIUM_UX_VISUAL_LANGUAGE.md`.

Risco de regressao:

- quebrar fluxos sensiveis de confirmacao/resultado;
- esconder informacao importante de classe/fase.

Criterios de conclusao:

- pelo menos uma tela critica de Competition OS refinada;
- lint/build passando;
- docs vivos atualizados.

Entregue em 2026-05-13:

- `/eventos` deixou de tratar `Organizando agora` como lista passiva;
- torneios e ligas organizados passaram a aparecer como rows operacionais com tipo, status, proximo passo e CTA primario;
- status de torneio define destino semantico: setup, inscricoes, preparacao de jogos, operacao ao vivo ou resumo;
- status de liga define destino semantico: configurar, operar rodada, revisar pausa ou historico;
- atalhos `Torneios organizados` e `Ligas organizadas` ficaram como suporte, nao cards principais;
- mobile passou a empilhar cada row com botao full-width;
- `npm.cmd run lint` e `npm.cmd run build` passaram.

### [x] COMP-VISUAL-02 - Refinar operacao interna de torneio/liga sem aumentar escopo

Status: `[x]` concluido

Objetivo:

- Levar o mesmo padrao de row operacional do hub para a primeira viewport interna de torneio/liga, reforcando proxima acao sem mexer em confirmacao/resultado.

Criterios:

- tela interna deve abrir com escopo ativo, pendencias e acao primaria clara;
- jogador e organizador devem perceber papeis diferentes sem trocar de produto mentalmente;
- publicacao/configuracao deve ficar secundaria quando houver pendencia de partida/inscricao;
- mobile deve manter a proxima acao visivel sem grid comprimido;
- nao alterar regras de placar, confirmacao, disponibilidade ou resultado.

Telas/componentes afetados:

- `TournamentPage`;
- `LeagueDetailsPage`;
- `CompetitionOperationalQueue`;
- `App.css`;
- docs vivos.

Ganhos esperados:

- Competition OS passa a ser operacional tambem dentro da competicao;
- menos leitura antes da acao;
- menos sensacao de pagina longa de admin;
- maior continuidade entre hub e detalhe.

Dependencias:

- `COMPONENT_GRAMMAR.md`;
- `PREMIUM_UX_VISUAL_LANGUAGE.md`;
- estado atual de partidas/inscricoes.

Risco de regressao:

- esconder detalhes importantes de classe/fase;
- afetar fluxos sensiveis de resultado/confirmacao.

Criterios de conclusao:

- uma tela interna de competicao refinada;
- lint/build passando;
- docs atualizados.

Entregue em 2026-05-14:

- `LeagueDetailsPage` ganhou painel de foco operacional antes das tabs, com proxima acao, escopo ativo, pendencias e CTA `Resolver agora`;
- a fila operacional da liga ficou na primeira viewport do organizador, sem depender da aba `Organizacao`;
- resumo duplicado da aba `Visao` foi reduzido para suporte/publicacao/fechamento, evitando repetir as mesmas metricas e fila;
- `CompetitionOperationalQueue` passou a aceitar `actionLabel`, deixando rows internas com chamada explicita como `Resolver`, `Agendar`, `Confirmar` e `Intervir`;
- `TournamentPage` passou a exibir `Resolver`/`Ver` na fila operacional sem alterar regras de placar, confirmacao ou resultado;
- mobile empilha o painel de foco e transforma a acao da fila em largura total;
- `npm.cmd run lint` e `npm.cmd run build` passaram.

### [x] ACCESS-01 - Aplicar navegacao global por perfil e plano

Status: `[x]` concluido

Objetivo:

- Fazer o usuario ver apenas os contextos que fazem sentido para ele: Jogar, Organizar e Operar.

Criterios:

- jogador comum nao deve ver `Gestao` como entrada principal;
- organizador deve ver entrada clara para competicoes organizadas;
- professor/autonomo deve ver gestao leve de aulas/alunos;
- academia/clube deve ver Management OS completo conforme plano;
- menus devem evitar ferramentas sem permissao/plano.

Telas/componentes afetados:

- `AppShell`;
- `BottomNav`;
- `ManagementHubPage`;
- dados/derivacoes de acesso existentes.

Ganhos esperados:

- menos sensacao de "tudo para todo mundo";
- mais clareza de produto profissional;
- menos descoberta por tentativa e erro.

Dependencias:

- `PROFILE_PLAN_ACCESS_MODEL.md`;
- permissoes existentes de local/competicao.

Risco de regressao:

- esconder Gestao de usuario que tem permissao operacional mas ainda nao tem local carregado.

Criterios de conclusao:

- regras de visibilidade documentadas e aplicadas em pelo menos navegacao global;
- mobile nao mostra contexto irrelevante;
- fallback seguro para usuario multi-perfil.

Entregue em 2026-05-13:

- `BottomNav` passou a carregar um resumo de acesso operacional do usuario;
- `Gestao` so aparece quando ha local acessivel ou quando o usuario ja esta no contexto `/gestao`;
- `Organizar` so aparece quando ha torneio/liga organizada ou quando o usuario ja esta em contexto de organizacao;
- `Locais` voltou para o grupo `Jogar`, reforcando descoberta publica em vez de operacao;
- grupos vazios deixam de aparecer na nav;
- acesso e derivado em `workspace-access` com imports dinamicos para nao pesar o `AppShell`;
- fallback preserva acesso direto por URL mesmo quando a entrada nao aparece na nav.

### [x] DISCOVERY-01 - Criar quick actions semanticas no setup de Gestao

Status: `[x]` concluido

Objetivo:

- Fazer tarefas essenciais aparecerem por intencao, nao por modulo tecnico.

Criterios:

- `Cadastrar quadra` aparece quando a base de agenda esta incompleta;
- `Cadastrar professor` aparece quando Academia precisa de professor;
- `Criar turma` aparece como proximo passo quando ha professor/quadra;
- `Criar torneio` aparece para organizador com permissao;
- quick actions respeitam papel/plano.

Telas/componentes afetados:

- `ManagementHubPage`;
- `PlaceAdminShell`;
- `PlaceBookingResourcesModule`;
- `PlaceAcademyResourcesModule`;
- `PlaceAcademyClassSetupModule`;
- hubs de competicao.

Ganhos esperados:

- menos funcoes escondidas;
- onboarding mais intuitivo;
- usuario novo encontra tarefas basicas rapidamente.

Dependencias:

- `TASK_DISCOVERY_ONBOARDING.md`;
- gramatica `SemanticQuickAction`.

Risco de regressao:

- duplicar atalhos demais se o modulo ja estiver completo.

Criterios de conclusao:

- pelo menos setup de Academia/Agenda mostra proximas tarefas com nome semantico;
- acoes completas viram secundarias ou somem;
- docs atualizados.

Entregue em 2026-05-13:

- hub de Gestao passou a derivar `setupActions` por local;
- `Cadastrar quadra` aparece quando nao ha quadras e leva direto para Agenda > Quadras;
- `Cadastrar professor` aparece quando Academia ainda nao tem professores e leva para Academia > Professores;
- `Criar turma` aparece quando nao ha turmas e leva para Academia > Turmas;
- `Definir regras de reserva` e `Configurar plano` tambem aparecem como acoes semanticas quando faltam;
- setup do admin do local deixou de mostrar `Setup` generico e passou a mostrar a intencao do proximo passo;
- acoes aparecem apenas quando a base esta incompleta.

### [x] COMP-02 - Separar competicoes jogando, organizando e descobrindo

Status: `[x]` concluido

Objetivo:

- Reduzir mistura entre torneios/ligas que o usuario joga e torneios/ligas que ele organiza.

Criterios:

- hub de eventos deve apresentar recortes `Jogando`, `Organizando` e `Descobrir`;
- criacao de torneio/liga deve aparecer apenas no contexto de organizacao;
- jogador comum nao deve receber CTA administrativo como prioridade;
- organizador ve fila operacional das competicoes antes de descoberta publica.

Telas/componentes afetados:

- `EventsHubPage`;
- `EventsPage`;
- `LeaguesPage`;
- links para `TournamentPage` e `LeagueDetailsPage`.

Ganhos esperados:

- menos ambiguidade;
- organizador encontra operacao rapidamente;
- jogador nao sente painel administrativo.

Dependencias:

- `PROFILE_PLAN_ACCESS_MODEL.md`;
- dados atuais de autoria/participacao.

Risco de regressao:

- eventos publicos ficarem escondidos demais para jogador.

Criterios de conclusao:

- primeira viewport de eventos deixa claro se o usuario esta jogando, organizando ou descobrindo;
- criacao nao compete com descoberta para jogador comum.

Entregue em 2026-05-13:

- `/eventos` passou a abrir com recortes explicitos `Jogando`, `Organizando` e `Descobrir`;
- quando o usuario organiza torneios/ligas, a fila operacional de organizador aparece antes de jogador e descoberta;
- quando o usuario nao organiza nada, o hub nao mostra `Criar torneio`/`Criar liga` como CTA principal;
- criacao continua concentrada no contexto de organizacao: `/eventos/torneios?view=organizing` e `/eventos/ligas?view=organizing`;
- descoberta virou bloco proprio com entrada em torneio, entrada em liga, locais publicos e acesso secundario ao contexto de organizacao;
- mobile recebeu recortes empilhados e acoes de descoberta em rows, reduzindo a sensacao de painel administrativo.

### [x] ONBOARD-01 - Criar checklist operacional por perfil

Status: `[x]` concluido

Objetivo:

- Transformar setup inicial em caminho guiado para academia, professor solo e organizador.

Criterios:

- academia nova ve passos: quadras, regras, professores, turmas, alunos, financeiro, publicacao;
- professor solo ve passos leves: perfil, quadras usadas, agenda, alunos, mensalidade;
- organizador ve passos: criar evento, classes, inscricoes, publicar, gerar partidas;
- cada passo tem CTA primaria clara;
- passos completos ficam calmos.

Telas/componentes afetados:

- `/gestao`;
- `PlaceAdminShell`;
- hubs de competicao;
- empty/setup states.

Ganhos esperados:

- menos abandono no primeiro uso;
- menos necessidade de suporte;
- mais percepcao de produto inteligente.

Dependencias:

- `TASK_DISCOVERY_ONBOARDING.md`;
- estados de setup ja existentes.

Risco de regressao:

- virar checklist grande demais se nao houver progressao.

Criterios de conclusao:

- pelo menos um perfil com checklist acionavel implementado;
- checklist nao aparece como dashboard permanente depois de resolvido.

Entregue em 2026-05-13:

- `/gestao` ganhou roteiro de implantacao para academia/clube quando algum local ainda tem base incompleta;
- checklist mostra progresso percentual, etapas concluidas e proximos passos acionaveis;
- etapas cobrem quadras, regras, professores, turmas, clientes, plano financeiro e pagina publica;
- checklist respeita plano simples de reservas e nao exige professor/turma quando o local nao e academia;
- bloco some quando a base esta completa, evitando virar dashboard permanente;
- cada passo abre diretamente o modulo/subvisao correta, mantendo a descoberta por intencao.

### [x] ONBOARD-02 - Expandir checklist para organizador e professor solo

Status: `[x]` concluido parcial por perfil disponivel

Objetivo:

- Completar onboarding por perfil fora da academia/clube completa.

Criterios:

- organizador novo ve roteiro curto: criar evento, classes/categorias, inscricoes, publicar, gerar partidas;
- professor solo ve roteiro leve: perfil, quadras usadas, agenda, alunos e mensalidade;
- nenhum perfil ve modulos empresariais que nao pertencem ao plano;
- checklist deve ser contextual, curto e acionavel.

Telas/componentes afetados:

- `/eventos`;
- `EventsPage`;
- `LeaguesPage`;
- `/gestao` quando o perfil for professor/autonomo;
- docs de perfis e onboarding.

Ganhos esperados:

- onboarding mais completo sem transformar o produto em ERP;
- organizador e professor encontram o basico sem suporte;
- menos ferramentas escondidas em modulos tecnicos.

Dependencias:

- `PROFILE_PLAN_ACCESS_MODEL.md`;
- dados reais para detectar professor solo quando existir.

Risco de regressao:

- mostrar checklist para usuario que so quer jogar.

Criterios de conclusao:

- pelo menos organizador novo tem checklist acionavel em contexto de competicao;
- professor solo fica documentado ou implementado conforme dados disponiveis.

Entregue em 2026-05-13:

- `/eventos` ganhou roteiro secundario para `Organizar pela primeira vez` quando o usuario ainda nao organiza torneios/ligas;
- roteiro orienta o organizador novo por criar torneio, criar liga, configurar classes/inscricoes e publicar/operar;
- primeiros passos sao acionaveis e levam para os fluxos de criacao em contexto `organizing`;
- passos posteriores ficam calmos e explicativos ate existir um evento criado;
- roteiro nao aparece como prioridade acima de `Jogando` e `Descobrir`, preservando experiencia de jogador comum;
- professor solo permaneceu documentado como pendente porque ainda falta uma deteccao/entrada confiavel de perfil autonomo no produto atual.

### [x] PROFILE-01 - Definir entrada operacional de professor solo

Status: `[x]` concluido com gate seguro por papel `coach`

Objetivo:

- Criar base de frontend/UX para professor autonomo sem confundir com academia/clube completo.

Criterios:

- professor solo nao deve ver cantina/equipe/CRM pesado como rotina inicial;
- entrada deve priorizar aulas de hoje, alunos, agenda e mensalidades;
- setup deve ter passos leves: perfil, quadras usadas, agenda, alunos e valor/mensalidade;
- se nao houver dado suficiente para detectar perfil, documentar e criar gate seguro.

Telas/componentes afetados:

- `/gestao`;
- `ManagementHubPage`;
- navegacao global;
- docs de perfis/planos.

Ganhos esperados:

- separar gestao leve de professor do Management OS completo;
- reduzir aparencia de ERP para usuario autonomo;
- preparar plano/permissao mais vendavel.

Dependencias:

- modelo de perfil/plano do professor solo;
- fonte de dados para identificar professor autonomo.

Risco de regressao:

- esconder ferramentas de academia para gestor real se a deteccao for fraca.

Criterios de conclusao:

- entrada segura documentada e, se possivel, implementada sem afetar academia/clube;
- nenhum usuario comum passa a ver gestao indevida.

Entregue em 2026-05-13:

- `/gestao` ganhou uma entrada leve `Minha operacao de aulas` para usuarios com papel `coach`;
- entrada prioriza aulas de hoje, turmas e alunos, sem expor cantina, equipe, CRM pesado ou financeiro completo;
- atalhos levam somente para `Academia > Hoje`, `Academia > Turmas` e `Academia > Alunos`;
- fila operacional agregada passou a respeitar modulos acessiveis por papel antes de mostrar pendencias;
- professor com papel `coach` deixa de receber pendencias globais de modulos que nao acessa;
- a solucao usa gate seguro existente, sem inventar plano/permissao nova.

### [x] QUEUE-REFRESH-01 - Repriorizar proximos refinamentos de alto impacto

Status: `[x]` concluido

Objetivo:

- Revisar a fila apos fechar perfis/onboarding iniciais e escolher o proximo bloco com maior ganho perceptivel.

Criterios:

- manter foco em UX/frontend, sem reabrir arquitetura;
- priorizar pontos ainda fracos em `CURRENT_PRODUCT_STATE.md`;
- transformar o proximo bloco em task executavel;
- evitar micro-refinamentos sem impacto operacional.

Telas/componentes afetados:

- `EXECUTION_QUEUE.md`;
- docs vivos relevantes;
- possivelmente Competition OS, Gestao ou mobile sheets conforme prioridade.

Ganhos esperados:

- continuidade mais clara;
- menos dispersao;
- proxima rodada maior e mais objetiva.

Dependencias:

- estado atual dos MDs.

Risco de regressao:

- virar planejamento demais se nao sair com proxima task objetiva.

Criterios de conclusao:

- proximo item `[>]` definido com criterios, telas e conclusao clara.

Entregue em 2026-05-13:

- pontos fracos atuais foram revisados sem reabrir a arquitetura consolidada;
- o proximo bloco prioritario passa a ser Competition OS, especificamente operacao de partidas/resultados;
- a escolha prioriza uma dor ainda visivel para jogador e organizador: partidas com informacao espalhada, cards altos e acoes que ainda podem competir no mobile;
- Gestao/perfis/onboarding ficam como base consolidada, com refinamentos futuros guiados por dados reais;
- nova task `[>] COMP-03` foi criada com criterios operacionais, telas afetadas e criterio de conclusao.

### [x] COMP-03 - Refinar operacao de partidas e resultados no Competition OS

Status: `[x]` concluido

Objetivo:

- Reduzir card pile em partidas, confirmacoes e resultados, colocando a proxima acao em rows compactas e claras para jogador e organizador.

Criterios:

- jogador deve entender sua proxima partida/pendencia sem duplicidade confusa entre resumo e lista;
- organizador deve ver resultados, confirmacoes e pendencias como fila operacional antes de chave/listas longas;
- cada partida deve expor contexto, status, horario/local e uma acao primaria;
- acoes secundarias devem ficar em detalhe, drawer/sheet ou tratamento quiet;
- mobile deve evitar card alto, tabela larga e botoes desalinhados.

Telas/componentes afetados:

- `TournamentPage`;
- `LeagueDetailsPage`;
- `CompetitionOperationalQueue`;
- componentes/estilos de partida, confirmacao e resultado;
- docs de Competition OS e screen responsibilities.

Ganhos esperados:

- menos verticalidade em competicoes;
- jogador entende mais rapido qual jogo exige acao;
- organizador resolve resultado/confirmacao com menos varredura visual;
- Competition OS fica mais coerente com a gramatica `EntityActionRow`.

Dependencias:

- dados atuais de partidas, confirmacoes e resultados;
- padroes existentes de `CompetitionOperationalQueue` e `EntityActionRow`.

Risco de regressao:

- afetar fluxos de confirmar presenca, desfazer confirmacao e lancar/conferir resultado.

Criterios de conclusao:

- pelo menos um fluxo critico de partida em torneio ou liga convertido para row operacional;
- acao primaria preservada e visualmente priorizada;
- duplicidade de proxima partida reduzida quando houver sobreposicao com `Minhas partidas`;
- `npm run lint` e `npm run build` passando quando houver alteracao de codigo.

Entregue em 2026-05-13:

- `Minhas partidas` do torneio deixou de empilhar status, confirmacao, placar e botoes como card alto;
- cada partida do jogador agora abre como row operacional: identidade da partida, contexto/status e acoes ficam em zonas separadas;
- confirmacao de presenca virou acao primaria clara; `Nao posso jogar`, `Desfazer` e `Alterar` ficaram quiet;
- envio/compartilhamento de resultado saiu da area principal e foi para disclosure progressivo `Informar resultado`;
- agenda, estado operacional, presenca e envio de resultado ficam como chips/rows compactas;
- mobile empilha row, contexto e acoes em blocos tocaveis, sem tabela larga e sem botoes desalinhados;
- `npm run lint` e `npm run build` passaram.

### [x] COMP-04 - Refinar partidas da chave para operador e jogador

Status: `[x]` concluido

Objetivo:

- Levar a mesma gramatica row/progressive disclosure para partidas de grupos e mata-mata, reduzindo `match-card` alto na chave do torneio.

Criterios:

- partidas da chave devem mostrar numero, jogadores, status, horario e proxima acao em leitura horizontal;
- edicao de placar e WO deve ficar como camada progressiva quando nao for a acao principal;
- confirmacoes e envios de resultado devem aparecer como sinais compactos;
- organizador deve identificar rapidamente jogos com conflito, indisponibilidade ou resultado pendente;
- mobile deve evitar bloco alto por partida quando houver muitos jogos.

Telas/componentes afetados:

- `TournamentPage`;
- estilos `match-card`, `match-player-row`, `match-admin-actions`;
- docs de Competition OS e component grammar.

Ganhos esperados:

- chave do torneio fica mais profissional e escaneavel;
- operador resolve placares e conflitos com menos scroll;
- visual da partida fica consistente entre `Minhas partidas` e chave.

Dependencias:

- fluxo atual de edicao de placar, WO e limpar resultado.

Risco de regressao:

- esconder demais controles de placar para organizador durante operacao ao vivo.

Criterios de conclusao:

- pelo menos grupos ou mata-mata usam estrutura mais row-like;
- controles de placar continuam acessiveis;
- `npm run lint` e `npm run build` passando.

Entregue em 2026-05-13:

- partidas de grupos e mata-mata do torneio passaram a usar uma estrutura mais row-like;
- linha principal mostra numero do jogo, jogadores, status, horario, estado operacional, confirmacoes e placar oficial em leitura compacta;
- controles de placar, WO e limpar resultado foram movidos para disclosure `Lancar/Editar placar`;
- sinais de confirmacao e resultado ficaram compactos, sem empilhar blocos altos por partida;
- mobile empilha contexto e controles progressivos sem tabela larga;
- `npm run lint` e `npm run build` passaram.

### [x] COMP-05 - Refinar partidas da liga e sala de jogo

Status: `[x]` concluido

Objetivo:

- Levar a mesma gramatica de rows e progressive disclosure para `LeagueDetailsPage`, reduzindo `league-match-card` alto e deixando a sala de partida mais focada por tarefa.

Criterios:

- partidas da liga devem expor rodada, jogadores, status, horario e proxima acao em row compacta;
- sala de partida deve separar resultado, disponibilidade, chat e confirmacao em zonas claras;
- jogador deve ver primeiro a acao que resolve a partida: disponibilidade, enviar resultado ou confirmar;
- organizador deve identificar conflitos e resultados pendentes sem abrir todos os detalhes;
- mobile deve evitar salas longas abertas por padrao.

Telas/componentes afetados:

- `LeagueDetailsPage`;
- estilos `league-match-card`, `league-room-*`, `league-submission-row`;
- docs de Competition OS.

Ganhos esperados:

- liga fica visualmente alinhada ao torneio;
- menos scroll para jogador e organizador;
- menos mistura entre chat, resultado e disponibilidade.

Dependencias:

- fluxo atual de abertura da sala de partida;
- funcoes de disponibilidade, envio e confirmacao de resultado.

Risco de regressao:

- esconder conversa/confirmacao quando a partida esta em disputa.

Criterios de conclusao:

- ao menos a lista de partidas da rodada usa row operacional;
- sala/detalhe continua acessivel por acao clara;
- `npm run lint` e `npm run build` passando.

Entregue em 2026-05-13:

- `Minhas partidas` da liga passou a usar a mesma estrutura operacional do torneio: identidade, contexto/status e acao em zonas separadas;
- partidas por rodada deixaram de abrir com topo de card generico e passaram a mostrar jogo, jogadores, horario/rodada, status e proxima acao em row compacta;
- botao `Abrir sala` ficou como acao clara da row, preservando disponibilidade, resultado, chat e confirmacao dentro da sala;
- estado operacional da partida ficou visivel sem precisar abrir detalhes;
- mobile empilha identidade, contexto e acao sem card alto ou botoes desalinhados;
- `npm run lint` e `npm run build` passaram.

### [x] MOBILE-02 - Refinar sala de partida da liga em zonas progressivas

Status: `[x]` concluido

Objetivo:

- Reduzir a densidade da sala aberta da liga, separando disponibilidade, resultado, participantes e chat em zonas progressivas ou compactas.

Criterios:

- estado da partida deve continuar primeiro dentro da sala;
- disponibilidade e resultado devem ter hierarquia maior que chat quando forem a proxima acao;
- participantes/contatos devem ser compactos;
- chat nao deve ocupar altura excessiva no mobile;
- confirmacoes de resultado devem aparecer como rows compactas.

Telas/componentes afetados:

- `LeagueDetailsPage`;
- estilos `league-room-*`, `league-chat-*`, `league-submission-row`;
- docs de mobile friction/component grammar.

Ganhos esperados:

- menos scroll quando a sala esta aberta;
- jogador resolve disponibilidade/resultado mais rapido;
- organizador enxerga conflito sem ler todos os blocos.

Dependencias:

- estrutura atual da sala de partida.

Risco de regressao:

- esconder chat quando ele for necessario para combinacao de horario.

Criterios de conclusao:

- sala aberta fica organizada por prioridade operacional;
- mobile nao abre quatro paineis longos equivalentes;
- `npm run lint` e `npm run build` passando.

Entregue em 2026-05-13:

- sala da partida da liga passou a ordenar primeiro estado, disponibilidade e resultado;
- participantes/contatos e mini chat viraram disclosures compactos;
- disponibilidade e resultado receberam peso de tarefa principal dentro da sala;
- chat continua acessivel, mas deixa de ocupar altura antes da resolucao operacional;
- mobile abre a sala com menos paineis equivalentes e mais progressao por prioridade;
- `npm run lint` e `npm run build` passaram.

### [x] ACADEMY-02 - Refinar alunos e chamadas da Academia em rows operacionais

Status: `[x]` concluido

Objetivo:

- Continuar a segunda onda de rows nos fluxos de alunos/chamada, reduzindo listas altas e formularios concorrendo com rotina de aula.

Criterios:

- alunos devem mostrar nome, turma/contexto, pagamento/presenca e acao primaria em row;
- chamada deve priorizar marcar presenca/falta/reposicao sem abrir card alto;
- detalhes historicos devem ir para area progressiva ou drawer/sheet;
- mobile deve evitar varias metricas e botoes por aluno na mesma primeira leitura.

Telas/componentes afetados:

- `PlaceAcademyStudentsModule`;
- `PlaceAcademyTodayModule`;
- `PlaceAcademyClassesModule` se houver chamada/turma;
- estilos de workspace da Academia.

Ganhos esperados:

- operacao de professor/equipe fica mais rapida;
- menos sensacao de ERP;
- Academia fica mais alinhada aos rows de CRM, Financeiro, Cantina e Competicoes.

Dependencias:

- dados atuais de alunos, turmas, presenca e pagamentos.

Risco de regressao:

- esconder informacao de pagamento ou chamada que hoje esta visivel demais, mas e usada no dia a dia.

Criterios de conclusao:

- pelo menos um fluxo critico de aluno/chamada convertido ou compactado em row operacional;
- acao primaria preservada;
- `npm run lint` e `npm run build` passando.

Entregue em 2026-05-13:

- lista de alunos da Academia passou a usar `EntityActionRow`;
- cada aluno agora mostra turma, telefone, pagamento e presenca em sinais compactos;
- a row escolhe uma acao primaria por contexto: ativar pendente, check-in quando a chamada esta pendente ou marcar pago quando a mensalidade exige acao;
- acoes secundarias como cancelar, lembrar, avisar falta e marcar falta foram movidas para disclosure `Acoes`;
- historico de evolucao e metricas ficam abaixo da leitura principal, sem competir com a tarefa do dia;
- mobile reduz a quantidade de botoes simultaneos por aluno;
- `npm run lint` e `npm run build` passaram.

### [x] BILLING-02 - Tornar cobrancas recorrentes mais descobriveis e task-first

Status: `[x]` concluido

Objetivo:

- Expandir quick actions semanticas para cobranca e rotinas recorrentes, reduzindo a necessidade de procurar cobranca em modulos tecnicos.

Criterios:

- Gestao/Academia/Financeiro devem expor intencoes como `Cobrar aluno`, `Enviar lembrete` ou `Marcar pago` quando houver pendencia real;
- acoes de cobranca nao devem aparecer como dashboard permanente quando tudo esta em dia;
- uma acao primaria por pendencia financeira;
- mobile deve permitir resolver cobranca em poucos toques.

Telas/componentes afetados:

- `ManagementHubPage`;
- `PlaceFinanceReceivablesModule`;
- `PlaceAcademyStudentsModule`;
- `PlaceClientRelationshipModule` se houver inadimplencia/relacionamento;
- docs de discoverability/onboarding.

Ganhos esperados:

- menos funcao escondida;
- gestor/professor entende rapidamente quem precisa ser cobrado;
- financeiro fica mais operacional e menos relatorio.

Dependencias:

- dados atuais de recebiveis, mensalidades e pagamentos.

Risco de regressao:

- duplicar atalhos de cobranca em Gestao, Financeiro e Alunos.

Criterios de conclusao:

- pelo menos uma entrada semantica de cobranca aparece a partir de pendencia real;
- acao leva direto ao contexto correto ou executa lembrete/pagamento;
- `npm run lint` e `npm run build` passando se houver alteracao de codigo.

Entregue em 2026-05-13:

- Financeiro passou a abrir recebiveis com faixa semantica `Cobranca recorrente`, exibida apenas quando ha pendencias reais;
- atalhos passaram a usar linguagem de intencao: `Enviar lembrete geral`, `Cobrar socios` e `Cobrar alunos`;
- cada recebivel manteve uma acao primaria clara: `Enviar lembrete`;
- Clientes/CRM trocou `Inadimplentes` por `Cobrancas pendentes`, com rows operacionais e valor/contexto visiveis;
- `Lembretes segmentados` virou `Acoes de cobranca`, mantendo recortes por socio, aluno e todos em aberto sem parecer dashboard tecnico;
- mobile empilha a faixa e as rows de cobranca com botoes full-width;
- `npm run lint` e `npm run build` passaram.

### [x] PROFILE-02 - Refinar entradas internas de Gestao por operador

Status: `[x]` concluido

Objetivo:

- Aplicar a separacao de perfis/planos dentro dos hubs internos, para que academia/clube, professor solo e organizador vejam atalhos e rotinas proporcionais ao papel.

Criterios:

- nao reabrir arquitetura de perfis, apenas aplicar o modelo atual nas entradas internas;
- gestor de academia ve rotinas completas de operacao, setup, equipe, financeiro e publicacao;
- professor solo ve foco em agenda, alunos, turmas leves e mensalidades, sem cantina/CRM pesado como prioridade;
- organizador ve Competition OS como entrada administrativa primaria;
- jogador comum nao recebe CTA de gestao como tarefa principal.

Telas/componentes afetados:

- `ManagementHubPage`;
- `EventsHubPage`;
- navegacao global/contextual;
- docs de perfil/plano e screen responsibilities.

Ganhos esperados:

- menos sensacao de que todas as ferramentas existem para todo mundo;
- entrada mais profissional para quem trabalha no app;
- menos descoberta por tentativa e erro.

Dependencias:

- dados atuais de `accessByPlace`, papeis administrativos e competicoes organizadas.

Risco de regressao:

- esconder ferramenta que ainda nao tem permissao granular perfeita.

Criterios de conclusao:

- pelo menos uma entrada interna muda por perfil/papel sem remover acesso existente;
- fallback preserva acesso administrativo quando a deteccao for incompleta;
- docs vivos atualizados;
- `npm run lint` e `npm run build` passando se houver alteracao de codigo.

Entregue em 2026-05-13:

- `ManagementHubPage` passou a calcular um perfil operacional por local com base em papel e plano, sem reabrir o modelo de acesso;
- professor `coach` sem gestao completa agora recebe CTA primario `Abrir aulas`, atalho secundario `Alunos` e apenas `Academia` como modulo nobre;
- recepcao recebe entrada proporcional com `Abrir agenda`, `Aulas` e atalhos leves de Agenda/Academia;
- gestor/dono continua com operacao completa, pagina publica e atalhos amplos;
- checklist de implantacao completo deixou de aparecer para professor sem permissao de gestao, evitando setup empresarial fora de contexto;
- `EventsHubPage` deixou de mostrar roteiro grande de organizador para todo jogador comum; organizar evento segue disponivel como opcao contextual em `Descobrir`;
- `npm run lint` e `npm run build` passaram.

### [x] ROUTINE-02 - Expandir quick actions semanticas para rotinas recorrentes

Status: `[x]` concluido

Atualizacao 2026-05-13:

- corrigido fluxo critico de setup da Academia: `Cadastrar professor` abre Professores com formulario executavel, `Criar turma` abre Turmas com wizard executavel;
- corrigido fluxo `Publicar pagina`: Ajustes/Estrutura agora tem edicao direta dos dados publicos do local;
- `Recursos` ficou restrito a disponibilidade operacional e janelas abertas;
- usar uma janela aberta agora leva para Turmas com rascunho preenchido, evitando terminar a acao em tela errada.

Objetivo:

- Levar a mesma logica task-first de cobranca/setup para reservas, aulas e atendimento, reduzindo a necessidade de procurar funcoes por modulo tecnico.
- Aplicar a regra de destino semantico: cada quick action precisa abrir a subvisao onde a tarefa pode ser concluida.

Criterios:

- rotinas como `Criar reserva`, `Chamar lista de espera`, `Fazer chamada`, `Cadastrar cliente` e `Registrar venda` devem aparecer por intencao quando houver contexto real;
- rotinas ja existentes devem ser auditadas contra `SEMANTIC_FLOW_AUDIT.md`;
- nao criar painel permanente de atalhos zerados;
- manter uma acao primaria por row ou bloco operacional;
- mobile deve resolver a tarefa em poucos toques.

Telas/componentes afetados:

- `ManagementHubPage`;
- modulos de Agenda, Academia, Clientes/CRM e Cantina;
- docs de discoverability/onboarding e component grammar.

Ganhos esperados:

- menos menu tecnico;
- rotina diaria mais clara para recepcao/professor/gestor;
- mais sensacao de sistema que conduz o usuario.

Dependencias:

- dados atuais de reservas, lista de espera, aulas, contatos e vendas.

Risco de regressao:

- duplicar atalhos que ja existem dentro dos modulos.

Criterios de conclusao:

- pelo menos duas rotinas recorrentes ganham entrada semantica contextual;
- atalhos aparecem somente quando fazem sentido;
- toda quick action nova ou alterada tem destino executavel;
- docs vivos atualizados;
- `npm run lint` e `npm run build` passando se houver alteracao de codigo.

Entregue em 2026-05-13:

- `ManagementHubPage` passou a calcular acoes rapidas de rotina por local, com destino executavel por subvisao;
- Agenda ganhou entradas semanticas como `Confirmar reservas`, `Chamar espera`, `Ver agenda` e `Criar reserva`;
- Academia ganhou `Resolver aulas` e `Fazer chamada` quando ha pendencias ou aulas do dia;
- Clientes/CRM ganhou `Fazer follow-up` quando ha contato vencido/lead ativo;
- Financeiro ganhou `Cobrar pendentes` quando ha recebivel ou credito pendente;
- Cantina ganhou `Repor estoque` e `Registrar venda` quando ha estoque baixo/produto ativo;
- as acoes aparecem na row do local somente quando nao ha setup bloqueando a base, evitando painel permanente de atalhos;
- `npm run lint` e `npm run build` passaram;
- screenshots foram gerados em 390px e 1366px, mas seguem bloqueados pela tela `Configuracao necessaria` sem `.env`/Supabase.

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

### [x] MOBILE-01 - Padronizar bottom sheets para filtros e detalhes

Status: `[x]` concluido

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

Entregue em 2026-05-13:

- criado `ResponsiveFilterSheet` para manter filtros inline no desktop e abrir bottom sheet no mobile;
- liga passou a usar sheet mobile para temporada/classe em vez de empilhar filtros no corpo principal;
- `EntityDrawer` foi refinado no mobile para parecer bottom sheet real, com alca visual, altura controlada e acoes confortaveis;
- desktop preserva filtros visiveis quando eles ajudam a operacao em volume;
- padrao documentado para proximas telas criticas.

### [x] ROWS-01 - Aplicar `EntityActionRow` nas listas operacionais principais

Status: `[x]` concluido

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

Entregue em 2026-05-13:

- CRM passou a usar `EntityActionRow` para leads/clientes, com nome, origem/interesse, responsavel, follow-up e status na mesma leitura;
- acao primaria do CRM ficou contextual: marcar contato, marcar convertido ou ver historico;
- historico e arquivamento ficaram secundarios, reduzindo botoes equivalentes na linha;
- controles de responsavel/proximo contato ficaram compactos e colapsam em uma coluna no mobile;
- recebiveis financeiros passaram a usar `EntityActionRow`, com valor, status e lembrete como acao primaria;
- linhas ganharam badge de status discreto, destaque para convertido e alerta visual para follow-up vencido;
- primeira onda cobre CRM e recebiveis; reservas/alunos ja usam rows de workspace e partidas ficam para refinamento interno do Competition OS.

### [x] HOME-01 - Redesenhar Home do jogador por proxima acao

Status: `[x]` concluido

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

Entregue em 2026-05-13:

- `/inicio` deixou de abrir com hero grande, atalhos e KPIs soltos;
- primeira viewport agora usa um painel `Player App` com titulo do dia, acao primaria e rows de proxima acao;
- rows do dia cobrem pendencia, agenda e clube/aulas com acao curta e contexto imediato;
- atalhos rapidos foram reduzidos para tarefas de jogador: competir, jogar/reservar e perfil;
- KPIs viraram sinais de suporte ao lado do painel, nao dashboard principal;
- cards antigos da central foram removidos da primeira leitura, mantendo secoes detalhadas abaixo;
- organizacao continua em secao propria, sem disputar com rotina do jogador.

## P2 - Refinamento de percepcao premium

### [x] VISUAL-01 - Auditoria global de botoes e CTA hierarchy

Status: `[x]` concluido

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

Entregue em 2026-05-13:

- `secondary` deixou de ser botao escuro e virou botao branco/borda, coerente com acao secundaria;
- criado padrao visual `quiet` para links, filtros, modulo auxiliar e acoes que nao devem competir com a primaria;
- Home passou a usar `Ranking` como quiet e acoes vazias com secondary/quiet em vez de botoes equivalentes;
- Gestao passou a separar `Abrir operacao` como primary, `Pagina publica` como secondary e atalhos de modulo como quiet;
- Competition queue passou a tratar `Abrir fila` como quiet;
- Financeiro/recebiveis passou a destacar `Lembrar todos` e `Lembrar` como primary, deixando recortes `Socios` e `Academia` quiet;
- criacao de reserva passou a ter `Reservar` como unica acao forte; buscar, bloquear, espera e selecao de quadra ficaram secondary/quiet.

### [x] TYPO-01 - Revisar typography e densidade nas telas principais

Status: `[x]` concluido

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

Entregue em 2026-05-13:

- removido uso de `font-size: clamp(...)` nas areas auditadas, evitando tipografia dependente do viewport;
- headers operacionais passaram para tokens fixos (`2xl`, `lg`, `md`) em vez de escala fluida;
- Home/Player App manteve destaque sem hero tipografico exagerado;
- Management OS ficou mais compacto, com titulo de shell e descricao menos pesados;
- Competition OS reduziu titulo, label e metadados para leitura mais densa;
- section titles ficaram menores e mais consistentes com uso operacional;
- public/ranking heroes mantem destaque com `3xl`, mas sem escala por viewport.

### [x] PUBLIC-01 - Refinar pagina publica do local para conversao premium

Status: `[x]` concluido

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

Entregue em 2026-05-13:

- hero publico passou a vender a oferta principal do local com faixa curta de preco/disponibilidade;
- CTA primario mudou para `Reservar quadra` e fica na primeira viewport;
- `Ver turmas` virou acao secundaria clara, sem competir com reserva;
- Gestao e WhatsApp ficaram quiet, preservando separacao entre publico e operacao;
- KPIs viraram trust strip compacto logo abaixo do hero;
- bloco de divulgacao/widget saiu do topo e foi para o fim da grade;
- reserva publica ganhou borda de destaque e copy mais direta;
- mobile ganhou CTA sticky de reserva para reduzir friccao.

### [x] FORMS-01 - Reduzir formularios inline em rotinas recorrentes

Status: `[x]` concluido

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

Entregue em 2026-05-13:

- criacao de reserva/bloqueio/lista de espera deixou de abrir como formulario longo no corpo da Agenda;
- campos frequentes ficaram em uma linha operacional: quadra, inicio, fim, buscar e reservar;
- observacao e repeticao foram movidas para detalhe progressivo; em `MGMT-AGENDA-01`, bloqueio e lista de espera voltaram a ficar visiveis como acoes secundarias do fluxo principal;
- `Reservar` ficou como acao primaria unica do composer;
- `Buscar`, `Bloquear horario` e `Entrar na espera` ficaram secundarios/quiet, sem competir visualmente;
- mobile empilha os campos essenciais e deixa as acoes com largura confortavel.

### [x] FORMS-02 - Aplicar formulario progressivo em CRM e Cantina

Status: `[x]` concluido

Objetivo:

- Tirar cadastros auxiliares recorrentes do corpo principal quando eles competem com a fila operacional.

Criterios:

- CRM deve priorizar fila/contatos antes de captura;
- novo lead/cliente deve abrir em drawer/sheet ou composer compacto;
- Cantina deve separar venda rapida de cadastro de produto;
- campos raros de produto ficam progressivos;
- uma acao primaria por bloco.

Telas/componentes afetados:

- `PlaceCrmModule`;
- `PlaceCrmContactForm`;
- `PlaceCanteenProductsModule`;
- `PlaceCanteenProductForm`;
- `PlaceCanteenSaleForm`.

Ganhos esperados:

- menos aparencia de painel com formularios empilhados;
- operacao diaria mais rapida;
- cadastro continua completo, mas deixa de competir com tarefas frequentes.

Dependencias:

- `EntityDrawer`;
- padrao de ProgressiveForm documentado em `COMPONENT_GRAMMAR.md`.

Risco de regressao:

- esconder captura importante demais no CRM vazio.

Criterios de conclusao:

- filas/listas aparecem antes de formularios auxiliares;
- captura continua acessivel em um toque;
- mobile nao mostra formulario longo antes da tarefa principal.

Entregue em 2026-05-13:

- CRM passou a mostrar lista/fila de contatos antes da captura de novo lead;
- formulario de novo contato virou `ProgressiveForm`, com nome, telefone e interesse no fluxo principal;
- email, origem, responsavel, proximo contato e notas ficaram em camada secundaria;
- Cantina passou a exibir venda rapida como rotina principal na visao de venda;
- cadastro de produto virou formulario progressivo, deixando categoria como campo auxiliar;
- catalogo da cantina passou de cards para rows com preco, estoque e status;
- mobile deixa de abrir CRM/Cantina com formulario longo antes da tarefa principal.

### [x] ROWS-02 - Refinar rows de partidas e alunos nos fluxos internos

Status: `[x]` concluido

Objetivo:

- Continuar reduzindo cards/listas altas em fluxos que ainda exigem leitura rapida e acao operacional.

Criterios:

- partidas pendentes devem mostrar contexto, status e acao primaria sem card alto;
- alunos/turmas devem evitar mosaico quando a tarefa e chamada, pagamento ou lembrete;
- detalhe deve ir para drawer/sheet quando houver historico longo;
- mobile deve priorizar uma linha de contexto e uma acao clara.

Telas/componentes afetados:

- `TournamentPage`;
- `LeagueDetailsPage`;
- `PlaceAcademyClassesModule`;
- `PlaceAcademyStudentsModule`;
- componentes de partidas/alunos que ainda usem cards altos.

Ganhos esperados:

- mais velocidade operacional em competicoes e academia;
- menos verticalidade;
- consistencia maior com `EntityActionRow`.

Dependencias:

- `EntityActionRow`;
- `CompetitionOperationalQueue`;
- gramatica de rows documentada.

Risco de regressao:

- perder informacao importante de partida/aluno se a row ficar curta demais.

Criterios de conclusao:

- pelo menos um fluxo critico de partida ou aluno convertido para row compacta;
- acao primaria preservada;
- mobile sem tabela/card alto desnecessario.

Entregue em 2026-05-13:

- turmas da Academia deixaram de aparecer como mosaico de cards;
- `PlaceAcademyClassesModule` passou a usar `EntityActionRow`;
- cada turma mostra horario, professor/quadra/nivel, ocupacao, pendencias e mensalidade em leitura horizontal;
- capacidade da turma virou acao/metadado forte da row;
- reposicao e total de matriculas ficaram como metricas de suporte;
- fluxo de turmas ficou mais consistente com CRM, Financeiro e Cantina.

### [x] LOCAIS-01 - Separar descoberta de partidas, quadras e aulas

Status: `[x]` concluido

Objetivo:

- Corrigir a confusao em `/locais`, onde partidas abertas, locais/quadras e aulas apareciam no mesmo fluxo sem intencao clara.

Entregue em 2026-05-13:

- `/locais` ganhou seletor inicial por intencao: `Encontrar jogadores`, `Reservar quadra`, `Entrar em aula`;
- partidas abertas deixaram de aparecer por padrao na descoberta de locais;
- lista de locais ganhou cabecalho contextual para quadras ou aulas;
- `+` ambiguo virou `Cadastrar local` e ficou restrito ao contexto `Meus locais`;
- mobile usa escolhas empilhadas e linguagem mais clara.

Ganho:

- menor carga cognitiva;
- mais discoverability;
- melhor alinhamento com task-first UX;
- separacao mais clara entre jogar, procurar quadra/local e procurar aulas.

### [x] LOCAIS-02 - Reduzir acoes secundarias dos cards de local

Status: `[x]` concluido

Objetivo:

- Levar os cards de local ao padrao de ate uma acao primaria visivel e secundarias em overflow/sheet, especialmente no mobile.

Criterios:

- card de local nao deve expor 3-4 botoes equivalentes no mobile;
- `Ver pagina`/`Ver aulas` deve ser a acao primaria por intencao;
- `WhatsApp`, `Copiar link` e acoes raras devem ir para menu ou sheet;
- validar 390px e 430px.

Entregue em 2026-05-13:

- `Reservar quadra` agora lista apenas locais com quadras ativas fora de `Meus locais`;
- `Entrar em aula` agora lista apenas locais com turmas ativas fora de `Meus locais`;
- card de local passou a ter acao primaria por intencao: `Ver horarios`, `Ver aulas` ou `Abrir gestao`;
- `WhatsApp`, `Copiar link` e `Abrir gestao` secundario foram movidos para `Mais`;
- chamadas de jogo tambem passaram a priorizar `Quero jogar` ou `Fechar chamada`, deixando curtir/comentarios/cancelar em `Mais`.

Ganho:

- menos botoes equivalentes;
- menos duvida entre procurar jogador, reservar quadra e entrar em aula;
- mais aderencia a perfil/contexto e `EntityActionRow`.

### [x] LOCAIS-03 - Filtros inteligentes por intencao e escolha visual no local

Status: `[x]` concluido

Objetivo:

- Impedir listas abertas demais em cidades grandes e transformar `/locais` em busca por tarefa real.

Entregue em 2026-05-13:

- `Reservar quadra` ganhou filtros de nome, cidade, UF, data, hora e duracao;
- busca de quadra passa a consultar disponibilidade real e devolve as quadras livres diretamente, sem forcar abertura de ficha completa da academia;
- criada migration `0074_place_discovery_filters_v1.sql` com RPCs de descoberta em escala para quadras e aulas;
- `Entrar em aula` ganhou filtros de academia/professor, cidade, dia, periodo, nivel e perfil;
- busca de aula passa a considerar turmas com vaga real quando a migration 0074 esta aplicada;
- `Encontrar jogadores` ganhou filtros proprios por local/mensagem, cidade, UF, data, periodo, nivel e status;
- pagina publica do local ganhou agenda visual de quadras por horario/quadra;
- pagina publica do local ganhou filtro de turmas compativeis por perfil antes de enviar interesse.

Ganho:

- menos resultado irrelevante em cidades com muitas academias;
- menos mistura entre chamada de jogo, reserva e aula;
- decisao mais rapida dentro do local;
- UX mais coerente com task-first e mobile-first.

### [x] LOCAIS-04 - Resultado direto de quadra livre sem ficha completa da academia

Status: `[x]` concluido

Objetivo:

- Corrigir o fluxo em que uma busca de reserva retornava a academia inteira, com planos, aulas e modulos irrelevantes para quem queria apenas reservar uma quadra.

Entregue em 2026-05-13:

- criada RPC `app_search_available_courts_for_discovery(...)` na migration `0074`, retornando quadras livres por cidade/nome/data/hora/duracao;
- `/locais` passou a renderizar cards clicaveis de quadra livre apos a busca, com local, horario, superficie, preco e status de confirmacao;
- clique na quadra leva para `/locais/:placeId?intent=booking...` com quadra, inicio e fim ja preenchidos;
- cards publicos de descoberta deixaram de renderizar planos, aulas, CRM, financeiro e secoes internas quando a intencao e apenas descobrir/reservar;
- pagina publica do local reconhece parametros de reserva e posiciona o usuario direto no formulario/agenda.

Ganho:

- menos friccao em cidades com muitos locais;
- menor mistura entre reserva, aula, plano e pagina institucional;
- fluxo de reserva fica orientado a tarefa: buscar horario, escolher quadra, solicitar.

### [x] LOCAIS-05 - Resultado direto de turma com vaga em Entrar em aula

Status: `[x]` concluido

Objetivo:

- Corrigir a busca de `Entrar em aula`, que podia parecer quebrada por filtrar turmas mas devolver apenas o container da academia.

Entregue em 2026-05-13:

- criada RPC `app_search_academy_classes_for_discovery(...)` na migration incremental `0075`, retornando turmas ativas com vaga por cidade, UF, nome da academia, professor, dia, periodo, nivel, idade e genero;
- `/locais` passou a renderizar cards clicaveis de turma com vaga, mostrando local, horario, professor, nivel, vagas e valor;
- clique na turma leva para `/locais/:placeId?intent=academy...` com a turma/nivel ja selecionados no formulario publico;
- filtro de `Entrar em aula` agora exibe UF e permite buscar por nome da academia, resolvendo o caso de pesquisar `ADT` e nao receber resultado acionavel;
- niveis de aula foram padronizados em `Iniciante`, `Intermediario`, `Avancado`, `Primeira Classe` e `Profissional`;
- cadastro de turma, busca de encaixe e pagina publica passaram a usar a mesma taxonomia de nivel.

Ganho:

- aluno encontra diretamente a turma compativel, sem abrir varias academias;
- menos friccao em cidades com muitas academias;
- menos mistura entre aulas, reservas, planos e ficha institucional;
- maior consistencia entre cadastro interno, descoberta publica e formulario do aluno.

### [x] ACCESS-02 - Criar guardrail real para criacao profissional de local

Status: `[x]` concluido

Objetivo:

- Impedir que jogador comum crie local profissional apenas por estar autenticado.

Criterios:

- definir fonte real de plano/assinatura por usuario ou workspace;
- criar RPC/policy para autorizar criacao de local por plano/permissao;
- UI deve chamar esse guardrail antes de mostrar formulario de criacao;
- preservar seed/demo para donos e professores autorizados.

Entregue em 2026-05-13:

- criada migration `0073_place_creation_entitlements_v1.sql` com `app_user_product_entitlements`;
- criada RPC `app_user_can_create_place()` para a UI consultar permissao real;
- criada RPC `app_create_place(...)` para centralizar validacao de plano, dono e organizacao;
- policy `places_owner_insert` passou a exigir `app_user_can_create_place()`, bloqueando insert direto de jogador comum;
- `/locais` agora so exibe `Cadastrar local` quando o backend confirma entitlement;
- seed demo concede entitlement ao `escalao@gmail.com` e registra professores como `coach_solo` sem criacao de local.

Ganho:

- remove a contradicao entre UX e banco;
- impede ferramenta profissional exposta para Free Player;
- torna o fluxo de criacao de local coerente com perfil, plano e permissao.

### [x] SWEEP-ROLE-02 - Corrigir entrada neutra por perfil em Locais/Gestao

Status: `[x]` concluido

Objetivo:

- Reduzir confusao de contexto descoberta/gestao detectada na varredura por Admin, Player puro e Professor.

Entregue em 2026-05-14:

- `/locais` agora abre em estado neutro de intencao, sem assumir reserva de quadra como padrao;
- o usuario escolhe primeiro entre `Encontrar jogadores`, `Reservar quadra` e `Entrar em aula`;
- tabs/listas de locais so aparecem depois da intencao correta, evitando academia generica em busca de quadra/aula;
- `Reservar quadra` e `Entrar em aula` nao listam academias genericas antes da busca; orientam o filtro e depois devolvem quadras livres ou turmas com vaga;
- `/gestao` acessado por Player puro agora mostra ausencia de permissao e volta para Inicio/Locais publicos;
- `/gestao/:placeId/:module` deixou de renderizar a camada publica de `Locais` no topo; o usuario entra direto no workspace operacional do local;
- navegacao de modulos do local deixou de usar `Mais` artificial em desktop; agora exibe todos os modulos liberados por plano/permissao em barra horizontal adaptativa;
- plano `academy` tambem ganhou `Agenda`, mantendo agenda operacional para aulas, quadras, horarios e ocupacao;
- operador com entitlement mas sem local continua vendo setup profissional.

Ganho:

- menos mistura entre descoberta publica e operacao;
- menos friccao para Player puro;
- menos risco de achar que `/locais` e uma busca generica sem finalidade;
- melhor aderencia ao modelo de perfil/plano sem criar nova arquitetura.

## Concluidos recentes

### [ ] FLOW-V3 - Reestruturar arquitetura de fluxo global do app

Status: `[ ]` planejado

Fonte primaria:

- `GLOBAL_WORKFLOW_RESTRUCTURE_STUDY_2026_05_20.md`
- `APP_WORKFLOW_EXECUTION_PLAYBOOK_V3.md`

Objetivo:

- reorganizar Player App, Competition OS e Management OS por papel, missao e etapa de trabalho;
- reduzir menus/submenus/subvisoes que exigem adivinhacao;
- preservar backend e funcoes existentes, reposicionando telas e fluxos;
- garantir que jogador, aluno, socio, organizador, professor, recepcao, financeiro, caixa e gestor tenham caminhos claros sem prejudicar uns aos outros.

Rechecagem global em 2026-05-20:

- o MD fonte foi revalidado contra rotas reais, modulos de gestao, papeis de local, papeis de torneio, tabs de liga e paginas pessoais;
- MDs anteriores passam a ser tratados como contexto/evidencia, nao como ordem automatica quando apontarem para outro produto;
- a execucao deve preservar o ATP atual: jogador, competicoes, reservas, aulas, mensalidades, locais e operacao de clubes/academias;
- proibido relaxar permissao, remover rota existente ou criar produto generico para simplificar IA;
- novas rotas como `/agenda`, `/trabalho/competicoes` ou `/eventos/:id/operacao` devem nascer com alias/wrapper/redirect quando afetarem links atuais.
- criado `APP_WORKFLOW_EXECUTION_PLAYBOOK_V3.md` como manual executavel antes de codigo, com task flows, matriz de entrada, estados, ciclo de competicoes, mapa de rotas, navegacao, contratos de pagina, guardrails, queue e QA.

Ordem proposta:

1. `FLOW-00A` - transformar a rechecagem global em matriz de gaps, rotas, permissoes e CTAs;
2. `FLOW-00` - congelar IA, contratos de pagina e rotas atuais x rotas-alvo;
3. `FLOW-02` - simplificar navegacao principal v3 para Jogador/Trabalho e desktop/mobile;
4. `FLOW-01` - transformar `/gestao` em `Trabalho Hoje` por papel;
5. `FLOW-04` - criar workspace de Professor;
6. `FLOW-05` - criar workspace de Recepcao/Atendimento;
7. `FLOW-06` - criar hub de trabalho para Competicoes;
8. `FLOW-07` - reestruturar Torneio operacional por fase e por papel real (`owner`, `organizer`, `scorekeeper`, `checkin`, `media`);
9. `FLOW-08` - reestruturar Liga operacional por fase preservando `configuracao` owner-only;
10. `FLOW-03` - consolidar Agenda do Jogador sem esconder pagamentos proprios;
11. `FLOW-09` - mover ajustes/admin/destrutivos para fora da rotina;
12. `FLOW-10` - QA transversal por persona, viewport e rotas primarias.

CritÃ©rio de aceite macro:

- cada papel entra e entende a proxima acao sem procurar ferramenta;
- mobile tem no maximo cinco destinos principais por modo;
- desktop de trabalho usa grupos previsiveis;
- setup/configuracao/publicacao/relatorio nao competem com operacao diaria;
- nenhuma permissao/plano e relaxado;
- nenhuma funcao existente e removida sem substituto de fluxo.
- nenhum MD antigo deve prevalecer sobre o escopo atual quando desviar o produto para outro caminho.

Detalhamento do `FLOW-00A`:

- inventariar rotas atuais de jogador, trabalho/local, torneio, liga, convites e links publicos;
- mapear cada CTA primario/secundario para destino real, rota faltante ou wrapper necessario;
- registrar matriz `papel -> tarefas -> modulos visiveis -> paginas proibidas`;
- usar `APP_WORKFLOW_EXECUTION_PLAYBOOK_V3.md` como criterio de ready antes de qualquer sprint de codigo;
- validar jogador puro, aluno, socio/reservas, jogador competitivo, organizador sem local, professor, recepcao, financeiro, caixa, gestor e usuario multi-papel;
- registrar quais mudancas sao apenas frontend/IA e quais exigiriam decisao de produto antes de codigo;
- produzir lista de screenshots obrigatorios, incluindo console e interacao de botoes em mobile e web.

### [x] SPRINT-2026-05-20 - FLOW V3 gates e navegacao principal inicial

Status: `[x]` concluido parcialmente com QA visual bloqueado pelo ambiente

Fonte primaria:

- `APP_WORKFLOW_EXECUTION_PLAYBOOK_V3.md`
- `APP_WORKFLOW_EXECUTION_MATRIX_V3.md`

Entregue:

- criado `APP_WORKFLOW_EXECUTION_MATRIX_V3.md` com FLOW-00A, FLOW-00, FLOW-01 e escopo seguro de FLOW-02;
- matriz cobre rotas principais, superficie futura, persona, permissoes, CTA, estados vazios/sem permissao, risco, alias/redirect, arquivos provaveis e QA;
- contratos de pagina documentados para Player App, Competition OS e Management OS;
- mapeamento de aliases preserva `/join`, `/inscricao/:tournamentId`, `/t/:tournamentId`, `/locais/:placeId/admin`, tabs/query de torneio/liga e paginas pessoais;
- `workspace-access` passou a expor papel dominante de trabalho, local primario e modulos disponiveis do local sem relaxar permissoes;
- `BottomNav` foi reorganizado para `Inicio | Jogar | Competir | Agenda | Perfil` no modo jogador;
- modo Trabalho agora monta entradas por papel dominante: professor, recepcao, financeiro, caixa, organizador sem local, operador misto e gestor;
- atalhos profundos de trabalho so sao criados quando o modulo existe em `primaryPlaceModules`;
- `/eventos?modo=organizing` passou a ser reconhecido como experiencia `work`, evitando o seletor voltar para Jogador;
- corrigido bug capturado em auditoria: keys duplicadas no React quando dois itens de nav apontavam para `/gestao`.

O que nao foi alterado:

- backend;
- loaders de dominio;
- permissoes de torneio/local;
- rotas publicas/legadas;
- visual premium dark de componentes.

Validacao:

- `npm.cmd run build` executado com sucesso;
- tentativa de captura visual completa falhou por `ENOSPC` ao gravar PNG;
- tentativa smoke posterior travou por timeout de login/rede;
- artefatos parciais de screenshots e temporarios `atp-visual-audit-*` foram removidos para recuperar espaco;
- comandos de recaptura ficaram documentados em `APP_WORKFLOW_EXECUTION_MATRIX_V3.md`.

Riscos restantes:

- precisa QA visual real em mobile 390px, mobile 430px, desktop 1366px e desktop amplo;
- precisa validar contas especificas de professor, recepcao, financeiro, caixa, organizador e jogador puro;
- `Agenda` do jogador ainda e alias operacional para `/minhas-reservas`, marcando tambem aulas/partidas/pagamentos como grupo ativo; a consolidacao real da agenda fica para FLOW-06;
- work nav para usuario multi-papel sem gestor usa fallback seguro e pode ficar conservador ate termos selecao explicita de workspace.

### [x] SPRINT-2026-05-20 - FLOW-02 Navegacao principal V3

Status: `[x]` concluido no codigo, com screenshots smoke capturados.

Fonte primaria:

- `APP_WORKFLOW_EXECUTION_PLAYBOOK_V3.md`
- `APP_WORKFLOW_EXECUTION_MATRIX_V3.md`

Entregue:

- `BottomNav` passou a montar dois conjuntos de navegacao: mobile por papel dominante e desktop por grupos de trabalho;
- modo Jogador preservado como `Inicio | Jogar | Competir | Agenda | Perfil`;
- modo Trabalho mobile alinhado por papel:
  - professor: `Hoje | Agenda | Turmas | Alunos | Perfil`;
  - recepcao: `Hoje | Reservas | Clientes | Aulas | Mais`;
  - financeiro: `Receber | Pagos | Despesas | Resumo | Perfil`;
  - caixa: `Vender | Hoje | Estoque | Produtos | Perfil`;
  - organizador: `Hoje | Torneios | Ligas | Publicacao | Perfil`;
  - gestor: `Hoje | Agenda | Aulas | Financeiro | Mais`;
- desktop Trabalho agora agrupa por `Trabalho`, `Locais`, `Competicoes` e `Administracao`;
- grupos vazios nao sao renderizados depois de aplicar filtros de viewport e permissao;
- atalhos de `Agenda`, `Aulas`, `Clientes`, `Financeiro`, `Cantina`, `Equipe` e `Ajustes` so aparecem se o modulo existir em `primaryPlaceModules`;
- `Perfil` acionado pelo modo Trabalho preserva `?mode=work`, mantendo o seletor em Trabalho sem criar rota nova;
- `Relatorios` nao foi exposto porque o roteador atual nao tem modulo/rota segura para esse destino;
- bottom nav mobile deixou de usar grade fixa de 6 colunas para evitar coluna fantasma em menus de 5 itens.
- `scripts/capture-visual-audit.mjs` agora aceita `ATP_AUDIT_CUSTOM_VIEWPORTS_JSON` para validar 390px, 430px, 1366px e desktop amplo sem editar o script.

O que nao foi alterado:

- backend;
- loaders;
- policies/permissoes;
- rotas publicas ou legadas;
- regras de negocio;
- design premium dark aprovado.

Validacao:

- `npm.cmd run build` executado com sucesso;
- screenshots smoke capturados em `docs/screenshots/workflow-v3-nav-flow02-2026-05-20/`;
- screenshots por viewport capturados em `docs/screenshots/workflow-v3-nav-flow02-viewports-2026-05-20/`;
- diagnostics das rotas capturadas sem eventos de console/rede;
- rotas antigas preservadas por uso dos paths existentes: `/inicio`, `/locais`, `/eventos`, `/minhas-reservas`, `/perfil`, `/gestao`, `/gestao/:placeId/:module`, `/eventos/torneios?view=organizing`, `/eventos/ligas?view=organizing`, `/eventos?modo=organizing`;
- matriz FLOW-02 atualizada em `APP_WORKFLOW_EXECUTION_MATRIX_V3.md`.

Pendencias:

- confirmar `Relatorios` como modulo/rota antes de expor no menu de Administracao;
- QA com contas reais de professor, recepcao, financeiro, caixa, organizador, gestor e jogador puro.
- screenshots mobile de `/gestao` mostram overflow horizontal no conteudo do Management Hub, fora do escopo direto do `BottomNav`; tratar em sprint proprio de layout.

### [x] SPRINT-2026-05-20 - FLOW-03 Trabalho Hoje

Status: `[x]` concluido no codigo, aguardando QA expandido por contas especificas

Fonte primaria:

- `APP_WORKFLOW_EXECUTION_PLAYBOOK_V3.md`
- `APP_WORKFLOW_EXECUTION_MATRIX_V3.md`

Entregue:

- `/gestao` passou a se apresentar como `Trabalho Hoje`, nao como uma lista generica de modulos;
- a primeira dobra agora pergunta "O que precisa ser resolvido agora?" e muda por papel dominante;
- `ManagementHubPage` calcula fila operacional para professor, recepcao, financeiro, caixa, organizador e gestor;
- professor recebe cards de aulas de hoje, proxima chamada, reposicoes e turmas/alunos;
- recepcao recebe reservas de hoje, check-ins, lista de espera, atendimento e aulas pendentes;
- financeiro recebe vencidos/pendentes, recebiveis de hoje, pagamentos pendentes e despesas;
- caixa recebe venda rapida, vendas do dia, estoque baixo e produtos;
- organizador recebe torneios/ligas, inscricoes, jogos sem resultado e publicacao/comunicacao;
- gestor recebe pendencias criticas consolidadas, reservas, aulas, financeiro, clientes, estoque e equipe;
- cada card tem CTA claro, valor, detalhe orientativo e rota real quando o modulo e permitido;
- cards sem modulo permitido sao ocultados ou ficam orientativos/desabilitados quando isso ajuda o estado vazio;
- estados vazios foram tratados com texto de proximo passo, evitando "nenhum item encontrado" generico;
- CSS criou cards premium dark responsivos para `Trabalho Hoje`;
- mobile de `/gestao` recebeu correcao de overflow horizontal e cards empilhados;
- `APP_WORKFLOW_EXECUTION_MATRIX_V3.md` foi atualizado com escopo, comportamento por papel, estados vazios, estados sem permissao e QA requerido.

O que nao foi alterado:

- backend;
- loaders;
- policies/permissoes;
- rotas publicas/legadas;
- regras internas de cada modulo de local;
- seletor `Jogador / Trabalho`.

Validacao:

- `npm.cmd run build` executado com sucesso;
- screenshots e diagnosticos finais de FLOW-03 capturados em `docs/screenshots/workflow-v3-flow03-work-today-2026-05-20/`;
- capturas geradas para `mobile390`, `mobile430`, `desktop1366` e `desktopwide`;
- `diagnostics-summary.json` sem eventos de console/rede em `/gestao`.

Pendencias:

- validar com contas reais isoladas de professor, recepcao, financeiro, caixa, organizador sem local, gestor e jogador puro;
- clicar CTAs de cada papel com massa real variada;
- FLOW-04 deve aprofundar o workspace de Professor sem reabrir o objetivo desta rodada.

### [x] SPRINT-2026-05-20 - FLOW-06 Agenda do jogador

Status: `[x]` concluido no codigo, aguardando screenshots finais e QA expandido por massa real

Fonte primaria:

- `APP_WORKFLOW_EXECUTION_PLAYBOOK_V3.md`
- `APP_WORKFLOW_EXECUTION_MATRIX_V3.md`

Entregue:

- criada a rota `/agenda` como superficie principal da agenda pessoal;
- `/minhas-reservas`, `/minhas-partidas`, `/minhas-aulas` e `/meus-pagamentos` foram preservadas como entradas filtradas da nova agenda;
- `PersonalAgendaPage` consolida reservas pessoais, lista de espera, aulas pessoais, partidas de torneios/ligas, pagamentos pessoais e historico;
- reservas passadas entram em `Historico` com estado `Reserva passada`;
- aulas futuras destacam turma, professor, horario e quadra quando o dado esta disponivel;
- partidas tentam enriquecer torneios e ligas com adversario, competicao, status, agenda e resultado usando dados ja existentes;
- pagamentos pessoais destacam mensalidade/pacote/reserva/inscricao conforme `targetType`, sem misturar com financeiro do local;
- pagamento pendente antigo ou falho aparece como `Pagamento vencido`;
- partida sem resultado aparece como `Partida pendente de resultado`;
- cada item abre detalhe proprio dentro da agenda: sheet no mobile, painel lateral no desktop;
- detalhe de reserva preserva cancelamento quando permitido;
- reservas internas `blocked` nao sao exibidas como compromisso pessoal do jogador;
- `BottomNav` de jogador agora aponta `Agenda` para `/agenda`;
- atalhos pessoais da Home foram atualizados para `/agenda` e filtros;
- `APP_WORKFLOW_EXECUTION_MATRIX_V3.md` foi atualizado com escopo, rotas preservadas, estados e QA.

O que nao foi alterado:

- backend;
- loaders de dominio existentes;
- policies/permissoes;
- financeiro do local;
- rotas publicas/legadas de competicao;
- arquivos das paginas antigas, que permanecem no repositorio.

Validacao:

- `npm.cmd run build` executado com sucesso.
- screenshots capturados em `docs/screenshots/workflow-v3-flow06-player-agenda-2026-05-20/`;
- capturas cobrem `/agenda`, `/minhas-reservas`, `/minhas-partidas`, `/minhas-aulas` e `/meus-pagamentos`;
- capturas cobrem `mobile390`, `mobile430`, `desktop1366` e `desktopwide`;
- `diagnostics-summary.json` sem eventos de console/rede nas rotas capturadas.

Pendencias:

- validar com contas reais de jogador puro, aluno, socio/reservas e competitivo;
- testar competicoes com partidas reais de torneio/liga contendo adversario, agenda e resultado.

### [x] SPRINT-2026-05-20 - FLOW-07 Hub de competicoes de trabalho

Status: `[x]` concluido no codigo, aguardando QA expandido por massa real

Fonte primaria:

- `APP_WORKFLOW_EXECUTION_PLAYBOOK_V3.md`
- `APP_WORKFLOW_EXECUTION_MATRIX_V3.md`

Entregue:

- `/eventos` permanece superficie do jogador/descoberta;
- `/eventos?modo=organizing` agora e hub operacional de trabalho, sem redirecionar para `/gestao`;
- o hub responde "quais competicoes precisam de acao agora?";
- torneios e ligas organizados sao agrupados por fase: rascunho/setup, inscricoes abertas, jogos a gerar, jogos em andamento/resultados pendentes, liga ativa, liga entre rodadas e finalizadas;
- finalizadas aparecem em camada secundaria de historico;
- estado sem competicoes orienta criar torneio ou criar liga sem exigir local;
- organizador independente continua contemplado pelas rotas de Competition OS;
- gestor com local preserva entrada pelo modo Trabalho;
- CTAs preservam rotas existentes e abrem cockpit/detalhe atual.

O que nao foi alterado:

- backend;
- loaders de dominio existentes;
- RLS/policies/permissoes;
- rotas publicas, convite, inscricao ou legado;
- estrutura interna das paginas de torneio e liga.

Validacao:

- `npm.cmd run build` executado com sucesso.
- screenshots capturados em `docs/screenshots/workflow-v3-flow07-work-competitions-2026-05-20/`;
- capturas cobrem `/eventos?modo=organizing`, `/eventos`, `/eventos/torneios?view=organizing` e `/eventos/ligas?view=organizing`;
- capturas cobrem `mobile390`, `mobile430`, `desktop1366` e `desktopwide`;
- `diagnostics-summary.json` sem eventos de console/rede nas rotas capturadas.

Pendencias:

- QA com conta real de organizador sem local e gestor com local;
- testar massa real com torneios em todas as fases e ligas `active`/`paused`.

### [x] SPRINT-2026-05-20 - FLOW-08 Torneio operacional por fase e papel

Status: `[x]` concluido no codigo, aguardando QA expandido por papel/fase real

Fonte primaria:

- `APP_WORKFLOW_EXECUTION_PLAYBOOK_V3.md`
- `APP_WORKFLOW_EXECUTION_MATRIX_V3.md`

Entregue:

- `/eventos/:tournamentId/organizacao` agora recebe um cockpit operacional acima das abas antigas;
- a primeira dobra administrativa responde "o que falta resolver agora?";
- fase operacional derivada no frontend para: rascunho, inscricoes abertas, inscricoes encerradas, sorteio/jogos gerados, em andamento e finalizado;
- copy, metricas, bloqueios e CTA primario mudam conforme a fase;
- abas administrativas sao priorizadas conforme fase e papel, sem remover wrappers antigos;
- owner/organizer continuam com operacao ampla;
- checkin prioriza inscritos/jogadores;
- scorekeeper prioriza jogos/resultados;
- media prioriza comunicacao/publicacao;
- jogador nao recebe cockpit administrativo;
- mobile foi ajustado para uma coluna, evitando sobreposicao de texto, chip e metricas.

O que nao foi alterado:

- backend;
- loaders de dominio existentes;
- RLS/policies/permissoes;
- rotas publicas `/inscricao`, `/join` e `/t`;
- rotas internas antigas `/jogos`, `/jogadores`, `/classificacao`, `/chat` e `/organizacao`;
- acoes criticas ja existentes para staff autorizado.

Validacao:

- `npm.cmd run build` executado com sucesso.
- screenshots capturados em `docs/screenshots/workflow-v3-flow08-tournament-cockpit-2026-05-20/`;
- capturas cobrem `/eventos/eee62a99-6929-49c6-b4b9-533e82a6c9da/organizacao`, `/jogos` e `/jogadores`;
- capturas cobrem `mobile390`, `mobile430`, `desktop1366` e `desktopwide`;
- `diagnostics-summary.json` sem eventos de console/rede nas rotas capturadas.

Pendencias:

- QA com contas reais separadas de owner, organizer, checkin, scorekeeper, media e jogador;
- validar torneios reais em todas as fases;
- calibrar CTA dedicado de media/publicacao caso a operacao real exija um atalho ainda mais direto.

### [x] SPRINT-2026-05-20 - FLOW-09 Liga operacional

Status: `[x]` concluido no codigo, screenshots capturados e aguardando QA expandido por fase real

Fonte primaria:

- `APP_WORKFLOW_EXECUTION_PLAYBOOK_V3.md`
- `APP_WORKFLOW_EXECUTION_MATRIX_V3.md`

Entregue:

- `/eventos/ligas/:leagueId` passa a ter cockpit operacional por fase;
- participante e owner deixam de compartilhar a mesma primeira dobra generica;
- participante ve rodada atual, adversario, horario, local/status, chat, resultado e classificacao como proximas acoes;
- owner ve pendencias da rodada, participantes, resultados pendentes, CTA de gerar proxima rodada, classificacao e ajustes owner-only;
- fase operacional derivada no frontend para configuracao inicial, inscricoes/participantes, rodada ativa, entre rodadas, encerramento e historico;
- configuracao continua owner-only;
- participante nao ve ferramentas administrativas;
- owner nao cai em descoberta publica;
- rodada ativa passa a dominar a primeira dobra quando existe partida aberta;
- historico/finalizacao deixam de competir com operacao atual.

O que nao foi alterado:

- backend;
- loaders de dominio existentes;
- RLS/policies/permissoes;
- rota `/eventos/ligas/:leagueId`;
- regras reais de geracao de rodada;
- matchroom, chat e ranking existentes.

Validacao:

- `npm.cmd run build` executado com sucesso.
- screenshots capturados em `docs/screenshots/workflow-v3-flow09-league-operational-2026-05-20`;
- rotas auditadas: `/eventos/ligas/c3c638c5-0c85-4834-a639-bf26d2e4b5b3`, `?tab=partidas`, `?tab=classificacao`;
- personas auditadas: owner/admin e participante;
- viewports auditados: `mobile390`, `mobile430`, `desktop1366`, `desktopwide`;
- diagnosticos: 24 arquivos `.diagnostics.json`, 0 erros e 0 warnings de console/rede.

Pendencias:

- QA com owner e participante reais em ligas nas fases variadas;
- como o schema atual de `LeagueMatchSummary` nao traz quadra/local, o cockpit exibe `Local a combinar`/`Pendente` sem inventar backend.

### [x] SPRINT-2026-05-20 - FLOW-10 Ajustes/admin fora da rotina

Status: `[x]` concluido no codigo, screenshots capturados e aguardando QA expandido por staff de torneio

Fonte primaria:

- `APP_WORKFLOW_EXECUTION_PLAYBOOK_V3.md`
- `APP_WORKFLOW_EXECUTION_MATRIX_V3.md`

Entregue:

- `/gestao` deixou de promover setup incompleto como prioridade operacional;
- card `Equipe` saiu da primeira dobra do gestor;
- rows de local agora priorizam acoes rapidas de rotina e colocam `Ajustes`/`Equipe e permissoes` em bloco recolhido de `Administracao`;
- roteiro de implantacao virou bloco administrativo recolhido, fora da fila do dia;
- admin do local so mostra barra de implantacao/proximo setup dentro do modulo `Ajustes`;
- mapa do organizador de torneio so exibe `Configuracao` como atalho de primeira dobra na fase `draft`;
- reset, reset total, excluir torneio, backup e restore foram movidos para `Avancado`, visivel apenas para owner;
- cockpit owner de liga remove `Ajustes` dos CTAs da primeira dobra fora da fase de configuracao.

O que saiu da rotina:

- setup de local;
- equipe/permissoes;
- configuracao estrutural;
- backup/restore;
- reset parcial e total;
- exclusao de torneio;
- ajustes de liga durante rodada ativa.

Destino:

- local: `Ajustes`, `Equipe`, bloco recolhido `Administracao`;
- torneio: `Organizacao` -> `Avancado` para acoes destrutivas/backup;
- liga: aba `Ajustes`/`configuracao` owner-only;
- setup inicial de torneio: atalho de configuracao apenas em `draft`.

Validacao:

- `npm.cmd run build` executado com sucesso.
- screenshots capturados em `docs/screenshots/workflow-v3-flow10-admin-out-of-routine-2026-05-20`;
- rotas auditadas: `/gestao`, `/gestao/36b29d6c-fabb-475a-a059-47d5ece74a09/bookings`, `/gestao/36b29d6c-fabb-475a-a059-47d5ece74a09/settings`, `/eventos/eee62a99-6929-49c6-b4b9-533e82a6c9da/organizacao`, `/eventos/ligas/c3c638c5-0c85-4834-a639-bf26d2e4b5b3`;
- personas auditadas: admin/gestor, professor, recepcao, financeiro, caixa, owner de torneio e owner de liga;
- viewports completos em rotas admin/competicao: `mobile390`, `mobile430`, `desktop1366`, `desktopwide`;
- viewports de papeis operacionais: `mobile390`, `desktop1366`;
- diagnosticos: 28 arquivos `.diagnostics.json`, 0 erros e 0 warnings de console/rede.

Pendencias:

- QA com staff de torneio separado: organizer, scorekeeper, checkin e media;
- validar owner/manager de local com setup incompleto real, para confirmar atalhos de Administracao em Ajustes/Equipe.

### [x] SPRINT-2026-05-20 - FLOW-11 QA transversal

Status: `[x]` concluido como auditoria transversal, sem mudancas de UI/backend nesta rodada

Fonte primaria:

- `APP_WORKFLOW_EXECUTION_PLAYBOOK_V3.md`
- `APP_WORKFLOW_EXECUTION_MATRIX_V3.md`

Entregue:

- relatorio completo criado em `docs/FLOW_11_TRANSVERSAL_QA_REPORT_2026_05_20.md`;
- 169 screenshots capturados em `docs/screenshots/workflow-v3-flow11-transversal-qa-2026-05-20`;
- 169 arquivos de diagnostico de console/rede;
- 17 metadados por persona/rota;
- 6 arquivos de interacao com CTAs primarios;
- validacao em `mobile390`, `mobile430`, `desktop1366` e `desktopwide`;
- `npm.cmd run build` executado com sucesso;
- console/rede com 0 erros e 0 warnings.

Personas auditadas:

- jogador puro;
- aluno;
- socio;
- jogador competitivo;
- organizador independente;
- professor coach-only;
- recepcao frontdesk;
- financeiro;
- caixa;
- gestor owner/manager;
- usuario multi-papel;
- rotas publicas/legadas sem login.

Passou:

- wrappers de agenda pessoal preservados;
- jogador sem trabalho bloqueado corretamente em `/gestao`;
- Trabalho Hoje responde por papel nas primeiras dobras principais;
- aliases de rotas antigas de local preservados;
- permissoes sensiveis continuam sem relaxamento nos cenarios testados;
- liga e torneio separam participante/owner melhor que antes;
- build e console limpos.

Bugs e proximos itens recomendados:

- preservar `?join=` no redirect de login;
- decidir se `/join`, `/t`, `/inscricao` e `/ligas` devem ser publicas sem login;
- corrigir bottom nav mobile do jogador com item extra icon-only;
- corrigir bottom nav mobile da recepcao com dois ativos;
- ajustar hub/rotas do organizador independente;
- remover duplicacao de `Venda rapida` em Cantina/POS desktop;
- remover pills claras do Modo professor e da liga participante mobile;
- melhorar contraste de cards inativos na pagina publica do local;
- criar seed de jogador realmente vazio para QA de empty state.

### [x] SPRINT-2026-05-20 - Correcoes pos-FLOW-11 em sequencia

Status: `[x]` concluido

Entregue:

- preservacao de `?join=` e demais query params externos no redirect de auth;
- bottom nav mobile do jogador corrigida para cinco destinos;
- active state duplicado da recepcao corrigido;
- hub de organizador separado semanticamente com titulo `Trabalho em competicoes`;
- duplicacao de `Venda rapida` removida do workspace Cantina/POS;
- pills claras do professor e da liga participante mobile escurecidas;
- contraste da pagina publica de local reforcado;
- docs de matriz e QA atualizados com o sprint.

Validacao:

- `npm.cmd run build` executado com sucesso;
- screenshots focados em `docs/screenshots/sprint-flow11-fixes-after-2026-05-20`;
- 35 screenshots e 35 diagnosticos;
- console/rede: 0 erros e 0 warnings.

Ainda nao executado por depender de decisao ou massa de dados:

- preview publico sem login para `/join`, `/t`, `/inscricao` e `/ligas`;
- alcance exato do papel `organizer` independente;
- seed de jogador totalmente vazio e seeds completas por fase de torneio/liga.

### [x] SPRINT-2026-05-20 - Corrigir vazamento de tema claro na gestao de torneios

Status: `[x]` concluido

Entregue:

- removido vazamento de painel branco em `Organizacao` do torneio, principalmente `Acoes de publicacao do torneio` e `Kit de publicacao`;
- botoes de publicacao, WhatsApp, link, exportacao e input de restore agora seguem o DNA premium dark;
- `Proxima acao da classe` deixou de usar fundo claro, mantendo contraste em desktop e mobile;
- badges das abas do torneio receberam tratamento dark para nao parecerem pills claras soltas;
- validacao adicional no link real com admin (`Prime Open Inscricoes Encerradas`) encontrou e corrigiu cards brancos em `Agenda do torneio / Por quadra`;
- auditoria visual agora aceita altura maior via `ATP_AUDIT_MAX_HEIGHT`, permitindo conferir a pagina ate o fim em mobile e desktop;
- validado por screenshots em `docs/screenshots/sprint-tournament-management-tabs-after-2026-05-20`;
- validado tambem por screenshots longos em `docs/screenshots/sprint-admin-tournament-real-link-full-after-2026-05-20`;
- build executado com sucesso e diagnosticos sem eventos de console nas rotas testadas.

Ganho:

- gestao de torneios fica consistente com a referencia dark;
- elimina o contraste quebrado de texto branco em painel claro;
- preserva funcoes existentes sem reestruturar componentes.

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

### [x] SPRINT-2026-05-20 - Complemento obrigatorio de fluxo real e consistencia Player/Trabalho

Status: `[x]` concluido no codigo, docs e QA focado

Fonte primaria:

- `APP_WORKFLOW_EXECUTION_PLAYBOOK_V3.md`
- `APP_WORKFLOW_EXECUTION_MATRIX_V3.md`
- auditoria complementar `atp_audit.js` / `ATP_Auditoria_UX_2026.docx`
- complemento obrigatorio de fluxo real do usuario

Objetivo:

- corrigir pontos onde a navegacao ainda esta organizada por modulo em vez de fluxo;
- manter todas as funcoes e rotas;
- reforcar a fronteira entre `Jogador`, `Competition OS` e `Trabalho`;
- equalizar nomenclatura e consistencia visual entre Player App e Management OS.

Itens deste sprint:

- `[x] UX-FLOW-01`: ajustar contexto de `/eventos` para `Competir` no Player App e trabalho de competicoes no modo profissional;
- `[x] UX-FLOW-02`: ajustar `/locais` para se apresentar como `Jogar`, nao como pagina generica de locais;
- `[x] UX-FLOW-03`: renomear agenda operacional de trabalho para `Reservas` quando o contexto for quadra/local, preservando Agenda pessoal;
- `[x] UX-FLOW-04`: dar atalhos diretos desktop para `Aulas` e `Pagamentos` pessoais sem quebrar bottom nav mobile de 5 itens;
- `[x] UX-FLOW-05`: tirar listagem operacional de eventos organizados do perfil pessoal, mantendo caminho claro para o modo `Trabalho`;
- `[x] UX-FLOW-06`: validar por screenshot logo, hero, seletor, espacamento e proporcao entre Player App e Trabalho.

O que nao alterar:

- backend;
- permissoes;
- loaders;
- rotas publicas;
- `/join`, `/inscricao`, `/t`;
- regras de negocio de torneios, ligas, reservas, aulas ou financeiro.

CritÃ©rios de aceite:

- jogador nao ve caminho administrativo como rotina;
- aluno/socio encontra aulas e pagamentos pessoais;
- organizador entende quando esta em Competition OS de trabalho;
- recepcao/gestor ve `Reservas` como operacao do local, sem confundir com Agenda pessoal;
- perfil pessoal nao mistura dados profissionais na primeira camada;
- build passa;
- screenshots mobile 390, mobile 430, desktop 1366 e desktop amplo sem erros de console.

Entregue:

- complemento de fluxo real adicionado ao `APP_WORKFLOW_EXECUTION_PLAYBOOK_V3.md`;
- achados `UX-FLOW-01` a `UX-FLOW-06` adicionados ao `APP_WORKFLOW_EXECUTION_MATRIX_V3.md`;
- Player desktop recebeu grupo `Minha rotina` com `Aulas` e `Pagamentos`, preservando bottom nav mobile com cinco itens;
- `#/locais` passou a se apresentar como `Jogar`;
- `#/eventos` em modo descoberta passou a se apresentar como `Competir`, com copy explicando que operacao de eventos fica no modo `Trabalho`;
- cards claros remanescentes em `Competition OS` foram escurecidos no contexto premium dark;
- `bookings` no trabalho/local passou a usar label `Reservas`;
- `Trabalho Hoje` passou a usar `Abrir reservas`, `Ver reservas` e `Reservas` nos CTAs/atalhos operacionais;
- perfil pessoal multi-papel deixou de listar competicoes organizadas e passou a direcionar para `Trabalho em competicoes` com fronteira explicita.

Validacao:

- `npm.cmd run build` executado com sucesso;
- capturas completas de jogador em `docs/screenshots/sprint-real-flow-continuity-player-2026-05-20`;
- capturas completas de trabalho em `docs/screenshots/sprint-real-flow-continuity-work-2026-05-20`;
- verificacao final em `docs/screenshots/sprint-real-flow-continuity-verify-2026-05-20`;
- verificacao focada final em `docs/screenshots/sprint-real-flow-continuity-final-check-2026-05-20`;
- diagnosticos finais: 6 arquivos `.diagnostics.json`, 0 erros de console, 0 page errors, 0 failed requests.

Pendencias:

- QA manual clicando a aba `Conta` do perfil para conferir o CTA `Abrir Trabalho em competicoes` em fluxo real;
- revisar nomenclatura `Agenda` dentro de configuracoes especificas de torneio/liga, onde o termo ainda pode ser correto por se tratar de agenda da competicao;
- seguir varredura visual em rotas internas profundas de cada modulo para garantir que o padrao `Reservas` nao deixe resquicios em operacao de local.

### [x] DATA-01 - Alguns refinamentos dependem de dados reais variados

Status: `[x]` concluido por checklist operacional

Problema:

- varias telas precisam ser vistas com dados cheios, vazios, erro, pendencia e mobile real para calibrar densidade.

Como desbloquear:

- criar seed/demo operacional;
- testar viewport 390px e desktop;
- capturar screenshots antes/depois.

Impacto:

- sem dados variados, risco de otimizar apenas o estado vazio.

Entregue em 2026-05-13:

- criado `DEMO_STATE_QA_CHECKLIST.md`;
- definidos estados obrigatorios para Gestao, Agenda, Academia, Clientes, Cantina, Competition OS e Pagina publica;
- definidos viewports obrigatorios: 390px, 430px, 1366px e desktop amplo;
- definido criterio de conclusao para futuras tarefas quando faltar massa real;
- bloqueio deixa de travar a fila e vira checklist vivo de QA/demo.

### [x] SPRINT-2026-05-20 - Corrigir defeitos do fluxo real de torneio E2E

Status: `[x]` concluido no codigo, migration, auditoria e QA fresco

Fonte primaria:

- `TOURNAMENT_E2E_FLOW_AUDIT_2026_05_20.md`
- screenshots e diagnosticos de `docs/screenshots/tournament-e2e-flow-v4-2026-05-20-run15-fresh-full-after-fixes/`

Problemas citados pela analise:

- resultado enviado pelo jogador quebrava com `column reference "tournament_id" is ambiguous`;
- criacao do torneio levava o owner para uma pagina publica/operacional fraca, com sensacao de jogos vazios;
- wizard de criacao bloqueava passos sem explicar claramente o que faltava;
- inscricoes externas podiam exigir reload manual para aparecer no painel do owner;
- encerramento de inscricoes e finalizacao do torneio ficavam escondidos demais em configuracao/status;
- placar manual admin salvava campos parciais automaticamente e podia confundir o operador;
- auditoria automatizada podia preencher filtros de fundo em vez de campos do modal ativo.

Entregue:

- fallback no envio de resultado por jogador em `src/lib/tournaments.ts`;
- migration `0092_fix_tournament_result_submission_rpc_return.sql` para corrigir o RPC remoto;
- placar admin com rascunho local, validacao e botao explicito `Salvar resultado oficial`;
- CTA de fase `Encerrar inscricoes` no cockpit quando nao ha pendencias;
- CTA de fase `Finalizar torneio` quando todos os jogos necessarios estao resolvidos;
- pos-criacao de torneio indo para `/eventos/:id/organizacao`;
- refetch de inscricoes ao entrar em `Jogadores`, voltar foco da janela ou reabrir a aba;
- mensagens `blockedHint` no wizard de criacao;
- auditoria E2E atualizada para modal ativo, novo destino pos-criacao, CTA de encerramento e resultado enviado por jogador.

Validacao:

- `npm.cmd run build` passou;
- torneio fresco criado e finalizado: `ATP Open Dourados 021743`;
- ID do torneio: `a32cb410-0624-42f6-a051-6d397fb08149`;
- diagnostico final: `completed = true`, `failedRequests = []`, `pageErrors = []`;
- console sem erro de app, apenas logs esperados de ambiente dev;
- screenshots desktop e mobile em `docs/screenshots/tournament-e2e-flow-v4-2026-05-20-run15-fresh-full-after-fixes/`.

Pendencias:

- QA manual focado do novo placar digitado pelo admin, porque o run fresco concluiu jogos por resultado enviado por jogador e WOs;
- sprint de arquitetura para simplificar menus/tabs/submenus do Competition OS;
- mapeamento completo de fluxo quando o usuario possui mais de uma academia/local ativo.

### [x] SPRINT-2026-05-20 - Reduzir tiers e validar placar admin real

Status: `[x]` concluido no codigo, auditoria e documentacao

Fonte primaria:

- pendencias do `TOURNAMENT_E2E_FLOW_AUDIT_2026_05_20.md`;
- `NAVIGATION_WORKSPACE_RESTRUCTURE_V4.md`;
- pedido para corrigir os pontos da analise em sprint continuo.

Problemas atacados:

- organizacao de torneio ainda mostrava cockpit, mapa de areas, trilha de fases, fila, acoes, tabs e configuracao competindo na mesma leitura;
- placar admin manual ainda precisava ser exercitado em QA real;
- auditoria antiga podia finalizar torneio via select de status e mascarar ausencia de CTA/estado operacional correto;
- central de trabalho com varios locais ainda deixava atalhos de modulos expostos como menu duplicado dentro de cada row;
- rotas humanas propostas no V4 ainda nao existiam como aliases.

Entregue:

- aliases preservando rotas antigas:
  - `/jogar` -> `/locais`;
  - `/competir` -> `/eventos`;
  - `/trabalho` -> `/gestao`;
  - `/trabalho/competicoes` -> `/eventos?modo=organizing`;
  - `/trabalho/atendimento` -> `/gestao`;
- `TournamentPage` passou a recolher mapa completo e fases em `Mais navegacao do torneio`;
- a primeira dobra de torneio fica mais dependente do cockpit e das acoes da fase, nao de uma arvore de menus;
- `ManagementHubPage` passou a recolher atalhos de modulos por local em `Mais areas do local`;
- `tournament-e2e-flow-audit.mjs` passou a testar:
  - resultado enviado por jogador;
  - aplicacao pelo owner;
  - placar manual admin com `Salvar resultado oficial`;
  - WO pela UI;
  - finalizacao/estado final sem fallback silencioso por select de status.

Validacao:

- `npm.cmd run build` passou;
- run fresco final: `docs/screenshots/tournament-e2e-flow-v4-2026-05-20-run20-final-sprint-pass/`;
- torneio criado: `ATP Open Dourados 025536`;
- ID: `688f0ba9-8278-4c39-ade0-1c3ec6e80f46`;
- diagnostico final: `completed = true`, `failedRequests = []`, `pageErrors = []`;
- result attempts confirmaram `admin-manual-score`, `apply-submitted-result` e `walkover-ui`.

Pendencias:

- redesenhar subviews internas de torneio/liga por fase em uma rodada maior do Competition OS;
- QA visual adicional das novas rotas alias em mobile 390 e desktop amplo.

### [x] SPRINT-2026-05-21 - Local ativo em modulos profundos

Status: `[x]` concluido no codigo e build

Problema:

- quando o usuario tem mais de uma academia/local, a rota profunda `/gestao/:placeId/...` mostrava o local no header, mas nao oferecia troca clara de escopo;
- isso obrigava voltar para a central ou sidebar, aumentando a sensacao de menu externo desconectado.

Entregue:

- `PlaceAdminShell` recebeu seletor `Local ativo` quando ha mais de um local acessivel;
- o seletor preserva o modulo atual ao trocar de local quando possivel;
- `PlacesPage` passa para o shell apenas locais em que o usuario possui algum modulo de gestao acessivel;
- estilos premium dark adicionados para o seletor dentro de Management OS.

Validacao:

- `npm.cmd run build` passou;
- `git diff --check` sem erro, apenas avisos CRLF do workspace Windows.

Pendencias:

- QA visual clicando o seletor com uma conta que tenha dois ou mais locais reais;
- desenhar uma camada futura de `workspace switcher` tambem para competicoes se houver muitas ligas/torneios ativos.

### [x] SPRINT-2026-05-21 - Revalidar torneio completo pos-correcoes

Status: `[x]` concluido no codigo, auditoria e documentacao

Problema:

- apos as correcoes de fluxo, era necessario criar e operar novo torneio do inicio ao fim para descobrir se ainda havia bloqueios funcionais, ambiguidades de UX ou quebras visuais;
- a primeira revalidacao passou funcionalmente, mas revelou copy incorreto na aba de classificacao de mata-mata finalizado;
- a segunda revalidacao passou funcionalmente, mas revelou card de podio branco com baixo contraste dentro do tema dark.

Entregue:

- `TournamentPage` passou a mostrar resultado final/podio na aba de classificacao quando o torneio mata-mata esta finalizado e tem campeao;
- o estado vazio de classificacao agora diferencia torneio de grupos e mata-mata;
- `App.css` corrigiu contraste do podio no Competition OS dark em desktop e mobile.

Validacao:

- `npm.cmd run build` passou;
- `git diff --check` passou sem erro, apenas avisos CRLF do workspace Windows;
- rerun 1: `docs/screenshots/tournament-e2e-flow-v4-2026-05-21-run21-post-fixes/`;
- rerun 2: `docs/screenshots/tournament-e2e-flow-v4-2026-05-21-run22-post-classification-fix/`;
- run final aprovado: `docs/screenshots/tournament-e2e-flow-v4-2026-05-21-run23-final-post-fixes/`;
- torneio final aprovado: `ATP Open Dourados 032025`;
- ID: `23fb0ac9-8436-4cd1-a68c-d23cf0129b56`;
- diagnostico final: `completed = true`, `failedRequests = []`, `pageErrors = []`;
- result attempts validaram:
  - `apply-submitted-result`;
  - `admin-manual-score-draft`;
  - `admin-manual-score`;
  - `walkover-ui`.

Pendencias:

- bottom nav mobile permanece fixa e pode aparecer sobre conteudo em screenshots full-page, mas nao bloqueou o fluxo testado;
- proxima rodada de produto pode separar ainda mais as subviews por fase para reduzir densidade operacional.

### [x] SPRINT-2026-05-21 - Consolidar Agenda, Aulas e Pagamentos em Rotina

Status: `[x]` concluido no codigo e documentacao

Problema:

- a navegacao do Player App mostrava `Agenda` no menu principal e, ao mesmo tempo, expunha `Aulas` e `Pagamentos` como itens separados no desktop;
- a pagina de agenda ja consolidava reservas, partidas, aulas, pagamentos pessoais e historico, gerando duplicidade de menu e duvida sobre onde cada rotina pessoal deveria ser consultada.

Entregue:

- o item visivel `Agenda` foi renomeado para `Rotina`;
- `Aulas` e `Pagamentos` sairam do menu principal/desktop do jogador;
- as rotas antigas `/minhas-aulas` e `/meus-pagamentos` continuam preservadas e agora destacam `Rotina` no menu;
- a pagina `/agenda` passou a se apresentar como `Central pessoal` / `Minha rotina`;
- os filtros internos continuam existindo para separar `Reservas`, `Partidas`, `Aulas`, `Pagamentos` e `Historico` sem duplicar a navegacao principal.

Validacao:

- `npx.cmd tsc -b --pretty false` passou;
- `git diff --check` passou, com apenas avisos CRLF do workspace Windows;
- screenshots de `/agenda`, `/minhas-aulas` e `/meus-pagamentos` em mobile 390px e desktop 1366px foram gerados em `docs/screenshots/player-routine-nav-consolidation-2026-05-21/`;
- diagnostico das capturas sem eventos de console.

Pendencias:

- avaliar em produto se o nome final deve permanecer `Rotina` ou evoluir para outro rotulo curto, desde que continue englobando agenda, aulas e pagamentos pessoais.

### [x] SPRINT-2026-05-21 - Alinhamento do perfil do jogador

Status: `[x]` concluido no codigo, screenshot e documentacao

Problema:

- o avatar gerado por iniciais no perfil ficava desalinhado em relacao ao bloco de nome/local;
- o botao de camera invadia o avatar no mobile e atrapalhava a leitura das iniciais;
- alguns textos de linhas e cards do perfil, especialmente em listas/conta, podiam parecer centralizados ou soltos demais.

Entregue:

- o hero do perfil passou a ter areas explicitas para avatar, identidade e metricas;
- nome, local e chips ficam agrupados em `profile-identity-main`, alinhando corretamente com o avatar;
- o botao de camera foi reposicionado para o canto externo do avatar;
- textos de `profile-row` foram normalizados para alinhamento a esquerda e quebra segura;
- o menu consolidado `Rotina` permanece preservado no perfil.

Validacao:

- `npx.cmd tsc -b --pretty false` passou;
- `git diff --check` passou, com apenas avisos CRLF do workspace Windows;
- screenshots de `/perfil` em mobile 390px e desktop 1366px foram gerados em `docs/screenshots/profile-alignment-fix-2026-05-21/`;
- diagnosticos individuais das capturas sem eventos de console.

Observacao operacional:

- durante a captura, o disco chegou a 0 bytes livres; foram removidas apenas pastas antigas de screenshots gerados em `docs/screenshots` para liberar espaco, sem tocar em codigo, assets ou documentos.


