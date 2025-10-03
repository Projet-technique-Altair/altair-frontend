import { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import bgImg from "../assets/banniere.png";
import logoImg from "../assets/logo.png";
import titleImg from "../assets/banniere-with-bg.png";
import CurtainOverlay from "../components/CurtainOverlay";

export default function Login() {
  const navigate = useNavigate();
  const onSubmit = (e: FormEvent) => { e.preventDefault(); navigate("/"); };

  return (
    <div
      className="min-h-screen relative flex items-center justify-center text-white bg-[#0B0D1A]"
      style={{ backgroundImage: `url(${bgImg})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      {/* Transition curtain (si on vient du splash) */}
      <CurtainOverlay delayMs={250} fadeMs={950} />

      <div className="absolute inset-0 bg-[#0B0D1A]/85 backdrop-blur-[1px]" />

      <motion.div
        className="relative z-10 w-full max-w-md mx-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
      >
        <div className="flex flex-col items-center mb-6">
          <img src={logoImg} alt="Altair" className="h-16 w-16 rounded-full ring-1 ring-white/10 shadow-[0_0_30px_rgba(122,44,243,0.35)]" />
          <img src={titleImg} alt="Altair" className="mt-3 h-10 object-contain" />
          <p className="mt-2 text-sm text-slate-300 text-center">Ephemeral, secure labs. No setup required.</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#151829]/90 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <form onSubmit={onSubmit} className="p-6 md:p-7">
            <div className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm text-slate-300">Email or username</span>
                <input type="text" placeholder="student01" className="w-full rounded-lg bg-[#1F2230] border border-white/10 px-3 py-2 text-white placeholder:text-slate-400 outline-none focus:border-transparent focus:ring-2 focus:ring-[#2AA7FF]/50" />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm text-slate-300">Password</span>
                <input type="password" placeholder="••••••••" className="w-full rounded-lg bg-[#1F2230] border border-white/10 px-3 py-2 text-white placeholder:text-slate-400 outline-none focus:border-transparent focus:ring-2 focus:ring-[#7A2CF3]/50" />
                <span className="mt-1 block text-[11px] text-slate-400">Do not reuse your school password on other sites.</span>
              </label>

              <button type="submit" className="mt-2 w-full rounded-lg px-4 py-2.5 font-medium text-white bg-gradient-to-r from-[#2AA7FF] via-[#7A2CF3] to-[#FF7A45] shadow-[0_8px_30px_rgba(122,44,243,0.35)] transition hover:shadow-[0_12px_40px_rgba(122,44,243,0.5)]">
                Sign in
              </button>

              <div className="relative my-2">
                <div className="h-px w-full bg-white/10" />
                <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-[#151829] px-3 text-xs text-slate-300">or</span>
              </div>

              <button type="button" onClick={() => navigate("/")} className="w-full rounded-lg px-4 py-2.5 text-sm font-medium border border-white/15 text-slate-200 hover:bg-white/5">
                Continue with SSO
              </button>

              <div className="mt-2 flex items-center justify-between text-sm">
                <a className="text-slate-300 hover:text-white" href="#">Forgot your password?</a>
                <a className="text-slate-300 hover:text-white" href="#">Privacy & Terms</a>
              </div>
            </div>
          </form>
        </div>

        <div className="mt-3 text-center text-sm text-slate-300">
          Don’t have an account?{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#2AA7FF] via-[#7A2CF3] to-[#FF7A45]">Sign up (coming soon)</span>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">© 2025 Altair. All rights reserved.</p>
      </motion.div>
    </div>
  );
}
