import type { ReactNode } from "react";
import { PlaceWorkspaceShell } from "./PlaceWorkspaceShell";

export type AcademyManagementView = "today" | "calendar" | "classes" | "students" | "requests" | "coaches" | "resources";

const ACADEMY_MANAGEMENT_VIEW_LABELS: Record<AcademyManagementView, string> = {
  today: "Hoje",
  calendar: "Agenda",
  classes: "Turmas",
  students: "Alunos",
  requests: "Pendencias",
  coaches: "Professores",
  resources: "Ajustes",
};

const ACADEMY_MANAGEMENT_VIEW_DESCRIPTIONS: Record<AcademyManagementView, string> = {
  today: "Aulas do dia, presenca, faltas e reposicoes imediatas.",
  calendar: "Grade visual por horario, quadra, turma e alunos.",
  classes: "Turmas, grade semanal, vagas, mensalidade e matricula manual.",
  students: "Aluno por aluno: status, pagamento, falta e evolucao.",
  requests: "Fila para resolver matriculas, avulsas, reposicoes e pagamentos.",
  coaches: "Agenda, alunos, contato e comissao por professor.",
  resources: "Quadras, horarios abertos, disponibilidade e bloqueios.",
};

type AcademyWorkspaceShellProps = {
  activeView: AcademyManagementView;
  children: ReactNode;
  onViewChange: (view: AcademyManagementView) => void;
  title?: string;
  viewDescriptions?: Partial<Record<AcademyManagementView, string>>;
  viewLabels?: Partial<Record<AcademyManagementView, string>>;
  views?: AcademyManagementView[];
};

export function AcademyWorkspaceShell({
  activeView,
  children,
  onViewChange,
  title = "Central da academia",
  viewDescriptions,
  viewLabels,
  views,
}: AcademyWorkspaceShellProps) {
  const labels = { ...ACADEMY_MANAGEMENT_VIEW_LABELS, ...viewLabels };
  const descriptions = { ...ACADEMY_MANAGEMENT_VIEW_DESCRIPTIONS, ...viewDescriptions };

  return (
    <PlaceWorkspaceShell
      activeView={activeView}
      ariaLabel="Visoes da academia"
      className="academy-workspace"
      descriptions={descriptions}
      labels={labels}
      onViewChange={onViewChange}
      title={title}
      views={views}
    >
      {children}
    </PlaceWorkspaceShell>
  );
}
