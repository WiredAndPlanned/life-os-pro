import { useState } from "react";
import { Card } from "@ui/primitives/Card";
import { Row } from "@ui/primitives/Row";
import { Button } from "@ui/primitives/Button";
import { Icon } from "@ui/icons/Icon";
import { EmptyState } from "@ui/states/EmptyState";
import { Toast } from "@ui/states/Toast";
import { ConfirmDialog } from "@ui/primitives/ConfirmDialog";
import { useSelector } from "@data/useStore";
import type { Assignment } from "@data/types";
import { study, STUDY_STATUS, dueLabel } from "./study.data";
import { AssignmentSheet } from "./AssignmentSheet";
import styles from "@modules/spending/SpendingScreen.module.css";

/**
 * Study screen (§12, §15) — the deadline safety-net's home. Assignments sorted
 * by due date; unfinished ones surface on Today automatically (§13). Full CRUD,
 * all states, calm voice — no urgency, deadlines stated not alarmed (§4.1).
 */

export function StudyScreen() {
  const assignments = useSelector((s) => s.study);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Assignment | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<Assignment | undefined>(undefined);
  const [toast, setToast] = useState<string | null>(null);

  function openAdd() {
    setEditing(undefined);
    setSheetOpen(true);
  }

  // Unfinished first (by due date), finished last.
  const ordered = [...assignments].sort((a, b) => {
    if (a.status === "done" && b.status !== "done") return 1;
    if (b.status === "done" && a.status !== "done") return -1;
    return a.due - b.due;
  });

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Study</h1>
          <p className={styles.subtitle}>Never lose a deadline to a different app.</p>
        </div>
      </header>

      {ordered.length === 0 ? (
        <EmptyState
          illustration="list"
          title="No assignments yet"
          body="Add one and its deadline will show up on Today as it gets close."
          actionLabel="Add assignment"
          onAction={openAdd}
        />
      ) : (
        <>
          <Card heading="Your assignments">
            {ordered.map((a) => (
              <Row
                key={a.id}
                title={a.task}
                meta={`${a.subject} · ${a.status === "done" ? STUDY_STATUS.done : dueLabel(a.due)}`}
                category="plan"
                onClick={() => {
                  setEditing(a);
                  setSheetOpen(true);
                }}
                ariaLabel={`Edit ${a.task}`}
                trailing={
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    aria-label={`Delete ${a.task}`}
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
          <div className={styles.addRow}>
            <Button variant="primary" onClick={openAdd}>
              <Icon name="add" size={18} />
              Add assignment
            </Button>
          </div>
        </>
      )}

      <AssignmentSheet
        open={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
        }}
        {...(editing ? { editing } : {})}
      />
      <ConfirmDialog
        open={pendingDelete !== undefined}
        title="Delete this assignment?"
        body="This can't be undone."
        confirmLabel="Delete assignment"
        onConfirm={() => {
          if (pendingDelete) study.remove(pendingDelete.id);
          setPendingDelete(undefined);
          setToast("Deleted");
        }}
        onCancel={() => {
          setPendingDelete(undefined);
        }}
      />
      {toast && (
        <div className={styles.toastWrap}>
          <Toast
            message={toast}
            onDismiss={() => {
              setToast(null);
            }}
          />
        </div>
      )}
    </div>
  );
}
