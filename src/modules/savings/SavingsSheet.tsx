import { useState } from "react";
import { BottomSheet } from "@ui/primitives/BottomSheet";
import { Field } from "@ui/primitives/Field";
import { Button } from "@ui/primitives/Button";
import type { SavingsGoal } from "@data/types";
import { savings } from "./savingsDebt.data";

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: SavingsGoal;
}

export function SavingsSheet({ open, onClose, editing }: Props) {
  const [name, setName] = useState(editing?.name ?? "");
  const [target, setTarget] = useState(editing ? String(editing.target) : "");
  const [saved, setSaved] = useState(editing ? String(editing.saved) : "");
  const [errors, setErrors] = useState<{ name?: string; target?: string }>({});

  const key = `${open ? "o" : "c"}:${editing?.id ?? "new"}`;
  const [seen, setSeen] = useState(key);
  if (seen !== key) {
    setSeen(key);
    setName(editing?.name ?? "");
    setTarget(editing ? String(editing.target) : "");
    setSaved(editing ? String(editing.saved) : "");
    setErrors({});
  }

  function handleSave() {
    const n = name.trim();
    const t = Number(target);
    const s = Number(saved) || 0;
    const e: { name?: string; target?: string } = {};
    if (!n) e.name = "Name what you're saving for.";
    if (!target.trim() || Number.isNaN(t) || t <= 0) e.target = "Set a target above zero.";
    if (e.name || e.target) {
      setErrors(e);
      return;
    }
    if (editing) savings.edit(editing.id, { name: n, target: t, saved: s });
    else savings.create({ name: n, target: t, saved: s });
    onClose();
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={editing ? "Edit savings goal" : "Add savings goal"}
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
        label="Saving for"
        placeholder="New laptop"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
        }}
        {...(errors.name ? { error: errors.name } : {})}
        autoFocus
      />
      <Field
        label="Target"
        placeholder="0.00"
        inputMode="decimal"
        value={target}
        onChange={(e) => {
          setTarget(e.target.value);
        }}
        {...(errors.target ? { error: errors.target } : {})}
      />
      <Field
        label="Saved so far"
        placeholder="0.00"
        inputMode="decimal"
        value={saved}
        onChange={(e) => {
          setSaved(e.target.value);
        }}
      />
    </BottomSheet>
  );
}
