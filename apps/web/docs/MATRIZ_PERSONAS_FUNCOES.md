# Matriz Inicial de Personas x Funcoes

Status: estudo organizacional, nao implementacao de permissoes
Data: 2026-05-22

Legenda:

- Sim: deve usar.
- Nao: nao deve usar.
- Talvez: depende da operacao.
- Somente propria: acesso apenas a itens do proprio usuario.
- Somente leitura: consulta sem acao administrativa.
- Admin: dono/gestor autorizado.
- Futuro: desejavel, ainda precisa desenho.

| Funcao | Area ideal | Dono | Gestor | Recepcao | Financeiro | Caixa | Professor | Organizador | Staff evento | Jogador/Aluno | Web | Mobile | Observacoes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Ver painel de hoje | Operacao | Sim | Sim | Sim | Sim | Sim | Sim | Sim | Sim | Somente propria | Sim | Sim | Conteudo muda por papel |
| Ver saude geral | Relatorios | Sim | Sim | Nao | Somente leitura | Nao | Nao | Talvez | Nao | Nao | Sim | Talvez | Mobile so alertas |
| Calendario geral | Agenda | Sim | Sim | Sim | Nao | Nao | Somente leitura | Talvez | Nao | Nao | Sim | Talvez | Web deve ser completo |
| Agenda do professor | Academia | Sim | Sim | Sim | Nao | Nao | Sim | Nao | Nao | Somente propria | Sim | Sim | Professor ve por dia |
| Criar reserva | Agenda/Reservas | Sim | Sim | Sim | Nao | Nao | Talvez | Nao | Nao | Talvez | Sim | Sim | Jogador via fluxo publico |
| Editar reserva | Agenda/Reservas | Sim | Sim | Sim | Nao | Nao | Talvez | Nao | Nao | Somente propria limitada | Sim | Sim | Drawer responsivo |
| Cancelar reserva | Agenda/Reservas | Sim | Sim | Sim | Nao | Nao | Talvez | Nao | Nao | Somente propria | Sim | Sim | Com regra de prazo |
| Enviar WhatsApp reserva | Comunicacao | Sim | Sim | Sim | Talvez | Nao | Talvez | Nao | Nao | Nao | Sim | Sim | Templates por acao |
| Solicitar remarcacao | Agenda/Reservas | Sim | Sim | Sim | Nao | Nao | Talvez | Nao | Nao | Somente propria/link | Sim | Sim | Link publico |
| Criar bloqueio de quadra | Agenda/Recursos | Sim | Sim | Sim | Nao | Nao | Nao | Talvez | Nao | Nao | Sim | Talvez | Admin/recepcao conforme regra |
| Configurar quadras | Configuracoes | Sim | Admin | Nao | Nao | Nao | Nao | Nao | Nao | Nao | Sim | Nao | Setup raro |
| Configurar regras reserva | Configuracoes | Sim | Admin | Nao | Nao | Nao | Nao | Nao | Nao | Nao | Sim | Nao | Setup raro |
| Ver clientes ativos | Pessoas | Sim | Sim | Sim | Somente leitura | Nao | Somente leitura | Nao | Nao | Nao | Sim | Talvez | Separar de leads |
| Criar cliente/contato | Pessoas | Sim | Sim | Sim | Talvez | Nao | Talvez | Nao | Nao | Nao | Sim | Sim | Recepcao precisa rapido |
| Gerir leads | Pessoas/CRM | Sim | Sim | Sim | Nao | Nao | Talvez | Nao | Nao | Nao | Sim | Talvez | Pipeline simples |
| Ver aluno 360 | Pessoas/Academia | Sim | Sim | Sim | Somente leitura financeiro | Nao | Sim vinculados | Nao | Nao | Somente propria | Sim | Sim | Detalhe central |
| Criar turma/aula | Academia | Sim | Sim | Talvez | Nao | Nao | Talvez | Nao | Nao | Nao | Sim | Nao | Web completo |
| Matricular aluno | Academia | Sim | Sim | Sim | Talvez | Nao | Talvez | Nao | Nao | Nao | Sim | Talvez | Mobile so simples |
| Editar matricula | Academia | Sim | Sim | Talvez | Nao | Nao | Talvez | Nao | Nao | Nao | Sim | Nao | Drawer correto |
| Ver aulas do dia | Academia | Sim | Sim | Sim | Nao | Nao | Sim | Nao | Nao | Somente propria | Sim | Sim | Professor mobile forte |
| Registrar chamada | Academia | Talvez | Talvez | Nao | Nao | Nao | Talvez | Nao | Nao | Nao | Sim | Sim | So se configuracao exigir |
| Registrar falta avisada | Academia | Sim | Sim | Sim | Nao | Nao | Sim | Nao | Nao | Somente propria | Sim | Sim | Mais relevante que chamada |
| Gerir reposicao | Academia | Sim | Sim | Sim | Nao | Nao | Sim | Nao | Nao | Somente propria | Sim | Sim | Fila operacional |
| Nota de evolucao | Academia | Sim | Sim | Nao | Nao | Nao | Sim | Nao | Nao | Somente propria se liberado | Sim | Sim | Aluno 360 |
| Ver recebiveis | Financeiro | Sim | Sim | Talvez | Sim | Nao | Nao | Talvez evento | Nao | Nao | Sim | Talvez | Local, nao pessoal |
| Marcar pagamento pago | Financeiro | Sim | Sim | Talvez | Sim | Nao | Nao | Talvez evento | Nao | Somente propria via modal | Sim | Sim | Modal padrao |
| Ver pagos | Financeiro | Sim | Sim | Nao | Sim | Nao | Nao | Talvez | Nao | Nao | Sim | Talvez | Relatorio/consulta |
| Registrar despesa | Financeiro | Sim | Sim | Nao | Sim | Nao | Nao | Nao | Nao | Nao | Sim | Talvez | Mobile simples opcional |
| Gerir planos/pacotes | Financeiro | Sim | Admin | Nao | Sim | Nao | Nao | Nao | Nao | Nao | Sim | Nao | Config/financeiro |
| Comissao professor | Financeiro | Sim | Sim | Nao | Sim | Nao | Somente propria | Nao | Nao | Nao | Sim | Talvez | Futuro amadurecer |
| Vender produto | Loja/POS | Sim | Sim | Talvez | Nao | Sim | Nao | Nao | Nao | Nao | Sim | Sim | Venda rapida |
| Gerir estoque | Loja/POS | Sim | Sim | Nao | Nao | Sim | Nao | Nao | Nao | Nao | Sim | Sim | Mobile alerta baixo |
| Criar produto | Loja/POS | Sim | Sim | Nao | Nao | Talvez | Nao | Nao | Nao | Nao | Sim | Nao | Config de loja |
| Criar torneio | Competicoes | Sim | Sim | Nao | Nao | Nao | Nao | Sim | Nao | Nao | Sim | Nao | Wizard web |
| Configurar torneio | Competicoes | Sim | Sim | Nao | Nao | Nao | Nao | Sim | Nao | Nao | Sim | Nao | Owner/organizer |
| Aprovar inscricao torneio | Competicoes | Sim | Sim | Nao | Talvez | Nao | Nao | Sim | Checkin | Nao | Sim | Sim | Mobile evento |
| Gerar jogos torneio | Competicoes | Sim | Sim | Nao | Nao | Nao | Nao | Sim | Nao | Nao | Sim | Nao | Operacao por fase |
| Lancar resultado torneio | Competicoes | Sim | Sim | Nao | Nao | Nao | Nao | Sim | Scorekeeper | Somente propria se permitido | Sim | Sim | Mobile essencial |
| Publicar aviso torneio | Comunicacao | Sim | Sim | Nao | Nao | Nao | Nao | Sim | Media | Nao | Sim | Sim | Papel media |
| Criar liga | Competicoes | Sim | Sim | Nao | Nao | Nao | Nao | Sim | Nao | Nao | Sim | Nao | Web |
| Gerar rodada liga | Competicoes | Sim | Sim | Nao | Nao | Nao | Nao | Sim | Nao | Nao | Sim | Nao | Owner |
| Enviar resultado liga | Competicoes | Nao | Nao | Nao | Nao | Nao | Nao | Nao | Nao | Somente propria | Nao | Sim | Jogador |
| Ver classificacao liga | Competicoes | Sim | Sim | Nao | Nao | Nao | Nao | Sim | Sim | Sim | Sim | Sim | Diferente por papel |
| Gerir equipe | Administracao | Sim | Admin | Nao | Nao | Nao | Nao | Nao | Nao | Nao | Sim | Nao | Setup/admin |
| Aceitar convite trabalho | Operacao | Sim | Sim | Sim | Sim | Sim | Sim | Sim | Sim | Nao | Sim | Sim | Home de trabalho |
| Configuracoes de unidade | Administracao | Sim | Admin | Nao | Nao | Nao | Nao | Nao | Nao | Nao | Sim | Nao | Fora da rotina |
| Relatorio ocupacao | Relatorios | Sim | Sim | Nao | Talvez | Nao | Nao | Nao | Nao | Nao | Sim | Nao | SaaS web |
| Relatorio financeiro | Relatorios | Sim | Sim | Nao | Sim | Nao | Nao | Nao | Nao | Nao | Sim | Nao | SaaS web |
| Relatorio academia | Relatorios | Sim | Sim | Nao | Nao | Nao | Talvez | Nao | Nao | Nao | Sim | Nao | SaaS web |

