import type { ReactNode } from "react";
import { PlaceWorkspaceShell } from "./PlaceWorkspaceShell";

export type BookingManagementView = "today" | "reservations" | "calendar" | "new" | "waitlist" | "resources";

const BOOKING_VIEW_LABELS: Record<BookingManagementView, string> = {
  today: "Hoje",
  reservations: "Reservas",
  calendar: "Calendario",
  new: "Nova reserva",
  waitlist: "Espera",
  resources: "Ajustes",
};

const BOOKING_VIEW_DESCRIPTIONS: Record<BookingManagementView, string> = {
  today: "Reservas recentes, pagamento, lista de espera, remarcacao e cancelamento.",
  reservations: "Calendario clicavel com reservas, edicao, cancelamento e WhatsApp de remarcacao.",
  calendar: "Mapa de tempo do local com reservas, bloqueios, turmas e aulas.",
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
      ? "Calendario do local"
      : activeView === "reservations"
        ? "Reservas"
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
