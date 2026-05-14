import { buildKnockout, normalizeConfig, type ClassData } from "./core";

export type AgendaDay = {
  data: string;
  inicio: string;
  fim: string;
};

export type AgendaConfig = {
  duracaoMin: number;
  quadras: string[];
  dias: AgendaDay[];
  travarSemifinalDia: boolean;
  diaSemifinal: string;
  travarFinalDia: boolean;
  diaFinal: string;
  quadrasSemifinal: string[];
  quadrasFinal: string[];
};

export type AgendaAssignment = {
  data: string;
  hora: string;
  horaFim: string;
  quadra: string;
  categoria: string;
  classe: string;
  classKey: string;
  stage: string;
  round: string;
  matchLabel: string;
  matchKey: string;
  p1: string;
  p2: string;
  isFinal: boolean;
  isSemifinal: boolean;
};

export type Agenda = {
  assignments: AgendaAssignment[];
  total: number;
  unassigned: number;
  generatedAt: string;
};

export type ScheduleClassInput = {
  classKey: string;
  categoryName: string;
  className: string;
  data: ClassData;
};

type Slot = {
  data: string;
  hora: string;
  horaFim: string;
  quadra: string;
  startMin: number;
};

type MatchScheduleItem = {
  classKey: string;
  categoria: string;
  classe: string;
  stage: string;
  round: string;
  matchLabel: string;
  matchKey: string;
  done: boolean;
  p1: string;
  p2: string;
  isFinal: boolean;
  isSemifinal: boolean;
  order: number;
};

function isSchedulableMatch(p1: string, p2: string): boolean {
  const a = String(p1 || "").trim();
  const b = String(p2 || "").trim();
  return Boolean(a && b && a !== "BYE" && b !== "BYE");
}

