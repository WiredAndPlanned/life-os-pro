import type { CSSProperties } from "react";

/**
 * Icon system (Constitution §8).
 *
 * ONE set of outlined, rounded, 2px-stroke, `currentColor` line icons — size-safe
 * by construction (fixed 24 viewBox, intrinsic sizing, never distorts, §8, Level 2
 * §8). Icons inherit ink color and take the accent only when marking the active
 * destination. Emoji is NOT an icon system (§8); emoji is user content only.
 *
 * Every icon that carries meaning must be given a label by its consumer (via
 * `title`); purely decorative icons stay aria-hidden (the default here, §8, §24).
 *
 * The paths are the single source of truth for iconography. New icons are added
 * here deliberately, never invented per-screen (Level 2 §8).
 */

export type IconName =
  // primary destinations (§11)
  | "today"
  | "plan"
  | "life"
  | "search"
  | "settings"
  // common actions & affordances
  | "add"
  | "check"
  | "close"
  | "chevronRight"
  | "chevronLeft"
  | "trash"
  | "edit"
  // module marks (§8 — one line-icon system, one calm glyph per module)
  | "brainDump"
  | "weekly"
  | "monthly"
  | "recurring"
  | "goals"
  | "study"
  | "spending"
  | "subscriptions"
  | "savings"
  | "debt"
  | "habits"
  | "mood"
  | "sleep"
  | "movement"
  | "hydration"
  | "meals"
  | "grocery"
  | "content"
  | "career";

const PATHS: Record<IconName, string> = {
  // Rounded, calm line forms. All drawn on a 24x24 grid, stroke width 2.
  today: "M4 9h16M8 4v3M16 4v3M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z",
  plan: "M6 4h9l5 5v11a0 0 0 0 1 0 0H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1ZM14 4v6h6M8.5 14h7M8.5 17h4",
  life: "M12 21s-7-4.35-7-9a4 4 0 0 1 7-2.65A4 4 0 0 1 19 12c0 4.65-7 9-7 9Z",
  search: "M11 11m-7 0a7 7 0 1 0 14 0a7 7 0 1 0-14 0M20 20l-4-4",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 2h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 5 12a7 7 0 0 0 .1 1.2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2L10 22h4l.5-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6A7 7 0 0 0 19 12Z",
  add: "M12 5v14M5 12h14",
  check: "M5 13l4 4L19 7",
  close: "M6 6l12 12M18 6L6 18",
  chevronRight: "M9 6l6 6-6 6",
  chevronLeft: "M15 6l-6 6 6 6",
  trash: "M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M10 11v6M14 11v6",
  edit: "M4 20h4L18.5 9.5a2.12 2.12 0 0 0-3-3L5 17v3ZM13.5 6.5l3 3",

  // Module marks — one calm line glyph each, 24x24 grid, stroke 2, rounded.
  brainDump: "M12 4a5 5 0 0 0-5 5c0 1.5.6 2.5 1.5 3.5S10 14 10 16h4c0-2 .6-2.5 1.5-3.5S17 10.5 17 9a5 5 0 0 0-5-5ZM10 19h4M11 21h2",
  weekly: "M4 7h16M4 12h16M4 17h16M9 4v16",
  monthly: "M4 8h16M6 4h12a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1ZM9 12h2v2H9zM15 12h.01",
  recurring: "M4 12a8 8 0 0 1 13.7-5.6L20 8M20 4v4h-4M20 12a8 8 0 0 1-13.7 5.6L4 16M4 20v-4h4",
  goals: "M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0M12 12m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0M12 12h.01",
  study: "M12 5 3 9l9 4 9-4-9-4ZM7 11v5c0 1 2.2 2 5 2s5-1 5-2v-5M21 9v5",
  spending: "M3 7h18a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1ZM3 11h19M7 15h3",
  subscriptions: "M4 12a8 8 0 0 1 13.7-5.6L20 8M20 4v4h-4M20 12a8 8 0 0 1-13.7 5.6L4 16M4 20v-4h4M12 8v4l2.5 1.5",
  savings: "M4 10c0-2 2-4 5-4h3a6 6 0 0 1 6 6c0 2-1 3-1 3v3h-3l-1-1H9l-1 1H5v-3s-1-1-1-3ZM7 10h.01M17 9c0-1.5-1-2.5-2-3",
  debt: "M4 18 9 13l3 3 8-8M20 8v4M20 8h-4",
  habits: "M5 13l3 3 4-4M9 5h9M9 12h6M9 19h9",
  mood: "M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0M9 10h.01M15 10h.01M8.5 14a4 4 0 0 0 7 0",
  sleep: "M20 14a8 8 0 1 1-9.5-9 6.5 6.5 0 0 0 9.5 9ZM15 5h4M15 5l4 4",
  movement: "M13 4a1.5 1.5 0 1 0 0 .01M8 9l3-1 3 2 2 3M6 21l3-5 3 1M14 14l1 3 3 2",
  hydration: "M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11ZM9 14a3 3 0 0 0 3 3",
  meals: "M5 3v8a2 2 0 0 0 4 0V3M7 11v10M17 3c-1.5 0-2.5 2-2.5 5s1 4 2.5 4v9",
  grocery: "M4 5h2l2 11h9l2-8H7M9 21h.01M17 21h.01",
  content: "M4 6a2 2 0 0 1 2-2h8l6 6v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6ZM10 9l5 3-5 3V9Z",
  career: "M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M4 7h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1ZM3 12h18",
};

interface IconProps {
  name: IconName;
  /** Pixel size (width & height). Default 24 (the design grid). */
  size?: number;
  /** Accessible label. If given, the icon is announced; if omitted, it is decorative. */
  title?: string;
  style?: CSSProperties;
  className?: string;
}

export function Icon({ name, size = 24, title, style, className }: IconProps) {
  const labelled = title !== undefined;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      {...(labelled ? { role: "img", "aria-label": title } : { "aria-hidden": true })}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
