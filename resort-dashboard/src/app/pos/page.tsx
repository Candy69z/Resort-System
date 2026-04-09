"use client";

import { useState } from "react";
import {
  Coffee,
  Wine,
  UtensilsCrossed,
  Flame,
  Tag,
  Plus,
  Minus,
  X,
  BedDouble,
  Receipt,
  ShoppingBag,
  AlertTriangle,
  MessageSquare,
  SplitSquareHorizontal,
  ChevronDown,
  Check,
} from "lucide-react";
import {
  rooms,
  orders as initialOrders,
  inventoryItems as initialInventory,
} from "@/lib/mock-data";
import type {
  Order,
  OrderItem,
  MenuItem,
  InventoryItem,
  PaymentMethod,
  MenuMainCategoryDef,
} from "@/lib/types";
import PaymentForm from "@/components/PaymentForm";
import { useI18n } from "@/lib/i18n";
import { useMockData } from "@/lib/mock-data-context";

// ── Icon map for well-known category ids ───────────────────────
const CAT_ICON_MAP: Record<string, React.ElementType> = {
  coffee:   Coffee,
  tea:      Coffee,
  cocktail: Wine,
  food:     UtensilsCrossed,
  special:  Flame,
};
function getCatIcon(id: string): React.ElementType {
  return CAT_ICON_MAP[id] ?? Tag;
}

// ── Active-color map (inactive badge → filled active button) ──
const ACTIVE_COLOR_MAP: Record<string, string> = {
  "bg-wood-100 text-wood-700 border-wood-200":              "bg-wood-600 text-white border-wood-600",
  "bg-sage-100 text-sage-700 border-sage-200":              "bg-sage-600 text-white border-sage-600",
  "bg-purple-50 text-purple-700 border-purple-200":         "bg-purple-700 text-white border-purple-700",
  "bg-amber-50 text-amber-700 border-amber-200":            "bg-amber-600 text-white border-amber-600",
  "bg-red-50 text-red-700 border-red-200":                  "bg-red-600 text-white border-red-600",
  "bg-blue-50 text-blue-700 border-blue-200":               "bg-blue-600 text-white border-blue-600",
  "bg-emerald-50 text-emerald-700 border-emerald-200":      "bg-emerald-600 text-white border-emerald-600",
  "bg-charcoal-100 text-charcoal-600 border-charcoal-200":  "bg-charcoal-600 text-white border-charcoal-600",
};
function getActiveColor(color: string): string {
  return ACTIVE_COLOR_MAP[color] ?? "bg-sage-600 text-white border-sage-600";
}

