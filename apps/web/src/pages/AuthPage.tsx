import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import logo from "../assets/logo-atp.svg";

export function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "info" | "error" | "success"; text: string } | null>(null);

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
    navigate("/inicio", { replace: true });
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
        : { kind: "success", text: "Conta criada. Faça login." }
    );
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <img src={logo} alt="ATP — Amateur Tennis Platform" className="auth-logo" />
        <h1>Entrar na ATP</h1>
        <p className="auth-sub">Torneios, ligas e ranking pra tenistas amadores.</p>

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
          placeholder="mínimo 6 caracteres"
          autoComplete="current-password"
        />
        <div className="row">
          <button className="primary" disabled={busy} onClick={login}>
            Entrar
          </button>
          <button disabled={busy} onClick={signUp}>
            Criar conta
          </button>
        </div>
        {msg ? <p className={`feedback ${msg.kind === "success" ? "success" : msg.kind === "error" ? "error" : ""}`}>{msg.text}</p> : null}
      </section>
    </main>
  );
}
