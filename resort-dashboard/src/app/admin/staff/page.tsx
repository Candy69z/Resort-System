"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  X,
  Shield,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import {
  fetchStaffProfiles,
  upsertStaffProfileToDB,
  deleteStaffProfileFromDB,
} from "@/lib/db";
import type { StaffProfile, UserRole, Department } from "@/lib/types";
import { withAdminRole } from "@/lib/withRole";

// ── Constants ──────────────────────────────────────────────────

const ROLES: UserRole[] = ["admin", "manager", "staff"];
const DEPARTMENTS: Department[] = [
  "frontdesk", "housekeeping", "fnb", "activities", "admin", "general",
];

const roleMeta: Record<UserRole, { label: string; color: string }> = {
  admin:   { label: "Admin",   color: "bg-red-50 text-red-700 border border-red-200" },
  manager: { label: "Manager", color: "bg-amber-50 text-amber-700 border border-amber-200" },
  staff:   { label: "Staff",   color: "bg-sage-100 text-sage-700 border border-sage-200" },
};

const deptMeta: Record<Department, { label: string; color: string }> = {
  frontdesk:   { label: "Front Desk",   color: "bg-blue-50 text-blue-700" },
  housekeeping: { label: "Housekeeping", color: "bg-cyan-50 text-cyan-700" },
  fnb:         { label: "F&B",          color: "bg-wood-50 text-wood-700" },
  activities:  { label: "Activities",   color: "bg-emerald-50 text-emerald-700" },
  admin:       { label: "Admin",        color: "bg-charcoal-100 text-charcoal-600" },
  general:     { label: "General",      color: "bg-sage-50 text-sage-600" },
};

// ── Blank staff factory ────────────────────────────────────────

function blankStaff(): StaffProfile {
  return {
    id:             crypto.randomUUID(),
    username:       "",
    name:           "",
    role:           "staff",
    department:     "general",
    avatarInitials: "",
    isActive:       true,
    passwordPlain:  "",
    createdAt:      new Date().toISOString(),
  };
}

function deriveInitials(name: string): string {
  return name.trim().split(" ").map((w) => w[0]?.toUpperCase() ?? "").slice(0, 2).join("");
}

// ── Staff Modal ────────────────────────────────────────────────

