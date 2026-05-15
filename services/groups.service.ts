/**
 * MealMate - Groups Service
 * Supabase operations for groups, members, search, and messaging.
 */

import { supabase } from "../lib/supabase";
import type {
  Group,
  GroupMember,
  GroupMessage,
  Profile,
  Notification,
} from "../lib/types";

// ─── Groups ─────────────────────────────────────────────────

/**
 * Create a new group with members.
 * Creator is auto-added as admin.
 */
export async function createGroup(
  data: { name: string; description?: string; image_url?: string },
  memberIds: string[]
): Promise<Group> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Not authenticated");

  // Insert the group
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .insert({
      name: data.name,
      description: data.description ?? null,
      image_url: data.image_url ?? null,
      created_by: user.id,
    })
    .select()
    .single();

  if (groupError) throw groupError;

  // Build members array: creator as admin + selected members
  const allMembers = [
    { group_id: group.id, user_id: user.id, role: "admin" },
    ...memberIds
      .filter((id) => id !== user.id)
      .map((id) => ({
        group_id: group.id,
        user_id: id,
        role: "member",
      })),
  ];

  // Insert all members
  const { error: membersError } = await supabase
    .from("group_members")
    .insert(allMembers);

  if (membersError) throw membersError;

  // Send notifications to added members
  const notifications = memberIds
    .filter((id) => id !== user.id)
    .map((id) => ({
      user_id: id,
      title: "Added to group",
      content: `You were added to "${group.name}"`,
    }));

  if (notifications.length > 0) {
    await supabase.from("notifications").insert(notifications);
  }

  // Log activity
  await supabase.from("activity_logs").insert({
    user_id: user.id,
    group_id: group.id,
    action_type: "group_created",
    metadata: { group_name: group.name, member_count: allMembers.length },
  });

  return group;
}

/**
 * Get all groups the current user belongs to, with member count and last message.
 */
export async function getMyGroups(
  userId: string
): Promise<
  (Group & { member_count: number; last_message: GroupMessage | null })[]
> {
  // Get group IDs the user is a member of
  const { data: memberships, error: memError } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("user_id", userId);

  if (memError) throw memError;
  if (!memberships || memberships.length === 0) return [];

  const groupIds = memberships.map((m: any) => m.group_id);

  // Get groups
  const { data: groups, error: groupsError } = await supabase
    .from("groups")
    .select("*")
    .in("id", groupIds)
    .order("created_at", { ascending: false });

  if (groupsError) throw groupsError;

  // Get member counts for each group
  const result = await Promise.all(
    (groups ?? []).map(async (group: any) => {
      // Count members
      const { count } = await supabase
        .from("group_members")
        .select("*", { count: "exact", head: true })
        .eq("group_id", group.id);

      // Get last message
      const { data: lastMsg } = await supabase
        .from("group_messages")
        .select("*")
        .eq("group_id", group.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      return {
        ...group,
        member_count: count ?? 0,
        last_message: lastMsg ?? null,
      };
    })
  );

  return result;
}

/**
 * Get members of a group with their profile info.
 */
export async function getGroupMembers(
  groupId: string
): Promise<(GroupMember & { profile: Profile })[]> {
  const { data, error } = await supabase
    .from("group_members")
    .select("*, profile:profiles(*)")
    .eq("group_id", groupId);

  if (error) throw error;
  return (data ?? []) as any;
}

/**
 * Get member avatars for a group (up to limit).
 */
export async function getGroupMemberAvatars(
  groupId: string,
  limit: number = 5
): Promise<Pick<Profile, "id" | "full_name" | "avatar_url">[]> {
  const { data, error } = await supabase
    .from("group_members")
    .select("user_id, profile:profiles(id, full_name, avatar_url)")
    .eq("group_id", groupId)
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map((d: any) => d.profile).filter(Boolean);
}

// ─── User Search ────────────────────────────────────────────

/**
 * Search users by name or email.
 */
export async function searchUsers(query: string): Promise<Profile[]> {
  if (!query || query.length < 2) return [];

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
    .limit(20);

  if (error) throw error;
  return data ?? [];
}

// ─── Members ────────────────────────────────────────────────

/**
 * Add a member to a group.
 */
export async function addMember(
  groupId: string,
  userId: string
): Promise<GroupMember> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Not authenticated");

  // Check duplicate
  const { data: existing } = await supabase
    .from("group_members")
    .select("id")
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) throw new Error("User is already a member of this group");

  // Check max 10 members
  const { count } = await supabase
    .from("group_members")
    .select("*", { count: "exact", head: true })
    .eq("group_id", groupId);

  if ((count ?? 0) >= 10)
    throw new Error("Group has reached the maximum of 10 members");

  const { data, error } = await supabase
    .from("group_members")
    .insert({ group_id: groupId, user_id: userId, role: "member" })
    .select()
    .single();

  if (error) throw error;

  // Get group name for notification
  const { data: group } = await supabase
    .from("groups")
    .select("name")
    .eq("id", groupId)
    .single();

  // Notify the added user
  await supabase.from("notifications").insert({
    user_id: userId,
    title: "Added to group",
    content: `You were added to "${group?.name ?? "a group"}"`,
  });

  return data;
}

