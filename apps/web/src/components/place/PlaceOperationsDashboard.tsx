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
  detail?: string;
  id: string;
  label: string;
  module: PlaceManagementModule;
  status?: string;
  viewSegment?: string;
};

type PlaceOperationsDashboardProps = {
  balanceText: string;
  metrics: OperationMetric[];
  queueItems: QueueItem[];
  onModuleChange: (module: PlaceManagementModule, viewSegment?: string) => void;
};

export function PlaceOperationsDashboard({ balanceText, metrics, queueItems, onModuleChange }: PlaceOperationsDashboardProps) {
  const primaryQueue = queueItems[0];
  const totalActions = queueItems.length + metrics.reduce((sum, metric) => sum + (typeof metric.value === "number" ? metric.value : 0), 0);
  const shortcuts: Array<{ label: string; module: PlaceManagementModule; viewSegment?: string }> = [
    { label: "Nova reserva", module: "bookings", viewSegment: "reservas" },
    { label: "Novo cliente", module: "clients", viewSegment: "clientes-ativos" },
    { label: "Registrar pagamento", module: "finance", viewSegment: "recebiveis" },
    { label: "Criar aula", module: "academy", viewSegment: "turmas" },
    { label: "Enviar aviso", module: "communication", viewSegment: undefined },
    { label: "Vender produto", module: "canteen", viewSegment: "vender" },
  ];

  return (
    <div className="work-home-console">
      <header className="work-home-title">
        <span>Central operacional</span>
        <h2>Trabalho Hoje</h2>
        <p>Pendencias, agenda e acoes importantes da sua operacao.</p>
      </header>

      <section className="work-home-hero">
        <div>
          <h3>O que precisa de atencao agora?</h3>
          <p>Resolva reservas, pagamentos, aulas e competicoes em poucos cliques.</p>
          <div className="work-home-hero-actions">
            <button className="primary" type="button" onClick={() => (primaryQueue ? onModuleChange(primaryQueue.module, primaryQueue.viewSegment) : onModuleChange("bookings", "reservas"))}>
              Ver pendencias
            </button>
            <button type="button" onClick={() => onModuleChange("bookings", "calendario")}>
              Abrir agenda
            </button>
          </div>
        </div>
        <strong>{totalActions || queueItems.length} acoes em foco</strong>
      </section>

      <MetricStrip
        className="work-home-metrics"
        items={[
          ...metrics.map((metric) => ({
            id: metric.module,
            label: metric.label,
            value: metric.value,
            disabled: metric.disabled,
            onSelect: () => onModuleChange(metric.module),
          })),
          { id: "balance", label: "Saldo operacional", value: balanceText, disabled: true },
        ]}
      />

      <div className="work-home-grid">
        <section className="work-home-card work-home-card--agenda">
          <header>
            <h3>Agenda em andamento</h3>
            <button type="button" onClick={() => onModuleChange("bookings", "calendario")}>Abrir agenda</button>
          </header>
          <div className="work-home-timeline">
            {queueItems.slice(0, 4).map((item) => (
              <button key={`home-agenda:${item.id}`} type="button" onClick={() => onModuleChange(item.module, item.viewSegment)}>
                <span>{item.label}</span>
                <strong>{item.detail || "Abrir detalhe"}</strong>
                <em>{item.status || "Resolver"}</em>
              </button>
            ))}
            {!queueItems.length ? <p>Nenhum bloqueio critico agora. Use a agenda para acompanhar a operacao do dia.</p> : null}
          </div>
        </section>

        <section className="work-home-card">
          <header>
            <h3>Pendencias criticas</h3>
          </header>
          {queueItems.length ? (
            <OperationalQueue title="">
              <OperationalQueueItems items={queueItems.map((item) => ({ ...item, action: () => onModuleChange(item.module, item.viewSegment) }))} />
            </OperationalQueue>
          ) : (
            <p className="work-home-empty">Sem pendencias criticas nesta unidade.</p>
          )}
        </section>

        <section className="work-home-card">
          <header>
            <h3>Atalhos rapidos</h3>
          </header>
          <div className="work-home-shortcuts">
            {shortcuts.map((shortcut) => (
              <button key={`shortcut:${shortcut.label}`} type="button" onClick={() => onModuleChange(shortcut.module, shortcut.viewSegment)}>
                {shortcut.label}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
