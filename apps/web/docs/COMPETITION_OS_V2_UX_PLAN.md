# Competition OS v2 UX Plan

Data: 2026-05-15

Fonte: `WHOLE_APP_ROLE_DESIGN_AUDIT_2026_05_14.md`, `ROLE_BASED_RESTRUCTURE_PLAYBOOK.md`, `USER_ACTIVITY_TEST_PLAN.md`, `CO_WORKER_BROWSER_TEST_PROMPT.md`, screenshots locais e referencias de mercado.

Especificacao executavel: `COMPETITION_OS_V2_IMPLEMENTATION_SPEC.md`.

Politica de legado: `RESTRUCTURE_SOURCE_OF_TRUTH_POLICY.md`. Este plano preserva regras e funcoes de competicao, mas substitui a organizacao antiga quando ela mistura evento publico, setup e operacao.

## Objetivo

Separar claramente:

- jogador que participa de torneio/liga;
- organizador que configura competicao;
- organizador que opera inscricoes, jogos, resultados e publicacao.

Hoje parte da complexidade vem de mostrar essas tres realidades na mesma linguagem visual.

## Principios

1. Jogador ve competicao como evento.
2. Organizador ve competicao como fila operacional.
3. Setup complexo vira wizard.
4. Operacao diaria vira rows.
5. Tabs ficam visiveis antes de resumos.
6. Resumo nao deve empurrar menu.
7. Publicacao e configuracao nao disputam com jogos/inscricoes.

## Areas

### Hub /eventos

Responsabilidade:

- separar Jogando, Organizando e Descobrir.

Status 2026-05-15:

- `COMP-UX-01` concluido;
- `/eventos` renderiza somente o modo ativo;
- `Jogando` concentra participacoes, inscricoes e jogos do usuario;
- `Organizando` concentra fila operacional e entrada para criar/gerir torneio/liga;
- `Descobrir` fica leve, sem fila administrativa;
- mobile usa segmentos horizontais para evitar empilhamento das tres superficies.

Para jogador:

- Meus jogos;
- Minhas inscricoes;
- Descobrir eventos;
- Descobrir ligas.

Para organizador:

- fila operacional em modo Organizar;
- criar torneio/liga como acao de suporte ou CTA de setup quando nao ha competicoes.

Nao deve:

- misturar fila de organizador com descoberta do jogador;
- mostrar criar torneio como CTA principal para jogador puro.

### Evento Publico De Torneio

Responsabilidade:

- explicar e converter inscricao.

Estrutura alvo:

- nome;
- local;
- data;
- status;
- imagem/poster quando existir;
- tabs: Evento, Categorias, Inscritos/Jogos;
- CTA sticky de inscricao ou meus jogos;
- regras resumidas.

Nao deve:

- abrir com KPIs de organizador;
- mostrar fila de aprovacao;
- mostrar configuracao.

### Categoria De Torneio

Responsabilidade:

- permitir entender vaga, publico, formato e inscritos.

Estrutura:

- inscricoes/vagas;
- formato resumido;
- inscritos em rows;
- busca;
- CTA.

### Inscricao

Responsabilidade:

- concluir inscricao sem friccao.

Status 2026-05-15:

- `COMP-UX-03` concluido;
- torneio: `/inscricao/:tournamentId` separa escolha de categoria/classe, dados do jogador, revisao e CTA;
- liga publica: `/eventos/ligas/:leagueId` e `/eventos/ligas/inscricao/:token` mostram valor, tipo de entrada, status e proximo passo;
- usuario ja inscrito nao recebe formulario ativo de reenvio;
- erros comuns de API/permissao/duplicidade sao traduzidos para mensagens amigaveis.

Fluxo alvo:

1. escolher categoria;
2. revisar valor/restricoes;
3. confirmar;
4. feedback claro.

Mobile:

- CTA sticky;
- restricoes em sheet;
- pagamento/confirmacao quando existir.

Gap conhecido:

- restricao de horario de torneio ainda nao e persistida em `tournament_registrations`; enquanto nao houver campo/backend, a UI deve tratar como orientacao para falar com a organizacao, nao como formulario salvo.

### Criar Torneio

Tipo:

- setup raro/complexo.

Status 2026-05-15:

- `COMP-SETUP-01` concluido;
- a criacao em `/eventos` no modo `Organizando` agora abre wizard em vez de formulario curto;
- etapas atuais: `Basico`, `Inscricoes`, `Categorias`, `Formato`, `Agenda` e `Revisar`;
- o fluxo cria estrutura inicial real: dados publicos, prazo/taxa, categorias/classes, formato padrao, quadras/janelas e status inicial;
- o torneio pode nascer como rascunho ou com inscricoes abertas;
- ajustes finos continuam no workspace interno do torneio para nao inflar o fluxo inicial.

Deve virar wizard:

1. Basico: nome, local, data, visibilidade.
2. Inscricoes: prazo, taxa, limite, aprovacao.
3. Categorias: classes, genero, vagas, publico.
4. Formato: grupos/mata-mata, sets, games, criterios.
5. Agenda/quadras: duracao, recursos, distribuicao.
6. Revisar e publicar.

Nao deve:

- ser formulario longo;
- misturar publicacao, categorias, agenda e regras na mesma dobra;
- esconder tabs/etapas.

### Operar Torneio

Tipo:

- rotina operacional.

Deve conter:

- inscricoes pendentes;
- classes incompletas;
- gerar/preparar jogos;
- partidas sem horario;
- resultados pendentes;
- conflitos/confirmacoes;
- publicar/compartilhar.

Comportamento:

