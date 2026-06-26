# gnu.in-shell-docs Documentation Architecture And Set Taxonomy

Status: working canon for the next content upgrade.

Scope: this document defines what the public documentation site should become,
how its content is classified, what belongs on the Index, how a reader should
move through the corpus, and how every public claim should connect to an
artifact, a proof, a decision, or an explicit non-canon status.

This is intentionally verbose. The purpose is not to write marketing copy. The
purpose is to build a durable reasoning layer so the site can grow without
becoming a collection of disconnected boards.

## 1. Core Position

`gnu.in-shell-docs` should be the public documentation and showcase layer for a
serious personal/professional project.

It is not only a gallery of screens. It is not only a design system preview. It
is not only an engine note. It is the place where an outside reader can answer:

- What is this project?
- Why does it exist?
- What has already been built or simulated?
- What is canon right now?
- What is exploratory and not yet promoted?
- What assets exist?
- What method is being used?
- What evidence supports the claims?
- What changed recently?
- What can a collaborator, reviewer, recruiter, or future user inspect next?

The current Index style is strong enough to keep. The missing layer is not
visual taste; the missing layer is documentation gravity.

The site should feel like a professional technical corpus with a distinctive
visual language. The motion, mascot, canvas, rail, and interactive pieces should
serve comprehension. They should prove states, relationships, and runtime logic.
They should not substitute for content.

## 2. Reader Model

The public site has several overlapping audiences. The architecture must not
optimize for only one of them.

Let `Reader` be the set of people who may land on the site:

```text
Reader = CuriousVisitor
       ∪ TechnicalReviewer
       ∪ DesignReviewer
       ∪ PotentialCollaborator
       ∪ RecruiterOrProfessionalContact
       ∪ FutureUser
       ∪ Maintainer
```

These subsets overlap. For example, a potential collaborator may also be a
technical reviewer; a recruiter may be curious but not deeply technical; a
future user may care about concept and behavior without reading engine notes.

The Index must support three time horizons:

```text
T5m  = reader has 5 minutes
T30m = reader has 30 minutes
Tdeep = reader is willing to inspect artifacts and decisions
```

The site should therefore expose three simultaneous reading paths:

1. A fast orientation path: what this is, why it matters, what to open first.
2. A medium inspection path: surfaces, assets, methodology, roadmap, evidence.
3. A deep audit path: engine data, fixtures, decisions, protocols, gates.

If a page only works for `Tdeep`, the Index must frame it. If a page only works
for `T5m`, it must avoid pretending to prove the full system.

## 3. Universe Of Documentation Objects

Define the documentation universe:

```text
Ω = every object that may be referenced by the site
```

An object `o ∈ Ω` can be a page, screenshot, token file, fixture, mascot asset,
specification, note, release entry, protocol, decision, smoke gate, or interactive
surface.

Every object should be representable as:

```text
o = {
  id,
  kind,
  title,
  role,
  audience,
  status,
  source,
  evidence,
  relations,
  canonicality
}
```

Where:

- `id` is a stable identifier.
- `kind` says what type of thing it is.
- `title` is the reader-facing name.
- `role` explains why the object exists.
- `audience` names who it primarily serves.
- `status` says whether it is current, candidate, showcase-only, archive, or
  needs work.
- `source` points to the authoritative file or page.
- `evidence` lists the checks, screenshots, runtime states, fixtures, or commits
  that make claims verifiable.
- `relations` connect it to other objects.
- `canonicality` says how strongly it should be treated as project truth.

The current repo already contains many objects in `Ω`:

- root `.dc.html` pages;
- `nav.js`;
- `assets/symbols/cube.svg`;
- `_components/Syster.dc.html`;
- `port-data/*.json`;
- `port-data/*.rs`;
- `port-data/PARITY.md`;
- `screenshots/*.png`;
- `tools/smoke-index-surface.js`;
- `docs/zip-drop-porting-protocol.md`;
- uploaded design-system and context-spec material.

