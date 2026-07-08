/**
 * Content — module data (§12). Keep a side hustle's ideas in one place, moving
 * through a pipeline. Search only.
 */

import { collection } from "@data/crud";
import { registerSearchProjector } from "@data/reflection";
import type { StoreData, ContentStatus, ContentPlatform } from "@data/types";

export const content = collection("content", "cnt");

export const CONTENT_STATUS: Record<ContentStatus, string> = {
  idea: "Idea",
  drafting: "Drafting",
  scheduled: "Scheduled",
  posted: "Posted",
};
export const CONTENT_STATUS_ORDER: ContentStatus[] = ["idea", "drafting", "scheduled", "posted"];

export const CONTENT_PLATFORM: Record<ContentPlatform, string> = {
  video: "Video",
  photo: "Photo",
  writing: "Writing",
  audio: "Audio",
};
export const CONTENT_PLATFORM_ORDER: ContentPlatform[] = ["video", "photo", "writing", "audio"];

export function registerContentReflection(): void {
  registerSearchProjector((state: StoreData) =>
    state.content.map((c) => ({
      id: c.id,
      owner: "content",
      title: c.idea,
      subtitle: CONTENT_STATUS[c.status],
      destination: "life" as const,
    })),
  );
}
