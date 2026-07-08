# Life OS Pro

A calm, local-first personal organizer for a young person's whole life — the concrete product expression of the WiredAndPlanned three-level constitution.

> **Philosophy in one line:** one accent, neutral data, quiet categories; every capability has one owner and is merely *reflected* elsewhere; **Today** is the calm home that gathers a life.

---

## Grounding

Built against three locked constitutions and one identity board, in strict hierarchy. The constitutions are the specification; the implementation follows them and does not reinterpret them. Where code and a constitution conflict, the constitution governs and the conflict is a defect.

1. **Level 1 — WiredAndPlanned Constitution** (timeless philosophy, values, states, connectivity, governance)
2. **Level 2 — Life Systems Collection Constitution** (shared design system, navigation, motion, CRUD, persistence, quality floors)
3. **Level 3 — Life OS Pro Product Constitution** (this product's purpose, personality, palette, modules, workflows)
4. **WiredAndPlanned Identity Board** (the sole canonical source for the brand mark)

## What it is

Nineteen focused modules across four families, held together by two cross-cutting surfaces (Today and Search) plus Settings:

- **Plan** — Brain Dump, Weekly, Monthly, Recurring, Goals, Study
- **Life · Money** — Spending, Subscriptions, Savings, Debt
- **Life · Health & self** — Habits, Mood, Sleep, Movement, Hydration
- **Life · Everyday** — Meals, Grocery, Content, Career

Everything lives on the device (local-first), needs no account, and is portable via export/import.

## Architecture

A strictly layered React + TypeScript app. Dependencies point one way only:

```
tokens  →  ui  →  modules  →  app
                     ↓
                   data  (single source of truth)
lib  (framework-free helpers)
```

- **`src/tokens`** — the frozen design-token layer (color, scale, base). The single source of every visual value; theme switching is pure CSS variable swapping.
- **`src/ui`** — the shared component library. Every interactive component ships its full state set. Modules compose these; they never fork or restyle them.
- **`src/data`** — the behavioral single source of truth: a reactive store, the Universal CRUD floor, versioned local-first persistence with export/restore, and the reflection/search derivation that feeds Today and Search **without a second copy**.
- **`src/modules/<name>`** — one folder per module: a data seam (CRUD binding + reflection projectors), a screen, an add/edit sheet, a barrel. All follow `docs/MODULE-PATTERN.md`.
- **`src/app`** — the shell, routing, the three cross-cutting surfaces, and the module registry.

### Key invariants (enforced, not just intended)
- **One source of truth.** Only `src/data/**` touches device storage (ESLint boundary). Today and Search *derive* from the store; they hold no copies.
- **One owner per capability.** Every datum has exactly one home module; reflection is pull-from-one-store, never push-a-copy.
- **Consume, don't fork.** No hardcoded colors anywhere; every value comes from a token.
- **Every state ships.** Empty (teaches & invites), loading, success, error — from the shared library.

## Running it

```bash
npm install
npm run dev      # start the dev server
npm run build    # typecheck (tsc) + production build
npm run test     # vitest (data-layer contract tests)
npm run lint     # eslint, including the storage-boundary rule
```

## Verification

Developed in a sandbox **without network access**, so the real toolchain (`vite`, `tsc`, `eslint`, `vitest`) could not be installed there. Correctness was instead verified two ways, both real:

1. **Execution** — the framework-free logic (store, CRUD, persistence, reflection, search, each module's data seam) was run directly in Node against the *actual algorithms*. See `scripts/verify-*.ts` (48 logic checks in total, all passing):
   - `verify-data-layer.ts` — CRUD, persistence round-trip, export→wipe→import, reflection, search (16)
   - `verify-integration.ts` — cross-module Today/Search aggregation (8)
   - `verify-phase6.ts` — Today + Search + appearance end-to-end (16)
   - `verify-spending.ts` — the reference module's data logic (8)
   - `verify-perf.ts` — Today/Search performance at 10,000 entities (0.72 ms / 2.10 ms per call)

   Run any with: `node --import tsx/dist/loader.mjs scripts/<file>.ts`

2. **Render** — pixel-accurate static previews (token palette, full component gallery, module screens, cross-cutting surfaces) were rendered with headless Chromium in both themes, with computed styles checked programmatically. See `docs/*.html`.

A single `npm install && npm run dev` pass in a networked environment is the final confirmation step; the repo is typed (strict TS) and structured for it.

## Documentation

- `docs/ARCHITECTURE.md` — the engineering decision record.
- `docs/BUILD-PLAN.md` — the seven-phase build methodology and per-phase status.
- `docs/MODULE-PATTERN.md` — the repeatable recipe every module follows.
- `docs/HARDENING-REPORT.md` — the Phase 7 audit results and coherence review.

## Honest ledger

- **`--ink-3` deviates from §6.2 by design.** The constitution's `#8A85A3` fails the §24 contrast floor for small meta text (3.52:1); the build uses `#6B6685` (compliant on all light grounds) and flags it for ratification. Accessibility is never waived.
- **Hydration has no list "empty state"** — intentional; its zero-count counter *is* the interface.
