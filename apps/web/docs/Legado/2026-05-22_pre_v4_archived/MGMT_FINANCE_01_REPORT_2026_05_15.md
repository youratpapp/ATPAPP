# MGMT-FINANCE-01 Report - Financeiro por cobranca

Data: 2026-05-15

## Objetivo

Transformar o Financeiro do local em uma rotina operacional de cobranca, com foco em quem precisa ser cobrado agora, sem abrir a tela como relatorio ou dashboard tecnico.

## Causa

O Financeiro ja tinha recebiveis, lembretes, despesas e resumo, mas a primeira leitura ainda era `Resumo`. Dentro do Management OS tambem havia duplicidade entre a central nova e blocos legados renderizados abaixo dela. A fila de recebiveis nao destacava vencidos/vence hoje, nao tinha `Marcar pago` como acao primaria e ainda usava recortes curtos.

## Correcoes implementadas

- `Financeiro` agora abre por padrao em `Recebiveis`.
- A ordem das subvisoes ficou: `Recebiveis`, `Pagos`, `Despesas`, `Planos`, `Resumo`.
- `Recebiveis` mostra vencidos, vencem hoje e todos, com origem e vencimento por row.
- Cada row tem `Marcar pago` como acao primaria e `Enviar lembrete` como secundaria.
- Lembretes em lote continuam disponiveis para lista atual, socios e alunos.
- A fila agrega plano de socio, mensalidade de academia por contrato, matricula legada, aula avulsa/reposicao e reserva com pagamento pendente.
- Pagamentos pendentes antigos em `app_payments` voltam para a fila quando pertencem ao local.
- Aba `Pagos` mostra pagamentos registrados sem misturar com cobranca aberta.
- `Despesas` ganhou expansao em vez de corte silencioso.
- O bloco legado do Financeiro nao duplica mais quando o workspace v2 esta ativo.
- `Resumo` passou a ser relatorio secundario e respeita Cantina desativada.

## Arquivos alterados

- `src/pages/PlacesPage.tsx`
- `src/components/place/FinanceWorkspaceShell.tsx`
- `src/components/place/PlaceFinanceReceivablesModule.tsx`
- `src/components/place/PlaceFinancePaidModule.tsx`
- `src/components/place/PlaceFinanceExpensesModule.tsx`
- `src/components/place/PlaceFinanceOverviewModule.tsx`
- `src/components/place/PlaceClientRelationshipModule.tsx`
- `src/lib/place-admin-navigation.ts`
- `src/App.css`

## Impacto de UX

- Financeiro fica mais parecido com rotina de trabalho: abrir, cobrar, baixar, revisar despesas.
- O operador nao precisa procurar cobrancas dentro de Academia ou Clientes para resolver inadimplencia.
- Mobile reduz a sensacao de painel empilhado porque a aba inicial vira lista acionavel.

## Impacto de produto

- Acoes financeiras existentes foram preservadas: lembrete, baixa manual, despesas, planos/pacotes e resumo.
- A fila passa a tratar atrasos de meses anteriores, nao apenas o periodo atual.
- O modelo ainda usa convencao de vencimento por periodo porque `app_payments` nao possui `due_date` canonico.

## Validacao

- `npx.cmd tsc -b --pretty false`
- `npm.cmd run lint`
- `npm.cmd run build`

## Riscos restantes

- Criar `due_date` persistido para cobrancas deixaria vencimento menos dependente de convencao.
- Financeiro de competicoes continua no Competition OS; nao foi fundido ao Financeiro do local neste sprint.
