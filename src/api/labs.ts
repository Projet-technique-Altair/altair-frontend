import { request } from "./client";
import type { Lab, LabUpsertPayload } from "@/contracts/labs";
import type { SessionSummary } from "./sessions";
import type { LabFileEntry, LabHint, LabStep, PaginatedResponse, SearchLabResult } from "./types";

/* =======================================================
   LABS
======================================================= */

export function getLabs() {
  return request<Lab[]>("/labs/labs");
}

export function getAdminLabs(params: {
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
  return request<PaginatedResponse<Lab>>(`/labs/admin/labs${suffix}`);
}

export function getMyLabs() {
  return request<Lab[]>("/labs/mylabs");
}

export function searchLabs(query: string) {
  return request<SearchLabResult[]>(`/labs/search?q=${encodeURIComponent(query)}`);
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

export function updateAdminLabVisibility(id: string, visibility: "private" | "public") {
  return request<Lab>(`/labs/labs/${id}`, {
    method: "PUT",
    body: JSON.stringify({ visibility }),
  });
}

export function updateAdminLabContentStatus(id: string, content_status: "active" | "archived") {
  return request<Lab>(`/labs/admin/labs/${id}/content-status`, {
    method: "PATCH",
    body: JSON.stringify({ content_status }),
  });
}

export function deleteLab(id: string) {
  return request<void>(`/labs/labs/${id}`, {
    method: "DELETE",
  });
}

export function startLab(labId: string) {
  return request<SessionSummary>(`/sessions/labs/${labId}/start`, {
    method: "POST",
  });
}

/* =======================================================
   LAB STEPS
======================================================= */

export function getSteps(labId: string) {
  return request<LabStep[]>(`/labs/labs/${labId}/steps`);
}

export function getEditableSteps(labId: string) {
  return request<LabStep[]>(`/labs/labs/${labId}/steps/edit`);
}

export function createStep(labId: string, payload: LabStep) {
  return request<LabStep>(`/labs/labs/${labId}/steps`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateStep(labId: string, stepId: string, payload: LabStep) {
  return request<LabStep>(`/labs/labs/${labId}/steps/${stepId}`, {
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
  return request<LabHint[]>(`/labs/labs/${labId}/steps/${stepId}/hints`);
}

export function createHint(labId: string, stepId: string, payload: LabHint) {
  return request<LabHint>(`/labs/labs/${labId}/steps/${stepId}/hints`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateHint(
  labId: string,
  stepId: string,
  hintId: string,
  payload: LabHint
) {
  return request<LabHint>(`/labs/labs/${labId}/steps/${stepId}/hints/${hintId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteHint(labId: string, stepId: string, hintId: string) {
  return request<void>(`/labs/labs/${labId}/steps/${stepId}/hints/${hintId}`, {
    method: "DELETE",
  });
}

/* =======================================================
   LAB FILES
======================================================= */

export function listLabFiles(labId: string) {
  return request<LabFileEntry[]>(`/labs/labs/${labId}/files`);
}

async function fetchLabFileResponse(
  labId: string,
  filePath: string,
  suffix = "",
) {
  const gatewayUrl = import.meta.env.VITE_GATEWAY_URL;
  let token = sessionStorage.getItem("altair_token");
  const basePath = suffix
    ? `/labs/labs/${labId}/files/file/${suffix}`
    : `/labs/labs/${labId}/files/file`;
  const url = `${gatewayUrl}${basePath}?path=${encodeURIComponent(filePath)}`;

  const makeRequest = async (authToken?: string) =>
    fetch(url, {
      method: "GET",
      headers: {
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
    });

  let res = await makeRequest(token || undefined);
  if (res.status === 401) {
    const { refreshAccessToken } = await import("@/lib/refresh");
    token = await refreshAccessToken();
    if (token) {
      res = await makeRequest(token);
    }
  }

  return res;
}

export async function getLabFilePreview(labId: string, filePath: string) {
  const res = await fetchLabFileResponse(labId, filePath);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to preview file (${res.status})`);
  }

  return res.text();
}

export async function downloadLabFile(labId: string, filePath: string) {
  const res = await fetchLabFileResponse(labId, filePath, "raw");

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to download file (${res.status})`);
  }

  return res.blob();
}

export function uploadLabFile(labId: string, path: string, file: File) {
  const formData = new FormData();
  formData.append("path", path);
  formData.append("file", file);

  return request<void>(`/labs/labs/${labId}/files/file`, {
    method: "POST",
    body: formData,
  });
}

export function deleteLabFile(labId: string, path: string) {
  return request<void>(
    `/labs/labs/${labId}/files/file?path=${encodeURIComponent(path)}`,
    {
      method: "DELETE",
    },
  );
}
