import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import styles from "./BottomSheet.module.css";

/**
 * BottomSheet (Constitution §17) — the primary way to create and edit.
 *
 * Every "add" and every "edit" happens in a calm bottom sheet: grip handle, a
 * few well-spaced fields, one primary accent action, one ghost cancel. It is
 * consistent across all nineteen modules, so learning one add-flow teaches them
 * all (§17). Dismissible by backdrop tap and by Escape; never traps the person.
 *
 * Accessibility (§24): role="dialog" + aria-modal, labelled by its title, focus
 * moves into the sheet on open and is restored to the trigger on close, Escape
 * closes, and focus is kept within the sheet while open. Arrival is a single
 * settle (§21); reduced motion collapses it (CSS).
 */

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** The footer actions (typically one primary + one ghost). */
  footer?: ReactNode;
}

export function BottomSheet({ open, onClose, title, children, footer }: BottomSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    // Move focus into the panel.
    const panel = panelRef.current;
    const focusables = panel?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    (focusables?.[0] ?? panel)?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === "Tab" && focusables && focusables.length > 0) {
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (first && last) {
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    // Prevent background scroll while the sheet is open.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      previouslyFocused.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  const titleId = "sheet-title";

  return (
    <div className={styles.backdrop}>
      {/* Real, focusable scrim for click-to-dismiss; keyboard users dismiss via
          Escape or the sheet's own actions. A <button> keeps it lint-clean. */}
      <button
        type="button"
        className={styles.scrim}
        aria-label="Dismiss"
        tabIndex={-1}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className={styles.grip} aria-hidden="true" />
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
}