The documentation upgrade should not invent a parallel world. It should classify
and expose what already exists, then identify the holes.

## 4. Primary Sets

Define the top-level documentation sets:

```text
P = ProjectNarrative
M = Methodology
A = Architecture
D = DesignSystemAndAssets
S = SurfacesAndRuntime
E = EvidenceAndGates
C = Communications
R = Roadmap
X = ExperimentsAndCandidates
Z = Archive
```

The public corpus is:

```text
CorpusPublic = P ∪ M ∪ A ∪ D ∪ S ∪ E ∪ C ∪ R ∪ X ∪ Z
```

This union is not a navigation menu by itself. It is the conceptual taxonomy.
Navigation can group or reorder it, but the taxonomy should remain stable.

### 4.1 Project Narrative `P`

`P` answers what the project is and why it matters.

Objects in `P` include:

- project vision;
- project scope;
- personal/professional framing;
- principles;
- current status;
- constraints;
- what is deliberately not promised.

Reader need: "I arrived from outside. Give me the shape of the project."

### 4.2 Methodology `M`

`M` explains how the project is made.

Objects in `M` include:

- design method;
- documentation method;
- regression-prevention method;
- archive drop protocol;
- reasoning rules;
- decision records;
- promotion rules from candidate to canon;
- how screenshots, fixtures, and interactive surfaces are used as proof.

Reader need: "Can I trust the way this project evolves?"

### 4.3 Architecture `A`

`A` explains the system model.

Objects in `A` include:

- shell composition model;
- scene model;
- data flow;
- input and hit testing;
- motion lifecycle;
- render abstraction;
- host boundary;
- bridge/cutover notes when applicable;
- engine parity notes.

Reader need: "What is the technical structure and what owns what?"

### 4.4 Design System And Assets `D`

`D` exposes reusable visual and design material.

Objects in `D` include:

- color tokens;
- typography;
- spacing;
- radii;
- shadows;
- motion tokens;
- mascot canon;
- candidate mascot material;
- symbols;
- screenshots;
- UI kits;
- design-system pages;
- asset status rules.

Reader need: "What are the visual building blocks and which assets are canon?"

### 4.5 Surfaces And Runtime `S`

`S` contains the actual visible shell and documentation surfaces.

Objects in `S` include:

- Index;
- Atlas;
- Fondations;
- Atomes;
- Molécules;
- Intégration;
- Handoff;
- Central;
- Menus;
- Renderer;
- Animations;
- Film;
- Roadmap;
- Syster kit;
- Plan archive.

Reader need: "Show me the thing, page by page, with state and purpose."

### 4.6 Evidence And Gates `E`

`E` holds the proof layer.

Objects in `E` include:

- smoke scripts;
- generated screenshots;
- fixture data;
- manifest status;
- local gates;
- live checks;
- visual review gates;
- build or deployment checks;
- known regression classes.

Reader need: "What proves this is not just an image or claim?"

### 4.7 Communications `C`

`C` documents public-facing updates and narrative over time.

Objects in `C` include:

- release notes;
- changelogs;
- launch notes;
- public updates;
- professional summary;
- "what changed" entries;
- short explanations suitable for sharing.

Reader need: "What is happening, what changed, and how should I talk about it?"

### 4.8 Roadmap `R`

`R` explains future movement without overpromising.

Objects in `R` include:

- active priorities;
- next milestones;
- risk register;
- candidate work;
- blockers;
- proof needed before promotion;
- release lanes.

Reader need: "Where is this going and what is not solved yet?"

### 4.9 Experiments And Candidates `X`

`X` contains non-canon explorations.

Objects in `X` include:

- candidate mascot iterations;
- alternate UI compositions;
- imported archive experiments;
- not-yet-validated motion states;
- surfaces that are useful as presentation but not as truth.

Reader need: "What can I inspect without mistaking it for canon?"

### 4.10 Archive `Z`

`Z` preserves history.

Objects in `Z` include:

- old plans;
- previous snapshots;
- superseded specs;
- historical decision context;
- long-form merge/fusion documents.

