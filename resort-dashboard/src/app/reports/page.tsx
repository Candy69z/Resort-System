"use client";

import { useState } from "react";
import {
  Calendar,
  Download,
  TrendingUp,
  Banknote,
  CreditCard,
  Smartphone,
  BedDouble,
  UtensilsCrossed,
  Coffee,
  Wine,
  TreePine,
  Award,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { exportReportToExcel, buildMockReportRows } from "@/lib/export";
import { topFnbSales } from "@/lib/mock-data";
import type { MenuMainCategory } from "@/lib/types";

type DateRange = "today" | "week" | "month" | "custom";

const categoryConfig: Record<MenuMainCategory, { label: string; bg: string; text: string; bar: string }> = {
  coffee:  { label: "Coffee & Tea", bg: "bg-wood-100",   text: "text-wood-700",   bar: "bg-wood-500"   },
  tea:     { label: "Tea",          bg: "bg-amber-100",  text: "text-amber-700",  bar: "bg-amber-500"  },
  cocktail:{ label: "Cocktail",     bg: "bg-purple-100", text: "text-purple-700", bar: "bg-purple-500" },
  food:    { label: "Food",         bg: "bg-orange-100", text: "text-orange-700", bar: "bg-orange-500" },
  special: { label: "Special",      bg: "bg-sage-100",   text: "text-sage-700",   bar: "bg-sage-500"   },
};

// Mock report data — in production this would come from API aggregation
const reportData = {
  today: {
    totalRevenue: 12_450,
    rooms: { revenue: 8_200, txns: 6 },
    fnb: {
      coffee: { revenue: 1_150, txns: 14 },
      bar: { revenue: 1_380, txns: 8 },
      food: { revenue: 770, txns: 9 },
    },
    activities: { revenue: 950, txns: 4 },
    payments: {
      cash: { amount: 2_890, txns: 8 },
      credit_card: { amount: 1_460, txns: 3 },
      promptpay: { amount: 8_100, txns: 18 },
    },
  },
  week: {
    totalRevenue: 78_350,
    rooms: { revenue: 52_800, txns: 28 },
    fnb: {
      coffee: { revenue: 7_200, txns: 86 },
      bar: { revenue: 8_950, txns: 42 },
      food: { revenue: 5_400, txns: 55 },
    },
    activities: { revenue: 4_000, txns: 12 },
    payments: {
      cash: { amount: 15_670, txns: 45 },
      credit_card: { amount: 8_230, txns: 18 },
      promptpay: { amount: 54_450, txns: 110 },
    },
  },
  month: {
    totalRevenue: 328_900,
    rooms: { revenue: 218_400, txns: 112 },
    fnb: {
      coffee: { revenue: 31_200, txns: 380 },
      bar: { revenue: 38_500, txns: 185 },
      food: { revenue: 22_800, txns: 240 },
    },
    activities: { revenue: 18_000, txns: 52 },
    payments: {
      cash: { amount: 65_780, txns: 198 },
      credit_card: { amount: 32_890, txns: 72 },
      promptpay: { amount: 230_230, txns: 480 },
    },
  },
};

export default function ReportsPage() {
  const { t } = useI18n();
  const [range, setRange] = useState<DateRange>("today");
  const [customFrom, setCustomFrom] = useState("2026-04-01");
  const [customTo, setCustomTo] = useState("2026-04-03");

  const data = range === "custom" ? reportData.month : reportData[range];
  const fnbTotal = data.fnb.coffee.revenue + data.fnb.bar.revenue + data.fnb.food.revenue;

  const revenueRows = [
    { label: "Room Revenue", icon: BedDouble, amount: data.rooms.revenue, txns: data.rooms.txns, color: "text-sage-700" },
    { label: "F&B — Coffee & Tea", icon: Coffee, amount: data.fnb.coffee.revenue, txns: data.fnb.coffee.txns, color: "text-wood-700" },
    { label: "F&B — Bar / Cocktails", icon: Wine, amount: data.fnb.bar.revenue, txns: data.fnb.bar.txns, color: "text-purple-700" },
    { label: "F&B — Food", icon: UtensilsCrossed, amount: data.fnb.food.revenue, txns: data.fnb.food.txns, color: "text-amber-700" },
    { label: "Activities & Events", icon: TreePine, amount: data.activities.revenue, txns: data.activities.txns, color: "text-blue-700" },
  ];

  const paymentRows = [
    { label: t("pay.cash"), icon: Banknote, amount: data.payments.cash.amount, txns: data.payments.cash.txns, color: "bg-emerald-100 text-emerald-700" },
    { label: t("pay.credit"), icon: CreditCard, amount: data.payments.credit_card.amount, txns: data.payments.credit_card.txns, color: "bg-blue-100 text-blue-700" },
    { label: t("pay.promptpay"), icon: Smartphone, amount: data.payments.promptpay.amount, txns: data.payments.promptpay.txns, color: "bg-purple-100 text-purple-700" },
  ];

  const handleExport = () => {
    const rangeLabels: Record<DateRange, string> = {
      today: "today",
      week: "week",
      month: "month",
      custom: `${customFrom}-to-${customTo}`,
    };
    const rows = buildMockReportRows(range);
    exportReportToExcel(rows, rangeLabels[range]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-charcoal-800">{t("rpt.title")}</h1>
          <p className="text-sm text-charcoal-400">{t("rpt.subtitle")}</p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-lg bg-sage-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sage-700"
        >
          <Download size={16} />
          {t("rpt.export")}
        </button>
      </div>

      {/* Date Range Picker */}
      <div className="flex flex-wrap items-center gap-2">
        {(["today", "week", "month", "custom"] as DateRange[]).map((r) => {
          const labels: Record<DateRange, string> = {
            today: t("rpt.today"),
            week: t("rpt.thisWeek"),
            month: t("rpt.thisMonth"),
            custom: t("rpt.custom"),
          };
          return (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                range === r
                  ? "bg-sage-600 text-white"
                  : "border border-sage-200 bg-white text-charcoal-600 hover:bg-sage-50"
              }`}
            >
              <Calendar size={14} />
              {labels[r]}
            </button>
          );
        })}
        {range === "custom" && (
          <div className="flex items-center gap-2 ml-2">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="rounded-lg border border-sage-200 px-3 py-2 text-sm text-charcoal-700 focus:border-sage-400 focus:outline-none"
            />
            <span className="text-charcoal-400">→</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="rounded-lg border border-sage-200 px-3 py-2 text-sm text-charcoal-700 focus:border-sage-400 focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Total Revenue Card */}
      <div className="rounded-xl border border-sage-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-sage-100 p-3">
            <TrendingUp size={24} className="text-sage-700" />
          </div>
          <div>
            <p className="text-sm text-charcoal-400">{t("common.total")} {t("dash.revenue")}</p>
            <p className="text-3xl font-bold text-charcoal-800">
              ฿{data.totalRevenue.toLocaleString()}
            </p>
          </div>
        </div>
        {/* Revenue bar chart */}
        <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full">
          <div className="bg-sage-500" style={{ width: `${(data.rooms.revenue / data.totalRevenue) * 100}%` }} />
          <div className="bg-wood-400" style={{ width: `${(fnbTotal / data.totalRevenue) * 100}%` }} />
          <div className="bg-blue-400" style={{ width: `${(data.activities.revenue / data.totalRevenue) * 100}%` }} />
        </div>
        <div className="mt-2 flex gap-4 text-xs text-charcoal-400">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-sage-500" /> Rooms {((data.rooms.revenue / data.totalRevenue) * 100).toFixed(0)}%</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-wood-400" /> F&B {((fnbTotal / data.totalRevenue) * 100).toFixed(0)}%</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-400" /> Activities {((data.activities.revenue / data.totalRevenue) * 100).toFixed(0)}%</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Breakdown Table */}
        <div className="rounded-xl border border-sage-200 bg-white shadow-sm">
          <div className="border-b border-sage-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-charcoal-700">{t("rpt.revenueBreakdown")}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sage-100 text-left text-xs text-charcoal-400">
                  <th className="px-5 py-3 font-medium">{t("rpt.category")}</th>
                  <th className="px-5 py-3 font-medium text-right">{t("rpt.amount")}</th>
                  <th className="px-5 py-3 font-medium text-right">{t("rpt.txns")}</th>
                  <th className="px-5 py-3 font-medium text-right">{t("rpt.share")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-100">
                {revenueRows.map((row) => {
                  const Icon = row.icon;
                  const share = ((row.amount / data.totalRevenue) * 100).toFixed(1);
                  return (
                    <tr key={row.label} className="hover:bg-sage-50/50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Icon size={15} className={row.color} />
                          <span className="text-charcoal-700">{row.label}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-charcoal-700">
                        ฿{row.amount.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-right text-charcoal-500">{row.txns}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-1.5 w-16 rounded-full bg-sage-100">
                            <div
                              className="h-1.5 rounded-full bg-sage-500"
                              style={{ width: `${share}%` }}
                            />
                          </div>
                          <span className="text-xs text-charcoal-500 w-10 text-right">{share}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-sage-200 bg-sage-50/50">
                  <td className="px-5 py-3 font-semibold text-charcoal-800">{t("common.total")}</td>
                  <td className="px-5 py-3 text-right font-semibold text-charcoal-800">
                    ฿{data.totalRevenue.toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-right text-charcoal-500">
                    {revenueRows.reduce((s, r) => s + r.txns, 0)}
                  </td>
                  <td className="px-5 py-3 text-right text-xs text-charcoal-500">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Payment Method Breakdown */}
        <div className="rounded-xl border border-sage-200 bg-white shadow-sm">
          <div className="border-b border-sage-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-charcoal-700">{t("rpt.paymentBreakdown")}</h2>
          </div>
          <div className="p-5 space-y-4">
            {paymentRows.map((row) => {
              const Icon = row.icon;
              const share = ((row.amount / data.totalRevenue) * 100).toFixed(1);
              return (
                <div key={row.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`rounded-lg p-2 ${row.color}`}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-charcoal-700">{row.label}</p>
                        <p className="text-xs text-charcoal-400">{row.txns} transactions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-charcoal-700">
                        ฿{row.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-charcoal-400">{share}%</p>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-sage-100">
                    <div
                      className={`h-2 rounded-full ${
                        row.label.includes("Cash") ? "bg-emerald-500" :
                        row.label.includes("Credit") || row.label.includes("บัตร") ? "bg-blue-500" : "bg-purple-500"
                      }`}
                      style={{ width: `${share}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {/* Summary */}
          <div className="border-t border-sage-100 px-5 py-4">
            <div className="rounded-lg bg-purple-50 p-3">
              <p className="text-xs text-purple-600 font-medium">
                PromptPay accounts for {((data.payments.promptpay.amount / data.totalRevenue) * 100).toFixed(0)}% of all payments
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top F&B Sales */}
      <div className="rounded-xl border border-sage-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-sage-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-amber-100 p-2">
              <Award size={18} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-charcoal-700">{t("rpt.topSales")}</h2>
              <p className="text-xs text-charcoal-400">{t("rpt.topSalesSubtitle")}</p>
            </div>
          </div>
          <span className="rounded-full bg-sage-100 px-3 py-1 text-xs font-medium text-sage-700">
            Top {topFnbSales.length}
          </span>
        </div>

        <div className="divide-y divide-sage-50">
          {topFnbSales.map((item, idx) => {
            const cfg = categoryConfig[item.category];
            const maxQty = topFnbSales[0].qtySold;
            const barWidth = Math.round((item.qtySold / maxQty) * 100);
            const isTop3 = idx < 3;
            const medalColors = ["text-amber-500", "text-charcoal-400", "text-wood-600"];

            return (
              <div key={item.menuItemId} className="flex items-center gap-4 px-5 py-3.5 hover:bg-sage-50/50 transition-colors">
                {/* Rank */}
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  isTop3 ? "bg-amber-50 " + medalColors[idx] : "bg-charcoal-50 text-charcoal-400"
                }`}>
                  {isTop3 ? (idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉") : idx + 1}
                </div>

                {/* Name + Category */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`truncate text-sm font-semibold text-charcoal-800 ${isTop3 ? "" : ""}`}>
                      {item.name}
                    </p>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                      {cfg.label}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-sage-100">
                      <div
                        className={`h-1.5 rounded-full transition-all ${cfg.bar}`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-charcoal-800">
                    {item.qtySold.toLocaleString()}
                    <span className="ml-1 text-xs font-normal text-charcoal-400">{t("rpt.qtySold")}</span>
                  </p>
                  <p className="text-xs text-charcoal-400">฿{item.revenue.toLocaleString()}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer summary */}
        <div className="border-t border-sage-100 bg-sage-50/50 px-5 py-3">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-charcoal-400">
            <span>
              Total units sold:{" "}
              <span className="font-semibold text-charcoal-700">
                {topFnbSales.reduce((s, i) => s + i.qtySold, 0).toLocaleString()}
              </span>
            </span>
            <span>
              Total F&B revenue:{" "}
              <span className="font-semibold text-charcoal-700">
                ฿{topFnbSales.reduce((s, i) => s + i.revenue, 0).toLocaleString()}
              </span>
            </span>
            <span className="ml-auto text-sage-500">Based on all-time mock data</span>
          </div>
        </div>
      </div>
    </div>
  );
}
