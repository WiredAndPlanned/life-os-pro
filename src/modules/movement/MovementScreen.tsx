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
import type { MovementLog, MovementType } from "@data/types";
import { movement, MOVEMENT_TYPES, MOVEMENT_ORDER } from "./movement.data";
import chip from "@modules/spending/ExpenseSheet.module.css";
import screen from "@modules/spending/SpendingScreen.module.css";
import { cx } from "@lib/cx";

/** Movement screen (§12). Move how you like; log it simply. Minutes render neutral (§6.3). */

const fmt = (ms: number) =>
  new Date(ms).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

export function MovementScreen() {
  const logs = useSelector((s) => s.movement);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MovementLog | undefined>(undefined);
  const [type, setType] = useState<MovementType>("walk");
  const [minutes, setMinutes] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<MovementLog | undefined>(undefined);

  function reset(e?: MovementLog) {
    setEditing(e);
    setType(e?.type ?? "walk");
    setMinutes(e ? String(e.minutes) : "");
    setError(undefined);
  }
  function save() {
    const m = Number(minutes);
    if (!minutes.trim() || Number.isNaN(m) || m <= 0) {
      setError("Enter minutes greater than zero.");
      return;
    }
    if (editing) movement.edit(editing.id, { type, minutes: m });
    else movement.create({ date: Date.now(), type, minutes: m });
    setOpen(false);
  }

  const ordered = [...logs].reverse();

  return (
    <div className={screen.screen}>
      <header className={screen.header}>
        <div>
          <h1 className={screen.title}>Movement</h1>
          <p className={screen.subtitle}>Move how you like. Log it simply.</p>
        </div>
      </header>

      {ordered.length === 0 ? (
        <EmptyState
          illustration="list"
          title="Nothing logged yet"
          body="A walk counts. So does dancing in your room. Add whatever you did."
          actionLabel="Log movement"
          onAction={() => {
            reset();
            setOpen(true);
          }}
        />
      ) : (
        <>
          <Card heading="Recent">
            {ordered.map((l) => (
              <Row
                key={l.id}
                title={MOVEMENT_TYPES[l.type]}
                meta={`${fmt(l.date)} · ${String(l.minutes)} min`}
                category="health"
                onClick={() => {
                  reset(l);
                  setOpen(true);
                }}
                ariaLabel={`Edit ${MOVEMENT_TYPES[l.type]} from ${fmt(l.date)}`}
                trailing={
                  <button
                    type="button"
                    className={screen.deleteBtn}
                    aria-label="Delete movement log"
                    onClick={(ev: React.MouseEvent) => {
                      ev.stopPropagation();
                      setPendingDelete(l);
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
              Log movement
            </Button>
          </div>
        </>
      )}

      <BottomSheet
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        title={editing ? "Edit movement" : "Log movement"}
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
        <fieldset className={chip.categories}>
          <legend className={chip.legend}>Type</legend>
          <div className={chip.chips}>
            {MOVEMENT_ORDER.map((t) => (
              <button
                key={t}
                type="button"
                className={cx(chip.chip, type === t && chip.chipActive)}
                aria-pressed={type === t}
                onClick={() => {
                  setType(t);
                }}
              >
                {MOVEMENT_TYPES[t]}
              </button>
            ))}
          </div>
        </fieldset>
        <Field
          label="Minutes"
          placeholder="30"
          inputMode="numeric"
          value={minutes}
          onChange={(e) => {
            setMinutes(e.target.value);
          }}
          {...(error ? { error } : {})}
        />
      </BottomSheet>

      <ConfirmDialog
        open={pendingDelete !== undefined}
        title="Delete this movement log?"
        body="This can't be undone."
        confirmLabel="Delete log"
        onConfirm={() => {
          if (pendingDelete) movement.remove(pendingDelete.id);
          setPendingDelete(undefined);
        }}
        onCancel={() => {
          setPendingDelete(undefined);
        }}
      />
    </div>
  );
}
