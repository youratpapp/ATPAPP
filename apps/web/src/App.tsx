import { useCallback, useEffect, useState } from "react";
import { HashRouter, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { supabase, supabaseConfigured } from "./lib/supabase";
import { fetchProfile } from "./lib/profiles";
import { buildTournamentUrl, joinTournament } from "./lib/tournaments";
import type { Profile } from "./lib/types";
import { AuthPage } from "./pages/AuthPage";
import { HomePage } from "./pages/HomePage";
import { EventsPage } from "./pages/EventsPage";
import { PlacesPage } from "./pages/PlacesPage";
import { RankingPage } from "./pages/RankingPage";
import { ProfilePage } from "./pages/ProfilePage";
import { TournamentPage } from "./pages/TournamentPage";
import { TournamentRegistrationPage } from "./pages/TournamentRegistrationPage";
import { CompleteProfilePage } from "./pages/CompleteProfilePage";
import "./App.css";

const BOOT_TIMEOUT_MS = 8000;

function isFilled(value: string | null | undefined): boolean {
  return Boolean(value && value.trim());
}

function hasRequiredLoginData(user: User | null, profile: Profile | null): boolean {
  if (!user) return false;
  if (!isFilled(user.email)) return false;
  if (!profile) return false;
  return (
    isFilled(profile.displayName) &&
    isFilled(profile.phone) &&
    isFilled(profile.city) &&
    isFilled(profile.state)
  );
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(`${label} timeout`)), timeoutMs);
    promise
      .then((value) => {
        window.clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        window.clearTimeout(timer);
        reject(err);
      });
  });
}

function AppInner() {
  const [bootLoading, setBootLoading] = useState(true);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const client = supabase;
    if (!client) {
      setBootLoading(false);
      return;
    }

    async function start(currentClient: NonNullable<typeof supabase>) {
      try {
        const sess = await withTimeout(
          currentClient.auth.getSession(),
          BOOT_TIMEOUT_MS,
          "auth.getSession"
        );
        if (!mounted) return;
        setAuthUser(sess.data.session?.user ?? null);
      } catch {
        if (mounted) setAuthUser(null);
      } finally {
        if (mounted) setBootLoading(false);
      }
    }
    start(client);

    const { data } = client.auth.onAuthStateChange((_event, session) => {
      // Important: do not call async Supabase methods in this callback to avoid deadlocks.
      setAuthUser(session?.user ?? null);
      setBootLoading(false);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadProfileForUser(user: User) {
      setProfileLoading(true);
      try {
        const p = await withTimeout(fetchProfile(user), BOOT_TIMEOUT_MS, "fetchProfile");
        if (cancelled) return;
        setProfile(p);
      } catch {
        if (!cancelled) setProfile(null);
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    }

    if (!authUser) {
      setProfile(null);
      setProfileLoading(false);
      return () => {
        cancelled = true;
      };
    }

    loadProfileForUser(authUser);

    return () => {
      cancelled = true;
    };
  }, [authUser]);

  const onProfileChange = useCallback((next: Profile) => {
    setProfile(next);
  }, []);

  if (!supabaseConfigured) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <h1>Configuracao necessaria</h1>
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
          <h1>Carregando...</h1>
        </section>
      </main>
    );
  }

  if (authUser && profileLoading && !profile) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <h1>Carregando...</h1>
        </section>
      </main>
    );
  }

  if (!authUser) {
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  if (!hasRequiredLoginData(authUser, profile)) {
    return (
      <Routes>
        <Route
          path="/completar-cadastro"
          element={<CompleteProfilePage user={authUser} profile={profile} onProfileChange={onProfileChange} />}
        />
        <Route path="*" element={<Navigate to="/completar-cadastro" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/auth/callback" element={<Navigate to="/inicio" replace />} />
      <Route path="/completar-cadastro" element={<Navigate to="/inicio" replace />} />
      <Route path="/inicio" element={<HomePage user={authUser} profile={profile} />} />
      <Route path="/eventos" element={<EventsPage user={authUser} profile={profile} />} />
      <Route path="/locais" element={<PlacesPage user={authUser} profile={profile} />} />
      <Route path="/ranking" element={<RankingPage user={authUser} profile={profile} />} />
      <Route
        path="/perfil"
        element={<ProfilePage user={authUser} profile={profile} onProfileChange={onProfileChange} />}
      />
      <Route path="/eventos/:tournamentId" element={<TournamentPage user={authUser} profile={profile} />} />
      <Route path="/inscricao/:tournamentId" element={<TournamentRegistrationPage user={authUser} profile={profile} />} />
      <Route path="/join/:tournamentId" element={<JoinFromLinkPage user={authUser} />} />
      <Route path="/t/:tournamentId" element={<LegacyRedirectPage />} />
      <Route path="/dashboard" element={<Navigate to="/eventos" replace />} />
      <Route path="*" element={<Navigate to="/inicio" replace />} />
    </Routes>
  );
}

function AuthCallbackPage() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Concluindo login...</h1>
        <p className="auth-sub">Aguarde enquanto finalizamos a autenticacao com o Google.</p>
      </section>
    </main>
  );
}

function JoinFromLinkPage({ user }: { user: User }) {
  const navigate = useNavigate();
  const { tournamentId } = useParams();
  const [msg, setMsg] = useState("Processando convite...");

  useEffect(() => {
    async function run() {
      if (!supabase || !tournamentId) return;
      try {
        await joinTournament(user, tournamentId);
        navigate(buildTournamentUrl(tournamentId), { replace: true });
      } catch (err) {
        setMsg(err instanceof Error ? err.message : "Falha ao entrar no torneio.");
      }
    }
    run();
  }, [navigate, tournamentId, user]);

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
  const navigate = useNavigate();
  const { tournamentId } = useParams();
  useEffect(() => {
    if (!tournamentId) {
      navigate("/eventos", { replace: true });
      return;
    }
    navigate(buildTournamentUrl(tournamentId), { replace: true });
  }, [navigate, tournamentId]);
  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Abrindo torneio...</h1>
        <p className="auth-sub">Redirecionando para o novo fluxo.</p>
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

