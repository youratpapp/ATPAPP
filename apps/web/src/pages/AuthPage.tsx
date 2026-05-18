import { useState, type CSSProperties } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import logo from "../assets/logo-atp.svg";
import authCourtImage from "../assets/visual-court-night.svg";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.3 6.2 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.8 15.1 19 12 24 12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.3 6.2 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.4 0 10.1-2.1 13.5-5.5l-6.2-5.2c-2.1 1.6-4.6 2.7-7.3 2.7-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.6 39.5 16.3 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-4 5.3l6.2 5.2C37.1 38.9 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "info" | "error" | "success"; text: string } | null>(null);
  const nextPath = (() => {
    const q = new URLSearchParams(location.search || "");
    const raw = String(q.get("next") || "").trim();
    if (!raw.startsWith("/")) return "/inicio";
    if (raw === "/auth" || raw.startsWith("/auth?") || raw.startsWith("/auth/callback")) return "/inicio";
    return raw;
  })();

  const login = async () => {
    if (!supabase) return;
    setBusy(true);
    setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      setMsg({ kind: "error", text: error.message || "Falha no login." });
      return;
    }
    navigate(nextPath, { replace: true });
  };

  const signUp = async () => {
    if (!supabase) return;
    setBusy(true);
    setMsg(null);
    const { error } = await supabase.auth.signUp({ email: email.trim(), password });
    setBusy(false);
    setMsg(
      error
        ? { kind: "error", text: error.message || "Falha ao criar conta." }
        : { kind: "success", text: "Conta criada. Verifique seu e-mail e depois entre." }
    );
  };

  const loginWithGoogle = async () => {
    if (!supabase) return;
    setBusy(true);
    setMsg(null);
    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch {
      // ignore local cleanup errors and continue with OAuth
    }
    const redirectTo = `${window.location.origin}${window.location.pathname}#/auth/callback?next=${encodeURIComponent(nextPath)}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          prompt: "select_account",
        },
      },
    });
    setBusy(false);
    if (error) {
      setMsg({ kind: "error", text: error.message || "Falha no login com Google." });
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-stage" style={{ "--auth-image": `url(${authCourtImage})` } as CSSProperties}>
        <aside className="auth-brand-panel" aria-label="ATP">
          <img src={logo} alt="ATP - Amateur Tennis Platform" className="auth-brand-logo" />
          <div>
            <h2>Sua jornada no tenis amador comeca aqui.</h2>
            <p>Torneios, ligas, reservas e ranking em uma experiencia simples para jogar mais.</p>
          </div>
          <ul>
            <li><span>Torneios</span><small>Encontre disputas no seu nivel.</small></li>
            <li><span>Ligas</span><small>Acompanhe rodadas e resultados.</small></li>
            <li><span>Ranking</span><small>Veja sua evolucao em quadra.</small></li>
          </ul>
        </aside>
        <section className="auth-card">
          <img src={logo} alt="ATP - Amateur Tennis Platform" className="auth-logo" />
          <h1>Entrar na ATP</h1>
          <p className="auth-sub">Torneios, ligas e ranking para tenistas amadores.</p>

          <button className="auth-google-btn" disabled={busy} onClick={loginWithGoogle}>
            <GoogleIcon />
            <span>Continuar com Google</span>
          </button>

          <div className="auth-divider"><span>ou entre com e-mail</span></div>

          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@email.com"
            autoComplete="email"
          />
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="minimo 6 caracteres"
            autoComplete="current-password"
          />
          <div className="auth-actions">
            <button className="primary" disabled={busy || !email.trim() || !password.trim()} onClick={login}>
              Entrar
            </button>
            <button className="secondary" disabled={busy || !email.trim() || password.trim().length < 6} onClick={signUp}>
              Criar conta
            </button>
          </div>
          {msg ? <p className={`feedback ${msg.kind === "success" ? "success" : msg.kind === "error" ? "error" : ""}`}>{msg.text}</p> : null}
        </section>
      </section>
    </main>
  );
}
