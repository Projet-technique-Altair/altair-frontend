// src/pages/learner/LabView.tsx

/*import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import { api } from "@/api";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionTitle from "@/components/ui/SectionTitle";
import { ALT_COLORS } from "@/lib/theme";

export default function LabView() {
  const { id } = useParams();
  const navigate = useNavigate();

  // === API DATA ===
  const [lab, setLab] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // === FEEDBACK ===
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);

  // === Fetch lab from gateway ===
  useEffect(() => {
    if (!id) return;

    api.getLabById(id)
      .then((data) => {
        setLab(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Lab not found");
        setLoading(false);
      });
  }, [id]);

  // === Loading screen ===
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">
        <p className="text-gray-400">Loading lab...</p>
      </div>
    );
  }

  // === Not found ===
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

  const handlePost = () => {
    if (!comment.trim()) return;
    console.log("📝 Comment posted:", {
      labId: lab?.id,
      comment,
      rating,
    });
    setComment("");
    setRating(0);
  };

  // === Render ===
  return (
    <div className="min-h-screen w-full px-8 py-8 bg-[#0B0F19] text-white space-y-8">
*/
      {/* === HEADER === */}/*
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
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

          {lab.creator && (
            <p className="text-sm text-gray-400 mt-1">
              by <span className="text-sky-400 font-medium">@{lab.creator}</span>
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-400">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                lab.level === "Beginner"
                  ? "bg-green-500/20 text-green-400"
                  : lab.level === "Intermediate"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {lab.level}
            </span>

            <span>• {lab.domain}</span>
            {lab.environment && <span>• {lab.environment}</span>}
            {lab.duration && <span>• {lab.duration}</span>}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate(`/learner/labs/${lab.id}/session`)}
            className="px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-[#2AA7FF] via-[#7A2CF3] to-[#FF8C4A] hover:opacity-90 transition"
          >
            ▶ Resume Lab
          </button>

          <button
            onClick={() => navigate("/learner/dashboard")}
            className="px-4 py-2 rounded-full text-sm font-medium bg-[#1E293B] hover:bg-red-500/20 text-red-400 border border-red-400/40 transition"
          >
            ✖ Abandon Lab
          </button>
        </div>
      </div>
*/
      {/* === PROGRESS BAR === */}/*
      <DashboardCard>
        <SectionTitle
          text="Your Progress"
          gradient={`linear-gradient(90deg, ${ALT_COLORS.blue}, ${ALT_COLORS.purple}, ${ALT_COLORS.orange})`}
          showDot
        />
        <div className="mt-4 flex items-center gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className={`h-3 flex-1 rounded-full transition-all duration-300 ${
                i < Math.round(lab.progress / 10)
                  ? "bg-gradient-to-r from-sky-400 via-purple-400 to-orange-400"
                  : "bg-[#1E293B]"
              }`}
            />
          ))}
        </div>
        <p className="mt-2 text-sm text-gray-400">{lab.progress}% completed</p>
      </DashboardCard>
*/
      {/* === DESCRIPTION === */}/*
      <DashboardCard>
        <SectionTitle
          text="Lab Description"
          gradient={`linear-gradient(90deg, ${ALT_COLORS.orange}, ${ALT_COLORS.purple})`}
          showDot
        />
        <p className="text-sm text-gray-300 mt-3 leading-relaxed">{lab.description}</p>
      </DashboardCard>
*/
      {/* === OBJECTIVES === */}/*
      {lab.objectives && lab.objectives.length > 0 && (
        <DashboardCard>
          <SectionTitle
            text="Objectives"
            gradient={`linear-gradient(90deg, ${ALT_COLORS.purple}, ${ALT_COLORS.blue})`}
            showDot
          />
          <ul className="mt-3 list-disc list-inside text-sm text-gray-300 space-y-1">
            {lab.objectives.map((obj, i) => (
              <li key={i}>{obj}</li>
            ))}
          </ul>
        </DashboardCard>
      )}
*/
      {/* === PREREQUISITES === */}/*
      {lab.prerequisites && lab.prerequisites.length > 0 && (
        <DashboardCard>
          <SectionTitle
            text="Prerequisites"
            gradient={`linear-gradient(90deg, ${ALT_COLORS.purple}, ${ALT_COLORS.orange})`}
            showDot
          />
          <ul className="mt-3 list-disc list-inside text-sm text-gray-300 space-y-1">
            {lab.prerequisites.map((pre, i) => (
              <li key={i}>{pre}</li>
            ))}
          </ul>
        </DashboardCard>
      )}
*/
      {/* === FEEDBACK === */}/*
      <DashboardCard>
        <SectionTitle
          text="Share your feedback"
          gradient={`linear-gradient(90deg, ${ALT_COLORS.blue}, ${ALT_COLORS.orange})`}
          showDot
        />

        <div className="mt-4 space-y-3">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your thoughts about this lab..."
            className="w-full h-28 p-3 rounded-lg bg-[#0E1323]/80 border border-white/10 text-sm text-gray-200 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-[#7A2CF3]/60"
          />

          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  onClick={() => setRating(i)}
                  className={`text-2xl transition ${
                    i <= rating ? "text-yellow-400" : "text-gray-600"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            <button
              onClick={handlePost}
              className="px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-[#2AA7FF] via-[#7A2CF3] to-[#FF8C4A] hover:opacity-90 transition"
            >
              Post Comment
            </button>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
}
*/



