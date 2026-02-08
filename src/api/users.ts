/**
 * @file Users API client
 * All calls go through the API Gateway
 */

import { request } from "./client"

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
    email?: string
    roles: string[]
    metadata?: Record<string, unknown>
  }>("/users/me")
}

/**
 * Get user by id (creator / admin only)
 * GET /users/:id
 */
export function getUserById(userId: string) {
  return request<{
    user_id: string
    email?: string
    roles: string[]
    metadata?: Record<string, unknown>
  }>(`/users/users/${userId}`)
}
