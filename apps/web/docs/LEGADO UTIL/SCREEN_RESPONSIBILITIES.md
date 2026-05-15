# Screen Responsibilities

Fonte principal: `product-architecture-ux-audit.md`.

Data: 2026-05-13

## Regra geral

Cada tela deve ter uma responsabilidade primaria. Se uma tela precisa resolver operacao, configuracao, publicacao e relatorio ao mesmo tempo, ela deve virar shell com modulos, drawers ou subrotas.

## Matriz de responsabilidades

| Tela | Acao primaria | Deve conter | Nao deve conter | Direcao |
| --- | --- | --- | --- | --- |
| `/inicio` | orientar jogador e proximas acoes | compromissos, convites, pagamentos, historico curto | administracao profunda de local/torneio | virar central do jogador com secoes recolhiveis |
| `/eventos` | separar jogar, organizar e descobrir competicoes | torneios/ligas que jogo, organizo e posso descobrir | gestao de academia ou lista unica ambigua | evoluir hub por contexto |
| `/eventos/torneios` | listar/criar torneios | lista, CTA de criacao, filtros | chave completa ou resultado detalhado | usar wizard para criacao |
| `/eventos/ligas` | listar/criar ligas | lista, CTA de criacao, filtros | operacao de rodada | usar wizard para criacao |
| `/eventos/:tournamentId/:tab` | operar torneio | classe ativa, fila, partidas, publicacao, jogadores | configuracao profunda misturada com operacao | evoluir para CompetitionShell |
| `/eventos/ligas/:leagueId` | operar liga | rodada, partidas, ranking, jogadores, chat | modelo mental diferente de torneio | alinhar a CompetitionShell |
| `/gestao` | orientar operador pelo perfil correto | academia, professor solo ou competicoes organizadas conforme permissao | ferramentas sem plano/papel ou descoberta publica | ser entrada contextual de operacao |
| `/gestao/:placeId/:module` | operar local | fila do dia, modulo ativo, resumo e acoes | descoberta publica | manter contexto operacional e subvisoes |
| `/gestao/:placeId/academia` | operar aulas, turmas, alunos e professores | Hoje, Grade, Alunos, Pendencias, Professores e Configuracao | bloco legado duplicado, formularios repetidos por turma, busca de encaixe permanente | evoluir para Academia v2 com rows e drawers |
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
- Tarefa essencial aparece apenas com nome tecnico de modulo.
- Usuario ve contexto operacional que nao pertence ao seu perfil/plano.
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
7. se a tarefa for setup basico, criar quick action semantica.

## Evolucoes registradas

