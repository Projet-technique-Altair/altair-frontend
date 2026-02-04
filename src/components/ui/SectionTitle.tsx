/**
 * @file Animated section title component with gradient text for Altair UI.
 *
 * @remarks
 * The `SectionTitle` component renders a stylized title with an optional glowing dot
 * and animated entrance. It is primarily used to label sections in dashboards,
 * lab explorers, and Starpath views while maintaining Altair’s gradient identity.
 *
 * Supports fully customizable gradients for both text and accent dot.
 *
 * @packageDocumentation
 */

import { motion } from "framer-motion";

/**
 * Props for the {@link SectionTitle} component.
 *
 * @property text - Main text content of the section title.
 * @property gradient - CSS gradient string applied to the title text.
 * @property count - Optional numerical counter displayed next to the title.
 * @property showDot - Whether to display a decorative colored dot on the left.
 * @property dotGradient - Optional CSS gradient for the dot; defaults to the same as the title.
 * @property className - Optional class names for layout or spacing customization.
 *
 * @public
 */
interface SectionTitleProps {
  text: string;

  gradient: string;

  count?: number;

  showDot?: boolean;

  dotGradient?: string;

  className?: string;
}


/**
 * Renders a gradient-styled section title with optional animated accent dot.
 *
 * @remarks
 * Includes:
 * - Gradient-filled text using CSS clipping
 * - Optional count indicator for contextual metadata
 * - Optional animated dot using Framer Motion
 * - Smooth entry animation and Altair color consistency
 *
 * Frequently used to introduce grouped sections within dashboards or explorer pages.
 *
 * @param props - {@link SectionTitleProps} defining text, gradient, and decoration options.
 * @returns A React JSX element rendering a styled and animated section title.
 *
 * @public
 */
export default function SectionTitle({
  text,
  gradient,
  count,
  showDot = false,
  dotGradient,
  className = "",
}: SectionTitleProps) {
  return (
    <div
      className={`flex items-center gap-2 mb-4 ${className}`}
    >
      {/* === Dot décorative (optionnelle) === */}
      {showDot && (
        <motion.span
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{
            background: dotGradient ?? gradient,
            boxShadow: `0 0 10px ${dotGradient ?? gradient}`,
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      )}

      {/* === Titre principal === */}
      <h2
        className="text-lg font-semibold tracking-tight"
        style={{
          background: gradient,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {text}
        {typeof count === "number" && (
          <span className="ml-1 text-gray-400 font-normal">
            ({count})
          </span>
        )}
      </h2>
    </div>
  );
}
