# Work SaaS V5 Function Inventory Matrix - 2026-05-22

Status: inventario funcional orientado a destino, nao a menu atual.

Regra: a coluna "local atual" e apenas evidencia. A coluna "destino V5" e a orientacao de produto.

## 1. Legenda

Frequencia:

- D: diaria
- S: semanal
- E: eventual
- R: rara/configuracao
- A: analitica/relatorio

Destino:

- Web: SaaS web Trabalho
- Mobile: Mobile Trabalho
- Both: web + mobile operacional
- Player: Player App
- Config: Administracao/Configuracao
- Report: Relatorios
- Context: acao contextual em detalhe/drawer

## 2. Organizacao, Unidade E Shell

| Funcao | Local atual | Persona | Frequencia | Problema atual | Destino V5 |
| --- | --- | --- | --- | --- | --- |
| Alternar Jogador/Trabalho | topbar/AppShell | multi-papel | D | correto, mas precisa ser consistente em todas as superficies | Both, shell global |
| Entrada Trabalho | `/gestao`, `/trabalho` | staff | D | mistura convites, locais, competicoes e setup | Work Today por papel |
| Multiunidade | `/gestao` e PlaceAdminShell | owner/manager | D/S | unidade ativa ainda nao governa toda pagina | Web org/unit switcher; Mobile switcher compacto |
| Criar local | PlacesPage/create wizard | owner | R | mistura descoberta e gestao | Config Organizacao |
| Dados publicos do local | Settings/Public | owner/manager | R/E | deve ser publicacao, nao rotina | Config > Dados publicos |
| Setup checklist | ManagementHub/Settings | owner/manager | R | compete com rotina em algumas telas | Config; alerta se bloquear operacao |
| Convites staff | ManagementHub/Team | staff/owner | E | bom como onboarding, mas nao deve virar feed principal | Both onboarding card |

## 3. Operacao De Tempo E Calendario

| Funcao | Local atual | Persona | Frequencia | Problema atual | Destino V5 |
| --- | --- | --- | --- | --- | --- |
| Calendario de quadras | Bookings calendar | recepcao/manager | D | ficou sob Reservas, mas tambem mostra aulas/bloqueios | Web Operacao > Calendario |
| Calendario do professor | Academy calendar | professor | D | precisa ser dia por hora e aluno/turma/quadra | Mobile Professor Agenda; Web Aulas/Calendario |
| Camadas calendario | BookingCalendarModule | gestor | D/S | filtros ainda misturam contextos | Web Calendar layers: reservas, aulas, bloqueios, competicoes |
| Bloqueio de horario | Booking create/resources | recepcao/manager | E/D | aparece junto de reserva; precisa contexto claro | Context no Calendario |
| Alocacao de quadras para torneio | tournament court requests | manager/organizer | E/evento | aprovado dentro de booking queue | Web Calendar + Competition context; Mobile approval card |

## 4. Reservas

| Funcao | Local atual | Persona | Frequencia | Problema atual | Destino V5 |
| --- | --- | --- | --- | --- | --- |
| Nova reserva | Bookings "new" | recepcao/player | D | era aba; deve ser CTA | CTA no Calendario/Reservas |
| Busca disponibilidade | PlaceBookingCreateModule | recepcao/player | D | bom fluxo, precisa linearidade | Both reservation wizard |
| Criar reserva | RPC `app_create_court_booking` | recepcao/player | D | deve assumir pagamento como garantia futura | Both |
| Reserva recorrente | booking RPC | recepcao/manager | E | precisa estar no wizard avancado | Web; Mobile apenas se simples |
| Lista de espera | waitlist module/RPC | recepcao | D/E | nao deve ser menu solto | Context em Reservas |
| Promover espera | waitlist promote | recepcao | D/E | precisa comunicar claramente horario | Both contextual |
| Editar reserva admin | booking detail | recepcao/manager | D/E | deve ser drawer/sheet, nao inline quebrado | Web drawer; Mobile sheet |
| Cancelar reserva | reservation row | recepcao/player own | D/E | precisa mensagem e status financeiro | Both contextual |
| Reagendamento por link | `/reservas/alteracao/:token` | jogador | E | bom conceito; precisa abrir agenda disponivel | Player secure flow |
| WhatsApp reserva | booking Whatsapp lib | recepcao | D/E | deve ser acao depois de decidir cancelar/trocar | Both contextual |
| Marcar pago reserva | payment stub | recepcao/finance | D | precisa modal unico | Context + Receita |
| Quadra CRUD | booking resources | manager | R | setup misturado | Config > Recursos |
| Preco de quadra | booking resources | manager/finance | R | regra/preco estrutural | Config/Receita Plans |
| Regras de reserva | booking resources | manager | R | setup raro | Config > Regras |

## 5. Academia, Aulas E Alunos

