/**
 * React binding for the store (Constitution §16).
 *
 * Components read live data through these hooks; when the single source of truth
 * changes, every subscribed screen reflects it (§16). Built on React's
 * useSyncExternalStore so no state-management dependency is needed (§27).
 */

import { useSyncExternalStore } from "react";
import type { StoreData } from "./types";
import { getState, subscribe } from "./store";

/** Subscribe to the whole store. Prefer useCollection for a single collection. */
export function useStore(): StoreData {
  return useSyncExternalStore(subscribe, getState, getState);
}

/**
 * Subscribe to a derived selection of the store. The selector must return a
 * stable value for unchanged input (the store swaps top-level references on
 * write, so returning `state[key]` is stable between unrelated writes).
 */
export function useSelector<T>(selector: (state: StoreData) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(getState()),
    () => selector(getState()),
  );
}
