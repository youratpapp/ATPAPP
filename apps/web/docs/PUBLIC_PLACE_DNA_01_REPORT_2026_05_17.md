# PUBLIC-PLACE-DNA-01 Report

Data: 2026-05-17

## Escopo

Sprint focada em confirmar a pagina publica de local como conjunto de paginas irmas, nao como uma pagina unica com todos os fluxos empilhados.

## Entrega

- `Reserva`, `Aulas`, `Jogos`, `Planos` e `Sobre` usam rotas irmas.
- O header do local permanece compacto e comum.
- Cada rota exibe somente seu conteudo principal.
- Troca de rota reposiciona o topo para nao parecer ancora de rolagem.
- Planos acionam o fluxo de aulas/reserva com contexto.
- Quadras/valores ficam em `Sobre` e cada quadra pode abrir a agenda de reserva.

## Impacto UX

- O jogador deixa de atravessar uma pagina longa com reservas, aulas, jogos e planos misturados.
- Cada botao superior tem uma tarefa clara.
- Mobile reduz scroll e melhora orientacao.
- O conteudo secundario segue acessivel, mas deixa de competir com a acao principal.

## Validacao

- `git diff --check -- web/src/pages/PlacePublicPage.tsx`
- `npm.cmd run lint`
- `npm.cmd run build`
