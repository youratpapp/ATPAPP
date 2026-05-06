import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { AppShell } from "../components/AppShell";
import { StatusBadge } from "../components/StatusBadge";
import { loadTournamentDetails, updateTournamentDetails } from "../lib/tournaments";
import type { Profile, TournamentDetails } from "../lib/types";
import { gerarClasseData, type ClassData, type GroupMatch, type KnockoutMatch } from "../tournament-engine/core";
import {
  buildWizardSetupSummary,
  generateScheduleAssignments,
  getWizardValidationError,
  normalizeAgenda,
  normalizeAgendaConfig,
  parseTimeToMin,
  type Agenda,
  type AgendaConfig,
  type AgendaAssignment,
  type ScheduleClassInput,
} from "../tournament-engine/agenda";
import {
  listLegacyClassesFromTournamentData,
  normalizeClassData,
  patchClassDataInTournamentData,
  recomputeClassData,
  type LegacyClassRef,
} from "../tournament-engine/state-adapter";

type Props = {
  user: User;
  profile: Profile | null;
};

type TabKey = "jogos" | "classificacao" | "organizacao";

type Feedback = { kind: "success" | "error" | "info"; text: string };
type DraftClass = {
  id: string;
  nome: string;
  data: ClassData;
};
type DraftCategory = {
  id: string;
  nome: string;
  classes: DraftClass[];
};

function asScore(value: string): number | null {
  const v = value.trim();
  if (!v) return null;
  const n = Number.parseInt(v, 10);
  if (Number.isNaN(n)) return null;
  if (n < 0 || n > 99) return null;
  return n;
}

function computeMatchStatus(s1: string, s2: string): { done: boolean; winner: "a" | "b" | null } {
  const a = asScore(s1);
  const b = asScore(s2);
  if (a === null || b === null) return { done: false, winner: null };
  if (a === b) return { done: false, winner: null };
  return { done: true, winner: a > b ? "a" : "b" };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function uid(prefix: string): string {
  const rnd = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now().toString(36)}-${rnd}`;
}

function parseDraftCategories(dataRaw: Record<string, unknown>): DraftCategory[] {
  const data = asRecord(dataRaw) ?? {};
  const categories = asArray(data.categorias);
  return categories.map((catRaw, catIndex) => {
    const cat = asRecord(catRaw) ?? {};
    const categoryId = asText(cat.id).trim() || `cat-${catIndex + 1}`;
    const categoryName = asText(cat.nome).trim() || "Categoria";
    const classes = asArray(cat.classes).map((clsRaw, clsIndex) => {
      const cls = asRecord(clsRaw) ?? {};
      const classId = asText(cls.id).trim() || `cls-${clsIndex + 1}`;
      const className = asText(cls.nome).trim() || "Classe";
      return {
        id: classId,
        nome: className,
        data: normalizeClassData(cls.data),
      };
    });
    return {
      id: categoryId,
      nome: categoryName,
      classes,
    };
  });
}

function buildTournamentDataWithDraftCategories(
  dataRaw: Record<string, unknown>,
  categories: DraftCategory[]
): Record<string, unknown> {
  const nextData = structuredClone(dataRaw ?? {});
  nextData.categorias = categories.map((cat) => ({
    id: cat.id,
    nome: cat.nome,
    classes: cat.classes.map((cls) => ({
      id: cls.id,
      nome: cls.nome,
      data: recomputeClassData(cls.data),
    })),
  })) as unknown as Record<string, unknown>;
  return nextData as Record<string, unknown>;
}

function resetClassDrawData(data: ClassData): ClassData {
  const d = normalizeClassData(data);
  d.entradas = [];
  d.grupos = [];
  d.knockout = null;
  d.tabelaPorGrupo = {};
  d.gerado = false;
  return d;
}

function downloadTextFile(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escXml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function downloadSvgAsPng(svg: string, width: number, height: number, filename: string): Promise<void> {
  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Falha ao carregar SVG para exportacao."));
      el.src = svgUrl;
    });

    const scale = 2;
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.floor(width * scale));
    canvas.height = Math.max(1, Math.floor(height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas indisponivel para exportacao.");
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    const pngBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error("Falha ao gerar PNG."));
      }, "image/png");
    });
    downloadBlob(pngBlob, filename);
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

function buildClassVisualSvg(categoryName: string, className: string, data: ClassData): {
  svg: string;
  width: number;
  height: number;
} {
  const pad = 24;
  const width = 1400;
  let y = 30;
  const out: string[] = [];
  out.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="200" viewBox="0 0 ${width} 200">`
  );
  out.push(`<rect x="0" y="0" width="${width}" height="200" fill="#ffffff"/>`);
  out.push(
    `<text x="${pad}" y="${y}" font-family="Arial, sans-serif" font-size="28" fill="#0f172a" font-weight="700">${escXml(
      `${categoryName} / ${className}`
    )}</text>`
  );
  y += 26;
  out.push(
    `<text x="${pad}" y="${y}" font-family="Arial, sans-serif" font-size="14" fill="#475569">Exportado em ${escXml(
      new Date().toLocaleString("pt-BR")
    )}</text>`
  );
  y += 24;

  const tableKeys = Object.keys(data.tabelaPorGrupo || {});
  if (tableKeys.length) {
    out.push(
      `<text x="${pad}" y="${y}" font-family="Arial, sans-serif" font-size="18" fill="#0f172a" font-weight="700">Classificacao dos Grupos</text>`
    );
    y += 20;
    tableKeys.forEach((group) => {
      const rows = data.tabelaPorGrupo[group] || [];
      out.push(
        `<text x="${pad}" y="${y}" font-family="Arial, sans-serif" font-size="15" fill="#111827" font-weight="700">${escXml(
          group
        )}</text>`
      );
      y += 18;
      rows.forEach((row, idx) => {
        out.push(
          `<text x="${pad + 8}" y="${y}" font-family="Arial, sans-serif" font-size="13" fill="#334155">${idx + 1}. ${escXml(
            row[0]
          )} | V:${row[1].v} J:${row[1].j} SG:${row[1].saldo}</text>`
        );
        y += 16;
      });
      if (!rows.length) {
        out.push(
          `<text x="${pad + 8}" y="${y}" font-family="Arial, sans-serif" font-size="13" fill="#64748b">Sem dados</text>`
        );
        y += 16;
      }
      y += 10;
    });
  }

  const rounds = data.knockout?.rounds || [];
  if (rounds.length) {
    y += 8;
    out.push(
      `<text x="${pad}" y="${y}" font-family="Arial, sans-serif" font-size="18" fill="#0f172a" font-weight="700">Chave Mata-mata</text>`
    );
    y += 12;
    const colWidth = 250;
    const boxH = 56;
    const startX = pad;
    rounds.forEach((round, ri) => {
      const x = startX + ri * colWidth;
      out.push(
        `<text x="${x}" y="${y + 14}" font-family="Arial, sans-serif" font-size="14" fill="#111827" font-weight="700">${escXml(
          round.name
        )}</text>`
      );
      round.matches.forEach((m, mi) => {
        const boxY = y + 22 + mi * (boxH + 18);
        out.push(`<rect x="${x}" y="${boxY}" width="220" height="${boxH}" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>`);
        out.push(
          `<text x="${x + 10}" y="${boxY + 20}" font-family="Arial, sans-serif" font-size="12" fill="#0f172a">${escXml(
            m.a || "A definir"
          )}</text>`
        );
        out.push(
          `<text x="${x + 10}" y="${boxY + 40}" font-family="Arial, sans-serif" font-size="12" fill="#0f172a">${escXml(
            m.b || "A definir"
          )}</text>`
        );
        const score = m.done ? `${m.s1} x ${m.s2}` : "- x -";
        out.push(
          `<text x="${x + 170}" y="${boxY + 31}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#334155">${escXml(
            score
          )}</text>`
        );
      });
    });
    const maxMatches = Math.max(...rounds.map((r) => r.matches.length), 0);
    y += 22 + maxMatches * (boxH + 18) + 16;
  }

  y += 12;
  const finalHeight = Math.max(220, y + 20);
  out[0] = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${finalHeight}" viewBox="0 0 ${width} ${finalHeight}">`;
  out[1] = `<rect x="0" y="0" width="${width}" height="${finalHeight}" fill="#ffffff"/>`;
  out.push("</svg>");
  return { svg: out.join(""), width, height: finalHeight };
}

