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
import type { ContentIdea, ContentStatus, ContentPlatform } from "@data/types";
import {
  content,
  CONTENT_STATUS,
  CONTENT_STATUS_ORDER,
  CONTENT_PLATFORM,
  CONTENT_PLATFORM_ORDER,
} from "./content.data";
import chip from "@modules/spending/ExpenseSheet.module.css";
import screen from "@modules/spending/SpendingScreen.module.css";
import { cx } from "@lib/cx";

/** Content screen (§12). Keep a side hustle's ideas in one place, moving stage by stage. */

export function ContentScreen() {
  const items = useSelector((s) => s.content);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ContentIdea | undefined>(undefined);
  const [idea, setIdea] = useState("");
  const [platform, setPlatform] = useState<ContentPlatform>("video");
  const [status, setStatus] = useState<ContentStatus>("idea");
  const [error, setError] = useState<string | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<ContentIdea | undefined>(undefined);

  function reset(e?: ContentIdea) {
    setEditing(e);
    setIdea(e?.idea ?? "");
    setPlatform(e?.platform ?? "video");
    setStatus(e?.status ?? "idea");
    setError(undefined);
  }
  function save() {
    const t = idea.trim();
    if (!t) {
      setError("Jot the idea in a few words.");
      return;
    }
    if (editing) content.edit(editing.id, { idea: t, platform, status });
    else content.create({ idea: t, platform, status });
    setOpen(false);
  }

  const ordered = [...items].reverse();

  return (
    <div className={screen.screen}>
      <header className={screen.header}>
        <div>
          <h1 className={screen.title}>Content</h1>
          <p className={screen.subtitle}>Side-hustle ideas, in one place.</p>
        </div>
      </header>

      {ordered.length === 0 ? (
        <EmptyState
          illustration="list"
          title="No ideas yet"
          body="Caught an idea? Drop it here before it slips away."
          actionLabel="Add idea"
          onAction={() => {
            reset();
            setOpen(true);
          }}
        />
      ) : (
        <>
          <Card heading="Your pipeline">
            {ordered.map((c) => (
              <Row
                key={c.id}
                title={c.idea}
                meta={`${CONTENT_PLATFORM[c.platform]} · ${CONTENT_STATUS[c.status]}`}
                category="life"
                onClick={() => {
                  reset(c);
                  setOpen(true);
                }}
                ariaLabel={`Edit ${c.idea}`}
                trailing={
                  <button
                    type="button"
                    className={screen.deleteBtn}
                    aria-label={`Delete ${c.idea}`}
                    onClick={(ev: React.MouseEvent) => {
                      ev.stopPropagation();
                      setPendingDelete(c);
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
              Add idea
            </Button>
          </div>
        </>
      )}

      <BottomSheet
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        title={editing ? "Edit idea" : "Add idea"}
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
          label="Idea"
          placeholder="A short about…"
          value={idea}
          onChange={(e) => {
            setIdea(e.target.value);
          }}
          {...(error ? { error } : {})}
          autoFocus
        />
        <fieldset className={chip.categories}>
          <legend className={chip.legend}>Platform</legend>
          <div className={chip.chips}>
            {CONTENT_PLATFORM_ORDER.map((p) => (
              <button
                key={p}
                type="button"
                className={cx(chip.chip, platform === p && chip.chipActive)}
                aria-pressed={platform === p}
                onClick={() => {
                  setPlatform(p);
                }}
              >
                {CONTENT_PLATFORM[p]}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className={chip.categories}>
          <legend className={chip.legend}>Status</legend>
          <div className={chip.chips}>
            {CONTENT_STATUS_ORDER.map((s) => (
              <button
                key={s}
                type="button"
                className={cx(chip.chip, status === s && chip.chipActive)}
                aria-pressed={status === s}
                onClick={() => {
                  setStatus(s);
                }}
              >
                {CONTENT_STATUS[s]}
              </button>
            ))}
          </div>
        </fieldset>
      </BottomSheet>

      <ConfirmDialog
        open={pendingDelete !== undefined}
        title="Delete this idea?"
        body="This can't be undone."
        confirmLabel="Delete idea"
        onConfirm={() => {
          if (pendingDelete) content.remove(pendingDelete.id);
          setPendingDelete(undefined);
        }}
        onCancel={() => {
          setPendingDelete(undefined);
        }}
      />
    </div>
  );
}
