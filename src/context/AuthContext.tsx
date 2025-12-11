/**
 * @file Authentication context and session management for Altair.
 *
 * @remarks
 * The `AuthContext` centralizes user authentication state and provides
 * session persistence, role management, and navigation hooks across the app.
 *
 * It supports two primary user roles — `"learner"` and `"creator"` — and
 * automatically restores sessions from `sessionStorage` when available.
 *
 * Navigation is handled via `react-router-dom` to ensure seamless transitions
 * between dashboards depending on the active user role.
 *
 * @packageDocumentation
 */



import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";


/**
 * User roles supported by Altair’s authentication system.
 *
 * @public
 */
export type Role = "learner" | "creator";


/**
 * Represents a logged-in user within the Altair session.
 *
 * @property username - Display name or login identifier.
 * @property role - The user’s active role (`"learner"` or `"creator"`).
 *
 * @public
 */
export interface User {
  username: string;
  role: Role;
}


/**
 * Structure of the authentication context exposed to the application.
 *
 * @property user - The current logged-in user or `null` if not authenticated.
 * @property login - Initiates a session for a given username and optional role.
 * @property logout - Clears the session and navigates back to the login screen.
 * @property switchRole - Updates the active role and redirects accordingly.
 *
 * @public
 */
interface AuthContextValue {
  user: User | null;
  login: (u: Partial<User> & { username: string }) => void;
  logout: () => void;
  switchRole: (nextRole: Role) => void;
}


/** React context for authentication state and storage key used for persisting the user session. */
const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = "altair_user";



/**
 * Provides authentication context and state management to child components.
 *
 * @remarks
 * Responsibilities:
 * - Restores user sessions from `sessionStorage`
 * - Manages login/logout lifecycle
 * - Handles role switching with automatic navigation
 * - Propagates user state through React context
 *
 * The provider must wrap all routes that depend on authentication
 * (e.g., learner or creator dashboards).
 *
 * @param children - React components to receive authentication context.
 * @returns A context provider element for authentication state.
 *
 * @public
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  /** Restores persisted session if available and valid. */
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as User;
        if (
          parsed?.username &&
          (parsed.role === "learner" || parsed.role === "creator")
        ) {
          setUser(parsed);
        }
      }
    } catch (err) {
      console.warn("⚠️ Failed to parse user session:", err);
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  /** Logs a user in, creating a new session and storing it. */
  const login = (payload: Partial<User> & { username: string }) => {
    const username = payload.username.trim();
    if (!username) return;

    const role: Role =
      payload.role ??
      (/\bcreator\b/i.test(username) ? "creator" : "learner");

    const next: User = { username, role };
    setUser(next);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  /** Logs the user out and clears all session data. */
  const logout = () => {
    setUser(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem("altairSplashSeen");
      sessionStorage.removeItem("altairTransition");
    } catch {}
    navigate("/login", { replace: true });
  };

  /** Switches user role and redirects to the appropriate dashboard. */
  const switchRole = (nextRole: Role) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, role: nextRole };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    // Optional redirection logic (automatic navigation)
    if (nextRole === "creator") navigate("/creator/dashboard");
    else if (nextRole === "learner") navigate("/learner/dashboard");
  };

  /** Memoized context value for consistent referential identity. */
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      login,
      logout,
      switchRole,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook for accessing Altair’s authentication context.
 *
 * @remarks
 * Must be used within an {@link AuthProvider}.  
 * Throws an error if accessed outside the provider hierarchy.
 *
 * @throws Error if the context is not available.
 * @returns The active authentication context value.
 *
 * @public
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("❌ AuthProvider missing in tree");
  return ctx;
}
