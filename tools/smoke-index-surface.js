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

  console.error("Playwright is required. Install it locally or set PLAYWRIGHT_MODULE to its module path.");
  console.error(errors.join("\n"));
  process.exit(2);
}

const { chromium } = loadPlaywright();

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = process.env.OUT_DIR || path.join(ROOT, "artifacts", "index-smoke");
const INDEX_PATH = "/Gnu.In-Shell%20-%20Index.dc.html";
const FORBIDDEN_INDEX_COPY = [
  /\bQML\b/i,
  /\bdemo\b/i,
  /wireframe/i,
  /prochaine passe/i,
  /à renforcer/i,
  /a renforcer/i,
  /\baudit\b/i,
  /molecule_specs/i,
  /port-data/i,
  /erreur console/i,
  /Rust\/GPUI/i,
  /\bsprint\b/i,
  /durcir/i,
  /\brepo\b/i,
  /\bbeta\b/i
];

const VIEWPORTS = [
  { name: "desktop", width: 1366, height: 960, screenshot: true },
  { name: "tablet", width: 820, height: 1180, screenshot: true },
  { name: "mobile-430", width: 430, height: 932, screenshot: true },
  { name: "mobile-393", width: 393, height: 852, screenshot: true },
  { name: "mobile-360", width: 360, height: 800, screenshot: false },
  { name: "threshold-720", width: 720, height: 900, screenshot: false }
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
  ".webp": "image/webp"
};

