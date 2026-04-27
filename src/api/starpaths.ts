import { request } from "./client";
import type {
  Starpath,
  StarpathUpsertPayload,
  StarpathLabUpsertPayload,
  StarpathProgress,
} from "@/contracts/starpaths";
import type { GroupLabResult, PaginatedResponse, SearchStarpathResult } from "./types";

/* =========================
   Starpaths CRUD
========================= */

export function getStarpaths() {
  return request<Starpath[]>("/starpaths/starpaths");
}

export function getAdminStarpaths(params: {
  q?: string;
  visibility?: "all" | "public" | "private";
  content_status?: "all" | "active" | "archived";
  limit?: number;
  offset?: number;
} = {}) {
  const search = new URLSearchParams();
  if (params.q) {
    search.set("q", params.q);
  }
  if (params.visibility) {
    search.set("visibility", params.visibility);
  }
  if (params.content_status) {
    search.set("content_status", params.content_status);
  }
  if (params.limit) {
    search.set("limit", String(params.limit));
  }
  if (params.offset) {
    search.set("offset", String(params.offset));
  }

  const suffix = search.toString() ? `?${search.toString()}` : "";
  return request<PaginatedResponse<Starpath>>(`/starpaths/admin/starpaths${suffix}`);
}

export function getAdminUserStarpathProgress(userId: string) {
  return request<
    {
      user_id: string;
      starpath_id: string;
      current_position: number;
      status: string;
      started_at: string;
      completed_at?: string | null;
    }[]
  >(`/starpaths/admin/users/${userId}/progress`);
}

export function getMyStarpaths() {
  return request<Starpath[]>("/starpaths/mystarpaths");
}

export function getStarpath(id: string) {
  return request<Starpath>(`/starpaths/starpaths/${id}`);
}

export function searchStarpaths(query: string) {
  return request<SearchStarpathResult[]>(`/starpaths/search?q=${encodeURIComponent(query)}`);
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

export function updateAdminStarpathVisibility(id: string, visibility: "private" | "public") {
  return request<Starpath>(`/starpaths/starpaths/${id}`, {
    method: "PUT",
    body: JSON.stringify({ visibility }),
  });
}

export function updateAdminStarpathContentStatus(id: string, content_status: "active" | "archived") {
  return request<Starpath>(`/starpaths/admin/starpaths/${id}/content-status`, {
    method: "PATCH",
    body: JSON.stringify({ content_status }),
  });
}

/* =========================
   Starpath Labs
========================= */

export function getStarpathLabs(starpathId: string) {
  return request<GroupLabResult[]>(
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
