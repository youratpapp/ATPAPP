# Tech Debt

Fonte principal: `product-architecture-ux-audit.md`.

Data: 2026-05-13

## Regra

Divida tecnica aqui inclui codigo, arquitetura de UX, duplicidade funcional e padroes visuais que aumentam custo de evolucao.

## Recalibracao

- Evitar extracoes que apenas movem JSX sem melhorar fluxo ou clareza operacional.
- Priorizar fechamento de jornada: operacao, criacao, configuracao, historico e estado vazio.
- Iniciar `CompetitionShell` antes de tentar esgotar toda a modularizacao de `PlacesPage`.
- Tratar wizards como reducao de divida de UX, nao como melhoria cosmetica.

## Reduzido em 2026-05-13

- Criacao de turma/horario da Academia saiu do corpo inline da `PlacesPage` para `PlaceAcademyClassSetupModule`.
- Busca de encaixes/aula avulsa/reposicao saiu do corpo inline da `PlacesPage` para `PlaceAcademyFitModule`.
- Estados vazios da Academia passaram a indicar proxima acao, reduzindo telas sem orientacao.
- Primeira base de competicoes saiu de implementacoes divergentes para `CompetitionWorkspace`, com escopo, publicacao e fila operacional reutilizaveis.
- Tabs de torneio/liga passaram para `CompetitionTabs`, reduzindo divergencia visual e preparando uma navegacao de competicao unica.
- Cabecalho de torneio/liga passou para `CompetitionHeader`, removendo variacao estrutural desnecessaria entre competicoes.
- Centro de pendencias do torneio passou para `CompetitionOperationalQueue`, removendo uma segunda implementacao visual de fila operacional.
- Criacao de torneio/liga saiu de modais simples para `SetupWizard`, reduzindo formularios inline de alto erro.
- Criacao de turma da Academia deixou de ser formulario denso e virou wizard por etapas com identidade, agenda e perfil/preco.
- App passou a usar code splitting por rota com `React.lazy`/`Suspense`, reduzindo o bundle inicial e removendo o alerta de chunk principal grande no build.
- Rota `/locais/:placeId/admin` foi criada, reduzindo a divida de misturar pagina publica, descoberta e gestao na mesma entrada.
- Modulos do admin de local passaram a sincronizar estado com URL, reduzindo estado interno nao compartilhavel.
- Admin de local passou a normalizar modulo por permissao/plano, reduzindo risco de estados inconsistentes entre URL e conteudo.
- Subvisoes dos workspaces administrativos passaram a sincronizar com `?visao=`, reduzindo estado interno escondido em rotinas frequentes.
- Query `?visao=` invalida/tecnica passou a ser normalizada, reduzindo divergencia entre navegacao e conteudo renderizado.
- Gramatica de rotas/subvisoes do admin de local saiu de `PlacesPage` para `place-admin-navigation`, reduzindo duplicidade e preparando a quebra real do shell.
- Sincronizacao de subvisao do admin de local passou por resolvedor unico, reduzindo sete efeitos quase iguais dentro da `PlacesPage`.
- Efeitos e callbacks de URL do admin de local sairam do corpo da `PlacesPage` para `usePlaceAdminRouteSync`.
- Carregamento de recursos administrativos do local saiu do corpo da `PlacesPage` para `place-admin-data`, removendo duplicidade entre refresh completo e refresh por local.
- Estado dos recursos administrativos por local saiu do bloco principal de `PlacesPage` para `usePlaceAdminResourceState`.
- Criacao de local saiu de formulario denso em modal para `PlaceCreateWizard`, reduzindo friccao e preparando onboarding guiado.
- Bloco legado duplicado de cockpit administrativo foi removido da `PlacesPage`.

## Critica

### PlacesPage monolitica

Gravidade: critica.

Impacto:

- dificulta evolucao por modulo;
- aumenta risco de regressao;
- mistura descoberta, admin, operacao, configuracao e relatorio;
- torna mobile mais longo e instavel.

Acao:

- extrair `PlaceAdminShell`;
- extrair modulos por dominio;
- mover regras para hooks/domain services.

Evidencia atual:

- o code splitting inicial reduziu o bundle principal e removeu o alerta de chunk acima de 500 kB; a divida restante e separar melhor dados/hooks de `PlacesPage` e dominios compartilhados.

### TournamentPage monolitica

Gravidade: alta.

Impacto:

- mistura organizacao, publicacao, jogador, partidas, resultado e configuracao;
- risco alto ao mexer em fluxo de evento.

Acao:

- criar `CompetitionShell`;
- separar operacao, participantes, publicacao e configuracao.

### LeagueDetailsPage divergente

Gravidade: alta.

Impacto:

- liga e torneio parecem produtos diferentes;
- operador reaprende fluxos.

Acao:

- alinhar tabs, filas e publicacao com torneio.

### places.ts muito grande

Gravidade: alta.

Impacto:

- tipos, dados e utilitarios ficam acoplados;
- dificil identificar fonte de verdade.

Acao:

- separar por dominio: bookings, academy, finance, CRM, canteen, team.

## Alta

