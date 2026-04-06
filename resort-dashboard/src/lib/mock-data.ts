import {
  Room,
  Booking,
  MenuItem,
  MenuSubCategory,
  MenuMainCategoryDef,
  Order,
  Activity,
  ActivityBooking,
  DailyStats,
  InventoryItem,
  GuestProfile,
  WithdrawalLog,
  AuthUser,
  HousekeepingRoom,
  RestockItem,
  RestockLog,
  TopSalesItem,
} from "./types";

// ============================================================
// MENU MAIN CATEGORIES (dynamic — admin-managed)
// ============================================================
export const menuMainCategories: MenuMainCategoryDef[] = [
  { id: "coffee",   nameEn: "Coffee",   nameTh: "กาแฟ",         color: "bg-wood-100 text-wood-700 border-wood-200",     sortOrder: 1 },
  { id: "tea",      nameEn: "Tea",      nameTh: "ชา",           color: "bg-sage-100 text-sage-700 border-sage-200",     sortOrder: 2 },
  { id: "cocktail", nameEn: "Cocktail", nameTh: "ค็อกเทล",      color: "bg-purple-50 text-purple-700 border-purple-200", sortOrder: 3 },
  { id: "food",     nameEn: "Food",     nameTh: "อาหาร",        color: "bg-amber-50 text-amber-700 border-amber-200",   sortOrder: 4 },
  { id: "special",  nameEn: "Special",  nameTh: "พิเศษ",        color: "bg-red-50 text-red-700 border-red-200",         sortOrder: 5 },
];

// ============================================================
// AUTH USERS (mock credentials)
// ============================================================
export const mockUsers: (AuthUser & { password: string })[] = [
  { id: "U-001", name: "Admin Manager", username: "admin", password: "admin123", role: "admin", avatarInitials: "AM" },
  { id: "U-002", name: "Staff Nook", username: "staff", password: "staff123", role: "staff", avatarInitials: "SN" },
];

// ============================================================
// ROOMS
// ============================================================
export const rooms: Room[] = [
  { id: "TH-01", name: "Tree House 1", nameEn: "Tree House 1", nameTh: "บ้านต้นไม้ 1", type: "tree_house", pricePerNight: 788, status: "occupied",  amenities: ["Fan", "Water Heater", "Balcony"], description: "Nature view, private balcony", maxGuests: 2 },
  { id: "TH-02", name: "Tree House 2", nameEn: "Tree House 2", nameTh: "บ้านต้นไม้ 2", type: "tree_house", pricePerNight: 788, status: "available", amenities: ["Fan", "Water Heater", "Balcony"], description: "Nature view, private balcony", maxGuests: 2 },
  { id: "TH-03", name: "Tree House 3", nameEn: "Tree House 3", nameTh: "บ้านต้นไม้ 3", type: "tree_house", pricePerNight: 788, status: "reserved",  amenities: ["Fan", "Water Heater", "Balcony"], description: "Nature view, private balcony", maxGuests: 2 },
  { id: "RF-01", name: "Rice Field 1", nameEn: "Rice Field 1", nameTh: "บ้านริมนา 1",  type: "rice_field", pricePerNight: 588, status: "occupied",  amenities: ["Fan", "Water Heater"], description: "Rice field & river view", maxGuests: 2 },
  { id: "RF-02", name: "Rice Field 2", nameEn: "Rice Field 2", nameTh: "บ้านริมนา 2",  type: "rice_field", pricePerNight: 588, status: "occupied",  amenities: ["Fan", "Water Heater"], description: "Rice field & river view", maxGuests: 2 },
  { id: "RF-03", name: "Rice Field 3", nameEn: "Rice Field 3", nameTh: "บ้านริมนา 3",  type: "rice_field", pricePerNight: 588, status: "cleaning",  amenities: ["Fan", "Water Heater"], description: "Rice field & river view", maxGuests: 2 },
  { id: "TE-01", name: "Tent House 1", nameEn: "Tent House 1", nameTh: "บ้านเต้นท์ 1", type: "tent_house", pricePerNight: 888, status: "occupied",  amenities: ["Fan", "Water Heater"], description: "Permanent glamping tent", maxGuests: 2 },
  { id: "TE-02", name: "Tent House 2", nameEn: "Tent House 2", nameTh: "บ้านเต้นท์ 2", type: "tent_house", pricePerNight: 888, status: "available", amenities: ["Fan", "Water Heater"], description: "Permanent glamping tent", maxGuests: 2 },
  { id: "CF-01", name: "Camp Field 1", nameEn: "Camp Field 1", nameTh: "ลานกางเต็นท์ 1", type: "camping", subType: "field_view", pricePerNight: 200, status: "occupied",  amenities: [], description: "Field view camping spot", maxGuests: 2 },
  { id: "CF-02", name: "Camp Field 2", nameEn: "Camp Field 2", nameTh: "ลานกางเต็นท์ 2", type: "camping", subType: "field_view", pricePerNight: 200, status: "available", amenities: [], description: "Field view camping spot", maxGuests: 2 },
  { id: "CF-03", name: "Camp Field 3", nameEn: "Camp Field 3", nameTh: "ลานกางเต็นท์ 3", type: "camping", subType: "field_view", pricePerNight: 200, status: "available", amenities: [], description: "Field view camping spot", maxGuests: 2 },
  { id: "CF-04", name: "Camp Field 4", nameEn: "Camp Field 4", nameTh: "ลานกางเต็นท์ 4", type: "camping", subType: "field_view", pricePerNight: 200, status: "available", amenities: [], description: "Field view camping spot", maxGuests: 2 },
  { id: "CF-05", name: "Camp Field 5", nameEn: "Camp Field 5", nameTh: "ลานกางเต็นท์ 5", type: "camping", subType: "field_view", pricePerNight: 200, status: "reserved",  amenities: [], description: "Field view camping spot", maxGuests: 2 },
  { id: "CR-01", name: "Camp River 1", nameEn: "Camp River 1", nameTh: "ลานริมน้ำ 1", type: "camping", subType: "river_view", pricePerNight: 200, status: "occupied",  amenities: [], description: "River view camping spot", maxGuests: 2 },
  { id: "CR-02", name: "Camp River 2", nameEn: "Camp River 2", nameTh: "ลานริมน้ำ 2", type: "camping", subType: "river_view", pricePerNight: 200, status: "available", amenities: [], description: "River view camping spot", maxGuests: 2 },
  { id: "CR-03", name: "Camp River 3", nameEn: "Camp River 3", nameTh: "ลานริมน้ำ 3", type: "camping", subType: "river_view", pricePerNight: 200, status: "available", amenities: [], description: "River view camping spot", maxGuests: 2 },
  { id: "CR-04", name: "Camp River 4", nameEn: "Camp River 4", nameTh: "ลานริมน้ำ 4", type: "camping", subType: "river_view", pricePerNight: 200, status: "available", amenities: [], description: "River view camping spot", maxGuests: 2 },
  { id: "CR-05", name: "Camp River 5", nameEn: "Camp River 5", nameTh: "ลานริมน้ำ 5", type: "camping", subType: "river_view", pricePerNight: 200, status: "available", amenities: [], description: "River view camping spot", maxGuests: 2 },
];

