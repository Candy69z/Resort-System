"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  CheckCircle2,
  Circle,
  AlertTriangle,
  ChevronRight,
  Package,
  X,
  User,
  Clock,
  Loader2,
  WifiOff,
} from "lucide-react";
import {
  defaultRestockChecklist,
  hkInventoryAddons,
  inventoryItems as seedInventory,
} from "@/lib/mock-data";
import { fetchHousekeepingRooms, updateRoomHkStatus } from "@/lib/db";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import type {
  HousekeepingRoom,
  HousekeepingStatus,
  InventoryItem,
  RestockItem,
  RestockLog,
} from "@/lib/types";

// ── Status config ──────────────────────────────────────────────
const statusConfig: Record<
  HousekeepingStatus,
  { label: string; labelTh: string; bg: string; border: string; text: string; dot: string; ring: string }
> = {
  dirty:     { label: "Dirty",     labelTh: "รกรุงรัง",           bg: "bg-red-50",     border: "border-red-200",    text: "text-red-700",    dot: "bg-red-500",    ring: "ring-red-300" },
  cleaning:  { label: "Cleaning",  labelTh: "กำลังทำความสะอาด",  bg: "bg-amber-50",   border: "border-amber-200",  text: "text-amber-700",  dot: "bg-amber-500",  ring: "ring-amber-300" },
  inspected: { label: "Inspected", labelTh: "ตรวจสอบแล้ว",       bg: "bg-blue-50",    border: "border-blue-200",   text: "text-blue-700",   dot: "bg-blue-500",   ring: "ring-blue-300" },
  ready:     { label: "Ready",     labelTh: "พร้อมรับแขก",        bg: "bg-emerald-50", border: "border-emerald-200",text: "text-emerald-700",dot: "bg-emerald-500",ring: "ring-emerald-300" },
};

const statusOrder: HousekeepingStatus[] = ["dirty", "cleaning", "inspected", "ready"];

