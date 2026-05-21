import type { ReactNode } from "react";
import { PlaceWorkspaceShell } from "./PlaceWorkspaceShell";

export type BookingManagementView = "today" | "reservations" | "calendar" | "new" | "waitlist" | "resources";

const BOOKING_VIEW_LABELS: Record<BookingManagementView, string> = {
  today: "Hoje",
  reservations: "Reservas",
  calendar: "Mapa do dia",
  new: "Nova reserva",
  waitlist: "Espera",
  resources: "Ajustes",
};

const BOOKING_VIEW_DESCRIPTIONS: Record<BookingManagementView, string> = {
  today: "Reservas recentes, pagamento, lista de espera, remarcacao e cancelamento.",
  reservations: "Reservas recentes, pagamento, lista de espera, remarcacao e cancelamento.",
  calendar: "Calendario operacional com reservas, bloqueios, turmas e aulas.",
  new: "Busca de disponibilidade, reserva, bloqueio e lista de espera.",
  waitlist: "Reservas recentes, pagamento, lista de espera, remarcacao e cancelamento.",
  resources: "Quadras, precos e configuracoes operacionais fora da rotina diaria.",
};

type BookingWorkspaceShellProps = {
  activeView: BookingManagementView;
  children: ReactNode;
  onViewChange: (view: BookingManagementView) => void;
};

export function BookingWorkspaceShell({ activeView, children, onViewChange }: BookingWorkspaceShellProps) {
  const title =
    activeView === "calendar"
      ? "Agenda do local"
      : activeView === "new"
        ? "Nova reserva"
        : activeView === "resources"
          ? "Ajustes de reservas"
          : "Reservas";

  return (
    <PlaceWorkspaceShell
      activeView={activeView}
      ariaLabel="Visoes da agenda"
      className="booking-workspace"
      descriptions={BOOKING_VIEW_DESCRIPTIONS}
      labels={BOOKING_VIEW_LABELS}
      onViewChange={onViewChange}
      title={title}
      views={[activeView]}
    >
      {children}
    </PlaceWorkspaceShell>
  );
}
