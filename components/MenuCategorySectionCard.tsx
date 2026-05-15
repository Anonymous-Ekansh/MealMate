/**
 * MealMate - MenuCategorySectionCard
 * Category card with menu items for the selected date.
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
} from "../constants/theme";
import { AppIcon } from "./AppIcon";
import {
  getCategoryAccent,
  getCategoryIconName,
} from "../constants/categoryTheme";
import type { MenuItem } from "../lib/types";

interface MenuCategorySectionCardProps {
  label: string;
  slug: string;
  items: MenuItem[];
}

export function MenuCategorySectionCard({
  label,
  slug,
  items,
}: MenuCategorySectionCardProps) {
  const accent = getCategoryAccent(slug);
  const iconName = getCategoryIconName(slug);

  return (
    <View style={styles.card}>
      <View style={[styles.accentBar, { backgroundColor: accent }]} />
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: `${accent}22` }]}>
          <AppIcon name={iconName} size={22} color={accent} />
        </View>
        <Text style={styles.headerTitle}>{label}</Text>
        {items.length > 0 ? (
          <View style={[styles.countBadge, { backgroundColor: `${accent}33` }]}>
            <Text style={[styles.countText, { color: accent }]}>
              {items.length}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.list}>
        {items.length === 0 ? (
          <Text style={styles.emptyText}>Nothing added yet</Text>
        ) : (
          items.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.listItem,
                index < items.length - 1 && styles.listItemBorder,
              ]}
            >
              <Text style={styles.itemName}>{item.item_name}</Text>
              {item.description ? (
                <Text style={styles.itemDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: "hidden",
    marginBottom: Spacing.lg,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  accentBar: {
    height: 4,
    width: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.charcoal,
  },
  countBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    minWidth: 24,
    alignItems: "center",
  },
  countText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    minHeight: 44,
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
    fontStyle: "italic",
    paddingVertical: Spacing.md,
  },
  listItem: {
    paddingVertical: Spacing.md,
  },
  listItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  itemName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.charcoal,
  },
  itemDescription: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
});
