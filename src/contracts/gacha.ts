export type CapsuleConfig = {
  capsule_type: string;
  price_starlight: number;
  drop_rates: {
    common: number;
    rare: number;
    epic: number;
    legendary: number;
    base: number;
  };
  pity: {
    rare_or_better_after: number;
    epic_or_better_after: number;
  };
};

export type GachaConfig = {
  capsules: CapsuleConfig[];
};

export type CurrencyBalance = {
  stardust: number;
  starlight: number;
  free_draws_remaining: number;
};

export type GachaRoll = {
  item_code: string;
  name: string;
  rarity: string;
  cosmetic_type: string;
  image_url: string;
  description_short: string;
  description_full: string;
  technical_details?: string;
  legend_text?: string;
  nasa_image_url?: string;
  nasa_image_title?: string;
  nasa_image_description?: string;
  astronomy_source_url?: string;
  mythology_source_url?: string;
  nasa_source_url?: string;
  was_duplicate: boolean;
  conversion_amount: number;
};

export type GachaCost = {
  used_free_draw: boolean;
  starlight_spent: number;
  new_balance: number;
  remaining_free_draws: number;
};

export type GachaPity = {
  before_rare: number;
  after_rare: number;
  before_epic: number;
  after_epic: number;
  triggered: boolean;
};

export type GachaOpenResponse = {
  capsule_type: string;
  roll: GachaRoll;
  cost: GachaCost;
  pity: GachaPity;
};

export type GachaHistoryEntry = {
  request_id: string;
  capsule_type: string;
  cost_type: string;
  starlight_spent: number;
  item_code: string;
  item_name: string;
  cosmetic_type: string;
  rarity: string;
  was_duplicate: boolean;
  conversion_amount: number;
  pity_before_rare: number;
  pity_after_rare: number;
  pity_before_epic: number;
  pity_after_epic: number;
  pity_triggered: boolean;
  rolled_at: string;
};

export type GachaHistoryResponse = {
  entries: GachaHistoryEntry[];
};
