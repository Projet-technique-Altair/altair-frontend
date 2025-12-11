/**
 * @file Reusable chart container component for visualizing lab or domain statistics.
 *
 * @remarks
 * The `ChartContainer` component provides a responsive bar chart layout
 * built with Recharts and styled with Altair's gradient color scheme.
 * It is primarily used for dashboard visualizations such as lab completion
 * metrics or domain distribution statistics.
 *
 * @packageDocumentation
 */

import * as React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";


/**
 * Props for the {@link ChartContainer} component.
 *
 * @property data - The dataset to be visualized, where each entry contains a `domain` label and its associated numeric `count`.
 *
 * @public
 */
interface ChartContainerProps {
  data: { domain: string; count: number }[];
}


/**
 * Renders a responsive bar chart displaying domain or category counts.
 *
 * @remarks
 * Includes:
 * - Responsive layout with automatic resizing
 * - Custom gradient color styling (Altair theme)
 * - Styled tooltip with domain count summary
 *
 * Used in dashboards and analytics views to display lab distributions or performance metrics.
 *
 * @param props - {@link ChartContainerProps} defining chart data and domains.
 * @returns A React JSX element rendering a bar chart visualization.
 *
 * @public
 */
export function ChartContainer({ data }: ChartContainerProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis dataKey="domain" stroke="#888" tick={{ fill: "#aaa" }} />
        <YAxis stroke="#888" tick={{ fill: "#aaa" }} />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.05)" }}
          contentStyle={{
            background: "rgba(15,20,30,0.9)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            color: "#fff",
          }}
          formatter={(value: number) => [`Total : ${value} items`, ""]}
        />
        <Bar
          dataKey="count"
          radius={[6, 6, 0, 0]}
          fill="url(#barGradient)"
          barSize={32}
        />
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4facfe" />
            <stop offset="50%" stopColor="#d16ba5" />
            <stop offset="100%" stopColor="#ff7e29" />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
}
