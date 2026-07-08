import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@ui/primitives/Card";
import { Row } from "@ui/primitives/Row";
import { Button } from "@ui/primitives/Button";
import { Icon } from "@ui/icons/Icon";
import { Field } from "@ui/primitives/Field";
import { EmptyState } from "@ui/states/EmptyState";
import { useStore } from "@data/useStore";
import { gatherDue } from "@data/reflection";
import type { DueItem } from "@data/reflection";
import { brainDump } from "@modules/brainDump/brainDump.data";
import { isMarkedToday } from "@modules/habits/habits.data";
import { monthTotal, formatMoney } from "@modules/spending/spending.data";
import { DEFAULT_WATER_GOAL, dayKey } from "@modules/hydration/hydration.data";
import { MOOD_LABELS } from "@modules/mood/mood.data";
import screen from "@modules/spending/SpendingScreen.module.css";
import styles from "./TodayScreen.module.css";

/**
 * Today (Constitution §13) — the product's answer to its own core problem.
 *
 * A single calm screen that means "here is your whole life, already gathered."
 * It is a REFLECTION SURFACE ONLY — it owns no data and holds no second copy
 * (§13, §16). It reads derived views from the single store:
 *  - a warm, personal greeting by time of day (§13, §4.1)
 *  - what's LIVE today (habits done, water, mood, spend) — quiet reflections
 *    that tap through to their owning module (§13)
 *  - a QUICK BRAIN DUMP writing straight into Brain Dump's store (§13, §15)
 *  - DUE & UPCOMING gathered from every owner via gatherDue (§13)
 *
 * If Today ever feels busy, the product has failed its own philosophy (§2, §13).
 */

function greeting(now = new Date()): string {
  const h = now.getHours();
  if (h < 12) return "Morning";
  if (h < 18) return "Afternoon";
  return "Evening";
}

function dueMeta(dueAt: number, now = Date.now()): string {
  const days = Math.ceil((dueAt - now) / (24 * 60 * 60 * 1000));
  if (days < 0) return "Overdue";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${String(days)} days`;
}

export function TodayScreen() {
  const store = useStore(); // subscribe: Today reflects any change live (§16)
  const navigate = useNavigate();
  const [draft, setDraft] = useState("");

  // Derived, never copied (§13, §16).
  const due: DueItem[] = gatherDue(store);
  const habitsToday = store.habits;
  const habitsDone = habitsToday.filter((h) => isMarkedToday(h)).length;
  const spend = monthTotal(store.spending);
  const water = store.hydration.find((d) => dayKey(d.date) === dayKey())?.count ?? 0;
  const latestMood = [...store.mood].reverse()[0];

  const destForOwner: Record<string, string> = {
    subscriptions: "/life/subscriptions",
    study: "/plan/study",
    career: "/life/career",
    goals: "/plan/goals",
    monthly: "/plan/monthly",
  };

  function quickAdd() {
    const text = draft.trim();
    if (!text) return;
    brainDump.create({ text });
    setDraft("");
  }

  const hasAnything =
    due.length > 0 ||
    habitsToday.length > 0 ||
    store.spending.length > 0 ||
    store.hydration.length > 0 ||
    store.mood.length > 0;

  return (
    <div className={screen.screen}>
      <header className={styles.greetHeader}>
        <h1 className={styles.greeting}>{greeting()}.</h1>
        <p className={styles.subtitle}>Here's your day, already gathered.</p>
      </header>

      {/* Quick brain dump — empty the head instantly (§13, §15) */}
      <Card>
        <div className={styles.quick}>
          <Field
            label="Quick brain dump"
            placeholder="Get something out of your head…"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") quickAdd();
            }}
          />
          <Button variant="primary" onClick={quickAdd} disabled={!draft.trim()} aria-label="Save thought">
            <Icon name="add" size={18} />
          </Button>
        </div>
      </Card>

      {/* What's live today — quiet reflections, tap through to the owner (§13) */}
      {(habitsToday.length > 0 || store.spending.length > 0 || store.hydration.length > 0 || latestMood) && (
        <Card heading="Today so far">
          {habitsToday.length > 0 && (
            <Row
              title="Habits"
              meta={`${String(habitsDone)} of ${String(habitsToday.length)} done`}
              category="health"
              icon="habits"
              onClick={() => {
                navigate("/life/habits");
              }}
              ariaLabel="Open habits"
              trailing={<Icon name="chevronRight" size={20} />}
            />
          )}
          {store.hydration.length > 0 && (
            <Row
              title="Water"
              meta={`${String(water)} of ${String(DEFAULT_WATER_GOAL)} glasses`}
              category="health"
              icon="hydration"
              onClick={() => {
                navigate("/life/hydration");
              }}
              ariaLabel="Open hydration"
              trailing={<Icon name="chevronRight" size={20} />}
            />
          )}
          {latestMood && (
            <Row
              title="Mood"
              meta={MOOD_LABELS[latestMood.mood]}
              category="health"
              icon="mood"
              onClick={() => {
                navigate("/life/mood");
              }}
              ariaLabel="Open mood"
              trailing={<Icon name="chevronRight" size={20} />}
            />
          )}
          {store.spending.length > 0 && (
            <Row
              title="Spent this month"
              meta=""
              category="money"
              icon="spending"
              onClick={() => {
                navigate("/life/spending");
              }}
              ariaLabel="Open spending"
              trailing={
                <span data-numeric className={styles.spendValue}>
                  {formatMoney(spend)}
                </span>
              }
            />
          )}
        </Card>
      )}

      {/* Due & upcoming — gathered from every owner (§13) */}
      {due.length > 0 && (
        <Card heading="Due & upcoming">
          {due.slice(0, 8).map((d) => (
            <Row
              key={`${d.owner}-${d.id}`}
              title={d.title}
              meta={dueMeta(d.dueAt)}
              category="plan"
              onClick={() => {
                navigate(destForOwner[d.owner] ?? `/${d.destination}`);
              }}
              ariaLabel={`Open ${d.title}`}
              trailing={<Icon name="chevronRight" size={20} />}
            />
          ))}
        </Card>
      )}

      {!hasAnything && (
        <EmptyState
          illustration="clear"
          title="All clear"
          body="Nothing's due and nothing's logged yet. Add something from Plan or Life whenever you're ready."
        />
      )}
    </div>
  );
}
