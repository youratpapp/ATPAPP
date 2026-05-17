# APP DNA Sprint 02 Report - Locais Hub

Data: 2026-05-17

## Escopo

Item executado:

- `SCREEN-LOCAIS-01 - /locais: hub de intencao`

Item pai parcialmente avancado:

- `PLAYER-LOCATIONS-DNA-01 - Locais por paginas de intencao`

Item iniciado:

- `SCREEN-LOCAIS-02 - /locais/reservar: filtro inicial de reserva`
- `SCREEN-LOCAIS-03 - resultado de reserva sem local escolhido`
- `SCREEN-LOCAIS-04 - agenda de reserva por local e quadra`
- `SCREEN-LOCAIS-05 - confirmacao de reserva`
- `SCREEN-LOCAIS-06 - filtro e resultado de aulas`
- `SCREEN-LOCAIS-07 - envio de interesse em aula`
- `SCREEN-LOCAIS-08 - encontrar jogo`
- `SCREEN-LOCAL-01 - pagina inicial do local`
- `SCREEN-LOCAL-02 - reserva dedicada do local`
- `SCREEN-LOCAL-03 - aulas dedicadas do local`

## Causa do problema

`/locais` tentava resolver descoberta, reserva, aulas, jogos e lista de locais na mesma primeira dobra. Mesmo quando o usuario ainda nao tinha escolhido uma intencao, a tela ja mostrava estados auxiliares e tabs de lista, criando a sensacao de mini-dashboard.

## Mudancas feitas

### SCREEN-LOCAIS-01

- `/locais` sem `intent` agora renderiza somente o hub de escolha.
- O bloco extra `Comece pela intencao` foi removido porque repetia a funcao do proprio hub.
- Os cards do hub deixaram de ter estado ativo quando nenhuma intencao foi escolhida.
- As quatro escolhas continuam preservadas:
  - `Encontrar jogo`;
  - `Reservar quadra`;
  - `Entrar em aula`;
  - `Ver locais`.
- Ao abrir uma intencao, o painel grande vira `places-intent-strip`, um seletor horizontal compacto para trocar de contexto.
- `Todos`, `Seguindo` e `Meus locais` agora aparecem apenas em `Ver locais`, nao em reserva ou aulas.

### SCREEN-LOCAIS-02 parcial

- O filtro de reserva publica passou a iniciar com defaults neutros:
  - UF todas;
  - cidade todas;
  - local vazio;
  - piso qualquer;
  - data atual;
  - horario qualquer;
  - duracao 1h.
- Inputs e selects do grid receberam largura controlada para evitar sobreposicao.
- A segunda linha do filtro foi redistribuida para dar largura real a `Data`, `Hora`, `Duracao` e manter a busca como lupa compacta.
- No mobile, o filtro de reserva passa a ter resumo `Ajustar filtros`, deixando os campos recolhidos ate o usuario pedir.
- O botao de busca continua como icone/lupa para reduzir largura ocupada.

### SCREEN-LOCAIS-03 parcial

- Quando a busca de reserva retorna disponibilidade sem local exato escolhido, o resultado agora e agrupado primeiro por local/academia.
- O card de local mostra:
  - cidade/UF;
  - quantidade de quadras livres;
  - menor preco;
  - pisos disponiveis;
  - ate quatro horarios livres;
  - CTA `Ver horarios`.
- Ao clicar em `Ver horarios`, o usuario vai para a pagina publica do local no contexto de reserva, preservando data/hora/duracao quando houver horario selecionado.
- Quando o usuario escolhe um local exato no autocomplete, o resultado ainda pode mostrar quadras diretamente para selecao.

### SCREEN-LOCAIS-04 parcial

- A pagina publica de local ja opera a reserva por carrossel/seletor de quadras, com slots em horas cheias.
- A disponibilidade e consultada pelo intervalo completo selecionado, entao `2h` usa disponibilidade de duas horas.
- O resumo de confirmacao mostra intervalo, duracao e total proporcional ao preco/hora.
- Ajuste aplicado neste sprint: a hora seguinte de uma reserva `2h` fica marcada como `Incluido` e desabilitada, deixando claro que faz parte do intervalo selecionado.

