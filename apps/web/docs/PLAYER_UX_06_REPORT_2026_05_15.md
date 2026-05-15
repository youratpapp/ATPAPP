# PLAYER-UX-06 Report - 2026-05-15

## Objetivo

Fazer `/ranking` abrir como uma tela util para o jogador comum: primeiro entender a propria posicao, depois filtrar e ler a lista. O ranking nao deve parecer cockpit, relatorio ou vitrine de KPIs globais.

## Causa raiz

A tela abria com hero escuro, tres KPIs gerais, lider, momento, corrida do ranking, mapa de classes, regras e ferramentas antes da lista. Isso empurrava a informacao principal para baixo e fazia o jogador processar dados que muitas vezes nao eram necessarios para sua tarefa.

## Entregue

- Primeira dobra trocada por `Minha posicao` e `Recorte atual`.
- Se o jogador nao aparece no recorte, o estado explica isso sem tratar como erro.
- Filtros continuam logo abaixo do resumo pessoal.
- Lista do ranking sobe antes dos paineis analiticos.
- Lider, momento, regras, corrida, mapa de classes e ferramentas ficam em `Ver regras, resumo e ferramentas`.
- Mobile deixa de depender de tabela horizontal como experiencia primaria: rows compactas mostram posicao, jogador, liga, campanha, pontos e acao.

## Arquivos alterados

- `web/src/pages/RankingPage.tsx`
- `web/src/App.css`
- `web/docs/EXECUTION_QUEUE.md`
- `web/docs/CURRENT_PRODUCT_STATE.md`
- `web/docs/PLAYER_APP_V2_UX_PLAN.md`
- `web/docs/PLAYER_APP_V2_IMPLEMENTATION_SPEC.md`

## Validacao

- `npm.cmd run lint`: aprovado.
- `npx.cmd tsc --noEmit`: aprovado.
- `npm.cmd run build`: aprovado.

## Risco de regressao

- As funcoes existentes foram preservadas: filtro por escopo, busca, classe, seguir jogador, copiar top 10 e exportar CSV.
- `Seguir` continua visivel nas rows para compatibilidade, mas pode ser reduzido ou reposicionado quando `PLAYER-UX-07` revisar perfil/social.
- Screenshots autenticados devem ser refeitos em mobile apos seed/Supabase alvo estarem alinhados.

## Proxima fila

`PLAYER-UX-07 - Perfil simples por finalidade`.
