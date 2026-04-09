"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BedDouble,
  UtensilsCrossed,
  TreePine,
  Package,
  BarChart3,
  Users,
  Settings,
  Menu,
  X,
  Globe,
  LogOut,
  Sparkles,
  ClipboardList,
  UserCog,
} from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { locale, setLocale, t } = useI18n();
  const { user, logout, hasRole } = useAuth();

  const isAdmin = hasRole("admin");

  const allNavItems = [
    { href: "/", label: t("nav.dashboard"), icon: LayoutDashboard, adminOnly: false },
    { href: "/bookings", label: t("nav.frontDesk"), icon: BedDouble, adminOnly: false },
    { href: "/pos", label: t("nav.pos"), icon: UtensilsCrossed, adminOnly: false },
    { href: "/activities", label: t("nav.activities"), icon: TreePine, adminOnly: false },
    { href: "/housekeeping", label: t("nav.housekeeping"), icon: Sparkles, adminOnly: false },
    { href: "/guests", label: t("nav.guests"), icon: Users, adminOnly: false },
    { href: "/inventory", label: t("nav.inventory"), icon: Package, adminOnly: true },
    { href: "/reports", label: t("nav.reports"), icon: BarChart3, adminOnly: true },
    { href: "/admin", label: t("nav.admin"), icon: Settings, adminOnly: true },
    { href: "/admin/inventory", label: t("nav.inventoryMgmt"), icon: ClipboardList, adminOnly: true },
    { href: "/admin/staff", label: t("nav.staffMgmt"), icon: UserCog, adminOnly: true },
  ];

  const navItems = allNavItems.filter((item) => !item.adminOnly || isAdmin);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 rounded-lg bg-sage-700 p-2 text-white shadow-lg lg:hidden"
        aria-label="Toggle menu"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sage-800 text-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 border-b border-sage-700 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sage-600">
            <TreePine size={20} />
          </div>
          <div>
            <h1 className="text-base font-semibold leading-tight">
              {t("nav.brand")}
            </h1>
            <p className="text-xs text-sage-300">{t("nav.sub")}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sage-600 text-white"
                    : "text-sage-200 hover:bg-sage-700 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer — user + lang + logout */}
        <div className="border-t border-sage-700 px-4 py-4 space-y-2">
          {/* Logged-in user */}
          {user && (
            <div className="flex items-center gap-3 rounded-lg px-3 py-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage-600 text-xs font-bold">
                {user.avatarInitials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-sage-400">
                  {user.role === "admin" ? t("auth.role.admin") : user.role === "manager" ? t("auth.role.manager") : t("auth.role.staff")}
                </p>
              </div>
            </div>
          )}

          {/* Language Toggle */}
          <button
            onClick={() => setLocale(locale === "en" ? "th" : "en")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sage-200 transition-colors hover:bg-sage-700 hover:text-white"
          >
            <Globe size={18} />
            <span>{locale === "en" ? "TH — ภาษาไทย" : "EN — English"}</span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sage-200 transition-colors hover:bg-red-700/40 hover:text-red-300"
          >
            <LogOut size={18} />
            <span>{t("auth.logout")}</span>
          </button>

          <p className="px-3 text-xs text-sage-500">v3.0 &middot; PMS + POS</p>
        </div>
      </aside>
    </>
  );
}
