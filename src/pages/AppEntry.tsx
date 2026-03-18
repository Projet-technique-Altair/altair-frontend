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



import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/useAuth";

const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

export default function AppEntry() {
  const navigate = useNavigate();
  const { token: ctxToken, logout } = useAuth();
  

  // ✅ fallback anti-race-condition
  const token = ctxToken ?? sessionStorage.getItem("altair_token");

  useEffect(() => {
    if (!token) {
      navigate("/", { replace: true });
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
          navigate("/", { replace: true });
          return;
        }

        if (res.status === 403) {
          navigate("/", { replace: true });
          return;
        }

        const contentType = res.headers.get("content-type") ?? "";
        if (!res.ok) {
          navigate("/", { replace: true });
          return;
        }

        if (!contentType.includes("application/json")) {
          // 🔥 très bon indicateur de "API_URL mauvais → tu hits ton frontend (index.html)"
          console.error("Expected JSON, got:", contentType, "final url:", res.url);
          navigate("/", { replace: true });
          return;
        }

        const json = await res.json();
        console.log("FULL /users/me RESPONSE =", json);

        const role = json.role ?? json.data?.role ?? json.user?.role;
        console.log("ROLE RESOLVED =", role);


        switch (role) {
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
        navigate("/", { replace: true });
      }
    }

    resolveUser();
  }, [token, navigate, logout]);

  return null;
}
