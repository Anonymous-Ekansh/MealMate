/**
 * MealMate - AddCatalogItemModal
 * Bottom sheet for adding a new dish to the catalog.
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from "react-native";
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
} from "../constants/theme";
import { AppIcon } from "./AppIcon";
import {
  CATALOG_CATEGORY_OPTIONS,
  type CatalogCategoryLabel,
} from "../constants/catalogCategories";

export interface AddCatalogItemFormData {
  name: string;
  categoryLabel: CatalogCategoryLabel;
  description: string;
  unit: string;
  is_veg: boolean;
}

interface AddCatalogItemModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: AddCatalogItemFormData) => void;
  isLoading?: boolean;
}

export function AddCatalogItemModal({
  visible,
  onClose,
  onSubmit,
  isLoading = false,
}: AddCatalogItemModalProps) {
  const [name, setName] = useState("");
  const [categoryLabel, setCategoryLabel] = useState<CatalogCategoryLabel>(
    CATALOG_CATEGORY_OPTIONS[0].label
  );
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("serving");
  const [isVeg, setIsVeg] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setName("");
    setCategoryLabel(CATALOG_CATEGORY_OPTIONS[0].label);
    setDescription("");
    setUnit("serving");
    setIsVeg(true);
    setPickerOpen(false);
    setNameError(null);
  }, [visible]);

  const handleSubmit = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("Item name is required");
      return;
    }
    setNameError(null);
    onSubmit({
      name: trimmedName,
      categoryLabel,
      description: description.trim(),
      unit: unit.trim() || "serving",
      is_veg: isVeg,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handleBar} />
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Text style={styles.cancelBtn}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Add to Catalog</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView
            style={styles.form}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.label}>
              Item Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, nameError && styles.inputError]}
              placeholder="e.g., Paneer Butter Masala"
              placeholderTextColor={Colors.textLight}
              value={name}
              onChangeText={(t) => {
                setName(t);
                if (nameError) setNameError(null);
              }}
              maxLength={100}
            />
            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

            <Text style={styles.label}>
              Category <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => setPickerOpen((o) => !o)}
              activeOpacity={0.85}
            >
              <Text style={styles.pickerValue}>{categoryLabel}</Text>
              <AppIcon
                name={pickerOpen ? "chevron-up" : "chevron-down"}
                size={20}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
            {pickerOpen && (
              <View style={styles.pickerList}>
                {CATALOG_CATEGORY_OPTIONS.map((opt) => {
                  const selected = categoryLabel === opt.label;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[styles.pickerOption, selected && styles.pickerOptionActive]}
                      onPress={() => {
                        setCategoryLabel(opt.label);
                        setPickerOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          selected && styles.pickerOptionTextActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                      {selected ? (
                        <AppIcon name="checkmark" size={18} color={Colors.saffron} />
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Optional short description"
              placeholderTextColor={Colors.textLight}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              maxLength={500}
              textAlignVertical="top"
            />

            <Text style={styles.label}>Unit</Text>
            <TextInput
              style={styles.input}
              placeholder="serving"
              placeholderTextColor={Colors.textLight}
              value={unit}
              onChangeText={setUnit}
              maxLength={40}
            />

            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleLabel}>Is Veg</Text>
                <Text style={styles.toggleHint}>Vegetarian dish</Text>
              </View>
              <Switch
                value={isVeg}
                onValueChange={setIsVeg}
                trackColor={{ false: Colors.borderLight, true: Colors.saffron }}
                thumbColor={Colors.white}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={styles.submitBtnText}>Add to Catalog</Text>
              )}
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    maxHeight: "92%",
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: Spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  cancelBtn: {
    fontSize: FontSize.md,
    color: Colors.chiliRed,
    fontWeight: FontWeight.medium,
    width: 60,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.charcoal,
  },
  headerSpacer: {
    width: 60,
  },
  form: {
    paddingHorizontal: Spacing.xxl,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.charcoal,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  required: {
    color: Colors.chiliRed,
  },
  input: {
    backgroundColor: Colors.cream,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    fontSize: FontSize.md,
    color: Colors.charcoal,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  inputError: {
    borderColor: Colors.chiliRed,
  },
  textArea: {
    minHeight: 80,
    paddingTop: Spacing.md,
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.chiliRed,
    marginTop: 4,
    fontWeight: FontWeight.medium,
  },
  pickerTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.cream,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  pickerValue: {
    fontSize: FontSize.md,
    color: Colors.charcoal,
    fontWeight: FontWeight.medium,
  },
  pickerList: {
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: "hidden",
  },
  pickerOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  pickerOptionActive: {
    backgroundColor: "#FFFDF8",
  },
  pickerOptionText: {
    fontSize: FontSize.md,
    color: Colors.charcoal,
  },
  pickerOptionTextActive: {
    fontWeight: FontWeight.semibold,
    color: Colors.saffron,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  toggleLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.charcoal,
  },
  toggleHint: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  submitBtn: {
    backgroundColor: Colors.saffron,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    marginTop: Spacing.xxl,
    shadowColor: Colors.saffron,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
});
