/**
 * MealMate - Real-time Hook
 * Supabase Realtime subscription for group chat messages.
 */

import { useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { GroupMessage, Profile } from "../lib/types";

interface RealtimeMessage extends GroupMessage {
  sender: Profile | null;
}

/**
 * Subscribe to new messages in a group via Supabase Realtime.
 * Returns a function to append new messages to local state.
 */
export function useRealtimeMessages(
  groupId: string | undefined,
  onNewMessage: (message: GroupMessage) => void
) {
  const callbackRef = useRef(onNewMessage);
  callbackRef.current = onNewMessage;

  useEffect(() => {
    if (!groupId) return;

    const channel = supabase
      .channel("group-chat-" + groupId)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "group_messages",
          filter: "group_id=eq." + groupId,
        },
        (payload) => {
          callbackRef.current(payload.new as GroupMessage);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);
}

/**
 * Subscribe to changes in group members.
 */
export function useRealtimeGroupMembers(
  groupId: string | undefined,
  onMemberChange: () => void
) {
  const callbackRef = useRef(onMemberChange);
  callbackRef.current = onMemberChange;

  useEffect(() => {
    if (!groupId) return;

    const channel = supabase
      .channel("group-members-" + groupId)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "group_members",
          filter: "group_id=eq." + groupId,
        },
        () => {
          callbackRef.current();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);
}
