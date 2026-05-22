# Mapa de Funcoes Existentes no App

Status: inventario inicial baseado no codigo atual
Data: 2026-05-22
Fonte: rotas, componentes, libs e tipos em `web/src`

## Escopo

Este documento lista funcoes reais, nao apenas paginas. Ele nao assume que a organizacao atual esta correta. A coluna "Destino recomendado" aponta o dominio SaaS ideal.

Legenda Web/Mobile:

- Web: deve existir no SaaS web completo.
- Mobile: deve existir em mobile trabalho ou app jogador.
- Ambos: precisa existir nos dois, com profundidade diferente.

## Autenticacao, perfil e modo

| Funcao | Onde aparece hoje | Usuario provavel | Tipo | Web/Mobile | Problema atual | Destino recomendado |
|---|---|---|---|---|---|---|
| Login e callback | `/auth`, `/auth/callback` | Todos | Operacional | Ambos | Funciona como entrada tecnica | Entrada unica com contexto de destino |
| Completar cadastro | `/completar-cadastro` | Todos | Administrativo | Ambos | Deve orientar perfil e papel | Onboarding com escolha jogador/trabalho |
| Perfil pessoal | `/perfil` | Jogador, staff | Administrativo | Ambos | Mistura dados pessoais e acesso ao trabalho | Perfil pessoal separado de conta profissional |
| Alternar Jogador/Trabalho | Header/topbar/bottom nav | Multi-papel | Operacional | Ambos | Ainda pode vazar contexto entre areas | Seletor global consistente e persistente |
| Preferencias/notificacoes | Perfil e libs | Todos | Configuracao | Ambos | Ainda pouco centralizado | Conta pessoal > Preferencias |

## Player app

| Funcao | Onde aparece hoje | Usuario provavel | Tipo | Web/Mobile | Problema atual | Destino recomendado |
|---|---|---|---|---|---|---|
| Home do jogador | `/inicio` | Jogador/aluno | Operacional | Ambos | Boa base visual, precisa manter simplicidade | Player Home |
| Descobrir locais | `/locais` | Jogador | Operacional | Ambos | Tambem usado como "Jogar" | Jogar > Locais |
| Detalhe de local publico | `/locais/:placeId` | Jogador | Operacional | Ambos | Pode misturar publico e admin se nao houver fronteira | Local publico separado do admin |
| Encontrar jogo aberto | `open matches` em places | Jogador | Operacional | Ambos | Precisa fluxo claro de detalhe/sucesso | Jogar > Jogos abertos |
| Criar jogo aberto | `createOpenMatch` | Jogador | Operacional | Ambos | Deve ser fluxo guiado | Jogar > Criar jogo |
| Seguir local | `followPlace` | Jogador | Relacionamento | Ambos | Correto, mas deve aparecer como contexto | Local publico |
| Ranking | `/ranking` | Jogador competitivo | Estrategico | Ambos | Correto como player | Competir/Perfil |

## Agenda pessoal

| Funcao | Onde aparece hoje | Usuario provavel | Tipo | Web/Mobile | Problema atual | Destino recomendado |
|---|---|---|---|---|---|---|
| Agenda pessoal unificada | `/agenda` | Jogador/aluno/socio | Operacional | Ambos | Menu ainda concorre com aulas/pagamentos | Player > Minha Rotina ou Agenda pessoal |
| Minhas reservas | `/minhas-reservas` alias | Jogador/socio | Operacional | Ambos | Deve ser filtro/entrada da agenda | Agenda pessoal > Reservas |
| Minhas partidas | `/minhas-partidas` alias | Competitivo | Operacional | Ambos | Deve ser filtro/entrada da agenda | Agenda pessoal > Partidas |
| Minhas aulas | `/minhas-aulas` alias | Aluno | Operacional | Ambos | Nao deve competir como menu principal se agenda engloba | Agenda pessoal > Aulas |
| Meus pagamentos | `/meus-pagamentos` alias | Todos | Financeiro pessoal | Ambos | Nao misturar com financeiro do local | Agenda/Conta > Pagamentos pessoais |
| Cancelar reserva propria | `cancelCourtBookingSeries`/status | Jogador | Operacional | Mobile | Precisa regra clara e sucesso com proximo passo | Detalhe da reserva |
| Pagar stub pessoal | `markStubPaymentPaid` | Jogador/aluno | Financeiro | Ambos | Deve virar modal padrao ate gateway real | Modal de pagamento padrao |

