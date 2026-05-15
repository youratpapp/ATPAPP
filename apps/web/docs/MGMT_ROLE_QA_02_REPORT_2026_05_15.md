# MGMT-ROLE-QA-02 Report - 2026-05-15

## Objetivo

Fazer `/gestao` acessada por usuario sem permissao profissional parecer um estado neutro/player, nao um cockpit operacional vazio.

## Causa raiz

A permissao ja bloqueava os dados de gestao, mas a rota `/gestao` sempre era classificada como superficie `management`. Com isso, desktop/mobile podiam mostrar linguagem de Management OS, como `Gestao esportiva`, `Operacao`, `Central operacional` e `Gestao`, mesmo para jogador puro.

## Entregue

- `getGlobalNavigationVisibility(...)` agora rebaixa a superficie ativa para `player` quando a rota e de gestao, mas `access.hasManagement` e falso.
- `ManagementShell` ganhou prop `mode`, mantendo Management OS para usuarios com acesso e permitindo visual neutro para sem acesso.
- `ManagementHubPage` detecta `noManagementAccess` e troca eyebrow/title/description para linguagem de jogador.
- Bottom nav deixa de exibir `Gestao esportiva`, `Operacao` e item `Gestao` para usuario sem acesso.

## Arquivos alterados

- `web/src/lib/role-visibility.ts`
- `web/src/components/management/ManagementShell.tsx`
- `web/src/pages/ManagementHubPage.tsx`
- `web/docs/EXECUTION_QUEUE.md`
- `web/docs/CURRENT_PRODUCT_STATE.md`
- `web/docs/QA_ROLE_01_ROLE_VISIBILITY_REPORT_2026_05_15.md`

## Validacao

- `npm.cmd run lint`: aprovado.
- `npx.cmd tsc --noEmit`: aprovado.
- `npm.cmd run build`: aprovado.

## Risco de regressao

- A mudanca afeta apenas classificacao visual/navegacao global. As regras de acesso continuam vindo de `WorkspaceAccessSummary`.
- Recomendado repetir screenshot autenticado depois que o seed novo estiver aplicado, usando `qa.jogador.puro@demo.atp.local`.

## Proxima fila

`PLAYER-UX-05 - Encontrar jogo sem rede social pesada`.
