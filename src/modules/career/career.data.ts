/**
 * Career — module data (§12). Track a job search calmly, stage by stage. An
 * optional date (e.g. next interview) is genuinely upcoming, so it surfaces on
 * Today (§13). Search + conditional due projectors.
 */

import { collection } from "@data/crud";
import { registerDueProjector, registerSearchProjector } from "@data/reflection";
import type { StoreData, Application, CareerStage } from "@data/types";

export const career = collection("career", "app");

export const CAREER_STAGES: Record<CareerStage, string> = {
  interested: "Interested",
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  closed: "Closed",
};
export const CAREER_STAGE_ORDER: CareerStage[] = [
  "interested",
  "applied",
  "interview",
  "offer",
  "closed",
];

export function registerCareerReflection(): void {
  registerSearchProjector((state: StoreData) =>
    state.career.map((a) => ({
      id: a.id,
      owner: "career",
      title: `${a.role} · ${a.company}`,
      subtitle: CAREER_STAGES[a.stage],
      destination: "life" as const,
    })),
  );
  registerDueProjector((state: StoreData) =>
    state.career
      .filter((a): a is Application & { date: number } => a.date !== undefined && a.stage !== "closed")
      .map((a) => ({
        id: a.id,
        owner: "career",
        title: `${a.role} · ${a.company}`,
        dueAt: a.date,
        destination: "life" as const,
      })),
  );
}
