/*
 * @file StarpathSection
 *
 * Starpaths — pedagogical differentiator (no technical description).
 * Unique style:
 * - Exhibit layout: big map preview (left) + legend column (right)
 * - Typography: mono labels + uppercase tracking header
 * - BG filter: observatory spotlight + vignette (no flat opacity veil)
 */

import starpathView from "@/assets/starpath-view.png";

type PrincipleProps = {
  index: string;
  title: string;
  description: string;
};

export default function StarpathSection() {
  return (
    <section id="starpaths" className="relative overflow-hidden px-8 py-28">
      {/* BG filter: spotlight (focus on map) + gentle vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0
                   bg-[radial-gradient(70%_55%_at_60%_45%,rgba(56,189,248,0.14)_0%,rgba(7,11,24,0.00)_60%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0
                   bg-[radial-gradient(ellipse_at_center,rgba(7,11,24,0.18)_0%,rgba(7,11,24,0.68)_62%,rgba(7,11,24,0.88)_100%)]"
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header (different vibe: mono label + uppercase tracking) */}
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-slate-400/90">
            Starpaths
          </p>

          <h2 className="mt-4 text-3xl font-semibold uppercase tracking-[0.06em] text-white md:text-4xl">
            A progression designed for mastery.
          </h2>

          <p className="mt-5 text-base leading-relaxed text-slate-300">
            Not a simple collection of exercises: a path that clarifies
            prerequisites, guides the method without spoiling, and strengthens
            skills through reuse in different contexts.
          </p>
        </div>

        {/* Exhibit layout: map + legend */}
        <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-[1.35fr_0.65fr] md:items-start">
          {/* Left: map preview (dominant) */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              {/* subtle sheen */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent"
              />

              <img
                src={starpathView}
                alt="Starpath preview: learning path"
                className="relative z-10 h-[360px] w-full object-contain bg-[#070B18]/35 md:h-[500px]"
                loading="lazy"
              />
            </div>

            {/* Small caption (editorial, not like Labs caption bar) */}
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.35em] text-slate-400/80">
              Path preview
            </p>
          </div>

          {/* Right: legend column (distinct from cards/callouts) */}
          <aside className="rounded-2xl border border-white/10 bg-[#070B18]/30 p-6 backdrop-blur-[2px]">
            <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-slate-400/90">
              Pedagogical legend
            </p>

            <div className="mt-6 space-y-6">
              <Principle
                index="01"
                title="Explicit prerequisites"
                description="Each step reinforces a precise foundation before opening the next one."
              />
              <Principle
                index="02"
                title="Guidance without spoilers"
                description="Hints that steer your reasoning without giving the answer."
              />
              <Principle
                index="03"
                title="Transferable skills"
                description="You train reusable reflexes, not an isolated exercise."
              />
            </div>

            {/* A calm finishing line (soft showcase) */}
            <p className="mt-8 text-sm leading-relaxed text-slate-300/80">
              The goal: progress with confidence, without learning at random.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Principle({ index, title, description }: PrincipleProps) {
  return (
    <div className="border-l border-white/10 pl-4">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-slate-400/90">
          {index}
        </span>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-300/85">
        {description}
      </p>
    </div>
  );
}
