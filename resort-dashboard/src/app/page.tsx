"use client";

import {
  BedDouble,
  LogIn,
  LogOut,
  DollarSign,
  UtensilsCrossed,
  TreePine,
  TrendingUp,
  Users,
  AlertTriangle,
  Package,
  Minus,
  X,
  ChevronDown,
  Flame,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  dailyStats,
  bookings as initialBookings,
  orders,
  rooms,
  inventoryItems as seedItems,
  withdrawalLogs as seedLogs,
  topFnbSales,
  menuMainCategories,
} from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import PaymentForm from "@/components/PaymentForm";
import {
  updateBookingStatus,
  updateRoomHkStatus,
  updateRoomStatus,
} from "@/lib/db";
import type {
  InventoryItem,
  WithdrawalLog,
  Booking,
  PaymentMethod,
} from "@/lib/types";

// ── Sub-components ─────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = "sage",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  accent?: "sage" | "wood" | "charcoal";
}) {
  const colors = {
    sage: "bg-sage-100 text-sage-700",
    wood: "bg-wood-100 text-wood-700",
    charcoal: "bg-charcoal-100 text-charcoal-600",
  };
  return (
    <div className="rounded-xl border border-sage-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-charcoal-400">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-charcoal-800">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-charcoal-400">{sub}</p>}
        </div>
        <div className={`rounded-lg p-2.5 ${colors[accent]}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    occupied:   "bg-sage-100 text-sage-700",
    available:  "bg-emerald-50 text-emerald-700",
    reserved:   "bg-amber-50 text-amber-700",
    cleaning:   "bg-blue-50 text-blue-600",
    checked_in: "bg-sage-100 text-sage-700",
    confirmed:  "bg-amber-50 text-amber-700",
    open:       "bg-wood-100 text-wood-700",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] ?? "bg-charcoal-100 text-charcoal-600"}`}>
      {status.replace("_", " ")}
    </span>
  );
}

// ── Main Page ──────────────────────────────────────────────────

