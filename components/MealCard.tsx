/**
 * MealMate - MealCard Component
 * Displays a menu item with category badge, date/time, image.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
  Alert,
} from "react-native";
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
} from "../constants/theme";
import { useCategoryMaps } from "../hooks/useCategories";
import {
  getCategoryAccent,
  getCategoryIconName,
} from "../constants/categoryTheme";
import { AppIcon } from "./AppIcon";
import type { MenuItem } from "../lib/types";

interface MealCardProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  onMoveCategory: (id: string, newCategory: string) => void;
}

const CATEGORY_BADGE_COLORS: Record<string, string> = {
  breakfast: "#FFF3E0",
  lunch: "#E8F5E9",
  dinner: "#EDE7F6",
  party: "#FCE4EC",
  gettogether: "#E3F2FD",
};

const CATEGORY_BADGE_TEXT: Record<string, string> = {
  breakfast: "#E65100",
  lunch: "#2E7D32",
  dinner: "#4527A0",
  party: "#AD1457",
  gettogether: "#1565C0",
};

export function MealCard({
  item,
  onEdit,
  onDelete,
  onMoveCategory,
}: MealCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const { labelBySlug, slugs } = useCategoryMaps();

  const categoryLabel = labelBySlug[item.category] ?? item.category;
  const iconName = getCategoryIconName(item.category);
  const accent = getCategoryAccent(item.category);
  const badgeBg = CATEGORY_BADGE_COLORS[item.category] ?? "#F5F5F5";
  const badgeText = CATEGORY_BADGE_TEXT[item.category] ?? Colors.textSecondary;

  const formatDate = (date: string | null) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (time: string | null) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const handleDelete = () => {
    setShowMenu(false);
    Alert.alert(
      "Delete Item",
      `Are you sure you want to delete "${item.item_name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(item.id),
        },
      ]
    );
  };

  const handleMove = (newCategory: string) => {
    setShowMoveMenu(false);
    setShowMenu(false);
    onMoveCategory(item.id, newCategory);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.card}
        onLongPress={() => setShowMenu(true)}
        activeOpacity={0.9}
        delayLongPress={400}
      >
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <AppIcon name={iconName} size={32} color={accent} />
          </View>
        )}

        <View style={styles.content}>
          <View style={[styles.badge, { backgroundColor: badgeBg }]}>
            <AppIcon name={iconName} size={12} color={badgeText} />
            <Text style={[styles.badgeText, { color: badgeText }]}>
              {categoryLabel}
            </Text>
          </View>

          <Text style={styles.itemName} numberOfLines={1}>
            {item.item_name}
          </Text>

          {item.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}

          <View style={styles.metaRow}>
            {item.added_date ? (
              <View style={styles.metaItem}>
                <AppIcon
                  name="calendar-outline"
                  size={12}
                  color={Colors.textLight}
                />
                <Text style={styles.metaText}>
                  {formatDate(item.added_date)}
                </Text>
              </View>
            ) : null}
            {item.added_time ? (
              <View style={styles.metaItem}>
                <AppIcon
                  name="time-outline"
                  size={12}
                  color={Colors.textLight}
                />
                <Text style={styles.metaText}>
                  {formatTime(item.added_time)}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <TouchableOpacity
          style={styles.menuDots}
          onPress={() => setShowMenu(true)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.menuDotsText}>⋮</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => {
            setShowMenu(false);
            setShowMoveMenu(false);
          }}
        >
          <View style={styles.actionSheet}>
            <View style={styles.actionSheetHeader}>
              <Text style={styles.actionSheetTitle}>{item.item_name}</Text>
              <View style={styles.actionSheetSubtitleRow}>
                <AppIcon name={iconName} size={14} color={Colors.textSecondary} />
                <Text style={styles.actionSheetSubtitle}>{categoryLabel}</Text>
              </View>
            </View>

            <View style={styles.actionSheetDivider} />

            {!showMoveMenu ? (
              <>
                <TouchableOpacity
                  style={styles.actionItem}
                  onPress={() => {
                    setShowMenu(false);
                    onEdit(item);
                  }}
                >
                  <AppIcon name="create-outline" size={20} color={Colors.charcoal} />
                  <Text style={styles.actionText}>Edit Item</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionItem}
                  onPress={() => setShowMoveMenu(true)}
                >
                  <AppIcon name="folder-outline" size={20} color={Colors.charcoal} />
                  <Text style={styles.actionText}>Move to Category</Text>
                  <Text style={styles.actionChevron}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionItem} onPress={handleDelete}>
                  <AppIcon name="trash-outline" size={20} color={Colors.chiliRed} />
                  <Text style={[styles.actionText, { color: Colors.chiliRed }]}>
                    Delete Item
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.actionItem}
                  onPress={() => setShowMoveMenu(false)}
                >
                  <AppIcon name="chevron-back" size={20} color={Colors.charcoal} />
                  <Text style={[styles.actionText, { fontWeight: FontWeight.bold }]}>
                    Back
                  </Text>
                </TouchableOpacity>

                <View style={styles.actionSheetDivider} />

                {slugs
                  .filter((c) => c !== item.category)
                  .map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={styles.actionItem}
                      onPress={() => handleMove(cat)}
                    >
                      <AppIcon
                        name={getCategoryIconName(cat)}
                        size={20}
                        color={Colors.charcoal}
                      />
                      <Text style={styles.actionText}>
                        {labelBySlug[cat] ?? cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </>
            )}

            <View style={styles.actionSheetDivider} />
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => {
                setShowMenu(false);
                setShowMoveMenu(false);
              }}
            >
              <Text
                style={[styles.actionText, { textAlign: "center", flex: 1 }]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    marginHorizontal: Spacing.xxl,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: "hidden",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  image: {
    width: 100,
    height: "100%",
    minHeight: 110,
  },
  imagePlaceholder: {
    width: 100,
    minHeight: 110,
    backgroundColor: Colors.cream,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    padding: Spacing.md,
    gap: 4,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  itemName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.charcoal,
  },
  description: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  metaText: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    fontWeight: FontWeight.medium,
  },
  menuDots: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    alignSelf: "flex-start",
  },
  menuDotsText: {
    fontSize: 22,
    color: Colors.textLight,
    fontWeight: FontWeight.bold,
  },
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: "flex-end",
  },
  actionSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    paddingBottom: 40,
  },
  actionSheetHeader: {
    padding: Spacing.xl,
    alignItems: "center",
  },
  actionSheetTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.charcoal,
  },
  actionSheetSubtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  actionSheetSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  actionSheetDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.md,
  },
  actionText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    color: Colors.charcoal,
    flex: 1,
  },
  actionChevron: {
    fontSize: 24,
    color: Colors.textLight,
  },
});
