import { request } from "./client";
import type { Lab, LabUpsertPayload } from "@/contracts/labs";

export function getLabs() {
  return request<Lab[]>("/labs");
}

export function getLab(id: string) {
  return request<Lab>(`/labs/${id}`);
}

export function createLab(payload: LabUpsertPayload) {
  return request<Lab>("/labs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateLab(id: string, payload: LabUpsertPayload) {
  return request<Lab>(`/labs/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteLab(id: string) {
  return request<void>(`/labs/${id}`, {
    method: "DELETE",
  });
}

export function startLab(labId: string) {
  return request<{ session_id: string }>(`/labs/${labId}/start`, {
    method: "POST",
  });
}
