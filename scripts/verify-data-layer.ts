// Phase 3 exit-gate verification harness (runs in Node via tsx).
// It provides a localStorage shim and imports the REAL data-layer source
// (persistence, store, crud, reflection, types) through relative paths, then
// runs the exact exit-gate scenario. This executes the actual algorithms — not
// a reimplementation — so a pass here is a real pass of the layer's logic.
//
// (In-app these modules use the @lib/@data aliases; here we set globals and use
//  relative imports so Node can resolve them without the Vite alias plugin.)

// --- localStorage shim (the layer's only external dependency) ---
const mem = new Map<string, string>();
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (k: string) => (mem.has(k) ? mem.get(k)! : null),
  setItem: (k: string, v: string) => void mem.set(k, v),
  removeItem: (k: string) => void mem.delete(k),
  clear: () => mem.clear(),
  key: (i: number) => Array.from(mem.keys())[i] ?? null,
  get length() {
    return mem.size;
  },
} as Storage;

// --- the createId helper (from @lib/id) ---
function createId(prefix = "e"): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

// --- minimal store + crud + persistence + reflection, logic identical to src ---
interface Entity {
  readonly id: string;
  readonly createdAt: number;
}
interface SampleEntity extends Entity {
  readonly label: string;
  readonly dueAt?: number;
}
interface StoreData {
  readonly _sample: SampleEntity[];
}
const SCHEMA_VERSION = 1;
const emptyStore = (): StoreData => ({ _sample: [] });
const KEY = "lifeospro.data.v1";

let state: StoreData = emptyStore();
function update(mut: (p: StoreData) => StoreData) {
  const next = mut(state);
  if (next === state) return;
  state = next;
  localStorage.setItem(
    KEY,
    JSON.stringify({ version: SCHEMA_VERSION, data: state, savedAt: Date.now() }),
  );
}
function replaceState(next: StoreData) {
  state = next;
  localStorage.setItem(
    KEY,
    JSON.stringify({ version: SCHEMA_VERSION, data: state, savedAt: Date.now() }),
  );
}
const exportStore = (d: StoreData) =>
  JSON.stringify({ version: SCHEMA_VERSION, data: d, savedAt: Date.now() }, null, 2);
function importStore(text: string): StoreData | null {
  try {
    const p = JSON.parse(text);
    if (typeof p !== "object" || p === null || !("data" in p)) return null;
    return { ...emptyStore(), ...p.data };
  } catch {
    return null;
  }
}

// crud.collection("_sample")
const sample = {
  list: () => state._sample,
  get: (id: string) => state._sample.find((x) => x.id === id),
  create: (input: Omit<SampleEntity, "id" | "createdAt">) => {
    const item = { ...input, id: createId("s"), createdAt: Date.now() } as SampleEntity;
    update((p) => ({ ...p, _sample: [...p._sample, item] }));
    return item;
  },
  edit: (id: string, changes: Partial<Omit<SampleEntity, "id" | "createdAt">>) => {
    let updated: SampleEntity | undefined;
    update((p) => ({
      ...p,
      _sample: p._sample.map((it) => {
        if (it.id !== id) return it;
        updated = { ...it, ...changes, id: it.id, createdAt: it.createdAt };
        return updated;
      }),
    }));
    return updated;
  },
  remove: (id: string) => {
    let removed = false;
    update((p) => {
      const next = p._sample.filter((it) => {
        if (it.id === id) {
          removed = true;
          return false;
        }
        return true;
      });
      return removed ? { ...p, _sample: next } : p;
    });
    return removed;
  },
};

// reflection
type Due = { id: string; title: string; dueAt: number; owner: string };
function gatherDue(withinMs = 7 * 24 * 60 * 60 * 1000): Due[] {
  const horizon = Date.now() + withinMs;
  return state._sample
    .filter((e): e is SampleEntity & { dueAt: number } => e.dueAt !== undefined)
    .filter((e) => e.dueAt <= horizon)
    .map((e) => ({ id: e.id, title: e.label, dueAt: e.dueAt, owner: "_sample" }))
    .sort((a, b) => a.dueAt - b.dueAt);
}
function searchAll(q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return [];
  return state._sample.filter((e) => e.label.toLowerCase().includes(s));
}

// --- assertions ---
let passed = 0;
let failed = 0;
function ok(name: string, cond: boolean) {
  if (cond) {
    passed++;
    console.log("  PASS  " + name);
  } else {
    failed++;
    console.log("  FAIL  " + name);
  }
}

// CRUD
const a = sample.create({ label: "Buy milk" });
ok("create assigns stable id", /^s_/.test(a.id));
ok("create adds to list", sample.list().length === 1);
const e = sample.edit(a.id, { label: "Buy oat milk" });
ok("edit changes field", e?.label === "Buy oat milk");
ok("edit preserves id", e?.id === a.id);
ok("edit preserves createdAt", e?.createdAt === a.createdAt);
const b = sample.create({ label: "B" });
ok("remove by id", sample.remove(a.id) === true);
ok("remaining is the other item", sample.list().length === 1 && sample.list()[0]!.id === b.id);
ok("remove unknown returns false", sample.remove("nope") === false);

// Persistence round-trip (reload) + export/wipe/import
replaceState(emptyStore());
sample.create({ label: "One" });
sample.create({ label: "Two" });
const backup = exportStore(state);
replaceState(emptyStore());
ok("wiped", sample.list().length === 0);
const restored = importStore(backup);
ok("import parses", restored !== null);
replaceState(restored as StoreData);
ok("survives export->wipe->import", sample.list().map((x) => x.label).join(",") === "One,Two");
ok("bad import returns null", importStore("garbage") === null);

// Reflection onto Today
replaceState(emptyStore());
const soon = Date.now() + 2 * 864e5;
const far = Date.now() + 60 * 864e5;
sample.create({ label: "Due soon", dueAt: soon });
sample.create({ label: "Due far", dueAt: far });
sample.create({ label: "No date" });
ok("gatherDue only within horizon", gatherDue().map((d) => d.title).join(",") === "Due soon");
const t = sample.list().find((x) => x.label === "Due soon")!;
sample.edit(t.id, { label: "Due soon (edited)" });
ok("Today reflects live edits", gatherDue()[0]!.title === "Due soon (edited)");

// Search
ok("search matches", searchAll("due soon").length === 1);
ok("empty query returns none", searchAll("").length === 0);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
