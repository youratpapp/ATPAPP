# Work SaaS UX Organization Execution Queue V4 - 2026-05-22

Status: queue executavel final para reorganizacao UX/IA da area Trabalho.  
Base: `WORK_SAAS_UX_ORGANIZATION_MASTER_SPEC_V4_2026_05_22.md`.  
Regra: nao executar codigo fora desta queue sem atualizar a especificacao mestre.

## Status De Sprint

- V4-00: concluido documentalmente.
- V4-01: concluido nesta rodada; taxonomia principal aplicada em labels e grupos de navegacao.
- V4-02: concluido nesta rodada em primeira camada; shell web recebeu linguagem de dominio e contexto mais consistente.
- V4-03: concluido nesta rodada em primeira camada; mobile Trabalho recebeu corte de tiers redundantes no shell.
- V4-04: concluido nesta rodada; desktop por dominio aplicado na navegacao.
- V4-05: concluido nesta rodada; mobile por papel aplicado na navegacao.
- V4-06: concluido nesta rodada em primeira camada; a rota de Trabalho prioriza fila operacional e remove camada publica antes do cockpit do local.
- V4-07: concluido nesta rodada em primeira camada; Calendario virou destino principal de navegacao quando a permissao existe.
- V4-08: concluido nesta rodada em primeira camada; Reservas ficou como operacao direta, com Calendario externo e espera tratada no proprio contexto.
- V4-09: concluido nesta rodada em primeira camada; Aulas ficou mais limpa, Professor usa Agenda/Turmas/Alunos, e chamada fica opcional por configuracao.
- V4-10: concluido nesta rodada em primeira camada; Clientes foi reposicionado como Pessoas/relacionamento, com socios e planos vinculados ao dominio de Receita.
- V4-11: concluido nesta rodada em primeira camada; Financeiro foi tratado como Receita, com receber/pagos/despesas/resumo e sem misturar pagamentos pessoais.
- V4-12: concluido nesta rodada em primeira camada; Cantina foi renomeada para Loja/POS e preservada como fluxo de venda/estoque/produtos.
- V4-13: concluido e auditado; Competition OS foi validado com fluxo real de torneio e liga do inicio ao fim.
- V4-14: concluido nesta rodada em primeira camada; Ajustes/admin ficaram fora da rotina diaria e escondidos da navegacao mobile operacional.
- V4-15: concluido nesta rodada em primeira camada; Player App manteve fronteira com Trabalho e Minha Rotina foi consolidada em Agenda/Rotina pessoal.
- V4-16: concluido nesta rodada; QA visual e fluxos reais executados para Trabalho, torneio, liga e academia.

## 0. Regra De Execucao

Cada item precisa gerar:

- sprint packet preenchido;
- alteracoes de codigo/documento;
- QA por persona afetada;
- screenshots quando houver UI;
- diagnostico de console/network;
- atualizacao de status no MD;
- lista de funcoes preservadas.

Nao aceitar como concluido:

- build verde sem QA de fluxo;
- menu alterado sem destino renderizado correto;
- mobile com nova nav apontando para pagina web pesada;
- rota antiga quebrada;
- permissao relaxada;
- funcao existente sem caminho.

## V4-00 - Source Of Truth Reset

Objetivo:

- tornar a V4 a fonte atual e impedir uso indevido de docs antigos.

Arquivos provaveis:

- `docs/RESTRUCTURE_SOURCE_OF_TRUTH_POLICY.md`
- `docs/WORK_SAAS_UX_ORGANIZATION_MASTER_SPEC_V4_2026_05_22.md`
- `docs/WORK_SAAS_UX_ORGANIZATION_EXECUTION_QUEUE_V4_2026_05_22.md`

Alterar:

- apontar fonte da verdade para V4;
- classificar V3/V2 como historico quando conflitarem;
- registrar que sprints anteriores nao significam aceitacao final.

Nao alterar:

- UI;
- backend;
- rotas.

Aceite:

- proxima IA consegue saber qual documento seguir sem perguntar.

QA:

- leitura dos docs.

## V4-01 - Taxonomia E Contratos De Dominio

Objetivo:

- congelar labels, dominios, entidades, grupos e responsabilidades antes de mexer no menu.

Dominios finais:

- Hoje;
- Calendario;
- Reservas;
- Aulas;
- Pessoas;
- Receita;
- Loja/POS;
- Competicoes;
- Relatorios;
- Administracao.

Arquivos provaveis:

- `src/lib/place-admin-navigation.ts`
- `src/lib/workspace-access.ts`
- `src/components/BottomNav.tsx`
- docs V4.

Alterar:

- criar/centralizar mapa de labels e destinos;
- documentar antigo -> novo;
- garantir que `bookings`, `academy`, `clients`, `finance`, `canteen`, `team`, `settings` continuam roteando.

