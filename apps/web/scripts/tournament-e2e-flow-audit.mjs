import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const ROOT = process.cwd();
const APP_URL = process.env.APP_URL || "http://127.0.0.1:5173/";
const OUT_DIR = process.env.ATP_TOURNAMENT_FLOW_OUT_DIR
  ? path.resolve(ROOT, process.env.ATP_TOURNAMENT_FLOW_OUT_DIR)
  : path.join(ROOT, "docs", "screenshots", "tournament-e2e-flow-v4-2026-05-20");

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://xdopstommqojjofapzjl.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_bofGMq6jhqcVetHTGP6GjQ_vJQWsTjh";

const OWNER_EMAIL = process.env.ATP_OWNER_EMAIL || "escalao@gmail.com";
const OWNER_PASSWORD = process.env.ATP_OWNER_PASSWORD || "Escalao@2026!";
const PLAYER_PASSWORD = process.env.ATP_PLAYER_PASSWORD || "Jogador@2026!";
const PLAYER_EMAILS = (process.env.ATP_TOURNAMENT_PLAYERS || "jogador011@demo.atp.local,jogador012@demo.atp.local,jogador013@demo.atp.local,jogador014@demo.atp.local")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);
const EXISTING_TOURNAMENT_ID = (process.env.ATP_EXISTING_TOURNAMENT_ID || "").trim();

const CHROME_PATHS = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];

const desktop = { name: "desktop-1366", width: 1366, height: 920, deviceScaleFactor: 1, mobile: false };
const mobile = { name: "mobile-390", width: 390, height: 844, deviceScaleFactor: 2, mobile: true };

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
        if (!Array.isArray(targets)) {
          lastError = new Error(`Chrome DevTools retornou formato inesperado: ${JSON.stringify(targets).slice(0, 200)}`);
          await sleep(250);
          continue;
        }
        const pageTarget = targets.find((target) => target.type === "page" && target.webSocketDebuggerUrl);
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
  await waitFor(cdp, `!/(Carregando|Entrando|Processando|Salvando|Loading)/i.test(document.body.innerText || "")`, 25000);
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
  const maxHeight = 5200;
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
  diagnostics.screenshots.push({ name, viewport: viewport.name, file: path.relative(ROOT, file).replaceAll("\\", "/"), url: await evalJs(cdp, "location.href") });
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
          const candidates = [...document.querySelectorAll(selector)].filter((el) => this.visible(el) && re.test(this.textOf(el)));
          const target = candidates[candidates.length - 1];
          if (!target) return { ok: false, reason: "not-found", pattern, texts: [...document.querySelectorAll(selector)].filter((el) => this.visible(el)).slice(-30).map((el) => this.textOf(el)) };
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
          const labels = scopes
            .flatMap((scope) => [...scope.querySelectorAll("label")].filter((el) => this.visible(el) && re.test(this.textOf(el))));
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
        clickCheckboxLabel(pattern) {
          const re = new RegExp(pattern, "i");
          const label = [...document.querySelectorAll("label")].find((el) => this.visible(el) && re.test(this.textOf(el)));
          const input = label?.querySelector('input[type="checkbox"]');
          if (!input) return { ok: false, reason: "not-found", pattern };
          input.scrollIntoView({ block: "center", inline: "center" });
          input.click();
          return { ok: true };
        },
        routeText() {
          return document.body.innerText;
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
  await evalJs(
    cdp,
    `
    (() => {
      localStorage.clear();
      sessionStorage.clear();
      return true;
    })()
    `
  );
  await cdp.send("Page.navigate", { url: `${APP_URL}?session=${Date.now()}#/auth` });
  await waitForPageReady(cdp);
}

