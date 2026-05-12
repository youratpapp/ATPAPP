import type { AgendaAssignment } from "../tournament-engine/agenda";

export function buildScheduleMatchKey(
  categoryName: string,
  className: string,
  roundName: string,
  matchIndex: number
): string {
  return `${String(categoryName || "")}||${String(className || "")}||${String(roundName || "")}||${matchIndex + 1}`;
}

export function formatAssignmentTime(assignment: AgendaAssignment): string {
  return `${assignment.data} | ${assignment.hora}-${assignment.horaFim} | ${assignment.quadra}`;
}

export function assignmentSortValue(assignment: AgendaAssignment | undefined): number {
  if (!assignment) return Number.MAX_SAFE_INTEGER;
  const value = new Date(`${assignment.data}T${assignment.hora}:00`).getTime();
  return Number.isNaN(value) ? Number.MAX_SAFE_INTEGER : value;
}
