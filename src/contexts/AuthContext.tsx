import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface UserPermissions {
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface User {
  name: string;
  email: string;
  tenantId?: string | null;
  addedBy?: string | null;
  permissions?: UserPermissions;
  [key: string]: any;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  isOwner: boolean;
  can: (permission: keyof UserPermissions) => boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    setToken(storedToken);
    setUser(storedUser ? JSON.parse(storedUser) : null);
    setHydrated(true);
  }, []);

  const login = (user: User, token: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setToken(token);
    setUser(user);
    setHydrated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const updateUser = (patch: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      localStorage.setItem("user", JSON.stringify(next));
      return next;
    });
  };

  const isOwner = !!user && !user.tenantId;

  const can = (permission: keyof UserPermissions) => {
    if (isOwner) return true;
    return user?.permissions?.[permission] ?? true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        hydrated,
        isOwner,
        can,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
