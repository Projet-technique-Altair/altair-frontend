// src/pages/admin/AdminDashboard.tsx

/**
 * @file Admin Dashboard — Lab Template Management Only
 *
 * This admin interface now displays ONLY the list of lab templates.
 * All mock stats, charts, and logs have been removed.
 */

import { useEffect, useState } from "react";
import DashboardCard from "@/components/ui/DashboardCard";
import { api } from "@/api";

type AdminTemplate = {
  id: string;
  name: string;
  description: string;
  stepsCount: number;
  updatedAt: string;
};

function normalizeTemplate(raw: {
  lab_id?: string;
  id?: string;
  template_id?: string;
  name?: string;
  description?: string | null;
  steps_count?: number | null;
  updated_at?: string | null;
  updatedAt?: string | null;
}): AdminTemplate {
  return {
    id: raw.lab_id ?? raw.id ?? raw.template_id ?? "unknown",
    name: raw.name ?? "Untitled Template",
    description: raw.description ?? "No description",
    stepsCount: raw.steps_count ?? 0,
    updatedAt: raw.updated_at ?? raw.updatedAt ?? "Unknown",
  };
}

export default function AdminDashboard() {
  const [templates, setTemplates] = useState<AdminTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les templates depuis le gateway
  useEffect(() => {
    let cancelled = false;

    async function loadTemplates() {
      try {
        const raw = await api.getLabs();
        if (!cancelled) {
          const normalized = raw.map(normalizeTemplate);
          console.log("🔥 LAB TEMPLATES =", normalized);
          setTemplates(normalized);
        }
      } catch (err) {
        console.error("❌ Failed to load lab templates:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadTemplates();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDelete = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    // Plus tard → api.deleteLabTemplate(id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0D16] text-white flex items-center justify-center">
        <p className="text-gray-400 animate-pulse">Loading lab templates...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0D16] text-white px-10 py-10 space-y-10">

      {/* HEADER */}
      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
        Lab Template Management
      </h1>

      {/* TEMPLATE LIST */}
      <DashboardCard className="p-6">
        <h2 className="text-lg font-semibold text-purple-400 mb-4">
          Available Lab Templates ({templates.length})
        </h2>

        {templates.length === 0 ? (
          <p className="text-gray-400 italic text-sm">No lab templates found.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-gray-400 border-b border-white/10">
              <tr>
                <th className="py-2">Name</th>
                <th className="py-2">Steps</th>
                <th className="py-2">Updated</th>
                <th className="py-2 text-right pr-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {templates.map((t) => (
                <tr key={t.id} className="border-b border-white/5">
                  <td className="py-3 text-white">{t.name}</td>
                  <td className="py-3 text-gray-300">{t.stepsCount}</td>
                  <td className="py-3 text-gray-300">{t.updatedAt}</td>
                  <td className="py-3 flex justify-end gap-3 pr-4">
                    <button
                      className="px-3 py-1 text-xs rounded bg-purple-600 hover:bg-purple-500 transition"
                      onClick={() => alert("Edit coming soon")}
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1 text-xs rounded bg-red-600 hover:bg-red-500 transition"
                      onClick={() => handleDelete(t.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DashboardCard>
    </div>
  );
}
