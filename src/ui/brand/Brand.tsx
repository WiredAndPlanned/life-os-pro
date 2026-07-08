import styles from "./Brand.module.css";
import { cx } from "@lib/cx";

/**
 * The WiredAndPlanned brand mark — "the Cairn" (Identity Board, Board 03).
 *
 * Constructed exactly to the locked mark spec, transcribed from the Identity
 * Board's verdicts:
 *  - THREE stones (Trial A: "keep three" — beginning, middle, end).
 *  - Widths in a √2 progression: 8 · 11.3 · 16 (Trial B) — crown:base = 1:2.
 *  - Height 4.5, gap 1.5 (Trial C change) — holds together down to 16px.
 *  - ±0.5 alternating horizontal offset (Trial D) — placed by a hand, not a chart.
 *  - Full-round ends, R = H/2 — each stone is a stadium; "the end of a stone".
 *  - ONE ink on one paper, never gradient, never recolored (Color section):
 *    the mark draws in `currentColor`, so it takes the surrounding ink.
 *  - Clear space is half the mark's height on all sides.
 *  - Motion: the stones settle bottom-up (base→crown) over 450ms, ONCE, never
 *    loops; reduced-motion shows them already settled (Motion Signature).
 *
 * This component never restyles the mark beyond what the board permits; it only
 * applies the single frozen artwork at the requested size.
 */

interface CairnProps {
  /** Pixel height of the whole mark. Default 24 (interface size). */
  size?: number;
  /** Play the one-time settle on mount. Off by default (respects calm). */
  animate?: boolean;
  title?: string;
}

// Mark geometry in the board's own 24-unit grid (unit = 1). Stones listed top→
// bottom: crown (narrowest) on top, base (widest) at bottom — a cairn. Alternating
// ±0.5 offset (Trial D). Base seats low (Trial F).
const STONES = [
  { w: 8, x: 0.5, order: 3 },    // crown  — narrowest, top,    settles last
  { w: 11.3, x: -0.5, order: 2 }, // middle —            settles second
  { w: 16, x: 0.5, order: 1 },   // base   — widest,   bottom, settles first
];
const H = 4.5;
const GAP = 1.5;
const VIEW_W = 24;
const VIEW_H = 3 * H + 2 * GAP + 1; // stones + gaps + a little seat

export function Cairn({ size = 24, animate = false, title }: CairnProps) {
  const totalH = VIEW_H;
  const midX = VIEW_W / 2;
  return (
    <svg
      width={(size * VIEW_W) / totalH}
      height={size}
      viewBox={`0 0 ${String(VIEW_W)} ${String(totalH)}`}
      fill="currentColor"
      className={cx(styles.cairn, animate && styles.settle)}
      {...(title ? { role: "img", "aria-label": title } : { "aria-hidden": true })}
    >
      {STONES.map((s, i) => {
        // i=0 is the crown at the top (y=0); base is last (lowest).
        const y = i * (H + GAP);
        return (
          <rect
            key={i}
            className={styles.stone}
            x={midX + s.x - s.w / 2}
            y={y}
            width={s.w}
            height={H}
            rx={H / 2}
            ry={H / 2}
            style={{ ["--stone-order" as string]: String(s.order) }}
          />
        );
      })}
    </svg>
  );
}

/**
 * The full lockup: the Cairn mark + the wordmark (grotesk cut). Used in the nav
 * header and the Settings "about" seal. Clear space is honored by the layout gap.
 */
export function BrandLockup({ label = "Life OS Pro", animate = false }: { label?: string; animate?: boolean }) {
  return (
    <span className={styles.lockup}>
      <Cairn size={22} animate={animate} />
      <span className={styles.wordmark}>{label}</span>
    </span>
  );
}
