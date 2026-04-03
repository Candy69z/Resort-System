// ============================================================
// Resort PMS & POS — Database Schema (TypeScript Interfaces)
// ============================================================

// ---------- Enums ----------
export type RoomStatus = "available" | "occupied" | "reserved" | "cleaning";
export type BookingStatus = "confirmed" | "checked_in" | "checked_out" | "cancelled";
export type OrderStatus = "open" | "closed" | "paid";
export type ActivityCategory = "workshop" | "outdoor" | "event";
export type PaymentMethod = "cash" | "credit_card" | "promptpay";

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

// ---------- Guest ----------
export interface Guest {
  id: string;
  name: string;
  phone: string;
  email?: string;
  idNumber?: string;
}

// ---------- Payment Info ----------
export interface PaymentInfo {
  method: PaymentMethod;
  refNo?: string;          // PromptPay reference number
  slipImageUrl?: string;   // uploaded slip image path
  paidAt?: string;         // ISO datetime
}

// ---------- Booking ----------
export interface Booking {
  id: string;
  roomId: string;
  guest: Guest;
  checkIn: string;   // ISO date
  checkOut: string;   // ISO date
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
  category: "coffee" | "tea" | "cocktail" | "food" | "special";
  price: number;
  available: boolean;
  description?: string;
  availableFrom?: string; // HH:mm
  availableTo?: string;   // HH:mm
  inventoryItemId?: string; // link to InventoryItem for stock deduction
}

// ---------- F&B Order ----------
export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  roomId?: string;       // linked room for "Open Bill"
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
  duration: string;       // e.g. "2 hours"
  schedule?: string;      // e.g. "Fri/Sat alternating"
}

export interface ActivityBooking {
  id: string;
  activityId: string;
  activityName: string;
  roomId?: string;
  roomName?: string;
  guestName: string;
  date: string;           // ISO date
  slots: number;
  totalPrice: number;
  notes?: string;
}

// ---------- Inventory ----------
export interface InventoryItem {
  id: string;
  name: string;
  category: "food_supply" | "beverage" | "equipment" | "consumable";
  unit: string;           // e.g. "sets", "bottles", "units"
  currentStock: number;
  minThreshold: number;   // low-stock alert threshold
  costPerUnit: number;    // purchase cost
  lastRestocked?: string; // ISO date
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
