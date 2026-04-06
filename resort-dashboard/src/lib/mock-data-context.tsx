"use client";

/**
 * MockDataContext
 * ─────────────────────────────────────────────────────────────
 * Single source of truth for all mutable mock data that must be
 * shared across pages (Admin ↔ POS ↔ Activities).
 *
 * Provides:
 *  • menuItems        — F&B menu (read + upsert/delete)
 *  • activities       — Activity catalogue (read + upsert/delete)
 *  • menuMainCategories — Dynamic main categories (read + upsert/delete)
 *  • menuSubCategories  — Sub-categories (read + upsert/delete)
 *
 * Swap out `useState` initializers with Supabase fetches when ready.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  menuItems       as seedMenuItems,
  activities      as seedActivities,
  menuSubCategories as seedSubCats,
  menuMainCategories as seedMainCats,
} from "@/lib/mock-data";
import type {
  MenuItem,
  Activity,
  MenuSubCategory,
  MenuMainCategoryDef,
} from "@/lib/types";

// ── Context Shape ─────────────────────────────────────────────

interface MockDataContextType {
  // ── State ──
  menuItems:          MenuItem[];
  activities:         Activity[];
  menuMainCategories: MenuMainCategoryDef[];
  menuSubCategories:  MenuSubCategory[];

  // ── MenuItem CRUD ──
  /** Add (if id is new) or replace (if id already exists) a menu item. */
  upsertMenuItem:  (item: MenuItem) => void;
  deleteMenuItem:  (id: string)     => void;

  // ── Activity CRUD ──
  /** Add (if id is new) or replace (if id already exists) an activity. */
  upsertActivity:  (activity: Activity) => void;
  deleteActivity:  (id: string)         => void;

  // ── Main Category CRUD ──
  upsertMainCategory:  (cat: MenuMainCategoryDef) => void;
  deleteMainCategory:  (id: string)               => void;

  // ── Sub-Category CRUD ──
  upsertSubCategory:  (sub: MenuSubCategory) => void;
  deleteSubCategory:  (id: string)           => void;
}

// ── Context ───────────────────────────────────────────────────

const MockDataContext = createContext<MockDataContextType | null>(null);

// ── Hook ──────────────────────────────────────────────────────

export function useMockData(): MockDataContextType {
  const ctx = useContext(MockDataContext);
  if (!ctx) {
    throw new Error("useMockData must be used inside <MockDataProvider>");
  }
  return ctx;
}

// ── Provider ──────────────────────────────────────────────────

export function MockDataProvider({ children }: { children: ReactNode }) {
  const [menuItems,          setMenuItems]          = useState<MenuItem[]>(seedMenuItems);
  const [activities,         setActivities]         = useState<Activity[]>(seedActivities);
  const [menuMainCategories, setMenuMainCategories] = useState<MenuMainCategoryDef[]>(seedMainCats);
  const [menuSubCategories,  setMenuSubCategories]  = useState<MenuSubCategory[]>(seedSubCats);

  // ── Generic upsert helper ──────────────────────────────────
  function makeUpsert<T extends { id: string }>(
    setter: React.Dispatch<React.SetStateAction<T[]>>
  ) {
    return (item: T) =>
      setter((prev) => {
        const idx = prev.findIndex((x) => x.id === item.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = item;
          return next;
        }
        return [...prev, item];
      });
  }

  function makeDelete<T extends { id: string }>(
    setter: React.Dispatch<React.SetStateAction<T[]>>
  ) {
    return (id: string) =>
      setter((prev) => prev.filter((x) => x.id !== id));
  }

  // ── MenuItem ───────────────────────────────────────────────
  const upsertMenuItem = useCallback(makeUpsert(setMenuItems),  []);
  const deleteMenuItem = useCallback(makeDelete(setMenuItems),  []);

  // ── Activity ───────────────────────────────────────────────
  const upsertActivity = useCallback(makeUpsert(setActivities), []);
  const deleteActivity = useCallback(makeDelete(setActivities), []);

  // ── Main Category ──────────────────────────────────────────
  const upsertMainCategory = useCallback(makeUpsert(setMenuMainCategories), []);
  const deleteMainCategory = useCallback(makeDelete(setMenuMainCategories), []);

  // ── Sub-Category ───────────────────────────────────────────
  const upsertSubCategory = useCallback(makeUpsert(setMenuSubCategories),  []);
  const deleteSubCategory = useCallback(makeDelete(setMenuSubCategories),  []);

  return (
    <MockDataContext.Provider
      value={{
        menuItems,
        activities,
        menuMainCategories,
        menuSubCategories,
        upsertMenuItem,
        deleteMenuItem,
        upsertActivity,
        deleteActivity,
        upsertMainCategory,
        deleteMainCategory,
        upsertSubCategory,
        deleteSubCategory,
      }}
    >
      {children}
    </MockDataContext.Provider>
  );
}
