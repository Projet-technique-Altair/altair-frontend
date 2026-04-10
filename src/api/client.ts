import { refreshAccessToken } from "@/lib/refresh";

export class ApiError extends Error {
  status: number
  code?: string

  constructor(status: number, message: string, code?: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL

export async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  let token = sessionStorage.getItem("altair_token")

  const method = options.method?.toUpperCase()
  const shouldHaveBody = ["POST", "PUT", "PATCH"].includes(method || "")

  const body =
    options.body ??
    (shouldHaveBody ? JSON.stringify({}) : undefined)

  const makeRequest = async (authToken?: string) => {
    console.log("BODY SENT =", body)
    return fetch(`${GATEWAY_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
        ...options.headers,
      },
      body,
    })
  }

  let res = await makeRequest(token || undefined)

  if (res.status === 401) {
    token = await refreshAccessToken()

    if (token) {
      res = await makeRequest(token)
    }
  }

  const contentType = res.headers.get("content-type") || ""

  let parsed: any = null

  if (contentType.includes("application/json")) {
    parsed = await res.json()
  } else {
    const text = await res.text()
    throw new ApiError(res.status, text)
  }

  if (!res.ok) {
    throw new ApiError(
      res.status,
      parsed?.error?.message ?? "Unknown error",
      parsed?.error?.code
    )
  }

  return parsed.data
}