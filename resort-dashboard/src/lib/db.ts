/**
 * db.ts — Typed Supabase Query Helpers
 * ─────────────────────────────────────────────────────────────────────
 * All database reads/writes for the Resort Dashboard live here.
 * Each function is self-contained and returns TypeScript interfaces
 * from `types.ts` — no `any` leaking into the rest of the app.
 *
 * Strategy:
 *   1. If Supabase is not configured → return mock data immediately.
 *   2. If the query fails (network error, missing table) → log warning,
 *      return mock data as a safe fallback.
 *   3. If the table returns 0 rows → fall back to mock data so the UI
 *      always has something to render during initial setup.
 *
 * Note: we use `getSupabase()` (lazy getter) instead of the `supabase`
 * singleton to avoid SSR prerender crashes when env vars are absent.
 */

import { getSupabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import type {
  Room,
  MenuItem,
  MenuMainCategoryDef,
  MenuSubCategory,
  HousekeepingRoom,
  HousekeepingStatus,
} from "@/lib/types";

// ── Fallback seeds ─────────────────────────────────────────────────────
import {
  rooms               as fallbackRooms,
  menuItems           as fallbackMenuItems,
  menuMainCategories  as fallbackMainCats,
  menuSubCategories   as fallbackSubCats,
  housekeepingRooms   as fallbackHkRooms,
} from "@/lib/mock-data";

// ─────────────────────────────────────────────────────────────────────
// Row-shape interfaces (snake_case, as returned by Supabase)
// Private to this file — callers always receive our typed interfaces.
// ─────────────────────────────────────────────────────────────────────

interface RoomRow {
  id: string;
  name_en: string;
  name_th: string;
  type: string;
  sub_type: string | null;
  price_per_night: number;
  status: string;
  amenities: string[];
  description: string | null;
  max_guests: number;
  housekeeping_status: string;
  hk_last_updated: string;
  hk_assigned_to: string | null;
  hk_notes: string | null;
}

interface MainCategoryRow {
  id: string;
  name_en: string;
  name_th: string;
  color: string;
  sort_order: number;
}

interface SubCategoryRow {
  id: string;
  name_en: string;
  name_th: string;
  parent_category_id: string;
}

interface MenuItemRow {
  id: string;
  name_en: string;
  name_th: string;
  category_id: string;
  sub_category_id: string | null;
  price: number;
  available: boolean;
  description: string | null;
  available_from: string | null;
  available_to: string | null;
  inventory_item_id: string | null;
}

// ─────────────────────────────────────────────────────────────────────
// Row → TypeScript interface mappers
// ─────────────────────────────────────────────────────────────────────

function rowToRoom(r: RoomRow): Room {
  return {
    id:            r.id,
    name:          r.name_en,            // legacy field kept for compatibility
    nameEn:        r.name_en,
    nameTh:        r.name_th,
    type:          r.type as Room["type"],
    subType:       (r.sub_type ?? undefined) as Room["subType"],
    pricePerNight: Number(r.price_per_night),
    status:        r.status as Room["status"],
    amenities:     r.amenities ?? [],
    description:   r.description ?? "",
    maxGuests:     r.max_guests,
  };
}

function rowToHousekeepingRoom(r: RoomRow): HousekeepingRoom {
  return {
    roomId:             r.id,
    roomName:           r.name_en,
    roomType:           r.type as Room["type"],
    housekeepingStatus: r.housekeeping_status as HousekeepingStatus,
    lastUpdated:        r.hk_last_updated,
    assignedTo:         r.hk_assigned_to ?? undefined,
    notes:              r.hk_notes ?? undefined,
  };
}

function rowToMainCategory(r: MainCategoryRow): MenuMainCategoryDef {
  return {
    id:        r.id,
    nameEn:    r.name_en,
    nameTh:    r.name_th,
    color:     r.color,
    sortOrder: r.sort_order,
  };
}

function rowToSubCategory(r: SubCategoryRow): MenuSubCategory {
  return {
    id:             r.id,
    name:           r.name_en,            // legacy
    nameEn:         r.name_en,
    nameTh:         r.name_th,
    parentCategory: r.parent_category_id,
  };
}

function rowToMenuItem(r: MenuItemRow): MenuItem {
  return {
    id:              r.id,
    name:            r.name_en,          // legacy
    nameEn:          r.name_en,
    nameTh:          r.name_th,
    category:        r.category_id,
    subCategory:     r.sub_category_id ?? undefined,
    price:           Number(r.price),
    available:       r.available,
    description:     r.description ?? undefined,
    availableFrom:   r.available_from ?? undefined,
    availableTo:     r.available_to ?? undefined,
    inventoryItemId: r.inventory_item_id ?? undefined,
  };
}

// ─────────────────────────────────────────────────────────────────────
// READ helpers
// ─────────────────────────────────────────────────────────────────────

/**
 * Fetch all rooms (full Room interface, not just HK view).
 * Used by the POS room-selector dropdown.
 */
export async function fetchRooms(): Promise<Room[]> {
  if (!isSupabaseConfigured) return fallbackRooms;

  const sb = getSupabase();
  if (!sb) return fallbackRooms;

  const { data, error } = await sb
    .from("rooms")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.warn("[db] fetchRooms:", error.message);
    return fallbackRooms;
  }
  if (!data || data.length === 0) return fallbackRooms;
  return (data as unknown as RoomRow[]).map(rowToRoom);
}

