/**
 * MealMate - Category Detail Screen
 * Lists catalog dishes for a category with add-to-menu actions.
 */

import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
} from "../../constants/theme";
import { AppIcon } from "../../components/AppIcon";
import { CatalogItemCard } from "../../components/CatalogItemCard";
import { Toast } from "../../components/Toast";
import { useCategory } from "../../hooks/useCategories";
import { useCatalogItems } from "../../hooks/useCatalogItems";
import { useMenuItems, useAddMenuItem } from "../../hooks/useMenuItems";
import { useAuthStore } from "../../stores/useAuthStore";
import {
  getCategoryAccent,
  getCategoryIconName,
} from "../../constants/categoryTheme";
import type { CatalogItemWithCategory } from "../../lib/types";

export default function CategoryDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [searchQuery, setSearchQuery] = useState("");
  const [addingId, setAddingId] = useState<string | null>(null);
  const [toast, setToast] = useState({
    message: "",
    type: "success" as "success" | "error" | "info",
    visible: false,
  });

  const { data: category, isLoading: categoryLoading } = useCategory(
    slug ?? ""
  );
  const {
    data: catalogItems = [],
    isLoading: catalogLoading,
    refetch,
    isRefetching,
  } = useCatalogItems(slug ?? "");
  const { data: menuItems = [] } = useMenuItems(user?.id);
  const addMutation = useAddMenuItem();

  const accent = getCategoryAccent(
    slug ?? "",
    category?.accent_color
  );
  const iconName = getCategoryIconName(slug ?? "", category?.icon_name);

  const menuItemNames = useMemo(
    () => new Set(menuItems.map((m) => m.item_name.toLowerCase())),
    [menuItems]
  );

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return catalogItems;
    const q = searchQuery.toLowerCase();
    return catalogItems.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }, [catalogItems, searchQuery]);

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success"
  ) => {
    setToast({ message, type, visible: true });
  };

  const handleAdd = useCallback(
    async (item: CatalogItemWithCategory) => {
      if (menuItemNames.has(item.name.toLowerCase())) return;

      setAddingId(item.id);
      try {
        await addMutation.mutateAsync({
          item_name: item.name,
          category: item.category_slug,
          description: item.description ?? null,
          image_url: item.image_url ?? null,
          added_date: new Date().toISOString().split("T")[0],
          added_time: new Date().toTimeString().slice(0, 5),
        });
        showToast(`"${item.name}" added to your menu`);
      } catch (e: unknown) {
        showToast(
          e instanceof Error ? e.message : "Failed to add item",
          "error"
        );
      } finally {
        setAddingId(null);
      }
    },
    [addMutation, menuItemNames]
  );

  const isLoading = categoryLoading || catalogLoading;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={() => setToast((t) => ({ ...t, visible: false }))}
      />

      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <AppIcon name="arrow-back" size={24} color={Colors.charcoal} />
        </TouchableOpacity>
        <View style={[styles.topAccent, { backgroundColor: accent }]} />
      </View>

      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: `${accent}22` }]}>
          <AppIcon name={iconName} size={28} color={accent} />
        </View>
        <Text style={styles.title}>
          {category?.label ?? slug ?? "Category"}
        </Text>
        {category?.description ? (
          <Text style={styles.subtitle}>{category.description}</Text>
        ) : null}
      </View>

      <View style={styles.searchContainer}>
        <AppIcon name="search-outline" size={18} color={Colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search dishes..."
          placeholderTextColor={Colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <AppIcon name="close-circle" size={18} color={Colors.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.saffron} />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CatalogItemCard
              item={item}
              isInMenu={menuItemNames.has(item.name.toLowerCase())}
              isAdding={addingId === item.id}
              onAdd={() => handleAdd(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={isRefetching}
          onRefresh={refetch}
          ListEmptyComponent={
            <View style={styles.empty}>
              <AppIcon
                name="restaurant-outline"
                size={48}
                color={Colors.textLight}
              />
              <Text style={styles.emptyTitle}>No dishes found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? "Try a different search term."
                  : "Dishes for this category will appear once added in Supabase."}
              </Text>
            </View>
          }
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
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.sm,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  topAccent: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    marginLeft: Spacing.md,
  },
  header: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.heavy,
    color: Colors.charcoal,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.xxl,
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    height: 48,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.charcoal,
    paddingVertical: 0,
  },
  listContent: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: 40,
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: Spacing.huge,
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.charcoal,
  },
  emptySubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
});
