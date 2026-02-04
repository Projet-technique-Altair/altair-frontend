// src/pages/learner/sections/PublicLabsSection.tsx

import DashboardCard from "@/components/ui/DashboardCard";
import SectionTitle from "@/components/ui/SectionTitle";
import Progress from "@/components/ui/progress";
import { ALT_COLORS } from "@/lib/theme";

interface LabLike {
  id?: string;
  lab_id?: string;
  name: string;
  progress?: number;
}

interface PublicLabsSectionProps {
  labs: LabLike[];
  onLabClick?: (lab: LabLike) => void;
}

export default function PublicLabsSection({
  labs,
  onLabClick,
}: PublicLabsSectionProps) {
  return (
    <DashboardCard>
      <SectionTitle
        text="Available Public Labs"
        gradient={`linear-gradient(90deg, ${ALT_COLORS.orange}, ${ALT_COLORS.purple})`}
        showDot
        count={labs.length}
      />

      <div className="mt-4 space-y-4">
        {labs.map((lab) => {
          const labId = lab.id ?? lab.lab_id ?? "unknown";
          const progress = lab.progress ?? 0;

          return (
            <div
              key={labId}
              onClick={() => onLabClick?.(lab)}
              className="cursor-pointer rounded-xl p-3 bg-[#0E1323]/80 border border-white/5 hover:border-[#7A2CF3]/50 transition"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-white leading-tight">
                  {lab.name}
                </span>
                <span className="text-sm text-slate-400">{progress}%</span>
              </div>

              <Progress
                value={progress}
                className="mt-2 h-2 bg-[#111827]"
                indicatorClassName="bg-gradient-to-r from-orange-400 via-purple-400 to-sky-400"
              />
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
}
