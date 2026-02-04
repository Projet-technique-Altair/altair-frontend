/**
 * @file Creator Starpath Card — interactive dashboard item representing a single starpath.
 *
 * @remarks
 * This component is part of the **Altair Creator Dashboard** and displays a
 * concise summary of one starpath created by the user.
 *
 * Each card shows:
 * - Starpath metadata (title, creation date, rating, labs count, and learners).
 * - Quick action buttons for visibility control (public/private) and deletion.
 * - Smooth hover transitions and visual cues aligned with Altair's UI theme.
 *
 * Clicking on a card navigates the user to the detailed analytics page for
 * the selected starpath.
 *
 * @packageDocumentation
 */

import { useNavigate } from "react-router-dom";
import { Trash2, Eye, EyeOff } from "lucide-react";
import type { CreatorStarpath } from "../CreatorDashboard";


/**
 * Props for the {@link CreatorStarpathCard} component.
 *
 * @property starpath - The starpath object to display (title, stats, and metadata).
 * @property onDelete - Handler executed when the delete button is clicked.
 * @property onToggleVisibility - Handler executed when the visibility toggle is clicked.
 *
 * @public
 */
interface Props {
  starpath: CreatorStarpath;
  onDelete: () => void;
  onToggleVisibility: () => void;
}


/**
 * Displays a starpath card in the Creator Dashboard grid.
 *
 * @remarks
 * - On click: navigates to `/creator/starpath/:id`.
 * - Includes independent buttons (with click propagation stopped) for:
 *   - Visibility toggle between public/private.
 *   - Deletion confirmation trigger.
 * - Uses a blue-tinted hover gradient to differentiate from lab cards (which use purple).
 *
 * @param starpath - Metadata and statistics for the displayed starpath.
 * @param onDelete - Handler that removes this starpath.
 * @param onToggleVisibility - Handler that toggles visibility state.
 *
 * @returns React component representing one starpath card in the dashboard.
 *
 * @public
 */
export default function CreatorStarpathCard({
  starpath,
  onDelete,
  onToggleVisibility,
}: Props) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/creator/starpath/${starpath.id}`)}
      className="
        group relative flex flex-col justify-between
        rounded-2xl bg-[#111827]/70 border border-white/10 p-6
        shadow-[0_0_15px_rgba(0,0,0,0.25)]
        hover:border-sky-400/40 hover:shadow-[0_0_25px_rgba(56,189,248,0.35)]
        transition-all duration-300 cursor-pointer h-[230px]
      "
    >
      {/* HEADER */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-white leading-tight group-hover:text-sky-400 transition">
            {starpath.title}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Created on {new Date(starpath.createdAt).toLocaleDateString("en-GB")}
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div
          className="flex gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onToggleVisibility}
            className="p-2 rounded-lg bg-[#1A1F2E] hover:bg-[#23283a] transition"
            title={
              starpath.visibility === "public"
                ? "Make private"
                : "Publish this starpath"
            }
          >
            {starpath.visibility === "public" ? (
              <Eye className="h-4 w-4 text-green-400" />
            ) : (
              <EyeOff className="h-4 w-4 text-gray-400" />
            )}
          </button>

          <button
            onClick={onDelete}
            className="p-2 rounded-lg bg-[#1A1F2E] hover:bg-[#2b1a1a] transition"
            title="Delete this starpath"
          >
            <Trash2 className="h-4 w-4 text-red-400" />
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 flex flex-col justify-center text-sm text-gray-300">
        <p>
          Rating: <span className="text-white">{starpath.rating}</span>
        </p>
        <p>
          Included Labs: <span className="text-white">{starpath.labsCount}</span>
        </p>
        <p>
          Learners: <span className="text-white">{starpath.learners}</span>
        </p>
      </div>

      {/* FOOTER */}
      <div className="mt-3 text-xs text-gray-500">
        ID: <span className="text-white/70">{starpath.id}</span>
      </div>
    </div>
  );
}
