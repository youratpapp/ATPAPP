import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { upsertProfile } from "../lib/profiles";
import { supabase } from "../lib/supabase";
import type { Profile } from "../lib/types";
import { BRAZILIAN_STATES, listMunicipalitiesByUf, normalizeStateUf } from "../lib/brazil-location";

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
  const [birthDate, setBirthDate] = useState(profile?.birthDate ?? "");
  const [city, setCity] = useState(profile?.city ?? "");
  const [stateUf, setStateUf] = useState(normalizeStateUf(profile?.state ?? ""));
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [cityLoading, setCityLoading] = useState(false);
  const [cityLoadError, setCityLoadError] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  const missingEmail = useMemo(() => isBlank(user.email), [user.email]);
  const normalizedUf = useMemo(() => normalizeStateUf(stateUf), [stateUf]);
  const cityValueInOptions = useMemo(
    () => cityOptions.some((item) => item.toLowerCase() === city.trim().toLowerCase()),
    [city, cityOptions]
  );

  useEffect(() => {
    let cancelled = false;
    if (!normalizedUf) {
      setCityOptions([]);
      setCityLoadError("");
      return () => {
        cancelled = true;
      };
    }

    setCityLoading(true);
    setCityLoadError("");
    listMunicipalitiesByUf(normalizedUf)
      .then((rows) => {
        if (cancelled) return;
        setCityOptions(rows);
      })
      .catch(() => {
        if (cancelled) return;
        setCityOptions([]);
        setCityLoadError("Nao foi possivel carregar os municipios desta UF.");
      })
      .finally(() => {
        if (!cancelled) setCityLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [normalizedUf]);

  const onSave = async () => {
    setMsg(null);
    if (missingEmail) {
      setMsg({ kind: "error", text: "Nao foi possivel identificar seu e-mail. Tente entrar novamente." });
      return;
    }

    const cleanedName = displayName.trim();
    const cleanedPhone = phone.trim();
    const cleanedBirthDate = birthDate.trim();
    const cleanedCity = city.trim();
    const cleanedState = normalizedUf;

    if (!cleanedName || !cleanedPhone || !cleanedBirthDate || !cleanedCity || !cleanedState) {
      setMsg({ kind: "error", text: "Preencha Nome, Telefone, Data de nascimento, Cidade e Estado (UF)." });
      return;
    }

    setBusy(true);
    try {
      const next = await upsertProfile(user, {
        displayName: cleanedName,
        phone: cleanedPhone,
        birthDate: cleanedBirthDate,
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
        <p className="auth-sub">Precisamos de Nome, E-mail, Telefone, Data de nascimento, Cidade e Estado para liberar o acesso.</p>

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

        <label htmlFor="complete-birth-date">Data de nascimento</label>
        <input
          id="complete-birth-date"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
        />

        <div className="row">
          <div>
            <label htmlFor="complete-state">Estado (UF)</label>
            <select
              id="complete-state"
              value={stateUf}
              onChange={(e) => {
                const nextUf = normalizeStateUf(e.target.value);
                setStateUf(nextUf);
                setCity("");
              }}
              autoComplete="address-level1"
            >
              <option value="">Selecione</option>
              {BRAZILIAN_STATES.map((state) => (
                <option key={`complete-state:${state.uf}`} value={state.uf}>
                  {state.uf} - {state.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="complete-city">Cidade</label>
            <select
              id="complete-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              autoComplete="address-level2"
              disabled={!normalizedUf || cityLoading}
            >
              <option value="">
                {!normalizedUf
                  ? "Selecione o estado primeiro"
                  : cityLoading
                  ? "Carregando municipios..."
                  : "Selecione o municipio"}
              </option>
              {cityValueInOptions ? null : city.trim() ? <option value={city}>{city}</option> : null}
              {cityOptions.map((cityName) => (
                <option key={`complete-city:${cityName}`} value={cityName}>
                  {cityName}
                </option>
              ))}
            </select>
          </div>
        </div>
        {cityLoadError ? <p className="feedback error">{cityLoadError}</p> : null}

        <div className="row" style={{ marginTop: 16 }}>
          <button onClick={onSignOut} disabled={busy}>Sair</button>
          <button className="primary" onClick={onSave} disabled={busy}>Salvar e continuar</button>
        </div>

        {msg ? <p className={`feedback ${msg.kind === "success" ? "success" : "error"}`}>{msg.text}</p> : null}
      </section>
    </main>
  );
}
