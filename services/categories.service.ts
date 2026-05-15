/**
 * MealMate - Categories Service
 * Fetches meal categories from Supabase.
 */

import { supabase } from "../lib/supabase";
import type { MealCategory } from "../lib/types";

export async function getCategories(): Promise<MealCategory[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getCategoryBySlug(
  slug: string
): Promise<MealCategory | null> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data;
}
