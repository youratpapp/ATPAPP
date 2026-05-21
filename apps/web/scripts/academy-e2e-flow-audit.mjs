import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const ROOT = process.cwd();
const APP_URL = process.env.APP_URL || "http://127.0.0.1:5173/";
const OUT_DIR = process.env.ATP_ACADEMY_FLOW_OUT_DIR
  ? path.resolve(ROOT, process.env.ATP_ACADEMY_FLOW_OUT_DIR)
  : path.join(ROOT, "docs", "screenshots", "academy-e2e-flow-v1-2026-05-21");

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://xdopstommqojjofapzjl.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_bofGMq6jhqcVetHTGP6GjQ_vJQWsTjh";

const OWNER_EMAIL = process.env.ATP_OWNER_EMAIL || "escalao@gmail.com";
const OWNER_PASSWORD = process.env.ATP_OWNER_PASSWORD || "Escalao@2026!";
const STAFF_PASSWORD = process.env.ATP_STAFF_PASSWORD || "Staff@2026!";
const PLAYER_PASSWORD = process.env.ATP_PLAYER_PASSWORD || "Jogador@2026!";

const COACH_EMAILS = (process.env.ATP_ACADEMY_COACHES || "prof.renato@demo.atp.local,prof.lais@demo.atp.local")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);
const FRONTDESK_EMAIL = process.env.ATP_ACADEMY_FRONTDESK || "recepcao.dourados@demo.atp.local";
const FINANCE_EMAIL = process.env.ATP_ACADEMY_FINANCE || "financeiro.prime@demo.atp.local";
const STUDENTS = [
  { email: "jogador031@demo.atp.local", name: "Helena Uchida", phone: "+55 67 99031-0000" },
  { email: "jogador032@demo.atp.local", name: "Igor Barbosa", phone: "+55 67 99032-0000" },
  { email: "jogador033@demo.atp.local", name: "Juliana Ishikawa", phone: "+55 67 99033-0000" },
  { email: "jogador034@demo.atp.local", name: "Leonardo Pereira", phone: "+55 67 99034-0000" },
];
const RESERVATION_PLAYER = { email: "jogador035@demo.atp.local", name: "Manuela Xavier", phone: "+55 67 99035-0000" };
const WAITLIST_PLAYER = { email: "jogador036@demo.atp.local", name: "Otavio Jardim", phone: "+55 67 99036-0000" };

const CHROME_PATHS = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];

const desktop = { name: "desktop-1366", width: 1366, height: 920, deviceScaleFactor: 1, mobile: false };
const desktopWide = { name: "desktop-wide", width: 1680, height: 980, deviceScaleFactor: 1, mobile: false };
const mobile390 = { name: "mobile-390", width: 390, height: 844, deviceScaleFactor: 2, mobile: true };
const mobile430 = { name: "mobile-430", width: 430, height: 932, deviceScaleFactor: 2, mobile: true };

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function chromePath() {
  const found = CHROME_PATHS.find((candidate) => existsSync(candidate));
  if (!found) throw new Error("Chrome nao encontrado.");
  return found;
}

function dateKey(offsetDays = 0) {
  const date = new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function localIso(offsetDays, time) {
  return `${dateKey(offsetDays)}T${time}:00-04:00`;
}

function todayWeekday() {
  return new Date().getDay();
}

function addDaysWeekday(offsetDays) {
  return new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000).getDay();
}

function client() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
}

async function signIn(email, password) {
  const supabase = client();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`Login ${email}: ${error.message}`);
  if (!data.user) throw new Error(`Login ${email}: usuario vazio`);
  return { supabase, user: data.user };
}

async function rpc(supabase, name, args) {
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw new Error(`${name}: ${error.message}`);
  return data;
}

async function insertOne(supabase, table, payload, select = "*") {
  const { data, error } = await supabase.from(table).insert(payload).select(select).single();
  if (error) throw new Error(`${table}: ${error.message}`);
  return data;
}

async function updateRows(supabase, table, patch, filters) {
  let query = supabase.from(table).update(patch);
  for (const [key, value] of Object.entries(filters)) query = query.eq(key, value);
  const { error } = await query;
  if (error) throw new Error(`${table} update: ${error.message}`);
}

async function acceptPendingInvite(email, password, placeId, role) {
  const { supabase, user } = await signIn(email, password);
  const invites = await rpc(supabase, "app_list_my_place_staff_invites", {});
  const invite = (invites || []).find((item) => item.place_id === placeId && item.role === role);
  if (!invite) throw new Error(`Convite ${role} nao encontrado para ${email}`);
  await rpc(supabase, "app_accept_place_staff_invite", { p_invite_id: invite.invite_id });
  return { email, userId: user.id, role, inviteId: invite.invite_id };
}

