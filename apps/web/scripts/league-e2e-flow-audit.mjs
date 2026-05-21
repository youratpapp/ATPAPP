import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const ROOT = process.cwd();
const APP_URL = process.env.APP_URL || "http://127.0.0.1:5173/";
const OUT_DIR = process.env.ATP_LEAGUE_FLOW_OUT_DIR
  ? path.resolve(ROOT, process.env.ATP_LEAGUE_FLOW_OUT_DIR)
  : path.join(ROOT, "docs", "screenshots", "league-e2e-flow-v4-2026-05-21");

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://xdopstommqojjofapzjl.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_bofGMq6jhqcVetHTGP6GjQ_vJQWsTjh";

const OWNER_EMAIL = process.env.ATP_OWNER_EMAIL || "escalao@gmail.com";
const OWNER_PASSWORD = process.env.ATP_OWNER_PASSWORD || "Escalao@2026!";
const PLAYER_PASSWORD = process.env.ATP_PLAYER_PASSWORD || "Jogador@2026!";
const PLAYER_EMAILS = (process.env.ATP_LEAGUE_PLAYERS || "jogador011@demo.atp.local,jogador012@demo.atp.local,jogador013@demo.atp.local,jogador014@demo.atp.local")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);
const EXISTING_LEAGUE_ID = (process.env.ATP_EXISTING_LEAGUE_ID || "").trim();

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
  const file = path.join(OUT_DIR, `${String(diagnostics.screenshots.length + 1).padStart(2, "0")}-${viewport.name}-${name}.png`);
  await capture(cdp, file);
  diagnostics.screenshots.push({
    name,
    viewport: viewport.name,
    file: path.relative(ROOT, file).replaceAll("\\", "/"),
    url: await evalJs(cdp, "location.href"),
  });
}

async function installBrowserHelpers(cdp) {
  await evalJs(
    cdp,
    `
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
          const candidates = [...document.querySelectorAll(selector)].filter((el) => this.visible(el) && !el.disabled && re.test(this.textOf(el)));
          const target = candidates[candidates.length - 1];
          if (!target) {
            return {
              ok: false,
              reason: "not-found",
              pattern,
              texts: [...document.querySelectorAll(selector)].filter((el) => this.visible(el)).slice(-40).map((el) => this.textOf(el)),
            };
          }
          target.scrollIntoView({ block: "center", inline: "center" });
          target.click();
          return { ok: true, text: this.textOf(target) };
        },
        labelControl(labelPattern) {
          const re = new RegExp(labelPattern, "i");
          const modalScopes = [...document.querySelectorAll(".modal, [role='dialog'], .competition-create-modal")]
            .filter((el) => this.visible(el))
            .reverse();
          const scopes = [...modalScopes, document];
          const labels = scopes.flatMap((scope) => [...scope.querySelectorAll("label")].filter((el) => this.visible(el) && re.test(this.textOf(el))));
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
          return null;
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
        setByLabel(labelPattern, value) {
          const el = this.labelControl(labelPattern);
          if (!el) return { ok: false, reason: "not-found", labelPattern };
          el.scrollIntoView({ block: "center", inline: "center" });
          return { ok: this.setNativeValue(el, value), tag: el.tagName, labelPattern, value };
        },
        setSelectByLabel(labelPattern, value) {
          const el = this.labelControl(labelPattern);
          if (!el) return { ok: false, reason: "not-found", labelPattern };
          el.scrollIntoView({ block: "center", inline: "center" });
          this.setNativeValue(el, value);
          return { ok: el.value === value, labelPattern, value, current: el.value, options: [...el.options].map((option) => option.value) };
        },
        fillVisibleLeagueScore(side1 = "6", side2 = "2") {
          const dialog = document.querySelector(".league-match-room-dialog") || document;
          const inputs = [...dialog.querySelectorAll("input.match-score-input:not([disabled])")].filter((el) => this.visible(el));
          if (inputs.length < 2) return { ok: false, reason: "score-inputs-not-found", count: inputs.length };
          this.setNativeValue(inputs[0], side1);
          this.setNativeValue(inputs[1], side2);
          return { ok: true, count: inputs.length };
        },
        routeText() {
          return document.body.innerText || "";
        },
      };
      window.confirm = () => true;
      return true;
    })()
    `
  );
}

