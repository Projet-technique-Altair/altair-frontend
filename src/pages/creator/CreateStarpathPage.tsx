import { useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardCard from "@/components/ui/DashboardCard";
import { ALT_COLORS } from "@/lib/theme";
import { createStarpath } from "@/api/starpaths";

export default function CreateStarpathPage() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    difficulty: "beginner",
    visibility: "PRIVATE" as "PRIVATE" | "PUBLIC",
  });

  const handleChange = <K extends keyof typeof form>(
    field: K,
    value: typeof form[K]
  ) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreate = async () => {
    try {

      const starpath = await createStarpath(form);

      const starpathId = starpath.starpath_id;

      navigate(`/creator/starpath/${starpathId}`);

    } catch (err) {
      console.error("Failed to create starpath:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white px-8 py-10 space-y-8">

      {/* HEADER */}

      <div className="flex items-center justify-between">

        <div>

          <h1
            className="text-3xl font-bold"
            style={{
              background: `linear-gradient(90deg, ${ALT_COLORS.purple}, ${ALT_COLORS.orange})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Create a new starpath
          </h1>

          <p className="text-gray-400 text-sm mt-1">
            Create a learning path composed of multiple labs.
          </p>

        </div>

        <button
          onClick={() => navigate("/creator/dashboard")}
          className="text-sm text-slate-300 hover:text-white transition"
        >
          ← Back to creator dashboard
        </button>

      </div>

      {/* FORM */}

      <DashboardCard className="p-8 space-y-6">

        <div>

          <label className="text-xs text-white/40">
            Starpath name
          </label>

          <input
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm"
          />

        </div>

        <div>

          <label className="text-xs text-white/40">
            Description
          </label>

          <textarea
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm"
          />

        </div>

        <div>

          <label className="text-xs text-white/40">
            Difficulty
          </label>

          <select
            value={form.difficulty}
            onChange={(e) => handleChange("difficulty", e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm"
          >

            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>

          </select>

        </div>

        <div>

          <label className="text-xs text-white/40">
            Visibility
          </label>

          <select
            value={form.visibility}
            onChange={(e) => handleChange("visibility", e.target.value as "PRIVATE" | "PUBLIC")}
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm"
          >

            <option value="private">Private</option>
            <option value="public">Public</option>

          </select>

        </div>

        <div className="flex gap-4 pt-2">

          <button
            onClick={() => navigate("/creator/dashboard")}
            className="px-5 py-2 rounded-xl border border-white/10 bg-white/5 text-sm"
          >
            Cancel
          </button>

          <button
            onClick={handleCreate}
            className="px-5 py-2 rounded-xl border border-orange-400/30 bg-orange-500/10 text-orange-200 text-sm"
          >
            Create starpath
          </button>

        </div>

      </DashboardCard>

    </div>
  );
}