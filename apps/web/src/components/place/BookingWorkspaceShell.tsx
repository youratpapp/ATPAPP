import type { ReactNode } from "react";

export type BookingManagementView = "today" | "reservations" | "calendar" | "new" | "waitlist" | "resources";

type BookingWorkspaceShellProps = {
  activeView: BookingManagementView;
  children: ReactNode;
  onViewChange: (view: BookingManagementView) => void;
};

export function BookingWorkspaceShell({ activeView, children, onViewChange }: BookingWorkspaceShellProps) {
  void activeView;
  void onViewChange;
  return <>{children}</>;
}
