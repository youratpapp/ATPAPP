# COMP-LEAGUE-DNA-01 Report - 2026-05-17

## Objetivo

Separar a leitura publica da liga do workspace do organizador e garantir que o recorte por classe funcione de forma escalavel.

## Alteracoes

- A pagina publica segue com abas reais por intencao: `Liga`, `Jogadores`, `Classificacao`, `Partidas` e `Chat`.
- O filtro de classe agora usa chips quando ha ate 6 classes e select unico quando ha muitas classes.
- A aba `Partidas` passou a filtrar tambem por classe, alem de rodada e status.
- Ferramentas administrativas permanecem fora da leitura publica e continuam no workspace do organizador.

## Causa

O filtro visual de classe estava presente em `Partidas`, mas a lista de jogos aplicava somente rodada/status. Em ligas com muitas classes, o mobile tambem continuava empurrando um trilho longo de chips em vez de trocar para um seletor compacto.

## Arquivos alterados

- `web/src/pages/LeagueDetailsPage.tsx`
- `web/src/App.css`
- `web/docs/EXECUTION_QUEUE.md`
- `web/docs/CURRENT_PRODUCT_STATE.md`

## Validacao

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run build`

## Risco residual

Baixo. A mudanca reaproveita o estado `selectedClassId` ja existente e nao altera RPCs, schemas ou rotas.