### Listas operacionais sem gramatica unica

Impacto:

- cada modulo exige leitura diferente;
- botoes e status aparecem em posicoes variadas.

Acao:

- criar `OperationalQueue`;
- criar `EntityActionRow`;
- padronizar status, contexto e acao primaria.

### Formularios complexos inline

Impacto:

- mobile longo;
- erro de preenchimento;
- abandono.

Acao:

- usar wizard para criar local, torneio, liga, pacote e regras.

### Publicacao espalhada

Impacto:

- link, WhatsApp, CSV, PNG e widget aparecem sem padrao.

Acao:

- criar `PublishingKit`.

## Media

### Relatorios proximos demais da operacao diaria

Impacto:

- gestores confundem decisao com execucao.

Acao:

- relatorios em subvisao propria;
- fila operacional no topo dos modulos.

### Estados vazios variaveis

Impacto:

- telas parecem inacabadas quando sem dados.

Acao:

- padronizar empty states com proxima acao.

### Mobile ainda empilha demais

Impacto:

- scroll alto;
- acoes importantes ficam escondidas.

Acao:

- drawers, accordions, action sheets e sticky actions.

## Regra para nao criar nova divida

- Nao adicionar nova funcionalidade grande em `PlacesPage.tsx` sem avaliar extracao.
- Nao criar componente visual novo se ja existe gramatica similar.
- Nao duplicar dados de resumo com filtros diferentes sem contexto explicito.
- Nao misturar configuracao com operacao diaria por conveniencia.

## Log curto

