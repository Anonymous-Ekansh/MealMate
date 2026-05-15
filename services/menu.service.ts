/**
 * MealMate - Menu Service
 * Supabase CRUD operations for menu_items with filtering.
 */

import { supabase } from "../lib/supabase";
import type { MenuItem, MenuItemInsert } from "../lib/types";
import { notifyGroupMembersOfMenuItem } from "./notifications.service";

/**
 * Fetch menu items with optional filters.
 * @param userId - Filter by user ID (optional, defaults to current user)
 * @param category - Filter by category (optional)
 * @param date - Filter by added_date (optional, format: YYYY-MM-DD)
 */
export async function getMenuItems(
  userId?: string,
  category?: string,
  date?: string
): Promise<MenuItem[]> {
  let query = supabase
    .from("menu_items")
    .select("*")
    .order("created_at", { ascending: false });

  if (userId) {
    query = query.eq("user_id", userId);
  }

  if (category) {
    query = query.eq("category", category);
  }

  if (date) {
    query = query.eq("added_date", date);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/**
 * Fetch all menu items for a user on a specific date, ordered by time.
 */
export async function getMenuItemsByDate(
  userId: string,
  date: string
): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("user_id", userId)
    .eq("added_date", date)
    .order("added_time", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Add a new menu item.
 */
export async function addMenuItem(
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

  // Trigger group notifications quietly
  notifyGroupMembersOfMenuItem(
    item.item_name,
    item.category,
    item.added_time || null
  ).catch((e) => console.log("Failed to notify group members", e));

  return data;
}

/**
 * Update an existing menu item.
 */
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

/**
 * Delete a menu item.
 */
export async function deleteMenuItem(id: string): Promise<void> {
  const { error } = await supabase.from("menu_items").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Move a menu item to a different category.
 */
export async function moveCategory(
  id: string,
  newCategory: string
): Promise<MenuItem> {
  const { data, error } = await supabase
    .from("menu_items")
    .update({ category: newCategory })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Upload an image for a menu item and return the public URL.
 */
export async function uploadMenuItemImage(
  uri: string,
  fileName: string
): Promise<string> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Not authenticated");

  // Fetch the image as a blob
  const response = await fetch(uri);
  const blob = await response.blob();

  const filePath = `${user.id}/${Date.now()}_${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("menu-images")
    .upload(filePath, blob, {
      contentType: "image/jpeg",
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from("menu-images").getPublicUrl(filePath);

  return publicUrl;
}

/**
 * Fetch menu items for a specific user with optional category and date range filters.
 * Used for profile meal history views.
 */
export async function getUserMenuItems(
  userId: string,
  category?: string,
  startDate?: string,
  endDate?: string
): Promise<MenuItem[]> {
  let query = supabase
    .from("menu_items")
    .select("*")
    .eq("user_id", userId)
    .order("added_date", { ascending: false })
    .order("added_time", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  if (startDate) {
    query = query.gte("added_date", startDate);
  }

  if (endDate) {
    query = query.lte("added_date", endDate);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}
