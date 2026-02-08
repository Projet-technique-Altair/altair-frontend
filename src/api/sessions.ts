import { request } from "./client"

export function getSession(id: string) {
  return request(`/sessions/sessions/${id}`)
}

export function getUserSessions(userId: string) {
  return request(`/sessions/sessions/user/${userId}`)
}

export function getLabSessions(labId: string) {
  return request(`/sessions/sessions/lab/${labId}`)
}

export function stopSession(sessionId: string) {
  return request(`/sessions/sessions/${sessionId}`, {
    method: "DELETE",
  })
}
