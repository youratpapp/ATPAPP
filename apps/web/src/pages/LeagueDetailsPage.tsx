import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { AppShell } from "../components/AppShell";
import {
  confirmLeagueMatchResult,
  createLeagueJoinLink,
  generateNextLeagueRound,
  loadLeagueClasses,
  loadLeagueDetails,
  loadLeagueRegistrations,
  loadMatchAvailability,
  loadMatchMessages,
  loadMatchSubmissions,
  loadRoundMatches,
  loadSeasonRounds,
  requestPublicLeagueJoin,
  saveMyMatchAvailability,
  sendMatchMessage,
  setLeagueRegistrationStatus,
  submitLeagueMatchResult,
} from "../lib/leagues";
import type {
  LeagueClassSummary,
  LeagueDetails,
  LeagueMatchAvailability,
  LeagueMatchMessage,
  LeagueMatchSummary,
  LeagueRegistration,
  LeagueResultSubmission,
  LeagueRoundSummary,
  Profile,
} from "../lib/types";

type Props = {
  user: User;
  profile: Profile | null;
};

type PageTab = "visao" | "jogadores" | "partidas";

type MatchForm = {
  sets1: string;
  sets2: string;
  games1: string;
  games2: string;
  winnerSide: "1" | "2";
  isWo: boolean;
  summary: string;
};

type RoundWithMatches = {
  round: LeagueRoundSummary;
  matches: LeagueMatchSummary[];
};

function typeLabel(v: LeagueDetails["leagueType"]): string {
  if (v === "dupla_fixa") return "Dupla fixa";
  if (v === "dupla_rotativa") return "Dupla rotativa";
  return "Simples";
}

function statusLabel(v: LeagueDetails["status"]): string {
  if (v === "active") return "Ativa";
  if (v === "paused") return "Pausada";
  if (v === "finished") return "Finalizada";
  return "Rascunho";
}

function classLabel(c: LeagueClassSummary): string {
  return `${c.categoryName} / ${c.className}`;
}

function matchStatusLabel(v: LeagueMatchSummary["status"]): string {
  if (v === "aguardando_organizacao") return "Aguardando organizacao";
  if (v === "aguardando_resultado") return "Aguardando resultado";
  if (v === "aguardando_confirmacao") return "Aguardando confirmacao";
  if (v === "encerrada") return "Encerrada";
  if (v === "wo") return "WO";
  if (v === "em_disputa") return "Em disputa";
  return "Em analise adm";
}

function formatDateTime(value: string): string {
  if (!value) return "-";
  return new Date(value).toLocaleString("pt-BR");
}

