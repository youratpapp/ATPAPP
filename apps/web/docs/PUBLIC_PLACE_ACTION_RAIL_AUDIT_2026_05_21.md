# Public Place Action Rail Audit - 2026-05-21

Fonte executiva:

- `docs/APP_WORKFLOW_EXECUTION_PLAYBOOK_V3.md`
- `docs/EXECUTION_QUEUE.md`
- `docs/CROSS_APP_FLOW_AUDIT_2026_05_21.md`

Objetivo: corrigir `CROSS-UX-02`, a action rail da pagina publica do local em mobile.

## Evidencias

- Screenshots e diagnostics: `docs/screenshots/public-place-action-rail-audit-2026-05-21-run1/`
- Rotas auditadas:
  - `/locais/49709592-173c-49c6-aa22-bacb6ec0b31b/reservar`
  - `/locais/49709592-173c-49c6-aa22-bacb6ec0b31b/aulas`
  - `/locais/49709592-173c-49c6-aa22-bacb6ec0b31b`
- Viewports: mobile 390, mobile 430, desktop 1366, desktop wide
- Console/rede: 0 eventos nos diagnostics
- Typecheck: `npx.cmd tsc -b --pretty false` passou

## Problema

No mobile, a rail de acoes publicas do local ficava como uma faixa horizontal cortada. Em locais com reserva, aulas, jogos, planos e sobre, o usuario via parte de um card e precisava descobrir que havia conteudo lateral.

Isso quebrava o fluxo:

- `Jogar -> Local -> Reservar/Aulas/Jogos`;
- cada acao deveria parecer uma escolha clara de jornada;
- nenhuma funcao importante deveria ficar escondida em carrossel apertado.

## Correcao aplicada

Arquivo:

- `src/App.css`

Mudancas:

- Em mobile, `.place-public-action-rail` virou grade compacta de duas colunas.
- O carrossel horizontal foi removido para essa superficie.
- Cards ganharam altura menor, texto com quebra segura e densidade mais estavel.
- Em telas muito estreitas, a grade cai para uma coluna.

## Resultado UX

- `Reservar`, `Aulas`, `Jogos` e `Sobre` ficam visiveis e tocaveis sem arrastar.
- O fluxo publico do local fica mais direto e mais coerente com Player App.
- Desktop segue usando a grade fluida existente.
- Rotas, permissoes, loaders e backend foram preservados.

## Pendencias restantes

- `CROSS-UX-03`: avaliar uma escolha de unidade/local antes de entrar no workspace para usuarios multi-local.
- A captura full-page mostra o CTA sticky fixo dentro do screenshot, mas isso e artefato de captura de pagina inteira; em uso real ele permanece no rodape da viewport.
