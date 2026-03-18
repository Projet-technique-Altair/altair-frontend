/**
 * @file SettingsPage — account configuration and Creator Mode activation.
 *
 * @remarks
 * This page allows learners to:
 *  - Update their personal settings (username, preferred language)
 *  - Enable or access **Creator Mode**
 *
 * Once Creator Mode is activated, the user role changes to `"creator"`,
 * and they are redirected to the Creator Dashboard.
 *
 * The modal confirmation flow is handled by the `CreatorActivationModal` component.
 * Authentication and role switching are managed through the `AuthContext` hook.
 *
 * Route: `/learner/settings`
 *
 * @packageDocumentation
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardCard from "@/components/ui/DashboardCard";
import { ALT_COLORS } from "@/lib/theme";
import CreatorActivationModal from "@/components/user/CreatorActivationModal";


/**
 * Displays the **Account Settings** page where users can
 * edit personal preferences and activate Creator Mode.
 *
 * @remarks
 * - Connected to `AuthContext` for role and user info.
 * - Includes a modal confirmation before enabling creator privileges.
 * - Uses a clean two-section layout: general settings + creator mode.
 *
 * @example
 * ```tsx
 * <Route path="/learner/settings" element={<SettingsPage />} />
 * ```
 *
 * @returns The settings interface with user preferences and creator activation.
 *
 * @public
 */
export default function SettingsPage() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState("guest");
  const [language, setLanguage] = useState("en");
  const [creatorModeRequested, setCreatorModeRequested] = useState(false);

  const handleSave = () => {
    console.log("Settings updated:", { username, language });
  };

  const handleActivateCreator = () => {
    setShowModal(false);
    setCreatorModeRequested(true);

    // Redirect to creator space; backend remains the source of truth for access.
    navigate("/creator/dashboard");
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
          Account Settings
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          Update your personal information and activate Creator Mode.
        </p>
      </div>

      {/* === BASIC SETTINGS === */}
      <DashboardCard className="p-6 space-y-6">
        {/* === USERNAME === */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-[#1A1F2E] border border-white/10 rounded-lg px-4 py-2 w-full focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
          />
        </div>

        {/* === LANGUAGE === */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Preferred language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-[#1A1F2E] border border-white/10 rounded-lg px-4 py-2 w-full focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition"
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-sky-400 to-purple-500 hover:opacity-90 font-semibold text-white transition"
        >
          Save changes
        </button>
      </DashboardCard>

      {/* === CREATOR MODE === */}
      <DashboardCard
        className="p-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 border border-purple-400/10"
      >
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-purple-400 mb-1">
            Creator Mode
          </h2>
          {creatorModeRequested ? (
            <p className="text-sm text-green-400">
              Creator mode has been requested for this session.
            </p>
          ) : (
            <p className="text-sm text-gray-400">
              Become an Altaïr Creator to design your own labs, scenarios, and interactive starpaths.
            </p>
          )}
        </div>

        {creatorModeRequested ? (
          <button
            onClick={() => navigate("/creator/dashboard")}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-green-500 to-sky-400 hover:opacity-90 font-semibold text-white transition"
          >
            Go to Creator Dashboard
          </button>
        ) : (
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-orange-400 hover:opacity-90 font-semibold text-white transition"
          >
            Activate Creator Mode
          </button>
        )}
      </DashboardCard>

      {/* === CREATOR ACTIVATION MODAL === */}
      {showModal && (
        <CreatorActivationModal
          onClose={() => setShowModal(false)}
          onActivate={handleActivateCreator}
        />
      )}
    </div>
  );
}
