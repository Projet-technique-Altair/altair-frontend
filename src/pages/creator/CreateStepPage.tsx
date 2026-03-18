import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { createStep, createHint } from "@/api/labs";
import type { LabHint, LabStep } from "@/api/types";

import DashboardCard from "@/components/ui/DashboardCard";
import { ALT_COLORS } from "@/lib/theme";

type Hint = LabHint;
type Step = LabStep & {
  validation_type: "exact_match" | "contains" | "regex";
  validation_pattern: string | null;
  points: number;
  hints: Hint[];
};

type StepFieldValue = Step[keyof Step];
type HintFieldValue = Hint[keyof Hint];

export default function LabStepsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [steps, setSteps] = useState<Step[]>([
    {
      step_number: 1,
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

  const handleChange = (
    index: number,
    field: keyof Step,
    value: StepFieldValue
  ) => {
    const copy = [...steps];
    copy[index] = { ...copy[index], [field]: value };
    setSteps(copy);
  };

  const addStep = () => {
    setSteps([
      ...steps,
      {
        step_number: steps.length + 1,
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
  };

  const addHint = (stepIndex: number) => {
    const copy = [...steps];

    copy[stepIndex].hints.push({
      hint_number: copy[stepIndex].hints.length + 1,
      text: "",
      cost: 0,
    });

    setSteps(copy);
  };

  const handleHintChange = (
    stepIndex: number,
    hintIndex: number,
    field: keyof Hint,
    value: HintFieldValue
  ) => {
    const copy = [...steps];

    copy[stepIndex].hints[hintIndex] = {
      ...copy[stepIndex].hints[hintIndex],
      [field]: value,
    };

    setSteps(copy);
  };

  const handleSave = async () => {
    try {

      for (const step of steps) {

        const createdStep = await createStep(id!, {
          step_number: step.step_number,
          title: step.title,
          description: step.description,
          question: step.question,
          expected_answer: step.expected_answer,
          validation_type: step.validation_type,
          validation_pattern: step.validation_pattern,
          points: step.points,
        });

        const stepId = createdStep.step_id;
        if (!stepId) {
          throw new Error("Created step is missing step_id");
        }

        for (const hint of step.hints) {
          await createHint(id!, stepId, hint);
        }

      }

      navigate("/creator/dashboard");

    } catch (err) {
      console.error("Failed to create lab", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white px-8 py-10 space-y-8">

      {/* HEADER */}
      <div>
        <h1
          className="text-3xl font-bold"
          style={{
            background: `linear-gradient(90deg, ${ALT_COLORS.purple}, ${ALT_COLORS.orange})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Lab Steps
        </h1>

        <p className="text-white/50 text-sm mt-1">
          Define the progression of your lab.
        </p>
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

        {steps.map((step, i) => (
          <div
            key={i}
            className="
            border border-white/10
            rounded-2xl
            p-6
            bg-black/30
            space-y-4
            hover:border-sky-400/30
            transition
          "
          >

            <div className="text-xs text-white/40 uppercase tracking-widest">
              Step {step.step_number}
            </div>

            <input
              placeholder="Step title"
              value={step.title}
              onChange={(e) => handleChange(i, "title", e.target.value)}
              className="
              w-full rounded-xl border border-white/10 bg-black/30
              px-4 py-3 text-sm outline-none
              hover:border-sky-400/30 focus:border-sky-400/50
            "
            />

            <textarea
              placeholder="Description"
              value={step.description}
              onChange={(e) => handleChange(i, "description", e.target.value)}
              className="
              w-full rounded-xl border border-white/10 bg-black/30
              px-4 py-3 text-sm outline-none
              hover:border-purple-400/30 focus:border-purple-400/50
            "
            />

            <input
              placeholder="Question"
              value={step.question}
              onChange={(e) => handleChange(i, "question", e.target.value)}
              className="
              w-full rounded-xl border border-white/10 bg-black/30
              px-4 py-3 text-sm outline-none
              hover:border-orange-400/30 focus:border-orange-400/50
            "
            />

            <input
              placeholder="Expected answer"
              value={step.expected_answer}
              onChange={(e) =>
                handleChange(i, "expected_answer", e.target.value)
              }
              className="
              w-full rounded-xl border border-white/10 bg-black/30
              px-4 py-3 text-sm outline-none
              hover:border-sky-400/30 focus:border-sky-400/50
            "
            />

            <select
              value={step.validation_type}
              onChange={(e) =>
                handleChange(i, "validation_type", e.target.value)
              }
              className="
              w-full rounded-xl border border-white/10 bg-black/30
              px-4 py-3 text-sm outline-none
              hover:border-purple-400/30 focus:border-purple-400/50
            "
            >
              <option value="exact_match">Exact match</option>
              <option value="contains">Contains</option>
              <option value="regex">Regex</option>
            </select>

            <input
              placeholder="Validation pattern (optional)"
              value={step.validation_pattern ?? ""}
              onChange={(e) =>
                handleChange(
                  i,
                  "validation_pattern",
                  e.target.value === "" ? null : e.target.value
                )
              }
              className="
              w-full rounded-xl border border-white/10 bg-black/30
              px-4 py-3 text-sm outline-none
              hover:border-orange-400/30 focus:border-orange-400/50
            "
            />

            <input
              type="number"
              value={step.points}
              onChange={(e) =>
                handleChange(i, "points", Number(e.target.value))
              }
              className="
              w-full rounded-xl border border-white/10 bg-black/30
              px-4 py-3 text-sm outline-none
              hover:border-sky-400/30 focus:border-sky-400/50
            "
            />

            {/* HINTS */}

            <div className="pt-3 space-y-3">

              <div className="text-xs text-purple-300 uppercase tracking-widest">
                💡 Hints
              </div>

              {step.hints.map((hint, h) => (

                <div
                  key={h}
                  className="
                  border border-white/10
                  rounded-xl
                  p-4
                  bg-black/40
                  space-y-2
                "
                >

                  <textarea
                    placeholder="Hint text"
                    value={hint.text}
                    onChange={(e) =>
                      handleHintChange(i, h, "text", e.target.value)
                    }
                    className="
                    w-full rounded-xl border border-white/10 bg-black/30
                    px-3 py-2 text-sm outline-none
                    hover:border-purple-400/30
                    focus:border-purple-400/50
                  "
                  />

                  <input
                    type="number"
                    placeholder="Cost"
                    value={hint.cost}
                    onChange={(e) =>
                      handleHintChange(i, h, "cost", Number(e.target.value))
                    }
                    className="
                    w-full rounded-xl border border-white/10 bg-black/30
                    px-3 py-2 text-sm outline-none
                    hover:border-sky-400/30
                    focus:border-sky-400/50
                  "
                  />

                </div>

              ))}

              <button
                onClick={() => addHint(i)}
                className="
                text-xs text-purple-300
                hover:text-purple-200
                transition
              "
              >
                + Add hint
              </button>

            </div>

          </div>
        ))}

        <div className="flex gap-4 pt-4">

          <button
            onClick={addStep}
            className="
            px-5 py-2 rounded-xl
            border border-purple-400/30
            bg-purple-500/10 text-purple-200 text-sm
            hover:bg-purple-500/15 hover:border-purple-400/50
            transition
          "
          >
            + Add step
          </button>

          <button
            onClick={handleSave}
            className="
            px-5 py-2 rounded-xl
            border border-sky-400/30
            bg-sky-500/10 text-sky-200 text-sm font-medium
            hover:bg-sky-500/15 hover:border-sky-400/50
            hover:shadow-[0_0_14px_rgba(120,200,255,0.35)]
            transition
          "
          >
            Save lab
          </button>

        </div>

      </DashboardCard>
    </div>
  );
}
