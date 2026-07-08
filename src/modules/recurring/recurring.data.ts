/**
 * Recurring — module data (§12). The things you mean to do regularly, without
 * nagging. Recurrence is a cadence, not a stream of dated deadlines, so it does
 * not push items onto Today's "due" list (§13); it registers search only. (A
 * future refinement could surface "today's recurring" gently — Appendix C.)
 */

import { collection } from "@data/crud";
import { registerSearchProjector } from "@data/reflection";
import type { StoreData, Cadence, PartOfDay } from "@data/types";

export const recurring = collection("recurring", "rec");

export const CADENCES: Record<Cadence, string> = {
  daily: "Every day",
  weekdays: "Weekdays",
  weekends: "Weekends",
  weekly: "Weekly",
};
export const CADENCE_ORDER: Cadence[] = ["daily", "weekdays", "weekends", "weekly"];

export const PARTS_OF_DAY: Record<PartOfDay, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
  any: "Anytime",
};
export const PART_ORDER: PartOfDay[] = ["morning", "afternoon", "evening", "any"];

export function registerRecurringReflection(): void {
  registerSearchProjector((state: StoreData) =>
    state.recurring.map((r) => ({
      id: r.id,
      owner: "recurring",
      title: r.task,
      subtitle: CADENCES[r.cadence],
      destination: "plan" as const,
    })),
  );
}