### SCREEN-LOCAIS-05 verificado

- A confirmacao ja usa o bloco `Reserva vinculada ao perfil`.
- Nome e telefone partem do perfil logado; telefone vira campo editavel apenas quando falta contato.
- O submit grava snapshot de nome/telefone e retorna feedback indicando que a reserva fica em `Gestao > Agenda > Reservas pendentes`.
- Lista de espera segue o mesmo padrao de vinculo ao perfil.

### SCREEN-LOCAIS-06 parcial

- O filtro de aulas agora segue a mesma logica guiada de reserva:
  - UF;
  - cidade;
  - academia ou professor com sugestoes reais;
  - dias da semana em multi-select;
  - periodo;
  - nivel;
  - perfil adulto/kids.
- A busca backend consulta cada dia selecionado e consolida os resultados por turma, evitando duplicidade.
- O fallback local tambem respeita os dias selecionados.
- Turmas equivalentes recorrentes continuam agrupadas por assinatura de local/professor/nivel/horario/valor.
- O resultado mostra os dias disponiveis no grupo e usa CTA `Selecionar turma`.
- Ao selecionar uma turma agrupada, a pagina publica do local recebe todos os `classIds` por query string e pre-seleciona os dias equivalentes para o aluno ajustar antes de enviar interesse.
- O filtro ganhou resumo mobile `Ajustar filtros`; no desktop foi redistribuido em grid de 12 colunas para evitar sobreposicao.

### SCREEN-LOCAIS-07 concluido

- O bloco `Enviar interesse` deixou de parecer cadastro solto.
- O resumo da turma selecionada agora mostra:
  - local;
  - professor;
  - dias/horarios;
  - valor;
  - vagas.
- O interesse fica vinculado ao perfil logado; nome/telefone aparecem como confirmacao.
- WhatsApp so aparece como input quando falta telefone no perfil.
- Mensagem segue opcional.
- Feedback apos envio informa `Aguardando retorno da academia` e explica que aulas aprovadas aparecem na agenda.
- O backend atual ainda usa `createAcademyEnrollment(...)` por turma/dia selecionado; a validacao da aprovacao e calendario pessoal segue pendente no ambiente autenticado.

### SCREEN-LOCAIS-08 parcial

- O filtro de jogos abertos ja usa UF/cidade/local derivados dos locais com chamadas abertas.
- O grid desktop foi ajustado para dar largura suficiente ao campo UF e ao local, reduzindo o risco de sobreposicao.
- `Criar chamada` deixou de competir como CTA primario quando ha jogos listados.
- Quando a busca nao retorna jogo, o empty state oferece `Criar chamada` como proximo passo.
- Rows de jogos mantem a acao principal `Quero jogar` e deixam detalhes/mensagens como secundarios.

### SCREEN-LOCAL-01 parcial

- A pagina publica do local deixou de transformar `overview` automaticamente em reserva/aulas/jogos.
- A home do local agora funciona como vitrine curta:
  - hero com cidade, descricao, oferta inicial e CTA contextual;
  - atalhos para `Reservar`, `Aulas`, `Jogos`, `Planos` e `Sobre/Contato`;
  - tiles resumidos com contadores/precos;
  - poucos destaques acionaveis.
- Formularios completos de reserva, interesse em aula, jogos e planos nao renderizam mais na home.
- `Sobre/Contato` virou intent focada (`intent=about`) com descricao, cidade, contadores e acoes de compartilhar/ver outros locais.
- O detalhe `Quadras e valores` ficou restrito ao contexto de sobre/contato, evitando inventario extra na primeira vitrine.

### SCREEN-LOCAL-02 parcial

- A reserva do local ganhou rota dedicada `/locais/:placeId/reserva`.
- Links antigos com `?intent=booking` continuam funcionando.
- Os atalhos internos passam a navegar para paginas irmas reais:
  - `/reserva`;
  - `/aulas`;
  - `/jogos`;
  - `/planos`;
  - `/sobre`.
