import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { HashRouter, Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { supabase, supabaseConfigured } from "./lib/supabase";
import { fetchProfile } from "./lib/profiles";
import { buildTournamentUrl, joinTournament } from "./lib/tournaments";
import { ToastProvider } from "./components/ToastProvider";
import { UserModeProvider } from "./lib/user-mode";
import type { Profile } from "./lib/types";
import "./App.css";

const BOOT_TIMEOUT_MS = 8000;
const LAST_HASH_ROUTE_KEY = "atp:last-hash-route";
const CHUNK_RECOVERY_KEY = "atp:chunk-recovery-attempt";

const AuthPage = lazy(() => import("./pages/AuthPage").then((module) => ({ default: module.AuthPage })));
const CompleteProfilePage = lazy(() => import("./pages/CompleteProfilePage").then((module) => ({ default: module.CompleteProfilePage })));
const EventsHubPage = lazy(() => import("./pages/EventsHubPage").then((module) => ({ default: module.EventsHubPage })));
const EventsPage = lazy(() => import("./pages/EventsPage").then((module) => ({ default: module.EventsPage })));
const HomePage = lazy(() => import("./pages/HomePage").then((module) => ({ default: module.HomePage })));
const LeagueDetailsPage = lazy(() => import("./pages/LeagueDetailsPage").then((module) => ({ default: module.LeagueDetailsPage })));
const LeagueJoinPage = lazy(() => import("./pages/LeagueJoinPage").then((module) => ({ default: module.LeagueJoinPage })));
const LeaguesPage = lazy(() => import("./pages/LeaguesPage").then((module) => ({ default: module.LeaguesPage })));
const ManagementHubPage = lazy(() => import("./pages/ManagementHubPage").then((module) => ({ default: module.ManagementHubPage })));
const PersonalAgendaPage = lazy(() => import("./pages/PersonalAgendaPage").then((module) => ({ default: module.PersonalAgendaPage })));
const PlacePublicPage = lazy(() => import("./pages/PlacePublicPage").then((module) => ({ default: module.PlacePublicPage })));
const PlaceAdminPage = lazy(() => import("./pages/PlacesPage").then((module) => ({ default: module.PlaceAdminPage })));
const PlacesPage = lazy(() => import("./pages/PlacesPage").then((module) => ({ default: module.PlacesPage })));
const ProfilePage = lazy(() => import("./pages/ProfilePage").then((module) => ({ default: module.ProfilePage })));
const PublicPlayerPage = lazy(() => import("./pages/PublicPlayerPage").then((module) => ({ default: module.PublicPlayerPage })));
const RankingPage = lazy(() => import("./pages/RankingPage").then((module) => ({ default: module.RankingPage })));
const TournamentPage = lazy(() => import("./pages/TournamentPage").then((module) => ({ default: module.TournamentPage })));
const TournamentRegistrationPage = lazy(() => import("./pages/TournamentRegistrationPage").then((module) => ({ default: module.TournamentRegistrationPage })));

function isFilled(value: string | null | undefined): boolean {
  return Boolean(value && value.trim());
}

function hasRequiredLoginData(user: User | null, profile: Profile | null): boolean {
  if (!user) return false;
  if (!isFilled(user.email)) return false;
  if (!profile) return false;
  if (profile.userId !== user.id) return false;
  return (
    isFilled(profile.displayName) &&
    isFilled(profile.phone) &&
    isFilled(profile.city) &&
    isFilled(profile.state) &&
    isFilled(profile.birthDate)
  );
}

function AppLoadingState() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Carregando...</h1>
      </section>
    </main>
  );
}

function isLazyChunkError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error || "");
  return /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|ChunkLoadError|Unable to preload CSS/i.test(message);
}

function recoverFromLazyChunkError(): boolean {
  try {
    const previousAttempt = Number(window.sessionStorage.getItem(CHUNK_RECOVERY_KEY) || "0");
    const now = Date.now();
    if (previousAttempt && now - previousAttempt < 30000) return false;
    window.sessionStorage.setItem(CHUNK_RECOVERY_KEY, String(now));
    const url = new URL(window.location.href);
    url.searchParams.set("app_reload", String(now));
    window.location.replace(url.toString());
    return true;
  } catch {
    window.location.reload();
    return true;
  }
}

