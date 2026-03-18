/*
 * @file HeroSection
 *
 * Main hero section for Altaïr landing page.
 * Global background is managed by Landing.tsx (scroll gradient).
 */

import { useAuth } from "@/context/useAuth";
import logoImg from "@/assets/logo.png";
import { smoothScrollTo } from "./utils/smoothScroll";

export default function HeroSection() {
  const { loginSSO } = useAuth();

  return (
    <section className="relative min-h-screen flex items-center justify-center">
      <div className="relative z-10 mx-auto max-w-4xl px-8 text-center">
        <img
          src={logoImg}
          alt="Altaïr logo"
          className="mx-auto mb-12 h-36 w-36 rounded-full
                     ring-1 ring-white/10
                     shadow-[0_0_48px_rgba(122,44,243,0.45)]"
        />

        <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
          A unique journey to master
          <br />
          cybersecurity.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
          Explore real environments, experiment safely, and turn
          your skills into concrete expertise.
        </p>

        <button
          onClick={loginSSO}
          className="mt-12 rounded-full px-14 py-4 text-lg font-semibold
                     bg-gradient-to-r from-[#2AA7FF] via-[#7A2CF3] to-[#FF8C4A]
                     shadow-[0_12px_32px_rgba(122,44,243,0.5)]
                     hover:shadow-[0_16px_44px_rgba(122,44,243,0.65)]
                     transition-transform duration-300
                     hover:scale-[1.03]
                     active:scale-[0.98]"
        >
          Start my journey
        </button>

        <p className="mt-4 text-sm text-slate-400">
          Secure authentication via SSO · No passwords stored
        </p>

        <div className="mt-20 flex flex-col items-center gap-3">
          <button
            onClick={() => {
              const el = document.querySelector("#explorer");
              if (!el) return;
              const y = el.getBoundingClientRect().top + window.scrollY - 40;
              smoothScrollTo(y, 1400);
            }}
            className="text-base font-medium tracking-wide text-violet-300
                       hover:text-violet-200 transition"
          >
            Explore the journey
          </button>

          <span className="text-violet-400 text-xl animate-bounce">↓</span>
        </div>
      </div>
    </section>
  );
}
