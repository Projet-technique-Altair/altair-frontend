/**
 * @file LearnerLayout
 *
 * Learner shell layout (top navigation + outlet).
 * Navbar:
 * - Left: Altair title/logo
 * - Center: Pill navigation with floating Orion button (Dashboard)
 * - Subtitles visible under icons (Explorer / Dashboard / Settings)
 * - Right: UserMenu + logout icon
 */

import { NavLink, Outlet, useNavigate } from "react-router-dom";
import UserMenu from "@/components/user/UserMenu";
import type { LucideIcon } from "lucide-react";
import { Compass, Settings, LogOut } from "lucide-react";

import titleLogo from "@/assets/titre.png";
import orionBase from "@/assets/Orion-base.png";

type NavItem = {
  label: string;
  to: string;
  Icon: LucideIcon;
};

function PillItem({ label, to, Icon }: NavItem) {
  return (
    <NavLink
      to={to}
      aria-label={label}
      className={({ isActive }) =>
        [
          "flex flex-col items-center gap-1 transition-colors",
          isActive ? "text-sky-300" : "text-white/55 hover:text-white/80",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          <div className="flex h-11 w-11 items-center justify-center rounded-full">
            <Icon className="h-5 w-5" />
          </div>

          <span className="text-[10px] tracking-wide text-white/45">
            {label}
          </span>

          <span
            className={[
              "mt-1 h-1 w-1 rounded-full transition-opacity",
              isActive ? "opacity-100 bg-sky-300" : "opacity-0",
            ].join(" ")}
          />
        </>
      )}
    </NavLink>
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
    to: "/learner/settings", // adapte si besoin
    Icon: Settings,
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
            {/* LEFT: TITLE */}
            <div className="flex items-center">
              <button
                onClick={() => navigate("/learner/dashboard")}
                className="flex items-center gap-3 select-none"
                aria-label="Go to dashboard"
              >
                <img
                  src={titleLogo}
                  alt="Altaïr"
                  className="h-9 drop-shadow-[0_0_12px_rgba(255,180,80,0.6)] hover:drop-shadow-[0_0_22px_rgba(255,180,80,0.9)] transition-all duration-300"
                  draggable={false}
                />
              </button>
            </div>

            {/* CENTER: PILL NAV */}
            <div className="flex justify-center">
              <nav className="w-full max-w-[560px]">
                <div className="relative">
                  {/* pill background */}
                  <div className="h-20 rounded-full bg-white/6 border border-white/12 shadow-[0_18px_45px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                    <div className="h-full flex items-center justify-between px-14 py-4">
                      <PillItem {...explorer} />
                      {/* spacer for Orion */}
                      <div className="w-24" aria-hidden />
                      <PillItem {...settings} />
                    </div>
                  </div>

                  {/* DASHBOARD (ORION) — label OUTSIDE the round so Orion can be huge */}
                  <NavLink
                    to="/learner/dashboard"
                    aria-label="Dashboard"
                    className="absolute left-1/2 -translate-x-1/2 -top-7 flex flex-col items-center"
                  >
                    {({ isActive }) => (
                      <>
                        {/* the round button */}
                        <div
                          className={[
                            "relative h-20 w-20 rounded-full flex items-center justify-center overflow-hidden",
                            "border border-white/15 shadow-[0_26px_60px_rgba(0,0,0,0.6)] transition-all",
                            isActive
                              ? "bg-white/12"
                              : "bg-white/8 hover:bg-white/12",
                          ].join(" ")}
                        >
                          {/* subtle halo (Altair) */}
                          <span className="absolute inset-0 rounded-full bg-gradient-to-r from-sky-400/20 via-purple-400/20 to-orange-300/20 blur-md" />

                          {/* BIG ORION (this is what you want) */}
                          <img
                            src={orionBase}
                            alt="Orion"
                            draggable={false}
                            className="relative h-[72px] w-[72px] object-contain select-none scale-[3]"
                          />
                        </div>

                        {/* label under the round */}
                        <span className="mt-2 text-[10px] tracking-wide text-white/45">
                          Dashboard
                        </span>

                        {/* dot under label */}
                        <span
                          className={[
                            "mt-1 h-1 w-1 rounded-full transition-opacity",
                            isActive ? "opacity-100 bg-sky-300" : "opacity-0",
                          ].join(" ")}
                        />
                      </>
                    )}
                  </NavLink>
                </div>
              </nav>
            </div>

            {/* RIGHT: USER / LOGOUT */}
            <div className="flex items-center justify-end gap-3">
              <UserMenu />

              <button
                onClick={() => navigate("/")}
                className="h-11 w-11 rounded-full border border-white/12 bg-white/6 hover:bg-white/10 transition flex items-center justify-center"
                aria-label="Logout"
              >
                <LogOut className="h-5 w-5 text-white/80" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-10 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