async function createTournamentThroughUi(cdp, diagnostics) {
  const today = new Date();
  const start = new Date(today.getTime() + 22 * 24 * 60 * 60 * 1000);
  const yyyy = start.getFullYear();
  const mm = String(start.getMonth() + 1).padStart(2, "0");
  const dd = String(start.getDate()).padStart(2, "0");
  const date = `${yyyy}-${mm}-${dd}`;
  const name = `ATP Open Dourados ${new Date().toISOString().slice(11, 19).replaceAll(":", "")}`;

  await navigate(cdp, "#/eventos/torneios?view=organizing");
  await installBrowserHelpers(cdp);
  await snapshot(cdp, "01-torneios-organizando-antes-criar", diagnostics, desktop);

  await must(cdp, `window.__atpFlow.clickText("Criar torneio")`, "abrir modal criar torneio");
  await waitFor(cdp, "Boolean(document.querySelector('.competition-create-modal'))", 10000);
  await installBrowserHelpers(cdp);
  await snapshot(cdp, "02-modal-criacao-basico", diagnostics, desktop);

  await must(cdp, `window.__atpFlow.setByLabel("Nome do torneio", ${JSON.stringify(name)})`, "nome torneio");
  await must(cdp, `window.__atpFlow.setByLabel("Data de inicio", ${JSON.stringify(date)})`, "data inicio");
  await must(cdp, `window.__atpFlow.setByLabel("Data final", ${JSON.stringify(date)})`, "data final");
  await must(cdp, `window.__atpFlow.setSelectByLabel("Estado", "MS")`, "estado");
  await waitFor(cdp, `[...document.querySelectorAll("label")].some((label) => /Cidade/i.test(label.innerText || "") && [...(label.querySelector("select")?.options || [])].some((option) => option.value === "Dourados"))`, 20000);
  await must(cdp, `window.__atpFlow.setSelectByLabel("Cidade", "Dourados")`, "cidade");
  await must(cdp, `window.__atpFlow.setSelectByLabel("Visibilidade", "private")`, "visibilidade");
  await must(cdp, `window.__atpFlow.clickText("Continuar")`, "continuar basico");

  await must(cdp, `window.__atpFlow.setByLabel("Inscrições ate|Inscricoes ate", ${JSON.stringify(date)})`, "data inscricao");
  await must(cdp, `window.__atpFlow.setByLabel("Taxa", "0")`, "taxa zero");
  await must(cdp, `window.__atpFlow.setSelectByLabel("Aprovacao|Aprovação", "manual")`, "aprovacao manual");
  await must(cdp, `window.__atpFlow.setSelectByLabel("Resultado pelo jogador", "sim")`, "resultado jogador sim");
  await must(cdp, `window.__atpFlow.clickText("Continuar")`, "continuar inscricoes");

  await snapshot(cdp, "03-modal-criacao-categorias", diagnostics, desktop);
  await must(cdp, `window.__atpFlow.clickText("Continuar")`, "continuar categorias default");

  await must(cdp, `window.__atpFlow.setSelectByLabel("Modelo", "mata_mata_simples")`, "modelo mata mata");
  await must(cdp, `window.__atpFlow.setSelectByLabel("Pontuacao|Pontuação", "set_unico")`, "pontuacao set unico");
  await must(cdp, `window.__atpFlow.clickText("Continuar")`, "continuar formato");

  await must(cdp, `window.__atpFlow.clickText("Manual")`, "selecionar quadras manuais");
  await must(cdp, `window.__atpFlow.setByLabel("Quadras manuais", "Quadra 1\\nQuadra 2")`, "quadras manuais");
  await must(cdp, `window.__atpFlow.clickText("Continuar")`, "continuar agenda");

  await must(cdp, `window.__atpFlow.setSelectByLabel("Status inicial", "registration_open")`, "status inicial aberto");
  await snapshot(cdp, "04-modal-criacao-revisar", diagnostics, desktop);
  await must(cdp, `window.__atpFlow.clickText("Criar e abrir")`, "criar torneio");
  const created = await waitFor(cdp, "location.hash.includes('/eventos/') && (location.hash.includes('/organizacao') || location.hash.includes('/jogos'))", 40000);
  if (!created) throw new Error("Torneio nao navegou para detalhe apos criar.");
  await waitForPageReady(cdp);
  await installBrowserHelpers(cdp);
  const hash = await evalJs(cdp, "location.hash");
  const tournamentId = String(hash).match(/\/eventos\/([^/]+)\//)?.[1];
  if (!tournamentId) throw new Error(`Nao consegui extrair tournamentId de ${hash}`);
  diagnostics.tournament = { id: tournamentId, name, createdAt: new Date().toISOString() };
  await snapshot(cdp, "05-torneio-criado-organizacao", diagnostics, desktop);
  return { id: tournamentId, name };
}

async function createRegistrationRequests(tournamentId, diagnostics) {
  const ownerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  const ownerAuth = await ownerClient.auth.signInWithPassword({ email: OWNER_EMAIL, password: OWNER_PASSWORD });
  if (ownerAuth.error) throw ownerAuth.error;
  const tournamentRes = await ownerClient
    .from("tournaments")
    .select("id,name,data")
    .eq("id", tournamentId)
    .maybeSingle();
  if (tournamentRes.error) throw tournamentRes.error;
  const cat = tournamentRes.data?.data?.categorias?.[0];
  const cls = cat?.classes?.[0];
  if (!cat?.id || !cls?.id) throw new Error("Torneio sem categoria/classe para inscricao.");

  const registrations = [];
  for (const email of PLAYER_EMAILS) {
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    const auth = await client.auth.signInWithPassword({ email, password: PLAYER_PASSWORD });
    if (auth.error) throw auth.error;
    const user = auth.data.user;
    const profile = await client.from("profiles").select("display_name,phone").eq("user_id", user.id).maybeSingle();
    const playerName = profile.data?.display_name || email.split("@")[0];
    const phone = profile.data?.phone || "+5567999000000";
    const rpc = await client.rpc("app_request_tournament_registration", {
      p_tournament_id: tournamentId,
      p_category_id: String(cat.id),
      p_class_id: String(cls.id),
      p_category_name: String(cat.nome || "Tenis"),
      p_class_name: String(cls.nome || "Classe A"),
      p_player_name: playerName,
      p_phone: phone,
    });
    if (rpc.error) throw new Error(`${email}: ${rpc.error.message}`);
    registrations.push({ email, userId: user.id, playerName });
    await client.auth.signOut();
  }
  diagnostics.registrationsCreated = registrations;
  return registrations;
}

async function loadExistingTournamentForContinuation(tournamentId, diagnostics) {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  const auth = await client.auth.signInWithPassword({ email: OWNER_EMAIL, password: OWNER_PASSWORD });
  if (auth.error) throw auth.error;
  const tournament = await client.from("tournaments").select("id,name,status").eq("id", tournamentId).maybeSingle();
  if (tournament.error || !tournament.data) throw new Error(tournament.error?.message || "Torneio existente nao encontrado.");
  const registrations = await client
    .from("tournament_registrations")
    .select("id,user_id,player_name,status")
    .eq("tournament_id", tournamentId)
    .order("created_at", { ascending: true });
  if (registrations.error) throw registrations.error;
  diagnostics.tournament = { id: tournamentId, name: tournament.data.name, status: tournament.data.status, continuedAt: new Date().toISOString() };
  diagnostics.registrationsCreated = (registrations.data || []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    playerName: row.player_name,
    status: row.status,
    source: "existing",
  }));
  return { id: tournamentId, name: tournament.data.name, status: tournament.data.status };
}

