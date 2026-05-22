# SaaS Master Blueprint Completo

Status: documento-mae de produto e arquitetura operacional
Data: 2026-05-22
Escopo: Work SaaS Web, Work Mobile Operacional e fronteiras com Player App

## 0. Objetivo deste documento

Este documento define a arquitetura completa alvo do ATP como SaaS empresarial para academias, clubes, professores, torneios, ligas, quadras, alunos, financeiro, equipe e operacao diaria.

Ele existe para impedir implementacoes parciais que depois nao encaixam no restante do produto.

Antes de qualquer sprint estrutural, a implementacao deve responder a este blueprint:

- Qual dominio do SaaS esta sendo alterado?
- Qual persona usa?
- Qual fluxo ponta a ponta esta sendo melhorado?
- Qual tela ou contrato de tela esta sendo criado?
- Qual entidade esta sendo manipulada?
- E web, mobile ou ambos?
- O que ja existe e pode ser reaproveitado?
- O que falta tecnicamente?
- Qual rota antiga precisa continuar funcionando?
- Qual criterio de aceite prova que o fluxo ficou melhor?

## 1. Visao do produto

O ATP deve operar em tres superficies claras:

1. Player App
   - Experiencia simples do jogador/aluno/socio.
   - Reservas pessoais, aulas pessoais, pagamentos pessoais, partidas, torneios, ligas, ranking, perfil.

2. Work SaaS Web
   - Plataforma completa de gestao empresarial.
   - Usada por dono, gestor, recepcao, financeiro, caixa, professor no planejamento, organizador e administradores.

3. Work Mobile Operacional
   - Camada rapida de execucao.
   - Usada para hoje, agenda do dia, aulas, resultados, check-ins, cobrancas simples, venda rapida, avisos e pendencias.

O Player App deve continuar leve. O Work SaaS Web deve ganhar porte de SaaS profissional. O Work Mobile nao deve virar uma copia reduzida do web.

## 2. Principios estruturais

### 2.1. Produto alvo antes da base atual

A base atual do app e insumo tecnico, nao limite conceitual. Se a estrutura atual estiver errada, o produto alvo vence.

### 2.2. Reaproveitar sem se prender

Ordem de preferencia:

1. Reorganizar o que ja existe.
2. Reutilizar dados, RPCs, loaders e componentes.
3. Criar composicoes novas.
4. Criar pequenos ajustes tecnicos.
5. Criar estrutura nova apenas quando indispensavel.

### 2.3. Fluxo antes de menu

Menus devem nascer dos fluxos. Um colaborador nao entra para "ver modulos"; ele entra para resolver um trabalho.

### 2.4. Web e gestao profunda

Web deve ter:

- listas salvas;
- filtros;
- calendario;
- tabelas;
- detalhe lateral;
- paginas 360;
- relatorios;
- configuracoes;
- auditoria futura;
- multiunidade futura;
- busca global.

### 2.5. Mobile e execucao rapida

Mobile deve ter:

- hoje;
- proxima acao;
- cards curtos;
- detalhe simples;
- CTA claro;
- notificacoes acionaveis;
- poucas abas.

### 2.6. Configuracao fora da rotina

Setup raro, regras, permissoes, recursos e acoes destrutivas nao devem competir com operacao diaria.

### 2.7. Historico fecha o ciclo

Reserva, pagamento, aluno, aula, torneio, liga e cliente precisam de historico. Sem historico, o sistema nao vira SaaS confiavel.

### 2.8. Comunicacao e acao operacional

WhatsApp, avisos e notificacoes devem aparecer no ponto certo do fluxo: cobranca, remarcacao, cancelamento, resultado, aula, torneio.

## 3. Referencias de SaaS aplicadas

O ATP deve aprender, nao copiar literalmente, com padroes de:

- Salesforce: workspaces/apps, objetos, list views, kanban, acoes globais, busca global, detalhe de registro.
- Shopify: home operacional, proximos passos, indicadores acionaveis.
- Stripe: separacao clara entre pagamentos, clientes, produtos, billing e relatorios.
- HubSpot: CRM, contatos, pipelines, tarefas, automacoes e relatorios.
- Square Appointments: calendario como centro da operacao, clientes, equipe, pagamentos.
- CourtReserve: reservas, clubes, membros, ligas, eventos, billing e app.
- Wodify: aulas, membros, pagamentos recorrentes e app do aluno.

Aplicacao ao ATP:

- Clientes, Reservas, Aulas, Pagamentos, Torneios e Ligas devem ser objetos operacionais.
- Cada objeto precisa de lista, filtros, detalhe, historico e acoes.
- A home de trabalho precisa apontar o que fazer agora.
- Busca global e criar rapido devem reduzir dependencia de menus.
- Configuracao e relatorio devem ficar separados da operacao.

## 3.1. Decisoes fechadas por media de mercado

Estas decisoes seguem o padrao medio de SaaS profissionais analisados: CRM/Customers como dominio de relacionamento, Calendar/Schedule como centro operacional, web como dashboard completo e mobile como camada operacional.

### Nome do dominio de relacionamento

Decisao:
O menu principal sera `Clientes`.

Justificativa:
SaaS profissionais tendem a usar termos orientados ao negocio e ao usuario final, como Customers, Contacts, Leads, Accounts ou Clients. Para a operacao da academia, `Clientes` e mais claro que `Pessoas` para recepcao, financeiro e gestor.

Regra:
`Pessoa` continua sendo a entidade conceitual interna. `Clientes` e o nome da area do produto.

Subareas:

- Leads
- Clientes ativos
- Alunos
- Socios
- Responsaveis
- Historico
- Cliente 360

### Nome do dominio de calendario

