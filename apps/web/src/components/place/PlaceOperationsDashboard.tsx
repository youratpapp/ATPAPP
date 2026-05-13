import { MetricStrip } from "../MetricStrip";
import type { PlaceManagementModule } from "../../lib/place-management";
import { OperationalQueue, OperationalQueueItems } from "./PlaceWorkspaceUi";

type OperationMetric = {
  disabled: boolean;
  label: string;
  module: PlaceManagementModule;
  value: string | number;
};

type QueueItem = {
  id: string;
  label: string;
  module: PlaceManagementModule;
};

type PlaceOperationsDashboardProps = {
  balanceText: string;
  metrics: OperationMetric[];
  queueItems: QueueItem[];
  onModuleChange: (module: PlaceManagementModule) => void;
};

export function PlaceOperationsDashboard({ balanceText, metrics, queueItems, onModuleChange }: PlaceOperationsDashboardProps) {
  return (
    <div className="place-booking-panel place-operations-board">
      <div className="place-booking-head">
        <strong>Hoje e prioridades</strong>
        <span>{balanceText} saldo</span>
      </div>
      <MetricStrip
        className="place-operations-grid"
        items={metrics.map((metric) => ({
          id: metric.module,
          label: metric.label,
          value: metric.value,
          disabled: metric.disabled,
          onSelect: () => onModuleChange(metric.module),
        }))}
      />
      <OperationalQueue title="Fila de trabalho">
        {queueItems.length ? <OperationalQueueItems items={queueItems.map((item) => ({ ...item, action: () => onModuleChange(item.module) }))} /> : null}
      </OperationalQueue>
    </div>
  );
}
