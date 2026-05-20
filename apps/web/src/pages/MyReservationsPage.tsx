import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { AppDialog } from "../components/AppOverlays";
import { AppShell } from "../components/AppShell";
import { ScreenState } from "../components/ScreenState";
import { friendlyToastMessage, useToast } from "../components/toast";
import { listMyCourtBookingWaitlist, listMyCourtBookings, updateCourtBookingStatus } from "../lib/places";
import type { CourtBooking, CourtBookingWaitlistEntry, Profile } from "../lib/types";

type Props = {
  user: User;
  profile: Profile | null;
};

function formatWhen(value: string): string {
  if (!value) return "Horario a definir";
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function reservationStatus(booking: CourtBooking): { label: string; tone: "ok" | "pending" | "muted" | "danger" } {
  const ended = booking.endsAt ? new Date(booking.endsAt).getTime() < Date.now() : false;
  if (booking.status === "cancelled") return { label: "Cancelada", tone: "danger" };
  if (ended) return { label: "Finalizada", tone: "muted" };
  if (booking.status === "confirmed") return { label: "Confirmada", tone: "ok" };
  if (booking.status === "pending") return { label: "Aguardando confirmacao", tone: "pending" };
  return { label: "Bloqueada", tone: "muted" };
}

function canCancelReservation(booking: CourtBooking): boolean {
  if (booking.status !== "pending" && booking.status !== "confirmed") return false;
  return booking.startsAt ? new Date(booking.startsAt).getTime() > Date.now() : false;
}

export function MyReservationsPage({ user, profile }: Props) {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = useState<CourtBooking[]>([]);
  const [waitlist, setWaitlist] = useState<CourtBookingWaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const selectedId = searchParams.get("reserva") || "";
  const selected = bookings.find((booking) => booking.id === selectedId) || null;

  const futureBookings = useMemo(
    () => bookings.filter((booking) => booking.endsAt && new Date(booking.endsAt).getTime() >= Date.now() && booking.status !== "cancelled"),
    [bookings]
  );
  const historyBookings = useMemo(
    () => bookings.filter((booking) => !futureBookings.some((future) => future.id === booking.id)),
    [bookings, futureBookings]
  );

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [data, waitlistData] = await Promise.all([
        listMyCourtBookings({ includeHistory: true, limit: 200 }),
        listMyCourtBookingWaitlist().catch(() => []),
      ]);
      setBookings(data);
      setWaitlist(waitlistData);
    } catch (err) {
      setError(friendlyToastMessage(err, "Nao foi possivel carregar suas reservas."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function cancelReservation(booking: CourtBooking) {
    if (!canCancelReservation(booking)) return;
    setBusyId(booking.id);
    try {
      await updateCourtBookingStatus(booking.id, "cancelled");
      showToast({ kind: "success", text: "Reserva cancelada." });
      await load();
    } catch (err) {
      showToast({ kind: "error", text: friendlyToastMessage(err, "Nao foi possivel cancelar a reserva.") });
    } finally {
      setBusyId("");
    }
  }

  function openReservation(booking: CourtBooking) {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("reserva", booking.id);
      return next;
    });
  }

  function closeReservation() {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.delete("reserva");
      return next;
    });
  }

  const renderBooking = (booking: CourtBooking) => {
    const status = reservationStatus(booking);
    return (
      <button key={booking.id} type="button" className="personal-area-row" onClick={() => openReservation(booking)}>
        <span>
          <strong>{booking.courtName || "Quadra"}</strong>
          <small>{booking.placeName || "Local"} | {formatWhen(booking.startsAt)}</small>
        </span>
        <em className={`status-pill tone-${status.tone}`}>{status.label}</em>
      </button>
    );
  };

  const renderWaitlist = (entry: CourtBookingWaitlistEntry) => (
    <article key={`waitlist:${entry.id}`} className="personal-area-row static">
      <span>
        <strong>{entry.courtName || "Lista de espera"}</strong>
        <small>{entry.placeName || "Local"} | {formatWhen(entry.startsAt)}</small>
      </span>
      <em className={`status-pill tone-${entry.status === "invited" ? "pending" : "muted"}`}>
        {entry.status === "invited" ? "Convite recebido" : entry.status === "booked" ? "Convertida" : entry.status === "cancelled" ? "Cancelada" : "Na espera"}
      </em>
    </article>
  );

  return (
    <AppShell user={user} profile={profile} mode="player">
      <main className="page personal-area-page">
        <header className="personal-area-header">
          <span>Quadras</span>
          <h1>Minhas reservas</h1>
          <p>Reservas futuras, pendencias de confirmacao e historico em um lugar so.</p>
        </header>

        {loading ? <ScreenState title="Carregando reservas..." /> : null}
        {error ? (
          <ScreenState
            kind="error"
            title="Nao foi possivel carregar"
            detail={error}
            action={<button className="secondary" onClick={() => void load()}>Tentar novamente</button>}
          />
        ) : null}
        {!loading && !error && !bookings.length && !waitlist.length ? (
          <ScreenState
            title="Voce ainda nao tem reservas"
            detail="Reserve uma quadra para acompanhar tudo por aqui."
            action={<Link className="button-like primary" to="/locais?intent=booking">Reservar quadra</Link>}
          />
        ) : null}

        {!loading && !error && (bookings.length || waitlist.length) ? (
          <div className="personal-area-grid">
            <section className="personal-area-card">
              <header>
                <div>
                  <span>Proximas</span>
                  <h2>Reservas futuras</h2>
                </div>
                <b>{futureBookings.length + waitlist.filter((entry) => entry.status !== "cancelled").length}</b>
              </header>
              {futureBookings.length ? futureBookings.map(renderBooking) : <p className="subtle">Nenhuma reserva futura.</p>}
              {waitlist.filter((entry) => entry.status !== "cancelled").map(renderWaitlist)}
            </section>
            <section className="personal-area-card">
              <header>
                <div>
                  <span>Historico</span>
                  <h2>Reservas passadas</h2>
                </div>
                <b>{historyBookings.length}</b>
              </header>
              {historyBookings.length ? historyBookings.map(renderBooking) : <p className="subtle">Sem historico ainda.</p>}
            </section>
          </div>
        ) : null}

        <AppDialog
          open={Boolean(selected)}
          title={selected?.courtName || "Detalhe da reserva"}
          eyebrow={selected?.placeName || "Reserva"}
          subtitle={selected ? `${formatWhen(selected.startsAt)} ate ${formatWhen(selected.endsAt)}` : ""}
          onClose={closeReservation}
        >
          {selected ? (
            <div className="personal-area-detail">
              <span className={`status-pill tone-${reservationStatus(selected).tone}`}>{reservationStatus(selected).label}</span>
              <dl>
                <div><dt>Local</dt><dd>{selected.placeName || "-"}</dd></div>
                <div><dt>Quadra</dt><dd>{selected.courtName || "-"}</dd></div>
                <div><dt>Inicio</dt><dd>{formatWhen(selected.startsAt)}</dd></div>
                <div><dt>Fim</dt><dd>{formatWhen(selected.endsAt)}</dd></div>
                <div><dt>Contato</dt><dd>{selected.phone || "Sem telefone"}</dd></div>
                <div><dt>Observacao</dt><dd>{selected.notes || "Sem observacao"}</dd></div>
              </dl>
              <div className="modal-actions">
                {canCancelReservation(selected) ? (
                  <button className="danger" onClick={() => void cancelReservation(selected)} disabled={busyId === selected.id}>
                    {busyId === selected.id ? "Cancelando..." : "Cancelar reserva"}
                  </button>
                ) : null}
                <button className="secondary" onClick={closeReservation}>Fechar</button>
              </div>
            </div>
          ) : null}
        </AppDialog>
      </main>
    </AppShell>
  );
}
