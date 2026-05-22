import { useEffect, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { useLocation, useNavigate } from "react-router-dom";
import type { Profile } from "../lib/types";
import { BottomNav } from "./BottomNav";
import { AppPopover } from "./AppOverlays";
import logoSymbol from "../assets/logo-atp-symbol.svg";
import { buildPlaceAdminPath } from "../lib/place-admin-navigation";
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
                  <span>Buscar cliente, reserva, aula, pagamento...</span>
                </div>
                <button
                  className="work-create-btn"
                  type="button"
                  onClick={() => {
                    const targetPlaceId = activePlaceId || userMode.access.primaryPlaceId;
                    if (targetPlaceId) navigate(buildPlaceAdminPath(targetPlaceId, "bookings", "nova-reserva"));
                  }}
                >
                  + Criar
                </button>
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