function clampInt(v: unknown, min: number, max: number, fallback: number): number {
  const n = Number.parseInt(String(v ?? ""), 10);
  if (Number.isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

export function parseTimeToMin(hhmm: string): number | null {
  const m = /^(\d{2}):(\d{2})$/.exec(String(hhmm || ""));
  if (!m) return null;
  const h = Number.parseInt(m[1] as string, 10);
  const mm = Number.parseInt(m[2] as string, 10);
  if (h < 0 || h > 23 || mm < 0 || mm > 59) return null;
  return h * 60 + mm;
}

function minToTime(value: number): string {
  const h = Math.floor(value / 60);
  const m = value % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function todayYmd(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = out[i] as T;
    out[i] = out[j] as T;
    out[j] = t;
  }
  return out;
}

export function normalizeAgendaConfig(input: Partial<AgendaConfig> | null | undefined): AgendaConfig {
  const src = input ?? {};
  const c: AgendaConfig = {
    duracaoMin: 45,
    quadras: [],
    dias: [],
    travarSemifinalDia: false,
    diaSemifinal: "",
    travarFinalDia: false,
    diaFinal: "",
    quadrasSemifinal: [],
    quadrasFinal: [],
    ...src,
  };

  const rawDias = Array.isArray(c.dias) ? c.dias : [];
  c.dias = rawDias
    .map((d) => ({
      data: /^\d{4}-\d{2}-\d{2}$/.test(String(d?.data || "")) ? String(d.data) : todayYmd(),
      inicio: /^\d{2}:\d{2}$/.test(String(d?.inicio || "")) ? String(d.inicio) : "08:00",
      fim: /^\d{2}:\d{2}$/.test(String(d?.fim || "")) ? String(d.fim) : "22:00",
    }))
    .filter((d) => {
      const s = parseTimeToMin(d.inicio);
      const e = parseTimeToMin(d.fim);
      return s !== null && e !== null && e > s;
    })
    .sort((a, b) => (a.data !== b.data ? a.data.localeCompare(b.data) : a.inicio.localeCompare(b.inicio)));

  c.duracaoMin = clampInt(c.duracaoMin, 10, 240, 45);
  c.quadras = (Array.isArray(c.quadras) ? c.quadras : []).map((q) => String(q || "").trim()).filter(Boolean);

  const validCourts = new Set(c.quadras.map((q) => q.toLowerCase()));

  c.quadrasSemifinal = (Array.isArray(src.quadrasSemifinal) ? src.quadrasSemifinal : c.quadras)
    .map((q) => String(q || "").trim())
    .filter((q) => !!q && validCourts.has(q.toLowerCase()));

  c.quadrasFinal = (Array.isArray(src.quadrasFinal) ? src.quadrasFinal : c.quadras)
    .map((q) => String(q || "").trim())
    .filter((q) => !!q && validCourts.has(q.toLowerCase()));

  if (c.quadras.length && !c.quadrasSemifinal.length) c.quadrasSemifinal = [...c.quadras];
  if (c.quadras.length && !c.quadrasFinal.length) c.quadrasFinal = [...c.quadras];
  if (!c.quadras.length) {
    c.quadrasSemifinal = [];
    c.quadrasFinal = [];
  }

  c.travarSemifinalDia = !!c.travarSemifinalDia;
  c.travarFinalDia = !!c.travarFinalDia;

  const diasUnicos = Array.from(new Set(c.dias.map((d) => d.data))).sort();
  if (!diasUnicos.length) {
    c.diaSemifinal = "";
    c.diaFinal = "";
  } else {
    const primeiroDia = diasUnicos[0] as string;
    const ultimoDia = diasUnicos[diasUnicos.length - 1] as string;
    c.diaSemifinal = diasUnicos.includes(String(c.diaSemifinal || "")) ? String(c.diaSemifinal) : primeiroDia;
    c.diaFinal = diasUnicos.includes(String(c.diaFinal || "")) ? String(c.diaFinal) : ultimoDia;
  }

  return c;
}

export function normalizeAgenda(input: Partial<Agenda> | null | undefined): Agenda {
  const src = input ?? {};
  return {
    assignments: Array.isArray(src.assignments) ? (src.assignments as AgendaAssignment[]) : [],
    total: clampInt(src.total, 0, 100000, 0),
    unassigned: clampInt(src.unassigned, 0, 100000, 0),
    generatedAt: String(src.generatedAt || ""),
  };
}

function buildMatchKey(categoria: string, classe: string, round: string, matchIndex: number): string {
  return `${String(categoria || "")}||${String(classe || "")}||${String(round || "")}||${matchIndex + 1}`;
}

function buildForecastKnockout(data: ClassData) {
  const cfg = normalizeConfig(data.config);
  const totalClassificados = Math.min((data.entradas || []).length, cfg.numGrupos * cfg.classificadosPorGrupo);
  if (totalClassificados < 2) return null;
  const fake: string[] = [];
  for (let i = 1; i <= totalClassificados; i += 1) fake.push(`Classificado ${i}`);
  return buildKnockout(fake);
}

function collectClassScheduleMatches(input: ScheduleClassInput): MatchScheduleItem[] {
  const { classKey, categoryName, className, data } = input;
  const cfg = normalizeConfig(data.config);
  const list: MatchScheduleItem[] = [];

  if (cfg.formato === "grupos") {
    (data.grupos || []).forEach((g, gi) => {
      (g.matches || []).forEach((m, mi) => {
        const p1 = m.a === "BYE" ? "BYE" : m.a || "A definir";
        const p2 = m.b === "BYE" ? "BYE" : m.b || "A definir";
        if (!isSchedulableMatch(p1, p2)) return;
        list.push({
          classKey,
          categoria: categoryName,
          classe: className,
          stage: "Grupos",
          round: g.name,
          matchLabel: `${g.name} #${mi + 1}`,
          matchKey: buildMatchKey(categoryName, className, g.name, mi),
          done: !!m.done,
          p1,
          p2,
          isFinal: false,
          isSemifinal: false,
          order: 100 + gi,
        });
      });
    });

    const ko = data.knockout || buildForecastKnockout(data);
    if (ko && Array.isArray(ko.rounds)) {
      ko.rounds.forEach((r, ri) => {
        (r.matches || []).forEach((m, mi) => {
          const p1 = m.a === "BYE" ? "BYE" : m.a || "A definir";
          const p2 = m.b === "BYE" ? "BYE" : m.b || "A definir";
          if (!isSchedulableMatch(p1, p2)) return;
          list.push({
            classKey,
            categoria: categoryName,
            classe: className,
            stage: "Finais",
            round: r.name,
            matchLabel: `${r.name} #${mi + 1}`,
            matchKey: buildMatchKey(categoryName, className, r.name, mi),
            done: !!m.done,
            p1,
            p2,
            isFinal: ri === ko.rounds.length - 1,
            isSemifinal: ri === ko.rounds.length - 2,
            order: 900 + ri,
          });
        });
      });
    }
  } else {
    const ko = data.knockout;
    if (ko && Array.isArray(ko.rounds)) {
      ko.rounds.forEach((r, ri) => {
      (r.matches || []).forEach((m, mi) => {
        const p1 = m.a === "BYE" ? "BYE" : m.a || "A definir";
        const p2 = m.b === "BYE" ? "BYE" : m.b || "A definir";
        if (!isSchedulableMatch(p1, p2)) return;
        list.push({
          classKey,
          categoria: categoryName,
          classe: className,
            stage: "Mata-mata",
            round: r.name,
            matchLabel: `${r.name} #${mi + 1}`,
            matchKey: buildMatchKey(categoryName, className, r.name, mi),
            done: !!m.done,
          p1,
          p2,
            isFinal: ri === ko.rounds.length - 1,
            isSemifinal: ri === ko.rounds.length - 2,
            order: 300 + ri,
          });
        });
      });
    }
  }

  return list;
}

function interleaveByClass(items: MatchScheduleItem[]): MatchScheduleItem[] {
  const map: Record<string, MatchScheduleItem[]> = {};
  const keys: string[] = [];
  items.forEach((it) => {
    if (!map[it.classKey]) {
      map[it.classKey] = [];
      keys.push(it.classKey);
    }
    map[it.classKey].push(it);
  });
  const out: MatchScheduleItem[] = [];
  let keep = true;
  while (keep) {
    keep = false;
    keys.forEach((k) => {
      if (map[k]?.length) {
        out.push(map[k].shift() as MatchScheduleItem);
        keep = true;
      }
    });
  }
  return out;
}

function interleaveByClassPerOrder(items: MatchScheduleItem[]): MatchScheduleItem[] {
  const ordered = [...items].sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    if (a.categoria !== b.categoria) return a.categoria.localeCompare(b.categoria);
    if (a.classe !== b.classe) return a.classe.localeCompare(b.classe);
    return String(a.matchLabel || "").localeCompare(String(b.matchLabel || ""));
  });

  const map: Record<string, MatchScheduleItem[]> = {};
  const orderKeys: string[] = [];
  ordered.forEach((it) => {
    const k = String(it.order);
    if (!map[k]) {
      map[k] = [];
      orderKeys.push(k);
    }
    map[k].push(it);
  });

  const out: MatchScheduleItem[] = [];
  orderKeys.forEach((k) => out.push(...interleaveByClass(map[k] ?? [])));
  return out;
}

