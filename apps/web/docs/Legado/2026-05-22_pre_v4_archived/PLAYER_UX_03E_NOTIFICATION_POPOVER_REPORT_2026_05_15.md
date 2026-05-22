# PLAYER-UX-03E - Notificacoes em popover/sheet

Data: 2026-05-15

## Problema

O sino de notificacoes abria um card dentro da Home do jogador. Isso fazia a notificacao parecer uma secao comum da pagina, empurrava o contexto atual e quebrava o padrao esperado de web/mobile.

## Decisao

Notificacoes pertencem ao `AppShell`, nao ao corpo da Home. O sino deve abrir:

- desktop: popover ancorado ao botao, com seta e backdrop transparente para fechar;
- mobile: bottom sheet com backdrop, sem alterar a posicao do conteudo da pagina.

## Implementado

- `AppShell` recebeu `bellOpen`, `bellPanel` e `onBellClose`.
- `HomePage` monta o conteudo de notificacoes, mas passa esse conteudo para o shell.
- O card inline de notificacoes foi removido da arvore principal da Home.
- CSS adicionou popover desktop e sheet mobile com rolagem interna.

## Impacto UX

- O usuario entende que o conteudo pertence ao sino.
- A Home nao salta nem ganha um bloco inesperado no meio da pagina.
- O comportamento se aproxima do padrao comum de dashboards web e apps mobile.

## Risco restante

- Futuras telas que tenham sino devem reutilizar o mesmo contrato do `AppShell`.
- Se o volume de notificacoes crescer muito, pode ser necessario agrupar por tipo com limite e link para uma central dedicada.

## Validacao

- `npm run lint`
- `npm run build`
