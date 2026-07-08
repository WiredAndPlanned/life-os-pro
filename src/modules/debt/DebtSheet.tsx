import { useState } from "react";
import { BottomSheet } from "@ui/primitives/BottomSheet";
import { Field } from "@ui/primitives/Field";
import { Button } from "@ui/primitives/Button";
import type { Debt } from "@data/types";
import { debt } from "@modules/savings/savingsDebt.data";

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: Debt;
}

export function DebtSheet({ open, onClose, editing }: Props) {
  const [name, setName] = useState(editing?.name ?? "");
  const [total, setTotal] = useState(editing ? String(editing.total) : "");
  const [paid, setPaid] = useState(editing ? String(editing.paid) : "");
  const [errors, setErrors] = useState<{ name?: string; total?: string }>({});

  const key = `${open ? "o" : "c"}:${editing?.id ?? "new"}`;
  const [seen, setSeen] = useState(key);
  if (seen !== key) {
    setSeen(key);
    setName(editing?.name ?? "");
    setTotal(editing ? String(editing.total) : "");
    setPaid(editing ? String(editing.paid) : "");
    setErrors({});
  }

  function handleSave() {
    const n = name.trim();
    const t = Number(total);
    const p = Number(paid) || 0;
    const e: { name?: string; total?: string } = {};
    if (!n) e.name = "Name this so you can track it.";
    if (!total.trim() || Number.isNaN(t) || t <= 0) e.total = "Enter the total, above zero.";
    if (e.name || e.total) {
      setErrors(e);
      return;
    }
    if (editing) debt.edit(editing.id, { name: n, total: t, paid: p });
    else debt.create({ name: n, total: t, paid: p });
    onClose();
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={editing ? "Edit debt" : "Add debt"}
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
        label="What is it"
        placeholder="Student loan"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
        }}
        {...(errors.name ? { error: errors.name } : {})}
        autoFocus
      />
      <Field
        label="Total"
        placeholder="0.00"
        inputMode="decimal"
        value={total}
        onChange={(e) => {
          setTotal(e.target.value);
        }}
        {...(errors.total ? { error: errors.total } : {})}
      />
      <Field
        label="Paid off so far"
        placeholder="0.00"
        inputMode="decimal"
        value={paid}
        onChange={(e) => {
          setPaid(e.target.value);
        }}
      />
    </BottomSheet>
  );
}
