/**
 * Savings & Debt — module data (Constitution §12).
 *
 * Both render money in neutral ink, never a scoreboard (§6.3). Savings progress
 * toward a target the person set MAY use the accent, because it's their own
 * chosen goal (§6.3). Debt shrinks calmly — "face debt without dread" (§12) — so
 * it shows progress paid, never a red alarm. Neither has an upcoming date of its
 * own, so both register search only, not Today "due" (§13).
 */

import { collection } from "@data/crud";
import { registerSearchProjector } from "@data/reflection";
import type { StoreData, SavingsGoal, Debt } from "@data/types";
import { formatMoney } from "@modules/spending/spending.data";

export const savings = collection("savings", "sav");
export const debt = collection("debt", "debt");

/** Fraction saved toward a target, clamped 0..1 (for the calm accent bar). */
export function savedFraction(g: SavingsGoal): number {
  if (g.target <= 0) return 0;
  return Math.max(0, Math.min(1, g.saved / g.target));
}

/** Fraction paid off, clamped 0..1 (progress, never a red gauge, §6.3). */
export function paidFraction(d: Debt): number {
  if (d.total <= 0) return 0;
  return Math.max(0, Math.min(1, d.paid / d.total));
}

export function registerSavingsReflection(): void {
  registerSearchProjector((state: StoreData) =>
    state.savings.map((g) => ({
      id: g.id,
      owner: "savings",
      title: g.name,
      subtitle: `${formatMoney(g.saved)} of ${formatMoney(g.target)}`,
      destination: "life" as const,
    })),
  );
}

export function registerDebtReflection(): void {
  registerSearchProjector((state: StoreData) =>
    state.debt.map((d) => ({
      id: d.id,
      owner: "debt",
      title: d.name,
      subtitle: `${formatMoney(d.total - d.paid)} left`,
      destination: "life" as const,
    })),
  );
}
