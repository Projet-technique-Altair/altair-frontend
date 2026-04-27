import { request } from "./client";
import type { Group } from "@/contracts/groups";
import type { GroupLabResult, GroupMemberResult, GroupStarpathResult, PaginatedResponse } from "./types";

export type AdminGroupDetail = {
  group: Group;
  members: GroupMemberResult[];
  labs: GroupLabResult[];
  starpaths: GroupStarpathResult[];
};

/* =========================
   Groups CRUD
========================= */

export function getGroups() {
  return request<Group[]>("/groups/groups");
}

export function getAdminGroups(params: {
  q?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const search = new URLSearchParams();
  if (params.q) {
    search.set("q", params.q);
  }
  if (params.limit) {
    search.set("limit", String(params.limit));
  }
  if (params.offset) {
    search.set("offset", String(params.offset));
  }

  const suffix = search.toString() ? `?${search.toString()}` : "";
  return request<PaginatedResponse<Group>>(`/groups/admin/groups${suffix}`);
}

export function getAdminUserGroups(userId: string) {
  return request<Group[]>(`/groups/admin/users/${userId}/groups`);
}

export function getAdminGroupDetail(groupId: string) {
  return request<AdminGroupDetail>(`/groups/admin/groups/${groupId}/detail`);
}

export function updateAdminGroupStatus(groupId: string, status: "active" | "locked") {
  return request<Group>(`/groups/admin/groups/${groupId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function getMyGroups() {
  return request<Group[]>("/groups/mygroups");
}

export function getGroupById(groupId: string) {
  return request<Group>(`/groups/groups/${groupId}`);
}

export function createGroup(payload: {
  name: string;
  description?: string;
}) {
  return request<Group>("/groups/groups", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateGroup(
  groupId: string,
  payload: {
    name?: string;
    description?: string;
  }
) {
  return request<Group>(`/groups/groups/${groupId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteGroup(groupId: string) {
  return request<void>(`/groups/groups/${groupId}`, {
    method: "DELETE",
  });
}

/* =========================
   Members
========================= */

export function getGroupMembers(groupId: string) {
  return request<GroupMemberResult[]>(`/groups/groups/${groupId}/members`);
}

export function addGroupMember(groupId: string, userId: string) {
  return request<void>(`/groups/groups/${groupId}/members`, {
    method: "POST",
    body: JSON.stringify({ user_id: userId }),
  });
}

export function removeGroupMember(groupId: string, userId: string) {
  return request<void>(
    `/groups/groups/${groupId}/members/${userId}`,
    {
      method: "DELETE",
    }
  );
}

/* =========================
   Labs assignments
========================= */

export function getGroupLabs(groupId: string) {
  return request<GroupLabResult[]>(`/groups/groups/${groupId}/labs`);
}

export function assignLabToGroup(groupId: string, labId: string) {
  return request<void>(`/groups/groups/${groupId}/labs`, {
    method: "POST",
    body: JSON.stringify({ lab_id: labId }),
  });
}

export function unassignLabFromGroup(groupId: string, labId: string) {
  return request<void>(
    `/groups/groups/${groupId}/labs/${labId}`,
    {
      method: "DELETE",
    }
  );
}

/* =========================
   Starpaths assignments
========================= */

export function getGroupStarpaths(groupId: string) {
  return request<GroupStarpathResult[]>(
    `/groups/groups/${groupId}/starpaths`
  );
}

export function assignStarpathToGroup(
  groupId: string,
  starpathId: string
) {
  return request<void>(
    `/groups/groups/${groupId}/starpaths`,
    {
      method: "POST",
      body: JSON.stringify({ starpath_id: starpathId }),
    }
  );
}

export function unassignStarpathFromGroup(
  groupId: string,
  starpathId: string
) {
  return request<void>(
    `/groups/groups/${groupId}/starpaths/${starpathId}`,
    {
      method: "DELETE",
    }
  );
}
