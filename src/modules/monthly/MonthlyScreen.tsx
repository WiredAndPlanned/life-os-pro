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
import type { MonthNote } from "@data/types";
import { monthly } from "./monthly.data";
import screen from "@modules/spending/SpendingScreen.module.css";

/** Monthly screen (§12). The month at a glance; a dated note per day. Future notes
 *  surface on Today (§13). */

function toDateInput(ms: number): string {
  const d = new Date(ms);
  return `${String(d.getFullYear())}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}
const fmt = (ms: number) =>
  new Date(ms).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

export function MonthlyScreen() {
  const notes = useSelector((s) => s.monthly);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MonthNote | undefined>(undefined);
  const [date, setDate] = useState(toDateInput(Date.now()));
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<MonthNote | undefined>(undefined);

  function reset(n?: MonthNote) {
    setEditing(n);
    setDate(toDateInput(n?.date ?? Date.now()));
    setNote(n?.note ?? "");
    setError(undefined);
  }
  function save() {
    const t = note.trim();
    if (!t) {
      setError("What's happening that day?");
      return;
    }
    const ms = new Date(`${date}T00:00:00`).getTime();
    if (editing) monthly.edit(editing.id, { date: ms, note: t });
    else monthly.create({ date: ms, note: t });
    setOpen(false);
  }

  const ordered = [...notes].sort((a, b) => a.date - b.date);

  return (
    <div className={screen.screen}>
      <header className={screen.header}>
        <div>
          <h1 className={screen.title}>Monthly</h1>
          <p className={screen.subtitle}>The month at a glance.</p>
        </div>
      </header>

      {ordered.length === 0 ? (
        <EmptyState
          illustration="calendar"
          title="Nothing noted this month"
          body="Add the dates that matter — birthdays, deadlines, plans — and they'll show on Today as they near."
          actionLabel="Add a note"
          onAction={() => {
            reset();
            setOpen(true);
          }}
        />
      ) : (
        <>
          <Card heading="Coming up">
            {ordered.map((n) => (
              <Row
                key={n.id}
                title={n.note}
                meta={fmt(n.date)}
                category="plan"
                onClick={() => {
                  reset(n);
                  setOpen(true);
                }}
                ariaLabel={`Edit note for ${fmt(n.date)}`}
                trailing={
                  <button
                    type="button"
                    className={screen.deleteBtn}
                    aria-label="Delete note"
                    onClick={(ev: React.MouseEvent) => {
                      ev.stopPropagation();
                      setPendingDelete(n);
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
              Add a note
            </Button>
          </div>
        </>
      )}

      <BottomSheet
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        title={editing ? "Edit note" : "Add a note"}
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
          label="Date"
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
          }}
          autoFocus
        />
        <Field
          label="Note"
          placeholder="Mum's birthday"
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
          }}
          {...(error ? { error } : {})}
        />
      </BottomSheet>

      <ConfirmDialog
        open={pendingDelete !== undefined}
        title="Delete this note?"
        body="This can't be undone."
        confirmLabel="Delete note"
        onConfirm={() => {
          if (pendingDelete) monthly.remove(pendingDelete.id);
          setPendingDelete(undefined);
        }}
        onCancel={() => {
          setPendingDelete(undefined);
        }}
      />
    </div>
  );
}