Reader need: "What happened before, and why did the current shape win?"

## 5. Canonicality Set

Canonicality is the most important distinction for this project.

Define:

```text
K = Canonical objects
N = Non-canon but useful objects
H = Historical archive objects
U = Unverified objects
```

Every public object must belong to at least one canonicality state:

```text
∀o ∈ Ω_public, canonicality(o) ∈ {K, N, H, U}
```

These are mutually exclusive as states, even if an object is related to several
sets:

```text
K ∩ N = ∅
K ∩ H = ∅
K ∩ U = ∅
N ∩ H = ∅
N ∩ U = ∅
H ∩ U = ∅
```

This matters because the site includes presentation surfaces and candidate
assets. A candidate mascot kit can be useful and beautiful without being canon.
The reader must not need private context to know the difference.

### 5.1 Canon Promotion Rule

An object can be promoted to `K` only if it has:

```text
role(o) is defined
∧ source(o) exists
∧ evidence(o) is not empty
∧ owner/page placement is clear
∧ contradiction with existing canon is resolved
```

In prose:

An object becomes canon when the site can say what it is, where it comes from,
what it proves, where it belongs, and why it does not contradict the existing
canon.

### 5.2 Non-canon Useful Rule

An object belongs to `N` when it is useful for presentation, exploration, or
reference, but not approved as project truth.

Example:

```text
Syster kit ∈ D ∩ S ∩ X ∩ N
```

It is a design/showcase surface. It can display UI/UX direction. It does not
replace the current mascot unless the user explicitly promotes it.

### 5.3 Archive Rule

An object belongs to `H` when it explains history but should not drive current
implementation decisions without review.

Example:

```text
Plan de Fusion ∈ P ∩ Z ∩ H
```

It is useful context. It is not automatically the current spec.

### 5.4 Unverified Rule

An object belongs to `U` when it makes a claim that has not yet been linked to
evidence.

`U` objects may exist in working notes, but public pages should mark them
clearly or keep them out of the main reading path.

## 6. Evidence Function

Define an evidence function:

```text
ev : Ω_public -> P(Evidence)
```

Where `P(Evidence)` means the power set of evidence artifacts: a given object can
have zero, one, or many evidence items.

For public documentation, the site should enforce:

```text
∀o ∈ K, ev(o) ≠ ∅
```

In plain language:

Every canon object needs evidence.

Evidence can take several forms:

```text
Evidence = Screenshot
         ∪ Fixture
         ∪ SmokeGate
         ∪ RuntimeInteraction
         ∪ SourceFile
         ∪ DecisionRecord
         ∪ ReleaseCheck
```

Evidence is not decorative. A screenshot proves rendered state. A fixture proves
data shape. A smoke gate proves behavior. A source file proves that the claim has
an authoritative local artifact. A decision record proves why a choice was made.

### 6.1 Evidence Strength

Not every evidence item is equally strong.

Define:

```text
strength(SmokeGate + Screenshot + SourceFile) > strength(Screenshot only)
strength(RuntimeInteraction + SourceFile) > strength(SourceFile only)
strength(DecisionRecord only) < strength(DecisionRecord + Gate)
```

The documentation should prefer combined evidence when making strong claims.

Example:

Claim: "The mobile rail starts as a bubble and can be dragged."

Strong evidence:

- `nav.js` implementation;
- `tools/smoke-index-surface.js` interaction test;
- generated `mobile-393.png` capture;
- live smoke result.

Weak evidence:

- a sentence saying it should work.

## 7. Relation Model

The site should be understood as a graph:

```text
G = (N, R)
```

Where:

- `N` is the set of documentation nodes;
- `R` is the set of typed relations between nodes.

Important relations:

```text
describes(a, b)      = a explains b
proves(a, b)         = a is evidence for b
depends_on(a, b)     = a needs b to make sense
supersedes(a, b)     = a replaces b
implements(a, b)     = a realizes b
illustrates(a, b)    = a shows b without proving it fully
archives(a, b)       = a preserves history for b
```

