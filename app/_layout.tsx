/**
 * MealMate - Root Layout
 * Sets up providers, initializes auth, and handles routing based on session.
 */

import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Image,
  Text,
} from "react-native";
import { QueryProvider } from "../lib/query-provider";
import { useAuthStore, needsOnboarding } from "../stores/useAuthStore";
import { Colors, FontWeight } from "../constants/theme";

function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const { session, profile, isLoading, isInitialized, initialize } =
    useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === "(auth)";
    const onOnboarding = (segments as string[]).includes("onboarding");
    const incomplete = needsOnboarding(profile);

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/login");
      return;
    }

    if (session && incomplete && !onOnboarding) {
      router.replace("/(auth)/onboarding");
      return;
    }

    if (session && !incomplete && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [session, isInitialized, segments, profile]);

  if (isLoading || !isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <Image
          source={require("../assets/logo.png")}
          style={styles.loadingLogo}
          resizeMode="contain"
        />
        <Text style={styles.loadingTitle}>MealMate</Text>
        <ActivityIndicator
          size="large"
          color={Colors.white}
          style={styles.spinner}
        />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="category/[slug]"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="group/[id]"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="user/[id]"
        options={{ animation: "slide_from_right" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryProvider>
        <StatusBar style="light" />
        <AuthGate />
      </QueryProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.saffron,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingLogo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  loadingTitle: {
    fontSize: 28,
    fontWeight: FontWeight.heavy,
    color: Colors.white,
    marginBottom: 24,
  },
  spinner: {
    marginTop: 8,
  },
});
