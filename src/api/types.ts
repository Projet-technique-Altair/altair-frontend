export type SearchLabResult = {
  lab_id: string;
  name: string;
  description?: string | null;
  difficulty?: string | null;
  visibility?: string | null;
};

export type SearchUserResult = {
  user_id: string;
  pseudo?: string;
  email?: string;
};

export type SearchStarpathResult = {
  starpath_id: string;
  name: string;
  description?: string | null;
  difficulty?: string | null;
  labs_count?: number;
  created_at?: string;
};

export type GroupMemberResult = {
  user_id: string;
  pseudo?: string;
};

export type GroupLabResult = {
  lab_id: string;
  name?: string;
};

export type GroupStarpathResult = {
  starpath_id: string;
  name?: string;
};

export type LabHint = {
  hint_id?: string;
  hint_number: number;
  cost: number;
  text: string;
};

export type LabStep = {
  step_id?: string;
  step_number: number;
  title: string;
  description: string;
  question: string;
  expected_answer: string;
  validation_type?: "exact_match" | "contains" | "regex";
  validation_pattern?: string | null;
  instruction?: string;
  has_validation?: boolean;
  points?: number;
  hints?: LabHint[];
};

export type SessionRecord = {
  session_id: string;
  status?: string;
  runtime_kind?: "terminal" | "web" | string | null;
  webshell_url?: string | null;
  app_url?: string | null;
};

export type SessionStepValidation = {
  points_earned?: number;
  message?: string;
};

export type SessionHintResponse = {
  hint?: string;
  cost?: number;
};
