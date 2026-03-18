export function createApiClient(
  getToken: () => string | null,
  refreshToken: () => Promise<string | null>
) {
  return async function apiFetch(
    input: RequestInfo | URL,
    init: RequestInit = {}
  ): Promise<Response> {
    const token = getToken();
    const headers = new Headers(init.headers);

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    let res = await fetch(input, { ...init, headers });

    if (res.status === 401) {
      const newToken = await refreshToken();
      if (!newToken) return res;

      headers.set("Authorization", `Bearer ${newToken}`);
      res = await fetch(input, { ...init, headers });
    }

    return res;
  };
}
