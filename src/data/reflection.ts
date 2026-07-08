/**
 * Reflection & search derivation (Constitution §13, §14, §16).
 *
 * The ONLY places breadth is unified are Today and Search (§16). This module is
 * how that unification happens WITHOUT a second copy of any datum: each owner
 * module registers projectors that derive, on demand, from the single store:
 *   - a "due" projector  → dated items Today gathers (§13)
 *   - a "search" projector → records universal search indexes (§14)
 *
 * Today and Search call the aggregators here; they own nothing (§13, §16). When
 * an owner's data changes in the store, these derivations recompute from the new
 * snapshot — reflection is pull-from-one-store, never push-a-copy (§16).
 *
 * Registration (not hardcoding) keeps the mechanism open: a new module in Phase
 * 4-5 registers its projectors and immediately appears on Today and in Search,
 * with no change to Today/Search themselves.
 */

import type { StoreData } from "./types";
import type { DestinationId } from "@app/destinations";

/** An item with a date that Today gathers under "due & upcoming" (§13). */
export interface DueItem {
  readonly id: string;
  /** Which owning module this came from (for tap-through and grouping). */
  readonly owner: string;
  /** Plain, voice-appropriate label (§4.1). */
  readonly title: string;
  /** The due date (ms). */
  readonly dueAt: number;
  /** Destination to open when tapped — always the OWNING module (§12, §14). */
  readonly destination: DestinationId;
}

/** A record universal search can match and open at its owner (§14). */
export interface SearchRecord {
  readonly id: string;
  readonly owner: string;
  /** The primary text matched against. */
  readonly title: string;
  /** Optional secondary text also matched (e.g. category, note). */
  readonly subtitle?: string;
  readonly destination: DestinationId;
}

type DueProjector = (state: StoreData) => DueItem[];
type SearchProjector = (state: StoreData) => SearchRecord[];

const dueProjectors = new Set<DueProjector>();
const searchProjectors = new Set<SearchProjector>();

/** An owner registers how its entities become Today "due" items (§13). */
export function registerDueProjector(p: DueProjector): void {
  dueProjectors.add(p);
}

/** An owner registers how its entities become searchable records (§14). */
export function registerSearchProjector(p: SearchProjector): void {
  searchProjectors.add(p);
}

/** For tests/hot-reload: clear registrations. */
export function _resetProjectors(): void {
  dueProjectors.clear();
  searchProjectors.clear();
}

/**
 * Everything due today or soon, gathered from every owner and sorted by date
 * (§13). `withinMs` bounds "soon" (default 7 days). Pure derivation from the
 * passed snapshot — no copy is stored.
 */
export function gatherDue(state: StoreData, withinMs = 7 * 24 * 60 * 60 * 1000): DueItem[] {
  const now = Date.now();
  const horizon = now + withinMs;
  const items: DueItem[] = [];
  for (const project of dueProjectors) {
    for (const item of project(state)) {
      if (item.dueAt <= horizon) items.push(item);
    }
  }
  return items.sort((a, b) => a.dueAt - b.dueAt);
}

/**
 * Universal search across every owned type (§14). Case-insensitive match on
 * title/subtitle; each result opens its owning module (§12). Pure derivation.
 */
export function searchAll(state: StoreData, query: string): SearchRecord[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const results: SearchRecord[] = [];
  for (const project of searchProjectors) {
    for (const record of project(state)) {
      const hay = `${record.title} ${record.subtitle ?? ""}`.toLowerCase();
      if (hay.includes(q)) results.push(record);
    }
  }
  return results;
}
