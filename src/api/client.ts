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

  let res = await fetch(`${GATEWAY_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  })

  if (res.status === 401) {
    token = await refreshAccessToken()

    if (token) {
      res = await fetch(`${GATEWAY_URL}${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      })
    }
  }

  const body = await res.json()

  if (!res.ok) {
    throw new ApiError(
      res.status,
      body?.error?.message ?? "Unknown error",
      body?.error?.code
    )
  }

  return body.data
}