// ============================================================
// GUEST PROFILES (CRM)
// ============================================================
export const guestProfiles: GuestProfile[] = [
  {
    id: "G-001", name: "Somchai Kaewkla", phone: "081-234-5678",
    nationality: "Thai", visitCount: 7, totalSpend: 14_200,
    membershipTier: "gold", lastVisit: "2026-04-03", firstVisit: "2024-11-15",
    notes: "Prefers Tree House. Brings own coffee. Likes quiet corner.", preferredRoom: "TH-01",
    createdAt: "2024-11-15T09:00:00Z",
  },
  {
    id: "G-002", name: "Anna Schmidt", phone: "089-876-5432", email: "anna@email.com",
    nationality: "German", visitCount: 3, totalSpend: 6_800,
    membershipTier: "silver", lastVisit: "2026-04-02", firstVisit: "2025-06-20",
    notes: "Vegetarian. Allergic to shellfish. Usually stays 2-3 nights.",
    createdAt: "2025-06-20T14:00:00Z",
  },
  {
    id: "G-003", name: "Tanaka Yuki", phone: "092-111-2222",
    nationality: "Japanese", visitCount: 2, totalSpend: 3_900,
    membershipTier: "silver", lastVisit: "2026-04-03", firstVisit: "2025-12-28",
    notes: "Enjoys Terrarium Workshop. Books kayak trip every visit.",
    createdAt: "2025-12-28T10:00:00Z",
  },
  {
    id: "G-004", name: "Lisa Manobal", phone: "095-333-4444",
    nationality: "Thai", visitCount: 1, totalSpend: 1_876,
    membershipTier: "standard", lastVisit: "2026-04-01", firstVisit: "2026-04-01",
    notes: "Late check-out requested.",
    createdAt: "2026-04-01T16:00:00Z",
  },
  {
    id: "G-005", name: "Mike Johnson", phone: "088-555-6666",
    nationality: "American", visitCount: 1, totalSpend: 400,
    membershipTier: "standard", lastVisit: "2026-04-03", firstVisit: "2026-04-03",
    createdAt: "2026-04-03T18:00:00Z",
  },
  {
    id: "G-006", name: "Ploy Chaiwan", phone: "086-777-8888",
    nationality: "Thai", visitCount: 5, totalSpend: 9_450,
    membershipTier: "gold", lastVisit: "2026-04-02", firstVisit: "2025-01-10",
    notes: "Loves Moo Jum set. Usually brings 1-2 friends. Prefers river-view.",
    preferredRoom: "CR-01",
    createdAt: "2025-01-10T11:00:00Z",
  },
  {
    id: "G-007", name: "David Park", phone: "091-999-0000",
    nationality: "Korean", visitCount: 2, totalSpend: 3_552,
    membershipTier: "silver", lastVisit: "2026-04-06", firstVisit: "2025-09-05",
    notes: "Works remotely. Stays longer on weekdays.",
    createdAt: "2025-09-05T08:00:00Z",
  },
  {
    id: "G-008", name: "Sarah Lee", phone: "083-111-0000",
    nationality: "Thai", visitCount: 1, totalSpend: 200,
    membershipTier: "standard", lastVisit: "2026-04-05", firstVisit: "2026-04-04",
    createdAt: "2026-04-04T07:00:00Z",
  },
  {
    id: "G-009", name: "Wanchai Boonrod", phone: "084-222-3333",
    nationality: "Thai", visitCount: 12, totalSpend: 28_600,
    membershipTier: "gold", lastVisit: "2026-03-28", firstVisit: "2023-08-01",
    notes: "VIP regular. Birthday in July. Prefers TH-02 or TH-03. No spicy food.",
    preferredRoom: "TH-02",
    createdAt: "2023-08-01T09:00:00Z",
  },
  {
    id: "G-010", name: "Priya Sharma", phone: "090-444-5555", email: "priya@gmail.com",
    nationality: "Indian", visitCount: 2, totalSpend: 4_100,
    membershipTier: "silver", lastVisit: "2026-02-14", firstVisit: "2025-11-20",
    notes: "Vegetarian strictly. Loves Canvas Painting activity.",
    createdAt: "2025-11-20T12:00:00Z",
  },
];

