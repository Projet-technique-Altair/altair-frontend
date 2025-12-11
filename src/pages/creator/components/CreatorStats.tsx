/**
 * @file Creator Stats — overview metrics for the Creator Dashboard.
 *
 * @remarks
 * This component is part of the **Altair Creator Dashboard** and summarizes
 * high-level metrics for a content creator, including:
 *
 * - Total lab views
 * - Average lab rating
 * - Number of published starpaths
 * - Total number of learners enrolled across starpaths
 *
 * It aggregates data from the creator’s labs and starpaths to display key
 * performance indicators in a compact and visually consistent grid layout.
 *
 * @packageDocumentation
 */

import type { CreatorLab, CreatorStarpath } from "../CreatorDashboard";


/**
 * Props for the {@link CreatorStats} component.
 *
 * @property labs - List of labs created by the current user.
 * @property starpaths - List of starpaths created by the current user.
 *
 * @public
 */
interface CreatorStatsProps {
  labs: CreatorLab[];
  starpaths: CreatorStarpath[];
}

/**
 * Displays the creator’s overall statistics such as total views, average rating,
 * starpath count, and total learners.
 *
 * @remarks
 * - Computes aggregated metrics from the provided `labs` and `starpaths` arrays.
 * - Uses consistent color accents per metric (purple, blue, orange, green)
 *   aligned with Altair’s dashboard palette.
 * - Designed to be placed at the top of the Creator Dashboard for quick insights.
 *
 * @param labs - Array of labs containing views and ratings.
 * @param starpaths - Array of starpaths containing learner counts.
 *
 * @returns A responsive grid of dashboard statistic cards.
 *
 * @public
 */
export default function CreatorStats({ labs, starpaths }: CreatorStatsProps) {
  const totalViews = labs.reduce((sum, l) => sum + l.views, 0);
  const totalLearners = starpaths.reduce((sum, sp) => sum + sp.learners, 0);
  const avgRating = labs.length
    ? (labs.reduce((sum, l) => sum + l.rating, 0) / labs.length).toFixed(2)
    : "–";
  const totalStarpaths = starpaths.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* === TOTAL VIEWS === */}
      <div className="rounded-xl bg-[#111827]/70 p-4 text-center border border-white/10">
        <h3 className="text-purple-400 font-semibold">Total Views</h3>
        <p className="text-2xl font-bold text-white mt-1">{totalViews}</p>
      </div>

      {/* === AVERAGE RATING === */}
      <div className="rounded-xl bg-[#111827]/70 p-4 text-center border border-white/10">
        <h3 className="text-sky-400 font-semibold">Average Rating</h3>
        <p className="text-2xl font-bold text-white mt-1">{avgRating}</p>
      </div>

      {/* === STARPATH COUNT === */}
      <div className="rounded-xl bg-[#111827]/70 p-4 text-center border border-white/10">
        <h3 className="text-orange-400 font-semibold">Starpaths</h3>
        <p className="text-2xl font-bold text-white mt-1">{totalStarpaths}</p>
      </div>

      {/* === LEARNERS === */}
      <div className="rounded-xl bg-[#111827]/70 p-4 text-center border border-white/10">
        <h3 className="text-green-400 font-semibold">Learners</h3>
        <p className="text-2xl font-bold text-white mt-1">{totalLearners}</p>
      </div>
    </div>
  );
}
