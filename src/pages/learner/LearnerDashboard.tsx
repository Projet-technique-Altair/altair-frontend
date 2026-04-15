// src/pages/learner/LearnerDashboard.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layers,
  Orbit,
  Users,
  Archive,
  Search,
  X,
  Activity,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import { getGroups } from "@/api/groups";
import { getStarpaths } from "@/api/starpaths";
import type { Starpath } from "@/contracts/starpaths";
import type { Group } from "@/contracts/groups";
import { getLearnerDashboardLabs, type LearnerDashboardLab } from "@/api/sessions";
import { getLabs} from "@/api/labs";


import PublicLabsSection from "./sections/PublicLabsSection";
import CompletedSection from "./sections/CompletedSection";
import ProgressSection from "./sections/ProgressSection";
import PrivateGroupsSection from "./sections/PrivateGroupsSection";
import ChartsSection from "./sections/ChartsSection";
import type { StarpathLike } from "./sections/ProgressSection";

/* ================= ANIMATION ================= */

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

/* ================= TYPES ================= */

type FocusKey = "insight" | "labs" | "starpaths" | "groups" | "archive";

type UILab = {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  visibility: string;
  completed: boolean;
  progress: number;
  status: "TODO" | "IN_PROGRESS" | "FINISHED";
  lastActivityAt: string;
};

type DashboardGroup = {
  id: string;
  name: string;
  labs: Array<{ id: string; name: string }>;
  starpaths: Array<{ id: string; name: string }>;
};

type RailButtonProps = {
  active: boolean;
  title: string;
  description: string;
  icon: React.ReactNode;
  count: number;
  onClick: () => void;
};

/* ================= NORMALIZE ================= */

function normalizeLab(raw: LearnerDashboardLab): UILab {
  return {
    id: raw.lab_id,
    name: raw.name ?? "Untitled lab",
    description: raw.description ?? "",
    difficulty: raw.difficulty ?? "unknown",
    visibility: raw.visibility ?? "public",
    completed: raw.status === "FINISHED",
    progress: Number(raw.progress ?? 0),
    status: raw.status,
    lastActivityAt: raw.last_activity_at,
  };
}

/* ================= MAIN ================= */

