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
  Booking,
  BookingStatus,
  PaymentInfo,
  InventoryItem,
  StaffProfile,
  UserRole,
  Department,
} from "@/lib/types";

// ── Fallback seeds ─────────────────────────────────────────────────────
import {
  rooms               as fallbackRooms,
  menuItems           as fallbackMenuItems,
  menuMainCategories  as fallbackMainCats,
  menuSubCategories   as fallbackSubCats,
  housekeepingRooms   as fallbackHkRooms,
  bookings            as fallbackBookings,
  inventoryItems      as fallbackInventory,
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
  image_url: string | null;
}

interface BookingRow {
  id: string;
  room_id: string;
  guest_id: string | null;
  guest_name: string;
  guest_phone: string;
  guest_email: string | null;
  check_in: string;
  check_out: string;
  status: string;
  total_amount: number;
  payment_method: string | null;
  payment_ref: string | null;
  payment_slip_url: string | null;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
}

interface InventoryItemRow {
  id: string;
  name: string;
  category: string;
  unit: string;
  current_stock: number;
  min_threshold: number;
  cost_per_unit: number;
  last_restocked: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface StaffProfileRow {
  id: string;
  auth_user_id: string | null;
  username: string;
  name: string;
  name_th: string | null;
  role: string;
  department: string;
  avatar_initials: string;
  is_active: boolean;
  phone: string | null;
  notes: string | null;
  password_plain: string | null;
  created_at: string;
  updated_at: string;
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
    imageUrl:        r.image_url ?? undefined,
  };
}

function rowToBooking(r: BookingRow): Booking {
  return {
    id:          r.id,
    roomId:      r.room_id,
    guest: {
      id:    r.guest_id ?? `G-${r.id}`,
      name:  r.guest_name,
      phone: r.guest_phone,
      email: r.guest_email ?? undefined,
    },
    checkIn:     r.check_in,
    checkOut:    r.check_out,
    status:      r.status as BookingStatus,
    addOns:      [],
    totalAmount: Number(r.total_amount),
    payment:     r.payment_method
      ? {
          method:       r.payment_method as PaymentInfo["method"],
          refNo:        r.payment_ref        ?? undefined,
          slipImageUrl: r.payment_slip_url   ?? undefined,
          paidAt:       r.paid_at            ?? undefined,
        }
      : undefined,
    notes:       r.notes ?? undefined,
    createdAt:   r.created_at,
  };
}

function rowToInventoryItem(r: InventoryItemRow): InventoryItem {
  return {
    id:            r.id,
    name:          r.name,
    category:      r.category as InventoryItem["category"],
    unit:          r.unit,
    currentStock:  Number(r.current_stock),
    minThreshold:  Number(r.min_threshold),
    costPerUnit:   Number(r.cost_per_unit),
    lastRestocked: r.last_restocked ?? undefined,
  };
}

