import styles from "./Progress.module.css";

/**
 * Progress (Constitution §10) — a single thin accent bar on a sunken track.
 *
 * One accent, calm, never red/green (§10, §6.3). Used for a person's own chosen
 * targets — a savings goal, a goal's progress, debt paid down — where the accent
 * is legitimate because it's the person's own target (§6.3), never a scoreboard.
 *
 * Accessible (§24): exposes role="progressbar" with aria-valuenow/min/max and an
 * accessible label, so assistive tech announces the progress, not just the color.
 */

interface ProgressProps {
  /** 0..1. Clamped. */
  value: number;
  /** Accessible label describing what this measures. */
  label: string;
}

export function Progress({ value, label }: ProgressProps) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div
      className={styles.track}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className={styles.fill} style={{ width: `${String(pct)}%` }} />
    </div>
  );
}
