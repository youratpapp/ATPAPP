import { useLocation, useNavigate } from "react-router-dom";
import type { ComponentType } from "react";
import type { User } from "@supabase/supabase-js";
import { useMemo } from "react";
import logoMark from "../assets/logo-atp-mark.svg";
import type { WorkspaceAccessSummary } from "../lib/workspace-access";
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

function StarIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
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
  group: "player" | "work" | "account";
  path: string;
  label: string;
  Icon: ComponentType<{ active: boolean }>;
};

const BASE_ITEMS: NavItem[] = [
  { group: "player", path: "/inicio", label: "Inicio", Icon: HomeIcon },
  { group: "player", path: "/eventos", label: "Competir", Icon: TrophyIcon },
  { group: "player", path: "/locais", label: "Locais", Icon: LocationIcon },
  { group: "player", path: "/ranking", label: "Ranking", Icon: StarIcon },
  { group: "account", path: "/perfil", label: "Perfil", Icon: PersonIcon },
];

const GROUPS: Array<{ id: NavItem["group"]; label: string }> = [
  { id: "player", label: "Jogar" },
  { id: "work", label: "Trabalho" },
  { id: "account", label: "Conta" },
];

function buildNavItems(access: WorkspaceAccessSummary, pathname: string, mode: UserMode, workEntryPath: string): NavItem[] {
  const items = mode === "work" ? BASE_ITEMS.filter((item) => item.group === "account") : [...BASE_ITEMS];
  const visibility = getGlobalNavigationVisibility(access, pathname);
  const hasProfessionalEntry = visibility.showCompetitionManagement || visibility.showManagement;

  if (mode === "player" || !hasProfessionalEntry) {
    return items;
  }

  if (access.hasManagement) {
    items.push({
      activePath: "/gestao",
      group: "work",
      path: "/gestao",
      label: "Gestao",
      Icon: ManagementIcon,
    });
  }

  if (access.hasCompetitionManagement) {
    items.push({
      activePath: "/eventos/torneios",
      group: "work",
      path: "/eventos/torneios?view=organizing",
      label: "Organizar",
      Icon: TrophyIcon,
    });
  }

  if (!access.hasManagement && !access.hasCompetitionManagement) {
    items.push({ activePath: workEntryPath.split("?")[0], group: "work", path: workEntryPath, label: "Trabalho", Icon: ManagementIcon });
  }

  return items;
}

export function BottomNav({ user }: { user: User }) {
  void user;
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { access, mode, workEntryPath } = useUserMode();

  const items = useMemo(() => buildNavItems(access, pathname, mode, workEntryPath), [access, mode, pathname, workEntryPath]);
  const visibility = useMemo(() => getGlobalNavigationVisibility(access, pathname), [access, pathname]);
  const contextLabel = mode === "work" ? "Trabalho" : visibility.contextLabel;
  const navClassName = `bottom-nav is-${mode === "work" ? "management" : visibility.activeSurface}`;

  return (
    <nav className={navClassName} aria-label="Navegacao principal">
      <div className="bottom-nav-brand" aria-label={`Area atual: ${contextLabel}`}>
        <img src={logoMark} alt="" />
        <span>{visibility.activeSurface === "management" ? "Gestao esportiva" : "ATP"}</span>
        <small className="bottom-nav-context">{contextLabel}</small>
      </div>
      {GROUPS.map((group) => {
        const groupItems = items.filter((item) => item.group === group.id);
        if (!groupItems.length) return null;
        return (
        <div className={`bottom-nav-group bottom-nav-group-${group.id}`} key={group.id}>
          <span className="bottom-nav-group-label">{group.label}</span>
          {groupItems.map((item) => {
            const activePath = item.activePath || item.path.split("?")[0] || item.path;
            const active = pathname === activePath || pathname.startsWith(`${activePath}/`);
            return (
              <button
                key={item.path}
                className={active ? "active" : ""}
                onClick={() => navigate(item.path)}
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
