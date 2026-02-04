const REFRESH_KEY = "refresh_token";

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = sessionStorage.getItem(REFRESH_KEY);
  if (!refreshToken) return null;

  const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID;
  const keycloakUrl = import.meta.env.VITE_KEYCLOAK_URL;
  const realm = import.meta.env.VITE_KEYCLOAK_REALM;

  if (
    typeof clientId !== "string" ||
    typeof keycloakUrl !== "string" ||
    typeof realm !== "string"
  ) {
    return null;
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    refresh_token: refreshToken,
  });

  const res = await fetch(
    `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    }
  );

  if (!res.ok) {
    return null;
  }

  const data: unknown = await res.json();

  if (
    typeof data !== "object" ||
    data === null ||
    typeof (data as any).access_token !== "string"
  ) {
    return null;
  }

  if (typeof (data as any).refresh_token === "string") {
    sessionStorage.setItem(REFRESH_KEY, (data as any).refresh_token);
  }

  return (data as any).access_token;
}
