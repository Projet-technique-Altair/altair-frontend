import { request } from "@/api/client";
import type {
  CurrencyBalance,
  GachaConfig,
  GachaHistoryResponse,
  GachaOpenResponse,
} from "@/contracts/gacha";

export async function getGachaConfig() {
  return request<GachaConfig>("/gamification/gacha/config");
}

export async function getCurrencyBalance() {
  return request<CurrencyBalance>("/gamification/currency/balance");
}

export async function getGachaHistory(limit = 5) {
  return request<GachaHistoryResponse>(`/gamification/gacha/history?limit=${limit}`);
}

export async function openCapsule(capsuleType: string) {
  return request<GachaOpenResponse>("/gamification/gacha/open", {
    method: "POST",
    body: JSON.stringify({
      capsule_type: capsuleType,
      request_id: crypto.randomUUID(),
    }),
  });
}
