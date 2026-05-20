import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Link } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { ScreenState } from "../components/ScreenState";
import { friendlyToastMessage } from "../components/toast";
import { formatMoneyFromCents, listMyPayments } from "../lib/payments";
import type { AppPayment, Profile } from "../lib/types";

type Props = {
  user: User;
  profile: Profile | null;
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

export function MyPaymentsPage({ user, profile }: Props) {
  const [payments, setPayments] = useState<AppPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  const renderPayment = (payment: AppPayment) => {
    const status = paymentStatus(payment);
    return (
      <article key={payment.id} className="personal-area-row static">
        <span>
          <strong>{payment.description || payment.targetType}</strong>
          <small>{paymentDate(payment.createdAt)} | {formatMoneyFromCents(payment.amountCents)}</small>
        </span>
        <em className={`status-pill tone-${status.tone}`}>{status.label}</em>
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
      </main>
    </AppShell>
  );
}
