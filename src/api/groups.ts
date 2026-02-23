import { request } from "./client";
import type { Group } from "@/contracts/groups";

/* =========================
   Groups CRUD
========================= */

export function getGroups() {
  return request<Group[]>("/groups/groups");
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
  return request<string[]>(`/groups/groups/${groupId}/members`);
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
  return request<string[]>(`/groups/groups/${groupId}/labs`);
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
  return request<string[]>(
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