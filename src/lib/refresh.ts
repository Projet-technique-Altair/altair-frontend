const TOKEN_KEY = "altair_token";
const REFRESH_KEY = "altair_refresh_token";

type RefreshTokenResponse = {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
};

function isRefreshTokenResponse(value: unknown): value is RefreshTokenResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "access_token" in value &&
    typeof value.access_token === "string"
  );
}

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

  if (!isRefreshTokenResponse(data)) {
    return null;
  }

  if (typeof data.refresh_token === "string") {
    sessionStorage.setItem(REFRESH_KEY, data.refresh_token);
  }

  sessionStorage.setItem(TOKEN_KEY, data.access_token);

  if (typeof data.id_token === "string") {
    sessionStorage.setItem("altair_id_token", data.id_token);
  }

  return data.access_token;
}
