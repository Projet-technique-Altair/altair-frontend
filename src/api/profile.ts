import { request } from "@/api/client";

export interface LevelInfo {
  current_level: number;
  current_label: string;
  current_min: number;
  next_min: number | null;
  progress: number | null;
}

export interface EquippedConstellation {
  item_code: string;
  name: string;
  stars: number;
  image_url?: string | null;
}

export interface EquippedProfileCosmetic {
  cosmetic_id: string;
  name: string;
  cosmetic_type: string;
  image_url?: string | null;
}

export interface EquippedUiSkin {
  item_code: string;
  name: string;
  css_theme?: string | null;
  image_url?: string | null;
}

export interface UserProfile {
  user_id: string;
  stardust: number;
  starlight: number;
  lifetime_stardust: number;
  level: LevelInfo;
  active_title: string | null;
  equipped_constellation: EquippedConstellation | null;
  equipped_badges: EquippedProfileCosmetic[];
  equipped_aura_cosmetic: EquippedProfileCosmetic | null;
  equipped_profile_cosmetic: EquippedProfileCosmetic | null;
  equipped_ui_skin: EquippedUiSkin | null;
}

export interface TitleEntry {
  title_id: string;
  name: string;
  is_active: boolean;
  unlocked_at: string;
}

type AchievementEntry = {
  id?: string;
  name: string;
  achievement_type?: string;
  unlocked_at: string;
};

type AchievementsResponse = {
  achievements?: AchievementEntry[];
};

export async function getProfile(): Promise<UserProfile> {
  return request("/gamification/profile/me");
}

export async function getMyTitles(): Promise<{ titles: TitleEntry[] }> {
  return request<AchievementsResponse>("/gamification/achievements/me").then((data) => ({
    titles: (data.achievements ?? [])
      .filter(
        (achievement) =>
          achievement.id?.startsWith("title_") ||
          achievement.achievement_type === "easter_egg",
      )
      .map((achievement) => ({
        title_id: achievement.id ?? achievement.name,
        name: achievement.name,
        is_active: false,
        unlocked_at: achievement.unlocked_at,
      })),
  }));
}

export async function equipTitle(title_id: string | null): Promise<void> {
  await request("/gamification/profile/me/title", {
    method: "PUT",
    body: JSON.stringify({ title_id }),
  });
}

export async function equipConstellation(item_code: string | null): Promise<void> {
  await request("/gamification/profile/me/equipped-constellation", {
    method: "PUT",
    body: JSON.stringify({ item_code }),
  });
}

export async function equipBadges(cosmetic_ids: string[]): Promise<void> {
  await request("/gamification/profile/me/badges", {
    method: "PUT",
    body: JSON.stringify({ cosmetic_ids }),
  });
}

export async function equipProfileIcon(cosmetic_id: string | null): Promise<void> {
  await request("/gamification/profile/me/profile-icon", {
    method: "PUT",
    body: JSON.stringify({ cosmetic_id }),
  });
}

export async function equipAura(cosmetic_id: string | null): Promise<void> {
  await request("/gamification/profile/me/aura", {
    method: "PUT",
    body: JSON.stringify({ cosmetic_id }),
  });
}

export async function equipUiSkin(item_code: string | null): Promise<void> {
  await request("/gamification/profile/me/ui-skin", {
    method: "PUT",
    body: JSON.stringify({ item_code }),
  });
}
