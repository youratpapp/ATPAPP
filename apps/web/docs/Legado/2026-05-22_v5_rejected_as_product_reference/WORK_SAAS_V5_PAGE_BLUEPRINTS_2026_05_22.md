# Work SaaS V5 Page Blueprints - 2026-05-22

Status: blueprint pagina a pagina para implementacao futura.

Regra: paginas abaixo sao paginas-alvo de produto. Rotas atuais podem ser aliases/wrappers ate a migracao completa.

## 1. SaaS Web Trabalho

### 1.1 Work Command Center

- Rota alvo: `/trabalho` ou `/gestao`
- Rotas preservadas: `/gestao`, `/trabalho`
- Usuario primario: staff em geral
- Pergunta: o que preciso resolver agora?
- Primeira dobra: papel ativo, unidade/organizacao, fila urgente.
- CTA: abrir tarefa mais urgente.
- Componentes: work queue, unidade switcher, convites, tarefas por dominio.
- Nao incluir: setup sem bloqueio, relatorio completo, card publico de marketing.
- Mobile: versao propria por papel.

### 1.2 Organization / Units

- Rota alvo: `/trabalho/organizacao` e `/trabalho/unidades`
- Usuario primario: owner multiunidade
- Pergunta: onde esta o problema e qual unidade estou operando?
- Primeira dobra: lista de unidades por urgencia, status, plano, pendencias.
- CTA: abrir unidade critica.
- Nao incluir: operacao detalhada de cada reserva/aula dentro da lista.
- Futuro: billing multiunidade, permissoes globais, relatorios consolidados.

### 1.3 Unit Dashboard

- Rota alvo: `/trabalho/unidades/:placeId`
- Rotas preservadas: `/gestao/:placeId`, `/locais/:placeId/admin`
- Usuario primario: gestor de unidade
- Pergunta: como esta esta unidade hoje?
- Primeira dobra: pendencias por dominio, agenda do dia, receita em risco.
- CTA: resolver maior bloqueio.
- Nao incluir: configuracoes raras abertas por padrao.

### 1.4 Operational Calendar

- Rota alvo: `/trabalho/unidades/:placeId/calendario`
- Rotas preservadas: `/gestao/:placeId/agenda?visao=calendario`
- Usuario primario: recepcao/gestor
- Pergunta: o que ocupa a unidade em cada horario?
- Primeira dobra: data, camadas, grade por hora.
- CTA: nova reserva ou bloquear horario.
- Detalhe: slot drawer com reserva/aula/bloqueio.
- Estados: sem itens, sem quadra, sem permissao, conflito.

### 1.5 Reservations

- Rota alvo: `/trabalho/unidades/:placeId/reservas`
- Rotas preservadas: `/gestao/:placeId/agenda?visao=reservas`
- Usuario primario: recepcao
- Pergunta: quais reservas precisam de acao?
- Primeira dobra: reservas do dia/periodo e CTA Nova reserva.
- CTA: nova reserva.
- Detalhe: reservation drawer com status, pagamento, editar, cancelar, WhatsApp.
- Nao incluir: filtros de professor/turma como foco principal.

### 1.6 New Reservation Flow

- Rota alvo: modal/drawer sobre Calendario ou Reservas
- Usuario primario: recepcao/player em public flow
- Passos: cliente -> data/hora -> disponibilidade -> valor -> confirmar -> sucesso.
- CTA final: confirmar reserva.
- Sucesso: ver no calendario, enviar WhatsApp, criar outra.
- Excecao: horario ocupado mostra alternativas ou espera, nunca "criar reserva".

### 1.7 Reservation Change Flow

- Rota alvo admin: reservation drawer
- Rota jogador: `/reservas/alteracao/:token`
- Usuario primario: recepcao/jogador
- Pergunta: qual novo horario livre preserva a reserva paga?
- Primeira dobra: horarios disponiveis proximos.
- CTA: confirmar alteracao.
- Nao incluir: pagamento novo se a reserva original ja esta paga, salvo diferenca futura.

### 1.8 Classes / Academy

- Rota alvo: `/trabalho/unidades/:placeId/aulas`
- Rotas preservadas: `/gestao/:placeId/academia`
- Usuario primario: gestor/professor/frontdesk conforme permissao
- Pergunta: quais aulas/turmas/alunos precisam de acao?
- Primeira dobra:
  - professor: agenda do dia;
  - gestor: pendencias e turmas ativas.
- CTA: abrir proxima aula ou matricular aluno.
- Nao incluir: financeiro amplo, equipe, ajustes.

### 1.9 Class Detail

- Rota alvo: `/trabalho/unidades/:placeId/aulas/turmas/:classId`
- Usuario primario: professor/gestor
- Pergunta: como esta esta turma?
- Primeira dobra: horario, quadra, professor, vagas, alunos.
- CTA: matricular aluno ou abrir aula do dia.
- Abas internas permitidas: alunos, agenda, reposicoes, historico.
- Nao incluir: configuracao global de academia.

