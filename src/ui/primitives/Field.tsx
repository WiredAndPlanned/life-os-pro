import type { InputHTMLAttributes } from "react";
import { useId } from "react";
import styles from "./Field.module.css";
import { cx } from "@lib/cx";

/**
 * Field (Constitution §17, §19, §24) — a labeled text input.
 *
 * The primary input surface is the bottom sheet (§17); Field is what fills it.
 * A validation issue is shown gently, in place, next to the field (§19) — never
 * an alert() (the legacy defect). The error text is in the product voice (§4.1):
 * specific, calm, never blaming.
 *
 * Accessible by construction (§24): a real <label> tied to the input, and the
 * error tied via aria-describedby with aria-invalid, so assistive tech announces
 * it. Meaning never rests on the red color alone (§6.3, §24) — the words carry it.
 */

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string;
  /** Calm, specific validation message. Presence flips the field to error state. */
  error?: string;
  /** Optional quiet helper text below the field. */
  hint?: string;
}

export function Field({ label, error, hint, className, ...inputProps }: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className={[styles.field, className ?? ""].filter(Boolean).join(" ")}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        id={id}
        className={cx(styles.input, error && styles.inputError)}
        aria-invalid={error ? true : undefined}
        {...(describedBy ? { "aria-describedby": describedBy } : {})}
        {...inputProps}
      />
      {error ? (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
