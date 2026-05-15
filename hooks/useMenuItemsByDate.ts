/**
 * MealMate - Menu items for a single date
 */

import { useQuery } from "@tanstack/react-query";
import { getMenuItemsByDate } from "../services/menu.service";

const MENU_BY_DATE_KEY = "menuItemsByDate";

export function useMenuItemsByDate(userId: string | undefined, date: string) {
  return useQuery({
    queryKey: [MENU_BY_DATE_KEY, userId, date],
    queryFn: () => getMenuItemsByDate(userId!, date),
    enabled: !!userId && !!date,
  });
}
