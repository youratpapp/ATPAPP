# SCREEN-GESTAO-FINANCEIRO-01 Report

Data: 2026-05-17

## Objetivo

Fazer o Financeiro abrir pela decisao operacional do dia: o que receber, o que esta vencido, onde baixar pagamento e onde registrar despesa.

## Alteracoes

- `PlacesPage.tsx`
  - adicionou faixa de prioridade na `Central financeira`;
  - incluiu atalhos para `Recebiveis` e `Despesas`;
  - passou `draft`, `onCreateExpense` e `onDraftChange` para `Despesas` dentro do workspace.

- `App.css`
  - adicionou layout responsivo para `finance-priority-strip`;
  - mobile usa 2 colunas para manter a primeira dobra compacta.

## Decisoes de UX

- `Registrar baixa` leva para a lista de recebiveis porque a baixa correta depende da origem/linha da cobranca.
- `Registrar despesa` abre a aba de despesas com formulario real.
- A origem da cobranca permanece visivel no row para diferenciar reserva, mensalidade, plano, aula avulsa/reposicao e outras cobrancas.

## Risco de regressao

Baixo. A sprint nao altera schema nem servicos financeiros. O principal ajuste funcional foi expor no workspace o formulario de despesas que ja existia no fallback legado.

## Validacao

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run build`

## Pendencias

- Screenshots autenticados desktop/mobile.
- Avaliar drawer dedicado para baixa manual se a lista de recebiveis ficar longa demais em operacao real.
