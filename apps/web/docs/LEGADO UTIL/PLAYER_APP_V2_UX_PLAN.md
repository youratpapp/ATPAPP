# Player App v2 UX Plan

Data: 2026-05-15

Fonte: `WHOLE_APP_ROLE_DESIGN_AUDIT_2026_05_14.md`, `ROLE_BASED_RESTRUCTURE_PLAYBOOK.md`, screenshots locais e referencias de mercado.

Especificacao executavel: `PLAYER_APP_V2_IMPLEMENTATION_SPEC.md`.

Politica de legado: `RESTRUCTURE_SOURCE_OF_TRUTH_POLICY.md`. Este plano nao preserva layout antigo por inercia. Ele preserva funcoes validas e reposiciona a experiencia para a v2.

## Objetivo

Transformar o Player App em uma experiencia leve, bonita, intuitiva e pratica para o jogador comum.

O jogador nao quer operar uma academia. Ele quer:

- jogar;
- reservar;
- competir;
- acompanhar compromissos;
- resolver pendencias proprias;
- manter perfil esportivo simples.

## Principios

1. Mostrar menos, mas mostrar o certo.
2. Priorizar acao, nao dashboard.
3. Separar jogador de gestor/professor/organizador.
4. Mobile primeiro.
5. Fluxos curtos, com sheets e CTA fixo.
6. Dados pessoais/proprios apenas quando acionaveis.
7. Sem KPIs institucionais na abertura do jogador.

## Navegacao Alvo

Mobile:

- Inicio
- Jogar
- Locais ou Reservar
- Competir
- Perfil

Regras:

- `Gestao` nao aparece para jogador puro.
- `Organizar` so aparece para quem organiza, preferencialmente como modo separado ou entrada contextual.
- Se o usuario tem multiplos papeis, o Player App continua leve e mostra acesso profissional de forma discreta.

## /inicio

Responsabilidade:

- orientar o jogador para a proxima acao.

Primeira dobra alvo:

- se ha compromisso: mostrar apenas o proximo compromisso + CTA.
- se ha pendencia real: mostrar a pendencia + CTA.
- se nao ha nada: perguntar "O que voce quer fazer hoje?".

Acoes principais:

- Reservar quadra;
- Encontrar jogo;
- Competir;
- Ver meu compromisso.

Nao deve conter na primeira dobra:

- resumo de clube;
- KPI global;
- cards duplicados de agenda/agora;
- avisos passivos;
- area profissional pesada;
- conteudo administrativo.

Componentes alvo:

- `PlayerTodayFocus`;
- `PlayerIntentRail`;
- `PlayerCommitmentCard`;
- `PlayerNoticeRow`;
- `PlayerProfessionalEntry` discreto.

Status 2026-05-15:

- implementado em `PLAYER-UX-01`;
- `/inicio` prioriza pendencias/agenda do jogador ou intencoes simples quando nao ha dado acionavel;
- area profissional aparece como `Trabalho`, sem ocupar a abertura do Player App;
- os proximos refinamentos devem partir de `/locais`, reserva, aulas e jogos, sem reintroduzir dashboard pesado.

## /locais

Responsabilidade:

- iniciar descoberta por intencao.

Fluxos:

1. Reservar quadra
2. Entrar em aula
3. Encontrar jogo/jogadores
4. Ver locais proximos/favoritos

Comportamento:

- antes da escolha, mostrar tiles compactos;
- depois da escolha, mostrar filtros especificos daquele fluxo;
- filtros complexos em bottom sheet;
- resultado deve ser direto:
  - quadra livre;
  - turma com vaga;
  - jogo/chamada;
  - local publico.

Nao deve conter:

- planos/mensalidade para jogador nao aluno;
- cockpit de local;
- ficha completa antes da intencao;
- texto longo explicando o sistema.

Status 2026-05-15:

