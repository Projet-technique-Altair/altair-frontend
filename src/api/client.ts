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

export const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL

async function performRequest(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
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

  return res
}

export async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await performRequest(path, options)

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

export async function requestNoContent(
  path: string,
  options: RequestInit = {}
): Promise<void> {
  const res = await performRequest(path, options)
  const contentType = res.headers.get("content-type") || ""

  if (!res.ok) {
    if (contentType.includes("application/json")) {
      const parsed = await res.json()
      throw new ApiError(
        res.status,
        parsed?.error?.message ?? "Unknown error",
        parsed?.error?.code
      )
    }

    const text = await res.text()
    throw new ApiError(res.status, text)
  }
}
