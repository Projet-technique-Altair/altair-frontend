// src/pages/creator/components/LabPromptForm.tsx

/**
 * @file Lab Prompt Form — input form for AI-Prof lab generation.
 *
 * @remarks
 * This component is part of the **Altair Creator Dashboard**, allowing
 * creators to define the pedagogical parameters that will guide **AI-Prof**.
 *
 * The form collects:
 * - A lab title
 * - A learning goal (used for AI optimization)
 * - A difficulty level
 * - A list of tags
 *
 * Once submitted, the data is formatted and passed back to the parent
 * component through the `onSubmit` callback to initiate AI generation.
 *
 * @packageDocumentation
 */
import { useState } from "react";



/**
 * Props for the {@link LabPromptForm} component.
 *
 * @property onSubmit - Callback triggered when the user submits the form.
 *   Receives the lab metadata as an object containing title, goal, level, and tags.
 *
 * @public
 */
interface LabPromptFormProps {
  onSubmit: (data: {
    title: string;
    goal: string;
    level: string;
    tags: string[];
  }) => void;
}


/**
 * Displays a form where the creator defines the content parameters
 * for a new AI-generated lab.
 *
 * @remarks
 * - Handles internal state for all input fields using React hooks.
 * - Parses and sanitizes comma-separated tags before submission.
 * - Provides a ready-to-use “Generate with AI-Prof” button that triggers
 *   the parent’s `onSubmit` handler.
 * - Visual styling is consistent with Altair’s dashboard UI, using
 *   semi-transparent surfaces and purple accents.
 *
 * @param onSubmit - Callback invoked with formatted form data when the user confirms.
 *
 * @returns A fully controlled form for defining AI-Prof generation parameters.
 *
 * @public
 */
export default function LabPromptForm({ onSubmit }: LabPromptFormProps) {
  const [title, setTitle] = useState("Linux privilege escalation");
  const [goal, setGoal] = useState(
    "Teach learners how to spot misconfigured sudo rules and escalate privileges safely."
  );
  const [level, setLevel] = useState("Intermediate");
  const [tags, setTags] = useState("linux,security,privilege,sudo");


  /**
   * Handles the form submission:
   * - Prevents native reload
   * - Splits and trims tags from a comma-separated string
   * - Invokes the parent `onSubmit` callback with formatted data
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    onSubmit({ title, goal, level, tags: tagList });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm text-gray-300 mb-1">
          Lab title
        </label>
        <input
          className="w-full bg-[#1A1F2E] border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Blue Team log analysis challenge"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-300 mb-1">
          Learning goal (what IA-Prof should optimise for)
        </label>
        <textarea
          className="w-full bg-[#1A1F2E] border border-white/10 rounded-lg px-4 py-2 text-sm min-h-[110px] focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-sm text-gray-300 mb-1">
            Level
          </label>
          <select
            className="w-full bg-[#1A1F2E] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </div>

        <div className="flex-1 min-w-[180px]">
          <label className="block text-sm text-gray-300 mb-1">
            Tags (comma separated)
          </label>
          <input
            className="w-full bg-[#1A1F2E] border border-white/10 rounded-lg px-3 py-2 text-sm"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>
      </div>

      <button
        type="submit"
        className="px-5 py-2 rounded-lg bg-gradient-to-r from-sky-400 via-purple-400 to-orange-400 text-sm font-semibold hover:opacity-90 transition"
      >
        Generate with AI-Prof
      </button>
    </form>
  );
}
