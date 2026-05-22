# SCREEN-GESTAO-CANTINA-01 Report

Data: 2026-05-17

## Objetivo

Fazer a Cantina/POS abrir pela acao de caixa, nao por metricas: vender produto primeiro, depois estoque baixo, vendas do dia e cadastro de produtos.

## Alteracoes

- `PlacesPage.tsx`
  - adicionou faixa de prioridade dentro do `CanteenWorkspaceShell`;
  - atalhos direcionam para `Venda rapida`, `Estoque baixo`, `Vendas do dia` e `Produtos`;
  - estoque baixo ganha destaque quando existe item critico.

- `App.css`
  - adicionou `canteen-priority-strip` responsivo;
  - mobile usa 2 colunas para manter a primeira dobra compacta.

## Decisoes de UX

- `Venda rapida` permanece como rota principal do POS.
- `Vendas do dia` vira suporte de caixa, nao primeira tela obrigatoria.
- `Produtos` e `Estoque` continuam separados para nao misturar cadastro estrutural com venda diaria.
- O modulo continua dependente do plano/permissao ja existente, sem backend novo.

## Risco de regressao

Baixo. A sprint adiciona navegacao e hierarquia visual, sem alterar schema, servicos ou regras de venda/estoque.

## Validacao

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run build`

## Pendencias

- Screenshots autenticados desktop/mobile.
- Avaliar drawer dedicado para cadastro de produto em sprint futura.
