# Regression Gates — gnu-in-shell-docs-major-drop

Run these after extracting the drop into a scratch folder and copying the changed/new
files over the current repo. Do not propagate further until the Index gate is green.

## 0. Static checks

```bash
git diff --check
node --check nav.js
node --check tools/smoke-index-surface.js tools/smoke-doc-pages.js tools/smoke-showcase-surfaces.js tools/smoke-central-surface.js tools/smoke-canvas-surfaces.js tools/smoke-pretext-surface.js
```

Expected: `git diff --check` clean; every `node --check` exits 0.

## 1. JSON parse (changed JSON)

```bash
node -e "JSON.parse(require('fs').readFileSync('ZIP_DROP_MANIFEST.json','utf8')); console.log('manifest ok')"
```

Expected: `manifest ok`. (No other `.json` changed in this drop.)

## 2. Smoke gates

```bash
node tools/smoke-index-surface.js
node tools/smoke-doc-pages.js
node tools/smoke-showcase-surfaces.js
node tools/smoke-central-surface.js
node tools/smoke-canvas-surfaces.js
node tools/smoke-pretext-surface.js
```

Expected: each prints `ok` (and writes its capture artifacts where applicable).

Notes:
- `smoke-index-surface.js`, `smoke-doc-pages.js`, and `smoke-showcase-surfaces.js` now
  navigate with `?lang=fr`. This pins the **French** profile so the existing French
  `requiredText` contracts still assert after the bilingual swap. No assertions were removed.
- `smoke-pretext-surface.js` is the **new** bilingual gate. For each documentation surface it
  proves: French profile keeps the French anchor; English profile swaps it (and the French
  anchor disappears); the default profile (English browser locale, no `?lang`) resolves to
  English; no forbidden public term renders in either profile; cube favicon + nav + rail present.

## 3. Forbidden public copy (rendered text)

The smoke gates already scan rendered `innerText`/`textContent` against:

```
/\bQML\b/i  /\bdemo\b/i  /Démo/i  /Auto-demo/i  /Current Work/i  /Current%20Work/i  /frontier/i  /wireframe/i  /pasted/i
```

Manual source grep on public root HTML (should return nothing rendered):

```bash
grep -nE "QML|Démo|Auto-demo|Current Work|frontier|wireframe|pasted" -- *.dc.html index.html | grep -v "data-pretext-key"
```

Note: JS identifiers such as `demoToggle`/`sDemo` in `Central.dc.html` are **not** rendered text
and do **not** contain the `\bdemo\b` word boundary, so they do not trip `/\bdemo\b/i`. The rendered
French word `démons` (daemons) was changed to `services` so `/Démo/i` cannot substring-match it.

## 4. Visual review (screenshots)

Review at 360, 393, 430, tablet, and desktop widths:

- Index readable on mobile; hero title shadow hard-edged and angled; section titles aligned with the numbering column.
- Floating rail starts as a bubble on mobile and is separated from content (not glued to the left edge) on desktop.
- Nav cascade (Docs / Atlas / Context) opens and closes with `Escape`; rail drags without toggling collapse.
- Cube favicon present on every page.
- EN/FR toggle flips the corpus language; English is the default profile; French stays canonical.
- No horizontal overflow at any width; text fits inside buttons/cards/surfaces; Central adapts rather than shrinking into unreadable panels.

## Repair priority if a gate regresses

1. Runtime loading / broken assets (support.js, nav.js, _ds bundle, favicon).
2. Shared nav, favicon, cascade, rail behaviour.
3. Index mobile layout + live map bounds.
4. Bilingual swap (Pretext): a missing `data-pretext-key` or a missing `register('en', …)` entry.
5. Forbidden public copy.
6. Secondary page polish.
