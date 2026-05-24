# Deep Product Sweep

Data: 2026-05-24

## Escopo

Nova varredura executada sobre paginas, funcoes visiveis, botoes, links, controles, console, overflow e cliques seguros.

Artefatos:

- Web desktop 1366 + desktop amplo: `artifacts/deep-product-sweep-2026-05-24-web-pass/deep-product-sweep-report.json`
- Mobile 430: `artifacts/deep-product-sweep-2026-05-24-mobile/deep-product-sweep-report.json`
- Cliques seguros em areas criticas: `artifacts/deep-product-sweep-2026-05-24-critical-clicks/deep-product-sweep-report.json`
- Screenshots por rota nas mesmas pastas.

Ferramenta criada:

- `scripts/deep-product-sweep.mjs`
- Comando base: `npm run qa:deep-sweep`

## Cobertura

Rotas auditadas:

- Player: Inicio, Jogar/Locais, Reservar, Aulas, Partidas, Competir, Torneios, Ligas, Agenda, Ranking e Perfil.
- Trabalho: Central, Inicio, Agenda, Reservas, Nova reserva, Ajustes, Academia Hoje, Calendario, Turmas, Alunos, Pendencias, Clientes Ativos, Leads, Rotina, Financeiro, POS, Comunicacao, Relatorios, Equipe e Administracao.
- Competition OS: Hub organizador, Torneios/Ligas work, Torneio Jogos/Jogadores/Classificacao/Organizacao/Chat e Liga detalhe/chat.

Quantidade:

- 110 paginas/viewport no web desktop.
- 55 paginas/viewport no mobile 430.
- 11 rotas criticas com cliques seguros.
- 85 cliques seguros tentados em tabs, filtros, cards e navegacao nao destrutiva.

## Resultado Automatizado

Web desktop:

- 110 execucoes.
- 157 achados automaticos.
- Tipos:
  - `sem-h1`: 60
  - `alvo-click-pequeno`: 50
  - `labels-duplicados`: 36
  - `texto-cortado-em-controle`: 11

Mobile 430:

- 55 execucoes.
- 61 achados automaticos.
- Tipos:
  - `sem-h1`: 30
  - `labels-duplicados`: 19
  - `texto-cortado-em-controle`: 6
  - `alvo-click-pequeno`: 6

Cliques criticos:

- 11 paginas.
- 18 achados.
- 1 problema real de console/network.

## Leitura Humana Dos Achados

Nem todo achado automatico e bug direto. A interpretacao correta:

- `sem-h1`: problema estrutural recorrente nas paginas internas de Trabalho. Visualmente existe titulo, mas ele nao esta marcado como `h1`, o que enfraquece semantica, consistencia de pagina e auditoria.
- `labels-duplicados`: em calendario/listas pode ser esperado (`Livre`, `WhatsApp`, `Aprovar`), mas denuncia que muitas acoes repetidas nao tem contexto suficiente no rotulo acessivel.
- `alvo-click-pequeno`: varios botoes compactos estao bons visualmente, mas ainda abaixo do alvo minimo para mobile/acessibilidade.
- `texto-cortado-em-controle`: achado importante. Aparece em Agenda, Turmas, Pendencias, Clientes Rotina, Financeiro Planos, Comunicacao e Administracao Publica.

## Problemas Reais Encontrados

### P0 - Financeiro: botao/acao de cobranca dispara RPC 400 em loop

Onde:

- `work-financeiro-recebiveis`
- Relatorio: `artifacts/deep-product-sweep-2026-05-24-critical-clicks/deep-product-sweep-report.json`

Sintoma:

- Clique seguro em acao financeira disparou muitas chamadas `400` para:
  - `app_create_payment_reminder_for_participant`

Impacto:

- Fluxo de cobranca fica inseguro.
- Usuario pode clicar em cobrar e nao entender se mensagem/cobranca foi gerada.
- Console fica poluido e mascara outros problemas.

Correcao esperada:

- Validar payload antes da RPC.
- Desabilitar/explicar acao quando o recebivel nao for de participante compativel com essa RPC.
- Separar cobranca de mensalidade/reserva/pacote de cobranca de inscricao.
- Registrar erro visivel quando a acao nao puder ser completada.

### P0 - Agenda: tabs Dia/Semana/Lista/Remarcacoes/Canceladas/Conflitos nao mudam rota nem deixam estado auditavel

Onde:

- `work-agenda-dia`
- Cliques seguros: `Dia`, `Semana`, `Lista`, `Remarcacoes`, `Canceladas`, `Conflitos`

Sintoma:

