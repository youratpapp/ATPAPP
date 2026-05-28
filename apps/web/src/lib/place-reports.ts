import { supabase } from "./supabase";

export type PlaceOperationsReportMetric = {
  amountCents: number;
  detail: string;
  key: string;
  label: string;
  value: number;
};

type PlaceOperationsReportRow = {
  amount_cents: number | null;
  detail: string | null;
  metric_key: string;
  metric_label: string;
  metric_value: number | string | null;
};

export async function getPlaceOperationsReport(input: {
  endsAt: string;
  placeId: string;
  startsAt: string;
}): Promise<PlaceOperationsReportMetric[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("app_place_operations_report", {
    p_ends_at: input.endsAt,
    p_place_id: input.placeId,
    p_starts_at: input.startsAt,
  });
  if (error) throw new Error(error.message);
  return ((data ?? []) as PlaceOperationsReportRow[]).map((row) => ({
    amountCents: Number(row.amount_cents || 0),
    detail: row.detail || "",
    key: row.metric_key,
    label: row.metric_label,
    value: Number(row.metric_value || 0),
  }));
}
