import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const ROOT = process.cwd();
const APP_URL = normalizeUrl(process.env.APP_URL || "http://127.0.0.1:5180/");
const OUT_DIR = path.resolve(ROOT, process.env.ATP_DEEP_SWEEP_OUT_DIR || "artifacts/deep-product-sweep-2026-05-24");
const LOGIN_EMAIL = process.env.ATP_EMAIL || "escalao@gmail.com";
const LOGIN_PASSWORD = process.env.ATP_PASSWORD || "Escalao@2026!";
const SHOULD_LOGIN = process.env.ATP_SWEEP_SKIP_LOGIN !== "1";
const CAPTURE_SCREENSHOTS = process.env.ATP_SWEEP_SCREENSHOTS !== "0";
const CLICK_SAFE_TARGETS = process.env.ATP_SWEEP_CLICK_SAFE !== "0";
const ROUTE_FILTER = splitEnv("ATP_SWEEP_ROUTES");
const VIEWPORT_FILTER = splitEnv("ATP_SWEEP_VIEWPORTS");
const MAX_SAFE_CLICKS = Number(process.env.ATP_SWEEP_CLICK_LIMIT || 14);

const PLACE_ID = process.env.ATP_SWEEP_PLACE_ID || "36b29d6c-fabb-475a-a059-47d5ece74a09";
const FINANCE_PLACE_ID = process.env.ATP_SWEEP_FINANCE_PLACE_ID || "487b9846-9739-4f42-bc5f-60ea0cb4d050";
const TOURNAMENT_ID = process.env.ATP_SWEEP_TOURNAMENT_ID || "1a2c0053-d9f8-4458-8868-2f66886f3e52";
const LEAGUE_ID = process.env.ATP_SWEEP_LEAGUE_ID || "c3c638c5-0c85-4834-a639-bf26d2e4b5b3";

const CHROME_PATHS = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
].filter(Boolean);

const viewports = [
  { name: "desktop-1366", width: 1366, height: 920, deviceScaleFactor: 1, mobile: false },
  { name: "desktop-wide", width: 1600, height: 1000, deviceScaleFactor: 1, mobile: false },
  { name: "mobile-430", width: 430, height: 932, deviceScaleFactor: 2, mobile: true },
].filter((viewport) => !VIEWPORT_FILTER.length || VIEWPORT_FILTER.includes(viewport.name));

