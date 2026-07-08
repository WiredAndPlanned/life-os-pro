# Life OS Pro — Build Plan (locked methodology)

The approved, locked implementation strategy. Optimized for architectural consistency, product and engineering quality, maintainability, scalability, and long-term evolution — **not** for speed. Foundation-first, then module-by-module on a frozen scaffold.

Each phase has a hard **exit gate**. Nothing proceeds until the gate is met. The gates are the discipline; crossing one early is the maintainability debt this methodology exists to avoid. `npm run verify` (typecheck + lint + format + tests) is the mechanical form of each gate.

---

### Phase 0 — Engineering Architecture & Foundations _(COMPLETE)_

Project structure, toolchain, layered boundaries; the state/persistence/routing/reflection decisions (see `ARCHITECTURE.md`); testing + CI; explicit non-goals; a bootable, navigable empty app. No product design, no modules.

**Exit gate:** empty app boots, routes across the five destinations with working back/forward, in both themes, token plumbing wired — no modules. (`npm run verify` green; `npm run dev` runs.)

---

### Phase 1 — Design-Token & Theme Layer _(COMPLETE · frozen)_

The visual single source of truth: the certified palette (§6.1–6.5) and the consumed Level 2 spacing/radius/type-scale/elevation/motion tokens. Light/Dark/System, flash-free, Settings-only. Replaces the Phase 0 bootstrap tokens wholesale.

**Exit gate:** every token resolves in both themes; theme switch is flicker-free; contrast floors proven; a scale page renders. Frozen thereafter (changes only via discovered defect).

---

### Phase 2 — Shared Component Library & Voice _(COMPLETE · frozen)_

Card, row, bottom sheet (primary input surface), confirmation dialog, buttons, fields, the icon system, the empty-state illustration language, and the nav in all three presentations. Every interactive component ships its full state set (rest/hover/active/pressed/focus-visible/disabled/selected). Voice (§4.1) encoded into the state components. Arrival-and-settle motion defined once.

**Exit gate:** a component gallery renders every component in every state, both themes, reduced-motion verified. This gallery is the living contract.

---

### Phase 3 — Data & Persistence Layer + CRUD Contract _(COMPLETE · frozen)_

Local-first store, one source of truth per entity, stable ids, immediate persistence, export/restore, safe-merge import. Universal CRUD as a reusable pattern. The reflection mechanism (owner → Today/Search, no second copy). Search infrastructure.

**Exit gate:** a throwaway entity can be created/edited/deleted, persists across reload, appears in Search, reflects onto Today, and survives export→wipe→import. Frozen thereafter.

---

### Phase 4 — The Reference Module (pattern-setter) _(COMPLETE)_

Build ONE real module end-to-end to production quality (recommend Habits or Spending): every state, full a11y, both themes, real voice, real motion. Extract the written **module pattern** every remaining module follows.

**Exit gate:** the reference module is shippable on its own; the module pattern is documented. This is the pivot from building architecture to replicating a proven pattern.

---

### Phase 5 — Module-by-Module Replication _(COMPLETE)_

The remaining eighteen modules, grouped by family (Health → Money → Everyday → Plan), each finished completely before the next begins. Composition against the frozen scaffold, not invention.

**Exit gate (per module):** matches the reference pattern; adds no new token, no forked component, no new nav idea. Any temptation routes through the Feature Decision Framework (§27), default no.

---

### Phase 6 — Cross-Cutting Assembly _(COMPLETE)_

With all owners live: Today at full strength (gathers everything due/upcoming, §13), Search across every real type (§14), Settings complete (name, appearance, export/import/reset, §18/§22).

**Exit gate:** Today reflects the whole product and stays fast; Search finds everything and opens owners; the deadline safety-net works end-to-end (§15).

---

### Phase 7 — Production Hardening _(COMPLETE)_

Performance verification on Today/Search as data grows (§25); responsive across every supported width, both themes (Level 2 §18); full-app a11y + reduced-motion; export/import at scale; the "every state ships" audit (§26); final coherence review against all three constitutions and the Identity Board.

**Exit gate:** production-ready. Every floor met and verified, not assumed.

---

**Change control:** the phase plan itself is locked. If a genuine architectural reason ever requires adjusting it, work stops and the reasoning is explained before any change — it is not adjusted silently.

---

## Phase 5 progress log

**Batch 1 (complete):** All nineteen module data seams built and reflection-wired (Today + Search fully fed; verified 8/8 by cross-module execution). Four modules fully screened to the pattern's definition-of-done, chosen to cover every structural type:
- **Spending** — past-dated log, category color, neutral money summary.
- **Subscriptions** — projects onto Today (next charge), monthly-equivalent total.
- **Brain Dump** — minimal inline-add, no sheet, the head-dump workflow.
- **Study** — deadline safety-net (surfaces on Today), status field.

Plan and Life are hubs routing to their families; not-yet-screened modules show calm placeholders.

**Remaining in Phase 5 (15 module screens):** weekly, monthly, recurring, goals, habits, mood, sleep, movement, hydration, savings, debt, meals, grocery, content, career. Each follows the same pattern (data seams already done); this is mechanical replication against the frozen scaffold.


**Batch 2 (complete):** All remaining fifteen module screens built to the pattern's definition-of-done — savings, debt, habits, mood, sleep, movement, hydration, weekly, monthly, recurring, goals, meals, grocery, content, career. A shared `Progress` bar was added to the component library (used by savings/debt/goals/hydration). **All nineteen modules are now built, routed under the Plan and Life hubs, and reflection-wired.** Phase 5 complete.