## Agenda, quadras e reservas do local

| Funcao | Onde aparece hoje | Usuario provavel | Tipo | Web/Mobile | Problema atual | Destino recomendado |
|---|---|---|---|---|---|---|
| Ver calendario de reservas | `bookings/calendar`, `/gestao/:placeId/bookings` | Recepcao/gestor | Operacional | Ambos | Atualmente dentro de reservas e com layout de grade fraca | Agenda e Recursos > Calendario |
| Ver reservas por quadra/dia | `listPlaceBookings` | Recepcao | Operacional | Ambos | Deve ser calendario central clicavel | Agenda > Calendario |
| Criar reserva admin | `createCourtBooking` | Recepcao/gestor | Operacional | Ambos | Deve partir de slot clicavel | Calendario > Slot |
| Editar reserva admin | `updateCourtBookingDetails` | Recepcao/gestor | Operacional | Web | UI atual quebra em slots estreitos | Drawer/modal responsivo |
| Cancelar reserva admin | `updateCourtBookingStatus` | Recepcao/gestor | Operacional | Ambos | Precisa WhatsApp e registro | Detalhe da reserva |
| Criar pedido de remarcacao | `createCourtBookingChangeRequest` | Recepcao/gestor | Comunicacao | Ambos | Link/token existe, fluxo precisa amadurecer | Detalhe reserva > Remarcar |
| Confirmar remarcacao por link | `/reservas/alteracao/:token` | Jogador | Operacional | Mobile | Correto como self-service | Link publico preservado |
| Lista de espera | `listPlaceBookingWaitlist`, `joinCourtBookingWaitlist`, `promoteCourtBookingWaitlist` | Recepcao/jogador | Operacional | Ambos | Nao deve ser menu paralelo permanente | Contexto do slot/agenda |
| Criar bloqueio de quadra | `createCourtBlock` | Gestor/recepcao | Administrativo | Web | Deve ser acao de calendario ou configuracao | Agenda > Bloqueio |
| Regras de reserva | `list/create/updatePlaceBookingRule` | Gestor | Configuracao | Web | Nao rotina diaria | Configuracoes > Regras de reserva |
| Criar quadra | `createPlaceCourt` | Gestor | Configuracao | Web | Nao rotina diaria | Configuracoes > Recursos |
| Precificacao de quadra | `updatePlaceCourtPricing` | Gestor/financeiro | Financeiro/config | Web | Deve ficar em regras/precos | Configuracoes/Financeiro |
| Buscar disponibilidade publica | `searchAvailableCourts*` | Jogador | Operacional | Ambos | Boa base | Player > Reservar |

## Academia, aulas, turmas e alunos

