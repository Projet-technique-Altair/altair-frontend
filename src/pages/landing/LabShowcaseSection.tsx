/*
 * @file LabShowcaseSection
 *
 * Labs showcase — soft showcase (text + image side-by-side).
 * Unique vs Hero/Explorer:
 * - Split layout (left aligned, not centered)
 * - 2 stacked cards (Terminal / Web)
 * - Right-side "porthole" image (visual proof), no CTA / link
 */

type LabCardProps = {
  label: string;
  title: string;
  description: string;
  accent?: "sky" | "violet";
};

export default function LabShowcaseSection() {
  return (
    <section id="labs" className="relative overflow-hidden px-8 py-28">
      {/* Labs BG filter: glass bands + subtle vertical fade (unique) */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* Bands */}
        <div className="absolute left-0 right-0 top-20 h-28 bg-white/6 backdrop-blur-[2px]" />
        <div className="absolute left-0 right-0 top-60 h-44 bg-white/4 backdrop-blur-[2px]" />
        <div className="absolute left-0 right-0 bottom-24 h-28 bg-white/5 backdrop-blur-[2px]" />

        {/* Fade to keep readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#070B18]/35 via-transparent to-[#070B18]/70" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16">
        {/* ===== Left: copy ===== */}
        <div className="text-left">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400/90">
            Guided labs
          </p>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Guided labs, in real conditions.
          </h2>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300">
            Altaïr lets you practice on concrete environments, with a clear
            progression — without ready-made recipes.
          </p>

          <div className="mt-10 grid gap-5">
            <LabCard
              accent="sky"
              label="Available"
              title="Terminal Lab — guided"
              description="Diagnosis, commands, frequent mistakes. You move forward step by step, staying in control."
            />

            <LabCard
              accent="violet"
              label="Available"
              title="Web Lab — guided"
              description="Explore an application, test properly, understand what’s happening — and validate your result."
            />
          </div>

          <p className="mt-10 max-w-xl text-sm leading-relaxed text-slate-400/90">
            The catalog grows progressively, without sacrificing the quality of
            guidance.
          </p>
        </div>

        {/* ===== Right: image (porthole) ===== */}
        <div className="relative">
          {/* Frame / porthole */}
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
            {/* Subtle halo behind the image */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-24 bg-gradient-to-br from-sky-400/10 via-violet-400/10 to-transparent"
            />

            {/* Replace src with your lab image */}
            <img
              src="/assets/lab-preview.png"
              alt="Preview of a lab in progress on Altaïr"
              className="relative z-10 h-[320px] w-full object-cover md:h-[420px]"
              loading="lazy"
            />

            {/* Subtle caption */}
            <div className="relative z-10 border-t border-white/10 bg-[#070B18]/40 px-5 py-4">
              <p className="text-xs text-slate-300/80">
                Excerpt from a guided lab — clear progression, concrete goal.
              </p>
            </div>
          </div>

          {/* Very subtle decorative details (unique, not constellation) */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 -top-10 hidden h-40 w-40 rounded-full bg-violet-400/10 blur-3xl md:block"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-10 -bottom-10 hidden h-44 w-44 rounded-full bg-sky-400/10 blur-3xl md:block"
          />
        </div>
      </div>
    </section>
  );
}

function LabCard({ label, title, description, accent = "sky" }: LabCardProps) {
  const ring = accent === "violet" ? "ring-violet-400/20" : "ring-sky-400/20";

  const badge =
    accent === "violet"
      ? "bg-violet-400/10 text-violet-200/90 border-violet-400/20"
      : "bg-sky-400/10 text-sky-200/90 border-sky-400/20";

  const dot = accent === "violet" ? "bg-violet-300" : "bg-sky-300";

  const line =
    accent === "violet"
      ? "from-violet-400/35 via-violet-400/15 to-transparent"
      : "from-sky-400/35 via-sky-400/15 to-transparent";

  return (
    <div className={`rounded-2xl bg-white/5 p-6 ring-1 ${ring}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="inline-flex items-center gap-3">
          <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden />
          <span className="text-sm font-semibold text-white">{title}</span>
        </div>

        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-[11px] uppercase tracking-widest ${badge}`}
        >
          {label}
        </span>
      </div>

      <div className={`mt-4 h-px w-full bg-gradient-to-r ${line}`} />

      <p className="mt-4 text-sm leading-relaxed text-slate-300/90">
        {description}
      </p>
    </div>
  );
}