Decisao:
O menu principal sera `Agenda`.

Justificativa:
Sistemas profissionais de agendamento usam Calendar, Schedule ou Agenda como centro de trabalho. `Agenda e Recursos` e correto tecnicamente, mas pesado como label de menu.

Regra:
Dentro de `Agenda` ficam recursos e quadras quando forem relevantes.

Subareas:

- Calendario
- Reservas
- Aulas no calendario
- Bloqueios
- Quadras
- Regras de disponibilidade

### Nome da area pessoal no Player App

Decisao:
No Player App, o menu sera `Rotina` e a pagina tera titulo `Minha rotina`.

Justificativa:
A area junta agenda, aulas, partidas, pagamentos pessoais e historico. `Agenda` fica estreito demais para incluir pagamentos. `Rotina` e curto para nav mobile e comunica melhor o conjunto.

Rotas antigas:
`/agenda`, `/minhas-reservas`, `/minhas-partidas`, `/minhas-aulas` e `/meus-pagamentos` continuam como alias/filtros.

### Unidade/local ativo

Decisao:
O seletor de unidade/local ativo entra ja na primeira fase do shell web.

Justificativa:
Um dos problemas atuais e confusao quando ha mais de uma academia/local. SaaS profissional deixa o contexto ativo visivel cedo.

### Ordem de implantacao web/mobile

Decisao:
Implementar web SaaS antes do mobile trabalho.

Justificativa:
O web define os dominios completos, entidades, listas, detalhes e configuracoes. O mobile deve herdar a logica operacional correta, nao carregar a estrutura antiga.

Regra:
Mesmo implementando web primeiro, todo contrato de tela deve registrar o comportamento mobile futuro.

### Modal provisorio de pagamento

Decisao:
Todo ponto que exigir pagamento deve usar um modal padrao provisorio.

Conteudo minimo:

- Origem do pagamento.
- Nome do cliente/aluno/jogador.
- Descricao.
- Valor.
- Vencimento/status, se houver.
- Botao primario: `Pagar` ou `Marcar como pago`.

Comportamento agora:
O botao converte o item para pago usando a logica stub atual.

Comportamento futuro:
O mesmo modal vira entrada para Edge Function, checkout, webhook e conciliacao.

### WhatsApp operacional

Decisao:
WhatsApp deve abrir com mensagem profissional pronta e, quando houver pessoa/cliente vinculado, registrar interacao simples no historico.

Justificativa:
SaaS/CRM profissional trata comunicacao como parte do historico do cliente, nao apenas link solto.

Primeira implementacao aceitavel:
Abrir WhatsApp com template e registrar evento simples quando a estrutura atual permitir. Se nao houver registro ainda, deixar o ponto de extensao documentado.

## 4. Personas e modo de uso

### 4.1. Dono / Administrador principal

Uso principal:
Web.

Precisa:
Saude do negocio, receita, inadimplencia, ocupacao, alunos, professores, equipe, competicoes, configuracoes e relatorios.

Primeira tela:
Painel executivo com alertas e caminho para resolver.

Nao precisa:
Executar tarefas repetitivas do dia, salvo intervencao.

### 4.2. Gestor operacional

Uso principal:
Web + mobile.

Precisa:
Agenda, conflitos, reservas, aulas, professores, alunos, pendencias, comunicacao e competicoes locais.

Primeira tela:
Operacao de Hoje.

### 4.3. Recepcao / Secretaria

Uso principal:
Web.

Precisa:
Agenda clicavel, busca de pessoa, nova reserva, editar/cancelar/remarcar, pagamento simples, WhatsApp, lista de espera contextual.

Primeira tela:
Agenda do dia ou atendimento rapido.

### 4.4. Financeiro

Uso principal:
Web.

Precisa:
Recebiveis, vencidos, pagos, despesas, planos, mensalidades, pacotes, inscricoes, comissoes, relatorios.

Primeira tela:
Receber/Vencidos.

### 4.5. Caixa / POS

Uso principal:
Tablet/mobile + web.

Precisa:
Venda rapida, produtos, estoque, vendas do dia, cancelamento com permissao.

Primeira tela:
Vender.

### 4.6. Professor

Uso principal:
Mobile no dia a dia, web no planejamento.

Precisa:
Aulas do dia por horario, turma, alunos, quadra, observacoes, faltas avisadas, reposicoes, evolucao.

Primeira tela:
Hoje do professor.

Regra importante:
Chamada/presenca so aparece se a empresa exigir. Padrao desligado.

### 4.7. Professor autonomo

Uso principal:
Web simples + mobile.

Precisa:
Agenda, alunos, aulas, pagamentos, pacotes, comunicacao, evolucao.

### 4.8. Organizador de torneios/ligas

Uso principal:
Web para montar, mobile para evento.

Precisa:
Criar competicao, inscricoes, pagamentos, jogadores, chaves/rodadas, resultados, classificacao, comunicacao, encerramento.

Primeira tela:
Competicoes com bloqueios por fase.

### 4.9. Staff de evento

Uso principal:
Mobile.

Precisa:
Check-in, placar, resultado, comunicacao ou midia conforme papel.

### 4.10. Jogador / Aluno / Socio

Uso principal:
Player App mobile.

Precisa:
Jogar, reservar, aulas pessoais, pagamentos pessoais, competir, ranking, historico, perfil.

Nao deve ver:
Gestao do local, financeiro do local, equipe, configuracoes.

### 4.11. Usuario multi-papel

Precisa:
Seletor Jogador/Trabalho claro, unidade ativa clara e contexto persistente.

## 5. Modelo conceitual de entidades

### 5.1. Organizacao

Representa a empresa/grupo.

