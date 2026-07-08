/**
 * Study — module data (Constitution §12, §15).
 *
 * Owns assignments and deadlines. This is the deadline safety-net (§15): a due
 * date exists here and AUTOMATICALLY surfaces on Today as it approaches (§13),
 * so it can never be lost to a different app — the product's central promise
 * made mechanical. Search + due projectors both registered.
 */

import { collection } from "@data/crud";
import { registerDueProjector, registerSearchProjector } from "@data/reflection";
import type { StoreData, StudyStatus } from "@data/types";

export const study = collection("study", "asg");

export const STUDY_STATUS: Record<StudyStatus, string> = {
  todo: "To do",
  doing: "Doing",
  done: "Done",
};

export const STUDY_STATUS_ORDER: StudyStatus[] = ["todo", "doing", "done"];

/** Plain "when due" phrase in the product voice (§4.1) — stated, never alarmed. */
export function dueLabel(due: number, now = Date.now()): string {
  const days = Math.ceil((due - now) / (24 * 60 * 60 * 1000));
  if (days < 0) return "Overdue";
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days <= 14) return `Due in ${String(days)} days`;
  return new Date(due).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function registerStudyReflection(): void {
  registerSearchProjector((state: StoreData) =>
    state.study.map((a) => ({
      id: a.id,
      owner: "study",
      title: a.task,
      subtitle: a.subject,
      destination: "plan" as const,
    })),
  );

  // Only unfinished work surfaces on Today (§13): a done assignment is not a worry.
  registerDueProjector((state: StoreData) =>
    state.study
      .filter((a) => a.status !== "done")
      .map((a) => ({
        id: a.id,
        owner: "study",
        title: `${a.subject}: ${a.task}`,
        dueAt: a.due,
        destination: "plan" as const,
      })),
  );
}
