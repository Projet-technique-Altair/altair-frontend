import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
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
import { getGroupLabs } from "@/api/groups";
import { getGroupStarpaths } from "@/api/groups";

import { getStarpaths } from "@/api/starpaths";
import type { Starpath } from "@/contracts/starpaths";


// Sections existantes (on ne les modifie pas)
import PublicLabsSection from "./sections/PublicLabsSection";
import CompletedSection from "./sections/CompletedSection";
import ProgressSection from "./sections/ProgressSection";
import PrivateGroupsSection from "./sections/PrivateGroupsSection";

// ✅ Insight now lives in ChartsSection
import ChartsSection from "./sections/ChartsSection";

// Types utilisés par les sections (sans les éditer)
//import type { Starpath } from "@/api/mock";
import type { PrivateGroup } from "@/api";

/* =========================
   Types UI
========================= */

type UILab = {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  visibility: string;
  image?: string | null;

  completed: boolean;
  progress: number;

  raw: Lab;
};

// Le type minimal attendu par PublicLabsSection
type LabLike = {
  id?: string;
  lab_id?: string;
  name: string;
  progress?: number;
  completed?: boolean;
};

type GroupLab = {
  id: string;
  name: string;
};

type GroupStarpath = {
  id: string;
  name: string;
};

type DashboardGroup = {
  id: string;
  name: string;
  labs: GroupLab[];
  starpaths: GroupStarpath[];
};

type FocusKey = "insight" | "labs" | "starpaths" | "groups" | "archive";

/* =========================
   Normalize
========================= */

function normalizeLab(raw: Lab): UILab {
  return {
    id: (raw as any).lab_id,
    name: (raw as any).name ?? "Untitled lab",
    description: (raw as any).description ?? "",
    difficulty: (raw as any).difficulty ?? "unknown",
    visibility: (raw as any).visibility ?? "public",
    image: (raw as any).image ?? null,

    completed: false,
    progress: 0,

    raw,
  };
}

/* =========================
   Small UI bits
========================= */

