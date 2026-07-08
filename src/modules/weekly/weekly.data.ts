/**
 * Weekly — module data (§12). See and shape the whole week at a glance, by
 * time-band. A week plan is a grid, not a stream of deadlines, so it registers
 * search only, not Today "due" (§13).
 */

import { collection } from "@data/crud";
import { registerSearchProjector } from "@data/reflection";
import type { StoreData, WeekBand, WeekDay } from "@data/types";

export const weekly = collection("weekly", "wk");

export const WEEK_DAYS: { key: WeekDay; label: string }[] = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

export const WEEK_BANDS: { key: WeekBand; label: string }[] = [
  { key: "morning", label: "Morning" },
  { key: "afternoon", label: "Afternoon" },
  { key: "evening", label: "Evening" },
];

export function registerWeeklyReflection(): void {
  registerSearchProjector((state: StoreData) =>
    state.weekly.map((w) => ({
      id: w.id,
      owner: "weekly",
      title: w.text,
      destination: "plan" as const,
    })),
  );
}
