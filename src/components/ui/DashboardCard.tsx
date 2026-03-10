/**
 * @file Reusable dashboard card container for Altair UI layouts.
 *
 * @remarks
 * The `DashboardCard` component acts as a universal wrapper for dashboard content blocks,
 * ensuring consistent Altair aesthetics with smooth transitions, blur effects,
 * and unified shadows across the learner and creator dashboards.
 *
 * @packageDocumentation
 */

import React from "react";
import { ALT_SHADOW } from "@/lib/theme";



/**
 * Renders a styled container for dashboard elements following Altair’s visual identity.
 *
 * @remarks
 * Includes:
 * - Rounded 2XL corners and smooth transitions
 * - Transparent blurred background for depth
 * - Subtle hover feedback
 * - Consistent global shadow style from {@link ALT_SHADOW}
 *
 * @param children - The content elements rendered inside the card.
 * @param className - Optional CSS classes to extend the default style.
 * @returns A React JSX element rendering a dashboard card container.
 *
 * @public
 */
export default function DashboardCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "rounded-2xl p-6 transition-all duration-200",
        "bg-transparent backdrop-blur-sm", // ✅ plus de fond opaque
        "hover:bg-white/[0.02]",           // léger survol subtil
        className,
      ].join(" ")}
      style={{
        boxShadow: ALT_SHADOW.card,
      }}
    >
      {children}
    </div>
  );
}
