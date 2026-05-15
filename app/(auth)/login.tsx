/**
 * MealMate - Login Screen
 * Full-screen warm saffron login with Google OAuth.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
  Alert,
} from "react-native";
import { useAuthStore } from "../../stores/useAuthStore";
import { Colors, FontWeight } from "../../constants/theme";

const { width, height } = Dimensions.get("window");

export default function LoginScreen() {
  const login = useAuthStore((s) => s.login);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await login();
    } catch (error: any) {
      Alert.alert(
        "Sign In Failed",
        error?.message ?? "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Decorative circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <View style={styles.circle3} />

      {/* Content */}
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Tagline */}
        <Text style={styles.tagline}>What's cooking today?</Text>

        {/* Description */}
        <Text style={styles.description}>
          Share meals, plan together, and never eat alone.{"\n"}
          Join your friends and family on MealMate.
        </Text>
      </View>

      {/* Bottom section */}
      <View style={styles.bottomSection}>
        {/* Google Sign-In Button */}
        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleLogin}
          activeOpacity={0.9}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.charcoal} />
          ) : (
            <>
              {/* Google "G" Icon */}
              <View style={styles.googleIconContainer}>
                <Text style={styles.googleG}>G</Text>
              </View>
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Footer text */}
        <Text style={styles.footerText}>
          By continuing, you agree to our{"\n"}
          <Text style={styles.footerLink}>Terms of Service</Text> &{" "}
          <Text style={styles.footerLink}>Privacy Policy</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.saffron,
    justifyContent: "space-between",
    overflow: "hidden",
  },

  // Decorative background circles
  circle1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    top: -80,
    right: -80,
  },
  circle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    top: height * 0.35,
    left: -60,
  },
  circle3: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    bottom: 120,
    right: -40,
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },

  logoContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    width: 140,
    height: 140,
  },

  tagline: {
    fontSize: 28,
    fontWeight: FontWeight.heavy,
    color: Colors.white,
    textAlign: "center",
    marginBottom: 12,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  description: {
    fontSize: 15,
    fontWeight: FontWeight.medium,
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    lineHeight: 22,
  },

  bottomSection: {
    paddingHorizontal: 32,
    paddingBottom: 60,
    alignItems: "center",
  },

  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    gap: 12,
  },

  googleIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F1F1F1",
    alignItems: "center",
    justifyContent: "center",
  },

  googleG: {
    fontSize: 16,
    fontWeight: FontWeight.bold,
    color: "#4285F4",
  },

  googleButtonText: {
    fontSize: 17,
    fontWeight: FontWeight.semibold,
    color: Colors.charcoal,
  },

  footerText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginTop: 20,
    lineHeight: 18,
  },

  footerLink: {
    textDecorationLine: "underline",
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: FontWeight.semibold,
  },
});
