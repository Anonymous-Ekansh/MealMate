/**
 * MealMate - Menu Item Service
 * Supabase operations for the menu_items table.
 */

import { supabase } from "../lib/supabase";
import type { MenuItem, MenuItemInsert } from "../lib/types";

/** Fetch all menu items for the current user */
export async function getMyMenuItems(): Promise<MenuItem[]> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/** Fetch all menu items (public feed) */
export async function getAllMenuItems(): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/** Fetch menu items by category */
export async function getMenuItemsByCategory(
  category: string
): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("category", category)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/** Fetch a single menu item */
export async function getMenuItemById(id: string): Promise<MenuItem> {
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

/** Create a new menu item */
export async function createMenuItem(
  item: Omit<MenuItemInsert, "user_id">
): Promise<MenuItem> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("menu_items")
    .insert({ ...item, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Update a menu item */
export async function updateMenuItem(
  id: string,
  updates: Partial<Omit<MenuItem, "id" | "user_id" | "created_at">>
): Promise<MenuItem> {
  const { data, error } = await supabase
    .from("menu_items")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Delete a menu item */
export async function deleteMenuItem(id: string): Promise<void> {
  const { error } = await supabase.from("menu_items").delete().eq("id", id);

  if (error) throw error;
}
