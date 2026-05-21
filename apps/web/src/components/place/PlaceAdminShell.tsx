import {
  PLACE_MANAGEMENT_MODULE_DESCRIPTIONS,
  PLACE_MANAGEMENT_MODULE_LABELS,
  type PlaceManagementModule,
  countLabel,
} from "../../lib/place-management";

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

export function PlaceAdminShell({
  currentModule,
  currentPlaceId,
  featureLabels,
  locationLabel,
  moduleCounts,
  modules,
  nextStep,
  pendingCount,
  planLabel,
  placeName,
  placeOptions = [],
  setupPercent,
  staffRoleLabel,
  onModuleChange,
  onPlaceChange,
}: PlaceAdminShellProps) {
  const modulePendingCount = moduleCounts[currentModule] || 0;
  const moduleOrder: PlaceManagementModule[] = ["dashboard", "bookings", "academy", "clients", "finance", "canteen", "team", "settings"];
  const visibleModules = moduleOrder.filter((module) => modules.includes(module));
  const activePlaceOption = placeOptions.find((option) => option.id === currentPlaceId);

  return (
    <section className="place-admin-shell" aria-label={`Gestao de ${placeName}`}>
      <div className="place-admin-shell-head">
        <div className="place-admin-place-context">
          <span>{staffRoleLabel} | {planLabel}</span>
          <strong>{placeName}</strong>
          <small>{locationLabel || "Local sem cidade definida"}</small>
        </div>
        {placeOptions.length > 1 && currentPlaceId && onPlaceChange ? (
          <details className="place-active-switcher">
            <summary>
              <span>Unidade ativa</span>
              <strong>{activePlaceOption?.label || placeName}</strong>
              <small>Trocar unidade</small>
            </summary>
            <select aria-label="Trocar unidade" value={currentPlaceId} onChange={(event) => onPlaceChange(event.target.value)}>
              {placeOptions.map((option) => (
                <option key={`place-switch:${option.id}`} value={option.id}>
                  {option.label} - {option.detail || "Sem cidade"}
                </option>
              ))}
            </select>
          </details>
        ) : null}
        <div className="place-admin-shell-status">
          <span>
            <b>{pendingCount}</b>
            {pendingCount === 1 ? "pendencia" : "pendencias"}
          </span>
          <span>
            <b>{setupPercent}%</b>
            implantado
          </span>
        </div>
      </div>

      <div className="place-management-tabs" role="tablist" aria-label={`Modulos de ${placeName}`}>
        {visibleModules.map((module) => (
          <button
            key={`${placeName}:module:${module}`}
            className={currentModule === module ? "active" : ""}
            onClick={() => onModuleChange(module)}
            type="button"
          >
            <span>{PLACE_MANAGEMENT_MODULE_LABELS[module]}</span>
            {moduleCounts[module] ? <em>{moduleCounts[module]}</em> : null}
          </button>
        ))}
      </div>

      <div className="place-module-context">
        <div>
          <span>Modulo ativo</span>
          <strong>{PLACE_MANAGEMENT_MODULE_LABELS[currentModule]}</strong>
          <span>{PLACE_MANAGEMENT_MODULE_DESCRIPTIONS[currentModule]}</span>
        </div>
        {modulePendingCount ? (
          <small>{countLabel(modulePendingCount, "item para acompanhar", "itens para acompanhar")}</small>
        ) : (
          <small>Sem pendencias neste modulo</small>
        )}
      </div>

      {currentModule === "settings" ? (
        <div className="place-admin-setup-strip">
          <div className="place-management-health" aria-label={`Implantacao ${setupPercent}%`}>
            <span style={{ width: `${setupPercent}%` }} />
          </div>
          <div className="place-admin-shell-features" aria-label="Modulos disponiveis">
            {featureLabels.slice(0, 5).map((feature) => (
              <span key={`${placeName}:feature:${feature}`}>{feature}</span>
            ))}
            {featureLabels.length > 5 ? <span>+{featureLabels.length - 5}</span> : null}
            {!featureLabels.length ? <span>Operacao basica</span> : null}
          </div>
          {nextStep ? (
            <button className="place-next-step" type="button" onClick={() => onModuleChange(nextStep.module, nextStep.viewSegment)}>
              <strong>{nextStep.title}</strong>
              <span>{nextStep.detail}</span>
            </button>
          ) : (
            <span className="place-setup-done">Base operacional pronta</span>
          )}
        </div>
      ) : null}
    </section>
  );
}