Relacoes:
Unidades, colaboradores, configuracoes globais, relatorios consolidados.

Futuro:
Multiunidade, permissoes globais, billing da organizacao.

### 5.2. Unidade / Local

Representa academia, clube ou local fisico.

Relacoes:
Quadras, agenda, equipe, alunos, reservas, aulas, financeiro local, competicoes.

### 5.3. Pessoa

Entidade central para lead, cliente, aluno, socio, responsavel, professor ou colaborador.

Regra:
Nao duplicar mentalmente "cliente", "aluno" e "socio" como cadastros isolados. Eles sao papeis/status de uma pessoa.

### 5.4. Lead

Pessoa ou oportunidade ainda nao convertida.

Precisa:
Origem, responsavel, status, proximo contato, historico.

### 5.5. Cliente ativo

Pessoa com relacao ativa: reserva, aula, plano, socio, pagamento ou participacao.

### 5.6. Aluno

Pessoa com matricula, aula, turma, contrato, reposicao ou evolucao.

### 5.7. Socio / Mensalista

Pessoa com plano ativo, beneficio ou recorrencia.

### 5.8. Professor

Pessoa com papel profissional.

Relacoes:
Aulas, turmas, alunos, agenda, comissoes, disponibilidade.

### 5.9. Colaborador

Pessoa com acesso operacional.

Relacoes:
Papel, unidade, permissoes futuras, convites, historico.

### 5.10. Quadra / Recurso

Recurso agendavel.

Relacoes:
Reservas, aulas, bloqueios, competicoes, precos, regras.

### 5.11. Reserva

Uso de recurso por cliente/jogador.

Estados alvo:
Rascunho, aguardando pagamento, confirmada, cancelada, remarcacao solicitada, remarcada, concluida, no-show.

### 5.12. Aula / Turma

Atividade recorrente ou pontual de ensino.

Relacoes:
Professor, alunos, quadra, horario, plano, reposicoes, evolucao.

### 5.13. Matricula / Contrato

Vinculo do aluno com aula/turma/plano.

Relacoes:
Pagamento, frequencia opcional, reposicoes, status.

### 5.14. Pagamento / Recebivel

Obrigacao financeira.

Origem:
Reserva, mensalidade, pacote, inscricao, produto, credito, despesa negativa.

### 5.15. Produto / Venda POS

Produto vendido e transacao de caixa.

### 5.16. Torneio

Evento competitivo com fases.

Estados:
Rascunho, inscricoes abertas, inscricoes encerradas, jogos gerados, em andamento, finalizado.

### 5.17. Liga

Competicao recorrente por rodadas/temporadas.

Estados:
Configuracao, inscricoes/participantes, rodada ativa, entre rodadas, encerramento, historico.

### 5.18. Comunicacao

Mensagem, aviso, WhatsApp, notificacao ou template.

### 5.19. Relatorio

Visao consolidada para decisao.

### 5.20. Configuracao

Regras, disponibilidade, planos, permissoes futuras, publicacao, recursos e avancado.

## 6. Work SaaS Web - arquitetura alvo

### 6.1. Topbar

Itens:

- Logo.
- Seletor Jogador/Trabalho.
- Organizacao/unidade ativa.
- Busca global.
- Criar rapido.
- Notificacoes.
- Usuario e papel ativo.

Busca global deve encontrar:
Pessoa, aluno, cliente, reserva, pagamento, turma, professor, torneio, liga.

Criar rapido deve permitir:
Reserva, pessoa, aluno, pagamento, aula/turma, torneio, produto.

### 6.2. Sidebar por dominios

1. Inicio
2. Agenda
3. Clientes
4. Academia
5. Financeiro
6. Competicoes
7. Loja/POS
8. Comunicacao
9. Relatorios
10. Administracao

Cada dominio pode ter subnavegacao interna, mas nao deve virar arvore infinita.

## 7. Contratos dos dominios web

### 7.1. Inicio / Operacao

Pergunta:
O que precisa ser resolvido agora?

Usuarios:
Dono, gestor, recepcao, professor, financeiro, caixa, organizador.

Primeira dobra:
Pendencias por papel, proxima agenda relevante, alertas criticos.

CTAs:
Resolver pendencia, abrir agenda, cobrar, ver aula, lancar resultado, vender.

Nunca aparece:
Configuracao rara como card principal.

Paginas:
Hoje, Pendencias, Atividade recente.

Mobile:
Home por papel.

### 7.2. Agenda

Pergunta:
Quando e onde algo acontece?

Usuarios:
Recepcao, gestor, professor, dono.

Primeira dobra:
Calendario com data, visao, filtros e recursos visiveis.

Paginas:

- Calendario
- Reservas
- Bloqueios
- Quadras/Recursos
- Regras de disponibilidade

List views:

- Hoje
- Semana
- Por quadra
- Reservas pagas
- Reservas pendentes
- Canceladas
- Remarcacoes

Detalhe:
Reserva, aula, bloqueio, slot livre.

CTAs:
Nova reserva, criar bloqueio, remarcar, cancelar, cobrar, enviar WhatsApp.

Mobile:
Dia/lista com acoes rapidas.

### 7.3. Clientes

Pergunta:
Quem e essa pessoa e qual relacao ela tem com a academia?

Usuarios:
Recepcao, gestor, financeiro, professor, dono.

Paginas:

- Leads
- Clientes ativos
- Alunos
- Socios
- Responsaveis
- Clientes arquivados
- Pessoa 360

Pessoa 360 deve mostrar:

- dados;
- status;
- relacionamento;
- reservas;
- aulas;
- matriculas;
- pagamentos;
- interacoes;
- comunicacao;
- historico;
- observacoes.

