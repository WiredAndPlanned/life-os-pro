import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import { forwardRef } from "react";
import styles from "./Button.module.css";

/**
 * Button (Constitution §10, §17).
 *
 * The primary action uses the single accent (§6.1) and appears at most once per
 * screen (§6.1). Variants:
 *  - primary: the one important action (accent fill)
 *  - ghost:   secondary / cancel (no fill; the calm "not-primary")
 *  - danger:  a destructive confirm, only inside a confirm dialog (§17)
 *
 * Full state set is carried by CSS: rest, hover, active/pressed, focus-visible,
 * disabled (§10). Labels are written in the product voice (§4.1): a button says
 * exactly what it does ("Save," "Delete debt") — never "OK"/"Submit".
 *
 * Forwards its ref so focus can be managed (e.g. a dialog focusing the safe
 * action, §17/§24).
 */

type Variant = "primary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** Full-width within its container (common in bottom sheets, §17). */
  block?: boolean;
  children: ReactNode;
}

export const Button = forwardRef(function Button(
  { variant = "primary", block = false, type = "button", className, children, ...rest }: ButtonProps,
  ref: Ref<HTMLButtonElement>,
) {
  const cls = [styles.btn, styles[variant], block ? styles.block : "", className ?? ""]
    .filter(Boolean)
    .join(" ");
  return (
    <button ref={ref} type={type} className={cls} {...rest}>
      {children}
    </button>
  );
});
