
/**
 * @file Teacher Students Page — class and learner management.
 *
 * @remarks
 * Displays all students belonging to the teacher’s classes, along with
 * their latest progress metrics and activity timestamps.
 *
 * Features:
 * - Search by name
 * - Filter by class
 * - Sort by progress or last seen date (ascending/descending)
 * - Direct links to each student's submission review page
 *
 * Designed for responsive layouts and modern UI using Tailwind CSS.
 *
 * @packageDocumentation
 */

import { useMemo, useState } from "react";

/**
 * Represents an individual student record.
 */
type Student = { id: string; name: string; classId: string; progress: number; lastSeen: string };

const seed: Student[] = [
  { id: "s1", name: "Alice Martin", classId: "A1", progress: 72, lastSeen: "2025-01-05" },
  { id: "s2", name: "Bilal Chen", classId: "B2", progress: 51, lastSeen: "2025-01-04" },
  { id: "s3", name: "Chloé Dubois", classId: "C3", progress: 38, lastSeen: "2025-01-02" },
];


/**
 * Displays the **Teacher’s Student Management** view.
 *
 * @remarks
 * This dashboard lets teachers browse, filter, and analyze learner progress.
 * It’s typically linked from {@link TeacherClasses}, when selecting a specific class.
 *
 * @returns The teacher’s student management table.
 *
 * @example
 * ```tsx
 * <Route path="/teacher/students" element={<TeacherStudents />} />
 * ```
 *
 * @public
 */
export default function TeacherStudents() {
  const [q, setQ] = useState("");
  const [klass, setKlass] = useState<string>("all");
  const [sort, setSort] = useState<"progress" | "lastSeen">("lastSeen");
  const [dir, setDir] = useState<"asc" | "desc">("desc");

  const classes = ["all", "A1", "B2", "C3"];

  const data = useMemo(() => {
    let rows = seed.filter((s) =>
      s.name.toLowerCase().includes(q.toLowerCase().trim())
    );
    if (klass !== "all") rows = rows.filter((s) => s.classId === klass);
    rows.sort((a, b) => {
      if (sort === "progress") return dir === "asc" ? a.progress - b.progress : b.progress - a.progress;
      // lastSeen desc by default
      return dir === "asc"
        ? a.lastSeen.localeCompare(b.lastSeen)
        : b.lastSeen.localeCompare(a.lastSeen);
    });
    return rows;
  }, [q, klass, sort, dir]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Students</h1>
          <p className="text-slate-300 text-sm mt-1">Search and review student activity.</p>
        </div>

        <div className="sm:ml-auto flex flex-wrap items-center gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name…"
            className="rounded-full bg-[#121628]/80 border border-white/10 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#2AA7FF]/50"
          />
          <select
            value={klass}
            onChange={(e) => setKlass(e.target.value)}
            className="rounded-full bg-[#121628]/80 border border-white/10 px-4 py-2.5 text-sm outline-none"
          >
            {classes.map((c) => (
              <option key={c} value={c}>{c === "all" ? "All classes" : c}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="rounded-full bg-[#121628]/80 border border-white/10 px-4 py-2.5 text-sm outline-none"
          >
            <option value="lastSeen">Sort: Last seen</option>
            <option value="progress">Sort: Progress</option>
          </select>
          <button
            onClick={() => setDir((d) => (d === "asc" ? "desc" : "asc"))}
            className="rounded-full bg-white/10 hover:bg-white/15 px-3 py-2 text-sm"
            aria-label="Toggle sort direction"
          >
            {dir === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </header>

      <div className="rounded-2xl border border-white/10 bg-[#121628]/80 backdrop-blur p-6 shadow-[0_18px_50px_rgba(0,0,0,0.35)] overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-[#121628]/90 backdrop-blur">
            <tr className="text-left text-slate-400">
              <th className="pb-2 font-normal">Name</th>
              <th className="pb-2 font-normal">Class</th>
              <th className="pb-2 font-normal">Progress</th>
              <th className="pb-2 font-normal">Last seen</th>
              <th className="pb-2 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {data.map((s) => (
              <tr key={s.id} className="hover:bg-white/5">
                <td className="py-2.5 text-slate-200">{s.name}</td>
                <td className="py-2.5 text-slate-300">{s.classId}</td>
                <td className="py-2.5 text-slate-300">{s.progress}%</td>
                <td className="py-2.5 text-slate-300">{s.lastSeen}</td>
                <td className="py-2.5 text-right">
                  <a
                    href={`/teacher/submissions?student=${s.id}`}
                    className="rounded-full bg-white/10 px-3 py-1.5 hover:bg-white/15"
                  >
                    Review
                  </a>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  No students match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
