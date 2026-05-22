# PUBLIC-COMP-01 Report

Data: 2026-05-15

## Escopo

Refinar a pagina publica de torneio/liga para jogador visitante ou inscrito, preservando a operacao completa para owner/staff.

## Causa

A superficie publica ja existia, mas ainda herdava sinais de Competition OS interno:

- cabecalho operacional duplicado antes do hero publico;
- resumo em formato de KPI;
- filtro de escopo da liga visivel para leitor publico;
- controles de agenda (`Exportar PNG`, `Copiar agenda`) disponiveis fora do contexto de organizador;
- inscritos/jogadores sem uma secao publica clara.

Isso fazia a pagina parecer painel de administracao, nao evento.

## Entregue

- `TournamentPage.tsx`
  - `CompetitionHeader` nao renderiza para leitor publico.
  - Topbar publica com `Voltar` e `Compartilhar`.
  - Action rail de `Categorias`, `Inscritos` e `Jogos`.
  - Secao publica de inscritos em rows, sem telefone.
  - Controles de exportar/copiar agenda restritos a quem gerencia partidas.

- `LeagueDetailsPage.tsx`
  - `CompetitionHeader` nao renderiza para leitor publico.
  - Topbar publica com `Voltar` e `Compartilhar`.
  - Action rail de `Classes`, `Jogadores` e `Partidas`.
  - Secao publica de jogadores em rows.
  - Filtro `Escopo da liga` restrito a owner.

- `App.css`
  - `competition-public-topbar`;
  - `competition-public-action-rail`;
  - `competition-public-list-section`;
  - `competition-public-person-row`;
  - mobile com action rail horizontal e CTA sticky preservado;
  - hero publico sem `font-size` por viewport.

## Impacto UX

- Jogador entende o evento antes de ver operacao, ranking ou partidas.
- A primeira dobra publica tem uma acao principal e atalhos publicos claros.
- Inscritos/jogadores ficam encontraveis sem expor contato.
- Mobile reduz empilhamento de blocos e evita cockpit administrativo.

## Impacto Produto

- A mesma rota continua servindo publico e organizador, mas a linguagem visual muda por papel.
- Funcoes internas foram preservadas para owner/staff.
- A pagina publica fica mais alinhada a apps de mercado: evento, categorias, inscritos/jogos e CTA.

## Arquivos

- `web/src/pages/TournamentPage.tsx`
- `web/src/pages/LeagueDetailsPage.tsx`
- `web/src/App.css`
- `web/docs/EXECUTION_QUEUE.md`
- `web/docs/CURRENT_PRODUCT_STATE.md`
- `web/docs/SCREEN_RESPONSIBILITIES.md`
- `web/docs/COMPONENT_GRAMMAR.md`
- `web/docs/COMPETITION_OS_V2_UX_PLAN.md`
- `web/docs/COMPETITION_OS_V2_IMPLEMENTATION_SPEC.md`

## Validacao

- `npx.cmd tsc -b --pretty false`
- `npm.cmd run lint`
- `npm.cmd run build`

## Riscos Restantes

- Se um torneio tiver centenas de inscritos, a lista publica pode precisar de busca/filtro por categoria.
- Sem `posterUrl`, torneio publico ainda usa placeholder; a qualidade visual depende do setup do organizador.
- A secao publica de inscrito ainda nao abre bottom sheet de detalhe, porque contato publico/permissao ainda nao tem contrato de produto definido.