async function approveRegistrationsThroughUi(cdp, tournamentId, diagnostics) {
  await navigate(cdp, `#/eventos/${tournamentId}/jogadores?mode=work`);
  await cdp.send("Page.reload", { ignoreCache: true });
  await waitForPageReady(cdp);
  await installBrowserHelpers(cdp);
  await snapshot(cdp, "06-inscricoes-pendentes", diagnostics, desktop);
  await must(cdp, `window.__atpFlow.clickCheckboxLabel("Selecionar pendentes")`, "selecionar pendentes");
  await must(cdp, `window.__atpFlow.clickText("Aprovar selecionadas")`, "aprovar selecionadas");
  await waitFor(cdp, `/(Aprovadas \\([4-9]|Pendentes \\(0\\))/i.test(document.body.innerText || "")`, 30000);
  await waitForPageReady(cdp);
  await snapshot(cdp, "07-inscricoes-aprovadas", diagnostics, desktop);
}

async function closeRegistrationAndGenerateThroughUi(cdp, tournamentId, diagnostics) {
  await navigate(cdp, `#/eventos/${tournamentId}/organizacao?mode=work`);
  await installBrowserHelpers(cdp);
  await snapshot(cdp, "08-organizacao-antes-encerrar", diagnostics, desktop);

  const closedByCta = await evalJs(cdp, `window.__atpFlow.clickText("Encerrar inscri[cç][oõ]es|Encerrar inscricoes")`);
  if (!closedByCta?.ok) {
    await must(cdp, `window.__atpFlow.setSelectByLabel("^Status$", "registration_closed")`, "status inscricoes encerradas");
    await evalJs(cdp, `document.querySelector('.fab-save')?.click(); true`);
  }
  await waitFor(cdp, `/inscri[cç][oõ]es encerradas|Sorteio|Gerar jogos/i.test(document.body.innerText || "")`, 30000);
  await waitForPageReady(cdp);
  await snapshot(cdp, "09-inscricoes-encerradas", diagnostics, desktop);

  await evalJs(cdp, "window.confirm = () => true; true");
  await must(cdp, `window.__atpFlow.clickText("Gerar campeonatos|Gerar jogos")`, "gerar campeonatos");
  await waitFor(cdp, `/Geracao concluida|Gera[cç][aã]o concluida|Jogos pendentes|Lancar resultado|Ao vivo/i.test(document.body.innerText || "")`, 45000);
  await waitForPageReady(cdp);
  await snapshot(cdp, "10-jogos-gerados", diagnostics, desktop);
}

