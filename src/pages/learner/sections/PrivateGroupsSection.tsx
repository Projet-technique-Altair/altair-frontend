// src/pages/learner/sections/PrivateGroupsSection.tsx

import { Users, Shield } from "lucide-react";

type GroupLike = {
  id: string;
  name: string;
  labIds: string[];
  starpathIds: string[];
};

interface PrivateGroupsSectionProps {
  groups: GroupLike[];
}

function GlassPanel({
  eyebrow,
  title,
  subtitle,
  count,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_24px_90px_rgba(0,0,0,0.45)] overflow-hidden">
      <div className="relative p-8">
        {/* subtle glow */}
        <div className="pointer-events-none absolute inset-0 opacity-80">
          <div className="absolute -top-28 -left-28 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute -bottom-28 -right-28 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-400/5 blur-3xl" />
        </div>

        <div className="relative flex items-start justify-between gap-8">
          <div>
            <div className="text-[11px] tracking-wide uppercase text-white/55">
              {eyebrow}
            </div>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white/90">
              {title}
            </h3>
            {subtitle && (
              <p className="mt-1.5 text-sm text-white/60 max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>

          {typeof count === "number" && (
            <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4">
              <div className="text-[10px] text-white/55 tracking-wide">Count</div>
              <div className="mt-1 text-xl font-semibold text-white/90">{count}</div>
            </div>
          )}
        </div>

        <div className="relative mt-7">{children}</div>
      </div>
    </div>
  );
}

function MiniBar({ value, max }: { value: number; max: number }) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="h-2 rounded-full bg-white/5 border border-white/10 overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-sky-400/80 via-purple-400/80 to-orange-300/75"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function PrivateGroupsSection({ groups }: PrivateGroupsSectionProps) {
  const maxLabs = Math.max(1, ...groups.map((g) => g.labIds.length));
  const maxStarpaths = Math.max(1, ...groups.map((g) => g.starpathIds.length));

  return (
    <GlassPanel
      eyebrow="Groups"
      title="Private Groups"
      subtitle="Your secured workspaces for collaborative runs."
      count={groups.length}
    >
      {groups.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-white/65">
          <div className="text-sm font-semibold">No groups yet</div>
          <div className="mt-2 text-xs text-white/55">
            Private groups will appear here once you join or create one.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((g) => (
            <div
              key={g.id}
              className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4 hover:bg-white/5 hover:border-white/15 transition shadow-[0_0_0_rgba(0,0,0,0)] hover:shadow-[0_18px_50px_rgba(0,0,0,0.35)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-white/60" />
                    <div className="truncate text-sm font-semibold text-white/90">
                      {g.name}
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-white/55">
                    {g.labIds.length} labs • {g.starpathIds.length} starpaths
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  <Shield className="h-3.5 w-3.5 text-white/55" />
                  <span className="text-[11px] text-white/60">Private</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="text-[11px] uppercase tracking-wide text-white/55">
                    Labs Activity
                  </div>
                  <div className="mt-3">
                    <MiniBar value={g.labIds.length} max={maxLabs} />
                  </div>
                  <div className="mt-2 text-xs text-white/55">
                    {g.labIds.length > 0 ? "Assigned labs detected." : "No labs assigned yet."}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="text-[11px] uppercase tracking-wide text-white/55">
                    Starpaths Activity
                  </div>
                  <div className="mt-3">
                    <MiniBar value={g.starpathIds.length} max={maxStarpaths} />
                  </div>
                  <div className="mt-2 text-xs text-white/55">
                    {g.starpathIds.length > 0
                      ? "Starpaths linked to this group."
                      : "No starpaths linked yet."}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassPanel>
  );
}
