"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type Locale = "en" | "th";

const dictionary: Record<string, Record<Locale, string>> = {
  // Navigation
  "nav.dashboard": { en: "Dashboard", th: "แดชบอร์ด" },
  "nav.frontDesk": { en: "Front Desk", th: "แผนกต้อนรับ" },
  "nav.pos": { en: "F&B / POS", th: "อาหาร & เครื่องดื่ม" },
  "nav.activities": { en: "Activities", th: "กิจกรรม" },
  "nav.inventory": { en: "Inventory", th: "คลังสินค้า" },
  "nav.reports": { en: "Reports", th: "รายงาน" },
  "nav.brand": { en: "Lampang Resort", th: "ลำปางรีสอร์ท" },
  "nav.sub": { en: "Management System", th: "ระบบจัดการ" },

  // Dashboard
  "dash.title": { en: "Dashboard", th: "แดชบอร์ด" },
  "dash.subtitle": { en: "Real-time overview", th: "ภาพรวมแบบเรียลไทม์" },
  "dash.occupancy": { en: "Occupancy", th: "อัตราเข้าพัก" },
  "dash.revenue": { en: "Today's Revenue", th: "รายได้วันนี้" },
  "dash.checkIn": { en: "Check-ins Today", th: "เช็คอินวันนี้" },
  "dash.checkOut": { en: "Check-outs Today", th: "เช็คเอาท์วันนี้" },
  "dash.roomRevenue": { en: "Room Revenue", th: "รายได้ห้องพัก" },
  "dash.fnbRevenue": { en: "F&B Revenue", th: "รายได้อาหาร & เครื่องดื่ม" },
  "dash.actRevenue": { en: "Activity Revenue", th: "รายได้กิจกรรม" },
  "dash.guestActivity": { en: "Today's Guest Activity", th: "กิจกรรมแขกวันนี้" },
  "dash.openBills": { en: "Open Room Bills (F&B)", th: "บิลค้าง (อาหาร & เครื่องดื่ม)" },
  "dash.roomStatus": { en: "Room Status Overview", th: "ภาพรวมสถานะห้องพัก" },
  "dash.lowStock": { en: "Low Stock Alerts", th: "แจ้งเตือนสินค้าใกล้หมด" },
  "dash.arrivals": { en: "Arrivals", th: "ผู้เข้าพัก" },
  "dash.departures": { en: "Departures", th: "ผู้ออก" },
  "dash.allSources": { en: "All sources", th: "ทุกแหล่ง" },
  "dash.units": { en: "units", th: "หน่วย" },

  // Common
  "common.checkin": { en: "Check-in", th: "เช็คอิน" },
  "common.checkout": { en: "Check-out", th: "เช็คเอาท์" },
  "common.pay": { en: "Pay", th: "ชำระเงิน" },
  "common.cancel": { en: "Cancel", th: "ยกเลิก" },
  "common.confirm": { en: "Confirm", th: "ยืนยัน" },
  "common.search": { en: "Search", th: "ค้นหา" },
  "common.total": { en: "Total", th: "รวม" },
  "common.grandTotal": { en: "Grand Total", th: "ยอดรวมทั้งหมด" },
  "common.items": { en: "items", th: "รายการ" },
  "common.free": { en: "Free", th: "ฟรี" },
  "common.noData": { en: "No data", th: "ไม่มีข้อมูล" },
  "common.walkin": { en: "Walk-in", th: "ลูกค้าทั่วไป" },

  // Payment
  "pay.method": { en: "Payment Method", th: "วิธีชำระเงิน" },
  "pay.cash": { en: "Cash", th: "เงินสด" },
  "pay.credit": { en: "Credit Card", th: "บัตรเครดิต" },
  "pay.promptpay": { en: "PromptPay Transfer", th: "โอนพร้อมเพย์" },
  "pay.refNo": { en: "Reference Number", th: "เลขอ้างอิง" },
  "pay.slip": { en: "Transfer Slip", th: "สลิปการโอน" },
  "pay.dragDrop": { en: "Drag & drop slip image, or click to browse", th: "ลากไฟล์สลิปมาวาง หรือคลิกเพื่อเลือก" },
  "pay.uploaded": { en: "Slip uploaded", th: "อัปโหลดสลิปแล้ว" },
  "pay.settle": { en: "Confirm Check-out & Settle", th: "ยืนยันเช็คเอาท์ & ชำระ" },

  // Inventory
  "inv.title": { en: "Inventory", th: "คลังสินค้า" },
  "inv.subtitle": { en: "Stock levels & low-stock alerts", th: "ระดับสินค้าคงคลัง & แจ้งเตือน" },
  "inv.lowStock": { en: "Low Stock", th: "สินค้าใกล้หมด" },
  "inv.inStock": { en: "In Stock", th: "มีในสต็อก" },
  "inv.restock": { en: "Restock", th: "เติมสินค้า" },
  "inv.item": { en: "Item", th: "สินค้า" },
  "inv.category": { en: "Category", th: "หมวดหมู่" },
  "inv.stock": { en: "Stock", th: "คงเหลือ" },
  "inv.threshold": { en: "Min. Threshold", th: "ขั้นต่ำ" },
  "inv.cost": { en: "Cost/Unit", th: "ต้นทุน/หน่วย" },
  "inv.lastRestock": { en: "Last Restocked", th: "เติมล่าสุด" },
  "inv.status": { en: "Status", th: "สถานะ" },
  "inv.food_supply": { en: "Food Supply", th: "วัตถุดิบอาหาร" },
  "inv.beverage": { en: "Beverage", th: "เครื่องดื่ม" },
  "inv.equipment": { en: "Equipment", th: "อุปกรณ์" },
  "inv.consumable": { en: "Consumable", th: "วัสดุสิ้นเปลือง" },

  // Reports
  "rpt.title": { en: "Financial Reports", th: "รายงานการเงิน" },
  "rpt.subtitle": { en: "Revenue breakdown & payment analysis", th: "วิเคราะห์รายได้ & วิธีชำระเงิน" },
  "rpt.today": { en: "Today", th: "วันนี้" },
  "rpt.thisWeek": { en: "This Week", th: "สัปดาห์นี้" },
  "rpt.thisMonth": { en: "This Month", th: "เดือนนี้" },
  "rpt.custom": { en: "Custom", th: "กำหนดเอง" },
  "rpt.export": { en: "Export CSV", th: "ส่งออก CSV" },
  "rpt.category": { en: "Category", th: "หมวดหมู่" },
  "rpt.amount": { en: "Amount", th: "จำนวนเงิน" },
  "rpt.share": { en: "Share", th: "สัดส่วน" },
  "rpt.txns": { en: "Txns", th: "รายการ" },
  "rpt.paymentBreakdown": { en: "Payment Method Breakdown", th: "สัดส่วนวิธีชำระเงิน" },
  "rpt.revenueBreakdown": { en: "Revenue Breakdown", th: "รายละเอียดรายได้" },
};

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  setLocale: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");
  const t = (key: string) => dictionary[key]?.[locale] ?? key;

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