function buildSlotBuckets(slots: Slot[]) {
  const ordered = [...slots].sort((a, b) => {
    if (a.data !== b.data) return a.data.localeCompare(b.data);
    if (a.startMin !== b.startMin) return a.startMin - b.startMin;
    return String(a.quadra).localeCompare(String(b.quadra));
  });

  const map: Record<string, { data: string; hora: string; horaFim: string; startMin: number; quadras: string[] }> = {};
  const keys: string[] = [];

  ordered.forEach((s) => {
    const k = `${s.data}|${s.hora}|${s.horaFim}`;
    if (!map[k]) {
      map[k] = { data: s.data, hora: s.hora, horaFim: s.horaFim, startMin: s.startMin, quadras: [] };
      keys.push(k);
    }
    map[k].quadras.push(s.quadra);
  });

  return keys.map((k) => ({
    ...map[k],
    quadras: shuffle(map[k].quadras),
  }));
}

function allocateMatchesByNextSlots(matches: MatchScheduleItem[], slots: Slot[], cfg: AgendaConfig): AgendaAssignment[] {
  const buckets = buildSlotBuckets(slots);
  const assignments: AgendaAssignment[] = [];
  let bi = 0;

  function allowedForMatch(match: MatchScheduleItem, court: string): boolean {
    const cmp = String(court || "").toLowerCase();
    if (match.isFinal) return (cfg.quadrasFinal || []).some((q) => String(q).toLowerCase() === cmp);
    if (match.isSemifinal) return (cfg.quadrasSemifinal || []).some((q) => String(q).toLowerCase() === cmp);
    return true;
  }

  matches.forEach((m) => {
    while (bi < buckets.length && !buckets[bi].quadras.length) bi += 1;

    let picked: { i: number; b: (typeof buckets)[number]; qi: number } | null = null;
    for (let i = bi; i < buckets.length; i += 1) {
      const b = buckets[i];
      if (!b?.quadras.length) continue;
      const qi = b.quadras.findIndex((q) => allowedForMatch(m, q));
      if (qi >= 0) {
        picked = { i, b, qi };
        break;
      }
    }

    if (!picked) return;
    const quadra = picked.b.quadras.splice(picked.qi, 1)[0] as string;

    assignments.push({
      data: picked.b.data,
      hora: picked.b.hora,
      horaFim: picked.b.horaFim,
      quadra,
      categoria: m.categoria,
      classe: m.classe,
      classKey: m.classKey,
      stage: m.stage,
      round: m.round,
      matchLabel: m.matchLabel,
      matchKey: m.matchKey,
      p1: m.p1,
      p2: m.p2,
      isFinal: m.isFinal,
      isSemifinal: !!m.isSemifinal,
    });
  });

  return assignments;
}

