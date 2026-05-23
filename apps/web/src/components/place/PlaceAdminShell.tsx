import type { PlaceManagementModule } from "../../lib/place-management";

type PlaceAdminShellProps = {
  currentModule: PlaceManagementModule;
  currentPlaceId?: string;
  featureLabels: string[];
  locationLabel: string;
  moduleCounts: Record<PlaceManagementModule, number>;
  modules: PlaceManagementModule[];
  nextStep: { title: string; detail: string; module: PlaceManagementModule; viewSegment?: string } | null;
  pendingCount: number;
  planLabel: string;
  placeName: string;
  placeOptions?: Array<{ detail: string; id: string; label: string }>;
  setupPercent: number;
  staffRoleLabel: string;
  onModuleChange: (module: PlaceManagementModule, viewSegment?: string) => void;
  onPlaceChange?: (placeId: string) => void;
};

export function PlaceAdminShell(_props: PlaceAdminShellProps) {
  return null;
}
