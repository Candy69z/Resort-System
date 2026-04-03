import {
  Room,
  Booking,
  MenuItem,
  Order,
  Activity,
  ActivityBooking,
  DailyStats,
  InventoryItem,
} from "./types";

// ============================================================
// ROOMS
// ============================================================
export const rooms: Room[] = [
  // Tree Houses
  { id: "TH-01", name: "Tree House 1", type: "tree_house", pricePerNight: 788, status: "occupied", amenities: ["Fan", "Water Heater", "Balcony"], description: "Nature view, private balcony", maxGuests: 2 },
  { id: "TH-02", name: "Tree House 2", type: "tree_house", pricePerNight: 788, status: "available", amenities: ["Fan", "Water Heater", "Balcony"], description: "Nature view, private balcony", maxGuests: 2 },
  { id: "TH-03", name: "Tree House 3", type: "tree_house", pricePerNight: 788, status: "reserved", amenities: ["Fan", "Water Heater", "Balcony"], description: "Nature view, private balcony", maxGuests: 2 },
  // Rice Field
  { id: "RF-01", name: "Rice Field 1", type: "rice_field", pricePerNight: 588, status: "occupied", amenities: ["Fan", "Water Heater"], description: "Rice field & river view", maxGuests: 2 },
  { id: "RF-02", name: "Rice Field 2", type: "rice_field", pricePerNight: 588, status: "occupied", amenities: ["Fan", "Water Heater"], description: "Rice field & river view", maxGuests: 2 },
  { id: "RF-03", name: "Rice Field 3", type: "rice_field", pricePerNight: 588, status: "cleaning", amenities: ["Fan", "Water Heater"], description: "Rice field & river view", maxGuests: 2 },
  // Tent Houses
  { id: "TE-01", name: "Tent House 1", type: "tent_house", pricePerNight: 888, status: "occupied", amenities: ["Fan", "Water Heater"], description: "Permanent glamping tent", maxGuests: 2 },
  { id: "TE-02", name: "Tent House 2", type: "tent_house", pricePerNight: 888, status: "available", amenities: ["Fan", "Water Heater"], description: "Permanent glamping tent", maxGuests: 2 },
  // Camping - Field View
  { id: "CF-01", name: "Camp Field 1", type: "camping", subType: "field_view", pricePerNight: 200, status: "occupied", amenities: [], description: "Field view camping spot", maxGuests: 2 },
  { id: "CF-02", name: "Camp Field 2", type: "camping", subType: "field_view", pricePerNight: 200, status: "available", amenities: [], description: "Field view camping spot", maxGuests: 2 },
  { id: "CF-03", name: "Camp Field 3", type: "camping", subType: "field_view", pricePerNight: 200, status: "available", amenities: [], description: "Field view camping spot", maxGuests: 2 },
  { id: "CF-04", name: "Camp Field 4", type: "camping", subType: "field_view", pricePerNight: 200, status: "available", amenities: [], description: "Field view camping spot", maxGuests: 2 },
  { id: "CF-05", name: "Camp Field 5", type: "camping", subType: "field_view", pricePerNight: 200, status: "reserved", amenities: [], description: "Field view camping spot", maxGuests: 2 },
  // Camping - River View
  { id: "CR-01", name: "Camp River 1", type: "camping", subType: "river_view", pricePerNight: 200, status: "occupied", amenities: [], description: "River view camping spot", maxGuests: 2 },
  { id: "CR-02", name: "Camp River 2", type: "camping", subType: "river_view", pricePerNight: 200, status: "available", amenities: [], description: "River view camping spot", maxGuests: 2 },
  { id: "CR-03", name: "Camp River 3", type: "camping", subType: "river_view", pricePerNight: 200, status: "available", amenities: [], description: "River view camping spot", maxGuests: 2 },
  { id: "CR-04", name: "Camp River 4", type: "camping", subType: "river_view", pricePerNight: 200, status: "available", amenities: [], description: "River view camping spot", maxGuests: 2 },
  { id: "CR-05", name: "Camp River 5", type: "camping", subType: "river_view", pricePerNight: 200, status: "available", amenities: [], description: "River view camping spot", maxGuests: 2 },
];