async function tryAcceptPendingInvite(email, password, placeId, role, diagnostics) {
  try {
    return await acceptPendingInvite(email, password, placeId, role);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    diagnostics.flowIssues.push({
      severity: "blocker",
      area: "staff-invite",
      note: `Falha ao aceitar convite ${role} para ${email}`,
      message,
    });
    return { email, userId: null, role, inviteId: null, failed: true, message };
  }
}

async function createAcademyDataset(diagnostics) {
  const suffix = new Date().toISOString().replace(/\D/g, "").slice(4, 14);
  const { supabase: ownerClient } = await signIn(OWNER_EMAIL, OWNER_PASSWORD);
  const { data: fallbackPlaces, error: fallbackPlacesError } = await ownerClient
    .from("places")
    .select("id,name,city,state")
    .in("name", ["ADT Dourados", "Clube Racket Prime"])
    .order("name", { ascending: true });
  if (fallbackPlacesError) throw new Error(fallbackPlacesError.message);

  const placeRows = await rpc(ownerClient, "app_create_place", {
    p_name: `QA Academia Fluxo ${suffix}`,
    p_city: "Dourados",
    p_state: "MS",
    p_description: "Academia criada por auditoria E2E para validar fluxo completo de gestao, aulas, alunos e reservas.",
    p_logo_url: null,
    p_organization_id: null,
    p_product_plan: "academy",
  });
  const place = Array.isArray(placeRows) ? placeRows[0] : placeRows;
  if (!place?.id) throw new Error("Academia nao criada.");

  const courts = [];
  for (const [index, surface] of ["hard", "saibro", "sintetica"].entries()) {
    const court = await insertOne(ownerClient, "place_courts", {
      place_id: place.id,
      name: `QA Quadra ${index + 1}`,
      surface,
      booking_fee_cents: 7000 + index * 1000,
      member_booking_fee_cents: 5200 + index * 500,
      is_active: true,
    }, "id,place_id,name,surface,booking_fee_cents,member_booking_fee_cents,is_active");
    courts.push(court);
  }

  const bookingRule = await insertOne(ownerClient, "place_booking_rules", {
    place_id: place.id,
    name: "QA Horario operacional",
    profile_scope: "all",
    weekdays: [0, 1, 2, 3, 4, 5, 6],
    starts_at: "06:00",
    ends_at: "23:00",
    price_cents: 7000,
    member_price_cents: 5200,
    min_minutes: 60,
    max_minutes: 120,
    advance_days: 14,
    requires_approval: true,
    is_active: true,
  }, "id,place_id,name,requires_approval");

  const coaches = [];
  for (const [index, email] of COACH_EMAILS.entries()) {
    const name = index === 0 ? "Renato Siqueira QA" : "Lais Monteiro QA";
    const coach = await insertOne(ownerClient, "place_coaches", {
      place_id: place.id,
      name,
      email,
      phone: `+55 67 9905${index}-0000`,
      commission_percent: index === 0 ? 35 : 40,
      specialties: index === 0 ? ["iniciante", "intermediario"] : ["kids", "feminino"],
      level_scopes: index === 0 ? ["iniciante", "intermediario"] : ["iniciante"],
      public_bio: "Professor criado para auditoria E2E de academia.",
      internal_notes: "Validar vinculo, aulas, alunos e chamada.",
      public_profile_enabled: true,
      is_active: true,
    }, "id,place_id,user_id,name,email,phone,commission_percent,is_active");
    await rpc(ownerClient, "app_link_place_coach_by_email", { p_coach_id: coach.id, p_email: email });
    coaches.push(coach);
  }

  const acceptedStaff = [];
  for (const email of COACH_EMAILS) {
    acceptedStaff.push(await tryAcceptPendingInvite(email, STAFF_PASSWORD, place.id, "coach", diagnostics));
  }

  for (const [email, role] of [[FRONTDESK_EMAIL, "frontdesk"], [FINANCE_EMAIL, "finance"]]) {
    await rpc(ownerClient, "app_add_place_staff", { p_place_id: place.id, p_email: email, p_role: role });
    acceptedStaff.push(await tryAcceptPendingInvite(email, STAFF_PASSWORD, place.id, role, diagnostics));
  }

  const updatedCoaches = [];
  const { data: coachRows, error: coachErr } = await ownerClient
    .from("place_coaches")
    .select("id,place_id,user_id,name,email,phone,commission_percent,is_active")
    .eq("place_id", place.id)
    .order("name", { ascending: true });
  if (coachErr) throw new Error(coachErr.message);
  updatedCoaches.push(...(coachRows || []));

  const classPayloads = [
    {
      title: "QA Adulto Intermediario",
      coach: updatedCoaches.find((item) => String(item.email).includes("renato")) || updatedCoaches[0],
      court: courts[0],
      weekday: todayWeekday(),
      starts_at: "18:00",
      ends_at: "19:00",
      level: "Intermediario",
      age_group: "adult",
      capacity: 4,
      monthly_fee_cents: 42000,
    },
    {
      title: "QA Kids Iniciante",
      coach: updatedCoaches.find((item) => String(item.email).includes("lais")) || updatedCoaches[1] || updatedCoaches[0],
      court: courts[1],
      weekday: addDaysWeekday(1),
      starts_at: "16:00",
      ends_at: "17:00",
      level: "Iniciante",
      age_group: "kids",
      capacity: 8,
      monthly_fee_cents: 38000,
    },
  ];

  const classes = [];
  for (const payload of classPayloads) {
    const academyClass = await insertOne(ownerClient, "place_academy_classes", {
      place_id: place.id,
      coach_id: payload.coach?.id || null,
      court_id: payload.court.id,
      title: payload.title,
      coach_name: payload.coach?.name || "Professor",
      weekday: payload.weekday,
      starts_at: payload.starts_at,
      ends_at: payload.ends_at,
      level: payload.level,
      gender_scope: "mixed",
      age_group: payload.age_group,
      min_age: payload.age_group === "kids" ? 8 : 18,
      max_age: payload.age_group === "kids" ? 13 : null,
      allow_makeup: true,
      capacity: payload.capacity,
      monthly_fee_cents: payload.monthly_fee_cents,
      is_active: true,
    }, "id,place_id,coach_id,court_id,title,coach_name,weekday,starts_at,ends_at,level,age_group,capacity,monthly_fee_cents,is_active");
    classes.push(academyClass);
  }

  const contracts = [];
  const activeContractRows = await rpc(ownerClient, "app_create_academy_student_contract", {
    p_place_id: place.id,
    p_student_name: STUDENTS[0].name,
    p_email: STUDENTS[0].email,
    p_phone: STUDENTS[0].phone,
    p_weekly_lessons_count: 2,
    p_monthly_fee_cents: 64000,
    p_starts_on: dateKey(0),
    p_notes: "Contrato ativo E2E com duas aulas semanais.",
    p_class_ids: classes.map((academyClass) => academyClass.id),
    p_status: "active",
  });
  contracts.push(Array.isArray(activeContractRows) ? activeContractRows[0] : activeContractRows);

  for (const [index, student] of STUDENTS.slice(1).entries()) {
    const rows = await rpc(ownerClient, "app_create_academy_student_contract", {
      p_place_id: place.id,
      p_student_name: student.name,
      p_email: student.email,
      p_phone: student.phone,
      p_weekly_lessons_count: 1,
      p_monthly_fee_cents: index === 0 ? 42000 : 38000,
      p_starts_on: dateKey(0),
      p_notes: index === 2 ? "Contrato pendente E2E para validar fila." : "Contrato ativo E2E.",
      p_class_ids: [classes[index === 0 ? 0 : 1].id],
      p_status: index === 2 ? "pending" : "active",
    });
    contracts.push(Array.isArray(rows) ? rows[0] : rows);
  }

  const { data: enrollments, error: enrollmentErr } = await ownerClient
    .from("place_academy_enrollments")
    .select("id,place_id,class_id,contract_id,user_id,player_name,status")
    .eq("place_id", place.id)
    .order("created_at", { ascending: true });
  if (enrollmentErr) throw new Error(enrollmentErr.message);

  const paidEnrollment = (enrollments || []).find((item) => item.status === "active" && item.player_name === STUDENTS[0].name);
  if (paidEnrollment) {
    await rpc(ownerClient, "app_mark_stub_payment_paid_for_participant", {
      p_target_type: "academy_enrollment",
      p_target_id: paidEnrollment.id,
      p_amount_cents: 42000,
      p_description: "Mensalidade QA paga manualmente",
      p_metadata: { place_id: place.id, source: "academy-e2e" },
      p_billing_period: dateKey(0).slice(0, 7),
    });
  }

  const { supabase: playerClient } = await signIn(RESERVATION_PLAYER.email, PLAYER_PASSWORD);
  const bookingRows = await rpc(playerClient, "app_create_court_booking", {
    p_place_id: place.id,
    p_court_id: courts[2].id,
    p_starts_at: localIso(1, "20:00"),
    p_ends_at: localIso(1, "21:00"),
    p_player_name: RESERVATION_PLAYER.name,
    p_phone: RESERVATION_PLAYER.phone,
    p_notes: "Reserva E2E feita por jogador seed.",
  });
  const booking = Array.isArray(bookingRows) ? bookingRows[0] : bookingRows;

  const { supabase: waitlistClient } = await signIn(WAITLIST_PLAYER.email, PLAYER_PASSWORD);
  const waitlistRows = await rpc(waitlistClient, "app_join_court_booking_waitlist", {
    p_place_id: place.id,
    p_court_id: courts[2].id,
    p_starts_at: localIso(1, "20:00"),
    p_ends_at: localIso(1, "21:00"),
    p_player_name: WAITLIST_PLAYER.name,
    p_phone: WAITLIST_PLAYER.phone,
    p_notes: "Lista de espera E2E no mesmo horario da reserva.",
  });
  const waitlist = Array.isArray(waitlistRows) ? waitlistRows[0] : waitlistRows;

  diagnostics.dataset = {
    place,
    courts,
    bookingRule,
    coaches: updatedCoaches,
    acceptedStaff,
    classes,
    contracts,
    enrollments,
    booking,
    fallbackPlaces: {
      coachPlaceId: (fallbackPlaces || []).find((item) => item.name === "ADT Dourados")?.id || place.id,
      frontdeskPlaceId: (fallbackPlaces || []).find((item) => item.name === "ADT Dourados")?.id || place.id,
      financePlaceId: (fallbackPlaces || []).find((item) => item.name === "Clube Racket Prime")?.id || place.id,
      rows: fallbackPlaces || [],
    },
    waitlist,
  };

  return diagnostics.dataset;
}

