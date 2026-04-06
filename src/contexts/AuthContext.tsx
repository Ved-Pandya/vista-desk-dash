import { createContext, useContext, useState, ReactNode } from "react";

type UserRole = "agency" | "client" | null;

interface AuthUser {
  email: string;
  role: UserRole;
  name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string, role: UserRole) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers = [
  { email: "admin@agencyos.dev", password: "admin123", role: "agency" as const, name: "Admin" },
  { email: "client@acme.com", password: "client123", role: "client" as const, name: "Acme Corp" },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = (email: string, password: string, role: UserRole): boolean => {
    const found = mockUsers.find(
      (u) => u.email === email && u.password === password && u.role === role
    );
    if (found) {
      setUser({ email: found.email, role: found.role, name: found.name });
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
