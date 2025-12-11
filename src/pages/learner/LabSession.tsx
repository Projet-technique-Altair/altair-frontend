// src/pages/learner/LabSession.tsx

/**
 * @file LabSession — interactive learner lab session environment.
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { api } from "@/api";

import LabHeader from "@/components/labs/LabHeader";
import LabInstructions from "@/components/labs/LabInstructions";
import Terminal from "@/components/labs/Terminal";
import { useLabTimer } from "@/hooks/useLabTimer";

// === Types derived from API ===
type RawLab = Awaited<ReturnType<typeof api.getLabById>>;
type LabStep = {
  title: string;
  instruction: string;
  expected?: string;
  hint?: string;
  solution?: string;
};

// === The processed structure used by the frontend ===
type LabDetails = {
  id: string;
  name: string;
  description?: string;
  steps: LabStep[];
};

export default function LabSession() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lab, setLab] = useState<LabDetails | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [userInput, setUserInput] = useState("");

  const { formatted } = useLabTimer();

  // === MAPPING FUNCTION ===
  function mapLab(raw: RawLab): LabDetails {
    return {
      id: raw.lab_id ?? raw.id ?? "unknown",
      name: raw.name ?? "Untitled Lab",
      description: raw.description ?? "No description provided.",

      // If backend doesn't return steps => fallback to a "dummy" step
      steps: raw.steps ?? [
        {
          title: "Lab Not Configured",
          instruction:
            "This lab does not contain interactive steps yet. Ask your instructor or check backend configuration.",
          expected: "",
          hint: "",
          solution: "",
        },
      ],
    };
  }

  // === FETCH LAB ===
  useEffect(() => {
    let cancelled = false;
    if (!id) return;

    api
      .getLabById(id)
      .then((raw) => {
        if (cancelled) return;
        if (!raw) return navigate("/learner/dashboard");

        const processed = mapLab(raw);
        setLab(processed);
      })
      .catch(() => navigate("/learner/dashboard"));

    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  // === LOADING ===
  if (!lab) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">
        <div className="text-slate-400 animate-pulse text-sm">
          Loading session...
        </div>
      </div>
    );
  }

  // === RESOLVE CURRENT STEP ===
  const steps = lab.steps;
  const current = steps[currentStep];

  // === Case: no interactive steps ===
  if (!current) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center text-center p-8">
        <div className="space-y-4">
          <div className="text-xl font-semibold text-white">
            This lab has no interactive steps yet.
          </div>
          <button
            onClick={() => navigate("/learner/dashboard")}
            className="px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-[#2AA7FF] via-[#7A2CF3] to-[#FF8C4A] hover:opacity-90 transition"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // === HANDLERS ===
  const handleValidate = () => {
    if (userInput.trim() === current.expected?.trim()) {
      setFeedback("✅ Correct!");
      setTimeout(() => {
        setFeedback(null);
        setUserInput("");
        if (currentStep < steps.length - 1) {
          setCurrentStep((s) => s + 1);
        } else {
          setFeedback("🎉 Lab completed!");
        }
      }, 900);
    } else {
      setFeedback("❌ Try again!");
    }
  };

  const handleHint = () => {
    setFeedback(current.hint ? `💡 Hint: ${current.hint}` : "No hint available.");
  };

  const handleSolution = () => {
    setFeedback(
      current.solution ? `📄 Solution: ${current.solution}` : "No solution provided."
    );
  };

  const handleEndSession = () => navigate("/learner/dashboard");

  const progressRatio = (currentStep + 1) / steps.length;

  // === UI ===
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col">
      {/* HEADER */}
      <div className="border-b border-white/5 bg-[#0E1323] px-6 py-4 flex flex-col sm:flex-row sm:items-start sm:justify-between">
        <LabHeader labName={lab.name} onExit={handleEndSession} timer={formatted} />
      </div>

      {/* GRID */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6 p-6">
        {/* LEFT */}
        <div className="bg-[#0E1323] border border-white/5 rounded-xl p-6">
          <LabInstructions
            stepIndex={currentStep}
            totalSteps={steps.length}
            step={current}
            userInput={userInput}
            onChangeInput={setUserInput}
            onValidate={handleValidate}
            onHint={handleHint}
            onSolution={handleSolution}
            feedback={feedback}
          />

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between text-xs text-slate-400">
            <button
              disabled={currentStep === 0}
              onClick={() => {
                setFeedback(null);
                setUserInput("");
                setCurrentStep((s) => Math.max(0, s - 1));
              }}
              className={`px-3 py-1 rounded-md border border-white/10 ${
                currentStep === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-white/5"
              }`}
            >
              ← Prev
            </button>

            <div>
              Step {currentStep + 1} / {steps.length}
            </div>

            <button
              disabled={currentStep === steps.length - 1}
              onClick={() => {
                setFeedback(null);
                setUserInput("");
                setCurrentStep((s) => Math.min(steps.length - 1, s + 1));
              }}
              className={`px-3 py-1 rounded-md border border-white/10 ${
                currentStep === steps.length - 1
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:bg-white/5"
              }`}
            >
              Next →
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-8">
            <div className="text-sm font-medium text-white flex items-center gap-2 mb-2">
              <span className="inline-block w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_10px_#38bdf8]" />
              <span>Progress</span>
              <span className="text-slate-400 text-xs">
                ({currentStep + 1}/{steps.length})
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden flex">
              <div
                className="h-2 bg-gradient-to-r from-sky-400 via-purple-400 to-orange-400 transition-all duration-300"
                style={{ width: `${progressRatio * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-[#0E1323] border border-white/5 rounded-xl p-6 flex flex-col">
          <Terminal step={current} />
        </div>
      </div>
    </div>
  );
}
