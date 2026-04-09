"use client";

import { useState, useEffect } from "react";
import {
  Package,
  AlertTriangle,
  CheckCircle,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  RefreshCw,
} from "lucide-react";
import { inventoryItems as seedItems } from "@/lib/mock-data";
import {
  fetchInventoryItems,
  upsertInventoryItemToDB,
  deleteInventoryItemFromDB,
} from "@/lib/db";
import type { InventoryItem } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { withAdminRole } from "@/lib/withRole";

// ── Constants ──────────────────────────────────────────────────

const CATEGORIES: InventoryItem["category"][] = [
  "food_supply", "beverage", "equipment",
  "consumable", "cleaning_supplies", "amenities",
];

const categoryMeta: Record<InventoryItem["category"], { label: string; labelTh: string; color: string }> = {
  food_supply:       { label: "Food Supply",       labelTh: "วัตถุดิบอาหาร",    color: "bg-amber-50 text-amber-700 border border-amber-200" },
  beverage:          { label: "Beverage",           labelTh: "เครื่องดื่ม",        color: "bg-purple-50 text-purple-700 border border-purple-200" },
  equipment:         { label: "Equipment",          labelTh: "อุปกรณ์",           color: "bg-blue-50 text-blue-600 border border-blue-200" },
  consumable:        { label: "Consumable",         labelTh: "วัสดุสิ้นเปลือง",    color: "bg-sage-100 text-sage-700 border border-sage-200" },
  cleaning_supplies: { label: "Cleaning Supplies",  labelTh: "อุปกรณ์ทำความสะอาด", color: "bg-cyan-50 text-cyan-700 border border-cyan-200" },
  amenities:         { label: "Amenities",          labelTh: "ของใช้ในห้อง",       color: "bg-rose-50 text-rose-700 border border-rose-200" },
};

// ── Blank form factory ─────────────────────────────────────────

function blankItem(): InventoryItem {
  return {
    id:            `INV-${Date.now()}`,
    name:          "",
    category:      "consumable",
    unit:          "pcs",
    currentStock:  0,
    minThreshold:  5,
    costPerUnit:   0,
    lastRestocked: new Date().toISOString().slice(0, 10),
  };
}

// ── Item Modal ─────────────────────────────────────────────────

