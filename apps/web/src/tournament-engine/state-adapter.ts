import {
  buildKnockout,
  calcTabelaGrupo,
  normalizeConfig,
  recomputeKnockout,
  type ClassData,
  type Group,
  type GroupMatch,
  type Knockout,
  type KnockoutMatch,
  type KnockoutRound,
} from "./core";

type AnyRecord = Record<string, unknown>;

export type LegacyClassRef = {
  key: string;
  categoryIndex: number;
  classIndex: number;
  categoryId: string;
  categoryName: string;
  classId: string;
  className: string;
  data: ClassData;
};

function asRecord(v: unknown): AnyRecord | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  return v as AnyRecord;
}

function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

function txt(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function txtOpt(v: unknown): string | undefined {
  const t = txt(v).trim();
  return t ? t : undefined;
}

function bool(v: unknown): boolean {
  return Boolean(v);
}

function toSeed(v: unknown): number | null {
  const n = Number.parseInt(String(v ?? "").trim(), 10);
  if (Number.isNaN(n) || n <= 0) return null;
  return n;
}

function normalizeGroupMatch(v: unknown): GroupMatch {
  const m = asRecord(v) ?? {};
  return {
    a: txt(m.a),
    b: txt(m.b),
    s1: txt(m.s1),
    s2: txt(m.s2),
    scoreLabel: txt(m.scoreLabel),
    done: bool(m.done),
    winner: txt(m.winner) || null,
  };
}

function normalizeGroup(v: unknown, index: number): Group {
  const g = asRecord(v) ?? {};
  return {
    name: txt(g.name) || `Grupo ${index + 1}`,
    entries: asArray(g.entries).map((x) => txt(x)).filter(Boolean),
    matches: asArray(g.matches).map(normalizeGroupMatch),
  };
}

function normalizeKoMatch(v: unknown): KnockoutMatch {
  const m = asRecord(v) ?? {};
  return {
    a: txt(m.a) || null,
    b: txt(m.b) || null,
    s1: txt(m.s1),
    s2: txt(m.s2),
    scoreLabel: txt(m.scoreLabel),
    done: bool(m.done),
    winner: txt(m.winner) || null,
  };
}

function normalizeKoRound(v: unknown, index: number): KnockoutRound {
  const r = asRecord(v) ?? {};
  return {
    name: txt(r.name) || `Fase ${index + 1}`,
    matches: asArray(r.matches).map(normalizeKoMatch),
  };
}

function normalizeKnockout(v: unknown): Knockout | null {
  const kn = asRecord(v);
  if (!kn) return null;
  const rounds = asArray(kn.rounds).map(normalizeKoRound);
  if (!rounds.length) return null;
  const meta = asRecord(kn.meta) ?? {};
  return {
    rounds,
    meta: {
      totalEntradas: Number(meta.totalEntradas) || 0,
      bracketSize: Number(meta.bracketSize) || 0,
      temPreliminar: bool(meta.temPreliminar),
      jogosReaisPrimeiraRodada: Number(meta.jogosReaisPrimeiraRodada) || 0,
      byesPrimeiraRodada: Number(meta.byesPrimeiraRodada) || 0,
    },
  };
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

type QualifiedEntry = {
  name: string;
  groupName: string;
  groupIndex: number;
  rank: number;
  v: number;
  saldo: number;
  pp: number;
};

function nextPowerOf2(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

function compareQualifiedGlobal(a: QualifiedEntry, b: QualifiedEntry): number {
  if (a.rank !== b.rank) return a.rank - b.rank;
  if (b.v !== a.v) return b.v - a.v;
  if (b.saldo !== a.saldo) return b.saldo - a.saldo;
  if (b.pp !== a.pp) return b.pp - a.pp;
  if (a.groupIndex !== b.groupIndex) return a.groupIndex - b.groupIndex;
  return a.name.localeCompare(b.name, "pt-BR");
}

function groupHasAnyResult(group: Group): boolean {
  return (group.matches || []).some((m) => m.done);
}

function buildSeededEntriesFromGroups(
  groups: Group[],
  tables: Record<string, ReturnType<typeof calcTabelaGrupo>>,
  classificadosPorGrupo: number
): string[] {
  const k = Math.max(0, classificadosPorGrupo || 0);
  if (k <= 0) return [];

  const qualifiedByGroup = new Map<number, QualifiedEntry[]>();
  const qualified: QualifiedEntry[] = [];
  groups.forEach((g, gi) => {
    const table = tables[g.name] ?? [];
    const withResults = groupHasAnyResult(g);
    const tableMap = new Map<string, { v: number; saldo: number; pp: number }>();
    table.forEach((row) => {
      if (!row?.[0]) return;
      const name = String(row[0]);
      const stats = row[1];
      tableMap.set(name, {
        v: Number(stats?.v || 0),
        saldo: Number(stats?.saldo || 0),
        pp: Number(stats?.pp || 0),
      });
    });

    const source: string[] = withResults
      ? table.slice(0, k).map((row) => String(row?.[0] || "")).filter(Boolean)
      : (g.entries || []).slice(0, k).map((name) => String(name || "")).filter(Boolean);

    const list: QualifiedEntry[] = source.map((name, idx) => {
      const stats = tableMap.get(name) || { v: 0, saldo: 0, pp: 0 };
      return {
        name,
        groupName: g.name,
        groupIndex: gi,
        rank: idx + 1,
        v: stats.v,
        saldo: stats.saldo,
        pp: stats.pp,
      };
    });
    qualifiedByGroup.set(gi, list);
    qualified.push(...list);
  });

  if (qualified.length < 2) return qualified.map((q) => q.name);

  const pairs: Array<[string, string]> = [];
  const leftovers: QualifiedEntry[] = [];

  for (let gi = 0; gi < groups.length; gi += 2) {
    const left = qualifiedByGroup.get(gi) ?? [];
    const right = qualifiedByGroup.get(gi + 1) ?? [];
    if (!right.length) {
      leftovers.push(...left);
      continue;
    }
    for (let pos = 0; pos < k; pos += 1) {
      const a = left[pos]?.name || "BYE";
      const b = right[k - 1 - pos]?.name || "BYE";
      if (a === "BYE" && b === "BYE") continue;
      pairs.push([a, b]);
    }
  }

  if (leftovers.length) {
    const ordered = [...leftovers].sort(compareQualifiedGlobal);
    while (ordered.length >= 2) {
      const strong = ordered.shift();
      const weak = ordered.pop();
      if (strong && weak) {
        pairs.push([strong.name, weak.name]);
      }
    }
    if (ordered.length === 1) {
      pairs.push([ordered[0].name, "BYE"]);
    }
  }

  const rawEntrants = qualified.map((q) => q.name).filter(Boolean);
  const bracketSize = nextPowerOf2(rawEntrants.length);
  const pairSlots = bracketSize / 2;

  while (pairs.length < pairSlots) {
    pairs.push(["BYE", "BYE"]);
  }

  const seededEntries = Array.from({ length: bracketSize }, () => "BYE");
  for (let i = 0; i < pairSlots; i += 1) {
    const pair = pairs[i];
    seededEntries[i] = pair?.[0] || "BYE";
    seededEntries[bracketSize - 1 - i] = pair?.[1] || "BYE";
  }
  return seededEntries;
}

function hasKnockoutStarted(knockout: Knockout | null): boolean {
  const first = knockout?.rounds?.[0];
  if (!first) return false;
  return (first.matches || []).some((m) => {
    const a = String(m.a || "");
    const b = String(m.b || "");
    const realMatch = a && b && a !== "BYE" && b !== "BYE";
    if (!realMatch) return false;
    return Boolean((m.s1 || "").trim() || (m.s2 || "").trim() || (m.scoreLabel || "").trim() || m.winner || m.done);
  });
}

export function normalizeClassData(raw: unknown): ClassData {
  const data = asRecord(raw) ?? {};
  const participantes = asArray(data.participantes)
    .map((p) => asRecord(p))
    .filter((p): p is AnyRecord => !!p)
    .map((p) => ({
      nome: txt(p.nome),
      grupo: txtOpt(p.grupo) ?? null,
      telefone: txtOpt(p.telefone),
      telefone2: txtOpt(p.telefone2),
      cabecaDeChave: toSeed((p as AnyRecord).cabecaDeChave),
      convitePendente: bool(p.convitePendente),
      conviteEnviado: bool(p.conviteEnviado),
    }))
    .filter((p) => p.nome);

  const entradasRaw = asArray(data.entradas).map((x) => txt(x)).filter(Boolean);
  const entradas = entradasRaw.length ? entradasRaw : participantes.map((p) => p.nome);

  const classData: ClassData = {
    config: normalizeConfig((asRecord(data.config) ?? {}) as Partial<ClassData["config"]>),
    participantes,
    entradas: uniqueStrings(entradas),
    grupos: asArray(data.grupos).map(normalizeGroup),
    knockout: normalizeKnockout(data.knockout),
    tabelaPorGrupo: {},
    gerado: bool(data.gerado),
  };

  return recomputeClassData(classData);
}

export function recomputeClassData(input: ClassData): ClassData {
  const out: ClassData = {
    ...input,
    config: normalizeConfig(input.config),
    participantes: [...input.participantes],
    entradas: uniqueStrings(input.entradas),
    grupos: input.grupos.map((g) => ({ ...g, entries: [...g.entries], matches: g.matches.map((m) => ({ ...m })) })),
    knockout: input.knockout
      ? {
          rounds: input.knockout.rounds.map((r) => ({ ...r, matches: r.matches.map((m) => ({ ...m })) })),
          meta: { ...input.knockout.meta },
        }
      : null,
    tabelaPorGrupo: {},
    gerado: input.gerado,
  };

  if (!out.entradas.length && out.participantes.length) {
    out.entradas = uniqueStrings(out.participantes.map((p) => p.nome));
  }

  if (out.config.formato === "grupos") {
    out.grupos.forEach((g) => {
      out.tabelaPorGrupo[g.name] = calcTabelaGrupo(g);
    });

    const isGroupKnockoutModel = out.config.modeloCompeticao === "grupos_mata_mata";
    if (isGroupKnockoutModel) {
      const seededEntries = buildSeededEntriesFromGroups(
        out.grupos,
        out.tabelaPorGrupo,
        out.config.classificadosPorGrupo
      );
      const realEntries = seededEntries.filter((name) => String(name || "").trim() && String(name || "").trim() !== "BYE");
      if (realEntries.length >= 2) {
        if (!out.knockout || !hasKnockoutStarted(out.knockout)) {
          out.knockout = buildKnockout(seededEntries, { preserveOrder: true });
        }
      } else if (!hasKnockoutStarted(out.knockout)) {
        out.knockout = null;
      }
    } else {
      // Modelos sem mata-mata continuam somente em fase de grupos.
      out.knockout = null;
    }
  }

  if (out.config.formato === "mata_mata" && !out.knockout) {
    if (out.entradas.length >= 2) {
      const seedMap = new Map<string, number>();
      out.participantes.forEach((p) => {
        const n = Number(p.cabecaDeChave || 0);
        if (n > 0) seedMap.set(String(p.nome || ""), n);
      });
      const hasSeeds = seedMap.size > 0;
      const orderedEntries = hasSeeds
        ? [...out.entradas].sort((a, b) => {
            const sa = seedMap.get(String(a)) || Number.MAX_SAFE_INTEGER;
            const sb = seedMap.get(String(b)) || Number.MAX_SAFE_INTEGER;
            if (sa !== sb) return sa - sb;
            return String(a).localeCompare(String(b), "pt-BR");
          })
        : out.entradas;
      out.knockout = buildKnockout(orderedEntries, { preserveOrder: hasSeeds });
    }
  }

  if (out.knockout) {
    recomputeKnockout(out.knockout, out.config);
  }

  out.gerado = out.grupos.some((g) => g.matches.length > 0) || !!out.knockout;
  return out;
}

export function listLegacyClassesFromTournamentData(dataRaw: Record<string, unknown>): LegacyClassRef[] {
  const data = asRecord(dataRaw) ?? {};
  const categories = asArray(data.categorias);
  const out: LegacyClassRef[] = [];

  categories.forEach((catRaw, catIdx) => {
    const cat = asRecord(catRaw) ?? {};
    const categoryId = txt(cat.id) || `cat-${catIdx + 1}`;
    const categoryName = txt(cat.nome) || "Categoria";
    const classes = asArray(cat.classes);

    classes.forEach((clsRaw, clsIdx) => {
      const cls = asRecord(clsRaw) ?? {};
      const classId = txt(cls.id) || `cls-${clsIdx + 1}`;
      const className = txt(cls.nome) || "Classe";
      const classData = normalizeClassData(cls.data);
      out.push({
        key: `${categoryId}:${classId}`,
        categoryIndex: catIdx,
        classIndex: clsIdx,
        categoryId,
        categoryName,
        classId,
        className,
        data: classData,
      });
    });
  });

  return out;
}

export function patchClassDataInTournamentData(
  dataRaw: Record<string, unknown>,
  ref: LegacyClassRef,
  nextData: ClassData
): Record<string, unknown> {
  const data = structuredClone(dataRaw ?? {});
  const categories = asArray((data as AnyRecord).categorias);
  const cat = asRecord(categories[ref.categoryIndex]);
  if (!cat) return data as Record<string, unknown>;

  const classes = asArray(cat.classes);
  const cls = asRecord(classes[ref.classIndex]);
  if (!cls) return data as Record<string, unknown>;

  cls.data = recomputeClassData(nextData);
  return data as Record<string, unknown>;
}
