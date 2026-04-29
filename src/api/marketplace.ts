import { request } from "@/api/client";

export interface MarketplaceItem {
  item_code: string;
  name: string;
  cosmetic_type: string;
  price_starlight: number;
  is_active: boolean;
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

export async function getAdminMarketplaceCatalog(): Promise<CatalogResponse> {
  return request("/gamification/admin/marketplace/catalog");
}

export async function updateAdminMarketplaceItem(
  itemCode: string,
  payload: {
    price_starlight?: number;
    is_active?: boolean;
    manifest?: MarketplaceItem["manifest"];
  },
): Promise<MarketplaceItem> {
  return request(`/gamification/admin/marketplace/items/${itemCode}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getAdminMarketplaceItemImpact(itemCode: string): Promise<{
  item_code: string;
  purchases: number;
  owners: number;
}> {
  return request(`/gamification/admin/marketplace/items/${itemCode}/impact`);
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