export default function DashboardPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const router = useRouter();

  // ── State ──
  const [bookingList, setBookingList] = useState<Booking[]>(initialBookings);
  const [items, setItems]             = useState<InventoryItem[]>(seedItems);
  const [logs, setLogs]               = useState<WithdrawalLog[]>(seedLogs);
  const [withdrawOpen, setWithdrawOpen]   = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [qty, setQty]                 = useState(1);
  const [reason, setReason]           = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [checkoutModal, setCheckoutModal]   = useState<Booking | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // ── Derived data ──
  const openOrders     = orders.filter((o) => o.status === "open");
  const occupiedCount  = rooms.filter((r) => r.status === "occupied").length;
  const lowStockItems  = items.filter((i) => i.currentStock <= i.minThreshold);
  const selectedItem   = items.find((i) => i.id === selectedItemId);

  // Pending check-ins: confirmed bookings (sorted soonest first)
  const pendingCheckIns = bookingList
    .filter((b) => b.status === "confirmed")
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
    .slice(0, 6);

  // Pending check-outs: currently checked-in guests (sorted by check-out date)
  const pendingCheckOuts = bookingList
    .filter((b) => b.status === "checked_in")
    .sort((a, b) => a.checkOut.localeCompare(b.checkOut))
    .slice(0, 6);

  const getRoomBillTotal = (roomId: string) =>
    orders
      .filter((o) => o.roomId === roomId && o.status === "open")
      .reduce((s, o) => s + o.total, 0);

  // ── Handlers ──

  function handleDashCheckIn(bookingId: string) {
    setBookingList((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "checked_in" as const } : b))
    );
    // DB trigger `trg_booking_status_sync` handles rooms.status = 'occupied'
    void updateBookingStatus(bookingId, "checked_in");
  }

  function handleDashCheckOut(method: PaymentMethod, refNo?: string, slipFile?: string) {
    if (!checkoutModal) return;
    const { id: bookingId, roomId } = checkoutModal;
    const payment = {
      method,
      refNo,
      slipImageUrl: slipFile,
      paidAt: new Date().toISOString(),
    };

    setBookingList((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? { ...b, status: "checked_out" as const, payment }
          : b
      )
    );

    // DB trigger handles room.status = 'cleaning' + housekeeping_status = 'dirty'
    void updateBookingStatus(bookingId, "checked_out", payment);
    // Also fire client-side helpers for immediate Supabase sync
    void updateRoomStatus(roomId, "cleaning");
    void updateRoomHkStatus(roomId, "dirty");

    setCheckoutSuccess(true);
    setTimeout(() => {
      setCheckoutModal(null);
      setCheckoutSuccess(false);
    }, 1400);
  }

  function handleWithdraw() {
    if (!selectedItem || qty < 1) return;
    const newLog: WithdrawalLog = {
      id: `WD-${Date.now()}`,
      inventoryItemId:   selectedItem.id,
      inventoryItemName: selectedItem.name,
      quantity:          qty,
      unit:              selectedItem.unit,
      reason,
      requestedBy:       user?.name ?? "Staff",
      timestamp:         new Date().toISOString(),
    };
    setItems((prev) =>
      prev.map((i) =>
        i.id === selectedItem.id
          ? { ...i, currentStock: Math.max(0, i.currentStock - qty) }
          : i
      )
    );
    setLogs((prev) => [newLog, ...prev]);
    setWithdrawSuccess(true);
    setTimeout(() => {
      setWithdrawOpen(false);
      setWithdrawSuccess(false);
      setSelectedItemId("");
      setQty(1);
      setReason("");
    }, 1200);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-charcoal-800">{t("dash.title")}</h1>
          <p className="text-sm text-charcoal-400">
            {new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            &nbsp;&mdash;&nbsp;{t("dash.subtitle")}
          </p>
        </div>
        <button
          onClick={() => setWithdrawOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-wood-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-wood-500"
        >
          <Minus size={16} />
          {t("withdraw.title")}
        </button>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} className="text-amber-600" />
            <h3 className="text-sm font-semibold text-amber-800">
              {t("dash.lowStock")} — {lowStockItems.length} {t("common.items")}
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStockItems.map((item) => (
              <span key={item.id} className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                {item.name}: {item.currentStock} {item.unit}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label={t("dash.occupancy")}
          value={`${Math.round((occupiedCount / rooms.length) * 100)}%`}
          sub={`${occupiedCount} / ${rooms.length} ${t("dash.units")}`}
          icon={BedDouble}
          accent="sage"
        />
        <StatCard
          label={t("dash.revenue")}
          value={`฿${dailyStats.totalRevenue.toLocaleString()}`}
          sub={t("dash.allSources")}
          icon={TrendingUp}
          accent="wood"
        />
        <StatCard
          label={t("dash.checkIn")}
          value={pendingCheckIns.length}
          sub={t("dash.arrivals")}
          icon={LogIn}
          accent="sage"
        />
        <StatCard
          label={t("dash.checkOut")}
          value={pendingCheckOuts.length}
          sub={t("dash.departures")}
          icon={LogOut}
          accent="charcoal"
        />
      </div>

      {/* Revenue Breakdown */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: t("dash.roomRevenue"),  value: dailyStats.roomRevenue,     icon: BedDouble,       barClass: "bg-sage-500",     bgClass: "bg-sage-100" },
          { label: t("dash.fnbRevenue"),   value: dailyStats.fnbRevenue,      icon: UtensilsCrossed, barClass: "bg-wood-500",     bgClass: "bg-wood-100" },
          { label: t("dash.actRevenue"),   value: dailyStats.activityRevenue, icon: TreePine,        barClass: "bg-charcoal-400", bgClass: "bg-charcoal-100" },
        ].map(({ label, value, icon: Icon, barClass, bgClass }) => (
          <div key={label} className="rounded-xl border border-sage-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-charcoal-400">
              <Icon size={16} />
              <span className="text-sm">{label}</span>
            </div>
            <p className="mt-2 text-xl font-semibold text-charcoal-800">฿{value.toLocaleString()}</p>
            <div className={`mt-2 h-1.5 w-full rounded-full ${bgClass}`}>
              <div className={`h-1.5 rounded-full ${barClass}`} style={{ width: `${(value / dailyStats.totalRevenue) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Two-column: Guest Activity + Open Bills */}
      <div className="grid gap-4 lg:grid-cols-2">

        {/* ── Today's Guest Activity (ACTIONABLE) ── */}
        <div className="rounded-xl border border-sage-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-sage-100 px-5 py-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-charcoal-700">
              <Users size={16} />
              {t("dash.guestActivity")}
            </h2>
          </div>

          {/* Arrivals section */}
          {pendingCheckIns.length > 0 && (
            <>
              <div className="bg-sage-50/50 border-b border-sage-100 px-5 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-sage-600">
                  Arrivals ({pendingCheckIns.length})
                </p>
              </div>
              {pendingCheckIns.map((b) => {
                const room = rooms.find((r) => r.id === b.roomId);
                return (
                  <div key={b.id} className="flex items-center justify-between px-5 py-3 border-b border-sage-50 last:border-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-charcoal-700 truncate">{b.guest.name}</p>
                      <p className="text-xs text-charcoal-400">
                        {room?.name ?? b.roomId} &middot; {b.checkIn}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDashCheckIn(b.id)}
                      className="ml-3 shrink-0 inline-flex items-center gap-1 rounded-lg bg-sage-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-sage-700 active:scale-95"
                    >
                      <LogIn size={12} /> {t("common.checkin")}
                    </button>
                  </div>
                );
              })}
            </>
          )}

          {/* Departures section */}
          {pendingCheckOuts.length > 0 && (
            <>
              <div className="bg-amber-50/40 border-b border-sage-100 px-5 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                  Departures ({pendingCheckOuts.length})
                </p>
              </div>
              {pendingCheckOuts.map((b) => {
                const room = rooms.find((r) => r.id === b.roomId);
                const fnbBill = getRoomBillTotal(b.roomId);
                return (
                  <div key={b.id} className="flex items-center justify-between px-5 py-3 border-b border-sage-50 last:border-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-charcoal-700 truncate">{b.guest.name}</p>
                      <p className="text-xs text-charcoal-400">
                        {room?.name ?? b.roomId} &middot; Out: {b.checkOut}
                        {fnbBill > 0 && (
                          <span className="ml-1 text-wood-600 font-medium">+฿{fnbBill} F&B</span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => setCheckoutModal(b)}
                      className="ml-3 shrink-0 inline-flex items-center gap-1 rounded-lg bg-wood-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-wood-700 active:scale-95"
                    >
                      <LogOut size={12} /> {t("common.checkout")}
                    </button>
                  </div>
                );
              })}
            </>
          )}

          {pendingCheckIns.length === 0 && pendingCheckOuts.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-charcoal-300">{t("common.noData")}</p>
          )}
        </div>

        {/* ── Open F&B Bills (CLICKABLE) ── */}
        <div className="rounded-xl border border-sage-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-sage-100 px-5 py-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-charcoal-700">
              <DollarSign size={16} />
              {t("dash.openBills")}
            </h2>
            <span className="rounded-full bg-wood-100 px-2 py-0.5 text-xs font-semibold text-wood-700">
              {openOrders.length}
            </span>
          </div>
          <div className="divide-y divide-sage-100">
            {openOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-charcoal-700">
                    {o.roomName ?? t("common.walkin")}
                  </p>
                  <p className="text-xs text-charcoal-400">
                    {o.items.length} {t("common.items")} &middot; {o.id}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-charcoal-700">
                      ฿{o.total.toLocaleString()}
                    </p>
                    <StatusBadge status={o.status} />
                  </div>
                  <button
                    onClick={() => router.push("/pos")}
                    className="inline-flex items-center gap-1 rounded-lg border border-wood-200 px-3 py-1.5 text-xs font-medium text-wood-700 transition hover:bg-wood-50"
                    title="View in POS"
                  >
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
            {openOrders.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-charcoal-300">{t("common.noData")}</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Withdrawals */}
      {logs.length > 0 && (
        <div className="rounded-xl border border-sage-200 bg-white shadow-sm">
          <div className="border-b border-sage-100 px-5 py-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-charcoal-700">
              <Package size={16} />
              {t("withdraw.log")}
            </h2>
          </div>
          <div className="divide-y divide-sage-100">
            {logs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-charcoal-700">{log.inventoryItemName}</p>
                  <p className="text-xs text-charcoal-400">{log.reason} &middot; {log.requestedBy}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-charcoal-700">-{log.quantity} {log.unit}</p>
                  <p className="text-xs text-charcoal-400">
                    {new Date(log.timestamp).toLocaleDateString("th-TH")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top 3 Trending Items */}
      {(() => {
        const top3 = topFnbSales.slice(0, 3);
        const maxQty = top3[0]?.qtySold ?? 1;
        const medals = ["🥇", "🥈", "🥉"];
        return (
          <div className="rounded-xl border border-sage-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-sage-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-amber-100 p-2">
                  <Flame size={16} className="text-amber-600" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-charcoal-700">{t("dash.topTrending")}</h2>
                  <p className="text-xs text-charcoal-400">{t("dash.topTrendingSub")}</p>
                </div>
              </div>
              <span className="text-xs font-medium text-charcoal-400">All-time</span>
            </div>
            <div className="divide-y divide-sage-50">
              {top3.map((item, idx) => {
                const cat = menuMainCategories.find((c) => c.id === item.category);
                const barWidth = Math.round((item.qtySold / maxQty) * 100);
                return (
                  <div key={item.menuItemId} className="flex items-center gap-4 px-5 py-3">
                    <span className="text-xl">{medals[idx]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-charcoal-800 truncate">{item.name}</p>
                        {cat && (
                          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${cat.color}`}>
                            {cat.nameEn}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-sage-100">
                        <div className="h-1.5 rounded-full bg-amber-400 transition-all" style={{ width: `${barWidth}%` }} />
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-charcoal-800">{item.qtySold.toLocaleString()}</p>
                      <p className="text-xs text-charcoal-400">{t("dash.soldUnits")}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Room Status Overview */}
      <div className="rounded-xl border border-sage-200 bg-white shadow-sm">
        <div className="border-b border-sage-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-charcoal-700">{t("dash.roomStatus")}</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              className={`rounded-lg border p-3 text-center text-xs ${
                room.status === "occupied"  ? "border-sage-300 bg-sage-50"
                : room.status === "available" ? "border-emerald-200 bg-emerald-50"
                : room.status === "reserved"  ? "border-amber-200 bg-amber-50"
                : "border-blue-200 bg-blue-50"
              }`}
            >
              <p className="font-semibold text-charcoal-700">{room.id}</p>
              <p className="mt-0.5 text-charcoal-500">{room.name}</p>
              <StatusBadge status={room.status} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Check-out Modal ─────────────────────────────────── */}
      {checkoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-sage-100 px-6 py-4">
              <h2 className="text-base font-semibold text-charcoal-800 flex items-center gap-2">
                <LogOut size={18} className="text-wood-600" />
                {t("common.checkout")} — {rooms.find((r) => r.id === checkoutModal.roomId)?.name}
              </h2>
              <button onClick={() => { setCheckoutModal(null); setCheckoutSuccess(false); }} className="rounded-lg p-1.5 text-charcoal-400 hover:bg-sage-50">
                <X size={18} />
              </button>
            </div>

            {checkoutSuccess ? (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle size={26} className="text-emerald-600" />
                </div>
                <p className="font-semibold text-charcoal-800">Check-out complete!</p>
                <p className="mt-1 text-sm text-charcoal-400">Room sent to housekeeping queue.</p>
              </div>
            ) : (
              <div className="space-y-3 px-6 py-5">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-charcoal-400 text-xs">Guest</p>
                    <p className="font-medium text-charcoal-700">{checkoutModal.guest.name}</p>
                  </div>
                  <div>
                    <p className="text-charcoal-400 text-xs">Stay</p>
                    <p className="font-medium text-charcoal-700 text-xs">{checkoutModal.checkIn} → {checkoutModal.checkOut}</p>
                  </div>
                </div>

                <hr className="border-sage-100" />

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Room Charges</span>
                    <span className="text-charcoal-700">฿{checkoutModal.totalAmount.toLocaleString()}</span>
                  </div>
                  {checkoutModal.addOns.map((a) => (
                    <div key={a.id} className="flex justify-between">
                      <span className="text-charcoal-500">{a.name} ×{a.quantity}</span>
                      <span className="text-charcoal-700">฿{(a.price * a.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  {getRoomBillTotal(checkoutModal.roomId) > 0 && (
                    <div className="flex justify-between text-wood-600 font-medium">
                      <span>F&B Open Bill</span>
                      <span>฿{getRoomBillTotal(checkoutModal.roomId).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <hr className="border-sage-100" />

                <div className="flex justify-between text-base font-semibold">
                  <span className="text-charcoal-800">{t("common.grandTotal")}</span>
                  <span className="text-sage-700">
                    ฿{(checkoutModal.totalAmount + getRoomBillTotal(checkoutModal.roomId)).toLocaleString()}
                  </span>
                </div>

                <hr className="border-sage-100" />
                <PaymentForm
                  total={checkoutModal.totalAmount + getRoomBillTotal(checkoutModal.roomId)}
                  onConfirm={handleDashCheckOut}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Quick Withdraw Modal ────────────────────────────── */}
      {withdrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-sage-100 px-6 py-4">
              <h2 className="flex items-center gap-2 text-base font-semibold text-charcoal-800">
                <Minus size={18} className="text-wood-600" />
                {t("withdraw.title")}
              </h2>
              <button
                onClick={() => { setWithdrawOpen(false); setSelectedItemId(""); setQty(1); setReason(""); setWithdrawSuccess(false); }}
                className="rounded-lg p-1.5 text-charcoal-400 hover:bg-sage-50 hover:text-charcoal-600"
              >
                <X size={18} />
              </button>
            </div>

            {withdrawSuccess ? (
              <div className="px-6 py-10 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                  <Package size={22} className="text-emerald-600" />
                </div>
                <p className="font-semibold text-charcoal-800">{t("withdraw.success")}</p>
              </div>
            ) : (
              <div className="space-y-4 px-6 py-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-charcoal-700">{t("withdraw.item")}</label>
                  <div className="relative">
                    <select
                      value={selectedItemId}
                      onChange={(e) => setSelectedItemId(e.target.value)}
                      className="w-full appearance-none rounded-lg border border-sage-200 bg-sage-50 px-3.5 py-2.5 pr-9 text-sm text-charcoal-800 outline-none focus:border-sage-500 focus:ring-2 focus:ring-sage-200"
                    >
                      <option value="">— select —</option>
                      {items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.currentStock} {item.unit} remaining)
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-charcoal-700">
                    {t("withdraw.quantity")}
                    {selectedItem && (
                      <span className="ml-2 font-normal text-charcoal-400">(max {selectedItem.currentStock} {selectedItem.unit})</span>
                    )}
                  </label>
                  <input
                    type="number" min={1} max={selectedItem?.currentStock ?? 9999}
                    value={qty} onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full rounded-lg border border-sage-200 bg-sage-50 px-3.5 py-2.5 text-sm text-charcoal-800 outline-none focus:border-sage-500 focus:ring-2 focus:ring-sage-200"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-charcoal-700">{t("withdraw.reason")}</label>
                  <input
                    type="text" value={reason} onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Used in cafe, Requested by TH-01"
                    className="w-full rounded-lg border border-sage-200 bg-sage-50 px-3.5 py-2.5 text-sm text-charcoal-800 outline-none focus:border-sage-500 focus:ring-2 focus:ring-sage-200"
                  />
                </div>
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => { setWithdrawOpen(false); setSelectedItemId(""); setQty(1); setReason(""); }}
                    className="flex-1 rounded-lg border border-sage-200 px-4 py-2.5 text-sm font-medium text-charcoal-600 transition hover:bg-sage-50"
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    onClick={handleWithdraw}
                    disabled={!selectedItemId || qty < 1 || (selectedItem ? qty > selectedItem.currentStock : false)}
                    className="flex-1 rounded-lg bg-wood-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-wood-500 disabled:opacity-50"
                  >
                    {t("withdraw.confirm")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