async function waitForDebug(port, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      if (response.ok) {
        const targets = await response.json();
        const pageTarget = Array.isArray(targets)
          ? targets.find((target) => target.type === "page" && target.webSocketDebuggerUrl)
          : null;
        if (pageTarget) return pageTarget;
      }
    } catch (error) {
      lastError = error;
    }
    await sleep(250);
  }
  throw lastError || new Error("Chrome DevTools nao respondeu.");
}

function makeCdp(wsUrl, diagnostics) {
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const pending = new Map();
  const listeners = new Map();
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (!message.id && message.method) {
      const callbacks = listeners.get(message.method) || [];
      callbacks.forEach((callback) => callback(message.params || {}));
      return;
    }
    if (!message.id) return;
    const callback = pending.get(message.id);
    if (!callback) return;
    pending.delete(message.id);
    if (message.error) callback.reject(new Error(JSON.stringify(message.error)));
    else callback.resolve(message.result || {});
  });
  const ready = new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });
  return {
    ready,
    send(method, params = {}) {
      const callId = ++id;
      ws.send(JSON.stringify({ id: callId, method, params }));
      return new Promise((resolve, reject) => pending.set(callId, { resolve, reject }));
    },
    on(method, callback) {
      const callbacks = listeners.get(method) || [];
      callbacks.push(callback);
      listeners.set(method, callbacks);
    },
    close() {
      diagnostics.events.push({ type: "cdp-close", at: new Date().toISOString() });
      ws.close();
    },
  };
}