| Funcao | Onde aparece hoje | Usuario provavel | Tipo | Web/Mobile | Problema atual | Destino recomendado |
|---|---|---|---|---|---|---|
| Listar aulas/turmas | `listPlaceAcademyClasses` | Gestor/professor | Operacional | Ambos | Web parece adaptado de tabs | Academia > Turmas/Aulas |
| Criar aula/turma | `createPlaceAcademyClass` | Gestor | Administrativo | Web | Deve ser fluxo guiado | Academia > Turmas > Criar |
| Criar horario/slot de aula | `createPlaceAcademySlot` | Gestor | Configuracao/operacao | Web | Deve estar em agenda ou turma | Agenda/Academia |
| Criar aula a partir de slot | `createPlaceAcademyClassFromSlot` | Gestor | Operacional | Web | Bom reaproveitamento | Agenda > Slot de aula |
| Listar professores | `listPlaceCoaches` | Gestor | Administrativo | Web | "Professores" deve ficar em Equipe/Pessoas, nao tab de aulas comum | Pessoas/Equipe > Professores |
| Criar/vincular professor | `createPlaceCoach`, `linkPlaceCoachByEmail` | Gestor | Administrativo | Web | Deve ser fluxo de equipe | Equipe > Professores |
| Comissao de professor | `updatePlaceCoachCommission` | Financeiro/gestor | Financeiro | Web | Futuro modulo financeiro | Financeiro > Comissoes |
| Matricular aluno | `createAcademyEnrollment*` | Gestor/recepcao | Operacional | Web | Precisa aluno 360 e pagamento padrao | Alunos > Matriculas |
| Contrato de aluno | `createAcademyStudentContract`, `listPlaceAcademyStudentContracts` | Gestor/financeiro | Administrativo/financeiro | Web | Falta experiencia de contrato | Aluno 360 > Contratos |
| Editar matricula | `updateAcademyEnrollment*` | Gestor | Administrativo | Web | Modal atual quebra em telas | Drawer responsivo |
| Configuracao de academia | `get/updatePlaceAcademySettings` | Gestor | Configuracao | Web | Deve incluir chamada obrigatoria opcional, padrao desligado | Configuracoes > Academia |
| Chamada/presenca | `markAcademyAttendance`, `listPlaceAcademyAttendance` | Professor/gestor | Operacional opcional | Mobile/Web | Usuario questionou necessidade; deve ser configuravel | Academia config: exigir chamada? padrao nao |
| Falta planejada | `reportAcademyAbsence` | Aluno/recepcao | Operacional | Mobile | Mais relevante que chamada obrigatoria | Agenda/Aulas > Avisar ausencia |
| Reposicao | `requestAcademyLessonFit`, `scheduleAcademyMakeupCredit`, `updateAcademyLessonRequestStatus` | Aluno/professor/gestor | Operacional | Ambos | Precisa fila clara | Academia > Reposicoes |
| Evolucao do aluno | `create/listProgressNote` | Professor | Estrategico/relacionamento | Ambos | Boa funcao, precisa aluno 360 | Aluno 360 > Evolucao |

## Pessoas, clientes, CRM e socios

| Funcao | Onde aparece hoje | Usuario provavel | Tipo | Web/Mobile | Problema atual | Destino recomendado |
|---|---|---|---|---|---|---|
| Listar contatos CRM | `listPlaceCrmContacts` | Recepcao/gestor | Relacionamento | Web | Mistura lead, cliente e socio | Pessoas > Leads / Clientes ativos / Socios |
| Criar contato | `createPlaceCrmContact` | Recepcao | Operacional | Ambos | Deve estar no atendimento e aluno 360 | Pessoas > Criar pessoa |
| Interacao de contato | `create/listPlaceCrmInteractions` | Recepcao/gestor | Comunicacao/CRM | Ambos | Precisa historico 360 | Pessoa 360 > Historico |
| Alterar dono/status/follow-up | `updatePlaceCrmContact*` | Gestor/recepcao | CRM | Web | Deve ser pipeline simples | Pessoas > CRM |
| Planos de socio | `list/create/updatePlaceMembershipPlan` | Gestor/financeiro | Financeiro/config | Web | Deve ficar em Planos | Financeiro/Config > Planos |
| Solicitacao de associacao | `requestPlaceMembership`, `updatePlaceMembershipStatus` | Jogador/recepcao | Operacional/financeiro | Ambos | Precisa fluxo de pagamento | Socios/Planos |
| Minhas associacoes | `listMyPlaceMemberships` | Jogador | Financeiro pessoal | Ambos | Correto no player | Agenda/Conta pessoal |

## Financeiro, pagamentos, creditos e despesas

