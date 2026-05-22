# COMP-SCORE-02 - Tournament Score Fields

Data: 2026-05-15

## Objetivo

Aplicar nos torneios o mesmo padrao visual/operacional consolidado na sala da liga para envio e lancamento de resultados.

## Diagnostico

O torneio ja tinha a regra correta para tie-break condicional, inclusive no envio do jogador e no lancamento do admin. O ponto pendente era a apresentacao: os campos eram renderizados em linha flexivel e ficavam menos previsiveis que a liga.

## Alteracoes

- `TournamentPage.tsx`
  - O renderer compartilhado de placar passou a usar linhas padronizadas.
  - Set normal mostra label + games A + games B.
  - Tie-break por set abre como sublinha contextual quando o formato exige.
  - Super tie-break unico e decisivo usam o mesmo grid.
  - Inputs receberam `aria-label` especifico.

- `App.css`
  - Criadas classes `tournament-score-row`, `tournament-score-tiebreak-row` e `tournament-score-super-row`.
  - Ajuste responsivo para manter leitura em mobile.

## Impacto

- Jogador e admin visualizam o placar da mesma forma.
- O comportamento fica consistente entre liga e torneio.
- Reduz improviso no preenchimento de tie-break.

## Validacao

- `npm run lint`
- `npm run build`

## Risco restante

O torneio e a liga ainda usam renderers separados. Uma etapa futura pode extrair um componente unico de placar competitivo para reduzir divergencias futuras.
