/*
 * @file GamificationTeaserSection
 *
 * Gamification teaser (showcase) — shows:
 * - 1 constellation (Orion-base.png)
 * - 1 title badge (e.g. "Pathfinder")
 *
 * (Aura removed for now.)
 */

import monoTexture from "@/assets/mono.png";
import orionBase from "@/assets/Orion-base.png";

type GamificationTeaserSectionProps = {
  titleName?: string;
};

export default function GamificationTeaserSection({
  titleName = "Pathfinder",
}: GamificationTeaserSectionProps) {
  return (
    <section id="gamification" className="relative overflow-hidden px-8 py-28">
      {/* Unique BG filter: prism glow + film texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0
                   bg-[radial-gradient(60%_55%_at_50%_20%,rgba(124,58,237,0.22)_0%,rgba(7,11,24,0)_55%),radial-gradient(55%_50%_at_70%_60%,rgba(56,189,248,0.18)_0%,rgba(7,11,24,0)_60%),radial-gradient(45%_40%_at_35%_75%,rgba(249,115,22,0.10)_0%,rgba(7,11,24,0)_60%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.10] mix-blend-overlay bg-repeat"
        style={{ backgroundImage: `url(${monoTexture})` }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0
                   bg-gradient-to-b from-[#070B18]/25 via-transparent to-[#070B18]/80"
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-slate-400/90">
            Gamification
          </p>

          <h2 className="mt-4 text-4xl font-medium tracking-tight text-white md:text-5xl">
            A cosmic identity, 100% cosmetic.
          </h2>

          <p className="mt-5 text-base leading-relaxed text-slate-300">
            You earn visual elements by learning. No gameplay advantage,
            no pay-to-win — progress is visible, without impacting performance.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-[1fr_0.85fr] md:items-center">
          {/* Showcase */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0
                           bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06)_0%,rgba(7,11,24,0)_55%)]"
              />

              {/* Stage (Orion enlarged a lot) */}
              <div className="relative mx-auto flex aspect-square w-full max-w-[720px] items-center justify-center">
                <img
                  src={orionBase}
                  alt="Orion constellation"
                  draggable={false}
                  className="relative z-10 h-[108%] w-[108%] object-contain drop-shadow-[0_18px_70px_rgba(0,0,0,0.55)]"
                />

                {/* Anchor ring */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-3 rounded-full border border-white/10"
                />
              </div>

              <div className="mt-8 flex items-center justify-between gap-4 border-t border-white/10 pt-5">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">
                    Orion — Base
                  </p>
                  <p className="mt-1 text-sm text-slate-300/80">
                    Cosmetic only. Earned through activity.
                  </p>
                </div>

                <AltairTitle>{titleName}</AltairTitle>
              </div>
            </div>
          </div>

          {/* Side copy (soft, showcase) */}
          <div className="rounded-2xl border border-white/10 bg-[#070B18]/30 p-6 backdrop-blur-[2px]">
            <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-slate-400/90">
              Principles
            </p>

            <div className="mt-5 space-y-4 text-sm leading-relaxed text-slate-300/90">
              <p>
                <span className="font-semibold text-white">Identity-driven</span> : your
                profile becomes unique as you progress.
              </p>
              <p>
                <span className="font-semibold text-white">Cosmetic-only</span> : nothing
                gives a performance advantage.
              </p>
              <p>
                <span className="font-semibold text-white">No pay-to-win</span> : rewards
                are earned through activity, not with real money.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300/80">
                Constellations
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300/80">
                Auras
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300/80">
                UI skins
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AltairTitle({ children }: { children: string }) {
  return (
    <div
      className={[
        "inline-block",
        "mt-1 px-3 py-1",
        "rounded-[12px]",
        "font-['Space_Grotesk',monospace]",
        "text-[14px] font-semibold tracking-[0.05em] text-center",
        "bg-gradient-to-br from-[#4A9EFF] to-[#7B68EE]",
        "bg-clip-text text-transparent",
        "animate-[altairPulseGlow_3s_ease-in-out_infinite]",
        "transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-[1.05]",
        "drop-shadow-[0_0_8px_rgba(74,158,255,0.40)]",
        "hover:drop-shadow-[0_0_16px_rgba(74,158,255,0.80)]",
      ].join(" ")}
      style={{
        backgroundColor: "rgba(74, 158, 255, 0.10)",
        backdropFilter: "blur(4px)",
      }}
    >
      {children}

      <style>
        {`
          @keyframes altairPulseGlow {
            0%, 100% {
              filter: drop-shadow(0 0 8px rgba(74, 158, 255, 0.40));
            }
            50% {
              filter:
                drop-shadow(0 0 16px rgba(74, 158, 255, 0.80))
                drop-shadow(0 0 24px rgba(123, 104, 238, 0.40));
            }
          }
        `}
      </style>
    </div>
  );
}
