import { useNavigate } from "react-router-dom";
import { Card } from "@ui/primitives/Card";
import { Row } from "@ui/primitives/Row";
import { Icon } from "@ui/icons/Icon";
import type { IconName } from "@ui/icons/Icon";
import type { CategoryFamily } from "@tokens/tokens";
import styles from "@modules/spending/SpendingScreen.module.css";
import hub from "./ModuleHub.module.css";

/**
 * A hub screen (Constitution §11) — the single, predictable entry to a family of
 * modules under Plan or Life. Secondary areas are grouped here, never scattered
 * (Level 2 §9). Each row navigates to its module; the whole hub is calm rows, not
 * a dense grid (a correction of the legacy 16-tab "More" grid, §11).
 *
 * On wider screens the rows flow into a responsive grid so a family fills the
 * desktop canvas rather than stranding a narrow column in a wide window. Each
 * entry shows its colored category icon tile for fast recognition (§6.5, §8).
 */

export interface HubEntry {
  label: string;
  meta: string;
  category: CategoryFamily;
  icon: IconName;
  path: string;
}

interface ModuleHubProps {
  title: string;
  subtitle: string;
  groups: { heading: string; entries: HubEntry[] }[];
}

export function ModuleHub({ title, subtitle, groups }: ModuleHubProps) {
  const navigate = useNavigate();
  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
      </header>
      {groups.map((g) => (
        <Card key={g.heading} heading={g.heading}>
          <div className={hub.grid}>
            {g.entries.map((e) => (
              <Row
                key={e.path}
                title={e.label}
                meta={e.meta}
                category={e.category}
                icon={e.icon}
                ariaLabel={`Open ${e.label}`}
                onClick={() => {
                  navigate(e.path);
                }}
                trailing={<Icon name="chevronRight" size={20} />}
              />
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
