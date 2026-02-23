export type Starpath = {
  id: string;
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
  order?: number;
  points?: number;
};

export type StarpathProgress = {
  completed_labs: number;
  total_labs: number;
  percentage: number;
};