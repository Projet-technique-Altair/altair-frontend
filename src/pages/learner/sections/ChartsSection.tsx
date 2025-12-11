// src/pages/learner/sections/ChartsSection.tsx

/**
 * @file ChartsSection — learner analytics and domain visualization.
 *
 * @remarks
 * This section is part of the Learner Dashboard.
 * It displays:
 * - A circular progress chart representing the learner’s **overall progress**
 * - A bar chart representing the number of **domains explored** (labs + starpaths)
 *
 * Combines data from both the `labs` and `starpaths` arrays using helper functions:
 * - {@link computeOverallProgress}
 * - {@link computeDomainStats}
 *
 * Built using Recharts and Framer Motion for smooth animated visuals.
 *
 * @packageDocumentation
 */
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import type { Lab, Starpath } from "@/api";
import DashboardCard from "@/components/ui/DashboardCard";
import SectionTitle from "@/components/ui/SectionTitle";
import { computeOverallProgress, computeDomainStats } from "@/lib/statistics";
import { ALT_COLORS } from "@/lib/theme";

/**
 * Props for the {@link ChartsSection} component.
 */
interface ChartsSectionProps {
  labs: Lab[];
  starpaths: Starpath[];
}


/**
 * Displays learner statistics as interactive charts.
 *
 * @remarks
 * This section is typically used inside the {@link LearnerDashboard}.
 * It provides visual insight into overall learning completion and domain diversity.
 *
 * @example
 * ```tsx
 * <ChartsSection labs={labs} starpaths={starpaths} />
 * ```
 *
 * @returns JSX component rendering two visual dashboards.
 *
 * @public
 */
export default function ChartsSection({ labs, starpaths }: ChartsSectionProps) {
  const overallProgress = computeOverallProgress(labs);
  const domains = computeDomainStats(labs, starpaths);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* === GLOBAL PROGRESS (CIRCLE CHART) === */}
      <DashboardCard className="flex flex-col items-center justify-center p-8 relative overflow-hidden">
        <SectionTitle
          text="Overall Learning Progress"
          gradient={`linear-gradient(90deg, ${ALT_COLORS.blue}, ${ALT_COLORS.purple}, ${ALT_COLORS.orange})`}
        />

        {/* Invisible gradient defs */}
        <svg style={{ position: "absolute", visibility: "hidden" }}>
          <defs>
            <linearGradient id="grad" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ALT_COLORS.orange} />
              <stop offset="50%" stopColor={ALT_COLORS.purple} />
              <stop offset="100%" stopColor={ALT_COLORS.blue} />
            </linearGradient>
          </defs>
        </svg>

        <motion.div
          className="relative w-[220px] h-[220px] flex items-center justify-center"
          initial={{ opacity: 0, rotate: -90 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ duration: 1 }}
        >
          <svg
            className="absolute w-full h-full -rotate-90"
            viewBox="0 0 100 100"
          >
            {/* background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="#1a1f2b"
              strokeWidth="10"
              fill="none"
            />
            {/* animated gradient stroke */}
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              stroke="url(#grad)"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: overallProgress / 100 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
          </svg>

          {/* center value */}
          <span
            className="text-4xl font-bold"
            style={{
              background: `linear-gradient(90deg, ${ALT_COLORS.blue}, ${ALT_COLORS.purple}, ${ALT_COLORS.orange})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {overallProgress}%
          </span>
        </motion.div>
      </DashboardCard>

      {/* === DOMAINS BAR CHART === */}
      <DashboardCard className="p-6 relative overflow-hidden">
        <SectionTitle
          text="Domains Explored"
          gradient={`linear-gradient(90deg, ${ALT_COLORS.orange}, ${ALT_COLORS.purple}, ${ALT_COLORS.blue})`}
        />

        {/* gradient defs for bars */}
        <svg style={{ position: "absolute", visibility: "hidden" }}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor={ALT_COLORS.orange} />
              <stop offset="50%" stopColor={ALT_COLORS.purple} />
              <stop offset="100%" stopColor={ALT_COLORS.blue} />
            </linearGradient>
          </defs>
        </svg>

        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={domains}>
              <XAxis
                dataKey="domain"
                stroke="#888"
                tick={{ fill: "#aaa", fontSize: 13 }}
              />
              <YAxis stroke="#888" tick={{ fill: "#aaa", fontSize: 13 }} />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                contentStyle={{
                  background: "rgba(15,20,30,0.9)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "#fff",
                  fontSize: 13,
                }}
                formatter={(value: number, name, props) => {
                  const domain = props.payload.domain;
                  const detail = props.payload.details;
                  return [
                    `Total: ${value}`,
                    domain === "Other"
                      ? `Includes: ${detail}`
                      : `Labs/Starpaths: ${detail}`,
                  ];
                }}
              />
              <Bar
                dataKey="count"
                radius={[6, 6, 0, 0]}
                fill="url(#barGradient)"
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </DashboardCard>
    </div>
  );
}
