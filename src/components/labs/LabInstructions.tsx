/**
 * @file UI component rendering the interactive instruction section
 * for each lab step in an Altair lab session.
 *
 * @packageDocumentation
 */

import { useState } from "react";

import { ALT_COLORS } from "@/lib/theme";
import { CheckCircle2, Lightbulb, CornerDownLeft } from "lucide-react";

/**
 * Keep the step type local to avoid type coupling issues across modules.
 * It matches the shape used by LabSession.
 */
export type LabStep = {
  step_id?: string;
  step_number?: number;
  title: string;
  instruction: string;
  question?: string;
  points?: number;
  has_validation?: boolean;
  hints?: Array<{
    hint_number: number;
    cost: number;
    text: string;
  }>;
};

interface LabInstructionsProps {
  step: LabStep;
  stepIndex: number;
  totalSteps: number;
  unlockedStepIndex: number;
  userInput: string;
  feedback?: string | null;
  currentScore?: number;
  maxScore?: number;
  revealedHints?: Array<{
    hint_number: number;
    cost: number;
    text: string;
  }>;
  onChangeInput: (value: string) => void;
  onValidate: () => void;
  onHint: () => void;
}

function feedbackTone(feedback: string) {
  if (feedback.startsWith("✅")) return "border-green-400/25 bg-green-500/10 text-green-200";
  if (feedback.startsWith("❌")) return "border-red-400/25 bg-red-500/10 text-red-200";
  if (feedback.startsWith("💡")) return "border-yellow-400/25 bg-yellow-500/10 text-yellow-200";
  if (feedback.startsWith("📄")) return "border-sky-400/25 bg-sky-500/10 text-sky-200";
  return "border-purple-400/25 bg-purple-500/10 text-purple-200";
}

export default function LabInstructions({
  step,
  stepIndex,
  totalSteps,
  userInput,
  feedback,
  currentScore,
  maxScore,
  revealedHints = [],
  onChangeInput,
  onValidate,
  onHint,
}: LabInstructionsProps) {
  const totalHintPenalty = revealedHints.reduce((sum, hint) => sum + (hint.cost || 0), 0);
  const stepPoints = step.points ?? 0;
  const remainingStepPoints = Math.max(stepPoints - totalHintPenalty, 0);
  const [hintsOpen, setHintsOpen] = useState(false);

  return (
    <div className="space-y-5">
      {/* Step header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.55)]" />
          <div className="text-xs text-white/55 tracking-wide">
            Step <span className="text-white/80">{stepIndex + 1}</span> / {totalSteps}
          </div>
        </div>

        <h2
          className="text-lg sm:text-xl font-semibold leading-snug"
          style={{
            background: `linear-gradient(90deg, ${ALT_COLORS.purple}, ${ALT_COLORS.orange})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {step.title}
        </h2>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 shadow-[0_18px_45px_rgba(0,0,0,0.35)]">
          <div className="space-y-3">
            <p className="text-sm text-white/75 leading-relaxed">{step.instruction}</p>
            {step.question ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-[11px] uppercase tracking-wide text-white/50">Question</div>
                <p className="mt-2 text-sm text-white/85">{step.question}</p>
              </div>
            ) : null}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-white/70">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <div className="text-white/45 uppercase tracking-wide">Step points</div>
                <div className="mt-1 text-white font-semibold">{stepPoints}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <div className="text-white/45 uppercase tracking-wide">Hint penalty</div>
                <div className="mt-1 text-white font-semibold">-{totalHintPenalty}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <div className="text-white/45 uppercase tracking-wide">Step score now</div>
                <div className="mt-1 text-white font-semibold">{remainingStepPoints}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-white/70">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <div className="text-white/45 uppercase tracking-wide">Current step</div>
                <div className="mt-1 text-white font-semibold">
                  {stepIndex + 1} / {totalSteps}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <div className="text-white/45 uppercase tracking-wide">Global score</div>
                <div className="mt-1 text-white font-semibold">
                  {currentScore ?? 0} / {maxScore ?? 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {step.has_validation ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4">
          <label className="block text-xs text-white/55 mb-2">
            Your answer / command{" "}
            <span className="inline-flex items-center gap-1 text-white/40">
              (Enter to validate <CornerDownLeft className="h-3 w-3" />)
            </span>
          </label>

          <div className="relative">
            <input
              value={userInput}
              onChange={(e) => onChangeInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onValidate()}
              placeholder="Type here…"
              className={[
                "w-full rounded-2xl border border-white/10 bg-black/20",
                "px-4 py-3 text-sm text-white/85 placeholder:text-white/35",
                "outline-none focus:border-sky-400/35 focus:ring-2 focus:ring-sky-400/15",
              ].join(" ")}
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={onValidate}
              type="button"
              className={[
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium",
                "text-white shadow-[0_14px_35px_rgba(0,0,0,0.35)]",
                "bg-gradient-to-r from-sky-400/90 via-purple-400/90 to-orange-300/90",
                "hover:opacity-95 transition",
              ].join(" ")}
            >
              <CheckCircle2 className="h-4 w-4" />
              Validate
            </button>

            <button
              onClick={onHint}
              type="button"
              className={[
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium",
                "border border-white/10 bg-black/15 text-white/75",
                "hover:bg-white/8 hover:text-white hover:border-white/15 transition",
              ].join(" ")}
            >
              <Lightbulb className="h-4 w-4 text-yellow-200/80" />
              Reveal next hint
            </button>
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4">
        <button
          type="button"
          onClick={() => setHintsOpen((open) => !open)}
          className="flex w-full items-start justify-between gap-4 text-left"
        >
          <div>
            <div className="text-xs text-white/55 uppercase tracking-wide">Hints</div>
            <p className="mt-1 text-xs text-white/45">
              Hints are hidden by default and reduce the available score for this step when used.
            </p>
          </div>
          <span className="text-xs text-white/55">{hintsOpen ? "Hide" : "Show"}</span>
        </button>

        {hintsOpen ? (
          <div className="mt-3 space-y-2">
            {revealedHints.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 py-3 text-sm text-white/45">
                No hints revealed yet.
              </div>
            ) : (
              revealedHints.map((hint) => (
                <div
                  key={hint.hint_number}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80"
                >
                  <div className="text-xs uppercase tracking-wide text-yellow-200/75">
                    Hint #{hint.hint_number} · -{hint.cost} pts
                  </div>
                  <p className="mt-2 leading-relaxed">{hint.text}</p>
                </div>
              ))
            )}
          </div>
        ) : null}
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={[
            "rounded-2xl border px-4 py-3 text-sm font-medium backdrop-blur-md",
            feedbackTone(feedback),
          ].join(" ")}
        >
          {feedback}
        </div>
      )}
    </div>
  );
}
