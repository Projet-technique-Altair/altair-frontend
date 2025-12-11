/**
 * @file ProfilePage — learner profile and account overview.
 *
 * @remarks
 * The Profile page centralizes user information and entry points for:
 *  - Viewing personal data (name, role, email, language, join date)
 *  - Accessing settings (account management)
 *  - Quick shortcuts to the dashboard and creator mode
 *
 * It uses static mock user data for now, but in production would
 * connect to an authenticated user endpoint or context provider.
 *
 * Route: `/learner/profile`
 *
 * @packageDocumentation
 */

import { useNavigate } from "react-router-dom";
import DashboardCard from "@/components/ui/DashboardCard";
import { ALT_COLORS } from "@/lib/theme";


/**
 * Displays the current user’s profile information and shortcuts to
 * dashboard and creator features.
 *
 * @remarks
 * - Shows user avatar, metadata, and role badge.
 * - Includes CTA buttons for settings, dashboard, and creator mode.
 * - Uses responsive cards with animated gradients and brand colors.
 *
 * @example
 * ```tsx
 * <Route path="/learner/profile" element={<ProfilePage />} />
 * ```
 *
 * @returns A user profile view with personal info and quick links.
 *
 * @public
 */
export default function ProfilePage() {
  const navigate = useNavigate();

  const user = {
    name: "guest",
    role: "student",
    email: "guest@altair.dev",
    joined: "October 2025",
    language: "English",
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white px-8 py-10 space-y-10">
      {/* === HEADER === */}
      <div>
        <h1
          className="text-3xl font-bold"
          style={{
            background: `linear-gradient(90deg, ${ALT_COLORS.blue}, ${ALT_COLORS.purple}, ${ALT_COLORS.orange})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          User Profile
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          Manage your personal information and access your account settings.
        </p>
      </div>

      {/* === MAIN CARD === */}
      <DashboardCard className="p-8 flex flex-col sm:flex-row items-center sm:items-start gap-8">
        {/* === AVATAR === */}
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-orange-400 text-2xl flex items-center justify-center font-semibold shadow-[0_0_15px_rgba(255,140,0,0.4)]">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="absolute -bottom-2 right-0 bg-sky-500 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white shadow">
            {user.role}
          </div>
        </div>

        {/* === INFO SECTION === */}
        <div className="flex-1 space-y-2">
          <h2 className="text-xl font-semibold text-white">{user.name}</h2>
          <p className="text-sm text-gray-400">{user.email}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-sm mt-4">
            <p>
              <span className="text-gray-400">Role: </span>
              <span className="text-sky-400 font-medium capitalize">
                {user.role}
              </span>
            </p>
            <p>
              <span className="text-gray-400">Language: </span>
              <span className="text-purple-400">{user.language}</span>
            </p>
            <p>
              <span className="text-gray-400">Member since: </span>
              <span className="text-orange-400">{user.joined}</span>
            </p>
          </div>

          <button
            onClick={() => navigate("/learner/settings")}
            className="mt-6 px-5 py-2 rounded-full bg-gradient-to-r from-sky-400 via-purple-400 to-orange-400 font-medium text-white hover:opacity-90 transition"
          >
            Edit account settings
          </button>
        </div>
      </DashboardCard>

      {/* === SHORTCUTS === */}
      <div className="grid sm:grid-cols-2 gap-6">
        <DashboardCard className="p-6 hover:border-sky-400/40 transition-all">
          <h3 className="font-semibold text-sky-400 mb-1">Learning Progress</h3>
          <p className="text-sm text-gray-400">
            Track your Starpaths, completed constellations, and Stardust rewards.
          </p>
          <button
            onClick={() => navigate("/learner/dashboard")}
            className="mt-4 text-xs text-sky-400 hover:underline"
          >
            → Go to dashboard
          </button>
        </DashboardCard>

        <DashboardCard className="p-6 hover:border-orange-400/40 transition-all">
          <h3 className="font-semibold text-orange-400 mb-1">Creator Mode</h3>
          <p className="text-sm text-gray-400">
            Join the Altaïr Creator Community and start designing your own labs and starpaths.
          </p>
          <button
            onClick={() => navigate("/learner/settings#creator")}
            className="mt-4 text-xs text-orange-400 hover:underline"
          >
            → Become a creator
          </button>
        </DashboardCard>
      </div>
    </div>
  );
}
