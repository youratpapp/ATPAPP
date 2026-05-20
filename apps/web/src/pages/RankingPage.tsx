import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { AppShell } from "../components/AppShell";
import { MetricCard, VisualHeroCard } from "../components/AppPrimitives";
import { PlayerProfileLink } from "../components/PlayerProfileLink";
import { PublishingKit } from "../components/PublishingKit";
import { ScreenState } from "../components/ScreenState";
import rankingHeroImage from "../assets/pdark-ranking-desktop-hero.png";
import { loadLeagueDetails, loadMyLeagues } from "../lib/leagues";
import { loadPublicRankings } from "../lib/rankings";
import { followUser, listFollowingIds, unfollowUser } from "../lib/social";
import type { LeagueDetails, LeagueSummary, Profile, PublicRankingRow } from "../lib/types";

type Props = {
  user: User;
  profile: Profile | null;
};

type RankingScope = "general" | "city" | "league";

const INITIAL_RANKING_LIMIT = 12;
const RANKING_PAGE_INCREMENT = 24;

function classLabel(row: PublicRankingRow): string {
  return [row.categoryName, row.className].filter(Boolean).join(" / ") || "Classe geral";
}

function locationLabel(row: PublicRankingRow): string {
  return [row.city, row.state].filter(Boolean).join(" - ") || "Local não informado";
}