- 2026-05-13: criada primeira base de gramatica operacional (`OperationalQueue`, `OperationalQueueItems`, `EntityActionRow`) e aplicada nas filas principais de locais. Lint e build passaram; build manteve alerta de chunk grande.
- 2026-05-13: criado `PublishingKit` para reduzir publicacao duplicada em torneio, pagina publica de local e ranking. Lint e build passaram; chunk grande permanece como divida estrutural.
- 2026-05-13: criado `MetricStrip` para reduzir duplicacao de faixas de indicadores em dashboard/relatorios do local. Lint e build passaram; chunk grande permanece como divida estrutural.
- 2026-05-13: criado `ActionBar` para padronizar grupos de CTAs em home, competicoes, torneio, liga e pagina publica de local. Lint e build passaram; chunk grande permanece como divida estrutural.
- 2026-05-13: criado `ScreenState` e aplicado em Ranking e hubs de Torneios/Ligas para loading, erro e vazio com acao. Lint e build passaram; chunk grande permanece como divida estrutural.
- 2026-05-13: criado `EntityDrawer` e aplicado no historico do CRM do local, reduzindo altura das linhas de contato. Lint e build passaram; chunk grande permanece como divida estrutural.
- 2026-05-13: extraido `PlaceCrmHistoryDrawer` como primeiro componente de dominio do CRM dentro da modularizacao de Places. Lint e build passaram; chunk grande permanece como divida estrutural.
- 2026-05-13: extraido `PlaceCrmContactRow` para reduzir responsabilidade visual/operacional da `PlacesPage` no CRM. Lint e build passaram; chunk grande permanece como divida estrutural.
- 2026-05-13: extraido `PlaceCrmContactForm` para separar captura de lead do corpo da `PlacesPage`. Lint e build passaram; chunk grande permanece como divida estrutural.
- 2026-05-13: criado `PlaceCrmModule` como primeira unidade de dominio de clientes/CRM consumida pela `PlacesPage`. Lint e build passaram; chunk grande permanece como divida estrutural.
- 2026-05-13: criado `PlaceMembershipModule` para remover planos/socios/mensalidades do corpo inline da `PlacesPage`. Lint e build passaram; chunk grande permanece como divida estrutural.
- 2026-05-13: criado `PlaceClientActionQueue` para retirar a fila de atendimento/relacionamento do corpo inline da `PlacesPage`. Lint e build passaram; chunk grande permanece como divida estrutural.
- 2026-05-13: `PlaceClientActionQueue` passou a atender tambem a subvisao de solicitacoes, reduzindo duplicidade de listas operacionais. Lint e build passaram; chunk grande permanece como divida estrutural.
- 2026-05-13: criado `PlaceClientRelationshipModule` e tipado `PlaceClientReceivable` para separar rotina de relacionamento/cobranca do corpo inline da `PlacesPage`. Lint e build passaram; chunk grande permanece como divida estrutural.
- 2026-05-13: criado `PlaceFinanceReceivablesModule` para retirar a subvisao de recebiveis financeiros do corpo inline da `PlacesPage`. Lint e build passaram; chunk grande permanece como divida estrutural.
- 2026-05-13: criado `PlaceFinanceOverviewModule` para retirar KPIs financeiros do corpo inline da `PlacesPage`. Lint e build passaram; chunk grande permanece como divida estrutural.
- 2026-05-13: criado `PlaceFinanceExpensesModule` para unificar despesas no workspace e no fallback legado de Places. Lint e build passaram; chunk grande permanece como divida estrutural.
- 2026-05-13: criado `PlaceFinancePackagesModule` para retirar ofertas, creditos, vendas de credito e saude de saldos do corpo inline da `PlacesPage`. Lint e build passaram; chunk grande permanece como divida estrutural.
- 2026-05-13: criado `PlaceCanteenStockModule` para unificar estoque da cantina no workspace e no fallback legado. Lint e build passaram; chunk grande permanece como divida estrutural.
- 2026-05-13: criado `PlaceCanteenProductsModule` para retirar catalogo de produtos da Cantina do corpo inline da `PlacesPage`. Lint e build passaram; chunk grande permanece como divida estrutural.
- 2026-05-13: criados `PlaceCanteenProductForm` e `PlaceCanteenSaleForm` para retirar formularios de produto/venda da Cantina do corpo inline da `PlacesPage`. Lint e build passaram; chunk grande permanece como divida estrutural.
- 2026-05-13: criado `PlaceCanteenSummaryModule` para unificar resumo do dia e vendas recentes da Cantina no workspace/fallback. Lint e build passaram; chunk grande permanece como divida estrutural.
- 2026-05-13: criados `PlaceBookingOperationalQueues` e `PlaceBookingTodayModule` para reduzir mistura de agenda, confirmacao e lista de espera dentro da `PlacesPage`. Lint e build passaram; chunk grande permanece como divida estrutural.
- 2026-05-13: criados `PlaceBookingReservationsModule` e `PlaceBookingWaitlistModule` para remover subvisoes operacionais de reservas/espera da `PlacesPage`. Lint e build passaram; chunk grande permanece como divida estrutural.
- 2026-05-13: criado `PlaceBookingResourcesModule` para retirar configuracao de quadras, precos e regras de reserva do corpo inline da `PlacesPage`. Lint e build passaram; chunk grande permanece como divida estrutural.
- 2026-05-13: criado `PlaceBookingCreateModule` para retirar formulario de criacao/busca de reserva da `PlacesPage`. Lint e build passaram; chunk grande permanece como divida estrutural.
- 2026-05-13: criado `PlaceBookingCalendarModule` para retirar calendario/ocupacao de quadras da `PlacesPage`. Lint e build passaram; chunk grande permanece como divida estrutural.
- 2026-05-13: criado `PlaceBookingDetailedListModule` para retirar lista detalhada legada de reservas/espera da `PlacesPage`. Lint e build passaram; chunk grande permanece como divida estrutural.
- 2026-05-13: criados `PlaceAcademyOperationalQueues` e `PlaceAcademyTodayModule` para retirar filas do dia e resumo das aulas da `PlacesPage`. Lint e build passaram; chunk grande permanece como divida estrutural.
- 2026-05-13: criados `PlaceAcademyClassesModule` e `PlaceAcademyStudentsModule` para retirar turmas/alunos, filtros, pagamento, chamada e lembretes da `PlacesPage`. Lint e build passaram; chunk grande permanece como divida estrutural.
- 2026-05-13: criados `PlaceAcademyRequestsModule` e `PlaceAcademyCoachesModule` para retirar pendencias e professores do corpo inline da `PlacesPage`. Lint e build passaram; chunk grande permanece como divida estrutural.
- 2026-05-13: criado `PlaceAcademyResourcesModule` para retirar recursos operacionais da academia do corpo inline da `PlacesPage`. Lint e build passaram; chunk grande permanece como divida estrutural.
- 2026-05-13: `App.tsx` passou a carregar paginas por `React.lazy`/`Suspense`; lint e build passaram, e o alerta de chunk principal acima de 500 kB foi removido.
- 2026-05-13: criada rota administrativa `/locais/:placeId/admin` e subrota por modulo; lint e build passaram.
- 2026-05-13: troca de modulo do admin de local passou a navegar para slugs em portugues (`agenda`, `academia`, `clientes`, `financeiro`, `cantina`, `equipe`, `ajustes`); lint e build passaram.
- 2026-05-13: rota admin do local passou a redirecionar para modulo permitido quando a URL pede area indisponivel; lint e build passaram.
- 2026-05-13: Agenda, Academia, Clientes, Financeiro, Cantina, Equipe e Ajustes passaram a sincronizar subvisoes por `?visao=`; lint e build passaram.
- 2026-05-13: `?visao=` invalida/tecnica no admin de local passou a ser canonizada ou removida; lint e build passaram.
- 2026-05-13: slugs, parsers e builders do admin de local foram extraidos para `place-admin-navigation`; lint e build passaram.
- 2026-05-13: `resolvePlaceAdminView` passou a concentrar defaults/canonizacao de subvisoes administrativas; lint e build passaram.
- 2026-05-13: criado `usePlaceAdminRouteSync` para concentrar sincronizacao de modulo/subvisao por URL; lint e build passaram.
- 2026-05-13: criado `place-admin-data` para centralizar fetch de recursos, pagamentos e workspace de locais; lint e build passaram.
- 2026-05-13: criado `usePlaceAdminResourceState` para concentrar mapas de recursos administrativos e aplicadores de refresh; lint e build passaram.
- 2026-05-13: criado `PlaceCreateWizard` e removido cockpit legado duplicado; lint e build passaram.
