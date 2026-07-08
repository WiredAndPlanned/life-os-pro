# Life OS Pro — Engineering Architecture (Phase 0)

_Architecture Decision Record. Companion to the locked Level 1 / Level 2 / Level 3 constitutions and the WiredAndPlanned Identity Board. This document records the engineering decisions that the whole build stands on. It is subordinate to the constitutions: where any conflict exists, the constitution governs and the conflict is a defect to be corrected (Level 1 §18)._

**Status:** Phase 0 deliverable. The scaffold described here is frozen at the Phase 0 exit gate and changes only via a discovered defect, per the locked build methodology.

---

## 0. What Phase 0 is, and is not

Phase 0 establishes the **skeleton every later phase stands on**: project structure, the build/lint/test toolchain, the layered module boundaries, the state/persistence/routing/reflection decisions, and a bootable, navigable empty app. It contains **no product design and no real modules** — those are later phases, built against this frozen scaffold.

The ordering is deliberate (see the approved strategy): build the substrate that everything depends on first, prove it, freeze it, then replicate a proven pattern. Phase 0 is the first freeze point's foundation.

---

## 1. Target stack (locked, Constitution §26)

- **React 18** + **TypeScript** (strict) + **Vite 5** — the build target named in §26.
- **react-router-dom 6** for real, URL-based routing with working browser history — a direct correction of the legacy build, whose routing lived only in transient JS state, leaving the device back button dead (§20).
- **Vitest** + **Testing Library** for tests, because performance and correctness are _verified, not assumed_ (§25).
- **ESLint** (strict type-checked) + **jsx-a11y** (as errors) + **Prettier**, because the accessibility, quality, and consistency floors are enforced mechanically, not by hope (§24, §26).
- **No UI framework, no component library dependency, no CSS-in-JS runtime.** The shared component library (Phase 2) and token layer (Phase 1) are built in-house as the collection's certified expression (§26: consume the collection's system, never fork it; do not pull in a third-party design system that would fork it).
- **No state-management library** is adopted in Phase 0. The data layer (Phase 3) will use a small, explicit store; a library is only added if Phase 3 proves it earns its place (§27). Default is no.

Dependencies are intentionally minimal. Every dependency is a long-term maintenance liability (§26, Level 1 §14), so the list stays short and boring.

---

## 2. Layered architecture

The codebase is organized in **dependency layers**, lower layers never importing upper ones. This is what makes nineteen modules composable instead of tangled, and it is what lets each layer be built and frozen in its own phase.

```
              ┌─────────────────────────────────────────────┐
   Phase 4-6  │  modules/     the nineteen product modules   │   (owners of data)
              │  + Today, Search, Settings surfaces          │
              └───────────────┬─────────────────────────────┘
                              │ composes
              ┌───────────────▼─────────────────────────────┐
   Phase 2    │  ui/          shared component library        │   (card, row, sheet,
              │               + voice-bearing patterns        │    dialog, nav, icons,
              └───────────────┬─────────────────────────────┘    empty-state, states)
                              │ uses
              ┌───────────────▼─────────────────────────────┐
   Phase 3    │  data/        store, CRUD contract,           │   (one source of truth
              │               persistence, reflection, search │    per entity, §12/§16)
              └───────────────┬─────────────────────────────┘
                              │ styled by
              ┌───────────────▼─────────────────────────────┐
   Phase 1    │  tokens/      design tokens + themes          │   (the visual SSOT)
              └───────────────┬─────────────────────────────┘
                              │ wired by
              ┌───────────────▼─────────────────────────────┐
   Phase 0    │  app/         shell, routing, providers       │   (this phase)
              │  lib/         framework-free helpers          │
              └─────────────────────────────────────────────┘
```

Path aliases (`@app`, `@tokens`, `@ui`, `@data`, `@modules`, `@lib`) are defined identically in `vite.config.ts` and `tsconfig.app.json` and encode these boundaries. The dependency direction is a rule, not a suggestion: a lint/review boundary keeps `modules/` from reaching past `ui/`+`data/` into another module's internals (§16 — no module silently drives another).

### Why these layers map to the phases

Each layer is a freeze point in its phase. `tokens/` and `ui/` and `data/` are built and frozen (Phases 1–3) **before** any real module consumes them (Phases 4–5). Freezing converts "nineteen chances to drift" into "nineteen applications of one pattern." This is the core of the approved methodology.

---

## 3. State & data model (decided here, implemented in Phase 3)

The constitution's data laws (Level 1 §11, §14; Level 2 §13–15; Level 3 §22) reduce to a small set of engineering commitments:

- **One source of truth per entity.** A datum is stored once. Every screen — including the cross-cutting Today and Search surfaces — _reads_ from that store and reflects changes live; nothing holds a second copy (§12, §13, §16). Cross-cutting surfaces own nothing.
- **Owner modules own their entities.** The ownership map in §12 is the authority. Each module owns a named entity type with a defined shape (already specified in §12); Phase 3 encodes those shapes as TypeScript types and the store keys.
- **Stable identifiers.** Every list entity carries a stable unique `id`. Reflection, editing, and search resolve through ids, never array positions — a correction of the legacy build's index-based deletion (§22).
- **Local-first persistence.** All data lives on the device, survives reload, and needs no account or network (§22, Level 1 §14). The `data/` layer is the _only_ layer permitted to touch device storage; this is enforced by lint (`no-restricted-globals` on `localStorage`/`sessionStorage` outside `src/data/**`). Modules never persist directly — they go through the store, so a rogue second copy is impossible by construction.
- **Export / restore / safe migration.** The whole life exports to one portable file and restores; imports merge safely against the current data shape so stored data survives product updates (§22, Level 2 §14). Phase 3 defines the versioned envelope and the migration seam.

