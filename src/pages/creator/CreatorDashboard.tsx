// src/pages/creator/CreatorDashboard.tsx

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { api } from "@/api";
import DashboardCard from "@/components/ui/DashboardCard";
import { ALT_COLORS } from "@/lib/theme";

import { CreatorLabCard } from "@/pages/creator";

// Normalize backend labs → frontend format
/*function normalizeLab(raw: any) {
  return {
    id: raw.id ?? raw.lab_id ?? "unknown",
    title: raw.name ?? "Untitled Lab",
    createdAt: raw.created_at ?? "Unknown date",
    visibility: "public",
    completed: raw.completed ?? false,
    rating: raw.rating ?? 4.5,
    views: raw.views ?? 0,
    ...raw,
  };
}*/

function normalizeLab(raw: any, stepsCount: number) {
  return {
    id: raw.lab_id,
    title: raw.name,
    createdAt: raw.created_at,
    difficulty: raw.difficulty,
    duration: raw.estimated_duration,
    stepsCount,
    ...raw,
  };
}

export default function CreatorDashboard() {
  const navigate = useNavigate();

  const [labs, setLabs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // === FETCH LABS ONLY ===
  /*useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const rawLabs = await api.getMyLabs();
        if (!cancelled) {
          setLabs(rawLabs.map(normalizeLab));
        }
      } catch (err) {
        console.error("Failed to fetch labs:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);*/

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const rawLabs = await api.getMyLabs();

        const labsWithSteps = await Promise.all(
          rawLabs.map(async (lab: any) => {
            try {
              const steps = await api.getSteps(lab.lab_id);
              return normalizeLab(lab, steps.length);
            } catch {
              return normalizeLab(lab, 0);
            }
          })
        );

        if (!cancelled) {
          setLabs(labsWithSteps);
        }
      } catch (err) {
        console.error("Failed to fetch labs:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
}, []);

  // === ACTIVE LABS ONLY ===
  const activeLabs = useMemo(
    () => labs.filter((l) => !l.completed),
    [labs]
  );

  // === ACTIONS ===
  const handleDeleteLab = (id: string) =>
    setLabs((prev) => prev.filter((l) => l.id !== id));

  const handleToggleLab = (id: string) =>
    setLabs((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, visibility: l.visibility === "public" ? "private" : "public" }
          : l
      )
    );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-white">
        <div className="animate-pulse text-gray-400">Loading creator dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white px-8 py-10 space-y-10">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1
          className="text-3xl font-bold"
          style={{
            background: `linear-gradient(90deg, ${ALT_COLORS.purple}, ${ALT_COLORS.orange})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Creator — Active Labs
        </h1>

        <button
          onClick={() => navigate("/creator/labs/new")}
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-sky-400 via-purple-400 to-orange-400 hover:opacity-90"
        >
          + Create a lab
        </button>
      </div>

      {/* ACTIVE LABS ONLY */}
      <DashboardCard className="p-6">
        <h2 className="text-lg font-semibold text-sky-400 mb-4">
          Your Active Labs
        </h2>

        {activeLabs.length === 0 ? (
          <p className="text-gray-500 italic text-sm">No active labs.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeLabs.map((lab) => (
              <motion.div
                key={lab.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <CreatorLabCard
                  lab={lab}
                  onDelete={() => handleDeleteLab(lab.id)}
                  onToggleVisibility={() => handleToggleLab(lab.id)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
