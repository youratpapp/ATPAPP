import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { AppShell } from "../components/AppShell";
import { StatusBadge } from "../components/StatusBadge";
import { loadTournamentDetails, updateTournamentDetails } from "../lib/tournaments";
import type { Profile, TournamentDetails } from "../lib/types";
import type { ClassData, GroupMatch, KnockoutMatch } from "../tournament-engine/core";
import {
  listLegacyClassesFromTournamentData,
  patchClassDataInTournamentData,
  recomputeClassData,
  type LegacyClassRef,
} from "../tournament-engine/state-adapter";

type Props = {
  user: User;
  profile: Profile | null;
};

type TabKey = "jogos" | "classificacao" | "organizacao";

type Feedback = { kind: "success" | "error" | "info"; text: string };

function asScore(value: string): number | null {
  const v = value.trim();
  if (!v) return null;
  const n = Number.parseInt(v, 10);
  if (Number.isNaN(n)) return null;
  if (n < 0 || n > 99) return null;
  return n;
}

function computeMatchStatus(s1: string, s2: string): { done: boolean; winner: "a" | "b" | null } {
  const a = asScore(s1);
  const b = asScore(s2);
  if (a === null || b === null) return { done: false, winner: null };
  if (a === b) return { done: false, winner: null };
  return { done: true, winner: a > b ? "a" : "b" };
}

function buildFullTournamentUrl(tournamentId: string): string {
  const base = import.meta.env.BASE_URL || "/";
  const normalized = base.endsWith("/") ? base : `${base}/`;
  return `${normalized}tournament-full/index.html?join=${encodeURIComponent(tournamentId)}`;
}

