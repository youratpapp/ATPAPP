import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { useLocation, useNavigate } from "react-router-dom";
import type { Profile } from "../lib/types";
import { BottomNav } from "./BottomNav";
import { AppPopover } from "./AppOverlays";
import logoSymbol from "../assets/logo-atp-symbol.svg";
import { loadMyLeagues } from "../lib/leagues";
import { buildPlaceAdminPath } from "../lib/place-admin-navigation";
import {
  listPlaceAcademyClasses,
  listPlaceAcademyEnrollments,
  listPlaceBookings,
  listPlaceCrmContacts,
  listPlacePosProducts,
} from "../lib/places";
import { getRouteExperienceMode, getRouteSurfaceMode, type AppSurfaceMode } from "../lib/role-visibility";
import { supabase } from "../lib/supabase";
import { loadDashboardData } from "../lib/tournaments";
import { useUserMode } from "../lib/user-mode-context";

type Props = {
  user: User;
  profile: Profile | null;
  children: ReactNode;
  showHeader?: boolean;
  onBellClick?: () => void;
  onBellClose?: () => void;
  bellOpen?: boolean;
  bellPanel?: ReactNode;
  bellCount?: number;
  mode?: AppSurfaceMode;
};

function initialsFromName(name: string, fallback: string): string {
  const txt = (name || "").trim();
  if (!txt) return fallback.slice(0, 2).toUpperCase();
  const parts = txt.split(/\s+/);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  );
}

function activePlaceIdFromPath(pathname: string): string | null {
  if (!pathname.startsWith("/gestao/")) return null;
  const [, , rawPlaceId] = pathname.split("/");
  if (!rawPlaceId) return null;
  try {
    return decodeURIComponent(rawPlaceId);
  } catch {
    return rawPlaceId;
  }
}

type WorkSearchItem = {
  detail: string;
  id: string;
  keywords?: string;
  label: string;
  path: string;
  source?: string;
};

function normalizeWorkSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function workSearchMatches(item: Omit<WorkSearchItem, "path"> & { path?: string }, query: string): boolean {
  const haystack = normalizeWorkSearchText([item.label, item.detail, item.source, item.keywords].filter(Boolean).join(" "));
  const terms = normalizeWorkSearchText(query).split(" ").filter(Boolean);
  if (!terms.length) return true;
  return terms.every((term) => haystack.includes(term));
}

