# COMP-SCORE-01 - League Result Tie-Break Fields

Data: 2026-05-15

## Objetivo

Alinhar a sala de envio/resolucao de resultado da liga ao padrao usado no lancamento de placar pelo admin em torneios.

## Causa raiz

A liga tinha uma implementacao propria de placar com apenas dois campos por linha. Isso validava placares finais simples, mas nao abria campos condicionais de tie-break por set quando o formato exigia.

## Alteracoes

- `LeagueDetailsPage.tsx`
  - `MatchScoreRow` passou a guardar games e tie-break por lado.
  - A validacao aceita empate no alvo do set apenas quando aquele formato exige tie-break.
  - O calculo do vencedor considera o ganhador do tie-break quando os games ficam `6/6`, `8/8` ou `4/4`.
  - O resumo enviado inclui o detalhe do tie-break, por exemplo `6/6(7/5)`.
  - A sala renderiza campos de tie-break somente quando necessario.

- `App.css`
  - Adicionado estilo discreto para campos condicionais de tie-break dentro da sala da liga.

## Impacto de produto

- Jogador consegue enviar placar real sem improvisar em observacao.
- Admin resolve resultado com o mesmo padrao da sala.
- Formatos de liga ficam mais confiaveis e coerentes com torneio.

## Validacao

- `npm run lint`
- `npm run build`

## Riscos restantes

- A tela ainda usa helper proprio da liga. Uma futura consolidacao pode extrair o renderer de placar de torneio/liga para componente compartilhado.