const routes = [
  route("player-inicio", "#/inicio", "Player"),
  route("player-jogar-overview", "#/locais", "Player"),
  route("player-jogar-reservar", "#/locais?intent=places", "Player"),
  route("player-jogar-aulas", "#/locais?intent=classes", "Player"),
  route("player-jogar-partidas", "#/locais?intent=matches", "Player"),
  route("player-local-publico", `#/locais/${PLACE_ID}`, "Player"),
  route("player-local-publico-reservas", `#/locais/${PLACE_ID}/reservas`, "Player"),
  route("player-competir", "#/eventos", "Player"),
  route("player-torneios", "#/eventos/torneios", "Player"),
  route("player-ligas", "#/eventos/ligas", "Player"),
  route("player-inscricao-torneio", `#/inscricao/${TOURNAMENT_ID}`, "Player"),
  route("player-agenda-tudo", "#/agenda", "Player"),
  route("player-agenda-reservas", "#/agenda?tipo=reservas", "Player"),
  route("player-agenda-aulas", "#/agenda?tipo=aulas", "Player"),
  route("player-agenda-pagamentos", "#/agenda?tipo=pagamentos", "Player"),
  route("player-ranking", "#/ranking", "Player"),
  route("player-perfil", "#/perfil", "Player"),
  route("work-central", "#/gestao", "Work"),
  route("work-inicio", `#/gestao/${PLACE_ID}/inicio`, "Work"),
  route("work-agenda-dia", `#/gestao/${PLACE_ID}/agenda?visao=calendario`, "Work"),
  route("work-agenda-reservas", `#/gestao/${PLACE_ID}/agenda?visao=reservas`, "Work"),
  route("work-agenda-nova-reserva", `#/gestao/${PLACE_ID}/agenda?visao=nova-reserva`, "Work"),
  route("work-agenda-ajustes", `#/gestao/${PLACE_ID}/agenda?visao=ajustes`, "Work"),
  route("work-academia-hoje", `#/gestao/${PLACE_ID}/academia?visao=hoje`, "Work"),
  route("work-academia-calendario", `#/gestao/${PLACE_ID}/academia?visao=calendario`, "Work"),
  route("work-academia-turmas", `#/gestao/${PLACE_ID}/academia?visao=turmas`, "Work"),
  route("work-academia-alunos", `#/gestao/${PLACE_ID}/academia?visao=alunos`, "Work"),
  route("work-academia-pendencias", `#/gestao/${PLACE_ID}/academia?visao=pendencias`, "Work"),
  route("work-clientes-ativos", `#/gestao/${PLACE_ID}/clientes?visao=clientes-ativos`, "Work"),
  route("work-clientes-leads", `#/gestao/${PLACE_ID}/clientes?visao=leads`, "Work"),
  route("work-clientes-rotina", `#/gestao/${PLACE_ID}/clientes?visao=rotina`, "Work"),
  route("work-financeiro-recebiveis", `#/gestao/${FINANCE_PLACE_ID}/financeiro?visao=recebiveis`, "Work"),
  route("work-financeiro-pagos", `#/gestao/${FINANCE_PLACE_ID}/financeiro?visao=pagos`, "Work"),
  route("work-financeiro-despesas", `#/gestao/${FINANCE_PLACE_ID}/financeiro?visao=despesas`, "Work"),
  route("work-financeiro-planos", `#/gestao/${FINANCE_PLACE_ID}/financeiro?visao=planos`, "Work"),
  route("work-financeiro-resumo", `#/gestao/${FINANCE_PLACE_ID}/financeiro?visao=resumo`, "Work"),
  route("work-pos-vender", `#/gestao/${FINANCE_PLACE_ID}/loja-pos?visao=vender`, "Work"),
  route("work-pos-estoque", `#/gestao/${FINANCE_PLACE_ID}/loja-pos?visao=estoque`, "Work"),
  route("work-pos-produtos", `#/gestao/${FINANCE_PLACE_ID}/loja-pos?visao=produtos`, "Work"),
  route("work-comunicacao", `#/gestao/${PLACE_ID}/comunicacao`, "Work"),
  route("work-relatorios", `#/gestao/${PLACE_ID}/relatorios`, "Work"),
  route("work-equipe-resumo", `#/gestao/${PLACE_ID}/equipe?visao=resumo`, "Work"),
  route("work-equipe-staff", `#/gestao/${PLACE_ID}/equipe?visao=equipe`, "Work"),
  route("work-equipe-convites", `#/gestao/${PLACE_ID}/equipe?visao=convites`, "Work"),
  route("work-admin-checklist", `#/gestao/${PLACE_ID}/administracao?visao=checklist`, "Work"),
  route("work-admin-publico", `#/gestao/${PLACE_ID}/administracao?visao=dados-publicos`, "Work"),
  route("work-admin-recursos", `#/gestao/${PLACE_ID}/administracao?visao=recursos`, "Work"),
  route("work-admin-regras", `#/gestao/${PLACE_ID}/administracao?visao=regras`, "Work"),
  route("competition-os", "#/eventos?modo=organizing", "Competition OS"),
  route("competition-torneios-work", "#/eventos/torneios?view=organizing", "Competition OS"),
  route("competition-ligas-work", "#/eventos/ligas?view=organizing", "Competition OS"),
  route("tournament-jogos", `#/eventos/${TOURNAMENT_ID}/jogos`, "Competition OS"),
  route("tournament-jogadores", `#/eventos/${TOURNAMENT_ID}/jogadores`, "Competition OS"),
  route("tournament-classificacao", `#/eventos/${TOURNAMENT_ID}/classificacao`, "Competition OS"),
  route("tournament-organizacao", `#/eventos/${TOURNAMENT_ID}/organizacao`, "Competition OS"),
  route("tournament-chat", `#/eventos/${TOURNAMENT_ID}/chat`, "Competition OS"),
  route("league-detail", `#/eventos/ligas/${LEAGUE_ID}`, "Competition OS"),
  route("league-chat", `#/eventos/ligas/${LEAGUE_ID}?tab=chat`, "Competition OS"),
].filter((item) => !ROUTE_FILTER.length || ROUTE_FILTER.includes(item.slug));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function route(slug, hash, surface) {
  return { slug, hash, surface };
}

function splitEnv(name) {
  return (process.env[name] || "").split(",").map((item) => item.trim()).filter(Boolean);
}

function normalizeUrl(value) {
  return value.endsWith("/") ? value : `${value}/`;
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
  await sleep(1600);
}

async function setViewport(cdp, viewport) {
  await cdp.send("Emulation.setDeviceMetricsOverride", viewport);
}

async function navigate(cdp, hash) {
  await cdp.send("Page.navigate", { url: `${APP_URL}${hash}` });
  await waitForPageReady(cdp);
}

