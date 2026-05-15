# Player App v2 Implementation Spec

Data: 2026-05-15

Status: especificacao para implementacao. Este documento deve orientar coders, designers e QA.

Fontes:

- `RESTRUCTURE_SOURCE_OF_TRUTH_POLICY.md`
- `WHOLE_APP_ROLE_DESIGN_AUDIT_2026_05_14.md`
- `ROLE_BASED_RESTRUCTURE_IMPLEMENTATION_SPEC.md`
- `ROLE_BASED_RESTRUCTURE_PLAYBOOK.md`
- screenshots locais em `web/docs/screenshots/whole-app-role-audit-2026-05-14/`
- referencias de mercado: Playtomic, MATCHi, CourtReserve, PlayByPoint, OpenCourt, Anolla, RacketPal.

## Politica De Legado

Use MDs antigos apenas para confirmar funcoes existentes e regras de negocio. Nao carregue para o Player App v2 padroes antigos de dashboard, cards administrativos, KPIs institucionais ou areas profissionais visiveis para jogador puro.

Se uma funcao antiga pertence ao jogador, reposicione no fluxo correto. Se pertence ao gestor, organizador, recepcao, financeiro ou professor, remova da primeira leitura do jogador e mantenha na superficie profissional correspondente.

## Objetivo

Fazer o jogador comum sentir que o app e simples, rapido e feito para jogar. O Player App nao deve parecer uma area administrativa resumida.

O jogador deve conseguir:

- ver proximo compromisso;
- reservar quadra;
- encontrar jogo;
- entrar em aula;
- competir;
- acompanhar ranking/perfil;
- resolver pendencias proprias.

## Nao Objetivos

- Nao mostrar operacao de clube.
- Nao mostrar KPIs administrativos.
- Nao transformar o app em rede social.
- Nao exibir plano/mensalidade se o usuario nao e aluno/socio.
- Nao expor configuracoes internas de torneio/academia.

## Informacao Permitida No Player App

Pode aparecer:

- reservas do proprio usuario;
- inscricoes do proprio usuario;
- jogos do proprio usuario;
- aulas/matriculas do proprio usuario;
- creditos/reposicoes do proprio usuario;
- eventos/locais/turmas publicos;
- ranking publico;
- pagamentos proprios.

Nao pode aparecer:

- recebiveis de outros usuarios;
- fila de secretaria;
- fila de organizador, exceto entrada discreta se o usuario tambem e organizador;
- CRM;
- cantina;
- configuracao de local;
- alunos de professor/academia;
- todos os pagamentos de academia.

## IA Alvo

### Bottom Nav Mobile

Padrao alvo:

- Inicio
- Jogar ou Locais
- Competir
- Ranking
- Perfil

Se `Reservar` virar item proprio, substituir `Locais` apenas se a experiencia local for majoritariamente reserva.

Regras:

- `Gestao` nao aparece para jogador puro.
- `Organizar` nao aparece para jogador puro.
- Multi-papel pode receber uma entrada discreta, mas nao deve transformar a nav principal em cockpit.

## /inicio - Especificacao

### Pergunta Da Tela

```text
O que o jogador precisa fazer agora?
```

### Prioridade De Conteudo

1. Pendencia propria urgente.
2. Proximo compromisso confirmado.
3. Intencoes de jogar.
4. Atualizacoes secundarias.
5. Entrada profissional discreta, se existir.

### Regras De Prioridade

Pendencia urgente inclui:

- reserva aguardando confirmacao;
- convite de lista de espera liberado;
- resultado que o jogador precisa enviar/confirmar;
- inscricao que precisa completar pagamento/confirmacao;
- aula/reposicao que exige acao do aluno.

Nao e pendencia:

- reserva confirmada futura;
- espera passiva sem convite;
- credito de reposicao aberto sem data limite imediata;
- aviso informativo;
- evento organizado pelo usuario, se ele esta no modo jogador.

### Layout Mobile Alvo

Primeira dobra:

```text
[Avatar/nome compacto]                [notificacao]

[PlayerFocusCard]
Titulo: Proximo compromisso / Acao pendente / Seu dia esta livre
Detalhe curto
[CTA primaria]

[PlayerIntentRail]
Reservar quadra | Encontrar jogo | Competir
```

Se nao houver compromisso:

```text
Seu dia esta livre
Escolha como quer jogar hoje
[Reservar quadra] [Encontrar jogo] [Competir]
```

### Remover/Fundir

- `Agora` e `Agenda` nao devem mostrar o mesmo compromisso em cards diferentes.
- `Clube` nao aparece como card principal se nao ha acao.
- Area profissional vira row discreta:

```text
Area profissional
3 tarefas para resolver
[Abrir]
```

### Componentes

- `PlayerHomePage`
- `PlayerFocusCard`
- `PlayerIntentRail`
- `PlayerSecondaryFeed`
- `PlayerProfessionalEntry`

### Dados

Criar/usar agregador que retorne:

- `priorityAction`;
- `nextCommitment`;
- `intentCounts`;
- `secondaryUpdates`;
- `professionalSummary` se aplicavel.

Nao carregar CRM, cantina ou dados administrativos completos.

### Estados

Loading:

- skeleton compacto de focus card e intent rail.

Erro:

- "Nao foi possivel carregar seus compromissos agora. Tente novamente."
- Nao mostrar erro tecnico.

Vazio:

- "Seu dia esta livre. Escolha como quer jogar hoje."

### Criterios De Aceite

