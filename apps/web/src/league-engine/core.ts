export type LeagueMode = "simples" | "dupla_fixa" | "dupla_rotativa";

export type LeagueMatchFormat =
  | "melhor_de_3"
  | "melhor_de_3_super_tb"
  | "set_unico"
  | "pro_set"
  | "fast4"
  | "super_tb_unico";

export type LeaguePlayerStatus = "active" | "inactive" | "recesso";

export type LeaguePlayer = {
  id: string;
  name: string;
  classKey: string;
  rankingPosition: number;
  matchesPlayed: number;
  woAgainst: number;
  status: LeaguePlayerStatus;
  recessActive: boolean;
  fixedPartnerId?: string;
};

export type OpponentHistory = Record<string, number>;
export type PartnerHistory = Record<string, number>;

export type LeagueCycleState = {
  opponentHistoryByPlayer: Record<string, OpponentHistory>;
  partnerHistoryByPlayer: Record<string, PartnerHistory>;
};

export type LeagueRoundSettings = {
  mode: LeagueMode;
  classKey: string;
  roundNumber: number;
};

export type LeaguePairing = {
  sideA: string[];
  sideB: string[];
  score: number;
};

export type LeagueRoundGenerationInput = {
  settings: LeagueRoundSettings;
  players: LeaguePlayer[];
  cycle: LeagueCycleState;
};

export type LeagueRankingRow = {
  playerId: string;
  wins: number;
  losses: number;
  setsFor: number;
  setsAgainst: number;
  gamesFor: number;
  gamesAgainst: number;
  matchesPlayed: number;
};

export type LeagueHeadToHead = Record<string, { wins: number; losses: number }>;

export type LeagueMatchResult = {
  playerAId: string;
  playerBId: string;
  winnerId: string;
  setsForA: number;
  setsForB: number;
  gamesForA: number;
  gamesForB: number;
};

const PRIORITY_WEIGHT = {
  sameClass: 1_000_000,
  rankingProximity: 100_000,
  noRepeatCycle: 10_000,
  matchBalance: 1_000,
  activeBalance: 100,
  woBalance: 10,
} as const;

function makePairKey(a: string, b: string): string {
  return [a, b].sort((x, y) => x.localeCompare(y, "pt-BR")).join("::");
}

function getHistoryCount(
  histMap: Record<string, Record<string, number>>,
  playerAId: string,
  playerBId: string
): number {
  const a = histMap[playerAId] || {};
  const b = histMap[playerBId] || {};
  return Math.max(Number(a[playerBId] || 0), Number(b[playerAId] || 0));
}

function classPool(players: LeaguePlayer[], classKey: string): LeaguePlayer[] {
  return players.filter((p) => p.classKey === classKey);
}

export function eligiblePlayersForRound(players: LeaguePlayer[], classKey: string): LeaguePlayer[] {
  return classPool(players, classKey)
    .filter((p) => p.status === "active" && !p.recessActive)
    .sort((a, b) => {
      if (a.rankingPosition !== b.rankingPosition) return a.rankingPosition - b.rankingPosition;
      return a.name.localeCompare(b.name, "pt-BR");
    });
}

function classCycleIsComplete(players: LeaguePlayer[], cycle: LeagueCycleState): boolean {
  if (players.length <= 2) return true;
  const ids = players.map((p) => p.id);
  for (let i = 0; i < ids.length; i += 1) {
    for (let j = i + 1; j < ids.length; j += 1) {
      const a = ids[i] as string;
      const b = ids[j] as string;
      if (getHistoryCount(cycle.opponentHistoryByPlayer, a, b) <= 0) {
        return false;
      }
    }
  }
  return true;
}

function opponentPairScore(
  a: LeaguePlayer,
  b: LeaguePlayer,
  cycle: LeagueCycleState,
  cycleComplete: boolean
): number {
  const sameClassBonus = a.classKey === b.classKey ? PRIORITY_WEIGHT.sameClass : 0;
  const rankingDistance = Math.abs(a.rankingPosition - b.rankingPosition);
  const proximityScore = PRIORITY_WEIGHT.rankingProximity - rankingDistance * 200;
  const hasPlayed = getHistoryCount(cycle.opponentHistoryByPlayer, a.id, b.id) > 0;
  const repeatPenalty = !cycleComplete && hasPlayed ? PRIORITY_WEIGHT.noRepeatCycle : 0;
  const gamesBalancePenalty = Math.abs(a.matchesPlayed - b.matchesPlayed) * PRIORITY_WEIGHT.matchBalance;
  const woPenalty = Math.abs(a.woAgainst - b.woAgainst) * PRIORITY_WEIGHT.woBalance;

  // Score high = better, penalties subtract heavily.
  return sameClassBonus + proximityScore - repeatPenalty - gamesBalancePenalty - woPenalty;
}

