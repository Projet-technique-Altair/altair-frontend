import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { request } from "@/api/client";
import { getProfile, type UserProfile } from "@/api/profile";
import { useAuth } from "@/context/useAuth";
import { refreshAccessToken } from "@/lib/refresh";
import {
  GACHA_SCENE_EVENT,
  readGachaScene,
  type GachaSceneMode,
} from "@/components/gacha/gachaScene";
import GamificationNavbar, {
  type GamificationNavbarItem,
} from "@/components/navigation/GamificationNavbar";
import GlobalToastHost from "@/components/ui/GlobalToastHost";
import { AnimatePresence, motion } from "framer-motion";
import {
  Compass,
  LogOut,
  Settings,
  ShoppingCart,
  Sparkles,
  Star,
} from "lucide-react";
import logoImg from "@/assets/logo.png";
import titleLogo from "@/assets/titre.png";
import backgroundimage from "@/assets/banniere.png";

export default function LearnerLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [gachaSceneMode, setGachaSceneMode] = useState<GachaSceneMode>("menu");
  const [showCreatorOverlay, setShowCreatorOverlay] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const leftNav: GamificationNavbarItem[] = [
    { label: "Explorer", path: "/learner/explorer", Icon: Compass },
    { label: "Settings", path: "/learner/settings", Icon: Settings },
  ];

  const rightNav: GamificationNavbarItem[] = [
    { label: "Gacha", path: "/learner/gacha", Icon: Sparkles },
    { label: "Market", path: "/learner/marketplace", Icon: ShoppingCart },
    { label: "Collection", path: "/learner/collection", Icon: Star },
  ];

  useEffect(() => {
    let cancelled = false;

    const loadProfile = () => {
      getProfile()
        .then((nextProfile) => {
          if (!cancelled) {
            setProfile(nextProfile);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setProfile(null);
          }
        });
    };

    loadProfile();
    window.addEventListener("altair-profile-updated", loadProfile);

    return () => {
      cancelled = true;
      window.removeEventListener("altair-profile-updated", loadProfile);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isTransitioning) {
        setShowCreatorOverlay(false);
      }
    };

    if (showCreatorOverlay) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKeyDown);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [showCreatorOverlay, isTransitioning]);

  useEffect(() => {
    const isGachaRoute = pathname === "/learner/gacha";

    if (!isGachaRoute) {
      setGachaSceneMode("menu");
      return;
    }

    const handleGachaScene = (event: Event) => {
      const nextMode = readGachaScene(event);
      if (nextMode) {
        setGachaSceneMode(nextMode);
      }
    };

    window.addEventListener(GACHA_SCENE_EVENT, handleGachaScene);
    return () => {
      window.removeEventListener(GACHA_SCENE_EVENT, handleGachaScene);
    };
  }, [pathname]);

  const handleLogout = () => logout();

  const handleSwitchToCreator = async () => {
    try {
      setIsTransitioning(true);

      await request("/users/me/toggle-role", {
        method: "POST",
      });

      await refreshAccessToken();

      const me = await request<{ role: string }>("/users/me");

      if (me.role === "creator") {
        navigate("/creator/dashboard");
        return;
      }

      navigate("/learner/dashboard");
    } catch (error) {
      console.error("Toggle role failed", error);
      setIsTransitioning(false);
    }
  };

  const isGachaRoute = pathname === "/learner/gacha";
  const isFullscreenGacha = isGachaRoute && gachaSceneMode !== "menu";
  const hideHeader = isFullscreenGacha;

  return (
    <div
      className="min-h-screen font-sans text-white"
      style={{
        backgroundImage: `url(${backgroundimage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {!hideHeader ? (
        <header className="sticky top-0 z-50 border-b border-white/5 bg-[#070B16]/70 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-6 py-7">
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-8">
              <button type="button" onClick={() => navigate("/learner/dashboard")}>
                <img src={titleLogo} alt="Altaïr" className="h-9" />
              </button>

              <GamificationNavbar
                currentPath={pathname}
                dashboardPath="/learner/dashboard"
                profilePath="/learner/profile"
                leftItems={leftNav}
                rightItems={rightNav}
                profileImageUrl={profile?.equipped_profile_cosmetic?.image_url}
                profileImageAlt={profile?.equipped_profile_cosmetic?.name}
                profileAuraImageUrl={profile?.equipped_aura_cosmetic?.image_url}
                profileAuraImageAlt={profile?.equipped_aura_cosmetic?.name}
                constellationImageUrl={profile?.equipped_constellation?.image_url}
                constellationName={profile?.equipped_constellation?.name ?? null}
                constellationAuraImageUrl={profile?.equipped_aura_cosmetic?.image_url}
                constellationAuraImageAlt={profile?.equipped_aura_cosmetic?.name}
              />

              <div className="flex items-center gap-4">
                <span className="text-sm text-white/80">learner mode</span>

                <button
                  type="button"
                  onClick={() => setShowCreatorOverlay(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/6 transition hover:bg-white/10"
                >
                  <Sparkles className="h-4 w-4 text-white/80" />
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/6 transition hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4 text-white/80" />
                </button>
              </div>
            </div>
          </div>
        </header>
      ) : null}

      <main
        className={[
          "w-full",
          isFullscreenGacha ? "max-w-none px-0 py-0" : "mx-auto max-w-[1800px] px-12 py-14",
          isTransitioning ? "opacity-0" : "opacity-100",
        ].join(" ")}
      >
        <Outlet />
      </main>

      <AnimatePresence>
        {showCreatorOverlay ? (
          <motion.div
            className="fixed inset-0 z-[999] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (!isTransitioning) {
                setShowCreatorOverlay(false);
              }
            }}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl" />

            {isTransitioning ? (
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.98, opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center px-8 py-10 text-center"
              >
                <motion.img
                  src={logoImg}
                  alt="Altair"
                  className="h-32 w-32 object-contain sm:h-40 sm:w-40"
                  animate={{ opacity: [0.72, 1, 0.72], scale: [0.98, 1.03, 0.98] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                />

                <div className="mt-8 text-xl font-semibold tracking-tight text-white">
                  Loading
                </div>

                <div className="mt-2 text-sm text-white/55">
                  Switching to creator mode...
                </div>
              </motion.div>
            ) : null}

            {!isTransitioning ? (
              <motion.div
                onClick={(event) => event.stopPropagation()}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0B0F1A]/80 p-8 text-center backdrop-blur-2xl"
              >
                <h2 className="mb-2 text-xl text-white">Creator Mode</h2>

                <p className="mb-6 text-sm text-white/60">
                  Build labs, design starpaths and manage learning groups.
                </p>

                <div className="flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreatorOverlay(false)}
                    className="rounded-lg bg-white/5 px-4 py-2"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSwitchToCreator}
                    className="rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-2"
                  >
                    Enter Creator
                  </button>
                </div>
              </motion.div>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <GlobalToastHost />
    </div>
  );
}
