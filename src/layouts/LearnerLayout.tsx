/**
 * @file LearnerLayout
 *
 * Navbar structure
 *
 * [ Profile | Explorer | Settings ]   [ Orion ]   [ Gacha | Market | Collection ]
 */

import { useNavigate, Outlet } from "react-router-dom";

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

type NavItem = {
  label: string;
  to: string;
  Icon: LucideIcon;
};

type PillItemProps = NavItem & {
  onNavigate: (to: string) => void;
};

function PillItem({ label, to, Icon, onNavigate }: PillItemProps) {
  return (
    <div
      onClick={() => onNavigate(to)}
      className="flex flex-col items-center gap-1 cursor-pointer transition-colors text-white/55 hover:text-white/80"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full">
        <Icon className="h-5 w-5" />
      </div>

      <span className="text-[10px] tracking-wide text-white/45">
        {label}
      </span>

      <span className="mt-1 h-1 w-1 rounded-full bg-sky-300 opacity-0" />
    </div>
  );
}

export default function LearnerLayout() {
  const navigate = useNavigate();

  const explorer: NavItem = {
    label: "Explorer",
    to: "/learner/explorer",
    Icon: Compass,
  };

  const settings: NavItem = {
    label: "Settings",
    to: "/learner/settings",
    Icon: Settings,
  };

  const gacha: NavItem = {
    label: "Gacha",
    to: "/learner/gacha",
    Icon: Sparkles,
  };

  const marketplace: NavItem = {
    label: "Market",
    to: "/learner/marketplace",
    Icon: ShoppingCart,
  };

  const collection: NavItem = {
    label: "Collection",
    to: "/learner/collection",
    Icon: Star,
  };

  return (
    <div
      className="min-h-screen text-white font-sans"
      style={{
        backgroundImage: "url(/src/assets/banniere.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <header className="sticky top-0 z-50 bg-[#070B16]/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-7">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-8">

            {/* LEFT — TITLE */}
            <div className="flex items-center">
              <button
                onClick={() => navigate("/learner/dashboard")}
                className="flex items-center gap-3 select-none"
              >
                <img
                  src={titleLogo}
                  alt="Altaïr"
                  className="h-9 drop-shadow-[0_0_12px_rgba(255,180,80,0.6)] hover:drop-shadow-[0_0_22px_rgba(255,180,80,0.9)] transition-all duration-300"
                />
              </button>
            </div>

            {/* CENTER NAVBAR */}
            <div className="flex justify-center">
              <nav className="w-full max-w-[720px]">
                <div className="relative">

                  {/* pill background */}
                  <div className="h-20 rounded-full bg-white/6 border border-white/12 shadow-[0_18px_45px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                    <div className="h-full flex items-center justify-between px-10 py-4">

                      {/* LEFT — LEARNING */}
                      <div className="flex items-center gap-6">

                        {/* PROFILE ICON */}
                        <div
                          onClick={() => navigate("/learner/profile")}
                          className="flex items-center justify-center h-10 w-10 rounded-full border border-white/12 bg-white/6 hover:bg-white/10 transition cursor-pointer"
                        >
                          <User className="h-5 w-5 text-white/80" />
                        </div>

                        <PillItem {...explorer} onNavigate={navigate} />
                        <PillItem {...settings} onNavigate={navigate} />

                      </div>

                      {/* RIGHT — GAMIFICATION */}
                      <div className="flex items-center gap-6">

                        <PillItem {...gacha} onNavigate={navigate} />
                        <PillItem {...marketplace} onNavigate={navigate} />
                        <PillItem {...collection} onNavigate={navigate} />

                      </div>

                    </div>
                  </div>

                  {/* ORION DASHBOARD */}
                  <div
                    onClick={() => navigate("/learner/dashboard")}
                    className="absolute left-1/2 -translate-x-1/2 -top-7 flex flex-col items-center cursor-pointer"
                  >
                    <div
                      className="relative h-20 w-20 rounded-full flex items-center justify-center overflow-hidden
                      border border-white/15 shadow-[0_26px_60px_rgba(0,0,0,0.6)]
                      bg-white/8 hover:bg-white/12 transition-all"
                    >
                      <span className="absolute inset-0 rounded-full bg-gradient-to-r from-sky-400/20 via-purple-400/20 to-orange-300/20 blur-md" />

                      <img
                        src={orionBase}
                        alt="Orion"
                        className="relative h-[72px] w-[72px] object-contain select-none scale-[3]"
                      />
                    </div>

                    <span className="mt-2 text-[10px] tracking-wide text-white/45">
                      Dashboard
                    </span>

                    <span className="mt-1 h-1 w-1 rounded-full bg-sky-300 opacity-100" />
                  </div>

                </div>
              </nav>
            </div>

            {/* RIGHT — USER INFO + ACTIONS */}
            <div className="flex items-center gap-4">

              <span className="text-sm text-white/80">
                guest • student
              </span>

              {/* CREATOR MODE */}
              <button
                className="h-10 w-10 rounded-full border border-white/12 bg-white/6 hover:bg-white/10 transition flex items-center justify-center"
                title="Switch creator mode"
              >
                <Sparkles className="h-4 w-4 text-white/80" />
              </button>

              {/* LOGOUT */}
              <button
                onClick={() => navigate("/")}
                className="h-10 w-10 rounded-full border border-white/12 bg-white/6 hover:bg-white/10 transition flex items-center justify-center"
              >
                <LogOut className="h-4 w-4 text-white/80" />
              </button>

            </div>

          </div>
        </div>
      </header>

      <main className="px-12 py-14 w-full max-w-[1800px] mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
