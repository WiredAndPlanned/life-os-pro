/**
 * Data-layer core types (Constitution §12, §22).
 *
 * The store holds ONE collection per owner module (§12). Every entity extends
 * Entity (a stable id + creation timestamp). The ownership map in §12 is the
 * authority for which module owns which collection; the entity shapes below are
 * transcribed from that map, not redesigned.
 *
 * Persistence is a single VERSIONED envelope (§22, Level 2 §14): stored data
 * survives product updates because imports/migrations run against the version.
 */

/** Every persisted list entity has a stable id and a creation time (§22). */
export interface Entity {
  readonly id: string;
  /** Creation timestamp (ms). Enables natural ordering without a separate field. */
  readonly createdAt: number;
}

/** A collection is an ordered list of entities of one type, owned by one module. */
export type Collection<T extends Entity> = T[];

/* =========================================================================
   ENTITY SHAPES — one per owner module (§12). Transcribed from the map.
   ========================================================================= */

/* --- PLAN (time & intentions) --- */

/** Brain Dump — unsorted thoughts (§12). */
export interface Thought extends Entity {
  readonly text: string;
}

export type WeekBand = "morning" | "afternoon" | "evening";
export type WeekDay = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
/** Weekly — one entry per (band, day) cell (§12). */
export interface WeekEntry extends Entity {
  readonly band: WeekBand;
  readonly day: WeekDay;
  readonly text: string;
}

/** Monthly — a dated note/event (§12). `date` is ms at day granularity. */
export interface MonthNote extends Entity {
  readonly date: number;
  readonly note: string;
}

export type Cadence = "daily" | "weekly" | "weekdays" | "weekends";
export type PartOfDay = "morning" | "afternoon" | "evening" | "any";
/** Recurring — a recurring intention (§12). */
export interface Recurring extends Entity {
  readonly task: string;
  readonly cadence: Cadence;
  readonly partOfDay: PartOfDay;
}

export type GoalArea = "plan" | "health" | "money" | "life";
/** Goals — a personal goal with self-set progress (§12). */
export interface Goal extends Entity {
  readonly title: string;
  readonly area: GoalArea;
  /** 0..1, the person's own calm progress (§6.3 — accent allowed, it's their target). */
  readonly progress: number;
  /** Optional target date (ms). */
  readonly due?: number;
}

/* --- LIFE · Health & self --- */

/** Habits — a habit and the set of day-keys it was marked (§12). */
export interface Habit extends Entity {
  readonly name: string;
  /** Day-keys (YYYY-MM-DD) on which the habit was marked. Streaks without pressure. */
  readonly marks: string[];
}

export type MoodLevel = 1 | 2 | 3 | 4 | 5;
/** Mood — daily mood & energy, judgment-free (§12). One per day-key. */
export interface MoodLog extends Entity {
  readonly date: number;
  readonly mood: MoodLevel;
  readonly energy: MoodLevel;
  readonly note?: string;
}

/** Sleep — a night's sleep log (§12). */
export interface SleepLog extends Entity {
  readonly date: number;
  readonly hours: number;
  readonly quality: MoodLevel;
}

export type MovementType = "walk" | "run" | "gym" | "cycle" | "yoga" | "other";
/** Movement — an activity log (§12). */
export interface MovementLog extends Entity {
  readonly date: number;
  readonly type: MovementType;
  readonly minutes: number;
}

/** Hydration — per-day water count against a goal (§12). One per day-key. */
export interface HydrationDay extends Entity {
  readonly date: number;
  readonly count: number;
}

/* --- LIFE · Money --- */

export type SpendCategory = "food" | "transport" | "fun" | "bills" | "other";
/** Spending — a purchase (§12). Money renders neutral, never a verdict (§6.3). */
export interface Expense extends Entity {
  readonly item: string;
  readonly amount: number;
  readonly category: SpendCategory;
  readonly date: number;
}

export type BillingCycle = "monthly" | "yearly" | "weekly";
/** Subscriptions — a recurring cost (§12). */
export interface Subscription extends Entity {
  readonly name: string;
  readonly cost: number;
  readonly cycle: BillingCycle;
  /** Next charge date (ms) — this DOES project onto Today's "due" (§13). */
  readonly next: number;
}