async function login(cdp) {
  await navigate(cdp, "#/auth");
  const filled = await evalJs(
    cdp,
    `
    (() => {
      const setNativeValue = (el, value) => {
        if (!el) return false;
        const proto = Object.getPrototypeOf(el);
        const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
        descriptor.set.call(el, value);
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
        return true;
      };
      const email = document.querySelector('input[type="email"]');
      const password = document.querySelector('input[type="password"]');
      const button = [...document.querySelectorAll("button")].find((btn) => /Entrar/i.test(btn.textContent || ""));
      const ok = setNativeValue(email, ${JSON.stringify(LOGIN_EMAIL)})
        && setNativeValue(password, ${JSON.stringify(LOGIN_PASSWORD)})
        && Boolean(button);
      if (ok) button.click();
      return ok;
    })()
    `
  );
  if (!filled) throw new Error("Nao foi possivel preencher login.");
  await waitFor(cdp, "!location.hash.includes('/auth')", 30000);
  await waitForPageReady(cdp);
}

async function capture(cdp, filePath) {
  const metrics = await cdp.send("Page.getLayoutMetrics");
  const contentSize = metrics.cssContentSize || metrics.contentSize;
  const maxHeight = Number(process.env.ATP_SWEEP_MAX_SCREENSHOT_HEIGHT || 4200);
  const screenshot = await cdp.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    fromSurface: true,
    clip: {
      x: 0,
      y: 0,
      width: Math.ceil(contentSize.width),
      height: Math.min(Math.ceil(contentSize.height), maxHeight),
      scale: 1,
    },
  });
  await writeFile(filePath, Buffer.from(screenshot.data, "base64"));
}

function normalizeConsoleEvent(params) {
  const args = (params.args || [])
    .map((arg) => typeof arg.value !== "undefined" ? String(arg.value) : String(arg.description || ""))
    .filter(Boolean);
  return {
    source: "console",
    level: params.type || "log",
    text: args.join(" "),
    url: params.stackTrace?.callFrames?.[0]?.url || "",
  };
}

function normalizeLogEntry(params) {
  const entry = params.entry || {};
  return {
    source: "log",
    level: entry.level || "info",
    text: entry.text || "",
    url: entry.url || "",
  };
}

function normalizeNetworkResponse(params) {
  const status = params.response?.status;
  if (!status || status < 400) return null;
  return {
    source: "network",
    level: status >= 500 ? "error" : "warning",
    text: `${status} ${params.response.statusText || ""}`.trim(),
    url: params.response.url || "",
  };
}