Nao alterar:

- loaders;
- permissoes;
- regras de negocio.

Aceite:

- cada label tem responsabilidade clara;
- `Clientes` nao e usado mentalmente como guarda-chuva de alunos/socios/staff;
- `Financeiro`/`Receita` nao se mistura com pagamentos pessoais;
- `Calendario` e first-class.

## V4-02 - SaaS Web Shell E Contexto

Objetivo:

- transformar web Trabalho em SaaS real com contexto global.

Arquivos provaveis:

- `src/components/AppShell.tsx`
- `src/components/BottomNav.tsx`
- `src/pages/ManagementHubPage.tsx`
- `src/pages/PlacesPage.tsx`
- `src/components/place/PlaceAdminShell.tsx`
- `src/App.css`

Alterar:

- topbar com ATP, usuario, seletor Jogador/Trabalho, notificacoes;
- slot de organizacao/unidade;
- breadcrumb;
- header de pagina padrao;
- remover repeticoes de contexto dentro de cada pagina quando o shell ja mostra.

Nao alterar:

- Player App visual aprovado;
- loaders;
- permissions.

Aceite:

- web Trabalho parece plataforma SaaS, nao tela adaptada;
- usuario multiacademia entende unidade ativa;
- page body comeca na tarefa do dominio.

QA:

- owner multiunidade;
- manager;
- coach;
- frontdesk;
- finance;
- cashier;
- organizer;
- 1366 e wide.

## V4-03 - Mobile Work Shell Operacional

Objetivo:

- criar composicao mobile propria antes de reorganizar paginas internas.

Arquivos provaveis:

- `src/components/AppShell.tsx`
- `src/components/BottomNav.tsx`
- `src/pages/ManagementHubPage.tsx`
- `src/pages/PlacesPage.tsx`
- `src/App.css`
- novo componente `MobileWorkShell` se necessario.

Alterar:

- em viewport mobile, Trabalho usa layout operacional;
- header compacto;
- contexto ativo curto;
- CTA dominante;
- cards acionaveis;
- sheets/detalhes;
- `Abrir no web` para configuracao/relatorio.

Nao alterar:

- desktop SaaS;
- Player App;
- rotas.

Aceite:

- mobile nao renderiza mini desktop;
- nenhuma tela mobile comeca com card publico do local + shell + tabs + modulo antes da tarefa;
- CTA principal aparece na primeira dobra em 390px.

QA:

- 390 e 430;
- professor, recepcao, financeiro, caixa, gestor, organizador.

## V4-04 - Navegacao Desktop Por Dominio

Objetivo:

- substituir arvore de modulo por dominios previsiveis.

Arquivos provaveis:

- `src/components/BottomNav.tsx`
- `src/lib/workspace-access.ts`
- `src/lib/place-admin-navigation.ts`

Alterar:

- grupos: Trabalho, Operacao, Pessoas, Receita, Competicoes, Relatorios, Administracao, Conta;
- esconder grupos vazios;
- esconder sem permissao;
- manter rotas antigas.

Aceite:

- professor nao ve Financeiro/Cantina/Equipe/Ajustes;
- recepcao ve Reservas/Pessoas/Aulas, nao Admin;
- financeiro ve Receita;
- caixa ve Loja/POS;
- gestor ve dominios sem lista infinita;
- organizador ve Competicoes sem depender de descoberta publica.

## V4-05 - Navegacao Mobile Por Papel

Objetivo:

- bottom nav mobile deve ser operacional e diferente do desktop.

Arquivos provaveis:

- `src/components/BottomNav.tsx`
- `src/lib/workspace-access.ts`

Alvos:

- Professor: Hoje, Agenda, Turmas, Alunos, Perfil.
- Recepcao: Hoje, Reservas, Pessoas, Aulas, Mais.
- Financeiro: Receber, Pagos, Despesas, Resumo, Perfil.
- Caixa: Vender, Hoje, Estoque, Produtos, Perfil.
- Organizador: Hoje, Torneios, Ligas, Avisos, Perfil.
- Gestor: Hoje, Calendario, Aulas, Receita, Mais.

Aceite:

- `Mais` nao e ERP escondido;
- tarefa diaria nao fica em `Mais`;
- setup raro nao entra no menu principal.

## V4-06 - Trabalho Hoje Como Fila Real

Objetivo:

- `/gestao` vira central operacional por papel e contexto.

Arquivos provaveis:

- `src/pages/ManagementHubPage.tsx`
- `src/App.css`

Alterar:

- owner/manager: bloqueios por unidade;
- professor: aulas de hoje/proxima aula/reposicoes;
- recepcao: reservas/check-ins/lista de espera;
- financeiro: vencidos/receber;
- caixa: vender/estoque baixo;
- organizador: competicoes com bloqueio;
- convites agrupados e secundarios.

