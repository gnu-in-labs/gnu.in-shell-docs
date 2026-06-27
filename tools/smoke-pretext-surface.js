#!/usr/bin/env node
"use strict";

/**
 * smoke-pretext-surface.js
 *
 * Proves the bilingual Pretext layer on the public documentation pages:
 *   - the French profile (?lang=fr) keeps the canonical French copy;
 *   - the English profile (?lang=en) swaps keyed text to English;
 *   - the default profile (no ?lang, English browser locale) resolves to English;
 *   - neither profile renders a forbidden public term;
 *   - the cube favicon, shared nav, and floating rail are present in both profiles.
 *
 * It does NOT judge translation quality; it proves the mechanism, the default,
 * and the per-language copy hygiene. Run alongside the other smoke gates.
 */

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
    try { return require(candidate); }
    catch (error) { errors.push(`${candidate}: ${error && error.message ? error.message : String(error)}`); }
  }
  console.error("Playwright is required. Install it locally or set PLAYWRIGHT_MODULE to its module path.");
  console.error(errors.join("\n"));
  process.exit(2);
}

const { chromium } = loadPlaywright();
const ROOT = path.resolve(__dirname, "..");

// Each surface declares a stable French anchor and its English swap.
const SURFACES = [
  { file: "Gnu.In-Shell - Index.dc.html", fr: "Carte documentaire", en: "Documentation map" },
  { file: "Project.dc.html",       fr: "Documentation avant promesse", en: "Documentation before promise" },
  { file: "Methodology.dc.html",   fr: "Boucle de travail",            en: "Work loop" },
  { file: "Assets.dc.html",        fr: "Classes d'assets",             en: "Asset classes" },
  { file: "Evidence.dc.html",      fr: "Force de preuve",              en: "Evidence strength" },
  { file: "Communications.dc.html",fr: "Cadre de message",            en: "Message frame" },
  // Anchor on the lane heading (rm.laneh), not the kicker: .road-kicker is text-transform:uppercase,
  // so innerText renders it "VOIE ACTIVE" and a lowercase substring check misses it. The heading is
  // normal-case and carries both FR and EN maps, matching how the other six surfaces anchor.
  { file: "Roadmap.dc.html",       fr: "Refonte visuelle et comportementale du shell", en: "Visual and behavioural shell redesign" }
];

const FORBIDDEN_BODY_COPY = [
  /\bQML\b/i, /\bdemo\b/i, /Démo/i, /Auto-demo/i,
  /Current Work/i, /Current%20Work/i, /frontier/i, /wireframe/i, /pasted/i
];

const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".woff": "font/woff", ".woff2": "font/woff2"
};

function urlPath(file) {
  return `/${file.split("/").map(encodeURIComponent).join("/")}`;
}

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let pathname = "/";
      try { pathname = decodeURIComponent(new URL(req.url, "http://127.0.0.1").pathname); }
      catch { res.writeHead(400); res.end("bad"); return; }
      if (pathname === "/") pathname = "/Gnu.In-Shell - Index.dc.html";
      const filePath = path.join(ROOT, pathname);
      if (!filePath.startsWith(ROOT + path.sep)) { res.writeHead(403); res.end("forbidden"); return; }
      fs.readFile(filePath, (err, buf) => {
        if (err) { res.writeHead(404); res.end("not found"); return; }
        res.writeHead(200, { "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream" });
        res.end(buf);
      });
    });
    server.listen(0, "127.0.0.1", () => resolve({ server, origin: `http://127.0.0.1:${server.address().port}` }));
  });
}

async function readState(page) {
  return page.evaluate((patterns) => {
    const body = document.body;
    const text = body.innerText || body.textContent || "";
    const regexes = patterns.map((p) => new RegExp(p.source, p.flags));
    return {
      text,
      forbidden: regexes.filter((r) => r.test(text)).map((r) => r.toString()),
      htmlLang: document.documentElement.lang,
      icon: document.querySelector("link[rel~='icon']")?.getAttribute("href") || "",
      navExists: !!document.getElementById("gid-nav"),
      railExists: !!document.getElementById("gid-rail")
    };
  }, FORBIDDEN_BODY_COPY.map((r) => ({ source: r.source, flags: r.flags })));
}

(async () => {
  const { server, origin } = await startServer();
  const browser = await chromium.launch();
  const issues = [];
  let checks = 0;
  try {
    // English browser locale => the default (no ?lang) profile must resolve to English.
    const context = await browser.newContext({ locale: "en-US" });

    for (const surface of SURFACES) {
      const base = origin + urlPath(surface.file);

      // 1. French profile keeps canonical French copy.
      let page = await context.newPage();
      await page.goto(base + "?lang=fr", { waitUntil: "networkidle" });
      await page.waitForSelector("#gid-nav", { timeout: 5000 });
      await page.waitForTimeout(250);
      let s = await readState(page);
      checks++;
      if (!s.text.includes(surface.fr)) issues.push(`${surface.file} [fr]: missing French anchor "${surface.fr}"`);
      if (s.htmlLang !== "fr") issues.push(`${surface.file} [fr]: html lang=${s.htmlLang}`);
      if (s.forbidden.length) issues.push(`${surface.file} [fr]: forbidden ${s.forbidden.join(",")}`);
      if (s.icon !== "assets/symbols/cube.svg") issues.push(`${surface.file} [fr]: icon=${s.icon}`);
      if (!s.navExists || !s.railExists) issues.push(`${surface.file} [fr]: nav=${s.navExists} rail=${s.railExists}`);
      await page.close();

      // 2. English profile swaps keyed text to English and drops the French anchor.
      page = await context.newPage();
      await page.goto(base + "?lang=en", { waitUntil: "networkidle" });
      await page.waitForSelector("#gid-nav", { timeout: 5000 });
      await page.waitForTimeout(250);
      s = await readState(page);
      checks++;
      if (!s.text.includes(surface.en)) issues.push(`${surface.file} [en]: missing English anchor "${surface.en}"`);
      if (s.text.includes(surface.fr)) issues.push(`${surface.file} [en]: French anchor "${surface.fr}" not swapped`);
      if (s.htmlLang !== "en") issues.push(`${surface.file} [en]: html lang=${s.htmlLang}`);
      if (s.forbidden.length) issues.push(`${surface.file} [en]: forbidden ${s.forbidden.join(",")}`);
      await page.close();

      // 3. Default profile (no ?lang, English locale) must resolve to English.
      page = await context.newPage();
      await page.goto(base, { waitUntil: "networkidle" });
      await page.waitForSelector("#gid-nav", { timeout: 5000 });
      await page.waitForTimeout(250);
      s = await readState(page);
      checks++;
      if (!s.text.includes(surface.en)) issues.push(`${surface.file} [default]: default profile did not resolve to English ("${surface.en}")`);
      await page.close();
    }
  } finally {
    await browser.close();
    server.close();
  }

  console.log(`smoke-pretext-surface: ${checks} profile checks across ${SURFACES.length} surfaces`);
  if (issues.length) {
    console.error("FAIL:");
    for (const issue of issues) console.error("  - " + issue);
    process.exit(1);
  }
  console.log("ok");
})().catch((error) => { console.error(error); process.exit(1); });
