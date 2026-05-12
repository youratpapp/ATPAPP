import { supabase } from "./supabase";
import type { PublicRankingRow } from "./types";

type PublicRankingRpcRow = {
  league_player_id: string;
  league_id: string;
  league_name: string;
  season_id: string;
  season_name: string;
  class_id: string | null;
  category_name: string | null;
  class_name: string | null;
  display_name: string | null;
  user_id: string | null;
  city: string | null;
  state: string | null;
  matches_played: number | null;
  wins: number | null;
  losses: number | null;
  sets_for: number | null;
  sets_against: number | null;
  games_for: number | null;
  games_against: number | null;
  ranking_points: number | null;
  wo_against: number | null;
  position: number | null;
};

function rowToPublicRanking(row: PublicRankingRpcRow): PublicRankingRow {
  return {
    leaguePlayerId: row.league_player_id,
    leagueId: row.league_id,
    leagueName: row.league_name,
    seasonId: row.season_id,
    seasonName: row.season_name,
    classId: row.class_id,
    categoryName: row.category_name || "",
    className: row.class_name || "",
    displayName: row.display_name || "Jogador",
    userId: row.user_id,
    city: row.city || "",
    state: row.state || "",
    matchesPlayed: Number(row.matches_played || 0),
    wins: Number(row.wins || 0),
    losses: Number(row.losses || 0),
    setsFor: Number(row.sets_for || 0),
    setsAgainst: Number(row.sets_against || 0),
    gamesFor: Number(row.games_for || 0),
    gamesAgainst: Number(row.games_against || 0),
    rankingPoints: Number(row.ranking_points || 0),
    woAgainst: Number(row.wo_against || 0),
    position: Number(row.position || 0),
  };
}

export async function loadPublicRankings(input: {
  state?: string;
  city?: string;
  leagueId?: string;
  seasonId?: string;
} = {}): Promise<PublicRankingRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("app_public_league_rankings", {
    p_state: input.state?.trim() || null,
    p_city: input.city?.trim() || null,
    p_league_id: input.leagueId || null,
    p_season_id: input.seasonId || null,
  });
  if (error) throw new Error(error.message);
  return ((data ?? []) as PublicRankingRpcRow[]).map(rowToPublicRanking);
}
