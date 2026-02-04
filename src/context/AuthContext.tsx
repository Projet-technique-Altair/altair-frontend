/**
 * AuthContext
 *
 * Purpose
 * -------
 * AuthContext is the single source of truth for authentication state
 * on the frontend of Altaïr.
 *
 * It is responsible ONLY for:
 * - Holding the authentication state (access token, refresh token, auth status)
 * - Exposing authentication helpers to the React application
 * - Providing a clean abstraction over OAuth/OIDC without leaking protocol details
 *
 * What AuthContext DOES:
 * ---------------------
 * - Stores the OAuth access token issued by Keycloak
 * - Stores the refresh token (if enabled)
 * - Exposes the current authentication status (authenticated / unauthenticated)
 * - Provides login() and logout() helpers
 * - Provides a refreshToken() helper when needed
 *
 * What AuthContext DOES NOT do:
 * ----------------------------
 * - It does NOT validate JWT signatures
 * - It does NOT decode roles or permissions
 * - It does NOT decide access rights
 * - It does NOT communicate with backend services directly
 *
 * Architectural Role
 * ------------------
 * AuthContext acts as a thin client-side session container.
 * All security decisions are enforced by the API Gateway.
 *
 * The frontend trusts Keycloak to authenticate users
 * and trusts the Gateway to authorize requests.
 *
 * In short:
 * AuthContext remembers "who I am logged in as",
 * but never decides "what I am allowed to do".
 */

import React, { createContext, useContext, useMemo, useState } from "react";
import { generateCodeChallenge, generateCodeVerifier } from "@/lib/pkce";

type AuthContextValue = {
  isAuthenticated: boolean;
  token: string | null;

  // OAuth / OIDC
  loginSSO: () => Promise<void>;
  completeLogin: (token: string) => void;
  refreshToken: () => Promise<string | null>;
  logout: () => void;
};

const TOKEN_KEY = "altair_token";
const REFRESH_KEY = "altair_refresh_token";
const PKCE_KEY = "pkce_verifier";
const STATE_KEY = "oauth_state";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    const t = sessionStorage.getItem(TOKEN_KEY);
    return typeof t === "string" && t.length > 0 ? t : null;
  });

  /**
   * OAuth redirect to Keycloak (Authorization Code + PKCE).
   * This function ONLY triggers a browser redirect.
   */
  const loginSSO = async () => {
  const baseUrl = import.meta.env.VITE_KEYCLOAK_URL;
  const realm = import.meta.env.VITE_KEYCLOAK_REALM;
  const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID;

  if (!baseUrl || !realm || !clientId) {
    console.error("Missing Keycloak environment variables");
    return;
  }

  const redirectUri = `${window.location.origin}/auth/callback`;

  const state = crypto.randomUUID();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  sessionStorage.setItem("oauth_state", state);
  sessionStorage.setItem("pkce_verifier", codeVerifier);

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    scope: "openid",
    redirect_uri: redirectUri,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  const authUrl =
    `${baseUrl}/realms/${realm}/protocol/openid-connect/auth?` +
    params.toString();

  window.location.assign(authUrl);
};


  /**
   * Final step of a successful OAuth authentication.
   * This is the ONLY place where frontend auth state is hydrated.
   */
  const completeLogin = (accessToken: string) => {
    console.log("completeLogin called");
    console.log("token length =", accessToken.length);

    sessionStorage.setItem(TOKEN_KEY, accessToken);
    setToken(accessToken);
  };

  console.log("sessionStorage token =", sessionStorage.getItem("altair_token"));


  /**
   * Refresh access token using refresh_token (OAuth public client).
   */
  const refreshToken = async (): Promise<string | null> => {
    const refresh = sessionStorage.getItem(REFRESH_KEY);
    if (!refresh) return null;

    const baseUrl = import.meta.env.VITE_KEYCLOAK_URL;
    const realm = import.meta.env.VITE_KEYCLOAK_REALM;
    const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID;

    if (!baseUrl || !realm || !clientId) {
      return null;
    }

    try {
      const body = new URLSearchParams({
        grant_type: "refresh_token",
        client_id: clientId,
        refresh_token: refresh,
      });

      const res = await fetch(
        `${baseUrl}/realms/${realm}/protocol/openid-connect/token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body,
        }
      );

      if (!res.ok) {
        logout();
        return null;
      }

      const data = await res.json();

      if (typeof data.access_token !== "string") {
        logout();
        return null;
      }

      if (typeof data.refresh_token === "string") {
        sessionStorage.setItem(REFRESH_KEY, data.refresh_token);
      }

      completeLogin(data.access_token);
      return data.access_token;
    } catch {
      logout();
      return null;
    }
  };

  /**
   * Clears frontend authentication state.
   * Does NOT perform Keycloak SSO logout (handled separately).
   */
  const logout = () => {
    console.trace("LOGOUT CALLED");

    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
    sessionStorage.removeItem(PKCE_KEY);
    sessionStorage.removeItem(STATE_KEY);

    setToken(null);
  };

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(token),
      token,
      loginSSO,
      completeLogin,
      refreshToken,
      logout,
    }),
    [token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("AuthProvider missing");
  }
  return ctx;
}
