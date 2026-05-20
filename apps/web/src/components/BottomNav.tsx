import { useLocation, useNavigate } from "react-router-dom";
import type { ComponentType } from "react";
import type { User } from "@supabase/supabase-js";
import { useMemo } from "react";
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
  exactActive?: boolean;
  group: "player" | "work" | "account";
  path: string;
  label: string;
  Icon: ComponentType<{ active: boolean }>;
};

const PLAYER_ITEMS: NavItem[] = [
  { group: "player", path: "/inicio", label: "Inicio", Icon: HomeIcon },
  { group: "player", path: "/locais", label: "Jogar", activePaths: ["/locais"], Icon: LocationIcon },
  { group: "player", path: "/eventos", label: "Competir", activePaths: ["/eventos", "/ranking", "/inscricao", "/join", "/t"], Icon: TrophyIcon },
  {
    group: "player",
    path: "/minhas-reservas",
    label: "Agenda",
    activePaths: ["/minhas-reservas", "/minhas-partidas", "/minhas-aulas", "/meus-pagamentos"],
    Icon: CalendarIcon,
  },
  { group: "account", path: "/perfil", label: "Perfil", Icon: PersonIcon },
];

const GROUPS: Array<{ id: NavItem["group"]; label: string }> = [
  { id: "player", label: "Jogar" },
  { id: "work", label: "Trabalho" },
  { id: "account", label: "Conta" },
];

function workItem(path: string, label: string, Icon: ComponentType<{ active: boolean }>, activePaths?: string[], exactActive = false): NavItem {
  return {
    activePath: path.split("?")[0],
    activePaths,
    exactActive,
    group: "work",
    path,
    label,
    Icon,
  };
}

function accountItem(): NavItem {
  return { group: "account", path: "/perfil", label: "Perfil", Icon: PersonIcon };
}

function placePath(access: WorkspaceAccessSummary, module: Parameters<typeof buildPlaceAdminPath>[1], view?: string): string {
  return access.primaryPlaceId ? buildPlaceAdminPath(access.primaryPlaceId, module, view) : "/gestao";
}

function hasPlaceModule(access: WorkspaceAccessSummary, module: Parameters<typeof buildPlaceAdminPath>[1]): boolean {
  return access.primaryPlaceModules.includes(module);
}

