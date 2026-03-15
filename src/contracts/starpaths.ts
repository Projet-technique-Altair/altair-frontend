export type Starpath = {
  starpath_id: string;
  name: string;
  description?: string;
  difficulty?: string;
};

export type StarpathUpsertPayload = {
  name: string;
  description?: string;
  difficulty?: string;
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