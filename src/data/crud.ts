/**
 * Universal CRUD contract (Constitution §22, Level 2 §13).
 *
 * The guaranteed floor for EVERY entity: create, read, edit, delete, persisted
 * immediately. This module provides that floor once, generically, so each owner
 * module gets a complete honest lifecycle without reinventing it — and so no
 * entity is ever shown that can't actually be managed (§22).
 *
 * Richer verbs (archive, duplicate) are NOT here: they are per-entity and earned,
 * added only where they genuinely reduce effort (§22, Level 2 §13). The 22-verb
 * universal lifecycle is rejected (Level 1 Appendix B).
 *
 * `collection()` returns a small typed API bound to one collection key. A module
 * calls e.g. `collection("brainDump")` and gets list/get/create/edit/remove, each
 * of which reads/writes the single source of truth and persists immediately.
 */

import type { Collection, Entity, StoreData } from "./types";
import { createId } from "@lib/id";
import { getState, update } from "./store";

/** Keys of StoreData whose value is a Collection — the owner collections (§12). */
type CollectionKey = {
  [K in keyof StoreData]: StoreData[K] extends Collection<Entity> ? K : never;
}[keyof StoreData];

/** The element type stored at a given collection key. */
type ItemOf<K extends CollectionKey> =
  StoreData[K] extends Collection<infer T> ? T : never;

/** Fields a caller supplies on create — everything except the system-owned ones. */
type NewInput<T extends Entity> = Omit<T, "id" | "createdAt">;

/** Fields a caller may change on edit — anything except the immutable id. */
type EditInput<T extends Entity> = Partial<Omit<T, "id" | "createdAt">>;

export interface CrudApi<T extends Entity> {
  /** All items, in creation order (§22 — ids are time-prefixed, order recoverable). */
  list(): ReadonlyArray<T>;
  /** One item by stable id, or undefined (§22 — resolve by id, never position). */
  get(id: string): T | undefined;
  /** Create: assigns a stable id + createdAt, persists immediately. Returns it. */
  create(input: NewInput<T>): T;
  /** Edit by id: shallow-merges changes, persists immediately. Returns the new item. */
  edit(id: string, changes: EditInput<T>): T | undefined;
  /** Delete by id, persists immediately. Returns whether something was removed. */
  remove(id: string): boolean;
}

export function collection<K extends CollectionKey>(
  key: K,
  idPrefix?: string,
): CrudApi<ItemOf<K>> {
  type T = ItemOf<K>;

  // Read the collection at `key` as its element array. Indexing StoreData with a
  // generic key widens to the union of all collections, which TypeScript can't
  // narrow structurally; this single helper does the (necessary) conversion once
  // so the CRUD methods below stay assertion-free.
  const at = (s: StoreData): T[] => (s as unknown as Record<K, T[]>)[key];

  function readAll(state: StoreData): ReadonlyArray<T> {
    return at(state);
  }

  return {
    list() {
      return readAll(getState());
    },

    get(id) {
      return readAll(getState()).find((item) => item.id === id);
    },

    create(input) {
      const item = {
        ...(input as object),
        id: createId(idPrefix ?? key),
        createdAt: Date.now(),
      } as T;
      update((prev) => {
        const current = at(prev);
        const next = [...current, item];
        return { ...prev, [key]: next };
      });
      return item;
    },

    edit(id, changes) {
      let updated: T | undefined;
      update((prev) => {
        const current = at(prev);
        const next = current.map((item) => {
          if (item.id !== id) return item;
          // id and createdAt are immutable; changes can never override them.
          updated = { ...item, ...changes, id: item.id, createdAt: item.createdAt };
          return updated;
        });
        return { ...prev, [key]: next };
      });
      return updated;
    },

    remove(id) {
      let removed = false;
      update((prev) => {
        const current = at(prev);
        const next = current.filter((item) => {
          if (item.id === id) {
            removed = true;
            return false;
          }
          return true;
        });
        if (!removed) return prev; // no-op guard, avoids a needless write
        return { ...prev, [key]: next };
      });
      return removed;
    },
  };
}
