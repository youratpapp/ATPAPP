# COMP-SETUP-02 Report - Wizard De Criacao De Liga

Data: 2026-05-15

## Objetivo

Transformar a criacao de liga em um setup guiado, com ordem operacional clara e persistencia inicial suficiente para a liga nascer utilizavel.

## Entrega

- `Ligas que organizo > Criar` agora usa `SetupWizard` em 6 etapas: `Basico`, `Jogadores`, `Formato`, `Pontuacao`, `Agenda` e `Revisar`.
- A criacao deixou de gravar apenas nome/tipo/recorte e agora persiste configuracao real em `leagues`, `league_seasons`, `league_classes` e `settings`.
- O organizador pode criar rascunho ou liga ativa.
- Classes iniciais sao criadas junto com a temporada inicial.
- Regras de rodada, prazo de resultado, acesso/rebaixamento, pontuacao, WO, entrada publica, taxa e agenda base sao salvas no payload inicial.

## Impacto De UX

- Reduz improviso posterior: o organizador entende a ordem natural da configuracao antes de entrar no workspace da liga.
- Evita pagina longa de formulario tecnico.
- Mantem detalhes recorrentes, como convite/importacao de jogadores e operacao de rodada, dentro da liga.
- Mobile herda o contrato do wizard ja usado em torneio, com uma coluna e CTA por etapa.

## Impacto De Produto

- A liga nasce com temporada e classes vinculadas, evitando a sensacao de objeto vazio.
- `registration_fee_cents`, `public_join_enabled`, `join_requires_approval` e `auto_round_generation_enabled` ficam configurados desde a criacao.
- Agenda base fica registrada em `settings.setup` e `league_seasons.settings_override`.
- Pontuacao padrao fica registrada em `settings.points`.

## Arquivos Alterados

- `web/src/pages/LeaguesPage.tsx`
- `web/src/lib/leagues.ts`
- `web/docs/EXECUTION_QUEUE.md`
- `web/docs/CURRENT_PRODUCT_STATE.md`
- `web/docs/COMPETITION_OS_V2_UX_PLAN.md`
- `web/docs/COMPETITION_OS_V2_IMPLEMENTATION_SPEC.md`

## Validacao

- `npx.cmd tsc -b --pretty false`
- `npm.cmd run lint`
- `npm.cmd run build`

## Riscos Restantes

- Sem transacao multi-table no client: se `league_seasons` ou `league_classes` falharem apos criar `leagues`, a API pode deixar uma liga parcialmente criada. O fluxo ja retorna erro amigavel, mas uma RPC transacional futura seria mais robusta.
- Importacao/convite em lote de jogadores nao foi movida para o setup. Isso e intencional para manter setup curto.
- A agenda salva a configuracao base; distribuicao de partidas segue dependendo das rotinas internas de geracao/operacao da liga.