CTAs:
Novo lead, novo cliente, matricular, cobrar, enviar WhatsApp, criar reserva.

Mobile:
Busca e detalhe resumido.

### 7.4. Academia

Pergunta:
Como estao aulas, turmas, alunos e professores?

Usuarios:
Gestor, professor, recepcao, dono.

Paginas:

- Aulas
- Turmas
- Matriculas
- Reposicoes
- Evolucao
- Professores no contexto de aula
- Configuracoes academicas

Primeira dobra:
Pendencias de aulas, turmas ativas, reposicoes e agenda de hoje.

CTAs:
Criar turma, matricular aluno, abrir aula, registrar evolucao, resolver reposicao.

Regra de chamada:
Configuracao "exigir chamada" padrao desligado. Quando off, professor nao ve CTA de chamada como tarefa obrigatoria.

Mobile professor:
Hoje por horario cheio.

### 7.5. Financeiro

Pergunta:
Quem deve, quem pagou, o que vence e qual a saude financeira?

Usuarios:
Financeiro, dono, gestor.

Paginas:

- Receber
- Vencidos
- Pagos
- Despesas
- Planos e pacotes
- Mensalidades
- Comissoes
- Relatorios financeiros

Objetos financeiros:
Recebivel, pagamento, despesa, plano, pacote, comissao, lembrete.

CTAs:
Cobrar, marcar pago, registrar despesa, criar plano, enviar WhatsApp, exportar.

Mobile:
Cobrar e marcar pago simples.

### 7.6. Competicoes

Pergunta:
Quais torneios e ligas precisam de acao?

Usuarios:
Organizador, dono, gestor, staff de evento.

Paginas:

- Hub de competicoes
- Torneios
- Ligas
- Inscricoes
- Jogos/resultados
- Comunicacao
- Relatorios

Torneio por fase:

- Rascunho: completar configuracao.
- Inscricoes abertas: revisar inscritos, pagamentos e link.
- Inscricoes encerradas: gerar jogos.
- Jogos gerados: publicar tabela.
- Em andamento: resultados, atrasos e W/O.
- Finalizado: campeoes, relatorio e publicacao final.

Liga por fase:

- Configuracao: regras e classes.
- Participantes: inscricoes e aprovacoes.
- Rodada ativa: jogos, chat, resultados.
- Entre rodadas: pendencias e gerar proxima.
- Encerramento: ranking final.
- Historico: consulta.

Mobile:
Resultado, check-in, comunicacao e pendencias.

### 7.7. Loja/POS

Pergunta:
Como vender e controlar itens rapidamente?

Usuarios:
Caixa, gestor, dono.

Paginas:

- Vender
- Vendas do dia
- Produtos
- Estoque
- Fechamento

CTAs:
Finalizar venda, cancelar venda, cadastrar produto, ajustar estoque.

Mobile:
Venda rapida.

### 7.8. Comunicacao

Pergunta:
Quem precisa ser avisado e sobre o que?

Usuarios:
Recepcao, financeiro, gestor, organizador.

Paginas:

- WhatsApp
- Modelos
- Avisos
- Notificacoes
- Historico

Templates iniciais:

- Confirmacao de reserva.
- Cancelamento de reserva.
- Pedido de remarcacao.
- Cobranca.
- Aviso de aula.
- Aviso de torneio.
- Resultado/rodada.

### 7.9. Relatorios

Pergunta:
O que esta acontecendo no negocio?

Usuarios:
Dono, gestor, financeiro.

Paginas:

- Ocupacao
- Receita
- Inadimplencia
- Alunos
- Professores
- Reservas
- Aulas
- Competicoes
- POS

### 7.10. Administracao

Pergunta:
Como configurar e controlar a estrutura?

Usuarios:
Dono, admin, gestor autorizado.

Paginas:

- Organizacao
- Unidades
- Equipe
- Permissoes futuras
- Quadras e recursos
- Regras
- Planos
- Publicacao
- Integracoes
- Auditoria
- Avancado

Nunca aparece:
Como tarefa diaria para recepcao/professor.

## 8. Player App - fronteira

Player App deve ter:

- Inicio
- Jogar
- Competir
- Minha Rotina
- Perfil

Minha Rotina engloba:

- Reservas pessoais
- Partidas
- Aulas
- Pagamentos pessoais
- Historico

Nao deve ter:

- Financeiro do local
- Equipe
- Configuracoes de academia
- Operacao de torneio, salvo se usuario trocar para Trabalho ou tiver papel de staff dentro de contexto explicito.

## 9. Work Mobile Operacional

### 9.1. Professor

Nav:
Hoje, Agenda, Turmas, Alunos, Perfil.

Home:
Aulas do dia por horario cheio.

Cards:
Horario, turma, alunos, quadra, observacao, faltas avisadas, reposicoes.

Acoes:
Abrir aula, registrar observacao, abrir aluno, avisar responsavel, reposicao.

### 9.2. Recepcao

Nav:
Hoje, Agenda, Reservas, Clientes, Mais.

Home:
Reservas proximas, conflitos, lista de espera contextual, busca de pessoa.

Acoes:
Nova reserva, editar/cancelar, WhatsApp, abrir pessoa.

### 9.3. Financeiro

Nav:
Receber, Vencidos, Pagos, Resumo, Perfil.

Home:
Vencidos e recebiveis de hoje.

Acoes:
Cobrar, marcar pago, enviar WhatsApp.

### 9.4. Caixa

Nav:
Vender, Hoje, Estoque, Produtos, Perfil.

Home:
Venda rapida.

Acoes:
Adicionar item, finalizar, cancelar com permissao.

### 9.5. Organizador

