/**
 * @file AppEntry.tsx
 *
 * Post-authentication entry point for the Altaïr application.
 *
 * This component is mounted immediately after a successful OAuth login.
 * It does NOT assume anything about the user's role or permissions.
 *
 * Responsibilities:
 * - Call the backend `/users/me` endpoint via the API Gateway
 * - Let the backend decide the user's effective role
 * - Redirect the user to the appropriate application area
 *
 * Non-responsibilities:
 * - No JWT decoding
 * - No role inference from token
 * - No authorization logic
 *
 * This component acts as a neutral handoff point between
 * authentication (Keycloak) and authorization (Gateway + backend).
 */

/*import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL as string;

type MeResponse = {
  role: "learner" | "creator" | "admin";
};

export default function AppEntry() {
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    async function resolveUser() {
      try {
        const url = `${API_URL}/users/me`; 

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        // Auth invalid -> logout
        if (res.status === 401) {
          console.error("AppEntry: 401 from /users/me (token invalid/expired)");
          logout();
          navigate("/login", { replace: true });
          return;
        }

        // Auth ok but not allowed -> do NOT logout
        if (res.status === 403) {
          console.error("AppEntry: 403 from /users/me (access denied)");
          navigate("/forbidden", { replace: true });
          return;
        }

        const contentType = res.headers.get("content-type") ?? "";

        if (!res.ok) {
          const raw = await res.text();
          console.error("AppEntry failed:", res.status, raw);
          navigate("/login", { replace: true });
          return;
        }

        if (!contentType.includes("application/json")) {
          const raw = await res.text();
          console.error("Expected JSON, got:", contentType, "raw:", raw);
          navigate("/login", { replace: true });
          return;
        }

        const data: MeResponse = await res.json();

        switch (data.role) {
          case "admin":
            navigate("/admin", { replace: true });
            break;
          case "creator":
            navigate("/creator/dashboard", { replace: true });
            break;
          case "learner":
          default:
            navigate("/learner/dashboard", { replace: true });
        }
      } catch (err) {
        console.error("AppEntry crashed", err);
        logout();
        navigate("/login", { replace: true });
      }
    }

    resolveUser();
  }, [token, navigate, logout]);

  return null; // no UI, pure redirect logic
}
*/


import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

type MeResponse = { role: "learner" | "creator" | "admin" };

export default function AppEntry() {
  const navigate = useNavigate();
  const { token: ctxToken, logout } = useAuth();

  // ✅ fallback anti-race-condition
  const token = ctxToken ?? sessionStorage.getItem("altair_token");

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    async function resolveUser() {
      try {
        const url = API_URL ? `${API_URL}/users/me` : `/users/me`;

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          cache: "no-store",
        });

        if (res.status === 401) {
          logout();
          navigate("/login", { replace: true });
          return;
        }

        if (res.status === 403) {
          navigate("/forbidden", { replace: true });
          return;
        }

        const contentType = res.headers.get("content-type") ?? "";
        if (!res.ok) {
          navigate("/login", { replace: true });
          return;
        }

        if (!contentType.includes("application/json")) {
          // 🔥 très bon indicateur de "API_URL mauvais → tu hits ton frontend (index.html)"
          console.error("Expected JSON, got:", contentType, "final url:", res.url);
          navigate("/login", { replace: true });
          return;
        }

        const data: MeResponse = await res.json();

        switch (data.role) {
          case "admin":
            navigate("/admin", { replace: true });
            break;
          case "creator":
            navigate("/creator/dashboard", { replace: true });
            break;
          default:
            navigate("/learner/dashboard", { replace: true });
        }
      } catch (err) {
        console.error("AppEntry crashed", err);
        logout();
        navigate("/login", { replace: true });
      }
    }

    resolveUser();
  }, [token, navigate, logout]);

  return null;
}
