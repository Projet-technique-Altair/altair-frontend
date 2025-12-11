/**
 * @file Register.tsx — user registration page.
 *
 * @remarks
 * This page allows users to create a new account in the Altaïr platform.
 * It supports both learner and creator roles, automatically logging in
 * the user after registration and redirecting them to their respective dashboard.
 *
 * Includes:
 *  - Basic registration form (username, email, password, role)
 *  - Immediate login simulation via `AuthContext`
 *  - Gradient-styled responsive UI consistent with the Login page
 *
 * @packageDocumentation
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
// === ASSETS ===
import bgImg from "@/assets/banniere.png";
import logoImg from "@/assets/logo.png";
import titreImg from "@/assets/titre.png";


/**
 * User registration component.
 *
 * @returns The registration form layout and logic.
 *
 * @example
 * ```tsx
 * import Register from "@/pages/Register";
 *
 * export default function App() {
 *   return <Register />;
 * }
 * ```
 */
export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // === LOCAL STATE ===
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "learner",
  });

   /**
   * Handles updates to all form fields.
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /**
   * Handles registration submission.
   *
   * @remarks
   * For demonstration purposes, this function directly triggers the `login`
   * method from the Auth context and redirects to the dashboard
   * without performing backend validation.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Development mode: allow creating even with empty fields.
    const username = form.username.trim() || "guest";
    const role = form.role as "learner" | "creator";

    // Simulate account creation and login.
    login({ username, role });

    // Redirect according to selected role.
    if (role === "creator") {
      navigate("/creator/dashboard");
    } else {
      navigate("/learner/dashboard");
    }
  };

  return (
    <div
      className="relative h-screen overflow-hidden text-white"
      style={{
        backgroundImage: `url(${bgImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-[#0B0D1A]/85" />

      {/* HEADER */}
      <header
        className="relative z-10 flex w-full items-end justify-center"
        style={{ height: "clamp(110px, 18vh, 180px)" }}
      >
        <img
          src={titreImg}
          alt="Altair"
          className="max-h-full max-w-[820px] select-none object-contain drop-shadow-[0_0_22px_rgba(122,44,243,0.35)]"
        />
      </header>

      {/* MAIN */}
      <main className="relative z-10 mx-auto grid h-[calc(100vh-180px)] max-w-[1440px] grid-cols-12 items-center gap-10 px-8">
        {/* LEFT PANEL */}
        <div className="col-span-6 flex flex-col items-center justify-center text-center">
          <img
            src={logoImg}
            alt="Altair logo"
            className="select-none rounded-full ring-1 ring-white/10 shadow-[0_0_28px_rgba(122,44,243,0.28)]"
            style={{
              height: "clamp(210px, 28vh, 260px)",
              width: "clamp(210px, 28vh, 260px)",
            }}
          />
          <p className="mt-2 text-[20px] font-medium text-slate-200 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#2AA7FF] via-[#7A2CF3] to-[#FF8C4A]">
              Begin your journey among the stars.
            </span>
          </p>
        </div>

        {/* RIGHT PANEL */}
        <div className="col-span-6 flex items-center justify-center">
          <form
            onSubmit={handleSubmit}
            className="w-[540px] space-y-6 text-slate-200"
          >
            {/* USERNAME */}
            <label className="block">
              <span className="mb-1.5 block text-[15px]">Username</span>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Choose a username"
                className="w-full rounded-full border border-white/10 bg-[#1A1D2A]/90 px-4 py-3 text-[15px] text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#6F41F3]/60"
              />
            </label>

            {/* EMAIL */}
            <label className="block">
              <span className="mb-1.5 block text-[15px]">Email</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Your email"
                className="w-full rounded-full border border-white/10 bg-[#1A1D2A]/90 px-4 py-3 text-[15px] text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#6F41F3]/60"
              />
            </label>

            {/* PASSWORD */}
            <label className="block">
              <span className="mb-1.5 block text-[15px]">Password</span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full rounded-full border border-white/10 bg-[#1A1D2A]/90 px-4 py-3 text-[15px] text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#6F41F3]/60"
              />
            </label>

            {/* ROLE SELECT */}
            <label className="block">
              <span className="mb-1.5 block text-[15px]">Start as</span>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full rounded-full border border-white/10 bg-[#1A1D2A]/90 px-4 py-3 text-[15px] text-slate-200 outline-none focus:ring-2 focus:ring-[#6F41F3]/60"
              >
                <option value="learner">Learner</option>
                <option value="creator">Creator</option>
              </select>
            </label>

            {/* SUBMIT */}
            <button
              type="submit"
              className="w-full rounded-full px-6 py-3 text-[16px] font-semibold text-white transition active:scale-[0.99]
                         bg-gradient-to-r from-[#2AA7FF] via-[#7A2CF3] to-[#FF8C4A]
                         shadow-[0_10px_28px_rgba(122,44,243,0.45)] hover:shadow-[0_14px_38px_rgba(122,44,243,0.56)]"
            >
              Create account
            </button>

            {/* BACK TO LOGIN */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-[15px] font-semibold bg-gradient-to-r from-[#2AA7FF] via-[#7A2CF3] to-[#FF8C4A] bg-clip-text text-transparent hover:scale-[1.07] transition-transform duration-200 ease-out drop-shadow-[0_0_8px_rgba(122,44,243,0.6)]"
              >
                Back to login
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
