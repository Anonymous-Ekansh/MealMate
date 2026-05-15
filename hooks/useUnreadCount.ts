/**
 * MealMate - useUnreadCount Hook
 * Polls for unread notification count to drive the tab badge.
 */

import { useQuery } from "@tanstack/react-query";
import { getUnreadCount } from "../services/notifications.service";
import { useAuthStore } from "../stores/useAuthStore";

export function useUnreadCount() {
  const user = useAuthStore((s) => s.user);

  const { data: count = 0 } = useQuery({
    queryKey: ["unreadCount", user?.id],
    queryFn: () => getUnreadCount(user!.id),
    enabled: !!user?.id,
    refetchInterval: 15000, // Poll every 15 seconds
  });

  return count;
}
