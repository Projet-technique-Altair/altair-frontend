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
import { request } from "@/api/client";
import { useAuth } from "@/context/useAuth";
import { useEffect } from "react";


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
  const [username, setUsername] = useState("guest");
  const [language, setLanguage] = useState("en");

  const { logout } = useAuth();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await request<{
          pseudo: string;
          email: string;
        }>("/users/me");

        setUsername(user.pseudo || "");
        setEmail(user.email || "");

      } catch (e) {
        console.error("Failed to load user", e);
      }
    };

    loadUser();
  }, []);

  const handleSave = async () => {
    if (username && username.length < 3) {
      alert("Username too short");
      return;
    }
    try {
      await request("/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          ...(email && { email: email }),
        }),
      });

      alert("Profile updated");

    } catch (e) {
      console.error(e);
      alert("Failed to update profile");
    }
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
          Update your personal information and security settings.
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
            disabled
            className="bg-[#1A1F2E] border border-white/10 rounded-lg px-4 py-2 w-full opacity-50 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            Username cannot be changed.
          </p>
        </div>

        {/* === MAIL === */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        <div className="space-y-3 pt-4 border-t border-white/10">
        <h3 className="text-sm text-gray-300">Security</h3>

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-[#1A1F2E] border border-white/10 rounded-lg px-4 py-2 w-full"
        />

        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="bg-[#1A1F2E] border border-white/10 rounded-lg px-4 py-2 w-full"
        />

        <button
          onClick={async () => {
            if (password !== confirmPassword) {
              alert("Passwords do not match");
              return;
            }

            try {
              await request("/users/me/password", {
                method: "POST",
                body: JSON.stringify({ new_password: password }),
              });

              alert("Password updated");
              setPassword("");
              setConfirmPassword("");

              logout(); // refresh token

            } catch (e) {
              console.error(e);
              alert("Failed to update password");
            }
          }}
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500"
        >
          Update password
        </button>
      </div>
      </DashboardCard>

    </div>
  );
}
