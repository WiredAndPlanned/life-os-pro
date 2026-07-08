# The Module Pattern

_Extracted from the Phase 4 reference module (Spending). This is the repeatable recipe every remaining module follows in Phase 5. A module that follows this pattern inherits the frozen token layer, component library, and data layer, and needs to invent nothing — which is what keeps nineteen modules coherent (§16) and maintainable for years (§26)._

A module is **composition against the frozen scaffold**, never new architecture. If building one seems to require a new token, a forked component, or a new navigation idea, stop — that is a Feature Decision Framework question (§27), default no.

---

## Anatomy

Every module lives in `src/modules/<name>/` and has the same parts:

```
modules/spending/
  spending.data.ts        data seam: CRUD binding + metadata + projectors
  <Name>Screen.tsx        the owner surface (list + summary + all states)
  <Name>Screen.module.css screen styles (tokens only)
  <Entity>Sheet.tsx       the add/edit bottom sheet
  <Entity>Sheet.module.css
  index.ts                exports the Screen + the reflection registrar
```

---

## The seven steps

### 1. Register the collection (`@data/types.ts`)
Add the module's entity type (extending `Entity`) and its collection to `StoreData`, and add an empty array in `emptyStore()`. The entity's shape is already specified in Constitution §12 — transcribe it; don't redesign it.

```ts
export interface Expense extends Entity {
  readonly item: string;
  readonly amount: number;
  readonly category: SpendCategory;
  readonly date: number;
}
// in StoreData:  readonly spending: Collection<Expense>;
// in emptyStore: spending: [],
```

### 2. Bind CRUD (`<name>.data.ts`)
One line gets the full lifecycle floor (§22). Never write a module-specific store or persistence.

```ts
export const spending = collection("spending", "exp");
```

### 3. Declare category metadata + formatting
Plain labels in the product voice (§4.1); category families map to the quiet dot colors (§6.5). Any number formatting (money, durations) renders calm and neutral (§6.3) — never red/green, never a verdict.

### 4. Register reflection (`register<Name>Reflection`)
Decide honestly what this module projects:
- **Search:** almost always — every owned entity should be findable, opening this module (§14).
- **Today "due":** only if the module owns genuinely **upcoming, dated** things (deadlines, payments, goal dates). A past-dated log (like a purchase) does **not** project onto Today — Today gathers what's ahead (§13). Spending registers search only; Study/Career/Subscriptions/Recurring/Goals will register due.

Then add the registrar to `app/registerModules.ts`. Today and Search never change.

### 5. Build the add/edit sheet (`<Entity>Sheet.tsx`)
Use the shared `BottomSheet` + `Field` + `Button`. One sheet serves both create and edit (`editing` prop present = edit). Validation is shown gently, in place, next to the field, in the product voice (§19, §4.1) — never `alert()`. Save persists immediately via the CRUD binding, then closes.

### 6. Build the owner screen (`<Name>Screen.tsx`)
Read data live with `useSelector((s) => s.<collection>)` — never a local copy (§16). Compose:
- a calm **summary** if the module has one (neutral ink, §6.3);
- the **list** as `Row`s with a quiet category dot (§6.5), whole-row tap to edit;
- a per-row **delete** that routes through the shared `ConfirmDialog` (§17);
- a single **contextual add** button (§17) — never floating chrome;
- **every state**: `EmptyState` that teaches & invites (§9), a quiet `Toast` for success (§19). Loading uses `Skeleton` only for genuinely async moments (§19) — most local reads are instant.

### 7. Route it (`app/routes.tsx`)
Point the owning destination (or a sub-route under Plan/Life) at the screen.

---

## The definition of done (per-module exit gate, Phase 5)

A module is done — not just working — when all of these hold:

- [ ] Entity + collection registered; `emptyStore()` updated.
- [ ] Full CRUD floor works (create/read/edit/delete, persisted immediately, §22).
- [ ] Stable ids; nothing resolves by array position (§22).
- [ ] Add/edit via the shared bottom sheet; validation calm and in-place (§17, §19).
- [ ] Delete via the shared confirm dialog (§17).
- [ ] **Every state ships**: empty (teaches & invites), loading (if async), success (quiet), error (§9, §19, §26).
- [ ] Data read live from the store; no second copy (§16).
- [ ] Numbers/wellbeing render neutral, never a scoreboard (§6.3).
- [ ] Category shown as a quiet dot/edge only (§6.5).
- [ ] Search projector registered; entities findable and open here (§14).
- [ ] Today "due" projector registered **iff** the module owns upcoming dated items (§13).
- [ ] Works in both themes; a11y floor met (focus, labels, targets, reduced motion) (§24).
- [ ] Adds **no** new token, **no** forked component, **no** new nav idea. If it seemed to need one → Feature Decision Framework (§27).

---

## What a module must never do

- Never touch device storage directly (the `@data` layer owns it; lint enforces this).
- Never reach into another module's collection or internals — modules don't drive one another; the only unification is Today and Search (§16).
- Never redefine a token or restyle a shared component (§26).
- Never add a second core problem's worth of scope. A module owns one distinct part of a young life (§12).