// src/pages/learner/LabView.tsx

import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import { api } from "@/api";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionTitle from "@/components/ui/SectionTitle";
import { ALT_COLORS } from "@/lib/theme";

// Map backend → frontend expected structure
function mapLab(raw: any) {
  return {
    id: raw.id ?? raw.lab_id ?? "unknown",
    name: raw.name ?? "Untitled Lab",
    description: raw.description ?? "No description available.",

    // Default values so UI does not break
    level: raw.level ?? "Beginner",
    domain: raw.domain ?? "General",
    environment: raw.environment ?? "Containerized",
    duration: raw.duration ?? "10 min",
    progress: raw.progress ?? 0,

    objectives: raw.objectives ?? [],
    prerequisites: raw.prerequisites ?? [],
    creator: raw.creator ?? "system",
  };
}

export default function LabView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lab, setLab] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);

  useEffect(() => {
    if (!id) return;

    api.getLabById(id)
      .then((data) => {
        setLab(mapLab(data));
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

  const handlePost = () => {
    if (!comment.trim()) return;
    console.log("📝 Comment posted:", {
      labId: lab.id,
      comment,
      rating,
    });
    setComment("");
    setRating(0);
  };

  return (
    <div className="min-h-screen w-full px-8 py-8 bg-[#0B0F19] text-white space-y-8">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
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

          <p className="text-sm text-gray-400 mt-1">
            by <span className="text-sky-400 font-medium">@{lab.creator}</span>
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-400">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                lab.level === "Beginner"
                  ? "bg-green-500/20 text-green-400"
                  : lab.level === "Intermediate"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {lab.level}
            </span>

            <span>• {lab.domain}</span>
            <span>• {lab.environment}</span>
            <span>• {lab.duration}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate(`/learner/labs/${lab.id}/session`)}
            className="px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-[#2AA7FF] via-[#7A2CF3] to-[#FF8C4A] hover:opacity-90 transition"
          >
            ▶ Resume Lab
          </button>

          <button
            onClick={() => navigate("/learner/dashboard")}
            className="px-4 py-2 rounded-full text-sm font-medium bg-[#1E293B] hover:bg-red-500/20 text-red-400 border border-red-400/40 transition"
          >
            ✖ Abandon Lab
          </button>
        </div>
      </div>

      {/* PROGRESS BAR */}
      <DashboardCard>
        <SectionTitle
          text="Your Progress"
          gradient={`linear-gradient(90deg, ${ALT_COLORS.blue}, ${ALT_COLORS.purple}, ${ALT_COLORS.orange})`}
          showDot
        />
        <div className="mt-4 flex items-center gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className={`h-3 flex-1 rounded-full transition-all duration-300 ${
                i < Math.round(lab.progress / 10)
                  ? "bg-gradient-to-r from-sky-400 via-purple-400 to-orange-400"
                  : "bg-[#1E293B]"
              }`}
            />
          ))}
        </div>
        <p className="mt-2 text-sm text-gray-400">{lab.progress}% completed</p>
      </DashboardCard>

      {/* DESCRIPTION */}
      <DashboardCard>
        <SectionTitle
          text="Lab Description"
          gradient={`linear-gradient(90deg, ${ALT_COLORS.orange}, ${ALT_COLORS.purple})`}
          showDot
        />
        <p className="text-sm text-gray-300 mt-3 leading-relaxed">{lab.description}</p>
      </DashboardCard>

      {/* OBJECTIVES */}
      {lab.objectives.length > 0 && (
        <DashboardCard>
          <SectionTitle
            text="Objectives"
            gradient={`linear-gradient(90deg, ${ALT_COLORS.purple}, ${ALT_COLORS.blue})`}
            showDot
          />
          <ul className="mt-3 list-disc list-inside text-sm text-gray-300 space-y-1">
            {lab.objectives.map((obj, i) => (
              <li key={i}>{obj}</li>
            ))}
          </ul>
        </DashboardCard>
      )}

      {/* PREREQUISITES */}
      {lab.prerequisites.length > 0 && (
        <DashboardCard>
          <SectionTitle
            text="Prerequisites"
            gradient={`linear-gradient(90deg, ${ALT_COLORS.purple}, ${ALT_COLORS.orange})`}
            showDot
          />
          <ul className="mt-3 list-disc list-inside text-sm text-gray-300 space-y-1">
            {lab.prerequisites.map((pre, i) => (
              <li key={i}>{pre}</li>
            ))}
          </ul>
        </DashboardCard>
      )}

      {/* FEEDBACK */}
      <DashboardCard>
        <SectionTitle
          text="Share your feedback"
          gradient={`linear-gradient(90deg, ${ALT_COLORS.blue}, ${ALT_COLORS.orange})`}
          showDot
        />

        <div className="mt-4 space-y-3">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your thoughts about this lab..."
            className="w-full h-28 p-3 rounded-lg bg-[#0E1323]/80 border border-white/10 text-sm text-gray-200 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-[#7A2CF3]/60"
          />

          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  onClick={() => setRating(i)}
                  className={`text-2xl transition ${
                    i <= rating ? "text-yellow-400" : "text-gray-600"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            <button
              onClick={handlePost}
              className="px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-[#2AA7FF] via-[#7A2CF3] to-[#FF8C4A] hover:opacity-90 transition"
            >
              Post Comment
            </button>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
}