- A rota de reserva mantem apenas o fluxo de reserva no corpo, sem renderizar aulas, jogos e planos abaixo.
- A agenda por quadra, hora a hora, confirmacao por perfil logado e lista de espera foram preservadas.

### SCREEN-LOCAL-03 parcial

- Aulas do local ganharam rota dedicada `/locais/:placeId/aulas`.
- Links antigos com `?intent=academy` continuam funcionando.
- A pagina de aulas mantem apenas o fluxo de turmas/interesse no corpo.
- O filtro local agora permite selecionar varios dias por chips, refletindo alunos que querem treinar mais de uma vez por semana.
- O filtro retorna turmas de qualquer dia selecionado e preserva o agrupamento de turmas recorrentes equivalentes.
- A selecao de turma recorrente continua permitindo marcar/desmarcar dias especificos antes de enviar interesse.

### SCREEN-LOCAL-04 parcial

- Jogos do local ganharam rota dedicada `/locais/:placeId/jogos`.
- A pagina renderiza mesmo sem chamada aberta, evitando cair em tela generica.
- A lista local recebeu filtros por data, periodo, nivel e status.
- Chamadas encerradas/canceladas continuam disponiveis para consulta pelo filtro de status, enquanto contadores e hero usam somente chamadas abertas.
- O CTA principal dos itens abertos agora e `Quero jogar`; quando o usuario ja entrou, o estado muda para `Participando`.
- `Criar chamada neste local` virou CTA secundario no topo e tambem aparece nos empty states acionaveis.

### SCREEN-LOCAL-05 parcial

- Planos do local permanecem em rota dedicada `/locais/:placeId/planos`.
- A lista deixou de ser texto passivo e passou a ser composta por cards de produto.
- Cada plano pode iniciar `Ver aulas` ou `Reservar quadra`, conforme o local tem turmas/quadras publicadas.
- Ao abrir aulas, o plano escolhido aparece como contexto para orientar a escolha de dias.
- Ao abrir reserva, a tela avisa que desconto/beneficio precisa ser confirmado pela academia porque ainda nao existe aplicacao automatica no backend.

## Arquivos alterados

- `src/pages/PlacesPage.tsx`
- `src/pages/PlacePublicPage.tsx`
- `src/App.css`
- `docs/EXECUTION_QUEUE.md`
- `docs/CURRENT_PRODUCT_STATE.md`
- `docs/UX_APP_DNA_RESTRUCTURE_REPORT_2026_05_16.md`

## Validacao

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.

## Riscos restantes

- A validacao visual autenticada ainda precisa ser refeita no browser com sessao real, porque o ambiente headless anterior parou no gate de login.
- `SCREEN-LOCAIS-02` ainda precisa de validacao visual autenticada em 1366px, 430px e 390px antes de ser marcado como concluido.
- `SCREEN-LOCAIS-03` ainda precisa de validacao visual autenticada em desktop/mobile; a agenda detalhada por quadra fica para `SCREEN-LOCAIS-04`.
- `SCREEN-LOCAIS-04` ainda precisa de validacao visual autenticada e decisao final sobre CTA sticky no mobile.
- `SCREEN-LOCAIS-05` ainda precisa de validacao autenticada ponta a ponta criando reserva real e conferindo a fila do gestor.
- `SCREEN-LOCAIS-06` ainda precisa de screenshots autenticados em desktop/mobile e validacao ponta a ponta de interesse aprovado pela academia.
- `SCREEN-LOCAIS-07` foi validado ponta a ponta: o jogador puro enviou interesse, a Academia recebeu como matricula pendente, o admin ativou o pedido e a Home do jogador passou a exibir contexto de aula. Evidencias em `web/docs/screenshots/qa-dna-2026-05-17/screen-locais-07-*`.
- `SCREEN-LOCAIS-08` ainda precisa de screenshot autenticado desktop/mobile e avaliacao se o details atual deve virar bottom sheet real no mobile.
- `SCREEN-LOCAL-01` ainda precisa de screenshot autenticado desktop/mobile para confirmar que a primeira dobra parece vitrine e que os atalhos nao empilham modulos em resolucoes pequenas.
- `SCREEN-LOCAL-02` ainda precisa de screenshot autenticado desktop/mobile e teste ponta a ponta criando uma reserva real em `/locais/:placeId/reserva`.
- `SCREEN-LOCAL-03` ainda precisa de screenshot autenticado desktop/mobile e validacao ponta a ponta de interesse aprovado virando matricula/aula do aluno.
- `SCREEN-LOCAL-04` ainda precisa de screenshot autenticado desktop/mobile, validacao do filtro mobile em sheet/resumo e teste ponta a ponta de criar/entrar em chamada.
- `SCREEN-LOCAL-05` ainda precisa de screenshot autenticado desktop/mobile e suporte backend/configuravel para quantidade de aulas por plano e aplicacao automatica de beneficios.
- As intencoes ainda compartilham o mesmo componente grande (`PlacesPage`); a separacao visual foi aplicada, mas a separacao por paginas/rotas dedicadas pode continuar em sprint posterior se a queue exigir.

