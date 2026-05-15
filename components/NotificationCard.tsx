/**
 * MealMate - NotificationCard Component
 * Displays a single notification with read/unread state.
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
} from "../constants/theme";
import type { Notification } from "../lib/types";

interface NotificationCardProps {
  notification: Notification;
  onPress: () => void;
}

export function NotificationCard({
  notification,
  onPress,
}: NotificationCardProps) {
  const getTimeAgo = (dateStr: string): string => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  const isUnread = !notification.is_read;

  return (
    <TouchableOpacity
      style={[styles.card, isUnread && styles.cardUnread]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text
            style={[styles.title, isUnread && styles.titleUnread]}
            numberOfLines={2}
          >
            {notification.title}
          </Text>
          <Text style={styles.time}>{getTimeAgo(notification.created_at)}</Text>
        </View>
        {notification.content ? (
          <Text style={styles.body} numberOfLines={2}>
            {notification.content}
          </Text>
        ) : null}
      </View>
      {isUnread && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    borderLeftWidth: 4,
    borderLeftColor: "transparent",
  },
  cardUnread: {
    backgroundColor: "#FFFAEC", // Very light saffron tint
    borderLeftColor: Colors.saffron,
  },
  content: {
    flex: 1,
    marginRight: Spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
    gap: Spacing.md,
  },
  title: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.charcoal,
    lineHeight: 20,
  },
  titleUnread: {
    fontWeight: FontWeight.bold,
  },
  time: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    marginTop: 2,
  },
  body: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.saffron,
  },
});
