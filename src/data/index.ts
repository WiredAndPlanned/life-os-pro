/**
 * Data layer (Phase 3) — public surface.
 *
 * The single source of truth (§12, §16), the universal CRUD floor (§22), local-
 * first persistence with export/restore (§22), and the reflection/search
 * derivation that feeds Today and Search without a second copy (§13, §14, §16).
 */

export type {
  Entity,
  Collection,
  StoreData,
  Thought,
  WeekEntry,
  MonthNote,
  Recurring,
  Goal,
  Habit,
  MoodLog,
  SleepLog,
  MovementLog,
  HydrationDay,
  Expense,
  Subscription,
  SavingsGoal,
  Debt,
  MealPlan,
  GroceryItem,
  ContentIdea,
  Assignment,
  Application,
} from "./types";
export { SCHEMA_VERSION, emptyStore } from "./types";

export { getState, subscribe, update, replaceState } from "./store";
export { useStore, useSelector } from "./useStore";
export { collection } from "./crud";
export type { CrudApi } from "./crud";

export {
  loadStore,
  saveStore,
  exportStore,
  importStore,
  clearStore,
  exportFilename,
} from "./persistence";

export {
  registerDueProjector,
  registerSearchProjector,
  gatherDue,
  searchAll,
  _resetProjectors,
} from "./reflection";
export type { DueItem, SearchRecord } from "./reflection";

export {
  getAppearance,
  setAppearance,
  resolveTheme,
  applyTheme,
  watchSystemTheme,
  APPEARANCE_STORAGE_KEY,
} from "./appearance";
export type { Appearance, ResolvedTheme } from "./appearance";

export { getName, setName } from "./profile";
