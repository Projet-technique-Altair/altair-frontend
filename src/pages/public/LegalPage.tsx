import Footer from "@/components/Footer";
import bgImg from "@/assets/altair-bg-presentation.png";

const legalSections = [
  {
    id: "terms",
    title: "Terms of service",
    summary: "Rules for accessing and using Altair responsibly.",
    body: [
      "Altair is an educational platform that provides access to learning content, interactive labs, creator tools, progress tracking, and related services. By using Altair, users agree to use the platform only for lawful, authorized, educational, and professional purposes.",
      "Users are responsible for the activity performed through their account. They must keep access credentials confidential, respect role-based permissions, and avoid actions that could compromise the security, availability, or integrity of the platform.",
      "Interactive labs may simulate technical environments or provide controlled execution spaces. Users must not attempt to escape lab boundaries, attack infrastructure, access data they are not authorized to view, disrupt service availability, or use Altair resources for unrelated activity.",
      "Altair may update, suspend, restrict, or remove access to features when required for security, maintenance, compliance, abuse prevention, or product evolution. When reasonably possible, material changes should be communicated clearly to affected users or organizations.",
    ],
    points: [
      "Authorized educational and professional use only.",
      "No bypassing access controls, abusing lab infrastructure, or disrupting service.",
      "Accounts, roles, groups, and creator permissions must be respected.",
    ],
  },
  {
    id: "privacy",
    title: "Privacy policy",
    summary: "How Altair handles account, learning, and operational data.",
    body: [
      "Altair collects and processes information needed to authenticate users, provide the learning experience, manage groups, operate labs, track progress, support creators, prevent abuse, and improve platform reliability.",
      "Account information may include identity data, role, organization or group membership, profile settings, and authentication metadata. Learning information may include lab attempts, starpath progress, completion state, validation results, timestamps, and usage events.",
      "Operational data may include technical logs, browser or device metadata, API errors, runtime status, and security events. This information is used to troubleshoot incidents, maintain service quality, investigate abuse, and protect the platform.",
      "Altair should avoid collecting unnecessary personal data and should limit access to data based on operational need. Where an organization manages learner access, some learning and progress data may be visible to authorized instructors, creators, administrators, or support staff.",
    ],
    points: [
      "Data is used to deliver learning, support users, and secure the platform.",
      "Progress and analytics may be visible to authorized roles.",
      "Operational logs support reliability, debugging, and abuse prevention.",
    ],
  },
  {
    id: "cookies",
    title: "Cookie preferences",
    summary: "Storage used for sessions, preferences, and security.",
    body: [
      "Altair may use cookies, local storage, or equivalent browser storage to keep users signed in, complete authentication flows, preserve interface preferences, protect sessions, and maintain expected platform behavior.",
      "Essential storage is required for login, session continuity, role handling, protected routes, and security checks. Disabling essential storage may prevent the platform from working correctly.",
      "Preference storage may remember non-essential interface choices such as theme, navigation state, or workspace settings. Altair public pages should avoid unnecessary tracking and should prioritize functional storage over advertising or invasive analytics.",
      "Where cookie controls are introduced, users should be able to understand which storage is essential and which storage is optional. Changes to cookie practices should be reflected in this page.",
    ],
    points: [
      "Essential storage is required for authentication and security.",
      "Preference storage improves usability but should stay limited.",
      "Public landing pages should avoid unnecessary tracking.",
    ],
  },
  {
    id: "conduct",
    title: "Code of conduct",
    summary: "Expected behavior across learning and creator spaces.",
    body: [
      "Altair should remain a professional, inclusive, and focused learning environment. Users, creators, instructors, administrators, and support staff are expected to communicate respectfully and act in good faith.",
      "Users must not publish or share abusive, discriminatory, harassing, misleading, illegal, or harmful content. Creator content should be accurate, properly scoped, and suitable for the intended learning audience.",
      "Security-oriented or technical content must be framed responsibly. Labs and instructions should not encourage unauthorized access, real-world harm, credential theft, service disruption, or misuse outside approved environments.",
      "Altair may moderate content, restrict accounts, remove material, or escalate reports when conduct threatens user safety, platform integrity, legal compliance, or the quality of the learning environment.",
    ],
    points: [
      "Respectful collaboration is required across groups and creator spaces.",
      "Unsafe, abusive, illegal, or misleading content is not acceptable.",
      "Technical learning must stay inside authorized environments.",
    ],
  },
  {
    id: "accessibility",
    title: "Accessibility",
    summary: "Commitments for readable and usable learning workflows.",
    body: [
      "Altair aims to make core workflows understandable, navigable, and readable for as many users as possible. Accessibility is treated as part of product quality, especially for learning instructions, progress states, navigation, forms, and validation feedback.",
      "Interfaces should preserve visible focus states, adequate contrast, clear hierarchy, keyboard-friendly navigation, and text that remains readable across supported screen sizes. Important information should not rely on color alone.",
      "Interactive labs can include technical constraints, but surrounding platform controls and instructions should remain as accessible as reasonably possible. When a lab requires specific tooling, the requirement should be stated clearly before launch.",
      "Accessibility feedback can be sent to accessibility@altair.education with the affected page, browser, assistive technology if relevant, and a short description of the barrier encountered.",
    ],
    points: [
      "Core navigation, instructions, and feedback should remain readable and operable.",
      "Important states should not rely on color alone.",
      "Accessibility issues should be documented and routed for review.",
    ],
  },
];

export default function LegalPage() {
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

        <header className="mt-12 max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-violet-300">
            Legal center
          </p>
          <h1 className="mt-4 text-4xl font-semibold md:text-6xl">
            Terms, privacy, conduct, and platform responsibilities.
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            This legal center gives Altair a serious public baseline for user
            responsibilities, data handling, cookies, conduct, accessibility,
            and platform operations. It is written to be clear and professional;
            final legal validation should still be performed by qualified counsel
            before production use.
          </p>
        </header>

        <nav className="mt-12 grid gap-3 md:grid-cols-5" aria-label="Legal sections">
          {legalSections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="rounded-lg border border-white/10 bg-white/[0.04] p-4 transition hover:border-violet-300/40 hover:bg-white/[0.07]"
            >
              <span className="block text-sm font-semibold text-white">
                {section.title}
              </span>
              <span className="mt-2 block text-xs leading-5 text-slate-400">
                {section.summary}
              </span>
            </a>
          ))}
        </nav>

        <div className="mt-16 space-y-8">
          {legalSections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-10 rounded-lg border border-white/10 bg-white/[0.04] p-6"
            >
              <h2 className="text-2xl font-semibold">{section.title}</h2>
              <div className="mt-5 space-y-4 text-sm leading-7 text-slate-300">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <ul className="mt-6 grid gap-3 text-sm text-slate-400 md:grid-cols-3">
                {section.points.map((point) => (
                  <li key={point} className="rounded-md border border-white/10 bg-black/10 p-4">
                    {point}
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
