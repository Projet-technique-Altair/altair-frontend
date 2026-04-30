/*
 * @file GamificationTeaserSection
 *
 * Gamification teaser (showcase) — shows:
 * - constellation collection preview
 * - 1 title badge (e.g. "Pathfinder")
 *
 * (Aura removed for now.)
 */

import monoTexture from "@/assets/mono.png";
import argoNavisBase from "@/assets/Argo-Navis-base.png";
import cygnusBase from "@/assets/Cygnus-base.png";
import hydraBase from "@/assets/Hydra-base.png";
import lyraBase from "@/assets/Lyra-base.png";
import orionBase from "@/assets/Orion-base.png";

type GamificationTeaserSectionProps = {
  titleName?: string;
};

const constellations = [
  {
    name: "Orion",
    image: orionBase,
    tone: "from-sky-300/20 via-violet-300/10 to-transparent",
    className: "md:absolute md:left-1/2 md:top-1/2 md:z-20 md:h-[360px] md:w-[360px] md:-translate-x-1/2 md:-translate-y-1/2",
    imageClassName: "h-[122%] w-[122%]",
    featured: true,
    preserveImage: true,
  },
  {
    name: "Argo Navis",
    image: argoNavisBase,
    tone: "from-cyan-300/20 via-sky-300/10 to-transparent",
    className: "md:absolute md:left-[7%] md:top-[10%] md:z-30 md:h-[220px] md:w-[220px]",
    imageClassName: "h-[112%] w-[112%]",
  },
  {
    name: "Cygnus",
    image: cygnusBase,
    tone: "from-violet-300/20 via-fuchsia-300/10 to-transparent",
    className: "md:absolute md:right-[7%] md:top-[16%] md:z-30 md:h-[220px] md:w-[220px]",
    imageClassName: "h-[114%] w-[114%]",
  },
  {
    name: "Hydra",
    image: hydraBase,
    tone: "from-emerald-300/20 via-sky-300/10 to-transparent",
    className: "md:absolute md:left-[10%] md:bottom-[10%] md:z-30 md:h-[220px] md:w-[220px]",
    imageClassName: "h-[114%] w-[114%]",
  },
  {
    name: "Lyra",
    image: lyraBase,
    tone: "from-orange-300/20 via-amber-200/10 to-transparent",
    className: "md:absolute md:right-[10%] md:bottom-[8%] md:z-30 md:h-[220px] md:w-[220px]",
    imageClassName: "h-[112%] w-[112%]",
  },
];

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

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          {/* Showcase */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 md:p-7">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0
                           bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06)_0%,rgba(7,11,24,0)_55%)]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-10 top-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />

              <div className="relative grid grid-cols-1 gap-4 md:block md:min-h-[610px]">
                <div
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-white/[0.025] md:block"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.12),transparent_68%)] blur-xl md:block"
                />
                {constellations.map((constellation) => (
                  <ConstellationCard key={constellation.name} {...constellation} />
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/10 pt-5">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">
                    Constellation examples
                  </p>
                  <p className="mt-1 text-sm text-slate-300/80">
                    Cosmetic identities earned through activity.
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

type ConstellationCardProps = {
  name: string;
  image: string;
  tone: string;
  className?: string;
  imageClassName: string;
  featured?: boolean;
  preserveImage?: boolean;
};

function ConstellationCard({
  name,
  image,
  tone,
  className = "",
  imageClassName,
  featured = false,
  preserveImage = false,
}: ConstellationCardProps) {
  return (
    <article
      className={[
        "group relative min-h-[170px] overflow-hidden rounded-full border border-white/10 bg-[#070B18]/15",
        "transition duration-300 hover:border-white/25 hover:bg-white/[0.07]",
        featured ? "" : "hover:-translate-y-1",
        featured ? "min-h-[320px]" : "",
        className,
      ].join(" ")}
    >
      <div
        aria-hidden
        className={[
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80 transition duration-300 group-hover:opacity-100",
          tone,
        ].join(" ")}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-1 rounded-full border border-white/10 opacity-70"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-12 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.10),transparent_58%)] opacity-0 blur-xl transition duration-300 group-hover:opacity-100"
      />

      <div className="relative flex h-full min-h-[inherit] items-center justify-center p-3">
        <div className="relative aspect-square w-[92%] overflow-hidden rounded-full">
          <img
            src={image}
            alt={`${name} constellation`}
            draggable={false}
            className={[
              "absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-[0_18px_55px_rgba(0,0,0,0.60)] transition duration-500",
              featured ? "" : "group-hover:scale-[1.04]",
              preserveImage
                ? ""
                : "mix-blend-screen brightness-115 contrast-125 saturate-125",
              imageClassName,
            ].join(" ")}
          />
        </div>
      </div>

      <span className="sr-only">{name} base constellation</span>
    </article>
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
