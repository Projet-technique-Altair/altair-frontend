/**
 * @file Teacher Templates Page — predefined lab blueprints.
 *
 * @remarks
 * Displays all available lab templates that teachers can **preview** or **assign** to their classes.
 * Each template includes its difficulty level, description, and quick actions.
 *
 * Used as a foundation for course creation and lab assignment workflows.
 *
 * @packageDocumentation
 */

type Template = { id: string; name: string; level: "Beginner"|"Intermediate"|"Advanced"; description: string };

/** Static dataset of available templates (mock seed) */
const seed: Template[] = [
  { id: "t1", name: "Bash 101", level: "Beginner", description: "Shell basics, navigation, and scripts." },
  { id: "t2", name: "Files 101", level: "Beginner", description: "Permissions, users, and filesystem." },
  { id: "t3", name: "Kubernetes Intro", level: "Intermediate", description: "Pods, deployments, services." },
];


/**
 * Displays the **Teacher Templates** management page.
 *
 * @remarks
 * - Allows previewing template content.
 * - Enables assigning a lab to a class.
 * - Uses color-coded badges by difficulty level.
 *
 * @returns The teacher’s template selection grid.
 *
 * @example
 * ```tsx
 * <Route path="/teacher/templates" element={<TeacherTemplates />} />
 * ```
 *
 * @public
 */
export default function TeacherTemplates() {
  const badge = (lvl: Template["level"]) =>
    lvl === "Beginner"
      ? "rounded px-2 py-0.5 text-xs bg-green-500/20 text-green-300"
      : lvl === "Intermediate"
      ? "rounded px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-300"
      : "rounded px-2 py-0.5 text-xs bg-red-500/20 text-red-300";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
        <p className="text-slate-300 text-sm mt-1">Assign or preview lab templates.</p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {seed.map((t) => (
          <div
            key={t.id}
            className="relative rounded-2xl border border-white/10 bg-[#121628]/80 backdrop-blur p-6 shadow-[0_18px_50px_rgba(0,0,0,0.35)] hover:bg-white/[0.09] transition"
          >
            <div className="flex items-start justify-between">
              <div className="text-lg font-medium">{t.name}</div>
              <span className={badge(t.level)}>{t.level}</span>
            </div>
            <div className="text-sm text-slate-300 mt-2 line-clamp-3">{t.description}</div>

            <div className="mt-5 flex items-center gap-3">
              <button className="rounded-full bg-white/10 px-4 py-2 text-sm hover:bg-white/15">
                Preview
              </button>
              <button className="rounded-full bg-gradient-to-r from-[#2AA7FF] via-[#7A2CF3] to-[#FF8C4A] px-4 py-2 text-sm font-medium shadow-[0_6px_20px_rgba(122,44,243,0.35)]">
                Assign
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
