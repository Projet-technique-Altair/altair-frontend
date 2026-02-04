import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { createApiClient } from "@/lib/apiClient";

/**
 * React hook exposing a preconfigured API client
 * with automatic token injection and refresh handling.
 */
export function useApi() {
  const { token, refreshToken } = useAuth();

  const apiFetch = useMemo(
    () => createApiClient(() => token, refreshToken),
    [token, refreshToken]
  );

  return apiFetch;
}
