# COMP-PUBLIC-02A - Liga publica com abas limpas

Data: 2026-05-15

## Causa

A experiencia publica de liga misturava duas arquiteturas: um topo publico com blocos de resumo e uma pagina interna longa que continuava renderizando jogadores, classificacao, partidas e chat conforme a ancora/aba. Na pratica, clicar em `Chat` ou `Partidas` ainda deixava conteudo de jogadores e resumo acima, criando sensacao de duplicidade e peso.

## Correcao

- `Liga` passou a renderizar apenas resumo publico, CTA e inscricao publica.
- `Classes` passou a renderizar apenas classes.
- `Jogadores` passou a renderizar apenas jogadores publicados.
- `Classificacao` passou a renderizar a tabela da temporada.
- `Partidas` e `Chat` ficaram livres de blocos publicos fixos.
- A navegacao do owner foi preservada e continua separada da experiencia publica.

## Arquivos alterados

- `src/pages/LeagueDetailsPage.tsx`
- `src/App.css`
- `docs/EXECUTION_QUEUE.md`
- `docs/CURRENT_PRODUCT_STATE.md`

## Validacao

- `npm run lint`
- `npm run build`

## Risco restante

O mesmo padrao deve ser auditado em torneios publicos. Este sprint corrigiu a liga publica primeiro para atacar exatamente o exemplo reportado.