async function inspectPage(cdp) {
  return evalJs(
    cdp,
    `
    (() => {
      const text = (document.body.innerText || "").replace(/\\s+/g, " ").trim();
      const rgb = (value) => {
        const match = String(value || "").match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/);
        return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null;
      };
      const luminance = (color) => {
        if (!color) return null;
        const channel = color.map((part) => {
          const v = part / 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * channel[0] + 0.7152 * channel[1] + 0.0722 * channel[2];
      };
      const contrast = (fg, bg) => {
        const l1 = luminance(fg);
        const l2 = luminance(bg);
        if (l1 == null || l2 == null) return null;
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
      };
      const selector = "button,a,[role='button'],input,select,textarea,[tabindex]:not([tabindex='-1'])";
      const elements = [...document.querySelectorAll(selector)].map((el, index) => {
        const rect = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        const label = (el.innerText || el.value || el.getAttribute("aria-label") || el.getAttribute("placeholder") || el.getAttribute("title") || "").replace(/\\s+/g, " ").trim();
        const bg = rgb(style.backgroundColor);
        const fg = rgb(style.color);
        return {
          index,
          tag: el.tagName.toLowerCase(),
          type: el.getAttribute("type") || "",
          role: el.getAttribute("role") || "",
          text: label,
          href: el.getAttribute("href") || "",
          disabled: Boolean(el.disabled || el.getAttribute("aria-disabled") === "true"),
          visible: rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none",
          rect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) },
          className: String(el.className || "").slice(0, 160),
          contrast: contrast(fg, bg),
          textOverflow: el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 2,
          smallTarget: rect.width > 0 && rect.height > 0 && (rect.width < 36 || rect.height < 30),
          aboveFold: rect.top >= 0 && rect.top < window.innerHeight,
        };
      }).filter((item) => item.visible);
      const labelGroups = elements
        .filter((item) => item.text && !item.disabled)
        .reduce((acc, item) => {
          const key = item.text.toLowerCase();
          acc[key] = acc[key] || [];
          acc[key].push(item);
          return acc;
        }, {});
      const duplicateLabels = Object.entries(labelGroups)
        .filter(([, items]) => items.length > 2)
        .map(([label, items]) => ({ label, count: items.length, samples: items.slice(0, 5).map((item) => item.rect) }));
      const headings = [...document.querySelectorAll("h1,h2,h3")].map((el) => ({
        tag: el.tagName.toLowerCase(),
        text: (el.textContent || "").replace(/\\s+/g, " ").trim(),
        rect: (() => {
          const rect = el.getBoundingClientRect();
          return { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) };
        })(),
      })).filter((item) => item.text);
      const firstFoldTextLength = [...document.body.querySelectorAll("*")]
        .filter((el) => {
          const rect = el.getBoundingClientRect();
          return rect.top >= 0 && rect.top < window.innerHeight && rect.width > 0 && rect.height > 0;
        })
        .map((el) => el.childNodes.length === 1 ? (el.textContent || "") : "")
        .join(" ")
        .replace(/\\s+/g, " ")
        .trim()
        .length;
      return {
        href: location.href,
        hash: location.hash,
        title: document.title,
        h1: headings.filter((item) => item.tag === "h1").map((item) => item.text),
        headings: headings.slice(0, 24),
        textStart: text.slice(0, 1400),
        hasLogin: /Entrar na ATP|Continuar com Google|E-MAIL SENHA/.test(text),
        hasLoadingText: /(Carregando|Entrando|Processando|Loading)/i.test(text),
        hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 2,
        bodyWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
        bodyHeight: document.documentElement.scrollHeight,
        firstFoldTextLength,
        elements,
        duplicateLabels,
        controls: elements.filter((item) => ["input", "select", "textarea"].includes(item.tag)),
        buttons: elements.filter((item) => item.tag === "button" || item.role === "button" || item.tag === "a"),
        possibleIssues: [
          ...(document.documentElement.scrollWidth > window.innerWidth + 2 ? ["overflow-horizontal"] : []),
          ...(!headings.some((item) => item.tag === "h1") ? ["sem-h1"] : []),
          ...(elements.some((item) => item.textOverflow) ? ["texto-cortado-em-controle"] : []),
          ...(elements.some((item) => item.smallTarget) ? ["alvo-click-pequeno"] : []),
          ...(duplicateLabels.length ? ["labels-duplicados"] : []),
          ...(firstFoldTextLength < 120 ? ["primeira-dobra-pobre"] : []),
        ],
      };
    })()
    `
  );
}

async function clickSafeTargets(cdp, routeInfo, viewportName) {
  if (!CLICK_SAFE_TARGETS) return [];
  const clickables = await evalJs(
    cdp,
    `
    (() => [...document.querySelectorAll("button,a,[role='button']")].map((el, index) => {
      const rect = el.getBoundingClientRect();
      return {
        index,
        text: (el.innerText || el.getAttribute("aria-label") || el.getAttribute("title") || "").replace(/\\s+/g, " ").trim(),
        href: el.getAttribute("href") || "",
        disabled: Boolean(el.disabled || el.getAttribute("aria-disabled") === "true"),
        visible: rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.top < window.innerHeight,
      };
    }).filter((item) => item.visible && !item.disabled))()
    `
  );
  const allow = /(dia|semana|lista|remarc|canceladas|conflitos|todos|torneios|ligas|rankings|ativos|leads|recebiveis|pagos|despesas|planos|resumo|estoque|produtos|clientes|turmas|alunos|pendencias|abrir|ver|voltar|filtros|limpar|detalhe|agenda|perfil|historico|preferencias|conta)/i;
  const deny = /(excluir|remover|apagar|cancelar reserva|salvar|confirmar|pagar|marcar pago|publicar|enviar|criar|nova reserva|novo cliente|registrar pagamento|vender|recusar|aceitar|sair|logout|google|whatsapp|wo|deletar)/i;
  const targets = clickables
    .filter((item) => {
      const label = `${item.text} ${item.href}`.trim();
      return label && allow.test(label) && !deny.test(label);
    })
    .slice(0, MAX_SAFE_CLICKS);
  const results = [];
  const originalHash = await evalJs(cdp, "location.hash");
  for (const target of targets) {
    const before = await evalJs(cdp, "location.hash");
    const label = target.text || target.href || `clickable-${target.index}`;
    const clicked = await evalJs(
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
    ).catch(() => false);
    await sleep(900);
    const after = await inspectPage(cdp).catch((error) => ({ error: error.message }));
    results.push({
      viewport: viewportName,
      route: routeInfo.slug,
      label,
      clicked: Boolean(clicked),
      from: before,
      to: after.hash || null,
      issueAfterClick: after.possibleIssues || [],
      hasLoginAfterClick: Boolean(after.hasLogin),
      error: after.error || null,
    });
    if (after.hash && after.hash !== originalHash) {
      await navigate(cdp, routeInfo.hash);
    }
  }
  return results;
}