async function evalJs(cdp, expression, awaitPromise = true) {
  const result = await cdp.send("Runtime.evaluate", {
    expression,
    awaitPromise,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || result.exceptionDetails.exception?.description || "Runtime.evaluate failed");
  }
  return result.result?.value;
}

async function waitFor(cdp, expression, timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const value = await evalJs(cdp, `Boolean(${expression})`).catch(() => false);
    if (value) return true;
    await sleep(300);
  }
  return false;
}

async function waitForPageReady(cdp) {
  await waitFor(cdp, "document.readyState === 'complete'", 15000);
  await waitFor(cdp, `!/(Carregando|Entrando|Processando|Salvando|Loading)/i.test(document.body.innerText || "")`, 30000);
  await sleep(1200);
}

async function setViewport(cdp, viewport) {
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: viewport.deviceScaleFactor,
    mobile: viewport.mobile,
  });
  await sleep(500);
}

async function navigate(cdp, hash) {
  await cdp.send("Page.navigate", { url: `${APP_URL}${hash}` });
  await waitForPageReady(cdp);
  await installBrowserHelpers(cdp);
}

async function capture(cdp, filePath) {
  const metrics = await cdp.send("Page.getLayoutMetrics");
  const contentSize = metrics.cssContentSize || metrics.contentSize;
  const width = Math.ceil(contentSize.width);
  const maxHeight = 6200;
  const height = Math.min(Math.ceil(contentSize.height), maxHeight);
  const screenshot = await cdp.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    fromSurface: true,
    clip: { x: 0, y: 0, width, height, scale: 1 },
  });
  await writeFile(filePath, Buffer.from(screenshot.data, "base64"));
}

