import { useCallback, useEffect, useState } from "react";
import { HashRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { supabase, supabaseConfigured } from "./lib/supabase";
import { fetchProfile, upsertProfile } from "./lib/profiles";
import { joinTournament, buildLegacyUrl } from "./lib/tournaments";
import type { Profile } from "./lib/types";
import { AuthPage } from "./pages/AuthPage";
import { HomePage } from "./pages/HomePage";
import { EventsPage } from "./pages/EventsPage";
import { PlacesPage } from "./pages/PlacesPage";
import { RankingPage } from "./pages/RankingPage";
import { ProfilePage } from "./pages/ProfilePage";
import "./App.css";

function AppInner() {
  const [bootLoading, setBootLoading] = useState(true);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let mounted = true;
    const client = supabase;
    if (!client) {
      setBootLoading(false);
      return;
    }

    async function start(currentClient: NonNullable<typeof supabase>) {
      const sess = await currentClient.auth.getSession();
      if (!mounted) return;
      const u = sess.data.session?.user ?? null;
      setAuthUser(u);
      if (u) {
        try {
          const p = await fetchProfile(u);
          if (!p.displayName) {
            // primeiro acesso: cria perfil com fallback do email
            const fallback = u.email?.split("@")[0] ?? "Atleta";
            const created = await upsertProfile(u, { displayName: fallback });
            if (!mounted) return;
            setProfile(created);
          } else if (mounted) {
            setProfile(p);
          }
        } catch {
          // tabela profiles ainda não criada — segue sem perfil
        }
      }
      if (mounted) setBootLoading(false);
    }
    start(client);

    const { data } = client.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setAuthUser(u);
      if (!u) {
        setProfile(null);
      } else {
        try {
          const p = await fetchProfile(u);
          setProfile(p);
        } catch {
          setProfile(null);
        }
      }
      setBootLoading(false);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const onProfileChange = useCallback((next: Profile) => {
    setProfile(next);
  }, []);

  if (!supabaseConfigured) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <h1>Configuração necessária</h1>
          <p className="auth-sub">
            Configure o Supabase em <code>apps/web/.env</code> usando <code>.env.example</code>.
          </p>
        </section>
      </main>
    );
  }

  if (bootLoading) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <h1>Carregando…</h1>
        </section>
      </main>
    );
  }

  if (!authUser) {
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/inicio" element={<HomePage user={authUser} profile={profile} />} />
      <Route path="/eventos" element={<EventsPage user={authUser} profile={profile} />} />
      <Route path="/locais" element={<PlacesPage user={authUser} profile={profile} />} />
      <Route path="/ranking" element={<RankingPage user={authUser} profile={profile} />} />
      <Route
        path="/perfil"
        element={<ProfilePage user={authUser} profile={profile} onProfileChange={onProfileChange} />}
      />
      <Route path="/join/:tournamentId" element={<JoinFromLinkPage user={authUser} />} />
      <Route path="/t/:tournamentId" element={<LegacyRedirectPage />} />
      <Route path="/dashboard" element={<Navigate to="/eventos" replace />} />
      <Route path="*" element={<Navigate to="/inicio" replace />} />
    </Routes>
  );
}

function JoinFromLinkPage({ user }: { user: User }) {
  const { tournamentId } = useParams();
  const [msg, setMsg] = useState("Processando convite…");

  useEffect(() => {
    async function run() {
      if (!supabase || !tournamentId) return;
      try {
        await joinTournament(user, tournamentId);
        window.location.replace(buildLegacyUrl(tournamentId));
      } catch (err) {
        setMsg(err instanceof Error ? err.message : "Falha ao entrar no torneio.");
      }
    }
    run();
  }, [tournamentId, user]);

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Convite</h1>
        <p className="auth-sub">{msg}</p>
      </section>
    </main>
  );
}

function LegacyRedirectPage() {
  const { tournamentId } = useParams();
  useEffect(() => {
    window.location.replace(buildLegacyUrl(tournamentId));
  }, [tournamentId]);
  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Abrindo torneio…</h1>
        <p className="auth-sub">Redirecionando para o modo completo.</p>
      </section>
    </main>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppInner />
    </HashRouter>
  );
}
