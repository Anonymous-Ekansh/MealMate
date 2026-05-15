/**
 * MealMate - AppIcon
 * Thin wrapper around Ionicons for consistent sizing.
 */

import React from "react";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

type IoniconsProps = ComponentProps<typeof Ionicons>;

interface AppIconProps {
  name: IoniconsProps["name"];
  size?: number;
  color?: string;
  style?: IoniconsProps["style"];
}

export function AppIcon({
  name,
  size = 22,
  color = "#1C1C1E",
  style,
}: AppIconProps) {
  return <Ionicons name={name} size={size} color={color} style={style} />;
}
