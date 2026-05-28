# Global Tennis Academy Product Completeness Audit

Data: 2026-05-26
Status: auditoria de produto e completude operacional
Escopo: ATP como ferramenta completa e pratica para academias, clubes, professores, recepcao, financeiro, competicoes e jogadores.

## 0. Como esta auditoria foi feita

Fontes analisadas:

- Rotas e paginas reais do app em `src/App.tsx`, `src/pages` e `src/components/place`.
- Documentos vivos em `docs/`, especialmente inventario de funcoes, diagnostico SaaS, blueprint, QA funcional e queue ativa.
- Estado atual reportado pelos testes funcionais com seeds em torneio, liga, academia, comunicacao, reservas e matriculas.
- Padroes de mercado de SaaS de gestao: CRM/list views/detalhe lateral, calendario operacional, billing, relatorios, tarefa/pendencia, configuracao separada da rotina e mobile operacional.

Esta auditoria nao substitui a queue de bugs. Ela responde outra pergunta:

> O que ainda falta para o ATP deixar de ser um app com modulos funcionais e virar uma ferramenta empresarial completa para uma academia de tenis?

## 1. Diagnostico executivo

O ATP ja tem uma base funcional forte:

- Player App com inicio, jogar, competir, rotina e perfil.
- Agenda pessoal com reservas, partidas, aulas, pagamentos e historico.
- Agenda do local com reservas, aulas, bloqueios, remarcacao e pagamento stub.
- Academia com turmas, alunos, professores, matriculas, reposicoes e configuracao de chamada opcional.
- Clientes/CRM e elementos de Cliente 360.
- Financeiro parcial com recebiveis, pagos, despesas, pacotes e stub de pagamento.
- Loja/POS com produtos, vendas e estoque.
- Torneios e ligas com criacao, inscricoes, aprovacao, jogos, resultados, chat e finalizacao.
- Comunicacao por WhatsApp em pontos operacionais.
- Relatorios MVP.
- Testes E2E reais para torneio, liga, academia e comunicacao.

O que ainda falta nao e "mais cards". O que falta e maturidade de sistema empresarial:

1. Modelo claro de ciclo de vida para cada objeto importante.
2. Cliente/Aluno 360 realmente central como fonte de verdade.
3. Financeiro com billing real, contratos, recorrencia, inadimplencia, recibos e conciliacao.
4. Agenda como sistema de operacao completo, nao so grade visual.
5. Politicas configuraveis da academia: cancelamento, reposicao, no-show, pacotes, beneficios e bloqueios.
6. Tarefas/pendencias como entidade propria, com dono, prazo e historico.
7. Relatorios de decisao, nao apenas numeros.
8. Comunicacao com historico e automacoes.
9. Permissoes, auditoria e multiunidade mais maduras.
10. Mobile Trabalho bem delimitado como execucao rapida, nao mini-SaaS.

## 2. O que define "ferramenta completa" para uma academia de tenis

Uma academia precisa resolver diariamente:

- Quem vem hoje.
- Qual quadra esta ocupada.
- Qual professor esta trabalhando.
- Qual aluno esta atrasado ou inadimplente.
- Qual reserva precisa pagar, cancelar ou remarcar.
- Qual aula teve falta avisada e gera reposicao.
- Qual turma esta cheia, vazia ou precisa ajuste.
- Qual cliente precisa ser cobrado, atendido ou recuperado.
- Quanto entrou, quanto esta vencido e quanto falta receber.
- Qual torneio/liga esta travado.
- Quem da equipe precisa executar cada pendencia.

O sistema completo precisa cobrir estas camadas:

1. Operacao do dia.
2. Cadastro e relacionamento.
3. Agenda e recursos.
4. Academia e ensino.
5. Financeiro e billing.
6. Competicoes.
7. Comunicacao.
8. Relatorios.
9. Administracao, permissoes e auditoria.
10. Experiencia do jogador/aluno.

## 3. Lacunas por dominio funcional

### 3.1. Onboarding e configuracao inicial da academia

O que ja existe:

- Criacao de local.
- Quadras.
- Professores/staff.
- Regras parciais de reserva.
- Configuracoes de academia.
- Percentual/indicador de implantacao em algumas telas.

O que falta para ficar completo:

- Assistente de implantacao por etapas, com progresso real e proximo passo.
- Checklist inicial: dados da unidade, horarios, feriados, quadras, precos, planos, professores, templates de mensagem, regras de cancelamento, regras de reposicao, financeiro/pagamento, permissoes basicas.
- Modo "academia pequena" e "academia com equipe", para nao obrigar cadastros demais.
- Validacao de dados minimos antes de liberar operacao publica.
- Templates padrao de politicas: reserva, cancelamento, reposicao, aula experimental, pagamento atrasado.

Por que importa:

Uma academia pequena nao pode passar dias configurando. Uma academia grande precisa padronizar antes de operar.

Prioridade:
Alta.

### 3.2. Unidade, multiacademia e contexto ativo

O que ja existe:

- Seletor de unidade/local no shell trabalho.
- Rotas por `placeId`.
- Papeis por local.

O que falta:

- Camada de organizacao acima do local para donos com mais de uma unidade.
- Painel consolidado multiunidade.
- Permissao por unidade.
- Transferencia ou comparacao entre unidades.
- Relatorios por unidade e consolidado.
- Busca global respeitando unidade ativa.

Por que importa:

Sem isso, uma rede com duas academias ja sente confusao: onde estou, que dados estou editando, qual caixa/agenda/cliente e de qual unidade.

Prioridade:
Media/Alta.

### 3.3. Agenda, quadras e recursos

O que ja existe:

- Agenda do local por dia.
- Semana por quadra.
- Lista, remarcacoes, canceladas, conflitos.
- Reservas, aulas, bloqueios e ocupacoes.
- Drawer lateral em parte do fluxo.

