import { useState } from "react";
import { Card } from "@ui/primitives/Card";
import { Button } from "@ui/primitives/Button";
import { Icon } from "@ui/icons/Icon";
import { Field } from "@ui/primitives/Field";
import { BottomSheet } from "@ui/primitives/BottomSheet";
import { EmptyState } from "@ui/states/EmptyState";
import { useSelector } from "@data/useStore";
import type { GroceryCategory } from "@data/types";
import { grocery, GROCERY_CATEGORIES, GROCERY_ORDER } from "./grocery.data";
import { categoryColor } from "@tokens/tokens";
import chip from "@modules/spending/ExpenseSheet.module.css";
import screen from "@modules/spending/SpendingScreen.module.css";
import styles from "./GroceryScreen.module.css";
import { cx } from "@lib/cx";

/** Grocery screen (§12). One calm list; check things off. Got items fade to the bottom. */

export function GroceryScreen() {
  const items = useSelector((s) => s.grocery);
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState("");
  const [category, setCategory] = useState<GroceryCategory>("produce");
  const [error, setError] = useState<string | undefined>(undefined);

  function add() {
    const t = item.trim();
    if (!t) {
      setError("What do you need to buy?");
      return;
    }
    grocery.create({ item: t, category, got: false });
    setItem("");
    setError(undefined);
    setOpen(false);
  }

  const pending = items.filter((i) => !i.got);
  const got = items.filter((i) => i.got);
  const ordered = [...pending, ...got];

  return (
    <div className={screen.screen}>
      <header className={screen.header}>
        <div>
          <h1 className={screen.title}>Grocery</h1>
          <p className={screen.subtitle}>One calm list. Check things off.</p>
        </div>
      </header>

      {ordered.length === 0 ? (
        <EmptyState
          illustration="list"
          title="List's empty"
          body="Add what you need and tick it off as you go."
          actionLabel="Add item"
          onAction={() => {
            setOpen(true);
          }}
        />
      ) : (
        <>
          <Card>
            {ordered.map((g) => (
              <div key={g.id} className={styles.itemRow}>
                <button
                  type="button"
                  className={cx(styles.check, g.got && styles.checked)}
                  aria-pressed={g.got}
                  aria-label={`Mark ${g.item} as ${g.got ? "not bought" : "bought"}`}
                  onClick={() => {
                    grocery.edit(g.id, { got: !g.got });
                  }}
                >
                  {g.got && <Icon name="check" size={16} />}
                </button>
                <span
                  className={styles.dot}
                  style={{ background: categoryColor[GROCERY_CATEGORIES[g.category].family] }}
                  aria-hidden="true"
                />
                <span className={cx(styles.name, g.got && styles.nameGot)}>{g.item}</span>
                <button
                  type="button"
                  className={screen.deleteBtn}
                  aria-label={`Remove ${g.item}`}
                  onClick={() => {
                    grocery.remove(g.id);
                  }}
                >
                  <Icon name="close" size={18} />
                </button>
              </div>
            ))}
          </Card>
          <div className={screen.addRow}>
            <Button
              variant="primary"
              onClick={() => {
                setOpen(true);
              }}
            >
              <Icon name="add" size={18} />
              Add item
            </Button>
          </div>
        </>
      )}

      <BottomSheet
        open={open}
        onClose={() => {
          setOpen(false);
          setError(undefined);
        }}
        title="Add item"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setOpen(false);
                setError(undefined);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={add}>
              Add
            </Button>
          </>
        }
      >
        <Field
          label="Item"
          placeholder="Oat milk"
          value={item}
          onChange={(e) => {
            setItem(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") add();
          }}
          {...(error ? { error } : {})}
          autoFocus
        />
        <fieldset className={chip.categories}>
          <legend className={chip.legend}>Aisle</legend>
          <div className={chip.chips}>
            {GROCERY_ORDER.map((c) => (
              <button
                key={c}
                type="button"
                className={cx(chip.chip, category === c && chip.chipActive)}
                aria-pressed={category === c}
                onClick={() => {
                  setCategory(c);
                }}
              >
                {GROCERY_CATEGORIES[c].label}
              </button>
            ))}
          </div>
        </fieldset>
      </BottomSheet>
    </div>
  );
}
