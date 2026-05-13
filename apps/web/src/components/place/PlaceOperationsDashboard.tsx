import type { PlaceManagementModule } from "../../lib/place-management";

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
      <div className="place-operations-grid">
        {metrics.map((metric) => (
          <button key={metric.module} type="button" onClick={() => onModuleChange(metric.module)} disabled={metric.disabled}>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </button>
        ))}
      </div>
      <div className="place-action-queue">
        <strong>Fila de trabalho</strong>
        <div>
          {queueItems.map((item) => (
            <button key={item.id} type="button" onClick={() => onModuleChange(item.module)}>
              {item.label}
            </button>
          ))}
          {!queueItems.length ? <span>Nenhuma pendencia critica agora.</span> : null}
        </div>
      </div>
    </div>
  );
}
