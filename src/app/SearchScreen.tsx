import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@ui/primitives/Card";
import { Row } from "@ui/primitives/Row";
import { Icon } from "@ui/icons/Icon";
import { Field } from "@ui/primitives/Field";
import { EmptyState } from "@ui/states/EmptyState";
import { useStore } from "@data/useStore";
import { searchAll } from "@data/reflection";
import screen from "@modules/spending/SpendingScreen.module.css";

/**
 * Search (Constitution §14) — one search that reaches every primary data type
 * the product owns. Nothing meaningful is unsearchable; each result opens its
 * OWNING module (§12, §14). Search is a way THROUGH the product, not a separate
 * place. It owns nothing — results are derived live from the single store (§16).
 *
 * Owner → destination map lives here so a result can jump straight to its module.
 */

const OWNER_DEST: Record<string, string> = {
  brainDump: "/plan/brain-dump",
  weekly: "/plan/weekly",
  monthly: "/plan/monthly",
  recurring: "/plan/recurring",
  goals: "/plan/goals",
  study: "/plan/study",
  spending: "/life/spending",
  subscriptions: "/life/subscriptions",
  savings: "/life/savings",
  debt: "/life/debt",
  habits: "/life/habits",
  mood: "/life/mood",
  sleep: "/life/sleep",
  movement: "/life/movement",
  meals: "/life/meals",
  grocery: "/life/grocery",
  content: "/life/content",
  career: "/life/career",
};

const OWNER_LABEL: Record<string, string> = {
  brainDump: "Brain dump",
  weekly: "Weekly",
  monthly: "Monthly",
  recurring: "Recurring",
  goals: "Goals",
  study: "Study",
  spending: "Spending",
  subscriptions: "Subscriptions",
  savings: "Savings",
  debt: "Debt",
  habits: "Habits",
  mood: "Mood",
  sleep: "Sleep",
  movement: "Movement",
  meals: "Meals",
  grocery: "Grocery",
  content: "Content",
  career: "Career",
};

export function SearchScreen() {
  const store = useStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const results = searchAll(store, query);
  const trimmed = query.trim();

  return (
    <div className={screen.screen}>
      <header className={screen.header}>
        <div>
          <h1 className={screen.title}>Search</h1>
          <p className={screen.subtitle}>Find anything, across your whole life.</p>
        </div>
      </header>

      <Card>
        <Field
          label="Search"
          placeholder="A thought, a goal, a purchase, a deadline…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
          autoFocus
        />
      </Card>

      {trimmed === "" ? (
        <EmptyState
          illustration="clear"
          title="Search everything you own"
          body="Type a word and it'll look across every module at once — nothing's hidden in a silo."
        />
      ) : results.length === 0 ? (
        <EmptyState
          illustration="clear"
          title="Nothing matches"
          body={`No results for "${trimmed}". Try a different word.`}
        />
      ) : (
        <Card heading={`${String(results.length)} result${results.length === 1 ? "" : "s"}`}>
          {results.map((r) => (
            <Row
              key={`${r.owner}-${r.id}`}
              title={r.title}
              meta={`${OWNER_LABEL[r.owner] ?? r.owner}${r.subtitle ? ` · ${r.subtitle}` : ""}`}
              onClick={() => {
                navigate(OWNER_DEST[r.owner] ?? `/${r.destination}`);
              }}
              ariaLabel={`Open ${r.title} in ${OWNER_LABEL[r.owner] ?? r.owner}`}
              trailing={<Icon name="chevronRight" size={20} />}
            />
          ))}
        </Card>
      )}
    </div>
  );
}