Nav:
Hoje, Torneios, Ligas, Resultados, Perfil.

Home:
Competicoes com bloqueio.

Acoes:
Aprovar inscricao, check-in, lancar resultado, publicar aviso.

### 9.6. Gestor

Nav:
Hoje, Agenda, Clientes, Financeiro, Mais.

Home:
Pendencias criticas.

Acoes:
Abrir maior bloqueio, delegar, aprovar, acompanhar.

## 10. Fluxos ponta a ponta obrigatorios

### 10.1. Reserva paga

1. Usuario escolhe horario.
2. Sistema valida disponibilidade.
3. Sistema mostra valor.
4. Usuario paga ou recepcao marca pagamento.
5. Reserva vira confirmada.
6. Confirmação por WhatsApp/notificacao.
7. Reserva aparece na agenda do local e Minha Rotina.
8. Se alterar, segue fluxo de remarcacao.
9. Se cancelar, segue regra e comunica.

### 10.2. Remarcacao de reserva

1. Admin abre reserva.
2. Clica solicitar remarcacao.
3. Sistema gera link unico para agenda de alternativas.
4. Cliente escolhe novo horario.
5. Sistema valida pagamento ja feito e disponibilidade.
6. Reserva e atualizada.
7. Historico registra mudanca.
8. WhatsApp confirma.

### 10.3. Atendimento de recepcao

1. Busca pessoa.
2. Ve status 360.
3. Cria reserva, matricula ou cobranca.
4. Envia comunicacao.
5. Proximo passo fica registrado.

### 10.4. Matricula em aula

1. Gestor cria turma com professor, horario, quadra e valor.
2. Recepcao abre pessoa.
3. Matricula aluno.
4. Gera pagamento/mensalidade.
5. Aluno ve aula em Minha Rotina.
6. Professor ve aula no Hoje.

### 10.5. Falta avisada e reposicao

1. Aluno avisa falta antes do prazo.
2. Sistema verifica regra.
3. Gera credito ou pedido de reposicao.
4. Gestor/professor ve pendencia.
5. Reposicao e encaixada.
6. Historico do aluno atualiza.

### 10.6. Cobranca

1. Financeiro abre vencidos.
2. Seleciona cliente.
3. Envia WhatsApp ou link.
4. Recebe.
5. Marca pago.
6. Historico e resumo atualizam.

### 10.7. Torneio completo

1. Criar torneio.
2. Configurar classes, regras, local, pagamentos.
3. Abrir inscricoes.
4. Aprovar inscritos e pagamentos.
5. Encerrar inscricoes.
6. Gerar jogos.
7. Publicar tabela.
8. Operar resultados.
9. Resolver pendencias/W.O.
10. Publicar campeoes.
11. Gerar relatorio.

### 10.8. Liga completa

1. Criar liga.
2. Configurar classes/regras.
3. Abrir participantes.
4. Aprovar.
5. Gerar rodada.
6. Participantes combinam/registram resultados.
7. Owner valida pendencias.
8. Gerar proxima rodada.
9. Encerrar temporada.
10. Publicar ranking final.

### 10.9. POS

1. Caixa abre vender.
2. Seleciona produtos.
3. Confirma pagamento.
4. Estoque baixa.
5. Venda entra no resumo.

## 11. Contratos de tela principais

### 11.1. Trabalho Hoje

Usuario primario:
Todos, com conteudo por papel.

Pergunta:
O que preciso resolver agora?

Primeira dobra:
Pendencias, proxima agenda, CTA principal.

Nunca aparece:
Configuracoes raras.

### 11.2. Agenda Geral

Usuario primario:
Recepcao/gestor.

Pergunta:
O que esta ocupado, livre ou em conflito?

Primeira dobra:
Calendario com data, filtros, recursos e slots.

CTA:
Criar reserva/bloqueio/aula.

### 11.3. Reserva detalhe

Usuario primario:
Recepcao/gestor.

Pergunta:
O que posso fazer com esta reserva?

Dados:
Cliente, telefone, quadra, horario, valor, pagamento, participantes, historico.

CTAs:
Editar, cancelar, remarcar, cobrar, WhatsApp.

### 11.4. Cliente 360

Usuario primario:
Recepcao/gestor.

Pergunta:
Quem e esta pessoa e qual acao devo tomar?

Dados:
Perfil, status, tags, reservas, aulas, pagamentos, interacoes, historico.

CTAs:
Nova reserva, matricular, cobrar, WhatsApp, editar.

### 11.5. Aula/Turma detalhe

Usuario primario:
Gestor/professor.

Pergunta:
Quem participa, quando acontece e o que precisa de acao?

Dados:
Professor, alunos, horario, quadra, status, reposicoes, observacoes.

CTAs:
Editar, matricular aluno, registrar observacao, resolver reposicao.

### 11.6. Financeiro Receber

Usuario primario:
Financeiro.

Pergunta:
Quem precisa pagar?

Dados:
Cliente, origem, vencimento, valor, status, tentativas.

CTAs:
Cobrar, marcar pago, abrir pessoa.

### 11.7. Torneio Cockpit

Usuario primario:
Organizador.

Pergunta:
O que falta resolver nesta fase?

Dados:
Fase, bloqueios, inscritos, pagamentos, jogos, resultados, comunicacao.

CTA:
Muda por fase.

### 11.8. Liga Cockpit

Usuario primario:
Owner/organizador.

Pergunta:
Qual pendencia da rodada/temporada?

Dados:
Rodada, participantes, resultados pendentes, classificacao.

CTA:
Gerar rodada, validar resultado, publicar.

## 12. Mapa de aproveitamento tecnico

### 12.1. Ja existe e deve ser reaproveitado

