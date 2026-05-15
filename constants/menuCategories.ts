/**
 * MealMate - Fixed menu sections (5 categories) for My Menu tab.
 */

export const MENU_SECTION_CATEGORIES = [
  { label: "Breakfast", slug: "breakfast" },
  { label: "Lunch", slug: "lunch" },
  { label: "Dinner", slug: "dinner" },
  { label: "Party", slug: "party" },
  { label: "Get Together", slug: "gettogether" },
] as const;

export type MenuSectionSlug = (typeof MENU_SECTION_CATEGORIES)[number]["slug"];

/** Normalize menu_items.category for grouping (slug, label, or variant). */
export function normalizeMenuCategory(value: string): string {
  const key = value.toLowerCase().trim().replace(/[\s_-]+/g, "");
  if (key === "gettogether") return "gettogether";
  return key;
}

export function menuItemMatchesSection(
  itemCategory: string,
  sectionSlug: MenuSectionSlug
): boolean {
  const normalized = normalizeMenuCategory(itemCategory);
  if (normalized === sectionSlug) return true;
  const section = MENU_SECTION_CATEGORIES.find((s) => s.slug === sectionSlug);
  if (section && normalizeMenuCategory(section.label) === normalized) return true;
  return false;
}
