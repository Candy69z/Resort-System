"use client";

import { useState } from "react";
import {
  Settings,
  UtensilsCrossed,
  TreePine,
  Tag,
  Pencil,
  Plus,
  Trash2,
  X,
  Check,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import {
  menuItems as seedMenuItems,
  activities as seedActivities,
  menuSubCategories as seedSubCats,
} from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import type { MenuItem, Activity, MenuSubCategory, MenuMainCategory } from "@/lib/types";

// ── Main category metadata ─────────────────────────────────
const mainCategories: { key: MenuMainCategory; label: string; color: string }[] = [
  { key: "coffee",   label: "Coffee",   color: "bg-wood-100 text-wood-700 border-wood-200" },
  { key: "tea",      label: "Tea",      color: "bg-sage-100 text-sage-700 border-sage-200" },
  { key: "cocktail", label: "Cocktail", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { key: "food",     label: "Food",     color: "bg-amber-50 text-amber-700 border-amber-200" },
  { key: "special",  label: "Special",  color: "bg-red-50 text-red-700 border-red-200" },
];

const actCategoryLabels: Record<Activity["category"], string> = {
  workshop: "Workshop",
  outdoor: "Outdoor",
  event: "Event",
};

// ── Menu Item Modal ────────────────────────────────────────
function MenuItemModal({
  item,
  subCategories,
  onSave,
  onClose,
}: {
  item: MenuItem | null;
  subCategories: MenuSubCategory[];
  onSave: (updated: MenuItem) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const isNew = item === null;
  const blank: MenuItem = {
    id: `M-NEW-${Date.now()}`,
    name: "",
    category: "food",
    subCategory: "",
    price: 0,
    available: true,
    description: "",
  };
  const [form, setForm] = useState<MenuItem>(item ?? blank);

  const availableSubs = subCategories.filter(
    (s) => s.parentCategory === form.category
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-sage-100 px-6 py-4">
          <h2 className="text-base font-semibold text-charcoal-800">
            {isNew ? t("admin.addItem") : t("admin.editItem")} — F&B
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-charcoal-400 hover:bg-sage-50">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-charcoal-700">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-sage-200 bg-sage-50 px-3.5 py-2.5 text-sm outline-none focus:border-sage-500 focus:ring-2 focus:ring-sage-200"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-charcoal-700">{t("admin.mainCategory")}</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as MenuMainCategory, subCategory: "" })}
                className="w-full rounded-lg border border-sage-200 bg-sage-50 px-3.5 py-2.5 text-sm outline-none focus:border-sage-500"
              >
                {mainCategories.map(({ key, label }) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-charcoal-700">{t("admin.subCategory")}</label>
              <select
                value={form.subCategory ?? ""}
                onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
                className="w-full rounded-lg border border-sage-200 bg-sage-50 px-3.5 py-2.5 text-sm outline-none focus:border-sage-500"
              >
                <option value="">— none —</option>
                {availableSubs.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-charcoal-700">{t("admin.price")}</label>
              <input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-sage-200 bg-sage-50 px-3.5 py-2.5 text-sm outline-none focus:border-sage-500"
              />
            </div>
            <div className="flex flex-col justify-end">
              <button
                onClick={() => setForm({ ...form, available: !form.available })}
                className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  form.available ? "bg-emerald-50 text-emerald-700" : "bg-charcoal-100 text-charcoal-500"
                }`}
              >
                {form.available ? <Check size={14} /> : <AlertCircle size={14} />}
                {form.available ? t("admin.available") : t("admin.unavailable")}
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-charcoal-700">Description</label>
            <input
              value={form.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-sage-200 bg-sage-50 px-3.5 py-2.5 text-sm outline-none focus:border-sage-500"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 rounded-lg border border-sage-200 px-4 py-2.5 text-sm font-medium text-charcoal-600 hover:bg-sage-50">
              {t("common.cancel")}
            </button>
            <button
              onClick={() => { if (form.name.trim()) onSave(form); }}
              disabled={!form.name.trim()}
              className="flex-1 rounded-lg bg-sage-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sage-600 disabled:opacity-50"
            >
              {t("admin.saveChanges")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Activity Modal ─────────────────────────────────────────
function ActivityModal({
  activity,
  onSave,
  onClose,
}: {
  activity: Activity | null;
  onSave: (a: Activity) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const isNew = activity === null;
  const blank: Activity = {
    id: `ACT-NEW-${Date.now()}`,
    name: "",
    category: "outdoor",
    price: 0,
    description: "",
    maxSlots: 10,
    duration: "2h",
  };
  const [form, setForm] = useState<Activity>(activity ?? blank);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-sage-100 px-6 py-4">
          <h2 className="text-base font-semibold text-charcoal-800">
            {isNew ? t("admin.addItem") : t("admin.editItem")} — Activity
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-charcoal-400 hover:bg-sage-50">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-charcoal-700">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-sage-200 bg-sage-50 px-3.5 py-2.5 text-sm outline-none focus:border-sage-500 focus:ring-2 focus:ring-sage-200"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-charcoal-700">{t("admin.category")}</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as Activity["category"] })}
                className="w-full rounded-lg border border-sage-200 bg-sage-50 px-3.5 py-2.5 text-sm outline-none focus:border-sage-500"
              >
                {Object.entries(actCategoryLabels).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-charcoal-700">{t("admin.price")}</label>
              <input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-sage-200 bg-sage-50 px-3.5 py-2.5 text-sm outline-none focus:border-sage-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-charcoal-700">{t("admin.maxSlots")}</label>
              <input
                type="number"
                min={1}
                value={form.maxSlots}
                onChange={(e) => setForm({ ...form, maxSlots: parseInt(e.target.value) || 1 })}
                className="w-full rounded-lg border border-sage-200 bg-sage-50 px-3.5 py-2.5 text-sm outline-none focus:border-sage-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-charcoal-700">{t("admin.duration")}</label>
              <input
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="e.g. 2h"
                className="w-full rounded-lg border border-sage-200 bg-sage-50 px-3.5 py-2.5 text-sm outline-none focus:border-sage-500"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-charcoal-700">Description</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-sage-200 bg-sage-50 px-3.5 py-2.5 text-sm outline-none focus:border-sage-500"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 rounded-lg border border-sage-200 px-4 py-2.5 text-sm font-medium text-charcoal-600 hover:bg-sage-50">
              {t("common.cancel")}
            </button>
            <button
              onClick={() => { if (form.name.trim()) onSave(form); }}
              disabled={!form.name.trim()}
              className="flex-1 rounded-lg bg-sage-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sage-600 disabled:opacity-50"
            >
              {t("admin.saveChanges")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Categories Tab ─────────────────────────────────────────
function CategoriesTab({
  subCategories,
  onChange,
}: {
  subCategories: MenuSubCategory[];
  onChange: (updated: MenuSubCategory[]) => void;
}) {
  const { t } = useI18n();
  const [expandedMain, setExpandedMain] = useState<MenuMainCategory | null>("food");
  const [newSubName, setNewSubName] = useState("");
  const [addingTo, setAddingTo] = useState<MenuMainCategory | null>(null);
  const [editingSub, setEditingSub] = useState<MenuSubCategory | null>(null);
  const [editName, setEditName] = useState("");

  function addSubCategory(parent: MenuMainCategory) {
    if (!newSubName.trim()) return;
    const newSub: MenuSubCategory = {
      id: `SC-${Date.now()}`,
      name: newSubName.trim(),
      parentCategory: parent,
    };
    onChange([...subCategories, newSub]);
    setNewSubName("");
    setAddingTo(null);
  }

  function deleteSubCategory(id: string) {
    onChange(subCategories.filter((s) => s.id !== id));
  }

  function saveEdit() {
    if (!editingSub || !editName.trim()) return;
    onChange(
      subCategories.map((s) =>
        s.id === editingSub.id ? { ...s, name: editName.trim() } : s
      )
    );
    setEditingSub(null);
    setEditName("");
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-charcoal-400">
        Manage sub-categories for each main category. Sub-categories are available in the item editor.
      </p>
      {mainCategories.map(({ key, label, color }) => {
        const subs = subCategories.filter((s) => s.parentCategory === key);
        const isExpanded = expandedMain === key;
        return (
          <div key={key} className="rounded-xl border border-sage-200 bg-white overflow-hidden shadow-sm">
            {/* Main category header */}
            <button
              onClick={() => setExpandedMain(isExpanded ? null : key)}
              className="flex w-full items-center justify-between px-5 py-4 hover:bg-sage-50"
            >
              <div className="flex items-center gap-3">
                <span className={`rounded-lg border px-2.5 py-0.5 text-xs font-semibold ${color}`}>
                  {label}
                </span>
                <span className="text-sm text-charcoal-500">
                  {subs.length} sub-categor{subs.length !== 1 ? "ies" : "y"}
                </span>
              </div>
              <ChevronRight
                size={16}
                className={`text-charcoal-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}
              />
            </button>

            {/* Expanded sub-categories */}
            {isExpanded && (
              <div className="border-t border-sage-100 px-5 py-3 space-y-2">
                {subs.map((sub) => (
                  <div key={sub.id} className="flex items-center gap-2">
                    {editingSub?.id === sub.id ? (
                      <>
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                          autoFocus
                          className="flex-1 rounded-lg border border-sage-300 px-3 py-1.5 text-sm outline-none focus:border-sage-500"
                        />
                        <button onClick={saveEdit} className="rounded-lg bg-sage-700 px-3 py-1.5 text-xs font-medium text-white">
                          Save
                        </button>
                        <button onClick={() => setEditingSub(null)} className="rounded-lg border border-sage-200 px-3 py-1.5 text-xs text-charcoal-500">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 rounded-lg bg-sage-50 px-3 py-2 text-sm text-charcoal-700">
                          {sub.name}
                        </span>
                        <button
                          onClick={() => { setEditingSub(sub); setEditName(sub.name); }}
                          className="rounded-lg p-1.5 text-charcoal-400 hover:bg-sage-100 hover:text-charcoal-700"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => deleteSubCategory(sub.id)}
                          className="rounded-lg p-1.5 text-charcoal-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                ))}

                {/* Add new sub-category */}
                {addingTo === key ? (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      value={newSubName}
                      onChange={(e) => setNewSubName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addSubCategory(key)}
                      placeholder="Sub-category name…"
                      autoFocus
                      className="flex-1 rounded-lg border border-sage-300 px-3 py-1.5 text-sm outline-none focus:border-sage-500"
                    />
                    <button
                      onClick={() => addSubCategory(key)}
                      disabled={!newSubName.trim()}
                      className="rounded-lg bg-sage-700 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => { setAddingTo(null); setNewSubName(""); }}
                      className="rounded-lg border border-sage-200 px-3 py-1.5 text-xs text-charcoal-500"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingTo(key)}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-sage-600 hover:bg-sage-50"
                  >
                    <Plus size={14} />
                    {t("admin.addSubCategory")}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────
type AdminTab = "menu" | "activities" | "categories";

export default function AdminPage() {
  const { t } = useI18n();
  const { hasRole } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>("menu");
  const [menuList, setMenuList] = useState<MenuItem[]>(seedMenuItems);
  const [actList, setActList] = useState<Activity[]>(seedActivities);
  const [subCategories, setSubCategories] = useState<MenuSubCategory[]>(seedSubCats);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [editingAct, setEditingAct] = useState<Activity | null>(null);
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [actModalOpen, setActModalOpen] = useState(false);

  if (!hasRole("admin")) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div className="text-center">
          <AlertCircle size={32} className="mx-auto mb-3 text-charcoal-300" />
          <p className="text-sm text-charcoal-500">Admin access required.</p>
        </div>
      </div>
    );
  }

  function saveMenuItem(updated: MenuItem) {
    setMenuList((prev) => {
      const idx = prev.findIndex((m) => m.id === updated.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = updated; return next; }
      return [...prev, updated];
    });
    setMenuModalOpen(false);
  }

  function saveActivity(updated: Activity) {
    setActList((prev) => {
      const idx = prev.findIndex((a) => a.id === updated.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = updated; return next; }
      return [...prev, updated];
    });
    setActModalOpen(false);
  }

  const tabs: { key: AdminTab; label: string; icon: React.ElementType }[] = [
    { key: "menu",       label: t("admin.menuTab"),       icon: UtensilsCrossed },
    { key: "activities", label: t("admin.activitiesTab"), icon: TreePine },
    { key: "categories", label: t("admin.categoriesTab"), icon: Tag },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-charcoal-800">
          <Settings size={22} />
          {t("admin.title")}
        </h1>
        <p className="text-sm text-charcoal-400">{t("admin.subtitle")}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-sage-200">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${
              activeTab === key
                ? "border-sage-600 text-sage-700"
                : "border-transparent text-charcoal-500 hover:text-charcoal-700"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Menu Tab ── */}
      {activeTab === "menu" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => { setEditingMenu(null); setMenuModalOpen(true); }}
              className="flex items-center gap-2 rounded-lg bg-sage-700 px-4 py-2 text-sm font-medium text-white hover:bg-sage-600"
            >
              <Plus size={16} />
              {t("admin.addItem")}
            </button>
          </div>
          <div className="rounded-xl border border-sage-200 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sage-100 bg-sage-50 text-xs font-semibold text-charcoal-500">
                  <th className="px-5 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">{t("admin.mainCategory")}</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">{t("admin.subCategory")}</th>
                  <th className="px-4 py-3 text-right">{t("admin.price")}</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-100">
                {menuList.map((item) => {
                  const mainCat = mainCategories.find((c) => c.key === item.category);
                  return (
                    <tr key={item.id} className="hover:bg-sage-50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-charcoal-800">{item.name}</p>
                        {item.description && (
                          <p className="text-xs text-charcoal-400 truncate max-w-[180px]">{item.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${mainCat?.color ?? ""}`}>
                          {mainCat?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-xs text-charcoal-400">
                        {item.subCategory || "—"}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-charcoal-700">฿{item.price}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${item.available ? "bg-emerald-50 text-emerald-700" : "bg-charcoal-100 text-charcoal-500"}`}>
                          {item.available ? <Check size={10} /> : <X size={10} />}
                          {item.available ? t("admin.available") : t("admin.unavailable")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => { setEditingMenu(item); setMenuModalOpen(true); }}
                          className="rounded-lg p-1.5 text-charcoal-400 hover:bg-sage-100 hover:text-charcoal-700"
                        >
                          <Pencil size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Activities Tab ── */}
      {activeTab === "activities" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => { setEditingAct(null); setActModalOpen(true); }}
              className="flex items-center gap-2 rounded-lg bg-sage-700 px-4 py-2 text-sm font-medium text-white hover:bg-sage-600"
            >
              <Plus size={16} />
              {t("admin.addItem")}
            </button>
          </div>
          <div className="rounded-xl border border-sage-200 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sage-100 bg-sage-50 text-xs font-semibold text-charcoal-500">
                  <th className="px-5 py-3 text-left">Activity</th>
                  <th className="px-4 py-3 text-left">{t("admin.category")}</th>
                  <th className="px-4 py-3 text-right">{t("admin.price")}</th>
                  <th className="px-4 py-3 text-right hidden sm:table-cell">{t("admin.maxSlots")}</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">{t("admin.duration")}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-100">
                {actList.map((act) => (
                  <tr key={act.id} className="hover:bg-sage-50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-charcoal-800">{act.name}</p>
                      <p className="text-xs text-charcoal-400 truncate max-w-[200px]">{act.description}</p>
                    </td>
                    <td className="px-4 py-3 text-charcoal-500 text-xs">{actCategoryLabels[act.category]}</td>
                    <td className="px-4 py-3 text-right font-semibold text-charcoal-700">฿{act.price}</td>
                    <td className="px-4 py-3 text-right text-charcoal-600 hidden sm:table-cell">{act.maxSlots}</td>
                    <td className="px-4 py-3 text-charcoal-500 hidden sm:table-cell">{act.duration}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => { setEditingAct(act); setActModalOpen(true); }}
                        className="rounded-lg p-1.5 text-charcoal-400 hover:bg-sage-100 hover:text-charcoal-700"
                      >
                        <Pencil size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Categories Tab ── */}
      {activeTab === "categories" && (
        <CategoriesTab subCategories={subCategories} onChange={setSubCategories} />
      )}

      {/* Modals */}
      {menuModalOpen && (
        <MenuItemModal
          item={editingMenu}
          subCategories={subCategories}
          onSave={saveMenuItem}
          onClose={() => setMenuModalOpen(false)}
        />
      )}
      {actModalOpen && (
        <ActivityModal
          activity={editingAct}
          onSave={saveActivity}
          onClose={() => setActModalOpen(false)}
        />
      )}
    </div>
  );
}
