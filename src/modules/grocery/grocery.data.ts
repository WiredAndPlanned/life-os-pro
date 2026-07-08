/**
 * Grocery — module data (§12). One calm list; check things off. Search only.
 */

import { collection } from "@data/crud";
import { registerSearchProjector } from "@data/reflection";
import type { StoreData, GroceryCategory } from "@data/types";
import type { CategoryFamily } from "@tokens/tokens";

export const grocery = collection("grocery", "grc");

export const GROCERY_CATEGORIES: Record<
  GroceryCategory,
  { label: string; family: CategoryFamily }
> = {
  produce: { label: "Produce", family: "health" },
  dairy: { label: "Dairy", family: "life" },
  pantry: { label: "Pantry", family: "plan" },
  frozen: { label: "Frozen", family: "money" },
  other: { label: "Other", family: "life" },
};
export const GROCERY_ORDER: GroceryCategory[] = ["produce", "dairy", "pantry", "frozen", "other"];

export function registerGroceryReflection(): void {
  registerSearchProjector((state: StoreData) =>
    state.grocery
      .filter((g) => !g.got)
      .map((g) => ({
        id: g.id,
        owner: "grocery",
        title: g.item,
        subtitle: GROCERY_CATEGORIES[g.category].label,
        destination: "life" as const,
      })),
  );
}
