/**
 * @file Gradient text utility component for Altair UI.
 *
 * @remarks
 * The `GradientText` component renders text content filled with a customizable
 * linear gradient instead of a solid color. It is primarily used for headings,
 * key highlights, or accent elements across the Altair interface.
 *
 * It applies cross-browser compatible CSS clipping and transparency techniques
 * to create smooth gradient text rendering while preserving accessibility.
 *
 * @packageDocumentation
 */

import React from "react";


/**
 * Props for the {@link GradientText} component.
 *
 * @property text - Optional plain string to display as the gradient text.
 * @property gradient - CSS gradient string defining the color transition (default is Altair’s blue–purple–orange gradient).
 * @property className - Optional custom CSS or Tailwind classes to extend or override default styles.
 * @property children - Optional React nodes to render instead of the `text` prop.
 *
 * @public
 */
interface GradientTextProps {
  text?: string;
  gradient?: string;
  className?: string;
  children?: React.ReactNode;
}


/**
 * Renders gradient-styled text consistent with Altair's branding.
 *
 * @remarks
 * Uses `background-clip: text` and transparent fill for a clean, multi-tone gradient effect.
 * Supports both direct text input through `text` and nested content via `children`.
 *
 * @param props - {@link GradientTextProps} defining content, gradient style, and additional classes.
 * @returns A React JSX element rendering gradient-colored text.
 *
 * @public
 */
export function GradientText({
  text,
  gradient = "linear-gradient(90deg, #4facfe, #d16ba5, #ff7e29)",
  className = "",
  children,
}: GradientTextProps) {
  return (
    <span
      className={`bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage: gradient,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      {text || children}
    </span>
  );
}
