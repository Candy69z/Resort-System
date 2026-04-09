"use client";

/**
 * withRole — Client-Side Role-Based Access Control HOC
 * ─────────────────────────────────────────────────────
 * Wraps any page component and redirects unauthorized users.
 *
 * Usage:
 *   export default withRole(MyAdminPage, ["admin"]);
 *   export default withRole(MyManagerPage, ["admin", "manager"]);
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import type { UserRole } from "@/lib/types";

export function withRole<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  allowedRoles: UserRole[],
  redirectTo: string = "/"
) {
  function RoleProtectedPage(props: T) {
    const { user, isHydrated } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isHydrated) return;
      if (!user || !allowedRoles.includes(user.role)) {
        router.replace(redirectTo);
      }
    }, [isHydrated, user, router]);

    // While localStorage is being hydrated — show spinner
    if (!isHydrated) {
      return (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sage-200 border-t-sage-600" />
        </div>
      );
    }

    // User lacks required role — render nothing (redirect is in-flight)
    if (!user || !allowedRoles.includes(user.role)) {
      return null;
    }

    return <WrappedComponent {...props} />;
  }

  // Preserve display name for React DevTools
  RoleProtectedPage.displayName = `withRole(${WrappedComponent.displayName ?? WrappedComponent.name})`;

  return RoleProtectedPage;
}

/**
 * Quick shorthand helpers for the most common patterns.
 */
export function withAdminRole<T extends object>(Component: React.ComponentType<T>) {
  return withRole(Component, ["admin"]);
}

export function withManagerRole<T extends object>(Component: React.ComponentType<T>) {
  return withRole(Component, ["admin", "manager"]);
}
