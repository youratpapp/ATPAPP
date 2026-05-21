import type { ReactNode } from "react";
import { PlaceWorkspaceShell } from "./PlaceWorkspaceShell";

export type BookingManagementView = "today" | "reservations" | "calendar" | "new" | "waitlist" | "resources";

const BOOKING_WORKSPACE_NAV_VIEWS: BookingManagementView[] = ["calendar", "today", "reservations", "waitlist", "resources"];

const BOOKING_VIEW_LABELS: Record<BookingManagementView, string> = {
  today: "Hoje",
  reservations: "Reservas",
  calendar: "Mapa do dia",
  new: "Nova reserva",
  waitlist: "Espera",
  resources: "Ajustes",
};

const BOOKING_VIEW_DESCRIPTIONS: Record<BookingManagementView, string> = {
  today: "Agenda do dia, pendencias e proximos horarios.",
  reservations: "Reservas recentes, pagamento, remarcacao e cancelamento.",
  calendar: "Calendario operacional com reservas, bloqueios, turmas e aulas.",
  new: "Busca de disponibilidade, reserva, bloqueio e lista de espera.",
  waitlist: "Jogadores esperando horario e acoes de conversao.",
  resources: "Quadras, precos e configuracoes operacionais.",
};

type BookingWorkspaceShellProps = {
  activeView: BookingManagementView;
  children: ReactNode;
  onViewChange: (view: BookingManagementView) => void;
};

export function BookingWorkspaceShell({ activeView, children, onViewChange }: BookingWorkspaceShellProps) {
  return (
    <PlaceWorkspaceShell
      activeView={activeView}
      ariaLabel="Visoes da agenda"
      className="booking-workspace"
      descriptions={BOOKING_VIEW_DESCRIPTIONS}
      labels={BOOKING_VIEW_LABELS}
      onViewChange={onViewChange}
      title={activeView === "new" ? "Nova reserva" : "Agenda do local"}
      views={BOOKING_WORKSPACE_NAV_VIEWS}
    >
      {children}
    </PlaceWorkspaceShell>
  );
}
