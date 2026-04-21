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

  const handlePasswordUpdate = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (!password) {
      alert("Please enter a new password");
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

      logout();
    } catch (e) {
      console.error(e);
      alert("Failed to update password");
    }
  };

  return (
    <div className="min-h-screen w-full px-6 py-10 text-white xl:px-10 2xl:px-14">
      <div className="mx-auto w-full max-w-[1280px]">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-white/45">
            Account
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white/92 sm:text-4xl">
            Settings
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/55">
            Update your email, review account preferences, and manage password
            security from one place.
          </p>
        </div>

        <div className="mt-6 h-px w-full bg-white/10" />

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-12">
          <section className="space-y-6 xl:col-span-7">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/45">
                    Profile
                  </div>
                  <h2 className="mt-2 text-xl font-semibold text-white/90">
                    Personal Information
                  </h2>
                  <p className="mt-2 text-sm text-white/55">
                    Keep your contact details up to date. Your username remains
                    fixed for account consistency.
                  </p>
                </div>

                <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] text-white/50">
                  Core account
                </div>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/75">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    disabled
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/45 outline-none opacity-80"
                  />
                  <p className="mt-2 text-xs text-white/40">
                    Username cannot be changed.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white/75">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/90 outline-none backdrop-blur-md transition placeholder:text-white/30 focus:border-white/20 focus:bg-white/[0.06]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white/75">
                    Preferred language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/90 outline-none backdrop-blur-md transition focus:border-white/20 focus:bg-white/[0.06]"
                  >
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                  </select>
                  <p className="mt-2 text-xs text-white/40">
                    Interface translations are not fully wired yet, but the
                    preference can already be prepared here.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleSave}
                  className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/15"
                  type="button"
                >
                  Save changes
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-red-400/20 bg-red-500/10 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-md">
              <div className="text-[11px] uppercase tracking-[0.22em] text-red-200/70">
                Danger zone
              </div>
              <h2 className="mt-2 text-xl font-semibold text-red-100">
                Supprimer le compte
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-red-100/75">
                Vous etes sur le point de supprimer definitivement votre compte.
                Cette action supprimera votre acces, votre progression et vos
                parametres personnels.
              </p>

              <div className="mt-5 rounded-2xl border border-red-400/20 bg-black/20 px-4 py-4 text-sm text-red-100/70">
                Cette action n&apos;est pas encore connectee au backend. On peut
                brancher un vrai flux de confirmation des que l&apos;endpoint de
                suppression est disponible.
              </div>

              <div className="mt-6">
                <button
                  className="w-full rounded-2xl border border-red-400/30 bg-red-500/14 px-5 py-3 text-sm font-semibold text-red-100/80 transition hover:border-red-400/40 hover:bg-red-500/18 disabled:cursor-not-allowed disabled:opacity-70"
                  type="button"
                  disabled
                >
                  Supprimer mon compte
                </button>
              </div>
            </div>
          </section>

          <aside className="space-y-6 xl:col-span-5">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/45">
                Security
              </div>
              <h2 className="mt-2 text-xl font-semibold text-white/90">
                Password
              </h2>
              <p className="mt-2 text-sm text-white/55">
                Choose a new password for your account. After the update, you
                will be signed out so your session can refresh securely.
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/75">
                    New password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter a new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/90 outline-none backdrop-blur-md transition placeholder:text-white/30 focus:border-white/20 focus:bg-white/[0.06]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white/75">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    placeholder="Repeat the new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/90 outline-none backdrop-blur-md transition placeholder:text-white/30 focus:border-white/20 focus:bg-white/[0.06]"
                  />
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white/55">
                Password changes require a fresh login after confirmation.
              </div>

              <div className="mt-6">
                <button
                  onClick={handlePasswordUpdate}
                  className="w-full rounded-2xl border border-red-400/20 bg-red-500/12 px-5 py-3 text-sm font-semibold text-red-100 transition hover:border-red-400/30 hover:bg-red-500/18"
                  type="button"
                >
                  Update password
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/15 p-6 backdrop-blur-sm">
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/45">
                Status
              </div>
              <div className="mt-3 space-y-3 text-sm text-white/60">
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <span>Username</span>
                  <span className="font-medium text-white/82">{username || "guest"}</span>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <span>Email</span>
                  <span className="truncate font-medium text-white/82">
                    {email || "No email set"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <span>Language</span>
                  <span className="font-medium text-white/82">
                    {language === "fr" ? "Français" : "English"}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
