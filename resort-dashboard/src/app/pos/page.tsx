"use client";

import { useState } from "react";
import {
  Coffee,
  Wine,
  UtensilsCrossed,
  Flame,
  Plus,
  Minus,
  X,
  BedDouble,
  Receipt,
  ShoppingBag,
  AlertTriangle,
} from "lucide-react";
import { menuItems, rooms, orders as initialOrders, inventoryItems as initialInventory } from "@/lib/mock-data";
import type { Order, OrderItem, MenuItem, InventoryItem, PaymentMethod } from "@/lib/types";
import PaymentForm from "@/components/PaymentForm";
import { useI18n } from "@/lib/i18n";

const categoryConfig = {
  coffee: { label: "Coffee", icon: Coffee, color: "bg-wood-100 text-wood-700 border-wood-200" },
  tea: { label: "Tea", icon: Coffee, color: "bg-sage-100 text-sage-700 border-sage-200" },
  cocktail: { label: "Cocktails", icon: Wine, color: "bg-purple-50 text-purple-700 border-purple-200" },
  food: { label: "Food", icon: UtensilsCrossed, color: "bg-amber-50 text-amber-700 border-amber-200" },
  special: { label: "Specials", icon: Flame, color: "bg-red-50 text-red-700 border-red-200" },
};

type Category = keyof typeof categoryConfig;

