import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const ROOT = process.cwd();
const APP_URL = process.env.APP_URL || "http://127.0.0.1:5173/";
const OUT_DIR = process.env.ATP_AUDIT_OUT_DIR
  ? path.resolve(ROOT, process.env.ATP_AUDIT_OUT_DIR)
  : path.join(ROOT, "docs", "screenshots", "visual-local-audit-2026-05-18");
const LOGIN_EMAIL = process.env.ATP_EMAIL || "escalao@gmail.com";
const LOGIN_PASSWORD = process.env.ATP_PASSWORD || "Escalao@2026!";
const SHOULD_LOGIN = process.env.ATP_AUDIT_SKIP_LOGIN !== "1";
const SHOULD_CLEAN_OUT_DIR = process.env.ATP_AUDIT_CLEAN !== "0";
const CHROME_PATHS = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];

const desktop = { name: "desktop", width: 1440, height: 980, deviceScaleFactor: 1, mobile: false };
const mobile = { name: "mobile", width: 390, height: 844, deviceScaleFactor: 2, mobile: true };
function customViewportsFromEnv() {
  if (!process.env.ATP_AUDIT_CUSTOM_VIEWPORTS_JSON) return null;
  const parsed = JSON.parse(process.env.ATP_AUDIT_CUSTOM_VIEWPORTS_JSON);
  if (!Array.isArray(parsed)) throw new Error("ATP_AUDIT_CUSTOM_VIEWPORTS_JSON deve ser um array.");
  return parsed.map((viewport) => ({
    name: String(viewport.name || "").trim(),
    width: Number(viewport.width),
    height: Number(viewport.height),
    deviceScaleFactor: Number(viewport.deviceScaleFactor || 1),
    mobile: Boolean(viewport.mobile),
  })).filter((viewport) => viewport.name && viewport.width > 0 && viewport.height > 0);
}

const availableViewports = customViewportsFromEnv() || [desktop, mobile];
const viewportFilter = (process.env.ATP_AUDIT_VIEWPORTS || "desktop,mobile")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);
const viewports = availableViewports.filter((viewport) => viewportFilter.includes(viewport.name));

const defaultRoutes = [
  { slug: "login", hash: "#/auth", public: true },
  { slug: "home", hash: "#/inicio" },
  { slug: "places-overview", hash: "#/locais" },
  { slug: "places-reserve", hash: "#/locais?intent=places" },
  { slug: "player-routine-lessons", hash: "#/agenda?tipo=aulas" },
  { slug: "places-match", hash: "#/locais?intent=matches" },
  { slug: "events-hub", hash: "#/eventos" },
  { slug: "leagues", hash: "#/eventos/ligas" },
  { slug: "tournaments", hash: "#/eventos/torneios" },
  { slug: "ranking", hash: "#/ranking" },
  { slug: "profile", hash: "#/perfil" },
  { slug: "management", hash: "#/gestao" },
  { slug: "my-reservations", hash: "#/minhas-reservas" },
  { slug: "my-matches", hash: "#/minhas-partidas" },
  { slug: "my-lessons", hash: "#/minhas-aulas" },
  { slug: "my-payments", hash: "#/meus-pagamentos" },
  { slug: "league-detail", hash: "#/eventos/ligas/c3c638c5-0c85-4834-a639-bf26d2e4b5b3" },
  { slug: "league-chat", hash: "#/eventos/ligas/c3c638c5-0c85-4834-a639-bf26d2e4b5b3?tab=chat" },
  { slug: "tournament-games", hash: "#/eventos/1a2c0053-d9f8-4458-8868-2f66886f3e52/jogos" },
  { slug: "tournament-players", hash: "#/eventos/1a2c0053-d9f8-4458-8868-2f66886f3e52/jogadores" },
];

const routes = process.env.ATP_AUDIT_ROUTES_JSON
  ? JSON.parse(process.env.ATP_AUDIT_ROUTES_JSON)
  : defaultRoutes;

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

