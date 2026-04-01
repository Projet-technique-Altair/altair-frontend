/*
 * @file StarpathSection
 *
 * DISTINCT VERSION:
 * - Horizontal flow (NOT cards)
 * - Narrative progression
 * - Strong differentiation vs Labs
 */

import starpathView from "@/assets/starpath-view.png";

export default function StarpathSection() {
  return (
    <section id="starpaths" className="relative isolate overflow-hidden px-8 py-32">

      {/* TRANSITIONS */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#070B18] to-transparent" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#070B18] to-transparent" />

      <div className="relative z-10 mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto">
          <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-slate-400/90">
            Starpaths
          </p>

          <h2 className="mt-4 text-3xl md:text-4xl font-semibold text-white">
            A progression designed for mastery.
          </h2>

          <p className="mt-5 text-slate-300">
            Not a collection — a structured path that builds real expertise.
          </p>
        </div>

        {/* ===== FLOW LINE ===== */}
        <div className="relative mt-24">

          {/* LINE */}
          <div className="
            pointer-events-none absolute left-0 right-0 top-6
            h-px bg-gradient-to-r from-transparent via-white/15 to-transparent
          " />

          {/* NODES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 items-start text-center">

            {/* NODE 1 */}
            <div>
              <Node color="sky" />

              <h3 className="mt-6 text-lg font-semibold text-white">
                Explicit prerequisites
              </h3>

              <p className="mt-3 text-sm text-slate-400">
                Each step builds a solid foundation before unlocking the next.
              </p>
            </div>

            {/* NODE 2 (IMAGE CORE) */}
            <div className="relative">

              <Node color="violet" active />

              <div className="
                mt-6
                rounded-2xl
                border border-white/10
                bg-white/[0.04]
                backdrop-blur-md
                shadow-[0_40px_120px_rgba(0,0,0,0.7)]
                overflow-hidden
              ">
                <img
                  src={starpathView}
                  alt="Starpath preview"
                  className="h-[220px] w-full object-contain"
                />
              </div>

              <p className="mt-4 text-sm text-slate-400">
                A clear visual path — no guessing, no chaos.
              </p>
            </div>

            {/* NODE 3 */}
            <div>
              <Node color="orange" />

              <h3 className="mt-6 text-lg font-semibold text-white">
                Transferable skills
              </h3>

              <p className="mt-3 text-sm text-slate-400">
                You build reusable reflexes, not isolated knowledge.
              </p>
            </div>

          </div>

        </div>

        {/* FOOT */}
        <p className="mt-20 text-center text-sm text-slate-400 max-w-xl mx-auto">
          Progress with clarity and structure — never at random.
        </p>

      </div>
    </section>
  );
}

function Node({
  color,
  active,
}: {
  color: "sky" | "violet" | "orange";
  active?: boolean;
}) {

  const styles = {
    sky: "bg-sky-300 shadow-[0_0_14px_rgba(56,189,248,0.4)]",
    violet: "bg-violet-300 shadow-[0_0_20px_rgba(139,92,246,0.5)]",
    orange: "bg-orange-300 shadow-[0_0_14px_rgba(251,146,60,0.4)]",
  };

  return (
    <div className="flex justify-center">
      <div className="
        relative flex h-12 w-12 items-center justify-center
      ">
        {/* halo */}
        {active && (
          <div className="absolute inset-0 rounded-full bg-violet-400/20 blur-xl" />
        )}

        {/* dot */}
        <div className={`h-3 w-3 rounded-full ${styles[color]}`} />
      </div>
    </div>
  );
}