// ============================================================
// BOOKINGS
// ============================================================
export const bookings: Booking[] = [
  {
    id: "BK-001", roomId: "TH-01",
    guest: { id: "G-001", name: "Somchai Kaewkla", phone: "081-234-5678" },
    checkIn: "2026-04-03", checkOut: "2026-04-05", status: "checked_in",
    addOns: [{ id: "AO-1", name: "Breakfast", price: 100, quantity: 2 }],
    totalAmount: 1776, createdAt: "2026-04-01T10:00:00Z",
  },
  {
    id: "BK-002", roomId: "RF-01",
    guest: { id: "G-002", name: "Anna Schmidt", phone: "089-876-5432", email: "anna@email.com" },
    checkIn: "2026-04-02", checkOut: "2026-04-04", status: "checked_in",
    addOns: [
      { id: "AO-2", name: "Breakfast", price: 100, quantity: 2 },
      { id: "AO-3", name: "Moo Kratha Evening", price: 350, quantity: 2 },
    ],
    totalAmount: 2076, createdAt: "2026-03-28T14:00:00Z",
  },
  {
    id: "BK-003", roomId: "RF-02",
    guest: { id: "G-003", name: "Tanaka Yuki", phone: "092-111-2222" },
    checkIn: "2026-04-03", checkOut: "2026-04-06", status: "checked_in",
    addOns: [], totalAmount: 1764, createdAt: "2026-04-01T09:00:00Z",
  },
  {
    id: "BK-004", roomId: "TE-01",
    guest: { id: "G-004", name: "Lisa Manobal", phone: "095-333-4444" },
    checkIn: "2026-04-01", checkOut: "2026-04-03", status: "checked_in",
    addOns: [{ id: "AO-4", name: "Breakfast", price: 100, quantity: 1 }],
    totalAmount: 1876, notes: "Late check-out requested", createdAt: "2026-03-25T16:00:00Z",
  },
  {
    id: "BK-005", roomId: "CF-01",
    guest: { id: "G-005", name: "Mike Johnson", phone: "088-555-6666" },
    checkIn: "2026-04-03", checkOut: "2026-04-05", status: "checked_in",
    addOns: [], totalAmount: 400, createdAt: "2026-04-02T18:00:00Z",
  },
  {
    id: "BK-006", roomId: "CR-01",
    guest: { id: "G-006", name: "Ploy Chaiwan", phone: "086-777-8888" },
    checkIn: "2026-04-02", checkOut: "2026-04-04", status: "checked_in",
    addOns: [{ id: "AO-5", name: "Moo Jum Evening", price: 300, quantity: 2 }],
    totalAmount: 1000, createdAt: "2026-04-01T11:00:00Z",
  },
  {
    id: "BK-007", roomId: "TH-03",
    guest: { id: "G-007", name: "David Park", phone: "091-999-0000" },
    checkIn: "2026-04-04", checkOut: "2026-04-06", status: "confirmed",
    addOns: [{ id: "AO-6", name: "Breakfast", price: 100, quantity: 2 }],
    totalAmount: 1776, createdAt: "2026-04-02T08:00:00Z",
  },
  {
    id: "BK-008", roomId: "CF-05",
    guest: { id: "G-008", name: "Sarah Lee", phone: "083-111-0000" },
    checkIn: "2026-04-04", checkOut: "2026-04-05", status: "confirmed",
    addOns: [], totalAmount: 200, createdAt: "2026-04-03T07:00:00Z",
  },
];

