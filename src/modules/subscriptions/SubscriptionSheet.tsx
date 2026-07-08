import { useState } from "react";
import { BottomSheet } from "@ui/primitives/BottomSheet";
import { Field } from "@ui/primitives/Field";
import { Button } from "@ui/primitives/Button";
import type { Subscription, BillingCycle } from "@data/types";
import { subscriptions, BILLING_CYCLES } from "./subscriptions.data";
import styles from "@modules/spending/ExpenseSheet.module.css";
import { cx } from "@lib/cx";

/**
 * Add / edit a subscription (§17). One shared sheet, create + edit. Validation
 * is calm and in place (§19, §4.1). Includes a date so the next charge can
 * surface on Today (§13).
 */

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: Subscription;
}

const CYCLE_ORDER: BillingCycle[] = ["monthly", "yearly", "weekly"];

function toDateInput(ms: number): string {
  const d = new Date(ms);
  return `${String(d.getFullYear())}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function SubscriptionSheet({ open, onClose, editing }: Props) {
  const [name, setName] = useState(editing?.name ?? "");
  const [cost, setCost] = useState(editing ? String(editing.cost) : "");
  const [cycle, setCycle] = useState<BillingCycle>(editing?.cycle ?? "monthly");
  const [next, setNext] = useState(toDateInput(editing?.next ?? Date.now()));
  const [errors, setErrors] = useState<{ name?: string; cost?: string }>({});

  const key = `${open ? "o" : "c"}:${editing?.id ?? "new"}`;
  const [seen, setSeen] = useState(key);
  if (seen !== key) {
    setSeen(key);
    setName(editing?.name ?? "");
    setCost(editing ? String(editing.cost) : "");
    setCycle(editing?.cycle ?? "monthly");
    setNext(toDateInput(editing?.next ?? Date.now()));
    setErrors({});
  }

  function handleSave() {
    const trimmed = name.trim();
    const value = Number(cost);
    const nextErrors: { name?: string; cost?: string } = {};
    if (!trimmed) nextErrors.name = "Give it a name you'll recognise.";
    if (!cost.trim() || Number.isNaN(value) || value <= 0)
      nextErrors.cost = "Enter an amount greater than zero.";
    if (nextErrors.name || nextErrors.cost) {
      setErrors(nextErrors);
      return;
    }
    const nextMs = new Date(`${next}T00:00:00`).getTime();
    if (editing) {
      subscriptions.edit(editing.id, { name: trimmed, cost: value, cycle, next: nextMs });
    } else {
      subscriptions.create({ name: trimmed, cost: value, cycle, next: nextMs });
    }
    onClose();
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={editing ? "Edit subscription" : "Add subscription"}
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
        label="Name"
        placeholder="Spotify"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
        }}
        {...(errors.name ? { error: errors.name } : {})}
        autoFocus
      />
      <Field
        label="Cost"
        placeholder="0.00"
        inputMode="decimal"
        value={cost}
        onChange={(e) => {
          setCost(e.target.value);
        }}
        {...(errors.cost ? { error: errors.cost } : {})}
      />
      <fieldset className={styles.categories}>
        <legend className={styles.legend}>Billing</legend>
        <div className={styles.chips}>
          {CYCLE_ORDER.map((c) => (
            <button
              key={c}
              type="button"
              className={cx(styles.chip, cycle === c && styles.chipActive)}
              aria-pressed={cycle === c}
              onClick={() => {
                setCycle(c);
              }}
            >
              {BILLING_CYCLES[c]}
            </button>
          ))}
        </div>
      </fieldset>
      <Field
        label="Next charge"
        type="date"
        value={next}
        onChange={(e) => {
          setNext(e.target.value);
        }}
      />
    </BottomSheet>
  );
}
