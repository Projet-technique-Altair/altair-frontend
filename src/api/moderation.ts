import { request } from "./client";
import type { PaginatedResponse } from "./types";

export type ReportStatus = "open" | "in_review" | "resolved" | "dismissed";

export type ModerationReport = {
  report_id: string;
  reporter_user_id: string;
  target_type: string;
  target_id: string;
  reason: string;
  details?: string | null;
  status: ReportStatus;
  priority: "low" | "medium" | "high" | "critical";
  assigned_admin_id?: string | null;
  resolution?: string | null;
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
};

export type AuditEvent = {
  audit_id: string;
  actor_user_id?: string | null;
  action: string;
  resource_type: string;
  resource_id?: string | null;
  service?: string | null;
  http_method?: string | null;
  http_path?: string | null;
  status_code?: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export function getAdminReports(params: {
  status?: string;
  target_type?: string;
  q?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  });
  const suffix = search.toString() ? `?${search.toString()}` : "";
  return request<PaginatedResponse<ModerationReport>>(`/moderation/admin/moderation/reports${suffix}`);
}

export function createReport(payload: {
  target_type: "user" | "lab" | "group" | "starpath" | "marketplace" | "gamification";
  target_id: string;
  reason: string;
  details?: string;
  priority?: "low" | "medium" | "high" | "critical";
}) {
  return request<ModerationReport>("/moderation/reports", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function assignAdminReport(reportId: string, assigned_admin_id?: string) {
  return request<ModerationReport>(`/moderation/admin/moderation/reports/${reportId}/assign`, {
    method: "PATCH",
    body: JSON.stringify({ assigned_admin_id }),
  });
}

export function updateAdminReportStatus(reportId: string, status: ReportStatus, resolution?: string) {
  return request<ModerationReport>(`/moderation/admin/moderation/reports/${reportId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, resolution }),
  });
}

export function bulkUpdateAdminReports(payload: {
  report_ids: string[];
  status?: ReportStatus;
  assigned_admin_id?: string;
  resolution?: string;
}) {
  return request<ModerationReport[]>("/moderation/admin/moderation/reports/bulk", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function getAdminAudit(params: {
  resource_type?: string;
  resource_id?: string;
  service?: string;
  q?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  });
  const suffix = search.toString() ? `?${search.toString()}` : "";
  return request<PaginatedResponse<AuditEvent>>(`/moderation/admin/audit${suffix}`);
}

export async function exportAdminAudit(format: "json" | "csv") {
  const gatewayUrl = import.meta.env.VITE_GATEWAY_URL;
  const token = sessionStorage.getItem("altair_token");
  const response = await fetch(`${gatewayUrl}/moderation/admin/audit/export?format=${format}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return format === "csv" ? response.text() : response.json();
}
