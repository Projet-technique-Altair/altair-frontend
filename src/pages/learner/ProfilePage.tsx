import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/useAuth";
import { getMe, getUserPseudo } from "@/api/users";
import {
  clearVoidState,
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
type ViewedUserSummary = Awaited<ReturnType<typeof getUserPseudo>>;

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

function formatVoidDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
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

function VoidParticle({
  index,
  evaporating,
}: {
  index: number;
  evaporating: boolean;
}) {
  const angle = (index / 10) * Math.PI * 2;
  const baseX = Math.cos(angle) * 58;
  const baseY = Math.sin(angle) * 58;
  const exitX = Math.cos(angle) * 112;
  const exitY = Math.sin(angle) * 112;

  return (
    <span
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2 h-2.5 w-2.5 rounded-full bg-fuchsia-200/80 blur-[1px] transition-all duration-[1800ms] ease-out"
      style={{
        transform: `translate(${evaporating ? exitX : baseX}px, ${evaporating ? exitY : baseY}px) scale(${evaporating ? 0.35 : 1})`,
        opacity: evaporating ? 0 : 0.72,
        transitionDelay: `${index * 40}ms`,
        boxShadow: "0 0 18px rgba(216,180,254,0.85)",
      }}
    />
  );
}

function SignatureConstellation({
  profile,
  voidActive,
  evaporating,
}: {
  profile: UserProfile;
  voidActive: boolean;
  evaporating: boolean;
}) {
  if (voidActive) {
    return (
      <div className="relative flex h-56 w-56 items-center justify-center overflow-visible rounded-full">
        <div
          className={[
            "absolute inset-[-8%] rounded-full transition-all duration-[1800ms]",
            evaporating ? "scale-[1.35] opacity-0 blur-3xl" : "opacity-100 blur-xl",
          ].join(" ")}
          style={{
            background:
              "radial-gradient(circle at center, rgba(91,33,182,0.18) 0%, rgba(76,29,149,0.22) 22%, rgba(17,24,39,0.82) 52%, rgba(5,8,18,0.96) 76%, rgba(0,0,0,0) 100%)",
          }}
        />
        <div
          className={[
            "absolute inset-[6%] rounded-full border border-fuchsia-300/25 transition-all duration-[1700ms]",
            evaporating ? "scale-[1.5] opacity-0" : "animate-pulse opacity-100",
          ].join(" ")}
          style={{
            boxShadow: "0 0 42px rgba(192,132,252,0.24)",
          }}
        />
        <div
          className={[
            "absolute inset-[14%] rounded-full transition-all duration-[1700ms]",
            evaporating ? "scale-50 opacity-0 blur-2xl" : "opacity-100",
          ].join(" ")}
          style={{
            background:
              "radial-gradient(circle at center, rgba(0,0,0,0.98) 0%, rgba(2,6,23,0.98) 34%, rgba(37,18,68,0.78) 60%, rgba(91,33,182,0.08) 78%, rgba(0,0,0,0) 100%)",
            boxShadow: "0 0 55px rgba(0,0,0,0.95), 0 0 28px rgba(76,29,149,0.32)",
          }}
        />
        <div
          className={[
            "absolute inset-[32%] rounded-full bg-black transition-all duration-[1600ms]",
            evaporating ? "scale-0 opacity-0" : "opacity-100",
          ].join(" ")}
          style={{
            boxShadow: "0 0 60px rgba(0,0,0,0.98)",
          }}
        />
        {Array.from({ length: 10 }).map((_, index) => (
          <VoidParticle key={index} index={index} evaporating={evaporating} />
        ))}
      </div>
    );
  }

  return (
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
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [titles, setTitles] = useState<TitleEntry[]>([]);
  const [account, setAccount] = useState<AccountSummary | null>(null);
  const [viewedUser, setViewedUser] = useState<ViewedUserSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTitles, setShowTitles] = useState(false);
  const [equipping, setEquipping] = useState(false);
  const [clearingVoid, setClearingVoid] = useState(false);
  const [voidEvaporating, setVoidEvaporating] = useState(false);
  const [voidLocallyDismissed, setVoidLocallyDismissed] = useState(false);

  const isCreatorView = location.pathname.startsWith("/creator/");
  const routePrefix = isCreatorView ? "/creator" : "/learner";
  const viewerRoleLabel = isCreatorView ? "creator" : "learner";
  const claims = safeDecodeProfileClaims(token);
  const isOwnProfile = useMemo(() => {
    if (!userId) {
      return true;
    }

    return account?.user_id === userId;
  }, [account?.user_id, userId]);
  const displayName = isOwnProfile
    ? account?.pseudo ?? claims?.preferred_username ?? claims?.sub ?? "User"
    : viewedUser?.pseudo ?? "User";
  const email = isOwnProfile ? account?.email ?? claims?.email ?? "" : "";
  const activeTitleId =
    profile?.active_title != null
      ? titles.find((title) => title.name === profile.active_title)?.title_id ?? null
      : null;
  const voidActive = Boolean(profile?.void_state.is_active) && !voidLocallyDismissed;

  useEffect(() => {
    let cancelled = false;

    const loadProfilePage = async () => {
      setLoading(true);
      setError(null);
      setVoidLocallyDismissed(false);
      setVoidEvaporating(false);

      const [profileResult, titlesResult, accountResult, viewedUserResult] = await Promise.allSettled([
        getProfile(userId),
        getMyTitles(),
        getMe(),
        userId ? getUserPseudo(userId) : Promise.resolve(null),
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

      if (viewedUserResult.status === "fulfilled") {
        setViewedUser(viewedUserResult.value);
      } else {
        setViewedUser(null);
      }

      setLoading(false);
    };

    void loadProfilePage();
    window.addEventListener("altair-profile-updated", loadProfilePage);

    return () => {
      cancelled = true;
      window.removeEventListener("altair-profile-updated", loadProfilePage);
    };
  }, [userId]);

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

  const handleClearVoidState = async () => {
    if (!profile?.void_state.can_clear || clearingVoid || !voidActive) {
      return;
    }

    setClearingVoid(true);
    setError(null);
    setVoidEvaporating(true);

    try {
      await clearVoidState();

      window.setTimeout(() => {
        setVoidLocallyDismissed(true);
        setVoidEvaporating(false);
        setClearingVoid(false);
        window.dispatchEvent(new Event("altair-profile-updated"));
      }, 1800);

      showGlobalToast("Trou Noir dissipated.");
    } catch (err) {
      setVoidEvaporating(false);
      setClearingVoid(false);
      setError(getErrorMessage(err, "Could not clear the Trou Noir state."));
      showGlobalToast("Could not clear the Trou Noir state.", "error");
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
            {isOwnProfile
              ? "Your Altair identity, progression, and equipped constellation setup."
              : "Public view of an Altair profile, including visible progression and equipped cosmetics."}
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
              {isOwnProfile ? (
                <div className="absolute -bottom-2 right-0 rounded-full bg-sky-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
                  {viewerRoleLabel}
                </div>
              ) : null}
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
                <p className="mt-1 text-sm text-gray-400">
                  {isOwnProfile ? email || "No email available" : "Visible profile overview"}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-y-2 text-sm sm:grid-cols-2">
                <p>
                  <span className="text-gray-400">{isOwnProfile ? "Viewer role: " : "Profile visibility: "}</span>
                  <span className="font-medium capitalize text-sky-300">
                    {isOwnProfile ? viewerRoleLabel : "authenticated users"}
                  </span>
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
              {isOwnProfile ? (
                <button
                  type="button"
                  onClick={() => setShowTitles(true)}
                  className="rounded-full bg-gradient-to-r from-sky-400 via-purple-400 to-orange-400 px-5 py-2 font-medium text-white transition hover:opacity-90"
                >
                  {equipping ? "Saving..." : profile?.active_title ? "Change title" : "Choose a title"}
                </button>
              ) : null}
              {isOwnProfile ? (
                <button
                  type="button"
                  onClick={() => navigate(`${routePrefix}/settings`)}
                  className="rounded-full border border-white/20 px-5 py-2 text-white/70 transition hover:border-purple-400/60 hover:text-white"
                >
                  Edit account settings
                </button>
              ) : null}
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
                  {isOwnProfile ? (
                    <button
                      type="button"
                      onClick={() => navigate(`${routePrefix}/collection`)}
                      className="text-xs font-medium text-sky-300 transition hover:text-sky-200"
                    >
                      Manage badges
                    </button>
                  ) : null}
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
                      {voidActive
                        ? "This profile is currently under the Trou Noir state."
                        : "The constellation and aura currently shown on this profile."}
                    </p>
                  </div>
                  {isOwnProfile ? (
                    <button
                      type="button"
                      onClick={() => navigate(`${routePrefix}/collection`)}
                      className="text-xs font-medium text-sky-300 transition hover:text-sky-200"
                    >
                      Manage in collection
                    </button>
                  ) : null}
                </div>

                <div className="flex flex-col items-center gap-5 rounded-[2rem] border border-white/10 bg-white/[0.03] px-6 py-8 text-center">
                  <SignatureConstellation
                    profile={profile}
                    voidActive={voidActive}
                    evaporating={voidEvaporating}
                  />

                  <div className="space-y-2">
                    <h4 className="text-2xl font-semibold text-white">
                      {voidActive
                        ? "Trou Noir"
                        : profile.equipped_constellation?.name ?? "No constellation equipped"}
                    </h4>
                    <p className="text-sm text-white/40">
                      {!voidActive && profile.equipped_aura_cosmetic?.name
                        ? `Aura: ${profile.equipped_aura_cosmetic.name}`
                        : voidActive
                          ? "The constellation has collapsed into a visible black hole state."
                          : "No aura equipped"}
                    </p>
                    <p className="text-sm text-white/40">
                      {profile.active_title ? `Title: ${profile.active_title}` : "No active title"}
                    </p>
                  </div>
                </div>

                {voidActive ? (
                  <div className="rounded-3xl border border-fuchsia-400/20 bg-[radial-gradient(circle_at_top,rgba(91,33,182,0.22),rgba(9,11,24,0.92))] p-5 text-left">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-fuchsia-200/75">
                          Trou Noir
                        </p>
                        <p className="text-sm text-white/70">
                          {profile.void_state.activated_at
                            ? `State active since ${formatVoidDate(profile.void_state.activated_at)}.`
                            : "State active after a long inactivity period."}
                        </p>
                        <p className="text-sm text-white/45">
                          It stays visible to authenticated users until the owner clears it manually.
                        </p>
                      </div>

                      {profile.void_state.can_clear ? (
                        <button
                          type="button"
                          onClick={handleClearVoidState}
                          disabled={clearingVoid}
                          className="rounded-full border border-fuchsia-300/35 bg-fuchsia-400/10 px-4 py-2 text-sm font-semibold text-fuchsia-100 transition hover:bg-fuchsia-400/18 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {clearingVoid ? "Evaporating..." : "Dissipate the Trou Noir"}
                        </button>
                      ) : null}
                    </div>
                  </div>
                ) : null}
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

        {showTitles && isOwnProfile ? (
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