- mobile 390px mostra no maximo um bloco principal antes dos atalhos;
- apenas uma CTA primaria na primeira dobra;
- reserva confirmada nao aparece duplicada;
- jogador puro nao ve gestao;
- multi-papel ve area profissional secundaria;
- sem paragrafo longo.

## /locais - Especificacao

### Pergunta Da Tela

```text
O que voce quer encontrar?
```

### Intencoes

1. Reservar quadra.
2. Entrar em aula.
3. Encontrar jogo.
4. Ver locais proximos/favoritos.

### Layout Inicial Mobile

```text
Locais
[Search opcional: cidade/local]

[IntentTile] Reservar quadra
[IntentTile] Entrar em aula
[IntentTile] Encontrar jogo
[IntentTile] Ver locais
```

Cada tile deve ser curto. Nao usar texto explicativo longo.

### Ao Selecionar Reservar Quadra

Mostrar:

- chips de local/cidade;
- data;
- periodo/hora;
- duracao;
- botao buscar;
- resultados de slots.

Filtros avancados em sheet.

Resultado:

- lista de `AvailabilitySlotCard`.

Sem resultado:

- mensagem inline;
- CTA "Tentar outro horario";
- CTA "Entrar na lista de espera", se existir.

### Ao Selecionar Entrar Em Aula

Mostrar:

- nivel;
- dia/periodo;
- cidade/local;
- tipo infantil/adulto quando aplicavel;
- resultados de turmas com vaga.

Resultado:

- `LessonOfferingCard` com local, turma, professor, dia/hora, vagas, preco/mensalidade se publico.

Regra:

- nao aluno nao ve dados internos da turma;
- aluno logado pode ver suas aulas/reposicoes proprias.

Status implementado em 2026-05-15:

- `PlacesPage.tsx` usa `/locais?intent=classes` como entrada direta para `Entrar em aula`;
- `PlacePublicPage.tsx` organiza aula publica em perfil, turma e envio de interesse;
- `LessonOfferingCard` foi implementado como card de turma dentro do DNA atual, com horario, professor, nivel, vaga e valor publico;
- a solicitacao persiste via `createAcademyEnrollment`;
- erro tecnico nao e exibido cru para jogador.

### Ao Selecionar Encontrar Jogo

Mostrar:

- esporte;
- nivel;
- cidade/local;
- data;
- jogos/chamadas.

Resultado:

- `OpenMatchCard`;
- CTA entrar/criar.

### Ao Selecionar Ver Locais

Mostrar:

- busca;
- proximos;
- favoritos/seguindo;
- cards de local com imagem/logo, cidade e CTA.

### Componentes

- `PlayerLocationIntentPicker`
- `PlayerLocationFilterSheet`
- `AvailabilitySlotCard`
- `LessonOfferingCard`
- `OpenMatchCard`
- `VenueListRow`

### Criterios De Aceite

- usuario nao precisa ler explicacao para iniciar;
- cada intencao carrega somente os filtros relevantes;
- resultados sao acionaveis;
- sem ficha completa de academia antes de escolher intencao;
- mobile sem cards gigantes de texto.

## Reserva - Especificacao

### Fluxo

1. Escolher local/cidade.
2. Escolher data.
3. Escolher horario/duracao.
4. Escolher slot/quadra.
5. Confirmar.

### Confirmacao

Tela/sheet deve mostrar:

- local;
- quadra;
- data/hora;
- duracao;
- preco;
- status de confirmacao;
- regra de cancelamento se existir;
- CTA final.

### Backend

Usar funcoes existentes antes de criar novas:

- disponibilidade de quadra;
- criar reserva;
- criar espera;
- pagamento/status se existente.

Se uma acao nao persistir:

- nao criar botao falso;
- documentar gap.

### Status 2026-05-15

`PLAYER-UX-03` implementou a primeira versao do fluxo na pagina publica do local:

- local ja esta definido pela pagina publica;
- jogador escolhe data/duracao, ve slots livres e confirma dados;
- horarios ocupados nao sao renderizados como lista longa;
- `createCourtBooking` cria a solicitacao;
- `joinCourtBookingWaitlist` cria espera quando nao ha disponibilidade;
- falta ainda evoluir a descoberta cross-local em `/locais?intent=booking` para cards de disponibilidade mais ricos, se a proxima rodada de QA pedir.

## Competir Como Jogador

### /eventos em modo jogador

Primeira leitura:

- meus jogos;
- minhas inscricoes;
- eventos abertos;
- ligas abertas.

Nao mostrar:

- fila de organizador;
- setup;
- publicar;
- criar torneio como CTA principal.

## Ranking - Especificacao

### Primeira dobra

Mostrar:

- minha posicao, se existir;
- recorte atual: cidade/classe/liga;
- filtros principais.

Depois:

- lista de ranking;
- regras;
- KPIs globais.

Nao abrir com:

- 3 KPIs globais enormes;
- explicacao institucional.

## Perfil - Especificacao

### Secoes

- Perfil publico;
- Preferencias de jogo;
- Historico esportivo;
- Aulas/mensalidades proprias, se existirem;
- Conta/notificacoes.

### Regras

- perfil de professor nao deve misturar com perfil de jogador comum;
- dados sensiveis de pagamento ficam privados;
- historico e ranking devem ser leitura, nao painel.

## QA Player App

Testar em 390px:

- jogador puro sem gestao;
- jogador com reserva confirmada;
- jogador com pendencia;
- aluno com aula/reposicao;
- multi-papel com area profissional.

Fluxos:

- abrir inicio;
- reservar quadra;
- procurar aula;
- encontrar jogo;
- abrir evento publico;
- inscrever-se;
- ver ranking;
- editar perfil.
