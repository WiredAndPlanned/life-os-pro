import { useState } from "react";
import { Card } from "@ui/primitives/Card";
import { Row } from "@ui/primitives/Row";
import { Button } from "@ui/primitives/Button";
import { Icon } from "@ui/icons/Icon";
import { Field } from "@ui/primitives/Field";
import { BottomSheet } from "@ui/primitives/BottomSheet";
import { EmptyState } from "@ui/states/EmptyState";
import { useSelector } from "@data/useStore";
import type { WeekBand, WeekDay } from "@data/types";
import { weekly, WEEK_DAYS, WEEK_BANDS } from "./weekly.data";
import chip from "@modules/spending/ExpenseSheet.module.css";
import screen from "@modules/spending/SpendingScreen.module.css";
import { cx } from "@lib/cx";

/** Weekly screen (§12). See and shape the whole week at a glance, by day and band. */

export function WeeklyScreen() {
  const entries = useSelector((s) => s.weekly);
  const [open, setOpen] = useState(false);
  const [day, setDay] = useState<WeekDay>("mon");
  const [band, setBand] = useState<WeekBand>("morning");
  const [text, setText] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);

  function add() {
    const t = text.trim();
    if (!t) {
      setError("What's the plan?");
      return;
    }
    weekly.create({ day, band, text: t });
    setText("");
    setError(undefined);
    setOpen(false);
  }

  const bandLabel = (b: WeekBand) => WEEK_BANDS.find((x) => x.key === b)?.label ?? b;
  const hasAny = entries.length > 0;

  return (
    <div className={screen.screen}>
      <header className={screen.header}>
        <div>
          <h1 className={screen.title}>Weekly</h1>
          <p className={screen.subtitle}>Shape the whole week at a glance.</p>
        </div>
      </header>

      {!hasAny ? (
        <EmptyState
          illustration="calendar"
          title="Your week's open"
          body="Add a few things where they belong. No need to fill every slot."
          actionLabel="Add to the week"
          onAction={() => {
            setOpen(true);
          }}
        />
      ) : (
        <>
          {WEEK_DAYS.map((d) => {
            const dayEntries = entries.filter((e) => e.day === d.key);
            if (dayEntries.length === 0) return null;
            return (
              <Card key={d.key} heading={d.label}>
                {dayEntries.map((e) => (
                  <Row
                    key={e.id}
                    title={e.text}
                    meta={bandLabel(e.band)}
                    category="plan"
                    trailing={
                      <button
                        type="button"
                        className={screen.deleteBtn}
                        aria-label={`Remove ${e.text}`}
                        onClick={() => {
                          weekly.remove(e.id);
                        }}
                      >
                        <Icon name="close" size={18} />
                      </button>
                    }
                  />
                ))}
              </Card>
            );
          })}
          <div className={screen.addRow}>
            <Button
              variant="primary"
              onClick={() => {
                setOpen(true);
              }}
            >
              <Icon name="add" size={18} />
              Add to the week
            </Button>
          </div>
        </>
      )}

      <BottomSheet
        open={open}
        onClose={() => {
          setOpen(false);
          setError(undefined);
        }}
        title="Add to the week"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setOpen(false);
                setError(undefined);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={add}>
              Add
            </Button>
          </>
        }
      >
        <Field
          label="Plan"
          placeholder="Study group"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
          }}
          {...(error ? { error } : {})}
          autoFocus
        />
        <fieldset className={chip.categories}>
          <legend className={chip.legend}>Day</legend>
          <div className={chip.chips}>
            {WEEK_DAYS.map((d) => (
              <button
                key={d.key}
                type="button"
                className={cx(chip.chip, day === d.key && chip.chipActive)}
                aria-pressed={day === d.key}
                onClick={() => {
                  setDay(d.key);
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className={chip.categories}>
          <legend className={chip.legend}>When</legend>
          <div className={chip.chips}>
            {WEEK_BANDS.map((b) => (
              <button
                key={b.key}
                type="button"
                className={cx(chip.chip, band === b.key && chip.chipActive)}
                aria-pressed={band === b.key}
                onClick={() => {
                  setBand(b.key);
                }}
              >
                {b.label}
              </button>
            ))}
          </div>
        </fieldset>
      </BottomSheet>
    </div>
  );
}