async function snapshot(cdp, name, diagnostics, viewport = desktop) {
  await setViewport(cdp, viewport);
  await waitForPageReady(cdp);
  await installBrowserHelpers(cdp);
  const file = path.join(OUT_DIR, `${String(diagnostics.screenshots.length + 1).padStart(2, "0")}-${viewport.name}-${name}.png`);
  await capture(cdp, file);
  const summary = await evalJs(cdp, `
    (() => {
      const text = document.body.innerText || "";
      const buttons = [...document.querySelectorAll("button,a,summary")]
        .filter((el) => {
          const rect = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
        })
        .slice(0, 80)
        .map((el) => String(el.innerText || el.textContent || "").replace(/\\s+/g, " ").trim())
        .filter(Boolean);
      return { title: document.title, hash: location.hash, textStart: text.slice(0, 1500), buttons };
    })()
  `);
  diagnostics.screenshots.push({
    name,
    viewport: viewport.name,
    file: path.relative(ROOT, file).replaceAll("\\", "/"),
    url: await evalJs(cdp, "location.href"),
    summary,
  });
}

async function installBrowserHelpers(cdp) {
  await evalJs(cdp, `
    (() => {
      window.__atpFlow = {
        textOf(el) {
          return String(el?.innerText || el?.textContent || "").replace(/\\s+/g, " ").trim();
        },
        visible(el) {
          if (!el) return false;
          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);
          return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
        },
        clickText(pattern, selector = "button,a,summary,label") {
          const re = new RegExp(pattern, "i");
          const candidates = [...document.querySelectorAll(selector)]
            .filter((el) => this.visible(el) && !el.disabled && re.test(this.textOf(el)));
          const target = candidates[candidates.length - 1];
          if (!target) {
            return {
              ok: false,
              reason: "not-found",
              pattern,
              texts: [...document.querySelectorAll(selector)].filter((el) => this.visible(el)).slice(-80).map((el) => this.textOf(el)),
            };
          }
          target.scrollIntoView({ block: "center", inline: "center" });
          target.click();
          return { ok: true, text: this.textOf(target) };
        },
        setNativeValue(el, value) {
          if (!el) return false;
          const proto = Object.getPrototypeOf(el);
          const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
          if (descriptor?.set) descriptor.set.call(el, value);
          else el.value = value;
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("change", { bubbles: true }));
          return true;
        },
        labelControl(labelPattern) {
          const re = new RegExp(labelPattern, "i");
          const scopes = [...document.querySelectorAll(".modal, [role='dialog'], .competition-create-modal")]
            .filter((el) => this.visible(el))
            .reverse();
          scopes.push(document);
          for (const scope of scopes) {
            const labels = [...scope.querySelectorAll("label")].filter((el) => this.visible(el) && re.test(this.textOf(el)));
            for (const label of labels) {
              if (label.htmlFor) {
                const byId = document.getElementById(label.htmlFor);
                if (byId) return byId;
              }
              const control = label.querySelector("input,textarea,select");
              if (control) return control;
              const parentControl = label.parentElement?.querySelector("input,textarea,select");
              if (parentControl) return parentControl;
              let sibling = label.nextElementSibling;
              while (sibling) {
                if (sibling.matches?.("input,textarea,select")) return sibling;
                const nested = sibling.querySelector?.("input,textarea,select");
                if (nested) return nested;
                sibling = sibling.nextElementSibling;
              }
            }
          }
          return null;
        },
        setByLabel(labelPattern, value) {
          const el = this.labelControl(labelPattern);
          if (!el) return { ok: false, reason: "not-found", labelPattern };
          el.scrollIntoView({ block: "center", inline: "center" });
          return { ok: this.setNativeValue(el, value), tag: el.tagName, labelPattern, value };
        },
        routeText() {
          return document.body.innerText || "";
        },
      };
      window.confirm = () => true;
      return true;
    })()
  `);
}

