import { createContext } from "react";

export type AuthContextValue = {
  isAuthenticated: boolean;
  token: string | null;
  loginSSO: () => Promise<void>;
  completeLogin: (token: string, idToken?: string) => void;
  refreshToken: () => Promise<string | null>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
