/**
 * MealMate - CategoryBrowseCard
 * Kinexis-inspired category card with accent top border.
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
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
import type { MealCategory } from "../lib/types";

interface CategoryBrowseCardProps {
  category: MealCategory;
  itemCount?: number;
  onPress: () => void;
}

export function CategoryBrowseCard({
  category,
  itemCount = 0,
  onPress,
}: CategoryBrowseCardProps) {
  const accent = getCategoryAccent(category.slug, category.accent_color);
  const iconName = getCategoryIconName(category.slug, category.icon_name);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <View style={[styles.accentBar, { backgroundColor: accent }]} />
      <View style={styles.body}>
        <View style={[styles.iconWrap, { backgroundColor: `${accent}22` }]}>
          <AppIcon name={iconName} size={26} color={accent} />
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {category.label}
        </Text>
        {category.description ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {category.description}
          </Text>
        ) : null}
        <View style={[styles.badge, { backgroundColor: `${accent}33` }]}>
          <Text style={[styles.badgeText, { color: accent }]}>
            {itemCount} {itemCount === 1 ? "dish" : "dishes"}
          </Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Browse menu</Text>
          <AppIcon name="arrow-forward" size={16} color={Colors.saffron} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: "46%",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: "hidden",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: Spacing.md,
  },
  accentBar: {
    height: 4,
    width: "100%",
  },
  body: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.charcoal,
    lineHeight: 22,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.xs,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  footerText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.saffron,
  },
});