function makeCdp(wsUrl) {
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
    throw new Error(result.exceptionDetails.text || "Runtime.evaluate failed");
  }
  return result.result?.value;
}

async function waitFor(cdp, expression, timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const value = await evalJs(cdp, `Boolean(${expression})`);
    if (value) return true;
    await sleep(300);
  }
  return false;
}

async function waitForPageReady(cdp) {
  await waitFor(cdp, "document.readyState === 'complete'", 15000);
  await waitFor(
    cdp,
    `!/(Carregando|Entrando|Processando|Loading)/i.test(document.body.innerText || "")`,
    18000
  );
  await sleep(1400);
}

async function setViewport(cdp, viewport) {
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: viewport.deviceScaleFactor,
    mobile: viewport.mobile,
  });
}

async function navigate(cdp, hash) {
  await cdp.send("Page.navigate", { url: `${APP_URL}${hash}` });
  await waitForPageReady(cdp);
}

async function login(cdp) {
  await navigate(cdp, "#/auth");
  await evalJs(
    cdp,
    `
    (() => {
      const setNativeValue = (el, value) => {
        const proto = Object.getPrototypeOf(el);
        const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
        descriptor.set.call(el, value);
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      };
      const email = document.querySelector('input[type="email"]');
      const password = document.querySelector('input[type="password"]');
      setNativeValue(email, ${JSON.stringify(LOGIN_EMAIL)});
      setNativeValue(password, ${JSON.stringify(LOGIN_PASSWORD)});
      const button = [...document.querySelectorAll("button")].find((btn) => /Entrar/i.test(btn.textContent || ""));
      button?.click();
      return Boolean(email && password && button);
    })()
    `
  );
  await waitFor(cdp, "!location.hash.includes('/auth')", 25000);
  await waitForPageReady(cdp);
}

async function capture(cdp, filePath) {
  const metrics = await cdp.send("Page.getLayoutMetrics");
  const contentSize = metrics.cssContentSize || metrics.contentSize;
  const width = Math.ceil(contentSize.width);
  const maxHeight = Number(process.env.ATP_AUDIT_MAX_HEIGHT || 4200);
  const height = Math.min(Math.ceil(contentSize.height), Number.isFinite(maxHeight) && maxHeight > 0 ? maxHeight : 4200);
  const screenshot = await cdp.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    fromSurface: true,
    clip: { x: 0, y: 0, width, height, scale: 1 },
  });
  await writeFile(filePath, Buffer.from(screenshot.data, "base64"));
}

function normalizeConsoleEvent(params) {
  const args = (params.args || [])
    .map((arg) => {
      if (typeof arg.value !== "undefined") return String(arg.value);
      if (arg.description) return String(arg.description);
      if (arg.preview?.description) return String(arg.preview.description);
      return "";
    })
    .filter(Boolean);
  return {
    source: "console",
    type: params.type || "log",
    level: params.type || "log",
    text: args.join(" "),
    url: params.stackTrace?.callFrames?.[0]?.url || "",
    line: params.stackTrace?.callFrames?.[0]?.lineNumber ?? null,
  };
}

function normalizeLogEntry(params) {
  const entry = params.entry || {};
  return {
    source: "log",
    type: entry.source || "browser",
    level: entry.level || "info",
    text: entry.text || "",
    url: entry.url || "",
    line: entry.lineNumber ?? null,
  };
}

function normalizeNetworkFailure(params) {
  return {
    source: "network",
    type: "loadingFailed",
    level: "error",
    text: `${params.errorText || "network failure"} ${params.blockedReason || ""}`.trim(),
    url: params.requestId || "",
    line: null,
  };
}

function normalizeNetworkResponse(params) {
  const status = params.response?.status;
  if (!status || status < 400) return null;
  return {
    source: "network",
    type: "http",
    level: status >= 500 ? "error" : "warning",
    text: `${status} ${params.response.statusText || ""}`.trim(),
    url: params.response.url || "",
    line: null,
  };
}