// ── Item Note Modal ────────────────────────────────────────────
function ItemNoteModal({
  item,
  currentNote,
  onSave,
  onClose,
}: {
  item: OrderItem;
  currentNote: string;
  onSave: (note: string) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [note, setNote] = useState(currentNote);
  const quickNotes = [
    "หวานน้อย / Less Sweet",
    "ไม่หวาน / No Sugar",
    "ไม่เผ็ด / Not Spicy",
    "เผ็ดมาก / Extra Spicy",
    "ไม่ใส่น้ำแข็ง / No Ice",
    "น้ำแข็งน้อย / Less Ice",
    "ไม่ใส่ผัก / No Vegetables",
    "ข้าวเพิ่ม / Extra Rice",
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center p-0 sm:p-4">
      <div className="w-full max-w-sm rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl">
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-charcoal-200 sm:hidden" />
        <div className="flex items-center justify-between border-b border-sage-100 px-5 py-4 pt-5">
          <div>
            <h2 className="text-base font-semibold text-charcoal-800">{t("pos.addNote")}</h2>
            <p className="text-xs text-charcoal-400">{item.name}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-charcoal-400 hover:bg-sage-50">
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("pos.notePlaceholder")}
            rows={2}
            className="w-full rounded-lg border border-sage-200 bg-sage-50 px-3.5 py-2.5 text-sm text-charcoal-800 outline-none resize-none focus:border-sage-500 focus:ring-2 focus:ring-sage-200"
          />
          <div className="flex flex-wrap gap-1.5">
            {quickNotes.map((qn) => (
              <button key={qn} onClick={() => setNote(qn)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium border transition ${
                  note === qn ? "bg-sage-600 text-white border-sage-600" : "border-sage-200 bg-white text-charcoal-600 hover:bg-sage-50"
                }`}>
                {qn}
              </button>
            ))}
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={() => { onSave(""); onClose(); }}
              className="flex-1 rounded-xl border border-sage-200 py-3 text-sm font-medium text-charcoal-500 hover:bg-sage-50">
              Clear
            </button>
            <button onClick={() => { onSave(note); onClose(); }}
              className="flex-1 rounded-xl bg-sage-700 py-3 text-sm font-semibold text-white hover:bg-sage-600">
              {t("common.confirm")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Split Bill Modal ───────────────────────────────────────────
function SplitBillModal({ total, onClose }: { total: number; onClose: () => void }) {
  const { t } = useI18n();
  const [ways, setWays] = useState(2);
  const perPerson = Math.ceil(total / ways);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center p-0 sm:p-4">
      <div className="w-full max-w-sm rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl">
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-charcoal-200 sm:hidden" />
        <div className="flex items-center justify-between border-b border-sage-100 px-5 py-4 pt-5">
          <h2 className="flex items-center gap-2 text-base font-semibold text-charcoal-800">
            <SplitSquareHorizontal size={17} />
            {t("pos.splitBill")}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-charcoal-400 hover:bg-sage-50"><X size={18} /></button>
        </div>
        <div className="px-5 py-5 space-y-5">
          <div className="text-center">
            <p className="text-sm text-charcoal-400">{t("common.total")}</p>
            <p className="text-3xl font-bold text-charcoal-800">฿{total.toLocaleString()}</p>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-charcoal-700">{t("pos.splitBy")}</label>
            <div className="flex gap-2">
              {[2, 3, 4, 5, 6].map((n) => (
                <button key={n} onClick={() => setWays(n)}
                  className={`flex-1 rounded-xl py-3 text-sm font-bold transition ${
                    ways === n ? "bg-sage-700 text-white" : "border border-sage-200 bg-white text-charcoal-600 hover:bg-sage-50"
                  }`}>
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-sage-50 p-4 space-y-2">
            {Array.from({ length: ways }).map((_, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-charcoal-500">Person {i + 1}</span>
                <span className="font-semibold text-charcoal-800">
                  ฿{(i === ways - 1 ? total - perPerson * (ways - 1) : perPerson).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-charcoal-400">≈ ฿{perPerson.toLocaleString()} {t("pos.perPerson")}</p>
          <button onClick={onClose}
            className="w-full rounded-xl bg-sage-700 py-3.5 text-sm font-semibold text-white hover:bg-sage-600">
            <Check size={15} className="inline mr-1.5" />Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main POS Page ──────────────────────────────────────────────
export default function POSPage() {
  const { t, locale } = useI18n();

  // ── Global shared data (stays in sync with Admin edits) ──
  const {
    menuItems,
    menuMainCategories: mainCats,
    menuSubCategories:  subCats,
  } = useMockData();

  // ── State ──
  const [orderList, setOrderList]       = useState<Order[]>(initialOrders);
  const [inventory, setInventory]       = useState<InventoryItem[]>(initialInventory);
  const [activeCategory, setActiveCategory]   = useState<string>(mainCats[0]?.id ?? "coffee");
  const [activeSubCat, setActiveSubCat]       = useState<string | null>(null);
  const [cart, setCart]                 = useState<OrderItem[]>([]);
  const [payMode, setPayMode]           = useState<"pay_now" | "charge_room">("pay_now");
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [showOpenBills, setShowOpenBills] = useState(false);
  const [showPayment, setShowPayment]   = useState(false);
  const [settlingOrder, setSettlingOrder] = useState<Order | null>(null);
  const [noteModal, setNoteModal]       = useState<OrderItem | null>(null);
  const [showSplitBill, setShowSplitBill] = useState(false);

  // ── Derived data ──
  const occupiedRooms   = rooms.filter((r) => r.status === "occupied");
  const openOrders      = orderList.filter((o) => o.status === "open");

  // Sub-categories for the active main category
  const activeSubs = subCats.filter((s) => s.parentCategory === activeCategory);

  // Menu filtered by main category + sub-category
  const filteredMenu = menuItems.filter((m) => {
    if (!m.available || m.category !== activeCategory) return false;
    if (activeSubCat && m.subCategory !== activeSubCat) return false;
    return true;
  });

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // ── Helpers to get localised name ──
  function itemDisplayName(item: MenuItem): string {
    return locale === "th" ? (item.nameTh || item.name) : (item.nameEn || item.name);
  }

  // ── Cart operations ──
  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === item.id);
      if (existing) {
        return prev.map((c) => c.menuItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, {
        menuItemId: item.id,
        name:       itemDisplayName(item),
        price:      item.price,
        quantity:   1,
      }];
    });
  };

  const updateCartQty = (menuItemId: string, delta: number) => {
    setCart((prev) =>
      prev.map((c) => c.menuItemId === menuItemId ? { ...c, quantity: c.quantity + delta } : c)
          .filter((c) => c.quantity > 0)
    );
  };

  const updateCartNote = (menuItemId: string, note: string) => {
    setCart((prev) => prev.map((c) => c.menuItemId === menuItemId ? { ...c, note } : c));
  };

  // ── Inventory deduction ──
  const deductInventory = (items: OrderItem[]) => {
    setInventory((prev) => {
      const updated = [...prev];
      for (const cartItem of items) {
        const menuItem = menuItems.find((m) => m.id === cartItem.menuItemId);
        if (menuItem?.inventoryItemId) {
          const invIdx = updated.findIndex((i) => i.id === menuItem.inventoryItemId);
          if (invIdx >= 0) {
            updated[invIdx] = { ...updated[invIdx], currentStock: Math.max(0, updated[invIdx].currentStock - cartItem.quantity) };
          }
        }
      }
      return updated;
    });
  };

  // ── Order actions ──
  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    if (payMode === "pay_now") { setShowPayment(true); return; }
    if (!selectedRoom) { setShowPayment(true); return; }

    const room = rooms.find((r) => r.id === selectedRoom);
    const existingOrder = orderList.find((o) => o.roomId === selectedRoom && o.status === "open");

    if (existingOrder) {
      setOrderList((prev) =>
        prev.map((o) => {
          if (o.id !== existingOrder.id) return o;
          const mergedItems = [...o.items];
          for (const cartItem of cart) {
            const existing = mergedItems.find((m) => m.menuItemId === cartItem.menuItemId);
            if (existing) { existing.quantity += cartItem.quantity; }
            else { mergedItems.push({ ...cartItem }); }
          }
          return { ...o, items: mergedItems, total: mergedItems.reduce((s, i) => s + i.price * i.quantity, 0) };
        })
      );
    } else {
      const newOrder: Order = {
        id: `ORD-${String(orderList.length + 1).padStart(3, "0")}`,
        roomId:    selectedRoom,
        roomName:  room?.name,
        items:     [...cart],
        status:    "open",
        total:     cartTotal,
        createdAt: new Date().toISOString(),
      };
      setOrderList([...orderList, newOrder]);
    }
    deductInventory(cart);
    setCart([]);
    setSelectedRoom("");
    setPayMode("pay_now");
  };

  const handleWalkinPayment = (method: PaymentMethod, refNo?: string, slipFile?: string) => {
    const newOrder: Order = {
      id: `ORD-${String(orderList.length + 1).padStart(3, "0")}`,
      items: [...cart], status: "paid", total: cartTotal,
      payment: { method, refNo, slipImageUrl: slipFile, paidAt: new Date().toISOString() },
      createdAt: new Date().toISOString(), closedAt: new Date().toISOString(),
    };
    setOrderList([...orderList, newOrder]);
    deductInventory(cart);
    setCart([]);
    setSelectedRoom("");
    setPayMode("pay_now");
    setShowPayment(false);
  };

  const handleSettleBill = (method: PaymentMethod, refNo?: string, slipFile?: string) => {
    if (!settlingOrder) return;
    setOrderList((prev) =>
      prev.map((o) =>
        o.id === settlingOrder.id
          ? { ...o, status: "paid" as const, payment: { method, refNo, slipImageUrl: slipFile, paidAt: new Date().toISOString() }, closedAt: new Date().toISOString() }
          : o
      )
    );
    setSettlingOrder(null);
  };

  const cartStockWarnings = cart
    .map((ci) => {
      const menuItem = menuItems.find((m) => m.id === ci.menuItemId);
      if (!menuItem?.inventoryItemId) return null;
      const inv = inventory.find((i) => i.id === menuItem.inventoryItemId);
      return inv && inv.currentStock <= inv.minThreshold ? inv : null;
    })
    .filter(Boolean) as InventoryItem[];

  // ── Change category and reset sub-cat ──
  function handleCategoryChange(catId: string) {
    setActiveCategory(catId);
    setActiveSubCat(null);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-charcoal-800">{t("nav.pos")}</h1>
          <p className="text-sm text-charcoal-400">Point of Sale — Order & bill to room</p>
        </div>
        <button
          onClick={() => setShowOpenBills(!showOpenBills)}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium shadow-sm transition-colors ${
            showOpenBills ? "bg-wood-600 text-white" : "border border-sage-200 bg-white text-charcoal-600 hover:bg-sage-50"
          }`}
        >
          <Receipt size={16} />
          Open Bills ({openOrders.length})
        </button>
      </div>

      {/* Open Bills Panel */}
      {showOpenBills && (
        <div className="rounded-xl border border-wood-200 bg-wood-50 shadow-sm">
          <div className="border-b border-wood-200 px-5 py-3">
            <h2 className="text-sm font-semibold text-wood-800">Open Room Bills</h2>
          </div>
          <div className="divide-y divide-wood-100">
            {openOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-charcoal-700">
                    {o.roomName ?? t("common.walkin")} <span className="text-charcoal-400">({o.id})</span>
                  </p>
                  <p className="text-xs text-charcoal-400 truncate max-w-xs">
                    {o.items.map((i) => `${i.name} x${i.quantity}`).join(", ")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-charcoal-700">฿{o.total.toLocaleString()}</span>
                  <button onClick={() => setSettlingOrder(o)}
                    className="rounded-lg bg-wood-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-wood-700">
                    {t("common.pay")}
                  </button>
                </div>
              </div>
            ))}
            {openOrders.length === 0 && (
              <p className="px-5 py-6 text-center text-sm text-wood-400">{t("common.noData")}</p>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        {/* ── Menu Section (Left 2/3) ── */}
        <div className="lg:col-span-2 space-y-3">

          {/* ── Main Category Tabs (dynamic) ── */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 lg:mx-0 lg:px-0 lg:flex-wrap">
            {[...mainCats]
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((cat) => {
                const isActive = activeCategory === cat.id;
                const Icon = getCatIcon(cat.id);
                const activeColor = getActiveColor(cat.color);
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`shrink-0 inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition-all active:scale-95 ${
                      isActive ? activeColor : cat.color
                    }`}
                  >
                    <Icon size={18} />
                    {locale === "th" ? cat.nameTh : cat.nameEn}
                  </button>
                );
              })}
          </div>

          {/* ── Sub-Category Chip Filter (shows only if subs exist) ── */}
          {activeSubs.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 lg:mx-0 lg:px-0">
              <button
                onClick={() => setActiveSubCat(null)}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
                  activeSubCat === null
                    ? "bg-charcoal-700 text-white border-charcoal-700"
                    : "border-charcoal-200 bg-white text-charcoal-600 hover:bg-charcoal-50"
                }`}
              >
                All
              </button>
              {activeSubs.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubCat(activeSubCat === sub.nameEn ? null : sub.nameEn)}
                  className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
                    activeSubCat === sub.nameEn
                      ? "bg-sage-600 text-white border-sage-600"
                      : "border-sage-200 bg-white text-charcoal-600 hover:bg-sage-50"
                  }`}
                >
                  {locale === "th" ? sub.nameTh : sub.nameEn}
                </button>
              ))}
            </div>
          )}

          {/* ── Menu Grid ── */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filteredMenu.length === 0 && (
              <div className="col-span-3 rounded-2xl border border-dashed border-sage-200 py-12 text-center text-sm text-charcoal-300">
                No items in this category
              </div>
            )}
            {filteredMenu.map((item) => {
              const inCart = cart.find((c) => c.menuItemId === item.id);
              const inv = item.inventoryItemId ? inventory.find((i) => i.id === item.inventoryItemId) : null;
              const isLowStock = inv ? inv.currentStock <= inv.minThreshold : false;
              const displayName = itemDisplayName(item);
              const subName = locale === "th" ? item.nameTh : item.nameEn;

              return (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className={`relative rounded-2xl border text-left transition-all active:scale-95 hover:shadow-md flex flex-col overflow-hidden ${
                    inCart
                      ? "border-sage-400 bg-sage-50 ring-2 ring-sage-400"
                      : "border-sage-200 bg-white hover:border-sage-300"
                  }`}
                >
                  {/* Image thumbnail — shows when imageUrl is set */}
                  {item.imageUrl ? (
                    <div className="h-24 w-full shrink-0 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl}
                        alt={displayName}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="h-16 w-full shrink-0 bg-gradient-to-br from-sage-50 to-sage-100 flex items-center justify-center">
                      <UtensilsCrossed size={22} className="text-sage-200" />
                    </div>
                  )}

                  {/* Card content */}
                  <div className="p-3 flex flex-col flex-1 gap-0.5">
                    <p className="text-sm font-semibold text-charcoal-800 leading-snug">{displayName}</p>
                    {subName !== displayName && (
                      <p className="text-xs text-charcoal-400">{subName}</p>
                    )}
                    <div className="mt-auto pt-1.5">
                      <p className="text-lg font-bold text-sage-700">฿{item.price}</p>
                      {item.availableFrom && (
                        <p className="text-xs text-charcoal-300">{item.availableFrom}–{item.availableTo}</p>
                      )}
                      {inv && (
                        <p className={`text-xs mt-0.5 ${isLowStock ? "text-amber-600 font-medium" : "text-charcoal-300"}`}>
                          {isLowStock && <AlertTriangle size={10} className="inline mr-0.5" />}
                          {inv.currentStock} {inv.unit}
                        </p>
                      )}
                    </div>
                  </div>

                  {inCart && (
                    <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-sage-600 text-xs font-bold text-white shadow">
                      {inCart.quantity}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Cart Panel (Right 1/3) ── */}
        <div className="rounded-2xl border border-sage-200 bg-white shadow-sm flex flex-col">
          {/* Cart header */}
          <div className="border-b border-sage-100 px-5 py-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-charcoal-700">
              <ShoppingBag size={16} />
              Current Order
              {cart.length > 0 && (
                <span className="ml-auto rounded-full bg-sage-600 px-2 py-0.5 text-xs font-bold text-white">
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </h2>
          </div>

          {/* Payment Mode Toggle */}
          <div className="border-b border-sage-100 px-5 py-3 space-y-2.5">
            <div className="flex gap-2">
              <button
                onClick={() => { setPayMode("pay_now"); setSelectedRoom(""); }}
                className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold transition-all ${
                  payMode === "pay_now"
                    ? "bg-sage-600 text-white border-sage-600"
                    : "border-sage-200 bg-white text-charcoal-600 hover:bg-sage-50"
                }`}
              >
                {t("pos.payNow")}
              </button>
              <button
                onClick={() => setPayMode("charge_room")}
                className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold transition-all ${
                  payMode === "charge_room"
                    ? "bg-wood-600 text-white border-wood-600"
                    : "border-sage-200 bg-white text-charcoal-600 hover:bg-sage-50"
                }`}
              >
                <BedDouble size={14} className="inline mr-1.5 -mt-0.5" />
                {t("pos.chargeRoom")}
              </button>
            </div>
            {payMode === "charge_room" && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-charcoal-500">{t("pos.selectRoom")}</label>
                <div className="relative">
                  <select
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-wood-200 bg-wood-50 px-3.5 py-2.5 pr-9 text-sm text-charcoal-700 focus:border-wood-400 focus:outline-none focus:ring-2 focus:ring-wood-200"
                  >
                    <option value="">-- {t("pos.selectRoom")} --</option>
                    {occupiedRooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.id} — {locale === "th" ? r.nameTh : r.nameEn}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
                </div>
                {selectedRoom && (
                  <p className="text-xs text-wood-600">{t("pos.chargeRoomNote")}</p>
                )}
              </div>
            )}
          </div>

          {/* Cart Items */}
          <div className="flex-1 divide-y divide-sage-100 overflow-y-auto max-h-[55vh]">
            {cart.length === 0 ? (
              <p className="px-5 py-12 text-center text-sm text-charcoal-300">Tap menu items to add</p>
            ) : (
              cart.map((item) => (
                <div key={item.menuItemId} className="px-4 py-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-charcoal-800 leading-tight">{item.name}</p>
                      {item.note && (
                        <p className="mt-0.5 text-xs text-sage-600 italic">📝 {item.note}</p>
                      )}
                    </div>
                    <p className="text-sm font-bold text-charcoal-700 shrink-0">
                      ฿{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateCartQty(item.menuItemId, -1)}
                      className="h-10 w-10 flex items-center justify-center rounded-xl bg-sage-100 text-sage-700 font-bold text-lg hover:bg-sage-200 active:scale-90 transition">
                      −
                    </button>
                    <span className="w-8 text-center text-base font-bold text-charcoal-700">{item.quantity}</span>
                    <button onClick={() => updateCartQty(item.menuItemId, 1)}
                      className="h-10 w-10 flex items-center justify-center rounded-xl bg-sage-600 text-white font-bold text-lg hover:bg-sage-700 active:scale-90 transition">
                      +
                    </button>
                    <button onClick={() => setNoteModal(item)}
                      className={`ml-auto flex items-center gap-1 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                        item.note ? "border-sage-400 bg-sage-50 text-sage-700" : "border-charcoal-200 text-charcoal-400 hover:bg-sage-50"
                      }`}>
                      <MessageSquare size={13} />
                      {item.note ? "Edit" : t("pos.addNote")}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Stock warnings */}
          {cartStockWarnings.length > 0 && (
            <div className="border-t border-amber-100 bg-amber-50/50 px-5 py-2">
              {cartStockWarnings.map((inv) => (
                <p key={inv.id} className="flex items-center gap-1 text-xs text-amber-700">
                  <AlertTriangle size={11} />
                  {inv.name}: {inv.currentStock} {inv.unit} left
                </p>
              ))}
            </div>
          )}

          {/* Total & Actions */}
          {cart.length > 0 && (
            <div className="border-t border-sage-100 px-5 py-4 space-y-3">
              <div className="flex justify-between text-lg font-bold">
                <span className="text-charcoal-700">{t("common.total")}</span>
                <span className="text-sage-700">฿{cartTotal.toLocaleString()}</span>
              </div>
              <button onClick={() => setShowSplitBill(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-sage-200 py-2.5 text-sm font-medium text-charcoal-600 hover:bg-sage-50 transition">
                <SplitSquareHorizontal size={15} />
                {t("pos.splitBill")}
              </button>
              <button onClick={handlePlaceOrder}
                className={`w-full rounded-xl py-4 text-base font-bold text-white shadow-sm transition active:scale-[0.98] ${
                  payMode === "charge_room" ? "bg-wood-600 hover:bg-wood-700" : "bg-sage-600 hover:bg-sage-700"
                }`}>
                {payMode === "charge_room" && selectedRoom
                  ? `${t("pos.addToRoom")} — ${rooms.find((r) => r.id === selectedRoom)?.[locale === "th" ? "nameTh" : "nameEn"] ?? selectedRoom}`
                  : payMode === "charge_room"
                  ? t("pos.addToRoom")
                  : `${t("common.pay")} ฿${cartTotal.toLocaleString()}`}
              </button>
              <button onClick={() => setCart([])}
                className="w-full rounded-xl border border-sage-200 py-2.5 text-sm font-medium text-charcoal-500 hover:bg-sage-50">
                Clear Cart
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Walk-in Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-sage-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-charcoal-800">{t("common.pay")} — {t("common.walkin")}</h2>
              <button onClick={() => setShowPayment(false)} className="text-charcoal-400 hover:text-charcoal-600"><X size={20} /></button>
            </div>
            <div className="px-6 py-5 space-y-3">
              <div className="space-y-1">
                {cart.map((item) => (
                  <div key={item.menuItemId} className="flex justify-between text-sm">
                    <span className="text-charcoal-600">{item.name} x{item.quantity}{item.note && <span className="ml-1 text-sage-500 text-xs">({item.note})</span>}</span>
                    <span className="text-charcoal-700">฿{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <hr className="border-sage-100" />
              <PaymentForm total={cartTotal} onConfirm={handleWalkinPayment} />
            </div>
          </div>
        </div>
      )}

      {/* Settle Bill Modal */}
      {settlingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-sage-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-charcoal-800">Settle — {settlingOrder.roomName ?? t("common.walkin")}</h2>
              <button onClick={() => setSettlingOrder(null)} className="text-charcoal-400 hover:text-charcoal-600"><X size={20} /></button>
            </div>
            <div className="px-6 py-5 space-y-3">
              <div className="space-y-1">
                {settlingOrder.items.map((item) => (
                  <div key={item.menuItemId} className="flex justify-between text-sm">
                    <span className="text-charcoal-600">{item.name} x{item.quantity}</span>
                    <span className="text-charcoal-700">฿{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <hr className="border-sage-100" />
              <PaymentForm total={settlingOrder.total} onConfirm={handleSettleBill} />
            </div>
          </div>
        </div>
      )}

      {/* Item Note Modal */}
      {noteModal && (
        <ItemNoteModal
          item={noteModal}
          currentNote={noteModal.note ?? ""}
          onSave={(note) => updateCartNote(noteModal.menuItemId, note)}
          onClose={() => setNoteModal(null)}
        />
      )}

      {/* Split Bill Modal */}
      {showSplitBill && (
        <SplitBillModal total={cartTotal} onClose={() => setShowSplitBill(false)} />
      )}
    </div>
  );
}
