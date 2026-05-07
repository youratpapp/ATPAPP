import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { AppShell } from "../components/AppShell";
import { supabase } from "../lib/supabase";
import { upsertProfile, uploadAvatar } from "../lib/profiles";
import type { Profile } from "../lib/types";
import { BRAZILIAN_STATES, listMunicipalitiesByUf, normalizeStateUf } from "../lib/brazil-location";

type Props = {
  user: User;
  profile: Profile | null;
  onProfileChange: (next: Profile) => void;
};

function EditIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export function ProfilePage({ user, profile, onProfileChange }: Props) {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "info" | "error" | "success"; text: string } | null>(null);

  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [city, setCity] = useState(profile?.city ?? "");
  const [stateUf, setStateUf] = useState(normalizeStateUf(profile?.state ?? ""));
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [cityLoading, setCityLoading] = useState(false);
  const [cityLoadError, setCityLoadError] = useState("");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [birthDate, setBirthDate] = useState(profile?.birthDate ?? "");
  const [instagram, setInstagram] = useState(profile?.instagram ?? "");
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

  const photoUrl = profile?.photoUrl ?? "";
  const initials = (profile?.displayName || user.email || "AT")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("") || "AT";

  const onSave = async () => {
    setBusy(true);
    setFeedback(null);
    try {
      const next = await upsertProfile(user, {
        displayName: displayName.trim(),
        city: city.trim(),
        state: normalizedUf,
        phone: phone.trim(),
        birthDate: birthDate.trim(),
        instagram: instagram.trim(),
      });
      onProfileChange(next);
      setEditing(false);
      setFeedback({ kind: "success", text: "Perfil atualizado." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao salvar." });
    } finally {
      setBusy(false);
    }
  };

  const onPickPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setFeedback(null);
    try {
      const url = await uploadAvatar(user, file);
      const next = await upsertProfile(user, { ...profile, photoUrl: url });
      onProfileChange(next);
      setFeedback({ kind: "success", text: "Foto atualizada." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao enviar foto." });
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  };

  const onDeleteAccount = () => {
    alert(
      "Para excluir sua conta, escreva para suporte@atp.tennis com o e-mail desta conta. Em breve haverá fluxo automático."
    );
  };

  const locationLine = [profile?.city, profile?.state].filter(Boolean).join(" - ");

  return (
    <AppShell user={user} profile={profile} showHeader={false}>
      {/* Page header */}
      <div className="page-header">
        <h1>Perfil</h1>
        <div className="ph-actions">
          {!editing && (
            <button
              className="ph-icon-btn"
              onClick={() => setEditing(true)}
              aria-label="Editar perfil"
              title="Editar perfil"
            >
              <EditIcon />
            </button>
          )}
        </div>
      </div>

      {feedback ? (
        <p className={`feedback ${feedback.kind === "success" ? "success" : feedback.kind === "error" ? "error" : ""}`}>
          {feedback.text}
        </p>
      ) : null}

      {/* Photo + name block */}
      <div className="profile-photo-block">
        <div className="profile-photo" style={{ width: 100, height: 100 }}>
          <div className="profile-photo-inner">
            {photoUrl ? <img src={photoUrl} alt="" /> : initials}
          </div>
          <label className="photo-edit" aria-label="Alterar foto" title="Alterar foto">
            <CameraIcon />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onPickPhoto}
              disabled={busy}
            />
          </label>
        </div>
        <p className="profile-name">{profile?.displayName || user.email?.split("@")[0]}</p>
        <p className="profile-location">{locationLine || "Adicione cidade e estado"}</p>
      </div>

      {editing ? (
        <div className="card" style={{ marginBottom: 12 }}>
          <label>Nome de exibição</label>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Como aparece nos torneios" />
          <div className="row">
            <div>
              <label>Cidade</label>
              <select value={city} onChange={(e) => setCity(e.target.value)} disabled={!normalizedUf || cityLoading}>
                <option value="">
                  {!normalizedUf
                    ? "Selecione o estado primeiro"
                    : cityLoading
                    ? "Carregando municipios..."
                    : "Selecione o municipio"}
                </option>
                {cityValueInOptions ? null : city.trim() ? <option value={city}>{city}</option> : null}
                {cityOptions.map((cityName) => (
                  <option key={`profile-city:${cityName}`} value={cityName}>
                    {cityName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>UF</label>
              <select
                value={stateUf}
                onChange={(e) => {
                  const nextUf = normalizeStateUf(e.target.value);
                  setStateUf(nextUf);
                  setCity("");
                }}
              >
                <option value="">Selecione</option>
                {BRAZILIAN_STATES.map((state) => (
                  <option key={`profile-state:${state.uf}`} value={state.uf}>
                    {state.uf} - {state.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {cityLoadError ? <p className="feedback error">{cityLoadError}</p> : null}
          <label>Telefone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(67) 90000-0000" />
          <label>Data de nascimento</label>
          <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          <label>Instagram</label>
          <input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@seuusuario" />
          <div className="row" style={{ marginTop: 16 }}>
            <button onClick={() => setEditing(false)} disabled={busy}>Cancelar</button>
            <button className="primary" onClick={onSave} disabled={busy}>Salvar</button>
          </div>
        </div>
      ) : (
        <div className="profile-rows-card">
          <div className="profile-row">
            <span className="pr-icon"><PhoneIcon /></span>
            <div className="pr-content">
              <p className="pr-label">Telefone</p>
              <p className="pr-value">{profile?.phone || "—"}</p>
            </div>
          </div>
          <div className="profile-row">
            <span className="pr-icon"><MailIcon /></span>
            <div className="pr-content">
              <p className="pr-label">E-mail</p>
              <p className="pr-value">{user.email}</p>
            </div>
          </div>
          <div className="profile-row">
            <span className="pr-icon"><CalendarIcon /></span>
            <div className="pr-content">
              <p className="pr-label">Data de Nascimento</p>
              <p className="pr-value">
                {profile?.birthDate
                  ? new Date(profile.birthDate + "T12:00:00").toLocaleDateString("pt-BR")
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      )}

      {!editing && (
        <div className="profile-rows-card">
          <div
            className="profile-row tappable"
            onClick={() => window.location.assign("mailto:suporte@atp.tennis")}
          >
            <span className="pr-icon"><MessageIcon /></span>
            <div className="pr-content">
              <p className="pr-label">Entrar em Contato</p>
              <p className="pr-value" style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-subtle)" }}>
                Envie uma mensagem para o suporte do Copa Pro.
              </p>
            </div>
            <span className="pr-chevron"><ChevronRight /></span>
          </div>

          {profile?.instagram ? (
            <div
              className="profile-row tappable"
              onClick={() => window.open(`https://instagram.com/${profile.instagram.replace(/^@/, "")}`, "_blank")}
            >
              <span className="pr-icon"><InstagramIcon /></span>
              <div className="pr-content">
                <p className="pr-label">Siga nosso Instagram</p>
                <p className="pr-value" style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-subtle)" }}>
                  Fique por dentro das novidades do Copa Pro.
                </p>
              </div>
              <span className="pr-chevron"><ChevronRight /></span>
            </div>
          ) : (
            <div
              className="profile-row tappable"
              onClick={() => window.open("https://instagram.com", "_blank")}
            >
              <span className="pr-icon"><InstagramIcon /></span>
              <div className="pr-content">
                <p className="pr-label">Siga nosso Instagram</p>
                <p className="pr-value" style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-subtle)" }}>
                  Fique por dentro das novidades do Copa Pro.
                </p>
              </div>
              <span className="pr-chevron"><ChevronRight /></span>
            </div>
          )}

          <div
            className="profile-row tappable"
            onClick={() => alert("Política de privacidade em construção.")}
          >
            <span className="pr-icon"><ShieldIcon /></span>
            <div className="pr-content">
              <p className="pr-label">Política de Privacidade</p>
            </div>
            <span className="pr-chevron"><ChevronRight /></span>
          </div>

          <div className="profile-row tappable" onClick={onDeleteAccount}>
            <span className="pr-icon" style={{ color: "var(--color-danger)" }}><TrashIcon /></span>
            <div className="pr-content">
              <p className="pr-label" style={{ color: "var(--color-danger)" }}>Excluir minha Conta</p>
            </div>
            <span className="pr-chevron"><ChevronRight /></span>
          </div>
        </div>
      )}

      {!editing && (
        <div style={{ marginTop: 16 }}>
          <button
            style={{ width: "100%", color: "var(--color-text-subtle)" }}
            onClick={signOut}
          >
            Sair da conta
          </button>
        </div>
      )}
    </AppShell>
  );
}
