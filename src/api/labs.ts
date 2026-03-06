import { request } from "./client";
import type { Lab, LabUpsertPayload } from "@/contracts/labs";

/* =======================================================
   LABS
======================================================= */

export function getLabs() {
  return request<Lab[]>("/labs/labs");
}

export function getMyLabs() {
  return request<Lab[]>("/labs/mylabs");
}

export function getLab(id: string) {
  return request<Lab>(`/labs/labs/${id}`);
}

export function createLab(payload: LabUpsertPayload) {
  return request<Lab>("/labs/labs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateLab(id: string, payload: LabUpsertPayload) {
  return request<Lab>(`/labs/labs/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteLab(id: string) {
  return request<void>(`/labs/labs/${id}`, {
    method: "DELETE",
  });
}

export function startLab(labId: string) {
  return request<{ session_id: string }>(`/sessions/labs/${labId}/start`, {
    method: "POST",
  });
}

/* =======================================================
   LAB STEPS
======================================================= */

export function getSteps(labId: string) {
  return request<any[]>(`/labs/labs/${labId}/steps`);
}

export function createStep(labId: string, payload: any) {
  return request<any>(`/labs/labs/${labId}/steps`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateStep(labId: string, stepId: string, payload: any) {
  return request<any>(`/labs/labs/${labId}/steps/${stepId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteStep(labId: string, stepId: string) {
  return request<void>(`/labs/labs/${labId}/steps/${stepId}`, {
    method: "DELETE",
  });
}

/* =======================================================
   LAB HINTS
======================================================= */

export function getHints(labId: string, stepId: string) {
  return request<any[]>(`/labs/labs/${labId}/steps/${stepId}/hints`);
}

export function createHint(labId: string, stepId: string, payload: any) {
  return request<any>(`/labs/labs/${labId}/steps/${stepId}/hints`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateHint(
  labId: string,
  stepId: string,
  hintId: string,
  payload: any
) {
  return request<any>(`/labs/labs/${labId}/steps/${stepId}/hints/${hintId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteHint(labId: string, stepId: string, hintId: string) {
  return request<void>(`/labs/labs/${labId}/steps/${stepId}/hints/${hintId}`, {
    method: "DELETE",
  });
}