O que falta:

- Calendario com contrato visual unico para todos os eventos: reserva, aula, bloqueio, torneio, manutencao e uso interno.
- Status visual padronizado: pago, pendente, cancelado, remarcacao solicitada, bloqueio, aula, competicao.
- Regras de conflito com mensagem clara.
- Recorrencia de reservas e bloqueios.
- Manutencao de quadra com historico.
- Capacidade de arrastar/remarcar no web, quando tecnicamente seguro.
- Agenda semanal hora-a-hora por quadra selecionada, igual ao padrao diario.
- Visao mensal/lista para gestao, sem virar foco operacional.
- Impressao/exportacao de agenda do dia.
- Logs de alteracao por reserva/aula/bloqueio.

Por que importa:

A agenda e o centro da operacao. Se ela nao for confiavel, a recepcao volta para WhatsApp e planilha.

Prioridade:
Altissima.

### 3.4. Reservas

O que ja existe:

- Criar reserva.
- Editar reserva.
- Cancelar.
- Pagamento stub.
- WhatsApp troca.
- Link de remarcacao.
- Lista de espera.
- Reserva publica pelo jogador.

O que falta:

- Ciclo de vida formal:
  - rascunho/hold;
  - aguardando pagamento;
  - confirmada;
  - paga;
  - cancelada;
  - remarcacao solicitada;
  - remarcada;
  - no-show;
  - reembolsada;
  - credito gerado.
- Regra de expiracao para reserva aguardando pagamento.
- Recibo/comprovante.
- Historico de mensagens e alteracoes.
- Motivo obrigatorio para cancelamento admin.
- Regras de cancelamento por plano/pacote.
- Politica de convidado/participantes.
- Pagamento parcial/sinal, se a academia usar.
- Fluxo de reembolso ou credito.
- Confirmacao visual no app do jogador apos alteracao.
- Alerta quando slot aparentemente livre possui conflito real.

Por que importa:

Reserva e dinheiro. O sistema precisa explicar o que aconteceu, quem fez e qual o proximo passo.

Prioridade:
Altissima.

### 3.5. Clientes, alunos, socios e CRM

O que ja existe:

- Lista de clientes.
- Leads/ativos em alguma forma.
- Cliente 360 parcial.
- Dados de contato.
- Vinculos com aulas, reservas, pagamentos e interacoes.
- WhatsApp.

O que falta:

- Modelo unificado de pessoa/cliente:
  - lead;
  - aluno;
  - socio;
  - responsavel;
  - dependente;
  - jogador avulso;
  - ex-aluno;
  - fornecedor/colaborador quando aplicavel.
- Deteccao e merge de duplicados.
- Responsavel financeiro e dependentes.
- Ficha de emergencia, observacoes medicas e restricoes, se a academia quiser.
- Consentimento LGPD e preferencias de comunicacao.
- Pipeline simples: novo lead, contato feito, aula experimental, proposta, convertido, perdido.
- Timeline completa: reservas, aulas, pagamentos, mensagens, notas, cancelamentos, competicoes.
- Status de relacionamento: ativo, em risco, inadimplente, inativo, lead quente.
- Proxima acao por cliente.
- Campo de origem: indicacao, Instagram, torneio, site, recepcao.

Por que importa:

Hoje a informacao tende a ficar espalhada entre clientes, alunos, financeiro e academia. Um SaaS profissional gira em torno do registro 360 do cliente.

Prioridade:
Altissima.

### 3.6. Academia, turmas e aulas

O que ja existe:

- Criar turmas.
- Listar turmas compactas.
- Editar turma.
- Matricular aluno.
- Ativar matricula.
- Aulas vinculadas ao aluno.
- Professor e turma.
- Reposicoes.
- Chamada opcional por configuracao.

O que falta:

- Separar template recorrente de turma e aula ocorrida.
- Periodo/temporada: mensal, semestre, ano, ciclo.
- Lotacao, lista de espera e prioridade de entrada.
- Regras de reposicao: prazo, credito, limite, expiracao, quem aprova.
- Aula experimental.
- Transferencia de turma.
- Trancamento/pausa de matricula.
- Substituicao de professor.
- Cancelamento de aula com aviso em massa.
- Historico de evolucao simples por aluno.
- Registro de ausencia avisada sem obrigar chamada.
- Matricula com contrato/plano/pagamento vinculados.
- Grade de professor por dia, hora cheia, com alunos/turma/quadra.
- Grade geral por quadra/professor sem sobreposicao confusa.

Por que importa:

Academia de tenis nao e so aula solta. Ela opera turmas recorrentes, reposicoes, mensalidades e professor.

Prioridade:
Alta.

### 3.7. Professores e equipe

O que ja existe:

- Vinculo de professor.
- Convites de staff.
- Papeis de trabalho.
- Agenda/turmas do professor.
- Comissao em parte do cadastro.

O que falta:

- Perfil profissional do professor separado do perfil jogador.
- Disponibilidade semanal.
- Bloqueios pessoais.
- Substituicoes.
- Carga horaria.
- Turmas/alunos vinculados.
- Repasse/comissao por regra.
- Relatorio de aulas dadas, faltas avisadas e reposicoes.
- Onboarding de professor.
- Permissao granular por modulo.
- Notas internas da equipe.

Por que importa:

Professor e operador central da academia. Se ele nao tem agenda clara e a gestao nao sabe sua carga, o SaaS perde valor.

Prioridade:
Alta.

### 3.8. Financeiro, billing e pagamentos

O que ja existe:

- Pagamentos pessoais.
- Recebiveis do local.
- Pagos.
- Despesas.
- Pacotes.
- Stub de pagamento.
- Pendencias financeiras.

