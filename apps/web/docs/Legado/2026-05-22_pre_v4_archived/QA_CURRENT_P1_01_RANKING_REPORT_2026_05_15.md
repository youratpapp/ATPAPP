# QA-CURRENT-P1-01 - Ranking do Player App

Data: 2026-05-15

## Objetivo

Simplificar `/ranking` para cumprir o DNA do Player App: abrir com contexto pessoal, filtros essenciais e lista progressiva, sem parecer relatorio administrativo longo.

## Causa raiz

- A tela carregava uma lista extensa demais no primeiro acesso, com ate 80+ linhas antes de uma intencao clara do jogador.
- O carregamento podia manter dados antigos enquanto novo recorte era buscado, criando risco de divergencia entre desktop/mobile.
- O mobile ainda carregava resquicios de tabela horizontal antiga e botoes largos demais nas rows.

## Correcoes aplicadas

- `RankingPage.tsx`
  - lista inicial limitada e progressiva com `Ver mais jogadores`;
  - `rows` sao limpas ao iniciar novo carregamento para evitar recorte stale;
  - estado inicial diferencia carregamento real de resultado vazio;
  - erros tecnicos da API viram mensagem amigavel na UI e log interno;
  - filtros ativos podem ser limpos de forma direta.

- `App.css`
  - chips horizontais para escopo no mobile;
  - rows mobile sem `min-width` legado;
  - acao `Seguir` deixa de ocupar largura total da row;
  - cabecalho da lista informa quantos jogadores estao visiveis.

## Evidencias

Diretorio: `web/docs/screenshots/qa-current-p1-01-2026-05-15/`

- `desktop1366-ranking-p1-after.png`
- `mobile390-ranking-p1-after.png`
- `qa-current-p1-01-ranking-summary-after.json`

Resumo da validacao visual:

- Desktop 1366px: 12 rows iniciais, `Ver mais jogadores`, 162 jogadores no recorte.
- Mobile 390px: 12 rows iniciais, `Ver mais jogadores`, 162 jogadores no recorte.
- Mobile 390px: `bodyWidth = viewportWidth = 390`, sem overflow horizontal.
- Nenhum erro bruto de SQL/Supabase/HTTP renderizado.
- Nenhuma resposta HTTP >= 400 no fluxo validado.

Observacao: o console registrou apenas mensagens debug do Vite em dev (`[vite] connecting/connected`), sem erro de aplicacao.

## Validacao tecnica

- `npm run lint`: passou.
- `npm run build`: passou.

## Risco restante

- O usuario demo validado (`jogador001@demo.atp.local`) nao aparece no recorte geral atual; a tela cobre isso com estado pessoal claro, mas ainda vale validar com um usuario que participe de uma liga para testar a leitura de `Minha posicao` positiva.
- A ordenacao ainda pode mostrar posicoes repetidas quando o recorte mistura ligas/classes diferentes, porque `position` vem do ranking por classe/liga. Isso nao bloqueia o sprint, mas pode merecer refinamento em uma task futura se o produto quiser um ranking geral unificado.

## Proxima queue

Seguir para `QA-CURRENT-P1-02 - Simplificar lista de torneios organizados`.
