# MANAGEMENT-DNA-01 Report - 2026-05-17

## Objetivo

Reduzir a sensação de painel administrativo longo na central de gestão, mantendo a rotina operacional em primeiro lugar.

## Alteracoes

- `Locais sob sua gestao` agora ordena workspaces por pendências operacionais, setup menos completo e nome.
- A primeira leitura mostra até 4 locais em foco.
- Quando houver mais locais, a tela mostra um CTA `Ver todos os locais`.
- Ao expandir, o usuário pode voltar para o foco operacional.
- A fila do dia, permissões por papel e atalhos por módulo foram preservados.

## Causa

A central já tinha uma boa primeira camada de fila, mas em contas com vários locais ainda empilhava todos os workspaces com muitos detalhes, especialmente pesado no mobile.

## Arquivos alterados

- `web/src/pages/ManagementHubPage.tsx`
- `web/src/App.css`
- `web/docs/EXECUTION_QUEUE.md`
- `web/docs/CURRENT_PRODUCT_STATE.md`

## Validacao

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run build`

## Risco residual

Médio-baixo. A mudança é de apresentação e ordenação, sem alterar permissões, RPCs ou rotas. Ainda vale revisar screenshots mobile na próxima auditoria `QA-DNA-01`.