// ============================================================
// F&B MENU
// ============================================================
export const menuItems: MenuItem[] = [
  // Coffee
  { id: "M-01", name: "Espresso",           nameEn: "Espresso",           nameTh: "เอสเปรสโซ่",       category: "coffee",   subCategory: "Hot Coffee",  price: 60,  available: true },
  { id: "M-02", name: "Americano",          nameEn: "Americano",          nameTh: "อเมริกาโน่",        category: "coffee",   subCategory: "Hot Coffee",  price: 65,  available: true },
  { id: "M-03", name: "Café Latte",         nameEn: "Café Latte",         nameTh: "กาแฟลาเต้",         category: "coffee",   subCategory: "Hot Coffee",  price: 75,  available: true },
  { id: "M-04", name: "Cappuccino",         nameEn: "Cappuccino",         nameTh: "คาปูชิโน่",         category: "coffee",   subCategory: "Hot Coffee",  price: 75,  available: true },
  { id: "M-05", name: "Iced Mocha",         nameEn: "Iced Mocha",         nameTh: "ไอซ์โมค่า",         category: "coffee",   subCategory: "Iced Coffee", price: 85,  available: true },
  // Tea
  { id: "M-06", name: "Thai Milk Tea",      nameEn: "Thai Milk Tea",      nameTh: "ชานมไทย",           category: "tea",      subCategory: "Milk Tea",    price: 55,  available: true },
  { id: "M-07", name: "Jasmine Green Tea",  nameEn: "Jasmine Green Tea",  nameTh: "ชาเขียวมะลิ",       category: "tea",      subCategory: "Herbal Tea",  price: 50,  available: true },
  { id: "M-08", name: "Butterfly Pea Latte",nameEn: "Butterfly Pea Latte",nameTh: "ลาเต้ดอกอัญชัน",    category: "tea",      subCategory: "Milk Tea",    price: 70,  available: true },
  // Cocktails
  { id: "M-09", name: "Mojito",             nameEn: "Mojito",             nameTh: "โมฮิโต้",           category: "cocktail", subCategory: "Classic",     price: 220, available: true, availableFrom: "17:00", availableTo: "22:00", inventoryItemId: "INV-06" },
  { id: "M-10", name: "Margarita",          nameEn: "Margarita",          nameTh: "มาร์การิต้า",       category: "cocktail", subCategory: "Classic",     price: 240, available: true, availableFrom: "17:00", availableTo: "22:00", inventoryItemId: "INV-07" },
  { id: "M-11", name: "Negroni",            nameEn: "Negroni",            nameTh: "เนโกรนี",           category: "cocktail", subCategory: "Classic",     price: 250, available: true, availableFrom: "17:00", availableTo: "22:00", inventoryItemId: "INV-08" },
  { id: "M-12", name: "Old Fashioned",      nameEn: "Old Fashioned",      nameTh: "โอลด์แฟชั่น",       category: "cocktail", subCategory: "Classic",     price: 260, available: true, availableFrom: "17:00", availableTo: "22:00", inventoryItemId: "INV-09" },
  { id: "M-13", name: "Jungle Sunset",      nameEn: "Jungle Sunset",      nameTh: "จังเกิ้ลซันเซ็ต",   category: "cocktail", subCategory: "Signature",   price: 280, available: true, description: "Signature", availableFrom: "17:00", availableTo: "22:00", inventoryItemId: "INV-06" },
  // Food
  { id: "M-14", name: "Khao Soi Gai",      nameEn: "Khao Soi Gai",      nameTh: "ข้าวซอยไก่",        category: "food",     subCategory: "Main Course", price: 120, available: true, description: "Northern curry noodle soup" },
  { id: "M-15", name: "Pad Thai",           nameEn: "Pad Thai",           nameTh: "ผัดไทย",            category: "food",     subCategory: "Main Course", price: 100, available: true },
  { id: "M-16", name: "Som Tam",            nameEn: "Som Tam",            nameTh: "ส้มตำ",              category: "food",     subCategory: "Snack",       price: 80,  available: true, description: "Papaya salad" },
  { id: "M-17", name: "Nam Prik Ong",       nameEn: "Nam Prik Ong",       nameTh: "น้ำพริกอ่อง",       category: "food",     subCategory: "Snack",       price: 90,  available: true, description: "Northern chili dip set" },
  { id: "M-18", name: "Gaeng Hang Lay",     nameEn: "Gaeng Hang Lay",     nameTh: "แกงฮังเล",          category: "food",     subCategory: "Main Course", price: 130, available: true, description: "Northern pork curry" },
  { id: "M-19", name: "Lab Moo",            nameEn: "Lab Moo",            nameTh: "ลาบหมู",             category: "food",     subCategory: "Snack",       price: 95,  available: true, description: "Spicy minced pork salad" },
  { id: "M-20", name: "Jungle Curry",       nameEn: "Jungle Curry",       nameTh: "แกงป่า",             category: "food",     subCategory: "Main Course", price: 140, available: true, description: "Spicy herbal curry" },
  { id: "M-21", name: "Grilled River Fish", nameEn: "Grilled River Fish", nameTh: "ปลาย่าง",           category: "food",     subCategory: "Main Course", price: 180, available: true },
  { id: "M-22", name: "Sticky Rice",        nameEn: "Sticky Rice",        nameTh: "ข้าวเหนียว",         category: "food",     subCategory: "Sides",       price: 20,  available: true },
  { id: "M-23", name: "Steamed Rice",       nameEn: "Steamed Rice",       nameTh: "ข้าวสวย",            category: "food",     subCategory: "Sides",       price: 20,  available: true },
  // Special
  { id: "M-24", name: "Moo Kratha Set (2 pax)", nameEn: "Moo Kratha Set (2 pax)", nameTh: "เซตหมูกระทะ (2 ท่าน)", category: "special", subCategory: "BBQ Set",     price: 350, available: true, description: "Thai BBQ grill set", availableFrom: "17:00", availableTo: "21:00", inventoryItemId: "INV-01" },
  { id: "M-25", name: "Moo Jum Set (2 pax)",   nameEn: "Moo Jum Set (2 pax)",   nameTh: "เซตหมูจุ่ม (2 ท่าน)",   category: "special", subCategory: "Hot Pot Set", price: 300, available: true, description: "Thai hot pot set",   availableFrom: "17:00", availableTo: "21:00", inventoryItemId: "INV-02" },
];

