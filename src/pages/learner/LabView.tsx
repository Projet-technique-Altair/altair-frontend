import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import { getLab } from "@/api/labs";
import type { Lab } from "@/contracts/labs";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionTitle from "@/components/ui/SectionTitle";
import { ALT_COLORS } from "@/lib/theme";

/**
 * UI projection of a Lab.
 * We keep it minimal and honest to backend data.
 */
interface LabViewModel {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  estimatedTime: string;
}

function mapLabToViewModel(raw: Lab): LabViewModel {
  return {
    id: raw.lab_id,
    name: raw.name,
    description: raw.description ?? "No description available.",
    difficulty: raw.difficulty ?? "Unknown",
    estimatedTime: raw.estimated_time
      ? `${raw.estimated_time} min`
      : "Unknown duration",
  };
}

export default function LabView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [lab, setLab] = useState<LabViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    getLab(id)
      .then((data) => {
        setLab(mapLabToViewModel(data));
        setLoading(false);
      })
      .catch(() => {
        setError("Lab not found");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">
        <p className="text-gray-400">Loading lab...</p>
      </div>
    );
  }

  if (error || !lab) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold text-red-400">Lab not found</h1>
          <button
            onClick={() => navigate("/learner/dashboard")}
            className="text-sky-400 hover:underline text-sm"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full px-8 py-8 bg-[#0B0F19] text-white space-y-8">

      {/* HEADER */}
      <div>
        <h1
          className="text-3xl font-bold leading-tight"
          style={{
            background: `linear-gradient(90deg, ${ALT_COLORS.blue}, ${ALT_COLORS.purple}, ${ALT_COLORS.orange})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {lab.name}
        </h1>

        <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-400">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              lab.difficulty === "BEGINNER"
                ? "bg-green-500/20 text-green-400"
                : lab.difficulty === "INTERMEDIATE"
                ? "bg-yellow-500/20 text-yellow-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {lab.difficulty}
          </span>

          <span>• {lab.estimatedTime}</span>
        </div>
      </div>

      {/* DESCRIPTION */}
      <DashboardCard>
        <SectionTitle
          text="Lab Description"
          gradient={`linear-gradient(90deg, ${ALT_COLORS.orange}, ${ALT_COLORS.purple})`}
          showDot
        />
        <p className="text-sm text-gray-300 mt-3 leading-relaxed">
          {lab.description}
        </p>
      </DashboardCard>

      {/* ACTIONS */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate(`/learner/labs/${lab.id}/session`)}
          className="px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-[#2AA7FF] via-[#7A2CF3] to-[#FF8C4A] hover:opacity-90 transition"
        >
          ▶ Start Lab
        </button>

        <button
          onClick={() => navigate("/learner/dashboard")}
          className="px-4 py-2 rounded-full text-sm font-medium bg-[#1E293B] hover:bg-red-500/20 text-red-400 border border-red-400/40 transition"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
