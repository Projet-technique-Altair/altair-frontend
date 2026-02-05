// src/pages/learner/sections/CompletedSection.tsx

import { Archive, CheckCircle2 } from "lucide-react";
import Progress from "@/components/ui/progress";

type CompletedLabLike = {
  id?: string;
  lab_id?: string;
  name?: string;
  completed?: boolean;
  progress?: number;
};

interface CompletedSectionProps {
  labs: CompletedLabLike[];
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

export default function CompletedSection({ labs }: CompletedSectionProps) {
  // keep behavior: show only completed
  const completed = labs.filter((l) => l.completed);

  return (
    <GlassPanel
      eyebrow="Archive"
      title="Archive: Completed"
      subtitle="Closed missions stored for reference and bragging rights."
      count={completed.length}
    >
      {completed.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-white/65">
          <div className="text-sm font-semibold">No completed labs yet</div>
          <div className="mt-2 text-xs text-white/55">
            Finish a lab to move it into the archive.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {completed.map((lab) => {
            const id = lab.id ?? lab.lab_id ?? lab.name ?? "completed";
            const name = lab.name ?? "Completed Lab";

            return (
              <div
                key={id}
                className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4 hover:bg-white/5 hover:border-white/15 transition shadow-[0_0_0_rgba(0,0,0,0)] hover:shadow-[0_18px_50px_rgba(0,0,0,0.35)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-white/60" />
                      <div className="truncate text-sm font-semibold text-white/90">
                        {name}
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-white/55">
                      Archived mission record
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    <Archive className="h-3.5 w-3.5 text-white/55" />
                    <span className="text-[11px] text-white/60">100%</span>
                  </div>
                </div>

                <div className="mt-3">
                  <Progress
                    value={100}
                    className="h-2 bg-white/5 border border-white/10"
                    indicatorClassName="bg-gradient-to-r from-sky-400/80 via-purple-400/80 to-orange-300/75"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </GlassPanel>
  );
}