- Todos os cliques mantiveram a rota `#/gestao/:placeId/agenda?visao=calendario`.
- A auditoria nao conseguiu diferenciar estado/tela apos clique.

Impacto:

- Confirma a percepcao do usuario: botoes parecem tabs, mas podem nao estar funcionando de forma previsivel.
- Estado nao fica compartilhavel por URL.
- QA automatizado nao consegue validar cada subvisao.

Correcao esperada:

- Cada tab deve atualizar query param ou estado roteavel:
  - `modo=dia`
  - `modo=semana`
  - `modo=lista`
  - `modo=remarcacoes`
  - `modo=canceladas`
  - `modo=conflitos`
- Semana deve escolher uma quadra por vez.
- Lista deve virar tabela compacta.
- Remarcacoes/Canceladas/Conflitos devem renderizar listas focadas, nao manter a mesma grade.

### P1 - Trabalho interno sem titulo semantico padrao

Onde:

- Quase todas as rotas internas de Trabalho e Competition OS work.

Sintoma:

- Visual existe, mas `h1` nao e detectado.

Impacto:

- Cada tela parece componente interno dentro de uma pagina maior, nao pagina SaaS com responsabilidade propria.
- Piora acessibilidade, teste automatizado e consistencia do shell.

Correcao esperada:

- Criar um `SaasPageHeader`/`WorkPageTitle` unico com `h1` real.
- Usar em Agenda, Academia, Clientes, Financeiro, POS, Comunicacao, Relatorios, Equipe, Administracao e Competition OS.
- Manter visual compacto, sem aumentar altura do topo.

### P1 - Agenda ainda gera densidade e corte em celulas/controles

Onde:

- `work-agenda-dia`
- `work-agenda-reservas`
- mobile `work-agenda-dia`

Sintomas:

- `texto-cortado-em-controle`
- `Livre` repetido 84 vezes no desktop.
- Botoes/celulas pequenas ainda aparecem como alvos abaixo do minimo.

Impacto:

- A agenda esta mais proxima do alvo, mas ainda nao entrega totalmente o padrao da referencia: grade unica, reta, clara e detalhe lateral sempre limpo.

Correcao esperada:

- Nao repetir horario dentro do bloco quando a linha ja indica horario.
- Reduzir rotulo de celula para nome/status curto.
- Adicionar `aria-label` contextual completo sem poluir visual.
- Garantir detalhe lateral para qualquer ocupacao clicada.
- Ajustar grid para nao cortar ultima quadra em 1366.

### P1 - Academia Turmas/Alunos/Pendencias ainda tem cortes e repeticao de acoes

Onde:

- `work-academia-turmas`
- `work-academia-alunos`
- `work-academia-pendencias`

Sintomas:

- Turmas tem `texto-cortado-em-controle`.
- Pendencias tem `Aprovar` repetido 20 vezes sem contexto acessivel.
- Mobile mantem texto cortado em turmas/pendencias.

Impacto:

- O formato ja migrou para lista, mas ainda precisa acabamento de SaaS: tabela compacta com linha selecionada + detalhe lateral e acoes contextuais nomeadas.

Correcao esperada:

- Padronizar tabelas de Turmas/Alunos como Clientes.
- Usar drawer lateral para detalhes/edicao.
- Acoes repetidas devem ter labels contextuais invisiveis: `Aprovar reposicao de Ana`, `Aprovar matricula de Joao`.
- Pendencias deve ser uma fila de trabalho propria, nao card grid.

### P1 - Clientes Leads/Rotina repetem WhatsApp/Registrar retorno sem contexto suficiente

Onde:

- `work-clientes-leads`
- `work-clientes-rotina`

Sintomas:

- `WhatsApp` repetido 19 vezes.
- `Registrar retorno` repetido 18 vezes.
- Mobile repete o mesmo problema.

Impacto:

- Visualmente pode estar ok em tabela, mas para operacao e acessibilidade falta contexto por pessoa.
- O usuario entende a linha, mas QA/acessibilidade ve acoes indistintas.

Correcao esperada:

- Manter texto visual curto.
- Adicionar `aria-label` contextual por pessoa.
- No drawer, centralizar acoes principais: Cobrar, WhatsApp, Nova reserva, Abrir aulas, Registrar retorno.

### P1 - Financeiro Planos/Pacotes parece funcionalmente ruidoso

Onde:

- `work-financeiro-planos`

Sintomas:

- `Consumir 1` repetido 10 vezes.
- `Pausar` repetido.
- `0` aparece como label duplicado.
- Texto cortado em desktop e mobile.

Impacto:

- A tela parece lista operacional de pacotes sem hierarquia suficiente.
- Acoes parecem perigosas/repetitivas demais para ficarem soltas em cada linha.