function slotKey(s: Slot): string {
  return `${s.data}|${s.hora}|${s.horaFim}|${s.quadra}`;
}

function reserveDaySlots(
  slots: Slot[],
  day: string,
  count: number,
  fromEnd: boolean,
  firstMatch: MatchScheduleItem | null,
  cfg: AgendaConfig
): Slot[] {
  const ordered = [...slots].sort((a, b) => {
    if (a.data !== b.data) return a.data.localeCompare(b.data);
    if (a.startMin !== b.startMin) return a.startMin - b.startMin;
    return String(a.quadra).localeCompare(String(b.quadra));
  });

  let daySlots = ordered.filter((s) => s.data === day);
  if (firstMatch) {
    let list: string[] = [];
    if (firstMatch.isFinal) list = cfg.quadrasFinal || [];
    else if (firstMatch.isSemifinal) list = cfg.quadrasSemifinal || [];

    if (list.length) {
      const allowed = new Set(list.map((q) => String(q).toLowerCase()));
      daySlots = daySlots.filter((s) => allowed.has(String(s.quadra || "").toLowerCase()));
    }
  }

  if (!count || count <= 0 || !daySlots.length) return [];
  if (fromEnd) return daySlots.slice(Math.max(0, daySlots.length - count));
  return daySlots.slice(0, count);
}

export function validateAgendaPrerequisites(cfgRaw: Partial<AgendaConfig> | null | undefined): void {
  const cfg = normalizeAgendaConfig(cfgRaw);
  if (!cfg.quadras.length) throw new Error("Informe ao menos uma quadra.");
  if (!cfg.dias.length) throw new Error("Informe ao menos um dia de evento.");

  const okDia = cfg.dias.some((d) => {
    const s = parseTimeToMin(d.inicio);
    const e = parseTimeToMin(d.fim);
    return s !== null && e !== null && e > s && e - s >= cfg.duracaoMin;
  });
  if (!okDia) {
    throw new Error("Nenhum dia possui janela suficiente para a duracao configurada.");
  }
}