// ============================================================
// BOOKINGS
// ============================================================
export const bookings: Booking[] = [
  {
    id: "BK-001",
    roomId: "TH-01",
    guest: { id: "G-001", name: "Somchai Kaewkla", phone: "081-234-5678" },
    checkIn: "2026-04-03",
    checkOut: "2026-04-05",
    status: "checked_in",
    addOns: [{ id: "AO-1", name: "Breakfast", price: 100, quantity: 2 }],
    totalAmount: 1776,
    createdAt: "2026-04-01T10:00:00Z",
  },
  {
    id: "BK-002",
    roomId: "RF-01",
    guest: { id: "G-002", name: "Anna Schmidt", phone: "089-876-5432", email: "anna@email.com" },
    checkIn: "2026-04-02",
    checkOut: "2026-04-04",
    status: "checked_in",
    addOns: [
      { id: "AO-2", name: "Breakfast", price: 100, quantity: 2 },
      { id: "AO-3", name: "Moo Kratha Evening", price: 350, quantity: 2 },
    ],
    totalAmount: 2076,
    createdAt: "2026-03-28T14:00:00Z",
  },
  {
    id: "BK-003",
    roomId: "RF-02",
    guest: { id: "G-003", name: "Tanaka Yuki", phone: "092-111-2222" },
    checkIn: "2026-04-03",
    checkOut: "2026-04-06",
    status: "checked_in",
    addOns: [],
    totalAmount: 1764,
    createdAt: "2026-04-01T09:00:00Z",
  },
  {
    id: "BK-004",
    roomId: "TE-01",
    guest: { id: "G-004", name: "Lisa Manobal", phone: "095-333-4444" },
    checkIn: "2026-04-01",
    checkOut: "2026-04-03",
    status: "checked_in",
    addOns: [{ id: "AO-4", name: "Breakfast", price: 100, quantity: 1 }],
    totalAmount: 1876,
    notes: "Late check-out requested",
    createdAt: "2026-03-25T16:00:00Z",
  },
  {
    id: "BK-005",
    roomId: "CF-01",
    guest: { id: "G-005", name: "Mike Johnson", phone: "088-555-6666" },
    checkIn: "2026-04-03",
    checkOut: "2026-04-05",
    status: "checked_in",
    addOns: [],
    totalAmount: 400,
    createdAt: "2026-04-02T18:00:00Z",
  },
  {
    id: "BK-006",
    roomId: "CR-01",
    guest: { id: "G-006", name: "Ploy Chaiwan", phone: "086-777-8888" },
    checkIn: "2026-04-02",
    checkOut: "2026-04-04",
    status: "checked_in",
    addOns: [{ id: "AO-5", name: "Moo Jum Evening", price: 300, quantity: 2 }],
    totalAmount: 1000,
    createdAt: "2026-04-01T11:00:00Z",
  },
  {
    id: "BK-007",
    roomId: "TH-03",
    guest: { id: "G-007", name: "David Park", phone: "091-999-0000" },
    checkIn: "2026-04-04",
    checkOut: "2026-04-06",
    status: "confirmed",
    addOns: [{ id: "AO-6", name: "Breakfast", price: 100, quantity: 2 }],
    totalAmount: 1776,
    createdAt: "2026-04-02T08:00:00Z",
  },
  {
    id: "BK-008",
    roomId: "CF-05",
    guest: { id: "G-008", name: "Sarah Lee", phone: "083-111-0000" },
    checkIn: "2026-04-04",
    checkOut: "2026-04-05",
    status: "confirmed",
    addOns: [],
    totalAmount: 200,
    createdAt: "2026-04-03T07:00:00Z",
  },
];

// ============================================================
// F&B MENU
// ============================================================
export const menuItems: MenuItem[] = [
  // Coffee & Tea
  { id: "M-01", name: "Espresso", category: "coffee", price: 60, available: true },
  { id: "M-02", name: "Americano", category: "coffee", price: 65, available: true },
  { id: "M-03", name: "Café Latte", category: "coffee", price: 75, available: true },
  { id: "M-04", name: "Cappuccino", category: "coffee", price: 75, available: true },
  { id: "M-05", name: "Iced Mocha", category: "coffee", price: 85, available: true },
  { id: "M-06", name: "Thai Milk Tea", category: "tea", price: 55, available: true },
  { id: "M-07", name: "Jasmine Green Tea", category: "tea", price: 50, available: true },
  { id: "M-08", name: "Butterfly Pea Latte", category: "tea", price: 70, available: true },
  // Cocktails (17:00-22:00)
  { id: "M-09", name: "Mojito", category: "cocktail", price: 220, available: true, availableFrom: "17:00", availableTo: "22:00", inventoryItemId: "INV-06" },
  { id: "M-10", name: "Margarita", category: "cocktail", price: 240, available: true, availableFrom: "17:00", availableTo: "22:00", inventoryItemId: "INV-07" },
  { id: "M-11", name: "Negroni", category: "cocktail", price: 250, available: true, availableFrom: "17:00", availableTo: "22:00", inventoryItemId: "INV-08" },
  { id: "M-12", name: "Old Fashioned", category: "cocktail", price: 260, available: true, availableFrom: "17:00", availableTo: "22:00", inventoryItemId: "INV-09" },
  { id: "M-13", name: "Jungle Sunset", category: "cocktail", price: 280, available: true, description: "Signature", availableFrom: "17:00", availableTo: "22:00", inventoryItemId: "INV-06" },
  // Food
  { id: "M-14", name: "Khao Soi Gai", category: "food", price: 120, available: true, description: "Northern curry noodle soup" },
  { id: "M-15", name: "Pad Thai", category: "food", price: 100, available: true },
  { id: "M-16", name: "Som Tam", category: "food", price: 80, available: true, description: "Papaya salad" },
  { id: "M-17", name: "Nam Prik Ong", category: "food", price: 90, available: true, description: "Northern chili dip set" },
  { id: "M-18", name: "Gaeng Hang Lay", category: "food", price: 130, available: true, description: "Northern pork curry" },
  { id: "M-19", name: "Lab Moo", category: "food", price: 95, available: true, description: "Spicy minced pork salad" },
  { id: "M-20", name: "Jungle Curry", category: "food", price: 140, available: true, description: "Spicy herbal curry" },
  { id: "M-21", name: "Grilled River Fish", category: "food", price: 180, available: true },
  { id: "M-22", name: "Sticky Rice", category: "food", price: 20, available: true },
  { id: "M-23", name: "Steamed Rice", category: "food", price: 20, available: true },
  // Specials
  { id: "M-24", name: "Moo Kratha Set (2 pax)", category: "special", price: 350, available: true, description: "Thai BBQ grill set", availableFrom: "17:00", availableTo: "21:00", inventoryItemId: "INV-01" },
  { id: "M-25", name: "Moo Jum Set (2 pax)", category: "special", price: 300, available: true, description: "Thai hot pot set", availableFrom: "17:00", availableTo: "21:00", inventoryItemId: "INV-02" },
];