/** Savings — a savings goal (§12). */
export interface SavingsGoal extends Entity {
  readonly name: string;
  readonly target: number;
  readonly saved: number;
}

/** Debt — what you owe, faced without dread (§12). */
export interface Debt extends Entity {
  readonly name: string;
  readonly total: number;
  readonly paid: number;
  /** Annual rate, optional; informational only, never rendered as alarm (§6.3). */
  readonly apr?: number;
}

/* --- LIFE · Everyday --- */

export type Meal = "b" | "l" | "d";
/** Meals — one planned meal per (day, slot) (§12). */
export interface MealPlan extends Entity {
  readonly day: WeekDay;
  readonly meal: Meal;
  readonly text: string;
}

export type GroceryCategory = "produce" | "dairy" | "pantry" | "frozen" | "other";
/** Grocery — a shopping-list item (§12). */
export interface GroceryItem extends Entity {
  readonly item: string;
  readonly category: GroceryCategory;
  readonly got: boolean;
}

export type ContentStatus = "idea" | "drafting" | "scheduled" | "posted";
export type ContentPlatform = "video" | "photo" | "writing" | "audio";
/** Content — a creator idea moving through a pipeline (§12). */
export interface ContentIdea extends Entity {
  readonly idea: string;
  readonly platform: ContentPlatform;
  readonly status: ContentStatus;
}

export type StudyStatus = "todo" | "doing" | "done";
/** Study — an assignment with a deadline (§12). Deadlines project onto Today (§13). */
export interface Assignment extends Entity {
  readonly subject: string;
  readonly task: string;
  readonly due: number;
  readonly status: StudyStatus;
}

export type CareerStage = "interested" | "applied" | "interview" | "offer" | "closed";
/** Career — a job application moving stage by stage (§12). */
export interface Application extends Entity {
  readonly role: string;
  readonly company: string;
  readonly stage: CareerStage;
  /** A relevant date (e.g. next interview), optional — projects onto Today if set (§13). */
  readonly date?: number;
}

/* =========================================================================
   THE STORE — one collection per owner (§12). The single source of truth.
   Cross-cutting surfaces (Today, Search) derive from this and never add keys.
   ========================================================================= */

export interface StoreData {
  // Plan
  readonly brainDump: Collection<Thought>;
  readonly weekly: Collection<WeekEntry>;
  readonly monthly: Collection<MonthNote>;
  readonly recurring: Collection<Recurring>;
  readonly goals: Collection<Goal>;
  // Health & self
  readonly habits: Collection<Habit>;
  readonly mood: Collection<MoodLog>;
  readonly sleep: Collection<SleepLog>;
  readonly movement: Collection<MovementLog>;
  readonly hydration: Collection<HydrationDay>;
  // Money
  readonly spending: Collection<Expense>;
  readonly subscriptions: Collection<Subscription>;
  readonly savings: Collection<SavingsGoal>;
  readonly debt: Collection<Debt>;
  // Everyday
  readonly meals: Collection<MealPlan>;
  readonly grocery: Collection<GroceryItem>;
  readonly content: Collection<ContentIdea>;
  readonly study: Collection<Assignment>;
  readonly career: Collection<Application>;
}

/** The versioned persistence envelope written to device storage (§22). */
export interface PersistEnvelope {
  readonly version: number;
  readonly data: StoreData;
  readonly savedAt: number;
}

/** Current schema version. Bumped when StoreData shape changes; migrations map up. */
export const SCHEMA_VERSION = 1;

/** The empty, valid starting state (first run and after reset). */
export function emptyStore(): StoreData {
  return {
    brainDump: [],
    weekly: [],
    monthly: [],
    recurring: [],
    goals: [],
    habits: [],
    mood: [],
    sleep: [],
    movement: [],
    hydration: [],
    spending: [],
    subscriptions: [],
    savings: [],
    debt: [],
    meals: [],
    grocery: [],
    content: [],
    study: [],
    career: [],
  };
}