O que falta:

- Gateway real com webhook.
- Faturas/recibos.
- Cobrança recorrente.
- Mensalidades por plano/contrato.
- Inadimplencia com aging: 1-7, 8-15, 16-30, 30+ dias.
- Descontos, cupons, isencoes e bolsas.
- Prorrata.
- Reembolso, credito e cancelamento financeiro.
- Conciliacao por metodo: Pix, cartao, dinheiro, transferencia.
- Caixa do dia e fechamento.
- Receita por produto: reserva, mensalidade, torneio, POS, pacote.
- Comissoes de professor.
- Split ou repasse futuro.
- Exportacao CSV/PDF.
- Auditoria de quem marcou pago.

Por que importa:

Sem billing, a academia continua usando outro sistema para dinheiro. O ATP precisa ser confiavel para receber e cobrar.

Prioridade:
Altissima.

### 3.9. Planos, contratos e pacotes

O que ja existe:

- Planos de socio/membership.
- Pacotes de credito.
- Contratos de aluno.

O que falta:

- Catalogo unico de planos:
  - mensalidade de aula;
  - socio/quadra;
  - pacote de aulas;
  - pacote de quadra;
  - pacote avulso;
  - familiar/dependente;
  - plano promocional.
- Regras por plano:
  - limite de aulas/semana;
  - beneficio em reservas;
  - desconto;
  - validade;
  - pausa/trancamento;
  - renovacao;
  - multa/cancelamento;
  - reposicoes permitidas.
- Contrato vinculado ao cliente 360.
- Mudanca de plano com historico.

Por que importa:

Academias vendem planos, nao apenas reservas isoladas. Sem isso, o financeiro fica incompleto.

Prioridade:
Alta.

### 3.10. Loja/POS

O que ja existe:

- Produtos.
- Vendas.
- Estoque.
- Cancelamento.

O que falta:

- Venda rapida realmente otimizada para caixa.
- Fechamento de caixa.
- Metodos de pagamento.
- Sangria/reforco de caixa.
- Custo, margem e lucro.
- Fornecedor.
- Movimentacao de estoque: entrada, ajuste, perda, venda, devolucao.
- Alerta de estoque baixo.
- Relatorio de produtos mais vendidos.
- Comprovante/recibo.

Por que importa:

Se a academia tem cantina/pro shop, POS precisa ser rapido e nao misturado com financeiro gerencial.

Prioridade:
Media.

### 3.11. Torneios e ligas

O que ja existe:

- Criacao.
- Inscricao.
- Aprovar jogadores.
- Gerar jogos.
- Resultados.
- Chat/comunicacao.
- Ranking/classificacao.
- Finalizacao.
- E2E passou para torneio e liga.

O que falta:

- Wizard de criacao guiado por tipo de evento.
- Templates de regras.
- Classes/divisoes com regras de idade/nivel/genero.
- Pagamento de inscricao com gateway.
- Check-in presencial.
- Escala de quadras integrada a agenda.
- Otimizador de horarios/conflitos.
- Scorekeeper mobile.
- WO/disputa com historico.
- Comunicados segmentados.
- Publicacao e compartilhamento com versao publica limpa.
- Relatorio pos-evento: receita, inscritos, faltas, campeoes, jogos.
- Permissoes especificas: owner, organizador, check-in, placar, midia.

Por que importa:

Competicao e um produto forte do ATP. Precisa parecer sistema de operacao de evento, nao apenas paginas publicas com abas.

Prioridade:
Alta.

### 3.12. Comunicacao

O que ja existe:

- WhatsApp templates em alguns fluxos.
- Chat de torneio/liga.
- Comunicados.
- Interacoes CRM parciais.

O que falta:

- Central de comunicacao.
- Historico por cliente e por objeto: reserva, aula, pagamento, torneio.
- Templates editaveis por academia.
- Variaveis padrao: nome, unidade, horario, quadra, valor, remetente.
- Automacoes:
  - reserva confirmada;
  - pagamento pendente;
  - cancelamento;
  - remarcacao;
  - aula cancelada;
  - mensalidade vencida;
  - torneio publicado;
  - resultado pendente.
- Status de envio, quando houver API oficial.
- Consentimento e opt-out.
- Mensagens internas para equipe.

Por que importa:

Academia opera no WhatsApp. O SaaS precisa organizar isso, nao fingir que comunicacao e externa.

Prioridade:
Alta.

### 3.13. Tarefas e pendencias

O que ja existe:

- Pendencias calculadas em varios modulos.
- Trabalho Hoje.
- Filas por modulo.

O que falta:

- Entidade de tarefa/pendencia real.
- Dono responsavel.
- Prazo.
- Prioridade.
- Origem: reserva, pagamento, aluno, torneio, liga, cliente.
- Status: aberta, em andamento, resolvida, ignorada, vencida.
- Comentarios.
- Historico.
- Atribuicao para colaborador.
- Painel "minhas tarefas".
- Automacoes criando pendencias.

Por que importa:

Sem uma fila de trabalho real, o gestor precisa abrir telas para procurar problemas.

Prioridade:
Alta.

### 3.14. Relatorios

O que ja existe:

- Relatorios MVP.
- Numeros em dashboards.
- Dados suficientes para alguns indicadores.

O que falta:

- Relatorio de ocupacao de quadras por horario/dia/professor.
- Receita por dominio.
- Inadimplencia por faixa.
- Churn/inativos.
- Leads e conversao.
- Turmas com baixa ocupacao.
- Professor: carga, receita atribuida, reposicoes, faltas avisadas.
- Eventos: receita, inscritos, jogos, pendencias, lucro.
- POS: vendas, margem, estoque.
- Exportacao CSV/PDF.
- Filtros por unidade, periodo, professor, turma, plano.
- Agendamento de relatorio futuro.

