# PLAYER-UX-04A - Entrar em aula

Data: 2026-05-15

## Objetivo

Corrigir a experiencia publica de `Entrar em aula` depois da simplificacao do Player App:

- filtro legivel e sem overflow;
- busca de turmas com resultado direto;
- selecao de dias quando uma turma se repete;
- pagina publica focada em aulas quando o jogador vem desse fluxo.

## Causa

O fluxo estava tecnicamente funcional, mas ainda misturava dois problemas de UX:

- o grid do filtro tentava colocar sete campos e o CTA na mesma linha, causando corte de texto e botao fora do container;
- o clique em `Ver turma` levava para a pagina publica completa do local, onde reserva, aulas, jogos, planos e quadras voltavam a competir pela atencao.

Tambem faltava um modelo visual para turmas recorrentes: quando a mesma turma acontece em mais de um dia, o aluno precisa escolher os dias especificos.

## Correcoes

- `PlacesPage.tsx`
  - agrupamento de turmas equivalentes por local, titulo, professor, horario, nivel, perfil e mensalidade;
  - resultados de descoberta somam vagas e exibem dias juntos quando houver recorrencia.

- `PlacePublicPage.tsx`
  - `intent=academy` passou a renderizar apenas fluxo de aulas e contato;
  - hero contextual fala de turmas, nao de quadras;
  - turmas recorrentes aparecem em grupo, com chips de dias selecionaveis;
  - envio cria uma solicitacao pendente por dia/turma selecionado via `createAcademyEnrollment`.

- `App.css`
  - grid de `Entrar em aula` foi ajustado para desktop e mobile;
  - CTA fica dentro do container;
  - cards/chips de dias receberam estados selecionados.

## Validacao

- `npm.cmd run lint`
- `npm.cmd run build`

Screenshots:

- `web/docs/screenshots/player-classes-2026-05-15/desktop-classes-discovery-final.png`
- `web/docs/screenshots/player-classes-2026-05-15/desktop-place-academy-focused-auth2.png`
- `web/docs/screenshots/player-classes-2026-05-15/mobile-place-academy-focused-auth2.png`

## Riscos Restantes

- Os seeds atuais ainda precisam de turmas realmente recorrentes, com mesmo titulo/professor/horario em mais de um weekday, para validar visualmente os chips de dias em massa.
- O fluxo publico cria interesse/matricula pendente. Contrato mensal, plano semanal, cobranca e aprovacao continuam no modulo Academia para nao transformar o Player App em gestao.