export default function LearnerDashboard() {
  const [labs, setLabs] = useState<UILab[]>([]);
  const [groups, setGroups] = useState<DashboardGroup[]>([]);
  const [starpaths, setStarpaths] = useState<StarpathLike[]>([]);
  const [loading, setLoading] = useState(true);

  const [focus, setFocus] = useState<FocusKey>("insight");
  const [query, setQuery] = useState("");

  const navigate = useNavigate();

  const normalizeStarpath = (raw: Starpath): StarpathLike => ({
    id: raw.starpath_id,
    name: raw.name,
    chaptersCompleted: 0,
    totalChapters: 0,
    labs: 0,
    domain: raw.difficulty ?? "unknown",
  });

  const normalizeGroup = (raw: Group): DashboardGroup => ({
    id: raw.group_id,
    name: raw.name,
    labs: [],
    starpaths: [],
  });

  /* ================= FETCH ================= */

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [labsData, starpathsData, groupsData] = await Promise.all([
          getLearnerDashboardLabs(),
          //getLabs,
          getStarpaths(),
          getGroups(),
        ]);

        if (cancelled) return;

        setLabs((labsData as LearnerDashboardLab[]).map(normalizeLab));
        setStarpaths((starpathsData as Starpath[]).map(normalizeStarpath));
        setGroups((groupsData as Group[]).map(normalizeGroup));

      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };

  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-white">
        Loading dashboard…
      </div>
    );
  }

  /* ================= FILTER ================= */

  const filteredLabs = labs.filter((l) =>
    l.name.toLowerCase().includes(query.toLowerCase())
  );

  const activeLabs = filteredLabs.filter((l) => !l.completed);
  const completedLabs = filteredLabs.filter((l) => l.completed);

  const counts = {
    insight: 1,
    labs: activeLabs.length,
    starpaths: starpaths.length,
    groups: groups.length,
    archive: completedLabs.length,
  };

  /* ================= UI ================= */

  return (
    <motion.div
      className="min-h-screen text-white"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div className="grid grid-cols-12 gap-14">

        {/* ================= LEFT ================= */}

        <motion.div variants={item} className="col-span-8 space-y-6">

          <AnimatePresence mode="wait">

            {focus === "insight" && (
              <motion.div key="insight" variants={item} initial="hidden" animate="show" exit="hidden">
                <ChartsSection
                  labs={labs}
                  starpathsCount={starpaths.length}
                  groupsCount={groups.length}
                />
              </motion.div>
            )}

            {focus === "labs" && (
              <motion.div key="labs" variants={item} initial="hidden" animate="show" exit="hidden">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search labs..."
                    className="w-full pl-9 pr-8 py-2 rounded-lg bg-black/30 border border-white/10 text-sm"
                  />
                  {query && (
                    <button onClick={() => setQuery("")} className="absolute right-3 top-3">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <PublicLabsSection
                  labs={activeLabs}
                  onLabClick={(lab) =>
                    navigate(`/learner/labs/${lab.id}`)
                  }
                />
              </motion.div>
            )}

            {focus === "starpaths" && (
              <motion.div key="starpaths" variants={item} initial="hidden" animate="show" exit="hidden">
                <ProgressSection starpaths={starpaths} />
              </motion.div>
            )}

            {focus === "groups" && (
              <motion.div key="groups" variants={item} initial="hidden" animate="show" exit="hidden">
                <PrivateGroupsSection
                  groups={groups}
                  setGroups={setGroups}
                  labs={labs.map((lab) => ({ id: lab.id, name: lab.name }))}
                  starpaths={starpaths.map((starpath) => ({
                    id: starpath.id,
                    name: starpath.name,
                  }))}
                />
              </motion.div>
            )}

            {focus === "archive" && (
              <motion.div key="archive" variants={item} initial="hidden" animate="show" exit="hidden">
                <CompletedSection labs={completedLabs} />
              </motion.div>
            )}

          </AnimatePresence>

        </motion.div>

        {/* ================= RIGHT ================= */}

        <motion.div variants={container} className="col-span-4 space-y-4">

          {[
            { key: "insight", title: "Insight", icon: <Activity size={18} />, desc: "Visual telemetry snapshot" },
            { key: "labs", title: "Labs", icon: <Layers size={18} />, desc: "Active labs only" },
            { key: "starpaths", title: "Starpaths", icon: <Orbit size={18} />, desc: "Progression paths" },
            { key: "groups", title: "Groups", icon: <Users size={18} />, desc: "Your private groups" },
            { key: "archive", title: "Archive", icon: <Archive size={18} />, desc: "Completed labs" },
          ].map((itemData) => (
            <motion.div key={itemData.key} variants={item}>
              <RailButton
                active={focus === itemData.key}
                title={itemData.title}
                description={itemData.desc}
                icon={itemData.icon}
                count={counts[itemData.key as FocusKey]}
                onClick={() => setFocus(itemData.key as FocusKey)}
              />
            </motion.div>
          ))}

        </motion.div>

      </div>
    </motion.div>
  );
}

/* ================= BUTTON ================= */

function RailButton({
  active,
  title,
  description,
  icon,
  count,
  onClick,
}: RailButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`w-full text-left rounded-2xl border px-5 py-4 transition backdrop-blur-md
      ${
        active
          ? "bg-white/10 border-white/20"
          : "bg-white/5 border-white/10 hover:bg-white/8"
      }`}
    >
      <div className="flex items-center justify-between">

        <div className="flex items-start gap-3">

          <div className="text-white/80">{icon}</div>

          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white/90">
              {title}
            </span>
            <span className="text-xs text-white/55">
              {description}
            </span>
          </div>

        </div>

        {title !== "Insight" && (
  <span className="text-xs text-white/60">
    {count}
  </span>
)}

      </div>
    </motion.button>
  );
}