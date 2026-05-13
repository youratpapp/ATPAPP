import {
  PLACE_MANAGEMENT_MODULE_DESCRIPTIONS,
  PLACE_MANAGEMENT_MODULE_LABELS,
  type PlaceManagementModule,
  countLabel,
} from "../../lib/place-management";

type PlaceManagementCockpitProps = {
  currentModule: PlaceManagementModule;
  moduleCounts: Record<PlaceManagementModule, number>;
  modules: PlaceManagementModule[];
  nextStep: { title: string; detail: string; module: PlaceManagementModule } | null;
  pendingCount: number;
  placeName: string;
  setupPercent: number;
  staffRoleLabel: string;
  onModuleChange: (module: PlaceManagementModule) => void;
};

export function PlaceManagementCockpit({
  currentModule,
  moduleCounts,
  modules,
  nextStep,
  pendingCount,
  placeName,
  setupPercent,
  staffRoleLabel,
  onModuleChange,
}: PlaceManagementCockpitProps) {
  return (
    <div className="place-management-cockpit">
      <div className="place-management-intro">
        <div>
          <strong>Gestao operacional</strong>
          <span>
            {staffRoleLabel} · {countLabel(pendingCount, "pendencia", "pendencias")}
          </span>
        </div>
        <small>{setupPercent}% implantado · {nextStep ? `Proximo: ${nextStep.title}` : "Operacao basica pronta"}</small>
      </div>
      <div className="place-management-health">
        <span style={{ width: `${setupPercent}%` }} />
      </div>
      {nextStep ? (
        <button className="place-next-step" type="button" onClick={() => onModuleChange(nextStep.module)}>
          <strong>Proximo passo</strong>
          <span>{nextStep.detail}</span>
        </button>
      ) : null}
      <div className="place-management-tabs" role="tablist" aria-label={`Gestao de ${placeName}`}>
        {modules.map((module) => (
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
          <strong>{PLACE_MANAGEMENT_MODULE_LABELS[currentModule]}</strong>
          <span>{PLACE_MANAGEMENT_MODULE_DESCRIPTIONS[currentModule]}</span>
        </div>
        {moduleCounts[currentModule] ? (
          <small>{countLabel(moduleCounts[currentModule], "item para acompanhar", "itens para acompanhar")}</small>
        ) : (
          <small>Sem pendencias neste modulo</small>
        )}
      </div>
    </div>
  );
}
