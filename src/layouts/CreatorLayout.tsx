// src/layouts/CreatorLayout.tsx


/**
 * @file Layout wrapper for the Altair Creator Dashboard.
 *
 * @remarks
 * The `CreatorLayout` component defines the main structure and navigation bar
 * for users operating in “creator” mode within the Altair platform.
 * It provides access to creator-specific routes, a consistent header,
 * and quick actions for switching roles or logging out.
 *
 * The layout includes:
 * - Gradient header with branding
 * - Role switching between “creator” and “learner”
 * - Session management via {@link useAuth}
 * - Page routing through React Router’s {@link Outlet}
 *
 * @packageDocumentation
 */
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";



/**
 * Renders the Creator Dashboard layout, providing header navigation and
 * role management controls.
 *
 * @remarks
 * Features:
 * - Top header with gradient title and interactive buttons
 * - “Return to Student Mode” toggle using {@link useAuth.switchRole}
 * - Logout action that clears session data and redirects to `/login`
 * - Embedded route rendering through React Router’s `<Outlet />`
 *
 * Used as the root layout for all `/creator/*` routes.
 *
 * @returns A React JSX element rendering the Creator Dashboard interface shell.
 *
 * @public
 */
export default function CreatorLayout() {
  const navigate = useNavigate();
  const { user, switchRole, logout } = useAuth();

  /** Clears the session and navigates back to the login screen. */
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  /** Switches back to learner mode and redirects to the learner dashboard. */
  const handleReturnToStudent = () => {
    switchRole("learner");
    navigate("/learner/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col">
      {/* === HEADER BAR === */}
      <header className="flex justify-between items-center px-8 py-4 border-b border-white/10 bg-[#111827]/60 backdrop-blur-sm sticky top-0 z-50">
        <motion.h1
          className="text-xl font-semibold tracking-wide"
          style={{
            background:
              "linear-gradient(90deg, #7DD3FC, #C084FC, #F59E0B)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Altaïr Creator Dashboard
        </motion.h1>

        <div className="flex items-center gap-4">
          {/* === RETURN TO STUDENT MODE === */}
          <button
            onClick={handleReturnToStudent}
            className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm bg-gradient-to-r from-orange-400 to-purple-500 hover:opacity-90 transition shadow-[0_0_8px_rgba(255,140,0,0.3)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Student Mode
          </button>

          {/* === PROFILE === */}
          <button
            onClick={() => navigate("/learner/profile")}
            className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm bg-[#1A1F2E] hover:bg-[#23283a] transition"
          >
            <User className="h-4 w-4" />
            {user?.username ?? "guest"}
          </button>

          {/* === LOGOUT === */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm bg-[#1A1F2E] hover:bg-[#2b1a1a] transition"
          >
            <LogOut className="h-4 w-4 text-red-400" />
            Logout
          </button>
        </div>
      </header>

      {/* === MAIN CONTENT === */}
      <main className="flex-1 px-8 py-10">
        <Outlet />
      </main>
    </div>
  );
}
