import { useMemo, useState, type ReactNode } from "react";

export type SetupWizardStep = {
  canContinue?: boolean;
  content: ReactNode;
  detail?: ReactNode;
  id: string;
  label: ReactNode;
};

type SetupWizardProps = {
  busy?: boolean;
  cancelLabel?: ReactNode;
  finishLabel: ReactNode;
  onCancel: () => void;
  onFinish: () => void;
  secondaryAction?: ReactNode;
  steps: SetupWizardStep[];
  subtitle?: ReactNode;
  title: ReactNode;
};

export function SetupWizard({
  busy = false,
  cancelLabel = "Cancelar",
  finishLabel,
  onCancel,
  onFinish,
  secondaryAction,
  steps,
  subtitle,
  title,
}: SetupWizardProps) {
  const safeSteps = useMemo(() => steps.filter(Boolean), [steps]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeStep = safeSteps[Math.min(activeIndex, safeSteps.length - 1)];
  const isFirst = activeIndex <= 0;
  const isLast = activeIndex >= safeSteps.length - 1;
  const canContinue = activeStep?.canContinue !== false;

  if (!activeStep) return null;

  return (
    <div className="setup-wizard">
      <header className="setup-wizard-head">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        <span>
          {activeIndex + 1}/{safeSteps.length}
        </span>
      </header>

      <nav className="setup-wizard-steps" aria-label="Etapas do assistente">
        {safeSteps.map((step, index) => (
          <button
            key={step.id}
            className={index === activeIndex ? "active" : index < activeIndex ? "done" : ""}
            onClick={() => setActiveIndex(index)}
            type="button"
            disabled={busy || (index > activeIndex && !canContinue)}
          >
            <strong>{step.label}</strong>
            {step.detail ? <small>{step.detail}</small> : null}
          </button>
        ))}
      </nav>

      <section className="setup-wizard-body">{activeStep.content}</section>

      <footer className="setup-wizard-actions">
        <button className="ghost" onClick={onCancel} disabled={busy} type="button">
          {cancelLabel}
        </button>
        {!isFirst ? (
          <button onClick={() => setActiveIndex((prev) => Math.max(0, prev - 1))} disabled={busy} type="button">
            Voltar
          </button>
        ) : null}
        {isLast ? (
          <>
            {secondaryAction}
            <button className="primary" onClick={onFinish} disabled={busy || !canContinue} type="button">
              {busy ? "Salvando..." : finishLabel}
            </button>
          </>
        ) : (
          <button className="primary" onClick={() => setActiveIndex((prev) => Math.min(safeSteps.length - 1, prev + 1))} disabled={busy || !canContinue} type="button">
            Continuar
          </button>
        )}
      </footer>
    </div>
  );
}
