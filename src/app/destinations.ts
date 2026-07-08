/**
 * The five primary destinations of Life OS Pro (Constitution §11).
 *
 * This is the SINGLE SOURCE OF TRUTH for top-level navigation. Both the router
 * (routes.tsx) and the navigation presentations (bottom bar / rail / sidebar,
 * Phase 2) read from this list — they never hardcode their own copy. Adding,
 * removing, or reordering a primary destination happens here and nowhere else.
 *
 * There are exactly five, and per §11 that count is a constitutional decision,
 * not an incidental one. A sixth destination is not a code change — it is a
 * Feature-Decision-Framework question (§27), and the default answer is no.
 *
 * Icons are named here only as string keys; the icon SYSTEM that resolves them
 * is Phase 2 (§8). Phase 0 does not draw icons.
 */

export type DestinationId = "today" | "plan" | "life" | "search" | "settings";

export interface Destination {
  readonly id: DestinationId;
  /** URL path segment. "today" is the index route (default destination, §11, §13). */
  readonly path: string;
  /** Human label, in the product voice (§4.1): plain, sentence case. */
  readonly label: string;
  /** Icon key resolved by the Phase 2 icon system (§8). Not a glyph. */
  readonly icon: DestinationId;
  /** Whether this is the default, most-returned-to destination (§11, §13). */
  readonly isDefault?: boolean;
}

// Typed as a non-empty list: there is always at least one destination (in fact
// exactly five, §11), so the first element is guaranteed to exist. Expressing
// that here lets the default fall back to the first with no unsafe assertion.
export const DESTINATIONS: readonly [Destination, ...Destination[]] = [
  { id: "today", path: "today", label: "Today", icon: "today", isDefault: true },
  { id: "plan", path: "plan", label: "Plan", icon: "plan" },
  { id: "life", path: "life", label: "Life", icon: "life" },
  { id: "search", path: "search", label: "Search", icon: "search" },
  { id: "settings", path: "settings", label: "Settings", icon: "settings" },
];

export const DEFAULT_DESTINATION: Destination =
  DESTINATIONS.find((d) => d.isDefault) ?? DESTINATIONS[0];