Por que importa:

Um SaaS empresarial precisa ajudar a tomar decisao, nao apenas executar operacao.

Prioridade:
Media/Alta.

### 3.15. Permissoes, auditoria e seguranca

O que ja existe:

- Papeis de staff.
- Rotas por modo.
- RLS e permissoes em parte da base.

O que falta:

- Templates de papel: owner, gestor, recepcao, financeiro, caixa, professor, organizador.
- Permissoes por acao.
- Permissoes por unidade.
- Auditoria:
  - quem criou;
  - quem editou;
  - quem cancelou;
  - quem marcou pago;
  - quem alterou regra;
  - quando e por que.
- Confirmacao para acoes perigosas.
- Log de acesso administrativo.
- Exportacao/exclusao de dados pessoais.
- Politicas LGPD.

Por que importa:

Quando dinheiro, aluno e agenda entram no sistema, "quem fez o que" vira requisito de confianca.

Prioridade:
Alta.

### 3.16. Mobile Trabalho

O que ja existe:

- Modo trabalho mobile.
- Rotinas por papel em parte.
- Algumas telas responsivas.

O que falta:

- Definicao mais dura de escopo:
  - Hoje;
  - agenda do dia;
  - aula do professor;
  - resultado de competicao;
  - cobrar/marcar pago;
  - WhatsApp;
  - venda rapida;
  - aprovar pendencia simples.
- Remover configuracoes pesadas do mobile.
- Garantir que todo detalhe abra em sheet legivel.
- Fazer professor ter calendario diario por hora cheia.
- Mobile de recepcao focado em nova reserva/consulta cliente.
- Mobile de organizador focado em placar, check-in e pendencias.

Por que importa:

Mobile de trabalho nao deve tentar ser o SaaS inteiro. Ele precisa executar tarefas em movimento.

Prioridade:
Alta.

### 3.17. Player App

O que ja existe:

- Inicio, Jogar, Competir, Rotina, Perfil.
- Reservar quadra.
- Encontrar jogo.
- Competicoes.
- Agenda pessoal.
- Perfil.

O que falta:

- Taxonomia fechada de nivel: iniciante, intermediario, avancado, primeira classe, profissional, kids etc.
- Modal/drawer de detalhes de jogo aberto sem balao vazio.
- Jogo de duplas com 4 participantes e regras claras.
- Filtros reais de UF/cidade/local em reservas e locais.
- Perfil com upload funcionando sob RLS correta.
- Local publico totalmente alinhado ao novo design.
- Pagamentos pessoais com gateway futuro.
- Mensagens de sucesso/proximo passo apos entrar em jogo, reservar, pagar ou cancelar.

Por que importa:

Jogador precisa confiar que o app simplifica, nao que ele esta vendo ferramenta administrativa disfarçada.

Prioridade:
Alta para filtros/perfil/jogo aberto; media para refinamentos.

## 4. Matriz resumida por funcao

| Funcao | Ja existe | Falta para SaaS completo | Prioridade |
|---|---|---|---|
| Criar local | Sim | Wizard completo, checklist, dados fiscais e politicas | Alta |
| Selecionar unidade | Sim | Organizacao multiunidade, permissoes por unidade | Media/Alta |
| Agenda diaria | Sim | Status visual completo, logs, conflitos, drawer sempre consistente | Altissima |
| Agenda semanal | Parcial | Hora-a-hora por quadra selecionada | Alta |
| Reserva admin | Sim | Lifecycle completo, recibo, motivo, auditoria | Altissima |
| Reserva jogador | Sim | Hold/expiracao, pagamento real, sucesso e historico | Alta |
| Remarcacao | Sim | Fluxo completo com token, status e historico | Alta |
| Lista de espera | Sim | Contextual por slot, notificacao e promocao rastreavel | Media/Alta |
| Bloqueio de quadra | Sim | Recorrencia, tipo, manutencao, historico | Media |
| Cliente 360 | Parcial | Fonte de verdade completa e timeline | Altissima |
| Leads | Parcial | Pipeline e follow-up | Media/Alta |
| Socios | Parcial | Planos, beneficios e cobranca recorrente | Alta |
| Turmas | Sim | Temporada, contrato, transferencia, lista de espera | Alta |
| Matriculas | Sim | Contrato/plano/billing, pausa, historico | Alta |
| Reposicao | Sim | Politica configuravel e vencimento de credito | Alta |
| Professor | Sim | Disponibilidade, carga, substituicao, comissao | Alta |
| Financeiro | Parcial | Gateway, recorrencia, recibos, conciliacao, aging | Altissima |
| Pacotes/creditos | Parcial | Regras, validade, consumo e relatorio | Alta |
| POS | Parcial | Fechamento, estoque real, margem, comprovante | Media |
| Torneio | Sim | Wizard, check-in, quadras, relatorio, roles | Alta |
| Liga | Sim | Temporada, rodada, validacao, encerramento robusto | Alta |
| Comunicacao | Parcial | Central, historico, templates editaveis, automacoes | Alta |
| Relatorios | Parcial | Relatorios decisorios e exportacao | Media/Alta |
| Permissoes | Parcial | Granularidade, auditoria, LGPD | Alta |
| Mobile Trabalho | Parcial | Escopo operacional duro por persona | Alta |
| Player filtros | Parcial | UF/cidade/local reais e nivel fechado | Alta |
| Perfil | Sim | Upload sem erro RLS e layout consistente | Alta |

## 5. Ordem recomendada para completar o produto

### Fase 1 - Fundacao operacional obrigatoria

Objetivo:
Fechar o que impede confianca na operacao diaria.

Entregas:

