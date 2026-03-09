import { useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardCard from "@/components/ui/DashboardCard";
import { ALT_COLORS } from "@/lib/theme";
import { api } from "@/api";

export default function CreateGroupPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreate = async () => {
    try {
      const group = await api.createGroup(form);

      const groupId = group.group_id;

      navigate(`/creator/group/${groupId}`);

    } catch (err) {
      console.error("Failed to create group:", err);
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
            Create a new group
          </h1>

          <p className="text-gray-400 text-sm mt-1">
            Create a group to organize learners and assign labs or starpaths.
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
      <DashboardCard
        className="
        rounded-3xl
        border border-white/10
        bg-white/[0.04]
        backdrop-blur-xl
        p-8
        shadow-[0_25px_80px_rgba(0,0,0,0.45)]
        space-y-6
      "
      >

        <div>
          <h2 className="text-lg font-semibold text-white/90">
            Group Information
          </h2>

          <p className="text-xs text-white/50 mt-1">
            Basic metadata for your group.
          </p>
        </div>

        <div className="space-y-5">

          {/* NAME */}
          <div>
            <label className="text-[11px] uppercase tracking-widest text-white/35">
              Group name
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
              focus:border-sky-400/50
              "
            />
          </div>

          {/* DESCRIPTION */}
          <div>
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
              focus:border-purple-400/50
              "
            />
          </div>

        </div>

        {/* ACTIONS */}
        <div className="flex gap-4 pt-2">

          <button
            onClick={() => navigate("/creator/dashboard")}
            className="
            px-5 py-2
            rounded-xl
            border border-white/10
            bg-white/5
            text-white/70
            text-sm
            hover:bg-white/10
            "
          >
            Cancel
          </button>

          <button
            onClick={handleCreate}
            className="
            px-5 py-2
            rounded-xl
            border border-purple-400/30
            bg-purple-500/10
            text-purple-200
            text-sm
            font-medium

            hover:bg-purple-500/15
            hover:border-purple-400/50
            "
          >
            Create group
          </button>

        </div>

      </DashboardCard>

    </div>
  );
}