function toDateTimeInputValue(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultMatchForm(): MatchForm {
  return {
    sets1: "2",
    sets2: "0",
    games1: "12",
    games2: "6",
    winnerSide: "1",
    isWo: false,
    summary: "",
  };
}

export function LeagueDetailsPage({ user, profile }: Props) {
  const { leagueId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<PageTab>("visao");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [league, setLeague] = useState<LeagueDetails | null>(null);
  const [classes, setClasses] = useState<LeagueClassSummary[]>([]);
  const [registrations, setRegistrations] = useState<LeagueRegistration[]>([]);
  const [roundsData, setRoundsData] = useState<RoundWithMatches[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [joinPlayerName, setJoinPlayerName] = useState(profile?.displayName || "");
  const [joinPhone, setJoinPhone] = useState(profile?.phone || "");
  const [matchForms, setMatchForms] = useState<Record<string, MatchForm>>({});
  const [matchSubmissions, setMatchSubmissions] = useState<Record<string, LeagueResultSubmission[]>>({});
  const [expandedMatchId, setExpandedMatchId] = useState("");
  const [availabilityByMatch, setAvailabilityByMatch] = useState<Record<string, LeagueMatchAvailability[]>>({});
  const [messagesByMatch, setMessagesByMatch] = useState<Record<string, LeagueMatchMessage[]>>({});
  const [messageDraftByMatch, setMessageDraftByMatch] = useState<Record<string, string>>({});
  const [myAvailabilityByMatch, setMyAvailabilityByMatch] = useState<Record<string, string[]>>({});

  const isOwner = Boolean(league && league.ownerId === user.id);
  const classById = useMemo(() => {
    const map: Record<string, LeagueClassSummary> = {};
    for (const c of classes) map[c.id] = c;
    return map;
  }, [classes]);

  const registrationStats = useMemo(
    () => ({
      pending: registrations.filter((r) => r.status === "pending").length,
      approved: registrations.filter((r) => r.status === "approved").length,
      rejected: registrations.filter((r) => r.status === "rejected").length,
    }),
    [registrations]
  );

  async function loadRoundsAndMatches(seasonId: string) {
    const rounds = await loadSeasonRounds(seasonId, 8);
    const byClass = selectedClassId.trim();
    const filteredRounds = byClass ? rounds.filter((r) => r.classId === byClass) : rounds;
    const out: RoundWithMatches[] = [];
    for (const r of filteredRounds) {
      const matches = await loadRoundMatches(r.id);
      out.push({
        round: r,
        matches: byClass ? matches.filter((m) => m.classId === byClass) : matches,
      });
    }
    setRoundsData(out);
  }

  async function loadAll() {
    const id = String(leagueId || "").trim();
    if (!id) {
      setError("Liga invalida.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const details = await loadLeagueDetails(id);
      setLeague(details);
      const initialSeasonId = selectedSeasonId || details.seasons.find((s) => s.status === "active")?.id || details.seasons[0]?.id || "";
      setSelectedSeasonId(initialSeasonId);

      if (initialSeasonId) {
        const cls = await loadLeagueClasses(initialSeasonId);
        setClasses(cls);
        await loadRoundsAndMatches(initialSeasonId);
      } else {
        setClasses([]);
        setRoundsData([]);
      }

      if (details.ownerId === user.id) {
        setRegistrations(await loadLeagueRegistrations(id));
      } else {
        setRegistrations([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar liga.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leagueId]);

  useEffect(() => {
    if (!selectedSeasonId) return;
    loadLeagueClasses(selectedSeasonId).then(setClasses).catch(() => setClasses([]));
    void loadRoundsAndMatches(selectedSeasonId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSeasonId, selectedClassId]);

  async function openMatchRoom(match: LeagueMatchSummary) {
    const nextId = expandedMatchId === match.id ? "" : match.id;
    setExpandedMatchId(nextId);
    if (!nextId) return;
    const [subs, avail, msgs] = await Promise.all([
      loadMatchSubmissions(match.id).catch(() => []),
      loadMatchAvailability(match.id).catch(() => []),
      loadMatchMessages(match.id).catch(() => []),
    ]);
    setMatchSubmissions((prev) => ({ ...prev, [match.id]: subs }));
    setAvailabilityByMatch((prev) => ({ ...prev, [match.id]: avail }));
    setMessagesByMatch((prev) => ({ ...prev, [match.id]: msgs }));

    const myPlayer = match.participants.find((p) => p.userId === user.id);
    if (myPlayer?.leaguePlayerId) {
      const mine = avail
        .filter((a) => a.leaguePlayerId === myPlayer.leaguePlayerId)
        .sort((a, b) => a.optionNo - b.optionNo)
        .map((a) => toDateTimeInputValue(a.availableAt));
      const slots = [...mine];
      while (slots.length < 3) slots.push("");
      setMyAvailabilityByMatch((prev) => ({ ...prev, [match.id]: slots }));
    }
  }

  async function onGenerateRound() {
    if (!league || !selectedSeasonId) return;
    setBusy(true);
    setFeedback(null);
    try {
      const rows = await generateNextLeagueRound({
        leagueId: league.id,
        seasonId: selectedSeasonId,
        classId: selectedClassId || null,
      });
      const created = rows.reduce((acc, r) => acc + r.matchesCreated, 0);
      setFeedback({ kind: "success", text: `Rodada gerada com sucesso. Partidas criadas: ${created}.` });
      await loadAll();
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao gerar rodada." });
    } finally {
      setBusy(false);
    }
  }

  async function onCreateJoinLink() {
    if (!league) return;
    setBusy(true);
    setFeedback(null);
    try {
      const { url } = await createLeagueJoinLink({
        leagueId: league.id,
        seasonId: selectedSeasonId || null,
        classId: selectedClassId || null,
      });
      await navigator.clipboard.writeText(url);
      setFeedback({ kind: "success", text: "Link de inscricao copiado." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao gerar link." });
    } finally {
      setBusy(false);
    }
  }

  async function onPublicJoin() {
    if (!league) return;
    setBusy(true);
    setFeedback(null);
    try {
      const status = await requestPublicLeagueJoin({
        leagueId: league.id,
        seasonId: selectedSeasonId || null,
        classId: selectedClassId || null,
        playerName: joinPlayerName,
        phone: joinPhone,
      });
      setFeedback({
        kind: "success",
        text: status === "approved" ? "Inscricao aprovada automaticamente." : "Solicitacao enviada para aprovacao.",
      });
      await loadAll();
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao solicitar inscricao." });
    } finally {
      setBusy(false);
    }
  }

  async function onApproveRegistration(id: string, status: "approved" | "rejected") {
    setBusy(true);
    setFeedback(null);
    try {
      await setLeagueRegistrationStatus(id, status);
      setFeedback({ kind: "success", text: status === "approved" ? "Inscricao aprovada." : "Inscricao rejeitada." });
      await loadAll();
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao atualizar inscricao." });
    } finally {
      setBusy(false);
    }
  }

  function getMatchForm(matchId: string): MatchForm {
    return matchForms[matchId] || defaultMatchForm();
  }

  function setMatchForm(matchId: string, next: Partial<MatchForm>) {
    setMatchForms((prev) => ({
      ...prev,
      [matchId]: { ...(prev[matchId] || defaultMatchForm()), ...next },
    }));
  }

  async function onSubmitResult(match: LeagueMatchSummary) {
    const f = getMatchForm(match.id);
    const payload = {
      sets_side1: Number(f.sets1 || 0),
      sets_side2: Number(f.sets2 || 0),
      games_side1: Number(f.games1 || 0),
      games_side2: Number(f.games2 || 0),
      winner_side: Number(f.winnerSide || "1"),
      is_wo: f.isWo,
      summary:
        f.summary.trim() ||
        `${match.participants.filter((p) => p.side === 1).map((p) => p.displayName).join(" / ")} ${f.sets1}-${f.sets2} ${match.participants
          .filter((p) => p.side === 2)
          .map((p) => p.displayName)
          .join(" / ")}`,
    };
    setBusy(true);
    setFeedback(null);
    try {
      await submitLeagueMatchResult(match.id, payload);
      const subs = await loadMatchSubmissions(match.id);
      setMatchSubmissions((prev) => ({ ...prev, [match.id]: subs }));
      setFeedback({ kind: "success", text: "Resultado enviado. Aguardando confirmacao." });
      await loadAll();
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao enviar resultado." });
    } finally {
      setBusy(false);
    }
  }

  async function onConfirmSubmission(matchId: string, submissionId: string, confirm: boolean) {
    setBusy(true);
    setFeedback(null);
    try {
      await confirmLeagueMatchResult(submissionId, confirm, confirm ? undefined : "Divergencia no placar");
      const subs = await loadMatchSubmissions(matchId);
      setMatchSubmissions((prev) => ({ ...prev, [matchId]: subs }));
      setFeedback({ kind: "success", text: confirm ? "Resultado confirmado." : "Resultado enviado para disputa administrativa." });
      await loadAll();
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao confirmar resultado." });
    } finally {
      setBusy(false);
    }
  }

  async function onSaveAvailability(match: LeagueMatchSummary) {
    const myPlayer = match.participants.find((p) => p.userId === user.id);
    if (!myPlayer?.leaguePlayerId) return;
    const slots = myAvailabilityByMatch[match.id] || [];
    setBusy(true);
    setFeedback(null);
    try {
      await saveMyMatchAvailability(match.id, myPlayer.leaguePlayerId, slots);
      const avail = await loadMatchAvailability(match.id);
      setAvailabilityByMatch((prev) => ({ ...prev, [match.id]: avail }));
      setFeedback({ kind: "success", text: "Disponibilidade salva." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao salvar disponibilidade." });
    } finally {
      setBusy(false);
    }
  }

  async function onSendMessage(matchId: string) {
    const text = (messageDraftByMatch[matchId] || "").trim();
    if (!text) return;
    setBusy(true);
    setFeedback(null);
    try {
      await sendMatchMessage(matchId, text);
      setMessageDraftByMatch((prev) => ({ ...prev, [matchId]: "" }));
      const msgs = await loadMatchMessages(matchId);
      setMessagesByMatch((prev) => ({ ...prev, [matchId]: msgs }));
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao enviar mensagem." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell user={user} profile={profile}>
      <div className="section-title">
        <h2>{league?.name || "Liga"}</h2>
        <button className="ghost" onClick={() => navigate("/ligas")}>
          Voltar
        </button>
      </div>

      {loading ? <p className="subtle">Carregando...</p> : null}
      {error ? <p className="feedback error">{error}</p> : null}
      {feedback ? <p className={`feedback ${feedback.kind}`}>{feedback.text}</p> : null}

      {!loading && !error && league ? (
        <>
          <div className="tabs" style={{ marginBottom: 12 }}>
            <button className={activeTab === "visao" ? "active" : ""} onClick={() => setActiveTab("visao")}>
              Organizacao
            </button>
            <button className={activeTab === "jogadores" ? "active" : ""} onClick={() => setActiveTab("jogadores")}>
              Jogadores
            </button>
            <button className={activeTab === "partidas" ? "active" : ""} onClick={() => setActiveTab("partidas")}>
              Partidas
            </button>
          </div>

          <div className="events-kpi-grid">
            <article className="events-kpi-card">
              <p className="events-kpi-label">Tipo</p>
              <p className="events-kpi-value" style={{ fontSize: "var(--font-size-md)" }}>
                {typeLabel(league.leagueType)}
              </p>
            </article>
            <article className="events-kpi-card">
              <p className="events-kpi-label">Status</p>
              <p className="events-kpi-value" style={{ fontSize: "var(--font-size-md)" }}>
                {statusLabel(league.status)}
              </p>
            </article>
            <article className="events-kpi-card">
              <p className="events-kpi-label">Temporadas</p>
              <p className="events-kpi-value">{league.seasons.length}</p>
            </article>
          </div>

          {activeTab === "visao" ? (
            <>
              <section className="section-card">
                <h3 style={{ marginTop: 0, marginBottom: 10 }}>Config da liga</h3>
                <div className="events-filter-grid">
                  <div>
                    <label>Categoria</label>
                    <p className="subtle">{league.category || "-"}</p>
                  </div>
                  <div>
                    <label>Classe</label>
                    <p className="subtle">{league.classScope || "-"}</p>
                  </div>
                  <div>
                    <label>Formato</label>
                    <p className="subtle">{league.matchFormat}</p>
                  </div>
                  <div>
                    <label>Rodadas</label>
                    <p className="subtle">{league.roundsTotal}</p>
                  </div>
                  <div>
                    <label>Intervalo</label>
                    <p className="subtle">{league.roundIntervalDays} dias</p>
                  </div>
                  <div>
                    <label>Prazo de resultado</label>
                    <p className="subtle">
                      {league.resultDeadlineDays} dias + {league.toleranceDays} dias
                    </p>
                  </div>
                </div>
              </section>

              <section className="section-card">
                <h3 style={{ marginTop: 0, marginBottom: 10 }}>Temporada e classe</h3>
                <div className="events-filter-grid">
                  <label>
                    Temporada
                    <select value={selectedSeasonId} onChange={(e) => setSelectedSeasonId(e.target.value)}>
                      {league.seasons.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} (#{s.seasonNumber})
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Classe
                    <select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)}>
                      <option value="">Todas</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {classLabel(c)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                {isOwner ? (
                  <div className="modal-actions">
                    <button onClick={onGenerateRound} disabled={busy || !selectedSeasonId}>
                      {busy ? "Processando..." : "Gerar proxima rodada"}
                    </button>
                    <button className="ghost" onClick={onCreateJoinLink} disabled={busy}>
                      Copiar link de inscricao
                    </button>
                  </div>
                ) : null}
              </section>

              {!isOwner && league.visibility === "public" && league.publicJoinEnabled ? (
                <section className="section-card">
                  <h3 style={{ marginTop: 0, marginBottom: 10 }}>Inscricao publica</h3>
                  <div className="events-filter-grid">
                    <label>
                      Nome
                      <input value={joinPlayerName} onChange={(e) => setJoinPlayerName(e.target.value)} />
                    </label>
                    <label>
                      Telefone
                      <input value={joinPhone} onChange={(e) => setJoinPhone(e.target.value)} />
                    </label>
                  </div>
                  <div className="modal-actions">
                    <button onClick={onPublicJoin} disabled={busy || !joinPlayerName.trim()}>
                      {league.joinRequiresApproval ? "Solicitar inscricao" : "Entrar na liga"}
                    </button>
                  </div>
                </section>
              ) : null}
            </>
          ) : null}

          {activeTab === "jogadores" ? (
            <section className="section-card">
              <h3 style={{ marginTop: 0, marginBottom: 10 }}>Solicitacoes de inscricao</h3>
              {isOwner ? (
                <p className="subtle" style={{ marginTop: 0 }}>
                  Pendentes: {registrationStats.pending} | Aprovadas: {registrationStats.approved} | Rejeitadas: {registrationStats.rejected}
                </p>
              ) : (
                <p className="subtle">Somente o admin aprova solicitacoes.</p>
              )}
              {isOwner && !registrations.length ? <p className="subtle">Sem solicitacoes.</p> : null}
              {isOwner
                ? registrations.map((r) => {
                    const cls = r.classId ? classById[r.classId] : null;
                    return (
                      <div key={r.id} className="list-item">
                        <div className="li-body">
                          <p className="li-title">
                            {r.playerName} {r.phone ? `| ${r.phone}` : ""}
                          </p>
                          <p className="li-meta">
                            <span>Status: {r.status}</span>
                            <span>Origem: {r.source === "link" ? "Link" : r.source === "public" ? "Publica" : "Admin"}</span>
                            <span>Classe: {cls ? classLabel(cls) : "-"}</span>
                          </p>
                        </div>
                        {r.status === "pending" ? (
                          <div className="li-actions">
                            <button onClick={() => onApproveRegistration(r.id, "approved")} disabled={busy}>
                              Aprovar
                            </button>
                            <button className="danger" onClick={() => onApproveRegistration(r.id, "rejected")} disabled={busy}>
                              Rejeitar
                            </button>
                          </div>
                        ) : null}
                      </div>
                    );
                  })
                : null}
            </section>
          ) : null}

          {activeTab === "partidas" ? (
            <section className="section-card">
              <h3 style={{ marginTop: 0, marginBottom: 10 }}>Partidas por rodada</h3>
              {!roundsData.length ? <p className="subtle">Sem rodadas geradas.</p> : null}
              {roundsData.map(({ round, matches }) => (
                <div key={round.id} style={{ marginBottom: 14 }}>
                  <div className="league-round-head">
                    <strong>Rodada {round.roundNumber}</strong>
                    <span>
                      {new Date(round.startsAt).toLocaleDateString("pt-BR")} ate {new Date(round.endsAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  {!matches.length ? <p className="subtle">Sem partidas nesta rodada.</p> : null}
                  {matches.map((m, idx) => {
                    const side1 = m.participants.filter((p) => p.side === 1).map((p) => p.displayName).join(" / ") || "A definir";
                    const side2 = m.participants.filter((p) => p.side === 2).map((p) => p.displayName).join(" / ") || "A definir";
                    const form = getMatchForm(m.id);
                    const subs = matchSubmissions[m.id] || [];
                    const avail = availabilityByMatch[m.id] || [];
                    const msgs = messagesByMatch[m.id] || [];
                    const mySlots = myAvailabilityByMatch[m.id] || ["", "", ""];
                    const myPlayer = m.participants.find((p) => p.userId === user.id);
                    const allowRoom = Boolean(myPlayer || isOwner);
                    return (
                      <article key={m.id} className="league-match-card">
                        <div className="league-match-card-top">
                          <div>
                            <p className="league-match-title">
                              Jogo {idx + 1}: {side1} x {side2}
                            </p>
                            <p className="league-match-sub">Status: {matchStatusLabel(m.status)}</p>
                          </div>
                          <button className="ghost" onClick={() => void openMatchRoom(m)} disabled={!allowRoom}>
                            {expandedMatchId === m.id ? "Fechar sala" : "Abrir sala"}
                          </button>
                        </div>

                        {expandedMatchId === m.id ? (
                          <div className="league-room-grid">
                            <section className="league-room-panel">
                              <h4>Participantes e contatos</h4>
                              {m.participants.map((p, pIdx) => (
                                <div key={`${p.leaguePlayerId || "x"}-${pIdx}`} className="league-participant-row">
                                  <span>{p.displayName}</span>
                                  <span>{p.phone || "-"}</span>
                                </div>
                              ))}
                            </section>

                            <section className="league-room-panel">
                              <h4>Disponibilidade</h4>
                              {myPlayer?.leaguePlayerId ? (
                                <>
                                  <div className="league-availability-inputs">
                                    {mySlots.map((slot, slotIdx) => (
                                      <input
                                        key={`${m.id}-slot-${slotIdx}`}
                                        type="datetime-local"
                                        value={slot}
                                        onChange={(e) =>
                                          setMyAvailabilityByMatch((prev) => {
                                            const next = [...(prev[m.id] || ["", "", ""])];
                                            next[slotIdx] = e.target.value;
                                            return { ...prev, [m.id]: next };
                                          })
                                        }
                                      />
                                    ))}
                                  </div>
                                  <button onClick={() => void onSaveAvailability(m)} disabled={busy}>
                                    Salvar disponibilidade
                                  </button>
                                </>
                              ) : (
                                <p className="subtle">Somente participantes podem registrar disponibilidade.</p>
                              )}
                              <div className="league-availability-list">
                                {avail.map((a) => (
                                  <p key={a.id}>
                                    {a.playerName}: {new Date(a.availableAt).toLocaleString("pt-BR")}
                                  </p>
                                ))}
                                {!avail.length ? <p className="subtle">Nenhuma disponibilidade enviada.</p> : null}
                              </div>
                            </section>

                            <section className="league-room-panel">
                              <h4>Mini chat</h4>
                              <div className="league-chat-box">
                                {msgs.map((msg) => (
                                  <div key={msg.id} className={msg.senderUserId === user.id ? "league-chat-me" : "league-chat-other"}>
                                    <p>{msg.body}</p>
                                    <span>{formatDateTime(msg.createdAt)}</span>
                                  </div>
                                ))}
                                {!msgs.length ? <p className="subtle">Sem mensagens ainda.</p> : null}
                              </div>
                              <div className="league-chat-send">
                                <input
                                  value={messageDraftByMatch[m.id] || ""}
                                  onChange={(e) => setMessageDraftByMatch((prev) => ({ ...prev, [m.id]: e.target.value }))}
                                  placeholder="Escreva uma mensagem"
                                />
                                <button onClick={() => void onSendMessage(m.id)} disabled={busy}>
                                  Enviar
                                </button>
                              </div>
                            </section>

                            <section className="league-room-panel league-room-result">
                              <h4>Resultado e confirmacao</h4>
                              <div className="events-filter-grid">
                                <label>
                                  Sets lado 1
                                  <input value={form.sets1} onChange={(e) => setMatchForm(m.id, { sets1: e.target.value.replace(/[^\d]/g, "") })} />
                                </label>
                                <label>
                                  Sets lado 2
                                  <input value={form.sets2} onChange={(e) => setMatchForm(m.id, { sets2: e.target.value.replace(/[^\d]/g, "") })} />
                                </label>
                                <label>
                                  Games lado 1
                                  <input value={form.games1} onChange={(e) => setMatchForm(m.id, { games1: e.target.value.replace(/[^\d]/g, "") })} />
                                </label>
                                <label>
                                  Games lado 2
                                  <input value={form.games2} onChange={(e) => setMatchForm(m.id, { games2: e.target.value.replace(/[^\d]/g, "") })} />
                                </label>
                                <label>
                                  Vencedor
                                  <select value={form.winnerSide} onChange={(e) => setMatchForm(m.id, { winnerSide: e.target.value as "1" | "2" })}>
                                    <option value="1">Lado 1</option>
                                    <option value="2">Lado 2</option>
                                  </select>
                                </label>
                                <label>
                                  Resumo
                                  <input value={form.summary} onChange={(e) => setMatchForm(m.id, { summary: e.target.value })} placeholder="Opcional" />
                                </label>
                              </div>
                              <label style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                                <input type="checkbox" checked={form.isWo} onChange={(e) => setMatchForm(m.id, { isWo: e.target.checked })} />
                                Resultado por WO
                              </label>
                              <div className="modal-actions">
                                <button onClick={() => void onSubmitResult(m)} disabled={busy}>
                                  Enviar resultado
                                </button>
                              </div>
                              {subs.length ? (
                                <div className="league-submission-list">
                                  {subs.map((s) => (
                                    <div key={s.id} className="league-submission-row">
                                      <span>
                                        Submissao em {formatDateTime(s.createdAt)} | Status: {s.status}
                                      </span>
                                      {s.status === "pending" ? (
                                        <span>
                                          <button onClick={() => void onConfirmSubmission(m.id, s.id, true)} disabled={busy}>
                                            Confirmar
                                          </button>
                                          <button className="danger" onClick={() => void onConfirmSubmission(m.id, s.id, false)} disabled={busy}>
                                            Disputar
                                          </button>
                                        </span>
                                      ) : null}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="subtle">Sem submissao enviada.</p>
                              )}
                            </section>
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              ))}
            </section>
          ) : null}
        </>
      ) : null}
    </AppShell>
  );
}