export function generateScheduleAssignments(
  classes: ScheduleClassInput[],
  cfgRaw: Partial<AgendaConfig> | null | undefined
): Agenda {
  const cfg = normalizeAgendaConfig(cfgRaw);
  const duration = cfg.duracaoMin;
  if (!cfg.dias.length) throw new Error("Adicione ao menos 1 dia de evento.");

  const slots: Slot[] = [];
  cfg.dias.forEach((d) => {
    const start = parseTimeToMin(d.inicio);
    const end = parseTimeToMin(d.fim);
    if (start === null || end === null) return;
    if (end <= start) return;
    if (end - start < duration) return;

    for (let t = start; t + duration <= end; t += duration) {
      cfg.quadras.forEach((q) => {
        slots.push({ data: d.data, hora: minToTime(t), horaFim: minToTime(t + duration), quadra: q, startMin: t });
      });
    }
  });

  if (!slots.length) throw new Error("Sem slots possiveis com os horarios configurados.");

  const matches: MatchScheduleItem[] = [];
  classes.forEach((cls) => {
    if (!cls.data.gerado) return;
    matches.push(...collectClassScheduleMatches(cls));
  });

  const finais = interleaveByClassPerOrder(matches.filter((m) => m.isFinal));
  const semifinais = interleaveByClassPerOrder(matches.filter((m) => m.isSemifinal && !m.isFinal));
  const regulares = interleaveByClassPerOrder(matches.filter((m) => !m.isFinal && !m.isSemifinal));

  let slotsPool = [...slots];
  let finaisSlots: Slot[] = [];
  let semisSlots: Slot[] = [];

  if (cfg.travarFinalDia && finais.length) {
    finaisSlots = reserveDaySlots(slotsPool, cfg.diaFinal, finais.length, true, finais[0] ?? null, cfg);
    const used = new Set(finaisSlots.map(slotKey));
    slotsPool = slotsPool.filter((s) => !used.has(slotKey(s)));
  }

  if (cfg.travarSemifinalDia && semifinais.length) {
    const fromEnd = cfg.travarFinalDia && cfg.diaFinal === cfg.diaSemifinal;
    semisSlots = reserveDaySlots(slotsPool, cfg.diaSemifinal, semifinais.length, fromEnd, semifinais[0] ?? null, cfg);
    const used = new Set(semisSlots.map(slotKey));
    slotsPool = slotsPool.filter((s) => !used.has(slotKey(s)));
  }

  const filaNormal = [...regulares];
  if (!cfg.travarSemifinalDia) filaNormal.push(...semifinais);
  if (!cfg.travarFinalDia) filaNormal.push(...finais);

  const assignments: AgendaAssignment[] = [];
  assignments.push(...allocateMatchesByNextSlots(filaNormal, slotsPool, cfg));
  if (cfg.travarSemifinalDia) assignments.push(...allocateMatchesByNextSlots(semifinais, semisSlots, cfg));
  if (cfg.travarFinalDia) assignments.push(...allocateMatchesByNextSlots(finais, finaisSlots, cfg));

  assignments.sort((a, b) => {
    if (a.data !== b.data) return a.data.localeCompare(b.data);
    if (a.hora !== b.hora) return a.hora.localeCompare(b.hora);
    return String(a.quadra).localeCompare(String(b.quadra));
  });

  // Safety net: enforce day/court locks for semifinals/finals exactly as configured.
  if (cfg.travarSemifinalDia) {
    const invalidSemiDay = assignments.find((a) => a.isSemifinal && !a.isFinal && a.data !== cfg.diaSemifinal);
    if (invalidSemiDay) {
      throw new Error("Erro de agenda: semifinal fora do dia configurado.");
    }
  }
  if (cfg.travarFinalDia) {
    const invalidFinalDay = assignments.find((a) => a.isFinal && a.data !== cfg.diaFinal);
    if (invalidFinalDay) {
      throw new Error("Erro de agenda: final fora do dia configurado.");
    }
  }

  const allowedSemiCourts = new Set((cfg.quadrasSemifinal || []).map((q) => String(q).toLowerCase()));
  const allowedFinalCourts = new Set((cfg.quadrasFinal || []).map((q) => String(q).toLowerCase()));
  const invalidSemiCourt = assignments.find(
    (a) => a.isSemifinal && !a.isFinal && allowedSemiCourts.size > 0 && !allowedSemiCourts.has(String(a.quadra).toLowerCase())
  );
  if (invalidSemiCourt) {
    throw new Error("Erro de agenda: semifinal fora das quadras permitidas.");
  }
  const invalidFinalCourt = assignments.find(
    (a) => a.isFinal && allowedFinalCourts.size > 0 && !allowedFinalCourts.has(String(a.quadra).toLowerCase())
  );
  if (invalidFinalCourt) {
    throw new Error("Erro de agenda: final fora das quadras permitidas.");
  }

  const total = regulares.length + semifinais.length + finais.length;
  return {
    assignments,
    total,
    unassigned: Math.max(0, total - assignments.length),
    generatedAt: new Date().toISOString(),
  };
}

export type WizardSetupSummary = {
  nomeTorneio: string;
  totalClasses: number;
  totalParticipantes: number;
  classesComMinimo: number;
  agendaTemDias: boolean;
  agendaTemQuadras: boolean;
};

export function buildWizardSetupSummary(params: {
  tournamentName: string;
  classes: ScheduleClassInput[];
  agendaConfig: Partial<AgendaConfig> | null | undefined;
}): WizardSetupSummary {
  const cfg = normalizeAgendaConfig(params.agendaConfig);
  const totalClasses = params.classes.length;
  let totalParticipantes = 0;
  let classesComMinimo = 0;

  params.classes.forEach((cls) => {
    const n = cls.data.participantes.length;
    totalParticipantes += n;
    if (n >= 2) classesComMinimo += 1;
  });

  return {
    nomeTorneio: String(params.tournamentName || "").trim(),
    totalClasses,
    totalParticipantes,
    classesComMinimo,
    agendaTemDias: cfg.dias.length > 0,
    agendaTemQuadras: cfg.quadras.length > 0,
  };
}

export function getWizardValidationError(stepId: number, setup: WizardSetupSummary): string {
  if (stepId === 1) {
    if (!setup.nomeTorneio) return "Informe o nome do torneio para continuar.";
    return "";
  }
  if (stepId === 2) {
    if (setup.totalClasses <= 0) return "Crie pelo menos 1 categoria e 1 classe para continuar.";
    return "";
  }
  if (stepId === 3) {
    if (!setup.agendaTemDias || !setup.agendaTemQuadras) return "Cadastre ao menos 1 dia e 1 quadra para continuar.";
    return "";
  }
  if (stepId === 4) {
    if (setup.classesComMinimo <= 0) {
      return "Adicione participantes. Pelo menos 1 classe precisa ter 2 ou mais inscritos.";
    }
    return "";
  }
  return "";
}