// ── Status Badge ───────────────────────────────────────────────
function StatusBadge({ status }: { status: HousekeepingStatus }) {
  const cfg = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ── Loading Skeleton ───────────────────────────────────────────
function RoomCardSkeleton() {
  return (
    <div className="rounded-2xl border-2 border-charcoal-100 bg-white p-4 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-1.5">
          <div className="h-5 w-16 rounded bg-charcoal-100" />
          <div className="h-3.5 w-24 rounded bg-charcoal-100" />
        </div>
        <div className="h-6 w-20 rounded-full bg-charcoal-100" />
      </div>
      <div className="flex gap-2 mb-4">
        <div className="h-3 w-14 rounded bg-charcoal-100" />
        <div className="h-3 w-16 rounded bg-charcoal-100" />
      </div>
      <div className="flex gap-2">
        <div className="h-11 flex-1 rounded-xl bg-charcoal-100" />
        <div className="h-11 w-11 rounded-xl bg-charcoal-100" />
      </div>
    </div>
  );
}

// ── Restock Modal ──────────────────────────────────────────────
function RestockModal({
  room,
  inventory,
  onConfirm,
  onClose,
}: {
  room: HousekeepingRoom;
  inventory: InventoryItem[];
  onConfirm: (items: RestockItem[]) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const { user } = useAuth();

  const [checklist, setChecklist] = useState<RestockItem[]>(
    defaultRestockChecklist.map((d) => ({ ...d, checked: true }))
  );
  const [done, setDone] = useState(false);

  function toggle(id: string) {
    setChecklist((prev) =>
      prev.map((item) =>
        item.inventoryItemId === id ? { ...item, checked: !item.checked } : item
      )
    );
  }

  function updateQty(id: string, qty: number) {
    setChecklist((prev) =>
      prev.map((item) =>
        item.inventoryItemId === id ? { ...item, quantity: Math.max(1, qty) } : item
      )
    );
  }

  function handleConfirm() {
    const selected = checklist.filter((i) => i.checked);
    onConfirm(selected);
    setDone(true);
    setTimeout(() => { onClose(); }, 1400);
  }

  const getStock = (invId: string) =>
    inventory.find((i) => i.id === invId)?.currentStock ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center p-0 sm:p-4">
      <div className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-charcoal-200 sm:hidden" />

        <div className="flex items-center justify-between border-b border-sage-100 px-5 py-4 pt-5">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold text-charcoal-800">
              <Package size={17} className="text-sage-600" />
              {t("hk.restockChecklist")}
            </h2>
            <p className="text-xs text-charcoal-400">{room.roomName}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-charcoal-400 hover:bg-sage-50">
            <X size={18} />
          </button>
        </div>

        {done ? (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 size={28} className="text-emerald-600" />
            </div>
            <p className="text-base font-semibold text-charcoal-800">{t("hk.restockSuccess")}</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-sage-50 px-5">
              {checklist.map((item) => {
                const stock = getStock(item.inventoryItemId);
                const willGoBelowMin = stock - item.quantity < 0;
                return (
                  <div key={item.inventoryItemId} className="flex items-center gap-4 py-4">
                    <button
                      onClick={() => toggle(item.inventoryItemId)}
                      className={`shrink-0 h-7 w-7 rounded-full border-2 flex items-center justify-center transition ${
                        item.checked
                          ? "border-sage-500 bg-sage-500 text-white"
                          : "border-charcoal-300"
                      }`}
                    >
                      {item.checked && <CheckCircle2 size={16} strokeWidth={2.5} />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${item.checked ? "text-charcoal-800" : "text-charcoal-400 line-through"}`}>
                        {item.name}
                      </p>
                      <p className="text-xs text-charcoal-400">
                        In stock: {stock} {item.unit}
                        {willGoBelowMin && item.checked && (
                          <span className="ml-1 text-amber-600 font-medium">⚠ low after</span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => updateQty(item.inventoryItemId, item.quantity - 1)}
                        disabled={!item.checked}
                        className="h-8 w-8 rounded-full border border-sage-200 text-charcoal-500 hover:bg-sage-50 disabled:opacity-30 flex items-center justify-center text-lg font-bold leading-none"
                      >−</button>
                      <span className="w-6 text-center text-sm font-semibold text-charcoal-700">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.inventoryItemId, item.quantity + 1)}
                        disabled={!item.checked}
                        className="h-8 w-8 rounded-full border border-sage-200 text-charcoal-500 hover:bg-sage-50 disabled:opacity-30 flex items-center justify-center text-lg font-bold leading-none"
                      >+</button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-sage-100 px-5 py-4 space-y-3">
              <p className="text-xs text-charcoal-400">
                Confirmed by: <span className="font-medium text-charcoal-600">{user?.name ?? "Staff"}</span>
                &nbsp;·&nbsp;{checklist.filter((i) => i.checked).length} items selected
              </p>
              <button
                onClick={handleConfirm}
                disabled={checklist.filter((i) => i.checked).length === 0}
                className="w-full rounded-xl bg-sage-700 py-3.5 text-sm font-semibold text-white transition hover:bg-sage-600 disabled:opacity-50"
              >
                {t("hk.confirmRestock")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Room Card ──────────────────────────────────────────────────
function RoomCard({
  room,
  onStatusChange,
  onRestock,
}: {
  room: HousekeepingRoom;
  onStatusChange: (roomId: string, status: HousekeepingStatus) => void;
  onRestock: (room: HousekeepingRoom) => void;
}) {
  const { locale } = useI18n();
  const cfg = statusConfig[room.housekeepingStatus];
  const currentIdx = statusOrder.indexOf(room.housekeepingStatus);
  const nextStatus = statusOrder[currentIdx + 1] as HousekeepingStatus | undefined;
  const nextCfg = nextStatus ? statusConfig[nextStatus] : null;

  const timeAgo = (() => {
    const diff = Date.now() - new Date(room.lastUpdated).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  })();

  return (
    <div className={`rounded-2xl border-2 ${cfg.border} ${cfg.bg} p-4 transition-all active:scale-[0.98]`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-lg font-bold text-charcoal-800 leading-tight">{room.roomId}</p>
          <p className="text-sm text-charcoal-500">{room.roomName}</p>
        </div>
        <StatusBadge status={room.housekeepingStatus} />
      </div>

      <div className="flex items-center gap-3 mb-4 text-xs text-charcoal-400">
        <span className="flex items-center gap-1">
          <Clock size={11} />
          {timeAgo}
        </span>
        {room.assignedTo && (
          <span className="flex items-center gap-1">
            <User size={11} />
            {room.assignedTo}
          </span>
        )}
      </div>

      <div className="flex gap-2">
        {nextStatus && nextCfg && (
          <button
            onClick={() => onStatusChange(room.roomId, nextStatus)}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-semibold transition active:scale-95 ${nextCfg.bg} ${nextCfg.text} border ${nextCfg.border}`}
          >
            <ChevronRight size={16} />
            {locale === "th" ? nextCfg.labelTh : nextCfg.label}
          </button>
        )}
        {room.housekeepingStatus === "ready" && (
          <div className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-semibold text-emerald-600">
            <CheckCircle2 size={16} />
            {locale === "th" ? "พร้อมแล้ว" : "All done"}
          </div>
        )}

        <button
          onClick={() => onRestock(room)}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-sage-200 bg-white px-3 py-3 text-sm font-medium text-charcoal-600 transition hover:bg-sage-50 active:scale-95"
        >
          <Package size={16} />
        </button>
      </div>
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────
function EmptyState({ filter }: { filter: HousekeepingStatus | "all" }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-charcoal-50">
        <Circle size={28} className="text-charcoal-300" />
      </div>
      <p className="text-sm font-medium text-charcoal-500">
        {filter === "all"
          ? "No rooms found"
          : `No rooms with status "${statusConfig[filter].label}"`}
      </p>
      <p className="mt-1 text-xs text-charcoal-300">
        {filter === "all"
          ? "Check your Supabase connection or run the seed SQL."
          : "Try a different filter above."}
      </p>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function HousekeepingPage() {
  const { t } = useI18n();
  const { user } = useAuth();

  // ── Data state ────────────────────────────────────────────────
  const allInventory = [...seedInventory, ...hkInventoryAddons];
  const [rooms,          setRooms]          = useState<HousekeepingRoom[]>([]);
  const [inventory,      setInventory]      = useState<InventoryItem[]>(allInventory);
  const [logs,           setLogs]           = useState<RestockLog[]>([]);
  const [restockingRoom, setRestockingRoom] = useState<HousekeepingRoom | null>(null);
  const [filterStatus,   setFilterStatus]   = useState<HousekeepingStatus | "all">("all");

  // ── Loading / error state ─────────────────────────────────────
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // ── Fetch rooms from Supabase on mount ────────────────────────
  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setFetchError(null);

    fetchHousekeepingRooms()
      .then((data) => {
        if (cancelled) return;
        setRooms(data);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        console.error("[HousekeepingPage] fetch error:", err);
        setFetchError("Could not reach the database. Showing local data.");
        // db.ts already returns mock fallback on error, but just in case:
        import("@/lib/mock-data").then(({ housekeepingRooms }) => {
          if (!cancelled) setRooms(housekeepingRooms);
        });
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  // ── Derived counts ────────────────────────────────────────────
  const counts = {
    dirty:     rooms.filter((r) => r.housekeepingStatus === "dirty").length,
    cleaning:  rooms.filter((r) => r.housekeepingStatus === "cleaning").length,
    inspected: rooms.filter((r) => r.housekeepingStatus === "inspected").length,
    ready:     rooms.filter((r) => r.housekeepingStatus === "ready").length,
  };

  const filtered = filterStatus === "all"
    ? rooms
    : rooms.filter((r) => r.housekeepingStatus === filterStatus);

  // ── Status change — optimistic local update + Supabase write ──
  function handleStatusChange(roomId: string, newStatus: HousekeepingStatus) {
    // 1. Update local state immediately (optimistic)
    setRooms((prev) =>
      prev.map((r) =>
        r.roomId === roomId
          ? { ...r, housekeepingStatus: newStatus, lastUpdated: new Date().toISOString() }
          : r
      )
    );
    // 2. Persist to Supabase in the background (fire-and-forget)
    void updateRoomHkStatus(roomId, newStatus);
  }

  // ── Restock ───────────────────────────────────────────────────
  function handleRestock(items: RestockItem[]) {
    if (!restockingRoom) return;

    setInventory((prev) =>
      prev.map((inv) => {
        const restockItem = items.find((i) => i.inventoryItemId === inv.id);
        if (restockItem) {
          return { ...inv, currentStock: Math.max(0, inv.currentStock - restockItem.quantity) };
        }
        return inv;
      })
    );

    const newLog: RestockLog = {
      id: `RS-${Date.now()}`,
      roomId:   restockingRoom.roomId,
      roomName: restockingRoom.roomName,
      items:    items.map(({ checked: _c, ...rest }) => rest),
      completedBy: user?.name ?? "Staff",
      timestamp:   new Date().toISOString(),
    };
    setLogs((prev) => [newLog, ...prev]);

    if (restockingRoom.housekeepingStatus === "cleaning") {
      handleStatusChange(restockingRoom.roomId, "inspected");
    }
  }

  const totalRooms = rooms.length || 18; // prevent divide-by-zero during load
  const readyPct   = Math.round((counts.ready / totalRooms) * 100);

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-charcoal-800">
            <Sparkles size={20} className="text-sage-600" />
            {t("hk.title")}
          </h1>
          <p className="text-sm text-charcoal-400">{t("hk.subtitle")}</p>
        </div>
        {/* Live / offline indicator */}
        {!isLoading && (
          <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
            fetchError
              ? "bg-amber-50 text-amber-600"
              : "bg-emerald-50 text-emerald-700"
          }`}>
            {fetchError
              ? <><WifiOff size={11} /> Offline</>
              : <><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live</>
            }
          </span>
        )}
      </div>

      {/* Fetch-error banner */}
      {fetchError && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <AlertTriangle size={15} className="shrink-0" />
          {fetchError}
        </div>
      )}

      {/* Progress summary */}
      <div className="rounded-xl border border-sage-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-charcoal-600">{t("hk.progress")}</span>
          {isLoading ? (
            <span className="flex items-center gap-1.5 text-sm text-charcoal-400">
              <Loader2 size={13} className="animate-spin" /> Loading…
            </span>
          ) : (
            <span className="text-sm font-bold text-emerald-700">
              {counts.ready}/{rooms.length} ready · {readyPct}%
            </span>
          )}
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-charcoal-100 flex">
          {isLoading ? (
            <div className="h-full w-full animate-pulse bg-charcoal-100 rounded-full" />
          ) : (
            <>
              <div className="bg-red-400 transition-all"     style={{ width: `${(counts.dirty    / totalRooms) * 100}%` }} />
              <div className="bg-amber-400 transition-all"   style={{ width: `${(counts.cleaning / totalRooms) * 100}%` }} />
              <div className="bg-blue-400 transition-all"    style={{ width: `${(counts.inspected/ totalRooms) * 100}%` }} />
              <div className="bg-emerald-500 transition-all" style={{ width: `${(counts.ready    / totalRooms) * 100}%` }} />
            </>
          )}
        </div>
        {!isLoading && (
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-charcoal-500">
            {(Object.entries(counts) as [HousekeepingStatus, number][]).map(([s, n]) => (
              <span key={s} className="flex items-center gap-1">
                <span className={`h-2 w-2 rounded-full ${statusConfig[s].dot}`} />
                {statusConfig[s].label}: {n}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {(["all", ...statusOrder] as const).map((s) => {
          const isAll = s === "all";
          const cfg   = isAll ? null : statusConfig[s];
          const count = isAll ? rooms.length : counts[s];
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`shrink-0 flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
                filterStatus === s
                  ? isAll
                    ? "bg-charcoal-700 text-white"
                    : `${cfg!.bg} ${cfg!.text} ring-2 ${cfg!.ring}`
                  : "bg-white border border-charcoal-200 text-charcoal-500"
              }`}
            >
              {!isAll && <span className={`h-2 w-2 rounded-full ${cfg!.dot}`} />}
              {isAll ? t("hk.allRooms") : cfg!.label}
              <span className="rounded-full bg-white/60 px-1.5 text-xs font-bold">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Alert if dirty rooms */}
      {!isLoading && counts.dirty > 0 && filterStatus === "all" && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle size={16} className="shrink-0" />
          {counts.dirty} room{counts.dirty > 1 ? "s" : ""} need cleaning
        </div>
      )}

      {/* Room grid — skeleton while loading */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <RoomCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.length > 0
            ? filtered.map((room) => (
                <RoomCard
                  key={room.roomId}
                  room={room}
                  onStatusChange={handleStatusChange}
                  onRestock={(r) => setRestockingRoom(r)}
                />
              ))
            : <EmptyState filter={filterStatus} />
          }
        </div>
      )}

      {/* Recent restock log */}
      {logs.length > 0 && (
        <div className="rounded-xl border border-sage-200 bg-white shadow-sm">
          <div className="border-b border-sage-100 px-5 py-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-charcoal-700">
              <Package size={15} />
              Recent Restocks
            </h2>
          </div>
          <div className="divide-y divide-sage-50">
            {logs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-charcoal-700">{log.roomName}</p>
                  <p className="text-xs text-charcoal-400">
                    {log.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
                  </p>
                </div>
                <div className="text-right text-xs text-charcoal-400">
                  <p>{log.completedBy}</p>
                  <p>{new Date(log.timestamp).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {restockingRoom && (
        <RestockModal
          room={restockingRoom}
          inventory={inventory}
          onConfirm={(items) => {
            handleRestock(items);
          }}
          onClose={() => setRestockingRoom(null)}
        />
      )}
    </div>
  );
}
