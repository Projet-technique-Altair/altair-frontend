import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Layers,
  Orbit,
  Users,
  Archive,
  Search,
  X,
  Activity,
} from "lucide-react";

import { getLabs } from "@/api/labs";
import type { Lab } from "@/contracts/labs";

import { getGroups } from "@/api/groups";
import { getStarpaths } from "@/api/starpaths";
import type { Starpath } from "@/contracts/starpaths";

import PublicLabsSection from "./sections/PublicLabsSection";
import CompletedSection from "./sections/CompletedSection";
import ProgressSection from "./sections/ProgressSection";
import PrivateGroupsSection from "./sections/PrivateGroupsSection";
import ChartsSection from "./sections/ChartsSection";

type FocusKey = "insight" | "labs" | "starpaths" | "groups" | "archive";

type UILab = {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  visibility: string;
  completed: boolean;
  progress: number;
  raw: Lab;
};

function normalizeLab(raw: Lab): UILab {
  return {
    id: (raw as any).lab_id,
    name: raw.name ?? "Untitled lab",
    description: raw.description ?? "",
    difficulty: raw.difficulty ?? "unknown",
    visibility: (raw as any).visibility ?? "public",
    completed: false,
    progress: 0,
    raw,
  };
}

export default function LearnerDashboard() {
  /* =================================
     STATE
  ================================= */

  const [labs, setLabs] = useState<UILab[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [starpaths, setStarpaths] = useState<Starpath[]>([]);
  const [loading, setLoading] = useState(true);

  const [focus, setFocus] = useState<FocusKey>("insight");
  const [query, setQuery] = useState("");

  const navigate = useNavigate();
  const { search } = useLocation();

  const mockUI = useMemo(
    () => new URLSearchParams(search).get("mock") === "1",
    [search]
  );

  /* =================================
     FETCH DATA
  ================================= */

  useEffect(() => {

    let cancelled = false;

    async function load() {
      try {

        const labsData = await getLabs();
        const starpathsData = await getStarpaths();
        const groupsData = await getGroups();

        const normalizedLabs = (labsData as Lab[]).map(normalizeLab);

        if (!cancelled) {
          setLabs(normalizedLabs);
          setStarpaths(starpathsData as Starpath[]);
          setGroups(groupsData as any[]);
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

  const activeLabs = filteredLabs.filter((l) => !l.completed);
  const completedLabs = filteredLabs.filter((l) => l.completed);

  const counts = {
    insight: 1,
    labs: activeLabs.length,
    starpaths: starpaths.length,
    groups: groups.length,
    archive: completedLabs.length,
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

              <PublicLabsSection
                labs={activeLabs as any}
                onLabClick={(lab: any) =>
                  navigate(`/learner/labs/${lab.id}`)
                }
              />
            </>
          )}

          {focus === "starpaths" && (
            <ProgressSection starpaths={starpaths} />
          )}

          {focus === "groups" && (
            <PrivateGroupsSection groups={groups} />
          )}

          {focus === "archive" && (
            <CompletedSection labs={completedLabs as any} />
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

          <RailButton
            active={focus==="archive"}
            title="Archive"
            description="Completed labs"
            icon={<Archive size={18}/>}
            count={counts.archive}
            onClick={()=>setFocus("archive")}
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
}: any) {

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