function buildSinglesPairings(players: LeaguePlayer[], cycle: LeagueCycleState): LeaguePairing[] {
  const pool = [...players];
  const cycleComplete = classCycleIsComplete(pool, cycle);
  const out: LeaguePairing[] = [];
  const used = new Set<string>();

  while (pool.length >= 2) {
    let best: { a: LeaguePlayer; b: LeaguePlayer; score: number } | null = null;
    for (let i = 0; i < pool.length; i += 1) {
      const a = pool[i] as LeaguePlayer;
      if (used.has(a.id)) continue;
      for (let j = i + 1; j < pool.length; j += 1) {
        const b = pool[j] as LeaguePlayer;
        if (used.has(b.id)) continue;
        const score = opponentPairScore(a, b, cycle, cycleComplete);
        if (!best || score > best.score) {
          best = { a, b, score };
        }
      }
    }

    if (!best) break;
    used.add(best.a.id);
    used.add(best.b.id);
    out.push({
      sideA: [best.a.id],
      sideB: [best.b.id],
      score: best.score,
    });
    const pairKey = new Set([best.a.id, best.b.id]);
    for (let i = pool.length - 1; i >= 0; i -= 1) {
      if (pairKey.has((pool[i] as LeaguePlayer).id)) pool.splice(i, 1);
    }
  }
  return out;
}

type FixedTeam = {
  playerA: LeaguePlayer;
  playerB: LeaguePlayer;
  teamKey: string;
  avgRanking: number;
  avgMatches: number;
  avgWo: number;
};

function buildFixedTeams(players: LeaguePlayer[]): FixedTeam[] {
  const byId = new Map(players.map((p) => [p.id, p]));
  const consumed = new Set<string>();
  const teams: FixedTeam[] = [];
  players.forEach((p) => {
    if (consumed.has(p.id) || !p.fixedPartnerId) return;
    const partner = byId.get(p.fixedPartnerId);
    if (!partner || partner.fixedPartnerId !== p.id || consumed.has(partner.id)) return;
    consumed.add(p.id);
    consumed.add(partner.id);
    teams.push({
      playerA: p,
      playerB: partner,
      teamKey: makePairKey(p.id, partner.id),
      avgRanking: (p.rankingPosition + partner.rankingPosition) / 2,
      avgMatches: (p.matchesPlayed + partner.matchesPlayed) / 2,
      avgWo: (p.woAgainst + partner.woAgainst) / 2,
    });
  });
  return teams;
}

function fixedTeamMatchScore(a: FixedTeam, b: FixedTeam): number {
  const rank = Math.abs(a.avgRanking - b.avgRanking);
  const games = Math.abs(a.avgMatches - b.avgMatches);
  const wo = Math.abs(a.avgWo - b.avgWo);
  return PRIORITY_WEIGHT.rankingProximity - rank * 250 - games * PRIORITY_WEIGHT.matchBalance - wo * PRIORITY_WEIGHT.woBalance;
}

function buildFixedDoublesPairings(players: LeaguePlayer[]): LeaguePairing[] {
  const teams = buildFixedTeams(players);
  const out: LeaguePairing[] = [];
  const pool = [...teams];
  while (pool.length >= 2) {
    let bestI = 0;
    let bestJ = 1;
    let bestScore = Number.NEGATIVE_INFINITY;
    for (let i = 0; i < pool.length; i += 1) {
      for (let j = i + 1; j < pool.length; j += 1) {
        const score = fixedTeamMatchScore(pool[i] as FixedTeam, pool[j] as FixedTeam);
        if (score > bestScore) {
          bestScore = score;
          bestI = i;
          bestJ = j;
        }
      }
    }
    const teamA = pool[bestI] as FixedTeam;
    const teamB = pool[bestJ] as FixedTeam;
    out.push({
      sideA: [teamA.playerA.id, teamA.playerB.id],
      sideB: [teamB.playerA.id, teamB.playerB.id],
      score: bestScore,
    });
    pool.splice(bestJ, 1);
    pool.splice(bestI, 1);
  }
  return out;
}

function partnerPairScore(a: LeaguePlayer, b: LeaguePlayer, cycle: LeagueCycleState): number {
  const partnerCount = getHistoryCount(cycle.partnerHistoryByPlayer, a.id, b.id);
  const rank = Math.abs(a.rankingPosition - b.rankingPosition);
  const partnerRepeatPenalty = partnerCount > 0 ? PRIORITY_WEIGHT.noRepeatCycle : 0;
  return PRIORITY_WEIGHT.rankingProximity - rank * 200 - partnerRepeatPenalty;
}

