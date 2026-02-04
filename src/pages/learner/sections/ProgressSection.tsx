// src/pages/learner/sections/ProgressSection.tsx

/**
 * @file ProgressSection — displays the learner’s progress across all active Starpaths.
 *
 * @remarks
 * This section lists all Starpaths the learner has started.
 * Each entry shows:
 *  - The Starpath name
 *  - The learner’s completion percentage
 *  - A gradient progress bar
 *  - Quick metadata (number of chapters, labs, and domain)
 *
 * Used within the Learner Dashboard to provide at-a-glance Starpath progression.
 *
 * @packageDocumentation
 */
import React from "react";
import { useNavigate } from "react-router-dom";
import type { Starpath } from "@/api/mock"; //Correct type source

import Progress from "@/components/ui/progress";
import DashboardCard from "@/components/ui/DashboardCard";
import SectionTitle from "@/components/ui/SectionTitle";
import { ALT_COLORS } from "@/lib/theme";

/**
 * Props for the {@link ProgressSection} component.
 */
interface ProgressSectionProps {
  starpaths: Starpath[];
}


/**
 * Displays all Starpaths started by the learner and their respective progress.
 *
 * @remarks
 * - Each Starpath card is clickable and redirects to its dedicated page.
 * - Progress is dynamically computed as `(chaptersCompleted / totalChapters) * 100`.
 * - Includes a gradient bar visual consistent with the dashboard theme.
 *
 * @example
 * ```tsx
 * <ProgressSection starpaths={userStarpaths} />
 * ```
 *
 * @returns A dashboard card containing Starpath progression entries.
 *
 * @public
 */
export default function ProgressSection({ starpaths }: ProgressSectionProps) {
  const navigate = useNavigate();

  const handleClick = (id: string) => {
    navigate(`/learner/starpath/${id}`);
  };

  return (
    <DashboardCard className="p-6">
      {/* === SECTION TITLE === */}
      <SectionTitle
        text="Starpath Progress"
        gradient={`linear-gradient(90deg, ${ALT_COLORS.blue}, ${ALT_COLORS.purple})`}
        count={starpaths.length}
        showDot
      />

      {/* === EMPTY STATE === */}
      {starpaths.length === 0 ? (
        <p className="text-sm text-gray-400 italic mt-2">
          You haven’t started any Starpaths yet.
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          {starpaths.map((sp) => {
            const progress = Math.round(
              (sp.chaptersCompleted / sp.totalChapters) * 100
            );

            return (
              <div
                key={sp.id}
                onClick={() => handleClick(sp.id)}
                className="
                  group cursor-pointer
                  bg-[#0E1325]/70 border border-[#1E293B]/60
                  hover:border-[#7A2CF3]/40 hover:shadow-[0_0_12px_rgba(122,44,243,0.25)]
                  rounded-xl p-3 transition-all duration-200
                "
              >
                {/* === HEADER === */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-200 font-medium group-hover:text-sky-400 transition">
                    {sp.name}
                  </span>
                  <span className="text-xs text-sky-400 font-semibold">
                    {progress}%
                  </span>
                </div>

                {/* === PROGRESS BAR === */}
                <Progress
                  value={progress}
                  className="h-2 bg-[#0f172a]"
                  indicatorClassName="bg-gradient-to-r from-sky-400 via-purple-400 to-orange-400"
                />

                {/* === FOOTER === */}
                <div className="flex justify-between text-[11px] mt-2 text-gray-500">
                  <span>
                    {sp.chaptersCompleted}/{sp.totalChapters} chapters
                  </span>
                  <span className="italic">
                    {sp.labs} labs • {sp.domain}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardCard>
  );
}
