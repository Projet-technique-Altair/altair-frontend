import { request } from "./client"
import type {
  SessionHintResponse,
  SessionRecord,
  SessionStepValidation,
} from "./types"

export type SessionSummary = {
  session_id: string
  user_id: string
  lab_id: string
  container_id?: string | null
  status?: string
  runtime_kind?: "terminal" | "web" | string | null
  webshell_url?: string | null
  app_url?: string | null
}

export type LearnerLabStatus = "TODO" | "IN_PROGRESS" | "FINISHED"

// Learner dashboard labs are already enriched by sessions-ms so the frontend can render a
// learner-centric board without stitching catalog and status data client-side.
export type LearnerDashboardLab = {
  lab_id: string
  name: string
  description?: string | null
  difficulty?: string | null
  category?: string | null
  visibility?: string | null
  lab_delivery?: string | null
  estimated_duration?: string | null
  template_path?: string | null
  status: LearnerLabStatus
  started_at?: string | null
  finished_at?: string | null
  last_activity_at: string
  progress: number
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
  return request<SessionRecord>(`/sessions/sessions/${id}`)
}

export function getSessionProgress(id: string) {
  return request<SessionProgress>(`/sessions/sessions/${id}/progress`)
}

export function validateSessionStep(sessionId: string, stepNumber: number, userAnswer: string) {
  return request<SessionStepValidation>(`/sessions/sessions/${sessionId}/validate-step`, {
    method: "POST",
    body: JSON.stringify({
      step_number: stepNumber,
      user_answer: userAnswer,
    }),
  })
}

export function requestSessionHint(sessionId: string, stepNumber: number, hintNumber: number) {
  return request<SessionHintResponse>(`/sessions/sessions/${sessionId}/request-hint`, {
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

// Follow state lives in sessions-ms because it is part of the learner<->lab relationship.
export function followLab(labId: string) {
  return request(`/sessions/learner/labs/${labId}/follow`, {
    method: "POST",
  })
}

export function unfollowLab(labId: string) {
  return request(`/sessions/learner/labs/${labId}/follow`, {
    method: "DELETE",
  })
}

// The dashboard endpoint is the single source of truth for TO DO / IN PROGRESS / FINISHED labs.
export function getLearnerDashboardLabs() {
  return request<LearnerDashboardLab[]>("/sessions/learner/dashboard/labs")
}
