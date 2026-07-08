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
import type { MoodLog, MoodLevel } from "@data/types";
import { mood, MOOD_LABELS } from "./mood.data";
import chip from "@modules/spending/ExpenseSheet.module.css";
import screen from "@modules/spending/SpendingScreen.module.css";
import { cx } from "@lib/cx";

/**
 * Mood screen (§12, §13) — notice how you actually feel, judgment-free. Mood and
 * energy render as neutral words, never a red/green scoreboard (§6.3). A missed
 * day is not a failure; there is simply no entry.
 */

const LEVELS: MoodLevel[] = [1, 2, 3, 4, 5];

function formatDay(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

export function MoodScreen() {
  const logs = useSelector((s) => s.mood);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MoodLog | undefined>(undefined);
  const [moodLevel, setMoodLevel] = useState<MoodLevel>(3);
  const [energy, setEnergy] = useState<MoodLevel>(3);
  const [note, setNote] = useState("");
  const [pendingDelete, setPendingDelete] = useState<MoodLog | undefined>(undefined);

  function reset(e?: MoodLog) {
    setEditing(e);
    setMoodLevel(e?.mood ?? 3);
    setEnergy(e?.energy ?? 3);
    setNote(e?.note ?? "");
  }
  function save() {
    if (editing) mood.edit(editing.id, { mood: moodLevel, energy, note: note.trim() });
    else mood.create({ date: Date.now(), mood: moodLevel, energy, note: note.trim() });
    setOpen(false);
  }

  const ordered = [...logs].reverse();

  return (
    <div className={screen.screen}>
      <header className={screen.header}>
        <div>
          <h1 className={screen.title}>Mood</h1>
          <p className={screen.subtitle}>Notice how you feel. No judgment.</p>
        </div>
      </header>

      {ordered.length === 0 ? (
        <EmptyState
          illustration="clear"
          title="No check-ins yet"
          body="However you're feeling right now is worth noting. Start whenever."
          actionLabel="How are you?"
          onAction={() => {
            reset();
            setOpen(true);
          }}
        />
      ) : (
        <>
          <Card heading="Recent">
            {ordered.map((m) => (
              <Row
                key={m.id}
                title={`${MOOD_LABELS[m.mood]} · ${MOOD_LABELS[m.energy]} energy`}
                meta={(m.note?.length ?? 0) > 0 ? `${formatDay(m.date)} · ${String(m.note)}` : formatDay(m.date)}
                category="health"
                onClick={() => {
                  reset(m);
                  setOpen(true);
                }}
                ariaLabel={`Edit check-in from ${formatDay(m.date)}`}
                trailing={
                  <button
                    type="button"
                    className={screen.deleteBtn}
                    aria-label="Delete check-in"
                    onClick={(ev: React.MouseEvent) => {
                      ev.stopPropagation();
                      setPendingDelete(m);
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
              Add check-in
            </Button>
          </div>
        </>
      )}

      <BottomSheet
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        title={editing ? "Edit check-in" : "How are you?"}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={save}>
              Save
            </Button>
          </>
        }
      >
        <fieldset className={chip.categories}>
          <legend className={chip.legend}>Mood</legend>
          <div className={chip.chips}>
            {LEVELS.map((l) => (
              <button
                key={l}
                type="button"
                className={cx(chip.chip, moodLevel === l && chip.chipActive)}
                aria-pressed={moodLevel === l}
                onClick={() => {
                  setMoodLevel(l);
                }}
              >
                {MOOD_LABELS[l]}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className={chip.categories}>
          <legend className={chip.legend}>Energy</legend>
          <div className={chip.chips}>
            {LEVELS.map((l) => (
              <button
                key={l}
                type="button"
                className={cx(chip.chip, energy === l && chip.chipActive)}
                aria-pressed={energy === l}
                onClick={() => {
                  setEnergy(l);
                }}
              >
                {MOOD_LABELS[l]}
              </button>
            ))}
          </div>
        </fieldset>
        <Field
          label="Anything on your mind? (optional)"
          placeholder="A word or two…"
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
          }}
        />
      </BottomSheet>

      <ConfirmDialog
        open={pendingDelete !== undefined}
        title="Delete this check-in?"
        body="This can't be undone."
        confirmLabel="Delete check-in"
        onConfirm={() => {
          if (pendingDelete) mood.remove(pendingDelete.id);
          setPendingDelete(undefined);
        }}
        onCancel={() => {
          setPendingDelete(undefined);
        }}
      />
    </div>
  );
}
