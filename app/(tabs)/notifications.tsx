/**
 * MealMate - Notifications Tab
 * Displays user notifications with unread styling and mark-all-as-read functionality.
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Colors, Spacing, FontSize, FontWeight } from "../../constants/theme";
import { useAuthStore } from "../../stores/useAuthStore";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../../services/notifications.service";
import { NotificationCard } from "../../components/NotificationCard";
import { AppIcon } from "../../components/AppIcon";
import type { Notification } from "../../lib/types";

export default function NotificationsScreen() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  // Fetch notifications
  const {
    data: notifications = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => getNotifications(user!.id),
    enabled: !!user?.id,
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Mark single as read
  const markReadMutation = useMutation({
    mutationFn: (id: string) => markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });

  // Mark all as read
  const markAllReadMutation = useMutation({
    mutationFn: () => markAllAsRead(user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });

  const handlePress = (notification: Notification) => {
    if (!notification.is_read) {
      markReadMutation.mutate(notification.id);
    }
    // Could also navigate based on notification type here
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.subtitle}>
              {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
            </Text>
          )}
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {markAllReadMutation.isPending ? (
              <ActivityIndicator size="small" color={Colors.saffron} />
            ) : (
              <Text style={styles.markAllText}>Mark all read</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.saffron} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationCard
              notification={item}
              onPress={() => handlePress(item)}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={Colors.saffron}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <AppIcon name="mail-open-outline" size={56} color={Colors.textLight} />
              <Text style={styles.emptyTitle}>All caught up!</Text>
              <Text style={styles.emptySubtitle}>
                No new notifications at the moment.
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.heavy,
    color: Colors.charcoal,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.saffron,
    fontWeight: FontWeight.semibold,
    marginTop: 2,
  },
  markAllText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.saffron,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.huge * 2,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.charcoal,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
});