### 1.10 Lesson Day Detail

- Rota alvo: drawer/sheet de aula do dia
- Usuario primario: professor
- Pergunta: o que preciso saber para dar esta aula?
- Primeira dobra: turma, horario, quadra, alunos, avisos.
- CTA: registrar observacao/progresso; chamada se exigida.
- Chamada: aparece so se configuracao da unidade exigir.

### 1.11 Student Detail

- Rota alvo: `/trabalho/unidades/:placeId/pessoas/alunos/:studentId` ou drawer
- Usuario primario: professor/recepcao/gestor
- Pergunta: qual a relacao deste aluno com a academia?
- Primeira dobra: dados, turma, plano, status, proximas aulas, pendencias.
- CTA: atualizar matricula, registrar progresso ou cobrar, conforme papel.
- Mobile: sheet sem quebra, scroll interno controlado.

### 1.12 People Directory

- Rota alvo: `/trabalho/unidades/:placeId/pessoas`
- Usuario primario: recepcao/gestor
- Pergunta: quem estou procurando e o que preciso fazer com ela?
- Primeira dobra: busca global local, filtros por relacao, filas de follow-up.
- CTA: nova pessoa/lead.
- Saved views: Leads, Clientes ativos, Alunos, Socios, Staff.
- Detalhe: person drawer/timeline.

### 1.13 Lead Detail

- Rota alvo: person detail com relacao lead
- Usuario primario: recepcao/comercial
- Pergunta: como converter este interessado?
- Primeira dobra: origem, interesse, proximo contato, historico.
- CTA: contatar WhatsApp ou converter.
- Sucesso conversao: matricular, associar plano, reservar ou arquivar.

### 1.14 Member / Client Detail

- Usuario primario: recepcao/financeiro/gestor
- Pergunta: qual contrato/plano/pagamento/atividade deste cliente?
- Primeira dobra: status, plano, pagamentos, proximas reservas/aulas.
- CTA: cobrar, reservar, matricular ou editar relacao.

### 1.15 Revenue Receivables

- Rota alvo: `/trabalho/unidades/:placeId/receita/receber`
- Rotas preservadas: `/gestao/:placeId/receita?visao=recebiveis`
- Usuario primario: financeiro
- Pergunta: quem precisa pagar?
- Primeira dobra: vencidos, hoje, todos, lote de cobranca.
- CTA: cobrar selecionados / marcar pago.
- Nao incluir: POS como venda principal.

### 1.16 Payment Modal

- Rota alvo: componente global contextual
- Usuario primario: financeiro/frontdesk/player em pessoal
- Pergunta: que valor estou registrando?
- Conteudo: origem, pagador, valor, vencimento, status, descricao.
- CTA: Pagar / Marcar pago.
- Sucesso: objeto atualizado + ledger atualizado.

### 1.17 Revenue Paid

- Pergunta: o que ja foi pago?
- Primeira dobra: periodo, fonte, total, lista.
- CTA: abrir pagamento/recibo.
- Tipo: ledger/consulta, nao rotina principal.

### 1.18 Expenses

- Pergunta: quais saidas registramos?
- Primeira dobra: despesas recentes e CTA lancar despesa.
- CTA: nova despesa.
- Nao incluir: pagamentos pessoais ou POS sale.

### 1.19 Plans And Packages

- Pergunta: quais ofertas geram receita?
- Primeira dobra: planos ativos, pacotes, recorrencia futura.
- CTA: criar plano/pacote.
- Tipo: setup financeiro, nao rotina diaria.

### 1.20 POS Sell

- Rota alvo: `/trabalho/unidades/:placeId/pos/vender`
- Usuario primario: caixa
- Pergunta: como registrar venda agora?
- Primeira dobra: produtos, carrinho, total.
- CTA: finalizar venda.
- Sucesso: venda registrada, estoque atualizado, nova venda.

### 1.21 POS Inventory

- Pergunta: o que precisa de reposicao?
- Primeira dobra: estoque baixo/zerado.
- CTA: ajustar produto/estoque.
- Mobile: apenas produtos criticos e venda.

### 1.22 Team

- Rota alvo: `/trabalho/unidades/:placeId/admin/equipe`
- Usuario primario: owner/manager
- Pergunta: quem pode operar esta unidade?
- Primeira dobra: equipe ativa, convites, roles.
- CTA: convidar pessoa.
- Nao incluir: rotina de professor como primeira camada.

### 1.23 Settings / Admin

- Rota alvo: `/trabalho/unidades/:placeId/admin`
- Usuario primario: owner/manager
- Pergunta: o que configura a operacao?
- Primeira dobra: recursos, regras, permissoes, dados publicos, avancado.
- CTA: completar configuracao pendente.
- Mobile: link para web quando complexo.

