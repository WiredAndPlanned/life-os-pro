/**
 * Module registry (Constitution §16).
 *
 * Registers every module's reflection into the cross-cutting surfaces (Today,
 * Search) exactly once, at app start. This is the single place that knows the
 * full module set for reflection; Today and Search themselves stay closed to
 * change (§13, §16). Adding a module = adding one line here.
 */

import { registerSpendingReflection } from "@modules/spending";
import { registerSubscriptionsReflection } from "@modules/subscriptions";
import { registerBrainDumpReflection } from "@modules/brainDump";
import { registerStudyReflection } from "@modules/study/study.data";
import { registerGoalsReflection } from "@modules/goals/goals.data";
import { registerRecurringReflection } from "@modules/recurring/recurring.data";
import { registerWeeklyReflection } from "@modules/weekly/weekly.data";
import { registerMonthlyReflection } from "@modules/monthly/monthly.data";
import { registerHabitsReflection } from "@modules/habits/habits.data";
import { registerMoodReflection } from "@modules/mood/mood.data";
import { registerSleepReflection } from "@modules/sleep/sleep.data";
import { registerMovementReflection } from "@modules/movement/movement.data";
import { registerGroceryReflection } from "@modules/grocery/grocery.data";
import { registerMealsReflection } from "@modules/meals/meals.data";
import { registerContentReflection } from "@modules/content/content.data";
import { registerCareerReflection } from "@modules/career/career.data";
import {
  registerSavingsReflection,
  registerDebtReflection,
} from "@modules/savings/savingsDebt.data";

let registered = false;

export function registerModules(): void {
  if (registered) return; // idempotent — safe under StrictMode double-invoke
  registered = true;

  // Plan
  registerBrainDumpReflection();
  registerWeeklyReflection();
  registerMonthlyReflection();
  registerRecurringReflection();
  registerGoalsReflection();
  // Health & self
  registerHabitsReflection();
  registerMoodReflection();
  registerSleepReflection();
  registerMovementReflection();
  // (hydration: no projectors — ambient daily nudge, surfaced on Today's live strip)
  // Money
  registerSpendingReflection();
  registerSubscriptionsReflection();
  registerSavingsReflection();
  registerDebtReflection();
  // Everyday
  registerMealsReflection();
  registerGroceryReflection();
  registerContentReflection();
  registerStudyReflection();
  registerCareerReflection();
}
