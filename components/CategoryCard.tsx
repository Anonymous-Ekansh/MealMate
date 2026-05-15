/**
 * MealMate - CategoryCard Component
 * A styled card for displaying a meal category.
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from "../constants/theme";

interface CategoryCardProps {
  icon: string;
  label: string;
  onPress: () => void;
  isSelected?: boolean;
}

export function CategoryCard({ icon, label, onPress, isSelected = false }: CategoryCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.label, isSelected && styles.labelSelected]}>
        {label}
      </Text>
      {isSelected && <View style={styles.selectedDot} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 120,
  },
  cardSelected: {
    borderColor: Colors.saffron,
    backgroundColor: "#FFFAF0",
    shadowColor: Colors.saffron,
    shadowOpacity: 0.15,
  },
  icon: {
    fontSize: 40,
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.charcoal,
    textAlign: "center",
  },
  labelSelected: {
    color: Colors.primaryDark,
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.saffron,
    marginTop: Spacing.sm,
  },
});
