// src/pages/creator/CreatorLabEditPage.tsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import DashboardCard from "@/components/ui/DashboardCard";
import { ALT_COLORS } from "@/lib/theme";
import { api } from "@/api";

type Hint = {
  hint_id?: string;
  hint_number: number;
  cost: number;
  text: string;
};

type Step = {
  step_id?: string;
  step_number: number;
  title: string;
  description: string;
  question: string;
  expected_answer: string;
  validation_type: "exact_match" | "contains" | "regex";
  validation_pattern?: string | null;
  points: number;
  hints: Hint[];
};

export default function CreatorLabEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    description: "",
    difficulty: "easy",
    template_path: "",
    lab_type: "",
    estimated_duration: "",
  });

  const [steps, setSteps] = useState<Step[]>([]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // LOAD LAB
  useEffect(() => {
    async function loadLab() {
      try {
        const lab = await api.getLab(id!);

        const stepsData = await api.getSteps(id!);

        const stepsWithHints = await Promise.all(
        stepsData.map(async (step: any) => {
            const hints = await api.getHints(id!, step.step_id);

            return {
            ...step,
            hints,
            };
        })
        );
setSteps(stepsWithHints);

setForm({
  name: lab.name ?? "",
  description: lab.description ?? "",
  difficulty: lab.difficulty?.toLowerCase() ?? "easy",
  template_path: lab.template_path ?? "",
  lab_type: lab.lab_type ?? "",
  estimated_duration: lab.estimated_duration ?? "",
});

      } catch (err) {
        console.error("Failed to load lab", err);
      } finally {
        setLoading(false);
      }
    }

    loadLab();
  }, [id]);

  const handleSave = async () => {
    try {

        await api.updateLab(id!, form);

        for (const step of steps) {

        let stepId = step.step_id;

        if (stepId) {
            await api.updateStep(id!, stepId, step);
        } else {
            const created = await api.createStep(id!, step);
            stepId = created.step_id;
        }

        for (const hint of step.hints) {

            if (hint.hint_id) {
            await api.updateHint(id!, stepId!, hint.hint_id, hint);
            } else {
            await api.createHint(id!, stepId!, hint);
            }

        }
        }

        navigate(`/creator/lab/${id}`);

    } catch (err) {
        console.error("Failed to update lab", err);
    }
    };

    const handleDeleteStep = async (stepIndex: number) => {
    const step = steps[stepIndex];

    try {
        if (step.step_id) {
        await api.deleteStep(id!, step.step_id);
        }

        const copy = [...steps];
        copy.splice(stepIndex, 1);

        copy.forEach((s, i) => {
        s.step_number = i + 1;
        });

        setSteps(copy);

    } catch (err) {
        console.error("Failed to delete step", err);
    }
    };

    const handleDeleteHint = async (
    stepIndex: number,
    hintIndex: number
    ) => {
    const step = steps[stepIndex];
    const hint = step.hints[hintIndex];

    try {
        if (hint.hint_id) {
        await api.deleteHint(id!, step.step_id!, hint.hint_id);
        }

        const copy = [...steps];
        copy[stepIndex].hints.splice(hintIndex, 1);

        copy[stepIndex].hints.forEach((h, i) => {
        h.hint_number = i + 1;
        });

        setSteps(copy);

    } catch (err) {
        console.error("Failed to delete hint", err);
    }
    };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white px-8 py-10 space-y-8">

      {/* HEADER */}

      <div className="flex justify-between items-center">

        <h1
            className="text-3xl font-bold"
            style={{
            background: `linear-gradient(90deg, ${ALT_COLORS.purple}, ${ALT_COLORS.orange})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            }}
        >
            Edit Lab
        </h1>

        <div className="flex items-center gap-4">

            <button
            onClick={() => navigate(`/creator/lab/${id}`)}
            className="text-white/60 hover:text-white transition text-sm"
            >
            ← Back to lab
            </button>

            <button
            onClick={handleSave}
            className="
            px-6 py-2
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
            Save changes
            </button>

        </div>

        </div>

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

        {/* NAME */}

        <div>
          <label className="text-xs text-white/40 uppercase tracking-widest">
            Name
          </label>

          <input
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="
            mt-2 w-full
            rounded-xl border border-white/10
            bg-black/30 px-4 py-3 text-sm
            outline-none
            hover:border-sky-400/30
            focus:border-sky-400/50
          "
          />
        </div>

        {/* DESCRIPTION */}

        <div>
          <label className="text-xs text-white/40 uppercase tracking-widest">
            Description
          </label>

          <textarea
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="
            mt-2 w-full
            rounded-xl border border-white/10
            bg-black/30 px-4 py-3 text-sm
            outline-none
            hover:border-purple-400/30
            focus:border-purple-400/50
          "
          />
        </div>

        {/* GRID */}

        <div className="grid grid-cols-2 gap-6">

          <div>
            <label className="text-xs text-white/40 uppercase tracking-widest">
              Difficulty
            </label>

            <select
              value={form.difficulty}
              onChange={(e) => handleChange("difficulty", e.target.value)}
              className="
              mt-2 w-full
              rounded-xl border border-white/10
              bg-black/30 px-4 py-3 text-sm
              outline-none
            "
            >
              <option value="easy">easy</option>
              <option value="medium">medium</option>
              <option value="hard">hard</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-white/40 uppercase tracking-widest">
              Estimated duration
            </label>

            <input
              value={form.estimated_duration}
              onChange={(e) =>
                handleChange("estimated_duration", e.target.value)
              }
              className="
              mt-2 w-full
              rounded-xl border border-white/10
              bg-black/30 px-4 py-3 text-sm
              outline-none
            "
            />
          </div>

        </div>

        {/* TEMPLATE */}

        <div>
          <label className="text-xs text-white/40 uppercase tracking-widest">
            Template path
          </label>

          <input
            value={form.template_path}
            onChange={(e) => handleChange("template_path", e.target.value)}
            className="
            mt-2 w-full
            rounded-xl border border-white/10
            bg-black/30 px-4 py-3 text-sm
            outline-none
          "
          />
        </div>

        {/* LAB TYPE */}

        <div>
          <label className="text-xs text-white/40 uppercase tracking-widest">
            Lab type
          </label>

          <input
            value={form.lab_type}
            onChange={(e) => handleChange("lab_type", e.target.value)}
            className="
            mt-2 w-full
            rounded-xl border border-white/10
            bg-black/30 px-4 py-3 text-sm
            outline-none
          "
          />
        </div>


      </DashboardCard>

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

        <div className="text-sm text-white/60 uppercase tracking-widest">
        Steps
        </div>

        {steps.map((step, stepIndex) => (

        <div
        key={stepIndex}
        className="
        border border-white/10
        rounded-2xl
        p-6
        bg-black/30
        space-y-4
        "
        >

        <div className="flex justify-between items-center">

        <div className="text-xs text-white/40 uppercase tracking-widest">
            Step {step.step_number}
        </div>

        <button
            disabled={steps.length === 1}
            onClick={() => handleDeleteStep(stepIndex)}
            className="
            text-red-400 text-xs hover:text-red-300
            disabled:opacity-30 disabled:cursor-not-allowed
            "
        >
        Delete
        </button>

        </div>

        <input
        value={step.title}
        onChange={(e) => {
            const copy = [...steps];
            copy[stepIndex].title = e.target.value;
            setSteps(copy);
        }}
        placeholder="Step title"
        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm"
        />

        <textarea
        value={step.description}
        onChange={(e) => {
            const copy = [...steps];
            copy[stepIndex].description = e.target.value;
            setSteps(copy);
        }}
        placeholder="Description"
        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm"
        />

        <input
        value={step.question}
        onChange={(e) => {
            const copy = [...steps];
            copy[stepIndex].question = e.target.value;
            setSteps(copy);
        }}
        placeholder="Question"
        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm"
        />

        <input
        value={step.expected_answer}
        onChange={(e) => {
            const copy = [...steps];
            copy[stepIndex].expected_answer = e.target.value;
            setSteps(copy);
        }}
        placeholder="Expected answer"
        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm"
        />

        {/* HINTS */}

        <div className="space-y-2 pt-2">

        <div className="text-xs text-purple-300 uppercase tracking-widest">
        Hints
        </div>

        {step.hints.map((hint, hintIndex) => (

        <div key={hintIndex} className="flex gap-2 items-center">

        <input
            value={hint.text}
            onChange={(e) => {
            const copy = [...steps];
            copy[stepIndex].hints[hintIndex].text = e.target.value;
            setSteps(copy);
            }}
            placeholder={`Hint ${hintIndex + 1}`}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm"
        />

        <button
            onClick={() => handleDeleteHint(stepIndex, hintIndex)}
            className="text-red-400 text-xs hover:text-red-300"
        >
            ✕
        </button>

        </div>

        ))}

        <button
        onClick={() => {
            const copy = [...steps];
            copy[stepIndex].hints.push({
            hint_number: step.hints.length + 1,
            cost: 0,
            text: "",
            });
            setSteps(copy);
        }}
        className="text-xs text-purple-300 hover:text-purple-200"
        >
        + Add hint
        </button>

        </div>

        </div>

        ))}

        <button
        onClick={() => {
            setSteps([
            ...steps,
            {
                step_number: Math.max(0, ...steps.map(s => s.step_number)) + 1,
                title: "",
                description: "",
                question: "",
                expected_answer: "",
                validation_type: "exact_match",
                validation_pattern: null,
                points: 10,
                hints: [],
            },
            ]);
        }}
        className="
        px-4 py-2
        rounded-xl
        border border-purple-400/30
        bg-purple-500/10
        text-purple-200
        text-sm
        "
        >
        + Add step
        </button>

        </DashboardCard>

    </div>
  );
}