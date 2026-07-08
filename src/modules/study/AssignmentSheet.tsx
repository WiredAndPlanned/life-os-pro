import { useState } from "react";
import { BottomSheet } from "@ui/primitives/BottomSheet";
import { Field } from "@ui/primitives/Field";
import { Button } from "@ui/primitives/Button";
import type { Assignment, StudyStatus } from "@data/types";
import { study, STUDY_STATUS, STUDY_STATUS_ORDER } from "./study.data";
import styles from "@modules/spending/ExpenseSheet.module.css";
import { cx } from "@lib/cx";

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: Assignment;
}

function toDateInput(ms: number): string {
  const d = new Date(ms);
  return `${String(d.getFullYear())}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function AssignmentSheet({ open, onClose, editing }: Props) {
  const [subject, setSubject] = useState(editing?.subject ?? "");
  const [task, setTask] = useState(editing?.task ?? "");
  const [due, setDue] = useState(toDateInput(editing?.due ?? Date.now()));
  const [status, setStatus] = useState<StudyStatus>(editing?.status ?? "todo");
  const [errors, setErrors] = useState<{ subject?: string; task?: string }>({});

  const key = `${open ? "o" : "c"}:${editing?.id ?? "new"}`;
  const [seen, setSeen] = useState(key);
  if (seen !== key) {
    setSeen(key);
    setSubject(editing?.subject ?? "");
    setTask(editing?.task ?? "");
    setDue(toDateInput(editing?.due ?? Date.now()));
    setStatus(editing?.status ?? "todo");
    setErrors({});
  }

  function handleSave() {
    const s = subject.trim();
    const t = task.trim();
    const e: { subject?: string; task?: string } = {};
    if (!s) e.subject = "Which subject is this for?";
    if (!t) e.task = "Give the task a short name.";
    if (e.subject || e.task) {
      setErrors(e);
      return;
    }
    const dueMs = new Date(`${due}T00:00:00`).getTime();
    if (editing) {
      study.edit(editing.id, { subject: s, task: t, due: dueMs, status });
    } else {
      study.create({ subject: s, task: t, due: dueMs, status });
    }
    onClose();
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={editing ? "Edit assignment" : "Add assignment"}
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
        label="Subject"
        placeholder="History"
        value={subject}
        onChange={(e) => {
          setSubject(e.target.value);
        }}
        {...(errors.subject ? { error: errors.subject } : {})}
        autoFocus
      />
      <Field
        label="Task"
        placeholder="Essay on the Cold War"
        value={task}
        onChange={(e) => {
          setTask(e.target.value);
        }}
        {...(errors.task ? { error: errors.task } : {})}
      />
      <Field
        label="Due"
        type="date"
        value={due}
        onChange={(e) => {
          setDue(e.target.value);
        }}
      />
      <fieldset className={styles.categories}>
        <legend className={styles.legend}>Status</legend>
        <div className={styles.chips}>
          {STUDY_STATUS_ORDER.map((st) => (
            <button
              key={st}
              type="button"
              className={cx(styles.chip, status === st && styles.chipActive)}
              aria-pressed={status === st}
              onClick={() => {
                setStatus(st);
              }}
            >
              {STUDY_STATUS[st]}
            </button>
          ))}
        </div>
      </fieldset>
    </BottomSheet>
  );
}
