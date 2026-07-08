import type { ReactNode } from "react";
import type { CategoryFamily } from "@tokens/tokens";
import { categoryColor, categoryTint } from "@tokens/tokens";
import { Icon } from "../icons/Icon";
import type { IconName } from "../icons/Icon";
import styles from "./Row.module.css";
import { cx } from "@lib/cx";

/**
 * Row (Constitution §10) — a list item.
 *
 * A clear title in primary ink, meta in tertiary ink. A row may show its family
 * two ways: a quiet <=10px dot (the calm default, §6.5), or — when an `icon` is
 * given — a soft category-tinted tile with the category-colored line icon. The
 * tile is a wash of the family hue, not a saturated fill: recognition carried by
 * a colored icon + label, which people (and Gen-Z especially) scan faster, while
 * the surface stays calm. A row may be a button (whole-row tap) or static.
 */

interface RowProps {
  title: string;
  meta?: string;
  /** Family, for the dot or the tinted icon tile (§6.5). */
  category?: CategoryFamily;
  /** When set (with `category`), shows a colored icon tile instead of the dot. */
  icon?: IconName;
  /** Trailing control (a value, a checkbox, a chevron). */
  trailing?: ReactNode;
  /** If provided, the whole row is a button. Label it for assistive tech. */
  onClick?: () => void;
  /** Accessible label when the row is interactive and the title isn't enough. */
  ariaLabel?: string;
}

export function Row({ title, meta, category, icon, trailing, onClick, ariaLabel }: RowProps) {
  const inner = (
    <>
      <span className={styles.lead}>
        {icon && category ? (
          <span
            className={styles.tile}
            style={{ background: categoryTint[category], color: categoryColor[category] }}
            aria-hidden="true"
          >
            <Icon name={icon} size={20} />
          </span>
        ) : (
          category && (
            <span
              className={styles.dot}
              style={{ background: categoryColor[category] }}
              aria-hidden="true"
            />
          )
        )}
        <span className={styles.text}>
          <span className={styles.title}>{title}</span>
          {meta && <span className={styles.meta}>{meta}</span>}
        </span>
      </span>
      {trailing !== undefined && <span className={styles.trailing}>{trailing}</span>}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={cx(styles.row, styles.interactive)}
        onClick={onClick}
        {...(ariaLabel ? { "aria-label": ariaLabel } : {})}
      >
        {inner}
      </button>
    );
  }
  return <div className={styles.row}>{inner}</div>;
}
