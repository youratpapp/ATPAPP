export type BrazilianState = {
  uf: string;
  name: string;
};

export const BRAZILIAN_STATES: BrazilianState[] = [
  { uf: "AC", name: "Acre" },
  { uf: "AL", name: "Alagoas" },
  { uf: "AP", name: "Amapa" },
  { uf: "AM", name: "Amazonas" },
  { uf: "BA", name: "Bahia" },
  { uf: "CE", name: "Ceara" },
  { uf: "DF", name: "Distrito Federal" },
  { uf: "ES", name: "Espirito Santo" },
  { uf: "GO", name: "Goias" },
  { uf: "MA", name: "Maranhao" },
  { uf: "MT", name: "Mato Grosso" },
  { uf: "MS", name: "Mato Grosso do Sul" },
  { uf: "MG", name: "Minas Gerais" },
  { uf: "PA", name: "Para" },
  { uf: "PB", name: "Paraiba" },
  { uf: "PR", name: "Parana" },
  { uf: "PE", name: "Pernambuco" },
  { uf: "PI", name: "Piaui" },
  { uf: "RJ", name: "Rio de Janeiro" },
  { uf: "RN", name: "Rio Grande do Norte" },
  { uf: "RS", name: "Rio Grande do Sul" },
  { uf: "RO", name: "Rondonia" },
  { uf: "RR", name: "Roraima" },
  { uf: "SC", name: "Santa Catarina" },
  { uf: "SP", name: "Sao Paulo" },
  { uf: "SE", name: "Sergipe" },
  { uf: "TO", name: "Tocantins" },
];

type IbgeCity = {
  nome?: unknown;
};

const municipalitiesByUfCache = new Map<string, string[]>();

export function normalizeStateUf(value: string): string {
  return String(value || "").trim().toUpperCase().slice(0, 2);
}

export async function listMunicipalitiesByUf(ufRaw: string): Promise<string[]> {
  const uf = normalizeStateUf(ufRaw);
  if (!uf) return [];

  const cached = municipalitiesByUfCache.get(uf);
  if (cached) return cached;

  const url = `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Nao foi possivel carregar os municipios.");
  }

  const data = (await res.json()) as IbgeCity[];
  const names = data
    .map((item) => (typeof item?.nome === "string" ? item.nome.trim() : ""))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "pt-BR"));

  municipalitiesByUfCache.set(uf, names);
  return names;
}

