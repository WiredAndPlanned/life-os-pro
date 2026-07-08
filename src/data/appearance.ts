/**
 * Appearance persistence and resolution (Constitution §18, Level 2 §7).
 *
 * This lives in the @data layer because it is the ONLY layer permitted to touch
 * device storage directly (see eslint.config.js and the Phase 0 ADR). The
 * pre-paint script in index.html reads the same key BEFORE this module loads,
 * to avoid a flash of the wrong theme; the key name below is therefore a
 * documented contract shared between that script and this module. If it changes
 * here, it must change there too.
 *
 * Appearance is System / Light / Dark and NOTHING ELSE (§18). Only luminance
 * changes between themes; identity, spacing, and components are identical.
 */

export type Appearance = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

/** Shared contract with the pre-paint script in index.html. */
export const APPEARANCE_STORAGE_KEY = "lifeospro.appearance";
/** Pre-rename key, read once so an existing preference carries over. */
const LEGACY_APPEARANCE_KEY = "genz.appearance";

const DARK_QUERY = "(prefers-color-scheme: dark)";

function isAppearance(value: string | null): value is Appearance {
  return value === "light" || value === "dark" || value === "system";
}

/** Read the stored preference, defaulting to "system" (§18). */
export function getAppearance(): Appearance {
  try {
    let stored = localStorage.getItem(APPEARANCE_STORAGE_KEY);
    if (stored === null) {
      // Carry a preference saved under the pre-rename key forward, once.
      const legacy = localStorage.getItem(LEGACY_APPEARANCE_KEY);
      if (legacy !== null) {
        localStorage.setItem(APPEARANCE_STORAGE_KEY, legacy);
        localStorage.removeItem(LEGACY_APPEARANCE_KEY);
        stored = legacy;
      }
    }
    return isAppearance(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

/** Resolve a preference to an actual theme, consulting the OS for "system". */
export function resolveTheme(pref: Appearance): ResolvedTheme {
  if (pref === "light" || pref === "dark") return pref;
  const systemDark =
    typeof window !== "undefined" && window.matchMedia(DARK_QUERY).matches;
  return systemDark ? "dark" : "light";
}

/** Apply a resolved theme to the document (the single place that sets it). */
export function applyTheme(theme: ResolvedTheme): void {
  document.documentElement.setAttribute("data-theme", theme);
}

/** Persist a preference and apply it immediately. Returns the resolved theme. */
export function setAppearance(pref: Appearance): ResolvedTheme {
  try {
    localStorage.setItem(APPEARANCE_STORAGE_KEY, pref);
  } catch {
    // Persistence unavailable — still apply for this session (§18 comfort pref).
  }
  const resolved = resolveTheme(pref);
  applyTheme(resolved);
  return resolved;
}

/**
 * Subscribe to OS theme changes so that, while the preference is "system",
 * the app follows the OS live. Returns an unsubscribe function.
 */
export function watchSystemTheme(onChange: (theme: ResolvedTheme) => void): () => void {
  if (typeof window === "undefined") {
    // No window (e.g. SSR / non-browser): nothing to subscribe to, so the
    // unsubscribe is a no-op.
    return () => undefined;
  }
  const mql = window.matchMedia(DARK_QUERY);
  const handler = (e: MediaQueryListEvent) => {
    onChange(e.matches ? "dark" : "light");
  };
  mql.addEventListener("change", handler);
  return () => {
    mql.removeEventListener("change", handler);
  };
}
