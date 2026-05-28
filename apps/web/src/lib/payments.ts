import { supabase } from "./supabase";
import type { AppPayment, AppPaymentReminder } from "./types";

type PaymentRow = {
  id: string;
  user_id: string;
  target_type: string;
  target_id: string;
  amount_cents: number | null;
  currency: string | null;
  status: "pending" | "paid" | "failed" | "refunded";
  provider: string | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
  billing_period?: string | null;
  paid_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type PaymentReminderRow = {
  id: string;
  place_id: string | null;
  user_id: string;
  target_type: string;
  target_id: string;
  billing_period: string | null;
  channel: "manual" | "whatsapp" | "email" | "push";
  status: "queued" | "sent" | "cancelled";
  message: string;
  created_at: string | null;
  updated_at: string | null;
};

function rowToPayment(row: PaymentRow): AppPayment {
  return {
    id: row.id,
    userId: row.user_id,
    targetType: row.target_type,
    targetId: row.target_id,
    amountCents: Number(row.amount_cents || 0),
    currency: row.currency || "BRL",
    status: row.status,
    provider: row.provider || "stub",
    description: row.description || "",
    metadata: row.metadata || {},
    billingPeriod: row.billing_period || "",
    paidAt: row.paid_at || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
  };
}

function rowToPaymentReminder(row: PaymentReminderRow): AppPaymentReminder {
  return {
    id: row.id,
    placeId: row.place_id || "",
    userId: row.user_id,
    targetType: row.target_type,
    targetId: row.target_id,
    billingPeriod: row.billing_period || "",
    channel: row.channel,
    status: row.status,
    message: row.message,
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
  };
}

export function formatMoneyFromCents(amountCents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Math.max(0, Number(amountCents || 0)) / 100);
}

export async function listMyPayments(targetType?: string): Promise<AppPayment[]> {
  if (!supabase) return [];
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw new Error(userError.message);
  if (!userData.user) return [];
  let query = supabase
    .from("app_payments")
    .select("id,user_id,target_type,target_id,amount_cents,currency,status,provider,description,metadata,billing_period,paid_at,created_at,updated_at")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false })
    .limit(80);

  if (targetType) {
    query = query.eq("target_type", targetType);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return ((data ?? []) as PaymentRow[]).map(rowToPayment);
}

export async function listPaymentsForTargets(targetType: string, targetIds: string[]): Promise<AppPayment[]> {
  if (!supabase) return [];
  const uniqueTargetIds = Array.from(new Set(targetIds.filter(Boolean))).slice(0, 120);
  if (!targetType || uniqueTargetIds.length === 0) return [];

  const { data, error } = await supabase
    .from("app_payments")
    .select("id,user_id,target_type,target_id,amount_cents,currency,status,provider,description,metadata,billing_period,paid_at,created_at,updated_at")
    .eq("target_type", targetType)
    .in("target_id", uniqueTargetIds)
    .order("created_at", { ascending: false })
    .limit(160);

  if (error) throw new Error(error.message);
  return ((data ?? []) as PaymentRow[]).map(rowToPayment);
}

export async function markStubPaymentPaid(input: {
  targetType: string;
  targetId: string;
  amountCents?: number;
  description?: string;
  metadata?: Record<string, unknown>;
  billingPeriod?: string;
}): Promise<AppPayment> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const paidAt = new Date().toISOString();
  const { data, error } = await supabase.rpc("app_mark_stub_payment_paid", {
    p_target_type: input.targetType,
    p_target_id: input.targetId,
    p_amount_cents: input.amountCents || 0,
    p_description: input.description || null,
    p_metadata: {
      ...(input.metadata || {}),
      markedAt: paidAt,
      paymentMethod: "manual_stub",
      receiptType: "temporary_internal_receipt",
      source: typeof input.metadata?.source === "string" ? input.metadata.source : "manual_stub",
    },
  });
  if (error) throw new Error(error.message);
  const row = ((data ?? []) as PaymentRow[])[0];
  if (!row) throw new Error("Pagamento nao registrado.");
  return rowToPayment(row);
}

export async function markStubPaymentPaidForParticipant(input: {
  targetType: string;
  targetId: string;
  amountCents?: number;
  description?: string;
  metadata?: Record<string, unknown>;
  billingPeriod?: string;
}): Promise<AppPayment> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const paidAt = new Date().toISOString();
  const { data, error } = await supabase.rpc("app_mark_stub_payment_paid_for_participant", {
    p_target_type: input.targetType,
    p_target_id: input.targetId,
    p_amount_cents: input.amountCents || 0,
    p_description: input.description || null,
    p_metadata: {
      ...(input.metadata || {}),
      markedAt: paidAt,
      paymentMethod: "manual_stub",
      receiptType: "temporary_internal_receipt",
      source: typeof input.metadata?.source === "string" ? input.metadata.source : "manual_stub",
    },
    p_billing_period: input.billingPeriod || "",
  });
  if (error) throw new Error(error.message);
  const row = ((data ?? []) as PaymentRow[])[0];
  if (!row) throw new Error("Pagamento nao registrado.");
  return rowToPayment(row);
}

export async function createPaymentReminderForParticipant(input: {
  targetType: string;
  targetId: string;
  billingPeriod?: string;
  message?: string;
  channel?: AppPaymentReminder["channel"];
}): Promise<AppPaymentReminder> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase.rpc("app_create_payment_reminder_for_participant", {
    p_target_type: input.targetType,
    p_target_id: input.targetId,
    p_billing_period: input.billingPeriod || "",
    p_message: input.message || null,
    p_channel: input.channel || "manual",
  });
  if (error) throw new Error(error.message);
  const row = ((data ?? []) as PaymentReminderRow[])[0];
  if (!row) throw new Error("Lembrete nao registrado.");
  return rowToPaymentReminder(row);
}
