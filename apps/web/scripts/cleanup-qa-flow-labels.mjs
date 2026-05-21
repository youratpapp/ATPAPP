import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const ROOT = process.cwd();
const envPath = path.join(ROOT, ".env.local");

function loadLocalEnv() {
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
    if (key && !process.env[key]) process.env[key] = value;
  }
}

loadLocalEnv();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://xdopstommqojjofapzjl.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_bofGMq6jhqcVetHTGP6GjQ_vJQWsTjh";
const OWNER_EMAIL = process.env.ATP_OWNER_EMAIL || "escalao@gmail.com";
const OWNER_PASSWORD = process.env.ATP_OWNER_PASSWORD || "Escalao@2026!";

function suffixFromName(name, prefix) {
  return String(name || "").replace(prefix, "").trim();
}

function replacementName(base, suffix) {
  return suffix ? `${base} ${suffix}` : base;
}

async function updateMatchingRows(supabase, config) {
  const { table, select, match, oldPrefix, newBase, patchFor } = config;
  const { data, error } = await supabase.from(table).select(select).ilike("name", match);
  if (error) throw new Error(`${table} select: ${error.message}`);

  const rows = data || [];
  const updated = [];
  for (const row of rows) {
    const suffix = suffixFromName(row.name, oldPrefix);
    const nextName = replacementName(newBase, suffix);
    const patch = patchFor ? patchFor(row, nextName) : { name: nextName };
    const { error: updateError } = await supabase.from(table).update(patch).eq("id", row.id);
    if (updateError) throw new Error(`${table} update ${row.id}: ${updateError.message}`);
    updated.push({ id: row.id, before: row.name, after: nextName });
  }

  const { data: remaining, error: remainingError } = await supabase
    .from(table)
    .select("id,name")
    .ilike("name", match);
  if (remainingError) throw new Error(`${table} remaining: ${remainingError.message}`);

  return { table, updated, remaining: remaining || [] };
}

async function updateRowsWhereEquals(supabase, config) {
  const { table, select, column, value, patch } = config;
  const { data, error } = await supabase.from(table).select(select).eq(column, value);
  if (error) throw new Error(`${table} select ${column}: ${error.message}`);

  const rows = data || [];
  const updated = [];
  for (const row of rows) {
    const nextPatch = typeof patch === "function" ? patch(row) : patch;
    const { error: updateError } = await supabase.from(table).update(nextPatch).eq("id", row.id);
    if (updateError) throw new Error(`${table} update ${row.id}: ${updateError.message}`);
    updated.push({ id: row.id, before: row[column], patch: nextPatch });
  }

  const { data: remaining, error: remainingError } = await supabase
    .from(table)
    .select(select)
    .eq(column, value);
  if (remainingError) throw new Error(`${table} remaining ${column}: ${remainingError.message}`);

  return { table, column, value, updated, remaining: remaining || [] };
}

async function rewritePaymentDescriptions(supabase, oldDescription, newDescription) {
  const { data, error } = await supabase
    .from("app_payments")
    .select("id,target_type,target_id,amount_cents,description,metadata,billing_period")
    .eq("description", oldDescription);
  if (error) throw new Error(`app_payments select description: ${error.message}`);

  const rows = data || [];
  const updated = [];
  for (const row of rows) {
    const { error: rpcError } = await supabase.rpc("app_mark_stub_payment_paid_for_participant", {
      p_target_type: row.target_type,
      p_target_id: row.target_id,
      p_amount_cents: row.amount_cents,
      p_description: newDescription,
      p_metadata: row.metadata || {},
      p_billing_period: row.billing_period || null,
    });
    if (rpcError) throw new Error(`app_payments rpc ${row.id}: ${rpcError.message}`);
    updated.push({ id: row.id, before: row.description, after: newDescription });
  }

  const { data: remaining, error: remainingError } = await supabase
    .from("app_payments")
    .select("id,description")
    .eq("description", oldDescription);
  if (remainingError) throw new Error(`app_payments remaining description: ${remainingError.message}`);

  return { table: "app_payments", column: "description", value: oldDescription, updated, remaining: remaining || [] };
}