// ============================================================
// ORDERS
// ============================================================
export const orders: Order[] = [
  {
    id: "ORD-001", roomId: "TH-01", roomName: "Tree House 1",
    items: [
      { menuItemId: "M-03", name: "Café Latte", price: 75, quantity: 2 },
      { menuItemId: "M-16", name: "Som Tam", price: 80, quantity: 1 },
    ],
    status: "open", total: 230, createdAt: "2026-04-03T08:30:00Z",
  },
  {
    id: "ORD-002", roomId: "RF-01", roomName: "Rice Field 1",
    items: [
      { menuItemId: "M-02", name: "Americano", price: 65, quantity: 1 },
      { menuItemId: "M-14", name: "Khao Soi Gai", price: 120, quantity: 2 },
      { menuItemId: "M-22", name: "Sticky Rice", price: 20, quantity: 2 },
    ],
    status: "open", total: 345, createdAt: "2026-04-03T09:15:00Z",
  },
  {
    id: "ORD-003", roomId: "TE-01", roomName: "Tent House 1",
    items: [{ menuItemId: "M-05", name: "Iced Mocha", price: 85, quantity: 1 }],
    status: "open", total: 85, createdAt: "2026-04-03T10:00:00Z",
  },
  {
    id: "ORD-004",
    items: [
      { menuItemId: "M-01", name: "Espresso", price: 60, quantity: 1 },
      { menuItemId: "M-15", name: "Pad Thai", price: 100, quantity: 1 },
    ],
    status: "closed", total: 160,
    payment: { method: "promptpay", refNo: "20260403-0800-PP", paidAt: "2026-04-03T08:00:00Z" },
    createdAt: "2026-04-03T07:45:00Z", closedAt: "2026-04-03T08:00:00Z",
  },
  {
    id: "ORD-005",
    items: [{ menuItemId: "M-04", name: "Cappuccino", price: 75, quantity: 2 }],
    status: "paid", total: 150,
    payment: { method: "cash", paidAt: "2026-04-03T09:30:00Z" },
    createdAt: "2026-04-03T09:20:00Z", closedAt: "2026-04-03T09:30:00Z",
  },
  {
    id: "ORD-006",
    items: [
      { menuItemId: "M-09", name: "Mojito", price: 220, quantity: 2 },
      { menuItemId: "M-11", name: "Negroni", price: 250, quantity: 1 },
    ],
    status: "paid", total: 690,
    payment: { method: "promptpay", refNo: "20260402-1830-PP", paidAt: "2026-04-02T18:30:00Z" },
    createdAt: "2026-04-02T18:00:00Z", closedAt: "2026-04-02T18:30:00Z",
  },
  {
    id: "ORD-007",
    items: [
      { menuItemId: "M-24", name: "Moo Kratha Set (2 pax)", price: 350, quantity: 1 },
      { menuItemId: "M-06", name: "Thai Milk Tea", price: 55, quantity: 2 },
    ],
    status: "paid", total: 460,
    payment: { method: "credit_card", paidAt: "2026-04-02T19:00:00Z" },
    createdAt: "2026-04-02T17:30:00Z", closedAt: "2026-04-02T19:00:00Z",
  },
];

// ============================================================
// ACTIVITIES
// ============================================================
export const activities: Activity[] = [
  { id: "ACT-01", name: "Terrarium Workshop", category: "workshop", price: 350, description: "Create your own mini garden in a glass jar. Various jar sizes and plants available.", maxSlots: 8, duration: "1.5 hours" },
  { id: "ACT-02", name: "Canvas Painting", category: "workshop", price: 250, description: "Paint the Lampang landscape on canvas with local artist guidance.", maxSlots: 10, duration: "2 hours" },
  { id: "ACT-03", name: "Kayak Trip", category: "outdoor", price: 450, description: "Guided kayak trip along the river. Life jacket & equipment included.", maxSlots: 6, duration: "3 hours" },
  { id: "ACT-04", name: "Rock Climbing", category: "outdoor", price: 500, description: "Beginner-friendly rock climbing trip with experienced guide.", maxSlots: 4, duration: "4 hours" },
  { id: "ACT-05", name: "Live DJ Night", category: "event", price: 0, description: "Friday/Saturday alternating weeks. Chill beats under the stars.", maxSlots: 50, duration: "4 hours", schedule: "Fri/Sat alternating" },
];

