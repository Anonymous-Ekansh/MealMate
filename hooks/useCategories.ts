/**
 * MealMate - Categories Hooks
 */

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getCategories,
  getCategoryBySlug,
} from "../services/categories.service";
import { getCatalogItemCountByCategory } from "../services/catalog.service";

const CATEGORIES_KEY = "categories";

export function useCategories() {
  return useQuery({
    queryKey: [CATEGORIES_KEY],
    queryFn: getCategories,
  });
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: [CATEGORIES_KEY, slug],
    queryFn: () => getCategoryBySlug(slug),
    enabled: !!slug,
  });
}

export function useCategoryMaps() {
  const { data: categories = [], ...rest } = useCategories();

  const labelBySlug = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.slug, c.label])),
    [categories]
  );

  const slugs = useMemo(() => categories.map((c) => c.slug), [categories]);

  return { categories, labelBySlug, slugs, ...rest };
}

export function useCategoryItemCounts(categoryIds: string[]) {
  return useQuery({
    queryKey: [CATEGORIES_KEY, "counts", categoryIds],
    queryFn: async () => {
      const counts: Record<string, number> = {};
      await Promise.all(
        categoryIds.map(async (id) => {
          counts[id] = await getCatalogItemCountByCategory(id);
        })
      );
      return counts;
    },
    enabled: categoryIds.length > 0,
  });
}