async function fillResultsThroughUi(cdp, tournamentId, diagnostics) {
  await navigate(cdp, `#/eventos/${tournamentId}/jogos?mode=work`);
  await installBrowserHelpers(cdp);
  await snapshot(cdp, "11-jogos-antes-resultados", diagnostics, desktop);

  const appliedSubmission = await evalJs(
    cdp,
    `
    (() => {
      const helper = window.__atpFlow;
      const applyButton = [...document.querySelectorAll('button')]
        .find((btn) => helper.visible(btn) && /Aplicar\\s+[AB]\\s+/i.test(helper.textOf(btn)));
      if (!applyButton) return { ok: false, reason: 'no-submitted-result-to-apply' };
      applyButton.scrollIntoView({ block: 'center', inline: 'center' });
      applyButton.click();
      return { ok: true, text: helper.textOf(applyButton) };
    })()
    `
  );
  diagnostics.resultAttempts.push({ type: "apply-submitted-result", ...appliedSubmission });
  if (appliedSubmission?.ok) {
    await waitForPageReady(cdp);
  }

  const manualAdminScoreDraft = await evalJs(
    cdp,
    `
    (() => {
      const helper = window.__atpFlow;
      const cards = [...document.querySelectorAll('.match-card')]
        .filter((card) => helper.visible(card) && !/Finalizado/i.test(helper.textOf(card)) && !/A definir/i.test(helper.textOf(card)));
      for (const card of cards) {
        const details = card.querySelector('.match-score-disclosure');
        if (details) {
          details.open = true;
          void details.offsetHeight;
        }
        const inputs = [...card.querySelectorAll('input.match-score-input:not([disabled])')];
        const save = [...card.querySelectorAll('button')]
          .find((btn) => /Salvar resultado oficial/i.test(helper.textOf(btn)));
        if (inputs.length < 2 || !save || save.disabled) continue;
        document.querySelectorAll('[data-atp-manual-score-target="true"]').forEach((node) => node.removeAttribute('data-atp-manual-score-target'));
        card.setAttribute('data-atp-manual-score-target', 'true');
        helper.setNativeValue(inputs[0], '6');
        helper.setNativeValue(inputs[1], '2');
        return { ok: true, type: 'admin-manual-score-draft', text: helper.textOf(card).slice(0, 180), button: helper.textOf(save) };
      }
      return {
        ok: false,
        reason: 'no-pending-admin-score-card',
        cards: [...document.querySelectorAll('.match-card')].map((card) => ({
          buttons: [...card.querySelectorAll('button')].map((btn) => helper.textOf(btn)).slice(0, 8),
          details: card.querySelectorAll('.match-score-disclosure').length,
          inputs: card.querySelectorAll('input.match-score-input:not([disabled])').length,
          text: helper.textOf(card).slice(0, 140),
        })).slice(0, 8),
      };
    })()
    `
  );
  diagnostics.resultAttempts.push(manualAdminScoreDraft);
  let manualAdminScore = { ok: false, reason: "manual-score-draft-not-ready" };
  if (manualAdminScoreDraft?.ok) {
    await sleep(800);
    manualAdminScore = await evalJs(
      cdp,
      `
      (() => {
        const helper = window.__atpFlow;
        const card = document.querySelector('[data-atp-manual-score-target="true"]');
        if (!card) return { ok: false, reason: 'manual-score-target-lost' };
        const save = [...card.querySelectorAll('button')]
          .find((btn) => /Salvar resultado oficial/i.test(helper.textOf(btn)));
        if (!save || save.disabled) return { ok: false, reason: 'save-button-not-ready', text: helper.textOf(card).slice(0, 180) };
        save.scrollIntoView({ block: 'center', inline: 'center' });
        save.click();
        return { ok: true, type: 'admin-manual-score', text: helper.textOf(card).slice(0, 180), button: helper.textOf(save) };
      })()
      `
    );
  }
  diagnostics.resultAttempts.push(manualAdminScore);
  if (manualAdminScore?.ok) {
    await waitForPageReady(cdp);
    await sleep(2500);
  }

  for (let i = 0; i < 5; i += 1) {
    const result = await evalJs(
      cdp,
      `
      (() => {
        const helper = window.__atpFlow;
        const cards = [...document.querySelectorAll('.match-card')]
          .filter((card) => helper.visible(card) && !/Finalizado/i.test(helper.textOf(card)) && !/A definir/i.test(helper.textOf(card)));
        for (const card of cards) {
          const details = card.querySelector('.match-score-disclosure');
          if (details) {
            details.open = true;
            void details.offsetHeight;
          }
          const woButton = [...card.querySelectorAll('button')]
            .find((btn) => !btn.disabled && /^WO\\s+/i.test(helper.textOf(btn)));
          if (!woButton) continue;
          woButton.scrollIntoView({ block: 'center', inline: 'center' });
          woButton.click();
          return { ok: true, type: 'walkover-ui', text: helper.textOf(card).slice(0, 180), button: helper.textOf(woButton) };
        }
        return {
          ok: false,
          reason: 'no-pending-editable-match',
          cards: [...document.querySelectorAll('.match-card')].map((card) => ({
            buttons: [...card.querySelectorAll('button')].map((btn) => helper.textOf(btn)).slice(0, 8),
            details: card.querySelectorAll('.match-score-disclosure').length,
            inputs: card.querySelectorAll('input.match-score-input:not([disabled])').length,
            text: helper.textOf(card).slice(0, 140),
          })).slice(0, 8),
        };
      })()
      `
    );
    diagnostics.resultAttempts.push(result);
    if (!result?.ok) break;
    await waitForPageReady(cdp);
    await sleep(2500);
  }

  await snapshot(cdp, "12-jogos-com-resultados", diagnostics, desktop);
}

