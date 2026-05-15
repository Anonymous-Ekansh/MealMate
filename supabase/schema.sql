-- =============================================================================
-- MealMate – Full Supabase schema
-- Run in: Supabase Dashboard → SQL Editor → New query → Run
-- Seed categories/catalog in Supabase separately (not in this file).
-- =============================================================================

-- ─── Extensions ─────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- ─── Profiles ───────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now()
);

-- Auto-create profile row on sign-up (app also upserts on OAuth)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.email,
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Categories & catalog (browse / add to menu) ────────────────────────────

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  description text,
  accent_color text,
  icon_name text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.catalog_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete cascade,
  name text not null,
  description text,
  unit text not null default 'serving',
  serves_per_unit int not null default 1,
  is_veg boolean not null default true,
  image_url text,
  tags text[],
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists catalog_items_category_id_idx
  on public.catalog_items (category_id);

-- ─── User menu items ──────────────────────────────────────────────────────────

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  item_name text not null,
  category text not null,
  description text,
  image_url text,
  added_date date,
  added_time time,
  created_at timestamptz not null default now()
);

create index if not exists menu_items_user_id_idx on public.menu_items (user_id);
create index if not exists menu_items_category_idx on public.menu_items (category);

-- ─── Groups & messaging ───────────────────────────────────────────────────────

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  created_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member',
  joined_at timestamptz not null default now(),
  unique (group_id, user_id)
);

create table if not exists public.group_messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  message_type text not null default 'text',
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists group_members_user_id_idx on public.group_members (user_id);
create index if not exists group_members_group_id_idx on public.group_members (group_id);
create index if not exists group_messages_group_id_idx on public.group_messages (group_id);

-- ─── Notifications & activity ───────────────────────────────────────────────

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  content text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_id_idx on public.notifications (user_id);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  group_id uuid references public.groups (id) on delete set null,
  action_type text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- ─── Helper: is current user in group? ──────────────────────────────────────

create or replace function public.is_group_member(p_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.group_members
    where group_id = p_group_id
      and user_id = auth.uid()
  );
$$;

-- ─── Row Level Security ───────────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.catalog_items enable row level security;
alter table public.menu_items enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.group_messages enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_logs enable row level security;

-- Profiles
drop policy if exists "Profiles are viewable by authenticated users" on public.profiles;
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select to authenticated using (true);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert to authenticated
  with check (id = auth.uid());

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Categories & catalog (full access for authenticated users)
drop policy if exists "Categories are readable by authenticated users" on public.categories;
drop policy if exists "Authenticated users can select categories" on public.categories;
drop policy if exists "Authenticated users can insert categories" on public.categories;
drop policy if exists "Authenticated users can update categories" on public.categories;
drop policy if exists "Authenticated users can delete categories" on public.categories;

create policy "Authenticated users can select categories"
  on public.categories for select to authenticated using (true);

create policy "Authenticated users can insert categories"
  on public.categories for insert to authenticated with check (true);

create policy "Authenticated users can update categories"
  on public.categories for update to authenticated using (true) with check (true);

create policy "Authenticated users can delete categories"
  on public.categories for delete to authenticated using (true);

drop policy if exists "Catalog items are readable by authenticated users" on public.catalog_items;
drop policy if exists "Authenticated users can select catalog items" on public.catalog_items;
drop policy if exists "Authenticated users can insert catalog items" on public.catalog_items;
drop policy if exists "Authenticated users can update catalog items" on public.catalog_items;
drop policy if exists "Authenticated users can delete catalog items" on public.catalog_items;

create policy "Authenticated users can select catalog items"
  on public.catalog_items for select to authenticated using (true);

create policy "Authenticated users can insert catalog items"
  on public.catalog_items for insert to authenticated with check (true);

create policy "Authenticated users can update catalog items"
  on public.catalog_items for update to authenticated using (true) with check (true);

create policy "Authenticated users can delete catalog items"
  on public.catalog_items for delete to authenticated using (true);

