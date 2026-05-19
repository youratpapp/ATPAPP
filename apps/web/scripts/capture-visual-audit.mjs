import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const ROOT = process.cwd();
const APP_URL = process.env.APP_URL || "http://127.0.0.1:5173/";
const OUT_DIR = path.join(ROOT, "docs", "screenshots", "visual-local-audit-2026-05-18");
const LOGIN_EMAIL = process.env.ATP_EMAIL || "escalao@gmail.com";
const LOGIN_PASSWORD = process.env.ATP_PASSWORD || "Escalao@2026!";
const CHROME_PATHS = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];

const desktop = { name: "desktop", width: 1440, height: 980, deviceScaleFactor: 1, mobile: false };
const mobile = { name: "mobile", width: 390, height: 844, deviceScaleFactor: 2, mobile: true };

const routes = [
  { slug: "login", hash: "#/auth", public: true },
  { slug: "home", hash: "#/inicio" },
  { slug: "places-overview", hash: "#/locais" },
  { slug: "places-reserve", hash: "#/locais?intent=places" },
  { slug: "places-lessons", hash: "#/locais?intent=classes" },
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
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
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
  const height = Math.min(Math.ceil(contentSize.height), 4200);
  const screenshot = await cdp.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    fromSurface: true,
    clip: { x: 0, y: 0, width, height, scale: 1 },
  });
  await writeFile(filePath, Buffer.from(screenshot.data, "base64"));
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

async function main() {
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
  try {
    const target = await waitForDebug(port);
    const cdp = makeCdp(target.webSocketDebuggerUrl);
    await cdp.ready;
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");

    await setViewport(cdp, desktop);
    await login(cdp);

    for (const viewport of [desktop, mobile]) {
      await setViewport(cdp, viewport);
      for (const route of routes) {
        if (route.slug === "login") {
          await navigate(cdp, route.hash);
        } else {
          await navigate(cdp, route.hash);
        }
        const fileName = `${viewport.name}-${route.slug}.png`;
        await capture(cdp, path.join(OUT_DIR, fileName));
        meta.push({ viewport: viewport.name, route: route.slug, screenshot: fileName, ...(await collectMeta(cdp)) });
      }
    }
    cdp.close();
  } finally {
    chrome.kill();
  }
  await writeFile(path.join(OUT_DIR, "meta.json"), JSON.stringify(meta, null, 2));
  console.log(OUT_DIR);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
