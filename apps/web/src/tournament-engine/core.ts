import {
  decodeMatchScoreDetail,
  evaluateMatchScoreDetail,
  SCORE_DETAIL_PREFIX,
} from "../lib/tournament-score";

export type TournamentConfig = {
  tipo: "duplas" | "simples";
  formato: "grupos" | "mata_mata";
  modeloCompeticao:
    | "mata_mata_simples"
    | "grupos_mata_mata"
    | "round_robin"
    | "liga_ranking"
    | "dupla_eliminacao"
    | "super_tiebreak";
  superTiebreakBase: "mata_mata" | "grupos" | "round_robin";
  modoDuplas: "sorteio" | "manual";
  sorteioDuplas: "grupos_ab" | "todos";
  tipoPontuacao:
    | "melhor_de_3"
    | "melhor_de_3_super_tb"
    | "set_unico"
    | "pro_set"
    | "fast4"
    | "super_tb_unico";
  numeroSets: number;
  numGrupos: number;
  classificadosPorGrupo: number;
};

export type GroupMatch = {
  a: string;
  b: string;
  s1: string;
  s2: string;
  scoreLabel?: string;
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
  scoreLabel?: string;
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

export type BuildKnockoutOptions = {
  preserveOrder?: boolean;
  seeded?: boolean;
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
  cabecaDeChave?: number | null;
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
  modeloCompeticao: "grupos_mata_mata",
  superTiebreakBase: "grupos",
  modoDuplas: "sorteio",
  sorteioDuplas: "grupos_ab",
  tipoPontuacao: "melhor_de_3",
  numeroSets: 3,
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
  const modeloCompeticao =
    cfg.modeloCompeticao === "mata_mata_simples" ||
    cfg.modeloCompeticao === "grupos_mata_mata" ||
    cfg.modeloCompeticao === "round_robin" ||
    cfg.modeloCompeticao === "liga_ranking" ||
    cfg.modeloCompeticao === "dupla_eliminacao" ||
    cfg.modeloCompeticao === "super_tiebreak"
      ? cfg.modeloCompeticao
      : "grupos_mata_mata";
  const superTiebreakBase =
    cfg.superTiebreakBase === "mata_mata" || cfg.superTiebreakBase === "round_robin" ? cfg.superTiebreakBase : "grupos";
  const modoDuplas = cfg.modoDuplas === "manual" ? "manual" : "sorteio";
  const sorteioDuplas = cfg.sorteioDuplas === "todos" ? "todos" : "grupos_ab";
  const tipoPontuacao =
    cfg.tipoPontuacao === "melhor_de_3" ||
    cfg.tipoPontuacao === "melhor_de_3_super_tb" ||
    cfg.tipoPontuacao === "set_unico" ||
    cfg.tipoPontuacao === "pro_set" ||
    cfg.tipoPontuacao === "fast4" ||
    cfg.tipoPontuacao === "super_tb_unico"
      ? cfg.tipoPontuacao
      : "melhor_de_3";
  const numeroSetsFallback =
    tipoPontuacao === "set_unico" || tipoPontuacao === "pro_set" || tipoPontuacao === "super_tb_unico"
      ? 1
      : 3;
  const numeroSets = clampInt(cfg.numeroSets, 1, 5, numeroSetsFallback);
  return {
    tipo,
    formato,
    modeloCompeticao,
    superTiebreakBase,
    modoDuplas,
    sorteioDuplas,
    tipoPontuacao,
    numeroSets,
    numGrupos: clampInt(cfg.numGrupos, 1, 16, 2),
    classificadosPorGrupo: clampInt(cfg.classificadosPorGrupo, 0, 16, 2),
  };
}

function isSuperTieBreakPointsMode(config?: TournamentConfig): boolean {
  return config?.tipoPontuacao === "super_tb_unico" || config?.modeloCompeticao === "super_tiebreak";
}

function normalizeNumeroSetsByType(config: TournamentConfig): number {
  if (
    config.tipoPontuacao === "set_unico" ||
    config.tipoPontuacao === "pro_set" ||
    config.tipoPontuacao === "super_tb_unico"
  ) {
    return 1;
  }
  if (config.tipoPontuacao === "melhor_de_3" || config.tipoPontuacao === "melhor_de_3_super_tb") {
    return 3;
  }
  const bounded = Math.max(1, Math.min(5, Number(config.numeroSets) || 3));
  return bounded % 2 === 0 ? bounded + 1 : bounded;
}

function targetWinsByConfig(config?: TournamentConfig): number {
  if (!config) return 1;
  if (isSuperTieBreakPointsMode(config)) return 1;
  if (config.tipoPontuacao === "melhor_de_3" || config.tipoPontuacao === "melhor_de_3_super_tb") return 2;
  const bestOf = normalizeNumeroSetsByType(config);
  return Math.max(1, Math.floor(bestOf / 2) + 1);
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
          scoreLabel: "",
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

type SplitGroupOptions = {
  preserveOrder?: boolean;
  snake?: boolean;
};

function distributeSnake(entries: string[], numGrupos: number): string[][] {
  const buckets: string[][] = Array.from({ length: numGrupos }, () => []);
  if (numGrupos <= 1) {
    buckets[0] = [...entries];
    return buckets;
  }
  let idx = 0;
  let dir = 1;
  entries.forEach((entry) => {
    buckets[idx].push(entry);
    idx += dir;
    if (idx >= numGrupos) {
      idx = numGrupos - 1;
      dir = -1;
    } else if (idx < 0) {
      idx = 0;
      dir = 1;
    }
  });
  return buckets;
}

export function splitIntoGroups(entries: string[], numGrupos: number, options?: SplitGroupOptions): Group[] {
  const n = Math.max(1, Number(numGrupos) || 1);
  const groups: Group[] = [];
  for (let i = 0; i < n; i += 1) {
    groups.push({ name: `Grupo ${i + 1}`, entries: [], matches: [] });
  }

  const cleanEntries = entries.filter(Boolean);
  const mixed = options?.preserveOrder ? [...cleanEntries] : shuffle(cleanEntries);
  if (options?.snake) {
    const buckets = distributeSnake(mixed, n);
    buckets.forEach((arr, gi) => {
      (groups[gi] as Group).entries.push(...arr);
    });
  } else {
    mixed.forEach((entry, idx) => {
      const gi = idx % n;
      (groups[gi] as Group).entries.push(entry);
    });
  }

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

function buildSeedOrder(size: number): number[] {
  // Standard single-elimination seed placement so top seeds only meet later.
  // Example for 16: 1,16,8,9,4,13,5,12,2,15,7,10,3,14,6,11
  if (size <= 1) return [1];
  let order = [1, 2];
  while (order.length < size) {
    const nextSize = order.length * 2;
    const next: number[] = [];
    order.forEach((seed) => {
      next.push(seed, nextSize + 1 - seed);
    });
    order = next;
  }
  return order.slice(0, size);
}

export function nomeRodada(matches: number): string {
  if (matches === 1) return "Final";
  if (matches === 2) return "Semifinal";
  if (matches === 4) return "Quartas";
  if (matches === 8) return "Oitavas";
  if (matches === 16) return "Fase de 32";
  return `Fase de ${matches * 2}`;
}

function winnerFromMatch(m: KnockoutMatch, config?: TournamentConfig): string | null {
  if (!m) return null;
  if (m.a === "BYE" && m.b && m.b !== "BYE") return m.b;
  if (m.b === "BYE" && m.a && m.a !== "BYE") return m.a;
  if (!m.done) return null;
  if (config && String(m.scoreLabel || "").startsWith(SCORE_DETAIL_PREFIX)) {
    const detail = decodeMatchScoreDetail(m.scoreLabel, config, m.s1, m.s2);
    const evaluated = evaluateMatchScoreDetail(detail, config);
    if (!evaluated.done) return null;
    if (evaluated.winner === "a") return m.a;
    if (evaluated.winner === "b") return m.b;
    return null;
  }
  const a = Number.parseInt(m.s1, 10);
  const b = Number.parseInt(m.s2, 10);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  if (a === b) return null;
  if (isSuperTieBreakPointsMode(config)) {
    const max = Math.max(a, b);
    const diff = Math.abs(a - b);
    if (max < 10 || diff < 2) return null;
    return a > b ? m.a : m.b;
  }
  const targetWins = targetWinsByConfig(config);
  const bestOf = config ? normalizeNumeroSetsByType(config) : 1;
  if (a > bestOf || b > bestOf) return null;
  if (a >= targetWins && b < targetWins) return m.a;
  if (b >= targetWins && a < targetWins) return m.b;
  return null;
}

export function buildKnockout(entries: string[], options?: BuildKnockoutOptions): Knockout {
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

  const shuffled = options?.preserveOrder ? [...clean] : shuffle([...clean]);
  const bracketSize = nextPowerOf2(shuffled.length);
  const padded = [...shuffled];
  while (padded.length < bracketSize) padded.push("BYE");

  const arranged: string[] = Array.from({ length: bracketSize }, () => "BYE");
  if (options?.seeded) {
    const seedOrder = buildSeedOrder(bracketSize);
    for (let i = 0; i < bracketSize; i += 1) {
      const bracketPosition = i;
      const sourceIndex = (seedOrder[bracketPosition] || 1) - 1;
      arranged[bracketPosition] = padded[sourceIndex] || "BYE";
    }
  }

  const rounds: KnockoutRound[] = [];
  const first: KnockoutMatch[] = [];
  if (options?.seeded) {
    for (let i = 0; i < arranged.length; i += 2) {
      const a = arranged[i] as string;
      const b = arranged[i + 1] as string;
      first.push({ a, b, s1: "", s2: "", scoreLabel: "", done: false, winner: null });
    }
  } else {
    for (let i = 0; i < padded.length / 2; i += 1) {
      const a = padded[i] as string;
      const b = padded[padded.length - 1 - i] as string;
      first.push({ a, b, s1: "", s2: "", scoreLabel: "", done: false, winner: null });
    }
  }

  const temPreliminar = clean.length !== bracketSize;
  rounds.push({ name: temPreliminar ? "Rodada Preliminar" : nomeRodada(first.length), matches: first });

  let q = first.length;
  while (q > 1) {
    q = q / 2;
    const matches: KnockoutMatch[] = [];
    for (let i = 0; i < q; i += 1) {
      matches.push({ a: null, b: null, s1: "", s2: "", scoreLabel: "", done: false, winner: null });
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

export function recomputeKnockout(knockout: Knockout, config?: TournamentConfig): void {
  const rounds = knockout.rounds || [];
  if (!rounds.length) return;

  for (let r = 0; r < rounds.length; r += 1) {
    const round = rounds[r] as KnockoutRound;
    for (let i = 0; i < round.matches.length; i += 1) {
      const m = round.matches[i] as KnockoutMatch;
      if (!m) continue;
      if (m.a === "BYE" || m.b === "BYE") {
        m.done = true;
        m.winner = winnerFromMatch(m, config);
      } else if (!m.a || !m.b) {
        m.done = false;
        m.winner = null;
      } else {
        const w = winnerFromMatch(m, config);
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
        slot.scoreLabel = "";
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

  let entradas = (Array.isArray(input.entradas) ? input.entradas : participantes.map((p) => p.nome || "")).filter(Boolean);
  const seedMap = new Map<string, number>();
  participantes.forEach((p) => {
    const n = Number(p.cabecaDeChave || 0);
    if (n > 0) seedMap.set(String(p.nome || ""), n);
  });
  const hasSeeds = seedMap.size > 0;
  if (hasSeeds) {
    const seeded = entradas
      .filter((name) => seedMap.has(String(name)))
      .sort((a, b) => {
        const sa = seedMap.get(String(a)) || Number.MAX_SAFE_INTEGER;
        const sb = seedMap.get(String(b)) || Number.MAX_SAFE_INTEGER;
        if (sa !== sb) return sa - sb;
        return String(a).localeCompare(String(b), "pt-BR");
      });
    const nonSeeded = entradas
      .filter((name) => !seedMap.has(String(name)))
      .sort((a, b) => String(a).localeCompare(String(b), "pt-BR"));
    entradas = [...seeded, ...nonSeeded];
  }

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
    data.grupos = splitIntoGroups(entradas, config.numGrupos, {
      preserveOrder: hasSeeds,
      snake: hasSeeds,
    });
  } else {
    data.knockout = buildKnockout(entradas, { preserveOrder: hasSeeds, seeded: hasSeeds });
  }

  data.tabelaPorGrupo = {};
  data.grupos.forEach((g) => {
    data.tabelaPorGrupo[g.name] = calcTabelaGrupo(g);
  });

  if (data.knockout) {
    recomputeKnockout(data.knockout, config);
  }

  data.gerado = true;
  return data;
}