function summarizeIssues(page, pageEvents, interactionResults) {
  const errors = pageEvents.filter((event) => /error|warning/i.test(event.level || ""));
  return [
    ...page.possibleIssues.map((issue) => ({ type: issue, severity: issue === "overflow-horizontal" ? "alta" : "media" })),
    ...(page.hasLogin ? [{ type: "caiu-login", severity: "alta" }] : []),
    ...(errors.length ? [{ type: "console-ou-network", severity: "alta", count: errors.length }] : []),
    ...(interactionResults.some((item) => item.error || item.hasLoginAfterClick) ? [{ type: "clique-seguro-quebrou-contexto", severity: "alta" }] : []),
  ];
}

async function main() {
  if (!viewports.length) throw new Error("Nenhum viewport selecionado.");
  if (!routes.length) throw new Error("Nenhuma rota selecionada.");
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });
  const port = 9400 + Math.floor(Math.random() * 500);
  const profileDir = await mkdtemp(path.join(os.tmpdir(), "atp-deep-sweep-"));
  const chrome = spawn(chromePath(), [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-gpu",
    "about:blank",
  ], { stdio: "ignore" });

  const allResults = [];
  const allInteractions = [];
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
    cdp.on("Network.responseReceived", (params) => {
      const item = normalizeNetworkResponse(params);
      if (item) browserEvents.push(item);
    });

    if (SHOULD_LOGIN) {
      await setViewport(cdp, viewports.find((item) => !item.mobile) || viewports[0]);
      await login(cdp);
    }

    for (const viewport of viewports) {
      await setViewport(cdp, viewport);
      for (const routeInfo of routes) {
        const eventStart = browserEvents.length;
        await navigate(cdp, routeInfo.hash);
        const page = await inspectPage(cdp);
        const screenshotName = `${viewport.name}-${routeInfo.slug}.png`;
        if (CAPTURE_SCREENSHOTS) {
          await capture(cdp, path.join(OUT_DIR, screenshotName));
        }
        const interactionResults = await clickSafeTargets(cdp, routeInfo, viewport.name);
        allInteractions.push(...interactionResults);
        const pageEvents = browserEvents.slice(eventStart);
        const result = {
          route: routeInfo,
          viewport: viewport.name,
          screenshot: CAPTURE_SCREENSHOTS ? screenshotName : null,
          summary: {
            href: page.href,
            h1: page.h1,
            possibleIssues: summarizeIssues(page, pageEvents, interactionResults),
            buttonCount: page.buttons.length,
            controlCount: page.controls.length,
            duplicateLabels: page.duplicateLabels,
            consoleIssues: pageEvents.filter((event) => /error|warning/i.test(event.level || "")),
          },
          page,
          interactions: interactionResults,
        };
        allResults.push(result);
        await writeFile(path.join(OUT_DIR, `${viewport.name}-${routeInfo.slug}.json`), JSON.stringify(result, null, 2), "utf8");
      }
    }
    cdp.close();
  } finally {
    chrome.kill();
    await sleep(700);
    await rm(profileDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 250 }).catch(() => undefined);
  }

  const issues = allResults.flatMap((result) => result.summary.possibleIssues.map((issue) => ({
    viewport: result.viewport,
    route: result.route.slug,
    surface: result.route.surface,
    screenshot: result.screenshot,
    ...issue,
  })));
  const report = {
    generatedAt: new Date().toISOString(),
    appUrl: APP_URL,
    outDir: OUT_DIR,
    routeCount: routes.length,
    viewportCount: viewports.length,
    pageRuns: allResults.length,
    issueCount: issues.length,
    issueSummary: issues.reduce((acc, issue) => {
      acc[issue.type] = (acc[issue.type] || 0) + 1;
      return acc;
    }, {}),
    issues,
    interactions: allInteractions,
    results: allResults.map((result) => ({
      route: result.route,
      viewport: result.viewport,
      screenshot: result.screenshot,
      summary: result.summary,
    })),
  };
  await writeFile(path.join(OUT_DIR, "deep-product-sweep-report.json"), JSON.stringify(report, null, 2), "utf8");
  console.log(`${report.pageRuns} paginas/viewport auditadas`);
  console.log(`${report.issueCount} achados`);
  console.log(OUT_DIR);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
