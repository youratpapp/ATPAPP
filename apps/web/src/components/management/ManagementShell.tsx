import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../AppShell";
import type { Profile } from "../../lib/types";
import type { AppSurfaceMode } from "../../lib/role-visibility";
import { useUserMode } from "../../lib/user-mode-context";

type ManagementShellStat = {
  label: string;
  value: string | number;
};

type ManagementShellProps = {
  actions?: ReactNode;
  children: ReactNode;
  description?: string;
  eyebrow?: string;
  profile: Profile | null;
  mode?: AppSurfaceMode;
  stats?: ManagementShellStat[];
  title: string;
  user: User;
};

export function ManagementShell({
  actions,
  children,
  description,
  eyebrow = "Gestao",
  mode = "management",
  profile,
  stats = [],
  title,
  user,
}: ManagementShellProps) {
  const navigate = useNavigate();
  const userMode = useUserMode();
  const showModeSwitch = userMode.isProfessional;

  return (
    <AppShell user={user} profile={profile} showHeader={false} mode={mode}>
      <div className="management-shell-page">
        <header className="management-shell-header">
          <div className="management-shell-title">
            <span>{eyebrow}</span>
            <h1>{title}</h1>
            {description ? <p>{description}</p> : null}
          </div>
          {stats.length ? (
            <div className="management-shell-stats" aria-label="Resumo operacional">
              {stats.map((stat) => (
                <article key={stat.label}>
                  <strong>{stat.value}</strong>
                  <small>{stat.label}</small>
                </article>
              ))}
            </div>
          ) : null}
          {actions || showModeSwitch ? (
            <div className="management-shell-actions">
              {showModeSwitch ? (
                <div className="app-mode-switch" role="group" aria-label="Modo de uso">
                  <button
                    type="button"
                    className={userMode.mode === "player" ? "active" : ""}
                    onClick={() => {
                      userMode.setMode("player");
                      navigate("/inicio");
                    }}
                  >
                    Jogador
                  </button>
                  <button
                    type="button"
                    className={userMode.mode === "work" ? "active" : ""}
                    onClick={() => {
                      userMode.setMode("work");
                    }}
                  >
                    Trabalho
                  </button>
                </div>
              ) : null}
              {actions}
            </div>
          ) : null}
        </header>
        {children}
      </div>
    </AppShell>
  );
}
