import type { ReactNode } from "react";

type PlaceWorkspaceShellProps<View extends string> = {
  activeView: View;
  ariaLabel: string;
  children: ReactNode;
  className?: string;
  descriptions: Record<View, string>;
  labels: Record<View, string>;
  onViewChange: (view: View) => void;
  title: string;
  views?: View[];
};

export function PlaceWorkspaceShell<View extends string>({
  activeView,
  ariaLabel,
  children,
  className = "",
  descriptions,
  labels,
  onViewChange,
  title,
  views,
}: PlaceWorkspaceShellProps<View>) {
  const visibleViews = views?.length ? views : (Object.keys(labels) as View[]);

  return (
    <div className={`place-workspace ${className}`.trim()}>
      <div className="academy-workspace-top">
        <div>
          <strong>{title}</strong>
          <span>{descriptions[activeView]}</span>
        </div>
        <div className="academy-workspace-tabs" role="tablist" aria-label={ariaLabel}>
          {visibleViews.map((view) => (
            <button key={view} type="button" className={activeView === view ? "active" : ""} onClick={() => onViewChange(view)}>
              {labels[view]}
            </button>
          ))}
        </div>
      </div>
      {children}
    </div>
  );
}
