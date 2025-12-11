/**
 * @file Teacher Submissions Page — grading and review interface.
 *
 * @remarks
 * This dashboard provides teachers with a complete view of lab submissions
 * across their classes. It supports:
 * - Search by student or lab name
 * - Filtering by submission status or class
 * - Bulk selection and actions (e.g., marking as graded)
 *
 * Each submission entry displays its student, lab, class, date,
 * grading status, and provides a direct “Review” action.
 *
 * @packageDocumentation
 */

import { useMemo, useState } from "react";

/**
 * Submission status type and single lab submission entry.
 */
type Status = "pending" | "graded";
type Submission = { id: string; student: string; lab: string; score?: number; date: string; status: Status; classId: string };

/** Static dataset for demonstration and UI preview */
const seed: Submission[] = [
  { id: "u1", student: "Alice Martin", lab: "Bash 101", date: "2025-01-05", status: "pending", classId: "A1" },
  { id: "u2", student: "Bilal Chen", lab: "Files 101", date: "2025-01-04", status: "graded", score: 92, classId: "B2" },
  { id: "u3", student: "Chloé Dubois", lab: "Kubernetes Intro", date: "2025-01-03", status: "pending", classId: "C3" },
];


/**
 * Displays the **Teacher Submission Review Dashboard**.
 *
 * @remarks
 * Teachers can view all submissions, apply filters, and perform bulk actions.
 * This page connects naturally with:
 * - {@link TeacherStudents} for per-student navigation.
 * - A future `/teacher/submissions/:id` detail view for grading.
 *
 * @returns A table-based UI for managing submissions.
 *
 * @example
 * ```tsx
 * <Route path="/teacher/submissions" element={<TeacherSubmissions />} />
 * ```
 *
 * @public
 */
export default function TeacherSubmissions() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<Status | "all">("pending"); // default pending
  const [klass, setKlass] = useState<string>("all");
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const classes = ["all", "A1", "B2", "C3"];

  const data = useMemo(() => {
    let rows = seed.filter(
      (s) =>
        s.student.toLowerCase().includes(q.toLowerCase().trim()) ||
        s.lab.toLowerCase().includes(q.toLowerCase().trim())
    );
    if (status !== "all") rows = rows.filter((s) => s.status === status);
    if (klass !== "all") rows = rows.filter((s) => s.classId === klass);
    return rows;
  }, [q, status, klass]);

  const allVisibleChecked = data.length > 0 && data.every((s) => selected[s.id]);
  const toggleAll = () => {
    const next: Record<string, boolean> = { ...selected };
    if (allVisibleChecked) {
      data.forEach((s) => delete next[s.id]);
    } else {
      data.forEach((s) => (next[s.id] = true));
    }
    setSelected(next);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Submissions</h1>
          <p className="text-slate-300 text-sm mt-1">Filter and review pending or graded submissions.</p>
        </div>

        <div className="md:ml-auto flex flex-wrap items-center gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search student or lab…"
            className="rounded-full bg-[#121628]/80 border border-white/10 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#2AA7FF]/50"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="rounded-full bg-[#121628]/80 border border-white/10 px-4 py-2.5 text-sm outline-none"
          >
            <option value="pending">Status: Pending</option>
            <option value="graded">Status: Graded</option>
            <option value="all">Status: All</option>
          </select>
          <select
            value={klass}
            onChange={(e) => setKlass(e.target.value)}
            className="rounded-full bg-[#121628]/80 border border-white/10 px-4 py-2.5 text-sm outline-none"
          >
            {classes.map((c) => (
              <option key={c} value={c}>{c === "all" ? "All classes" : c}</option>
            ))}
          </select>

          {/* Bulk action example */}
          <button
            disabled={!Object.keys(selected).length}
            className={[
              "rounded-full px-4 py-2 text-sm font-medium transition",
              Object.keys(selected).length
                ? "bg-white/10 hover:bg-white/15"
                : "bg-white/5 opacity-60 cursor-not-allowed",
            ].join(" ")}
            onClick={() => alert("Design-only: bulk mark graded")}
          >
            Mark graded
          </button>
        </div>
      </header>

      <div className="rounded-2xl border border-white/10 bg-[#121628]/80 backdrop-blur p-6 shadow-[0_18px_50px_rgba(0,0,0,0.35)] overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-[#121628]/90 backdrop-blur">
            <tr className="text-left text-slate-400">
              <th className="pb-2 font-normal w-10">
                <input type="checkbox" checked={allVisibleChecked} onChange={toggleAll} aria-label="Select all" />
              </th>
              <th className="pb-2 font-normal">Student</th>
              <th className="pb-2 font-normal">Lab</th>
              <th className="pb-2 font-normal">Class</th>
              <th className="pb-2 font-normal">Date</th>
              <th className="pb-2 font-normal">Status</th>
              <th className="pb-2 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {data.map((s) => (
              <tr key={s.id} className="hover:bg-white/5">
                <td className="py-2.5">
                  <input
                    type="checkbox"
                    checked={!!selected[s.id]}
                    onChange={() =>
                      setSelected((prev) => ({ ...prev, [s.id]: !prev[s.id] }))
                    }
                    aria-label={`Select ${s.student}`}
                  />
                </td>
                <td className="py-2.5 text-slate-200">{s.student}</td>
                <td className="py-2.5 text-slate-300">{s.lab}</td>
                <td className="py-2.5 text-slate-300">{s.classId}</td>
                <td className="py-2.5 text-slate-300">{s.date}</td>
                <td className="py-2.5">
                  {s.status === "graded" ? (
                    <span className="rounded px-2 py-0.5 text-xs bg-green-500/20 text-green-300">
                      graded {s.score}
                    </span>
                  ) : (
                    <span className="rounded px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-300">
                      pending
                    </span>
                  )}
                </td>
                <td className="py-2.5 text-right">
                  <button className="rounded-full bg-white/10 px-3 py-1.5 hover:bg-white/15 text-xs">
                    Review
                  </button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No submissions match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
