import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const ROOT = process.cwd();
const APP_URL = normalizeAppUrl(process.env.APP_URL || "http://127.0.0.1:5180/");
const OUT_DIR = path.resolve(ROOT, process.env.ATP_ROLE_QA_OUT_DIR || "artifacts/role-smoke-audit");
const AUTH_DIR = path.resolve(ROOT, process.env.ATP_ROLE_QA_AUTH_DIR || "artifacts/saas-sprint-screens");
const PLACE_ID = process.env.ATP_ROLE_QA_PLACE_ID || "36b29d6c-fabb-475a-a059-47d5ece74a09";
const FINANCE_PLACE_ID = process.env.ATP_ROLE_QA_FINANCE_PLACE_ID || "487b9846-9739-4f42-bc5f-60ea0cb4d050";
const CHROME_PORT = Number(process.env.ATP_ROLE_QA_CHROME_PORT || 9335);
const CAPTURE_SCREENSHOTS = process.env.ATP_ROLE_QA_SCREENSHOTS !== "0";
const VIEWPORT_FILTER = (process.env.ATP_ROLE_QA_VIEWPORTS || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);
const ROLE_FILTER = (process.env.ATP_ROLE_QA_ROLES || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

const CHROME_PATHS = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
].filter(Boolean);

const viewports = [
  { name: "mobile-390", width: 390, height: 844, deviceScaleFactor: 2, mobile: true },
  { name: "mobile-430", width: 430, height: 932, deviceScaleFactor: 2, mobile: true },
  { name: "desktop-1366", width: 1366, height: 920, deviceScaleFactor: 1, mobile: false },
].filter((viewport) => !VIEWPORT_FILTER.length || VIEWPORT_FILTER.includes(viewport.name));

const roles = [
  {
    id: "coach",
    auth: "auth-coach.json",
    routes: [
      { name: "hoje", hash: `#/gestao/${PLACE_ID}/inicio`, must: ["Trabalho", "Aulas"] },
      { name: "academia", hash: `#/gestao/${PLACE_ID}/academia?visao=hoje`, must: ["Aulas do dia"] },
      { name: "agenda", hash: `#/gestao/${PLACE_ID}/agenda?visao=calendario`, must: ["Agenda"] },
    ],
  },
  {
    id: "frontdesk",
    auth: "auth-frontdesk.json",
    routes: [
      { name: "hoje", hash: `#/gestao/${PLACE_ID}/inicio`, must: ["Trabalho"] },
      { name: "agenda", hash: `#/gestao/${PLACE_ID}/agenda?visao=calendario`, must: ["Agenda", "Nova reserva"] },
      { name: "clientes", hash: `#/gestao/${PLACE_ID}/clientes?visao=clientes-ativos`, must: ["Clientes"] },
    ],
  },
  {
    id: "finance",
    auth: "auth-finance.json",
    routes: [
      { name: "receber", hash: `#/gestao/${FINANCE_PLACE_ID}/financeiro?visao=recebiveis`, must: ["Financeiro"] },
      { name: "pagos", hash: `#/gestao/${FINANCE_PLACE_ID}/financeiro?visao=pagos`, must: ["Pagos"] },
      { name: "resumo", hash: `#/gestao/${FINANCE_PLACE_ID}/financeiro?visao=resumo`, must: ["Resumo"] },
    ],
  },
  {
    id: "cashier",
    auth: "auth-cashier.json",
    routes: [
      { name: "vender", hash: `#/gestao/${FINANCE_PLACE_ID}/loja-pos?visao=vender`, must: ["Venda"] },
      { name: "estoque", hash: `#/gestao/${FINANCE_PLACE_ID}/loja-pos?visao=estoque`, must: ["Estoque"] },
      { name: "produtos", hash: `#/gestao/${FINANCE_PLACE_ID}/loja-pos?visao=produtos`, must: ["Produtos"] },
    ],
  },
  {
    id: "organizer",
    auth: "auth-organizer.json",
    routes: [
      { name: "competicoes", hash: "#/eventos?modo=organizing", must: ["Competicoes"] },
      { name: "torneios", hash: "#/eventos/torneios?view=organizing", must: ["Torneios"] },
      { name: "ligas", hash: "#/eventos/ligas?view=organizing", must: ["Ligas"] },
    ],
  },
  {
    id: "player-pure",
    auth: "auth-player-pure.json",
    routes: [
      { name: "inicio", hash: "#/inicio", must: ["Inicio"] },
      { name: "rotina", hash: "#/agenda", must: ["rotina", "Reservas"] },
      { name: "gestao-bloqueada", hash: "#/gestao", mustNot: ["Financeiro do local", "Equipe e permissoes"] },
    ],
  },
].filter((role) => !ROLE_FILTER.length || ROLE_FILTER.includes(role.id));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function normalizeAppUrl(value) {
  return value.endsWith("/") ? value : `${value}/`;
}

function safeJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function chromePath() {
  const found = CHROME_PATHS.find((candidate) => candidate && existsSync(candidate));
  if (!found) throw new Error("Chrome nao encontrado. Defina CHROME_PATH se necessario.");
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

async function waitFor(cdp, expression, timeoutMs = 25000) {
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
  await waitFor(
    cdp,
    `!/(Carregando|Entrando|Processando|Loading)/i.test(document.body.innerText || "")`,
    30000
  );
  await sleep(1200);
}

async function setViewport(cdp, viewport) {
  await cdp.send("Emulation.setDeviceMetricsOverride", viewport);
}

async function applyStorage(cdp, authFile) {
  await cdp.send("Page.navigate", { url: APP_URL });
  await waitFor(cdp, "document.readyState === 'complete'", 15000);
  const raw = await readFile(path.join(AUTH_DIR, authFile), "utf8");
  const state = JSON.parse(raw);
  const origin = state.origins?.[0];
  const entries = origin?.localStorage || [];
  const authEntry = entries.find((entry) => /auth-token/i.test(entry.name));
  const authPayload = authEntry ? safeJson(authEntry.value) : null;
  const expiresAt = authPayload?.expires_at || null;
  const expired = typeof expiresAt === "number" && expiresAt <= Math.floor(Date.now() / 1000) + 60;
  await evalJs(
    cdp,
    `
    (async () => {
      localStorage.clear();
      sessionStorage.clear();
      if (indexedDB.databases) {
        const databases = await indexedDB.databases();
        await Promise.all(databases.map((database) => database.name
          ? new Promise((resolve) => {
              const request = indexedDB.deleteDatabase(database.name);
              request.onsuccess = resolve;
              request.onerror = resolve;
              request.onblocked = resolve;
            })
          : Promise.resolve()
        ));
      }
      for (const item of ${JSON.stringify(entries)}) {
        localStorage.setItem(item.name, item.value);
      }
      return localStorage.length;
    })()
    `
  );
  return { expired, expiresAt };
}

async function navigate(cdp, hash) {
  await cdp.send("Page.navigate", { url: `${APP_URL}${hash}` });
  await waitForPageReady(cdp);
}

async function capture(cdp, filePath) {
  const screenshot = await cdp.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
  });
  await writeFile(filePath, Buffer.from(screenshot.data, "base64"));
}

