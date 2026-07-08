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
import type { SleepLog, MoodLevel } from "@data/types";
import { sleep, formatHours } from "./sleep.data";
import { MOOD_LABELS } from "@modules/mood/mood.data";
import chip from "@modules/spending/ExpenseSheet.module.css";
import screen from "@modules/spending/SpendingScreen.module.css";
import { cx } from "@lib/cx";

/** Sleep screen (§12). Treat rest as part of a good life. Hours render neutral (§6.3). */

const LEVELS: MoodLevel[] = [1, 2, 3, 4, 5];
const fmt = (ms: number) =>
  new Date(ms).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

export function SleepScreen() {
  const logs = useSelector((s) => s.sleep);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SleepLog | undefined>(undefined);
  const [hours, setHours] = useState("");
  const [quality, setQuality] = useState<MoodLevel>(3);
  const [error, setError] = useState<string | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<SleepLog | undefined>(undefined);

  function reset(e?: SleepLog) {
    setEditing(e);
    setHours(e ? String(e.hours) : "");
    setQuality(e?.quality ?? 3);
    setError(undefined);
  }
  function save() {
    const h = Number(hours);
    if (!hours.trim() || Number.isNaN(h) || h <= 0 || h > 24) {
      setError("Enter hours between 0 and 24.");
      return;
    }
    if (editing) sleep.edit(editing.id, { hours: h, quality });
    else sleep.create({ date: Date.now(), hours: h, quality });
    setOpen(false);
  }

  const ordered = [...logs].reverse();

  return (
    <div className={screen.screen}>
      <header className={screen.header}>
        <div>
          <h1 className={screen.title}>Sleep</h1>
          <p className={screen.subtitle}>Rest is part of a good life.</p>
        </div>
      </header>

      {ordered.length === 0 ? (
        <EmptyState
          illustration="clear"
          title="No sleep logged yet"
          body="Note last night whenever you like. No need to be precise."
          actionLabel="Log sleep"
          onAction={() => {
            reset();
            setOpen(true);
          }}
        />
      ) : (
        <>
          <Card heading="Recent nights">
            {ordered.map((l) => (
              <Row
                key={l.id}
                title={formatHours(l.hours)}
                meta={`${fmt(l.date)} · ${MOOD_LABELS[l.quality]}`}
                category="health"
                onClick={() => {
                  reset(l);
                  setOpen(true);
                }}
                ariaLabel={`Edit sleep from ${fmt(l.date)}`}
                trailing={
                  <button
                    type="button"
                    className={screen.deleteBtn}
                    aria-label="Delete sleep log"
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
              Log sleep
            </Button>
          </div>
        </>
      )}

      <BottomSheet
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        title={editing ? "Edit sleep" : "Log sleep"}
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
          label="Hours"
          placeholder="7.5"
          inputMode="decimal"
          value={hours}
          onChange={(e) => {
            setHours(e.target.value);
          }}
          {...(error ? { error } : {})}
          autoFocus
        />
        <fieldset className={chip.categories}>
          <legend className={chip.legend}>How rested</legend>
          <div className={chip.chips}>
            {LEVELS.map((l) => (
              <button
                key={l}
                type="button"
                className={cx(chip.chip, quality === l && chip.chipActive)}
                aria-pressed={quality === l}
                onClick={() => {
                  setQuality(l);
                }}
              >
                {MOOD_LABELS[l]}
              </button>
            ))}
          </div>
        </fieldset>
      </BottomSheet>

      <ConfirmDialog
        open={pendingDelete !== undefined}
        title="Delete this sleep log?"
        body="This can't be undone."
        confirmLabel="Delete log"
        onConfirm={() => {
          if (pendingDelete) sleep.remove(pendingDelete.id);
          setPendingDelete(undefined);
        }}
        onCancel={() => {
          setPendingDelete(undefined);
        }}
      />
    </div>
  );
}
