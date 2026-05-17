# PLAYER-MATCHES-DNA-01 Report

Data: 2026-05-17

## Escopo

Sprint focada em deixar `Encontrar jogo` consistente com os demais fluxos de descoberta do jogador, corrigindo filtro encavalado e reduzindo a competicao visual com `Criar chamada`.

## Causa

O filtro anterior misturava texto, localidade e status em uma grade sem areas fixas. Em desktop, os campos podiam encavalar; em mobile, o filtro ficava pesado para uma tarefa que deveria ser rapida. Alem disso, criar chamada aparecia muito perto da busca principal, gerando a sensacao de duas tarefas competindo.

## Alteracoes

- `PlacesPage.tsx`
  - adicionou controle de filtros recolhidos para jogos;
  - manteve UF, cidade e local como seletores derivados de locais cadastrados com jogos;
  - manteve data, periodo, nivel, mensagem e status como filtros secundarios;
  - manteve `Criar chamada` como alternativa apos a busca, sem roubar a acao principal.

- `App.css`
  - filtro de jogos passou a usar `grid-template-areas`;
  - mobile agora recolhe `.places-filter-grid.matches` como nos fluxos de quadra/aula;
  - campos voltam para uma coluna no mobile.

## Impacto UX

- O jogador encontra jogos por localidade real antes de criar algo novo.
- Desktop deixa de ter campos sobrepostos.
- Mobile mostra resumo de filtros e evita bloco grande sempre aberto.
- Criar chamada permanece acessivel, mas como fallback.

## Validacao

- `git diff --check -- web/src/pages/PlacesPage.tsx web/src/App.css`
- `npm.cmd run lint`
- `npm.cmd run build`
