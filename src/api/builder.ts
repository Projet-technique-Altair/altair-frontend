import { ApiError } from "./client";

export interface BuilderUploadedFile {
  path: string;
  size_bytes: number;
}

export interface BuilderSourceBundle {
  bundle_id: string;
  lab_id?: string | null;
  requested_by?: string | null;
  workspace_dir: string;
  archive_path: string;
  suggested_gcs_path: string;
  archive_size_bytes: number;
  file_count: number;
  files: BuilderUploadedFile[];
  created_at: string;
}

export interface BuilderBuildJob {
  build_id: string;
  lab_id?: string | null;
  requested_by?: string | null;
  status: "QUEUED" | "SUBMITTED" | "READY";
  dispatch_mode: "LOCAL_DOCKER_KIND" | "CLOUD_BUILD";
  image_name: string;
  image_tag: string;
  template_path: string;
  source_archive_path: string;
  dockerfile_path: string;
  gcp_region: string;
  build_source_bucket: string;
  local_kind_cluster_name?: string | null;
  loaded_to_kind: boolean;
  cloud_build_id?: string | null;
  cloud_build_name?: string | null;
  cloud_build_operation_name?: string | null;
  cloud_build_log_url?: string | null;
  versioned_image_uri: string;
  latest_image_uri: string;
  created_at: string;
}

export interface BuildFromUploadResponse {
  source_bundle: BuilderSourceBundle;
  build_job: BuilderBuildJob;
}

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL.replace(/\/$/, "");

export async function createBuildFromUpload(
  formData: FormData
): Promise<BuildFromUploadResponse> {
  const token = sessionStorage.getItem("altair_token");

  const res = await fetch(`${GATEWAY_URL}/lab-builder/builds/from-upload`, {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  let body: unknown;

  try {
    body = await res.json();
  } catch {
    throw new ApiError(res.status, "Builder returned a non-JSON response");
  }

  const payload = body as {
    data?: BuildFromUploadResponse;
    error?: { message?: string; code?: string };
  };

  if (!res.ok) {
    throw new ApiError(
      res.status,
      payload?.error?.message ?? "Failed to build lab files",
      payload?.error?.code
    );
  }

  if (!payload?.data) {
    throw new ApiError(res.status, "Builder response is missing data");
  }

  return payload.data;
}