async function inspectPage(cdp, route) {
  return evalJs(
    cdp,
    `
    (() => {
      const text = (document.body.innerText || "").replace(/\\s+/g, " ").trim();
      return {
        href: location.href,
        title: document.title,
        textStart: text.slice(0, 1200),
        hasLogin: /Entrar na ATP|Continuar com Google|E-MAIL SENHA/.test(text),
        hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 2,
        bodyWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
        checks: {
          must: ${(route.must || []).length}
            ? ${JSON.stringify(route.must || [])}.map((needle) => ({ needle, ok: text.toLowerCase().includes(String(needle).toLowerCase()) }))
            : [],
          mustNot: ${(route.mustNot || []).length}
            ? ${JSON.stringify(route.mustNot || [])}.map((needle) => ({ needle, ok: !text.toLowerCase().includes(String(needle).toLowerCase()) }))
            : [],
        },
      };
    })()
    `
  );
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const profileDir = await mkdtemp(path.join(os.tmpdir(), "atp-role-qa-"));
  const chrome = spawn(chromePath(), [
    `--remote-debugging-port=${CHROME_PORT}`,
    `--user-data-dir=${profileDir}`,
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "about:blank",
  ], { stdio: "ignore" });

  const results = [];
  if (!viewports.length) throw new Error("Nenhum viewport selecionado para QA.");
  if (!roles.length) throw new Error("Nenhum papel selecionado para QA.");
  try {
    const target = await waitForDebug(CHROME_PORT);
    const cdp = makeCdp(target.webSocketDebuggerUrl);
    await cdp.ready;
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");

    const consoleErrors = [];
    cdp.on("Runtime.exceptionThrown", (params) => {
      consoleErrors.push(params.exceptionDetails?.text || "Runtime exception");
    });

    for (const viewport of viewports) {
      await setViewport(cdp, viewport);
      for (const role of roles) {
        const stateExists = existsSync(path.join(AUTH_DIR, role.auth));
        if (!stateExists) {
          results.push({ viewport: viewport.name, role: role.id, stateExists, routes: [] });
          continue;
        }
        const authState = await applyStorage(cdp, role.auth);
        if (authState.expired) {
          results.push({
            viewport: viewport.name,
            role: role.id,
            stateExists,
            authExpired: true,
            expiresAt: authState.expiresAt,
            routes: role.routes.map((route) => ({
              name: route.name,
              hash: route.hash,
              skipped: "auth-expired",
              failedChecks: [],
              consoleErrors: [],
            })),
          });
          continue;
        }
        const routeResults = [];
        for (const route of role.routes) {
          consoleErrors.length = 0;
          await navigate(cdp, route.hash);
          const info = await inspectPage(cdp, route);
          const failedChecks = [
            ...info.checks.must.filter((check) => !check.ok).map((check) => `faltou: ${check.needle}`),
            ...info.checks.mustNot.filter((check) => !check.ok).map((check) => `nao deveria aparecer: ${check.needle}`),
          ];
          const screenshotName = `${viewport.name}-${role.id}-${route.name}.png`;
          if (CAPTURE_SCREENSHOTS) {
            await capture(cdp, path.join(OUT_DIR, screenshotName));
          }
          routeResults.push({
            name: route.name,
            hash: route.hash,
            href: info.href,
            title: info.title,
            hasLogin: info.hasLogin,
            hasHorizontalOverflow: info.hasHorizontalOverflow,
            failedChecks,
            consoleErrors: [...consoleErrors],
            screenshot: CAPTURE_SCREENSHOTS ? screenshotName : null,
            textStart: info.textStart,
          });
        }
        results.push({ viewport: viewport.name, role: role.id, stateExists, routes: routeResults });
      }
    }
    cdp.close();
  } finally {
    chrome.kill();
    await sleep(500);
    await rm(profileDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 250 }).catch(() => undefined);
  }

  const flatRoutes = results.flatMap((roleResult) => roleResult.routes || []);
  const skippedRoutes = flatRoutes.filter((route) => route.skipped);
  const executedRoutes = flatRoutes.filter((route) => !route.skipped);
  const failures = executedRoutes.filter((route) =>
    route.hasLogin || route.hasHorizontalOverflow || route.failedChecks.length || route.consoleErrors.length
  );
  const report = {
    generatedAt: new Date().toISOString(),
    appUrl: APP_URL,
    authDir: AUTH_DIR,
    outDir: OUT_DIR,
    summary: `${executedRoutes.length - failures.length}/${executedRoutes.length} rotas executadas aceitas; ${skippedRoutes.length} puladas`,
    skippedRoutes,
    failures,
    results,
  };
  await writeFile(path.join(OUT_DIR, "role-smoke-report.json"), JSON.stringify(report, null, 2), "utf8");
  console.log(report.summary);
  if (failures.length) {
    console.log(JSON.stringify(failures.map((failure) => ({
      name: failure.name,
      href: failure.href,
      failedChecks: failure.failedChecks,
      hasLogin: failure.hasLogin,
      hasHorizontalOverflow: failure.hasHorizontalOverflow,
      consoleErrors: failure.consoleErrors,
    })), null, 2));
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
