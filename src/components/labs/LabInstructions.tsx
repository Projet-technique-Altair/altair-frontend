// src/components/labs/LabInstructions.tsx
/**
 * @file UI component rendering the interactive instruction section
 * for each lab step in an Altair lab session.
 *
 * @remarks
 * The `LabInstructions` component displays the current step title, instructions,
 * and interactive controls such as input fields, validation, hint, and solution buttons.
 * It handles user input and feedback dynamically as part of the lab workflow.
 *
 * @packageDocumentation
 */
import { LabStep } from "@/api/mockLab";
import { ALT_COLORS } from "@/lib/theme";


/**
 * Props for the {@link LabInstructions} component.
 *
 * @property step - The current {@link LabStep} data object containing instructions and metadata.
 * @property stepIndex - Index of the current step in the sequence.
 * @property totalSteps - Total number of steps in the lab session.
 * @property userInput - The learner’s current response or command input.
 * @property feedback - Optional message displayed after validation or hint request.
 * @property onChangeInput - Callback invoked when the input field value changes.
 * @property onValidate - Callback triggered when the user validates their answer.
 * @property onHint - Callback triggered when the user requests a hint.
 * @property onSolution - Callback triggered when the user requests the full solution.
 *
 * @public
 */
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


/**
 * Displays a single lab instruction step with interactive elements.
 *
 * @remarks
 * Includes:
 * - The current step title and instruction text
 * - Input field for learner response
 * - Action buttons for validation, hint, and solution
 * - Dynamic feedback message reflecting user progress
 *
 * This component forms the interactive core of lab sessions in the Altair learning flow.
 *
 * @param props - {@link LabInstructionsProps} defining the current lab step and handlers.
 * @returns A React JSX element rendering the interactive instruction view.
 *
 * @public
 */
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
      {/* Étape */}
      <div>
        <h2
          className="text-lg font-semibold mb-2"
          style={{
            background: `linear-gradient(90deg, ${ALT_COLORS.purple}, ${ALT_COLORS.orange})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          • Step {stepIndex + 1}/{totalSteps} — {step.title}
        </h2>
        <p className="text-slate-300 text-sm leading-relaxed">
          {step.instruction}
        </p>
      </div>

      {/* Champ de réponse */}
      <div>
        <input
          value={userInput}
          onChange={(e) => onChangeInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onValidate()}
          placeholder="Your answer or command..."
          className="w-full p-3 rounded-lg bg-[#0E1323]/80 border border-white/10 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7A2CF3]/60"
        />
      </div>

      {/* Boutons d’action */}
      <div className="flex flex-wrap gap-3 items-center">
        <button
          onClick={onValidate}
          className="px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-[#2AA7FF] via-[#7A2CF3] to-[#FF8C4A] hover:opacity-90 transition"
        >
          ✅ Validate Step
        </button>

        <button
          onClick={onHint}
          className="px-4 py-2 rounded-full text-sm font-medium bg-[#1E293B] text-yellow-400 hover:bg-yellow-500/10 border border-yellow-400/40 transition"
        >
          💡 Hint
        </button>

        <button
          onClick={onSolution}
          className="px-4 py-2 rounded-full text-sm font-medium bg-[#1E293B] text-sky-400 hover:bg-sky-500/10 border border-sky-400/40 transition"
        >
          📜 Solution
        </button>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`mt-4 text-sm font-medium ${
            feedback.startsWith("✅")
              ? "text-green-400"
              : feedback.startsWith("❌")
              ? "text-red-400"
              : feedback.startsWith("💡")
              ? "text-yellow-400"
              : feedback.startsWith("📄")
              ? "text-sky-400"
              : "text-purple-400"
          }`}
        >
          {feedback}
        </div>
      )}
    </div>
  );
}
