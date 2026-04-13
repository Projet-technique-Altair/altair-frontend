// src/hooks/useLabTimer.ts
/**
 * @file Hook for tracking elapsed lab session time in Altair.
 *
 * @remarks
 * The `useLabTimer` hook provides a simple timer that counts
 * the elapsed time (in seconds) since the component was mounted.
 * It updates automatically every second and returns both the raw
 * counter value and a formatted string representation (`MM:SS`).
 *
 * Commonly used within the lab interface header to display
 * session duration or time tracking for learners.
 *
 * @packageDocumentation
 */

import { useEffect, useState } from "react";

/**
 * Tracks the elapsed session time during a lab.
 *
 * @remarks
 * - Starts counting immediately upon mount.
 * - Increments every second using an internal interval.
 * - Automatically cleans up on component unmount.
 *
 * Returns both the total elapsed seconds and a formatted timer string (`MM:SS`).
 *
 * @returns An object containing:
 * - `seconds`: The total elapsed time in seconds.
 * - `formatted`: The time formatted as a `MM:SS` string.
 *
 * @example
 * const { formatted } = useLabTimer();
 * // → "04:32"
 *
 * @public
 */
export function useLabTimer(initialSeconds = 0) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatted = `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

  return { seconds, formatted };
}
