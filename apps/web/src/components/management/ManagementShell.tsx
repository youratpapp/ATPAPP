import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../AppShell";
import type { Profile } from "../../lib/types";
import type { AppSurfaceMode } from "../../lib/role-visibility";

type ManagementShellStat = {
  label: string;
  value: string | number;
};

type ManagementBreadcrumb = {
  label: string;
  path?: string;
};

type ManagementShellProps = {
  actions?: ReactNode;
  breadcrumbs?: ManagementBreadcrumb[];
  children: ReactNode;
  compact?: boolean;
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
  breadcrumbs = [],
  children,
  compact = false,
  description,
  eyebrow = "Gestao",
  mode = "management",
  profile,
  stats = [],
  title,
  user,
}: ManagementShellProps) {
  const navigate = useNavigate();

  return (
    <AppShell user={user} profile={profile} showHeader mode={mode}>
      <div className={`management-shell-page${compact ? " management-shell-page--compact" : ""}`}>
        {compact ? <h1 className="management-shell-sr-title">{title}</h1> : null}
        {compact ? null : (
        <header className="management-shell-header">
          <div className="management-shell-title">
            {breadcrumbs.length ? (
              <nav className="management-shell-breadcrumb" aria-label="Contexto da area de trabalho">
                {breadcrumbs.map((item, index) =>
                  item.path ? (
                    <button key={`${item.label}:${index}`} type="button" onClick={() => navigate(item.path!)}>
                      {item.label}
                    </button>
                  ) : (
                    <span key={`${item.label}:${index}`}>{item.label}</span>
                  )
                )}
              </nav>
            ) : null}
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
          {actions ? <div className="management-shell-actions">{actions}</div> : null}
        </header>
        )}
        {children}
      </div>
    </AppShell>
  );
}