async function runStep(label, fn) {
  try {
    return { label, ok: true, ...(await fn()) };
  } catch (error) {
    return { label, ok: false, message: error instanceof Error ? error.message : String(error) };
  }
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  const { data, error } = await supabase.auth.signInWithPassword({
    email: OWNER_EMAIL,
    password: OWNER_PASSWORD,
  });
  if (error) throw new Error(`owner login: ${error.message}`);
  if (!data.user) throw new Error("owner login returned no user");

  const results = [];
  results.push(
    await runStep("tournament names", () => updateMatchingRows(supabase, {
      table: "tournaments",
      select: "id,name",
      match: "QA Fluxo V4 %",
      oldPrefix: "QA Fluxo V4",
      newBase: "ATP Open Dourados",
    }))
  );
  results.push(
    await runStep("place names", () => updateMatchingRows(supabase, {
      table: "places",
      select: "id,name,description",
      match: "QA Academia Fluxo %",
      oldPrefix: "QA Academia Fluxo",
      newBase: "ATP Centro Dourados",
      patchFor: (_row, nextName) => ({
        name: nextName,
        description: "Centro ATP em Dourados para aulas, reservas, alunos e atendimento.",
      }),
    }))
  );
  results.push(
    await runStep("league names", () => updateMatchingRows(supabase, {
      table: "leagues",
      select: "id,name",
      match: "QA Liga V4 %",
      oldPrefix: "QA Liga V4",
      newBase: "Liga ATP Dourados",
    }))
  );

  for (const item of [
    ["place_courts", "id,name", "name", "QA Quadra 1", { name: "Quadra 1" }],
    ["place_courts", "id,name", "name", "QA Quadra 2", { name: "Quadra 2" }],
    ["place_courts", "id,name", "name", "QA Quadra 3", { name: "Quadra 3" }],
    ["place_booking_rules", "id,name", "name", "QA Horario operacional", { name: "Horario operacional" }],
    ["place_coaches", "id,name,public_bio,internal_notes", "name", "Renato Siqueira QA", { name: "Renato Siqueira" }],
    ["place_coaches", "id,name,public_bio,internal_notes", "name", "Lais Monteiro QA", { name: "Lais Monteiro" }],
    [
      "place_coaches",
      "id,public_bio",
      "public_bio",
      "Professor criado para auditoria E2E de academia.",
      { public_bio: "Professor ATP com foco em evolucao tecnica, aulas em grupo e acompanhamento de alunos." },
    ],
    ["place_academy_classes", "id,title", "title", "QA Adulto Intermediario", { title: "Adulto Intermediario" }],
    ["place_academy_classes", "id,title", "title", "QA Kids Iniciante", { title: "Kids Iniciante" }],
    ["place_academy_classes", "id,coach_name", "coach_name", "Renato Siqueira QA", { coach_name: "Renato Siqueira" }],
    ["place_academy_classes", "id,coach_name", "coach_name", "Lais Monteiro QA", { coach_name: "Lais Monteiro" }],
    [
      "place_academy_student_contracts",
      "id,notes",
      "notes",
      "Contrato ativo E2E com duas aulas semanais.",
      { notes: "Contrato ativo com duas aulas semanais." },
    ],
    ["place_academy_student_contracts", "id,notes", "notes", "Contrato ativo E2E.", { notes: "Contrato ativo." }],
    [
      "place_academy_student_contracts",
      "id,notes",
      "notes",
      "Contrato pendente E2E para validar fila.",
      { notes: "Contrato pendente para revisar atendimento." },
    ],
    ["court_bookings", "id,notes", "notes", "Reserva E2E feita por jogador seed.", { notes: "Reserva feita pelo jogador." }],
    [
      "court_booking_waitlist",
      "id,notes",
      "notes",
      "Lista de espera E2E no mesmo horario da reserva.",
      { notes: "Lista de espera no mesmo horario da reserva." },
    ],
  ]) {
    const [table, select, column, value, patch] = item;
    results.push(
      await runStep(`${table}.${column}`, () =>
        updateRowsWhereEquals(supabase, {
          table,
          select,
          column,
          value,
          patch,
        })
      )
    );
  }

  results.push(
    await runStep("app_payments.description", () =>
      rewritePaymentDescriptions(supabase, "Mensalidade QA paga manualmente", "Mensalidade paga manualmente")
    )
  );

  const failed = results.filter((result) => !result.ok);
  console.log(
    JSON.stringify(
      {
        ok: failed.length === 0,
        failed: failed.length,
        results,
      },
      null,
      2
    )
  );
  if (failed.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, message: error instanceof Error ? error.message : String(error) }, null, 2));
  process.exitCode = 1;
});
