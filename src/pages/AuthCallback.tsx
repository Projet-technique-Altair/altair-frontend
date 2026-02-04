/**
 * AuthCallback
 *
 * Purpose
 * -------
 * AuthCallback is the OAuth/OIDC redirect handler.
 *
 * This component is mounted ONLY after a successful redirection
 * from the Keycloak authentication server.
 *
 * It is responsible for:
 * - Reading OAuth parameters from the redirect URL
 * - Completing the Authorization Code + PKCE flow
 * - Exchanging the authorization code for tokens
 * - Storing tokens via AuthContext
 * - Redirecting the user back to the application
 *
 * OAuth Flow Context
 * ------------------
 * 1. User clicks "Login"
 * 2. User is redirected to Keycloak
 * 3. User authenticates (login or register)
 * 4. Keycloak redirects back to /auth/callback
 * 5. AuthCallback exchanges the code for tokens
 * 6. User is redirected to the main application
 *
 * What AuthCallback DOES:
 * ----------------------
 * - Reads `code` (and state if used) from the URL
 * - Sends the Authorization Code to Keycloak token endpoint
 * - Receives access_token (and refresh_token)
 * - Hands tokens to AuthContext
 * - Redirects the user to a safe application route
 *
 * What AuthCallback DOES NOT do:
 * ------------------------------
 * - It does NOT render UI
 * - It does NOT contain business logic
 * - It does NOT inspect user roles
 * - It does NOT call backend APIs
 *
 * Lifecycle
 * ---------
 * AuthCallback exists only during the OAuth redirect phase.
 * Once the token exchange is complete, it immediately navigates away.
 */

import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const PKCE_KEY = "pkce_verifier";
const STATE_KEY = "oauth_state";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { completeLogin, logout } = useAuth();
  const hasRun = useRef(false); // StrictMode guard

  console.log("AuthCallback component mounted");

  useEffect(() => {
    console.log("AuthCallback useEffect running");

    if (hasRun.current) return;
    hasRun.current = true;

    const params = new URLSearchParams(window.location.search);
    console.log("OAuth params:", window.location.search);
    console.log("code =", params.get("code"));
    console.log("state =", params.get("state"));


    const code = params.get("code");
    const returnedState = params.get("state");

    const storedVerifier = sessionStorage.getItem(PKCE_KEY);
    const storedState = sessionStorage.getItem(STATE_KEY);

    // 🔐 OAuth + CSRF validation
    if (
      !code ||
      !returnedState ||
      !storedVerifier ||
      !storedState ||
      returnedState !== storedState
    ) {
      console.error("Invalid OAuth callback parameters");
      logout();
      navigate("/login", { replace: true });
      return;
    }

    const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID;
    const keycloakUrl = import.meta.env.VITE_KEYCLOAK_URL;
    const realm = import.meta.env.VITE_KEYCLOAK_REALM;
    const redirectUri = `${window.location.origin}/auth/callback`;
    const authCode: string = code;
    const pkceVerifier: string = storedVerifier;

    if (!clientId || !keycloakUrl || !realm) {
      console.error("Missing Keycloak environment variables");
      logout();
      navigate("/login", { replace: true });
      return;
    }

    async function exchangeCode() {
      try {
        const body = new URLSearchParams({
          grant_type: "authorization_code",
          client_id: clientId,
          code: authCode,
          code_verifier: pkceVerifier,
          redirect_uri: redirectUri,
        });

        console.log("Exchanging code with Keycloak");

        const res = await fetch(
          `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`,
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body,
          }
        );

        console.log("Token endpoint response status:", res.status);


        if (!res.ok) {
          throw new Error(`Token endpoint failed (${res.status})`);
        }

        const data = await res.json();

        console.log("Token response data:", data);


        if (typeof data.access_token !== "string") {
          throw new Error("Invalid token response");
        }

        // Cleanup temporary OAuth state
        sessionStorage.removeItem(PKCE_KEY);
        sessionStorage.removeItem(STATE_KEY);

        // Hydrate frontend auth state
        completeLogin(data.access_token);

        // 🔁 Neutral redirect – no RBAC decision here
        navigate("/app", { replace: true });
      } catch (err) {
        console.error("SSO exchange failed", err);
        logout();
        navigate("/login", { replace: true });
      }
    }

    exchangeCode();
  }, [navigate, completeLogin, logout]);

  return null;
}
