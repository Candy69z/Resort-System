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
} from "lucide-react";
import { useState } from "react";
import { dailyStats, bookings, orders, rooms, inventoryItems as seedItems, withdrawalLogs as seedLogs } from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import type { InventoryItem, WithdrawalLog } from "@/lib/types";

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
          <p className="mt-1 text-2xl font-semibold text-charcoal-800">
            {value}
          </p>
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
    occupied: "bg-sage-100 text-sage-700",
    available: "bg-emerald-50 text-emerald-700",
    reserved: "bg-amber-50 text-amber-700",
    cleaning: "bg-blue-50 text-blue-600",
    checked_in: "bg-sage-100 text-sage-700",
    confirmed: "bg-amber-50 text-amber-700",
    open: "bg-wood-100 text-wood-700",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] ?? "bg-charcoal-100 text-charcoal-600"}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

export default function DashboardPage() {
  const { t } = useI18n();
  const { user } = useAuth();

  const [items, setItems] = useState<InventoryItem[]>(seedItems);
  const [logs, setLogs] = useState<WithdrawalLog[]>(seedLogs);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const todayCheckIns = bookings.filter(
    (b) => b.checkIn === "2026-04-03" && b.status === "checked_in"
  );
  const todayCheckOuts = bookings.filter(
    (b) => b.checkOut === "2026-04-03"
  );
  const openOrders = orders.filter((o) => o.status === "open");
  const occupiedCount = rooms.filter((r) => r.status === "occupied").length;
  const lowStockItems = items.filter((i) => i.currentStock <= i.minThreshold);

  const selectedItem = items.find((i) => i.id === selectedItemId);

  function handleWithdraw() {
    if (!selectedItem || qty < 1) return;
    const newLog: WithdrawalLog = {
      id: `WD-${Date.now()}`,
      inventoryItemId: selectedItem.id,
      inventoryItemName: selectedItem.name,
      quantity: qty,
      unit: selectedItem.unit,
      reason,
      requestedBy: user?.name ?? "Staff",
      timestamp: new Date().toISOString(),
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
            Thursday, April 3, 2026 &mdash; {t("dash.subtitle")}
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
              <span
                key={item.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800"
              >
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
          value={todayCheckIns.length}
          sub={t("dash.arrivals")}
          icon={LogIn}
          accent="sage"
        />
        <StatCard
          label={t("dash.checkOut")}
          value={todayCheckOuts.length}
          sub={t("dash.departures")}
          icon={LogOut}
          accent="charcoal"
        />
      </div>

      {/* Revenue Breakdown */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-sage-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-charcoal-400">
            <BedDouble size={16} />
            <span className="text-sm">{t("dash.roomRevenue")}</span>
          </div>
          <p className="mt-2 text-xl font-semibold text-charcoal-800">
            ฿{dailyStats.roomRevenue.toLocaleString()}
          </p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-sage-100">
            <div
              className="h-1.5 rounded-full bg-sage-500"
              style={{
                width: `${(dailyStats.roomRevenue / dailyStats.totalRevenue) * 100}%`,
              }}
            />
          </div>
        </div>
        <div className="rounded-xl border border-sage-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-charcoal-400">
            <UtensilsCrossed size={16} />
            <span className="text-sm">{t("dash.fnbRevenue")}</span>
          </div>
          <p className="mt-2 text-xl font-semibold text-charcoal-800">
            ฿{dailyStats.fnbRevenue.toLocaleString()}
          </p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-wood-100">
            <div
              className="h-1.5 rounded-full bg-wood-500"
              style={{
                width: `${(dailyStats.fnbRevenue / dailyStats.totalRevenue) * 100}%`,
              }}
            />
          </div>
        </div>
        <div className="rounded-xl border border-sage-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-charcoal-400">
            <TreePine size={16} />
            <span className="text-sm">{t("dash.actRevenue")}</span>
          </div>
          <p className="mt-2 text-xl font-semibold text-charcoal-800">
            ฿{dailyStats.activityRevenue.toLocaleString()}
          </p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-charcoal-100">
            <div
              className="h-1.5 rounded-full bg-charcoal-400"
              style={{
                width: `${(dailyStats.activityRevenue / dailyStats.totalRevenue) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Two-column: Today's Activity + Open Bills */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Today's Check-ins / Check-outs */}
        <div className="rounded-xl border border-sage-200 bg-white shadow-sm">
          <div className="border-b border-sage-100 px-5 py-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-charcoal-700">
              <Users size={16} />
              {t("dash.guestActivity")}
            </h2>
          </div>
          <div className="divide-y divide-sage-100">
            {[...todayCheckIns, ...todayCheckOuts].map((b) => {
              const isCheckIn = b.checkIn === "2026-04-03" && b.status === "checked_in";
              const room = rooms.find((r) => r.id === b.roomId);
              return (
                <div
                  key={b.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-charcoal-700">
                      {b.guest.name}
                    </p>
                    <p className="text-xs text-charcoal-400">
                      {room?.name} &middot; {b.checkIn} → {b.checkOut}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      isCheckIn
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {isCheckIn ? (
                      <LogIn size={12} />
                    ) : (
                      <LogOut size={12} />
                    )}
                    {isCheckIn ? t("common.checkin") : t("common.checkout")}
                  </span>
                </div>
              );
            })}
            {todayCheckIns.length + todayCheckOuts.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-charcoal-300">
                {t("common.noData")}
              </p>
            )}
          </div>
        </div>

        {/* Open F&B Bills */}
        <div className="rounded-xl border border-sage-200 bg-white shadow-sm">
          <div className="border-b border-sage-100 px-5 py-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-charcoal-700">
              <DollarSign size={16} />
              {t("dash.openBills")}
            </h2>
          </div>
          <div className="divide-y divide-sage-100">
            {openOrders.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between px-5 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-charcoal-700">
                    {o.roomName ?? t("common.walkin")}
                  </p>
                  <p className="text-xs text-charcoal-400">
                    {o.items.length} {t("common.items")} &middot; {o.id}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-charcoal-700">
                    ฿{o.total.toLocaleString()}
                  </p>
                  <StatusBadge status={o.status} />
                </div>
              </div>
            ))}
            {openOrders.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-charcoal-300">
                {t("common.noData")}
              </p>
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
                  <p className="text-sm font-semibold text-charcoal-700">
                    -{log.quantity} {log.unit}
                  </p>
                  <p className="text-xs text-charcoal-400">
                    {new Date(log.timestamp).toLocaleDateString("th-TH")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Room Status Overview */}
      <div className="rounded-xl border border-sage-200 bg-white shadow-sm">
        <div className="border-b border-sage-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-charcoal-700">
            {t("dash.roomStatus")}
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              className={`rounded-lg border p-3 text-center text-xs ${
                room.status === "occupied"
                  ? "border-sage-300 bg-sage-50"
                  : room.status === "available"
                    ? "border-emerald-200 bg-emerald-50"
                    : room.status === "reserved"
                      ? "border-amber-200 bg-amber-50"
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

      {/* Quick Withdraw Modal */}
      {withdrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-sage-100 px-6 py-4">
              <h2 className="flex items-center gap-2 text-base font-semibold text-charcoal-800">
                <Minus size={18} className="text-wood-600" />
                {t("withdraw.title")}
              </h2>
              <button
                onClick={() => {
                  setWithdrawOpen(false);
                  setSelectedItemId("");
                  setQty(1);
                  setReason("");
                  setWithdrawSuccess(false);
                }}
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
                {/* Item select */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-charcoal-700">
                    {t("withdraw.item")}
                  </label>
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

                {/* Quantity */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-charcoal-700">
                    {t("withdraw.quantity")}
                    {selectedItem && (
                      <span className="ml-2 font-normal text-charcoal-400">
                        (max {selectedItem.currentStock} {selectedItem.unit})
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={selectedItem?.currentStock ?? 9999}
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full rounded-lg border border-sage-200 bg-sage-50 px-3.5 py-2.5 text-sm text-charcoal-800 outline-none focus:border-sage-500 focus:ring-2 focus:ring-sage-200"
                  />
                </div>

                {/* Reason */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-charcoal-700">
                    {t("withdraw.reason")}
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Used in cafe, Requested by TH-01"
                    className="w-full rounded-lg border border-sage-200 bg-sage-50 px-3.5 py-2.5 text-sm text-charcoal-800 outline-none focus:border-sage-500 focus:ring-2 focus:ring-sage-200"
                  />
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => {
                      setWithdrawOpen(false);
                      setSelectedItemId("");
                      setQty(1);
                      setReason("");
                    }}
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
