# PLAYER-BOOKING-DNA-01 Report

Data: 2026-05-17

## Objetivo

Concluir o fluxo publico de reserva com filtros dependentes, agenda por quadra e confirmacao clara, mantendo o caminho leve para jogador e sem misturar aulas, planos ou gestao.

## Alteracoes

- `/locais?intent=booking` recebeu grid de filtro por areas, evitando que data, hora, duracao e busca se sobreponham em desktop.
- No mobile, o mesmo filtro colapsa para uma coluna e o botao de busca ocupa a largura total.
- A duracao publica foi normalizada para 1h ou 2h, sem aceitar intervalos de meia hora no fluxo do jogador.
- Resultados por local e por quadra mostram o preco total conforme a duracao escolhida.
- Cards de local indicam que a duracao de 2h bloqueia o intervalo completo na agenda por quadra.
- A pagina publica do local preserva agenda por quadra em carrossel, slots hora a hora e confirmacao vinculada ao perfil.

## Decisoes de UX

- O fluxo publico deve pesquisar disponibilidade real, nao apresentar formularios genericos.
- Se nenhum local exato foi escolhido, o usuario escolhe primeiro o local com quadra livre.
- Se o local foi escolhido pelo autocomplete, o usuario vai direto para a quadra/agenda daquele local.
- Horas cheias reduzem ambiguidade operacional e deixam a agenda mais facil de ler.
- Preco apresentado no resultado deve ser o valor da reserva, nao apenas o valor por hora quando a duracao e 2h.

## Validacao

- `git diff --check -- web/src/pages/PlacesPage.tsx web/src/App.css`
- `npm.cmd run lint`
- `npm.cmd run build`

Todos passaram.

## Riscos Restantes

- Capturas autenticadas desktop/mobile ainda devem ser feitas na rodada visual final.
- A busca otimizada depende das RPCs/migrations ja previstas; o fallback local continua preservado quando o banco nao tem a funcao otimizada.