export const activityBookings: ActivityBooking[] = [
  { id: "AB-001", activityId: "ACT-01", activityName: "Terrarium Workshop", roomId: "TH-01", roomName: "Tree House 1", guestName: "Somchai Kaewkla", date: "2026-04-03", slots: 2, totalPrice: 700 },
  { id: "AB-002", activityId: "ACT-03", activityName: "Kayak Trip", roomId: "RF-01", roomName: "Rice Field 1", guestName: "Anna Schmidt", date: "2026-04-04", slots: 2, totalPrice: 900 },
  { id: "AB-003", activityId: "ACT-02", activityName: "Canvas Painting", roomId: "RF-02", roomName: "Rice Field 2", guestName: "Tanaka Yuki", date: "2026-04-03", slots: 1, totalPrice: 250 },
  { id: "AB-004", activityId: "ACT-05", activityName: "Live DJ Night", guestName: "Walk-in", date: "2026-04-04", slots: 1, totalPrice: 0 },
];

// ============================================================
// INVENTORY
// ============================================================
export const inventoryItems: InventoryItem[] = [
  { id: "INV-01", name: "Moo Kratha Set", category: "food_supply", unit: "sets", currentStock: 4, minThreshold: 5, costPerUnit: 150, lastRestocked: "2026-04-01" },
  { id: "INV-02", name: "Moo Jum Set", category: "food_supply", unit: "sets", currentStock: 6, minThreshold: 5, costPerUnit: 120, lastRestocked: "2026-04-01" },
  { id: "INV-03", name: "Coffee Beans (1kg)", category: "beverage", unit: "bags", currentStock: 8, minThreshold: 3, costPerUnit: 450, lastRestocked: "2026-03-30" },
  { id: "INV-04", name: "Milk (1L)", category: "beverage", unit: "cartons", currentStock: 12, minThreshold: 5, costPerUnit: 65, lastRestocked: "2026-04-02" },
  { id: "INV-05", name: "Tea Leaves Assorted", category: "beverage", unit: "boxes", currentStock: 10, minThreshold: 4, costPerUnit: 180, lastRestocked: "2026-03-28" },
  { id: "INV-06", name: "White Rum (750ml)", category: "beverage", unit: "bottles", currentStock: 3, minThreshold: 3, costPerUnit: 520, lastRestocked: "2026-03-25" },
  { id: "INV-07", name: "Tequila (750ml)", category: "beverage", unit: "bottles", currentStock: 2, minThreshold: 2, costPerUnit: 680, lastRestocked: "2026-03-25" },
  { id: "INV-08", name: "Campari (750ml)", category: "beverage", unit: "bottles", currentStock: 1, minThreshold: 2, costPerUnit: 750, lastRestocked: "2026-03-20" },
  { id: "INV-09", name: "Bourbon (750ml)", category: "beverage", unit: "bottles", currentStock: 2, minThreshold: 2, costPerUnit: 890, lastRestocked: "2026-03-25" },
  { id: "INV-10", name: "Gin (750ml)", category: "beverage", unit: "bottles", currentStock: 4, minThreshold: 2, costPerUnit: 580, lastRestocked: "2026-03-28" },
  { id: "INV-11", name: "Kayak", category: "equipment", unit: "units", currentStock: 6, minThreshold: 3, costPerUnit: 8500, lastRestocked: "2026-01-15" },
  { id: "INV-12", name: "Life Jacket", category: "equipment", unit: "units", currentStock: 10, minThreshold: 4, costPerUnit: 1200, lastRestocked: "2026-01-15" },
  { id: "INV-13", name: "Climbing Harness", category: "equipment", unit: "units", currentStock: 4, minThreshold: 2, costPerUnit: 3200, lastRestocked: "2026-02-10" },
  { id: "INV-14", name: "Terrarium Jar (Small)", category: "consumable", unit: "pcs", currentStock: 15, minThreshold: 8, costPerUnit: 85, lastRestocked: "2026-03-28" },
  { id: "INV-15", name: "Terrarium Jar (Large)", category: "consumable", unit: "pcs", currentStock: 7, minThreshold: 5, costPerUnit: 150, lastRestocked: "2026-03-28" },
  { id: "INV-16", name: "Canvas & Paint Kit", category: "consumable", unit: "kits", currentStock: 12, minThreshold: 5, costPerUnit: 120, lastRestocked: "2026-03-30" },
  { id: "INV-17", name: "Charcoal (5kg)", category: "food_supply", unit: "bags", currentStock: 3, minThreshold: 5, costPerUnit: 75, lastRestocked: "2026-04-01" },
  { id: "INV-18", name: "Sticky Rice (5kg)", category: "food_supply", unit: "bags", currentStock: 5, minThreshold: 3, costPerUnit: 95, lastRestocked: "2026-04-02" },
];

// ============================================================
// WITHDRAWAL LOGS
// ============================================================
export const withdrawalLogs: WithdrawalLog[] = [
  { id: "WD-001", inventoryItemId: "INV-01", inventoryItemName: "Moo Kratha Set", quantity: 2, unit: "sets", reason: "Evening BBQ — TH-01 & RF-01", requestedBy: "Staff Nook", timestamp: "2026-04-02T17:00:00Z" },
  { id: "WD-002", inventoryItemId: "INV-06", inventoryItemName: "White Rum (750ml)", quantity: 1, unit: "bottles", reason: "Used in cafe bar service", requestedBy: "Staff Nook", timestamp: "2026-04-02T18:00:00Z" },
  { id: "WD-003", inventoryItemId: "INV-03", inventoryItemName: "Coffee Beans (1kg)", quantity: 1, unit: "bags", reason: "Daily cafe opening", requestedBy: "Staff Nook", timestamp: "2026-04-03T07:00:00Z" },
];