function buildNavItems(access: WorkspaceAccessSummary, pathname: string, mode: UserMode, workEntryPath: string): NavItem[] {
  const items = mode === "work" ? [accountItem()] : [...PLAYER_ITEMS];
  const visibility = getGlobalNavigationVisibility(access, pathname);
  const hasProfessionalEntry = visibility.showCompetitionManagement || visibility.showManagement;

  if (mode === "player") return items;

  if (!hasProfessionalEntry) {
    return items;
  }

  const competitionWorkPath = "/eventos?modo=organizing";
  const tournamentWorkPath = "/eventos/torneios?view=organizing";
  const leagueWorkPath = "/eventos/ligas?view=organizing";

  if (!access.hasManagement && access.hasCompetitionManagement) {
    return [
      workItem(workEntryPath, "Hoje", ManagementIcon, ["/gestao"], true),
      workItem(tournamentWorkPath, "Torneios", TrophyIcon, ["/eventos/torneios"]),
      workItem(leagueWorkPath, "Ligas", TrophyIcon, ["/eventos/ligas"]),
      workItem(competitionWorkPath, "Publicacao", ManagementIcon, ["/eventos"]),
      accountItem(),
    ];
  }

  if (access.primaryWorkRole === "coach") {
    if (!hasPlaceModule(access, "academy")) return [workItem("/gestao", "Hoje", ManagementIcon, ["/gestao"], true), accountItem()];
    return [
      workItem("/gestao", "Hoje", ManagementIcon, ["/gestao"], true),
      workItem(placePath(access, "academy", "hoje"), "Aulas", CalendarIcon),
      workItem(placePath(access, "academy", "turmas"), "Turmas", TrophyIcon),
      workItem(placePath(access, "academy", "alunos"), "Alunos", PersonIcon),
      accountItem(),
    ];
  }

  if (access.primaryWorkRole === "frontdesk") {
    const frontdeskItems = [workItem("/gestao", "Hoje", ManagementIcon, ["/gestao"], true)];
    if (hasPlaceModule(access, "bookings")) frontdeskItems.push(workItem(placePath(access, "bookings", "hoje"), "Reservas", CalendarIcon));
    if (hasPlaceModule(access, "clients")) frontdeskItems.push(workItem(placePath(access, "clients", "rotina"), "Clientes", PersonIcon));
    if (hasPlaceModule(access, "academy")) frontdeskItems.push(workItem(placePath(access, "academy", "pendencias"), "Aulas", TrophyIcon));
    return [...frontdeskItems.slice(0, 4), workItem("/gestao", "Mais", ManagementIcon, ["/gestao"], true)];
  }

  if (access.primaryWorkRole === "finance") {
    if (!hasPlaceModule(access, "finance")) return [workItem("/gestao", "Hoje", ManagementIcon, ["/gestao"], true), accountItem()];
    return [
      workItem(placePath(access, "finance", "recebiveis"), "Receber", ManagementIcon),
      workItem(placePath(access, "finance", "pagos"), "Pagos", CalendarIcon),
      workItem(placePath(access, "finance", "despesas"), "Despesas", TrophyIcon),
      workItem(placePath(access, "finance", "resumo"), "Resumo", ManagementIcon),
      accountItem(),
    ];
  }

  if (access.primaryWorkRole === "cashier") {
    if (!hasPlaceModule(access, "canteen")) return [workItem("/gestao", "Hoje", ManagementIcon, ["/gestao"], true), accountItem()];
    return [
      workItem(placePath(access, "canteen", "vender"), "Vender", ManagementIcon),
      workItem(placePath(access, "canteen", "hoje"), "Hoje", CalendarIcon),
      workItem(placePath(access, "canteen", "estoque"), "Estoque", TrophyIcon),
      workItem(placePath(access, "canteen", "produtos"), "Produtos", ManagementIcon),
      accountItem(),
    ];
  }

  if (access.primaryWorkRole === "operator") {
    const operatorItems = [workItem("/gestao", "Hoje", ManagementIcon, ["/gestao"], true)];
    if (access.hasManagement) operatorItems.push(workItem("/gestao", "Locais", LocationIcon, ["/gestao"], true));
    if (access.hasCompetitionManagement) operatorItems.push(workItem(competitionWorkPath, "Competir", TrophyIcon, ["/eventos"]));
    return [...operatorItems.slice(0, 4), accountItem()];
  }

  const managerItems = [workItem("/gestao", "Hoje", ManagementIcon, ["/gestao"], true)];
  if (hasPlaceModule(access, "bookings")) managerItems.push(workItem(placePath(access, "bookings", "hoje"), "Agenda", CalendarIcon));
  if (hasPlaceModule(access, "academy")) managerItems.push(workItem(placePath(access, "academy", "hoje"), "Aulas", TrophyIcon));
  if (hasPlaceModule(access, "finance")) managerItems.push(workItem(placePath(access, "finance", "recebiveis"), "Financeiro", ManagementIcon));
  if (access.hasCompetitionManagement && managerItems.length < 4) managerItems.push(workItem(competitionWorkPath, "Competir", TrophyIcon, ["/eventos"]));
  return [...managerItems.slice(0, 4), workItem("/gestao", "Mais", PersonIcon, ["/gestao"], true)];
}

function isActiveNavItem(item: NavItem, pathname: string): boolean {
  const candidates = item.activePaths || [item.activePath || item.path.split("?")[0] || item.path];
  if (item.exactActive) return candidates.some((activePath) => pathname === activePath);
  return candidates.some((activePath) => pathname === activePath || pathname.startsWith(`${activePath}/`));
}

export function BottomNav({ user }: { user: User }) {
  void user;
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { access, mode, setMode, workEntryPath } = useUserMode();

  const items = useMemo(() => buildNavItems(access, pathname, mode, workEntryPath), [access, mode, pathname, workEntryPath]);
  const visibility = useMemo(() => getGlobalNavigationVisibility(access, pathname), [access, pathname]);
  const contextLabel = mode === "work" ? "Trabalho" : visibility.contextLabel;
  const navClassName = `bottom-nav is-${mode === "work" ? "management" : visibility.activeSurface}`;
  const brandLabel = mode === "work" ? "ATP Trabalho" : visibility.activeSurface === "management" ? "Gestao esportiva" : "ATP";

  return (
    <nav className={navClassName} aria-label="Navegacao principal">
      <div className="bottom-nav-brand" aria-label={`Area atual: ${contextLabel}`}>
        <img src={logoSymbol} alt="" />
        <span>{brandLabel}</span>
        <small className="bottom-nav-context">{contextLabel}</small>
      </div>
      {GROUPS.map((group) => {
        const groupItems = items.filter((item) => item.group === group.id);
        if (!groupItems.length) return null;
        return (
        <div className={`bottom-nav-group bottom-nav-group-${group.id}`} key={group.id}>
          <span className="bottom-nav-group-label">{group.label}</span>
          {groupItems.map((item) => {
            const active = isActiveNavItem(item, pathname);
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