-- Menu items
drop policy if exists "Menu items are viewable by authenticated users" on public.menu_items;
create policy "Menu items are viewable by authenticated users"
  on public.menu_items for select to authenticated using (true);

drop policy if exists "Users can insert own menu items" on public.menu_items;
create policy "Users can insert own menu items"
  on public.menu_items for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users can update own menu items" on public.menu_items;
create policy "Users can update own menu items"
  on public.menu_items for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users can delete own menu items" on public.menu_items;
create policy "Users can delete own menu items"
  on public.menu_items for delete to authenticated
  using (user_id = auth.uid());

-- Groups
drop policy if exists "Group members can view their groups" on public.groups;
create policy "Group members can view their groups"
  on public.groups for select to authenticated
  using (public.is_group_member(id));

drop policy if exists "Authenticated users can create groups" on public.groups;
create policy "Authenticated users can create groups"
  on public.groups for insert to authenticated
  with check (created_by = auth.uid());

drop policy if exists "Group creator can update group" on public.groups;
create policy "Group creator can update group"
  on public.groups for update to authenticated
  using (created_by = auth.uid());

-- Group members
drop policy if exists "Members can view group membership" on public.group_members;
create policy "Members can view group membership"
  on public.group_members for select to authenticated
  using (public.is_group_member(group_id));

drop policy if exists "Group creator can add members" on public.group_members;
create policy "Group creator can add members"
  on public.group_members for insert to authenticated
  with check (
    exists (
      select 1 from public.groups g
      where g.id = group_id and g.created_by = auth.uid()
    )
    or user_id = auth.uid()
  );

drop policy if exists "Users can leave groups" on public.group_members;
create policy "Users can leave groups"
  on public.group_members for delete to authenticated
  using (user_id = auth.uid());

-- Group messages
drop policy if exists "Members can read group messages" on public.group_messages;
create policy "Members can read group messages"
  on public.group_messages for select to authenticated
  using (public.is_group_member(group_id));

drop policy if exists "Members can send messages" on public.group_messages;
create policy "Members can send messages"
  on public.group_messages for insert to authenticated
  with check (
    sender_id = auth.uid()
    and public.is_group_member(group_id)
  );

-- Notifications
drop policy if exists "Users can view own notifications" on public.notifications;
create policy "Users can view own notifications"
  on public.notifications for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users can update own notifications" on public.notifications;
create policy "Users can update own notifications"
  on public.notifications for update to authenticated
  using (user_id = auth.uid());

drop policy if exists "Authenticated can create notifications" on public.notifications;
create policy "Authenticated can create notifications"
  on public.notifications for insert to authenticated
  with check (true);

-- Activity logs
drop policy if exists "Users can view own activity logs" on public.activity_logs;
create policy "Users can view own activity logs"
  on public.activity_logs for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "Authenticated can insert activity logs" on public.activity_logs;
create policy "Authenticated can insert activity logs"
  on public.activity_logs for insert to authenticated
  with check (user_id = auth.uid());

-- ─── Storage buckets (menu & group images) ───────────────────────────────────
-- Create buckets in Dashboard → Storage if insert below fails on your plan.

insert into storage.buckets (id, name, public)
values
  ('menu-images', 'menu-images', true),
  ('group-images', 'group-images', true)
on conflict (id) do nothing;

drop policy if exists "Menu images are publicly readable" on storage.objects;
create policy "Menu images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'menu-images');

drop policy if exists "Users can upload own menu images" on storage.objects;
create policy "Users can upload own menu images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'menu-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can update own menu images" on storage.objects;
create policy "Users can update own menu images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'menu-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can delete own menu images" on storage.objects;
create policy "Users can delete own menu images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'menu-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Group images are publicly readable" on storage.objects;
create policy "Group images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'group-images');

drop policy if exists "Authenticated can upload group images" on storage.objects;
create policy "Authenticated can upload group images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'group-images');
