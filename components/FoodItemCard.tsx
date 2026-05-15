/**
 * MealMate - FoodItemCard Component
 * Displays a food item with quantity controls.
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from "../constants/theme";

interface FoodItemCardProps {
  emoji: string;
  name: string;
  unit: string;
  isVeg: boolean;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function FoodItemCard({
  emoji,
  name,
  unit,
  isVeg,
  quantity,
  onIncrement,
  onDecrement,
}: FoodItemCardProps) {
  const isSelected = quantity > 0;

  return (
    <View style={[styles.card, isSelected && styles.cardSelected]}>
      <View style={styles.leftSection}>
        <Text style={styles.emoji}>{emoji}</Text>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <View style={[styles.vegBadge, !isVeg && styles.nonVegBadge]}>
              <View style={[styles.vegDot, !isVeg && styles.nonVegDot]} />
            </View>
            <Text style={styles.name}>{name}</Text>
          </View>
          <Text style={styles.unit}>per {unit}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlBtn, quantity === 0 && styles.controlBtnDisabled]}
          onPress={onDecrement}
          disabled={quantity === 0}
        >
          <Text style={[styles.controlText, quantity === 0 && styles.controlTextDisabled]}>
            −
          </Text>
        </TouchableOpacity>
        <Text style={[styles.quantity, isSelected && styles.quantityActive]}>
          {quantity}
        </Text>
        <TouchableOpacity style={styles.controlBtn} onPress={onIncrement}>
          <Text style={styles.controlText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardSelected: {
    borderColor: Colors.saffron,
    backgroundColor: "#FFFDF8",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  emoji: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  vegBadge: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
  },
  nonVegBadge: {
    borderColor: Colors.chiliRed,
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
  },
  nonVegDot: {
    backgroundColor: Colors.chiliRed,
  },
  name: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.charcoal,
  },
  unit: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
    marginTop: 2,
    marginLeft: Spacing.xxl,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  controlBtn: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.saffron,
    alignItems: "center",
    justifyContent: "center",
  },
  controlBtnDisabled: {
    backgroundColor: Colors.borderLight,
  },
  controlText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    lineHeight: 22,
  },
  controlTextDisabled: {
    color: Colors.textLight,
  },
  quantity: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textLight,
    minWidth: 24,
    textAlign: "center",
  },
  quantityActive: {
    color: Colors.charcoal,
  },
});
