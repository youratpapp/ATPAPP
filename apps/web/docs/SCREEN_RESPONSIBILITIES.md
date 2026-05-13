# Screen Responsibilities

Fonte principal: `product-architecture-ux-audit.md`.

Data: 2026-05-13

## Regra geral

Cada tela deve ter uma responsabilidade primaria. Se uma tela precisa resolver operacao, configuracao, publicacao e relatorio ao mesmo tempo, ela deve virar shell com modulos, drawers ou subrotas.

## Matriz de responsabilidades

| Tela | Acao primaria | Deve conter | Nao deve conter | Direcao |
| --- | --- | --- | --- | --- |
| `/inicio` | orientar jogador e proximas acoes | compromissos, convites, pagamentos, historico curto | administracao profunda de local/torneio | virar central do jogador com secoes recolhiveis |
| `/eventos` | descobrir/entrar em competicoes | torneios, ligas, destaques, filtros | operacao detalhada de evento | manter como hub |
| `/eventos/torneios` | listar/criar torneios | lista, CTA de criacao, filtros | chave completa ou resultado detalhado | usar wizard para criacao |
| `/eventos/ligas` | listar/criar ligas | lista, CTA de criacao, filtros | operacao de rodada | usar wizard para criacao |
| `/eventos/:tournamentId/:tab` | operar torneio | classe ativa, fila, partidas, publicacao, jogadores | configuracao profunda misturada com operacao | evoluir para CompetitionShell |
| `/eventos/ligas/:leagueId` | operar liga | rodada, partidas, ranking, jogadores, chat | modelo mental diferente de torneio | alinhar a CompetitionShell |
| `/gestao` | orientar operador de academia | locais acessiveis, pendencias, atalhos por modulo | descoberta publica de locais | ser a entrada primaria de donos/equipe |
| `/gestao/:placeId/:module` | operar local | fila do dia, modulo ativo, resumo e acoes | descoberta publica | manter contexto operacional e subvisoes |
| `/locais` | descobrir locais e iniciar cadastro | cards publicos, filtros, entrada para pagina publica | cockpit administrativo completo por padrao | deixar gestao em `/gestao` |
| `/locais/:placeId` | converter jogador/publico | marca, ofertas, reserva, turma, jogos, widget | configuracao interna | manter publica e limpa |
| `/locais/:placeId/admin` | compatibilidade de rota | redirecionar/normalizar para gestao | ser destino principal novo | manter legado temporario |
| `/ranking` | comparar desempenho | ranking, filtros, regras, exportacao | configuracao de liga completa | manter como leitura competitiva |
| `/perfil` | identidade e historico | dados, preferencia, atividade | gestao operacional | manter pessoal |
| `/inscricao/:tournamentId` | converter inscricao | informacoes essenciais, classe, CTA | operacao do torneio | landing mobile-first |

## Sinais de tela sobrecarregada

- Mais de uma acao primaria visivel no mesmo bloco.
- Filtros alteram dados de resumo sem deixar o contexto claro.
- Configuracao aparece antes da fila operacional.
- Relatorios, formularios e listas dividem a mesma viewport.
- A mesma entidade aparece com acoes diferentes em lugares proximos.

## Regra de correcao

Quando uma tela cresce demais:

1. identificar a acao primaria;
2. mover detalhes para drawer;
3. mover criacao complexa para wizard;
4. separar configuracao em subvisao;
5. manter operacao diaria no topo;
6. documentar a responsabilidade nova.

## Evolucoes registradas