/**
 * Fetch all rooms shaped as HousekeepingRoom[] for the /housekeeping page.
 */
export async function fetchHousekeepingRooms(): Promise<HousekeepingRoom[]> {
  if (!isSupabaseConfigured) return fallbackHkRooms;

  const { data, error } = await getSupabase()!
    .from("rooms")
    .select(
      "id, name_en, name_th, type, sub_type, price_per_night, status, " +
      "amenities, description, max_guests, " +
      "housekeeping_status, hk_last_updated, hk_assigned_to, hk_notes"
    )
    .order("id", { ascending: true });

  if (error) {
    console.warn("[db] fetchHousekeepingRooms:", error.message);
    return fallbackHkRooms;
  }
  if (!data || data.length === 0) return fallbackHkRooms;
  return (data as unknown as RoomRow[]).map(rowToHousekeepingRoom);
}

/**
 * Fetch all main categories ordered by sort_order.
 */
export async function fetchMenuMainCategories(): Promise<MenuMainCategoryDef[]> {
  if (!isSupabaseConfigured) return fallbackMainCats;

  const { data, error } = await getSupabase()!
    .from("menu_main_categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.warn("[db] fetchMenuMainCategories:", error.message);
    return fallbackMainCats;
  }
  if (!data || data.length === 0) return fallbackMainCats;
  return (data as unknown as MainCategoryRow[]).map(rowToMainCategory);
}

/**
 * Fetch all menu sub-categories.
 */
export async function fetchMenuSubCategories(): Promise<MenuSubCategory[]> {
  if (!isSupabaseConfigured) return fallbackSubCats;

  const { data, error } = await getSupabase()!
    .from("menu_sub_categories")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.warn("[db] fetchMenuSubCategories:", error.message);
    return fallbackSubCats;
  }
  if (!data || data.length === 0) return fallbackSubCats;
  return (data as unknown as SubCategoryRow[]).map(rowToSubCategory);
}

/**
 * Fetch all menu items (available and unavailable).
 * The POS page applies its own `available` filter client-side.
 */
export async function fetchMenuItems(): Promise<MenuItem[]> {
  if (!isSupabaseConfigured) return fallbackMenuItems;

  const { data, error } = await getSupabase()!
    .from("menu_items")
    .select("*")
    .order("category_id", { ascending: true })
    .order("id",          { ascending: true });

  if (error) {
    console.warn("[db] fetchMenuItems:", error.message);
    return fallbackMenuItems;
  }
  if (!data || data.length === 0) return fallbackMenuItems;
  return (data as unknown as MenuItemRow[]).map(rowToMenuItem);
}

// ─────────────────────────────────────────────────────────────────────
// WRITE helpers
// ─────────────────────────────────────────────────────────────────────

/**
 * Optimistically update the housekeeping status of a single room.
 * Silently no-ops when Supabase is not configured.
 */
export async function updateRoomHkStatus(
  roomId: string,
  newStatus: HousekeepingStatus
): Promise<void> {
  if (!isSupabaseConfigured) return;

  const { error } = await getSupabase()!
    .from("rooms")
    .update({
      housekeeping_status: newStatus,
      hk_last_updated:     new Date().toISOString(),
    })
    .eq("id", roomId);

  if (error) {
    console.warn(`[db] updateRoomHkStatus(${roomId}, ${newStatus}):`, error.message);
  }
}

/**
 * Upsert a main category (insert if new, update if id exists).
 */
export async function upsertMainCategoryToDB(
  cat: MenuMainCategoryDef
): Promise<void> {
  if (!isSupabaseConfigured) return;

  const { error } = await getSupabase()!
    .from("menu_main_categories")
    .upsert({
      id:         cat.id,
      name_en:    cat.nameEn,
      name_th:    cat.nameTh,
      color:      cat.color,
      sort_order: cat.sortOrder,
    });

  if (error) console.warn("[db] upsertMainCategoryToDB:", error.message);
}

/**
 * Delete a main category row by id.
 */
export async function deleteMainCategoryFromDB(id: string): Promise<void> {
  if (!isSupabaseConfigured) return;

  const { error } = await getSupabase()!
    .from("menu_main_categories")
    .delete()
    .eq("id", id);

  if (error) console.warn("[db] deleteMainCategoryFromDB:", error.message);
}

/**
 * Upsert a menu item.
 */
export async function upsertMenuItemToDB(item: MenuItem): Promise<void> {
  if (!isSupabaseConfigured) return;

  const { error } = await getSupabase()!
    .from("menu_items")
    .upsert({
      id:                item.id,
      name_en:           item.nameEn,
      name_th:           item.nameTh,
      category_id:       item.category,
      sub_category_id:   item.subCategory ?? null,
      price:             item.price,
      available:         item.available,
      description:       item.description ?? null,
      available_from:    item.availableFrom ?? null,
      available_to:      item.availableTo ?? null,
      inventory_item_id: item.inventoryItemId ?? null,
    });

  if (error) console.warn("[db] upsertMenuItemToDB:", error.message);
}

/**
 * Delete a menu item by id.
 */
export async function deleteMenuItemFromDB(id: string): Promise<void> {
  if (!isSupabaseConfigured) return;

  const { error } = await getSupabase()!
    .from("menu_items")
    .delete()
    .eq("id", id);

  if (error) console.warn("[db] deleteMenuItemFromDB:", error.message);
}
