/**
 * Subscriptions — module data (Constitution §12).
 *
 * Owns recurring costs. Unlike Spending, a subscription has an UPCOMING date
 * (the next charge), so it projects onto Today's "due & upcoming" (§13) as well
 * as into Search (§14). This is the reference for a module that reflects onto
 * Today. Money renders neutral, never a scoreboard (§6.3).
 */

import { collection } from "@data/crud";
import { registerDueProjector, registerSearchProjector } from "@data/reflection";
import type { StoreData, Subscription, BillingCycle } from "@data/types";
import { formatMoney } from "@modules/spending/spending.data";

export const subscriptions = collection("subscriptions", "sub");

export const BILLING_CYCLES: Record<BillingCycle, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

/** Monthly-equivalent cost, for a calm total (still neutral, never a verdict, §6.3). */
export function monthlyEquivalent(sub: Subscription): number {
  switch (sub.cycle) {
    case "weekly":
      return (sub.cost * 52) / 12;
    case "yearly":
      return sub.cost / 12;
    case "monthly":
    default:
      return sub.cost;
  }
}

export function monthlyTotal(subs: ReadonlyArray<Subscription>): number {
  return subs.reduce((sum, s) => sum + monthlyEquivalent(s), 0);
}

/** A plain, calm "when next" phrase in the product voice (§4.1). */
export function nextChargeLabel(next: number, now = Date.now()): string {
  const days = Math.ceil((next - now) / (24 * 60 * 60 * 1000));
  if (days < 0) return "Was due";
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days <= 30) return `Due in ${String(days)} days`;
  return new Date(next).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function registerSubscriptionsReflection(): void {
  // Search: every subscription is findable, opening the Life module (§14).
  registerSearchProjector((state: StoreData) =>
    state.subscriptions.map((s) => ({
      id: s.id,
      owner: "subscriptions",
      title: s.name,
      subtitle: `${BILLING_CYCLES[s.cycle]} · ${formatMoney(s.cost)}`,
      destination: "life" as const,
    })),
  );

  // Due: the next charge surfaces on Today as it approaches (§13) — the central
  // promise made mechanical: money leaving your account is never a surprise.
  registerDueProjector((state: StoreData) =>
    state.subscriptions.map((s) => ({
      id: s.id,
      owner: "subscriptions",
      title: `${s.name} · ${formatMoney(s.cost)}`,
      dueAt: s.next,
      destination: "life" as const,
    })),
  );
}