function RailItem({
  active,
  title,
  subtitle,
  count,
  icon,
  onClick,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  count: number;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={[
        "w-full text-left rounded-2xl border transition",
        "backdrop-blur-md",
        active
          ? "border-white/20 bg-white/10 shadow-[0_18px_50px_rgba(0,0,0,0.35)]"
          : "border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/15",
        "px-6 py-5",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className={active ? "text-white/90" : "text-white/75"}>
            {icon}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white/90">
                {title}
              </span>
              {active && (
                <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/15 bg-black/20 text-white/60">
                  focused
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-white/55 leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>

        <span className="text-xs text-white/55">{count}</span>
      </div>

    </button>
  );
}

/* =========================
   Dashboard
========================= */

export default function LearnerDashboard() {
  const [labs, setLabs] = useState<UILab[]>([]);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<DashboardGroup[]>([]);

  // Focus UX — default to INSIGHT
  const [focus, setFocus] = useState<FocusKey>("insight");

  // Only for labs view
  const [query, setQuery] = useState("");

  // Manual mock switch: /learner/dashboard?mock=1
  const { search } = useLocation();
  const mockUI = useMemo(
    () => new URLSearchParams(search).get("mock") === "1",
    [search],
  );

  const navigate = useNavigate();

  /* =========================
     Mocks
  ========================= */

  const mockLabs: UILab[] = useMemo(
    () => [
      {
        id: "mock-in-progress",
        name: "Mock Lab — In Progress",
        description: "Fake data to validate UI.",
        difficulty: "medium",
        visibility: "public",
        image: null,
        completed: false,
        progress: 42,
        raw: {} as Lab,
      },
      {
        id: "mock-completed",
        name: "Mock Lab — Completed",
        description: "Fake data to validate UI.",
        difficulty: "easy",
        visibility: "public",
        image: null,
        completed: true,
        progress: 100,
        raw: {} as Lab,
      },
    ],
    [],
  );

  const [starpaths, setStarpaths] = useState<Starpath[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        /* =========================
          FETCH LABS
        ========================= */

        const labsData = await getLabs();

        const labsArr = Array.isArray(labsData)
          ? labsData
          : Array.isArray((labsData as any)?.data)
            ? (labsData as any).data
            : [];

        const normalizedLabs = (labsArr as Lab[]).map(normalizeLab);


        /* =========================
          FETCH STARPATHS
        ========================= */

        const starpathsData = await getStarpaths();

        const starpathsArr = Array.isArray(starpathsData)
          ? starpathsData
          : Array.isArray((starpathsData as any)?.data)
            ? (starpathsData as any).data
            : [];

        /* =========================
          FETCH GROUPS
        ========================= */

        const groupsData = await getGroups();
        console.log("RAW groupsData:", groupsData);

        const groupsArr = Array.isArray(groupsData)
          ? groupsData
          : Array.isArray((groupsData as any)?.data)
            ? (groupsData as any).data
            : [];

        /* =========================
          FETCH LABS FOR EACH GROUP
        ========================= */

        const groupsWithLabs = await Promise.all(
          groupsArr.map(async (g: any) => {
            try {
              const labsForGroup = await getGroupLabs(g.group_id);
              const starpathsForGroup = await getGroupStarpaths(g.group_id);
              console.log("Labs for group", g.group_id, labsForGroup);
              console.log("Starpaths for group", g.group_id, starpathsForGroup);

              const labsArray = Array.isArray(labsForGroup)
                ? labsForGroup
                : Array.isArray((labsForGroup as any)?.data)
                  ? (labsForGroup as any).data
                  : [];

              const mappedLabs = labsArray
                .map((labId: string) => {
                  const fullLab = normalizedLabs.find((l) => l.id === labId);

                  if (!fullLab) return null;

                  return {
                    id: fullLab.id,
                    name: fullLab.name,
                  };
                })
                .filter(Boolean);


              const starpathsArray = Array.isArray(starpathsForGroup)
                ? starpathsForGroup
                : Array.isArray((starpathsForGroup as any)?.data)
                  ? (starpathsForGroup as any).data
                  : [];

              const mappedStarpaths = starpathsArray
                .map((spId: string) => {
                  const fullStarpath = (starpathsArr as any[]).find(
                    (sp: any) => (sp.id ?? sp.starpath_id) === spId
                  );

                  if (!fullStarpath) return null;

                  return {
                    id: fullStarpath.id ?? fullStarpath.starpath_id,
                    name: fullStarpath.name ?? "Untitled starpath",
                  } as GroupStarpath;
                })
                .filter((x): x is GroupStarpath => x !== null);

              return {
                id: g.group_id,
                name: g.name,
                labs: mappedLabs,
                starpaths: mappedStarpaths,
              };
            } catch (err) {
              console.error(
                `❌ Error loading labs for group ${g.group_id}`,
                err
              );

              return {
                id: g.group_id,
                name: g.name,
                labs: [],
                starpaths: [],
              };
            }
          })
        );

        /* =========================
          APPLY STATE
        ========================= */

        if (!cancelled) {
          setLabs(normalizedLabs);
          setGroups(groupsWithLabs);
          setStarpaths(starpathsArr);
        }

      } catch (err) {
        console.error("❌ Error loading dashboard data:", err);

        if (!cancelled) {
          setLabs([]);
          setGroups([]);
          setStarpaths([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);




  /* =========================
     Labs base (backend OR mock)
  ========================= */

  const labsBase: UILab[] = useMemo(() => {
    if (!mockUI) return labs;

    // If no real labs => use full mock set
    if (labs.length === 0) return mockLabs;

    // Otherwise inject progress/completed into first items + ensure completed mock exists
    const copy = [...labs];

    copy[0] = { ...copy[0], progress: 42, completed: false };

    if (copy[1]) {
      copy[1] = { ...copy[1], progress: 100, completed: true };
    } else {
      copy.push(mockLabs[1]);
    }

    return copy;
  }, [mockUI, labs, mockLabs]);

  /* =========================
     Derived labs
  ========================= */

  const filteredLabs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return labsBase;
    return labsBase.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q),
    );
  }, [labsBase, query]);

  const activeLabs = useMemo(
    () => filteredLabs.filter((l) => !l.completed),
    [filteredLabs],
  );
  const completedLabs = useMemo(
    () => filteredLabs.filter((l) => l.completed),
    [filteredLabs],
  );

  // Labs tab shows ONLY active labs
  const labsForSection: LabLike[] = useMemo(
    () =>
      activeLabs.map((l) => ({
        id: l.id,
        name: l.name,
        progress: l.progress,
        completed: l.completed,
      })),
    [activeLabs],
  );

  const handleLabClick = (lab: LabLike) => {
    const id = lab.id ?? lab.lab_id;
    if (!id) return;
    navigate(`/learner/labs/${id}`);
  };

  /* =========================
     UI
  ========================= */

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-white">
        <div className="text-white/60 animate-pulse">Loading dashboard…</div>
      </div>
    );
  }

  const counts = {
    insight: 1,
    labs: labsForSection.length,
    starpaths: starpaths.length,
    groups: groups.length,
    archive: completedLabs.length,
  };

  return (
    <div className="min-h-screen w-full text-white">
      <div className="w-full px-8 2xl:px-12 py-12 space-y-10">
        {/* Header */}
        <div className="flex items-end justify-between gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-semibold tracking-tight">
              Mission Control
            </h1>
            <p className="text-sm text-white/60 max-w-2xl">
              Focus a module. Expand what you need. Keep the rest minimized but
              reachable.
              {mockUI ? " (mock mode enabled)" : ""}
            </p>
          </div>

       
        </div>

        {/* Layout */}
        <div className="grid grid-cols-12 gap-10">
          {/* FOCUSED */}
          <div className="col-span-9 space-y-5">
            {focus === "insight" && (
              <ChartsSection
                labs={labsBase}
                starpathsCount={starpaths.length}
                groupsCount={groups.length}
              />
            )}

            {focus === "labs" && (
              <>
                {/* command row */}
                <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-[0_22px_70px_rgba(0,0,0,0.35)]">
                  <div className="flex items-center gap-5">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/45" />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Scan labs…"
                        className="w-full rounded-2xl border border-white/10 bg-black/25 pl-11 pr-11 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-sky-400/40"
                      />
                      {query && (
                        <button
                          onClick={() => setQuery("")}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/45 hover:text-white/80"
                          aria-label="Clear search"
                          type="button"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="text-xs text-white/55 whitespace-nowrap">
                      {activeLabs.length} active • {completedLabs.length}{" "}
                      completed
                    </div>
                  </div>
                </div>

                {labsForSection.length > 0 ? (
                  <PublicLabsSection
                    labs={labsForSection}
                    onLabClick={handleLabClick}
                  />
                ) : (
                  <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-8 text-white/70 shadow-[0_22px_70px_rgba(0,0,0,0.35)]">
                    <div className="text-sm font-semibold">
                      No labs to display
                    </div>
                    <div className="mt-2 text-xs text-white/55">
                      {query.trim()
                        ? "No active labs match your scan."
                        : "You have no active labs right now."}
                    </div>
                  </div>
                )}
              </>
            )}

            {focus === "starpaths" && <ProgressSection starpaths={starpaths} />}

            {focus === "groups" && <PrivateGroupsSection groups={groups} />}

            {focus === "archive" && (
              <CompletedSection labs={completedLabs as any} />
            )}
          </div>

          {/* RAIL */}
          <div className="col-span-3 space-y-4">
            <RailItem
              active={focus === "insight"}
              title="Insight"
              subtitle="Visual telemetry snapshot (temporary)."
              count={counts.insight}
              icon={<Activity className="h-5 w-5" />}
              onClick={() => setFocus("insight")}
            />

            <RailItem
              active={focus === "labs"}
              title="Labs"
              subtitle="Active labs only (completed lives in Archive)."
              count={counts.labs}
              icon={<Layers className="h-5 w-5" />}
              onClick={() => setFocus("labs")}
            />

            <RailItem
              active={focus === "starpaths"}
              title="Starpaths"
              subtitle={
                mockUI
                  ? "Mock starpaths to validate progression UI."
                  : "Starpaths will appear here when started."
              }
              count={counts.starpaths}
              icon={<Orbit className="h-5 w-5" />}
              onClick={() => setFocus("starpaths")}
            />

            <RailItem
              active={focus === "groups"}
              title="Groups"
              subtitle={
                mockUI
                  ? "Mock private groups to validate layout."
                  : "Your private groups will appear here."
              }
              count={counts.groups}
              icon={<Users className="h-5 w-5" />}
              onClick={() => setFocus("groups")}
            />

            <RailItem
              active={focus === "archive"}
              title="Archive"
              subtitle="Completed labs live here."
              count={counts.archive}
              icon={<Archive className="h-5 w-5" />}
              onClick={() => setFocus("archive")}
            />

            {!mockUI && (
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 text-xs text-white/55">
                Tip: add <span className="text-white/80">?mock=1</span> to the
                URL to preview Groups + Starpaths + mock labs.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
