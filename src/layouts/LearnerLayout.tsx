/**
 * @file Layout wrapper for the Altair Learner Dashboard.
 *
 * @remarks
 * The `LearnerLayout` component defines the main navigation and structure
 * for users operating in “learner” mode within the Altair platform.
 * It provides a responsive top navigation bar with gradient accents,
 * user menu integration, and logout functionality.
 *
 * This layout manages navigation between core learner sections such as:
 * - Dashboard
 * - Explorer
 *
 * Child routes are rendered within a central content container
 * using React Router’s {@link Outlet}.
 *
 * @packageDocumentation
 */

import { NavLink, Outlet, useNavigate } from "react-router-dom";
import UserMenu from "@/components/user/UserMenu";
import { LogOut } from "lucide-react";


/**
 * Renders the Learner Dashboard layout, including global navigation
 * and session controls.
 *
 * @remarks
 * Features:
 * - Sticky header with backdrop blur and gradient separator line
 * - Dynamic navigation links with active state highlighting
 * - Integrated {@link UserMenu} for account interactions
 * - Logout button redirecting to the home or login page
 *
 * Used as the root layout for all `/learner/*` routes.
 *
 * @returns A React JSX element rendering the learner interface shell.
 *
 * @public
 */
export default function LearnerLayout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#070B16] text-white font-sans">
      {/* === NAVBAR === */}
      <header className="sticky top-0 z-50 bg-[#0E1323]/90 backdrop-blur-xl border-b border-white/5 shadow-[0_0_25px_rgba(0,0,0,0.5)]">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          {/* === LOGO === */}
          <div
            onClick={() => navigate("/learner/dashboard")}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <img
              src="/src/assets/titre.png"
              alt="Altaïr"
              className="h-9 drop-shadow-[0_0_10px_rgba(255,180,80,0.6)] hover:drop-shadow-[0_0_20px_rgba(255,180,80,0.9)] transition-all duration-300"
            />
          </div>

          {/* === NAV LINKS === */}
          <div className="flex items-center gap-10 text-sm font-medium tracking-wide">
            {[
              ["Dashboard", "/learner/dashboard"],
              ["Explorer", "/learner/explorer"],
            ].map(([label, path]) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `relative transition-all duration-200 ${
                    isActive
                      ? "text-sky-400 after:absolute after:content-[''] after:w-full after:h-[2px] after:bg-gradient-to-r after:from-sky-400 after:via-purple-500 after:to-orange-400 after:bottom-[-6px] after:left-0"
                      : "text-gray-300 hover:text-sky-300"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* === USER + LOGOUT === */}
          <div className="flex items-center gap-4">
            {/* === USER MENU (déroulant) === */}
            <UserMenu />

            {/* === LOGOUT === */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-orange-400 hover:from-purple-400 hover:to-orange-300 text-white text-sm px-3 py-1.5 rounded-lg shadow-lg hover:shadow-[0_0_15px_rgba(255,140,0,0.4)] transition-all"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </nav>

        {/* === COLORED LINE === */}
        <div className="h-[2px] w-full bg-gradient-to-r from-sky-400 via-purple-500 to-orange-400 shadow-[0_0_20px_rgba(255,140,0,0.3)]" />
      </header>

      {/* === MAIN CONTENT === */}
      <main className="px-6 py-10 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
