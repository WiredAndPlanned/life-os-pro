import { useState } from "react";
import { Card } from "@ui/primitives/Card";
import { Button } from "@ui/primitives/Button";
import { Icon } from "@ui/icons/Icon";
import { Progress } from "@ui/primitives/Progress";
import { EmptyState } from "@ui/states/EmptyState";
import { Toast } from "@ui/states/Toast";
import { ConfirmDialog } from "@ui/primitives/ConfirmDialog";
import { useSelector } from "@data/useStore";
import type { Debt } from "@data/types";
import { formatMoney } from "@modules/spending/spending.data";
import { debt, paidFraction } from "@modules/savings/savingsDebt.data";
import { DebtSheet } from "./DebtSheet";
import screen from "@modules/spending/SpendingScreen.module.css";
import styles from "@modules/savings/ProgressCard.module.css";

/**
 * Debt screen (§12). "Face debt without dread; watch it shrink." Shows what's
 * LEFT (neutral) and a calm progress-paid bar — never a red alarm (§6.3). The
 * accent is legitimate here: paying down is the person's own chosen progress.
 */

export function DebtScreen() {
  const debts = useSelector((s) => s.debt);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Debt | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<Debt | undefined>(undefined);
  const [toast, setToast] = useState<string | null>(null);

  function openAdd() {
    setEditing(undefined);
    setSheetOpen(true);
  }

  const ordered = [...debts].reverse();

  return (
    <div className={screen.screen}>
      <header className={screen.header}>
        <div>
          <h1 className={screen.title}>Debt</h1>
          <p className={screen.subtitle}>Face it without dread. Watch it shrink.</p>
        </div>
      </header>

      {ordered.length === 0 ? (
        <EmptyState
          illustration="money"
          title="No debt tracked"
          body="If you're paying something off, add it here and watch it get smaller."
          actionLabel="Add debt"
          onAction={openAdd}
        />
      ) : (
        <>
          {ordered.map((d) => (
            <Card key={d.id}>
              <button
                type="button"
                className={styles.cardButton}
                onClick={() => {
                  setEditing(d);
                  setSheetOpen(true);
                }}
                aria-label={`Edit ${d.name}`}
              >
                <div className={styles.cardHead}>
                  <span className={styles.name}>{d.name}</span>
                  <span className={styles.amounts} data-numeric>
                    {formatMoney(d.total - d.paid)} <span className={styles.of}>left</span>
                  </span>
                </div>
                <Progress value={paidFraction(d)} label={`${d.name} paid off`} />
              </button>
              <div className={styles.cardActions}>
                <button
                  type="button"
                  className={screen.deleteBtn}
                  aria-label={`Delete ${d.name}`}
                  onClick={() => {
                    setPendingDelete(d);
                  }}
                >
                  <Icon name="trash" size={18} />
                </button>
              </div>
            </Card>
          ))}
          <div className={screen.addRow}>
            <Button variant="primary" onClick={openAdd}>
              <Icon name="add" size={18} />
              Add debt
            </Button>
          </div>
        </>
      )}

      <DebtSheet
        open={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
        }}
        {...(editing ? { editing } : {})}
      />
      <ConfirmDialog
        open={pendingDelete !== undefined}
        title="Delete this debt?"
        body="This can't be undone."
        confirmLabel="Delete debt"
        onConfirm={() => {
          if (pendingDelete) debt.remove(pendingDelete.id);
          setPendingDelete(undefined);
          setToast("Deleted");
        }}
        onCancel={() => {
          setPendingDelete(undefined);
        }}
      />
      {toast && (
        <div className={screen.toastWrap}>
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
