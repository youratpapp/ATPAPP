import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "../lib/types";
import { BottomNav } from "./BottomNav";
import logoMark from "../assets/logo-atp-mark.svg";

type Props = {
  user: User;
  profile: Profile | null;
  children: ReactNode;
  showHeader?: boolean;
  onBellClick?: () => void;
};

function initialsFromName(name: string, fallback: string): string {
  const txt = (name || "").trim();
  if (!txt) return fallback.slice(0, 2).toUpperCase();
  const parts = txt.split(/\s+/);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export function AppShell({ user, profile, children, showHeader = true, onBellClick }: Props) {
  const displayName = profile?.displayName || user.email?.split("@")[0] || "Atleta";
  const photo = profile?.photoUrl || "";
  const initials = initialsFromName(profile?.displayName ?? "", user.email ?? "AT");

  return (
    <div className="app-shell">
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
              <img src={logoMark} alt="ATP" className="app-header-mark" />
              {onBellClick ? (
                <button className="icon-btn" onClick={onBellClick} aria-label="Notificações">
                  <span aria-hidden>🔔</span>
                </button>
              ) : null}
            </div>
          </div>
        </header>
      ) : null}
      <main className="app-content">{children}</main>
      <BottomNav />
    </div>
  );
}