## SCREEN-COMP-HUB-01 - Entrega parcial

O hub `/eventos` recebeu a primeira consolidacao de intencao:

- a ordem de leitura agora e `Jogando`, `Descobrir` e `Organizando`;
- `Organizando` permanece escondido para jogador puro e vira uma area separada para usuarios com contexto profissional;
- a descoberta usa `loadUpcomingPublic(12)`, exclui eventos ja vinculados ao usuario e ordena por cidade do perfil, estado e destaques gerais;
- os eventos descobertos aparecem em trilho curto/carrossel, reduzindo a sensacao de feed longo no mobile.

Arquivos alterados:

- `src/pages/EventsHubPage.tsx`
- `src/App.css`
- `docs/EXECUTION_QUEUE.md`
- `docs/CURRENT_PRODUCT_STATE.md`
- `docs/APP_DNA_SPRINT_02_REPORT_2026_05_17.md`

Validacao:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- `git diff --check` passou com avisos esperados de CRLF.

Riscos restantes:

- ainda falta screenshot autenticado desktop/mobile do hub;
- descoberta de ligas publicas ainda depende de listagem publica equivalente para entrar no mesmo padrao.

## Proximo passo recomendado

`SCREEN-TOURNAMENT-01` tambem entrou em entrega parcial nesta rodada:

- a aba `Evento` mantem resumo publico, status, data/cidade, CTA principal e poster/info;
- status pessoal do jogador virou chip discreto no hero (`Inscricao aprovada`, `Inscricao em analise`, `Lista de espera`, `Inscricao recusada`);
- `Exportar chave` permanece contextual e aparece quando ha classe gerada;
- `Podio por classe` continua condicionado a torneio finalizado e fora da aba `Jogos`.

Validacao adicional:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- `git diff --check` passou com avisos esperados de CRLF.

`SCREEN-TOURNAMENT-02` tambem entrou em entrega parcial:

- a aba publica `Inscritos` permanece sem ferramentas administrativas;
- participantes confirmados agora podem vir tanto da chave/draft quanto de `tournament_registrations` aprovadas;
- seletor de classe ganhou contagem, select e trilho horizontal de chips para muitas categorias;
- busca por nome foi adicionada com empty state compacto;
- contatos continuam ocultos para leitura publica.

`SCREEN-TOURNAMENT-03` tambem entrou em entrega parcial:

- a aba publica `Jogos` ganhou resumo por classe/fase antes da chave detalhada;
- a lista mostra fase/rodada, jogadores, status e horario/quadra em microcopy curta;
- quando ainda nao ha chave, o estado vazio ficou compacto;
- `Exportar chave` aparece como acao secundaria no resumo quando existe classe gerada;
- no mobile publico, a lista vira a leitura principal e a chave longa deixa de dominar a pagina;
- o envio de resultado pelo jogador continua usando `renderScoreFields`, igual ao admin.

Validacao adicional:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.

