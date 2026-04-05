// ============================================================
// Resort PMS & POS — Database Schema (TypeScript Interfaces)
// ============================================================

// ---------- Enums ----------
export type RoomStatus = "available" | "occupied" | "reserved" | "cleaning";
export type BookingStatus = "confirmed" | "checked_in" | "checked_out" | "cancelled";
export type OrderStatus = "open" | "closed" | "paid";
export type ActivityCategory = "workshop" | "outdoor" | "event";
export type PaymentMethod = "cash" | "credit_card" | "promptpay";
export type UserRole = "admin" | "staff";
export type MembershipTier = "standard" | "silver" | "gold";
export type HousekeepingStatus = "dirty" | "cleaning" | "inspected" | "ready";
export type MenuMainCategory = "coffee" | "tea" | "cocktail" | "food" | "special";

// ---------- Auth ----------
export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  username: string;
  avatarInitials: string;
}

// ---------- Room ----------
export interface Room {
  id: string;
  name: string;
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
  name: string;
  category: MenuMainCategory;
  subCategory?: string;          // e.g. "snack", "main_course", "mocktail"
  price: number;
  available: boolean;
  description?: string;
  availableFrom?: string;
  availableTo?: string;
  inventoryItemId?: string;
}

// ---------- F&B Sub-Category ----------
export interface MenuSubCategory {
  id: string;
  name: string;
  parentCategory: MenuMainCategory;
}

// ---------- F&B Order ----------
export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;                 // e.g. "หวานน้อย / Less Sweet"
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
  category: "food_supply" | "beverage" | "equipment" | "consumable";
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
  reason: string;           // e.g. "Used in cafe", "Requested by TH-01"
  requestedBy: string;      // staff name / user ID
  timestamp: string;        // ISO datetime
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
  lastUpdated: string;           // ISO datetime
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
