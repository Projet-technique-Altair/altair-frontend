/**
 * @file Creator Lab Card — interactive dashboard item representing a single lab.
 *
 * @remarks
 * This component is used inside the **Altair Creator Dashboard** to display
 * summarized information about each lab created by the user.
 *
 * Each card provides:
 * - Key metadata (title, creation date, rating, views, participants).
 * - Quick action buttons for toggling visibility or deleting the lab.
 * - Navigation to the detailed lab analytics or management page on click.
 *
 * The card integrates dynamic styling and hover effects consistent with
 * the Altair visual theme.
 *
 * @packageDocumentation
 */

import { useNavigate } from "react-router-dom";
import { Trash2, Eye, EyeOff } from "lucide-react";
import type { CreatorLab } from "../CreatorDashboard";


/**
 * Props for the {@link CreatorLabCard} component.
 *
 * @property lab - The lab metadata to display, including title, date, views, and rating.
 * @property onDelete - Handler triggered when the delete button is pressed.
 * @property onToggleVisibility - Handler triggered when the visibility (public/private) is toggled.
 *
 * @public
 */
interface CreatorLabCardProps {
  lab: CreatorLab;
  onDelete: () => void;
  onToggleVisibility: () => void;
}


/**
 * Displays an interactive lab card within the Creator Dashboard grid.
 *
 * @remarks
 * - Clicking the card navigates to `/creator/lab/:id`.
 * - The top-right buttons allow for quick management actions:
 *   - Toggle public/private state.
 *   - Delete the lab.
 * - Shows computed mock participants count for visual variety.
 *
 * The card’s visuals use gradient hover borders and smooth transitions,
 * following the Altair dashboard design guidelines.
 *
 * @param lab - The lab information to render.
 * @param onDelete - Deletes the selected lab.
 * @param onToggleVisibility - Toggles between public and private visibility.
 *
 * @returns React component representing a single lab entry in the dashboard.
 *
 * @public
 */
export default function CreatorLabCard({
  lab,
  onDelete,
  onToggleVisibility,
}: CreatorLabCardProps) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/creator/lab/${lab.id}`)}
      className="
        group relative flex flex-col justify-between
        rounded-2xl bg-[#111827]/70 border border-white/10 p-6
        shadow-[0_0_15px_rgba(0,0,0,0.25)]
        hover:border-purple-400/40 hover:shadow-[0_0_25px_rgba(168,85,247,0.35)]
        transition-all duration-300 cursor-pointer h-[230px]
      "
    >
      {/* HEADER */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-white leading-tight group-hover:text-purple-400 transition">
            {lab.title}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Created on {new Date(lab.createdAt).toLocaleDateString("en-GB")}
          </p>
        </div>

        {/* ACTION BUTTONS (prevent click propagation) */}
        <div
          className="flex gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onDelete}
            className="p-2 rounded-lg bg-[#1A1F2E] hover:bg-[#23283a] transition"
            title="Delete this lab"
          >
            <Trash2 className="h-4 w-4 text-red-400" />
          </button>
          <button
            onClick={onToggleVisibility}
            className="p-2 rounded-lg bg-[#1A1F2E] hover:bg-[#23283a] transition"
            title={
              lab.visibility === "public"
                ? "Make private"
                : "Publish this lab"
            }
          >
            {lab.visibility === "public" ? (
              <Eye className="h-4 w-4 text-green-400" />
            ) : (
              <EyeOff className="h-4 w-4 text-gray-400" />
            )}
          </button>

        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 flex flex-col justify-center gap-2 text-sm text-gray-300">

        <div className="flex gap-2">
          <span className="text-gray-400">Difficulty:</span>
          <span className="text-white capitalize">{lab.difficulty}</span>
        </div>

        <div className="flex gap-2">
          <span className="text-gray-400">Steps:</span>
          <span className="text-white">{lab.stepsCount}</span>
        </div>

        <div className="flex gap-2">
          <span className="text-gray-400">Duration:</span>
          <span className="text-white">{lab.duration || "—"}</span>
        </div>

      </div>
      {/* FOOTER */}
      <div className="mt-3 text-xs text-gray-500">
        ID: <span className="text-white/70">{lab.id}</span>
      </div>
    </div>
  );
}
