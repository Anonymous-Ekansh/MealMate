/**
 * MealMate - Group Chat Screen
 * Real-time group chat with text input, system messages, and member info header.
 */

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
} from "../../constants/theme";
import { useAuthStore } from "../../stores/useAuthStore";
import {
  getGroupById,
  getGroupMessages,
  getGroupMembers,
  sendMessage,
  sendSystemMessage,
  leaveGroup,
} from "../../services/groups.service";
import { useRealtimeMessages } from "../../hooks/useRealtime";
import { ChatBubble } from "../../components/ChatBubble";
import { AppIcon } from "../../components/AppIcon";
import type { GroupMessage, Profile } from "../../lib/types";

export default function GroupChatScreen() {
  const { id: groupId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);

  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [localMessages, setLocalMessages] = useState<
    (GroupMessage & { sender: Profile | null })[]
  >([]);
  const flatListRef = useRef<FlatList>(null);

  // Fetch group details
  const { data: group, isLoading: groupLoading } = useQuery({
    queryKey: ["group", groupId],
    queryFn: () => getGroupById(groupId!),
    enabled: !!groupId,
  });

  // Fetch members
  const { data: members = [] } = useQuery({
    queryKey: ["groupMembers", groupId],
    queryFn: () => getGroupMembers(groupId!),
    enabled: !!groupId,
  });

  // Fetch messages
  const {
    data: serverMessages = [],
    isLoading: messagesLoading,
  } = useQuery({
    queryKey: ["groupMessages", groupId],
    queryFn: () => getGroupMessages(groupId!, 100),
    enabled: !!groupId,
  });

  // Sync server messages to local state
  useEffect(() => {
    if (serverMessages.length > 0) {
      setLocalMessages(serverMessages);
    }
  }, [serverMessages]);

  // Real-time subscription
  useRealtimeMessages(groupId, (newMessage) => {
    // Refetch to get the full message with sender profile
    queryClient.invalidateQueries({ queryKey: ["groupMessages", groupId] });
  });

  // Send message handler
  const handleSend = useCallback(async () => {
    const text = messageText.trim();
    if (!text || isSending || !groupId) return;

    setIsSending(true);
    setMessageText("");

    try {
      await sendMessage(groupId, text);
      // Will be picked up by realtime / refetch
      queryClient.invalidateQueries({ queryKey: ["groupMessages", groupId] });
    } catch (error: any) {
      setMessageText(text); // Restore on failure
      Alert.alert("Error", error?.message ?? "Failed to send message");
    } finally {
      setIsSending(false);
    }
  }, [messageText, isSending, groupId, queryClient]);

  // Leave group handler
  const handleLeaveGroup = () => {
    Alert.alert(
      "Leave Group",
      `Are you sure you want to leave "${group?.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            try {
              if (user && groupId) {
                await leaveGroup(groupId, user.id);
                queryClient.invalidateQueries({ queryKey: ["myGroups"] });
                router.back();
              }
            } catch (error: any) {
              Alert.alert("Error", error?.message ?? "Failed to leave group");
            }
          },
        },
      ]
    );
  };

  // Inverted data (newest at bottom but FlatList is inverted)
  const invertedMessages = [...localMessages].reverse();

  const isLoading = groupLoading || messagesLoading;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          {group ? (
            <>
              {group.image_url ? (
                <Image
                  source={{ uri: group.image_url }}
                  style={styles.headerAvatar}
                />
              ) : (
                <View style={styles.headerAvatarPlaceholder}>
                  <Text style={styles.headerAvatarText}>
                    {group.name[0]?.toUpperCase()}
                  </Text>
                </View>
              )}
              <View>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  {group.name}
                </Text>
                <Text style={styles.headerSubtitle}>
                  {members.length} member{members.length !== 1 ? "s" : ""}
                </Text>
              </View>
            </>
          ) : (
            <ActivityIndicator size="small" color={Colors.saffron} />
          )}
        </View>

        <TouchableOpacity
          onPress={handleLeaveGroup}
          style={styles.settingsBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <AppIcon name="settings-outline" size={22} color={Colors.charcoal} />
        </TouchableOpacity>
      </View>

      {/* Member strip */}
      {members.length > 0 && (
        <View style={styles.memberStrip}>
          {members.slice(0, 6).map((m: any) => (
            <View key={m.user_id} style={styles.memberChip}>
              {m.profile?.avatar_url ? (
                <Image
                  source={{ uri: m.profile.avatar_url }}
                  style={styles.memberChipAvatar}
                />
              ) : (
                <View style={styles.memberChipPlaceholder}>
                  <Text style={styles.memberChipInitial}>
                    {m.profile?.full_name?.[0]?.toUpperCase() ?? "?"}
                  </Text>
                </View>
              )}
            </View>
          ))}
          {members.length > 6 && (
            <View style={[styles.memberChip, styles.memberChipMore]}>
              <Text style={styles.memberChipMoreText}>
                +{members.length - 6}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.chatArea}
        keyboardVerticalOffset={0}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.saffron} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={invertedMessages}
            keyExtractor={(item) => item.id}
            inverted
            renderItem={({ item }) => (
              <ChatBubble
                message={item}
                isMe={item.sender_id === user?.id}
                onAvatarPress={(senderId) => router.push(`/user/${senderId}`)}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <AppIcon name="chatbubbles-outline" size={48} color={Colors.textLight} />
                <Text style={styles.emptyChatText}>
                  No messages yet.{"\n"}Say hello to the group!
                </Text>
              </View>
            }
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        )}

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={Colors.textLight}
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={1000}
            returnKeyType="default"
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!messageText.trim() || isSending) && styles.sendBtnDisabled,
            ]}
            onPress={handleSend}
            disabled={!messageText.trim() || isSending}
            activeOpacity={0.8}
          >
            {isSending ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <AppIcon name="send" size={20} color={Colors.white} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    padding: Spacing.sm,
  },
  backIcon: {
    fontSize: 22,
    color: Colors.saffron,
    fontWeight: FontWeight.bold,
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: Spacing.sm,
    gap: Spacing.md,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
  },
  headerAvatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.saffron,
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatarText: {
    fontSize: 16,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.charcoal,
    maxWidth: 200,
  },
  headerSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
  },
  settingsBtn: {
    padding: Spacing.sm,
  },
  settingsIcon: {
    fontSize: 20,
  },

  // Member strip
  memberStrip: {
    flexDirection: "row",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: 4,
  },
  memberChip: {},
  memberChipAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  memberChipPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.masalaBrown,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  memberChipInitial: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  memberChipMore: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  memberChipMoreText: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
  },

  // Chat
  chatArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messageList: {
    paddingVertical: Spacing.md,
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  emptyChat: {
    alignItems: "center",
    paddingVertical: Spacing.huge,
    transform: [{ scaleY: -1 }], // Because FlatList is inverted
  },
  emptyChatIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyChatText: {
    fontSize: FontSize.md,
    color: Colors.textLight,
    textAlign: "center",
    lineHeight: 22,
  },

  // Input bar
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: Spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.cream,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.charcoal,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.saffron,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.saffron,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendBtnDisabled: {
    backgroundColor: Colors.borderLight,
    shadowOpacity: 0,
    elevation: 0,
  },
  sendIcon: {
    fontSize: 20,
    color: Colors.white,
  },
});
