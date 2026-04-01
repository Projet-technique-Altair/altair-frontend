// src/components/HeroSection.tsx

/*
 * @file HeroSection
 *
 * Final polished hero — spatial, clean, premium.
 */

import { useAuth } from "@/context/useAuth";
import logoImg from "@/assets/logo.png";
import { smoothScrollTo } from "./utils/smoothScroll";

export default function HeroSection() {
  const { loginSSO } = useAuth();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* 🌌 RADIAL FOCUS */}
      <div
        className="pointer-events-none absolute inset-0 
        bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,rgba(7,11,24,0.85)_70%)]"
      />

      {/* CONTENT */}
      <div className="relative z-10 mx-auto max-w-4xl px-8 text-center">

        {/* LOGO */}
        <img
          src={logoImg}
          alt="Altaïr logo"
          className="
            mx-auto mb-10 h-28 w-28 rounded-full
            ring-1 ring-white/10
            opacity-90
            shadow-[0_0_40px_rgba(122,44,243,0.4)]
          "
        />

        {/* TITLE */}
        <h1
          className="
          text-4xl md:text-6xl font-semibold leading-tight tracking-tight
          text-white
          drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]
        "
        >
          Master cybersecurity
          <br />
          <span
            className="
            text-transparent bg-clip-text
            bg-gradient-to-r from-sky-400 via-violet-400 to-orange-300
          "
          >
            by doing, not watching.
          </span>
        </h1>

        {/* SUBTEXT */}
        <p className="mx-auto mt-6 max-w-xl text-lg text-slate-300">
          Train on real scenarios. Progress step by step. Build skills that matter.
        </p>

        {/* CTA (FIXED) */}
        <div className="relative mt-12 inline-block">

          {/* halo subtil (neutral) */}
          <div className="absolute inset-0 blur-2xl bg-white/5 rounded-full" />

          <button
            onClick={loginSSO}
            className="
              relative
              rounded-full px-14 py-4 text-lg font-semibold

              text-white

              bg-white/[0.06]
              border border-white/15
              backdrop-blur-xl

              shadow-[0_0_25px_rgba(255,255,255,0.05)]
              hover:shadow-[0_0_40px_rgba(255,255,255,0.12)]

              hover:bg-white/[0.10]
              hover:border-white/25

              transition-all duration-300
              hover:scale-[1.04]
              active:scale-[0.97]
            "
          >
            Start my journey
          </button>
        </div>

        {/* TRUST */}
        <p className="mt-4 text-xs text-slate-500">
          Secure authentication via SSO · No passwords stored
        </p>

        {/* SCROLL */}
        <div className="mt-20 flex flex-col items-center gap-3">

          <button
            onClick={() => {
              const el = document.querySelector("#explorer");
              if (!el) return;
              const y = el.getBoundingClientRect().top + window.scrollY - 40;
              smoothScrollTo(y, 1400);
            }}
            className="
              text-base font-medium tracking-wide text-violet-300
              hover:text-violet-200 transition
            "
          >
            Explore the journey
          </button>

          <span className="text-violet-400 text-xl animate-bounce">
            ↓
          </span>
        </div>

      </div>

      {/* FADE */}
      <div className="pointer-events-none absolute bottom-0 left-0 w-full h-40 
        bg-gradient-to-b from-transparent to-[#070B18]" 
      />
    </section>
  );
}