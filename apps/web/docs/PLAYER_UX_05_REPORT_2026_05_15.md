# PLAYER-UX-05 Report - 2026-05-15

## Objetivo

Transformar `Encontrar jogo` em um fluxo leve para jogador comum, focado em achar ou criar uma chamada para jogar, sem parecer rede social ou dashboard comunitario.

## Causa raiz

O backend de chamadas abertas ja existia, mas a UI misturava busca, criacao, KPIs sociais, curtidas, comentarios e lista limitada em uma mesma superficie. Isso deixava o jogador pensar demais antes da acao principal e criava sensacao de feed pesado.

## Entregue

- O titulo da area passou para `Encontrar jogo`, com explicacao curta e operacional.
- KPIs `Jogos abertos`, `Interessados` e `Conversas` sairam da primeira dobra.
- A busca virou `Busca rapida`, com filtros em disclosure e contador de chamadas encontradas.
- `Criar chamada` virou CTA contextual e revela um formulario curto somente quando necessario.
- Rows de chamada priorizam local, horario, nivel, interessados e acao primaria.
- `Comentarios` e `Salvar interesse` continuam disponiveis em `Detalhes`, sem dominar o fluxo.
- Removido limite silencioso de seis chamadas.

## Arquivos alterados

- `web/src/pages/PlacesPage.tsx`
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

- A mudanca preserva as mesmas funcoes de backend: criar chamada, entrar, fechar/cancelar, salvar interesse e mensagens.
- O formulario ainda e inline curto; uma futura camada mobile pode trocar por bottom sheet sem alterar contrato de dados.
- Validacao visual autenticada em mobile deve ser repetida apos reaplicar seeds no Supabase alvo.

## Proxima fila

`PLAYER-UX-06 - Ranking centrado no jogador`.
