/**
 * @file UI component displaying the lab session header.
 *
 * @remarks
 * The `LabHeader` component is used at the top of a lab session view
 * to display the current lab name, an optional countdown timer,
 * and a session termination button when applicable.
 *
 * It visually integrates Altair’s signature color gradient
 * and responsive design for both mobile and desktop layouts.
 *
 * @packageDocumentation
 */

import { ALT_COLORS } from "@/lib/theme";
import { Clock3, LogOut } from "lucide-react";

interface LabHeaderProps {
  labName: string;
  timer?: string;
  onExit?: () => void;
}

export default function LabHeader({ labName, timer, onExit }: LabHeaderProps) {
  return (
    <div className="w-full flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Title block */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h1
            className="text-2xl sm:text-3xl font-semibold tracking-tight leading-tight"
            style={{
              background: `linear-gradient(90deg, ${ALT_COLORS.blue}, ${ALT_COLORS.purple}, ${ALT_COLORS.orange})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {labName}
          </h1>

          <span className="hidden sm:inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] tracking-wide text-white/60 backdrop-blur-md">
            SESSION
          </span>
        </div>

        <p className="text-xs text-white/50">
          Follow the steps • validate when ready • keep a clean signal
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {timer && (
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/70 backdrop-blur-md">
            <Clock3 className="h-4 w-4 text-white/60" />
            <span className="font-mono">{timer}</span>
          </div>
        )}

        {onExit && (
          <button
            onClick={onExit}
            className={[
              "inline-flex items-center gap-2 rounded-full px-3 py-2",
              "border border-white/10 bg-white/5 backdrop-blur-md",
              "text-xs text-white/80 hover:text-white",
              "hover:bg-white/8 hover:border-white/15 transition",
            ].join(" ")}
            aria-label="End session"
            title="End session"
            type="button"
          >
            <LogOut className="h-4 w-4 text-red-300/90" />
            <span className="hidden sm:inline">End</span>
          </button>
        )}
      </div>
    </div>
  );
}
