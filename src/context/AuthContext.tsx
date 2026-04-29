/**
 * AuthContext
 *
 * Purpose
 * -------
 * AuthContext is the single source of truth for authentication state
 * on the frontend of Altaïr.
 *
 * It is responsible ONLY for:
 * - Holding the authentication state (access token, id token, refresh token, auth status)
 * - Exposing authentication helpers to the React application
 * - Providing a clean abstraction over OAuth/OIDC without leaking protocol details
 *
 * What AuthContext DOES:
 * ---------------------
 * - Stores the OAuth access token issued by Keycloak
 * - Stores the id token (used for Keycloak SSO logout via id_token_hint)
 * - Stores the refresh token (if enabled)
 * - Exposes the current authentication status (authenticated / unauthenticated)
 * - Provides loginSSO(), completeLogin(), and logout() helpers
 * - Provides a refreshToken() helper when needed
 * - Handles the Keycloak SSO logout redirect (including id_token_hint)
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

import React, { useCallback, useMemo, useState } from "react";
import { generateCodeChallenge, generateCodeVerifier } from "@/lib/pkce";
import { AuthContext } from "@/context/auth-context";

const TOKEN_KEY = "altair_token";
const REFRESH_KEY = "altair_refresh_token";
const PKCE_KEY = "pkce_verifier";
const STATE_KEY = "oauth_state";
const ID_TOKEN_KEY = "altair_id_token"; // Required for Keycloak SSO logout (id_token_hint)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    const t = sessionStorage.getItem(TOKEN_KEY);
    return typeof t === "string" && t.length > 0 ? t : null;
  });

  /**
   * OAuth redirect to Keycloak (Authorization Code + PKCE).
   * Generates a PKCE code verifier/challenge and a CSRF state token,
   * stores them in sessionStorage, then redirects the browser to Keycloak.
   * This function ONLY triggers a browser redirect — it does not return a value.
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

    window.location.assign(
      `${baseUrl}/realms/${realm}/protocol/openid-connect/auth?${params}`
    );
  };

  /**
   * Final step of a successful OAuth authentication.
   * This is the ONLY place where frontend auth state is hydrated.
   *
   * Stores the access token in sessionStorage and React state.
   * Also stores the id token if provided — it is required later
   * by logout() to perform a valid Keycloak SSO logout (id_token_hint).
   */
  const completeLogin = useCallback(
    (accessToken: string, idToken?: string, refreshTokenValue?: string) => {
    sessionStorage.setItem(TOKEN_KEY, accessToken);
    if (idToken) sessionStorage.setItem(ID_TOKEN_KEY, idToken);
    if (refreshTokenValue) sessionStorage.setItem(REFRESH_KEY, refreshTokenValue);
    setToken(accessToken);
  }, []);

  /**
   * Clears all frontend authentication state and performs a Keycloak SSO logout.
   *
   * The id token is retrieved BEFORE clearing sessionStorage, as it is required
   * by Keycloak as id_token_hint to validate and complete the SSO logout.
   * Without it, Keycloak (v18+) will reject the logout request with a 400 error.
   *
   * After clearing local state, the browser is redirected to the Keycloak
   * logout endpoint, which then redirects back to the application root.
   */
  const logout = useCallback(() => {
    const idToken = sessionStorage.getItem(ID_TOKEN_KEY); // Must be retrieved before clearing

    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
    sessionStorage.removeItem(PKCE_KEY);
    sessionStorage.removeItem(STATE_KEY);
    sessionStorage.removeItem(ID_TOKEN_KEY);
    setToken(null);

    const baseUrl = import.meta.env.VITE_KEYCLOAK_URL;
    const realm = import.meta.env.VITE_KEYCLOAK_REALM;

    if (!baseUrl || !realm || !idToken) {
      window.location.assign(window.location.origin);
      return;
    }

    const params = new URLSearchParams({
      post_logout_redirect_uri: window.location.origin,
      id_token_hint: idToken,
    });

    window.location.assign(
      `${baseUrl}/realms/${realm}/protocol/openid-connect/logout?${params}`
    );
  }, []);

  /**
   * Refreshes the access token using the stored refresh token (OAuth public client).
   *
   * On success, updates both the access token and refresh token in sessionStorage.
   * Also forwards the new id token to completeLogin() if present in the response,
   * ensuring id_token_hint stays up to date for future logout calls.
   *
   * On failure (expired refresh token, network error, invalid response),
   * logout() is called to clear state and redirect to Keycloak logout.
   */
  const refreshToken = useCallback(async (): Promise<string | null> => {
    const refresh = sessionStorage.getItem(REFRESH_KEY);
    if (!refresh) return null;

    const baseUrl = import.meta.env.VITE_KEYCLOAK_URL;
    const realm = import.meta.env.VITE_KEYCLOAK_REALM;
    const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID;

    if (!baseUrl || !realm || !clientId) return null;

    try {
      const res = await fetch(
        `${baseUrl}/realms/${realm}/protocol/openid-connect/token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            client_id: clientId,
            refresh_token: refresh,
          }),
        }
      );

      if (!res.ok) { logout(); return null; }

      const data = await res.json();
      if (typeof data.access_token !== "string") { logout(); return null; }

      if (typeof data.refresh_token === "string")
        sessionStorage.setItem(REFRESH_KEY, data.refresh_token);

      completeLogin(data.access_token, data.id_token, data.refresh_token); // Keep tokens in sync
      return data.access_token;
    } catch {
      logout();
      return null;
    }
  }, [logout, completeLogin]);

  const value = useMemo(
    () => ({ isAuthenticated: Boolean(token), token, loginSSO, completeLogin, refreshToken, logout }),
    [token, refreshToken, logout, completeLogin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
