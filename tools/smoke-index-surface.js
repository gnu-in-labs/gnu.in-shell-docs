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
    const railToggle = rail ? rail.querySelector(".gid-rail-toggle") : null;
    const navTargets = nav ? [...nav.querySelectorAll("a[href], button")].map((node) => {
      const rect = node.getBoundingClientRect();
      return {
        text: node.textContent.trim(),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        visible: getComputedStyle(node).display !== "none"
      };
    }) : [];
    const live = document.querySelector("[data-idx-live]");
    const liveCanvas = live ? live.querySelector(".idx-live-canvas") : null;
    const liveBox = live ? live.getBoundingClientRect() : null;
    const liveCanvasBox = liveCanvas ? liveCanvas.getBoundingClientRect() : null;
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
      navTargets,
      railBox: railBox && { left: Math.round(railBox.left), right: Math.round(railBox.right), top: Math.round(railBox.top) },
      railState: rail && {
        collapsed: rail.classList.contains("gid-rail-collapsed"),
        expanded: rail.getAttribute("aria-expanded"),
        toggleText: railToggle ? railToggle.textContent : "",
        toggleExpanded: railToggle ? railToggle.getAttribute("aria-expanded") : null,
        visibleControls: [...rail.children].filter((child) => getComputedStyle(child).display !== "none").map((child) => child.textContent.trim())
      },
      liveState: live && {
        mounted: live.dataset.idxMounted,
        mode: live.dataset.mode,
        controls: [...live.querySelectorAll("[data-idx-mode]")].map((node) => ({
          mode: node.getAttribute("data-idx-mode"),
          pressed: node.getAttribute("aria-pressed")
        })),
        activeNodes: [...live.querySelectorAll(".idx-live-node.is-active")].map((node) => node.getAttribute("data-idx-node")),
        rect: liveBox && { width: Math.round(liveBox.width), height: Math.round(liveBox.height) },
        canvasRect: liveCanvasBox && { width: Math.round(liveCanvasBox.width), height: Math.round(liveCanvasBox.height) }
      },
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
    await trigger.focus();
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(100);
    const keyboardOpen = await page.evaluate(() => {
      const triggerEl = document.querySelector("#gid-nav .gid-nav-group .gid-nav-trigger");
      const active = document.activeElement;
      return {
        triggerExpanded: triggerEl ? triggerEl.getAttribute("aria-expanded") : null,
        activeRole: active ? active.getAttribute("role") : null,
        activeText: active ? active.textContent.trim() : ""
      };
    });
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(80);
    const keyboardNext = await page.evaluate(() => ({
      activeRole: document.activeElement ? document.activeElement.getAttribute("role") : null,
      activeText: document.activeElement ? document.activeElement.textContent.trim() : ""
    }));
    await page.keyboard.press("Escape");
    await page.waitForTimeout(100);
    const keyboardClosed = await page.evaluate(() => {
      const triggerEl = document.querySelector("#gid-nav .gid-nav-group .gid-nav-trigger");
      return {
        triggerExpanded: triggerEl ? triggerEl.getAttribute("aria-expanded") : null,
        activeClass: document.activeElement ? document.activeElement.className : ""
      };
    });
    menuState = { beforeBox, beforeExpanded, ...menuState, afterEscape, keyboardOpen, keyboardNext, keyboardClosed };
  }

  const railInteraction = await getRailInteractionState(page);
  const liveInteraction = await getLiveInteractionState(page);

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

  return { hover, menuState, railInteraction, liveInteraction };
}

