import { request } from "@/api/client";

export type AdminCapsule = {
  capsule_type: string;
  price_starlight: number;
  common_rate: number;
  rare_rate: number;
  epic_rate: number;
  legendary_rate: number;
  rare_pity_threshold: number;
  epic_pity_threshold: number;
  is_active: boolean;
};

export type AdminConstellation = {
  capsule_type: string;
  item_code: string;
  name: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  hemisphere: "northern" | "southern" | "both" | "unknown";
  weight: number;
  is_active: boolean;
  image_url: string;
  description_short: string;
  description_full: string;
  location_label: string;
  history_text: string;
  technical_details: string;
  legend_text: string;
  nasa_image_url: string;
  nasa_image_title: string;
  nasa_image_description: string;
  astronomy_source_url: string;
  mythology_source_url: string;
  nasa_source_url: string;
};

export type AdminGamificationDashboard = {
  summary: {
    capsule_count: number;
    constellation_count: number;
    active_constellation_count: number;
  };
  capsules: AdminCapsule[];
  constellations: AdminConstellation[];
};

export async function getAdminGamificationDashboard(): Promise<AdminGamificationDashboard> {
  return request("/gamification/admin/gamification/dashboard");
}

export async function updateAdminCapsule(
  capsuleType: string,
  payload: AdminCapsule,
): Promise<{ capsule: AdminCapsule }> {
  return request(`/gamification/admin/gamification/capsules/${capsuleType}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminConstellation(
  itemCode: string,
  payload: AdminConstellation,
): Promise<{ constellation: AdminConstellation }> {
  return request(`/gamification/admin/gamification/constellations/${itemCode}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
