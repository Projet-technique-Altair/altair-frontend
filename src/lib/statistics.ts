/**
 * @file Statistical utilities for learner and creator dashboards.
 *
 * @remarks
 * This module provides pure utility functions for computing aggregated
 * progress and domain-based statistics from Altair’s mock data sources.
 * It is primarily used within dashboards and analytics views
 * to summarize a learner’s activity and course distribution.
 *
 * Includes:
 * - Global progress computation across all labs
 * - Domain-level aggregation across labs and starpaths
 *
 * @packageDocumentation
 */

import type { Lab, Starpath } from "@/api/mock";

/** Shape of computed domain-level data. */
type DomainData = { domain: string; count: number; details?: string };

/**
 * Computes the overall average progress across all labs.
 *
 * @remarks
 * The function sums the individual lab progress values and divides
 * by the total number of labs. Returns `0` if no labs are provided.
 *
 * @param labs - Array of lab objects containing a `progress` field.
 * @returns The rounded mean progress percentage (0–100).
 *
 * @public
 */
export function computeOverallProgress(labs: Lab[]): number {
  if (!labs.length) return 0;
  const total = labs.reduce((sum, l) => sum + l.progress, 0);
  return Math.round(total / labs.length);
}


/**
 * Aggregates statistics by domain across labs and starpaths.
 *
 * @remarks
 * - Counts how many labs and starpaths belong to each domain.
 * - Sorts results in descending order by count.
 * - Groups the top three domains explicitly, and merges the remaining
 *   into an `"Other"` category with summarized details.
 * - Returns a compact array suitable for visual display in charts.
 *
 * @param labs - Array of lab objects, each with a `domain` and `name`.
 * @param starpaths - Array of starpath objects with similar structure.
 * @returns A list of domain-level statistics, each containing:
 * - `domain`: The name of the domain
 * - `count`: Total items in that domain
 * - `details`: Optional list of items or grouped subdomains
 *
 * @public
 */
export function computeDomainStats(labs: Lab[], starpaths: Starpath[]): DomainData[] {
  const counts: Record<string, number> = {};
  const details: Record<string, string[]> = {};

  [...labs, ...starpaths].forEach((item) => {
    const domain = item.domain || "Unknown";
    counts[domain] = (counts[domain] || 0) + 1;
    details[domain] = details[domain] || [];
    details[domain].push(item.name);
  });

  const sorted: DomainData[] = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([domain, count]) => ({ domain, count }));

  const top: DomainData[] = sorted.slice(0, 3);
  const rest: DomainData[] = sorted.slice(3);

  if (rest.length > 0) {
    top.push({
      domain: "Other",
      count: rest.reduce((acc, d) => acc + d.count, 0),
      details: rest.map((d) => `${d.domain} (${d.count})`).join(", "),
    });
  }

  return top.map((d) => ({
    ...d,
    details: d.details || details[d.domain]?.join(", "),
  }));
}
