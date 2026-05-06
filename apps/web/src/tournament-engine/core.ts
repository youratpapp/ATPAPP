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

export type ClassParticipant = {
  nome: string;
  grupo?: string | null;
  telefone?: string;
  telefone2?: string;
  convitePendente?: boolean;
  conviteEnviado?: boolean;
};

export type ClassData = {
  config: TournamentConfig;
  participantes: ClassParticipant[];
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
  let list = [...entries];
  const rounds: GroupMatch[] = [];
  if (list.length % 2 !== 0) list.push("BYE");
  const n = list.length;
  if (n < 2) return rounds;

  for (let r = 0; r < n - 1; r += 1) {
    for (let i = 0; i < n / 2; i += 1) {
      const a = list[i] as string;
      const b = list[n - 1 - i] as string;
      if (a !== "BYE" && b !== "BYE") {
        rounds.push({
          a,
          b,
          s1: "",
          s2: "",
          done: false,
          winner: null,
        });
      }
    }

    const fixed = list[0] as string;
    const rest = list.slice(1);
    const tail = rest.pop();
    if (tail !== undefined) rest.unshift(tail);
    list = [fixed, ...rest];
  }
  return rounds;
}

export function splitIntoGroups(entries: string[], numGrupos: number): Group[] {
  const n = Math.max(2, Number(numGrupos) || 2);
  const groups: Group[] = [];
  for (let i = 0; i < n; i += 1) {
    groups.push({ name: `Grupo ${i + 1}`, entries: [], matches: [] });
  }

  const mixed = shuffle(entries.filter(Boolean));
  mixed.forEach((entry, idx) => {
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
  if (!m) return null;
  if (m.a === "BYE" && m.b && m.b !== "BYE") return m.b;
  if (m.b === "BYE" && m.a && m.a !== "BYE") return m.a;
  if (!m.done) return null;
  const a = Number.parseInt(m.s1, 10);
  const b = Number.parseInt(m.s2, 10);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  if (a === b) return null;
  return a > b ? m.a : m.b;
}

export function buildKnockout(entries: string[]): Knockout {
  const clean = entries.filter(Boolean);
  if (clean.length < 2) {
    return {
      rounds: [],
      meta: {
        totalEntradas: clean.length,
        bracketSize: 0,
        temPreliminar: false,
        jogosReaisPrimeiraRodada: 0,
        byesPrimeiraRodada: 0,
      },
    };
  }

  const shuffled = shuffle([...clean]);
  const bracketSize = nextPowerOf2(shuffled.length);
  const padded = [...shuffled];
  while (padded.length < bracketSize) padded.push("BYE");

  const rounds: KnockoutRound[] = [];
  const first: KnockoutMatch[] = [];
  for (let i = 0; i < padded.length / 2; i += 1) {
    const a = padded[i] as string;
    const b = padded[padded.length - 1 - i] as string;
    first.push({ a, b, s1: "", s2: "", done: false, winner: null });
  }

  const temPreliminar = clean.length !== bracketSize;
  rounds.push({ name: temPreliminar ? "Rodada Preliminar" : nomeRodada(first.length), matches: first });

  let q = first.length;
  while (q > 1) {
    q = q / 2;
    const matches: KnockoutMatch[] = [];
    for (let i = 0; i < q; i += 1) {
      matches.push({ a: null, b: null, s1: "", s2: "", done: false, winner: null });
    }
    rounds.push({ name: nomeRodada(q), matches });
  }

  const byesPrimeira = first.filter((m) => m.a === "BYE" || m.b === "BYE").length;
  const jogosReaisPrimeira = first.filter((m) => m.a !== "BYE" && m.b !== "BYE").length;

  const out: Knockout = {
    rounds,
    meta: {
      totalEntradas: clean.length,
      bracketSize,
      temPreliminar,
      byesPrimeiraRodada: byesPrimeira,
      jogosReaisPrimeiraRodada: jogosReaisPrimeira,
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
      if (!m) continue;
      if (m.a === "BYE" || m.b === "BYE") {
        m.done = true;
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