export function TournamentPage({ user, profile }: Props) {
  const navigate = useNavigate();
  const { tournamentId = "" } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [tab, setTab] = useState<TabKey>("jogos");

  const [tournament, setTournament] = useState<TournamentDetails | null>(null);
  const [classes, setClasses] = useState<LegacyClassRef[]>([]);
  const [activeClassKey, setActiveClassKey] = useState("");
  const [agendaConfig, setAgendaConfig] = useState<AgendaConfig>(normalizeAgendaConfig(null));
  const [agenda, setAgenda] = useState<Agenda>(normalizeAgenda(null));
  const [agendaDirty, setAgendaDirty] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  const [newAgendaDate, setNewAgendaDate] = useState("");
  const [newAgendaStart, setNewAgendaStart] = useState("08:00");
  const [newAgendaEnd, setNewAgendaEnd] = useState("22:00");
  const [newCourtName, setNewCourtName] = useState("");
  const [draftCategories, setDraftCategories] = useState<DraftCategory[]>([]);
  const [draftDirty, setDraftDirty] = useState(false);
  const [activeDraftCategoryId, setActiveDraftCategoryId] = useState("");
  const [activeDraftClassId, setActiveDraftClassId] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newClassName, setNewClassName] = useState("");
  const [newParticipantName, setNewParticipantName] = useState("");

  const activeClass = useMemo(
    () => classes.find((c) => c.key === activeClassKey) ?? classes[0] ?? null,
    [classes, activeClassKey]
  );
  const activeDraftCategory = useMemo(
    () => draftCategories.find((c) => c.id === activeDraftCategoryId) ?? draftCategories[0] ?? null,
    [draftCategories, activeDraftCategoryId]
  );
  const activeDraftClass = useMemo(
    () => activeDraftCategory?.classes.find((c) => c.id === activeDraftClassId) ?? activeDraftCategory?.classes[0] ?? null,
    [activeDraftCategory, activeDraftClassId]
  );

  const scheduleInputs = useMemo<ScheduleClassInput[]>(
    () =>
      classes.map((c) => ({
        classKey: c.key,
        categoryName: c.categoryName,
        className: c.className,
        data: c.data,
      })),
    [classes]
  );
  const wizardSummary = useMemo(
    () =>
      buildWizardSetupSummary({
        tournamentName: tournament?.name ?? "",
        classes: scheduleInputs,
        agendaConfig,
      }),
    [agendaConfig, scheduleInputs, tournament?.name]
  );
  const wizardCurrentError = useMemo(
    () => getWizardValidationError(wizardStep, wizardSummary),
    [wizardStep, wizardSummary]
  );
  const agendaGroupedBySlot = useMemo(() => {
    const map = new Map<string, AgendaAssignment[]>();
    (agenda.assignments || []).forEach((a) => {
      const key = `${a.data}|${a.hora}|${a.horaFim}`;
      const row = map.get(key);
      if (row) row.push(a);
      else map.set(key, [a]);
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([, rows]) => rows.sort((x, y) => x.quadra.localeCompare(y.quadra)));
  }, [agenda]);

  useEffect(() => {
    let alive = true;

    async function run() {
      setLoading(true);
      try {
        const details = await loadTournamentDetails(user, tournamentId);
        if (!alive) return;
        setTournament(details);

        const cls = listLegacyClassesFromTournamentData(details.data);
        setClasses(cls);
        setActiveClassKey((prev) => prev || cls[0]?.key || "");
        const raw = (details.data ?? {}) as Record<string, unknown>;
        const draft = parseDraftCategories(raw);
        setDraftCategories(draft);
        setActiveDraftCategoryId((prev) => prev || draft[0]?.id || "");
        setActiveDraftClassId((prev) => prev || draft[0]?.classes[0]?.id || "");
        setDraftDirty(false);
        setAgendaConfig(normalizeAgendaConfig((raw.agendaConfig as Partial<AgendaConfig> | undefined) ?? null));
        setAgenda(normalizeAgenda((raw.agenda as Partial<Agenda> | undefined) ?? null));
        setAgendaDirty(false);
        setWizardStep(1);
        setFeedback(null);
      } catch (err) {
        if (!alive) return;
        setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao abrir torneio." });
      } finally {
        if (alive) setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [user, tournamentId]);

  const persistTournamentData = async (
    nextData: Record<string, unknown>,
    successText: string,
    nextActiveKey = activeClassKey
  ) => {
    if (!tournament) return;
    setSaving(true);
    try {
      const updated = await updateTournamentDetails(user, tournament.id, {
        name: tournament.name,
        city: tournament.city,
        state: tournament.state,
        visibility: tournament.visibility === "public" ? "public" : "private",
        status: tournament.status as "draft" | "registration_open" | "registration_closed" | "live" | "finished",
        startsAt: tournament.startsAt,
        registrationCloseAt: tournament.registrationCloseAt,
        posterUrl: tournament.posterUrl,
        data: nextData,
      });

      setTournament(updated);
      const cls = listLegacyClassesFromTournamentData(updated.data);
      setClasses(cls);
      setActiveClassKey(nextActiveKey || cls[0]?.key || "");
      const raw = (updated.data ?? {}) as Record<string, unknown>;
      const draft = parseDraftCategories(raw);
      setDraftCategories(draft);
      setActiveDraftCategoryId((prev) => {
        if (draft.some((c) => c.id === prev)) return prev;
        return draft[0]?.id || "";
      });
      setActiveDraftClassId((prev) => {
        const all = draft.flatMap((c) => c.classes);
        if (all.some((c) => c.id === prev)) return prev;
        return draft[0]?.classes[0]?.id || "";
      });
      setDraftDirty(false);
      setAgendaConfig(normalizeAgendaConfig((raw.agendaConfig as Partial<AgendaConfig> | undefined) ?? null));
      setAgenda(normalizeAgenda((raw.agenda as Partial<Agenda> | undefined) ?? null));
      setFeedback({ kind: "success", text: successText });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao salvar alteracoes." });
    } finally {
      setSaving(false);
    }
  };

  const persistClassData = async (ref: LegacyClassRef, nextClassData: ClassData) => {
    if (!tournament) return;
    const patchedData = patchClassDataInTournamentData(tournament.data, ref, nextClassData);
    await persistTournamentData(patchedData, "Atualizado com sucesso.", ref.key);
  };

  const setAgendaConfigWithReset = (next: AgendaConfig) => {
    setAgendaConfig(normalizeAgendaConfig(next));
    setAgenda(normalizeAgenda(null));
    setAgendaDirty(true);
  };

  const addAgendaDay = () => {
    if (!newAgendaDate) {
      setFeedback({ kind: "error", text: "Informe a data do dia de agenda." });
      return;
    }
    const start = parseTimeToMin(newAgendaStart);
    const end = parseTimeToMin(newAgendaEnd);
    if (start === null || end === null || end <= start) {
      setFeedback({ kind: "error", text: "Horario invalido para o dia de agenda." });
      return;
    }
    setAgendaConfigWithReset({
      ...agendaConfig,
      dias: [...agendaConfig.dias, { data: newAgendaDate, inicio: newAgendaStart, fim: newAgendaEnd }],
    });
    setFeedback(null);
  };

  const removeAgendaDay = (index: number) => {
    setAgendaConfigWithReset({
      ...agendaConfig,
      dias: agendaConfig.dias.filter((_, i) => i !== index),
    });
  };

  const addCourt = () => {
    const court = newCourtName.trim();
    if (!court) return;
    const has = agendaConfig.quadras.some((q) => q.toLowerCase() === court.toLowerCase());
    if (has) {
      setFeedback({ kind: "error", text: "Quadra ja cadastrada." });
      return;
    }
    setAgendaConfigWithReset({
      ...agendaConfig,
      quadras: [...agendaConfig.quadras, court],
      quadrasSemifinal: [...agendaConfig.quadrasSemifinal, court],
      quadrasFinal: [...agendaConfig.quadrasFinal, court],
    });
    setNewCourtName("");
    setFeedback(null);
  };

  const removeCourt = (index: number) => {
    const removed = agendaConfig.quadras[index] ?? "";
    setAgendaConfigWithReset({
      ...agendaConfig,
      quadras: agendaConfig.quadras.filter((_, i) => i !== index),
      quadrasSemifinal: agendaConfig.quadrasSemifinal.filter((q) => q.toLowerCase() !== removed.toLowerCase()),
      quadrasFinal: agendaConfig.quadrasFinal.filter((q) => q.toLowerCase() !== removed.toLowerCase()),
    });
  };

  const toggleStageCourt = (stage: "semi" | "final", court: string, checked: boolean) => {
    const current =
      stage === "semi" ? [...agendaConfig.quadrasSemifinal] : [...agendaConfig.quadrasFinal];
    const has = current.some((q) => q.toLowerCase() === court.toLowerCase());
    let next = current;
    if (checked && !has) next = [...current, court];
    if (!checked && has) next = current.filter((q) => q.toLowerCase() !== court.toLowerCase());
    setAgendaConfigWithReset({
      ...agendaConfig,
      quadrasSemifinal: stage === "semi" ? next : agendaConfig.quadrasSemifinal,
      quadrasFinal: stage === "final" ? next : agendaConfig.quadrasFinal,
    });
  };

  const selectAllStageCourts = (stage: "semi" | "final") => {
    setAgendaConfigWithReset({
      ...agendaConfig,
      quadrasSemifinal: stage === "semi" ? [...agendaConfig.quadras] : agendaConfig.quadrasSemifinal,
      quadrasFinal: stage === "final" ? [...agendaConfig.quadras] : agendaConfig.quadrasFinal,
    });
  };

  const generateAgenda = () => {
    try {
      const result = generateScheduleAssignments(scheduleInputs, agendaConfig);
      setAgenda(result);
      setAgendaDirty(true);
      if (result.unassigned > 0) {
        setFeedback({
          kind: "error",
          text: `Agenda incompleta: ${result.assignments.length}/${result.total} partidas alocadas.`,
        });
      } else {
        setFeedback({
          kind: "success",
          text: `Agenda criada: ${result.assignments.length}/${result.total} partidas alocadas.`,
        });
      }
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao gerar agenda." });
    }
  };

  const saveOrganization = async () => {
    if (!tournament) return;
    const nextData = structuredClone((tournament.data ?? {}) as Record<string, unknown>);
    nextData.agendaConfig = agendaConfig as unknown as Record<string, unknown>;
    nextData.agenda = agenda as unknown as Record<string, unknown>;
    await persistTournamentData(nextData, "Organizacao salva.", activeClass?.key ?? activeClassKey);
    setAgendaDirty(false);
  };

  const nextWizard = () => {
    const err = getWizardValidationError(wizardStep, wizardSummary);
    if (err) {
      setFeedback({ kind: "error", text: err });
      return;
    }
    setWizardStep((prev) => Math.min(5, prev + 1));
  };

  const prevWizard = () => {
    setWizardStep((prev) => Math.max(1, prev - 1));
  };

  const mutateDraftCategories = (fn: (prev: DraftCategory[]) => DraftCategory[]) => {
    setDraftCategories((prev) => {
      const next = fn(prev);
      setDraftDirty(true);
      return next;
    });
    setAgenda(normalizeAgenda(null));
    setAgendaDirty(true);
  };

  const addCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    if (draftCategories.some((c) => c.nome.trim().toLowerCase() === name.toLowerCase())) {
      setFeedback({ kind: "error", text: "Categoria ja existente." });
      return;
    }
    const catId = uid("cat");
    mutateDraftCategories((prev) => [...prev, { id: catId, nome: name, classes: [] }]);
    setActiveDraftCategoryId(catId);
    setActiveDraftClassId("");
    setNewCategoryName("");
    setFeedback(null);
  };

  const removeCategory = (categoryId: string) => {
    setDraftCategories((prev) => {
      const next = prev.filter((c) => c.id !== categoryId);
      if (activeDraftCategoryId === categoryId) {
        setActiveDraftCategoryId(next[0]?.id || "");
        setActiveDraftClassId(next[0]?.classes[0]?.id || "");
      }
      setDraftDirty(true);
      return next;
    });
    setAgenda(normalizeAgenda(null));
    setAgendaDirty(true);
  };

  const renameCategory = (categoryId: string, nextName: string) => {
    mutateDraftCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, nome: nextName } : c))
    );
  };

  const addClass = () => {
    const name = newClassName.trim();
    if (!name || !activeDraftCategory) return;
    if (activeDraftCategory.classes.some((c) => c.nome.trim().toLowerCase() === name.toLowerCase())) {
      setFeedback({ kind: "error", text: "Classe ja existente nesta categoria." });
      return;
    }
    const classId = uid("cls");
    const baseData = gerarClasseData({
      config: {
        tipo: "duplas",
        formato: "grupos",
        modoDuplas: "sorteio",
        sorteioDuplas: "grupos_ab",
        numGrupos: 2,
        classificadosPorGrupo: 2,
      },
      participantes: [],
      entradas: [],
    });
    mutateDraftCategories((prev) =>
      prev.map((cat) =>
        cat.id === activeDraftCategory.id
          ? {
              ...cat,
              classes: [...cat.classes, { id: classId, nome: name, data: normalizeClassData(baseData) }],
            }
          : cat
      )
    );
    setActiveDraftClassId(classId);
    setNewClassName("");
    setFeedback(null);
  };

  const removeClass = (categoryId: string, classId: string) => {
    setDraftCategories((prev) => {
      const next = prev.map((cat) =>
        cat.id === categoryId ? { ...cat, classes: cat.classes.filter((c) => c.id !== classId) } : cat
      );
      if (activeDraftClassId === classId) {
        const cat = next.find((c) => c.id === categoryId);
        setActiveDraftClassId(cat?.classes[0]?.id || "");
      }
      setDraftDirty(true);
      return next;
    });
    setAgenda(normalizeAgenda(null));
    setAgendaDirty(true);
  };

  const renameClass = (categoryId: string, classId: string, nextName: string) => {
    mutateDraftCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              classes: cat.classes.map((cls) => (cls.id === classId ? { ...cls, nome: nextName } : cls)),
            }
          : cat
      )
    );
  };

  const updateActiveClassConfig = (
    patch: Partial<ClassData["config"]>,
    options?: { resetGenerated?: boolean }
  ) => {
    if (!activeDraftCategory || !activeDraftClass) return;
    const resetGenerated = options?.resetGenerated ?? true;
    mutateDraftCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== activeDraftCategory.id) return cat;
        return {
          ...cat,
          classes: cat.classes.map((cls) => {
            if (cls.id !== activeDraftClass.id) return cls;
            const next = structuredClone(cls.data);
            next.config = { ...next.config, ...patch };
            if (resetGenerated) {
              next.grupos = [];
              next.knockout = null;
              next.tabelaPorGrupo = {};
              next.gerado = false;
            }
            return { ...cls, data: normalizeClassData(next) };
          }),
        };
      })
    );
  };

  const addParticipant = () => {
    const player = newParticipantName.trim();
    if (!player || !activeDraftCategory || !activeDraftClass) return;
    const names = activeDraftClass.data.participantes.map((p) => p.nome.toLowerCase());
    if (names.includes(player.toLowerCase())) {
      setFeedback({ kind: "error", text: "Participante ja cadastrado nesta classe." });
      return;
    }
    mutateDraftCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== activeDraftCategory.id) return cat;
        return {
          ...cat,
          classes: cat.classes.map((cls) => {
            if (cls.id !== activeDraftClass.id) return cls;
            const participantes = [...cls.data.participantes, { nome: player }];
            return {
              ...cls,
              data: normalizeClassData({
                config: cls.data.config,
                participantes,
                entradas: participantes.map((p) => p.nome),
                grupos: [],
                knockout: null,
                tabelaPorGrupo: {},
                gerado: false,
              }),
            };
          }),
        };
      })
    );
    setNewParticipantName("");
    setFeedback(null);
  };

  const removeParticipant = (player: string) => {
    if (!activeDraftCategory || !activeDraftClass) return;
    mutateDraftCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== activeDraftCategory.id) return cat;
        return {
          ...cat,
          classes: cat.classes.map((cls) => {
            if (cls.id !== activeDraftClass.id) return cls;
            const participantes = cls.data.participantes.filter((p) => p.nome !== player);
            return {
              ...cls,
              data: normalizeClassData({
                config: cls.data.config,
                participantes,
                entradas: participantes.map((p) => p.nome),
                grupos: [],
                knockout: null,
                tabelaPorGrupo: {},
                gerado: false,
              }),
            };
          }),
        };
      })
    );
  };

  const generateActiveClass = () => {
    if (!activeDraftCategory || !activeDraftClass) return;
    const participantes = activeDraftClass.data.participantes;
    if (participantes.length < 2) {
      setFeedback({ kind: "error", text: "Esta classe precisa de pelo menos 2 participantes para gerar." });
      return;
    }
    mutateDraftCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== activeDraftCategory.id) return cat;
        return {
          ...cat,
          classes: cat.classes.map((cls) => {
            if (cls.id !== activeDraftClass.id) return cls;
            return {
              ...cls,
              data: gerarClasseData({
                config: cls.data.config,
                participantes: cls.data.participantes,
                entradas: cls.data.participantes.map((p) => p.nome),
              }),
            };
          }),
        };
      })
    );
    setFeedback({ kind: "success", text: "Classe gerada no novo fluxo. Clique em salvar para persistir." });
  };

  const saveCategoriesAndClasses = async () => {
    if (!tournament) return;
    const nextData = buildTournamentDataWithDraftCategories(
      (tournament.data ?? {}) as Record<string, unknown>,
      draftCategories
    );
    nextData.agenda = normalizeAgenda(null) as unknown as Record<string, unknown>;
    await persistTournamentData(nextData, "Configuracao de categorias/classes salva.");
    setAgendaDirty(false);
  };

  const generateAllClasses = () => {
    if (!draftCategories.length) {
      setFeedback({ kind: "error", text: "Nao ha categorias/classes criadas." });
      return;
    }
    if (!window.confirm("Deseja gerar os campeonatos agora? Isso substitui chaves e partidas atuais.")) return;

    const errors: string[] = [];
    let total = 0;
    let generated = 0;
    let ignored = 0;

    const nextDraft = draftCategories.map((cat) => ({
      ...cat,
      classes: cat.classes.map((cls) => {
        total += 1;
        const count = cls.data.participantes.length;
        if (count < 2) {
          ignored += 1;
          return { ...cls, data: resetClassDrawData(cls.data) };
        }
        try {
          const data = gerarClasseData({
            config: cls.data.config,
            participantes: cls.data.participantes,
            entradas: cls.data.participantes.map((p) => p.nome),
          });
          generated += 1;
          return { ...cls, data: data };
        } catch (err) {
          const msg = err instanceof Error ? err.message : "erro desconhecido";
          errors.push(`${cat.nome} > ${cls.nome}: ${msg}`);
          return { ...cls, data: resetClassDrawData(cls.data) };
        }
      }),
    }));

    if (errors.length) {
      setFeedback({
        kind: "error",
        text: `Falha ao gerar todas as classes: ${errors.slice(0, 2).join(" | ")}${
          errors.length > 2 ? ` | +${errors.length - 2}` : ""
        }`,
      });
      return;
    }
    if (generated <= 0) {
      setFeedback({ kind: "error", text: "Nenhuma classe tem participantes suficientes para gerar partidas." });
      return;
    }

    const scheduleForGeneration: ScheduleClassInput[] = nextDraft.flatMap((cat) =>
      cat.classes.map((cls) => ({
        classKey: `${cat.id}:${cls.id}`,
        categoryName: cat.nome,
        className: cls.nome,
        data: cls.data,
      }))
    );

    let generatedAgenda: Agenda;
    try {
      generatedAgenda = normalizeAgenda(generateScheduleAssignments(scheduleForGeneration, agendaConfig));
    } catch (err) {
      setFeedback({
        kind: "error",
        text: err instanceof Error ? err.message : "Falha ao gerar agenda com as classes geradas.",
      });
      return;
    }

    if (generatedAgenda.unassigned > 0) {
      setFeedback({
        kind: "error",
        text: `Agenda insuficiente: ${generatedAgenda.assignments.length}/${generatedAgenda.total} partidas encaixadas.`,
      });
      return;
    }

    setDraftCategories(nextDraft);
    setDraftDirty(true);
    setAgenda(generatedAgenda);
    setAgendaDirty(true);
    setFeedback({
      kind: "success",
      text: `Geracao concluida: classes ${total}, geradas ${generated}, ignoradas ${ignored}. Salve para persistir.`,
    });
  };

  const resetOnlyDraw = () => {
    if (
      !window.confirm(
        "Resetar apenas sorteio/partidas? Isso vai limpar jogos, chaves e agenda, mantendo categorias e participantes."
      )
    ) {
      return;
    }
    const nextDraft = draftCategories.map((cat) => ({
      ...cat,
      classes: cat.classes.map((cls) => ({ ...cls, data: resetClassDrawData(cls.data) })),
    }));
    setDraftCategories(nextDraft);
    setDraftDirty(true);
    setAgenda(normalizeAgenda(null));
    setAgendaDirty(true);
    setFeedback({ kind: "success", text: "Sorteio/partidas resetados no fluxo novo. Salve para persistir." });
  };

  const resetAllTournament = () => {
    if (!window.confirm("Tem certeza que deseja resetar TODO o torneio?")) return;
    const confirmation = window.prompt('Digite RESETAR para confirmar:');
    if (confirmation !== "RESETAR") {
      setFeedback({ kind: "info", text: "Reset total cancelado." });
      return;
    }
    setDraftCategories([]);
    setActiveDraftCategoryId("");
    setActiveDraftClassId("");
    setDraftDirty(true);
    setAgendaConfig(normalizeAgendaConfig({ duracaoMin: 45, quadras: [], dias: [] }));
    setAgenda(normalizeAgenda(null));
    setAgendaDirty(true);
    setWizardStep(1);
    setFeedback({ kind: "success", text: "Reset total preparado. Clique em salvar para persistir." });
  };

  const saveAllChanges = async () => {
    if (!tournament) return;
    const baseData = (tournament.data ?? {}) as Record<string, unknown>;
    const withCategories = buildTournamentDataWithDraftCategories(baseData, draftCategories);
    withCategories.agendaConfig = agendaConfig as unknown as Record<string, unknown>;
    withCategories.agenda = agenda as unknown as Record<string, unknown>;
    await persistTournamentData(withCategories, "Alteracoes salvas com sucesso.");
    setDraftDirty(false);
    setAgendaDirty(false);
  };

  const exportAgendaByCourt = () => {
    if (!agenda.assignments.length) {
      setFeedback({ kind: "error", text: "A agenda ainda nao foi gerada." });
      return;
    }
    const sorted = [...agenda.assignments].sort((a, b) => {
      if (a.quadra !== b.quadra) return a.quadra.localeCompare(b.quadra);
      if (a.data !== b.data) return a.data.localeCompare(b.data);
      if (a.hora !== b.hora) return a.hora.localeCompare(b.hora);
      return a.classe.localeCompare(b.classe);
    });
    const byCourt = new Map<string, AgendaAssignment[]>();
    sorted.forEach((m) => {
      const list = byCourt.get(m.quadra);
      if (list) list.push(m);
      else byCourt.set(m.quadra, [m]);
    });

    const out: string[] = [];
    out.push("<!doctype html><html lang=\"pt-BR\"><head><meta charset=\"utf-8\">");
    out.push("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">");
    out.push(`<title>${tournament?.name || "Torneio"} - Lista por Quadra</title>`);
    out.push(
      "<style>body{font-family:Arial,sans-serif;color:#111;margin:20px}h1{font-size:22px}.meta{font-size:12px;color:#444}table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #bbb;padding:6px}th{background:#f2f2f2}.quadra{margin:20px 0;page-break-after:always}.quadra:last-child{page-break-after:auto}@page{size:A4 portrait;margin:10mm}</style>"
    );
    out.push("</head><body>");
    out.push(`<h1>${tournament?.name || "Torneio"} - Lista de Jogos por Quadra</h1>`);
    out.push(
      `<div class="meta">Partidas alocadas: ${agenda.assignments.length}/${agenda.total}${
        agenda.unassigned > 0 ? ` | Sem encaixe: ${agenda.unassigned}` : ""
      }</div>`
    );
    Array.from(byCourt.entries()).forEach(([court, rows]) => {
      out.push(`<section class="quadra"><h2>${court}</h2>`);
      out.push(
        "<table><thead><tr><th>#</th><th>Data</th><th>Horario</th><th>Categoria</th><th>Classe</th><th>Fase</th><th>Jogo</th><th>Placar</th></tr></thead><tbody>"
      );
      rows.forEach((r, idx) => {
        const phase = `${r.round}${r.isFinal ? " (FINAL)" : r.isSemifinal ? " (SEMIFINAL)" : ""}`;
        out.push(
          `<tr><td>${idx + 1}</td><td>${r.data}</td><td>${r.hora}-${r.horaFim}</td><td>${r.categoria}</td><td>${r.classe}</td><td>${phase}</td><td>${r.p1} x ${r.p2}</td><td>____ x ____</td></tr>`
        );
      });
      out.push("</tbody></table></section>");
    });
    out.push("</body></html>");

    const safeName = String(tournament?.name || "torneio")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    downloadTextFile(out.join(""), `${safeName || "torneio"}-lista-quadras.html`, "text/html;charset=utf-8");
    setFeedback({ kind: "success", text: "Lista por quadra exportada." });
  };

  const exportBackupJson = () => {
    if (!tournament) return;
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      tournamentId: tournament.id,
      name: tournament.name,
      data: buildTournamentDataWithDraftCategories(
        {
          ...((tournament.data ?? {}) as Record<string, unknown>),
          agendaConfig: agendaConfig as unknown as Record<string, unknown>,
          agenda: agenda as unknown as Record<string, unknown>,
        },
        draftCategories
      ),
    };
    const safeName = String(tournament.name || "torneio")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    downloadTextFile(
      JSON.stringify(data, null, 2),
      `${safeName || "torneio"}-backup.json`,
      "application/json;charset=utf-8"
    );
    setFeedback({ kind: "success", text: "Backup exportado." });
  };

  const exportActiveClassPng = async () => {
    if (!activeClass) {
      setFeedback({ kind: "error", text: "Selecione uma classe ativa para exportar." });
      return;
    }
    try {
      const visual = buildClassVisualSvg(activeClass.categoryName, activeClass.className, activeClass.data);
      const safeName = `${activeClass.categoryName}-${activeClass.className}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      await downloadSvgAsPng(visual.svg, visual.width, visual.height, `${safeName || "classe"}-chave.png`);
      setFeedback({ kind: "success", text: "Chave da classe exportada em PNG." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao exportar PNG." });
    }
  };

  const exportActiveKnockoutPng = async () => {
    if (!activeClass || !activeClass.data.knockout?.rounds.length) {
      setFeedback({ kind: "error", text: "A classe ativa ainda nao possui chave mata-mata para exportar." });
      return;
    }
    try {
      const visual = buildClassVisualSvg(activeClass.categoryName, activeClass.className, {
        ...activeClass.data,
        grupos: [],
        tabelaPorGrupo: {},
      });
      const safeName = `${activeClass.categoryName}-${activeClass.className}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      await downloadSvgAsPng(
        visual.svg,
        visual.width,
        visual.height,
        `${safeName || "classe"}-mata-mata.png`
      );
      setFeedback({ kind: "success", text: "Chave mata-mata exportada em PNG." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao exportar PNG da chave." });
    }
  };

  const sendWhatsAppSummary = () => {
    if (!tournament) return;
    const lines: string[] = [];
    lines.push(`*${String(tournament.name || "TORNEIO").toUpperCase()}*`);
    lines.push("");
    lines.push(`Status: ${tournament.status}`);
    lines.push(`Local: ${[tournament.city, tournament.state].filter(Boolean).join(" - ") || "A definir"}`);
    lines.push(`Categorias: ${draftCategories.length}`);
    const totalClasses = draftCategories.reduce((acc, cat) => acc + cat.classes.length, 0);
    const totalPlayers = draftCategories.reduce(
      (acc, cat) => acc + cat.classes.reduce((sum, cls) => sum + cls.data.participantes.length, 0),
      0
    );
    lines.push(`Classes: ${totalClasses}`);
    lines.push(`Participantes: ${totalPlayers}`);

    if (agenda.assignments.length) {
      lines.push("");
      lines.push(`*AGENDA*`);
      lines.push(
        `Partidas alocadas: ${agenda.assignments.length}/${agenda.total}${
          agenda.unassigned > 0 ? ` | Sem encaixe: ${agenda.unassigned}` : ""
        }`
      );
      agenda.assignments.slice(0, 20).forEach((a, idx) => {
        const tag = a.isFinal ? " [FINAL]" : a.isSemifinal ? " [SEMIFINAL]" : "";
        lines.push(
          `${idx + 1}) ${a.data} ${a.hora}-${a.horaFim} | ${a.quadra} | ${a.categoria}/${a.classe} | ${a.round}${tag}`
        );
        lines.push(`   ${a.p1} x ${a.p2}`);
      });
      if (agenda.assignments.length > 20) {
        lines.push(`... +${agenda.assignments.length - 20} partidas`);
      }
    }

    lines.push("");
    lines.push("*CLASSES*");
    draftCategories.forEach((cat) => {
      cat.classes.forEach((cls) => {
        const done = cls.data.gerado ? "gerada" : "nao gerada";
        lines.push(`- ${cat.nome} / ${cls.nome}: ${cls.data.participantes.length} inscritos (${done})`);
      });
    });

    const text = lines.join("\n");
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setFeedback({ kind: "success", text: "Resumo aberto no WhatsApp." });
  };

  const restoreBackupJson = async (file: File | null) => {
    if (!file || !tournament) return;
    try {
      const text = await file.text();
      const raw = JSON.parse(text) as Record<string, unknown>;
      const payload = asRecord(raw.data);
      if (!payload) {
        setFeedback({ kind: "error", text: "Arquivo de backup invalido." });
        return;
      }
      const restoredDraft = parseDraftCategories(payload);
      setDraftCategories(restoredDraft);
      setActiveDraftCategoryId(restoredDraft[0]?.id || "");
      setActiveDraftClassId(restoredDraft[0]?.classes[0]?.id || "");
      setAgendaConfig(normalizeAgendaConfig((payload.agendaConfig as Partial<AgendaConfig> | undefined) ?? null));
      setAgenda(normalizeAgenda((payload.agenda as Partial<Agenda> | undefined) ?? null));
      setDraftDirty(true);
      setAgendaDirty(true);
      setFeedback({ kind: "success", text: "Backup carregado no editor. Clique em salvar para persistir." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao restaurar backup." });
    }
  };

  const onUpdateGroupScore = async (
    ref: LegacyClassRef,
    groupIndex: number,
    matchIndex: number,
    s1: string,
    s2: string
  ) => {
    const next = structuredClone(ref.data);
    const group = next.grupos[groupIndex];
    const match = group?.matches[matchIndex] as GroupMatch | undefined;
    if (!group || !match) return;

    match.s1 = s1;
    match.s2 = s2;
    const status = computeMatchStatus(s1, s2);
    match.done = status.done;
    match.winner = status.winner === "a" ? match.a : status.winner === "b" ? match.b : null;

    const recomputed = recomputeClassData(next);
    await persistClassData(ref, recomputed);
  };

  const onUpdateKoScore = async (
    ref: LegacyClassRef,
    roundIndex: number,
    matchIndex: number,
    s1: string,
    s2: string
  ) => {
    const next = structuredClone(ref.data);
    const round = next.knockout?.rounds[roundIndex];
    const match = round?.matches[matchIndex] as KnockoutMatch | undefined;
    if (!round || !match) return;

    match.s1 = s1;
    match.s2 = s2;
    const status = computeMatchStatus(s1, s2);
    match.done = status.done;
    match.winner = status.winner === "a" ? match.a : status.winner === "b" ? match.b : null;

    const recomputed = recomputeClassData(next);
    await persistClassData(ref, recomputed);
  };

  return (
    <AppShell user={user} profile={profile} showHeader={false}>
      <div className="page-header" style={{ marginBottom: 12 }}>
        <h1>Torneio</h1>
        <div className="ph-actions">
          <button onClick={() => navigate("/eventos")}>Voltar</button>
        </div>
      </div>

      {feedback ? (
        <p className={`feedback ${feedback.kind === "success" ? "success" : feedback.kind === "error" ? "error" : ""}`}>
          {feedback.text}
        </p>
      ) : null}

      {loading ? <p className="subtle">Carregando...</p> : null}

      {!loading && tournament ? (
        <>
          <article className="card" style={{ marginBottom: 12 }}>
            <div className="section-title" style={{ marginBottom: 8 }}>
              <h2>{tournament.name}</h2>
              <StatusBadge status={tournament.status} />
            </div>
            <p className="subtle" style={{ margin: 0 }}>
              {[tournament.city, tournament.state].filter(Boolean).join(" - ") || "Local a definir"}
            </p>
          </article>

          <div className="tabs" style={{ marginBottom: 12 }}>
            <button className={tab === "jogos" ? "active" : ""} onClick={() => setTab("jogos")}>
              Jogos
            </button>
            <button className={tab === "classificacao" ? "active" : ""} onClick={() => setTab("classificacao")}>
              Classificacao
            </button>
            <button className={tab === "organizacao" ? "active" : ""} onClick={() => setTab("organizacao")}>
              Organizacao
            </button>
          </div>

          <section className="card" style={{ marginBottom: 12 }}>
            <label>Classe ativa</label>
            <select
              value={activeClass?.key ?? ""}
              onChange={(e) => setActiveClassKey(e.target.value)}
              disabled={classes.length === 0}
            >
              {classes.length === 0 ? <option value="">Sem classes cadastradas</option> : null}
              {classes.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.categoryName} / {c.className}
                </option>
              ))}
            </select>
            <p className="subtle" style={{ marginBottom: 0 }}>
              Esta tela usa engine TypeScript (mesmas regras de grupos, mata-mata e classificacao), sem simplificar comportamento.
            </p>
          </section>

          {tab === "jogos" ? (
            <section className="card">
              {!activeClass ? <p className="subtle">Sem classe ativa.</p> : null}

              {activeClass?.data.grupos.map((g, gi) => (
                <div key={`${activeClass.key}:g:${g.name}`} style={{ marginBottom: 14 }}>
                  <h3 style={{ marginBottom: 8 }}>{g.name}</h3>
                  {g.matches.length === 0 ? <p className="subtle">Sem partidas no grupo.</p> : null}
                  {g.matches.map((m, mi) => (
                    <div key={`${activeClass.key}:g:${gi}:${mi}`} style={{ borderTop: "1px solid var(--color-border)", padding: "8px 0" }}>
                      <div style={{ fontSize: 14, marginBottom: 6 }}>
                        {m.a || "A definir"} x {m.b || "A definir"}
                      </div>
                      <div className="cluster">
                        <input
                          style={{ width: 80 }}
                          value={m.s1}
                          onChange={(e) => {
                            const s1 = e.target.value.replace(/[^0-9]/g, "");
                            onUpdateGroupScore(activeClass, gi, mi, s1, m.s2);
                          }}
                          disabled={saving}
                        />
                        <input
                          style={{ width: 80 }}
                          value={m.s2}
                          onChange={(e) => {
                            const s2 = e.target.value.replace(/[^0-9]/g, "");
                            onUpdateGroupScore(activeClass, gi, mi, m.s1, s2);
                          }}
                          disabled={saving}
                        />
                        <span className="subtle">{m.done ? "Finalizado" : "Pendente"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {activeClass?.data.knockout?.rounds.map((round, ri) => (
                <div key={`${activeClass.key}:ko:${ri}`} style={{ marginBottom: 14 }}>
                  <h3 style={{ marginBottom: 8 }}>{round.name}</h3>
                  {round.matches.length === 0 ? <p className="subtle">Sem partidas nesta fase.</p> : null}
                  {round.matches.map((m, mi) => (
                    <div key={`${activeClass.key}:ko:${ri}:${mi}`} style={{ borderTop: "1px solid var(--color-border)", padding: "8px 0" }}>
                      <div style={{ fontSize: 14, marginBottom: 6 }}>
                        {m.a || "A definir"} x {m.b || "A definir"}
                      </div>
                      <div className="cluster">
                        <input
                          style={{ width: 80 }}
                          value={m.s1}
                          onChange={(e) => {
                            const s1 = e.target.value.replace(/[^0-9]/g, "");
                            onUpdateKoScore(activeClass, ri, mi, s1, m.s2);
                          }}
                          disabled={saving || !m.a || !m.b}
                        />
                        <input
                          style={{ width: 80 }}
                          value={m.s2}
                          onChange={(e) => {
                            const s2 = e.target.value.replace(/[^0-9]/g, "");
                            onUpdateKoScore(activeClass, ri, mi, m.s1, s2);
                          }}
                          disabled={saving || !m.a || !m.b}
                        />
                        <span className="subtle">{m.done ? "Finalizado" : "Pendente"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {!activeClass?.data.grupos.length && !activeClass?.data.knockout ? (
                <p className="subtle">Ainda sem jogos gerados nesta classe.</p>
              ) : null}
            </section>
          ) : null}

          {tab === "classificacao" ? (
            <section className="card">
              {!activeClass ? <p className="subtle">Sem classe ativa.</p> : null}
              {activeClass
                ? Object.keys(activeClass.data.tabelaPorGrupo).map((groupName) => {
                    const rows = activeClass.data.tabelaPorGrupo[groupName] ?? [];
                    return (
                      <div key={`${activeClass.key}:table:${groupName}`} style={{ marginBottom: 14 }}>
                        <h3 style={{ marginBottom: 8 }}>{groupName}</h3>
                        {rows.length === 0 ? <p className="subtle">Sem dados de classificacao.</p> : null}
                        {rows.map((row, idx) => (
                          <div key={`${activeClass.key}:table:${groupName}:${idx}`} style={{ borderTop: "1px solid var(--color-border)", padding: "8px 0", display: "flex", justifyContent: "space-between", gap: 8 }}>
                            <span>{idx + 1}. {row[0]}</span>
                            <span className="subtle">V:{row[1].v} J:{row[1].j} SG:{row[1].saldo}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })
                : null}
              {activeClass && Object.keys(activeClass.data.tabelaPorGrupo).length === 0 ? (
                <p className="subtle">Sem tabela para esta classe.</p>
              ) : null}
            </section>
          ) : null}

          {tab === "organizacao" ? (
            <section className="card">
              <h3 style={{ marginTop: 0 }}>Categorias, classes e inscritos</h3>
              <div className="cluster" style={{ marginBottom: 10 }}>
                <input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nova categoria (ex.: Masculino)"
                />
                <button onClick={addCategory} disabled={saving}>
                  Adicionar categoria
                </button>
              </div>

              {draftCategories.length === 0 ? <p className="subtle">Nenhuma categoria cadastrada.</p> : null}
              {draftCategories.map((cat) => {
                const isActive = cat.id === activeDraftCategory?.id;
                return (
                  <div
                    key={`cat:${cat.id}`}
                    style={{
                      border: "1px solid var(--color-border)",
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 10,
                    }}
                  >
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                      <input
                        value={cat.nome}
                        onChange={(e) => renameCategory(cat.id, e.target.value)}
                        disabled={saving}
                      />
                      <button onClick={() => setActiveDraftCategoryId(cat.id)} disabled={saving}>
                        {isActive ? "Categoria ativa" : "Ativar"}
                      </button>
                      <button className="danger" onClick={() => removeCategory(cat.id)} disabled={saving}>
                        Remover categoria
                      </button>
                    </div>

                    {isActive ? (
                      <>
                        <div className="cluster" style={{ marginBottom: 8 }}>
                          <input
                            value={newClassName}
                            onChange={(e) => setNewClassName(e.target.value)}
                            placeholder="Nova classe (ex.: A)"
                          />
                          <button onClick={addClass} disabled={saving}>
                            Adicionar classe
                          </button>
                        </div>

                        {cat.classes.length === 0 ? <p className="subtle">Nenhuma classe nesta categoria.</p> : null}
                        {cat.classes.map((cls) => {
                          const clsActive = cls.id === activeDraftClass?.id;
                          return (
                            <div
                              key={`cls:${cat.id}:${cls.id}`}
                              style={{
                                borderTop: "1px solid var(--color-border)",
                                paddingTop: 8,
                                marginTop: 8,
                              }}
                            >
                              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                                <input
                                  value={cls.nome}
                                  onChange={(e) => renameClass(cat.id, cls.id, e.target.value)}
                                  disabled={saving}
                                />
                                <button
                                  onClick={() => {
                                    setActiveDraftCategoryId(cat.id);
                                    setActiveDraftClassId(cls.id);
                                  }}
                                  disabled={saving}
                                >
                                  {clsActive ? "Classe ativa" : "Editar classe"}
                                </button>
                                <button
                                  className="danger"
                                  onClick={() => removeClass(cat.id, cls.id)}
                                  disabled={saving}
                                >
                                  Remover
                                </button>
                              </div>
                              <p className="subtle" style={{ margin: 0 }}>
                                Participantes: {cls.data.participantes.length} | Gerado: {cls.data.gerado ? "sim" : "nao"}
                              </p>
                            </div>
                          );
                        })}
                      </>
                    ) : null}
                  </div>
                );
              })}

              {activeDraftCategory && activeDraftClass ? (
                <div
                  style={{
                    border: "1px solid var(--color-border)",
                    borderRadius: 10,
                    padding: 10,
                    marginBottom: 12,
                  }}
                >
                  <h3 style={{ marginTop: 0, marginBottom: 8 }}>
                    Configuracao da classe: {activeDraftCategory.nome} / {activeDraftClass.nome}
                  </h3>
                  <label>Formato</label>
                  <select
                    value={activeDraftClass.data.config.formato}
                    onChange={(e) =>
                      updateActiveClassConfig({
                        formato: e.target.value === "mata_mata" ? "mata_mata" : "grupos",
                      })
                    }
                  >
                    <option value="grupos">Grupos</option>
                    <option value="mata_mata">Mata-mata</option>
                  </select>

                  <label>Tipo</label>
                  <select
                    value={activeDraftClass.data.config.tipo}
                    onChange={(e) =>
                      updateActiveClassConfig({
                        tipo: e.target.value === "simples" ? "simples" : "duplas",
                      })
                    }
                  >
                    <option value="duplas">Duplas</option>
                    <option value="simples">Simples</option>
                  </select>

                  <div className="cluster">
                    <div style={{ flex: 1 }}>
                      <label>Numero de grupos</label>
                      <input
                        type="number"
                        min={2}
                        max={16}
                        value={activeDraftClass.data.config.numGrupos}
                        onChange={(e) =>
                          updateActiveClassConfig({
                            numGrupos: Number.parseInt(e.target.value || "2", 10) || 2,
                          })
                        }
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label>Classificados por grupo</label>
                      <input
                        type="number"
                        min={1}
                        max={16}
                        value={activeDraftClass.data.config.classificadosPorGrupo}
                        onChange={(e) =>
                          updateActiveClassConfig({
                            classificadosPorGrupo: Number.parseInt(e.target.value || "2", 10) || 2,
                          })
                        }
                      />
                    </div>
                  </div>

                  <label>Modo de duplas</label>
                  <select
                    value={activeDraftClass.data.config.modoDuplas}
                    onChange={(e) =>
                      updateActiveClassConfig({
                        modoDuplas: e.target.value === "manual" ? "manual" : "sorteio",
                      })
                    }
                  >
                    <option value="sorteio">Sorteio</option>
                    <option value="manual">Manual</option>
                  </select>

                  <label>Sorteio de duplas</label>
                  <select
                    value={activeDraftClass.data.config.sorteioDuplas}
                    onChange={(e) =>
                      updateActiveClassConfig({
                        sorteioDuplas: e.target.value === "todos" ? "todos" : "grupos_ab",
                      })
                    }
                  >
                    <option value="grupos_ab">Grupos A/B</option>
                    <option value="todos">Todos</option>
                  </select>

                  <div className="cluster" style={{ marginTop: 10 }}>
                    <input
                      value={newParticipantName}
                      onChange={(e) => setNewParticipantName(e.target.value)}
                      placeholder="Adicionar participante"
                    />
                    <button onClick={addParticipant} disabled={saving}>
                      Adicionar
                    </button>
                  </div>
                  {activeDraftClass.data.participantes.length === 0 ? (
                    <p className="subtle">Nenhum participante nesta classe.</p>
                  ) : null}
                  {activeDraftClass.data.participantes.map((p, idx) => (
                    <div
                      key={`p:${activeDraftClass.id}:${idx}:${p.nome}`}
                      style={{
                        borderTop: "1px solid var(--color-border)",
                        padding: "8px 0",
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 8,
                      }}
                    >
                      <span>{p.nome}</span>
                      <button className="danger" onClick={() => removeParticipant(p.nome)} disabled={saving}>
                        Remover
                      </button>
                    </div>
                  ))}

                  <div className="cluster" style={{ marginTop: 12 }}>
                    <button className="primary" onClick={generateActiveClass} disabled={saving}>
                      Gerar classe
                    </button>
                    <button onClick={saveCategoriesAndClasses} disabled={saving}>
                      Salvar categorias/classes
                    </button>
                  </div>
                  {draftDirty ? (
                    <p className="subtle" style={{ marginTop: 8 }}>
                      Alteracoes em categorias/classes pendentes de salvamento.
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div
                style={{
                  border: "1px solid var(--color-border)",
                  borderRadius: 10,
                  padding: 10,
                  marginBottom: 12,
                }}
              >
                <h3 style={{ marginTop: 0, marginBottom: 8 }}>Operacoes e exportacoes</h3>
                <div className="cluster" style={{ marginBottom: 8 }}>
                  <button className="primary" onClick={generateAllClasses} disabled={saving}>
                    Gerar campeonatos
                  </button>
                  <button onClick={saveAllChanges} disabled={saving}>
                    Salvar tudo
                  </button>
                  <button onClick={resetOnlyDraw} disabled={saving}>
                    Resetar sorteio/partidas
                  </button>
                  <button className="danger" onClick={resetAllTournament} disabled={saving}>
                    Reset total
                  </button>
                </div>
                <div className="cluster">
                  <button onClick={exportAgendaByCourt} disabled={saving}>
                    Exportar lista de quadras
                  </button>
                  <button onClick={() => void exportActiveClassPng()} disabled={saving}>
                    Exportar chave PNG
                  </button>
                  <button onClick={() => void exportActiveKnockoutPng()} disabled={saving}>
                    Exportar mata-mata PNG
                  </button>
                  <button onClick={exportBackupJson} disabled={saving}>
                    Backup
                  </button>
                  <button onClick={sendWhatsAppSummary} disabled={saving}>
                    Enviar no WhatsApp
                  </button>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <span className="subtle">Restore:</span>
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={(e) => {
                        const f = e.currentTarget.files?.[0] ?? null;
                        void restoreBackupJson(f);
                        e.currentTarget.value = "";
                      }}
                    />
                  </label>
                </div>
                <p className="subtle" style={{ marginTop: 8, marginBottom: 0 }}>
                  Use "Salvar tudo" para persistir categorias, jogos e agenda no Supabase.
                </p>
              </div>

              <h3 style={{ marginTop: 0 }}>Wizard de setup</h3>
              <p className="subtle">Passo {wizardStep} de 5</p>
              <p className="subtle" style={{ marginBottom: 4 }}>
                Resumo: {wizardSummary.totalClasses} classe(s), {wizardSummary.totalParticipantes} participante(s),{" "}
                {wizardSummary.classesComMinimo} classe(s) pronta(s).
              </p>
              {wizardCurrentError ? <p className="feedback error">{wizardCurrentError}</p> : null}
              <div className="cluster" style={{ marginBottom: 12 }}>
                <button onClick={prevWizard} disabled={wizardStep <= 1}>
                  Anterior
                </button>
                <button className="primary" onClick={nextWizard} disabled={wizardStep >= 5}>
                  Proxima etapa
                </button>
                <button onClick={() => setWizardStep(1)}>Reiniciar wizard</button>
              </div>

              <h3>Agenda</h3>
              <label>Duracao da partida (min)</label>
              <input
                type="number"
                min={10}
                max={240}
                value={agendaConfig.duracaoMin}
                onChange={(e) =>
                  setAgendaConfigWithReset({
                    ...agendaConfig,
                    duracaoMin: Number.parseInt(e.target.value || "45", 10) || 45,
                  })
                }
                disabled={saving}
              />

              <div style={{ marginTop: 10 }}>
                <label>Adicionar dia</label>
                <div className="cluster">
                  <input type="date" value={newAgendaDate} onChange={(e) => setNewAgendaDate(e.target.value)} />
                  <input type="time" value={newAgendaStart} onChange={(e) => setNewAgendaStart(e.target.value)} />
                  <input type="time" value={newAgendaEnd} onChange={(e) => setNewAgendaEnd(e.target.value)} />
                  <button onClick={addAgendaDay} disabled={saving}>
                    Adicionar dia
                  </button>
                </div>
                {agendaConfig.dias.length === 0 ? <p className="subtle">Nenhum dia cadastrado.</p> : null}
                {agendaConfig.dias.map((d, idx) => (
                  <div
                    key={`dia:${d.data}:${d.inicio}:${d.fim}:${idx}`}
                    style={{
                      borderTop: "1px solid var(--color-border)",
                      padding: "8px 0",
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 8,
                    }}
                  >
                    <span>
                      {d.data} | {d.inicio} - {d.fim}
                    </span>
                    <button className="danger" onClick={() => removeAgendaDay(idx)} disabled={saving}>
                      Remover
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 10 }}>
                <label>Quadras</label>
                <div className="cluster">
                  <input
                    value={newCourtName}
                    onChange={(e) => setNewCourtName(e.target.value)}
                    placeholder="Ex.: Quadra 1"
                  />
                  <button onClick={addCourt} disabled={saving}>
                    Adicionar quadra
                  </button>
                </div>
                {agendaConfig.quadras.length === 0 ? <p className="subtle">Nenhuma quadra cadastrada.</p> : null}
                {agendaConfig.quadras.map((q, idx) => (
                  <div
                    key={`q:${q}:${idx}`}
                    style={{
                      borderTop: "1px solid var(--color-border)",
                      padding: "8px 0",
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 8,
                    }}
                  >
                    <span>{q}</span>
                    <button className="danger" onClick={() => removeCourt(idx)} disabled={saving}>
                      Remover
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 10 }}>
                <label>Restringir semifinais por dia</label>
                <select
                  value={agendaConfig.travarSemifinalDia ? "sim" : "nao"}
                  onChange={(e) =>
                    setAgendaConfigWithReset({
                      ...agendaConfig,
                      travarSemifinalDia: e.target.value === "sim",
                    })
                  }
                >
                  <option value="nao">Nao</option>
                  <option value="sim">Sim</option>
                </select>
                {agendaConfig.travarSemifinalDia ? (
                  <>
                    <label>Dia das semifinais</label>
                    <input
                      type="date"
                      value={agendaConfig.diaSemifinal}
                      onChange={(e) =>
                        setAgendaConfigWithReset({
                          ...agendaConfig,
                          diaSemifinal: e.target.value,
                        })
                      }
                    />
                  </>
                ) : null}
              </div>

              <div style={{ marginTop: 10 }}>
                <label>Restringir finais por dia</label>
                <select
                  value={agendaConfig.travarFinalDia ? "sim" : "nao"}
                  onChange={(e) =>
                    setAgendaConfigWithReset({
                      ...agendaConfig,
                      travarFinalDia: e.target.value === "sim",
                    })
                  }
                >
                  <option value="nao">Nao</option>
                  <option value="sim">Sim</option>
                </select>
                {agendaConfig.travarFinalDia ? (
                  <>
                    <label>Dia das finais</label>
                    <input
                      type="date"
                      value={agendaConfig.diaFinal}
                      onChange={(e) =>
                        setAgendaConfigWithReset({
                          ...agendaConfig,
                          diaFinal: e.target.value,
                        })
                      }
                    />
                  </>
                ) : null}
              </div>

              <div style={{ marginTop: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                  <label style={{ margin: 0 }}>Quadras permitidas para semifinal</label>
                  <button onClick={() => selectAllStageCourts("semi")} disabled={saving || !agendaConfig.quadras.length}>
                    Todas
                  </button>
                </div>
                {agendaConfig.quadras.map((q) => {
                  const checked = agendaConfig.quadrasSemifinal.some((x) => x.toLowerCase() === q.toLowerCase());
                  return (
                    <label key={`semi:${q}`} style={{ display: "block", marginTop: 4 }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => toggleStageCourt("semi", q, e.target.checked)}
                      />{" "}
                      {q}
                    </label>
                  );
                })}
              </div>

              <div style={{ marginTop: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                  <label style={{ margin: 0 }}>Quadras permitidas para final</label>
                  <button onClick={() => selectAllStageCourts("final")} disabled={saving || !agendaConfig.quadras.length}>
                    Todas
                  </button>
                </div>
                {agendaConfig.quadras.map((q) => {
                  const checked = agendaConfig.quadrasFinal.some((x) => x.toLowerCase() === q.toLowerCase());
                  return (
                    <label key={`final:${q}`} style={{ display: "block", marginTop: 4 }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => toggleStageCourt("final", q, e.target.checked)}
                      />{" "}
                      {q}
                    </label>
                  );
                })}
              </div>

              <div className="cluster" style={{ marginTop: 14 }}>
                <button className="primary" onClick={generateAgenda} disabled={saving}>
                  Gerar agenda
                </button>
                <button onClick={saveOrganization} disabled={saving}>
                  Salvar organizacao
                </button>
              </div>

              {agenda.total > 0 ? (
                <p className="subtle" style={{ marginTop: 12 }}>
                  Agenda: {agenda.assignments.length}/{agenda.total} partidas alocadas
                  {agenda.unassigned > 0 ? ` | sem encaixe: ${agenda.unassigned}` : ""}.
                </p>
              ) : (
                <p className="subtle" style={{ marginTop: 12 }}>
                  Defina dias, horarios e quadras para gerar a agenda.
                </p>
              )}

              {agendaGroupedBySlot.map((rows, idx) => (
                <div key={`slot:${idx}`} style={{ marginTop: 10, border: "1px solid var(--color-border)", borderRadius: 10 }}>
                  <div style={{ borderBottom: "1px solid var(--color-border)", padding: "8px 10px", fontWeight: 600 }}>
                    {rows[0]?.data} | {rows[0]?.hora}-{rows[0]?.horaFim}
                  </div>
                  <div style={{ padding: "8px 10px" }}>
                    {rows.map((r, ri) => (
                      <div key={`slot:${idx}:${ri}`} style={{ padding: "6px 0", borderTop: ri === 0 ? "none" : "1px solid var(--color-border)" }}>
                        <strong>{r.quadra}</strong> - {r.categoria} / {r.classe} - {r.round}
                        {r.isSemifinal ? " (Semi)" : ""}
                        {r.isFinal ? " (Final)" : ""}
                        <br />
                        <span className="subtle">
                          {r.p1} x {r.p2}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {agendaDirty ? (
                <p className="subtle" style={{ marginTop: 10 }}>
                  Alteracoes de organizacao pendentes. Clique em "Salvar organizacao" para persistir no Supabase.
                </p>
              ) : null}
            </section>
          ) : null}
        </>
      ) : null}
    </AppShell>
  );
}
