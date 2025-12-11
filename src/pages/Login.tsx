/**
 * @file Login — authentication entry page for both learners and creators.
 *
 * @remarks
 * This page handles the initial authentication flow of Altaïr:
 *
 *  - Users enter their **username or email** and password (mocked for now)
 *  - Depending on the username, they are routed to either:
 *      - `/learner/dashboard`
 *      - `/creator/dashboard`
 *  - A secondary “Continue with SSO” mock option is also available
 *
 * Styling uses Altaïr’s brand gradients (blue → purple → orange),
 * with a blurred space-themed banner background and logo.
 *
 * Route: `/login`
 *
 * @packageDocumentation
 */


import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import bgImg from "@/assets/banniere.png";
import logoImg from "@/assets/logo.png";
import titreImg from "@/assets/titre.png";

/**
 * Login screen with username input, mock password, and optional SSO flow.
 *
 * @remarks
 * - Automatically determines role (`learner` or `creator`) based on username.
 * - Uses `useAuth` to perform contextual login and set user role.
 * - Visuals combine gradient accents and blurred nebula background.
 *
 * @example
 * ```tsx
 * <Route path="/login" element={<Login />} />
 * ```
 *
 * @returns JSX layout for the Altaïr login screen.
 *
 * @public
 */
export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    const u = username.trim().toLowerCase();
    if (!u) {
      setError("Please enter your username.");
      return;
    }

    setError(null);
    const role = u === "creator" ? "creator" : "learner";
    login({ username: role === "creator" ? "creator" : "learner01", role });
    navigate(`/${role}/dashboard`);
  };

  const handleSSO = () => {
    if (!username.trim()) {
      setError("Please enter your username.");
      return;
    }
    login({ username, role: "learner" });
    navigate("/learner/dashboard");
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
      {/* === Overlayer === */}
      <div className="absolute inset-0 bg-[#0B0D1A]/80 backdrop-blur-[2px]" />

      {/* === Header (Titre image) === */}
      <header
        className="relative z-10 flex w-full items-end justify-center"
        style={{ height: "clamp(110px, 18vh, 180px)" }}
      >
        <img
          src={titreImg}
          alt="Altaïr"
          className="max-h-full max-w-[820px] select-none object-contain drop-shadow-[0_0_22px_rgba(122,44,243,0.35)]"
        />
      </header>

      {/* === Main Grid === */}
      <main className="relative z-10 mx-auto grid h-[calc(100vh-180px)] max-w-[1440px] grid-cols-12 items-center gap-10 px-8">
        {/* === Logo & tagline === */}
        <div className="col-span-6 flex flex-col items-center justify-center text-center">
          <img
            src={logoImg}
            alt="Altaïr logo"
            className="select-none rounded-full shadow-[0_0_35px_rgba(122,44,243,0.4)] ring-1 ring-white/10 transition-transform duration-500 hover:scale-[1.03]"
            style={{
              height: "clamp(210px, 28vh, 260px)",
              width: "clamp(210px, 28vh, 260px)",
            }}
          />
          <p className="mt-3 text-[20px] font-medium tracking-tight text-slate-200">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#2AA7FF] via-[#7A2CF3] to-[#FF8C4A]">
              Learning at the speed of light.
            </span>
          </p>
        </div>

        {/* === Login Form === */}
        <div className="col-span-6 flex items-center justify-center">
          <form
            onSubmit={handleLogin}
            className="w-[540px] space-y-6 bg-transparent"
          >
            {/* Username */}
            <label className="block">
              <span className="mb-1.5 block text-[15px] text-slate-200">
                Email or username
              </span>
              <input
                type="text"
                placeholder="learner  or  creator"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={[
                  "w-full rounded-full px-4 py-3 text-[15px] text-white outline-none transition-all duration-200",
                  "bg-[#121628]/80 border border-white/10 placeholder:text-slate-400",
                  error
                    ? "ring-2 ring-red-500/60 border-red-500/30"
                    : "focus:ring-2 focus:ring-[#7A2CF3]/60",
                ].join(" ")}
                aria-invalid={!!error}
                aria-describedby={error ? "username-error" : undefined}
              />
              {error && (
                <span
                  id="username-error"
                  className="mt-2 block text-[12px] text-red-400"
                >
                  {error}
                </span>
              )}
            </label>

            {/* Password */}
            <label className="block">
              <span className="mb-1.5 block text-[15px] text-slate-200">
                Password
              </span>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-full border border-white/10 bg-[#121628]/80 px-4 py-3 text-[15px] text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#7A2CF3]/60"
              />
            </label>

            {/* Sign in */}
            <button
              type="submit"
              disabled={!username.trim()}
              className={[
                "w-full rounded-full px-6 py-3 text-[16px] font-semibold text-white transition active:scale-[0.99]",
                "bg-gradient-to-r from-[#2AA7FF] via-[#7A2CF3] to-[#FF8C4A]",
                "shadow-[0_10px_28px_rgba(122,44,243,0.45)] hover:shadow-[0_14px_38px_rgba(122,44,243,0.56)]",
                !username.trim() ? "opacity-60 cursor-not-allowed" : "",
              ].join(" ")}
            >
              Sign in
            </button>

            {/* Divider */}
            <div className="relative my-4" role="separator">
              <div className="h-px w-full bg-white/10" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0B0D1A] px-2 text-[11px] text-slate-300">
                or
              </span>
            </div>

            {/* SSO */}
            <button
              type="button"
              onClick={handleSSO}
              className="h-11 w-full rounded-full border border-white/10 bg-white/[0.07] px-6 text-[15px] font-medium text-slate-100 transition-all hover:bg-white/[0.12] focus:ring-2 focus:ring-[#2AA7FF]/50"
            >
              Continue with SSO
            </button>

            {/* Links */}
            <div className="mt-3 flex flex-col items-center text-[13px]">
              <div className="flex w-full justify-between mb-3">
                <a className="text-slate-300 hover:text-white" href="#">
                  Forgot password?
                </a>
                <a className="text-slate-300 hover:text-white" href="#">
                  Privacy & Terms
                </a>
              </div>

              <button
                type="button"
                onClick={() => navigate("/register")}
                className="mt-2 text-[15px] font-semibold bg-gradient-to-r from-[#2AA7FF] via-[#7A2CF3] to-[#FF8C4A] bg-clip-text text-transparent hover:scale-[1.07] transition-transform duration-200 ease-out drop-shadow-[0_0_8px_rgba(122,44,243,0.6)]"
              >
                New here?
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
