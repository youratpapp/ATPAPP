# Fluxos de Trabalho por Persona

Status: proposta operacional
Data: 2026-05-22

## Recepcao - Criar reserva

Persona:
Recepcao/secretaria.

Objetivo:
Reservar quadra com menor friccao possivel.

Tela inicial ideal:
Agenda > Calendario.

Passos:
1. Abre calendario do dia/semana.
2. Escolhe data, quadra e horario disponivel.
3. Busca cliente existente ou cria contato rapido.
4. Confere valor e regra de pagamento.
5. Confirma reserva.
6. Abre modal padrao de pagamento se aplicavel.
7. Envia WhatsApp de confirmacao.
8. Reserva aparece no calendario e no historico do cliente.

Informacoes necessarias:
Cliente, telefone, quadra, horario, valor, status de pagamento, regra de cancelamento.

Acoes rapidas:
Nova reserva, cobrar, enviar WhatsApp, abrir cliente.

Erros possiveis:
Horario ocupado, cliente duplicado, pagamento pendente, conflito com bloqueio/aula.

Como o sistema ajuda:
Slot clicavel, validacao antes de salvar, sugestao de horarios proximos se ocupado.

Web/mobile:
Web completo. Mobile para atendimento rapido.

Melhorias necessarias:
Calendario responsivo, drawer de reserva, WhatsApp padrao, modal de pagamento.

## Jogador - Solicitar/reservar quadra

Persona:
Jogador/socio.

Objetivo:
Encontrar horario e garantir reserva.

Tela inicial ideal:
Player > Jogar > Reservar quadra.

Passos:
1. Escolhe local.
2. Escolhe data/horario/quadra disponivel.
3. Confere valor e beneficio do plano.
4. Confirma e paga.
5. Ve sucesso.
6. CTA: Ver em Minha Rotina, compartilhar ou adicionar calendario.

Web/mobile:
Mobile prioritario.

Melhorias necessarias:
Fluxo de sucesso e pagamento real no futuro.

## Gestor/recepcao - Alterar ou cancelar reserva

Persona:
Gestor/recepcao.

Objetivo:
Resolver mudanca sem perder historico nem confundir cliente.

Tela inicial ideal:
Agenda > Calendario ou Cliente 360 > Reservas.

Passos:
1. Clica na reserva.
2. Abre drawer com dados completos.
3. Escolhe editar, cancelar ou solicitar remarcacao.
4. Se editar internamente, valida horario e salva.
5. Se remarcacao pelo cliente, gera link para agenda de remarcacao.
6. WhatsApp abre com mensagem profissional.
7. Acao fica registrada no historico da reserva/cliente.

Informacoes necessarias:
Reserva atual, pagamento, regras, horarios alternativos, telefone, remetente.

Web/mobile:
Web completo; mobile com acoes simples.

Melhorias necessarias:
Drawer fora do card estreito, link unico de remarcacao, historico.

## Professor - Consultar aulas do dia

Persona:
Professor.

Objetivo:
Saber o que vai dar hoje.

Tela inicial ideal:
Mobile Trabalho > Hoje.

Passos:
1. Abre Trabalho.
2. Ve lista por horario cheio.
3. Cada item mostra turma, alunos, quadra, observacoes e faltas avisadas.
4. Abre aula para ver alunos e notas.
5. Registra evolucao ou reposicao, se necessario.

Informacoes necessarias:
Horario, turma, alunos, quadra, local, observacoes, reposicoes.

Acoes rapidas:
Abrir aula, avisar aluno, registrar observacao, registrar falta avisada.

Regra:
Chamada/presenca so aparece se configuracao da empresa exigir. Padrao desligado.

Web/mobile:
Mobile principal; web para planejamento.

## Financeiro - Cobrar mensalidade

Persona:
Financeiro.

Objetivo:
Reduzir inadimplencia.

Tela inicial ideal:
Financeiro > Vencidos.

Passos:
1. Abre vencidos.
2. Filtra por periodo/plano/turma/responsavel.
3. Abre cobranca.
4. Envia WhatsApp ou link de pagamento.
5. Marca pago quando receber.
6. Registro aparece no cliente 360 e resumo financeiro.

Informacoes necessarias:
Cliente, telefone, valor, vencimento, origem, plano, historico de cobrancas.

Web/mobile:
Web principal; mobile para cobrar/marcar pago.

