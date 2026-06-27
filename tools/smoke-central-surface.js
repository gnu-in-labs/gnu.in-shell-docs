#!/usr/bin/env node
"use strict";

const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");

function loadPlaywright() {
  const candidates = [
    "playwright",
    process.env.PLAYWRIGHT_MODULE,
    path.join(os.homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright")
  ].filter(Boolean);

  const errors = [];
  for (const candidate of candidates) {
    try {
      return require(candidate);
    } catch (error) {
      errors.push(`${candidate}: ${error && error.message ? error.message : String(error)}`);
    }
  }

  console.error("Playwright is required. Install it locally or set PLAYWRIGHT_MODULE.");
  console.error(errors.join("\n"));
  process.exit(2);
}

const { chromium } = loadPlaywright();

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = process.env.OUT_DIR || path.join(ROOT, "artifacts", "central-smoke");

const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 900 },
  { name: "mobile-393", width: 393, height: 852 }
];

const FORBIDDEN_BODY_COPY = [
  /\bQML\b/i,
  /\bdemo\b/i,
  /Démo/i,
  /Auto-demo/i,
  /Current Work/i,
  /frontier/i,
  /wireframe/i,
  /pasted/i
];

const REQUIRED_COPY = [
  "CENTRAL",
  // The Guided Tour console renamed the old "Auto-preview" playback to "Visite complète" (the
  // default scenario). Assert the current label so the gate tracks the delivered Central.
  "Visite complète",
  "Gnosis"
];

const MIME = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

function urlPath(file) {
  return `/${file.split("/").map(encodeURIComponent).join("/")}`;
}

function startServer() {
  const server = http.createServer((req, res) => {
    let pathname = "/";
    try {
      pathname = decodeURIComponent(new URL(req.url, "http://127.0.0.1").pathname);
    } catch {
      res.writeHead(400);
      res.end("bad request");
      return;
    }

    const relative = pathname === "/" ? "/Gnu.In-Shell - Index.dc.html" : pathname;
    const filePath = path.normalize(path.join(ROOT, relative));
    if (!filePath.startsWith(ROOT + path.sep)) {
      res.writeHead(403);
      res.end("forbidden");
      return;
    }

    fs.readFile(filePath, (error, data) => {
      if (error) {
        res.writeHead(404);
        res.end("not found");
        return;
      }
      res.writeHead(200, { "content-type": MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream" });
      res.end(data);
    });
  });

  return new Promise((resolve, reject) => {
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolve({ server, origin: `http://127.0.0.1:${address.port}` });
    });
  });
}

async function openControl(page) {
  const control = page.locator(".cx-btn", { hasText: "Control" }).first();
  if (!(await control.count())) return false;
  await control.click({ timeout: 5000 });
  await page.waitForTimeout(350);
  return true;
}

async function clickControlSection(page, label) {
  const section = page.locator(".cx-btn", { hasText: label }).first();
  if (!(await section.count())) return false;
  await section.click({ timeout: 5000 });
  await page.waitForTimeout(250);
  return true;
}

async function textVisible(page, pattern) {
  const locator = page.getByText(pattern).first();
  return (await locator.count()) > 0 && await locator.isVisible().catch(() => false);
}

async function openContextMenu(page) {
  const monitor = page.locator("#cx-monitor").first();
  if (!(await monitor.count())) return false;
  const box = await monitor.boundingBox();
  if (!box) return false;
  await page.mouse.click(box.x + box.width * 0.45, box.y + box.height * 0.42, { button: "right" });
  await page.waitForTimeout(900);
  return true;
}

async function runJourney(page) {
  const journey = {
    controlOpen: await openControl(page),
    panelFamily: false,
    compositor: false,
    displays: false,
    input: false,
    services: false,
    developer: false,
    agenticMenu: false
  };

  if (journey.controlOpen) {
    // The shell-aesthetic "panel family" treatment lives under the Général section (sec='general'),
    // not the default-open control view, so navigate there first before asserting it — same pattern
    // as the other journey steps, which each click into their section before checking.
    if (await clickControlSection(page, "Général")) journey.panelFamily = await textVisible(page, /panel family/i);
    if (await clickControlSection(page, "Compositor")) journey.compositor = await textVisible(page, /Portal session/i);
    if (await clickControlSection(page, "Displays")) journey.displays = await textVisible(page, /sortie eDP-1/i);
    if (await clickControlSection(page, "Input")) journey.input = await textVisible(page, /clavier/i);
    if (await clickControlSection(page, "Services")) journey.services = await textVisible(page, /services de session/i);
    if (await clickControlSection(page, "Developer")) journey.developer = await textVisible(page, /Build/i);
  }

  await page.keyboard.press("Escape");
  await page.waitForTimeout(350);
  if (await openContextMenu(page)) {
    journey.agenticMenu = await textVisible(page, /Actions sugg/i) || await textVisible(page, /Gnosis/i);
  }
  await page.keyboard.press("Tab");
  await page.waitForTimeout(80);
  return journey;
}

