import * as XLSX from "xlsx";
import type { ReportRow } from "./types";

// ============================================================
// Professional Excel Export — Resort PMS Reports
// ============================================================

/** Apply bold + fill styling to a cell address */
function boldCell(ws: XLSX.WorkSheet, addr: string, bgColor = "4A7C59") {
  if (!ws[addr]) return;
  ws[addr].s = {
    font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
    fill: { fgColor: { rgb: bgColor }, patternType: "solid" },
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
    border: {
      bottom: { style: "thin", color: { rgb: "CCCCCC" } },
    },
  };
}

/** Format a number cell (THB) */
function numFmt(ws: XLSX.WorkSheet, addr: string) {
  if (!ws[addr] || ws[addr].v === "") return;
  ws[addr].t = "n";
  ws[addr].z = '#,##0';
}

export function exportReportToExcel(
  rows: ReportRow[],
  rangeLabel: string
): void {
  const wb = XLSX.utils.book_new();

  // ── Sheet 1: Detailed Transactions ──────────────────────
  const headers = [
    "Date",
    "Ref No",
    "Guest Name",
    "Room Revenue (฿)",
    "F&B Revenue (฿)",
    "Activity Revenue (฿)",
    "Total Amount (฿)",
    "Payment Method",
  ];

  const dataRows = rows.map((r) => [
    r.date,
    r.refNo || "—",
    r.guestName,
    r.roomRevenue,
    r.fnbRevenue,
    r.activityRevenue,
    r.totalAmount,
    r.paymentMethod,
  ]);

  const wsData = [headers, ...dataRows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Bold + colour all header cells
  headers.forEach((_, i) => {
    const addr = XLSX.utils.encode_cell({ r: 0, c: i });
    boldCell(ws, addr);
  });

  // Number format for revenue columns (cols 3-6)
  rows.forEach((_, rowIdx) => {
    [3, 4, 5, 6].forEach((colIdx) => {
      const addr = XLSX.utils.encode_cell({ r: rowIdx + 1, c: colIdx });
      numFmt(ws, addr);
    });
  });

  // Alternating row fill for readability
  rows.forEach((_, rowIdx) => {
    if (rowIdx % 2 === 0) {
      headers.forEach((_, colIdx) => {
        const addr = XLSX.utils.encode_cell({ r: rowIdx + 1, c: colIdx });
        if (!ws[addr]) return;
        ws[addr].s = {
          ...(ws[addr].s ?? {}),
          fill: { fgColor: { rgb: "F6F7F4" }, patternType: "solid" },
        };
      });
    }
  });

  // Total row
  if (rows.length > 0) {
    const totalRow = [
      "TOTAL",
      "",
      `${rows.length} transactions`,
      rows.reduce((s, r) => s + r.roomRevenue, 0),
      rows.reduce((s, r) => s + r.fnbRevenue, 0),
      rows.reduce((s, r) => s + r.activityRevenue, 0),
      rows.reduce((s, r) => s + r.totalAmount, 0),
      "",
    ];
    XLSX.utils.sheet_add_aoa(ws, [totalRow], { origin: rows.length + 1 });
    totalRow.forEach((_, colIdx) => {
      const addr = XLSX.utils.encode_cell({ r: rows.length + 1, c: colIdx });
      boldCell(ws, addr, "2F3A29"); // dark charcoal for total row
      if ([3, 4, 5, 6].includes(colIdx)) numFmt(ws, addr);
    });
  }

  // Auto column widths
  ws["!cols"] = [
    { wch: 12 }, // Date
    { wch: 22 }, // Ref No
    { wch: 22 }, // Guest Name
    { wch: 20 }, // Room Revenue
    { wch: 18 }, // F&B Revenue
    { wch: 20 }, // Activity Revenue
    { wch: 18 }, // Total Amount
    { wch: 18 }, // Payment Method
  ];

  ws["!rows"] = [{ hpt: 28 }]; // taller header row

  XLSX.utils.book_append_sheet(wb, ws, "Transactions");

  // ── Sheet 2: Summary ────────────────────────────────────
  const totalRoomRev = rows.reduce((s, r) => s + r.roomRevenue, 0);
  const totalFnbRev = rows.reduce((s, r) => s + r.fnbRevenue, 0);
  const totalActRev = rows.reduce((s, r) => s + r.activityRevenue, 0);
  const grandTotal = rows.reduce((s, r) => s + r.totalAmount, 0);

  const cashTotal = rows.filter((r) => r.paymentMethod === "Cash").reduce((s, r) => s + r.totalAmount, 0);
  const ppTotal = rows.filter((r) => r.paymentMethod === "PromptPay").reduce((s, r) => s + r.totalAmount, 0);
  const ccTotal = rows.filter((r) => r.paymentMethod === "Credit Card").reduce((s, r) => s + r.totalAmount, 0);

  const summaryData = [
    ["RESORT REVENUE SUMMARY", "", ""],
    ["Period", rangeLabel, ""],
    ["Generated", new Date().toLocaleString("th-TH"), ""],
    ["", "", ""],
    ["Revenue Stream", "Amount (THB)", "Share (%)"],
    ["Room Revenue", totalRoomRev, grandTotal > 0 ? +((totalRoomRev / grandTotal) * 100).toFixed(1) : 0],
    ["F&B Revenue", totalFnbRev, grandTotal > 0 ? +((totalFnbRev / grandTotal) * 100).toFixed(1) : 0],
    ["Activity Revenue", totalActRev, grandTotal > 0 ? +((totalActRev / grandTotal) * 100).toFixed(1) : 0],
    ["GRAND TOTAL", grandTotal, 100],
    ["", "", ""],
    ["Payment Method", "Amount (THB)", "Share (%)"],
    ["Cash", cashTotal, grandTotal > 0 ? +((cashTotal / grandTotal) * 100).toFixed(1) : 0],
    ["PromptPay Transfer", ppTotal, grandTotal > 0 ? +((ppTotal / grandTotal) * 100).toFixed(1) : 0],
    ["Credit Card", ccTotal, grandTotal > 0 ? +((ccTotal / grandTotal) * 100).toFixed(1) : 0],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);

  // Style summary headers
  [[0, 0], [4, 0], [4, 1], [4, 2], [8, 0], [8, 1], [8, 2], [10, 0], [10, 1], [10, 2]].forEach(([r, c]) => {
    boldCell(wsSummary, XLSX.utils.encode_cell({ r, c }));
  });

  // Number format revenue cells in summary
  [[5, 1], [6, 1], [7, 1], [8, 1], [11, 1], [12, 1], [13, 1]].forEach(([r, c]) => {
    numFmt(wsSummary, XLSX.utils.encode_cell({ r, c }));
  });

  wsSummary["!cols"] = [{ wch: 22 }, { wch: 18 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

  // Trigger browser download
  XLSX.writeFile(
    wb,
    `resort-report-${rangeLabel.replace(/\s/g, "-")}-${new Date().toISOString().slice(0, 10)}.xlsx`
  );
}

/** Generate mock report rows for a given range label */
export function buildMockReportRows(range: string): ReportRow[] {
  const payMethods: ReportRow["paymentMethod"][] = ["PromptPay", "Cash", "PromptPay", "Credit Card", "PromptPay"];

  const rows: ReportRow[] = [
    { date: "2026-04-03", refNo: "20260403-PP-001", guestName: "Somchai Kaewkla", roomRevenue: 1576, fnbRevenue: 230, activityRevenue: 700, totalAmount: 2506, paymentMethod: "PromptPay" },
    { date: "2026-04-03", refNo: "", guestName: "Anna Schmidt", roomRevenue: 1176, fnbRevenue: 345, activityRevenue: 0, totalAmount: 1521, paymentMethod: "PromptPay" },
    { date: "2026-04-03", refNo: "", guestName: "Tanaka Yuki", roomRevenue: 588, fnbRevenue: 0, activityRevenue: 250, totalAmount: 838, paymentMethod: "Cash" },
    { date: "2026-04-03", refNo: "", guestName: "Lisa Manobal", roomRevenue: 888, fnbRevenue: 85, activityRevenue: 0, totalAmount: 973, paymentMethod: "Cash" },
    { date: "2026-04-03", refNo: "", guestName: "Mike Johnson", roomRevenue: 400, fnbRevenue: 0, activityRevenue: 0, totalAmount: 400, paymentMethod: "Cash" },
    { date: "2026-04-03", refNo: "20260403-PP-002", guestName: "Ploy Chaiwan", roomRevenue: 200, fnbRevenue: 160, activityRevenue: 0, totalAmount: 360, paymentMethod: "PromptPay" },
    { date: "2026-04-02", refNo: "20260402-PP-001", guestName: "Bar Walk-in", roomRevenue: 0, fnbRevenue: 690, activityRevenue: 0, totalAmount: 690, paymentMethod: "PromptPay" },
    { date: "2026-04-02", refNo: "", guestName: "Cafe Walk-in", roomRevenue: 0, fnbRevenue: 460, activityRevenue: 0, totalAmount: 460, paymentMethod: "Credit Card" },
  ];

  if (range === "week" || range === "month") {
    return [
      ...rows,
      { date: "2026-04-01", refNo: "", guestName: "Wanchai Boonrod", roomRevenue: 1576, fnbRevenue: 420, activityRevenue: 450, totalAmount: 2446, paymentMethod: "PromptPay" },
      { date: "2026-04-01", refNo: "", guestName: "Priya Sharma", roomRevenue: 788, fnbRevenue: 200, activityRevenue: 350, totalAmount: 1338, paymentMethod: "Cash" },
    ];
  }
  return range === "today" ? rows.filter((r) => r.date === "2026-04-03") : rows;
}
