// src/pages/creator/CreateLabPage.tsx

// src/pages/creator/CreateLabPage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardCard from "@/components/ui/DashboardCard";
import { ALT_COLORS } from "@/lib/theme";
import { api } from "@/api";

export default function CreateLabPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<{
  name: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  visibility: "private" | "public";
  template_path: string;
  lab_type: string;
  estimated_duration: string;
}>({
  name: "",
  description: "",
  difficulty: "easy",
  visibility: "private",
  template_path: "",
  lab_type: "ctf_terminal_guided",
  estimated_duration: "",
});

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreate = async () => {
  try {
    const lab = await api.createLab(form);

    const labId = lab.lab_id;

    // redirige vers le builder de steps
    navigate(`/creator/labs/${labId}/steps`);

  } catch (err) {
    console.error("Failed to create lab:", err);
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
            Create a new lab
          </h1>

          <p className="text-gray-400 text-sm mt-1">
            Fill the lab information then choose how to generate the content.
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
      <DashboardCard className="
        rounded-3xl
        border border-white/10
        bg-white/[0.04]
        backdrop-blur-xl
        p-8
        shadow-[0_25px_80px_rgba(0,0,0,0.45)]
        space-y-6
        transition
        hover:border-white/15
        ">

          <div>
            <h2 className="text-lg font-semibold text-white/90">
              Lab Information
            </h2>
            <p className="text-xs text-white/50 mt-1">
              Define the base metadata of your lab.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-5">

            <div className="col-span-2">
              <label className="text-[11px] uppercase tracking-widest text-white/35">
                Name
              </label>
              <input
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="
                mt-1 w-full
                rounded-2xl
                border border-white/10
                bg-black/30
                px-4 py-3
                text-sm text-white
                outline-none
                transition-all

                hover:border-sky-400/30
                hover:bg-black/40
                hover:shadow-[0_0_12px_rgba(120,200,255,0.15)]

                focus:border-sky-400/50
                focus:shadow-[0_0_18px_rgba(120,200,255,0.25)]
                "
              />
            </div>

            <div className="col-span-2">
              <label className="text-[11px] uppercase tracking-widest text-white/35">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="
                mt-1 w-full
                rounded-2xl
                border border-white/10
                bg-black/30
                px-4 py-3
                text-sm text-white
                outline-none
                transition-all

                hover:border-purple-400/30
                hover:bg-black/40
                hover:shadow-[0_0_12px_rgba(180,120,255,0.15)]

                focus:border-purple-400/50
                focus:shadow-[0_0_18px_rgba(180,120,255,0.25)]
                "
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-widest text-white/35">
                Difficulty
              </label>
              <select
                value={form.difficulty}
                onChange={(e) => handleChange("difficulty", e.target.value)}
                className="
                mt-1 w-full
                rounded-2xl
                border border-white/10
                bg-black/30
                px-4 py-3
                text-sm text-white
                outline-none
                transition-all

                hover:border-sky-400/30
                hover:bg-black/40
                hover:shadow-[0_0_12px_rgba(120,200,255,0.15)]

                focus:border-sky-400/50
                focus:shadow-[0_0_18px_rgba(120,200,255,0.25)]
                "
              >
                <option value="easy">easy</option>
                <option value="medium">medium</option>
                <option value="hard">hard</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-widest text-white/35">
                Visibility
              </label>
              <select
                value={form.visibility}
                onChange={(e) => handleChange("visibility", e.target.value)}
                className="
                mt-1 w-full
                rounded-2xl
                border border-white/10
                bg-black/30
                px-4 py-3
                text-sm text-white
                outline-none
                transition-all

                hover:border-orange-400/30
                hover:bg-black/40
                hover:shadow-[0_0_12px_rgba(255,170,100,0.15)]

                focus:border-orange-400/50
                focus:shadow-[0_0_18px_rgba(255,170,100,0.25)]
                "
              >
                <option value="private">private</option>
                <option value="public">public</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-widest text-white/35">
                Estimated duration
              </label>
              <input
                value={form.estimated_duration}
                onChange={(e) => handleChange("estimated_duration", e.target.value)}
                className="
                mt-1 w-full
                rounded-2xl
                border border-white/10
                bg-black/30
                px-4 py-3
                text-sm text-white
                outline-none
                transition-all

                hover:border-sky-400/30
                hover:bg-black/40
                hover:shadow-[0_0_12px_rgba(120,200,255,0.15)]

                focus:border-sky-400/50
                focus:shadow-[0_0_18px_rgba(120,200,255,0.25)]
                "
              />
            </div>

            <div className="col-span-2">
              <label className="text-[11px] uppercase tracking-widest text-white/35">
                Template path
              </label>
              <input
                value={form.template_path}
                onChange={(e) => handleChange("template_path", e.target.value)}
                className="
                mt-1 w-full
                rounded-2xl
                border border-white/10
                bg-black/30
                px-4 py-3
                text-sm text-white
                outline-none
                transition-all

                hover:border-orange-400/30
                hover:bg-black/40
                hover:shadow-[0_0_12px_rgba(255,170,100,0.15)]

                focus:border-orange-400/50
                focus:shadow-[0_0_18px_rgba(255,170,100,0.25)]
                "
              />
            </div>

            <div className="col-span-2">
              <label className="text-[11px] uppercase tracking-widest text-white/35">
                Lab type
              </label>
              <input
                value={form.lab_type}
                onChange={(e) => handleChange("lab_type", e.target.value)}
                className="
                mt-1 w-full
                rounded-2xl
                border border-white/10
                bg-black/30
                px-4 py-3
                text-sm text-white
                outline-none
                transition-all

                hover:border-purple-400/30
                hover:bg-black/40
                hover:shadow-[0_0_12px_rgba(180,120,255,0.15)]

                focus:border-purple-400/50
                focus:shadow-[0_0_18px_rgba(180,120,255,0.25)]
                "
              />
            </div>

          </div>

          <div className="flex gap-4 pt-2">

            <button
              onClick={() => navigate("/creator/labs/ai")}
              className="
              px-5 py-2
              rounded-xl
              border border-purple-400/30
              bg-purple-500/10
              text-purple-200
              text-sm
              transition

              hover:bg-purple-500/15
              hover:border-purple-400/50
              hover:shadow-[0_0_14px_rgba(180,120,255,0.25)]
              "
            >
              Generate with AI Prof
            </button>

            <button
              onClick={handleCreate}
              className="
              px-5 py-2
              rounded-xl
              border border-sky-400/30
              bg-sky-500/10
              text-sky-200
              text-sm
              font-medium
              transition

              hover:bg-sky-500/15
              hover:border-sky-400/50
              hover:shadow-[0_0_14px_rgba(120,200,255,0.35)]
              "
            >
              Create manually
            </button>

          </div>

        </DashboardCard>
      </div>
    );
  }