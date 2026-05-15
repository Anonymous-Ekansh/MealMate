/**
 * MealMate - Group Service
 * Supabase operations for groups, members, and messages.
 */

import { supabase } from "../lib/supabase";
import type {
  Group,
  GroupInsert,
  GroupMember,
  GroupMemberInsert,
  GroupMessage,
  GroupMessageInsert,
  GroupMemberWithProfile,
  GroupMessageWithSender,
  GroupWithMemberCount,
} from "../lib/types";

// ─── Groups ─────────────────────────────────────────────────

/** Fetch groups the current user is a member of */
export async function getMyGroups(): Promise<Group[]> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("group_members")
    .select("group_id, groups(*)")
    .eq("user_id", user.id);

  if (error) throw error;
  return (data ?? []).map((row: any) => row.groups).filter(Boolean);
}

/** Create a new group and add creator as admin */
export async function createGroup(
  group: Omit<GroupInsert, "created_by">
): Promise<Group> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("groups")
    .insert({ ...group, created_by: user.id })
    .select()
    .single();

  if (error) throw error;

  // Auto-add creator as admin member
  await supabase.from("group_members").insert({
    group_id: data.id,
    user_id: user.id,
    role: "admin",
  });

  return data;
}

/** Get group details by ID */
export async function getGroupById(groupId: string): Promise<Group> {
  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .eq("id", groupId)
    .single();

  if (error) throw error;
  return data;
}

/** Update a group */
export async function updateGroup(
  groupId: string,
  updates: Partial<Omit<Group, "id" | "created_by" | "created_at">>
): Promise<Group> {
  const { data, error } = await supabase
    .from("groups")
    .update(updates)
    .eq("id", groupId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Group Members ──────────────────────────────────────────

/** Get all members of a group with their profiles */
export async function getGroupMembers(
  groupId: string
): Promise<GroupMemberWithProfile[]> {
  const { data, error } = await supabase
    .from("group_members")
    .select("*, profile:profiles(id, full_name, avatar_url, email)")
    .eq("group_id", groupId);

  if (error) throw error;
  return data as unknown as GroupMemberWithProfile[];
}

/** Add a member to a group */
export async function addGroupMember(
  groupId: string,
  userId: string,
  role: string = "member"
): Promise<GroupMember> {
  const { data, error } = await supabase
    .from("group_members")
    .insert({ group_id: groupId, user_id: userId, role })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Remove a member from a group */
export async function removeGroupMember(
  groupId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", userId);

  if (error) throw error;
}

// ─── Group Messages ─────────────────────────────────────────

/** Get messages for a group, newest first */
export async function getGroupMessages(
  groupId: string,
  limit: number = 50
): Promise<GroupMessageWithSender[]> {
  const { data, error } = await supabase
    .from("group_messages")
    .select("*, sender:profiles!sender_id(id, full_name, avatar_url)")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).reverse() as unknown as GroupMessageWithSender[];
}

/** Send a message to a group */
export async function sendGroupMessage(
  message: Omit<GroupMessageInsert, "sender_id">
): Promise<GroupMessage> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("group_messages")
    .insert({ ...message, sender_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Subscribe to new messages in a group (realtime) */
export function subscribeToGroupMessages(
  groupId: string,
  onNewMessage: (message: GroupMessage) => void
) {
  return supabase
    .channel(`group_messages:${groupId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "group_messages",
        filter: `group_id=eq.${groupId}`,
      },
      (payload) => onNewMessage(payload.new as GroupMessage)
    )
    .subscribe();
}