async function readRailState(page) {
  return page.evaluate(() => {
    const rail = document.getElementById("gid-rail");
    const toggle = rail ? rail.querySelector(".gid-rail-toggle") : null;
    const handle = rail ? rail.querySelector(".gid-rail-handle") : null;
    const rect = rail ? rail.getBoundingClientRect() : null;
    const controls = rail ? [...rail.querySelectorAll("a[href], button")].map((node) => {
      const box = node.getBoundingClientRect();
      return {
        label: node.getAttribute("aria-label") || node.textContent.trim(),
        visible: getComputedStyle(node).display !== "none",
        width: Math.round(box.width),
        height: Math.round(box.height),
        keyshortcuts: node.getAttribute("aria-keyshortcuts") || "",
        describedby: node.getAttribute("aria-describedby") || "",
        controls: node.getAttribute("aria-controls") || ""
      };
    }) : [];
    return {
      exists: Boolean(rail),
      collapsed: rail ? rail.classList.contains("gid-rail-collapsed") : null,
      expanded: rail ? rail.getAttribute("aria-expanded") : null,
      toggleText: toggle ? toggle.textContent : "",
      toggleExpanded: toggle ? toggle.getAttribute("aria-expanded") : null,
      toggleVisible: toggle ? getComputedStyle(toggle).display !== "none" : false,
      handleVisible: handle ? getComputedStyle(handle).display !== "none" : false,
      controlTargets: controls,
      rect: rect && { left: Math.round(rect.left), top: Math.round(rect.top), width: Math.round(rect.width), height: Math.round(rect.height) }
    };
  });
}

async function dragRailControl(page, selector, dx, dy) {
  const control = page.locator(selector).first();
  const box = await control.boundingBox();
  if (!box) return null;
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y + dy, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(180);
  return { from: { x: Math.round(x), y: Math.round(y) }, to: { x: Math.round(x + dx), y: Math.round(y + dy) } };
}

async function getRailInteractionState(page) {
  await page.evaluate(() => {
    const nav = document.getElementById("gid-nav");
    if (nav) nav.classList.remove("gid-hidden");
  });
  await page.waitForTimeout(120);

  const initial = await readRailState(page);
  const dragSelector = initial.collapsed ? "#gid-rail .gid-rail-toggle" : "#gid-rail .gid-rail-handle";
  const beforeDrag = await readRailState(page);
  const drag = await dragRailControl(page, dragSelector, 34, 28);
  const afterDrag = await readRailState(page);

  await page.locator("#gid-rail .gid-rail-toggle").click({ timeout: 5000 });
  await page.waitForTimeout(180);
  const afterFirstToggle = await readRailState(page);

  await page.locator("#gid-rail .gid-rail-toggle").click({ timeout: 5000 });
  await page.waitForTimeout(180);
  const afterSecondToggle = await readRailState(page);

  if (afterSecondToggle.collapsed !== initial.collapsed) {
    await page.locator("#gid-rail .gid-rail-toggle").click({ timeout: 5000 });
    await page.waitForTimeout(180);
  }
  const final = await readRailState(page);

  const keySelector = final.collapsed ? "#gid-rail .gid-rail-toggle" : "#gid-rail .gid-rail-handle";
  await page.locator(keySelector).focus({ timeout: 5000 });
  await page.waitForTimeout(80);
  const beforeKeyboard = await readRailState(page);
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(120);
  const afterKeyboardMove = await readRailState(page);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(120);
  const afterKeyboardEscape = await readRailState(page);
  await page.keyboard.press("Home");
  await page.waitForTimeout(120);
  const afterKeyboardHome = await readRailState(page);
  if (afterKeyboardHome.collapsed !== initial.collapsed) {
    await page.locator("#gid-rail .gid-rail-toggle").click({ timeout: 5000 });
    await page.waitForTimeout(180);
  }
  const afterKeyboardFinal = await readRailState(page);

  return {
    initial,
    drag,
    beforeDrag,
    afterDrag,
    afterFirstToggle,
    afterSecondToggle,
    final,
    keyboard: { beforeKeyboard, afterKeyboardMove, afterKeyboardEscape, afterKeyboardHome, afterKeyboardFinal }
  };
}

async function readLiveState(page) {
  return page.evaluate(() => {
    const live = document.querySelector("[data-idx-live]");
    const canvas = live ? live.querySelector(".idx-live-canvas") : null;
    const rect = canvas ? canvas.getBoundingClientRect() : null;
    return {
      exists: Boolean(live),
      mounted: live ? live.dataset.idxMounted : null,
      mode: live ? live.dataset.mode : null,
      title: live ? live.querySelector("[data-idx-live-title]")?.textContent.trim() : "",
      copy: live ? live.querySelector("[data-idx-live-copy]")?.textContent.trim() : "",
      count: live ? live.querySelector("[data-idx-live-count]")?.textContent.trim() : "",
      pressed: live ? [...live.querySelectorAll("[data-idx-mode]")].filter((node) => node.getAttribute("aria-pressed") === "true").map((node) => node.getAttribute("data-idx-mode")) : [],
      activeNodes: live ? [...live.querySelectorAll(".idx-live-node.is-active")].map((node) => node.getAttribute("data-idx-node")) : [],
      canvas: rect && {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        backingWidth: canvas.width,
        backingHeight: canvas.height
      }
    };
  });
}

