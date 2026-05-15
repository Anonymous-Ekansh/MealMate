/**
 * MealMate - Notification Service
 * Supabase operations for notifications and activity logs.
 */

import { supabase } from "../lib/supabase";
import type { Notification, ActivityLog, ActivityLogInsert } from "../lib/types";

// ─── Notifications ──────────────────────────────────────────

/** Get all notifications for the current user */
export async function getMyNotifications(): Promise<Notification[]> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/** Get unread notification count */
export async function getUnreadCount(): Promise<number> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Not authenticated");

  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) throw error;
  return count ?? 0;
}

/** Mark a notification as read */
export async function markNotificationRead(
  notificationId: string
): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  if (error) throw error;
}

/** Mark all notifications as read */
export async function markAllNotificationsRead(): Promise<void> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) throw error;
}

/** Subscribe to new notifications (realtime) */
export function subscribeToNotifications(
  userId: string,
  onNewNotification: (notification: Notification) => void
) {
  return supabase
    .channel(`notifications:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => onNewNotification(payload.new as Notification)
    )
    .subscribe();
}

// ─── Activity Logs ──────────────────────────────────────────

/** Log an activity */
export async function logActivity(
  log: Omit<ActivityLogInsert, "user_id">
): Promise<ActivityLog> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("activity_logs")
    .insert({ ...log, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Get activity logs for a group */
export async function getGroupActivityLogs(
  groupId: string
): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from("activity_logs")
    .select("*")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw error;
  return data;
}