async function submitPlayerResultThroughUi(cdp, tournamentId, diagnostics) {
  const playerEmail = PLAYER_EMAILS[0];
  if (!playerEmail) return;
  await clearBrowserSession(cdp);
  await login(cdp, playerEmail, PLAYER_PASSWORD);
  await navigate(cdp, `#/eventos/${tournamentId}/jogos`);
  await installBrowserHelpers(cdp);
  await snapshot(cdp, "11a-player-login-jogos", diagnostics, desktop);
  const openResult = await evalJs(
    cdp,
    `
    (() => {
      const helper = window.__atpFlow;
      const button = [...document.querySelectorAll("button")]
        .find((btn) => helper.visible(btn) && /Informar resultado|Compartilhar placar/i.test(helper.textOf(btn)));
      if (!button) return { ok: false, reason: "no-player-result-button", text: document.body.innerText.slice(0, 2000) };
      button.scrollIntoView({ block: "center", inline: "center" });
      button.click();
      return { ok: true, text: helper.textOf(button) };
    })()
    `
  );
  diagnostics.playerResultOpen = openResult;
  if (openResult?.ok) {
    await waitFor(cdp, "Boolean(document.querySelector('.tournament-match-room-dialog'))", 10000);
    await snapshot(cdp, "11b-player-match-room", diagnostics, desktop);
    const submitted = await evalJs(
      cdp,
      `
      (() => {
        const helper = window.__atpFlow;
        const dialog = document.querySelector('.tournament-match-room-dialog') || document;
        const inputs = [...dialog.querySelectorAll('input.match-score-input:not([disabled])')];
        if (inputs.length < 2) return { ok: false, reason: "score-inputs-not-found", count: inputs.length };
        helper.setNativeValue(inputs[0], '6');
        helper.setNativeValue(inputs[1], '2');
        const send = [...dialog.querySelectorAll("button")]
          .find((btn) => helper.visible(btn) && /Enviar resultado/i.test(helper.textOf(btn)));
        if (!send) return { ok: false, reason: "send-button-not-found" };
        send.click();
        return { ok: true };
      })()
      `
    );
    diagnostics.playerResultSubmit = submitted;
    await waitForPageReady(cdp);
    await snapshot(cdp, "11c-player-result-submitted", diagnostics, desktop);
  }
  await clearBrowserSession(cdp);
  await login(cdp, OWNER_EMAIL, OWNER_PASSWORD);
  await navigate(cdp, `#/eventos/${tournamentId}/jogos?mode=work`);
  await installBrowserHelpers(cdp);
  await snapshot(cdp, "11d-owner-after-player-result", diagnostics, desktop);
}

