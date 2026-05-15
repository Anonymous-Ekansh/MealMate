/**
 * MealMate - Catalog Service
 * Fetches catalog menu items by category from Supabase.
 */

import { supabase } from "../lib/supabase";
import type { CatalogItem, CatalogItemWithCategory } from "../lib/types";

export async function getCatalogByCategorySlug(
  slug: string
): Promise<CatalogItemWithCategory[]> {
  const { data: category, error: catError } = await supabase
    .from("categories")
    .select("id, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (catError) throw catError;
  if (!category) return [];

  const { data, error } = await supabase
    .from("catalog_items")
    .select("*")
    .eq("category_id", category.id)
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((item) => ({
    ...item,
    category_slug: category.slug,
  }));
}

export async function getCatalogItemCountByCategory(
  categoryId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("catalog_items")
    .select("*", { count: "exact", head: true })
    .eq("category_id", categoryId);

  if (error) throw error;
  return count ?? 0;
}

export interface AddCatalogItemInput {
  category_id: string;
  name: string;
  description?: string | null;
  unit: string;
  is_veg: boolean;
}

export async function addCatalogItem(
  input: AddCatalogItemInput
): Promise<CatalogItem> {
  const { data, error } = await supabase
    .from("catalog_items")
    .insert({
      category_id: input.category_id,
      name: input.name,
      description: input.description ?? null,
      unit: input.unit,
      is_veg: input.is_veg,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
