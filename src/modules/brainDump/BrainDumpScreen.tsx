import { useState } from "react";
import { Card } from "@ui/primitives/Card";
import { Row } from "@ui/primitives/Row";
import { Button } from "@ui/primitives/Button";
import { Icon } from "@ui/icons/Icon";
import { Field } from "@ui/primitives/Field";
import { EmptyState } from "@ui/states/EmptyState";
import { ConfirmDialog } from "@ui/primitives/ConfirmDialog";
import { useSelector } from "@data/useStore";
import type { Thought } from "@data/types";
import { brainDump } from "./brainDump.data";
import styles from "@modules/spending/SpendingScreen.module.css";

/**
 * Brain Dump screen (§12, §15) — the head-dump workflow, zero ceremony.
 *
 * A single always-present field to empty the head instantly (the workflow is
 * "type it → it's safely out of your head"), plus the list of thoughts, newest
 * first, each deletable once dealt with. No add-sheet needed: the field IS the
 * add surface here, which is the calmest possible flow for this one module.
 */

export function BrainDumpScreen() {
  const thoughts = useSelector((s) => s.brainDump);
  const [draft, setDraft] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Thought | undefined>(undefined);

  function add() {
    const text = draft.trim();
    if (!text) return;
    brainDump.create({ text });
    setDraft("");
  }

  const ordered = [...thoughts].reverse();

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Brain dump</h1>
          <p className={styles.subtitle}>Get it out of your head. Sort it later.</p>
        </div>
      </header>

      <Card>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <Field
            label="What's on your mind?"
            placeholder="Anything at all…"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") add();
            }}
          />
          <Button variant="primary" block onClick={add} disabled={!draft.trim()}>
            <Icon name="add" size={18} />
            Add
          </Button>
        </div>
      </Card>

      {ordered.length === 0 ? (
        <EmptyState
          illustration="clear"
          title="Your mind is clear"
          body="Anything swirling around? Put it here and let it go."
        />
      ) : (
        <Card heading="Caught">
          {ordered.map((t) => (
            <Row
              key={t.id}
              title={t.text}
              trailing={
                <button
                  type="button"
                  className={styles.deleteBtn}
                  aria-label={`Delete "${t.text}"`}
                  onClick={() => {
                    setPendingDelete(t);
                  }}
                >
                  <Icon name="check" size={18} />
                </button>
              }
            />
          ))}
        </Card>
      )}

      <ConfirmDialog
        open={pendingDelete !== undefined}
        title="Clear this thought?"
        body="It'll be removed from your brain dump."
        confirmLabel="Clear it"
        cancelLabel="Keep"
        onConfirm={() => {
          if (pendingDelete) brainDump.remove(pendingDelete.id);
          setPendingDelete(undefined);
        }}
        onCancel={() => {
          setPendingDelete(undefined);
        }}
      />
    </div>
  );
}
