import { useState } from "react";
import { Card } from "@ui/primitives/Card";
import { Row } from "@ui/primitives/Row";
import { Button } from "@ui/primitives/Button";
import { Icon } from "@ui/icons/Icon";
import { EmptyState } from "@ui/states/EmptyState";
import { Toast } from "@ui/states/Toast";
import { ConfirmDialog } from "@ui/primitives/ConfirmDialog";
import { useSelector } from "@data/useStore";
import type { Subscription } from "@data/types";
import { formatMoney } from "@modules/spending/spending.data";
import { subscriptions, monthlyTotal, nextChargeLabel } from "./subscriptions.data";
import { SubscriptionSheet } from "./SubscriptionSheet";
import styles from "@modules/spending/SpendingScreen.module.css";

/**
 * Subscriptions screen (§12) — follows the module pattern. Its summary is the
 * calm monthly-equivalent total (neutral, §6.3); rows show the next-charge
 * phrase; each subscription's next charge also surfaces on Today (§13).
 */

export function SubscriptionsScreen() {
  const subs = useSelector((s) => s.subscriptions);
  const total = monthlyTotal(subs);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Subscription | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<Subscription | undefined>(undefined);
  const [toast, setToast] = useState<string | null>(null);

  function openAdd() {
    setEditing(undefined);
    setSheetOpen(true);
  }
  function confirmDelete() {
    if (!pendingDelete) return;
    subscriptions.remove(pendingDelete.id);
    setPendingDelete(undefined);
    setToast("Deleted");
  }

  const ordered = [...subs].sort((a, b) => a.next - b.next);

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Subscriptions</h1>
          <p className={styles.subtitle}>Know what's leaving your account, and when.</p>
        </div>
      </header>

      <Card>
        <div className={styles.summary}>
          <span className={styles.summaryLabel}>About this much a month</span>
          <span className={styles.summaryValue} data-numeric>
            {formatMoney(total)}
          </span>
        </div>
      </Card>

      {ordered.length === 0 ? (
        <EmptyState
          illustration="money"
          title="No subscriptions yet"
          body="Add one and you'll see what's coming, before it leaves your account."
          actionLabel="Add subscription"
          onAction={openAdd}
        />
      ) : (
        <>
          <Card heading="Your subscriptions">
            {ordered.map((s) => (
              <Row
                key={s.id}
                title={s.name}
                meta={nextChargeLabel(s.next)}
                category="money"
                onClick={() => {
                  setEditing(s);
                  setSheetOpen(true);
                }}
                ariaLabel={`Edit ${s.name}`}
                trailing={
                  <span className={styles.rowTrailing}>
                    <span data-numeric>{formatMoney(s.cost)}</span>
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      aria-label={`Delete ${s.name}`}
                      onClick={(ev: React.MouseEvent) => {
                        ev.stopPropagation();
                        setPendingDelete(s);
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
              Add subscription
            </Button>
          </div>
        </>
      )}

      <SubscriptionSheet
        open={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
        }}
        {...(editing ? { editing } : {})}
      />
      <ConfirmDialog
        open={pendingDelete !== undefined}
        title="Delete this subscription?"
        body="This can't be undone."
        confirmLabel="Delete subscription"
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
