import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Link } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { PaymentStubDialog, type PaymentStubDialogPayload } from "../components/PaymentStubDialog";
import { ScreenState } from "../components/ScreenState";
import { friendlyToastMessage, useToast } from "../components/toast";
import { formatMoneyFromCents, listMyPayments, markStubPaymentPaidForParticipant } from "../lib/payments";
import type { AppPayment, Profile } from "../lib/types";

type Props = {
  user: User;
  profile: Profile | null;
};

type PaymentDialogState = PaymentStubDialogPayload & {
  onConfirm: () => Promise<void> | void;
};

function paymentStatus(payment: AppPayment): { label: string; tone: "ok" | "pending" | "muted" | "danger" } {
  if (payment.status === "paid") return { label: "Pago", tone: "ok" };
  if (payment.status === "failed") return { label: "Falhou", tone: "danger" };
  if (payment.status === "refunded") return { label: "Estornado", tone: "muted" };
  return { label: "Pendente", tone: "pending" };
}

function paymentDate(value: string): string {
  if (!value) return "Sem data";
  return new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function paymentTargetLabel(type: string): string {
  if (type === "court_booking") return "Reserva de quadra";
  if (type === "membership") return "Mensalidade";
  if (type === "academy_contract") return "Plano de aula";
  if (type === "academy_lesson_request") return "Aula / reposicao";
  if (type === "tournament_registration") return "Inscricao em torneio";
  if (type === "league_registration") return "Inscricao em liga";
  return "Pagamento pessoal";
}

export function MyPaymentsPage({ user, profile }: Props) {
  const { showToast } = useToast();
  const [payments, setPayments] = useState<AppPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyPaymentId, setBusyPaymentId] = useState("");
  const [paymentDialog, setPaymentDialog] = useState<PaymentDialogState | null>(null);
  const pending = useMemo(() => payments.filter((payment) => payment.status === "pending" || payment.status === "failed"), [payments]);
  const history = useMemo(() => payments.filter((payment) => payment.status === "paid" || payment.status === "refunded"), [payments]);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    listMyPayments()
      .then(setPayments)
      .catch((err) => setError(friendlyToastMessage(err, "Nao foi possivel carregar seus pagamentos.")))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const closePaymentDialog = () => {
    if (!busyPaymentId) setPaymentDialog(null);
  };

  const confirmPaymentDialog = async () => {
    const intent = paymentDialog;
    if (!intent) return;
    await intent.onConfirm();
    setPaymentDialog(null);
  };

  const requestPayment = (payment: AppPayment) => {
    const targetLabel = paymentTargetLabel(payment.targetType);
    setPaymentDialog({
      title: "Pagar item pessoal",
      description: payment.description || targetLabel,
      amountCents: payment.amountCents,
      details: [
        { label: "Origem", value: targetLabel },
        { label: "Periodo", value: payment.billingPeriod || "Sem periodo" },
        { label: "Status", value: paymentStatus(payment).label },
      ],
      onConfirm: async () => {
        setBusyPaymentId(payment.id);
        try {
          const updatedPayment = await markStubPaymentPaidForParticipant({
            targetType: payment.targetType,
            targetId: payment.targetId,
            amountCents: payment.amountCents,
            description: payment.description || targetLabel,
            billingPeriod: payment.billingPeriod,
            metadata: { ...payment.metadata, source: "player_payment_page_stub" },
          });
          setPayments((current) => {
            let replaced = false;
            const nextPayments = current.map((entry) => {
              const samePayment =
                entry.id === payment.id ||
                (entry.targetType === payment.targetType &&
                  entry.targetId === payment.targetId &&
                  (entry.billingPeriod || "") === (payment.billingPeriod || ""));
              if (!samePayment) return entry;
              replaced = true;
              return updatedPayment;
            });
            return replaced ? nextPayments : [updatedPayment, ...nextPayments];
          });
          showToast({ kind: "success", text: "Pagamento registrado." });
        } catch (err) {
          showToast({ kind: "error", text: friendlyToastMessage(err, "Nao foi possivel pagar.") });
        } finally {
          setBusyPaymentId("");
        }
      },
    });
  };

  const renderPayment = (payment: AppPayment) => {
    const status = paymentStatus(payment);
    const canPay = payment.status === "pending" || payment.status === "failed";
    return (
      <article key={payment.id} className="personal-area-row static">
        <span>
          <strong>{payment.description || payment.targetType}</strong>
          <small>{paymentDate(payment.createdAt)} | {formatMoneyFromCents(payment.amountCents)}</small>
        </span>
        <div className="cluster">
          <em className={`status-pill tone-${status.tone}`}>{status.label}</em>
          {canPay ? (
            <button type="button" className="primary" onClick={() => requestPayment(payment)} disabled={busyPaymentId === payment.id}>
              {busyPaymentId === payment.id ? "Processando..." : "Pagar"}
            </button>
          ) : null}
        </div>
      </article>
    );
  };

  return (
    <AppShell user={user} profile={profile} mode="player">
      <main className="page personal-area-page">
        <header className="personal-area-header">
          <span>Financeiro</span>
          <h1>Meus pagamentos</h1>
          <p>Acompanhe cobrancas de reservas, aulas, torneios e ligas em um so lugar.</p>
        </header>
        {loading ? <ScreenState kind="loading" title="Carregando pagamentos..." /> : null}
        {error ? (
          <ScreenState
            kind="error"
            title="Nao foi possivel carregar"
            detail={error}
            action={<button className="secondary" onClick={load}>Tentar novamente</button>}
          />
        ) : null}
        {!loading && !error && !payments.length ? (
          <ScreenState
            title="Nenhum pagamento encontrado"
            detail="Quando houver uma cobranca vinculada a sua conta, ela aparece aqui."
            action={<Link className="button-like primary" to="/locais?intent=places">Explorar quadras</Link>}
          />
        ) : null}
        {!loading && !error && payments.length ? (
          <div className="personal-area-grid">
            <section className="personal-area-card">
              <header><div><span>Pendencias</span><h2>A resolver</h2></div><b>{pending.length}</b></header>
              {pending.length ? pending.map(renderPayment) : <p className="subtle">Nada pendente.</p>}
            </section>
            <section className="personal-area-card">
              <header><div><span>Historico</span><h2>Pagos e encerrados</h2></div><b>{history.length}</b></header>
              {history.length ? history.map(renderPayment) : <p className="subtle">Sem historico ainda.</p>}
            </section>
          </div>
        ) : null}
        <PaymentStubDialog
          open={Boolean(paymentDialog)}
          title={paymentDialog?.title}
          description={paymentDialog?.description}
          amountCents={paymentDialog?.amountCents || 0}
          details={paymentDialog?.details}
          busy={Boolean(busyPaymentId)}
          onClose={closePaymentDialog}
          onConfirm={() => void confirmPaymentDialog()}
        />
      </main>
    </AppShell>
  );
}
