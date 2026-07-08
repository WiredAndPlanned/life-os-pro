import { useState } from "react";
import { Card } from "@ui/primitives/Card";
import { Button } from "@ui/primitives/Button";
import { Field } from "@ui/primitives/Field";
import { Toast } from "@ui/states/Toast";
import { ConfirmDialog } from "@ui/primitives/ConfirmDialog";
import { Cairn } from "@ui/brand/Brand";
import { getAppearance, setAppearance } from "@data/appearance";
import type { Appearance } from "@data/appearance";
import { getState, replaceState } from "@data/store";
import { exportStore, importStore, exportFilename } from "@data/persistence";
import { emptyStore } from "@data/types";
import { getName, setName } from "@data/profile";
import screen from "@modules/spending/SpendingScreen.module.css";
import chip from "@modules/spending/ExpenseSheet.module.css";
import styles from "./SettingsScreen.module.css";
import { cx } from "@lib/cx";

/**
 * Settings (Constitution §18, §22) — the ONE place appearance is chosen, and the
 * home of data export/import/reset. Appearance is System / Light / Dark and
 * nothing else (§18); there is no floating toggle anywhere else in the product.
 * Export/restore keeps the person's data portable and never locked in (§22). The
 * destructive reset is gated behind a calm confirm dialog (§17, §22).
 */

const APPEARANCES: { key: Appearance; label: string }[] = [
  { key: "system", label: "System" },
  { key: "light", label: "Light" },
  { key: "dark", label: "Dark" },
];

export function SettingsScreen() {
  const [name, setNameState] = useState(getName());
  const [appearance, setAppearanceState] = useState<Appearance>(getAppearance());
  const [importText, setImportText] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function chooseAppearance(a: Appearance) {
    setAppearance(a);
    setAppearanceState(a);
  }

  function saveName(value: string) {
    setNameState(value);
    setName(value);
  }

  function handleExport() {
    const data = exportStore(getState());
    try {
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = exportFilename();
      a.click();
      URL.revokeObjectURL(url);
      setToast("Exported");
    } catch {
      // Fallback for environments without download: put it on the clipboard.
      void navigator.clipboard?.writeText(data);
      setToast("Copied backup to clipboard");
    }
  }

  function handleImport() {
    const restored = importStore(importText);
    if (!restored) {
      setToast("That didn't look like a backup");
      return;
    }
    replaceState(restored);
    setImportText("");
    setShowImport(false);
    setToast("Restored");
  }

  return (
    <div className={screen.screen}>
      <header className={screen.header}>
        <div>
          <h1 className={screen.title}>Settings</h1>
          <p className={screen.subtitle}>Yours, and only on this device.</p>
        </div>
      </header>

      <Card heading="You">
        <Field
          label="Your name"
          placeholder="What should we call you?"
          value={name}
          onChange={(e) => {
            saveName(e.target.value);
          }}
        />
      </Card>

      <Card heading="Appearance">
        <p className={styles.hint}>The same product at a different luminance. Choose what's comfortable.</p>
        <fieldset className={chip.categories}>
          <legend className={styles.srOnly}>Appearance</legend>
          <div className={chip.chips}>
            {APPEARANCES.map((a) => (
              <button
                key={a.key}
                type="button"
                className={cx(chip.chip, appearance === a.key && chip.chipActive)}
                aria-pressed={appearance === a.key}
                onClick={() => {
                  chooseAppearance(a.key);
                }}
              >
                {a.label}
              </button>
            ))}
          </div>
        </fieldset>
      </Card>

      <Card heading="Your data">
        <p className={styles.hint}>
          Everything lives on this device. Export a backup any time, or bring one back.
        </p>
        <div className={styles.dataActions}>
          <Button variant="ghost" onClick={handleExport}>
            Export a backup
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setShowImport((v) => !v);
            }}
          >
            Restore from a backup
          </Button>
        </div>
        {showImport && (
          <div className={styles.importBox}>
            <label htmlFor="import-area" className={styles.importLabel}>
              Paste your backup file's contents
            </label>
            <textarea
              id="import-area"
              className={styles.textarea}
              value={importText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                setImportText(e.target.value);
              }}
              placeholder="{ …your exported backup… }"
              rows={4}
            />
            <Button variant="primary" onClick={handleImport} disabled={!importText.trim()}>
              Restore
            </Button>
          </div>
        )}
      </Card>

      <Card heading="Start over">
        <p className={styles.hint}>Clear everything on this device and begin fresh. This can't be undone.</p>
        <Button
          variant="danger"
          onClick={() => {
            setConfirmReset(true);
          }}
        >
          Reset all data
        </Button>
      </Card>

      <section className={styles.about}>
        <Cairn size={40} title="The Cairn — WiredAndPlanned" />
        <p className={styles.aboutName}>Life OS Pro</p>
        <p className={styles.aboutBy}>by WiredAndPlanned</p>
        <p className={styles.aboutBlurb}>
          A calm, local-first place for your whole life. Version 1.0.
        </p>
      </section>

      <ConfirmDialog
        open={confirmReset}
        title="Reset everything?"
        body="All your data on this device will be cleared. This can't be undone. If you might want it later, export a backup first."
        confirmLabel="Reset all data"
        onConfirm={() => {
          replaceState(emptyStore());
          setConfirmReset(false);
          setToast("Everything cleared");
        }}
        onCancel={() => {
          setConfirmReset(false);
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
