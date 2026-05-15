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

Fluxo alvo:

1. escolher categoria;
2. revisar valor/restricoes;
3. confirmar;
4. feedback claro.

Mobile:

- CTA sticky;
- restricoes em sheet;
- pagamento/confirmacao quando existir.

### Criar Torneio

Tipo:

- setup raro/complexo.

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
