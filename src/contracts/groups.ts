/**
 * API Contracts (Gateway) — Groups
 * Aligned with PostgreSQL schema from groups table
 */

export interface Group {
  group_id: string;

  creator_id: string;

  name: string;
  description: string | null;

  created_by: string;

  created_at: string; // ISO timestamp
}
