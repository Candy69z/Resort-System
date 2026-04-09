// ============================================================
// Resort PMS & POS — Database Schema (TypeScript Interfaces)
// ============================================================

// ---------- Enums ----------
export type RoomStatus = "available" | "occupied" | "reserved" | "cleaning";
export type BookingStatus = "confirmed" | "checked_in" | "checked_out" | "cancelled";
export type OrderStatus = "open" | "closed" | "paid";
export type ActivityCategory = "workshop" | "outdoor" | "event";
export type PaymentMethod = "cash" | "credit_card" | "promptpay";
export type UserRole = "admin" | "manager" | "staff";
export type Department =
  | "frontdesk" | "housekeeping" | "fnb"
  | "activities" | "admin" | "general";
export type MembershipTier = "standard" | "silver" | "gold";
export type HousekeepingStatus = "dirty" | "cleaning" | "inspected" | "ready";

// MenuMainCategory is now a free string (category id) to allow dynamic creation.
// Well-known built-in ids: "coffee" | "tea" | "cocktail" | "food" | "special"
export type MenuMainCategory = string;

// ---------- Auth ----------
export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  username: string;
  avatarInitials: string;
}

// ---------- Main Category Definition (dynamic, admin-managed) ----------
export interface MenuMainCategoryDef {
  id: string;             // e.g. "coffee", "food", "event_menu"
  nameEn: string;         // e.g. "Coffee"
  nameTh: string;         // e.g. "กาแฟ"
  color: string;          // Tailwind class string for badge/button styling
  sortOrder: number;      // display order in POS tabs
}

// ---------- Room ----------
export interface Room {
  id: string;
  name: string;           // legacy display name (kept for backward compatibility)
  nameEn: string;         // e.g. "Tree House 1"
  nameTh: string;         // e.g. "บ้านต้นไม้ 1"
  type: "tree_house" | "rice_field" | "tent_house" | "camping";
  subType?: "field_view" | "river_view";
  pricePerNight: number;
  status: RoomStatus;
  amenities: string[];
  description: string;
  maxGuests: number;
}

// ---------- Guest Profile (CRM) ----------
export interface GuestProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  idNumber?: string;
  nationality?: string;
  visitCount: number;
  totalSpend: number;         // THB lifetime spend
  membershipTier: MembershipTier;
  lastVisit?: string;         // ISO date
  firstVisit?: string;        // ISO date
  notes?: string;             // e.g. "Allergic to shrimp", "Prefers river-view"
  preferredRoom?: string;     // room ID
  createdAt: string;
}

// ---------- Payment Info ----------
export interface PaymentInfo {
  method: PaymentMethod;
  refNo?: string;
  slipImageUrl?: string;
  paidAt?: string;
}

// ---------- Booking ----------
export interface Booking {
  id: string;
  roomId: string;
  guest: Pick<GuestProfile, "id" | "name" | "phone" | "email">;
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
  addOns: AddOn[];
  totalAmount: number;
  payment?: PaymentInfo;
  notes?: string;
  createdAt: string;
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

// ---------- F&B Menu ----------
export interface MenuItem {
  id: string;
  name: string;           // legacy / fallback display name
  nameEn: string;         // e.g. "Café Latte"
  nameTh: string;         // e.g. "กาแฟลาเต้"
  category: MenuMainCategory;
  subCategory?: string;   // sub-category id/name
  price: number;
  available: boolean;
  description?: string;
  availableFrom?: string;
  availableTo?: string;
  inventoryItemId?: string;
  imageUrl?: string;           // Supabase Storage public URL for item thumbnail
}

// ---------- F&B Sub-Category ----------
export interface MenuSubCategory {
  id: string;
  name: string;           // legacy / fallback
  nameEn: string;         // e.g. "Hot Coffee"
  nameTh: string;         // e.g. "กาแฟร้อน"
  parentCategory: MenuMainCategory;
}

// ---------- F&B Order ----------
export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;          // e.g. "หวานน้อย / Less Sweet"
}

export interface Order {
  id: string;
  roomId?: string;
  roomName?: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  payment?: PaymentInfo;
  createdAt: string;
  closedAt?: string;
}

// ---------- Activity ----------
export interface Activity {
  id: string;
  name: string;
  category: ActivityCategory;
  price: number;
  description: string;
  maxSlots: number;
  duration: string;
  schedule?: string;
}

export interface ActivityBooking {
  id: string;
  activityId: string;
  activityName: string;
  roomId?: string;
  roomName?: string;
  guestName: string;
  date: string;
  slots: number;
  totalPrice: number;
  notes?: string;
}

// ---------- Inventory ----------
export interface InventoryItem {
  id: string;
  name: string;
  category: "food_supply" | "beverage" | "equipment" | "consumable" | "cleaning_supplies" | "amenities";
  unit: string;
  currentStock: number;
  minThreshold: number;
  costPerUnit: number;
  lastRestocked?: string;
}

// ---------- Withdrawal Log ----------
export interface WithdrawalLog {
  id: string;
  inventoryItemId: string;
  inventoryItemName: string;
  quantity: number;
  unit: string;
  reason: string;
  requestedBy: string;
  timestamp: string;
}

// ---------- Report Row (Excel export) ----------
export interface ReportRow {
  date: string;
  refNo: string;
  guestName: string;
  roomRevenue: number;
  fnbRevenue: number;
  activityRevenue: number;
  totalAmount: number;
  paymentMethod: string;
}

// ---------- Housekeeping ----------
export interface HousekeepingRoom {
  roomId: string;
  roomName: string;
  roomType: Room["type"];
  housekeepingStatus: HousekeepingStatus;
  lastUpdated: string;
  assignedTo?: string;
  notes?: string;
}

export interface RestockItem {
  inventoryItemId: string;
  name: string;
  quantity: number;
  unit: string;
  checked: boolean;
}

export interface RestockLog {
  id: string;
  roomId: string;
  roomName: string;
  items: Omit<RestockItem, "checked">[];
  completedBy: string;
  timestamp: string;
}

// ---------- Top F&B Sales (Reports) ----------
export interface TopSalesItem {
  menuItemId: string;
  name: string;
  category: MenuMainCategory;
  qtySold: number;
  revenue: number;
}

// ---------- Staff Profile ----------
export interface StaffProfile {
  id: string;
  username: string;
  name: string;
  nameTh?: string;
  role: UserRole;
  department: Department;
  avatarInitials: string;
  isActive: boolean;
  phone?: string;
  notes?: string;
  passwordPlain?: string;      // dev-only — use Supabase Auth in production
  createdAt: string;
}

// ---------- Dashboard Stats ----------
export interface DailyStats {
  totalRevenue: number;
  roomRevenue: number;
  fnbRevenue: number;
  activityRevenue: number;
  occupancyRate: number;
  totalRooms: number;
  occupiedRooms: number;
  checkInsToday: number;
  checkOutsToday: number;
}
