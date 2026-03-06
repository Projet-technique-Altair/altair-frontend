import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { getLab, getSteps, getHints, deleteLab } from "@/api/labs";

import DashboardCard from "@/components/ui/DashboardCard";
import { ALT_COLORS } from "@/lib/theme";

type Hint = {
  hint_id: string;
  hint_number: number;
  text: string;
  cost: number;
};

type Step = {
  step_id: string;
  step_number: number;
  title: string;
  description: string;
  question: string;
  expected_answer: string;
  hints: Hint[];
};

export default function CreatorLabDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lab, setLab] = useState<any>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {

        const labData = await getLab(id!);

        const stepsData = await getSteps(id!);

        const stepsWithHints = await Promise.all(
          stepsData.map(async (step: any) => {

            const hints = await getHints(id!, step.step_id);

            return {
              ...step,
              hints: Array.isArray(hints) ? hints : [],
            };
          })
        );

        if (!cancelled) {
          setLab(labData);
          setSteps(stepsWithHints);
        }

      } catch (err) {
        console.error("Failed to load lab details:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleDelete = async () => {
    try {

      await deleteLab(id!);

      navigate("/creator/dashboard");

    } catch (err) {
      console.error("Failed to delete lab:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="animate-pulse text-white/60">
          Loading lab details...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white px-8 py-10 space-y-10">

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
            {lab?.name}
            </h1>

            <p className="text-white/50 text-sm mt-1">
            Lab details and structure
            </p>
        </div>

        <div className="flex gap-3">

            <button
            onClick={() => navigate(`/creator/lab/${id}/edit`)}
            className="
            px-4 py-2
            rounded-xl
            border border-sky-400/30
            bg-sky-500/10
            text-sky-200
            text-sm
            hover:bg-sky-500/15
            hover:border-sky-400/50
            transition
            "
            >
            Edit lab
            </button>

            <button
            onClick={() => navigate("/creator/dashboard")}
            className="
            px-4 py-2
            rounded-xl
            border border-white/10
            text-sm
            text-white/70
            hover:bg-white/5
            transition
            "
            >
            Back
            </button>

        </div>

        </div>

        {/* LAB INFO */}

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

        <div className="text-sm text-white/70 leading-relaxed max-w-3xl">
            {lab.description || "No description"}
        </div>

        <div className="grid grid-cols-3 gap-10 text-sm pt-2">

            <div className="space-y-1">
            <div className="text-white/40 text-xs uppercase tracking-widest">
                Difficulty
            </div>
            <div className="text-white/90">
                {lab.difficulty}
            </div>
            </div>

            <div className="space-y-1">
            <div className="text-white/40 text-xs uppercase tracking-widest">
                Lab type
            </div>
            <div className="text-white/90">
                {lab.lab_type}
            </div>
            </div>

            <div className="space-y-1">
            <div className="text-white/40 text-xs uppercase tracking-widest">
                Duration
            </div>
            <div className="text-white/90">
                {lab.estimated_duration}
            </div>
            </div>

        </div>

        </DashboardCard>

        {/* STEPS */}

        <DashboardCard
        className="
        rounded-3xl
        border border-white/10
        bg-white/[0.04]
        backdrop-blur-xl
        p-8
        shadow-[0_25px_80px_rgba(0,0,0,0.45)]
        space-y-8
        "
        >

        <div className="text-sm text-white/60 uppercase tracking-widest">
            Steps
        </div>

        {steps.map((step) => (

            <div
            key={step.step_id}
            className="
            border border-white/10
            rounded-2xl
            p-6
            bg-black/30
            shadow-[0_10px_30px_rgba(0,0,0,0.35)]
            space-y-4
            transition
            "
            >

            <div className="text-xs text-white/40 uppercase tracking-widest">
                Step {step.step_number}
            </div>

            <div className="text-base font-semibold text-white/90">
                {step.title}
            </div>

            <div className="text-sm text-white/60 leading-relaxed">
                {step.description}
            </div>

            {step.question && (
                <div className="text-sm text-orange-300">
                Question: {step.question}
                </div>
            )}

            {/* HINTS */}

            {step.hints.length > 0 && (

                <div className="pt-4 space-y-3">

                <div className="text-xs text-purple-300 uppercase tracking-widest">
                    💡 Hints
                </div>

                {step.hints.map((hint) => (

                    <div
                    key={hint.hint_id}
                    className="
                    border border-white/10
                    rounded-xl
                    p-4
                    bg-black/40
                    text-sm
                    space-y-1
                    "
                    >

                    <div className="text-white/80 leading-relaxed">
                        Hint {hint.hint_number}: {hint.text}
                    </div>

                    <div className="text-xs text-white/40">
                        Cost: {hint.cost}
                    </div>

                    </div>

                ))}

                </div>

            )}

            </div>

        ))}

        </DashboardCard>

        {/* DELETE LAB */}

        <DashboardCard
        className="
        rounded-3xl
        border border-red-400/20
        bg-red-500/5
        backdrop-blur-xl
        p-6
        space-y-5
        max-w-xl
        "
        >

        <div className="text-red-300 font-semibold">
            Danger Zone
        </div>

        <div className="text-sm text-white/60 leading-relaxed">
            Deleting this lab will permanently remove the lab,
            all associated steps and hints.
        </div>

        <button
            onClick={() => setConfirmDelete(true)}
            className="
            px-5 py-2
            rounded-xl
            border border-red-400/30
            bg-red-500/10
            text-red-200
            text-sm
            hover:bg-red-500/20
            transition
        "
        >
            Delete lab
        </button>

        </DashboardCard>

        {/* DELETE CONFIRMATION */}

        {confirmDelete && (

        <div
            className="
            fixed inset-0
            flex items-center justify-center
            bg-black/60
            backdrop-blur-sm
        "
        >

            <div
            className="
            bg-[#111827]
            border border-white/10
            rounded-2xl
            p-6
            space-y-5
            w-[420px]
            "
            >

            <div className="text-lg font-semibold">
                Delete this lab?
            </div>

            <div className="text-sm text-white/60 leading-relaxed">
                This action cannot be undone.
            </div>

            <div className="flex justify-end gap-3 pt-2">

                <button
                onClick={() => setConfirmDelete(false)}
                className="
                px-4 py-2
                rounded-lg
                border border-white/10
                text-sm
                hover:bg-white/5
                "
                >
                Cancel
                </button>

                <button
                onClick={handleDelete}
                className="
                px-4 py-2
                rounded-lg
                border border-red-400/30
                bg-red-500/20
                text-red-200
                text-sm
                hover:bg-red-500/30
                "
                >
                Delete
                </button>

            </div>

            </div>

        </div>

        )}

    </div>
    );
}