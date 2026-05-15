/**
 * MealMate - GroupCard Component
 * Displays a group with image, name, description, stacked member avatars,
 * and an unread message badge.
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
} from "../constants/theme";
import type { Group, GroupMessage, Profile } from "../lib/types";

interface GroupCardProps {
  group: Group & {
    member_count: number;
    last_message: GroupMessage | null;
  };
  memberAvatars?: Pick<Profile, "id" | "full_name" | "avatar_url">[];
  unreadCount?: number;
  onPress: () => void;
}

export function GroupCard({
  group,
  memberAvatars = [],
  unreadCount = 0,
  onPress,
}: GroupCardProps) {
  const getTimeAgo = (dateStr: string | null): string => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  const lastActivity = group.last_message
    ? getTimeAgo(group.last_message.created_at)
    : getTimeAgo(group.created_at);

  const lastMessagePreview = group.last_message
    ? group.last_message.message_type === "system"
      ? group.last_message.content
      : group.last_message.content.length > 40
        ? group.last_message.content.slice(0, 40) + "…"
        : group.last_message.content
    : "No messages yet";

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Group Image / Icon */}
      {group.image_url ? (
        <Image source={{ uri: group.image_url }} style={styles.groupImage} />
      ) : (
        <View style={styles.groupImagePlaceholder}>
          <Text style={styles.groupImageIcon}>
            {group.name.slice(0, 1).toUpperCase()}
          </Text>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {/* Top row: name + time */}
        <View style={styles.topRow}>
          <Text style={styles.groupName} numberOfLines={1}>
            {group.name}
          </Text>
          <Text style={styles.timeText}>{lastActivity}</Text>
        </View>

        {/* Last message preview */}
        <Text style={styles.lastMessage} numberOfLines={1}>
          {lastMessagePreview}
        </Text>

        {/* Bottom row: avatars + member count + badge */}
        <View style={styles.bottomRow}>
          {/* Stacked avatars */}
          <View style={styles.avatarStack}>
            {memberAvatars.slice(0, 5).map((member, index) => (
              <View
                key={member.id}
                style={[styles.avatarWrapper, { marginLeft: index > 0 ? -10 : 0, zIndex: 5 - index }]}
              >
                {member.avatar_url ? (
                  <Image
                    source={{ uri: member.avatar_url }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitial}>
                      {member.full_name?.[0]?.toUpperCase() ?? "?"}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Member count */}
          <Text style={styles.memberCount}>
            {group.member_count} member{group.member_count !== 1 ? "s" : ""}
          </Text>

          {/* Unread badge */}
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginHorizontal: Spacing.xxl,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: Spacing.md,
  },
  groupImage: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
  },
  groupImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.saffron,
    alignItems: "center",
    justifyContent: "center",
  },
  groupImageIcon: {
    fontSize: 24,
    fontWeight: FontWeight.heavy,
    color: Colors.white,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  groupName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.charcoal,
    flex: 1,
    marginRight: Spacing.sm,
  },
  timeText: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    fontWeight: FontWeight.medium,
  },
  lastMessage: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: Spacing.sm,
  },
  avatarStack: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarWrapper: {
    borderWidth: 2,
    borderColor: Colors.surface,
    borderRadius: 12,
  },
  avatarImage: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  avatarPlaceholder: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.masalaBrown,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  memberCount: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    fontWeight: FontWeight.medium,
  },
  badge: {
    backgroundColor: Colors.saffron,
    borderRadius: BorderRadius.full,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "auto",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
});
