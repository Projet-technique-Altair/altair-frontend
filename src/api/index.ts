/**
 * @file API Gateway client for Altair frontend.
 * Replaces all mock data with real HTTP calls to the Rust gateway.
 */

const BASE_URL = "http://localhost:3000";

// ---------------------- USERS ----------------------

export async function getMe() {
  const res = await fetch(`${BASE_URL}/users/me`);
  if (!res.ok) throw new Error("Failed to fetch /me");
  return res.json();
}

// ---------------------- LABS ----------------------

export async function getLabs() {
  const res = await fetch(`${BASE_URL}/labs`);
  if (!res.ok) throw new Error("Failed to fetch labs");
  return res.json();
}

export async function getLabById(labId: string) {
  const res = await fetch(`${BASE_URL}/labs/${labId}`);
  if (!res.ok) throw new Error(`Lab ${labId} not found`);
  return res.json();
}

export async function startLab(labId: string) {
  const res = await fetch(`${BASE_URL}/labs/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lab_id: labId }),
  });
  if (!res.ok) throw new Error("Failed to start lab");
  return res.json();
}

export async function stopLab(labId: string) {
  const res = await fetch(`${BASE_URL}/labs/stop`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lab_id: labId }),
  });
  if (!res.ok) throw new Error("Failed to stop lab");
  return res.json();
}

// ---------------------- SESSIONS ----------------------

export async function getSessions() {
  const res = await fetch(`${BASE_URL}/sessions`);
  if (!res.ok) throw new Error("Failed to fetch sessions");
  return res.json();
}

// ---------------------- STARPATHS (optional future endpoints) ----------------------
// TODO when gateway exposes /starpaths

export const api = {
  getMe,
  getLabs,
  getLabById,
  startLab,
  stopLab,
  getSessions,
};