1. Agenda diaria/semanal definitiva.
2. Drawer unico de detalhe para reserva/aula/bloqueio.
3. Status de reserva e pagamento persistente.
4. Logs basicos de reserva.
5. Filtros reais de UF/cidade/local no Player.
6. Corrigir upload de foto e RLS.
7. Remover residuos visuais antigos em Local Publico.

Criterio de aceite:
Recepcao consegue criar, editar, cancelar, remarcar, cobrar e avisar sem sair da agenda.

### Fase 2 - Cliente 360 e planos

Objetivo:
Centralizar a relacao da academia com a pessoa.

Entregas:

1. Cliente 360 completo com timeline.
2. Leads separados de clientes ativos.
3. Alunos e socios como facetas do cliente, nao cadastros soltos.
4. Plano/contrato/pacote vinculados ao cliente.
5. Historico de pagamentos, reservas, aulas e comunicacoes.

Criterio de aceite:
Ao abrir um cliente, recepcao e financeiro entendem tudo que ele tem com a academia.

### Fase 3 - Billing MVP realista

Objetivo:
Preparar pagamento real sem reconstruir UI depois.

Entregas:

1. Modal padrao de pagamento em todos os pontos.
2. Modelo de fatura/recebivel unificado.
3. Inadimplencia por faixa.
4. Recibo/comprovante.
5. Despesa, receita e caixa do dia.
6. Webhook/gateway em fase tecnica posterior.

Criterio de aceite:
Tudo que precisa de pagamento gera um recebivel claro e pode ser marcado como pago de forma persistente.

### Fase 4 - Academia completa

Objetivo:
Resolver operacao de aulas, turmas, professores e reposicoes.

Entregas:

1. Turmas como lista compacta + detalhe lateral.
2. Alunos como Cliente 360 filtrado.
3. Reposicoes como fila propria.
4. Disponibilidade do professor.
5. Substituicao e cancelamento de aula.
6. Politicas de reposicao e ausencia.
7. Grade do professor por dia/hora.

Criterio de aceite:
Gestor entende turmas, professor entende agenda, aluno ve apenas o que e dele.

### Fase 5 - Comunicacao e tarefas

Objetivo:
Transformar WhatsApp e pendencias em sistema.

Entregas:

1. Templates editaveis.
2. Historico de mensagem por cliente/reserva/aula/pagamento/evento.
3. Central de pendencias com dono e prazo.
4. Automacoes basicas.

Criterio de aceite:
Toda acao critica tem comunicacao sugerida e fica registrada.

### Fase 6 - Competicoes empresariais

Objetivo:
Aprofundar torneios e ligas como modulo de negocio.

Entregas:

1. Wizard por tipo.
2. Check-in.
3. Agenda de quadras integrada.
4. Pagamento de inscricao.
5. Comunicacao segmentada.
6. Relatorio pos-evento.
7. Roles de evento.

Criterio de aceite:
Organizador roda evento sem planilha externa.

### Fase 7 - Relatorios e gestao

Objetivo:
Dar visao de negocio ao dono/gestor.

Entregas:

1. Ocupacao.
2. Receita por area.
3. Inadimplencia.
4. Turmas e professores.
5. Clientes ativos/inativos.
6. Eventos.
7. Exportacoes.

Criterio de aceite:
Dono entende saude da academia em menos de 5 minutos.

### Fase 8 - Permissoes, auditoria e multiunidade

Objetivo:
Preparar operacao profissional e escalavel.

Entregas:

1. Papel por unidade.
2. Permissoes granulares.
3. Auditoria.
4. LGPD.
5. Consolidado multiunidade.

Criterio de aceite:
Academia grande pode operar sem expor dados ou acoes indevidas.

## 6. Decisoes de produto ainda pendentes

Estas decisoes precisam ser fechadas antes das fases mais profundas:

1. Quais tipos de planos serao oficiais no MVP?
2. Reserva exige pagamento antes de confirmar ou pode ser confirmada sem pagamento por regra da academia?
3. Cancelamento gera credito, reembolso ou apenas historico?
4. Reposicao expira em quantos dias?
5. Aula experimental entra como lead, matricula provisoria ou evento de agenda?
6. O professor ve valores financeiros dos alunos?
7. Comissao de professor sera por aula, mensalidade, percentual ou valor fixo?
8. Cliente pode ter dependentes no MVP?
9. WhatsApp sera apenas `wa.me` inicialmente ou API oficial?
10. Gateway de pagamento alvo: Supabase/Stripe/Mercado Pago/Pagar.me/outro?
11. Precisa nota fiscal ou apenas recibo?
12. Multiunidade entra agora como arquitetura ou somente preparado?
13. Relatorios precisam exportar CSV no MVP?
14. POS precisa fechamento de caixa no MVP?
15. Nivel de jogador sera fixo por ranking, auto declarado ou definido por academia?
16. Jogos abertos terao simples e duplas desde o primeiro ciclo?

## 7. Riscos se continuar apenas com ajustes locais

- A agenda fica bonita, mas nao confiavel.
- Cliente continua duplicado entre aluno, socio, lead e pagador.
- Financeiro continua sendo stub sem autoridade.
- Professor continua sem ferramenta clara de rotina.
- Recepcao continua usando WhatsApp e planilha.
- Dono continua sem relatorio de negocio.
- Competicoes funcionam, mas nao viram produto profissional.
- Mobile Trabalho fica carregado demais.

## 8. Regra para proximas implementacoes

Antes de mexer em qualquer tela, responder:

1. Qual objeto operacional esta sendo tratado?
2. Qual e o ciclo de vida desse objeto?
3. Onde fica a lista?
4. Onde fica o detalhe lateral?
5. Onde fica o historico?
6. Qual acao primaria fecha o proximo passo?
7. Qual comunicacao e disparada?
8. Qual pagamento/recebivel nasce ou muda?
9. Quem pode fazer?
10. O que aparece no mobile?

