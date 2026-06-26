# Next Zip Drop Porting Protocol

Purpose: keep the current `gnu.in-shell-docs` work portable when a new archive lands with expected regressions.

## Baseline To Preserve

- `docs/documentation-architecture-set-taxonomy.md`
  - documentation architecture for the public corpus;
  - set-theory taxonomy for project, method, architecture, assets, surfaces, evidence, communications, roadmap, experiments, and archive;
  - canonicality rules for current, candidate, showcase-only, and archive material;
  - page-level contracts for future documentation work.
- `nav.js`
  - shared top navigation;
  - Atlas cascade for Fondations, Atomes, Molécules, Intégration, Handoff;
  - floating rail with drag, collapse, mobile bubble default, viewport-bounded movement, and per-viewport persistence;
  - favicon enforcement pointing to `assets/symbols/cube.svg`.
- `Gnu.In-Shell - Index.dc.html`
  - public documentation/showcase copy;
  - current mascot retained;
  - bounded "Carte vivante" canvas section;
  - mobile padding compatible with the floating bubble;
  - no public helper/meta copy on the surface.
- `tools/smoke-index-surface.js`
  - local dynamic gate for desktop, tablet, mobile, and threshold widths;
  - nav, rail, favicon, canvas sampling, hover, cascade, live-map interaction, overflow, and forbidden-copy checks.

## Porting Order After Unzipping

1. Extract the new archive into a scratch folder, not directly over the current repo.
2. Compare root HTML filenames and asset paths before copying files into place.
3. Re-read `docs/documentation-architecture-set-taxonomy.md` and classify incoming material as canon, candidate, showcase-only, or archive.
4. Bring forward `assets/symbols/cube.svg` if the drop does not already contain the canonical cube.
5. Reapply `nav.js` first so every page gets the same navigation, favicon, rail, and cascade behavior.
6. Reapply the Index structure next: hero, grammar, parcours, registry, live map, spine, gates, footer.
7. Preserve any new useful content from the archive only after the shared navigation, Index contract, and documentation taxonomy are stable.
8. Run the gates before touching secondary pages.

## Local Gate

```bash
git diff --check
node tools/smoke-index-surface.js
```

Expected:

- `git diff --check` is clean.
- The smoke script's forbidden-copy checks have no root-page hits.
- The smoke script reports `ok` for all viewports.
- `artifacts/index-smoke/mobile-393.png` shows the rail as a bubble by default.
- `artifacts/index-smoke/desktop.png` shows the rail expanded and separated from the main content.

## Interaction Gate

The smoke script must keep proving these behaviors:

- Atlas menu opens and closes with `Escape`.
- Floating rail can be dragged without toggling collapse state.
- Floating rail can collapse and reopen.
- Mobile rail starts as a one-control bubble.
- The Index live map is mounted, nonblank, and bounded.
- The live map switches from `Lecture` to `Composition`, activates `Handoff`, then restores `Lecture`.

## Visual Review Gate

Review the generated screenshots after every archive merge:

- hero title shadow remains hard-edged and angled;
- section titles align consistently with the numbering column;
- mobile content is not pushed behind or away from the floating bubble;
- canvas and dynamic surfaces do not introduce horizontal overflow;
- the mascot remains the current canonical mascot unless the user explicitly promotes a new mascot iteration.

## Repair Priority

If the new drop regresses multiple areas, repair in this order:

1. Runtime loading and broken assets.
2. Shared navigation, favicon, Atlas cascade, and rail behavior.
3. Index mobile layout.
4. Index live map and canvas bounds.
5. Documentation taxonomy and canon/candidate/archive labels.
6. Copy cleanup and public wording.
7. Secondary page polish.

Do not propagate the new drop across every page until the Index gate is green.