async function must(cdp, expression, note, diagnostics) {
  const result = await evalJs(cdp, expression);
  if (!result?.ok && result !== true) {
    diagnostics.flowIssues.push({ at: new Date().toISOString(), note, result });
    throw new Error(`${note}: ${JSON.stringify(result)}`);
  }
  await sleep(900);
  return result;
}

async function tryClick(cdp, pattern, note, diagnostics) {
  const result = await evalJs(cdp, `window.__atpFlow.clickText(${JSON.stringify(pattern)})`);
  diagnostics.interactions.push({ at: new Date().toISOString(), note, pattern, result });
  await sleep(900);
  return Boolean(result?.ok);
}

async function login(cdp, email, password, diagnostics) {
  await navigate(cdp, "#/auth");
  await installBrowserHelpers(cdp);
  await must(cdp, `window.__atpFlow.setByLabel("e-mail|email", ${JSON.stringify(email)})`, `preencher email ${email}`, diagnostics);
  await must(cdp, `window.__atpFlow.setByLabel("senha", ${JSON.stringify(password)})`, `preencher senha ${email}`, diagnostics);
  await must(cdp, `window.__atpFlow.clickText("^Entrar$")`, `clicar entrar ${email}`, diagnostics);
  const ok = await waitFor(cdp, "!location.hash.includes('/auth')", 30000);
  if (!ok) throw new Error(`Login nao saiu da auth: ${email}`);
  await waitForPageReady(cdp);
  await installBrowserHelpers(cdp);
}

async function clearBrowserSession(cdp) {
  await evalJs(cdp, `(() => { localStorage.clear(); sessionStorage.clear(); return true; })()`);
  await cdp.send("Page.navigate", { url: `${APP_URL}?session=${Date.now()}#/auth` });
  await waitForPageReady(cdp);
}

async function ownerUxPass(cdp, diagnostics, dataset) {
  await login(cdp, OWNER_EMAIL, OWNER_PASSWORD, diagnostics);
  const placeId = dataset.place.id;
  await navigate(cdp, "#/gestao");
  await snapshot(cdp, "01-owner-trabalho-hoje", diagnostics, desktop);
  await snapshot(cdp, "02-owner-trabalho-hoje-mobile", diagnostics, mobile390);

  await navigate(cdp, `#/gestao/${placeId}/painel`);
  await snapshot(cdp, "03-owner-painel-local", diagnostics, desktop);
  await snapshot(cdp, "04-owner-painel-local-mobile", diagnostics, mobile430);

  await navigate(cdp, `#/gestao/${placeId}/ajustes?visao=checklist`);
  await snapshot(cdp, "05-owner-ajustes-checklist", diagnostics, desktop);

  await navigate(cdp, `#/gestao/${placeId}/agenda?visao=quadras`);
  await snapshot(cdp, "06-owner-agenda-quadras", diagnostics, desktop);

  await navigate(cdp, `#/gestao/${placeId}/agenda?visao=reservas`);
  await snapshot(cdp, "07-owner-agenda-reservas-pendente", diagnostics, desktop);
  const confirmed = await tryClick(cdp, "^Confirmar$", "confirmar reserva pendente pela agenda", diagnostics);
  if (!confirmed) diagnostics.flowIssues.push({ note: "Reserva pendente nao teve CTA Confirmar visivel na lista de reservas." });
  await waitForPageReady(cdp);
  await snapshot(cdp, "08-owner-agenda-reservas-apos-confirmar", diagnostics, desktop);

  await navigate(cdp, `#/gestao/${placeId}/agenda?visao=espera`);
  await snapshot(cdp, "09-owner-agenda-espera", diagnostics, desktop);

  await navigate(cdp, `#/gestao/${placeId}/academia?visao=professores`);
  await snapshot(cdp, "10-owner-academia-professores", diagnostics, desktop);

  await navigate(cdp, `#/gestao/${placeId}/academia?visao=grade`);
  await snapshot(cdp, "11-owner-academia-grade", diagnostics, desktop);
  await snapshot(cdp, "12-owner-academia-grade-mobile", diagnostics, mobile390);

  await navigate(cdp, `#/gestao/${placeId}/academia?visao=alunos`);
  await snapshot(cdp, "13-owner-academia-alunos", diagnostics, desktop);
  const approved = await tryClick(cdp, "^(Aprovar|Ativar)$", "ativar matricula pendente pela lista de alunos/grade", diagnostics);
  if (!approved) diagnostics.flowIssues.push({ note: "Matricula pendente nao teve CTA Ativar/Aprovar facil de localizar na tela de alunos." });
  await waitForPageReady(cdp);
  await snapshot(cdp, "14-owner-academia-alunos-apos-aprovar", diagnostics, desktop);

  await navigate(cdp, `#/gestao/${placeId}/academia?visao=hoje`);
  await snapshot(cdp, "15-owner-academia-hoje", diagnostics, desktop);
  const openedAttendance = await tryClick(cdp, "(Fazer chamada|Abrir chamada)", "abrir chamada da aula de hoje", diagnostics);
  if (!openedAttendance) diagnostics.flowIssues.push({ note: "CTA Fazer/Abrir chamada nao apareceu na aula de hoje." });
  await waitForPageReady(cdp);
  await snapshot(cdp, "16-owner-academia-hoje-chamada-aberta", diagnostics, desktop);
  const present = await tryClick(cdp, "^Presente$", "registrar presenca no Hoje da academia", diagnostics);
  if (!present) diagnostics.flowIssues.push({ note: "CTA Presente nao apareceu depois de abrir a chamada." });
  await waitForPageReady(cdp);
  await snapshot(cdp, "17-owner-academia-hoje-apos-presenca", diagnostics, desktop);

  await navigate(cdp, `#/gestao/${placeId}/academia?visao=pendencias`);
  await snapshot(cdp, "18-owner-academia-pendencias", diagnostics, desktop);

  await navigate(cdp, `#/gestao/${placeId}/financeiro?visao=recebiveis`);
  await snapshot(cdp, "19-owner-financeiro-recebiveis", diagnostics, desktop);

  await navigate(cdp, `#/gestao/${placeId}/clientes?visao=rotina`);
  await snapshot(cdp, "20-owner-clientes-rotina", diagnostics, desktop);

  await navigate(cdp, `#/locais/${placeId}`);
  await snapshot(cdp, "21-public-local-overview", diagnostics, desktop);
  await snapshot(cdp, "22-public-local-overview-mobile", diagnostics, mobile390);
}

