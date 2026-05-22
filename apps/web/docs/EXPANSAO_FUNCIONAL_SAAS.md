# Expansao Funcional SaaS

Status: proposta inicial
Data: 2026-05-22

## Regra de expansao

Nao criar feature por impulso. Toda expansao precisa resolver uma necessidade real de operacao. A base atual deve ser aproveitada quando possivel, mas o alvo SaaS nao deve ser limitado por ela.

## Painel de pendencias operacional

Problema que resolve:
Hoje tarefas ficam espalhadas em reservas, aulas, financeiro, competicoes e convites.

Persona beneficiada:
Dono, gestor, recepcao, professor, financeiro, organizador.

Area do sistema:
Operacao / Inicio Trabalho.

Prioridade:
Alta.

Complexidade:
Media.

Web ou Mobile:
Ambos, com profundidade diferente.

Risco de nao ter:
Usuario continua abrindo modulos para descobrir problemas.

Alternativa com menor impacto:
Compor filas usando dados existentes antes de criar motor de tarefas.

Recomendacao:
Fazer agora como composicao, evoluir para tarefas reais depois.

## Calendario operacional unico

Problema que resolve:
Agenda, reservas e aulas competem. Quadras aparecem em grades quebradas e filtros de professores/turmas aparecem no contexto errado.

Persona beneficiada:
Recepcao, gestor, professor, dono.

Area do sistema:
Agenda e Recursos.

Prioridade:
Alta.

Complexidade:
Alta.

Web ou Mobile:
Web completo; mobile com dia/lista.

Risco de nao ter:
Reserva, aula e bloqueio continuam parecendo sistemas diferentes.

Alternativa com menor impacto:
Primeiro reorganizar calendario atual com colunas responsivas e drawer; depois evoluir para calendario completo.

Recomendacao:
Fazer na primeira fase pratica.

## Reserva com ciclo completo de pagamento e remarcacao

Problema que resolve:
Reserva precisa fechar ciclo: escolher horario, pagar, confirmar, editar, cancelar, remarcar e avisar.

Persona beneficiada:
Recepcao, gestor, jogador/socio.

Area do sistema:
Agenda/Reservas/Financeiro/Comunicacao.

Prioridade:
Alta.

Complexidade:
Media.

Web ou Mobile:
Ambos.

Risco de nao ter:
Atendimento depende de processo manual fora do app.

Alternativa com menor impacto:
Usar modal padrao de pagamento stub e WhatsApp template antes do gateway real.

Recomendacao:
Fazer agora com backend atual + pequenos ajustes se faltar RPC.

## Cliente/Aluno 360

Problema que resolve:
Clientes, leads, socios, alunos, pagamentos e historico ficam espalhados.

Persona beneficiada:
Recepcao, gestor, financeiro, professor.

Area do sistema:
Pessoas.

Prioridade:
Alta.

Complexidade:
Alta.

Web ou Mobile:
Web completo; mobile consulta rapida.

Risco de nao ter:
Usuario nunca sabe a historia do aluno antes de agir.

Alternativa com menor impacto:
Detalhe lateral agregando dados existentes.

Recomendacao:
Fazer em fase inicial apos agenda.

## CRM simples para leads

Problema que resolve:
Leads e clientes ativos estao misturados.

Persona beneficiada:
Recepcao, gestor, dono.

Area do sistema:
Pessoas > Leads.

Prioridade:
Media.

Complexidade:
Media.

Web ou Mobile:
Web; mobile apenas follow-up rapido.

Risco de nao ter:
Novas oportunidades somem no cadastro geral.

Alternativa com menor impacto:
Separar views usando status de CRM existente.

Recomendacao:
Fazer sem backend novo inicialmente.

## Financeiro empresarial consolidado

Problema que resolve:
Pagamentos pessoais, mensalidades, reservas, inscricoes, pacotes e despesas precisam de dominio unificado.

Persona beneficiada:
Financeiro, dono, gestor.

Area do sistema:
Financeiro.

Prioridade:
Alta.

Complexidade:
Alta.

Web ou Mobile:
Web principal; mobile para cobrar/marcar pago.

Risco de nao ter:
Receita fica espalhada e o SaaS nao parece empresarial.

Alternativa com menor impacto:
Criar telas de recebiveis/pagos/despesas com dados atuais e modal padrao.

Recomendacao:
Fazer em duas fases: basico primeiro, conciliacao depois.

## Cobranca recorrente e inadimplencia

Problema que resolve:
Mensalidades e planos precisam virar fluxo continuo.

Persona beneficiada:
Financeiro, gestor, aluno/socio.

Area do sistema:
Financeiro > Mensalidades/Inadimplencia.

Prioridade:
Alta.

Complexidade:
Alta.

Web ou Mobile:
Web + mobile para cobranca.

Risco de nao ter:
Academias precisam controlar isso fora do app.

