import { useEffect, useRef } from "react";
import { Button } from "./Button";
import styles from "./ConfirmDialog.module.css";

/**
 * ConfirmDialog (Constitution §17, §19) — reserved for ONE thing: confirming an
 * irreversible action (a destructive delete or a full reset).
 *
 * Small, calm, with a clear consequence and a clearly-labeled action. Dialogs
 * are NEVER used for routine input, marketing, or interruption (§17). Copy is in
 * the product voice (§4.1): states the real consequence plainly, never scary
 * theater — "Delete this debt? This can't be undone."
 *
 * Accessible (§24): role="alertdialog", labelled + described, focus moves to the
 * dialog (defaulting to the SAFE action) and restores on close, Escape cancels.
 */

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  /** The real consequence, plainly (§4.1). */
  body: string;
  /** The destructive action's label — says exactly what it does (§4.1). */
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    // Focus the SAFE action by default (§13 calm psychology — never nudge toward
    // the destructive choice).
    cancelRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className={styles.backdrop}>
      {/* A real, focusable control for the mouse convenience of click-to-dismiss;
          keyboard users dismiss via Escape or the Cancel button. Rendering it as
          a <button> (not an onClick <div>) keeps it accessible and lint-clean. */}
      <button
        type="button"
        className={styles.scrim}
        aria-label="Dismiss dialog"
        tabIndex={-1}
        onClick={onCancel}
      />
      <div
        className={styles.dialog}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-body"
      >
        <h2 id="confirm-title" className={styles.title}>
          {title}
        </h2>
        <p id="confirm-body" className={styles.body}>
          {body}
        </p>
        <div className={styles.actions}>
          <Button ref={cancelRef} variant="ghost" block onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="danger" block onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
