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

export type AdminUser = {
  user_id: string;
  role: string;
  account_status: "active" | "suspended" | "banned";
  name: string;
  pseudo: string;
  email: string;
  avatar?: string | null;
  last_login?: string | null;
  created_at: string;
};

export type UserSanction = {
  sanction_id: string;
  user_id: string;
  actor_user_id: string;
  action: "warn" | "suspend" | "ban";
  reason: string;
  status: "active" | "resolved";
  expires_at?: string | null;
  created_at: string;
  resolved_at?: string | null;
};

export type UserAuditLog = {
  audit_id: string;
  actor_user_id?: string | null;
  target_user_id?: string | null;
  action: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type AdminUserDetail = {
  user: AdminUser;
  sanctions: UserSanction[];
  audit_logs: UserAuditLog[];
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
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
  lab_id: string;
  current_runtime_id?: string | null;
  status?: string;
  runtime_kind?: "terminal" | "web" | string | null;
  webshell_url?: string | null;
};

export type SessionStepValidation = {
  points_earned?: number;
  message?: string;
};

export type SessionHintResponse = {
  hint?: string;
  cost?: number;
};

export type LabFileEntry = {
  path: string;
  size: number;
  updated_at: string;
};
