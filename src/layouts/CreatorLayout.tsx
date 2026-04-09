// src/layouts/CreatorLayout.tsx

import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/useAuth";
import { useState, useEffect } from "react";
import { request } from "@/api/client";

import { motion, AnimatePresence } from "framer-motion";

import {
  User,
  LogOut,
  Sparkles,
  ShoppingCart,
  Star,
  Settings,
  Compass,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

import titleLogo from "@/assets/titre.png";
import orionBase from "@/assets/Orion-base.png";
import backgroundimage from "@/assets/banniere.png";

/* ================= TYPES ================= */
type NavItem = {
  label: string;
  to: string;
  Icon: LucideIcon;
};

type PillItemProps = NavItem & {
  onNavigate: (to: string) => void;
};

/* ================= COMPONENT ================= */
function PillItem({ label, to, Icon, onNavigate }: PillItemProps) {
  return (
    <button
      onClick={() => onNavigate(to)}
      className="flex flex-col items-center gap-1 text-white/55 hover:text-white/80 transition"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full">
        <Icon className="h-5 w-5" />
      </div>

      <span className="text-[10px] tracking-wide text-white/45">
        {label}
      </span>
    </button>
  );
}

/* ================= MAIN ================= */
export default function CreatorLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [showSwitchOverlay, setShowSwitchOverlay] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  /* ================= NAV ================= */
  const leftNav: NavItem[] = [
    { label: "Workspace", to: "/creator/workspace", Icon: Compass },
    { label: "Settings", to: "/creator/settings", Icon: Settings },
  ];

  const rightNav: NavItem[] = [
    { label: "Gacha", to: "/creator/gacha", Icon: Sparkles },
    { label: "Market", to: "/creator/marketplace", Icon: ShoppingCart },
    { label: "Collection", to: "/creator/collection", Icon: Star },
  ];

  /* ================= HANDLERS ================= */
  const handleLogout = () => logout();

  const handleSwitchToLearner = async () => {
    try {
      setIsTransitioning(true);

      // 🔥 call backend
      await request("/users/me/toggle-role", {
        method: "POST",
      });

      // 🔥 reset auth (obligatoire)
      logout();

    } catch (e) {
      console.error("Toggle role failed", e);
      setIsTransitioning(false);
    }
  };

  /* ================= UX ================= */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isTransitioning) {
        setShowSwitchOverlay(false);
      }
    };

    if (showSwitchOverlay) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKeyDown);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [showSwitchOverlay, isTransitioning]);

  return (
    <div
      className="min-h-screen text-white font-sans"
      style={{
        backgroundImage: `url(${backgroundimage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 bg-[#070B16]/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-7">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-8">

            {/* TITLE */}
            <button onClick={() => navigate("/creator/dashboard")}>
              <img src={titleLogo} alt="Altaïr" className="h-9" />
            </button>

            {/* NAV */}
            <div className="flex justify-center">
              <nav className="w-full max-w-[720px] relative">

                <div className="h-20 rounded-full bg-white/6 border border-white/12 backdrop-blur-xl flex items-center justify-between px-10 py-4">

                  {/* LEFT */}
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => navigate("/creator/profile")}
                      className="h-10 w-10 rounded-full border border-white/12 bg-white/6 flex items-center justify-center"
                    >
                      <User className="h-5 w-5 text-white/80" />
                    </button>

                    {leftNav.map((item) => (
                      <PillItem key={item.to} {...item} onNavigate={navigate} />
                    ))}
                  </div>

                  {/* RIGHT */}
                  <div className="flex items-center gap-6">
                    {rightNav.map((item) => (
                      <PillItem key={item.to} {...item} onNavigate={navigate} />
                    ))}
                  </div>
                </div>

                {/* ORION */}
                <button
                  onClick={() => navigate("/creator/dashboard")}
                  className="absolute left-1/2 -translate-x-1/2 -top-4 flex flex-col items-center"
                >
                  <div className="h-20 w-20 rounded-full bg-white/8 flex items-center justify-center">
                    <img src={orionBase} className="scale-[3]" />
                  </div>

                  <span className="mt-4 text-[10px] text-white/45">
                    Dashboard
                  </span>
                </button>

              </nav>
            </div>

            {/* RIGHT USER */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/80">
                creator mode
              </span>

              {/* SWITCH */}
              <button
                onClick={() => setShowSwitchOverlay(true)}
                className="h-10 w-10 rounded-full border border-white/12 bg-white/6 flex items-center justify-center"
              >
                <Sparkles className="h-4 w-4 text-white/80" />
              </button>

              {/* LOGOUT */}
              <button
                onClick={handleLogout}
                className="h-10 w-10 rounded-full border border-white/12 bg-white/6 flex items-center justify-center"
              >
                <LogOut className="h-4 w-4 text-white/80" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* ================= MAIN (FIX ICI) ================= */}
      <motion.main
        className="px-12 py-14"
        animate={{
          opacity: isTransitioning ? 0 : 1,
          filter: isTransitioning ? "blur(8px)" : "blur(0px)",
        }}
        transition={{ duration: 0.4 }}
      >
        <Outlet />
      </motion.main>

      {/* ================= OVERLAY ================= */}
      <AnimatePresence>
        {showSwitchOverlay && (
          <motion.div
            className="fixed inset-0 z-[999] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isTransitioning && setShowSwitchOverlay(false)}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl" />

            {/* GLOW */}
            {isTransitioning && (
              <motion.div
                className="absolute h-[240px] w-[240px] rounded-full"
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 10, opacity: 1 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                style={{
                  background:
                    "radial-gradient(circle, rgba(56,189,248,0.7), transparent)",
                  filter: "blur(40px)",
                }}
              />
            )}

            {/* MODAL */}
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{
                scale: isTransitioning ? 0.9 : 1,
                opacity: isTransitioning ? 0 : 1,
              }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0B0F1A]/80 backdrop-blur-2xl p-8 text-center"
            >
              <h2 className="text-xl text-white mb-2">
                Learner Mode
              </h2>

              <p className="text-sm text-white/60 mb-6">
                Return to your learning journey.
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowSwitchOverlay(false)}
                  className="px-4 py-2 rounded-lg bg-white/5"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSwitchToLearner}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500"
                >
                  Enter Learner
                </button>
              </div>
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}