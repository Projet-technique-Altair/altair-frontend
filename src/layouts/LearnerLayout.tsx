/**
 * @file LearnerLayout
 */

import { useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/useAuth";
import { useState, useEffect } from "react";

import { motion, AnimatePresence } from "framer-motion";

import type { LucideIcon } from "lucide-react";
import {
  Compass,
  Settings,
  LogOut,
  Sparkles,
  ShoppingCart,
  Star,
  User,
} from "lucide-react";

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
    <div
      onClick={() => onNavigate(to)}
      className="flex flex-col items-center gap-1 cursor-pointer text-white/55 hover:text-white/80 transition"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full">
        <Icon className="h-5 w-5" />
      </div>

      <span className="text-[10px] tracking-wide text-white/45">
        {label}
      </span>
    </div>
  );
}

/* ================= MAIN ================= */
export default function LearnerLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [showCreatorOverlay, setShowCreatorOverlay] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  /* ================= NAV ================= */
  const leftNav: NavItem[] = [
    { label: "Explorer", to: "/learner/explorer", Icon: Compass },
    { label: "Settings", to: "/learner/settings", Icon: Settings },
  ];

  const rightNav: NavItem[] = [
    { label: "Gacha", to: "/learner/gacha", Icon: Sparkles },
    { label: "Market", to: "/learner/marketplace", Icon: ShoppingCart },
    { label: "Collection", to: "/learner/collection", Icon: Star },
  ];

  /* ================= HANDLERS ================= */
  const handleLogout = () => logout();

  const handleSwitchToCreator = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      navigate("/creator/dashboard");
    }, 900);
  };

  /* ================= UX ================= */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isTransitioning) {
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
            <button onClick={() => navigate("/learner/dashboard")}>
              <img src={titleLogo} alt="Altaïr" className="h-9" />
            </button>

            {/* NAV */}
            <div className="flex justify-center">
              <nav className="w-full max-w-[720px] relative">

                <div className="h-20 rounded-full bg-white/6 border border-white/12 backdrop-blur-xl flex items-center justify-between px-10 py-4">

                  {/* LEFT */}
                  <div className="flex items-center gap-6">
                    <div
                      onClick={() => navigate("/learner/profile")}
                      className="h-10 w-10 rounded-full border border-white/12 bg-white/6 flex items-center justify-center cursor-pointer"
                    >
                      <User className="h-5 w-5 text-white/80" />
                    </div>

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
                <div
                  onClick={() => navigate("/learner/dashboard")}
                  className="absolute left-1/2 -translate-x-1/2 -top-4 flex flex-col items-center cursor-pointer"
                >
                  <div className="h-20 w-20 rounded-full bg-white/8 flex items-center justify-center">
                    <img src={orionBase} className="scale-[3]" />
                  </div>

                  {/* 🔥 TEXT ABAISSÉ */}
                  <span className="mt-4 text-[10px] text-white/45">
                    Dashboard
                  </span>
                </div>

              </nav>
            </div>

            {/* RIGHT USER */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/80">
                guest • student
              </span>

              {/* SWITCH */}
              <button
                onClick={() => setShowCreatorOverlay(true)}
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

      {/* ================= MAIN ================= */}
      <main className="px-12 py-14">
        <Outlet />
      </main>

      {/* ================= OVERLAY ================= */}
      <AnimatePresence>
        {showCreatorOverlay && (
          <motion.div
            className="fixed inset-0 z-[999] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isTransitioning && setShowCreatorOverlay(false)}
          >
            {/* BACKDROP */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl" />

            {/* PORTAL */}
            {isTransitioning && (
              <motion.div
                className="absolute h-[220px] w-[220px] rounded-full"
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 9, opacity: 1 }}
                transition={{ duration: 0.9 }}
                style={{
                  background:
                    "radial-gradient(circle, rgba(139,92,246,0.6), transparent)",
                  filter: "blur(25px)",
                }}
              />
            )}

            {/* CARD */}
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0B0F1A]/80 backdrop-blur-2xl p-8 text-center overflow-hidden"
              animate={{
                opacity: isTransitioning ? 0 : 1,
              }}
            >
              {/* GLOW */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-sky-400/10 blur-2xl" />

              {/* ICON */}
              <div className="flex justify-center mb-6">
                <div className="h-16 w-16 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white/90" />
                </div>
              </div>

              <h2 className="text-xl text-white mb-2">
                Creator Mode
              </h2>

              <p className="text-sm text-white/60 mb-6">
                Build labs, design starpaths and manage learning groups.
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowCreatorOverlay(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSwitchToCreator}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500"
                >
                  Enter Creator
                </button>
              </div>
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}