async function staffUxPass(cdp, diagnostics, dataset) {
  const coachPlaceId = dataset.acceptedStaff?.some((item) => item.role === "coach" && !item.failed)
    ? dataset.place.id
    : dataset.fallbackPlaces?.coachPlaceId || dataset.place.id;
  const frontdeskPlaceId = dataset.acceptedStaff?.some((item) => item.role === "frontdesk" && !item.failed)
    ? dataset.place.id
    : dataset.fallbackPlaces?.frontdeskPlaceId || dataset.place.id;
  const financePlaceId = dataset.acceptedStaff?.some((item) => item.role === "finance" && !item.failed)
    ? dataset.place.id
    : dataset.fallbackPlaces?.financePlaceId || dataset.place.id;

  await clearBrowserSession(cdp);
  await login(cdp, COACH_EMAILS[0], STAFF_PASSWORD, diagnostics);
  await navigate(cdp, "#/gestao");
  await snapshot(cdp, "22-coach-trabalho-hoje", diagnostics, desktop);
  await snapshot(cdp, "23-coach-trabalho-hoje-mobile", diagnostics, mobile390);
  await navigate(cdp, `#/gestao/${coachPlaceId}/academia?visao=hoje`);
  await snapshot(cdp, "24-coach-academia-hoje", diagnostics, desktop);
  await navigate(cdp, `#/gestao/${coachPlaceId}/academia?visao=alunos`);
  await snapshot(cdp, "25-coach-academia-alunos", diagnostics, desktop);

  await clearBrowserSession(cdp);
  await login(cdp, FRONTDESK_EMAIL, STAFF_PASSWORD, diagnostics);
  await navigate(cdp, "#/gestao");
  await snapshot(cdp, "26-frontdesk-trabalho-hoje", diagnostics, desktop);
  await navigate(cdp, `#/gestao/${frontdeskPlaceId}/agenda?visao=nova-reserva`);
  await snapshot(cdp, "27-frontdesk-nova-reserva", diagnostics, desktop);
  await snapshot(cdp, "28-frontdesk-nova-reserva-mobile", diagnostics, mobile390);
  await navigate(cdp, `#/gestao/${frontdeskPlaceId}/agenda?visao=reservas`);
  await snapshot(cdp, "29-frontdesk-reservas", diagnostics, desktop);

  await clearBrowserSession(cdp);
  await login(cdp, FINANCE_EMAIL, STAFF_PASSWORD, diagnostics);
  await navigate(cdp, "#/gestao");
  await snapshot(cdp, "30-finance-trabalho-hoje", diagnostics, desktop);
  await navigate(cdp, `#/gestao/${financePlaceId}/financeiro?visao=recebiveis`);
  await snapshot(cdp, "31-finance-recebiveis", diagnostics, desktop);
}

