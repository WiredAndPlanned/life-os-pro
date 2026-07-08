import { useState } from "react";
import { Card } from "@ui/primitives/Card";
import { Row } from "@ui/primitives/Row";
import { Button } from "@ui/primitives/Button";
import { Icon } from "@ui/icons/Icon";
import { Field } from "@ui/primitives/Field";
import { BottomSheet } from "@ui/primitives/BottomSheet";
import { EmptyState } from "@ui/states/EmptyState";
import { ConfirmDialog } from "@ui/primitives/ConfirmDialog";
import { useSelector } from "@data/useStore";
import type { Recurring, Cadence, PartOfDay } from "@data/types";
import {
  recurring,
  CADENCES,
  CADENCE_ORDER,
  PARTS_OF_DAY,
  PART_ORDER,
} from "./recurring.data";
import chip from "@modules/spending/ExpenseSheet.module.css";
import screen from "@modules/spending/SpendingScreen.module.css";
import { cx } from "@lib/cx";

/** Recurring screen (§12). The things you mean to do regularly, without nagging. */

export function RecurringScreen() {
  const list = useSelector((s) => s.recurring);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Recurring | undefined>(undefined);
  const [task, setTask] = useState("");
  const [cadence, setCadence] = useState<Cadence>("daily");
  const [partOfDay, setPartOfDay] = useState<PartOfDay>("any");
  const [error, setError] = useState<string | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<Recurring | undefined>(undefined);

  function reset(r?: Recurring) {
    setEditing(r);
    setTask(r?.task ?? "");
    setCadence(r?.cadence ?? "daily");
    setPartOfDay(r?.partOfDay ?? "any");
    setError(undefined);
  }
  function save() {
    const t = task.trim();
    if (!t) {
      setError("What's the recurring thing?");
      return;
    }
    if (editing) recurring.edit(editing.id, { task: t, cadence, partOfDay });
    else recurring.create({ task: t, cadence, partOfDay });
    setOpen(false);
  }

  const ordered = [...list].reverse();

  return (
    <div className={screen.screen}>
      <header className={screen.header}>
        <div>
          <h1 className={screen.title}>Recurring</h1>
          <p className={screen.subtitle}>Regular intentions, without the nagging.</p>
        </div>
      </header>

      {ordered.length === 0 ? (
        <EmptyState
          illustration="list"
          title="Nothing recurring yet"
          body="Add the things you mean to do regularly, and let the app remember them."
          actionLabel="Add one"
          onAction={() => {
            reset();
            setOpen(true);
          }}
        />
      ) : (
        <>
          <Card heading="Your rhythms">
            {ordered.map((r) => (
              <Row
                key={r.id}
                title={r.task}
                meta={`${CADENCES[r.cadence]} · ${PARTS_OF_DAY[r.partOfDay]}`}
                category="plan"
                onClick={() => {
                  reset(r);
                  setOpen(true);
                }}
                ariaLabel={`Edit ${r.task}`}
                trailing={
                  <button
                    type="button"
                    className={screen.deleteBtn}
                    aria-label={`Delete ${r.task}`}
                    onClick={(ev: React.MouseEvent) => {
                      ev.stopPropagation();
                      setPendingDelete(r);
                    }}
                  >
                    <Icon name="trash" size={18} />
                  </button>
                }
              />
            ))}
          </Card>
          <div className={screen.addRow}>
            <Button
              variant="primary"
              onClick={() => {
                reset();
                setOpen(true);
              }}
            >
              <Icon name="add" size={18} />
              Add one
            </Button>
          </div>
        </>
      )}

      <BottomSheet
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        title={editing ? "Edit recurring" : "Add recurring"}
        footer={
          <>
            <Button variant="ghost" onClick={() => { setOpen(false); }}>
              Cancel
            </Button>
            <Button variant="primary" onClick={save}>
              Save
            </Button>
          </>
        }
      >
        <Field
          label="Task"
          placeholder="Water the plants"
          value={task}
          onChange={(e) => {
            setTask(e.target.value);
          }}
          {...(error ? { error } : {})}
          autoFocus
        />
        <fieldset className={chip.categories}>
          <legend className={chip.legend}>How often</legend>
          <div className={chip.chips}>
            {CADENCE_ORDER.map((c) => (
              <button
                key={c}
                type="button"
                className={cx(chip.chip, cadence === c && chip.chipActive)}
                aria-pressed={cadence === c}
                onClick={() => {
                  setCadence(c);
                }}
              >
                {CADENCES[c]}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className={chip.categories}>
          <legend className={chip.legend}>When</legend>
          <div className={chip.chips}>
            {PART_ORDER.map((p) => (
              <button
                key={p}
                type="button"
                className={cx(chip.chip, partOfDay === p && chip.chipActive)}
                aria-pressed={partOfDay === p}
                onClick={() => {
                  setPartOfDay(p);
                }}
              >
                {PARTS_OF_DAY[p]}
              </button>
            ))}
          </div>
        </fieldset>
      </BottomSheet>

      <ConfirmDialog
        open={pendingDelete !== undefined}
        title="Delete this recurring intention?"
        body="This can't be undone."
        confirmLabel="Delete it"
        onConfirm={() => {
          if (pendingDelete) recurring.remove(pendingDelete.id);
          setPendingDelete(undefined);
        }}
        onCancel={() => {
          setPendingDelete(undefined);
        }}
      />
    </div>
  );
}
