import { Outlet } from "react-router-dom";
import { PrimaryNav } from "@ui/nav/PrimaryNav";
import styles from "./AppShell.module.css";

/**
 * App shell (Constitution §11).
 *
 * The persistent frame: it renders the active destination via <Outlet/> and the
 * primary navigation. It realizes the "one architecture, three presentations"
 * responsive layout (Level 2 §9): on phones the nav is a bottom bar below the
 * content; on medium and large screens it becomes a side rail / sidebar beside
 * the content. PrimaryNav itself owns which presentation shows at each size; the
 * shell owns whether the nav sits below or beside the content.
 */

export function AppShell() {
  return (
    <div className={styles.shell}>
      <main className={styles.main}>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
      <div className={styles.nav}>
        <PrimaryNav />
      </div>
    </div>
  );
}
