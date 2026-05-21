import { useLocation, useNavigate } from "react-router-dom";
import type { ComponentType } from "react";
import type { User } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import logoSymbol from "../assets/logo-atp-symbol.svg";
import type { WorkspaceAccessSummary } from "../lib/workspace-access";
import { buildPlaceAdminPath } from "../lib/place-admin-navigation";
import { getGlobalNavigationVisibility } from "../lib/role-visibility";
import { useUserMode, type UserMode } from "../lib/user-mode-context";

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function TrophyIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 21h8M12 17v4" />
      <path d="M17 4H7v5a5 5 0 0010 0V4z" fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.15 : 0} />
      <path d="M17 4H7v5a5 5 0 0010 0V4z" />
      <path d="M7 4H3v3a4 4 0 004 4M17 4h4v3a4 4 0 01-4 4" />
    </svg>
  );
}

function LocationIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.2 : 0} />
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" fill={active ? "currentColor" : "none"} />
    </svg>
  );
}

function CalendarIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.14 : 0} />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
    </svg>
  );
}

function ManagementIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.12 : 0} />
      <path d="M8 4V2h8v2" />
      <path d="M3 10h18" />
      <path d="M8 15h3M14 15h2" />
    </svg>
  );
}

function PersonIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.15 : 0} />
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.15 : 0} />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

type NavItem = {
  activePath?: string;
  activePaths?: string[];
  desktopActivePaths?: string[];
  mobileActivePaths?: string[];
  exactActive?: boolean;
  group: NavGroupId;
  path: string;
  label: string;
  Icon: ComponentType<{ active: boolean }>;
  visibility?: NavVisibility;
};

type NavGroupId = "player" | "routine" | "work" | "place" | "competition" | "admin" | "account";
type NavVisibility = "all" | "mobile" | "desktop";

const PLAYER_ITEMS: NavItem[] = [
  { group: "player", path: "/inicio", label: "Inicio", Icon: HomeIcon },
  { group: "player", path: "/locais", label: "Jogar", activePaths: ["/locais"], Icon: LocationIcon },
  { group: "player", path: "/eventos", label: "Competir", activePaths: ["/eventos", "/ranking", "/inscricao", "/join", "/t"], Icon: TrophyIcon },
  {
    group: "player",
    path: "/agenda",
    label: "Rotina",
    activePaths: ["/agenda", "/minhas-reservas", "/minhas-partidas", "/minhas-aulas", "/meus-pagamentos"],
    desktopActivePaths: ["/agenda", "/minhas-reservas", "/minhas-partidas", "/minhas-aulas", "/meus-pagamentos"],
    Icon: CalendarIcon,
  },
  { group: "account", path: "/perfil", label: "Perfil", Icon: PersonIcon },
];

const PLAYER_GROUPS: Array<{ id: NavGroupId; label: string }> = [
  { id: "player", label: "Jogar" },
  { id: "account", label: "Conta" },
];

const WORK_GROUPS: Array<{ id: NavGroupId; label: string }> = [
  { id: "work", label: "Trabalho" },
  { id: "place", label: "Locais" },
  { id: "competition", label: "Competicoes" },
  { id: "admin", label: "Administracao" },
  { id: "account", label: "Conta" },
];

function navItem({
  activePaths,
  desktopActivePaths,
  exactActive = false,
  group,
  Icon,
  label,
  mobileActivePaths,
  path,
  visibility = "all",
}: {
  activePaths?: string[];
  desktopActivePaths?: string[];
  exactActive?: boolean;
  group: NavGroupId;
  Icon: ComponentType<{ active: boolean }>;
  label: string;
  mobileActivePaths?: string[];
  path: string;
  visibility?: NavVisibility;
}): NavItem {
  return {
    activePath: path.split("?")[0],
    activePaths,
    desktopActivePaths,
    mobileActivePaths,
    exactActive,
    group,
    path,
    label,
    Icon,
    visibility,
  };
}

function workItem(
  path: string,
  label: string,
  Icon: ComponentType<{ active: boolean }>,
  activePaths?: string[],
  exactActive = false,
  group: NavGroupId = "work",
  visibility: NavVisibility = "all"
): NavItem {
  return navItem({ activePaths, exactActive, group, Icon, label, path, visibility });
}

function accountItem(visibility: NavVisibility = "all", path = "/perfil"): NavItem {
  return navItem({ group: "account", path, label: "Perfil", Icon: PersonIcon, visibility });
}

