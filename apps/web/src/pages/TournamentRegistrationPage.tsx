import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { AppShell } from "../components/AppShell";
import { StatusBadge } from "../components/StatusBadge";
import {
  joinTournament,
  loadTournamentByRegistrationLink,
  loadTournamentDetails,
  loadTournamentRegistrations,
  requestTournamentRegistration,
} from "../lib/tournaments";
import { formatMoneyFromCents } from "../lib/payments";
import type { Profile, TournamentDetails, TournamentRegistration } from "../lib/types";

type Props = {
  user: User;
  profile: Profile | null;
};

type ClassOption = {
  categoryId: string;
  categoryName: string;
  classId: string;
  className: string;
  generated: boolean;
  matchFormat: string;
  playersCount: number;
  scoreFormat: string;
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

function asBoolean(value: unknown): boolean {
  return value === true;
}

function competitionModelLabel(value: unknown): string {
  if (value === "mata_mata_simples") return "Mata-mata";
  if (value === "grupos_mata_mata") return "Grupos + mata-mata";
  if (value === "round_robin") return "Todos contra todos";
  if (value === "liga_ranking") return "Liga/ranking";
  if (value === "dupla_eliminacao") return "Dupla eliminacao";
  if (value === "super_tiebreak") return "Super tie-break";
  return "Formato a definir";
}

function scoreFormatLabel(value: unknown): string {
  if (value === "melhor_de_3_super_tb") return "2 sets + super tie-break";
  if (value === "set_unico") return "Set unico";
  if (value === "pro_set") return "Pro set";
  if (value === "fast4") return "Fast4";
  if (value === "super_tb_unico") return "Super tie-break unico";
  return "Melhor de 3 sets";
}

function registrationStatusLabel(status: TournamentRegistration["status"]): string {
  if (status === "approved") return "Inscricao aprovada";
  if (status === "waitlist") return "Lista de espera";
  if (status === "rejected") return "Inscricao recusada";
  return "Inscricao em analise";
}

function registrationStatusDetail(status: TournamentRegistration["status"]): string {
  if (status === "approved") return "Você ja pode acompanhar jogos, agenda e comunicados do torneio.";
  if (status === "waitlist") return "A organização colocou sua inscricao na lista de espera desta categoria.";
  if (status === "rejected") return "Sua solicitacao não foi aprovada. Fale com a organização se precisar revisar a categoria.";
  return "A organização ainda precisa aprovar sua inscricao antes de você aparecer na chave.";
}

function friendlyRegistrationError(error: unknown): string {
  const raw = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  const lower = raw.toLowerCase();
  if (lower.includes("duplicate") || lower.includes("unique") || lower.includes("already") || lower.includes("ja existe")) {
    return "Você ja tem uma inscricao registrada neste torneio.";
  }
  if (lower.includes("permission denied") || lower.includes("row-level security") || lower.includes("not authorized")) {
    return "Não foi possível enviar a inscricao com este perfil. Entre novamente e tente de novo.";
  }
  if (lower.includes("registration") && lower.includes("closed")) {
    return "As inscrições deste torneio não estao abertas agora.";
  }
  if (lower.includes("tournament") && lower.includes("not found")) {
    return "Não encontramos este torneio. Verifique o link e tente novamente.";
  }
  return "Não foi possível enviar sua inscricao agora. Tente novamente em instantes.";
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
      const classData = asRecord(cls.data) ?? {};
      const config = asRecord(classData.config) ?? {};
      const participants = asArray(classData.participantes).filter(Boolean);
      const entries = asArray(classData.entradas).filter(Boolean);
      out.push({
        categoryId,
        categoryName,
        classId,
        className,
        generated: asBoolean(classData.gerado),
        matchFormat: competitionModelLabel(config.modeloCompeticao),
        playersCount: participants.length || entries.length,
        scoreFormat: scoreFormatLabel(config.tipoPontuacao),
      });
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
  const [existingRegistration, setExistingRegistration] = useState<TournamentRegistration | null>(null);

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
      return "As inscrições deste torneio não estao abertas no momento.";
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
        const myRegistrations = await loadTournamentRegistrations(user, details.id, details.role).catch(() => [] as TournamentRegistration[]);
        const mine = myRegistrations.find((registration) => registration.userId === user.id) ?? null;
        setExistingRegistration(mine);

        const search = new URLSearchParams(location.search);
        const classId = search.get("classId") || "";
        const queryClass = opts.find((o) => o.classId === classId);
        setSelectedClassId(mine?.classId || queryClass?.classId || opts[0]?.classId || "");
        setPlayerName(profile?.displayName || user.email?.split("@")[0] || "");
        setPhone(profile?.phone || "");
        setFeedback(null);
      } catch {
        if (!alive) return;
        setFeedback({ kind: "error", text: "Não foi possível abrir a inscricao deste torneio. Verifique o link e tente novamente." });
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
    if (existingRegistration) {
      setFeedback({ kind: "info", text: "Você ja tem uma inscricao registrada neste torneio." });
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
      const myRegistrations = await loadTournamentRegistrations(user, tournament.id, tournament.role).catch(() => [] as TournamentRegistration[]);
      const mine = myRegistrations.find((registration) => registration.userId === user.id) ?? null;
      setExistingRegistration(mine);
      setFeedback({
        kind: "success",
        text:
          mine?.status === "approved"
            ? "Inscricao confirmada. O pagamento sera acompanhado pela organização."
            : "Solicitacao enviada. A organização vai revisar sua categoria e pagamento.",
      });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyRegistrationError(err) });
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

  const selectedLabel = selected ? `${selected.categoryName} / ${selected.className}` : "Escolha uma classe";
  const canSubmit = Boolean(!submitting && !existingRegistration && !registrationClosedReason && selected && playerName.trim() && options.length > 0);

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
                <span>{tournament.visibility === "public" ? "Evento público" : "Convite por link"}</span>
              </div>
              <h2>{tournament.name}</h2>
              <p>{locationLabel}</p>
              <div className="tournament-registration-facts">
                <span>Inicio: {formatEventDate(tournament.startsAt)}</span>
                <span>Inscrições ate: {registrationCloseLabel}</span>
                <span>Taxa: {formatMoneyFromCents(tournament.registrationFeeCents)}</span>
              </div>
            </div>
          </article>

          <div className="tournament-registration-grid">
            <article className="card invite-card">
              <div className="section-title" style={{ marginBottom: 8 }}>
                <h2>Solicitar inscricao</h2>
                <span className="home-league-chip member">{existingRegistration ? registrationStatusLabel(existingRegistration.status) : selectedLabel}</span>
              </div>
              {registrationClosedReason ? <p className="feedback error">{registrationClosedReason}</p> : null}
              {existingRegistration ? (
                <div className={`invite-confirmation ${existingRegistration.status === "rejected" ? "rejected" : ""}`}>
                  <strong>{registrationStatusLabel(existingRegistration.status)}</strong>
                  <span>
                    {existingRegistration.categoryName} / {existingRegistration.className}. {registrationStatusDetail(existingRegistration.status)}
                  </span>
                  <div className="cluster">
                    <button onClick={() => navigate(`/eventos/${encodeURIComponent(tournament.id)}`)}>Abrir torneio</button>
                    <button onClick={() => navigate("/eventos?modo=playing")}>Meus eventos</button>
                  </div>
                </div>
              ) : null}

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

              <div className="registration-flow">
                <div className="registration-step-heading">
                  <span>1</span>
                  <div>
                    <strong>Escolha a categoria</strong>
                    <small>Selecione onde você quer entrar. A organização pode revisar antes de aprovar.</small>
                  </div>
                </div>
                {options.length === 0 ? (
                  <p className="subtle">Este torneio ainda não públicou categorias para inscricao.</p>
                ) : (
                  <div className="registration-option-grid">
                    {options.map((option) => {
                      const active = selected?.classId === option.classId;
                      return (
                        <button
                          key={`${option.categoryId}:${option.classId}`}
                          className={`registration-option ${active ? "active" : ""}`}
                          type="button"
                          onClick={() => setSelectedClassId(option.classId)}
                          disabled={Boolean(existingRegistration)}
                        >
                          <strong>{option.className}</strong>
                          <span>{option.categoryName}</span>
                          <small>{option.matchFormat} - {option.scoreFormat}</small>
                          <em>{option.playersCount} {option.playersCount === 1 ? "inscrito" : "inscritos"}</em>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="registration-step-heading">
                  <span>2</span>
                  <div>
                    <strong>Confirme seus dados</strong>
                    <small>Esses dados ajudam a organização a validar comunicados, pagamento e chamada.</small>
                  </div>
                </div>
                <div className="registration-form-grid">
                  <label>
                    Nome do atleta
                    <input value={playerName} onChange={(e) => setPlayerName(e.target.value)} placeholder="Seu nome" disabled={Boolean(existingRegistration)} />
                  </label>
                  <label>
                    Telefone
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(67) 99999-9999" disabled={Boolean(existingRegistration)} />
                  </label>
                </div>

                <div className="registration-step-heading">
                  <span>3</span>
                  <div>
                    <strong>Revise antes de enviar</strong>
                    <small>Confira valor, prazo e a categoria selecionada.</small>
                  </div>
                </div>
                <div className="registration-review-card">
                  <p>
                    <span>Categoria</span>
                    <strong>{selectedLabel}</strong>
                  </p>
                  <p>
                    <span>Valor</span>
                    <strong>{formatMoneyFromCents(tournament.registrationFeeCents)}</strong>
                  </p>
                  <p>
                    <span>Prazo</span>
                    <strong>{registrationCloseLabel}</strong>
                  </p>
                  <p>
                    <span>Restricao de horario</span>
                    <strong>Avise a organização se precisar combinar horario.</strong>
                  </p>
                </div>

                <div className="registration-sticky-cta">
                  <button className="primary" onClick={submit} disabled={!canSubmit}>
                    {submitting ? "Enviando..." : registrationClosedReason ? "Inscrições fechadas" : existingRegistration ? registrationStatusLabel(existingRegistration.status) : "Confirmar inscricao"}
                  </button>
                  <button onClick={() => navigate(`/eventos/${encodeURIComponent(tournament.id)}`)}>Abrir torneio</button>
                  <button onClick={shareRegistrationWhatsApp} disabled={!selected}>
                    Compartilhar
                  </button>
                </div>
              </div>
            </article>

            <aside className="tournament-registration-side">
              <div>
                <span>Como funciona</span>
                <strong>{tournament.status === "registration_open" ? "Pedido com aprovacao" : "Inscrições indisponíveis"}</strong>
                <p>Depois de solicitar, o organizador confere categoria, pagamento e libera sua entrada na chave.</p>
              </div>
              <div>
                <span>Status</span>
                <strong>{existingRegistration ? registrationStatusLabel(existingRegistration.status) : "Ainda não enviado"}</strong>
                <p>{existingRegistration ? registrationStatusDetail(existingRegistration.status) : "Ao confirmar, você vera aqui se a solicitacao ficou em analise ou foi aprovada."}</p>
              </div>
              <div>
                <span>Contato</span>
                <strong>Restricoes e duvidas</strong>
                <p>Restricoes de horario ainda devem ser combinadas com a organização do torneio.</p>
              </div>
            </aside>
          </div>
        </section>
      ) : null}
    </AppShell>
  );
}

