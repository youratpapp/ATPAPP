import type { ReactNode } from "react";
import { PlaceWorkspaceShell } from "./PlaceWorkspaceShell";

export type AcademyManagementView = "today" | "classes" | "students" | "requests" | "coaches" | "resources";

const ACADEMY_MANAGEMENT_VIEW_LABELS: Record<AcademyManagementView, string> = {
  today: "Hoje",
  classes: "Turmas",
  students: "Alunos",
  requests: "Pendencias",
  coaches: "Professores",
  resources: "Recursos",
};

const ACADEMY_MANAGEMENT_VIEW_DESCRIPTIONS: Record<AcademyManagementView, string> = {
  today: "Aulas do dia, presenca, faltas e reposicoes imediatas.",
  classes: "Grade semanal, vagas, mensalidade e matricula manual.",
  students: "Aluno por aluno: status, pagamento, falta e evolucao.",
  requests: "Novas matriculas, encaixes, avulsas e reposicoes.",
  coaches: "Agenda, alunos, contato e comissao por professor.",
  resources: "Professores, quadras, horarios livres e criacao de turmas.",
};

type AcademyWorkspaceShellProps = {
  activeView: AcademyManagementView;
  children: ReactNode;
  onViewChange: (view: AcademyManagementView) => void;
};

export function AcademyWorkspaceShell({ activeView, children, onViewChange }: AcademyWorkspaceShellProps) {
  return (
    <PlaceWorkspaceShell
      activeView={activeView}
      ariaLabel="Visoes da academia"
      className="academy-workspace"
      descriptions={ACADEMY_MANAGEMENT_VIEW_DESCRIPTIONS}
      labels={ACADEMY_MANAGEMENT_VIEW_LABELS}
      onViewChange={onViewChange}
      title="Central da academia"
    >
      {children}
    </PlaceWorkspaceShell>
  );
}
