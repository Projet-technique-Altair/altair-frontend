import { ApiError, request } from "./client";

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
  status: "QUEUED" | "SUBMITTED" | "READY" | "FAILED";
  failure_message?: string | null;
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

export async function getBuild(buildId: string): Promise<BuilderBuildJob> {
  return request<BuilderBuildJob>(`/lab-builder/builds/${buildId}`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export async function waitForBuildToBeReady(
  buildId: string,
  {
    pollIntervalMs = 1500,
    timeoutMs = 10 * 60 * 1000,
  }: {
    pollIntervalMs?: number;
    timeoutMs?: number;
  } = {}
): Promise<BuilderBuildJob> {
  const deadline = Date.now() + timeoutMs;
  let lastJob: BuilderBuildJob | null = null;

  while (Date.now() < deadline) {
    const job = await getBuild(buildId);
    lastJob = job;

    if (job.status === "READY") {
      return job;
    }

    if (job.status === "FAILED") {
      throw new ApiError(
        500,
        job.failure_message ?? "Lab build failed before the image became ready."
      );
    }

    await sleep(pollIntervalMs);
  }

  throw new ApiError(
    504,
    lastJob?.failure_message ?? "Timed out while waiting for the lab build to finish."
  );
}
