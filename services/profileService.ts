/**
 * MealMate - Profile Service
 * Supabase operations for the profiles table.
 */

import { supabase } from "../lib/supabase";
import type { Profile, ProfileUpdate } from "../lib/types";

/** Get the currently authenticated user's profile */
export async function getCurrentProfile(): Promise<Profile> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) throw error;
  return data;
}

/** Get a profile by user ID */
export async function getProfileById(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}

/** Get all profiles (for member search, etc.) */
export async function getAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name");

  if (error) throw error;
  return data;
}

/** Update the current user's profile */
export async function updateProfile(
  updates: Omit<ProfileUpdate, "id">
): Promise<Profile> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Search profiles by name */
export async function searchProfiles(query: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .ilike("full_name", `%${query}%`)
    .limit(20);

  if (error) throw error;
  return data;
}
