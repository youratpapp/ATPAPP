import type { PlaceProductPlan } from "../../lib/types";

type AnalyticsMetric = {
  label: string;
  value: string | number;
};

type ProductPlanOption = {
  label: string;
  value: PlaceProductPlan;
};

type PlaceAnalyticsPanelProps = {
  busy: boolean;
  canManagePlan: boolean;
  metrics: AnalyticsMetric[];
  plan: PlaceProductPlan;
  planHint: string;
  planOptions: ProductPlanOption[];
  onPlanChange: (plan: PlaceProductPlan) => void;
};

export function PlaceAnalyticsPanel({
  busy,
  canManagePlan,
  metrics,
  plan,
  planHint,
  planOptions,
  onPlanChange,
}: PlaceAnalyticsPanelProps) {
  return (
    <div className="place-booking-panel place-analytics-panel">
      <div className="place-booking-head">
        <strong>Indicadores do local</strong>
        <select value={plan} onChange={(event) => onPlanChange(event.target.value as PlaceProductPlan)} disabled={busy || !canManagePlan} aria-label="Plano do local">
          {planOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <p className="place-plan-hint">{planHint}</p>
      <div className="place-analytics-grid">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
