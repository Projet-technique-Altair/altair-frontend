// src/pages/learner/LearnerExplorer.tsx

/**
 * @file LearnerExplorer — discovery page for new labs and starpaths.
 *
 * @remarks
 * This page allows learners to explore newly released **Labs** and **Starpaths**.
 * It provides:
 *  - A global search bar for filtering items by name
 *  - Two responsive sections:
 *      1. 🧪 New Labs (short exercises)
 *      2. 🌠 New Starpaths (longer guided learning paths)
 *
 * The page uses mock data (`mockNewLabs`, `mockNewStarpaths`) for now.
 * Each card displays metadata such as level, rating, and participant count.
 *
 * Route: `/learner/explorer`
 *
 * @packageDocumentation
 */
import { useState, useMemo, useEffect } from "react";
import SearchBar from "@/components/ui/SearchBar";
import SectionTitle from "@/components/ui/SectionTitle";
import DashboardCard from "@/components/ui/DashboardCard";
import { Star } from "lucide-react";
import { ALT_COLORS } from "@/lib/theme";
import { useNavigate } from "react-router-dom";

import { getLabs } from "@/api/labs";
import { getStarpaths } from "@/api/starpaths";

import type { Lab } from "@/contracts/labs";
import type { Starpath } from "@/contracts/starpaths";

// ===== MAPPERS =====
function mapLabToExplorer(lab: Lab) {
  return {
    id: lab.lab_id,
    name: lab.name,
    level:
      lab.difficulty === "EASY"
        ? "Beginner"
        : lab.difficulty === "MEDIUM"
        ? "Intermediate"
        : lab.difficulty === "HARD"
        ? "Advanced"
        : "Unknown",
    domain: lab.category ?? "General",
    rating: 0,
    participants: 0,
  };
}

function mapStarpathToExplorer(sp: Starpath) {
  return {
    id: sp.starpath_id,
    name: sp.name,
    domain: sp.difficulty ?? "General",
    chaptersCompleted: 0,
    totalChapters: 0,
    labs: 0,
    rating: 0,
    participants: 0,
  };
}

/**
 * Displays the **Explorer** page where learners can browse
 * recently added Labs and Starpaths.
 *
 * @remarks
 * - Includes client-side search filtering.
 * - Uses a responsive grid layout with animated hover effects.
 * - Designed to inspire learners to start new challenges or courses.
 *
 * @example
 * ```tsx
 * <Route path="/learner/explorer" element={<LearnerExplorer />} />
 * ```
 *
 * @returns A discovery interface listing new labs and starpaths.
 *
 * @public
 */


export default function LearnerExplorer() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const [labs, setLabs] = useState<any[]>([]);
  const [starpaths, setStarpaths] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [labsData, starpathsData] = await Promise.all([
          getLabs(),
          getStarpaths(),
        ]);

        // 🔥 FILTRAGE CORRECT (attention MAJUSCULE)
        const publicLabs = labsData.filter(
          (lab: Lab) => lab.visibility === "PUBLIC"
        );

        const publicStarpaths = starpathsData.filter(
          (sp: Starpath) => sp.visibility === "PUBLIC"
        );

        setLabs(publicLabs.map(mapLabToExplorer));
        setStarpaths(publicStarpaths.map(mapStarpathToExplorer));
      } catch (err) {
        console.error(err);
        setError("Failed to load explorer");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ===== SEARCH =====
  const filteredLabs = useMemo(
    () =>
      labs.filter((lab) =>
        lab.name.toLowerCase().includes(query.toLowerCase())
      ),
    [labs, query]
  );

  const filteredStarpaths = useMemo(
    () =>
      starpaths.filter((sp) =>
        sp.name.toLowerCase().includes(query.toLowerCase())
      ),
    [starpaths, query]
  );

  if (loading) return <div className="p-10">Loading...</div>;
  if (error) return <div className="p-10 text-red-400">{error}</div>;

  return (
    <div className="min-h-screen w-full px-8 py-8 bg-[#0B0F19] text-white space-y-10">
      {/* === HEADER === */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <h1
          className="text-3xl font-bold"
          style={{
            background: `linear-gradient(90deg, ${ALT_COLORS.blue}, ${ALT_COLORS.purple}, ${ALT_COLORS.orange})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Explore new Labs & Starpaths
        </h1>
        <SearchBar value={query} onChange={setQuery} />
      </div>

      {/* === NEW LABS === */}
      <section>
        <SectionTitle
          text="🧪 New Labs"
          gradient={`linear-gradient(90deg, ${ALT_COLORS.purple}, ${ALT_COLORS.orange})`}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredLabs.map((lab) => (
            <DashboardCard
              key={lab.id}
              onClick={() => navigate(`/learner/labs/${lab.id}`)}
              className="cursor-pointer border border-white/5 hover:border-sky-500/50 transition-all"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">{lab.name}</h3>

                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    lab.level === "Beginner"
                      ? "bg-green-500/20 text-green-400 border border-green-400/30"
                      : lab.level === "Intermediate"
                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-400/30"
                      : "bg-red-500/20 text-red-400 border border-red-400/30"
                  }`}
                >
                  {lab.level}
                </span>
              </div>

              <p className="text-sm text-gray-400 mb-3">{lab.domain}</p>

              <div className="flex items-center justify-between text-sm text-gray-300">
                <div className="flex items-center gap-1">
                  <Star className="text-yellow-400 h-4 w-4" />
                  {lab.rating.toFixed(1)}
                </div>
                <span>{lab.participants} learners</span>
              </div>
            </DashboardCard>
          ))}
        </div>
      </section>

      {/* === NEW STARPATHS === */}
      <section>
        <SectionTitle
          text="🌠 New Starpaths"
          gradient={`linear-gradient(90deg, ${ALT_COLORS.blue}, ${ALT_COLORS.purple})`}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredStarpaths.map((sp) => (
            <DashboardCard
              key={sp.id}
              onClick={() => navigate(`/learner/starpaths/${sp.id}`)}
              className="cursor-pointer border border-white/5 hover:border-purple-500/50 transition-all"
            >
              <h3 className="text-lg font-semibold mb-1">{sp.name}</h3>
              <p className="text-sm text-gray-400 mb-3">{sp.domain}</p>

              <div className="flex justify-between text-sm text-gray-300 mb-1">
                <span>
                  {sp.chaptersCompleted}/{sp.totalChapters} chapters • {sp.labs} labs
                </span>
                <span className="flex items-center gap-1">
                  <Star className="text-yellow-400 h-4 w-4" />
                  {sp.rating.toFixed(1)}
                </span>
              </div>

              <div className="text-xs text-gray-400">
                {sp.participants} learners following
              </div>
            </DashboardCard>
          ))}
        </div>
      </section>
    </div>
  );
}
