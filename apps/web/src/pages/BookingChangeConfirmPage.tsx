import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { AppShell } from "../components/AppShell";
import { confirmCourtBookingChangeRequest, getCourtBookingChangeRequest, searchAvailableCourts } from "../lib/places";
import type { AvailableCourt, CourtBooking, CourtBookingChangeRequest, Profile } from "../lib/types";

type Props = {
  profile: Profile | null;
  user: User;
};

function formatSlot(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "Horario a confirmar";
  return `${start.toLocaleDateString("pt-BR")} - ${start.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} as ${end.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

function toDateInput(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function toTimeInput(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "19:00";
  return date.toTimeString().slice(0, 5);
}

function durationMinutes(startsAt: string, endsAt: string): number {
  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 60;
  return Math.max(30, Math.round((end - start) / 60000));
}

function buildSlot(date: string, time: string, minutes: number): { endsAt: string; startsAt: string } | null {
  if (!date || !time) return null;
  const start = new Date(`${date}T${time}`);
  if (Number.isNaN(start.getTime())) return null;
  const end = new Date(start.getTime() + Math.max(30, minutes) * 60000);
  return { startsAt: start.toISOString(), endsAt: end.toISOString() };
}

function statusCopy(status: CourtBookingChangeRequest["status"]): { detail: string; title: string } {
  if (status === "confirmed") {
    return {
      title: "Alteracao ja confirmada",
      detail: "Esse link ja foi usado. Confira sua agenda para ver os dados atuais da reserva.",
    };
  }
  if (status === "expired") {
    return {
      title: "Link expirado",
      detail: "Essa opcao de horario nao esta mais disponivel por este link. Fale com a equipe para receber novas opcoes.",
    };
  }
  if (status === "cancelled") {
    return {
      title: "Opcao indisponivel",
      detail: "Essa opcao foi cancelada porque outra alteracao foi escolhida ou a equipe atualizou a reserva.",
    };
  }
  return {
    title: "Confirmar troca de horario",
    detail: "Revise a mudanca proposta. Ao confirmar, somente esta reserva sera alterada.",
  };
}

export function BookingChangeConfirmPage({ user, profile }: Props) {
  const { token } = useParams();
  const safeToken = String(token || "").trim();
  const [request, setRequest] = useState<CourtBookingChangeRequest | null>(null);
  const [updatedBooking, setUpdatedBooking] = useState<CourtBooking | null>(null);
  const [availableCourts, setAvailableCourts] = useState<AvailableCourt[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(60);
  const [selectedCourtId, setSelectedCourtId] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadRequest() {
      if (!safeToken) {
        setLoading(false);
        setError("Link de alteracao invalido.");
        return;
      }
      setLoading(true);
      setError("");
      try {
        const data = await getCourtBookingChangeRequest(safeToken);
        if (cancelled) return;
        setRequest(data);
        if (!data) {
          setError("Nao encontramos esta solicitacao de alteracao.");
        } else {
          setDate(toDateInput(data.currentStartsAt));
          setTime(toTimeInput(data.currentStartsAt));
          setDuration(durationMinutes(data.currentStartsAt, data.currentEndsAt));
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Falha ao carregar alteracao.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadRequest();
    return () => {
      cancelled = true;
    };
  }, [safeToken]);

  async function searchSlots() {
    if (!request) return;
    const slot = buildSlot(date, time, duration);
    if (!slot) {
      setError("Escolha data, horario e duracao validos.");
      return;
    }
    setSearching(true);
    setError("");
    setSelectedCourtId("");
    try {
      const rows = await searchAvailableCourts({
        placeId: request.placeId,
        startsAt: slot.startsAt,
        endsAt: slot.endsAt,
      });
      setAvailableCourts(rows);
      setSelectedCourtId(rows[0]?.id || "");
      if (!rows.length) setError("Nenhuma quadra livre nesse horario. Tente outro horario ou data.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel consultar a agenda.");
      setAvailableCourts([]);
    } finally {
      setSearching(false);
    }
  }

  async function confirmChange() {
    if (!safeToken || !selectedCourtId) return;
    const slot = buildSlot(date, time, duration);
    if (!slot) {
      setError("Escolha data, horario e duracao validos.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const booking = await confirmCourtBookingChangeRequest(safeToken, {
        courtId: selectedCourtId,
        startsAt: slot.startsAt,
        endsAt: slot.endsAt,
      });
      setUpdatedBooking(booking);
      setRequest((prev) => (prev ? { ...prev, status: "confirmed", confirmedAt: new Date().toISOString() } : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel confirmar a alteracao.");
    } finally {
      setBusy(false);
    }
  }

  const copy = request ? statusCopy(request.status) : null;
  const selectedCourt = availableCourts.find((court) => court.id === selectedCourtId) || null;
  const canConfirm = Boolean(request && request.status === "pending" && !updatedBooking && selectedCourtId);

  return (
    <AppShell user={user} profile={profile} mode="player">
      <section className="booking-change-page">
        <div className="booking-change-card">
          <span className="eyebrow">Reserva ATP</span>
          {loading ? (
            <h1>Carregando alteracao...</h1>
          ) : request ? (
            <>
              <h1>{updatedBooking ? "Reserva alterada" : copy?.title}</h1>
              <p>
                {updatedBooking
                  ? "Sua reserva foi atualizada. A equipe tambem consegue acompanhar a alteracao pelo painel da academia."
                  : `${copy?.detail} A remarcacao usa a agenda atual das quadras e mantem a reserva vinculada ao pagamento original.`}
              </p>
              <div className="booking-change-summary">
                <div>
                  <span>Academia</span>
                  <strong>{request.placeName || "ATP"}</strong>
                </div>
                <div>
                  <span>Jogador</span>
                  <strong>{request.playerName}</strong>
                </div>
              </div>
              <div className="booking-change-comparison">
                <article>
                  <span>Horario atual</span>
                  <strong>{request.currentCourtName}</strong>
                  <small>{formatSlot(request.currentStartsAt, request.currentEndsAt)}</small>
                </article>
                {updatedBooking ? (
                  <article className="proposed">
                    <span>Novo horario</span>
                    <strong>{updatedBooking.courtName}</strong>
                    <small>{formatSlot(updatedBooking.startsAt, updatedBooking.endsAt)}</small>
                  </article>
                ) : null}
              </div>
              {request.status === "pending" && !updatedBooking ? (
                <div className="booking-change-picker">
                  <div className="booking-change-picker-fields">
                    <label>
                      Data
                      <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
                    </label>
                    <label>
                      Horario
                      <input type="time" value={time} onChange={(event) => setTime(event.target.value)} />
                    </label>
                    <label>
                      Duracao
                      <select value={duration} onChange={(event) => setDuration(Number(event.target.value))}>
                        <option value={60}>1h</option>
                        <option value={90}>1h30</option>
                        <option value={120}>2h</option>
                      </select>
                    </label>
                    <button type="button" onClick={() => void searchSlots()} disabled={searching}>
                      {searching ? "Consultando..." : "Ver quadras livres"}
                    </button>
                  </div>
                  <div className="booking-change-availability">
                    {availableCourts.map((court) => (
                      <button
                        key={court.id}
                        type="button"
                        className={selectedCourtId === court.id ? "active" : ""}
                        onClick={() => setSelectedCourtId(court.id)}
                      >
                        <strong>{court.name}</strong>
                        <span>{court.surface || "Quadra disponivel"}</span>
                      </button>
                    ))}
                    {!availableCourts.length && !error ? <p>Escolha data e horario para consultar quadras livres.</p> : null}
                  </div>
                </div>
              ) : null}
              {error ? <p className="form-error">{error}</p> : null}
              <div className="booking-change-actions">
                {canConfirm ? (
                  <button className="primary" type="button" onClick={() => void confirmChange()} disabled={busy}>
                    {busy ? "Confirmando..." : `Confirmar em ${selectedCourt?.name || "quadra livre"}`}
                  </button>
                ) : null}
                <Link className="button-like secondary" to="/agenda">
                  Ver minha agenda
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1>Link indisponivel</h1>
              <p>{error || "Nao foi possivel carregar esta alteracao."}</p>
              <Link className="button-like secondary" to="/agenda">
                Ir para minha agenda
              </Link>
            </>
          )}
        </div>
      </section>
    </AppShell>
  );
}
