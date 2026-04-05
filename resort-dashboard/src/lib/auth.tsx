"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { AuthUser, UserRole } from "./types";
import { mockUsers } from "./mock-data";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => false,
  logout: () => {},
  hasRole: () => false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = useCallback((username: string, password: string): boolean => {
    const found = mockUsers.find(
      (u) => u.username === username && u.password === password
    );
    if (!found) return false;
    // Strip password before storing in state
    const { password: _pw, ...safeUser } = found;
    setUser(safeUser);
    return true;
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const hasRole = useCallback(
    (role: UserRole) => user?.role === role,
    [user]
  );

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: user !== null, login, logout, hasRole }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
