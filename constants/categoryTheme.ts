/**
 * MealMate - Category visual tokens (icons & accent colors).
 * Used when DB does not provide accent_color / icon_name.
 */

import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";

export type CategoryIconName = ComponentProps<typeof Ionicons>["name"];

export const CATEGORY_ACCENT_COLORS: Record<string, string> = {
  breakfast: "#F4A024",
  lunch: "#4CAF50",
  dinner: "#7E57C2",
  party: "#E91E63",
  gettogether: "#2196F3",
};

export const CATEGORY_ICON_NAMES: Record<string, CategoryIconName> = {
  breakfast: "sunny-outline",
  lunch: "restaurant-outline",
  dinner: "moon-outline",
  party: "balloon-outline",
  gettogether: "people-outline",
};

export function getCategoryAccent(slug: string, fromDb?: string | null): string {
  return fromDb ?? CATEGORY_ACCENT_COLORS[slug] ?? "#F4A024";
}

export function getCategoryIconName(
  slug: string,
  fromDb?: string | null
): CategoryIconName {
  const name = fromDb ?? CATEGORY_ICON_NAMES[slug] ?? "restaurant-outline";
  return name as CategoryIconName;
}
