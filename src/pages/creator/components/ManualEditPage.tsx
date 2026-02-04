// src/pages/creator/components/ManualEditPage.tsx


/**
 * @file Manual Edit Page — manual lab content editor.
 *
 * @remarks
 * This component is part of the **Altair Creator Dashboard**, providing
 * a manual editing interface for AI-generated lab drafts before final validation.
 *
 * It allows creators to:
 * - Review and adjust the lab title and environment.
 * - Modify or fine-tune each generated step’s title, instruction, and expected answer.
 * - Save the edited lab or cancel and revert to the previous state.
 *
 * Designed for transparency and control during AI-assisted content generation.
 *
 * @packageDocumentation
 */
import { useState } from "react";
import DashboardCard from "@/components/ui/DashboardCard";


/**
 * Props for the {@link ManualEditPage} component.
 *
 * @property lab - The current lab draft object to be edited.
 * @property onSave - Callback triggered when the user confirms the manual edits.
 * @property onCancel - Callback triggered when the user cancels manual editing.
 *
 * @public
 */
interface ManualEditPageProps {
  lab: any;
  onSave: (updatedLab: any) => void;
  onCancel: () => void;
}


/**
 * Displays a structured form allowing the creator to manually edit an
 * AI-generated lab before validation or publishing.
 *
 * @remarks
 * - Each step of the lab can be directly edited (title, instruction, expected output).
 * - Updates are locally managed via React state, without immediate persistence.
 * - Provides “Cancel” and “Save changes” actions for workflow control.
 * - Consistent Altair visual style using the dark dashboard palette.
 *
 * @param lab - Lab object to edit.
 * @param onSave - Callback to save the updated lab object.
 * @param onCancel - Callback to return to the previous screen.
 *
 * @returns A responsive dashboard card with editable lab fields.
 *
 * @example
 * ```tsx
 * <ManualEditPage
 *   lab={generatedLab}
 *   onSave={(lab) => saveUpdatedLab(lab)}
 *   onCancel={() => setEditing(false)}
 * />
 * ```
 *
 * @public
 */
export default function ManualEditPage({ lab, onSave, onCancel }: ManualEditPageProps) {
  const [title, setTitle] = useState(lab.title);
  const [environment, setEnvironment] = useState(lab.environment);
  const [steps, setSteps] = useState(lab.steps);

  const handleStepChange = (i: number, field: string, value: string) => {
    setSteps((prev: any[]) =>
      prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s))
    );
  };

  return (
    <DashboardCard className="p-6 space-y-6">
      <h2 className="text-xl font-semibold text-purple-400">Manual Edit Mode</h2>
      <p className="text-sm text-gray-400">
        You can manually adjust the generated content before validation.
      </p>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-300">Lab title</label>
          <input
            className="w-full bg-[#1A1F2E] border border-white/10 rounded-lg px-3 py-2 mt-1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm text-gray-300">Environment</label>
          <input
            className="w-full bg-[#1A1F2E] border border-white/10 rounded-lg px-3 py-2 mt-1"
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <h3 className="text-sm text-gray-400 font-medium">Steps</h3>
          {steps.map((s: any, i: number) => (
            <div
              key={s.id}
              className="bg-[#0E1323]/80 border border-white/10 rounded-lg p-3 space-y-2"
            >
              <input
                className="w-full bg-[#1A1F2E] border border-white/10 rounded-lg px-3 py-1 text-sm"
                value={s.title}
                onChange={(e) => handleStepChange(i, "title", e.target.value)}
              />
              <textarea
                className="w-full bg-[#1A1F2E] border border-white/10 rounded-lg px-3 py-1 text-sm min-h-[60px]"
                value={s.instruction}
                onChange={(e) => handleStepChange(i, "instruction", e.target.value)}
              />
              <input
                className="w-full bg-[#1A1F2E] border border-white/10 rounded-lg px-3 py-1 text-sm"
                value={s.expected}
                onChange={(e) => handleStepChange(i, "expected", e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg bg-[#1A1F2E] text-sm hover:bg-[#23283a] transition"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave({ ...lab, title, environment, steps })}
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-sky-400 to-purple-500 text-sm font-semibold hover:opacity-90 transition"
        >
          Save changes
        </button>
      </div>
    </DashboardCard>
  );
}
