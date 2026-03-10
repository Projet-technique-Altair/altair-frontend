import { request } from "./client"

export type SessionSummary = {
  session_id: string
  user_id: string
  lab_id: string
  container_id?: string | null
  status?: string
  webshell_url?: string | null
}

export type SessionProgress = {
  progress_id: string
  session_id: string
  current_step: number
  completed_steps: number[]
  hints_used: string[]
  attempts: number
  score: number
  max_score: number
}

export function getSession(id: string) {
  return request<any>(`/sessions/sessions/${id}`)
}

export function getSessionProgress(id: string) {
  return request<SessionProgress>(`/sessions/sessions/${id}/progress`)
}

export function validateSessionStep(sessionId: string, stepNumber: number, userAnswer: string) {
  return request<any>(`/sessions/sessions/${sessionId}/validate-step`, {
    method: "POST",
    body: JSON.stringify({
      step_number: stepNumber,
      user_answer: userAnswer,
    }),
  })
}

export function requestSessionHint(sessionId: string, stepNumber: number, hintNumber: number) {
  return request<any>(`/sessions/sessions/${sessionId}/request-hint`, {
    method: "POST",
    body: JSON.stringify({
      step_number: stepNumber,
      hint_number: hintNumber,
    }),
  })
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
