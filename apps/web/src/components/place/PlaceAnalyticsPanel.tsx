import type { PlaceProductPlan } from "../../lib/types";
import { useState } from "react";

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

const PERIOD_LABELS: Record<AnalyticsReportPeriod, string> = {
  all: "Tudo",
  custom: "Periodo",
  month: "Este mes",
  today: "Hoje",
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
  onPlanChange,
  onReportPeriodChange,
  onReportRangeChange,
}: PlaceAnalyticsPanelProps) {
  const primaryMetrics = metrics.slice(0, 4);
  const secondaryMetrics = metrics.slice(4);
  const [selectedModuleTitle, setSelectedModuleTitle] = useState<string | null>(moduleRows[0]?.title || null);
  const selectedModule = moduleRows.find((row) => row.title === selectedModuleTitle) || moduleRows[0] || null;

  return (
    <section className="reports-console" aria-label="Relatorios do local">
      <header className="reports-console__header">
        <div>
          <span>Relatorios</span>
          <h2>Visao da operacao</h2>
          <p>Indicadores de agenda, aulas, clientes, receita e uso do local em uma leitura executiva.</p>
        </div>
        <div className="reports-console__controls">
          <select value={reportPeriod} onChange={(event) => onReportPeriodChange(event.target.value as AnalyticsReportPeriod)} aria-label="Periodo do relatorio">
            {Object.entries(PERIOD_LABELS).map(([value, label]) => (
              <option key={`report-period:${value}`} value={value}>
                {label}
              </option>
            ))}
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
          <button type="button" onClick={onExport}>Exportar CSV</button>
        </div>
      </header>

      <div className="reports-console__plan">
        <div>
          <span>Plano atual</span>
          <strong>{planOptions.find((option) => option.value === plan)?.label || plan}</strong>
          <small>{planHint}</small>
        </div>
        <select value={plan} onChange={(event) => onPlanChange(event.target.value as PlaceProductPlan)} disabled={busy || !canManagePlan} aria-label="Plano do local">
          {planOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="reports-console__metrics">
        {primaryMetrics.map((metric) => (
          <article key={`report-primary:${metric.label}`}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </div>

      <div className="reports-console__body">
        <div className="reports-console__table" role="table" aria-label="Relatorio por modulo">
          <div className="reports-console__table-head" role="row">
            <span>Modulo</span>
            <span>Indicador</span>
            <span>Leitura</span>
          </div>
          <div className="reports-console__table-rows">
            {moduleRows.map((row) => (
              <button
                key={`module-report:${row.title}`}
                type="button"
                className={`reports-console__table-row ${selectedModule?.title === row.title ? "active" : ""}`.trim()}
                onClick={() => setSelectedModuleTitle(row.title)}
                role="row"
              >
                <strong>{row.title}</strong>
                <span>{row.value}</span>
                <small>{row.detail}</small>
              </button>
            ))}
            {!moduleRows.length ? <p>Sem dados suficientes para o periodo.</p> : null}
          </div>
        </div>

        <aside className="reports-console__drawer" aria-label="Detalhe do relatorio">
          <header>
            <span>Detalhe</span>
            <h3>{selectedModule?.title || "Resumo"}</h3>
            <p>{selectedModule?.detail || "Selecione um modulo para acompanhar a leitura operacional."}</p>
          </header>
          <div className="reports-console__secondary">
            {secondaryMetrics.slice(0, 6).map((metric) => (
              <article key={`report-secondary:${metric.label}`}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </article>
            ))}
          </div>
          <section>
            <div className="reports-console__section-title">
              <strong>Picos e alertas</strong>
              <span>{peakRows.length}</span>
            </div>
            <div className="reports-console__peaks">
              {peakRows.map((row) => (
                <article key={row.label}>
                  <span>{row.label}</span>
                  <strong>{row.value}</strong>
                  <small>{row.detail}</small>
                </article>
              ))}
              {!peakRows.length ? <small>Nenhum pico relevante no periodo selecionado.</small> : null}
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
