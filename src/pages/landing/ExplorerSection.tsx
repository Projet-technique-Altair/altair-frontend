/*
 * @file ExplorerSection
 *
 * Explorer section — presentation of Altaïr philosophy.
 *
 * Concept: "Guided constellation"
 * - 3 pillars = 3 stars connected (thin line, subtle gradient)
 * - Ultra-thin side rails (structure + premium UI feel)
 * - Narratively segmented central text (rhythm, breathing room)
 *
 * NOTE: Add a veil (opacity) via overlay to let a future background show through
 * (e.g., learner dashboard) without making the text unreadable.
 */

export default function ExplorerSection() {
  return (
    <section id="explorer" className="relative overflow-hidden px-8 py-32">
      {/* Veil / overlay (does not affect content opacity) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[#070B18]/65 backdrop-blur-[1px]"
      />

      {/* Side rails (above the veil) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-6 z-10 hidden w-px bg-gradient-to-b from-transparent via-violet-400/25 to-transparent md:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-6 z-10 hidden w-px bg-gradient-to-b from-transparent via-sky-400/20 to-transparent md:block"
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header (slightly more “manifesto”) */}
        <div className="text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Explorer
          </h2>

          <p className="mt-3 text-xs uppercase tracking-[0.35em] text-violet-300/90">
            Get hands-on with the real world
          </p>

          {/* Accent line under the slogan */}
          <div className="mx-auto mt-6 h-px w-40 bg-gradient-to-r from-transparent via-violet-400/35 to-transparent" />

          {/* Segmented description (rhythm) */}
          <div className="mx-auto mt-10 max-w-3xl text-base leading-relaxed text-slate-300 md:text-lg">
            <p>Altaïr immerses you in real technical environments.</p>

            <p className="mt-4 text-slate-300/95">
              No abstract simulations,
              <br className="hidden md:block" />
              no magic recipes —
            </p>

            <p className="mt-4">
              you <span className="text-white">explore</span>, you{" "}
              <span className="text-white">experiment</span>, you{" "}
              <span className="text-white">understand</span> through action.
            </p>
          </div>
        </div>

        {/* Constellation / Pillars */}
        <div className="relative mx-auto mt-20 max-w-5xl">
          {/* Constellation line (desktop) */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 right-0 top-[26px] hidden h-px md:block"
          >
            <div className="h-px w-full bg-gradient-to-r from-transparent via-sky-400/25 to-violet-400/25" />
          </div>

          {/* Mobile variant: vertical line */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-10 hidden h-[calc(100%-2.5rem)] w-px -translate-x-1/2 bg-gradient-to-b from-sky-400/20 via-violet-400/20 to-transparent sm:block md:hidden"
          />

          <div className="grid grid-cols-1 gap-14 md:grid-cols-3">
            <Pillar
              index="01"
              title="Real environments"
              description="Virtual machines, services, terminals, and concrete scenarios—close to what you’ll encounter in real conditions."
            />

            <Pillar
              index="02"
              title="Active learning"
              description="You test, you fail, you adjust. Mistakes are part of the journey and become a learning tool."
              featured
            />

            <Pillar
              index="03"
              title="Guided progression"
              description="A clear, structured path—without skipping steps. Each lab fits into a logical progression."
            />
          </div>

          {/* Ghost micro CTA (optional, subtle) */}
          <div className="mt-14 text-center">
            <a
              href="#"
              className="inline-flex items-center gap-2 text-sm text-slate-300/80 transition hover:text-white"
            >
              Explore the environments
              <span aria-hidden className="text-violet-300/80">
                →
              </span>
            </a>
          </div>
        </div>

        {/* Current status (grounded + subtle) */}
        <p className="mx-auto mt-20 max-w-2xl text-center text-sm leading-relaxed text-slate-400/90">
          Altaïr is under active construction.
          <br className="hidden md:block" />
          The first labs and paths are currently in development.
        </p>
      </div>
    </section>
  );
}

function Pillar({
  index,
  title,
  description,
  featured,
}: {
  index: string;
  title: string;
  description: string;
  featured?: boolean;
}) {
  return (
    <div
      className={[
        "relative mx-auto max-w-sm text-center",
        featured ? "md:-translate-y-2" : "",
      ].join(" ")}
    >
      {/* Star (constellation point) */}
      <div className="relative mx-auto mb-6 flex h-14 w-14 items-center justify-center">
        {/* thin ring */}
        <div
          aria-hidden
          className={[
            "absolute inset-0 rounded-full border",
            featured ? "border-violet-400/45" : "border-sky-400/30",
          ].join(" ")}
        />

        {/* central dot */}
        <div
          aria-hidden
          className={[
            "h-2.5 w-2.5 rounded-full",
            featured ? "bg-violet-300" : "bg-sky-300",
          ].join(" ")}
        />

        {/* micro rays (very subtle) */}
        <div
          aria-hidden
          className={[
            "absolute h-px w-10",
            featured ? "bg-violet-400/25" : "bg-sky-400/20",
          ].join(" ")}
        />
        <div
          aria-hidden
          className={[
            "absolute h-10 w-px",
            featured ? "bg-violet-400/25" : "bg-sky-400/20",
          ].join(" ")}
        />
      </div>

      {/* Index / label */}
      <div className="mx-auto mb-3 inline-flex items-center gap-2">
        <span className="text-xs font-semibold tracking-[0.25em] text-slate-400/90">
          {index}
        </span>
        <span className="h-px w-10 bg-gradient-to-r from-violet-400/40 to-transparent" />
      </div>

      <h3 className="text-lg font-semibold text-white">{title}</h3>

      <p className="mt-4 text-sm leading-relaxed text-slate-400">{description}</p>
    </div>
  );
}
