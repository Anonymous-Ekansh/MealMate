/**
 * MealMate - CatalogItemCard
 * Displays a catalog dish with add-to-menu action.
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
} from "../constants/theme";
import { AppIcon } from "./AppIcon";
import type { CatalogItemWithCategory } from "../lib/types";

interface CatalogItemCardProps {
  item: CatalogItemWithCategory;
  isInMenu: boolean;
  isAdding: boolean;
  onAdd: () => void;
}

export function CatalogItemCard({
  item,
  isInMenu,
  isAdding,
  onAdd,
}: CatalogItemCardProps) {
  return (
    <View style={[styles.card, isInMenu && styles.cardInMenu]}>
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <AppIcon name="restaurant-outline" size={28} color={Colors.saffron} />
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.nameRow}>
          <View style={[styles.vegBadge, !item.is_veg && styles.nonVegBadge]}>
            <View style={[styles.vegDot, !item.is_veg && styles.nonVegDot]} />
          </View>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
        </View>
        {item.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
        <Text style={styles.unit}>
          per {item.unit}
          {item.serves_per_unit > 1
            ? ` · serves ${item.serves_per_unit}`
            : ""}
        </Text>
        {item.tags && item.tags.length > 0 ? (
          <View style={styles.tags}>
            {item.tags.slice(0, 3).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <TouchableOpacity
        style={[
          styles.addBtn,
          isInMenu && styles.addBtnDone,
          isAdding && styles.addBtnLoading,
        ]}
        onPress={onAdd}
        disabled={isInMenu || isAdding}
        activeOpacity={0.85}
      >
        {isAdding ? (
          <ActivityIndicator size="small" color={Colors.white} />
        ) : isInMenu ? (
          <AppIcon name="checkmark" size={20} color={Colors.white} />
        ) : (
          <AppIcon name="add" size={22} color={Colors.white} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: Spacing.md,
  },
  cardInMenu: {
    borderColor: Colors.saffron,
    backgroundColor: "#FFFDF8",
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
  },
  imagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.cream,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  vegBadge: {
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: Colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
  nonVegBadge: {
    borderColor: Colors.chiliRed,
  },
  vegDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  nonVegDot: {
    backgroundColor: Colors.chiliRed,
  },
  name: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.charcoal,
  },
  description: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  unit: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    marginTop: 2,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 4,
  },
  tag: {
    backgroundColor: Colors.borderLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  tagText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.saffron,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnDone: {
    backgroundColor: Colors.success,
  },
  addBtnLoading: {
    opacity: 0.8,
  },
});
