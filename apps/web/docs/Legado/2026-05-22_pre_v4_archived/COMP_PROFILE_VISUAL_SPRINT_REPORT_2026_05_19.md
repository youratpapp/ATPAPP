# Sprint Report - Competições e Perfil com DNA ref2

Data: 2026-05-19

Referencia principal: `ref2.jpeg`.

## Objetivo

Recalibrar Competições, Torneios, Ligas e Perfil para ficarem mais proximos do DNA visual da referencia: navy mobile, hero esportivo, cards brancos compactos, verde ATP em ativos/CTAs e composicao de app em vez de painel administrativo.

## Entrega

1. Competições ganhou hero esportivo com imagem premium e contraste navy/green/white.
2. Mobile de Competições passou a usar grade 2x2 de atalhos, mais proxima da ref2.
3. Torneios e Ligas receberam headers e estados vazios premium, com painel escuro e CTA verde.
4. Perfil mobile foi compactado, com hero de identidade atletica, avatar menor, titulo corrigido e rows mais densas.
5. Perfil desktop recebeu hero esportivo e cards/rows refinados, preservando todos os dados e acoes existentes.

## Evidencias

- `docs/screenshots/visual-local-audit-2026-05-18/desktop-events-hub.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-events-hub.png`
- `docs/screenshots/visual-local-audit-2026-05-18/desktop-tournaments.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-tournaments.png`
- `docs/screenshots/visual-local-audit-2026-05-18/desktop-leagues.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-leagues.png`
- `docs/screenshots/visual-local-audit-2026-05-18/desktop-profile.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-profile.png`

## Validacao

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- `node scripts/capture-visual-audit.mjs` passou e atualizou a auditoria visual.

## Observacao

A mudanca foi restrita a aparencia, cores, formatacao, densidade e composicao. Conteudos, ferramentas, rotas, permissoes e regras de negocio foram preservados.