export default function POSPage() {
  const { t } = useI18n();
  const [orderList, setOrderList] = useState<Order[]>(initialOrders);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [activeCategory, setActiveCategory] = useState<Category>("coffee");
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [showOpenBills, setShowOpenBills] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [settlingOrder, setSettlingOrder] = useState<Order | null>(null);

  const occupiedRooms = rooms.filter((r) => r.status === "occupied");
  const openOrders = orderList.filter((o) => o.status === "open");

  const filteredMenu = menuItems.filter((m) => m.category === activeCategory && m.available);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menuItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { menuItemId: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const updateCartQty = (menuItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.menuItemId === menuItemId ? { ...c, quantity: c.quantity + delta } : c
        )
        .filter((c) => c.quantity > 0)
    );
  };

  // Deduct inventory for sold items
  const deductInventory = (items: OrderItem[]) => {
    setInventory((prev) => {
      const updated = [...prev];
      for (const cartItem of items) {
        const menuItem = menuItems.find((m) => m.id === cartItem.menuItemId);
        if (menuItem?.inventoryItemId) {
          const invIdx = updated.findIndex((i) => i.id === menuItem.inventoryItemId);
          if (invIdx >= 0) {
            updated[invIdx] = {
              ...updated[invIdx],
              currentStock: Math.max(0, updated[invIdx].currentStock - cartItem.quantity),
            };
          }
        }
      }
      return updated;
    });
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;

    // If walk-in (no room), show payment form
    if (!selectedRoom) {
      setShowPayment(true);
      return;
    }

    const room = rooms.find((r) => r.id === selectedRoom);

    // Check if there's an existing open order for this room
    const existingOrder = orderList.find((o) => o.roomId === selectedRoom && o.status === "open");

    if (existingOrder) {
      setOrderList((prev) =>
        prev.map((o) => {
          if (o.id !== existingOrder.id) return o;
          const mergedItems = [...o.items];
          for (const cartItem of cart) {
            const existing = mergedItems.find((m) => m.menuItemId === cartItem.menuItemId);
            if (existing) {
              existing.quantity += cartItem.quantity;
            } else {
              mergedItems.push({ ...cartItem });
            }
          }
          return {
            ...o,
            items: mergedItems,
            total: mergedItems.reduce((s, i) => s + i.price * i.quantity, 0),
          };
        })
      );
    } else {
      const newOrder: Order = {
        id: `ORD-${String(orderList.length + 1).padStart(3, "0")}`,
        roomId: selectedRoom,
        roomName: room?.name,
        items: [...cart],
        status: "open",
        total: cartTotal,
        createdAt: new Date().toISOString(),
      };
      setOrderList([...orderList, newOrder]);
    }

    deductInventory(cart);
    setCart([]);
    setSelectedRoom("");
  };

  const handleWalkinPayment = (method: PaymentMethod, refNo?: string, slipFile?: string) => {
    const newOrder: Order = {
      id: `ORD-${String(orderList.length + 1).padStart(3, "0")}`,
      items: [...cart],
      status: "paid",
      total: cartTotal,
      payment: {
        method,
        refNo,
        slipImageUrl: slipFile,
        paidAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      closedAt: new Date().toISOString(),
    };
    setOrderList([...orderList, newOrder]);
    deductInventory(cart);
    setCart([]);
    setSelectedRoom("");
    setShowPayment(false);
  };

  const handleSettleBill = (method: PaymentMethod, refNo?: string, slipFile?: string) => {
    if (!settlingOrder) return;
    setOrderList((prev) =>
      prev.map((o) =>
        o.id === settlingOrder.id
          ? {
              ...o,
              status: "paid" as const,
              payment: { method, refNo, slipImageUrl: slipFile, paidAt: new Date().toISOString() },
              closedAt: new Date().toISOString(),
            }
          : o
      )
    );
    setSettlingOrder(null);
  };

  // Low-stock warnings for items in cart
  const cartStockWarnings = cart
    .map((ci) => {
      const menuItem = menuItems.find((m) => m.id === ci.menuItemId);
      if (!menuItem?.inventoryItemId) return null;
      const inv = inventory.find((i) => i.id === menuItem.inventoryItemId);
      if (inv && inv.currentStock <= inv.minThreshold) return inv;
      return null;
    })
    .filter(Boolean) as InventoryItem[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-charcoal-800">{t("nav.pos")}</h1>
          <p className="text-sm text-charcoal-400">
            Point of Sale &mdash; Order & bill to room
          </p>
        </div>
        <button
          onClick={() => setShowOpenBills(!showOpenBills)}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm transition-colors ${
            showOpenBills
              ? "bg-wood-600 text-white"
              : "border border-sage-200 bg-white text-charcoal-600 hover:bg-sage-50"
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
                  <p className="text-xs text-charcoal-400">
                    {o.items.map((i) => `${i.name} x${i.quantity}`).join(", ")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-charcoal-700">
                    ฿{o.total.toLocaleString()}
                  </span>
                  <button
                    onClick={() => setSettlingOrder(o)}
                    className="rounded-lg bg-wood-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-wood-700"
                  >
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Menu Section (Left 2/3) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {(Object.keys(categoryConfig) as Category[]).map((cat) => {
              const { label, icon: Icon, color } = categoryConfig[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                    activeCategory === cat
                      ? color
                      : "border-sage-200 bg-white text-charcoal-500 hover:bg-sage-50"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              );
            })}
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filteredMenu.map((item) => {
              const inCart = cart.find((c) => c.menuItemId === item.id);
              const inv = item.inventoryItemId
                ? inventory.find((i) => i.id === item.inventoryItemId)
                : null;
              const isLowStock = inv ? inv.currentStock <= inv.minThreshold : false;

              return (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className={`relative rounded-xl border p-4 text-left transition-all hover:shadow-md ${
                    inCart
                      ? "border-sage-400 bg-sage-50 ring-1 ring-sage-400"
                      : "border-sage-200 bg-white hover:border-sage-300"
                  }`}
                >
                  <p className="text-sm font-medium text-charcoal-700">{item.name}</p>
                  {item.description && (
                    <p className="mt-0.5 text-xs text-charcoal-400 line-clamp-1">{item.description}</p>
                  )}
                  <p className="mt-2 text-base font-semibold text-sage-700">
                    ฿{item.price}
                  </p>
                  {item.availableFrom && (
                    <p className="mt-1 text-xs text-charcoal-300">
                      {item.availableFrom}–{item.availableTo}
                    </p>
                  )}
                  {inv && (
                    <p className={`mt-1 text-xs ${isLowStock ? "text-amber-600 font-medium" : "text-charcoal-300"}`}>
                      {isLowStock && <AlertTriangle size={10} className="inline mr-0.5" />}
                      Stock: {inv.currentStock} {inv.unit}
                    </p>
                  )}
                  {inCart && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-sage-600 text-xs font-bold text-white">
                      {inCart.quantity}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cart / Order Panel (Right 1/3) */}
        <div className="rounded-xl border border-sage-200 bg-white shadow-sm">
          <div className="border-b border-sage-100 px-5 py-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-charcoal-700">
              <ShoppingBag size={16} />
              Current Order
            </h2>
          </div>

          {/* Room Selector */}
          <div className="border-b border-sage-100 px-5 py-3">
            <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-charcoal-500">
              <BedDouble size={14} />
              Bill to Room (optional)
            </label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="w-full rounded-lg border border-sage-200 bg-sage-50 px-3 py-2 text-sm text-charcoal-700 focus:border-sage-400 focus:outline-none focus:ring-1 focus:ring-sage-400"
            >
              <option value="">{t("common.walkin")} ({t("common.pay")} now)</option>
              {occupiedRooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id} — {r.name}
                </option>
              ))}
            </select>
            {selectedRoom && (
              <p className="mt-1.5 text-xs text-wood-600">
                Charges will be added to the room tab and settled at check-out.
              </p>
            )}
          </div>

          {/* Cart Items */}
          <div className="max-h-80 divide-y divide-sage-100 overflow-y-auto">
            {cart.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-charcoal-300">
                Tap menu items to add
              </p>
            ) : (
              cart.map((item) => (
                <div key={item.menuItemId} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-charcoal-700 truncate">{item.name}</p>
                    <p className="text-xs text-charcoal-400">฿{item.price} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateCartQty(item.menuItemId, -1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-sage-200 text-charcoal-500 hover:bg-sage-50"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center text-sm font-medium text-charcoal-700">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQty(item.menuItemId, 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-sage-200 text-charcoal-500 hover:bg-sage-50"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <p className="w-16 text-right text-sm font-medium text-charcoal-700">
                    ฿{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Low stock warnings */}
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

          {/* Total & Submit */}
          {cart.length > 0 && (
            <div className="border-t border-sage-100 px-5 py-4 space-y-3">
              <div className="flex justify-between text-base font-semibold">
                <span className="text-charcoal-700">{t("common.total")}</span>
                <span className="text-sage-700">฿{cartTotal.toLocaleString()}</span>
              </div>
              <button
                onClick={handlePlaceOrder}
                className="w-full rounded-lg bg-sage-600 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sage-700"
              >
                {selectedRoom
                  ? `Add to ${rooms.find((r) => r.id === selectedRoom)?.name} Tab`
                  : `${t("common.pay")} ฿${cartTotal.toLocaleString()}`}
              </button>
              <button
                onClick={() => setCart([])}
                className="w-full rounded-lg border border-sage-200 py-2 text-sm font-medium text-charcoal-500 hover:bg-sage-50"
              >
                Clear Cart
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Walk-in Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-sage-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-charcoal-800">{t("common.pay")} — {t("common.walkin")}</h2>
              <button onClick={() => setShowPayment(false)} className="text-charcoal-400 hover:text-charcoal-600">
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-3">
              <div className="space-y-1">
                {cart.map((item) => (
                  <div key={item.menuItemId} className="flex justify-between text-sm">
                    <span className="text-charcoal-600">{item.name} x{item.quantity}</span>
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

      {/* Settle Open Bill Modal */}
      {settlingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-sage-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-charcoal-800">
                Settle — {settlingOrder.roomName ?? t("common.walkin")}
              </h2>
              <button onClick={() => setSettlingOrder(null)} className="text-charcoal-400 hover:text-charcoal-600">
                <X size={20} />
              </button>
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
    </div>
  );
}
