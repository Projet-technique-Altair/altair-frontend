/**
 * API Contracts (Gateway) — Labs
 * Aligned with PostgreSQL schema from 001_init.sql
 */

export type LabVisibility = "public" | "private";

/**
 * DB-aligned representation of a lab returned by the Gateway.
 * Note: several fields are nullable in DB, so we model them as `T | null`.
 */
export interface Lab {
  lab_id: string;

  creator_id: string;

  organization_id: string | null;
  scenario_id: string | null;

  name: string;
  description: string | null;

  // In SQL: TEXT (comment says could be an enum later)
  difficulty: string | null;

  visibility: LabVisibility;

  path: string | null;         // slug / logical path
  image: string | null;

  runtime_limit: number | null; // minutes or seconds (as per comment)
  tags: unknown | null;         // JSONB
  estimated_time: number | null;

  validated: boolean;
  version: number;

  note: number | null;          // NUMERIC(3,2) -> number côté TS

  date_of_creation: string;     // ISO timestamp (from gateway)
  updated_at: string;           // ISO timestamp (from gateway)
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
  visibility?: LabVisibility;

  organization_id?: string | null;
  scenario_id?: string | null;

  path?: string | null;
  image?: string | null;

  runtime_limit?: number | null;
  tags?: unknown | null;
  estimated_time?: number | null;

  // validated/version/note/date_of_creation/updated_at -> typically server-managed
}
