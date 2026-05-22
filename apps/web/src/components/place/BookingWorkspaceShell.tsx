import type { ReactNode } from "react";

export type BookingManagementView = "today" | "reservations" | "calendar" | "new" | "waitlist" | "resources";

const BOOKING_VIEW_LABELS: Record<BookingManagementView, string> = {
  today: "Hoje",
  reservations: "Reservas",
  calendar: "Calendario",
  new: "Nova reserva",
  waitlist: "Espera",
  resources: "Ajustes",
};

type BookingWorkspaceShellProps = {
  activeView: BookingManagementView;
  children: ReactNode;
  onViewChange: (view: BookingManagementView) => void;
};

export function BookingWorkspaceShell({ activeView, children, onViewChange }: BookingWorkspaceShellProps) {
  const operationalViews: BookingManagementView[] = ["calendar", "reservations", "new"];

  return (
    <section className="booking-workspace booking-workspace--saas">
      <header className="booking-workspace-domain-head">
        <div>
          <span>OPERACAO</span>
          <h1>Agenda</h1>
          <p>Reservas, aulas, bloqueios e uso das quadras em um calendario unico.</p>
        </div>
      </header>
      <nav className="booking-workspace-domain-tabs" aria-label="Visoes da agenda">
        {operationalViews.map((view) => (
          <button key={view} type="button" className={activeView === view ? "active" : ""} onClick={() => onViewChange(view)}>
            {BOOKING_VIEW_LABELS[view]}
          </button>
        ))}
      </nav>
      {children}
    </section>
  );
}
