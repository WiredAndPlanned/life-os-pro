/**
 * Movement — module data (§12). Move how you like; log it simply. Minutes render
 * neutral (§6.3). Search only.
 */

import { collection } from "@data/crud";
import { registerSearchProjector } from "@data/reflection";
import type { StoreData, MovementType } from "@data/types";

export const movement = collection("movement", "mov");

export const MOVEMENT_TYPES: Record<MovementType, string> = {
  walk: "Walk",
  run: "Run",
  gym: "Gym",
  cycle: "Cycle",
  yoga: "Yoga",
  other: "Other",
};
export const MOVEMENT_ORDER: MovementType[] = ["walk", "run", "gym", "cycle", "yoga", "other"];

export function registerMovementReflection(): void {
  registerSearchProjector((state: StoreData) =>
    state.movement.map((m) => ({
      id: m.id,
      owner: "movement",
      title: `${MOVEMENT_TYPES[m.type]} · ${String(m.minutes)} min`,
      destination: "life" as const,
    })),
  );
}