Examples:

```text
describes(Atlas, CorpusPublic)
describes(Fondations, DesignTokens)
describes(Atomes, PrimitiveComponents)
describes(Molécules, ComponentAssemblies)
describes(Handoff, EngineTransmission)
proves(smoke-index-surface.js, IndexNavigationContract)
proves(port-data/scenes/menu-vertical.json, MenuSceneContract)
illustrates(SysterKit, MascotCandidateDirection)
archives(PlanDeFusion, EarlierMergeReasoning)
```

This relation model matters because the site should avoid isolated pages. Every
page should either explain something, prove something, archive something, or
route to something.

If a page does none of these, it should not be in the main corpus.

## 8. Documentation Object Types

The site should use a small number of repeatable document object types.

### 8.1 Concept Page

Purpose: explain an idea.

Required fields:

- definition;
- why it matters;
- what it includes;
- what it excludes;
- related surfaces;
- evidence status.

Examples:

- Project vision;
- methodology;
- runtime model;
- design principles.

### 8.2 Surface Page

Purpose: describe and show a visible surface.

Required fields:

- role;
- canonical status;
- inputs;
- outputs;
- user-facing behavior;
- current evidence;
- known limitations;
- next hardening step.

Examples:

- Central;
- Menus;
- Renderer;
- Animations;
- Film.

### 8.3 Spec Page

Purpose: define a contract.

Required fields:

- terms;
- data shape;
- invariants;
- examples;
- failure cases;
- consumers;
- evidence.

Examples:

- molecule specs;
- motion spec;
- host protocol;
- token bridge.

### 8.4 Asset Record

Purpose: document a reusable asset.

Required fields:

- asset name;
- file path;
- category;
- canonicality;
- usage;
- dimensions/format when relevant;
- visual notes;
- replacement rules.

Examples:

- favicon cube;
- mascot rig files;
- screenshots;
- token files.

### 8.5 Decision Record

Purpose: explain why a choice was made.

Required fields:

- date;
- decision;
- context;
- alternatives rejected;
- impact;
- evidence;
- reversal condition.

Examples:

- "Use cube.svg as favicon";
- "Keep current mascot while Syster kit remains showcase-only";
- "Index is the baseline surface before propagating to other pages";
- "Mobile rail becomes a bubble by default."

### 8.6 Communication Entry

Purpose: make progress understandable outside the build context.

Required fields:

- date;
- audience;
- summary;
- what changed;
- why it matters;
- link to evidence;
- next action.

Examples:

- launch note;
- release note;
- weekly update;
- professional project summary.

### 8.7 Gate Record

Purpose: define a regression-prevention check.

Required fields:

- check name;
- command or manual procedure;
- what it proves;
- what it does not prove;
- expected result;
- artifact output;
- escalation if failed.

Examples:

- Index smoke gate;
- mobile visual review;
- root-page text scan;
- archive drop protocol.

## 9. Proposed Information Architecture

The documentation site should converge toward this public structure:

```text
Index
├─ Project
│  ├─ Vision
│  ├─ Scope
│  ├─ Status
│  └─ Principles
├─ Methodology
│  ├─ Documentation method
│  ├─ Design method
│  ├─ Regression gates
│  ├─ Decision records
│  └─ Archive drop protocol
├─ System
│  ├─ Atlas
│  ├─ Architecture
│  ├─ Data model
│  ├─ Runtime surfaces
│  └─ Handoff
├─ Design System
│  ├─ Tokens
│  ├─ Typography
│  ├─ Components
│  ├─ Motion
│  ├─ Mascot canon
│  └─ Asset registry
├─ Surfaces
│  ├─ Central
│  ├─ Menus
│  ├─ Renderer
│  ├─ Animations
│  ├─ Film
│  └─ Syster kit
├─ Evidence
│  ├─ Smoke gates
│  ├─ Screenshots
│  ├─ Fixtures
│  ├─ Manifests
│  └─ Known regressions
├─ Communications
│  ├─ Launch note
│  ├─ Changelog
│  ├─ Release notes
│  └─ Public updates
├─ Roadmap
│  ├─ Priorities
│  ├─ Risks
│  ├─ Candidate work
│  └─ Proof needed
└─ Archive
   ├─ Plan complet
   ├─ Legacy snapshots
   └─ Imported source material
```