Correcao esperada:

- Tabela compacta + drawer do pacote/plano.
- Acoes de consumo/pausa dentro do detalhe lateral.
- Linha mostra apenas status, saldo, cliente e proximo passo.

### P2 - Ranking e Player Jogar possuem duplicidade de labels

Onde:

- `player-ranking`: `Seguir` repetido 12 vezes.
- `player-jogar-partidas`: `Quero jogar` repetido 3 vezes.

Impacto:

- Menor que Trabalho, mas ainda deve receber labels contextuais e copy mais especifica.

Correcao esperada:

- `Seguir Rafael`, `Seguir Ana`.
- `Quero jogar amistoso`, `Quero jogo ranqueado`, etc.

### P2 - Torneio/Liga repetem acoes e campos tecnicos como labels

Onde:

- `tournament-jogos`: `set 1 games a/b` repetido.
- `tournament-jogadores`: `-` repetido 45 vezes.
- `league-detail`: `Detalhes`, `Abrir sala` repetidos.
- `league-chat`: `Remover`, `Fixar` repetidos.

Impacto:

- Parte vem de inputs de placar/tabelas, mas precisa labels contextuais para operacao profissional.

Correcao esperada:

- Labels acessiveis por partida/jogador.
- Evitar botao com texto `-` sem contexto.
- Acoes de chat devem dizer qual mensagem/post sera removido/fixado.

## Queue De Correcao Recomendada

### SWEEP-FIX-01 - Corrigir cobranca financeira 400

Objetivo:

- Parar erro `app_create_payment_reminder_for_participant` em recebiveis.

Aceite:

- Clicar em Cobrar nunca gera 400 silencioso.
- Se a cobranca nao se aplica, botao fica desabilitado com explicacao ou usa fluxo correto.

### SWEEP-FIX-02 - Tornar tabs da Agenda roteaveis e funcionais

Objetivo:

- Dia/Semana/Lista/Remarcacoes/Canceladas/Conflitos precisam trocar estado real e auditavel.

Aceite:

- Cada tab muda URL/query ou estado detectavel.
- Semana mostra uma quadra por vez.
- Lista, Remarcacoes, Canceladas e Conflitos nao renderizam a mesma grade.

### SWEEP-FIX-03 - Padronizar cabecalho semantico das paginas Trabalho

Objetivo:

- Todas as telas internas com `h1` real, titulo curto, contexto e CTA principal.

Aceite:

- Auditoria deixa de marcar `sem-h1` nas telas principais.
- Visual continua compacto.

### SWEEP-FIX-04 - Agenda compacta final

Objetivo:

- Ajustar grade para o padrao reto/linear da referencia.

Aceite:

- Sem horario duplicado dentro dos blocos.
- Sem corte da ultima quadra em 1366.
- Clicar em ocupacao abre detalhe lateral.
- Labels acessiveis contextuais.

### SWEEP-FIX-05 - Academia em tabela + drawer

Objetivo:

- Turmas, Alunos e Pendencias com listas compactas, linha selecionavel e detalhe lateral.

Aceite:

- Sem modal central quebrado.
- Sem cards grandes de pendencia.
- Sem texto cortado.

### SWEEP-FIX-06 - Clientes/CRM com labels contextuais

Objetivo:

- Manter tabela compacta e tornar acoes repetidas contextuais.

Aceite:

- `WhatsApp` e `Registrar retorno` podem ser visualmente curtos, mas precisam `aria-label` com nome do cliente.

### SWEEP-FIX-07 - Financeiro Planos/Pacotes como detalhe lateral

Objetivo:

- Reduzir ruido de `Consumir 1`, `Pausar`, saldos e acoes repetidas.

Aceite:

- Linha compacta; acoes sensiveis dentro do drawer.

### SWEEP-FIX-08 - Competition OS labels operacionais

Objetivo:

- Dar contexto a placares, remover/fixar, detalhes e sala.

Aceite:

- Auditoria nao aponta labels tecnicos repetidos como `-` ou `set 1 games a`.

## Observacao Importante

A varredura confirma que o produto melhorou em varias rotas, mas ainda existe um padrao de problema transversal:

- Muitas telas internas sao componentes dentro de um shell, nao paginas SaaS semanticamente completas.
- Varias listas usam a mesma acao curta repetida sem contexto acessivel.
- A Agenda precisa virar definitivamente o componente de grade profissional, com tabs reais e detalhe lateral.
- Financeiro tem bug funcional de cobranca que deve ser tratado antes de polimento visual.

Esta fila deve ser a proxima fonte de correcao operacional antes de qualquer nova rodada estetica solta.