// ============================================================
// ORDERS (Open Bills)
// ============================================================
export const orders: Order[] = [
  {
    id: "ORD-001",
    roomId: "TH-01",
    roomName: "Tree House 1",
    items: [
      { menuItemId: "M-03", name: "Café Latte", price: 75, quantity: 2 },
      { menuItemId: "M-16", name: "Som Tam", price: 80, quantity: 1 },
    ],
    status: "open",
    total: 230,
    createdAt: "2026-04-03T08:30:00Z",
  },
  {
    id: "ORD-002",
    roomId: "RF-01",
    roomName: "Rice Field 1",
    items: [
      { menuItemId: "M-02", name: "Americano", price: 65, quantity: 1 },
      { menuItemId: "M-14", name: "Khao Soi Gai", price: 120, quantity: 2 },
      { menuItemId: "M-22", name: "Sticky Rice", price: 20, quantity: 2 },
    ],
    status: "open",
    total: 345,
    createdAt: "2026-04-03T09:15:00Z",
  },
  {
    id: "ORD-003",
    roomId: "TE-01",
    roomName: "Tent House 1",
    items: [
      { menuItemId: "M-05", name: "Iced Mocha", price: 85, quantity: 1 },
    ],
    status: "open",
    total: 85,
    createdAt: "2026-04-03T10:00:00Z",
  },
  {
    id: "ORD-004",
    items: [
      { menuItemId: "M-01", name: "Espresso", price: 60, quantity: 1 },
      { menuItemId: "M-15", name: "Pad Thai", price: 100, quantity: 1 },
    ],
    status: "closed",
    total: 160,
    payment: { method: "promptpay", refNo: "20260403-0800-PP", paidAt: "2026-04-03T08:00:00Z" },
    createdAt: "2026-04-03T07:45:00Z",
    closedAt: "2026-04-03T08:00:00Z",
  },
  {
    id: "ORD-005",
    items: [
      { menuItemId: "M-04", name: "Cappuccino", price: 75, quantity: 2 },
    ],
    status: "paid",
    total: 150,
    payment: { method: "cash", paidAt: "2026-04-03T09:30:00Z" },
    createdAt: "2026-04-03T09:20:00Z",
    closedAt: "2026-04-03T09:30:00Z",
  },
  {
    id: "ORD-006",
    items: [
      { menuItemId: "M-09", name: "Mojito", price: 220, quantity: 2 },
      { menuItemId: "M-11", name: "Negroni", price: 250, quantity: 1 },
    ],
    status: "paid",
    total: 690,
    payment: { method: "promptpay", refNo: "20260402-1830-PP", paidAt: "2026-04-02T18:30:00Z" },
    createdAt: "2026-04-02T18:00:00Z",
    closedAt: "2026-04-02T18:30:00Z",
  },
  {
    id: "ORD-007",
    items: [
      { menuItemId: "M-24", name: "Moo Kratha Set (2 pax)", price: 350, quantity: 1 },
      { menuItemId: "M-06", name: "Thai Milk Tea", price: 55, quantity: 2 },
    ],
    status: "paid",
    total: 460,
    payment: { method: "credit_card", paidAt: "2026-04-02T19:00:00Z" },
    createdAt: "2026-04-02T17:30:00Z",
    closedAt: "2026-04-02T19:00:00Z",
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
