/**
 * Spending — module data (Constitution §12, the Phase 4 reference module).
 *
 * This file is the module's data seam: it binds the Universal CRUD floor to the
 * `spending` collection, declares category metadata (label + quiet color family),
 * formats money in neutral ink (§6.3), and registers the projectors that reflect
 * spending onto Today and Search WITHOUT a second copy (§13, §14, §16).
 *
 * It is the template other modules copy: one collection, CRUD from the shared
 * contract, category metadata, and projector registration. No module-specific
 * store, no forked persistence.
 */

import { collection } from "@data/crud";
import { registerSearchProjector } from "@data/reflection";
import type { StoreData, Expense, SpendCategory } from "@data/types";
import type { CategoryFamily } from "@tokens/tokens";

/** The module's CRUD API — the full floor for free (§22). */
export const spending = collection("spending", "exp");

/** Category metadata: plain label (§4.1) + the quiet color family (§6.5). */
export const SPEND_CATEGORIES: Record<
  SpendCategory,
  { label: string; family: CategoryFamily }
> = {
  food: { label: "Food", family: "life" },
  transport: { label: "Transport", family: "money" },
  fun: { label: "Fun", family: "plan" },
  bills: { label: "Bills", family: "money" },
  other: { label: "Other", family: "health" },
};

export const SPEND_CATEGORY_ORDER: SpendCategory[] = [
  "food",
  "transport",
  "fun",
  "bills",
  "other",
];

/**
 * Format an amount as calm money (§6.3): neutral, plain, tabular. Never colored,
 * never a +/- verdict. Uses the platform locale; currency is a Phase 5 setting,
 * defaulting to USD here.
 */
export function formatMoney(amount: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Sum of expenses in the current calendar month (for the module summary). */
export function monthTotal(expenses: ReadonlyArray<Expense>, now = Date.now()): number {
  const d = new Date(now);
  const year = d.getFullYear();
  const month = d.getMonth();
  return expenses
    .filter((e) => {
      const ed = new Date(e.date);
      return ed.getFullYear() === year && ed.getMonth() === month;
    })
    .reduce((sum, e) => sum + e.amount, 0);
}

/**
 * Register spending's reflection into the cross-cutting surfaces (§13, §14, §16).
 * Called once at app start. Spending has no future-dated "due" items of its own
 * (a purchase is in the past), so it does not project onto Today's "due" list —
 * that restraint is correct: Today gathers what's UPCOMING (§13). It does make
 * every expense searchable, opening the Life destination that owns it (§12, §14).
 */
export function registerSpendingReflection(): void {
  registerSearchProjector((state: StoreData) =>
    state.spending.map((e) => ({
      id: e.id,
      owner: "spending",
      title: e.item,
      subtitle: `${SPEND_CATEGORIES[e.category].label} · ${formatMoney(e.amount)}`,
      destination: "life" as const,
    })),
  );

  // Deliberately no due-projector: see the note above (§13 gathers upcoming).
}
