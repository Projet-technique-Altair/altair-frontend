/*
 * @file FutureSection
 *
 * Future — community & creation vision (soft showcase).
 * Unique style:
 * - Editorial indexed list (no cards, no split like Labs)
 * - BG filter: nebula gradient wash (NOT grid, NOT flat opacity)
 * - Light gamification tease only (no constellation/aura/title placeholder)
 */

type FutureRowProps = {
  index: string;
  label: string;
  title: string;
  description: string;
};

export default function FutureSection() {
  return (
    <section id="future" className="relative overflow-hidden px-8 py-28">
      {/* BG filter: nebula wash + bottom fade */}
      {/* Future BG filter (strong): nebula + diagonal wash + bottom vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0
             bg-[radial-gradient(72%_62%_at_18%_22%,rgba(124,58,237,0.32)_0%,rgba(7,11,24,0)_55%),radial-gradient(60%_55%_at_86%_34%,rgba(56,189,248,0.26)_0%,rgba(7,11,24,0)_60%),radial-gradient(55%_45%_at_55%_85%,rgba(124,58,237,0.18)_0%,rgba(7,11,24,0)_62%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0
             bg-[linear-gradient(115deg,rgba(56,189,248,0.10)_0%,rgba(124,58,237,0.12)_35%,rgba(7,11,24,0)_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0
             bg-gradient-to-b from-[#070B18]/25 via-[#070B18]/10 to-[#070B18]/80"
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-slate-400/90">
            What's next
          </p>

          <h2 className="mt-4 text-4xl font-medium tracking-tight text-white md:text-5xl">
            Build with the community.
          </h2>

          <p className="mt-5 text-base leading-relaxed text-slate-300">
            Altaïr isn’t just a lab platform: it’s a space where scenarios are
            created, improved, and shared — with visible feedback and optional
            AI assistance.
          </p>
        </div>

        {/* Editorial indexed list */}
        <div className="mt-14">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-8 md:px-10">
            <div className="space-y-10">
              <FutureRow
                index="01"
                label="Create"
                title="Anyone can propose a lab."
                description="You can start from a simple idea, test it, then publish it. The goal: make creation accessible, and let quality emerge over time."
              />

              <div className="h-px w-full bg-white/10" />

              <FutureRow
                index="02"
                label="Evaluate"
                title="Likes & comments to surface the best."
                description="Feedback is used to improve, fix, and clarify. Labs evolve: what truly helps moves forward, what’s missing becomes visible."
              />

              <div className="h-px w-full bg-white/10" />

              <FutureRow
                index="03"
                label="Assist"
                title="AI to speed up design."
                description="Optional: you stay in control of the content, but you can get help structuring a scenario (goals, steps, hints) and ship faster."
              />
            </div>

            {/* Light gamification tease */}
            <div className="mt-12 border-t border-white/10 pt-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-slate-400/90">
                Gamification
              </p>
              <p className="mt-3 max-w-4xl text-sm leading-relaxed text-slate-300/85">
                A cosmic identity, 100% cosmetic: no gameplay advantage, no
                pay-to-win. Rewards are earned through activity — never with
                real money.
              </p>
            </div>
          </div>

          <p className="mt-10 max-w-2xl text-sm leading-relaxed text-slate-400/90">
            Features will roll out progressively, with one priority:
            maintaining clear progression and high content quality.
          </p>
        </div>
      </div>
    </section>
  );
}

function FutureRow({ index, label, title, description }: FutureRowProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[80px_1fr] md:gap-8">
      <div className="flex items-start justify-between md:block">
        <div className="text-2xl font-semibold text-white/90">{index}</div>
        <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.45em] text-slate-400/90">
          {label}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-300/85">
          {description}
        </p>
      </div>
    </div>
  );
}
