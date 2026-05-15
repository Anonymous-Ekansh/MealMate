/**
 * MealMate - Home Screen
 * Browse meal categories as cards; tap to open catalog for each category.
 */

import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Colors,
  Spacing,
  FontSize,
  FontWeight,
} from "../../constants/theme";
import { useAuthStore } from "../../stores/useAuthStore";
import { useCategories, useCategoryItemCounts } from "../../hooks/useCategories";
import { CategoryBrowseCard } from "../../components/CategoryBrowseCard";
import { AddCatalogItemModal } from "../../components/AddCatalogItemModal";
import type { AddCatalogItemFormData } from "../../components/AddCatalogItemModal";
import { Toast } from "../../components/Toast";
import { AppIcon } from "../../components/AppIcon";
import { getCategoryIdByLabel } from "../../constants/catalogCategories";
import { addCatalogItem } from "../../services/catalog.service";
import type { MealCategory } from "../../lib/types";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const profile = useAuthStore((s) => s.profile);
  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  const [showAddCatalog, setShowAddCatalog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
    visible: boolean;
  }>({ message: "", type: "success", visible: false });

  const {
    data: categories = [],
    isLoading,
    refetch,
    isRefetching,
    error,
  } = useCategories();

  const categoryIds = useMemo(
    () => categories.map((c) => c.id),
    [categories]
  );

  const { data: itemCounts = {} } = useCategoryItemCounts(categoryIds);

  const renderItem = ({ item }: { item: MealCategory }) => (
    <CategoryBrowseCard
      category={item}
      itemCount={itemCounts[item.id] ?? 0}
      onPress={() => router.push(`/category/${item.slug}`)}
    />
  );

  const handleAddCatalog = useCallback(
    async (data: AddCatalogItemFormData) => {
      setIsSubmitting(true);
      try {
        await addCatalogItem({
          category_id: getCategoryIdByLabel(data.categoryLabel),
          name: data.name,
          description: data.description || null,
          unit: data.unit,
          is_veg: data.is_veg,
        });
        await queryClient.invalidateQueries({ queryKey: ["categories"] });
        await queryClient.invalidateQueries({ queryKey: ["catalog"] });
        setShowAddCatalog(false);
        setToast({
          message: "Item added to catalog!",
          type: "success",
          visible: true,
        });
      } catch (e: unknown) {
        setToast({
          message:
            e instanceof Error ? e.message : "Failed to add item to catalog",
          type: "error",
          visible: true,
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [queryClient]
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={() => setToast((t) => ({ ...t, visible: false }))}
      />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>
            {getGreeting()},{" "}
            <Text style={styles.greetingName}>{firstName}</Text>
          </Text>
          <Text style={styles.headerTitle}>Discover</Text>
          <Text style={styles.headerSubtitle}>
            Pick a category to browse dishes and add them to your menu
          </Text>
        </View>
        {profile?.avatar_url ? (
          <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitial}>
              {firstName[0]?.toUpperCase() ?? "?"}
            </Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.saffron} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Could not load categories</Text>
          <Text style={styles.errorSubtitle}>
            Check your connection and try again.
          </Text>
        </View>
      ) : categories.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>No categories yet</Text>
          <Text style={styles.errorSubtitle}>
            Categories will appear here once they are added in Supabase.
          </Text>
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={Colors.saffron}
              colors={[Colors.saffron]}
            />
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddCatalog(true)}
        activeOpacity={0.85}
      >
        <AppIcon name="add" size={32} color={Colors.white} />
      </TouchableOpacity>

      <AddCatalogItemModal
        visible={showAddCatalog}
        onClose={() => setShowAddCatalog(false)}
        onSubmit={handleAddCatalog}
        isLoading={isSubmitting}
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
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerLeft: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  greeting: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  greetingName: {
    color: Colors.saffron,
    fontWeight: FontWeight.bold,
  },
  headerTitle: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.heavy,
    color: Colors.charcoal,
  },
  headerSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    lineHeight: 20,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2.5,
    borderColor: Colors.saffron,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.saffron,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  row: {
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.md,
  },
  listContent: {
    paddingBottom: 100,
    paddingTop: Spacing.sm,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.huge,
  },
  errorTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.charcoal,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  errorSubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  fab: {
    position: "absolute",
    bottom: 100,
    right: Spacing.xxl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.saffron,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.saffron,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
