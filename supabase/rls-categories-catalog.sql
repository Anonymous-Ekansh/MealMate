-- MealMate: RLS for categories & catalog_items
-- Run in Supabase SQL Editor (safe to re-run)

-- ─── categories ─────────────────────────────────────────────────────────────

drop policy if exists "Categories are readable by authenticated users" on public.categories;
drop policy if exists "Authenticated users can select categories" on public.categories;
drop policy if exists "Authenticated users can insert categories" on public.categories;
drop policy if exists "Authenticated users can update categories" on public.categories;
drop policy if exists "Authenticated users can delete categories" on public.categories;

alter table public.categories enable row level security;

create policy "Authenticated users can select categories"
  on public.categories
  for select
  to authenticated
  using (true);

create policy "Authenticated users can insert categories"
  on public.categories
  for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update categories"
  on public.categories
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete categories"
  on public.categories
  for delete
  to authenticated
  using (true);

-- ─── catalog_items ──────────────────────────────────────────────────────────

drop policy if exists "Catalog items are readable by authenticated users" on public.catalog_items;
drop policy if exists "Authenticated users can select catalog items" on public.catalog_items;
drop policy if exists "Authenticated users can insert catalog items" on public.catalog_items;
drop policy if exists "Authenticated users can update catalog items" on public.catalog_items;
drop policy if exists "Authenticated users can delete catalog items" on public.catalog_items;

alter table public.catalog_items enable row level security;

create policy "Authenticated users can select catalog items"
  on public.catalog_items
  for select
  to authenticated
  using (true);

create policy "Authenticated users can insert catalog items"
  on public.catalog_items
  for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update catalog items"
  on public.catalog_items
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete catalog items"
  on public.catalog_items
  for delete
  to authenticated
  using (true);
