import styles from "./EmptyIllustration.module.css";

/**
 * Empty-state illustration language (Constitution §9).
 *
 * Simple, calm, single-accent line illustrations on a neutral ground — rounded,
 * unhurried, consistent with the icon system. Neutral ink line work with at most
 * ONE small use of the Signal accent per illustration. No gradients, no
 * full-color scenes, never mascot-driven. One family, many moments: the same
 * visual voice expresses "your mind is clear," "no spending yet," "nothing due."
 *
 * Decorative and hidden from assistive tech (§9, §24) — the teaching text in
 * EmptyState carries the meaning. Stroke uses currentColor set to tertiary ink;
 * the single accent mark uses --signal.
 */

type Mood = "clear" | "money" | "calendar" | "list";

export function EmptyIllustration({ mood }: { mood: Mood }) {
  return (
    <div className={styles.wrap} aria-hidden="true">
      <svg
        width="96"
        height="96"
        viewBox="0 0 96 96"
        fill="none"
        className={styles.svg}
        stroke="var(--ink-4)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {mood === "clear" && (
          <>
            {/* an open, calm space — a cleared surface with a single settled mark */}
            <rect x="20" y="26" width="56" height="44" rx="10" />
            <path d="M32 44h20M32 54h14" />
            <circle cx="64" cy="52" r="5" stroke="var(--signal)" />
          </>
        )}
        {mood === "money" && (
          <>
            {/* a calm purse/coin — never red/green, neutral line + one accent ring */}
            <rect x="22" y="34" width="52" height="34" rx="9" />
            <path d="M22 44h52" />
            <circle cx="60" cy="56" r="5" stroke="var(--signal)" />
          </>
        )}
        {mood === "calendar" && (
          <>
            <rect x="22" y="28" width="52" height="42" rx="9" />
            <path d="M22 40h52M36 24v8M60 24v8" />
            <circle cx="48" cy="55" r="5" stroke="var(--signal)" />
          </>
        )}
        {mood === "list" && (
          <>
            <path d="M34 36h34M34 48h34M34 60h22" />
            <path d="M26 36h.01M26 48h.01" />
            <path d="M25 59l2 2 3-4" stroke="var(--signal)" />
          </>
        )}
      </svg>
    </div>
  );
}
