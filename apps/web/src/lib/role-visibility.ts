import type { WorkspaceAccessSummary } from "./workspace-access";

export type AppSurfaceMode = "player" | "competition" | "management";

export type GlobalNavigationVisibility = {
  activeSurface: AppSurfaceMode;
  contextLabel: "Modo jogador" | "Competicoes" | "Operacao";
  showCompetitionManagement: boolean;
  showManagement: boolean;
};

export function getRouteSurfaceMode(pathname: string): AppSurfaceMode {
  if (pathname.startsWith("/gestao")) return "management";
  if (/^\/locais\/[^/]+\/admin(\/|$)/.test(pathname)) return "management";
  if (pathname.startsWith("/eventos")) return "competition";
  if (pathname.startsWith("/inscricao/")) return "competition";
  if (pathname.startsWith("/join/")) return "competition";
  if (pathname.startsWith("/t/")) return "competition";
  return "player";
}

export function getGlobalNavigationVisibility(
  access: WorkspaceAccessSummary,
  pathname: string
): GlobalNavigationVisibility {
  const showCompetitionManagement = access.hasCompetitionManagement;
  const showManagement = access.hasManagement;
  const routeSurface = getRouteSurfaceMode(pathname);
  const activeSurface = routeSurface === "management" && !showManagement ? "player" : routeSurface;

  return {
    activeSurface,
    contextLabel:
      activeSurface === "management" ? "Operacao" : activeSurface === "competition" ? "Competicoes" : "Modo jogador",
    showCompetitionManagement,
    showManagement,
  };
}
