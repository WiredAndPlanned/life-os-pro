/**
 * Mood — module data (§12). Notice how you actually feel, judgment-free (§13).
 * Mood renders neutral, never a red/green verdict (§6.3). Search only.
 */

import { collection } from "@data/crud";
import { registerSearchProjector } from "@data/reflection";
import type { StoreData, MoodLevel } from "@data/types";

export const mood = collection("mood", "mood");

export const MOOD_LABELS: Record<MoodLevel, string> = {
  1: "Rough",
  2: "Low",
  3: "Okay",
  4: "Good",
  5: "Great",
};

export function registerMoodReflection(): void {
  registerSearchProjector((state: StoreData) =>
    state.mood
      .filter((m) => (m.note?.length ?? 0) > 0)
      .map((m) => ({
        id: m.id,
        owner: "mood",
        title: m.note ?? "",
        subtitle: MOOD_LABELS[m.mood],
        destination: "life" as const,
      })),
  );
}