function StaffModal({
  staff,
  isNew,
  onSave,
  onClose,
}: {
  staff: StaffProfile;
  isNew: boolean;
  onSave: (updated: StaffProfile) => void;
  onClose: () => void;
}) {
  const [form, setForm]         = useState<StaffProfile>(staff);
  const [showPwd, setShowPwd]   = useState(false);

  function set<K extends keyof StaffProfile>(key: K, value: StaffProfile[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      // Auto-derive initials from name
      if (key === "name") {
        next.avatarInitials = deriveInitials(value as string);
      }
      return next;
    });
  }

  function handleSave() {
    if (!form.username.trim() || !form.name.trim()) return;
    onSave({ ...form, name: form.name.trim(), username: form.username.trim().toLowerCase() });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-charcoal-200 sm:hidden" />
        <div className="flex items-center justify-between border-b border-sage-100 px-6 py-4">
          <h2 className="flex items-center gap-2 text-base font-semibold text-charcoal-800">
            <Users size={17} className="text-sage-600" />
            {isNew ? "Add Staff Member" : "Edit Staff Profile"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-charcoal-400 hover:bg-sage-50">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {/* Name + Avatar preview */}
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sage-600 text-base font-bold text-white">
              {form.avatarInitials || "?"}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-charcoal-600 mb-1">Full Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Khun Somchai Dee"
                className="w-full rounded-lg border border-sage-200 px-3 py-2 text-sm text-charcoal-700 placeholder:text-charcoal-300 focus:border-sage-400 focus:outline-none focus:ring-1 focus:ring-sage-400"
              />
            </div>
          </div>

          {/* Thai Name */}
          <div>
            <label className="block text-sm font-medium text-charcoal-600 mb-1">Name (Thai)</label>
            <input
              type="text"
              value={form.nameTh ?? ""}
              onChange={(e) => set("nameTh", e.target.value || undefined)}
              placeholder="คุณสมชาย ดี"
              className="w-full rounded-lg border border-sage-200 px-3 py-2 text-sm text-charcoal-700 placeholder:text-charcoal-300 focus:border-sage-400 focus:outline-none focus:ring-1 focus:ring-sage-400"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-charcoal-600 mb-1">Username *</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => set("username", e.target.value)}
              placeholder="somchai01"
              autoCapitalize="none"
              className="w-full rounded-lg border border-sage-200 px-3 py-2 text-sm text-charcoal-700 placeholder:text-charcoal-300 focus:border-sage-400 focus:outline-none focus:ring-1 focus:ring-sage-400"
            />
          </div>

          {/* Password (dev-only) */}
          <div>
            <label className="block text-sm font-medium text-charcoal-600 mb-1">
              Password
              <span className="ml-2 text-xs font-normal text-charcoal-400">(dev only — use Supabase Auth in production)</span>
            </label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={form.passwordPlain ?? ""}
                onChange={(e) => set("passwordPlain", e.target.value || undefined)}
                placeholder={isNew ? "Set initial password" : "Leave blank to keep existing"}
                className="w-full rounded-lg border border-sage-200 px-3 py-2 pr-10 text-sm text-charcoal-700 placeholder:text-charcoal-300 focus:border-sage-400 focus:outline-none focus:ring-1 focus:ring-sage-400"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600"
              >
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Role + Department */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-600 mb-1">Role</label>
              <select
                value={form.role}
                onChange={(e) => set("role", e.target.value as UserRole)}
                className="w-full rounded-lg border border-sage-200 px-3 py-2 text-sm text-charcoal-700 focus:border-sage-400 focus:outline-none"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{roleMeta[r].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-600 mb-1">Department</label>
              <select
                value={form.department}
                onChange={(e) => set("department", e.target.value as Department)}
                className="w-full rounded-lg border border-sage-200 px-3 py-2 text-sm text-charcoal-700 focus:border-sage-400 focus:outline-none"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{deptMeta[d].label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Phone + Active */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-600 mb-1">Phone</label>
              <input
                type="tel"
                value={form.phone ?? ""}
                onChange={(e) => set("phone", e.target.value || undefined)}
                placeholder="08X-XXX-XXXX"
                className="w-full rounded-lg border border-sage-200 px-3 py-2 text-sm text-charcoal-700 placeholder:text-charcoal-300 focus:border-sage-400 focus:outline-none focus:ring-1 focus:ring-sage-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-600 mb-1">Status</label>
              <button
                type="button"
                onClick={() => set("isActive", !form.isActive)}
                className={`w-full rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  form.isActive
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-charcoal-100 text-charcoal-500 border-charcoal-200"
                }`}
              >
                {form.isActive ? "Active" : "Inactive"}
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-charcoal-600 mb-1">Notes</label>
            <textarea
              rows={2}
              value={form.notes ?? ""}
              onChange={(e) => set("notes", e.target.value || undefined)}
              placeholder="Optional notes about this staff member…"
              className="w-full rounded-lg border border-sage-200 px-3 py-2 text-sm text-charcoal-700 placeholder:text-charcoal-300 focus:border-sage-400 focus:outline-none focus:ring-1 focus:ring-sage-400 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-sage-100 px-6 py-4">
          <button onClick={onClose} className="rounded-lg border border-sage-200 px-4 py-2 text-sm font-medium text-charcoal-600 hover:bg-sage-50">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!form.username.trim() || !form.name.trim()}
            className="rounded-lg bg-sage-600 px-5 py-2 text-sm font-semibold text-white hover:bg-sage-700 disabled:opacity-50"
          >
            {isNew ? "Create Account" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────

function AdminStaffPage() {
  const [staffList, setStaffList] = useState<StaffProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<StaffProfile | "new" | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Fetch staff on mount
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchStaffProfiles()
      .then((data) => { if (!cancelled) setStaffList(data); })
      .catch((err) => console.warn("[staff] fetch error:", err))
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  function handleSaveStaff(updated: StaffProfile) {
    setStaffList((prev) => {
      const idx = prev.findIndex((s) => s.id === updated.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updated;
        return next;
      }
      return [updated, ...prev];
    });
    void upsertStaffProfileToDB(updated);
    setEditTarget(null);
  }

  function handleDeleteStaff(id: string) {
    setStaffList((prev) => prev.filter((s) => s.id !== id));
    void deleteStaffProfileFromDB(id);
    setDeleteConfirm(null);
  }

  // Stats
  const activeCount   = staffList.filter((s) => s.isActive).length;
  const adminCount    = staffList.filter((s) => s.role === "admin").length;
  const managerCount  = staffList.filter((s) => s.role === "manager").length;
  const staffCount    = staffList.filter((s) => s.role === "staff").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-charcoal-800">Staff Management</h1>
          <p className="text-sm text-charcoal-400">Register staff accounts, assign roles & departments</p>
        </div>
        <button
          onClick={() => setEditTarget("new")}
          className="inline-flex items-center gap-2 rounded-lg bg-sage-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-sage-700"
        >
          <Plus size={16} /> Add Staff Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total Staff",  value: staffList.length, color: "text-charcoal-800" },
          { label: "Active",       value: activeCount,      color: "text-emerald-600" },
          { label: "Admin / Mgr",  value: `${adminCount} / ${managerCount}`, color: "text-red-600" },
          { label: "Staff",        value: staffCount,       color: "text-sage-700" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-sage-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-charcoal-400">{label}</p>
            <p className={`mt-1 text-2xl font-semibold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* RBAC Info Banner */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <Shield size={18} className="mt-0.5 shrink-0 text-blue-600" />
          <div>
            <p className="text-sm font-semibold text-blue-800">Role-Based Access Control</p>
            <p className="mt-0.5 text-xs text-blue-600">
              <strong>Admin:</strong> Full access to all pages including /admin, /reports, /inventory. &nbsp;
              <strong>Manager:</strong> Access to /reports and all operational pages. &nbsp;
              <strong>Staff:</strong> Operational pages only (dashboard, pos, bookings, housekeeping).
            </p>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="rounded-xl border border-sage-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-charcoal-400">
            <RefreshCw size={16} className="animate-spin" /> Loading staff…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sage-100 text-left text-xs text-charcoal-400 bg-sage-50/40">
                  <th className="px-5 py-3 font-medium">Staff Member</th>
                  <th className="px-5 py-3 font-medium">Username</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Department</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-100">
                {staffList.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-sm text-charcoal-300">
                      No staff profiles found. Connect Supabase or add staff manually.
                    </td>
                  </tr>
                )}
                {staffList.map((staff) => (
                  <tr key={staff.id} className="hover:bg-sage-50/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${staff.isActive ? "bg-sage-600" : "bg-charcoal-300"}`}>
                          {staff.avatarInitials}
                        </div>
                        <div>
                          <p className="font-medium text-charcoal-700">{staff.name}</p>
                          {staff.nameTh && <p className="text-xs text-charcoal-400">{staff.nameTh}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-charcoal-600">{staff.username}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${roleMeta[staff.role].color}`}>
                        {roleMeta[staff.role].label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${deptMeta[staff.department].color}`}>
                        {deptMeta[staff.department].label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${staff.isActive ? "bg-emerald-50 text-emerald-700" : "bg-charcoal-100 text-charcoal-500"}`}>
                        {staff.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-charcoal-500">{staff.phone ?? "—"}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditTarget(staff)}
                          className="rounded-lg border border-sage-200 p-1.5 text-sage-700 hover:bg-sage-50 transition"
                          title="Edit"
                        >
                          <Pencil size={13} />
                        </button>
                        {deleteConfirm === staff.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDeleteStaff(staff.id)}
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
                            onClick={() => setDeleteConfirm(staff.id)}
                            className="rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50 transition"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {editTarget !== null && (
        <StaffModal
          staff={editTarget === "new" ? blankStaff() : editTarget}
          isNew={editTarget === "new"}
          onSave={handleSaveStaff}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  );
}

export default withAdminRole(AdminStaffPage);
