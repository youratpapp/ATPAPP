import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { AppShell } from "../components/AppShell";
import { StatusBadge } from "../components/StatusBadge";
import {
  joinTournament,
  loadTournamentByRegistrationLink,
  loadTournamentDetails,
  requestTournamentRegistration,
} from "../lib/tournaments";
import type { Profile, TournamentDetails } from "../lib/types";

type Props = {
  user: User;
  profile: Profile | null;
};

type ClassOption = {
  categoryId: string;
  categoryName: string;
  classId: string;
  className: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function extractClassOptions(dataRaw: Record<string, unknown>): ClassOption[] {
  const data = asRecord(dataRaw) ?? {};
  const categories = asArray(data.categorias);
  const out: ClassOption[] = [];
  categories.forEach((catRaw, ci) => {
    const cat = asRecord(catRaw) ?? {};
    const categoryId = asText(cat.id).trim() || `cat-${ci + 1}`;
    const categoryName = asText(cat.nome).trim() || "Categoria";
    const classes = asArray(cat.classes);
    classes.forEach((clsRaw, ki) => {
      const cls = asRecord(clsRaw) ?? {};
      const classId = asText(cls.id).trim() || `cls-${ki + 1}`;
      const className = asText(cls.nome).trim() || "Classe";
      out.push({ categoryId, categoryName, classId, className });
    });
  });
  return out;
}

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}

export function TournamentRegistrationPage({ user, profile }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { tournamentId = "" } = useParams();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "error" | "success" | "info"; text: string } | null>(null);
  const [tournament, setTournament] = useState<TournamentDetails | null>(null);
  const [options, setOptions] = useState<ClassOption[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [phone, setPhone] = useState("");

  const selected = useMemo(
    () => options.find((o) => o.classId === selectedClassId) ?? options[0] ?? null,
    [options, selectedClassId]
  );

  useEffect(() => {
    let alive = true;
    async function run() {
      setLoading(true);
      try {
        let details: TournamentDetails;
        try {
          details = await loadTournamentDetails(user, tournamentId);
        } catch {
          details = await loadTournamentByRegistrationLink(tournamentId);
        }
        if (!alive) return;
        setTournament(details);
        const opts = extractClassOptions(details.data);
        setOptions(opts);

        const search = new URLSearchParams(location.search);
        const classId = search.get("classId") || "";
        const queryClass = opts.find((o) => o.classId === classId);
        setSelectedClassId(queryClass?.classId || opts[0]?.classId || "");
        setPlayerName(profile?.displayName || user.email?.split("@")[0] || "");
        setPhone(profile?.phone || "");
        setFeedback(null);
      } catch (err) {
        if (!alive) return;
        setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao abrir inscricao." });
      } finally {
        if (alive) setLoading(false);
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, [location.search, profile?.displayName, profile?.phone, tournamentId, user, user.email]);

  const submit = async () => {
    if (!tournament || !selected) return;
    setSubmitting(true);
    try {
      await requestTournamentRegistration(user, tournament.id, {
        categoryId: selected.categoryId,
        classId: selected.classId,
        categoryName: selected.categoryName,
        className: selected.className,
        playerName,
        phone,
      });
      try {
        await joinTournament(user, tournament.id);
      } catch {
        // Non-blocking for registration.
      }
      setFeedback({ kind: "success", text: "Solicitacao enviada com sucesso." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao enviar solicitacao." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell user={user} profile={profile} showHeader={false}>
      <div className="page-header" style={{ marginBottom: 12 }}>
        <h1>Inscricao</h1>
        <div className="ph-actions">
          <button className="compact-action" onClick={() => navigate("/eventos/torneios?view=participating")}>
            <BackIcon />
            <span>Voltar</span>
          </button>
        </div>
      </div>

      {feedback ? (
        <p className={`feedback ${feedback.kind === "success" ? "success" : feedback.kind === "error" ? "error" : ""}`}>
          {feedback.text}
        </p>
      ) : null}

      {loading ? <p className="subtle">Carregando...</p> : null}
      {!loading && tournament ? (
        <section className="card invite-card">
          <div className="section-title" style={{ marginBottom: 8 }}>
            <h2>{tournament.name}</h2>
            <StatusBadge status={tournament.status} />
          </div>
          <p className="subtle" style={{ marginTop: 0 }}>
            {[tournament.city, tournament.state].filter(Boolean).join(" - ") || "Local a definir"}
          </p>

          <div className="tournament-overview-grid invite-overview-grid">
            <div className="tournament-overview-kpi">
              <strong>{options.length}</strong>
              <span>Classes abertas</span>
            </div>
            <div className="tournament-overview-kpi">
              <strong>{selected ? selected.categoryName : "-"}</strong>
              <span>Categoria</span>
            </div>
            <div className="tournament-overview-kpi">
              <strong>{selected ? selected.className : "-"}</strong>
              <span>Classe escolhida</span>
            </div>
          </div>

          <label>Classe</label>
          <select value={selected?.classId ?? ""} onChange={(e) => setSelectedClassId(e.target.value)}>
            {options.length === 0 ? <option value="">Sem classes disponiveis</option> : null}
            {options.map((o) => (
              <option key={`${o.categoryId}:${o.classId}`} value={o.classId}>
                {o.categoryName} / {o.className}
              </option>
            ))}
          </select>

          <label>Nome do atleta</label>
          <input value={playerName} onChange={(e) => setPlayerName(e.target.value)} placeholder="Seu nome" />

          <label>Telefone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(67) 99999-9999" />

          <div className="cluster" style={{ marginTop: 12 }}>
            <button
              className="primary"
              onClick={submit}
              disabled={submitting || !selected || !playerName.trim() || options.length === 0}
            >
              {submitting ? "Enviando..." : "Solicitar inscricao"}
            </button>
            <button onClick={() => navigate(`/eventos/${encodeURIComponent(tournament.id)}`)}>Abrir torneio</button>
          </div>
        </section>
      ) : null}
    </AppShell>
  );
}
