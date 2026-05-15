/**
 * MealMate - Notification Hooks
 * React Query hooks for notifications and activity logs.
 */

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  subscribeToNotifications,
  getGroupActivityLogs,
} from "../services/notificationService";

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: getMyNotifications,
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ["notifications", "unreadCount"],
    queryFn: getUnreadCount,
    refetchInterval: 30_000, // Poll every 30s as a fallback
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

/** Hook that subscribes to realtime notifications for a user */
export function useRealtimeNotifications(userId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const channel = subscribeToNotifications(userId, (_notification) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });

    return () => {
      channel.unsubscribe();
    };
  }, [userId, queryClient]);
}

export function useGroupActivityLogs(groupId: string) {
  return useQuery({
    queryKey: ["activityLogs", groupId],
    queryFn: () => getGroupActivityLogs(groupId),
    enabled: !!groupId,
  });
}
