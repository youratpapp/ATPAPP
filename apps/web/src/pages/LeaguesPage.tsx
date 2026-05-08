import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { AppShell } from "../components/AppShell";
import { createLeague, loadMyLeagues } from "../lib/leagues";
import type { LeagueSummary, Profile } from "../lib/types";

type Props = {
  user: User;
  profile: Profile | null;
};

function typeLabel(v: LeagueSummary["leagueType"]): string {
  if (v === "dupla_fixa") return "Dupla fixa";
  if (v === "dupla_rotativa") return "Dupla rotativa";
  return "Simples";
}

function statusLabel(v: LeagueSummary["status"]): string {
  if (v === "active") return "Ativa";
  if (v === "paused") return "Pausada";
  if (v === "finished") return "Finalizada";
  return "Rascunho";
}

function visLabel(v: LeagueSummary["visibility"]): string {
  return v === "public" ? "Publica" : "Privada";
}

export function LeaguesPage({ user, profile }: Props) {
  const navigate = useNavigate();
  const [items, setItems] = useState<LeagueSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [leagueType, setLeagueType] = useState<LeagueSummary["leagueType"]>("simples");
  const [category, setCategory] = useState("");
  const [classScope, setClassScope] = useState("");
  const [visibility, setVisibility] = useState<LeagueSummary["visibility"]>("private");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await loadMyLeagues();
      setItems(rows);
      setFeedback(null);
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao carregar ligas." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const totals = useMemo(() => {
    const owned = items.filter((i) => i.role === "owner").length;
    const active = items.filter((i) => i.status === "active").length;
    return { total: items.length, owned, active };
  }, [items]);

  async function onCreate() {
    setBusy(true);
    try {
      const { id } = await createLeague(user, {
        name,
        leagueType,
        category,
        classScope,
        visibility,
      });
      setShowCreate(false);
      setName("");
      setCategory("");
      setClassScope("");
      setLeagueType("simples");
      setVisibility("private");
      navigate(`/eventos/ligas/${encodeURIComponent(id)}`);
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao criar liga." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell user={user} profile={profile}>
      <div className="section-title">
        <h2>Ligas</h2>
        <button onClick={() => setShowCreate(true)}>Nova liga</button>
      </div>

      <div className="events-kpi-grid">
        <article className="events-kpi-card">
          <p className="events-kpi-label">Total</p>
          <p className="events-kpi-value">{totals.total}</p>
        </article>
        <article className="events-kpi-card">
          <p className="events-kpi-label">Organizando</p>
          <p className="events-kpi-value">{totals.owned}</p>
        </article>
        <article className="events-kpi-card">
          <p className="events-kpi-label">Ativas</p>
          <p className="events-kpi-value">{totals.active}</p>
        </article>
      </div>

      {feedback ? <p className={`feedback ${feedback.kind}`}>{feedback.text}</p> : null}
      {loading ? <p className="subtle">Carregando...</p> : null}
      {!loading && !items.length ? (
        <div className="empty-state">
          <span className="empty-emoji">🎾</span>
          <p>Nenhuma liga encontrada.</p>
          <button className="empty-action" onClick={() => setShowCreate(true)}>
            Criar primeira liga
          </button>
        </div>
      ) : null}

      {items.map((item) => (
        <article key={item.id} className="event-card" onClick={() => navigate(`/eventos/ligas/${encodeURIComponent(item.id)}`)}>
          <div className="ec-body">
            <div className="ec-name-row">
              <p className="ec-name">{item.name}</p>
              <span className="ec-chip">{statusLabel(item.status)}</span>
            </div>
            <div className="ec-chip-row">
              <span className={`ec-chip ${item.role === "owner" ? "owner" : "member"}`}>
                {item.role === "owner" ? "Organizador" : "Participante"}
              </span>
              <span className="ec-chip">{typeLabel(item.leagueType)}</span>
              <span className="ec-chip">{visLabel(item.visibility)}</span>
              {item.category ? <span className="ec-chip">{item.category}</span> : null}
              {item.classScope ? <span className="ec-chip">{item.classScope}</span> : null}
            </div>
            <div className="ec-info-row">
              <span className="ec-info-left">Atualizado em {item.updatedAt ? new Date(item.updatedAt).toLocaleString("pt-BR") : "-"}</span>
            </div>
          </div>
        </article>
      ))}

      {showCreate ? (
        <div className="modal-backdrop" onClick={() => !busy && setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Criar liga</h3>
            <label>
              Nome da liga
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Liga ATP Dourados" />
            </label>
            <label>
              Tipo
              <select value={leagueType} onChange={(e) => setLeagueType(e.target.value as LeagueSummary["leagueType"])}>
                <option value="simples">Simples</option>
                <option value="dupla_fixa">Dupla fixa</option>
                <option value="dupla_rotativa">Dupla rotativa</option>
              </select>
            </label>
            <div className="form-row">
              <label>
                Categoria
                <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ex.: Masculino" />
              </label>
              <label>
                Classe
                <input value={classScope} onChange={(e) => setClassScope(e.target.value)} placeholder="Ex.: Classe A" />
              </label>
            </div>
            <label>
              Visibilidade
              <select value={visibility} onChange={(e) => setVisibility(e.target.value as LeagueSummary["visibility"])}>
                <option value="private">Privada</option>
                <option value="public">Publica</option>
              </select>
            </label>
            <div className="modal-actions">
              <button className="ghost" onClick={() => setShowCreate(false)} disabled={busy}>
                Cancelar
              </button>
              <button onClick={onCreate} disabled={busy}>
                {busy ? "Criando..." : "Criar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
