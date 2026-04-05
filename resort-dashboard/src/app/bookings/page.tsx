"use client";

import { useState } from "react";
import {
  BedDouble,
  Plus,
  Search,
  X,
  LogIn,
  LogOut,
  Calendar,
} from "lucide-react";
import { rooms, bookings as initialBookings, orders, guestProfiles } from "@/lib/mock-data";
import type { Booking, RoomStatus, PaymentMethod, MembershipTier } from "@/lib/types";
import PaymentForm from "@/components/PaymentForm";
import { useI18n } from "@/lib/i18n";

const statusColors: Record<RoomStatus, string> = {
  available: "bg-emerald-50 text-emerald-700 border-emerald-200",
  occupied: "bg-sage-50 text-sage-700 border-sage-300",
  reserved: "bg-amber-50 text-amber-700 border-amber-200",
  cleaning: "bg-blue-50 text-blue-600 border-blue-200",
};

const bookingStatusColors: Record<string, string> = {
  confirmed: "bg-amber-50 text-amber-700",
  checked_in: "bg-sage-100 text-sage-700",
  checked_out: "bg-charcoal-100 text-charcoal-500",
  cancelled: "bg-red-50 text-red-600",
};

function Badge({ status, map }: { status: string; map: Record<string, string> }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status] ?? "bg-charcoal-100 text-charcoal-500"}`}>
      {status.replace("_", " ")}
    </span>
  );
}

function MemberBadge({ tier }: { tier: MembershipTier }) {
  const config: Record<MembershipTier, { label: string; cls: string }> = {
    gold: { label: "Gold Member", cls: "bg-amber-100 text-amber-800" },
    silver: { label: "Silver Member", cls: "bg-slate-100 text-slate-700" },
    standard: { label: "Member", cls: "bg-sage-100 text-sage-700" },
  };
  const { label, cls } = config[tier];
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}

export default function BookingsPage() {
  const { t } = useI18n();
  const [bookingList, setBookingList] = useState<Booking[]>(initialBookings);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"rooms" | "bookings">("rooms");
  const [checkoutModal, setCheckoutModal] = useState<Booking | null>(null);

  // New booking form state
  const [formRoom, setFormRoom] = useState("");
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formCheckIn, setFormCheckIn] = useState("2026-04-05");
  const [formCheckOut, setFormCheckOut] = useState("2026-04-07");
  const [formBreakfast, setFormBreakfast] = useState(false);
  const [formBreakfastQty, setFormBreakfastQty] = useState(1);
  const [formMooKratha, setFormMooKratha] = useState(false);

  const matchedGuest = formPhone.length >= 9
    ? guestProfiles.find((g) => g.phone.replace(/-/g, "") === formPhone.replace(/-/g, ""))
    : undefined;

  function handlePhoneChange(value: string) {
    setFormPhone(value);
    if (value.length >= 9) {
      const found = guestProfiles.find(
        (g) => g.phone.replace(/-/g, "") === value.replace(/-/g, "")
      );
      if (found) setFormName(found.name);
    }
  }

  const filteredBookings = bookingList.filter(
    (b) =>
      b.guest.name.toLowerCase().includes(search.toLowerCase()) ||
      b.roomId.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleNewBooking = () => {
    if (!formRoom || !formName || !formPhone) return;
    const room = rooms.find((r) => r.id === formRoom);
    if (!room) return;

    const nights = Math.max(1, Math.round((new Date(formCheckOut).getTime() - new Date(formCheckIn).getTime()) / 86400000));
    const addOns = [];
    let addOnTotal = 0;

    if (formBreakfast) {
      addOns.push({ id: `AO-${Date.now()}`, name: "Breakfast", price: 100, quantity: formBreakfastQty * nights });
      addOnTotal += 100 * formBreakfastQty * nights;
    }
    if (formMooKratha) {
      addOns.push({ id: `AO-${Date.now() + 1}`, name: "Moo Kratha Evening", price: 350, quantity: 2 });
      addOnTotal += 700;
    }

    const newBooking: Booking = {
      id: `BK-${String(bookingList.length + 1).padStart(3, "0")}`,
      roomId: formRoom,
      guest: { id: `G-${Date.now()}`, name: formName, phone: formPhone },
      checkIn: formCheckIn,
      checkOut: formCheckOut,
      status: "confirmed",
      addOns,
      totalAmount: room.pricePerNight * nights + addOnTotal,
      createdAt: new Date().toISOString(),
    };

    setBookingList([...bookingList, newBooking]);
    setShowForm(false);
    setFormRoom(""); setFormName(""); setFormPhone("");
    setFormBreakfast(false); setFormMooKratha(false);
  };

  const handleCheckIn = (bookingId: string) => {
    setBookingList((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "checked_in" } : b))
    );
  };

  const getRoomOpenBillTotal = (roomId: string) => {
    return orders
      .filter((o) => o.roomId === roomId && o.status === "open")
      .reduce((sum, o) => sum + o.total, 0);
  };

  const handleCheckoutPayment = (method: PaymentMethod, refNo?: string, slipFile?: string) => {
    if (!checkoutModal) return;
    setBookingList((prev) =>
      prev.map((b) =>
        b.id === checkoutModal.id
          ? {
              ...b,
              status: "checked_out" as const,
              payment: {
                method,
                refNo,
                slipImageUrl: slipFile,
                paidAt: new Date().toISOString(),
              },
            }
          : b
      )
    );
    setCheckoutModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-charcoal-800">{t("nav.frontDesk")}</h1>
          <p className="text-sm text-charcoal-400">Manage rooms, bookings, and guest check-in/out</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-sage-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sage-700"
        >
          <Plus size={16} /> New Booking
        </button>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setView("rooms")}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${view === "rooms" ? "bg-sage-600 text-white" : "bg-white text-charcoal-600 border border-sage-200 hover:bg-sage-50"}`}
        >
          <BedDouble size={16} /> Room Status
        </button>
        <button
          onClick={() => setView("bookings")}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${view === "bookings" ? "bg-sage-600 text-white" : "bg-white text-charcoal-600 border border-sage-200 hover:bg-sage-50"}`}
        >
          <Calendar size={16} /> Booking List
        </button>
      </div>

      {/* Room Grid View */}
      {view === "rooms" && (
        <div className="space-y-4">
          {["tree_house", "rice_field", "tent_house", "camping"].map((type) => {
            const typeRooms = rooms.filter((r) => r.type === type);
            const labels: Record<string, string> = {
              tree_house: "Tree Houses",
              rice_field: "Rice Field Rooms",
              tent_house: "Tent Houses",
              camping: "Camping Spots",
            };
            return (
              <div key={type} className="rounded-xl border border-sage-200 bg-white shadow-sm">
                <div className="border-b border-sage-100 px-5 py-3">
                  <h3 className="text-sm font-semibold text-charcoal-700">{labels[type]}</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {typeRooms.map((room) => {
                    const booking = bookingList.find((b) => b.roomId === room.id && b.status === "checked_in");
                    return (
                      <div
                        key={room.id}
                        className={`rounded-lg border p-4 ${statusColors[room.status]}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm">{room.id}</span>
                          <span className="text-xs font-medium">฿{room.pricePerNight}</span>
                        </div>
                        <p className="mt-1 text-xs opacity-80">{room.name}</p>
                        <Badge status={room.status} map={statusColors} />
                        {booking && (
                          <p className="mt-2 text-xs font-medium truncate">{booking.guest.name}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Booking List View */}
      {view === "bookings" && (
        <div className="rounded-xl border border-sage-200 bg-white shadow-sm">
          <div className="border-b border-sage-100 px-5 py-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-300" />
              <input
                type="text"
                placeholder={`${t("common.search")}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-sage-200 bg-sage-50 py-2 pl-10 pr-4 text-sm text-charcoal-700 placeholder:text-charcoal-300 focus:border-sage-400 focus:outline-none focus:ring-1 focus:ring-sage-400"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sage-100 text-left text-xs text-charcoal-400">
                  <th className="px-5 py-3 font-medium">Booking</th>
                  <th className="px-5 py-3 font-medium">Guest</th>
                  <th className="px-5 py-3 font-medium">Room</th>
                  <th className="px-5 py-3 font-medium">Dates</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Payment</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-100">
                {filteredBookings.map((b) => {
                  const room = rooms.find((r) => r.id === b.roomId);
                  const openBill = getRoomOpenBillTotal(b.roomId);
                  return (
                    <tr key={b.id} className="hover:bg-sage-50/50">
                      <td className="px-5 py-3 font-medium text-charcoal-700">{b.id}</td>
                      <td className="px-5 py-3">
                        <p className="text-charcoal-700">{b.guest.name}</p>
                        <p className="text-xs text-charcoal-400">{b.guest.phone}</p>
                      </td>
                      <td className="px-5 py-3 text-charcoal-600">{room?.name ?? b.roomId}</td>
                      <td className="px-5 py-3 text-charcoal-600 text-xs">
                        {b.checkIn} → {b.checkOut}
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-charcoal-700">฿{b.totalAmount.toLocaleString()}</p>
                        {openBill > 0 && b.status === "checked_in" && (
                          <p className="text-xs text-wood-600">+฿{openBill} F&B</p>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <Badge status={b.status} map={bookingStatusColors} />
                      </td>
                      <td className="px-5 py-3 text-xs text-charcoal-500">
                        {b.payment ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
                            {b.payment.method === "promptpay" ? "PP" : b.payment.method === "credit_card" ? "CC" : "Cash"}
                            {b.payment.refNo && <span className="text-emerald-500">#{b.payment.refNo.slice(-6)}</span>}
                          </span>
                        ) : (
                          <span className="text-charcoal-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          {b.status === "confirmed" && (
                            <button
                              onClick={() => handleCheckIn(b.id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-sage-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sage-700"
                            >
                              <LogIn size={12} /> {t("common.checkin")}
                            </button>
                          )}
                          {b.status === "checked_in" && (
                            <button
                              onClick={() => setCheckoutModal(b)}
                              className="inline-flex items-center gap-1 rounded-lg bg-wood-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-wood-700"
                            >
                              <LogOut size={12} /> {t("common.checkout")}
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
      )}

      {/* New Booking Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-sage-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-charcoal-800">New Booking</h2>
              <button onClick={() => setShowForm(false)} className="text-charcoal-400 hover:text-charcoal-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4 px-6 py-5">
              <div>
                <label className="block text-sm font-medium text-charcoal-600 mb-1">Room</label>
                <select
                  value={formRoom}
                  onChange={(e) => setFormRoom(e.target.value)}
                  className="w-full rounded-lg border border-sage-200 px-3 py-2 text-sm text-charcoal-700 focus:border-sage-400 focus:outline-none focus:ring-1 focus:ring-sage-400"
                >
                  <option value="">Select a room...</option>
                  {rooms
                    .filter((r) => r.status === "available")
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} — ฿{r.pricePerNight}/night
                      </option>
                    ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal-600 mb-1">Guest Name</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Full name"
                    className="w-full rounded-lg border border-sage-200 px-3 py-2 text-sm text-charcoal-700 placeholder:text-charcoal-300 focus:border-sage-400 focus:outline-none focus:ring-1 focus:ring-sage-400"
                  />
                  {matchedGuest && (
                    <div className="mt-1 flex items-center gap-2">
                      <MemberBadge tier={matchedGuest.membershipTier} />
                      <span className="text-xs text-charcoal-400">{matchedGuest.visitCount} visits</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal-600 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="08X-XXX-XXXX"
                    className="w-full rounded-lg border border-sage-200 px-3 py-2 text-sm text-charcoal-700 placeholder:text-charcoal-300 focus:border-sage-400 focus:outline-none focus:ring-1 focus:ring-sage-400"
                  />
                  {matchedGuest && (
                    <p className="mt-1 text-xs text-emerald-600">Guest profile found</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal-600 mb-1">{t("common.checkin")}</label>
                  <input
                    type="date"
                    value={formCheckIn}
                    onChange={(e) => setFormCheckIn(e.target.value)}
                    className="w-full rounded-lg border border-sage-200 px-3 py-2 text-sm text-charcoal-700 focus:border-sage-400 focus:outline-none focus:ring-1 focus:ring-sage-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal-600 mb-1">{t("common.checkout")}</label>
                  <input
                    type="date"
                    value={formCheckOut}
                    onChange={(e) => setFormCheckOut(e.target.value)}
                    className="w-full rounded-lg border border-sage-200 px-3 py-2 text-sm text-charcoal-700 focus:border-sage-400 focus:outline-none focus:ring-1 focus:ring-sage-400"
                  />
                </div>
              </div>
              {/* Add-ons */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-charcoal-600">Add-ons</p>
                <label className="flex items-center gap-3 rounded-lg border border-sage-200 px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={formBreakfast}
                    onChange={(e) => setFormBreakfast(e.target.checked)}
                    className="h-4 w-4 rounded border-sage-300 text-sage-600 focus:ring-sage-500"
                  />
                  <span className="flex-1 text-sm text-charcoal-700">Breakfast (+฿100/pax/day)</span>
                  {formBreakfast && (
                    <select
                      value={formBreakfastQty}
                      onChange={(e) => setFormBreakfastQty(Number(e.target.value))}
                      className="rounded border border-sage-200 px-2 py-1 text-xs"
                    >
                      {[1, 2, 3, 4].map((n) => (
                        <option key={n} value={n}>{n} pax</option>
                      ))}
                    </select>
                  )}
                </label>
                <label className="flex items-center gap-3 rounded-lg border border-sage-200 px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={formMooKratha}
                    onChange={(e) => setFormMooKratha(e.target.checked)}
                    className="h-4 w-4 rounded border-sage-300 text-sage-600 focus:ring-sage-500"
                  />
                  <span className="flex-1 text-sm text-charcoal-700">Moo Kratha Evening (฿350/set x2)</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-sage-100 px-6 py-4">
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-sage-200 px-4 py-2 text-sm font-medium text-charcoal-600 hover:bg-sage-50"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleNewBooking}
                className="rounded-lg bg-sage-600 px-4 py-2 text-sm font-medium text-white hover:bg-sage-700"
              >
                Create Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Check-out Modal with Payment */}
      {checkoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-sage-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-charcoal-800">{t("common.checkout")} — {t("common.pay")}</h2>
              <button onClick={() => setCheckoutModal(null)} className="text-charcoal-400 hover:text-charcoal-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4 px-6 py-5">
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-500">Guest</span>
                <span className="font-medium text-charcoal-700">{checkoutModal.guest.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-500">Room</span>
                <span className="font-medium text-charcoal-700">
                  {rooms.find((r) => r.id === checkoutModal.roomId)?.name}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-500">Stay</span>
                <span className="text-charcoal-700">{checkoutModal.checkIn} → {checkoutModal.checkOut}</span>
              </div>
              <hr className="border-sage-100" />
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-500">Room Charges</span>
                <span className="text-charcoal-700">฿{checkoutModal.totalAmount.toLocaleString()}</span>
              </div>
              {checkoutModal.addOns.map((a) => (
                <div key={a.id} className="flex justify-between text-sm">
                  <span className="text-charcoal-500">{a.name} x{a.quantity}</span>
                  <span className="text-charcoal-700">฿{(a.price * a.quantity).toLocaleString()}</span>
                </div>
              ))}
              {getRoomOpenBillTotal(checkoutModal.roomId) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-wood-600 font-medium">F&B Open Bill</span>
                  <span className="text-wood-600 font-medium">
                    ฿{getRoomOpenBillTotal(checkoutModal.roomId).toLocaleString()}
                  </span>
                </div>
              )}
              <hr className="border-sage-100" />
              <div className="flex justify-between text-base font-semibold">
                <span className="text-charcoal-800">{t("common.grandTotal")}</span>
                <span className="text-sage-700">
                  ฿{(checkoutModal.totalAmount + getRoomOpenBillTotal(checkoutModal.roomId)).toLocaleString()}
                </span>
              </div>

              {/* Payment Form */}
              <hr className="border-sage-100" />
              <PaymentForm
                total={checkoutModal.totalAmount + getRoomOpenBillTotal(checkoutModal.roomId)}
                onConfirm={handleCheckoutPayment}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