async function getLiveInteractionState(page) {
  await page.waitForSelector("[data-idx-live]", { timeout: 5000 });
  await page.waitForTimeout(220);
  const initial = await readLiveState(page);
  await page.locator("[data-idx-mode='composer']").click({ timeout: 5000 });
  await page.waitForTimeout(180);
  const afterComposer = await readLiveState(page);
  await page.locator("[data-idx-node='Context']").click({ timeout: 5000 });
  await page.waitForTimeout(180);
  const afterNode = await readLiveState(page);
  await page.locator("[data-idx-mode='orienter']").click({ timeout: 5000 });
  await page.waitForTimeout(180);
  const final = await readLiveState(page);
  return { initial, afterComposer, afterNode, final };
}

function validateResult(result) {
  const issues = [];
  if (result.status !== 200) issues.push(`status=${result.status}`);
  if (result.overflowX > 1) issues.push(`overflowX=${result.overflowX}`);
  if (result.forbidden.length) issues.push(`forbidden=${result.forbidden.join(",")}`);
  if (result.brokenImages.length) issues.push(`brokenImages=${result.brokenImages.join(",")}`);
  if (result.icon !== "assets/symbols/cube.svg" || result.iconStatus !== 200) issues.push(`icon=${result.icon} status=${result.iconStatus}`);
  if (!result.navExists || !result.railExists) issues.push(`nav=${result.navExists} rail=${result.railExists}`);
  if (!result.h2.includes("Carte vivante")) issues.push("live-section=missing-title");
  if (!result.liveState) {
    issues.push("live-section=missing");
  } else {
    if (result.liveState.mounted !== "true") issues.push(`live-mounted=${result.liveState.mounted}`);
    if (result.liveState.mode !== "orienter") issues.push(`live-mode=${result.liveState.mode}`);
    if (!result.liveState.canvasRect || result.liveState.canvasRect.width < 240 || result.liveState.canvasRect.height < 240) {
      issues.push(`live-canvas-rect=${JSON.stringify(result.liveState.canvasRect)}`);
    }
    if (result.liveState.controls.length !== 3) issues.push(`live-controls=${result.liveState.controls.length}`);
  }
  if (result.case.startsWith("mobile") && result.railState && !result.railState.collapsed) issues.push("rail-mobile-default=expanded");
  if (result.case.startsWith("mobile") && result.railState && result.railState.visibleControls.length !== 1) {
    issues.push(`rail-mobile-visible-controls=${result.railState.visibleControls.join("/")}`);
  }
  for (const target of result.navTargets || []) {
    if (target.visible && (target.width < 24 || target.height < 24)) {
      issues.push(`nav-target-small=${target.text}:${target.width}x${target.height}`);
    }
  }
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
      if (menu.keyboardOpen.triggerExpanded !== "true") issues.push(`atlas-menu-keyboard-open=${menu.keyboardOpen.triggerExpanded}`);
      if (menu.keyboardOpen.activeRole !== "menuitem") issues.push(`atlas-menu-keyboard-focus=${menu.keyboardOpen.activeRole}:${menu.keyboardOpen.activeText}`);
      if (menu.keyboardNext.activeRole !== "menuitem" || menu.keyboardNext.activeText === menu.keyboardOpen.activeText) {
        issues.push(`atlas-menu-keyboard-next=${menu.keyboardNext.activeRole}:${menu.keyboardNext.activeText}`);
      }
      if (menu.keyboardClosed.triggerExpanded !== "false") issues.push(`atlas-menu-keyboard-close=${menu.keyboardClosed.triggerExpanded}`);
    }
    if (!result.interaction.railInteraction) {
      issues.push("rail-interaction=missing");
    } else {
      const rail = result.interaction.railInteraction;
      if (!rail.initial.exists) issues.push("rail=missing");
      if (!rail.drag) issues.push("rail-drag=no-control");
      if (rail.afterDrag.rect && rail.beforeDrag.rect) {
        const moved = Math.abs(rail.afterDrag.rect.left - rail.beforeDrag.rect.left) + Math.abs(rail.afterDrag.rect.top - rail.beforeDrag.rect.top);
        if (moved < 12) issues.push(`rail-drag=unchanged:${moved}`);
      }
      if (rail.afterDrag.collapsed !== rail.beforeDrag.collapsed) issues.push("rail-drag=changed-collapse-state");
      if (rail.afterFirstToggle.collapsed === rail.afterDrag.collapsed) issues.push("rail-toggle=unchanged");
      if (rail.afterSecondToggle.collapsed !== rail.afterDrag.collapsed) issues.push("rail-toggle=not-restored");
      if (rail.final.collapsed !== rail.initial.collapsed) issues.push("rail-final-state=changed");
      if (rail.final.toggleExpanded !== (rail.final.collapsed ? "false" : "true")) issues.push(`rail-toggle-expanded=${rail.final.toggleExpanded}`);
      for (const target of rail.final.controlTargets || []) {
        if (target.visible && (target.width < 24 || target.height < 24)) {
          issues.push(`rail-target-small=${target.label}:${target.width}x${target.height}`);
        }
      }
      const moverTargets = (rail.final.controlTargets || []).filter((target) => /Déplacer|Move rail|Ouvrir|Open rail|Rétracter|Collapse rail/.test(target.label));
      if (!moverTargets.some((target) => target.keyshortcuts.includes("ArrowLeft") && target.describedby === "gid-rail-keyboard-help")) {
        issues.push("rail-keyboard-help=missing");
      }
      if (!rail.keyboard) {
        issues.push("rail-keyboard=missing");
      } else {
        const before = rail.keyboard.beforeKeyboard.rect;
        const moved = rail.keyboard.afterKeyboardMove.rect;
        const escaped = rail.keyboard.afterKeyboardEscape.rect;
        if (before && moved) {
          const delta = Math.abs(moved.left - before.left) + Math.abs(moved.top - before.top);
          if (delta < 8) issues.push(`rail-keyboard-move=unchanged:${delta}`);
        }
        if (before && escaped) {
          const delta = Math.abs(escaped.left - before.left) + Math.abs(escaped.top - before.top);
          if (delta > 2) issues.push(`rail-keyboard-escape=${delta}`);
        }
        if (rail.keyboard.afterKeyboardFinal.collapsed !== rail.initial.collapsed) issues.push("rail-keyboard-final-state=changed");
      }
    }
    if (!result.interaction.liveInteraction) {
      issues.push("live-interaction=missing");
    } else {
      const live = result.interaction.liveInteraction;
      if (!live.initial.exists) issues.push("live=missing");
      if (live.initial.mounted !== "true") issues.push(`live-initial-mounted=${live.initial.mounted}`);
      if (live.initial.mode !== "orienter") issues.push(`live-initial-mode=${live.initial.mode}`);
      if (!live.initial.canvas || live.initial.canvas.width < 240 || live.initial.canvas.height < 240) {
        issues.push(`live-initial-canvas=${JSON.stringify(live.initial.canvas)}`);
      }
      if (live.afterComposer.mode !== "composer") issues.push(`live-composer-mode=${live.afterComposer.mode}`);
      if (!live.afterComposer.pressed.includes("composer")) issues.push(`live-composer-pressed=${live.afterComposer.pressed.join("/")}`);
      if (live.afterComposer.title === live.initial.title) issues.push("live-title=unchanged-after-mode");
      if (!live.afterNode.activeNodes.includes("Context")) issues.push(`live-node-active=${live.afterNode.activeNodes.join("/")}`);
      if (live.final.mode !== "orienter") issues.push(`live-final-mode=${live.final.mode}`);
      if (!live.final.pressed.includes("orienter")) issues.push(`live-final-pressed=${live.final.pressed.join("/")}`);
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

      // Pin the French profile so the French requiredText contract still asserts after the
      // bilingual Pretext swap (default profile is English). EN coverage is checked by smoke-pretext-surface.js.
      const response = await page.goto(origin + INDEX_PATH + "?lang=fr", { waitUntil: "networkidle" });
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