- 2026-05-13: criada tela `/gestao` como central operacional de academia/clube, reduzindo a mistura entre descoberta publica de locais e trabalho diario de equipe.
- 2026-05-13: responsabilidade principal de operar local migrou para `/gestao/:placeId/:module`, mantendo `/locais/:placeId/admin` apenas como rota legada de compatibilidade.
- 2026-05-13: `ManagementShell` passou a envolver `/gestao` e admin de local, dando cabecalho operacional proprio para contexto, acoes e indicadores sem depender do layout de `Locais`.
- 2026-05-13: `PlaceAdminShell` iniciou a separacao da responsabilidade de cockpit/contexto do local, deixando `PlacesPage` menos responsavel pela experiencia administrativa.
- 2026-05-13: `/gestao` reduziu o papel de dashboard e passou a tratar locais como rows operacionais com pulso, tarefas e acoes, mantendo cards apenas para fila/estado quando fizer sentido.
- 2026-05-13: `/gestao` ganhou comportamento mobile-first mais claro, com header compacto, stats em trilho horizontal e atalhos de modulo em scroll lateral para evitar empilhamento.
- 2026-05-13: `/gestao/:placeId/:module` ganhou shell de workspace mais compacto, com modulo ativo antes de setup/configuracao e fila operacional antes de metricas.
- 2026-05-13: navegacao global desktop passou a separar Jogar, Operar e Conta, reforcando que `Gestao` e contexto operacional e `Locais` e camada publica/descoberta.
- 2026-05-13: `/inicio` foi reajustada para Player App por proxima acao, com painel do dia, rows de pendencia/agenda/clube e atalhos de jogador antes de secoes secundarias.
- 2026-05-13: CRM de locais iniciou separacao real por dominio com `PlaceCrmModule`; `PlacesPage` passa a orquestrar dados/navegacao e delegar captura, lista, historico e acoes de CRM ao modulo.
- 2026-05-13: contatos/leads do CRM passaram a usar `EntityActionRow`, com acao primaria contextual e historico/arquivamento como acoes secundarias.
- 2026-05-13: planos e socios de locais foram isolados em `PlaceMembershipModule`, reduzindo mistura entre captura de lead, recorrencia, status do jogador e cobranca dentro da pagina principal.
- 2026-05-13: fila diaria de atendimento de clientes foi isolada em `PlaceClientActionQueue`, reforcando a separacao entre operacao do dia e configuracao/relatorios.
- 2026-05-13: rotina de relacionamento e cobranca de clientes foi isolada em `PlaceClientRelationshipModule`, deixando a subvisao responsavel por follow-up, lead parado, inadimplencia e lembretes segmentados.
- 2026-05-13: recebiveis financeiros foram isolados em `PlaceFinanceReceivablesModule`, usando o mesmo contrato de recebiveis de Clientes para reduzir duplicidade entre cobranca e relacionamento.
- 2026-05-13: recebiveis financeiros passaram a usar `EntityActionRow`, deixando valor, status e lembrete claros sem virar card alto.
- 2026-05-13: resumo financeiro foi isolado em `PlaceFinanceOverviewModule`, deixando a subvisao de resumo focada em KPIs e nao em formularios ou lancamentos.
- 2026-05-13: despesas financeiras foram isoladas em `PlaceFinanceExpensesModule`, evitando duas renderizacoes divergentes para a mesma responsabilidade.
- 2026-05-13: ofertas e creditos financeiros foram isolados em `PlaceFinancePackagesModule`, separando catalogo/venda/saude de saldo da orquestracao da tela principal.
- 2026-05-13: estoque da cantina foi isolado em `PlaceCanteenStockModule`, mantendo a responsabilidade de reposicao/alerta separada de venda e cadastro de produto.
- 2026-05-13: catalogo da cantina foi isolado em `PlaceCanteenProductsModule`, separando leitura de produtos de criacao de produto e registro de venda.
- 2026-05-13: formularios de produto e venda da cantina foram isolados em `PlaceCanteenProductForm` e `PlaceCanteenSaleForm`, separando cadastro, venda e acompanhamento.
- 2026-05-13: resumo da cantina foi isolado em `PlaceCanteenSummaryModule`, unificando caixa do dia, indicadores e vendas recentes.
- 2026-05-13: filas operacionais de Agenda/Reservas foram isoladas em `PlaceBookingOperationalQueues` e a subvisao do dia em `PlaceBookingTodayModule`, reforcando que agenda resolve primeiro a operacao diaria antes de configuracao de quadras/regras.
- 2026-05-13: subvisoes de reservas recentes e lista de espera foram isoladas em `PlaceBookingReservationsModule` e `PlaceBookingWaitlistModule`, separando execucao de reserva da orquestracao da tela.
- 2026-05-13: configuracao de quadras, precos e regras de reserva foi isolada em `PlaceBookingResourcesModule`, reforcando a fronteira entre operacao diaria e configuracao.
- 2026-05-13: criacao de reserva/bloqueio/lista de espera foi isolada em `PlaceBookingCreateModule`, deixando a pagina principal apenas como shell de contexto.
- 2026-05-13: calendario e ocupacao de quadras foram isolados em `PlaceBookingCalendarModule`, separando visualizacao operacional de agenda da composicao da tela principal.
- 2026-05-13: historico operacional detalhado de reservas/espera foi isolado em `PlaceBookingDetailedListModule`, preservando pagamento, cancelamento de serie e acoes do jogador sem duplicar logica na pagina principal.
- 2026-05-13: operacao diaria da academia foi iniciada como modulo com `PlaceAcademyOperationalQueues` e `PlaceAcademyTodayModule`, separando aulas do dia e pendencias de matricula/encaixe da composicao da `PlacesPage`.
- 2026-05-13: subvisoes de turmas e alunos foram isoladas em `PlaceAcademyClassesModule` e `PlaceAcademyStudentsModule`, separando grade, filtros, pagamento, chamada e lembretes da composicao da tela.
- 2026-05-13: pendencias e professores da academia foram isolados em `PlaceAcademyRequestsModule` e `PlaceAcademyCoachesModule`, deixando atendimento/retorno e gestao do professor fora da pagina principal.
- 2026-05-13: recursos operacionais da academia foram isolados em `PlaceAcademyResourcesModule`, separando professor, quadra, comissao, vinculo de login e horarios abertos do corpo principal.
- 2026-05-13: criacao de turma/horario foi isolada em `PlaceAcademyClassSetupModule`, reforcando que configuracao de grade e uma subresponsabilidade da Academia e nao da pagina principal.
- 2026-05-13: encaixes, aulas avulsas e reposicoes foram isolados em `PlaceAcademyFitModule`, separando busca/solicitacao/aprovacao de pedidos da lista de turmas.
- 2026-05-13: estados vazios acionaveis foram aplicados nas subvisoes de Academia para evitar telas mortas e conduzir o usuario para criar turma, ver grade ou buscar encaixes.
- 2026-05-13: torneio e liga iniciaram convergencia para `CompetitionShell` com seletor de escopo comum, painel de publicacao comum e fila operacional comum na liga.
- 2026-05-13: o recorte ativo de competicao passou a aparecer antes dos resumos principais, reduzindo ambiguidade sobre se os numeros sao do evento inteiro, classe, temporada ou rodada.
- 2026-05-13: tabs de torneio/liga foram padronizadas em `CompetitionTabs`, com badges de pendencia e comportamento mobile consistente.
- 2026-05-13: cabecalho de torneio/liga foi padronizado em `CompetitionHeader`, alinhando titulo, contexto, status e retorno.
- 2026-05-13: fila de pendencias do torneio foi alinhada a liga com `CompetitionOperationalQueue`, reforcando competicoes como operacao por prioridades.
- 2026-05-13: Competition OS ganhou base visual compartilhada: liga mostra temporada/classe antes de tabs/KPIs, filas viraram rows e publicacao ficou visualmente secundaria.
- 2026-05-13: filtros de temporada/classe da liga passaram a usar `ResponsiveFilterSheet`, reduzindo empilhamento mobile sem esconder escopo no desktop.
- 2026-05-13: criacao de torneio/liga passou a usar `SetupWizard`, separando decisoes iniciais em etapas curtas e reduzindo friccao no setup.
- 2026-05-13: criacao de turma da Academia passou a usar `SetupWizard`, separando identidade, agenda e perfil/preco para reduzir densidade no modulo.
- 2026-05-13: paginas passaram a carregar por rota com `React.lazy`/`Suspense`, alinhando a estrutura tecnica com responsabilidades de tela separadas por dominio.
- 2026-05-13: rota `/locais/:placeId/admin` foi criada para separar gestao administrativa da pagina publica do local, reduzindo mistura entre descoberta e operacao.
- 2026-05-13: subrotas de gestao do local passaram a refletir o modulo ativo, permitindo link direto para Agenda, Academia, Clientes, Financeiro, Cantina, Equipe e Ajustes.
- 2026-05-13: admin de local passou a corrigir automaticamente modulo de URL quando o plano/permissao nao permite aquela area, preservando contexto operacional valido.
- 2026-05-13: subvisoes de Agenda, Academia, Clientes, Financeiro, Cantina, Equipe e Ajustes passaram a ser enderecaveis por `?visao=`, reduzindo estado escondido e melhorando retorno direto a tarefas frequentes.
- 2026-05-13: subvisoes administrativas passaram a abrir em uma visao padrao quando `?visao=` esta ausente ou invalida, mantendo cada workspace com responsabilidade clara.
- 2026-05-13: navegacao administrativa de locais passou a ter fonte tecnica propria em `place-admin-navigation`, deixando `PlacesPage` menos responsavel por contrato de rota.
- 2026-05-13: defaults e canonizacao de subvisoes administrativas passaram para `resolvePlaceAdminView`, reduzindo decisao de navegacao espalhada pela tela.
- 2026-05-13: `usePlaceAdminRouteSync` passou a cuidar da relacao entre URL, modulo e subvisao no admin de local, deixando `PlacesPage` mais focada em composicao e dados.
- 2026-05-13: `place-admin-data` passou a concentrar busca de recursos administrativos, ajudando `PlacesPage` a sair do papel de camada de dados e caminhar para shell/composicao.
- 2026-05-13: `usePlaceAdminResourceState` passou a guardar e aplicar mapas administrativos por local, reduzindo a responsabilidade da tela sobre estado bruto de Agenda, Academia, Clientes, Financeiro e Cantina.
- 2026-05-13: criacao de local passou a ser wizard com etapas de identidade, localizacao/rede e pagina, deixando o hub de locais menos dependente de formulario denso.
