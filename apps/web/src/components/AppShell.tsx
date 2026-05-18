import { useEffect, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { useLocation, useNavigate } from "react-router-dom";
import type { Profile } from "../lib/types";
import { BottomNav } from "./BottomNav";
import { AppPopover } from "./AppOverlays";
import logoSymbol from "../assets/logo-atp-symbol.svg";
import { getRouteExperienceMode, getRouteSurfaceMode, type AppSurfaceMode } from "../lib/role-visibility";
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
  const displayName = profile?.displayName || user.email?.split("@")[0] || "Atleta";
  const photo = profile?.photoUrl || "";
  const initials = initialsFromName(profile?.displayName ?? "", user.email ?? "AT");

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
      {showHeader ? (
        <header className="app-header">
          <div className="app-header-inner">
            <div className="app-header-greeting">
              <div className="avatar" aria-hidden>
                {photo ? <img src={photo} alt="" /> : initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <p className="greeting-label">Bem-vindo</p>
                <p className="greeting-name">{displayName}</p>
              </div>
            </div>
            <div className="app-header-actions">
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
      ) : null}
      <main className="app-content">{children}</main>
      <BottomNav user={user} />
    </div>
  );
}