function winRate(row: PublicRankingRow): number {
  const total = row.wins + row.losses;
  if (total <= 0) return 0;
  return Math.round((row.wins / total) * 100);
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "AT";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

function leagueTypeLabel(value: LeagueDetails["leagueType"] | LeagueSummary["leagueType"] | undefined): string {
  if (value === "dupla_fixa") return "Dupla fixa";
  if (value === "dupla_rotativa") return "Dupla rotativa";
  return "Simples";
}

function matchFormatLabel(value: string | undefined): string {
  if (value === "set_unico") return "Set unico";
  if (value === "super_tiebreak") return "Super tie-break";
  if (value === "melhor_de_3_com_super") return "Melhor de 3 com super tie-break";
  return "Melhor de 3";
}

function roundIntervalLabel(value: string | undefined, days: number): string {
  if (value === "semanal") return "Rodada semanal";
  if (value === "mensal") return "Rodada mensal";
  if (days > 0) return `A cada ${days} dias`;
  return "Rodada quinzenal";
}

export function RankingPage({ user, profile }: Props) {
  const [scope, setScope] = useState<RankingScope>("general");
  const [leagueId, setLeagueId] = useState("");
  const [seasonId, setSeasonId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [leagues, setLeagues] = useState<LeagueSummary[]>([]);
  const [selectedLeagueDetails, setSelectedLeagueDetails] = useState<LeagueDetails | null>(null);
  const [rows, setRows] = useState<PublicRankingRow[]>([]);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [busyFollowId, setBusyFollowId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [visibleLimit, setVisibleLimit] = useState(INITIAL_RANKING_LIMIT);

  useEffect(() => {
    let alive = true;
    loadMyLeagues()
      .then((items) => {
        if (alive) setLeagues(items.filter((league) => league.status !== "draft"));
      })
      .catch(() => {
        if (alive) setLeagues([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  const selectedLeague = useMemo(() => leagues.find((league) => league.id === leagueId) || null, [leagueId, leagues]);
  const availableSeasons = useMemo(() => selectedLeagueDetails?.seasons || [], [selectedLeagueDetails?.seasons]);

  useEffect(() => {
    if (scope !== "league") {
      setLeagueId("");
      setSeasonId("");
      setSelectedLeagueDetails(null);
      return;
    }
    if (!leagueId && leagues.length > 0) {
      setLeagueId(leagues[0]!.id);
    }
  }, [leagueId, leagues, scope]);

  useEffect(() => {
    let alive = true;
    if (scope !== "league" || !leagueId) {
      setSelectedLeagueDetails(null);
      return () => {
        alive = false;
      };
    }
    loadLeagueDetails(leagueId)
      .then((details) => {
        if (alive) setSelectedLeagueDetails(details);
      })
      .catch(() => {
        if (alive) setSelectedLeagueDetails(null);
      });
    return () => {
      alive = false;
    };
  }, [leagueId, scope]);

  useEffect(() => {
    if (scope !== "league") return;
    if (!selectedLeague) return;
    if (seasonId && availableSeasons.some((season) => season.id === seasonId)) return;
    setSeasonId(availableSeasons.find((season) => season.status === "active")?.id || availableSeasons[0]?.id || "");
  }, [availableSeasons, scope, seasonId, selectedLeague]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    setRows([]);
    loadPublicRankings({
      state: scope === "city" ? profile?.state || "" : "",
      city: scope === "city" ? profile?.city || "" : "",
      leagueId: scope === "league" ? leagueId : "",
      seasonId: scope === "league" ? seasonId : "",
    })
      .then((items) => {
        if (alive) setRows(items);
      })
      .catch((err) => {
        if (alive) {
          console.warn("Ranking load failed", err);
          setError("Não conseguimos carregar o ranking agora. Tente novamente em instantes.");
        }
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [leagueId, profile?.city, profile?.state, scope, seasonId]);

  useEffect(() => {
    setVisibleLimit(INITIAL_RANKING_LIMIT);
  }, [classFilter, leagueId, scope, searchQuery, seasonId]);

  useEffect(() => {
    let alive = true;
    const candidateIds = rows.map((row) => row.userId || "").filter(Boolean);
    listFollowingIds(user, candidateIds)
      .then((ids) => {
        if (alive) setFollowingIds(ids);
      })
      .catch(() => {
        if (alive) setFollowingIds(new Set());
      });
    return () => {
      alive = false;
    };
  }, [rows, user]);

  const classOptions = useMemo(() => {
    return Array.from(new Set(rows.map(classLabel))).sort((a, b) => a.localeCompare(b));
  }, [rows]);
  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return rows.filter((row) => {
      const rowClassLabel = classLabel(row);
      const text = [row.displayName, row.leagueName, row.seasonName, rowClassLabel, locationLabel(row)]
        .join(" ")
        .toLowerCase();
      return (!classFilter || rowClassLabel === classFilter) && (!query || text.includes(query));
    });
  }, [classFilter, rows, searchQuery]);

  useEffect(() => {
    if (classFilter && !classOptions.includes(classFilter)) {
      setClassFilter("");
    }
  }, [classFilter, classOptions]);

  const visibleRows = filteredRows.slice(0, visibleLimit);
  const podiumRows = filteredRows.slice(0, 3);
  const myRows = filteredRows.filter((row) => row.userId === user.id).slice(0, 3);
  const leader = filteredRows[0] || null;
  const myPrimaryRow = myRows[0] || null;
  const myPrimaryIndex = myPrimaryRow ? filteredRows.findIndex((row) => row.leaguePlayerId === myPrimaryRow.leaguePlayerId) : -1;
  const playerAboveMe = myPrimaryIndex > 0 ? filteredRows[myPrimaryIndex - 1] : null;
  const myGapToLeader = leader && myPrimaryRow ? Math.max(0, leader.rankingPoints - myPrimaryRow.rankingPoints) : 0;
  const totalPlayers = filteredRows.length;
  const totalMatches = filteredRows.reduce((acc, row) => acc + row.matchesPlayed, 0);
  const averagePoints = totalPlayers > 0
    ? Math.round(filteredRows.reduce((acc, row) => acc + row.rankingPoints, 0) / totalPlayers)
    : 0;
  const scopeLabel = scope === "city"
    ? [profile?.city, profile?.state].filter(Boolean).join(" - ") || "Minha cidade"
    : scope === "league"
    ? selectedLeague?.name || "Liga / clube"
    : "Ranking geral";
  const isInitialLoading = loading && rows.length === 0;
  const hasActiveFilters = Boolean(searchQuery.trim() || classFilter || scope !== "general");
  const hasMoreRows = filteredRows.length > visibleRows.length;
  const clearFilters = () => {
    setScope("general");
    setSearchQuery("");
    setClassFilter("");
    setLeagueId("");
    setSeasonId("");
  };
  const recorteCountLabel = isInitialLoading
    ? "Carregando recorte..."
    : `${filteredRows.length} jogador${filteredRows.length === 1 ? "" : "es"} encontrado${filteredRows.length === 1 ? "" : "s"}`;
  const activeSeason = useMemo(
    () => availableSeasons.find((season) => season.id === seasonId) || availableSeasons[0] || null,
    [availableSeasons, seasonId]
  );
  const rankingRaceRows = useMemo(() => {
    const firstPoints = filteredRows[0]?.rankingPoints || 0;
    return filteredRows.slice(0, 5).map((row, index) => ({
      ...row,
      effectivePosition: row.position || index + 1,
      gapToLeader: Math.max(0, firstPoints - row.rankingPoints),
    }));
  }, [filteredRows]);
  const classBreakdownRows = useMemo(() => {
    const grouped = new Map<string, PublicRankingRow[]>();
    filteredRows.forEach((row) => {
      const key = classLabel(row);
      grouped.set(key, [...(grouped.get(key) || []), row]);
    });
    return Array.from(grouped.entries())
      .map(([label, items]) => {
        const sorted = [...items].sort((a, b) => b.rankingPoints - a.rankingPoints);
        const matches = items.reduce((acc, row) => acc + row.matchesPlayed, 0);
        const activePlayers = items.filter((row) => row.matchesPlayed > 0).length;
        return {
          label,
          players: items.length,
          activePlayers,
          matches,
          leader: sorted[0]?.displayName || "Sem líder",
          leaderPoints: sorted[0]?.rankingPoints || 0,
        };
      })
      .sort((a, b) => b.players - a.players || b.matches - a.matches)
      .slice(0, 6);
  }, [filteredRows]);
  const classCount = classOptions.length;
  const highActivityPlayers = filteredRows.filter((row) => row.matchesPlayed >= 3).length;
  const playersWithMatches = filteredRows.filter((row) => row.matchesPlayed > 0).length;
  const rankingCompleteness = totalPlayers > 0 ? Math.round((playersWithMatches / totalPlayers) * 100) : 0;
  const exportRankingCsv = () => {
    const header = ["posição", "jogador", "liga", "temporada", "classe", "cidade", "vitórias", "derrotas", "jogos", "pontos"];
    const lines = visibleRows.map((row, index) => [
      row.position || index + 1,
      row.displayName,
      row.leagueName,
      row.seasonName,
      classLabel(row),
      locationLabel(row),
      row.wins,
      row.losses,
      row.matchesPlayed,
      row.rankingPoints,
    ].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","));
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ranking-${scope}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setFeedback("Ranking exportado em CSV.");
  };
  const copyRankingSnapshot = async () => {
    const lines = [
      `Ranking - ${scopeLabel}`,
      `${filteredRows.length} jogadores | ${totalMatches} jogos | media ${averagePoints} pts`,
      classFilter ? `Classe: ${classFilter}` : `Classes: ${classCount}`,
      "",
      ...visibleRows.slice(0, 10).map((row, index) => `#${row.position || index + 1} ${row.displayName} - ${row.rankingPoints} pts (${row.wins}-${row.losses})`),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setFeedback("Resumo do ranking copiado.");
    } catch {
      setFeedback("Não foi possível copiar o ranking agora.");
    }
  };
  const selectedRules = selectedLeagueDetails
    ? [
        { label: "Formato", value: `${leagueTypeLabel(selectedLeagueDetails.leagueType)} - ${matchFormatLabel(selectedLeagueDetails.matchFormat)}` },
        { label: "Rodadas", value: `${selectedLeagueDetails.roundsTotal || activeSeason?.currentRoundNumber || 0} previstas` },
        { label: "Prazo de resultado", value: `${selectedLeagueDetails.resultDeadlineDays || 0} dias` },
        { label: "Intervalo", value: roundIntervalLabel(selectedLeagueDetails.roundInterval, selectedLeagueDetails.roundIntervalDays) },
        { label: "Sobe / desce", value: `${selectedLeagueDetails.promotedCount || 0} sobem / ${selectedLeagueDetails.relegatedCount || 0} descem` },
        { label: "Recessos", value: `${selectedLeagueDetails.maxRecesses || 0} por temporada` },
      ]
    : [
        { label: "Recorte", value: scopeLabel },
        { label: "Classes", value: `${classCount || 0} em exibicao` },
        { label: "Jogadores ativos", value: `${highActivityPlayers} com 3+ jogos` },
        { label: "Criterio atual", value: "Pontos, vitórias e jogos lancados" },
      ];

  const onToggleFollow = async (targetUserId: string) => {
    if (!targetUserId || targetUserId === user.id) return;
    setBusyFollowId(targetUserId);
    setError("");
    try {
      if (followingIds.has(targetUserId)) {
        await unfollowUser(user, targetUserId);
        setFollowingIds((prev) => {
          const next = new Set(prev);
          next.delete(targetUserId);
          return next;
        });
      } else {
        await followUser(user, targetUserId);
        setFollowingIds((prev) => new Set(prev).add(targetUserId));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao atualizar seguidores.");
    } finally {
      setBusyFollowId("");
    }
  };

  return (
    <AppShell user={user} profile={profile} showHeader={false}>
      <VisualHeroCard
        className="ranking-visual-hero"
        backgroundImage={rankingHeroImage}
        eyebrow="Ranking"
        title="Ranking ATP"
        subtitle="Acompanhe sua posicao, encontre recortes e veja quem esta em alta."
        tone="light"
      />

      <section className="ranking-player-overview">
        <MetricCard
          className="ranking-player-position"
          label="Minha posicao"
          value={isInitialLoading ? "..." : myPrimaryRow ? `#${myPrimaryRow.position || myPrimaryIndex + 1}` : "-"}
          meta={
            isInitialLoading
              ? "Buscando seu recorte"
              : myPrimaryRow
                ? `${myPrimaryRow.rankingPoints} pts em ${myPrimaryRow.leagueName}`
                : "Use filtros para encontrar rankings onde voce participa."
          }
        />
        <div className="ranking-player-position ranking-player-position-copy">
          <span>Minha posição</span>
          {isInitialLoading ? (
            <>
              <strong>...</strong>
              <h2>Buscando seu recorte</h2>
              <p>Estamos carregando ligas, classes e jogadores para montar a leitura correta.</p>
            </>
          ) : myPrimaryRow ? (
            <>
              <strong>#{myPrimaryRow.position || myPrimaryIndex + 1}</strong>
              <h2>{classLabel(myPrimaryRow)}</h2>
              <p>
                {myPrimaryRow.rankingPoints} pts em {myPrimaryRow.leagueName}
                {myGapToLeader > 0 ? ` | ${myGapToLeader} pts do líder` : " | você lídera este recorte"}
              </p>
            </>
          ) : (
            <>
              <strong>-</strong>
              <h2>Você ainda não aparece neste recorte</h2>
              <p>Use filtros de liga, cidade ou classe para encontrar rankings onde você participa.</p>
            </>
          )}
        </div>
        <div className="ranking-player-context">
          <span>Recorte atual</span>
          <strong>{scopeLabel}</strong>
          <small>{recorteCountLabel}</small>
          {!isInitialLoading && playerAboveMe ? <small>Acima de você: {playerAboveMe.displayName} ({playerAboveMe.rankingPoints} pts)</small> : null}
          {!isInitialLoading && leader && !myPrimaryRow ? <small>Lider: {leader.displayName} ({leader.rankingPoints} pts)</small> : null}
        </div>
      </section>

      <section className="ranking-control-panel">
        <div className="ranking-scope-tabs">
          <button className={scope === "general" ? "active" : ""} onClick={() => setScope("general")}>
            Geral
          </button>
          <button className={scope === "city" ? "active" : ""} onClick={() => setScope("city")}>
            Minha cidade
          </button>
          <button className={scope === "league" ? "active" : ""} onClick={() => setScope("league")}>
            Liga / clube
          </button>
        </div>

        {scope === "league" ? (
          <div className="ranking-filters">
            <select value={leagueId} onChange={(event) => setLeagueId(event.target.value)}>
              {leagues.map((league) => (
                <option key={league.id} value={league.id}>
                  {league.name}
                </option>
              ))}
            </select>
            <select value={seasonId} onChange={(event) => setSeasonId(event.target.value)} disabled={!availableSeasons.length}>
              {availableSeasons.map((season) => (
                <option key={season.id} value={season.id}>
                  {season.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <div className="ranking-filters">
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Buscar jogador, liga ou cidade"
          />
          <select value={classFilter} onChange={(event) => setClassFilter(event.target.value)}>
            <option value="">Todas as classes</option>
            {classOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <p className="ranking-filter-summary">
          {isInitialLoading
            ? "Carregando jogadores..."
            : `${filteredRows.length} de ${rows.length} jogador${rows.length === 1 ? "" : "es"} neste recorte`}
          {classFilter ? ` | ${classFilter}` : ""}
        </p>
        {hasActiveFilters ? (
          <div className="ranking-filter-actions">
            <button type="button" className="quiet" onClick={clearFilters}>
              Limpar filtros
            </button>
          </div>
        ) : null}
      </section>

      {scope === "city" && (!profile?.city || !profile?.state) ? (
        <ScreenState
          kind="error"
          icon="Perfil incompleto"
          title="Cidade e UF ainda não foram definidos"
          detail="Complete seu perfil para ver o ranking local com contexto correto."
        />
      ) : null}
      {error ? <ScreenState kind="error" title="Não foi possível carregar o ranking" detail={error} /> : null}
      {feedback ? <p className="feedback success">{feedback}</p> : null}
      {isInitialLoading ? <ScreenState kind="loading" icon="Ranking" title="Carregando ranking" detail="Buscando jogadores, ligas e recortes disponíveis." /> : null}

      {!loading && podiumRows.length ? (
        <section className="ranking-podium-strip" aria-label="Top 3 do ranking">
          <div className="ranking-podium-headline">
            <span>Em destaque</span>
            <h2>Top 3 do recorte</h2>
          </div>
          <div className="ranking-podium-cards">
            {podiumRows.map((row, index) => (
              <article key={`ranking-podium:${row.leaguePlayerId}:${index}`} className={`ranking-podium-card rank-${index + 1}`}>
                <span className="ranking-podium-position">#{row.position || index + 1}</span>
                <span className="ranking-avatar" aria-hidden>{initialsFromName(row.displayName)}</span>
                <div>
                  <strong><PlayerProfileLink userId={row.userId} name={row.displayName} /></strong>
                  <small>{row.leagueName}</small>
                </div>
                <b>{row.rankingPoints} pts</b>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {!loading && !visibleRows.length ? (
        <ScreenState
          icon="Sem resultado"
          title="Nenhum ranking encontrado para este filtro"
          detail="Ajuste busca, classe, liga ou temporada para ampliar o recorte."
          action={
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setClassFilter("");
              }}
            >
              Limpar filtros
            </button>
          }
        />
      ) : null}

      {!loading && visibleRows.length ? (
        <section className="ranking-list-shell">
          <div className="ranking-list-head">
            <div>
              <span>Ranking do recorte</span>
              <h2>{myPrimaryRow ? "Top jogadores e sua posição" : "Top jogadores"}</h2>
            </div>
            <small>
              Mostrando {visibleRows.length} de {filteredRows.length}
            </small>
          </div>
          <div className="ranking-table">
            <div className="ranking-row head">
              <span>#</span>
              <span>Jogador</span>
              <span>Liga</span>
              <span>V-D</span>
              <span>Pts</span>
              <span></span>
            </div>
            {visibleRows.map((row, index) => (
              <div key={`${row.leaguePlayerId}:${index}`} className={row.userId === user.id ? "ranking-row mine" : "ranking-row"}>
                <span>{row.position || index + 1}</span>
                <span className="ranking-player-cell">
                  <span className="ranking-avatar" aria-hidden>{initialsFromName(row.displayName)}</span>
                  <span>
                    <strong><PlayerProfileLink userId={row.userId} name={row.displayName} /></strong>
                    <small>{locationLabel(row)}</small>
                  </span>
                </span>
                <span>
                  <strong>{row.leagueName}</strong>
                  <small>
                    {row.seasonName} - {classLabel(row)}
                  </small>
                </span>
                <span>
                  <strong>{row.wins}-{row.losses}</strong>
                  <small>{winRate(row)}%</small>
                </span>
                <span>{row.rankingPoints}</span>
                <span>
                  {row.userId && row.userId !== user.id ? (
                    <button
                      className={followingIds.has(row.userId) ? "ranking-follow-button active" : "ranking-follow-button"}
                      onClick={() => void onToggleFollow(row.userId!)}
                      disabled={busyFollowId === row.userId}
                    >
                      {followingIds.has(row.userId) ? "Seguindo" : "Seguir"}
                    </button>
                  ) : null}
                </span>
              </div>
            ))}
          </div>
          {hasMoreRows ? (
            <div className="ranking-load-more">
              <button
                type="button"
                className="secondary"
                onClick={() => setVisibleLimit((current) => Math.min(filteredRows.length, current + RANKING_PAGE_INCREMENT))}
              >
                Ver mais jogadores
              </button>
            </div>
          ) : null}
        </section>
      ) : null}

      {!loading && filteredRows.length > 0 ? (
        <details className="ranking-secondary-panel">
          <summary>Ver regras, resumo e ferramentas</summary>
          {leader ? (
            <section className="ranking-feature-grid">
              <article className="ranking-leader-card">
                <span>Lider do recorte</span>
                <strong>#{leader.position || 1} {leader.displayName}</strong>
                <small>{leader.leagueName} - {classLabel(leader)}</small>
                <div>
                  <b>{leader.rankingPoints} pts</b>
                  <b>{winRate(leader)}% aproveit.</b>
                  <b>{leader.matchesPlayed} jogos</b>
                </div>
              </article>
              {myPrimaryRow ? (
                <article className="ranking-player-card">
                  <span>Seu momento</span>
                  <strong>#{myPrimaryRow.position || "-"} {myPrimaryRow.displayName}</strong>
                  <small>{myPrimaryRow.leagueName} - {classLabel(myPrimaryRow)}</small>
                  <div>
                    <b>{myPrimaryRow.rankingPoints} pts</b>
                    <b>{myPrimaryRow.wins}-{myPrimaryRow.losses}</b>
                    <b>{winRate(myPrimaryRow)}% aproveit.</b>
                  </div>
                </article>
              ) : (
                <article className="ranking-player-card">
                  <span>Seu momento</span>
                  <strong>Entre em uma liga</strong>
                  <small>Quando você aparecer em uma temporada, sua posição fica destacada aqui.</small>
                </article>
              )}
            </section>
          ) : null}
          <section className="ranking-ops-grid">
            <article className="ranking-rules-card">
              <span>{selectedLeagueDetails ? "Regulamento da liga" : "Como ler este recorte"}</span>
              <h3>{selectedLeagueDetails?.name || scopeLabel}</h3>
              <div>
                {selectedRules.map((rule) => (
                  <p key={rule.label}>
                    <b>{rule.label}</b>
                    <strong>{rule.value}</strong>
                  </p>
                ))}
              </div>
              {activeSeason ? (
                <small>
                  Temporada: {activeSeason.name} - rodada {activeSeason.currentRoundNumber || 0}
                </small>
              ) : (
                <small>Use o filtro de liga para ver temporada, formato e regras de acesso.</small>
              )}
            </article>
            <article className="ranking-race-card">
              <span>Corrida do ranking</span>
              <h3>Disputa pelo topo</h3>
              <div>
                {rankingRaceRows.map((row) => (
                  <p key={`race:${row.leaguePlayerId}`}>
                    <b>#{row.effectivePosition}</b>
                    <strong>{row.displayName}</strong>
                    <em>{row.gapToLeader === 0 ? "líder" : `${row.gapToLeader} pts atras`}</em>
                  </p>
                ))}
              </div>
              <small>{classFilter || "Todas as classes"} - {totalMatches} jogos no recorte</small>
            </article>
            <article className="ranking-class-map-card">
              <span>Mapa de classes</span>
              <h3>Onde a liga esta viva</h3>
              <div>
                {classBreakdownRows.map((row) => (
                  <p key={`class-map:${row.label}`}>
                    <b>{row.label}</b>
                    <strong>{row.players} jogadores - {row.matches} jogos</strong>
                    <em>{row.leader} - {row.leaderPoints} pts</em>
                  </p>
                ))}
              </div>
              <small>{rankingCompleteness}% dos jogadores ja possuem partida lancada neste recorte.</small>
            </article>
            <article className="ranking-tools-card">
              <PublishingKit
                eyebrow="Ferramentas"
                title="Publicacao e gestao"
                hint="Copie o top 10 para WhatsApp ou exporte CSV para conferencia interna do clube."
                actions={
                  <>
                    <button onClick={() => void copyRankingSnapshot()} disabled={!visibleRows.length}>
                      Copiar top 10
                    </button>
                    <button className="primary" onClick={exportRankingCsv} disabled={!visibleRows.length}>
                      Exportar CSV
                    </button>
                  </>
                }
              />
              <small>Use junto dos filtros de liga, temporada, classe e busca.</small>
            </article>
          </section>
        </details>
      ) : null}
    </AppShell>
  );
}

