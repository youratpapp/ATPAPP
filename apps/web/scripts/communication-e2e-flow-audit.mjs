import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const ROOT = process.cwd();
const APP_URL = process.env.APP_URL || "http://127.0.0.1:5173/";
const OUT_DIR = process.env.ATP_COMM_FLOW_OUT_DIR
  ? path.resolve(ROOT, process.env.ATP_COMM_FLOW_OUT_DIR)
  : path.join(ROOT, "docs", "screenshots", "communication-e2e-flow-2026-05-21");

const OWNER_EMAIL = process.env.ATP_OWNER_EMAIL || "escalao@gmail.com";
const OWNER_PASSWORD = process.env.ATP_OWNER_PASSWORD || "Escalao@2026!";
const PLAYER_EMAIL = process.env.ATP_COMM_PLAYER_EMAIL || "jogador011@demo.atp.local";
const PLAYER_PASSWORD = process.env.ATP_PLAYER_PASSWORD || "Jogador@2026!";
const TOURNAMENT_ID = process.env.ATP_COMM_TOURNAMENT_ID || "";
const LEAGUE_ID = process.env.ATP_COMM_LEAGUE_ID || "";

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
  await waitFor(cdp, `!/(Carregando|Entrando|Processando|Salvando|Loading)/i.test(document.body.innerText || "")`, 25000);
  await sleep(1000);
}

async function setViewport(cdp, viewport) {
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: viewport.deviceScaleFactor,
    mobile: viewport.mobile,
  });
  await sleep(400);
}

async function navigate(cdp, hash) {
  await cdp.send("Page.navigate", { url: `${APP_URL}${hash}` });
  await waitForPageReady(cdp);
}

async function capture(cdp, filePath) {
  const metrics = await cdp.send("Page.getLayoutMetrics");
  const contentSize = metrics.cssContentSize || metrics.contentSize;
  const width = Math.ceil(contentSize.width);
  const height = Math.min(Math.ceil(contentSize.height), 5200);
  const screenshot = await cdp.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    fromSurface: true,
    clip: { x: 0, y: 0, width, height, scale: 1 },
  });
  await writeFile(filePath, Buffer.from(screenshot.data, "base64"));
}

async function snapshot(cdp, diagnostics, name, viewport = desktop) {
  await setViewport(cdp, viewport);
  await waitForPageReady(cdp);
  const file = path.join(OUT_DIR, `${String(diagnostics.screenshots.length + 1).padStart(2, "0")}-${viewport.name}-${name}.png`);
  await capture(cdp, file);
  diagnostics.screenshots.push({ name, viewport: viewport.name, file: path.relative(ROOT, file).replaceAll("\\", "/"), url: await evalJs(cdp, "location.href") });
}