Se a resposta for "so colocar um card", a solucao provavelmente esta errada.

## 9. Proxima queue sugerida

### COMPLETE-01 - Agenda e reserva como nucleo operacional

Corrigir calendario diario/semanal, drawer unico, status, pagamento, cancelamento, remarcacao, WhatsApp e historico.

Status em 2026-05-27: executado parcialmente no codigo e validado em desktop 1366.

- Calendario diario voltou a ser grade horizontal compacta com coluna Hora fixa, seis quadras visiveis e detalhe lateral.
- Calendario semanal passou a usar grade hora a hora por uma quadra selecionada, mantendo o mesmo padrao de detalhe lateral.
- O detalhe lateral foi consolidado como contrato visual para reserva/aula/bloqueio: status, pagamento, quadra, cliente, telefone, observacao, acoes e historico.
- A edicao de reserva saiu do popover quebrado e fica dentro do painel lateral, com campos compactos e acoes claras.
- Evidencias: `docs/screenshots/complete-01-agenda-validation-real/desktop-1366-work-agenda-dia.png` e `docs/screenshots/complete-01-agenda-validation-real/desktop-1366-work-agenda-semana.png`.

Pendencias ainda dentro do ciclo COMPLETE-01:

- Validar mobile 390/430 apos a grade compacta.
- Revalidar persistencia real de pagamento/cancelamento/remarcacao no banco quando a queue funcional retomar RPCs e migrations.
- Substituir labels remanescentes de "Avisar troca" por WhatsApp/remarcacao se o fluxo final exigir nomenclatura mais didatica.

### COMPLETE-02 - Player Jogar e Local Publico

Corrigir filtros UF/cidade/local, nivel fechado, detalhe de jogo aberto, duplas e resquicios visuais antigos no local publico.

Status em 2026-05-27: revisado e parcialmente executado.

- A tela `Jogar > Encontrar jogo` esta com filtros fechados para UF, cidade, local, nivel, tipo simples/duplas, periodo e status.
- A criacao de chamada usa nivel fechado e tipo de jogo, preservando simples como 2 jogadores e duplas como 4 jogadores.
- O popover de detalhes de chamada recebeu trava visual para nunca voltar ao balao branco legado.
- `Jogar > Reservar quadra` e `Ver locais` ja expõem opcoes de UF/cidade/local a partir dos locais existentes.
- A pagina publica de local foi revalidada no padrao dark compacto, sem blocos brancos antigos na primeira dobra.
- A migration `0101_profile_avatar_rls_v1.sql` foi aplicada no banco para desbloquear upload de foto de perfil.
- Evidencias: `docs/screenshots/complete-02-player-validation/desktop-1366-player-jogar-matches.png`, `desktop-1366-player-jogar-places.png`, `desktop-1366-player-local-publico.png` e `desktop-1366-player-profile.png`.

Pendencias ainda dentro do ciclo COMPLETE-02:

- Testar clique real em `Detalhes`, `Entrar`, upload de foto e reserva em mobile 390/430.
- Confirmar se o local publico precisa de detalhe lateral tambem nas secoes internas ou se a pagina focada por aba e suficiente.

### COMPLETE-03 - Cliente 360 fonte de verdade

Separar leads/ativos, consolidar aluno/socio/reservas/pagamentos/aulas/comunicacao em detalhe lateral/pagina.

Status aplicado nesta rodada:

- `PlaceActiveClientsModule` foi tratado como a fonte de verdade operacional do cliente: a lista compacta permanece para localizacao rapida e o painel lateral concentra dados pessoais, status, categoria, responsavel, metodo de pagamento, resumo do vinculo, planos/socio, contratos de aula, turmas, reservas recentes, pagamentos, pacotes/creditos e historico de relacionamento.
- Corrigida a fronteira de fluxo: o CTA `Novo cliente` nao abre mais a area de Alunos/Academia. Ele leva para `Leads`, onde o cadastro inicial de contato pertence. Acoes de `Abrir aulas`, `Abrir receita` e `Nova reserva` continuam apontando para suas superficies especializadas.
- Contrato de produto definido: `Clientes > Clientes ativos` e a central 360 sao a visao unificada da pessoa. `Academia > Alunos` deve ser apenas a lista academica/matriculas/turmas. `Financeiro` deve ser fila de cobranca/baixa, nao uma segunda base de clientes.
- Build validado apos a alteracao.

Pendente para endurecimento visual/futuro:

- Capturar novamente `Clientes ativos` em desktop e mobile apos a proxima varredura para confirmar que o painel lateral nao voltou a ocupar espaco excessivo.
- Evoluir filtros de cliente para realmente aplicar categoria/status, hoje parte do comportamento ainda e visual/placeholder.
- Quando o pagamento real entrar, substituir `Stub interno` por metodo real/checkout/webhook sem alterar a organizacao do Cliente 360.

### COMPLETE-04 - Academia/turmas/professores

Turmas compactas + detalhe lateral, reposicoes isoladas, professor agenda diaria, contratos/matriculas claros.

Status verificado nesta rodada:

- `Academia > Turmas` ja opera como lista compacta de entidade: busca/filtros no topo, linhas por turma, horario, professor/quadra, ocupacao/status e detalhe lateral persistente. O detalhe lateral concentra edicao de turma, mensalidade, alunos da turma, criacao de contrato/matricula, historico e acoes financeiras.
- `Academia > Alunos` ja opera como lista compacta de aluno/matricula com detalhe lateral `Aluno 360`, evitando modal central quebrado para edicao cotidiana.
- `Academia > Agenda` usa grade de dia por horario/quadra/turma; o professor usa agenda diaria por horario com turma, quadra, alunos, avisos previos e extras.
- O bloco de resumo operacional nao deve competir com Turmas/Alunos: a responsabilidade final fica assim:
  - `Hoje`: aulas do dia e execucao da aula;
  - `Agenda`: grade visual diaria da academia/professor;
  - `Turmas`: estrutura recorrente, vagas, mensalidade e matricula manual;
  - `Alunos`: aluno/matricula/contrato/evolucao;
  - `Pendencias`: interesses, reposicoes, avulsas e aprovacoes.

