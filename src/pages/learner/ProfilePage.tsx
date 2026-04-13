import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/useAuth";
import { getMe } from "@/api/users";
import {
  equipTitle,
  getMyTitles,
  getProfile,
  type TitleEntry,
  type UserProfile,
} from "@/api/profile";
import DashboardCard from "@/components/ui/DashboardCard";
import ConstellationArtwork from "@/components/gamification/ConstellationArtwork";
import { cosmeticAssetUrl } from "@/lib/cosmeticAsset";
import { decodeJwt, type KeycloakJwtPayload } from "@/lib/jwt";
import { showGlobalToast } from "@/lib/toast";
import { ALT_COLORS } from "@/lib/theme";

type AccountSummary = Awaited<ReturnType<typeof getMe>>;

type ProfileClaims = KeycloakJwtPayload & {
  sub?: string;
  email?: string;
};

function safeDecodeProfileClaims(token: string | null): ProfileClaims | null {
  if (!token) {
    return null;
  }

  try {
    return decodeJwt<ProfileClaims>(token);
  } catch {
    return null;
  }
}

function prettifyBadgeName(name: string) {
  return name
    .replace(/^badge_/, "")
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function LevelBar({ level }: { level: UserProfile["level"] }) {
  const pct = level.progress != null ? Math.min(level.progress * 100, 100) : 100;
  const isMax = level.next_min == null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-purple-200">
          Level {level.current_level} - {level.current_label}
        </span>
        <span className="text-white/40">
          {isMax ? "Max level" : `${level.next_min?.toLocaleString()} next`}
        </span>
      </div>

      <div className="relative h-2.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${ALT_COLORS.blue}, ${ALT_COLORS.purple}, ${ALT_COLORS.orange})`,
            boxShadow: `0 0 12px ${ALT_COLORS.purple}88`,
          }}
        />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  color,
}: {
  label: string;
  value: string;
  hint: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
      <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">{label}</p>
      <p className="mt-2 text-2xl font-semibold" style={{ color }}>
        {value}
      </p>
      <p className="mt-1 text-xs text-white/35">{hint}</p>
    </div>
  );
}

function EquippedBadgeSlot({
  badge,
}: {
  badge?: UserProfile["equipped_badges"][number];
}) {
  const isVideo = Boolean(badge?.image_url && /\.(mp4|webm|ogg)(\?.*)?$/i.test(badge.image_url));

  return (
    <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
      {badge ? (
        badge.image_url ? (
          isVideo ? (
            <video
              src={cosmeticAssetUrl(badge.image_url)}
              className="h-full w-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
            />
          ) : (
            <img
              src={cosmeticAssetUrl(badge.image_url)}
              alt={badge.name}
              className="h-full w-full object-cover"
            />
          )
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[radial-gradient(circle_at_center,rgba(96,165,250,0.18),rgba(15,23,42,0.88))] px-2 text-center">
            <span className="text-2xl">🏅</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/75">
              {prettifyBadgeName(badge.name)}
            </span>
          </div>
        )
      ) : (
        <span className="text-xs uppercase tracking-[0.22em] text-white/20">Empty</span>
      )}
    </div>
  );
}

function AuraRing({
  imageUrl,
  alt,
}: {
  imageUrl?: string | null;
  alt: string;
}) {
  if (!imageUrl) {
    return null;
  }

  const isVideo = /\.(mp4|webm|ogg)(\?.*)?$/i.test(imageUrl);

  return (
    <div
      className="pointer-events-none absolute inset-[-18%] z-30 overflow-hidden rounded-full drop-shadow-[0_0_18px_rgba(96,165,250,0.5)]"
      style={{
        WebkitMaskImage:
          "radial-gradient(circle, transparent 45%, black 57%, black 71%, transparent 80%)",
        maskImage:
          "radial-gradient(circle, transparent 45%, black 57%, black 71%, transparent 80%)",
      }}
    >
      {isVideo ? (
        <video
          src={cosmeticAssetUrl(imageUrl)}
          className="h-full w-full scale-[1.95] object-contain saturate-150 brightness-125 contrast-125"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
        />
      ) : (
        <img
          src={cosmeticAssetUrl(imageUrl)}
          alt={alt}
          className="h-full w-full scale-[1.95] object-contain saturate-150 brightness-125 contrast-125"
        />
      )}
    </div>
  );
}

