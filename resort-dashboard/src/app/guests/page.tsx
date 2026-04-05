"use client";

import { useState } from "react";
import { Users, Search, Star, Phone, StickyNote, Calendar, TrendingUp } from "lucide-react";
import { guestProfiles } from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n";
import type { GuestProfile, MembershipTier } from "@/lib/types";

function TierBadge({ tier }: { tier: MembershipTier }) {
  const config: Record<MembershipTier, { label: string; cls: string }> = {
    gold: { label: "Gold", cls: "bg-amber-100 text-amber-800 ring-1 ring-amber-300" },
    silver: { label: "Silver", cls: "bg-slate-100 text-slate-700 ring-1 ring-slate-300" },
    standard: { label: "Standard", cls: "bg-sage-100 text-sage-700" },
  };
  const { label, cls } = config[tier];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {tier !== "standard" && <Star size={10} className="fill-current" />}
      {label}
    </span>
  );
}

function GuestDetailModal({ guest, onClose }: { guest: GuestProfile; onClose: () => void }) {
  const { t } = useI18n();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-sage-100 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sage-700 text-lg font-bold text-white">
              {guest.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-charcoal-800">{guest.name}</h2>
              <div className="mt-0.5 flex items-center gap-2">
                <TierBadge tier={guest.membershipTier} />
                {guest.nationality && (
                  <span className="text-xs text-charcoal-400">{guest.nationality}</span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-charcoal-400 hover:bg-sage-50 hover:text-charcoal-600"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Phone size={14} className="text-charcoal-400" />
              <span className="text-charcoal-700">{guest.phone}</span>
            </div>
            {guest.email && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-xs text-charcoal-400">✉</span>
                <span className="text-charcoal-700">{guest.email}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={14} className="text-charcoal-400" />
              <span className="text-charcoal-500">First visit:</span>
              <span className="text-charcoal-700">{guest.firstVisit ?? "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={14} className="text-charcoal-400" />
              <span className="text-charcoal-500">Last visit:</span>
              <span className="text-charcoal-700">{guest.lastVisit ?? "—"}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-lg bg-sage-50 p-3">
              <p className="text-xs text-charcoal-400">{t("guests.visits")}</p>
              <p className="text-2xl font-semibold text-charcoal-800">{guest.visitCount}</p>
            </div>
            <div className="rounded-lg bg-wood-50 p-3">
              <p className="text-xs text-charcoal-400">{t("guests.totalSpend")}</p>
              <p className="text-xl font-semibold text-charcoal-800">
                ฿{guest.totalSpend.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {guest.notes && (
          <div className="border-t border-sage-100 px-6 py-4">
            <div className="flex items-start gap-2">
              <StickyNote size={14} className="mt-0.5 shrink-0 text-charcoal-400" />
              <div>
                <p className="mb-1 text-xs font-medium text-charcoal-500">{t("guests.notes")}</p>
                <p className="text-sm text-charcoal-700">{guest.notes}</p>
              </div>
            </div>
          </div>
        )}

        {guest.preferredRoom && (
          <div className="border-t border-sage-100 px-6 py-4">
            <p className="text-xs text-charcoal-500">Preferred room: <span className="font-semibold text-charcoal-700">{guest.preferredRoom}</span></p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GuestsPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [filterTier, setFilterTier] = useState<MembershipTier | "all">("all");
  const [selected, setSelected] = useState<GuestProfile | null>(null);

  const filtered = guestProfiles.filter((g) => {
    const matchSearch =
      !search ||
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.phone.includes(search);
    const matchTier = filterTier === "all" || g.membershipTier === filterTier;
    return matchSearch && matchTier;
  });

  const goldCount = guestProfiles.filter((g) => g.membershipTier === "gold").length;
  const silverCount = guestProfiles.filter((g) => g.membershipTier === "silver").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-charcoal-800">{t("guests.title")}</h1>
        <p className="text-sm text-charcoal-400">{t("guests.subtitle")}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-sage-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-charcoal-400 mb-1">
            <Users size={15} />
            <span className="text-xs">Total Guests</span>
          </div>
          <p className="text-2xl font-semibold text-charcoal-800">{guestProfiles.length}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <Star size={15} className="fill-amber-500" />
            <span className="text-xs font-medium">Gold Members</span>
          </div>
          <p className="text-2xl font-semibold text-charcoal-800">{goldCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <TrendingUp size={15} />
            <span className="text-xs font-medium">Silver Members</span>
          </div>
          <p className="text-2xl font-semibold text-charcoal-800">{silverCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
          <input
            type="text"
            placeholder={`${t("common.search")} name / phone…`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-sage-200 bg-white py-2 pl-9 pr-4 text-sm text-charcoal-800 outline-none focus:border-sage-500 focus:ring-2 focus:ring-sage-200"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "gold", "silver", "standard"] as const).map((tier) => (
            <button
              key={tier}
              onClick={() => setFilterTier(tier)}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                filterTier === tier
                  ? "bg-sage-700 text-white"
                  : "border border-sage-200 bg-white text-charcoal-600 hover:bg-sage-50"
              }`}
            >
              {tier === "all" ? "All" : tier.charAt(0).toUpperCase() + tier.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Guest table */}
      <div className="rounded-xl border border-sage-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-sage-100 bg-sage-50 text-xs font-semibold text-charcoal-500">
              <th className="px-5 py-3 text-left">Guest</th>
              <th className="px-4 py-3 text-left">{t("guests.phone")}</th>
              <th className="px-4 py-3 text-left">{t("guests.membershipTier")}</th>
              <th className="px-4 py-3 text-right">{t("guests.visits")}</th>
              <th className="px-4 py-3 text-right">{t("guests.totalSpend")}</th>
              <th className="px-4 py-3 text-left">{t("guests.lastVisit")}</th>
              <th className="px-4 py-3 text-left hidden lg:table-cell">{t("guests.notes")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sage-100">
            {filtered.map((g) => (
              <tr
                key={g.id}
                onClick={() => setSelected(g)}
                className="cursor-pointer transition hover:bg-sage-50"
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage-700 text-xs font-bold text-white">
                      {g.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-charcoal-800">{g.name}</p>
                      {g.nationality && <p className="text-xs text-charcoal-400">{g.nationality}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-charcoal-600">{g.phone}</td>
                <td className="px-4 py-3">
                  <TierBadge tier={g.membershipTier} />
                </td>
                <td className="px-4 py-3 text-right font-semibold text-charcoal-700">{g.visitCount}</td>
                <td className="px-4 py-3 text-right font-semibold text-charcoal-700">
                  ฿{g.totalSpend.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-charcoal-500">{g.lastVisit ?? "—"}</td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  {g.notes ? (
                    <p className="max-w-xs truncate text-xs text-charcoal-400">{g.notes}</p>
                  ) : (
                    <span className="text-xs text-charcoal-300">—</span>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-sm text-charcoal-300">
                  {t("common.noData")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <GuestDetailModal guest={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
