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
const OUT_DIR = process.env.OUT_DIR || path.join(ROOT, "artifacts", "showcase-smoke");

const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 900, screenshot: true },
  { name: "mobile-393", width: 393, height: 852, screenshot: true }
];

const PAGES = [
  {
    file: "Roadmap.dc.html",
    h1: "Roadmap",
    requiredText: ["surface documentaire publique", "phase 5", "principe roadmap"]
  },
  {
    file: "Sys.ter Mascot Kit.dc.html",
    h1: "Sys.ter",
    requiredText: ["current mascot artwork", "acceptance rules", "faceplate", "antenna"]
  },
  {
    file: "Animations.dc.html",
    h1: "Animations",
    requiredText: ["Motion proof", "sequence", "radial", "reduced"],
    checkMotion: true
  },
  {
    file: "Gnu.In Context Menus.dc.html",
    h1: "Menus contextuels",
    requiredText: ["bornes", "clavier", "tactile", "preuve"]
  },
  {
    file: "Molecule Renderer.dc.html",
    h1: "Renderer générique · hydraté depuis les données",
    requiredText: ["source", "layouts", "renderer", "densité"]
  }
];

const FORBIDDEN_BODY_COPY = [
  /\bQML\b/i,
  /\bdemo\b/i,
  /Démo/i,
  /Current Work/i,
  /Current%20Work/i,
  /frontier/i,
  /wireframe/i,
  /pasted/i
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

function safeName(file) {
  return file.replace(/\.dc\.html$/i, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
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

async function captureState(page, spec, status, viewport, pageErrors) {
  const state = await page.evaluate(async ({ spec, status, viewport, patterns }) => {
    window.scrollTo(0, 0);
    const html = document.documentElement;
    const body = document.body;
    const text = body.innerText || body.textContent || "";
    const lowerText = text.toLowerCase();
    const regexes = patterns.map((pattern) => new RegExp(pattern.source, pattern.flags));
    const forbidden = regexes.filter((regex) => regex.test(text)).map((regex) => regex.toString());
    const h1 = [...document.querySelectorAll("h1")].map((node) => node.innerText.trim()).filter(Boolean);
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

    const nav = document.getElementById("gid-nav");
    const rail = document.getElementById("gid-rail");
    const title = document.querySelector("h1");
    const titleRect = title ? title.getBoundingClientRect() : null;
    const railRect = rail ? rail.getBoundingClientRect() : null;
    const overlap = titleRect && railRect
      ? !(railRect.right < titleRect.left || railRect.left > titleRect.right || railRect.bottom < titleRect.top || railRect.top > titleRect.bottom)
      : false;

    const firstFocus = document.querySelector("#gid-rail button, #gid-rail a[href], #dc-root a[href], #dc-root button, #gid-nav a[href], #gid-nav button, summary");
    if (firstFocus) firstFocus.focus();
    const focusStyle = firstFocus ? getComputedStyle(firstFocus) : null;

    return {
      file: spec.file,
      viewport: viewport.name,
      expectedH1: spec.h1,
      status,
      h1,
      requiredTextMissing: spec.requiredText.filter((item) => !lowerText.includes(item.toLowerCase())),
      forbidden,
      overflowX: Math.max(html.scrollWidth, body.scrollWidth) - html.clientWidth,
      brokenImages,
      icon,
      iconStatus,
      navExists: Boolean(nav),
      railExists: Boolean(rail),
      titleRailOverlap: Boolean(overlap),
      railRect: railRect && {
        left: Math.round(railRect.left),
        right: Math.round(railRect.right),
        top: Math.round(railRect.top),
        bottom: Math.round(railRect.bottom)
      },
      titleRect: titleRect && {
        left: Math.round(titleRect.left),
        right: Math.round(titleRect.right),
        top: Math.round(titleRect.top),
        bottom: Math.round(titleRect.bottom)
      },
      focusOutline: firstFocus ? {
        outlineWidth: focusStyle.outlineWidth,
        outlineStyle: focusStyle.outlineStyle,
        outlineOffset: focusStyle.outlineOffset
      } : null
    };
  }, {
    spec,
    status,
    viewport,
    patterns: FORBIDDEN_BODY_COPY.map((regex) => ({ source: regex.source, flags: regex.flags }))
  });

  state.pageErrors = pageErrors.slice();
  return state;
}

async function checkMotionSwitcher(page, spec) {
  if (!spec.checkMotion) return null;
  const button = page.locator('button[data-motion-mode="radial"]').first();
  if (!(await button.count())) return { ok: false, reason: "radial button missing" };
  await button.click({ timeout: 5000 });
  await page.waitForTimeout(100);
  return page.evaluate(() => {
    const lab = document.querySelector(".ani-lab");
    const pressed = document.querySelector('button[data-motion-mode="radial"]')?.getAttribute("aria-pressed");
    return {
      ok: lab?.getAttribute("data-motion-mode") === "radial" && pressed === "true",
      mode: lab?.getAttribute("data-motion-mode") || null,
      radialPressed: pressed || null
    };
  });
}

function validate(result) {
  const issues = [];
  if (result.status !== 200) issues.push(`status=${result.status}`);
  if (result.h1.length !== 1 || result.h1[0] !== result.expectedH1) issues.push(`h1=${result.h1.join(" / ")}`);
  if (result.requiredTextMissing.length) issues.push(`missingText=${result.requiredTextMissing.join(",")}`);
  if (result.forbidden.length) issues.push(`forbidden=${result.forbidden.join(",")}`);
  if (result.overflowX > 1) issues.push(`overflowX=${result.overflowX}`);
  if (result.brokenImages.length) issues.push(`brokenImages=${result.brokenImages.join(",")}`);
  if (result.icon !== "assets/symbols/cube.svg" || result.iconStatus !== 200) issues.push(`icon=${result.icon} status=${result.iconStatus}`);
  if (!result.navExists || !result.railExists) issues.push(`nav=${result.navExists} rail=${result.railExists}`);
  if (result.titleRailOverlap) issues.push(`rail-title-overlap=${JSON.stringify({ rail: result.railRect, title: result.titleRect })}`);
  if (!result.focusOutline || result.focusOutline.outlineStyle === "none" || parseFloat(result.focusOutline.outlineWidth) < 2) {
    issues.push(`focus=${JSON.stringify(result.focusOutline)}`);
  }
  if (result.pageErrors.length) issues.push(`pageErrors=${result.pageErrors.join(" | ")}`);
  if (result.motionState && !result.motionState.ok) issues.push(`motion=${JSON.stringify(result.motionState)}`);
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
      for (const spec of PAGES) {
        const page = await context.newPage();
        const pageErrors = [];
        page.on("pageerror", (error) => pageErrors.push(error.message || String(error)));
        const response = await page.goto(`${origin}${urlPath(spec.file)}`, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(700);
        const motionState = await checkMotionSwitcher(page, spec);
        const state = await captureState(page, spec, response ? response.status() : 0, viewport, pageErrors);
        state.motionState = motionState;
        state.issues = validate(state);
        results.push(state);
        if (viewport.screenshot) {
          await page.screenshot({
            path: path.join(OUT_DIR, `${viewport.name}-${safeName(spec.file)}.png`),
            fullPage: false
          });
        }
        await page.close();
      }
      await context.close();
    }
  } finally {
    await browser.close();
    server.close();
  }

  fs.writeFileSync(path.join(OUT_DIR, "showcase-smoke-results.json"), JSON.stringify(results, null, 2));

  const failures = results.filter((result) => result.issues.length);
  for (const result of results) {
    const label = `${result.viewport} ${result.file}`;
    if (result.issues.length) console.error(`FAIL ${label}: ${result.issues.join("; ")}`);
    else console.log(`PASS ${label}`);
  }

  if (failures.length) process.exit(1);
})().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
