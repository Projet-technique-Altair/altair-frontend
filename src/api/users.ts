/**
 * @file Users API client
 * All calls go through the API Gateway
 */

import { request } from "./client"
import type { AdminUser, AdminUserDetail, PaginatedResponse, SearchUserResult } from "./types"

// =====================
// ===== USERS =========
// =====================

/**
 * Get current authenticated user
 * Gateway extracts user from JWT
 * GET /users/me
 */
export function getMe() {
  return request<{
    user_id: string
    pseudo?: string
    role?: string
    email?: string
    roles: string[]
    metadata?: Record<string, unknown>
  }>("/users/me")
}

/**
 * Get user by id (creator / admin only)
 * GET /users/:id
 */
/*export function getUserById(userId: string) {
  return request<{
    user_id: string
    email?: string
    roles: string[]
    metadata?: Record<string, unknown>
  }>(`/users/users/${userId}`)
}*/
export function getUserById(userId: string) {
  return request(`/users/users/${userId}`);
}


export function searchUsers(query: string) {
  return request<SearchUserResult[]>(`/users/search?q=${encodeURIComponent(query)}`);
}

export function getAdminUsers(params: {
  q?: string;
  role?: string;
  account_status?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const search = new URLSearchParams();
  if (params.q) {
    search.set("q", params.q);
  }
  if (params.role) {
    search.set("role", params.role);
  }
  if (params.account_status) {
    search.set("account_status", params.account_status);
  }
  if (params.limit) {
    search.set("limit", String(params.limit));
  }
  if (params.offset) {
    search.set("offset", String(params.offset));
  }

  const suffix = search.toString() ? `?${search.toString()}` : "";
  return request<PaginatedResponse<AdminUser>>(`/users/admin/users${suffix}`);
}

export function getAdminUserDetail(userId: string) {
  return request<AdminUserDetail>(`/users/admin/users/${userId}/detail`);
}

export function createAdminUserSanction(
  userId: string,
  payload: {
    action: "warn" | "suspend" | "ban";
    reason: string;
    duration_days?: number;
  },
) {
  return request<{ user: AdminUser }>(`/users/admin/users/${userId}/sanctions`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAdminUserAccountStatus(
  userId: string,
  payload: {
    account_status: "active" | "suspended" | "banned";
    reason?: string;
  },
) {
  return request<AdminUser>(`/users/admin/users/${userId}/account-status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function getUserPseudo(userId: string) {
  return request<{
    user_id: string;
    pseudo: string;
  }>(`/users/users/${userId}/pseudo`);
}
