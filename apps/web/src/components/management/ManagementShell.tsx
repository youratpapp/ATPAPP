import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { AppShell } from "../AppShell";
import type { Profile } from "../../lib/types";

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
  stats?: ManagementShellStat[];
  title: string;
  user: User;
};

export function ManagementShell({
  actions,
  children,
  description,
  eyebrow = "Gestao",
  profile,
  stats = [],
  title,
  user,
}: ManagementShellProps) {
  return (
    <AppShell user={user} profile={profile} showHeader={false}>
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
          {actions ? <div className="management-shell-actions">{actions}</div> : null}
        </header>
        {children}
      </div>
    </AppShell>
  );
}
