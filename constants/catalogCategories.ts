/**
 * MealMate - Catalog category labels mapped to Supabase UUIDs.
 */

export const CATALOG_CATEGORY_OPTIONS = [
  { label: "Breakfast", id: "d7bda7d7-2e80-449c-a76f-62baf6e09275" },
  { label: "Lunch", id: "e6bfd010-66d2-47b6-916a-dd2763f91cad" },
  { label: "Dinner", id: "e4381284-0ab6-4374-a10d-c62bb52615e1" },
  { label: "Party", id: "b8f5f5ea-d707-4bb3-820b-d3fc65e95512" },
  { label: "Get Together", id: "802f854a-ed99-42be-a09c-7455b4bb121f" },
] as const;

export type CatalogCategoryLabel =
  (typeof CATALOG_CATEGORY_OPTIONS)[number]["label"];

export function getCategoryIdByLabel(label: CatalogCategoryLabel): string {
  const match = CATALOG_CATEGORY_OPTIONS.find((c) => c.label === label);
  if (!match) throw new Error(`Unknown category: ${label}`);
  return match.id;
}
