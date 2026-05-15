/**
 * MealMate - ChatBubble Component
 * Renders text, other, and system chat messages with proper alignment.
 */

import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
} from "../constants/theme";
import type { GroupMessage, Profile } from "../lib/types";

interface ChatBubbleProps {
  message: GroupMessage & { sender: Profile | null };
  isMe: boolean;
  onAvatarPress?: (userId: string) => void;
}

export function ChatBubble({ message, isMe, onAvatarPress }: ChatBubbleProps) {
  // System message — centered, italic
  if (message.message_type === "system") {
    return (
      <View style={styles.systemContainer}>
        <View style={styles.systemBubble}>
          <Text style={styles.systemText}>{message.content}</Text>
        </View>
      </View>
    );
  }

  const senderName =
    message.sender?.full_name?.split(" ")[0] ?? "Unknown";
  const avatarUrl = message.sender?.avatar_url;

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // My message — right-aligned, saffron
  if (isMe) {
    return (
      <View style={styles.myContainer}>
        <View style={styles.myBubble}>
          <Text style={styles.myText}>{message.content}</Text>
          <Text style={styles.myTime}>{formatTime(message.created_at)}</Text>
        </View>
      </View>
    );
  }

  // Other's message — left-aligned, gray, with avatar + name
  return (
    <View style={styles.otherContainer}>
      {/* Avatar — tappable to view user profile */}
      <TouchableOpacity
        onPress={() => message.sender?.id && onAvatarPress?.(message.sender.id)}
        activeOpacity={0.7}
      >
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>
              {senderName[0]?.toUpperCase() ?? "?"}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.otherContent}>
        {/* Sender name */}
        <Text style={styles.senderName}>{senderName}</Text>

        {/* Bubble */}
        <View style={styles.otherBubble}>
          <Text style={styles.otherText}>{message.content}</Text>
          <Text style={styles.otherTime}>
            {formatTime(message.created_at)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ─── My messages (right) ──────────────────────
  myContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  myBubble: {
    backgroundColor: Colors.saffron,
    borderRadius: BorderRadius.xl,
    borderBottomRightRadius: 4,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.lg,
    maxWidth: "78%",
  },
  myText: {
    fontSize: FontSize.md,
    color: Colors.white,
    lineHeight: 20,
  },
  myTime: {
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
    alignSelf: "flex-end",
    marginTop: 4,
  },

  // ─── Other's messages (left) ──────────────────
  otherContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  avatarPlaceholder: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.masalaBrown,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 12,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  otherContent: {
    maxWidth: "75%",
  },
  senderName: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: 2,
    marginLeft: Spacing.sm,
  },
  otherBubble: {
    backgroundColor: "#F0EDEA",
    borderRadius: BorderRadius.xl,
    borderBottomLeftRadius: 4,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.lg,
  },
  otherText: {
    fontSize: FontSize.md,
    color: Colors.charcoal,
    lineHeight: 20,
  },
  otherTime: {
    fontSize: 10,
    color: Colors.textLight,
    alignSelf: "flex-end",
    marginTop: 4,
  },

  // ─── System messages (center) ─────────────────
  systemContainer: {
    alignItems: "center",
    paddingHorizontal: Spacing.xxl,
    marginVertical: Spacing.sm,
  },
  systemBubble: {
    backgroundColor: "rgba(28,28,30,0.06)",
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.lg,
  },
  systemText: {
    fontSize: FontSize.xs,
    fontStyle: "italic",
    color: Colors.textLight,
    textAlign: "center",
  },
});