| Funcao | Local atual | Persona | Frequencia | Problema atual | Destino V5 |
| --- | --- | --- | --- | --- | --- |
| Aula do dia | academy today/calendar | professor | D | precisa ser primeiro no mobile professor | Mobile Hoje/Agenda |
| Abrir aula | academy today | professor | D | deve mostrar turma, alunos, quadra, avisos | Both detail |
| Chamada | attendance RPC | professor | opcional D | nao faz sentido como padrao no tenis | Config-gated; default off |
| Aviso de falta antecipada | absence notice | aluno/professor | E | importante para reposicao | Player + Context Aula |
| Reposicao/makeup | requests/fit/makeups | professor/frontdesk | D/E | espalhada | Academy Requests queue |
| Buscar encaixe | fit search | frontdesk | D/E | deve nascer de uma pendencia | Context wizard |
| Turmas CRUD | classes/setup | manager | S/R | precisa pagina densa web | Web Aulas > Turmas |
| Matricula manual | classes/students | frontdesk/manager | D/E | pertence a pessoa/aluno e turma | Context Pessoa/Turma |
| Editar aluno | students modal | manager/coach | D/E | modal quebra; precisa drawer responsivo | Web Person/Student detail |
| Evolucao/progresso | progress notes | coach | S | correta no aluno | Both contextual |
| Pagamento de aula/mensalidade | academy/students/finance | finance/frontdesk | D/S | duplicado; deve centralizar ledger | Context + Receita |
| Professor CRUD | academy coaches/team | manager | R/S | duplicado com equipe | Pessoas/Equipe |
| Vincular login professor | coaches/team | manager | R | staff/admin | Equipe |
| Comissao professor | coaches | manager/finance | S/M | futuro parcial | Receita future Payroll |
| Config aula/regras | academy resources/settings | manager | R | fora da rotina | Config > Regras Aulas |

## 6. Pessoas, CRM, Clientes, Socios

| Funcao | Local atual | Persona | Frequencia | Problema atual | Destino V5 |
| --- | --- | --- | --- | --- | --- |
| Leads | Clients leads/CRM | recepcao/gestor | D | correto, mas deve ser separado de clientes ativos | Pessoas > Leads |
| Clientes ativos | Clients members | recepcao/gestor | D/S | precisa unir aluno/socio/cliente | Pessoas > Clientes |
| Busca pessoa | clients/students | todos staff | D | hoje espalhada por modulo | Busca global/Pessoas |
| Historico contato | CRM drawer | recepcao | D/S | bom padrao de drawer | Pessoa detail timeline |
| WhatsApp contato | CRM row | recepcao | D | contextual correto | Both contextual |
| Follow-up | CRM | recepcao | D/S | deve alimentar fila Hoje | Pessoas/Hoje |
| Converter lead | CRM | recepcao | D/E | correto, precisa proximo passo claro | Context: criar cliente/matricula/plano |
| Socio/plano | MembershipModule | gestor/finance | S/R | mistura People e Receita | Pessoa relation + Receita plans |
| Ativar/cancelar socio | Membership queue | recepcao/manager | D/E | action queue | Both |
| Staff como pessoa | Team | owner/manager | S/R | separado demais de Pessoas | Pessoas > Staff + Admin Equipe |

## 7. Receita, Pagamentos, Planos E Despesas

| Funcao | Local atual | Persona | Frequencia | Problema atual | Destino V5 |
| --- | --- | --- | --- | --- | --- |
| Receber/vencidos | Finance receivables | financeiro | D | destino correto | Receita > Receber |
| Marcar pago | payment stub | financeiro/frontdesk | D | precisa modal unico | Context + Receita |
| Criar lembrete | finance/academy/membership | financeiro | D | espalhado; deve registrar comunicacao | Receita/Comunicacao |
| Pagos | finance paid | financeiro | D/S | correto | Receita > Pagos |
| Despesas | finance expenses | financeiro | S/D | correto | Receita > Despesas |
| Resumo financeiro | overview | gestor/finance | S/A | relatorio/dashboard | Receita Resumo + Report |
| Planos membership | clients/finance | manager | R | setup de oferta | Receita > Planos |
| Pacotes de credito | finance packages | manager/finance | R/E | setup + venda | Receita > Planos/Pacotes |
| Consumir credito | finance packages | frontdesk/finance | D/E | operacional | Context Pessoa/Receita |
| Pagamento pessoal | PersonalAgendaPage | jogador | D/E | nao misturar com local | Player Minha Rotina |

## 8. Loja/POS

| Funcao | Local atual | Persona | Frequencia | Problema atual | Destino V5 |
| --- | --- | --- | --- | --- | --- |
| Venda rapida | canteen sell | caixa | D | correto como primeira camada | Mobile Vender + Web POS |
| Vendas do dia | canteen today | caixa/gestor | D | correto | POS Hoje |
| Cancelar venda | summary | caixa/manager | E | contextual | POS detail |
| Estoque baixo | stock | caixa | D/S | correto | Mobile Estoque + Web Inventory |
| Produtos CRUD | products | manager/cashier auth | R/S | nao deve atrapalhar venda | Web Produtos; Mobile se autorizado |

