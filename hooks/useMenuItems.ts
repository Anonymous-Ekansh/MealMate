/**
 * MealMate - Menu Items Hooks
 * TanStack Query hooks for menu item CRUD with cache invalidation.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  moveCategory,
} from "../services/menu.service";
import type { MenuItem, MenuItemInsert } from "../lib/types";

const MENU_ITEMS_KEY = "menuItems";

/**
 * Fetch menu items with optional filters.
 */
export function useMenuItems(
  userId?: string,
  category?: string,
  date?: string
) {
  return useQuery({
    queryKey: [MENU_ITEMS_KEY, userId, category, date],
    queryFn: () => getMenuItems(userId, category, date),
  });
}

/**
 * Add a new menu item.
 */
export function useAddMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (item: Omit<MenuItemInsert, "user_id">) => addMenuItem(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MENU_ITEMS_KEY] });
    },
  });
}

/**
 * Update an existing menu item.
 */
export function useUpdateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Omit<MenuItem, "id" | "user_id" | "created_at">>;
    }) => updateMenuItem(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MENU_ITEMS_KEY] });
    },
  });
}

/**
 * Delete a menu item.
 */
export function useDeleteMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMenuItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MENU_ITEMS_KEY] });
    },
  });
}

/**
 * Move a menu item to a different category.
 */
export function useMoveCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newCategory }: { id: string; newCategory: string }) =>
      moveCategory(id, newCategory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MENU_ITEMS_KEY] });
    },
  });
}
