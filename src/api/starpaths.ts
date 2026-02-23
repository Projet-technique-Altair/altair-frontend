import { request } from "./client";
import type {
  Starpath,
  StarpathUpsertPayload,
  StarpathLabUpsertPayload,
  StarpathProgress,
} from "@/contracts/starpaths";

/* =========================
   Starpaths CRUD
========================= */

export function getStarpaths() {
  return request<Starpath[]>("/starpaths/starpaths");
}

export function getStarpath(id: string) {
  return request<Starpath>(`/starpaths/starpaths/${id}`);
}

export function createStarpath(payload: StarpathUpsertPayload) {
  return request<Starpath>("/starpaths/starpaths", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateStarpath(
  id: string,
  payload: StarpathUpsertPayload
) {
  return request<Starpath>(`/starpaths/starpaths/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteStarpath(id: string) {
  return request<void>(`/starpaths/starpaths/${id}`, {
    method: "DELETE",
  });
}

/* =========================
   Starpath Labs
========================= */

export function getStarpathLabs(starpathId: string) {
  return request<any[]>(
    `/starpaths/starpaths/${starpathId}/labs`
  );
}

export function addStarpathLab(
  starpathId: string,
  payload: StarpathLabUpsertPayload
) {
  return request<void>(
    `/starpaths/starpaths/${starpathId}/labs`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export function updateStarpathLab(
  starpathId: string,
  labId: string,
  payload: StarpathLabUpsertPayload
) {
  return request<void>(
    `/starpaths/starpaths/${starpathId}/labs/${labId}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );
}

export function deleteStarpathLab(
  starpathId: string,
  labId: string
) {
  return request<void>(
    `/starpaths/starpaths/${starpathId}/labs/${labId}`,
    {
      method: "DELETE",
    }
  );
}

/* =========================
   Runtime (Learner side)
========================= */

export function startStarpath(starpathId: string) {
  return request<void>(
    `/starpaths/starpaths/${starpathId}/start`,
    {
      method: "POST",
    }
  );
}

export function getStarpathProgress(starpathId: string) {
  return request<StarpathProgress>(
    `/starpaths/starpaths/${starpathId}/progress`
  );
}