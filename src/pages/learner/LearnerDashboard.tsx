import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getLabs } from "@/api/labs";
import type { Lab } from "@/contracts/labs";

import PublicLabsSection from "./sections/PublicLabsSection";
import CompletedSection from "./sections/CompletedSection";

// Normalize backend labs → frontend format
function normalizeLab(raw: Lab) {
  return {
    id: raw.lab_id,
    name: raw.name,
    description: raw.description,
    difficulty: raw.difficulty,
    visibility: raw.visibility,
    image: raw.image,

    // Champs UI (no backend)
    completed: false,
    progress: 0,

    raw, // optionnel, pour debug
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
        const labsData = await getLabs();

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
