/**
 * Habits — module data (§12). Build gentle consistency — streaks WITHOUT
 * pressure (§13). A habit owns a set of day-keys it was marked. There is no
 * "you broke your streak"; a missed day is simply not marked (§4.1, §13).
 * Search only — a habit is a daily rhythm, not a dated deadline (§13).
 */

import { collection } from "@data/crud";
import { registerSearchProjector } from "@data/reflection";
import type { StoreData, Habit } from "@data/types";

export const habits = collection("habits", "hab");

/** Day-key (YYYY-MM-DD) in local time, used for marks. */
export function dayKey(ms = Date.now()): string {
  const d = new Date(ms);
  return `${String(d.getFullYear())}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function isMarkedToday(h: Habit): boolean {
  return h.marks.includes(dayKey());
}

/** Toggle today's mark for a habit. Returns the new marks array. */
export function toggleToday(h: Habit): string[] {
  const key = dayKey();
  return h.marks.includes(key) ? h.marks.filter((k) => k !== key) : [...h.marks, key];
}

/** A calm, gentle current-streak count (never shamed for a break, §13). */
export function currentStreak(h: Habit, now = Date.now()): number {
  const marks = new Set(h.marks);
  let streak = 0;
  const day = 24 * 60 * 60 * 1000;
  // Count back from today while consecutive days are marked.
  for (let i = 0; ; i++) {
    if (marks.has(dayKey(now - i * day))) streak++;
    else break;
  }
  return streak;
}

export function registerHabitsReflection(): void {
  registerSearchProjector((state: StoreData) =>
    state.habits.map((h) => ({
      id: h.id,
      owner: "habits",
      title: h.name,
      destination: "life" as const,
    })),
  );
}