function rowToStaffProfile(r: StaffProfileRow): StaffProfile {
  return {
    id:             r.id,
    username:       r.username,
    name:           r.name,
    nameTh:         r.name_th ?? undefined,
    role:           r.role as UserRole,
    department:     r.department as Department,
    avatarInitials: r.avatar_initials,
    isActive:       r.is_active,
    phone:          r.phone ?? undefined,
    notes:          r.notes ?? undefined,
    passwordPlain:  r.password_plain ?? undefined,
    createdAt:      r.created_at,
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
      image_url:         item.imageUrl ?? null,
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

/**
 * Update a room's occupancy status (e.g. "cleaning" when guest checks out).
 */
export async function updateRoomStatus(
  roomId: string,
  newStatus: string
): Promise<void> {
  if (!isSupabaseConfigured) return;

  const { error } = await getSupabase()!
    .from("rooms")
    .update({ status: newStatus })
    .eq("id", roomId);

  if (error) {
    console.warn(`[db] updateRoomStatus(${roomId}, ${newStatus}):`, error.message);
  }
}

// ─────────────────────────────────────────────────────────────
// BOOKINGS
// ─────────────────────────────────────────────────────────────

/**
 * Fetch all bookings, ordered by check_in descending.
 */
export async function fetchBookings(): Promise<Booking[]> {
  if (!isSupabaseConfigured) return fallbackBookings;

  const sb = getSupabase();
  if (!sb) return fallbackBookings;

  const { data, error } = await sb
    .from("bookings")
    .select("*")
    .order("check_in", { ascending: false });

  if (error) {
    console.warn("[db] fetchBookings:", error.message);
    return fallbackBookings;
  }
  if (!data || data.length === 0) return fallbackBookings;
  return (data as unknown as BookingRow[]).map(rowToBooking);
}

/**
 * Update booking status and optionally record payment info.
 * The DB trigger `trg_booking_status_sync` automatically syncs room status.
 */
export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
  payment?: PaymentInfo
): Promise<void> {
  if (!isSupabaseConfigured) return;

  const sb = getSupabase();
  if (!sb) return;

  const payload: Record<string, unknown> = { status };

  if (payment) {
    payload.payment_method   = payment.method;
    payload.payment_ref      = payment.refNo      ?? null;
    payload.payment_slip_url = payment.slipImageUrl ?? null;
    payload.paid_at          = payment.paidAt      ?? new Date().toISOString();
  }

  const { error } = await sb
    .from("bookings")
    .update(payload)
    .eq("id", bookingId);

  if (error) {
    console.warn(`[db] updateBookingStatus(${bookingId}, ${status}):`, error.message);
  }
}

// ─────────────────────────────────────────────────────────────
// INVENTORY
// ─────────────────────────────────────────────────────────────

/**
 * Fetch all inventory items ordered by category then name.
 */
export async function fetchInventoryItems(): Promise<InventoryItem[]> {
  if (!isSupabaseConfigured) return fallbackInventory;

  const sb = getSupabase();
  if (!sb) return fallbackInventory;

  const { data, error } = await sb
    .from("inventory_items")
    .select("*")
    .order("category", { ascending: true })
    .order("name",     { ascending: true });

  if (error) {
    console.warn("[db] fetchInventoryItems:", error.message);
    return fallbackInventory;
  }
  if (!data || data.length === 0) return fallbackInventory;
  return (data as unknown as InventoryItemRow[]).map(rowToInventoryItem);
}

/**
 * Upsert (insert or update) a single inventory item.
 */
export async function upsertInventoryItemToDB(item: InventoryItem): Promise<void> {
  if (!isSupabaseConfigured) return;

  const { error } = await getSupabase()!
    .from("inventory_items")
    .upsert({
      id:            item.id,
      name:          item.name,
      category:      item.category,
      unit:          item.unit,
      current_stock: item.currentStock,
      min_threshold: item.minThreshold,
      cost_per_unit: item.costPerUnit,
      last_restocked: item.lastRestocked ?? null,
    });

  if (error) console.warn("[db] upsertInventoryItemToDB:", error.message);
}

/**
 * Delete an inventory item by id.
 */
export async function deleteInventoryItemFromDB(id: string): Promise<void> {
  if (!isSupabaseConfigured) return;

  const { error } = await getSupabase()!
    .from("inventory_items")
    .delete()
    .eq("id", id);

  if (error) console.warn("[db] deleteInventoryItemFromDB:", error.message);
}

// ─────────────────────────────────────────────────────────────
// STAFF PROFILES
// ─────────────────────────────────────────────────────────────

/**
 * Fetch all staff profiles ordered by role then name.
 */
export async function fetchStaffProfiles(): Promise<StaffProfile[]> {
  if (!isSupabaseConfigured) return [];

  const sb = getSupabase();
  if (!sb) return [];

  const { data, error } = await sb
    .from("user_profiles")
    .select("*")
    .order("role",       { ascending: true })
    .order("name",       { ascending: true });

  if (error) {
    console.warn("[db] fetchStaffProfiles:", error.message);
    return [];
  }
  if (!data) return [];
  return (data as unknown as StaffProfileRow[]).map(rowToStaffProfile);
}

/**
 * Upsert a staff profile.
 */
export async function upsertStaffProfileToDB(staff: StaffProfile): Promise<void> {
  if (!isSupabaseConfigured) return;

  const { error } = await getSupabase()!
    .from("user_profiles")
    .upsert({
      id:               staff.id,
      username:         staff.username,
      name:             staff.name,
      name_th:          staff.nameTh         ?? null,
      role:             staff.role,
      department:       staff.department,
      avatar_initials:  staff.avatarInitials,
      is_active:        staff.isActive,
      phone:            staff.phone          ?? null,
      notes:            staff.notes          ?? null,
      password_plain:   staff.passwordPlain  ?? null,
    });

  if (error) console.warn("[db] upsertStaffProfileToDB:", error.message);
}

/**
 * Delete a staff profile by id.
 */
export async function deleteStaffProfileFromDB(id: string): Promise<void> {
  if (!isSupabaseConfigured) return;

  const { error } = await getSupabase()!
    .from("user_profiles")
    .delete()
    .eq("id", id);

  if (error) console.warn("[db] deleteStaffProfileFromDB:", error.message);
}
