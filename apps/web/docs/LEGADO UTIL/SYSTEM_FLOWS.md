# System Flows

Fonte principal: `product-architecture-ux-audit.md`.

Data: 2026-05-13

## Regra geral

Fluxos devem comecar pelo contexto do usuario e terminar em uma acao resolvida. A interface deve reduzir varredura visual, repeticao e troca desnecessaria de tela.

## Jogador casual

### Reservar quadra

Entrada: Home, pagina publica do local ou Locais.

Fluxo ideal:

1. Escolher local, data e horario.
2. Ver preco e disponibilidade real.
3. Solicitar ou confirmar reserva.
4. Receber proxima acao clara: pagar, aguardar, compartilhar ou cancelar.

Regra: nao misturar reservas com administracao do local.

### Entrar em jogo aberto

Entrada: Home, pagina publica do local, feed de partidas.

Fluxo ideal:

1. Ver jogos por nivel, horario e local.
2. Entrar no jogo.
3. Confirmar presenca.
4. Acessar conversa/contexto da partida.

Regra: cada jogo deve mostrar status, vagas, nivel, horario e acao primaria no primeiro olhar.

## Jogador competitivo

### Participar de torneio/liga

Entrada: Competicoes, link publico ou convite.

Fluxo ideal:

1. Ver informacoes essenciais.
2. Escolher classe.
3. Confirmar inscricao/pagamento quando aplicavel.
4. Acompanhar minhas partidas, agenda, resultado e ranking.

Regra: proxima partida do jogador nao deve aparecer duplicada em blocos concorrentes. Ela deve estar no contexto "Minhas partidas" ou em uma fila de acao unica.

## Recepcao/frontdesk

### Operar o dia

Entrada: cockpit do local.

Fluxo ideal:

1. Ver fila de hoje.
2. Resolver reservas pendentes.
3. Promover lista de espera.
4. Registrar pagamento rapido.
5. Acionar aluno/cliente por WhatsApp quando necessario.

Regra: recepcao precisa de fila operacional, nao painel analitico pesado.

## Professor

### Chamada e evolucao

Entrada: Academia > Hoje ou agenda do professor.

Fluxo ideal:

1. Ver turmas do dia.
2. Abrir turma.
3. Marcar presenca/falta.
4. Registrar observacao/evolucao quando necessario.
5. Encerrar aula.

Regra: financeiro aparece apenas como alerta ou pendencia; detalhe financeiro fica fora da chamada.

## Gestor do clube

### Acompanhar saude operacional

Entrada: cockpit do local.

Fluxo ideal:

1. Ver resumo do dia.
2. Ver fila priorizada.
3. Entrar em modulos por assunto.
4. Usar relatorios para decisao, nao para operacao minuto a minuto.

Regra: dashboard nao deve competir com a fila. A fila resolve; o dashboard explica.

## Financeiro/admin

### Cobrar e controlar recebiveis

Entrada: Financeiro ou fila do local.

Fluxo ideal:

1. Ver recebiveis vencidos, hoje e proximos.
2. Filtrar por reserva, mensalidade, turma, torneio ou venda.
3. Enviar lembrete segmentado.
4. Registrar pagamento.
5. Conferir relatorio por periodo.

Regra: cobranca deve ser orientada por status e vencimento, nao por lista generica de clientes.

## Organizador de torneio

### Rodar evento

Entrada: detalhe do torneio.

Fluxo ideal:

1. Selecionar classe.
2. Ver resumo da classe.
3. Resolver pendencias de presenca/resultado.
4. Acompanhar agenda por quadra.
5. Publicar chave, agenda, resultados e podio.

Regra: seletor de classe vem antes do resumo; resumo se refere sempre ao recorte ativo.

## Organizador de liga

### Operar temporada

Entrada: detalhe da liga.

Fluxo ideal:

1. Ver rodada atual e pendencias.
2. Acompanhar partidas.
3. Confirmar resultados.
4. Atualizar classificacao/ranking.
5. Comunicar jogadores.

Regra: liga deve compartilhar a mesma gramatica de competicao do torneio.

## Anti-padroes

- Cadastro longo inline dentro de pagina operacional.
- Botao primario competindo com tres acoes secundarias.
- Detalhe historico expandido por padrao.
- Resumo mostrando dados de outro filtro/classe.
- Tela publica misturada com tela administrativa.
- Relatorio aparecendo como primeira experiencia de uma rotina diaria.
