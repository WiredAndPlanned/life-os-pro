import type { ReactNode } from "react";
import { EmptyIllustration } from "./EmptyIllustration";
import { Button } from "../primitives/Button";
import styles from "./EmptyState.module.css";

/**
 * EmptyState (Constitution §7, §9, §19) — the most important screen.
 *
 * Every empty state TEACHES and INVITES: it names what this space is for and
 * offers exactly ONE gentle first action. It reads as a calm beginning, never a
 * dead end or an error (§9, §19). The copy is in the product voice (§4.1):
 * plain, warm, unhurried, sentence case.
 *
 * The illustration is decorative and hidden from assistive tech; the teaching
 * TEXT carries the meaning (§9, §24). One illustration language, many moments.
 */

interface EmptyStateProps {
  /** The single calm illustration mood (one visual family, §9). */
  illustration?: "clear" | "money" | "calendar" | "list";
  /** What this space is for — one warm line (§4.1). */
  title: string;
  /** Optional second line of gentle guidance. */
  body?: string;
  /** Exactly one gentle first action (§9). Label says what it does (§4.1). */
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}

export function EmptyState({
  illustration = "clear",
  title,
  body,
  actionLabel,
  onAction,
  children,
}: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      <EmptyIllustration mood={illustration} />
      <h3 className={styles.title}>{title}</h3>
      {body && <p className={styles.body}>{body}</p>}
      {actionLabel && onAction && (
        <div className={styles.action}>
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
      {children}
    </div>
  );
}
