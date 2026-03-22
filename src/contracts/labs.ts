export type LabVisibility = "PRIVATE" | "PUBLIC";
export type LabDifficulty = "EASY" | "MEDIUM" | "HARD";

export interface Lab {
  lab_id: string;
  creator_id: string;

  name: string;
  description?: string | null;

  difficulty?: LabDifficulty | null;
  category?: string | null;

  visibility: LabVisibility;

  template_path?: string | null;
  lab_type: string;

  lab_family: string;
  lab_delivery: string;

  runtime: {
    app_port?: number | null;
    services: unknown[];
    entrypoints: unknown[];
  };

  objectives?: string | null;
  prerequisites?: string | null;
  story?: string | null;

  estimated_duration?: string | null;
}

/**
 * Payload for create/update.
 * Keep it strict to what frontend is allowed to send.
 * (IDs are optional; backend may enforce creator_id from JWT anyway.)
 */
export interface LabUpsertPayload {
  name: string;
  description?: string | null;
  difficulty?: string | null;
  visibility?: "private" | "public"; // 👈 input = lowercase

  template_path: string;

  lab_type?: string;
  lab_family?: string;
  lab_delivery?: string;

  runtime?: {
    app_port?: number | null;
    services?: unknown[];
    entrypoints?: unknown[];
  };

  estimated_duration?: string | null;
}
