/**
 * Stable identifiers (Constitution §22).
 *
 * Every list entity carries a stable unique `id`. Reflection, editing, and search
 * resolve through ids, never array positions — a correction of the legacy build's
 * index-based deletion (§22). Ids are time-prefixed so a natural creation order is
 * recoverable without a separate field, and suffixed with randomness for
 * collision resistance within the same millisecond.
 *
 * This is framework-free (lives in @lib) so any layer can use it.
 */

export function createId(prefix = "e"): string {
  const time = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${time}${rand}`;
}
