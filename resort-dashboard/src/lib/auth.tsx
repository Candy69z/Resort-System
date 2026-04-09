"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { AuthUser, UserRole } from "./types";
import { mockUsers } from "./mock-data";

const SESSION_KEY = "resort_session";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isHydrated: false,
  login: () => false,
  logout: () => {},
  hasRole: () => false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Re-hydrate session from localStorage on mount (fixes F5 refresh bug)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AuthUser;
        // Validate the stored user still matches a known mock user
        const valid = mockUsers.some((u) => u.id === parsed.id && u.username === parsed.username);
        if (valid) setUser(parsed);
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const login = useCallback((username: string, password: string): boolean => {
    const found = mockUsers.find(
      (u) => u.username === username && u.password === password
    );
    if (!found) return false;
    const { password: _pw, ...safeUser } = found;
    setUser(safeUser);
    const serialized = JSON.stringify(safeUser);
    localStorage.setItem(SESSION_KEY, serialized);
    // Also write a cookie so Edge middleware can validate sessions server-side
    document.cookie = `resort_session=${encodeURIComponent(serialized)}; path=/; max-age=86400; SameSite=Strict`;
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
    document.cookie = "resort_session=; path=/; max-age=0; SameSite=Strict";
  }, []);

  const hasRole = useCallback(
    (role: UserRole) => user?.role === role,
    [user]
  );

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: user !== null, isHydrated, login, logout, hasRole }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
