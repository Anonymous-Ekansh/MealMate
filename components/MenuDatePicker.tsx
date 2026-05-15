/**
 * MealMate - MenuDatePicker
 * Date selector for My Menu (defaults to today).
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
} from "react-native";
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
} from "../constants/theme";
import { AppIcon } from "./AppIcon";

function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseDateString(s: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
    return null;
  }
  return date;
}

function formatDisplay(s: string): string {
  const d = parseDateString(s);
  if (!d) return s;
  const today = toDateString(new Date());
  const label = d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return s === today ? `Today · ${label}` : label;
}

interface MenuDatePickerProps {
  value: string;
  onChange: (date: string) => void;
}

export function MenuDatePicker({ value, onChange }: MenuDatePickerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState(value);

  const shiftDay = (delta: number) => {
    const d = parseDateString(value) ?? new Date();
    d.setDate(d.getDate() + delta);
    onChange(toDateString(d));
  };

  const openModal = () => {
    setDraft(value);
    setModalOpen(true);
  };

  const applyDate = () => {
    const parsed = parseDateString(draft.trim());
    if (parsed) {
      onChange(toDateString(parsed));
      setModalOpen(false);
    }
  };

  const goToday = () => {
    onChange(todayDateString());
    setModalOpen(false);
  };

  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={styles.arrowBtn}
        onPress={() => shiftDay(-1)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <AppIcon name="chevron-back" size={22} color={Colors.charcoal} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.dateBtn}
        onPress={openModal}
        activeOpacity={0.85}
      >
        <AppIcon name="calendar-outline" size={18} color={Colors.saffron} />
        <Text style={styles.dateText}>{formatDisplay(value)}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.arrowBtn}
        onPress={() => shiftDay(1)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <AppIcon name="chevron-forward" size={22} color={Colors.charcoal} />
      </TouchableOpacity>

      <Modal
        visible={modalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setModalOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setModalOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.sheetTitle}>Pick a date</Text>
            <TextInput
              style={styles.input}
              value={draft}
              onChangeText={setDraft}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.textLight}
              autoCapitalize="none"
              maxLength={10}
            />
            <TouchableOpacity style={styles.todayBtn} onPress={goToday}>
              <Text style={styles.todayBtnText}>Jump to today</Text>
            </TouchableOpacity>
            <View style={styles.sheetActions}>
              <TouchableOpacity onPress={() => setModalOpen(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyBtn} onPress={applyDate}>
                <Text style={styles.applyText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

export function todayDateString(): string {
  return toDateString(new Date());
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  arrowBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  dateBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  dateText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.charcoal,
  },
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: "center",
    padding: Spacing.xxl,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
  },
  sheetTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.charcoal,
    marginBottom: Spacing.lg,
  },
  input: {
    backgroundColor: Colors.cream,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.charcoal,
    marginBottom: Spacing.md,
  },
  todayBtn: {
    alignSelf: "flex-start",
    marginBottom: Spacing.lg,
  },
  todayBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.saffron,
  },
  sheetActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.lg,
    alignItems: "center",
  },
  cancelText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  applyBtn: {
    backgroundColor: Colors.saffron,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  applyText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
});
