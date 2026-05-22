# COMP-PUBLIC-02B - Torneio publico com abas limpas por intencao

Data: 2026-05-15

## Objetivo

Aplicar nos torneios o mesmo principio validado na reorganizacao da liga publica: cada menu deve abrir uma area limpa, leve e focada apenas na intencao escolhida pelo jogador.

## Causa

A pagina publica de torneio ainda funcionava como uma pagina longa. O jogador podia clicar em `Jogos`, `Classificacao` ou `Chat`, mas continuava vendo hero, categorias e inscritos como blocos anteriores. Isso criava duplicidade, excesso de scroll e sensacao de cockpit operacional em uma area que deveria ser leitura publica simples.

## Alteracoes

- `Evento`, `Categorias`, `Inscritos`, `Jogos`, `Classificacao` e `Chat` viraram abas publicas reais.
- `Evento` concentra apenas resumo, status, CTA e atalhos publicos.
- `Categorias` concentra apenas as categorias/classes.
- `Inscritos` concentra apenas a lista publica de jogadores.
- `Jogos`, `Classificacao` e `Chat` deixaram de receber blocos fixos de hero/listas antes do conteudo.
- `Inscritos`, `Jogos` e `Classificacao` receberam filtro contextual de classe/categoria no topo.
- A lista publica de inscritos passou a respeitar a classe ativa, evitando misturar todos os jogadores quando o usuario esta analisando um recorte.
- O menu publico preserva rolagem horizontal no mobile.

## Arquivos alterados

- `src/pages/TournamentPage.tsx`
- `docs/EXECUTION_QUEUE.md`
- `docs/CURRENT_PRODUCT_STATE.md`

## Impacto de UX

- Reduz scroll e duplicidade em torneios publicos.
- Deixa cada aba previsivel: o botao escolhido mostra apenas o conteudo referente a ele.
- Aproxima torneios do mesmo padrao de liga publica.
- Mantem filtros de classe onde eles fazem sentido, sem criar uma aba de classes que altera outras areas de forma indireta.

## Impacto de produto

- Preserva inscricao, jogos, classificacao, chat e leitura de categorias.
- Separa melhor experiencia publica de experiencia operacional.
- Mantem owner/staff com os controles existentes fora da leitura publica simplificada.

## Validacao

- `npm run lint`
- `npm run build`

## Riscos restantes

- Conferir em browser real mobile se o menu horizontal e o CTA sticky estao com boa ergonomia em torneios com muitas categorias.
- A proxima rodada visual pode ajustar densidade dos cards publicos, mas a estrutura por intencao ja esta aplicada.