| Funcao | Onde aparece hoje | Usuario provavel | Tipo | Web/Mobile | Problema atual | Destino recomendado |
|---|---|---|---|---|---|---|
| Listar pagamentos pessoais | `listMyPayments` | Jogador/aluno | Financeiro pessoal | Ambos | Correto se separado do local | Conta/Agenda pessoal |
| Listar pagamentos por alvo | `listPaymentsForTargets` | Financeiro/gestor | Financeiro | Web | Precisa consolidacao por local | Financeiro > Receber |
| Marcar pago stub | `markStubPaymentPaid*` | Financeiro/jogador | Financeiro | Ambos | Deve virar modal padrao | Pagamento padrao |
| Criar lembrete de pagamento | `createPaymentReminderForParticipant` | Organizador/financeiro | Comunicacao/financeiro | Web | Integrar comunicacao | Financeiro/Competicoes |
| Pacotes de credito | `list/create/updatePlaceCreditPackage` | Gestor/financeiro | Financeiro/config | Web | Deve ficar em Planos/Pacotes | Financeiro > Planos |
| Compra/consumo de credito | `record/consumePlaceCreditPurchase` | Recepcao/financeiro | Financeiro | Ambos | Precisa historico do cliente | Cliente 360 > Creditos |
| Despesas | `list/create/cancelPlaceExpense` | Financeiro | Financeiro | Web | Deve ser dominio financeiro | Financeiro > Despesas |
| Relatorios financeiros | Parcial | Dono/financeiro | Estrategico | Web | Ainda insuficiente | Financeiro > Relatorios |

## Loja/POS

| Funcao | Onde aparece hoje | Usuario provavel | Tipo | Web/Mobile | Problema atual | Destino recomendado |
|---|---|---|---|---|---|---|
| Produtos POS | `list/createPlacePosProduct` | Caixa/gestor | Operacional/config | Ambos/Web | Produto/config nao deve competir com venda | Loja > Produtos |
| Vendas POS | `list/recordPlacePosSale` | Caixa | Operacional | Ambos | Venda rapida deve ser primeira camada mobile | Loja > Vender |
| Cancelar venda | `cancelPlacePosSale` | Caixa/gestor | Operacional | Web | Precisa historico e permissao futura | Loja > Venda detalhe |
| Estoque | Pos products | Caixa/gestor | Operacional | Ambos | Deve destacar estoque baixo | Loja > Estoque |

## Equipe, colaboradores e permissoes futuras

| Funcao | Onde aparece hoje | Usuario provavel | Tipo | Web/Mobile | Problema atual | Destino recomendado |
|---|---|---|---|---|---|---|
| Listar staff do local | `listPlaceStaff` | Dono/gestor | Administrativo | Web | Correto em equipe | Administracao > Equipe |
| Buscar candidato | `searchPlaceStaffCandidates` | Gestor | Administrativo | Web | Fluxo de convite | Equipe > Convidar |
| Convites staff | `listMyPlaceStaffInvites`, accept/decline | Staff | Operacional | Ambos | Precisa aparecer na home de trabalho | Trabalho Hoje > Convites |
| Adicionar/remover/cancelar staff | `add/remove/cancelPlaceStaffInvite` | Dono/gestor | Administrativo | Web | Raro, nao rotina | Equipe |
| Roles/permissoes | `workspace-access`, roles | Dono/gestor | Configuracao | Web | Ainda basico | Administracao > Permissoes futuras |

## Torneios