function workProfileItem(): NavItem {
  return accountItem("mobile", "/perfil?mode=work");
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

function placePath(access: WorkspaceAccessSummary, module: Parameters<typeof buildPlaceAdminPath>[1], view?: string, activePlaceId?: string | null): string {
  const placeId = activePlaceId || access.primaryPlaceId;
  return placeId ? buildPlaceAdminPath(placeId, module, view) : "/gestao";
}

function hasPlaceModule(access: WorkspaceAccessSummary, module: Parameters<typeof buildPlaceAdminPath>[1]): boolean {
  return access.primaryPlaceModules.includes(module);
}

function buildDesktopWorkItems(access: WorkspaceAccessSummary, workEntryPath: string, activePlaceId?: string | null): NavItem[] {
  const items: NavItem[] = [
    workItem(workEntryPath, "Hoje", ManagementIcon, [workEntryPath.split("?")[0], "/gestao"], true, "work", "desktop"),
  ];

  if (hasPlaceModule(access, "bookings")) items.push(workItem(placePath(access, "bookings", "hoje", activePlaceId), "Reservas", CalendarIcon, undefined, false, "place", "desktop"));
  if (hasPlaceModule(access, "academy")) items.push(workItem(placePath(access, "academy", "hoje", activePlaceId), "Aulas", TrophyIcon, undefined, false, "place", "desktop"));
  if (hasPlaceModule(access, "clients")) items.push(workItem(placePath(access, "clients", "rotina", activePlaceId), "Clientes", PersonIcon, undefined, false, "place", "desktop"));
  if (hasPlaceModule(access, "finance")) items.push(workItem(placePath(access, "finance", "recebiveis", activePlaceId), "Financeiro", ManagementIcon, undefined, false, "place", "desktop"));
  if (hasPlaceModule(access, "canteen")) items.push(workItem(placePath(access, "canteen", "vender", activePlaceId), "Cantina", ManagementIcon, undefined, false, "place", "desktop"));

  if (access.hasCompetitionManagement) {
    items.push(workItem("/eventos/torneios?view=organizing", "Torneios", TrophyIcon, ["/eventos/torneios"], false, "competition", "desktop"));
    items.push(workItem("/eventos/ligas?view=organizing", "Ligas", TrophyIcon, ["/eventos/ligas"], false, "competition", "desktop"));
  }

  if (hasPlaceModule(access, "team")) items.push(workItem(placePath(access, "team", "equipe", activePlaceId), "Equipe", PersonIcon, undefined, false, "admin", "desktop"));
  if (hasPlaceModule(access, "settings")) items.push(workItem(placePath(access, "settings", "checklist", activePlaceId), "Ajustes", ManagementIcon, undefined, false, "admin", "desktop"));

  return items;
}

function buildMobileWorkItems(access: WorkspaceAccessSummary, workEntryPath: string, activePlaceId?: string | null): NavItem[] {
  const competitionWorkPath = "/eventos?modo=organizing";
  const tournamentWorkPath = "/eventos/torneios?view=organizing";
  const leagueWorkPath = "/eventos/ligas?view=organizing";
  const todayItem = workItem(workEntryPath, "Hoje", ManagementIcon, [workEntryPath.split("?")[0], "/gestao"], true, "work", "mobile");
  const moreItem = () => workItem("/gestao", "Mais", ManagementIcon, ["/__work-more__"], true, "admin", "mobile");

  if (!access.hasManagement && access.hasCompetitionManagement) {
    return [
      todayItem,
      workItem(tournamentWorkPath, "Torneios", TrophyIcon, ["/eventos/torneios"], false, "competition", "mobile"),
      workItem(leagueWorkPath, "Ligas", TrophyIcon, ["/eventos/ligas"], false, "competition", "mobile"),
      workItem(competitionWorkPath, "Publicacao", ManagementIcon, ["/eventos"], true, "competition", "mobile"),
      workProfileItem(),
    ];
  }

  if (access.primaryWorkRole === "coach") {
    if (!hasPlaceModule(access, "academy")) return [todayItem, workProfileItem()];
    return [
      todayItem,
      workItem(placePath(access, "academy", "hoje", activePlaceId), "Agenda", CalendarIcon, undefined, false, "place", "mobile"),
      workItem(placePath(access, "academy", "turmas", activePlaceId), "Turmas", TrophyIcon, undefined, false, "place", "mobile"),
      workItem(placePath(access, "academy", "alunos", activePlaceId), "Alunos", PersonIcon, undefined, false, "place", "mobile"),
      workProfileItem(),
    ];
  }

  if (access.primaryWorkRole === "frontdesk") {
    const frontdeskItems = [todayItem];
    if (hasPlaceModule(access, "bookings")) frontdeskItems.push(workItem(placePath(access, "bookings", "hoje", activePlaceId), "Reservas", CalendarIcon, undefined, false, "place", "mobile"));
    if (hasPlaceModule(access, "clients")) frontdeskItems.push(workItem(placePath(access, "clients", "rotina", activePlaceId), "Clientes", PersonIcon, undefined, false, "place", "mobile"));
    if (hasPlaceModule(access, "academy")) frontdeskItems.push(workItem(placePath(access, "academy", "pendencias", activePlaceId), "Aulas", TrophyIcon, undefined, false, "place", "mobile"));
    return [...frontdeskItems.slice(0, 4), moreItem()];
  }

  if (access.primaryWorkRole === "finance") {
    if (!hasPlaceModule(access, "finance")) return [todayItem, workProfileItem()];
    return [
      workItem(placePath(access, "finance", "recebiveis", activePlaceId), "Receber", ManagementIcon, undefined, false, "place", "mobile"),
      workItem(placePath(access, "finance", "pagos", activePlaceId), "Pagos", CalendarIcon, undefined, false, "place", "mobile"),
      workItem(placePath(access, "finance", "despesas", activePlaceId), "Despesas", TrophyIcon, undefined, false, "place", "mobile"),
      workItem(placePath(access, "finance", "resumo", activePlaceId), "Resumo", ManagementIcon, undefined, false, "place", "mobile"),
      workProfileItem(),
    ];
  }

  if (access.primaryWorkRole === "cashier") {
    if (!hasPlaceModule(access, "canteen")) return [todayItem, workProfileItem()];
    return [
      workItem(placePath(access, "canteen", "vender", activePlaceId), "Vender", ManagementIcon, undefined, false, "place", "mobile"),
      workItem(placePath(access, "canteen", "hoje", activePlaceId), "Hoje", CalendarIcon, undefined, false, "place", "mobile"),
      workItem(placePath(access, "canteen", "estoque", activePlaceId), "Estoque", TrophyIcon, undefined, false, "place", "mobile"),
      workItem(placePath(access, "canteen", "produtos", activePlaceId), "Produtos", ManagementIcon, undefined, false, "place", "mobile"),
      workProfileItem(),
    ];
  }

  if (access.primaryWorkRole === "organizer") {
    return [
      todayItem,
      workItem(tournamentWorkPath, "Torneios", TrophyIcon, ["/eventos/torneios"], false, "competition", "mobile"),
      workItem(leagueWorkPath, "Ligas", TrophyIcon, ["/eventos/ligas"], false, "competition", "mobile"),
      workItem(competitionWorkPath, "Publicacao", ManagementIcon, ["/eventos"], true, "competition", "mobile"),
      workProfileItem(),
    ];
  }

  if (access.primaryWorkRole === "operator") {
    const operatorItems = [todayItem];
    if (hasPlaceModule(access, "bookings")) operatorItems.push(workItem(placePath(access, "bookings", "hoje", activePlaceId), "Reservas", CalendarIcon, undefined, false, "place", "mobile"));
    if (hasPlaceModule(access, "academy")) operatorItems.push(workItem(placePath(access, "academy", "hoje", activePlaceId), "Aulas", TrophyIcon, undefined, false, "place", "mobile"));
    if (access.hasCompetitionManagement) operatorItems.push(workItem(competitionWorkPath, "Competir", TrophyIcon, ["/eventos"], false, "competition", "mobile"));
    return [...operatorItems.slice(0, 4), workProfileItem()];
  }

  const managerItems = [todayItem];
  if (hasPlaceModule(access, "bookings")) managerItems.push(workItem(placePath(access, "bookings", "hoje", activePlaceId), "Reservas", CalendarIcon, undefined, false, "place", "mobile"));
  if (hasPlaceModule(access, "academy")) managerItems.push(workItem(placePath(access, "academy", "hoje", activePlaceId), "Aulas", TrophyIcon, undefined, false, "place", "mobile"));
  if (hasPlaceModule(access, "finance")) managerItems.push(workItem(placePath(access, "finance", "recebiveis", activePlaceId), "Financeiro", ManagementIcon, undefined, false, "place", "mobile"));
  return [...managerItems.slice(0, 4), { ...moreItem(), Icon: PersonIcon }];
}

function buildNavItems(access: WorkspaceAccessSummary, pathname: string, mode: UserMode, workEntryPath: string): NavItem[] {
  const visibility = getGlobalNavigationVisibility(access, pathname);
  const hasProfessionalEntry = visibility.showCompetitionManagement || visibility.showManagement;
  const activePlaceId = activePlaceIdFromPath(pathname);

  if (mode === "player") return [...PLAYER_ITEMS];

  if (!hasProfessionalEntry) {
    return [accountItem()];
  }

  return [...buildMobileWorkItems(access, workEntryPath, activePlaceId), ...buildDesktopWorkItems(access, workEntryPath, activePlaceId)];
}

function isActiveNavItem(item: NavItem, pathname: string, isDesktopNav: boolean): boolean {
  const viewportActivePaths = isDesktopNav ? item.desktopActivePaths : item.mobileActivePaths;
  const candidates = viewportActivePaths || item.activePaths || [item.activePath || item.path.split("?")[0] || item.path];
  if (item.exactActive) return candidates.some((activePath) => pathname === activePath);
  return candidates.some((activePath) => pathname === activePath || pathname.startsWith(`${activePath}/`));
}

function isVisibleForViewport(item: NavItem, isDesktopNav: boolean): boolean {
  if (item.visibility === "desktop") return isDesktopNav;
  if (item.visibility === "mobile") return !isDesktopNav;
  return true;
}

function navGroupsForMode(mode: UserMode): Array<{ id: NavGroupId; label: string }> {
  return mode === "work" ? WORK_GROUPS : PLAYER_GROUPS;
}

function useDesktopNav(): boolean {
  const [isDesktopNav, setIsDesktopNav] = useState(() => (typeof window === "undefined" ? true : window.matchMedia("(min-width: 960px)").matches));

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const query = window.matchMedia("(min-width: 960px)");
    const handleChange = () => setIsDesktopNav(query.matches);
    handleChange();
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return isDesktopNav;
}

export function BottomNav({ user }: { user: User }) {
  void user;
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { access, mode, setMode, workEntryPath } = useUserMode();
  const isDesktopNav = useDesktopNav();

  const items = useMemo(() => buildNavItems(access, pathname, mode, workEntryPath), [access, mode, pathname, workEntryPath]);
  const visibility = useMemo(() => getGlobalNavigationVisibility(access, pathname), [access, pathname]);
  const groups = useMemo(() => navGroupsForMode(mode), [mode]);
  const contextLabel = mode === "work" ? "Trabalho" : visibility.contextLabel;
  const navClassName = `bottom-nav is-${mode === "work" ? "management" : visibility.activeSurface}`;
  const brandLabel = "ATP";

  return (
    <nav className={navClassName} aria-label="Navegacao principal">
      <div className="bottom-nav-brand" aria-label={`Area atual: ${contextLabel}`}>
        <div className="bottom-nav-brand-lockup">
          <img src={logoSymbol} alt="" />
          <span>{brandLabel}</span>
        </div>
        <small className="bottom-nav-context">{contextLabel}</small>
      </div>
      {groups.map((group) => {
        const groupItems = items.filter((item) => item.group === group.id && isVisibleForViewport(item, isDesktopNav));
        if (!groupItems.length) return null;
        return (
        <div className={`bottom-nav-group bottom-nav-group-${group.id}`} key={group.id}>
          <span className="bottom-nav-group-label">{group.label}</span>
          {groupItems.map((item) => {
            const active = isActiveNavItem(item, pathname, isDesktopNav);
            return (
              <button
                key={`${item.group}:${item.label}:${item.path}`}
                className={active ? "active" : ""}
                onClick={() => {
                  if (item.group === "work") setMode("work");
                  if (item.group === "player") setMode("player");
                  navigate(item.path);
                }}
                aria-current={active ? "page" : undefined}
              >
                <span className="nav-icon" aria-hidden>
                  <item.Icon active={active} />
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
        );
      })}
    </nav>
  );
}