export function AppShell({
  user,
  profile,
  children,
  showHeader = true,
  onBellClick,
  onBellClose,
  bellOpen = false,
  bellPanel,
  bellCount = 0,
  mode,
}: Props) {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const userMode = useUserMode();
  const routeSurfaceMode = getRouteSurfaceMode(pathname);
  const routeExperienceMode = getRouteExperienceMode(pathname, search);
  const surfaceMode = mode ?? routeSurfaceMode;
  const activePlaceId = activePlaceIdFromPath(pathname) || userMode.access.primaryPlaceId;
  const activePlace = activePlaceId ? userMode.access.placeOptions.find((place) => place.id === activePlaceId) : null;
  const displayName = profile?.displayName || user.email?.split("@")[0] || "Atleta";
  const photo = profile?.photoUrl || "";
  const initials = initialsFromName(profile?.displayName ?? "", user.email ?? "AT");
  const headerClassName = showHeader ? "app-header" : "app-header app-header--desktop-only";
  const experienceLabel = routeExperienceMode === "work" ? "Trabalho" : "Jogador";
  const [workSearch, setWorkSearch] = useState("");
  const [workSearchOpen, setWorkSearchOpen] = useState(false);
  const [workCreateOpen, setWorkCreateOpen] = useState(false);
  const [workEntityResults, setWorkEntityResults] = useState<WorkSearchItem[]>([]);
  const [workEntitySearchLoading, setWorkEntitySearchLoading] = useState(false);
  const targetPlaceId = activePlaceId || userMode.access.primaryPlaceId || "";
  const workSearchItems = useMemo<WorkSearchItem[]>(() => {
    if (!targetPlaceId) return [];
    return [
      { id: "area-agenda", label: "Agenda", detail: "Reservas, aulas, bloqueios e remarcacoes", keywords: "calendario quadra horario conflito semana lista", path: buildPlaceAdminPath(targetPlaceId, "bookings", "calendar") },
      { id: "area-reservas", label: "Reservas", detail: "Calendario clicavel e detalhe lateral", keywords: "quadra booking pagamento pendente pago cancelar remarcar whatsapp", path: buildPlaceAdminPath(targetPlaceId, "bookings", "reservas") },
      { id: "area-clientes", label: "Clientes", detail: "Leads, ativos, alunos e socios", keywords: "pessoa contato crm cliente 360 aluno socio mensalista telefone", path: buildPlaceAdminPath(targetPlaceId, "clients", "clientes-ativos") },
      { id: "area-aulas", label: "Aulas e turmas", detail: "Turmas, matriculas e reposicoes", keywords: "academia aula turma aluno professor matricula contrato reposicao", path: buildPlaceAdminPath(targetPlaceId, "academy", "turmas") },
      { id: "area-financeiro", label: "Financeiro", detail: "Recebiveis, vencidos e pagos", keywords: "pagamento pagar cobranca cobrar mensalidade inadimplente despesa receita receber pago pendente", path: buildPlaceAdminPath(targetPlaceId, "finance", "recebiveis") },
      { id: "area-pos", label: "Loja/POS", detail: "Venda rapida, estoque e produtos", keywords: "cantina produto venda caixa estoque vender", path: buildPlaceAdminPath(targetPlaceId, "canteen", "vender") },
      { id: "area-competicoes", label: "Competicoes", detail: "Torneios, ligas e resultados pendentes", keywords: "torneio liga campeonato ranking resultado chave inscricao", path: "/eventos?modo=organizing" },
      { id: "area-comunicacao", label: "Comunicacao", detail: "WhatsApp, avisos e publicacao", keywords: "mensagem contato aviso template whatsapp notificar", path: buildPlaceAdminPath(targetPlaceId, "communication") },
      { id: "area-relatorios", label: "Relatorios", detail: "Ocupacao, receita e indicadores", keywords: "dashboard indicador resumo analise relatorio", path: buildPlaceAdminPath(targetPlaceId, "reports") },
      { id: "area-administracao", label: "Administracao", detail: "Regras, equipe e ajustes estruturais", keywords: "configuracao ajustes permissao colaborador equipe unidade", path: buildPlaceAdminPath(targetPlaceId, "settings") },
    ];
  }, [targetPlaceId]);
  const filteredWorkSearchItems = useMemo(() => {
    const query = workSearch.trim();
    const areaItems = !query ? workSearchItems.slice(0, 6) : workSearchItems.filter((item) => workSearchMatches(item, query)).slice(0, 6);
    const merged = query.length >= 2 ? [...workEntityResults, ...areaItems] : areaItems;
    const seen = new Set<string>();
    return merged
      .filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      })
      .slice(0, 10);
  }, [workEntityResults, workSearch, workSearchItems]);
  const quickCreateItems = useMemo(() => {
    if (!targetPlaceId) return [];
    return [
      { label: "Nova reserva", detail: "Abrir calendario no fluxo de reserva", path: buildPlaceAdminPath(targetPlaceId, "bookings", "nova-reserva") },
      { label: "Novo cliente", detail: "Cadastro progressivo de atendimento", path: buildPlaceAdminPath(targetPlaceId, "clients", "leads") },
      { label: "Registrar pagamento", detail: "Recebivel ou pagamento manual", path: buildPlaceAdminPath(targetPlaceId, "finance", "recebiveis") },
      { label: "Criar aula/turma", detail: "Configurar turma ou aula recorrente", path: buildPlaceAdminPath(targetPlaceId, "academy", "turmas") },
      { label: "Criar torneio", detail: "Abrir Competition OS", path: "/eventos/torneios?view=organizing" },
      { label: "Vender produto", detail: "Abrir POS", path: buildPlaceAdminPath(targetPlaceId, "canteen", "vender") },
    ];
  }, [targetPlaceId]);

  const navigateAndClose = (path: string) => {
    setWorkCreateOpen(false);
    setWorkSearchOpen(false);
    navigate(path);
  };

  useEffect(() => {
    const query = workSearch.trim();
    const client = supabase!;
    const legacyDirectTableSearchEnabled = false;
    if (!legacyDirectTableSearchEnabled || !client || routeExperienceMode !== "work" || !targetPlaceId || query.length < 2) {
      setWorkEntityResults([]);
      setWorkEntitySearchLoading(false);
      return undefined;
    }

    let cancelled = false;
    const normalizedQuery = query.replace(/[%_,]/g, " ").replace(/\s+/g, " ").trim();
    const pattern = `%${normalizedQuery}%`;
    const abortController = new AbortController();
    setWorkEntitySearchLoading(true);

    const timer = window.setTimeout(() => {
      const abortTimer = window.setTimeout(() => abortController.abort(), 2200);
      void Promise.allSettled([
        client
          .from("place_crm_contacts")
          .select("id,name,phone,email,status,interest")
          .eq("place_id", targetPlaceId)
          .or(`name.ilike.${pattern},phone.ilike.${pattern},email.ilike.${pattern},interest.ilike.${pattern}`)
          .abortSignal(abortController.signal)
          .limit(4),
        client
          .from("court_bookings")
          .select("id,player_name,phone,starts_at,status")
          .eq("place_id", targetPlaceId)
          .or(`player_name.ilike.${pattern},phone.ilike.${pattern},notes.ilike.${pattern}`)
          .order("starts_at", { ascending: false })
          .abortSignal(abortController.signal)
          .limit(4),
        client
          .from("place_academy_classes")
          .select("id,title,coach_name,level,weekday,starts_at")
          .eq("place_id", targetPlaceId)
          .or(`title.ilike.${pattern},coach_name.ilike.${pattern},level.ilike.${pattern}`)
          .abortSignal(abortController.signal)
          .limit(4),
        client
          .from("place_academy_enrollments")
          .select("id,player_name,phone,status")
          .eq("place_id", targetPlaceId)
          .or(`player_name.ilike.${pattern},phone.ilike.${pattern},notes.ilike.${pattern}`)
          .abortSignal(abortController.signal)
          .limit(4),
        client
          .from("app_payments")
          .select("id,target_type,target_id,amount_cents,status,description,billing_period")
          .or(`description.ilike.${pattern},target_type.ilike.${pattern},billing_period.ilike.${pattern}`)
          .order("created_at", { ascending: false })
          .abortSignal(abortController.signal)
          .limit(4),
      ]).then((results) => {
        if (cancelled) return;
        const [contacts, bookings, classes, enrollments, payments] = results;
        const items: WorkSearchItem[] = [];
        if (contacts.status === "fulfilled" && !contacts.value.error) {
          for (const contact of contacts.value.data || []) {
            items.push({
              id: `contact:${contact.id}`,
              source: "Cliente",
              label: contact.name || "Cliente",
              detail: [contact.status, contact.interest, contact.phone || contact.email].filter(Boolean).join(" - "),
              path: buildPlaceAdminPath(targetPlaceId, "clients", "clientes-ativos"),
            });
          }
        }
        if (bookings.status === "fulfilled" && !bookings.value.error) {
          for (const booking of bookings.value.data || []) {
            const dateLabel = booking.starts_at ? new Date(booking.starts_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "";
            items.push({
              id: `booking:${booking.id}`,
              source: "Reserva",
              label: booking.player_name || "Reserva",
              detail: [dateLabel, booking.status, booking.phone].filter(Boolean).join(" - "),
              path: buildPlaceAdminPath(targetPlaceId, "bookings", "reservas"),
            });
          }
        }
        if (classes.status === "fulfilled" && !classes.value.error) {
          for (const academyClass of classes.value.data || []) {
            items.push({
              id: `class:${academyClass.id}`,
              source: "Turma",
              label: academyClass.title || "Turma",
              detail: [academyClass.coach_name, academyClass.level, academyClass.starts_at?.slice(0, 5)].filter(Boolean).join(" - "),
              path: buildPlaceAdminPath(targetPlaceId, "academy", "turmas"),
            });
          }
        }
        if (enrollments.status === "fulfilled" && !enrollments.value.error) {
          for (const enrollment of enrollments.value.data || []) {
            items.push({
              id: `enrollment:${enrollment.id}`,
              source: "Aluno",
              label: enrollment.player_name || "Aluno",
              detail: [enrollment.status, enrollment.phone].filter(Boolean).join(" - "),
              path: buildPlaceAdminPath(targetPlaceId, "academy", "alunos"),
            });
          }
        }
        if (payments.status === "fulfilled" && !payments.value.error) {
          for (const payment of payments.value.data || []) {
            const amount = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(payment.amount_cents || 0) / 100);
            items.push({
              id: `payment:${payment.id}`,
              source: "Pagamento",
              label: payment.description || payment.target_type || "Pagamento",
              detail: [amount, payment.status, payment.billing_period].filter(Boolean).join(" - "),
              path: buildPlaceAdminPath(targetPlaceId, "finance", "recebiveis"),
            });
          }
        }
        setWorkEntityResults(items.slice(0, 8));
      }).finally(() => {
        window.clearTimeout(abortTimer);
        if (!cancelled) setWorkEntitySearchLoading(false);
      });
    }, 260);

    return () => {
      cancelled = true;
      abortController.abort();
      window.clearTimeout(timer);
    };
  }, [routeExperienceMode, targetPlaceId, workSearch]);

  useEffect(() => {
    const query = workSearch.trim();
    if (routeExperienceMode !== "work" || !targetPlaceId || query.length < 2) {
      setWorkEntityResults([]);
      setWorkEntitySearchLoading(false);
      return undefined;
    }

    let cancelled = false;
    const normalizedQuery = normalizeWorkSearchText(query);
    setWorkEntitySearchLoading(true);

    const timer = window.setTimeout(() => {
      void Promise.allSettled([
        listPlaceCrmContacts(targetPlaceId).catch(() => []),
        listPlaceBookings(targetPlaceId).catch(() => []),
        listPlaceAcademyClasses(targetPlaceId).catch(() => []),
        listPlaceAcademyEnrollments(targetPlaceId).catch(() => []),
        listPlacePosProducts(targetPlaceId).catch(() => []),
        loadDashboardData(user).catch(() => ({ organizing: [], participating: [] })),
        loadMyLeagues().catch(() => []),
      ])
        .then((results) => {
          if (cancelled) return;
          const [contacts, bookings, classes, enrollments, products, tournaments, leagues] = results;
          const items: WorkSearchItem[] = [];

          if (contacts.status === "fulfilled") {
            for (const contact of contacts.value
              .filter((item) => workSearchMatches({ id: item.id, label: item.name, detail: [item.status, item.interest, item.phone, item.email].join(" ") }, normalizedQuery))
              .slice(0, 4)) {
              items.push({
                id: `contact:${contact.id}`,
                source: "Cliente",
                label: contact.name || "Cliente",
                detail: [contact.status, contact.interest, contact.phone || contact.email].filter(Boolean).join(" - "),
                path: buildPlaceAdminPath(targetPlaceId, "clients", "clientes-ativos"),
              });
            }
          }

          if (bookings.status === "fulfilled") {
            for (const booking of bookings.value
              .filter((item) => workSearchMatches({ id: item.id, label: item.playerName, detail: [item.phone, item.courtName, item.status, item.notes, item.startsAt].join(" ") }, normalizedQuery))
              .slice(0, 4)) {
              const dateLabel = booking.startsAt ? new Date(booking.startsAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "";
              items.push({
                id: `booking:${booking.id}`,
                source: "Reserva",
                label: booking.playerName || "Reserva",
                detail: [dateLabel, booking.courtName, booking.status, booking.phone].filter(Boolean).join(" - "),
                path: buildPlaceAdminPath(targetPlaceId, "bookings", "reservas"),
              });
            }
          }

          if (classes.status === "fulfilled") {
            for (const academyClass of classes.value
              .filter((item) => workSearchMatches({ id: item.id, label: item.title, detail: [item.coachName, item.level, item.startsAt].join(" ") }, normalizedQuery))
              .slice(0, 4)) {
              items.push({
                id: `class:${academyClass.id}`,
                source: "Turma",
                label: academyClass.title || "Turma",
                detail: [academyClass.coachName, academyClass.level, academyClass.startsAt?.slice(0, 5)].filter(Boolean).join(" - "),
                path: buildPlaceAdminPath(targetPlaceId, "academy", "turmas"),
              });
            }
          }

          if (enrollments.status === "fulfilled") {
            for (const enrollment of enrollments.value
              .filter((item) => workSearchMatches({ id: item.id, label: item.playerName, detail: [item.phone, item.status, item.notes].join(" ") }, normalizedQuery))
              .slice(0, 4)) {
              items.push({
                id: `enrollment:${enrollment.id}`,
                source: "Aluno",
                label: enrollment.playerName || "Aluno",
                detail: [enrollment.status, enrollment.phone].filter(Boolean).join(" - "),
                path: buildPlaceAdminPath(targetPlaceId, "academy", "alunos"),
              });
            }
          }

          if (products.status === "fulfilled") {
            for (const product of products.value
              .filter((item) => workSearchMatches({ id: item.id, label: item.name, detail: [item.category, String(item.stockQuantity)].join(" ") }, normalizedQuery))
              .slice(0, 3)) {
              items.push({
                id: `product:${product.id}`,
                source: "Produto",
                label: product.name || "Produto",
                detail: [product.category, `${product.stockQuantity} em estoque`].filter(Boolean).join(" - "),
                path: buildPlaceAdminPath(targetPlaceId, "canteen", "produtos"),
              });
            }
          }

          if (tournaments.status === "fulfilled") {
            for (const tournament of tournaments.value.organizing
              .filter((item) => workSearchMatches({ id: item.id, label: item.name, detail: [item.status, item.city, item.state].join(" ") }, normalizedQuery))
              .slice(0, 3)) {
              items.push({
                id: `tournament:${tournament.id}`,
                source: "Torneio",
                label: tournament.name || "Torneio",
              detail: [tournament.status, tournament.city, tournament.state].filter(Boolean).join(" - "),
                path: `/eventos/${tournament.id}/organizacao`,
              });
            }
          }

          if (leagues.status === "fulfilled") {
            for (const league of leagues.value
              .filter((item) => workSearchMatches({ id: item.id, label: item.name, detail: [item.role, item.status, item.leagueType].join(" ") }, normalizedQuery))
              .slice(0, 3)) {
              items.push({
                id: `league:${league.id}`,
                source: "Liga",
                label: league.name || "Liga",
              detail: [league.role, league.status, league.leagueType].filter(Boolean).join(" - "),
                path: `/eventos/ligas/${league.id}`,
              });
            }
          }

          setWorkEntityResults(items.slice(0, 8));
        })
        .finally(() => {
          if (!cancelled) setWorkEntitySearchLoading(false);
        });
    }, 260);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [routeExperienceMode, targetPlaceId, user, workSearch]);

  useEffect(() => {
    if (!workSearchOpen) return undefined;
    const onDocumentMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest(".work-global-search")) {
        setWorkSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocumentMouseDown);
    return () => document.removeEventListener("mousedown", onDocumentMouseDown);
  }, [workSearchOpen]);

  useEffect(() => {
    if (!userMode.isProfessional) return;
    if (routeExperienceMode !== userMode.mode) {
      userMode.setMode(routeExperienceMode);
    }
  }, [routeExperienceMode, userMode]);

  useEffect(() => {
    if (!bellOpen) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onBellClose?.();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [bellOpen, onBellClose]);

  return (
    <div className={`app-shell app-shell--${surfaceMode}`} data-surface={surfaceMode}>
      <header className={headerClassName}>
        <div className="app-header-inner">
          <div className="app-header-greeting">
            <div className="avatar" aria-hidden>
              {photo ? <img src={photo} alt="" /> : initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <p className="greeting-label">Ola,</p>
              <div className="greeting-name-line">
                <p className="greeting-name">{displayName}</p>
                <span>{experienceLabel}</span>
              </div>
            </div>
          </div>
          <div className="app-header-actions">
            {routeExperienceMode === "work" && userMode.access.hasManagement ? (
              <div className="work-saas-topbar-context" aria-label="Contexto da unidade ativa">
                <label className="work-unit-select">
                  <span>Unidade</span>
                  <select
                    value={activePlaceId || ""}
                    onChange={(event) => {
                      const nextPlaceId = event.target.value;
                      if (nextPlaceId) navigate(buildPlaceAdminPath(nextPlaceId, "dashboard"));
                    }}
                  >
                    {userMode.access.placeOptions.map((place) => (
                      <option key={`work-unit:${place.id}`} value={place.id}>
                        {place.label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="work-global-search" aria-label="Busca global">
                  <input
                    value={workSearch}
                    onChange={(event) => {
                      setWorkSearch(event.target.value);
                      setWorkSearchOpen(true);
                    }}
                    onFocus={() => setWorkSearchOpen(true)}
                    placeholder="Buscar cliente, reserva, aula..."
                  />
                  {workSearchOpen ? (
                    <div className="work-global-search-panel" role="listbox" aria-label="Resultados da busca global">
                      {workEntitySearchLoading ? <span>Buscando dados da unidade...</span> : null}
                      {filteredWorkSearchItems.length ? (
                        filteredWorkSearchItems.map((item) => (
                          <button key={`work-search:${item.id}`} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => navigateAndClose(item.path)}>
                            <strong>{item.label}</strong>
                            <span>{item.source ? `${item.source} - ${item.detail}` : item.detail}</span>
                          </button>
                        ))
                      ) : (
                        <span>Nenhuma area encontrada para esta busca.</span>
                      )}
                    </div>
                  ) : null}
                </div>
                <button
                  className="work-create-btn"
                  type="button"
                  onClick={() => {
                    setWorkCreateOpen((current) => !current);
                    setWorkSearchOpen(false);
                  }}
                  aria-expanded={workCreateOpen}
                >
                  + Criar
                </button>
                {workCreateOpen ? (
                  <div className="work-create-menu" role="menu" aria-label="Criar rapido">
                    {quickCreateItems.map((item) => (
                      <button key={`work-create:${item.label}`} type="button" role="menuitem" onClick={() => navigateAndClose(item.path)}>
                        <strong>{item.label}</strong>
                        <span>{item.detail}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
                {activePlace?.detail ? <small>{activePlace.detail}</small> : null}
              </div>
            ) : null}
            {userMode.isProfessional ? (
              <div className="app-mode-switch" role="group" aria-label="Modo de uso">
                <button
                  type="button"
                  className={userMode.mode === "player" ? "active" : ""}
                  onClick={() => {
                    userMode.setMode("player");
                    if (routeExperienceMode !== "player") navigate("/inicio");
                  }}
                >
                  Jogador
                </button>
                <button
                  type="button"
                  className={userMode.mode === "work" ? "active" : ""}
                  onClick={() => {
                    userMode.setMode("work");
                    if (routeExperienceMode !== "work") navigate(userMode.workEntryPath);
                  }}
                >
                  Trabalho
                </button>
              </div>
            ) : null}
            <img src={logoSymbol} alt="ATP" className="app-header-mark" />
            {onBellClick ? (
              <>
                <button
                  className={`icon-btn app-bell-btn${bellOpen ? " active" : ""}`}
                  onClick={onBellClick}
                  aria-label="Notificacoes"
                  aria-haspopup="dialog"
                  aria-expanded={bellOpen}
                  aria-controls={bellOpen ? "app-notification-panel" : undefined}
                >
                  <BellIcon />
                  {bellCount > 0 ? <span className="app-bell-badge">{Math.min(9, bellCount)}</span> : null}
                </button>
                <AppPopover
                  id="app-notification-panel"
                  open={Boolean(bellOpen && bellPanel)}
                  label="Notificacoes"
                  onClose={onBellClose ?? onBellClick}
                  className="app-notification-popover"
                >
                  {bellPanel}
                </AppPopover>
              </>
            ) : null}
          </div>
        </div>
      </header>
      <main className="app-content">{children}</main>
      <BottomNav user={user} />
    </div>
  );
}
