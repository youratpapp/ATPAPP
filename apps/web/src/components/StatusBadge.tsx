type Props = {
  status: string;
};

const LABELS: Record<string, { label: string; cls: string }> = {
  draft: { label: "Rascunho", cls: "draft" },
  registration_open: { label: "Inscrições abertas", cls: "open" },
  registration_closed: { label: "Inscrições encerradas", cls: "closed" },
  live: { label: "Em andamento", cls: "live" },
  finished: { label: "Encerrado", cls: "finished" },
};

export function StatusBadge({ status }: Props) {
  const meta = LABELS[status] ?? { label: status || "—", cls: "draft" };
  return <span className={`status-badge ${meta.cls}`}>{meta.label}</span>;
}