async function playerUxPass(cdp, diagnostics, dataset) {
  const placeId = dataset.place.id;

  await clearBrowserSession(cdp);
  await login(cdp, STUDENTS[0].email, PLAYER_PASSWORD, diagnostics);
  await navigate(cdp, "#/inicio");
  await snapshot(cdp, "32-student-home", diagnostics, mobile390);
  await navigate(cdp, "#/agenda");
  await snapshot(cdp, "33-student-agenda", diagnostics, mobile390);
  await navigate(cdp, "#/minhas-aulas");
  await snapshot(cdp, "34-student-minhas-aulas", diagnostics, mobile390);
  await navigate(cdp, "#/meus-pagamentos");
  await snapshot(cdp, "35-student-meus-pagamentos", diagnostics, mobile390);
  await navigate(cdp, `#/locais/${placeId}/aulas`);
  await snapshot(cdp, "36-student-local-aulas", diagnostics, mobile390);

  await clearBrowserSession(cdp);
  await login(cdp, RESERVATION_PLAYER.email, PLAYER_PASSWORD, diagnostics);
  await navigate(cdp, "#/minhas-reservas");
  await snapshot(cdp, "37-player-minhas-reservas", diagnostics, mobile390);
  await navigate(cdp, `#/locais/${placeId}/reservar`);
  await snapshot(cdp, "38-player-local-reservar", diagnostics, mobile390);
  await snapshot(cdp, "39-player-local-reservar-desktop-wide", diagnostics, desktopWide);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const diagnostics = {
    appUrl: APP_URL,
    at: new Date().toISOString(),
    completed: false,
    console: [],
    dataset: null,
    events: [],
    failedRequests: [],
    flowIssues: [],
    interactions: [],
    pageErrors: [],
    screenshots: [],
  };

  const dataset = await createAcademyDataset(diagnostics);
  const port = 9429 + Math.floor(Math.random() * 1000);
  const userDataDir = await mkdtemp(path.join(os.tmpdir(), "atp-academy-flow-"));
  const chrome = spawn(chromePath(), [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-popup-blocking",
    "--window-size=1366,920",
    `${APP_URL}#/auth`,
  ], { stdio: "ignore" });

  let cdp;
  try {
    const target = await waitForDebug(port);
    cdp = makeCdp(target.webSocketDebuggerUrl, diagnostics);
    await cdp.ready;
    cdp.on("Runtime.consoleAPICalled", (params) => {
      diagnostics.console.push({
        type: params.type,
        text: (params.args || []).map((arg) => arg.value ?? arg.description ?? "").join(" "),
      });
    });
    cdp.on("Runtime.exceptionThrown", (params) => {
      diagnostics.pageErrors.push(params.exceptionDetails?.exception?.description || params.exceptionDetails?.text || "exception");
    });
    cdp.on("Network.loadingFailed", (params) => {
      diagnostics.failedRequests.push({ requestId: params.requestId, errorText: params.errorText, blockedReason: params.blockedReason || "" });
    });
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Network.enable");

    await setViewport(cdp, desktop);
    await ownerUxPass(cdp, diagnostics, dataset);
    await staffUxPass(cdp, diagnostics, dataset);
    await playerUxPass(cdp, diagnostics, dataset);
    diagnostics.completed = true;
  } catch (error) {
    diagnostics.completed = false;
    diagnostics.error = error instanceof Error ? error.stack || error.message : String(error);
    try {
      if (cdp) await snapshot(cdp, "error-state", diagnostics, desktop);
    } catch {
      // ignore screenshot failure in error state
    }
    throw error;
  } finally {
    await writeFile(path.join(OUT_DIR, "diagnostics.json"), JSON.stringify(diagnostics, null, 2));
    try {
      cdp?.close();
    } catch {
      // ignore close errors
    }
    chrome.kill();
    await sleep(1000);
    try {
      await rm(userDataDir, { recursive: true, force: true });
    } catch (error) {
      diagnostics.cleanupError = error instanceof Error ? error.message : String(error);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
