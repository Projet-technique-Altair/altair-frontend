// src/pages/creator/components/LabSelector.tsx

/**
 * @file Lab Selector — selection grid for including labs in a Starpath.
 *
 * @remarks
 * This component is used within the **Altair Creator Dashboard** to allow
 * creators to choose which labs should be included in a Starpath or grouped
 * collection.
 *
 * It provides:
 * - A searchable list of available labs.
 * - Interactive selection with visual highlighting.
 * - Real-time feedback through a callback when the selected set changes.
 *
 * Styling and layout are consistent with Altair’s dashboard visual theme.
 *
 * @packageDocumentation
 */

import { useState } from "react";
import { Check } from "lucide-react";
import DashboardCard from "@/components/ui/DashboardCard";


/**
 * Represents a minimal lab entity used within the selection list.
 *
 * @property id - Unique lab identifier.
 * @property title - Display name of the lab.
 * @property visibility - Indicates whether the lab is public or private.
 * @property rating - Average user rating.
 * @property views - Number of total lab views.
 * @property createdAt - Creation date (ISO string format).
 *
 * @public
 */
export interface Lab {
  id: string;
  title: string;
  visibility: "public" | "private";
  rating: number;
  views: number;
  createdAt: string;
}


/**
 * Props for the {@link LabSelector} component.
 *
 * @property labs - Array of labs available for selection.
 * @property selected - Array of currently selected lab IDs.
 * @property onChange - Callback fired when the selection changes.
 *
 * @public
 */
interface LabSelectorProps {
  labs: Lab[];
  selected: string[];
  onChange: (selected: string[]) => void;
}


/**
 * Displays a searchable, clickable list of labs that can be selected or deselected.
 *
 * @remarks
 * - Includes a search input that filters labs by title in real time.
 * - Clicking a lab toggles its inclusion in the `selected` array.
 * - Selected labs are visually highlighted with a blue accent and checkmark.
 * - Empty state displays a contextual “No labs found” message.
 *
 * @param labs - Available labs to choose from.
 * @param selected - Current selection state (IDs).
 * @param onChange - Function to update the selection.
 *
 * @returns A styled dashboard card containing the lab selection grid.
 *
 * @example
 * ```tsx
 * <LabSelector
 *   labs={availableLabs}
 *   selected={selectedIds}
 *   onChange={setSelectedIds}
 * />
 * ```
 *
 * @public
 */
export default function LabSelector({ labs, selected, onChange }: LabSelectorProps) {
  const [search, setSearch] = useState("");

  /**
   * Toggles the inclusion of a lab in the selection array.
   * If the lab is already selected, it is removed; otherwise, it is added.
   */
  const toggleSelection = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((labId) => labId !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const filteredLabs = labs.filter((lab) =>
    lab.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardCard className="p-6 space-y-4">
      <h2 className="text-lg font-semibold text-sky-400">Select Labs to Include</h2>

      <input
        type="text"
        placeholder="Search by lab title..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-[#1A1F2E] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
        {filteredLabs.map((lab) => (
          <div
            key={lab.id}
            onClick={() => toggleSelection(lab.id)}
            className={`
              cursor-pointer border rounded-lg p-4 transition relative overflow-hidden
              ${
                selected.includes(lab.id)
                  ? "border-sky-400 bg-sky-400/10"
                  : "border-white/10 hover:border-sky-400/30 hover:bg-white/5"
              }
            `}
          >
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-semibold text-white">{lab.title}</h3>
              {selected.includes(lab.id) && (
                <Check className="h-4 w-4 text-sky-400" />
              )}
            </div>
            <p className="text-xs text-gray-400 mb-1">
              {lab.visibility === "public" ? "Public" : "Private"} •{" "}
              {new Date(lab.createdAt).toLocaleDateString("en-US")}
            </p>
            <p className="text-xs text-gray-500">
              ⭐ {lab.rating} • 👁️ {lab.views}
            </p>
          </div>
        ))}

        {filteredLabs.length === 0 && (
          <p className="text-sm text-gray-400 col-span-full text-center italic">
            No labs found.
          </p>
        )}
      </div>
    </DashboardCard>
  );
}
