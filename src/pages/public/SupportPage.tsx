import Footer from "@/components/Footer";
import bgImg from "@/assets/altair-bg-presentation.png";

const supportSections = [
  {
    id: "help-center",
    title: "Help center",
    eyebrow: "Start here",
    summary: "Understand how to use Altair day to day.",
    body:
      "The help center explains the core workflows of Altair: joining the platform, entering a learner workspace, launching labs, following a starpath, and reading progress indicators. It is written for learners, instructors, and creators who need clear operational guidance rather than marketing copy.",
    details: [
      "Learner onboarding, account access, roles, and workspace basics.",
      "How labs are launched, completed, validated, and resumed.",
      "How starpath prerequisites, locked steps, milestones, and completion states work.",
      "How groups, profiles, settings, and progress data are organized inside the platform.",
    ],
  },
  {
    id: "contact",
    title: "Contact the team",
    eyebrow: "Human support",
    summary: "Reach the right channel with the right context.",
    body:
      "For support to be useful, the request should include the workspace, user role, affected page, and the expected result. Altair separates product questions, creator onboarding, institutional deployment, and platform incidents so the right person can answer quickly.",
    details: [
      "General inquiries: hello@altair.education",
      "Platform support: support@altair.education",
      "Creator onboarding: creators@altair.education",
      "Partnerships and deployments: partnerships@altair.education",
    ],
  },
  {
    id: "report",
    title: "Report an issue",
    eyebrow: "Reliability",
    summary: "Give the team enough signal to reproduce the problem.",
    body:
      "Issue reports should describe the exact behavior observed. A complete report includes the route or screen, lab or starpath name, user role, reproduction steps, expected behavior, actual behavior, browser version, and screenshots or logs when available.",
    details: [
      "Broken lab runtime, unavailable terminal, or failed environment startup.",
      "Incorrect validation, missing completion state, or inconsistent progress.",
      "Access, permission, authentication, or group membership problem.",
      "Security concerns should be sent to security@altair.education with priority context.",
    ],
  },
  {
    id: "status",
    title: "System status",
    eyebrow: "Operations",
    summary: "Know which platform areas may be affected.",
    body:
      "Altair services are organized around authentication, learner workspace, creator workspace, lab runtime, media assets, progress tracking, and analytics. A status update should identify the affected service, scope, user impact, and resolution state.",
    details: [
      "Authentication, sessions, role checks, and protected routes.",
      "Lab runtime availability, execution delays, and environment provisioning.",
      "Creator publishing workflows, asset delivery, and content updates.",
      "Progress tracking, analytics events, and learner dashboards.",
    ],
  },
  {
    id: "documentation",
    title: "Documentation",
    eyebrow: "Reference",
    summary: "A shared source of truth for learners and creators.",
    body:
      "Documentation should make the platform predictable. Learners need concepts and troubleshooting. Creators need authoring rules, quality expectations, and publishing guidance. Teams need moderation, accessibility, and operational conventions.",
    details: [
      "Learner guide: accounts, labs, starpaths, progress, groups, and troubleshooting.",
      "Creator guide: lab structure, instructions, validation, review, and publication.",
      "Quality checklist: clarity, accessibility, technical correctness, and maintainability.",
      "Operational reference: status, incident reporting, moderation, and support workflow.",
    ],
  },
];

export default function SupportPage() {
  return (
    <div
      className="min-h-screen text-white"
      style={{
        backgroundImage: `url(${bgImg})`,
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <main className="mx-auto max-w-6xl px-6 py-20 sm:px-10">
        <a href="/" className="text-sm text-slate-400 transition hover:text-white">
          Back
        </a>

        <header className="mt-12 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-300">
            Altair Support
          </p>
          <h1 className="mt-4 text-4xl font-semibold md:text-6xl">
            Support built for real learning operations.
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            This page explains where to find help, how to contact the team,
            what to include in issue reports, and how Altair organizes platform
            reliability and documentation.
          </p>
        </header>

        <nav className="mt-12 grid gap-3 md:grid-cols-5" aria-label="Support sections">
          {supportSections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="rounded-lg border border-white/10 bg-white/[0.04] p-4 transition hover:border-sky-300/40 hover:bg-white/[0.07]"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">
                {section.eyebrow}
              </span>
              <span className="mt-3 block text-sm font-semibold text-white">
                {section.title}
              </span>
              <span className="mt-2 block text-xs leading-5 text-slate-400">
                {section.summary}
              </span>
            </a>
          ))}
        </nav>

        <div className="mt-16 space-y-8">
          {supportSections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-10 rounded-lg border border-white/10 bg-white/[0.04] p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                {section.eyebrow}
              </p>
              <h2 className="mt-3 text-2xl font-semibold">{section.title}</h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
                {section.body}
              </p>
              <ul className="mt-6 grid gap-3 text-sm text-slate-400 md:grid-cols-2">
                {section.details.map((item) => (
                  <li key={item} className="rounded-md border border-white/10 bg-black/10 p-4">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
