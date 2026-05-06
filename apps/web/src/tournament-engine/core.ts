export type TournamentConfig = {
  tipo: "duplas" | "simples";
  formato: "grupos" | "mata_mata";
  modoDuplas: "sorteio" | "manual";
  sorteioDuplas: "grupos_ab" | "todos";
  numGrupos: number;
  classificadosPorGrupo: number;
};

export type GroupMatch = {
  a: string;
  b: string;
  s1: string;
  s2: string;
  done: boolean;
  winner: string | null;
};

export type Group = {
  name: string;
  entries: string[];
  matches: GroupMatch[];
};

export type KnockoutMatch = {
  a: string | null;
  b: string | null;
  s1: string;
  s2: string;
  done: boolean;
  winner: string | null;
};

export type KnockoutRound = {
  name: string;
  matches: KnockoutMatch[];
};

export type KnockoutMeta = {
  totalEntradas: number;
  bracketSize: number;
  temPreliminar: boolean;
  jogosReaisPrimeiraRodada: number;
  byesPrimeiraRodada: number;
};

export type Knockout = {
  rounds: KnockoutRound[];
  meta: KnockoutMeta;
};

export type RankingRowStats = {
  v: number;
  d: number;
  j: number;
  pp: number;
  pc: number;
  saldo: number;
};

export type RankingRow = [string, RankingRowStats];

export type ClassData = {
  config: TournamentConfig;
  participantes: Array<{ nome: string }>;
  entradas: string[];
  grupos: Group[];
  knockout: Knockout | null;
  tabelaPorGrupo: Record<string, RankingRow[]>;
  gerado: boolean;
};

export const DEFAULT_CONFIG: TournamentConfig = {
  tipo: "duplas",
  formato: "grupos",
  modoDuplas: "sorteio",
  sorteioDuplas: "grupos_ab",
  numGrupos: 2,
  classificadosPorGrupo: 2,
};

export function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = Number.parseInt(String(value ?? ""), 10);
  if (Number.isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

export function normalizeConfig(cfgRaw: Partial<TournamentConfig> | null | undefined): TournamentConfig {
  const cfg = cfgRaw ?? {};
  const tipo = cfg.tipo === "simples" ? "simples" : "duplas";
  const formato = cfg.formato === "mata_mata" ? "mata_mata" : "grupos";
  const modoDuplas = cfg.modoDuplas === "manual" ? "manual" : "sorteio";
  const sorteioDuplas = cfg.sorteioDuplas === "todos" ? "todos" : "grupos_ab";
  return {
    tipo,
    formato,
    modoDuplas,
    sorteioDuplas,
    numGrupos: clampInt(cfg.numGrupos, 2, 16, 2),
    classificadosPorGrupo: clampInt(cfg.classificadosPorGrupo, 1, 16, 2),
  };
}

export function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = out[i] as T;
    out[i] = out[j] as T;
    out[j] = tmp;
  }
  return out;
}

export function buildRoundRobin(entries: string[]): GroupMatch[] {
  const matches: GroupMatch[] = [];
  for (let i = 0; i < entries.length; i += 1) {
    for (let j = i + 1; j < entries.length; j += 1) {
      matches.push({
        a: entries[i] as string,
        b: entries[j] as string,
        s1: "",
        s2: "",
        done: false,
        winner: null,
      });
    }
  }
  return matches;
}

export function splitIntoGroups(entries: string[], numGrupos: number): Group[] {
  const n = Math.max(2, Number(numGrupos) || 2);
  const groups: Group[] = [];
  for (let i = 0; i < n; i += 1) {
    groups.push({ name: `Grupo ${i + 1}`, entries: [], matches: [] });
  }

  entries.forEach((entry, idx) => {
    const gi = idx % n;
    (groups[gi] as Group).entries.push(entry);
  });

  groups.forEach((g) => {
    g.matches = buildRoundRobin(g.entries);
  });

  return groups;
}

