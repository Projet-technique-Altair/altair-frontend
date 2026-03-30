/*
 * ExplorerSection — SPLIT LAYOUT VERSION
 * - texte gauche
 * - image 3D droite (inchangé)
 * - FIX: texte au-dessus de l’image
 */

import learnerDashboard from "@/assets/learner-dashboard.png";

export default function ExplorerSection() {
  return (
    
    <section id="explorer" className="relative overflow-hidden px-8 py-30">
      <div className="pointer-events-none absolute top-0 left-0 w-full h-24 
  bg-gradient-to-b from-[#070B18] to-transparent" 
/>

      {/* Background ambiance */}
      <div className="pointer-events-none absolute inset-0 bg-[#070B18]/90" />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at top left, rgba(56,189,248,0.12), transparent 55%), radial-gradient(ellipse at bottom right, rgba(139,92,246,0.15), transparent 60%)",
        }}
      />

      {/* CONTENT */}
      <div className="relative z-10 mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

        {/* 🧠 LEFT — TEXT (AU-DESSUS) */}
        <div className="relative z-20 max-w-xl">

          <h2 className="text-4xl md:text-5xl font-semibold text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            Explorer
          </h2>

          <p className="mt-4 text-xs uppercase tracking-[0.35em] text-violet-300/90">
            Get hands-on with the real world
          </p>

          <div className="mt-6 h-px w-40 bg-gradient-to-r from-violet-400/40 to-transparent" />

          <div className="mt-10 text-slate-300 text-lg leading-relaxed space-y-4">
            <p>Altaïr immerses you in real technical environments.</p>

            <p className="text-slate-300/90">
              No abstract simulations,
              <br />
              no magic recipes —
            </p>

            <p>
              you <span className="text-white">explore</span>, you{" "}
              <span className="text-white">experiment</span>, you{" "}
              <span className="text-white">understand</span>.
            </p>
          </div>

        </div>

        {/* 🚀 RIGHT — IMAGE 3D (EN-DESSOUS) */}
        <div className="flex justify-center md:justify-end relative z-0">
          <div className="relative perspective-[1600px]">

            {/* Glow */}
            <div className="absolute -inset-12 bg-gradient-to-r from-sky-400/20 via-purple-400/20 to-orange-300/20 blur-2xl opacity-60" />

            <img
              src={learnerDashboard}
              alt="Dashboard preview"
              className="
                relative
                w-[1100px] max-w-none

                rounded-2xl
                border border-white/10

                shadow-[0_80px_220px_rgba(0,0,0,0.9)]

                transform
                rotate-x-[-15deg]
                rotate-y-[-35deg]
                rotate-z-[-1deg]
                scale-[0.95]

                hover:scale-[1.02]
                hover:-translate-y-2

                transition-all duration-700 ease-out
              "
            />
          </div>
        </div>

      </div>
    </section>
  );
}