function useLazyChunkRecovery() {
  useEffect(() => {
    const onPreloadError = (event: Event) => {
      event.preventDefault();
      recoverFromLazyChunkError();
    };
    window.addEventListener("vite:preloadError", onPreloadError);
    return () => window.removeEventListener("vite:preloadError", onPreloadError);
  }, []);
}

class LazyChunkBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError(error: unknown) {
    if (isLazyChunkError(error)) return { failed: true };
    return { failed: false };
  }

  componentDidCatch(error: unknown) {
    if (isLazyChunkError(error) && recoverFromLazyChunkError()) return;
    throw error;
  }

  render() {
    if (this.state.failed) return <AppLoadingState />;
    return this.props.children;
  }
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
  const location = useLocation();
  const [bootLoading, setBootLoading] = useState(true);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileResolved, setProfileResolved] = useState(false);
  const authUserIdRef = useRef<string | null>(null);
  const profileUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    authUserIdRef.current = authUser?.id ?? null;
  }, [authUser?.id]);

  useEffect(() => {
    profileUserIdRef.current = profile?.userId ?? null;
  }, [profile?.userId]);

  useEffect(() => {
    let mounted = true;
    const client = supabase;
    if (!client) {
      setBootLoading(false);
      return;
    }

    let receivedAuthEvent = false;
    const applyAuthUser = (nextUser: User | null) => {
      if (!nextUser) {
        authUserIdRef.current = null;
        profileUserIdRef.current = null;
        setAuthUser(null);
        setProfile(null);
        setProfileLoading(false);
        setProfileResolved(true);
        return;
      }
      const sameUser = authUserIdRef.current === nextUser.id;
      const profileAlreadyLoaded = profileUserIdRef.current === nextUser.id;
      authUserIdRef.current = nextUser.id;
      setAuthUser((prev) => (prev?.id === nextUser.id && prev.email === nextUser.email ? prev : nextUser));
      if (sameUser && profileAlreadyLoaded) {
        setProfileLoading(false);
        setProfileResolved(true);
        return;
      }
      setProfile((prev) => (prev?.userId === nextUser.id ? prev : null));
      if (!profileAlreadyLoaded) {
        setProfileLoading(true);
        setProfileResolved(false);
      }
    };

    const { data } = client.auth.onAuthStateChange((_event, session) => {
      // Important: do not call async Supabase methods in this callback to avoid deadlocks.
      receivedAuthEvent = true;
      applyAuthUser(session?.user ?? null);
      setBootLoading(false);
    });

    void client.auth
      .getSession()
      .then((sess) => {
        if (!mounted) return;
        if (!receivedAuthEvent) {
          applyAuthUser(sess.data.session?.user ?? null);
        }
        setBootLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        if (!receivedAuthEvent) {
          applyAuthUser(null);
        }
        setBootLoading(false);
      });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const path = `${location.pathname || ""}${location.search || ""}`.trim();
    if (!path || !path.startsWith("/")) return;
    if (path === "/auth" || path.startsWith("/auth?") || path.startsWith("/auth/callback")) return;
    try {
      window.sessionStorage.setItem(LAST_HASH_ROUTE_KEY, path);
    } catch {
      // ignore storage errors
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    let cancelled = false;

    async function loadProfileForUser(user: User) {
      setProfileResolved(false);
      setProfileLoading(true);
      try {
        const p = await withTimeout(fetchProfile(user), BOOT_TIMEOUT_MS, "fetchProfile");
        if (cancelled) return;
        setProfile(p);
      } catch {
        if (!cancelled) setProfile(null);
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
          setProfileResolved(true);
        }
      }
    }

    if (!authUser) {
      setProfile(null);
      setProfileLoading(false);
      setProfileResolved(true);
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
    return <AppLoadingState />;
  }

  if (authUser && profileLoading && !profile) {
    return <AppLoadingState />;
  }

  if (authUser && !profileResolved) {
    return <AppLoadingState />;
  }

  if (!authUser) {
    return (
      <Suspense fallback={<AppLoadingState />}>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="*" element={<AuthRequiredRedirect />} />
        </Routes>
      </Suspense>
    );
  }

  if (!hasRequiredLoginData(authUser, profile)) {
    return (
      <Suspense fallback={<AppLoadingState />}>
        <Routes>
          <Route
            path="/completar-cadastro"
            element={<CompleteProfilePage user={authUser} profile={profile} onProfileChange={onProfileChange} />}
          />
          <Route path="*" element={<Navigate to="/completar-cadastro" replace />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<AppLoadingState />}>
      <UserModeProvider user={authUser}>
      <Routes>
        <Route path="/auth" element={<AuthAlreadySignedInRedirect />} />
        <Route path="/auth/callback" element={<AuthAlreadySignedInRedirect />} />
        <Route path="/completar-cadastro" element={<Navigate to="/inicio" replace />} />
        <Route path="/" element={<Navigate to="/inicio" replace />} />
        <Route path="/jogar" element={<RedirectWithSearch to="/locais" />} />
        <Route path="/competir" element={<RedirectWithSearch to="/eventos" />} />
        <Route path="/trabalho" element={<RedirectWithSearch to="/gestao" />} />
        <Route path="/trabalho/competicoes" element={<RedirectWithSearch to="/eventos" search="?modo=organizing" />} />
        <Route path="/trabalho/atendimento" element={<RedirectWithSearch to="/gestao" />} />
        <Route path="/inicio" element={<HomePage user={authUser} profile={profile} />} />
        <Route path="/competicoes" element={<Navigate to="/eventos" replace />} />
        <Route path="/eventos" element={<EventsHubPage user={authUser} profile={profile} />} />
        <Route path="/eventos/torneios" element={<EventsPage user={authUser} profile={profile} />} />
        <Route path="/eventos/ligas" element={<LeaguesPage user={authUser} profile={profile} />} />
        <Route path="/eventos/ligas/:leagueId" element={<LeagueDetailsPage user={authUser} profile={profile} />} />
        <Route path="/eventos/ligas/inscricao/:token" element={<LeagueJoinPage user={authUser} profile={profile} />} />
        <Route path="/agenda" element={<PersonalAgendaPage user={authUser} profile={profile} />} />
        <Route path="/minhas-reservas" element={<PersonalAgendaPage user={authUser} profile={profile} initialScope="reservas" />} />
        <Route path="/minhas-partidas" element={<PersonalAgendaPage user={authUser} profile={profile} initialScope="partidas" />} />
        <Route path="/minhas-aulas" element={<PersonalAgendaPage user={authUser} profile={profile} initialScope="aulas" />} />
        <Route path="/meus-pagamentos" element={<PersonalAgendaPage user={authUser} profile={profile} initialScope="pagamentos" />} />
        <Route path="/ligas" element={<Navigate to="/eventos/ligas" replace />} />
        <Route path="/ligas/:leagueId" element={<LegacyLeagueDetailsRedirect />} />
        <Route path="/ligas/inscricao/:token" element={<LegacyLeagueJoinRedirect />} />
        <Route path="/gestao" element={<ManagementHubPage user={authUser} profile={profile} />} />
        <Route path="/gestao/:placeId" element={<PlaceAdminPage user={authUser} profile={profile} />} />
        <Route path="/gestao/:placeId/:module" element={<PlaceAdminPage user={authUser} profile={profile} />} />
        <Route path="/locais" element={<PlacesPage user={authUser} profile={profile} />} />
        <Route path="/locais/:placeId/admin" element={<PlaceAdminPage user={authUser} profile={profile} />} />
        <Route path="/locais/:placeId/admin/:module" element={<PlaceAdminPage user={authUser} profile={profile} />} />
        <Route path="/locais/:placeId/:placeIntent" element={<PlacePublicPage user={authUser} profile={profile} />} />
        <Route path="/locais/:placeId" element={<PlacePublicPage user={authUser} profile={profile} />} />
        <Route path="/jogadores/:playerId" element={<PublicPlayerPage user={authUser} profile={profile} />} />
        <Route path="/ranking" element={<RankingPage user={authUser} profile={profile} />} />
        <Route
          path="/perfil"
          element={<ProfilePage user={authUser} profile={profile} onProfileChange={onProfileChange} />}
        />
        <Route path="/eventos/:tournamentId" element={<TournamentRootRedirect />} />
        <Route path="/eventos/:tournamentId/jogos" element={<TournamentPage user={authUser} profile={profile} forcedTab="jogos" />} />
        <Route path="/eventos/:tournamentId/classificacao" element={<TournamentPage user={authUser} profile={profile} forcedTab="classificacao" />} />
        <Route path="/eventos/:tournamentId/organizacao" element={<TournamentPage user={authUser} profile={profile} forcedTab="organizacao" />} />
        <Route path="/eventos/:tournamentId/jogadores" element={<TournamentPage user={authUser} profile={profile} forcedTab="jogadores" />} />
        <Route path="/eventos/:tournamentId/chat" element={<TournamentPage user={authUser} profile={profile} forcedTab="chat" />} />
        <Route path="/inscricao/:tournamentId" element={<TournamentRegistrationPage user={authUser} profile={profile} />} />
        <Route path="/join/:tournamentId" element={<JoinFromLinkPage user={authUser} />} />
        <Route path="/t/:tournamentId" element={<LegacyRedirectPage />} />
        <Route path="/dashboard" element={<Navigate to="/eventos" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </UserModeProvider>
    </Suspense>
  );
}

function RedirectWithSearch({ search = "", to }: { search?: string; to: string }) {
  const location = useLocation();
  const currentSearch = location.search || "";
  const nextSearch = search || currentSearch;
  return <Navigate to={`${to}${nextSearch}`} replace />;
}

function sanitizeNextPath(value: string | null | undefined): string {
  const raw = String(value || "").trim();
  if (!raw.startsWith("/")) return "/inicio";
  if (raw === "/auth" || raw.startsWith("/auth?") || raw.startsWith("/auth/callback")) return "/inicio";
  return raw;
}

function TournamentRootRedirect() {
  const { tournamentId } = useParams();
  const safeId = String(tournamentId || "").trim();
  if (!safeId) return <Navigate to="/eventos" replace />;
  return <Navigate to={`/eventos/${encodeURIComponent(safeId)}/jogos`} replace />;
}

function LegacyLeagueDetailsRedirect() {
  const { leagueId } = useParams();
  const safeId = String(leagueId || "").trim();
  if (!safeId) return <Navigate to="/eventos/ligas" replace />;
  return <Navigate to={`/eventos/ligas/${encodeURIComponent(safeId)}`} replace />;
}

function LegacyLeagueJoinRedirect() {
  const { token } = useParams();
  const safeToken = String(token || "").trim();
  if (!safeToken) return <Navigate to="/eventos/ligas" replace />;
  return <Navigate to={`/eventos/ligas/inscricao/${encodeURIComponent(safeToken)}`} replace />;
}

function readNextFromUrl(): string {
  const search = new URLSearchParams(window.location.search || "");
  const fromSearch = search.get("next");
  if (fromSearch) return sanitizeNextPath(fromSearch);

  const hash = window.location.hash || "";
  const qi = hash.indexOf("?");
  if (qi >= 0) {
    const hashSearch = new URLSearchParams(hash.slice(qi + 1));
    const fromHash = hashSearch.get("next");
    if (fromHash) return sanitizeNextPath(fromHash);
  }
  return "/inicio";
}

function buildAuthNextPath(pathname: string, routeSearch = ""): string {
  const routePath = pathname || "/inicio";
  const routeParams = new URLSearchParams(routeSearch || "");
  const externalParams = new URLSearchParams(window.location.search || "");
  ["next", "code", "error", "error_description", "app_reload"].forEach((key) => externalParams.delete(key));
  externalParams.forEach((value, key) => {
    if (!routeParams.has(key)) routeParams.set(key, value);
  });
  const mergedSearch = routeParams.toString();
  return sanitizeNextPath(`${routePath}${mergedSearch ? `?${mergedSearch}` : ""}`);
}

function AuthRequiredRedirect() {
  const location = useLocation();
  const next = buildAuthNextPath(location.pathname, location.search);
  const query = new URLSearchParams();
  query.set("next", next);
  return <Navigate to={`/auth?${query.toString()}`} replace />;
}

function AuthAlreadySignedInRedirect() {
  const next = readNextFromUrl();
  return <Navigate to={next} replace />;
}

function readOAuthCode(): string | null {
  const fromSearch = new URLSearchParams(window.location.search).get("code");
  if (fromSearch) return fromSearch;

  const hash = window.location.hash || "";
  const queryStart = hash.indexOf("?");
  if (queryStart >= 0) {
    const hashQuery = new URLSearchParams(hash.slice(queryStart + 1));
    const fromHash = hashQuery.get("code");
    if (fromHash) return fromHash;
  }
  return null;
}

function readOAuthError(): string | null {
  const search = new URLSearchParams(window.location.search);
  const searchErr = search.get("error_description") || search.get("error");
  if (searchErr) return searchErr;

  const hash = window.location.hash || "";
  const queryStart = hash.indexOf("?");
  if (queryStart >= 0) {
    const hashQuery = new URLSearchParams(hash.slice(queryStart + 1));
    const hashErr = hashQuery.get("error_description") || hashQuery.get("error");
    if (hashErr) return hashErr;
  }
  return null;
}

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Aguarde enquanto finalizamos a autenticacao com o Google.");

  useEffect(() => {
    let cancelled = false;

    async function finishOAuth() {
      if (!supabase) return;
      const nextPath = readNextFromUrl();

      const existing = await supabase.auth.getSession();
      if (existing.data.session) {
        navigate(nextPath, { replace: true });
        return;
      }

      const authError = readOAuthError();
      if (authError) {
        if (!cancelled) setMessage(`Falha no retorno do Google: ${authError}`);
        return;
      }

      const code = readOAuthCode();
      if (!code) {
        if (!cancelled) setMessage("Não recebemos o código de autenticacao. Volte e tente entrar de novo.");
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        if (!cancelled) setMessage(`Falha ao concluir login: ${error.message}`);
        return;
      }

      if (!cancelled) navigate(nextPath, { replace: true });
    }

    void finishOAuth();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Concluindo login...</h1>
        <p className="auth-sub">{message}</p>
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

function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Pagina nao encontrada</h1>
        <p className="auth-sub">Nao encontramos essa rota. Voce pode voltar para os eventos.</p>
        <div className="auth-actions">
          <button className="primary" onClick={() => navigate("/eventos", { replace: true })}>
            Ir para eventos
          </button>
          <button className="secondary" onClick={() => navigate("/inicio", { replace: true })}>
            Ir para inicio
          </button>
        </div>
      </section>
    </main>
  );
}

function tryRedirectRegistrationFallback(): boolean {
  const hash = window.location.hash || "";
  if (hash.trim()) return false;

  const search = new URLSearchParams(window.location.search || "");
  if (search.get("atp_reg") !== "1") return false;

  // Do not interfere with OAuth callback/search params.
  if (search.get("code") || search.get("error") || search.get("error_description")) return false;

  const tournamentId = (search.get("tournamentId") || "").trim();
  if (!tournamentId) return false;

  const hashQuery = new URLSearchParams();
  const categoryId = (search.get("categoryId") || "").trim();
  const classId = (search.get("classId") || "").trim();
  const categoryName = (search.get("categoryName") || "").trim();
  const className = (search.get("className") || "").trim();
  if (categoryId) hashQuery.set("categoryId", categoryId);
  if (classId) hashQuery.set("classId", classId);
  if (categoryName) hashQuery.set("categoryName", categoryName);
  if (className) hashQuery.set("className", className);

  const targetHash = `#/inscricao/${encodeURIComponent(tournamentId)}${
    hashQuery.toString() ? `?${hashQuery.toString()}` : ""
  }`;
  const target = `${window.location.origin}${window.location.pathname}${targetHash}`;
  window.location.replace(target);
  return true;
}

function tryRestoreLastHashRoute(): boolean {
  const hash = window.location.hash || "";
  if (hash.startsWith("#/") && hash.length > 2) return false;

  const search = new URLSearchParams(window.location.search || "");
  // Do not interfere with OAuth callbacks.
  if (search.get("code") || search.get("error") || search.get("error_description")) return false;
  // Registration fallback has priority.
  if (search.get("atp_reg") === "1") return false;

  let last = "";
  try {
    last = String(window.sessionStorage.getItem(LAST_HASH_ROUTE_KEY) || "").trim();
  } catch {
    // Ignore storage errors and keep the empty fallback.
  }
  if (!last.startsWith("/")) return false;

  const target = `${window.location.origin}${window.location.pathname}#${last}`;
  window.location.replace(target);
  return true;
}

export default function App() {
  useLazyChunkRecovery();

  if (tryRedirectRegistrationFallback() || tryRestoreLastHashRoute()) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <h1>Abrindo inscricao...</h1>
          <p className="auth-sub">Redirecionando para o link do torneio.</p>
        </section>
      </main>
    );
  }
  return (
    <ToastProvider>
      <HashRouter>
        <LazyChunkBoundary>
          <AppInner />
        </LazyChunkBoundary>
      </HashRouter>
    </ToastProvider>
  );
}