async function collectMeta(cdp) {
  return evalJs(
    cdp,
    `
    (() => ({
      title: document.title,
      hash: location.hash,
      h1: [...document.querySelectorAll("h1")].map((el) => el.textContent.trim()).filter(Boolean).slice(0, 4),
      h2: [...document.querySelectorAll("h2")].map((el) => el.textContent.trim()).filter(Boolean).slice(0, 8),
      buttons: [...document.querySelectorAll("button,a")].map((el) => el.textContent.trim()).filter(Boolean).slice(0, 40),
      cards: document.querySelectorAll('[class*="card"], [class*="Card"], .panel, .surface').length,
      textSample: (document.body.innerText || "").replace(/\\s+/g, " ").trim().slice(0, 1200),
    }))()
    `
  );
}

async function collectClickableSnapshot(cdp) {
  return evalJs(
    cdp,
    `
    (() => [...document.querySelectorAll("button,a,[role='button']")]
      .map((el, index) => {
        const rect = el.getBoundingClientRect();
        return {
          index,
          tag: el.tagName.toLowerCase(),
          text: (el.textContent || "").replace(/\\s+/g, " ").trim(),
          href: el.getAttribute("href") || "",
          aria: el.getAttribute("aria-label") || "",
          disabled: Boolean(el.disabled || el.getAttribute("aria-disabled") === "true"),
          visible: rect.width > 0 && rect.height > 0,
          x: Math.round(rect.left + rect.width / 2),
          y: Math.round(rect.top + rect.height / 2),
          w: Math.round(rect.width),
          h: Math.round(rect.height),
        };
      })
      .filter((item) => item.visible && !item.disabled)
      .slice(0, 80))()
    `
  );
}

async function clickSafeTargets(cdp, route, viewport) {
  if (process.env.ATP_AUDIT_INTERACTIONS !== "1") return [];
  const deny = /(remover|excluir|apagar|cancelar|sair|logout|marcar pago|publicar|enviar|confirmar|salvar|criar conta|google|wo|limpar resultado|inscrever-se|entrar por codigo|entrar por código)/i;
  const allow = /(inicio|competi|reservas|locais|perfil|explorar|ver |voltar|ranking|rankings|torneios|ligas|jogos|jogadores|classifica|chat|detalhes|abrir|ajustar filtros|limpar filtros)/i;
  const beforeHash = await evalJs(cdp, "location.hash");
  const targets = (await collectClickableSnapshot(cdp))
    .filter((item) => {
      const label = `${item.text} ${item.aria}`.trim();
      return label && allow.test(label) && !deny.test(label);
    })
    .slice(0, Number(process.env.ATP_AUDIT_INTERACTION_LIMIT || 10));
  const results = [];
  for (const target of targets) {
    const label = target.text || target.aria || `${target.tag}:${target.index}`;
    const startHash = await evalJs(cdp, "location.hash");
    const ok = await evalJs(
      cdp,
      `
      (() => {
        const el = [...document.querySelectorAll("button,a,[role='button']")][${target.index}];
        if (!el) return false;
        el.scrollIntoView({ block: "center", inline: "center" });
        el.click();
        return true;
      })()
      `
    );
    await sleep(900);
    const endHash = await evalJs(cdp, "location.hash");
    const h1 = await evalJs(
      cdp,
      `[...document.querySelectorAll("h1")].map((el) => el.textContent.trim()).filter(Boolean).slice(0, 2)`
    );
    results.push({
      viewport: viewport.name,
      route: route.slug,
      from: startHash,
      label,
      clicked: Boolean(ok),
      to: endHash,
      h1,
    });
    if (endHash !== beforeHash) {
      await navigate(cdp, route.hash);
    }
  }
  return results;
}

