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
import { useState, useMemo } from "react";
import SearchBar from "@/components/ui/SearchBar";
import SectionTitle from "@/components/ui/SectionTitle";
import DashboardCard from "@/components/ui/DashboardCard";
import { Star } from "lucide-react";
import { mockNewLabs, mockNewStarpaths } from "@/api";
import { ALT_COLORS } from "@/lib/theme";


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

  // === Filters ===
  const filteredLabs = useMemo(
    () =>
      mockNewLabs.filter((lab) =>
        lab.name.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );

  const filteredStarpaths = useMemo(
    () =>
      mockNewStarpaths.filter((sp) =>
        sp.name.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );

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
              className="border border-white/5 hover:border-sky-500/50 transition-all shadow-[0_0_20px_rgba(0,0,0,0.3)]"
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
              className="border border-white/5 hover:border-purple-500/50 transition-all shadow-[0_0_20px_rgba(0,0,0,0.3)]"
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
