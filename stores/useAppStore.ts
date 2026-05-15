/**
 * MealMate - App Store (Zustand)
 * Global application state management.
 */

import { create } from "zustand";
export type MealCategory = string;

interface MealSelection {
  foodId: string;
  quantity: number;
}

interface AppState {
  // Current meal planning session
  selectedCategory: MealCategory | null;
  guestCount: number;
  selections: MealSelection[];

  // Actions
  setCategory: (category: MealCategory) => void;
  setGuestCount: (count: number) => void;
  addSelection: (foodId: string, quantity: number) => void;
  removeSelection: (foodId: string) => void;
  updateQuantity: (foodId: string, quantity: number) => void;
  clearSelections: () => void;
  resetSession: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedCategory: null,
  guestCount: 1,
  selections: [],

  setCategory: (category) => set({ selectedCategory: category }),

  setGuestCount: (count) => set({ guestCount: Math.max(1, count) }),

  addSelection: (foodId, quantity) =>
    set((state) => ({
      selections: [...state.selections, { foodId, quantity }],
    })),

  removeSelection: (foodId) =>
    set((state) => ({
      selections: state.selections.filter((s) => s.foodId !== foodId),
    })),

  updateQuantity: (foodId, quantity) =>
    set((state) => ({
      selections: state.selections.map((s) =>
        s.foodId === foodId ? { ...s, quantity } : s
      ),
    })),

  clearSelections: () => set({ selections: [] }),

  resetSession: () =>
    set({
      selectedCategory: null,
      guestCount: 1,
      selections: [],
    }),
}));