- Rotas principais do player e trabalho.
- Reservas, waitlist, remarcacao por token.
- Aulas, turmas, professores, matriculas, reposicoes, evolucao.
- CRM contacts/interactions.
- Memberships, credit packages, POS, expenses.
- Staff/invites.
- Torneios, inscricoes, staff, chat, resultados.
- Ligas, rodadas, resultados, chat, disponibilidade.
- Pagamentos stub.
- Agenda pessoal unificada.

### 12.2. Precisa nova composicao forte

- Shell SaaS web.
- Calendario central.
- Pessoa 360.
- Financeiro empresarial.
- Competicoes cockpit por fase.
- Mobile trabalho por papel.

### 12.3. Pode exigir backend pequeno

- Historico/auditoria por entidade.
- Estados de reserva mais completos.
- Templates/log de WhatsApp.
- Pagamento padrao mais formal.
- Relatorios consolidados.
- Permissoes refinadas.

### 12.4. Nao implementar agora

- Gateway real completo.
- Automacoes avancadas.
- Multiunidade profunda.
- Auditoria completa.
- CRM avancado.
- Permissoes comerciais/plano final.

## 13. Rotas e compatibilidade

Rotas publicas e legadas nao podem quebrar:

- `/join`
- `/inscricao/:tournamentId`
- `/t/:tournamentId`
- `/eventos`
- `/eventos/ligas/:leagueId`
- `/reservas/alteracao/:token`
- `/minhas-reservas`
- `/minhas-partidas`
- `/minhas-aulas`
- `/meus-pagamentos`
- `/locais/:placeId/admin`
- `/gestao/:placeId/:module`

Nova arquitetura pode usar wrappers, redirects ou aliases.

## 14. Implantacao macro

### Fase A - Congelar blueprint

Entregavel:
Este documento validado.

### Fase B - Shell SaaS web

Objetivo:
Criar estrutura por dominios sem mexer profundamente nos fluxos.

### Fase C - Agenda/Reservas

Objetivo:
Calendario central e reserva completa.

### Fase D - Clientes 360

Objetivo:
Centralizar cliente/aluno/socio/lead.

### Fase E - Academia

Objetivo:
Turmas, aulas, professor e reposicao claros.

### Fase F - Financeiro

Objetivo:
Receber, vencidos, pagos, despesas, planos e modal pagamento.

### Fase G - Competicoes

Objetivo:
Torneio/liga por fase e papel.

### Fase H - Mobile Trabalho

Objetivo:
Home e nav por papel operacional.

### Fase I - Relatorios, comunicacao e historico

Objetivo:
Maturidade empresarial.

### Fase J - Permissoes, planos e escalabilidade

Objetivo:
Controle fino depois dos fluxos estarem corretos.

## 15. Criterios de aceite do blueprint

O blueprint e suficiente para iniciar implementacao quando:

- Todos os dominios estao definidos.
- Todas as personas principais tem primeira tela e fluxo.
- Web e mobile estao separados.
- Entidades centrais estao claras.
- Rotas antigas estao protegidas.
- Primeiras fases sao independentes e encaixam no todo.
- Funcoes atuais tem destino.
- Lacunas tecnicas estao classificadas.

## 16. Decisoes ainda necessarias antes da primeira sprint

As decisoes abaixo foram detalhadas para permitir implantacao sem improviso.

### 16.1. Cliente 360 - primeira entrega

Objetivo:
Criar uma tela central para recepcao, gestor, financeiro e professor entenderem rapidamente quem e o cliente/aluno/socio e qual acao deve ser tomada, sem transformar cadastro em burocracia pesada.

Regra de cadastro:
O cadastro deve ser progressivo. Para criar uma pessoa/cliente rapidamente, exigir apenas:

- Nome.
- Telefone ou e-mail, sendo telefone o preferencial para operacao via WhatsApp.
- Tipo inicial: lead, cliente, aluno, socio ou responsavel.

Campos opcionais na primeira criacao:

- Data de nascimento.
- CPF/documento.
- Responsavel vinculado.
- Observacoes.
- Tags.
- Origem do lead.

Campos que nao devem bloquear cadastro inicial:

- Endereco completo.
- Documento obrigatorio.
- Foto.
- Dados financeiros completos.
- Contrato completo.
- Preferencias avancadas.

Estrutura do Cliente 360:

1. Cabecalho
   - Nome.
   - Status principal: lead, ativo, aluno, socio, inadimplente, inativo.
   - Telefone/WhatsApp.
   - E-mail.
   - Tags.
   - Responsavel, se menor ou aluno dependente.
   - Proximo passo recomendado.

2. Acoes rapidas
   - Nova reserva.
   - Matricular em aula.
   - Criar cobranca.
   - Marcar pagamento.
   - Enviar WhatsApp.
   - Registrar observacao.
   - Editar dados.

3. Resumo operacional
   - Proxima reserva.
   - Proxima aula.
   - Pagamento pendente/vencido.
   - Plano ou matricula ativa.
   - Pendencia de remarcacao/reposicao.

4. Abas ou secoes
   - Visao geral.
   - Reservas.
   - Aulas e matriculas.
   - Pagamentos.
   - Interacoes.
   - Observacoes.
   - Historico.

5. Reservas
   - Futuras.
   - Passadas.
   - Canceladas.
   - Remarcacoes.
   - Status de pagamento.

6. Aulas e matriculas
   - Turma atual.
   - Professor.
   - Horarios.
   - Quadra/local.
   - Reposicoes.
   - Faltas avisadas.
   - Evolucao, se existir.

7. Pagamentos
   - Em aberto.
   - Vencidos.
   - Pagos.
   - Origem: reserva, mensalidade, pacote, inscricao, produto.
   - Botao pagar/marcar pago via modal stub.

