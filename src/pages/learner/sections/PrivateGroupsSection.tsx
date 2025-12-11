/**
 * @file PrivateGroupsSection — displays all learner private collaboration groups.
 *
 * @remarks
 * This section lists the **private groups** the learner is part of.
 * Each group card shows:
 * - Its name and visibility status
 * - A small visual overview of associated labs and starpaths
 * - A soft background glow effect for aesthetic consistency
 *
 * Used in the Learner Dashboard to represent team or private project workspaces.
 *
 * @packageDocumentation
 */


import { PrivateGroup } from "@/api";
import DashboardCard from "@/components/ui/DashboardCard";
import SectionTitle from "@/components/ui/SectionTitle";
import { ALT_COLORS } from "@/lib/theme";

/**
 * Props for the {@link PrivateGroupsSection} component.
 */
interface PrivateGroupsSectionProps {
  groups: PrivateGroup[];
}


/**
 * Displays the list of learner’s **private groups**.
 *
 * @remarks
 * - If the learner has no private groups, displays a friendly empty message.
 * - Each group card includes quick visual indicators for **labs** and **starpaths**.
 * - The progress visualization width dynamically scales with the number of items.
 *
 * @example
 * ```tsx
 * <PrivateGroupsSection groups={userPrivateGroups} />
 * ```
 *
 * @returns A stylized dashboard card containing private group summaries.
 *
 * @public
 */
export default function PrivateGroupsSection({ groups }: PrivateGroupsSectionProps) {
  return (
    <DashboardCard className="p-6">
      <SectionTitle
        text="Private Groups"
        gradient={`linear-gradient(90deg, ${ALT_COLORS.purple}, ${ALT_COLORS.cyan})`}
        count={groups.length}
        showDot
      />

      {groups.length === 0 ? (
        <p className="text-sm text-gray-400 italic mt-3">
          You don’t belong to any groups yet.
        </p>
      ) : (
        <div className="mt-6 space-y-5">
          {groups.map((group) => (
            <div
              key={group.id}
              className="relative overflow-hidden p-5 rounded-xl bg-[#101520]/80 border border-white/5 shadow-[0_0_12px_rgba(122,44,243,0.1)] hover:shadow-[0_0_18px_rgba(122,44,243,0.2)] hover:border-purple-500/30 transition-all duration-200"
            >
              {/* === BACKGROUND GLOW EFFECT === */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-700/5 via-transparent to-cyan-700/5 pointer-events-none" />

              {/* === HEADER === */}
              <div className="relative flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {group.name}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {group.labIds.length} Labs • {group.starpathIds.length} Starpaths
                  </p>
                </div>

                <span className="mt-2 sm:mt-0 text-xs text-gray-400 bg-[#0e1624] px-3 py-1 rounded-full border border-white/10">
                  Private Group
                </span>
              </div>

              {/* === VISUAL INDICATORS === */}
              <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                {/* Labs preview */}
                <div className="p-3 rounded-lg bg-[#0d1220]/80 border border-orange-400/10">
                  <p className="text-sm font-medium text-orange-300 mb-1">
                    Labs Overview
                  </p>
                  <div className="h-2 w-full rounded-full bg-[#1e2633] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-400 via-purple-400 to-sky-400"
                      style={{
                        width: `${Math.min(group.labIds.length * 20, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {group.labIds.length > 0
                      ? `Contains ${group.labIds.length} collaborative labs.`
                      : "No labs yet in this group."}
                  </p>
                </div>

                {/* Starpaths preview */}
                <div className="p-3 rounded-lg bg-[#0d1220]/80 border border-cyan-400/10">
                  <p className="text-sm font-medium text-cyan-300 mb-1">
                    Starpaths Overview
                  </p>
                  <div className="h-2 w-full rounded-full bg-[#1e2633] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-400 via-purple-400 to-pink-400"
                      style={{
                        width: `${Math.min(group.starpathIds.length * 25, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {group.starpathIds.length > 0
                      ? `Includes ${group.starpathIds.length} starpaths to explore.`
                      : "No starpaths assigned."}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}
