import { useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { upsertProfile } from "../lib/profiles";
import { supabase } from "../lib/supabase";
import type { Profile } from "../lib/types";

type Props = {
  user: User;
  profile: Profile | null;
  onProfileChange: (next: Profile) => void;
};

function isBlank(value: string | null | undefined): boolean {
  return !value || !value.trim();
}

export function CompleteProfilePage({ user, profile, onProfileChange }: Props) {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [city, setCity] = useState(profile?.city ?? "");
  const [stateUf, setStateUf] = useState(profile?.state ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  const missingEmail = useMemo(() => isBlank(user.email), [user.email]);

  const onSave = async () => {
    setMsg(null);
    if (missingEmail) {
      setMsg({ kind: "error", text: "Nao foi possivel identificar seu e-mail. Tente entrar novamente." });
      return;
    }

    const cleanedName = displayName.trim();
    const cleanedPhone = phone.trim();
    const cleanedCity = city.trim();
    const cleanedState = stateUf.trim().toUpperCase().slice(0, 2);

    if (!cleanedName || !cleanedPhone || !cleanedCity || !cleanedState) {
      setMsg({ kind: "error", text: "Preencha Nome, Telefone, Cidade e Estado (UF)." });
      return;
    }

    setBusy(true);
    try {
      const next = await upsertProfile(user, {
        displayName: cleanedName,
        phone: cleanedPhone,
        city: cleanedCity,
        state: cleanedState,
      });
      onProfileChange(next);
      setMsg({ kind: "success", text: "Cadastro concluido com sucesso." });
      navigate("/inicio", { replace: true });
    } catch (err) {
      setMsg({ kind: "error", text: err instanceof Error ? err.message : "Falha ao salvar cadastro." });
    } finally {
      setBusy(false);
    }
  };

  const onSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Complete seu cadastro</h1>
        <p className="auth-sub">Precisamos de Nome, E-mail, Telefone, Cidade e Estado para liberar o acesso.</p>

        <label htmlFor="complete-name">Nome</label>
        <input
          id="complete-name"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Nome completo"
          autoComplete="name"
        />

        <label htmlFor="complete-email">E-mail</label>
        <input
          id="complete-email"
          type="email"
          value={user.email ?? ""}
          readOnly
          className="auth-readonly"
        />

        <label htmlFor="complete-phone">Telefone</label>
        <input
          id="complete-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(67) 99999-9999"
          autoComplete="tel"
          inputMode="tel"
        />

        <div className="row">
          <div>
            <label htmlFor="complete-city">Cidade</label>
            <input
              id="complete-city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ex.: Dourados"
              autoComplete="address-level2"
            />
          </div>
          <div>
            <label htmlFor="complete-state">Estado (UF)</label>
            <input
              id="complete-state"
              type="text"
              value={stateUf}
              onChange={(e) => setStateUf(e.target.value.toUpperCase())}
              placeholder="MS"
              autoComplete="address-level1"
              maxLength={2}
            />
          </div>
        </div>

        <div className="row" style={{ marginTop: 16 }}>
          <button onClick={onSignOut} disabled={busy}>Sair</button>
          <button className="primary" onClick={onSave} disabled={busy}>Salvar e continuar</button>
        </div>

        {msg ? <p className={`feedback ${msg.kind === "success" ? "success" : "error"}`}>{msg.text}</p> : null}
      </section>
    </main>
  );
}