async function must(cdp, expression, note) {
  const result = await evalJs(cdp, expression);
  if (!result?.ok && result !== true) {
    throw new Error(`${note}: ${JSON.stringify(result)}`);
  }
  await sleep(700);
  return result;
}

async function login(cdp, email = OWNER_EMAIL, password = OWNER_PASSWORD) {
  await navigate(cdp, "#/auth");
  await installBrowserHelpers(cdp);
  await must(cdp, `window.__atpFlow.setByLabel("e-mail|email", ${JSON.stringify(email)})`, "preencher email");
  await must(cdp, `window.__atpFlow.setByLabel("senha", ${JSON.stringify(password)})`, "preencher senha");
  await must(cdp, `window.__atpFlow.clickText("^Entrar$")`, "clicar entrar");
  const ok = await waitFor(cdp, "!location.hash.includes('/auth')", 30000);
  if (!ok) throw new Error("Login nao saiu da tela de auth.");
  await waitForPageReady(cdp);
  await installBrowserHelpers(cdp);
}

async function clearBrowserSession(cdp) {
  await evalJs(cdp, `(() => { localStorage.clear(); sessionStorage.clear(); return true; })()`);
  await cdp.send("Page.navigate", { url: `${APP_URL}?session=${Date.now()}#/auth` });
  await waitForPageReady(cdp);
}

