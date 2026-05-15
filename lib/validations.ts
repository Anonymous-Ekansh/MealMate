/**
 * MealMate - Zod Validation Schemas
 * Validation schemas for forms throughout the app.
 */

import { z } from "zod";

export const menuItemSchema = z.object({
  item_name: z
    .string()
    .min(1, "Item name is required")
    .max(100, "Item name is too long"),
  category: z.string().min(1, "Please select a valid category"),
  description: z.string().max(500, "Description is too long").optional(),
  image_url: z.string().url().optional().nullable(),
  added_date: z.string().optional().nullable(),
  added_time: z.string().optional().nullable(),
});

export type MenuItemFormData = z.infer<typeof menuItemSchema>;
