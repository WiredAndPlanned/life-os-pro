/**
 * Monthly — module data (§12). The month at a glance; a dated note per day. A
 * future-dated month note is genuinely upcoming, so it projects onto Today (§13).
 */

import { collection } from "@data/crud";
import { registerDueProjector, registerSearchProjector } from "@data/reflection";
import type { StoreData, MonthNote } from "@data/types";

export const monthly = collection("monthly", "mon");

export function registerMonthlyReflection(): void {
  registerSearchProjector((state: StoreData) =>
    state.monthly.map((m) => ({
      id: m.id,
      owner: "monthly",
      title: m.note,
      destination: "plan" as const,
    })),
  );
  registerDueProjector((state: StoreData) =>
    state.monthly
      .filter((m: MonthNote) => m.date >= Date.now() - 24 * 60 * 60 * 1000)
      .map((m) => ({
        id: m.id,
        owner: "monthly",
        title: m.note,
        dueAt: m.date,
        destination: "plan" as const,
      })),
  );
}
