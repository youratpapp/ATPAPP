# MGMT-CANTEEN-01 Report

Data: 2026-05-15

## Objetivo

Transformar Cantina/POS em uma rotina operacional de venda rapida e estoque, evitando abertura por KPI/resumo e removendo vazamento do modulo quando o plano nao habilita cantina.

## Causa Do Problema

- A subvisao padrao da cantina abria em leitura de vendas do dia, empurrando a tarefa principal para depois.
- O cadastro/lista de produtos ainda usava cortes silenciosos e leitura mais parecida com catalogo do que com operacao.
- A visibilidade do POS estava acoplada a Financeiro, o que permitia tratar cantina como consequencia de permissao financeira em vez de feature propria do plano.

## Entrega

- `Venda rapida` virou a primeira subvisao de `/gestao/:placeId/cantina`.
- O formulario de venda ganhou busca, botoes de produto, venda avulsa, quantidade, valor, cliente opcional, total estimado e bloqueio de estoque insuficiente.
- `Estoque baixo` passou a ser rotina propria com busca e atalho para o catalogo.
- `Vendas do dia` preserva total, lancamentos e cancelamento quando permitido.
- `Produtos` ganhou busca e filtros `Todos`/`Baixo`/`Zerado`, sem `slice` silencioso.
- `canteen` virou feature propria em `placeProductFeatures(...)`, habilitada para `club_pro` e `multi_unit`.

## Arquivos Alterados

- `web/src/lib/place-management.ts`
- `web/src/lib/place-admin-data.ts`
- `web/src/lib/place-admin-navigation.ts`
- `web/src/components/place/CanteenWorkspaceShell.tsx`
- `web/src/components/place/PlaceCanteenSaleForm.tsx`
- `web/src/components/place/PlaceCanteenStockModule.tsx`
- `web/src/components/place/PlaceCanteenProductsModule.tsx`
- `web/src/components/place/PlaceCanteenSummaryModule.tsx`
- `web/src/pages/PlacesPage.tsx`
- `web/src/App.css`
- `web/docs/EXECUTION_QUEUE.md`
- `web/docs/CURRENT_PRODUCT_STATE.md`
- `web/docs/MANAGEMENT_OS_V2_IMPLEMENTATION_SPEC.md`
- `web/docs/SCREEN_RESPONSIBILITIES.md`
- `web/docs/COMPONENT_GRAMMAR.md`

## Validacao

- `npx.cmd tsc -b --pretty false`: passou.
- `npm.cmd run lint`: passou.
- `npm.cmd run build`: passou.

## Riscos Restantes

- Ainda nao existe papel dedicado de caixa/POS; por enquanto a cantina segue restrita a owner/manager em planos com a feature habilitada.
- Catalogos muito grandes podem exigir paginacao ou agrupamento por categoria em sprint futuro.
- Screenshots nao foram gerados nesta rodada; a validacao foi feita por TypeScript, lint e build.
