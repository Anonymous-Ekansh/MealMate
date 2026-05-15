/**
 * MealMate - TypeScript Types
 * Interfaces matching the Supabase database schema.
 */

// ─── Row Types ───────────────────────────────────────────────

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export interface MenuItem {
  id: string;
  user_id: string;
  item_name: string;
  category: string;
  description: string | null;
  image_url: string | null;
  added_date: string | null;
  added_time: string | null;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  created_by: string;
  created_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

export interface GroupMessage {
  id: string;
  group_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  is_read: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  group_id: string | null;
  action_type: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface MealCategory {
  id: string;
  slug: string;
  label: string;
  description: string | null;
  accent_color: string | null;
  icon_name: string | null;
  sort_order: number;
  created_at: string;
}

export interface CatalogItem {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  unit: string;
  serves_per_unit: number;
  is_veg: boolean;
  image_url: string | null;
  tags: string[] | null;
  sort_order: number;
  created_at: string;
}

/** Catalog item with category slug for menu insertion */
export interface CatalogItemWithCategory extends CatalogItem {
  category_slug: string;
}

// ─── Insert Types (omit server-generated fields) ────────────

export type ProfileInsert = Omit<Profile, "created_at"> & {
  created_at?: string;
};

export type MenuItemInsert = Omit<MenuItem, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

export type GroupInsert = Omit<Group, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

export type GroupMemberInsert = Omit<GroupMember, "id" | "joined_at"> & {
  id?: string;
  joined_at?: string;
};

export type GroupMessageInsert = Omit<GroupMessage, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

export type NotificationInsert = Omit<Notification, "id" | "created_at" | "is_read"> & {
  id?: string;
  is_read?: boolean;
  created_at?: string;
};

export type ActivityLogInsert = Omit<ActivityLog, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

// ─── Update Types (all fields optional except id) ───────────

export type ProfileUpdate = Partial<Omit<Profile, "id">> & { id: string };
export type MenuItemUpdate = Partial<Omit<MenuItem, "id">> & { id: string };
export type GroupUpdate = Partial<Omit<Group, "id">> & { id: string };
export type NotificationUpdate = Partial<Omit<Notification, "id">> & { id: string };

// ─── Supabase Database Type (for typed client) ──────────────

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: Partial<Omit<Profile, "id">>;
      };
      menu_items: {
        Row: MenuItem;
        Insert: MenuItemInsert;
        Update: Partial<Omit<MenuItem, "id">>;
      };
      groups: {
        Row: Group;
        Insert: GroupInsert;
        Update: Partial<Omit<Group, "id">>;
      };
      group_members: {
        Row: GroupMember;
        Insert: GroupMemberInsert;
        Update: Partial<Omit<GroupMember, "id">>;
      };
      group_messages: {
        Row: GroupMessage;
        Insert: GroupMessageInsert;
        Update: Partial<Omit<GroupMessage, "id">>;
      };
      notifications: {
        Row: Notification;
        Insert: NotificationInsert;
        Update: Partial<Omit<Notification, "id">>;
      };
      activity_logs: {
        Row: ActivityLog;
        Insert: ActivityLogInsert;
        Update: Partial<Omit<ActivityLog, "id">>;
      };
      categories: {
        Row: MealCategory;
        Insert: Omit<MealCategory, "created_at"> & { created_at?: string };
        Update: Partial<Omit<MealCategory, "id">>;
      };
      catalog_items: {
        Row: CatalogItem;
        Insert: Omit<CatalogItem, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<CatalogItem, "id">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// ─── Joined / Enriched Types (for UI) ───────────────────────

/** Group message with sender profile info attached */
export interface GroupMessageWithSender extends GroupMessage {
  sender: Pick<Profile, "id" | "full_name" | "avatar_url">;
}

/** Group member with profile info attached */
export interface GroupMemberWithProfile extends GroupMember {
  profile: Pick<Profile, "id" | "full_name" | "avatar_url" | "email">;
}

/** Group with member count */
export interface GroupWithMemberCount extends Group {
  member_count: number;
}
