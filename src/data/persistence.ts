/**
 * Persistence (Constitution §22, Level 1 §14, Level 2 §14).
 *
 * Local-first: all data lives on the device, survives reload, needs no account
 * or network. This module is the ONLY code (besides the pre-paint appearance
 * script) permitted to touch device storage — the lint boundary enforces it, so
 * no module can create a rogue second copy of a datum (one source of truth,
 * §12/§16).
 *
 * The stored form is a VERSIONED envelope so stored data survives product updates
 * (§22): on read, an older version is migrated up before use. Export/restore uses
 * the same envelope so a person can carry their whole life as one portable file
 * and is never locked in (§22, Level 2 §14).
 */

import type { PersistEnvelope, StoreData } from "./types";
import { SCHEMA_VERSION, emptyStore } from "./types";

const STORAGE_KEY = "lifeospro.data.v1";
/** The pre-rename key. Read once for a transparent, data-preserving migration. */
const LEGACY_STORAGE_KEY = "genz.data.v1";

/** Migrate an envelope of any known older version up to the current shape (§22). */
function migrate(env: PersistEnvelope): StoreData {
  let data = env.data;
  const version = env.version;

  // Each step upgrades one version. Add cases here as the schema evolves; the
  // seam exists now so future migrations never touch consumers.
  // Example (future):
  //   if (version === 1) { data = { ...data, habits: [] }; version = 2; }

  if (version !== SCHEMA_VERSION) {
    // Unknown/newer version we can't understand: fall back to what validates,
    // preserving any recognizable collections. Conservative, never destructive
    // beyond what's unreadable.
    data = { ...emptyStore(), ...data };
  }
  return data;
}

/** Read the persisted store, migrating if needed. Returns empty on first run. */
export function loadStore(): StoreData {
  try {
    // Prefer the current key; if absent, adopt any data saved under the pre-rename
    // key and move it forward, so the product rename never orphans a person's
    // data. This is a one-time, transparent migration — not a behavior change.
    let raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacy !== null) {
        localStorage.setItem(STORAGE_KEY, legacy);
        localStorage.removeItem(LEGACY_STORAGE_KEY);
        raw = legacy;
      }
    }
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as PersistEnvelope;
    if (typeof parsed !== "object" || parsed === null || !("data" in parsed)) {
      return emptyStore();
    }
    return migrate(parsed);
  } catch {
    // Corrupt or unavailable storage must never crash the app (§25). Start clean;
    // the person's export (if any) remains their recovery path.
    return emptyStore();
  }
}

/** Persist the store immediately as a versioned envelope (§22). */
export function saveStore(data: StoreData): void {
  try {
    const env: PersistEnvelope = {
      version: SCHEMA_VERSION,
      data,
      savedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(env));
  } catch {
    // Storage full/unavailable: the in-memory store remains correct for the
    // session. A real app would surface a calm, specific message (§19); the
    // store layer stays silent and lets the UI decide.
  }
}

/** Serialize the whole life to a portable JSON string for export (§22). */
export function exportStore(data: StoreData): string {
  const env: PersistEnvelope = {
    version: SCHEMA_VERSION,
    data,
    savedAt: Date.now(),
  };
  return JSON.stringify(env, null, 2);
}

/** A suggested export filename, dated (voice/plain, §4.1). */
export function exportFilename(): string {
  const d = new Date();
  const stamp = `${String(d.getFullYear())}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
  return `life-os-pro-backup-${stamp}.json`;
}

/**
 * Parse an exported file back into a store, migrating and merging safely against
 * the current shape (§22). Returns null if the text isn't a recognizable backup,
 * so the UI can show a calm, specific error (§19) rather than throwing.
 */
export function importStore(text: string): StoreData | null {
  try {
    const parsed = JSON.parse(text) as PersistEnvelope;
    if (typeof parsed !== "object" || parsed === null || !("data" in parsed)) {
      return null;
    }
    const migrated = migrate(parsed);
    // Merge against the empty shape so any collection missing from the file is
    // present and valid after import (safe merge, §22).
    return { ...emptyStore(), ...migrated };
  } catch {
    return null;
  }
}

/** Clear all persisted data (the destructive reset, gated behind confirm, §17/§22). */
export function clearStore(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
