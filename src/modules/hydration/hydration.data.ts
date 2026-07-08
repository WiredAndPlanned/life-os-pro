/**
 * Hydration — module data (§12). A quiet daily nudge to drink water. A per-day
 * count against a goal. Count renders neutral (§6.3). No search noise (a number
 * per day isn't a searchable thing) and no Today "due" — it's an ambient daily
 * nudge, surfaced on Today's "what's live" strip (Phase 6), not its "due" list.
 */

import { collection } from "@data/crud";
import type { StoreData, HydrationDay } from "@data/types";

export const hydration = collection("hydration", "hyd");

/** The default daily goal (glasses). A comfort default, adjustable later. */
export const DEFAULT_WATER_GOAL = 8;

export function dayKey(ms = Date.now()): string {
  const d = new Date(ms);
  return `${String(d.getFullYear())}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Today's hydration record, if any (one per day-key). */
export function todayRecord(state: StoreData): HydrationDay | undefined {
  const key = dayKey();
  return state.hydration.find((h) => dayKey(h.date) === key);
}