`SCREEN-TOURNAMENT-04` tambem entrou em entrega parcial:

- a aba publica `Classificacao` passou a depender de tabela real em `tabelaPorGrupo`;
- torneios mata-mata simples ou sem tabela publicada nao mostram uma aba vazia para o jogador;
- quando a classe ativa nao possui tabela, a leitura publica usa uma classe com classificacao disponivel;
- o fallback deixou de ser uma pagina principal com "Sem tabela" e virou estado compacto.

Validacao adicional:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.

`SCREEN-TOURNAMENT-05` tambem entrou em entrega parcial:

- a aba `Chat`/`Avisos e chat` ganhou estrutura propria para leitura publica;
- mensagem fixada, lista de mensagens e envio agora usam classes dedicadas em vez de estilos inline soltos;
- controles de publicar aviso, fixar/desfixar e excluir continuam condicionados a `canManageComms`;
- jogador nao recebe ferramentas administrativas na primeira camada da comunicacao;
- no mobile, cabecalho, acoes e compose viram coluna para evitar quebra/encavalamento.

Validacao adicional:

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.

`SCREEN-TOURNAMENT-ORG-01` tambem entrou em entrega parcial:

- a aba `Organizacao` deixou de ser redirecionada silenciosamente quando o torneio esta `live` ou `finished`;
- a primeira camada do organizador ganhou um mapa operacional com entradas para Visao geral, Inscricoes, Categorias, Jogos/agenda, Resultados, Comunicacao e Configuracao;
- o mapa usa acoes curtas e contextuais, mantendo a operacao potente sem jogar todas as ferramentas como leitura indiferenciada;
- jogador sem permissao continua usando a experiencia publica separada.

Validacao adicional:

- `git diff --check` passou.
- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.

`SCREEN-LEAGUE-01` tambem entrou em entrega parcial:

- transformar inscricao aprovada em badge/linha curta;
- remover `Classes` como aba independente quando ela funciona apenas como filtro;
- manter seletor de classe contextual nas abas que precisam.

Entrega:

- status pessoal de inscricao na liga publica agora e compacto, sem card grande na primeira dobra;
- classe segue como filtro contextual nas abas Jogadores/Classificacao/Partidas;
- desktop usa um select unico para muitas classes;
- mobile usa trilho horizontal de chips, mantendo toque rapido sem duplicar controle visual;
- o ajuste tambem melhora o filtro publico de torneio que compartilha o mesmo padrao visual.

Validacao adicional:

- `git diff --check` passou.
- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.

`SCREEN-LEAGUE-02` tambem entrou em entrega parcial:

- separar leitura publica de jogadores da operacao de convites/inscricoes/pagamentos;
- manter busca e filtro de classe compactos;
- evitar lista infinita no mobile sem filtro visivel.

Entrega:

- leitura publica de jogadores continua sem `Marcar pago`, aprovar ou rejeitar;
- organizador ganhou workspace especifico para convite e fila de solicitacoes;
- solicitacoes da liga ganharam resumo de status/pagamento e rows com borda por estado;
- acoes financeiras e de aprovacao seguem restritas ao organizador.

Validacao adicional:

- `git diff --check` passou.
- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.

`SCREEN-LEAGUE-03` tambem entrou em entrega parcial:

- filtro por classe, rodada e status;
- minhas partidas como bloco prioritario para jogador;
- sala de partida focada;
- resultado player no mesmo formato do admin.

Entrega:

- aba `Partidas` ganhou filtros por rodada e status;
- jogador continua vendo `Minhas partidas` antes da lista geral;
- lista geral respeita filtros e usa estado vazio compacto;
- sala de partida e formulario de resultado foram preservados.

Validacao adicional:

- `git diff --check` passou.
- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.

`SCREEN-LEAGUE-04` tambem entrou em entrega parcial:

- seletor de classe no topo;
- tabela mobile compacta;
- legenda clara de subida/descida;
- snapshot/salvar visivel apenas para organizador.

Entrega:

