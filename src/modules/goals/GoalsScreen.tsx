import { useState } from "react";
import { Card } from "@ui/primitives/Card";
import { Button } from "@ui/primitives/Button";
import { Icon } from "@ui/icons/Icon";
import { Field } from "@ui/primitives/Field";
import { Progress } from "@ui/primitives/Progress";
import { BottomSheet } from "@ui/primitives/BottomSheet";
import { EmptyState } from "@ui/states/EmptyState";
import { ConfirmDialog } from "@ui/primitives/ConfirmDialog";
import { useSelector } from "@data/useStore";
import type { Goal, GoalArea } from "@data/types";
import { goals, GOAL_AREAS, GOAL_AREA_ORDER } from "./goals.data";
import chip from "@modules/spending/ExpenseSheet.module.css";
import screen from "@modules/spending/SpendingScreen.module.css";
import card from "@modules/savings/ProgressCard.module.css";
import { cx } from "@lib/cx";

/** Goals screen (§12). A few that matter, with calm self-set progress. The accent
 *  on the bar is legitimate — it's the person's own target (§6.3). */

const STEPS = [0, 0.25, 0.5, 0.75, 1];
const stepLabel = (v: number) => `${String(Math.round(v * 100))}%`;

export function GoalsScreen() {
  const list = useSelector((s) => s.goals);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | undefined>(undefined);
  const [title, setTitle] = useState("");
  const [area, setArea] = useState<GoalArea>("plan");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<Goal | undefined>(undefined);

  function reset(g?: Goal) {
    setEditing(g);
    setTitle(g?.title ?? "");
    setArea(g?.area ?? "plan");
    setProgress(g?.progress ?? 0);
    setError(undefined);
  }
  function save() {
    const t = title.trim();
    if (!t) {
      setError("Name the goal.");
      return;
    }
    if (editing) goals.edit(editing.id, { title: t, area, progress });
    else goals.create({ title: t, area, progress });
    setOpen(false);
  }

  const ordered = [...list].reverse();

  return (
    <div className={screen.screen}>
      <header className={screen.header}>
        <div>
          <h1 className={screen.title}>Goals</h1>
          <p className={screen.subtitle}>A few that matter. No pressure.</p>
        </div>
      </header>

      {ordered.length === 0 ? (
        <EmptyState
          illustration="clear"
          title="No goals yet"
          body="Pick one or two things you're quietly working toward. That's enough."
          actionLabel="Add a goal"
          onAction={() => {
            reset();
            setOpen(true);
          }}
        />
      ) : (
        <>
          {ordered.map((g) => (
            <Card key={g.id}>
              <button
                type="button"
                className={card.cardButton}
                onClick={() => {
                  reset(g);
                  setOpen(true);
                }}
                aria-label={`Edit ${g.title}`}
              >
                <div className={card.cardHead}>
                  <span className={card.name}>{g.title}</span>
                  <span className={card.amounts} data-numeric>
                    {stepLabel(g.progress)}
                  </span>
                </div>
                <Progress value={g.progress} label={`${g.title} progress`} />
              </button>
              <div className={card.cardActions}>
                <button
                  type="button"
                  className={screen.deleteBtn}
                  aria-label={`Delete ${g.title}`}
                  onClick={() => {
                    setPendingDelete(g);
                  }}
                >
                  <Icon name="trash" size={18} />
                </button>
              </div>
            </Card>
          ))}
          <div className={screen.addRow}>
            <Button
              variant="primary"
              onClick={() => {
                reset();
                setOpen(true);
              }}
            >
              <Icon name="add" size={18} />
              Add a goal
            </Button>
          </div>
        </>
      )}

      <BottomSheet
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        title={editing ? "Edit goal" : "Add a goal"}
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
          label="Goal"
          placeholder="Read 12 books this year"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
          }}
          {...(error ? { error } : {})}
          autoFocus
        />
        <fieldset className={chip.categories}>
          <legend className={chip.legend}>Area</legend>
          <div className={chip.chips}>
            {GOAL_AREA_ORDER.map((a) => (
              <button
                key={a}
                type="button"
                className={cx(chip.chip, area === a && chip.chipActive)}
                aria-pressed={area === a}
                onClick={() => {
                  setArea(a);
                }}
              >
                {GOAL_AREAS[a].label}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className={chip.categories}>
          <legend className={chip.legend}>Progress</legend>
          <div className={chip.chips}>
            {STEPS.map((v) => (
              <button
                key={v}
                type="button"
                className={cx(chip.chip, progress === v && chip.chipActive)}
                aria-pressed={progress === v}
                onClick={() => {
                  setProgress(v);
                }}
              >
                {stepLabel(v)}
              </button>
            ))}
          </div>
        </fieldset>
      </BottomSheet>

      <ConfirmDialog
        open={pendingDelete !== undefined}
        title="Delete this goal?"
        body="This can't be undone."
        confirmLabel="Delete goal"
        onConfirm={() => {
          if (pendingDelete) goals.remove(pendingDelete.id);
          setPendingDelete(undefined);
        }}
        onCancel={() => {
          setPendingDelete(undefined);
        }}
      />
    </div>
  );
}