async function installHelpers(cdp) {
  await evalJs(
    cdp,
    `
    (() => {
      window.__atpComm = {
        textOf(el) {
          return String(el?.innerText || el?.textContent || "").replace(/\\s+/g, " ").trim();
        },
        visible(el) {
          if (!el) return false;
          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);
          return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
        },
        setNativeValue(el, value) {
          if (!el) return false;
          const proto = Object.getPrototypeOf(el);
          const descriptor = Object.getOwnPropertyDescriptor(proto, "value") || Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value") || Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value");
          descriptor?.set?.call(el, value);
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("change", { bubbles: true }));
          return true;
        },
        setByLabel(labelPattern, value) {
          const re = new RegExp(labelPattern, "i");
          const labels = [...document.querySelectorAll("label")].filter((el) => this.visible(el) && re.test(this.textOf(el)));
          for (const label of labels) {
            const control = label.htmlFor ? document.getElementById(label.htmlFor) : label.querySelector("input,textarea,select") || label.parentElement?.querySelector("input,textarea,select");
            if (control && this.setNativeValue(control, value)) return { ok: true };
          }
          const fallback = [...document.querySelectorAll("input,textarea")].find((el) => re.test(el.placeholder || "") && this.visible(el));
          return fallback && this.setNativeValue(fallback, value) ? { ok: true } : { ok: false, reason: "not-found", labelPattern };
        },
        clickText(pattern, selector = "button,a,summary,label") {
          const re = new RegExp(pattern, "i");
          const candidates = [...document.querySelectorAll(selector)].filter((el) => this.visible(el) && !el.disabled && re.test(this.textOf(el)));
          const target = candidates[candidates.length - 1];
          if (!target) return { ok: false, reason: "not-found", pattern, texts: [...document.querySelectorAll(selector)].filter((el) => this.visible(el)).slice(-40).map((el) => this.textOf(el)) };
          target.scrollIntoView({ block: "center", inline: "center" });
          target.click();
          return { ok: true, text: this.textOf(target) };
        },
        submitByPlaceholder(placeholderPattern, value, buttonPattern) {
          const re = new RegExp(placeholderPattern, "i");
          const input = [...document.querySelectorAll("input,textarea")].find((el) => this.visible(el) && re.test(el.placeholder || ""));
          if (!input) return { ok: false, reason: "input-not-found", placeholderPattern };
          this.setNativeValue(input, value);
          const scope = input.closest(".tournament-chat-compose,.tournament-chat-admin-tools,.league-chat-send,.section-card,.card") || document;
          const buttonRe = new RegExp(buttonPattern, "i");
          const button = [...scope.querySelectorAll("button")].find((el) => this.visible(el) && !el.disabled && buttonRe.test(this.textOf(el)));
          if (!button) return { ok: false, reason: "button-not-found", value, buttons: [...scope.querySelectorAll("button")].map((el) => this.textOf(el)) };
          button.scrollIntoView({ block: "center", inline: "center" });
          button.click();
          return { ok: true, placeholder: input.placeholder, button: this.textOf(button), value };
        },
      };
    })()
    `
  );
}

async function login(cdp, email, password) {
  await navigate(cdp, "#/auth");
  await cdp.send("Storage.clearDataForOrigin", { origin: new URL(APP_URL).origin, storageTypes: "all" }).catch(() => {});
  await evalJs(cdp, "localStorage.clear(); sessionStorage.clear();");
  await cdp.send("Page.reload", { ignoreCache: true });
  await waitForPageReady(cdp);
  await navigate(cdp, "#/auth");
  await installHelpers(cdp);
  const emailSet = await evalJs(cdp, `window.__atpComm.setByLabel("e-mail|email", ${JSON.stringify(email)})`);
  const passwordSet = await evalJs(cdp, `window.__atpComm.setByLabel("senha", ${JSON.stringify(password)})`);
  const clicked = await evalJs(cdp, `window.__atpComm.clickText("^Entrar$")`);
  if (!emailSet.ok || !passwordSet.ok || !clicked.ok) throw new Error(`Falha no login ${email}`);
  await waitFor(cdp, "!location.hash.includes('/auth')", 25000);
  await waitForPageReady(cdp);
  await installHelpers(cdp);
}

async function submit(cdp, diagnostics, step, placeholder, value, button = "Enviar|Publicar") {
  const result = await evalJs(cdp, `window.__atpComm.submitByPlaceholder(${JSON.stringify(placeholder)}, ${JSON.stringify(value)}, ${JSON.stringify(button)})`);
  diagnostics.steps.push({ step, result });
  if (!result.ok) diagnostics.flowIssues.push({ step, result });
  await waitForPageReady(cdp);
  await waitFor(cdp, `document.body.innerText.includes(${JSON.stringify(value)})`, 6000);
  const found = await evalJs(cdp, `document.body.innerText.includes(${JSON.stringify(value)})`);
  diagnostics.steps.push({ step: `${step}:message-visible`, found });
  if (!found) diagnostics.flowIssues.push({ step: `${step}:message-visible`, message: "Mensagem enviada nao ficou visivel na tela." });
  return result.ok && found;
}

