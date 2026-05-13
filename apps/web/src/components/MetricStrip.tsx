import type { ReactNode } from "react";

export type MetricStripItem = {
  detail?: ReactNode;
  disabled?: boolean;
  id: string;
  label: ReactNode;
  onSelect?: () => void;
  value: ReactNode;
};

type MetricStripProps = {
  className?: string;
  items: MetricStripItem[];
};

export function MetricStrip({ className = "", items }: MetricStripProps) {
  return (
    <div className={`metric-strip ${className}`.trim()}>
      {items.map((item) => {
        const content = (
          <>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
            {item.detail ? <small>{item.detail}</small> : null}
          </>
        );
        return item.onSelect ? (
          <button key={item.id} type="button" onClick={item.onSelect} disabled={item.disabled}>
            {content}
          </button>
        ) : (
          <div key={item.id}>{content}</div>
        );
      })}
    </div>
  );
}
