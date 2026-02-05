/**
 * @file UI component rendering the interactive instruction section
 * for each lab step in an Altair lab session.
 *
 * @packageDocumentation
 */

import { ALT_COLORS } from "@/lib/theme";
import { CheckCircle2, Lightbulb, ScrollText, CornerDownLeft } from "lucide-react";

/**
 * Keep the step type local to avoid type coupling issues across modules.
 * It matches the shape used by LabSession.
 */
export type LabStep = {
  title: string;
  instruction: string;
  expected?: string;
  hint?: string;
  solution?: string;
};

interface LabInstructionsProps {
  step: LabStep;
  stepIndex: number;
  totalSteps: number;
  userInput: string;
  feedback?: string | null;
  onChangeInput: (value: string) => void;
  onValidate: () => void;
  onHint: () => void;
  onSolution: () => void;
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
  onChangeInput,
  onValidate,
  onHint,
  onSolution,
}: LabInstructionsProps) {
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
          <p className="text-sm text-white/75 leading-relaxed">{step.instruction}</p>
        </div>
      </div>

      {/* Input */}
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

        {/* Actions */}
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
            Hint
          </button>

          <button
            onClick={onSolution}
            type="button"
            className={[
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium",
              "border border-white/10 bg-black/15 text-white/75",
              "hover:bg-white/8 hover:text-white hover:border-white/15 transition",
            ].join(" ")}
          >
            <ScrollText className="h-4 w-4 text-sky-200/80" />
            Solution
          </button>
        </div>
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
