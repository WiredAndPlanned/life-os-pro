/**
 * Type-safe references to the design-token CSS variables (Phase 1).
 *
 * Components read tokens through these helpers instead of hardcoding var()
 * strings, so a renamed token is a compile error rather than a silent visual
 * break. This keeps the whole product bound to the single token layer (§26).
 *
 * These are NOT new values — they are typed names pointing at the CSS variables
 * defined in color.css / scale.css. The CSS layer remains the source of truth
 * for the actual values (and for theme switching, which is pure CSS).
 */

export const token = {
  // Signal — the single accent (§6.1)
  signal: "var(--signal)",
  signalHover: "var(--signal-hover)",
  signalPressed: "var(--signal-pressed)",
  signalOnTint: "var(--signal-on-tint)",
  signalInk: "var(--signal-ink)",

  // Neutral ink & surface (§6.2)
  bg: "var(--bg)",
  surface: "var(--surface)",
  surface2: "var(--surface-2)",
  line: "var(--line)",
  line2: "var(--line-2)",
  ink: "var(--ink)",
  ink2: "var(--ink-2)",
  ink3: "var(--ink-3)",
  ink4: "var(--ink-4)",

  // Semantic — genuine states only (§6.3)
  positive: "var(--positive)",
  caution: "var(--caution)",
  critical: "var(--critical)",

  // Category hues — quiet dot/edge, and a soft tint for icon tiles (§6.5)
  catPlan: "var(--cat-plan)",
  catHealth: "var(--cat-health)",
  catMoney: "var(--cat-money)",
  catLife: "var(--cat-life)",
  catPlanTint: "var(--cat-plan-tint)",
  catHealthTint: "var(--cat-health-tint)",
  catMoneyTint: "var(--cat-money-tint)",
  catLifeTint: "var(--cat-life-tint)",

  // Spacing
  space1: "var(--space-1)",
  space2: "var(--space-2)",
  space3: "var(--space-3)",
  space4: "var(--space-4)",
  space5: "var(--space-5)",
  space6: "var(--space-6)",
  space7: "var(--space-7)",
  space8: "var(--space-8)",

  // Radius
  radius1: "var(--radius-1)",
  radius2: "var(--radius-2)",
  radius3: "var(--radius-3)",
  radius4: "var(--radius-4)",
  radiusRound: "var(--radius-round)",

  // Type
  fontFamily: "var(--font-family)",
  fontMono: "var(--font-mono)",
  textDisplay: "var(--text-display)",
  textTitle: "var(--text-title)",
  textHeading: "var(--text-heading)",
  textBody: "var(--text-body)",
  textCallout: "var(--text-callout)",
  textFootnote: "var(--text-footnote)",
  textCaption: "var(--text-caption)",
  weightRegular: "var(--weight-regular)",
  weightMedium: "var(--weight-medium)",
  weightSemibold: "var(--weight-semibold)",
  weightBold: "var(--weight-bold)",

  // Elevation
  elevation1: "var(--elevation-1)",
  elevation2: "var(--elevation-2)",
  elevationSheet: "var(--elevation-sheet)",

  // Motion
  durationInstant: "var(--duration-instant)",
  durationQuick: "var(--duration-quick)",
  durationSettle: "var(--duration-settle)",
  durationSheet: "var(--duration-sheet)",
  easeSettle: "var(--ease-settle)",
  easeStandard: "var(--ease-standard)",

  // Layout
  readingMax: "var(--reading-max)",
  touchMin: "var(--touch-min)",
} as const;

export type TokenName = keyof typeof token;

/** The four module families (§6.5, §10). Category color is resolved from these. */
export const CATEGORY_FAMILIES = ["plan", "health", "money", "life"] as const;
export type CategoryFamily = (typeof CATEGORY_FAMILIES)[number];

export const categoryColor: Record<CategoryFamily, string> = {
  plan: token.catPlan,
  health: token.catHealth,
  money: token.catMoney,
  life: token.catLife,
};

/** Soft same-hue tint per family — the ground for category icon tiles (§6.5). */
export const categoryTint: Record<CategoryFamily, string> = {
  plan: token.catPlanTint,
  health: token.catHealthTint,
  money: token.catMoneyTint,
  life: token.catLifeTint,
};
