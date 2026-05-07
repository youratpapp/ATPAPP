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

function compareQualifiedDesc(a: QualifiedEntry, b: QualifiedEntry): number {
  if (b.v !== a.v) return b.v - a.v;
  if (b.saldo !== a.saldo) return b.saldo - a.saldo;
  if (b.pp !== a.pp) return b.pp - a.pp;
  return a.name.localeCompare(b.name, "pt-BR");
}

function compareQualifiedAsc(a: QualifiedEntry, b: QualifiedEntry): number {
  if (a.rank !== b.rank) return b.rank - a.rank;
  if (a.v !== b.v) return a.v - b.v;
  if (a.saldo !== b.saldo) return a.saldo - b.saldo;
  if (a.pp !== b.pp) return a.pp - b.pp;
  return a.name.localeCompare(b.name, "pt-BR");
}

function buildSeededEntriesFromGroups(
  groups: Group[],
  tables: Record<string, ReturnType<typeof calcTabelaGrupo>>,
  classificadosPorGrupo: number
): string[] {
  const k = Math.max(0, classificadosPorGrupo || 0);
  if (k <= 0) return [];

  const qualified: QualifiedEntry[] = [];
  groups.forEach((g) => {
    const table = tables[g.name] ?? [];
    for (let i = 0; i < Math.min(k, table.length); i += 1) {
      const row = table[i];
      if (!row?.[0]) continue;
      const stats = row[1];
      qualified.push({
        name: String(row[0]),
        groupName: g.name,
        rank: i + 1,
        v: Number(stats?.v || 0),
        saldo: Number(stats?.saldo || 0),
        pp: Number(stats?.pp || 0),
      });
    }
  });

  if (qualified.length < 2) return qualified.map((q) => q.name);

  const winners = qualified.filter((q) => q.rank === 1).sort(compareQualifiedDesc);
  const others = qualified.filter((q) => q.rank > 1).sort(compareQualifiedAsc);
  const bracketSize = nextPowerOf2(qualified.length);
  const byes = Math.max(0, bracketSize - qualified.length);
  const pairSlots = bracketSize / 2;
  const pairs: Array<[string, string]> = [];

  // Top seeds receive BYE when bracket is not full.
  let winnersPool = [...winners];
  for (let i = 0; i < byes && winnersPool.length; i += 1) {
    const seed = winnersPool.shift();
    if (seed) pairs.push([seed.name, "BYE"]);
  }

  // Remaining first-place players face the weakest possible lower-ranked players.
  winnersPool.forEach((seed) => {
    if (!others.length) return;
    let idx = others.findIndex((q) => q.groupName !== seed.groupName);
    if (idx < 0) idx = 0;
    const opponent = others.splice(idx, 1)[0];
    if (opponent) pairs.push([seed.name, opponent.name]);
  });

  // Remaining entrants are paired strongest vs weakest.
  const remaining = [...others].sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank;
    return compareQualifiedDesc(a, b);
  });
  while (remaining.length >= 2) {
    const strong = remaining.shift();
    const weak = remaining.pop();
    if (strong && weak) pairs.push([strong.name, weak.name]);
  }
  if (remaining.length === 1) {
    pairs.push([remaining[0].name, "BYE"]);
  }

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

    const allDone = out.grupos.length > 0 && out.grupos.every((g) => g.matches.every((m) => m.done));
    if (allDone && !out.knockout) {
      const seededEntries = buildSeededEntriesFromGroups(
        out.grupos,
        out.tabelaPorGrupo,
        out.config.classificadosPorGrupo
      );
      const clean = seededEntries.filter(Boolean);
      if (clean.length >= 2) {
        out.knockout = buildKnockout(clean, { preserveOrder: true });
      }
    }
  }

  if (out.config.formato === "mata_mata" && !out.knockout) {
    if (out.entradas.length >= 2) {
      out.knockout = buildKnockout(out.entradas);
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