- classificacao ganhou legenda explicita para subida, permanencia e descida;
- tabela mobile compacta remove dependencia da largura minima antiga;
- resumo de ativos/zonas/inativos foi preservado;
- snapshot continua condicionado ao organizador.

Validacao adicional:

- `git diff --check` passou.
- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.

## Sprint update - SCREEN-LEAGUE-05

`SCREEN-LEAGUE-05` tambem entrou em entrega parcial:

- Chat/avisos da liga foi alinhado ao padrao visual ja criado para torneios.
- Comunicados fixados agora aparecem em destaque moderado, sem competir com a navegacao.
- Publicar, fixar e remover continuam restritos ao organizador.
- Jogador fica com leitura simples: cabecalho, aviso fixado, feed e campo de mensagem.
- O bloco deixou de depender de estilos inline, reduzindo divergencias entre telas semelhantes.

Validacao adicional:

- `git diff --check` passou.
- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.

Pendencias:

- validar screenshots autenticados em desktop/mobile;
- conferir mensagens longas e chats extensos.

Proximo passo recomendado:

Executar `SCREEN-GESTAO-01`, focando a central de gestao:

- operacao diaria antes de configuracao;
- fila do dia compacta;
- locais/modulos sem empilhar paines administrativos no mobile.

## Sprint update - SCREEN-GESTAO-01

`SCREEN-GESTAO-01` entrou em entrega parcial:

- Fila agregada da central foi limitada a 5 pendencias prioritarias para evitar painel longo na primeira dobra.
- Locais sob gestao aparecem antes de sinais de suporte e implantacao.
- Implantacao guiada passou a ser bloco recolhido, disponivel sem invadir a rotina diaria.
- Em cada local, base incompleta tambem fica recolhida; pendencias e acoes rapidas continuam visiveis.
- Sinais de suporte permanecem como leitura auxiliar abaixo da operacao.

Validacao adicional:

- `git diff --check` passou.
- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.

Pendencias:

- validar screenshots autenticados desktop/mobile;
- conferir locais com muitos modulos em 390px;
- avaliar busca/filtro caso a central tenha muitos locais.

Proximo passo recomendado:

Executar `SCREEN-GESTAO-AGENDA-01`, focando Agenda:

- reservas pendentes antes da lista longa;
- espera acionavel;
- nova reserva/bloqueio como CTA claro;
- exportacao de agenda por quadra funcionando sem titulo cortado.

## Sprint update - SCREEN-GESTAO-AGENDA-01

`SCREEN-GESTAO-AGENDA-01` entrou em entrega parcial:

- A fila operacional da Agenda ficou mais compacta: cada bloco da primeira dobra mostra ate 3 itens e aponta explicitamente para a lista completa quando ha mais pendencias.
- A tela `Hoje` agora coloca reservas pendentes antes das demais e mostra uma faixa curta com a quantidade que precisa de decisao.
- As listas completas de `Reservas` e `Espera` nao renderizam centenas de rows sem filtro: por padrao mostram 24 itens, informam `Mostrando X de Y` e oferecem `Ver todas`/`Ver lista completa`.
- A exportacao de agenda por quadra em torneios passou a quebrar nomes longos em ate 2 linhas, reduzindo risco de titulo cortado no PNG.

Arquivos alterados:

- `src/components/place/PlaceBookingOperationalQueues.tsx`
- `src/components/place/PlaceBookingTodayModule.tsx`
- `src/components/place/PlaceBookingReservationsModule.tsx`
- `src/components/place/PlaceBookingWaitlistModule.tsx`
- `src/pages/TournamentPage.tsx`
- `src/App.css`
- `docs/EXECUTION_QUEUE.md`
- `docs/CURRENT_PRODUCT_STATE.md`
- `docs/APP_DNA_SPRINT_02_REPORT_2026_05_17.md`

Validacao:

- `git diff --check` passou.
- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.

Pendente:

- Validar screenshots autenticados desktop/mobile da Agenda.
- Testar exportacao PNG em torneio com agenda alta no browser real.
- Avaliar se a aba ativa da Agenda deve abrir diretamente em `Hoje` quando houver pendencias criticas.
