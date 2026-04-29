export type StarpathVisibility = "PUBLIC" | "PRIVATE";

export type Starpath = {
  starpath_id: string;
  creator_id: string;
  name: string;
  description?: string;
  difficulty?: string;
  visibility: StarpathVisibility;
  content_status?: "active" | "archived";
  created_at: string;
};

export type StarpathUpsertPayload = {
  name: string;
  description?: string;
  difficulty?: string;
  visibility: StarpathVisibility;
};

export type StarpathLabUpsertPayload = {
  lab_id: string;
  position: number;
};

export type StarpathProgress = {
  completed_labs: number;
  total_labs: number;
  percentage: number;
};
