/**
 * MealMate - Catalog Items Hooks
 */

import { useQuery } from "@tanstack/react-query";
import { getCatalogByCategorySlug } from "../services/catalog.service";

const CATALOG_KEY = "catalog";

export function useCatalogItems(categorySlug: string) {
  return useQuery({
    queryKey: [CATALOG_KEY, categorySlug],
    queryFn: () => getCatalogByCategorySlug(categorySlug),
    enabled: !!categorySlug,
  });
}