async function captureState(page, status, viewport, pageErrors) {
  return page.evaluate(async ({ status, viewport, patterns, required }) => {
    const html = document.documentElement;
    const body = document.body;
    const rendered = body.innerText || body.textContent || "";
    const regexes = patterns.map((pattern) => new RegExp(pattern.source, pattern.flags));
    const forbidden = regexes.filter((regex) => regex.test(rendered)).map((regex) => regex.toString());
    const icon = document.querySelector("link[rel~='icon']")?.getAttribute("href") || "";
    let iconStatus = null;
    try {
      iconStatus = await fetch(new URL(icon, location.href)).then((response) => response.status);
    } catch (error) {
      iconStatus = error && error.message ? error.message : String(error);
    }

    const nav = document.getElementById("gid-nav");
    const rail = document.getElementById("gid-rail");
    const monitor = document.getElementById("cx-monitor");
    const brokenImages = [...document.images]
      .filter((img) => !img.complete || img.naturalWidth === 0)
      .map((img) => img.currentSrc || img.src || img.alt);
    const firstFocus = document.activeElement && document.activeElement !== body
      ? document.activeElement
      : document.querySelector("#gid-nav a[href], #gid-rail button, .cx-btn, input");
    const focusStyle = firstFocus ? getComputedStyle(firstFocus) : null;

    const monitorRect = monitor ? monitor.getBoundingClientRect() : null;
    return {
      viewport: viewport.name,
      status,
      title: document.title,
      requiredTextMissing: required.filter((item) => !rendered.includes(item)),
      forbidden,
      icon,
      iconStatus,
      navExists: Boolean(nav),
      railExists: Boolean(rail),
      monitorExists: Boolean(monitor),
      monitorRect: monitorRect && {
        width: Math.round(monitorRect.width),
        height: Math.round(monitorRect.height),
        top: Math.round(monitorRect.top),
        left: Math.round(monitorRect.left)
      },
      overflowX: Math.max(html.scrollWidth, body.scrollWidth) - html.clientWidth,
      brokenImages,
      focusOutline: firstFocus ? {
        outlineWidth: focusStyle.outlineWidth,
        outlineStyle: focusStyle.outlineStyle,
        outlineOffset: focusStyle.outlineOffset
      } : null
    };
  }, {
    status,
    viewport,
    patterns: FORBIDDEN_BODY_COPY.map((regex) => ({ source: regex.source, flags: regex.flags })),
    required: REQUIRED_COPY
  }).then((state) => {
    state.pageErrors = pageErrors.slice();
    return state;
  });
}

function validate(state) {
  const issues = [];
  if (state.status !== 200) issues.push(`status=${state.status}`);
  if (state.requiredTextMissing.length) issues.push(`missingText=${state.requiredTextMissing.join(",")}`);
  if (state.forbidden.length) issues.push(`forbidden=${state.forbidden.join(",")}`);
  if (state.icon !== "assets/symbols/cube.svg" || state.iconStatus !== 200) issues.push(`icon=${state.icon} status=${state.iconStatus}`);
  if (!state.navExists || !state.railExists) issues.push(`nav=${state.navExists} rail=${state.railExists}`);
  if (!state.monitorExists || !state.monitorRect || state.monitorRect.width < 260 || state.monitorRect.height < 160) {
    issues.push(`monitor=${JSON.stringify(state.monitorRect)}`);
  }
  if (state.overflowX > 1) issues.push(`overflowX=${state.overflowX}`);
  if (state.brokenImages.length) issues.push(`brokenImages=${state.brokenImages.join(",")}`);
  if (!state.focusOutline || parseFloat(state.focusOutline.outlineWidth) < 2) {
    issues.push(`focus=${JSON.stringify(state.focusOutline)}`);
  }
  if (!state.journey || !state.journey.controlOpen) issues.push("journey=controlOpen");
  if (state.journey) {
    for (const key of ["panelFamily", "compositor", "displays", "input", "services", "developer", "agenticMenu"]) {
      if (!state.journey[key]) issues.push(`journey=${key}`);
    }
  }
  if (state.pageErrors.length) issues.push(`pageErrors=${state.pageErrors.join(" | ")}`);
  return issues;
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const { server, origin } = await startServer();
  const browser = await chromium.launch();
  const results = [];

  try {
    for (const viewport of VIEWPORTS) {
      const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
      await context.addInitScript(() => {
        try { localStorage.clear(); } catch {}
      });
      const page = await context.newPage();
      const pageErrors = [];
      page.on("pageerror", (error) => pageErrors.push(error.message || String(error)));
      const response = await page.goto(`${origin}${urlPath("Central.dc.html")}`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(900);
      const journey = await runJourney(page);
      const state = await captureState(page, response ? response.status() : 0, viewport, pageErrors);
      state.journey = journey;
      state.issues = validate(state);
      results.push(state);
      await page.screenshot({ path: path.join(OUT_DIR, `${viewport.name}-central.png`), fullPage: false });
      await context.close();
    }
  } finally {
    await browser.close();
    server.close();
  }

  fs.writeFileSync(path.join(OUT_DIR, "central-smoke-results.json"), JSON.stringify(results, null, 2));

  const failures = results.filter((result) => result.issues.length);
  for (const result of results) {
    const label = `${result.viewport} Central.dc.html`;
    if (result.issues.length) console.error(`FAIL ${label}: ${result.issues.join("; ")}`);
    else console.log(`PASS ${label}`);
  }

  if (failures.length) process.exit(1);
})().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
