import { useEffect, useMemo, useRef, useState } from "react";
import {
  getCollection,
  type CollectionAchievement,
  type CollectionConstellation,
  type CollectionCosmetic,
  type CollectionData,
} from "@/api/collection";
import {
  equipAura,
  equipBadges,
  equipConstellation,
  equipProfileIcon,
  equipTitle,
} from "@/api/profile";
import { cosmeticAssetUrl } from "@/lib/cosmeticAsset";
import { showGlobalToast } from "@/lib/toast";
import ConstellationArtwork from "@/components/gamification/ConstellationArtwork";
import ConstellationDetailSheet from "@/components/gamification/ConstellationDetailSheet";
import DashboardCard from "@/components/ui/DashboardCard";
import { ALT_COLORS } from "@/lib/theme";

const RARITY_COLOR: Record<string, string> = {
  legendary: "#FFD700",
  epic: "#C084FC",
  rare: "#60A5FA",
  common: "#94A3B8",
};

const RARITY_LABEL: Record<string, string> = {
  legendary: "Legendary",
  epic: "Epic",
  rare: "Rare",
  common: "Common",
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function StarBar({ stars }: { stars: number }) {
  return (
    <div className="mt-1 flex gap-0.5">
      {Array.from({ length: 6 }).map((_, index) => (
        <span
          key={index}
          className="text-[10px]"
          style={{ color: index < stars ? "#FACC15" : "#374151" }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function progressLabel(item: CollectionConstellation) {
  if (!item.next_star_goal || !item.progress_target) {
    return "Max rank reached";
  }

  return `${item.progress_current}/${item.progress_target} pulls toward ${item.next_star_goal}★`;
}

function ConstellationCard({
  item,
  onOpen,
  onEquip,
  equipping,
}: {
  item: CollectionConstellation;
  onOpen: (item: CollectionConstellation) => void;
  onEquip: (item: CollectionConstellation) => void;
  equipping: boolean;
}) {
  const rarity = item.rarity ?? "common";
  const color = RARITY_COLOR[rarity] ?? RARITY_COLOR.common;

  return (
    <div className="text-left">
      <DashboardCard className="flex h-full flex-col gap-3 border border-white/10 bg-black/45 p-4 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-white/20">
        <button type="button" onClick={() => onOpen(item)} className="text-left">
          <div
            className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-black/20"
            style={{ boxShadow: `0 0 20px ${color}22` }}
          >
            <ConstellationArtwork
              imageUrl={item.image_url}
              alt={item.name}
              imageClassName="h-full w-full object-cover"
              containerClassName="h-full w-full"
              fallbackSymbolClassName="text-4xl text-white/25"
            />
          </div>
        </button>

        <div>
          <p className="truncate text-sm font-semibold text-white">{item.name}</p>
          <p className="text-[11px] font-medium" style={{ color }}>
            {RARITY_LABEL[rarity] ?? rarity}
          </p>
          <StarBar stars={item.stars} />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
          <p className="text-[11px] text-white/35">{progressLabel(item)}</p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 text-[11px] text-white/40">
          <span>{item.total_obtained} pulls</span>
          <button
            type="button"
            onClick={() => onEquip(item)}
            disabled={equipping}
            className={[
              "rounded-full px-2 py-0.5 font-semibold transition",
              item.is_equipped
                ? "bg-emerald-400/15 text-emerald-200"
                : "bg-white/10 text-white/60 hover:bg-white/15 hover:text-white",
            ].join(" ")}
          >
            {equipping ? "Saving..." : item.is_equipped ? "Remove from menu" : "Use in menu"}
          </button>
        </div>
      </DashboardCard>
    </div>
  );
}

function CosmeticCard({
  item,
  label,
  onEquip,
  equipping,
  equippedLabel,
  idleLabel,
  isEquipped,
  secondaryActionLabel,
  onSecondaryAction,
  secondaryDisabled,
}: {
  item: CollectionCosmetic;
  label?: string;
  onEquip: (item: CollectionCosmetic) => void;
  equipping: boolean;
  equippedLabel: string;
  idleLabel: string;
  isEquipped: boolean;
  secondaryActionLabel?: string;
  onSecondaryAction?: (item: CollectionCosmetic) => void;
  secondaryDisabled?: boolean;
}) {
  const isVideo = Boolean(item.image_url && /\.(mp4|webm|ogg)(\?.*)?$/i.test(item.image_url));
  const isAura = item.cosmetic_type === "aura";

  return (
    <DashboardCard className="flex flex-col items-center gap-3 border border-white/10 bg-black/40 p-4 text-center backdrop-blur-md">
      <div
        className={[
          "flex h-24 w-24 items-center justify-center overflow-hidden border border-white/10",
          isAura
            ? "rounded-full bg-[radial-gradient(circle_at_center,rgba(43,76,151,0.38),rgba(4,8,20,0.96)_72%)] shadow-[0_0_28px_rgba(96,165,250,0.16)]"
            : "rounded-2xl bg-white/[0.03]",
        ].join(" ")}
      >
        {item.image_url ? (
          isVideo ? (
            <video
              src={cosmeticAssetUrl(item.image_url)}
              className={[
                "h-full w-full",
                isAura
                  ? "scale-125 object-contain mix-blend-screen opacity-95"
                  : "object-cover",
              ].join(" ")}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
            />
          ) : (
            <img
              src={cosmeticAssetUrl(item.image_url)}
              alt={item.name}
              className={[
                "h-full w-full",
                isAura
                  ? "scale-125 object-contain mix-blend-screen opacity-95"
                  : "object-cover",
              ].join(" ")}
            />
          )
        ) : (
          <span className="text-3xl">{item.cosmetic_type === "aura" ? "✨" : "🎨"}</span>
        )}
      </div>

      <div>
        <p className="text-sm font-semibold text-white">{item.name}</p>
        <p className="mt-1 break-all text-xs uppercase tracking-[0.16em] text-white/35">
          {label ?? item.cosmetic_type}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onEquip(item)}
        disabled={equipping}
        className={[
          "mt-auto rounded-full px-3 py-1.5 text-xs font-semibold transition",
          isEquipped
            ? "bg-emerald-400/15 text-emerald-200"
            : "bg-white/10 text-white/60 hover:bg-white/15 hover:text-white",
        ].join(" ")}
      >
        {equipping ? "Saving..." : isEquipped ? equippedLabel : idleLabel}
      </button>

      {secondaryActionLabel && onSecondaryAction ? (
        <button
          type="button"
          onClick={() => onSecondaryAction(item)}
          disabled={secondaryDisabled}
          className={[
            "text-[11px] font-medium transition",
            secondaryDisabled
              ? "cursor-not-allowed text-white/25"
              : "text-white/45 hover:text-white/80",
          ].join(" ")}
        >
          {secondaryActionLabel}
        </button>
      ) : null}
    </DashboardCard>
  );
}

function TitleCard({
  item,
  onEquip,
  equipping,
}: {
  item: CollectionAchievement;
  onEquip: (item: CollectionAchievement) => void;
  equipping: boolean;
}) {
  return (
    <DashboardCard className="flex flex-col gap-3 border border-white/10 bg-black/40 p-5 backdrop-blur-md">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-purple-200/45">Title</p>
        <h3 className="mt-2 text-base font-semibold text-white">{item.name}</h3>
        <p className="mt-2 text-sm leading-6 text-white/45">{item.description}</p>
      </div>

      <button
        type="button"
        onClick={() => onEquip(item)}
        disabled={equipping || item.is_active_title}
        className={[
          "mt-auto rounded-full px-3 py-1.5 text-xs font-semibold transition",
          item.is_active_title
            ? "bg-emerald-400/15 text-emerald-200"
            : "bg-white/10 text-white/60 hover:bg-white/15 hover:text-white",
        ].join(" ")}
      >
        {item.is_active_title ? "Active title" : equipping ? "Saving..." : "Equip title"}
      </button>
    </DashboardCard>
  );
}

function ConstellationOverlay({
  item,
  onClose,
}: {
  item: CollectionConstellation;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-[#05070fcc] px-4 py-6 backdrop-blur-md"
    >
      <ConstellationDetailSheet
        item={item}
        contextLabel="Collection sheet"
        artworkMaxWidthClassName="max-w-[280px] md:max-w-[332px]"
        compactHero
        scrollContainerRef={overlayRef}
        stats={[
          { label: "Stars", value: `${item.stars}★` },
          { label: "Pulls", value: item.total_obtained.toString() },
          {
            label: "Progress",
            value: item.next_star_goal ? `Next ${item.next_star_goal}★` : "Completed",
          },
        ]}
        topRightAction={
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70 transition hover:border-white/20 hover:text-white"
          >
            Close
          </button>
        }
      />
    </div>
  );
}

function AchievementRow({ item }: { item: CollectionData["achievements"][0] }) {
  const date = new Date(item.unlocked_at).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="flex items-center gap-4 border-b border-white/5 py-3 last:border-0">
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-xl"
        style={{ background: `${ALT_COLORS.purple}33` }}
      >
        🏅
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white">{item.name}</p>
        <p className="truncate text-xs text-white/40">{item.description}</p>
      </div>
      <span className="flex-shrink-0 text-[11px] text-white/30">{date}</span>
    </div>
  );
}

function EmptyState({
  emoji,
  title,
  sub,
}: {
  emoji: string;
  title: string;
  sub: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <span className="text-5xl">{emoji}</span>
      <p className="font-semibold text-white/60">{title}</p>
      <p className="max-w-xs text-sm text-white/30">{sub}</p>
    </div>
  );
}

type Tab = "constellations" | "achievements" | "aura" | "badges" | "titles";

const TABS: { id: Tab; label: string }[] = [
  { id: "constellations", label: "Constellations" },
  { id: "achievements", label: "Achievements" },
  { id: "aura", label: "Aura" },
  { id: "badges", label: "Badges" },
  { id: "titles", label: "Titles" },
];

export default function CollectionPage() {
  const [data, setData] = useState<CollectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("constellations");
  const [selectedConstellation, setSelectedConstellation] =
    useState<CollectionConstellation | null>(null);
  const [equippingId, setEquippingId] = useState<string | null>(null);

  useEffect(() => {
    getCollection()
      .then(setData)
      .catch((err: unknown) => setError(getErrorMessage(err, "Loading error")))
      .finally(() => setLoading(false));
  }, []);

  const counts = data
    ? {
        constellations: data.constellations.length,
        achievements: data.achievements.filter((item) => !item.is_title).length,
        aura: data.cosmetics.filter((item) => item.cosmetic_type === "aura").length,
        badges: data.cosmetics.filter((item) => isBadgeCosmetic(item)).length,
        titles: data.achievements.filter((item) => item.is_title).length,
      }
    : { constellations: 0, achievements: 0, aura: 0, badges: 0, titles: 0 };

  const spotlight = useMemo(() => data?.constellations[0] ?? null, [data]);
  const achievementItems = useMemo(
    () => data?.achievements.filter((item) => !item.is_title) ?? [],
    [data],
  );
  const titleItems = useMemo(
    () => data?.achievements.filter((item) => item.is_title) ?? [],
    [data],
  );
  const auraItems = useMemo(
    () => data?.cosmetics.filter((item) => item.cosmetic_type === "aura") ?? [],
    [data],
  );
  const badgeItems = useMemo(
    () => data?.cosmetics.filter((item) => isBadgeCosmetic(item)) ?? [],
    [data],
  );
  const equippedBadgeIds = useMemo(
    () => badgeItems.filter((item) => item.is_equipped_badge).map((item) => item.cosmetic_id),
    [badgeItems],
  );

  const reloadCollection = async () => {
    const nextData = await getCollection();
    setData(nextData);
    window.dispatchEvent(new Event("altair-profile-updated"));
  };

  const handleEquipConstellation = async (item: CollectionConstellation) => {
    setEquippingId(item.item_code);
    setError(null);

    try {
      const nextItemCode = item.is_equipped ? null : item.item_code;
      await equipConstellation(nextItemCode);
      await reloadCollection();
      showGlobalToast(
        item.is_equipped
          ? `${item.name} is no longer shown in the main menu.`
          : `${item.name} is now shown in the main menu.`,
      );
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Could not update the menu constellation."));
    } finally {
      setEquippingId(null);
    }
  };

  const handleEquipProfileIcon = async (item: CollectionCosmetic) => {
    setEquippingId(item.cosmetic_id);
    setError(null);

    try {
      const nextCosmeticId = item.is_equipped_profile_icon ? null : item.cosmetic_id;
      await equipProfileIcon(nextCosmeticId);
      await reloadCollection();
      showGlobalToast(
        item.is_equipped_profile_icon
          ? `${item.name} is no longer your profile icon.`
          : `${item.name} is now your profile icon.`,
      );
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Could not update the profile icon."));
    } finally {
      setEquippingId(null);
    }
  };

  const handleEquipAura = async (item: CollectionCosmetic) => {
    setEquippingId(item.cosmetic_id);
    setError(null);

    try {
      const nextCosmeticId = item.is_equipped_aura ? null : item.cosmetic_id;
      await equipAura(nextCosmeticId);
      await reloadCollection();
      showGlobalToast(
        item.is_equipped_aura
          ? `${item.name} is no longer your equipped aura.`
          : `${item.name} is now your equipped aura.`,
      );
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Could not update the equipped aura."));
    } finally {
      setEquippingId(null);
    }
  };

  const handleEquipBadge = async (item: CollectionCosmetic) => {
    setEquippingId(item.cosmetic_id);
    setError(null);

    const nextBadgeIds = item.is_equipped_badge
      ? equippedBadgeIds.filter((id) => id !== item.cosmetic_id)
      : [...equippedBadgeIds, item.cosmetic_id];

    if (!item.is_equipped_badge && equippedBadgeIds.length >= 5) {
      showGlobalToast("You can equip up to 5 badges on your profile.", "error");
      setEquippingId(null);
      return;
    }

    try {
      await equipBadges(nextBadgeIds);
      await reloadCollection();
      showGlobalToast(
        item.is_equipped_badge
          ? `${item.name} is no longer shown in your equipped badges.`
          : `${item.name} was added to your equipped badges.`,
      );
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Could not update the equipped badges."));
    } finally {
      setEquippingId(null);
    }
  };

  const handleEquipTitle = async (item: CollectionAchievement) => {
    setEquippingId(`title:${item.id}`);
    setError(null);

    try {
      await equipTitle(item.id);
      await reloadCollection();
      showGlobalToast(`${item.name} is now your active title.`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Could not update the active title."));
    } finally {
      setEquippingId(null);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-6 py-10 text-white">
      <div className="relative z-10 space-y-8">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h1
              className="text-3xl font-bold"
              style={{
                background: `linear-gradient(90deg, ${ALT_COLORS.blue}, ${ALT_COLORS.purple}, ${ALT_COLORS.orange})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Collection
            </h1>
            <p className="mt-1 text-sm text-white/45">
              All your constellations, achievements, and cosmetics in one space.
            </p>
          </div>

          {spotlight ? (
            <DashboardCard className="border border-white/10 bg-black/35 p-5 backdrop-blur-md">
              <p className="text-xs uppercase tracking-[0.24em] text-white/35">
                Latest constellation
              </p>
              <div className="mt-4 flex items-center gap-4">
                <div className="h-20 w-20 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                  <ConstellationArtwork
                    imageUrl={spotlight.image_url}
                    alt={spotlight.name}
                    imageClassName="h-full w-full object-cover"
                    containerClassName="h-full w-full"
                    fallbackClassName="bg-black/10"
                    fallbackSymbolClassName="text-3xl text-white/20"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-semibold text-white">{spotlight.name}</p>
                  <p className="text-sm text-white/45">{progressLabel(spotlight)}</p>
                </div>

                <button
                  onClick={() => setSelectedConstellation(spotlight)}
                  className="rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/80 transition hover:border-white/25 hover:text-white"
                >
                  View
                </button>
              </div>
            </DashboardCard>
          ) : null}
        </div>

        <div className="flex w-fit gap-1 rounded-2xl border border-white/10 bg-black/30 p-1 backdrop-blur-md">
          {TABS.map((entry) => (
            <button
              key={entry.id}
              onClick={() => setTab(entry.id)}
              className={[
                "rounded-xl px-4 py-1.5 text-sm font-medium transition-all",
                tab === entry.id
                  ? "bg-white/12 text-white"
                  : "text-white/40 hover:text-white/70",
              ].join(" ")}
            >
              {entry.label}
              {!loading ? (
                <span className="ml-1.5 text-xs text-white/30">({counts[entry.id]})</span>
              ) : null}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="aspect-square animate-pulse rounded-2xl border border-white/5 bg-black/25 backdrop-blur-sm"
              />
            ))}
          </div>
        ) : error ? (
          <DashboardCard className="border border-red-500/20 bg-black/40 p-6 backdrop-blur-md">
            <p className="text-red-400">{error}</p>
          </DashboardCard>
        ) : !data ? null : (
          <>
            {tab === "constellations" ? (
              data.constellations.length === 0 ? (
                <EmptyState
                  emoji="✦"
                  title="No constellations yet"
                  sub="Open capsules in the Gacha to unlock some."
                />
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {data.constellations.map((constellation) => (
                    <ConstellationCard
                      key={constellation.item_code}
                      item={constellation}
                      onOpen={setSelectedConstellation}
                      onEquip={handleEquipConstellation}
                      equipping={equippingId === constellation.item_code}
                    />
                  ))}
                </div>
              )
            ) : null}

            {tab === "achievements" ? (
              achievementItems.length === 0 ? (
                <EmptyState
                  emoji="🏅"
                  title="No achievements yet"
                  sub="Keep progressing to unlock them."
                />
              ) : (
                <DashboardCard className="divide-y divide-white/5 border border-white/10 bg-black/40 p-2 backdrop-blur-md">
                  {achievementItems.map((achievement) => (
                    <AchievementRow key={achievement.id} item={achievement} />
                  ))}
                </DashboardCard>
              )
            ) : null}

            {tab === "aura" ? (
              auraItems.length === 0 ? (
                <EmptyState
                  emoji="✨"
                  title="No aura yet"
                  sub="Buy auras in the Marketplace to unlock them here."
                />
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {auraItems.map((cosmetic) => (
                    <CosmeticCard
                      key={cosmetic.cosmetic_id}
                      item={cosmetic}
                      label="Aura"
                      onEquip={handleEquipAura}
                      equipping={equippingId === cosmetic.cosmetic_id}
                      isEquipped={cosmetic.is_equipped_aura}
                      equippedLabel="Remove aura"
                      idleLabel="Equip aura"
                    />
                  ))}
                </div>
              )
            ) : null}

            {tab === "badges" ? (
              badgeItems.length === 0 ? (
                <EmptyState
                  emoji="🏵"
                  title="No badges yet"
                  sub="Unlock achievements to earn badges."
                />
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {badgeItems.map((badge) => (
                    <CosmeticCard
                      key={badge.cosmetic_id}
                      item={badge}
                      label="Badge"
                      onEquip={handleEquipBadge}
                      equipping={equippingId === badge.cosmetic_id}
                      isEquipped={badge.is_equipped_badge}
                      equippedLabel="Remove badge"
                      idleLabel="Equip badge"
                      secondaryActionLabel={
                        badge.is_equipped_profile_icon ? "Remove icon" : "Use as icon"
                      }
                      onSecondaryAction={handleEquipProfileIcon}
                      secondaryDisabled={equippingId === badge.cosmetic_id}
                    />
                  ))}
                </div>
              )
            ) : null}

            {tab === "titles" ? (
              titleItems.length === 0 ? (
                <EmptyState
                  emoji="✦"
                  title="No titles yet"
                  sub="Complete milestones to unlock titles."
                />
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {titleItems.map((title) => (
                    <TitleCard
                      key={title.id}
                      item={title}
                      onEquip={handleEquipTitle}
                      equipping={equippingId === `title:${title.id}`}
                    />
                  ))}
                </div>
              )
            ) : null}
          </>
        )}
      </div>

      {selectedConstellation ? (
        <ConstellationOverlay
          item={selectedConstellation}
          onClose={() => setSelectedConstellation(null)}
        />
      ) : null}
    </div>
  );
}

function isBadgeCosmetic(item: CollectionCosmetic) {
  return (
    item.cosmetic_id.startsWith("badge_") ||
    item.cosmetic_type === "badge" ||
    item.cosmetic_type === "cosmetic"
  );
}
