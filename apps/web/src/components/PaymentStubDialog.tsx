import type { ReactNode } from "react";
import { AppDialog } from "./AppOverlays";
import { formatMoneyFromCents } from "../lib/payments";

export type PaymentStubDetail = {
  label: string;
  value: ReactNode;
};

export type PaymentStubDialogPayload = {
  amountCents: number;
  description?: ReactNode;
  details?: PaymentStubDetail[];
  title?: ReactNode;
};

type PaymentStubDialogProps = PaymentStubDialogPayload & {
  busy?: boolean;
  confirmLabel?: string;
  onClose: () => void;
  onConfirm: () => void;
  open: boolean;
};

export function PaymentStubDialog({
  amountCents,
  busy = false,
  confirmLabel = "Pagar",
  description,
  details = [],
  onClose,
  onConfirm,
  open,
  title = "Confirmar pagamento",
}: PaymentStubDialogProps) {
  return (
    <AppDialog
      open={open}
      eyebrow="Pagamento"
      title={title}
      subtitle="Fluxo temporario ate a integracao do gateway"
      className="payment-stub-dialog"
      onClose={onClose}
      actions={
        <>
          <button type="button" className="secondary" onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button type="button" className="primary" onClick={onConfirm} disabled={busy}>
            {busy ? "Processando..." : confirmLabel}
          </button>
        </>
      }
    >
      <div className="payment-stub-body">
        <div className="payment-stub-amount">
          <span>Valor</span>
          <strong>{formatMoneyFromCents(amountCents)}</strong>
        </div>
        {description ? <p>{description}</p> : null}
        {details.length ? (
          <dl className="payment-stub-details">
            {details.map((detail) => (
              <div key={detail.label}>
                <dt>{detail.label}</dt>
                <dd>{detail.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        <small>
          Nesta fase, o botao Pagar registra o item como pago no stub atual. Depois ele sera substituido pelo provedor de pagamento sem mudar o ponto de entrada.
        </small>
      </div>
    </AppDialog>
  );
}
