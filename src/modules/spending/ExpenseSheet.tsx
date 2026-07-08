import { useState } from "react";
import { BottomSheet } from "@ui/primitives/BottomSheet";
import { Field } from "@ui/primitives/Field";
import { Button } from "@ui/primitives/Button";
import type { Expense, SpendCategory } from "@data/types";
import { spending, SPEND_CATEGORIES, SPEND_CATEGORY_ORDER } from "./spending.data";
import styles from "./ExpenseSheet.module.css";
import { cx } from "@lib/cx";

/**
 * Add / edit an expense (Constitution §17).
 *
 * The one add/edit surface for this module — a calm bottom sheet with a few
 * fields, one primary action, one ghost cancel (§17). Validation is shown gently,
 * in place, next to the field, in the product voice (§19, §4.1) — never an
 * alert(). Saving persists immediately via the shared CRUD floor (§22).
 *
 * `editing` present → edit mode; absent → create mode. Same sheet, so learning
 * one add-flow teaches them all (§17).
 */

interface ExpenseSheetProps {
  open: boolean;
  onClose: () => void;
  editing?: Expense;
}

export function ExpenseSheet({ open, onClose, editing }: ExpenseSheetProps) {
  const [item, setItem] = useState(editing?.item ?? "");
  const [amount, setAmount] = useState(editing ? String(editing.amount) : "");
  const [category, setCategory] = useState<SpendCategory>(editing?.category ?? "food");
  const [errors, setErrors] = useState<{ item?: string; amount?: string }>({});

  // Reset local state whenever the sheet (re)opens for a different target.
  const key = `${open ? "open" : "closed"}:${editing?.id ?? "new"}`;
  const [seen, setSeen] = useState(key);
  if (seen !== key) {
    setSeen(key);
    setItem(editing?.item ?? "");
    setAmount(editing ? String(editing.amount) : "");
    setCategory(editing?.category ?? "food");
    setErrors({});
  }

  function handleSave() {
    const trimmed = item.trim();
    const value = Number(amount);
    const nextErrors: { item?: string; amount?: string } = {};
    if (!trimmed) nextErrors.item = "Give this a name so you'll recognise it later.";
    if (!amount.trim() || Number.isNaN(value) || value <= 0) {
      nextErrors.amount = "Enter an amount greater than zero.";
    }
    if (nextErrors.item || nextErrors.amount) {
      setErrors(nextErrors);
      return;
    }

    if (editing) {
      spending.edit(editing.id, { item: trimmed, amount: value, category });
    } else {
      spending.create({ item: trimmed, amount: value, category, date: Date.now() });
    }
    onClose();
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={editing ? "Edit expense" : "Add expense"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </>
      }
    >
      <Field
        label="Item"
        placeholder="Coffee"
        value={item}
        onChange={(e) => {
          setItem(e.target.value);
        }}
        {...(errors.item ? { error: errors.item } : {})}
        autoFocus
      />
      <Field
        label="Amount"
        placeholder="0.00"
        inputMode="decimal"
        value={amount}
        onChange={(e) => {
          setAmount(e.target.value);
        }}
        {...(errors.amount ? { error: errors.amount } : {})}
      />
      <fieldset className={styles.categories}>
        <legend className={styles.legend}>Category</legend>
        <div className={styles.chips}>
          {SPEND_CATEGORY_ORDER.map((c) => (
            <button
              key={c}
              type="button"
              className={cx(styles.chip, category === c && styles.chipActive)}
              aria-pressed={category === c}
              onClick={() => {
                setCategory(c);
              }}
            >
              {SPEND_CATEGORIES[c].label}
            </button>
          ))}
        </div>
      </fieldset>
    </BottomSheet>
  );
}