function startServer() {
  const server = http.createServer((req, res) => {
    let urlPath = "/";
    try {
      urlPath = decodeURIComponent(new URL(req.url, "http://127.0.0.1").pathname);
    } catch {
      res.writeHead(400);
      res.end("bad request");
      return;
    }

    const relative = urlPath === "/" ? "/index.html" : urlPath;
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

async function getIndexState(page, forbiddenPatterns) {
  return page.evaluate(async (patterns) => {
    const html = document.documentElement;
    const body = document.body;
    const text = body.innerText;
    const regexes = patterns.map((pattern) => new RegExp(pattern.source, pattern.flags));
    const forbidden = regexes.filter((regex) => regex.test(text)).map((regex) => regex.toString());
    const brokenImages = [...document.images]
      .filter((img) => !img.complete || img.naturalWidth === 0)
      .map((img) => img.currentSrc || img.src || img.alt);
    const icon = document.querySelector("link[rel~='icon']")?.getAttribute("href") || "";
    let iconStatus = null;
    try {
      iconStatus = await fetch(new URL(icon, location.href)).then((response) => response.status);
    } catch (error) {
      iconStatus = error && error.message ? error.message : String(error);
    }

    const firstFocus = document.querySelector(".idx-chip[href], .idx-cascade-link, .idx-resource, .idx-surface");
    if (firstFocus) firstFocus.focus();
    const focusStyle = firstFocus ? getComputedStyle(firstFocus) : null;
    const nav = document.getElementById("gid-nav");
    const rail = document.getElementById("gid-rail");
    const railBox = rail ? rail.getBoundingClientRect() : null;
    const heroBox = document.querySelector(".idx-hero h1")?.getBoundingClientRect();
    const titleStyle = getComputedStyle(document.querySelector(".idx-section-title"));

    const canvases = [...document.querySelectorAll("canvas")].map((canvas, index) => {
      const rect = canvas.getBoundingClientRect();
      const sample = { sampled: false, nonBlank: false, error: null };
      try {
        const width = Math.max(1, canvas.width || Math.floor(rect.width));
        const height = Math.max(1, canvas.height || Math.floor(rect.height));
        const points = [
          [Math.floor(width / 2), Math.floor(height / 2)],
          [Math.floor(width * 0.25), Math.floor(height * 0.25)],
          [Math.floor(width * 0.75), Math.floor(height * 0.25)],
          [Math.floor(width * 0.25), Math.floor(height * 0.75)],
          [Math.floor(width * 0.75), Math.floor(height * 0.75)]
        ];

        const ctx2d = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx2d) {
          sample.sampled = true;
          sample.nonBlank = points.some(([x, y]) => {
            const data = ctx2d.getImageData(Math.min(x, width - 1), Math.min(y, height - 1), 1, 1).data;
            return data[3] !== 0 && (data[0] !== 0 || data[1] !== 0 || data[2] !== 0);
          });
        } else {
          const gl = canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
          if (gl) {
            sample.sampled = true;
            const pixel = new Uint8Array(4);
            sample.nonBlank = points.some(([x, y]) => {
              gl.readPixels(Math.min(x, width - 1), Math.min(y, height - 1), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
              return pixel[3] !== 0 && (pixel[0] !== 0 || pixel[1] !== 0 || pixel[2] !== 0);
            });
          } else {
            sample.error = "no readable 2d/webgl context";
          }
        }
      } catch (error) {
        sample.error = error && error.message ? error.message : String(error);
      }

      return {
        index,
        rect: { width: Math.round(rect.width), height: Math.round(rect.height), left: Math.round(rect.left), top: Math.round(rect.top) },
        backing: { width: canvas.width, height: canvas.height },
        sample
      };
    });

    return {
      overflowX: Math.max(html.scrollWidth, body.scrollWidth) - html.clientWidth,
      h1: [...document.querySelectorAll("h1")].map((node) => node.innerText.trim()),
      h2: [...document.querySelectorAll("h2")].map((node) => node.innerText.trim()),
      forbidden,
      brokenImages,
      icon,
      iconStatus,
      navExists: Boolean(nav),
      railExists: Boolean(rail),
      navText: nav ? nav.innerText : "",
      railBox: railBox && { left: Math.round(railBox.left), right: Math.round(railBox.right), top: Math.round(railBox.top) },
      heroBox: heroBox && { left: Math.round(heroBox.left), right: Math.round(heroBox.right), top: Math.round(heroBox.top) },
      focusOutline: firstFocus ? {
        outlineWidth: focusStyle.outlineWidth,
        outlineStyle: focusStyle.outlineStyle,
        outlineColor: focusStyle.outlineColor,
        outlineOffset: focusStyle.outlineOffset
      } : null,
      titleShadow: titleStyle.textShadow,
      canvasCount: canvases.length,
      canvases
    };
  }, forbiddenPatterns.map((regex) => ({ source: regex.source, flags: regex.flags })));
}

async function getInteractionState(page, options = {}) {
  const checkHover = Boolean(options.checkHover);

  await page.evaluate(() => {
    window.scrollTo(0, 0);
    document.getElementById("gid-nav")?.classList.remove("gid-hidden");
    const nav = document.getElementById("gid-nav");
    if (nav) nav.scrollLeft = 0;
  });
  await page.waitForTimeout(180);

  const trigger = page.locator("#gid-nav .gid-nav-group").first().locator(".gid-nav-trigger");
  let menuState = null;
  if (await trigger.count()) {
    const beforeBox = await trigger.boundingBox();
    const beforeExpanded = await trigger.getAttribute("aria-expanded");
    await trigger.click({ timeout: 5000 });
    await page.waitForTimeout(180);
    menuState = await page.evaluate(() => {
      const group = document.querySelector("#gid-nav .gid-nav-group");
      const menu = document.querySelector(".gid-menu");
      const triggerEl = document.querySelector("#gid-nav .gid-nav-group .gid-nav-trigger");
      const style = menu ? getComputedStyle(menu) : null;
      return {
        viewport: { width: innerWidth, height: innerHeight },
        groupOpen: group ? group.classList.contains("gid-open") : false,
        triggerExpanded: triggerEl ? triggerEl.getAttribute("aria-expanded") : null,
        menuVisible: style ? style.display !== "none" && style.visibility !== "hidden" : false,
        menuText: menu ? menu.innerText : ""
      };
    });
    await page.keyboard.press("Escape");
    await page.waitForTimeout(120);
    const afterEscape = await page.evaluate(() => {
      const group = document.querySelector("#gid-nav .gid-nav-group");
      const menu = document.querySelector(".gid-menu");
      const triggerEl = document.querySelector("#gid-nav .gid-nav-group .gid-nav-trigger");
      const style = menu ? getComputedStyle(menu) : null;
      return {
        groupOpen: group ? group.classList.contains("gid-open") : false,
        triggerExpanded: triggerEl ? triggerEl.getAttribute("aria-expanded") : null,
        menuVisible: style ? style.display !== "none" && style.visibility !== "hidden" : false
      };
    });
    menuState = { beforeBox, beforeExpanded, ...menuState, afterEscape };
  }

  let hover = null;
  if (checkHover) {
    const cascade = page.locator(".idx-cascade-link").first();
    const beforeHover = await cascade.evaluate((node) => {
      const style = getComputedStyle(node);
      return { borderColor: style.borderColor, transform: style.transform, background: style.backgroundColor };
    });
    await cascade.hover();
    await page.waitForTimeout(240);
    const afterHover = await cascade.evaluate((node) => {
      const style = getComputedStyle(node);
      return { borderColor: style.borderColor, transform: style.transform, background: style.backgroundColor };
    });
    hover = { beforeHover, afterHover };
  }

  return { hover, menuState };
}

function validateResult(result) {
  const issues = [];
  if (result.status !== 200) issues.push(`status=${result.status}`);
  if (result.overflowX > 1) issues.push(`overflowX=${result.overflowX}`);
  if (result.forbidden.length) issues.push(`forbidden=${result.forbidden.join(",")}`);
  if (result.brokenImages.length) issues.push(`brokenImages=${result.brokenImages.join(",")}`);
  if (result.icon !== "assets/symbols/cube.svg" || result.iconStatus !== 200) issues.push(`icon=${result.icon} status=${result.iconStatus}`);
  if (!result.navExists || !result.railExists) issues.push(`nav=${result.navExists} rail=${result.railExists}`);
  if (!result.focusOutline || result.focusOutline.outlineStyle === "none" || parseFloat(result.focusOutline.outlineWidth) < 2) {
    issues.push(`focus=${JSON.stringify(result.focusOutline)}`);
  }
  if (result.logs.some((line) => line.startsWith("error") || line.startsWith("pageerror"))) {
    issues.push(`logs=${result.logs.join(" | ")}`);
  }
  for (const canvas of result.canvases || []) {
    if (canvas.rect.width <= 0 || canvas.rect.height <= 0) issues.push(`canvas-${canvas.index}=zero-css-size`);
    if (canvas.backing.width <= 0 || canvas.backing.height <= 0) issues.push(`canvas-${canvas.index}=zero-backing-size`);
    if (!canvas.sample.sampled) issues.push(`canvas-${canvas.index}=not-sampled:${canvas.sample.error || "unknown"}`);
    if (canvas.sample.sampled && !canvas.sample.nonBlank) issues.push(`canvas-${canvas.index}=blank-sample`);
  }
  if (result.interaction) {
    if (result.interaction.hover) {
      const hoverChanged = result.interaction.hover.beforeHover.borderColor !== result.interaction.hover.afterHover.borderColor ||
        result.interaction.hover.beforeHover.transform !== result.interaction.hover.afterHover.transform ||
        result.interaction.hover.beforeHover.background !== result.interaction.hover.afterHover.background;
      if (!hoverChanged) issues.push("hover-state=unchanged");
    }
    if (!result.interaction.menuState) {
      issues.push("atlas-menu-trigger=missing");
    } else {
      const menu = result.interaction.menuState;
      if (!menu.beforeBox || menu.beforeBox.width <= 0 || menu.beforeBox.height <= 0) issues.push("atlas-menu-trigger=unbounded");
      if (menu.beforeBox && (menu.beforeBox.x < 0 || menu.beforeBox.x + menu.beforeBox.width > menu.viewport.width)) issues.push("atlas-menu-trigger=offscreen-x");
      if (menu.beforeExpanded !== "false") issues.push(`atlas-menu-expanded-before=${menu.beforeExpanded}`);
      if (menu.triggerExpanded !== "true") issues.push(`atlas-menu-expanded-open=${menu.triggerExpanded}`);
      if (!menu.menuVisible) issues.push("atlas-menu=hidden");
      if (menu.afterEscape.triggerExpanded !== "false") issues.push(`atlas-menu-expanded-after-escape=${menu.afterEscape.triggerExpanded}`);
      if (menu.afterEscape.menuVisible || menu.afterEscape.groupOpen) issues.push("atlas-menu=still-open-after-escape");
    }
  }
  return issues;
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const { server, origin } = await startServer();
  const browser = await chromium.launch({ headless: true });
  const results = [];
  let failed = false;

  try {
    for (const viewport of VIEWPORTS) {
      const page = await browser.newPage({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 1,
        isMobile: viewport.width <= 430
      });
      const logs = [];
      page.on("console", (message) => {
        if (["error", "warning"].includes(message.type())) logs.push(`${message.type()}: ${message.text()}`);
      });
      page.on("pageerror", (error) => logs.push(`pageerror: ${error.message}`));

      const response = await page.goto(origin + INDEX_PATH, { waitUntil: "networkidle" });
      await page.waitForSelector("#gid-nav", { timeout: 5000 });
      await page.waitForSelector("#gid-rail", { timeout: 5000 });
      await page.waitForTimeout(350);

      const state = await getIndexState(page, FORBIDDEN_INDEX_COPY);
      const interaction = await getInteractionState(page, { checkHover: viewport.width >= 720 });
      const result = { case: viewport.name, status: response && response.status(), logs, ...state, interaction };
      result.issues = validateResult(result);
      if (result.issues.length) failed = true;
      results.push(result);

      if (viewport.screenshot) {
        await page.keyboard.press("Escape").catch(() => {});
        await page.evaluate(() => {
          window.scrollTo(0, 0);
          document.querySelectorAll(".gid-nav-group.gid-open").forEach((group) => group.classList.remove("gid-open"));
          document.querySelectorAll(".gid-menu").forEach((menu) => {
            menu.style.display = "none";
          });
        });
        await page.waitForTimeout(120);
        await page.screenshot({ path: path.join(OUT_DIR, `${viewport.name}.png`), fullPage: true });
      }
      await page.close();
    }
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }

  fs.writeFileSync(path.join(OUT_DIR, "results.json"), JSON.stringify(results, null, 2));
  for (const result of results) {
    const status = result.issues.length ? `FAIL ${result.issues.join("; ")}` : "ok";
    console.log(`${result.case}: ${status} | overflow=${result.overflowX} nav=${result.navExists} rail=${result.railExists} h2=${result.h2.join(" / ")}`);
  }
  console.log(`artifacts=${OUT_DIR}`);
  process.exit(failed ? 1 : 0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
