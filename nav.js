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
      "#gid-reader{display:none}",
      "html.gid-reader-on:not([data-gid-vp='desktop']) #dc-root{display:none!important}",
      "html.gid-reader-on:not([data-gid-vp='desktop']) #gid-reader{display:block;min-height:calc(100dvh - var(--gid-nav-h));padding:var(--gid-edge);background:#F5EEDD;color:#111418;font-family:'Montreal','Inter',system-ui,sans-serif}",
      "#gid-reader .gid-reader-shell{max-width:980px;margin:0 auto}",
      "#gid-reader .gid-reader-kicker{font:700 11px/1 'JetBrains Mono',monospace;letter-spacing:.14em;text-transform:uppercase;color:#C95400}",
      "#gid-reader .gid-reader-title{font-weight:700;font-size:clamp(34px,9vw,58px);line-height:1.02;letter-spacing:0;color:#111418;margin-top:12px}",
      "#gid-reader .gid-reader-meta{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;color:#56606a;font:600 11px/1 'JetBrains Mono',monospace}",
      "#gid-reader .gid-reader-meta span{padding:8px 10px;border:1px solid #D7DADF;border-radius:7px;background:#fff}",
      "#gid-reader .gid-reader-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:12px;margin-top:22px}",
      "#gid-reader .gid-reader-card{border:1px solid #E2DCCB;border-radius:8px;background:#fff;padding:16px;box-shadow:0 6px 18px rgba(17,20,24,.07)}",
      "#gid-reader .gid-reader-label{font:700 12px/1.25 'JetBrains Mono',monospace;color:#FF6A00}",
      "#gid-reader .gid-reader-text{margin-top:10px;font:400 14px/1.55 'Montreal','Inter',system-ui,sans-serif;color:#3a4048;overflow-wrap:anywhere}",
      ".gid-container{max-width:min(var(--gid-container-native,1280px),calc(100vw - var(--gid-edge) - var(--gid-edge)))!important;padding-left:var(--gid-edge)!important;padding-right:var(--gid-edge)!important;}",
      ".gid-grid{gap:var(--gid-card-gap)!important;}",
      ".gid-grid-3{grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr))!important;}",
      ".gid-grid-4{grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr))!important;}",
      ".gid-grid-5,.gid-grid-6{grid-template-columns:repeat(auto-fit,minmax(min(100%,132px),1fr))!important;}",
      ".gid-table-grid{max-width:100%;overflow-x:auto!important;-webkit-overflow-scrolling:touch;scrollbar-width:thin;}",
      ".gid-table-grid>*{min-width:0;}",
      ".gid-flexline>*{min-width:0;}",
      ".gid-hero-type{font-size:clamp(42px,7.1vw,var(--gid-font-native,80px))!important;letter-spacing:0!important;}",
      "html.gid-surface-central #dc-root [style*='height:100vh']{height:calc(100dvh - var(--gid-nav-h))!important;}",
      "html.gid-surface-index #dc-root [style*='height:430px']{height:auto!important;min-height:clamp(360px,58dvh,430px)!important;}",
      "html[data-gid-vp='tablet'] .gid-container{padding-left:clamp(24px,4vw,48px)!important;padding-right:clamp(24px,4vw,48px)!important;}",
      "html[data-gid-vp='mobile']{--gid-nav-h:44px;--gid-edge:16px;}",
      "html[data-gid-vp='mobile'] #gid-nav{gap:1px;font-size:11px;padding-left:10px;padding-right:10px;}",
      "html[data-gid-vp='mobile'] #gid-nav .gid-dot{width:7px;height:7px;margin-right:5px;}",
      "html[data-gid-vp='mobile'] #gid-nav a{padding:7px 8px;border-radius:6px;}",
      "html[data-gid-vp='mobile'] #gid-nav .gid-tag{display:none;}",
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
      "html[data-gid-aspect='tall'] .gid-grid-3,html[data-gid-aspect='tall'] .gid-grid-4{grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr))!important;}",
      "@media (prefers-reduced-motion:reduce){#gid-nav,.idx-card,.idx-arrow{transition:none!important;animation:none!important;}}"
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
    updateReaderMode();
  }

  function textFor(el) {
    var raw = (el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();
    raw = raw.replace(/\barrow_forward\b/g, "").replace(/\beast\b/g, "").replace(/\s+/g, " ").trim();
    if (raw.length > 760) raw = raw.slice(0, 740).replace(/\s+\S*$/, "") + "…";
    return raw;
  }

  function make(tag, className, text) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  }

  function buildReader(root) {
    if (document.getElementById("gid-reader")) return true;
    var panels = root.querySelectorAll("[data-screen-label]");
    if (!panels.length) return false;

    var reader = document.createElement("main");
    reader.id = "gid-reader";
    reader.setAttribute("aria-label", currentSurfaceLabel());

    var shell = make("div", "gid-reader-shell");
    shell.appendChild(make("div", "gid-reader-kicker", "gnu.in-OS · v0.14.2 beta"));
    shell.appendChild(make("div", "gid-reader-title", currentSurfaceLabel()));

    var meta = make("div", "gid-reader-meta");
    meta.appendChild(make("span", "", "auto " + (document.documentElement.dataset.gidVp || "desktop")));
    meta.appendChild(make("span", "", panels.length + " sections"));
    meta.appendChild(make("span", "", "render-first GPUI"));
    shell.appendChild(meta);

    var grid = make("div", "gid-reader-grid");
    for (var i = 0; i < panels.length; i++) {
      var label = panels[i].getAttribute("data-screen-label") || ("Section " + (i + 1));
      var body = textFor(panels[i]);
      if (!body) continue;
      var card = make("section", "gid-reader-card");
      card.appendChild(make("div", "gid-reader-label", label));
      card.appendChild(make("div", "gid-reader-text", body));
      grid.appendChild(card);
    }

    shell.appendChild(grid);
    reader.appendChild(shell);
    root.parentNode.insertBefore(reader, root.nextSibling);
    return true;
  }

  function updateReaderMode() {
    var reader = document.getElementById("gid-reader");
    var narrow = document.documentElement.dataset.gidVp !== "desktop";
    if (reader && narrow) document.documentElement.classList.add("gid-reader-on");
    else document.documentElement.classList.remove("gid-reader-on");
  }

  function annotateInlineLayouts() {
    var root = document.getElementById("dc-root");
    if (!root) return false;
    root.classList.add("gid-adaptive-root");
    if (buildReader(root)) updateReaderMode();

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

  function boot() {
    ensureFavicon();
    injectCss();
    setViewportState();
    buildNav();
    annotateInlineLayouts();

    window.addEventListener("resize", setViewportState, { passive: true });
    window.addEventListener("orientationchange", setViewportState, { passive: true });

    var tries = 0;
    var iv = setInterval(function () {
      if (!document.getElementById("gid-nav") && document.body) buildNav();
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
