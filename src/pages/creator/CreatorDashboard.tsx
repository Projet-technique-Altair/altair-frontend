// src/pages/creator/CreatorDashboard.tsx

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { api } from "@/api";
import DashboardCard from "@/components/ui/DashboardCard";
import { ALT_COLORS } from "@/lib/theme";

import CreatorLabCard from "@/pages/creator/components/CreatorLabCard";
import CreatorGroupCard from "@/pages/creator/components/CreatorGroupCard";

import { getMyStarpaths } from "@/api/starpaths";
import CreatorStarpathCard from "@/pages/creator/components/CreatorStarpathCard";

export type CreatorLab = {
  id: string;
  title: string;
  createdAt: string;
  difficulty: string;
  duration: string;
  stepsCount: number;
  visibility: "public" | "private";
  completed: boolean;
};

type CreatorGroup = {
  group_id: string;
  name: string;
  created_at: string;
  members_count?: number;
  labs_count?: number;
};

type CreatorStarpath = {
  starpath_id: string;
  name: string;
  created_at?: string;
  difficulty?: string;
  labs_count?: number;
};

function normalizeLab(
  raw: {
    lab_id: string;
    name: string;
    updated_at?: string;
    date_of_creation?: string;
    difficulty?: string | null;
    estimated_duration?: string | null;
    visibility?: "PUBLIC" | "PRIVATE"; // ✅ FIX
    completed?: boolean;
  },
  stepsCount: number
): CreatorLab {
  return {
    id: raw.lab_id,
    title: raw.name,
    createdAt:
      raw.updated_at ??
      raw.date_of_creation ??
      new Date().toISOString(),

    difficulty: raw.difficulty ?? "unknown",
    duration: raw.estimated_duration ?? "—",
    stepsCount,
    visibility:
      raw.visibility === "PUBLIC"
        ? "public"
        : "private",

    completed: raw.completed ?? false,
  };
}

export default function CreatorDashboard() {
  const navigate = useNavigate();

  const [labs, setLabs] = useState<CreatorLab[]>([]);
  const [groups, setGroups] = useState<CreatorGroup[]>([]);
  const [starpaths, setStarpaths] = useState<CreatorStarpath[]>([]);

  const KEYCLOAK_LOGOUT = "http://localhost:8080/realms/altair/protocol/openid-connect/logout";

  const [loading, setLoading] = useState(true);


  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const rawLabs = await api.getMyLabs();

        const rawGroups = await api.getMyGroups();
        setGroups(rawGroups as CreatorGroup[]);

        const rawStarpaths = await getMyStarpaths();
        setStarpaths(rawStarpaths as CreatorStarpath[]);

        const labsWithSteps = await Promise.all(
          rawLabs.map(async (lab) => {
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

      {/* LABS */}
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

      {/* GROUPS */}
      <DashboardCard className="p-6">
        <div className="flex justify-between items-center mb-4">

          <h2 className="text-lg font-semibold text-purple-400">
            Your Groups
          </h2>

          <button
            onClick={() => navigate("/creator/groups/new")}
            className="px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30"
          >
            + Create group
          </button>

        </div>

        {groups.length === 0 ? (
          <p className="text-gray-500 italic text-sm">No groups yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <CreatorGroupCard
                key={group.group_id}
                group={group}
              />
            ))}
          </div>
        )}

      </DashboardCard>
      {/* STARPATHS */}
      <DashboardCard className="p-6">
        <div className="flex justify-between items-center mb-4">

          <h2 className="text-lg font-semibold text-orange-400">
            Your Starpaths
          </h2>

          <button
            onClick={() => navigate("/creator/starpaths/new")}
            className="px-4 py-2 rounded-lg bg-orange-500/20 hover:bg-orange-500/30"
          >
            + Create starpath
          </button>

        </div>

        {starpaths.length === 0 ? (
          <p className="text-gray-500 italic text-sm">
            No starpaths yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {starpaths.map((starpath) => (
              <CreatorStarpathCard
                key={starpath.starpath_id}
                starpath={starpath}
              />
            ))}
          </div>
        )}
      </DashboardCard>

    </div>
  );
}
