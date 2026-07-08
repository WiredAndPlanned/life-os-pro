import { Card } from "@ui/primitives/Card";
import { Button } from "@ui/primitives/Button";
import { Icon } from "@ui/icons/Icon";
import { Progress } from "@ui/primitives/Progress";
import { useSelector } from "@data/useStore";
import { hydration, DEFAULT_WATER_GOAL, dayKey } from "./hydration.data";
import type { HydrationDay } from "@data/types";
import screen from "@modules/spending/SpendingScreen.module.css";
import styles from "./HydrationScreen.module.css";

/**
 * Hydration screen (§12) — a quiet daily nudge to drink water. A calm counter
 * against a comfortable default goal; the count renders neutral (§6.3), and
 * reaching the goal is acknowledged gently, never gamified (§13, §19).
 */

export function HydrationScreen() {
  const days = useSelector((s) => s.hydration);
  const key = dayKey();
  const today: HydrationDay | undefined = days.find((h) => dayKey(h.date) === key);
  const count = today?.count ?? 0;
  const goal = DEFAULT_WATER_GOAL;

  function setCount(next: number) {
    const clamped = Math.max(0, next);
    if (today) {
      hydration.edit(today.id, { count: clamped });
    } else if (clamped > 0) {
      hydration.create({ date: Date.now(), count: clamped });
    }
  }

  const reached = count >= goal;

  return (
    <div className={screen.screen}>
      <header className={screen.header}>
        <div>
          <h1 className={screen.title}>Hydration</h1>
          <p className={screen.subtitle}>A quiet nudge to drink water.</p>
        </div>
      </header>

      <Card>
        <div className={styles.counter}>
          <span className={styles.count} data-numeric>
            {count}
            <span className={styles.goal}> / {goal}</span>
          </span>
          <span className={styles.unit}>glasses today</span>
        </div>
        <div className={styles.bar}>
          <Progress value={goal > 0 ? count / goal : 0} label="Water today" />
        </div>
        <div className={styles.controls}>
          <Button
            variant="ghost"
            onClick={() => {
              setCount(count - 1);
            }}
            disabled={count === 0}
            aria-label="One fewer glass"
          >
            <Icon name="close" size={18} />
          </Button>
          <Button
            variant="primary"
            block
            onClick={() => {
              setCount(count + 1);
            }}
          >
            <Icon name="add" size={18} />
            Add a glass
          </Button>
        </div>
        {reached && <p className={styles.reached}>That's your goal for today. Nicely done.</p>}
      </Card>
    </div>
  );
}
