import { useState } from "react";
import { Card } from "@ui/primitives/Card";
import { Button } from "@ui/primitives/Button";
import { Icon } from "@ui/icons/Icon";
import { Progress } from "@ui/primitives/Progress";
import { EmptyState } from "@ui/states/EmptyState";
import { Toast } from "@ui/states/Toast";
import { ConfirmDialog } from "@ui/primitives/ConfirmDialog";
import { useSelector } from "@data/useStore";
import type { SavingsGoal } from "@data/types";
import { formatMoney } from "@modules/spending/spending.data";
import { savings, savedFraction } from "./savingsDebt.data";
import { SavingsSheet } from "./SavingsSheet";
import screen from "@modules/spending/SpendingScreen.module.css";
import styles from "./ProgressCard.module.css";

/**
 * Savings screen (§12). Each goal shows progress toward a target the person set
 * — the one place the accent may color a person's own chosen target (§6.3).
 * Amounts render neutral; the bar is calm, never a red/green gauge.
 */

export function SavingsScreen() {
  const goals = useSelector((s) => s.savings);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<SavingsGoal | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<SavingsGoal | undefined>(undefined);
  const [toast, setToast] = useState<string | null>(null);

  function openAdd() {
    setEditing(undefined);
    setSheetOpen(true);
  }

  const ordered = [...goals].reverse();

  return (
    <div className={screen.screen}>
      <header className={screen.header}>
        <div>
          <h1 className={screen.title}>Savings</h1>
          <p className={screen.subtitle}>Save toward something you chose.</p>
        </div>
      </header>

      {ordered.length === 0 ? (
        <EmptyState
          illustration="money"
          title="Nothing saved toward yet"
          body="Pick something you're saving for and watch it get closer, calmly."
          actionLabel="Add savings goal"
          onAction={openAdd}
        />
      ) : (
        <>
          {ordered.map((g) => (
            <Card key={g.id}>
              <button
                type="button"
                className={styles.cardButton}
                onClick={() => {
                  setEditing(g);
                  setSheetOpen(true);
                }}
                aria-label={`Edit ${g.name}`}
              >
                <div className={styles.cardHead}>
                  <span className={styles.name}>{g.name}</span>
                  <span className={styles.amounts} data-numeric>
                    {formatMoney(g.saved)}{" "}
                    <span className={styles.of}>of {formatMoney(g.target)}</span>
                  </span>
                </div>
                <Progress value={savedFraction(g)} label={`${g.name} progress`} />
              </button>
              <div className={styles.cardActions}>
                <button
                  type="button"
                  className={screen.deleteBtn}
                  aria-label={`Delete ${g.name}`}
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
            <Button variant="primary" onClick={openAdd}>
              <Icon name="add" size={18} />
              Add savings goal
            </Button>
          </div>
        </>
      )}

      <SavingsSheet
        open={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
        }}
        {...(editing ? { editing } : {})}
      />
      <ConfirmDialog
        open={pendingDelete !== undefined}
        title="Delete this savings goal?"
        body="This can't be undone."
        confirmLabel="Delete goal"
        onConfirm={() => {
          if (pendingDelete) savings.remove(pendingDelete.id);
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
