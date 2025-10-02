import React, { createContext, useContext, useState } from "react";

type Role = "student" | "teacher" | "admin";
type User = { id: string; username: string; role: Role } | null;

type Ctx = {
  user: User;
  login: (u: string, p: string) => Promise<void>;
  logout: () => void;
};

const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);

  async function login(username: string, _password: string) {
    // MOCK: "teacher" => role teacher, sinon student
    const role: Role = username === "teacher" ? "teacher" : "student";
    setUser({ id: "u1", username, role });
    localStorage.setItem("token", "fake-jwt");
  }
  function logout() {
    setUser(null);
    localStorage.removeItem("token");
  }

  return (
    <AuthCtx.Provider value={{ user, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("AuthProvider missing");
  return ctx;
}
