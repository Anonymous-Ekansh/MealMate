/**
 * MealMate - Profile Tab
 * Editable profile section + meal history with category tabs.
 */

import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
} from "../../constants/theme";
import { useAuthStore } from "../../stores/useAuthStore";
import { useCategoryMaps } from "../../hooks/useCategories";
import { getCategoryIconName } from "../../constants/categoryTheme";
import { AppIcon } from "../../components/AppIcon";
import { supabase } from "../../lib/supabase";
import { getUserMenuItems } from "../../services/menu.service";
import { Toast } from "../../components/Toast";
import type { MenuItem } from "../../lib/types";

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();

  // Editable fields
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [avatarUri, setAvatarUri] = useState(profile?.avatar_url ?? null);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Meal history
  const { categories, labelBySlug, slugs } = useCategoryMaps();
  const [activeCategory, setActiveCategory] = useState<string>("");

  useEffect(() => {
    if (!activeCategory && slugs[0]) {
      setActiveCategory(slugs[0]);
    }
  }, [slugs, activeCategory]);
  const [dateFilter, setDateFilter] = useState<string>("");

  // Toast
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
    visible: boolean;
  }>({ message: "", type: "success", visible: false });

  // Sync profile changes
  useEffect(() => {
    setFullName(profile?.full_name ?? "");
    setBio(profile?.bio ?? "");
    setAvatarUri(profile?.avatar_url ?? null);
  }, [profile]);

  // Fetch meal history
  const {
    data: mealItems = [],
    isLoading: mealsLoading,
    refetch: refetchMeals,
    isRefetching,
  } = useQuery({
    queryKey: ["userMenuItems", user?.id, activeCategory, dateFilter],
    queryFn: () =>
      getUserMenuItems(
        user!.id,
        activeCategory || undefined,
        dateFilter || undefined
      ),
    enabled: !!user?.id,
  });

  // Pick avatar
  const handlePickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
      setIsEditing(true);
    }
  };

  // Save profile
  const handleSave = useCallback(async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      const updates: Record<string, any> = {
        full_name: fullName.trim() || null,
        bio: bio.trim() || null,
      };

      // If avatar changed to a local file, we'd upload it here
      // For now, just update the text fields
      if (avatarUri && avatarUri !== profile?.avatar_url) {
        updates.avatar_url = avatarUri;
      }

      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      setIsEditing(false);
      setToast({ message: "Profile updated!", type: "success", visible: true });
    } catch (error: any) {
      setToast({
        message: error?.message ?? "Failed to save",
        type: "error",
        visible: true,
      });
    } finally {
      setIsSaving(false);
    }
  }, [user, fullName, bio, avatarUri, profile, setProfile]);

  const hasChanges =
    fullName !== (profile?.full_name ?? "") ||
    bio !== (profile?.bio ?? "") ||
    avatarUri !== (profile?.avatar_url ?? null);

  // Date filter
  const handleDateFilter = () => {
    if (dateFilter) {
      setDateFilter("");
    } else {
      // Set to today
      setDateFilter(new Date().toISOString().split("T")[0]);
    }
  };

  // Format helpers
  const formatDate = (d: string | null) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  const formatTime = (t: string | null) => {
    if (!t) return "";
    const [h, m] = t.split(":");
    const hr = parseInt(h, 10);
    return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
  };

  // Render meal item
  const renderMealItem = ({ item }: { item: MenuItem }) => (
    <View style={styles.mealItem}>
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.mealImage} />
      ) : (
        <View style={styles.mealImagePlaceholder}>
          <AppIcon
            name={getCategoryIconName(item.category)}
            size={28}
            color={Colors.saffron}
          />
        </View>
      )}
      <View style={styles.mealContent}>
        <Text style={styles.mealName} numberOfLines={1}>
          {item.item_name}
        </Text>
        {item.description ? (
          <Text style={styles.mealDesc} numberOfLines={1}>
            {item.description}
          </Text>
        ) : null}
        <View style={styles.mealMeta}>
          {item.added_date ? (
            <View style={styles.mealMetaItem}>
              <AppIcon name="calendar-outline" size={12} color={Colors.textLight} />
              <Text style={styles.mealMetaText}>{formatDate(item.added_date)}</Text>
            </View>
          ) : null}
          {item.added_time ? (
            <View style={styles.mealMetaItem}>
              <AppIcon name="time-outline" size={12} color={Colors.textLight} />
              <Text style={styles.mealMetaText}>{formatTime(item.added_time)}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={() => setToast((t) => ({ ...t, visible: false }))}
      />

      <FlatList
        data={mealItems}
        keyExtractor={(item) => item.id}
        renderItem={renderMealItem}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetchMeals}
            tintColor={Colors.saffron}
          />
        }
        ListHeaderComponent={
          <>
            {/* ─── Profile Header ─── */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Profile</Text>
            </View>

            {/* ─── Profile Card ─── */}
            <View style={styles.profileCard}>
              {/* Avatar */}
              <TouchableOpacity
                onPress={handlePickAvatar}
                style={styles.avatarContainer}
              >
                {avatarUri ? (
                  <Image
                    source={{ uri: avatarUri }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Text style={styles.avatarInitial}>
                      {fullName?.[0]?.toUpperCase() ?? "?"}
                    </Text>
                  </View>
                )}
                <View style={styles.avatarBadge}>
                  <AppIcon name="camera" size={14} color={Colors.white} />
                </View>
              </TouchableOpacity>

              {/* Email (read-only) */}
              <Text style={styles.email}>{profile?.email ?? ""}</Text>

              {/* Editable name */}
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Name</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={fullName}
                  onChangeText={(t) => {
                    setFullName(t);
                    setIsEditing(true);
                  }}
                  placeholder="Your full name"
                  placeholderTextColor={Colors.textLight}
                  maxLength={60}
                />
              </View>

              {/* Editable bio */}
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Bio</Text>
                <TextInput
                  style={[styles.fieldInput, styles.bioInput]}
                  value={bio}
                  onChangeText={(t) => {
                    setBio(t);
                    setIsEditing(true);
                  }}
                  placeholder="Tell us about yourself..."
                  placeholderTextColor={Colors.textLight}
                  multiline
                  maxLength={200}
                  textAlignVertical="top"
                />
              </View>

              {/* Save button */}
              {hasChanges && (
                <TouchableOpacity
                  style={[
                    styles.saveBtn,
                    isSaving && styles.saveBtnDisabled,
                  ]}
                  onPress={handleSave}
                  disabled={isSaving}
                  activeOpacity={0.85}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color={Colors.white} />
                  ) : (
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              )}

              {/* Logout */}
              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={() =>
                  Alert.alert("Sign Out", "Are you sure?", [
                    { text: "Cancel", style: "cancel" },
                    { text: "Sign Out", style: "destructive", onPress: logout },
                  ])
                }
                activeOpacity={0.85}
              >
                <Text style={styles.logoutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>

            {/* ─── Meal History Section ─── */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Meal History</Text>
              <TouchableOpacity
                style={[
                  styles.dateFilterBtn,
                  dateFilter && styles.dateFilterBtnActive,
                ]}
                onPress={handleDateFilter}
              >
                <AppIcon
                  name="calendar-outline"
                  size={16}
                  color={dateFilter ? Colors.white : Colors.textSecondary}
                />
                <Text
                  style={[
                    styles.dateFilterText,
                    dateFilter && styles.dateFilterTextActive,
                  ]}
                >
                  {dateFilter ? "Today" : "All dates"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Category tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryTabs}
            >
              {categories.map((cat) => {
                const isActive = activeCategory === cat.slug;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.tab, isActive && styles.tabActive]}
                    onPress={() => setActiveCategory(cat.slug)}
                    activeOpacity={0.8}
                  >
                    <AppIcon
                      name={getCategoryIconName(cat.slug, cat.icon_name)}
                      size={16}
                      color={isActive ? Colors.white : Colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.tabText,
                        isActive && styles.tabTextActive,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Items count */}
            <View style={styles.countRow}>
              <Text style={styles.countText}>
                {mealItems.length} item{mealItems.length !== 1 ? "s" : ""}
              </Text>
            </View>
          </>
        }
        ListEmptyComponent={
          mealsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.saffron} />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <AppIcon
                name={getCategoryIconName(activeCategory)}
                size={48}
                color={Colors.textLight}
              />
              <Text style={styles.emptyText}>
                No {labelBySlug[activeCategory] ?? activeCategory} items yet
              </Text>
            </View>
          )
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingBottom: 100,
  },

  // Header
  header: {
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.heavy,
    color: Colors.charcoal,
  },

  // Profile card
  profileCard: {
    marginHorizontal: Spacing.xxl,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: Spacing.xxl,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: Colors.saffron,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.saffron,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  avatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.saffron,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarBadgeIcon: { fontSize: 14 },
  email: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },

  // Editable fields
  fieldRow: {
    width: "100%",
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fieldInput: {
    backgroundColor: Colors.cream,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.charcoal,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  bioInput: {
    minHeight: 60,
    paddingTop: Spacing.sm + 2,
  },

  // Save
  saveBtn: {
    backgroundColor: Colors.saffron,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.sm,
    width: "100%",
    alignItems: "center",
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },

  // Logout
  logoutBtn: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  logoutText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.chiliRed,
  },

  // Section header
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xxl,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.charcoal,
  },
  dateFilterBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 4,
  },
  dateFilterBtnActive: {
    backgroundColor: Colors.saffron,
    borderColor: Colors.saffron,
  },
  dateFilterIcon: { fontSize: 12 },
  dateFilterText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  dateFilterTextActive: { color: Colors.white },

  // Category tabs
  categoryTabs: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    gap: 6,
  },
  tabActive: {
    backgroundColor: Colors.saffron,
    borderColor: Colors.saffron,
  },
  tabIcon: { fontSize: 14 },
  tabText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  tabTextActive: { color: Colors.white },

  // Count
  countRow: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.sm,
  },
  countText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textLight,
  },

  // Meal items
  mealItem: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.xxl,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: "hidden",
  },
  mealImage: {
    width: 72,
    height: 72,
  },
  mealImagePlaceholder: {
    width: 72,
    height: 72,
    backgroundColor: Colors.cream,
    alignItems: "center",
    justifyContent: "center",
  },
  mealImageIcon: { fontSize: 28 },
  mealContent: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: "center",
    gap: 2,
  },
  mealName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.charcoal,
  },
  mealDesc: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  mealMeta: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: 2,
  },
  mealMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  mealMetaText: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
  },

  // Loading / empty
  loadingContainer: {
    paddingVertical: Spacing.huge,
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.huge,
  },
  emptyIcon: { fontSize: 40, marginBottom: Spacing.md },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textLight,
  },
});
