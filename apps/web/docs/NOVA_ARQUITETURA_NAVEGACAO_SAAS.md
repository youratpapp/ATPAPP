# Nova Arquitetura de Navegacao SaaS

Status: proposta alvo
Data: 2026-05-22

## Principio

A navegacao da area Trabalho deve nascer de dominios de operacao, nao do menu atual. O app atual e insumo; a arquitetura alvo e a direcao.

## Estrutura macro

Tres superficies oficiais:

1. Player App: jogador, aluno, socio e rotina pessoal.
2. Work SaaS Web: gestao empresarial completa.
3. Work Mobile Operacional: acoes rapidas por papel.

## Padrao inspirado em SaaS maduros

A area Trabalho web deve se aproximar de um modelo de "workspaces" como Salesforce Lightning e outros SaaS empresariais:

- Home do workspace para comecar o dia.
- Objetos principais com listas salvas: Clientes, Reservas, Aulas, Turmas, Pagamentos, Torneios, Ligas.
- List views com filtros persistentes: vencidos, hoje, minhas aulas, reservas canceladas, leads novos, resultados pendentes.
- Visualizacoes alternativas quando fizer sentido: tabela, calendario, kanban, detalhe lateral.
- Acoes globais: criar reserva, novo aluno, registrar pagamento, criar torneio.
- Acoes de registro: editar reserva, cobrar cliente, enviar WhatsApp, lancar resultado.
- Busca global para nao depender apenas de menu.
- Configuracoes e setup em area propria, nao misturados na rotina.

O objetivo nao e copiar Salesforce, mas usar a licao central: objetos e fluxos complexos ficam organizados por workspace, listas, filtros, detalhes e acoes contextuais.

## Topbar web Trabalho

Elementos recomendados:

- Logo ATP consistente.
- Seletor Jogador / Trabalho.
- Seletor de organizacao/unidade/local ativo.
- Busca global: aluno, cliente, reserva, turma, torneio, pagamento.
- Botao criar rapido: reserva, aluno, aula, cobranca, torneio, produto.
- Notificacoes/pendencias.
- Usuario e papel ativo.
- App/workspace switcher futuro, caso existam mais experiencias de trabalho: Academia, Competicoes, Financeiro, Admin.

## Sidebar web Trabalho

### Inicio

- Hoje
- Pendencias
- Agenda geral

Responsabilidade:
Responder "o que precisa de acao agora?".

### Agenda

- Calendario
- Reservas
- Quadras
- Bloqueios
- Regras e disponibilidade

Responsabilidade:
Gerir tempo, espaco e disponibilidade. O calendario deve mostrar reservas, aulas, bloqueios e competicoes, com filtros por tipo.

### Clientes

- Clientes ativos
- Leads
- Alunos
- Socios
- Responsaveis
- Perfil 360
- Historico de relacionamento

Responsabilidade:
Centralizar quem se relaciona com a academia. Leads e clientes ativos nao devem competir na mesma lista sem separacao.

Padrao Salesforce aplicavel:
Leads, clientes e alunos devem ter listas salvas, filtros, dono/responsavel, proximo contato e detalhe 360.

### Academia

- Aulas
- Turmas
- Matriculas
- Professores
- Reposicoes
- Evolucao
- Configuracao de chamada/reposicao

Responsabilidade:
Gerir ensino e acompanhamento. Professores tambem podem aparecer em Equipe, mas a visao de professor no contexto de aulas fica aqui.

### Financeiro

- Receber
- Pagos
- Vencidos/Inadimplencia
- Despesas
- Planos e pacotes
- Comissoes
- Relatorios financeiros

Responsabilidade:
Centralizar dinheiro do local. Nao misturar com pagamentos pessoais do jogador.

### Competicoes

- Torneios
- Ligas
- Inscricoes
- Jogos e resultados
- Comunicacao
- Relatorios

Responsabilidade:
Separar descoberta do jogador da operacao do organizador.

### Loja/POS

- Vender
- Vendas do dia
- Produtos
- Estoque
- Fechamento

Responsabilidade:
Fluxo de caixa rapido sem poluir financeiro amplo.

### Comunicacao

- WhatsApp
- Notificacoes
- Modelos
- Avisos
- Historico

Responsabilidade:
Padronizar mensagens e acompanhar contatos importantes.

