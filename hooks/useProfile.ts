/**
 * MealMate - Profile Hooks
 * React Query hooks for profile operations.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCurrentProfile,
  getProfileById,
  getAllProfiles,
  updateProfile,
  searchProfiles,
} from "../services/profileService";

export function useCurrentProfile() {
  return useQuery({
    queryKey: ["profile", "current"],
    queryFn: getCurrentProfile,
  });
}

export function useProfile(userId: string) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: () => getProfileById(userId),
    enabled: !!userId,
  });
}

export function useAllProfiles() {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: getAllProfiles,
  });
}

export function useSearchProfiles(query: string) {
  return useQuery({
    queryKey: ["profiles", "search", query],
    queryFn: () => searchProfiles(query),
    enabled: query.length >= 2,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "current"] });
    },
  });
}
