import { request } from "./client"

export function getSession(id: string) {
  return request(`/sessions/${id}`)
}

export function getUserSessions(userId: string) {
  return request(`/sessions/user/${userId}`)
}

export function getLabSessions(labId: string) {
  return request(`/sessions/lab/${labId}`)
}

export function stopSession(sessionId: string) {
  return request(`/sessions/${sessionId}`, {
    method: "DELETE",
  })
}