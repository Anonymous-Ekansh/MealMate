/**
 * MealMate - Menu Tab
 * Daily menu grouped by category cards.
 */

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Colors,
  Spacing,
  FontSize,
  FontWeight,
} from "../../constants/theme";
import { useAuthStore } from "../../stores/useAuthStore";
import { useMenuItemsByDate } from "../../hooks/useMenuItemsByDate";
import {
  MENU_SECTION_CATEGORIES,
  menuItemMatchesSection,
} from "../../constants/menuCategories";
import { MenuDatePicker, todayDateString } from "../../components/MenuDatePicker";
import { MenuCategorySectionCard } from "../../components/MenuCategorySectionCard";
import type { MenuItem } from "../../lib/types";
import type { MenuSectionSlug } from "../../constants/menuCategories";

function groupItemsByCategory(
  items: MenuItem[]
): Record<MenuSectionSlug, MenuItem[]> {
  const grouped = {} as Record<MenuSectionSlug, MenuItem[]>;
  for (const section of MENU_SECTION_CATEGORIES) {
    grouped[section.slug] = items.filter((item) =>
      menuItemMatchesSection(item.category, section.slug)
    );
  }
  return grouped;
}

export default function MenuScreen() {
  const user = useAuthStore((s) => s.user);
  const [selectedDate, setSelectedDate] = useState(todayDateString);

  const {
    data: menuItems = [],
    isLoading,
    refetch,
    isRefetching,
    error,
  } = useMenuItemsByDate(user?.id, selectedDate);

  const grouped = useMemo(() => groupItemsByCategory(menuItems), [menuItems]);

  const totalCount = menuItems.length;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>My Menu</Text>
        <MenuDatePicker value={selectedDate} onChange={setSelectedDate} />
        <Text style={styles.subtitle}>
          {totalCount} item{totalCount !== 1 ? "s" : ""} on this day
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.saffron} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Could not load your menu</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={Colors.saffron}
              colors={[Colors.saffron]}
            />
          }
        >
          {MENU_SECTION_CATEGORIES.map((section) => (
            <MenuCategorySectionCard
              key={section.slug}
              label={section.label}
              slug={section.slug}
              items={grouped[section.slug]}
            />
          ))}
        </ScrollView>
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
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: 100,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
});
