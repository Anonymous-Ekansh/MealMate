/**
 * MealMate - Auth Store (Zustand)
 * Manages authentication state, session, and profile auto-creation.
 */

import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type { Profile } from "../lib/types";
import type { Session, User } from "@supabase/supabase-js";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";

// Ensure the web browser is dismissed after OAuth redirect
WebBrowser.maybeCompleteAuthSession();

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  initialize: () => Promise<void>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  isInitialized: false,

  setUser: (user) => set({ user }),

  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
    }),

  setProfile: (profile) => set({ profile }),

  initialize: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      set({
        session,
        user: session?.user ?? null,
        isLoading: false,
        isInitialized: true,
      });

      // Fetch or create profile if authenticated
      if (session?.user) {
        await upsertProfile(session.user);
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profile) set({ profile });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        set({
          session,
          user: session?.user ?? null,
        });

        if (event === "SIGNED_IN" && session?.user) {
          await upsertProfile(session.user);
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (profile) set({ profile });
        }

        if (event === "SIGNED_OUT") {
          set({ profile: null });
        }
      });
    } catch {
      set({ isLoading: false, isInitialized: true });
    }
  },

  login: async () => {
    try {
      const redirectUrl = makeRedirectUri();

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error("No OAuth URL returned");

      // Open the browser for Google sign-in
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUrl
      );

      if (result.type === "success") {
        const url = new URL(result.url);
        // Extract tokens from the URL fragment
        const params = new URLSearchParams(
          url.hash ? url.hash.substring(1) : url.search.substring(1)
        );
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (accessToken && refreshToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({
      session: null,
      user: null,
      profile: null,
    });
  },
}));

/**
 * Upsert user profile on first login.
 * Uses data from the OAuth provider (Google).
 */
async function upsertProfile(user: User) {
  const metadata = user.user_metadata;

  const { data: existing } = await supabase
    .from("profiles")
    .select("full_name, bio")
    .eq("id", user.id)
    .maybeSingle();

  await supabase.from("profiles").upsert(
    {
      id: user.id,
      full_name:
        existing?.full_name?.trim() ||
        metadata?.full_name ||
        metadata?.name ||
        null,
      email: user.email ?? null,
      avatar_url: metadata?.avatar_url ?? metadata?.picture ?? null,
      bio: existing?.bio ?? null,
    },
    { onConflict: "id" }
  );
}

/** True when the user has not completed name + bio onboarding. */
export function needsOnboarding(
  profile: Profile | null | undefined
): boolean {
  if (!profile) return false;
  return !profile.bio?.trim();
}
