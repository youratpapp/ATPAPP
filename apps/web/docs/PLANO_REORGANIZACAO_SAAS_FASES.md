# Plano de Reorganizacao SaaS em Fases

Status: roadmap inicial
Data: 2026-05-22

## Regra de execucao

Nao iniciar implementacao grande sem fechar escopo da fase, criterio de aceite e impacto nas rotas atuais. Reaproveitar backend atual quando possivel, mas nao deixar a estrutura atual limitar o desenho do SaaS alvo.

## Fase 0 - Base de produto e arquitetura

Objetivo:
Congelar a nova base conceitual.

Entregaveis:
- Manual SaaS.
- Inventario de funcoes.
- Personas.
- Matriz persona/funcao.
- Diagnostico.
- Arquitetura de navegacao.
- Fluxos por persona.

Funcoes envolvidas:
Todas, sem alteracao de UI.

Riscos:
Documentar demais sem virar decisao pratica.

Criterios de aceite:
Toda funcao importante tem destino; web/mobile separados; areas desorganizadas identificadas.

Impacto no usuario:
Nenhum imediato.

## Fase 1 - Shell SaaS web e navegacao por dominios

Objetivo:
Transformar Trabalho web em plataforma SaaS, sem ainda refazer cada fluxo profundo.

Entregaveis:
- Topbar com unidade/local ativo.
- Sidebar por dominios.
- Separacao Player/Trabalho sem vazamento.
- Rotas antigas preservadas por wrapper/alias.
- Paginas base dos dominios.

Funcoes envolvidas:
Operacao, Agenda, Pessoas, Academia, Financeiro, Competicoes, Loja, Comunicacao, Relatorios, Administracao.

Riscos:
Trocar menu sem melhorar fluxo.

Criterios de aceite:
Usuario sabe onde comeca, onde agenda, onde pessoas ficam, onde financeiro fica e onde configura.

## Fase 2 - Agenda e Reservas como centro operacional

Objetivo:
Resolver o maior problema operacional: calendario, reservas, bloqueios e remarcacao.

Entregaveis:
- Calendario web responsivo.
- Colunas/quadras ajustadas ao monitor.
- Filtros coerentes por contexto.
- Slot clicavel.
- Drawer de reserva.
- Nova reserva, editar, cancelar, remarcar.
- WhatsApp profissional.
- Modal de pagamento padrao.
- Historico basico.

Funcoes envolvidas:
Court bookings, waitlist, booking change request, payments, WhatsApp.

Riscos:
Conflitos com RPC/migrations e layout mobile.

Criterios de aceite:
Recepcao consegue criar, editar, cancelar e avisar sem sair do fluxo.

## Fase 3 - Pessoas e Aluno/Cliente 360

Objetivo:
Separar leads, clientes, alunos e socios, criando detalhe central.

Entregaveis:
- Pessoas > Leads.
- Pessoas > Clientes ativos.
- Pessoas > Alunos.
- Pessoas > Socios.
- Perfil 360 com reservas, aulas, pagamentos, interacoes, observacoes e historico.

Funcoes envolvidas:
CRM, memberships, enrollments, payments, bookings, progress notes.

Riscos:
Duplicidade de pessoa/perfil/contato.

Criterios de aceite:
Recepcao e gestor encontram pessoa e entendem status em uma tela.

## Fase 4 - Academia e professor

Objetivo:
Transformar aulas em gestao de academia profissional e professor mobile simples.

Entregaveis:
- Academia web: turmas, aulas, matriculas, reposicoes, evolucao.
- Professor mobile: hoje por horario cheio.
- Chamada configuravel, padrao desligado.
- Faltas avisadas e reposicoes mais visiveis.
- Modal/drawer de aluno/matricula responsivo.

Funcoes envolvidas:
Academy classes, slots, coaches, enrollments, absences, makeup, progress notes.

Riscos:
Excesso de configuracao antes do fluxo basico.

Criterios de aceite:
Professor entende o dia sem ver ERP; gestor administra turmas sem tabs confusas.

## Fase 5 - Financeiro empresarial basico

Objetivo:
Centralizar dinheiro do local.

Entregaveis:
- Receber.
- Vencidos/inadimplencia.
- Pagos.
- Despesas.
- Planos/pacotes.
- Modal pagamento padrao.
- Links/WhatsApp de cobranca.
- Resumo inicial.

Funcoes envolvidas:
Payments, memberships, credit packages, expenses, tournament payments.

Riscos:
Misturar financeiro pessoal com local.

Criterios de aceite:
Financeiro consegue cobrar e marcar pago sem sair do dominio.

## Fase 6 - Competicoes trabalho

Objetivo:
Separar definitivamente jogador de organizador.

Entregaveis:
- Hub Trabalho > Competicoes.
- Torneio cockpit por fase.
- Liga cockpit por fase.
- Staff roles visuais.
- Resultados/inscricoes/pagamentos/comunicacao em fluxo.
- Mobile de evento para resultado/check-in.

Funcoes envolvidas:
Tournament and league libs, staff, payments, chat, court usage.

Riscos:
Quebrar rotas publicas.

Criterios de aceite:
Jogador so ve participacao; organizador ve bloqueio da fase atual.

## Fase 7 - Mobile Trabalho operacional

Objetivo:
Criar mobile como ferramenta de execucao rapida, nao copia do web.

Entregaveis:
- Home mobile por papel.
- Professor hoje.
- Recepcao agenda/reserva rapida.
- Financeiro cobrar.
- Caixa vender.
- Organizador resultados.
- Gestor pendencias.

Funcoes envolvidas:
Todas as acoes diarias.

Riscos:
Carregar complexidade demais.

Criterios de aceite:
Cada papel tem ate 5 destinos claros e tarefa principal visivel.

## Fase 8 - Relatorios, comunicacao e historico

Objetivo:
Dar maturidade empresarial.

Entregaveis:
- Relatorios de ocupacao.
- Relatorios financeiros.
- Relatorios de academia.
- Comunicacao/WhatsApp templates.
- Historico por cliente/reserva/aula/pagamento.

Riscos:
Relatorio sem dado confiavel.

Criterios de aceite:
Dono consegue tomar decisao e rastrear eventos principais.

## Fase 9 - Permissoes e planos v2

Objetivo:
Depois da arquitetura organizada, criar controle fino.

Entregaveis:
- Matriz real de permissoes.
- Roles refinados.
- Planos/feature flags.
- Bloqueios e upsell.
- Auditoria de acessos.

Riscos:
Definir permissao antes do fluxo consolidado.

Criterios de aceite:
Cada papel ve somente o necessario sem perder funcao critica.

## Fase 10 - Expansoes avancadas

Objetivo:
Escalar o SaaS.

Possiveis entregaveis:
- Automacoes.
- CRM avancado.
- Multiunidade completo.
- Auditoria completa.
- Integracoes de pagamento.
- Comissoes automaticas.
- Campanhas.
- Marketplace.

Riscos:
Expandir antes do core ficar limpo.

Criterios de aceite:
Core operacional ja validado por usuarios reais.

## Primeira fase pratica recomendada

Depois desta documentacao, a primeira implementacao deveria ser:

1. Shell SaaS web por dominios.
2. Agenda/Reservas como calendario central com drawer.
3. Clientes/Aluno 360.

Motivo:
Esses tres pontos reorganizam a base inteira sem exigir reconstruir o backend e resolvem as dores mais evidentes: menu confuso, reserva quebrada, pessoa sem contexto.
