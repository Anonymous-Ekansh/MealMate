/**
 * MealMate - CreateGroupModal Component
 * Multi-step modal: Step 1 → group details, Step 2 → search & add members.
 */

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
} from "../constants/theme";
import { searchUsers } from "../services/groups.service";
import type { Profile } from "../lib/types";
import { AppIcon } from "./AppIcon";

interface CreateGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (data: {
    name: string;
    description: string;
    imageUri: string | null;
    memberIds: string[];
  }) => void;
  isLoading?: boolean;
  currentUserId?: string;
}

export function CreateGroupModal({
  visible,
  onClose,
  onCreate,
  isLoading = false,
  currentUserId,
}: CreateGroupModalProps) {
  const [step, setStep] = useState(1);

  // Step 1 state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Step 2 state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Profile[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const resetForm = () => {
    setStep(1);
    setName("");
    setDescription("");
    setImageUri(null);
    setSearchQuery("");
    setSearchResults([]);
    setSelectedMembers([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // ─── Step 1 ───────────────────────────────────

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleNext = () => {
    if (!name.trim()) {
      Alert.alert("Required", "Please enter a group name");
      return;
    }
    setStep(2);
  };

  // ─── Step 2 ───────────────────────────────────

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      if (query.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchUsers(query);
        // Filter out current user and already selected
        const filtered = results.filter(
          (u) =>
            u.id !== currentUserId &&
            !selectedMembers.find((m) => m.id === u.id)
        );
        setSearchResults(filtered);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [currentUserId, selectedMembers]
  );

  const addMember = (user: Profile) => {
    if (selectedMembers.length >= 9) {
      Alert.alert("Limit Reached", "Maximum 10 members allowed (including you)");
      return;
    }
    if (selectedMembers.find((m) => m.id === user.id)) return;
    setSelectedMembers((prev) => [...prev, user]);
    setSearchResults((prev) => prev.filter((u) => u.id !== user.id));
    setSearchQuery("");
  };

  const removeMember = (userId: string) => {
    setSelectedMembers((prev) => prev.filter((m) => m.id !== userId));
  };

  const handleCreate = () => {
    onCreate({
      name: name.trim(),
      description: description.trim(),
      imageUri,
      memberIds: selectedMembers.map((m) => m.id),
    });
  };

  // ─── Render ───────────────────────────────────

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
          {/* Handle */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            {step === 2 ? (
              <TouchableOpacity onPress={() => setStep(1)}>
                <Text style={styles.backBtn}>← Back</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleClose}>
                <Text style={styles.cancelBtn}>Cancel</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.title}>
              {step === 1 ? "New Group" : "Add Members"}
            </Text>
            <Text style={styles.stepBadge}>
              {step}/2
            </Text>
          </View>

          {/* Step indicator */}
          <View style={styles.stepBar}>
            <View style={[styles.stepDot, styles.stepDotActive]} />
            <View style={styles.stepLine} />
            <View
              style={[styles.stepDot, step === 2 && styles.stepDotActive]}
            />
          </View>

          {step === 1 ? (
            /* ─── Step 1: Group Details ─── */
            <View style={styles.form}>
              {/* Group image */}
              <TouchableOpacity
                style={styles.imagePickerBtn}
                onPress={pickImage}
              >
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <AppIcon name="camera-outline" size={32} color={Colors.saffron} />
                    <Text style={styles.imagePlaceholderText}>
                      Group Photo
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Group name */}
              <Text style={styles.label}>
                Group Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Family Dinner Club"
                placeholderTextColor={Colors.textLight}
                value={name}
                onChangeText={setName}
                maxLength={50}
              />

              {/* Description */}
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="What's this group about?"
                placeholderTextColor={Colors.textLight}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                maxLength={200}
                textAlignVertical="top"
              />

              {/* Next button */}
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleNext}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>
                  Next — Add Members →
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* ─── Step 2: Add Members ─── */
            <View style={styles.form}>
              {/* Selected members */}
              {selectedMembers.length > 0 && (
                <View style={styles.selectedSection}>
                  <Text style={styles.selectedLabel}>
                    Selected ({selectedMembers.length + 1}/10)
                  </Text>
                  <View style={styles.selectedChips}>
                    {/* Creator chip (non-removable) */}
                    <View style={[styles.chip, styles.chipAdmin]}>
                      <Text style={styles.chipText}>You (Admin)</Text>
                    </View>
                    {selectedMembers.map((member) => (
                      <View key={member.id} style={styles.chip}>
                        <Text style={styles.chipText} numberOfLines={1}>
                          {member.full_name ?? member.email ?? "User"}
                        </Text>
                        <TouchableOpacity
                          onPress={() => removeMember(member.id)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Text style={styles.chipRemove}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Search */}
              <View style={styles.searchContainer}>
                <AppIcon name="search-outline" size={18} color={Colors.textLight} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by name or email..."
                  placeholderTextColor={Colors.textLight}
                  value={searchQuery}
                  onChangeText={handleSearch}
                  autoCapitalize="none"
                />
                {isSearching && (
                  <ActivityIndicator size="small" color={Colors.saffron} />
                )}
              </View>

              {/* Search results */}
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id}
                style={styles.resultsList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.resultItem}
                    onPress={() => addMember(item)}
                    activeOpacity={0.8}
                  >
                    {item.avatar_url ? (
                      <Image
                        source={{ uri: item.avatar_url }}
                        style={styles.resultAvatar}
                      />
                    ) : (
                      <View style={styles.resultAvatarPlaceholder}>
                        <Text style={styles.resultAvatarInitial}>
                          {item.full_name?.[0]?.toUpperCase() ?? "?"}
                        </Text>
                      </View>
                    )}
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultName}>
                        {item.full_name ?? "Unknown"}
                      </Text>
                      <Text style={styles.resultEmail}>{item.email}</Text>
                    </View>
                    <View style={styles.addBadge}>
                      <Text style={styles.addBadgeText}>+ Add</Text>
                    </View>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  searchQuery.length >= 2 && !isSearching ? (
                    <Text style={styles.noResults}>No users found</Text>
                  ) : searchQuery.length > 0 && searchQuery.length < 2 ? (
                    <Text style={styles.noResults}>Type at least 2 characters</Text>
                  ) : null
                }
                keyboardShouldPersistTaps="handled"
              />

              {/* Create button */}
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  isLoading && styles.primaryBtnDisabled,
                ]}
                onPress={handleCreate}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Text style={styles.primaryBtnText}>
                    Create Group
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1, justifyContent: "flex-end" },
  backdrop: { flex: 1, backgroundColor: Colors.overlay },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    maxHeight: "90%",
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
  backBtn: {
    fontSize: FontSize.md,
    color: Colors.saffron,
    fontWeight: FontWeight.semibold,
    width: 60,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.charcoal,
  },
  stepBadge: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textLight,
    width: 60,
    textAlign: "right",
  },

  // Step indicator
  stepBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.borderLight,
  },
  stepDotActive: {
    backgroundColor: Colors.saffron,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: Colors.borderLight,
  },

  form: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: 40,
  },

  // Image picker
  imagePickerBtn: {
    alignSelf: "center",
    marginBottom: Spacing.lg,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.saffron,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.cream,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderIcon: { fontSize: 28 },
  imagePlaceholderText: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    marginTop: 2,
  },

  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.charcoal,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  required: { color: Colors.chiliRed },
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
  textArea: { minHeight: 70, paddingTop: Spacing.md },

  primaryBtn: {
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
  primaryBtnDisabled: { opacity: 0.7 },
  primaryBtnText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },

  // Selected members
  selectedSection: { marginBottom: Spacing.md },
  selectedLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  selectedChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.cream,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  chipAdmin: {
    backgroundColor: Colors.saffron,
    borderColor: Colors.saffron,
  },
  chipText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.charcoal,
    maxWidth: 120,
  },
  chipRemove: {
    fontSize: 12,
    color: Colors.textLight,
  },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.cream,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    height: 46,
    gap: Spacing.sm,
  },
  searchIcon: { fontSize: 14 },
  searchInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.charcoal,
    paddingVertical: 0,
  },

  // Results
  resultsList: { maxHeight: 260, marginTop: Spacing.md },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing.md,
  },
  resultAvatar: { width: 40, height: 40, borderRadius: 20 },
  resultAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.masalaBrown,
    alignItems: "center",
    justifyContent: "center",
  },
  resultAvatarInitial: {
    fontSize: 16,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  resultInfo: { flex: 1 },
  resultName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.charcoal,
  },
  resultEmail: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    marginTop: 1,
  },
  addBadge: {
    backgroundColor: Colors.mint,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  addBadgeText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: "#2E7D32",
  },
  noResults: {
    textAlign: "center",
    color: Colors.textLight,
    fontSize: FontSize.md,
    paddingVertical: Spacing.xxl,
  },
});
