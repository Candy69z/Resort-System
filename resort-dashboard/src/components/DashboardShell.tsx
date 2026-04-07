"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/lib/auth";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isHydrated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/login";

  useEffect(() => {
    if (isHydrated && !isAuthenticated && !isLoginPage) {
      router.replace("/login");
    }
  }, [isAuthenticated, isHydrated, isLoginPage, router]);

  // Login page — render without shell
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Still reading localStorage — show spinner to prevent flash-to-login
  if (!isHydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-sage-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sage-200 border-t-sage-600" />
      </div>
    );
  }

  // Auth guard: show nothing while redirecting
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </>
  );
}
