/**
 * MealMate - Onboarding Screen
 * Collects display name and bio after first sign-up.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
} from "../../constants/theme";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../stores/useAuthStore";

export default function OnboardingScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);

  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [bio, setBio] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = async () => {
    const trimmedName = fullName.trim();
    const trimmedBio = bio.trim();

    if (!trimmedName) {
      setError("Please enter your name.");
      return;
    }
    if (!trimmedBio) {
      setError("Please tell us a little about yourself.");
      return;
    }
    if (!user) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const { data, error: updateError } = await supabase
        .from("profiles")
        .update({ full_name: trimmedName, bio: trimmedBio })
        .eq("id", user.id)
        .select()
        .single();

      if (updateError) throw updateError;
      if (data) setProfile(data);
      router.replace("/(tabs)");
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "Could not save your profile. Try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.eyebrow}>Welcome to MealMate</Text>
          <Text style={styles.title}>Set up your profile</Text>
          <Text style={styles.subtitle}>
            Add your name and a short bio so friends know who you are.
          </Text>

          <Text style={styles.label}>Your name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="How should we call you?"
            placeholderTextColor={Colors.textLight}
            autoCapitalize="words"
            returnKeyType="next"
          />

          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            value={bio}
            onChangeText={setBio}
            placeholder="A few words about your food preferences..."
            placeholderTextColor={Colors.textLight}
            multiline
            maxLength={200}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{bio.length}/200</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>Continue</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.huge,
    paddingBottom: Spacing.xxxl,
  },
  eyebrow: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.saffron,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.heavy,
    color: Colors.charcoal,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.xxxl,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.charcoal,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.charcoal,
    marginBottom: Spacing.xl,
  },
  bioInput: {
    minHeight: 100,
    paddingTop: Spacing.md,
  },
  charCount: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    textAlign: "right",
    marginTop: -Spacing.lg,
    marginBottom: Spacing.xl,
  },
  error: {
    fontSize: FontSize.sm,
    color: Colors.error,
    marginBottom: Spacing.md,
  },
  button: {
    backgroundColor: Colors.saffron,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: "center",
    marginTop: Spacing.md,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
});
