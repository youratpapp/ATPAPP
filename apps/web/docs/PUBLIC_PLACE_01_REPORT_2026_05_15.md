# PUBLIC-PLACE-01 Report

Data: 2026-05-15

## Escopo

Refinar `/locais/:placeId` como pagina publica de jogador, preservando funcoes existentes e removendo sinais de cockpit/gestao da leitura publica.

## Causa

A pagina ja tinha backend real para reserva, lista de espera, interesse em turma e jogos abertos, mas ainda parecia uma composicao administrativa: header duplicado, KPIs publicos, cards secundarios competindo com a acao principal e `PublishingKit` visivel para jogador comum.

## Entregue

- Hero publico com CTA contextual por oferta real publicada.
- Rail curto de acoes para `Reservar`, `Aulas`, `Jogos`, `Planos` e `Compartilhar`, sem KPIs.
- Fluxo de reserva preservado com disponibilidade, ajuste manual, solicitacao e lista de espera.
- Fluxo de aulas preservado com filtros, turma com vaga e envio de interesse.
- Jogos abertos e planos preservados como secoes publicas, mas sem ocupar a primeira decisao quando nao existem.
- Quadras e valores movidos para detalhe secundario recolhivel.
- `PublishingKit`, link e widget restritos ao owner no fim da pagina.
- Mobile com rail horizontal e CTA sticky contextual.

## Arquivos Alterados

- `web/src/pages/PlacePublicPage.tsx`
- `web/src/App.css`
- `web/docs/EXECUTION_QUEUE.md`
- `web/docs/CURRENT_PRODUCT_STATE.md`
- `web/docs/SCREEN_RESPONSIBILITIES.md`
- `web/docs/COMPONENT_GRAMMAR.md`

## Impacto De UX

- Jogador ve primeiro o que pode fazer no local, nao indicadores internos.
- Locais sem quadra publicada deixam de empurrar reserva como CTA principal.
- Dono do local ainda encontra gestao e divulgacao, mas como acao secundaria.
- Mobile reduz empilhamento inicial com rail horizontal e detalhes recolhiveis.

## Impacto De Produto

- Mantem a separacao entre Player App e Management OS.
- Preserva funcoes comerciais publicas do local sem tratar o visitante como operador.
- Prepara o mesmo padrao para `PUBLIC-COMP-01`, usando pagina publica com CTA/rail antes de informacao pesada.

## Backend

Sem migration nova. Foram reutilizados os caminhos existentes:

- `searchAvailableCourts`
- `createCourtBooking`
- `joinCourtBookingWaitlist`
- `listPublicAcademyClassSpots`
- `createAcademyEnrollment`
- `joinOpenMatch`

## Validacao

- `npx.cmd tsc -b --pretty false`
- `npm.cmd run lint`
- `npm.cmd run build`

## Screenshots

Nao foram gerados screenshots uteis neste sprint. O servidor local ja estava ativo em `http://127.0.0.1:5173`, mas a automacao autenticada por Playwright nao estava disponivel como modulo Node no workspace; a validacao automatica cobriu TypeScript, lint e build.

## Riscos Restantes

- A experiencia visual fica mais forte quando o local tem `coverUrl`; sem imagem, o hero depende de logo/iniciais.
- Disponibilidade do dia ainda e buscada slot a slot no frontend. Uma RPC agregada pode reduzir custo quando houver muitos locais/quadras.
- `PUBLIC-COMP-01` deve aplicar o mesmo criterio: pagina publica de competicao nao pode abrir com fila do organizador ou KPIs operacionais.
