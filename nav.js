/* Shared navigation + viewport adaptation for the Gnu.In-Shell deck.
 * Loaded from each page's <head> (OUTSIDE <x-dc>) so it never enters the
 * dc-runtime template and can't break its compile. */
(function () {
  var WIREFRAME_SURFACES = [
    { label: "Fondations", file: "Gnu.In-Shell - Fondations.dc.html", step: "01" },
    { label: "Atomes", file: "Gnu.In-Shell - Atomes.dc.html", step: "02" },
    { label: "Molécules", file: "Gnu.In-Shell - Molécules.dc.html", step: "03" },
    { label: "Intégration", file: "Gnu.In-Shell - Intégration.dc.html", step: "04" },
    { label: "Handoff", file: "Gnu.In-Shell - Handoff.dc.html", step: "05" }
  ];

  var CONTEXT_SURFACES = [
    { label: "Menus contextuels", file: "Gnu.In Context Menus.dc.html", step: "C1", copy: "guide" },
    { label: "Renderer", file: "Molecule Renderer.dc.html", step: "C2", copy: "data" },
    { label: "Animations", file: "Animations.dc.html", step: "C3", copy: "states" },
    { label: "Motion", file: "Motion.dc.html", step: "C4", copy: "rules" },
    { label: "Syster kit", file: "Sys.ter Mascot Kit.dc.html", step: "C5", copy: "mascot" }
  ];

  var DOC_SURFACES = [
    { label: "Projet", file: "Project.dc.html", step: "P" },
    { label: "Central Live", file: "Central Live.dc.html", step: "CL" },
    { label: "Methodology", file: "Methodology.dc.html", step: "M" },
    { label: "Assets", file: "Assets.dc.html", step: "A" },
    { label: "Evidence", file: "Evidence.dc.html", step: "E" },
    { label: "Communications", file: "Communications.dc.html", step: "C" },
    { label: "Roadmap", file: "Roadmap.dc.html", step: "R" },
    { label: "Full Plan", file: "gnu.in-OS - Plan de Fusion (complet).dc.html", step: "FP" }
  ];

  var SURFACES = [
    { label: "Index", file: "Gnu.In-Shell - Index.dc.html", home: true },
    { label: "Docs", file: "Project.dc.html", children: DOC_SURFACES, menuTitle: "Docs / corpus", menuHint: "Projet -> preuves" },
    { label: "Atlas", file: "Gnu.In-Shell - Atlas Unifié.dc.html", children: WIREFRAME_SURFACES, menuTitle: "Atlas / parcours", menuHint: "Fondations -> Handoff" },
    { sep: true },
    { label: "Context", file: "Context.dc.html", children: CONTEXT_SURFACES, menuTitle: "Context / références", menuHint: "guides réactifs" },
    { label: "Central", file: "Central.dc.html" },
    { label: "GitHub", href: "https://github.com/gnu-in-labs/gnu.in-shell-docs", external: true }
  ];

  var LANGS = ["en", "fr"];
  var DEFAULT_LANG = "en";
  var TRANSLATIONS = {
    en: {
      "Atomes": "Atoms",
      "Central Live": "Central Live",
      "Communications": "Communications",
      "Context / références": "Context / references",
      "Full Plan": "Full Plan",
      "guides réactifs": "reactive guides",
      "Corpus public": "Public corpus",
      "Canevas Atlas": "Atlas canvases",
      "Guides réactifs": "Reactive guides",
      "Simulation live": "Live simulation",
      "Contextes": "Contexts",
      "Menus contextuels": "Context menus",
      "Docs / corpus": "Docs / corpus",
      "Fondations": "Foundations",
      "Intégration": "Integration",
      "Méthodologie": "Methodology",
      "Methodology": "Methodology",
      "Molécules": "Molecules",
      "Plan complet": "Full plan",
      "Projet": "Project",
      "Syster kit": "Syster kit",
      "Atlas / parcours": "Atlas / path",
      "Fondations -> Handoff": "Foundations -> Handoff",
      "Source publique": "Public source",
      "Menus / contextes": "Menus / contexts",
      "Projet -> preuves": "Project -> evidence",
      "ouvrir": "open",
      "Ouvrir la barre": "Open rail",
      "Rétracter la barre": "Collapse rail",
      "Surfaces Gnu.In-Shell": "Gnu.In-Shell surfaces"
    },
    fr: {}
  };

  var currentLang = resolveLanguage();
  var current = "";
  try { current = decodeURIComponent(location.pathname.split("/").pop() || ""); } catch (e) { current = location.pathname.split("/").pop() || ""; }

  function t(value) {
    var text = String(value || "");
    return (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][text]) || text;
  }

  function langFromUrl() {
    try {
      var value = new URLSearchParams(location.search).get("lang");
      value = normalizeLang(value);
      return LANGS.indexOf(value) >= 0 ? value : "";
    } catch (e) {
      return "";
    }
  }

  function normalizeLang(value) {
    value = String(value || "").toLowerCase();
    if (value === "eng") return "en";
    if (value === "fra" || value === "fre") return "fr";
    return value.slice(0, 2);
  }

  function browserLanguage() {
    var languages = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""];
    for (var i = 0; i < languages.length; i++) {
      var lang = normalizeLang(languages[i]);
      if (LANGS.indexOf(lang) >= 0) return lang;
    }
    return DEFAULT_LANG;
  }

  function resolveLanguage() {
    var explicit = langFromUrl();
    if (explicit) {
      try { localStorage.setItem("gid-lang", explicit); } catch (e) {}
      return explicit;
    }
    var stored = "";
    try { stored = normalizeLang(localStorage.getItem("gid-lang")); } catch (e) {}
    if (LANGS.indexOf(stored) >= 0) return stored;
    return browserLanguage() || DEFAULT_LANG;
  }

  function ensureLanguageProfile() {
    document.documentElement.lang = currentLang;
    document.documentElement.dataset.gidLang = currentLang;
    ensureAlternateLang("en");
    ensureAlternateLang("fr");
    if (!langFromUrl()) {
      try {
        var url = new URL(location.href);
        url.searchParams.set("lang", currentLang || DEFAULT_LANG);
        history.replaceState(null, "", url.pathname + url.search + url.hash);
      } catch (e) {}
    }
  }

  function ensureAlternateLang(lang) {
    var id = "gid-alt-" + lang;
    if (document.getElementById(id)) return;
    var link = document.createElement("link");
    link.id = id;
    link.rel = "alternate";
    link.hreflang = lang;
    link.href = withLang(location.pathname.split("/").pop() || current || "Gnu.In-Shell - Index.dc.html", lang);
    document.head.appendChild(link);
  }

  function withLang(href, lang) {
    if (!href || /^https?:/i.test(href) || /^mailto:/i.test(href) || href.charAt(0) === "#") return href;
    var parts = String(href).split("#");
    var base = parts[0];
    var hash = parts.length > 1 ? "#" + parts.slice(1).join("#") : "";
    var queryIndex = base.indexOf("?");
    var pathPart = queryIndex >= 0 ? base.slice(0, queryIndex) : base;
    var queryPart = queryIndex >= 0 ? base.slice(queryIndex + 1) : "";
    var params = new URLSearchParams(queryPart);
    params.set("lang", lang || currentLang || DEFAULT_LANG);
    return pathPart + "?" + params.toString() + hash;
  }

  function setLanguage(lang) {
    lang = normalizeLang(lang);
    if (LANGS.indexOf(lang) < 0 || lang === currentLang) return;
    try { localStorage.setItem("gid-lang", lang); } catch (e) {}
    try {
      var url = new URL(location.href);
      url.searchParams.set("lang", lang);
      location.href = url.pathname + url.search + url.hash;
    } catch (e) {
      location.search = "lang=" + encodeURIComponent(lang);
    }
  }

  function installPretextApi() {
    window.GnuInPretext = {
      lang: currentLang,
      defaultLang: DEFAULT_LANG,
      t: t,
      setLanguage: setLanguage,
      withLang: withLang,
      register: function (lang, map) {
        lang = normalizeLang(lang);
        if (LANGS.indexOf(lang) < 0 || !map) return;
        TRANSLATIONS[lang] = Object.assign(TRANSLATIONS[lang] || {}, map);
        applyPretext();
      },
      apply: applyPretext
    };
  }

  function applyPretext() {
    var nodes = document.querySelectorAll("[data-pretext-key]");
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var key = node.getAttribute("data-pretext-key");
      var value = t(key);
      // Idempotency guard: only write on a real change. Assigning textContent is itself a childList
      // mutation, so an unconditional write here re-triggers the MutationObserver that calls this
      // function -> infinite loop (page freezes blank) once any translation is registered. Skipping
      // no-op writes breaks that loop and lets React-rendered pages settle after a re-render.
      if (value && value !== key && node.textContent !== value) node.textContent = value;
    }
  }

  function localizePageLinks() {
    var links = document.querySelectorAll("a[href]");
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var href = a.getAttribute("href") || "";
      if (!href || href.charAt(0) === "#" || /^https?:/i.test(href) || /^mailto:/i.test(href)) continue;
      var next = withLang(href, currentLang);
      if (next !== href) a.setAttribute("href", next);
    }
  }

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
      "#gid-nav{position:fixed;top:0;left:0;right:0;z-index:2147483600;display:flex;align-items:center;gap:2px;box-sizing:border-box;max-width:100vw;",
      "height:var(--gid-nav-h);padding:0 max(12px,env(safe-area-inset-right)) 0 max(12px,env(safe-area-inset-left));overflow-x:auto;overflow-y:hidden;scrollbar-width:none;",
      "font:500 12px/1 ui-monospace,'IBM Plex Mono','JetBrains Mono',SFMono-Regular,Menlo,monospace;",
      "letter-spacing:.04em;color:#cdd3d0;background:linear-gradient(180deg,rgba(37,41,40,.96),rgba(16,19,21,.94));",
      "-webkit-backdrop-filter:blur(12px) saturate(1.16);backdrop-filter:blur(12px) saturate(1.16);",
      "border-bottom:1px solid rgba(245,238,221,.14);box-shadow:0 10px 28px rgba(0,0,0,.22);transition:transform .25s cubic-bezier(.2,.7,.2,1);}",
      "#gid-nav::-webkit-scrollbar{display:none}",
      "#gid-nav.gid-hidden{transform:translateY(-100%)}",
      "#gid-nav-progress{position:fixed;top:calc(var(--gid-nav-h) - 3px);left:0;right:0;height:3px;z-index:2147483602;pointer-events:none;background:rgba(245,238,221,.04);transition:transform .25s cubic-bezier(.2,.7,.2,1),opacity .18s;}",
      "#gid-nav.gid-hidden+#gid-nav-progress{transform:translateY(-100%);opacity:0;}",
      "#gid-nav-progress span{display:block;width:var(--gid-progress-pct,8%);height:100%;background:linear-gradient(90deg,#FF6A00,#FF8E40);box-shadow:0 0 10px rgba(255,106,0,.38);transition:width .22s ease;}",
      "#gid-nav .gid-dot{flex:0 0 auto;width:9px;height:9px;border-radius:50%;background:#FF6A00;box-shadow:0 0 9px #FF6A00;margin-right:8px}",
      "#gid-nav a{flex:0 0 auto;color:#aeb6b2;text-decoration:none;padding:7px 10px;border:1px solid transparent;border-radius:7px;white-space:nowrap;transition:background .15s,color .15s,border-color .15s,box-shadow .15s}",
      "#gid-nav a:hover{color:#f5eedd;background:rgba(245,238,221,.08);border-color:rgba(245,238,221,.09)}",
      "#gid-nav a.gid-active{color:#0d1114;background:#F5EEDD;border-color:#F5EEDD;font-weight:700;box-shadow:0 0 0 1px rgba(255,106,0,.28)}",
      "#gid-nav a:focus,#gid-nav button:focus,#gid-rail a:focus,#gid-rail button:focus,#dc-root a:focus,#dc-root button:focus,#dc-root summary:focus{outline:3px solid #FF6A00!important;outline-offset:3px!important;}",
      "#gid-nav .gid-nav-group{position:relative;flex:0 0 auto;display:flex;align-items:center;gap:1px;}",
      "#gid-nav .gid-nav-group{padding:2px;border-radius:9px;background:rgba(245,238,221,.035);border:1px solid rgba(245,238,221,.055);}",
      "#gid-nav .gid-nav-group>a{border-top-right-radius:4px;border-bottom-right-radius:4px;}",
      "#gid-nav .gid-nav-group.gid-parent-active{background:rgba(245,238,221,.08);border-color:rgba(255,106,0,.22);}",
      "#gid-nav .gid-nav-group.gid-parent-active>a{color:#0d1114;background:#F5EEDD;font-weight:700;}",
      "#gid-nav .gid-nav-trigger{flex:0 0 auto;width:24px;height:28px;display:grid;place-items:center;margin:0;padding:0;border:0;border-radius:4px;background:rgba(245,238,221,.05);color:#aeb6b2;font:900 10px/1 ui-monospace,'JetBrains Mono',monospace;cursor:pointer;}",
      "#gid-nav .gid-nav-trigger:hover,#gid-nav .gid-nav-group:focus-within .gid-nav-trigger,#gid-nav .gid-nav-group.gid-open .gid-nav-trigger{color:#F5EEDD;background:rgba(255,106,0,.18);}",
      ".gid-menu{position:fixed;top:calc(var(--gid-nav-h) + 8px);left:58px;z-index:2147483605;display:none;width:min(316px,calc(100vw - 72px));box-sizing:border-box;padding:10px;border:1px solid rgba(245,238,221,.14);border-radius:10px;background:rgba(13,17,20,.94);-webkit-backdrop-filter:blur(12px) saturate(1.12);backdrop-filter:blur(12px) saturate(1.12);box-shadow:0 18px 42px rgba(0,0,0,.34);}",
      ".gid-menu.gid-open{display:block;}",
      ".gid-menu-title{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:5px 6px 10px;color:#7c828a;font:800 9px/1 ui-monospace,'JetBrains Mono',monospace;letter-spacing:.12em;text-transform:uppercase;}",
      ".gid-menu-title span:last-child{color:#FF8E40;letter-spacing:.04em;}",
      ".gid-menu a{display:grid;grid-template-columns:28px minmax(0,1fr) auto;align-items:center;gap:10px;width:100%;padding:9px 10px;border-radius:8px;color:#d6ddd8;text-decoration:none;background:transparent;border:1px solid transparent;font:600 11px/1.2 ui-monospace,'JetBrains Mono',monospace;}",
      ".gid-menu a+a{margin-top:5px;}",
      ".gid-menu a:hover{background:rgba(245,238,221,.08);border-color:rgba(245,238,221,.12);}",
      ".gid-menu a.gid-active{background:#F5EEDD;color:#0d1114;border-color:#F5EEDD;}",
      ".gid-menu-step{color:#FF8E40;font-weight:800;}",
      ".gid-menu-copy{color:#7c828a;font-weight:700;font-size:9px;text-transform:uppercase;letter-spacing:.08em;}",
      "#gid-nav .gid-sep{flex:0 0 auto;width:1px;height:16px;background:rgba(245,238,221,.18);margin:0 6px}",
      "#gid-nav .gid-tag{flex:0 0 auto;margin-left:auto;padding:6px 9px;border:1px solid rgba(245,238,221,.1);border-radius:999px;color:#8f9994;background:rgba(245,238,221,.035);font-size:10px;letter-spacing:.1em;text-transform:uppercase;white-space:nowrap}",
      "#gid-nav .gid-lang{flex:0 0 auto;display:flex;align-items:center;gap:2px;margin-left:6px;padding:3px;border:1px solid rgba(245,238,221,.12);border-radius:8px;background:rgba(245,238,221,.04);}",
      "#gid-nav .gid-lang button{width:28px;height:24px;border:0;border-radius:5px;background:transparent;color:#9aa3ae;font:800 9px/1 ui-monospace,'JetBrains Mono',monospace;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;}",
      "#gid-nav .gid-lang button[aria-pressed='true']{background:#F5EEDD;color:#0d1114;}",
      ".gid-sr{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important;}",
      "#gid-rail{box-sizing:border-box;position:fixed;left:clamp(16px,2vw,28px);top:calc(var(--gid-nav-h) + 18px);z-index:2147483590;display:flex;flex-direction:column;gap:7px;padding:7px;border:1px solid rgba(245,238,221,.16);border-radius:16px;background:rgba(13,17,20,.74);-webkit-backdrop-filter:blur(16px) saturate(1.14);backdrop-filter:blur(16px) saturate(1.14);box-shadow:0 22px 46px rgba(0,0,0,.32),0 0 0 1px rgba(255,255,255,.04) inset;opacity:.9;isolation:isolate;touch-action:auto;user-select:none;will-change:left,top,width,height,border-radius,box-shadow;transition:opacity .15s,border-color .15s,box-shadow .18s,background .18s,border-radius .18s,padding .18s}",
      "#gid-rail::before{content:\"\";position:absolute;inset:3px;border-radius:13px;border:1px solid rgba(255,255,255,.05);pointer-events:none;transition:border-radius .18s;}",
      "#gid-rail::after{content:\"\";position:absolute;right:3px;top:11px;width:2px;height:var(--gid-rail-progress,8%);max-height:calc(100% - 22px);border-radius:999px;background:#FF6A00;box-shadow:0 0 10px rgba(255,106,0,.45);transition:width .18s,height .18s,top .18s,right .18s;}",
      "#gid-rail:hover,#gid-rail:focus-within{opacity:1}",
      "#gid-rail a,#gid-rail button{width:30px;height:30px;display:grid;place-items:center;margin:0;padding:0;border:1px solid rgba(245,238,221,.10);border-radius:8px;background:rgba(245,238,221,.05);color:#d6ddd8;text-decoration:none;font:800 10px/1 ui-monospace,'JetBrains Mono',monospace;cursor:pointer;transition:background .15s,color .15s,border-color .15s,transform .12s}",
      "#gid-rail a:hover,#gid-rail button:hover{color:#F5EEDD;background:rgba(245,238,221,.12);border-color:rgba(245,238,221,.22);transform:translateX(1px)}",
      "#gid-rail .gid-active{background:#F5EEDD;color:#0d1114;border-color:#F5EEDD}",
      "#gid-rail .gid-accent{color:#FF8E40}",
      "#gid-rail .gid-rail-handle{height:24px;border-style:dashed;color:#7c828a;background:rgba(245,238,221,.035);cursor:grab;font-size:11px;letter-spacing:.08em}",
      "#gid-rail .gid-rail-handle:hover,#gid-rail.gid-rail-dragging .gid-rail-handle{color:#FF8E40;border-color:rgba(255,106,0,.34);background:rgba(255,106,0,.08);transform:none}",
      "#gid-rail .gid-rail-toggle{color:#FF8E40}",
      "#gid-rail .gid-rail-handle,#gid-rail.gid-rail-collapsed .gid-rail-toggle{touch-action:none;}",
      "#gid-rail.gid-rail-dragging{opacity:1;cursor:grabbing;border-color:rgba(255,106,0,.42);box-shadow:0 26px 54px rgba(0,0,0,.38),0 0 0 1px rgba(255,106,0,.22) inset}",
      "#gid-rail.gid-rail-dragging a,#gid-rail.gid-rail-dragging button{cursor:grabbing}",
      "#gid-rail.gid-rail-collapsed{width:58px;height:58px;padding:7px;gap:0;border-radius:999px;background:rgba(13,17,20,.86);box-shadow:0 22px 48px rgba(0,0,0,.38),0 0 0 1px rgba(255,106,0,.26) inset}",
      "#gid-rail.gid-rail-collapsed::before{border-radius:999px;inset:4px}",
      "#gid-rail.gid-rail-collapsed::after{width:8px;height:8px;right:5px;top:5px;max-height:none}",
      "#gid-rail.gid-rail-collapsed>*:not(.gid-rail-toggle){display:none!important}",
      "#gid-rail.gid-rail-collapsed .gid-rail-toggle{width:42px;height:42px;border-radius:999px;background:radial-gradient(circle at 34% 24%,rgba(255,142,64,.24),rgba(255,106,0,.08) 58%,rgba(245,238,221,.04));border-color:rgba(255,106,0,.38);box-shadow:0 0 22px rgba(255,106,0,.18);font-size:0;color:#F5EEDD;overflow:visible;position:relative;}",
      "#gid-rail .gid-rail-mascot{display:none;position:relative;width:36px;height:41px;filter:drop-shadow(0 9px 9px rgba(0,0,0,.42));}",
      "#gid-rail.gid-rail-collapsed .gid-rail-mascot{display:block;animation:gidMascotFloat 2600ms ease-in-out infinite;}",
      "#gid-rail .gid-rail-mascot-shell{position:absolute;left:8%;top:24%;width:84%;height:64%;border-radius:7px;background:#FF6A00;box-shadow:inset 0 0 0 1px rgba(17,20,24,.28);}",
      "#gid-rail .gid-rail-mascot-screen{position:absolute;left:20%;top:35%;width:60%;height:43%;border-radius:4px;background:#151515;box-shadow:inset 0 0 0 1px rgba(245,238,221,.2);}",
      "#gid-rail .gid-rail-mascot-beret{position:absolute;left:17%;top:3%;width:66%;height:25%;border-radius:50% 56% 42% 48%;background:#5F7F52;transform:rotate(-6deg);box-shadow:inset 0 -1px 0 rgba(0,0,0,.24);}",
      "#gid-rail .gid-rail-mascot-antenna{position:absolute;right:2%;top:22%;width:3px;height:48%;border-radius:999px;background:#B6BCC4;}",
      "#gid-rail .gid-rail-mascot-antenna::after{content:\"\";position:absolute;left:50%;top:-2px;width:6px;height:6px;border-radius:50%;background:#3DDA6A;transform:translateX(-50%);box-shadow:0 0 10px rgba(61,218,106,.7);animation:gidMascotPing 1500ms ease-in-out infinite;}",
      "#gid-rail .gid-rail-mascot-face{position:absolute;left:28%;top:42%;color:#F5EEDD;font:900 11px/1 ui-monospace,'JetBrains Mono',monospace;letter-spacing:-.04em;}",
      "#gid-rail .gid-rail-mascot-cue{position:absolute;left:54%;top:49%;display:flex;gap:2px;}",
      "#gid-rail .gid-rail-mascot-cue span{width:2px;height:2px;border-radius:50%;background:#FF8E40;animation:gidMascotDot 1200ms ease-in-out infinite;}",
      "#gid-rail .gid-rail-mascot-cue span:nth-child(2){animation-delay:160ms;}#gid-rail .gid-rail-mascot-cue span:nth-child(3){animation-delay:320ms;}",
      "@keyframes gidMascotFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}",
      "@keyframes gidMascotPing{0%,100%{opacity:.55;transform:translateX(-50%) scale(.86)}50%{opacity:1;transform:translateX(-50%) scale(1.12)}}",
      "@keyframes gidMascotDot{0%,100%{opacity:.25}50%{opacity:1}}",
      ".gid-container{max-width:min(var(--gid-container-native,1280px),calc(100vw - var(--gid-edge) - var(--gid-edge)))!important;padding-left:var(--gid-edge)!important;padding-right:var(--gid-edge)!important;}",
      ".gid-grid{gap:var(--gid-card-gap)!important;}",
      ".gid-grid-3{grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr))!important;}",
      ".gid-grid-4{grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr))!important;}",
      ".gid-grid-5,.gid-grid-6{grid-template-columns:repeat(auto-fit,minmax(min(100%,132px),1fr))!important;}",
      ".gid-table-grid{max-width:100%;overflow-x:auto!important;-webkit-overflow-scrolling:touch;scrollbar-width:thin;}",
      ".gid-table-grid>*{min-width:0;}",
      ".gid-flexline>*{min-width:0;}",
      ".gid-hero-type{font-size:clamp(42px,7.1vw,var(--gid-font-native,80px))!important;letter-spacing:0!important;}",
      "#dc-root.gid-canvas-root{width:100%!important;max-width:100vw!important;min-height:0!important;overflow:hidden!important;padding:clamp(10px,1.8vw,22px)!important;background:#F5EEDD;}",
      "#gid-canvas-viewport{width:100%;height:var(--gid-canvas-frame-h,calc(100dvh - var(--gid-nav-h) - 44px));max-width:100%;overflow:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;scrollbar-width:thin;background:#F5EEDD;border:1px solid rgba(13,17,20,.14);border-radius:14px;box-shadow:0 16px 44px rgba(13,17,20,.12),inset 0 0 0 1px rgba(255,255,255,.5);}",
      "#gid-canvas-stage{position:relative;min-width:100%;}",
      "#gid-canvas-stage>.sc-host{position:relative!important;min-width:0!important;max-width:none!important;transform-origin:0 0;will-change:transform;}",
      "html[data-gid-vp='mobile'] #dc-root.gid-canvas-root{padding:10px 10px 10px 72px!important;}",
      "html[data-gid-vp='mobile'] #gid-canvas-viewport{border-radius:12px;}",
      "html[data-gid-vp='tablet'] #dc-root.gid-canvas-root{padding:16px 16px 16px 78px!important;}",
      "#dc-root.gid-longform-root .gid-cover-panel{overflow:hidden!important;}",
      "#dc-root.gid-longform-root .gid-cover-tools{max-width:100%;}",
      ".gid-mobile-stack{min-width:0;}",
      "html.gid-surface-central #dc-root [style*='height:100vh']{height:calc(100dvh - var(--gid-nav-h))!important;}",
      "html.gid-surface-index #dc-root [style*='height:430px']{height:auto!important;min-height:clamp(360px,58dvh,430px)!important;}",
      "html[data-gid-vp='tablet'] .gid-container{padding-left:clamp(24px,4vw,48px)!important;padding-right:clamp(24px,4vw,48px)!important;}",
      "html[data-gid-vp='mobile']{--gid-nav-h:44px;--gid-edge:16px;}",
      "html[data-gid-vp='mobile'] #gid-nav{gap:1px;font-size:11px;padding-left:10px;padding-right:10px;}",
      "html[data-gid-vp='mobile'] #gid-nav-progress{height:2px;top:calc(var(--gid-nav-h) - 2px);}",
      "html[data-gid-vp='mobile'] #gid-nav .gid-dot{width:7px;height:7px;margin-right:5px;}",
      "html[data-gid-vp='mobile'] #gid-nav a{padding:7px 8px;border-radius:6px;}",
      "html[data-gid-vp='mobile'] #gid-nav .gid-nav-trigger{width:28px;height:30px;}",
      "html[data-gid-vp='mobile'] .gid-menu{left:70px;width:min(286px,calc(100vw - 82px));top:calc(var(--gid-nav-h) + 9px);}",
      "html[data-gid-vp='mobile'] #gid-nav .gid-tag{display:none;}",
      "html[data-gid-vp='mobile'] #gid-rail{left:14px;top:calc(var(--gid-nav-h) + 14px);gap:5px;padding:6px;border-radius:15px;opacity:.92}",
      "html[data-gid-vp='mobile'] #gid-rail::before{border-radius:12px}",
      "html[data-gid-vp='mobile'] #gid-rail::after{right:3px;top:10px;max-height:calc(100% - 20px)}",
      "html[data-gid-vp='mobile'] #gid-rail a,html[data-gid-vp='mobile'] #gid-rail button{width:30px;height:30px;border-radius:9px;font-size:9px}",
      "html[data-gid-vp='mobile'] #gid-rail .gid-rail-handle{height:24px}",
      "html[data-gid-vp='mobile'] #gid-rail.gid-rail-collapsed{width:58px;height:58px;padding:7px;border-radius:999px}",
      "html[data-gid-vp='mobile'].gid-rail-collapsed-mode #dc-root:not(.gid-canvas-root){padding-left:0!important;}",
      "html[data-gid-vp='mobile'].gid-rail-collapsed-mode #dc-root.gid-canvas-root{padding-left:10px!important;}",
      "html[data-gid-vp='mobile'] #dc-root:not(.gid-canvas-root){padding-left:64px!important;}",
      "html.gid-surface-central:not([data-gid-vp='desktop']) #dc-root{padding-left:0!important;}",
      "html:not([data-gid-vp='mobile']).gid-surface-roadmap #dc-root .road-shell,html:not([data-gid-vp='mobile']).gid-surface-syster-kit #dc-root .kit-shell,html:not([data-gid-vp='mobile']).gid-surface-animations #dc-root .ani-shell{width:min(1180px,calc(100% - 156px))!important;margin-left:clamp(92px,8vw,118px)!important;margin-right:auto!important;}",
      "html.gid-surface-renderer #dc-root,html.gid-surface-menus #dc-root,html.gid-surface-film #dc-root{overflow-x:hidden!important;}",
      "html[data-gid-vp='mobile'] .gid-container{padding-left:var(--gid-edge)!important;padding-right:var(--gid-edge)!important;}",
      "html[data-gid-vp='mobile'] .gid-flexline{flex-wrap:wrap!important;}",
      "html[data-gid-vp='mobile'] .gid-hero-type{font-size:clamp(38px,13vw,var(--gid-font-native,80px))!important;line-height:1.02!important;}",
      "html[data-gid-vp='mobile'] #dc-root [style*='margin:0 -48px']{margin-left:calc(-1 * var(--gid-edge))!important;margin-right:calc(-1 * var(--gid-edge))!important;}",
      "html[data-gid-vp='mobile'] #dc-root [style*='margin: 0px -48px']{margin-left:calc(-1 * var(--gid-edge))!important;margin-right:calc(-1 * var(--gid-edge))!important;}",
      "html[data-gid-vp='mobile'] #dc-root [style*='right:48px'][style*='top:40px']{position:relative!important;right:auto!important;top:auto!important;margin-bottom:18px!important;flex-wrap:wrap!important;}",
      "html[data-gid-vp='mobile'] #dc-root.gid-longform-root .gid-cover-panel{padding:28px 16px 30px!important;}",
      "html[data-gid-vp='mobile'] #dc-root.gid-longform-root .gid-cover-tools{position:relative!important;right:auto!important;top:auto!important;display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:6px!important;align-items:end!important;margin:0 0 16px!important;}",
      "html[data-gid-vp='mobile'] #dc-root.gid-longform-root .gid-cover-tools>*{width:auto!important;height:42px!important;min-width:0!important;max-width:100%!important;margin-left:0!important;}",
      "html[data-gid-vp='mobile'] #dc-root.gid-longform-root .gid-cover-tools>*:last-child{height:52px!important;}",
      "html[data-gid-vp='mobile'] #dc-root.gid-longform-root .gid-hero-type{font-size:clamp(34px,11vw,var(--gid-font-native,56px))!important;line-height:1.02!important;letter-spacing:0!important;}",
      "html[data-gid-vp='mobile'] #dc-root.gid-longform-root .gid-flexline{row-gap:10px!important;}",
      "html[data-gid-vp='mobile'] #dc-root .gid-mobile-stack{flex-direction:column!important;align-items:stretch!important;gap:16px!important;padding:20px!important;}",
      "html[data-gid-vp='mobile'] #dc-root .gid-mobile-stack>[style*='width:1px'],html[data-gid-vp='mobile'] #dc-root .gid-mobile-stack>[style*='width: 1px']{width:100%!important;height:1px!important;align-self:stretch!important;}",
      "html[data-gid-vp='mobile'] #dc-root .gid-mobile-stack>[style*='flex:1'],html[data-gid-vp='mobile'] #dc-root .gid-mobile-stack>[style*='flex: 1']{width:100%!important;flex:none!important;display:grid!important;grid-template-columns:1fr!important;gap:8px!important;}",
      "html[data-gid-vp='mobile'] #dc-root .gid-mobile-stack>[style*='flex:1']>span,html[data-gid-vp='mobile'] #dc-root .gid-mobile-stack>[style*='flex: 1']>span{width:auto!important;display:flex!important;align-items:center!important;justify-content:space-between!important;white-space:normal!important;overflow-wrap:anywhere!important;}",
      "html[data-gid-vp='mobile'] #dc-root [style*='min-width:300px'],html[data-gid-vp='mobile'] #dc-root [style*='min-width:260px']{min-width:min(300px,calc(100vw - var(--gid-edge) - var(--gid-edge)))!important;}",
      "html.gid-surface-plan-complet[data-gid-vp='mobile'] #dc-root [style*='display:flex'][style*='gap:12px'],html.gid-surface-plan-complet[data-gid-vp='mobile'] #dc-root [style*='display:flex'][style*='gap:14px'],html.gid-surface-plan-complet[data-gid-vp='mobile'] #dc-root [style*='display:flex'][style*='gap:20px']{flex-direction:column!important;align-items:stretch!important;}",
      "html.gid-surface-plan-complet[data-gid-vp='mobile'] #dc-root [style*='display:flex'][style*='gap:10px']{flex-wrap:wrap!important;align-items:flex-start!important;}",
      "html.gid-surface-plan-complet[data-gid-vp='mobile'] #dc-root [style*='flex:1']{width:100%!important;}",
      "html.gid-surface-plan-complet[data-gid-vp='mobile'] #dc-root .gid-flexline{flex-direction:column!important;align-items:stretch!important;}",
      "html.gid-surface-plan-complet[data-gid-vp='mobile'] #dc-root .gid-grid{grid-template-columns:1fr!important;}",
      "html.gid-surface-central:not([data-gid-vp='desktop']) #dc-root{height:auto!important;min-height:calc(100dvh - var(--gid-nav-h))!important;overflow:visible!important;background:#0a0c0f!important;}",
      "html.gid-surface-central:not([data-gid-vp='desktop']) #dc-root>.sc-host{height:auto!important;min-height:calc(100dvh - var(--gid-nav-h))!important;overflow:visible!important;}",
      "html.gid-surface-central:not([data-gid-vp='desktop']) #dc-root>.sc-host>div[style*='height:100vh'],html.gid-surface-central:not([data-gid-vp='desktop']) #dc-root>.sc-host>div[style*='height: 100vh']{height:auto!important;min-height:calc(100dvh - var(--gid-nav-h))!important;overflow:visible!important;}",
      "html.gid-surface-central:not([data-gid-vp='desktop']) #dc-root header{flex-wrap:wrap!important;align-items:flex-start!important;padding-left:74px!important;row-gap:10px!important;}",
      "html.gid-surface-central:not([data-gid-vp='desktop']) #dc-root header>div:nth-child(3){width:100%!important;flex-wrap:wrap!important;justify-content:flex-start!important;}",
      "html.gid-surface-central:not([data-gid-vp='desktop']) #dc-root main{flex-direction:column!important;min-height:auto!important;overflow:visible!important;}",
      "html.gid-surface-central:not([data-gid-vp='desktop']) #dc-root main>section{min-height:660px!important;padding-left:74px!important;}",
      "html.gid-surface-central:not([data-gid-vp='desktop']) #dc-root main>aside{width:100%!important;max-width:none!important;border-left:0!important;border-top:1px solid #20262E!important;min-height:720px!important;}",
      "html.gid-surface-central:not([data-gid-vp='desktop']) #dc-root footer{flex-wrap:wrap!important;align-items:flex-start!important;padding-left:74px!important;}",
      "html.gid-surface-central[data-gid-vp='mobile'] #dc-root header{padding:12px 12px 12px 72px!important;}",
      "html.gid-surface-central[data-gid-vp='mobile'] #dc-root header>div:first-child{align-items:flex-start!important;}",
      "html.gid-surface-central[data-gid-vp='mobile'] #dc-root main>section{min-height:560px!important;padding:12px 12px 12px 72px!important;}",
      "html.gid-surface-central[data-gid-vp='mobile'] #dc-root main>aside{min-height:780px!important;}",
      "html.gid-surface-central[data-gid-vp='mobile'] #dc-root footer{padding:10px 12px 12px 72px!important;}",
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
    var all = flattenSurfaces(true);
    for (var i = 0; i < all.length; i++) {
      var s = all[i];
      if (s.file === current) return s.home ? "index" : slug(s.label || s.file);
    }
    return slug(current || "index");
  }

  function currentSurfaceLabel() {
    var all = flattenSurfaces(true);
    for (var i = 0; i < all.length; i++) {
      var s = all[i];
      if (s.file === current) return s.label || "Index";
    }
    return current ? current.replace(/\.dc\.html$/i, "") : "Index";
  }

  function currentSurfaceScopeLabel() {
    if (current === "Gnu.In-Shell - Index.dc.html") return "Corpus public";
    for (var i = 0; i < SURFACES.length; i++) {
      var surface = SURFACES[i];
      if (!surface || surface.sep) continue;
      if (surface.file === current) {
        if (surface.label === "Docs") return "Corpus public";
        if (surface.label === "Atlas") return "Canevas Atlas";
        if (surface.label === "Context") return "Guides réactifs";
        if (surface.label === "Central") return "Simulation live";
        if (surface.label === "GitHub") return "Source publique";
        return surface.label || "Corpus public";
      }
      if (surface.children && surface.children.length) {
        for (var j = 0; j < surface.children.length; j++) {
          if (surface.children[j].file !== current) continue;
          if (surface.label === "Docs") return "Corpus public";
          if (surface.label === "Atlas") return "Canevas Atlas";
          if (surface.label === "Context") return "Guides réactifs";
          return surface.label || "Corpus public";
        }
      }
    }
    return "Corpus public";
  }

  function flattenSurfaces(includeExternal) {
    var out = [];
    for (var i = 0; i < SURFACES.length; i++) {
      var s = SURFACES[i];
      if (s.sep) continue;
      if ((includeExternal || !s.external) && s.file) out.push(s);
      if (s.children) {
        for (var j = 0; j < s.children.length; j++) {
          var child = s.children[j];
          if ((includeExternal || !child.external) && child.file) out.push(child);
        }
      }
      if (includeExternal && s.external) out.push(s);
    }
    return out;
  }

  function hasCurrentChild(surface) {
    if (!surface || !surface.children) return false;
    for (var i = 0; i < surface.children.length; i++) {
      if (surface.children[i].file === current) return true;
    }
    return false;
  }

  function realSurfaces() {
    return flattenSurfaces(false).filter(function (s) { return !s.external && s.file; });
  }

  function currentSurfaceIndex() {
    var real = realSurfaces();
    for (var i = 0; i < real.length; i++) {
      if (real[i].file === current) return i;
    }
    return 0;
  }

  function currentSurfaceProgress() {
    var real = realSurfaces();
    var index = currentSurfaceIndex();
    return {
      index: index,
      total: real.length || 1,
      pct: (((index + 1) / Math.max(real.length, 1)) * 100).toFixed(2) + "%"
    };
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
    setupLongformMode(root);

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

      if (/background\s*:\s*(#0d1014|rgb\(\s*13\s*,\s*16\s*,\s*20\s*\))/.test(style) && /overflow\s*:\s*hidden/.test(style) && /padding\s*:\s*46px\s+48px\s+40px/.test(style)) {
        el.classList.add("gid-cover-panel");
      }

      if (/right\s*:\s*48px/.test(style) && /top\s*:\s*40px/.test(style) && /display\s*:\s*flex/.test(style)) {
        el.classList.add("gid-cover-tools");
      }

      if (/display\s*:\s*flex/.test(style) && /gap\s*:\s*(24|28|30|32)px/.test(style) && /background\s*:\s*(#111418|rgb\(\s*17\s*,\s*20\s*,\s*24\s*\))/.test(style) && /border-radius\s*:\s*(12|16)px/.test(style)) {
        el.classList.add("gid-mobile-stack");
      }
    }
    return true;
  }

  function setupLongformMode(root) {
    if (!root || root.classList.contains("gid-canvas-root")) {
      if (root) root.classList.remove("gid-longform-root");
      return false;
    }
    if (document.documentElement.classList.contains("gid-surface-central")) {
      root.classList.remove("gid-longform-root");
      return false;
    }

    var host = root.querySelector(":scope > .sc-host") || root;
    var hasInlineShell = hasInlineStyle(host, /max-width\s*:\s*(1340|1280)px/);
    var hasReportCover = hasInlineStyle(host, /margin\s*:\s*0(px)?\s+-48px/);
    var hasNamedClasses = !!host.querySelector("[class*='road-'],[class*='ani-'],[class*='kit-'],[class*='idx-'],[class*='cx-']");
    var enable = hasInlineShell && hasReportCover && !hasNamedClasses;
    root.classList.toggle("gid-longform-root", enable);
    return enable;
  }

  function hasInlineStyle(scope, pattern) {
    var nodes = scope ? scope.querySelectorAll("[style]") : [];
    for (var i = 0; i < nodes.length; i++) {
      var style = String(nodes[i].getAttribute("style") || "").toLowerCase();
      if (pattern.test(style)) return true;
    }
    return false;
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
    if (host.querySelector("[data-film-root]")) {
      if (viewport) unwrapCanvas(root, viewport, stage, host);
      return false;
    }

    var vp = document.documentElement.dataset.gidVp || "desktop";
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

    var scale = vp === "mobile" ? 0.62 : (vp === "tablet" ? 0.72 : 0.78);
    if (metrics.width <= 1440) scale = vp === "mobile" ? 0.78 : 0.9;

    var stageW = Math.ceil(metrics.width * scale);
    var stageH = Math.ceil(metrics.height * scale);
    var navH = px(getComputedStyle(document.documentElement).getPropertyValue("--gid-nav-h")) || (vp === "mobile" ? 44 : 40);
    var vh = window.innerHeight || document.documentElement.clientHeight || 800;
    var maxFrame = Math.max(
      vp === "mobile" ? 420 : 520,
      Math.min(vh - navH - (vp === "desktop" ? 56 : 34), vp === "desktop" ? 860 : (vp === "tablet" ? 760 : 640))
    );
    var frameH = Math.min(stageH + 2, maxFrame);
    var rootPad = vp === "mobile" ? 20 : (vp === "tablet" ? 32 : 44);
    root.classList.add("gid-canvas-root");
    root.style.setProperty("height", (frameH + rootPad) + "px", "important");
    root.style.setProperty("min-height", "0", "important");
    root.style.setProperty("--gid-canvas-frame-h", frameH + "px");
    viewport.style.height = frameH + "px";
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
    var progress = currentSurfaceProgress();

    var nav = document.createElement("nav");
    nav.id = "gid-nav";
    nav.setAttribute("aria-label", t("Surfaces Gnu.In-Shell"));

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

      if (s.children && s.children.length) {
        nav.appendChild(buildNavGroup(s));
        return;
      }

      var a = document.createElement("a");
      a.href = s.href || withLang(encodeURIComponent(s.file), currentLang);
      if (s.external) {
        a.target = "_blank";
        a.rel = "noreferrer";
      }
      a.textContent = t(s.label);
      if (s.file === current) a.className = "gid-active";
      nav.appendChild(a);
    });

    var tag = document.createElement("span");
    tag.className = "gid-tag";
    tag.textContent = t(currentSurfaceScopeLabel()) + " · v0.14.2";
    nav.appendChild(tag);

    nav.appendChild(buildLangSwitch());

    document.body.appendChild(nav);

    var bar = document.createElement("div");
    bar.id = "gid-nav-progress";
    bar.style.setProperty("--gid-progress-pct", progress.pct);
    var fill = document.createElement("span");
    bar.appendChild(fill);
    document.body.appendChild(bar);

    requestAnimationFrame(function () {
      var active = nav.querySelector(".gid-active") || nav.querySelector(".gid-parent-active>a");
      if (active && active.scrollIntoView) active.scrollIntoView({ block: "nearest", inline: "nearest" });
    });

    var lastY = 0;
    window.addEventListener("scroll", function () {
      var y = window.scrollY || document.documentElement.scrollTop || 0;
      if (y > 90 && y > lastY) nav.classList.add("gid-hidden");
      else nav.classList.remove("gid-hidden");
      lastY = y;
    }, { passive: true });
  }

  function buildLangSwitch() {
    var wrap = document.createElement("span");
    wrap.className = "gid-lang";
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", currentLang === "fr" ? "Langue" : "Language");
    LANGS.forEach(function (lang) {
      var button = document.createElement("button");
      button.type = "button";
      button.textContent = lang;
      button.setAttribute("aria-pressed", lang === currentLang ? "true" : "false");
      button.setAttribute("aria-label", lang === "fr" ? "Français" : "English");
      button.addEventListener("click", function () { setLanguage(lang); });
      wrap.appendChild(button);
    });
    return wrap;
  }

  function buildNavGroup(surface) {
    var group = document.createElement("span");
    group.className = "gid-nav-group";
    if (surface.file === current || hasCurrentChild(surface)) group.classList.add("gid-parent-active");
    var menuId = "gid-menu-" + slug(surface.label || surface.file);

    var primary = document.createElement("a");
    primary.href = withLang(encodeURIComponent(surface.file), currentLang);
    primary.textContent = t(surface.label);
    if (surface.file === current) primary.classList.add("gid-active");
    group.appendChild(primary);

    var trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "gid-nav-trigger";
    trigger.textContent = "⌄";
    trigger.setAttribute("aria-label", "Menu " + t(surface.label));
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", menuId);
    group.appendChild(trigger);

    var menu = document.createElement("div");
    menu.id = menuId;
    menu.className = "gid-menu";
    menu.setAttribute("role", "menu");
    menu.setAttribute("aria-label", "Menu " + t(surface.label));

    var title = document.createElement("div");
    title.className = "gid-menu-title";
    var label = document.createElement("span");
    label.textContent = t(surface.menuTitle || (surface.label + " / surfaces"));
    var hint = document.createElement("span");
    hint.textContent = t(surface.menuHint || "");
    title.appendChild(label);
    title.appendChild(hint);
    menu.appendChild(title);

    surface.children.forEach(function (child) {
      var a = document.createElement("a");
      a.href = withLang(encodeURIComponent(child.file), currentLang);
      a.setAttribute("role", "menuitem");
      if (child.file === current) a.className = "gid-active";

      var step = document.createElement("span");
      step.className = "gid-menu-step";
      step.textContent = child.step || "";
      a.appendChild(step);

      var text = document.createElement("span");
      text.textContent = t(child.label);
      a.appendChild(text);

      var copy = document.createElement("span");
      copy.className = "gid-menu-copy";
      copy.textContent = t(child.copy || "ouvrir");
      a.appendChild(copy);

      menu.appendChild(a);
    });

    document.body.appendChild(menu);

    function setMenuOpen(open) {
      closeNavGroups();
      group.classList.toggle("gid-open", open);
      menu.classList.toggle("gid-open", open);
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
    }

    trigger.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      setMenuOpen(!group.classList.contains("gid-open"));
    });

    trigger.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      event.preventDefault();
      event.stopPropagation();
      setMenuOpen(true);
      var items = menu.querySelectorAll("a[role='menuitem']");
      if (items.length) items[event.key === "ArrowUp" ? items.length - 1 : 0].focus();
    });

    menu.addEventListener("keydown", function (event) {
      var items = Array.prototype.slice.call(menu.querySelectorAll("a[role='menuitem']"));
      if (!items.length) return;
      var index = items.indexOf(document.activeElement);
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        trigger.focus();
        return;
      }
      if (event.key === "Home" || event.key === "End" || event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        if (event.key === "Home") index = 0;
        else if (event.key === "End") index = items.length - 1;
        else if (event.key === "ArrowDown") index = (index + 1 + items.length) % items.length;
        else if (event.key === "ArrowUp") index = (index - 1 + items.length) % items.length;
        items[index].focus();
      }
    });

    document.addEventListener("click", closeNavGroups);
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeNavGroups();
    });

    return group;
  }

  function closeNavGroups() {
    var groups = document.querySelectorAll(".gid-nav-group.gid-open");
    for (var i = 0; i < groups.length; i++) {
      groups[i].classList.remove("gid-open");
      var trigger = groups[i].querySelector(".gid-nav-trigger");
      if (trigger) trigger.setAttribute("aria-expanded", "false");
    }
    var menus = document.querySelectorAll(".gid-menu.gid-open");
    for (var j = 0; j < menus.length; j++) {
      menus[j].classList.remove("gid-open");
    }
  }

  function railViewportKey() {
    return document.documentElement.getAttribute("data-gid-vp") || "desktop";
  }

  function railStorageKey() {
    return "gid-rail-state:" + railViewportKey();
  }

  function loadRailState() {
    try {
      var raw = localStorage.getItem(railStorageKey());
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function defaultRailPosition(rail) {
    var vp = railViewportKey();
    var navH = px(getComputedStyle(document.documentElement).getPropertyValue("--gid-nav-h")) || (vp === "mobile" ? 44 : 40);
    var rect = rail ? rail.getBoundingClientRect() : null;
    var width = rect && rect.width ? rect.width : (rail && rail.classList.contains("gid-rail-collapsed") ? 58 : 46);
    var height = rect && rect.height ? rect.height : (rail && rail.classList.contains("gid-rail-collapsed") ? 58 : 220);
    if (vp === "mobile") {
      return {
        x: Math.max(14, window.innerWidth - width - 18),
        y: Math.max(navH + 12, window.innerHeight - height - 18)
      };
    }
    return {
      x: Math.min(Math.max(window.innerWidth * 0.02, 16), 28),
      y: navH + 18
    };
  }

  function saveRailState(rail) {
    if (!rail) return;
    var rect = rail.getBoundingClientRect();
    try {
      localStorage.setItem(railStorageKey(), JSON.stringify({
        x: Math.round(rect.left),
        y: Math.round(rect.top),
        collapsed: rail.classList.contains("gid-rail-collapsed")
      }));
    } catch (e) {
      // localStorage can be unavailable in strict privacy contexts.
    }
  }

  function expandedRect(rect, gap) {
    return {
      left: rect.left - gap,
      top: rect.top - gap,
      right: rect.right + gap,
      bottom: rect.bottom + gap,
      width: rect.width + gap * 2,
      height: rect.height + gap * 2
    };
  }

  function rectsOverlap(a, b) {
    return a && b && !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
  }

  function railExclusionRects(rail) {
    var selectors = [
      ".idx-hero h1",
      ".doc-hero h1",
      ".ctx-title",
      ".mot-title",
      ".idx-card",
      ".doc-card",
      ".ctx-card",
      ".mot-card",
      ".idx-live",
      ".doc-next"
    ];
    var out = [];
    for (var i = 0; i < selectors.length; i++) {
      var nodes = document.querySelectorAll(selectors[i]);
      for (var j = 0; j < nodes.length; j++) {
        var rect = nodes[j].getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight) out.push(rect);
      }
    }
    var focused = document.activeElement;
    if (focused && rail && !rail.contains(focused) && focused !== document.body && focused.getBoundingClientRect) {
      var focusRect = focused.getBoundingClientRect();
      if (focusRect.width > 0 && focusRect.height > 0 && focusRect.bottom > 0 && focusRect.top < window.innerHeight) out.push(focusRect);
    }
    return out;
  }

  function avoidRailExclusions(rail, x, y, width, height, bounds) {
    var gap = document.documentElement.dataset.gidVp === "mobile" ? 14 : 18;
    var candidate = { left: x, top: y, right: x + width, bottom: y + height, width: width, height: height };
    var exclusions = railExclusionRects(rail).map(function (rect) { return expandedRect(rect, gap); });
    for (var i = 0; i < exclusions.length; i++) {
      var ex = exclusions[i];
      if (!rectsOverlap(candidate, ex)) continue;
      var options = [
        { x: ex.left - width - gap, y: y },
        { x: ex.right + gap, y: y },
        { x: x, y: ex.top - height - gap },
        { x: x, y: ex.bottom + gap }
      ].map(function (pos) {
        return {
          x: Math.min(Math.max(pos.x, bounds.minX), bounds.maxX),
          y: Math.min(Math.max(pos.y, bounds.minY), bounds.maxY)
        };
      }).filter(function (pos) {
        var next = { left: pos.x, top: pos.y, right: pos.x + width, bottom: pos.y + height };
        return !rectsOverlap(next, ex);
      }).sort(function (a, b) {
        var da = Math.abs(a.x - x) + Math.abs(a.y - y);
        var db = Math.abs(b.x - x) + Math.abs(b.y - y);
        return da - db;
      });
      if (options.length) {
        x = options[0].x;
        y = options[0].y;
        candidate = { left: x, top: y, right: x + width, bottom: y + height, width: width, height: height };
      }
    }
    return { x: x, y: y };
  }

  function clampRailXY(rail, x, y) {
    var rect = rail.getBoundingClientRect();
    var navH = px(getComputedStyle(document.documentElement).getPropertyValue("--gid-nav-h")) || 40;
    var width = rect.width || (rail.classList.contains("gid-rail-collapsed") ? 58 : 46);
    var height = rect.height || (rail.classList.contains("gid-rail-collapsed") ? 58 : 210);
    var pad = 8;
    var minX = pad;
    var minY = navH + pad;
    var maxX = Math.max(minX, window.innerWidth - width - pad);
    var maxY = Math.max(minY, window.innerHeight - height - pad);
    var bounds = { minX: minX, minY: minY, maxX: maxX, maxY: maxY };
    var clamped = {
      x: Math.min(Math.max(x, minX), maxX),
      y: Math.min(Math.max(y, minY), maxY)
    };
    return avoidRailExclusions(rail, clamped.x, clamped.y, width, height, bounds);
  }

  function setRailPosition(rail, x, y) {
    var pos = clampRailXY(rail, x, y);
    rail.style.left = pos.x + "px";
    rail.style.top = pos.y + "px";
  }

  function syncRailToggle(rail) {
    var toggle = rail ? rail.querySelector(".gid-rail-toggle") : null;
    if (!toggle) return;
    var collapsed = rail.classList.contains("gid-rail-collapsed");
    if (collapsed) {
      toggle.innerHTML = '<span class="gid-rail-mascot" aria-hidden="true"><span class="gid-rail-mascot-beret"></span><span class="gid-rail-mascot-shell"></span><span class="gid-rail-mascot-screen"></span><span class="gid-rail-mascot-antenna"></span><span class="gid-rail-mascot-face">&gt;</span><span class="gid-rail-mascot-cue"><span></span><span></span><span></span></span></span>';
    } else {
      toggle.textContent = "-";
    }
    toggle.title = collapsed ? t("Ouvrir la barre") : t("Rétracter la barre");
    toggle.setAttribute("aria-label", toggle.title);
    toggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
    rail.setAttribute("aria-expanded", collapsed ? "false" : "true");
    document.documentElement.classList.toggle("gid-rail-collapsed-mode", collapsed);
  }

  function setRailCollapsed(rail, collapsed, persist) {
    if (!rail) return;
    rail.classList.toggle("gid-rail-collapsed", collapsed);
    syncRailToggle(rail);
    requestAnimationFrame(function () {
      var rect = rail.getBoundingClientRect();
      setRailPosition(rail, rect.left, rect.top);
      if (persist) saveRailState(rail);
    });
  }

  function applyRailState(rail) {
    if (!rail) return;
    var state = loadRailState();
    var vp = railViewportKey();
    var collapsed = state && typeof state.collapsed === "boolean" ? state.collapsed : vp === "mobile";
    setRailCollapsed(rail, collapsed, false);
    if (state && typeof state.x === "number" && typeof state.y === "number") {
      requestAnimationFrame(function () {
        setRailPosition(rail, state.x, state.y);
      });
    } else {
      requestAnimationFrame(function () {
        var pos = defaultRailPosition(rail);
        setRailPosition(rail, pos.x, pos.y);
      });
    }
  }

  function refreshRailBounds() {
    var rail = document.getElementById("gid-rail");
    if (!rail) return;
    var state = loadRailState();
    if (!state) {
      applyRailState(rail);
      return;
    }
    setRailCollapsed(rail, !!state.collapsed, false);
    requestAnimationFrame(function () {
      setRailPosition(rail, state.x, state.y);
    });
  }

  function installRailDrag(rail) {
    var drag = null;
    var keyboardStart = null;
    var keyboardActive = false;

    function railMoveTarget(target) {
      if (!target || !target.closest) return false;
      if (target.closest(".gid-rail-handle")) return true;
      if (target.closest(".gid-rail-toggle")) return true;
      return rail.classList.contains("gid-rail-collapsed") && target === rail;
    }

    function currentRailOrigin() {
      var rect = rail.getBoundingClientRect();
      return { x: rect.left, y: rect.top };
    }

    rail.addEventListener("focusin", function (event) {
      if (railMoveTarget(event.target)) {
        keyboardStart = currentRailOrigin();
        keyboardActive = false;
      }
    });

    rail.addEventListener("keydown", function (event) {
      if (!railMoveTarget(event.target)) return;
      var key = event.key;
      var isArrow = key === "ArrowLeft" || key === "ArrowRight" || key === "ArrowUp" || key === "ArrowDown";
      if (!isArrow && key !== "Escape" && key !== "Home") return;
      if (event.cancelable) event.preventDefault();

      if (key === "Escape") {
        if (!keyboardStart) keyboardStart = currentRailOrigin();
        setRailPosition(rail, keyboardStart.x, keyboardStart.y);
        saveRailState(rail);
        keyboardStart = currentRailOrigin();
        keyboardActive = false;
        return;
      }

      if (key === "Home") {
        var reset = defaultRailPosition(rail);
        setRailPosition(rail, reset.x, reset.y);
        saveRailState(rail);
        keyboardStart = currentRailOrigin();
        keyboardActive = false;
        return;
      }

      if (!keyboardActive) {
        keyboardStart = currentRailOrigin();
        keyboardActive = true;
      }
      var rect = rail.getBoundingClientRect();
      var step = event.shiftKey ? 32 : (event.altKey ? 4 : 10);
      var dx = key === "ArrowLeft" ? -step : (key === "ArrowRight" ? step : 0);
      var dy = key === "ArrowUp" ? -step : (key === "ArrowDown" ? step : 0);
      setRailPosition(rail, rect.left + dx, rect.top + dy);
      saveRailState(rail);
    });

    rail.addEventListener("click", function (event) {
      if (rail.dataset.gidSuppressClick === "1") {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (rail.classList.contains("gid-rail-collapsed") && event.target === rail) {
        setRailCollapsed(rail, false, true);
      }
    }, true);

    rail.addEventListener("pointerdown", function (event) {
      if (event.button !== undefined && event.button !== 0) return;
      var target = event.target;
      var collapsed = rail.classList.contains("gid-rail-collapsed");
      var handle = target && target.closest ? target.closest(".gid-rail-handle") : null;
      if (!collapsed && !handle) return;

      var rect = rail.getBoundingClientRect();
      drag = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: rect.left,
        originY: rect.top,
        moved: false
      };
      rail.setPointerCapture(event.pointerId);
      rail.classList.add("gid-rail-dragging");
      if (!collapsed) event.preventDefault();
    });

    rail.addEventListener("pointermove", function (event) {
      if (!drag || drag.pointerId !== event.pointerId) return;
      var dx = event.clientX - drag.startX;
      var dy = event.clientY - drag.startY;
      if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
      if (drag.moved) {
        if (event.cancelable) event.preventDefault();
        setRailPosition(rail, drag.originX + dx, drag.originY + dy);
      }
    });

    function endDrag(event) {
      if (!drag || drag.pointerId !== event.pointerId) return;
      try {
        rail.releasePointerCapture(event.pointerId);
      } catch (e) {
        // Pointer capture can already be cleared by the browser on cancel.
      }
      rail.classList.remove("gid-rail-dragging");
      if (drag.moved) {
        rail.dataset.gidSuppressClick = "1";
        setTimeout(function () { delete rail.dataset.gidSuppressClick; }, 120);
        saveRailState(rail);
      }
      drag = null;
    }

    rail.addEventListener("pointerup", endDrag);
    rail.addEventListener("pointercancel", endDrag);
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
    var real = realSurfaces();
    var currentIndex = currentSurfaceIndex();
    var progress = currentSurfaceProgress();

    var rail = document.createElement("aside");
    rail.id = "gid-rail";
    rail.setAttribute("aria-label", currentLang === "fr" ? "Outils rapides" : "Quick tools");
    rail.style.setProperty("--gid-rail-progress", progress.pct);

    var helpId = "gid-rail-keyboard-help";
    if (!document.getElementById(helpId)) {
      var help = document.createElement("span");
      help.id = helpId;
      help.className = "gid-sr";
      help.textContent = currentLang === "fr"
        ? "Utiliser les flèches pour déplacer la barre, Maj plus flèche pour un grand déplacement, Home pour replacer, Échap pour annuler."
        : "Use arrow keys to move the rail, Shift plus arrow for a large move, Home to reset, Escape to cancel.";
      document.body.appendChild(help);
    }

    var handle = makeRailItem("button", "::", currentLang === "fr" ? "Déplacer la barre avec les flèches" : "Move rail with arrow keys", "gid-rail-handle");
    handle.type = "button";
    handle.setAttribute("data-gid-drag-handle", "true");
    handle.setAttribute("aria-describedby", helpId);
    handle.setAttribute("aria-keyshortcuts", "ArrowLeft ArrowRight ArrowUp ArrowDown Shift+ArrowLeft Shift+ArrowRight Shift+ArrowUp Shift+ArrowDown Home Escape");
    rail.appendChild(handle);

    var home = makeRailItem("a", "IN", "Index", current === real[0].file ? "gid-active" : "");
    home.href = withLang(encodeURIComponent(real[0].file), currentLang);
    rail.appendChild(home);

    var prev = makeRailItem("a", "<", currentLang === "fr" ? "Surface précédente" : "Previous surface", "");
    prev.href = withLang(encodeURIComponent(real[(currentIndex + real.length - 1) % real.length].file), currentLang);
    rail.appendChild(prev);

    var next = makeRailItem("a", ">", currentLang === "fr" ? "Surface suivante" : "Next surface", "");
    next.href = withLang(encodeURIComponent(real[(currentIndex + 1) % real.length].file), currentLang);
    rail.appendChild(next);

    var top = makeRailItem("button", "^", currentLang === "fr" ? "Retour en haut" : "Back to top", "gid-accent");
    top.type = "button";
    top.addEventListener("click", function () {
      var canvas = document.getElementById("gid-canvas-viewport");
      if (canvas) {
        canvas.scrollLeft = 0;
        canvas.scrollTop = 0;
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    rail.appendChild(top);

    var gh = makeRailItem("a", "GH", "GitHub", "");
    gh.href = "https://github.com/gnu-in-labs/gnu.in-shell-docs";
    gh.target = "_blank";
    gh.rel = "noreferrer";
    rail.appendChild(gh);

    var toggle = makeRailItem("button", "-", t("Rétracter la barre"), "gid-rail-toggle");
    toggle.type = "button";
    toggle.setAttribute("aria-controls", "gid-rail");
    toggle.setAttribute("aria-describedby", helpId);
    toggle.setAttribute("aria-keyshortcuts", "ArrowLeft ArrowRight ArrowUp ArrowDown Shift+ArrowLeft Shift+ArrowRight Shift+ArrowUp Shift+ArrowDown Home Escape");
    toggle.addEventListener("click", function () {
      if (rail.dataset.gidSuppressClick === "1") return;
      setRailCollapsed(rail, !rail.classList.contains("gid-rail-collapsed"), true);
    });
    rail.appendChild(toggle);

    document.body.appendChild(rail);
    installRailDrag(rail);
    applyRailState(rail);
  }

  function boot() {
    ensureFavicon();
    ensureLanguageProfile();
    installPretextApi();
    injectCss();
    setViewportState();
    buildNav();
    buildRail();
    annotateInlineLayouts();
    applyPretext();
    localizePageLinks();

    function refreshViewport() {
      setViewportState();
      annotateInlineLayouts();
      localizePageLinks();
      refreshRailBounds();
    }

    window.addEventListener("resize", refreshViewport, { passive: true });
    window.addEventListener("orientationchange", refreshViewport, { passive: true });

    var tries = 0;
    var iv = setInterval(function () {
      if (!document.getElementById("gid-nav") && document.body) buildNav();
      if (!document.getElementById("gid-rail") && document.body) buildRail();
      annotateInlineLayouts();
      applyPretext();
      localizePageLinks();
      if (++tries > 30) clearInterval(iv);
    }, 350);

    if (window.MutationObserver) {
      var mo = new MutationObserver(function () {
        annotateInlineLayouts();
        applyPretext();
        localizePageLinks();
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