async function finishTournamentThroughUi(cdp, tournamentId, diagnostics) {
  await navigate(cdp, `#/eventos/${tournamentId}/organizacao?mode=work`);
  await installBrowserHelpers(cdp);
  const alreadyFinished = await evalJs(cdp, `/Finalizado|Encerrado/i.test(document.body.innerText || "")`);
  if (alreadyFinished) {
    await waitForPageReady(cdp);
    await snapshot(cdp, "13-torneio-finalizado-organizacao", diagnostics, desktop);
    await navigate(cdp, `#/eventos/${tournamentId}/classificacao?mode=work`);
    await installBrowserHelpers(cdp);
    await snapshot(cdp, "14-classificacao-final", diagnostics, desktop);
    await snapshot(cdp, "15-mobile-organizacao-final", diagnostics, mobile);
    await navigate(cdp, `#/eventos/${tournamentId}/jogos?mode=work`);
    await installBrowserHelpers(cdp);
    await snapshot(cdp, "16-mobile-jogos-final", diagnostics, mobile);
    return;
  }
  const finishedByCta = await evalJs(cdp, `window.__atpFlow.clickText("Finalizar torneio")`);
  if (!finishedByCta?.ok) {
    if (process.env.ATP_ALLOW_STATUS_FINISH_FALLBACK !== "1") {
      throw new Error(`CTA Finalizar torneio indisponivel: ${JSON.stringify(finishedByCta)}`);
    }
    await evalJs(cdp, `window.__atpFlow.clickText("Mais navegacao do torneio|Configuracao|Dados, status e agenda"); true`);
    await waitFor(cdp, `Boolean(document.getElementById("setup-basics"))`, 10000);
    await sleep(800);
    await must(cdp, `window.__atpFlow.setSelectByLabel("^Status$", "finished")`, "status finalizado");
    await evalJs(cdp, `document.querySelector('.fab-save')?.click(); true`);
  }
  await waitFor(cdp, `/Finalizado|Hist[oó]rico|Podio|P[oó]dio/i.test(document.body.innerText || "")`, 30000);
  await waitForPageReady(cdp);
  await snapshot(cdp, "13-torneio-finalizado-organizacao", diagnostics, desktop);
  await navigate(cdp, `#/eventos/${tournamentId}/classificacao?mode=work`);
  await installBrowserHelpers(cdp);
  await snapshot(cdp, "14-classificacao-final", diagnostics, desktop);
  await snapshot(cdp, "15-mobile-organizacao-final", diagnostics, mobile);
  await navigate(cdp, `#/eventos/${tournamentId}/jogos?mode=work`);
  await installBrowserHelpers(cdp);
  await snapshot(cdp, "16-mobile-jogos-final", diagnostics, mobile);
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
    resultAttempts: [],
    screenshots: [],
    tournament: null,
  };

  const port = 9229 + Math.floor(Math.random() * 1000);
  const userDataDir = await mkdtemp(path.join(os.tmpdir(), "atp-tournament-flow-"));
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
      diagnostics.failedRequests.push({ url: params.requestId, errorText: params.errorText, blockedReason: params.blockedReason || "" });
    });
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Network.enable");

    await setViewport(cdp, desktop);
    await login(cdp);
    const tournament = EXISTING_TOURNAMENT_ID
      ? await loadExistingTournamentForContinuation(EXISTING_TOURNAMENT_ID, diagnostics)
      : await createTournamentThroughUi(cdp, diagnostics);
    if (!EXISTING_TOURNAMENT_ID) {
      await createRegistrationRequests(tournament.id, diagnostics);
      await approveRegistrationsThroughUi(cdp, tournament.id, diagnostics);
    }
    if (!(EXISTING_TOURNAMENT_ID && ["live", "finished"].includes(tournament.status))) {
      await closeRegistrationAndGenerateThroughUi(cdp, tournament.id, diagnostics);
    } else {
      await navigate(cdp, `#/eventos/${tournament.id}/organizacao?mode=work`);
      await installBrowserHelpers(cdp);
      await snapshot(cdp, "10-jogos-ja-gerados-continuacao", diagnostics, desktop);
    }
    await submitPlayerResultThroughUi(cdp, tournament.id, diagnostics);
    await fillResultsThroughUi(cdp, tournament.id, diagnostics);
    await finishTournamentThroughUi(cdp, tournament.id, diagnostics);
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
