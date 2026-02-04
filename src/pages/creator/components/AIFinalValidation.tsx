// src/pages/creator/components/AIFinalValidation.tsx

/**
 * @file AI Final Validation — confirmation screen after successful AI review.
 *
 * @remarks
 * This component represents the final confirmation stage of the **AI-Builder**
 * workflow in the Altair Creator Dashboard.  
 * It appears once the generated lab has passed validation from **AI-Prof**
 * (the automated lab evaluation system).
 *
 * The interface provides visual feedback of success and allows the creator
 * to finish the flow and return to their main dashboard.
 *
 * @packageDocumentation
 */
import { motion } from "framer-motion";


/**
 * Props for the {@link AIFinalValidation} component.
 *
 * @property labTitle - Title of the validated lab displayed in the confirmation message.
 * @property onFinish - Callback triggered when the user chooses to exit and return to the dashboard.
 *
 * @public
 */
interface AIFinalValidationProps {
  labTitle: string;
  onFinish: () => void;
}


/**
 * Displays a confirmation card after successful AI-Prof validation.
 *
 * @remarks
 * - Shows a success checkmark animation using Framer Motion.  
 * - Confirms that the AI-generated lab has been validated.  
 * - Allows the creator to complete the process and return to the dashboard.
 *
 * Typically used as the final step in the **AI-Builder** lab creation flow.
 *
 * @param labTitle - The name of the lab validated by AI-Prof.
 * @param onFinish - Function called when the user clicks “Finish”.
 *
 * @returns React component rendering the success confirmation view.
 *
 * @public
 */
export default function AIFinalValidation({
  labTitle,
  onFinish,
}: AIFinalValidationProps) {
  return (
    <div className="rounded-2xl bg-[#0E1323]/80 border border-green-400/30 p-8 flex flex-col items-center gap-4">
      <motion.div
        className="w-14 h-14 rounded-full bg-green-500/20 border border-green-400 flex items-center justify-center text-2xl text-green-300"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35 }}
      >
        ✓
      </motion.div>
      <h2 className="text-lg font-semibold text-white">
        AI-Prof validation passed
      </h2>
      <p className="text-sm text-gray-400 text-center max-w-md">
        The generated lab <span className="text-sky-400">{labTitle}</span> has been reviewed.
        You can now keep it as private (default) or make it public later.
      </p>

      <button
        onClick={onFinish}
        className="mt-2 px-5 py-2 rounded-lg bg-gradient-to-r from-green-400 to-sky-400 text-sm font-semibold hover:opacity-90 transition"
      >
        Finish and go back to dashboard
      </button>
    </div>
  );
}
