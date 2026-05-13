import { useCallback, useEffect, type Dispatch, type SetStateAction } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { AcademyManagementView } from "../components/place/AcademyWorkspaceShell";
import type { BookingManagementView } from "../components/place/BookingWorkspaceShell";
import type { CanteenManagementView } from "../components/place/CanteenWorkspaceShell";
import type { ClientsManagementView } from "../components/place/ClientsWorkspaceShell";
import type { FinanceManagementView } from "../components/place/FinanceWorkspaceShell";
import type { SettingsManagementView } from "../components/place/SettingsWorkspaceShell";
import type { TeamManagementView } from "../components/place/TeamWorkspaceShell";
import {
  ACADEMY_ADMIN_VIEW_SEGMENTS,
  BOOKING_ADMIN_VIEW_SEGMENTS,
  CANTEEN_ADMIN_VIEW_SEGMENTS,
  CLIENTS_ADMIN_VIEW_SEGMENTS,
  FINANCE_ADMIN_VIEW_SEGMENTS,
  PLACE_ADMIN_VIEW_PARAM,
  SETTINGS_ADMIN_VIEW_SEGMENTS,
  TEAM_ADMIN_VIEW_SEGMENTS,
  buildPlaceAdminPath,
  resolvePlaceAdminView,
} from "../lib/place-admin-navigation";
import { placeManagementModules, placeResourceAccess, type PlaceManagementModule } from "../lib/place-management";
import type { Place, PlaceStaffMember } from "../lib/types";

type SetByPlace<T> = Dispatch<SetStateAction<Record<string, T>>>;

type UsePlaceAdminRouteSyncInput = {
  adminModule?: PlaceManagementModule;
  adminPlaceId?: string;
  isAdminRoute: boolean;
  loading: boolean;
  places: Place[];
  staffByPlace: Record<string, PlaceStaffMember[]>;
  userId: string;
  setAcademyViewByPlace: SetByPlace<AcademyManagementView>;
  setBookingViewByPlace: SetByPlace<BookingManagementView>;
  setCanteenViewByPlace: SetByPlace<CanteenManagementView>;
  setClientsViewByPlace: SetByPlace<ClientsManagementView>;
  setFinanceViewByPlace: SetByPlace<FinanceManagementView>;
  setManagementModuleByPlace: SetByPlace<PlaceManagementModule>;
  setSettingsViewByPlace: SetByPlace<SettingsManagementView>;
  setTeamViewByPlace: SetByPlace<TeamManagementView>;
};

