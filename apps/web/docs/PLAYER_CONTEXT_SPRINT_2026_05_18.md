# Player Context Sprint - 2026-05-18

## Objetivo

Reduzir quebra de contexto no Player App: Home como resumo, areas pessoais como paginas reais, reserva sem horarios passados e sala de liga com comunicacao contextual.

## Decisoes UX

- A Home nao deve carregar a gestao completa de reservas, partidas, aulas ou pagamentos.
- Clique em item especifico deve abrir a area correta com detalhe quando houver identificador.
- Horarios passados nao devem parecer acionaveis; no calendario de quadras aparecem como `Passou`.
- A sala da liga deve manter o usuario no mesmo contexto; WhatsApp entra como apoio, nao como redirecionamento obrigatorio.

## Entregas

- `/minhas-reservas`: futuras, historico e detalhe da reserva em dialog.
- `/minhas-partidas`: competicoes ativas e historico, com links para torneio/liga no contexto correto.
- `/minhas-aulas`: matriculas ativas/pendentes com turma, horario, professor e local.
- `/meus-pagamentos`: pendencias e historico de pagamentos manuais/simulados.
- `AppDialog`: foco estabilizado para nao roubar o input do chat quando o callback `onClose` muda entre renders.
- Sala da liga: link de grupo de WhatsApp, copiar/abrir/remover e envio para participantes.
- Reservas: bloqueio frontend e RPC para horarios passados.

## Backend e migrations

- `0095_booking_past_time_guard_v1.sql`
  - protege busca de disponibilidade, criacao de reserva e lista de espera.
- `0096_league_match_room_links_v1.sql`
  - cria `league_match_room_links` com RLS baseada em leitura da liga e autoria/admin para edicao.

## Riscos restantes

- `/minhas-partidas` ainda e um agregador de competicoes, nao uma lista normalizada de todas as partidas individuais de torneio/liga. A sala individual continua sendo aberta no contexto da competicao.
- `/minhas-aulas` mostra matriculas e horarios atuais; calendario detalhado de aulas/aulas passadas deve evoluir junto da frente de academia.
- Pagamentos reais seguem desativados por decisao de produto; a pagina respeita pagamentos manuais/simulados existentes.

## Validacao

- `npm.cmd run lint`
- `npm.cmd run build`
