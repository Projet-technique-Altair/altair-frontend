// src/lib/theme.ts

/**
 * @file Global design tokens and visual constants for the Altair front-end.
 *
 * @remarks
 * This module centralizes Altair’s design language — including its color palette,
 * gradients, shadows, and typography settings — for consistent visual identity
 * across all UI components and layouts.
 *
 * It is used by components such as dashboards, cards, and lab pages
 * to apply shared color themes and visual effects.
 *
 * @packageDocumentation
 */

// === PRIMARY COLOR PALETTE ===
/**
 * Defines the main color palette used across the Altair interface.
 *
 * @remarks
 * The palette covers brand colors (blue, purple, orange) and utility tones
 * (green, cyan, dark surfaces, and text defaults).
 *
 * @public
 */
export const ALT_COLORS = {
  blue: "#2AA7FF",
  purple: "#7A2CF3",
  orange: "#FF8C4A",
  green: "#2ECC71",
  greenStrong: "#16A34A",
  cyan: "#00D8FF",
  dark: "#0B0F19",
  surface: "#0E1323",
  text: "#E2E8F0",
};


// === SHADOWS AND VISUAL DEPTH ===
/**
 * Collection of reusable shadow presets to maintain consistent depth and glow effects.
 *
 * @remarks
 * These shadows are typically used for cards, hover states, and accent highlights.
 *
 * @public
 */
export const ALT_SHADOW = {
  card: "0 0 25px rgba(122, 44, 243, 0.25)",
  hover: "0 0 35px rgba(122, 44, 243, 0.45)",
  soft: "0 0 20px rgba(42, 167, 255, 0.3)",
  orange: "0 0 20px rgba(255, 140, 74, 0.35)",
};


// === GRADIENTS ===
/**
 * Predefined CSS gradient combinations aligned with Altair’s brand identity.
 *
 * @remarks
 * These gradients are used for text overlays, backgrounds, and progress bars.
 *
 * @public
 */
export const ALT_GRADIENTS = {
  primary: `linear-gradient(90deg, ${ALT_COLORS.blue}, ${ALT_COLORS.purple}, ${ALT_COLORS.orange})`,
  purpleToBlue: `linear-gradient(90deg, ${ALT_COLORS.purple}, ${ALT_COLORS.blue})`,
  orangeToPurple: `linear-gradient(90deg, ${ALT_COLORS.orange}, ${ALT_COLORS.purple})`,
  blueToOrange: `linear-gradient(90deg, ${ALT_COLORS.blue}, ${ALT_COLORS.orange})`,
};


// === TYPOGRAPHY ===
/**
 * Font families used across the application for headings and body text.
 *
 * @remarks
 * Both properties currently use the Inter family to ensure consistent UI typography.
 *
 * @public
 */
export const ALT_FONT = {
  heading: "Inter, sans-serif",
  body: "Inter, sans-serif",
};
