import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { AppShell } from "../components/AppShell";
import { fetchPlacesWorkspaceData, type PlaceAdminResourceEntry } from "../lib/place-admin-data";
import { buildPlaceAdminPath } from "../lib/place-admin-navigation";
import {
  PLACE_MANAGEMENT_MODULE_LABELS,
  countLabel,
  placeManagementModules,
  placeResourceAccess,
  type PlaceManagementModule,
} from "../lib/place-management";
import type { Place, PlaceStaffMember, Profile } from "../lib/types";

type Props = {
  user: User;
  profile: Profile | null;
};

type PlaceOperationSummary = {
  contactsDue: number;
  lowStock: number;
  pendingAcademy: number;
  pendingBookings: number;
  pendingFinance: number;
  setupGaps: string[];
  todayBookings: number;
  waitlist: number;
};

const PRIORITY_MODULES: PlaceManagementModule[] = ["bookings", "academy", "clients", "finance", "canteen"];

const PLAN_LABELS: Record<Place["productPlan"], string> = {
  academy: "Academia",
  club_basic: "Reservas",
  club_pro: "Operacao completa",
  multi_unit: "Multiunidade",
};

const ROLE_LABELS: Record<string, string> = {
  coach: "Professor",
  frontdesk: "Recepcao",
  manager: "Gerente",
  owner: "Administrador",
};

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function isToday(value: string): boolean {
  if (!value) return false;
  return value.slice(0, 10) === todayKey();
}

function isDue(value: string): boolean {
  if (!value) return false;
  return value.slice(0, 10) <= todayKey();
}

function placeInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "GE";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

function summarizePlace(entry: PlaceAdminResourceEntry): PlaceOperationSummary {
  const pendingBookings = entry.bookings.filter((booking) => booking.status === "pending").length;
  const todayBookings = entry.bookings.filter((booking) => booking.status !== "cancelled" && isToday(booking.startsAt)).length;
  const waitlist = entry.bookingWaitlist.filter((item) => item.status === "waiting" || item.status === "invited").length;
  const pendingAcademy =
    entry.academyEnrollments.filter((enrollment) => enrollment.status === "pending").length +
    entry.academyLessonRequests.filter((request) => request.status === "pending").length;
  const contactsDue = entry.crmContacts.filter((contact) => contact.status !== "archived" && (contact.status === "lead" || isDue(contact.nextContactOn))).length;
  const pendingFinance =
    entry.memberships.filter((membership) => membership.status === "pending").length +
    entry.creditPurchases.filter((purchase) => purchase.status === "active" && purchase.remainingQuantity <= 0).length;
  const lowStock = entry.posProducts.filter((product) => product.isActive && product.stockQuantity <= 3).length;
  const setupGaps = [
    entry.courts.length ? "" : "Cadastrar quadras",
    entry.bookingRules.length ? "" : "Definir regras de reserva",
    entry.academyClasses.length ? "" : "Criar turmas",
    entry.academyCoaches.length ? "" : "Cadastrar professores",
    entry.membershipPlans.length ? "" : "Configurar planos",
  ].filter(Boolean);
  return { contactsDue, lowStock, pendingAcademy, pendingBookings, pendingFinance, setupGaps, todayBookings, waitlist };
}

function totalSummaries(summaries: PlaceOperationSummary[]): PlaceOperationSummary {
  return summaries.reduce<PlaceOperationSummary>(
    (acc, item) => ({
      contactsDue: acc.contactsDue + item.contactsDue,
      lowStock: acc.lowStock + item.lowStock,
      pendingAcademy: acc.pendingAcademy + item.pendingAcademy,
      pendingBookings: acc.pendingBookings + item.pendingBookings,
      pendingFinance: acc.pendingFinance + item.pendingFinance,
      setupGaps: acc.setupGaps,
      todayBookings: acc.todayBookings + item.todayBookings,
      waitlist: acc.waitlist + item.waitlist,
    }),
    {
      contactsDue: 0,
      lowStock: 0,
      pendingAcademy: 0,
      pendingBookings: 0,
      pendingFinance: 0,
      setupGaps: [],
      todayBookings: 0,
      waitlist: 0,
    }
  );
}