export function usePlaceAdminRouteSync({
  adminModule,
  adminPlaceId,
  isAdminRoute,
  loading,
  places,
  staffByPlace,
  userId,
  setAcademyViewByPlace,
  setBookingViewByPlace,
  setCanteenViewByPlace,
  setClientsViewByPlace,
  setFinanceViewByPlace,
  setManagementModuleByPlace,
  setSettingsViewByPlace,
  setTeamViewByPlace,
}: UsePlaceAdminRouteSyncInput) {
  const location = useLocation();
  const navigate = useNavigate();
  const adminViewParam = new URLSearchParams(location.search).get(PLACE_ADMIN_VIEW_PARAM) || "";

  useEffect(() => {
    if (!isAdminRoute || loading || !adminPlaceId) return;
    const place = places.find((item) => item.id === adminPlaceId);
    if (!place) return;
    const staff = staffByPlace[adminPlaceId] || [];
    const access = placeResourceAccess(place, userId, staff);
    const modules = placeManagementModules(access);
    const nextModule = adminModule && modules.includes(adminModule) ? adminModule : modules[0] || "dashboard";
    const nextPath = buildPlaceAdminPath(adminPlaceId, nextModule);
    setManagementModuleByPlace((prev) => (prev[adminPlaceId] === nextModule ? prev : { ...prev, [adminPlaceId]: nextModule }));
    if (location.pathname !== nextPath) {
      navigate(nextPath, { replace: true });
    }
  }, [adminModule, adminPlaceId, isAdminRoute, loading, location.pathname, navigate, places, setManagementModuleByPlace, staffByPlace, userId]);

  useEffect(() => {
    if (!isAdminRoute || !adminPlaceId) return;
    const resolved = resolvePlaceAdminView(adminModule, adminViewParam);
    if (!resolved) return;
    if (resolved.module === "bookings") {
      const view = resolved.view as BookingManagementView;
      setBookingViewByPlace((prev) => (prev[adminPlaceId] === view ? prev : { ...prev, [adminPlaceId]: view }));
    } else if (resolved.module === "academy") {
      const view = resolved.view as AcademyManagementView;
      setAcademyViewByPlace((prev) => (prev[adminPlaceId] === view ? prev : { ...prev, [adminPlaceId]: view }));
    } else if (resolved.module === "clients") {
      const view = resolved.view as ClientsManagementView;
      setClientsViewByPlace((prev) => (prev[adminPlaceId] === view ? prev : { ...prev, [adminPlaceId]: view }));
    } else if (resolved.module === "finance") {
      const view = resolved.view as FinanceManagementView;
      setFinanceViewByPlace((prev) => (prev[adminPlaceId] === view ? prev : { ...prev, [adminPlaceId]: view }));
    } else if (resolved.module === "canteen") {
      const view = resolved.view as CanteenManagementView;
      setCanteenViewByPlace((prev) => (prev[adminPlaceId] === view ? prev : { ...prev, [adminPlaceId]: view }));
    } else if (resolved.module === "team") {
      const view = resolved.view as TeamManagementView;
      setTeamViewByPlace((prev) => (prev[adminPlaceId] === view ? prev : { ...prev, [adminPlaceId]: view }));
    } else if (resolved.module === "settings") {
      const view = resolved.view as SettingsManagementView;
      setSettingsViewByPlace((prev) => (prev[adminPlaceId] === view ? prev : { ...prev, [adminPlaceId]: view }));
    }
    if (resolved.shouldReplace) {
      navigate(buildPlaceAdminPath(adminPlaceId, resolved.module, resolved.replacementSegment), { replace: true });
    }
  }, [
    adminModule,
    adminPlaceId,
    adminViewParam,
    isAdminRoute,
    navigate,
    setAcademyViewByPlace,
    setBookingViewByPlace,
    setCanteenViewByPlace,
    setClientsViewByPlace,
    setFinanceViewByPlace,
    setSettingsViewByPlace,
    setTeamViewByPlace,
  ]);

  const selectManagementModule = useCallback(
    (placeId: string, module: PlaceManagementModule) => {
      setManagementModuleByPlace((prev) => ({ ...prev, [placeId]: module }));
      if (isAdminRoute) {
        navigate(buildPlaceAdminPath(placeId, module));
      }
    },
    [isAdminRoute, navigate, setManagementModuleByPlace]
  );

  const selectBookingView = useCallback(
    (placeId: string, view: BookingManagementView) => {
      setBookingViewByPlace((prev) => ({ ...prev, [placeId]: view }));
      if (isAdminRoute && adminModule === "bookings") {
        navigate(buildPlaceAdminPath(placeId, "bookings", BOOKING_ADMIN_VIEW_SEGMENTS[view]));
      }
    },
    [adminModule, isAdminRoute, navigate, setBookingViewByPlace]
  );

  const selectAcademyView = useCallback(
    (placeId: string, view: AcademyManagementView) => {
      setAcademyViewByPlace((prev) => ({ ...prev, [placeId]: view }));
      if (isAdminRoute && adminModule === "academy") {
        navigate(buildPlaceAdminPath(placeId, "academy", ACADEMY_ADMIN_VIEW_SEGMENTS[view]));
      }
    },
    [adminModule, isAdminRoute, navigate, setAcademyViewByPlace]
  );

  const selectClientsView = useCallback(
    (placeId: string, view: ClientsManagementView) => {
      setClientsViewByPlace((prev) => ({ ...prev, [placeId]: view }));
      if (isAdminRoute && adminModule === "clients") {
        navigate(buildPlaceAdminPath(placeId, "clients", CLIENTS_ADMIN_VIEW_SEGMENTS[view]));
      }
    },
    [adminModule, isAdminRoute, navigate, setClientsViewByPlace]
  );

  const selectFinanceView = useCallback(
    (placeId: string, view: FinanceManagementView) => {
      setFinanceViewByPlace((prev) => ({ ...prev, [placeId]: view }));
      if (isAdminRoute && adminModule === "finance") {
        navigate(buildPlaceAdminPath(placeId, "finance", FINANCE_ADMIN_VIEW_SEGMENTS[view]));
      }
    },
    [adminModule, isAdminRoute, navigate, setFinanceViewByPlace]
  );

  const selectCanteenView = useCallback(
    (placeId: string, view: CanteenManagementView) => {
      setCanteenViewByPlace((prev) => ({ ...prev, [placeId]: view }));
      if (isAdminRoute && adminModule === "canteen") {
        navigate(buildPlaceAdminPath(placeId, "canteen", CANTEEN_ADMIN_VIEW_SEGMENTS[view]));
      }
    },
    [adminModule, isAdminRoute, navigate, setCanteenViewByPlace]
  );

  const selectTeamView = useCallback(
    (placeId: string, view: TeamManagementView) => {
      setTeamViewByPlace((prev) => ({ ...prev, [placeId]: view }));
      if (isAdminRoute && adminModule === "team") {
        navigate(buildPlaceAdminPath(placeId, "team", TEAM_ADMIN_VIEW_SEGMENTS[view]));
      }
    },
    [adminModule, isAdminRoute, navigate, setTeamViewByPlace]
  );

  const selectSettingsView = useCallback(
    (placeId: string, view: SettingsManagementView) => {
      setSettingsViewByPlace((prev) => ({ ...prev, [placeId]: view }));
      if (isAdminRoute && adminModule === "settings") {
        navigate(buildPlaceAdminPath(placeId, "settings", SETTINGS_ADMIN_VIEW_SEGMENTS[view]));
      }
    },
    [adminModule, isAdminRoute, navigate, setSettingsViewByPlace]
  );

  return {
    selectAcademyView,
    selectBookingView,
    selectCanteenView,
    selectClientsView,
    selectFinanceView,
    selectManagementModule,
    selectSettingsView,
    selectTeamView,
  };
}
