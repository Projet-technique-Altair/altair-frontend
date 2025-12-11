/**
 * @file Teacher Classes Page — overview of instructor groups.
 *
 * @remarks
 * Displays a dashboard-style list of the teacher’s managed classes.
 * Each card summarizes:
 * - The class name and identifier.
 * - The number of enrolled students.
 * - The number of currently active labs.
 *
 * Each class card links to its detailed student list and submission view.
 * This component serves as the entry point for the **teacher portal**.
 *
 * @packageDocumentation
 */


type Klass = { id: string; name: string; students: number; activeLabs: number };

const classesSeed: Klass[] = [
  { id: "A1", name: "1A DevOps", students: 24, activeLabs: 2 },
  { id: "B2", name: "2B Cloud", students: 26, activeLabs: 3 },
  { id: "C3", name: "3C SRE", students: 22, activeLabs: 1 },
];


/**
 * Lists all classes belonging to the current teacher.
 *
 * @remarks
 * - Cards are clickable and route to `/teacher/students?class=<id>`.
 * - Uses gradient accent and subtle shadows for visual hierarchy.
 * - Designed to be responsive (1–3 columns depending on viewport).
 *
 * @returns A grid of class cards with key class information.
 *
 * @example
 * ```tsx
 * <Route path="/teacher/classes" element={<TeacherClasses />} />
 * ```
 *
 * @public
 */
export default function TeacherClasses() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Classes</h1>
        <p className="text-slate-300 text-sm mt-1">Overview of your groups and their activity.</p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {classesSeed.map((c) => (
          <a
            key={c.id}
            href={`/teacher/students?class=${encodeURIComponent(c.id)}`}
            className="group rounded-2xl border border-white/10 bg-[#121628]/80 backdrop-blur p-6 shadow-[0_18px_50px_rgba(0,0,0,0.35)] transition hover:bg-white/[0.08]"
          >
            <div className="flex items-start justify-between">
              <div className="text-lg font-medium">{c.name}</div>
              <span className="text-xs rounded px-2 py-0.5 bg-white/10 text-slate-200">ID: {c.id}</span>
            </div>
            <div className="mt-2 text-sm text-slate-300">{c.students} students</div>
            <div className="text-sm text-slate-300">{c.activeLabs} active labs</div>

            <div className="mt-5 flex justify-end">
              <span className="rounded-full bg-gradient-to-r from-[#2AA7FF] via-[#7A2CF3] to-[#FF8C4A] px-4 py-2 text-sm font-medium shadow-[0_6px_20px_rgba(122,44,243,0.35)]">
                Open submissions
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