Nao mostrar:

- relatorio wall;
- todos os modulos;
- setup raro sem bloqueio.

Aceite:

- primeira dobra responde "o que resolver agora?";
- cada card tem CTA;
- estado vazio orienta proximo passo.

## V4-07 - Calendario First-Class

Objetivo:

- calendario deixa de ser subaba de Reservas/Aulas.

Arquivos provaveis:

- `src/pages/PlacesPage.tsx`
- componentes de booking calendar;
- componentes de academy calendar;
- `src/components/BottomNav.tsx`

Alterar:

- rota atual `/gestao/:placeId/agenda?visao=calendario` continua;
- destino visual `Calendario` no web e, quando papel exigir, mobile;
- grade por hora cheia;
- camadas: reservas, bloqueios, aulas, professor, competicao;
- professor mobile ve dia por hora, turma, quadra, alunos.

Aceite:

- usuario entende agenda do local como mapa de tempo;
- reservas e aulas usam calendario como contexto, nao como submenu duplicado.

## V4-08 - Reservas Sem Submenu Confuso

Objetivo:

- reservas vira ciclo de vida de reserva, com Nova reserva como CTA.

Arquivos provaveis:

- `src/components/place/BookingWorkspaceShell.tsx`
- `src/pages/PlacesPage.tsx`
- `src/components/place/PlaceBookingReservationsModule.tsx`
- `src/components/place/PlaceBookingCreateModule.tsx`
- `src/lib/bookingWhatsapp.ts`

Alterar:

- esconder tabbar interna quando destino ja e claro;
- `Nova reserva` CTA, nao aba escondida;
- espera dentro de Reservas;
- ajustes/quadras/regras em Admin;
- detalhe de reserva drawer/sheet;
- admin edit manual;
- WhatsApp para cancelar/trocar/espera;
- link seguro de reagendamento abre agenda disponivel.

Aceite:

- horario ocupado nao mostra CTA de criar reserva;
- reserva paga/pendente fica semanticamente clara;
- recepcao cria reserva em fluxo curto;
- WhatsApp nao e confirmacao extra de rotina.

QA:

- criar reserva;
- marcar pago;
- cancelar;
- editar;
- lista de espera;
- reagendamento por link.

## V4-09 - Aulas Professor-First

Objetivo:

- Aulas deixa de parecer ERP e vira operacao de aula/turma/aluno.

Arquivos provaveis:

- `src/components/place/AcademyWorkspaceShell.tsx`
- `src/pages/PlacesPage.tsx`
- componentes de academia/alunos/turmas.

Alterar:

- professor mobile com agenda do dia por hora cheia;
- detalhe de aula mostra turma, quadra, alunos, avisos e reposicoes;
- chamada oculta por padrao;
- setting `exigir chamada` em Admin, default off;
- professores/staff em Equipe/Pessoas;
- ajustes fora da rotina;
- modal de aluno responsivo: drawer desktop, sheet mobile.

Aceite:

- professor nao cai em financeiro/cantina/equipe/ajustes;
- aula funciona mesmo sem chamada;
- gestor ainda encontra setup no web.

## V4-10 - Pessoas Como Dominio

Objetivo:

- deixar de tratar Clientes como lista de contatos misturada.

Arquivos provaveis:

- `src/components/place/ClientsWorkspaceShell.tsx`
- `src/pages/PlacesPage.tsx`
- componentes de CRM/students/members/team.

Alterar:

- `Pessoas` como busca/dominio;
- relacoes: lead, cliente, aluno, socio, staff, responsavel;
- detalhe com timeline;
- acoes contextuais: WhatsApp, cobrar, reservar, matricular, converter.

Aceite:

- recepcao encontra pessoa rapido;
- gestor entende relacao da pessoa;
- aluno/socio nao desaparecem em modulos diferentes.

## V4-11 - Receita E Modal Unico De Pagamento

Objetivo:

- centralizar financeiro do local e preparar gateway futuro.

Arquivos provaveis:

- `src/components/place/FinanceWorkspaceShell.tsx`
- `src/pages/PlacesPage.tsx`
- componentes de payment modal/stub.

Alterar:

- Receber, Pagos, Despesas, Planos, Resumo com perguntas proprias;
- remover tabbar interna forte quando rota ja escolheu visao;
- modal unico para toda acao com valor;
- botao `Pagar`/`Marcar pago` simulado;
- status pago aparece no ledger.

Nao misturar:

- pagamentos pessoais;
- POS como venda;
- aulas como foco financeiro.

Aceite:

- financeiro cobra sem navegar em aula/cantina;
- recepcao ve apenas contexto de pagamento permitido;
- jogador ve seus pagamentos no Player App.

## V4-12 - Loja/POS