Alternativa com menor impacto:
Stub de pagamento e lista de vencidos com dados existentes.

Recomendacao:
Preparar agora, gateway depois.

## Comissoes de professores

Problema que resolve:
Academias precisam calcular repasse por aula, turma, contrato ou percentual.

Persona beneficiada:
Dono, financeiro, professor.

Area do sistema:
Financeiro > Comissoes / Professores.

Prioridade:
Media.

Complexidade:
Alta.

Web ou Mobile:
Web; professor mobile somente consulta.

Risco de nao ter:
Controle manual externo.

Alternativa com menor impacto:
Exibir percentual atual e aulas dadas, sem calculo automatico completo.

Recomendacao:
Documentar e preparar, implementar depois do financeiro basico.

## Presenca/chamada configuravel

Problema que resolve:
Em tenis, chamada obrigatoria pode nao fazer sentido. A falta avisada e reposicao importam mais.

Persona beneficiada:
Professor, gestor.

Area do sistema:
Academia > Configuracoes.

Prioridade:
Alta.

Complexidade:
Baixa/Media.

Web ou Mobile:
Ambos quando ativo.

Risco de nao ter:
Professor ve rotina desnecessaria e confusa.

Alternativa com menor impacto:
Adicionar setting "exigir chamada" padrao desligado e esconder CTA quando off.

Recomendacao:
Fazer cedo.

## Regras de falta, cancelamento e reposicao

Problema que resolve:
Alunos avisam falta, reposicao depende de antecedencia, reserva depende de pagamento e prazo.

Persona beneficiada:
Aluno, professor, recepcao, gestor.

Area do sistema:
Academia/Reservas/Configuracoes.

Prioridade:
Alta.

Complexidade:
Media/Alta.

Web ou Mobile:
Ambos.

Risco de nao ter:
Atendimento vira excecao manual constante.

Alternativa com menor impacto:
Primeira versao com regras simples configuraveis.

Recomendacao:
Fazer apos agenda e aluno 360.

## Comunicacao operacional por WhatsApp

Problema que resolve:
Cancelamento, remarcacao, cobranca e avisos precisam de mensagens profissionais.

Persona beneficiada:
Recepcao, financeiro, organizador, gestor.

Area do sistema:
Comunicacao.

Prioridade:
Alta.

Complexidade:
Media.

Web ou Mobile:
Ambos.

Risco de nao ter:
SaaS depende de conversas externas sem padrao.

Alternativa com menor impacto:
Abrir WhatsApp com texto pronto e registrar "mensagem preparada/enviada" manualmente.

Recomendacao:
Fazer agora sem integracao oficial, evoluir depois.

## Relatorios de ocupacao e receita

Problema que resolve:
Dono precisa saber ocupacao por quadra, horario, professor, modalidade e receita.

Persona beneficiada:
Dono, gestor, financeiro.

Area do sistema:
Relatorios.

Prioridade:
Media/Alta.

Complexidade:
Media.

Web ou Mobile:
Web.

Risco de nao ter:
Produto nao entrega gestao empresarial.

Alternativa com menor impacto:
Relatorios simples calculados dos dados atuais.

Recomendacao:
Fazer depois de reorganizar dominios.

## Auditoria de acoes

Problema que resolve:
Em operacoes com varias pessoas, e preciso saber quem alterou reserva, pagamento, aluno ou resultado.

Persona beneficiada:
Dono, gestor.

Area do sistema:
Administracao/Auditoria.

Prioridade:
Media.

Complexidade:
Alta se completo.

Web ou Mobile:
Web.

Risco de nao ter:
Conflitos e erros sem rastreabilidade.

Alternativa com menor impacto:
Historico por entidade primeiro.

Recomendacao:
Planejar para fase posterior.

## Multiunidade e seletor de contexto

Problema que resolve:
Usuario com mais de uma academia/unidade fica perdido.

Persona beneficiada:
Dono, gestor de unidade, equipe multiunidade.

Area do sistema:
Topbar/Administracao.

Prioridade:
Alta se produto mirar clubes grandes.

Complexidade:
Media/Alta.

Web ou Mobile:
Ambos, mas web principal.

Risco de nao ter:
Dados de unidades se misturam e menu fica confuso.

Alternativa com menor impacto:
Seletor visual de local ativo usando dados atuais.

Recomendacao:
Fazer na arquitetura web.

## Busca global e atalhos

Problema que resolve:
SaaS grande exige achar aluno, reserva, turma, pagamento ou torneio rapidamente.

Persona beneficiada:
Todos no trabalho.

Area do sistema:
Topbar.

Prioridade:
Media.

Complexidade:
Media.

Web ou Mobile:
Web; mobile busca reduzida.

Risco de nao ter:
Menu vira unico caminho e fica pesado.

Alternativa com menor impacto:
Busca inicial por pessoas/reservas/torneios.

Recomendacao:
Fazer depois dos dominios.