8. Interacoes
   - WhatsApp preparado/enviado.
   - Ligacao/anotacao manual.
   - Follow-up.
   - Avisos importantes.

9. Observacoes
   - Observacao interna simples.
   - Preferencias relevantes: horario, professor, restricao, nivel.

10. Historico
   - Criacao.
   - Alteracoes importantes.
   - Reservas criadas/canceladas/remarcadas.
   - Pagamentos.
   - Matriculas.
   - Comunicacoes.

Dados minimos exibidos por perfil:

- Recepcao: telefone, proximas reservas, pagamentos pendentes, observacoes, CTA de reserva/WhatsApp.
- Financeiro: pagamentos, vencidos, historico de cobranca, telefone, CTA cobrar/marcar pago.
- Professor: aulas, turma, observacoes relevantes, evolucao, faltas avisadas/reposicoes.
- Gestor: tudo acima, com resumo e historico.

O que nao entra na primeira entrega:

- CRM avancado com funil complexo.
- Contratos digitais completos.
- Automacoes.
- Auditoria completa.
- Documentos/anexos.
- Campos obrigatorios excessivos.

Critério de aceite:
Recepcao deve conseguir cadastrar alguem em menos de 30 segundos e, ao abrir o Cliente 360, entender em menos de 10 segundos se ha reserva, aula, pagamento ou pendencia.

### 16.2. WhatsApp operacional - pontos e templates

Regra:
WhatsApp deve ser acao contextual. O sistema prepara a mensagem profissional, abre o WhatsApp e registra interacao simples quando houver cliente/pessoa vinculada. Conteudo pode mudar no futuro sem alterar o funcionamento.

Padrao das mensagens:

- Saudacao com nome.
- Identificacao da academia/local.
- Identificacao do remetente quando disponivel.
- Contexto claro.
- Dados objetivos.
- Proximo passo.
- Tom profissional, curto e educado.

Variaveis padrao:

- `{{nome_cliente}}`
- `{{nome_local}}`
- `{{nome_remetente}}`
- `{{data}}`
- `{{horario}}`
- `{{quadra}}`
- `{{valor}}`
- `{{link}}`
- `{{nome_professor}}`
- `{{nome_turma}}`
- `{{nome_evento}}`
- `{{adversario}}`
- `{{prazo}}`

#### Reserva confirmada

Ponto:
Apos criar reserva ou confirmar pagamento.

Mensagem:
Ola, {{nome_cliente}}. Sua reserva na {{nome_local}} esta confirmada para {{data}} as {{horario}}, na {{quadra}}. Valor: {{valor}}. Caso precise de ajuda, fale conosco por aqui. Enviado por {{nome_remetente}}.

#### Reserva aguardando pagamento

Ponto:
Quando reserva for criada, mas ainda nao estiver paga.

Mensagem:
Ola, {{nome_cliente}}. Sua reserva na {{nome_local}} para {{data}} as {{horario}}, na {{quadra}}, esta aguardando pagamento de {{valor}}. Para garantir o horario, realize o pagamento pelo link: {{link}}. Enviado por {{nome_remetente}}.

#### Cancelamento de reserva

Ponto:
Admin/recepcao cancela reserva.

Mensagem:
Ola, {{nome_cliente}}. Precisamos informar que sua reserva na {{nome_local}} em {{data}} as {{horario}}, na {{quadra}}, foi cancelada. Se desejar, podemos ajudar a encontrar um novo horario. Enviado por {{nome_remetente}}.

#### Pedido de remarcacao de reserva

Ponto:
Horario precisa mudar ou cliente solicita troca.

Mensagem:
Ola, {{nome_cliente}}. Precisamos ajustar sua reserva na {{nome_local}} de {{data}} as {{horario}}, na {{quadra}}. Voce pode escolher um novo horario disponivel por este link: {{link}}. O pagamento ja realizado sera considerado na remarcacao. Enviado por {{nome_remetente}}.

#### Lembrete de reserva

Ponto:
Antes do horario.

Mensagem:
Ola, {{nome_cliente}}. Lembrete da sua reserva hoje na {{nome_local}} as {{horario}}, na {{quadra}}. Bom jogo! Enviado por {{nome_remetente}}.

#### Cobranca de mensalidade/pagamento

Ponto:
Financeiro cobra pagamento em aberto.

Mensagem:
Ola, {{nome_cliente}}. Identificamos um pagamento pendente na {{nome_local}} no valor de {{valor}}, com vencimento em {{data}}. Voce pode regularizar pelo link: {{link}}. Se ja pagou, por favor nos avise. Enviado por {{nome_remetente}}.

#### Confirmacao de pagamento

Ponto:
Pagamento marcado como pago.

Mensagem:
Ola, {{nome_cliente}}. Confirmamos o recebimento do pagamento de {{valor}} na {{nome_local}}. Obrigado! Enviado por {{nome_remetente}}.

#### Aula confirmada / informativo de aula

Ponto:
Aluno entra em turma ou precisa receber dados da aula.

Mensagem:
Ola, {{nome_cliente}}. Sua aula na {{nome_local}} esta vinculada a turma {{nome_turma}}, com {{nome_professor}}, em {{data}} as {{horario}}. Local/quadra: {{quadra}}. Enviado por {{nome_remetente}}.

#### Reposicao disponivel

Ponto:
Aluno tem credito ou possibilidade de reposicao.

Mensagem:
Ola, {{nome_cliente}}. Voce possui uma reposicao disponivel na {{nome_local}}. Para escolher um horario, acesse: {{link}}. Enviado por {{nome_remetente}}.

