/**
 * The store (Constitution §12, §16, §22).
 *
 * The single source of truth for all app data. A datum is stored once; every
 * screen reads from here and reflects changes live (§16). Any mutation persists
 * immediately (§22) and notifies subscribers so React re-renders.
 *
 * Cross-cutting surfaces (Today, Search) READ derived views from this store and
 * never hold a second copy (§13, §16). Owner modules mutate only their own
 * collection through the typed CRUD helpers in crud.ts.
 *
 * Reactivity uses the store/subscribe pattern so it integrates with React via
 * useSyncExternalStore (see useStore.ts) without a state-management dependency —
 * a deliberate "default no" on adding a library until one earns its place (§27).
 */

import type { StoreData } from "./types";
import { loadStore, saveStore } from "./persistence";

type Listener = () => void;

let state: StoreData = loadStore();
const listeners = new Set<Listener>();

/** Current snapshot. Stable reference until the next mutation (for useSyncExternalStore). */
export function getState(): StoreData {
  return state;
}

/** Subscribe to any change. Returns an unsubscribe function. */
export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit(): void {
  for (const l of listeners) l();
}

/**
 * Replace the whole store (used by import/reset). Persists and notifies.
 * Everyday mutations go through crud.ts, not this.
 */
export function replaceState(next: StoreData): void {
  state = next;
  saveStore(state);
  emit();
}

/**
 * Apply an immutable update to the store. Produces a new StoreData (new top-level
 * reference so React sees the change), persists it, and notifies. This is the one
 * write path for collection mutations; crud.ts builds on it.
 */
export function update(mutator: (prev: StoreData) => StoreData): void {
  const next = mutator(state);
  if (next === state) return; // no-op guard
  state = next;
  saveStore(state);
  emit();
}
