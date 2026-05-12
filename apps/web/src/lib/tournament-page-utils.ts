import type { ClassData } from "../tournament-engine/core";
import { normalizeScoreTypeByModel, normalizeSetCountByScoreType } from "./tournament-score";

export function normalizePlayerName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export async function copyTextWithFallback(text: string): Promise<boolean> {
  const value = text.trim();
  if (!value) return false;
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Fallback below.
  }
  try {
    window.prompt("Copie o link abaixo:", value);
    return false;
  } catch {
    return false;
  }
}

export function scopeClassKey(categoryId: string, classId: string): string {
  return `${categoryId}::${classId}`;
}

export function toDateTimeLocalValue(value: string | null | undefined): string {
  const raw = (value || "").trim();
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(raw)) return raw;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export function toIsoFromDateTimeLocal(value: string): string {
  const raw = value.trim();
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString();
}

export function normalizeNumberInputToOdd(value: string, fallback: number): number {
  const parsed = Number.parseInt(value.trim(), 10);
  if (Number.isNaN(parsed)) return fallback;
  const bounded = Math.max(1, Math.min(5, parsed));
  return bounded % 2 === 0 ? bounded + 1 : bounded;
}

export function setScoreUiValue(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return "";
  return String(value);
}

export function coerceScoreTypePatchByModel(
  current: ClassData["config"],
  patch: Partial<ClassData["config"]>
): Partial<ClassData["config"]> {
  const nextType = (patch.tipoPontuacao ?? current.tipoPontuacao) as ClassData["config"]["tipoPontuacao"];
  const model = (patch.modeloCompeticao ?? current.modeloCompeticao) as ClassData["config"]["modeloCompeticao"];
  const coercedType = normalizeScoreTypeByModel(model, nextType);
  const rawSets = Number(patch.numeroSets ?? current.numeroSets ?? 3);
  const numeroSets = normalizeSetCountByScoreType(coercedType, rawSets);
  return {
    ...patch,
    tipoPontuacao: coercedType,
    numeroSets,
  };
}