function isoDate(offsetDays) {
  const date = new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

async function createLeagueThroughUi(cdp, diagnostics) {
  const name = `QA Liga V4 ${new Date().toISOString().slice(11, 19).replaceAll(":", "")}`;

  await navigate(cdp, "#/eventos/ligas?view=organizing");
  await installBrowserHelpers(cdp);
  await snapshot(cdp, "01-ligas-organizando-antes-criar", diagnostics, desktop);

  const open = await evalJs(cdp, `window.__atpFlow.clickText("Criar liga|\\\\+ Criar")`);
  if (!open?.ok) throw new Error(`Nao abriu criacao de liga: ${JSON.stringify(open)}`);
  await waitFor(cdp, "Boolean(document.querySelector('.competition-create-modal'))", 10000);
  await installBrowserHelpers(cdp);
  await snapshot(cdp, "02-modal-liga-basico", diagnostics, desktop);

  await must(cdp, `window.__atpFlow.setByLabel("Nome da liga", ${JSON.stringify(name)})`, "nome liga");
  await must(cdp, `window.__atpFlow.setByLabel("Local base", "ADT Dourados")`, "local base");
  await must(cdp, `window.__atpFlow.setByLabel("Inicio da temporada", ${JSON.stringify(isoDate(8))})`, "inicio temporada");
  await must(cdp, `window.__atpFlow.setByLabel("Fim previsto", ${JSON.stringify(isoDate(75))})`, "fim temporada");
  await must(cdp, `window.__atpFlow.setSelectByLabel("Visibilidade", "public")`, "visibilidade publica");
  await must(cdp, `window.__atpFlow.clickText("Continuar")`, "continuar basico");

  await must(cdp, `window.__atpFlow.setSelectByLabel("Aprovacao", "manual")`, "aprovacao manual");
  await must(cdp, `window.__atpFlow.setByLabel("Taxa de inscricao", "0")`, "taxa zero");
  await snapshot(cdp, "03-modal-liga-jogadores", diagnostics, desktop);
  await must(cdp, `window.__atpFlow.clickText("Continuar")`, "continuar jogadores");

  await must(cdp, `window.__atpFlow.setByLabel("Rodadas previstas", "1")`, "rodadas previstas");
  await must(cdp, `window.__atpFlow.setByLabel("Intervalo em dias", "7")`, "intervalo dias");
  await must(cdp, `window.__atpFlow.setByLabel("Prazo para resultado", "7")`, "prazo resultado");
  await snapshot(cdp, "04-modal-liga-formato", diagnostics, desktop);
  await must(cdp, `window.__atpFlow.clickText("Continuar")`, "continuar formato");

  await must(cdp, `window.__atpFlow.setSelectByLabel("Formato da partida", "set_unico")`, "set unico");
  await must(cdp, `window.__atpFlow.clickText("Continuar")`, "continuar pontuacao");

  await snapshot(cdp, "05-modal-liga-agenda", diagnostics, desktop);
  await must(cdp, `window.__atpFlow.clickText("Continuar")`, "continuar agenda");

  await must(cdp, `window.__atpFlow.setSelectByLabel("Status inicial", "active")`, "status ativa");
  await snapshot(cdp, "06-modal-liga-revisar", diagnostics, desktop);
  await must(cdp, `window.__atpFlow.clickText("Criar liga ativa")`, "criar liga ativa");
  const created = await waitFor(cdp, "location.hash.includes('/eventos/ligas/')", 45000);
  if (!created) throw new Error("Liga nao navegou para detalhe apos criar.");
  await waitForPageReady(cdp);
  await installBrowserHelpers(cdp);
  const hash = await evalJs(cdp, "location.hash");
  const leagueId = String(hash).match(/\/eventos\/ligas\/([^/?]+)/)?.[1];
  if (!leagueId) throw new Error(`Nao consegui extrair leagueId de ${hash}`);
  diagnostics.league = { id: leagueId, name, createdAt: new Date().toISOString() };
  await snapshot(cdp, "07-liga-criada-visao-owner", diagnostics, desktop);
  return { id: leagueId, name };
}

async function createOwnerClient() {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  const auth = await client.auth.signInWithPassword({ email: OWNER_EMAIL, password: OWNER_PASSWORD });
  if (auth.error) throw auth.error;
  return client;
}

async function loadLeagueContext(leagueId) {
  const client = await createOwnerClient();
  const league = await client.from("leagues").select("id,name,status,visibility,rounds_total").eq("id", leagueId).maybeSingle();
  if (league.error || !league.data) throw new Error(league.error?.message || "Liga nao encontrada.");
  const season = await client
    .from("league_seasons")
    .select("id,name,season_number,status,current_round_number")
    .eq("league_id", leagueId)
    .order("season_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (season.error || !season.data) throw new Error(season.error?.message || "Temporada da liga nao encontrada.");
  const classes = await client.from("league_classes").select("id,category_name,class_name").eq("season_id", season.data.id).order("created_at", { ascending: true });
  if (classes.error) throw classes.error;
  const context = { client, league: league.data, season: season.data, class: classes.data?.[0] || null };
  if (!context.class?.id) throw new Error("Liga sem classe para inscricao.");
  return context;
}

async function createLeagueJoinRequests(leagueId, diagnostics) {
  const context = await loadLeagueContext(leagueId);
  const registrations = [];
  for (const email of PLAYER_EMAILS) {
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    const auth = await client.auth.signInWithPassword({ email, password: PLAYER_PASSWORD });
    if (auth.error) throw auth.error;
    const user = auth.data.user;
    const profile = await client.from("profiles").select("display_name,phone").eq("user_id", user.id).maybeSingle();
    const playerName = profile.data?.display_name || email.split("@")[0];
    const phone = profile.data?.phone || "+5567999000000";
    const rpc = await client.rpc("app_request_public_league_join", {
      p_league_id: leagueId,
      p_player_name: playerName,
      p_phone: phone,
      p_season_id: context.season.id,
      p_class_id: context.class.id,
    });
    if (rpc.error) throw new Error(`${email}: ${rpc.error.message}`);
    registrations.push({ email, userId: user.id, playerName, status: String(rpc.data || "pending") });
    await client.auth.signOut();
  }
  diagnostics.registrationsCreated = registrations;
  return registrations;
}

async function approveRegistrationsThroughUi(cdp, leagueId, diagnostics) {
  await navigate(cdp, `#/eventos/ligas/${leagueId}?tab=jogadores`);
  await cdp.send("Page.reload", { ignoreCache: true });
  await waitForPageReady(cdp);
  await installBrowserHelpers(cdp);
  await snapshot(cdp, "08-liga-inscricoes-pendentes", diagnostics, desktop);

  for (let i = 0; i < PLAYER_EMAILS.length + 4; i += 1) {
    const stats = await loadLeagueRegistrationStats(leagueId);
    if (stats.pending === 0) break;
    await waitFor(cdp, `![...document.querySelectorAll("button")].some((btn) => /^Aprovar$/i.test((btn.innerText || "").trim()) && btn.disabled)`, 15000);
    const clicked = await evalJs(
      cdp,
      `
      (() => {
        const helper = window.__atpFlow;
        const buttons = [...document.querySelectorAll("button")]
          .filter((btn) => helper.visible(btn) && !btn.disabled && /^Aprovar$/i.test(helper.textOf(btn)));
        const button = buttons[0];
        if (!button) return { ok: false, reason: "no-enabled-approve", total: buttons.length };
        button.scrollIntoView({ block: "center", inline: "center" });
        button.click();
        return { ok: true, text: helper.textOf(button) };
      })()
      `
    );
    if (!clicked?.ok) break;
    await waitFor(cdp, `/Inscricao aprovada|Inscri.cao aprovada/i.test(document.body.innerText || "") || ![...document.querySelectorAll("button")].some((btn) => /^Aprovar$/i.test((btn.innerText || "").trim()) && btn.disabled)`, 20000);
    await waitForPageReady(cdp);
    await sleep(900);
    await installBrowserHelpers(cdp);
  }
  const finalStats = await loadLeagueRegistrationStats(leagueId);
  if (finalStats.pending > 0) {
    throw new Error(`Ainda existem inscricoes pendentes apos aprovacao UI: ${JSON.stringify(finalStats)}`);
  }
  const approved = await waitFor(cdp, `/Pendentes:\\s*0|Aprovadas:\\s*[4-9]|Aprovadas\\s+[4-9]/i.test(document.body.innerText || "")`, 30000);
  if (!approved) {
    diagnostics.approvalWarning = await evalJs(cdp, "document.body.innerText.slice(0, 3000)");
  }
  await snapshot(cdp, "09-liga-inscricoes-aprovadas", diagnostics, desktop);
}

async function loadLeagueRegistrationStats(leagueId) {
  const { client } = await loadLeagueContext(leagueId);
  const regs = await client.from("league_registrations").select("status").eq("league_id", leagueId);
  if (regs.error) throw regs.error;
  return (regs.data || []).reduce(
    (acc, row) => {
      acc.total += 1;
      if (row.status === "pending") acc.pending += 1;
      if (row.status === "approved") acc.approved += 1;
      if (row.status === "rejected") acc.rejected += 1;
      return acc;
    },
    { approved: 0, pending: 0, rejected: 0, total: 0 }
  );
}

async function loadLeagueMatches(leagueId) {
  const { client } = await loadLeagueContext(leagueId);
  const rounds = await client
    .from("league_rounds")
    .select("id,round_number,status")
    .eq("league_id", leagueId)
    .order("round_number", { ascending: true });
  if (rounds.error) throw rounds.error;
  const matches = await client
    .from("league_matches")
    .select("id,status,round_id,result_payload,winner_side,is_wo,created_at,league_match_players(side,slot,league_player_id,league_players(id,user_id,display_name))")
    .eq("league_id", leagueId)
    .order("created_at", { ascending: true });
  if (matches.error) throw matches.error;
  return { rounds: rounds.data || [], matches: matches.data || [] };
}

async function generateRoundThroughUi(cdp, leagueId, diagnostics) {
  await navigate(cdp, `#/eventos/ligas/${leagueId}`);
  await installBrowserHelpers(cdp);
  await snapshot(cdp, "10-liga-antes-gerar-rodada", diagnostics, desktop);
  const clicked = await evalJs(
    cdp,
    `
    (() => {
      const helper = window.__atpFlow;
      const buttons = [...document.querySelectorAll("button")]
        .filter((btn) => helper.visible(btn) && !btn.disabled && /Gerar.*rodada/i.test(helper.textOf(btn)));
      const button = buttons[0];
      if (!button) {
        return {
          ok: false,
          reason: "no-enabled-generate-round",
          buttons: [...document.querySelectorAll("button")].filter((btn) => helper.visible(btn)).map((btn) => ({ text: helper.textOf(btn), disabled: btn.disabled })).slice(0, 40),
          body: helper.routeText().slice(0, 2500),
        };
      }
      button.scrollIntoView({ block: "center", inline: "center" });
      button.click();
      return { ok: true, text: helper.textOf(button) };
    })()
    `
  );
  if (!clicked?.ok) throw new Error(`CTA de gerar rodada nao encontrado: ${JSON.stringify(clicked)}`);
  await waitFor(cdp, `/Partidas criadas:\\s*[1-9]|Rodada gerada com sucesso|Partidas por rodada/i.test(document.body.innerText || "")`, 45000);
  await waitForPageReady(cdp);
  await snapshot(cdp, "11-liga-rodada-gerada", diagnostics, desktop);
  let state = await loadLeagueMatches(leagueId);
  for (let i = 0; i < 20 && state.matches.length === 0; i += 1) {
    await sleep(1000);
    state = await loadLeagueMatches(leagueId);
  }
  if (!state.matches.length) throw new Error("Rodada gerada sem partidas no banco.");
  diagnostics.matchesAfterGeneration = state.matches.map((match) => ({ id: match.id, status: match.status }));
  return state.matches;
}

function participantsFor(match) {
  return (match.league_match_players || [])
    .map((item) => ({
      side: item.side,
      leaguePlayerId: item.league_player_id,
      userId: item.league_players?.user_id || "",
      displayName: item.league_players?.display_name || "",
    }))
    .filter((item) => item.userId)
    .sort((a, b) => a.side - b.side);
}

function emailForUser(userId, diagnostics) {
  return diagnostics.registrationsCreated.find((item) => item.userId === userId)?.email || "";
}

async function openMatchRoom(cdp, leagueId, matchId) {
  await navigate(cdp, `#/eventos/ligas/${leagueId}?tab=partidas&room=${matchId}`);
  await installBrowserHelpers(cdp);
  const opened = await waitFor(cdp, "Boolean(document.querySelector('.league-match-room-dialog'))", 20000);
  if (!opened) {
    const body = await evalJs(cdp, "document.body.innerText.slice(0, 3000)");
    throw new Error(`Sala da liga nao abriu para ${matchId}: ${body}`);
  }
  await installBrowserHelpers(cdp);
}

async function submitPlayerResultThroughUi(cdp, leagueId, diagnostics) {
  const state = await loadLeagueMatches(leagueId);
  const match = state.matches.find((item) => participantsFor(item).length >= 2 && !["encerrada", "wo"].includes(item.status));
  if (!match) throw new Error("Nao ha partida elegivel para resultado por jogador.");
  const parts = participantsFor(match);
  const submitterEmail = emailForUser(parts[0].userId, diagnostics);
  const confirmerEmail = emailForUser(parts[1].userId, diagnostics);
  if (!submitterEmail || !confirmerEmail) {
    throw new Error(`Nao consegui mapear emails dos jogadores: ${JSON.stringify(parts)}`);
  }

  await clearBrowserSession(cdp);
  await login(cdp, submitterEmail, PLAYER_PASSWORD);
  await openMatchRoom(cdp, leagueId, match.id);
  await snapshot(cdp, "12-player-sala-da-partida", diagnostics, desktop);
  await must(cdp, `window.__atpFlow.fillVisibleLeagueScore("6", "2")`, "preencher resultado jogador");
  await must(cdp, `window.__atpFlow.clickText("Enviar resultado")`, "enviar resultado jogador");
  const submitted = await waitFor(cdp, `/Resultado enviado|Aguardando confirmacao|Submissao/i.test(document.body.innerText || "")`, 25000);
  diagnostics.playerResultSubmit = { matchId: match.id, submitterEmail, confirmerEmail, submitted };
  await snapshot(cdp, "13-player-resultado-enviado", diagnostics, desktop);

  await clearBrowserSession(cdp);
  await login(cdp, confirmerEmail, PLAYER_PASSWORD);
  await openMatchRoom(cdp, leagueId, match.id);
  await snapshot(cdp, "14-oponente-confirma-resultado", diagnostics, desktop);
  await must(cdp, `window.__atpFlow.clickText("^Confirmar$")`, "confirmar resultado pelo oponente");
  const confirmed = await waitFor(cdp, `/Resultado confirmado|encerrada|Finalizada/i.test(document.body.innerText || "")`, 30000);
  diagnostics.playerResultConfirm = { matchId: match.id, confirmerEmail, confirmed };
  await snapshot(cdp, "15-oponente-resultado-confirmado", diagnostics, desktop);

  await clearBrowserSession(cdp);
  await login(cdp, OWNER_EMAIL, OWNER_PASSWORD);
  await navigate(cdp, `#/eventos/ligas/${leagueId}?tab=partidas`);
  await installBrowserHelpers(cdp);
  await snapshot(cdp, "16-owner-apos-resultado-jogador", diagnostics, desktop);
}

async function resolveRemainingMatchesThroughUi(cdp, leagueId, diagnostics) {
  const attempts = [];
  for (let loop = 0; loop < 8; loop += 1) {
    const state = await loadLeagueMatches(leagueId);
    const pending = state.matches.find((match) => participantsFor(match).length >= 2 && !["encerrada", "wo"].includes(match.status));
    if (!pending) break;
    await openMatchRoom(cdp, leagueId, pending.id);
    await must(cdp, `window.__atpFlow.fillVisibleLeagueScore("6", "3")`, `preencher resultado admin ${pending.id}`);
    await must(cdp, `window.__atpFlow.clickText("Resolver pelo admin")`, `resolver pelo admin ${pending.id}`);
    const resolved = await waitFor(cdp, `/Partida resolvida|encerrada|Resultado/i.test(document.body.innerText || "")`, 25000);
    attempts.push({ matchId: pending.id, resolved });
    await waitForPageReady(cdp);
  }
  diagnostics.adminResultAttempts = attempts;
  await navigate(cdp, `#/eventos/ligas/${leagueId}?tab=partidas`);
  await installBrowserHelpers(cdp);
  await snapshot(cdp, "17-owner-partidas-resolvidas", diagnostics, desktop);
}

async function applySeasonMovementsThroughUi(cdp, leagueId, diagnostics) {
  await navigate(cdp, `#/eventos/ligas/${leagueId}`);
  await installBrowserHelpers(cdp);
  await snapshot(cdp, "18-liga-pronta-para-fechamento", diagnostics, desktop);
  const clicked = await evalJs(cdp, `window.__atpFlow.clickText("Aplicar sobe/desce")`);
  diagnostics.applySeasonMovementsClick = clicked;
  if (clicked?.ok) {
    await waitFor(cdp, `/temporada|classificacao|sobe\\/desce|final/i.test(document.body.innerText || "")`, 30000);
    await waitForPageReady(cdp);
  }
  await snapshot(cdp, "19-liga-fechamento-pos-sobe-desce", diagnostics, desktop);
}

async function finalUxPass(cdp, leagueId, diagnostics) {
  await navigate(cdp, `#/eventos/ligas/${leagueId}`);
  await installBrowserHelpers(cdp);
  await snapshot(cdp, "20-final-owner-desktop-1366", diagnostics, desktop);
  await snapshot(cdp, "21-final-owner-desktop-wide", diagnostics, desktopWide);
  await snapshot(cdp, "22-final-owner-mobile-390", diagnostics, mobile390);
  await snapshot(cdp, "23-final-owner-mobile-430", diagnostics, mobile430);

  const participant = diagnostics.registrationsCreated[0];
  if (participant?.email) {
    await clearBrowserSession(cdp);
    await login(cdp, participant.email, PLAYER_PASSWORD);
    await navigate(cdp, `#/eventos/ligas/${leagueId}`);
    await installBrowserHelpers(cdp);
    await snapshot(cdp, "24-final-participante-mobile-390", diagnostics, mobile390);
    await snapshot(cdp, "25-final-participante-desktop-1366", diagnostics, desktop);
  }
}

async function loadExistingLeagueForContinuation(leagueId, diagnostics) {
  const context = await loadLeagueContext(leagueId);
  diagnostics.league = {
    id: leagueId,
    name: context.league.name,
    status: context.league.status,
    continuedAt: new Date().toISOString(),
  };
  const regs = await context.client
    .from("league_registrations")
    .select("id,user_id,player_name,status")
    .eq("league_id", leagueId)
    .order("created_at", { ascending: true });
  if (regs.error) throw regs.error;
  diagnostics.registrationsCreated = (regs.data || []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    playerName: row.player_name,
    status: row.status,
    email: PLAYER_EMAILS.find((email) => email.includes(String(row.player_name || "").toLowerCase().split(" ")[0])) || "",
    source: "existing",
  }));
  return { id: leagueId, name: context.league.name, status: context.league.status };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const diagnostics = {
    appUrl: APP_URL,
    at: new Date().toISOString(),
    console: [],
    events: [],
    failedRequests: [],
    pageErrors: [],
    registrationsCreated: [],
    screenshots: [],
    league: null,
  };

  const port = 9329 + Math.floor(Math.random() * 1000);
  const userDataDir = await mkdtemp(path.join(os.tmpdir(), "atp-league-flow-"));
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
    await login(cdp);
    const league = EXISTING_LEAGUE_ID
      ? await loadExistingLeagueForContinuation(EXISTING_LEAGUE_ID, diagnostics)
      : await createLeagueThroughUi(cdp, diagnostics);
    if (!EXISTING_LEAGUE_ID) {
      await createLeagueJoinRequests(league.id, diagnostics);
      await approveRegistrationsThroughUi(cdp, league.id, diagnostics);
    }
    let state = await loadLeagueMatches(league.id);
    if (!state.matches.length) {
      await generateRoundThroughUi(cdp, league.id, diagnostics);
    } else {
      await navigate(cdp, `#/eventos/ligas/${league.id}?tab=partidas`);
      await installBrowserHelpers(cdp);
      await snapshot(cdp, "11-liga-rodada-ja-existente", diagnostics, desktop);
    }
    await submitPlayerResultThroughUi(cdp, league.id, diagnostics);
    await resolveRemainingMatchesThroughUi(cdp, league.id, diagnostics);
    await applySeasonMovementsThroughUi(cdp, league.id, diagnostics);
    await finalUxPass(cdp, league.id, diagnostics);
    diagnostics.finalState = await loadLeagueMatches(league.id);
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
