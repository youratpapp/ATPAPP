import type { ReactNode } from "react";

type ActionBarProps = {
  children: ReactNode;
  className?: string;
  label?: string;
};

export function ActionBar({ children, className = "", label = "Acoes" }: ActionBarProps) {
  return (
    <div className={`action-bar ${className}`.trim()} aria-label={label}>
      {children}
    </div>
  );
}
