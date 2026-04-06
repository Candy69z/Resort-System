"use client";

/**
 * MockDataContext  →  (Phase 5) Supabase-backed DataContext
 * ─────────────────────────────────────────────────────────────
 * Single source of truth for all mutable data shared across pages
 * (Admin ↔ POS ↔ Activities).
 *
 * Data lifecycle:
 *   1. State is pre-seeded with mock data so the UI renders instantly.
 *   2. On mount, each collection is fetched from Supabase.
 *      If Supabase is not configured (no env vars) or returns 0 rows,
 *      the mock seed is kept — so the app always has something to show.
 *   3. Admin CRUD mutations update local state (optimistic) AND write
 *      through to Supabase for menuItems and mainCategories.
 *
 * To add a new collection: follow the MenuItem pattern.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

// ── Supabase query helpers ─────────────────────────────────────
import {
  fetchMenuItems,
  fetchMenuMainCategories,
  fetchMenuSubCategories,
  upsertMenuItemToDB,
  deleteMenuItemFromDB,
  upsertMainCategoryToDB,
  deleteMainCategoryFromDB,
} from "@/lib/db";

// ── Mock seeds (used as initial state + fallback) ──────────────
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

// ── Context Shape ──────────────────────────────────────────────

interface DataContextType {
  // ── Loading state ──
  /** True while the initial Supabase fetch is in-flight. */
  isLoading: boolean;

  // ── State ──
  menuItems:          MenuItem[];
  activities:         Activity[];
  menuMainCategories: MenuMainCategoryDef[];
  menuSubCategories:  MenuSubCategory[];

  // ── MenuItem CRUD ──
  upsertMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (id: string)     => void;

  // ── Activity CRUD ──
  upsertActivity: (activity: Activity) => void;
  deleteActivity: (id: string)         => void;

  // ── Main Category CRUD ──
  upsertMainCategory: (cat: MenuMainCategoryDef) => void;
  deleteMainCategory: (id: string)               => void;

  // ── Sub-Category CRUD ──
  upsertSubCategory: (sub: MenuSubCategory) => void;
  deleteSubCategory: (id: string)           => void;
}

// ── Context ────────────────────────────────────────────────────

const DataContext = createContext<DataContextType | null>(null);

// ── Hook ───────────────────────────────────────────────────────

export function useMockData(): DataContextType {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error("useMockData must be used inside <MockDataProvider>");
  }
  return ctx;
}

// ── Generic local-state helpers ────────────────────────────────

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

// ── Provider ───────────────────────────────────────────────────

export function MockDataProvider({ children }: { children: ReactNode }) {
  // ── State (pre-seeded with mock data for instant first render) ─
  const [isLoading,          setIsLoading]          = useState(false);
  const [menuItems,          setMenuItems]          = useState<MenuItem[]>(seedMenuItems);
  const [activities,         setActivities]         = useState<Activity[]>(seedActivities);
  const [menuMainCategories, setMenuMainCategories] = useState<MenuMainCategoryDef[]>(seedMainCats);
  const [menuSubCategories,  setMenuSubCategories]  = useState<MenuSubCategory[]>(seedSubCats);

  // ── Supabase hydration on mount ────────────────────────────────
  // Replaces mock seeds with live DB data when available.
  // Falls back silently (db.ts already logs the warning).
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    Promise.all([
      fetchMenuMainCategories(),
      fetchMenuSubCategories(),
      fetchMenuItems(),
    ])
      .then(([cats, subs, items]) => {
        if (cancelled) return;
        setMenuMainCategories(cats);
        setMenuSubCategories(subs);
        setMenuItems(items);
      })
      .catch((err) => {
        // Should not happen — db.ts catches internally — but belt-and-suspenders.
        console.warn("[DataContext] Supabase hydration error:", err);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  // ── MenuItem ───────────────────────────────────────────────────
  // Local update is synchronous (optimistic); DB write is fire-and-forget.
  const _localUpsertMenuItem = useCallback(makeUpsert(setMenuItems), []);
  const _localDeleteMenuItem = useCallback(makeDelete(setMenuItems), []);

  const upsertMenuItem = useCallback(
    (item: MenuItem) => {
      _localUpsertMenuItem(item);
      void upsertMenuItemToDB(item);
    },
    [_localUpsertMenuItem]
  );

  const deleteMenuItem = useCallback(
    (id: string) => {
      _localDeleteMenuItem(id);
      void deleteMenuItemFromDB(id);
    },
    [_localDeleteMenuItem]
  );

  // ── Activity (local-only — no Supabase table yet) ──────────────
  const upsertActivity = useCallback(makeUpsert(setActivities), []);
  const deleteActivity = useCallback(makeDelete(setActivities), []);

  // ── Main Category ──────────────────────────────────────────────
  const _localUpsertMainCat = useCallback(makeUpsert(setMenuMainCategories), []);
  const _localDeleteMainCat = useCallback(makeDelete(setMenuMainCategories), []);

  const upsertMainCategory = useCallback(
    (cat: MenuMainCategoryDef) => {
      _localUpsertMainCat(cat);
      void upsertMainCategoryToDB(cat);
    },
    [_localUpsertMainCat]
  );

  const deleteMainCategory = useCallback(
    (id: string) => {
      _localDeleteMainCat(id);
      void deleteMainCategoryFromDB(id);
    },
    [_localDeleteMainCat]
  );

  // ── Sub-Category (local-only — editing via Admin syncs through mainCat) ─
  const upsertSubCategory = useCallback(makeUpsert(setMenuSubCategories), []);
  const deleteSubCategory = useCallback(makeDelete(setMenuSubCategories), []);

  return (
    <DataContext.Provider
      value={{
        isLoading,
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
    </DataContext.Provider>
  );
}
