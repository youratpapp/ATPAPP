# Sistema de Liga de Tenis — Implementacao (Fase 1)

## Objetivo desta fase
Entregar a base tecnica para o modo **Liga continua** sem quebrar o modulo de Torneios:

- modelo de dados completo no Supabase
- RLS e funcoes auxiliares de seguranca
- engine de sorteio/pareamento com regras de ciclo
- engine de ordenacao de ranking com criterios oficiais

## O que foi implementado agora

### Banco (Supabase)
Migration: `web/supabase/migrations/0006_league_core.sql`

Inclui entidades:

- `leagues`
- `league_seasons`
- `league_classes`
- `league_players`
- `league_rounds`
- `league_matches`
- `league_match_players`
- `league_match_availability`
- `league_match_messages`
- `league_match_result_submissions`
- `league_round_results`
- `league_ranking_snapshots`
- `league_admin_decisions`
- `league_pair_history`

Seguranca:

- RLS habilitado em todas as tabelas
- helper functions:
  - `app_is_league_owner`
  - `app_is_league_member`
  - `app_can_read_league`
- politica: owner com controle total; leitura para membro e liga publica
- RPC inicial de leitura:
  - `app_my_leagues()`

### Engine de Liga (TypeScript)
Arquivo: `web/src/league-engine/core.ts`

Inclui:

- tipos de dominio (liga, jogador, historico, rodada, placar)
- elegibilidade de jogadores por rodada (ativo, sem recesso)
- geracao de confrontos por modo:
  - simples
  - dupla fixa
  - dupla rotativa
- prioridades de pareamento:
  1. mesma classe
  2. ranking proximo
  3. evitar repeticao (ciclo completo)
  4. balancear volume de jogos
  5. balancear historico de WO
- ordenacao de ranking com desempate:
  1. vitorias
  2. saldo de sets
  3. confronto direto
  4. saldo de games
  5. numero de jogos
  6. ordem estavel por id (fallback)

## Como isso conecta com sua especificacao

- Temporadas independentes: coberto por `league_seasons`
- Rodadas geradas progressivamente: coberto por `league_rounds` e engine
- Ambiente de partida: coberto por `league_matches` + `league_match_messages` + `league_match_availability`
- Confirmacao/triagem administrativa: coberto por `league_match_result_submissions` + `league_admin_decisions`
- Ranking vivo e historico: coberto por snapshots e engine

## Proxima fase (UI e automacao)

1. Rotas/telas de Liga:
   - `/ligas`
   - `/ligas/:leagueId`
   - `/ligas/:leagueId/temporadas/:seasonId/rodadas/:roundId`

2. Job de geracao automatica de rodada:
   - edge function + cron (noite anterior)
   - usa elegibilidade + historico + regras do ciclo

3. Fluxo de resultado:
   - lancamento pelo jogador
   - confirmacao pelo adversario
   - fechamento automatico + recalculo ranking
   - fallback para triagem adm

4. Feed social automatico por evento encerrado.

