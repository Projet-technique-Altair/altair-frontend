// src/components/labs/Terminal.tsx
/**
 * @file UI component providing an interactive terminal simulation
 * for executing lab commands within an Altair lab step.
 *
 * @remarks
 * The `Terminal` component emulates a simplified terminal environment
 * where learners can type and execute commands corresponding to the current {@link LabStep}.
 * It provides visual feedback for valid and invalid inputs and logs command history dynamically.
 *
 * This component enhances interactivity within lab sessions by reinforcing
 * the command-line workflow in a sandboxed, client-side environment.
 *
 * @packageDocumentation
 */
import { useState } from "react";
import { LabStep } from "@/api/mockLab";


/**
 * Props for the {@link Terminal} component.
 *
 * @property step - The current {@link LabStep} whose `expected` value defines the valid command.
 *
 * @public
 */
interface TerminalProps {
  step: LabStep;
}


/**
 * Interactive terminal component used in lab sessions.
 *
 * @remarks
 * This component displays:
 * - A simulated terminal header with window controls
 * - A scrollable output area for executed commands and responses
 * - A command-line input field with real-time validation
 *
 * When the learner submits a command:
 * - It compares the input to the `step.expected` command
 * - Displays contextual feedback (success or error)
 * - Updates the command history displayed on screen
 *
 * @param props - {@link TerminalProps} defining the current lab step context.
 * @returns A React JSX element rendering an interactive command-line interface.
 *
 * @public
 */
export default function Terminal({ step }: TerminalProps) {
  const [output, setOutput] = useState<string[]>([]);
  const [command, setCommand] = useState("");

  const handleRun = () => {
    const trimmed = command.trim();
    if (!trimmed) return;

    let result = "";
    if (trimmed === step.expected?.trim()) {
      result = "✅ Command executed successfully.";
    } else {
      result = "❌ Unknown command or invalid syntax.";
    }

    setOutput((prev) => [...prev, `$ ${trimmed}`, result]);
    setCommand("");
  };

  return (
    <div className="flex flex-col h-full bg-[#0B0F19] rounded-xl overflow-hidden border border-white/10">
      <div className="flex items-center gap-2 bg-[#111827] px-4 py-2 text-xs text-slate-400 border-b border-white/10">
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-red-500/80 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-400/80 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500/80 rounded-full"></div>
        </div>
        <span className="ml-2 text-white/60 font-medium">
          Interactive Terminal
        </span>
      </div>

      {/* Zone d’affichage */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-sm text-gray-200">
        {output.length === 0 ? (
          <p className="text-gray-500 italic">No commands executed yet...</p>
        ) : (
          output.map((line, i) => <div key={i}>{line}</div>)
        )}
      </div>

      {/* Ligne de commande */}
      <div className="border-t border-white/10 p-3 flex items-center gap-2 bg-[#0E1323]">
        <span className="text-sky-400 font-mono">$</span>
        <input
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleRun()}
          placeholder="Type a command..."
          className="flex-1 bg-transparent focus:outline-none text-gray-200 text-sm"
        />
      </div>
    </div>
  );
}
