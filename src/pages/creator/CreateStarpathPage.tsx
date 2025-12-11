/**
 * @file Create Starpath Page — assemble multi-lab learning paths.
 *
 * @remarks
 * This page allows creators to **compose Starpaths** by selecting existing labs.
 * A Starpath is a curated learning sequence that connects multiple labs within
 * the same domain or skill theme (e.g., *Cyber Defense Path*).
 *
 * The workflow is straightforward:
 * - Displays all existing labs using {@link LabSelector}.
 * - Allows multiple selections via toggle UI.
 * - Shows a live summary of selected labs for quick review.
 * - In the future, this page could integrate AI-Builder for Starpath generation.
 *
 * @packageDocumentation
 */

import LabSelector, { Lab } from "./components/LabSelector";
import { useState } from "react";
import DashboardCard from "@/components/ui/DashboardCard";


/**
 * Displays a dashboard interface allowing creators to build
 * a **Starpath** by selecting multiple labs.
 *
 * @remarks
 * - Uses {@link LabSelector} to provide interactive filtering and selection.
 * - Keeps selected lab IDs in React state.
 * - Summarizes all chosen labs in a separate dashboard card.
 * - Designed for a clean, modular workflow within the Creator Dashboard.
 *
 * @returns A page component that lists all labs and tracks user selections.
 *
 * @example
 * ```tsx
 * <Route path="/creator/create-starpath" element={<CreateStarpathPage />} />
 * ```
 *
 * @public
 */
export default function CreateStarpathPage() {
  const [selectedLabs, setSelectedLabs] = useState<string[]>([]);

  const existingLabs: Lab[] = [
    {
      id: "lab1",
      title: "Linux Forensics Fundamentals",
      visibility: "public",
      rating: 4.6,
      views: 320,
      createdAt: "2025-09-20",
    },
    {
      id: "lab2",
      title: "Privilege Escalation Challenge",
      visibility: "private",
      rating: 4.8,
      views: 210,
      createdAt: "2025-10-03",
    },
    {
      id: "lab3",
      title: "Network Defense Basics",
      visibility: "public",
      rating: 4.5,
      views: 480,
      createdAt: "2025-08-18",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white px-8 py-10 space-y-10">
      <h1 className="text-3xl font-bold text-sky-400">
        Create a Starpath
      </h1>

      <LabSelector
        labs={existingLabs}
        selected={selectedLabs}
        onChange={setSelectedLabs}
      />

      <DashboardCard className="p-6">
        <h2 className="text-lg font-semibold text-purple-400 mb-3">
          Selected Labs
        </h2>
        {selectedLabs.length > 0 ? (
          <ul className="text-sm text-gray-300 list-disc list-inside space-y-1">
            {selectedLabs.map((id) => {
              const lab = existingLabs.find((l) => l.id === id);
              return (
                <li key={id}>
                  {lab?.title}{" "}
                  <span className="text-gray-500 text-xs">({lab?.visibility})</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-gray-400 italic">No labs selected yet.</p>
        )}
      </DashboardCard>
    </div>
  );
}
