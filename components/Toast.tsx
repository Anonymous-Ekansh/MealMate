/**
 * MealMate - Toast Component
 * Lightweight animated toast notification.
 */

import React, { useEffect, useRef } from "react";
import { Animated, Text, StyleSheet, Dimensions } from "react-native";
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
} from "../constants/theme";
import { AppIcon } from "./AppIcon";
import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

const TOAST_COLORS = {
  success: { bg: "#E8F5E9", text: "#2E7D32", border: "#A5D6A7" },
  error: { bg: "#FFEBEE", text: "#C62828", border: "#EF9A9A" },
  info: { bg: "#FFF8E1", text: "#F57F17", border: "#FFE082" },
};

const TOAST_ICONS: Record<
  NonNullable<ToastProps["type"]>,
  ComponentProps<typeof Ionicons>["name"]
> = {
  success: "checkmark-circle",
  error: "close-circle",
  info: "information-circle",
};

export function Toast({
  message,
  type = "success",
  visible,
  onHide,
  duration = 2500,
}: ToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const colors = TOAST_COLORS[type];

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -100,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start(() => onHide());
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <AppIcon name={TOAST_ICONS[type]} size={20} color={colors.text} />
      <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
    </Animated.View>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 60,
    left: Spacing.xxl,
    right: Spacing.xxl,
    maxWidth: width - Spacing.xxl * 2,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 9999,
    gap: Spacing.sm,
  },
  message: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    flex: 1,
  },
});
