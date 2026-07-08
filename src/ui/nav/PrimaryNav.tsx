import { NavLink } from "react-router-dom";
import { DESTINATIONS } from "@app/destinations";
import { Icon } from "../icons/Icon";
import type { IconName } from "../icons/Icon";
import { BrandLockup } from "../brand/Brand";
import styles from "./PrimaryNav.module.css";
import { cx } from "@lib/cx";

/**
 * Primary navigation (Constitution §11, Level 2 §9).
 *
 * ONE navigation architecture, THREE presentations — identical logic, identical
 * destination list, only the presentation changes by size class:
 *   - phones (default):   bottom bar
 *   - medium (>=700px):   left rail (icon + short label)
 *   - large (>=1100px):   left sidebar (icon + label)
 *
 * Driven entirely by the single destination registry — no hardcoded copy. Active
 * location is always unambiguous, shown with the single accent (§6.1, §11).
 * NavLink gives correct semantics and aria-current for free (§24). The label is
 * always present in the DOM for assistive tech even where visually compact.
 *
 * The brand lockup (the Cairn + wordmark, Identity Board) heads the rail/sidebar;
 * it is hidden on the phone bottom bar where there is no room for it. It settles
 * once on first mount, then never again (Motion Signature).
 */

export function PrimaryNav() {
  return (
    <nav className={styles.nav} aria-label="Primary">
      <div className={styles.brand}>
        <BrandLockup animate />
      </div>
      <ul className={styles.list}>
        {DESTINATIONS.map((d) => (
          <li key={d.id} className={styles.item}>
            <NavLink
              to={`/${d.path}`}
              className={({ isActive }) =>
                cx(styles.link, isActive && styles.active)
              }
            >
              <span className={styles.icon}>
                <Icon name={d.icon as IconName} size={24} />
              </span>
              <span className={styles.label}>{d.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