// ============================================================
// HOUSEKEEPING
// ============================================================
export const housekeepingRooms: HousekeepingRoom[] = [
  { roomId: "TH-01", roomName: "Tree House 1",  roomType: "tree_house", housekeepingStatus: "dirty",     lastUpdated: "2026-04-03T10:00:00Z", assignedTo: "Noi" },
  { roomId: "TH-02", roomName: "Tree House 2",  roomType: "tree_house", housekeepingStatus: "ready",     lastUpdated: "2026-04-03T09:30:00Z", assignedTo: "Noi" },
  { roomId: "TH-03", roomName: "Tree House 3",  roomType: "tree_house", housekeepingStatus: "cleaning",  lastUpdated: "2026-04-03T10:15:00Z", assignedTo: "Malee" },
  { roomId: "RF-01", roomName: "Rice Field 1",  roomType: "rice_field", housekeepingStatus: "dirty",     lastUpdated: "2026-04-03T09:00:00Z" },
  { roomId: "RF-02", roomName: "Rice Field 2",  roomType: "rice_field", housekeepingStatus: "inspected", lastUpdated: "2026-04-03T09:45:00Z", assignedTo: "Malee" },
  { roomId: "RF-03", roomName: "Rice Field 3",  roomType: "rice_field", housekeepingStatus: "ready",     lastUpdated: "2026-04-03T08:00:00Z" },
  { roomId: "TE-01", roomName: "Tent House 1",  roomType: "tent_house", housekeepingStatus: "cleaning",  lastUpdated: "2026-04-03T10:30:00Z", assignedTo: "Noi" },
  { roomId: "TE-02", roomName: "Tent House 2",  roomType: "tent_house", housekeepingStatus: "ready",     lastUpdated: "2026-04-03T08:30:00Z" },
  { roomId: "CF-01", roomName: "Camp Field 1",  roomType: "camping",    housekeepingStatus: "dirty",     lastUpdated: "2026-04-03T09:00:00Z" },
  { roomId: "CF-02", roomName: "Camp Field 2",  roomType: "camping",    housekeepingStatus: "ready",     lastUpdated: "2026-04-03T07:30:00Z" },
  { roomId: "CF-03", roomName: "Camp Field 3",  roomType: "camping",    housekeepingStatus: "ready",     lastUpdated: "2026-04-03T07:30:00Z" },
  { roomId: "CF-04", roomName: "Camp Field 4",  roomType: "camping",    housekeepingStatus: "inspected", lastUpdated: "2026-04-03T09:50:00Z", assignedTo: "Malee" },
  { roomId: "CF-05", roomName: "Camp Field 5",  roomType: "camping",    housekeepingStatus: "dirty",     lastUpdated: "2026-04-03T09:00:00Z" },
  { roomId: "CR-01", roomName: "Camp River 1",  roomType: "camping",    housekeepingStatus: "cleaning",  lastUpdated: "2026-04-03T10:20:00Z", assignedTo: "Noi" },
  { roomId: "CR-02", roomName: "Camp River 2",  roomType: "camping",    housekeepingStatus: "ready",     lastUpdated: "2026-04-03T08:00:00Z" },
  { roomId: "CR-03", roomName: "Camp River 3",  roomType: "camping",    housekeepingStatus: "ready",     lastUpdated: "2026-04-03T08:00:00Z" },
  { roomId: "CR-04", roomName: "Camp River 4",  roomType: "camping",    housekeepingStatus: "ready",     lastUpdated: "2026-04-03T08:00:00Z" },
  { roomId: "CR-05", roomName: "Camp River 5",  roomType: "camping",    housekeepingStatus: "ready",     lastUpdated: "2026-04-03T08:00:00Z" },
];

// Default restock checklist items — links to INV consumables.
// Add 4 housekeeping-specific inventory items (appended to main inventory on the page).
export const hkInventoryAddons: InventoryItem[] = [
  { id: "INV-19", name: "Water Bottle (600ml)", category: "consumable", unit: "bottles", currentStock: 80, minThreshold: 20, costPerUnit: 8,  lastRestocked: "2026-04-03" },
  { id: "INV-20", name: "Soap Bar",             category: "consumable", unit: "bars",    currentStock: 60, minThreshold: 15, costPerUnit: 15, lastRestocked: "2026-04-03" },
  { id: "INV-21", name: "Shampoo Sachet",       category: "consumable", unit: "sachets", currentStock: 55, minThreshold: 15, costPerUnit: 10, lastRestocked: "2026-04-03" },
  { id: "INV-22", name: "Toilet Paper Roll",    category: "consumable", unit: "rolls",   currentStock: 100, minThreshold: 30, costPerUnit: 12, lastRestocked: "2026-04-03" },
  { id: "INV-23", name: "Hand Towel",           category: "consumable", unit: "pcs",     currentStock: 40, minThreshold: 10, costPerUnit: 45, lastRestocked: "2026-04-02" },
];

