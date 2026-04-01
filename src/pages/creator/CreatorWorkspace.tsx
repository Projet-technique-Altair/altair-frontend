// src/pages/creator/CreatorWorkspace.tsx

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { Layers, Orbit, Users } from "lucide-react";

import { api } from "@/api";
import { getMyStarpaths } from "@/api/starpaths";

import DashboardCard from "@/components/ui/DashboardCard";

import CreatorLabCard from "@/pages/creator/components/CreatorLabCard";
import CreatorGroupCard from "@/pages/creator/components/CreatorGroupCard";
import CreatorStarpathCard from "@/pages/creator/components/CreatorStarpathCard";

/* ================= TYPES ================= */
type Focus = "labs" | "groups" | "starpaths";

type LabDifficulty = "beginner" | "intermediate" | "advanced";

type CreatorLab = {
  id: string;
  title: string;
  createdAt: string;
  difficulty: LabDifficulty; // ✅ aligné avec LabCard
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
};

/* ================= NORMALIZE ================= */

function normalizeDifficulty(d: string): LabDifficulty {
  const val = d?.toLowerCase();

  if (val === "beginner") return "beginner";
  if (val === "intermediate") return "intermediate";
  if (val === "advanced") return "advanced";

  return "beginner"; // fallback safe
}

function normalizeLab(raw: any, stepsCount: number): CreatorLab {
  return {
    id: raw.lab_id,
    title: raw.name,
    createdAt:
      raw.updated_at ??
      raw.date_of_creation ??
      new Date().toISOString(),

    difficulty: normalizeDifficulty(raw.difficulty), // ✅ FIX

    duration: raw.estimated_duration ?? "—",
    stepsCount,
    visibility: raw.visibility === "PUBLIC" ? "public" : "private",
    completed: raw.completed ?? false,
  };
}

/* ================= MAIN ================= */

export default function CreatorWorkspace() {
  const navigate = useNavigate();

  const [focus, setFocus] = useState<Focus>("labs");
  const [labs, setLabs] = useState<CreatorLab[]>([]);
  const [groups, setGroups] = useState<CreatorGroup[]>([]);
  const [starpaths, setStarpaths] = useState<CreatorStarpath[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [rawLabs, rawGroups, rawStarpaths] = await Promise.all([
          api.getMyLabs(),
          api.getMyGroups(),
          getMyStarpaths(),
        ]);

        if (cancelled) return;

        setGroups(rawGroups);
        setStarpaths(rawStarpaths);

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

        if (!cancelled) setLabs(labsWithSteps);
      } catch (err) {
        console.error("Workspace error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ================= DERIVED ================= */
  const activeLabs = useMemo(
    () => labs.filter((l) => !l.completed),
    [labs]
  );

  const createPath = useMemo(() => {
    if (focus === "labs") return "/creator/labs/new";
    if (focus === "groups") return "/creator/groups/new";
    return "/creator/starpaths/new";
  }, [focus]);

  /* ================= ACTIONS ================= */
  const handleDeleteLab = (id: string) =>
    setLabs((prev) => prev.filter((l) => l.id !== id));

  const handleToggleLab = (id: string) =>
    setLabs((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              visibility:
                l.visibility === "public" ? "private" : "public",
            }
          : l
      )
    );

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-white">
        <div className="animate-pulse text-white/50">
          Loading workspace…
        </div>
      </div>
    );
  }

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen text-white px-8 py-10 space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          Workspace
        </h1>

        <button
          onClick={() => navigate(createPath)}
          className="
            px-5 py-2 rounded-lg text-sm
            bg-purple-500/20 border border-purple-400/30 text-purple-300
            hover:bg-purple-500/30 hover:text-white transition-all
          "
        >
          + Create {focus.slice(0, -1)}
        </button>
      </div>

      {/* TABS */}
      <div className="flex gap-3">
        <Tab active={focus === "labs"} icon={<Layers size={16} />} label="Labs" count={activeLabs.length} onClick={() => setFocus("labs")} />
        <Tab active={focus === "groups"} icon={<Users size={16} />} label="Groups" count={groups.length} onClick={() => setFocus("groups")} />
        <Tab active={focus === "starpaths"} icon={<Orbit size={16} />} label="Starpaths" count={starpaths.length} onClick={() => setFocus("starpaths")} />
      </div>

      {/* CONTENT */}
      <DashboardCard className="p-6 backdrop-blur-xl border border-white/10">

        {focus === "labs" && (
          <GridOrEmpty items={activeLabs} emptyTitle="No labs yet" emptyAction="Create your first lab" onEmptyClick={() => navigate("/creator/labs/new")}>
            {activeLabs.map((lab) => (
              <CreatorLabCard
                key={lab.id}
                lab={lab}
                onDelete={() => handleDeleteLab(lab.id)}
                onToggleVisibility={() => handleToggleLab(lab.id)}
              />
            ))}
          </GridOrEmpty>
        )}

        {focus === "groups" && (
          <GridOrEmpty items={groups} emptyTitle="No groups yet" emptyAction="Create your first group" onEmptyClick={() => navigate("/creator/groups/new")}>
            {groups.map((group) => (
              <CreatorGroupCard key={group.group_id} group={group} />
            ))}
          </GridOrEmpty>
        )}

        {focus === "starpaths" && (
          <GridOrEmpty items={starpaths} emptyTitle="No starpaths yet" emptyAction="Create your first starpath" onEmptyClick={() => navigate("/creator/starpaths/new")}>
            {starpaths.map((sp) => (
              <CreatorStarpathCard key={sp.starpath_id} starpath={sp} />
            ))}
          </GridOrEmpty>
        )}

      </DashboardCard>
    </div>
  );
}

/* ================= REUSABLE ================= */

function GridOrEmpty({ items, emptyTitle, emptyAction, onEmptyClick, children }: any) {
  if (!items?.length) {
    return <EmptyState title={emptyTitle} action={emptyAction} onClick={onEmptyClick} />;
  }

  return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{children}</div>;
}

function Tab({ active, icon, label, count, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all backdrop-blur-md border ${
        active
          ? "bg-white/10 border-white/20 text-white shadow-[0_0_20px_rgba(139,92,246,0.2)]"
          : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
      }`}
    >
      {icon}
      <span>{label}</span>
      <span className="text-xs text-white/50">{count}</span>
    </button>
  );
}

function EmptyState({ title, action, onClick }: any) {
  return (
    <div className="text-center py-16 space-y-4">
      <p className="text-white/60">{title}</p>
      <button
        onClick={onClick}
        className="px-4 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all"
      >
        {action}
      </button>
    </div>
  );
}