This architecture can be implemented gradually. The Index should not expose an
empty section as if it were finished. Instead, it should expose status:

```text
Ready      = public page exists and has evidence
Draft      = page exists but needs editorial pass
Candidate  = useful but not canon
Archive    = historical context
Missing    = planned but not yet built
```

## 10. Index Role

The Index should become the orientation layer.

It should answer five questions in order:

1. What is the project?
2. What can I inspect immediately?
3. What is canon versus candidate?
4. What evidence supports the current claims?
5. Where should I go next based on my reader type?

The current Index already does part of this:

- hero explains the site as documentation and showcase;
- grammar section introduces foundations, atoms, molecules, surfaces;
- parcours maps Atlas to Handoff;
- registry lists active surfaces;
- live map shows a bounded dynamic reading signal;
- spine connects tokens to native surface;
- gates define minimum rendering criteria.

The next Index upgrade should add stronger documentation content:

- a clear "Project" block;
- a "Documentation map" block;
- a "Canon status" block;
- an "Evidence" block with real artifacts;
- an "Asset registry" entry point;
- a "Communications" entry point;
- a "For readers" guide.

The Index must stay readable. It should not become the whole documentation site.
It should be a map with enough content to establish credibility.

## 11. Page-Level Contract

Every major page should follow the same reader contract:

```text
Page = Role
     + Scope
     + Canonicality
     + PrimaryContent
     + Evidence
     + Relations
     + NextAction
```

### 11.1 Role

The page must state why it exists.

Bad:

```text
This page contains cards and visuals.
```

Good:

```text
This page explains how context-menu surfaces are composed, bounded, animated,
and proven against the engine data model.
```

### 11.2 Scope

The page must state what it includes and excludes.

Example:

```text
Includes: menu styles, row kinds, chrome-backed versus bespoke behavior,
input-region rules.

Excludes: final OS packaging, future settings surfaces, non-canon mascot
iterations.
```

### 11.3 Canonicality

The page must say whether it is:

- current canon;
- canonical reference with limitations;
- presentation-only;
- candidate;
- archive.

This prevents accidental overclaiming.

### 11.4 Primary Content

The page should carry useful documentation, not filler.

Useful content includes:

- definitions;
- workflows;
- data shapes;
- diagrams;
- state tables;
- asset inventories;
- design rules;
- implementation notes;
- known issues;
- proof links.

### 11.5 Evidence

Each page should list what proves it.

Examples:

- screenshots;
- local files;
- fixtures;
- smoke gate output;
- source data;
- live interaction state.

### 11.6 Relations

Each page should link to:

- parent concept;
- child artifacts;
- related surfaces;
- evidence;
- next reading step.

### 11.7 Next Action

Each page should end with a concrete next step:

- read another page;
- inspect an asset;
- run a gate;
- review a fixture;
- compare a screenshot;
- open the live surface.

## 12. Surface Matrix

The current root surfaces can be classified as follows.

