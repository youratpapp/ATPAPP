import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Link, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { ScreenState } from "../components/ScreenState";
import { useToast } from "../components/toast";
import { fetchPrivatePlayerNote, fetchPublicProfile, savePrivatePlayerNote } from "../lib/profiles";
import { loadPublicRankings } from "../lib/rankings";
import type { Profile, PublicRankingRow } from "../lib/types";

type Props = {
  user: User;
  profile: Profile | null;
};

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "AT";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

function classLabel(row: PublicRankingRow): string {
  return [row.categoryName, row.className].filter(Boolean).join(" / ") || "Classe geral";
}

function winRate(wins: number, losses: number): number {
  const total = wins + losses;
  if (total <= 0) return 0;
  return Math.round((wins / total) * 100);
}

export function PublicPlayerPage({ user, profile }: Props) {
  const { playerId = "" } = useParams();
  const toast = useToast();
  const [player, setPlayer] = useState<Profile | null>(null);
  const [rankings, setRankings] = useState<PublicRankingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [privateNote, setPrivateNote] = useState("");
  const [noteLoaded, setNoteLoaded] = useState(false);
  const [noteDirty, setNoteDirty] = useState(false);
  const [noteStatus, setNoteStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const isOwnProfile = playerId === user.id;

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      setNoteLoaded(false);
      setNoteDirty(false);
      setNoteStatus("idle");
      try {
        const [nextPlayer, rankingRows, nextNote] = await Promise.all([
          fetchPublicProfile(playerId),
          loadPublicRankings().catch(() => []),
          !isOwnProfile ? fetchPrivatePlayerNote(user, playerId).catch(() => "") : Promise.resolve(""),
        ]);
        if (!active) return;
        setPlayer(nextPlayer);
        setRankings(rankingRows.filter((row) => row.userId === playerId));
        setPrivateNote(nextNote);
        setNoteLoaded(true);
      } catch (err) {
        if (!active) return;
        console.error(err);
        setError("Nao conseguimos carregar este perfil agora.");
      } finally {
        if (active) setLoading(false);
      }
    }
    if (playerId) void load();
    return () => {
      active = false;
    };
  }, [isOwnProfile, playerId, user]);

  useEffect(() => {
    if (!noteLoaded || !noteDirty || isOwnProfile) return undefined;
    setNoteStatus("saving");
    const timer = window.setTimeout(() => {
      void savePrivatePlayerNote(user, playerId, privateNote)
        .then(() => {
          setNoteDirty(false);
          setNoteStatus("saved");
        })
        .catch((err) => {
          console.error(err);
          setNoteStatus("error");
          toast.showToast({ kind: "error", text: "Nao foi possivel salvar sua anotacao privada." });
        });
    }, 700);
    return () => window.clearTimeout(timer);
  }, [isOwnProfile, noteDirty, noteLoaded, playerId, privateNote, toast, user]);

  const stats = useMemo(() => {
    const totals = rankings.reduce(
      (acc, row) => {
        acc.matches += row.matchesPlayed;
        acc.wins += row.wins;
        acc.losses += row.losses;
        acc.points = Math.max(acc.points, row.rankingPoints);
        return acc;
      },
      { matches: 0, wins: 0, losses: 0, points: 0 }
    );
    return { ...totals, winRate: winRate(totals.wins, totals.losses) };
  }, [rankings]);

  const competitions = useMemo(() => rankings.slice(0, 8), [rankings]);
  const playerName = player?.displayName || "Jogador";
  const isPrivateProfile = Boolean(player && player.profileVisibility === "private" && !isOwnProfile);
  const location = [player?.city, player?.state].filter(Boolean).join(" - ");

  return (
    <AppShell user={user} profile={profile} showHeader={false}>
      <div className="page-shell player-public-page">
        <Link className="back-link" to="/ranking">Voltar</Link>

        {loading ? (
          <ScreenState title="Carregando perfil..." />
        ) : error ? (
          <ScreenState title="Perfil indisponivel" detail={error} />
        ) : !player ? (
          <ScreenState title="Jogador nao encontrado" detail="Este perfil ainda nao possui dados publicos." />
        ) : (
          <>
            <section className="player-public-hero">
              <div className="player-public-avatar" aria-hidden>
                {player.photoUrl ? <img src={player.photoUrl} alt="" /> : initialsFromName(playerName)}
              </div>
              <div>
                <span>Perfil do jogador</span>
                <h1>{playerName}</h1>
                {isPrivateProfile ? <p>Perfil privado</p> : location ? <p>{location}</p> : <p>Local nao informado</p>}
                {!isPrivateProfile && player.bio ? <small>{player.bio}</small> : null}
              </div>
            </section>

            {isPrivateProfile ? (
              <section className="player-private-profile-notice">
                <strong>Este jogador escolheu manter o perfil privado.</strong>
                <span>Dados pessoais e vitrine publica ficam ocultos. Historico competitivo, confrontos diretos e informacoes necessarias da competicao continuam disponiveis quando existirem.</span>
              </section>
            ) : null}

            <section className="player-public-stats" aria-label="Resumo competitivo">
              <article>
                <span>Partidas</span>
                <strong>{stats.matches}</strong>
              </article>
              <article>
                <span>Vitorias</span>
                <strong>{stats.wins}</strong>
              </article>
              <article>
                <span>Aproveitamento</span>
                <strong>{stats.winRate}%</strong>
              </article>
              <article>
                <span>Melhor pontuacao</span>
                <strong>{stats.points}</strong>
              </article>
            </section>

            {!isOwnProfile ? (
              <section className="player-head-to-head-card">
                <div>
                  <span>Confronto direto</span>
                  <h2>Voce x {playerName}</h2>
                </div>
                <p>Historico direto sera exibido aqui quando houver partidas registradas entre voces.</p>
              </section>
            ) : null}

            {!isOwnProfile ? (
              <section className="player-private-note-card">
                <div className="section-title">
                  <div>
                    <span>Scouting privado</span>
                    <h2>Suas anotacoes sobre este jogador</h2>
                  </div>
                  <small>
                    {noteStatus === "saving" ? "Salvando..." : noteStatus === "saved" ? "Salvo" : noteStatus === "error" ? "Erro ao salvar" : "Somente voce ve"}
                  </small>
                </div>
                <textarea
                  value={privateNote}
                  onChange={(event) => {
                    setPrivateNote(event.target.value);
                    setNoteDirty(true);
                    setNoteStatus("idle");
                  }}
                  placeholder="Ex.: saque aberto forte, erra backhand pressionado, sobe muito a rede..."
                  rows={5}
                />
              </section>
            ) : null}

            <section className="player-public-section">
              <div className="section-title">
                <div>
                  <span>Historico</span>
                  <h2>Competicoes e rankings</h2>
                </div>
                <small>{competitions.length} recortes</small>
              </div>
              {competitions.length ? (
                <div className="player-public-competition-list">
                  {competitions.map((row) => (
                    <article key={row.leaguePlayerId}>
                      <div>
                        <strong>{row.leagueName}</strong>
                        <span>{row.seasonName} - {classLabel(row)}</span>
                      </div>
                      <div>
                        <b>#{row.position || "-"}</b>
                        <small>{row.rankingPoints} pts | {row.wins}-{row.losses}</small>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="home-empty-panel compact">
                  <strong>Sem historico publico ainda</strong>
                  <span>Quando este jogador participar de ligas com ranking, o resumo aparece aqui.</span>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}
