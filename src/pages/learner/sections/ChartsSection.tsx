// src/pages/learner/sections/ChartsSection.tsx

/**
 * @file ChartsSection — (currently used as Insight / Telemetry snapshot)
 *
 * @remarks
 * This file now owns the whole "Insight" module UI (Telemetry Snapshot),
 * previously inline in LearnerDashboard.
 *
 * No backend behavior changes: pure UI aggregation.
 */

import { useId, useMemo } from "react";

type LabLike = {
  id?: string;
  name?: string;
  completed?: boolean;
  progress?: number;
};

interface ChartsSectionProps {
  labs: LabLike[];
  starpathsCount: number;
  groupsCount: number;
}

export default function ChartsSection({
  labs,
  starpathsCount,
  groupsCount,
}: ChartsSectionProps) {
  const active = useMemo(() => labs.filter((l) => !l.completed), [labs]);
  const completed = useMemo(() => labs.filter((l) => l.completed), [labs]);

  const total = labs.length;

  const completionPct = useMemo(() => {
    if (total === 0) return 0;
    return Math.round((completed.length / total) * 100);
  }, [total, completed.length]);

  // “Signal” = moyenne des progress des labs actifs
  const avgProgress = useMemo(() => {
    if (active.length === 0) return 0;
    const sum = active.reduce((acc, l) => acc + (l.progress ?? 0), 0);
    return Math.round(sum / active.length);
  }, [active]);

  const maxBar = Math.max(active.length, completed.length, starpathsCount, groupsCount, 1);

  const rawUid = useId();
  const uid = rawUid.replace(/:/g, "");
  const ringGradId = `altair_ring_${uid}`;

  const nextAction = active[0]?.name ? `Continue: ${active[0]?.name}` : "Start a lab to generate signal.";

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_24px_90px_rgba(0,0,0,0.45)] overflow-hidden">
      <div className="relative p-8">
        {/* background glow */}
        <div className="pointer-events-none absolute inset-0 opacity-80">
          <div className="absolute -top-28 -left-28 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute -bottom-28 -right-28 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-400/5 blur-3xl" />
        </div>

        {/* gradient defs for ring */}
        <svg style={{ position: "absolute", visibility: "hidden" }}>
          <defs>
            <linearGradient id={ringGradId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(56,189,248,0.9)" />
              <stop offset="55%" stopColor="rgba(168,85,247,0.85)" />
              <stop offset="100%" stopColor="rgba(251,146,60,0.8)" />
            </linearGradient>
          </defs>
        </svg>

        <div className="relative flex flex-col gap-7">
          {/* header row */}
          <div className="flex items-start justify-between gap-8">
            <div>
              <div className="text-[11px] tracking-wide uppercase text-white/55">
                Insight
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white/90">
                Telemetry Snapshot
              </h2>
           
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4">
                <div className="text-[10px] text-white/55 tracking-wide">
                  Completion
                </div>
                <div className="mt-1 text-xl font-semibold text-white/90">
                  {completionPct}%
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4">
                <div className="text-[10px] text-white/55 tracking-wide">
                  Signal
                </div>
                <div className="mt-1 text-xl font-semibold text-white/90">
                  {avgProgress}%
                </div>
              </div>
            </div>
          </div>

          {/* content grid */}
          <div className="grid grid-cols-12 gap-7">
            {/* ring */}
            <div className="col-span-5">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-6 h-full">
                <div className="text-xs text-white/55">Completion Ring</div>

                <div className="mt-4 flex items-center justify-center">
                  <svg width="260" height="260" viewBox="0 0 260 260">
                    <circle
                      cx="130"
                      cy="130"
                      r="100"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="16"
                      fill="none"
                    />

                    <circle
                      cx="130"
                      cy="130"
                      r="100"
                      stroke={`url(#${ringGradId})`}
                      strokeWidth="16"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 100}
                      strokeDashoffset={(1 - completionPct / 100) * (2 * Math.PI * 100)}
                      transform="rotate(-90 130 130)"
                    />

                    <circle
                      cx="130"
                      cy="130"
                      r="70"
                      fill="rgba(0,0,0,0.25)"
                      stroke="rgba(255,255,255,0.06)"
                    />

                    <text
                      x="130"
                      y="132"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="40"
                      fontWeight="700"
                      fill="rgba(255,255,255,0.92)"
                    >
                      {completionPct}%
                    </text>
                    <text
                      x="130"
                      y="165"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="12"
                      fill="rgba(255,255,255,0.55)"
                    >
                      completion
                    </text>
                  </svg>
                </div>

                <div className="mt-5 text-xs text-white/55 leading-relaxed">
                  Active labs generate signal. Completed labs move into Archive.
                </div>
              </div>
            </div>

            {/* bars + next action */}
            <div className="col-span-7">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-6 h-full">
                <div className="text-xs text-white/55">Module Activity</div>

                <div className="mt-5 space-y-5">
                  {[
                    { label: "Active Labs", value: active.length },
                    { label: "Completed", value: completed.length },
                    { label: "Starpaths", value: starpathsCount },
                    { label: "Groups", value: groupsCount },
                  ].map((row) => (
                    <div key={row.label}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/70">{row.label}</span>
                        <span className="text-white/60">{row.value}</span>
                      </div>

                      <div className="mt-2.5 h-2.5 rounded-full bg-white/5 overflow-hidden border border-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-sky-400/80 via-purple-400/80 to-orange-300/75"
                          style={{ width: `${Math.round((row.value / maxBar) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="text-xs text-white/55">Next action (temp)</div>
                  <div className="mt-1.5 text-sm text-white/85">
                    {nextAction}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-white/45">
            Placeholder Insight module — we’ll replace it with a more Altaïr cosmic visualization.
          </div>
        </div>
      </div>
    </div>
  );
}
