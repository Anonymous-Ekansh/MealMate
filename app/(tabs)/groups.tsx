/**
 * MealMate - Groups Tab
 * Displays user's groups with a create group flow.
 */

import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
} from "../../constants/theme";
import { useAuthStore } from "../../stores/useAuthStore";
import {
  getMyGroups,
  createGroup,
  getGroupMemberAvatars,
} from "../../services/groups.service";
import { GroupCard } from "../../components/GroupCard";
import { CreateGroupModal } from "../../components/CreateGroupModal";
import { Toast } from "../../components/Toast";
import { AppIcon } from "../../components/AppIcon";
import type { Profile } from "../../lib/types";

export default function GroupsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [memberAvatarsMap, setMemberAvatarsMap] = useState<
    Record<string, Pick<Profile, "id" | "full_name" | "avatar_url">[]>
  >({});
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
    visible: boolean;
  }>({ message: "", type: "success", visible: false });

  // Fetch groups
  const {
    data: groups = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["myGroups", user?.id],
    queryFn: () => getMyGroups(user!.id),
    enabled: !!user?.id,
  });

  // Fetch member avatars for each group
  useEffect(() => {
    if (groups.length === 0) return;
    const fetchAvatars = async () => {
      const map: typeof memberAvatarsMap = {};
      await Promise.all(
        groups.map(async (g) => {
          try {
            map[g.id] = await getGroupMemberAvatars(g.id, 5);
          } catch {
            map[g.id] = [];
          }
        })
      );
      setMemberAvatarsMap(map);
    };
    fetchAvatars();
  }, [groups]);

  // Create group mutation
  const createMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      description: string;
      imageUri: string | null;
      memberIds: string[];
    }) => {
      return createGroup(
        {
          name: data.name,
          description: data.description || undefined,
          image_url: undefined, // Image upload could be added here
        },
        data.memberIds
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myGroups"] });
      setShowCreateModal(false);
      setToast({
        message: "Group created successfully",
        type: "success",
        visible: true,
      });
    },
    onError: (error: any) => {
      setToast({
        message: error?.message ?? "Failed to create group",
        type: "error",
        visible: true,
      });
    },
  });

  const handleGroupPress = useCallback(
    (groupId: string) => {
      router.push(`/group/${groupId}`);
    },
    [router]
  );

  // Empty state
  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyState}>
        <AppIcon name="people-outline" size={56} color={Colors.textLight} />
        <Text style={styles.emptyTitle}>No groups yet</Text>
        <Text style={styles.emptySubtitle}>
          Create a group to start planning meals{"\n"}with friends and family!
        </Text>
        <TouchableOpacity
          style={styles.emptyBtn}
          onPress={() => setShowCreateModal(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.emptyBtnText}>Create Your First Group</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={() => setToast((t) => ({ ...t, visible: false }))}
      />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Groups</Text>
          <Text style={styles.subtitle}>
            {groups.length} group{groups.length !== 1 ? "s" : ""}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => setShowCreateModal(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.createBtnIcon}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Loading */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.saffron} />
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <GroupCard
              group={item}
              memberAvatars={memberAvatarsMap[item.id] ?? []}
              onPress={() => handleGroupPress(item.id)}
            />
          )}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={Colors.saffron}
              colors={[Colors.saffron]}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Create Group Modal */}
      <CreateGroupModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
        currentUserId={user?.id}
      />
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
    paddingBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.heavy,
    color: Colors.charcoal,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  createBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.saffron,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.saffron,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  createBtnIcon: {
    fontSize: 26,
    color: Colors.white,
    marginTop: -1,
  },
  listContent: {
    paddingBottom: 100,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // Empty
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.huge,
    paddingTop: 40,
  },
  emptyIcon: { fontSize: 60, marginBottom: Spacing.lg },
  emptyTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.charcoal,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Spacing.xxl,
  },
  emptyBtn: {
    backgroundColor: Colors.saffron,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.lg,
  },
  emptyBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
});
