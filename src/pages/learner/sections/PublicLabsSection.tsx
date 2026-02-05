// src/pages/learner/sections/PublicLabsSection.tsx

import { ChevronRight, Rocket } from "lucide-react";
import Progress from "@/components/ui/progress";

interface LabLike {
  id?: string;
  lab_id?: string;
  name: string;
  progress?: number;
  completed?: boolean;

  // optional (if you later provide)
  description?: string;
  difficulty?: string;
  visibility?: string;
}

interface PublicLabsSectionProps {
  labs: LabLike[];
  onLabClick?: (lab: LabLike) => void;
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

export default function PublicLabsSection({ labs, onLabClick }: PublicLabsSectionProps) {
  return (
    <GlassPanel
      eyebrow="Labs"
      title="Transmission: Active Labs"
      subtitle="Scan active missions. Completed missions are stored in Archive."
      count={labs.length}
    >
      {labs.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-white/65">
          <div className="text-sm font-semibold">No signal detected</div>
          <div className="mt-2 text-xs text-white/55">
            No active labs match your current scan parameters.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {labs.map((lab) => {
            const id = lab.id ?? lab.lab_id ?? lab.name;
            const progress = lab.progress ?? 0;

            return (
              <button
                key={id}
                type="button"
                onClick={() => onLabClick?.(lab)}
                className={[
                  "w-full text-left rounded-2xl border border-white/10 bg-black/20",
                  "px-5 py-4 transition",
                  "hover:bg-white/5 hover:border-white/15 hover:shadow-[0_18px_50px_rgba(0,0,0,0.35)]",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Rocket className="h-4 w-4 text-white/60" />
                      <div className="truncate text-sm font-semibold text-white/90">
                        {lab.name}
                      </div>
                    </div>

                    {(lab.description || lab.difficulty) && (
                      <div className="mt-1 text-xs text-white/55 line-clamp-1">
                        {lab.description ? lab.description : ""}
                        {lab.description && lab.difficulty ? " • " : ""}
                        {lab.difficulty ? `difficulty: ${lab.difficulty}` : ""}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-xs text-white/60 tabular-nums">
                      {progress}%
                    </div>
                    <ChevronRight className="h-4 w-4 text-white/40" />
                  </div>
                </div>

                <div className="mt-3">
                  <Progress
                    value={progress}
                    className="h-2 bg-white/5 border border-white/10"
                    indicatorClassName="bg-gradient-to-r from-sky-400/80 via-purple-400/80 to-orange-300/75"
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </GlassPanel>
  );
}
