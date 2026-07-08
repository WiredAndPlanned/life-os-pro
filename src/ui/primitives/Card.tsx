import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Card.module.css";

/**
 * Card (Constitution §10) — the primary surface.
 *
 * Rounded (the collection's larger radius), softly elevated, generous padding,
 * hairline border. A card groups ONE idea; a screen is a short stack of calm
 * cards, never a dense dashboard. Elevation signals relationship, not
 * decoration (§6.2, Level 2 §5).
 */

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Optional quiet section heading, in the product voice (§4.1, sentence case). */
  heading?: string;
  /** A single accompanying action in the header (e.g. a link), used sparingly. */
  action?: ReactNode;
  children: ReactNode;
}

export function Card({ heading, action, className, children, ...rest }: CardProps) {
  const cls = [styles.card, className ?? ""].filter(Boolean).join(" ");
  return (
    <section className={cls} {...rest}>
      {(heading ?? action) && (
        <header className={styles.header}>
          {heading && <h2 className={styles.heading}>{heading}</h2>}
          {action && <div className={styles.action}>{action}</div>}
        </header>
      )}
      {children}
    </section>
  );
}
