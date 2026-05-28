import { supabase } from "./supabase";

export type OperationEventAction =
  | "booking_cancelled"
  | "booking_confirmed"
  | "booking_edited"
  | "booking_paid"
  | "booking_whatsapp_reschedule_opened";

export async function logOperationEvent(input: {
  action: OperationEventAction | string;
  entityId?: string;
  entityType: string;
  message?: string;
  metadata?: Record<string, unknown>;
  placeId?: string;
}): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.rpc("app_log_operation_event", {
    p_action: input.action,
    p_entity_id: input.entityId || null,
    p_entity_type: input.entityType,
    p_message: input.message || "",
    p_metadata: input.metadata || {},
    p_place_id: input.placeId || null,
  });
  if (error) {
    // Logging cannot block the operational flow. The visible action already succeeded.
    console.warn("Falha ao registrar evento operacional.", error.message);
  }
}
