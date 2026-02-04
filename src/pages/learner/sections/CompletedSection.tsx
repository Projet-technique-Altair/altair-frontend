/**
 * @file CompletedSection — displays the learner’s finished labs.
 *
 * @remarks
 * This section lists all labs marked as `completed` from the provided dataset.
 * Each completed lab shows:
 *  - Its name
 *  - A completion indicator (always 100%)
 *  - A color-gradient progress bar
 *
 * Used within the Learner Dashboard to track accomplishments.
 *
 * @packageDocumentation
 */


import { Lab } from "@/api";
import  Progress  from "@/components/ui/progress";
import DashboardCard from "@/components/ui/DashboardCard";
import SectionTitle from "@/components/ui/SectionTitle";
import { ALT_COLORS } from "@/lib/theme";

/**
 * Props for the {@link CompletedSection} component.
 */
interface CompletedSectionProps {
  labs: Lab[];
}


/**
 * Displays a list of all labs the learner has completed.
 *
 * @remarks
 * - Uses the {@link Progress} component to show completion bars.
 * - Applies a cyan-to-green gradient consistent with the theme palette.
 *
 * @example
 * ```tsx
 * <CompletedSection labs={userLabs} />
 * ```
 *
 * @returns A dashboard card containing completed lab entries.
 *
 * @public
 */
export default function CompletedSection({ labs }: CompletedSectionProps) {
  const completed = labs.filter((lab) => lab.completed);

  return (
    <DashboardCard className="p-6">
      <SectionTitle
        text="Completed Labs"
        gradient={`linear-gradient(90deg, ${ALT_COLORS.green}, ${ALT_COLORS.cyan})`}
        count={completed.length}
        showDot
      />

      {completed.length === 0 ? (
        <p className="text-sm text-gray-400 italic">
          You haven’t completed any labs yet.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          {completed.map((lab) => (
            <div key={lab.id} className="opacity-95">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-300">{lab.name}</span>
                <span className="text-xs text-green-400 font-medium">100%</span>
              </div>
              <Progress
                value={100}
                className="h-2 bg-[#0f172a]"
                indicatorClassName="bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400"
              />
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}