Melhorias necessarias:
Modal padrao de pagamento e templates.

## Financeiro - Registrar despesa

Persona:
Financeiro/gestor.

Objetivo:
Controlar saidas.

Tela inicial ideal:
Financeiro > Despesas.

Passos:
1. Clica registrar despesa.
2. Informa categoria, valor, data e observacao.
3. Salva.
4. Despesa entra no resumo.

Web/mobile:
Web; mobile opcional simples.

## Gestor - Criar turma e matricular aluno

Persona:
Gestor/recepcao.

Objetivo:
Vincular aluno a aula/turma com plano e horario claros.

Tela inicial ideal:
Academia > Turmas ou Pessoas > Aluno 360.

Passos:
1. Cria turma com professor, horario, quadra, capacidade, valor.
2. Busca aluno ou cria pessoa.
3. Cria matricula/contrato.
4. Confirma pagamento/primeira mensalidade.
5. Aluno passa a ver aula na Minha Rotina.
6. Professor passa a ver turma no dia.

Melhorias necessarias:
Aluno 360 e contrato/matricula responsivos.

## Aluno - Avisar falta e solicitar reposicao

Persona:
Aluno.

Objetivo:
Avisar que nao comparecera e buscar reposicao quando permitido.

Tela inicial ideal:
Minha Rotina > Aulas.

Passos:
1. Abre aula futura.
2. Clica avisar ausencia.
3. Sistema verifica prazo/regra.
4. Se permitido, gera credito de reposicao.
5. Sugere horarios de encaixe.
6. Professor/gestor ve pendencia.

Web/mobile:
Mobile prioritario.

## Organizador - Criar torneio

Persona:
Organizador.

Objetivo:
Sair de rascunho para inscricoes abertas.

Tela inicial ideal:
Trabalho > Competicoes > Torneios.

Passos:
1. Clica criar torneio.
2. Preenche dados basicos.
3. Define classes, regras, inscricao, pagamento e local.
4. Revisa checklist.
5. Publica inscricoes.

Melhorias necessarias:
Wizard por fase e checklist.

## Organizador - Operar torneio em andamento

Persona:
Organizador/scorekeeper.

Objetivo:
Resolver jogos e resultados.

Tela inicial ideal:
Torneio > Cockpit da fase.

Passos:
1. Abre torneio em andamento.
2. Primeira dobra mostra jogos pendentes, atrasos, W/O e resultados a revisar.
3. Abre partida.
4. Lanca ou aprova resultado.
5. Classificacao atualiza.
6. Comunica participantes se necessario.

Web/mobile:
Web para operacao ampla; mobile para placar/resultado.

## Jogador - Participar de rodada de liga

Persona:
Jogador competitivo.

Objetivo:
Ver adversario, combinar, jogar e enviar resultado.

Tela inicial ideal:
Player > Competir ou Minha Rotina.

Passos:
1. Ve rodada atual.
2. Abre partida.
3. Consulta adversario, local, horario e chat.
4. Envia disponibilidade se necessario.
5. Lanca resultado.
6. Acompanha confirmacao e classificacao.

## Caixa - Vender item

Persona:
Caixa.

Objetivo:
Vender rapido.

Tela inicial ideal:
Loja/POS > Vender.

Passos:
1. Seleciona produto.
2. Ajusta quantidade.
3. Associa cliente se necessario.
4. Confirma pagamento.
5. Venda entra no dia e estoque baixa.

Mobile:
Muito relevante em tablet/celular.

## Dono - Ver saude geral

Persona:
Dono.

Objetivo:
Tomar decisao.

Tela inicial ideal:
Inicio > Saude da operacao.

Passos:
1. Ve receita, ocupacao, inadimplencia, aulas, reservas e alertas.
2. Clica no maior problema.
3. Vai para dominio certo com filtro aplicado.
4. Resolve ou delega.

## Colaborador - Resolver pendencia do dia

Persona:
Qualquer papel de trabalho.

Objetivo:
Nao precisar descobrir o que fazer.

Tela inicial ideal:
Trabalho Hoje.

Passos:
1. Sistema mostra pendencias do papel.
2. Colaborador abre a primeira.
3. Faz acao.
4. Volta para fila com item resolvido.

Melhorias necessarias:
Fila de pendencias composicional, depois motor real de tarefas.

