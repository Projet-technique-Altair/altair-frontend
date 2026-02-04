// src/pages/learner/StarpathView.tsx

/**
 * @file StarpathView — displays detailed information about a single Starpath.
 *
 * @remarks
 * This page is accessed when a learner selects a Starpath from their dashboard
 * or explorer view. It loads the corresponding Starpath by its ID and shows:
 *
 *  - The Starpath title, progress, and domain
 *  - A visual representation via the `StarpathVisualizer` component
 *  - Descriptive information about the Starpath’s content and purpose
 *
 * If the Starpath ID is invalid or not found, a fallback screen provides a
 * redirection option back to the learner dashboard.
 *
 * Route: `/learner/starpath/:id`
 *
 * @packageDocumentation
 */
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getStarpathById, Starpath } from "@/api/mockStarpaths";
import StarpathVisualizer from "@/components/starpath/StarpathVisualizer";
import DashboardCard from "@/components/ui/DashboardCard";
import { ALT_COLORS } from "@/lib/theme";


/**
 * Displays a specific Starpath page with interactive visualization and details.
 *
 * @remarks
 * - Uses `useParams` to extract the Starpath ID from the route.
 * - Fetches Starpath data via the `getStarpathById` mock API.
 * - Integrates the `StarpathVisualizer` component for graphical progress display.
 *
 * @example
 * ```tsx
 * <Route path="/learner/starpath/:id" element={<StarpathView />} />
 * ```
 *
 * @returns A page showing the Starpath name, progress, visualization, and info.
 *
 * @public
 */
export default function StarpathView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [starpath, setStarpath] = useState<Starpath | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    console.log("🔍 StarpathView looking for ID:", id);
    const normalizedId = id.toLowerCase().includes("blue")
      ? "s1"
      : id.toLowerCase().includes("red")
      ? "s2"
      : id.toLowerCase().includes("admin")
      ? "s3"
      : id;

    getStarpathById(normalizedId).then((sp) => {
      console.log("✅ Found:", sp);
      setStarpath(sp || null);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading Starpath...</div>
      </div>
    );
  }

  if (!starpath) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-red-400 mb-4">
          Starpath Not Found
        </h1>
        <button
          onClick={() => navigate("/learner/dashboard")}
          className="px-4 py-2 rounded-full bg-[#1E293B] text-sky-400 hover:bg-sky-400/10 border border-sky-400/40 transition"
        >
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full px-8 py-10 bg-[#0B0F19] text-white space-y-10">
      {/* === HEADER === */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{
              background: `linear-gradient(90deg, ${ALT_COLORS.blue}, ${ALT_COLORS.purple}, ${ALT_COLORS.orange})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {starpath.name}
          </h1>
          <p className="text-gray-400 mt-1">
            Progression actuelle :{" "}
            <span className="text-sky-400 font-semibold">
              {starpath.progress}%
            </span>
          </p>
        </div>

        <button
          onClick={() => navigate("/learner/dashboard")}
          className="px-5 py-2 rounded-full bg-gradient-to-r from-[#2AA7FF] via-[#7A2CF3] to-[#FF8C4A] font-medium hover:opacity-90 transition"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* === MAIN VISUALIZER === */}
      <DashboardCard>
        <StarpathVisualizer data={starpath} />
      </DashboardCard>

      {/* === INFO === */}
      <DashboardCard>
        <h2
          className="text-lg font-semibold mb-2"
          style={{
            background: `linear-gradient(90deg, ${ALT_COLORS.purple}, ${ALT_COLORS.orange})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          About this Starpath
        </h2>
        <p className="text-sm text-gray-300 leading-relaxed">
          This learning path focuses on advanced cybersecurity labs and
          hands-on exercises. Complete each step to unlock the next mission and
          earn Stardust rewards.
        </p>
      </DashboardCard>
    </div>
  );
}
