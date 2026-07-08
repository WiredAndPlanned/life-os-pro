import { useState } from "react";
import { Card } from "@ui/primitives/Card";
import { Row } from "@ui/primitives/Row";
import { Button } from "@ui/primitives/Button";
import { Icon } from "@ui/icons/Icon";
import { Field } from "@ui/primitives/Field";
import { BottomSheet } from "@ui/primitives/BottomSheet";
import { EmptyState } from "@ui/states/EmptyState";
import { useSelector } from "@data/useStore";
import type { WeekDay, Meal } from "@data/types";
import { meals, MEAL_SLOTS } from "./meals.data";
import { WEEK_DAYS } from "@modules/weekly/weekly.data";
import chip from "@modules/spending/ExpenseSheet.module.css";
import screen from "@modules/spending/SpendingScreen.module.css";
import { cx } from "@lib/cx";

/** Meals screen (§12). Plan the week's food without overthinking. */

export function MealsScreen() {
  const plan = useSelector((s) => s.meals);
  const [open, setOpen] = useState(false);
  const [day, setDay] = useState<WeekDay>("mon");
  const [meal, setMeal] = useState<Meal>("d");
  const [text, setText] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);

  function add() {
    const t = text.trim();
    if (!t) {
      setError("What's cooking?");
      return;
    }
    meals.create({ day, meal, text: t });
    setText("");
    setError(undefined);
    setOpen(false);
  }

  const slotLabel = (m: Meal) => MEAL_SLOTS.find((x) => x.key === m)?.label ?? m;
  const hasAny = plan.length > 0;

  return (
    <div className={screen.screen}>
      <header className={screen.header}>
        <div>
          <h1 className={screen.title}>Meals</h1>
          <p className={screen.subtitle}>Plan the week's food, calmly.</p>
        </div>
      </header>

      {!hasAny ? (
        <EmptyState
          illustration="list"
          title="No meals planned"
          body="Even a couple of dinners sorted makes the week easier. Add what you fancy."
          actionLabel="Plan a meal"
          onAction={() => {
            setOpen(true);
          }}
        />
      ) : (
        <>
          {WEEK_DAYS.map((d) => {
            const dayMeals = plan.filter((m) => m.day === d.key);
            if (dayMeals.length === 0) return null;
            return (
              <Card key={d.key} heading={d.label}>
                {dayMeals.map((m) => (
                  <Row
                    key={m.id}
                    title={m.text}
                    meta={slotLabel(m.meal)}
                    category="life"
                    trailing={
                      <button
                        type="button"
                        className={screen.deleteBtn}
                        aria-label={`Remove ${m.text}`}
                        onClick={() => {
                          meals.remove(m.id);
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
              Plan a meal
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
        title="Plan a meal"
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
          label="Meal"
          placeholder="Pasta & salad"
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
          <legend className={chip.legend}>Slot</legend>
          <div className={chip.chips}>
            {MEAL_SLOTS.map((s) => (
              <button
                key={s.key}
                type="button"
                className={cx(chip.chip, meal === s.key && chip.chipActive)}
                aria-pressed={meal === s.key}
                onClick={() => {
                  setMeal(s.key);
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </fieldset>
      </BottomSheet>
    </div>
  );
}