### Relatorios

- Ocupacao
- Receita
- Alunos
- Professores
- Reservas
- Competicoes
- Inadimplencia

Responsabilidade:
Analise, nao execucao.

### Administracao

- Organizacao/unidades
- Equipe
- Permissoes futuras
- Publicacao
- Regras
- Integracoes
- Auditoria
- Avancado

Responsabilidade:
Setup raro e controle estrutural fora da rotina.

## O que sai da estrutura atual

| Atual | Problema | Destino alvo |
|---|---|---|
| Reservas com subabas Hoje/Calendario/Espera/Ajustes | Duplica menu e mistura rotina/config | Agenda > Calendario; detalhes por slot |
| Aulas com agenda/alunos/professores/ajustes em abas | Parece mobile adaptado e mistura dominios | Academia com paginas proprias e professor em Equipe/Pessoas |
| Clientes como atendimento/leads/members misturados | Confunde contato, lead, aluno e socio | Clientes: Clientes ativos, Leads, Alunos, Socios |
| Financeiro dentro de modulo estreito | SaaS precisa dominio amplo | Financeiro completo |
| Competir mostrando modo organizador no Player | Mistura jogador e trabalho | Organizador apenas em Trabalho > Competicoes |
| Configuracoes expostas como rotina | Setup raro compete com dia a dia | Administracao/Configuracoes |

## Paginas de dominio

Cada dominio web deve ter:

- Visao geral do dominio.
- Lista operacional.
- Filtros persistentes.
- Detalhe lateral ou pagina 360.
- Acoes contextuais.
- Historico.
- Configuracoes do dominio.

## Acoes rapidas

Acoes frequentes nao devem virar menu principal:

- Nova reserva.
- Novo cliente.
- Registrar pagamento.
- Enviar WhatsApp.
- Lançar resultado.
- Avisar ausencia.
- Criar bloqueio.
- Vender produto.

Elas aparecem em:

- topbar "Criar";
- contexto de slot/card/detalhe;
- painel de pendencias;
- mobile operacional.

## Mobile Trabalho

Mobile trabalho nao e sidebar compacta. E uma superficie operacional.

### Professor

Bottom nav:

- Hoje
- Agenda
- Turmas
- Alunos
- Perfil

Primeira dobra:
Aulas do dia por horario cheio, turma, alunos, quadra, observacoes, reposicoes. Chamada so aparece se a empresa exigir.

### Recepcao

Bottom nav:

- Hoje
- Agenda
- Reservas
- Pessoas
- Mais

Primeira dobra:
Reservas proximas, conflitos, lista de espera contextual, criar reserva, procurar pessoa.

### Financeiro

Bottom nav:

- Receber
- Vencidos
- Pagos
- Resumo
- Perfil

Primeira dobra:
Vencidos, recebiveis hoje, cobrar, marcar pago.

### Caixa

Bottom nav:

- Vender
- Hoje
- Estoque
- Produtos
- Perfil

Primeira dobra:
Venda rapida e estoque baixo.

### Organizador

Bottom nav:

- Hoje
- Torneios
- Ligas
- Resultados
- Perfil

Primeira dobra:
Competicoes com bloqueios por fase.

### Gestor

Bottom nav:

- Hoje
- Agenda
- Clientes
- Financeiro
- Mais

Primeira dobra:
Pendencias criticas por dominio e atalhos.

## Player App

Player bottom nav recomendado:

- Inicio
- Jogar
- Competir
- Minha Rotina
- Perfil

"Minha Rotina" engloba agenda, aulas, pagamentos e historico pessoais. Rotas antigas podem continuar como entradas filtradas.

## Regra para rotas antigas

Rotas existentes devem continuar funcionando por alias, redirect ou wrapper. Mudanca de arquitetura nao deve quebrar:

- links publicos;
- inscricoes;
- convites;
- `/join`;
- `/inscricao`;
- `/t`;
- admin legado;
- links de remarcacao.

## Critério de navegacao boa

Uma pessoa deve responder em menos de 10 segundos:

- Estou no modo Jogador ou Trabalho?
- Qual unidade/local esta ativo?
- Onde vejo o dia?
- Onde mexo na agenda?
- Onde encontro uma pessoa?
- Onde cobro?
- Onde configuro algo raro?
- Onde esta minha proxima acao?
