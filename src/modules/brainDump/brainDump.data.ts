/**
 * Brain Dump — module data (Constitution §12).
 *
 * The simplest module: get anything out of your head instantly, sort later.
 * One text field, no categories. It is the head-dump workflow's home (§15).
 * Search projector only — a thought has no date, so it never clutters Today (§13).
 */

import { collection } from "@data/crud";
import { registerSearchProjector } from "@data/reflection";
import type { StoreData } from "@data/types";

export const brainDump = collection("brainDump", "thk");

export function registerBrainDumpReflection(): void {
  registerSearchProjector((state: StoreData) =>
    state.brainDump.map((t) => ({
      id: t.id,
      owner: "brainDump",
      title: t.text,
      destination: "plan" as const,
    })),
  );
}