#### Falta avisada recebida

Ponto:
Aluno avisa ausencia.

Mensagem:
Ola, {{nome_cliente}}. Recebemos seu aviso de ausencia para a aula de {{data}} as {{horario}} na {{nome_local}}. Se houver direito a reposicao conforme as regras da academia, avisaremos por aqui. Enviado por {{nome_remetente}}.

#### Convite de lead / retorno comercial

Ponto:
Recepcao entra em contato com lead.

Mensagem:
Ola, {{nome_cliente}}. Aqui e {{nome_remetente}}, da {{nome_local}}. Vimos seu interesse e queremos te ajudar a encontrar o melhor horario para jogar ou iniciar aulas. Podemos seguir por aqui?

#### Inscricao de torneio recebida

Ponto:
Jogador solicita inscricao.

Mensagem:
Ola, {{nome_cliente}}. Recebemos sua inscricao no evento {{nome_evento}}. Acompanhe as informacoes pelo link: {{link}}. Caso exista pagamento pendente, enviaremos as instrucoes por aqui. Enviado por {{nome_remetente}}.

#### Inscricao de torneio aprovada

Ponto:
Organizador aprova inscricao.

Mensagem:
Ola, {{nome_cliente}}. Sua inscricao no evento {{nome_evento}} foi aprovada. Acompanhe jogos, horarios e comunicados pelo link: {{link}}. Enviado por {{nome_remetente}}.

#### Pendencia de pagamento de inscricao

Ponto:
Inscricao depende de pagamento.

Mensagem:
Ola, {{nome_cliente}}. Sua inscricao no evento {{nome_evento}} esta com pagamento pendente de {{valor}}. Para confirmar sua participacao, regularize pelo link: {{link}}. Enviado por {{nome_remetente}}.

#### Partida / rodada

Ponto:
Jogador precisa ver jogo de torneio/liga.

Mensagem:
Ola, {{nome_cliente}}. Sua partida no evento {{nome_evento}} esta marcada para {{data}} as {{horario}}. Adversario: {{adversario}}. Acompanhe pelo link: {{link}}. Enviado por {{nome_remetente}}.

#### Resultado pendente

Ponto:
Jogador ou staff precisa enviar resultado.

Mensagem:
Ola, {{nome_cliente}}. O resultado da sua partida no evento {{nome_evento}} ainda esta pendente. Quando puder, envie pelo link: {{link}}. Enviado por {{nome_remetente}}.

#### Aviso geral de torneio/liga

Ponto:
Organizador publica comunicado.

Mensagem:
Ola, {{nome_cliente}}. Temos um comunicado sobre o evento {{nome_evento}}: {{mensagem}}. Acompanhe atualizacoes pelo link: {{link}}. Enviado por {{nome_remetente}}.

#### Produto/POS com cliente vinculado

Ponto:
Venda registrada com cliente.

Mensagem:
Ola, {{nome_cliente}}. Registramos sua compra na {{nome_local}} no valor de {{valor}}. Obrigado! Enviado por {{nome_remetente}}.

Pontos onde WhatsApp deve existir:

- Reserva criada.
- Reserva confirmada.
- Reserva aguardando pagamento.
- Reserva cancelada.
- Reserva com remarcacao solicitada.
- Lembrete de reserva.
- Cobranca.
- Confirmacao de pagamento.
- Matricula/aula.
- Reposicao.
- Falta avisada.
- Lead/retorno comercial.
- Inscricao de torneio/liga.
- Aprovacao/rejeicao de inscricao.
- Pagamento de inscricao.
- Partida/rodada.
- Resultado pendente.
- Aviso geral de competicao.
- Venda POS vinculada a cliente.

### 16.3. Relatorios no MVP SaaS

Direcao:
Relatorios devem ser planejados desde o inicio, mas nao devem competir com facilidade de uso e operacao diaria. A primeira entrega precisa ser 100% funcional nos fluxos centrais; relatorios completos entram depois.

Primeira camada obrigatoria:

- Cards/resumos simples em Inicio.
- Indicadores nos dominios.
- Filtros que ja preparam relatorios futuros.
- Links para listas filtradas, nao graficos complexos.

Relatorios planejados, sem foco central inicial:

1. Ocupacao
   - Por quadra.
   - Por horario.
   - Por dia da semana.
   - Reservas x aulas x bloqueios.

2. Receita
   - Recebido.
   - Em aberto.
   - Vencido.
   - Por origem: reserva, mensalidade, inscricao, POS.

3. Clientes/alunos
   - Ativos.
   - Novos.
   - Leads.
   - Inativos.
   - Inadimplentes.

4. Academia
   - Turmas ativas.
   - Alunos por turma.
   - Reposicoes abertas.
   - Ocupacao de turma.

5. Professores
   - Aulas por professor.
   - Alunos vinculados.
   - Comissoes futuras.

6. Competicoes
   - Inscritos.
   - Pagamentos.
   - Jogos pendentes.
   - Eventos finalizados.

7. POS
   - Vendas do dia.
   - Produtos mais vendidos.
   - Estoque baixo.

Regra de implementacao:
Na primeira fase, relatorio deve funcionar como "card que leva para lista filtrada". Graficos e dashboards avancados ficam para fase posterior.

Critério de aceite:
O gestor deve conseguir perceber problemas principais sem abrir relatorio avancado, e quando clicar em um indicador deve cair em uma lista operacional filtrada.

## 17. Regra final

Nenhuma mudanca estrutural deve ser implementada se ela melhorar uma tela isolada e piorar o encaixe no SaaS completo.

Toda implementacao deve ser parte de um dominio, uma persona, uma entidade e um fluxo definidos neste blueprint.