- implementado em `PLAYER-UX-02`;
- `/locais` abre com intencoes compactas para reservar quadra, entrar em aula, encontrar jogo e ver locais;
- Home envia o jogador direto para a intencao correta;
- `Ver locais` tem busca propria e tabs funcionais para todos/seguindo/meus locais;
- o fluxo completo de reserva fica para `PLAYER-UX-03`.

## Reserva De Quadra

Fluxo alvo:

1. Onde?
2. Quando?
3. Qual horario/quadra?
4. Confirmar.

Mobile:

- sheets para local/data/hora;
- cards de slot com preco e disponibilidade;
- CTA sticky "Solicitar reserva" ou "Reservar";
- lista de espera aparece como alternativa quando nao ha disponibilidade.

Status 2026-05-15:

- implementado em `PLAYER-UX-03` na pagina publica do local;
- fluxo atual organiza a reserva em 3 passos visiveis: quando, horario/quadra e confirmacao;
- disponibilidade publica usa slots livres retornados por `searchAvailableCourts` e deixa horarios ocupados fora da lista;
- `Solicitar reserva` persiste via `createCourtBooking`;
- `Lista de espera` usa `joinCourtBookingWaitlist` como alternativa real quando o horario nao esta livre;
- `PLAYER-UX-04` tambem foi concluido; o proximo foco P0 passa para Competition OS.

## Entrar Em Aula

Fluxo alvo:

1. esporte/nivel;
2. cidade/local;
3. dia/periodo;
4. turma com vaga;
5. solicitar/matricular.

Regras:

- aluno existente ve contexto proprio;
- nao aluno ve somente turmas/ofertas publicas;
- mensalidade propria aparece so depois de inscricao/matricula.

Status atual:

- `PLAYER-UX-04` concluido em 2026-05-15;
- `/locais?intent=classes` usa linguagem de entrada em aula e devolve turma como resultado;
- pagina publica do local usa fluxo em 3 passos: perfil, turma com vaga e envio de interesse;
- turma escolhida aparece como resumo antes do formulario, sem duplicar lista/select;
- `createAcademyEnrollment` continua sendo o caminho real de solicitacao.

## Encontrar Jogo

Fluxo alvo:

1. esporte;
2. nivel;
3. cidade/local/data;
4. jogos disponiveis;
5. criar jogo ou entrar.

Nao transformar em rede social pesada.

## /eventos Para Jogador

Responsabilidade:

- competir e acompanhar eventos.

Primeira leitura:

- Meus jogos;
- Minhas inscricoes;
- Eventos abertos;
- Ligas abertas;
- Resultado pendente, se houver.

Nao deve conter:

- fila de organizador;
- setup;
- publicacao;
- KPIs de operacao.

## Evento Publico

Responsabilidade:

- converter inscricao e permitir acompanhamento.

Estrutura:

- topo com nome, local, data e status;
- imagem/poster quando existir;
- tabs visiveis: Evento, Categorias, Inscritos/Jogos;
- CTA sticky;
- categorias como cards compactos;
- inscrito em bottom sheet/drawer curto.

## Ranking

Responsabilidade:

- ajudar o jogador a entender sua posicao.

Primeira dobra alvo:

- minha posicao;
- minha classe/cidade;
- filtros basicos.

Depois:

- lista de ranking;
- regras/explicacao;
- KPIs globais em area secundaria.

Nao abrir com dashboard geral grande.

## Perfil

Responsabilidade:

- identidade, preferencias esportivas, historico proprio e conta.

Secoes:

- Perfil publico;
- Preferencias de jogo;
- Historico;
- Pagamentos/planos proprios se existirem;
- Notificacoes/conta.

Nao deve virar cockpit.

## Criterios De Aceite Player App v2

- jogador puro nao ve gestao;
- primeira dobra do Inicio tem uma acao obvia;
- Locais nao abre como explicacao longa;
- reserva pode ser iniciada em poucos toques;
- evento publico tem CTA claro;
- ranking abre centrado no jogador;
- perfil nao tem painel administrativo;
- mobile 390px sem empilhamento excessivo;
- qualquer pendencia exibida e acionavel.