Objetivo:

- caixa vende rapido; web tem profundidade de estoque/produto.

Arquivos provaveis:

- `src/components/place/CanteenWorkspaceShell.tsx`
- componentes de canteen.

Alterar:

- mobile caixa cai em Vender;
- produtos/estoque nao bloqueiam venda;
- web mostra venda, vendas do dia, estoque, produtos.

Aceite:

- caixa nao ve financeiro amplo;
- venda termina com proximo passo claro.

## V4-13 - Competition OS Trabalho

Objetivo:

- separar organizar de competir.

Arquivos provaveis:

- `src/pages/EventsHubPage.tsx`
- `src/pages/TournamentPage.tsx`
- `src/pages/LeagueDetailsPage.tsx`
- `src/components/competition/*`
- `src/components/BottomNav.tsx`

Alterar:

- organizer hub em Trabalho;
- torneio por fase com CTA dominante;
- liga owner/participant separadas;
- mobile com tabs secundarias em `Mais`/sheet quando nao forem foco;
- staff por papel: owner, organizer, checkin, scorekeeper, media.

Preservar:

- `/eventos`;
- `/eventos/:id/*`;
- `/eventos/ligas/:id`;
- `/join`;
- `/inscricao`;
- `/t`.

Aceite:

- organizador nao cai em descoberta publica;
- player nao ve admin;
- staff autorizado nao perde ferramenta.

QA:

- criar torneio ate finalizar;
- criar liga ate rodadas/resultados;
- player resultado;
- admin resultado;
- comunicacao.

## V4-14 - Administracao E Relatorios Fora Da Rotina

Objetivo:

- colocar setup, permissao, relatorio e avancado em lugares previsiveis.

Arquivos provaveis:

- `src/components/place/SettingsWorkspaceShell.tsx`
- `src/components/place/TeamWorkspaceShell.tsx`
- relatorios atuais/futuros.

Alterar:

- Admin: equipe, convites, permissoes, regras, recursos, dados publicos, publicacao, avancado;
- Relatorios: operacao, receita, pessoas, competicoes;
- mobile mostra web handoff para acoes complexas.

Aceite:

- owner/manager encontra tudo;
- usuario sem permissao nao ve atalhos proibidos;
- acao destrutiva longe da rotina.

## V4-15 - Player Boundary

Objetivo:

- garantir que o crescimento do SaaS nao contamine o app do jogador.

Arquivos provaveis:

- `src/components/BottomNav.tsx`
- `src/pages/HomePage.tsx`
- `src/pages/PersonalAgendaPage.tsx`
- `src/pages/EventsHubPage.tsx`
- `src/pages/PlacesPage.tsx`

Alterar:

- Player nav: Inicio, Jogar, Competir, Rotina/Agenda, Perfil;
- aulas/pagamentos pessoais dentro de Rotina/Agenda;
- sem botao Trabalho vazando como card de acao em Competir/Jogar, exceto seletor global para usuario profissional;
- perfil pessoal nao vira admin.

Aceite:

- jogador puro nao ve gestao;
- jogador competitivo nao entra em cockpit admin;
- aluno acha aula e pagamento pessoal.

## V4-16 - QA Real E2E De Fluxo

Objetivo:

- provar fluxo completo e nao apenas screenshot bonito.

Executar:

- jogador reserva quadra;
- aluno ve aula e pagamento;
- socio reserva com plano;
- competitivo informa resultado;
- professor usa agenda/aula;
- recepcao cria/edita/cancela reserva;
- financeiro cobra/marca pago/despesa;
- caixa vende;
- gestor resolve bloqueio;
- torneio create-to-final;
- liga create-to-rounds;
- multiunidade troca contexto;
- multi-papel alterna Jogador/Trabalho.

Obrigatorio:

- mobile 390;
- mobile 430;
- desktop 1366;
- desktop amplo;
- console;
- network;
- rotas publicas;
- rotas legadas;
- permissoes.

Aceite:

- cada persona conclui tarefa sem caca visual;
- nenhuma funcao existente ficou sem caminho;
- nenhuma configuracao rara compete com rotina;
- nenhum relatorio domina mobile;
- docs refletem realidade.

## Ordem Obrigatoria

1. V4-00
2. V4-01
3. V4-02
4. V4-03
5. V4-04
6. V4-05
7. V4-06
8. V4-07
9. V4-08
10. V4-09
11. V4-10
12. V4-11
13. V4-12
14. V4-13
15. V4-14
16. V4-15
17. V4-16

Observacao:

- V4-02 e V4-03 podem ser feitos na mesma sprint se houver controle, porque web shell e mobile shell precisam nascer juntos.
- Nao fazer V4-08/09/10 isolados antes de V4-02/03, senao as paginas continuam carregando contexto errado.