function ItemModal({
  item,
  onSave,
  onClose,
}: {
  item: InventoryItem | null;
  onSave: (updated: InventoryItem) => void;
  onClose: () => void;
}) {
  const { locale } = useI18n();
  const isNew = item === null;
  const [form, setForm] = useState<InventoryItem>(item ?? blankItem());

  function set<K extends keyof InventoryItem>(key: K, value: InventoryItem[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    if (!form.name.trim()) return;
    onSave({ ...form, name: form.name.trim() });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-charcoal-200 sm:hidden" />
        <div className="flex items-center justify-between border-b border-sage-100 px-6 py-4">
          <h2 className="flex items-center gap-2 text-base font-semibold text-charcoal-800">
            <Package size={17} className="text-sage-600" />
            {isNew ? "Add Item" : "Edit Item"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-charcoal-400 hover:bg-sage-50">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-charcoal-600 mb-1">Item Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Coffee Beans (Arabica)"
              className="w-full rounded-lg border border-sage-200 px-3 py-2 text-sm text-charcoal-700 placeholder:text-charcoal-300 focus:border-sage-400 focus:outline-none focus:ring-1 focus:ring-sage-400"
            />
          </div>

          {/* Category + Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-600 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value as InventoryItem["category"])}
                className="w-full rounded-lg border border-sage-200 px-3 py-2 text-sm text-charcoal-700 focus:border-sage-400 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {locale === "th" ? categoryMeta[cat].labelTh : categoryMeta[cat].label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-600 mb-1">Unit</label>
              <input
                type="text"
                value={form.unit}
                onChange={(e) => set("unit", e.target.value)}
                placeholder="kg, btl, pcs, ltr…"
                className="w-full rounded-lg border border-sage-200 px-3 py-2 text-sm text-charcoal-700 placeholder:text-charcoal-300 focus:border-sage-400 focus:outline-none focus:ring-1 focus:ring-sage-400"
              />
            </div>
          </div>

          {/* Stock + Threshold */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-600 mb-1">Current Stock</label>
              <input
                type="number" min={0}
                value={form.currentStock}
                onChange={(e) => set("currentStock", Number(e.target.value))}
                className="w-full rounded-lg border border-sage-200 px-3 py-2 text-sm text-charcoal-700 focus:border-sage-400 focus:outline-none focus:ring-1 focus:ring-sage-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-600 mb-1">Min. Threshold</label>
              <input
                type="number" min={0}
                value={form.minThreshold}
                onChange={(e) => set("minThreshold", Number(e.target.value))}
                className="w-full rounded-lg border border-sage-200 px-3 py-2 text-sm text-charcoal-700 focus:border-sage-400 focus:outline-none focus:ring-1 focus:ring-sage-400"
              />
            </div>
          </div>

          {/* Cost + Last Restocked */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-600 mb-1">Cost / Unit (฿)</label>
              <input
                type="number" min={0}
                value={form.costPerUnit}
                onChange={(e) => set("costPerUnit", Number(e.target.value))}
                className="w-full rounded-lg border border-sage-200 px-3 py-2 text-sm text-charcoal-700 focus:border-sage-400 focus:outline-none focus:ring-1 focus:ring-sage-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-600 mb-1">Last Restocked</label>
              <input
                type="date"
                value={form.lastRestocked ?? ""}
                onChange={(e) => set("lastRestocked", e.target.value || undefined)}
                className="w-full rounded-lg border border-sage-200 px-3 py-2 text-sm text-charcoal-700 focus:border-sage-400 focus:outline-none focus:ring-1 focus:ring-sage-400"
              />
            </div>
          </div>

          {/* ID (read-only for existing items) */}
          {!isNew && (
            <div>
              <label className="block text-xs font-medium text-charcoal-400 mb-1">Item ID (read-only)</label>
              <p className="rounded-lg bg-charcoal-50 px-3 py-2 text-xs text-charcoal-400 font-mono">{form.id}</p>
            </div>
          )}

          {/* Stock preview */}
          <div className={`rounded-lg p-3 text-sm ${form.currentStock <= form.minThreshold ? "bg-amber-50 border border-amber-200" : "bg-emerald-50 border border-emerald-200"}`}>
            <span className={form.currentStock <= form.minThreshold ? "text-amber-700" : "text-emerald-700"}>
              {form.currentStock <= form.minThreshold ? "⚠ Low stock" : "✓ Stock OK"}
              {" "}{form.currentStock} / {form.minThreshold} {form.unit} min
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-sage-100 px-6 py-4">
          <button onClick={onClose} className="rounded-lg border border-sage-200 px-4 py-2 text-sm font-medium text-charcoal-600 hover:bg-sage-50">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!form.name.trim()}
            className="rounded-lg bg-sage-600 px-5 py-2 text-sm font-semibold text-white hover:bg-sage-700 disabled:opacity-50"
          >
            {isNew ? "Add Item" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────

function AdminInventoryPage() {
  const { locale } = useI18n();
  const [items, setItems]       = useState<InventoryItem[]>(seedItems);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch]     = useState("");
  const [filterCat, setFilterCat] = useState<"all" | InventoryItem["category"]>("all");
  const [showLowOnly, setShowLowOnly] = useState(false);
  const [editModal, setEditModal]     = useState<InventoryItem | "new" | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Fetch from Supabase on mount
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchInventoryItems()
      .then((data) => { if (!cancelled) setItems(data); })
      .catch((err) => console.warn("[inventory] fetch error:", err))
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const lowStockItems  = items.filter((i) => i.currentStock <= i.minThreshold);
  const totalValue     = items.reduce((s, i) => s + i.currentStock * i.costPerUnit, 0);

  const filteredItems = items
    .filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    .filter((i) => filterCat === "all" || i.category === filterCat)
    .filter((i) => !showLowOnly || i.currentStock <= i.minThreshold);

  function handleSaveItem(updated: InventoryItem) {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === updated.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updated;
        return next;
      }
      return [updated, ...prev];
    });
    void upsertInventoryItemToDB(updated);
    setEditModal(null);
  }

  function handleDeleteItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    void deleteInventoryItemFromDB(id);
    setDeleteConfirm(null);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-charcoal-800">Inventory Management</h1>
          <p className="text-sm text-charcoal-400">Full CRUD — ingredients, supplies, amenities & equipment</p>
        </div>
        <button
          onClick={() => setEditModal("new")}
          className="inline-flex items-center gap-2 rounded-lg bg-sage-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-sage-700"
        >
          <Plus size={16} /> Add Item
        </button>
      </div>

      {/* Low-stock banner */}
      {lowStockItems.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-amber-600" />
            <h3 className="text-sm font-semibold text-amber-800">
              {lowStockItems.length} item{lowStockItems.length !== 1 ? "s" : ""} below threshold
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStockItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setEditModal(item)}
                className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 hover:bg-amber-200 transition"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                {item.name}: {item.currentStock} {item.unit}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total Items",    value: items.length,         color: "text-charcoal-800" },
          { label: "Low Stock",      value: lowStockItems.length, color: "text-amber-600" },
          { label: "OK Stock",       value: items.length - lowStockItems.length, color: "text-emerald-600" },
          { label: "Inventory Value",value: `฿${totalValue.toLocaleString()}`, color: "text-charcoal-800" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-sage-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-charcoal-400">{label}</p>
            <p className={`mt-1 text-2xl font-semibold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-300" />
          <input
            type="text"
            placeholder="Search items…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-sage-200 bg-white py-2 pl-10 pr-4 text-sm text-charcoal-700 placeholder:text-charcoal-300 focus:border-sage-400 focus:outline-none focus:ring-1 focus:ring-sage-400"
          />
        </div>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value as "all" | InventoryItem["category"])}
          className="rounded-lg border border-sage-200 bg-white px-3 py-2 text-sm text-charcoal-700 focus:border-sage-400 focus:outline-none"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {locale === "th" ? categoryMeta[cat].labelTh : categoryMeta[cat].label}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowLowOnly((v) => !v)}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
            showLowOnly ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-white text-charcoal-600 border border-sage-200 hover:bg-sage-50"
          }`}
        >
          <AlertTriangle size={14} />
          Low Stock Only
        </button>
        {isLoading && (
          <div className="flex items-center gap-1 text-xs text-charcoal-400">
            <RefreshCw size={13} className="animate-spin" /> Syncing…
          </div>
        )}
      </div>

      {/* Inventory Table */}
      <div className="rounded-xl border border-sage-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-sage-100 text-left text-xs text-charcoal-400 bg-sage-50/40">
                <th className="px-5 py-3 font-medium">Item</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Stock</th>
                <th className="px-5 py-3 font-medium">Min Threshold</th>
                <th className="px-5 py-3 font-medium">Cost / Unit</th>
                <th className="px-5 py-3 font-medium">Last Restocked</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-100">
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-charcoal-300">
                    No items match your filters.
                  </td>
                </tr>
              )}
              {filteredItems.map((item) => {
                const isLow  = item.currentStock <= item.minThreshold;
                const meta   = categoryMeta[item.category];
                return (
                  <tr key={item.id} className={`hover:bg-sage-50/40 ${isLow ? "bg-amber-50/20" : ""}`}>
                    <td className="px-5 py-3">
                      <p className="font-medium text-charcoal-700">{item.name}</p>
                      <p className="text-xs text-charcoal-400 font-mono">{item.id}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.color}`}>
                        {locale === "th" ? meta.labelTh : meta.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-sm font-semibold ${isLow ? "text-amber-600" : "text-charcoal-700"}`}>
                        {item.currentStock}
                      </span>
                      <span className="ml-1 text-xs text-charcoal-400">{item.unit}</span>
                    </td>
                    <td className="px-5 py-3 text-sm text-charcoal-500">{item.minThreshold} {item.unit}</td>
                    <td className="px-5 py-3 text-sm text-charcoal-600">฿{item.costPerUnit.toLocaleString()}</td>
                    <td className="px-5 py-3 text-xs text-charcoal-500">{item.lastRestocked ?? "—"}</td>
                    <td className="px-5 py-3">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                          <AlertTriangle size={10} /> Low
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          <CheckCircle size={10} /> OK
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditModal(item)}
                          className="rounded-lg border border-sage-200 p-1.5 text-sage-700 hover:bg-sage-50 transition"
                          title="Edit"
                        >
                          <Pencil size={13} />
                        </button>
                        {deleteConfirm === item.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="rounded-lg bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="rounded-lg border border-sage-200 px-2 py-1 text-xs text-charcoal-500 hover:bg-sage-50"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(item.id)}
                            className="rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50 transition"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {editModal !== null && (
        <ItemModal
          item={editModal === "new" ? null : editModal}
          onSave={handleSaveItem}
          onClose={() => setEditModal(null)}
        />
      )}
    </div>
  );
}

// Wrap with admin-only role guard
export default withAdminRole(AdminInventoryPage);
