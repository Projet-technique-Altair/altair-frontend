import { request } from "@/api/client";

export interface CollectionConstellation {
  item_code: string;
  name: string;
  stars: number;
  duplicate_count: number;
  total_obtained: number;
  image_url?: string;
  rarity?: string;
  description_short?: string;
  description_full?: string;
  hemisphere?: string;
  technical_details?: string;
  legend_text?: string;
  nasa_image_url?: string;
  nasa_image_title?: string;
  nasa_image_description?: string;
  astronomy_source_url?: string;
  mythology_source_url?: string;
  nasa_source_url?: string;
  location_label?: string;
  history_text?: string;
  obtained_at: string;
  updated_at: string;
  next_star_goal?: number | null;
  progress_current: number;
  progress_target?: number | null;
  is_equipped: boolean;
}

export interface CollectionAchievement {
  id: string;
  name: string;
  description: string;
  achievement_type: string;
  reward_cosmetic_id?: string | null;
  is_title: boolean;
  is_active_title: boolean;
  unlocked_at: string;
}

export interface CollectionCosmetic {
  cosmetic_id: string;
  name: string;
  cosmetic_type: string;
  image_url?: string | null;
  is_equipped_profile_icon: boolean;
  is_equipped_aura: boolean;
  is_equipped_badge: boolean;
}

export interface CollectionData {
  constellations: CollectionConstellation[];
  achievements: CollectionAchievement[];
  cosmetics: CollectionCosmetic[];
}

export async function getCollection(): Promise<CollectionData> {
  return request("/gamification/collection/me");
}
