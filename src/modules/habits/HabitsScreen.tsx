import { useState } from "react";
import { Card } from "@ui/primitives/Card";
import { Button } from "@ui/primitives/Button";
import { Icon } from "@ui/icons/Icon";
import { Field } from "@ui/primitives/Field";
import { BottomSheet } from "@ui/primitives/BottomSheet";
import { EmptyState } from "@ui/states/EmptyState";
import { ConfirmDialog } from "@ui/primitives/ConfirmDialog";
import { useSelector } from "@data/useStore";
import type { Habit } from "@data/types";
import { habits, isMarkedToday, toggleToday, currentStreak } from "./habits.data";
import styles from "./HabitsScreen.module.css";
import screen from "@modules/spending/SpendingScreen.module.css";
import { cx } from "@lib/cx";

/**
 * Habits screen (§12, §13) — build gentle consistency, streaks WITHOUT pressure.
 *
 * Each habit is a tappable check for today plus a calm streak count. There is no
 * "you broke your streak," no guilt, no red — a missed day is simply unmarked
 * (§4.1, §13). Adding uses a tiny sheet (just a name).
 */

export function HabitsScreen() {
  const list = useSelector((s) => s.habits);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<Habit | undefined>(undefined);

  function addHabit() {
    const n = name.trim();
    if (!n) {
      setError("Give your habit a name.");
      return;
    }
    habits.create({ name: n, marks: [] });
    setName("");
    setError(undefined);
    setSheetOpen(false);
  }

  function toggle(h: Habit) {
    habits.edit(h.id, { marks: toggleToday(h) });
  }

  const ordered = [...list].reverse();

  return (
    <div className={screen.screen}>
      <header className={screen.header}>
        <div>
          <h1 className={screen.title}>Habits</h1>
          <p className={screen.subtitle}>Gentle consistency. No streak to break.</p>
        </div>
      </header>

      {ordered.length === 0 ? (
        <EmptyState
          illustration="list"
          title="No habits yet"
          body="Pick one small thing you'd like to do more often. That's plenty."
          actionLabel="Add a habit"
          onAction={() => {
            setSheetOpen(true);
          }}
        />
      ) : (
        <>
          <Card>
            {ordered.map((h) => {
              const done = isMarkedToday(h);
              const streak = currentStreak(h);
              return (
                <div key={h.id} className={styles.habitRow}>
                  <button
                    type="button"
                    className={cx(styles.check, done && styles.checked)}
                    aria-pressed={done}
                    aria-label={`Mark ${h.name} for today`}
                    onClick={() => {
                      toggle(h);
                    }}
                  >
                    {done && <Icon name="check" size={18} />}
                  </button>
                  <div className={styles.habitText}>
                    <span className={styles.habitName}>{h.name}</span>
                    <span className={styles.habitMeta}>
                      {streak > 0 ? `${String(streak)}-day streak` : "Start today"}
                    </span>
                  </div>
                  <button
                    type="button"
                    className={screen.deleteBtn}
                    aria-label={`Delete ${h.name}`}
                    onClick={() => {
                      setPendingDelete(h);
                    }}
                  >
                    <Icon name="trash" size={18} />
                  </button>
                </div>
              );
            })}
          </Card>
          <div className={screen.addRow}>
            <Button
              variant="primary"
              onClick={() => {
                setSheetOpen(true);
              }}
            >
              <Icon name="add" size={18} />
              Add a habit
            </Button>
          </div>
        </>
      )}

      <BottomSheet
        open={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
          setError(undefined);
        }}
        title="Add a habit"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setSheetOpen(false);
                setError(undefined);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={addHabit}>
              Save
            </Button>
          </>
        }
      >
        <Field
          label="Habit"
          placeholder="Drink water, read, stretch…"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          {...(error ? { error } : {})}
          autoFocus
        />
      </BottomSheet>

      <ConfirmDialog
        open={pendingDelete !== undefined}
        title="Delete this habit?"
        body="Your history for it will be removed. This can't be undone."
        confirmLabel="Delete habit"
        onConfirm={() => {
          if (pendingDelete) habits.remove(pendingDelete.id);
          setPendingDelete(undefined);
        }}
        onCancel={() => {
          setPendingDelete(undefined);
        }}
      />
    </div>
  );
}
