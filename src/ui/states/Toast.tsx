import { useEffect } from "react";
import { Icon } from "../icons/Icon";
import styles from "./Toast.module.css";

/**
 * Toast (Constitution §19) — success confirmed quietly and once.
 *
 * A brief, calm acknowledgment, then it's gone. The product never celebrates
 * loudly, never blocks to say "well done," never gamifies (§19). Copy is one
 * word or a short phrase in the product voice (§4.1): "Saved." — not "Success!
 * Your entry has been recorded."
 *
 * Announced via role="status" (polite) so assistive tech hears it without
 * interruption (§24). Auto-dismisses; also dismissible. This is the presentation
 * primitive; a Phase 3 provider will queue and position these app-wide.
 */

interface ToastProps {
  message: string;
  /** Milliseconds before auto-dismiss. */
  duration?: number;
  onDismiss?: () => void;
}

export function Toast({ message, duration = 2000, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!onDismiss) return;
    const t = setTimeout(onDismiss, duration);
    return () => {
      clearTimeout(t);
    };
  }, [duration, onDismiss]);

  return (
    <div className={styles.toast} role="status">
      <Icon name="check" size={18} />
      <span className={styles.msg}>{message}</span>
    </div>
  );
}
