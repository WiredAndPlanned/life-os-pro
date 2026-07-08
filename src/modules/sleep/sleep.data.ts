/**
 * Sleep — module data (§12). Treat rest as part of a good life. Hours render
 * neutral (§6.3). Search only — a past night is not an upcoming worry (§13).
 */

import { collection } from "@data/crud";
import { registerSearchProjector } from "@data/reflection";
import type { StoreData } from "@data/types";

export const sleep = collection("sleep", "slp");

export function formatHours(h: number): string {
  return `${h % 1 === 0 ? String(h) : h.toFixed(1)} h`;
}

export function registerSleepReflection(): void {
  registerSearchProjector((state: StoreData) =>
    state.sleep.map((s) => ({
      id: s.id,
      owner: "sleep",
      title: `${formatHours(s.hours)} sleep`,
      destination: "life" as const,
    })),
  );
}
