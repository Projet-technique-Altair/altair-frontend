/*
 * @file LabShowcaseSection
 *
 * FINAL PRO+ VERSION:
 * - Improved visual density (no empty feeling)
 * - Subtle progression line + nodes
 * - Better hierarchy
 */

type LabCardProps = {
  index: string;
  title: string;
  description: string;
  accent?: "sky" | "violet" | "orange";
};

export default function LabShowcaseSection() {
  return (
    <section id="labs" className="relative isolate overflow-hidden px-8 py-32">

      {/* TOP TRANSITION */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#070B18] to-transparent" />

      {/* BOTTOM TRANSITION */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#070B18] to-transparent" />

      {/* CENTRAL FOCUS */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(7,11,24,0.4)_0%,transparent_60%)]" />

      <div className="relative z-10 mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400/90">
            Learning modes
          </p>

          <h2 className="mt-4 text-3xl md:text-4xl font-semibold text-white">
            Three ways to learn.
            <br />
            One way to progress.
          </h2>

          <p className="mt-5 text-slate-300">
            Start from scratch, train freely, or validate your skills.
          </p>
        </div>

        {/* WRAPPER */}
        <div className="
          relative mt-24
          bg-white/[0.04]
          backdrop-blur-md
          border border-white/10
          rounded-[2rem]
          px-6 py-16 md:px-12
          shadow-[0_40px_120px_rgba(0,0,0,0.6)]
        ">

          {/* INNER GLOW */}
          <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-b from-white/5 to-transparent" />

          {/* 🔗 PROGRESSION LINE */}
          <div className="pointer-events-none absolute left-0 right-0 top-[90px] hidden md:block">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          </div>

          {/* CARDS */}
          <div className="relative grid grid-cols-1 gap-14 md:grid-cols-3">

            <LabCard
              index="01"
              accent="sky"
              title="Guided Lab"
              description="Validate your skills under pressure. No hints. No shortcuts."
            />

            <LabCard
              index="02"
              accent="violet"
              title="Practice Lab"
              description="Train freely. Use hints if needed. Experiment and iterate."
              featured
            />

            <LabCard
              index="03"
              accent="orange"
              title="Course Lab"
              description="Discover new concepts step by step and build strong foundations."
            />

          </div>

        </div>

        {/* FOOT */}
        <p className="mt-16 text-center text-sm text-slate-400/90 max-w-xl mx-auto">
          The catalog evolves progressively — keeping depth and clarity at its core.
        </p>

      </div>
    </section>
  );
}

function LabCard({
  index,
  title,
  description,
  accent = "sky",
  featured,
}: LabCardProps & { featured?: boolean }) {

  const accentStyles = {
    sky: "bg-sky-300 shadow-[0_0_18px_rgba(56,189,248,0.4)]",
    violet: "bg-violet-300 shadow-[0_0_24px_rgba(139,92,246,0.5)]",
    orange: "bg-orange-300 shadow-[0_0_18px_rgba(251,146,60,0.4)]",
  };

  return (
    <div
      className={[
        "relative mx-auto max-w-sm text-center transition-all duration-300",
        featured ? "md:-translate-y-4 scale-[1.05]" : "opacity-90",
      ].join(" ")}
    >
      {/* NODE */}
      <div className="relative mx-auto mb-8 flex h-16 w-16 items-center justify-center">

        {/* halo */}
        {featured && (
          <div className="absolute inset-0 rounded-full bg-violet-400/20 blur-xl" />
        )}

        {/* dot */}
        <div className={`h-3 w-3 rounded-full ${accentStyles[accent]}`} />
      </div>

      {/* INDEX */}
      <div className="text-xs tracking-[0.25em] text-slate-400/90">
        {index}
      </div>

      {/* TITLE */}
      <h3 className="mt-2 text-lg font-semibold text-white">
        {title}
      </h3>

      {/* DESC */}
      <p className="mt-4 text-sm leading-relaxed text-slate-400">
        {description}
      </p>
    </div>
  );
}