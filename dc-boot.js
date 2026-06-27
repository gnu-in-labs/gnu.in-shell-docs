/* dc-boot.js — resilient runtime bootstrap for the gnu.in-shell DC pages.
 *
 * Why this exists:
 *   support.js hides the page (hideRawTemplate) and then loads React + ReactDOM from a single
 *   CDN (unpkg). If that one CDN is briefly unreachable from the browser, EVERY .dc.html page
 *   stays blank — there is no fallback. This bootstrap loads React/ReactDOM with a multi-CDN
 *   fallback chain (unpkg -> jsDelivr -> cdnjs), then loads support.js. support.js already does
 *   `if (window.React && window.ReactDOM) return Promise.resolve()`, so once we have populated
 *   window.React/ReactDOM it skips its own CDN fetch and boots immediately.
 *
 * Drop-in: replace `<script src="./support.js"></script>` with `<script src="./dc-boot.js"></script>`.
 * No other change is required. Self-hosted React (vendor/) can be added later with zero edits here
 * by prepending its URL to the lists below.
 */
(function () {
  "use strict";
  var V = "18.3.1";
  var REACT = [
    "https://unpkg.com/react@" + V + "/umd/react.production.min.js",
    "https://cdn.jsdelivr.net/npm/react@" + V + "/umd/react.production.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/react/" + V + "/umd/react.production.min.js"
  ];
  var REACT_DOM = [
    "https://unpkg.com/react-dom@" + V + "/umd/react-dom.production.min.js",
    "https://cdn.jsdelivr.net/npm/react-dom@" + V + "/umd/react-dom.production.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/react-dom/" + V + "/umd/react-dom.production.min.js"
  ];
  var PER_SOURCE_TIMEOUT_MS = 7000;

  // Try each url in turn until `ready()` is satisfied (a CDN succeeded) or the list is exhausted.
  function chain(urls, ready, done) {
    var i = 0;
    (function next() {
      if (ready()) { done(); return; }
      if (i >= urls.length) {
        console.error("[dc-boot] all CDNs failed for", urls[0], "— page cannot boot React");
        done();
        return;
      }
      var url = urls[i++];
      var s = document.createElement("script");
      var settled = false;
      var to = setTimeout(onFail, PER_SOURCE_TIMEOUT_MS);
      function cleanup() { clearTimeout(to); s.onload = s.onerror = null; }
      function onLoad() { if (settled) return; settled = true; cleanup(); ready() ? done() : next(); }
      function onFail() {
        if (settled) return; settled = true; cleanup();
        if (s.parentNode) s.parentNode.removeChild(s);
        console.warn("[dc-boot] source failed, trying next:", url);
        next();
      }
      s.src = url;
      s.crossOrigin = "anonymous";
      s.onload = onLoad;
      s.onerror = onFail;
      document.head.appendChild(s);
    })();
  }

  function bootSupport() {
    var s = document.createElement("script");
    s.src = "./support.js";
    document.head.appendChild(s);
  }

  if (window.React && window.ReactDOM) { bootSupport(); return; }
  chain(REACT, function () { return !!window.React; }, function () {
    chain(REACT_DOM, function () { return !!window.ReactDOM; }, bootSupport);
  });
})();
