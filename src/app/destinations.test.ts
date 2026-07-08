import { describe, it, expect } from "vitest";
import { DESTINATIONS, DEFAULT_DESTINATION } from "./destinations";

/**
 * Phase 0 architecture invariants. These are constitutional, not cosmetic:
 * the five-destination count is a locked decision (§11), so a test guards it.
 * If someone adds a sixth destination without going through the Feature
 * Decision Framework (§27), this test fails on purpose.
 */
describe("primary destinations (§11)", () => {
  it("has exactly five primary destinations", () => {
    expect(DESTINATIONS).toHaveLength(5);
  });

  it("is exactly Today, Plan, Life, Search, Settings, in order", () => {
    expect(DESTINATIONS.map((d) => d.id)).toEqual([
      "today",
      "plan",
      "life",
      "search",
      "settings",
    ]);
  });

  it("has Today as the single default destination (§13)", () => {
    const defaults = DESTINATIONS.filter((d) => d.isDefault);
    expect(defaults).toHaveLength(1);
    expect(DEFAULT_DESTINATION.id).toBe("today");
  });

  it("gives every destination a unique path and a sentence-case label", () => {
    const paths = new Set(DESTINATIONS.map((d) => d.path));
    expect(paths.size).toBe(DESTINATIONS.length);
    for (const d of DESTINATIONS) {
      expect(d.label.length).toBeGreaterThan(0);
      // sentence case: first letter upper, not SCREAMING
      expect(d.label).not.toEqual(d.label.toUpperCase());
    }
  });
});
