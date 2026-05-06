import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { AppShell } from "../components/AppShell";
import {
  createPlace,
  followPlace,
  listAllPlaces,
  listPlacesIFollow,
  listPlacesIOwn,
  unfollowPlace,
  uploadPlaceLogo,
} from "../lib/places";
import type { Place, Profile } from "../lib/types";

type Props = {
  user: User;
  profile: Profile | null;
};

type TabKey = "all" | "following" | "mine";

export function PlacesPage({ user, profile }: Props) {
  const [tab, setTab] = useState<TabKey>("all");
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "info" | "error" | "success"; text: string } | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [stateUf, setStateUf] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const fetcher =
        tab === "all" ? listAllPlaces : tab === "following" ? listPlacesIFollow : listPlacesIOwn;
      const rows = await fetcher(user);
      setPlaces(rows);
      setFeedback(null);
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao carregar." });
    } finally {
      setLoading(false);
    }
  }, [tab, user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onToggleFollow = async (place: Place) => {
    setBusy(true);
    try {
      if (place.isFollowing) {
        await unfollowPlace(user, place.id);
      } else {
        await followPlace(user, place.id);
      }
      setPlaces((rows) =>
        rows.map((p) =>
          p.id === place.id
            ? {
                ...p,
                isFollowing: !place.isFollowing,
                followerCount: p.followerCount + (place.isFollowing ? -1 : 1),
              }
            : p
        )
      );
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha." });
    } finally {
      setBusy(false);
    }
  };

  const onCreate = async () => {
    setBusy(true);
    setFeedback(null);
    try {
      let logoUrl = "";
      if (logoFile) {
        logoUrl = await uploadPlaceLogo(user, logoFile);
      }
      await createPlace(user, {
        name,
        city,
        state: stateUf,
        description,
        logoUrl,
      });
      setShowCreate(false);
      setName("");
      setCity("");
      setStateUf("");
      setDescription("");
      setLogoFile(null);
      setFeedback({ kind: "success", text: "Local criado." });
      await refresh();
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao criar local." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell user={user} profile={profile}>
      <div className="section-title">
        <h2>Locais</h2>
        <button className="primary" onClick={() => setShowCreate(true)}>+ Adicionar</button>
      </div>

      <div className="tabs">
        <button className={tab === "all" ? "active" : ""} onClick={() => setTab("all")}>
          Próximos
        </button>
        <button className={tab === "following" ? "active" : ""} onClick={() => setTab("following")}>
          Seguindo
        </button>
        <button className={tab === "mine" ? "active" : ""} onClick={() => setTab("mine")}>
          Meus Locais
        </button>
      </div>

      {feedback ? (
        <p className={`feedback ${feedback.kind === "success" ? "success" : feedback.kind === "error" ? "error" : ""}`}>
          {feedback.text}
        </p>
      ) : null}

      {loading ? <p className="subtle">Carregando...</p> : null}

      {!loading && places.length === 0 ? (
        <div className="empty-state">
          <span className="empty-emoji" aria-hidden>📍</span>
          <p>
            {tab === "following"
              ? "Você ainda não segue nenhum local."
              : tab === "mine"
              ? "Você ainda não criou nenhum local."
              : "Nenhum local cadastrado."}
          </p>
          <button className="empty-action" onClick={() => setShowCreate(true)}>
            Adicionar local
          </button>
        </div>
      ) : null}

      {places.map((p) => {
        const initials = (p.name || "L")
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((s) => s[0]!.toUpperCase())
          .join("");
        const isOwner = p.ownerId === user.id;
        return (
          <article key={p.id} className="place-card">
            <div>
              <p className="pc-name">{p.name}</p>
              <div className="pc-meta">
                {p.city || p.state ? <span>📍 {[p.city, p.state].filter(Boolean).join(" - ")}</span> : null}
                <span className="pc-followers">
                  👍 {p.followerCount} {p.followerCount === 1 ? "seguidor" : "seguidores"}
                </span>
              </div>
            </div>
            <div className="pc-logo" aria-hidden>
              {p.logoUrl ? <img src={p.logoUrl} alt="" /> : initials}
            </div>
            <div className="pc-actions">
              {!isOwner ? (
                <button
                  className={p.isFollowing ? "" : "primary"}
                  disabled={busy}
                  onClick={() => onToggleFollow(p)}
                >
                  {p.isFollowing ? "Seguindo" : "Seguir"}
                </button>
              ) : (
                <button disabled>Meu local</button>
              )}
            </div>
          </article>
        );
      })}

      {showCreate ? (
        <div className="modal-backdrop" onClick={() => !busy && setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Novo local</h2>
            <label>Nome</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Cesão Tênis Club" />
            <div className="row">
              <div>
                <label>Cidade</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Cidade" />
              </div>
              <div>
                <label>UF</label>
                <input value={stateUf} onChange={(e) => setStateUf(e.target.value)} maxLength={2} placeholder="MS" />
              </div>
            </div>
            <label>Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Quadras, contato, horários..."
            />
            <label>Logo (opcional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
            />
            <div className="row" style={{ marginTop: 16 }}>
              <button onClick={() => setShowCreate(false)} disabled={busy}>Cancelar</button>
              <button className="primary" onClick={onCreate} disabled={busy || !name.trim()}>
                Criar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
