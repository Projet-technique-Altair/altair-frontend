/**
 * @file UI component providing an interactive terminal simulation
 * for executing lab commands within an Altair lab step.
 *
 * @packageDocumentation
 */

import { useMemo, useState } from "react";
import { Play } from "lucide-react";

/**
 * Keep the step type local to avoid import/type coupling issues.
 */
export type LabStep = {
  title: string;
  instruction: string;
  expected?: string;
  hint?: string;
  solution?: string;
};

interface TerminalProps {
  step: LabStep;
}

export default function Terminal({ step }: TerminalProps) {
  const [output, setOutput] = useState<string[]>([]);
  const [command, setCommand] = useState("");

  const expected = useMemo(() => (step.expected ?? "").trim(), [step.expected]);

  const handleRun = () => {
    const trimmed = command.trim();
    if (!trimmed) return;

    let result = "";
    if (!expected) {
      result = "⚠️ No expected command defined for this step.";
    } else if (trimmed === expected) {
      result = "✅ Command executed successfully.";
    } else {
      result = "❌ Unknown command or invalid syntax.";
    }

    setOutput((prev) => [...prev, `$ ${trimmed}`, result]);
    setCommand("");
  };

  return (
    <div className="h-full rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_18px_60px_rgba(0,0,0,0.45)] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/20">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-300/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
          </div>
          <span className="ml-2 text-xs text-white/70 tracking-wide">
            INTERACTIVE TERMINAL
          </span>
        </div>

        <div className="text-[11px] text-white/45">
          {expected ? "Signal: locked" : "Signal: undefined"}
        </div>
      </div>

      {/* Output */}
      <div className="flex-1 overflow-y-auto px-4 py-4 font-mono text-sm text-white/80">
        {output.length === 0 ? (
          <p className="text-white/35 italic">No commands executed yet…</p>
        ) : (
          <div className="space-y-1.5">
            {output.map((line, i) => {
              const isPrompt = line.startsWith("$ ");
              const isOk = line.startsWith("✅");
              const isErr = line.startsWith("❌");
              const isWarn = line.startsWith("⚠️");

              return (
                <div
                  key={i}
                  className={[
                    "whitespace-pre-wrap break-words",
                    isPrompt && "text-white/70",
                    isOk && "text-green-200",
                    isErr && "text-red-200",
                    isWarn && "text-yellow-200",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {line}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-white/10 bg-black/20 p-3">
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
          <span className="font-mono text-sky-300">$</span>

          <input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRun()}
            placeholder="Type a command…"
            className="flex-1 bg-transparent outline-none text-sm font-mono text-white/85 placeholder:text-white/35"
          />

          <button
            onClick={handleRun}
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-white/80 border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/15 transition"
            aria-label="Run command"
            title="Run"
          >
            <Play className="h-3.5 w-3.5" />
            Run
          </button>
        </div>
      </div>
    </div>
  );
}