function buildRotativeTeams(players: LeaguePlayer[], cycle: LeagueCycleState): FixedTeam[] {
  const pool = [...players];
  const out: FixedTeam[] = [];
  const used = new Set<string>();

  while (pool.length >= 2) {
    let best: { a: LeaguePlayer; b: LeaguePlayer; score: number } | null = null;
    for (let i = 0; i < pool.length; i += 1) {
      const a = pool[i] as LeaguePlayer;
      if (used.has(a.id)) continue;
      for (let j = i + 1; j < pool.length; j += 1) {
        const b = pool[j] as LeaguePlayer;
        if (used.has(b.id)) continue;
        const score = partnerPairScore(a, b, cycle);
        if (!best || score > best.score) best = { a, b, score };
      }
    }
    if (!best) break;
    used.add(best.a.id);
    used.add(best.b.id);
    out.push({
      playerA: best.a,
      playerB: best.b,
      teamKey: makePairKey(best.a.id, best.b.id),
      avgRanking: (best.a.rankingPosition + best.b.rankingPosition) / 2,
      avgMatches: (best.a.matchesPlayed + best.b.matchesPlayed) / 2,
      avgWo: (best.a.woAgainst + best.b.woAgainst) / 2,
    });
    for (let i = pool.length - 1; i >= 0; i -= 1) {
      const id = (pool[i] as LeaguePlayer).id;
      if (id === best.a.id || id === best.b.id) pool.splice(i, 1);
    }
  }
  return out;
}

function buildRotativeDoublesPairings(players: LeaguePlayer[], cycle: LeagueCycleState): LeaguePairing[] {
  const teams = buildRotativeTeams(players, cycle);
  const out: LeaguePairing[] = [];
  const pool = [...teams];
  while (pool.length >= 2) {
    let bestI = 0;
    let bestJ = 1;
    let bestScore = Number.NEGATIVE_INFINITY;
    for (let i = 0; i < pool.length; i += 1) {
      for (let j = i + 1; j < pool.length; j += 1) {
        const score = fixedTeamMatchScore(pool[i] as FixedTeam, pool[j] as FixedTeam);
        if (score > bestScore) {
          bestScore = score;
          bestI = i;
          bestJ = j;
        }
      }
    }
    const teamA = pool[bestI] as FixedTeam;
    const teamB = pool[bestJ] as FixedTeam;
    out.push({
      sideA: [teamA.playerA.id, teamA.playerB.id],
      sideB: [teamB.playerA.id, teamB.playerB.id],
      score: bestScore,
    });
    pool.splice(bestJ, 1);
    pool.splice(bestI, 1);
  }
  return out;
}

export function generateLeagueRoundPairings(input: LeagueRoundGenerationInput): LeaguePairing[] {
  const eligible = eligiblePlayersForRound(input.players, input.settings.classKey);
  if (input.settings.mode === "simples") {
    return buildSinglesPairings(eligible, input.cycle);
  }
  if (input.settings.mode === "dupla_fixa") {
    return buildFixedDoublesPairings(eligible);
  }
  return buildRotativeDoublesPairings(eligible, input.cycle);
}

function headToHeadKey(playerAId: string, playerBId: string): string {
  return makePairKey(playerAId, playerBId);
}

export function buildHeadToHead(results: LeagueMatchResult[]): LeagueHeadToHead {
  const out: LeagueHeadToHead = {};
  results.forEach((r) => {
    const key = headToHeadKey(r.playerAId, r.playerBId);
    const prev = out[key] || { wins: 0, losses: 0 };
    if (r.winnerId === r.playerAId) {
      out[key] = { wins: prev.wins + 1, losses: prev.losses };
    } else if (r.winnerId === r.playerBId) {
      out[key] = { wins: prev.wins, losses: prev.losses + 1 };
    } else {
      out[key] = prev;
    }
  });
  return out;
}

export function sortLeagueRanking(rows: LeagueRankingRow[], headToHead: LeagueHeadToHead): LeagueRankingRow[] {
  const list = [...rows];
  list.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    const setDiffA = a.setsFor - a.setsAgainst;
    const setDiffB = b.setsFor - b.setsAgainst;
    if (setDiffB !== setDiffA) return setDiffB - setDiffA;

    const hh = headToHead[headToHeadKey(a.playerId, b.playerId)];
    if (hh && hh.wins !== hh.losses) {
      // For canonical key, "wins" belongs to lexical first id. Adjust comparison:
      const lexicalAFirst = [a.playerId, b.playerId].sort((x, y) => x.localeCompare(y, "pt-BR"))[0] === a.playerId;
      const advantageForA = lexicalAFirst ? hh.wins - hh.losses : hh.losses - hh.wins;
      if (advantageForA !== 0) return advantageForA > 0 ? -1 : 1;
    }

    const gameDiffA = a.gamesFor - a.gamesAgainst;
    const gameDiffB = b.gamesFor - b.gamesAgainst;
    if (gameDiffB !== gameDiffA) return gameDiffB - gameDiffA;
    if (b.matchesPlayed !== a.matchesPlayed) return b.matchesPlayed - a.matchesPlayed;

    return a.playerId.localeCompare(b.playerId, "pt-BR");
  });
  return list;
}

