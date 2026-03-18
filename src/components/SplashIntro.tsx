/**
 * @file Splash screen component for Altair’s startup sequence.
 *
 * @remarks
 * The `SplashIntro` component displays an animated introductory screen when the application first loads.
 * It ensures that assets are preloaded before navigating to the login view, maintaining a fluid,
 * polished user experience consistent with Altair’s visual identity.
 *
 * The splash handles:
 * - Asset preloading (logo, background)
 * - Minimum display timing
 * - Automatic transition management
 * - Responsive guard for non-desktop devices
 *
 * Navigation proceeds automatically to `/` when all conditions are met or when the failsafe timer expires.
 *
 * @packageDocumentation
 */

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import bgImg from "@/assets/banniere.png";
import logoImg from "@/assets/logo.png";


/** Minimum splash screen duration (in milliseconds). */
const MIN_SPLASH_MS = 2600;
/** Maximum total wait time before forced navigation (in milliseconds). */
const MAX_WAIT_MS = 6000;


/**
 * Custom hook to preload a list of images and return readiness state.
 *
 * @param srcs - Array of image source URLs to preload.
 * @returns A boolean indicating whether all images have finished loading.
 *
 * @internal
 */
function usePreloadImages(srcs: string[]) {
  const [ready, setReady] = useState(false);
  const unique = useMemo(() => Array.from(new Set(srcs)), [srcs]);

  useEffect(() => {
    let cancelled = false;
    const loaders = unique.map(
      (src) =>
        new Promise<void>((res) => {
          const img = new Image();
          img.onload = () => res();
          img.onerror = () => res();
          img.src = src;
        })
    );
    Promise.all(loaders).then(() => !cancelled && setReady(true));
    return () => { cancelled = true; };
  }, [unique]);

  return ready;
}


/**
 * Renders the animated splash intro sequence displayed on app startup.
 *
 * @remarks
 * Features:
 * - Framer Motion animation for logo and subtitle
 * - Session-based transition handling (`altairTransition`)
 * - Preloads images before route change
 * - Automatically redirects to `/` after delay or timeout
 * - Displays a warning overlay for mobile users
 *
 * @returns A React JSX element rendering the Altair splash intro screen.
 *
 * @public
 */
export default function SplashIntro() {
  const navigate = useNavigate();
  const [minTimePassed, setMinTimePassed] = useState(false);
  const assetsReady = usePreloadImages([bgImg, logoImg]);
  const [isDesktop, setIsDesktop] = useState(true);

  // Detects current screen size and updates responsiveness
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Navigates once assets and timing conditions are fulfilled
  useEffect(() => {
    const t = setTimeout(() => setMinTimePassed(true), MIN_SPLASH_MS);
    const failSafe = setTimeout(() => {
      sessionStorage.setItem("altairTransition", String(Date.now()));
      navigate("/", { replace: true });
    }, MAX_WAIT_MS);
    return () => { clearTimeout(t); clearTimeout(failSafe); };
  }, [navigate]);

  useEffect(() => {
    if (assetsReady && minTimePassed && isDesktop) {
      sessionStorage.setItem("altairSplashSeen", "1");
      sessionStorage.setItem("altairTransition", String(Date.now()));
      navigate("/", { replace: true });
    }
  }, [assetsReady, minTimePassed, isDesktop, navigate]);

  return (
    <div
      className="min-h-screen relative flex items-center justify-center text-white bg-[#0B0D1A]"
      style={{
        backgroundImage: `url(${bgImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-[#0B0D1A]/85 backdrop-blur-[1px]" />

      <div className="relative z-10 flex flex-col items-center select-none">
        <motion.img
          src={logoImg}
          alt="Altair"
          className="h-24 w-24 rounded-full ring-1 ring-white/10 shadow-[0_0_40px_rgba(122,44,243,0.45)]"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: [0.6, 1.06, 1], opacity: [0, 1, 1], y: [0, 0, -26] }}
          transition={{ times: [0, 0.5, 1], duration: 1.3, ease: ["easeOut", "easeInOut", "easeOut"] }}
        />
        <motion.div
          className="mt-4 text-sm text-slate-300"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.45, ease: "easeOut" }}
        >
          Ephemeral, secure labs. No setup required.
        </motion.div>

        {/* Mobile warning message */}
        {!isDesktop && (
          <motion.div
            className="mt-6 text-center text-base font-medium text-red-300 bg-white/10 px-6 py-3 rounded-xl backdrop-blur-sm border border-white/10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            ⚠️ Only available on PC
          </motion.div>
        )}
      </div>
    </div>
  );
}
