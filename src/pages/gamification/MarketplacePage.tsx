import { useCallback, useEffect, useState } from "react";
import { getCatalog, buyItem, type MarketplaceItem } from "@/api/marketplace";
import { getCurrencyBalance } from "@/api/gacha";
import { cosmeticAssetUrl } from "@/lib/cosmeticAsset";
import { getCollection } from "@/api/collection";
import DashboardCard from "@/components/ui/DashboardCard";
import { ALT_COLORS } from "@/lib/theme";
import { showGlobalToast } from "@/lib/toast";

type Filter = "all" | "aura" | "ui_skin";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "aura", label: "Auras" },
  { id: "ui_skin", label: "UI Skins" },
];

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function isVideoAsset(url?: string) {
  return Boolean(url && /\.(mp4|webm|ogg)(\?.*)?$/i.test(url));
}

function ItemCard({
  item,
  owned,
  canAfford,
  onBuy,
  buying,
}: {
  item: MarketplaceItem;
  owned: boolean;
  canAfford: boolean;
  onBuy: (item: MarketplaceItem) => void;
  buying: boolean;
}) {
  const typeLabel = item.cosmetic_type === "aura" ? "Aura" : "UI Skin";
  const typeColor =
    item.cosmetic_type === "aura" ? ALT_COLORS.purple : ALT_COLORS.blue;

  return (
    <DashboardCard className="flex flex-col overflow-hidden border border-white/10 bg-black/45 p-0 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-white/20">
      <div
        className="relative flex aspect-video w-full items-center justify-center bg-black/20"
        style={{
          background: item.manifest.preview_colors
            ? `linear-gradient(135deg, ${item.manifest.preview_colors.join(", ")})`
            : `${typeColor}22`,
        }}
      >
        {item.manifest.image_url ? (
          isVideoAsset(item.manifest.image_url) ? (
            <video
              src={cosmeticAssetUrl(item.manifest.image_url)}
              className={[
                "h-full w-full",
                item.cosmetic_type === "aura" ? "object-contain" : "object-cover",
              ].join(" ")}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
            />
          ) : (
            <img
              src={cosmeticAssetUrl(item.manifest.image_url)}
              alt={item.name}
              className={[
                "h-full w-full",
                item.cosmetic_type === "aura" ? "object-contain" : "object-cover",
              ].join(" ")}
            />
          )
        ) : (
          <span className="text-4xl opacity-60">
            {item.cosmetic_type === "aura" ? "✨" : "🎨"}
          </span>
        )}

        <span
          className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{ background: `${typeColor}33`, color: typeColor }}
        >
          {typeLabel}
        </span>

        {owned ? (
          <span className="absolute right-2 top-2 rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-semibold text-green-400">
            Owned
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-sm font-semibold text-white">{item.name}</p>
          {item.manifest.description ? (
            <p className="mt-0.5 line-clamp-2 text-xs text-white/40">
              {item.manifest.description}
            </p>
          ) : null}
        </div>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-sm font-bold" style={{ color: ALT_COLORS.blue }}>
            {item.price_starlight === 0 ? "Free" : `${item.price_starlight.toLocaleString()} 🌟`}
          </span>

          {owned ? (
            <span className="text-xs text-green-400">In your collection</span>
          ) : (
            <button
              onClick={() => onBuy(item)}
              disabled={!canAfford || buying}
              className={[
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                canAfford && !buying
                  ? "bg-gradient-to-r from-sky-500 to-purple-500 text-white hover:opacity-90 active:scale-95"
                  : "cursor-not-allowed bg-white/10 text-white/30",
              ].join(" ")}
            >
              {buying ? "..." : canAfford ? "Buy" : "Not enough funds"}
            </button>
          )}
        </div>
      </div>
    </DashboardCard>
  );
}

function ConfirmModal({
  item,
  onConfirm,
  onCancel,
  loading,
}: {
  item: MarketplaceItem;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <DashboardCard className="w-full max-w-sm space-y-5 border border-white/10 p-6">
        <h2 className="text-lg font-bold text-white">Confirm purchase</h2>
        <p className="text-sm text-white/60">
          Buy <span className="font-semibold text-white">{item.name}</span> for{" "}
          <span className="font-bold" style={{ color: ALT_COLORS.blue }}>
            {item.price_starlight.toLocaleString()} 🌟 Starlight
          </span>
          ?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-white/20 py-2 text-sm text-white/60 transition hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-xl py-2 text-sm font-semibold text-white transition"
            style={{
              background: `linear-gradient(90deg, ${ALT_COLORS.blue}, ${ALT_COLORS.purple})`,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Buying..." : "Confirm"}
          </button>
        </div>
      </DashboardCard>
    </div>
  );
}

export default function MarketplacePage() {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());
  const [balance, setBalance] = useState<number>(0);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmItem, setConfirmItem] = useState<MarketplaceItem | null>(null);
  const [buyingCode, setBuyingCode] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [catalog, currency, collection] = await Promise.all([
        getCatalog(),
        getCurrencyBalance(),
        getCollection(),
      ]);

      setItems(catalog.items);
      setBalance(currency.starlight ?? 0);
      setOwnedIds(new Set(collection.cosmetics.map((cosmetic) => cosmetic.cosmetic_id)));
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Loading error"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleBuy = async () => {
    if (!confirmItem) {
      return;
    }

    setBuyingCode(confirmItem.item_code);
    setConfirmItem(null);
    setError(null);

    try {
      await buyItem(confirmItem.item_code);
      setOwnedIds((prev) => new Set([...prev, confirmItem.item_code]));
      setBalance((prev) => prev - confirmItem.price_starlight);
      showGlobalToast(
        `"${confirmItem.name}" added to your collection for ${confirmItem.price_starlight.toLocaleString()} Starlight.`,
      );
      window.dispatchEvent(new Event("altair-profile-updated"));
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Purchase failed"));
      showGlobalToast("Purchase failed.", "error");
    } finally {
      setBuyingCode(null);
    }
  };

  const filtered = items.filter(
    (item) => filter === "all" || item.cosmetic_type === filter,
  );

  return (
    <div className="relative min-h-screen overflow-hidden px-6 py-10 text-white">
      <div className="relative z-10 space-y-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1
              className="text-3xl font-bold"
              style={{
                background: `linear-gradient(90deg, ${ALT_COLORS.blue}, ${ALT_COLORS.purple}, ${ALT_COLORS.orange})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Marketplace
            </h1>
            <p className="mt-1 text-sm text-white/45">
              Spend your Starlight to personalize your experience.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-2xl border border-white/10 bg-black/35 px-4 py-2 backdrop-blur-md">
            <span className="text-xl">🌟</span>
            <div>
              <p className="text-xs leading-none text-white/40">Balance</p>
              <p className="text-sm font-bold" style={{ color: ALT_COLORS.blue }}>
                {balance.toLocaleString()} Starlight
              </p>
            </div>
          </div>
        </div>

        <div className="flex w-fit gap-1 rounded-2xl border border-white/10 bg-black/30 p-1 backdrop-blur-md">
          {FILTERS.map((entry) => (
            <button
              key={entry.id}
              onClick={() => setFilter(entry.id)}
              className={[
                "rounded-xl px-4 py-1.5 text-sm font-medium transition-all",
                filter === entry.id
                  ? "bg-white/12 text-white"
                  : "text-white/40 hover:text-white/70",
              ].join(" ")}
            >
              {entry.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="aspect-[3/4] animate-pulse rounded-2xl border border-white/5 bg-black/25 backdrop-blur-sm"
              />
            ))}
          </div>
        ) : error ? (
          <DashboardCard className="border border-red-500/20 bg-black/40 p-6 backdrop-blur-md">
            <p className="text-red-400">{error}</p>
          </DashboardCard>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <span className="text-5xl">🛒</span>
            <p className="font-semibold text-white/60">No items available</p>
            <p className="text-sm text-white/30">Check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((item) => (
              <ItemCard
                key={item.item_code}
                item={item}
                owned={ownedIds.has(item.item_code)}
                canAfford={balance >= item.price_starlight}
                onBuy={setConfirmItem}
                buying={buyingCode === item.item_code}
              />
            ))}
          </div>
        )}

        {confirmItem ? (
          <ConfirmModal
            item={confirmItem}
            onConfirm={handleBuy}
            onCancel={() => setConfirmItem(null)}
            loading={buyingCode !== null}
          />
        ) : null}
      </div>
    </div>
  );
}
