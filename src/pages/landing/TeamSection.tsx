/*
 * @file TeamSection
 *
 * Team Altaïr — dev team showcase (showcase).
 * Changes:
 * - Removed bullets (keep it public-facing, non-technical)
 * - Updated roles:
 *   - Mark: Lead Designer (creates tasks + reviews)
 *   - Cyndelle: Project Lead (+ Gamification)
 *   - Hing-Thanh: Deployment, AI & labs systems
 */

import nebulaMark from "@/assets/Nebula-Sablier.png";
import nebulaCyndelle from "@/assets/Nebula-Fox-Fur.png";
import nebulaLaura from "@/assets/Nebula-Lagune.png";
import nebulaNikita from "@/assets/Nebula-iris.png";
import nebulaThanh from "@/assets/Nebula-Flame-Star.png";

import monoTexture from "@/assets/mono.png";

type Member = {
  name: string;
  role: string;
  subtitle: string;
  image: string;
  accent: "sky" | "violet";
};

const TEAM: Member[] = [
  {
    name: "Mark Ponsoda",
    role: "Lead Designer",
    subtitle: "Product vision, design system, task creation & review.",
    image: nebulaMark,
    accent: "violet",
  },
  {
    name: "Cyndelle Napoletano",
    role: "Project Lead",
    subtitle:
      "Coordination, prioritization, follow-up, gamification systems — and overall project quality.",
    image: nebulaCyndelle,
    accent: "sky",
  },
  {
    name: "Laura Musso",
    role: "Backend Engineer",
    subtitle: "Core features & platform reliability.",
    image: nebulaLaura,
    accent: "violet",
  },
  {
    name: "Nikita Dovhan",
    role: "Infrastructure Engineer",
    subtitle: "Environment execution & runtime stability.",
    image: nebulaNikita,
    accent: "sky",
  },
  {
    name: "Hing-Thanh Truong",
    role: "AI & Platform Engineer",
    subtitle:
      "Cloud deployment, AI systems integration, and lab execution architecture.",
    image: nebulaThanh,
    accent: "violet",
  },
];

export default function TeamSection() {
  return (
    <section id="team" className="relative overflow-hidden px-8 py-28">
      {/* BG radial */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0
          bg-[radial-gradient(70%_60%_at_15%_30%,rgba(56,189,248,0.10)_0%,rgba(7,11,24,0)_60%),radial-gradient(60%_55%_at_85%_20%,rgba(124,58,237,0.10)_0%,rgba(7,11,24,0)_62%)]"
      />

      {/* Texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay bg-repeat"
        style={{ backgroundImage: `url(${monoTexture})` }}
      />

      {/* Dark overlay (NEW) */}
      <div className="pointer-events-none absolute inset-0 bg-black/40" />

      {/* Strong gradient (UPDATED) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#070B18]/50 via-[#070B18]/20 to-[#070B18]/90"
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-end">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-slate-400/90">
              Team Altaïr
            </p>
            <h2 className="mt-4 text-4xl font-medium tracking-tight text-white md:text-5xl">
              A compact team, a clear vision.
            </h2>
          </div>

          <p className="max-w-xl text-base leading-relaxed text-slate-300 md:justify-self-end">
            Altaïr is built by a small, complementary team: design,
            coordination, backend, infrastructure, and AI — with strong attention
            to experience and quality.
          </p>
        </div>

        {/* Roster */}
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
          {TEAM.map((m) => (
            <MemberCard key={m.name} member={m} />
          ))}
        </div>
      </div>
    </section>
  );
}

function MemberCard({ member }: { member: Member }) {
  const ring =
    member.accent === "violet" ? "ring-violet-400/20" : "ring-sky-400/20";

  const chip =
    member.accent === "violet"
      ? "bg-violet-400/10 text-violet-200/90 border-violet-400/20"
      : "bg-sky-400/10 text-sky-200/90 border-sky-400/20";

  const glow =
    member.accent === "violet" ? "bg-violet-400/12" : "bg-sky-400/12";

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-white/5 p-6 ring-1 ${ring}`}>
      <div
        aria-hidden
        className={`pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl ${glow}`}
      />

      <div className="relative z-10 flex items-start gap-5">
        {/* Portrait */}
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <img
            src={member.image}
            alt={`${member.name} portrait`}
            className="h-full w-full object-cover scale-[0.9]" // ✅ zoom out
            loading="lazy"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/20"
          />
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="truncate text-lg font-semibold text-white">
              {member.name}
            </h3>

            <span
              className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-widest ${chip}`}
            >
              {member.role}
            </span>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-slate-300/90">
            {member.subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}