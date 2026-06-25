/* Shared top navigation + favicon for the Gnu.In-Shell deck.
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

  function build() {
    if (document.getElementById("gid-nav")) return;

    var css = document.createElement("style");
    css.id = "gid-nav-style";
    css.textContent =
      "body{padding-top:40px!important;box-sizing:border-box;}" +
      "#gid-nav{position:fixed;top:0;left:0;right:0;z-index:2147483600;display:flex;align-items:center;gap:2px;" +
      "height:40px;padding:0 12px;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;" +
      "font:500 12px/1 ui-monospace,'IBM Plex Mono','JetBrains Mono',SFMono-Regular,Menlo,monospace;" +
      "letter-spacing:.04em;color:#cdd3d0;background:rgba(13,17,20,.86);" +
      "-webkit-backdrop-filter:blur(10px) saturate(1.1);backdrop-filter:blur(10px) saturate(1.1);" +
      "border-bottom:1px solid rgba(245,238,221,.12);transition:transform .25s cubic-bezier(.2,.7,.2,1);}" +
      "#gid-nav::-webkit-scrollbar{display:none}" +
      "#gid-nav.gid-hidden{transform:translateY(-100%)}" +
      "#gid-nav .gid-dot{flex:0 0 auto;width:9px;height:9px;border-radius:50%;background:#FF6A00;box-shadow:0 0 9px #FF6A00;margin-right:8px}" +
      "#gid-nav a{flex:0 0 auto;color:#aeb6b2;text-decoration:none;padding:7px 10px;border-radius:7px;white-space:nowrap;transition:background .15s,color .15s}" +
      "#gid-nav a:hover{color:#f5eedd;background:rgba(245,238,221,.08)}" +
      "#gid-nav a.gid-active{color:#0d1114;background:#F5EEDD;font-weight:600}" +
      "#gid-nav .gid-sep{flex:0 0 auto;width:1px;height:16px;background:rgba(245,238,221,.18);margin:0 6px}" +
      "#gid-nav .gid-tag{flex:0 0 auto;margin-left:auto;padding-left:14px;color:#6f7b76;font-size:11px;white-space:nowrap}";
    document.head.appendChild(css);

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
      a.href = encodeURIComponent(s.file);
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
    build();
    var tries = 0;
    var iv = setInterval(function () {
      if (!document.getElementById("gid-nav") && document.body) build();
      if (++tries > 20) clearInterval(iv);
    }, 400);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
