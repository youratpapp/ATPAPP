# QA Label Cleanup - 2026-05-21

## Contexto

Alguns cards e botoes estavam exibindo nomes tecnicos criados por auditorias E2E, como `QA Fluxo V4 ...` e `QA Academia Fluxo ...`. Isso quebrava a experiencia porque o usuario final nao sabe o que e "fluxo" nesse contexto.

## Decisao

- Nomes de massa criada por auditoria devem parecer conteudo normal de demonstracao.
- Termos tecnicos como `QA`, `Fluxo`, `E2E` e `auditoria` nao devem aparecer em cards, botoes, titulos publicos, pagamentos, quadras, turmas ou professores.
- O script de limpeza ainda guarda os padroes antigos apenas para encontrar e corrigir registros legados.

## Arquivos alterados

- `scripts/tournament-e2e-flow-audit.mjs`
- `scripts/academy-e2e-flow-audit.mjs`
- `scripts/league-e2e-flow-audit.mjs`
- `scripts/cleanup-qa-flow-labels.mjs`
- `src/pages/PlacesPage.tsx`
- `docs/EXECUTION_QUEUE.md`

## Nomes futuros

- Torneios: `ATP Open Dourados HHMMSS`
- Ligas: `Liga ATP Dourados HHMMSS`
- Academias: `ATP Centro Dourados YYYYMMDDHH`
- Quadras: `Quadra 1`, `Quadra 2`, `Quadra 3`
- Turmas: `Adulto Intermediario`, `Kids Iniciante`
- Professores: `Renato Siqueira`, `Lais Monteiro`

## Limpeza aplicada no banco

Script executado:

```text
node scripts/cleanup-qa-flow-labels.mjs
```

Resultado:

- 11 torneios renomeados de `QA Fluxo V4 ...` para `ATP Open Dourados ...`.
- 4 academias renomeadas de `QA Academia Fluxo ...` para `ATP Centro Dourados ...`.
- 10 ligas renomeadas de `QA Liga V4 ...` para `Liga ATP Dourados ...`.
- Quadras, regras, professores, turmas, notas de contrato, notas de reserva, lista de espera e descricao de pagamento foram normalizados.
- `app_payments` exigiu atualizacao via RPC de pagamento porque nao ha policy direta de update, preservando as permissoes existentes.

## Validacao

- `npx.cmd tsc -b --pretty false` passou.
- Capturas novas em `docs/screenshots/qa-label-cleanup-2026-05-21/`.
- Rotas capturadas: `/gestao`, academia em reservas, torneio operacional e liga.
- Viewports: `mobile390` e `desktop1366`.
- `diagnostics-summary.json`: `events: []` em todas as rotas.
- Busca nas capturas novas nao encontrou `QA Fluxo`, `Academia Fluxo`, `QA Liga`, `QA Quadra`, `Mensalidade QA`, `QA Adulto`, `QA Kids` ou `Fluxo V4`.
- Rótulos tecnicos adicionais trocados na gestao de local:
  - `Marcar pago por row` -> `Marcar recebivel como pago`
  - `Drawer na lista` -> `Lista e cadastro`
- Capturas extras em `docs/screenshots/technical-label-cleanup-2026-05-21/`.
- Busca nas capturas extras nao encontrou `Drawer na lista`, `Marcar pago por row`, `row`, `drawer` ou os prefixos tecnicos antigos.
- Consulta publica anonima em `tournaments`, `places` e `leagues` retornou `0` registros para `%Fluxo%` e `QA %`.

## Observacao

Pastas antigas de screenshot e diagnosticos historicos ainda podem conter os nomes antigos porque registram o estado anterior. Elas nao representam o estado atual do app nem devem orientar novas decisoes de produto.
