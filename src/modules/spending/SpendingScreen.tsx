import { useState } from "react";
import { Card } from "@ui/primitives/Card";
import { Row } from "@ui/primitives/Row";
import { Button } from "@ui/primitives/Button";
import { Icon } from "@ui/icons/Icon";
import { EmptyState } from "@ui/states/EmptyState";
import { Toast } from "@ui/states/Toast";
import { ConfirmDialog } from "@ui/primitives/ConfirmDialog";
import { useSelector } from "@data/useStore";
import type { Expense } from "@data/types";
import { spending, SPEND_CATEGORIES, formatMoney, monthTotal } from "./spending.data";
import { ExpenseSheet } from "./ExpenseSheet";
import styles from "./SpendingScreen.module.css";

/**
 * Spending screen (Constitution §12, §19 — the Phase 4 reference module surface).
 *
 * The owner surface for money spending. It demonstrates the full module pattern:
 *  - a calm summary (month total) in NEUTRAL ink, never a scoreboard (§6.3)
 *  - a list of expenses as calm rows with a quiet category dot (§6.5, §10)
 *  - edit via the shared sheet; delete via the shared confirm dialog (§17)
 *  - every state: empty teaches & invites (§9), success is quiet & once (§19)
 *  - a single contextual add affordance (§17) — no floating chrome
 *
 * Data is read live from the single source of truth (§16); no local copy.
 */

export function SpendingScreen() {
  const expenses = useSelector((s) => s.spending);
  const total = monthTotal(expenses);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<Expense | undefined>(undefined);
  const [toast, setToast] = useState<string | null>(null);

  function openAdd() {
    setEditing(undefined);
    setSheetOpen(true);
  }
  function openEdit(expense: Expense) {
    setEditing(expense);
    setSheetOpen(true);
  }
  function confirmDelete() {
    if (!pendingDelete) return;
    spending.remove(pendingDelete.id);
    setPendingDelete(undefined);
    setToast("Deleted");
  }

  // Most-recent first for the list (creation order reversed).
  const ordered = [...expenses].reverse();

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Spending</h1>
          <p className={styles.subtitle}>See where the money goes, calmly.</p>
        </div>
      </header>

      <Card>
        <div className={styles.summary}>
          <span className={styles.summaryLabel}>Spent this month</span>
          <span className={styles.summaryValue} data-numeric>
            {formatMoney(total)}
          </span>
        </div>
      </Card>

      {ordered.length === 0 ? (
        <EmptyState
          illustration="money"
          title="No spending yet"
          body="Add something you bought and it'll show up here, calmly."
          actionLabel="Add expense"
          onAction={openAdd}
        />
      ) : (
        <>
          <Card heading="Recent">
            {ordered.map((e) => (
              <Row
                key={e.id}
                title={e.item}
                meta={SPEND_CATEGORIES[e.category].label}
                category={SPEND_CATEGORIES[e.category].family}
                onClick={() => {
                  openEdit(e);
                }}
                ariaLabel={`Edit ${e.item}, ${formatMoney(e.amount)}`}
                trailing={
                  <span className={styles.rowTrailing}>
                    <span data-numeric>{formatMoney(e.amount)}</span>
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      aria-label={`Delete ${e.item}`}
                      onClick={(ev: React.MouseEvent) => {
                        ev.stopPropagation();
                        setPendingDelete(e);
                      }}
                    >
                      <Icon name="trash" size={18} />
                    </button>
                  </span>
                }
              />
            ))}
          </Card>

          <div className={styles.addRow}>
            <Button variant="primary" onClick={openAdd}>
              <Icon name="add" size={18} />
              Add expense
            </Button>
          </div>
        </>
      )}

      <ExpenseSheet
        open={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
        }}
        {...(editing ? { editing } : {})}
      />

      <ConfirmDialog
        open={pendingDelete !== undefined}
        title="Delete this expense?"
        body="This can't be undone."
        confirmLabel="Delete expense"
        onConfirm={confirmDelete}
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
