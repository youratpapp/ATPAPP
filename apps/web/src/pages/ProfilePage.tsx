import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { AppShell } from "../components/AppShell";
import { supabase } from "../lib/supabase";
import { upsertProfile, uploadAvatar } from "../lib/profiles";
import type { Profile } from "../lib/types";

type Props = {
  user: User;
  profile: Profile | null;
  onProfileChange: (next: Profile) => void;
};

export function ProfilePage({ user, profile, onProfileChange }: Props) {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "info" | "error" | "success"; text: string } | null>(null);

  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [city, setCity] = useState(profile?.city ?? "");
  const [stateUf, setStateUf] = useState(profile?.state ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [birthDate, setBirthDate] = useState(profile?.birthDate ?? "");
  const [instagram, setInstagram] = useState(profile?.instagram ?? "");

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
        state: stateUf.trim().toUpperCase().slice(0, 2),
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
    <AppShell user={user} profile={profile}>
      <div className="section-title">
        <h2>Perfil</h2>
        <div className="cluster">
          {!editing ? (
            <button className="primary" onClick={() => setEditing(true)}>
              Editar
            </button>
          ) : null}
          <button onClick={signOut}>Sair</button>
        </div>
      </div>

      {feedback ? (
        <p className={`feedback ${feedback.kind === "success" ? "success" : feedback.kind === "error" ? "error" : ""}`}>
          {feedback.text}
        </p>
      ) : null}

      <div className="card">
        <div className="profile-photo-block">
          <label className="profile-photo" aria-label="Foto de perfil">
            {photoUrl ? <img src={photoUrl} alt="" /> : initials}
            <span className="photo-edit" aria-hidden>📷</span>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onPickPhoto}
              disabled={busy}
            />
          </label>
          <p className="profile-name">{profile?.displayName || user.email?.split("@")[0]}</p>
          <p className="profile-location">{locationLine || "Adicione cidade e estado"}</p>
        </div>

        {editing ? (
          <>
            <label>Nome de exibição</label>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Como aparece nos torneios" />
            <div className="row">
              <div>
                <label>Cidade</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ex.: Dourados" />
              </div>
              <div>
                <label>UF</label>
                <input value={stateUf} onChange={(e) => setStateUf(e.target.value)} placeholder="MS" maxLength={2} />
              </div>
            </div>
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
          </>
        ) : (
          <>
            <div className="profile-row">
              <span className="pr-icon" aria-hidden>📞</span>
              <div>
                <p className="pr-label">Telefone</p>
                <p className="pr-value">{profile?.phone || "—"}</p>
              </div>
            </div>
            <div className="profile-row">
              <span className="pr-icon" aria-hidden>✉</span>
              <div>
                <p className="pr-label">E-mail</p>
                <p className="pr-value">{user.email}</p>
              </div>
            </div>
            <div className="profile-row">
              <span className="pr-icon" aria-hidden>🎂</span>
              <div>
                <p className="pr-label">Data de nascimento</p>
                <p className="pr-value">
                  {profile?.birthDate
                    ? new Date(profile.birthDate).toLocaleDateString("pt-BR")
                    : "—"}
                </p>
              </div>
            </div>
            <div
              className="profile-row tappable"
              onClick={() => window.location.assign("mailto:suporte@atp.tennis")}
            >
              <span className="pr-icon" aria-hidden>💬</span>
              <div>
                <p className="pr-label">Entrar em contato</p>
                <p className="pr-value">Envie mensagem para o suporte</p>
              </div>
            </div>
            {profile?.instagram ? (
              <div
                className="profile-row tappable"
                onClick={() => window.open(`https://instagram.com/${profile.instagram.replace(/^@/, "")}`, "_blank")}
              >
                <span className="pr-icon" aria-hidden>📷</span>
                <div>
                  <p className="pr-label">Instagram</p>
                  <p className="pr-value">{profile.instagram}</p>
                </div>
              </div>
            ) : null}
            <div
              className="profile-row tappable"
              onClick={() => alert("Política de privacidade em construção.")}
            >
              <span className="pr-icon" aria-hidden>🔒</span>
              <div>
                <p className="pr-label">Política de privacidade</p>
                <p className="pr-value">Como usamos seus dados</p>
              </div>
            </div>
            <div className="profile-row tappable" onClick={onDeleteAccount}>
              <span className="pr-icon" aria-hidden>🗑</span>
              <div>
                <p className="pr-label">Excluir minha conta</p>
                <p className="pr-value" style={{ color: "var(--color-danger)" }}>Ação irreversível</p>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