async function main() {
  if (!OUT_DIR.startsWith(path.join(ROOT, "docs", "screenshots"))) {
    throw new Error(`Diretorio de auditoria fora de docs/screenshots: ${OUT_DIR}`);
  }
  if (SHOULD_CLEAN_OUT_DIR) {
    await rm(OUT_DIR, { recursive: true, force: true });
  }
  await mkdir(OUT_DIR, { recursive: true });
  const port = 9222 + Math.floor(Math.random() * 1000);
  const userDataDir = await mkdtemp(path.join(os.tmpdir(), "atp-visual-audit-"));
  const chrome = spawn(chromePath(), [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    "--no-first-run",
    "--disable-gpu",
    "--hide-scrollbars=false",
    "--window-size=1440,980",
    "about:blank",
  ]);

  const meta = [];
  const routeDiagnostics = [];
  const interactionDiagnostics = [];
  const browserEvents = [];
  try {
    const target = await waitForDebug(port);
    const cdp = makeCdp(target.webSocketDebuggerUrl);
    await cdp.ready;
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Log.enable");
    await cdp.send("Network.enable");
    cdp.on("Runtime.consoleAPICalled", (params) => browserEvents.push(normalizeConsoleEvent(params)));
    cdp.on("Log.entryAdded", (params) => browserEvents.push(normalizeLogEntry(params)));
    cdp.on("Network.loadingFailed", (params) => browserEvents.push(normalizeNetworkFailure(params)));
    cdp.on("Network.responseReceived", (params) => {
      const item = normalizeNetworkResponse(params);
      if (item) browserEvents.push(item);
    });

    await setViewport(cdp, desktop);
    if (SHOULD_LOGIN) {
      await login(cdp);
    }

    for (const viewport of viewports) {
      await setViewport(cdp, viewport);
      for (const route of routes) {
        const eventStart = browserEvents.length;
        if (route.slug === "login") {
          await navigate(cdp, route.hash);
        } else {
          await navigate(cdp, route.hash);
        }
        const fileName = `${viewport.name}-${route.slug}.png`;
        await capture(cdp, path.join(OUT_DIR, fileName));
        const clickable = await collectClickableSnapshot(cdp);
        const pageEvents = browserEvents.slice(eventStart);
        const interactionResults = await clickSafeTargets(cdp, route, viewport);
        interactionDiagnostics.push(...interactionResults);
        const metaEntry = {
          viewport: viewport.name,
          route: route.slug,
          screenshot: fileName,
          diagnosticsFile: `${viewport.name}-${route.slug}.diagnostics.json`,
          interactionsFile: interactionResults.length ? `${viewport.name}-${route.slug}.interactions.json` : null,
          consoleErrorCount: pageEvents.filter((event) => /error|warning/i.test(event.level || "")).length,
          clickableCount: clickable.length,
          clickables: clickable.slice(0, 40),
          ...(await collectMeta(cdp)),
        };
        meta.push(metaEntry);
        const diagnostics = { viewport: viewport.name, route: route.slug, hash: metaEntry.hash, screenshot: fileName, events: pageEvents };
        routeDiagnostics.push(diagnostics);
        await writeFile(path.join(OUT_DIR, metaEntry.diagnosticsFile), JSON.stringify(diagnostics, null, 2));
        if (interactionResults.length) {
          await writeFile(path.join(OUT_DIR, metaEntry.interactionsFile), JSON.stringify(interactionResults, null, 2));
        }
      }
    }
    cdp.close();
  } finally {
    chrome.kill();
    await sleep(1000);
    try {
      await rm(userDataDir, { recursive: true, force: true });
    } catch (error) {
      console.warn(`Nao foi possivel remover perfil temporario do Chrome: ${userDataDir}`, error);
    }
  }
  await writeFile(path.join(OUT_DIR, "meta.json"), JSON.stringify(meta, null, 2));
  await writeFile(path.join(OUT_DIR, "diagnostics-summary.json"), JSON.stringify(routeDiagnostics, null, 2));
  await writeFile(path.join(OUT_DIR, "interactions-summary.json"), JSON.stringify(interactionDiagnostics, null, 2));
  console.log(OUT_DIR);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
