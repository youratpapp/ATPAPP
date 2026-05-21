import type { ReactNode } from "react";
import { PlaceWorkspaceShell } from "./PlaceWorkspaceShell";

export type BookingManagementView = "today" | "reservations" | "calendar" | "new" | "waitlist" | "resources";

const BOOKING_WORKSPACE_NAV_VIEWS: BookingManagementView[] = ["today", "reservations", "calendar", "waitlist", "resources"];

const BOOKING_VIEW_LABELS: Record<BookingManagementView, string> = {
  today: "Hoje",
  reservations: "Reservas",
  calendar: "Calendario",
  new: "Nova reserva",
  waitlist: "Espera",
  resources: "Ajustes",
};

const BOOKING_VIEW_DESCRIPTIONS: Record<BookingManagementView, string> = {
  today: "Agenda do dia, pendencias e proximos horarios.",
  reservations: "Reservas recentes, confirmacao, pagamento e cancelamento.",
  calendar: "Mapa diario por quadra, ocupacao e bloqueios.",
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
      title={activeView === "new" ? "Nova reserva" : "Central de agenda"}
      views={BOOKING_WORKSPACE_NAV_VIEWS}
    >
      {children}
    </PlaceWorkspaceShell>
  );
}