| Surface | Primary set | Canonicality | Reader role | Evidence expectation |
|---|---:|---:|---|---|
| Index | P ∩ S ∩ E | K | orientation | smoke + screenshots + live map |
| Atlas | S ∩ A | K candidate | corpus map | links + hierarchy + page coverage |
| Fondations | D ∩ M | K candidate | design grammar | tokens + examples |
| Atomes | D ∩ S | K candidate | primitives | component states |
| Molécules | D ∩ S ∩ A | K candidate | assemblies | molecule specs |
| Intégration | A ∩ S | K candidate | surface contracts | composition evidence |
| Handoff | A ∩ E | K candidate | engine transmission | port-data + parity notes |
| Central | S ∩ A ∩ E | K | simulation hub | live interaction + port-data |
| Menus | S ∩ A ∩ D | K candidate | context behavior | menu taxonomy + screenshots |
| Renderer | S ∩ D ∩ E | K candidate | data rendering | molecule fixtures |
| Animations | S ∩ D | K candidate | motion states | motion spec + state captures |
| Film | C ∩ S | N or K candidate | narrative explanation | trigger walkthrough |
| Roadmap | R ∩ C | K candidate | forward path | risks + proof needed |
| Syster kit | D ∩ X | N | showcase-only asset direction | explicit non-canon label |
| Plan complet | Z ∩ P | H | historical context | archive label |

The table should eventually become visible, either on the Index or a dedicated
Documentation Map page.

## 13. Asset Taxonomy

Define:

```text
Asset = VisualAsset ∪ DataAsset ∪ CodeAsset ∪ ProofAsset ∪ CommunicationAsset
```

### 13.1 VisualAsset

Includes:

- mascot rig images;
- cube icon;
- screenshots;
- UI kit previews;
- symbol files.

Required metadata:

```text
{file, dimensions, format, role, canonicality, usage}
```

### 13.2 DataAsset

Includes:

- tokens;
- molecule specs;
- motion specs;
- scene fixtures;
- manifest files.

Required metadata:

```text
{file, schema, producer, consumer, evidence role}
```

### 13.3 CodeAsset

Includes:

- `nav.js`;
- `support.js`;
- `tools/smoke-index-surface.js`;
- mirrored Rust modules in `port-data`.

Required metadata:

```text
{file, runtime role, public contract, test/gate}
```

### 13.4 ProofAsset

Includes:

- generated screenshots;
- smoke output;
- fixtures;
- manifests;
- review protocols.

Required metadata:

```text
{file, proves, date/context, limitation}
```

### 13.5 CommunicationAsset

Includes:

- launch summaries;
- changelogs;
- release notes;
- public posts;
- professional summaries.

Required metadata:

```text
{date, audience, message, linked evidence}
```

## 14. Status Taxonomy

The site needs consistent status words.

Recommended statuses:

```text
Current
Candidate
ShowcaseOnly
Archive
NeedsEvidence
NeedsEditorialPass
Blocked
```

Definitions:

- `Current`: safe to present as present project truth.
- `Candidate`: promising, not fully promoted.
- `ShowcaseOnly`: useful for presentation but not canon.
- `Archive`: kept for history.
- `NeedsEvidence`: content exists but proof is missing or weak.
- `NeedsEditorialPass`: content exists but wording/structure is not professional enough.
- `Blocked`: cannot progress without missing input or external state.

These statuses should be visible when ambiguity would mislead the reader.

## 15. Publication Rules

### Rule 1: Public claims need public anchors

If the site claims something, it should point to a page, file, screenshot, gate,
fixture, or decision.

### Rule 2: Visual polish cannot carry unsupported claims

Beautiful surfaces can attract attention, but they cannot replace evidence.

### Rule 3: Candidate assets must be labeled

If an asset is not canon, say so.

### Rule 4: Archive material must not look like current instruction

Archive pages should be readable but visually and textually marked as historical.

### Rule 5: Dynamic surfaces must be bounded

Interactive canvases, boards, or shaders should have visible limits. They should
not create unbounded scroll, hidden overflow, or unclear navigation.

### Rule 6: Every page needs a next step

The reader should never reach a dead end without knowing what to inspect next.

### Rule 7: The Index should be coherent, not exhaustive

The Index should route, summarize, and prove the site shape. It should not hold
all details.

## 16. Logical Invariants

The documentation system should satisfy these invariants:

### Invariant A: No orphan public surface

```text
∀s ∈ S_public, ∃r ∈ R such that relates(Index, s)
```

Every public surface should be discoverable from the Index or top navigation.

### Invariant B: Canon requires evidence

