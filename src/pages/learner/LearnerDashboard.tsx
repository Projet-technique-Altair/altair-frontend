import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layers,
  Orbit,
  Users,
  Search,
  X,
  Activity,
} from "lucide-react";

import { getGroups } from "@/api/groups";
import { getStarpaths } from "@/api/starpaths";
import type { Starpath } from "@/contracts/starpaths";
import type { Group } from "@/contracts/groups";
import { getLearnerDashboardLabs, type LearnerDashboardLab } from "@/api/sessions";

import ProgressSection from "./sections/ProgressSection";
import PrivateGroupsSection from "./sections/PrivateGroupsSection";
import ChartsSection from "./sections/ChartsSection";
import type { StarpathLike } from "./sections/ProgressSection";
import LearnerStatusSection from "./sections/LearnerStatusSection";

type FocusKey = "insight" | "labs" | "starpaths" | "groups";

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

// The dashboard now consumes the learner-specific projection returned by sessions-ms.
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

export default function LearnerDashboard() {
  /* =================================
     STATE
  ================================= */

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

  /* =================================
     FETCH DATA
  ================================= */

  useEffect(() => {

    let cancelled = false;

    async function load() {
      try {
        // The dashboard intentionally reads learner-linked labs only.
        const labsData = await getLearnerDashboardLabs();
        const starpathsData = await getStarpaths();
        const groupsData = await getGroups();

        const normalizedLabs = (labsData as LearnerDashboardLab[]).map(normalizeLab);

        if (!cancelled) {
          setLabs(normalizedLabs);
          setStarpaths((starpathsData as Starpath[]).map(normalizeStarpath));
          setGroups((groupsData as Group[]).map(normalizeGroup));
        }

      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };

  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-white">
        Loading dashboard…
      </div>
    );
  }

  /* =================================
     FILTER LABS
  ================================= */

  const filteredLabs = labs.filter((l) =>
    l.name.toLowerCase().includes(query.toLowerCase())
  );

  // Keep the same card language as before, but split the board into learner status sections.
  const inProgressLabs = filteredLabs.filter((l) => l.status === "IN_PROGRESS");
  const todoLabs = filteredLabs.filter((l) => l.status === "TODO");
  const finishedLabs = filteredLabs.filter((l) => l.status === "FINISHED");

  const counts = {
    insight: 1,
    labs: filteredLabs.length,
    starpaths: starpaths.length,
    groups: groups.length,
  };

  /* =================================
     UI
  ================================= */

  return (
    <div className="min-h-screen text-white">

      <div className="grid grid-cols-12 gap-14">

        {/* =========================
            MAIN CONTENT
        ========================= */}

        <div className="col-span-8 space-y-6">

          {focus === "insight" && (
            <ChartsSection
              labs={labs}
              starpathsCount={starpaths.length}
              groupsCount={groups.length}
            />
          )}

          {focus === "labs" && (
            <>
              <div className="relative">

                <Search className="absolute left-3 top-3 h-4 w-4 text-white/50" />

                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search labs..."
                  className="w-full pl-9 pr-8 py-2 rounded-lg bg-black/30 border border-white/10 text-sm"
                />

                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-3"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

              </div>

              <div className="space-y-6">
                <LearnerStatusSection
                  eyebrow="Learner Board"
                  title="Transmission: In Progress"
                  subtitle="Labs you already started and can continue."
                  emptyTitle="No active lab in progress"
                  emptySubtitle="Start a followed lab or launch one from the explorer."
                  labs={inProgressLabs}
                  onLabClick={(lab) => navigate(`/learner/labs/${lab.id}`)}
                />

                <LearnerStatusSection
                  eyebrow="Learner Board"
                  title="Queue: To Do"
                  subtitle="Labs you followed and kept for later."
                  emptyTitle="No lab in TO DO"
                  emptySubtitle="Use the explorer follow toggle to add labs here."
                  labs={todoLabs}
                  onLabClick={(lab) => navigate(`/learner/labs/${lab.id}`)}
                />

                <LearnerStatusSection
                  eyebrow="Learner Board"
                  title="Archive: Finished"
                  subtitle="Completed labs remain visible as part of your history."
                  emptyTitle="No finished lab yet"
                  emptySubtitle="Finish a lab to move it into your completed history."
                  labs={finishedLabs}
                  onLabClick={(lab) => navigate(`/learner/labs/${lab.id}`)}
                />
              </div>
            </>
          )}

          {focus === "starpaths" && (
            <ProgressSection starpaths={starpaths} />
          )}

          {focus === "groups" && (
            <PrivateGroupsSection groups={groups} />
          )}

        </div>

        {/* =========================
            RIGHT RAIL
        ========================= */}

        <div className="col-span-4 space-y-4">

          <RailButton
            active={focus==="insight"}
            title="Insight"
            description="Visual telemetry snapshot"
            icon={<Activity size={18}/>}
            count={counts.insight}
            onClick={()=>setFocus("insight")}
          />

          <RailButton
            active={focus==="labs"}
            title="Labs"
            description="Active labs only"
            icon={<Layers size={18}/>}
            count={counts.labs}
            onClick={()=>setFocus("labs")}
          />

          <RailButton
            active={focus==="starpaths"}
            title="Starpaths"
            description="Progression paths"
            icon={<Orbit size={18}/>}
            count={counts.starpaths}
            onClick={()=>setFocus("starpaths")}
          />

          <RailButton
            active={focus==="groups"}
            title="Groups"
            description="Your private groups"
            icon={<Users size={18}/>}
            count={counts.groups}
            onClick={()=>setFocus("groups")}
          />

        </div>

      </div>

    </div>
  );
}

function RailButton({
  active,
  title,
  description,
  icon,
  count,
  onClick,
}: RailButtonProps) {

  return (
    <button
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

        <span className="text-xs text-white/60">
          {count}
        </span>

      </div>
    </button>
  );
}
