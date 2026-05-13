import type { ReactNode } from "react";
import { ActionBar } from "./ActionBar";

type ScreenStateProps = {
  action?: ReactNode;
  detail?: ReactNode;
  icon?: ReactNode;
  kind?: "empty" | "error" | "info" | "loading" | "success";
  title: ReactNode;
};

export function ScreenState({ action, detail, icon, kind = "empty", title }: ScreenStateProps) {
  if (kind === "error") {
    return (
      <div className="screen-state screen-state-error" role="alert">
        {icon ? <span className="screen-state-icon">{icon}</span> : null}
        <strong>{title}</strong>
        {detail ? <p>{detail}</p> : null}
        {action ? <ActionBar className="screen-state-actions">{action}</ActionBar> : null}
      </div>
    );
  }

  return (
    <div className={`screen-state screen-state-${kind}`}>
      {icon ? <span className="screen-state-icon">{icon}</span> : null}
      <strong>{title}</strong>
      {detail ? <p>{detail}</p> : null}
      {action ? <ActionBar className="screen-state-actions">{action}</ActionBar> : null}
    </div>
  );
}