Pendente para endurecimento visual/futuro:

- Revalidar screenshot da aba `Turmas` com detalhe aberto em 1366/1600 para garantir que o drawer lateral nao retorne ao comportamento de modal central em nenhum breakpoint.
- Avaliar se `Nova turma ou horario aberto` deve virar botao primario contextual no topo da lista em vez de disclosure, mantendo configuracoes raras fora da rotina.
- Reposicoes e aula avulsa ainda precisam de uma fila mais executiva em `Pendencias`, com responsavel, prazo e CTA unico.

### COMPLETE-05 - Financeiro e planos

Recebiveis unificados, modal pagamento padrao, inadimplencia, contratos, pacotes, recibo e persistencia.

Status verificado nesta rodada:

- `Financeiro > Receber` ja funciona como console principal de cobranca: filtros por todos/vencidos/hoje/aulas/planos, busca, tabela compacta e detalhe lateral com valor, status, vencimento, periodo, descricao, acao `Pagar` e lembrete.
- O modal provisorio de pagamento esta centralizado em `PaymentStubDialog` e e reutilizado nos fluxos de jogador, agenda pessoal, local, reservas, mensalidades, torneios e ligas. O contrato atual e intencional: valor + detalhes + botao `Pagar`, substituivel por gateway/webhook depois sem mudar o ponto de entrada.
- A baixa manual usa `markStubPaymentPaidForParticipant`, com `target_type`, `target_id` e `billing_period`, e a migration existente cria unicidade por alvo/usuario/periodo. Com a migration aplicada, a baixa deve persistir e nao voltar para pendente no recarregamento.
- `Financeiro > Pagos`, `Despesas`, `Planos` e `Resumo` estao separados da fila diaria de cobranca. Isso evita misturar pagamento pessoal, receita do local, despesas e catalogo vendavel na mesma lista.
- `Planos` ja agrupa planos de socio, turmas mensais, creditos e aulas avulsas como catalogo financeiro, com detalhe lateral para venda/consumo de credito.

Pendencias ainda dentro do ciclo COMPLETE-05:

- Criar recibo/comprovante operacional apos `Pagar`, mesmo que simples, para fechar o ciclo de baixa manual.
- Adicionar conciliacao futura: origem do pagamento, metodo, operador, data, observacao e comprovante/anexo.
- Garantir por QA com banco real que a baixa de reserva, mensalidade de contrato, plano de socio e aula avulsa persiste apos reload para cada papel autorizado.
- A futura integracao de gateway deve substituir apenas a acao interna do modal, nao a organizacao de telas.

### COMPLETE-06 - Comunicacao e tarefas

Templates, historico, central de pendencias, dono, prazo e automacoes basicas.

Status verificado nesta rodada:

- `Comunicacao` ja possui central propria com fila por ponto operacional: reservas, lista de espera, aulas, financeiro e publicacao.
- A matriz de templates esta estruturada com modelos para reserva confirmada, pagamento confirmado, cancelamento, remarcacao com link, lista de espera, cobranca, mensalidade vencida, aviso de aula, ausencia/reposicao, inscricao em competicao, resultado pendente, comunicado de rodada, divulgacao da pagina publica e aviso geral.
- Os templates usam placeholders estaveis (`{nome}`, `{remetente}`, `{data}`, `{inicio}`, `{fim}`, `{quadra}`, `{link_remarcacao}`, `{opcoes}`, `{valor}` etc.), permitindo troca futura de conteudo sem quebrar o fluxo.
- WhatsApp continua contextual nas telas onde a acao nasce: reserva, espera, aluno, cobranca, professor e competicao. A central de comunicacao nao substitui o CTA local; ela organiza modelo, publicacao e fila.
- Cliente 360 possui historico de relacionamento/CRM, entao mensagens e notas do cliente ja tem um lugar conceitual para ficar.

Pendencias ainda dentro do ciclo COMPLETE-06:

- Falta entidade real de tarefa/pendencia com dono, prazo, status, prioridade e historico. Hoje as pendencias sao derivadas de modulos diferentes, nao um workflow assinalavel.
- Falta registrar automaticamente no historico do cliente quando uma mensagem WhatsApp e aberta/enviada pelo operador.
- Falta diferenciar `sugestao de mensagem` de `mensagem enviada` para evitar falsa auditoria.
- Falta automacao basica: criar tarefa apos reserva cancelada, pagamento vencido, pedido de reposicao aprovado, resultado pendente ou lead sem retorno.
- Futuro: quando WhatsApp API oficial entrar, manter os mesmos templates e trocar apenas o canal de envio/registro.

### COMPLETE-07 - Relatorios de decisao

Ocupacao, receita, inadimplencia, turmas, professores, clientes e eventos.

Status verificado nesta rodada:

