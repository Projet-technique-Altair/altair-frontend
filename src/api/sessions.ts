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
  current_runtime_id?: string | null
  status?: string
  runtime_kind?: "terminal" | "web" | string | null
  webshell_url?: string | null
}

export type OpenWebLabResponse = {
  redirect_url: string
}

export type LearnerLabStatus = "TODO" | "IN_PROGRESS" | "FINISHED"

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
  time_elapsed: number
}

export type CompletedSessionStats = {
  completed: boolean
  final_score: number
  max_score: number
  completion_time_seconds: number
  hints_used: number
  total_attempts: number
}

export function getSession(id: string) {
  return request<SessionRecord>(`/sessions/sessions/${id}`)
}

export function openWebLabSession(sessionId: string) {
  return request<OpenWebLabResponse>(`/lab-api/web/open-session/${sessionId}`, {
    method: "POST",
    credentials: "include",
  })
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

export function completeSession(sessionId: string) {
  return request<CompletedSessionStats>(`/sessions/sessions/${sessionId}/complete`, {
    method: "POST",
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

export function getLearnerDashboardLabs() {
  return request<LearnerDashboardLab[]>("/sessions/learner/dashboard/labs")
}
