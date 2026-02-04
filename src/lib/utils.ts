import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * @file Utility function for safely merging Tailwind CSS class names.
 *
 * @remarks
 * The `cn` helper combines multiple conditional or dynamic class name inputs
 * into a single deduplicated string.  
 * It uses both `clsx` (for conditional logic) and `tailwind-merge`
 * (for resolving conflicting Tailwind utility classes).
 *
 * Commonly used across all Altair UI components to keep class expressions clean,
 * readable, and consistent with the design system.
 *
 * @packageDocumentation
 */


/**
 * Merges multiple class name inputs into a single valid Tailwind string.
 *
 * @param inputs - One or more class name values (strings, arrays, or objects)
 * that can include conditional entries.
 *
 * @returns A single, space-separated, conflict-free class name string.
 *
 * @public
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