| Funcao | Onde aparece hoje | Usuario provavel | Tipo | Web/Mobile | Problema atual | Destino recomendado |
|---|---|---|---|---|---|---|
| Criar torneio | `createTournament` | Organizador | Administrativo/operacional | Web | Deve ser wizard por fase | Competicoes > Torneios |
| Descobrir torneios | `/eventos`, `/eventos/torneios` | Jogador | Operacional | Ambos | Nao misturar com organizacao | Player > Competir |
| Inscricao jogador | `/inscricao`, `/join`, `/t`, request/join | Jogador | Operacional | Mobile/Web | Rotas publicas devem preservar | Player/publico |
| Aprovar inscricoes | `updateTournamentRegistrationStatus` | Organizador/checkin | Operacional | Web/Mobile simples | Precisa cockpit por fase | Torneio > Inscricoes |
| Pagamento inscricao | `markTournament...paid` e reminders | Financeiro/organizador | Financeiro | Web | Integrar modal padrao | Torneio > Pagamentos |
| Gerar/organizar jogos | Dados TournamentDetails | Organizador | Operacional | Web | Deve ser fase | Torneio > Jogos |
| Lancar resultado admin | `submit/apply result` | Scorekeeper/organizador | Operacional | Ambos | Mobile precisa ser rapido | Torneio > Partida |
| Enviar resultado jogador | `submitTournamentMatchResult` | Jogador | Operacional | Mobile | Correto, precisa contexto | Player > Partida |
| Chat/comunicacao | `send/post/pin/delete` | Todos/organizacao | Comunicacao | Ambos | Nao pode competir com operacao | Torneio > Comunicacao |
| Staff do torneio | `list/add/removeTournamentStaff` | Owner | Administrativo | Web | Admin, nao primeira dobra | Torneio > Equipe |
| Solicitacao de quadras | `sync/list/reviewTournamentCourtUsage` | Organizador/gestor local | Operacional | Web | Precisa integracao com agenda | Competicoes + Agenda |
| Excluir torneio | `deleteTournament` | Owner | Acao perigosa | Web | Deve ficar em avancado | Torneio > Configuracao avancada |

## Ligas

| Funcao | Onde aparece hoje | Usuario provavel | Tipo | Web/Mobile | Problema atual | Destino recomendado |
|---|---|---|---|---|---|---|
| Criar liga | `createLeague` | Gestor/organizador | Administrativo | Web | Wizard/configuracao | Competicoes > Ligas |
| Ver liga participante | `/eventos/ligas/:leagueId` | Jogador | Operacional | Ambos | Deve priorizar rodada atual | Player > Competir |
| Configurar classes | `createLeagueClass` | Owner | Configuracao | Web | Owner-only | Liga > Configuracao |
| Link de entrada | `createLeagueJoinLink` | Owner | Comunicacao | Web | Integrar publicacao | Liga > Inscricoes |
| Aprovar participantes | `setLeagueRegistrationStatus` | Owner | Operacional | Web | Fase inscricoes | Liga > Participantes |
| Gerar rodada | `generateNextLeagueRound` | Owner | Operacional | Web | Fase entre rodadas | Liga > Rodadas |
| Enviar resultado | `submitLeagueMatchResult` | Jogador | Operacional | Mobile | Correto | Partida da liga |
| Confirmar/resolver resultado | `confirm/adminResolveLeagueMatchResult` | Jogador/owner | Operacional | Ambos/Web | Precisa fila pendente | Liga > Resultados |
| Disponibilidade | `save/loadMatchAvailability` | Jogador | Operacional | Mobile | Bom para liga | Partida/Rodada |
| Chat da partida/liga | `sendMatchMessage`, league chat | Jogador/owner | Comunicacao | Mobile | Contextual | Partida/Liga |
| Snapshot ranking/movimentos | `createRankingSnapshot`, `applySeasonMovements` | Owner | Estrategico | Web | Nao rotina diaria | Liga > Ranking/Encerramento |

## Relatorios e indicadores

| Funcao | Onde aparece hoje | Usuario provavel | Tipo | Web/Mobile | Problema atual | Destino recomendado |
|---|---|---|---|---|---|---|
| Indicadores de home/trabalho | Parcial em dashboards | Gestor | Estrategico | Web | Ainda mais numerico que decisorio | Inicio > Saude da operacao |
| Ocupacao de quadras | Dados existem via reservas | Dono/gestor | Relatorio | Web | Falta pagina propria | Relatorios > Ocupacao |
| Receita por area | Dados parciais | Dono/financeiro | Relatorio | Web | Precisa consolidar | Relatorios/Financeiro |
| Alunos/turmas/professores | Dados existem | Gestor | Relatorio | Web | Falta visao executiva | Relatorios > Academia |
| Torneios/ligas | Dados existem | Organizador | Relatorio | Web | Falta pos-evento | Relatorios > Competicoes |