function pendingTotal(summary: PlaceOperationSummary): number {
  return summary.pendingBookings + summary.waitlist + summary.pendingAcademy + summary.contactsDue + summary.pendingFinance + summary.lowStock;
}

function queueRows(summary: PlaceOperationSummary) {
  return [
    { label: "Reservas pendentes", value: summary.pendingBookings, module: "bookings" as PlaceManagementModule },
    { label: "Lista de espera", value: summary.waitlist, module: "bookings" as PlaceManagementModule },
    { label: "Academia", value: summary.pendingAcademy, module: "academy" as PlaceManagementModule },
    { label: "Clientes/CRM", value: summary.contactsDue, module: "clients" as PlaceManagementModule },
    { label: "Financeiro", value: summary.pendingFinance, module: "finance" as PlaceManagementModule },
    { label: "Estoque baixo", value: summary.lowStock, module: "canteen" as PlaceManagementModule },
  ];
}

export function ManagementHubPage({ user, profile }: Props) {
  const navigate = useNavigate();
  const [places, setPlaces] = useState<Place[]>([]);
  const [entries, setEntries] = useState<PlaceAdminResourceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchPlacesWorkspaceData({ isAdminRoute: true, tab: "mine", user });
        if (cancelled) return;
        setPlaces(data.places);
        setEntries(data.entries);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Falha ao carregar gestao.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const entriesByPlace = useMemo(() => Object.fromEntries(entries.map((entry) => [entry.placeId, entry])), [entries]);
  const summariesByPlace = useMemo(
    () => Object.fromEntries(entries.map((entry) => [entry.placeId, summarizePlace(entry)])),
    [entries]
  );
  const aggregate = useMemo(() => totalSummaries(Object.values(summariesByPlace)), [summariesByPlace]);

  return (
    <AppShell user={user} profile={profile} showHeader={false}>
      <main className="management-hub-page">
        <section className="management-hub-hero">
          <div>
            <span>Central operacional</span>
            <h1>Gestao da academia</h1>
            <p>Uma entrada propria para quem trabalha no app: pendencias primeiro, modulos claros e cada local com sua operacao separada.</p>
          </div>
          <div className="management-hub-kpis" aria-label="Resumo operacional">
            <article>
              <strong>{places.length}</strong>
              <small>{countLabel(places.length, "local acessivel", "locais acessiveis")}</small>
            </article>
            <article>
              <strong>{pendingTotal(aggregate)}</strong>
              <small>pendencias operacionais</small>
            </article>
            <article>
              <strong>{aggregate.todayBookings}</strong>
              <small>reservas hoje</small>
            </article>
          </div>
        </section>

        {error ? <p className="feedback error">{error}</p> : null}
        {loading ? <p className="subtle">Carregando central de gestao...</p> : null}

        {!loading && !places.length ? (
          <section className="management-empty-state">
            <span>Operacao ainda nao configurada</span>
            <h2>Crie ou acesse um local para ativar a gestao profissional.</h2>
            <p>A area de gestao aparece para donos e equipe de academias. O cadastro inicial continua em Locais; a rotina diaria fica aqui.</p>
            <button className="primary" onClick={() => navigate("/locais")}>
              Ir para locais
            </button>
          </section>
        ) : null}

        {!loading && places.length ? (
          <>
            <section className="management-command-panel">
              <div className="management-section-title">
                <div>
                  <span>Fila do dia</span>
                  <h2>O que precisa de atencao agora</h2>
                </div>
                <button onClick={() => navigate("/locais")}>Ver pagina publica</button>
              </div>
              <div className="management-queue-grid">
                {queueRows(aggregate).map((row) => (
                  <article key={row.label} className={row.value ? "has-work" : ""}>
                    <strong>{row.value}</strong>
                    <span>{row.label}</span>
                  </article>
                ))}
              </div>
            </section>

            <section className="management-place-grid" aria-label="Locais em gestao">
              {places.map((place) => {
                const entry = entriesByPlace[place.id];
                const staff = entry?.staff || [];
                const access = placeResourceAccess(place, user.id, staff as PlaceStaffMember[]);
                const modules = placeManagementModules(access);
                const moduleShortcuts = PRIORITY_MODULES.filter((module) => modules.includes(module));
                const summary = summariesByPlace[place.id] || summarizePlace({
                  academyAbsences: [],
                  academyAttendance: [],
                  academyClasses: [],
                  academyCoaches: [],
                  academyEnrollments: [],
                  academyLessonRequests: [],
                  academyMakeups: [],
                  academyProgress: [],
                  academySlots: [],
                  bookingRules: [],
                  bookingWaitlist: [],
                  bookings: [],
                  courts: [],
                  creditPackages: [],
                  creditPurchases: [],
                  crmContacts: [],
                  crmInteractions: [],
                  expenses: [],
                  membershipPlans: [],
                  memberships: [],
                  placeId: place.id,
                  posProducts: [],
                  posSales: [],
                  staff: [],
                });
                const role = ROLE_LABELS[access.staffRole] || "Equipe";
                return (
                  <article key={place.id} className="management-place-card">
                    <header>
                      <div className="management-place-logo" aria-hidden>
                        {place.logoUrl ? <img src={place.logoUrl} alt="" /> : placeInitials(place.name)}
                      </div>
                      <div>
                        <span>
                          {role} | {PLAN_LABELS[place.productPlan]}
                        </span>
                        <h2>{place.name}</h2>
                        <p>{[place.city, place.state].filter(Boolean).join(" - ") || "Local sem cidade definida"}</p>
                      </div>
                    </header>

                    <div className="management-place-priority">
                      <strong>{pendingTotal(summary) ? `${pendingTotal(summary)} pendencia(s)` : "Operacao em dia"}</strong>
                      <span>
                        {summary.todayBookings
                          ? `${summary.todayBookings} reserva(s) hoje`
                          : summary.setupGaps.length
                            ? "Configure a base operacional"
                            : "Sem reservas para hoje"}
                      </span>
                    </div>

                    <div className="management-place-metrics">
                      {queueRows(summary).slice(0, 4).map((row) => (
                        <button
                          key={`${place.id}:${row.label}`}
                          className={row.value ? "has-work" : ""}
                          onClick={() => navigate(buildPlaceAdminPath(place.id, modules.includes(row.module) ? row.module : "dashboard"))}
                        >
                          <strong>{row.value}</strong>
                          <span>{row.label}</span>
                        </button>
                      ))}
                    </div>

                    {summary.setupGaps.length ? (
                      <div className="management-setup-strip">
                        <span>Base incompleta</span>
                        <strong>{summary.setupGaps.slice(0, 2).join(" | ")}</strong>
                      </div>
                    ) : null}

                    <div className="management-card-actions">
                      <button className="primary" onClick={() => navigate(buildPlaceAdminPath(place.id, "dashboard"))}>
                        Abrir operacao
                      </button>
                      <button onClick={() => navigate(`/locais/${encodeURIComponent(place.id)}`)}>Pagina publica</button>
                    </div>

                    <div className="management-module-shortcuts">
                      {moduleShortcuts.map((module) => (
                        <button key={`${place.id}:${module}`} onClick={() => navigate(buildPlaceAdminPath(place.id, module))}>
                          {PLACE_MANAGEMENT_MODULE_LABELS[module]}
                        </button>
                      ))}
                    </div>
                  </article>
                );
              })}
            </section>
          </>
        ) : null}
      </main>
    </AppShell>
  );
}