**Persistence-key namespace (contract):** all keys are namespaced `lifeospro.*`. This includes `lifeospro.appearance` (the appearance preference, shared between the pre-paint script in `index.html` and `data/appearance.ts`), the `lifeospro.data.v1` envelope, and `lifeospro.name`. The layer also reads the pre-rename `genz.*` keys once and migrates them forward transparently, so the product rename never orphans a person's saved data.

**Reflection mechanism (decided):** owners publish to a single store; cross-cutting surfaces subscribe and derive their views (Today gathers everything dated; Search indexes every owned type). Reflection is _pull from one store_, never _push a copy_. The mechanism is proven on a throwaway entity at the Phase 3 exit gate before any real module depends on it.

---

## 4. Routing & navigation (implemented in Phase 0)

- Routes are generated from a **single destination registry** (`app/destinations.ts`) — the five primary destinations (§11). The router and every navigation presentation read from this one list; none keeps its own copy. A test guards the five-count as a constitutional invariant (§11, §27).
- **Real URL history**, so device back/forward work naturally (§20).
- `today` is the index route — the default, most-returned-to destination (§11, §13).
- The **one architecture, three presentations** (bottom bar / rail / sidebar by size class, Level 2 §9) is built in **Phase 2** against the frozen component library. Phase 0 ships only a minimal accessible scaffold nav so the destinations are reachable for the exit gate.

---

## 5. Theme system (implemented in Phase 0, palette filled in Phase 1)

- **System / Light / Dark, and nothing else**, chosen only in Settings (§18, Level 2 §7). No floating toggle anywhere (a correction of the legacy top-bar toggle).
- **Applied before first paint, no flash**: a tiny inline script in `index.html` resolves the persisted preference (consulting the OS for "system") and sets `data-theme` on `<html>` before the app bundle loads. This is the only read of persistence outside `data/`, and it is deliberate and documented.
- **Only luminance changes** between themes; identity, type, spacing, components, and motion are identical (§6.2, §18).
- Phase 0 ships **bootstrap tokens** (`tokens/bootstrap.css`) — minimal variables using the constitution's real names (`--bg`, `--ink`, `--signal`, …) so the plumbing is provable now and the Phase 1 values drop in without touching consumers. **Phase 1 replaces this file wholesale** with the certified palette and the consumed Level 2 spacing/radius/type/elevation/motion tokens.

---

## 6. Accessibility, motion, and voice from the first phase

These floors are never waived and are not deferred to a "polish" phase (§24, §21, §4.1):

- **Accessibility:** `jsx-a11y` runs as errors; the scaffold nav is a labelled `<nav>` of real links with `aria-current`, 44px minimum targets, and visible focus. Every later component ships its full state set including `focus-visible` (§10, §24).
- **Motion:** `prefers-reduced-motion` is honored globally from Phase 0's bootstrap CSS; the real arrival-and-settle system is Phase 2 (§21).
- **Voice:** the writing rules (§4.1) are encoded into the reusable state components in Phase 2 (empty/error/success/confirm), so every surface speaks in one voice by construction, not by review.

---

## 7. Testing & CI strategy

- **Unit/behavior tests** (Vitest + Testing Library) accompany each layer as it is built. Phase 0 already tests the five-destination invariant.
- **`npm run verify`** runs typecheck + lint + format-check + tests as one gate. This is the mechanical form of the exit gates: nothing crosses a phase boundary with `verify` red.
- **Per-phase exit gates** (from the approved methodology) are the human form of the same discipline. They are listed in `docs/BUILD-PLAN.md`.
- CI runs `verify` on every push (to be wired with the repo host in Phase 0 close-out).

---

## 8. Explicit non-goals (restated so they cannot creep in)

Per §17, §22, §23 and Level 1 Appendix B, the following are **rejected** and must not appear in any phase without passing the Feature Decision Framework (§27), which for each of these returns _no_:

- No command palette, no right-click menus, no bulk-action bars, no dense toolbars.
- No universal drag-and-drop.
- No 22-verb CRUD. The floor is create/read/edit/delete/persist; richer verbs are per-entity and earned, never universal.
- No "everything connects to everything" dependency graph. The only unification points are Today and Search.
- No floating chrome (no floating theme toggle, no floating action menu competing with content).
- No AI recommendations / natural-language commands / smart optimization as a system to manage. Intelligence, if any, is at most one quiet, explainable, ignorable nudge per context (§23).
- No "animate everything." Motion is arrival-and-settle on genuine interactions only.
- No heavy customization surface. Appearance is a set-once comfort preference, not a feature to tinker with.
- No second core problem. Breadth is the identity; a twentieth module or a team/social/publishing direction is a new product, not an enlargement of this one (§1, §12, §28).

---

## 9. What is verified at Phase 0 close, and what awaits install

**Verified now (in this environment):** the full scaffold exists and is internally coherent; all config files are valid; the layered structure, path aliases, destination registry, routing wiring, theme plumbing, appearance data module, and the architecture tests are written and self-consistent.

**Awaits `npm install` in a networked environment (the executable half of the exit gate):** `npm run verify` (typecheck/lint/format/tests green) and `npm run dev` (empty app boots, routes across all five destinations with working back/forward, in both light and dark, theme applied before first paint, no modules). The dependency toolchain (Vite, react-router, Vitest, ESLint plugins) cannot be installed in the current sandbox because it has no network access; the scaffold is written to pass these the moment it is run where install is possible.

This is stated plainly rather than glossed: Phase 0's exit gate is _met in code_ and _pending one clean install-and-run_ to be met _in execution_.
