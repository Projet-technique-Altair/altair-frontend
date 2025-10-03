import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import bgImg from "../assets/banniere.png";
import logoImg from "../assets/logo.png";

const MIN_SPLASH_MS = 2600;
const MAX_WAIT_MS = 6000; // filet de sécurité

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

export default function SplashIntro() {
  const navigate = useNavigate();
  const [minTimePassed, setMinTimePassed] = useState(false);
  const assetsReady = usePreloadImages([bgImg, logoImg]);

  useEffect(() => {
    const t = setTimeout(() => setMinTimePassed(true), MIN_SPLASH_MS);
    const failSafe = setTimeout(() => {
      console.warn("[Splash] Failsafe redirect triggered.");
      sessionStorage.setItem("altairTransition", String(Date.now()));
      navigate("/login", { replace: true });
    }, MAX_WAIT_MS);
    return () => { clearTimeout(t); clearTimeout(failSafe); };
  }, [navigate]);

  useEffect(() => {
    if (assetsReady && minTimePassed) {
      console.log("[Splash] Ready → set transition flag & navigate");
      sessionStorage.setItem("altairSplashSeen", "1");
      sessionStorage.setItem("altairTransition", String(Date.now()));
      navigate("/login", { replace: true });
    } else {
      console.log("[Splash] Waiting...", { assetsReady, minTimePassed });
    }
  }, [assetsReady, minTimePassed, navigate]);

  return (
    <div
      className="min-h-screen relative flex items-center justify-center text-white bg-[#0B0D1A]"
      style={{ backgroundImage: `url(${bgImg})`, backgroundSize: "cover", backgroundPosition: "center" }}
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
      </div>
    </div>
  );
}
