/**
 * MealMate - User Profile Screen (read-only)
 * Shows another user's profile and their meal history grouped by category.
 */

import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
} from "../../constants/theme";
import { supabase } from "../../lib/supabase";
import { useCategoryMaps } from "../../hooks/useCategories";
import { getCategoryIconName } from "../../constants/categoryTheme";
import { AppIcon } from "../../components/AppIcon";
import { getUserMenuItems } from "../../services/menu.service";
import type { Profile, MenuItem } from "../../lib/types";

export default function UserProfileScreen() {
  const { id: userId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { categories, labelBySlug, slugs } = useCategoryMaps();
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!activeCategory && slugs[0]) {
      setActiveCategory(slugs[0]);
    }
  }, [slugs, activeCategory]);

  // Fetch user profile
  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async (): Promise<Profile> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Fetch user's menu items for active category
  const { data: menuItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["userMenuItems", userId, activeCategory],
    queryFn: () => getUserMenuItems(userId!, activeCategory || undefined),
    enabled: !!userId,
  });

  // Filter by search
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return menuItems;
    const q = searchQuery.toLowerCase();
    return menuItems.filter(
      (item) =>
        item.item_name.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
    );
  }, [menuItems, searchQuery]);

  // Category counts
  const { data: allItems = [] } = useQuery({
    queryKey: ["userMenuItems", userId, "all"],
    queryFn: () => getUserMenuItems(userId!),
    enabled: !!userId,
  });

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    slugs.forEach((cat) => {
      counts[cat] = allItems.filter((i) => i.category === cat).length;
    });
    return counts;
  }, [allItems, slugs]);

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

  const renderItem = ({ item }: { item: MenuItem }) => (
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
          <Text style={styles.mealDesc} numberOfLines={2}>
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

  const firstName = userProfile?.full_name?.split(" ")[0] ?? "User";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backBtn}
              >
                <Text style={styles.backIcon}>←</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Profile</Text>
              <View style={{ width: 40 }} />
            </View>

            {/* Profile card */}
            {profileLoading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color={Colors.saffron} />
              </View>
            ) : (
              <View style={styles.profileCard}>
                {userProfile?.avatar_url ? (
                  <Image
                    source={{ uri: userProfile.avatar_url }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Text style={styles.avatarInitial}>
                      {firstName[0]?.toUpperCase() ?? "?"}
                    </Text>
                  </View>
                )}
                <Text style={styles.name}>
                  {userProfile?.full_name ?? "Unknown User"}
                </Text>
                <Text style={styles.email}>{userProfile?.email ?? ""}</Text>
                {userProfile?.bio ? (
                  <Text style={styles.bio}>{userProfile.bio}</Text>
                ) : null}

                {/* Stats row */}
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{allItems.length}</Text>
                    <Text style={styles.statLabel}>Items</Text>
                  </View>
                  {categories.slice(0, 3).map((cat) => (
                    <View key={cat.id} style={styles.statItem}>
                      <Text style={styles.statValue}>
                        {categoryCounts[cat.slug] ?? 0}
                      </Text>
                      <AppIcon
                        name={getCategoryIconName(cat.slug, cat.icon_name)}
                        size={18}
                        color={Colors.saffron}
                      />
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Meal history title */}
            <Text style={styles.sectionTitle}>
              {firstName}'s Meals
            </Text>

            {/* Search */}
            <View style={styles.searchContainer}>
              <AppIcon name="search-outline" size={18} color={Colors.textLight} />
              <TextInput
                style={styles.searchInput}
                placeholder={`Search ${firstName}'s items...`}
                placeholderTextColor={Colors.textLight}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <AppIcon name="close-circle" size={18} color={Colors.textLight} />
                </TouchableOpacity>
              )}
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
                    <View
                      style={[
                        styles.tabBadge,
                        isActive && styles.tabBadgeActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.tabBadgeText,
                          isActive && styles.tabBadgeTextActive,
                        ]}
                      >
                        {categoryCounts[cat.slug] ?? 0}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Count */}
            <View style={styles.countRow}>
              <Text style={styles.countText}>
                {filteredItems.length} item
                {filteredItems.length !== 1 ? "s" : ""}
              </Text>
            </View>
          </>
        }
        ListEmptyComponent={
          itemsLoading ? (
            <View style={styles.loadingBox}>
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
                No {labelBySlug[activeCategory] ?? activeCategory} items
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
  container: { flex: 1, backgroundColor: Colors.background },
  listContent: { paddingBottom: 40 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backBtn: { padding: Spacing.sm },
  backIcon: {
    fontSize: 22,
    color: Colors.saffron,
    fontWeight: FontWeight.bold,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
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
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: Colors.saffron,
    marginBottom: Spacing.md,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.saffron,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  name: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.charcoal,
  },
  email: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  bio: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: Spacing.md,
    lineHeight: 20,
    paddingHorizontal: Spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    marginTop: Spacing.xl,
    gap: Spacing.xl,
  },
  statItem: { alignItems: "center" },
  statValue: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.heavy,
    color: Colors.charcoal,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    marginTop: 2,
  },

  // Section
  sectionTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.charcoal,
    paddingHorizontal: Spacing.xxl,
    marginBottom: Spacing.md,
  },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.xxl,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    height: 44,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  searchIcon: { fontSize: 14 },
  searchInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.charcoal,
    paddingVertical: 0,
  },
  clearIcon: {
    fontSize: 14,
    color: Colors.textLight,
    padding: Spacing.xs,
  },

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
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    gap: 4,
  },
  tabActive: {
    backgroundColor: Colors.saffron,
    borderColor: Colors.saffron,
  },
  tabIcon: { fontSize: 13 },
  tabText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  tabTextActive: { color: Colors.white },
  tabBadge: {
    backgroundColor: Colors.borderLight,
    borderRadius: 8,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  tabBadgeActive: { backgroundColor: "rgba(255,255,255,0.3)" },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
  },
  tabBadgeTextActive: { color: Colors.white },

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
  mealImage: { width: 72, height: 72 },
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
    lineHeight: 16,
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
  loadingBox: {
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
