// src/pages/creator/CreatorWorkspace.tsx

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { Layers, Orbit, Users } from "lucide-react";

import { api } from "@/api";
import { getMyStarpaths } from "@/api/starpaths";

import DashboardCard from "@/components/ui/DashboardCard";
import { ALT_COLORS } from "@/lib/theme";

import CreatorLabCard from "@/pages/creator/components/CreatorLabCard";
import CreatorGroupCard from "@/pages/creator/components/CreatorGroupCard";
import CreatorStarpathCard from "@/pages/creator/components/CreatorStarpathCard";

/* ================= TYPES ================= */
type Focus = "labs" | "groups" | "starpaths";

type CreatorLab = {
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
};

/* ================= NORMALIZE ================= */
function normalizeLab(raw: any, stepsCount: number): CreatorLab {
  return {
    id: raw.lab_id,
    title: raw.name,
    createdAt: raw.updated_at ?? raw.date_of_creation ?? new Date().toISOString(),
    difficulty: raw.difficulty ?? "unknown",
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
        const rawLabs = await api.getMyLabs();
        const rawGroups = await api.getMyGroups();
        const rawStarpaths = await getMyStarpaths();

        if (!cancelled) {
          setGroups(rawGroups);
          setStarpaths(rawStarpaths);
        }

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

  /* ================= ACTIONS ================= */
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

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-white">
        Loading workspace…
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white px-8 py-10 space-y-8">

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center">

        <h1 className="text-3xl font-semibold text-white tracking-wide">
  Workspace
</h1>

        <button
          onClick={() => {
            if (focus === "labs") navigate("/creator/labs/new");
            if (focus === "groups") navigate("/creator/groups/new");
            if (focus === "starpaths") navigate("/creator/starpaths/new");
          }}
          className="
px-5 py-2 rounded-lg text-sm

bg-purple-500/20
border border-purple-400/30
text-purple-300

hover:bg-purple-500/30
hover:text-white

transition-all
"
        >
          + Create {focus.slice(0, -1)}
        </button>
      </div>

      {/* ================= TABS ================= */}
      <div className="flex gap-3">

        <Tab
          active={focus === "labs"}
          icon={<Layers size={16} />}
          label="Labs"
          count={activeLabs.length}
          onClick={() => setFocus("labs")}
        />

        <Tab
          active={focus === "groups"}
          icon={<Users size={16} />}
          label="Groups"
          count={groups.length}
          onClick={() => setFocus("groups")}
        />

        <Tab
          active={focus === "starpaths"}
          icon={<Orbit size={16} />}
          label="Starpaths"
          count={starpaths.length}
          onClick={() => setFocus("starpaths")}
        />
      </div>

      {/* ================= CONTENT ================= */}
      <DashboardCard className="p-6 backdrop-blur-xl border border-white/10 shadow-[0_0_60px_rgba(168,85,247,0.15)]">

        {/* LABS */}
        {focus === "labs" && (
          <>
            {activeLabs.length === 0 ? (
              <EmptyState
                title="No labs yet"
                action="Create your first lab"
                onClick={() => navigate("/creator/labs/new")}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeLabs.map((lab) => (
                  <motion.div
                    key={lab.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hover:scale-[1.01] transition-all"
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
          </>
        )}

        {/* GROUPS */}
        {focus === "groups" && (
          <>
            {groups.length === 0 ? (
              <EmptyState
                title="No groups yet"
                action="Create your first group"
                onClick={() => navigate("/creator/groups/new")}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((group) => (
                  <CreatorGroupCard key={group.group_id} group={group} />
                ))}
              </div>
            )}
          </>
        )}

        {/* STARPATHS */}
        {focus === "starpaths" && (
          <>
            {starpaths.length === 0 ? (
              <EmptyState
                title="No starpaths yet"
                action="Create your first starpath"
                onClick={() => navigate("/creator/starpaths/new")}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {starpaths.map((sp) => (
                  <CreatorStarpathCard key={sp.starpath_id} starpath={sp} />
                ))}
              </div>
            )}
          </>
        )}

      </DashboardCard>
    </div>
  );
}

/* ================= TAB ================= */
function Tab({ active, icon, label, count, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all
        backdrop-blur-md border

        ${
          active
            ? "bg-white/10 border-white/20 text-white shadow-[0_0_20px_rgba(139,92,246,0.2)]"
            : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
        }
      `}
    >
      <span className="text-white/80">{icon}</span>
      <span>{label}</span>
      <span className="text-xs text-white/50">{count}</span>
    </button>
  );
}

/* ================= EMPTY ================= */
function EmptyState({ title, action, onClick }: any) {
  return (
    <div className="text-center py-16 space-y-4">

      <p className="text-white/60">{title}</p>

      <button
        onClick={onClick}
        className="
          px-4 py-2 rounded-lg text-sm
          bg-white/5 border border-white/10 text-white/70
          hover:bg-white/10 hover:text-white
          transition-all
        "
      >
        {action}
      </button>

    </div>
  );
}