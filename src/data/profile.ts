/**
 * Profile (Constitution §18, §22).
 *
 * The person's name — a tiny piece of personal state, persisted locally like
 * everything else. It lives in the data layer because the data layer is the only
 * place permitted to touch device storage (the lint boundary), so there is never
 * a rogue second copy of a datum (§16/§22). Kept separate from the main data
 * envelope because it is preference-like, not life-content, and shouldn't ride
 * inside a life-data export/import.
 */

const NAME_KEY = "lifeospro.name";
/** Pre-rename key, read once so an existing name carries over. */
const LEGACY_NAME_KEY = "genz.name";

export function getName(): string {
  try {
    const current = localStorage.getItem(NAME_KEY);
    if (current !== null) return current;
    // Carry a name saved under the pre-rename key forward, once.
    const legacy = localStorage.getItem(LEGACY_NAME_KEY);
    if (legacy !== null) {
      localStorage.setItem(NAME_KEY, legacy);
      localStorage.removeItem(LEGACY_NAME_KEY);
      return legacy;
    }
    return "";
  } catch {
    return "";
  }
}

export function setName(name: string): void {
  try {
    const trimmed = name.trim();
    if (trimmed) localStorage.setItem(NAME_KEY, trimmed);
    else localStorage.removeItem(NAME_KEY);
  } catch {
    // Storage unavailable — the field still works for the session.
  }
}
