/**
 * Routing (Constitution §11, §20).
 *
 * Routes are generated around the single destination registry. Plan and Life are
 * hubs (§11) grouping their families; every module is a sub-route to its real
 * screen. Real URL routing gives working browser back/forward (corrects §20).
 * "today" is the index route — the default destination (§11, §13).
 *
 * Today, Search, and Settings are still placeholders here; they are the
 * cross-cutting surfaces assembled in Phase 6 from the modules now built.
 */

import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "./AppShell";
import { PlaceholderScreen } from "./PlaceholderScreen";
import { ModuleHub } from "./ModuleHub";
import type { HubEntry } from "./ModuleHub";
import { DEFAULT_DESTINATION } from "./destinations";
import { TodayScreen } from "./TodayScreen";
import { SearchScreen } from "./SearchScreen";
import { SettingsScreen } from "./SettingsScreen";

import { BrainDumpScreen } from "@modules/brainDump";
import { WeeklyScreen } from "@modules/weekly";
import { MonthlyScreen } from "@modules/monthly";
import { RecurringScreen } from "@modules/recurring";
import { GoalsScreen } from "@modules/goals";
import { HabitsScreen } from "@modules/habits";
import { MoodScreen } from "@modules/mood";
import { SleepScreen } from "@modules/sleep";
import { MovementScreen } from "@modules/movement";
import { HydrationScreen } from "@modules/hydration";
import { SpendingScreen } from "@modules/spending";
import { SubscriptionsScreen } from "@modules/subscriptions";
import { SavingsScreen } from "@modules/savings";
import { DebtScreen } from "@modules/debt";
import { MealsScreen } from "@modules/meals";
import { GroceryScreen } from "@modules/grocery";
import { ContentScreen } from "@modules/content";
import { StudyScreen } from "@modules/study";
import { CareerScreen } from "@modules/career";

const planGroups: { heading: string; entries: HubEntry[] }[] = [
  {
    heading: "Time & intentions",
    entries: [
      { label: "Brain dump", meta: "Empty your head", category: "plan", icon: "brainDump", path: "/plan/brain-dump" },
      { label: "Weekly", meta: "Shape the week", category: "plan", icon: "weekly", path: "/plan/weekly" },
      { label: "Monthly", meta: "The month at a glance", category: "plan", icon: "monthly", path: "/plan/monthly" },
      { label: "Recurring", meta: "Regular intentions", category: "plan", icon: "recurring", path: "/plan/recurring" },
      { label: "Goals", meta: "A few that matter", category: "plan", icon: "goals", path: "/plan/goals" },
      { label: "Study", meta: "Assignments & deadlines", category: "plan", icon: "study", path: "/plan/study" },
    ],
  },
];

const lifeGroups: { heading: string; entries: HubEntry[] }[] = [
  {
    heading: "Money",
    entries: [
      { label: "Spending", meta: "Where the money goes", category: "money", icon: "spending", path: "/life/spending" },
      { label: "Subscriptions", meta: "What's leaving, and when", category: "money", icon: "subscriptions", path: "/life/subscriptions" },
      { label: "Savings", meta: "Toward something you chose", category: "money", icon: "savings", path: "/life/savings" },
      { label: "Debt", meta: "Watch it shrink", category: "money", icon: "debt", path: "/life/debt" },
    ],
  },
  {
    heading: "Health & self",
    entries: [
      { label: "Habits", meta: "Gentle consistency", category: "health", icon: "habits", path: "/life/habits" },
      { label: "Mood", meta: "How you actually feel", category: "health", icon: "mood", path: "/life/mood" },
      { label: "Sleep", meta: "Rest as part of life", category: "health", icon: "sleep", path: "/life/sleep" },
      { label: "Movement", meta: "Move how you like", category: "health", icon: "movement", path: "/life/movement" },
      { label: "Hydration", meta: "A quiet water nudge", category: "health", icon: "hydration", path: "/life/hydration" },
    ],
  },
  {
    heading: "Everyday",
    entries: [
      { label: "Meals", meta: "The week's food", category: "life", icon: "meals", path: "/life/meals" },
      { label: "Grocery", meta: "One calm list", category: "life", icon: "grocery", path: "/life/grocery" },
      { label: "Content", meta: "Side-hustle ideas", category: "life", icon: "content", path: "/life/content" },
      { label: "Career", meta: "The job search", category: "life", icon: "career", path: "/life/career" },
    ],
  },
];

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to={`/${DEFAULT_DESTINATION.path}`} replace /> },

      { path: "today", element: <TodayScreen /> },

      // Plan hub + modules
      { path: "plan", element: <ModuleHub title="Plan" subtitle="Time and intentions, in one calm place." groups={planGroups} /> },
      { path: "plan/brain-dump", element: <BrainDumpScreen /> },
      { path: "plan/weekly", element: <WeeklyScreen /> },
      { path: "plan/monthly", element: <MonthlyScreen /> },
      { path: "plan/recurring", element: <RecurringScreen /> },
      { path: "plan/goals", element: <GoalsScreen /> },
      { path: "plan/study", element: <StudyScreen /> },

      // Life hub + modules
      { path: "life", element: <ModuleHub title="Life" subtitle="The areas of living, held together." groups={lifeGroups} /> },
      { path: "life/spending", element: <SpendingScreen /> },
      { path: "life/subscriptions", element: <SubscriptionsScreen /> },
      { path: "life/savings", element: <SavingsScreen /> },
      { path: "life/debt", element: <DebtScreen /> },
      { path: "life/habits", element: <HabitsScreen /> },
      { path: "life/mood", element: <MoodScreen /> },
      { path: "life/sleep", element: <SleepScreen /> },
      { path: "life/movement", element: <MovementScreen /> },
      { path: "life/hydration", element: <HydrationScreen /> },
      { path: "life/meals", element: <MealsScreen /> },
      { path: "life/grocery", element: <GroceryScreen /> },
      { path: "life/content", element: <ContentScreen /> },
      { path: "life/career", element: <CareerScreen /> },

      { path: "search", element: <SearchScreen /> },
      { path: "settings", element: <SettingsScreen /> },
      {
        path: "*",
        element: <PlaceholderScreen title="Nothing here" note="This page doesn't exist. Head back to Today." />,
      },
    ],
  },
]);
