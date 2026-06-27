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
const OUT_DIR = process.env.OUT_DIR || path.join(ROOT, "artifacts", "docs-smoke");
const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 900, screenshots: new Set(["Gnu.In-Shell - Index.dc.html", "Central Live.dc.html"]) },
  { name: "mobile-393", width: 393, height: 852, screenshots: new Set(["Gnu.In-Shell - Index.dc.html", "Central Live.dc.html"]) }
];

const DOC_PAGES = [
  {
    file: "Gnu.In-Shell - Index.dc.html",
    h1: "gnu.in-OS",
    requiredText: ["Carte documentaire", "Projet", "Central Live", "Methodology", "Assets", "Evidence", "Communications", "Roadmap", "Full Plan"],
    requiredLinks: ["Project.dc.html", "Central%20Live.dc.html", "Methodology.dc.html", "Assets.dc.html", "Evidence.dc.html", "Communications.dc.html", "Roadmap.dc.html", "gnu.in-OS%20-%20Plan%20de%20Fusion%20(complet).dc.html"]
  },
  {
    file: "Project.dc.html",
    h1: "Projet",
    requiredText: ["Ce qui existe", "Central Live", "Documentation avant promesse", "Context"],
    requiredLinks: ["Central%20Live.dc.html"]
  },
  {
    file: "Central Live.dc.html",
    h1: "Central Live",
    requiredText: ["surface vivante", "Ledger de livraison", "Compositor profile", "Contrat de simulation", "Sous-systèmes", "Chantiers ouverts", "Propagation documentaire"],
    requiredLinks: ["Evidence.dc.html"]
  },
  {
    file: "Methodology.dc.html",
    h1: "Methodology",
    requiredText: ["Boucle de travail", "Taxonomie de statut", "Pretext multilingue", "Intake Central Live", "Protocole de drop"],
    requiredLinks: ["Assets.dc.html"]
  },
  {
    file: "Assets.dc.html",
    h1: "Assets",
    requiredText: ["Cube favicon", "Mascotte courante", "Central mirrors", "Statut par famille", "Protocole de drop", "Règles d'usage"],
    requiredLinks: ["Methodology.dc.html"]
  },
  {
    file: "Evidence.dc.html",
    h1: "Evidence",
    requiredText: ["Force de preuve", "Docs smoke", "Showcase smoke", "Central smoke", "Matrice Central Live", "Ledger de claims", "Commandes locales"],
    requiredLinks: ["Communications.dc.html"]
  },
  {
    file: "Communications.dc.html",
    h1: "Communications",
    requiredText: ["Cadre de message", "Central Live en message", "Ton public"],
    requiredLinks: ["Project.dc.html"]
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
  ".webp": "image/webp"
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

async function getPageState(page, spec, status) {
  return page.evaluate(async ({ spec, status, patterns }) => {
    const html = document.documentElement;
    const body = document.body;
    const text = body.textContent || "";
    const regexes = patterns.map((pattern) => new RegExp(pattern.source, pattern.flags));
    const forbidden = regexes.filter((regex) => regex.test(text)).map((regex) => regex.toString());
    const h1 = [...document.querySelectorAll("h1")].map((node) => node.innerText.trim());
    const h2 = [...document.querySelectorAll("h2")].map((node) => node.innerText.trim());
    const links = [...document.querySelectorAll("a[href]")].map((node) => node.getAttribute("href"));
    const normalizedLinks = links.map((href) => String(href || "").split("#")[0].split("?")[0]);
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
    const navTag = nav ? nav.querySelector(".gid-tag")?.textContent.trim() || "" : "";
    const docsTrigger = [...document.querySelectorAll("#gid-nav .gid-nav-group")]
      .find((group) => group.innerText.includes("Docs"));
    const topNavLabels = [...document.querySelectorAll("#gid-nav > a, #gid-nav > .gid-nav-group > a")]
      .map((node) => node.textContent.trim())
      .filter(Boolean);
    const topNavLinks = [...document.querySelectorAll("#gid-nav > a, #gid-nav > .gid-nav-group > a")]
      .map((node) => ({ label: node.textContent.trim(), href: node.getAttribute("href") || "" }))
      .filter((item) => item.label);
    const firstFocus = document.querySelector("a[href], button");
    if (firstFocus) firstFocus.focus();
    const focusStyle = firstFocus ? getComputedStyle(firstFocus) : null;
    const heroTitle = document.querySelector(".doc-hero h1, .idx-hero h1");
    const titleShadow = heroTitle ? getComputedStyle(heroTitle).textShadow : "";

    return {
      file: spec.file,
      status,
      title: document.title,
      h1,
      h2,
      requiredTextMissing: spec.requiredText.filter((item) => !text.includes(item)),
      requiredLinksMissing: spec.requiredLinks.filter((href) => !links.includes(href) && !normalizedLinks.includes(href)),
      forbidden,
      overflowX: Math.max(html.scrollWidth, body.scrollWidth) - html.clientWidth,
      brokenImages,
      icon,
      iconStatus,
      navText: nav ? nav.innerText : "",
      navTag,
      topNavLabels,
      topNavLinks,
      navExists: Boolean(nav),
      railExists: Boolean(rail),
      docsTriggerExists: Boolean(docsTrigger),
      focusOutline: firstFocus ? {
        outlineWidth: focusStyle.outlineWidth,
        outlineStyle: focusStyle.outlineStyle,
        outlineOffset: focusStyle.outlineOffset
      } : null,
      titleShadow
    };
  }, {
    spec,
    status,
    patterns: FORBIDDEN_BODY_COPY.map((regex) => ({ source: regex.source, flags: regex.flags }))
  });
}

async function getMenuState(page, label) {
  const group = page.locator("#gid-nav .gid-nav-group").filter({ hasText: label }).first();
  if (!(await group.count())) return null;
  const trigger = group.locator(".gid-nav-trigger").first();
  await trigger.click({ timeout: 5000 });
  await page.waitForTimeout(160);
  const state = await page.evaluate((groupLabel) => {
    const openGroup = [...document.querySelectorAll("#gid-nav .gid-nav-group")]
      .find((groupNode) => groupNode.innerText.includes(groupLabel));
    const trigger = openGroup ? openGroup.querySelector(".gid-nav-trigger") : null;
    const menu = trigger ? document.getElementById(trigger.getAttribute("aria-controls")) : null;
    const style = menu ? getComputedStyle(menu) : null;
    return {
      expanded: trigger ? trigger.getAttribute("aria-expanded") : null,
      visible: style ? style.display !== "none" && style.visibility !== "hidden" : false,
      text: menu ? menu.innerText : ""
    };
  }, label);
  await page.keyboard.press("Escape").catch(() => {});
  await page.waitForTimeout(80);
  return state;
}

function validateResult(result) {
  const issues = [];
  if (result.status !== 200) issues.push(`status=${result.status}`);
  if (result.h1.length !== 1 || result.h1[0] !== result.expectedH1) issues.push(`h1=${result.h1.join(" / ")}`);
  if (result.requiredTextMissing.length) issues.push(`missingText=${result.requiredTextMissing.join(",")}`);
  if (result.requiredLinksMissing.length) issues.push(`missingLinks=${result.requiredLinksMissing.join(",")}`);
  if (result.forbidden.length) issues.push(`forbidden=${result.forbidden.join(",")}`);
  if (result.overflowX > 1) issues.push(`overflowX=${result.overflowX}`);
  if (result.brokenImages.length) issues.push(`brokenImages=${result.brokenImages.join(",")}`);
  if (result.icon !== "assets/symbols/cube.svg" || result.iconStatus !== 200) issues.push(`icon=${result.icon} status=${result.iconStatus}`);
  if (!result.navExists || !result.railExists) issues.push(`nav=${result.navExists} rail=${result.railExists}`);
  if (!result.docsTriggerExists) issues.push("docs-trigger=missing");
  if (!result.navText.includes("Docs")) issues.push("nav-docs=missing");
  if (/\b\d{1,2}\/\d{1,2}\b/.test(result.navTag || "")) issues.push(`nav-tag-debug=${result.navTag}`);
  if (!result.topNavLabels.includes("Context")) issues.push(`top-nav-context=missing:${result.topNavLabels.join("/")}`);
  const contextTopLink = (result.topNavLinks || []).find((item) => item.label === "Context");
  if (!contextTopLink || contextTopLink.href.split("?")[0] !== "Context.dc.html") {
    issues.push(`top-nav-context-href=${contextTopLink ? contextTopLink.href : "missing"}`);
  }
  for (const hiddenTopLevel of ["Roadmap", "Full Plan", "Animations", "Syster kit"]) {
    if (result.topNavLabels.includes(hiddenTopLevel)) issues.push(`top-nav-unscoped=${hiddenTopLevel}`);
  }
  if (!result.focusOutline || result.focusOutline.outlineStyle === "none" || parseFloat(result.focusOutline.outlineWidth) < 2) {
    issues.push(`focus=${JSON.stringify(result.focusOutline)}`);
  }
  if (!result.titleShadow || result.titleShadow === "none") issues.push("title-shadow=missing");
  if (result.viewport.startsWith("mobile") && result.railState && !result.railState.collapsed) issues.push("mobile-rail-default=expanded");
  if (result.menuState) {
    if (!result.menuState.docs) issues.push("docs-menu=missing");
    if (!result.menuState.context) issues.push("context-menu=missing");
  }
  if (result.menuState && result.menuState.docs) {
    if (result.menuState.docs.expanded !== "true") issues.push(`docs-menu-expanded=${result.menuState.docs.expanded}`);
    if (!result.menuState.docs.visible) issues.push("docs-menu=hidden");
    for (const labels of [["Projet", "Project"], ["Central Live"], ["Methodology"], ["Assets"], ["Evidence"], ["Communications"], ["Roadmap"], ["Full Plan", "Plan complet"]]) {
      if (!labels.some((label) => result.menuState.docs.text.includes(label))) issues.push(`docs-menu-missing=${labels[0]}`);
    }
  }
  if (result.menuState && result.menuState.context) {
    if (result.menuState.context.expanded !== "true") issues.push(`context-menu-expanded=${result.menuState.context.expanded}`);
    if (!result.menuState.context.visible) issues.push("context-menu=hidden");
    for (const labels of [["Menus contextuels", "Context menus"], ["Renderer"], ["Animations"], ["Motion"], ["Syster kit"]]) {
      if (!labels.some((label) => result.menuState.context.text.includes(label))) issues.push(`context-menu-missing=${labels[0]}`);
    }
  }
  if (result.logs.some((line) => line.startsWith("error") || line.startsWith("pageerror"))) {
    issues.push(`logs=${result.logs.join(" | ")}`);
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
      for (const spec of DOC_PAGES) {
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

        // Pin the French profile so the French requiredText contract still asserts after the
        // bilingual Pretext swap (default profile is English). EN coverage is checked by smoke-pretext-surface.js.
        const response = await page.goto(origin + urlPath(spec.file) + "?lang=fr", { waitUntil: "networkidle" });
        await page.waitForSelector("#gid-nav", { timeout: 5000 });
        await page.waitForSelector("#gid-rail", { timeout: 5000 });
        await page.waitForTimeout(250);
        const state = await getPageState(page, spec, response && response.status());
        const railState = await page.evaluate(() => {
          const rail = document.getElementById("gid-rail");
          return rail ? { collapsed: rail.classList.contains("gid-rail-collapsed") } : null;
        });
        const menuState = spec.file === "Gnu.In-Shell - Index.dc.html" ? {
          docs: await getMenuState(page, "Docs"),
          context: await getMenuState(page, "Context")
        } : null;
        const result = { viewport: viewport.name, expectedH1: spec.h1, logs, ...state, railState, menuState };
        result.issues = validateResult(result);
        if (result.issues.length) failed = true;
        results.push(result);

        if (viewport.screenshots.has(spec.file)) {
          await page.keyboard.press("Escape").catch(() => {});
          await page.screenshot({ path: path.join(OUT_DIR, `${viewport.name}-${safeName(spec.file)}.png`), fullPage: true });
        }
        await page.close();
      }
    }
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }

  fs.writeFileSync(path.join(OUT_DIR, "results.json"), JSON.stringify(results, null, 2));
  for (const result of results) {
    const status = result.issues.length ? `FAIL ${result.issues.join("; ")}` : "ok";
    console.log(`${result.viewport} ${result.file}: ${status} | overflow=${result.overflowX} h1=${result.h1.join(" / ")}`);
  }
  console.log(`artifacts=${OUT_DIR}`);
  process.exit(failed ? 1 : 0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