export const defaultRestockChecklist: Omit<RestockItem, "checked">[] = [
  { inventoryItemId: "INV-19", name: "Water Bottle (600ml)", quantity: 2, unit: "bottles" },
  { inventoryItemId: "INV-20", name: "Soap Bar",             quantity: 1, unit: "bars" },
  { inventoryItemId: "INV-21", name: "Shampoo Sachet",       quantity: 1, unit: "sachets" },
  { inventoryItemId: "INV-22", name: "Toilet Paper Roll",    quantity: 2, unit: "rolls" },
  { inventoryItemId: "INV-23", name: "Hand Towel",           quantity: 2, unit: "pcs" },
];

export const restockLogs: RestockLog[] = [
  {
    id: "RS-001", roomId: "TH-02", roomName: "Tree House 2",
    items: [
      { inventoryItemId: "INV-19", name: "Water Bottle (600ml)", quantity: 2, unit: "bottles" },
      { inventoryItemId: "INV-20", name: "Soap Bar", quantity: 1, unit: "bars" },
    ],
    completedBy: "Noi", timestamp: "2026-04-03T09:30:00Z",
  },
];

// ============================================================
// MENU SUB-CATEGORIES
// ============================================================
export const menuSubCategories: MenuSubCategory[] = [
  { id: "SC-01", name: "Hot Coffee",  nameEn: "Hot Coffee",  nameTh: "กาแฟร้อน",       parentCategory: "coffee"   },
  { id: "SC-02", name: "Iced Coffee", nameEn: "Iced Coffee", nameTh: "กาแฟเย็น",       parentCategory: "coffee"   },
  { id: "SC-03", name: "Herbal Tea",  nameEn: "Herbal Tea",  nameTh: "ชาสมุนไพร",      parentCategory: "tea"      },
  { id: "SC-04", name: "Milk Tea",    nameEn: "Milk Tea",    nameTh: "ชานม",            parentCategory: "tea"      },
  { id: "SC-05", name: "Mocktail",    nameEn: "Mocktail",    nameTh: "น้ำผสม",          parentCategory: "cocktail" },
  { id: "SC-06", name: "Classic",     nameEn: "Classic",     nameTh: "คลาสสิก",         parentCategory: "cocktail" },
  { id: "SC-07", name: "Signature",   nameEn: "Signature",   nameTh: "ซิกเนเจอร์",      parentCategory: "cocktail" },
  { id: "SC-08", name: "Main Course", nameEn: "Main Course", nameTh: "อาหารจานหลัก",   parentCategory: "food"     },
  { id: "SC-09", name: "Snack",       nameEn: "Snack",       nameTh: "ของทานเล่น",     parentCategory: "food"     },
  { id: "SC-10", name: "Sides",       nameEn: "Sides",       nameTh: "เครื่องเคียง",    parentCategory: "food"     },
  { id: "SC-11", name: "BBQ Set",     nameEn: "BBQ Set",     nameTh: "เซตบาร์บีคิว",   parentCategory: "special"  },
  { id: "SC-12", name: "Hot Pot Set", nameEn: "Hot Pot Set", nameTh: "เซตสุกี้",        parentCategory: "special"  },
];

// ============================================================
// TOP F&B SALES (for Reports page)
// ============================================================
export const topFnbSales: TopSalesItem[] = [
  { menuItemId: "M-03", name: "Café Latte",           category: "coffee",   qtySold: 145, revenue: 10_875 },
  { menuItemId: "M-14", name: "Khao Soi Gai",         category: "food",     qtySold: 112, revenue: 13_440 },
  { menuItemId: "M-15", name: "Pad Thai",             category: "food",     qtySold: 98,  revenue:  9_800 },
  { menuItemId: "M-05", name: "Iced Mocha",           category: "coffee",   qtySold: 94,  revenue:  7_990 },
  { menuItemId: "M-24", name: "Moo Kratha Set",       category: "special",  qtySold: 88,  revenue: 30_800 },
  { menuItemId: "M-09", name: "Mojito",               category: "cocktail", qtySold: 76,  revenue: 16_720 },
  { menuItemId: "M-06", name: "Thai Milk Tea",        category: "tea",      qtySold: 71,  revenue:  3_905 },
  { menuItemId: "M-18", name: "Gaeng Hang Lay",       category: "food",     qtySold: 65,  revenue:  8_450 },
  { menuItemId: "M-13", name: "Jungle Sunset",        category: "cocktail", qtySold: 62,  revenue: 17_360 },
  { menuItemId: "M-16", name: "Som Tam",              category: "food",     qtySold: 58,  revenue:  4_640 },
];

// ============================================================
// DASHBOARD STATS
// ============================================================
export const dailyStats: DailyStats = {
  totalRevenue: 12_450,
  roomRevenue: 8_200,
  fnbRevenue: 3_300,
  activityRevenue: 950,
  occupancyRate: 61,
  totalRooms: 18,
  occupiedRooms: 11,
  checkInsToday: 3,
  checkOutsToday: 2,
};