- `Relatorios` ja existe como console executivo compacto, nao como dashboard decorativo. A tela usa periodo (`Hoje`, `Este mes`, `Periodo`, `Tudo`), exportacao CSV, metricas principais, tabela por modulo e drawer lateral com leitura e proxima acao sugerida.
- A leitura ja cobre os dominios centrais do SaaS atual: Agenda/Reservas, Academia, Financeiro, Clientes/CRM, Competicoes e Loja/POS quando o plano permite.
- O relatorio nao compete com a rotina diaria: ele aponta onde agir primeiro, mas a execucao continua nos modulos operacionais (`Agenda`, `Academia`, `Financeiro`, `Clientes`, `Competicoes`, `Loja/POS`).
- A logica ja respeita plano/produto: POS so entra quando o modulo esta ativo; plano atual aparece no console e pode ser alterado por quem gerencia o local.
- Exportacao atual e MVP util: gera CSV com metricas, modulos e picos/alertas, suficiente para primeira validacao operacional sem criar relatorio complexo antes dos fluxos centrais fecharem.

Pendencias ainda dentro do ciclo COMPLETE-07:

- Relatorios ainda sao majoritariamente derivados de dados em memoria da pagina. Para SaaS robusto, precisam virar consultas/RPCs ou views consolidadas por periodo, unidade, professor, turma e plano.
- Falta comparar periodos: hoje vs ontem, mes atual vs anterior, ocupacao por faixa horaria e tendencia de inadimplencia.
- Falta relatorio especifico de professor: aulas dadas, alunos ativos, reposicoes, faltas avisadas, comissoes e ocupacao de turmas.
- Falta relatorio especifico de cliente/aluno: origem, plano, frequencia, historico de pagamentos, cancelamentos, reposicoes e valor gerado.
- Falta relatorio financeiro com aging real, conciliacao, metodo de pagamento, operador, recibo e exportacao por categoria.
- Falta relatorio de competicoes com inscricoes, pagamentos, jogos pendentes, resultados, uso de quadras e encerramento.
- Falta permissao de leitura especifica para relatorios: hoje `Relatorios` fica ligado ao owner/manager, mas o produto futuro pode precisar de leitura parcial para financeiro ou gestor de unidade.

### COMPLETE-08 - Permissoes/auditoria/multiunidade

Papéis por unidade, acoes granulares, logs e estrutura para crescimento.

Status verificado nesta rodada:

- Existe modelo de papel por unidade/local via `place_staff` e `placeResourceAccess`: `owner`, `manager`, `frontdesk`, `coach`, `finance`, `cashier`.
- A navegacao de trabalho ja deriva os modulos pelo papel e pelo plano do local:
  - `finance` cai somente em Financeiro quando nao e gestor;
  - `cashier` cai somente em Loja/POS quando nao e gestor;
  - `coach` nao recebe Agenda/Reservas administrativa e opera Academia;
  - owner/manager ve a superficie completa.
- Existem RPCs/policies de banco para fronteiras principais:
  - `app_place_staff_role`;
  - `app_can_manage_place`;
  - `app_can_manage_place_bookings`;
  - `app_can_manage_place_academy`;
  - `app_can_manage_place_finance`;
  - policies de leitura/alteracao para reservas, quadras, aulas, matriculas, presenca e pagamentos ligados a membership.
- Existem roles especificas de torneio: `owner`, `organizer`, `scorekeeper`, `checkin`, `media`, com RPCs para inscritos, partidas/resultados e comunicacao.
- `Equipe` e `Administracao > Permissoes` ja existem como lugar conceitual para convites, papeis e acesso operacional, deixando configuracao fora da rotina diaria.
- O seletor de unidade/local existe no topo do Trabalho e permite trocar o contexto ativo, preservando a diretriz de nao editar dados de uma unidade sem clareza de onde esta.

Pendencias ainda dentro do ciclo COMPLETE-08:

- Permissao ainda e por papel amplo, nao por acao granular. Exemplo: `frontdesk` gerencia reservas, mas o produto futuro pode precisar separar criar, cancelar, remarcar, bloquear, marcar pago e ver telefone.
- `finance` no frontend pode gerenciar financeiro, mas a migration antiga `app_can_manage_place_finance` ainda permite apenas owner/manager em alguns pontos de RLS. Isso precisa ser revisado no banco para evitar divergencia entre UI e permissao real.
- Falta auditoria persistente: quem criou, editou, cancelou, marcou pago, enviou WhatsApp, aceitou inscricao, alterou turma, mudou plano, removeu staff ou publicou resultado.
- Falta log amigavel por entidade: reserva, cliente, contrato, pagamento, turma, torneio, liga, produto e configuracao.
- Falta permissao por unidade para redes: hoje existe `organization_id` e plano `multi_unit`, mas ainda nao ha cockpit consolidado de organizacao, comparativo entre unidades, permissoes por grupo de unidades ou relatorio consolidado.
- Falta matriz visual de permissoes editavel no SaaS: `Equipe > Papeis` ainda e mais explicativo do que configuravel.
- Falta fluxo de convite mais completo: expiracao, reenvio, cancelamento com motivo, aceite auditado e historico de alteracao de papel.
- Falta camada LGPD/seguranca: exportacao de dados pessoais, consentimentos, retencao, exclusao, trilha de acesso a dados sensiveis e politicas para fotos/documentos.

## 10. Conclusao

O ATP tem funcoes suficientes para iniciar a transicao para um SaaS completo, mas ainda nao tem todos os fundamentos empresariais fechados.

O maior salto agora nao e desenhar novas telas isoladas. E fechar os ciclos operacionais:

- reserva nasce, paga, confirma, muda, comunica e entra no historico;
- cliente entra, vira aluno/socio, paga, agenda, participa, recebe mensagens e tem timeline;
- aula/turma tem professor, horario, quadra, alunos, contrato, reposicao e historico;
- financeiro sabe de onde veio cada valor e o que esta vencido;
- competicao ocupa quadras, recebe inscricao, cobra, comunica, gera jogos e encerra com relatorio.

Quando esses ciclos estiverem fechados, o app deixa de parecer uma colecao de modulos e passa a operar como ferramenta central da academia.
