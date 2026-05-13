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
import { formatMoneyFromCents } from "../lib/payments";
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

function formatEventDate(value: string): string {
  if (!value) return "Data a definir";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data a definir";
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
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
  const [submittedClass, setSubmittedClass] = useState<ClassOption | null>(null);

  const selected = useMemo(
    () => options.find((o) => o.classId === selectedClassId) ?? options[0] ?? null,
    [options, selectedClassId]
  );
  const categoryCount = useMemo(
    () => new Set(options.map((option) => option.categoryId)).size,
    [options]
  );
  const locationLabel = [tournament?.city, tournament?.state].filter(Boolean).join(" - ") || "Local a definir";

  const registrationCloseLabel = useMemo(() => {
    if (!tournament?.registrationCloseAt) return "Sem prazo definido";
    const date = new Date(tournament.registrationCloseAt);
    if (Number.isNaN(date.getTime())) return "Sem prazo definido";
    return date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  }, [tournament?.registrationCloseAt]);

  const registrationClosedReason = useMemo(() => {
    if (!tournament) return "";
    if (tournament.status !== "registration_open") {
      return "As inscricoes deste torneio nao estao abertas no momento.";
    }
    if (tournament.registrationCloseAt) {
      const closeAt = new Date(tournament.registrationCloseAt).getTime();
      if (Number.isFinite(closeAt) && closeAt < Date.now()) {
        return "O prazo de inscricao deste torneio foi encerrado.";
      }
    }
    return "";
  }, [tournament]);

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
        setSubmittedClass(null);
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
    if (registrationClosedReason) {
      setFeedback({ kind: "error", text: registrationClosedReason });
      return;
    }
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
      setSubmittedClass(selected);
      setFeedback({ kind: "success", text: "Solicitacao enviada com sucesso. O pagamento sera confirmado pela plataforma." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao enviar solicitacao." });
    } finally {
      setSubmitting(false);
    }
  };

  const registrationLink = () => {
    if (!tournament) return "";
    const u = new URL(window.location.href);
    const query = selected ? `?classId=${encodeURIComponent(selected.classId)}` : "";
    return `${u.origin}${u.pathname}#/inscricao/${encodeURIComponent(tournament.id)}${query}`;
  };

  const shareRegistrationWhatsApp = () => {
    if (!tournament) return;
    const lines = [
      `Inscricao para ${tournament.name}`,
      selected ? `${selected.categoryName} / ${selected.className}` : "Classe a escolher",
      "",
      registrationLink(),
    ];
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener,noreferrer");
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
        <section className="tournament-registration-layout">
          <article className="tournament-registration-hero">
            {tournament.posterUrl ? (
              <img src={tournament.posterUrl} alt="" />
            ) : null}
            <div>
              <div className="tournament-registration-status">
                <StatusBadge status={tournament.status} />
                <span>{tournament.visibility === "public" ? "Evento publico" : "Convite por link"}</span>
              </div>
              <h2>{tournament.name}</h2>
              <p>{locationLabel}</p>
              <div className="tournament-registration-facts">
                <span>Inicio: {formatEventDate(tournament.startsAt)}</span>
                <span>Inscricoes ate: {registrationCloseLabel}</span>
                <span>Taxa: {formatMoneyFromCents(tournament.registrationFeeCents)}</span>
              </div>
            </div>
          </article>

          <div className="tournament-registration-grid">
            <article className="card invite-card">
              <div className="section-title" style={{ marginBottom: 8 }}>
                <h2>Solicitar inscricao</h2>
                <span className="home-league-chip member">{selected ? `${selected.categoryName} / ${selected.className}` : "Escolha uma classe"}</span>
              </div>
              {registrationClosedReason ? <p className="feedback error">{registrationClosedReason}</p> : null}

              <div className="tournament-overview-grid invite-overview-grid">
                <div className="tournament-overview-kpi">
                  <strong>{categoryCount}</strong>
                  <span>Categorias</span>
                </div>
                <div className="tournament-overview-kpi">
                  <strong>{options.length}</strong>
                  <span>Classes abertas</span>
                </div>
                <div className="tournament-overview-kpi">
                  <strong>{formatMoneyFromCents(tournament.registrationFeeCents)}</strong>
                  <span>Inscricao</span>
                </div>
              </div>

              <label>Classe</label>
              <select
                value={selected?.classId ?? ""}
                onChange={(e) => {
                  setSelectedClassId(e.target.value);
                  setSubmittedClass(null);
                }}
              >
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

              {submittedClass ? (
                <div className="invite-confirmation">
                  <strong>Solicitacao recebida</strong>
                  <span>
                    Voce pediu inscricao em {submittedClass.categoryName} / {submittedClass.className}. O organizador deve aprovar antes de voce aparecer na chave.
                  </span>
                  <div className="cluster">
                    <button onClick={() => navigate(`/eventos/${encodeURIComponent(tournament.id)}`)}>Abrir torneio</button>
                    <button onClick={shareRegistrationWhatsApp}>Compartilhar convite</button>
                  </div>
                </div>
              ) : (
                <div className="cluster" style={{ marginTop: 12 }}>
                  <button
                    className="primary"
                    onClick={submit}
                    disabled={submitting || !!registrationClosedReason || !selected || !playerName.trim() || options.length === 0}
                  >
                    {submitting ? "Enviando..." : registrationClosedReason ? "Inscricoes fechadas" : "Solicitar inscricao"}
                  </button>
                  <button onClick={() => navigate(`/eventos/${encodeURIComponent(tournament.id)}`)}>Abrir torneio</button>
                  <button onClick={shareRegistrationWhatsApp} disabled={!selected}>
                    Compartilhar convite
                  </button>
                </div>
              )}
            </article>

            <aside className="tournament-registration-side">
              <div>
                <span>Como funciona</span>
                <strong>Pedido com aprovacao</strong>
                <p>Depois de solicitar a inscricao, o organizador confere a classe e libera sua entrada na chave.</p>
              </div>
              <div>
                <span>Compartilhamento</span>
                <strong>Link pronto para WhatsApp</strong>
                <p>Compartilhe o convite ja apontando para a classe selecionada.</p>
              </div>
              <div>
                <span>Organizacao</span>
                <strong>Dados para o torneio</strong>
                <p>Seu nome e telefone ajudam a validar pagamento, chamada e comunicados do evento.</p>
              </div>
            </aside>
          </div>
        </section>
      ) : null}
    </AppShell>
  );
}
