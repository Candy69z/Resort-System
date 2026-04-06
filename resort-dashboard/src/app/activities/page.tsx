"use client";

import { useState } from "react";
import {
  TreePine,
  Paintbrush,
  Waves,
  Mountain,
  Music,
  Plus,
  X,
  Users,
  Calendar,
} from "lucide-react";
import {
  activityBookings as initialBookings,
  rooms,
  bookings as guestBookings,
} from "@/lib/mock-data";
import type { ActivityBooking, Activity } from "@/lib/types";
import { useMockData } from "@/lib/mock-data-context";

const categoryIcons = {
  workshop: Paintbrush,
  outdoor: Waves,
  event: Music,
};

const categoryColors = {
  workshop: "bg-sage-100 text-sage-700 border-sage-200",
  outdoor: "bg-blue-50 text-blue-700 border-blue-200",
  event: "bg-purple-50 text-purple-700 border-purple-200",
};

export default function ActivitiesPage() {
  // ── Global shared data (stays in sync with Admin edits) ──
  const { activities } = useMockData();

  const [actBookings, setActBookings] = useState<ActivityBooking[]>(initialBookings);
  const [showForm, setShowForm] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  // Form state
  const [formActivity, setFormActivity] = useState("");
  const [formRoom, setFormRoom] = useState("");
  const [formGuest, setFormGuest] = useState("");
  const [formDate, setFormDate] = useState("2026-04-04");
  const [formSlots, setFormSlots] = useState(1);

  const getBookedSlots = (activityId: string, date: string) => {
    return actBookings
      .filter((b) => b.activityId === activityId && b.date === date)
      .reduce((sum, b) => sum + b.slots, 0);
  };

  const handleBook = () => {
    const act = activities.find((a) => a.id === formActivity);
    if (!act || !formGuest) return;

    const room = rooms.find((r) => r.id === formRoom);
    const newBooking: ActivityBooking = {
      id: `AB-${String(actBookings.length + 1).padStart(3, "0")}`,
      activityId: act.id,
      activityName: act.name,
      roomId: formRoom || undefined,
      roomName: room?.name,
      guestName: formGuest,
      date: formDate,
      slots: formSlots,
      totalPrice: act.price * formSlots,
    };

    setActBookings([...actBookings, newBooking]);
    setShowForm(false);
    setFormActivity("");
    setFormRoom("");
    setFormGuest("");
    setFormSlots(1);
  };

  const checkedInGuests = guestBookings.filter((b) => b.status === "checked_in");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-charcoal-800">Activities & Events</h1>
          <p className="text-sm text-charcoal-400">Manage workshops, outdoor trips, and events</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-sage-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sage-700"
        >
          <Plus size={16} /> Book Activity
        </button>
      </div>

      {/* Activity Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {activities.map((act) => {
          const Icon = categoryIcons[act.category] ?? TreePine;
          const color = categoryColors[act.category];
          const bookedToday = getBookedSlots(act.id, "2026-04-03");
          const remaining = act.maxSlots - bookedToday;

          return (
            <div
              key={act.id}
              className="rounded-xl border border-sage-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className={`rounded-lg border p-2.5 ${color}`}>
                  <Icon size={20} />
                </div>
                {act.price > 0 ? (
                  <span className="text-lg font-semibold text-sage-700">
                    ฿{act.price}
                  </span>
                ) : (
                  <span className="rounded-full bg-sage-100 px-2.5 py-0.5 text-xs font-medium text-sage-700">
                    Free
                  </span>
                )}
              </div>
              <h3 className="mt-3 text-base font-semibold text-charcoal-800">
                {act.name}
              </h3>
              <p className="mt-1 text-sm text-charcoal-400 line-clamp-2">
                {act.description}
              </p>
              <div className="mt-3 flex items-center gap-4 text-xs text-charcoal-400">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {act.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={12} />
                  {remaining}/{act.maxSlots} slots
                </span>
              </div>
              {act.schedule && (
                <p className="mt-2 text-xs text-purple-600">{act.schedule}</p>
              )}
              {/* Today's bookings for this activity */}
              {actBookings
                .filter((b) => b.activityId === act.id && b.date === "2026-04-03")
                .length > 0 && (
                <div className="mt-3 border-t border-sage-100 pt-3">
                  <p className="text-xs font-medium text-charcoal-500 mb-1.5">
                    Today&apos;s Bookings
                  </p>
                  {actBookings
                    .filter((b) => b.activityId === act.id && b.date === "2026-04-03")
                    .map((b) => (
                      <div key={b.id} className="flex items-center justify-between text-xs py-0.5">
                        <span className="text-charcoal-600">
                          {b.guestName}
                          {b.roomName && (
                            <span className="text-charcoal-400"> ({b.roomName})</span>
                          )}
                        </span>
                        <span className="text-charcoal-400">x{b.slots}</span>
                      </div>
                    ))}
                </div>
              )}
              <button
                onClick={() => {
                  setSelectedActivity(act);
                  setFormActivity(act.id);
                  setShowForm(true);
                }}
                className="mt-4 w-full rounded-lg border border-sage-200 py-2 text-sm font-medium text-sage-700 transition-colors hover:bg-sage-50"
              >
                Book Slots
              </button>
            </div>
          );
        })}
      </div>

      {/* All Activity Bookings Table */}
      <div className="rounded-xl border border-sage-200 bg-white shadow-sm">
        <div className="border-b border-sage-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-charcoal-700">All Activity Bookings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-sage-100 text-left text-xs text-charcoal-400">
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-5 py-3 font-medium">Activity</th>
                <th className="px-5 py-3 font-medium">Guest</th>
                <th className="px-5 py-3 font-medium">Room</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Slots</th>
                <th className="px-5 py-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-100">
              {actBookings.map((b) => (
                <tr key={b.id} className="hover:bg-sage-50/50">
                  <td className="px-5 py-3 font-medium text-charcoal-700">{b.id}</td>
                  <td className="px-5 py-3 text-charcoal-600">{b.activityName}</td>
                  <td className="px-5 py-3 text-charcoal-700">{b.guestName}</td>
                  <td className="px-5 py-3 text-charcoal-500">{b.roomName ?? "—"}</td>
                  <td className="px-5 py-3 text-charcoal-600">{b.date}</td>
                  <td className="px-5 py-3 text-charcoal-600">{b.slots}</td>
                  <td className="px-5 py-3 font-medium text-charcoal-700">
                    {b.totalPrice > 0 ? `฿${b.totalPrice.toLocaleString()}` : "Free"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-sage-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-charcoal-800">Book Activity</h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setSelectedActivity(null);
                }}
                className="text-charcoal-400 hover:text-charcoal-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4 px-6 py-5">
              <div>
                <label className="block text-sm font-medium text-charcoal-600 mb-1">Activity</label>
                <select
                  value={formActivity}
                  onChange={(e) => setFormActivity(e.target.value)}
                  className="w-full rounded-lg border border-sage-200 px-3 py-2 text-sm text-charcoal-700 focus:border-sage-400 focus:outline-none focus:ring-1 focus:ring-sage-400"
                >
                  <option value="">Select activity...</option>
                  {activities.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} — {a.price > 0 ? `฿${a.price}` : "Free"}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-600 mb-1">
                  Link to Room (optional)
                </label>
                <select
                  value={formRoom}
                  onChange={(e) => {
                    setFormRoom(e.target.value);
                    const booking = checkedInGuests.find((b) => b.roomId === e.target.value);
                    if (booking) setFormGuest(booking.guest.name);
                  }}
                  className="w-full rounded-lg border border-sage-200 px-3 py-2 text-sm text-charcoal-700 focus:border-sage-400 focus:outline-none focus:ring-1 focus:ring-sage-400"
                >
                  <option value="">No room (walk-in)</option>
                  {checkedInGuests.map((b) => {
                    const room = rooms.find((r) => r.id === b.roomId);
                    return (
                      <option key={b.roomId} value={b.roomId}>
                        {room?.name} — {b.guest.name}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal-600 mb-1">Guest Name</label>
                  <input
                    type="text"
                    value={formGuest}
                    onChange={(e) => setFormGuest(e.target.value)}
                    placeholder="Guest name"
                    className="w-full rounded-lg border border-sage-200 px-3 py-2 text-sm text-charcoal-700 placeholder:text-charcoal-300 focus:border-sage-400 focus:outline-none focus:ring-1 focus:ring-sage-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal-600 mb-1">Date</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full rounded-lg border border-sage-200 px-3 py-2 text-sm text-charcoal-700 focus:border-sage-400 focus:outline-none focus:ring-1 focus:ring-sage-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-600 mb-1">
                  Number of Slots
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={formSlots}
                  onChange={(e) => setFormSlots(Number(e.target.value))}
                  className="w-24 rounded-lg border border-sage-200 px-3 py-2 text-sm text-charcoal-700 focus:border-sage-400 focus:outline-none focus:ring-1 focus:ring-sage-400"
                />
              </div>
              {formActivity && (
                <div className="rounded-lg bg-sage-50 p-3 text-sm">
                  <span className="text-charcoal-500">Total: </span>
                  <span className="font-semibold text-sage-700">
                    ฿{((activities.find((a) => a.id === formActivity)?.price ?? 0) * formSlots).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 border-t border-sage-100 px-6 py-4">
              <button
                onClick={() => {
                  setShowForm(false);
                  setSelectedActivity(null);
                }}
                className="rounded-lg border border-sage-200 px-4 py-2 text-sm font-medium text-charcoal-600 hover:bg-sage-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBook}
                className="rounded-lg bg-sage-600 px-4 py-2 text-sm font-medium text-white hover:bg-sage-700"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
