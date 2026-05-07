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
import { BRAZILIAN_STATES, listMunicipalitiesByUf, normalizeStateUf } from "../lib/brazil-location";

type Props = {
  user: User;
  profile: Profile | null;
};

type TabKey = "all" | "following" | "mine";

function LocationPinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function ThumbUpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
      <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
    </svg>
  );
}

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
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [cityLoading, setCityLoading] = useState(false);
  const [cityLoadError, setCityLoadError] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const normalizedUf = normalizeStateUf(stateUf);
  const cityValueInOptions = cityOptions.some((item) => item.toLowerCase() === city.trim().toLowerCase());

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
        state: normalizedUf,
        description,
        logoUrl,
      });
      setShowCreate(false);
      setName("");
      setCity("");
      setStateUf("");
      setCityOptions([]);
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
    <AppShell user={user} profile={profile} showHeader={false}>
      {/* Page header */}
      <div className="page-header">
        <h1>Locais</h1>
        <div className="ph-actions">
          <button className="ph-add-btn" onClick={() => setShowCreate(true)} aria-label="Adicionar local">
            +
          </button>
        </div>
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
                {(p.city || p.state) && (
                  <span className="pc-meta-row">
                    <LocationPinIcon />
                    {[p.city, p.state].filter(Boolean).join(" - ")}
                  </span>
                )}
                <span className="pc-meta-row">
                  <ThumbUpIcon />
                  {p.followerCount} {p.followerCount === 1 ? "seguidor" : "seguidores"}
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
                  {p.isFollowing ? "✓ Seguindo" : "Seguir"}
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
                    <option key={`place-state:${state.uf}`} value={state.uf}>
                      {state.uf} - {state.name}
                    </option>
                    ))}
                  </select>
                </div>
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
                    <option key={`place-city:${cityName}`} value={cityName}>
                      {cityName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {cityLoadError ? <p className="feedback error">{cityLoadError}</p> : null}
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
