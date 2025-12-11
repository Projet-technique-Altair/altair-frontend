// src/components/labs/LabHeader.tsx
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

/**
 * Props for the {@link LabHeader} component.
 *
 * @property labName - The display name of the current lab session.
 * @property timer - Optional string showing elapsed or remaining time (e.g. `"12:30"`).
 * @property onExit - Optional callback triggered when the user ends the lab session.
 *
 * @public
 */
interface LabHeaderProps {
  labName: string;
  timer?: string;
  onExit?: () => void;
}


/**
 * Displays the lab session header section.
 *
 * @remarks
 * Includes:
 * - Gradient-styled lab title using Altair theme colors
 * - Optional timer indicator (⏱)
 * - Optional "End Session" button with red accent
 *
 * Responsive across screen sizes via Tailwind classes.
 *
 * @param props - {@link LabHeaderProps} defining lab name, timer, and exit handler.
 * @returns A React JSX element rendering the session header.
 *
 *
 * @public
 */
export default function LabHeader({ labName, timer, onExit }: LabHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <h1
        className="text-2xl sm:text-3xl font-bold"
        style={{
          background: `linear-gradient(90deg, ${ALT_COLORS.blue}, ${ALT_COLORS.purple}, ${ALT_COLORS.orange})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {labName} — <span className="text-white/80 font-medium">Session</span>
      </h1>

      <div className="flex items-center gap-4">
        {timer && (
          <span className="text-sm font-mono text-slate-400">
            ⏱ {timer}
          </span>
        )}
        {onExit && (
          <button
            onClick={onExit}
            className="px-4 py-2 rounded-full text-sm font-medium bg-[#1E293B] hover:bg-red-500/20 text-red-400 border border-red-400/40 transition"
          >
            ✖ End Session
          </button>
        )}
      </div>
    </div>
  );
}
