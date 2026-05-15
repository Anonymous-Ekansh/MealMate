/**
 * MealMate - Notifications Service
 * Supabase operations for notifications: fetch, mark read, auto-trigger.
 */

import { supabase } from "../lib/supabase";
import type { Notification } from "../lib/types";

/**
 * Fetch notifications for a user, ordered newest first.
 */
export async function getNotifications(
  userId: string
): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw error;
  return data ?? [];
}

/**
 * Get unread notification count.
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) throw error;
  return count ?? 0;
}

/**
 * Mark a single notification as read.
 */
export async function markAsRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  if (error) throw error;
}

/**
 * Mark all notifications as read for a user.
 */
export async function markAllAsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) throw error;
}

/**
 * Send notifications to all group members of the current user
 * when a menu item is added.
 */
export async function notifyGroupMembersOfMenuItem(
  itemName: string,
  category: string,
  time: string | null
): Promise<void> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return;

  // Get user's name
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const senderName = profile?.full_name ?? "Someone";

  // Find all groups user is in
  const { data: memberships } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("user_id", user.id);

  if (!memberships || memberships.length === 0) return;

  const groupIds = memberships.map((m: any) => m.group_id);

  // Find all other members in those groups
  const { data: groupMembers } = await supabase
    .from("group_members")
    .select("user_id")
    .in("group_id", groupIds)
    .neq("user_id", user.id);

  if (!groupMembers || groupMembers.length === 0) return;

  // Deduplicate member IDs (user might be in multiple groups with same people)
  const uniqueUserIds = [...new Set(groupMembers.map((m: any) => m.user_id))];

  const timeStr = time ? ` at ${time}` : "";
  const notifications = uniqueUserIds.map((uid) => ({
    user_id: uid,
    title: `${senderName} added ${itemName}`,
    content: `Added to ${category}${timeStr}`,
  }));

  if (notifications.length > 0) {
    await supabase.from("notifications").insert(notifications);
  }
}
