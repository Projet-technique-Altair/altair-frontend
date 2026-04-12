import { request } from "@/api/client";

export interface MarketplaceItem {
  item_code: string;
  name: string;
  cosmetic_type: string;
  price_starlight: number;
  manifest: {
    image_url?: string;
    description?: string;
    preview_colors?: string[];
    css_theme?: string;
  };
}

export interface CatalogResponse {
  items: MarketplaceItem[];
}

export interface MarketplacePurchaseResponse {
  item_code: string;
  starlight_spent: number;
}

export async function getCatalog(): Promise<CatalogResponse> {
  return request("/gamification/marketplace/catalog");
}

export async function buyItem(item_code: string): Promise<MarketplacePurchaseResponse> {
  return request("/gamification/marketplace/buy", {
    method: "POST",
    body: JSON.stringify({
      item_code,
      request_id: crypto.randomUUID(),
    }),
  });
}
