export const ACADEMY_LEVEL_OPTIONS = [
  { value: "Iniciante", label: "Iniciante" },
  { value: "Intermediario", label: "Intermediario" },
  { value: "Avancado", label: "Avancado" },
  { value: "Primeira Classe", label: "Primeira Classe" },
  { value: "Profissional", label: "Profissional" },
] as const;

export type AcademyLevelOption = (typeof ACADEMY_LEVEL_OPTIONS)[number]["value"];

function normalizeLevelText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function normalizeAcademyLevel(value: string): AcademyLevelOption | "" {
  const text = normalizeLevelText(value);
  if (!text) return "";
  if (["iniciante", "inicio", "beginner", "basico", "c", "classe c", "3a classe", "terceira classe"].includes(text)) return "Iniciante";
  if (["intermediario", "intermediaria", "medio", "b", "classe b", "2a classe", "segunda classe"].includes(text)) return "Intermediario";
  if (["avancado", "avancada", "advanced", "a", "classe a"].includes(text)) return "Avancado";
  if (["primeira classe", "1a classe", "1 classe", "primeira", "especial", "open"].includes(text)) return "Primeira Classe";
  if (["profissional", "pro", "atp", "itf", "professional"].includes(text)) return "Profissional";
  const option = ACADEMY_LEVEL_OPTIONS.find((item) => normalizeLevelText(item.value) === text);
  return option?.value || "";
}

export function academyLevelMatches(value: string, filter: string): boolean {
  const normalizedFilter = normalizeAcademyLevel(filter);
  if (!normalizedFilter) return !filter.trim();
  const normalizedValue = normalizeAcademyLevel(value);
  if (normalizedValue) return normalizedValue === normalizedFilter;
  return normalizeLevelText(value).includes(normalizeLevelText(normalizedFilter));
}
