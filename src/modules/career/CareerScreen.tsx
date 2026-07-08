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
import type { Application, CareerStage } from "@data/types";
import { career, CAREER_STAGES, CAREER_STAGE_ORDER } from "./career.data";
import chip from "@modules/spending/ExpenseSheet.module.css";
import screen from "@modules/spending/SpendingScreen.module.css";
import { cx } from "@lib/cx";

/** Career screen (§12). Track a job search calmly, stage by stage. An optional
 *  date (e.g. an interview) surfaces on Today (§13). */

function toDateInput(ms: number): string {
  const d = new Date(ms);
  return `${String(d.getFullYear())}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function CareerScreen() {
  const apps = useSelector((s) => s.career);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Application | undefined>(undefined);
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [stage, setStage] = useState<CareerStage>("interested");
  const [hasDate, setHasDate] = useState(false);
  const [date, setDate] = useState(toDateInput(Date.now()));
  const [errors, setErrors] = useState<{ role?: string; company?: string }>({});
  const [pendingDelete, setPendingDelete] = useState<Application | undefined>(undefined);

  function reset(e?: Application) {
    setEditing(e);
    setRole(e?.role ?? "");
    setCompany(e?.company ?? "");
    setStage(e?.stage ?? "interested");
    setHasDate(e?.date !== undefined);
    setDate(toDateInput(e?.date ?? Date.now()));
    setErrors({});
  }
  function save() {
    const r = role.trim();
    const c = company.trim();
    const err: { role?: string; company?: string } = {};
    if (!r) err.role = "What's the role?";
    if (!c) err.company = "Which company?";
    if (err.role || err.company) {
      setErrors(err);
      return;
    }
    const base = { role: r, company: c, stage };
    const withDate = hasDate ? { ...base, date: new Date(`${date}T00:00:00`).getTime() } : base;
    if (editing) career.edit(editing.id, withDate);
    else career.create(withDate);
    setOpen(false);
  }

  const ordered = [...apps].reverse();

  return (
    <div className={screen.screen}>
      <header className={screen.header}>
        <div>
          <h1 className={screen.title}>Career</h1>
          <p className={screen.subtitle}>Track a job search, calmly.</p>
        </div>
      </header>

      {ordered.length === 0 ? (
        <EmptyState
          illustration="list"
          title="No applications yet"
          body="Add a role you're interested in and move it along as things happen."
          actionLabel="Add application"
          onAction={() => {
            reset();
            setOpen(true);
          }}
        />
      ) : (
        <>
          <Card heading="Your applications">
            {ordered.map((a) => (
              <Row
                key={a.id}
                title={a.role}
                meta={`${a.company} · ${CAREER_STAGES[a.stage]}`}
                category="life"
                onClick={() => {
                  reset(a);
                  setOpen(true);
                }}
                ariaLabel={`Edit ${a.role} at ${a.company}`}
                trailing={
                  <button
                    type="button"
                    className={screen.deleteBtn}
                    aria-label={`Delete ${a.role}`}
                    onClick={(ev: React.MouseEvent) => {
                      ev.stopPropagation();
                      setPendingDelete(a);
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
              Add application
            </Button>
          </div>
        </>
      )}

      <BottomSheet
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        title={editing ? "Edit application" : "Add application"}
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
          label="Role"
          placeholder="Junior designer"
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
          }}
          {...(errors.role ? { error: errors.role } : {})}
          autoFocus
        />
        <Field
          label="Company"
          placeholder="Acme"
          value={company}
          onChange={(e) => {
            setCompany(e.target.value);
          }}
          {...(errors.company ? { error: errors.company } : {})}
        />
        <fieldset className={chip.categories}>
          <legend className={chip.legend}>Stage</legend>
          <div className={chip.chips}>
            {CAREER_STAGE_ORDER.map((s) => (
              <button
                key={s}
                type="button"
                className={cx(chip.chip, stage === s && chip.chipActive)}
                aria-pressed={stage === s}
                onClick={() => {
                  setStage(s);
                }}
              >
                {CAREER_STAGES[s]}
              </button>
            ))}
          </div>
        </fieldset>
        <label className={chip.legend} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input
            type="checkbox"
            checked={hasDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setHasDate(e.target.checked);
            }}
          />
          Add a date (e.g. an interview)
        </label>
        {hasDate && (
          <Field
            label="Date"
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
            }}
          />
        )}
      </BottomSheet>

      <ConfirmDialog
        open={pendingDelete !== undefined}
        title="Delete this application?"
        body="This can't be undone."
        confirmLabel="Delete application"
        onConfirm={() => {
          if (pendingDelete) career.remove(pendingDelete.id);
          setPendingDelete(undefined);
        }}
        onCancel={() => {
          setPendingDelete(undefined);
        }}
      />
    </div>
  );
}
