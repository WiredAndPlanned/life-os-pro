import { describe, it, expect, beforeEach } from "vitest";
import { collection } from "./crud";
import { getState, replaceState } from "./store";
import { emptyStore } from "./types";
import type { Goal, StoreData } from "./types";
import {
  registerDueProjector,
  registerSearchProjector,
  gatherDue,
  searchAll,
  _resetProjectors,
} from "./reflection";
import { exportStore, importStore } from "./persistence";

/**
 * Phase 3 EXIT GATE (locked build plan):
 * "A throwaway entity can be created/edited/deleted, persists across reload,
 *  appears in Search, reflects onto Today, and survives export -> wipe -> import."
 *
 * Exercised here against the `goals` collection (a real entity with a `due` date,
 * so it proves Today reflection too).
 */

const goals = collection("goals", "g");

beforeEach(() => {
  replaceState(emptyStore());
  _resetProjectors();
});

describe("Universal CRUD floor (§22)", () => {
  it("creates with a stable id and createdAt, and lists it", () => {
    const item = goals.create({ title: "Save $500", area: "money", progress: 0 });
    expect(item.id).toMatch(/^g_/);
    expect(item.createdAt).toBeGreaterThan(0);
    expect(goals.list()).toHaveLength(1);
    expect(goals.get(item.id)?.title).toBe("Save $500");
  });

  it("edits by id without changing id or createdAt", () => {
    const item = goals.create({ title: "Draft", area: "plan", progress: 0 });
    const edited = goals.edit(item.id, { title: "Final draft", progress: 0.5 });
    expect(edited?.title).toBe("Final draft");
    expect(edited?.progress).toBe(0.5);
    expect(edited?.id).toBe(item.id);
    expect(edited?.createdAt).toBe(item.createdAt);
  });

  it("deletes by id (resolves by id, never position, §22)", () => {
    const a = goals.create({ title: "A", area: "life", progress: 0 });
    const b = goals.create({ title: "B", area: "life", progress: 0 });
    expect(goals.remove(a.id)).toBe(true);
    expect(goals.list().map((x) => x.id)).toEqual([b.id]);
    expect(goals.remove("nope")).toBe(false);
  });
});

describe("Persistence & reload (§22)", () => {
  it("survives export -> wipe -> import (the exit-gate round-trip)", () => {
    goals.create({ title: "One", area: "plan", progress: 0 });
    goals.create({ title: "Two", area: "plan", progress: 0 });
    const backup = exportStore(getState());

    replaceState(emptyStore());
    expect(goals.list()).toHaveLength(0);

    const restored = importStore(backup);
    expect(restored).not.toBeNull();
    replaceState(restored as StoreData);
    expect(goals.list().map((x) => x.title)).toEqual(["One", "Two"]);
  });

  it("returns null for an unrecognizable import, never throws (§19)", () => {
    expect(importStore("not json at all")).toBeNull();
    expect(importStore("{}")).toBeNull();
  });
});

describe("Reflection onto Today (§13, §16)", () => {
  it("gathers a dated entity onto Today via a projector, no second copy", () => {
    registerDueProjector((state: StoreData) =>
      state.goals
        .filter((g): g is Goal & { due: number } => g.due !== undefined)
        .map((g) => ({
          id: g.id,
          owner: "goals",
          title: g.title,
          dueAt: g.due,
          destination: "plan" as const,
        })),
    );

    const soon = Date.now() + 2 * 24 * 60 * 60 * 1000;
    const far = Date.now() + 60 * 24 * 60 * 60 * 1000;
    goals.create({ title: "Due soon", area: "plan", progress: 0, due: soon });
    goals.create({ title: "Due far", area: "plan", progress: 0, due: far });
    goals.create({ title: "No date", area: "plan", progress: 0 });

    const due = gatherDue(getState());
    expect(due.map((d) => d.title)).toEqual(["Due soon"]);

    const target = goals.list().find((x) => x.title === "Due soon");
    expect(target).toBeDefined();
    if (!target) throw new Error("expected the 'Due soon' goal to exist");
    goals.edit(target.id, { title: "Due soon (edited)" });
    expect(gatherDue(getState())[0]?.title).toBe("Due soon (edited)");
  });
});

describe("Universal Search (§14)", () => {
  it("finds owned entities and points at their owning module", () => {
    registerSearchProjector((state: StoreData) =>
      state.goals.map((g) => ({
        id: g.id,
        owner: "goals",
        title: g.title,
        destination: "plan" as const,
      })),
    );
    goals.create({ title: "Groceries budget", area: "money", progress: 0 });
    goals.create({ title: "Gym routine", area: "health", progress: 0 });

    expect(searchAll(getState(), "gro").map((r) => r.title)).toEqual(["Groceries budget"]);
    expect(searchAll(getState(), "")).toEqual([]);
    expect(searchAll(getState(), "routine")[0]?.destination).toBe("plan");
  });
});
