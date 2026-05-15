/**
 * MealMate - Group Hooks
 * React Query hooks for group, member, and message operations.
 */

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyGroups,
  getGroupById,
  createGroup,
  updateGroup,
  getGroupMembers,
  addGroupMember,
  removeGroupMember,
  getGroupMessages,
  sendGroupMessage,
  subscribeToGroupMessages,
} from "../services/groupService";
import type { GroupMessage } from "../lib/types";

// ─── Groups ─────────────────────────────────────────────────

export function useMyGroups() {
  return useQuery({
    queryKey: ["groups", "mine"],
    queryFn: getMyGroups,
  });
}

export function useGroup(groupId: string) {
  return useQuery({
    queryKey: ["group", groupId],
    queryFn: () => getGroupById(groupId),
    enabled: !!groupId,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

export function useUpdateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      ...updates
    }: { groupId: string } & Parameters<typeof updateGroup>[1]) =>
      updateGroup(groupId, updates),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({
        queryKey: ["group", variables.groupId],
      });
    },
  });
}

// ─── Group Members ──────────────────────────────────────────

export function useGroupMembers(groupId: string) {
  return useQuery({
    queryKey: ["groupMembers", groupId],
    queryFn: () => getGroupMembers(groupId),
    enabled: !!groupId,
  });
}

export function useAddGroupMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      userId,
      role,
    }: {
      groupId: string;
      userId: string;
      role?: string;
    }) => addGroupMember(groupId, userId, role),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["groupMembers", variables.groupId],
      });
    },
  });
}

export function useRemoveGroupMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) =>
      removeGroupMember(groupId, userId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["groupMembers", variables.groupId],
      });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

// ─── Group Messages ─────────────────────────────────────────

export function useGroupMessages(groupId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["groupMessages", groupId],
    queryFn: () => getGroupMessages(groupId),
    enabled: !!groupId,
  });

  // Subscribe to realtime messages
  useEffect(() => {
    if (!groupId) return;

    const channel = subscribeToGroupMessages(groupId, (_newMessage) => {
      // Refetch messages when a new one arrives
      queryClient.invalidateQueries({
        queryKey: ["groupMessages", groupId],
      });
    });

    return () => {
      channel.unsubscribe();
    };
  }, [groupId, queryClient]);

  return query;
}

export function useSendGroupMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendGroupMessage,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["groupMessages", variables.group_id],
      });
    },
  });
}