- 2026-05-15: a reestruturacao por papel/intencao foi consolidada em `ROLE_BASED_RESTRUCTURE_PLAYBOOK.md`, `PLAYER_APP_V2_UX_PLAN.md`, `COMPETITION_OS_V2_UX_PLAN.md`, `MANAGEMENT_OS_V2_UX_PLAN.md`, `ROLE_BASED_RESTRUCTURE_QUEUE.md`, `ROLE_BASED_RESTRUCTURE_SPRINT_GUIDE.md` e `ROLE_BASED_RESTRUCTURE_SPRINT_BACKLOG.md`. A regra passa a ser: cada tela deve responder primeiro ao papel e intencao atuais antes de exibir capacidades internas do sistema.
- 2026-05-15: `/inicio`, `/locais`, `/eventos`, `/ranking`, `/perfil`, `/gestao` e paginas publicas devem ser reavaliadas pela Role Based Restructure Queue para reduzir empilhamento mobile, cards/KPIs indevidos e vazamento entre Player App, Competition OS e Management OS.
- 2026-05-14: Rodada 2 de QA refinou `/gestao/:placeId/agenda` e Painel sem mudar responsabilidade primaria: calendario mobile usa seletor para nao ocultar quadras, busca de nova reserva mostra feedback inline, recebiveis pendentes da fila navegam para Financeiro > Recebiveis e Cantina nao aparece como KPI operacional quando o plano nao habilita o modulo.
- 2026-05-14: Academia v2 foi definida em `ACADEMY_V2_UX_PLAN.md`; a tela `/gestao/:placeId/academia` deve separar rotina diaria, grade, alunos, pendencias, professores e configuracao, preservando funcoes sem manter blocos legados duplicados.
- 2026-05-14: `OPERATIONAL_MODULE_REDESIGN_PLAYBOOK.md` foi criado como processo padrao para mapear, planejar e corrigir cada modulo antes de implementar refactors profundos.
- 2026-05-14: primeiro corte de Academia v2 aplicado: `Grade` e `Configuracao` substituem labels antigos, bloco legado `Academia e aulas` nao renderiza no workspace de Gestao, recursos entram em `Configuracao` e encaixe fica recolhido em `Pendencias`.
- 2026-05-14: `Configuracao` da Academia v2 ganhou data/dia explicitos, visao por quadra/professor, criacao de horario aberto, bloqueio/reabertura e conflito visivel por recurso.
- 2026-05-14: QA da Academia v2 removeu o cabeçalho legado remanescente dentro da Gestao e passou a tratar conversao parcial de horario aberto em turma com feedback explicito.
- 2026-05-14: `Grade` da Academia passou a ser lista operacional com busca, filtros, contador, `ClassDrawer`, edicao real da turma, mensalidade, matricula manual e acoes financeiras no contexto da turma.
- 2026-05-14: `Alunos` da Academia passou a ser lista operacional com busca/filtros por status, turma, pagamento e presenca/reposicao, sem limite silencioso, e `StudentDrawer` para matricula, financeiro, chamada, ausencia avisada, evolucao, reposicoes e historico.
- 2026-05-14: `Pendencias` da Academia passou a ser fila unica com filtros e rows acionaveis; `Buscar encaixe` saiu do corpo da tela e passou a abrir `FitDrawer`.
- 2026-05-14: `Hoje` da Academia passou a ser lista operacional de aulas do dia com `LessonDrawer` para chamada rapida, presenca, falta, ausencia avisada e observacao curta.
- 2026-05-14: `Professores` da Academia passou a ser lista operacional com busca/filtros e `CoachDrawer` para dados, comissao, login, turmas e agenda.
- 2026-05-14: `Criar turma` a partir de horario aberto na Academia passou a usar RPC transacional `app_create_academy_class_from_slot(...)`, eliminando o caso de turma criada com slot ainda `open`.
- 2026-05-14: `Pendencias > Reposicao aberta > Agendar reposicao` passou a abrir `FitDrawer` com credito selecionado e usar RPC transacional `app_admin_schedule_academy_makeup_credit(...)`.
- 2026-05-14: `Configuracao` da Academia passou a comunicar `place_academy_slots` como escala semanal recorrente, com data apenas de referencia, janela semanal, janela convertida e bloqueio semanal.
- 2026-05-14: `Professores > CoachDrawer` ganhou perfil operacional persistido com especialidades, niveis atendidos, bio publica, observacoes internas e controle de perfil publico, mantendo cadastro rapido simples.
- 2026-05-14: nova responsabilidade planejada para `Academia > Alunos`: aluno deve ser tratado como usuario/contrato semanal da academia, com plano, mensalidade e horarios vinculados. `place_academy_enrollments` continua como vinculo por turma para chamada/presenca, mas nao deve ser a unica entidade percebida pelo operador.
- 2026-05-14: ausencia avisada na Academia precisa respeitar antecedencia minima configurada pela academia e gerar credito de reposicao automaticamente quando a regra permitir.
- 2026-05-14: migration `0079_academy_student_contracts_v1.sql` criou a base de contrato semanal do aluno; `Academia > Alunos` deve passar a listar/agrupar por contrato/usuario e nao por matricula isolada.
- 2026-05-14: `Grade > Turma > Novo aluno` passou a criar contrato semanal por usuario/email com horarios selecionados; `Academia > Alunos` agrega alunos por contrato quando disponivel e mostra horarios vinculados no drawer.
- 2026-05-14: mensalidade da Academia passou a priorizar `academy_student_contract` em alunos contratados; `academy_enrollment` permanece como fallback apenas para matriculas antigas sem contrato.
- 2026-05-14: `Academia > Configuracao` ganhou regra de antecedencia de reposicao; ausencia avisada no prazo gera credito automatico com origem rastreavel, e `Pendencias`/`StudentDrawer` diferenciam a origem do credito.
- 2026-05-13: criada tela `/gestao` como central operacional de academia/clube, reduzindo a mistura entre descoberta publica de locais e trabalho diario de equipe.
- 2026-05-13: responsabilidade principal de operar local migrou para `/gestao/:placeId/:module`, mantendo `/locais/:placeId/admin` apenas como rota legada de compatibilidade.
- 2026-05-13: `ManagementShell` passou a envolver `/gestao` e admin de local, dando cabecalho operacional proprio para contexto, acoes e indicadores sem depender do layout de `Locais`.
- 2026-05-13: `PlaceAdminShell` iniciou a separacao da responsabilidade de cockpit/contexto do local, deixando `PlacesPage` menos responsavel pela experiencia administrativa.
- 2026-05-13: `/gestao` reduziu o papel de dashboard e passou a tratar locais como rows operacionais com pulso, tarefas e acoes, mantendo cards apenas para fila/estado quando fizer sentido.
- 2026-05-13: `/gestao` ganhou comportamento mobile-first mais claro, com header compacto, stats em trilho horizontal e atalhos de modulo em scroll lateral para evitar empilhamento.
- 2026-05-13: `/gestao/:placeId/:module` ganhou shell de workspace mais compacto, com modulo ativo antes de setup/configuracao e fila operacional antes de metricas.
- 2026-05-13: navegacao global desktop passou a separar Jogar, Operar e Conta, reforcando que `Gestao` e contexto operacional e `Locais` e camada publica/descoberta.
- 2026-05-13: `/inicio` foi reajustada para Player App por proxima acao, com painel do dia, rows de pendencia/agenda/clube e atalhos de jogador antes de secoes secundarias.
- 2026-05-13: hierarquia de CTAs foi aplicada em Home, Gestao, Competition queue, recebiveis e criacao de reserva, separando primary, secondary e quiet.
- 2026-05-13: tipografia das telas prioritarias passou a usar tokens fixos, com titulos operacionais mais compactos e sem `font-size` por viewport nas areas auditadas.
- 2026-05-13: pagina publica do local passou a priorizar conversao com oferta no hero, reserva como CTA principal, divulgacao no fim e CTA sticky mobile.
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
- 2026-05-13: criacao de reserva no admin do local virou composer progressivo, mantendo quadra/inicio/fim/busca/reserva no fluxo principal e levando observacao, repeticao, bloqueio e espera para opcoes avancadas.
- 2026-05-13: CRM passou a priorizar leitura/acao sobre contatos antes de captura, com novo contato em formulario progressivo.
- 2026-05-13: Cantina passou a separar venda rapida como rotina principal e cadastro de produto como formulario progressivo auxiliar ao catalogo.
- 2026-05-13: turmas da Academia passaram de cards para rows operacionais, preservando ocupacao, horario, professor/quadra, pendencias e mensalidade com menor verticalidade.
- 2026-05-13: estados de demo/QA foram formalizados em `DEMO_STATE_QA_CHECKLIST.md`, fechando o bloqueio de calibragem visual por ausencia de massa variada.
- 2026-05-13: modelo de perfis e planos foi formalizado em `PROFILE_PLAN_ACCESS_MODEL.md`, definindo Player App, Competition Management, Professor Autonomo e Academia/Clube.
- 2026-05-13: discoverability e onboarding operacional foram formalizados em `TASK_DISCOVERY_ONBOARDING.md`, priorizando quick actions semanticas como cadastrar quadra, cadastrar professor, criar turma e criar torneio.
- 2026-05-13: navegacao global iniciou visibilidade por acesso: `Gestao` depende de local acessivel, `Organizar` depende de competicao organizada e `Locais` fica em descoberta/player.
- 2026-05-13: setup de Gestao ganhou quick actions semanticas por local, com `Cadastrar quadra`, `Cadastrar professor`, `Criar turma`, `Definir regras de reserva` e `Configurar plano` apontando para subvisoes corretas.
- 2026-05-13: `/eventos` passou a separar explicitamente `Jogando`, `Organizando` e `Descobrir`; organizadores veem a fila operacional primeiro, enquanto jogador comum deixa de receber criacao de torneio/liga como CTA principal.
- 2026-05-13: `/gestao` ganhou checklist de implantacao por local para academia/clube, aparecendo apenas quando ha base incompleta e levando cada etapa para o modulo/subvisao correto.
- 2026-05-13: `/eventos` ganhou roteiro secundario de primeiro evento para organizador novo, mantendo criacao em contexto de organizacao sem competir com as tarefas do jogador.
- 2026-05-13: `/gestao` ganhou entrada leve de professor para papel `coach`, com foco em aulas hoje, turmas e alunos, e a fila agregada passou a respeitar modulos acessiveis por papel.
- 2026-05-13: `Minhas partidas` dentro do torneio passou a responder primeiro "qual partida exige acao agora?", separando status/contexto/acao primaria em row e movendo envio de resultado para disclosure progressivo.
- 2026-05-13: partidas de grupos/mata-mata dentro do torneio passaram a priorizar leitura da partida na row principal, deixando placar, WO e limpeza como tarefa progressiva de operador.
- 2026-05-13: partidas da liga passaram a priorizar leitura por rodada/jogadores/status/proxima acao antes da sala, mantendo disponibilidade, resultado, confirmacao e chat dentro do detalhe acionavel.
- 2026-05-13: sala de partida da liga passou a separar tarefas principais de suporte: estado, disponibilidade e resultado ficam em primeiro nivel; participantes e chat ficam progressivos.
- 2026-05-13: lista de alunos da Academia passou a priorizar a acao diaria por aluno, usando row com status/pagamento/presenca e deixando acoes secundarias em disclosure.
- 2026-05-13: Financeiro e Clientes/CRM passaram a tratar cobranca como tarefa semantica (`Enviar lembrete`, `Cobrar socios`, `Cobrar alunos`) derivada de pendencia real, nao como dashboard tecnico permanente.
- 2026-05-13: `/gestao` passou a adaptar CTA e atalhos internos por papel do local: professor abre aulas/alunos, recepcao abre agenda/aulas e gestor mantem operacao completa.
- 2026-05-13: `/eventos` deixou de mostrar roteiro grande de organizador para jogador comum; organizacao permanece como opcao contextual em `Descobrir`.
- 2026-05-13: `Academia > Professores` passou a conter tambem o cadastro de professor, corrigindo o fluxo em que `Cadastrar professor` caia em uma listagem sem acao executavel.
- 2026-05-13: `Academia > Turmas` passou a conter tambem o wizard de criacao de turma, evitando mandar `Criar turma` para uma area generica de recursos.
- 2026-05-13: `Ajustes > Estrutura` passou a conter edicao direta dos dados publicos do local, para que `Publicar pagina` nao termine em uma tela apenas informativa.
- 2026-05-13: `/locais` passou a tratar filtros como parte da intencao: reservar quadra exige cidade/data/hora para disponibilidade real, entrar em aula filtra por perfil/dia/periodo/vaga e encontrar jogadores filtra chamadas sem misturar quadras.
- 2026-05-14: `/locais` passou a iniciar em estado neutro de escolha de intencao; a pagina nao deve abrir mostrando ficha de academia, formulario de reserva ou turmas antes do usuario escolher o fluxo.
- 2026-05-14: em `/locais`, `Reservar quadra` e `Entrar em aula` tambem nao devem listar academias genericas antes da busca. Sem filtro executado, mostram orientacao; com filtro executado, mostram cards de quadra/turma acionaveis.
- 2026-05-13: `/locais/:placeId` passou a resolver a decisao dentro do local com agenda visual de quadras por horario e filtro de turmas compativeis antes do formulario.
- 2026-05-13: resultado de `Reservar quadra` em `/locais` passou a ser lista direta de quadras livres no horario pesquisado; ficha completa, planos e aulas ficam fora desse fluxo.
- 2026-05-13: resultado de `Entrar em aula` em `/locais` passou a ser lista direta de turmas com vaga; nome da academia, UF, dia, periodo e nivel levam a uma turma acionavel, nao a uma ficha generica.
- 2026-05-13: `Agenda > Calendario` passou a ser mapa operacional unico de ocupacao, combinando reservas, bloqueios, turmas, aulas avulsas/reposicoes e faltas avisadas com filtros por tipo, quadra, professor, turma e aluno.
- 2026-05-13: `Agenda` deixou de renderizar subvisoes duplicadas dentro e fora da `Central de agenda`; a central agora hospeda a visao ativa e o detalhe historico fica fora apenas quando nao ha workspace ativo.
- 2026-05-13: `Agenda > Nova reserva` e a reserva da pagina publica passaram a usar data, horario e duracao em seletores guiados, evitando horarios quebrados e explicitando a disponibilidade antes da acao de reservar.
- 2026-05-13: `Agenda > Quadras` passou a separar cadastro/preco de quadra e regras de horario com dias da semana visuais, reduzindo entrada numerica crua e overflow de layout.
- 2026-05-13: `/locais` deixou de renderizar cockpit administrativo inline para usuarios staff; mesmo admin ve descoberta/player, com `Abrir gestao` como acao secundaria.
- 2026-05-13: `/inicio` separou fila de jogador e fila profissional; notificacoes e primeira viewport deixam de misturar aprovar socio/lista de espera/admin com proxima partida/reserva/aula.
- 2026-05-13: pendencias profissionais da Home passaram a navegar para `/gestao/:placeId/:module?visao=...`, reforcando que operacao pertence ao Management OS.
- 2026-05-14: `/gestao` acessado diretamente por Player puro deve explicar ausencia de permissao e retornar para Inicio/Locais; nao deve sugerir que o jogador precisa configurar uma operacao.
- 2026-05-14: `/gestao/:placeId/:module` nao deve reutilizar visual de descoberta publica. O topo deve ser do Management OS e a pagina publica deve aparecer apenas como acao secundaria.
- 2026-05-14: navegacao de modulos da gestao local nao deve esconder opcoes em `Mais` quando ha espaco. A barra deve exibir todos os modulos liberados por plano/permissao e rolar horizontalmente quando necessario.
- 2026-05-14: plano `academy` deve manter `Agenda` operacional. Pode restringir reserva publica/financeiro/CRM por plano, mas agenda de aulas, quadras, horarios e ocupacao nao pode desaparecer.
- 2026-05-13: `/eventos` refinou `Organizando agora` para rows operacionais com proximo passo e CTA por torneio/liga, deixando os atalhos de lista como suporte.
- 2026-05-13: Competition OS no hub passou a escolher destino por status do evento, evitando que todo item organizado abra genericamente sem dizer a tarefa.
- 2026-05-14: `/eventos/ligas/:leagueId` passou a iniciar a experiencia do organizador com foco operacional antes das tabs, deixando proxima acao, escopo ativo e pendencias visiveis sem depender da aba `Visao`.
- 2026-05-14: a aba `Visao` da liga deixou de repetir a fila/KPIs principais e ficou como suporte de publicacao/configuracao, reduzindo duplicidade visual.
- 2026-05-14: `CompetitionOperationalQueue` passou a expor label de acao por item, reforcando que fila operacional nao e KPI clicavel generico.
- 2026-05-14: `/inicio` passou a separar avisos de jogador e avisos operacionais, evitando que comunicados de competicoes organizadas contem como pendencia principal do Player App.
- 2026-05-14: `/inicio` reduziu listas secundarias depois da central do jogador, mantendo recorte curto de prioridades/atualizacoes e acesso completo pelo painel de notificacoes.
- 2026-05-14: `/inicio` passou a tratar reserva confirmada e espera passiva como agenda/feed, nao como pendencia; somente reserva pendente ou convite liberado entram em prioridade do jogador.
- 2026-05-14: `/locais` foi revalidada por perfil. Busca completa de quadra deve retornar cards de quadra livre acionaveis; busca de aula deve retornar turmas com vaga e usar fallback local quando a RPC otimizada vier vazia.
- 2026-05-14: `/gestao` digitado por Player puro nao deve alterar a navegacao para `Management OS`; o contexto de gestao depende de permissao real, nao apenas da URL.
