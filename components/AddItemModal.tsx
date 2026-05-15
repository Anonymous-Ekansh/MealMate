/**
 * MealMate - AddItemModal Component
 * Bottom sheet modal for adding / editing a menu item.
 * Uses react-hook-form + Zod for validation and expo-image-picker for images.
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
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
} from "../constants/theme";
import { menuItemSchema, type MenuItemFormData } from "../lib/validations";
import { useCategoryMaps } from "../hooks/useCategories";
import { getCategoryIconName } from "../constants/categoryTheme";
import { AppIcon } from "./AppIcon";
import type { MenuItem } from "../lib/types";

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: MenuItemFormData & { localImageUri?: string }) => void;
  isLoading?: boolean;
  editItem?: MenuItem | null;
}

export function AddItemModal({
  visible,
  onClose,
  onSubmit,
  isLoading = false,
  editItem,
}: AddItemModalProps) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const isEditing = !!editItem;
  const { categories } = useCategoryMaps();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      item_name: "",
      category: categories[0]?.slug ?? "",
      description: "",
      image_url: null,
      added_date: new Date().toISOString().split("T")[0],
      added_time: new Date().toTimeString().slice(0, 5),
    },
  });

  useEffect(() => {
    if (!editItem && categories[0]?.slug) {
      setValue("category", categories[0].slug);
    }
  }, [categories, editItem, setValue]);

  // Populate form when editing
  useEffect(() => {
    if (editItem) {
      setValue("item_name", editItem.item_name);
      setValue("category", editItem.category);
      setValue("description", editItem.description ?? "");
      setValue("image_url", editItem.image_url ?? null);
      setValue("added_date", editItem.added_date ?? new Date().toISOString().split("T")[0]);
      setValue("added_time", editItem.added_time ?? new Date().toTimeString().slice(0, 5));
      setImageUri(editItem.image_url ?? null);
    } else {
      reset();
      setImageUri(null);
    }
  }, [editItem, visible]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleFormSubmit = (data: MenuItemFormData) => {
    onSubmit({
      ...data,
      localImageUri: imageUri ?? undefined,
    });
  };

  const handleClose = () => {
    reset();
    setImageUri(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <View style={styles.sheet}>
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.cancelBtn}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.title}>
              {isEditing ? "Edit Item" : "Add New Item"}
            </Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView
            style={styles.form}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Image Picker */}
            <Text style={styles.label}>Photo</Text>
            <View style={styles.imageRow}>
              {imageUri ? (
                <TouchableOpacity onPress={pickImage}>
                  <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                  <View style={styles.imageOverlay}>
                    <Text style={styles.imageOverlayText}>Change</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <View style={styles.imageActions}>
                  <TouchableOpacity
                    style={styles.imageBtn}
                    onPress={pickImage}
                  >
                    <AppIcon name="images-outline" size={28} color={Colors.saffron} />
                    <Text style={styles.imageBtnText}>Gallery</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.imageBtn}
                    onPress={takePhoto}
                  >
                    <AppIcon name="camera-outline" size={28} color={Colors.saffron} />
                    <Text style={styles.imageBtnText}>Camera</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Item Name */}
            <Text style={styles.label}>
              Item Name <Text style={styles.required}>*</Text>
            </Text>
            <Controller
              control={control}
              name="item_name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.item_name && styles.inputError]}
                  placeholder="e.g., Paneer Butter Masala"
                  placeholderTextColor={Colors.textLight}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  maxLength={100}
                />
              )}
            />
            {errors.item_name && (
              <Text style={styles.errorText}>{errors.item_name.message}</Text>
            )}

            {/* Category */}
            <Text style={styles.label}>
              Category <Text style={styles.required}>*</Text>
            </Text>
            <Controller
              control={control}
              name="category"
              render={({ field: { onChange, value } }) => (
                <View style={styles.categoryGrid}>
                  {categories.map((cat) => {
                    const isActive = value === cat.slug;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.categoryChip,
                          isActive && styles.categoryChipActive,
                        ]}
                        onPress={() => onChange(cat.slug)}
                      >
                        <AppIcon
                          name={getCategoryIconName(
                            cat.slug,
                            cat.icon_name
                          )}
                          size={14}
                          color={isActive ? Colors.white : Colors.textSecondary}
                        />
                        <Text
                          style={[
                            styles.categoryChipText,
                            isActive && styles.categoryChipTextActive,
                          ]}
                        >
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            />
            {errors.category && (
              <Text style={styles.errorText}>{errors.category.message}</Text>
            )}

            {/* Description */}
            <Text style={styles.label}>Description</Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Add a short description..."
                  placeholderTextColor={Colors.textLight}
                  value={value ?? ""}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={3}
                  maxLength={500}
                  textAlignVertical="top"
                />
              )}
            />

            {/* Date & Time Row */}
            <View style={styles.dateTimeRow}>
              <View style={styles.dateTimeField}>
                <Text style={styles.label}>Date</Text>
                <Controller
                  control={control}
                  name="added_date"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={Colors.textLight}
                      value={value ?? ""}
                      onChangeText={onChange}
                      maxLength={10}
                    />
                  )}
                />
              </View>
              <View style={styles.dateTimeField}>
                <Text style={styles.label}>Time</Text>
                <Controller
                  control={control}
                  name="added_time"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="HH:MM"
                      placeholderTextColor={Colors.textLight}
                      value={value ?? ""}
                      onChangeText={onChange}
                      maxLength={5}
                    />
                  )}
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
              onPress={handleSubmit(handleFormSubmit)}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={styles.submitBtnText}>
                  {isEditing ? "Save Changes" : "Add to Menu"}
                </Text>
              )}
            </TouchableOpacity>

            {/* Bottom padding */}
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

  // Category chips
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.cream,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    gap: 4,
  },
  categoryChipActive: {
    backgroundColor: Colors.saffron,
    borderColor: Colors.saffron,
  },
  categoryChipIcon: {
    fontSize: 14,
  },
  categoryChipText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  categoryChipTextActive: {
    color: Colors.white,
  },

  // Image picker
  imageRow: {
    marginBottom: Spacing.sm,
  },
  imageActions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  imageBtn: {
    flex: 1,
    backgroundColor: Colors.cream,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    borderStyle: "dashed",
    paddingVertical: Spacing.xl,
    alignItems: "center",
    gap: Spacing.sm,
  },
  imageBtnIcon: {
    fontSize: 28,
  },
  imageBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  imagePreview: {
    width: "100%",
    height: 180,
    borderRadius: BorderRadius.lg,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingVertical: Spacing.sm,
    borderBottomLeftRadius: BorderRadius.lg,
    borderBottomRightRadius: BorderRadius.lg,
    alignItems: "center",
  },
  imageOverlayText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.white,
  },

  // Date/time row
  dateTimeRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  dateTimeField: {
    flex: 1,
  },

  // Submit
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
