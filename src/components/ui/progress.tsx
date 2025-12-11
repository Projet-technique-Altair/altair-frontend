// src/components/ui/progress.tsx
/**
 * @file Progress bar UI component for Altair interface elements.
 *
 * @remarks
 * The `Progress` component renders a simple, customizable progress indicator.
 * It visually represents completion percentage for labs, downloads,
 * or other measurable progress metrics.
 *
 * Designed with Tailwind utility classes and supports flexible styling through
 * custom class names for both the container and indicator bar.
 *
 * @packageDocumentation
 */


import * as React from "react";
import { cn } from "@/lib/utils";


/**
 * Props for the {@link Progress} component.
 *
 * @property value - Current progress percentage (0–100). Defaults to `0`.
 * @property indicatorClassName - Optional class name to customize the color or style of the progress indicator.
 * @property className - Optional class name to customize the container’s appearance.
 *
 * @public
 */
interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  indicatorClassName?: string;
}


/**
 * Renders a customizable horizontal progress bar.
 *
 * @remarks
 * Includes:
 * - Rounded container with background color
 * - Smooth transition animation on progress updates
 * - Optional custom styling via `className` and `indicatorClassName`
 *
 * Frequently used to represent user progress within labs, starpaths, or dashboards.
 *
 * @param props - {@link ProgressProps} defining progress value and custom styles.
 * @returns A React JSX element rendering a progress bar visualization.
 *
 * @public
 */
export default function Progress({
  value = 0,
  className,
  indicatorClassName,
  ...props
}: ProgressProps) {
  return (
    <div
      className={cn(
        "relative w-full h-2 rounded-full bg-slate-800 overflow-hidden",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-300",
          indicatorClassName
        )}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