- rows com acao primaria;
- drawer/sheet para detalhe;
- configuracao em aba propria;
- publicacao como tarefa visivel, mas secundaria quando jogos estao ativos.

Status 2026-05-15:

- `COMP-OPS-01` concluido;
- owner/staff agora veem uma fila operacional em rows logo apos o contexto do torneio;
- cada row explicita tipo, contexto, impacto e acao primaria real;
- rows atuais cobrem inscricoes pendentes, lista de espera, pagamentos de inscricao, jogos nao gerados, agenda incompleta, resultados enviados por jogador e avisos de indisponibilidade;
- detalhe abre drawer no desktop e bottom sheet no mobile;
- acoes usam backend/servicos existentes: aprovar/rejeitar/lista de espera, marcar pagamento stub, gerar jogos, aplicar resultado oficial e WhatsApp de indisponibilidade;
- alerta separado de indisponibilidade foi fundido na fila para evitar duplicidade visual.

### Criar Liga

Tipo:

- setup raro/complexo.

Wizard:

1. Basico: nome, local, periodo.
2. Jogadores/classes.
3. Formato: grupos, rotacoes, acesso/rebaixamento.
4. Regras de pontuacao.
5. Agenda e disponibilidade.
6. Revisar e publicar.

Status 2026-05-15:

- `COMP-SETUP-02` concluido;
- a criacao em `Ligas que organizo > Criar` agora abre wizard em vez de formulario curto;
- etapas atuais: `Basico`, `Jogadores`, `Formato`, `Pontuacao`, `Agenda` e `Revisar`;
- o fluxo cria estrutura inicial real: registro da liga, temporada inicial, classes, regras de rodada, pontuacao, entrada publica/aprovacao, agenda de jogo e status inicial;
- importacao/convite de jogadores e operacao de rodada continuam no workspace interno da liga para nao transformar setup raro em pagina longa.

### Operar Liga

Responsabilidade:

- rodada atual e ranking.

Primeira leitura:

- rodada atual;
- partidas pendentes;
- resultados aguardando;
- ranking/classificacao;
- comunicacao.

Configuracao profunda fica secundaria.

Status 2026-05-15:

- `COMP-OPS-02` concluido;
- owner agora ve a liga como fila operacional de rodada antes das tabs;
- rows atuais cobrem inscricoes pendentes, pagamento de inscricao aprovada, partidas aguardando organizacao, resultados/WO, confirmacao, disputa/analise admin e geracao da proxima rodada;
- cada row explicita tipo, contexto, impacto e acao primaria real;
- detalhe abre drawer no desktop e bottom sheet no mobile, usando a sala da partida como destino de disponibilidade, resultado, WO e mensagens;
- jogador participante ve apenas `Minha rodada` quando tem partida pendente, sem cockpit de organizador;
- ranking/classificacao e chat continuam preservados como tabs, sem competir com a fila da rodada.

## Componentes Alvo

- `CompetitionPublicEventHeader`;
- `CompetitionPublicTabs`;
- `CompetitionStickyCTA`;
- `CompetitionCategoryCard`;
- `CompetitionParticipantRow`;
- `CompetitionSetupWizard`;
- `CompetitionOrganizerQueue`;
- `MatchActionRow`;
- `RegistrationApprovalRow`;
- `ResultResolutionDrawer`.

## Criterios De Aceite

- jogador nao ve fila de organizador;
- organizador nao precisa cacar proxima tarefa;
- criar torneio/liga tem fluxo por etapas;
- operar torneio/liga usa rows e drawers;
- tabs aparecem antes de resumo pesado;
- evento publico parece evento, nao cockpit;
- mobile 390px com CTA e tabs utilizaveis;
- aprovar/rejeitar inscricao e resultado tem feedback claro.

## Implementacao Parcial Registrada

### 2026-05-15 - COMP-UX-02

Aplicado:

- torneio publico ganhou primeira dobra de evento com status, local/data, poster ou placeholder, fatos essenciais e CTA contextual;
- categorias do torneio aparecem em rail acionavel antes de chave/listas pesadas;
- liga publica ganhou primeira dobra equivalente com temporada, classes, jogadores, CTA e rail de classes;
- CTA sticky mobile foi aplicado para inscricao, acompanhamento ou jogos;
- filas, KPIs e painel de publicacao continuam preservados para owner/staff e nao aparecem na leitura publica.

Status seguinte:

- `COMP-UX-03` foi concluido na sequencia e refinou a conversao de inscricao.

### 2026-05-15 - COMP-UX-03

Aplicado:

- tela de inscricao de torneio virou fluxo em 3 etapas com cards de categoria/classe, dados do atleta, revisao de valor/prazo/restricao e CTA contextual;
- inscricao existente passa a ser carregada e exibida com status real, evitando nova solicitacao duplicada;
- entrada publica em liga e link de convite de liga usam o mesmo contrato visual de revisao/status;
- erros tecnicos comuns foram convertidos para mensagens recuperaveis;
- mobile usa CTA sticky e uma coluna para reduzir leitura de formulario.

Proximo:

- `COMP-OPS-02` aplicou a mesma disciplina operacional para liga, abrindo pela rodada atual e pendencias reais.

### 2026-05-15 - COMP-OPS-01

Aplicado:

- fila de torneio passou de cards de contagem para rows acionaveis;
- o organizador consegue resolver tarefas recorrentes sem entrar primeiro em uma aba profunda;
- drawers concentram detalhe e acoes secundarias;
- quando ha mais de 8 tarefas, a UI declara o recorte e oferece entrada para a lista completa;
- jogador/publico continua sem ver cockpit operacional.

Proximo:

- `COMP-OPS-02` transformou liga em operacao por rodada atual, partidas pendentes e resultados/WO.
