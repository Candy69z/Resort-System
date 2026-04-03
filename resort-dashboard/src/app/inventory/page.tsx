"use client";

import { useState } from "react";
import {
  Package,
  AlertTriangle,
  CheckCircle,
  Plus,
  Search,
  ArrowUpDown,
} from "lucide-react";
import { inventoryItems as initialItems } from "@/lib/mock-data";
import type { InventoryItem } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

const categoryLabels: Record<string, Record<string, string>> = {
  food_supply: { en: "Food Supply", th: "วัตถุดิบอาหาร" },
  beverage: { en: "Beverage", th: "เครื่องดื่ม" },
  equipment: { en: "Equipment", th: "อุปกรณ์" },
  consumable: { en: "Consumable", th: "วัสดุสิ้นเปลือง" },
};

const categoryColors: Record<string, string> = {
  food_supply: "bg-amber-50 text-amber-700",
  beverage: "bg-purple-50 text-purple-700",
  equipment: "bg-blue-50 text-blue-600",
  consumable: "bg-sage-100 text-sage-700",
};

export default function InventoryPage() {
  const { t, locale } = useI18n();
  const [items, setItems] = useState<InventoryItem[]>(initialItems);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [showLowOnly, setShowLowOnly] = useState(false);
  const [restockModal, setRestockModal] = useState<InventoryItem | null>(null);
  const [restockQty, setRestockQty] = useState(10);

  const lowStockItems = items.filter((i) => i.currentStock <= i.minThreshold);

  const filteredItems = items
    .filter((i) =>
      i.name.toLowerCase().includes(search.toLowerCase())
    )
    .filter((i) => filterCat === "all" || i.category === filterCat)
    .filter((i) => !showLowOnly || i.currentStock <= i.minThreshold);

  const handleRestock = () => {
    if (!restockModal) return;
    setItems((prev) =>
      prev.map((i) =>
        i.id === restockModal.id
          ? { ...i, currentStock: i.currentStock + restockQty, lastRestocked: "2026-04-03" }
          : i
      )
    );
    setRestockModal(null);
    setRestockQty(10);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-charcoal-800">{t("inv.title")}</h1>
        <p className="text-sm text-charcoal-400">{t("inv.subtitle")}</p>
      </div>

      {/* Low Stock Alert Banner */}
      {lowStockItems.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} className="text-amber-600" />
            <h3 className="text-sm font-semibold text-amber-800">
              {t("inv.lowStock")} — {lowStockItems.length} {t("common.items")}
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

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-sage-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-charcoal-400">{t("common.total")} {t("common.items")}</p>
          <p className="mt-1 text-2xl font-semibold text-charcoal-800">{items.length}</p>
        </div>
        <div className="rounded-xl border border-sage-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-charcoal-400">{t("inv.lowStock")}</p>
          <p className="mt-1 text-2xl font-semibold text-amber-600">{lowStockItems.length}</p>
        </div>
        <div className="rounded-xl border border-sage-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-charcoal-400">{t("inv.inStock")}</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-600">
            {items.length - lowStockItems.length}
          </p>
        </div>
        <div className="rounded-xl border border-sage-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-charcoal-400">{t("common.total")} Value</p>
          <p className="mt-1 text-2xl font-semibold text-charcoal-800">
            ฿{items.reduce((s, i) => s + i.currentStock * i.costPerUnit, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-300" />
          <input
            type="text"
            placeholder={`${t("common.search")}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-sage-200 bg-white py-2 pl-10 pr-4 text-sm text-charcoal-700 placeholder:text-charcoal-300 focus:border-sage-400 focus:outline-none focus:ring-1 focus:ring-sage-400"
          />
        </div>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="rounded-lg border border-sage-200 bg-white px-3 py-2 text-sm text-charcoal-700 focus:border-sage-400 focus:outline-none"
        >
          <option value="all">All Categories</option>
          {Object.keys(categoryLabels).map((cat) => (
            <option key={cat} value={cat}>
              {categoryLabels[cat][locale]}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowLowOnly(!showLowOnly)}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            showLowOnly
              ? "bg-amber-100 text-amber-700 border border-amber-200"
              : "bg-white text-charcoal-600 border border-sage-200 hover:bg-sage-50"
          }`}
        >
          <AlertTriangle size={14} />
          {t("inv.lowStock")}
        </button>
      </div>

      {/* Inventory Table */}
      <div className="rounded-xl border border-sage-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-sage-100 text-left text-xs text-charcoal-400">
                <th className="px-5 py-3 font-medium">{t("inv.item")}</th>
                <th className="px-5 py-3 font-medium">{t("inv.category")}</th>
                <th className="px-5 py-3 font-medium">{t("inv.stock")}</th>
                <th className="px-5 py-3 font-medium">{t("inv.threshold")}</th>
                <th className="px-5 py-3 font-medium">{t("inv.cost")}</th>
                <th className="px-5 py-3 font-medium">{t("inv.lastRestock")}</th>
                <th className="px-5 py-3 font-medium">{t("inv.status")}</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-100">
              {filteredItems.map((item) => {
                const isLow = item.currentStock <= item.minThreshold;
                return (
                  <tr key={item.id} className={`hover:bg-sage-50/50 ${isLow ? "bg-amber-50/30" : ""}`}>
                    <td className="px-5 py-3">
                      <p className="font-medium text-charcoal-700">{item.name}</p>
                      <p className="text-xs text-charcoal-400">{item.id}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColors[item.category]}`}>
                        {categoryLabels[item.category][locale]}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-sm font-semibold ${isLow ? "text-amber-600" : "text-charcoal-700"}`}>
                        {item.currentStock}
                      </span>
                      <span className="text-xs text-charcoal-400 ml-1">{item.unit}</span>
                    </td>
                    <td className="px-5 py-3 text-charcoal-500">{item.minThreshold} {item.unit}</td>
                    <td className="px-5 py-3 text-charcoal-600">฿{item.costPerUnit.toLocaleString()}</td>
                    <td className="px-5 py-3 text-charcoal-500 text-xs">{item.lastRestocked ?? "—"}</td>
                    <td className="px-5 py-3">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                          <AlertTriangle size={11} />
                          {t("inv.lowStock")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          <CheckCircle size={11} />
                          OK
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => setRestockModal(item)}
                        className="inline-flex items-center gap-1 rounded-lg border border-sage-200 px-3 py-1.5 text-xs font-medium text-sage-700 hover:bg-sage-50"
                      >
                        <Plus size={12} />
                        {t("inv.restock")}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {restockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white shadow-xl">
            <div className="border-b border-sage-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-charcoal-800">
                {t("inv.restock")}: {restockModal.name}
              </h2>
            </div>
            <div className="space-y-4 px-6 py-5">
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-500">Current Stock</span>
                <span className="font-medium text-charcoal-700">
                  {restockModal.currentStock} {restockModal.unit}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-600 mb-1">
                  Add Quantity
                </label>
                <input
                  type="number"
                  min={1}
                  value={restockQty}
                  onChange={(e) => setRestockQty(Number(e.target.value))}
                  className="w-full rounded-lg border border-sage-200 px-3 py-2 text-sm text-charcoal-700 focus:border-sage-400 focus:outline-none focus:ring-1 focus:ring-sage-400"
                />
              </div>
              <div className="rounded-lg bg-sage-50 p-3 text-sm">
                <span className="text-charcoal-500">New Stock: </span>
                <span className="font-semibold text-sage-700">
                  {restockModal.currentStock + restockQty} {restockModal.unit}
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-sage-100 px-6 py-4">
              <button
                onClick={() => setRestockModal(null)}
                className="rounded-lg border border-sage-200 px-4 py-2 text-sm font-medium text-charcoal-600 hover:bg-sage-50"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleRestock}
                className="rounded-lg bg-sage-600 px-4 py-2 text-sm font-medium text-white hover:bg-sage-700"
              >
                {t("common.confirm")} {t("inv.restock")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
