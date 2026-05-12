import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { AppShell } from "../components/AppShell";
import { loadLeagueDetails, loadMyLeagues } from "../lib/leagues";
import { loadPublicRankings } from "../lib/rankings";
import { followUser, listFollowingIds, unfollowUser } from "../lib/social";
import type { LeagueDetails, LeagueSummary, Profile, PublicRankingRow } from "../lib/types";

type Props = {
  user: User;
  profile: Profile | null;
};

type RankingScope = "general" | "city" | "league";

function classLabel(row: PublicRankingRow): string {
  return [row.categoryName, row.className].filter(Boolean).join(" / ") || "Classe geral";
}

function locationLabel(row: PublicRankingRow): string {
  return [row.city, row.state].filter(Boolean).join(" - ") || "Local nao informado";
}

export function RankingPage({ user, profile }: Props) {
  const [scope, setScope] = useState<RankingScope>("general");
  const [leagueId, setLeagueId] = useState("");
  const [seasonId, setSeasonId] = useState("");
  const [leagues, setLeagues] = useState<LeagueSummary[]>([]);
  const [selectedLeagueDetails, setSelectedLeagueDetails] = useState<LeagueDetails | null>(null);
  const [rows, setRows] = useState<PublicRankingRow[]>([]);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [busyFollowId, setBusyFollowId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        if (alive) setError(err instanceof Error ? err.message : "Falha ao carregar ranking.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [leagueId, profile?.city, profile?.state, scope, seasonId]);

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

  const visibleRows = rows.slice(0, 80);
  const myRows = rows.filter((row) => row.userId === user.id).slice(0, 3);

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
      <div className="page-header">
        <h1>Ranking</h1>
      </div>

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
        <section className="ranking-filters">
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
        </section>
      ) : null}

      {scope === "city" && (!profile?.city || !profile?.state) ? (
        <p className="feedback error">Complete cidade e UF no perfil para ver o ranking local.</p>
      ) : null}
      {error ? <p className="feedback error">{error}</p> : null}
      {loading ? <p className="subtle">Carregando ranking...</p> : null}

      {!loading && myRows.length > 0 ? (
        <section className="ranking-my-card">
          <strong>Minha posicao</strong>
          {myRows.map((row) => (
            <span key={`mine:${row.leaguePlayerId}`}>
              #{row.position} em {row.leagueName} - {classLabel(row)} ({row.rankingPoints} pts)
            </span>
          ))}
        </section>
      ) : null}

      {!loading && !visibleRows.length ? (
        <div className="empty-state">
          <p>Nenhum ranking encontrado para este filtro.</p>
        </div>
      ) : null}

      {visibleRows.length ? (
        <section className="ranking-table">
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
              <span>
                <strong>{row.displayName}</strong>
                <small>{locationLabel(row)}</small>
              </span>
              <span>
                <strong>{row.leagueName}</strong>
                <small>
                  {row.seasonName} - {classLabel(row)}
                </small>
              </span>
              <span>
                {row.wins}-{row.losses}
              </span>
              <span>{row.rankingPoints}</span>
              <span>
                {row.userId && row.userId !== user.id ? (
                  <button
                    className={followingIds.has(row.userId) ? "" : "primary"}
                    onClick={() => void onToggleFollow(row.userId!)}
                    disabled={busyFollowId === row.userId}
                  >
                    {followingIds.has(row.userId) ? "Seguindo" : "Seguir"}
                  </button>
                ) : null}
              </span>
            </div>
          ))}
        </section>
      ) : null}
    </AppShell>
  );
}
