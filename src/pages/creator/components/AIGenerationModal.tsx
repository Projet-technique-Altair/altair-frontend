// src/pages/creator/components/AIGenerationModal.tsx

/**
 * @file AI Generation Modal — loading interface for AI-Builder or AI-Prof processing.
 *
 * @remarks
 * This component provides an animated modal indicating that a generation or
 * analysis process is currently running in the **Altair Creator Dashboard**.
 *
 * It is used during two phases:
 * - `"ai-builder"` → when AI-Builder is constructing a lab draft.
 * - `"ai-prof"` → when AI-Prof is analysing and validating the lab metadata.
 *
 * Includes a rotating badge animation and a progress shimmer bar to convey
 * ongoing computation feedback.
 *
 * @packageDocumentation
 */
import { motion } from "framer-motion";


/**
 * Props for the {@link AIGenerationModal} component.
 *
 * @property phase - Determines which AI system is active (`"ai-prof"` or `"ai-builder"`).
 * @property title - Optional title of the lab being analysed or generated.
 *
 * @public
 */
interface AIGenerationModalProps {
  phase: "ai-prof" | "ai-builder";
  title?: string;
}


/**
 * Displays a modal during AI-driven lab generation or analysis.
 *
 * @remarks
 * - Uses Framer Motion for continuous rotation and shimmer animations.
 * - Provides distinct feedback depending on the active phase:
 *   - **AI-Prof** → analysing objectives and context.
 *   - **AI-Builder** → generating steps and logic.
 * - Typically appears between the lab form submission and preview display.
 *
 * @param phase - Current AI system state.
 * @param title - Optional lab title displayed in the modal.
 *
 * @returns React component rendering the animated generation modal.
 *
 * @public
 */
export default function AIGenerationModal({ phase, title }: AIGenerationModalProps) {
  const isProf = phase === "ai-prof";

  return (
    <div className="w-full rounded-2xl bg-[#0E1323]/80 border border-white/5 p-8 flex flex-col items-center gap-4">
      <motion.div
        className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-orange-400 flex items-center justify-center text-xl"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
      >
        {isProf ? "P" : "B"}
      </motion.div>

      <h2 className="text-lg font-semibold">
        {isProf ? "AI-Prof is analysing your request..." : "AI-Builder is generating the lab..."}
      </h2>
      {title && <p className="text-sm text-gray-400">“{title}”</p>}

      <div className="w-full bg-[#1A1F2E] rounded-full h-2 mt-4 overflow-hidden">
        <motion.div
          className="h-2 bg-gradient-to-r from-sky-400 via-purple-400 to-orange-400"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
        />
      </div>

      <p className="text-xs text-gray-500 text-center max-w-md">
        {isProf
          ? "Understanding objectives, difficulty, domain, and expected environment."
          : "Building steps, commands, expected answers and validation logic."}
      </p>
    </div>
  );
}
