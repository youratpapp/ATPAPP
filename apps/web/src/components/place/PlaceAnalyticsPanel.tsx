import { MetricStrip } from "../MetricStrip";
import type { PlaceProductPlan } from "../../lib/types";
import { OperationalQueue, OperationalQueueItems } from "./PlaceWorkspaceUi";

type AnalyticsMetric = {
  label: string;
  value: string | number;
};

type AnalyticsModuleRow = {
  title: string;
  detail: string;
  value: string | number;
};

type AnalyticsPeakRow = {
  label: string;
  value: string | number;
  detail: string;
};

type ProductPlanOption = {
  label: string;
  value: PlaceProductPlan;
};

export type AnalyticsReportPeriod = "today" | "month" | "custom" | "all";

type PlaceAnalyticsPanelProps = {
  busy: boolean;
  canManagePlan: boolean;
  metrics: AnalyticsMetric[];
  moduleRows: AnalyticsModuleRow[];
  peakRows: AnalyticsPeakRow[];
  plan: PlaceProductPlan;
  planHint: string;
  planOptions: ProductPlanOption[];
  reportEndDate: string;
  reportPeriod: AnalyticsReportPeriod;
  reportStartDate: string;
  onExport: () => void;
  onReportRangeChange: (range: { startDate: string; endDate: string }) => void;
  onPlanChange: (plan: PlaceProductPlan) => void;
  onReportPeriodChange: (period: AnalyticsReportPeriod) => void;
};

export function PlaceAnalyticsPanel({
  busy,
  canManagePlan,
  metrics,
  moduleRows,
  peakRows,
  plan,
  planHint,
  planOptions,
  reportEndDate,
  reportPeriod,
  reportStartDate,
  onExport,
  onReportRangeChange,
  onPlanChange,
  onReportPeriodChange,
}: PlaceAnalyticsPanelProps) {
  return (
    <div className="place-booking-panel place-analytics-panel">
      <div className="place-booking-head">
        <strong>Relatorios do local</strong>
        <div className="cluster">
          <select value={reportPeriod} onChange={(event) => onReportPeriodChange(event.target.value as AnalyticsReportPeriod)} aria-label="Periodo do relatorio">
            <option value="today">Hoje</option>
            <option value="month">Este mes</option>
            <option value="custom">Periodo</option>
            <option value="all">Tudo</option>
          </select>
          {reportPeriod === "custom" ? (
            <>
              <input
                type="date"
                value={reportStartDate}
                onChange={(event) => onReportRangeChange({ startDate: event.target.value, endDate: reportEndDate })}
                aria-label="Data inicial do relatorio"
              />
              <input
                type="date"
                value={reportEndDate}
                onChange={(event) => onReportRangeChange({ startDate: reportStartDate, endDate: event.target.value })}
                aria-label="Data final do relatorio"
              />
            </>
          ) : null}
          <select value={plan} onChange={(event) => onPlanChange(event.target.value as PlaceProductPlan)} disabled={busy || !canManagePlan} aria-label="Plano do local">
            {planOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button type="button" onClick={onExport}>
            Exportar CSV
          </button>
        </div>
      </div>
      <p className="place-plan-hint">{planHint}</p>
      <MetricStrip
        className="place-analytics-grid"
        items={metrics.map((metric) => ({
          id: metric.label,
          label: metric.label,
          value: metric.value,
        }))}
      />
      <OperationalQueue title="Visao por modulo" emptyLabel="Sem dados suficientes para o periodo.">
        {moduleRows.length ? (
          <OperationalQueueItems
            items={moduleRows.map((row) => ({
              id: `module-report:${row.title}`,
              label: row.value,
              detail: `${row.title} | ${row.detail}`,
            }))}
          />
        ) : null}
      </OperationalQueue>
      <div className="place-report-peaks">
        {peakRows.map((row) => (
          <div key={row.label}>
            <span>{row.label}</span>
            <strong>{row.value}</strong>
            <small>{row.detail}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
