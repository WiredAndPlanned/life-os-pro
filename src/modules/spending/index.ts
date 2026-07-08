/**
 * Spending module (Phase 4 reference) — public surface (§12).
 *
 * A module exposes its screen and its reflection registrar. Everything else
 * (data binding, sheet, styles) is internal. This shape is the template every
 * module follows in Phase 5.
 */

export { SpendingScreen } from "./SpendingScreen";
export { registerSpendingReflection } from "./spending.data";
