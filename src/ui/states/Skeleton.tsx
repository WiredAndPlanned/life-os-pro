import styles from "./Skeleton.module.css";
import { cx } from "@lib/cx";

/**
 * Skeleton (Constitution §19) — progressive, non-blocking loading.
 *
 * Local-first means most reads are instant; a skeleton appears only for a
 * genuinely async moment (import, cold start), and only on THAT region — never a
 * full-screen spinner, never a frozen app (§19). It is a calm shimmer, not a
 * spinner demanding attention. Marked aria-busy for assistive tech; reduced
 * motion collapses the shimmer to a static tint (base.css).
 */

interface SkeletonProps {
  /** Number of shimmer lines to show. */
  lines?: number;
  /** Optional fixed width for a single block (e.g. a number). */
  width?: string;
  /** Render as a block (card-height) instead of text lines. */
  block?: boolean;
}

export function Skeleton({ lines = 3, width, block = false }: SkeletonProps) {
  if (block) {
    return (
      <div
        className={cx(styles.shimmer, styles.block)}
        style={width ? { width } : undefined}
        aria-busy="true"
        aria-live="polite"
      />
    );
  }
  return (
    <div className={styles.stack} aria-busy="true" aria-live="polite">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cx(styles.shimmer, styles.line)}
          style={{ width: i === lines - 1 ? "60%" : (width ?? "100%") }}
        />
      ))}
    </div>
  );
}