/**
 * Remove a member from a group.
 */
export async function removeMember(
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

/**
 * Leave a group.
 */
export async function leaveGroup(
  groupId: string,
  userId: string
): Promise<void> {
  await removeMember(groupId, userId);

  // Log activity
  await supabase.from("activity_logs").insert({
    user_id: userId,
    group_id: groupId,
    action_type: "member_left",
    metadata: {},
  });
}

// ─── Messages ───────────────────────────────────────────────

/**
 * Get messages for a group with sender profiles.
 */
export async function getGroupMessages(
  groupId: string,
  limit: number = 50
): Promise<(GroupMessage & { sender: Profile | null })[]> {
  const { data, error } = await supabase
    .from("group_messages")
    .select("*, sender:profiles!sender_id(*)")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return ((data ?? []) as any).reverse();
}

/**
 * Send a text message and notify other members.
 */
export async function sendMessage(
  groupId: string,
  content: string
): Promise<GroupMessage> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Not authenticated");

  // Insert message
  const { data: message, error } = await supabase
    .from("group_messages")
    .insert({
      group_id: groupId,
      sender_id: user.id,
      content,
      message_type: "text",
    })
    .select()
    .single();

  if (error) throw error;

  // Log activity
  await supabase.from("activity_logs").insert({
    user_id: user.id,
    group_id: groupId,
    action_type: "message_sent",
    metadata: { preview: content.slice(0, 50) },
  });

  // Notify other members
  const { data: members } = await supabase
    .from("group_members")
    .select("user_id")
    .eq("group_id", groupId)
    .neq("user_id", user.id);

  if (members && members.length > 0) {
    // Get sender name
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const senderName = profile?.full_name ?? "Someone";

    const { data: group } = await supabase
      .from("groups")
      .select("name")
      .eq("id", groupId)
      .single();

    const notifications = members.map((m: any) => ({
      user_id: m.user_id,
      title: group?.name ?? "New message",
      content: `${senderName}: ${content.slice(0, 80)}${content.length > 80 ? "..." : ""}`,
    }));

    await supabase.from("notifications").insert(notifications);
  }

  return message;
}

/**
 * Send a system message (e.g. when a menu item is added).
 */
export async function sendSystemMessage(
  groupId: string,
  content: string,
  metadata?: Record<string, unknown>
): Promise<GroupMessage> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Not authenticated");

  const { data: message, error } = await supabase
    .from("group_messages")
    .insert({
      group_id: groupId,
      sender_id: user.id,
      content,
      message_type: "system",
      metadata: metadata ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return message;
}

/**
 * Get group details by ID.
 */
export async function getGroupById(groupId: string): Promise<Group> {
  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .eq("id", groupId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Upload a group image.
 */
export async function uploadGroupImage(
  uri: string,
  fileName: string
): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  const filePath = `groups/${Date.now()}_${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("group-images")
    .upload(filePath, blob, { contentType: "image/jpeg", upsert: false });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from("group-images").getPublicUrl(filePath);

  return publicUrl;
}
