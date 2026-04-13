import type { LucideIcon } from "lucide-react";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ConstellationArtwork from "@/components/gamification/ConstellationArtwork";
import { cosmeticAssetUrl } from "@/lib/cosmeticAsset";

export type GamificationNavbarItem = {
  label: string;
  path: string;
  Icon: LucideIcon;
};

type GamificationNavbarProps = {
  currentPath: string;
  dashboardPath: string;
  profilePath: string;
  leftItems: GamificationNavbarItem[];
  rightItems: GamificationNavbarItem[];
  profileImageUrl?: string | null;
  profileImageAlt?: string;
  profileAuraImageUrl?: string | null;
  profileAuraImageAlt?: string;
  constellationImageUrl?: string | null;
  constellationName?: string | null;
  constellationAuraImageUrl?: string | null;
  constellationAuraImageAlt?: string;
};

function isPathActive(currentPath: string, path: string) {
  return currentPath === path || currentPath.startsWith(`${path}/`);
}

function NavPill({
  item,
  currentPath,
}: {
  item: GamificationNavbarItem;
  currentPath: string;
}) {
  const navigate = useNavigate();
  const isActive = isPathActive(currentPath, item.path);

  return (
    <button
      type="button"
      onClick={() => navigate(item.path)}
      className={[
        "flex cursor-pointer flex-col items-center gap-1 transition-colors",
        isActive ? "text-white" : "text-white/55 hover:text-white/80",
      ].join(" ")}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full">
        <item.Icon className="h-5 w-5" />
      </div>

      <span
        className={[
          "text-[10px] tracking-wide",
          isActive ? "text-white/85" : "text-white/45",
        ].join(" ")}
      >
        {item.label}
      </span>

      <span
        className={[
          "mt-1 h-1 w-1 rounded-full bg-sky-300 transition-opacity",
          isActive ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />
    </button>
  );
}

function ProfilePill({
  currentPath,
  profilePath,
  profileImageUrl,
  profileImageAlt,
  auraImageUrl,
  auraImageAlt,
}: {
  currentPath: string;
  profilePath: string;
  profileImageUrl?: string | null;
  profileImageAlt?: string;
  auraImageUrl?: string | null;
  auraImageAlt?: string;
}) {
  const navigate = useNavigate();
  const isActive = isPathActive(currentPath, profilePath);
  const hasAura = Boolean(auraImageUrl);
  const isAuraVideo = Boolean(auraImageUrl && /\.(mp4|webm|ogg)(\?.*)?$/i.test(auraImageUrl));

  return (
    <button
      type="button"
      onClick={() => navigate(profilePath)}
      className={[
        "flex cursor-pointer flex-col items-center gap-1 transition-colors",
        isActive ? "text-white" : "text-white/55 hover:text-white/80",
      ].join(" ")}
    >
      <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full transition">
        {hasAura ? (
          <>
            <div className="pointer-events-none absolute inset-[-16%]">
              {isAuraVideo ? (
                <video
                  src={cosmeticAssetUrl(auraImageUrl!)}
                  className="h-full w-full max-w-none scale-125 object-contain opacity-95 mix-blend-screen"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                />
              ) : (
                <img
                  src={cosmeticAssetUrl(auraImageUrl!)}
                  alt={auraImageAlt ?? "Equipped aura"}
                  className="h-full w-full max-w-none scale-125 object-contain opacity-95 mix-blend-screen"
                />
              )}
            </div>
            <div className="relative z-10 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#0B1020]/82 ring-1 ring-white/10">
              {profileImageUrl ? (
                <img
                  src={cosmeticAssetUrl(profileImageUrl)}
                  alt={profileImageAlt ?? "Profile"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-4.5 w-4.5 text-white/85" />
              )}
            </div>
          </>
        ) : profileImageUrl ? (
          <img
            src={cosmeticAssetUrl(profileImageUrl)}
            alt={profileImageAlt ?? "Profile"}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <User className="h-5 w-5 text-white/80" />
        )}
      </div>

      <span
        className={[
          "text-[10px] tracking-wide",
          isActive ? "text-white/85" : "text-white/45",
        ].join(" ")}
      >
        Profile
      </span>

      <span
        className={[
          "mt-1 h-1 w-1 rounded-full bg-sky-300 transition-opacity",
          isActive ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />
    </button>
  );
}

function CenterConstellationPill({
  currentPath,
  dashboardPath,
  constellationImageUrl,
  constellationName,
  auraImageUrl,
  auraImageAlt,
}: {
  currentPath: string;
  dashboardPath: string;
  constellationImageUrl?: string | null;
  constellationName?: string | null;
  auraImageUrl?: string | null;
  auraImageAlt?: string;
}) {
  const navigate = useNavigate();
  const isActive = isPathActive(currentPath, dashboardPath);
  const hasConstellation = Boolean(constellationImageUrl);
  const hasAura = Boolean(auraImageUrl);
  const isAuraVideo = Boolean(auraImageUrl && /\.(mp4|webm|ogg)(\?.*)?$/i.test(auraImageUrl));

  return (
    <button
      type="button"
      onClick={() => navigate(dashboardPath)}
      className="absolute left-1/2 -top-7 flex -translate-x-1/2 flex-col items-center"
    >
      <div
        className="relative flex h-20 w-20 items-center justify-center overflow-visible rounded-full border border-white/15 bg-white/8 shadow-[0_26px_60px_rgba(0,0,0,0.6)] transition-all hover:bg-white/12"
      >
        {hasConstellation ? (
          <span className="absolute inset-0 rounded-full bg-gradient-to-r from-sky-400/20 via-purple-400/20 to-orange-300/20 blur-md" />
        ) : null}

        {hasConstellation ? (
          <ConstellationArtwork
            imageUrl={constellationImageUrl}
            alt={constellationName ?? "Equipped constellation"}
            containerClassName="relative z-10 h-full w-full overflow-hidden rounded-full"
            imageClassName="relative z-10 h-full w-full rounded-full object-cover select-none"
            fallbackSymbolClassName="hidden"
          />
        ) : (
          <div className="relative z-10 h-full w-full rounded-full" />
        )}

        {hasAura ? (
          <div
            className="pointer-events-none absolute inset-[-28%] z-30 overflow-hidden rounded-full drop-shadow-[0_0_14px_rgba(96,165,250,0.65)]"
            style={{
              WebkitMaskImage:
                "radial-gradient(circle, transparent 44%, black 56%, black 69%, transparent 78%)",
              maskImage:
                "radial-gradient(circle, transparent 44%, black 56%, black 69%, transparent 78%)",
            }}
          >
            {isAuraVideo ? (
              <video
                src={cosmeticAssetUrl(auraImageUrl!)}
                className="h-full w-full max-w-none scale-[1.9] object-contain opacity-100 saturate-150 brightness-125 contrast-125"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
              />
            ) : (
              <img
                src={cosmeticAssetUrl(auraImageUrl!)}
                alt={auraImageAlt ?? "Equipped aura"}
                className="h-full w-full max-w-none scale-[1.9] object-contain opacity-100 saturate-150 brightness-125 contrast-125"
              />
            )}
          </div>
        ) : null}
      </div>

      <span className="mt-2 block h-[12px] text-[10px] tracking-wide text-white/45">
        {constellationName ?? ""}
      </span>

      <span
        className={[
          "mt-1 h-1 w-1 rounded-full bg-sky-300 transition-opacity",
          isActive ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />
    </button>
  );
}

export default function GamificationNavbar({
  currentPath,
  dashboardPath,
  profilePath,
  leftItems,
  rightItems,
  profileImageUrl,
  profileImageAlt,
  profileAuraImageUrl,
  profileAuraImageAlt,
  constellationImageUrl,
  constellationName,
  constellationAuraImageUrl,
  constellationAuraImageAlt,
}: GamificationNavbarProps) {
  return (
    <div className="flex justify-center">
      <nav className="w-full max-w-[720px]">
        <div className="relative">
          <div className="h-20 rounded-full border border-white/12 bg-white/6 shadow-[0_18px_45px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="flex h-full items-center justify-between px-10 py-4">
              <div className="flex items-center gap-6">
                <ProfilePill
                  currentPath={currentPath}
                  profilePath={profilePath}
                  profileImageUrl={profileImageUrl}
                  profileImageAlt={profileImageAlt}
                  auraImageUrl={profileAuraImageUrl}
                  auraImageAlt={profileAuraImageAlt}
                />
                {leftItems.map((item) => (
                  <NavPill key={item.path} item={item} currentPath={currentPath} />
                ))}
              </div>

              <div className="flex items-center gap-6">
                {rightItems.map((item) => (
                  <NavPill key={item.path} item={item} currentPath={currentPath} />
                ))}
              </div>
            </div>
          </div>

          <CenterConstellationPill
            currentPath={currentPath}
            dashboardPath={dashboardPath}
            constellationImageUrl={constellationImageUrl}
            constellationName={constellationName}
            auraImageUrl={constellationAuraImageUrl}
            auraImageAlt={constellationAuraImageAlt}
          />
        </div>
      </nav>
    </div>
  );
}
