# Work SaaS Phase 7 Status - Receita And Payments

Date: 2026-05-21

## Status

Phase 7 is implemented as a naming, routing and shared-payment-surface pass.

## Queue Items

| Item | Status | Notes |
|---|---|---|
| WSAAS3-29 Receita Domain Shell | Done | The former `Financeiro` module is now presented as `Receita` in the SaaS shell. Existing finance semantics and permissions are preserved. |
| WSAAS3-30 Unified Payment Modal | Done | Reservation, membership, academy enrollment, lesson request and receivable payments already route through `PaymentStubDialog` before marking paid. |
| WSAAS3-31 Receivables Desktop Density | Partial | Receivables are segmented and capped with progressive `Ver mais`; a denser table mode remains future work. |
| WSAAS3-32 Expenses And Paid Ledger | Done | `Pagos` and `Despesas` remain distinct views from the collect-now `Recebiveis` surface. |
| WSAAS3-33 Revenue Reports | Partial | `Resumo` is explicitly secondary/reporting copy. Deeper report extraction remains a later reporting pass. |
| WSAAS3-34 Receita QA | Partial | TypeScript passed. Manual browser QA still pending. |

## Route Compatibility

- Canonical generated route for the revenue domain is now `/gestao/:placeId/receita`.
- Legacy `/gestao/:placeId/financeiro` and `/locais/:placeId/admin/financeiro` remain valid aliases.
- Existing subroutes/views such as `recebiveis`, `pagos`, `despesas`, `planos` and `resumo` are preserved.

## Files Changed

- `src/lib/place-management.ts`
- `src/lib/place-admin-navigation.ts`
- `src/components/place/FinanceWorkspaceShell.tsx`
- `src/components/BottomNav.tsx`

## Validation

- `npx.cmd tsc -b --pretty false` passed.

## Remaining Risk

- The payment dialog is still a stub by design. It marks items paid in the current app layer and is intentionally prepared for a future gateway/webhook integration.
