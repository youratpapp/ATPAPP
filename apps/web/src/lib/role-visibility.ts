import type { WorkspaceAccessSummary } from "./workspace-access";

export type AppSurfaceMode = "player" | "competition" | "management";
export type AppExperienceMode = "player" | "work";

export type GlobalNavigationVisibility = {
  activeSurface: AppSurfaceMode;
  contextLabel: "Jogador" | "Competições" | "Operação";
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

export function getRouteExperienceMode(pathname: string, search = ""): AppExperienceMode {
  const params = new URLSearchParams(search);
  if (params.get("mode") === "work") return "work";
  if (pathname.startsWith("/gestao")) return "work";
  if (/^\/locais\/[^/]+\/admin(\/|$)/.test(pathname)) return "work";
  if (/^\/eventos\/[^/]+\/organizacao(\/|$)/.test(pathname)) return "work";
  if (/^\/eventos\/ligas\/[^/]+(\/|$)/.test(pathname) && params.get("mode") === "work") return "work";
  if (pathname === "/eventos" && params.get("modo") === "organizing") return "work";
  if (pathname === "/eventos/torneios" && params.get("view") === "organizing") return "work";
  if (pathname === "/eventos/ligas" && params.get("view") === "organizing") return "work";
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
      activeSurface === "management" ? "Operação" : activeSurface === "competition" ? "Competições" : "Jogador",
    showCompetitionManagement,
    showManagement,
  };
}