export function nextPowerOf2(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

export function nomeRodada(matches: number): string {
  if (matches === 1) return "Final";
  if (matches === 2) return "Semifinal";
  if (matches === 4) return "Quartas";
  if (matches === 8) return "Oitavas";
  if (matches === 16) return "Fase de 32";
  return `Fase de ${matches * 2}`;
}

function winnerFromMatch(m: KnockoutMatch): string | null {
  if (!m.done) return null;
  const a = Number.parseInt(m.s1, 10);
  const b = Number.parseInt(m.s2, 10);
  if (Number.isNaN(a) || Number.isNaN(b) || a === b) return null;
  return a > b ? m.a : m.b;
}

export function buildKnockout(entries: string[]): Knockout {
  const clean = entries.filter(Boolean);
  const total = clean.length;
  const bracketSize = nextPowerOf2(Math.max(2, total));
  const byes = Math.max(0, bracketSize - total);

  const firstRound: KnockoutMatch[] = [];
  const temPreliminar = total > bracketSize / 2;

  if (temPreliminar) {
    const prelimParticipants = (bracketSize - total) * 2;
    const sorted = [...clean];
    const prelim = sorted.slice(0, prelimParticipants);
    const direct = sorted.slice(prelimParticipants);

    for (let i = 0; i < prelim.length; i += 2) {
      firstRound.push({
        a: prelim[i] ?? null,
        b: prelim[i + 1] ?? null,
        s1: "",
        s2: "",
        done: false,
        winner: null,
      });
    }

    const next: KnockoutMatch[] = [];
    for (let i = 0; i < bracketSize / 2; i += 1) {
      next.push({ a: null, b: null, s1: "", s2: "", done: false, winner: null });
    }

    let di = 0;
    for (let i = 0; i < next.length; i += 1) {
      const pick = direct[di];
      if (pick) {
        next[i] = { ...next[i], a: pick, b: null, winner: pick, done: true, s1: "1", s2: "0" };
        di += 1;
      }
    }

    const rounds: KnockoutRound[] = [{ name: "Rodada Preliminar", matches: firstRound }, { name: nomeRodada(next.length), matches: next }];

    let size = next.length;
    while (size > 1) {
      size = Math.floor(size / 2);
      rounds.push({
        name: nomeRodada(size),
        matches: Array.from({ length: size }).map(() => ({ a: null, b: null, s1: "", s2: "", done: false, winner: null })),
      });
    }

    const out: Knockout = {
      rounds,
      meta: {
        totalEntradas: total,
        bracketSize,
        temPreliminar: true,
        jogosReaisPrimeiraRodada: firstRound.length,
        byesPrimeiraRodada: byes,
      },
    };

    recomputeKnockout(out);
    return out;
  }

  const shuffled = [...clean];
  while (shuffled.length < bracketSize) shuffled.push("");
  for (let i = 0; i < shuffled.length; i += 2) {
    const a = shuffled[i] || null;
    const b = shuffled[i + 1] || null;
    const byeWin = !!a && !b;
    firstRound.push({
      a,
      b,
      s1: byeWin ? "1" : "",
      s2: byeWin ? "0" : "",
      done: byeWin,
      winner: byeWin ? a : null,
    });
  }

  const rounds: KnockoutRound[] = [{ name: nomeRodada(firstRound.length), matches: firstRound }];
  let size = firstRound.length;
  while (size > 1) {
    size = Math.floor(size / 2);
    rounds.push({
      name: nomeRodada(size),
      matches: Array.from({ length: size }).map(() => ({ a: null, b: null, s1: "", s2: "", done: false, winner: null })),
    });
  }

  const out: Knockout = {
    rounds,
    meta: {
      totalEntradas: total,
      bracketSize,
      temPreliminar: false,
      jogosReaisPrimeiraRodada: firstRound.filter((m) => !!m.a && !!m.b).length,
      byesPrimeiraRodada: byes,
    },
  };

  recomputeKnockout(out);
  return out;
}

export function recomputeKnockout(knockout: Knockout): void {
  const rounds = knockout.rounds || [];
  if (!rounds.length) return;

  for (let r = 0; r < rounds.length; r += 1) {
    const round = rounds[r] as KnockoutRound;
    for (let i = 0; i < round.matches.length; i += 1) {
      const m = round.matches[i] as KnockoutMatch;
      if (m.a && !m.b) {
        m.done = true;
        m.winner = m.a;
        if (!m.s1) m.s1 = "1";
        if (!m.s2) m.s2 = "0";
      } else if (!m.a || !m.b) {
        m.done = false;
        m.winner = null;
      } else {
        const w = winnerFromMatch(m);
        m.winner = w;
        m.done = !!w;
      }
    }

    const next = rounds[r + 1];
    if (!next) continue;

    for (let i = 0; i < next.matches.length; i += 1) {
      const left = round.matches[i * 2] as KnockoutMatch | undefined;
      const right = round.matches[i * 2 + 1] as KnockoutMatch | undefined;
      const slot = next.matches[i] as KnockoutMatch;

      const w1 = left?.winner ?? null;
      const w2 = right?.winner ?? null;

      const changed = slot.a !== w1 || slot.b !== w2;
      slot.a = w1;
      slot.b = w2;

      if (changed) {
        slot.s1 = "";
        slot.s2 = "";
        slot.done = false;
        slot.winner = null;
      }
    }
  }
}

export function calcTabelaGrupo(group: Group): RankingRow[] {
  const map: Record<string, RankingRowStats> = {};
  (group.entries || []).forEach((entry) => {
    map[entry] = { v: 0, d: 0, j: 0, pp: 0, pc: 0, saldo: 0 };
  });

  (group.matches || []).forEach((m) => {
    if (!m.done) return;
    const a = Number.parseInt(m.s1, 10);
    const b = Number.parseInt(m.s2, 10);
    if (Number.isNaN(a) || Number.isNaN(b)) return;
    if (!m.a || !m.b || !map[m.a] || !map[m.b]) return;

    map[m.a].j += 1;
    map[m.b].j += 1;
    map[m.a].pp += a;
    map[m.a].pc += b;
    map[m.b].pp += b;
    map[m.b].pc += a;

    if (a > b) {
      map[m.a].v += 1;
      map[m.b].d += 1;
    } else if (b > a) {
      map[m.b].v += 1;
      map[m.a].d += 1;
    }
  });

  Object.keys(map).forEach((k) => {
    map[k].saldo = map[k].pp - map[k].pc;
  });

  return Object.entries(map).sort((x, y) => {
    if (y[1].v !== x[1].v) return y[1].v - x[1].v;
    if (y[1].saldo !== x[1].saldo) return y[1].saldo - x[1].saldo;
    return y[1].pp - x[1].pp;
  }) as RankingRow[];
}

export function gerarClasseData(input: Partial<ClassData>): ClassData {
  const config = normalizeConfig(input.config);
  const participantes = Array.isArray(input.participantes) ? input.participantes : [];

  const entradas = (Array.isArray(input.entradas) ? input.entradas : participantes.map((p) => p.nome || "")).filter(Boolean);

  const data: ClassData = {
    config,
    participantes,
    entradas,
    grupos: [],
    knockout: null,
    tabelaPorGrupo: {},
    gerado: false,
  };

  if (entradas.length < 2) return data;

  if (config.formato === "grupos") {
    data.grupos = splitIntoGroups(entradas, config.numGrupos);
  } else {
    data.knockout = buildKnockout(entradas);
  }

  data.tabelaPorGrupo = {};
  data.grupos.forEach((g) => {
    data.tabelaPorGrupo[g.name] = calcTabelaGrupo(g);
  });

  if (data.knockout) {
    recomputeKnockout(data.knockout);
  }

  data.gerado = true;
  return data;
}