```text
∀o ∈ K, ev(o) ≠ ∅
```

Canon without evidence is not allowed.

### Invariant C: Candidate is not canon

```text
∀o ∈ X, canonicality(o) ≠ K unless promoted(o) = true
```

Explorations stay clearly separated until promoted.

### Invariant D: Archive does not override current

```text
∀h ∈ H, ∀k ∈ K, conflicts(h, k) -> current(k) wins
```

Archive context cannot silently supersede current canon.

### Invariant E: Asset status is explicit

```text
∀a ∈ Asset_public, canonicality(a) is defined
```

Public assets need clear status.

### Invariant F: Gate coverage matches claim scope

```text
claim_scope(c) ⊆ gate_scope(g) is required for g to prove c
```

A narrow smoke gate cannot prove a broad product claim.

### Invariant G: Reader path exists

```text
∀reader_type ∈ Reader, ∃path(Index, target(reader_type))
```

Each important reader type needs a meaningful path from the Index.

## 17. Documentation Map As Set Partition

The ideal site should offer a map that partitions the corpus by intent:

```text
Intent = Learn ∪ Inspect ∪ Verify ∪ Reuse ∪ Follow
```

Where:

- `Learn` explains the project and concepts.
- `Inspect` opens surfaces and assets.
- `Verify` exposes evidence and gates.
- `Reuse` exposes tokens, assets, and specs.
- `Follow` exposes roadmap and communications.

Mapping:

```text
Learn  -> Project, Methodology, Architecture
Inspect -> Surfaces, Central, Menus, Renderer, Film
Verify -> Evidence, Gates, Port data, Screenshots
Reuse -> Design System, Assets, Tokens, Specs
Follow -> Roadmap, Changelog, Launch notes
```

This is a better mental model than a flat list of pages.

## 18. Proposed Index Upgrade Content Blocks

The Index can evolve toward the following blocks:

### Block 1: Project Definition

Reader-facing purpose:

```text
gnu.in-OS is a shell and documentation corpus exploring how surfaces, motion,
context, assets, and engine data can be composed into a coherent native-feeling
system.
```

This block should include:

- project statement;
- current version/status;
- what is inspectable now;
- what is not promised yet.

### Block 2: Documentation Map

A concise routing map:

- Learn the project;
- inspect the surfaces;
- verify the evidence;
- reuse the assets;
- follow the roadmap.

### Block 3: Canon Status

A small status table:

- current mascot;
- Syster kit status;
- cube favicon;
- Index live map;
- Central simulation;
- port data;
- archive plan.

### Block 4: Methodology

Explain the operating method:

- build surface;
- name role;
- attach evidence;
- run gate;
- mark status;
- promote only when proof is strong enough.

### Block 5: Assets And Sources

A public entry to:

- symbols;
- mascot;
- screenshots;
- tokens;
- specs;
- UI kits.

### Block 6: Communications

A public path to:

- launch note;
- changelog;
- release notes;
- progress journal.

This matters because the project is also professional signaling. The site should
help the creator explain the project clearly outside the development thread.

## 19. Required New Pages

The next major content pass should create or upgrade these pages.

### 19.1 Project Page

File suggestion:

```text
Project.dc.html
```

Purpose:

Explain the vision, scope, status, and public framing.

Key sections:

- What is gnu.in-OS?
- Why this project exists.
- What is public now.
- What is simulated, implemented, candidate, or archive.
- Professional context.
- Next reading path.

### 19.2 Methodology Page

File suggestion:

```text
Methodology.dc.html
```

Purpose:

Expose how the project is produced and validated.

Key sections:

- Documentation-first method;
- surface promotion method;
- evidence model;
- regression protocol;
- archive drop handling;
- decision records.

### 19.3 Assets Page

File suggestion:

```text
Assets.dc.html
```

Purpose:

Inventory reusable material and mark canon status.

Key sections:

- symbols;
- mascot;
- screenshots;
- tokens;
- data specs;
- UI kits;
- candidate material.

