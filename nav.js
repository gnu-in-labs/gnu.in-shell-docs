/* Shared navigation + viewport adaptation for the Gnu.In-Shell deck.
 * Loaded from each page's <head> (OUTSIDE <x-dc>) so it never enters the
 * dc-runtime template and can't break its compile. */
(function () {
  var SURFACES = [
    { label: "Index", file: "Gnu.In-Shell - Index.dc.html", home: true },
    { label: "Atlas", file: "Gnu.In-Shell - Atlas Unifié.dc.html" },
    { label: "Fondations", file: "Gnu.In-Shell - Fondations.dc.html" },
    { label: "Atomes", file: "Gnu.In-Shell - Atomes.dc.html" },
    { label: "Molécules", file: "Gnu.In-Shell - Molécules.dc.html" },
    { label: "Intégration", file: "Gnu.In-Shell - Intégration.dc.html" },
    { label: "Handoff", file: "Gnu.In-Shell - Handoff.dc.html" },
    { sep: true },
    { label: "Central", file: "Central.dc.html" },
    { label: "Animations", file: "Animations.dc.html" },
    { label: "Roadmap", file: "Roadmap.dc.html" },
    { label: "Syster kit", file: "Sys.ter Mascot Kit.dc.html" },
    { label: "GitHub", href: "https://github.com/gnu-in-labs/gnu.in-shell-docs", external: true },
    { label: "Plan complet", file: "gnu.in-OS - Plan de Fusion (complet).dc.html" }
  ];

  var current = "";
  try { current = decodeURIComponent(location.pathname.split("/").pop() || ""); } catch (e) { current = location.pathname.split("/").pop() || ""; }

  function ensureFavicon() {
    var href = "assets/symbols/cube.svg";
    var existing = document.querySelector("link[rel~='icon']");
    if (existing) {
      existing.setAttribute("type", "image/svg+xml");
      existing.setAttribute("href", href);
      return;
    }
    var icon = document.createElement("link");
    icon.setAttribute("rel", "icon");
    icon.setAttribute("type", "image/svg+xml");
    icon.setAttribute("href", href);
    document.head.appendChild(icon);
  }

  function cssText() {
    return [
      ":root{--gid-nav-h:40px;--gid-edge:clamp(16px,4vw,64px);--gid-card-gap:clamp(10px,1.7vw,18px);--gid-vw:100vw;--gid-vh:100dvh;}",
      "html.gid-adaptive,html.gid-adaptive body{width:100%;height:auto!important;min-height:100%;min-width:0;overflow-x:hidden;background:#F5EEDD;}",
      "html.gid-adaptive body{padding-top:var(--gid-nav-h)!important;box-sizing:border-box;}",
      "html.gid-adaptive #dc-root{box-sizing:border-box;}",
      "html.gid-adaptive #dc-root,html.gid-adaptive #dc-root>.sc-host{min-width:0;max-width:100%;}",
      "html.gid-adaptive #dc-root,html.gid-adaptive #dc-root>.sc-host{height:auto!important;min-height:calc(100dvh - var(--gid-nav-h));}",
      "html.gid-adaptive #dc-root *{box-sizing:border-box;min-width:0;}",
      "html.gid-adaptive #dc-root img,html.gid-adaptive #dc-root svg{max-width:100%;height:auto;}",
      "html.gid-adaptive #dc-root{min-height:calc(100dvh - var(--gid-nav-h));}",
      "#gid-nav{position:fixed;top:0;left:0;right:0;z-index:2147483600;display:flex;align-items:center;gap:2px;",
      "height:var(--gid-nav-h);padding:0 max(12px,env(safe-area-inset-right)) 0 max(12px,env(safe-area-inset-left));overflow-x:auto;overflow-y:hidden;scrollbar-width:none;",
      "font:500 12px/1 ui-monospace,'IBM Plex Mono','JetBrains Mono',SFMono-Regular,Menlo,monospace;",
      "letter-spacing:.04em;color:#cdd3d0;background:rgba(13,17,20,.86);",
      "-webkit-backdrop-filter:blur(10px) saturate(1.1);backdrop-filter:blur(10px) saturate(1.1);",
      "border-bottom:1px solid rgba(245,238,221,.12);transition:transform .25s cubic-bezier(.2,.7,.2,1);}",
      "#gid-nav::-webkit-scrollbar{display:none}",
      "#gid-nav.gid-hidden{transform:translateY(-100%)}",
      "#gid-nav .gid-dot{flex:0 0 auto;width:9px;height:9px;border-radius:50%;background:#FF6A00;box-shadow:0 0 9px #FF6A00;margin-right:8px}",
      "#gid-nav a{flex:0 0 auto;color:#aeb6b2;text-decoration:none;padding:7px 10px;border-radius:7px;white-space:nowrap;transition:background .15s,color .15s}",
      "#gid-nav a:hover{color:#f5eedd;background:rgba(245,238,221,.08)}",
      "#gid-nav a.gid-active{color:#0d1114;background:#F5EEDD;font-weight:600}",
      "#gid-nav .gid-sep{flex:0 0 auto;width:1px;height:16px;background:rgba(245,238,221,.18);margin:0 6px}",
      "#gid-nav .gid-tag{flex:0 0 auto;margin-left:auto;padding-left:14px;color:#6f7b76;font-size:11px;white-space:nowrap}",
      "#gid-rail{position:fixed;left:10px;top:calc(var(--gid-nav-h) + 12px);z-index:2147483590;display:flex;flex-direction:column;gap:6px;padding:6px;border:1px solid rgba(245,238,221,.12);border-radius:12px;background:rgba(13,17,20,.68);-webkit-backdrop-filter:blur(10px) saturate(1.1);backdrop-filter:blur(10px) saturate(1.1);box-shadow:0 12px 32px rgba(0,0,0,.22);opacity:.86}",
      "#gid-rail:hover,#gid-rail:focus-within{opacity:1}",
      "#gid-rail a,#gid-rail button{width:30px;height:30px;display:grid;place-items:center;margin:0;padding:0;border:1px solid rgba(245,238,221,.10);border-radius:8px;background:rgba(245,238,221,.05);color:#d6ddd8;text-decoration:none;font:800 10px/1 ui-monospace,'JetBrains Mono',monospace;cursor:pointer;transition:background .15s,color .15s,border-color .15s,transform .12s}",
      "#gid-rail a:hover,#gid-rail button:hover{color:#F5EEDD;background:rgba(245,238,221,.12);border-color:rgba(245,238,221,.22);transform:translateX(1px)}",
      "#gid-rail .gid-active{background:#F5EEDD;color:#0d1114;border-color:#F5EEDD}",
      "#gid-rail .gid-accent{color:#FF8E40}",
      ".gid-container{max-width:min(var(--gid-container-native,1280px),calc(100vw - var(--gid-edge) - var(--gid-edge)))!important;padding-left:var(--gid-edge)!important;padding-right:var(--gid-edge)!important;}",
      ".gid-grid{gap:var(--gid-card-gap)!important;}",
      ".gid-grid-3{grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr))!important;}",
      ".gid-grid-4{grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr))!important;}",
      ".gid-grid-5,.gid-grid-6{grid-template-columns:repeat(auto-fit,minmax(min(100%,132px),1fr))!important;}",
      ".gid-table-grid{max-width:100%;overflow-x:auto!important;-webkit-overflow-scrolling:touch;scrollbar-width:thin;}",
      ".gid-table-grid>*{min-width:0;}",
      ".gid-flexline>*{min-width:0;}",
      ".gid-hero-type{font-size:clamp(42px,7.1vw,var(--gid-font-native,80px))!important;letter-spacing:0!important;}",
      "#dc-root.gid-canvas-root{width:100%!important;max-width:100vw!important;overflow:visible!important;}",
      "#gid-canvas-viewport{width:100%;max-width:100vw;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;scrollbar-width:thin;background:#F5EEDD;}",
      "#gid-canvas-stage{position:relative;min-width:100%;}",
      "#gid-canvas-stage>.sc-host{position:relative!important;min-width:0!important;max-width:none!important;transform-origin:0 0;will-change:transform;}",
      "html[data-gid-vp='mobile'] #gid-canvas-viewport{padding-bottom:12px;}",
      "html[data-gid-vp='tablet'] #gid-canvas-viewport{padding-bottom:14px;}",
      "html.gid-surface-central #dc-root [style*='height:100vh']{height:calc(100dvh - var(--gid-nav-h))!important;}",
      "html.gid-surface-index #dc-root [style*='height:430px']{height:auto!important;min-height:clamp(360px,58dvh,430px)!important;}",
      "html[data-gid-vp='tablet'] .gid-container{padding-left:clamp(24px,4vw,48px)!important;padding-right:clamp(24px,4vw,48px)!important;}",
      "html[data-gid-vp='mobile']{--gid-nav-h:44px;--gid-edge:16px;}",
      "html[data-gid-vp='mobile'] #gid-nav{gap:1px;font-size:11px;padding-left:10px;padding-right:10px;}",
      "html[data-gid-vp='mobile'] #gid-nav .gid-dot{width:7px;height:7px;margin-right:5px;}",
      "html[data-gid-vp='mobile'] #gid-nav a{padding:7px 8px;border-radius:6px;}",
      "html[data-gid-vp='mobile'] #gid-nav .gid-tag{display:none;}",
      "html[data-gid-vp='mobile'] #gid-rail{left:8px;top:calc(var(--gid-nav-h) + 8px);gap:4px;padding:4px;border-radius:10px;opacity:.78}",
      "html[data-gid-vp='mobile'] #gid-rail a,html[data-gid-vp='mobile'] #gid-rail button{width:28px;height:28px;border-radius:7px;font-size:9px}",
      "html[data-gid-vp='mobile'] #dc-root:not(.gid-canvas-root){padding-left:46px!important;}",
      "html.gid-surface-central:not([data-gid-vp='desktop']) #dc-root{padding-left:0!important;}",
      "html[data-gid-vp='mobile'] .gid-container{padding-left:var(--gid-edge)!important;padding-right:var(--gid-edge)!important;}",
      "html[data-gid-vp='mobile'] .gid-flexline{flex-wrap:wrap!important;}",
      "html[data-gid-vp='mobile'] .gid-hero-type{font-size:clamp(38px,13vw,var(--gid-font-native,80px))!important;line-height:1.02!important;}",
      "html[data-gid-vp='mobile'] #dc-root [style*='margin:0 -48px']{margin-left:calc(-1 * var(--gid-edge))!important;margin-right:calc(-1 * var(--gid-edge))!important;}",
      "html[data-gid-vp='mobile'] #dc-root [style*='margin: 0px -48px']{margin-left:calc(-1 * var(--gid-edge))!important;margin-right:calc(-1 * var(--gid-edge))!important;}",
      "html[data-gid-vp='mobile'] #dc-root [style*='right:48px'][style*='top:40px']{position:relative!important;right:auto!important;top:auto!important;margin-bottom:18px!important;flex-wrap:wrap!important;}",
      "html[data-gid-vp='mobile'] #dc-root [style*='min-width:300px'],html[data-gid-vp='mobile'] #dc-root [style*='min-width:260px']{min-width:min(300px,calc(100vw - var(--gid-edge) - var(--gid-edge)))!important;}",
      "html.gid-surface-plan-complet[data-gid-vp='mobile'] #dc-root [style*='display:flex'][style*='gap:12px'],html.gid-surface-plan-complet[data-gid-vp='mobile'] #dc-root [style*='display:flex'][style*='gap:14px'],html.gid-surface-plan-complet[data-gid-vp='mobile'] #dc-root [style*='display:flex'][style*='gap:20px']{flex-direction:column!important;align-items:stretch!important;}",
      "html.gid-surface-plan-complet[data-gid-vp='mobile'] #dc-root [style*='display:flex'][style*='gap:10px']{flex-wrap:wrap!important;align-items:flex-start!important;}",
      "html.gid-surface-plan-complet[data-gid-vp='mobile'] #dc-root [style*='flex:1']{width:100%!important;}",
      "html.gid-surface-plan-complet[data-gid-vp='mobile'] #dc-root .gid-flexline{flex-direction:column!important;align-items:stretch!important;}",
      "html.gid-surface-plan-complet[data-gid-vp='mobile'] #dc-root .gid-grid{grid-template-columns:1fr!important;}",
      "html.gid-surface-central:not([data-gid-vp='desktop']) #dc-root{height:auto!important;min-height:calc(100dvh - var(--gid-nav-h))!important;overflow:visible!important;background:#0a0c0f!important;}",
      "html.gid-surface-central:not([data-gid-vp='desktop']) #dc-root>.sc-host{height:auto!important;min-height:calc(100dvh - var(--gid-nav-h))!important;overflow:visible!important;}",
      "html.gid-surface-central:not([data-gid-vp='desktop']) #dc-root>.sc-host>div[style*='height:100vh'],html.gid-surface-central:not([data-gid-vp='desktop']) #dc-root>.sc-host>div[style*='height: 100vh']{height:auto!important;min-height:calc(100dvh - var(--gid-nav-h))!important;overflow:visible!important;}",
      "html.gid-surface-central:not([data-gid-vp='desktop']) #dc-root header{flex-wrap:wrap!important;align-items:flex-start!important;padding-left:58px!important;row-gap:10px!important;}",
      "html.gid-surface-central:not([data-gid-vp='desktop']) #dc-root header>div:nth-child(3){width:100%!important;flex-wrap:wrap!important;justify-content:flex-start!important;}",
      "html.gid-surface-central:not([data-gid-vp='desktop']) #dc-root main{flex-direction:column!important;min-height:auto!important;overflow:visible!important;}",
      "html.gid-surface-central:not([data-gid-vp='desktop']) #dc-root main>section{min-height:660px!important;padding-left:58px!important;}",
      "html.gid-surface-central:not([data-gid-vp='desktop']) #dc-root main>aside{width:100%!important;max-width:none!important;border-left:0!important;border-top:1px solid #20262E!important;min-height:720px!important;}",
      "html.gid-surface-central:not([data-gid-vp='desktop']) #dc-root footer{flex-wrap:wrap!important;align-items:flex-start!important;padding-left:58px!important;}",
      "html.gid-surface-central[data-gid-vp='mobile'] #dc-root header{padding:12px 12px 12px 54px!important;}",
      "html.gid-surface-central[data-gid-vp='mobile'] #dc-root header>div:first-child{align-items:flex-start!important;}",
      "html.gid-surface-central[data-gid-vp='mobile'] #dc-root main>section{min-height:560px!important;padding:12px 12px 12px 54px!important;}",
      "html.gid-surface-central[data-gid-vp='mobile'] #dc-root main>aside{min-height:780px!important;}",
      "html.gid-surface-central[data-gid-vp='mobile'] #dc-root footer{padding:10px 12px 12px 54px!important;}",
      "html[data-gid-aspect='tall'] .gid-grid-3,html[data-gid-aspect='tall'] .gid-grid-4{grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr))!important;}",
      "@media (prefers-reduced-motion:reduce){#gid-nav,#gid-rail a,#gid-rail button,.idx-card,.idx-arrow{transition:none!important;animation:none!important;}}"
    ].join("");
  }

  function slug(value) {
    var base = String(value || "index").replace(/\.dc\.html$/i, "");
    if (base.normalize) base = base.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "index";
  }

  function currentSurfaceSlug() {
    for (var i = 0; i < SURFACES.length; i++) {
      var s = SURFACES[i];
      if (s.file === current) return s.home ? "index" : slug(s.label || s.file);
    }
    return slug(current || "index");
  }

  function currentSurfaceLabel() {
    for (var i = 0; i < SURFACES.length; i++) {
      var s = SURFACES[i];
      if (s.file === current) return s.label || "Index";
    }
    return current ? current.replace(/\.dc\.html$/i, "") : "Index";
  }

  function injectCss() {
    if (document.getElementById("gid-nav-style")) return;
    var css = document.createElement("style");
    css.id = "gid-nav-style";
    css.textContent = cssText();
    document.head.appendChild(css);
  }

  function setViewportState() {
    var w = window.innerWidth || document.documentElement.clientWidth || 1280;
    var h = window.innerHeight || document.documentElement.clientHeight || 800;
    var vp = w < 700 ? "mobile" : (w < 1080 ? "tablet" : "desktop");
    var aspect = (w / Math.max(h, 1)) > 1.45 ? "wide" : ((w / Math.max(h, 1)) < 0.9 ? "tall" : "balanced");

    document.documentElement.classList.add("gid-adaptive", "gid-surface-" + currentSurfaceSlug());
    document.documentElement.dataset.gidVp = vp;
    document.documentElement.dataset.gidAspect = aspect;
    document.documentElement.style.setProperty("--gid-vw", w + "px");
    document.documentElement.style.setProperty("--gid-vh", h + "px");
    document.documentElement.style.setProperty("--gid-dpr", String(window.devicePixelRatio || 1));
  }

  function annotateInlineLayouts() {
    var root = document.getElementById("dc-root");
    if (!root) return false;
    root.classList.add("gid-adaptive-root");
    setupCanvasViewport(root);

    var nodes = root.querySelectorAll("[style]");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var style = (el.getAttribute("style") || "").toLowerCase();
      if (!style) continue;

      var max = style.match(/max-width\s*:\s*(\d+)px/);
      if (max && /margin\s*:\s*0(?:px)?\s+auto/.test(style)) {
        el.classList.add("gid-container");
        el.style.setProperty("--gid-container-native", max[1] + "px");
      }

      var font = style.match(/font-size\s*:\s*(\d+)px/) || style.match(/font\s*:[^;]*\s(\d+)px[\/\s]/);
      if (font && Number(font[1]) >= 52) {
        el.classList.add("gid-hero-type");
        el.style.setProperty("--gid-font-native", font[1] + "px");
      }

      if (/display\s*:\s*grid/.test(style)) {
        el.classList.add("gid-grid");
        if (/grid-template-columns\s*:\s*repeat\(\s*3\s*,\s*1fr\s*\)/.test(style)) el.classList.add("gid-grid-3");
        if (/grid-template-columns\s*:\s*repeat\(\s*4\s*,/.test(style)) el.classList.add("gid-grid-4");
        if (/grid-template-columns\s*:\s*repeat\(\s*5\s*,/.test(style)) el.classList.add("gid-grid-5");
        if (/grid-template-columns\s*:\s*repeat\(\s*6\s*,/.test(style)) el.classList.add("gid-grid-6");
        if ((/\d{2,3}px/.test(style) || /repeat\(\s*8\s*,/.test(style)) && el.childElementCount > 6) el.classList.add("gid-table-grid");
      }

      if (/display\s*:\s*flex/.test(style) && /gap\s*:/.test(style) && !/position\s*:\s*absolute/.test(style) && el.childElementCount > 1) {
        el.classList.add("gid-flexline");
      }
    }
    return true;
  }

  function px(value) {
    var n = parseFloat(value || "0");
    return isFinite(n) ? n : 0;
  }

  function directCanvasMetrics(host) {
    var maxX = 0;
    var maxY = 0;
    var children = host ? host.children : [];
    for (var i = 0; i < children.length; i++) {
      var el = children[i];
      var cs = window.getComputedStyle(el);
      if (cs.position !== "absolute") continue;
      var left = px(cs.left);
      var top = px(cs.top);
      var width = el.offsetWidth || px(cs.width);
      var height = el.offsetHeight || px(cs.height);
      maxX = Math.max(maxX, left + width);
      maxY = Math.max(maxY, top + height);
    }
    return { width: Math.ceil(maxX + 24), height: Math.ceil(maxY + 24) };
  }

  function unwrapCanvas(root, viewport, stage, host) {
    if (viewport && stage && host) root.insertBefore(host, viewport);
    if (viewport && viewport.parentNode) viewport.parentNode.removeChild(viewport);
    root.classList.remove("gid-canvas-root");
    root.style.removeProperty("height");
    root.style.removeProperty("min-height");
    root.style.removeProperty("overflow");
    if (host) {
      host.style.removeProperty("width");
      host.style.removeProperty("height");
      host.style.removeProperty("transform");
      host.style.removeProperty("transform-origin");
      host.style.removeProperty("position");
    }
  }

  function setupCanvasViewport(root) {
    var viewport = root.querySelector(":scope > #gid-canvas-viewport");
    var stage = viewport ? viewport.querySelector("#gid-canvas-stage") : null;
    var host = stage ? stage.querySelector(".sc-host") : root.querySelector(":scope > .sc-host");
    if (!host || !host.querySelector("[data-screen-label]")) return false;

    var vp = document.documentElement.dataset.gidVp || "desktop";
    if (vp === "desktop") {
      unwrapCanvas(root, viewport, stage, host);
      return false;
    }

    if (!viewport) {
      viewport = document.createElement("div");
      viewport.id = "gid-canvas-viewport";
      stage = document.createElement("div");
      stage.id = "gid-canvas-stage";
      root.appendChild(viewport);
      viewport.appendChild(stage);
      stage.appendChild(host);
    }

    var metrics = directCanvasMetrics(host);
    if (!metrics.width || !metrics.height) return false;

    var scale = vp === "mobile" ? 0.62 : 0.72;
    if (metrics.width <= 1440) scale = vp === "mobile" ? 0.78 : 0.9;

    var stageW = Math.ceil(metrics.width * scale);
    var stageH = Math.ceil(metrics.height * scale);
    root.classList.add("gid-canvas-root");
    root.style.setProperty("height", (stageH + 18) + "px", "important");
    root.style.setProperty("min-height", "0", "important");
    viewport.style.height = (stageH + 18) + "px";
    stage.style.width = stageW + "px";
    stage.style.height = stageH + "px";
    host.style.width = metrics.width + "px";
    host.style.height = metrics.height + "px";
    host.style.transform = "scale(" + scale + ")";
    host.style.transformOrigin = "0 0";
    host.style.position = "relative";
    return true;
  }

  function buildNav() {
    if (document.getElementById("gid-nav")) return;

    var nav = document.createElement("nav");
    nav.id = "gid-nav";
    nav.setAttribute("aria-label", "Surfaces Gnu.In-Shell");

    var dot = document.createElement("span");
    dot.className = "gid-dot";
    nav.appendChild(dot);

    SURFACES.forEach(function (s) {
      if (s.sep) {
        var d = document.createElement("span");
        d.className = "gid-sep";
        nav.appendChild(d);
        return;
      }
      var a = document.createElement("a");
      a.href = s.href || encodeURIComponent(s.file);
      if (s.external) {
        a.target = "_blank";
        a.rel = "noreferrer";
      }
      a.textContent = s.label;
      if (s.file === current) a.className = "gid-active";
      nav.appendChild(a);
    });

    var tag = document.createElement("span");
    tag.className = "gid-tag";
    tag.textContent = "gnu.in-OS · v0.14.2 beta";
    nav.appendChild(tag);

    document.body.appendChild(nav);

    var lastY = 0;
    window.addEventListener("scroll", function () {
      var y = window.scrollY || document.documentElement.scrollTop || 0;
      if (y > 90 && y > lastY) nav.classList.add("gid-hidden");
      else nav.classList.remove("gid-hidden");
      lastY = y;
    }, { passive: true });
  }

  function makeRailItem(tag, label, title, className) {
    var el = document.createElement(tag);
    el.textContent = label;
    el.title = title;
    el.setAttribute("aria-label", title);
    if (className) el.className = className;
    return el;
  }

  function buildRail() {
    if (document.getElementById("gid-rail")) return;
    var currentIndex = -1;
    var real = SURFACES.filter(function (s) { return !s.sep && !s.external && s.file; });
    for (var i = 0; i < real.length; i++) {
      if (real[i].file === current) currentIndex = i;
    }
    if (currentIndex < 0) currentIndex = 0;

    var rail = document.createElement("aside");
    rail.id = "gid-rail";
    rail.setAttribute("aria-label", "Quick tools");

    var home = makeRailItem("a", "IN", "Index", current === real[0].file ? "gid-active" : "");
    home.href = encodeURIComponent(real[0].file);
    rail.appendChild(home);

    var prev = makeRailItem("a", "<", "Surface précédente", "");
    prev.href = encodeURIComponent(real[(currentIndex + real.length - 1) % real.length].file);
    rail.appendChild(prev);

    var next = makeRailItem("a", ">", "Surface suivante", "");
    next.href = encodeURIComponent(real[(currentIndex + 1) % real.length].file);
    rail.appendChild(next);

    var top = makeRailItem("button", "^", "Retour en haut", "gid-accent");
    top.type = "button";
    top.addEventListener("click", function () {
      var canvas = document.getElementById("gid-canvas-viewport");
      if (canvas) canvas.scrollLeft = 0;
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    rail.appendChild(top);

    var gh = makeRailItem("a", "GH", "GitHub", "");
    gh.href = "https://github.com/gnu-in-labs/gnu.in-shell-docs";
    gh.target = "_blank";
    gh.rel = "noreferrer";
    rail.appendChild(gh);

    document.body.appendChild(rail);
  }

  function boot() {
    ensureFavicon();
    injectCss();
    setViewportState();
    buildNav();
    buildRail();
    annotateInlineLayouts();

    window.addEventListener("resize", setViewportState, { passive: true });
    window.addEventListener("orientationchange", setViewportState, { passive: true });

    var tries = 0;
    var iv = setInterval(function () {
      if (!document.getElementById("gid-nav") && document.body) buildNav();
      if (!document.getElementById("gid-rail") && document.body) buildRail();
      annotateInlineLayouts();
      if (++tries > 30) clearInterval(iv);
    }, 350);

    if (window.MutationObserver) {
      var mo = new MutationObserver(function () { annotateInlineLayouts(); });
      mo.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
