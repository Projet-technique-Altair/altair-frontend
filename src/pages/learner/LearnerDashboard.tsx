// src/pages/learner/LearnerDashboard.tsx

/**
 * @file LearnerDashboard.tsx — main dashboard for learner accounts.
 */
/*
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// === API ===
import { api } from "@/api";

// We recreate LabDetails from the gateway's response type:
type LabDetails = Awaited<ReturnType<typeof api.getLabs>>[0];

// === Sections ===
import ChartsSection from "./sections/ChartsSection";
import ProgressSection from "./sections/ProgressSection";
import CompletedSection from "./sections/CompletedSection";
import PrivateGroupsSection from "./sections/PrivateGroupsSection";
import PublicLabsSection from "./sections/PublicLabsSection";

// === MAIN COMPONENT ===
export default function LearnerDashboard() {
  // === STATE ===
  const [labs, setLabs] = useState<LabDetails[]>([]);
  const [starpaths, setStarpaths] = useState<Starpath[]>([]);
  const [groups, setGroups] = useState<PrivateGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // === FETCH DATA ===
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const [labsData, starpathsData, groupsData] = await Promise.all([
          api.getLabs(),     // ✅ replaced mock with real API call
          getStarpaths(),
          getGroups(),
        ]);

        if (!cancelled) {
          setLabs(labsData);
          setStarpaths(starpathsData);
          setGroups(groupsData);
        }
      } catch (err) {
        console.error("❌ Error loading dashboard data:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  // === FILTERS ===
  const completedLabs = useMemo(
    () => labs.filter((l) => l.completed),
    [labs]
  );

  const activeLabs = useMemo(
    () => labs.filter((l) => !l.completed),
    [labs]
  );

  // === HANDLERS ===
  const handleLabClick = (labId: string) => {
    navigate(`/learner/labs/${labId}`);
  };

  // === LOADING SCREEN ===
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-white">
        <div className="flex flex-col items-center gap-2 animate-pulse text-slate-400">
          <span className="text-base font-medium">Loading your dashboard...</span>
          <span className="text-xs text-gray-500">
            Fetching labs, starpaths, and group data.
          </span>
        </div>
      </div>
    );
  }

  // === RENDER ===
  return (
    <div className="min-h-screen w-full px-8 py-10 bg-[#0B0F19] text-white space-y-10">
     */ {/* === CHARTS === */}
      //<ChartsSection labs={labs} starpaths={starpaths} />

      //{/* === ACTIVE LABS + STARPATH PROGRESS === */}
      /*<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <PublicLabsSection labs={activeLabs} onLabClick={handleLabClick} />
        <ProgressSection starpaths={starpaths} />
      </div>*/

      {/* === COMPLETED LABS + PRIVATE GROUPS === */}
      /*<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CompletedSection labs={completedLabs} />
        <PrivateGroupsSection groups={groups} />
      </div>
    </div>
  );
}
*/



// src/pages/learner/LearnerDashboard.tsx

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "@/api";

import PublicLabsSection from "./sections/PublicLabsSection";
import CompletedSection from "./sections/CompletedSection";

// Normalize backend labs → frontend format
function normalizeLab(raw: any) {
  return {
    id: raw.id ?? raw.lab_id ?? "unknown",
    name: raw.name ?? "Untitled Lab",
    completed: raw.completed ?? false,
    progress: raw.progress ?? 0,
    ...raw,
  };
}

export default function LearnerDashboard() {
  const [labs, setLabs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const labsData = await api.getLabs();

        if (!cancelled) {
          const normalized = labsData.map(normalizeLab);
          console.log("🔥 LABS NORMALIZED =", normalized);
          setLabs(normalized);
        }
      } catch (err) {
        console.error("❌ Error loading dashboard data:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  // PUBLIC LABS = all labs
  const publicLabs = useMemo(() => labs, [labs]);

  // ACTIVE LABS = labs not completed
  const activeLabs = useMemo(
    () => labs.filter((l) => !l.completed),
    [labs]
  );

  const handleLabClick = (lab: any) => {
    const id = lab.id ?? lab.lab_id;
    navigate(`/learner/labs/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-white">
        <div className="text-gray-400 animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full px-8 py-10 bg-[#0B0F19] text-white space-y-10">

      {/* === ALL PUBLIC LABS === */}
      <PublicLabsSection labs={publicLabs} onLabClick={handleLabClick} />

      {/* === ACTIVE LABS Section === */}
      {activeLabs.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 text-white">Active Labs</h2>
          <PublicLabsSection labs={activeLabs} onLabClick={handleLabClick} />
        </div>
      )}

      {/* === COMPLETED LABS === */}
      <CompletedSection labs={labs.filter((l) => l.completed)} />
    </div>
  );
}
