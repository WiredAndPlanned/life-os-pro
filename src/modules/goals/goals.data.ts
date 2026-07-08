/**
 * Goals — module data (§12). A few meaningful goals with calm, self-set progress.
 * Progress toward a goal the person set may use the accent — it's their own
 * chosen target (§6.3). An optional due date surfaces on Today (§13).
 */

import { collection } from "@data/crud";
import { registerDueProjector, registerSearchProjector } from "@data/reflection";
import type { StoreData, Goal, GoalArea } from "@data/types";
import type { CategoryFamily } from "@tokens/tokens";

export const goals = collection("goals", "goal");

export const GOAL_AREAS: Record<GoalArea, { label: string; family: CategoryFamily }> = {
  plan: { label: "Plan", family: "plan" },
  health: { label: "Health", family: "health" },
  money: { label: "Money", family: "money" },
  life: { label: "Life", family: "life" },
};

export const GOAL_AREA_ORDER: GoalArea[] = ["plan", "health", "money", "life"];

export function registerGoalsReflection(): void {
  registerSearchProjector((state: StoreData) =>
    state.goals.map((g) => ({
      id: g.id,
      owner: "goals",
      title: g.title,
      subtitle: GOAL_AREAS[g.area].label,
      destination: "plan" as const,
    })),
  );
  registerDueProjector((state: StoreData) =>
    state.goals
      .filter((g): g is Goal & { due: number } => g.due !== undefined && g.progress < 1)
      .map((g) => ({
        id: g.id,
        owner: "goals",
        title: g.title,
        dueAt: g.due,
        destination: "plan" as const,
      })),
  );
}
