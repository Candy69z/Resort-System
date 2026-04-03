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
} from "lucide-react";
import { dailyStats, bookings, orders, rooms, inventoryItems } from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n";

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

  const todayCheckIns = bookings.filter(
    (b) => b.checkIn === "2026-04-03" && b.status === "checked_in"
  );
  const todayCheckOuts = bookings.filter(
    (b) => b.checkOut === "2026-04-03"
  );
  const openOrders = orders.filter((o) => o.status === "open");
  const occupiedCount = rooms.filter((r) => r.status === "occupied").length;
  const lowStockItems = inventoryItems.filter((i) => i.currentStock <= i.minThreshold);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-charcoal-800">{t("dash.title")}</h1>
        <p className="text-sm text-charcoal-400">
          Thursday, April 3, 2026 &mdash; {t("dash.subtitle")}
        </p>
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
    </div>
  );
}