### 19.4 Communications Page

File suggestion:

```text
Communications.dc.html
```

Purpose:

Make public progress understandable.

Key sections:

- launch note;
- changelog;
- release notes;
- public summaries;
- message templates;
- professional project description.

### 19.5 Evidence Page

File suggestion:

```text
Evidence.dc.html
```

Purpose:

Make verification visible and inspectable.

Key sections:

- smoke gates;
- screenshots;
- fixtures;
- manifests;
- known regression classes;
- live Pages status when available.

## 20. Public Writing Standard

The writing should be professional, concrete, and useful.

### Good public documentation says:

- what exists;
- why it exists;
- how to inspect it;
- what evidence supports it;
- what remains unresolved.

### Weak public documentation says:

- that something is "cool";
- that something will be "hard";
- that something is "next";
- that something is "important";
- without explaining what, why, or proof.

The site can be personal and distinctive. It should still avoid private chat
phrases, helper text, unexplained internal references, and words that make the
reader feel they arrived in the middle of an unedited working session.

## 21. Content Depth Gradient

Not every page should be equally verbose.

Use this depth model:

```text
Index depth      = concise orientation
Hub depth        = medium explanation + routing
Spec depth       = detailed contract
Method depth     = detailed reasoning
Evidence depth   = exact and procedural
Communication    = short and shareable
Archive depth    = preserved but framed
```

This document is intentionally deeper than the public Index should be. Its job
is to guide future public content.

## 22. Regression Prevention For Documentation Itself

The site needs content regression checks, not just layout checks.

Suggested future checks:

```text
No forbidden public terms in root pages.
Every root page has one h1.
Every root page has a favicon.
Every main surface is linked from nav or Index.
Every canon-labeled object has evidence text nearby.
Every candidate/showcase object is labeled.
Every page has a next-step link.
No root page has horizontal overflow at mobile widths.
```

The current `tools/smoke-index-surface.js` already checks part of this for the
Index. Future gates can expand the same model page by page.

## 23. Next Zip Drop Use

When a new archive arrives, do not merge by appearance alone.

Use this logic:

```text
IncomingDrop = new files/assets/pages
CurrentCanon = current repo after 34e2309
MergeCandidate = IncomingDrop ∪ CurrentCanon
```

The merge is acceptable only if:

```text
IndexContract survives
∧ nav contract survives
∧ favicon contract survives
∧ mobile rail contract survives
∧ canon/candidate distinction survives
∧ evidence gates can still run
```

If the drop adds useful content but breaks the current Index contract, preserve
the content in a scratch analysis first, then reapply it into the current
structure.

## 24. Minimal Deliverable For The Next Public Upgrade

A meaningful next public upgrade should include:

1. Index updated with documentation map and canon status.
2. New or upgraded Methodology page.
3. New or upgraded Assets page.
4. New or upgraded Evidence page.
5. Communications or Launch Note page.
6. Root navigation updated to expose these without crowding.
7. Smoke gate expanded to ensure new pages render and remain discoverable.

This is the smallest version that satisfies the user's direction:

```text
Visitors can find the project, method, assets, communications, evidence,
architecture, and roadmap.
```

Anything smaller may improve the site, but it will not satisfy the full goal.

## 25. Final Principle

The site should make a young professional's work legible without flattening the
project's personality.

That means:

- keep the visual identity;
- increase the documentation depth;
- label truth versus exploration;
- show evidence;
- make the project easy to explain;
- make the next step obvious;
- make future archive drops safer to absorb.

In set terms:

```text
GreatPublicSite = StrongIdentity
                ∩ UsefulDocumentation
                ∩ ClearCanonicality
                ∩ InspectableEvidence
                ∩ NavigableCorpus
                ∩ SustainableChangeProcess
```

The current Index contributes `StrongIdentity` and part of `NavigableCorpus`.
The next phase must add `UsefulDocumentation`, `ClearCanonicality`,
`InspectableEvidence`, and `SustainableChangeProcess` at public depth.