### 1.24 Reports

- Rota alvo: `/trabalho/unidades/:placeId/relatorios`
- Usuario primario: manager/owner/finance
- Pergunta: como esta o desempenho?
- Primeira dobra: seletor de periodo, dominio, resumo.
- CTA: exportar ou abrir relatorio.
- Relatorios iniciais: ocupacao, receita, inadimplencia, turmas, CRM, POS, competicoes.

## 2. Competition OS

### 2.1 Competition Work Hub

- Rota alvo: `/trabalho/competicoes`
- Rotas preservadas: `/eventos?modo=organizing`, `/trabalho/competicoes`
- Usuario primario: organizador
- Pergunta: qual competicao esta bloqueada?
- Primeira dobra: agrupamento por fase e urgencia.
- CTA: resolver bloqueio.

### 2.2 Tournament Cockpit

- Rota preservada: `/eventos/:tournamentId/organizacao`
- Usuario primario: owner/organizer/staff
- Pergunta: o que falta nesta fase?
- Primeira dobra por fase:
  - rascunho: checklist;
  - inscricoes: inscritos/pagamentos/link;
  - encerradas: classes prontas e gerar jogos;
  - jogos gerados: conflitos e publicar;
  - andamento: resultados pendentes;
  - finalizado: podio/relatorio.
- CTA: fase atual.
- Admin avancado: backup/reset/staff em camada propria.

### 2.3 Tournament Player View

- Rota: `/eventos/:id/jogos`, `/classificacao`, `/jogadores`, `/chat`
- Usuario primario: jogador
- Pergunta: qual meu jogo/status?
- Nao mostra: admin sem permissao.

### 2.4 League Owner Cockpit

- Rota preservada: `/eventos/ligas/:leagueId?mode=work`
- Usuario primario: owner
- Pergunta: que rodada/resultado/participante precisa de acao?
- CTA: gerar rodada, resolver resultado, aprovar inscricao conforme fase.

### 2.5 League Participant View

- Rota: `/eventos/ligas/:leagueId`
- Usuario primario: participante
- Pergunta: quem enfrento e o que preciso informar?
- Primeira dobra: rodada atual, adversario, horario/local, chat, resultado.
- Nao mostra: configuracao owner-only.

## 3. Mobile Trabalho Blueprints

### 3.1 Mobile Professor

- Home: aulas de hoje.
- CTA: abrir proxima aula.
- Nav: Hoje, Agenda, Turmas, Alunos, Perfil.
- Proibido: Receita, POS, Admin.

### 3.2 Mobile Recepcao

- Home: reservas e atendimentos do dia.
- CTA: nova reserva.
- Nav: Hoje, Reservas, Pessoas, Aulas, Mais.
- Proibido: relatorios longos e settings estruturais.

### 3.3 Mobile Financeiro

- Home: vencidos e hoje.
- CTA: cobrar/marcar pago.
- Nav: Receber, Pagos, Despesas, Resumo, Perfil.
- Proibido: aulas/POS como navegacao principal.

### 3.4 Mobile Caixa

- Home: venda rapida.
- CTA: finalizar venda.
- Nav: Vender, Hoje, Estoque, Produtos, Perfil.
- Proibido: financeiro amplo.

### 3.5 Mobile Gestor

- Home: bloqueios por unidade.
- CTA: resolver maior bloqueio.
- Nav: Hoje, Calendario, Aulas, Receita, Mais.
- Proibido: lista infinita de modulos.

### 3.6 Mobile Organizador

- Home: competicoes em andamento/bloqueadas.
- CTA: resolver fase.
- Nav: Hoje, Torneios, Ligas, Avisos, Perfil.
- Proibido: descoberta publica como foco.

## 4. Player App Blueprints

### 4.1 Player Home

- Proxima acao pessoal.
- Cards: reservar, jogar, competir, aula/pagamento se aplicavel.
- Nao mostra admin.

### 4.2 Jogar

- Fluxos: reservar quadra, encontrar jogo, encontrar aula, ver locais.
- Copy publica simples, sem texto interno.
- Sem botao organizador no conteudo.

### 4.3 Competir

- Fluxos: torneios, ligas, ranking, meus jogos.
- Se usuario tambem organiza, apenas seletor global muda para Trabalho.
- Sem card Trabalho como destino de conteudo.

### 4.4 Minha Rotina

- Agrega reservas, partidas, aulas, pagamentos pessoais e historico.
- Remove duplicidade de menu principal para Aulas/Pagamentos quando estiver consolidado.

### 4.5 Perfil

- Dados pessoais, preferencias, conta.
- Trabalho disponivel apenas como modo separado, nao conteudo misturado.

