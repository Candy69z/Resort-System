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
  Globe,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useMockData } from "@/lib/mock-data-context";
import type {
  MenuItem,
  Activity,
  MenuSubCategory,
  MenuMainCategoryDef,
} from "@/lib/types";

// ── Tailwind color palette options for new main categories ─────
const COLOR_OPTIONS: { label: string; value: string }[] = [
  { label: "Wood (Brown)",   value: "bg-wood-100 text-wood-700 border-wood-200"         },
  { label: "Sage (Green)",   value: "bg-sage-100 text-sage-700 border-sage-200"         },
  { label: "Purple",         value: "bg-purple-50 text-purple-700 border-purple-200"    },
  { label: "Amber",          value: "bg-amber-50 text-amber-700 border-amber-200"       },
  { label: "Red / Special",  value: "bg-red-50 text-red-700 border-red-200"             },
  { label: "Blue",           value: "bg-blue-50 text-blue-700 border-blue-200"          },
  { label: "Emerald",        value: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { label: "Charcoal",       value: "bg-charcoal-100 text-charcoal-600 border-charcoal-200" },
];

const actCategoryLabels: Record<Activity["category"], string> = {
  workshop: "Workshop",
  outdoor:  "Outdoor",
  event:    "Event",
};

// ── Menu Item Modal ────────────────────────────────────────────
function MenuItemModal({
  item,
  mainCategories,
  subCategories,
  onSave,
  onClose,
}: {
  item: MenuItem | null;
  mainCategories: MenuMainCategoryDef[];
  subCategories: MenuSubCategory[];
  onSave: (updated: MenuItem) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const isNew = item === null;
  const blank: MenuItem = {
    id:          `M-NEW-${Date.now()}`,
    name:        "",
    nameEn:      "",
    nameTh:      "",
    category:    mainCategories[0]?.id ?? "food",
    subCategory: "",
    price:       0,
    available:   true,
    description: "",
  };
  const [form, setForm] = useState<MenuItem>(item ?? blank);

  const availableSubs = subCategories.filter(
    (s) => s.parentCategory === form.category
  );

  function handleSave() {
    if (!form.nameEn.trim()) return;
    // Keep legacy `name` field in sync with nameEn for backward compat
    onSave({ ...form, name: form.nameEn.trim() });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Handle */}
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-charcoal-200 sm:hidden" />
        <div className="flex items-center justify-between border-b border-sage-100 px-6 py-4">
          <h2 className="flex items-center gap-2 text-base font-semibold text-charcoal-800">
            <UtensilsCrossed size={17} className="text-sage-600" />
            {isNew ? t("admin.addItem") : t("admin.editItem")} — F&B
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-charcoal-400 hover:bg-sage-50">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {/* Dual-language names */}
          <div className="rounded-xl border border-sage-100 bg-sage-50/60 p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-sage-600 mb-1">
              <Globe size={13} />
              {t("admin.nameEn")} / {t("admin.nameTh")}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-charcoal-500">{t("admin.nameEn")}</label>
              <input
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                placeholder="e.g. Café Latte"
                className="w-full rounded-lg border border-sage-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-sage-500 focus:ring-2 focus:ring-sage-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-charcoal-500">{t("admin.nameTh")}</label>
              <input
                value={form.nameTh}
                onChange={(e) => setForm({ ...form, nameTh: e.target.value })}
                placeholder="เช่น กาแฟลาเต้"
                className="w-full rounded-lg border border-sage-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-sage-500 focus:ring-2 focus:ring-sage-100"
              />
            </div>
          </div>

          {/* Category selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-charcoal-700">{t("admin.mainCategory")}</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value, subCategory: "" })}
                className="w-full rounded-lg border border-sage-200 bg-sage-50 px-3.5 py-2.5 text-sm outline-none focus:border-sage-500"
              >
                {mainCategories.map(({ id, nameEn, nameTh }) => (
                  <option key={id} value={id}>{nameEn} / {nameTh}</option>
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
                  <option key={s.id} value={s.nameEn}>{s.nameEn} / {s.nameTh}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Price + Availability */}
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

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-medium text-charcoal-700">Description</label>
            <input
              value={form.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-sage-200 bg-sage-50 px-3.5 py-2.5 text-sm outline-none focus:border-sage-500"
            />
          </div>

          {/* Image URL (Supabase Storage) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-charcoal-700">
              Image URL
              <span className="ml-2 text-xs font-normal text-charcoal-400">Supabase Storage public URL</span>
            </label>
            <input
              type="url"
              value={form.imageUrl ?? ""}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value || undefined })}
              placeholder="https://xxx.supabase.co/storage/v1/object/public/menu/..."
              className="w-full rounded-lg border border-sage-200 bg-sage-50 px-3.5 py-2.5 text-sm outline-none focus:border-sage-500"
            />
            {form.imageUrl && (
              <div className="mt-2 h-20 w-28 overflow-hidden rounded-lg border border-sage-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.imageUrl} alt="preview" className="h-full w-full object-cover" />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 rounded-lg border border-sage-200 px-4 py-2.5 text-sm font-medium text-charcoal-600 hover:bg-sage-50">
              {t("common.cancel")}
            </button>
            <button
              onClick={handleSave}
              disabled={!form.nameEn.trim()}
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

// ── Activity Modal ─────────────────────────────────────────────
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
    id: `ACT-NEW-${Date.now()}`, name: "", category: "outdoor",
    price: 0, description: "", maxSlots: 10, duration: "2h",
  };
  const [form, setForm] = useState<Activity>(activity ?? blank);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-sage-100 px-6 py-4">
          <h2 className="text-base font-semibold text-charcoal-800">
            {isNew ? t("admin.addItem") : t("admin.editItem")} — Activity
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-charcoal-400 hover:bg-sage-50"><X size={18} /></button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-charcoal-700">Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-sage-200 bg-sage-50 px-3.5 py-2.5 text-sm outline-none focus:border-sage-500 focus:ring-2 focus:ring-sage-200" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-charcoal-700">{t("admin.category")}</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Activity["category"] })}
                className="w-full rounded-lg border border-sage-200 bg-sage-50 px-3.5 py-2.5 text-sm outline-none focus:border-sage-500">
                {Object.entries(actCategoryLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-charcoal-700">{t("admin.price")}</label>
              <input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-sage-200 bg-sage-50 px-3.5 py-2.5 text-sm outline-none focus:border-sage-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-charcoal-700">{t("admin.maxSlots")}</label>
              <input type="number" min={1} value={form.maxSlots} onChange={(e) => setForm({ ...form, maxSlots: parseInt(e.target.value) || 1 })}
                className="w-full rounded-lg border border-sage-200 bg-sage-50 px-3.5 py-2.5 text-sm outline-none focus:border-sage-500" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-charcoal-700">{t("admin.duration")}</label>
              <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 2h"
                className="w-full rounded-lg border border-sage-200 bg-sage-50 px-3.5 py-2.5 text-sm outline-none focus:border-sage-500" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-charcoal-700">Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-sage-200 bg-sage-50 px-3.5 py-2.5 text-sm outline-none focus:border-sage-500" />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 rounded-lg border border-sage-200 px-4 py-2.5 text-sm font-medium text-charcoal-600 hover:bg-sage-50">{t("common.cancel")}</button>
            <button onClick={() => { if (form.name.trim()) onSave(form); }} disabled={!form.name.trim()}
              className="flex-1 rounded-lg bg-sage-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sage-600 disabled:opacity-50">{t("admin.saveChanges")}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Category Modal ────────────────────────────────────────
function MainCategoryModal({
  category,
  onSave,
  onClose,
}: {
  category: MenuMainCategoryDef | null;
  onSave: (cat: MenuMainCategoryDef) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const isNew = category === null;
  const blank: MenuMainCategoryDef = {
    id:        `cat_${Date.now()}`,
    nameEn:    "",
    nameTh:    "",
    color:     COLOR_OPTIONS[0].value,
    sortOrder: 99,
  };
  const [form, setForm] = useState<MenuMainCategoryDef>(category ?? blank);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-white shadow-xl">
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-charcoal-200 sm:hidden" />
        <div className="flex items-center justify-between border-b border-sage-100 px-6 py-4">
          <h2 className="flex items-center gap-2 text-base font-semibold text-charcoal-800">
            <Tag size={17} className="text-sage-600" />
            {isNew ? t("admin.addMainCategory") : t("admin.editMainCategory")}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-charcoal-400 hover:bg-sage-50"><X size={18} /></button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="rounded-xl border border-sage-100 bg-sage-50/60 p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-sage-600">
              <Globe size={13} />
              {t("admin.nameEn")} / {t("admin.nameTh")}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-charcoal-500">{t("admin.nameEn")}</label>
              <input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                placeholder="e.g. Event Menu"
                className="w-full rounded-lg border border-sage-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-sage-500 focus:ring-2 focus:ring-sage-100" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-charcoal-500">{t("admin.nameTh")}</label>
              <input value={form.nameTh} onChange={(e) => setForm({ ...form, nameTh: e.target.value })}
                placeholder="เช่น เมนูงาน"
                className="w-full rounded-lg border border-sage-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-sage-500 focus:ring-2 focus:ring-sage-100" />
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="mb-2 block text-sm font-medium text-charcoal-700">{t("admin.colorStyle")}</label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setForm({ ...form, color: opt.value })}
                  className={`rounded-lg border-2 px-2 py-1.5 text-xs font-medium transition ${opt.value} ${
                    form.color === opt.value ? "ring-2 ring-sage-400 ring-offset-1" : "border-transparent"
                  }`}
                >
                  {opt.label.split(" ")[0]}
                </button>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${form.color}`}>
                Preview: {form.nameEn || "New"}
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 rounded-lg border border-sage-200 px-4 py-2.5 text-sm font-medium text-charcoal-600 hover:bg-sage-50">{t("common.cancel")}</button>
            <button
              onClick={() => { if (form.nameEn.trim() && form.nameTh.trim()) onSave(form); }}
              disabled={!form.nameEn.trim() || !form.nameTh.trim()}
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

// ── Categories Tab ─────────────────────────────────────────────
function CategoriesTab({
  mainCategories,
  subCategories,
  onMainChange,
  onSubChange,
}: {
  mainCategories: MenuMainCategoryDef[];
  subCategories: MenuSubCategory[];
  onMainChange: (updated: MenuMainCategoryDef[]) => void;
  onSubChange: (updated: MenuSubCategory[]) => void;
}) {
  const { t, locale } = useI18n();
  const [expandedMain, setExpandedMain] = useState<string | null>("food");
  const [newSubNameEn, setNewSubNameEn] = useState("");
  const [newSubNameTh, setNewSubNameTh] = useState("");
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [editingSub, setEditingSub] = useState<MenuSubCategory | null>(null);
  const [editSubEn, setEditSubEn] = useState("");
  const [editSubTh, setEditSubTh] = useState("");
  const [editingMain, setEditingMain] = useState<MenuMainCategoryDef | null>(null);
  const [mainModalOpen, setMainModalOpen] = useState(false);

  function addSubCategory(parentId: string) {
    if (!newSubNameEn.trim()) return;
    const newSub: MenuSubCategory = {
      id:             `SC-${Date.now()}`,
      name:           newSubNameEn.trim(),
      nameEn:         newSubNameEn.trim(),
      nameTh:         newSubNameTh.trim() || newSubNameEn.trim(),
      parentCategory: parentId,
    };
    onSubChange([...subCategories, newSub]);
    setNewSubNameEn("");
    setNewSubNameTh("");
    setAddingTo(null);
  }

  function deleteSubCategory(id: string) {
    onSubChange(subCategories.filter((s) => s.id !== id));
  }

  function saveSubEdit() {
    if (!editingSub || !editSubEn.trim()) return;
    onSubChange(subCategories.map((s) =>
      s.id === editingSub.id
        ? { ...s, name: editSubEn.trim(), nameEn: editSubEn.trim(), nameTh: editSubTh.trim() || s.nameTh }
        : s
    ));
    setEditingSub(null);
  }

  function deleteMainCategory(id: string) {
    onMainChange(mainCategories.filter((c) => c.id !== id));
  }

  function saveMainCategory(cat: MenuMainCategoryDef) {
    const idx = mainCategories.findIndex((c) => c.id === cat.id);
    if (idx >= 0) {
      const next = [...mainCategories]; next[idx] = cat; onMainChange(next);
    } else {
      onMainChange([...mainCategories, cat]);
    }
    setMainModalOpen(false);
    setEditingMain(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-charcoal-400">
          Manage main categories and their sub-categories. Changes reflect in POS and menu editor.
        </p>
        <button
          onClick={() => { setEditingMain(null); setMainModalOpen(true); }}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-sage-700 px-3 py-2 text-sm font-medium text-white hover:bg-sage-600"
        >
          <Plus size={14} />
          {t("admin.addMainCategory")}
        </button>
      </div>

      {mainCategories
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((cat) => {
          const subs = subCategories.filter((s) => s.parentCategory === cat.id);
          const isExpanded = expandedMain === cat.id;
          return (
            <div key={cat.id} className="rounded-xl border border-sage-200 bg-white overflow-hidden shadow-sm">
              {/* Main category header */}
              <div className="flex items-center gap-2 px-5 py-3.5">
                <button
                  onClick={() => setExpandedMain(isExpanded ? null : cat.id)}
                  className="flex flex-1 items-center gap-3 min-w-0"
                >
                  <span className={`shrink-0 rounded-lg border px-2.5 py-0.5 text-xs font-semibold ${cat.color}`}>
                    {locale === "th" ? cat.nameTh : cat.nameEn}
                  </span>
                  <span className="text-sm text-charcoal-500 truncate">
                    {locale === "th" ? cat.nameEn : cat.nameTh}
                    <span className="ml-2 text-charcoal-300">·</span>
                    <span className="ml-1.5 text-charcoal-400">
                      {subs.length} sub-cat{subs.length !== 1 ? "s" : ""}
                    </span>
                  </span>
                  <ChevronRight size={16} className={`ml-auto shrink-0 text-charcoal-400 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                </button>
                {/* Edit / Delete main category */}
                <button
                  onClick={() => { setEditingMain(cat); setMainModalOpen(true); }}
                  className="rounded-lg p-1.5 text-charcoal-400 hover:bg-sage-100 hover:text-charcoal-700"
                  title={t("admin.editMainCategory")}
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => deleteMainCategory(cat.id)}
                  className="rounded-lg p-1.5 text-charcoal-400 hover:bg-red-50 hover:text-red-600"
                  title={t("admin.deleteCategory")}
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Expanded sub-categories */}
              {isExpanded && (
                <div className="border-t border-sage-100 bg-sage-50/40 px-5 py-3 space-y-2">
                  {subs.map((sub) => (
                    <div key={sub.id} className="flex items-center gap-2">
                      {editingSub?.id === sub.id ? (
                        <>
                          <div className="flex flex-1 flex-col gap-1.5">
                            <input value={editSubEn} onChange={(e) => setEditSubEn(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && saveSubEdit()}
                              placeholder="Name (EN)" autoFocus
                              className="rounded-lg border border-sage-300 px-3 py-1.5 text-sm outline-none focus:border-sage-500" />
                            <input value={editSubTh} onChange={(e) => setEditSubTh(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && saveSubEdit()}
                              placeholder="ชื่อ (ภาษาไทย)"
                              className="rounded-lg border border-sage-300 px-3 py-1.5 text-sm outline-none focus:border-sage-500" />
                          </div>
                          <button onClick={saveSubEdit} className="self-end rounded-lg bg-sage-700 px-3 py-1.5 text-xs font-medium text-white">Save</button>
                          <button onClick={() => setEditingSub(null)} className="self-end rounded-lg border border-sage-200 px-3 py-1.5 text-xs text-charcoal-500">Cancel</button>
                        </>
                      ) : (
                        <>
                          <div className="flex flex-1 flex-col rounded-lg bg-white px-3 py-2 shadow-sm border border-sage-100">
                            <span className="text-sm font-medium text-charcoal-700">{sub.nameEn}</span>
                            <span className="text-xs text-charcoal-400">{sub.nameTh}</span>
                          </div>
                          <button
                            onClick={() => { setEditingSub(sub); setEditSubEn(sub.nameEn); setEditSubTh(sub.nameTh); }}
                            className="rounded-lg p-1.5 text-charcoal-400 hover:bg-sage-100 hover:text-charcoal-700"
                          ><Pencil size={14} /></button>
                          <button onClick={() => deleteSubCategory(sub.id)}
                            className="rounded-lg p-1.5 text-charcoal-400 hover:bg-red-50 hover:text-red-600"
                          ><Trash2 size={14} /></button>
                        </>
                      )}
                    </div>
                  ))}

                  {/* Add new sub-category */}
                  {addingTo === cat.id ? (
                    <div className="space-y-2 pt-1">
                      <input value={newSubNameEn} onChange={(e) => setNewSubNameEn(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addSubCategory(cat.id)}
                        placeholder="Name (EN) — e.g. Iced Coffee" autoFocus
                        className="w-full rounded-lg border border-sage-300 px-3 py-1.5 text-sm outline-none focus:border-sage-500" />
                      <input value={newSubNameTh} onChange={(e) => setNewSubNameTh(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addSubCategory(cat.id)}
                        placeholder="ชื่อ (ภาษาไทย) — เช่น กาแฟเย็น"
                        className="w-full rounded-lg border border-sage-300 px-3 py-1.5 text-sm outline-none focus:border-sage-500" />
                      <div className="flex gap-2">
                        <button onClick={() => addSubCategory(cat.id)} disabled={!newSubNameEn.trim()}
                          className="rounded-lg bg-sage-700 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50">Add</button>
                        <button onClick={() => { setAddingTo(null); setNewSubNameEn(""); setNewSubNameTh(""); }}
                          className="rounded-lg border border-sage-200 px-3 py-1.5 text-xs text-charcoal-500">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setAddingTo(cat.id)}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-sage-600 hover:bg-white hover:shadow-sm">
                      <Plus size={14} />
                      {t("admin.addSubCategory")}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

      {/* Main Category Modal */}
      {mainModalOpen && (
        <MainCategoryModal
          category={editingMain}
          onSave={saveMainCategory}
          onClose={() => { setMainModalOpen(false); setEditingMain(null); }}
        />
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
type AdminTab = "menu" | "activities" | "categories";

export default function AdminPage() {
  const { t, locale } = useI18n();
  const { hasRole } = useAuth();

  // ── Global shared data from context ──
  const {
    menuItems:          menuList,
    activities:         actList,
    menuMainCategories: mainCategories,
    menuSubCategories:  subCategories,
    upsertMenuItem,
    deleteMenuItem,
    upsertActivity,
    upsertMainCategory,
    deleteMainCategory,
    upsertSubCategory,
    deleteSubCategory,
  } = useMockData();

  // ── Local UI state ──
  const [activeTab, setActiveTab]         = useState<AdminTab>("menu");
  const [editingMenu, setEditingMenu]     = useState<MenuItem | null>(null);
  const [editingAct, setEditingAct]       = useState<Activity | null>(null);
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [actModalOpen, setActModalOpen]   = useState(false);

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
    upsertMenuItem(updated);
    setMenuModalOpen(false);
  }

  function saveActivity(updated: Activity) {
    upsertActivity(updated);
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
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${
              activeTab === key ? "border-sage-600 text-sage-700" : "border-transparent text-charcoal-500 hover:text-charcoal-700"
            }`}>
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Menu Tab ── */}
      {activeTab === "menu" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => { setEditingMenu(null); setMenuModalOpen(true); }}
              className="flex items-center gap-2 rounded-lg bg-sage-700 px-4 py-2 text-sm font-medium text-white hover:bg-sage-600">
              <Plus size={16} />
              {t("admin.addItem")}
            </button>
          </div>
          <div className="rounded-xl border border-sage-200 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sage-100 bg-sage-50 text-xs font-semibold text-charcoal-500">
                  <th className="px-5 py-3 text-left">Name (EN / TH)</th>
                  <th className="px-4 py-3 text-left">{t("admin.mainCategory")}</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">{t("admin.subCategory")}</th>
                  <th className="px-4 py-3 text-right">{t("admin.price")}</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-100">
                {menuList.map((item) => {
                  const mainCat = mainCategories.find((c) => c.id === item.category);
                  return (
                    <tr key={item.id} className="hover:bg-sage-50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-charcoal-800">{item.nameEn || item.name}</p>
                        <p className="text-xs text-charcoal-400">{item.nameTh || "—"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${mainCat?.color ?? "bg-charcoal-100 text-charcoal-500"}`}>
                          {mainCat ? (locale === "th" ? mainCat.nameTh : mainCat.nameEn) : item.category}
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
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setEditingMenu(item); setMenuModalOpen(true); }}
                            className="rounded-lg p-1.5 text-charcoal-400 hover:bg-sage-100 hover:text-charcoal-700">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => deleteMenuItem(item.id)}
                            className="rounded-lg p-1.5 text-charcoal-400 hover:bg-red-50 hover:text-red-600"
                            title="Delete item">
                            <Trash2 size={14} />
                          </button>
                        </div>
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
            <button onClick={() => { setEditingAct(null); setActModalOpen(true); }}
              className="flex items-center gap-2 rounded-lg bg-sage-700 px-4 py-2 text-sm font-medium text-white hover:bg-sage-600">
              <Plus size={16} />
              {t("admin.addItem")}
            </button>
          </div>
          <div className="rounded-xl border border-sage-200 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sage-100 bg-sage-50 text-xs font-semibold text-charcoal-500">
                  <th className="px-5 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">{t("admin.category")}</th>
                  <th className="px-4 py-3 text-right">{t("admin.price")}</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">{t("admin.maxSlots")}</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">{t("admin.duration")}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-100">
                {actList.map((act) => (
                  <tr key={act.id} className="hover:bg-sage-50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-charcoal-800">{act.name}</p>
                      {act.description && <p className="text-xs text-charcoal-400 truncate max-w-[200px]">{act.description}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {actCategoryLabels[act.category]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-charcoal-700">
                      {act.price === 0 ? <span className="text-emerald-600">{t("common.free")}</span> : `฿${act.price}`}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-charcoal-500">{act.maxSlots}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-charcoal-500">{act.duration}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => { setEditingAct(act); setActModalOpen(true); }}
                        className="rounded-lg p-1.5 text-charcoal-400 hover:bg-sage-100 hover:text-charcoal-700">
                        <Pencil size={14} />
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
        <CategoriesTab
          mainCategories={mainCategories}
          subCategories={subCategories}
          onMainChange={(updated) => {
            // Diff against current list to determine upserts vs deletes
            const updatedIds = new Set(updated.map((c) => c.id));
            mainCategories.forEach((c) => {
              if (!updatedIds.has(c.id)) deleteMainCategory(c.id);
            });
            updated.forEach((c) => upsertMainCategory(c));
          }}
          onSubChange={(updated) => {
            const updatedIds = new Set(updated.map((s) => s.id));
            subCategories.forEach((s) => {
              if (!updatedIds.has(s.id)) deleteSubCategory(s.id);
            });
            updated.forEach((s) => upsertSubCategory(s));
          }}
        />
      )}

      {/* Modals */}
      {menuModalOpen && (
        <MenuItemModal
          item={editingMenu}
          mainCategories={mainCategories}
          subCategories={subCategories}
          onSave={saveMenuItem}
          onClose={() => { setMenuModalOpen(false); setEditingMenu(null); }}
        />
      )}
      {actModalOpen && (
        <ActivityModal
          activity={editingAct}
          onSave={saveActivity}
          onClose={() => { setActModalOpen(false); setEditingAct(null); }}
        />
      )}
    </div>
  );
}