## 9. Equipe, Permissoes E Admin

| Funcao | Local atual | Persona | Frequencia | Problema atual | Destino V5 |
| --- | --- | --- | --- | --- | --- |
| Staff ativo | Team staff | owner/manager | S | correto em Admin | Administracao > Equipe |
| Convites | Team invites/Hub | owner/invited | E | onboarding para convidado; admin para owner | Both invite accept; Web admin manage |
| Papeis | Team roles | owner | R | configuracao | Admin > Permissoes |
| Remover staff | Team | owner | R/E | acao sensivel | Admin detail with confirmation |
| Recursos | Settings resources | owner | R | centralizar quadras/professores/produtos estruturais | Admin > Recursos |
| Regras | Settings rules | owner | R | centralizar regras de reserva/aula | Admin > Regras |
| Publicacao | Settings publication | manager | E | correto em Admin | Admin > Publicacao |
| Avancado | future/current dangerous actions | owner | R | deve ficar longe da rotina | Admin > Avancado |

## 10. Competicoes

| Funcao | Local atual | Persona | Frequencia | Problema atual | Destino V5 |
| --- | --- | --- | --- | --- | --- |
| Descobrir torneios/ligas | `/eventos` | jogador | E/D | correto para Player | Player Competir |
| Hub organizador | `/eventos?modo=organizing` | organizer | D/evento | ainda preso a rota publica | Trabalho > Competicoes |
| Criar torneio | tournaments page | organizer | E | work-only | Competition OS Web |
| Config torneio | org tab | owner/organizer | R/E | precisa wizard por fase | Torneio Draft |
| Inscricoes torneio | org players | checkin/owner | D/evento | precisa fase inscricoes | Torneio Inscricoes |
| Pagamento inscricao torneio | payment stub | owner/finance | D/evento | modal unico | Context + Receita competencia |
| Gerar jogos | org | owner/organizer | fase | CTA de fase | Torneio Jogos |
| Publicar jogos | org/chat/publication | media/owner | fase | CTA de fase | Torneio Publicacao |
| Lancar resultado | matches | scorekeeper/owner/player own | D/evento | mobile-critical | Mobile scorekeeper + Web |
| Revisar resultados | result submissions | owner/scorekeeper | D/evento | fila | Cockpit |
| Chat/avisos torneio | chat | media/owner/player | D/evento | contextual | Competition Comms |
| Staff torneio | org | owner | E/R | admin | Competition Admin |
| Backup/reset torneio | org advanced | owner | R | perigoso | Advanced only |
| Criar liga | leagues | organizer | E | work-only | Competition OS Web |
| Config liga | LeagueDetails config | owner | R/E | fase config | Liga Config |
| Inscricoes liga | league registrations | owner | D/E | fase participantes | Liga Participantes |
| Gerar rodada | league | owner | semanal | CTA fase | Liga Rodada |
| Resultado liga | league match | player/owner | semanal | mobile-critical | Player + Mobile owner |
| Resolver disputa liga | admin resolve | owner | semanal | fila | Liga cockpit |
| Ranking/classificacao | standings | owner/player | D/S | participante ve; owner valida | Liga standings |
| Comunicacao liga | chat/announcement/WhatsApp | owner/player | D/E | contextual | Competition Comms |

## 11. Player App Preservado

| Funcao | Destino V5 | Observacao |
| --- | --- | --- |
| Inicio jogador | Player Home | proxima acao pessoal |
| Jogar | Player Locais | reservar, encontrar jogo, aulas, locais |
| Competir | Player Competicoes | participar e acompanhar |
| Minha Rotina | Player Agenda | reservas, aulas, partidas, pagamentos pessoais, historico |
| Perfil | Player Perfil | dados pessoais, preferencias, conta |
| Pagamentos pessoais | Player Agenda/Perfil | nunca Receita do local |

## 12. Funcoes Sem Caminho Claro A Resolver Antes De Implementar

1. Master person record: criar entidade unificada agora ou usar indice composto sobre tabelas atuais?
2. Nome final do dominio `Receita` versus `Financeiro` para staff brasileiro.
3. Organizadores independentes sem local: ficam em Organizacao ATP pessoal ou Competition workspace sem unidade?
4. Escopo de produto mobile para manager multiunidade: apenas alertas ou tambem analise curta?
5. Comissoes de professor: preparar menu futuro em Receita ou manter somente campo no professor por enquanto?
6. Relatorios V1: construir shell/contrato agora e popular aos poucos, ou adiar ate dados consolidados?

