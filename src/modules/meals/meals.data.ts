/**
 * Meals — module data (§12). Plan the week's food without overthinking. A grid
 * of (day, slot) cells; search only.
 */

import { collection } from "@data/crud";
import { registerSearchProjector } from "@data/reflection";
import type { StoreData, Meal } from "@data/types";

export const meals = collection("meals", "meal");

export const MEAL_SLOTS: { key: Meal; label: string }[] = [
  { key: "b", label: "Breakfast" },
  { key: "l", label: "Lunch" },
  { key: "d", label: "Dinner" },
];

export function registerMealsReflection(): void {
  registerSearchProjector((state: StoreData) =>
    state.meals.map((m) => ({
      id: m.id,
      owner: "meals",
      title: m.text,
      destination: "life" as const,
    })),
  );
}
