import { supabase } from "./supabase";

export type OperationalTaskPriority = "low" | "normal" | "high" | "urgent";
export type OperationalTaskStatus = "open" | "in_progress" | "done" | "cancelled";

export type OperationalTask = {
  assignedTo: string | null;
  completedAt: string | null;
  createdAt: string;
  createdBy: string | null;
  description: string;
  dueAt: string | null;
  entityId: string | null;
  entityType: string;
  id: string;
  metadata: Record<string, unknown>;
  placeId: string;
  priority: OperationalTaskPriority;
  status: OperationalTaskStatus;
  title: string;
  updatedAt: string;
};

type OperationalTaskRow = {
  assigned_to: string | null;
  completed_at: string | null;
  created_at: string;
  created_by: string | null;
  description: string | null;
  due_at: string | null;
  entity_id: string | null;
  entity_type: string;
  id: string;
  metadata: Record<string, unknown> | null;
  place_id: string;
  priority: OperationalTaskPriority;
  status: OperationalTaskStatus;
  title: string;
  updated_at: string;
};

function mapTask(row: OperationalTaskRow): OperationalTask {
  return {
    assignedTo: row.assigned_to,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    createdBy: row.created_by,
    description: row.description || "",
    dueAt: row.due_at,
    entityId: row.entity_id,
    entityType: row.entity_type,
    id: row.id,
    metadata: row.metadata || {},
    placeId: row.place_id,
    priority: row.priority,
    status: row.status,
    title: row.title,
    updatedAt: row.updated_at,
  };
}

export async function listOperationalTasks(input: {
  placeId: string;
  status?: OperationalTaskStatus | "active";
}): Promise<OperationalTask[]> {
  if (!supabase) return [];
  let query = supabase
    .from("app_operational_tasks")
    .select("*")
    .eq("place_id", input.placeId)
    .order("due_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (input.status === "active") {
    query = query.in("status", ["open", "in_progress"]);
  } else if (input.status) {
    query = query.eq("status", input.status);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return ((data || []) as OperationalTaskRow[]).map(mapTask);
}

export async function createOperationalTask(input: {
  assignedTo?: string | null;
  description?: string;
  dueAt?: string | null;
  entityId?: string | null;
  entityType: string;
  metadata?: Record<string, unknown>;
  placeId: string;
  priority?: OperationalTaskPriority;
  title: string;
}): Promise<OperationalTask | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("app_create_operational_task", {
    p_assigned_to: input.assignedTo || null,
    p_description: input.description || "",
    p_due_at: input.dueAt || null,
    p_entity_id: input.entityId || null,
    p_entity_type: input.entityType,
    p_metadata: input.metadata || {},
    p_place_id: input.placeId,
    p_priority: input.priority || "normal",
    p_title: input.title,
  });
  if (error) throw new Error(error.message);
  return data ? mapTask(data as OperationalTaskRow) : null;
}

export async function updateOperationalTaskStatus(taskId: string, status: OperationalTaskStatus): Promise<OperationalTask | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("app_update_operational_task_status", {
    p_status: status,
    p_task_id: taskId,
  });
  if (error) throw new Error(error.message);
  return data ? mapTask(data as OperationalTaskRow) : null;
}