export function TournamentPage({ user, profile }: Props) {
  const navigate = useNavigate();
  const { tournamentId = "" } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [tab, setTab] = useState<TabKey>("jogos");

  const [tournament, setTournament] = useState<TournamentDetails | null>(null);
  const [classes, setClasses] = useState<LegacyClassRef[]>([]);
  const [activeClassKey, setActiveClassKey] = useState("");

  const activeClass = useMemo(
    () => classes.find((c) => c.key === activeClassKey) ?? classes[0] ?? null,
    [classes, activeClassKey]
  );

  const fullUrl = useMemo(() => (tournamentId ? buildFullTournamentUrl(tournamentId) : ""), [tournamentId]);

  useEffect(() => {
    let alive = true;

    async function run() {
      setLoading(true);
      try {
        const details = await loadTournamentDetails(user, tournamentId);
        if (!alive) return;
        setTournament(details);

        const cls = listLegacyClassesFromTournamentData(details.data);
        setClasses(cls);
        setActiveClassKey((prev) => prev || cls[0]?.key || "");
        setFeedback(null);
      } catch (err) {
        if (!alive) return;
        setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao abrir torneio." });
      } finally {
        if (alive) setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [user, tournamentId]);

  const persistClassData = async (ref: LegacyClassRef, nextClassData: ClassData) => {
    if (!tournament) return;
    setSaving(true);
    try {
      const patchedData = patchClassDataInTournamentData(tournament.data, ref, nextClassData);
      const updated = await updateTournamentDetails(user, tournament.id, {
        name: tournament.name,
        city: tournament.city,
        state: tournament.state,
        visibility: tournament.visibility === "public" ? "public" : "private",
        status: tournament.status as "draft" | "registration_open" | "registration_closed" | "live" | "finished",
        startsAt: tournament.startsAt,
        registrationCloseAt: tournament.registrationCloseAt,
        posterUrl: tournament.posterUrl,
        data: patchedData,
      });

      setTournament(updated);
      const cls = listLegacyClassesFromTournamentData(updated.data);
      setClasses(cls);
      setActiveClassKey(ref.key);
      setFeedback({ kind: "success", text: "Atualizado com sucesso." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao salvar alteracoes." });
    } finally {
      setSaving(false);
    }
  };

  const onUpdateGroupScore = async (
    ref: LegacyClassRef,
    groupIndex: number,
    matchIndex: number,
    s1: string,
    s2: string
  ) => {
    const next = structuredClone(ref.data);
    const group = next.grupos[groupIndex];
    const match = group?.matches[matchIndex] as GroupMatch | undefined;
    if (!group || !match) return;

    match.s1 = s1;
    match.s2 = s2;
    const status = computeMatchStatus(s1, s2);
    match.done = status.done;
    match.winner = status.winner === "a" ? match.a : status.winner === "b" ? match.b : null;

    const recomputed = recomputeClassData(next);
    await persistClassData(ref, recomputed);
  };

  const onUpdateKoScore = async (
    ref: LegacyClassRef,
    roundIndex: number,
    matchIndex: number,
    s1: string,
    s2: string
  ) => {
    const next = structuredClone(ref.data);
    const round = next.knockout?.rounds[roundIndex];
    const match = round?.matches[matchIndex] as KnockoutMatch | undefined;
    if (!round || !match) return;

    match.s1 = s1;
    match.s2 = s2;
    const status = computeMatchStatus(s1, s2);
    match.done = status.done;
    match.winner = status.winner === "a" ? match.a : status.winner === "b" ? match.b : null;

    const recomputed = recomputeClassData(next);
    await persistClassData(ref, recomputed);
  };

  return (
    <AppShell user={user} profile={profile} showHeader={false}>
      <div className="page-header" style={{ marginBottom: 12 }}>
        <h1>Torneio</h1>
        <div className="ph-actions">
          <button onClick={() => navigate("/eventos")}>Voltar</button>
          {fullUrl ? (
            <button className="primary" onClick={() => window.open(fullUrl, "_blank", "noopener,noreferrer")}>
              Modo completo
            </button>
          ) : null}
        </div>
      </div>

      {feedback ? (
        <p className={`feedback ${feedback.kind === "success" ? "success" : feedback.kind === "error" ? "error" : ""}`}>
          {feedback.text}
        </p>
      ) : null}

      {loading ? <p className="subtle">Carregando...</p> : null}

      {!loading && tournament ? (
        <>
          <article className="card" style={{ marginBottom: 12 }}>
            <div className="section-title" style={{ marginBottom: 8 }}>
              <h2>{tournament.name}</h2>
              <StatusBadge status={tournament.status} />
            </div>
            <p className="subtle" style={{ margin: 0 }}>
              {[tournament.city, tournament.state].filter(Boolean).join(" - ") || "Local a definir"}
            </p>
          </article>

          <div className="tabs" style={{ marginBottom: 12 }}>
            <button className={tab === "jogos" ? "active" : ""} onClick={() => setTab("jogos")}>
              Jogos
            </button>
            <button className={tab === "classificacao" ? "active" : ""} onClick={() => setTab("classificacao")}>
              Classificacao
            </button>
            <button className={tab === "organizacao" ? "active" : ""} onClick={() => setTab("organizacao")}>
              Organizacao
            </button>
          </div>

          <section className="card" style={{ marginBottom: 12 }}>
            <label>Classe ativa</label>
            <select
              value={activeClass?.key ?? ""}
              onChange={(e) => setActiveClassKey(e.target.value)}
              disabled={classes.length === 0}
            >
              {classes.length === 0 ? <option value="">Sem classes cadastradas</option> : null}
              {classes.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.categoryName} / {c.className}
                </option>
              ))}
            </select>
            <p className="subtle" style={{ marginBottom: 0 }}>
              Esta tela usa engine TypeScript (mesmas regras de grupos, mata-mata e classificacao), sem simplificar comportamento.
            </p>
          </section>

          {tab === "jogos" ? (
            <section className="card">
              {!activeClass ? <p className="subtle">Sem classe ativa.</p> : null}

              {activeClass?.data.grupos.map((g, gi) => (
                <div key={`${activeClass.key}:g:${g.name}`} style={{ marginBottom: 14 }}>
                  <h3 style={{ marginBottom: 8 }}>{g.name}</h3>
                  {g.matches.length === 0 ? <p className="subtle">Sem partidas no grupo.</p> : null}
                  {g.matches.map((m, mi) => (
                    <div key={`${activeClass.key}:g:${gi}:${mi}`} style={{ borderTop: "1px solid var(--color-border)", padding: "8px 0" }}>
                      <div style={{ fontSize: 14, marginBottom: 6 }}>
                        {m.a || "A definir"} x {m.b || "A definir"}
                      </div>
                      <div className="cluster">
                        <input
                          style={{ width: 80 }}
                          value={m.s1}
                          onChange={(e) => {
                            const s1 = e.target.value.replace(/[^0-9]/g, "");
                            onUpdateGroupScore(activeClass, gi, mi, s1, m.s2);
                          }}
                          disabled={saving}
                        />
                        <input
                          style={{ width: 80 }}
                          value={m.s2}
                          onChange={(e) => {
                            const s2 = e.target.value.replace(/[^0-9]/g, "");
                            onUpdateGroupScore(activeClass, gi, mi, m.s1, s2);
                          }}
                          disabled={saving}
                        />
                        <span className="subtle">{m.done ? "Finalizado" : "Pendente"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {activeClass?.data.knockout?.rounds.map((round, ri) => (
                <div key={`${activeClass.key}:ko:${ri}`} style={{ marginBottom: 14 }}>
                  <h3 style={{ marginBottom: 8 }}>{round.name}</h3>
                  {round.matches.length === 0 ? <p className="subtle">Sem partidas nesta fase.</p> : null}
                  {round.matches.map((m, mi) => (
                    <div key={`${activeClass.key}:ko:${ri}:${mi}`} style={{ borderTop: "1px solid var(--color-border)", padding: "8px 0" }}>
                      <div style={{ fontSize: 14, marginBottom: 6 }}>
                        {m.a || "A definir"} x {m.b || "A definir"}
                      </div>
                      <div className="cluster">
                        <input
                          style={{ width: 80 }}
                          value={m.s1}
                          onChange={(e) => {
                            const s1 = e.target.value.replace(/[^0-9]/g, "");
                            onUpdateKoScore(activeClass, ri, mi, s1, m.s2);
                          }}
                          disabled={saving || !m.a || !m.b}
                        />
                        <input
                          style={{ width: 80 }}
                          value={m.s2}
                          onChange={(e) => {
                            const s2 = e.target.value.replace(/[^0-9]/g, "");
                            onUpdateKoScore(activeClass, ri, mi, m.s1, s2);
                          }}
                          disabled={saving || !m.a || !m.b}
                        />
                        <span className="subtle">{m.done ? "Finalizado" : "Pendente"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {!activeClass?.data.grupos.length && !activeClass?.data.knockout ? (
                <p className="subtle">Ainda sem jogos gerados nesta classe.</p>
              ) : null}
            </section>
          ) : null}

          {tab === "classificacao" ? (
            <section className="card">
              {!activeClass ? <p className="subtle">Sem classe ativa.</p> : null}
              {activeClass
                ? Object.keys(activeClass.data.tabelaPorGrupo).map((groupName) => {
                    const rows = activeClass.data.tabelaPorGrupo[groupName] ?? [];
                    return (
                      <div key={`${activeClass.key}:table:${groupName}`} style={{ marginBottom: 14 }}>
                        <h3 style={{ marginBottom: 8 }}>{groupName}</h3>
                        {rows.length === 0 ? <p className="subtle">Sem dados de classificacao.</p> : null}
                        {rows.map((row, idx) => (
                          <div key={`${activeClass.key}:table:${groupName}:${idx}`} style={{ borderTop: "1px solid var(--color-border)", padding: "8px 0", display: "flex", justifyContent: "space-between", gap: 8 }}>
                            <span>{idx + 1}. {row[0]}</span>
                            <span className="subtle">V:{row[1].v} J:{row[1].j} SG:{row[1].saldo}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })
                : null}
              {activeClass && Object.keys(activeClass.data.tabelaPorGrupo).length === 0 ? (
                <p className="subtle">Sem tabela para esta classe.</p>
              ) : null}
            </section>
          ) : null}

          {tab === "organizacao" ? (
            <section className="card">
              <h3 style={{ marginTop: 0 }}>Resumo tecnico</h3>
              {!activeClass ? <p className="subtle">Sem classe ativa.</p> : null}
              {activeClass ? (
                <>
                  <p className="subtle">Formato: {activeClass.data.config.formato}</p>
                  <p className="subtle">Entradas: {activeClass.data.entradas.length}</p>
                  <p className="subtle">Grupos: {activeClass.data.grupos.length}</p>
                  <p className="subtle">Knockout: {activeClass.data.knockout ? "sim" : "nao"}</p>
                </>
              ) : null}
              <p className="subtle" style={{ marginTop: 12 }}>
                Proximo bloco da migracao: wizard + agenda + operacoes (reset/export) mantendo paridade com o HTML legado.
              </p>
            </section>
          ) : null}
        </>
      ) : null}
    </AppShell>
  );
}