function TitleModal({
  titles,
  activeId,
  onSelect,
  onClose,
}: {
  titles: TitleEntry[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <DashboardCard className="w-full max-w-sm space-y-4 border border-white/10 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Choose a title</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-lg leading-none text-white/40 transition hover:text-white"
          >
            x
          </button>
        </div>

        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => onSelect(null)}
            className={[
              "w-full rounded-xl border px-3 py-2.5 text-left text-sm transition-all",
              activeId === null
                ? "border-purple-400/60 bg-purple-400/10 text-purple-200"
                : "border-white/10 text-white/50 hover:border-white/30 hover:text-white/80",
            ].join(" ")}
          >
            <span className="italic">No title</span>
          </button>

          {titles.map((title) => (
            <button
              key={title.title_id}
              type="button"
              onClick={() => onSelect(title.title_id)}
              className={[
                "w-full rounded-xl border px-3 py-2.5 text-left text-sm transition-all",
                activeId === title.title_id
                  ? "border-purple-400/60 bg-purple-400/10 text-purple-200"
                  : "border-white/10 text-white/60 hover:border-white/30 hover:text-white",
              ].join(" ")}
            >
              {title.name}
            </button>
          ))}
        </div>
      </DashboardCard>
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [titles, setTitles] = useState<TitleEntry[]>([]);
  const [account, setAccount] = useState<AccountSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTitles, setShowTitles] = useState(false);
  const [equipping, setEquipping] = useState(false);

  const isCreatorView = location.pathname.startsWith("/creator/");
  const routePrefix = isCreatorView ? "/creator" : "/learner";
  const roleLabel = isCreatorView ? "creator" : "learner";
  const claims = safeDecodeProfileClaims(token);
  const displayName = account?.pseudo ?? claims?.preferred_username ?? claims?.sub ?? "User";
  const email = account?.email ?? claims?.email ?? "";
  const activeTitleId =
    profile?.active_title != null
      ? titles.find((title) => title.name === profile.active_title)?.title_id ?? null
      : null;

  useEffect(() => {
    let cancelled = false;

    const loadProfilePage = async () => {
      setLoading(true);
      setError(null);

      const [profileResult, titlesResult, accountResult] = await Promise.allSettled([
        getProfile(),
        getMyTitles(),
        getMe(),
      ]);

      if (cancelled) {
        return;
      }

      if (profileResult.status === "fulfilled") {
        setProfile(profileResult.value);
      } else {
        setError(getErrorMessage(profileResult.reason, "Could not load profile."));
      }

      if (titlesResult.status === "fulfilled") {
        setTitles(titlesResult.value.titles);
      }

      if (accountResult.status === "fulfilled") {
        setAccount(accountResult.value);
      }

      setLoading(false);
    };

    void loadProfilePage();
    window.addEventListener("altair-profile-updated", loadProfilePage);

    return () => {
      cancelled = true;
      window.removeEventListener("altair-profile-updated", loadProfilePage);
    };
  }, []);

  const handleEquipTitle = async (titleId: string | null) => {
    setEquipping(true);
    setShowTitles(false);
    setError(null);

    try {
      await equipTitle(titleId);
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              active_title: titleId
                ? titles.find((title) => title.title_id === titleId)?.name ?? null
                : null,
            }
          : prev,
      );
      window.dispatchEvent(new Event("altair-profile-updated"));
      showGlobalToast(titleId ? "Title equipped." : "Title removed.");
    } catch (err) {
      setError(getErrorMessage(err, "Could not update the active title."));
      showGlobalToast("Could not update the active title.", "error");
    } finally {
      setEquipping(false);
    }
  };

  const equippedBadges = profile?.equipped_badges ?? [];
  const badgeSlots = Array.from({ length: 5 }, (_, index) => equippedBadges[index]);

  return (
    <div className="min-h-screen px-8 py-10 text-white">
      <div className="mx-auto max-w-[1440px] space-y-10">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{
              background: `linear-gradient(90deg, ${ALT_COLORS.blue}, ${ALT_COLORS.purple}, ${ALT_COLORS.orange})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            User Profile
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Your Altair identity, progression, and equipped constellation setup.
          </p>
        </div>

        <DashboardCard className="border-transparent bg-transparent p-0 shadow-none">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
            <div className="relative flex-shrink-0">
              <div
                className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full text-2xl font-semibold shadow-[0_0_15px_rgba(255,140,0,0.35)]"
                style={{
                  background:
                    profile?.equipped_profile_cosmetic?.image_url != null
                      ? undefined
                      : `linear-gradient(135deg, ${ALT_COLORS.purple}, ${ALT_COLORS.orange})`,
                }}
              >
                {profile?.equipped_profile_cosmetic?.image_url ? (
                  <img
                    src={cosmeticAssetUrl(profile.equipped_profile_cosmetic.image_url)}
                    alt={profile.equipped_profile_cosmetic.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="absolute -bottom-2 right-0 rounded-full bg-sky-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
                {roleLabel}
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-2xl font-semibold text-white">{displayName}</h2>
                  {profile?.active_title ? (
                    <span className="rounded-full border border-purple-400/30 bg-purple-400/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-purple-200">
                      {profile.active_title}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-gray-400">{email || "No email available"}</p>
              </div>

              <div className="grid grid-cols-1 gap-y-2 text-sm sm:grid-cols-2">
                <p>
                  <span className="text-gray-400">Role: </span>
                  <span className="font-medium capitalize text-sky-300">{roleLabel}</span>
                </p>
                <p>
                  <span className="text-gray-400">Current title: </span>
                  <span className="text-purple-300">{profile?.active_title ?? "None"}</span>
                </p>
                <p>
                  <span className="text-gray-400">Equipped badges: </span>
                  <span className="text-orange-300">{equippedBadges.length}/5</span>
                </p>
                <p>
                  <span className="text-gray-400">Signature aura: </span>
                  <span className="text-sky-300">
                    {profile?.equipped_aura_cosmetic?.name ?? "None"}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setShowTitles(true)}
                className="rounded-full bg-gradient-to-r from-sky-400 via-purple-400 to-orange-400 px-5 py-2 font-medium text-white transition hover:opacity-90"
              >
                {equipping ? "Saving..." : profile?.active_title ? "Change title" : "Choose a title"}
              </button>
              <button
                type="button"
                onClick={() => navigate(`${routePrefix}/settings`)}
                className="rounded-full border border-white/20 px-5 py-2 text-white/70 transition hover:border-purple-400/60 hover:text-white"
              >
                Edit account settings
              </button>
            </div>
          </div>
        </DashboardCard>

        {loading ? (
          <DashboardCard className="p-8">
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((index) => (
                <div key={index} className="h-28 animate-pulse rounded-2xl bg-white/5" />
              ))}
            </div>
          </DashboardCard>
        ) : error ? (
          <DashboardCard className="border border-red-500/20 bg-black/40 p-6">
            <p className="text-sm text-red-400">{error}</p>
          </DashboardCard>
        ) : profile ? (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6">
              <DashboardCard className="space-y-6 p-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <StatCard
                    label="Level"
                    value={profile.level.current_level.toString()}
                    hint={profile.level.current_label}
                    color={ALT_COLORS.purple}
                  />
                  <StatCard
                    label="Starlight"
                    value={`${profile.starlight.toLocaleString()} 🌟`}
                    hint="Current balance"
                    color={ALT_COLORS.blue}
                  />
                  <StatCard
                    label="Stardust Earned"
                    value={`${profile.lifetime_stardust.toLocaleString()} ✨`}
                    hint="Lifetime progression"
                    color={ALT_COLORS.orange}
                  />
                </div>

                <LevelBar level={profile.level} />
              </DashboardCard>

              <DashboardCard className="space-y-4 p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Equipped badges</h3>
                    <p className="text-sm text-white/40">
                      Up to 5 badges can appear on your profile.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`${routePrefix}/collection`)}
                    className="text-xs font-medium text-sky-300 transition hover:text-sky-200"
                  >
                    Manage badges
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                  {badgeSlots.map((badge, index) => (
                    <EquippedBadgeSlot key={badge?.cosmetic_id ?? `empty-${index}`} badge={badge} />
                  ))}
                </div>
              </DashboardCard>
            </div>

            <div className="space-y-6">
              <DashboardCard className="space-y-5 p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Signature constellation</h3>
                    <p className="text-sm text-white/40">
                      The constellation and aura currently shown on your profile.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`${routePrefix}/collection`)}
                    className="text-xs font-medium text-sky-300 transition hover:text-sky-200"
                  >
                    Manage in collection
                  </button>
                </div>

                <div className="flex flex-col items-center gap-5 rounded-[2rem] border border-white/10 bg-white/[0.03] px-6 py-8 text-center">
                  <div className="relative flex h-56 w-56 items-center justify-center overflow-visible rounded-full">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-500/12 via-purple-500/10 to-orange-500/12 blur-xl" />
                    <div className="relative z-10 flex h-44 w-44 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#060912] shadow-[0_0_35px_rgba(0,0,0,0.45)]">
                      <ConstellationArtwork
                        imageUrl={profile.equipped_constellation?.image_url}
                        alt={profile.equipped_constellation?.name ?? "Equipped constellation"}
                        imageClassName="h-full w-full object-cover"
                        containerClassName="h-full w-full"
                        fallbackClassName="bg-transparent"
                        fallbackSymbolClassName="text-6xl text-white/22"
                      />
                    </div>
                    <AuraRing
                      imageUrl={profile.equipped_aura_cosmetic?.image_url}
                      alt={profile.equipped_aura_cosmetic?.name ?? "Equipped aura"}
                    />
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-2xl font-semibold text-white">
                      {profile.equipped_constellation?.name ?? "No constellation equipped"}
                    </h4>
                    <p className="text-sm text-white/40">
                      {profile.equipped_aura_cosmetic?.name
                        ? `Aura: ${profile.equipped_aura_cosmetic.name}`
                        : "No aura equipped"}
                    </p>
                    <p className="text-sm text-white/40">
                      {profile.active_title ? `Title: ${profile.active_title}` : "No active title"}
                    </p>
                  </div>
                </div>
              </DashboardCard>

              <DashboardCard className="space-y-4 p-6">
                <h3 className="text-lg font-semibold text-white">Equipped profile icon</h3>
                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white/5">
                    {profile.equipped_profile_cosmetic?.image_url ? (
                      <img
                        src={cosmeticAssetUrl(profile.equipped_profile_cosmetic.image_url)}
                        alt={profile.equipped_profile_cosmetic.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xl text-white/30">
                        {displayName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {profile.equipped_profile_cosmetic?.name ?? "Default avatar"}
                    </p>
                    <p className="text-sm text-white/40">
                      Selected from your cosmetic collection.
                    </p>
                  </div>
                </div>
              </DashboardCard>
            </div>
          </div>
        ) : null}

        {showTitles ? (
          <TitleModal
            titles={titles}
            activeId={activeTitleId}
            onSelect={handleEquipTitle}
            onClose={() => setShowTitles(false)}
          />
        ) : null}
      </div>
    </div>
  );
}
