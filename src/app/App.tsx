/**
 * Root application component.
 *
 * Responsibilities in Phase 0 are deliberately thin:
 *  - Keep appearance following the OS live while the preference is "system"
 *    (§18): the pre-paint script sets the initial theme with no flash, and this
 *    subscription keeps it correct if the OS theme changes mid-session.
 *  - Provide the router (§11, §20).
 *
 * Global providers for the data store (Phase 3) and any app-wide UI context
 * (Phase 2) are added in their own phases, at this level, without disturbing
 * this structure.
 */

import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { registerModules } from "./registerModules";
import { getAppearance, applyTheme, watchSystemTheme } from "@data/appearance";

// Register module reflection into Today/Search once, at load, before first paint
// of any screen that reads derived views (§16).
registerModules();

export function App() {
  useEffect(() => {
    // Only follow the OS live when the user's preference is "system".
    if (getAppearance() !== "system") return;
    return watchSystemTheme((theme) => {
      applyTheme(theme);
    });
  }, []);

  return <RouterProvider router={router} />;
}