async function main() {
  if (!TOURNAMENT_ID || !LEAGUE_ID) throw new Error("Informe ATP_COMM_TOURNAMENT_ID e ATP_COMM_LEAGUE_ID.");
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });
  const diagnostics = {
    completed: false,
    tournamentId: TOURNAMENT_ID,
    leagueId: LEAGUE_ID,
    screenshots: [],
    steps: [],
    flowIssues: [],
    console: [],
    pageErrors: [],
    failedRequests: [],
    events: [],
  };
  const port = 9522 + Math.floor(Math.random() * 1000);
  const userDataDir = await mkdtemp(path.join(os.tmpdir(), "atp-comm-flow-"));
  const chrome = spawn(chromePath(), [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    "--no-first-run",
    "--disable-gpu",
    "--hide-scrollbars=false",
    "--window-size=1366,920",
    "about:blank",
  ]);
  let cdp = null;
  try {
    const target = await waitForDebug(port);
    cdp = makeCdp(target.webSocketDebuggerUrl, diagnostics);
    await cdp.ready;
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Log.enable");
    await cdp.send("Network.enable");
    cdp.on("Runtime.consoleAPICalled", (params) => {
      diagnostics.console.push({ type: params.type, text: (params.args || []).map((arg) => arg.value || arg.description || "").join(" ") });
    });
    cdp.on("Runtime.exceptionThrown", (params) => diagnostics.pageErrors.push(params.exceptionDetails?.exception?.description || params.exceptionDetails?.text || "exception"));
    cdp.on("Network.loadingFailed", (params) => diagnostics.failedRequests.push({ requestId: params.requestId, errorText: params.errorText, blockedReason: params.blockedReason || "" }));

    await login(cdp, OWNER_EMAIL, OWNER_PASSWORD);
    await navigate(cdp, `#/eventos/${TOURNAMENT_ID}/chat?mode=work`);
    await snapshot(cdp, diagnostics, "01-owner-tournament-chat-before", desktop);
    await submit(cdp, diagnostics, "owner-tournament-announcement", "Escreva um aviso para todos os participantes", `Aviso E2E ${new Date().toISOString()}: rodada validada pela organizacao.`, "Publicar aviso");
    await submit(cdp, diagnostics, "owner-tournament-chat", "Escreva no chat do torneio", "Mensagem E2E do organizador no chat do torneio.");
    await snapshot(cdp, diagnostics, "02-owner-tournament-chat-after", desktop);

    await login(cdp, PLAYER_EMAIL, PLAYER_PASSWORD);
    await navigate(cdp, `#/eventos/${TOURNAMENT_ID}/chat`);
    await snapshot(cdp, diagnostics, "03-player-tournament-chat-before", mobile);
    await submit(cdp, diagnostics, "player-tournament-chat", "Escreva no chat do torneio", "Mensagem E2E do jogador confirmando leitura do aviso.");
    await snapshot(cdp, diagnostics, "04-player-tournament-chat-after", mobile);

    await login(cdp, OWNER_EMAIL, OWNER_PASSWORD);
    await navigate(cdp, `#/eventos/ligas/${LEAGUE_ID}?tab=chat&mode=work`);
    await snapshot(cdp, diagnostics, "05-owner-league-chat-before", desktop);
    await submit(cdp, diagnostics, "owner-league-announcement", "Digite um comunicado para toda a liga", `Comunicado E2E ${new Date().toISOString()}: rodada da liga validada.`, "Publicar");
    await submit(cdp, diagnostics, "owner-league-chat", "Escreva para os participantes", "Mensagem E2E do owner para os participantes da liga.");
    await snapshot(cdp, diagnostics, "06-owner-league-chat-after", desktop);

    await login(cdp, PLAYER_EMAIL, PLAYER_PASSWORD);
    await navigate(cdp, `#/eventos/ligas/${LEAGUE_ID}?tab=chat`);
    await snapshot(cdp, diagnostics, "07-player-league-chat-before", mobile);
    await submit(cdp, diagnostics, "player-league-chat", "Escreva para os participantes", "Mensagem E2E do participante no chat geral da liga.");
    await snapshot(cdp, diagnostics, "08-player-league-chat-after", mobile);

    diagnostics.completed = diagnostics.flowIssues.length === 0;
  } catch (error) {
    diagnostics.completed = false;
    diagnostics.error = error instanceof Error ? error.stack || error.message : String(error);
    if (cdp) await snapshot(cdp, diagnostics, "error-state", desktop).catch(() => {});
  } finally {
    if (cdp) cdp.close();
    await writeFile(path.join(OUT_DIR, "diagnostics.json"), JSON.stringify(diagnostics, null, 2));
    chrome.kill();
    await sleep(1000);
    await rm(userDataDir, { recursive: true, force: true }).catch(() => {});
  }
  if (!diagnostics.completed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
